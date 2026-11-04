# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-11-04T16:52:04Z

Source SHA256: `dcab438f728b4ce5508085a47c122ce4ad2bce6d9f626904292a1bfc4a5b9fd0`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `7045100605f83057f2bef4a7145c6b400da2df5922aea2e2d845c6ce4702a49d`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `1a5b63a53b120f07c1304d209a5cdde549a3a36763ffbbc0f76644914c6b4b2f`
- [003 - Change Summary](003-change-summary.md) L14-L30 `036134473a40c02fb90e0c7feacf7d7c40e8189a3fb7d1413a9e647233063714`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L32-L47 `0abbccf49e16e25e8f86b582d9ffd28fe22ccd0623573d8b9c6b735e20006717`
- [005 - Executive Summary](005-executive-summary.md) L48-L52 `ad6dac4e7bb6aa1f64d320fb92af654b5464ac8e2966ab02110f97f1fd40f0fe`
- [006 - Table of Contents](006-table-of-contents.md) L54-L90 `83180c0c88b9210b732756665b1c54ef1e08fd82022dfcbadf349be53781af5c`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L92-L207 `40cd7079d580dac986a481f9f751503f7ad82dfaa11fa3f1a2bcfce7942ed8ea`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L209-L232 `b608c2e6cad1bfa3dad94084350a955cfbe9de6363e6d79a37e7555c5dc4eafc`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L234-L240 `02b9d5fd47186995bf19bc8eb1c2ae22889394625cb78a991f3415530fc09169`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L242-L291 `679464882920d7ee9f876c693169152cdc26a55f790fa56cc59bdf968392aa8b`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L292-L440 `649b53d267b6d743dca423e5f1e4586e2425dea7298c98c64a8dbc57dcb6695b`
- [012 - 6. Teach](012-6.-teach.md) L441-L483 `7bddfbfc027b0ea1b54a416a459cdbbf95d2a58f6a973cbaabfeda8ad18f4e92`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L485-L671 `995a3dfd644103c8b74094e57b1b0a56b4044679e3bab7c09223ca3916d034f1`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L672-L964 `3749204929fa34dd6eeca034bd1a83f0822f322c6292a2828d51aedc9ab7fec0`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L966-L1008 `8307b25f538cde3e70cb7afa06f17f53bfcb48e204eb609b515bf5a80c086fc3`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L1010-L1081 `bd8149c9b4b6ce2efeb7d53248e86b40a00b4c952285dbd53e0f92891a651cfd`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1082-L1259 `9b77d39b8b2e060d50be69b435953a180ab5d8f3b6adc9ace1b034960f7cc57b`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1260-L1370 `4a516be02c2419f86e8ae322d4b297ac145fe5551d3c7b1aa79edad536681f0f`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1371-L1788 `d5e495d96a66717bfa12b4ddd81c9f00fda8aa7c9d64b4c705399f4490ddb88d`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1789-L1906 `42e1ba6806aae38c1e8ace831eedf2d1fc228719541cf2f71cc0fc122c1bee75`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1907-L1940 `42cb8005d16d8c048b8d50ba6cc74d3c8c954e25b0674bce2f9b420834702f5a`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1941-L1980 `6ae0e59ca1dc30364ddb2b285abd73af727cb82e9bdd6fc69066f6016f9b85b6`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1982-L2095 `8da04bf372256ab65f19610657c130a77c6951d6659318dedae21916547c6c74`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L2096-L2107 `8cbc51cc150f282510673572f55420f082dfb9c217dbe38ec9bf777ce4521b92`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L2109-L2118 `03967fae1c75545a2af9068a93c79ced9ce1085a1b7383dafd07072921b96e7c`
- [026 - 20. References](026-20.-references.md) L2120-L2149 `0f1a8dfd086ac03a562eca8a49f867acb6e9910e5552612cf1041de1779f5904`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2150-L2168 `f4b5b80bb4c49e85b90db698cba4b9edeec615db071667643b5c179eb1cb51c2`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2170-L2204 `bba5a24bb3ad7a435f924f1830d108c45e959208f92f4d79921732d7b42a2f67`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2205-L2300 `697775fa35a62516a478a4c0ae73372e94dc87525845672092d7081985c8d81a`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2302-L2355 `4a56a1e77e22002a7e7ee9aff6da1d706358520f55c3785f2ea98014588c4ef3`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2356-L2362 `07393617755f07312d9c7f9439afd7a92e60e0adb30849458d8db6582fabd54a`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep)](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2363-L2465 `995fdb2e0fa8cd1f6cb61620a11ab1f068c483304b61045305a3674e23cad3c5`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2466-L2602 `32efb6fa33af223c1897f7568c4e47f7c5d5115db4deb17c34d983eb59715449`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2604-L2649 `eab38391564b7045b0506b44ca352c553cae20a53f696294d2bec9f7a0a65d93`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2650-L2759 `01a0491724518e6b5cfb74e2ece5ca05b6d541f149af99b044f0c76c9e85f91e`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2761-L2776 `a770dc4e8bb93a013aee9dfada1b18073251b3d28af46c562bf41ea3249088eb`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2777-L2789 `b2c38db9a55fc6f9cd748dffd2ad222c7c528e6fb1d579260bf0ce51cc6e6d0f`
- [038 - Ledger Compile Addendum - pldg-20260630-001-feature-intake](038-ledger-compile-addendum-pldg-20260630-001-feature-intake.md) L2791-L2859 `6b534ff3d6ce9548511427667495531607bd1e709d982edcbd23ac94d2306fb5`
- [039 - Ledger Compile Addendum - pldg-20260624-001-provider-updates](039-ledger-compile-addendum-pldg-20260624-001-provider-updates.md) L2861-L3503 `5fe720b1fbb0d8560bb8031c26c84158baa75fb8fc1752bd4cce41f942d70b22`
- [040 - Shared actor-boundary, route payload, and blocked_notice packet](040-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3504-L3524 `510898f2d2c23b4ae80199e475195073f8f531cc47c1f7d35e5634ff5c0568db`
- [041 - Shared Conversational Actor Runtime Identity](041-shared-conversational-actor-runtime-identity.md) L3526-L3540 `b8dad411a7edc2d291261af4bcbce8594362610103d05500282f48257ad58e4a`
- [042 - Chat Route, Permission, and History Behaviors](042-chat-route-permission-and-history-behaviors.md) L3542-L3556 `4acce8a4e9edaa5a20537dfdcab2c38164007b60e820195fd1f734accef9c438`
- [043 - Owner / Consumer Map](043-owner-consumer-map.md) L3558-L3562 `23382060960eb73f89536fa569a07cff38c64f3481de8f7d36011d936babe525`
- [044 - PlanUnits](044-planunits.md) L3564-L3615 `d49cdb7ddc7486fcfa2cc503d9d636571c88112d745a6a96b076147d04d317f5`
- [045 - Shared runtime projection addendum (2026-08-13)](045-shared-runtime-projection-addendum-2026-08-13.md) L3617-L22619 `d5f0b44ffbb3ebb0d8e0c4ae02ccb3e7ed26636ff8e80c397c3870bbcd41b1c8`
- [046 - Migration Coverage](046-migration-coverage.md) L22621-L22651 `6a00f5308c6af0967225e19c95b2604224d451be823bf4ba49eb137736ba5d3d`
- [047 - Ledger Compile Addendum - pldg-20260614-001](047-ledger-compile-addendum-pldg-20260614-001.md) L22653-L22741 `c6f96e1218e6796799f9554356c9a29b867caff63b98311e7a5f0373a21b4d98`
- [048 - Ledger Compile Addendum - pldg-20260615-001](048-ledger-compile-addendum-pldg-20260615-001.md) L22743-L22840 `8b89c8f0070ead614daa116ffcd89eb06573335528702311f02b232c76af3239`
- [049 - Ledger Compile Addendum - pldg-20260616-001](049-ledger-compile-addendum-pldg-20260616-001.md) L22842-L23167 `a0e6eadc676f3ccc42c39fc6c6136538050eed99a37adc846d88bc661e8aa236`
- [050 - Ledger Compile Addendum - pldg-20260616-002](050-ledger-compile-addendum-pldg-20260616-002.md) L23169-L23242 `5b662b27b05fdf1099a8433ca8de6deb2637d0e945395ee6ed0219697e6fb00b`
- [051 - Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard](051-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md) L23245-L23333 `71bf64f589d3b3621c1d363d4b808c25bd12f7de1a2708f9234fcb72255b3089`
- [052 - Ledger Compile Addendum - pldg-20260622-001-fff](052-ledger-compile-addendum-pldg-20260622-001-fff.md) L23335-L23421 `0467fd18fa1ed734d2c455b175a6f7d126cbe989ccd92215ef01505a59afc2d2`
- [053 - Ledger Compile Addendum - pldg-20260626-001-feature-name](053-ledger-compile-addendum-pldg-20260626-001-feature-name.md) L23424-L23800 `54217f6fd08d7de042bead53173095de855269812b6d68e94e962993eb2ec708`
- [054 - Ledger Compile Addendum - pldg-20260627-001-feature-intake](054-ledger-compile-addendum-pldg-20260627-001-feature-intake.md) L23802-L24013 `f867300d4008d73a9d8d959bf7b27e0e3c778f37e23d943cb877b52b15ea5a2b`
- [055 - Ledger Compile Addendum - pldg-20260701-001-feature-intake](055-ledger-compile-addendum-pldg-20260701-001-feature-intake.md) L24015-L24094 `831cfd27e91c15cf28dacfa9f7a6265b2ac6849dccd52a781d5147835f396c05`
- [056 - Ledger Compile Addendum - pldg-20260703-001-feature-intake](056-ledger-compile-addendum-pldg-20260703-001-feature-intake.md) L24096-L24161 `9d823d6a6d975d715ebd7654ebebc4e187860c599a0fd686c407d89aa6708fc7`
- [057 - FABLE Residual Chat Mechanics Cleanup Addendum - 2026-07-07](057-fable-residual-chat-mechanics-cleanup-addendum-2026-07-07.md) L24163-L24234 `b19d7505969030a9d8ff48d99d2f1ba0705777d0eaa3a2e1cfaeb959c573f768`
- [058 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](058-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L24236-L24280 `28d95f99420036bb6699adaa969b35e5db2fe35f8c322c4d38cc7fa63457929f`
- [059 - Usage GUI Propagation Addendum - 2026-07-09](059-usage-gui-propagation-addendum-2026-07-09.md) L24282-L24358 `8928cd186e1e040156ecc6951a7b133485033da999f5199266d8aa0e781b40ec`
- [060 - PMConcept6 Chat Polish Addendum - 2026-07-16](060-pmconcept6-chat-polish-addendum-2026-07-16.md) L24360-L24592 `69ab14eebb8132e9d2c6b1d330cd67ef70d35fcf6f5f85b646aff6fd0f806a97`
- [061 - Immutable conversation restore-point lifecycle - Known-37 completion](061-immutable-conversation-restore-point-lifecycle-known-37-completi.md) L24595-L24612 `fbcf7a52b391eff1182ba0ecd61c25a5b4d9afb582a09ded8f7780f5e860b7d7`
- [062 - PMConcept7 Concept Promotion Addendum - 2026-07-23](062-pmconcept7-concept-promotion-addendum-2026-07-23.md) L24614-L25012 `35d092167d5a5703fa3e029d49428f8d0b4c2641ace3af344f1c7101356f15e4`
- [063 - PMConcept7 shared Assistant seating and context surfaces addendum - 2026-08-27](063-pmconcept7-shared-assistant-seating-and-context-surfaces-addendu.md) L25014-L25116 `6c01f8ef3e1855d2562dbdf59dae6ee2d49295cb0adddbddd9388e68646a1d62`
- [064 - Additive Correction v4 — Consumed Assistant Behaviour (2026-09-03)](064-additive-correction-v4-consumed-assistant-behaviour-2026-09-03.md) L25118-L25166 `30f86f32a709a5fedac1d71cc6e89e38f9795cac97aeeedab939e6b0122079e3`
- [065 - Working Notebook Surface Addendum (2026-09-05)](065-working-notebook-surface-addendum-2026-09-05.md) L25168-L25301 `a7e6f415fbe2db0c90509e9b24bbc2a7dd7bf91de17924d678c22f2ebdc5b3fd`
- [066 - Cumulative v3 Assistant Interaction & Surface Specification (2026-09-07)](066-cumulative-v3-assistant-interaction-surface-specification-2026-0.md) L25303-L25698 `68eaee611a11bede503a0245b4e8d738e370a660687e8fd1034a3992011ff883`
- [067 - Research decision packet review](067-research-decision-packet-review.md) L25702-L25797 `58e3e0428808f95fb81eb2be53cf43bbfc82bb603fda43047fb9170023daf05b`
- [068 - Context Lens Source and Preview Reconciliation — 2026-09-10](068-context-lens-source-and-preview-reconciliation-2026-09-10.md) L25799-L25863 `fddbf3f98a68c7164829157aa8d2c397a975e9a614685907a26196ac8acf7f72`
- [069 - Compaction completion Event Authority (DL-039 and DL-040)](069-compaction-completion-event-authority-dl-039-and-dl-040.md) L25865-L25928 `5a989759ec6a0eb33ee2e3afa5461fd18e12fd448e82058af6b04f939897cc8f`
- [070 - DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)](070-dl-042-historical-todo-event-migration-consumer-boundary-2026-09.md) L25931-L25986 `e0fb0a550185024fc5a731ff31bf204a7f384ca50f8d59890c4c1b4c3b621439`
- [071 - Restore-point created native and historical consumers](071-restore-point-created-native-and-historical-consumers.md) L25989-L26164 `5d5439d74603de0384e58917330062730d3e2285b96e0aad6e4b1feb1328c33c`
- [072 - Deleted restore-point passive history admission](072-deleted-restore-point-passive-history-admission.md) L26167-L26233 `9d62780374587bdf80b7852028e174e239216a47106df963105c7bb76930dc34`
- [073 - Expired restore-point passive history admission](073-expired-restore-point-passive-history-admission.md) L26236-L26305 `93abfcc10944f0e08ed97021fabd9c4567a4cc101a9db542e9dcbe667347a75d`
- [074 - External Research Decision Packet Consumer Addendum (2026-09-17)](074-external-research-decision-packet-consumer-addendum-2026-09-17.md) L26307-L26357 `e55daf5f2e26b26eb90dd2d6139b5951dbe534b05dfc0875635f9893dcdeb038`
- [075 - Chat WOW Turn Presentation Addendum (2026-09-27)](075-chat-wow-turn-presentation-addendum-2026-09-27.md) L26359-L27006 `248badb56a4ec37a0785575b0701867ab9f3b5fd298784108b893b086d8b3cf5`
- [076 - Wand Modules Redesign Addendum (2026-09-27)](076-wand-modules-redesign-addendum-2026-09-27.md) L27008-L27731 `2a3fa5566e927375b8ecfe309255dd4b54e62f95a18a4f527179f2fe4916fbe7`
- [077 - Chat Tweaks Addendum (2026-10-08)](077-chat-tweaks-addendum-2026-10-08.md) L27733-L27809 `5d4141aae804fa5858a621c7e64fcdae88f33574b8b4aac02177e835ac851263`
- [078 - DL-180, DL-181 and DL-185 — What The Chat Opens, Its Column, Its Command Card And The Port (2026-10-09)](078-dl-180-dl-181-and-dl-185-what-the-chat-opens-its-column-its-comm.md) L27811-L28300 `f826f48d2540ad005374c56e8a6028075458d85a091dd960a0d83a076e16c878`
- [079 - Grill Me rounds and agreement — DL-218](079-grill-me-rounds-and-agreement-dl-218.md) L28302-L29076 `a1d8baf19da0f0463a4ad5dee9e8d4e2a0bcf9bf0e4edd609adc7f5dec3f6c20`
