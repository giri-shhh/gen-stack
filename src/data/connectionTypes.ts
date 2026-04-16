import type { ConnectionProtocol } from '../types';

export interface ConnectionTypeConfig {
  id: ConnectionProtocol;
  label: string;
  short: string;
  desc: string;
  color: string;
  dasharray: string; // SVG stroke-dasharray value; '' = solid
}

export const CONNECTION_TYPES: ConnectionTypeConfig[] = [
  {
    id: 'rest',
    label: 'REST API',
    short: 'REST',
    desc: 'HTTP request / response',
    color: '#6366f1',
    dasharray: '',
  },
  {
    id: 'graphql',
    label: 'GraphQL',
    short: 'GQL',
    desc: 'Flexible query-based API',
    color: '#e11d48',
    dasharray: '',
  },
  {
    id: 'grpc',
    label: 'gRPC',
    short: 'gRPC',
    desc: 'High-performance RPC',
    color: '#0891b2',
    dasharray: '',
  },
  {
    id: 'websocket',
    label: 'WebSocket',
    short: 'WS',
    desc: 'Bidirectional real-time',
    color: '#7c3aed',
    dasharray: '8 4',
  },
  {
    id: 'message-queue',
    label: 'Message Queue',
    short: 'Queue',
    desc: 'Async pub/sub messaging',
    color: '#ea580c',
    dasharray: '5 5',
  },
  {
    id: 'database',
    label: 'Database',
    short: 'DB',
    desc: 'Direct read / write',
    color: '#059669',
    dasharray: '',
  },
  {
    id: 'cache',
    label: 'Cache',
    short: 'Cache',
    desc: 'Cache read / write',
    color: '#0d9488',
    dasharray: '10 4',
  },
  {
    id: 'event',
    label: 'Event Stream',
    short: 'Event',
    desc: 'Event-driven async',
    color: '#d97706',
    dasharray: '4 4',
  },
  {
    id: 'custom',
    label: 'Custom',
    short: '—',
    desc: 'Custom / other protocol',
    color: '#6b7280',
    dasharray: '',
  },
];

export function getConnectionTypeConfig(type?: string): ConnectionTypeConfig {
  return CONNECTION_TYPES.find((ct) => ct.id === type) ?? CONNECTION_TYPES[0];
}
