# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-11-26T10:30:32Z

Source SHA256: `abba158a9dd9a3e735683a21618cdd13e8b10232eab43869d579088560ba391a`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `2e202fb484dd9060091c9b8e056ff3a6dbcafff5fd26583137e4d4e9ce85a416`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `d74bd63c77394c3c605f3776a6c7a9f9d5a1165e3e65b8c7bd67d986e84ce4c0`
- [003 - Change Summary](003-change-summary.md) L14-L30 `4c88b955b61aa068ade52cebba703f599d1a850d277c6ab66a0d7e5925aab007`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L32-L47 `d709d7339926e45ac0b1bc1dce48b348b0b80e562f0dd8cbc38a4c6632abad3e`
- [005 - Executive Summary](005-executive-summary.md) L48-L52 `95dbf2e3488a4387d88e3aaccb8fd7e5dfba42c80d042ce6b303c99c53843a6a`
- [006 - Table of Contents](006-table-of-contents.md) L54-L90 `ae544701c3d7e1f18c79d1eb97fb52802fc7b4f862f875dcbc7122d1bd1c8681`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L92-L207 `618bb330a3b76e339d48a3e47e1e142d4c73d73a1675679cb2c72a6903fe04e5`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L209-L232 `a29c3ebdae1c5a586f49b1743c43dbc952fbabf57545f1d2f97cd8c6b4192d23`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L234-L240 `b98aff670a3a9dc768bab3d4c98bce310fef25892c4764325f44b5c3e7b98d73`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L242-L291 `4371a6bc488deb11620bff0e68385eb2ee28c3560f222a2c851668e4da4864d0`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L292-L440 `a914dff7fff138ab381a2c5a603811bec705e9bb1a03324349243b2e78d1f757`
- [012 - 6. Teach](012-6.-teach.md) L441-L479 `a8686e0b8a7c6bde367aa0d3dee93060ffa9aa491656ef0f89d940fde5d276b1`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L481-L667 `3f7249b2d8c23105fabc876f2e5ccb74161b0869cf184fc11da75d5770dd9805`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L668-L960 `fc02194871a8dc2d92401a87bbea2a7704150e55a5d1462b4c40fabe0f8aabec`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L962-L1004 `ac460c1f24a0fc98f5a59397cec66e6120c85229e7d5c5217359a7b8056be01b`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L1006-L1077 `04fc5feee9ac23e56953aa4d4e1d5b35573298d8a7900967bb8170286792b8d3`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1078-L1258 `ad5d42bdc264c3a46f29c91d297304fccdd4297fd176233f80ccc621dd08982d`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1259-L1365 `583011481edf994e8cf407d63581b0ac430db3769b4d158a82c1200cae5f2182`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1366-L1783 `656868f3f908bf772601612b85de95fa10b8726f57a89715d7adf53921d46cf3`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1784-L1901 `61e3930e4f0ce6a71dd260328db6473e5062b94e4e4ededc8eb583bc902ad40d`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1902-L1935 `b7ee70d3ef98627307e26e9581a2927cb6022438cec7533d96ec809aed7298f9`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1936-L1975 `f6767eee07e1c26524437a9c3314d8fa4fe1c4abc355520c1449ec3c92c05fa9`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1977-L2090 `75699d9084558570fafa5d35b9e6dff10fcac8288fd8ef2cc3484e9186e832fa`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L2091-L2102 `861ce0eae229c9872f787b38bb6a2548486a8d1ae89de484bf13cfdce3d2a76a`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L2104-L2113 `eeb02a1be5b70459809c65feb693872c2dab56d1fd656a648fd3d7ad96413c35`
- [026 - 20. References](026-20.-references.md) L2115-L2144 `a62086fabbd5b67b4eae3673c8e329f88a37bf26ad62340684abe15fe8ea0afb`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2145-L2163 `6b43b83e489b1edd6d91c1b40cfa1369a7247ddbc9494d39edd1dc29fab6bf01`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2165-L2199 `ef42c12053e34bbdce15ab81ce87c0e8df2002084f609df3ddfae020b93c3120`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2200-L2295 `9eadf9ac25d7757cd44ac6f2dfb6247010c45219bc117df0b4bc14681ec40b1c`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2297-L2351 `d63aa9a80e7a4dc0ec7111e2903ef242fb84c36ba30b06d688f65e1eb4579c95`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2352-L2358 `8c949ad80ac8bce521cd3e73f411689478068fbfb79ffb81c86f4c62840f15e8`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep) And Loop Specification](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2359-L2599 `2cf524e6d15bff757e5d670753639c6afeeb7267559686ce43b6b95fce71df84`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2601-L2737 `b1828cec5044ef10f7ab77c64ef41609e732ba4ce088e178673222c0b4a79c30`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2739-L2784 `cb9c2dc19f987adebce5460d985efa328701aea62c910448cadab17a8680acc7`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2785-L2894 `0ba6e33dd2fed2544037b76f0666a37e4d705490d7bcd05b32c081d48faf8915`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2896-L2911 `f5edc02b371617ebca25ae321c82bbab93fabf2718f3763dc64c42eb0fd82d1e`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2912-L2924 `a73cb0b4a172d2b88a4ab70c9b7860dd27fbc0a59066dc265d92f85cdb7554bb`
- [038 - Ledger Compile Addendum - pldg-20260630-001-feature-intake](038-ledger-compile-addendum-pldg-20260630-001-feature-intake.md) L2926-L2994 `fa979d873ed16d237a358d37ef53084362747daa7b2fc2c1dc97c929008c701b`
- [039 - Ledger Compile Addendum - pldg-20260624-001-provider-updates](039-ledger-compile-addendum-pldg-20260624-001-provider-updates.md) L2996-L3638 `22232ab80f9e5ea91a758c05585a6439a000889a4d8236fdf1e5af93bdc96c8f`
- [040 - Shared actor-boundary, route payload, and blocked_notice packet](040-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3639-L3659 `c7ed43b3609e5493a54db15dd55e83b069a6f9340a51e817c735fe031288d547`
- [041 - Shared Conversational Actor Runtime Identity](041-shared-conversational-actor-runtime-identity.md) L3661-L3675 `b95e9c950fd64ee3edd9b3d0df605269b082a60cc1b6c0e6661f8b29769398a1`
- [042 - Chat Route, Permission, and History Behaviors](042-chat-route-permission-and-history-behaviors.md) L3677-L3691 `4b7f440f04de3af3168cc3390294fa23e35d206c94aa0adfb8acaf0052300bca`
- [043 - Owner / Consumer Map](043-owner-consumer-map.md) L3693-L3697 `991f209b974312b07d8c6b96a28497558b630d42801e2ab182673b1fa63948f2`
- [044 - PlanUnits](044-planunits.md) L3699-L3750 `469a5fbb0f3092ebdfe57b021eeecffc229884b5e50c0ddc7bc54ff476c048fd`
- [045 - Shared runtime projection addendum (2026-08-13)](045-shared-runtime-projection-addendum-2026-08-13.md) L3752-L23148 `dbdd613a2c632d4ab726a025b6b10252ecf106ce3b4bc07100e9c3f6a54a6e86`
- [046 - Migration Coverage](046-migration-coverage.md) L23150-L23180 `569f3b0170394a6a8b29f43df6b2ddf481bfc6a9a942c7b568032eeeaa736f4b`
- [047 - Ledger Compile Addendum - pldg-20260614-001](047-ledger-compile-addendum-pldg-20260614-001.md) L23182-L23270 `dcf7b8f2004bbf3ffb5ea1c69ff4d1b8c851a2a1ecaa73c764a6526987e30a34`
- [048 - Ledger Compile Addendum - pldg-20260615-001](048-ledger-compile-addendum-pldg-20260615-001.md) L23272-L23369 `9328e7760fce21d20ea4a630690932bca9bf335287e7024c63bbe9364b8cf179`
- [049 - Ledger Compile Addendum - pldg-20260616-001](049-ledger-compile-addendum-pldg-20260616-001.md) L23371-L23697 `13d32dc649b51d657d6846599e7a00f152f797b4d94a54364432c98b7812853d`
- [050 - Ledger Compile Addendum - pldg-20260616-002](050-ledger-compile-addendum-pldg-20260616-002.md) L23699-L23772 `b847f0e62974ae8e0b2c16fd453e83c92d0031096046e578edf43f713aa25291`
- [051 - Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard](051-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md) L23775-L23863 `d9a5a44024751a033f2bce3f5446228451dcf4ec9d29c1f2c10653b7acedc26c`
- [052 - Ledger Compile Addendum - pldg-20260622-001-fff](052-ledger-compile-addendum-pldg-20260622-001-fff.md) L23865-L23951 `308738a9a8a5e5840a30d0e67fb8bb052c9030bb2a120f7280315600868943fe`
- [053 - Ledger Compile Addendum - pldg-20260626-001-feature-name](053-ledger-compile-addendum-pldg-20260626-001-feature-name.md) L23954-L24294 `56b807dac24d85ce5d0f85c14fe438c7bc3df82ea2a4f17bd00f3df1ae9eb1e2`
- [054 - Ledger Compile Addendum - pldg-20260627-001-feature-intake](054-ledger-compile-addendum-pldg-20260627-001-feature-intake.md) L24296-L24507 `bd51a29762b6d28d52327d94854dc75d41e9cd6bd9674041a178450384a02316`
- [055 - Ledger Compile Addendum - pldg-20260701-001-feature-intake](055-ledger-compile-addendum-pldg-20260701-001-feature-intake.md) L24509-L24590 `380d6bb534ede566083526436a667cd143d606a1349c9deedd005b97d3ee647f`
- [056 - Ledger Compile Addendum - pldg-20260703-001-feature-intake](056-ledger-compile-addendum-pldg-20260703-001-feature-intake.md) L24592-L24657 `5aae43dd16cc61419af6ef897126c65921bf5b70c4b89b56b9ef03f0b66f4a4b`
- [057 - FABLE Residual Chat Mechanics Cleanup Addendum - 2026-07-07](057-fable-residual-chat-mechanics-cleanup-addendum-2026-07-07.md) L24659-L24730 `356424187dc0450dcc28249251e76f2a792de50c279e1d00cc1ea7db2e57b5fc`
- [058 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](058-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L24732-L24781 `d3f5988167cdb61fe73c56169db76ca2dfec3c7ed0a90d5491fd3cf17423de0e`
- [059 - Usage GUI Propagation Addendum - 2026-07-09](059-usage-gui-propagation-addendum-2026-07-09.md) L24783-L24870 `8ca343a031e9704beda8e7f753b5ace6329ce32e5aa2a3c5343627c66f733ba1`
- [060 - PMConcept6 Chat Polish Addendum - 2026-07-16](060-pmconcept6-chat-polish-addendum-2026-07-16.md) L24872-L25107 `09b182e77bb253e48bd6c3fa9c492b2725b336c890c36033dd17decd61cab54b`
- [061 - Immutable conversation restore-point lifecycle - Known-37 completion](061-immutable-conversation-restore-point-lifecycle-known-37-completi.md) L25110-L25127 `df64c45e852369b09cd562bf1f9a61d9914a3019ea1512bc062685751f487485`
- [062 - PMConcept7 Concept Promotion Addendum - 2026-07-23](062-pmconcept7-concept-promotion-addendum-2026-07-23.md) L25129-L25501 `94edd1a4b026292f4259ff18ee48ddea054feb14de4d758138f3b46ee569e893`
- [063 - PMConcept7 shared Assistant seating and context surfaces addendum - 2026-08-27](063-pmconcept7-shared-assistant-seating-and-context-surfaces-addendu.md) L25503-L25609 `3afd7c44f608b27e96d768cde17c9b7049495738be75d5b59d765ee0d75bc697`
- [064 - Additive Correction v4 — Consumed Assistant Behaviour (2026-09-03)](064-additive-correction-v4-consumed-assistant-behaviour-2026-09-03.md) L25611-L25659 `3a9520b24d26d108710dfe2d61417d49e4c17aa106caaf2ed1aacb9947156c65`
- [065 - Working Notebook Surface Addendum (2026-09-05)](065-working-notebook-surface-addendum-2026-09-05.md) L25661-L25800 `1f7da58ac1da702ce675728bca74f084fc2f68f22ce55e4f53cbd5b001c78ff9`
- [066 - Cumulative v3 Assistant Interaction & Surface Specification (2026-09-07)](066-cumulative-v3-assistant-interaction-surface-specification-2026-0.md) L25802-L26195 `e2e3c1d30c8d1347ae378d5b9ad32edce5be41b9aaa5979dffd42254afd79c3d`
- [067 - Research decision packet review](067-research-decision-packet-review.md) L26199-L26294 `1abdfeeaad567dde3ebb1a1b5dd8ff7396ea4fcf30405e2f4a5d72992e78f031`
- [068 - Context Lens Source and Preview Reconciliation — 2026-09-10](068-context-lens-source-and-preview-reconciliation-2026-09-10.md) L26296-L26360 `3203c3bdca0760df489ad12ea2aa202b02c361c32464cb580bc957a79f0fd724`
- [069 - Compaction completion Event Authority (DL-039 and DL-040)](069-compaction-completion-event-authority-dl-039-and-dl-040.md) L26362-L26426 `3efff19ee7b9b2f4c35bd932dc01d4e259f24bda7c5c8ebe7fb29ba9008563eb`
- [070 - DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)](070-dl-042-historical-todo-event-migration-consumer-boundary-2026-09.md) L26429-L26484 `b9179a2f8e8f3a4d486faa87ca986080d464c00c6cfc71f7a410bc0e475ae11b`
- [071 - Restore-point created native and historical consumers](071-restore-point-created-native-and-historical-consumers.md) L26487-L26682 `fec79a01510d653b17919f25e72b06418daa5d01a796cf14aa1f705767f7f2f1`
- [072 - Deleted restore-point passive history admission](072-deleted-restore-point-passive-history-admission.md) L26685-L26751 `b83cd19f782deecfffb14bc0201630bc6e8c868e97b3efe32397f4b44e53aa81`
- [073 - Expired restore-point passive history admission](073-expired-restore-point-passive-history-admission.md) L26754-L26823 `2fa791c6202d1d68db0814e348c2811b9ee0c8b4443279d7e9204c837af6d0bd`
- [074 - External Research Decision Packet Consumer Addendum (2026-09-17)](074-external-research-decision-packet-consumer-addendum-2026-09-17.md) L26825-L26875 `17a3c6caaef52682545769b0a82018d565a69cf8d9e558d3591ae9fe4fde479c`
- [075 - Chat WOW Turn Presentation Addendum (2026-09-27)](075-chat-wow-turn-presentation-addendum-2026-09-27.md) L26877-L27525 `5f8938e1c394471320cf4b0a360a090fdcd6301cf9e8940dc37a192e2fd84db8`
- [076 - Wand Modules Redesign Addendum (2026-09-27)](076-wand-modules-redesign-addendum-2026-09-27.md) L27527-L28221 `47ed37d317f686ba0d6abf86ec6033c9686c26034d5aea9e03abcf5c9a371f5c`
- [077 - Chat Tweaks Addendum (2026-10-08)](077-chat-tweaks-addendum-2026-10-08.md) L28223-L28299 `1a60651c8bbb5c80f0f221bac96bffcd9ecb9c189c83a4f9c72685bd965c11c0`
- [078 - DL-180, DL-181 and DL-185 — What The Chat Opens, Its Column, Its Command Card And The Port (2026-10-09)](078-dl-180-dl-181-and-dl-185-what-the-chat-opens-its-column-its-comm.md) L28301-L28792 `8f9f67ae3e7a6625eeec772654ed68b6536f8dcb80e70d66b89231075d86728e`
- [079 - Grill Me rounds and agreement — DL-218](079-grill-me-rounds-and-agreement-dl-218.md) L28794-L29567 `290acf574cac3c88ac159d8300ff24e2411336d7574072e7088a6dea3bdf3a82`
- [080 - Command payload definitions (DL-333, 2026-11-05)](080-command-payload-definitions-dl-333-2026-11-05.md) L29569-L33478 `57872ba8234e8bca6b22d65f9d8afdd1c1d970a55a49bb1c8427ebf9f0ca33be`
- [081 - Markdown Pipeline, Streaming Correctness, Sanitization, And Math Addendum (2026-11-23, DL-2601)](081-markdown-pipeline-streaming-correctness-sanitization-and-math-ad.md) L33480-L33857 `fa6ba4fe47ace04e23a5ad5dd951fb691b8160c1e93159433346ca73cb879661`
