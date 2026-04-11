// ─────────────────────────────────────────────────────────────────────────────
// Module File Generator
// Produces a typed file-tree for each supported technology.
// ─────────────────────────────────────────────────────────────────────────────

export interface FileNode {
  kind: 'file';
  name: string;
  path: string;
  content: string;
  language: string;
}

export interface FolderNode {
  kind: 'folder';
  name: string;
  path: string;
  children: TreeNode[];
}

export type TreeNode = FileNode | FolderNode;

// ── Language detection ────────────────────────────────────────────────────────

export function getLanguageFromPath(filePath: string): string {
  const name = filePath.split('/').pop() || '';
  if (name === 'Dockerfile' || name.startsWith('Dockerfile.')) return 'dockerfile';
  if (name === 'Makefile') return 'makefile';

  const ext = name.includes('.') ? name.split('.').pop()!.toLowerCase() : '';
  const map: Record<string, string> = {
    ts: 'typescript',  tsx: 'typescript',
    js: 'javascript',  jsx: 'javascript',  mjs: 'javascript',  cjs: 'javascript',
    json: 'json',
    html: 'html',      htm: 'html',
    css: 'css',        scss: 'scss',       less: 'less',
    md: 'markdown',    mdx: 'markdown',
    py: 'python',
    java: 'java',      kt: 'kotlin',
    xml: 'xml',
    yaml: 'yaml',      yml: 'yaml',
    sh: 'shell',       bash: 'shell',
    sql: 'sql',
    go: 'go',
    rb: 'ruby',
    php: 'php',
    toml: 'ini',       ini: 'ini',         properties: 'ini',
    vue: 'html',
    svelte: 'html',
    graphql: 'graphql', gql: 'graphql',
    rs: 'rust',        swift: 'swift',
    cs: 'csharp',
  };
  return map[ext] || 'plaintext';
}

// ── Flat entry → tree builder ─────────────────────────────────────────────────

interface Entry { path: string; content: string }

function buildTree(rootName: string, entries: Entry[]): FolderNode {
  const root: FolderNode = { kind: 'folder', name: rootName, path: rootName, children: [] };

  for (const { path, content } of entries) {
    const parts = path.split('/');
    let cur: FolderNode = root;

    for (let i = 0; i < parts.length - 1; i++) {
      const dirName = parts[i];
      const dirPath = `${rootName}/${parts.slice(0, i + 1).join('/')}`;
      let dir = cur.children.find(c => c.kind === 'folder' && c.name === dirName) as FolderNode | undefined;
      if (!dir) {
        dir = { kind: 'folder', name: dirName, path: dirPath, children: [] };
        cur.children.push(dir);
      }
      cur = dir;
    }

    const fileName = parts[parts.length - 1];
    cur.children.push({
      kind: 'file',
      name: fileName,
      path: `${rootName}/${path}`,
      content,
      language: getLanguageFromPath(fileName),
    });
  }
  return root;
}

// ── Per-tech entry generators ─────────────────────────────────────────────────

function reactEntries(name: string, desc: string): Entry[] {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  return [
    { path: 'package.json', content: JSON.stringify({
      name: slug, version: '0.1.0', private: true,
      scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview', 'type-check': 'tsc --noEmit' },
      dependencies: { react: '^18.3.0', 'react-dom': '^18.3.0', 'react-router-dom': '^6.23.0' },
      devDependencies: { '@types/react': '^18.3.0', '@types/react-dom': '^18.3.0', '@vitejs/plugin-react': '^4.3.0', typescript: '^5.4.0', vite: '^5.3.0' },
    }, null, 2) },
    { path: 'index.html', content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${name}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>` },
    { path: 'vite.config.ts', content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
  resolve: { alias: { '@': '/src' } },
})` },
    { path: 'tsconfig.json', content: JSON.stringify({
      compilerOptions: { target: 'ES2020', lib: ['ES2020', 'DOM', 'DOM.Iterable'], module: 'ESNext', skipLibCheck: true, moduleResolution: 'bundler', allowImportingTsExtensions: true, isolatedModules: true, noEmit: true, jsx: 'react-jsx', strict: true, baseUrl: '.', paths: { '@/*': ['src/*'] } },
      include: ['src'],
    }, null, 2) },
    { path: '.env.example', content: `VITE_API_URL=http://localhost:8000\nVITE_APP_NAME=${name}` },
    { path: '.gitignore', content: 'node_modules\ndist\n.env\n.env.local\n*.log\n.DS_Store' },
    { path: 'src/main.tsx', content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)` },
    { path: 'src/App.tsx', content: `import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  )
}` },
    { path: 'src/index.css', content: `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: Inter, system-ui, sans-serif;
  background: #f9fafb;
  color: #1f2937;
  line-height: 1.6;
}` },
    { path: 'src/pages/HomePage.tsx', content: `export default function HomePage() {
  return (
    <main className="container">
      <h1>${name}</h1>
      <p>${desc || 'Welcome to your React application.'}</p>
    </main>
  )
}` },
    { path: 'src/components/.gitkeep', content: '' },
    { path: 'src/hooks/.gitkeep', content: '' },
    { path: 'src/utils/cn.ts', content: `// Utility: merge class names
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}` },
    { path: 'src/types/index.ts', content: `// Global type definitions
