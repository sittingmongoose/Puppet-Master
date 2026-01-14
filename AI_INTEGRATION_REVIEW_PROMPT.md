# AI Integration Review Prompt

## Context

This prompt is for an AI agent to review and verify the Start Chain AI integration work completed in Phase 5. The implementation adds AI platform integration to `PrdGenerator` and `ArchGenerator` per ROADMAP.md 6.2.2 and 6.3.2.

## What Was Implemented

The following AI integration was added to the Start Chain pipeline:

1. **PrdGenerator AI Integration** (`src/start-chain/prd-generator.ts`)
   - New `generateWithAI()` method that invokes AI platforms
   - Quota checking via `QuotaManager` before AI calls
   - Prompt building from REQUIREMENTS.md Section 5.2 template
   - JSON parsing with code block extraction
   - Fallback to rule-based `generate()` on all failure modes
   - Usage tracking via `UsageTracker`

2. **ArchGenerator AI Integration** (`src/start-chain/arch-generator.ts`)
   - New `generateWithAI()` method that invokes AI platforms
   - Quota checking via `QuotaManager` before AI calls
   - Prompt building from REQUIREMENTS.md Section 5.3 template
   - Markdown parsing with code block extraction
   - Fallback to template-based `generate()` on all failure modes
   - Usage tracking via `UsageTracker`

3. **Prompt Templates** (NEW)
   - `src/start-chain/prompts/prd-prompt.ts` - PRD generation prompt builder
   - `src/start-chain/prompts/arch-prompt.ts` - Architecture generation prompt builder
   - `src/start-chain/prompts/index.ts` - Barrel exports

4. **Plan Command Updates** (`src/cli/commands/plan.ts`)
   - Initializes AI dependencies (PlatformRegistry, QuotaManager, UsageTracker)
   - Uses `generateWithAI()` by default
   - Added `--no-use-ai` CLI flag for rule-based mode
   - Error handling with graceful fallback

5. **Tests** (12 new tests added)
   - 6 tests in `prd-generator.test.ts` for AI integration scenarios
   - 6 tests in `arch-generator.test.ts` for AI integration scenarios
   - Updated `plan.test.ts` to test `--no-use-ai` flag

## Pre-Review: Read Context Files

**Before starting the review, read these files for context:**

1. **`AGENTS.md`** - Understand project patterns, ESM import rules, type-only exports, testing patterns
2. **`ARCHITECTURE.md`** - Understand Platform Abstraction Layer, how platform runners work
3. **`REQUIREMENTS.md` Sections 5.2 and 5.3** - See the exact prompt templates that should be implemented
4. **`STATE_FILES.md` Section 3.3** - Understand the PRD structure schema that must be generated
5. **`/root/.cursor/plans/start_chain_ai_integration_6ede9755.plan.md`** - The implementation plan to verify against
6. **`src/platforms/base-runner.ts`** - Understand ExecutionRequest/ExecutionResult interfaces
7. **`src/platforms/quota-manager.ts`** - Understand how `canProceed()` and quota checking works
8. **`src/memory/usage-tracker.ts`** - Understand how usage tracking works

**Key Patterns to Understand:**
- ESM imports must use `.js` extension for local files
- Type-only exports must use `export type` and `import type`
- Platform is a type alias, not a runtime value
- All AI calls must go through PlatformRegistry → BasePlatformRunner → execute()
- QuotaManager checks happen before AI calls
- UsageTracker records all AI usage events
- Fallback to rule-based/template-based is mandatory when AI fails

## Review Tasks

### 1. Code Review

**Verify the following files exist and are correctly implemented:**

- [ ] `src/start-chain/prd-generator.ts`
  - [ ] Constructor accepts optional AI dependencies (PlatformRegistry, QuotaManager, Config, UsageTracker)
  - [ ] `generateWithAI()` method exists and is async
  - [ ] Quota checking before AI invocation
  - [ ] Prompt building using `buildPrdPrompt()` from prompts module
  - [ ] Platform runner execution via `platformRegistry.get(platform).execute()`
  - [ ] JSON parsing with code block extraction (`parsePrdJson()`)
  - [ ] Usage tracking via `usageTracker.track()`
  - [ ] Fallback to `generate()` on all error paths
  - [ ] Original `generate()` method preserved as fallback

