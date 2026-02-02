/**
 * RWM-Specific Wiring Audit
 * 
 * Performs RWM-specific wiring checks:
 * - Git infrastructure wired into orchestrator
 * - All criterion types have registered verifiers
 * - Event names match between backend and frontend
 * 
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T22 for implementation details.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type {
  WiringIssue,
  WiringAuditResult,
  WiringAuditSummary,
  RWMAuditConfig,
  EventEmission,
} from './types.js';

/**
 * Perform RWM-specific wiring audit.
 * 
 * This checks for issues specific to the RWM Puppet Master codebase:
 * 1. Git infrastructure components are wired into the orchestrator
 * 2. All CriterionType values have corresponding verifier registrations
 * 3. Event names emitted by backend match what frontend listens for
 */
export async function auditRWMWiring(
  projectRoot: string,
  configOverrides?: Partial<RWMAuditConfig>
): Promise<WiringAuditResult> {
  const startTime = Date.now();
  const issues: WiringIssue[] = [];

  const config: RWMAuditConfig = {
    projectRoot,
    orchestratorFile: configOverrides?.orchestratorFile ?? 'src/core/orchestrator.ts',
    containerFile: configOverrides?.containerFile ?? 'src/core/container.ts',
    eventBusFile: configOverrides?.eventBusFile ?? 'src/logging/event-bus.ts',
    tiersFile: configOverrides?.tiersFile ?? 'src/types/tiers.ts',
    dashboardFile: configOverrides?.dashboardFile ?? 'src/gui/public/js/dashboard.js',
  };

  // Check 1: Git infrastructure wired into orchestrator
  issues.push(...(await checkGitInfrastructureWiring(config)));

  // Check 2: All criterion types have verifiers
  issues.push(...(await checkVerifierRegistrations(config)));

  // Check 3: Event names match between backend and frontend
  issues.push(...(await checkEventNameConsistency(config)));

  const summary = computeSummary(issues);
  const durationMs = Date.now() - startTime;

  return {
    issues,
    summary,
    passed: issues.filter((i) => i.severity === 'error').length === 0,
    durationMs,
    timestamp: new Date().toISOString(),
    config: {
      rootDir: projectRoot,
      include: ['src/**/*.ts'],
      exclude: ['**/*.test.ts'],
      entryPoints: [],
      containerFile: config.containerFile,
    },
  };
}

/**
 * Check that git infrastructure is wired into the orchestrator.
 * 
 * The orchestrator should use:
 * - branchStrategy (for branch management)
 * - commitFormatter (for commit messages)
 * - prManager (for PR creation)
 */
async function checkGitInfrastructureWiring(config: RWMAuditConfig): Promise<WiringIssue[]> {
  const issues: WiringIssue[] = [];
  const orchestratorPath = path.join(config.projectRoot, config.orchestratorFile);

  if (!fs.existsSync(orchestratorPath)) {
    issues.push({
      type: 'unresolved_dependency',
      severity: 'warning',
      location: {
        file: config.orchestratorFile,
        symbol: 'orchestrator',
      },
      description: `Orchestrator file not found at ${config.orchestratorFile}`,
      suggestion: 'Ensure the orchestrator file exists',
    });
    return issues;
  }

  const orchestratorSource = fs.readFileSync(orchestratorPath, 'utf8');

  // Components that should be used in the orchestrator
  const gitComponents = [
    {
      symbol: 'branchStrategy',
      patterns: [/branchStrategy/, /BranchStrategy/],
      description: 'Branch strategy for managing feature branches',
    },
    {
      symbol: 'commitFormatter',
      patterns: [/commitFormatter/, /CommitFormatter/],
      description: 'Commit formatter for consistent commit messages',
    },
    {
      symbol: 'prManager',
      patterns: [/prManager/, /PRManager/],
      description: 'PR manager for creating pull requests',
    },
    {
      symbol: 'gitManager',
      patterns: [/gitManager/, /GitManager/],
      description: 'Git manager for git operations',
    },
  ];

  for (const component of gitComponents) {
    const isUsed = component.patterns.some((pattern) => pattern.test(orchestratorSource));

    if (!isUsed) {
      issues.push({
        type: 'missing_injection',
        severity: 'warning', // Warning because git integration may be optional
        location: {
          file: config.orchestratorFile,
          symbol: component.symbol,
        },
        description: `Git infrastructure '${component.symbol}' not used in Orchestrator (${component.description})`,
        suggestion: `Consider injecting and using '${component.symbol}' in the Orchestrator for ${component.description}`,
      });
    }
  }

  return issues;
}