export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}` },
  ];
}

function nextjsEntries(name: string, desc: string): Entry[] {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  return [
    { path: 'package.json', content: JSON.stringify({
      name: slug, version: '0.1.0', private: true,
      scripts: { dev: 'next dev', build: 'next build', start: 'next start', lint: 'next lint' },
      dependencies: { next: '^14.2.0', react: '^18.3.0', 'react-dom': '^18.3.0' },
      devDependencies: { '@types/node': '^20', '@types/react': '^18', '@types/react-dom': '^18', typescript: '^5', eslint: '^8', 'eslint-config-next': '^14.2.0' },
    }, null, 2) },
    { path: 'next.config.js', content: `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { domains: [] },
}

module.exports = nextConfig` },
    { path: 'tsconfig.json', content: JSON.stringify({
      compilerOptions: { target: 'es5', lib: ['dom', 'dom.iterable', 'esnext'], allowJs: true, skipLibCheck: true, strict: true, noEmit: true, esModuleInterop: true, module: 'esnext', moduleResolution: 'bundler', resolveJsonModule: true, isolatedModules: true, jsx: 'preserve', incremental: true, plugins: [{ name: 'next' }], paths: { '@/*': ['./src/*'] } },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules'],
    }, null, 2) },
    { path: '.env.local.example', content: `# Rename to .env.local
DATABASE_URL=postgresql://user:pass@localhost:5432/db
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000` },
    { path: '.gitignore', content: '.next\nnode_modules\n.env.local\ndist\n*.log' },
    { path: 'src/app/layout.tsx', content: `import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '${name}',
  description: '${desc || 'Built with Next.js'}',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}` },
    { path: 'src/app/page.tsx', content: `export default function Home() {
  return (
    <main>
      <h1>${name}</h1>
      <p>${desc || 'Welcome to your Next.js app.'}</p>
    </main>
  )
}` },
    { path: 'src/app/globals.css', content: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Inter, system-ui, sans-serif; }` },
    { path: 'src/app/api/health/route.ts', content: `import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
}` },
    { path: 'src/lib/utils.ts', content: `export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}` },
  ];
}

function vueEntries(name: string, desc: string): Entry[] {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  return [
    { path: 'package.json', content: JSON.stringify({
      name: slug, version: '0.0.0', private: true,
      scripts: { dev: 'vite', build: 'vue-tsc && vite build', preview: 'vite preview' },
      dependencies: { vue: '^3.4.0', 'vue-router': '^4.3.0', pinia: '^2.1.7' },
      devDependencies: { '@vitejs/plugin-vue': '^5.1.0', '@vue/tsconfig': '^0.5.1', typescript: '^5.4.0', vite: '^5.3.0', 'vue-tsc': '^2.0.29' },
    }, null, 2) },
    { path: 'index.html', content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${name}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>` },
    { path: 'vite.config.ts', content: `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { '@': '/src' } },
})` },
    { path: 'src/main.ts', content: `import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

createApp(App).use(createPinia()).use(router).mount('#app')` },
    { path: 'src/App.vue', content: `<template>
  <router-view />
</template>

<script setup lang="ts">
// Root app component
</script>` },
    { path: 'src/style.css', content: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: Inter, system-ui, sans-serif; background: #f9fafb; color: #1f2937; }` },
    { path: 'src/router/index.ts', content: `import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [{ path: '/', name: 'home', component: HomeView }],
})

export default router` },
    { path: 'src/views/HomeView.vue', content: `<template>
  <main class="hero">
    <h1>${name}</h1>
    <p>${desc || 'Welcome to your Vue application.'}</p>
  </main>
</template>

<script setup lang="ts">
// Home view
</script>

<style scoped>
.hero { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; gap: 1rem; }
</style>` },
    { path: 'src/stores/app.ts', content: `import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({ count: 0 }),
  actions: {
    increment() { this.count++ },
  },
})` },
    { path: 'src/components/.gitkeep', content: '' },
  ];
}

