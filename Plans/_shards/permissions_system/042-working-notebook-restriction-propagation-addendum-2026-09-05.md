# Shard 042: Working Notebook Restriction Propagation Addendum (2026-09-05)

Source: `Plans/Permissions_System.md`

Source lines: L9452-L9523

Source SHA256: `65f8cfc8efb2bacf69961629152d9bdba0f2c626c8121147d3ec11b2985f1c53`

---

## Working Notebook Restriction Propagation Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. Source restrictions (Context Lens mutes owned by `Plans/assistant-chat-design.md`, revocations, protected evidence, blind-phase material, Assistant-only memory) propagate to every derived context surface: notes, summaries, resume capsules, handoffs, search projections, and future prompt caches. A derived artifact inherits the effective restrictions of its sources at derivation time and at every later read; relabeling, paraphrasing, partial quoting, or exporting restricted source content through note text cannot widen access. When exact dependency isolation between a revoked/muted source and a derived block is unavailable, the derived block is excluded or rebuilt conservatively rather than silently declassified; bytes already sent to a provider are disclosed as sent, never claimed as recalled. Retrieval restrictions are read-time properties: search hits and exact-ID reads (including `chatread` and notebook reads) apply the same project/thread/actor/phase, permission, redaction, visibility, Context Lens, and phase checks; knowledge of an opaque identifier is not permission, and denied titles, snippets, counts, and existence stay undisclosed. Notebook text is attributed task data, never an authority source: permissions, approvals, completions, and phase releases are decided by their owners, and blind-phase participant material stays inaccessible to other participants until the workflow owner releases it, across every route (direct read, search, import, capsule, shared notes).

```yaml
plan_unit_id: PS-140
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: Source restrictions propagate to all derived context surfaces (notes, summaries, capsules, handoffs, search projections, caches) and are enforced at read time on every path including direct-ID reads. Paraphrase, relabel, partial quote, or export cannot widen access; conservative exclusion/rebuild applies when dependency isolation is unavailable; already-sent bytes are disclosed, never claimed recalled. Denied existence is not leaked through error differentials, counts, or titles, and blind-phase material stays inaccessible across direct read, search, import, capsule, and shared-note routes until the workflow owner releases it.
gui_related: false
gui_classification_reason: Restriction propagation is permission behavior, not GUI work.
depends_on: [PS-120, WN-010]
unblocks: [PS-141]
acceptance_criteria:
  - Muting a source after derivative creation removes its substantive content from future dispatch.
  - A known entry/record ID grants nothing without a current read-time check.
  - No forbidden existence leak through errors, counts, or titles.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - Plans/working_notebook_contract_fixtures.json
risk_class: restriction_laundering
reasoning_tier: high
context_scope: permission_contracts
implementation_surfaces: [Plans/Permissions_System.md, Plans/Prompt_Pipeline.md, Plans/Working_Notebook.md]
node_compile_hint: {mode: permission_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-H05
  - source_packet:PM-WNC-2026-09-05-v1:WNC-H02
  - source_packet:PM-WNC-2026-09-05-v1:WNC-N12
preserved_exact_tokens: ["derived", "read-time", "conservatively", "already sent", "not permission"]
negative_constraints:
  - Do not declassify derived content by paraphrase or partial quote.
  - Do not let checkpoint or capsule selection bypass phase restrictions.
owner_hints: [Plans/Permissions_System.md, Plans/Working_Notebook.md]
```

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Working_Notebook.md, ContractName:Plans/assistant-chat-design.md

```yaml
plan_unit_id: PS-141
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: "Notebook text is attributed task data and never an authority source. Retrieved note bodies cannot override current user intent, instruction precedence, tool policy, or approvals; quoted hostile text and imported notes cannot promote themselves into system instructions; and permission, approval, completion, and phase-release decisions cite owner state only. Authorization evidence survives context transitions independently: authoritative approvals and current instructions are retained outside notebooks and lossy summaries, and final dispatch re-admission (Permissions/FileSafe plus ProviderDispatchAdmissionReceipt) runs against new visible bytes and changed dependencies, so a note claiming approval or an old dispatch receipt never authorizes reconstructed bytes or a changed account."
gui_related: false
gui_classification_reason: Authority rules are permission behavior, not GUI work.
depends_on: [PS-140]
unblocks: []
acceptance_criteria:
  - A note saying approved does not authorize dispatch; owner receipts decide.
  - Old dispatch receipts cannot authorize reconstructed bytes or a changed account.
  - Injection and import fixtures preserve instruction/data separation.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: note_authority_escalation
reasoning_tier: high
context_scope: permission_contracts
implementation_surfaces: [Plans/Permissions_System.md, Plans/FileSafe.md, Plans/Shared_Integration_Runtime.md]
node_compile_hint: {mode: permission_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-N10
  - source_packet:PM-WNC-2026-09-05-v1:WNC-C15
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A31
preserved_exact_tokens: ["attributed task data", "a note saying approved is not an approval receipt"]
negative_constraints:
  - Do not resolve authority from note prose.
  - Do not skip final dispatch re-admission after reconstruction.
owner_hints: [Plans/Permissions_System.md, Plans/Prompt_Pipeline.md]
```

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/Working_Notebook.md
