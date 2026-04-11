import type { CanvasComponent, Connection, Project } from '../types';
import { techCategories, getTechById } from '../data/techStack';

// ── Tech catalogue sent to the AI ─────────────────────────────────────────────
const TECH_LIST = Object.entries(techCategories)
  .flatMap(([category, cat]) =>
    cat.items.map(item => `- ${item.id} (${item.name}, ${category}): ${item.description}`)
  )
  .join('\n');

// ── Prompt ────────────────────────────────────────────────────────────────────
function buildPrompt(project: Project): string {
  return `You are a software architect. Design a practical system architecture for the project below using ONLY technologies from the provided list.

Project Name: ${project.name}
Project Description: ${project.description}

Available Technologies (you MUST use only these exact IDs):
${TECH_LIST}

Return ONLY a valid JSON object with no markdown, no prose, just JSON:
{
  "components": [
    {
      "techId": "<exact id from the list above>",
      "label": "<short descriptive name>",
      "description": "<one sentence role in this architecture>"
    }
  ],
  "connections": [
    {
      "sourceIndex": <0-based index into components array>,
      "targetIndex": <0-based index into components array>,
      "type": "api" | "database" | "cache" | "queue" | "cdn" | "default"
    }
  ]
}

Rules:
- Pick 4 to 8 components that are realistic for the project
- Only use techIds exactly as listed
- Connections must reflect realistic data flow (e.g. frontend → backend → database)
- Do not connect a component to itself
- Ensure sourceIndex and targetIndex are valid indices (0 to components.length-1)`;
}

// ── Layout: group by category, arrange in rows ────────────────────────────────
const CATEGORY_ROW_ORDER = [
  'frontend', 'backend', 'database', 'caching', 'messaging', 'cloud', 'additional',
];
const COMP_W = 200;
const COMP_H = 140;
const H_GAP = 100;
const V_GAP = 120;
const CANVAS_W = 1200;

function computePositions(components: Array<{ techId: string }>): Array<{ x: number; y: number }> {
  // Map each component to its category
  const getCategory = (techId: string) =>
    Object.entries(techCategories).find(([, v]) => v.items.some(i => i.id === techId))?.[0] ?? 'additional';

  const groups: Record<string, number[]> = {};
  components.forEach((c, i) => {
    const cat = getCategory(c.techId);
    (groups[cat] ??= []).push(i);
  });

  const positions: Array<{ x: number; y: number }> = new Array(components.length);
  let currentY = 80;

  CATEGORY_ROW_ORDER.forEach(cat => {
    const indices = groups[cat];
    if (!indices?.length) return;
    const rowWidth = indices.length * COMP_W + (indices.length - 1) * H_GAP;
    const startX = Math.max(80, (CANVAS_W - rowWidth) / 2);
    indices.forEach((idx, i) => {
      positions[idx] = { x: startX + i * (COMP_W + H_GAP), y: currentY };
    });
    currentY += COMP_H + V_GAP;
  });

  return positions;
}

// ── AI response shape ─────────────────────────────────────────────────────────
interface AIResponse {
  components: Array<{ techId: string; label: string; description: string }>;
  connections: Array<{ sourceIndex: number; targetIndex: number; type: string }>;
}

function parseJSON(text: string): AIResponse {
  // Strip any markdown code fences the model might add
  const clean = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const match = clean.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON object found in AI response');
  return JSON.parse(match[0]);
}

// ── Provider call helpers ─────────────────────────────────────────────────────
async function callOpenAI(prompt: string, apiKey: string): Promise<AIResponse> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`OpenAI error: ${(err as any).error?.message ?? res.statusText}`);
  }
  const data = await res.json();
  return parseJSON(data.choices[0].message.content);
}

async function callAnthropic(prompt: string, apiKey: string): Promise<AIResponse> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Anthropic error: ${(err as any).error?.message ?? res.statusText}`);
  }
  const data = await res.json();
  return parseJSON(data.content[0].text);
}

async function callGemini(prompt: string, apiKey: string): Promise<AIResponse> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Gemini error: ${(err as any).error?.message ?? res.statusText}`);
  }
  const data = await res.json();
  return parseJSON(data.candidates[0].content.parts[0].text);
}

// ── LocalStorage key helpers ──────────────────────────────────────────────────
export function getApiKeyStorageKey(model: string): string {
  return `aiApiKey_${model}`;
}

export function getStoredApiKey(model: string): string {
  return localStorage.getItem(getApiKeyStorageKey(model)) ?? '';
}

export function saveApiKey(model: string, key: string): void {
  localStorage.setItem(getApiKeyStorageKey(model), key);
}

// ── Public entry point ────────────────────────────────────────────────────────
export async function generateArchitecture(
  project: Project,
  apiKey: string,
): Promise<{ components: CanvasComponent[]; connections: Connection[] }> {
  const prompt = buildPrompt(project);
  const model = project.aiModel ?? 'openai';

  let aiResponse: AIResponse;
  if (model === 'openai') {
    aiResponse = await callOpenAI(prompt, apiKey);
  } else if (model === 'anthropic') {
    aiResponse = await callAnthropic(prompt, apiKey);
  } else if (model === 'gemini') {
    aiResponse = await callGemini(prompt, apiKey);
  } else {
    throw new Error(`Unknown AI model: ${model}`);
  }

  // Filter out any component with an unknown techId
  const validAiComponents = aiResponse.components.filter(c => getTechById(c.techId));
  if (validAiComponents.length === 0) {
    throw new Error('AI returned no recognisable technology components');
  }

  const positions = computePositions(validAiComponents);

  const components: CanvasComponent[] = validAiComponents.map((c, i) => {
    const tech = getTechById(c.techId)!;
    return {
      id: `${c.techId}-${Date.now()}-${i}`,
      type: c.techId,
      techId: c.techId,
      position: positions[i],
      size: { width: COMP_W, height: COMP_H },
      properties: {
        name: c.label || tech.name,
        description: c.description || tech.description,
        color: tech.color,
      },
      label: c.label || tech.name,
      description: c.description,
    };
  });

  const connections: Connection[] = aiResponse.connections
    .filter(c =>
      typeof c.sourceIndex === 'number' &&
      typeof c.targetIndex === 'number' &&
      c.sourceIndex !== c.targetIndex &&
      c.sourceIndex >= 0 && c.sourceIndex < components.length &&
      c.targetIndex >= 0 && c.targetIndex < components.length,
    )
    .map((c, i) => ({
      id: `conn-ai-${Date.now()}-${i}`,
      source: components[c.sourceIndex].id,
      target: components[c.targetIndex].id,
      type: c.type || 'default',
    }));

  return { components, connections };
}
