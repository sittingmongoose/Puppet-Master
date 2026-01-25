// Library utilities barrel export

// API client
export { api, APIError } from './api.js';
export type {
  StateResponse,
  Config,
  DoctorCheck,
  Session,
  PlatformHealth,
} from './api.js';

// SSE client
export {
  sseClient,
  SSE_EVENT_TYPES,
  useSSEStatus,
  useSSEEvent,
  useSSEStoreIntegration,
} from './sse.js';
export type {
  SSEEventType,
  SSEStatus,
  SSEEventHandler,
} from './sse.js';
