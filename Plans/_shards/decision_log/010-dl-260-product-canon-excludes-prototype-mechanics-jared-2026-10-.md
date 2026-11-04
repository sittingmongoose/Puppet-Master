# Shard 010: DL-260 — Product canon excludes prototype mechanics (Jared, 2026-10-31, Q3 B)

Source: `Plans/Decision_Log.md`

Source lines: L19473-L19637

Source SHA256: `d7716252b1aadc504abd008c1f414b400acbe9a33602333ff1839b7d4adf71cd`

---

## DL-260 — Product canon excludes prototype mechanics (Jared, 2026-10-31, Q3 B)

```yaml
plan_unit_id: DL-260
unit_type: decision_record
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: 'Jared''s 2026-10-31 Q3 B ruling removes Demo Studio and all other concept-only machinery from product
  canon, including material inherited from main before this build. The test is whether the behavior exists in the real
  product. Prototypes, sample loaders, prefilled choices, lab-only controls, clocks, fixture workspaces, hidden demo
  bridges, concept-page persistence and runtime admission for simulated receipts are not product requirements, commands,
  Settings, wiring, registries, schemas, fixtures or implementation debt. Concept source files remain untouched as design/source
  history. Historical decisions remain unchanged: this entry supersedes only the Demo Studio/concept-mechanics portions
  of DL-106, DL-144, DL-177, DL-185, DL-212, DL-227, DL-230, DL-232, DL-233 and DL-234. Their real product decisions
  remain in force. F3-649, ACD-474 and DR-070 retain retired identifiers solely so those historical links resolve, with
  no active requirement or work compilation. The guided tour remains a real feature under PWIZ-023/035/036 and F3-521;
  shared Settings, Usage Live/Pause, tab routing, work status, Pip sound and appearance, and all other genuine behavior
  stay with their production owners. Real motion follows the theme family, no fixture creates completion or Ready, and
  owner identities/receipts remain required. The chat uses one real owner route rather than a hidden demo-click exception;
  DR-075 keeps shared presentation/placement ownership. Do not retain a prototype schema branch, test case or feature
  obligation just to satisfy a gate: remove or update the companion expectation and preserve the real owner invariant
  instead. Ordinary static contract test inputs remain validation artifacts, never runtime or certification proof. This
  cleanup creates no new command, setting, event, storage family, platform API or native-readiness claim.'
gui_related: true
gui_classification_reason: Removes prototype-only UI obligations while retaining the real Guided Tour and production
  presentation contracts.
split_recommended: false
depends_on:
- DL-259
unblocks: []
acceptance_criteria:
- Only real product behavior remains active canon; retired lab contracts create no product work.
- Historical decision bytes remain unchanged; this entry supersedes their prototype-only portions.
- The guided tour and all real owner, identity, progress, preference, routing and readiness invariants remain.
- Schemas, fixtures, registries, command and wiring companions remove prototype-only admission paths and obligations.
validation_surfaces:
- python3 scripts/pm7-demo-canon-check.py
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
risk_class: prototype_promoted_to_product_or_real_rule_lost
reasoning_tier: high
context_scope: product_canon_boundary
implementation_surfaces:
- Plans/FinalGUISpec.md
- Plans/assistant-chat-design.md
- Plans/Planning_Wizard.md
- Plans/Settings_System.md
- Plans/Commands_System.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
- Plans/UI_Wiring_Rules.md
- Plans/DRY_Rules.md
node_compile_hint:
  mode: canonical_amendment
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-29-pm7-build/DECISIONS-ONBOARDING.md (Jared, 2026-10-31, Q3 B)
preserved_exact_tokens:
- Demo Studio
- DL-260
- Q3 B
negative_constraints:
- Do not rewrite historical decision records.
- Do not erase real product behavior merely because a prototype demonstrates it.
- Do not create a product schema or gate for lab-only behavior.
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/Planning_Wizard.md#PWIZ-023, ContractName:Plans/DRY_Rules.md#DR-075


### DL-270 - Storage Review Decisions: Compression, Durability, Payloads, Pages, Mirrors, Analytics, Engines, Media, Gates

```yaml
plan_unit_id: DL-270
unit_type: decision
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Recorded 2026-10-31. On 2026-10-30 Jared asked for a review of PM's database, log, cache and compression plans
  against current competitors and engines, by Fable 5.1, GPT-6 Astra, Muse Wonder and Opus 5.5, and then for the
  review's unverified items to be tested on the VM, his MacBook Air and his Windows PC. The packet, ten reports
  and four test reports are in /mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/. Between
  18:50Z and 19:04Z on 2026-10-31 he answered all 13 decision cards and chose the recommended option on each: 1,
  "Compress the event log": "Compress closed segments; format ready now"; 2, "Save each batch with one disk sync,
  not four": "One sync per batch; full flush for key moments"; 3, "Store big tool output and images once": "Store
  once by fingerprint, reference everywhere"; 4, "Open any chat instantly, however long": "Ready-made pages plus a
  speed test"; 5, "Drop the JSON copies; add dump and inspect commands": "Copies off; readable on demand"; 6,
  "Keep redb lean and reclaim its space": "Size limits, two files, scheduled compaction"; 7, "Add SQL over your
  own history": "Parquet archives plus DuckDB on demand"; 8, "Back up without freezing PM": "Background copy plus
  a shown loss window"; 9, "Keep the SQLite ban, written as your four requirements": "Ban plus your four
  requirements plus narrow exceptions"; 10, "Compress remote access with zstd streams": "zstd stream with a
  fallback"; 11, "Store screenshots as lossless WebP": "Lossless WebP in the background; evidence keeps
  originals"; 12, "Turn your four requirements into pass/fail tests": "Gate every release on all three OSes"; 13,
  "Keep Spotlight, Windows Search and Defender off PM's data": "Put data where indexers don't look, in few files".
  On card 7 he added, verbatim: "Do we need to tie the usage data to this?  In my work on AAC, the usage data
  takes a long time to load and doesn’t keep its data, I know there is a lot of data there so just want to make
  sure that is accounted for." The reply he received, that usage loads from rollups and that usage history and
  daily totals are kept, is adopted as refined by his follow-up answer the same evening on the Keep usage history
  for setting, verbatim: "Defualt to 90 days, selectable to longer or shorter time periods." So
  ai.usage.usage-retention stays as it is, 90 days by default, and governs detailed usage records, while daily
  usage totals are kept whatever it says. His reasons for the SQLite ban, 2026-10-30, verbatim: "I banned sqlite
  because it is slow, has serious contention and lock issues, and I have seen them corrupt frequently. I have used
  so many programs that have been completely ruined because they use sqlite. For example, plex is very very held
  back by its DB." On JSON files, 2026-10-30, verbatim: "We also should likely not be using a bunch of json files,
  that seems worse than a well structured DB." Owners: SP-335 to SP-345 in Plans/storage-plan.md for the storage
  rules; ACD-242 for mandatory load-older paging; UF-108 for usage history; BRS-031 for backup capture; RAS-016
  for remote transport. Where earlier text conflicts, DL-270 and those units win. A sweep of every plan document
  by a reading wave, with verification, brought the other owners into line in the same landing, including the
  commands, settings, GUI, wiring and DRY companions. DL-270 adds no settings row: budgets, thresholds and cache
  sizes are fixed owner values, while Jared reconsiders how settings are scoped. Its companions landed after it:
  SP-346 for SeglogFrameV2's reserved compression descriptor and the sealed segment container, SP-347 for the
  commit frame and its receipt fields, the First append receipt custody section and CV-339 rewritten to SP-336's
  publication and recovery sequence, the data-root paths in SP-015, and the storage registry's storage_profile
  with its schema, holding each family's file, group and value limit and the budget values. The companion audits
  left three items for implementation, not planning: a producer-valid fixture that rebuilds complete custody rows
  from frames; native crash, power-loss and recovery tests of the commit-frame sequence on all three operating
  systems; and recertifying the pinned goal_certified_event_coordinator_contracts profile against SP-336 before
  its route is enabled. Only the governance reseal remains outside it. Card 4's 150 ms applies to warm and cold
  opens alike. Spec_Lock's forbid_sqlite is unchanged. The option labels are the cards' words; the four
  requirements, thresholds and mechanics are the review's reading, not Jared's words.
