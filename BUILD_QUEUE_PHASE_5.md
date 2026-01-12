# RWM Puppet Master — BUILD_QUEUE_PHASE_5.md

> Phase 5: Start Chain  
> Tasks: 10  
> Focus: Requirements ingestion, PRD generation, planning pipeline

---

## Phase Overview

This phase implements the start chain workflow:
- Requirements file parsing (multiple formats)
- PRD schema and generation
- Architecture document generation
- Tier plan generation
- Validation gates for generated artifacts

### Parallel Groups

| Group | Tasks | Can Start After |
|-------|-------|-----------------|
| Sequential | PH5-T01 | Phase 4 complete |
| Parallel Group A | PH5-T02, PH5-T03, PH5-T04 | PH5-T01 |
| Sequential | PH5-T05 | PH5-T02, PH5-T03, PH5-T04 |
| Sequential | PH5-T06 | PH5-T05 |
| Sequential | PH5-T07 | PH5-T06 |
| Sequential | PH5-T08 | PH5-T07 |
| Parallel Group B | PH5-T09, PH5-T10 | PH5-T08 |

---

## PH5-T01: Requirements Ingestion Types

### Title
Define types for requirements ingestion

### Goal
Create TypeScript types for requirements documents and parsing results.

### Depends on
- Phase 4 complete

### Parallelizable with
- none (foundational)

### Recommended model quality
Medium OK — type definitions

### Read first
- REQUIREMENTS.md: Section 5 (Start Chain requirements)
- STATE_FILES.md: Section 3.3 (prd.json)

### Files to create/modify
- `src/types/requirements.ts`
- `src/types/index.ts` (add export)

### Implementation notes
- Support multiple input formats
- Include parsed structure types

### Acceptance criteria
- [ ] RequirementsDocument interface defined
- [ ] ParsedRequirements interface defined
- [ ] SupportedFormat type defined
- [ ] Types exported correctly
- [ ] `npm run typecheck` passes

### Tests to run
```bash
npm run typecheck
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Define requirements ingestion types for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH5-T01)
- Follow REQUIREMENTS.md Section 5

Create src/types/requirements.ts:

1. SupportedFormat type:
   export type SupportedFormat = 'markdown' | 'pdf' | 'text' | 'docx';

2. RequirementsSource interface:
   - path: string
   - format: SupportedFormat
   - size: number
   - lastModified: string

3. ParsedSection interface:
   - title: string
   - content: string
   - level: number (heading level)
   - children: ParsedSection[]

4. ParsedRequirements interface:
   - source: RequirementsSource
   - title: string
   - sections: ParsedSection[]
   - extractedGoals: string[]
   - extractedConstraints: string[]
   - rawText: string
   - parseErrors: string[]

5. RequirementsValidation interface:
   - isValid: boolean
   - errors: string[]
   - warnings: string[]
   - suggestions: string[]

Update src/types/index.ts to export all types.

After implementation, run:
- npm run typecheck

Iterate until typecheck passes.

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: 
Date: 
Summary of changes: 
Files changed: 
Commands run + results: 
If FAIL - where stuck + exact error snippets + what remains:
```

---

## PH5-T02: Markdown Parser Adapter

### Title
Implement markdown requirements parser

### Goal
Create a parser for markdown requirements documents.

### Depends on
- PH5-T01

### Parallelizable with
- PH5-T03, PH5-T04

### Recommended model quality
Medium OK — markdown parsing

### Read first
- PH5-T01 types

### Files to create/modify
- `src/start-chain/parsers/markdown-parser.ts`
- `src/start-chain/parsers/markdown-parser.test.ts`
- `src/start-chain/parsers/index.ts`

### Implementation notes
- Parse headings into sections
- Extract bullet points as goals/constraints
- Handle nested structures

### Acceptance criteria
- [ ] MarkdownParser class implemented
- [ ] `parse(content)` returns ParsedRequirements
- [ ] Headings converted to sections
- [ ] Bullet points extracted
- [ ] Tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "MarkdownParser"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement markdown parser for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH5-T02)
- Use types from PH5-T01

Create src/start-chain/parsers/markdown-parser.ts:

