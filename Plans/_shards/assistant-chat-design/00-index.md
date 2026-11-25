# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-11-25T13:06:05Z

Source SHA256: `f8d1ba85b68d815aa3bc1d39db63e7a1ec013f070ade0539bfce30ef99c08b6a`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `bb5af0adefc0966b62562a193f0a212b6615c4a42c8fd20848ed354a8938ab1e`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `e25626c6a2699f5b93b28a0ffc41db40fe1301c4807829c35eb4938220128a21`
- [003 - Change Summary](003-change-summary.md) L14-L30 `afbe9897b068c23a751495b1d82ca4be64ee0a8d1f6460975f552c45f4fe6791`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L32-L47 `342eed32360d26c3711c9ac7abcfab0f02c0e9f11452c299d7aa6d66f7e2e97b`
- [005 - Executive Summary](005-executive-summary.md) L48-L52 `c858f6699270a5152468b9a666a8bee9efdabd0923c3974ca570c252ff204370`
- [006 - Table of Contents](006-table-of-contents.md) L54-L90 `59bb3a00c0b87dec0de0500275624b487938eef2e92c11d5500f01f09b6c3525`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L92-L207 `d4bf9617e32b2df8acbaa22e90bf2f31f1240801e6abdeb6970cdc23bf85169a`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L209-L232 `8eacae0ead4c0b9768b7d6ea54bdb4afe1fbdc625db3093df475780c88d7b104`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L234-L240 `23a6109870783c39682ea3a2153c30cf4ebdec63561aa1eac80b011e9bc6503c`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L242-L291 `bf39edd4372cfc7a6a251f8d4e437f134c5b50f40017edd403af28cc157293d1`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L292-L440 `e9f8e10a07d87de10559612e4ed26a4e52ed7a88b2b63df40e1a0bb9d7657830`
- [012 - 6. Teach](012-6.-teach.md) L441-L479 `8df4617c46ae9c7d7aadc9196bbe1dfc24a270cd31179a3f461a0b52a5442c73`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L481-L667 `16ca0db24397ae79384163a66991718649dc02908ea4861d9c6c213c55b61e78`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L668-L960 `58a472952d555c289ec86d6c5003da94fb424d6675540aeacfd672b06fd11663`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L962-L1004 `7818364288b5b3a850d16811a557cceb12ffa5ead79b053574a1a316360f5b9a`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L1006-L1077 `a14543890187e4c13df2c47b23d32b71a2d3a29977c86d6d1179444377b300de`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1078-L1258 `31de677b063662e6cc9896ef52ef67bda55f92e1810596316683dfb36f02f491`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1259-L1365 `8c1bbc7a3d25ffea837b6a0985f6a300ba79cb049dcf4a4c706fbe0ad3cc0bba`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1366-L1783 `76a6e79e208742d1885ae5aa0a4b1aecec437daf1d511bbba646e398536bb91a`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1784-L1901 `6025e2edf1a0edff43b3f4ee31c94ba61f0674822b747c30b5cae5073f78e824`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1902-L1935 `c41b950d639c94c8724d9a7d08191f6685be8daf60fba2e87905bf6cfcdacdc9`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1936-L1975 `36e1d3d84249d56e69d7e684ae624b71ce62cd511f5c5763a0828e7f7b0afe10`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1977-L2090 `fb91de8748567bf97fc8ee0135000951a04cc075af33d0561c8f21914f548009`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L2091-L2102 `fde1ef86e4f7d6dca6604a26d0e48d598eb24fc22967676496a2c3b8189ac800`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L2104-L2113 `96346fc9529806c5434fe0660fa711abfbaf36f9723a1bc3ce02764d779cb0de`
- [026 - 20. References](026-20.-references.md) L2115-L2144 `ea0ef1276736818d3ded01b7809fbf47de988f51f3314b5f2d7ace4a6b60b275`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2145-L2163 `7ceeccbb37c7112be2cc403d6ccecb1c3c9b9fe962ff88f59ee37c095ae5c9d6`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2165-L2199 `96290300e50c9b02e9cafec181c676b7e2744768e0e0cc338d4f873aa6d9d90d`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2200-L2295 `1a1d38816bd7c8d2b0e3010fca5f1fd13f086b02f6f0e4fb3b6238a142c40089`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2297-L2351 `42b736013fb1849cc9f16de99b3f8503cede6e30998c7228b5021c9e127e09d9`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2352-L2358 `3c45bfeb7d97bf9fdc4034f120e169d3d75e0ed3af21c042b8436b9ee6ecb0ba`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep) And Loop Specification](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2359-L2599 `b971093ca98e5f00356eea84cda97c3cf6d689f973eacfe6a1c6dd3944fac9bf`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2601-L2737 `029a455575e190953ce4bdd5c6e3b97602aae95a677f10ced683872cddec3142`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2739-L2784 `c6e30b7cc744f3d127f22d817883b3e4cc8dd27f5449ac91d589c6514b4b598d`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2785-L2894 `8a5a5fdd0bb8d227ae038b462b368fe7c69f87d195a76a2afbe296b52dfcfff7`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2896-L2911 `655929c2a4dd9b86c8400097b9a4b9f8313598e6ce4c2e270bbe89b310a5f4ed`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2912-L2924 `b0d1348fe7e61ce225b6477866aa57af0edc0703b2164048194c4ff202ea8c69`
- [038 - Ledger Compile Addendum - pldg-20260630-001-feature-intake](038-ledger-compile-addendum-pldg-20260630-001-feature-intake.md) L2926-L2994 `cb04b225ffc9aa22ccd38140e8e379281329acd1194d37316f8ce7a132077182`
- [039 - Ledger Compile Addendum - pldg-20260624-001-provider-updates](039-ledger-compile-addendum-pldg-20260624-001-provider-updates.md) L2996-L3638 `df9e99b517782ef4566d4a1c95100ca54b6751c38b59391dbcbe467754a692d1`
- [040 - Shared actor-boundary, route payload, and blocked_notice packet](040-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3639-L3659 `0eb78907d3e5e72f22165caf0266228204fc378a01a1001ad240489e077149b5`
- [041 - Shared Conversational Actor Runtime Identity](041-shared-conversational-actor-runtime-identity.md) L3661-L3675 `b2d086affde1c45ec4d4862d139f380c17d10551ca39a051a4fab7c2b7631b47`
- [042 - Chat Route, Permission, and History Behaviors](042-chat-route-permission-and-history-behaviors.md) L3677-L3691 `c555fd25fbe95f3cff5c97c1566d193cbe2013477f19e838b257ca4379acb395`
- [043 - Owner / Consumer Map](043-owner-consumer-map.md) L3693-L3697 `76523e5c5c9a849aba715a95a3b96eea90c80314d06e762e3d17e17b29c5d5ad`
- [044 - PlanUnits](044-planunits.md) L3699-L3750 `9734768d409adffe73deb1d80b63def3e5df5cd488abee4e39da9b65cd9d55d7`
- [045 - Shared runtime projection addendum (2026-08-13)](045-shared-runtime-projection-addendum-2026-08-13.md) L3752-L23148 `19152516ff5fbce4cef67443cddd4331c9a85df4f8c4e99b9b400e0491dc0575`
- [046 - Migration Coverage](046-migration-coverage.md) L23150-L23180 `79f2f51a7594059a4a3ef4ada47201c49a3cea59619af2f4bd4ad43bc19db059`
- [047 - Ledger Compile Addendum - pldg-20260614-001](047-ledger-compile-addendum-pldg-20260614-001.md) L23182-L23270 `2c6d6b68ef8e0a1473689f6be368d65e6626508763a1709b1bea0c3935aa5d3f`
- [048 - Ledger Compile Addendum - pldg-20260615-001](048-ledger-compile-addendum-pldg-20260615-001.md) L23272-L23369 `0bab334fb3589891a3be255f1724b1002b7c7c1d1de69e32dda1e779a33617ae`
- [049 - Ledger Compile Addendum - pldg-20260616-001](049-ledger-compile-addendum-pldg-20260616-001.md) L23371-L23697 `84bfef127b20c63edb434c89d1bc084aa9776220d9a573bfb5de858eb85cf9d2`
- [050 - Ledger Compile Addendum - pldg-20260616-002](050-ledger-compile-addendum-pldg-20260616-002.md) L23699-L23772 `f22ea6b3d3b4d993fa23d7e031485d8897c467115770447deba19dc0d7060a96`
- [051 - Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard](051-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md) L23775-L23863 `a13e6e1994ebeb643aa33cf544c41993adb9b7a0460cdfcbce35f40c9b99b7f6`
- [052 - Ledger Compile Addendum - pldg-20260622-001-fff](052-ledger-compile-addendum-pldg-20260622-001-fff.md) L23865-L23951 `41987fab0ee45c9ffa3143a509db6edf34bd930e3d64d922005f0e35ab191ca8`
- [053 - Ledger Compile Addendum - pldg-20260626-001-feature-name](053-ledger-compile-addendum-pldg-20260626-001-feature-name.md) L23954-L24294 `9ed6245c9721b24cfe1da23dcaef2b2a7ea6053e16c652bb2749d86d1e5d2849`
- [054 - Ledger Compile Addendum - pldg-20260627-001-feature-intake](054-ledger-compile-addendum-pldg-20260627-001-feature-intake.md) L24296-L24507 `06534c61be18d71f187af364c1d228ae0ea328d8aefd70ee2988202eb2ca0439`
- [055 - Ledger Compile Addendum - pldg-20260701-001-feature-intake](055-ledger-compile-addendum-pldg-20260701-001-feature-intake.md) L24509-L24590 `c2092fe21bf6a6dbb412bd5c65ed7ea9e0adab9e36edba44f5c39f72a63cf537`
- [056 - Ledger Compile Addendum - pldg-20260703-001-feature-intake](056-ledger-compile-addendum-pldg-20260703-001-feature-intake.md) L24592-L24657 `71b75c0c0646e6d90321f09594dec9c25dc9b22ea2800992c5ee18041dc93212`
- [057 - FABLE Residual Chat Mechanics Cleanup Addendum - 2026-07-07](057-fable-residual-chat-mechanics-cleanup-addendum-2026-07-07.md) L24659-L24730 `75fc91e31190e05e9585ecb05af1acc4e44e5356fa24324e8289d45995dae816`
- [058 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](058-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L24732-L24778 `d70e93158c46506526c491fe49f17675d787c26c0481914240f9a0f9056fa016`
- [059 - Usage GUI Propagation Addendum - 2026-07-09](059-usage-gui-propagation-addendum-2026-07-09.md) L24780-L24867 `9af45b5c53a2c26acaff3d798e867743a938d5aef7bee9df9361ef072560c136`
- [060 - PMConcept6 Chat Polish Addendum - 2026-07-16](060-pmconcept6-chat-polish-addendum-2026-07-16.md) L24869-L25104 `d60d8ce83e57fa4fda0fe7182c7264664c40f2c926645bbf35b23f9133e06f2f`
- [061 - Immutable conversation restore-point lifecycle - Known-37 completion](061-immutable-conversation-restore-point-lifecycle-known-37-completi.md) L25107-L25124 `91c06df7d0820293cd581f7edfb29cd081037227fb243a43b1f4abe01ca6eb28`
- [062 - PMConcept7 Concept Promotion Addendum - 2026-07-23](062-pmconcept7-concept-promotion-addendum-2026-07-23.md) L25126-L25498 `208274f78838f467e107b7dccce0dde1f0aabdb0245c9cbf442302470348dea7`
- [063 - PMConcept7 shared Assistant seating and context surfaces addendum - 2026-08-27](063-pmconcept7-shared-assistant-seating-and-context-surfaces-addendu.md) L25500-L25606 `d294b48a30f308248a6f059263b992bedbc39ff342966442f9dcabebcf87c806`
- [064 - Additive Correction v4 — Consumed Assistant Behaviour (2026-09-03)](064-additive-correction-v4-consumed-assistant-behaviour-2026-09-03.md) L25608-L25656 `7b537b1a22819187b2910ed47f6537e1def2365a94ab507394b0f63e877542d7`
- [065 - Working Notebook Surface Addendum (2026-09-05)](065-working-notebook-surface-addendum-2026-09-05.md) L25658-L25797 `010d3e61202e58cdab91f71ce42fe0183fe82d2bde29d37b6f2a33ab95eaf87e`
- [066 - Cumulative v3 Assistant Interaction & Surface Specification (2026-09-07)](066-cumulative-v3-assistant-interaction-surface-specification-2026-0.md) L25799-L26192 `5afb331ed4b0f0a56d235d0666c734077b4b325965bc4d24a6ffd35eb1d58cef`
- [067 - Research decision packet review](067-research-decision-packet-review.md) L26196-L26291 `5a3dfe135fd6ddf20a027f12de9b74946b4127aff8726213042eded68aa1705b`
- [068 - Context Lens Source and Preview Reconciliation — 2026-09-10](068-context-lens-source-and-preview-reconciliation-2026-09-10.md) L26293-L26357 `19b05e5c4f1b26f0fa99a9871393dff353019a521ccdbba6a6cd46af009d1d92`
- [069 - Compaction completion Event Authority (DL-039 and DL-040)](069-compaction-completion-event-authority-dl-039-and-dl-040.md) L26359-L26423 `a08bfcefacdcc0ebb6e3177cbcd0f7715251da558e182a4c3bb58099a28a3c18`
- [070 - DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)](070-dl-042-historical-todo-event-migration-consumer-boundary-2026-09.md) L26426-L26481 `962088c981ae98761c726a7c977412008e9a8236062f62de6cef1bc63917d826`
- [071 - Restore-point created native and historical consumers](071-restore-point-created-native-and-historical-consumers.md) L26484-L26679 `883b8a607f2dc4a179b5cdc5f1e637ff2f1e0a39f1937bd5292cecd8577a0109`
- [072 - Deleted restore-point passive history admission](072-deleted-restore-point-passive-history-admission.md) L26682-L26748 `152b9aafd17fbdc895dcdaa7ae7a4d0b3d67a3595d7985ab2cba19e5a6607a34`
- [073 - Expired restore-point passive history admission](073-expired-restore-point-passive-history-admission.md) L26751-L26820 `015586694e4824c7131e949a7becb08b3a9a15b46facc8c7c0b369ff37545215`
- [074 - External Research Decision Packet Consumer Addendum (2026-09-17)](074-external-research-decision-packet-consumer-addendum-2026-09-17.md) L26822-L26872 `0369b1b6eda668efbc5968f52b84dfb3e1d836ebd641fcd05c772b90fbadface`
- [075 - Chat WOW Turn Presentation Addendum (2026-09-27)](075-chat-wow-turn-presentation-addendum-2026-09-27.md) L26874-L27522 `0e6caafa17f43380fc49c585f57abc6a38a9c439958d62179d5bf1056220531f`
- [076 - Wand Modules Redesign Addendum (2026-09-27)](076-wand-modules-redesign-addendum-2026-09-27.md) L27524-L28218 `b152d30c276db00da4404d956ea0ee87429e45439dc477aa8fd7e563fddc23ab`
- [077 - Chat Tweaks Addendum (2026-10-08)](077-chat-tweaks-addendum-2026-10-08.md) L28220-L28296 `8c00e451acbdc966989e4a82e3a735cf22b346a8b13c96f6519c402b81151a65`
- [078 - DL-180, DL-181 and DL-185 — What The Chat Opens, Its Column, Its Command Card And The Port (2026-10-09)](078-dl-180-dl-181-and-dl-185-what-the-chat-opens-its-column-its-comm.md) L28298-L28789 `8a370db9befb5484070447410fd43603cb5099bd5a94b7e8915f944da61faf9d`
- [079 - Grill Me rounds and agreement — DL-218](079-grill-me-rounds-and-agreement-dl-218.md) L28791-L29564 `3bb400fd749c436e29f47a70f4313aa984a8192161d9a2a0cb055d81e52a8038`
- [080 - Command payload definitions (DL-333, 2026-11-05)](080-command-payload-definitions-dl-333-2026-11-05.md) L29566-L33475 `01928e8eb8cc8f420a322806aad6f3ed5fb3521d2c29670cf6fe6d4d20f8006f`
- [081 - Markdown Pipeline, Streaming Correctness, Sanitization, And Math Addendum (2026-11-23, DL-2601)](081-markdown-pipeline-streaming-correctness-sanitization-and-math-ad.md) L33477-L33854 `029b4a029b85bbefabb681be08b98ed1122608028bad24b8d074d79bb129ded6`