/**
 * Check that all CriterionType values have registered verifiers.
 */
async function checkVerifierRegistrations(config: RWMAuditConfig): Promise<WiringIssue[]> {
  const issues: WiringIssue[] = [];
  const tiersPath = path.join(config.projectRoot, config.tiersFile);
  const containerPath = path.join(config.projectRoot, config.containerFile);

  if (!fs.existsSync(tiersPath)) {
    issues.push({
      type: 'unresolved_dependency',
      severity: 'warning',
      location: {
        file: config.tiersFile,
        symbol: 'CriterionType',
      },
      description: `Tiers type file not found at ${config.tiersFile}`,
      suggestion: 'Ensure the tiers type file exists',
    });
    return issues;
  }

  if (!fs.existsSync(containerPath)) {
    issues.push({
      type: 'unresolved_dependency',
      severity: 'warning',
      location: {
        file: config.containerFile,
        symbol: 'container',
      },
      description: `Container file not found at ${config.containerFile}`,
      suggestion: 'Ensure the container file exists',
    });
    return issues;
  }

  const tiersSource = fs.readFileSync(tiersPath, 'utf8');
  const containerSource = fs.readFileSync(containerPath, 'utf8');

  // Extract CriterionType values from tiers.ts
  // Pattern: export type CriterionType = 'regex' | 'file_exists' | ...
  const criterionTypeMatch = tiersSource.match(
    /export\s+type\s+CriterionType\s*=\s*([^;]+)/
  );

  if (!criterionTypeMatch) {
    issues.push({
      type: 'unresolved_dependency',
      severity: 'warning',
      location: {
        file: config.tiersFile,
        symbol: 'CriterionType',
      },
      description: 'Could not parse CriterionType definition',
      suggestion: 'Ensure CriterionType is properly defined as a type alias',
    });
    return issues;
  }

  // Extract individual type literals
  const typeString = criterionTypeMatch[1];
  const typePattern = /'([^']+)'/g;
  const criterionTypes: string[] = [];
  let match;
  while ((match = typePattern.exec(typeString)) !== null) {
    criterionTypes.push(match[1]);
  }

  // Check each criterion type has a verifier registered
  // The container should have patterns like:
  // registry.register(new RegexVerifier())  // type: 'regex'
  // registry.register(new FileExistsVerifier()) // type: 'file_exists'
  const typeToVerifierMap: Record<string, string> = {
    regex: 'RegexVerifier',
    file_exists: 'FileExistsVerifier',
    command: 'CommandVerifier',
    browser_verify: 'BrowserVerifier',
    ai: 'AIVerifier',
  };

  for (const criterionType of criterionTypes) {
    const expectedVerifier = typeToVerifierMap[criterionType];
    
    if (!expectedVerifier) {
      issues.push({
        type: 'unresolved_dependency',
        severity: 'error',
        location: {
          file: config.tiersFile,
          symbol: criterionType,
        },
        description: `No verifier mapping known for criterion type '${criterionType}'`,
        suggestion: `Add a verifier for '${criterionType}' and update typeToVerifierMap`,
      });
      continue;
    }

    // Check if verifier is registered in container
    const verifierPattern = new RegExp(expectedVerifier, 'i');
    if (!verifierPattern.test(containerSource)) {
      issues.push({
        type: 'unresolved_dependency',
        severity: 'error',
        location: {
          file: config.containerFile,
          symbol: expectedVerifier,
        },
        description: `Criterion type '${criterionType}' has no registered verifier (expected ${expectedVerifier})`,
        suggestion: `Register ${expectedVerifier} in the container for criterion type '${criterionType}'`,
      });
    }
  }

  return issues;
}