1. MarkdownParser class:
   - parse(content: string, source: RequirementsSource): ParsedRequirements
   - parseHeadings(content: string): ParsedSection[]
   - extractGoals(sections: ParsedSection[]): string[]
   - extractConstraints(sections: ParsedSection[]): string[]
   - detectHeadingLevel(line: string): number

2. Parsing logic:
   - # H1 -> level 1 section
   - ## H2 -> level 2 section
   - Bullet points under "Goals" heading -> extractedGoals
   - Bullet points under "Constraints" heading -> extractedConstraints

3. Create src/start-chain/parsers/markdown-parser.test.ts:
   - Test basic markdown parsing
   - Test nested headings
   - Test goal/constraint extraction
   - Test edge cases (empty, malformed)

4. Create src/start-chain/parsers/index.ts:
   export { MarkdownParser } from './markdown-parser.js';

After implementation, run:
- npm test -- -t "MarkdownParser"

Iterate until tests pass.

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: 
Date: 
Summary of changes: 
Files changed: 
Commands run + results: 
If FAIL - where stuck + exact error snippets + what remains:
```

---

## PH5-T03: PDF Parser Adapter

### Title
Implement PDF requirements parser

### Goal
Create a parser for PDF requirements documents.

### Depends on
- PH5-T01

### Parallelizable with
- PH5-T02, PH5-T04

### Recommended model quality
Medium OK — library integration

### Read first
- PH5-T01 types

### Files to create/modify
- `src/start-chain/parsers/pdf-parser.ts`
- `src/start-chain/parsers/pdf-parser.test.ts`
- `src/start-chain/parsers/index.ts` (add export)
- `package.json` (add pdf-parse dependency)

### Implementation notes
- Use pdf-parse library
- Extract text content
- Attempt to identify structure from formatting

### Acceptance criteria
- [ ] PdfParser class implemented
- [ ] pdf-parse dependency installed
- [ ] `parse(buffer)` returns ParsedRequirements
- [ ] Text extracted from PDF
- [ ] Tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "PdfParser"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement PDF parser for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH5-T03)
- Use pdf-parse library

1. Install dependency:
   - pdf-parse: ^1.1.1

Create src/start-chain/parsers/pdf-parser.ts:

1. PdfParser class:
   - async parse(buffer: Buffer, source: RequirementsSource): Promise<ParsedRequirements>
   - inferSections(text: string): ParsedSection[]
   - extractGoals(text: string): string[]
   - extractConstraints(text: string): string[]

2. Parsing logic:
   - Extract all text using pdf-parse
   - Infer sections from capitalized lines or bold text
   - Look for "Goal" or "Objective" keywords
   - Look for "Constraint" or "Requirement" keywords

3. Create src/start-chain/parsers/pdf-parser.test.ts:
   - Test with sample PDF (create test fixture)
   - Test text extraction
   - Test section inference
   - Handle corrupt PDF gracefully

4. Update src/start-chain/parsers/index.ts

After implementation, run:
- npm test -- -t "PdfParser"

Iterate until tests pass.

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: 
Date: 
Summary of changes: 
Files changed: 
Commands run + results: 
If FAIL - where stuck + exact error snippets + what remains:
```

---

## PH5-T04: Text/Docx Parser Adapters

### Title
Implement plain text and docx parsers

### Goal
Create parsers for plain text and Word document requirements.

### Depends on
- PH5-T01

### Parallelizable with
- PH5-T02, PH5-T03

### Recommended model quality
Medium OK — text processing

### Read first
- PH5-T01 types

### Files to create/modify
- `src/start-chain/parsers/text-parser.ts`
- `src/start-chain/parsers/docx-parser.ts`
- `src/start-chain/parsers/*.test.ts`
- `src/start-chain/parsers/index.ts` (add exports)
- `package.json` (add mammoth dependency)

### Implementation notes
- Text parser: simple line-based parsing
- Docx parser: use mammoth library

### Acceptance criteria
- [ ] TextParser class implemented
- [ ] DocxParser class implemented
- [ ] mammoth dependency installed
- [ ] Both parsers return ParsedRequirements
- [ ] Tests pass for both
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "TextParser"
npm test -- -t "DocxParser"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement text and docx parsers for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH5-T04)
- Use mammoth for docx parsing

