# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-10-19T00:58:45Z

Source SHA256: `1829eabf9cf6bddd363c00509666e812dcc6ccfdd72b9251e3a5680a87edb75a`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `4d47ef62b81f6d66b64c5353255e1ae7f636419ada8dc16cfe50455dfbf4a83b`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `e0e6657c27240d2e2359bc5e1ca726f5969ca88d82307b8fd9ae81bc3dfe1743`
- [003 - Change Summary](003-change-summary.md) L14-L30 `16d4f3cf1e8503b94b7850a69d0ad8c89c1c47a754031fd39e99cf9c37b416c7`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L32-L47 `60dfbb2bbee6129bfd97415f3f6e6c2d1338cd44b2f9aa57768542e9a32bd74a`
- [005 - Executive Summary](005-executive-summary.md) L48-L52 `d1e5c216c0eb85651c085db8e1aab7084be67eb1a6654d3d9f81f45439b6de02`
- [006 - Table of Contents](006-table-of-contents.md) L54-L90 `a2b9648d4a1dde94a44c21a1b4c1508502c1d971f7af08bc1e332c772531b4e4`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L92-L207 `7392b2df1c7955f214e4f5e5e4f5ec5bc977445a82bf454acd9608ddc6bac0a3`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L209-L232 `e3ae941fa9310f43d8cec8dcf696080b51bc5e85a12363083798a0dedb1a42c8`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L234-L240 `e5ec34f28cc81b87b3a54608f9ba9528054420158fe347b29e3da25e818392a2`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L242-L291 `612501252b707367dd20d1ee91794ee29fa844a77ecef036cdece806ed4c3b8d`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L292-L440 `ea21f681d368a2b3a0e5e028b08a9fa7fe6a88903865dd41b1c5f40d28f40c6b`
- [012 - 6. Teach](012-6.-teach.md) L441-L483 `38f517c242444ce99df85ff54e8f7d07348b387106245899ac77d3e9d85f103d`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L485-L671 `e3906d3c146b6452dd65621ab4d02d66c6a794b3606019b3435b6fcc9308ea64`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L672-L964 `f26a263e3c946a5496fc908797485ad4c47d5d4de5a6f5d2635c6ba5bc35316e`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L966-L1008 `a5074c660361c67cc8113df3795df3e10cd6d6ea1d1ef8ed491573b0bc3a176a`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L1010-L1080 `98dcd4a5eeb156ed05fd1dc5b47f46b1491e27aac6668cebb0c972e30a002bb0`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1081-L1258 `50e85a163254fb516fbf809671199917419051ee667f011d0f05c3fd01a8e195`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1259-L1367 `607fc667c7f9fb0c45b343f4b1ee08f34abe1c2ddfd052da09d52f0c3a3576bf`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1368-L1785 `0f30b9a3c74410d118a5192b9c16626c9a61db75365719f928e5a7d334e80f45`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1786-L1903 `7d19ec42588864cb8f413e3688c4b6c11aa647619840e1e10a4b7a3200441f79`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1904-L1937 `710abd459170b529c3fcdc1deea257b4292d9f66d733afd6d1ac43ee5e0f7712`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1938-L1977 `0a8174a87f94f0ea09891edd77765ffb5420c753435572e4abfef02aebdabedd`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1979-L2092 `ec7d1aceb707c61119e023d8a748d1ab44c734325eb69a692db5d63dedd33d3a`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L2093-L2104 `e8b5419c1307e2496c56b9bb19fb498f270a214e784bc40a1f2ffa605b56ae89`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L2106-L2115 `d1e2ca1d43458fede2668ccdaaabd3026f5bc2380ca4432cfdb6863de709b227`
- [026 - 20. References](026-20.-references.md) L2117-L2146 `ec08339aed3b031117e3360d5a42654a67cda396968d22738676c38481805eeb`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2147-L2165 `b4d86c5b58a7236c51cf397a00e56106bb63bd662ca92d904d01aaa94ab840f5`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2167-L2201 `d859c5f57241da7f77dba24611ff6fca6dffacf66a7dbbbb0950cb5f957dde65`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2202-L2297 `9c73ce58866925a7c84619c823a17cd59c72bcf3e72b09fbc698b34794980bdb`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2299-L2352 `77d8e84efaf6879a81ab4be65b3c611e2b24065fbd7e87f5d31baeb55330a5ea`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2353-L2359 `2b28d806c6995f17dcded590ae078ab36fc821fdca50427f4409c52d360f76c4`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep)](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2360-L2462 `378caf70a6934a253f0bb8c306f58e115cb42e09669ad2ac9a9d0cdc991dd046`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2463-L2599 `25278f1797739d7dba6d9f1d23ca85ec5e2d22ffd471a411d5f0c327e49d082b`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2601-L2646 `d563cf71d3d1d48f23e4b0462cab5d6416285d8c9abd8f4b2128ad539f2cdafd`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2647-L2756 `e8f8734ad5df05357afef3de7e64a034243a4df2d0fbf1b8d62f2b396bd1a93c`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2758-L2773 `2712b85bf850e0e57b6828214834058f05188f47ab9aad532c8b47733274952d`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2774-L2786 `4e6d9defa8ec7090c5a6b251d29accb7117cc4c67c2150fd06c4214e645bdb6d`
- [038 - Ledger Compile Addendum - pldg-20260630-001-feature-intake](038-ledger-compile-addendum-pldg-20260630-001-feature-intake.md) L2788-L2856 `8ab25eec2485300d60431aed349e9d408ab3c4f4c95cdbb45e144ca2ab03712f`
- [039 - Ledger Compile Addendum - pldg-20260624-001-provider-updates](039-ledger-compile-addendum-pldg-20260624-001-provider-updates.md) L2858-L3500 `ebc806b88b627a416a0741a005fa9f803f5c59e9411258d6b2fd5eece386412e`
- [040 - Shared actor-boundary, route payload, and blocked_notice packet](040-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3501-L3521 `a6a507a245d15465e64032e414c3a9e301d4db8bc4f62e62cb4b52f4cceb3362`
- [041 - Shared Conversational Actor Runtime Identity](041-shared-conversational-actor-runtime-identity.md) L3523-L3537 `fa131c75044e4a60c72ae55c5060b08fdb5b76ea45a5323011588285d63cc85c`
- [042 - Chat Route, Permission, and History Behaviors](042-chat-route-permission-and-history-behaviors.md) L3539-L3553 `a4e3067f8ea974d544fbdc7d5f644f6312c832bdf88e95e360f9e27638dc26e6`
- [043 - Owner / Consumer Map](043-owner-consumer-map.md) L3555-L3559 `4874d961ba057331f361d59b0134914f184392737176de653cc5a810ed0b8d44`
- [044 - PlanUnits](044-planunits.md) L3561-L3612 `e23280e28a507918c6b56b45d71e068fda0295c70f337d6be866630db9d16961`
- [045 - Shared runtime projection addendum (2026-08-13)](045-shared-runtime-projection-addendum-2026-08-13.md) L3614-L22417 `a83296fb26b74ac5dfb41e909c49e4bd28e1c6135fd2859c6f9b2a207659d49a`
- [046 - Migration Coverage](046-migration-coverage.md) L22419-L22449 `6b6112a2197ed8ef36ac5d36207c446492e34e4ee95cadb9d7136e83acfb4609`
- [047 - Ledger Compile Addendum - pldg-20260614-001](047-ledger-compile-addendum-pldg-20260614-001.md) L22451-L22539 `fab874f04f1e078bed910fe6036ef72e16abf8d849f8eeddd8875570ade92286`
- [048 - Ledger Compile Addendum - pldg-20260615-001](048-ledger-compile-addendum-pldg-20260615-001.md) L22541-L22638 `022100e682709706c6e8beda69d141dcc908f547c393dac12e3fc8b86e3ed7c4`
- [049 - Ledger Compile Addendum - pldg-20260616-001](049-ledger-compile-addendum-pldg-20260616-001.md) L22640-L22958 `6afb5944838b989d6892b792071a354df63ba783150ca31ad70ff1770ad3cda7`
- [050 - Ledger Compile Addendum - pldg-20260616-002](050-ledger-compile-addendum-pldg-20260616-002.md) L22960-L23027 `cfb4fa6f48e6b1a5add74d6d65ef10718e5046d85452baf1e21dfcbf17a6094e`
- [051 - Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard](051-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md) L23030-L23118 `c0b181bc9e669ac60d45191bf4fffc979af732309a58bb27fc3b30162a4a057c`
- [052 - Ledger Compile Addendum - pldg-20260622-001-fff](052-ledger-compile-addendum-pldg-20260622-001-fff.md) L23120-L23206 `d1cb2e212cc44d39ba9ea7ee282d6cd2c70e4d97469161519885916a13019d3f`
- [053 - Ledger Compile Addendum - pldg-20260626-001-feature-name](053-ledger-compile-addendum-pldg-20260626-001-feature-name.md) L23209-L23585 `04c7ef1bb963fcb229fb41860f49f17f6699b4b1c8ab668140ca75c75c3c825a`
- [054 - Ledger Compile Addendum - pldg-20260627-001-feature-intake](054-ledger-compile-addendum-pldg-20260627-001-feature-intake.md) L23587-L23798 `d514c9df5c724b85ee0a09e75cfa9150f3fd39151eeea3e6732988ca64c5a5d2`
- [055 - Ledger Compile Addendum - pldg-20260701-001-feature-intake](055-ledger-compile-addendum-pldg-20260701-001-feature-intake.md) L23800-L23879 `573334c7ff369a01d18fd67b0b5b30001a2703ee9f8b56296cdd3123a918b720`
- [056 - Ledger Compile Addendum - pldg-20260703-001-feature-intake](056-ledger-compile-addendum-pldg-20260703-001-feature-intake.md) L23881-L23946 `0a662ab7433ec14dc3081808ff8e6c1723f39642530d221652d10dd680ea6111`
- [057 - FABLE Residual Chat Mechanics Cleanup Addendum - 2026-07-07](057-fable-residual-chat-mechanics-cleanup-addendum-2026-07-07.md) L23948-L24019 `72fa9f438be28ce0e43676f823291a599c21bbf0a5a69c0265ff144457fc0007`
- [058 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](058-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L24021-L24065 `d07681ddfd523ffc1f0a363bc2a562ef8ceaf1705362d7b2393ba9b4c026e416`
- [059 - Usage GUI Propagation Addendum - 2026-07-09](059-usage-gui-propagation-addendum-2026-07-09.md) L24067-L24143 `6637ad90e92d4a04837857b755916ff32f1f88f2d57e004b582d0ca29031bfdc`
- [060 - PMConcept6 Chat Polish Addendum - 2026-07-16](060-pmconcept6-chat-polish-addendum-2026-07-16.md) L24145-L24377 `0659d417562b73e595ed5a585dd670d391acfd9c781cfc6b914e5a38729afa89`
- [061 - Immutable conversation restore-point lifecycle - Known-37 completion](061-immutable-conversation-restore-point-lifecycle-known-37-completi.md) L24380-L24397 `8556c48fa30a62dbde8e04a144bd1f7ac15b2ca5e94c3fe889cae3768bf72e74`
- [062 - PMConcept7 Concept Promotion Addendum - 2026-07-23](062-pmconcept7-concept-promotion-addendum-2026-07-23.md) L24399-L24783 `8a7c5c61141ac39ded4bae93cc1459b207931afab47015af7ff5a06a347b796e`
- [063 - PMConcept7 shared Assistant seating and context surfaces addendum - 2026-08-27](063-pmconcept7-shared-assistant-seating-and-context-surfaces-addendu.md) L24785-L24887 `6bee7565ecacf276d0ef41b2ea8f4ee229383c133a0d02b3afc614d46f519e17`
- [064 - Additive Correction v4 — Consumed Assistant Behaviour (2026-09-03)](064-additive-correction-v4-consumed-assistant-behaviour-2026-09-03.md) L24889-L24937 `fdc352f6f32c08cbcbdb3b8b28ec29f1cc472ad06f8aa40b36cba7f2de56cf53`
- [065 - Working Notebook Surface Addendum (2026-09-05)](065-working-notebook-surface-addendum-2026-09-05.md) L24939-L25047 `ff17d0a88c99b11711e2388d0684f711115955353de4bd65d68daa7d8b7ecd35`
- [066 - Cumulative v3 Assistant Interaction & Surface Specification (2026-09-07)](066-cumulative-v3-assistant-interaction-surface-specification-2026-0.md) L25049-L25418 `cc6ba1174dac7d760ca0727d4460e0696c6d90163102d4285d32c5df7df69990`
- [067 - Research decision packet review](067-research-decision-packet-review.md) L25422-L25517 `ccab40149cb317ab2e3813c610f57e3db49939a4666db894458d320904bbfbbf`
- [068 - Context Lens Source and Preview Reconciliation — 2026-09-10](068-context-lens-source-and-preview-reconciliation-2026-09-10.md) L25519-L25583 `4a2cee2f854aeeecf951d057e7f37f3843fd405e5610c7be16f6efc1c8c6adf9`
- [069 - Compaction completion Event Authority (DL-039 and DL-040)](069-compaction-completion-event-authority-dl-039-and-dl-040.md) L25585-L25638 `8700cdb3e4077ea4ea78545abc749846586c4a3c496dd1aff46bfc9bd567e4d1`
- [070 - DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)](070-dl-042-historical-todo-event-migration-consumer-boundary-2026-09.md) L25641-L25688 `f0526ba816c2096de673f7a70658d2c9a22444a362184efc8102e1fcea13da81`
- [071 - Restore-point created native and historical consumers](071-restore-point-created-native-and-historical-consumers.md) L25691-L25865 `c1fdff5271d455f69b58a8a9be75d932935f5b2a67c331e1937f34a545827281`
- [072 - Deleted restore-point passive history admission](072-deleted-restore-point-passive-history-admission.md) L25868-L25934 `7884da30b825756fc5018b2ac2bfb27da6a1182adfde79fb023bbdb3e41f2955`
- [073 - Expired restore-point passive history admission](073-expired-restore-point-passive-history-admission.md) L25937-L26006 `ccc897544280a09ce522d55e95455591253d8696638ce1b5ebb3dd0f8f6ed524`
- [074 - External Research Decision Packet Consumer Addendum (2026-09-17)](074-external-research-decision-packet-consumer-addendum-2026-09-17.md) L26008-L26058 `9f9f561feb095279226831eca783bcea59da7a084d107594f82a1a487fb3e3b9`
- [075 - Chat WOW Turn Presentation Addendum (2026-09-27)](075-chat-wow-turn-presentation-addendum-2026-09-27.md) L26060-L26712 `c3e675f69cada23f46e8cfe0582057469e6cd6ab5a3a43696fe174c1b67ad053`
- [076 - Wand Modules Redesign Addendum (2026-09-27)](076-wand-modules-redesign-addendum-2026-09-27.md) L26714-L27419 `fd82c69d0f991a37331ec0d9e45f3d272d9137e9bb534e7c41d659d7e06a02d8`
- [077 - Chat Tweaks Addendum (2026-10-08)](077-chat-tweaks-addendum-2026-10-08.md) L27421-L27497 `15019a7a3e429b7cbc5e0c3ac363761e7d9b89c04d7d4969c3b2550357915697`
- [078 - DL-180, DL-181 and DL-185 — What The Chat Opens, Its Column, Its Command Card And The Port (2026-10-09)](078-dl-180-dl-181-and-dl-185-what-the-chat-opens-its-column-its-comm.md) L27499-L27906 `dbdc96f0ccfa55256ea5bf35d1d5c12544e19cba0a54ca3a3093f3f20347947d`
