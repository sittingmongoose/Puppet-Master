// Library utilities barrel export

// API client
export { api, APIError, getErrorMessage } from './api.js';
export type {
  StateResponse,
  Config,
  DoctorCheck,
  Session,
  PlatformHealth,
  CursorCapabilities,
  PlatformStatus,
  PlatformStatusType,
  PlatformStatusResponse,
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

// PWA utilities
export {
  registerServiceWorker,
  unregisterServiceWorker,
  isPWAInstalled,
  isMobileDevice,
} from './pwa.js';
export type {
  ServiceWorkerRegistrationResult,
} from './pwa.js';

// Help content
export { helpContent } from './help-content.js';
export type { HelpContent } from './help-content.js';
