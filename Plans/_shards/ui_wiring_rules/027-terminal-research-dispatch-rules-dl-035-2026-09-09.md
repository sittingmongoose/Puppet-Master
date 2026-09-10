# Shard 027: Terminal Research Dispatch Rules — DL-035 (2026-09-09)

Source: `Plans/UI_Wiring_Rules.md`

Source lines: L1517-L1592

Source SHA256: `f67ecdcee1e1368527206db111e9bc9fd32b139dd2b8ee1036da9cfbd31d8e4a`

---

## Terminal Research Dispatch Rules — DL-035 (2026-09-09)

The six handlerless catalog candidates are represented explicitly in `Plans/Wiring_Matrix.production.exclusions.json`, following the existing Working Notebook candidate convention. These are exact temporary candidate exclusions, not active-command exemptions. Future admission must remove each exact exclusion atomically with its command/handler registration and production wiring.

UCC-160 and WM-052 define the six terminal action candidates and their future single-owner dispatch routes. The existing UIW-019 candidate rule applies: a listed contract is not runtime registration, an unwired control is disabled with a truthful reason, and this Plans compile adds no production wiring JSON. All offered entry points use the catalog command and shared strict envelope. Menu, shortcut, card or Settings code must not write directly to a PTY, change an environment, perform remote setup, materialize missing output or flip a protection flag independently.

Immediately before an effect, the owner revalidates exact session/host/environment, source-record identity where applicable, expected revision, permissions and idempotency. View detach/move/reopen or a delayed reply cannot redirect a request to a replacement session. Input insertion must prove insert-only behavior for the exact prompt and input mode before any write; multiline/control-character or TUI ambiguity produces no effect. Protection setters route through one owner and never toggle on repeated delivery. Output continues while protected; same-session reconnect restores owner state, replacement starts unlocked, and no historical projection proves a process alive. Under DL-038, user and agent terminal input use the same protection check before a child write; agents receive an explicit blocked result. No direct or command-mediated input route may silently bypass, unlock or queue a protected write for later replay. Separate interrupt/terminate controls keep existing authority and behavior.

Open-retained-output first obtains a coherent retained artifact view with exact provenance, redaction and partial status, then uses the existing document route/OpenSubject path. Environment provenance opens an object projection and uses no fictitious document identity. Setup and replacement use existing permissions and confirmation contracts. Result projection and focus return follow the originating context; accepted dispatch and dismissal are not success. P7 progress creates no new action route, and P11 evaluation creates no user mux control.

### UIW-021 - Terminal Research Action Dispatch

```yaml
plan_unit_id: UIW-021
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: Terminal research action wiring preserves one catalog/owner dispatch path, revalidates identity
  and authorization before effects, guarantees insert-only input, and distinguishes coherent output opening
  from object inspection. Candidate status and missing native handlers remain visible; protection is an owner
  state and never a local toggle.
gui_related: true
gui_classification_reason: User-visible command routing, availability, failure and result projection.
depends_on:
- UIW-019
- UCC-160
- WM-052
unblocks: []
acceptance_criteria:
- All offered UI paths dispatch the same UCC-160 command through one owner; no direct PTY/remote/install/environment/input-protection
  bypass exists.
- Stale identity/revision, unauthorized host, unsafe prompt insertion and duplicate request cases produce no
  unauthorized effect and preserve the exact source/target context.
- Protection idempotency, output drain, same-session reconnect and replacement-unlocked behavior are tested
  through keyboard, pointer and agent input paths with accessible state and deterministic return; protected agent writes return an explicit blocked result and no child bytes, while independent interrupt/terminate controls retain existing behavior.
- Output route/OpenSubject is built from a coherent retained subject with partial/unavailable truth; environment
  inspection uses the canonical object route without extra collection.
- Before actual registration and handler/wiring evidence, controls remain truthfully unavailable. No runtime
  event, production row or native success is inferred from static Plans.
- Exactly the six handlerless UCC-160 candidates appear as exact, explained exclusions in Plans/Wiring_Matrix.production.exclusions.json
  only while candidate_not_registered. No wildcard or active-command exemption is added; each exact exclusion
  is removed atomically with command/handler admission and production wiring.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
- Plans/Automated_Testing_System.md#ATS-047 — future terminal fixtures
- python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: terminal_dispatch_bypass_or_false_input_guarantee
reasoning_tier: high
context_scope: terminal_research_dispatch
implementation_surfaces:
- Plans/UI_Wiring_Rules.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
- Plans/Wiring_Matrix.production.json
- Plans/Wiring_Matrix.production.exclusions.json
node_compile_hint:
  mode: terminal_candidate_wiring_specification
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-038
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0014
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/source_shards/input_scope_answer_20260909.md
- Plans/Decision_Log.md#DL-035
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0008
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0010
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0011
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0012
negative_constraints:
- No local action that bypasses a canonical command/owner.
- No implicit Enter, multiline execution, source rewrite, recreated output or last-visible-pane fallback.
- No WorkNodes, NodeSeeds, implementation or unadmitted event producer.
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-035, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/UI_Wiring_Rules.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/Server_System.md, ContractName:Plans/Automated_Testing_System.md