function expressEntries(name: string, desc: string): Entry[] {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  return [
    { path: 'package.json', content: JSON.stringify({
      name: slug, version: '1.0.0', description: desc || 'Express API',
      main: 'dist/index.js',
      scripts: { dev: 'ts-node-dev --respawn src/index.ts', build: 'tsc', start: 'node dist/index.js', lint: 'eslint src/**/*.ts' },
      dependencies: { express: '^4.19.0', cors: '^2.8.5', dotenv: '^16.4.0', helmet: '^7.1.0', 'express-rate-limit': '^7.3.0' },
      devDependencies: { '@types/express': '^4.17.21', '@types/cors': '^2.8.17', '@types/node': '^20', typescript: '^5.4.0', 'ts-node-dev': '^2.0.0' },
    }, null, 2) },
    { path: 'tsconfig.json', content: JSON.stringify({
      compilerOptions: { target: 'ES2020', module: 'commonjs', lib: ['ES2020'], outDir: './dist', rootDir: './src', strict: true, esModuleInterop: true, skipLibCheck: true, resolveJsonModule: true },
      include: ['src/**/*'],
    }, null, 2) },
    { path: '.env.example', content: `PORT=3000\nNODE_ENV=development\nDATABASE_URL=postgresql://user:pass@localhost:5432/db\nJWT_SECRET=your-secret-key\nCORS_ORIGIN=http://localhost:5173` },
    { path: '.gitignore', content: 'node_modules\ndist\n.env\n*.log\n.DS_Store' },
    { path: 'src/index.ts', content: `import dotenv from 'dotenv'
dotenv.config()

import app from './app'

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(\`🚀 Server running on http://localhost:\${PORT}\`)
  console.log(\`📖 Environment: \${process.env.NODE_ENV || 'development'}\`)
})` },
    { path: 'src/app.ts', content: `import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import apiRouter from './routes/api'
import { errorHandler } from './middleware/errorHandler'
import { requestLogger } from './middleware/requestLogger'

const app = express()

app.use(helmet())
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))
app.use(express.json({ limit: '10mb' }))
app.use(requestLogger)

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })
app.use(limiter)

app.get('/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }))
app.use('/api', apiRouter)
app.use(errorHandler)

export default app` },
    { path: 'src/routes/api.ts', content: `import { Router } from 'express'

const router = Router()

router.get('/', (_req, res) => {
  res.json({ message: 'API is running', version: '1.0.0' })
})

// Add more routes here:
// router.use('/users', usersRouter)

export default router` },
    { path: 'src/middleware/errorHandler.ts', content: `import { Request, Response, NextFunction } from 'express'

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export function errorHandler(err: AppError, _req: Request, res: Response, _next: NextFunction) {
  const status = err.statusCode || 500
  const message = err.isOperational ? err.message : 'Internal Server Error'
  console.error('[Error]', err.stack)
  res.status(status).json({ success: false, message })
}` },
    { path: 'src/middleware/requestLogger.ts', content: `import { Request, Response, NextFunction } from 'express'

export function requestLogger(req: Request, _res: Response, next: NextFunction) {
  console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.path}\`)
  next()
}` },
    { path: 'src/types/index.ts', content: `export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  errors?: string[]
}` },
    { path: 'src/utils/response.ts', content: `import { Response } from 'express'
import { ApiResponse } from '../types'

export function ok<T>(res: Response, data: T, message = 'Success') {
  return res.json({ success: true, data, message } satisfies ApiResponse<T>)
}

export function fail(res: Response, message: string, status = 400) {
  return res.status(status).json({ success: false, message } satisfies ApiResponse)
}` },
  ];
}

