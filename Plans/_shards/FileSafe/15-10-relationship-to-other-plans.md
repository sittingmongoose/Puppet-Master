## 10. Relationship to Other Plans

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0222
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Normalize every other routed identity through `object_kind` + `object_id`.
  - object_kind
  - object_id
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

### 10.1 Orchestrator Plan

The guard integrates into `BaseRunner::execute_command()` which is called by platform runners during orchestrator execution. No changes needed to orchestrator logic itself.

### 10.2 Interview Plan

The guard protects all agent-executed commands, including those run during interview phases. No interview-specific changes needed.

### 10.3 Worktree Plan

The guard applies to commands executed in worktrees. No worktree-specific changes needed.

### 10.4 MiscPlan

The guard complements cleanup policies by preventing destructive operations before they occur.

### 10.5 newfeatures (Hooks and FileSafe)

**Plans/newfeatures.md §9** (Hook system) defines a **user/plugin extension point**: events (e.g. PreToolUse), scripts that return continue/block/modify. Dangerous-command blocking is part of **FileSafe**: the Command blocklist and PreToolUse integration use the same blocklist and extension point. FileSafe is the **core pre-execution guard** in the runner; hooks can call into FileSafe (e.g. PreToolUse invokes FileSafe blocklist checks) or provide optional user-defined rules. Use one blocklist and one integration point; see newfeatures §17.4 "FileSafe first."

### 10.6 Tools.md (tool permissions and OpenCode alignment)

**Plans/Tools.md** defines the central tool registry and permission model (allow/deny/ask) and aligns with [OpenCode Permissions](https://opencode.ai/docs/permissions/). FileSafe and tool permissions are **complementary**: tool permission = "may the agent call this tool?"; FileSafe = "may this specific invocation proceed?" (e.g. bash allowed but command blocked). Tools.md §2.5 maps FileSafe to OpenCode-style granular rules: **command blocklist** ≈ bash deny patterns; **write scope** ≈ edit path allowlist; **security filter** ≈ read path deny (e.g. .env). Implement via a single **central policy engine**; see Tools.md §2.4 and §8.2.

---