- [ ] `src/start-chain/arch-generator.ts`
  - [ ] Constructor accepts optional AI dependencies
  - [ ] `generateWithAI()` method exists and is async
  - [ ] Quota checking before AI invocation
  - [ ] Prompt building using `buildArchPrompt()` from prompts module
  - [ ] Platform runner execution
  - [ ] Markdown parsing with code block extraction (`parseArchMarkdown()`)
  - [ ] Usage tracking
  - [ ] Fallback to `generate()` on all error paths
  - [ ] Original `generate()` method preserved as fallback

- [ ] `src/start-chain/prompts/prd-prompt.ts`
  - [ ] `buildPrdPrompt()` function exports correctly
  - [ ] Includes requirements document content
  - [ ] Includes PRD schema specification
  - [ ] Includes verifier token examples (TEST:, CLI_VERIFY:, etc.)
  - [ ] Matches REQUIREMENTS.md Section 5.2 template structure

- [ ] `src/start-chain/prompts/arch-prompt.ts`
  - [ ] `buildArchPrompt()` function exports correctly
  - [ ] Includes requirements summary
  - [ ] Includes PRD structure for context
  - [ ] Requests architecture synthesis
  - [ ] Matches REQUIREMENTS.md Section 5.3 template structure

- [ ] `src/cli/commands/plan.ts`
  - [ ] Imports PlatformRegistry, QuotaManager, UsageTracker
  - [ ] Initializes AI dependencies when `useAI` is true
  - [ ] Calls `prdGenerator.generateWithAI()` when AI enabled
  - [ ] Calls `archGenerator.generateWithAI()` when AI enabled
  - [ ] Falls back to rule-based on errors
  - [ ] `--no-use-ai` flag properly disables AI
  - [ ] Usage tracker path correctly constructed

### 2. Import/Export Verification

**Check that all imports use `.js` extension and type-only exports are correct:**

- [ ] All local imports use `.js` extension (ESM requirement)
- [ ] Type-only imports use `import type` syntax
- [ ] Platform type is imported as type-only where appropriate
- [ ] No runtime imports of type aliases

**Run typecheck:**
```bash
npm run typecheck
```
Expected: No errors

### 3. Test Verification

**Run all Phase 5 related tests:**
```bash
npm test -- src/start-chain/prd-generator.test.ts
npm test -- src/start-chain/arch-generator.test.ts
npm test -- src/cli/commands/plan.test.ts
```

**Expected results:**
- PrdGenerator tests: 31 tests passing (25 original + 6 AI integration)
- ArchGenerator tests: 31 tests passing (25 original + 6 AI integration)
- Plan command tests: 13 tests passing

**Verify AI integration test coverage:**
- [ ] Tests for successful AI generation
- [ ] Tests for quota exhaustion fallback
- [ ] Tests for platform unavailable fallback
- [ ] Tests for JSON/markdown parsing failure fallback
- [ ] Tests for `--no-use-ai` flag
- [ ] Tests for usage tracking

### 4. Integration Verification

**Check that AI dependencies are correctly integrated:**

- [ ] `PlatformRegistry.createDefault(config)` creates registry with all runners
- [ ] `QuotaManager` checks quota before AI calls
- [ ] `UsageTracker` records usage events
- [ ] Config's `tiers.phase.platform` and `tiers.phase.model` are used for AI generation
- [ ] Error handling doesn't break the Start Chain pipeline

### 5. Documentation Verification

**Verify documentation updates:**

- [ ] `BUILD_QUEUE_PHASE_5.md` review summary updated to reflect AI integration
- [ ] `PHASE_5_REVIEW.md` updated to show AI integration as complete
- [ ] All critical gaps marked as resolved

### 6. Backward Compatibility

**Verify backward compatibility:**

- [ ] Existing `generate()` methods still work (rule-based/template-based)
- [ ] Generators can be instantiated without AI dependencies (optional parameters)
- [ ] All existing tests still pass
- [ ] `--no-use-ai` flag allows using rule-based generation

### 7. Error Handling Verification

**Review error handling paths:**

- [ ] Quota exhausted → logs warning, uses fallback, continues
- [ ] Platform unavailable → logs warning, uses fallback, continues
- [ ] JSON parse error → logs error with snippet, uses fallback, continues
- [ ] Timeout → logs warning, uses fallback, continues
- [ ] Invalid response → logs error, uses fallback, continues
- [ ] All errors are non-fatal (Start Chain always produces output)