function fastapiEntries(name: string, desc: string): Entry[] {
  return [
    { path: 'requirements.txt', content: `fastapi>=0.111.0
uvicorn[standard]>=0.30.0
pydantic>=2.7.0
pydantic-settings>=2.3.0
python-dotenv>=1.0.1
httpx>=0.27.0
sqlalchemy>=2.0.30
alembic>=1.13.1` },
    { path: 'main.py', content: `from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.router import api_router

app = FastAPI(
    title="${name}",
    description="${desc || 'FastAPI application'}",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0"}` },
    { path: '.env.example', content: `APP_NAME=${name}\nDEBUG=true\nDATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/db\nSECRET_KEY=your-secret-key\nCORS_ORIGINS=["http://localhost:3000"]` },
    { path: '.gitignore', content: '__pycache__\n*.pyc\n*.pyo\n.env\nvenv\n.venv\n*.egg-info\ndist\nbuild' },
    { path: 'app/__init__.py', content: '' },
    { path: 'app/core/__init__.py', content: '' },
    { path: 'app/core/config.py', content: `from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    APP_NAME: str = "${name}"
    DEBUG: bool = False
    DATABASE_URL: str = "sqlite+aiosqlite:///./app.db"
    SECRET_KEY: str = "change-me-in-production"
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"

settings = Settings()` },
    { path: 'app/core/database.py', content: `from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=settings.DEBUG)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise` },
    { path: 'app/api/__init__.py', content: '' },
    { path: 'app/api/v1/__init__.py', content: '' },
    { path: 'app/api/v1/router.py', content: `from fastapi import APIRouter
from app.api.v1.endpoints import items

api_router = APIRouter()
api_router.include_router(items.router, prefix="/items", tags=["items"])` },
    { path: 'app/api/v1/endpoints/__init__.py', content: '' },
    { path: 'app/api/v1/endpoints/items.py', content: `from fastapi import APIRouter, HTTPException
from app.schemas.item import ItemCreate, ItemRead, ItemUpdate

router = APIRouter()
_items: dict[int, dict] = {}
_counter = 0

@router.get("/", response_model=list[ItemRead])
async def list_items():
    return list(_items.values())

@router.post("/", response_model=ItemRead, status_code=201)
async def create_item(body: ItemCreate):
    global _counter
    _counter += 1
    item = {"id": _counter, **body.model_dump()}
    _items[_counter] = item
    return item

@router.get("/{item_id}", response_model=ItemRead)
async def get_item(item_id: int):
    if item_id not in _items:
        raise HTTPException(status_code=404, detail="Item not found")
    return _items[item_id]

@router.delete("/{item_id}", status_code=204)
async def delete_item(item_id: int):
    _items.pop(item_id, None)` },
    { path: 'app/schemas/__init__.py', content: '' },
    { path: 'app/schemas/item.py', content: `from pydantic import BaseModel

class ItemCreate(BaseModel):
    name: str
    description: str | None = None

class ItemUpdate(BaseModel):
    name: str | None = None
    description: str | None = None

class ItemRead(ItemCreate):
    id: int` },
    { path: 'app/models/__init__.py', content: '' },
    { path: 'app/models/item.py', content: `from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class Item(Base):
    __tablename__ = "items"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text)` },
  ];
}

function djangoEntries(name: string, _desc: string): Entry[] {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  return [
    { path: 'requirements.txt', content: `Django>=5.0.0
djangorestframework>=3.15.0
django-cors-headers>=4.4.0
python-dotenv>=1.0.1
psycopg2-binary>=2.9.9
Pillow>=10.3.0
drf-spectacular>=0.27.2` },
    { path: 'manage.py', content: `#!/usr/bin/env python
import os
import sys

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', '${slug}.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError("Couldn't import Django.") from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()` },
    { path: '.env.example', content: `SECRET_KEY=django-insecure-change-me\nDEBUG=True\nALLOWED_HOSTS=localhost,127.0.0.1\nDATABASE_URL=postgresql://user:pass@localhost:5432/db` },
    { path: '.gitignore', content: '__pycache__\n*.pyc\n*.pyo\n.env\nvenv\n.venv\n*.sqlite3\nmedia\nstatic\n*.log' },
    { path: `${slug}/settings.py`, content: `import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-dev-only')
DEBUG = os.getenv('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'drf_spectacular',
    'api',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
]

ROOT_URLCONF = '${slug}.urls'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

CORS_ALLOW_ALL_ORIGINS = DEBUG` },
    { path: `${slug}/urls.py`, content: `from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]` },
    { path: 'api/__init__.py', content: '' },
    { path: 'api/models.py', content: `from django.db import models

class Item(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name` },
    { path: 'api/serializers.py', content: `from rest_framework import serializers
from .models import Item

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')` },
    { path: 'api/views.py', content: `from rest_framework import viewsets
from .models import Item
from .serializers import ItemSerializer

class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all().order_by('-created_at')
    serializer_class = ItemSerializer` },
    { path: 'api/urls.py', content: `from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ItemViewSet

router = DefaultRouter()
router.register(r'items', ItemViewSet)

urlpatterns = [path('', include(router.urls))]` },
  ];
}

