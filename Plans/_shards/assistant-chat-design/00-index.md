# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-11-12T07:35:19Z

Source SHA256: `b4d0a4d8ff0879dc647c9d6989ddfc930317d1880d11b8e99d9862e330f0de7a`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `1a368583cf5712915f17da784a92a8cc2fd58b8649bbd01e5cf5c9858de0c37f`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `9f22ba33cf80dc58acfc006b657891ff8bbd61306b80c77dfb1595c2e3ede616`
- [003 - Change Summary](003-change-summary.md) L14-L30 `f84911f6cad95d6c66fc886c4c79f1f03604a93ad57665f5c30271452edf19e4`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L32-L47 `e1d21f29765de1611402735c36c8116101b0d7674f4444be9e3a79c25d9b2706`
- [005 - Executive Summary](005-executive-summary.md) L48-L52 `1c9524fe4ea3437df7eb4318c25ed37575d3c82895ec205d6ec53c8552644a93`
- [006 - Table of Contents](006-table-of-contents.md) L54-L90 `614e326c8eaa8dee1b737153a4f2fd8373c0dc35e818b826fd475c9476e593b8`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L92-L207 `a47a111776d06f5aa597144d25fa52e8366ea12f6075cf33ca4421f9ba0fa8d1`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L209-L232 `266870b5dea462d86f9689b08505e64aa3424ae29e9d846b8cff90c6a1418e7e`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L234-L240 `2191c8fd4ff1596461a3f0ef24a0046d9091ae795108b626c2d379d04e0a47e5`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L242-L291 `82aadfe448940cf9a9bfac5053feca3b272986846f83bbffa1a06bf70dc1ee44`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L292-L440 `e476d7c80aa92954902c80db8ce133b2b6bdb63fb141a84500accff99945f6e8`
- [012 - 6. Teach](012-6.-teach.md) L441-L483 `ffb77271a0c0ea2517ac5de50b07230f44d1eb127d01d52b4de541e88e38edcc`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L485-L671 `bb078f0ceb1f20480ec6db2bdd87bfd5934754fd50ed9efa9955a1a327d9ec1e`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L672-L964 `c44428d771bc69b3c596281d8c2560041391e790b8c2fd96733b0f5e4b92b12f`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L966-L1008 `d3762aa8d7171b07496cfb0a4825fc8678af8fcd3e4e3c38bef3856609bfc8dc`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L1010-L1081 `2f99f022ab97d58603d3b4a173f43553a6c263520746c944f3cc3c31e94a92d3`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1082-L1259 `3e2d97e04637da2547c3779b31d0b63ff7f516af0cd2a5920c1805778c2b9297`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1260-L1365 `d13cad597efc69083d9401c1f48878a3d06eedadabc296ac8fe2c360503ec1cf`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1366-L1783 `35acb36133738c5b13ea412a370270084638e57c86ec19cf4d24135fdc0a7e5b`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1784-L1901 `3433ef1345dd1701e2f1d315f607db97e9913b458b3cf1cd2fdb70bda771e883`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1902-L1935 `146c7f9bf02d028d6b7b7a903cfd05a3bafb396346dbfd4348e0b8e48a3f92e6`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1936-L1975 `dbe3dd763987f4e81fc822079a8d0b09847f093dd2888e2b3f791632591f8e05`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1977-L2090 `15699050715cf5b8e7b7af181ed0f3c40c174154165da300bffbc4c7ccf255d9`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L2091-L2102 `f715d3238b0688dd73d8dabb6ce93dbc57812df6f4b29a616c888ab708d1aced`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L2104-L2113 `f9fa34b4ef17461ea6c9afba5effe5108ce3a9d83a3eb1bd466aaf2a666502fd`
- [026 - 20. References](026-20.-references.md) L2115-L2144 `603ced5cb394c1c109ee972c53e6dc0ab55698451295cd6a2f13a9fbe26d7102`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2145-L2163 `3123867f2babd7d2d43d5db4664ccf6b4791b41e866b45ef30760330f582b151`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2165-L2199 `98f13d42fd07b0158753d6f719959a22e0cea34362f263352597c2b397040cd1`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2200-L2295 `5348929200147f7eb5369e0302af0ee9f965220cb7118074c22fef7ee0f955e7`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2297-L2350 `b15ae81c9297aa164352a8a16f576fde0db6a1aaeed5a708288ba831a1a72cc1`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2351-L2357 `9ec4de5a439bba03b94da45de112bcfb5c2d326ee6610ac27180d71597559eaa`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep) And Loop Specification](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2358-L2649 `5a39350ccb2e726a089279e42757fe6e12b4d5511c44ba06bd2d021194c37255`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2651-L2787 `454ec23df24ac3401d536634186d2cfcfbdd8d2b79183656ef8597643f9a5fb7`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2789-L2834 `b3bc7aeb8b8964a0c718a7ae2f8f4d208b3741f60d268ee9ad6eca473856d621`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2835-L2944 `96da194ebd005496866d4c1431e9da56481dc79a8afd5a7f8a8eefc1732d8416`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2946-L2961 `c9ee6846e686d2497a137d2e83d9e34253daae550c72df51522b73a24bf8a72f`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2962-L2974 `a97061c4716405deb44772f0832c092c7e40a0f510475ece3f06f2c5f9e244e2`
- [038 - Ledger Compile Addendum - pldg-20260630-001-feature-intake](038-ledger-compile-addendum-pldg-20260630-001-feature-intake.md) L2976-L3044 `7844e8678aec23b2246c4cfae0f2986b45fd614073c7ae3f5c321214747374a0`
- [039 - Ledger Compile Addendum - pldg-20260624-001-provider-updates](039-ledger-compile-addendum-pldg-20260624-001-provider-updates.md) L3046-L3688 `9f20030ed741621f5ea1c733f264f33f96a5bcc9e29621dee70c7205de9a24eb`
- [040 - Shared actor-boundary, route payload, and blocked_notice packet](040-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3689-L3709 `47f32b8df916da88a009fa15aa9c9f5cbe43a6a5ee37868c27fe1dfcb1b06101`
- [041 - Shared Conversational Actor Runtime Identity](041-shared-conversational-actor-runtime-identity.md) L3711-L3725 `fc8aac25a040551f50ea2aac004658b89c1ab6adf6ed2f10e7ae7fed4c9d65e1`
- [042 - Chat Route, Permission, and History Behaviors](042-chat-route-permission-and-history-behaviors.md) L3727-L3741 `13bd6c40dee5150f007f10d69846c4ce99ead428f30613e1b6f8a4d7674ad012`
- [043 - Owner / Consumer Map](043-owner-consumer-map.md) L3743-L3747 `5b8a938fa9fb934a26c4999bb9d2c5970359c171d61cda7e9ee6482f673c3f43`
- [044 - PlanUnits](044-planunits.md) L3749-L3800 `c5cd0133c608895536237d6bb3318897cf4164abec417a7fb82a5659f2469e6a`
- [045 - Shared runtime projection addendum (2026-08-13)](045-shared-runtime-projection-addendum-2026-08-13.md) L3802-L22997 `8ffafb67c32bb3a1ba5b8aeb2178c51f25f3e80925b4ab683dcc04699943ec0f`
- [046 - Migration Coverage](046-migration-coverage.md) L22999-L23029 `9124c3bc6276c862e89a0972cbf604050d49c9facf8bcd26b4bef60320836943`
- [047 - Ledger Compile Addendum - pldg-20260614-001](047-ledger-compile-addendum-pldg-20260614-001.md) L23031-L23119 `3af0d4225febce309ca747c0eed2d71648906641433bf9cc1b9b4c6d4a4529c5`
- [048 - Ledger Compile Addendum - pldg-20260615-001](048-ledger-compile-addendum-pldg-20260615-001.md) L23121-L23218 `087dd8bd07015a4377b3fa4c5c00c6410ea3e60ee7a15388837ff3ee77ff58b5`
- [049 - Ledger Compile Addendum - pldg-20260616-001](049-ledger-compile-addendum-pldg-20260616-001.md) L23220-L23545 `212be64f3f02c7a298fd946873eef428d4f163434ef00fda06ff25f29f4555d6`
- [050 - Ledger Compile Addendum - pldg-20260616-002](050-ledger-compile-addendum-pldg-20260616-002.md) L23547-L23620 `6967151467e90e4bc8d237636f8b2617e3a58be93d2dae2127106bf89da36d4b`
- [051 - Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard](051-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md) L23623-L23711 `dc93269a1d23eb36b7366f5a17e04efa7b0987720707263f1243817d0ad34fbd`
- [052 - Ledger Compile Addendum - pldg-20260622-001-fff](052-ledger-compile-addendum-pldg-20260622-001-fff.md) L23713-L23799 `5dae6db265a9421634c21d419d25816efd643065a5f8a72a5770074dc0bfe223`
- [053 - Ledger Compile Addendum - pldg-20260626-001-feature-name](053-ledger-compile-addendum-pldg-20260626-001-feature-name.md) L23802-L24141 `6440dd25b74784f70ce63daeea7ebcdb79afc233006ebad998ada1d26d8eda3a`
- [054 - Ledger Compile Addendum - pldg-20260627-001-feature-intake](054-ledger-compile-addendum-pldg-20260627-001-feature-intake.md) L24143-L24354 `16f997258af1b6db61151d136f2cca08d42ac10cf42221a3242f46b23b09b652`
- [055 - Ledger Compile Addendum - pldg-20260701-001-feature-intake](055-ledger-compile-addendum-pldg-20260701-001-feature-intake.md) L24356-L24437 `d02d7a330a1959cab9446e0feef68596abf3b5f276a4935093960323298b6952`
- [056 - Ledger Compile Addendum - pldg-20260703-001-feature-intake](056-ledger-compile-addendum-pldg-20260703-001-feature-intake.md) L24439-L24504 `03880bb3b70a78bf4c9402f481a80dbc204077cc3094ab4ec8a1cc2e39e7e19c`
- [057 - FABLE Residual Chat Mechanics Cleanup Addendum - 2026-07-07](057-fable-residual-chat-mechanics-cleanup-addendum-2026-07-07.md) L24506-L24577 `88c0ac40d257d03d2c58d8d981a8cf8f51bf57581c4d259fffa157ad60f8e947`
- [058 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](058-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L24579-L24623 `19d8bfdb6aa06e265a809d081a42a36125d3229da1411aa5fe6b8887e8ba3709`
- [059 - Usage GUI Propagation Addendum - 2026-07-09](059-usage-gui-propagation-addendum-2026-07-09.md) L24625-L24712 `8743c889c27ded4a1c992a25714a6a43a065c35c62cf41ae29e14d3d69241afc`
- [060 - PMConcept6 Chat Polish Addendum - 2026-07-16](060-pmconcept6-chat-polish-addendum-2026-07-16.md) L24714-L24946 `24e444cad528cb4d091ffd3d8703961bd9fad55e740724fee40d00479351d17e`
- [061 - Immutable conversation restore-point lifecycle - Known-37 completion](061-immutable-conversation-restore-point-lifecycle-known-37-completi.md) L24949-L24966 `c8a30a2079eee2580fdb595a3b98f52bc947d280493fba40274fda5589d1272d`
- [062 - PMConcept7 Concept Promotion Addendum - 2026-07-23](062-pmconcept7-concept-promotion-addendum-2026-07-23.md) L24968-L25345 `9660e153ab505cfea6896d99f563921742a149e4468a1284bd61816f1aedcaa5`
- [063 - PMConcept7 shared Assistant seating and context surfaces addendum - 2026-08-27](063-pmconcept7-shared-assistant-seating-and-context-surfaces-addendu.md) L25347-L25453 `8535229e3c2ca1b0545de67bfbade43424167b25eacb1484073c23bd03887937`
- [064 - Additive Correction v4 — Consumed Assistant Behaviour (2026-09-03)](064-additive-correction-v4-consumed-assistant-behaviour-2026-09-03.md) L25455-L25503 `bf09211a33a88558a14ee7f9087c56b9fb3654230a45d12a6c2b9506e6f2aff2`
- [065 - Working Notebook Surface Addendum (2026-09-05)](065-working-notebook-surface-addendum-2026-09-05.md) L25505-L25644 `aeb281d16042d928050b20c1448561c65f948cd7ebb1dc484ce652b194bbbfbd`
- [066 - Cumulative v3 Assistant Interaction & Surface Specification (2026-09-07)](066-cumulative-v3-assistant-interaction-surface-specification-2026-0.md) L25646-L26039 `21841355fa616b00508f3b5dc547e2c0ba6607a5c529475119fe4bc32f195436`
- [067 - Research decision packet review](067-research-decision-packet-review.md) L26043-L26138 `ab4486984e0c38b08fe0325f8eb816b2e9070e33a30e09e4eb7fb2e31d1c32b6`
- [068 - Context Lens Source and Preview Reconciliation — 2026-09-10](068-context-lens-source-and-preview-reconciliation-2026-09-10.md) L26140-L26204 `0f39bf01ae1cf6eb35a0c2ed0ce7064690a45ab357ee875c1413e6b1c608828c`
- [069 - Compaction completion Event Authority (DL-039 and DL-040)](069-compaction-completion-event-authority-dl-039-and-dl-040.md) L26206-L26270 `203c472bf31e17cdb099a92b401d607d5d90fdf4d7df166353d020582be2f17d`
- [070 - DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)](070-dl-042-historical-todo-event-migration-consumer-boundary-2026-09.md) L26273-L26328 `6df0009e05d83df799460e3b7baf6018b51115999d9e94c2202fb6446fee034e`
- [071 - Restore-point created native and historical consumers](071-restore-point-created-native-and-historical-consumers.md) L26331-L26506 `dee20822afcb0df8c3da035f7f434273cc64aa083f09eab1f7a05fb0c0b7984d`
- [072 - Deleted restore-point passive history admission](072-deleted-restore-point-passive-history-admission.md) L26509-L26575 `8d0d67241a8e98b32a39b1600bc9b77de64fd6fd6d46ff0470c656bcc822ce14`
- [073 - Expired restore-point passive history admission](073-expired-restore-point-passive-history-admission.md) L26578-L26647 `fcb7f9e08d57f474d6b02d9c1b3cc99f687087255501b7f64e50b16317072ce9`
- [074 - External Research Decision Packet Consumer Addendum (2026-09-17)](074-external-research-decision-packet-consumer-addendum-2026-09-17.md) L26649-L26699 `5390917e24287cdc7c8f83b2570399af3aeeb8401601263f2f9a831212b0776b`
- [075 - Chat WOW Turn Presentation Addendum (2026-09-27)](075-chat-wow-turn-presentation-addendum-2026-09-27.md) L26701-L27346 `56549048548e135818d1af7cd9dadd84c2300da563179f97edfadb0e329bfea8`
- [076 - Wand Modules Redesign Addendum (2026-09-27)](076-wand-modules-redesign-addendum-2026-09-27.md) L27348-L28048 `f9c96a48f88c541504df4afa734574e56430c99c307bc3d518190eebecef6a3c`
- [077 - Chat Tweaks Addendum (2026-10-08)](077-chat-tweaks-addendum-2026-10-08.md) L28050-L28126 `3635edf2c00281a03ef15e92a809ae49d05314bb1c55c0bb3d396b81a4492f19`
- [078 - DL-180, DL-181 and DL-185 — What The Chat Opens, Its Column, Its Command Card And The Port (2026-10-09)](078-dl-180-dl-181-and-dl-185-what-the-chat-opens-its-column-its-comm.md) L28128-L28617 `7e2b36c4bfade18d8c60be734d6f6d3215021070b78d85b863240115169c6194`
- [079 - Grill Me rounds and agreement — DL-218](079-grill-me-rounds-and-agreement-dl-218.md) L28619-L29391 `bc1e1c2a1c0ca925939646035fe37d121a954091d42e45d463322e3e526127d2`
- [080 - Command payload definitions (DL-333, 2026-11-05)](080-command-payload-definitions-dl-333-2026-11-05.md) L29393-L31677 `ea6c2e1238a7df4364dc8f30e16031eddb52b9669bc83365259348db8efb59fb`
