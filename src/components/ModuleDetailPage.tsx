import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  ArrowLeft,
  Settings,
  Package,
  Terminal,
  Layers,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Info,
  Shield,
  AlertCircle,
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  RotateCcw as RevertIcon,
  GitBranch,
  GitCommit,
  Upload,
  Play,
  CheckCircle,
  XCircle,
  Loader2,
  Key,
  RefreshCw,
  ChevronUp,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { getTechById, getCategoryByTechId } from '../data/techStack';
import {
  generateModuleFiles,
  flattenTree,
  getLanguageFromPath,
  type TreeNode,
} from '../lib/moduleFileGenerator';
import type { CanvasComponent, Connection, User, Project } from '../types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface EnvVar { key: string; value: string; isSecret: boolean }
type TerminalLine = { text: string; type: 'input' | 'output' | 'error' | 'success' | 'info' };

type NavTab = 'overview' | 'configuration' | 'environment' | 'dependencies' | 'advanced' | 'files' | 'git';

const NAV_ITEMS: { id: NavTab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',      label: 'Overview',      icon: <Info className="w-4 h-4" /> },
  { id: 'configuration', label: 'Configuration', icon: <Settings className="w-4 h-4" /> },
  { id: 'environment',   label: 'Environment',   icon: <Terminal className="w-4 h-4" /> },
  { id: 'dependencies',  label: 'Dependencies',  icon: <Package className="w-4 h-4" /> },
  { id: 'advanced',      label: 'Advanced',      icon: <Layers className="w-4 h-4" /> },
  { id: 'files',         label: 'Files',         icon: <FileCode className="w-4 h-4" /> },
  { id: 'git',           label: 'Git',           icon: <GitBranch className="w-4 h-4" /> },
];

const SWATCH_COLORS = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#06B6D4','#F97316','#EC4899'];

// ── File-tree icon helper ─────────────────────────────────────────────────────

function fileIconColor(name: string): string {
  const ext = (name.includes('.') ? name.split('.').pop()! : '').toLowerCase();
  if (name === 'Dockerfile' || name.startsWith('Dockerfile.')) return 'text-blue-300';
  const map: Record<string, string> = {
    ts: 'text-blue-400',   tsx: 'text-blue-400',
    js: 'text-yellow-400', jsx: 'text-cyan-400',  mjs: 'text-yellow-400',
    json: 'text-amber-400',
    html: 'text-orange-400', htm: 'text-orange-400',
    css: 'text-pink-400', scss: 'text-pink-400', less: 'text-pink-400',
    py: 'text-green-400',
    java: 'text-red-400', kt: 'text-purple-400',
    xml: 'text-orange-300', pom: 'text-orange-300',
    md: 'text-gray-400', mdx: 'text-gray-400',
    sql: 'text-cyan-400',
    yaml: 'text-amber-300', yml: 'text-amber-300',
    sh: 'text-green-300', bash: 'text-green-300',
    go: 'text-cyan-500',
    rb: 'text-red-400',
    php: 'text-purple-400',
    rs: 'text-orange-500',
    vue: 'text-emerald-400',
    svelte: 'text-orange-400',
    graphql: 'text-pink-500', gql: 'text-pink-500',
    toml: 'text-gray-400', ini: 'text-gray-400', properties: 'text-gray-400',
    gitignore: 'text-gray-500', dockerignore: 'text-gray-500',
    env: 'text-amber-500',
  };
  return map[ext] || 'text-gray-400';
}

// ── Tree item component ───────────────────────────────────────────────────────

interface TreeItemProps {
  node: TreeNode;
  depth: number;
  selectedPath: string | null;
  expandedFolders: Set<string>;
  editedPaths: Set<string>;
  onFileSelect: (path: string) => void;
  onToggleFolder: (path: string) => void;
}

