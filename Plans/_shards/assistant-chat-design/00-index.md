# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-11-05T16:59:35Z

Source SHA256: `eea83a5bafb157d08bcd5b469f962dc8670b5c041eaa785f2699f81a0d0186dd`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `5508b3ad5e3c13bac07cfb0d8720382150b29329b012ab170126dc6355dc2ee1`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `28addce3d92c4c23f8b6e4dc5f1d9dc3af3bc0127a344d8fbce6f825f58da7cd`
- [003 - Change Summary](003-change-summary.md) L14-L30 `7d8e835a20ec885e522f7b22c4a82022190bd8aaf7504a9035e8554214153f87`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L32-L47 `c2fe693ee37d51b0f279185f7369155a524326ae6244b4bc97378069cd49a16d`
- [005 - Executive Summary](005-executive-summary.md) L48-L52 `db6a8622e0144ec129d8e5fc85518a760825cdcaebb7605bee20bfdf3e31e2a1`
- [006 - Table of Contents](006-table-of-contents.md) L54-L90 `0a2c6b311dfd26b4dd52e563fc41b2f849cfedf223774e756dae41d95ddc1504`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L92-L207 `36af4de6c0d5e75fe3a7fed9b2d0885f35ddcec9dacf2b4f725032d8cbb0c0ac`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L209-L232 `f34d26a200561297c749b6a182e86451f91a0541c4c2cf77b0b61322b4fcdfb6`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L234-L240 `88d087ac778564694d760e9ce99502e295ec308455a36a22d28dbbc144cbceb3`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L242-L291 `396e03dbeb88be11fc5f4d37d73f3a2b22fc116f875bf6f38d49c62526f440e5`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L292-L440 `a355bae9e08ade4ffd24596c1484e735a252ddef0d05e0928cd60a437e42e9bd`
- [012 - 6. Teach](012-6.-teach.md) L441-L483 `d426292a7242fcd9d0276145327b12869c182eb792ba80e49f3cbbf30c102c36`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L485-L671 `66646f4a1087a8447b4bbcc4d98c05cbbdf81ab71d401d81a298c5e154440d21`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L672-L964 `b00f312c7430627120424fbcd59c1c4600c2e567bcd996c1e74df106809aa7e7`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L966-L1008 `d11410235a6312a19cbf0300c9e83cd3e8c68f20eab9c0a25d4b219a21e28159`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L1010-L1081 `d5d7f0b2e42b804ee1e469af244d3ad259343158a180b0c892020387a6bfbe32`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1082-L1259 `a94a424bdafafb6453de6aeb866f3b9957bfd77670d13f2a803ab5f356025a12`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1260-L1370 `507303957ab0e23933f330885671833e0922a8a5a5d9f25cf3b037128549b927`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1371-L1788 `bcefbac8c71c15f4019c091065d6b9ac5a49967d12d2be02e592ff1e711c13f1`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1789-L1906 `54c7b430b0265e63a0eb21f2f6aead53037b19b1ce1afa570d4d4d867be7a4bb`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1907-L1940 `c0259709f1a8f9959022c4ec72628d91e1232d73ffc07c85e49309bac75bfd0a`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1941-L1980 `55ef48897dceae4b706c5ea9500e9e3c9ab2fbde9d2f9094d48f49bc26eb88c1`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1982-L2095 `9ae0dc57dd120e8a8c513f16d09ea9b38ab8a83646900df980e6b4ba86f1f220`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L2096-L2107 `9e96694757c5c8bc5b052ed3a16988de21dc78d4040b8166d95231645ea145ce`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L2109-L2118 `79cf4fbf93875ae90fb9985ff4a60fe382cd4a58537fec518b5bc48180474be1`
- [026 - 20. References](026-20.-references.md) L2120-L2149 `a957e563d1fa90cedab3a892756f2ab03f92b02849b9950f697430d1780f8b3e`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2150-L2168 `5f8d70df797fa0af9bacf35fb142654bd079417044797803240601938bfa08be`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2170-L2204 `72403ab828e566781f11b974086eb2faafec9722c78a48094385263f8c5ffb1d`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2205-L2300 `b5dd9282741b00de8cb5cd572c74ef626542b33c02ba0370af77b63d8f6255fa`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2302-L2355 `9a684d16ccc6efb5c24b173cbc04e4d9cab759d0e6968dd4ee52d95c4d581577`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2356-L2362 `1dd0557cd815fbdad481a1f1d9a3f8d27bb15a90b81584b4420c9a7bd496a1f8`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep)](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2363-L2465 `eeb5d62c6a106843ce53d135a55e18e6465152ba45ae5df2ae4f04a29e46112f`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2466-L2602 `b7635a6751dfc4a420d4ef52ead2f10fed9fe189f82bb77d9cb4f8d74509cf71`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2604-L2649 `5b5b8ceef66a6e16b75bf91fb6617d37d98d1a23259d60c08c2df291d98e46d9`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2650-L2759 `ef11b0ac64875f5121111bc318ba938109756d3207fab75a69737d96eb7f9c9a`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2761-L2776 `15561bb9b7423a67163e1973f94e1bd56907e1437d316dc5be40c7f59ec0f11c`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2777-L2789 `1949fdd878b36c70f2a768c9816178ddc9c62ca6cb820a91c9d43b9a52bb8181`
- [038 - Ledger Compile Addendum - pldg-20260630-001-feature-intake](038-ledger-compile-addendum-pldg-20260630-001-feature-intake.md) L2791-L2859 `9b40f360a0af1494fc3aacdabe81f73da90d40753be2d3f5483c62a8cc463d42`
- [039 - Ledger Compile Addendum - pldg-20260624-001-provider-updates](039-ledger-compile-addendum-pldg-20260624-001-provider-updates.md) L2861-L3503 `9f42b62831674574636b06ad9305cb87c2bc7315030ecd1f1596e395425a3175`
- [040 - Shared actor-boundary, route payload, and blocked_notice packet](040-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3504-L3524 `3f4044d5a1b19a6927ee8d04804832b78d3241f8fbe24e1f6c7ca0333d43b254`
- [041 - Shared Conversational Actor Runtime Identity](041-shared-conversational-actor-runtime-identity.md) L3526-L3540 `16386ee244b375fe5e1f01caf0d6c4ec1b45f8b8d99cd80d8ac8ec27b3df2031`
- [042 - Chat Route, Permission, and History Behaviors](042-chat-route-permission-and-history-behaviors.md) L3542-L3556 `77000b2573aa8568790c654949cfd24c5c726dd5ec87e965e65c514597b40258`
- [043 - Owner / Consumer Map](043-owner-consumer-map.md) L3558-L3562 `b644418d5d8e3e9df8406e86c893c4c44c51e76ec7dca707f0a9ea32bf9324fd`
- [044 - PlanUnits](044-planunits.md) L3564-L3615 `c8d6aedb033e5566d9976603e041a6a93071299b1bdf8e38628911c1c739729d`
- [045 - Shared runtime projection addendum (2026-08-13)](045-shared-runtime-projection-addendum-2026-08-13.md) L3617-L22624 `f30aca02fae8285ee86fb53e330d4dd7164ac9d78f30650b22a866e652b41968`
- [046 - Migration Coverage](046-migration-coverage.md) L22626-L22656 `3fdf61b9b997db2ef60849bf3236402a72b96d702eee0c8fd07a533a6978d9bc`
- [047 - Ledger Compile Addendum - pldg-20260614-001](047-ledger-compile-addendum-pldg-20260614-001.md) L22658-L22746 `25ce08476c25ceaeff2079b4c14617589ca253f013c569ed285431b091d8be5d`
- [048 - Ledger Compile Addendum - pldg-20260615-001](048-ledger-compile-addendum-pldg-20260615-001.md) L22748-L22845 `8933dd8ef659e8b1eeb785e88949415bfa38dbbb5606ea69542ec61a88ed1b0d`
- [049 - Ledger Compile Addendum - pldg-20260616-001](049-ledger-compile-addendum-pldg-20260616-001.md) L22847-L23172 `6878abc63832387c43a42b2a47d3446c201f3d9f9a79f4fc699a469854b9b947`
- [050 - Ledger Compile Addendum - pldg-20260616-002](050-ledger-compile-addendum-pldg-20260616-002.md) L23174-L23247 `e7caeb282fef2403f1428ebb31a37b70e609c53b1e39f87d70264006dd1ca94c`
- [051 - Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard](051-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md) L23250-L23338 `22b0544752ff8142c78973cbfa0b438a5d15f947c828988414f5a1b9258532b1`
- [052 - Ledger Compile Addendum - pldg-20260622-001-fff](052-ledger-compile-addendum-pldg-20260622-001-fff.md) L23340-L23426 `41c47f2ebb64bf8720e94c8f650f75b839502ec24c3a02313d6a10536d4a45a7`
- [053 - Ledger Compile Addendum - pldg-20260626-001-feature-name](053-ledger-compile-addendum-pldg-20260626-001-feature-name.md) L23429-L23805 `29c25004f14551591c33ef65db99534c77ad3acaece2c494b38ff09e3fd99fbc`
- [054 - Ledger Compile Addendum - pldg-20260627-001-feature-intake](054-ledger-compile-addendum-pldg-20260627-001-feature-intake.md) L23807-L24018 `4918de43ccd361b20eafa6122e59612de9f54b03cb6534c881f3716bf305ff76`
- [055 - Ledger Compile Addendum - pldg-20260701-001-feature-intake](055-ledger-compile-addendum-pldg-20260701-001-feature-intake.md) L24020-L24099 `661a2b977f26ce1fc30ccb80ad6e1ab83b681b30ca496de2b1af15dac26fe814`
- [056 - Ledger Compile Addendum - pldg-20260703-001-feature-intake](056-ledger-compile-addendum-pldg-20260703-001-feature-intake.md) L24101-L24166 `dfd7a1a68259b7322df7047c0fa5c3e236508bc19e932e66096e51830b5e17b9`
- [057 - FABLE Residual Chat Mechanics Cleanup Addendum - 2026-07-07](057-fable-residual-chat-mechanics-cleanup-addendum-2026-07-07.md) L24168-L24239 `ed2b3a20147b7d8f584454190e7d85da56e806d142261969b334d23de37525cf`
- [058 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](058-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L24241-L24285 `9568cf44c2fdb2a9a9cd70c1b588180fde2762581e177bf3ad07c56c490501e6`
- [059 - Usage GUI Propagation Addendum - 2026-07-09](059-usage-gui-propagation-addendum-2026-07-09.md) L24287-L24363 `099595d6741cb06d128fed02cf450ffa9409fd67aefa1f2ebd7536e75af1ca84`
- [060 - PMConcept6 Chat Polish Addendum - 2026-07-16](060-pmconcept6-chat-polish-addendum-2026-07-16.md) L24365-L24597 `8e2ab80f2822ee2f78628ff3e8d58b656b2e57b753a08e0a21b7ce5c08f339f7`
- [061 - Immutable conversation restore-point lifecycle - Known-37 completion](061-immutable-conversation-restore-point-lifecycle-known-37-completi.md) L24600-L24617 `daed88954c5965856ab311e4078f9f105a34d7ad86a88b1cf0e37bac692151e7`
- [062 - PMConcept7 Concept Promotion Addendum - 2026-07-23](062-pmconcept7-concept-promotion-addendum-2026-07-23.md) L24619-L24996 `c29ca51a75c57f4405c6db744b9c4ddb756578569ebcc82732cebd888b22033b`
- [063 - PMConcept7 shared Assistant seating and context surfaces addendum - 2026-08-27](063-pmconcept7-shared-assistant-seating-and-context-surfaces-addendu.md) L24998-L25099 `f9f6f722955be4473cd80363cf34bc72284159d4f91e394a0789bb8be87532ad`
- [064 - Additive Correction v4 — Consumed Assistant Behaviour (2026-09-03)](064-additive-correction-v4-consumed-assistant-behaviour-2026-09-03.md) L25101-L25149 `15d26a934b369448dc46bab0871fc8db1e2bba08e2fac2732b6f9c1f811bb280`
- [065 - Working Notebook Surface Addendum (2026-09-05)](065-working-notebook-surface-addendum-2026-09-05.md) L25151-L25284 `8df69257b9a366591f41879104faf4f47e85ebe83f9024547458fd9843db49d0`
- [066 - Cumulative v3 Assistant Interaction & Surface Specification (2026-09-07)](066-cumulative-v3-assistant-interaction-surface-specification-2026-0.md) L25286-L25679 `658d5d02f6f89e28f96fbb05e909bc2f37712dd214f024b231c2c1a3bf4d6dbe`
- [067 - Research decision packet review](067-research-decision-packet-review.md) L25683-L25778 `6c8a699773d20d9a4cad8d365f734b26da0e7181174d6ea2e28800dc6c1475b6`
- [068 - Context Lens Source and Preview Reconciliation — 2026-09-10](068-context-lens-source-and-preview-reconciliation-2026-09-10.md) L25780-L25844 `3491ac9a07cd582db8403bd4d01b200d34dca551f2ef6bcc1b1ff7a509a765ee`
- [069 - Compaction completion Event Authority (DL-039 and DL-040)](069-compaction-completion-event-authority-dl-039-and-dl-040.md) L25846-L25910 `00a7baead011ac5673715b45b149691717da92981eaa6742cd6dc18d9bff29d0`
- [070 - DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)](070-dl-042-historical-todo-event-migration-consumer-boundary-2026-09.md) L25913-L25968 `98bf89f813d03a83f55ebece5d0febda72614e742279f5f4ae52e61500f0a256`
- [071 - Restore-point created native and historical consumers](071-restore-point-created-native-and-historical-consumers.md) L25971-L26146 `a3b2c807f7f34f2e60ff849da3285e3dff65180dce3d5a218f2f1d0a48cf2548`
- [072 - Deleted restore-point passive history admission](072-deleted-restore-point-passive-history-admission.md) L26149-L26215 `179f8a63e0caaa8b341f12c59f1cffd39212412b3fae108456e80bcb9869b986`
- [073 - Expired restore-point passive history admission](073-expired-restore-point-passive-history-admission.md) L26218-L26287 `a3d616ffd6cc8eaedbcf5a9a09aa7fd196cd528bc15145ddcfc6ad414881a893`
- [074 - External Research Decision Packet Consumer Addendum (2026-09-17)](074-external-research-decision-packet-consumer-addendum-2026-09-17.md) L26289-L26339 `d474011fa735306185ca4aa193ead378578fe8649100e35e3939c3d97989eb62`
- [075 - Chat WOW Turn Presentation Addendum (2026-09-27)](075-chat-wow-turn-presentation-addendum-2026-09-27.md) L26341-L26986 `4f3e121273ccc9c3a80a5d72e156829ee393cb18e5a1769ec03130589dc2975e`
- [076 - Wand Modules Redesign Addendum (2026-09-27)](076-wand-modules-redesign-addendum-2026-09-27.md) L26988-L27713 `4a4ff3960a0e0b40a6c086e62c3c2733d79f7e8454802e570a067316f7d93e7b`
- [077 - Chat Tweaks Addendum (2026-10-08)](077-chat-tweaks-addendum-2026-10-08.md) L27715-L27791 `2e27106414093fbf2ea10cd2e1881aefb684599255a53ef521550a92c8368ce4`
- [078 - DL-180, DL-181 and DL-185 — What The Chat Opens, Its Column, Its Command Card And The Port (2026-10-09)](078-dl-180-dl-181-and-dl-185-what-the-chat-opens-its-column-its-comm.md) L27793-L28282 `5ea2b4422cbdf42d1e32d7859003a265a67ef8f456132ce47917e73f7635f645`
- [079 - Grill Me rounds and agreement — DL-218](079-grill-me-rounds-and-agreement-dl-218.md) L28284-L30433 `1492c53d44bba2771bcb45d34445793e59cdd40fbbb4447247bf0aae87aa6b15`
