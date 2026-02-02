/**
 * ScriptVerifier export shim
 *
 * P2-T04 expects `src/verification/script-verifier.ts` to exist.
 * The implementation lives in `src/verification/verifiers/script-verifier.ts`.
 */

export { ScriptVerifier } from './verifiers/script-verifier.js';
export type { ScriptCriterion, ScriptCriterionOptions } from './verifiers/script-verifier.js';

