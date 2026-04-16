import React, { useState } from 'react';
import {
  Shield, Check, Sparkles, Code, Package, Database, Coffee,
  Server, Lock, Activity, ChevronDown, ChevronRight, Layers,
  Zap, GitBranch, Globe, FileText, Bell, HardDrive, RefreshCw
} from 'lucide-react';
import type { CanvasComponent } from '../../types';

interface SpringBootConfigurationProps {
  component: CanvasComponent;
  onPropertyChange: (property: string, value: any) => void;
}

const SpringBootConfiguration: React.FC<SpringBootConfigurationProps> = ({
  component,
  onPropertyChange
}) => {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(['project-setup', 'dependencies'])
  );

  // ------- helpers -------

  const cfg = (component.properties?.springConfig || {}) as Record<string, any>;

  const get = (section: string, key: string, def?: any) =>
    cfg[section]?.[key] ?? def;

  const set = (section: string, key: string, value: any) => {
    onPropertyChange('springConfig', {
      ...cfg,
      [section]: { ...(cfg[section] || {}), [key]: value }
    });
  };

  const setTop = (key: string, value: any) => {
    onPropertyChange('springConfig', { ...cfg, [key]: value });
  };

  const toggleDep = (dep: string) => {
    const current: string[] = cfg.dependencies || [];
    const next = current.includes(dep)
      ? current.filter((d) => d !== dep)
      : [...current, dep];
    setTop('dependencies', next);
  };

  const hasDep = (dep: string) => (cfg.dependencies || []).includes(dep);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const isOpen = (id: string) => openSections.has(id);

  // ------- presets -------

  const presets: Record<string, { name: string; description: string; icon: string; config: Record<string, any> }> = {
    'rest-api': {
      name: 'REST API Service',
      description: 'Stateless REST backend with JPA + Security',
      icon: '🌐',
      config: {
        'project-setup': { buildTool: 'maven', language: 'java', packaging: 'jar', javaVersion: '21', springBootVersion: '3.3.0' },
        server: { port: '8080', contextPath: '/api' },
        datasource: { dbType: 'postgresql', url: 'jdbc:postgresql://localhost:5432/mydb', username: 'postgres', maxPoolSize: '10' },
        jpa: { ddlAuto: 'validate', showSql: false, formatSql: false },
        security: { sessionManagement: 'stateless', corsAllowAll: true },
        logging: { rootLevel: 'INFO' },
        actuator: { enabled: true, endpoints: ['health', 'info', 'metrics'] },
        dependencies: ['web', 'data-jpa', 'postgresql', 'security', 'validation', 'actuator', 'devtools', 'lombok']
      }
    },
    'microservice': {
      name: 'Microservice',
      description: 'Cloud-native microservice with Eureka + Config',
      icon: '⚡',
      config: {
        'project-setup': { buildTool: 'gradle-kotlin', language: 'kotlin', packaging: 'jar', javaVersion: '21', springBootVersion: '3.3.0' },
        server: { port: '0', contextPath: '/' },
        datasource: { dbType: 'h2', url: 'jdbc:h2:mem:testdb', username: 'sa' },
        jpa: { ddlAuto: 'create-drop', showSql: false },
        security: { sessionManagement: 'stateless' },
        logging: { rootLevel: 'INFO' },
        actuator: { enabled: true, endpoints: ['health', 'info', 'metrics', 'prometheus'] },
        dependencies: ['web', 'actuator', 'cloud-eureka', 'cloud-config-client', 'cloud-loadbalancer', 'data-jpa', 'h2', 'validation', 'lombok']
      }
    },
    'reactive': {
      name: 'Reactive WebFlux',
      description: 'Non-blocking reactive web application',
      icon: '🔄',
      config: {
        'project-setup': { buildTool: 'maven', language: 'java', packaging: 'jar', javaVersion: '21', springBootVersion: '3.3.0' },
        server: { port: '8080', contextPath: '/' },
        jpa: { ddlAuto: 'none' },
        logging: { rootLevel: 'INFO' },
        actuator: { enabled: true, endpoints: ['health', 'metrics'] },
        dependencies: ['webflux', 'data-r2dbc', 'r2dbc-postgresql', 'security', 'validation', 'actuator', 'lombok']
      }
    }
  };

  const [activePreset, setActivePreset] = useState('');

  const applyPreset = (key: string) => {
    setActivePreset(key);
    const preset = presets[key];
    if (preset) {
      const merged = { ...cfg, ...preset.config, dependencies: preset.config.dependencies };
      onPropertyChange('springConfig', merged);
      setOpenSections(new Set(['project-setup', 'server', 'datasource', 'dependencies']));
    }
  };

  // ------- sub-components -------

  const SectionHeader: React.FC<{
    id: string;
    icon: React.ReactNode;
    title: string;
    badge?: string;
  }> = ({ id, icon, title, badge }) => (
    <button
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between px-4 py-3 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-lg border border-red-100 transition-all duration-150 group"
    >
      <div className="flex items-center space-x-2">
        <span className="text-red-600">{icon}</span>
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        {badge && (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">{badge}</span>
        )}
      </div>
      {isOpen(id)
        ? <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-red-600 transition-colors" />
        : <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-red-600 transition-colors" />
      }
    </button>
  );

  const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <label className="text-xs font-medium text-gray-600 mb-1 block">{children}</label>
  );

  const TextInput: React.FC<{
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
    mono?: boolean;
  }> = ({ value, onChange, placeholder, type = 'text', mono }) => (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-3 py-2 text-sm border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white transition-all duration-150 ${mono ? 'font-mono' : ''}`}
    />
  );

  const Select: React.FC<{
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
  }> = ({ value, onChange, options }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 text-sm border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white transition-all duration-150"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );

  const Toggle: React.FC<{
    value: boolean;
    onChange: (v: boolean) => void;
    label: string;
    description?: string;
  }> = ({ value, onChange, label, description }) => (
    <div className="flex items-center justify-between py-1.5">
      <div>
        <div className="text-sm font-medium text-gray-700">{label}</div>
        {description && <div className="text-xs text-gray-500">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${value ? 'bg-red-500' : 'bg-gray-300'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${value ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );

  const ButtonGroup: React.FC<{
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
    cols?: number;
  }> = ({ value, onChange, options, cols = 2 }) => (
    <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-2 py-2 text-xs border-2 rounded-lg font-medium transition-all duration-150 ${
            value === o.value
              ? 'border-red-500 bg-red-50 text-red-700 shadow-sm'
              : 'border-red-200 hover:border-red-300 bg-white text-gray-700'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );

  const DepButton: React.FC<{ dep: string; label: string; description?: string }> = ({ dep, label, description }) => (
    <button
      onClick={() => toggleDep(dep)}
      className={`p-2.5 text-left border-2 rounded-lg transition-all duration-150 ${
        hasDep(dep)
          ? 'border-red-500 bg-red-50 shadow-sm'
          : 'border-gray-200 hover:border-red-300 bg-white'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className={`text-xs font-semibold ${hasDep(dep) ? 'text-red-700' : 'text-gray-700'}`}>{label}</div>
          {description && <div className="text-xs text-gray-500 mt-0.5 leading-tight">{description}</div>}
        </div>
        {hasDep(dep) && <Check className="w-3 h-3 text-red-600 flex-shrink-0 ml-1 mt-0.5" />}
      </div>
    </button>
  );

  const DepGroup: React.FC<{ title: string; icon: React.ReactNode; items: { dep: string; label: string; desc?: string }[] }> = ({ title, icon, items }) => (
    <div className="mb-4">
      <div className="flex items-center space-x-1.5 mb-2">
        <span className="text-red-500">{icon}</span>
        <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">{title}</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {items.map(({ dep, label, desc }) => (
          <DepButton key={dep} dep={dep} label={label} description={desc} />
        ))}
      </div>
    </div>
  );

  const Row: React.FC<{ children: React.ReactNode; cols?: number }> = ({ children, cols = 2 }) => (
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {children}
    </div>
  );

  const Field: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="space-y-1">{children}</div>
  );

  const depCount = (cfg.dependencies || []).length;

  // ------- DB type → default URL helper -------
  const dbDefaults: Record<string, { url: string; driver: string; username: string }> = {
    h2: { url: 'jdbc:h2:mem:testdb', driver: 'org.h2.Driver', username: 'sa' },
    postgresql: { url: 'jdbc:postgresql://localhost:5432/mydb', driver: 'org.postgresql.Driver', username: 'postgres' },
    mysql: { url: 'jdbc:mysql://localhost:3306/mydb', driver: 'com.mysql.cj.jdbc.Driver', username: 'root' },
    oracle: { url: 'jdbc:oracle:thin:@localhost:1521:xe', driver: 'oracle.jdbc.OracleDriver', username: 'system' },
    sqlserver: { url: 'jdbc:sqlserver://localhost:1433;databaseName=mydb', driver: 'com.microsoft.sqlserver.jdbc.SQLServerDriver', username: 'sa' },
    mongodb: { url: 'mongodb://localhost:27017/mydb', driver: '', username: '' },
  };

  const handleDbTypeChange = (dbType: string) => {
    const defaults = dbDefaults[dbType] || {};
    onPropertyChange('springConfig', {
      ...cfg,
      datasource: {
        ...(cfg.datasource || {}),
        dbType,
        url: defaults.url || '',
        driverClassName: defaults.driver || '',
        username: defaults.username || '',
      }
    });
  };

  return (
    <div className="bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 border border-red-200 rounded-xl p-4 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-red-100 rounded-lg">
          <Shield className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Spring Boot Configuration</h3>
          <p className="text-xs text-gray-500">
            {depCount > 0 ? `${depCount} dependencies selected` : 'Configure your Spring Boot module'}
          </p>
        </div>
      </div>

      {/* Quick Presets */}
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-red-600" />
          <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Quick Presets</span>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {Object.entries(presets).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => applyPreset(key)}
              className={`p-3 text-left border-2 rounded-lg transition-all duration-150 ${
                activePreset === key
                  ? 'border-red-500 bg-red-50 shadow-sm'
                  : 'border-red-200 hover:border-red-300 bg-white bg-opacity-80'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{preset.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900">{preset.name}</div>
                  <div className="text-xs text-gray-500">{preset.description}</div>
                </div>
                {activePreset === key && <Check className="w-4 h-4 text-red-600 flex-shrink-0" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── 1. Project Setup ─────────────────────────────── */}
      <SectionHeader id="project-setup" icon={<Coffee className="w-4 h-4" />} title="Project Setup" />
      {isOpen('project-setup') && (
        <div className="space-y-3 px-1">
          <Field>
            <Label>Build Tool</Label>
            <ButtonGroup
              value={get('project-setup', 'buildTool', 'maven')}
              onChange={(v) => set('project-setup', 'buildTool', v)}
              options={[
                { value: 'maven', label: 'Maven' },
                { value: 'gradle-groovy', label: 'Gradle (Groovy)' },
                { value: 'gradle-kotlin', label: 'Gradle (Kotlin)' },
              ]}
              cols={3}
            />
          </Field>
          <Field>
            <Label>Language</Label>
            <ButtonGroup
              value={get('project-setup', 'language', 'java')}
              onChange={(v) => set('project-setup', 'language', v)}
              options={[
                { value: 'java', label: 'Java' },
                { value: 'kotlin', label: 'Kotlin' },
                { value: 'groovy', label: 'Groovy' },
              ]}
              cols={3}
            />
          </Field>
          <Row cols={2}>
            <Field>
              <Label>Java Version</Label>
              <ButtonGroup
                value={get('project-setup', 'javaVersion', '21')}
                onChange={(v) => set('project-setup', 'javaVersion', v)}
                options={[
                  { value: '11', label: 'Java 11' },
                  { value: '17', label: 'Java 17' },
                  { value: '21', label: 'Java 21' },
                ]}
                cols={1}
              />
            </Field>
            <Field>
              <Label>Spring Boot</Label>
              <ButtonGroup
                value={get('project-setup', 'springBootVersion', '3.3.0')}
                onChange={(v) => set('project-setup', 'springBootVersion', v)}
                options={[
                  { value: '3.1.12', label: '3.1.12' },
                  { value: '3.2.8', label: '3.2.8' },
                  { value: '3.3.0', label: '3.3.0' },
                ]}
                cols={1}
              />
            </Field>
          </Row>
          <Field>
            <Label>Packaging</Label>
            <ButtonGroup
              value={get('project-setup', 'packaging', 'jar')}
              onChange={(v) => set('project-setup', 'packaging', v)}
              options={[
                { value: 'jar', label: 'JAR (Executable)' },
                { value: 'war', label: 'WAR (Deploy to server)' },
              ]}
              cols={2}
            />
          </Field>
          <Row>
            <Field>
              <Label>Group ID</Label>
              <TextInput
                value={get('project-setup', 'groupId', 'com.example')}
                onChange={(v) => set('project-setup', 'groupId', v)}
                placeholder="com.example"
                mono
              />
            </Field>
            <Field>
              <Label>Artifact ID</Label>
              <TextInput
                value={get('project-setup', 'artifactId', 'demo')}
                onChange={(v) => set('project-setup', 'artifactId', v)}
                placeholder="my-service"
                mono
              />
            </Field>
          </Row>
        </div>
      )}

      {/* ── 2. Server ────────────────────────────────────── */}
      <SectionHeader id="server" icon={<Server className="w-4 h-4" />} title="Server" />
      {isOpen('server') && (
        <div className="space-y-3 px-1">
          <Row>
            <Field>
              <Label>Port</Label>
              <TextInput
                value={get('server', 'port', '8080')}
                onChange={(v) => set('server', 'port', v)}
                placeholder="8080"
                type="number"
                mono
              />
            </Field>
            <Field>
              <Label>Context Path</Label>
              <TextInput
                value={get('server', 'contextPath', '/')}
                onChange={(v) => set('server', 'contextPath', v)}
                placeholder="/api"
                mono
              />
            </Field>
          </Row>
          <Row>
            <Field>
              <Label>Max Header Size</Label>
              <TextInput
                value={get('server', 'maxHttpHeaderSize', '8KB')}
                onChange={(v) => set('server', 'maxHttpHeaderSize', v)}
                placeholder="8KB"
                mono
              />
            </Field>
            <Field>
              <Label>Session Timeout</Label>
              <TextInput
                value={get('server', 'sessionTimeout', '30m')}
                onChange={(v) => set('server', 'sessionTimeout', v)}
                placeholder="30m"
                mono
              />
            </Field>
          </Row>
          <div className="bg-white bg-opacity-60 rounded-lg p-3 space-y-1 border border-red-100">
            <Toggle
              value={get('server', 'compressionEnabled', false)}
              onChange={(v) => set('server', 'compressionEnabled', v)}
              label="Enable Compression (Gzip)"
              description="Compress HTTP responses"
            />
            <Toggle
              value={get('server', 'sslEnabled', false)}
              onChange={(v) => set('server', 'sslEnabled', v)}
              label="Enable SSL / HTTPS"
              description="Requires keystore configuration"
            />
            <Toggle
              value={get('server', 'http2Enabled', false)}
              onChange={(v) => set('server', 'http2Enabled', v)}
              label="Enable HTTP/2"
            />
          </div>
          {get('server', 'sslEnabled', false) && (
            <div className="space-y-2 border-l-2 border-red-300 pl-3">
              <Field>
                <Label>Keystore Path</Label>
                <TextInput
                  value={get('server', 'keystorePath', '')}
                  onChange={(v) => set('server', 'keystorePath', v)}
                  placeholder="classpath:keystore.p12"
                  mono
                />
              </Field>
              <Row>
                <Field>
                  <Label>Keystore Password</Label>
                  <TextInput
                    value={get('server', 'keystorePassword', '')}
                    onChange={(v) => set('server', 'keystorePassword', v)}
                    placeholder="••••••"
                    type="password"
                  />
                </Field>
                <Field>
                  <Label>Key Alias</Label>
                  <TextInput
                    value={get('server', 'keyAlias', '')}
                    onChange={(v) => set('server', 'keyAlias', v)}
                    placeholder="myapp"
                    mono
                  />
                </Field>
              </Row>
            </div>
          )}
        </div>
      )}

      {/* ── 3. Data Source ───────────────────────────────── */}
      <SectionHeader id="datasource" icon={<Database className="w-4 h-4" />} title="Data Source" />
      {isOpen('datasource') && (
        <div className="space-y-3 px-1">
          <Field>
            <Label>Database Type</Label>
            <div className="grid grid-cols-3 gap-1.5">
              {['h2', 'postgresql', 'mysql', 'oracle', 'sqlserver', 'mongodb'].map((db) => (
                <button
                  key={db}
                  onClick={() => handleDbTypeChange(db)}
                  className={`py-2 text-xs font-medium border-2 rounded-lg transition-all duration-150 ${
                    get('datasource', 'dbType', 'h2') === db
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-red-200 hover:border-red-300 bg-white text-gray-700'
                  }`}
                >
                  {db === 'postgresql' ? 'PostgreSQL' :
                   db === 'sqlserver' ? 'SQL Server' :
                   db === 'mongodb' ? 'MongoDB' :
                   db.toUpperCase()}
                </button>
              ))}
            </div>
          </Field>
          <Field>
            <Label>JDBC / Connection URL</Label>
            <TextInput
              value={get('datasource', 'url', '')}
              onChange={(v) => set('datasource', 'url', v)}
              placeholder="jdbc:postgresql://localhost:5432/mydb"
              mono
            />
          </Field>
          <Row>
            <Field>
              <Label>Username</Label>
              <TextInput
                value={get('datasource', 'username', '')}
                onChange={(v) => set('datasource', 'username', v)}
                placeholder="postgres"
              />
            </Field>
            <Field>
              <Label>Password</Label>
              <TextInput
                value={get('datasource', 'password', '')}
                onChange={(v) => set('datasource', 'password', v)}
                placeholder="••••••"
                type="password"
              />
            </Field>
          </Row>
          <Field>
            <Label>Driver Class Name</Label>
            <TextInput
              value={get('datasource', 'driverClassName', '')}
              onChange={(v) => set('datasource', 'driverClassName', v)}
              placeholder="org.postgresql.Driver"
              mono
            />
          </Field>
          <div className="bg-white bg-opacity-60 rounded-lg p-3 border border-red-100">
            <div className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">HikariCP Connection Pool</div>
            <Row>
              <Field>
                <Label>Min Idle</Label>
                <TextInput
                  value={get('datasource', 'minIdle', '5')}
                  onChange={(v) => set('datasource', 'minIdle', v)}
                  placeholder="5"
                  type="number"
                  mono
                />
              </Field>
              <Field>
                <Label>Max Pool Size</Label>
                <TextInput
                  value={get('datasource', 'maxPoolSize', '10')}
                  onChange={(v) => set('datasource', 'maxPoolSize', v)}
                  placeholder="10"
                  type="number"
                  mono
                />
              </Field>
            </Row>
            <Row>
              <Field>
                <Label>Connection Timeout (ms)</Label>
                <TextInput
                  value={get('datasource', 'connectionTimeout', '30000')}
                  onChange={(v) => set('datasource', 'connectionTimeout', v)}
                  placeholder="30000"
                  type="number"
                  mono
                />
              </Field>
              <Field>
                <Label>Idle Timeout (ms)</Label>
                <TextInput
                  value={get('datasource', 'idleTimeout', '600000')}
                  onChange={(v) => set('datasource', 'idleTimeout', v)}
                  placeholder="600000"
                  type="number"
                  mono
                />
              </Field>
            </Row>
          </div>
        </div>
      )}

      {/* ── 4. JPA / Hibernate ───────────────────────────── */}
      <SectionHeader id="jpa" icon={<HardDrive className="w-4 h-4" />} title="JPA / Hibernate" />
      {isOpen('jpa') && (
        <div className="space-y-3 px-1">
          <Field>
            <Label>DDL Auto</Label>
            <Select
              value={get('jpa', 'ddlAuto', 'none')}
              onChange={(v) => set('jpa', 'ddlAuto', v)}
              options={[
                { value: 'none', label: 'none — No DDL changes' },
                { value: 'validate', label: 'validate — Validate schema' },
                { value: 'update', label: 'update — Update schema' },
                { value: 'create', label: 'create — Drop & create on start' },
                { value: 'create-drop', label: 'create-drop — Drop on close' },
              ]}
            />
          </Field>
          <Row>
            <Field>
              <Label>Dialect</Label>
              <Select
                value={get('jpa', 'dialect', 'auto')}
                onChange={(v) => set('jpa', 'dialect', v)}
                options={[
                  { value: 'auto', label: 'Auto-detect' },
                  { value: 'org.hibernate.dialect.PostgreSQLDialect', label: 'PostgreSQL' },
                  { value: 'org.hibernate.dialect.MySQLDialect', label: 'MySQL' },
                  { value: 'org.hibernate.dialect.H2Dialect', label: 'H2' },
                  { value: 'org.hibernate.dialect.OracleDialect', label: 'Oracle' },
                ]}
              />
            </Field>
            <Field>
              <Label>Naming Strategy</Label>
              <Select
                value={get('jpa', 'namingStrategy', 'spring')}
                onChange={(v) => set('jpa', 'namingStrategy', v)}
                options={[
                  { value: 'spring', label: 'Spring Physical (default)' },
                  { value: 'implicit', label: 'Hibernate Implicit' },
                  { value: 'ejb3', label: 'EJB3 (no underscore)' },
                ]}
              />
            </Field>
          </Row>
          <Row>
            <Field>
              <Label>Batch Size</Label>
              <TextInput
                value={get('jpa', 'batchSize', '25')}
                onChange={(v) => set('jpa', 'batchSize', v)}
                placeholder="25"
                type="number"
                mono
              />
            </Field>
            <Field>
              <Label>Fetch Size</Label>
              <TextInput
                value={get('jpa', 'fetchSize', '50')}
                onChange={(v) => set('jpa', 'fetchSize', v)}
                placeholder="50"
                type="number"
                mono
              />
            </Field>
          </Row>
          <div className="bg-white bg-opacity-60 rounded-lg p-3 space-y-1 border border-red-100">
            <Toggle
              value={get('jpa', 'showSql', false)}
              onChange={(v) => set('jpa', 'showSql', v)}
              label="Show SQL"
              description="Print generated SQL to console"
            />
            <Toggle
              value={get('jpa', 'formatSql', false)}
              onChange={(v) => set('jpa', 'formatSql', v)}
              label="Format SQL"
              description="Pretty-print SQL statements"
            />
            <Toggle
              value={get('jpa', 'openInView', false)}
              onChange={(v) => set('jpa', 'openInView', v)}
              label="Open Session in View"
              description="Keep session open during view rendering"
            />
            <Toggle
              value={get('jpa', 'secondLevelCache', false)}
              onChange={(v) => set('jpa', 'secondLevelCache', v)}
              label="Enable 2nd-Level Cache"
              description="Hibernate L2 cache (requires provider)"
            />
            <Toggle
              value={get('jpa', 'statisticsEnabled', false)}
              onChange={(v) => set('jpa', 'statisticsEnabled', v)}
              label="Hibernate Statistics"
              description="Collect query/session metrics"
            />
          </div>
        </div>
      )}

      {/* ── 5. Spring Security ───────────────────────────── */}
      <SectionHeader id="security" icon={<Lock className="w-4 h-4" />} title="Spring Security" />
      {isOpen('security') && (
        <div className="space-y-3 px-1">
          <Field>
            <Label>Authentication Type</Label>
            <ButtonGroup
              value={get('security', 'authType', 'none')}
              onChange={(v) => set('security', 'authType', v)}
              options={[
                { value: 'none', label: 'None' },
                { value: 'basic', label: 'Basic Auth' },
                { value: 'jwt', label: 'JWT' },
                { value: 'oauth2', label: 'OAuth2' },
              ]}
              cols={4}
            />
          </Field>
          {get('security', 'authType') === 'jwt' && (
            <div className="space-y-2 border-l-2 border-red-300 pl-3">
              <Field>
                <Label>JWT Secret</Label>
                <TextInput
                  value={get('security', 'jwtSecret', '')}
                  onChange={(v) => set('security', 'jwtSecret', v)}
                  placeholder="your-256-bit-secret"
                  mono
                />
              </Field>
              <Row>
                <Field>
                  <Label>Access Token Expiry (ms)</Label>
                  <TextInput
                    value={get('security', 'jwtAccessExpiry', '900000')}
                    onChange={(v) => set('security', 'jwtAccessExpiry', v)}
                    placeholder="900000"
                    type="number"
                    mono
                  />
                </Field>
                <Field>
                  <Label>Refresh Token Expiry (ms)</Label>
                  <TextInput
                    value={get('security', 'jwtRefreshExpiry', '604800000')}
                    onChange={(v) => set('security', 'jwtRefreshExpiry', v)}
                    placeholder="604800000"
                    type="number"
                    mono
                  />
                </Field>
              </Row>
            </div>
          )}
          {get('security', 'authType') === 'oauth2' && (
            <div className="space-y-2 border-l-2 border-red-300 pl-3">
              <Field>
                <Label>Provider</Label>
                <ButtonGroup
                  value={get('security', 'oauth2Provider', 'google')}
                  onChange={(v) => set('security', 'oauth2Provider', v)}
                  options={[
                    { value: 'google', label: 'Google' },
                    { value: 'github', label: 'GitHub' },
                    { value: 'okta', label: 'Okta' },
                    { value: 'keycloak', label: 'Keycloak' },
                  ]}
                  cols={4}
                />
              </Field>
              <Row>
                <Field>
                  <Label>Client ID</Label>
                  <TextInput
                    value={get('security', 'oauth2ClientId', '')}
                    onChange={(v) => set('security', 'oauth2ClientId', v)}
                    placeholder="client-id"
                    mono
                  />
                </Field>
                <Field>
                  <Label>Client Secret</Label>
                  <TextInput
                    value={get('security', 'oauth2ClientSecret', '')}
                    onChange={(v) => set('security', 'oauth2ClientSecret', v)}
                    placeholder="••••••"
                    type="password"
                  />
                </Field>
              </Row>
            </div>
          )}
          <Field>
            <Label>Session Management</Label>
            <ButtonGroup
              value={get('security', 'sessionManagement', 'if_required')}
              onChange={(v) => set('security', 'sessionManagement', v)}
              options={[
                { value: 'stateless', label: 'Stateless' },
                { value: 'if_required', label: 'If Required' },
                { value: 'always', label: 'Always' },
                { value: 'never', label: 'Never' },
              ]}
              cols={4}
            />
          </Field>
          <Field>
            <Label>Password Encoder</Label>
            <ButtonGroup
              value={get('security', 'passwordEncoder', 'bcrypt')}
              onChange={(v) => set('security', 'passwordEncoder', v)}
              options={[
                { value: 'bcrypt', label: 'BCrypt' },
                { value: 'argon2', label: 'Argon2' },
                { value: 'pbkdf2', label: 'PBKDF2' },
              ]}
              cols={3}
            />
          </Field>
          <div className="bg-white bg-opacity-60 rounded-lg p-3 border border-red-100">
            <div className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">CORS Configuration</div>
            <Toggle
              value={get('security', 'corsAllowAll', false)}
              onChange={(v) => set('security', 'corsAllowAll', v)}
              label="Allow All Origins (*)"
              description="Permissive CORS for development"
            />
            {!get('security', 'corsAllowAll', false) && (
              <Field>
                <Label>Allowed Origins (comma-separated)</Label>
                <TextInput
                  value={get('security', 'corsOrigins', '')}
                  onChange={(v) => set('security', 'corsOrigins', v)}
                  placeholder="http://localhost:3000, https://myapp.com"
                  mono
                />
              </Field>
            )}
            <Toggle
              value={get('security', 'corsAllowCredentials', false)}
              onChange={(v) => set('security', 'corsAllowCredentials', v)}
              label="Allow Credentials"
            />
          </div>
          <div className="bg-white bg-opacity-60 rounded-lg p-3 space-y-1 border border-red-100">
            <Toggle
              value={get('security', 'csrfEnabled', false)}
              onChange={(v) => set('security', 'csrfEnabled', v)}
              label="CSRF Protection"
              description="Enable CSRF tokens (disable for stateless APIs)"
            />
            <Toggle
              value={get('security', 'rememberMe', false)}
              onChange={(v) => set('security', 'rememberMe', v)}
              label="Remember Me"
              description="Persistent login cookies"
            />
          </div>
        </div>
      )}

      {/* ── 6. Logging ───────────────────────────────────── */}
      <SectionHeader id="logging" icon={<FileText className="w-4 h-4" />} title="Logging" />
      {isOpen('logging') && (
        <div className="space-y-3 px-1">
          <Field>
            <Label>Root Log Level</Label>
            <ButtonGroup
              value={get('logging', 'rootLevel', 'INFO')}
              onChange={(v) => set('logging', 'rootLevel', v)}
              options={[
                { value: 'TRACE', label: 'TRACE' },
                { value: 'DEBUG', label: 'DEBUG' },
                { value: 'INFO', label: 'INFO' },
                { value: 'WARN', label: 'WARN' },
                { value: 'ERROR', label: 'ERROR' },
              ]}
              cols={5}
            />
          </Field>
          <div className="space-y-2">
            <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">Package Log Levels</div>
            {(['org.springframework.web', 'org.hibernate.SQL', 'org.springframework.security'].map((pkg) => (
              <div key={pkg} className="flex items-center space-x-2">
                <code className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded flex-1 truncate">{pkg}</code>
                <select
                  value={get('logging', `level.${pkg}`, 'INFO')}
                  onChange={(e) => set('logging', `level.${pkg}`, e.target.value)}
                  className="text-xs border border-red-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-red-400 w-24"
                >
                  {['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'OFF'].map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            )))}
          </div>
          <Row>
            <Field>
              <Label>Log File Path</Label>
              <TextInput
                value={get('logging', 'filePath', '')}
                onChange={(v) => set('logging', 'filePath', v)}
                placeholder="logs/app.log"
                mono
              />
            </Field>
            <Field>
              <Label>Max File Size</Label>
              <TextInput
                value={get('logging', 'maxFileSize', '10MB')}
                onChange={(v) => set('logging', 'maxFileSize', v)}
                placeholder="10MB"
                mono
              />
            </Field>
          </Row>
          <Toggle
            value={get('logging', 'jsonFormat', false)}
            onChange={(v) => set('logging', 'jsonFormat', v)}
            label="JSON Log Format"
            description="Structured JSON output (for log aggregators)"
          />
        </div>
      )}

      {/* ── 7. Actuator ──────────────────────────────────── */}
      <SectionHeader id="actuator" icon={<Activity className="w-4 h-4" />} title="Actuator & Observability" />
      {isOpen('actuator') && (
        <div className="space-y-3 px-1">
          <Toggle
            value={get('actuator', 'enabled', false)}
            onChange={(v) => set('actuator', 'enabled', v)}
            label="Enable Spring Actuator"
            description="Exposes management endpoints"
          />
          {get('actuator', 'enabled', false) && (
            <>
              <Field>
                <Label>Management Port</Label>
                <TextInput
                  value={get('actuator', 'managementPort', '8081')}
                  onChange={(v) => set('actuator', 'managementPort', v)}
                  placeholder="8081"
                  type="number"
                  mono
                />
              </Field>
              <Field>
                <Label>Exposed Endpoints</Label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['health', 'info', 'metrics', 'env', 'beans', 'loggers', 'heapdump', 'threaddump', 'prometheus'].map((ep) => {
                    const endpoints: string[] = get('actuator', 'endpoints', ['health', 'info']) || [];
                    const active = endpoints.includes(ep);
                    return (
                      <button
                        key={ep}
                        onClick={() => {
                          const next = active
                            ? endpoints.filter((e) => e !== ep)
                            : [...endpoints, ep];
                          set('actuator', 'endpoints', next);
                        }}
                        className={`py-1.5 text-xs font-medium border-2 rounded-lg transition-all ${
                          active
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-200 hover:border-red-300 bg-white text-gray-600'
                        }`}
                      >
                        /{ep}
                      </button>
                    );
                  })}
                </div>
              </Field>
              <Field>
                <Label>Health Show Details</Label>
                <ButtonGroup
                  value={get('actuator', 'healthDetails', 'never')}
                  onChange={(v) => set('actuator', 'healthDetails', v)}
                  options={[
                    { value: 'never', label: 'Never' },
                    { value: 'when-authorized', label: 'Authorized' },
                    { value: 'always', label: 'Always' },
                  ]}
                  cols={3}
                />
              </Field>
            </>
          )}
        </div>
      )}

      {/* ── 8. Caching ───────────────────────────────────── */}
      <SectionHeader id="caching" icon={<Zap className="w-4 h-4" />} title="Caching" />
      {isOpen('caching') && (
        <div className="space-y-3 px-1">
          <Field>
            <Label>Cache Provider</Label>
            <ButtonGroup
              value={get('caching', 'type', 'none')}
              onChange={(v) => set('caching', 'type', v)}
              options={[
                { value: 'none', label: 'None' },
                { value: 'simple', label: 'Simple (in-memory)' },
                { value: 'caffeine', label: 'Caffeine' },
                { value: 'redis', label: 'Redis' },
                { value: 'ehcache', label: 'EhCache' },
              ]}
              cols={3}
            />
          </Field>
          {get('caching', 'type') === 'redis' && (
            <div className="space-y-2 border-l-2 border-red-300 pl-3">
              <Row>
                <Field>
                  <Label>Redis Host</Label>
                  <TextInput
                    value={get('caching', 'redisHost', 'localhost')}
                    onChange={(v) => set('caching', 'redisHost', v)}
                    placeholder="localhost"
                    mono
                  />
                </Field>
                <Field>
                  <Label>Redis Port</Label>
                  <TextInput
                    value={get('caching', 'redisPort', '6379')}
                    onChange={(v) => set('caching', 'redisPort', v)}
                    placeholder="6379"
                    type="number"
                    mono
                  />
                </Field>
              </Row>
              <Row>
                <Field>
                  <Label>TTL (seconds)</Label>
                  <TextInput
                    value={get('caching', 'redisTtl', '3600')}
                    onChange={(v) => set('caching', 'redisTtl', v)}
                    placeholder="3600"
                    type="number"
                    mono
                  />
                </Field>
                <Field>
                  <Label>Password</Label>
                  <TextInput
                    value={get('caching', 'redisPassword', '')}
                    onChange={(v) => set('caching', 'redisPassword', v)}
                    placeholder="••••••"
                    type="password"
                  />
                </Field>
              </Row>
            </div>
          )}
          {get('caching', 'type') === 'caffeine' && (
            <Field>
              <Label>Caffeine Spec</Label>
              <TextInput
                value={get('caching', 'caffeineSpec', 'maximumSize=500,expireAfterWrite=600s')}
                onChange={(v) => set('caching', 'caffeineSpec', v)}
                placeholder="maximumSize=500,expireAfterWrite=600s"
                mono
              />
            </Field>
          )}
        </div>
      )}

      {/* ── 9. Spring Profiles ───────────────────────────── */}
      <SectionHeader id="profiles" icon={<GitBranch className="w-4 h-4" />} title="Spring Profiles" />
      {isOpen('profiles') && (
        <div className="space-y-3 px-1">
          <Field>
            <Label>Active Profiles</Label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(get('profiles', 'active', []) as string[]).map((profile: string) => (
                <span
                  key={profile}
                  className="flex items-center space-x-1 bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded-full"
                >
                  <span>{profile}</span>
                  <button
                    onClick={() => {
                      const current: string[] = get('profiles', 'active', []);
                      set('profiles', 'active', current.filter((p) => p !== profile));
                    }}
                    className="ml-1 hover:text-red-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {['dev', 'staging', 'prod', 'test', 'local', 'docker'].map((profile) => {
                const active: string[] = get('profiles', 'active', []);
                const isActive = active.includes(profile);
                return (
                  <button
                    key={profile}
                    onClick={() => {
                      const next = isActive
                        ? active.filter((p) => p !== profile)
                        : [...active, profile];
                      set('profiles', 'active', next);
                    }}
                    className={`py-1.5 text-xs font-medium border-2 rounded-lg transition-all ${
                      isActive
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-red-300 bg-white text-gray-600'
                    }`}
                  >
                    {profile}
                  </button>
                );
              })}
            </div>
          </Field>
          <div className="bg-white bg-opacity-60 rounded-lg p-3 space-y-1 border border-red-100">
            <Toggle
              value={get('profiles', 'separateConfigFiles', false)}
              onChange={(v) => set('profiles', 'separateConfigFiles', v)}
              label="Separate Config Files per Profile"
              description="Generate application-{profile}.yml files"
            />
          </div>
        </div>
      )}

      {/* ── 10. Dependencies ─────────────────────────────── */}
      <SectionHeader
        id="dependencies"
        icon={<Package className="w-4 h-4" />}
        title="Dependencies"
        badge={depCount > 0 ? `${depCount} selected` : undefined}
      />
      {isOpen('dependencies') && (
        <div className="px-1">
          <DepGroup title="Web" icon={<Globe className="w-3 h-3" />} items={[
            { dep: 'web', label: 'Spring Web', desc: 'MVC, Tomcat' },
            { dep: 'webflux', label: 'WebFlux', desc: 'Reactive, Netty' },
            { dep: 'graphql', label: 'GraphQL', desc: 'Spring for GraphQL' },
            { dep: 'websocket', label: 'WebSocket', desc: 'STOMP & SockJS' },
            { dep: 'hateoas', label: 'HATEOAS', desc: 'Hypermedia APIs' },
            { dep: 'rsocket', label: 'RSocket', desc: 'Reactive streams' },
          ]} />

          <DepGroup title="Data" icon={<Database className="w-3 h-3" />} items={[
            { dep: 'data-jpa', label: 'Spring Data JPA', desc: 'Hibernate ORM' },
            { dep: 'data-r2dbc', label: 'Spring Data R2DBC', desc: 'Reactive SQL' },
            { dep: 'data-mongodb', label: 'Spring Data MongoDB' },
            { dep: 'data-redis', label: 'Spring Data Redis' },
            { dep: 'data-elasticsearch', label: 'Spring Data ES' },
            { dep: 'data-cassandra', label: 'Spring Data Cassandra' },
            { dep: 'jooq', label: 'jOOQ', desc: 'Type-safe SQL DSL' },
            { dep: 'mybatis', label: 'MyBatis', desc: 'SQL mapper framework' },
            { dep: 'flyway', label: 'Flyway', desc: 'DB migrations' },
            { dep: 'liquibase', label: 'Liquibase', desc: 'DB changelog' },
            { dep: 'h2', label: 'H2 Database', desc: 'In-memory DB' },
            { dep: 'postgresql', label: 'PostgreSQL Driver' },
            { dep: 'mysql', label: 'MySQL Driver' },
            { dep: 'r2dbc-postgresql', label: 'R2DBC PostgreSQL' },
          ]} />

          <DepGroup title="Security" icon={<Lock className="w-3 h-3" />} items={[
            { dep: 'security', label: 'Spring Security' },
            { dep: 'oauth2-client', label: 'OAuth2 Client', desc: 'Login with OAuth2' },
            { dep: 'oauth2-resource-server', label: 'Resource Server', desc: 'JWT bearer tokens' },
          ]} />

          <DepGroup title="Messaging" icon={<Bell className="w-3 h-3" />} items={[
            { dep: 'kafka', label: 'Apache Kafka', desc: 'Spring Kafka' },
            { dep: 'rabbitmq', label: 'RabbitMQ', desc: 'Spring AMQP' },
            { dep: 'activemq', label: 'ActiveMQ', desc: 'JMS broker' },
            { dep: 'artemis', label: 'ActiveMQ Artemis' },
          ]} />

          <DepGroup title="Cloud" icon={<Layers className="w-3 h-3" />} items={[
            { dep: 'cloud-eureka', label: 'Eureka Client', desc: 'Service discovery' },
            { dep: 'cloud-config-client', label: 'Config Client', desc: 'External config' },
            { dep: 'cloud-gateway', label: 'Gateway', desc: 'API Gateway' },
            { dep: 'cloud-loadbalancer', label: 'Load Balancer', desc: 'Client-side LB' },
            { dep: 'cloud-feign', label: 'OpenFeign', desc: 'Declarative HTTP client' },
            { dep: 'cloud-sleuth', label: 'Sleuth', desc: 'Distributed tracing' },
          ]} />

          <DepGroup title="Observability" icon={<Activity className="w-3 h-3" />} items={[
            { dep: 'actuator', label: 'Actuator', desc: 'Health & metrics' },
            { dep: 'micrometer-prometheus', label: 'Prometheus', desc: 'Metrics export' },
            { dep: 'zipkin', label: 'Zipkin', desc: 'Distributed tracing' },
            { dep: 'opentelemetry', label: 'OpenTelemetry', desc: 'OTEL tracing' },
          ]} />

          <DepGroup title="Developer Tools" icon={<Code className="w-3 h-3" />} items={[
            { dep: 'devtools', label: 'DevTools', desc: 'Hot reload' },
            { dep: 'lombok', label: 'Lombok', desc: 'Boilerplate reduction' },
            { dep: 'mapstruct', label: 'MapStruct', desc: 'Bean mapping' },
            { dep: 'validation', label: 'Validation', desc: 'Jakarta Bean Validation' },
            { dep: 'configuration-processor', label: 'Config Processor', desc: '@ConfigurationProperties' },
            { dep: 'testcontainers', label: 'Testcontainers', desc: 'Integration tests' },
            { dep: 'rest-assured', label: 'REST Assured', desc: 'API testing DSL' },
          ]} />
        </div>
      )}

      {/* ── 11. Custom Properties ────────────────────────── */}
      <SectionHeader id="custom-props" icon={<RefreshCw className="w-4 h-4" />} title="Custom application.yml Snippet" />
      {isOpen('custom-props') && (
        <div className="px-1 space-y-2">
          <p className="text-xs text-gray-500">Add raw YAML properties to be merged into the generated <code className="bg-gray-100 px-1 rounded">application.yml</code>.</p>
          <textarea
            value={get('customProps', 'yaml', '')}
            onChange={(e) => set('customProps', 'yaml', e.target.value)}
            rows={8}
            placeholder={`# Custom properties\napp:\n  feature-flag: true\n  api-key: \${API_KEY}`}
            className="w-full px-3 py-2 text-xs font-mono border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 bg-white resize-y"
          />
        </div>
      )}
    </div>
  );
};

export default SpringBootConfiguration;