1. Install dependency:
   - mammoth: ^1.6.0

Create src/start-chain/parsers/text-parser.ts:

1. TextParser class:
   - parse(content: string, source: RequirementsSource): ParsedRequirements
   - inferSections(lines: string[]): ParsedSection[]
   - Simple heuristics: ALL CAPS lines = section headers

Create src/start-chain/parsers/docx-parser.ts:

1. DocxParser class:
   - async parse(buffer: Buffer, source: RequirementsSource): Promise<ParsedRequirements>
   - Use mammoth.extractRawText() for text
   - Use mammoth.convertToHtml() for structure hints
   - Map headings to sections

2. Create tests for both parsers

3. Update src/start-chain/parsers/index.ts:
   export { TextParser } from './text-parser.js';
   export { DocxParser } from './docx-parser.js';

After implementation, run:
- npm test -- -t "TextParser"
- npm test -- -t "DocxParser"

Iterate until tests pass.

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: 
Date: 
Summary of changes: 
Files changed: 
Commands run + results: 
If FAIL - where stuck + exact error snippets + what remains:
```

---

## PH5-T05: PRD Schema & Generator

### Title
Implement PRD generation from parsed requirements

### Goal
Create the PRD generator that produces prd.json from parsed requirements.

### Depends on
- PH5-T02, PH5-T03, PH5-T04

### Parallelizable with
- none

### Recommended model quality
HQ required — complex generation logic

### Read first
- STATE_FILES.md: Section 3.3 (prd.json schema)
- REQUIREMENTS.md: Section 5.2 (PRD generation)

### Files to create/modify
- `src/start-chain/prd-generator.ts`
- `src/start-chain/prd-generator.test.ts`
- `src/start-chain/index.ts`

### Implementation notes
- Transform parsed requirements into phased work
- Generate IDs following PM-XXX-XXX-XXX format
- Include acceptance criteria from requirements

### Acceptance criteria
- [ ] PrdGenerator class implemented
- [ ] `generate(parsed)` returns PRD structure
- [ ] Phases, tasks, subtasks created
- [ ] IDs follow correct format
- [ ] Acceptance criteria populated
- [ ] Tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "PrdGenerator"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement PRD generator for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH5-T05)
- Follow STATE_FILES.md Section 3.3 for PRD schema
- Follow REQUIREMENTS.md Section 5.2

Create src/start-chain/prd-generator.ts:

1. PrdGeneratorOptions interface:
   - projectName: string
   - maxSubtasksPerTask: number (default: 5)
   - maxTasksPerPhase: number (default: 10)

2. PrdGenerator class:
   - constructor(options: PrdGeneratorOptions)
   - generate(parsed: ParsedRequirements): PRD
   - generatePhases(sections: ParsedSection[]): PRDPhase[]
   - generateTasks(section: ParsedSection): PRDTask[]
   - generateSubtasks(content: string): PRDSubtask[]
   - generateId(type: 'phase' | 'task' | 'subtask', index: number, parentId?: string): string

3. ID format:
   - Phase: PH-001, PH-002, ...
   - Task: PH-001-T01, PH-001-T02, ...
   - Subtask: PH-001-T01-S01, ...

4. Generate acceptance criteria:
   - Extract from bullet points
   - If none found, create generic "Implementation complete" criteria

5. Create src/start-chain/prd-generator.test.ts:
   - Test phase generation
   - Test task/subtask breakdown
   - Test ID generation
   - Test acceptance criteria extraction

6. Create src/start-chain/index.ts:
   export { PrdGenerator } from './prd-generator.js';

After implementation, run:
- npm test -- -t "PrdGenerator"

Iterate until tests pass.

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: 
Date: 
Summary of changes: 
Files changed: 
Commands run + results: 
If FAIL - where stuck + exact error snippets + what remains:
```

---

## PH5-T06: Architecture Generator

### Title
Implement architecture document generator

### Goal
Create generator for architecture.md from parsed requirements.

### Depends on
- PH5-T05

### Parallelizable with
- none

### Recommended model quality
HQ required — document generation

### Read first
- REQUIREMENTS.md: Section 5.3 (Architecture generation)

