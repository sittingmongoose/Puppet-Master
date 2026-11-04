# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-11-04T18:52:55Z

Source SHA256: `86553c2d79c37e993d9ce0c2ccb75efa1acd034a54583239895fd2f5ef022c72`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `061bb0e32359c436049d9a83a2b79cb2a5333fe0774275e69f9ef55cd60aac1b`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `00d3f1fe4b9b6d49b19c66ee9ecf3e04d9f07d2e9d0514f960acc7939102edb9`
- [003 - Change Summary](003-change-summary.md) L14-L30 `55d03cae68828367ad522bfbf52879cc95c67dd4bbac1c11ccf9ccfd8f3ed264`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L32-L47 `8de67183283f82ceee7d69719009712a1d54c162cf3db945edf63d4ebda29008`
- [005 - Executive Summary](005-executive-summary.md) L48-L52 `ca22c4fb80286b51d70e0aa70f41f982cb1ad66477c998e72e3f09cbaf64672e`
- [006 - Table of Contents](006-table-of-contents.md) L54-L90 `4c8beb299617c25af0995320bbd006eb85a40d401e7e6f4b163012fb9d5e25c0`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L92-L207 `6be5be41c04aaa4c1ffca635993455d6b1fbead20bac30a21a144100b048532c`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L209-L232 `4ef63127c9ae98b19b4dd0fd2796f07d30fd5f02c8996f5f36274da8e7e40bc2`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L234-L240 `55f0cbf98c80b5d92d4e724ea7b3599f7edd4ef628f9440046a841de06197e0d`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L242-L291 `7ca2fa141f09148dad762b58a50be7f3f7ac197bd452503d5dbc46640037c231`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L292-L440 `0ceafec1a98deafcf15a25c249434ca25f655376bc7747ac49a4332bbb19d4d9`
- [012 - 6. Teach](012-6.-teach.md) L441-L483 `01f6302b228bbc465af0def83f6760f948dc6edce4930a1f77de39a77bea16d8`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L485-L671 `1e52b844477ced14a616690dbeb1d6555671d2329afad19fe8a6a7c2a6b73708`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L672-L964 `61f5a4c39a33b808dd616d62863edd33cb7d0789f6f8ed3efc0e16fcb4a649c9`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L966-L1008 `75adbb53aecd5fcf71591f74ebe7e05ff02883b88163e8c3b1d61f2611d4fe88`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L1010-L1081 `a36441be0036941ae0f17ce29d0e7de9bb1703cde6aaf4bf48aebc6f40fe899a`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1082-L1259 `6edefab1f1cdbdd0c9efd5a45e614a590fe27a1684296ba34b26e44af360d5ee`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1260-L1370 `e6eb182af5413e7cbaeb1e0eebb4734972f5b3a225985468eb3178a77041bfba`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1371-L1788 `0d6bbaa833c60901bd65a4afcfb35a7ce000f9c14f0c3d43dcbe46261a0d93de`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1789-L1906 `62e0122caa877b1975d59270d6cc07a90312a5097eadd47b4a0bff5ad649bb91`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1907-L1940 `1e91571ab54ba1b64f3d7f906282720bd866fe9082f40ead2f0f89bc70ba655b`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1941-L1980 `6784f2c94c20d55120a70adfe7030f3ddc16dcffaac8936872819bb362b1d95b`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1982-L2095 `912d4d00bcf3e45b62cd3aaed5a8dbc3339e0add51c75b415df0fecd015e4ef8`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L2096-L2107 `40579bac60710dd89feb29a2487cc4046e8f1fe834a3725b75f1a907d301ea4b`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L2109-L2118 `c1658743b9d4b6e8490055df146cc10c512f7f5412c2057895aff0bc77c3af92`
- [026 - 20. References](026-20.-references.md) L2120-L2149 `7411bdac8c37f1bb999ed90c0837a04c82f4413ed474a1f8401de23151bceff2`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2150-L2168 `f43978a430f327f34d39834f8183542133708646697b84b0e3ff149b4ff67dfa`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2170-L2204 `8549464b8878fbfe2ffd476af9be601b084ae15126d8ff803e051eb01fb08c12`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2205-L2300 `19ca340528e2ad226cb5e94d4b4af23a37db884f7a8c0c5f4d6a0db3bdc736a5`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2302-L2355 `ef67cc7efafb0595b94339ea75f2f1737a1807b8222856acab6a82f4412da74e`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2356-L2362 `b6131c95d7b6ba2c8692998b9651462feaddf660aabd5876ec6fa0aa48a64d47`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep)](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2363-L2465 `f2507056f7d011a8bfb9571d4b0c85f16a7f8f7cd9c79a2c574454c8ece1077a`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2466-L2602 `18051cd28d9873bab75f02c572bc13015ca9c362556b5c2c8f9105230ebe631d`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2604-L2649 `8b22802451b5fc1bea960992fa40ab09f218dd544b8df74f0b5c6dccd70482c1`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2650-L2759 `f098d81e81dd2d093ba0d736ca715a6d50841bc0324291af39dd333afcabdb47`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2761-L2776 `c4422650cc49e2e9f32c1c2dc5816fcaba6c8e1b4acfeb2c5267815d834cfe1e`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2777-L2789 `69a52fcdb6c8b9237a357c0139f10075fb860d5e81d9b003a2407eef2557621a`
- [038 - Ledger Compile Addendum - pldg-20260630-001-feature-intake](038-ledger-compile-addendum-pldg-20260630-001-feature-intake.md) L2791-L2859 `b3b65b92b0606d76cbcbf6aea681f8906f3603de362410229a44298cb3769b7d`
- [039 - Ledger Compile Addendum - pldg-20260624-001-provider-updates](039-ledger-compile-addendum-pldg-20260624-001-provider-updates.md) L2861-L3503 `956fe0adab0ad44b15d4e743eaaf10fa3e7a1abe2dd178c0f0a7bceefbadd433`
- [040 - Shared actor-boundary, route payload, and blocked_notice packet](040-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3504-L3524 `722797fbc9d3455c01e82d8b924be275a9d31e556043a21d2f6fae9e9ae9cc66`
- [041 - Shared Conversational Actor Runtime Identity](041-shared-conversational-actor-runtime-identity.md) L3526-L3540 `3f39febb363d7a32714237e5d736b7f3cf1749fbacc3c00689cf37cdc784c735`
- [042 - Chat Route, Permission, and History Behaviors](042-chat-route-permission-and-history-behaviors.md) L3542-L3556 `6efa017d5c1a85f9cc208116fa2107017bf8585aff8a4abb90d8081af0b8b866`
- [043 - Owner / Consumer Map](043-owner-consumer-map.md) L3558-L3562 `98a0f3f0e92bd19d01f1ae7ea508dba92395de94b73e459a8a7180d0fce3a3b0`
- [044 - PlanUnits](044-planunits.md) L3564-L3615 `a656f6ee8d6d6739bb4951e837b0c67e3fa4a97288cd6febeeac9824e283fbab`
- [045 - Shared runtime projection addendum (2026-08-13)](045-shared-runtime-projection-addendum-2026-08-13.md) L3617-L22624 `7839bc208bf4b884595a393eaeb220299aeda3b83233cb5d2ba9a9c04dc4130b`
- [046 - Migration Coverage](046-migration-coverage.md) L22626-L22656 `ea0209ec7178acab3e7cbb3c5b0d8bb7ed9384b3211cc048329bbc35b50d9ab9`
- [047 - Ledger Compile Addendum - pldg-20260614-001](047-ledger-compile-addendum-pldg-20260614-001.md) L22658-L22746 `fbf156832d14c8103e1a02f0f6e8577718cb60c24caaa1c9de7a7b6493dec2c9`
- [048 - Ledger Compile Addendum - pldg-20260615-001](048-ledger-compile-addendum-pldg-20260615-001.md) L22748-L22845 `30add7b32f8cc4f25e6a9f2c565ce62c3344dc85abf5e112c2e5bb3e252aaed4`
- [049 - Ledger Compile Addendum - pldg-20260616-001](049-ledger-compile-addendum-pldg-20260616-001.md) L22847-L23172 `9c4006d489ea742f1c135c96a9f64f1991b2c8451c20bad20b995eb392ec3eb8`
- [050 - Ledger Compile Addendum - pldg-20260616-002](050-ledger-compile-addendum-pldg-20260616-002.md) L23174-L23247 `f1fc8bae117b75003da1a9d31ea8e74dd47b16df69c9432c552d938b36a18451`
- [051 - Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard](051-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md) L23250-L23338 `eaa78c0ca9a455e30a61aa9345b726d4fa1844905cfaac881a4d39f3875530df`
- [052 - Ledger Compile Addendum - pldg-20260622-001-fff](052-ledger-compile-addendum-pldg-20260622-001-fff.md) L23340-L23426 `102df71d7d269a66510a482c4974087ec99296fca265e2053eb4acd4b153c93d`
- [053 - Ledger Compile Addendum - pldg-20260626-001-feature-name](053-ledger-compile-addendum-pldg-20260626-001-feature-name.md) L23429-L23805 `aa68b6ae9185b080720739ca54745e28b221f1ad9a7b7cdbfe691c4fe4cbf69c`
- [054 - Ledger Compile Addendum - pldg-20260627-001-feature-intake](054-ledger-compile-addendum-pldg-20260627-001-feature-intake.md) L23807-L24018 `4d64a6708a0f42f5856c4c85b7377bd64f641aa95f54a4b11fc25c301ac8f549`
- [055 - Ledger Compile Addendum - pldg-20260701-001-feature-intake](055-ledger-compile-addendum-pldg-20260701-001-feature-intake.md) L24020-L24099 `9ee8b5840e1ab5eae80b96aa032842a7627e26a195be232bc6075abcadedbe8c`
- [056 - Ledger Compile Addendum - pldg-20260703-001-feature-intake](056-ledger-compile-addendum-pldg-20260703-001-feature-intake.md) L24101-L24166 `9afa333ff9bb266e04ec554d8784b451727a7d176da8df66341c8e3f7a00c01e`
- [057 - FABLE Residual Chat Mechanics Cleanup Addendum - 2026-07-07](057-fable-residual-chat-mechanics-cleanup-addendum-2026-07-07.md) L24168-L24239 `404be772b0e249f654eaf7179aad6b6896f254de872e1c1e2c947871482b7245`
- [058 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](058-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L24241-L24285 `3f1e3220dae51e036315544e238852c6d6f492639b0abdb968c30b98e15d5e16`
- [059 - Usage GUI Propagation Addendum - 2026-07-09](059-usage-gui-propagation-addendum-2026-07-09.md) L24287-L24363 `9a98874974c375ae8629af47a6a2fa1afc57263a2f742593c135b3432ad457e1`
- [060 - PMConcept6 Chat Polish Addendum - 2026-07-16](060-pmconcept6-chat-polish-addendum-2026-07-16.md) L24365-L24597 `f8d7dac4c329a2c2c8062c5db47a195087d644251a317594b5988b22a42e3be6`
- [061 - Immutable conversation restore-point lifecycle - Known-37 completion](061-immutable-conversation-restore-point-lifecycle-known-37-completi.md) L24600-L24617 `a9d784fd476099addf7f4092283fe14cc6e7622afe63995e3c93ce5ddb2909d2`
- [062 - PMConcept7 Concept Promotion Addendum - 2026-07-23](062-pmconcept7-concept-promotion-addendum-2026-07-23.md) L24619-L25017 `cd280dd61a1c55169840a0ca110d355f21178a697b9ff3b3662876e610ecd226`
- [063 - PMConcept7 shared Assistant seating and context surfaces addendum - 2026-08-27](063-pmconcept7-shared-assistant-seating-and-context-surfaces-addendu.md) L25019-L25121 `fbd99d0fed182c42bae934ba146308f53615abd798b02e5bbd3c02a7c3d33133`
- [064 - Additive Correction v4 — Consumed Assistant Behaviour (2026-09-03)](064-additive-correction-v4-consumed-assistant-behaviour-2026-09-03.md) L25123-L25171 `d0711e2bbfb68cd695594ec935a2dca7cd4d7a174f82c49ee4f0156502f620ae`
- [065 - Working Notebook Surface Addendum (2026-09-05)](065-working-notebook-surface-addendum-2026-09-05.md) L25173-L25306 `d3ca7274852a1b0c5817ddffe0aeccb514f9e091d89b0dd135c0ac053fa1cc60`
- [066 - Cumulative v3 Assistant Interaction & Surface Specification (2026-09-07)](066-cumulative-v3-assistant-interaction-surface-specification-2026-0.md) L25308-L25701 `328b0a14bb3f2f1ceccb7b1fe0a8d7ff8c5b8a89ea759c2924f20bf7987dda94`
- [067 - Research decision packet review](067-research-decision-packet-review.md) L25705-L25800 `6e1c5f10af371f8c8a5b7859f3c6e7682fe2d67eb7ea1b6687fe62f18f393764`
- [068 - Context Lens Source and Preview Reconciliation — 2026-09-10](068-context-lens-source-and-preview-reconciliation-2026-09-10.md) L25802-L25866 `7ad0143b5a3d5647c264572dad22124767f1d8bce0b445fef5a9690f6c75918b`
- [069 - Compaction completion Event Authority (DL-039 and DL-040)](069-compaction-completion-event-authority-dl-039-and-dl-040.md) L25868-L25932 `2f699a335e3a9ad3f1c6be37755943bccc72c452067fcd68449870716a448f22`
- [070 - DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)](070-dl-042-historical-todo-event-migration-consumer-boundary-2026-09.md) L25935-L25990 `e372271830110715d14d070e9219cfa6f07e4e4665ea7d96a8d815c13e263b5f`
- [071 - Restore-point created native and historical consumers](071-restore-point-created-native-and-historical-consumers.md) L25993-L26168 `4ce20b9f9c1495d7a9cfde268ca202dc32048132f33b676a3682242290a2dda8`
- [072 - Deleted restore-point passive history admission](072-deleted-restore-point-passive-history-admission.md) L26171-L26237 `09774eee2d3348d39967671dd452fca00c2b8de27c8dcb56475e908ec7ac76c1`
- [073 - Expired restore-point passive history admission](073-expired-restore-point-passive-history-admission.md) L26240-L26309 `956e1aaf9588aa52f1909c9931f01050059f7feb207dec9822325e8c8a09dc13`
- [074 - External Research Decision Packet Consumer Addendum (2026-09-17)](074-external-research-decision-packet-consumer-addendum-2026-09-17.md) L26311-L26361 `e3948b7a8a618f9e10261cf6e6797243e6ee35af7c5da30b9914e7e0a1299184`
- [075 - Chat WOW Turn Presentation Addendum (2026-09-27)](075-chat-wow-turn-presentation-addendum-2026-09-27.md) L26363-L27010 `7278109e7fce5e87fa0f6482e4e52ac70a17a03992621c3709eb5e67d6d9bdcc`
- [076 - Wand Modules Redesign Addendum (2026-09-27)](076-wand-modules-redesign-addendum-2026-09-27.md) L27012-L27735 `b82c2e1f2a20d69bb687f1940dad5f47702c32d030d2cef0b10fdef503a3048e`
- [077 - Chat Tweaks Addendum (2026-10-08)](077-chat-tweaks-addendum-2026-10-08.md) L27737-L27813 `e83ea5e544da051a1dedf4ebaa12aebd4e13153a883da29b02301563876669a1`
- [078 - DL-180, DL-181 and DL-185 — What The Chat Opens, Its Column, Its Command Card And The Port (2026-10-09)](078-dl-180-dl-181-and-dl-185-what-the-chat-opens-its-column-its-comm.md) L27815-L28304 `7c0cb349ed0b747552b567ed3227fec0e54182097f1e49d8675667e989277b09`
- [079 - Grill Me rounds and agreement — DL-218](079-grill-me-rounds-and-agreement-dl-218.md) L28306-L29080 `6fab5abe59512a81aea21595e6c3530d5a96fec1d159f4e72b679e003537cf1d`
