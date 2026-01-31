/**
 * Logging module barrel exports
 */

export {
  LoggerService,
  ConsoleTransport,
  FileTransport,
} from './logger-service.js';

export type {
  LogLevel,
  LogEntry,
  LogTransport,
  LoggerOptions,
} from './logger-service.js';

export { ActivityLogger } from './activity-logger.js';

export type {
  ActivityEvent,
  ActivityEventType,
} from './activity-logger.js';

export { ErrorLogger } from './error-logger.js';

export type {
  ErrorCategory,
  LoggedError,
} from './error-logger.js';

export { IterationLogger } from './iteration-logger.js';

export type {
  IterationLog,
} from './iteration-logger.js';

export { EventBus } from './event-bus.js';

export type {
  PuppetMasterEvent,
  EventSubscription,
} from './event-bus.js';

export { LogStreamer } from './log-streamer.js';

export type {
  StreamOptions,
} from './log-streamer.js';

export { LogRetention } from './log-retention.js';

export {
  installConsoleCapture,
  logDecision,
} from './intensive-logging.js';

export type {
  DecisionLog,
  ConsoleCaptureHandle,
} from './intensive-logging.js';

export type {
  RetentionConfig,
  CleanupResult,
  LogStats,
} from './log-retention.js';
