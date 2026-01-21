/**
 * Utilities barrel export
 */

export { FileLocker, withFileLock } from './file-lock.js';
export type { LockOptions, LockInfo } from './file-lock.js';

export {
  deriveProjectRootFromConfigPath,
  resolveUnderProjectRoot,
  resolveWorkingDirectory,
} from './project-paths.js';
