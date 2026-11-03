# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-11-03T22:13:31Z

Source SHA256: `f4e5a424ee6841b4988ce457166d26b762be0b3f0c4aa0c5d0d03132ef6be00f`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `c4a2b906d4eafafc66ffc2c8605223f44aff193461193396978daac47382e7fb`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `a1a49a95457d2a0e56c1322db2e035b0bf45a89d9f0cf9fda81250bac0b81515`
- [003 - Change Summary](003-change-summary.md) L14-L30 `a430e53c1a1c75ceef0ed3bdf72df08697bd553f46f684ab38e0cb36d809232d`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L32-L47 `371d2eebcfb0a03a9d111381bd74f595ab86d4b3e2a9e2efacfe72fbcafd7fab`
- [005 - Executive Summary](005-executive-summary.md) L48-L52 `f43d8af987c9d0f50e5752e1bade9bbdce4b18853ee3a46b7b43022edda327cb`
- [006 - Table of Contents](006-table-of-contents.md) L54-L90 `ba7074c77a5ce8098d7cef7c80b1479148ab969d4cd7af1046da6527b9dbc7a6`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L92-L207 `6340fca99e36f6048d01fb1904c6e361dcdb2733ade73b87a9ec6747f6cc7aea`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L209-L232 `3f532d569eec46ba6b3eec9fd7c5c241efeffad74be6222a50004416af72fb6f`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L234-L240 `cb9637dcd67007bed8520c57470a949bd3cfb4d292b8d13551cb8df01a9098de`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L242-L291 `330c9a66458d8b2fb186aca4a0f5422173a8da4e5d136b4cdfb9e881f659da7a`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L292-L440 `a00bee8f6454c2131b74dbacca04fefb9a0d5a0718779f4ec2104a44da416d2f`
- [012 - 6. Teach](012-6.-teach.md) L441-L483 `59d9f9fa738a47becd57d9b741c4920fd54dbc5416eec0dcf7489845907b3565`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L485-L671 `4b5466b3f265a5b76ef71ecff1dd468cc0c2ba9d64be050504bc08bdbc90994f`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L672-L964 `c4667ace5ab5ccf4c590ec5dabb3b55e4a94e9d0af866cba1254d79bbf3f5e43`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L966-L1008 `789a453415f5a152b511cc405b8f5050c58fe7987e1715a4fb1d694d988e231d`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L1010-L1081 `0cb7f40bf63fa87755aee207315cbac23079d9a7edc1aa4ac68894ccc84cd207`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1082-L1259 `f25bf528468821f2b0df77fa7e7bef9e2fdb1576ba286d57c706efed5192c9a5`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1260-L1370 `c373d1dbf4ebf0cf527707136d4f8164dfbce8c010e62f0bc81e4783d5ecd812`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1371-L1788 `7a7d49947dcabcde6d64143e7f53518d8333ee3f028c760e6266e09948f5070d`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1789-L1906 `f0c5f122b48bbcec66a14d5a9c6c2a30ce0a4d4842e55b54fc20c14e91fa31cf`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1907-L1940 `e154d1baaf015bef97e4b0a927a4f13d3fd70644b46e56ba82ea96dbbb34f1b2`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1941-L1980 `e5edae22013bf664e431177604a9d466a7bb3322090c46f2b7e044ba5bd4aa13`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1982-L2095 `122b7972d628630ed36c2f631f517556371609a2864c2dfda9ad597f9dc46002`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L2096-L2107 `9631c4d7f37d5e718b9e88d5e9620051cffd9fe584727632c0d9c25fe9768173`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L2109-L2118 `905bce001011831ee771805c592af0421e481817d51e4f9c86152a710b11c372`
- [026 - 20. References](026-20.-references.md) L2120-L2149 `09193cb3fa2ae186f4249bfd974bbaeb741a8420b5ac29a172f993d0a256331e`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2150-L2168 `6dbadcf37bada9fc7779c82390d5a1cef8e064bcf05f6c8406387a728401256c`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2170-L2204 `25880acf9cda440f1415d7cc9414ab7440e7c6090bd286d0a2a3036a41ff8d9b`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2205-L2300 `092ecf16ba63182e1f15691da7435a3592acf1423cf7e222c5e17729ebb1eef5`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2302-L2355 `3ff5251fd3cc36f04c2403f80fff227f74747895f7b27db822acc9504fea36e9`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2356-L2362 `f731e162a819fb6cb6f383079dd2a8f4d9841e094e5c099e7f95542dd075d68e`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep)](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2363-L2465 `c6c712618cf36344e2340c47e3614bd6f236712104fdd6c57c774145171e3400`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2466-L2602 `f9f1548c1c4ad361d3c555f3f72618a6c0cbbc99e6e30cb026ae37fba43c424f`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2604-L2649 `642c0bb31bfe7501fcf35b275f3243943c3634dfa225196b02993adbcc5f51df`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2650-L2759 `83aca9a2fd48007881c63fa6c2720a83d614a54374ac6fe2f3f9eb1e43947fc6`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2761-L2776 `6f73bf4ff52a312e5522fe3a1c20d25d88118603a0ef7e108c330ef14b6a4907`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2777-L2789 `a7112b7b258c666e972ee7cbbf0e2b7c9a5d72f2490abb85a75ce5a64755b127`
- [038 - Ledger Compile Addendum - pldg-20260630-001-feature-intake](038-ledger-compile-addendum-pldg-20260630-001-feature-intake.md) L2791-L2859 `0453cce35c2f27d4629fd64f6af3bdd093589d68245eb15ddcce0b873333b655`
- [039 - Ledger Compile Addendum - pldg-20260624-001-provider-updates](039-ledger-compile-addendum-pldg-20260624-001-provider-updates.md) L2861-L3503 `d5ffb313be89f10718396f62f0462064b50694934b604f6b60022aa466b6ac21`
- [040 - Shared actor-boundary, route payload, and blocked_notice packet](040-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3504-L3524 `dfad97d7ab2c1c0e82006901f160652566ef13c29fb4b4c5a88955fdd2f7bd35`
- [041 - Shared Conversational Actor Runtime Identity](041-shared-conversational-actor-runtime-identity.md) L3526-L3540 `65bb3839d33737f667c5fc3e648330727b9a486a2e2d98b47182f79983d1ffc9`
- [042 - Chat Route, Permission, and History Behaviors](042-chat-route-permission-and-history-behaviors.md) L3542-L3556 `9f06fb39c29889ae73eae0eaed6d1bb1106f6efb059386efc86e7fe1ae4654df`
- [043 - Owner / Consumer Map](043-owner-consumer-map.md) L3558-L3562 `cc1106e25dd80f00166feb43747927069acc1f0dee37bf1fca74086ea6710145`
- [044 - PlanUnits](044-planunits.md) L3564-L3615 `7314f6628fe13bd08ca76c8fb6845fa24f186ac7439ea4dcaf8006b860d557d9`
- [045 - Shared runtime projection addendum (2026-08-13)](045-shared-runtime-projection-addendum-2026-08-13.md) L3617-L22619 `b3be335ddcbd5b0045434fde75b6aeaf860f2693efd175d59fe9f61355332935`
- [046 - Migration Coverage](046-migration-coverage.md) L22621-L22651 `f443c0b219c9c400122d9073007b150be9034ee5b098b0cf67c681f17be49ead`
- [047 - Ledger Compile Addendum - pldg-20260614-001](047-ledger-compile-addendum-pldg-20260614-001.md) L22653-L22741 `1dfa6a685ae475ab5672c646e40f738f714d647626cab542a86db37f131ef5cc`
- [048 - Ledger Compile Addendum - pldg-20260615-001](048-ledger-compile-addendum-pldg-20260615-001.md) L22743-L22840 `a470fcc31ccddb7478bbe7f82f7e39048137be3e2999757c7c8ddc775a5d28d0`
- [049 - Ledger Compile Addendum - pldg-20260616-001](049-ledger-compile-addendum-pldg-20260616-001.md) L22842-L23167 `8f3ba5e917159838224b2c97c2fa926bb33aa0a6f1908e333daae677b2ae8496`
- [050 - Ledger Compile Addendum - pldg-20260616-002](050-ledger-compile-addendum-pldg-20260616-002.md) L23169-L23242 `f1549d1f8c097800c3940bf5425ef4060c4d0b721c3602cfe5331c7108253890`
- [051 - Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard](051-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md) L23245-L23333 `752656dfff213534d0d8cd6adc5e5d8741906b91af369af0b1aa91a490d0e51d`
- [052 - Ledger Compile Addendum - pldg-20260622-001-fff](052-ledger-compile-addendum-pldg-20260622-001-fff.md) L23335-L23421 `200c8f9fe43ea04de8df4366e51b34678076ab6fb816a18ba11647e10267a80d`
- [053 - Ledger Compile Addendum - pldg-20260626-001-feature-name](053-ledger-compile-addendum-pldg-20260626-001-feature-name.md) L23424-L23800 `2f6b99afc85516ac707e981062c7345f1a212503ce758f1dfe5336e01791cd21`
- [054 - Ledger Compile Addendum - pldg-20260627-001-feature-intake](054-ledger-compile-addendum-pldg-20260627-001-feature-intake.md) L23802-L24013 `2e8bcaae94040b901ab9d07df557c8708117ae1c722a75520f134ecd52e20e94`
- [055 - Ledger Compile Addendum - pldg-20260701-001-feature-intake](055-ledger-compile-addendum-pldg-20260701-001-feature-intake.md) L24015-L24094 `8de402890dc57381c2355bda91fecef0185846527a45a8ad53b67db6e4879bb0`
- [056 - Ledger Compile Addendum - pldg-20260703-001-feature-intake](056-ledger-compile-addendum-pldg-20260703-001-feature-intake.md) L24096-L24161 `4661dce8481f00d5f649ffaeea43a3ece55427a20c870ecdd11bb9ad41b10573`
- [057 - FABLE Residual Chat Mechanics Cleanup Addendum - 2026-07-07](057-fable-residual-chat-mechanics-cleanup-addendum-2026-07-07.md) L24163-L24234 `819b91c1b39f47b7ec9841770841332914359a7776beacd38823e0be31975f99`
- [058 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](058-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L24236-L24280 `94474d1e07f52ffea875c4f166fed4b39874a36535e432c7726155a38ee14b13`
- [059 - Usage GUI Propagation Addendum - 2026-07-09](059-usage-gui-propagation-addendum-2026-07-09.md) L24282-L24358 `f1c14b88231759f81c629dfdf9827db8f999a17bcf05b999ee08e957b5221449`
- [060 - PMConcept6 Chat Polish Addendum - 2026-07-16](060-pmconcept6-chat-polish-addendum-2026-07-16.md) L24360-L24592 `845f375046a435d1af0c102714c1def6651038c34121d56d558ec3e45fdc6b25`
- [061 - Immutable conversation restore-point lifecycle - Known-37 completion](061-immutable-conversation-restore-point-lifecycle-known-37-completi.md) L24595-L24612 `efc9af65f450cafc20b2ec56a12679e0d1c9f3bb8aad0b834d128a1aa363b846`
- [062 - PMConcept7 Concept Promotion Addendum - 2026-07-23](062-pmconcept7-concept-promotion-addendum-2026-07-23.md) L24614-L25012 `a85d9b274cc5f95b797c33a38253c2de154ce62a4df2ec77546455206e4a9cc3`
- [063 - PMConcept7 shared Assistant seating and context surfaces addendum - 2026-08-27](063-pmconcept7-shared-assistant-seating-and-context-surfaces-addendu.md) L25014-L25116 `8427202da4e4060d1777f197b991f42f0a60bdaa406491d620a626c8cc985cad`
- [064 - Additive Correction v4 — Consumed Assistant Behaviour (2026-09-03)](064-additive-correction-v4-consumed-assistant-behaviour-2026-09-03.md) L25118-L25166 `e493fcacb32c6f0239748880dd529660c93b2026fcfe72f2d48fd4d37b27b4b0`
- [065 - Working Notebook Surface Addendum (2026-09-05)](065-working-notebook-surface-addendum-2026-09-05.md) L25168-L25301 `66ae918f939967b48a62c7c87f90cfe3c18d9463c98527d7b84dcbdb889310e2`
- [066 - Cumulative v3 Assistant Interaction & Surface Specification (2026-09-07)](066-cumulative-v3-assistant-interaction-surface-specification-2026-0.md) L25303-L25698 `28b949ab2e06b3663b93cac4e4db3dcee0a119074f2aa257d07b94496b22e6fe`
- [067 - Research decision packet review](067-research-decision-packet-review.md) L25702-L25797 `53065722848d65ab91e44332bb5d18059d9810550a2e095bd125cb12795e7e35`
- [068 - Context Lens Source and Preview Reconciliation — 2026-09-10](068-context-lens-source-and-preview-reconciliation-2026-09-10.md) L25799-L25863 `e477ac8713991e4f008ad36260239968be6153b1416089145595707d024fb3c3`
- [069 - Compaction completion Event Authority (DL-039 and DL-040)](069-compaction-completion-event-authority-dl-039-and-dl-040.md) L25865-L25928 `693fcb898f8692cc11e06dda28e0e83ad0d56543523812706f9e94f2ec8ac705`
- [070 - DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)](070-dl-042-historical-todo-event-migration-consumer-boundary-2026-09.md) L25931-L25986 `0a2cfbebb7ebabb3912d787523ee7002cf21c1fb77c71f98670b0a3bb6dc9395`
- [071 - Restore-point created native and historical consumers](071-restore-point-created-native-and-historical-consumers.md) L25989-L26164 `80e6c93ace569ac1da1395df2e5c01ddae7157cb98240a2a3c2708aee35679ef`
- [072 - Deleted restore-point passive history admission](072-deleted-restore-point-passive-history-admission.md) L26167-L26233 `7d00844258a640a08f55824f9fa5c6e0df2c4f0b45865a89f404bbf17e45d0c1`
- [073 - Expired restore-point passive history admission](073-expired-restore-point-passive-history-admission.md) L26236-L26305 `e668f68fade1035e6497630f1af0d5a83738d190436228b1823eba13161bbb6c`
- [074 - External Research Decision Packet Consumer Addendum (2026-09-17)](074-external-research-decision-packet-consumer-addendum-2026-09-17.md) L26307-L26357 `4828341d3455a45f5e97f5a0b68d7799e5911a3fc1a03d376863e3cf5da88558`
- [075 - Chat WOW Turn Presentation Addendum (2026-09-27)](075-chat-wow-turn-presentation-addendum-2026-09-27.md) L26359-L27006 `beee543db3f4a3eba7f53b5d77bd61c2f00d2e7886aaffaac7e7cdd4a89be7cf`
- [076 - Wand Modules Redesign Addendum (2026-09-27)](076-wand-modules-redesign-addendum-2026-09-27.md) L27008-L27731 `2f279c641aceb8a76cd3dfd5fb84d84a74e27824a6cf17277cbd98b9664f01d1`
- [077 - Chat Tweaks Addendum (2026-10-08)](077-chat-tweaks-addendum-2026-10-08.md) L27733-L27809 `e1bf28e7d482706708e8bc3e69499f6ec177749efac9bf140bddafa44917d518`
- [078 - DL-180, DL-181 and DL-185 — What The Chat Opens, Its Column, Its Command Card And The Port (2026-10-09)](078-dl-180-dl-181-and-dl-185-what-the-chat-opens-its-column-its-comm.md) L27811-L28300 `cdd5a7c8b241fd58100c46b3ac47bce2f1ba0e6417aab0f229fa632ba406354a`
- [079 - Grill Me rounds and agreement — DL-218](079-grill-me-rounds-and-agreement-dl-218.md) L28302-L29072 `bede41145643882369006c76ab499e9ddc250520919f784e86af028212072e31`
