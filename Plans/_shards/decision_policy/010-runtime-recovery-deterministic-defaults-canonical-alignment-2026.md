# Shard 010: Runtime Recovery Deterministic Defaults Canonical Alignment (2026-03-09)

Source: `Plans/Decision_Policy.md`

Source lines: L395-L415

Source SHA256: `72a2faae8bec90e7e64eb6d845451a37b9f491de47e4bcb8e00339ff5bf4861d`

---

## Runtime Recovery Deterministic Defaults Canonical Alignment (2026-03-09)

Where higher-precedence sources do not decide, use these defaults:
- scored event-driven scheduling is the default runtime model
- canonical event names and enum families from `Plans/Contracts_V0.md` win over older aliases
- `watchdog_recheck` may emit redundant wakeups defensively, but MUST NOT become the primary correctness path
  ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md
- no critical-path scheduler term in MVP
- blind retry is forbidden
- default retry ceiling remains `3` attempts unless a higher-precedence contract narrows it
- default remediation ceiling remains `3` generations unless a higher-precedence contract narrows it
- blocked outcomes preserve completed local work by default when execution stopped because a prerequisite or remote side effect was unresolved
- prerequisite resolution always creates a new attempt snapshot rather than mutating an old one in place
- draft decomposition may degrade only before graph lock
- canonical graph integrity failures do not degrade silently
- Mutation-sensitive git snapshot failures are CRITICAL and must not be swallowed: if `git add` or an equivalent snapshot step fails, `/undo` metadata must not advance to a poisoned hash or silently point at a weeks-old state.
- Provider response guards are deterministic: PROV adapters must check `choices.len` before indexing; an empty content-filtered response maps to `FinishReasonContentFilter` instead of a panic or normal completion.

Where earlier policy prose is ambiguous, these defaults win.

ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md
