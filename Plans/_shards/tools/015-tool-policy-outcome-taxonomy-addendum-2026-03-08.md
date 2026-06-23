# Shard 015: Tool Policy Outcome Taxonomy Addendum (2026-03-08)

Source: `Plans/Tools.md`

Source lines: L1428-L1458

Source SHA256: `85e8dc86742832e1f4e8361022659b17aea2aa1a148b1e02c11e2dd71ff2696f`

---

## Tool Policy Outcome Taxonomy Addendum (2026-03-08)


### 1. Tool-layer outcomes must map into runtime blocked/failure classes

The tool system remains the canonical source of immediate tool-policy decisions, but those decisions must map cleanly into the shared runtime taxonomy.

Required mappings:
- `permission_denied` -> blocked / `permission_denied`
- `user_declined` -> blocked / `user_declined`
- `headless_ask_denied` -> blocked / `headless_ask_denied`
- `filesafe_blocked` -> blocked / `filesafe_blocked`
- `validation_blocked` -> blocked / implementation-specific reason code, not generic failure

### 2. blocked vs failed

If the tool call never executed because policy blocked it, the outcome is blocked/denied, not execution failure.

### 3. Runtime integration

Tool outcomes must carry enough information for runtime recovery UI:
- guard / policy source
- reason code
- recovery options where applicable
- whether the action executed at all

### 4. Acceptance criteria

- Tool-layer policy outcomes map deterministically into the shared runtime taxonomy.
- Non-executed tool calls are not mislabeled as execution failures.
- Recovery-capable blocked outcomes carry enough information for UI/assistant/orchestrator surfaces.
