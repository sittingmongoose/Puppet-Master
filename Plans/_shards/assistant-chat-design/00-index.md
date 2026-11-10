# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-11-09T05:22:05Z

Source SHA256: `5be00385fb332d27e9b2e7b29ae5101b4031acc3777b8ed3e23faceb8dcf4b75`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `d92f4c31caa021cc2f9e1d2aa55298de448e7c50f3ad0093b5a9af7500f31f6d`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `2771e73b75c1292b6430ec248755033b7b5e30fbbe8698ef97e39955cd800eda`
- [003 - Change Summary](003-change-summary.md) L14-L30 `a88714715de44b9aaead280d9a8e86035de27ff7f4713f5ab9321865fd7dea68`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L32-L47 `aeeff6a4b8a3d6664a9027981c9867c0a573eb5e573aba7dcf41f213e895430d`
- [005 - Executive Summary](005-executive-summary.md) L48-L52 `ea0ec53bc17f6d48d4f7f609e8947d60b7fb73c0e78cb1ea5ea9b4aef69161df`
- [006 - Table of Contents](006-table-of-contents.md) L54-L90 `0ed5aaf2b0d20f17ae55a6d72c3076405d2e8166587dadd695d45d05fa0d8e28`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L92-L207 `5eac87c496728800f3e071583d74deb343bbe2c1292f40d55369e3376e6fe648`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L209-L232 `891c02e94c26829c405933693b3f05bcf6c6ce2f25f7d2a3ad251095a51afb43`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L234-L240 `7364e53e79653f830de1221717bc060cb2b98a23c31eff172d8261ad3de35502`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L242-L291 `96097ea12ca202c37ab286b9a957cbc47804ed9752601f1200042065261bd413`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L292-L440 `201efb119527ab83bceba70b34c4698e3a93e113dbdcf6fd9fc12129b9a4ed01`
- [012 - 6. Teach](012-6.-teach.md) L441-L483 `0f4c33cb4f64d14d856e78160528926727c1b1849c68560ae11cbbd7ed65316c`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L485-L671 `6444a5d9f36a847cbe369344cd24e26869bdc2a26680f7167ff5f2b232027b31`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L672-L964 `601f97c9412beb4b2a7279be62501bf96ee40a7890eabd3a23a3cf63be1dad0a`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L966-L1008 `1445ebe9f56ad35204bf63bdce06f4fdca710b552e5a8096c8c6b012d183e090`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L1010-L1081 `5a1c88e23ebf637fb3101c4af280ffc4e2498c7b93cf6e0ed27cce4afa5faf94`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1082-L1259 `290f520c7f0794a1bf82e76ac5378d38a4b9b8c398a275fdd865217824091b06`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1260-L1370 `8241ac7d7411bc2b7b8ca20c96a7ac98a549c2f7960b1c0fb89f8b260bcfef51`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1371-L1788 `0ad44eb8454ea7836f0fcb9f7f8d61407826b3bb88b68280d973a776030459e6`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1789-L1906 `181272acaa27a22e42249dc8192b0c1b5d1b3d4f363b9a61b9984753a8b7c9ae`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1907-L1940 `f59041ac12eea6ce77ae98df9a7ea1a1018442a24c940481b8a18c6babbd9d24`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1941-L1980 `52c2ac3340ac72f5c938df1208178a4c74e6327b1bb0d78f1be1f18079312eab`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1982-L2095 `7e2f6cb3c2056b8f929269d07b87e97956456425d9c20f8ddce7853843dcba53`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L2096-L2107 `b1b91c17a4ae83eca10fc04eb2a87edb7052f581c596bd8a22d31ff176534ea5`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L2109-L2118 `444bfd77334b81ff89ea10734108cbef0894dea4b4987f14ab2292ba8ab06958`
- [026 - 20. References](026-20.-references.md) L2120-L2149 `77c49abb40747a94776ced7b1ba41f95e789b96309da50224589dab1f01c9818`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2150-L2168 `35c83e90a66fe9435941c284cfcd35692df525ee1d36da5955cd829f7bf84150`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2170-L2204 `d26c51120b02910983137bac7149e8e6d1278afda13f3d80471c895b7b878159`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2205-L2300 `a5d076f9626fd454bcec4678f11318984067dd70d7dcab7e7cdb4264faacfdba`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2302-L2355 `3392d60ce90bac1c76e93b90574f8306641adcfc7ef342f290ba7510da5ffc3f`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2356-L2362 `750c3760c2976c91d67f6460a8e41a1c9f5adb66e08eef8770ef14abe0cc9b9d`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep) And Loop Specification](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2363-L2654 `32178a98e213927acb89d3858635ea6d6d9dca72134bb833eb95f51fdd0981f9`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2656-L2792 `ff06dd66a1bcbccf2abd316a5a0d9fc7b399b97f1ef11647a9947f1a1c551995`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2794-L2839 `22c50dcb255a231b8de96fa5a6db953ebb860b1c2c8c04fa94a691c567722754`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2840-L2949 `07802c4e4647b525bc397652688c6e9087145105548366d85a6caf58a9d75b66`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2951-L2966 `accbe65735c24585ae16f0f66c7f505cd1a664f5c3d025950dd8705954af6dd3`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2967-L2979 `60925831ece8352a2e728afb377c7a4d21fd9a852e9996c3584d03899b760a6e`
- [038 - Ledger Compile Addendum - pldg-20260630-001-feature-intake](038-ledger-compile-addendum-pldg-20260630-001-feature-intake.md) L2981-L3049 `a8aa3a876fd52387d6149bdc1fb748d6fd505311eaf97c0bd8864d0875ee999e`
- [039 - Ledger Compile Addendum - pldg-20260624-001-provider-updates](039-ledger-compile-addendum-pldg-20260624-001-provider-updates.md) L3051-L3693 `458050d209af26112b15b49feecce2177b5671be7799abee415e2adc32892578`
- [040 - Shared actor-boundary, route payload, and blocked_notice packet](040-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3694-L3714 `dce2751c5c5216856ef70f50599e40377ebf41e1fe7627635d9aa96d5b385be4`
- [041 - Shared Conversational Actor Runtime Identity](041-shared-conversational-actor-runtime-identity.md) L3716-L3730 `06fbba55b4fa815a3f6d825354bb1b6a64ba9171084a8378267dad93d2bf7588`
- [042 - Chat Route, Permission, and History Behaviors](042-chat-route-permission-and-history-behaviors.md) L3732-L3746 `f50d1b337448e99b620142a3da58dff2cde5994de2e5747904fde5c30d62528a`
- [043 - Owner / Consumer Map](043-owner-consumer-map.md) L3748-L3752 `8c283af3199ae1365360f9ee90590a4cbf6fb9b2f13094fbdf6d34293afa8d0b`
- [044 - PlanUnits](044-planunits.md) L3754-L3805 `fb585427a1ab64c95016dea5cc1a1f09ec78c4eac5b640cad49f429185ce6087`
- [045 - Shared runtime projection addendum (2026-08-13)](045-shared-runtime-projection-addendum-2026-08-13.md) L3807-L22961 `e94702b9fc2409c33cfa3d9709958e6aba7a842e5684fe1ec274870a639d9142`
- [046 - Migration Coverage](046-migration-coverage.md) L22963-L22993 `a9743951f466b20b7e75c129d6bbe8f691c4deee8577d7f40975177bc49b0aaa`
- [047 - Ledger Compile Addendum - pldg-20260614-001](047-ledger-compile-addendum-pldg-20260614-001.md) L22995-L23083 `9101495dd43c7f378d0b31b50c61b611ba6727f39c57e1ebdc5f08f96864dfe5`
- [048 - Ledger Compile Addendum - pldg-20260615-001](048-ledger-compile-addendum-pldg-20260615-001.md) L23085-L23182 `e7ff5551802bc0c8544e286eb449948ed762013f69d6fd78621854656157c8d7`
- [049 - Ledger Compile Addendum - pldg-20260616-001](049-ledger-compile-addendum-pldg-20260616-001.md) L23184-L23509 `2f98ff31c7e2a5dad7b783fb4d8a9f4c4bb48ee6fcae467bceb2bef2e64a3334`
- [050 - Ledger Compile Addendum - pldg-20260616-002](050-ledger-compile-addendum-pldg-20260616-002.md) L23511-L23584 `1ec00311a0ba8007a4e402fc22e230ac75130b80bd33951214fc2bdafaec8f30`
- [051 - Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard](051-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md) L23587-L23675 `d99ae8ff5468f55b35a5b20f1c00c754bcdaaafd2238609ebac4e6ecb50a7e6b`
- [052 - Ledger Compile Addendum - pldg-20260622-001-fff](052-ledger-compile-addendum-pldg-20260622-001-fff.md) L23677-L23763 `0cc28b962b57498a1541bbfc3e22713411a6407fa4f4fe54693a391752ae8788`
- [053 - Ledger Compile Addendum - pldg-20260626-001-feature-name](053-ledger-compile-addendum-pldg-20260626-001-feature-name.md) L23766-L24144 `9b5a4810bf16d22648f9a79432b681df677273aa360598c13565413b5aed7610`
- [054 - Ledger Compile Addendum - pldg-20260627-001-feature-intake](054-ledger-compile-addendum-pldg-20260627-001-feature-intake.md) L24146-L24357 `83927be70eca6dc79802df193fd62d9b7a702ffd87fb76fd6889a369f9f83358`
- [055 - Ledger Compile Addendum - pldg-20260701-001-feature-intake](055-ledger-compile-addendum-pldg-20260701-001-feature-intake.md) L24359-L24440 `14d63832b3cab50f067fda7843422768e5dbca190b1d07bcede006c202e47c6f`
- [056 - Ledger Compile Addendum - pldg-20260703-001-feature-intake](056-ledger-compile-addendum-pldg-20260703-001-feature-intake.md) L24442-L24507 `d172410453894898e62463a74de7325cda05b0f9480c9d41a3ae1a39ce0f2d12`
- [057 - FABLE Residual Chat Mechanics Cleanup Addendum - 2026-07-07](057-fable-residual-chat-mechanics-cleanup-addendum-2026-07-07.md) L24509-L24580 `3ab6dafcbaf9405645fc256298179881adbc152ec1e68a902032c99213ec41b6`
- [058 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](058-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L24582-L24626 `702ae079a7806ac4ad43add1815668a656c2afd9cd6e69eadc80eddd6b2ef95b`
- [059 - Usage GUI Propagation Addendum - 2026-07-09](059-usage-gui-propagation-addendum-2026-07-09.md) L24628-L24704 `033196c1f15a80225b5a55f2d19a681e001d97b64a47ae403a50f465409a42c7`
- [060 - PMConcept6 Chat Polish Addendum - 2026-07-16](060-pmconcept6-chat-polish-addendum-2026-07-16.md) L24706-L24938 `edf2557a83032e4a9fbc4b9441ef5d3e20bae0bcebdf802892cd0646639e537e`
- [061 - Immutable conversation restore-point lifecycle - Known-37 completion](061-immutable-conversation-restore-point-lifecycle-known-37-completi.md) L24941-L24958 `76d986a7c40ab1d75f0f4d2fbea0055f055259aebb5852ddf35e2fbe6ef1dae9`
- [062 - PMConcept7 Concept Promotion Addendum - 2026-07-23](062-pmconcept7-concept-promotion-addendum-2026-07-23.md) L24960-L25337 `4a3b93812c6c0e1bbee6a63b86b4355ece75fee9b8d96d35d219a981729f4f8f`
- [063 - PMConcept7 shared Assistant seating and context surfaces addendum - 2026-08-27](063-pmconcept7-shared-assistant-seating-and-context-surfaces-addendu.md) L25339-L25440 `6da0a27cffcd5cfa2d8c48236c9497bc85f8d3d5a5007df18bc2fe9b61566cee`
- [064 - Additive Correction v4 — Consumed Assistant Behaviour (2026-09-03)](064-additive-correction-v4-consumed-assistant-behaviour-2026-09-03.md) L25442-L25490 `4f9577e7066eeb46767e4a617fa9a8bd557519b0bf8f19890847cf6b2b7f0afc`
- [065 - Working Notebook Surface Addendum (2026-09-05)](065-working-notebook-surface-addendum-2026-09-05.md) L25492-L25625 `8cf694a104256accaacd4c2f91b672eeb2303ebe86a0d6976ba8fc6ff662f092`
- [066 - Cumulative v3 Assistant Interaction & Surface Specification (2026-09-07)](066-cumulative-v3-assistant-interaction-surface-specification-2026-0.md) L25627-L26020 `eb0c3f87333770e1c35f239c127a5c671bb5224611791492214f6f3ba35f4444`
- [067 - Research decision packet review](067-research-decision-packet-review.md) L26024-L26119 `891c3dba8189c81eb39c0ba5408be46eadb61e6b0653501ae5d27a38cfe839e6`
- [068 - Context Lens Source and Preview Reconciliation — 2026-09-10](068-context-lens-source-and-preview-reconciliation-2026-09-10.md) L26121-L26185 `fe7e4c543d6c60c1fa25832d1708c7fbe739fba7a447872d565365683f57c153`
- [069 - Compaction completion Event Authority (DL-039 and DL-040)](069-compaction-completion-event-authority-dl-039-and-dl-040.md) L26187-L26251 `37ff3670aaa18200891b60abe07d10562ea1c6ba4d41c49b5a9f99604c67b8bb`
- [070 - DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)](070-dl-042-historical-todo-event-migration-consumer-boundary-2026-09.md) L26254-L26309 `751ced2d86869e13299078a3948aaece5e84f0a5f0edcc50b54ed6c802a92239`
- [071 - Restore-point created native and historical consumers](071-restore-point-created-native-and-historical-consumers.md) L26312-L26487 `d8ef49dafc541d4e230db29fc2dba2689dc859d197d8a2d2e961ce46b943d346`
- [072 - Deleted restore-point passive history admission](072-deleted-restore-point-passive-history-admission.md) L26490-L26556 `2f6afba689805e3bafa7d8831e68fb1ffdcbf117cc90041db86f8261501c63ca`
- [073 - Expired restore-point passive history admission](073-expired-restore-point-passive-history-admission.md) L26559-L26628 `c9944efdd13c9918f521261c9190b83e1e2904f644d8c1b3086b9d550baeb6df`
- [074 - External Research Decision Packet Consumer Addendum (2026-09-17)](074-external-research-decision-packet-consumer-addendum-2026-09-17.md) L26630-L26680 `7d3c11a7662216afcbaa8af6c172b707d22a4ae825b22ea9bae7b7d35157c1c2`
- [075 - Chat WOW Turn Presentation Addendum (2026-09-27)](075-chat-wow-turn-presentation-addendum-2026-09-27.md) L26682-L27327 `08945aa43b2170bd83c2291d12244c75c9ad9ecbcbcf54e2746086cf17bb54ca`
- [076 - Wand Modules Redesign Addendum (2026-09-27)](076-wand-modules-redesign-addendum-2026-09-27.md) L27329-L28054 `4c2c60a8c8aa2cc4955d763e9fe411627aeb4cb8367581dcab947204423890ec`
- [077 - Chat Tweaks Addendum (2026-10-08)](077-chat-tweaks-addendum-2026-10-08.md) L28056-L28132 `7cf69111958a7be7401caf46cec8ef4c918f7f409b812ba8117bb1daf345293b`
- [078 - DL-180, DL-181 and DL-185 — What The Chat Opens, Its Column, Its Command Card And The Port (2026-10-09)](078-dl-180-dl-181-and-dl-185-what-the-chat-opens-its-column-its-comm.md) L28134-L28623 `7f73d2cfad8cf2211b1ca3949bce4481d6e858588e8d264f1a6e35a17bd4ba84`
- [079 - Grill Me rounds and agreement — DL-218](079-grill-me-rounds-and-agreement-dl-218.md) L28625-L29397 `11086f99ff625cc6e352219636a6a810d439b738f2d43cb6ce9e8cc9851994a7`
- [080 - Command payload definitions (DL-333, 2026-11-05)](080-command-payload-definitions-dl-333-2026-11-05.md) L29399-L31683 `c56d9c6e8c3ce7569b28592b6af7c84bb080838059d39db161acc88981a08fef`