function TreeItem({
  node, depth, selectedPath, expandedFolders, editedPaths, onFileSelect, onToggleFolder,
}: TreeItemProps) {
  const isExpanded = expandedFolders.has(node.path);
  const isSelected = selectedPath === node.path;
  const isModified = node.kind === 'file' && editedPaths.has(node.path);

  return (
    <div>
      <div
        style={{ paddingLeft: `${depth * 14 + 6}px` }}
        onClick={() => node.kind === 'folder' ? onToggleFolder(node.path) : onFileSelect(node.path)}
        className={`flex items-center gap-1.5 py-0.5 pr-2 cursor-pointer rounded-sm select-none text-[13px] leading-6
          ${isSelected
            ? 'bg-blue-500/25 text-white'
            : 'text-gray-300 hover:bg-white/5 hover:text-gray-100'
          }`}
      >
        {node.kind === 'folder' ? (
          <>
            {isExpanded
              ? <ChevronDown className="w-3 h-3 text-gray-500 flex-shrink-0" />
              : <ChevronRight className="w-3 h-3 text-gray-500 flex-shrink-0" />}
            {isExpanded
              ? <FolderOpen className="w-3.5 h-3.5 text-yellow-400/80 flex-shrink-0" />
              : <Folder className="w-3.5 h-3.5 text-yellow-400/70 flex-shrink-0" />}
          </>
        ) : (
          <>
            <span className="w-3 h-3 flex-shrink-0" />
            <FileText className={`w-3.5 h-3.5 flex-shrink-0 ${fileIconColor(node.name)}`} />
          </>
        )}
        <span className={`truncate flex-1 min-w-0 ${isModified ? 'text-amber-300' : ''}`}>
          {node.name}
        </span>
        {isModified && (
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 mr-1" title="Modified" />
        )}
      </div>
      {node.kind === 'folder' && isExpanded && node.children.map(child => (
        <TreeItem
          key={child.path}
          node={child}
          depth={depth + 1}
          selectedPath={selectedPath}
          expandedFolders={expandedFolders}
          editedPaths={editedPaths}
          onFileSelect={onFileSelect}
          onToggleFolder={onToggleFolder}
        />
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

interface ModuleDetailPageProps {
  user: User | null;
  currentProject: Project | null;
  setCurrentProject: React.Dispatch<React.SetStateAction<Project | null>>;
  onLogout: () => void;
}

export default function ModuleDetailPage({ currentProject, setCurrentProject }: ModuleDetailPageProps) {
  const navigate = useNavigate();
  const { projectId, componentId } = useParams<{ projectId: string; componentId: string }>();

  // ── Project / component state ─────────────────────────────────────────────
  const [component, setComponent] = useState<CanvasComponent | null>(null);
  const [allComponents, setAllComponents] = useState<CanvasComponent[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [projectName, setProjectName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<NavTab>('overview');

  // ── Module property state ─────────────────────────────────────────────────
  const [localProps, setLocalProps] = useState<Record<string, any>>({});
  const [envVars, setEnvVars] = useState<EnvVar[]>([]);
  const [port, setPort] = useState('');
  const [version, setVersion] = useState('');
  const [notes, setNotes] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // ── Files / editor state ──────────────────────────────────────────────────
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [editedContents, setEditedContents] = useState<Record<string, string>>({});

  // ── Terminal state ────────────────────────────────────────────────────────
  const [termLines, setTermLines] = useState<TerminalLine[]>([
    { text: 'Terminal ready. Type "help" for available commands.', type: 'info' },
  ]);
  const [termInput, setTermInput] = useState('');
  const [termHistory, setTermHistory] = useState<string[]>([]);
  const [termHistIdx, setTermHistIdx] = useState(-1);
  const [showTerminal, setShowTerminal] = useState(false);
  const termEndRef = useRef<HTMLDivElement>(null);
  const termInputRef = useRef<HTMLInputElement>(null);

  // ── Git state ─────────────────────────────────────────────────────────────
  const [gitToken, setGitToken] = useState(localStorage.getItem('githubToken') || '');
  const [repoUrl, setRepoUrl] = useState('');
  const [currentBranch, setCurrentBranch] = useState('main');
  const [branches, setBranches] = useState<string[]>([]);
  const [newBranchName, setNewBranchName] = useState('');
  const [commitMsg, setCommitMsg] = useState('Update module files');
  const [gitLoading, setGitLoading] = useState<string | null>(null);
  const [gitPushStatus, setGitPushStatus] = useState<'idle' | 'pushing' | 'success' | 'error'>('idle');
  const [gitPushMsg, setGitPushMsg] = useState('');
  const [workflows, setWorkflows] = useState<{ id: number; name: string; path: string }[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<number | null>(null);
  const [deployStatus, setDeployStatus] = useState<'idle' | 'triggering' | 'success' | 'error'>('idle');
  const [deployMsg, setDeployMsg] = useState('');
  const [showCreateBranch, setShowCreateBranch] = useState(false);

  // ── Load component from project ───────────────────────────────────────────
  useEffect(() => {
    let project: Project | null = null;
    if (currentProject && currentProject.id.toString() === projectId) {
      project = currentProject;
    } else {
      try {
        const saved = localStorage.getItem('userProjects');
        if (saved) {
          const projects = JSON.parse(saved) as Project[];
          project = projects.find(p => p.id.toString() === projectId) || null;
        }
      } catch { /* ignore */ }
    }

    if (project) {
      setProjectName(project.name);
      if (project.repository) setRepoUrl(project.repository);
      const comps: CanvasComponent[] = project.canvasState?.components || [];
      const conns: Connection[] = project.canvasState?.connections || [];
      setAllComponents(comps);
      setConnections(conns);

      const comp = comps.find(c => c.id === componentId) || null;
      if (comp) {
        setComponent(comp);
        setLocalProps({ ...comp.properties });
        setEnvVars(comp.properties?.envVars || []);
        setPort(comp.properties?.port || '');
        setVersion(comp.properties?.version || '');
        setNotes(comp.properties?.notes || '');
        setEditedContents(comp.properties?.moduleFiles || {});
      }
    }
  }, [projectId, componentId, currentProject]);

  // ── File tree (memoised, re-generated only when tech/name changes) ─────────
  const fileTree = useMemo(() => {
    if (!component) return null;
    return generateModuleFiles(
      component.techId,
      component.properties?.name || component.techId,
      component.properties || {},
    );
  }, [component?.techId, component?.properties?.name, component?.properties?.description]);

  // Flat file map for quick lookup
  const fileMap = useMemo(() => {
    if (!fileTree) return new Map();
    return flattenTree(fileTree);
  }, [fileTree]);

  // Auto-scroll terminal to bottom on new lines
  useEffect(() => {
    termEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [termLines]);

  // Auto-expand root + common top-level folders when tree changes
  useEffect(() => {
    if (!fileTree) return;
    const init = new Set<string>([fileTree.path]);
    for (const child of fileTree.children) {
      if (child.kind === 'folder' && ['src', 'app', 'lib', 'k8s', '.github'].includes(child.name)) {
        init.add(child.path);
      }
    }
    setExpandedFolders(init);
    setSelectedFilePath(null);
  }, [fileTree?.path]);

  // ── Derived file state ────────────────────────────────────────────────────
  const currentFileContent = useMemo(() => {
    if (!selectedFilePath) return '';
    if (editedContents[selectedFilePath] !== undefined) return editedContents[selectedFilePath];
    return fileMap.get(selectedFilePath)?.content || '';
  }, [selectedFilePath, editedContents, fileMap]);

  const currentFileLang = useMemo(() => {
    if (!selectedFilePath) return 'plaintext';
    return fileMap.get(selectedFilePath)?.language || getLanguageFromPath(selectedFilePath);
  }, [selectedFilePath, fileMap]);

  const editedPaths = useMemo(() => new Set(Object.keys(editedContents)), [editedContents]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const markDirty = () => setIsDirty(true);

  const handlePropChange = (key: string, value: any) => {
    setLocalProps(prev => ({ ...prev, [key]: value }));
    markDirty();
  };

  const handleFileChange = (value: string | undefined) => {
    if (!selectedFilePath) return;
    setEditedContents(prev => ({ ...prev, [selectedFilePath]: value ?? '' }));
    markDirty();
  };

  const handleRevertFile = () => {
    if (!selectedFilePath) return;
    setEditedContents(prev => {
      const next = { ...prev };
      delete next[selectedFilePath];
      return next;
    });
    markDirty();
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path); else next.add(path);
      return next;
    });
  };

  // ── Git helpers ───────────────────────────────────────────────────────────
  const parseGitHubRepo = (url: string): { owner: string; repo: string } | null => {
    const m = url.match(/github\.com[/:]([^/]+)\/([^/.]+?)(?:\.git)?(?:\/|$)/);
    return m ? { owner: m[1], repo: m[2] } : null;
  };

  const ghHeaders = () => ({
    Authorization: `token ${gitToken}`,
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github.v3+json',
  });

  const loadBranches = async () => {
    const parsed = parseGitHubRepo(repoUrl);
    if (!parsed || !gitToken) return;
    setGitLoading('Loading branches…');
    try {
      const res = await fetch(
        `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/branches`,
        { headers: ghHeaders() }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: any[] = await res.json();
      setBranches(data.map(b => b.name));
    } catch (e: any) {
      setGitPushMsg(`Failed to load branches: ${e.message}`);
    } finally {
      setGitLoading(null);
    }
  };

  const createBranchAPI = async () => {
    const parsed = parseGitHubRepo(repoUrl);
    if (!parsed || !gitToken || !newBranchName.trim()) return;
    setGitLoading('Creating branch…');
    try {
      const refRes = await fetch(
        `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/git/ref/heads/${currentBranch}`,
        { headers: ghHeaders() }
      );
      if (!refRes.ok) throw new Error(`HTTP ${refRes.status}`);
      const sha = (await refRes.json()).object.sha;
      const createRes = await fetch(
        `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/git/refs`,
        { method: 'POST', headers: ghHeaders(), body: JSON.stringify({ ref: `refs/heads/${newBranchName.trim()}`, sha }) }
      );
      if (!createRes.ok) throw new Error(`HTTP ${createRes.status}`);
      setBranches(prev => [...prev, newBranchName.trim()]);
      setCurrentBranch(newBranchName.trim());
      setNewBranchName('');
      setShowCreateBranch(false);
      setGitPushMsg(`Branch '${newBranchName.trim()}' created`);
    } catch (e: any) {
      setGitPushMsg(`Failed: ${e.message}`);
    } finally {
      setGitLoading(null);
    }
  };

  const handleCommitAndPush = async () => {
    const parsed = parseGitHubRepo(repoUrl);
    if (!parsed || !gitToken) throw new Error('Token and repo URL required');
    if (editedPaths.size === 0) throw new Error('No changes to commit');
    setGitPushStatus('pushing');
    setGitPushMsg('');
    const { owner, repo } = parsed;
    const h = ghHeaders();
    try {
      const refRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${currentBranch}`, { headers: h });
      if (!refRes.ok) throw new Error(`Branch not found (HTTP ${refRes.status})`);
      const latestSha = (await refRes.json()).object.sha;
      const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits/${latestSha}`, { headers: h });
      if (!commitRes.ok) throw new Error(`HTTP ${commitRes.status}`);
      const baseTreeSha = (await commitRes.json()).tree.sha;
      const treeItems: any[] = [];
      for (const fp of editedPaths) {
        const raw = editedContents[fp] !== undefined ? editedContents[fp] : fileMap.get(fp)?.content ?? '';
        const blobRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
          method: 'POST', headers: h,
          body: JSON.stringify({ content: btoa(Array.from(new TextEncoder().encode(raw)).map(b => String.fromCharCode(b)).join('')), encoding: 'base64' }),
        });
        if (!blobRes.ok) throw new Error(`Blob error HTTP ${blobRes.status}`);
        const blobSha = (await blobRes.json()).sha;
        const repoPath = fp.includes('/') ? fp.split('/').slice(1).join('/') : fp;
        treeItems.push({ path: repoPath, mode: '100644', type: 'blob', sha: blobSha });
      }
      const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
        method: 'POST', headers: h, body: JSON.stringify({ base_tree: baseTreeSha, tree: treeItems }),
      });
      if (!treeRes.ok) throw new Error(`Tree error HTTP ${treeRes.status}`);
      const newTreeSha = (await treeRes.json()).sha;
      const newCommitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
        method: 'POST', headers: h,
        body: JSON.stringify({ message: commitMsg || 'Update module files', tree: newTreeSha, parents: [latestSha] }),
      });
      if (!newCommitRes.ok) throw new Error(`Commit error HTTP ${newCommitRes.status}`);
      const newCommitSha = (await newCommitRes.json()).sha;
      const updateRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${currentBranch}`, {
        method: 'PATCH', headers: h, body: JSON.stringify({ sha: newCommitSha }),
      });
      if (!updateRes.ok) throw new Error(`Ref update HTTP ${updateRes.status}`);
      setGitPushStatus('success');
      setGitPushMsg(`Pushed ${editedPaths.size} file(s) to '${currentBranch}'`);
    } catch (e: any) {
      setGitPushStatus('error');
      setGitPushMsg(e.message || 'Push failed');
      throw e;
    }
  };

  const loadWorkflows = async () => {
    const parsed = parseGitHubRepo(repoUrl);
    if (!parsed || !gitToken) return;
    setGitLoading('Loading workflows…');
    try {
      const res = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}/actions/workflows`, { headers: ghHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const wfs = (data.workflows || []).map((w: any) => ({ id: w.id, name: w.name, path: w.path }));
      setWorkflows(wfs);
      if (wfs.length > 0) setSelectedWorkflow(wfs[0].id);
    } catch (e: any) {
      setDeployMsg(`Failed to load workflows: ${e.message}`);
    } finally {
      setGitLoading(null);
    }
  };

  const handleTriggerDeploy = async () => {
    const parsed = parseGitHubRepo(repoUrl);
    if (!parsed || !gitToken || !selectedWorkflow) return;
    setDeployStatus('triggering');
    setDeployMsg('');
    try {
      const res = await fetch(
        `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/actions/workflows/${selectedWorkflow}/dispatches`,
        { method: 'POST', headers: ghHeaders(), body: JSON.stringify({ ref: currentBranch }) }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).message || `HTTP ${res.status}`);
      }
      setDeployStatus('success');
      setDeployMsg(`Triggered on branch '${currentBranch}'`);
    } catch (e: any) {
      setDeployStatus('error');
      setDeployMsg(e.message || 'Trigger failed');
    }
  };

  // ── Terminal command handler ───────────────────────────────────────────────
  const appendTermLine = (text: string, type: TerminalLine['type'] = 'output') =>
    setTermLines(prev => [...prev, { text, type }]);

  const handleTermCommand = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) { setTermInput(''); return; }
    setTermHistory(prev => [cmd, ...prev.slice(0, 49)]);
    setTermHistIdx(-1);
    setTermLines(prev => [...prev, { text: `$ ${cmd}`, type: 'input' }]);
    setTermInput('');
    const parts = cmd.split(/\s+/);
    const base = parts[0].toLowerCase();
    switch (base) {
      case 'help':
        appendTermLine('Available commands:', 'info');
        ['  ls [path]           List module files',
          '  cat <file>          Show file content',
          '  pwd                 Show module path',
          '  echo <text>         Print text',
          '  clear / cls         Clear terminal',
          '  git status          Show modified files',
          '  git branch          List branches',
          '  git checkout <br>   Switch branch',
          '  git log             Show recent commit',
          '  git add .           Stage all changes',
          '  git commit -m "…"   Record changes',
          '  git push            Push to remote',
          '  git pull            Sync with remote',
          '  exit                Close terminal',
        ].forEach(l => appendTermLine(l));
        break;
      case 'clear': case 'cls':
        setTermLines([]);
        break;
      case 'pwd':
        appendTermLine(`/${component?.properties?.name || component?.techId || 'module'}`);
        break;
      case 'ls': {
        const shown = new Set<string>();
        const prefix = parts[1] ? parts[1].replace(/\/$/, '') + '/' : '';
        [...fileMap.keys()].forEach(p => {
          const rel = p.split('/').slice(1).join('/');
          if (!prefix || rel.startsWith(prefix)) {
            const rest = prefix ? rel.slice(prefix.length) : rel;
            const seg = rest.split('/')[0];
            if (seg) shown.add(seg + (rest.includes('/') ? '/' : ''));
          }
        });
        if (shown.size === 0) appendTermLine('No files found', 'error');
        else [...shown].sort().forEach(f => appendTermLine(f));
        break;
      }
      case 'cat': {
        const target = parts[1];
        if (!target) { appendTermLine('Usage: cat <file>', 'error'); break; }
        const key = [...fileMap.keys()].find(k => k.endsWith('/' + target) || k === target);
        if (!key) { appendTermLine(`cat: ${target}: No such file`, 'error'); break; }
        const content = editedContents[key] !== undefined ? editedContents[key] : fileMap.get(key)?.content ?? '';
        content.split('\n').slice(0, 60).forEach((l: string) => appendTermLine(l));
        if (content.split('\n').length > 60) appendTermLine('… (truncated)', 'info');
        break;
      }
      case 'echo':
        appendTermLine(parts.slice(1).join(' '));
        break;
      case 'git': {
        const sub = parts[1]?.toLowerCase();
        if (!sub) { appendTermLine('usage: git <command>', 'error'); break; }
        switch (sub) {
          case 'status':
            appendTermLine(`On branch ${currentBranch}`, 'info');
            if (editedPaths.size === 0) appendTermLine('nothing to commit, working tree clean', 'success');
            else {
              appendTermLine(`Changes not staged for commit: (${editedPaths.size} file(s))`, 'output');
              [...editedPaths].forEach(p => appendTermLine(`  modified:   ${p.split('/').slice(1).join('/')}`, 'error'));
            }
            break;
          case 'branch':
            if (branches.length === 0) appendTermLine(`* ${currentBranch}`, 'success');
            else branches.forEach(b => appendTermLine(b === currentBranch ? `* ${b}` : `  ${b}`, b === currentBranch ? 'success' : 'output'));
            break;
          case 'checkout':
            if (!parts[2]) { appendTermLine('Usage: git checkout <branch>', 'error'); break; }
            if (branches.includes(parts[2])) { setCurrentBranch(parts[2]); appendTermLine(`Switched to branch '${parts[2]}'`, 'success'); }
            else appendTermLine(`error: pathspec '${parts[2]}' did not match any branch`, 'error');
            break;
          case 'log':
            appendTermLine(`commit a1b2c3d (HEAD -> ${currentBranch})`, 'success');
            appendTermLine('Author: You <you@example.com>');
            appendTermLine(`Date:   ${new Date().toDateString()}`);
            appendTermLine('');
            appendTermLine('    Previous changes');
            break;
          case 'add':
            appendTermLine(`Staged ${editedPaths.size} file(s)`, 'success');
            break;
          case 'commit': {
            const mi = parts.indexOf('-m');
            const msg = mi >= 0 ? parts.slice(mi + 1).join(' ').replace(/^["']|["']$/g, '') : commitMsg;
            if (!msg) { appendTermLine('error: commit message is empty', 'error'); break; }
            setCommitMsg(msg);
            appendTermLine(`[${currentBranch} a1b2c3d] ${msg}`, 'success');
            appendTermLine(` ${editedPaths.size} file(s) changed`);
            break;
          }
          case 'push':
            if (!gitToken || !repoUrl) {
              appendTermLine('error: remote not configured — set token & repo URL in the Git tab', 'error');
            } else {
              appendTermLine(`Pushing to origin/${currentBranch}…`, 'info');
              handleCommitAndPush()
                .then(() => appendTermLine(`Branch '${currentBranch}' pushed to origin`, 'success'))
                .catch((e: Error) => appendTermLine(`error: ${e.message}`, 'error'));
            }
            break;
          case 'pull':
            appendTermLine('Already up to date.', 'success');
            break;
          case 'fetch':
            appendTermLine('Fetching origin…', 'info');
            appendTermLine(`From ${repoUrl || 'origin'}`);
            break;
          default:
            appendTermLine(`git: '${sub}' is not a git command. See 'git help'.`, 'error');
        }
        break;
      }
      case 'exit': case 'quit':
        setShowTerminal(false);
        break;
      default:
        appendTermLine(`${base}: command not found. Type 'help' for commands.`, 'error');
    }
  };

  const handleSave = () => {
    if (!component || !projectId) return;

    const updatedComponent: CanvasComponent = {
      ...component,
      properties: { ...localProps, envVars, port, version, notes, moduleFiles: editedContents },
    };

    try {
      const saved = localStorage.getItem('userProjects');
      if (saved) {
        const projects = JSON.parse(saved) as Project[];
        const pi = projects.findIndex(p => p.id.toString() === projectId);
        if (pi >= 0 && projects[pi].canvasState?.components) {
          const ci = projects[pi].canvasState!.components.findIndex(c => c.id === componentId);
          if (ci >= 0) {
            projects[pi].canvasState!.components[ci] = updatedComponent;
            projects[pi].lastModified = new Date().toISOString();
            localStorage.setItem('userProjects', JSON.stringify(projects));
            setCurrentProject({ ...projects[pi] });
          }
        }
      }
    } catch { /* ignore */ }

    setComponent(updatedComponent);
    setIsDirty(false);
  };

  const handleDiscard = () => {
    if (!component) return;
    setLocalProps({ ...component.properties });
    setEnvVars(component.properties?.envVars || []);
    setPort(component.properties?.port || '');
    setVersion(component.properties?.version || '');
    setNotes(component.properties?.notes || '');
    setEditedContents(component.properties?.moduleFiles || {});
    setIsDirty(false);
  };

  // ── Not-found guard ───────────────────────────────────────────────────────
  if (!component) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Module not found</h2>
          <p className="text-sm text-gray-500 mb-4">This module doesn't exist in the project.</p>
          <button
            onClick={() => navigate(`/project/${projectId}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Back to Project
          </button>
        </div>
      </div>
    );
  }

  const tech     = getTechById(component.techId);
  const category = getCategoryByTechId(component.techId);
  const inbound  = connections.filter(c => c.target === component.id);
  const outbound = connections.filter(c => c.source === component.id);

  const getComponentName = (id: string) => {
    const c = allComponents.find(x => x.id === id);
    return c?.properties?.name || getTechById(c?.techId || '')?.name || id;
  };

  // ── Overview tab ──────────────────────────────────────────────────────────
  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-start space-x-5">
          {tech?.logo ? (
            <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg flex-shrink-0">
              <tech.logo className="w-10 h-10 text-white" />
            </div>
          ) : (
            <div className="w-[74px] h-[74px] rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0" style={{ backgroundColor: tech?.color || '#6B7280' }}>
              <span className="text-white text-2xl font-bold">{tech?.name?.charAt(0) || 'M'}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-xl font-bold text-gray-900">{tech?.name}</h3>
              {category && <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full capitalize">{category}</span>}
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{tech?.description}</p>
            <div className="mt-3">
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Display Name</label>
              <input type="text" value={localProps.name || ''} onChange={e => handlePropChange('name', e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" placeholder="Module display name" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{inbound.length}</div>
          <div className="text-xs text-gray-500 mt-1">Inbound connections</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{outbound.length}</div>
          <div className="text-xs text-gray-500 mt-1">Outbound connections</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{(component.selectedLibraries || []).length}</div>
          <div className="text-xs text-gray-500 mt-1">Libraries</div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Module Description</label>
        <textarea rows={3} value={localProps.description || ''} onChange={e => handlePropChange('description', e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" placeholder="Describe what this module does in your architecture…" />
      </div>

      {(inbound.length > 0 || outbound.length > 0) && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Connection Map</h4>
          <div className="space-y-2">
            {inbound.map(c => (
              <div key={c.id} className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                <span className="font-medium text-gray-800">{getComponentName(c.source)}</span>
                <ChevronRight className="w-3 h-3 text-gray-400" />
                <span className="text-blue-700 font-medium">This module</span>
              </div>
            ))}
            {outbound.map(c => (
              <div key={c.id} className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                <span className="text-blue-700 font-medium">This module</span>
                <ChevronRight className="w-3 h-3 text-gray-400" />
                <span className="font-medium text-gray-800">{getComponentName(c.target)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ── Configuration tab ─────────────────────────────────────────────────────
  const renderConfiguration = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Port / Host</label>
        <div className="flex space-x-3">
          <input type="text" value={port} onChange={e => { setPort(e.target.value); markDirty(); }} className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono" placeholder="e.g. 3000" />
          <input type="text" value={localProps.host || ''} onChange={e => handlePropChange('host', e.target.value)} className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono" placeholder="e.g. localhost" />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">Port and host this service listens on</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Version</label>
        <input type="text" value={version} onChange={e => { setVersion(e.target.value); markDirty(); }} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono" placeholder="e.g. 18.x, latest, ^5.0.0" />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Run Mode</label>
        <div className="grid grid-cols-3 gap-2">
          {['development', 'staging', 'production'].map(mode => (
            <button key={mode} onClick={() => handlePropChange('runMode', mode)} className={`py-2.5 px-3 text-sm rounded-lg border-2 font-medium transition-all capitalize ${localProps.runMode === mode ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}>{mode}</button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Replicas / Instances</label>
        <input type="number" min={1} value={localProps.replicas || 1} onChange={e => handlePropChange('replicas', parseInt(e.target.value) || 1)} className="w-32 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
        <p className="text-xs text-gray-400 mt-1.5">Number of running instances</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700">Health Check</label>
          <button onClick={() => handlePropChange('healthCheckEnabled', !localProps.healthCheckEnabled)} className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${localProps.healthCheckEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}>
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${localProps.healthCheckEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
          </button>
        </div>
        {localProps.healthCheckEnabled && (
          <input type="text" value={localProps.healthCheckPath || ''} onChange={e => handlePropChange('healthCheckPath', e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono" placeholder="/health" />
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-semibold text-gray-700">Requires Authentication</label>
            <p className="text-xs text-gray-400 mt-0.5">Whether this module requires auth tokens</p>
          </div>
          <button onClick={() => handlePropChange('requiresAuth', !localProps.requiresAuth)} className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${localProps.requiresAuth ? 'bg-blue-500' : 'bg-gray-300'}`}>
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${localProps.requiresAuth ? 'translate-x-5' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>
    </div>
  );

  // ── Environment tab ───────────────────────────────────────────────────────
  const addEnvVar = () => { setEnvVars(prev => [...prev, { key: '', value: '', isSecret: false }]); markDirty(); };
  const updateEnvVar = (i: number, field: keyof EnvVar, val: string | boolean) => { setEnvVars(prev => prev.map((ev, j) => j === i ? { ...ev, [field]: val } : ev)); markDirty(); };
  const removeEnvVar = (i: number) => { setEnvVars(prev => prev.filter((_, j) => j !== i)); markDirty(); };

  const renderEnvironment = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-700">Environment Variables</h4>
          <p className="text-xs text-gray-400 mt-0.5">Configure runtime environment for this module</p>
        </div>
        <button onClick={addEnvVar} className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-3.5 h-3.5" /><span>Add Variable</span>
        </button>
      </div>

      {envVars.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
          <Terminal className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No environment variables defined</p>
          <p className="text-xs text-gray-400 mt-1">Click "Add Variable" to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 px-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Key</span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Value</span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Secret</span>
            <span />
          </div>
          {envVars.map((ev, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-center">
              <input type="text" value={ev.key} onChange={e => updateEnvVar(idx, 'key', e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono" placeholder="KEY_NAME" />
              <input type={ev.isSecret ? 'password' : 'text'} value={ev.value} onChange={e => updateEnvVar(idx, 'value', e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono" placeholder="value" />
              <button onClick={() => updateEnvVar(idx, 'isSecret', !ev.isSecret)} className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-colors ${ev.isSecret ? 'border-orange-400 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`} title="Toggle secret"><Shield className="w-3.5 h-3.5" /></button>
              <button onClick={() => removeEnvVar(idx)} className="w-8 h-8 rounded-lg border-2 border-red-200 text-red-400 hover:bg-red-50 hover:border-red-300 flex items-center justify-center transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Templates</h5>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Node.js',      vars: [{ key: 'NODE_ENV', value: 'development', isSecret: false }] },
            { label: 'Database URL', vars: [{ key: 'DATABASE_URL', value: '', isSecret: true }] },
            { label: 'API Keys',     vars: [{ key: 'API_KEY', value: '', isSecret: true }, { key: 'API_SECRET', value: '', isSecret: true }] },
            { label: 'Debug',        vars: [{ key: 'DEBUG', value: '*', isSecret: false }] },
          ].map(t => (
            <button key={t.label} onClick={() => { setEnvVars(prev => { const ks = prev.map(e => e.key); return [...prev, ...t.vars.filter(v => !ks.includes(v.key))]; }); markDirty(); }} className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-colors">+ {t.label}</button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Dependencies tab ──────────────────────────────────────────────────────
  const renderDependencies = () => {
    const libs = component.selectedLibraries || [];
    return (
      <div className="space-y-5">
        <div>
          <h4 className="text-sm font-semibold text-gray-700">Selected Libraries</h4>
          <p className="text-xs text-gray-400 mt-0.5">Libraries are configured in the Properties panel of the project editor.</p>
        </div>
        {libs.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
            <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No libraries selected</p>
            <p className="text-xs text-gray-400 mt-1">Go back to the project editor to add libraries</p>
          </div>
        ) : (
          <div className="space-y-2">
            {libs.map((lib: any, idx: number) => (
              <div key={lib.id || idx} className="flex items-center space-x-3 bg-white border border-gray-200 rounded-xl p-4">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: lib.color || '#6B7280' }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{lib.name}</div>
                  {lib.description && <div className="text-xs text-gray-500 truncate">{lib.description}</div>}
                </div>
                {lib.version && <span className="text-xs text-gray-400 font-mono flex-shrink-0">{lib.version}</span>}
              </div>
            ))}
          </div>
        )}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Packages</label>
          <textarea rows={4} value={localProps.additionalPackages || ''} onChange={e => handlePropChange('additionalPackages', e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono resize-none" placeholder={'lodash@4.x\naxios\ndayjs'} />
          <p className="text-xs text-gray-400 mt-1.5">One package per line (name@version)</p>
        </div>
      </div>
    );
  };

  // ── Advanced tab ──────────────────────────────────────────────────────────
  const renderAdvanced = () => (
    <div className="space-y-5">
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
        <textarea rows={5} value={notes} onChange={e => { setNotes(e.target.value); markDirty(); }} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" placeholder="Internal notes about this module…" />
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">Module Metadata</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: 'ID',       value: component.id },
            { label: 'Tech ID',  value: component.techId },
            { label: 'Type',     value: component.type },
            { label: 'Category', value: category || '—' },
            { label: 'Position', value: `(${Math.round(component.position.x)}, ${Math.round(component.position.y)})` },
            { label: 'Size',     value: `${component.size.width} × ${component.size.height}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div className="text-xs text-gray-500 font-medium mb-1">{label}</div>
              <div className="text-gray-900 font-mono text-xs break-all">{value}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
        <input type="text" value={localProps.tags || ''} onChange={e => handlePropChange('tags', e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="api, core, public (comma-separated)" />
      </div>
      <div className="bg-red-50 border border-red-200 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-red-700 mb-1">Danger Zone</h4>
        <p className="text-xs text-red-500 mb-4">Clear all custom configuration for this module and reset to defaults.</p>
        <button onClick={() => { setLocalProps({ name: localProps.name, description: localProps.description, color: localProps.color }); setEnvVars([]); setPort(''); setVersion(''); setNotes(''); setEditedContents({}); markDirty(); }} className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors font-medium">Reset All Configuration</button>
      </div>
    </div>
  );

  // ── Files tab ─────────────────────────────────────────────────────────────
  const renderFiles = () => {
    // Relative display path (strip root folder prefix for readability)
    const displayPath = selectedFilePath
      ? selectedFilePath.replace(/^[^/]+\//, '')
      : null;

    const pathParts = displayPath?.split('/') || [];

    return (
      <div className="flex h-full overflow-hidden bg-[#1e1e1e]">

        {/* ── File tree panel ─────────────────────────────────────────────── */}
        <div className="w-60 flex-shrink-0 flex flex-col border-r border-white/10 bg-[#252526] overflow-hidden">
          {/* Panel header */}
          <div className="px-3 py-2.5 border-b border-white/10 flex items-center space-x-2 flex-shrink-0">
            <FileCode className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Explorer</span>
          </div>

          {/* Tree project label */}
          {fileTree && (
            <div className="px-3 py-1.5 border-b border-white/5 flex-shrink-0">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                {fileTree.name}
              </span>
            </div>
          )}

          {/* Tree nodes */}
          <div className="flex-1 overflow-y-auto py-1">
            {fileTree?.children.map(child => (
              <TreeItem
                key={child.path}
                node={child}
                depth={0}
                selectedPath={selectedFilePath}
                expandedFolders={expandedFolders}
                editedPaths={editedPaths}
                onFileSelect={setSelectedFilePath}
                onToggleFolder={toggleFolder}
              />
            ))}
          </div>

          {/* Edit count badge */}
          {editedPaths.size > 0 && (
            <div className="px-3 py-2 border-t border-white/10 flex-shrink-0">
              <span className="text-[11px] text-amber-400">
                {editedPaths.size} file{editedPaths.size !== 1 ? 's' : ''} modified
              </span>
            </div>
          )}
        </div>

        {/* ── Editor area ─────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">

          {/* Tab bar / breadcrumb */}
          <div className="flex-shrink-0 flex items-center bg-[#1e1e1e] border-b border-white/10 h-9 px-3 gap-2 overflow-x-auto">
            {displayPath ? (
              <>
                {/* Tab pill */}
                <div className="flex items-center gap-1.5 bg-[#2d2d2d] border border-white/10 rounded px-2.5 py-1 flex-shrink-0">
                  <FileText className={`w-3 h-3 flex-shrink-0 ${selectedFilePath ? fileIconColor(selectedFilePath.split('/').pop() || '') : 'text-gray-400'}`} />
                  <span className="text-[12px] text-gray-200 font-medium whitespace-nowrap">
                    {pathParts[pathParts.length - 1]}
                  </span>
                  {selectedFilePath && editedPaths.has(selectedFilePath) && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" title="Unsaved changes" />
                  )}
                </div>

                {/* Breadcrumb */}
                <div className="flex items-center gap-0.5 text-[11px] text-gray-500 min-w-0 overflow-hidden">
                  {pathParts.slice(0, -1).map((part, i) => (
                    <React.Fragment key={i}>
                      <span className="truncate">{part}</span>
                      <ChevronRight className="w-3 h-3 flex-shrink-0" />
                    </React.Fragment>
                  ))}
                </div>

                {/* Revert button */}
                {selectedFilePath && editedPaths.has(selectedFilePath) && (
                  <button
                    onClick={handleRevertFile}
                    title="Revert file to generated content"
                    className="ml-auto flex items-center gap-1 px-2 py-0.5 text-[11px] text-amber-400 hover:text-amber-300 border border-amber-400/30 hover:border-amber-400/60 rounded transition-colors flex-shrink-0"
                  >
                    <RevertIcon className="w-3 h-3" />
                    Revert
                  </button>
                )}
              </>
            ) : (
              <span className="text-[12px] text-gray-500 italic">Select a file to edit</span>
            )}
          </div>

          {/* Editor + Terminal split */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Monaco / empty state */}
            <div className="flex-1 min-h-0">
              {selectedFilePath ? (
                <Editor
                  height="100%"
                  language={currentFileLang}
                  value={currentFileContent}
                  onChange={handleFileChange}
                  theme="vs-dark"
                  loading={
                    <div className="flex items-center justify-center bg-[#1e1e1e] h-full">
                      <div className="text-gray-500 text-sm">Loading editor…</div>
                    </div>
                  }
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    fontFamily: '"Cascadia Code", "JetBrains Mono", "Fira Code", monospace',
                    lineNumbers: 'on',
                    wordWrap: 'off',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 12, bottom: 12 },
                    tabSize: 2,
                    insertSpaces: true,
                    renderLineHighlight: 'line',
                    smoothScrolling: true,
                    cursorBlinking: 'smooth',
                    bracketPairColorization: { enabled: true },
                    guides: { bracketPairs: true, indentation: true },
                    suggest: { showKeywords: true },
                    formatOnPaste: true,
                  }}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-3">
                  <FileText className="w-14 h-14 text-gray-600" />
                  <div className="text-center">
                    <p className="text-gray-400 text-sm font-medium">No file selected</p>
                    <p className="text-gray-600 text-xs mt-1">Click a file in the explorer to view and edit it</p>
                  </div>
                  {fileMap.size > 0 && (
                    <p className="text-gray-600 text-xs">{fileMap.size} file{fileMap.size !== 1 ? 's' : ''} available</p>
                  )}
                </div>
              )}
            </div>

            {/* Integrated Terminal Panel */}
            {showTerminal && (
              <div className="flex-shrink-0 h-48 flex flex-col border-t border-white/10 bg-[#1e1e1e]">
                {/* Terminal header */}
                <div className="flex items-center justify-between px-3 py-1 border-b border-white/10 flex-shrink-0">
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium uppercase tracking-wider">
                    <Terminal className="w-3 h-3" />
                    <span>Terminal</span>
                  </div>
                  <button
                    onClick={() => setShowTerminal(false)}
                    className="text-gray-500 hover:text-gray-300 transition-colors p-0.5 rounded"
                    title="Close terminal"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                </div>
                {/* Output */}
                <div
                  className="flex-1 overflow-y-auto px-3 py-1.5 font-mono text-[12px] leading-5 cursor-text"
                  onClick={() => termInputRef.current?.focus()}
                >
                  {termLines.map((line, i) => (
                    <div
                      key={i}
                      className={`whitespace-pre-wrap break-all ${
                        line.type === 'input'   ? 'text-white' :
                        line.type === 'error'   ? 'text-red-400' :
                        line.type === 'success' ? 'text-green-400' :
                        line.type === 'info'    ? 'text-blue-300' :
                                                  'text-gray-300'
                      }`}
                    >
                      {line.text || '\u00A0'}
                    </div>
                  ))}
                  <div ref={termEndRef} />
                </div>
                {/* Input */}
                <div className="flex items-center gap-2 px-3 py-1.5 border-t border-white/10 flex-shrink-0">
                  <span className="text-green-400 font-mono text-[12px] select-none flex-shrink-0">$</span>
                  <input
                    ref={termInputRef}
                    type="text"
                    value={termInput}
                    onChange={e => setTermInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        handleTermCommand(termInput);
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        const idx = Math.min(termHistIdx + 1, termHistory.length - 1);
                        setTermHistIdx(idx);
                        if (termHistory[idx] !== undefined) setTermInput(termHistory[idx]);
                      } else if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        const idx = Math.max(termHistIdx - 1, -1);
                        setTermHistIdx(idx);
                        setTermInput(idx >= 0 ? termHistory[idx] : '');
                      }
                    }}
                    className="flex-1 bg-transparent outline-none text-gray-200 font-mono text-[12px] caret-green-400 placeholder-gray-600"
                    placeholder="Type a command…"
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Status bar */}
          <div className="flex-shrink-0 flex items-center justify-between bg-[#007acc] px-3 h-6 text-[11px] text-white/80">
            <div className="flex items-center gap-3">
              {tech?.logo && <tech.logo className="w-3 h-3" />}
              <span>{tech?.name} · {category || component.techId}</span>
              <button
                onClick={() => { setShowTerminal(v => !v); setTimeout(() => termInputRef.current?.focus(), 80); }}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/20 transition-colors ${showTerminal ? 'bg-white/20' : ''}`}
                title="Toggle Terminal (^`)"
              >
                <Terminal className="w-3 h-3" />
                <span>Terminal</span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              {selectedFilePath && <span className="capitalize">{currentFileLang}</span>}
              {editedPaths.size > 0 && <span className="text-amber-200">● {editedPaths.size} modified</span>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Git tab ───────────────────────────────────────────────────────────────
  const renderGit = () => (
    <div className="space-y-5">
      {/* Connection */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-blue-500" />
          GitHub Connection
        </h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Personal Access Token</label>
            <input
              type="password"
              value={gitToken}
              onChange={e => { setGitToken(e.target.value); localStorage.setItem('githubToken', e.target.value); }}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Repository URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={repoUrl}
                onChange={e => setRepoUrl(e.target.value)}
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="https://github.com/owner/repo"
              />
              <button
                onClick={loadBranches}
                disabled={!gitToken || !repoUrl || !!gitLoading}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40 whitespace-nowrap"
              >
                {gitLoading === 'Loading branches…' ? 'Loading…' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Branch management */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-purple-500" />
          Branch
        </h4>
        <div className="flex items-center gap-2 mb-3">
          <select
            value={currentBranch}
            onChange={e => setCurrentBranch(e.target.value)}
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {branches.length === 0
              ? <option value={currentBranch}>{currentBranch}</option>
              : branches.map(b => <option key={b} value={b}>{b}</option>)
            }
          </select>
          <button
            onClick={() => setShowCreateBranch(v => !v)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            + New Branch
          </button>
        </div>
        {showCreateBranch && (
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={newBranchName}
              onChange={e => setNewBranchName(e.target.value)}
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="feature/my-branch"
            />
            <button
              onClick={createBranchAPI}
              disabled={!newBranchName.trim() || !!gitLoading}
              className="px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-40"
            >
              {gitLoading === 'Creating branch…' ? 'Creating…' : 'Create'}
            </button>
          </div>
        )}
      </div>

      {/* Commit & Push */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-green-500" />
          Commit &amp; Push
        </h4>
        {editedPaths.size === 0 ? (
          <p className="text-sm text-gray-400 italic">No file changes to commit.</p>
        ) : (
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
              {editedPaths.size} file{editedPaths.size > 1 ? 's' : ''} modified
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Commit message</label>
              <input
                type="text"
                value={commitMsg}
                onChange={e => setCommitMsg(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Update module files"
              />
            </div>
            <button
              onClick={() => handleCommitAndPush().catch(() => {})}
              disabled={!gitToken || !repoUrl || gitPushStatus === 'pushing'}
              className="w-full px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {gitPushStatus === 'pushing' ? 'Pushing…' : `Push to ${currentBranch}`}
            </button>
          </div>
        )}
        {gitPushMsg && (
          <div className={`mt-3 text-xs rounded-lg px-3 py-2 ${gitPushStatus === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : gitPushStatus === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
            {gitPushMsg}
          </div>
        )}
      </div>

      {/* GitHub Actions Deploy */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Play className="w-4 h-4 text-blue-500" />
          GitHub Actions
        </h4>
        <div className="flex gap-2 mb-3">
          <select
            value={selectedWorkflow ?? ''}
            onChange={e => setSelectedWorkflow(e.target.value ? Number(e.target.value) : null)}
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select workflow…</option>
            {workflows.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <button
            onClick={loadWorkflows}
            disabled={!gitToken || !repoUrl || !!gitLoading}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap disabled:opacity-40"
          >
            {gitLoading === 'Loading workflows…' ? 'Loading…' : 'Refresh'}
          </button>
        </div>
        <button
          onClick={handleTriggerDeploy}
          disabled={!selectedWorkflow || deployStatus === 'triggering'}
          className="w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4" />
          {deployStatus === 'triggering' ? 'Triggering…' : 'Trigger Workflow'}
        </button>
        {deployMsg && (
          <div className={`mt-3 text-xs rounded-lg px-3 py-2 ${deployStatus === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : deployStatus === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
            {deployMsg}
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':      return renderOverview();
      case 'configuration': return renderConfiguration();
      case 'environment':   return renderEnvironment();
      case 'dependencies':  return renderDependencies();
      case 'advanced':      return renderAdvanced();
      case 'git':           return renderGit();
      case 'files':         return null; // handled separately in layout
    }
  };

  // ── Page layout ───────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">

      {/* ── Top header ────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-5 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <button
              onClick={() => navigate(`/project/${projectId}`)}
              className="flex items-center space-x-1.5 text-gray-500 hover:text-gray-900 transition-colors flex-shrink-0 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <span className="text-gray-300 flex-shrink-0">|</span>
            <nav className="flex items-center space-x-1 text-sm text-gray-500 min-w-0">
              <button onClick={() => navigate('/dashboard')} className="hover:text-blue-600 transition-colors whitespace-nowrap flex-shrink-0">Dashboard</button>
              <ChevronRight className="w-3 h-3 flex-shrink-0" />
              <button onClick={() => navigate(`/project/${projectId}`)} className="hover:text-blue-600 transition-colors truncate max-w-[120px]" title={projectName}>{projectName}</button>
              <ChevronRight className="w-3 h-3 flex-shrink-0" />
              <span className="text-gray-900 font-medium truncate max-w-[160px]">{localProps.name || tech?.name || 'Module'}</span>
            </nav>
          </div>

          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="flex items-center space-x-2">
              {tech?.logo ? (
                <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <tech.logo className="w-4 h-4 text-white" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm" style={{ backgroundColor: tech?.color || '#6B7280' }}>
                  <span className="text-white text-xs font-bold">{tech?.name?.charAt(0)}</span>
                </div>
              )}
              <div className="hidden sm:block">
                <span className="text-sm font-semibold text-gray-900">{localProps.name || tech?.name}</span>
                {category && <span className="ml-1.5 text-xs text-gray-400 capitalize">{category}</span>}
              </div>
            </div>
            <div className="w-px h-6 bg-gray-200" />
            {isDirty && (
              <button onClick={handleDiscard} className="flex items-center space-x-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <RotateCcw className="w-3.5 h-3.5" /><span>Discard</span>
              </button>
            )}
            <button onClick={handleSave} disabled={!isDirty} className={`flex items-center space-x-1.5 px-4 py-1.5 text-sm rounded-lg font-medium transition-all ${isDirty ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' : 'bg-gray-100 text-gray-400 cursor-default'}`}>
              <Save className="w-3.5 h-3.5" /><span>Save</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left nav sidebar */}
        <div className="w-52 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col py-5 overflow-y-auto">
          <nav className="space-y-1 px-3">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={activeTab === item.id ? 'text-blue-600' : 'text-gray-400'}>{item.icon}</span>
                <span>{item.label}</span>
                {item.id === 'files' && editedPaths.size > 0 && (
                  <span className="ml-auto text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                    {editedPaths.size}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Color swatch (only for non-files tabs) */}
          {activeTab !== 'files' && (
            <div className="mt-6 px-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Color</div>
              <div className="grid grid-cols-4 gap-1.5">
                {SWATCH_COLORS.map(color => (
                  <button key={color} onClick={() => handlePropChange('color', color)} className={`w-7 h-7 rounded-lg transition-all ${localProps.color === color ? 'ring-2 ring-offset-1 ring-gray-700 scale-110' : 'hover:scale-105'}`} style={{ backgroundColor: color }} title={color} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main content area — full-height for Files, scrollable otherwise */}
        {activeTab === 'files' ? (
          <div className="flex-1 overflow-hidden">
            {renderFiles()}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="max-w-3xl mx-auto p-8">
              {renderContent()}
            </div>
          </div>
        )}
      </div>

      {/* ── Footer status bar ─────────────────────────────────────────────── */}
      {activeTab !== 'files' && (
        <div className="flex-shrink-0 px-5 py-2 border-t border-gray-200 bg-white flex items-center justify-between">
          <span className="text-xs text-gray-400">{tech?.name} · {component.id}</span>
          {isDirty
            ? <span className="text-xs text-amber-600 font-medium">● Unsaved changes</span>
            : <span className="text-xs text-green-600 font-medium">✓ All changes saved</span>}
        </div>
      )}
    </div>
  );
}
