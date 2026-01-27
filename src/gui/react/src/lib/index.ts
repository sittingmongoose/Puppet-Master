// Library utilities barrel export

// API client
export { api, APIError } from './api.js';
export type {
  StateResponse,
  Config,
  DoctorCheck,
  Session,
  PlatformHealth,
  CursorCapabilities,
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

// Help content
export { helpContent } from './help-content.js';
export type { HelpContent } from './help-content.js';
