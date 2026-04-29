## Scheduler, blocked, and Remediation GUI Addendum (2026-03-08)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0259
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - The GUI should never guess that a previously visible `[retired-token-1]` set is still valid if the blocked projection is stale.
  - [retired-token-1]
  - normative ghost IDs still survive through examples, Final GUI remediation actions, and non-catalog command references.
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

> **Superseded** — see Canonical Blocked/Recovery Behavior below.

### 1. Dashboard cards

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0261
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - wizard-blocked cards outrank wizard-attention-required
  - Dashboard CtA cards, thread badges, and blocked/attention notices already carry the right kinds of identity:
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

The Dashboard must distinguish:
- `wizard_attention_required`
- `wizard_blocked`
- HITL blocked actions
- remote-side-effect blocked actions

`wizard_blocked` card requirements:
- more severe copy than `wizard_attention_required`
- primary CTA: `Resume Wizard`
- secondary CTA: `View report`
- auto-dismiss only when the wizard leaves `blocked`

### 2. Assistant thread selector / badges

#### 2.1 Worktree icon in thread selector

Each thread row in the thread selector displays a worktree icon when the thread has an active worktree binding.

- **Position:** Left gutter of thread row, vertically below the status badge (running/blocked/attention)
- **Icon:** Theme-consistent branch/tree glyph from icon set
- **Visibility:** Present only when thread has a worktree binding; absent (no placeholder) when unbound
- **Hover tooltip:** Branch name, status pill text, worktree path
- **Icon color:** Clean: `icon-secondary`. Dirty: `accent-warning`. Conflict: `accent-error`. Colors resolve through theme tokens across all three built-in themes.
- **Stale projection:** Icon shows last-known state with subtle desaturation; tooltip appends "(status may be outdated)"

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Wiring_Matrix.md

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md

Thread and session navigation uses persistent shell surfaces.

Rules:
- the active thread list is visible in a persistent sidebar or equivalent persistent region, not only in a floating overlay
- the selector must expose running, queued, blocked, and attention-required badges per thread
- branch lineage is visible in the selector/history model using stable branch labels and source lineage metadata
- badge aggregation must preserve highest-severity state while still showing blocked counts when present
- the project/session browser may complement thread navigation but does not replace the active-thread list inside chat

The floating thread-list overlay pattern is not canonical after this section.
### 3. Run Graph and Orchestrator views

Required visible scheduler/remediation data:
- wake reason
- ready/blocked/backoff/remediation counts
- selected-node score breakdown
- ready-but-unselected reasons
- safe-point ID
- remediation lineage identifiers

### 4. blocked outcome copy

When a remote side effect or guard prevents execution, the GUI MUST present the outcome as `blocked`, not `failed`, and must preserve any completed local work.

### 5. Event-driven correctness

All scheduler/remediation/blocked UI updates must follow the existing `invoke_from_event_loop` event-driven rule. No timer polling for correctness.

### 6. Acceptance criteria

- Dashboard has a first-class `wizard_blocked` card.
- Thread badges distinguish `blocked` from `attention_required`.
- Scheduler/remediation state is inspectable in run surfaces.
- blocked outcomes are not mislabeled as failures.
- new runtime widgets obey the event-driven rewrite rule.
