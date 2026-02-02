/**
 * Integration Path Test Matrix
 *
 * Defines all critical integration paths that MUST have test coverage.
 * This matrix ensures that end-to-end flows are tested before merge.
 *
 * CRITICAL: The GUI→Backend→Pipeline path was NEVER TESTED, leading to:
 * - Wizard didn't run Start Chain
 * - WebSocket events didn't reach frontend
 * - Project switching didn't work
 *
 * This matrix prevents such gaps by requiring explicit tests for each path.
 *
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T27 for implementation details.
 */

/**
 * Priority levels for integration paths.
 * - p0: Critical paths that MUST have tests (CI blocks merge)
 * - p1: Important paths that SHOULD have tests (warning only)
 * - p2: Nice-to-have paths (informational only)
 */
export type IntegrationPathPriority = 'p0' | 'p1' | 'p2';

/**
 * Categories for grouping integration paths.
 */
export type IntegrationPathCategory =
  | 'gui'         // GUI → Backend → Pipeline paths
  | 'cli'         // CLI → Orchestrator → Platform paths
  | 'verification' // Verification gate and verifier paths
  | 'git'         // Git operations (commit, branch, etc.)
  | 'start-chain'; // Start Chain pipeline paths

/**
 * Defines a critical integration path that requires test coverage.
 */
export interface IntegrationPath {
  /** Unique identifier (e.g., "GUI-001", "CLI-001") */
  id: string;

  /** Human-readable name */
  name: string;

  /** Description of what this integration path tests */
  description: string;

  /** Category for grouping */
  category: IntegrationPathCategory;

  /** Starting point of the integration (e.g., "Browser file upload") */
  startPoint: string;

  /** Expected end point (e.g., "parsed.json on disk") */
  endPoint: string;

  /** Critical source files involved in this integration path */
  criticalComponents: string[];

  /** Required test file that must exist */
  testFile: string;

  /**
   * Regex pattern to match test names.
   * At least one test matching this pattern must exist in testFile.
   */
  testPattern: string;

  /** Priority level (p0 = must have, p1 = should have, p2 = nice to have) */
  priority: IntegrationPathPriority;

  /**
   * Optional list of dependent path IDs.
   * If specified, this path's tests can assume dependencies are working.
   */
  dependencies?: string[];
}

/**
 * The complete integration path matrix.
 *
 * Every critical integration in the system should be defined here.
 * CI validates that each p0 path has corresponding tests.
 */