/**
 * Check that event names emitted by backend match what frontend listens for.
 */
async function checkEventNameConsistency(config: RWMAuditConfig): Promise<WiringIssue[]> {
  const issues: WiringIssue[] = [];
  const eventBusPath = path.join(config.projectRoot, config.eventBusFile);
  const dashboardPath = path.join(config.projectRoot, config.dashboardFile);

  if (!fs.existsSync(eventBusPath)) {
    issues.push({
      type: 'event_mismatch',
      severity: 'warning',
      location: {
        file: config.eventBusFile,
        symbol: 'EventBus',
      },
      description: `Event bus file not found at ${config.eventBusFile}`,
      suggestion: 'Ensure the event bus file exists',
    });
    return issues;
  }

  if (!fs.existsSync(dashboardPath)) {
    issues.push({
      type: 'event_mismatch',
      severity: 'warning',
      location: {
        file: config.dashboardFile,
        symbol: 'dashboard',
      },
      description: `Dashboard file not found at ${config.dashboardFile}`,
      suggestion: 'Ensure the dashboard file exists',
    });
    return issues;
  }

  const eventBusSource = fs.readFileSync(eventBusPath, 'utf8');
  const dashboardSource = fs.readFileSync(dashboardPath, 'utf8');

  // Extract event types from PuppetMasterEvent union in event-bus.ts
  // Pattern: { type: 'event_name'; ... }
  const eventTypePattern = /\{\s*type:\s*['"]([^'"]+)['"]/g;
  const backendEvents: EventEmission[] = [];
  let match;
  
  // Find line numbers for each event type
  while ((match = eventTypePattern.exec(eventBusSource)) !== null) {
    const eventType = match[1];
    const lineIndex = eventBusSource.substring(0, match.index).split('\n').length;
    backendEvents.push({
      eventType,
      file: config.eventBusFile,
      line: lineIndex,
    });
  }

  // Extract event listeners from dashboard.js
  // Patterns: message.type === 'event_name', case 'event_name':
  const dashboardListenerPatterns = [
    /message\.type\s*===?\s*['"]([^'"]+)['"]/g,
    /case\s+['"]([^'"]+)['"]\s*:/g,
    /\.type\s*===?\s*['"]([^'"]+)['"]/g,
  ];

  const frontendEvents: Set<string> = new Set();
  for (const pattern of dashboardListenerPatterns) {
    pattern.lastIndex = 0; // Reset regex state
    while ((match = pattern.exec(dashboardSource)) !== null) {
      frontendEvents.add(match[1]);
    }
  }

  // Check for mismatches
  const commonVariantTransforms = [
    (s: string) => s,
    (s: string) => s.replace(/_changed$/, '_change'),
    (s: string) => s.replace(/_started$/, '_start'),
    (s: string) => s.replace(/_completed$/, '_complete'),
    (s: string) => s.replace(/_chunk$/, ''),
    (s: string) => s.replace(/_update$/, ''),
    (s: string) => s.replace(/_updated$/, '_update'),
  ];

  for (const backendEvent of backendEvents) {
    const eventType = backendEvent.eventType;
    
    // Check if frontend listens for this event (or a common variant)
    const hasListener = commonVariantTransforms.some((transform) => 
      frontendEvents.has(transform(eventType))
    );

    if (!hasListener) {
      // Check if this is an internal-only event that doesn't need frontend handling
      const internalOnlyEvents = ['log', 'error']; // Events that may be handled differently
      if (internalOnlyEvents.includes(eventType)) {
        continue;
      }

      issues.push({
        type: 'event_mismatch',
        severity: 'warning',
        location: {
          file: config.eventBusFile,
          line: backendEvent.line,
          symbol: eventType,
        },
        description: `Backend emits '${eventType}' but frontend doesn't listen for it`,
        suggestion: `Add listener for '${eventType}' in dashboard.js or verify this is intentional`,
      });
    }
  }

  // Check for frontend listeners with no backend emitter
  const backendEventTypes = new Set(backendEvents.map((e) => e.eventType));
  const expandedBackendTypes = new Set<string>();
  
  for (const eventType of backendEventTypes) {
    for (const transform of commonVariantTransforms) {
      expandedBackendTypes.add(transform(eventType));
    }
  }

  for (const frontendEvent of frontendEvents) {
    // Skip known WebSocket/system events
    const systemEvents = ['ping', 'pong', 'open', 'close', 'message', 'error'];
    if (systemEvents.includes(frontendEvent)) continue;

    if (!expandedBackendTypes.has(frontendEvent) && !backendEventTypes.has(frontendEvent)) {
      issues.push({
        type: 'event_mismatch',
        severity: 'warning',
        location: {
          file: config.dashboardFile,
          symbol: frontendEvent,
        },
        description: `Frontend listens for '${frontendEvent}' but backend doesn't emit it`,
        suggestion: `Either add '${frontendEvent}' to PuppetMasterEvent type or remove the listener`,
      });
    }
  }

  return issues;
}

/**
 * Compute summary statistics from issues.
 */
function computeSummary(issues: WiringIssue[]): WiringAuditSummary {
  return {
    totalExports: 0,
    orphanExports: issues.filter((i) => i.type === 'orphan_export').length,
    totalRegistrations: 0,
    unusedRegistrations: issues.filter((i) => i.type === 'unused_registration').length,
    totalInjections: 0,
    missingInjections: issues.filter((i) => i.type === 'missing_injection').length,
    totalImports: 0,
    deadImports: issues.filter((i) => i.type === 'dead_import').length,
    eventMismatches: issues.filter((i) => i.type === 'event_mismatch').length,
    verifierGaps: issues.filter((i) => i.type === 'unresolved_dependency').length,
  };
}

/**
 * Run combined generic and RWM-specific audits.
 */
export async function runFullAudit(projectRoot: string): Promise<{
  generic: WiringAuditResult | null;
  rwmSpecific: WiringAuditResult;
  combined: WiringAuditResult;
}> {
  // Import dynamically to avoid circular dependencies
  const { WiringAuditor, createDefaultConfig } = await import('./wiring-audit.js');

  let genericResult: WiringAuditResult | null = null;
  
  try {
    const config = createDefaultConfig(projectRoot);
    const auditor = new WiringAuditor(config);
    genericResult = await auditor.audit();
  } catch (error) {
    console.error('Generic audit failed:', error);
  }

  const rwmResult = await auditRWMWiring(projectRoot);

  // Combine results
  const allIssues = [
    ...(genericResult?.issues ?? []),
    ...rwmResult.issues,
  ];

  const combined: WiringAuditResult = {
    issues: allIssues,
    summary: {
      totalExports: genericResult?.summary.totalExports ?? 0,
      orphanExports: allIssues.filter((i) => i.type === 'orphan_export').length,
      totalRegistrations: genericResult?.summary.totalRegistrations ?? 0,
      unusedRegistrations: allIssues.filter((i) => i.type === 'unused_registration').length,
      totalInjections: 0,
      missingInjections: allIssues.filter((i) => i.type === 'missing_injection').length,
      totalImports: genericResult?.summary.totalImports ?? 0,
      deadImports: allIssues.filter((i) => i.type === 'dead_import').length,
      eventMismatches: allIssues.filter((i) => i.type === 'event_mismatch').length,
      verifierGaps: allIssues.filter((i) => i.type === 'unresolved_dependency').length,
    },
    passed: allIssues.filter((i) => i.severity === 'error').length === 0,
    durationMs: (genericResult?.durationMs ?? 0) + rwmResult.durationMs,
    timestamp: new Date().toISOString(),
    config: genericResult?.config ?? rwmResult.config,
  };

  return {
    generic: genericResult,
    rwmSpecific: rwmResult,
    combined,
  };
}
