# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-10-30T11:05:25Z

Source SHA256: `da1ab39e4b166c9dbb2cf09b37c3d5cadbff53944c74f8fba720003e6d870c77`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `cdff9154eaeee25c8e21423dcc87db8604b66f0c6dd3d48486b3a75912f4e15a`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `c0b2b6fe6fdfab03477d74e0fb8c4f925aa9fe603799d829eb3d633fe0f7fdbe`
- [003 - Change Summary](003-change-summary.md) L14-L30 `60ed90fc1a13162aba46cbf7b10c0e686a3a83a3d78de388052cca1136c4ca66`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L32-L47 `ec8c1f8cf728e9d3cde13cd4bf09a62732a13cf88823460a280ce5159b46cf5a`
- [005 - Executive Summary](005-executive-summary.md) L48-L52 `bb6fb75caa6a3225e6288883cb8c5c5f531194032ef55ea07d18383701620a30`
- [006 - Table of Contents](006-table-of-contents.md) L54-L90 `aab58d88a7c184edf7e02738baba6e7579e2cd6262fb362087e6d06b69ec08c7`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L92-L207 `baf7d2348b7ca69b07f20bc9e66112267ad0208a93a5ccece89db78ee6969166`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L209-L232 `31cfc70ab6d322a4c09dc36dff1f49fcf9d34624ba9246bfb39716248a71f5f1`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L234-L240 `55ea71ccb44de80fb9777907f1eb9b45886f2e1b8a74969a0b22a26f02b48edb`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L242-L291 `74689872fe684f200d24f0eda7c448bffaba9a7e51d84be934e404bba6fed500`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L292-L440 `efd1f612461092095c4c4971041e8e50a4f577a71a3a9efa381d749b7eb274a5`
- [012 - 6. Teach](012-6.-teach.md) L441-L483 `7cdbf4301452ffeff7e2ea0d6e4d233da65f63f3108eaa01f2b07543a49a883d`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L485-L671 `ce4b8745941993dcc77819070e7729d8b37c341ff0466224b6d2ad62d405d2bb`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L672-L964 `ec57c0384c0cbd3662e3eee453e6f994a1a19050b85f58d64d8ff7c766fe201b`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L966-L1008 `fc355264b0a78317f8ea2d4067390bb9015b1d9916b0df3f6080acf91801993a`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L1010-L1080 `c31e1fdc03e1fdeaaecb0025a45dfc2ff4e07f0db5fa2d1d7919251ae621c5cf`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1081-L1258 `bbb88a9cf000ea17de0ff94b54bba0158fe4b8b97ee7f9000f80e2f804d01f75`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1259-L1367 `a6a7d7e8a2482b3ff4e7fd28f060146f2bf832be05ca160eaf2613fd72cbd368`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1368-L1785 `6c2ef231cb2378e3f7b43d5062d2d81c08d9a2e4d67f63719e69c79dd152265b`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1786-L1903 `07494a3d3d80d8a5f0cbb4bf8040f75bf1453b0c0148c533949f2e390af27605`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1904-L1937 `960ab06a244c94524253153ca2e3424642c1dfe589a2154d73e4731da86ec9ff`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1938-L1977 `4d6074f0bb6044e1276380c9f39d9bda65979d5dadf7beb0b435c9e2d2516f71`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1979-L2092 `cfb5922d05b44ab408e5a0e3cfc1e5164cb6cd8914cf0a53438473e3a1ab90fe`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L2093-L2104 `d12a14460a3114f208d1873c0f2ad1ca913768bae5a1c7e42bb3d7473199f8d1`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L2106-L2115 `defcc488ff870bc962b4dcc12122b3b96b69cb2768a89bb421b7572858a65139`
- [026 - 20. References](026-20.-references.md) L2117-L2146 `6c9fe0495ea5a473a88ac1a5c9389304a468b9545f4ca116c7d131f8b522a3ed`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2147-L2165 `e4e8611c609af8a03c3809260252771bd0a802fcb73158d2f8caab1b2ee27288`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2167-L2201 `17457c9c658c20adb16236e457d93e8a11e8991c25a8c840baf10a9c2d96df1c`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2202-L2297 `400f90a56021642b0fa24147427fdcfbdc10559d8d92aaf075699f9f8a4b7d98`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2299-L2352 `25608fe577748afa02e37be69a8453ad4e9248c7b37c5fb60357c23c14eb01bc`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2353-L2359 `220208b4f13151b8dbab6d25a2fb6a3808d7a4214d3ed742bf512aae528502ba`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep)](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2360-L2462 `f9dbe079c0352107e41ddc255c7fd7f2aab13554d00ed2db8f899869a4482f19`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2463-L2599 `2756ec198ae98366d530b668688a0ca76d41d6f274c43c2780bc8a98a840acf9`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2601-L2646 `72b0828ff478ee8d20e28a77f5b11626c5ee90696405030e05dbce2ea56eb307`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2647-L2756 `d0a5d5db7ba7f900a5473dac0a3ca4a6f502bab1ccc23cba3f6adfdc86a3be81`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2758-L2773 `1cd2a9781e2cd4bee8eb1c0902072f5cbc59a137a46a740d2b264bd8eaab0ac5`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2774-L2786 `77c24846bdf1aa6b2663fbec77df26e2397a3e419ff2f4f9d9d95245080205e3`
- [038 - Ledger Compile Addendum - pldg-20260630-001-feature-intake](038-ledger-compile-addendum-pldg-20260630-001-feature-intake.md) L2788-L2856 `299c17e798dc31ffc5ccf469bb3addb386ded5a71658fd8ce3048bb72ef31d48`
- [039 - Ledger Compile Addendum - pldg-20260624-001-provider-updates](039-ledger-compile-addendum-pldg-20260624-001-provider-updates.md) L2858-L3500 `1f6c7e97f7f22dcadffd061f119102c2495046a961f73d7937b36ccc80fe7119`
- [040 - Shared actor-boundary, route payload, and blocked_notice packet](040-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3501-L3521 `11e52cb7db9364ac49f7bca02952eac77971e1edf76b43b1d9f4566f6a503bba`
- [041 - Shared Conversational Actor Runtime Identity](041-shared-conversational-actor-runtime-identity.md) L3523-L3537 `b493fc4588fb7cf94ec4079df66632d1286d8dad2b59a9063efbcda649fecf3c`
- [042 - Chat Route, Permission, and History Behaviors](042-chat-route-permission-and-history-behaviors.md) L3539-L3553 `653f693d99ed87041826dcb0fe8c21cd03bba9416faa9ceac0d3bff9f97aef2a`
- [043 - Owner / Consumer Map](043-owner-consumer-map.md) L3555-L3559 `26effda7ef447a0fb9d582adb26ce48e347340092ec95d5c28d6f31e34b671f3`
- [044 - PlanUnits](044-planunits.md) L3561-L3612 `77e5602bbc7a353b8876e99a885ef9fe1e55d70c9960d3ade6fa2ab0a67102e0`
- [045 - Shared runtime projection addendum (2026-08-13)](045-shared-runtime-projection-addendum-2026-08-13.md) L3614-L22455 `b1bdb0bd0cee43d072c5b6ae7e08fd53bb2ab6915740dba2295b8f48377b71c9`
- [046 - Migration Coverage](046-migration-coverage.md) L22457-L22487 `4944d53502ad66e7afcd6acde12a7203ec13e04eed1c13f65a2f44f04b7991fd`
- [047 - Ledger Compile Addendum - pldg-20260614-001](047-ledger-compile-addendum-pldg-20260614-001.md) L22489-L22577 `87f078b5224e33f0e0caff53dc722740f9b3d31f9fec39edaddd2ce5b3d662c0`
- [048 - Ledger Compile Addendum - pldg-20260615-001](048-ledger-compile-addendum-pldg-20260615-001.md) L22579-L22676 `6ab6e2cbbc59f6b4611fae2e3ad0a3d31a999d1650ceacd813961cd5d5ef69f0`
- [049 - Ledger Compile Addendum - pldg-20260616-001](049-ledger-compile-addendum-pldg-20260616-001.md) L22678-L22996 `2ef8b53eb43d9fa18c47754e578b10ab4b4dc357fb9b0cbdd56d727fe3da2c43`
- [050 - Ledger Compile Addendum - pldg-20260616-002](050-ledger-compile-addendum-pldg-20260616-002.md) L22998-L23065 `571111bda532ec1bdc1ffbf3e035d8cee3bb42e615493debaaea65b6c8fc8624`
- [051 - Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard](051-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md) L23068-L23156 `9d3ba701d66bc217a31f901bdca86fa03c948274948b3c48721ac0048615d103`
- [052 - Ledger Compile Addendum - pldg-20260622-001-fff](052-ledger-compile-addendum-pldg-20260622-001-fff.md) L23158-L23244 `910493412e9aae5949d54a2cb8aa0c38fce8d45950bb5c9c92b367931503c1e3`
- [053 - Ledger Compile Addendum - pldg-20260626-001-feature-name](053-ledger-compile-addendum-pldg-20260626-001-feature-name.md) L23247-L23623 `ddf98b6e0f6091da45e755ca38fc7affcaf04f6e43d56a87f4ab64f83088d0fb`
- [054 - Ledger Compile Addendum - pldg-20260627-001-feature-intake](054-ledger-compile-addendum-pldg-20260627-001-feature-intake.md) L23625-L23836 `2582f9fa1746b72cd539ba25a380c9b2d0a4f196741af021a6d91977a71b4cc9`
- [055 - Ledger Compile Addendum - pldg-20260701-001-feature-intake](055-ledger-compile-addendum-pldg-20260701-001-feature-intake.md) L23838-L23917 `2cc09ffb9d074912bd2db5a94b12f7234f3473b1561b33eaeb217b1025e6623a`
- [056 - Ledger Compile Addendum - pldg-20260703-001-feature-intake](056-ledger-compile-addendum-pldg-20260703-001-feature-intake.md) L23919-L23984 `f92ea1124fbd73e6ee88611f1ef8adbc7336400f37782ed27bd07e3c41da0742`
- [057 - FABLE Residual Chat Mechanics Cleanup Addendum - 2026-07-07](057-fable-residual-chat-mechanics-cleanup-addendum-2026-07-07.md) L23986-L24057 `875ffec44cdf0d4976da9867d5d4a14e0cd93bbee0699d428e94cf72da919d27`
- [058 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](058-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L24059-L24103 `3e79a0aa938adedc39fd1d14402828cf4b30d6a83cc8cf92bfa49476dea13697`
- [059 - Usage GUI Propagation Addendum - 2026-07-09](059-usage-gui-propagation-addendum-2026-07-09.md) L24105-L24181 `17223020378d9f3f8f51486779114bfd8ae1429ba174b35d3f902f94084ea078`
- [060 - PMConcept6 Chat Polish Addendum - 2026-07-16](060-pmconcept6-chat-polish-addendum-2026-07-16.md) L24183-L24415 `97ed7259f174c85e8f0be4e8188204602f84ab1cf7c1a452421693c60b269f78`
- [061 - Immutable conversation restore-point lifecycle - Known-37 completion](061-immutable-conversation-restore-point-lifecycle-known-37-completi.md) L24418-L24435 `098e4975ac5add17e7f6153ae2264914fced775ebd2248094a7a03cd353958f7`
- [062 - PMConcept7 Concept Promotion Addendum - 2026-07-23](062-pmconcept7-concept-promotion-addendum-2026-07-23.md) L24437-L24835 `4fc25eec8cf024713b29ad85a81bd0d0e29df4404926c87e1d3c22e74873b708`
- [063 - PMConcept7 shared Assistant seating and context surfaces addendum - 2026-08-27](063-pmconcept7-shared-assistant-seating-and-context-surfaces-addendu.md) L24837-L24939 `1a82113d9bfe42fcd6c076d363401d01123776cea095cf121aabfd31e7ec16b6`
- [064 - Additive Correction v4 — Consumed Assistant Behaviour (2026-09-03)](064-additive-correction-v4-consumed-assistant-behaviour-2026-09-03.md) L24941-L24989 `ca025b574eb5deb7688b9bbd4872717d1a396041250a0753a6a4f9b9ea80e571`
- [065 - Working Notebook Surface Addendum (2026-09-05)](065-working-notebook-surface-addendum-2026-09-05.md) L24991-L25119 `758f68a3b405f89335248222064c09b0467490d26631cd723ee5f29bfd9e8050`
- [066 - Cumulative v3 Assistant Interaction & Surface Specification (2026-09-07)](066-cumulative-v3-assistant-interaction-surface-specification-2026-0.md) L25121-L25516 `ed95ea2e2f52aa4a7ca055e2556cba03fcef7dcad1ea193c2073b7febadded54`
- [067 - Research decision packet review](067-research-decision-packet-review.md) L25520-L25615 `5f3204c9d9cb4b2e62d07eeae237395b6e5764ed84a946d74298bb65082b8402`
- [068 - Context Lens Source and Preview Reconciliation — 2026-09-10](068-context-lens-source-and-preview-reconciliation-2026-09-10.md) L25617-L25681 `137a8b1f39165adb7d825494bf3c230c7b696ad0932f5a07cee6bdaf947c079e`
- [069 - Compaction completion Event Authority (DL-039 and DL-040)](069-compaction-completion-event-authority-dl-039-and-dl-040.md) L25683-L25736 `64961796ba1ce9e3b791f463abbb925dc63da3b3dda4b2a9382086b9355aaaea`
- [070 - DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)](070-dl-042-historical-todo-event-migration-consumer-boundary-2026-09.md) L25739-L25786 `ba68970048f5621423a993167e07e0a9804ecea8135258e46e9993c4dcff70da`
- [071 - Restore-point created native and historical consumers](071-restore-point-created-native-and-historical-consumers.md) L25789-L25963 `bbb03cab586a5f764b07e5173e45bdf92b70a9f0451bb5d7ff65879a4a0d6a97`
- [072 - Deleted restore-point passive history admission](072-deleted-restore-point-passive-history-admission.md) L25966-L26032 `dbd5a55a60c093878e257a7ab59ace0a23ba633471f38f27e661153bcf4164ed`
- [073 - Expired restore-point passive history admission](073-expired-restore-point-passive-history-admission.md) L26035-L26104 `a9821bb5f23f84bf0e31f56aeee2afb72ec734c8ca951f39ab47ae1fd2fa6efa`
- [074 - External Research Decision Packet Consumer Addendum (2026-09-17)](074-external-research-decision-packet-consumer-addendum-2026-09-17.md) L26106-L26156 `ce2a3eb91ef140660cdbe8e2aa61b1cfb584859d590f610fc7811e7a4f08152a`
- [075 - Chat WOW Turn Presentation Addendum (2026-09-27)](075-chat-wow-turn-presentation-addendum-2026-09-27.md) L26158-L26834 `b0256f016e876baad8f78c46df2b4afbf36103137dac0755c4f6863a353d5b94`
- [076 - Wand Modules Redesign Addendum (2026-09-27)](076-wand-modules-redesign-addendum-2026-09-27.md) L26836-L27565 `0d9c1deeaa920318b9fd1a63540e37aed7672c673caa6d69b3c99f847e88c6fa`
- [077 - Chat Tweaks Addendum (2026-10-08)](077-chat-tweaks-addendum-2026-10-08.md) L27567-L27643 `d9bc28a8b97abfbdab507d8b7cddfa865620c9a3c715d3601e855d3c12ccf6b8`
- [078 - DL-180, DL-181 and DL-185 — What The Chat Opens, Its Column, Its Command Card And The Port (2026-10-09)](078-dl-180-dl-181-and-dl-185-what-the-chat-opens-its-column-its-comm.md) L27645-L28077 `244f24b939ee4d3d89f0131786dacd65255beec66dc4b1f64b053302c23e8756`
- [079 - Grill Me rounds and agreement — DL-218](079-grill-me-rounds-and-agreement-dl-218.md) L28079-L28514 `df3a2baeb234a47ca06f337f3cc1a7e6d3096206c3ba4e3b12796d10db7f382c`