export const INTEGRATION_PATH_MATRIX: IntegrationPath[] = [
  // =============================
  // GUI Integration Paths
  // =============================
  {
    id: 'GUI-001',
    name: 'Wizard Upload',
    description: 'User uploads requirements file through wizard',
    category: 'gui',
    startPoint: 'Browser file upload',
    endPoint: '.puppet-master/requirements/parsed.json exists',
    criticalComponents: [
      'src/gui/public/js/wizard.js',
      'src/gui/routes/wizard.ts',
      'src/start-chain/parsers/',
    ],
    testFile: 'tests/integration/wizard.integration.test.ts',
    testPattern: 'wizard.*upload|upload.*requirements|file.*upload',
    priority: 'p0',
  },
  {
    id: 'GUI-002',
    name: 'Wizard AI Generation',
    description: 'Wizard generates PRD using AI Start Chain',
    category: 'gui',
    startPoint: 'Generate button click',
    endPoint: 'AI pipeline completes with PRD',
    criticalComponents: [
      'src/gui/routes/wizard.ts',
      'src/core/start-chain/pipeline.ts',
      'src/platforms/',
    ],
    testFile: 'tests/integration/wizard.integration.test.ts',
    testPattern: 'wizard.*generate|ai.*generation|start.?chain|prd.*generat',
    priority: 'p0',
    dependencies: ['GUI-001'],
  },
  {
    id: 'GUI-003',
    name: 'Dashboard Real-Time Updates',
    description: 'Dashboard receives WebSocket updates from orchestrator',
    category: 'gui',
    startPoint: 'Orchestrator emits event',
    endPoint: 'Dashboard receives WebSocket message',
    criticalComponents: [
      'src/core/orchestrator.ts',
      'src/logging/event-bus.ts',
      'src/gui/server.ts',
      'src/gui/public/js/dashboard.js',
    ],
    testFile: 'tests/integration/dashboard.integration.test.ts',
    testPattern: 'dashboard.*update|websocket.*event|real.?time|event.*propagat',
    priority: 'p0',
  },
  {
    id: 'GUI-004',
    name: 'Project Switching',
    description: 'User switches between projects in GUI',
    category: 'gui',
    startPoint: 'Project selector change',
    endPoint: 'State updated for new project',
    criticalComponents: [
      'src/gui/routes/projects.ts',
      'src/gui/public/js/dashboard.js',
    ],
    testFile: 'tests/integration/projects.integration.test.ts',
    testPattern: 'project.*switch|switch.*project|change.*project',
    priority: 'p1',
  },

  // =============================
  // CLI Integration Paths
  // =============================
  {
    id: 'CLI-001',
    name: 'CLI Start Execution',
    description: 'puppet-master start runs first iteration',
    category: 'cli',
    startPoint: 'puppet-master start command',
    endPoint: 'First iteration completes',
    criticalComponents: [
      'src/cli/commands/start.ts',
      'src/core/orchestrator.ts',
      'src/core/execution-engine.ts',
      'src/platforms/',
    ],
    testFile: 'tests/integration/cli-start.integration.test.ts',
    testPattern: 'start.*iteration|first.*iteration|cli.*start|execution.*begin',
    priority: 'p0',
  },
  {
    id: 'CLI-002',
    name: 'CLI Pause/Resume',
    description: 'puppet-master pause/resume preserves state',
    category: 'cli',
    startPoint: 'puppet-master pause command',
    endPoint: 'Resume continues from same point',
    criticalComponents: [
      'src/cli/commands/pause.ts',
      'src/cli/commands/resume.ts',
      'src/core/state-persistence.ts',
    ],
    testFile: 'tests/integration/cli-pause-resume.integration.test.ts',
    testPattern: 'pause.*resume|checkpoint|state.*restore|resume.*state',
    priority: 'p1',
  },
  {
    id: 'CLI-003',
    name: 'CLI Status',
    description: 'puppet-master status shows current state',
    category: 'cli',
    startPoint: 'puppet-master status command',
    endPoint: 'Current orchestrator state displayed',
    criticalComponents: [
      'src/cli/commands/status.ts',
      'src/core/orchestrator.ts',
    ],
    testFile: 'tests/integration/cli-start.integration.test.ts',
    testPattern: 'status.*display|current.*state|show.*status',
    priority: 'p1',
  },

  // =============================
  // Verification Paths
  // =============================
  {
    id: 'VERIFY-001',
    name: 'Gate Execution',
    description: 'Subtask completion triggers gate with evidence',
    category: 'verification',
    startPoint: 'Subtask marked complete',
    endPoint: 'Evidence saved, gate result recorded',
    criticalComponents: [
      'src/core/orchestrator.ts',
      'src/verification/gate-runner.ts',
      'src/memory/evidence-store.ts',
    ],
    testFile: 'tests/integration/gate.integration.test.ts',
    testPattern: 'gate.*execution|evidence.*save|verification.*gate|run.*gate',
    priority: 'p0',
  },
  {
    id: 'VERIFY-002',
    name: 'All Verifier Types',
    description: 'Each verifier type executes correctly',
    category: 'verification',
    startPoint: 'Criterion with specific type',
    endPoint: 'Verifier returns result with evidence',
    criticalComponents: [
      'src/verification/verifiers/',
      'src/verification/gate-runner.ts',
    ],
    testFile: 'tests/integration/verifiers.integration.test.ts',
    testPattern: 'verifier|command.*verify|regex.*verify|file.*exists|ai.*verify',
    priority: 'p0',
  },
  {
    id: 'VERIFY-003',
    name: 'Browser Verification',
    description: 'Browser verifier can check DOM state',
    category: 'verification',
    startPoint: 'browser_verify criterion',
    endPoint: 'Browser screenshot and result',
    criticalComponents: [
      'src/verification/verifiers/browser-verifier.ts',
    ],
    testFile: 'tests/integration/browser-verifier.integration.test.ts',
    testPattern: 'browser.*verify|dom.*check|screenshot|playwright',
    priority: 'p1',
  },

  // =============================
  // Git Paths
  // =============================
  {
    id: 'GIT-001',
    name: 'Iteration Commit',
    description: 'Iteration completion creates formatted commit',
    category: 'git',
    startPoint: 'Iteration completes with changes',
    endPoint: 'Git commit with proper format',
    criticalComponents: [
      'src/core/orchestrator.ts',
      'src/git/git-manager.ts',
      'src/git/commit-formatter.ts',
    ],
    testFile: 'tests/integration/git.integration.test.ts',
    testPattern: 'commit.*iteration|git.*commit|formatted.*commit|ralph.*commit',
    priority: 'p1',
  },
  {
    id: 'GIT-002',
    name: 'Branch Strategy',
    description: 'Branch creation per configured strategy',
    category: 'git',
    startPoint: 'Tier execution starts',
    endPoint: 'Branch exists per strategy',
    criticalComponents: [
      'src/core/orchestrator.ts',
      'src/git/branch-strategy.ts',
    ],
    testFile: 'tests/integration/git.integration.test.ts',
    testPattern: 'branch.*strategy|branch.*creation|tier.*branch|create.*branch',
    priority: 'p1',
  },

  // =============================
  // Start Chain Paths
  // =============================
  {
    id: 'SC-001',
    name: 'Full Start Chain Pipeline',
    description: 'Requirements → PRD → Architecture → Tier Plan',
    category: 'start-chain',
    startPoint: 'Requirements document',
    endPoint: 'All artifacts exist and are valid',
    criticalComponents: [
      'src/core/start-chain/pipeline.ts',
      'src/start-chain/parsers/',
      'src/start-chain/prd-generator.ts',
    ],
    testFile: 'tests/integration/start-chain.integration.test.ts',
    testPattern: 'full.*pipeline|end.?to.?end|requirements.*prd|complete.*chain',
    priority: 'p0',
  },
  {
    id: 'SC-002',
    name: 'Requirements Parsing',
    description: 'All supported formats parse correctly',
    category: 'start-chain',
    startPoint: 'Requirements file (md/docx/pdf)',
    endPoint: 'parsed.json with structure',
    criticalComponents: [
      'src/start-chain/parsers/',
      'src/start-chain/structure-detector.ts',
    ],
    testFile: 'tests/integration/start-chain.integration.test.ts',
    testPattern: 'pars.*requirements|markdown.*pars|docx.*pars|structure.*detect',
    priority: 'p1',
  },
  {
    id: 'SC-003',
    name: 'Traceability Generation',
    description: 'PRD items link back to requirements',
    category: 'start-chain',
    startPoint: 'Generated PRD',
    endPoint: 'traceability.json with complete mapping',
    criticalComponents: [
      'src/start-chain/traceability.ts',
    ],
    testFile: 'tests/integration/traceability.integration.test.ts',
    testPattern: 'traceabil|source.*ref|requirement.*link|coverage.*matrix',
    priority: 'p1',
  },
];