gui_related: false
gui_classification_reason: "Records owner decisions on storage, compression and durability."
split_recommended: false
depends_on: [SP-026, SP-236, ACD-242, UF-107, BRS-005, RAS-015]
unblocks: []
acceptance_criteria:
  - "SP-335 to SP-345, ACD-242, UF-108, BRS-031 and RAS-016 agree with the 13 recorded answers."
  - "Jared's words are quoted verbatim, and the review's mechanics are labelled as its reading, not his words."
  - "Spec_Lock, .evidence and auto_decisions are unchanged."
validation_surfaces:
  - "python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: storage_profile_owner_drift
reasoning_tier: high
context_scope: dl270_storage_review
implementation_surfaces:
  - "Plans/Decision_Log.md"
  - "Plans/storage-plan.md"
node_compile_hint:
  mode: owner_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-270"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/README.md, SHA-256 05aa90cf844b3b65b0bad394fc43136669d2f228b2cccfe7a7acdfe80c22efe4 (decision packet)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/decision-cards.json, SHA-256 27a79f44c4a56a63ff2864a8e57fe6389507ffc56e939c1477408546117e502c (card text and options)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/answers-2026-10-31.jsonl, SHA-256 e77364da11705bc6e50b35e50c252faea49f13cbfe193cd23f936db4e6c99637 (Jared's answers)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/answer-replies-2026-10-31.json, SHA-256 c51138b79bba5efa55662f3cd7ef04bd67f8afc6c9dc76fb34e42d1de99d0db4 (the reply to the card 7 note)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/answers-followup-2026-10-31.md, SHA-256 003852e3672c98db0f5daef0876829cebb44985779579ce0a889800442f73cae (Jared's follow-up answer on the usage setting)"
  - "/mnt/Cursor/share/puppet-master/2026-10-30-storage-compression-review/jared-statements-2026-10-30.md, SHA-256 9a1dd348ef6455da5772d7f52aa801aec13849f380afc7e0632d836451e21f1b (Jared's 2026-10-30 SQLite and JSON-file statements, verbatim)"
