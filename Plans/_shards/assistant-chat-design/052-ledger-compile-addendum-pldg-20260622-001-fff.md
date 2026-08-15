# Shard 052: Ledger Compile Addendum - pldg-20260622-001-fff

Source: `Plans/assistant-chat-design.md`

Source lines: L22891-L22977

Source SHA256: `8d6dfb862784206b0c4db9ebe7d0e7b149723161aecbbb7282c750a86eddf7b9`

---

## Ledger Compile Addendum - pldg-20260622-001-fff

### ACD-422 - Assistant Chat Discovery Activity And Toggle

```yaml
plan_unit_id: ACD-422
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Assistant Chat threads show native DiscoveryService activity by default when assistants look for candidate files, use stale or fallback indexes, select candidates, or complete exact-verification follow-up. The GUI setting lives at Settings > Assistant Chat > Activity with label Show file discovery activity in chat, default on, and description Show when assistants look for candidate files, use stale or fallback indexes, select files, and verify them. The setting hides only routine inline discovery progress cards when off; permission prompts, approval cards, denied/hidden-by-policy safety messages, trust-affecting fallback/stale disclosures, exact-verification linkage, durable receipts, and final relevant summaries are never suppressible by this setting.
gui_related: true
gui_classification_reason: This defines Assistant Chat thread activity presentation and a GUI setting.
depends_on: [T-161, CV-291, F2-191, PS-118]
unblocks: [ATS-011, RAP-031]
acceptance_criteria:
  - Routine discovery activity is visible in Assistant Chat threads by default.
  - The exact setting path, label, default, and description match the compiled contract.
  - Turning the setting off never hides permission, approval, safety, trust-affecting fallback/stale, exact-verification, receipt, or final-summary information.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future Assistant Chat visibility on/off tests.
  - Future permission prompt not suppressed by chat visibility setting test.
risk_class: user_visible_transparency_drift
reasoning_tier: standard
context_scope: assistant_chat_discovery_activity
implementation_surfaces: [Plans/assistant-chat-design.md, future Assistant Chat thread UI, future Settings UI]
node_compile_hint: {mode: assistant_chat_visibility_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0064
  - pldg-20260622-001-fff:atom-0065
  - pldg-20260622-001-fff:atom-0066
  - pldg-20260622-001-fff:atom-0067
  - pldg-20260622-001-fff:atom-0068
  - pldg-20260622-001-fff:atom-0080
  - pldg-20260622-001-fff:atom-0093
  - pldg-20260622-001-fff:state/precision_contract.json#assistant_chat_setting
source_atom_ids: [atom-0064, atom-0065, atom-0066, atom-0067, atom-0068, atom-0080, atom-0093]
preserved_exact_tokens: ["Settings > Assistant Chat > Activity", "Show file discovery activity in chat", "Show when assistants look for candidate files, use stale or fallback indexes, select files, and verify them.", "default on", "routine discovery progress presentation only", "permission prompts", "approval cards", "denied/hidden-by-policy safety messages", "exact-verification linkage", "durable receipts"]
negative_constraints:
  - Do not hide discovery only in backend logs.
  - Do not make safety, permission, approval, denied, or hidden-by-policy UI suppressible routine progress.
  - Do not let the setting change discovery, ranking, verification, or receipt persistence behavior.
owner_hints: [Plans/assistant-chat-design.md, Plans/Runtime_Artifacts_Panel.md, Plans/Permissions_System.md, Plans/FileSafe.md]
```

### ACD-423 - Assistant Chat File Mention Discovery Routing

```yaml
plan_unit_id: ACD-423
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Assistant Chat @file and file mention autocomplete query DiscoveryService for file, directory, and mixed target kinds using the assistant_chat_file_mention surface_type. Results preserve DiscoveryService rank order, show stale/fallback/remote/SSH state compactly when relevant, omit blocked paths, and attach selected candidates as source references that later agent work must exactly verify before edits or root-cause claims.
gui_related: true
gui_classification_reason: This is user-visible mention autocomplete and candidate presentation in Assistant Chat.
depends_on: [T-160, T-161, F2-191, F3-399]
unblocks: [ATS-011]
acceptance_criteria:
  - Assistant Chat file mentions use DiscoveryService order unless a local filter is disclosed.
  - Hidden-by-policy paths are not shown as candidates and do not leak through counts or rank gaps.
  - Mention selection does not become content correctness proof.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future Assistant Chat file mention ranking parity test.
  - Future hidden-by-policy mention autocomplete no-leak test.
risk_class: chat_file_mention_drift
reasoning_tier: standard
context_scope: assistant_chat_file_mentions
implementation_surfaces: [Plans/assistant-chat-design.md, future Assistant Chat @file autocomplete]
node_compile_hint: {mode: assistant_file_mention_consumer, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0021
  - pldg-20260622-001-fff:atom-0056
  - pldg-20260622-001-fff:atom-0059
  - pldg-20260622-001-fff:atom-0078
  - pldg-20260622-001-fff:atom-0087
  - pldg-20260622-001-fff:atom-0090
  - pldg-20260622-001-fff:state/consumer_conformance_matrix.json#assistant_chat_file_mentions
source_atom_ids: [atom-0021, atom-0056, atom-0059, atom-0078, atom-0087, atom-0090]
preserved_exact_tokens: ["@file", "assistant_chat_file_mention", "file mention autocomplete", "preserve service ranking order", "stale/fallback/remote/SSH state", "hidden-by-policy", "exact verification"]
negative_constraints:
  - Do not run a second undisclosed fuzzysort that changes shared ranking.
  - Do not leak blocked paths through mention candidates, counts, or rank gaps.
owner_hints: [Plans/assistant-chat-design.md, Plans/FinalGUISpec.md, Plans/UI_Command_Catalog.md]
```