function springEntries(name: string, desc: string): Entry[] {
  const slug = name.toLowerCase().replace(/[\s-]+/g, '');
  return [
    { path: 'pom.xml', content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.3.0</version>
  </parent>
  <groupId>com.example</groupId>
  <artifactId>${slug}</artifactId>
  <version>0.0.1-SNAPSHOT</version>
  <name>${name}</name>
  <description>${desc || 'Spring Boot Application'}</description>
  <properties>
    <java.version>21</java.version>
  </properties>
  <dependencies>
    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-web</artifactId></dependency>
    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-data-jpa</artifactId></dependency>
    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-validation</artifactId></dependency>
    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-actuator</artifactId></dependency>
    <dependency><groupId>org.projectlombok</groupId><artifactId>lombok</artifactId><optional>true</optional></dependency>
    <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-test</artifactId><scope>test</scope></dependency>
  </dependencies>
  <build>
    <plugins>
      <plugin><groupId>org.springframework.boot</groupId><artifactId>spring-boot-maven-plugin</artifactId></plugin>
    </plugins>
  </build>
</project>` },
    { path: 'src/main/java/com/example/Application.java', content: `package com.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}` },
    { path: 'src/main/java/com/example/controller/ItemController.java', content: `package com.example.controller;

import com.example.model.Item;
import com.example.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {
    private final ItemService itemService;

    @GetMapping
    public List<Item> getAll() { return itemService.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Item> getById(@PathVariable Long id) {
        return itemService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Item> create(@RequestBody Item item) {
        return ResponseEntity.ok(itemService.save(item));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        itemService.delete(id);
        return ResponseEntity.noContent().build();
    }
}` },
    { path: 'src/main/java/com/example/model/Item.java', content: `package com.example.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "items")
@Data
public class Item {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
}` },
    { path: 'src/main/java/com/example/service/ItemService.java', content: `package com.example.service;

import com.example.model.Item;
import com.example.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ItemService {
    private final ItemRepository repository;

    public List<Item> findAll() { return repository.findAll(); }
    public Optional<Item> findById(Long id) { return repository.findById(id); }
    public Item save(Item item) { return repository.save(item); }
    public void delete(Long id) { repository.deleteById(id); }
}` },
    { path: 'src/main/java/com/example/repository/ItemRepository.java', content: `package com.example.repository;

import com.example.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {}` },
    { path: 'src/main/resources/application.properties', content: `spring.application.name=${name}
server.port=8080
spring.datasource.url=jdbc:postgresql://localhost:5432/db
spring.datasource.username=postgres
spring.datasource.password=password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
management.endpoints.web.exposure.include=health,info` },
    { path: 'src/test/java/com/example/ApplicationTests.java', content: `package com.example;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class ApplicationTests {
    @Test
    void contextLoads() {}
}` },
  ];
}

function mongodbEntries(name: string, desc: string): Entry[] {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  return [
    { path: 'package.json', content: JSON.stringify({
      name: slug, version: '1.0.0', description: desc || 'MongoDB service',
      scripts: { dev: 'ts-node-dev --respawn src/index.ts', build: 'tsc', start: 'node dist/index.ts' },
      dependencies: { mongoose: '^8.5.0', dotenv: '^16.4.0', express: '^4.19.0' },
      devDependencies: { '@types/node': '^20', '@types/mongoose': '^5.11.97', typescript: '^5.4.0', 'ts-node-dev': '^2.0.0' },
    }, null, 2) },
    { path: 'tsconfig.json', content: JSON.stringify({ compilerOptions: { target: 'ES2020', module: 'commonjs', outDir: './dist', rootDir: './src', strict: true, esModuleInterop: true, skipLibCheck: true }, include: ['src'] }, null, 2) },
    { path: '.env.example', content: `MONGODB_URI=mongodb://localhost:27017/${slug}\nMONGODB_DB_NAME=${slug}` },
    { path: '.gitignore', content: 'node_modules\ndist\n.env\n*.log' },
    { path: 'src/db.ts', content: `import mongoose from 'mongoose'

export async function connectDB(uri: string): Promise<void> {
  try {
    await mongoose.connect(uri)
    console.log('✅ MongoDB connected:', uri)

    mongoose.connection.on('error', (err) => console.error('MongoDB error:', err))
    mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'))
  } catch (err) {
    console.error('MongoDB connection failed:', err)
    process.exit(1)
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect()
}` },
    { path: 'src/models/user.model.ts', content: `import { Schema, model, Document } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  passwordHash: string
  role: 'user' | 'admin'
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role:         { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true })

userSchema.index({ email: 1 })

export const User = model<IUser>('User', userSchema)` },
    { path: 'src/models/index.ts', content: `export * from './user.model'` },
    { path: 'src/index.ts', content: `import dotenv from 'dotenv'
dotenv.config()

import { connectDB } from './db'
import { User } from './models'

async function main() {
  await connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/${slug}')

  // Example: create and query
  const user = await User.create({ name: 'Alice', email: 'alice@example.com', passwordHash: 'hashed' })
  console.log('Created:', user)

  const all = await User.find()
  console.log('All users:', all.length)
}

main().catch(console.error)` },
  ];
}

function postgresqlEntries(name: string, desc: string): Entry[] {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  return [
    { path: 'package.json', content: JSON.stringify({
      name: slug, version: '1.0.0', description: desc || 'PostgreSQL service',
      scripts: { dev: 'ts-node-dev --respawn src/index.ts', build: 'tsc', start: 'node dist/index.js', migrate: 'node -r ts-node/register src/migrations/run.ts' },
      dependencies: { pg: '^8.12.0', dotenv: '^16.4.0' },
      devDependencies: { '@types/node': '^20', '@types/pg': '^8.11.6', typescript: '^5.4.0', 'ts-node-dev': '^2.0.0', 'ts-node': '^10.9.2' },
    }, null, 2) },
    { path: 'tsconfig.json', content: JSON.stringify({ compilerOptions: { target: 'ES2020', module: 'commonjs', outDir: './dist', rootDir: './src', strict: true, esModuleInterop: true }, include: ['src'] }, null, 2) },
    { path: '.env.example', content: `DATABASE_URL=postgresql://postgres:password@localhost:5432/${slug}\nDB_POOL_MAX=10\nDB_IDLE_TIMEOUT=30000` },
    { path: '.gitignore', content: 'node_modules\ndist\n.env\n*.log' },
    { path: 'src/db.ts', content: `import { Pool, PoolClient } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.DB_POOL_MAX) || 10,
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT) || 30_000,
  connectionTimeoutMillis: 5_000,
})

pool.on('error', (err) => console.error('Unexpected pg pool error', err))

export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[],
): Promise<T[]> {
  const { rows } = await pool.query(sql, params)
  return rows as T[]
}

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export { pool }` },
    { path: 'src/migrations/001_create_users.sql', content: `-- Migration: 001 Create users table
CREATE TABLE IF NOT EXISTS users (
  id          BIGSERIAL PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();` },
    { path: 'src/repositories/users.ts', content: `import { query, withTransaction } from '../db'

export interface User {
  id: number; email: string; name: string; role: string; created_at: Date; updated_at: Date
}

export async function findAll(): Promise<User[]> {
  return query<User>('SELECT * FROM users ORDER BY created_at DESC')
}

export async function findById(id: number): Promise<User | null> {
  const rows = await query<User>('SELECT * FROM users WHERE id = $1', [id])
  return rows[0] || null
}

export async function create(email: string, name: string): Promise<User> {
  const rows = await query<User>(
    'INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *',
    [email, name]
  )
  return rows[0]
}

export async function deleteById(id: number): Promise<void> {
  await query('DELETE FROM users WHERE id = $1', [id])
}` },
    { path: 'src/index.ts', content: `import dotenv from 'dotenv'
dotenv.config()

import { pool, query } from './db'

async function main() {
  const result = await query<{ now: string }>('SELECT NOW() as now')
  console.log('✅ PostgreSQL connected:', result[0].now)
  await pool.end()
}

main().catch(console.error)` },
  ];
}

function redisEntries(name: string, _desc: string): Entry[] {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  return [
    { path: 'package.json', content: JSON.stringify({
      name: slug, version: '1.0.0',
      scripts: { dev: 'ts-node-dev src/index.ts', build: 'tsc', start: 'node dist/index.js' },
      dependencies: { redis: '^4.7.0', dotenv: '^16.4.0' },
      devDependencies: { '@types/node': '^20', typescript: '^5.4.0', 'ts-node-dev': '^2.0.0' },
    }, null, 2) },
    { path: '.env.example', content: `REDIS_URL=redis://localhost:6379\nCACHE_TTL=3600` },
    { path: '.gitignore', content: 'node_modules\ndist\n.env\n*.log' },
    { path: 'src/client.ts', content: `import { createClient } from 'redis'

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
})

client.on('error', (err) => console.error('Redis error:', err))
client.on('connect', () => console.log('✅ Redis connected'))
client.on('reconnecting', () => console.warn('Redis reconnecting…'))

export async function connectRedis() {
  if (!client.isOpen) await client.connect()
  return client
}

export default client` },
    { path: 'src/cache.ts', content: `import client, { connectRedis } from './client'

const DEFAULT_TTL = Number(process.env.CACHE_TTL) || 3600  // seconds

export async function get<T = unknown>(key: string): Promise<T | null> {
  await connectRedis()
  const value = await client.get(key)
  if (!value) return null
  try { return JSON.parse(value) as T } catch { return value as unknown as T }
}

export async function set(key: string, value: unknown, ttl = DEFAULT_TTL): Promise<void> {
  await connectRedis()
  await client.setEx(key, ttl, JSON.stringify(value))
}

export async function del(key: string): Promise<void> {
  await connectRedis()
  await client.del(key)
}

export async function flush(): Promise<void> {
  await connectRedis()
  await client.flushDb()
}

// Cache-aside helper
export async function remember<T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>,
): Promise<T> {
  const cached = await get<T>(key)
  if (cached !== null) return cached
  const result = await fn()
  await set(key, result, ttl)
  return result
}` },
    { path: 'src/pubsub.ts', content: `import { createClient } from 'redis'

const subscriber = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' })
const publisher  = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' })

export async function subscribe(channel: string, handler: (msg: string) => void) {
  if (!subscriber.isOpen) await subscriber.connect()
  await subscriber.subscribe(channel, handler)
  console.log(\`Subscribed to channel: \${channel}\`)
}

export async function publish(channel: string, message: unknown): Promise<void> {
  if (!publisher.isOpen) await publisher.connect()
  await publisher.publish(channel, JSON.stringify(message))
}` },
    { path: 'src/index.ts', content: `import dotenv from 'dotenv'
dotenv.config()

import { connectRedis } from './client'
import { get, set, remember } from './cache'

async function main() {
  await connectRedis()

  await set('greeting', { text: 'Hello, Redis!' }, 60)
  const val = await get<{ text: string }>('greeting')
  console.log('Cached value:', val)

  const expensive = await remember('computed', 300, async () => {
    // simulate expensive computation
    return { result: 42 }
  })
  console.log('Computed (or cached):', expensive)

  process.exit(0)
}

main().catch(console.error)` },
  ];
}

function dockerEntries(name: string, _desc: string): Entry[] {
  return [
    { path: 'Dockerfile', content: `# ── Build stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --frozen-lockfile
COPY . .
RUN npm run build

# ── Production stage ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/package*.json ./
RUN npm ci --omit=dev --frozen-lockfile

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \\
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]` },
    { path: '.dockerignore', content: `node_modules
dist
.git
.env
.env.*
!.env.example
*.log
coverage
.DS_Store
README.md` },
    { path: 'docker-compose.yml', content: `version: '3.9'

services:
  app:
    build: .
    container_name: ${name.toLowerCase().replace(/\s+/g, '-')}
    restart: unless-stopped
    ports:
      - "\${PORT:-3000}:3000"
    env_file: .env
    environment:
      NODE_ENV: production
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    container_name: ${name.toLowerCase().replace(/\s+/g, '-')}-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: \${DB_NAME:-appdb}
      POSTGRES_USER: \${DB_USER:-postgres}
      POSTGRES_PASSWORD: \${DB_PASSWORD:-password}
    volumes:
      - db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: ${name.toLowerCase().replace(/\s+/g, '-')}-redis
    restart: unless-stopped
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

volumes:
  db_data:` },
    { path: 'docker-compose.dev.yml', content: `version: '3.9'

services:
  app:
    build:
      context: .
      target: builder
    command: npm run dev
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      NODE_ENV: development
    ports:
      - "3000:3000"` },
  ];
}

function kubernetesEntries(name: string, _desc: string): Entry[] {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  return [
    { path: 'k8s/namespace.yaml', content: `apiVersion: v1
kind: Namespace
metadata:
  name: ${slug}
  labels:
    app.kubernetes.io/name: ${slug}` },
    { path: 'k8s/configmap.yaml', content: `apiVersion: v1
kind: ConfigMap
metadata:
  name: ${slug}-config
  namespace: ${slug}
data:
  NODE_ENV: "production"
  PORT: "3000"
  LOG_LEVEL: "info"` },
    { path: 'k8s/secret.yaml', content: `# ⚠️  Do NOT commit real secrets. Use Sealed Secrets or External Secrets Operator.
apiVersion: v1
kind: Secret
metadata:
  name: ${slug}-secrets
  namespace: ${slug}
type: Opaque
stringData:
  DATABASE_URL: "postgresql://user:pass@postgres:5432/db"
  JWT_SECRET: "change-me"` },
    { path: 'k8s/deployment.yaml', content: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${slug}
  namespace: ${slug}
  labels:
    app: ${slug}
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ${slug}
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: ${slug}
    spec:
      containers:
        - name: ${slug}
          image: ${slug}:latest
          imagePullPolicy: Always
          ports:
            - containerPort: 3000
          envFrom:
            - configMapRef:
                name: ${slug}-config
            - secretRef:
                name: ${slug}-secrets
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 15
            periodSeconds: 20
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10` },
    { path: 'k8s/service.yaml', content: `apiVersion: v1
kind: Service
metadata:
  name: ${slug}
  namespace: ${slug}
spec:
  selector:
    app: ${slug}
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: ClusterIP` },
    { path: 'k8s/ingress.yaml', content: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ${slug}-ingress
  namespace: ${slug}
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - ${slug}.example.com
      secretName: ${slug}-tls
  rules:
    - host: ${slug}.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: ${slug}
                port:
                  number: 80` },
    { path: 'k8s/hpa.yaml', content: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ${slug}-hpa
  namespace: ${slug}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ${slug}
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70` },
  ];
}

function githubActionsEntries(_name: string, _desc: string): Entry[] {
  return [
    { path: '.github/workflows/ci.yml', content: `name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint-and-test:
    name: Lint & Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Run tests
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        if: success()
        with:
          token: \${{ secrets.CODECOV_TOKEN }}

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: lint-and-test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
          retention-days: 7` },
    { path: '.github/workflows/cd.yml', content: `name: CD – Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    name: Build & Push Docker image
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}

      - name: Extract Docker metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/\${{ github.repository }}
          tags: |
            type=sha,prefix=sha-
            type=raw,value=latest,enable=\${{ github.ref == 'refs/heads/main' }}

      - name: Build and push image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: \${{ steps.meta.outputs.tags }}
          labels: \${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max` },
    { path: '.github/workflows/security.yml', content: `name: Security Scan

on:
  schedule:
    - cron: '0 8 * * 1'  # Every Monday at 08:00 UTC
  push:
    branches: [main]

jobs:
  dependency-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm audit --audit-level=high

  codeql:
    runs-on: ubuntu-latest
    permissions: { actions: read, contents: read, security-events: write }
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with: { languages: javascript }
      - uses: github/codeql-action/analyze@v3` },
  ];
}

function defaultEntries(name: string, desc: string, techId: string): Entry[] {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  return [
    { path: 'README.md', content: `# ${name}

${desc || `A ${techId} module.`}

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`` },
    { path: 'package.json', content: JSON.stringify({
      name: slug, version: '1.0.0', description: desc || `${techId} module`,
      scripts: { dev: 'node src/index.js', start: 'node src/index.js' },
    }, null, 2) },
    { path: 'src/index.js', content: `// ${name} – ${techId}
console.log('Hello from ${name}!')` },
    { path: '.gitignore', content: 'node_modules\ndist\n.env\n*.log' },
    { path: '.env.example', content: '# Add your environment variables here' },
  ];
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Returns a fully typed file tree for the given technology. */
export function generateModuleFiles(
  techId: string,
  projectName: string,
  props: Record<string, any>,
): FolderNode {
  const name = projectName || props?.name || techId;
  const desc = props?.description || '';
  const id   = techId.toLowerCase();

  const entries: Entry[] =
    id === 'react'                         ? reactEntries(name, desc) :
    id === 'nextjs' || id === 'next'        ? nextjsEntries(name, desc) :
    id === 'vue' || id === 'nuxt'          ? vueEntries(name, desc) :
    id === 'express' || id === 'node'      ? expressEntries(name, desc) :
    id === 'fastapi'                        ? fastapiEntries(name, desc) :
    id === 'django'                         ? djangoEntries(name, desc) :
    id === 'spring'                         ? springEntries(name, desc) :
    id === 'mongodb'                        ? mongodbEntries(name, desc) :
    id === 'postgresql' || id === 'postgres'? postgresqlEntries(name, desc) :
    id === 'redis'                          ? redisEntries(name, desc) :
    id === 'docker'                         ? dockerEntries(name, desc) :
    id === 'kubernetes'                     ? kubernetesEntries(name, desc) :
    (id === 'github-actions' || id === 'github_actions' || id === 'githubactions')
                                            ? githubActionsEntries(name, desc) :
                                              defaultEntries(name, desc, techId);

  return buildTree(name, entries);
}

/** Collect every FileNode in a tree into a flat map: path → FileNode */
export function flattenTree(node: TreeNode, acc: Map<string, FileNode> = new Map()): Map<string, FileNode> {
  if (node.kind === 'file') {
    acc.set(node.path, node);
  } else {
    for (const child of node.children) flattenTree(child, acc);
  }
  return acc;
}
