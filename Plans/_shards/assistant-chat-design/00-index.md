# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-09-25T16:52:02Z

Source SHA256: `e38d81d68a249d6ee2fcf6f79aed41e29d037257cc9451d8d8f84c6e7244c48f`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `0453864eb9cbec14b862291f5818a2b3b564b00ed6d034a6cc92b1e59eacb56e`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `1b97d801a222b253558ed15c877a96ea79a5b25e6a1afa9e6f71cd444f0726bf`
- [003 - Change Summary](003-change-summary.md) L14-L30 `6661fb33515e0450cbb5e7363d473f40b6c4f9a1412afbe38e0d91e3036758d3`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L32-L47 `2ee05e4c21030625012f03438d8e778e6d89debe1e3e5262e177fc50a6ff5dfe`
- [005 - Executive Summary](005-executive-summary.md) L48-L52 `b3c43b7e68534f36c2a380141d4c314c13332e5adf9e6ec1fdb48dd71b835b9b`
- [006 - Table of Contents](006-table-of-contents.md) L54-L90 `1e7b10651a5c165b448c8847a25bf93ab6706706211f87fb537ed0d8faed9d7e`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L92-L207 `cadcd828cf41b0af0fcccd3513fb4bdb76940681959f9b69d8ff23756c5dcd03`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L209-L231 `cc511aa95bb75944b99c8f5ea7f90baa1dfe8337625b87a66114a7eb4dccbf7b`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L233-L239 `c65e8766b5d1fc6840f7d64ebc7a4ac956a800f15d6ece6419843ede611c20e7`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L241-L289 `799eae103dc2af8edff277277a805f49a276ece1ea8fc750d3575890723ac8c1`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L290-L438 `67b2d859cdb3140461a2c20138beb06d749c8fd86839fde8c31f7fe04c51bebd`
- [012 - 6. Teach](012-6.-teach.md) L439-L477 `5b6ddaf13ee6ac5285cdf0ae49f5751aa390b78d7a78d17219746f2b2d0013a9`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L479-L664 `c3ff8174b4dde18868214a9d79045fc0648a744e344a3ec612b0205b49d5749a`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L665-L957 `c4dc4e26c7ba293559f2f9e2917d17a7f312e2b98375c31d5b02e6a01cfae18d`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L959-L1000 `a73c238a647c1c57a8c9ae19e6523012f32a953cc9ae22c803063ff4778b7a4b`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L1002-L1072 `e02faefe228ac9cc32c0ba44b35977863ee50e673363fb365bf4a7346744a529`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1073-L1250 `2bfbb6f9749924545a0af344a8f36364474992097fb19d4c20c96c60f35a593d`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1251-L1359 `7c15034f9f0e863d56b5b7baf504fa5d0b625acbb617629e5f9485d312fecfac`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1360-L1775 `212f6668d726a556bac0421726207d2bfbdc5f3c6cad2cb22886f9984eea618c`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1776-L1893 `bb221fd5911f4740cfa5f536af5bf0927bf2b2f3de3e68302f757d24120220ef`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1894-L1927 `2311a003a9c33b1694967fa42380474ff348ef24d55e80b9aa7c9799f659cb5c`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1928-L1967 `cacc143249cce3de39e7dbd428b12f07392dfdf7c93e90c3591caa2b9cd7c70b`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1969-L2082 `ad6b204508d24b92f9d6f862b91f647074d0d83fc53cd3960885f23f0983dc48`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L2083-L2094 `8365d3ed73a600f295a706980dd5551c508f45977d1cdbdcbafdfe1e5252f280`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L2096-L2105 `421a21f155d0a8bf9ec8ca51429f7c4a0ea40e0316b1ef91ac96dbb6b6cc8eac`
- [026 - 20. References](026-20.-references.md) L2107-L2136 `0f3f173c36e983799a16bf76cbb64701d502106804c7ca2d6465745ea37826aa`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2137-L2155 `8d84599478d61e70a9591ac3e8d7f305c67ec9220b553d2aaf3a2c79985f4bd7`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2157-L2188 `d77735f659629cc9091ba0a08d077a4529ad6934ef84ab2b58d30649499a2d6a`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2189-L2284 `62114c17e1efce76e80415da403829cc4890812c8535b380aa3212c5f7f40317`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2286-L2339 `37992c19f1d3f00b16892c1b7f5c8d98c2c2abf0746dc347708da141ba4a3c67`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2340-L2346 `1fe5f25b4ef0d0b19bc1013e2851fa8e142c50b1d53d39ee53da14abfd525a4b`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep)](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2347-L2449 `eba36fb7f3ccf98d3fdd3bdcbd9773108862abd8bd87ff228c349b55e199eaa2`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2450-L2586 `bbad0d3c5741949e1b74aef5ea153d309f1428c7949f2e4aff17db7b333d443a`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2588-L2631 `2d15adf5e62c6fa98b63af5d801c9f0fc17d851e1f878d41641fe1b389c62df5`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2632-L2741 `7738d93278d9aecbd73abca66c09595305c40d8669d725ab68adc04db32820c6`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2743-L2758 `2cc0b2fce17641164e96b96d756216e328669f9be1ca9eff323710b737f4cfa1`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2759-L2771 `785b1984ae7d665f317a66449c16130fc6c8b46115f476e0697b75b2d43d60c7`
- [038 - Ledger Compile Addendum - pldg-20260630-001-feature-intake](038-ledger-compile-addendum-pldg-20260630-001-feature-intake.md) L2773-L2841 `43efbe8f680ded20d751036544626d960f510537983a68cce1cc6d6ac039c3b6`
- [039 - Ledger Compile Addendum - pldg-20260624-001-provider-updates](039-ledger-compile-addendum-pldg-20260624-001-provider-updates.md) L2843-L3485 `95154e337d423086a01d846c45ed090b73d24d46bb17304b281220d4b937fc99`
- [040 - Shared actor-boundary, route payload, and blocked_notice packet](040-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3486-L3506 `30b6556cb466f59c4a26e0aa5286d703ff34f21686c455a25cda37453287216d`
- [041 - Shared Conversational Actor Runtime Identity](041-shared-conversational-actor-runtime-identity.md) L3508-L3522 `183c0882276b0311dfd4f5b4b3ddc43ce075c09261dff1b9583dbc6daf532e32`
- [042 - Chat Route, Permission, and History Behaviors](042-chat-route-permission-and-history-behaviors.md) L3524-L3538 `d90c24db4644a84f21db9f7f0e9721f5fd45edac03eb01f66544986d75efc82c`
- [043 - Owner / Consumer Map](043-owner-consumer-map.md) L3540-L3544 `0b10ee5a306559a0fb80412d55c17c0cb4ae2e90c6e17aff9ab5f04751af1a3d`
- [044 - PlanUnits](044-planunits.md) L3546-L3597 `34e28dd0591c0c11c3ee234fab88ddb09bbd083bec92f65eaeb20e795afe2d24`
- [045 - Shared runtime projection addendum (2026-08-13)](045-shared-runtime-projection-addendum-2026-08-13.md) L3599-L22234 `a01b3515df08f9c9fa6278c56b8ddbed1d1c2940f598f64b7fd94c256b9f4b58`
- [046 - Migration Coverage](046-migration-coverage.md) L22236-L22266 `4883cc35e0b2dbeddb33efd5d7fd46526444c6f79d1ec5d0c323cfe3f873aaa1`
- [047 - Ledger Compile Addendum - pldg-20260614-001](047-ledger-compile-addendum-pldg-20260614-001.md) L22268-L22356 `72b02cdfec66b08151202dd5ea1abbc8e7739b13debeba07df8c44e79777689f`
- [048 - Ledger Compile Addendum - pldg-20260615-001](048-ledger-compile-addendum-pldg-20260615-001.md) L22358-L22455 `a4c118511b395719ff2ff73fd65d554d3b0122d3ca9d481af5c5649cfcf86b8c`
- [049 - Ledger Compile Addendum - pldg-20260616-001](049-ledger-compile-addendum-pldg-20260616-001.md) L22457-L22769 `ec7b94dd5a81293619973432836413691cd662c35c4de21c9cbd2b8a0c2a775d`
- [050 - Ledger Compile Addendum - pldg-20260616-002](050-ledger-compile-addendum-pldg-20260616-002.md) L22771-L22838 `18e4e562f9257017d68e333c30731e7a8e84518d86562f5f61aef0ae496414f9`
- [051 - Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard](051-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md) L22841-L22929 `3db14c77a00985241a6ae7cfd54c704338ec9a8d97a5b0538bf853f45f7de4f8`
- [052 - Ledger Compile Addendum - pldg-20260622-001-fff](052-ledger-compile-addendum-pldg-20260622-001-fff.md) L22931-L23017 `8eb7a955f6bede2793d582773b79a00a862f3189deb2538116e783fdbe84cc69`
- [053 - Ledger Compile Addendum - pldg-20260626-001-feature-name](053-ledger-compile-addendum-pldg-20260626-001-feature-name.md) L23020-L23394 `660fc8e105c5973c39ce069173b010ef5540db6cf3ee612b557ee22fd7181ab6`
- [054 - Ledger Compile Addendum - pldg-20260627-001-feature-intake](054-ledger-compile-addendum-pldg-20260627-001-feature-intake.md) L23396-L23607 `d87cb57a7cab2853ef2b979c498d1bf80e20ac202f44770c6d3a9ec5123e3d19`
- [055 - Ledger Compile Addendum - pldg-20260701-001-feature-intake](055-ledger-compile-addendum-pldg-20260701-001-feature-intake.md) L23609-L23688 `75da1ee81fc0c5f6d00dfb1dc322dafb8924fb14a7038102a6788d427426600a`
- [056 - Ledger Compile Addendum - pldg-20260703-001-feature-intake](056-ledger-compile-addendum-pldg-20260703-001-feature-intake.md) L23690-L23755 `9691a68560e7cb4f827553e75cd720ef699a6156aacde7521331398f0b5f0f9c`
- [057 - FABLE Residual Chat Mechanics Cleanup Addendum - 2026-07-07](057-fable-residual-chat-mechanics-cleanup-addendum-2026-07-07.md) L23757-L23828 `98db670bf6a952a98dd9d3cade86c99ac68fdd2cf249bf1bfa866cb160bfea44`
- [058 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](058-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L23830-L23874 `72f762fab39926cc659dbd946f78621e7eb2aad8c749ec3c7534e7da4c0960ab`
- [059 - Usage GUI Propagation Addendum - 2026-07-09](059-usage-gui-propagation-addendum-2026-07-09.md) L23876-L23952 `7ebfdb4c249e6af04cef64cfc5802327ac95e935af6b0138e370e99cf49a5b50`
- [060 - PMConcept6 Chat Polish Addendum - 2026-07-16](060-pmconcept6-chat-polish-addendum-2026-07-16.md) L23954-L24173 `38e54e4211b4ef67dd2447c8e3ce5b2117bc95346c6d49143bec68d48b043e00`
- [061 - Immutable conversation restore-point lifecycle - Known-37 completion](061-immutable-conversation-restore-point-lifecycle-known-37-completi.md) L24176-L24193 `3cc7404eb6d355ff86d5d31f35c82062ea9a9307b1899f09e60e3437a56b16b4`
- [062 - PMConcept7 Concept Promotion Addendum - 2026-07-23](062-pmconcept7-concept-promotion-addendum-2026-07-23.md) L24195-L24561 `bb20c209ac4c2f4a1a665e53f222ee4ac33c027021c41f7646a124d5a065a60a`
- [063 - PMConcept7 shared Assistant seating and context surfaces addendum - 2026-08-27](063-pmconcept7-shared-assistant-seating-and-context-surfaces-addendu.md) L24563-L24653 `f39b84976999650dee8a2d37641878c7cbd9eebea6c5e00c85d755b7568a4264`
- [064 - Additive Correction v4 — Consumed Assistant Behaviour (2026-09-03)](064-additive-correction-v4-consumed-assistant-behaviour-2026-09-03.md) L24655-L24692 `377b2e4ee0fbaf551316856b724e032516fbb49aba0dbd662cc5a9d84a940a30`
- [065 - Working Notebook Surface Addendum (2026-09-05)](065-working-notebook-surface-addendum-2026-09-05.md) L24694-L24802 `49a383ab4bd29988719fbbcd5a516738a1430429ac08029d675ea80b3a3e99cd`
- [066 - Cumulative v3 Assistant Interaction & Surface Specification (2026-09-07)](066-cumulative-v3-assistant-interaction-surface-specification-2026-0.md) L24804-L25152 `44be9a261ee3fd69fe7ed7b8b4f6661ef9584f78016ae92470a3e81fb7314074`
- [067 - Research decision packet review](067-research-decision-packet-review.md) L25156-L25251 `7bf1cfeecb0b4e403339cc04bc92eee03970d65fdd73b64d0301cbb1d041a706`
- [068 - Context Lens Source and Preview Reconciliation — 2026-09-10](068-context-lens-source-and-preview-reconciliation-2026-09-10.md) L25253-L25338 `dfbb6846e2f734191024d903b084e8c517281d758b3f5cb482461dc8f0f6e8a4`
- [069 - Compaction completion Event Authority (DL-039 and DL-040)](069-compaction-completion-event-authority-dl-039-and-dl-040.md) L25340-L25393 `cd6109efa8fc4daee8537ee762f824c62d5d7890abe2d0e0193a28627ccbe0ac`
- [070 - DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)](070-dl-042-historical-todo-event-migration-consumer-boundary-2026-09.md) L25396-L25437 `b6d707bbbfa73278e9430b1259c145e2bab56b0a95b375e051909126cd333be5`
- [071 - Restore-point created native and historical consumers](071-restore-point-created-native-and-historical-consumers.md) L25440-L25614 `4e75ee6179ce3df7806994c232e22bb46ce3cc96c5a9548ed397ceb088898f1b`
- [072 - Deleted restore-point passive history admission](072-deleted-restore-point-passive-history-admission.md) L25617-L25683 `7bfb20342bf7da245db462333dcf1a74e0b9b412faeefdd3cc1f3ec9df4d2ab0`
- [073 - Expired restore-point passive history admission](073-expired-restore-point-passive-history-admission.md) L25686-L25755 `e6e8e859561fe55a42969b8f82a84c22bacdb67f5c6e8f5ce32a4963f7f44663`
- [074 - External Research Decision Packet Consumer Addendum (2026-09-17)](074-external-research-decision-packet-consumer-addendum-2026-09-17.md) L25757-L25807 `385a202580fde614e353c88e10bbd6a3355bd932976841d53d029485dfa79df2`
- [075 - Passive Spelling And Dictionary Routing](075-passive-spelling-and-dictionary-routing.md) L25809-L25887 `7093ce5c41c3a1f3df44cce0d44a2b2db2c40d7ebf87d4b233f41fca17eb0c61`
