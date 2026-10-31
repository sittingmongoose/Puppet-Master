# DL-260 mainline prototype cleanup — 2026-10-31

Jared’s **Q3 B** ruling is applied as a separate task after pushed DL-259. Historical Decision Log entries remain byte-for-byte unchanged from `1ec1f1f419`; DL-260 supersedes only their prototype-mechanics portions. Concepts and historical audit/ledger artifacts are untouched.

The requested baseline is **14 top-level documents / 115 literal mentions** at `origin/main`. The build before this task had **113 normalized mentions** (folded YAML included): 75 active-document mentions and 38 historical ones. This task removes those 75; the earlier branch-only cleanup had already removed two from the original baseline. The result has **zero active-document mentions**, with 38 historical mentions plus 3 in the new superseding decision.

| Document | Main literal | Before this task, normalized | After, normalized | Action / preserved product rule | Uncertain product scope |
|---|---:|---:|---:|---|---|
| FinalGUISpec.md | 24 | 23 | 0 | Retired F3-649; removed lab stacking/modes, fake progress and scripted completion clocks; kept 15 kinds, real timings, Guided Tour, Always-on Glass and hosted chat. | none; historical anchors have no active work |
| usage-feature.md | 1 | 1 | 0 | Removed fabricated-series promise, demo clocks, controls and gallery; kept owner-projected facts, missing-reading honesty, roster, export and Live/Pause. | none; historical anchors have no active work |
| UI_Command_Catalog.md | 4 | 3 | 0 | Removed lab verb row and CONCEPT_DEMO_ONLY dispositions; kept genuine command reuse, local view state and current NieR Settings ownership. | none; historical anchors have no active work |
| Planning_Wizard.md | 3 | 3 | 0 | Removed tour-demo entry/facade claims; kept Guided Tour, isolation, real owner handlers and approved later redo. | none; historical anchors have no active work |
| Wiring_Matrix.md | 1 | 2 | 0 | Removed Studio and lab-verb obligations; kept exact tab/terminal/file/capture identity, Settings reuse and owner effects. | none; historical anchors have no active work |
| assistant-chat-design.md | 16 | 16 | 0 | Retired ACD-474; removed demo bridge and workspace/launcher/build-wrapper rules; kept motion-family rule in ACD-475, signed agent routing, capture destination, Tour and one hosted chat. | none; historical anchors have no active work |
| Back_Seat_Driver.md | 1 | 1 | 0 | Removed simulation paragraph; kept unavailable-command gating and actual owner/Event Authority prerequisites. | none; historical anchors have no active work |
| Commands_System.md | 3 | 3 | 0 | Removed lab classifications, Gallery/Studio and material-demo toggle; kept real reuse, LOCAL_PRESENTATION and always-on Glass. | none; historical anchors have no active work |
| UI_Wiring_Rules.md | 2 | 1 | 0 | Removed Studio token; preserved exact owner, forward/reverse identity, focus and native evidence requirements. | none; historical anchors have no active work |
| DRY_Rules.md | 14 | 14 | 0 | Retired DR-070 with no bridge debt; removed lab stacking and port-wrapper internals; kept one overlay/appearance/hover/tab/conversation owner. | none; historical anchors have no active work |
| Crosswalk.md | 1 | 1 | 0 | Removed lab feature from owner map; active DR-065..069 and DR-071 remain. | none; historical anchors have no active work |
| Settings_System.md | 2 | 2 | 0 | Removed simulation record, prototype import source and lab options; kept Rust/Slint/Leptos direction, real preferences, migration fences and Q22 Adjust. | none; historical anchors have no active work |
| Decision_Log.md | 38 | 38 | 41 | Preserved all pre-DL-260 bytes; appended Q3 B supersession only. Existing 38 mentions are historical; 3 new mentions identify the superseded subject. | none; historical anchors have no active work |
| 00-plans-index.md | 5 | 5 | 0 | Removed lab-feature and hidden-bridge promises; kept dated real-product summaries and added DL-260 entry. | none; historical anchors have no active work |


| Additional product owner / companion | Change | Preserved rule / gate handling |
|---|---|---|
| Widget_System WS-030; Automated_Testing ATS-036/075 | Removed demo-hour references and their test disposition. | Real Live/Pause, hidden-board idle, board transactions and product acceptance remain. |
| Orchestrator_Page; storage-plan | Removed trailing links to the retired lab contract. | Their owner behavior is unchanged. |
| settings_system_contracts + fixtures | Removed one prototype-only root definition, its 2 cases, simulation permission on 5 command contracts, prototype disabled reason and browser-prototype import source. | Native Settings transactions, import confirmation/currentness and 29 positive / 29 negative cases remain. |
| product_onboarding_contracts + fixtures | Removed browser-only projection branches and retry intent; dropped 5 prototype-only cases. Nineteen real state/currentness vectors use production-owner shapes; a Ready-receipt negative is added. | 125 positive / 236 negative cases; static inputs never prove runtime execution. |
| storage_value_registry | Removed prototype record from the transient disposition; materialized existing Onboarding inline bundle. | No physical family, custody or retention admission added. |
| pm7_control_bindings | Removed PM56_DEMO hidden-bridge tokens and title-lookup explanation. | Both real Review routes retain exact signed owner identity; 483 controls / 61 source families remain. |
| Wiring_Matrix.production.exclusions | Removed page.go, demo.toast and demo.reason and their note; removed their catalog obligations first. | No product row/command lost, no gate exemption retained for a deleted feature. |
| schemas / fixtures / checks | Existing owner-pack checks exercise actual product shapes; pm7-demo-canon-check audits the canon boundary and retired dependency graph. | No runtime or acceptance case for Studio, prototype controls, prefilled choices or a demo clock. |


**Historical IDs:** F3-649, ACD-474 and DR-070 remain `status=retired`, `unit_type=retirement_record`, no GUI/work/dependencies/implementation surfaces. Unchanged historical decision references still resolve. No active unit depends on or unblocks them, and no hidden demo bridge debt remains.

**Real features retained:** Guided Tour, questionnaire fitting, shared theme/Adjust and Pip/sound, Usage Live/Pause, the full tab-kind grammar, signed owner routing, capture destination, container sizing, focus/hover/overlay ownership, real error/currentness/receipt checks, Q13’s 60 s dock rule and all QA2/DL-259 product decisions. Approved concept files may remain source lineage; they do not become product APIs or native proof.

**Scope uncertainty:** none added by this cleanup. The four previously reported Server owner admissions remain separately open in OWNER-QUESTIONS.md. Fields final report fe981f3b38 is read; its four canon requests were already closed by DL-259. Six exact coverage mappings are corrected. Final GUI names, onboarding’s small follow-up and independent coverage audit remain pending.

**Verification:** focused results and per-artifact SHA-256 records are in verification.json. No full gates, dry landing, landing, lock, reseal or baseline refresh was run for this task.

Final diff correction: 12 unrelated whitespace-only edits were restored. Eleven unchanged metadata groups were regenerated with the repository generator and committed prior manifest timestamps. Only 17 edited-source shard groups remain. No generated files were hand-edited.
