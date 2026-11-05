# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-11-05T07:24:48Z

Source SHA256: `d8416202d71866909a534630a1aa3fcfba8e9fee408134822f864c8f55d03973`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `1e5e974632d2fc12607270f70d29430df8142d3a6e7133a1df0b82694d554891`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `640f53a33782f12670f361e0d7d113d3a8a2f8c0ed6536b5a22498f4bbd6b48c`
- [003 - Change Summary](003-change-summary.md) L14-L30 `8837a69ff8fd86d6fc128f8ffdf4f8aaed74bda8a97d18189c1544ee98c1e38d`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L32-L47 `b6db7f331d35f95a69679893fda8bcfb6f18a5a8043961387af66a57cc7dc374`
- [005 - Executive Summary](005-executive-summary.md) L48-L52 `6c6642ca2f5832b827f6c83066fc4f0092af979fe1d246a2dfa833e2d64e73ca`
- [006 - Table of Contents](006-table-of-contents.md) L54-L90 `bec9adc41be7cb19a61e8f68817e9b45203f7a7b8c0f64e78e4e6572032372b4`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L92-L207 `9c121471405d023b6cce391c110829e548b86c799f8877ce5310331febec32f4`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L209-L232 `cd91cb46abc6abfc01f1c07ccf6b2982a2f5dcb0ea329bf3d82f6b394b15bacc`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L234-L240 `245c90c8a9c38a7e3024ba65a4188a69ff64349d641b566ab910dd5caae4a3b8`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L242-L291 `6f92c99b688f25713bc7977c3a42017528f8aed1e936eee19e1afbc7a2120ccb`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L292-L440 `fe7648ae2232e5c2054a45a5ad9477a2bb8dc9662dd1371c88382a21a1dbc9fa`
- [012 - 6. Teach](012-6.-teach.md) L441-L483 `b822994553fc37c175ba7fca8bcfe0efab6092b3834fc742d1962e0a40d395bb`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L485-L671 `0dd2b036ebcfcfb206f1a60b8b0b83e335eb3b6a246c1d2848442faac43b7fc5`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L672-L964 `df87c93e5df4d61a79d167539502117faf0edb46e7f117dd45882ff9c9952b67`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L966-L1008 `3759b061481e25235094e7f23cd7b14e553c998da5602dacd1df26bb57a090e7`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L1010-L1081 `2dc2faa90daab6b451182834a1532a01dff5332ee0ccd965b2246990238c95cb`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1082-L1259 `7dacc6838c71b6c8cbb6b3e729f5cb4cfbca0c47586c971632635f44a3ce0424`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1260-L1370 `da19719042c5b1fbe392cc8b8ebcfe291ff0c01b35e1a3804cdd39b1792f2c82`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1371-L1788 `553f90b556050fe8ca76f4421d1da76d3717b4ee424039bd23bcded08db27cd6`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1789-L1906 `76ed36a44dfb00ea8894745cfe724c7a5e13fc9daeb671a334e84466f0fb5b61`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1907-L1940 `6b82bdc6416f46032b63744e0c5a562c305726e8a41c30e82e9d8e3ac46b0953`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1941-L1980 `7936a554beccb3ce76df5b2d21868725c75bf55bf4806b0dc656147bbdb436b0`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1982-L2095 `b04532f9f79289a990a6c8941dcf7c68d29741c8fdfa0a82ff91c8c8a36fc7a7`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L2096-L2107 `73da7159bd2dfc0477a3539bdb37d46387af4e7918098d47bf22dec65ca20ac9`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L2109-L2118 `0d920236d05434f18654566eedbdb26504682b73ae07c9fab63fc1283a47cfd6`
- [026 - 20. References](026-20.-references.md) L2120-L2149 `202bb928ccc41bc0e269b238b5f7a653e3d7744a232f9ccb164c31f9a82f62cc`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2150-L2168 `428b1d5f2cb66d58e6270232e84de05a21a18ce01205e5fc7624422d44905b34`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2170-L2204 `88583f0069f7e9002e9bfb5ffa3f39d72f163c2bdafb26c595dfd164e04a2c07`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2205-L2300 `c21db718ac7c1d0b5d9a41cbafa0f804a4f2a352604788ce5c10bca58e04ca77`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2302-L2355 `4b4b1d05bb45950b22e791163e8e8a3027898adbf9f2e2dee0fb41552ab4f445`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2356-L2362 `94dd803cae262e1a83024bbca5aa671f366cb3581463c1ec44026c2e06452e85`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep)](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2363-L2465 `c9dc72832bf6b85f9c59c60fb1d253263bfaad6b269aa1418ff1cff2849a8aa7`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2466-L2602 `92da4e1d4aa5cfc000cfbb6c01cf28bfe7df8adb2289a112b6239163576a680c`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2604-L2649 `5be82a12d31ae35ddf9f0dec3f11b345bfa73bf3d71800bc1b1c37ec16dd1eff`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2650-L2759 `787c745eb255ecfe8cef31fc632c12db9abf4c2398b69a8d901680ed0eb8fcbe`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2761-L2776 `4721924a4b486e4a147f1db105ae05c2f68c95cfea54d0afe068bb4aa2198a27`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2777-L2789 `7b97749e522d8c3aba4da7e641ab23a093fb0ebcf3b27ac70404aa3a7fa7b56c`
- [038 - Ledger Compile Addendum - pldg-20260630-001-feature-intake](038-ledger-compile-addendum-pldg-20260630-001-feature-intake.md) L2791-L2859 `a39987cc3b5b97c5c0687bd868c48c8bca65414f03097300cd53a7ffc82fd697`
- [039 - Ledger Compile Addendum - pldg-20260624-001-provider-updates](039-ledger-compile-addendum-pldg-20260624-001-provider-updates.md) L2861-L3503 `146d7900904e84431800dd27e8ac2b3b7aade30162f4bbb126d49c649c9fee78`
- [040 - Shared actor-boundary, route payload, and blocked_notice packet](040-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3504-L3524 `3a55bc72f718f068034908bae8afa80d61dd796d196220beb4275dd714373c7a`
- [041 - Shared Conversational Actor Runtime Identity](041-shared-conversational-actor-runtime-identity.md) L3526-L3540 `0d8a381f325d3a7ec808d7cbaa8eb9a2c5c8554a80b74ffd11fd32157527e4ee`
- [042 - Chat Route, Permission, and History Behaviors](042-chat-route-permission-and-history-behaviors.md) L3542-L3556 `18a892ea3cba48e5c079fa2522110182e2f63d363d1f56d7517b6d8b66452a24`
- [043 - Owner / Consumer Map](043-owner-consumer-map.md) L3558-L3562 `3b14902a9ad3a2613e5ea7ec9811ef4de9a4e7339952d274ceecd0d1290f8b50`
- [044 - PlanUnits](044-planunits.md) L3564-L3615 `c0a8134c35545e8f1808144acc7834c65b3e9d6681b316bdadba920ee66e37d5`
- [045 - Shared runtime projection addendum (2026-08-13)](045-shared-runtime-projection-addendum-2026-08-13.md) L3617-L22624 `06a82a444c90674cfee09fa669d2d38df4988229e3c87ad2c00aa62cc5a2c49e`
- [046 - Migration Coverage](046-migration-coverage.md) L22626-L22656 `fd8970068b8d82a70d5f65bc4bf0ac03ddd4ac51907e3acec652cc0bc83f2b17`
- [047 - Ledger Compile Addendum - pldg-20260614-001](047-ledger-compile-addendum-pldg-20260614-001.md) L22658-L22746 `b1ba8c31c463661f98d6fd9aa7a156dd75d9bc072302384fe9c544459d679152`
- [048 - Ledger Compile Addendum - pldg-20260615-001](048-ledger-compile-addendum-pldg-20260615-001.md) L22748-L22845 `33419abd1c761905e00c1e000702b4f10940952c4d6834727a06d196f178d887`
- [049 - Ledger Compile Addendum - pldg-20260616-001](049-ledger-compile-addendum-pldg-20260616-001.md) L22847-L23172 `b979da515ad2aaf4f931af16b2baf958fface647022c162d97fa6a1998f6caab`
- [050 - Ledger Compile Addendum - pldg-20260616-002](050-ledger-compile-addendum-pldg-20260616-002.md) L23174-L23247 `ef4bbd1b2bd341bf1f1c5239dc9d99ad91ec80efeb5875b1e45e45fca8fc242b`
- [051 - Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard](051-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md) L23250-L23338 `6d09b689a0aec74b846a0a070fdc14ff17d4d46676d95f6383a6639145e79978`
- [052 - Ledger Compile Addendum - pldg-20260622-001-fff](052-ledger-compile-addendum-pldg-20260622-001-fff.md) L23340-L23426 `8eb93f07b4cc2fe4f3ff0a18590f97c7c410de0d26e41b64394621fa29ff401d`
- [053 - Ledger Compile Addendum - pldg-20260626-001-feature-name](053-ledger-compile-addendum-pldg-20260626-001-feature-name.md) L23429-L23807 `41a577d9a723633071fc4a9d3f43c33b902fce5de720129b75eb88e998af8d60`
- [054 - Ledger Compile Addendum - pldg-20260627-001-feature-intake](054-ledger-compile-addendum-pldg-20260627-001-feature-intake.md) L23809-L24020 `41c5019bbec46ec277129216f32718663e7aa9d98a75b49ed389df7264aba7de`
- [055 - Ledger Compile Addendum - pldg-20260701-001-feature-intake](055-ledger-compile-addendum-pldg-20260701-001-feature-intake.md) L24022-L24103 `32dd3c2266cdf07537a6e41d5fc906c32eda7e533855ab93d584b93823752701`
- [056 - Ledger Compile Addendum - pldg-20260703-001-feature-intake](056-ledger-compile-addendum-pldg-20260703-001-feature-intake.md) L24105-L24170 `da74137076bbeef58addf5b69d5f2290de1276d7de838f0f4ac07cf112711e05`
- [057 - FABLE Residual Chat Mechanics Cleanup Addendum - 2026-07-07](057-fable-residual-chat-mechanics-cleanup-addendum-2026-07-07.md) L24172-L24243 `3c96dbbfab21335174a7b03da7b12be827b010c7ea163ea6eca951fac77f5644`
- [058 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](058-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L24245-L24289 `ecdde4befa8c5241d6d75a91535ea1e4b0c2d447823dba205c7231f38d0d6512`
- [059 - Usage GUI Propagation Addendum - 2026-07-09](059-usage-gui-propagation-addendum-2026-07-09.md) L24291-L24367 `3281709030109228ba1d18fc0d974ab439e8f5fd17a9f6a96c85aae3937f35d4`
- [060 - PMConcept6 Chat Polish Addendum - 2026-07-16](060-pmconcept6-chat-polish-addendum-2026-07-16.md) L24369-L24601 `84f90989b9056a3367621a5c008de38d2b16320a092d2c6fd662e9d14af11fb7`
- [061 - Immutable conversation restore-point lifecycle - Known-37 completion](061-immutable-conversation-restore-point-lifecycle-known-37-completi.md) L24604-L24621 `dea8b4c6681b82d23ff51c5ea8d54c34cc4c29a6f30d972e2219c0d4296d0175`
- [062 - PMConcept7 Concept Promotion Addendum - 2026-07-23](062-pmconcept7-concept-promotion-addendum-2026-07-23.md) L24623-L25000 `1fc9b0b8937247c4095028a5a05af556f550c81c9bbb32e8e1d24126e61682a3`
- [063 - PMConcept7 shared Assistant seating and context surfaces addendum - 2026-08-27](063-pmconcept7-shared-assistant-seating-and-context-surfaces-addendu.md) L25002-L25103 `e13d581e6462e2f76ebe59397a4c2b98d7ee3467934bdf1755311fdbf24887df`
- [064 - Additive Correction v4 — Consumed Assistant Behaviour (2026-09-03)](064-additive-correction-v4-consumed-assistant-behaviour-2026-09-03.md) L25105-L25153 `799b450c60b068d84d7488fcb04a5179657aece287e20777d1bc6b66dcc0e371`
- [065 - Working Notebook Surface Addendum (2026-09-05)](065-working-notebook-surface-addendum-2026-09-05.md) L25155-L25288 `da7f560f0d5a6320d229658d7264c3aec78c4364abb5297eb25483471bbaae46`
- [066 - Cumulative v3 Assistant Interaction & Surface Specification (2026-09-07)](066-cumulative-v3-assistant-interaction-surface-specification-2026-0.md) L25290-L25683 `9ee7dc5d1bc178de8e90322fb10254436483aa8abc2043ed2d0df73932f4b47d`
- [067 - Research decision packet review](067-research-decision-packet-review.md) L25687-L25782 `7e7085347519f9664a19d06a731a895a70ba0c637eb8945e250a13976988c774`
- [068 - Context Lens Source and Preview Reconciliation — 2026-09-10](068-context-lens-source-and-preview-reconciliation-2026-09-10.md) L25784-L25848 `74e74bb2e145c0bca99be726195b0e8d88c2f8f1227bfefac6a225a78c8b621d`
- [069 - Compaction completion Event Authority (DL-039 and DL-040)](069-compaction-completion-event-authority-dl-039-and-dl-040.md) L25850-L25914 `f6d3872468740f8a4b5d2bdaf2cc8f72659b1644aa21755f00b807f6a94a87a3`
- [070 - DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)](070-dl-042-historical-todo-event-migration-consumer-boundary-2026-09.md) L25917-L25972 `c810d6f0afce8d17f09e88ef529ced63b079794cd8132279c32fefbce9babe3a`
- [071 - Restore-point created native and historical consumers](071-restore-point-created-native-and-historical-consumers.md) L25975-L26150 `fa2521cc49482f3f369a1edab44f52ef4074193c5c4d7c59e18f9d23cf0a7e05`
- [072 - Deleted restore-point passive history admission](072-deleted-restore-point-passive-history-admission.md) L26153-L26219 `1850b0cfb470d3f5d11b4e83765c8eb6b906251dd0e769eb977328e201a0fcb3`
- [073 - Expired restore-point passive history admission](073-expired-restore-point-passive-history-admission.md) L26222-L26291 `af08d1e80a12a8bfd2babfe4ae5877648508e07e32c2f24cab8a65d9363501c4`
- [074 - External Research Decision Packet Consumer Addendum (2026-09-17)](074-external-research-decision-packet-consumer-addendum-2026-09-17.md) L26293-L26343 `f256932937f1b2ab5fe6fcd68725dc87107d6585e24950729bee79cb79362fee`
- [075 - Chat WOW Turn Presentation Addendum (2026-09-27)](075-chat-wow-turn-presentation-addendum-2026-09-27.md) L26345-L26990 `83bb7b83ead1e31b00b4b8983d7499f15a840dd89a7b51986d68ad6bad0268dd`
- [076 - Wand Modules Redesign Addendum (2026-09-27)](076-wand-modules-redesign-addendum-2026-09-27.md) L26992-L27717 `7a11de3073bb30748a71701dde8c9887cf1ed027895f333049cacd96a5ac9c86`
- [077 - Chat Tweaks Addendum (2026-10-08)](077-chat-tweaks-addendum-2026-10-08.md) L27719-L27795 `6c83a1ad971ecf6301fafe880461042e173def268f1341c71a657635a054f7b2`
- [078 - DL-180, DL-181 and DL-185 — What The Chat Opens, Its Column, Its Command Card And The Port (2026-10-09)](078-dl-180-dl-181-and-dl-185-what-the-chat-opens-its-column-its-comm.md) L27797-L28286 `9f383ada13d766e73024b2e7c8f2509324d9735ff889bdc279ab5796fb409d5f`
- [079 - Grill Me rounds and agreement — DL-218](079-grill-me-rounds-and-agreement-dl-218.md) L28288-L29060 `f9b0ab6acb19c947e79ad5e657977296c8e7bf14e0f4d2dbbca40334dfd4fb8b`
