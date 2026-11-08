# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-11-08T04:20:17Z

Source SHA256: `14c409ee680466ab3acf59da72e5136cf774a1ae160db2aa7ebfe1b61fb707e6`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `d176b5074200f32e4acca8a28adef1d79cc23a2b1a8f12bfca0e64d0dd67ddfc`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `79a41bab6e729ce84231426096e315c7d7f5e2ec10a4231b1afbb41adf4bd12a`
- [003 - Change Summary](003-change-summary.md) L14-L30 `89a553b8f4a8d8d3e38f87d5d6f4cd69c097d024f5d8d16e8abee47902b29154`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L32-L47 `fa9947647f52339d29437e43066808601eb660e7c4931d1d55bb51f30617e684`
- [005 - Executive Summary](005-executive-summary.md) L48-L52 `5f1f312626b9b904f8e3c660c7a7166230bfac21421873d4a83626b03c8e4898`
- [006 - Table of Contents](006-table-of-contents.md) L54-L90 `ac7157711175bdbd0ca717eeba01303c10eb5dcf97d17b350adf312f94995f54`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L92-L207 `05ee6e6e85221304dd3f1f849509abab8f4abfdc61dc56e78852ad7aa58f9797`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L209-L232 `012130b11ac92aa1d0b739cfa95b58b29e432a762f1ca98b1e67d63a77a7cac0`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L234-L240 `945c0e2f24c710feee3a5496f087303bb7b87c61a1d3f8194cfb0c9f47abdfe6`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L242-L291 `aef184d160fd0a39dc8f081112982c84cd78d4b86e3d8828d8f67cd919117323`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L292-L440 `2ecffe1acfe2b10a0c8bbce77d714da3eea944f5a1b313e88bd6577e8f0d6b9a`
- [012 - 6. Teach](012-6.-teach.md) L441-L483 `12382b1f3fbbc797d4ca7b42a7b8db90f983c77ca2dc6f77c851d6e41148c2c2`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L485-L671 `7d8d48b58aac4a8c6c91ce0871d847d3171458803e7e91773f2d66fc35d1be50`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L672-L964 `2b10c16969d82472f2391210db5bd3d851325924aef466b3c67ec49f8ae885a2`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L966-L1008 `2e2c8a7f5daf891755e26e4f912035f13037bd1f301ef955d8e8474af28f4f35`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L1010-L1081 `7097b4e6ee4817a3c3746838cbea33fdeea6c64fa19affe3c182e485ade7881d`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1082-L1259 `642e0710a58c86af6f354e2690c8db1c577b89ff8cc406d82f38fb9b2eea64f1`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1260-L1370 `863bccb36af76f845ac895ee0ce4f9d16b512ee2f51bf94b74d33a077d7c5d88`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1371-L1788 `08e6b981a476a1c8a287990ee6a614c2ee6d9555f827e90d15b7a905072196e1`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1789-L1906 `4287137d8b48fbb4953084335f7567811208082692a599510c249fcc0f9ba15e`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1907-L1940 `2f7953ede5c4474e836b6641671714cef99329b6d707ccbdebcbdb3385bb8e00`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1941-L1980 `aaff5f2599b6d0b6c0fe4edbe1e0db29b8d4dc3d99838c781c4fe68d21c3b7cc`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1982-L2095 `9546a0fac35aa3bf4d2d96427e80dfb22c556afd408795dd3dae5f2170165c9d`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L2096-L2107 `bd7d60400cf612a455d57625e21628376a32312eddebcf16be81fd4acbf4c6e2`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L2109-L2118 `acebfc304255f3fdb976afbada4565f1b2ccc2f4d9262f969cc80556fa6a9d94`
- [026 - 20. References](026-20.-references.md) L2120-L2149 `b7a601ca96543f33c8602e18927c31c2514af9eabb075611014fe57d3d46cef0`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2150-L2168 `a598821a8640a6f950c49c88d4fbeded723a96f03fa0ad5eb3ffa2a0f45381c1`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2170-L2204 `5ca20574a024481c39a322a3bd97b498dcd8c319240d4af05d9113113cdb2cb5`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2205-L2300 `ae69528fc708a2bfde6801696aa88e6834aa8a0014fbecb7315361c6282c4e2a`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2302-L2355 `d4b1bfb543c88bcf78917f8895b890bc4516f55c6ebec4b61d6a3bf5b837e4de`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2356-L2362 `ab25469afd89646f4234228dc45b714aa37226347c953a9674ddc8f116d9eff8`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep)](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2363-L2465 `9105e3d0a842b079e645a9c08adc39a9f812fe7bad7268a8fbf3b8e99851b734`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2466-L2602 `35918b2305478b92b7b0b696c6460e0d11f72106662e8e325cc43d8a9c3dc462`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2604-L2649 `5b62b6dc2723f63df342df1f8020caa0c61c1ab754d0eec0e416b6b22e81b9c4`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2650-L2759 `bb5705049412e1fca04edc3cceb72c6a8e3474afd6ebe54c7499016a7af255d9`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2761-L2776 `2fc5e6082c11f4ffdfba834fd3f7060b63733cb36236058818b686bfd0d81452`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2777-L2789 `66d860e526f5416fe42d0be34b60010ed127dd4adc44eda499b5ca92d04ee41f`
- [038 - Ledger Compile Addendum - pldg-20260630-001-feature-intake](038-ledger-compile-addendum-pldg-20260630-001-feature-intake.md) L2791-L2859 `418b925c9ea54b4d82bf945f2ff35205680d915ab04a098f2752ea12612882e3`
- [039 - Ledger Compile Addendum - pldg-20260624-001-provider-updates](039-ledger-compile-addendum-pldg-20260624-001-provider-updates.md) L2861-L3503 `27176790f7a284b6a02eacb4d4ff580140b607b8ae6af963536947397e3f360f`
- [040 - Shared actor-boundary, route payload, and blocked_notice packet](040-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3504-L3524 `3e893656721da387d175ed78c2bd272efd2bad15fa047c9e6ecc14bcfdbcb807`
- [041 - Shared Conversational Actor Runtime Identity](041-shared-conversational-actor-runtime-identity.md) L3526-L3540 `a027e2bef5086c860cc7f8f0cd6e24fecc6d5192d7a06f8e4168529ad2a842ba`
- [042 - Chat Route, Permission, and History Behaviors](042-chat-route-permission-and-history-behaviors.md) L3542-L3556 `4e632d15cca8df4a9277544e65f2140cd2b47b575878b46dfb7778623ca0e8e0`
- [043 - Owner / Consumer Map](043-owner-consumer-map.md) L3558-L3562 `54c3564162af5f08a794db95df12060d2e4e1b85503ccff0e088329c8ad74185`
- [044 - PlanUnits](044-planunits.md) L3564-L3615 `61e867fb53a43a2f91ad02050ecaa844eab58989a4b889a3077e444dd511347a`
- [045 - Shared runtime projection addendum (2026-08-13)](045-shared-runtime-projection-addendum-2026-08-13.md) L3617-L22624 `51e87626100dd9efe40f1b4d859cba35ac9a4e35c0b2f66b0498d9b3d36f92a2`
- [046 - Migration Coverage](046-migration-coverage.md) L22626-L22656 `8fd8aa2889d66fa1fbe7cc932d39a0afed825c934e034575837dcdc2dc982ce9`
- [047 - Ledger Compile Addendum - pldg-20260614-001](047-ledger-compile-addendum-pldg-20260614-001.md) L22658-L22746 `2e120cd35e263b51d9f5c44f7abbd33ff40e49571b7fc9c46a181a6426cfc7ee`
- [048 - Ledger Compile Addendum - pldg-20260615-001](048-ledger-compile-addendum-pldg-20260615-001.md) L22748-L22845 `e0e441ed59006eab6ee4ee65f462b70ec9c1304d3665e4edef453edc3895e6d6`
- [049 - Ledger Compile Addendum - pldg-20260616-001](049-ledger-compile-addendum-pldg-20260616-001.md) L22847-L23172 `f1651cb2648ef65b94ace784097181f5d5af7b9369a8e9604366bccb7d699916`
- [050 - Ledger Compile Addendum - pldg-20260616-002](050-ledger-compile-addendum-pldg-20260616-002.md) L23174-L23247 `097f2b5a36cf985fed664f3e337628617533e8c8eb6bdd6d8de1f73af03a8465`
- [051 - Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard](051-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md) L23250-L23338 `a303d74faeb2a27d467596de911dd4a6ef4236b13a53adc2e733370fcdc4b47f`
- [052 - Ledger Compile Addendum - pldg-20260622-001-fff](052-ledger-compile-addendum-pldg-20260622-001-fff.md) L23340-L23426 `5b2e8e4d5423e93bd5ddd6a347c491fe069c3c59d6c87c4d572b59cd804b4707`
- [053 - Ledger Compile Addendum - pldg-20260626-001-feature-name](053-ledger-compile-addendum-pldg-20260626-001-feature-name.md) L23429-L23807 `20ed66df6e4545b48d80127e56b44f0adcd91e5f265d72aca77ba21c93600b60`
- [054 - Ledger Compile Addendum - pldg-20260627-001-feature-intake](054-ledger-compile-addendum-pldg-20260627-001-feature-intake.md) L23809-L24020 `dcbcee749dbff19930a0000f87900cf8eb1b22d8962ee7889792970f7d7ba412`
- [055 - Ledger Compile Addendum - pldg-20260701-001-feature-intake](055-ledger-compile-addendum-pldg-20260701-001-feature-intake.md) L24022-L24103 `473e61adbb4aad9d26fb81a61c8157b4e03c983aa8df3f272f6929e088929b17`
- [056 - Ledger Compile Addendum - pldg-20260703-001-feature-intake](056-ledger-compile-addendum-pldg-20260703-001-feature-intake.md) L24105-L24170 `f725ebeda66da4a204fd2c28ec38d459c875e90666e3422e174e73548d9eac3c`
- [057 - FABLE Residual Chat Mechanics Cleanup Addendum - 2026-07-07](057-fable-residual-chat-mechanics-cleanup-addendum-2026-07-07.md) L24172-L24243 `1e6d87518bca73ca930bcdbaf9d5057489ae334ea73f3f71138b4465f716eaa5`
- [058 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](058-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L24245-L24289 `73ec9d73c2aa438410765a4160d195246be3b201ea5911b725abfc6e1e350b35`
- [059 - Usage GUI Propagation Addendum - 2026-07-09](059-usage-gui-propagation-addendum-2026-07-09.md) L24291-L24367 `eef067345107026e8c2dca8ab0838f02c944d4c7c18b380422fb1d673b6f7b88`
- [060 - PMConcept6 Chat Polish Addendum - 2026-07-16](060-pmconcept6-chat-polish-addendum-2026-07-16.md) L24369-L24601 `e7e31fadb037bcb62f98a794ee2277cd660d278ce9b9970e4906595b1508bd6f`
- [061 - Immutable conversation restore-point lifecycle - Known-37 completion](061-immutable-conversation-restore-point-lifecycle-known-37-completi.md) L24604-L24621 `59a273f98b60dc9d38d0650ba590281275757a3f02e6322df0bedb79da2ece39`
- [062 - PMConcept7 Concept Promotion Addendum - 2026-07-23](062-pmconcept7-concept-promotion-addendum-2026-07-23.md) L24623-L25000 `912108eb66888b704370a4b66d433b291578d871ddfd824b34b556440ecaf8f7`
- [063 - PMConcept7 shared Assistant seating and context surfaces addendum - 2026-08-27](063-pmconcept7-shared-assistant-seating-and-context-surfaces-addendu.md) L25002-L25103 `019b00aff6ef3687edc3325b2c155798308931c354f8f13d76b418a341061818`
- [064 - Additive Correction v4 — Consumed Assistant Behaviour (2026-09-03)](064-additive-correction-v4-consumed-assistant-behaviour-2026-09-03.md) L25105-L25153 `8a9b64d293216ec9ac6de2cc9aa4b06c275e9508c2dff280d69b716367842959`
- [065 - Working Notebook Surface Addendum (2026-09-05)](065-working-notebook-surface-addendum-2026-09-05.md) L25155-L25288 `c180066d5cb37d4cb24bb7e76e564c8a94ff6fa8d4c5a754f2c438bf91de6fdb`
- [066 - Cumulative v3 Assistant Interaction & Surface Specification (2026-09-07)](066-cumulative-v3-assistant-interaction-surface-specification-2026-0.md) L25290-L25683 `fcc2e94a6dbf0177f236290d003363556387f8f5a5cadadb22c0fe866539a353`
- [067 - Research decision packet review](067-research-decision-packet-review.md) L25687-L25782 `cf842c9ea1a1bf70f255f8954ef2169dcc9501ed5baf0b5b07c03b6c6a6f39fe`
- [068 - Context Lens Source and Preview Reconciliation — 2026-09-10](068-context-lens-source-and-preview-reconciliation-2026-09-10.md) L25784-L25848 `899f71c060f712ae32b4e106cd4e55501eb12a57bbe7a4f46ca166bdb195ef2a`
- [069 - Compaction completion Event Authority (DL-039 and DL-040)](069-compaction-completion-event-authority-dl-039-and-dl-040.md) L25850-L25914 `7a5b9f22bfa7a4b4d355867bc59df436fc8c4b97da2adce28899fca7df1992d0`
- [070 - DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)](070-dl-042-historical-todo-event-migration-consumer-boundary-2026-09.md) L25917-L25972 `4e0c7d125106deb5f484246f465221bf2a1ebf117be5ba733e738937c9f2feec`
- [071 - Restore-point created native and historical consumers](071-restore-point-created-native-and-historical-consumers.md) L25975-L26150 `8ed4638721ffe7240bf793e2dcc8b0cdbfddb868e2a1d8b07dc6cc62423e722a`
- [072 - Deleted restore-point passive history admission](072-deleted-restore-point-passive-history-admission.md) L26153-L26219 `9d90d954bb58e039d945f51f7f36345a7105ad5418ac4476800b412bd7217783`
- [073 - Expired restore-point passive history admission](073-expired-restore-point-passive-history-admission.md) L26222-L26291 `5fac2e21e621e153f207a710bb9f5fa10b41864181eadd4bff2ca5d3e9af9777`
- [074 - External Research Decision Packet Consumer Addendum (2026-09-17)](074-external-research-decision-packet-consumer-addendum-2026-09-17.md) L26293-L26343 `93c4a6703c6e0efb7a56a75105deb2594fd1e47058638c2d73c013908d2f54f8`
- [075 - Chat WOW Turn Presentation Addendum (2026-09-27)](075-chat-wow-turn-presentation-addendum-2026-09-27.md) L26345-L26990 `de37ce91766adddc3e233d708cbc42d0d3158fa39b6be47dcfdb2e4d44732da1`
- [076 - Wand Modules Redesign Addendum (2026-09-27)](076-wand-modules-redesign-addendum-2026-09-27.md) L26992-L27717 `7e79ae477c40935909215700573fb8a90b65a5663053731b216070df1e6ac5cc`
- [077 - Chat Tweaks Addendum (2026-10-08)](077-chat-tweaks-addendum-2026-10-08.md) L27719-L27795 `eeff3ca9336d055f6564f3319c5f4d5a27bf75e740c30aee56941c15438aae88`
- [078 - DL-180, DL-181 and DL-185 — What The Chat Opens, Its Column, Its Command Card And The Port (2026-10-09)](078-dl-180-dl-181-and-dl-185-what-the-chat-opens-its-column-its-comm.md) L27797-L28286 `2a7ccd89c4f42261b967cfcb05620c16696e465dc66f02e2ad01230be2356136`
- [079 - Grill Me rounds and agreement — DL-218](079-grill-me-rounds-and-agreement-dl-218.md) L28288-L29060 `0d720b0b36e9dd8e3b16e87e23cdf6761f9b15818a09cd100810fa644487fe2f`
- [080 - Command payload definitions (DL-333, 2026-11-05)](080-command-payload-definitions-dl-333-2026-11-05.md) L29062-L31346 `6fe73e9816f63c162a75c1bf79a9a7b8c1d9b65dab843d31fd8d19141607df56`
