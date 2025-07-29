import { Atom, Code, Server, Database, Cloud } from 'lucide-react';
import type { TechCategories, Technology } from '../types';

export const techCategories: TechCategories = {
  frontend: {
    name: "Frontend Frameworks",
    icon: "🎨",
    items: [
      { id: "react", name: "React", description: "JavaScript library for building user interfaces", color: "#61DAFB", logo: Atom },
      { id: "vue", name: "Vue.js", description: "Progressive JavaScript framework", color: "#4FC08D", logo: Code },
      { id: "angular", name: "Angular", description: "Platform for building mobile and desktop web applications", color: "#DD0031" },
      { id: "svelte", name: "Svelte", description: "Cybernetically enhanced web apps", color: "#FF3E00" },
      { id: "nextjs", name: "Next.js", description: "React framework for production", color: "#000000" },
      { id: "nuxt", name: "Nuxt.js", description: "Vue.js framework for production", color: "#00DC82" }
    ]
  },
  backend: {
    name: "Backend Frameworks",
    icon: "⚙️",
    items: [
      { id: "express", name: "Express.js", description: "Fast, unopinionated web framework for Node.js", color: "#000000", logo: Server },
      { id: "django", name: "Django", description: "High-level Python web framework", color: "#092E20" },
      { id: "spring", name: "Spring Boot", description: "Java-based framework for building microservices", color: "#6DB33F" },
      { id: "fastapi", name: "FastAPI", description: "Modern, fast web framework for building APIs", color: "#009688" },
      { id: "laravel", name: "Laravel", description: "PHP web application framework", color: "#FF2D20" },
      { id: "rails", name: "Ruby on Rails", description: "Web application framework for Ruby", color: "#CC0000" }
    ]
  },
  database: {
    name: "Databases",
    icon: "🗄️",
    items: [
      { id: "postgresql", name: "PostgreSQL", description: "Advanced open source relational database", color: "#336791", logo: Database },
      { id: "mongodb", name: "MongoDB", description: "Document-oriented NoSQL database", color: "#47A248" },
      { id: "mysql", name: "MySQL", description: "Open source relational database management system", color: "#4479A1" },
      { id: "redis", name: "Redis", description: "In-memory data structure store", color: "#DC382D" },
      { id: "elasticsearch", name: "Elasticsearch", description: "Distributed search and analytics engine", color: "#FED10A" },
      { id: "dynamodb", name: "DynamoDB", description: "Fully managed NoSQL database service", color: "#4053D6" }
    ]
  },
  cloud: {
    name: "Cloud Services",
    icon: "☁️",
    items: [
      { id: "aws", name: "AWS", description: "Amazon Web Services cloud platform", color: "#FF9900", logo: Cloud },
      { id: "gcp", name: "Google Cloud", description: "Google Cloud Platform", color: "#4285F4" },
      { id: "azure", name: "Azure", description: "Microsoft Azure cloud platform", color: "#0089D6" },
      { id: "vercel", name: "Vercel", description: "Platform for static sites and serverless functions", color: "#000000" },
      { id: "netlify", name: "Netlify", description: "All-in-one platform for web projects", color: "#00C7B7" },
      { id: "heroku", name: "Heroku", description: "Cloud platform for deploying applications", color: "#430098" }
    ]
  },
  messaging: {
    name: "Async Communication",
    icon: "📨",
    items: [
      { id: "rabbitmq", name: "RabbitMQ", description: "Message broker for distributed systems", color: "#FF6600" },
      { id: "kafka", name: "Apache Kafka", description: "Distributed streaming platform", color: "#231F20" },
      { id: "sqs", name: "AWS SQS", description: "Simple Queue Service", color: "#FF9900" },
      { id: "pubsub", name: "Google Pub/Sub", description: "Asynchronous messaging service", color: "#4285F4" },
      { id: "celery", name: "Celery", description: "Distributed task queue", color: "#37814A" },
      { id: "bull", name: "Bull", description: "Redis-based queue for Node.js", color: "#DC382D" }
    ]
  },
  caching: {
    name: "Caching Solutions",
    icon: "⚡",
    items: [
      { id: "redis-cache", name: "Redis Cache", description: "In-memory data structure store", color: "#DC382D" },
      { id: "memcached", name: "Memcached", description: "High-performance distributed memory caching system", color: "#000000" },
      { id: "cloudfront", name: "CloudFront", description: "Content delivery network", color: "#FF9900" },
      { id: "varnish", name: "Varnish", description: "HTTP accelerator", color: "#FF6600" },
      { id: "nginx", name: "Nginx", description: "Web server with caching capabilities", color: "#009639" },
      { id: "cdn", name: "CDN", description: "Content Delivery Network", color: "#4A90E2" }
    ]
  },
  additional: {
    name: "Additional Tech",
    icon: "🔧",
    items: [
      { id: "auth0", name: "Auth0", description: "Authentication and authorization platform", color: "#EB5424" },
      { id: "jwt", name: "JWT", description: "JSON Web Tokens for authentication", color: "#000000" },
      { id: "docker", name: "Docker", description: "Containerization platform", color: "#2496ED" },
      { id: "kubernetes", name: "Kubernetes", description: "Container orchestration platform", color: "#326CE5" },
      { id: "jenkins", name: "Jenkins", description: "Automation server for CI/CD", color: "#D33833" },
      { id: "github-actions", name: "GitHub Actions", description: "CI/CD platform", color: "#2088FF" },
      { id: "jest", name: "Jest", description: "JavaScript testing framework", color: "#C21325" },
      { id: "cypress", name: "Cypress", description: "End-to-end testing framework", color: "#17202C" },
      { id: "prometheus", name: "Prometheus", description: "Monitoring and alerting toolkit", color: "#E6522C" },
      { id: "grafana", name: "Grafana", description: "Analytics and monitoring platform", color: "#F46800" }
    ]
  }
};

export const getTechById = (id: string): Technology | null => {
  for (const category of Object.values(techCategories)) {
    const tech = category.items.find(item => item.id === id);
    if (tech) return tech;
  }
  return null;
};

export const getCategoryByTechId = (id: string) => {
  for (const [categoryKey, category] of Object.entries(techCategories)) {
    const tech = category.items.find(item => item.id === id);
    if (tech) return categoryKey;
  }
  return null;
}; 