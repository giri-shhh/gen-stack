import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Palette, Key, Github, Shield,
  Eye, EyeOff, Check, Sun, Moon, Save, LogOut,
  Trash2, RefreshCw, AlertTriangle, ChevronRight
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { getStoredApiKey, saveApiKey } from '../lib/aiArchitectureGenerator';
import type { User as UserType } from '../types';

interface SettingsPageProps {
  user: UserType;
  onLogout: () => void;
  onUserUpdate: (updated: UserType) => void;
}

type Section = 'profile' | 'appearance' | 'apikeys' | 'integrations' | 'account';

const navItems: { id: Section; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'profile',       label: 'Profile',       icon: User },
  { id: 'appearance',    label: 'Appearance',     icon: Palette },
  { id: 'apikeys',       label: 'AI & API Keys',  icon: Key },
  { id: 'integrations',  label: 'Integrations',   icon: Github },
  { id: 'account',       label: 'Account',        icon: Shield },
];

// ── Reusable UI pieces ────────────────────────────────────────────────────────

const SectionCard: React.FC<{ title: string; description?: string; children: React.ReactNode }> = ({
  title, description, children,
}) => (
  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-sm p-6">
    <div className="mb-5">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
      {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
    </div>
    {children}
  </div>
);

const FieldLabel: React.FC<{ htmlFor?: string; children: React.ReactNode }> = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
    {children}
  </label>
);

const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${props.className ?? ''}`}
  />
);

const SaveButton: React.FC<{ saving: boolean; saved: boolean; onClick: () => void; disabled?: boolean }> = ({
  saving, saved, onClick, disabled,
}) => (
  <button
    onClick={onClick}
    disabled={disabled || saving}
    className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-medium text-sm transition-all duration-200 shadow-sm"
  >
    {saved ? (
      <><Check className="w-4 h-4" /><span>Saved</span></>
    ) : saving ? (
      <><RefreshCw className="w-4 h-4 animate-spin" /><span>Saving…</span></>
    ) : (
      <><Save className="w-4 h-4" /><span>Save changes</span></>
    )}
  </button>
);

// ── Section components ────────────────────────────────────────────────────────

const ProfileSection: React.FC<{ user: UserType; onUserUpdate: (u: UserType) => void }> = ({
  user, onUserUpdate,
}) => {
  const [name, setName] = useState(user.name);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isDirty = name.trim() !== user.name;

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    const updatedUser: UserType = {
      ...user,
      name: name.trim(),
      avatar: user.avatar.startsWith('https://ui-avatars.com')
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=6366f1&color=fff`
        : user.avatar,
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    onUserUpdate(updatedUser);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <SectionCard
      title="Profile"
      description="Manage your public display name and account information."
    >
      <div className="flex items-center space-x-5 mb-6">
        <img
          src={user.avatar.startsWith('https://ui-avatars.com')
            ? `https://ui-avatars.com/api/?name=${encodeURIComponent(name || user.name)}&background=6366f1&color=fff`
            : user.avatar}
          alt={name || user.name}
          className="w-20 h-20 rounded-full ring-4 ring-indigo-100 dark:ring-indigo-900 shadow-md"
        />
        <div>
          <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{user.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {user.isTemporary ? 'Temporary account' : user.email}
          </p>
          {user.isTemporary && (
            <span className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
              Guest session
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <FieldLabel htmlFor="display-name">Display name</FieldLabel>
          <TextInput
            id="display-name"
            value={name}
            onChange={e => { setName(e.target.value); setSaved(false); }}
            placeholder="Enter your display name"
            maxLength={50}
          />
        </div>

        <div>
          <FieldLabel htmlFor="email">Email address</FieldLabel>
          <TextInput
            id="email"
            value={user.email || ''}
            placeholder={user.isTemporary ? 'No email — guest account' : 'No email set'}
            disabled
          />
          {user.isTemporary && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
              Sign up for a full account to set an email address.
            </p>
          )}
        </div>

        <div>
          <FieldLabel>Account ID</FieldLabel>
          <TextInput value={user.id} disabled />
        </div>

        <div className="flex justify-end pt-1">
          <SaveButton
            saving={saving}
            saved={saved}
            onClick={handleSave}
            disabled={!isDirty || !name.trim()}
          />
        </div>
      </div>
    </SectionCard>
  );
};

