# P1-T06: Generate Real Test Plans

## Overview
Replace the empty `createTestPlan()` method in `prd-generator.ts` with a `TestPlanGenerator` class that detects project type and generates actual executable test commands based on the project's language and framework.

## Subagent Assignments

### Phase 1: Core Implementation
**Subagent: typescript-pro**
- Task: Create `src/start-chain/test-plan-generator.ts` with TestPlanGenerator class
- Task: Update `src/start-chain/prd-generator.ts` to use TestPlanGenerator
- Task: Update `src/start-chain/multi-pass-generator.ts` to use TestPlanGenerator

**Rationale:** TypeScript implementation requires advanced type system usage, async/await patterns, and integration with existing codebase. The typescript-pro agent specializes in TypeScript 5.0+ with strict mode and type safety.

### Phase 2: Test Suite Creation
**Subagent: test-automator**
- Task: Create `src/start-chain/test-plan-generator.test.ts` with comprehensive test coverage
- Task: Verify all acceptance criteria through tests

**Rationale:** Test automation requires framework design, test strategy, and comprehensive coverage. The test-automator agent specializes in building robust test frameworks and achieving high coverage.

## Implementation Steps

### 1. Create `src/start-chain/test-plan-generator.ts` (typescript-pro)

**DetectedProject Interface:**
```typescript
interface DetectedProject {
  language: 'typescript' | 'python' | 'rust' | 'go' | 'java' | 'unknown';
  framework?: string;
  hasTests: boolean;
  testCommands: string[];
  lintCommands: string[];
  buildCommands: string[];
}
```

**TestPlanGenerator Class:**
- `detectProject(projectPath: string): Promise<DetectedProject>`
  - Check for project files using `fs.promises.access()` or `fs.promises.stat()`:
    - `package.json` → TypeScript/JavaScript (check for `tsconfig.json` to distinguish)
    - `pyproject.toml` or `setup.py` → Python
    - `Cargo.toml` → Rust
    - `go.mod` → Go
    - `pom.xml` → Java (Maven)
    - `build.gradle` or `build.gradle.kts` → Java/Kotlin (Gradle)
  - Check for test files/directories:
    - TypeScript: `**/*.test.ts`, `**/*.spec.ts`, `tests/`, `__tests__/`
    - Python: `**/test_*.py`, `**/*_test.py`, `tests/`
    - Rust: `**/*_test.rs`, `tests/`
    - Go: `**/*_test.go`, `**/*.test.go`
    - Java: `**/*Test.java`, `**/*Tests.java`, `src/test/`
  - Generate commands based on detected project:
    - TypeScript: `npm test`, `npm run typecheck`, `npm run lint`
    - Python: `pytest`, `ruff check .`, `mypy .`
    - Rust: `cargo test`, `cargo clippy`
    - Go: `go test ./...`, `go vet ./...`
    - Java: `mvn test`, `./gradlew test` (depending on build system)

- `generateTestPlan(detected: DetectedProject, subtask: Subtask): TestPlan`
  - Convert command strings to `TestCommand[]` format
  - Set `failFast: true` by default
  - Return empty commands array if no tests detected (with warning)

- `generateTestSetupSubtask(detected: DetectedProject, taskId: string, subtaskIndex: number): SubtaskSpec | null`
  - Return `null` if `detected.hasTests === true`
  - Otherwise return subtask spec:
    ```typescript
    {
      title: 'Set up test harness',
      description: `Create test infrastructure for ${detected.language} project`,
      acceptanceCriteria: [
        'Test framework configured',
        'At least one passing test exists',
      ],
    }
    ```

### 2. Update `src/start-chain/prd-generator.ts` (typescript-pro)

**Changes:**
- Import `TestPlanGenerator` from `./test-plan-generator.js`
- Add `testPlanGenerator` as optional constructor parameter (or create instance internally)
- Update `createTestPlan()` method to be async:
  ```typescript
  async createTestPlan(content: string, subtask?: Subtask): Promise<TestPlan> {
    const generator = new TestPlanGenerator(this.config?.project.workingDirectory ?? '.');
    const detected = await generator.detectProject(projectPath);
    return generator.generateTestPlan(detected, subtask);
  }
  ```
- Update calls to `createTestPlan()` to await:
  - In `generateSubtasks()`: `const testPlan = await this.createTestPlan(chunk, subtask);`
  - In `generateTasks()`: `const testPlan = await this.createTestPlan(taskSection.content, task);`
  - In `generatePhases()`: `const testPlan = await this.createTestPlan(section.content, phase);`

### 3. Update `src/start-chain/multi-pass-generator.ts` (typescript-pro)

**Changes:**
- Import and use `TestPlanGenerator` similarly
- Update `createTestPlan()` method to use `TestPlanGenerator`
- Make it async and update all callers

### 4. Create `src/start-chain/test-plan-generator.test.ts` (test-automator)

**Test Cases:**
- TypeScript project detection (with and without tests)
- Python project detection (with and without tests)
- Rust project detection (with and without tests)
- Go project detection (with and without tests)
- Java project detection (Maven and Gradle)
- Unknown project type handling
- Test command generation for each language
- Test setup subtask generation (when no tests exist)
- Empty test plan warning when no tests detected
- Async detection handling
- File system error handling

**Test Setup:**
- Use temporary directories with mock project files
- Create test files/directories as needed using `fs.promises.mkdir()` and `fs.promises.writeFile()`
- Clean up after tests using `fs.promises.rm()` or similar

## Files to Create/Modify

1. **NEW:** `src/start-chain/test-plan-generator.ts` (typescript-pro)
2. **NEW:** `src/start-chain/test-plan-generator.test.ts` (test-automator)
3. **MODIFY:** `src/start-chain/prd-generator.ts` (typescript-pro)
   - Update `createTestPlan()` to use `TestPlanGenerator`
   - Make it async and update callers
4. **MODIFY:** `src/start-chain/multi-pass-generator.ts` (typescript-pro)
   - Update `createTestPlan()` similarly

## Dependencies

- Uses Node.js `fs.promises` for file system operations
- Uses `path` module for path joining
- Requires `PuppetMasterConfig` for working directory access
- Uses `Subtask` type from `../types/prd.js`
- Uses `TestPlan`, `TestCommand` types from `../types/tiers.js`

## Constraints

- Don't assume tools exist without checking (e.g., don't assume `pytest` is installed)
- Include framework-specific commands when detected (e.g., Vitest vs Jest for TypeScript)
- Keep commands simple and reliable
- Handle missing project files gracefully (return 'unknown' language)
- Use Context7 MCP for Node.js file system best practices if needed
- Follow ESM import rules (use `.js` extension for local imports)
- Use `import type` for type-only imports

## Testing

Run after implementation:
```bash
npm run typecheck
npm test -- src/start-chain
```

## Acceptance Criteria Verification

- [ ] TestPlanGenerator detects project type correctly
- [ ] Test commands populated based on project
- [ ] Empty test plan triggers warning when no tests exist
- [ ] Subtask created to add tests if none exist (via `generateTestSetupSubtask()`)
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/start-chain` passes

## Execution Order

1. **typescript-pro** implements TestPlanGenerator class and updates generators
2. **test-automator** creates comprehensive test suite
3. Both agents coordinate to ensure all acceptance criteria are met
4. Final verification: run typecheck and tests