/**
 * Get all paths by category.
 */
export function getPathsByCategory(
  category: IntegrationPathCategory
): IntegrationPath[] {
  return INTEGRATION_PATH_MATRIX.filter((p) => p.category === category);
}

/**
 * Get all paths by priority.
 */
export function getPathsByPriority(
  priority: IntegrationPathPriority
): IntegrationPath[] {
  return INTEGRATION_PATH_MATRIX.filter((p) => p.priority === priority);
}

/**
 * Get a specific path by ID.
 */
export function getPathById(id: string): IntegrationPath | undefined {
  return INTEGRATION_PATH_MATRIX.find((p) => p.id === id);
}

/**
 * Get all P0 (critical) paths.
 */
export function getCriticalPaths(): IntegrationPath[] {
  return getPathsByPriority('p0');
}

/**
 * Get unique test files required for all paths.
 */
export function getRequiredTestFiles(): string[] {
  const files = new Set<string>();
  for (const path of INTEGRATION_PATH_MATRIX) {
    files.add(path.testFile);
  }
  return Array.from(files);
}

/**
 * Get paths that depend on a given path.
 */
export function getDependentPaths(pathId: string): IntegrationPath[] {
  return INTEGRATION_PATH_MATRIX.filter(
    (p) => p.dependencies?.includes(pathId)
  );
}