preserved_exact_tokens:
  - "Do we need to tie the usage data to this?  In my work on AAC, the usage data takes a long time to load and doesn’t keep its data, I know there is a lot of data there so just want to make sure that is accounted for."
  - "I banned sqlite because it is slow, has serious contention and lock issues, and I have seen them corrupt frequently. I have used so many programs that have been completely ruined because they use sqlite. For example, plex is very very held back by its DB."
  - "We also should likely not be using a bunch of json files, that seems worse than a well structured DB."
  - "Defualt to 90 days, selectable to longer or shorter time periods."
negative_constraints:
  - "Do not read the review's thresholds and mechanics as Jared's words."
owner_hints:
  - "Plans/Decision_Log.md"
```

ContractRef: ContractName:Plans/storage-plan.md#SP-335, ContractName:Plans/storage-plan.md#SP-336, ContractName:Plans/storage-plan.md#SP-337, ContractName:Plans/storage-plan.md#SP-338, ContractName:Plans/storage-plan.md#SP-339, ContractName:Plans/storage-plan.md#SP-340, ContractName:Plans/storage-plan.md#SP-341, ContractName:Plans/storage-plan.md#SP-342, ContractName:Plans/storage-plan.md#SP-343, ContractName:Plans/storage-plan.md#SP-344, ContractName:Plans/storage-plan.md#SP-345, ContractName:Plans/assistant-chat-design.md#ACD-242, ContractName:Plans/usage-feature.md#UF-108, ContractName:Plans/Backup_Restore_System.md#BRS-031, ContractName:Plans/Remote_Access_System.md#RAS-016