### Files to create/modify
- `src/start-chain/arch-generator.ts`
- `src/start-chain/arch-generator.test.ts`
- `src/start-chain/index.ts` (add export)

### Implementation notes
- Generate markdown architecture document
- Include module breakdown, dependencies, tech stack
- Scaffold from requirements sections

### Acceptance criteria
- [ ] ArchGenerator class implemented
- [ ] `generate(parsed, prd)` returns markdown string
- [ ] Includes module breakdown
- [ ] Includes dependency graph
- [ ] Tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "ArchGenerator"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement architecture generator for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH5-T06)
- Follow REQUIREMENTS.md Section 5.3

Create src/start-chain/arch-generator.ts:

1. ArchGeneratorOptions interface:
   - projectName: string
   - includeTestStrategy: boolean (default: true)

2. ArchGenerator class:
   - constructor(options: ArchGeneratorOptions)
   - generate(parsed: ParsedRequirements, prd: PRD): string
   - generateModuleBreakdown(prd: PRD): string
   - generateDependencyGraph(prd: PRD): string
   - generateTechStack(parsed: ParsedRequirements): string
   - generateTestStrategy(prd: PRD): string

3. Output structure:
   # Architecture Document
   ## Overview
   ## Module Breakdown
   ## Dependencies
   ## Tech Stack
   ## Test Strategy
   ## Directory Structure

4. Create src/start-chain/arch-generator.test.ts:
   - Test full generation
   - Test each section generator
   - Test with minimal input

5. Update src/start-chain/index.ts

After implementation, run:
- npm test -- -t "ArchGenerator"

Iterate until tests pass.

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: 
Date: 
Summary of changes: 
Files changed: 
Commands run + results: 
If FAIL - where stuck + exact error snippets + what remains:
```

---

## PH5-T07: Tier Plan Generator

### Title
Implement tier plan generator

### Goal
Create generator for detailed tier execution plans.

### Depends on
- PH5-T06

### Parallelizable with
- none

### Recommended model quality
HQ required — planning logic

### Read first
- REQUIREMENTS.md: Section 6 (Four-Tier Orchestration)

### Files to create/modify
- `src/start-chain/tier-plan-generator.ts`
- `src/start-chain/tier-plan-generator.test.ts`
- `src/start-chain/index.ts` (add export)

### Implementation notes
- Assign platforms to tiers
- Set iteration limits
- Define escalation paths

### Acceptance criteria
- [ ] TierPlanGenerator class implemented
- [ ] Assigns platforms per config
- [ ] Sets maxIterations per tier
- [ ] Defines escalation targets
- [ ] Tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "TierPlanGenerator"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement tier plan generator for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH5-T07)
- Follow REQUIREMENTS.md Section 6

Create src/start-chain/tier-plan-generator.ts:

1. TierPlan interface:
   - phases: PhasePlan[]
   
2. PhasePlan interface:
   - phaseId: string
   - platform: Platform
   - maxIterations: number
   - escalation: TierType | null
   - tasks: TaskPlan[]

3. TaskPlan interface:
   - taskId: string
   - platform: Platform
   - maxIterations: number
   - subtasks: SubtaskPlan[]

4. SubtaskPlan interface:
   - subtaskId: string
   - platform: Platform
   - maxIterations: number

5. TierPlanGenerator class:
   - constructor(config: PuppetMasterConfig)
   - generate(prd: PRD): TierPlan
   - assignPlatform(tierType: TierType): Platform
   - getMaxIterations(tierType: TierType): number
   - getEscalationTarget(tierType: TierType): TierType | null

6. Create src/start-chain/tier-plan-generator.test.ts:
   - Test platform assignment
   - Test iteration limits
   - Test escalation paths

7. Update src/start-chain/index.ts

After implementation, run:
- npm test -- -t "TierPlanGenerator"

Iterate until tests pass.

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: 
Date: 
Summary of changes: 
Files changed: 
Commands run + results: 
If FAIL - where stuck + exact error snippets + what remains:
```

---

## PH5-T08: Validation Gate

### Title
Implement start chain validation gate

### Goal
Create validation for generated artifacts before execution begins.

### Depends on
- PH5-T07

### Parallelizable with
- none

### Recommended model quality
Medium OK — validation logic

