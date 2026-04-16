import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2, Sparkles, Check, AlertCircle } from 'lucide-react';
import type { CanvasComponent, Connection, Project } from '../types';
import { getStoredApiKey } from '../lib/aiArchitectureGenerator';

interface ChatBotProps {
  onClose: () => void;
  components: CanvasComponent[];
  connections: Connection[];
  onUpdateArchitecture: (components: CanvasComponent[], connections: Connection[]) => void;
  currentProject: Project;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  hasArchitectureChanges?: boolean;
  proposedComponents?: CanvasComponent[];
  proposedConnections?: Connection[];
}

export default function ChatBot({ onClose, components, connections, onUpdateArchitecture, currentProject }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hi! I am your AI Architecture Assistant. Tell me how you want to modify your system architecture, and I will generate the changes for you.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const callLLM = async (prompt: string, apiKey: string) => {
    const systemPrompt = `You are an expert AI software architecture assistant. The user wants to modify their current software architecture.
Current components: ${JSON.stringify(components)}
Current connections: ${JSON.stringify(connections)}

Based on the user prompt: "${prompt}", return a JSON object containing the updated architecture with "components" and "connections" arrays. Keep existing ones unless asked to remove. Ensure newly added components have an "id", "techId" (e.g., 'react', 'express', 'postgresql', 'redis'), "type" (same as techId), "position" ({x, y} around 100-600 to not overlap), "size" ({width: 200, height: 140}), and "properties" ({name, description}).
Respond with ONLY valid JSON and no markdown formatting or other text. Example: {"components": [...], "connections": [...]}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt }
        ],
        temperature: 0.2
      })
    });
    
    if (!response.ok) throw new Error('API error or invalid token');
    const data = await response.json();
    let content = data.choices[0].message.content;
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(content);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = getStoredApiKey(currentProject.aiModel ?? 'openai');
      
      if (!apiKey && currentProject.aiModel !== 'local') {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Please configure your AI API key in the project settings or use a local model.'
        }]);
        setIsLoading(false);
        return;
      }

      let aiResponseContent = "I've updated your architecture based on your request.";
      let newComponents = [...components];
      let newConnections = [...connections];

      try {
        // Attempt actual API call if openai
        if ((currentProject.aiModel ?? 'openai') === 'openai' && apiKey) {
          const result = await callLLM(userMessage.content, apiKey);
          if (result.components && result.connections) {
            newComponents = result.components;
            newConnections = result.connections;
          }
        } else {
          // Simple mock fallback if not configured for OpenAI or local model used without backend
          aiResponseContent = "Note: Real-time modifications require OpenAI configured. Showing mock changes.";
          const newId = `service-${Date.now()}`;
          newComponents.push({
            id: newId,
            type: 'nodejs',
            techId: 'node',
            position: { x: 300, y: 300 },
            size: { width: 200, height: 140 },
            properties: { name: 'New Service', description: 'AI added service' }
          });
        }
      } catch (e) {
        console.error(e);
        aiResponseContent = "I attempted to modify your architecture, but an error occurred during generation. Showing fallback mock changes.";
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponseContent,
        hasArchitectureChanges: true,
        proposedComponents: newComponents,
        proposedConnections: newConnections
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute bottom-20 right-4 w-96 max-h-[600px] h-[65vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-semibold">AI Assistant</h3>
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start space-x-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`rounded-2xl px-4 py-2 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                
                {msg.hasArchitectureChanges && msg.proposedComponents && msg.proposedConnections && (
                  <button 
                    onClick={() => {
                      onUpdateArchitecture(msg.proposedComponents!, msg.proposedConnections!);
                      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Architecture applied successfully!' }]);
                    }}
                    className="mt-3 flex items-center space-x-1 text-xs font-medium bg-white text-purple-600 px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all"
                  >
                    <Check className="w-3 h-3" />
                    <span>Apply Architecture</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3 flex items-center space-x-2">
                <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center space-x-2 relative"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI to modify architecture..."
            className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 pr-12"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}