### 8. Code Quality Checks

**Verify code quality:**

- [ ] TypeScript strict mode compliance
- [ ] No `any` types (except where necessary)
- [ ] Proper async/await usage
- [ ] Meaningful variable names
- [ ] Comments for complex logic
- [ ] Functions are focused and small
- [ ] No code duplication

### 9. Architecture Compliance

**Verify compliance with project architecture (see ARCHITECTURE.md):**

- [ ] Follows PlatformRunnerContract pattern (see `src/platforms/base-runner.ts`)
- [ ] Uses existing PlatformRegistry correctly (see `src/platforms/registry.ts`)
- [ ] Uses existing QuotaManager correctly (see `src/platforms/quota-manager.ts`)
- [ ] Uses existing UsageTracker correctly (see `src/memory/usage-tracker.ts`)
- [ ] No API calls (CLI only, as per REQUIREMENTS.md Section 1.3)
- [ ] Fresh process spawning (via platform runners, not session reuse)
- [ ] Follows module responsibilities per ARCHITECTURE.md
- [ ] No violations of Platform Abstraction Layer patterns

### 10. Requirements Compliance

**Verify compliance with REQUIREMENTS.md (read relevant sections first):**

- [ ] PRD generation prompt matches Section 5.2 template exactly
  - [ ] Includes requirements document content placeholder
  - [ ] Includes PRD schema specification
  - [ ] Includes verifier token examples (TEST:, CLI_VERIFY:, etc.)
  - [ ] Includes generation rules (phases → tasks → subtasks, dependency ordering)
- [ ] Architecture generation prompt matches Section 5.3 template
  - [ ] Includes requirements summary
  - [ ] Includes PRD structure for context
  - [ ] Requests architecture synthesis with all required sections
- [ ] Budget checks performed before AI calls (Section 23 - Budget Management)
  - [ ] Uses QuotaManager.checkQuota() or canProceed()
  - [ ] Respects maxCallsPerRun, maxCallsPerHour, maxCallsPerDay
- [ ] Usage tracking records all AI calls (Section 17 - Memory Layer)
  - [ ] Records platform, action, tokens, duration, success
  - [ ] Uses UsageTracker.track() method
- [ ] Fallback behavior when AI unavailable (should always produce output)
- [ ] No API calls (CLI only, Section 1.3 constraint)
- [ ] PRD structure matches STATE_FILES.md Section 3.3 schema

## Verification Commands

Run these commands to verify the implementation:

```bash
# Type checking
npm run typecheck

# Run all Phase 5 tests
npm test -- src/start-chain src/cli/commands/plan.test.ts

# Run specific AI integration tests
npm test -- src/start-chain/prd-generator.test.ts -t "AI integration"
npm test -- src/start-chain/arch-generator.test.ts -t "AI integration"

# Verify exports
npm test -- src/start-chain/index.ts 2>&1 | grep -i "export"
```

## Expected Outcomes

After review, you should confirm:

1. ✅ All code is correctly implemented per the plan
2. ✅ All tests pass (211 Phase 5 tests)
3. ✅ TypeScript compilation succeeds
4. ✅ Error handling is comprehensive
5. ✅ Fallback mechanisms work correctly
6. ✅ Documentation is updated
7. ✅ Backward compatibility is maintained
8. ✅ Code quality meets project standards
9. ✅ Architecture patterns are followed
10. ✅ Requirements are met

## Files to Review

**Core Implementation:**
- `src/start-chain/prd-generator.ts`
- `src/start-chain/arch-generator.ts`
- `src/start-chain/prompts/prd-prompt.ts` (NEW)
- `src/start-chain/prompts/arch-prompt.ts` (NEW)
- `src/start-chain/prompts/index.ts` (NEW)
- `src/cli/commands/plan.ts`

**Tests:**
- `src/start-chain/prd-generator.test.ts`
- `src/start-chain/arch-generator.test.ts`
- `src/cli/commands/plan.test.ts`

**Documentation:**
- `BUILD_QUEUE_PHASE_5.md` (review summary section)
- `PHASE_5_REVIEW.md` (updated findings)

**Reference Documentation (Read These First for Context):**

