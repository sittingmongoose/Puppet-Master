# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-11-04T17:15:10Z

Source SHA256: `c260fb0a5e14c6e9e4f83d22217f9f03f9d6cdd4be32b5fc4f68f8df97e7b329`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `e254ed03d1526d4eabdc7f1e151964830ccdccb48cd831c81e36d093a2610a6f`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `4aacdda4d49ce484b687fdaa63495c06031ce5e1cd9effc0bdb0ee4f692e404e`
- [003 - Change Summary](003-change-summary.md) L14-L30 `4e259b4d7bf7f3e58ccf87bd3d8b387b42bf0eebf492070f37b3c053a8bd1673`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L32-L47 `62fd4bc4665a0f991c1c3391dea880a788979654ff67d8c5d0bed14f0baa9f2a`
- [005 - Executive Summary](005-executive-summary.md) L48-L52 `8889fdb91c24bfb012fe4a5bd4c776587c3fe708760da2a2c3653853d28d57c0`
- [006 - Table of Contents](006-table-of-contents.md) L54-L90 `3ed0a3ce5c16649cf6dcc4b6b683e49ccdd9aba130fcd1ad4c9927964297a65e`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L92-L207 `776ba29e575e74e9dbe5532a82c543664a0628664a9ff69e20ed2e06e9f75f69`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L209-L232 `dc5a47bd0149ed96bef89fa450dc87317e48f5f0b72f0b23c8b057ae864d82a6`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L234-L240 `221d6f586578fd0d9ae825244bfdab5f2adb5840e62270b83a1a45394853bb1d`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L242-L291 `f28b36f09769cb56fc249311b7d75fdc1f7e85e6e084d56c2a7236444a6197c2`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L292-L440 `aee8561718c6a9f74ca2b66380db0c5d969f2a65cd7593578c0ca5d70b1400a9`
- [012 - 6. Teach](012-6.-teach.md) L441-L483 `cef1fbdb36044be48ac91d16086c2b49787304dd50e045394fd6e0664e001686`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L485-L671 `e41a7f3614134d59c71f9801ad287219d2a2b477862793a08b1af0f3e37d7cea`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L672-L964 `e8ba5b492e34ee9667c42eb6275775a2df0f47b7e9b6245327e8c2576eae886e`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L966-L1008 `18ffc5e045597e8f441ee08b023952408f207d18616315a3c5ffa3fef0662171`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L1010-L1081 `95393fa139d88bb29a70f383709f0c2cb762a5b4e681431b04d9b86b2bdcb9ea`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1082-L1259 `8a05c354f64df4616c02df689c98a60b4b2f4aa4c8a099aba1bc2ac3d0de5d56`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1260-L1370 `2be4e2644bd11a569fbf5443305010be75d7911ab15df7469faa28c6252b091f`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1371-L1788 `a3c36f3ee18c66c8d6f3f4a02ad2fb040228921d06109206a1a7d0f1149441c7`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1789-L1906 `5215c3d97c85412c1bdff8315497bad934af087bb6dd257fc59ff0d88f4ff26c`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1907-L1940 `5b8cc685309900a38422b7b4480c1e954d569b3e0ebae86d8bc993e0960798a0`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1941-L1980 `89768600b93352b135a3dfded315c23479bb50ddcf000ba90e5df077448c8ce1`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1982-L2095 `439aa321fea5b48accd77e9740ea14e9421ebddbe1f95e7c33c3f5e81b4efeae`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L2096-L2107 `db5a56dd0a5d1a5b49cc3c3263fc856f39136dd335facddec2b5200cf7f98f0f`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L2109-L2118 `64f5763cd3e6ddfc3286d8762fa32340b389503e2624b04374f1bba2e9696a84`
- [026 - 20. References](026-20.-references.md) L2120-L2149 `f5c3b7dc8f4eb86ac838af21f1261cbeeccf727ecf31cfaf6004e581fdf3413e`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2150-L2168 `455b2f4d208a913fa524dc07fe5119d1db049b41417b83812fdf94004b6dcb27`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2170-L2204 `9141f860c3990ef41d3cfce36bbbb623f7aa8f37cac23bc04340fb0aea09f691`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2205-L2300 `e0ae29c5cce9dabb1029e53fa9f29fe4fddaa86dcf4fec117af5d3f0a4001e2b`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2302-L2355 `96bb43df96936411d329c16a2e388a7b15be84cae9560ef6025b9b39e4dc743b`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2356-L2362 `ec1b02c105384d0bf9fa5ef19fedd3cad2569831fd9467b72570eb05ac550f95`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep)](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2363-L2465 `307c9b65249f619794221aa6f8ed260f8ee3a006f9caceace4569116bfa4f848`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2466-L2602 `dfc6c82752b5d3c4408d8ea3d181d125372d73399e3c12a61f2254360f8ec1e5`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2604-L2649 `b0548753d64eeb4382ac1281e46e9134d79b018c12daa22e3073ffacaf5c1e23`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2650-L2759 `a3a06d796efa82d3401d6919084a03e6ec30750965c0635f10d59cf6e3486ff2`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2761-L2776 `d5a4673085478260eefd11fa5a4900b79f38458bfe313a576de95cfaedb62054`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2777-L2789 `f114948c2e9d51e441c5cc75c8c174886e901ddffa102480cc81dfc139ae2d18`
- [038 - Ledger Compile Addendum - pldg-20260630-001-feature-intake](038-ledger-compile-addendum-pldg-20260630-001-feature-intake.md) L2791-L2859 `87cf41748efc37fd4667b1ec80d6d8e0b79dc1507086f6f12f6442500f30111d`
- [039 - Ledger Compile Addendum - pldg-20260624-001-provider-updates](039-ledger-compile-addendum-pldg-20260624-001-provider-updates.md) L2861-L3503 `202b8a4ce79e6161921651e10c8f73b40b319045d59aceeec1baf57f2ee03a9a`
- [040 - Shared actor-boundary, route payload, and blocked_notice packet](040-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3504-L3524 `10cdd3cec949eb32a3467d490dd136b5a63712f41acef05214f67cbfe96749a3`
- [041 - Shared Conversational Actor Runtime Identity](041-shared-conversational-actor-runtime-identity.md) L3526-L3540 `e1e98164b54541e7f51b00446d4e8ba6bf2335797bb7a48ad0749ab6afd62d5f`
- [042 - Chat Route, Permission, and History Behaviors](042-chat-route-permission-and-history-behaviors.md) L3542-L3556 `a69dcbde64b2ac236796a8673e72555b83ff5f3ebf7e1eaa136cfed6691ec555`
- [043 - Owner / Consumer Map](043-owner-consumer-map.md) L3558-L3562 `e9bfe640bb61b71de02a8d68dbd248b595ca057df4d040ac14e7fa7e97618e6a`
- [044 - PlanUnits](044-planunits.md) L3564-L3615 `189bba397209fba4c22473c2eb3eef956f471da67d18a04eacc0258b9795fa70`
- [045 - Shared runtime projection addendum (2026-08-13)](045-shared-runtime-projection-addendum-2026-08-13.md) L3617-L22619 `6a545ac3c91b2e37e0450bfe1fe5ec26ae559ae71ca54e7840f0000aa93619ab`
- [046 - Migration Coverage](046-migration-coverage.md) L22621-L22651 `4b8faa55ea6182cb06a1a8cac97a0faffd9b87206a24e47bfb93be454c4b3d63`
- [047 - Ledger Compile Addendum - pldg-20260614-001](047-ledger-compile-addendum-pldg-20260614-001.md) L22653-L22741 `c559b922e96f9128b6472e9c3d5c2b648f018b2bb94c83d39bcbcbb02f8a3508`
- [048 - Ledger Compile Addendum - pldg-20260615-001](048-ledger-compile-addendum-pldg-20260615-001.md) L22743-L22840 `93718de5dedbcdc271f190b7d04003d544e21b463e8d5e2d3c739bb7579b2da2`
- [049 - Ledger Compile Addendum - pldg-20260616-001](049-ledger-compile-addendum-pldg-20260616-001.md) L22842-L23167 `1abcdd98fae0c1a0145d9804c5ff90e6decaec99b4595b61d712139a0f8d8e3e`
- [050 - Ledger Compile Addendum - pldg-20260616-002](050-ledger-compile-addendum-pldg-20260616-002.md) L23169-L23242 `f2d6ce776cf5894aa7d2f97e60981ff9987e0dbfdcd580dfed592cfc5bb5e510`
- [051 - Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard](051-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md) L23245-L23333 `cd6d3e2c030146baa714b24dd8f48e5f3cdcb4ee8ee3547dcf8513c215f928e9`
- [052 - Ledger Compile Addendum - pldg-20260622-001-fff](052-ledger-compile-addendum-pldg-20260622-001-fff.md) L23335-L23421 `08280e19cab2c17c60ac405a1e8cc7558fd6cbf2913e7c309a3ded79a8d23df6`
- [053 - Ledger Compile Addendum - pldg-20260626-001-feature-name](053-ledger-compile-addendum-pldg-20260626-001-feature-name.md) L23424-L23800 `1d15b311f6cfb322989f8d80eb27ba13b069e243cacda598f8208c728377dadb`
- [054 - Ledger Compile Addendum - pldg-20260627-001-feature-intake](054-ledger-compile-addendum-pldg-20260627-001-feature-intake.md) L23802-L24013 `60a1607f0bacbbc08a3ed5250c60892fea30352336eb7d1d973fa5bf1f94dba8`
- [055 - Ledger Compile Addendum - pldg-20260701-001-feature-intake](055-ledger-compile-addendum-pldg-20260701-001-feature-intake.md) L24015-L24094 `064db8a9841e7d669bdf3ff49a555ee67c8398b747e698a1fa57dfaca6e7593b`
- [056 - Ledger Compile Addendum - pldg-20260703-001-feature-intake](056-ledger-compile-addendum-pldg-20260703-001-feature-intake.md) L24096-L24161 `3c897a95c8bd542e4222bbd1f04b8e3d00d39778b3a20633f9b44498c1d074e5`
- [057 - FABLE Residual Chat Mechanics Cleanup Addendum - 2026-07-07](057-fable-residual-chat-mechanics-cleanup-addendum-2026-07-07.md) L24163-L24234 `207930f210a49b82744bcce3cf916cb6ec11fc5f54c89a996a08ed4e4403c7f6`
- [058 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](058-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L24236-L24280 `9dbe7e4f3c129ec11dc67fbc4775923d9c03abc6403d7db3a3ad4e8e1b1313be`
- [059 - Usage GUI Propagation Addendum - 2026-07-09](059-usage-gui-propagation-addendum-2026-07-09.md) L24282-L24358 `ddd38cfd3208f3469539beb5414273a91c6bfbd0f9ede581550f8167160fc9a8`
- [060 - PMConcept6 Chat Polish Addendum - 2026-07-16](060-pmconcept6-chat-polish-addendum-2026-07-16.md) L24360-L24592 `c71591d8837cb9f8c47595c72f10bd24efa3f988822aa5b540d05b51013062e5`
- [061 - Immutable conversation restore-point lifecycle - Known-37 completion](061-immutable-conversation-restore-point-lifecycle-known-37-completi.md) L24595-L24612 `c559e28497c7029dde88203beee4bd450a341603a01c83ca625abded90253b72`
- [062 - PMConcept7 Concept Promotion Addendum - 2026-07-23](062-pmconcept7-concept-promotion-addendum-2026-07-23.md) L24614-L25012 `a4cac653955305d9dc8202ffe747b684c5b1b883466caacce821f6cc126a6817`
- [063 - PMConcept7 shared Assistant seating and context surfaces addendum - 2026-08-27](063-pmconcept7-shared-assistant-seating-and-context-surfaces-addendu.md) L25014-L25116 `3e72d3fc07acea69415ec95757eb448ea1158120e3d28fe91d5081a4b6db122c`
- [064 - Additive Correction v4 — Consumed Assistant Behaviour (2026-09-03)](064-additive-correction-v4-consumed-assistant-behaviour-2026-09-03.md) L25118-L25166 `52dc29427a52a15330738d476f3e08cf50135c423fc5916de400e1dd5d176b8e`
- [065 - Working Notebook Surface Addendum (2026-09-05)](065-working-notebook-surface-addendum-2026-09-05.md) L25168-L25301 `30e1f811ada4c4af1ab81a99404700c2229655906d4bfc75333d13350cbf865d`
- [066 - Cumulative v3 Assistant Interaction & Surface Specification (2026-09-07)](066-cumulative-v3-assistant-interaction-surface-specification-2026-0.md) L25303-L25698 `8b9efddcf46f197d1e1f7a2950eb5cfc911e1a19871e7edb436258612d880a28`
- [067 - Research decision packet review](067-research-decision-packet-review.md) L25702-L25797 `1f9b585ab34116d17f8fa7ddf81c64ba076681c7830bdfcdf9cb093675914948`
- [068 - Context Lens Source and Preview Reconciliation — 2026-09-10](068-context-lens-source-and-preview-reconciliation-2026-09-10.md) L25799-L25863 `2ef6c017a054b065832c68dda20fd3d28593b2f7bda21dda04fceab9c6faaa9d`
- [069 - Compaction completion Event Authority (DL-039 and DL-040)](069-compaction-completion-event-authority-dl-039-and-dl-040.md) L25865-L25931 `b4e5a5f3500666f7409ac0d7680e0502d3730df985302adf5cc0ea56955d9f70`
- [070 - DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)](070-dl-042-historical-todo-event-migration-consumer-boundary-2026-09.md) L25934-L25989 `8604131ee488c2c11c99302a6a0e1e2e7915d59e9fea4ad046cb0ae10ccf7119`
- [071 - Restore-point created native and historical consumers](071-restore-point-created-native-and-historical-consumers.md) L25992-L26167 `833754c0b1580dfccfd56b1a77e1cb7be93b43f6b87c26b7a55dc69fb93267e4`
- [072 - Deleted restore-point passive history admission](072-deleted-restore-point-passive-history-admission.md) L26170-L26236 `8ef84e25f0d2c71418df1467e5ec59a4b14880175f1e8dc1ea802a790232d215`
- [073 - Expired restore-point passive history admission](073-expired-restore-point-passive-history-admission.md) L26239-L26308 `ca8d700471cf9031e46c9f649feb96507546d748f9972ceb27a4280fcd5de595`
- [074 - External Research Decision Packet Consumer Addendum (2026-09-17)](074-external-research-decision-packet-consumer-addendum-2026-09-17.md) L26310-L26360 `c0f3fcbb5994823061bc1c7b872a241bf9d0562abfbf2d31ae723f13615bffce`
- [075 - Chat WOW Turn Presentation Addendum (2026-09-27)](075-chat-wow-turn-presentation-addendum-2026-09-27.md) L26362-L27009 `821976a19d67d7abce228fff403c5be2a6ce91cc32b8692dc33905c2b9b30d41`
- [076 - Wand Modules Redesign Addendum (2026-09-27)](076-wand-modules-redesign-addendum-2026-09-27.md) L27011-L27734 `d346db9a72770ff3a14961815ce42d5a106f2fad9c45ea529e608c6949770ca9`
- [077 - Chat Tweaks Addendum (2026-10-08)](077-chat-tweaks-addendum-2026-10-08.md) L27736-L27812 `23c3e784908f43f1fbd46686bd4815de9ea066d51b1553dc32cf31c3968e9503`
- [078 - DL-180, DL-181 and DL-185 — What The Chat Opens, Its Column, Its Command Card And The Port (2026-10-09)](078-dl-180-dl-181-and-dl-185-what-the-chat-opens-its-column-its-comm.md) L27814-L28303 `94f90e3e37ea526a275723c36a02f50defb0f1b085d514ef9faf646922fe5b57`
- [079 - Grill Me rounds and agreement — DL-218](079-grill-me-rounds-and-agreement-dl-218.md) L28305-L29079 `22448a29ce242140154e88954d672a22c5e831364477e21513220e8bb501c69f`