### Read first
- REQUIREMENTS.md: Section 5.4 (Validation)

### Files to create/modify
- `src/start-chain/validation-gate.ts`
- `src/start-chain/validation-gate.test.ts`
- `src/start-chain/index.ts` (add export)

### Implementation notes
- Validate PRD structure
- Validate architecture document
- Validate tier plan
- Return actionable errors

### Acceptance criteria
- [ ] ValidationGate class implemented
- [ ] `validatePrd(prd)` checks PRD structure
- [ ] `validateArchitecture(arch)` checks document
- [ ] `validateTierPlan(plan)` checks assignments
- [ ] Returns specific error messages
- [ ] Tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "ValidationGate"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement validation gate for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH5-T08)
- Follow REQUIREMENTS.md Section 5.4

Create src/start-chain/validation-gate.ts:

1. ValidationResult interface:
   - valid: boolean
   - errors: ValidationError[]
   - warnings: ValidationWarning[]

2. ValidationError interface:
   - code: string
   - message: string
   - path?: string (JSON path to error)
   - suggestion?: string

3. ValidationWarning interface:
   - code: string
   - message: string
   - suggestion?: string

4. ValidationGate class:
   - validatePrd(prd: PRD): ValidationResult
   - validateArchitecture(arch: string): ValidationResult
   - validateTierPlan(plan: TierPlan, config: PuppetMasterConfig): ValidationResult
   - validateAll(prd: PRD, arch: string, plan: TierPlan, config: PuppetMasterConfig): ValidationResult

5. PRD validations:
   - Has at least one phase
   - Each phase has at least one task
   - Each task has at least one subtask
   - All IDs are unique
   - Acceptance criteria not empty

6. Create src/start-chain/validation-gate.test.ts:
   - Test valid PRD passes
   - Test invalid PRD fails with correct errors
   - Test architecture validation
   - Test tier plan validation

7. Update src/start-chain/index.ts

After implementation, run:
- npm test -- -t "ValidationGate"

Iterate until tests pass.

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: 
Date: 
Summary of changes: 
Files changed: 
Commands run + results: 
If FAIL - where stuck + exact error snippets + what remains:
```

---

## PH5-T09: CLI Init Command

### Title
Implement puppet-master init command

### Goal
Create the CLI init command for project initialization.

### Depends on
- PH5-T08

### Parallelizable with
- PH5-T10

### Recommended model quality
Medium OK — CLI implementation

### Read first
- REQUIREMENTS.md: Section 18 (CLI Commands)

### Files to create/modify
- `src/cli/commands/init.ts`
- `src/cli/commands/init.test.ts`
- `src/cli/index.ts` (add command)

### Implementation notes
- Create .puppet-master directory
- Generate config.yaml template
- Initialize AGENTS.md

### Acceptance criteria
- [ ] `puppet-master init` command works
- [ ] Creates .puppet-master directory structure
- [ ] Generates default config.yaml
- [ ] Creates empty AGENTS.md
- [ ] Tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "init command"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement init command for RWM Puppet Master CLI.

CONSTRAINTS:
- Implement ONLY this task (PH5-T09)
- Follow REQUIREMENTS.md Section 18

Create src/cli/commands/init.ts:

1. InitOptions interface:
   - projectName?: string
   - force?: boolean (overwrite existing)

2. initCommand function:
   - async initCommand(options: InitOptions): Promise<void>
   - createDirectoryStructure(): Promise<void>
   - generateDefaultConfig(projectName: string): PuppetMasterConfig
   - writeConfigFile(config: PuppetMasterConfig): Promise<void>
   - createAgentsFile(): Promise<void>

3. Directory structure to create (per STATE_FILES.md):
   .puppet-master/
   ├── prd.json               # Work queue (root level per STATE_FILES.md)
   ├── architecture.md        # Architecture doc (root level per STATE_FILES.md)
   ├── config.yaml            # Configuration
   ├── progress.txt           # Append-only progress log
   ├── requirements/          # Original and processed requirements
   │   └── (copy original requirements here)
   ├── plans/                 # Plan markdown artifacts
   │   ├── phase-<id>.md
   │   ├── task-<id>.md
   │   ├── subtask-<id>.md
   │   └── iteration-<id>.md
   ├── agents/                # Multi-level AGENTS.md files
   │   ├── phase-<id>.md
   │   ├── task-<id>.md
   │   ├── subtask-<id>.md
   │   └── iteration-<id>.md
   ├── capabilities/          # Platform capability cache
   ├── checkpoints/           # State checkpoints
   ├── evidence/              # Verification artifacts
   │   ├── test-logs/
   │   ├── screenshots/
   │   ├── browser-traces/
   │   ├── file-snapshots/
   │   ├── metrics/
   │   └── gate-reports/
   ├── logs/                  # Runtime logs
   │   └── iterations/
   └── usage/                 # Usage tracking
       └── usage.jsonl

4. Default config.yaml content per STATE_FILES.md

5. Create src/cli/commands/init.test.ts:
   - Test directory creation
   - Test config generation
   - Test --force flag
   - Use temp directory

6. Update src/cli/index.ts to register command

After implementation, run:
- npm test -- -t "init command"

Iterate until tests pass.

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: 
Date: 
Summary of changes: 
Files changed: 
Commands run + results: 
If FAIL - where stuck + exact error snippets + what remains:
```

