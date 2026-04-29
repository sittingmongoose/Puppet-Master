## Clarification Escalation and Draft Decomposition Addendum (2026-03-08)

### 1. Canonical wizard state correction

See canonical `wizard_status` definition in §2.1.

### 2. attention_required vs blocked

Required distinction:
- `attention_required`: the current clarification cycle can continue; answering the current questions may unblock progress
- `blocked`: clarification rounds are exhausted or otherwise cannot progress automatically; the system must preserve the latest report and stop auto-rewrite/auto-advance until new explicit user input is provided

Required `blocked` rules:
- `Proceed` and `Start Run` remain disabled
- UI copy must explicitly explain that repeated clarification attempts did not resolve the issue set
- the latest canonical quality report remains preserved
- no further automatic rewrite of requirements may happen without new explicit user input

### 3. Dashboard / thread / resume behavior

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0591
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - multiple surfaces already emit attention-like objects: wizard cards, thread badges, dashboard CtAs, blocked-node lists, auth badges, and resume URLs
  - `FinalGUISpec.md` wizard attention and blocked CtA cards are especially explicit: they already define concrete actions like `Resume Wizard` and `View in Thread`, but those actions still resolve through special-case fields rather than a shared navigation object.
  - FinalGUISpec.md
  - Resume Wizard
  - View in Thread
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

The wizard packet must support both:
- `wizard_attention_required`
- `wizard_blocked`

Required shared fields:
- `wizard_id`
- `wizard_step`
- `report_ref`
- `resume_url`
- `thread_id?`
- `status`

### 4. Draft decomposition degradation boundary

This wizard/interview planning surface owns the pre-canonical degradation allowance.

Required rule:
- if adaptive decomposition or dependency extraction produces invalid/cyclic output before canonical graph lock, the system may degrade to deterministic flat draft sequencing
- such degradation must emit warning evidence and a degradation record
- once the canonical sharded graph is locked, no silent degradation is allowed

### 5. Acceptance criteria

- `blocked` appears everywhere `wizard_status` is canonically defined.
- Wizard blocked and attention_required use distinct semantics and user copy.
- Resume/deep-link behavior works for both states.
- Draft decomposition degradation is allowed only before canonical graph lock and is evidence-backed.
