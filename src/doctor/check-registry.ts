/**
 * Check Registry for RWM Puppet Master Doctor System
 * 
 * Provides a registry pattern for pluggable doctor checks.
 * 
 * Per BUILD_QUEUE_PHASE_6.md PH6-T01 (Check Registry).
 */

/**
 * Categories for doctor checks
 */
export type CheckCategory = 'cli' | 'git' | 'runtime' | 'project' | 'network';

/**
 * Result of running a doctor check
 */
export interface CheckResult {
  /** Name of the check that produced this result */
  name: string;
  /** Category of the check */
  category: CheckCategory;
  /** Whether the check passed */
  passed: boolean;
  /** Human-readable message describing the result */
  message: string;
  /** Optional detailed information */
  details?: string;
  /** Optional suggestion for fixing a failed check */
  fixSuggestion?: string;
  /** Duration of the check execution in milliseconds */
  durationMs: number;
}

/**
 * Interface for doctor checks
 * 
 * Each check implements this interface to provide a pluggable
 * validation that can be registered with CheckRegistry.
 */
export interface DoctorCheck {
  /** Unique name identifying this check */
  name: string;
  /** Category this check belongs to */
  category: CheckCategory;
  /** Human-readable description of what this check validates */
  description: string;
  /** Execute the check and return a result */
  run(): Promise<CheckResult>;
}

/**
 * Registry for managing and executing doctor checks
 * 
 * Provides methods to register checks and execute them
 * individually, by category, or all at once.
 */
export class CheckRegistry {
  private readonly checks = new Map<string, DoctorCheck>();

  /**
   * Registers a check with the registry
   * 
   * If a check with the same name already exists, it will be overwritten.
   * 
   * @param check - The check to register
   */
  register(check: DoctorCheck): void {
    this.checks.set(check.name, check);
  }

  /**
   * Unregisters a check by name
   * 
   * @param name - Name of the check to remove
   * @returns true if the check was found and removed, false otherwise
   */
  unregister(name: string): boolean {
    return this.checks.delete(name);
  }

  /**
   * Runs all registered checks
   * 
   * Checks are executed sequentially. Each check's execution
   * time is measured and included in the result.
   * 
   * @returns Array of check results, one per registered check
   */
  async runAll(): Promise<CheckResult[]> {
    const results: CheckResult[] = [];

    for (const check of this.checks.values()) {
      const result = await this.runCheck(check);
      results.push(result);
    }

    return results;
  }

  /**
   * Runs all checks in a specific category
   * 
   * @param category - Category to filter by
   * @returns Array of check results for checks in the specified category
   */
  async runCategory(category: CheckCategory): Promise<CheckResult[]> {
    const results: CheckResult[] = [];
    const categoryChecks = Array.from(this.checks.values()).filter(
      (check) => check.category === category
    );

    for (const check of categoryChecks) {
      const result = await this.runCheck(check);
      results.push(result);
    }

    return results;
  }

  /**
   * Runs a single check by name
   * 
   * @param name - Name of the check to run
   * @returns Check result if found, null otherwise
   */
  async runOne(name: string): Promise<CheckResult | null> {
    const check = this.checks.get(name);
    if (!check) {
      return null;
    }

    return this.runCheck(check);
  }

  /**
   * Gets all registered checks
   * 
   * @returns Array of all registered DoctorCheck instances
   */
  getRegisteredChecks(): DoctorCheck[] {
    return Array.from(this.checks.values());
  }

  /**
   * Gets all unique categories that have registered checks
   * 
   * @returns Array of CheckCategory values
   */
  getCategories(): CheckCategory[] {
    const categories = new Set<CheckCategory>();
    for (const check of this.checks.values()) {
      categories.add(check.category);
    }
    return Array.from(categories).sort();
  }

  /**
   * Executes a single check and measures its duration
   * 
   * Handles errors gracefully by returning a failed result
   * with error information.
   * 
   * @param check - The check to execute
   * @returns CheckResult with execution details
   */
  private async runCheck(check: DoctorCheck): Promise<CheckResult> {
    const startTime = Date.now();

    try {
      const result = await check.run();
      const durationMs = Date.now() - startTime;

      // Ensure result has correct name and category
      return {
        ...result,
        name: check.name,
        category: check.category,
        durationMs,
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      return {
        name: check.name,
        category: check.category,
        passed: false,
        message: `Check execution failed: ${errorMessage}`,
        details: error instanceof Error ? error.stack : undefined,
        durationMs,
      };
    }
  }
}
