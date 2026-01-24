/**
 * Integration Path Test Registry
 *
 * Re-exports the integration path matrix for test discovery.
 * This file allows tests to reference the same paths that
 * the validator checks against.
 *
 * Usage in tests:
 *   import { INTEGRATION_PATH_MATRIX, getPathById } from './path-registry.js';
 *   const path = getPathById('GUI-001');
 *   // path.testPattern tells you what to name your test
 *
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T27 for implementation details.
 */

export {
  INTEGRATION_PATH_MATRIX,
  getPathById,
  getPathsByCategory,
  getPathsByPriority,
  getCriticalPaths,
  getRequiredTestFiles,
  getDependentPaths,
} from '../../src/audits/integration-path-matrix.js';

export type {
  IntegrationPath,
  IntegrationPathPriority,
  IntegrationPathCategory,
} from '../../src/audits/integration-path-matrix.js';