const AppearanceSection: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <SectionCard
      title="Appearance"
      description="Customise the look and feel of the application."
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-3">
            {theme === 'light' ? (
              <Sun className="w-5 h-5 text-amber-500" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-400" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {theme === 'light' ? 'Light mode' : 'Dark mode'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {theme === 'light'
                  ? 'Currently using a light colour scheme'
                  : 'Currently using a dark colour scheme'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            role="switch"
            aria-checked={theme === 'dark'}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => theme === 'dark' && toggleTheme()}
            className={`flex items-center space-x-2 p-4 rounded-xl border-2 transition-all duration-200 ${
              theme === 'light'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <Sun className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Light</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Clean, bright</p>
            </div>
            {theme === 'light' && <Check className="w-4 h-4 text-blue-600 ml-auto" />}
          </button>

          <button
            onClick={() => theme === 'light' && toggleTheme()}
            className={`flex items-center space-x-2 p-4 rounded-xl border-2 transition-all duration-200 ${
              theme === 'dark'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            <Moon className="w-5 h-5 text-indigo-400 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Dark</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Easy on the eyes</p>
            </div>
            {theme === 'dark' && <Check className="w-4 h-4 text-blue-600 ml-auto" />}
          </button>
        </div>
      </div>
    </SectionCard>
  );
};

interface ApiKeyRowProps {
  label: string;
  placeholder: string;
  storageKey: string;
  hint?: string;
}

const ApiKeyRow: React.FC<ApiKeyRowProps> = ({ label, placeholder, storageKey, hint }) => {
  const [value, setValue] = useState(() => getStoredApiKey(storageKey));
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const original = getStoredApiKey(storageKey);
  const isDirty = value !== original;

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 300));
    saveApiKey(storageKey, value.trim());
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleClear = () => {
    saveApiKey(storageKey, '');
    setValue('');
    setSaved(false);
  };

  return (
    <div className="space-y-2">
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <TextInput
            type={visible ? 'text' : 'password'}
            value={value}
            onChange={e => { setValue(e.target.value); setSaved(false); }}
            placeholder={placeholder}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setVisible(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {value && (
          <button
            onClick={handleClear}
            className="px-3 py-2.5 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 border border-red-200 dark:border-red-800"
            title="Clear key"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        <SaveButton saving={saving} saved={saved} onClick={handleSave} disabled={!isDirty} />
      </div>
      {hint && <p className="text-xs text-gray-400 dark:text-gray-500">{hint}</p>}
    </div>
  );
};

const ApiKeysSection: React.FC = () => (
  <SectionCard
    title="AI & API Keys"
    description="Keys are stored locally in your browser and never sent to any server."
  >
    <div className="space-y-6">
      <ApiKeyRow
        label="OpenAI API key"
        placeholder="sk-…"
        storageKey="openai"
        hint="Used for GPT-4 architecture generation. Get yours at platform.openai.com."
      />
      <div className="border-t border-gray-100 dark:border-gray-700" />
      <ApiKeyRow
        label="Anthropic API key"
        placeholder="sk-ant-…"
        storageKey="anthropic"
        hint="Used for Claude architecture generation. Get yours at console.anthropic.com."
      />
      <div className="border-t border-gray-100 dark:border-gray-700" />
      <ApiKeyRow
        label="Google Gemini API key"
        placeholder="AIza…"
        storageKey="gemini"
        hint="Used for Gemini architecture generation. Get yours at aistudio.google.com."
      />
      <div className="border-t border-gray-100 dark:border-gray-700" />
      <div className="space-y-2">
        <FieldLabel>Local model base URL</FieldLabel>
        <TextInput
          type="url"
          defaultValue={localStorage.getItem('localModelUrl') || ''}
          onChange={e => localStorage.setItem('localModelUrl', e.target.value)}
          placeholder="http://localhost:11434"
        />
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Base URL for a locally-running model (e.g. Ollama). No key required.
        </p>
      </div>
    </div>
  </SectionCard>
);

const IntegrationsSection: React.FC = () => {
  const [token, setToken] = useState(() => localStorage.getItem('githubToken') || '');
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const original = localStorage.getItem('githubToken') || '';
  const isDirty = token !== original;

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 300));
    localStorage.setItem('githubToken', token.trim());
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleClear = () => {
    localStorage.removeItem('githubToken');
    setToken('');
    setSaved(false);
  };

  return (
    <SectionCard
      title="Integrations"
      description="Connect third-party services to unlock additional features."
    >
      <div className="space-y-2">
        <div className="flex items-center space-x-2 mb-3">
          <Github className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">GitHub personal access token</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <TextInput
              type={visible ? 'text' : 'password'}
              value={token}
              onChange={e => { setToken(e.target.value); setSaved(false); }}
              placeholder="ghp_…"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setVisible(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {token && (
            <button
              onClick={handleClear}
              className="px-3 py-2.5 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 border border-red-200 dark:border-red-800"
              title="Clear token"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <SaveButton saving={saving} saved={saved} onClick={handleSave} disabled={!isDirty} />
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Required for pushing projects to GitHub. Needs{' '}
          <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs">repo</code> scope.
          Stored locally in your browser only.
        </p>
      </div>
    </SectionCard>
  );
};

const AccountSection: React.FC<{ user: UserType; onLogout: () => void }> = ({ user, onLogout }) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearData = () => {
    const keysToKeep = ['user', 'theme'];
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) localStorage.removeItem(key);
    });
    setShowClearConfirm(false);
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      <SectionCard title="Session" description="Manage your current session.">
        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-3">
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full ring-2 ring-indigo-100 dark:ring-indigo-900" />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user.isTemporary ? 'Guest session' : user.email}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Danger zone" description="These actions are irreversible. Proceed with caution.">
        <div className="space-y-3">
          {!showClearConfirm ? (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-1.5 bg-red-100 dark:bg-red-900/40 rounded-lg">
                  <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">Clear application data</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Removes all projects, API keys, and settings</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-red-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ) : (
            <div className="p-4 rounded-xl border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
              <div className="flex items-start space-x-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400">Are you sure?</p>
                  <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                    This will permanently delete all your projects, API keys, GitHub token, and other local data.
                    Your theme preference and account session will be kept.
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleClearData}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
                >
                  Yes, clear all data
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
};

// ── Main SettingsPage ─────────────────────────────────────────────────────────

const SettingsPage: React.FC<SettingsPageProps> = ({ user, onLogout, onUserUpdate }) => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<Section>('profile');

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':     return <ProfileSection user={user} onUserUpdate={onUserUpdate} />;
      case 'appearance':  return <AppearanceSection />;
      case 'apikeys':     return <ApiKeysSection />;
      case 'integrations':return <IntegrationsSection />;
      case 'account':     return <AccountSection user={user} onLogout={onLogout} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Page header */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 dark:border-gray-700/20 px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account and preferences</p>
            </div>
          </div>
        </div>

        {/* Body: sidebar + content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-start">

          {/* Sidebar nav */}
          <nav className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-gray-700/30 shadow-sm p-2">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mb-0.5 last:mb-0 ${
                  activeSection === id
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          {/* Content area */}
          <div className="md:col-span-3">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
