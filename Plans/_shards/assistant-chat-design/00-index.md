# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-10-23T06:50:03Z

Source SHA256: `41fab336f0628b160ab1f6b6b907255ddf48db6dc8ce605ac2ba74950ac0c91b`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `97b2bca9d8c92beb55ec32c673704e7e0e03d693e8a3a544a486d2f8a8719ccd`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `06dd384bee537b5f905c5b7023b950ec2bc529e198dcec3bd8582ecd656704f4`
- [003 - Change Summary](003-change-summary.md) L14-L30 `96677369b4fdb00e5890b633f796f16f6a724c4e49c60e447cec7eda6dd3cd2d`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L32-L47 `53ede1cb16db8fce450a31811204baf6943a21dc39b7e118facb8f88b9773461`
- [005 - Executive Summary](005-executive-summary.md) L48-L52 `beb3bff4fbde520fe8fef3e6c92af1d3304793850e1b788829361a94f32b09e1`
- [006 - Table of Contents](006-table-of-contents.md) L54-L90 `f0945fa7028421b377b53665ab604984dcfd2700f4a351c89e76f9dd41a35d02`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L92-L207 `f076087c36ad7fcfc65953dfe719caed5ef2933d7a03765c418390feb663cba9`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L209-L232 `27fd59866f885a26b76ad566e05dd01f1bc126d8d56e222237da112528036007`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L234-L240 `b1931c86d691cfa342d1c68eafdbf20dbe5f52b66c7f574cba57cc47cbcfcad7`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L242-L291 `bcfd9e8bb9580ab07493c5427d3f2de3e4b390fd9eea4e35aab616642c07953d`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L292-L440 `442c897ff3a643c940ae14f8bb27b3ba9f77bb526e4f801caa08a8549e2721f6`
- [012 - 6. Teach](012-6.-teach.md) L441-L483 `10dc0fe1c407c437834f03c5f4f976d6097c7d78d5848ae9de6fff0d2de977f1`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L485-L671 `38dec0dbcc613b5d3c40280c181ac514d26062a688fa45a2a3baf2d20242fe45`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L672-L964 `67f3bfb2f1bcd7f8ddc47ba8e72b1e662fe1c73cc338e4a51c3f67f5501b639b`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L966-L1008 `969d4768cd8b0388d8ca2f94b2a3c5e7fa8b1cf34871f84460f51ced86678b57`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L1010-L1080 `35e58ca711282f8c9f9d3e3fa63cb8425a945c541b237a466f01268e4f92e356`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1081-L1258 `b7b24d6fa368c76073c4d9ffb0dd3dd3bef7b4328e58f81700a05249b58e8c2a`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1259-L1367 `0cdcf88cd436e36449646262d40d8ba829065f77c627edd045684ba26f4ec5fd`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1368-L1785 `ec8a4765f0ffe6743c6f59b9cbb08238904a1902cc24ee969c13015242fd17ba`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1786-L1903 `8787116037a67968112e22a4cc52195c57060b02b71d8e58668cf3d3a3396d2e`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1904-L1937 `d6a8a8b4301041e16888ecf3dd324c70691175b6363b514c34cb13fae80d3319`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1938-L1977 `6e82e190d5c4f32a89e414f626ade3cee6b6345f21e29da1b751cf0ac2eafbeb`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1979-L2092 `d6f94e6da1094657e17b4d40816b501d0c6746af227084b71d86d57817e2fed0`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L2093-L2104 `883e9c2708a6af3bf5490e446d47120e99bcfc46c51387e53b77526e850b7b3e`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L2106-L2115 `63878aa27a13572a3dafc2e03e331b2d05c064f415117fe4c259ba14dd86e109`
- [026 - 20. References](026-20.-references.md) L2117-L2146 `8b03e8e28df1f7ee5f22c038a8215401bbceda01bdd9241b88fca31348bc0354`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2147-L2165 `7379e99314ecf1a83e7d94e0e52e1f4bd371fbe54283c2a0a1b780ce27e47a72`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2167-L2201 `d4413fd1be0db1f5c4d822573a6c467cf6592e8e99cc5ed78abf8164125fd1a5`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2202-L2297 `045cb35fb4c98f08c5e1cd59264ef9e3c6e779b3b6793cd1fcc534dd0de3eb2c`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2299-L2352 `b590b76aa562650a8ef7717f1e960a2f7f0eebb21d1a17f2215b2a108e911a4b`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2353-L2359 `965d3b5f841e06b5746fc26a672fa951c844d548b142ecc42155152bd2a55edb`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep)](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2360-L2462 `f3d9df495b6ec0dc3b22a6b94b0538235f0dcb200155c23e5e811ef88ad32c07`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2463-L2599 `8458e3debe025be6e7610526ee73eb1dbf16d43e60461ee7c1f0978bc1b32d12`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2601-L2646 `14289e4e1bee905eed2dd48a5e606e6d75eb5d6538f1ca10f93e989aca817419`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2647-L2756 `bac9df89fdc51f25978c07922984cd1e361ff893fbb2b2bd48e606d4c7e35f86`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2758-L2773 `c9a0b5b546b2b980f2e7a47e5dd323c54d6f7b966caa3dd82708cdc0a75b3968`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2774-L2786 `b4ad02445cd7456ac3b58e0ffffce1ba3fb0b8328876c4efcd76d313a50ece3a`
- [038 - Ledger Compile Addendum - pldg-20260630-001-feature-intake](038-ledger-compile-addendum-pldg-20260630-001-feature-intake.md) L2788-L2856 `8dcc670e5283ec08b7cec1131135310a458ba0d2ce17ec8fcb49a30cf6f2bdaf`
- [039 - Ledger Compile Addendum - pldg-20260624-001-provider-updates](039-ledger-compile-addendum-pldg-20260624-001-provider-updates.md) L2858-L3500 `0c22152f91f7830896144dbfc7fffe4f86d7c948d003340e15405fb6aec458cc`
- [040 - Shared actor-boundary, route payload, and blocked_notice packet](040-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3501-L3521 `673f5ea7f2cfb01a4c1e59d87094307892894e4ecb12c53305bbcba1708150cc`
- [041 - Shared Conversational Actor Runtime Identity](041-shared-conversational-actor-runtime-identity.md) L3523-L3537 `21bc32ffc393d1613e738b3a300c4d70693b261af7b9581da22527e1a7eb19c4`
- [042 - Chat Route, Permission, and History Behaviors](042-chat-route-permission-and-history-behaviors.md) L3539-L3553 `ffd6a97f245a2b8ec86a22aea38acfeeca80897c37b55cd2cc95ed4bf40dd913`
- [043 - Owner / Consumer Map](043-owner-consumer-map.md) L3555-L3559 `c01fd610aedc9066e270f4009bb3320bde3acc267f7051aa9499e47325636dc9`
- [044 - PlanUnits](044-planunits.md) L3561-L3612 `c6d0cc6f5cf271afc62c312bc02c4a0204fd08d4ba22e39b15ca1b8a141a8f41`
- [045 - Shared runtime projection addendum (2026-08-13)](045-shared-runtime-projection-addendum-2026-08-13.md) L3614-L22417 `94cb53f918ca31e6d5ccdd432f0d7f3e8707ce3f65ccbe1445caa84825e64592`
- [046 - Migration Coverage](046-migration-coverage.md) L22419-L22449 `4362519d1a56d0d4b02c7d83a8ea3512e054840cf782919eb018d9ae52fdff6a`
- [047 - Ledger Compile Addendum - pldg-20260614-001](047-ledger-compile-addendum-pldg-20260614-001.md) L22451-L22539 `f51156638d3f198f997ce6b2ce2202e0ab8f5b157f78fc74df979b6cbdb446c1`
- [048 - Ledger Compile Addendum - pldg-20260615-001](048-ledger-compile-addendum-pldg-20260615-001.md) L22541-L22638 `a73aa4abb4904e2b3dff189e57ddffc5fc3648bb5f4cb2f785d62589ca9e9f43`
- [049 - Ledger Compile Addendum - pldg-20260616-001](049-ledger-compile-addendum-pldg-20260616-001.md) L22640-L22958 `ab75d8dfba381396e5b1817a729fbb7544f4501eafabb216287dcc7eb689f569`
- [050 - Ledger Compile Addendum - pldg-20260616-002](050-ledger-compile-addendum-pldg-20260616-002.md) L22960-L23027 `8f35bd9959c566ee8e3b646e9d8997ab18247aeb007d7a759b4070152763decf`
- [051 - Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard](051-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md) L23030-L23118 `cbad0a9064dd7ed7fe9c5216cf3f70f3e38fbfd966b60e737f65913960564e6a`
- [052 - Ledger Compile Addendum - pldg-20260622-001-fff](052-ledger-compile-addendum-pldg-20260622-001-fff.md) L23120-L23206 `c011870bce067a5edc47eaab6c0b5284d19494653729e8487cd5e455d2af7614`
- [053 - Ledger Compile Addendum - pldg-20260626-001-feature-name](053-ledger-compile-addendum-pldg-20260626-001-feature-name.md) L23209-L23585 `211d026fc68699dc2f545c1ab2e7337cfbbe7cd65ca95042242cc939cd1bfda8`
- [054 - Ledger Compile Addendum - pldg-20260627-001-feature-intake](054-ledger-compile-addendum-pldg-20260627-001-feature-intake.md) L23587-L23798 `7ff278fd2a4953e7a8a43e6c7c66a49a2e49b790af59dfecc0e6d9cec21aedfb`
- [055 - Ledger Compile Addendum - pldg-20260701-001-feature-intake](055-ledger-compile-addendum-pldg-20260701-001-feature-intake.md) L23800-L23879 `b2c76dc9b7ae400b0e90be1756b76a25866d1c448c780854a60351fdeaf63a77`
- [056 - Ledger Compile Addendum - pldg-20260703-001-feature-intake](056-ledger-compile-addendum-pldg-20260703-001-feature-intake.md) L23881-L23946 `d0b61cbd6b8f40e0a4b559c600b1a031c371b0513550d4d9200c486f57e5e15f`
- [057 - FABLE Residual Chat Mechanics Cleanup Addendum - 2026-07-07](057-fable-residual-chat-mechanics-cleanup-addendum-2026-07-07.md) L23948-L24019 `e3fe8cf4d7508ad6d0864c1c5bcd7b7d9968e9bb14422299b0d3a0fd6957ec60`
- [058 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](058-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L24021-L24065 `349be409e57f8b7b01f339bdbd204de999a9ff56778a498817e2c733c823eee5`
- [059 - Usage GUI Propagation Addendum - 2026-07-09](059-usage-gui-propagation-addendum-2026-07-09.md) L24067-L24143 `983519cd4180ca74029b8cdf707a0197dfcf1073594dc9272f942c043c232d8a`
- [060 - PMConcept6 Chat Polish Addendum - 2026-07-16](060-pmconcept6-chat-polish-addendum-2026-07-16.md) L24145-L24377 `ab9c44b573b99ceb3e8e7d1ea8d7100b1d4a6bed5d523f1aa21545aaeedc6184`
- [061 - Immutable conversation restore-point lifecycle - Known-37 completion](061-immutable-conversation-restore-point-lifecycle-known-37-completi.md) L24380-L24397 `f058a9f6bcd4947868a4ed4bf6d89b914fdfe2830d36167a2ecf99e6836be9eb`
- [062 - PMConcept7 Concept Promotion Addendum - 2026-07-23](062-pmconcept7-concept-promotion-addendum-2026-07-23.md) L24399-L24783 `d3c7ac680b0b7e9710660e9dabf61b8f17766e0cad5905b37148ac793078b0ad`
- [063 - PMConcept7 shared Assistant seating and context surfaces addendum - 2026-08-27](063-pmconcept7-shared-assistant-seating-and-context-surfaces-addendu.md) L24785-L24887 `12e121cd82b3462b73ce4f987191f86ddbcd5ba3971954915bbbbade86ac41b3`
- [064 - Additive Correction v4 — Consumed Assistant Behaviour (2026-09-03)](064-additive-correction-v4-consumed-assistant-behaviour-2026-09-03.md) L24889-L24937 `4db8b22e119aadadefedb4e43daa14ac70d83deb5ecd51c12e272bb0301b21ce`
- [065 - Working Notebook Surface Addendum (2026-09-05)](065-working-notebook-surface-addendum-2026-09-05.md) L24939-L25047 `c8f852292a67bfd89aebae0f6eb1a00d45c7d4303613aebbf68368ade94e7d56`
- [066 - Cumulative v3 Assistant Interaction & Surface Specification (2026-09-07)](066-cumulative-v3-assistant-interaction-surface-specification-2026-0.md) L25049-L25418 `7d51bbb565199f783c3dea9e21db9c3c91cbc02582d32222dd3de914e4b36910`
- [067 - Research decision packet review](067-research-decision-packet-review.md) L25422-L25517 `b715d78f4d075e27aa020d473605bdd7e9518c974e5550a74b8368d0c3276d47`
- [068 - Context Lens Source and Preview Reconciliation — 2026-09-10](068-context-lens-source-and-preview-reconciliation-2026-09-10.md) L25519-L25583 `f731a8c9486cdfd20f729c2eed5fec46d8593944247bb272921f5c5df08d3885`
- [069 - Compaction completion Event Authority (DL-039 and DL-040)](069-compaction-completion-event-authority-dl-039-and-dl-040.md) L25585-L25638 `10ae824b0343f73f4da364bcbe96dfd6e98dee90e0cc539f29bc34582ea6b735`
- [070 - DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)](070-dl-042-historical-todo-event-migration-consumer-boundary-2026-09.md) L25641-L25688 `d2eb6bf53d27d3a0ae3fd99e4e77f1e0aad761237a47e2a3e74bea6460ee4635`
- [071 - Restore-point created native and historical consumers](071-restore-point-created-native-and-historical-consumers.md) L25691-L25865 `17112144eedf95b78c2623b1dad8cc13cd4d58ec28ae735834ca921654e3d2d0`
- [072 - Deleted restore-point passive history admission](072-deleted-restore-point-passive-history-admission.md) L25868-L25934 `0c45cac8d4303073fab5fa9c4d8d4ad27a6aa1b0677d10ffc436ddf24bcc8546`
- [073 - Expired restore-point passive history admission](073-expired-restore-point-passive-history-admission.md) L25937-L26006 `a10e69e43fe7537b992f89058eb6f70df1228a960263245a43aec509b0561b7e`
- [074 - External Research Decision Packet Consumer Addendum (2026-09-17)](074-external-research-decision-packet-consumer-addendum-2026-09-17.md) L26008-L26058 `e225f83b378af244482004dfd5d04f464d6c20bea9295969f4095c562abda479`
- [075 - Chat WOW Turn Presentation Addendum (2026-09-27)](075-chat-wow-turn-presentation-addendum-2026-09-27.md) L26060-L26712 `7052ea81875cb404e37d2691cd5571f2197b7352903fd5fa758343345638447e`
- [076 - Wand Modules Redesign Addendum (2026-09-27)](076-wand-modules-redesign-addendum-2026-09-27.md) L26714-L27426 `bba085ac6d1e320b818c6cb8bb161463a3f0835a0cc293091ef96969c5d2bc05`
- [077 - Chat Tweaks Addendum (2026-10-08)](077-chat-tweaks-addendum-2026-10-08.md) L27428-L27504 `77ec6473c227613fb3afe10a02609f5b8394b9d0748579656a94fcf7c35fe1ce`
- [078 - DL-180, DL-181 and DL-185 — What The Chat Opens, Its Column, Its Command Card And The Port (2026-10-09)](078-dl-180-dl-181-and-dl-185-what-the-chat-opens-its-column-its-comm.md) L27506-L27933 `492facc001ccd25930bc6dfad8a9ce1e6bed495a010d4e9db03ac20401bda3aa`
- [079 - Grill Me rounds and agreement — DL-218](079-grill-me-rounds-and-agreement-dl-218.md) L27935-L28147 `ea70e14a6ac9e8eb47b573506f6b0b4254551527dac4a3e61e15705f5ed0ef95`