**Canonical Project Documentation:**
- `AGENTS.md` - Project patterns, codebase rules, DO/DON'T checklist, ESM import patterns
- `ARCHITECTURE.md` - System architecture, module responsibilities, Platform Abstraction Layer
- `REQUIREMENTS.md` - Full system requirements
  - Section 5.2: PRD generation prompt template (what the prompt should look like)
  - Section 5.3: Architecture generation prompt template
  - Section 17: Memory Layer (UsageTracker requirements)
  - Section 23: Budget Management (QuotaManager requirements)
- `ROADMAP.md` 
  - 6.2.2: PRD generation AI integration requirement
  - 6.3.2: Architecture generation AI integration requirement
- `STATE_FILES.md` - PRD structure schema (Section 3.3) - verify generated PRDs match this
- `.cursorrules` - Workspace rules, ESM import patterns, testing requirements

**Implementation Plan:**
- `/root/.cursor/plans/start_chain_ai_integration_6ede9755.plan.md` - Detailed implementation plan with all tasks

**Related Implementation Files (For Understanding Dependencies):**
- `src/platforms/registry.ts` - How PlatformRegistry works
- `src/platforms/base-runner.ts` - PlatformRunnerContract interface
- `src/platforms/quota-manager.ts` - How quota checking works
- `src/memory/usage-tracker.ts` - How usage tracking works
- `src/types/platforms.ts` - ExecutionRequest and ExecutionResult interfaces
- `src/types/config.ts` - PuppetMasterConfig, Platform, TierConfig types
- `src/types/prd.ts` - PRD interface structure (verify generated PRDs match)

**Phase 5 Context:**
- `BUILD_QUEUE_PHASE_5.md` - Original Phase 5 tasks and review summary
- `PHASE_5_REVIEW.md` - Detailed Phase 5 review findings (shows what was missing before)

## Review Checklist

Use this checklist to track your review:

- [ ] Code review complete
- [ ] Import/export verification complete
- [ ] All tests pass
- [ ] Integration verification complete
- [ ] Documentation updated correctly
- [ ] Backward compatibility verified
- [ ] Error handling verified
- [ ] Code quality verified
- [ ] Architecture compliance verified
- [ ] Requirements compliance verified

## Questions to Answer

1. Does the implementation match the plan in `start_chain_ai_integration_6ede9755.plan.md`?
2. Are there any security concerns with the AI integration?
3. Are there any performance concerns?
4. Is the error handling robust enough for production?
5. Are the fallback mechanisms reliable?
6. Is the code maintainable and well-documented?
7. Are there any edge cases not covered by tests?
8. Does the implementation follow all project rules (AGENTS.md, .cursorrules)?
9. Do the prompt templates match REQUIREMENTS.md Sections 5.2 and 5.3 exactly?
10. Does the generated PRD structure match STATE_FILES.md Section 3.3 schema?
11. Are all ESM import patterns correct (AGENTS.md Codebase Patterns)?
12. Are type-only exports used correctly for Platform and other type aliases?
13. Does the implementation respect the CLI-only constraint (no API calls)?
14. Are platform runners used correctly per ARCHITECTURE.md Platform Abstraction Layer?

## Report Format

After completing the review, provide:

1. **Summary**: Overall assessment (PASS/FAIL with concerns)
2. **Findings**: List of issues found (if any)
3. **Recommendations**: Suggestions for improvements (if any)
4. **Verification Results**: Test results, typecheck results
5. **Compliance Status**: Requirements, architecture, code quality

---

**Reviewer Instructions**: 

1. **Start by reading the context files** listed in "Pre-Review: Read Context Files" section above
2. **Understand the patterns** - ESM imports, type-only exports, platform runner contract
3. **Verify against the plan** - Check that implementation matches the plan
4. **Check compliance** - AGENTS.md rules, REQUIREMENTS.md specs, ARCHITECTURE.md patterns
5. **Test thoroughly** - Run all tests, verify typecheck passes
6. **Be thorough but efficient** - Focus on correctness, completeness, and compliance
7. **Document issues clearly** - Include file paths, line numbers, and specific violations
8. **Verify prompt templates** - Compare against REQUIREMENTS.md Sections 5.2 and 5.3
9. **Check PRD structure** - Verify generated PRDs match STATE_FILES.md Section 3.3 schema
10. **Verify dependencies** - Ensure PlatformRegistry, QuotaManager, UsageTracker are used correctly
