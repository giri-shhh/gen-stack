import type { CanvasComponent, Connection, CanvasState } from '../types';

export interface ArchitectureTier {
  name: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  components: { name: string; techId: string }[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  technologies: string[];
  tags: string[];
  canvasState: CanvasState;
  features: string[];
  architectureTiers: ArchitectureTier[];
  accentColor: string;
  gradientClasses: string;
  icon: string;
  componentCount: number;
  connectionCount: number;
}

// ─── Netflix-like Streaming Platform ───────────────────────────────────────

const netflixComponents: CanvasComponent[] = [
  // ── Frontend ──────────────────────────────────────────────────────────────
  {
    id: 'nf-nextjs-web',
    type: 'frontend',
    techId: 'nextjs',
    position: { x: 80, y: 60 },
    size: { width: 200, height: 110 },
    properties: {},
    label: 'Next.js Web App',
    description: 'Browse page, landing page, SSR for SEO, auth flows and profile management',
  },
  {
    id: 'nf-react-player',
    type: 'frontend',
    techId: 'react',
    position: { x: 340, y: 60 },
    size: { width: 200, height: 110 },
    properties: {},
    label: 'React Video Player',
    description: 'Adaptive bitrate streaming player with subtitle management and playback controls',
  },
  // ── CDN / Cloud (top-right) ────────────────────────────────────────────────
  {
    id: 'nf-cloudfront-cdn',
    type: 'caching',
    techId: 'cloudfront',
    position: { x: 620, y: 60 },
    size: { width: 200, height: 110 },
    properties: {},
    label: 'CloudFront CDN',
    description: 'Global video delivery at edge, adaptive bitrate streaming, thumbnail & asset caching',
  },
  {
    id: 'nf-aws-cloud',
    type: 'cloud',
    techId: 'aws',
    position: { x: 900, y: 60 },
    size: { width: 200, height: 110 },
    properties: {},
    label: 'AWS Infrastructure',
    description: 'S3 video storage, EC2 transcoding workers, RDS, CloudWatch monitoring & alarms',
  },
  // ── API Gateway ────────────────────────────────────────────────────────────
  {
    id: 'nf-nginx-gateway',
    type: 'caching',
    techId: 'nginx',
    position: { x: 210, y: 250 },
    size: { width: 200, height: 110 },
    properties: {},
    label: 'API Gateway',
    description: 'Load balancing, SSL termination, rate limiting and request routing to microservices',
  },
  // ── Messaging ─────────────────────────────────────────────────────────────
  {
    id: 'nf-kafka-events',
    type: 'messaging',
    techId: 'kafka',
    position: { x: 900, y: 250 },
    size: { width: 200, height: 110 },
    properties: {},
    label: 'Apache Kafka',
    description: 'Real-time event streaming: view events, play/pause, billing events and analytics pipeline',
  },
  // ── Microservices ─────────────────────────────────────────────────────────
  {
    id: 'nf-express-user',
    type: 'backend',
    techId: 'express',
    position: { x: 60, y: 440 },
    size: { width: 200, height: 110 },
    properties: {},
    label: 'User Service',
    description: 'User profiles, subscription management, billing integration, JWT authentication',
  },
  {
    id: 'nf-spring-content',
    type: 'backend',
    techId: 'spring',
    position: { x: 320, y: 440 },
    size: { width: 200, height: 110 },
    properties: {},
    label: 'Content Service',
    description: 'Movie & TV metadata, episode management, content catalog, multi-language support',
  },
  {
    id: 'nf-fastapi-recommend',
    type: 'backend',
    techId: 'fastapi',
    position: { x: 580, y: 440 },
    size: { width: 200, height: 110 },
    properties: {},
    label: 'Recommendation Engine',
    description: 'ML-powered personalized recommendations with collaborative and content-based filtering',
  },
  {
    id: 'nf-elasticsearch-search',
    type: 'database',
    techId: 'elasticsearch',
    position: { x: 840, y: 440 },
    size: { width: 200, height: 110 },
    properties: {},
    label: 'Search Engine',
    description: 'Full-text content search, faceted filtering, autocomplete suggestions, typo tolerance',
  },
  // ── Data Layer ────────────────────────────────────────────────────────────
  {
    id: 'nf-postgresql-users',
    type: 'database',
    techId: 'postgresql',
    position: { x: 60, y: 640 },
    size: { width: 200, height: 110 },
    properties: {},
    label: 'User Database',
    description: 'User accounts, subscriptions, billing records, watch history with full ACID compliance',
  },
  {
    id: 'nf-mongodb-catalog',
    type: 'database',
    techId: 'mongodb',
    position: { x: 340, y: 640 },
    size: { width: 200, height: 110 },
    properties: {},
    label: 'Content Catalog DB',
    description: 'Movie metadata, cast & crew, thumbnails, episode details in a flexible document model',
  },
  {
    id: 'nf-redis-cache',
    type: 'caching',
    techId: 'redis-cache',
    position: { x: 620, y: 640 },
    size: { width: 200, height: 110 },
    properties: {},
    label: 'Redis Cache',
    description: 'Session tokens, recommendation cache, trending content, rate-limiting counters',
  },
];

const netflixConnections: Connection[] = [
  // CDN → Player (video delivery)
  { id: 'c-cdn-player', source: 'nf-cloudfront-cdn', target: 'nf-react-player', type: 'cdn' },
  // AWS → CDN (video assets)
  { id: 'c-aws-cdn', source: 'nf-aws-cloud', target: 'nf-cloudfront-cdn', type: 'api' },
  // AWS → Kafka (managed streaming)
  { id: 'c-aws-kafka', source: 'nf-aws-cloud', target: 'nf-kafka-events', type: 'api' },
  // Frontends → Gateway
  { id: 'c-nextjs-gw', source: 'nf-nextjs-web', target: 'nf-nginx-gateway', type: 'api' },
  { id: 'c-react-gw', source: 'nf-react-player', target: 'nf-nginx-gateway', type: 'api' },
  // Gateway → Services
  { id: 'c-gw-user', source: 'nf-nginx-gateway', target: 'nf-express-user', type: 'api' },
  { id: 'c-gw-content', source: 'nf-nginx-gateway', target: 'nf-spring-content', type: 'api' },
  { id: 'c-gw-recommend', source: 'nf-nginx-gateway', target: 'nf-fastapi-recommend', type: 'api' },
  // Gateway → Kafka (view events)
  { id: 'c-gw-kafka', source: 'nf-nginx-gateway', target: 'nf-kafka-events', type: 'queue' },
  // Kafka → Recommendation (event-driven ML)
  { id: 'c-kafka-recommend', source: 'nf-kafka-events', target: 'nf-fastapi-recommend', type: 'queue' },
  // User Service → PostgreSQL
  { id: 'c-user-pg', source: 'nf-express-user', target: 'nf-postgresql-users', type: 'database' },
  // User Service → Redis (sessions)
  { id: 'c-user-redis', source: 'nf-express-user', target: 'nf-redis-cache', type: 'cache' },
  // Content Service → MongoDB
  { id: 'c-content-mongo', source: 'nf-spring-content', target: 'nf-mongodb-catalog', type: 'database' },
  // Content Service → Elasticsearch (index updates)
  { id: 'c-content-search', source: 'nf-spring-content', target: 'nf-elasticsearch-search', type: 'api' },
  // Recommendation → Redis (result caching)
  { id: 'c-recommend-redis', source: 'nf-fastapi-recommend', target: 'nf-redis-cache', type: 'cache' },
  // Recommendation → MongoDB (content features)
  { id: 'c-recommend-mongo', source: 'nf-fastapi-recommend', target: 'nf-mongodb-catalog', type: 'database' },
];

export const templates: Template[] = [
  {
    id: 'netflix-streaming-platform',
    name: 'Netflix-like Streaming Platform',
    description:
      'Production-ready microservices architecture for a video streaming platform with CDN, ML recommendations, and real-time event processing.',
    longDescription:
      'A complete production-grade streaming platform inspired by Netflix\'s microservices design. Features adaptive video delivery via AWS CloudFront CDN, ML-powered recommendation engine driven by Kafka events, a polyglot persistence strategy with PostgreSQL for user data and MongoDB for content metadata, Redis caching for sessions and trending content, and Elasticsearch for real-time content search and discovery.',
    category: 'Streaming & Media',
    difficulty: 'advanced',
    technologies: [
      'Next.js', 'React', 'Nginx', 'Express.js', 'Spring Boot',
      'FastAPI', 'PostgreSQL', 'MongoDB', 'Redis Cache',
      'Apache Kafka', 'Elasticsearch', 'CloudFront', 'AWS',
    ],
    tags: ['streaming', 'video', 'microservices', 'cdn', 'kafka', 'ml', 'recommendations', 'netflix'],
    features: [
      'Adaptive bitrate video streaming via CloudFront CDN',
      'ML-powered personalized recommendation engine',
      'Real-time event streaming with Apache Kafka',
      'Nginx API Gateway with rate limiting & load balancing',
      'Polyglot persistence — PostgreSQL + MongoDB',
      'Redis caching for sessions & trending content',
      'Elasticsearch for content search & discovery',
      'AWS S3 video storage with transcoding workers',
    ],
    architectureTiers: [
      {
        name: 'Frontend',
        colorClass: 'text-blue-700 dark:text-blue-300',
        bgClass: 'bg-blue-50 dark:bg-blue-900/30',
        borderClass: 'border-blue-200 dark:border-blue-700',
        components: [
          { name: 'Next.js Web App', techId: 'nextjs' },
          { name: 'React Video Player', techId: 'react' },
        ],
      },
      {
        name: 'Edge & Cloud',
        colorClass: 'text-orange-700 dark:text-orange-300',
        bgClass: 'bg-orange-50 dark:bg-orange-900/30',
        borderClass: 'border-orange-200 dark:border-orange-700',
        components: [
          { name: 'CloudFront CDN', techId: 'cloudfront' },
          { name: 'AWS Infrastructure', techId: 'aws' },
        ],
      },
      {
        name: 'API Gateway',
        colorClass: 'text-gray-700 dark:text-gray-300',
        bgClass: 'bg-gray-50 dark:bg-gray-700/50',
        borderClass: 'border-gray-200 dark:border-gray-600',
        components: [
          { name: 'Nginx API Gateway', techId: 'nginx' },
          { name: 'Apache Kafka', techId: 'kafka' },
        ],
      },
      {
        name: 'Microservices',
        colorClass: 'text-green-700 dark:text-green-300',
        bgClass: 'bg-green-50 dark:bg-green-900/30',
        borderClass: 'border-green-200 dark:border-green-700',
        components: [
          { name: 'User Service', techId: 'express' },
          { name: 'Content Service', techId: 'spring' },
          { name: 'Recommendation Engine', techId: 'fastapi' },
          { name: 'Search Engine', techId: 'elasticsearch' },
        ],
      },
      {
        name: 'Data Layer',
        colorClass: 'text-purple-700 dark:text-purple-300',
        bgClass: 'bg-purple-50 dark:bg-purple-900/30',
        borderClass: 'border-purple-200 dark:border-purple-700',
        components: [
          { name: 'PostgreSQL', techId: 'postgresql' },
          { name: 'MongoDB', techId: 'mongodb' },
          { name: 'Redis Cache', techId: 'redis-cache' },
        ],
      },
    ],
    accentColor: '#E50914',
    gradientClasses: 'from-red-600 via-red-700 to-gray-900',
    icon: '🎬',
    componentCount: netflixComponents.length,
    connectionCount: netflixConnections.length,
    canvasState: {
      components: netflixComponents,
      connections: netflixConnections,
      zoom: 0.75,
      pan: { x: 0, y: 0 },
    },
  },
];

export const templateCategories = [
  'All',
  'Streaming & Media',
  'E-Commerce',
  'SaaS',
  'Social Platform',
  'Data & Analytics',
];
