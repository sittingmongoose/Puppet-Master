## Implementation Phases

### Phase 1: Project Context Detection
- [ ] Implement `ProjectContext` detection
- [ ] Language detection from codebase files
- [ ] Framework detection
- [ ] Domain inference from task descriptions

### Phase 2: Subagent Selector
- [ ] Implement `SubagentSelector` with tier-level selection logic
- [ ] Language-to-subagent mapping
- [ ] Framework-to-subagent mapping
- [ ] Domain-to-subagent mapping

### Phase 3: Orchestrator Integration
- [ ] Add subagent selection to orchestrator
- [ ] Build tier context from tier nodes
- [ ] Invoke subagents via platform runners
- [ ] Handle subagent responses

### Phase 4: Error Pattern Detection
- [ ] Detect error patterns from iteration outputs
- [ ] Automatically invoke debugger/security-auditor/etc.
- [ ] Pattern-based subagent selection

### Phase 5: Testing & Refinement
- [ ] Test with different project types (Rust, Python, JavaScript, Swift)
- [ ] Verify subagent selection accuracy
- [ ] Refine selection logic based on results
- [ ] **Provider connectivity verification (smoke tests)**: Run real CLIs for CLI-bridged providers and a minimal API call for Gemini; assert exit success or successful response and non-empty/expected output; environment-gated or manual where CI has no CLI/auth.
- [ ] **Subagent-invocation integration tests**: Build and execute the actual orchestrator CLI command per platform for a given tier + subagent; verify invocation path and run completion.
- [ ] **Plan mode CLI verification**: Run real CLIs per platform with plan mode enabled (e.g. `--mode=plan`, `--permission-mode plan`); assert exit success and that plan-mode flags are applied and honored; environment-gated like other CLI tests.

