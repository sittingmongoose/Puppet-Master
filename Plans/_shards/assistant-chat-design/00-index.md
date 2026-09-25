# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-09-25T18:51:41Z

Source SHA256: `51345ccf44e2484c8d13981a8dba1830c5e8f43da451c54ea478e4b8ef153a98`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `e20906a527c72e4fff66a87141eb91d4333b4434ab5acc83097961331dbddd1f`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `301de6718342fe797331c025d8f0020632d3e6fff37cde68baa76a0c823f94b3`
- [003 - Change Summary](003-change-summary.md) L14-L30 `ac91340a6b85ad91f4ab8c39bbd393bc39489fe65daca3c6590610f24bbf3bed`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L32-L47 `094a99ac5abb9269cd8400a75aa7d47ff06ea49231903f737cd16c0b13815cc5`
- [005 - Executive Summary](005-executive-summary.md) L48-L52 `a9dccdde05b2229383f467637f07e0da37bdf45adb4b65bed8905b2108868428`
- [006 - Table of Contents](006-table-of-contents.md) L54-L90 `d9aca304435570a7bb7db3b117a7d4539ff1cbe5f85be7ae764e3b982c8afd84`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L92-L207 `cc92da389d02f9cd887ece7f68c412f7e0355ab1665f6ec4a23a8c2ceae8bcc6`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L209-L231 `355ce78dd2badee12f5e127606f1c7cd1c787150fff3c3db8e65c3c137ae215e`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L233-L239 `9e900ba8a1fc8d1cf05bae8f99635e1612fb1512f40ebd67ce2fcdf8e61e7e36`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L241-L289 `162fa7d7fda5a2bb7ee087118a0e0914eec1d3647b30aaad5d526655eb1f1eec`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L290-L438 `cf6be08a25e001aa5cb95fe3361c2d3e2fd0bab598c6f848cb1c34cb2db488c3`
- [012 - 6. Teach](012-6.-teach.md) L439-L477 `3a96a0c618911f86180e3a97f1342d6efa939811a0e1a0b34d8ed48f7352195e`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L479-L664 `d9650f542682666a9683ad0eb192815f006d0bad7b588c722ae99499d9091982`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L665-L957 `24237217f426e1ad014e35481a4db6b756bb3495e05ec5f0fc2fb9a966c6eb42`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L959-L1000 `bbea5327d0f6cc2abfb59b1cc4dfc3d2676ddaf9a4249a14cf2c551658bb6d70`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L1002-L1072 `42a521913b3ff6afb4b19a5bd2393610d4367991f6ede799747a86cda93ca9df`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1073-L1250 `b985ba6f73598e78c757294d537351e942f5ea9435b8e8e715c6d612d8e0079f`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1251-L1359 `39c41b48555ec142e577a18b66bd2c6ddf8f364c5da807bb46f56761f1e1cc5d`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1360-L1775 `1cf0450a63d70a1b8526e119a8c742a2220a4d327b9ef9ed75dcd3e22b37973b`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1776-L1893 `cb6a96b626e39f6daeb3db5b1cae039f8e0c57129da8b48ee5b63e207ff2f97e`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1894-L1927 `3f89382280c956c5b808cc15f6b1a454525314df1f7018ee6c22004c3c0eb4aa`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1928-L1967 `a256dd6aaaa978de45fd7b8c758cac644d32b3657776ae43bdd4c0656482b768`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1969-L2082 `d388327b83b57573c04d1eb53ab0b7f30a663c3d293f7393b42c3ba82b594202`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L2083-L2094 `ae328086773021189486c13e31c0715d4028e8f7374fe34f08cb006b24ace569`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L2096-L2105 `b26a361b4664d6ed1c6fe21c1e49fe5f75d85434080c58b6c434720a09d4eed8`
- [026 - 20. References](026-20.-references.md) L2107-L2136 `b37f3e087246fce160062603e7ecbb1652efd1f54d9ae1ed4c14af5a3599f36f`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2137-L2155 `27f373510b3964456e33df487c8e31b5be3dc541150aaee2a5245b922659d021`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2157-L2188 `c935eb2388e55fbea83d737cd9d6ec9c9b5971ac3ef2f16a7424459241406ecf`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2189-L2284 `412f384f67beeab2ed7a28f53d3b19eca0300178fa08b259f9ff17fe34ca9e4d`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2286-L2339 `f05b3ed87979abd68ad101faa1fe8354e81f0f131de6259c49bde103cf470b7a`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2340-L2346 `0228f7c621817b24d394e0c1e873bdd3b84f578923610d34808c182fc242b4fd`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep)](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2347-L2449 `ce3a2921261fe5b318c869da3b3a8210d18e31b694fddefddaa10d1fdaa090c0`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2450-L2586 `f44f2b26665cd29fe9282ccfe34141592a3b20e86d43442e55c18ec79ae8486e`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2588-L2631 `58c93b48a988c0a5be60147f057ee7d97b749246b046754989815b3723e022d6`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2632-L2741 `1205d867b4ffe009fe04ad35a3256ed0e56b1ef028e84ee97c1924513cfb5d0a`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2743-L2758 `5953142e48bf2cc57f5f8757a7e8d7947efc9d22eaa7f72a34c2958e50aa9d44`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2759-L2771 `8cc7bfaba6759f5a5f7f816deef070de21009530221b51eeb0714ecd07f5575f`
- [038 - Ledger Compile Addendum - pldg-20260630-001-feature-intake](038-ledger-compile-addendum-pldg-20260630-001-feature-intake.md) L2773-L2841 `2aaaf164075374d07f1932cf96e27a1f36f1ba13dbaf12d4946b3f2fe06640cb`
- [039 - Ledger Compile Addendum - pldg-20260624-001-provider-updates](039-ledger-compile-addendum-pldg-20260624-001-provider-updates.md) L2843-L3485 `17b1162d5f4d154dfe9c2b7f0c273252ba3395b8e1030571537600152b46fffc`
- [040 - Shared actor-boundary, route payload, and blocked_notice packet](040-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3486-L3506 `181b60783c51ddd896b583a5cccae14820e6141c78d805e9074b1179c4739f1a`
- [041 - Shared Conversational Actor Runtime Identity](041-shared-conversational-actor-runtime-identity.md) L3508-L3522 `2dc71ac25404581964123ead27e37daf7548b713a48b35f780e9a2279a0ebaec`
- [042 - Chat Route, Permission, and History Behaviors](042-chat-route-permission-and-history-behaviors.md) L3524-L3538 `268216ecc052d650ad4f05b13c9c114d19015b42ad3641632302706469a232d7`
- [043 - Owner / Consumer Map](043-owner-consumer-map.md) L3540-L3544 `b0c8fc118d5947ab664adae2a9f752a430de491b86d0b909c9b58e6ddd92e9cd`
- [044 - PlanUnits](044-planunits.md) L3546-L3597 `5b32244cc670093312a6b54c79a56ef686c1745c745dece0804018675c7ee56a`
- [045 - Shared runtime projection addendum (2026-08-13)](045-shared-runtime-projection-addendum-2026-08-13.md) L3599-L22237 `4a2de855eb8ddc78682d4fb8b870b11d9b71e76dc1f8420e6610c9311768122a`
- [046 - Migration Coverage](046-migration-coverage.md) L22239-L22269 `c90bea337ae7d02f719c402e0e232bbaef29bbd21bb0bd96987ae6725a999628`
- [047 - Ledger Compile Addendum - pldg-20260614-001](047-ledger-compile-addendum-pldg-20260614-001.md) L22271-L22359 `65cc4e05b70e8f7a7dd9bab45be72f11bfc74539abb7c1cd22bf4fc3cfb32f7a`
- [048 - Ledger Compile Addendum - pldg-20260615-001](048-ledger-compile-addendum-pldg-20260615-001.md) L22361-L22458 `c0c8b4aee453511eb3913ac36e5249f3e99141435a79b4f557ffb9316b574e89`
- [049 - Ledger Compile Addendum - pldg-20260616-001](049-ledger-compile-addendum-pldg-20260616-001.md) L22460-L22772 `d5d237102af05cd3c9eb71f572d0e6c0826672ac384912a4be4ba53ffb4c6401`
- [050 - Ledger Compile Addendum - pldg-20260616-002](050-ledger-compile-addendum-pldg-20260616-002.md) L22774-L22841 `0b1243a458ce88997db7f98d4f935a62dad4fcec5f64661d31ffe0f92909a57a`
- [051 - Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard](051-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md) L22844-L22932 `5dbd7638ce8767ab146afba96b22059969c4c6f5f30c92d81f205dd0cdb6f27d`
- [052 - Ledger Compile Addendum - pldg-20260622-001-fff](052-ledger-compile-addendum-pldg-20260622-001-fff.md) L22934-L23020 `07ba5683a00ec0168397ef714721f7becb37e58479473bc1b3fcb07e7cc4d26f`
- [053 - Ledger Compile Addendum - pldg-20260626-001-feature-name](053-ledger-compile-addendum-pldg-20260626-001-feature-name.md) L23023-L23397 `2978fd5c77f0962e56ccf883e8fd0af3eb22a72eba68d4cb00b661680330708e`
- [054 - Ledger Compile Addendum - pldg-20260627-001-feature-intake](054-ledger-compile-addendum-pldg-20260627-001-feature-intake.md) L23399-L23610 `4e88ae4271c4fa33533fb9c78531e878420ec40530554a0de77e2cba4f7ee3e6`
- [055 - Ledger Compile Addendum - pldg-20260701-001-feature-intake](055-ledger-compile-addendum-pldg-20260701-001-feature-intake.md) L23612-L23691 `939c3a287f989e63c6052e21b99ac2c6b1485592a528a37e40216406431ac3fd`
- [056 - Ledger Compile Addendum - pldg-20260703-001-feature-intake](056-ledger-compile-addendum-pldg-20260703-001-feature-intake.md) L23693-L23758 `80c004ccb932a1fd6059a4e32a039c2ddd236b29851ee605d77e3670063b07e6`
- [057 - FABLE Residual Chat Mechanics Cleanup Addendum - 2026-07-07](057-fable-residual-chat-mechanics-cleanup-addendum-2026-07-07.md) L23760-L23831 `303bb2b4e911b1967cf43528718a418a17bd817b5289c438ee23ca8a62298fe2`
- [058 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](058-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L23833-L23877 `1cf977bfc8f9894c893a7b0e2e8a22f956c1043f4baa4b4365b8ec3c35360e69`
- [059 - Usage GUI Propagation Addendum - 2026-07-09](059-usage-gui-propagation-addendum-2026-07-09.md) L23879-L23955 `afd0cd8a3937d5086d4afa69ef26689e9039edce968ccfac20ebd0713e9e67f4`
- [060 - PMConcept6 Chat Polish Addendum - 2026-07-16](060-pmconcept6-chat-polish-addendum-2026-07-16.md) L23957-L24176 `29f162d0e69755029a7dac94821dee34cedea5cf5e84b759320cd6ab72af52c3`
- [061 - Immutable conversation restore-point lifecycle - Known-37 completion](061-immutable-conversation-restore-point-lifecycle-known-37-completi.md) L24179-L24196 `ecd4990d401352d4a5207932fc3fa007eda90357bae8752fb0980bad613317bb`
- [062 - PMConcept7 Concept Promotion Addendum - 2026-07-23](062-pmconcept7-concept-promotion-addendum-2026-07-23.md) L24198-L24564 `8f10d063382de3d059dcbcbedee59d105a9d3b8e00f42193907af3c6fef2bcc6`
- [063 - PMConcept7 shared Assistant seating and context surfaces addendum - 2026-08-27](063-pmconcept7-shared-assistant-seating-and-context-surfaces-addendu.md) L24566-L24656 `37c7fb9af099b0a5583e6af148c4f67c22e8343fd7bd91ee1c20b1587f69f61e`
- [064 - Additive Correction v4 — Consumed Assistant Behaviour (2026-09-03)](064-additive-correction-v4-consumed-assistant-behaviour-2026-09-03.md) L24658-L24695 `e9049fa9298b9a2c7b0303338f4167413dd0ebfc6be7ecb415b86e5b6e234dbc`
- [065 - Working Notebook Surface Addendum (2026-09-05)](065-working-notebook-surface-addendum-2026-09-05.md) L24697-L24805 `d5eb5690331c8077d1014d9f62f942afe1e443874cc689295ca768584f186793`
- [066 - Cumulative v3 Assistant Interaction & Surface Specification (2026-09-07)](066-cumulative-v3-assistant-interaction-surface-specification-2026-0.md) L24807-L25155 `a7c22e2585ed436b9ae5f3da2a5039b88234c0494d0dcd306c9e8e36d698de98`
- [067 - Research decision packet review](067-research-decision-packet-review.md) L25159-L25254 `65792c449ecb19d14e9790d9de5e940c0bb93b66a2305aa79dbd2948fc4e04bb`
- [068 - Context Lens Source and Preview Reconciliation — 2026-09-10](068-context-lens-source-and-preview-reconciliation-2026-09-10.md) L25256-L25341 `82de679cf36c011db8ca5d5d32c9a04a9e2c384e47c5300feb8bdcb27efff82b`
- [069 - Compaction completion Event Authority (DL-039 and DL-040)](069-compaction-completion-event-authority-dl-039-and-dl-040.md) L25343-L25396 `cf159b8d26ae4ff0d8b929b60abbc5dbb6eca55963c341e840dd804916add564`
- [070 - DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)](070-dl-042-historical-todo-event-migration-consumer-boundary-2026-09.md) L25399-L25440 `7527f571cac063414d6fb098182518776882989f03cb289f78558fb7b5bf30de`
- [071 - Restore-point created native and historical consumers](071-restore-point-created-native-and-historical-consumers.md) L25443-L25617 `204fcbe62e692103d1b93948e7c4f770f2eb50114f6986abc7ee7b5ec576c3b8`
- [072 - Deleted restore-point passive history admission](072-deleted-restore-point-passive-history-admission.md) L25620-L25686 `190e13cc35ee4b2fe15dae488c4dbb958d83306fce50c9f2d9fe681ffc0c3e79`
- [073 - Expired restore-point passive history admission](073-expired-restore-point-passive-history-admission.md) L25689-L25758 `d39c153780637ef32099c5c99df2d5ebedba4f48a9fc0ce806ba574b4cc9735a`
- [074 - External Research Decision Packet Consumer Addendum (2026-09-17)](074-external-research-decision-packet-consumer-addendum-2026-09-17.md) L25760-L25810 `acc096f7a58472dffab7dc25e4c122f76663a090d590f45e424f1d8de75c3f01`
- [075 - Passive Spelling And Dictionary Routing](075-passive-spelling-and-dictionary-routing.md) L25812-L25890 `ac06da36c3b3d11456fda9b8868af1520a71caf6eb901b60542054ddf04127c4`
- [076 - Guided Tour pre-tour Original Chat State Custody - 2026-09-25](076-guided-tour-pre-tour-original-chat-state-custody-2026-09-25.md) L25893-L25944 `31762e7b02a496d6e73649c7b1ad133c648c5c7b22b4049ac248e2775c91391f`
