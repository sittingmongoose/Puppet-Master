/**
 * Verifier interface
 * 
 * Base interface for all verifiers in the verification system.
 * Each verifier implements this interface to provide verification capabilities.
 * 
 * See REQUIREMENTS.md Section 25.2 (Verifier Taxonomy) for verifier types.
 */

import type { Criterion, VerifierResult } from '../../types/tiers.js';

/**
 * Verifier interface.
 * All verifiers must implement this interface.
 */
export interface Verifier {
  /** The type identifier for this verifier */
  readonly type: string;
  
  /**
   * Verifies a criterion.
   * @param criterion - The criterion to verify
   * @returns Promise resolving to the verification result
   */
  verify(criterion: Criterion): Promise<VerifierResult>;
}
