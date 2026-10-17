# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-10-17T16:46:14Z

Source SHA256: `abf696e5c1cf3140745486c0b2855b9f892979eb203c6ee33c7a890c49597830`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `14b2e00efefd488b19d3d00d23b75ef85ae3a13270b4d690ed0ea2a9eb433f7c`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `87f3093f18f0abe3cb2917b3995e0af94568b8ac30800ec7bb07ed6ec9d9bd63`
- [003 - Change Summary](003-change-summary.md) L14-L30 `5c90c767d13f93aa2a4950fd823a0a4b3481ab73957b7fa2d033cfe524a08ad5`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L32-L47 `8a7460d6a37a325294cbf1ac91519de8c19a07239c5e007167a953a0e4438a46`
- [005 - Executive Summary](005-executive-summary.md) L48-L52 `c9b74329d687e544a8e65906d8e4c8e95fda206f8fc06ebfca096f2517018ba7`
- [006 - Table of Contents](006-table-of-contents.md) L54-L90 `b2a05dba144a68b6b63ffcb7e91525a5c3b728803b495a2f7fffafd9e334d2b6`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L92-L207 `d9c051625f88dd265b0c7251cfc2b18ef33c3c17bf3f0410f48a25c025ce5c01`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L209-L232 `04bbee69b64d366a66adaae4ad5f31ac456220c192f7d61f33002fe66131335c`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L234-L240 `054c00faa870d0f79e4b4c4e8095bfe2c5bf0297cff0abc46e71413ea134da5a`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L242-L291 `490b36441708d79212c79a038e0edaca34c2ae7400d18a0bc64b67e0902b14e7`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L292-L440 `1f44231f957e4d75b081e4cd2b244e7ae5fc8e0ddd160ddd2e53acc6d8df5378`
- [012 - 6. Teach](012-6.-teach.md) L441-L483 `476d06f18391c2e50192eb716566e47122c24e4d53082356bb999850f66c4c76`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L485-L671 `8e8a650f1428505b827c6a700df193eb3567d77d1e630005140c11643abe0f66`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L672-L964 `87b55cf2c43c9e0634575fac44ebfc1319fd2b154d7d4e9eb3c5660803d3e669`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L966-L1008 `df287a4989351a4b598365449bc416578100fabb533c54c899c8ff9e3d46fe7b`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L1010-L1080 `57a958963ff1b718c57299fca9978e43fb308b9691ed78c5bcbcfd7540018159`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1081-L1258 `6936245129966ab3536cc4f9ba5b8eb6d4057fb70f08e4dbad9b866b993f42fd`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1259-L1367 `4cab6f7fb298f3b844b8f089f72be792e7ca2a0f262c09392caf24d674c4cf1b`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1368-L1785 `446f12a210986c8d667830fdfaf58531a67e15d73aed43bf0f83886cf21a5e39`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1786-L1903 `e019f0b1cf81f2514a00cfe992b2011b0e9fe0d90db3026ef33cc493a00d1f23`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1904-L1937 `adead0c49ffed792ba0d6ac06299f359a310991c8bb775de6f0969a538f29d64`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1938-L1977 `3ee47f4498b92754184d6bfac8251bfa05b64ea35bba6fd6b18bfd2e0c4fb712`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1979-L2092 `0957f29ff083716b2f74e49a7b0dea532cfdddf53bade665d8cbf8b371e9ac24`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L2093-L2104 `0029ae8f0dd682cf9228f9fae778ab7aa1ab13645e60abe6127a341f886c4728`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L2106-L2115 `10b4d556a1516d60449ad1096011de7d3aa18ccdb8666e1e8154412232165bfb`
- [026 - 20. References](026-20.-references.md) L2117-L2146 `94d55a7c1f26c34f0f8c1a2a5c5c4ec0854be11f6fe131ee47b1f9b96854774e`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2147-L2165 `516c1f843f33f1a5de45335f352abacdddc2eb85fd3d30503f3f8bf404ce4dd9`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2167-L2201 `17629807e1e1f5b0aabe2c8c8f32e37c7e3aa8d41ea97a1a0f1d7914a5242b85`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2202-L2297 `d26c380bfbde8fd05d4791da153f16ee3999a11be89636aaf2879aa5daec5430`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2299-L2352 `adacf33d5dd37215a469fd65c0160a59e1d275c4926bbb677fb631692596aa06`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2353-L2359 `1c6e2520e894373e280c91a0cc6d377e3e7463fa6b8469fe0c0bd9548f927bed`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep)](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2360-L2462 `366b325c937c671f8b4379b5d660c7075cb93198865f1eafacbb2b5456b27fe7`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2463-L2599 `608d642df115bed73e8646790cd7b3ad7a04b73e2c9f913f6072d714af0caea4`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2601-L2646 `ced1018586d92886e01bedd25b380e1dd071840d4d7bb611483683637ea84e9e`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2647-L2756 `10b5028e7339d26f5014fd5922fb12036dd037d19028329fe7ce2c8be3ace083`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2758-L2773 `6e6a844dcc85fe3e887b24eefb73b4ff7f213d4759ed1e7112840f2d29e84fde`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2774-L2786 `718b4526eaba3df128587043c37c95e1d59209600a0eb96fc78daa591dcad6ef`
- [038 - Ledger Compile Addendum - pldg-20260630-001-feature-intake](038-ledger-compile-addendum-pldg-20260630-001-feature-intake.md) L2788-L2856 `665ea075236a7a762318c92a667979920d0cc21dbd5ec7e34bfc22276a133751`
- [039 - Ledger Compile Addendum - pldg-20260624-001-provider-updates](039-ledger-compile-addendum-pldg-20260624-001-provider-updates.md) L2858-L3500 `5a3b0ba74a27d9634eb929d907e0a02397c1cbc2a69b1ff57362113eb1a205dc`
- [040 - Shared actor-boundary, route payload, and blocked_notice packet](040-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3501-L3521 `d34bfcbe2accf6a2d8931dd551eee44a579e0bcd8e30bdb659e9cf3fde340eec`
- [041 - Shared Conversational Actor Runtime Identity](041-shared-conversational-actor-runtime-identity.md) L3523-L3537 `47bb5d96419465126146e14d4f6c5bb818b2f644d43ef4f3e0a85778023ea15d`
- [042 - Chat Route, Permission, and History Behaviors](042-chat-route-permission-and-history-behaviors.md) L3539-L3553 `a390fe164e5912fe58e180c5615b4fbdf9e07b72a74e59252f3856cea69a3850`
- [043 - Owner / Consumer Map](043-owner-consumer-map.md) L3555-L3559 `bc723672b9a72b2dd17177d65791df6c806fb6059700cefb28d143558c0ad2b1`
- [044 - PlanUnits](044-planunits.md) L3561-L3612 `96cc05973d1aa244cd3e151eadb8b19b7583d298a3f7b2d65c50961c19d89f27`
- [045 - Shared runtime projection addendum (2026-08-13)](045-shared-runtime-projection-addendum-2026-08-13.md) L3614-L22417 `27495ea93b6db15de437919aadc72e327d0cf2dd5cbc10fc12cd2b53903d7a42`
- [046 - Migration Coverage](046-migration-coverage.md) L22419-L22449 `9507fae1eba467371d8def0aeba39d55b6261d9d779776dff91fc0f26fd69c57`
- [047 - Ledger Compile Addendum - pldg-20260614-001](047-ledger-compile-addendum-pldg-20260614-001.md) L22451-L22539 `6e8baf305351d0b19e226719d1094dfb98b65a810f68b93e86c79162724b40d1`
- [048 - Ledger Compile Addendum - pldg-20260615-001](048-ledger-compile-addendum-pldg-20260615-001.md) L22541-L22638 `8e23d04c647b98dc41abe08bee9c78fd287c91159aff119b9f27dc34742db344`
- [049 - Ledger Compile Addendum - pldg-20260616-001](049-ledger-compile-addendum-pldg-20260616-001.md) L22640-L22958 `f1a8675be67ae0540bcb517c67047ba21814cb66c188c39bc74d888be030623b`
- [050 - Ledger Compile Addendum - pldg-20260616-002](050-ledger-compile-addendum-pldg-20260616-002.md) L22960-L23027 `b5c7208382a89acd04f31c465f7f38b919a0700f9be0b7786dede527cf6bb32a`
- [051 - Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard](051-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md) L23030-L23118 `c75c1df535341f630dff3ca6df00435d00342281f84698b5175a0accf1955301`
- [052 - Ledger Compile Addendum - pldg-20260622-001-fff](052-ledger-compile-addendum-pldg-20260622-001-fff.md) L23120-L23206 `a8e1fc4b8c695c57d60a432447fa62e4ae364926e09130657f6ce1fea5329388`
- [053 - Ledger Compile Addendum - pldg-20260626-001-feature-name](053-ledger-compile-addendum-pldg-20260626-001-feature-name.md) L23209-L23585 `29f15a25431758945f1a81ae7c21a9b04ea25f8ee11db5262db50f0d4295250d`
- [054 - Ledger Compile Addendum - pldg-20260627-001-feature-intake](054-ledger-compile-addendum-pldg-20260627-001-feature-intake.md) L23587-L23798 `d72de9450d2ae20975524b47ac94c67cc9751fb3174f5dd3c0b78c63304a332c`
- [055 - Ledger Compile Addendum - pldg-20260701-001-feature-intake](055-ledger-compile-addendum-pldg-20260701-001-feature-intake.md) L23800-L23879 `6b93eb0c2e0e48070636cd87e3c85b2b9e145bda33559ea884fb09c1a67f0d31`
- [056 - Ledger Compile Addendum - pldg-20260703-001-feature-intake](056-ledger-compile-addendum-pldg-20260703-001-feature-intake.md) L23881-L23946 `1614de77e632fe4ad5eecd582222af059f5ee6e533005d6e452682a25edc42e2`
- [057 - FABLE Residual Chat Mechanics Cleanup Addendum - 2026-07-07](057-fable-residual-chat-mechanics-cleanup-addendum-2026-07-07.md) L23948-L24019 `753eaaea4527c81dd338c243ffdaabd7b74296c29e33ff7a10b54579de83f72c`
- [058 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](058-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L24021-L24065 `98fc8f102b83c4832f16eb38aa6e0a3e3caf1d9110ffcdcf1e6b90af10e0ee24`
- [059 - Usage GUI Propagation Addendum - 2026-07-09](059-usage-gui-propagation-addendum-2026-07-09.md) L24067-L24143 `4b9db388b04fcc03f95a3fe7addd0f6ec1019607b09ec210743d057b3a229273`
- [060 - PMConcept6 Chat Polish Addendum - 2026-07-16](060-pmconcept6-chat-polish-addendum-2026-07-16.md) L24145-L24377 `dfdaaa31239bacb439bd444db4100c23fcb0e00b1cf90f6e6cacb33b00125252`
- [061 - Immutable conversation restore-point lifecycle - Known-37 completion](061-immutable-conversation-restore-point-lifecycle-known-37-completi.md) L24380-L24397 `5ee6220e9c39595510958484c220c1c79a7a48ccbd3ef37bace7e0cd69ac0de3`
- [062 - PMConcept7 Concept Promotion Addendum - 2026-07-23](062-pmconcept7-concept-promotion-addendum-2026-07-23.md) L24399-L24783 `730b5cc6efecb7a45327da215887ea79fbd942203197066ec19e1ff342a5f836`
- [063 - PMConcept7 shared Assistant seating and context surfaces addendum - 2026-08-27](063-pmconcept7-shared-assistant-seating-and-context-surfaces-addendu.md) L24785-L24887 `69d4e21cfff0e647b27e28f0f14febab714bdf24bbf66ecefcd1835dee47c71a`
- [064 - Additive Correction v4 — Consumed Assistant Behaviour (2026-09-03)](064-additive-correction-v4-consumed-assistant-behaviour-2026-09-03.md) L24889-L24937 `ce73024535c339b424dfe3c60750ccd25198b3ba53b4430084821d1d21aaf294`
- [065 - Working Notebook Surface Addendum (2026-09-05)](065-working-notebook-surface-addendum-2026-09-05.md) L24939-L25047 `c54b001a64ff2159334b5eefeb1b933846dabed0c8676ea6d2f54ef6e33121a1`
- [066 - Cumulative v3 Assistant Interaction & Surface Specification (2026-09-07)](066-cumulative-v3-assistant-interaction-surface-specification-2026-0.md) L25049-L25418 `17205ea61e9951a3ecce4bf77aefa0ad5717199785365f555c45d93c1acbeea9`
- [067 - Research decision packet review](067-research-decision-packet-review.md) L25422-L25517 `6cff9cd7dad48904631345b27df8a996069ed3b7660e67620a914aebc72b2761`
- [068 - Context Lens Source and Preview Reconciliation — 2026-09-10](068-context-lens-source-and-preview-reconciliation-2026-09-10.md) L25519-L25583 `33cad4da1a1a53b1f2ed4b10c1f89564b94f04049268734a71f9748d3bf7287d`
- [069 - Compaction completion Event Authority (DL-039 and DL-040)](069-compaction-completion-event-authority-dl-039-and-dl-040.md) L25585-L25638 `5d87eeccc888705446ba6a2c0c7df074b3c9eae190662a408f95ba64dc4a7b68`
- [070 - DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)](070-dl-042-historical-todo-event-migration-consumer-boundary-2026-09.md) L25641-L25688 `b200bedad000d46d90ead78d9a53a8d3b6b4d9c49b1393d02ba6c7ee6bef127c`
- [071 - Restore-point created native and historical consumers](071-restore-point-created-native-and-historical-consumers.md) L25691-L25865 `e2d6675946084676aa045d0287c38180d3116f392bb6333f5adf9dee415cec13`
- [072 - Deleted restore-point passive history admission](072-deleted-restore-point-passive-history-admission.md) L25868-L25934 `4d453fac8133502a9b42bfbe00bfcd4e0d87899cd3ff400d60ca0a21cf73ab0a`
- [073 - Expired restore-point passive history admission](073-expired-restore-point-passive-history-admission.md) L25937-L26006 `b44f70ee5cc82e10f2303c699f4e5a3c0fae9b418c7281403fcb05d7f9ff42ad`
- [074 - External Research Decision Packet Consumer Addendum (2026-09-17)](074-external-research-decision-packet-consumer-addendum-2026-09-17.md) L26008-L26058 `53c446e810746bae056dc0c0f3b2ab910b1b1fc154f73f10397ecc1717dcfb2c`
- [075 - Chat WOW Turn Presentation Addendum (2026-09-27)](075-chat-wow-turn-presentation-addendum-2026-09-27.md) L26060-L26701 `c3ebc5c55828252788d7c878eeb0ec8fa6aaa4f1ad069e0a19be06c430183cd3`
- [076 - Wand Modules Redesign Addendum (2026-09-27)](076-wand-modules-redesign-addendum-2026-09-27.md) L26703-L27408 `0d7323d6f9e6fd7870ba12fe15a1db521ea3b029dc3f19c5d43eda77d164dc6b`
- [077 - Chat Tweaks Addendum (2026-10-08)](077-chat-tweaks-addendum-2026-10-08.md) L27410-L27486 `71d550a6a73a262caa3af9d259276f019b21a46866a872d80f8833e8d74c1a3f`
- [078 - DL-180, DL-181 and DL-185 — What The Chat Opens, Its Column, Its Command Card And The Port (2026-10-09)](078-dl-180-dl-181-and-dl-185-what-the-chat-opens-its-column-its-comm.md) L27488-L27894 `896c882742d1e4bf72c956f8a259211d7414ca3bdacf4fc5f65e72350fecf164`
