# Shard 027: Platform capability next steps

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L3531-L3547

Source SHA256: `dc7f335ea38658467e69a555fc6a2a669e01c04eb320642162f60966bb1c7778`

---

## Platform capability next steps

1. Review and approve this plan
2. Implement Phase 1 (Project Context Detection)
3. Implement Phase 2 (Subagent Selector)
4. Integrate with orchestrator
5. Test with real projects

---

### Implementation Notes

- **Where:** New module `src/core/hooks.rs` or `src/verification/hooks.rs` for hook system; `src/core/memory.rs` for cross-session persistence; extend `SubagentOutput` in `src/types/` for structured handoff.
- **What:** Implement `BeforeUnitHook` and `AfterUnitHook` traits; `save_memory()` and `load_memory()` functions; `validate_subagent_output()` with platform-specific parsers; remediation loop in orchestrator completion logic.
- **When:** Hooks run automatically at tier boundaries; memory persists at Phase completion and loads at run start; remediation loop runs when Critical/Major findings detected.

---