---

## PH5-T10: CLI Plan Command

### Title
Implement puppet-master plan command

### Goal
Create the CLI plan command for start chain execution.

### Depends on
- PH5-T08

### Parallelizable with
- PH5-T09

### Recommended model quality
Medium OK — CLI implementation

### Read first
- REQUIREMENTS.md: Section 18 (CLI Commands)

### Files to create/modify
- `src/cli/commands/plan.ts`
- `src/cli/commands/plan.test.ts`
- `src/cli/index.ts` (add command)

### Implementation notes
- Load requirements file
- Run parsers
- Generate PRD, architecture, tier plan
- Validate and save

### Acceptance criteria
- [ ] `puppet-master plan <requirements>` command works
- [ ] Parses requirements file
- [ ] Generates and saves prd.json
- [ ] Generates and saves architecture.md
- [ ] Validates before saving
- [ ] Tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "plan command"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement plan command for RWM Puppet Master CLI.

CONSTRAINTS:
- Implement ONLY this task (PH5-T10)
- Follow REQUIREMENTS.md Section 18

Create src/cli/commands/plan.ts:

1. PlanOptions interface:
   - requirementsPath: string
   - outputDir?: string (default: .puppet-master)
   - validate?: boolean (default: true)
   - dryRun?: boolean

2. planCommand function:
   - async planCommand(options: PlanOptions): Promise<void>
   
   Steps:
   1. Detect file format
   2. Load and parse requirements
   3. Generate PRD
   4. Generate architecture
   5. Generate tier plan
   6. Validate all (if enabled)
   7. Save files (unless dryRun)

3. Output files (per STATE_FILES.md):
   - .puppet-master/requirements/original.{ext} (copy of input)
   - .puppet-master/prd.json (root level per STATE_FILES.md)
   - .puppet-master/architecture.md (root level per STATE_FILES.md)
   - .puppet-master/plans/tier-plan.md (OPTIONAL - not in STATE_FILES.md)

4. Create src/cli/commands/plan.test.ts:
   - Test with markdown input
   - Test validation errors handled
   - Test dry run mode
   - Test output file creation

5. Update src/cli/index.ts to register command

After implementation, run:
- npm test -- -t "plan command"

Iterate until tests pass.

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: 
Date: 
Summary of changes: 
Files changed: 
Commands run + results: 
If FAIL - where stuck + exact error snippets + what remains:
```

---

## Phase 5 Completion Checklist

Before marking Phase 5 complete:

- [ ] All 10 tasks have PASS status
- [ ] All parsers handle their format correctly
- [ ] PRD generation produces valid structure
- [ ] Architecture generation works
- [ ] Tier plan assigns platforms correctly
- [ ] Validation catches errors
- [ ] CLI init creates correct structure
- [ ] CLI plan runs full pipeline
- [ ] `npm test` passes all Phase 5 tests

### Phase 5 Stop Point

When complete, commit:
```bash
git add .
git commit -m "ralph: phase-5 start-chain complete"
```

---

*End of BUILD_QUEUE_PHASE_5.md*
