# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-10-20T23:28:45Z

Source SHA256: `8f058ecc712db40eff989a6e1ed36e4edafaf178be272eb68138c34cad4297d8`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `931932613cc97e8fae95e61714a0cfe27a9c28834dee72e23b57644fd5543027`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `e9681344dd7951820d40f7b81bfdac57a526476515285cca4c99341662cd1294`
- [003 - Change Summary](003-change-summary.md) L14-L30 `1a25fbcfe8db522dd542b4213ac66b680a7dfa0704d4bb561e0867819db03080`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L32-L47 `5bb33a97a557c44d2a9f12a0925631f5b35dbb4d0fa9be4208dcdacf23775cd8`
- [005 - Executive Summary](005-executive-summary.md) L48-L52 `eac6fbf5c3c62f85874f6a26e65219fbf0e30c1062fda2e45b732a8d460bec1a`
- [006 - Table of Contents](006-table-of-contents.md) L54-L90 `545bcca4e9f8038f34f64d4e9142053c964e4acb9edc65dd812793e4febc2f8f`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L92-L207 `235ba8450891bcc3b9c336d002ad585552b4c0938a0bd36d413f96533e525258`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L209-L232 `26cafb2251ae81a299725c887b42d200c9ca39d4553a0f981c24e29fc0d5956c`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L234-L240 `3098907406fb14214689a7d0b8266df1c2ab4d2e359c0153161a84bb68897483`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L242-L291 `fdba5a353f50ea4fe84bba375c17f5b32b4ac56beb55c23a627a977969ba4aba`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L292-L440 `366ba6809ad3e1377575115a2ab3ee4b48b540ce4b13f78efc34a8c5a0ad234b`
- [012 - 6. Teach](012-6.-teach.md) L441-L483 `231e4d2d07971f983c6f84412a0497e163ee92b0fe0e585c7867a23f59b758b8`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L485-L671 `a2108e99ffa6c2a9e3864aa8c3f6b8f42bee0aa24a662cdca6ea69c3a061c160`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L672-L964 `11219f1b49bcb8dd721a0278629c130cc4b5217b6dc5d1513a82bf53eca009d0`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L966-L1008 `469708f686df6fb4096b84747ac1b0acca603727974b1175222f36776c0e4af0`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L1010-L1080 `fa70cb1e26675d865d8518bd117aae7fecd2d13f705a74ee0d4dd6cf6adc877e`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1081-L1258 `83e0bb6aff4b9683b37cdd4d9c33d01e56ef7e7c61fc2410d9399735700a4ba7`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1259-L1367 `e6f6b38e0cd23c45d1f0069edec89a61b4f57f98ebe30c9cf5be26be5e7e8e95`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1368-L1785 `bf57d693b85add0b903c47e3a7b950f282c95c6974082ecf3b55fc183a9dfdfd`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1786-L1903 `8a9d2a33a2280fd848c56916a99a3a3ed747d30897ac0096e641ec1a7603b8d0`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1904-L1937 `d1a138a287feff979f17679f4af5ba5f5cdcbccb499c8b68c7895deb0a7ad002`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1938-L1977 `05a4145a59ee886ee580a669635379711342b5ada1281f2b5a40e8e7a8a62740`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1979-L2092 `011dca013ccaab579470d3515d6c8b59940bd6606c28dc62dc5c4eea728b14cf`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L2093-L2104 `abdb7ef33c09f37c561077b8f1ec37f8b63e6af949c7496c5cd652f70537b8db`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L2106-L2115 `549a738f637c87749cc1fb67e091c849ecbfa22cf646ec3133a2c44081425bef`
- [026 - 20. References](026-20.-references.md) L2117-L2146 `8841941c3ab8376a55085dd23a62da990cb0045cbb63feca53b5072d66b0f595`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2147-L2165 `5aa327fb93c64863716a96e5b492896606b7bae9cb74e48c9c34a666df055e48`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2167-L2201 `845b26702146dfe0fbe979da3a88747085c28b1a792a06aedef3137521b160dc`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2202-L2297 `d8cedef30b36b168f0862209e4b8a6fa81ff5f757f4f497986debed7e2e4e618`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2299-L2352 `8f3a4222e23e192c448ab13567694ac2f82ab5f181df89ab2879000004b00367`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2353-L2359 `2dce56dd2c8ed7bfbe11454f6b34663b791c56706e99216166a0b0e7634b0693`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep)](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2360-L2462 `b599ef9c74d732b8c1d5c1ee7dddc227d2410c33f4f67dd594a2816fd403dbeb`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2463-L2599 `b43971512edccf3b6f330cb4dfd94ee8d89957da7ee0c4e5afaf7e5b922c3ad4`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2601-L2646 `f3ca2f74330d1e7e5f3d5f10e5fcc0de0058b71d5bec817fefd5a8a639f5dc2f`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2647-L2756 `e747f742a20965eacf927177c235262a7de89fc5665788765c0841a6ba8a5dea`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2758-L2773 `a24a11d37957dd42650f1280ca3ffdf3bbdc90c37ef57d8ea30382d667672242`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2774-L2786 `eef5aad14091c5b0828b3df24fe6715dd3f522f4c3617438751402d188b39f91`
- [038 - Ledger Compile Addendum - pldg-20260630-001-feature-intake](038-ledger-compile-addendum-pldg-20260630-001-feature-intake.md) L2788-L2856 `9024389249c32ae86dfdcdaed2468ab4d72c60467784703dc9985ce527e1676c`
- [039 - Ledger Compile Addendum - pldg-20260624-001-provider-updates](039-ledger-compile-addendum-pldg-20260624-001-provider-updates.md) L2858-L3500 `8e8eeb381f012a4ae99acc8c02eb15632315a5152a92e1eddadac9c0ea514fca`
- [040 - Shared actor-boundary, route payload, and blocked_notice packet](040-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3501-L3521 `77fd883b22b9dc2e10b58ef2ac4fa6e3b4b1d0485837905b8bd89cd1f9096238`
- [041 - Shared Conversational Actor Runtime Identity](041-shared-conversational-actor-runtime-identity.md) L3523-L3537 `7249f102ab79c0e27188368645bff9c26a96644f35c59c50ce3efc996bb17c23`
- [042 - Chat Route, Permission, and History Behaviors](042-chat-route-permission-and-history-behaviors.md) L3539-L3553 `9249d3559ce10f9eb5223db46e3b47fc0670ace2f2a261c015ac1aec9ee41641`
- [043 - Owner / Consumer Map](043-owner-consumer-map.md) L3555-L3559 `af7c7b897e79cd58d04505f616ca03393b4b0e8f2a060af85383de3087866c31`
- [044 - PlanUnits](044-planunits.md) L3561-L3612 `3384e19749701691ce024ef1109cdeb6e79bb73a0188978c43e4e0a68187f686`
- [045 - Shared runtime projection addendum (2026-08-13)](045-shared-runtime-projection-addendum-2026-08-13.md) L3614-L22417 `badbc20f63246b5be43e1d22476438024bcabc10e81846735c9f1f8f927ceeac`
- [046 - Migration Coverage](046-migration-coverage.md) L22419-L22449 `ada418fdb2ead2a8336747cab9430d1974b1442678e82814780a27637e64f91c`
- [047 - Ledger Compile Addendum - pldg-20260614-001](047-ledger-compile-addendum-pldg-20260614-001.md) L22451-L22539 `ab8ac3b47a3ecea48ee4ccc7cdf1bfe82eb4853d55405f971cd30c258bba1666`
- [048 - Ledger Compile Addendum - pldg-20260615-001](048-ledger-compile-addendum-pldg-20260615-001.md) L22541-L22638 `e52afc30165e54745da618ba6385b6be24b1fba6185dfc91195361401be535bf`
- [049 - Ledger Compile Addendum - pldg-20260616-001](049-ledger-compile-addendum-pldg-20260616-001.md) L22640-L22958 `7fd4dbdd4815d0c226142452a61e822a9b8caf97bda6dec1425276e57bf1bd52`
- [050 - Ledger Compile Addendum - pldg-20260616-002](050-ledger-compile-addendum-pldg-20260616-002.md) L22960-L23027 `2f806c83a103ff612732c9ac6b67d097eb57fa47088390d1b0a4ec8ec87a7ae6`
- [051 - Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard](051-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md) L23030-L23118 `1a9ef209d123452bef4d3e5a09414ea88c48afc4c28681f76103e4fe8ef42ba2`
- [052 - Ledger Compile Addendum - pldg-20260622-001-fff](052-ledger-compile-addendum-pldg-20260622-001-fff.md) L23120-L23206 `6194040d2355d68ec405e9378521fc2b8a26f41c4e36b276d4fd74b2557ebb17`
- [053 - Ledger Compile Addendum - pldg-20260626-001-feature-name](053-ledger-compile-addendum-pldg-20260626-001-feature-name.md) L23209-L23585 `f85ffceb7d1e328d6c69f43018720d6b1f0090c908bec5fd02d4b97d3da809fe`
- [054 - Ledger Compile Addendum - pldg-20260627-001-feature-intake](054-ledger-compile-addendum-pldg-20260627-001-feature-intake.md) L23587-L23798 `4a0d5feeed26e13ab58a477955e7f1f863d551132f314a343c90830a2aa24455`
- [055 - Ledger Compile Addendum - pldg-20260701-001-feature-intake](055-ledger-compile-addendum-pldg-20260701-001-feature-intake.md) L23800-L23879 `dae4180a9c754552208364e260ea799e0c2eb4f164f97ae0a208bf7bc0fb4e1d`
- [056 - Ledger Compile Addendum - pldg-20260703-001-feature-intake](056-ledger-compile-addendum-pldg-20260703-001-feature-intake.md) L23881-L23946 `18f8a5781ccec5ba17d854b54f0f0ce0c2ec1e618e27fb91ef7b06f11725abd0`
- [057 - FABLE Residual Chat Mechanics Cleanup Addendum - 2026-07-07](057-fable-residual-chat-mechanics-cleanup-addendum-2026-07-07.md) L23948-L24019 `126c94f04bc0670c58dedce3b5eb0f20c2caa5f02ee3c78b6f69b6644d610fb6`
- [058 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](058-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L24021-L24065 `ee9676742cfc0dde1302c7499773a3c9812cae955a0c304fe231b47190add5d8`
- [059 - Usage GUI Propagation Addendum - 2026-07-09](059-usage-gui-propagation-addendum-2026-07-09.md) L24067-L24143 `2d8943a74c7775b88e3b76e1d9fab1a430e8ea73823f0099369a5b4e124f3a3b`
- [060 - PMConcept6 Chat Polish Addendum - 2026-07-16](060-pmconcept6-chat-polish-addendum-2026-07-16.md) L24145-L24377 `34084b6ee2c6d3333181a46a7b15e8bad0f2f41b26bc80c6ea09b0147cb3b4d6`
- [061 - Immutable conversation restore-point lifecycle - Known-37 completion](061-immutable-conversation-restore-point-lifecycle-known-37-completi.md) L24380-L24397 `f3f494ae690648da8b2ac94ad6668fad4238f18c65bb74580e6f551b41ccbe30`
- [062 - PMConcept7 Concept Promotion Addendum - 2026-07-23](062-pmconcept7-concept-promotion-addendum-2026-07-23.md) L24399-L24783 `0bb454eabc4e6a12d96f68960826f7b89d2b227e230a3e1b974db7308f94fd72`
- [063 - PMConcept7 shared Assistant seating and context surfaces addendum - 2026-08-27](063-pmconcept7-shared-assistant-seating-and-context-surfaces-addendu.md) L24785-L24887 `4d5cb6a6fd8c4fc2f1b9f2083e4e60cda8f17290d4d9ce232b65eac2d6a2cc02`
- [064 - Additive Correction v4 — Consumed Assistant Behaviour (2026-09-03)](064-additive-correction-v4-consumed-assistant-behaviour-2026-09-03.md) L24889-L24937 `a5bad82b5aff61dc6879afbc0ca71bb6b049cd2ace166810c5e3336a5bebc866`
- [065 - Working Notebook Surface Addendum (2026-09-05)](065-working-notebook-surface-addendum-2026-09-05.md) L24939-L25047 `7475dfa7502126722e65559654228e56f6e4a53f3a9254c01faed832a9684f19`
- [066 - Cumulative v3 Assistant Interaction & Surface Specification (2026-09-07)](066-cumulative-v3-assistant-interaction-surface-specification-2026-0.md) L25049-L25418 `e380567ffb35667e20ff3ac112050139e08c792daa103e9d8628b077c23514b6`
- [067 - Research decision packet review](067-research-decision-packet-review.md) L25422-L25517 `29cc98a908354dc407ed101211d5fa11a682e7cfb663e03fb8c260cdf752d136`
- [068 - Context Lens Source and Preview Reconciliation — 2026-09-10](068-context-lens-source-and-preview-reconciliation-2026-09-10.md) L25519-L25583 `92167ed9088653d99803a8d1599018670d7f3df09d4518ea346828fcc3338a83`
- [069 - Compaction completion Event Authority (DL-039 and DL-040)](069-compaction-completion-event-authority-dl-039-and-dl-040.md) L25585-L25638 `fbd2a8d021fa4c7ea9dfbec66e35f979e3f66cdee15f41aa16b8716482345e9c`
- [070 - DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)](070-dl-042-historical-todo-event-migration-consumer-boundary-2026-09.md) L25641-L25688 `59add06097b79cdb1b44a3323d56fbbe4d8057983f399658185077ed35213575`
- [071 - Restore-point created native and historical consumers](071-restore-point-created-native-and-historical-consumers.md) L25691-L25865 `8915f85fc3e13690ac87f7d4797ace059087e62464edd3c98fa0a31e382a2bb5`
- [072 - Deleted restore-point passive history admission](072-deleted-restore-point-passive-history-admission.md) L25868-L25934 `eedd24dbb4f58a27ef79fa817a41c3bec3a7da9134ac722472b18a79a5ee2a25`
- [073 - Expired restore-point passive history admission](073-expired-restore-point-passive-history-admission.md) L25937-L26006 `be64ba52fdf8c97080df8d2978a31b456e0a79f056c6e7d941f14e8d603aea53`
- [074 - External Research Decision Packet Consumer Addendum (2026-09-17)](074-external-research-decision-packet-consumer-addendum-2026-09-17.md) L26008-L26058 `3450fad93a8472279378a69cbbdb3ef3e0fc332015f9dc4968fa1f5a26487813`
- [075 - Chat WOW Turn Presentation Addendum (2026-09-27)](075-chat-wow-turn-presentation-addendum-2026-09-27.md) L26060-L26712 `52ac7843691bc124d5fabcb623c2f46a767e37c791baff2057e221847c69ba75`
- [076 - Wand Modules Redesign Addendum (2026-09-27)](076-wand-modules-redesign-addendum-2026-09-27.md) L26714-L27419 `760ab5cd3a679c6f8eafcf69beebf2cad33530d4877699e4c1455a3832206ad5`
- [077 - Chat Tweaks Addendum (2026-10-08)](077-chat-tweaks-addendum-2026-10-08.md) L27421-L27497 `ba15e47e3689e16cc7f7198e355ee8762d8c8613e7d4560c8edde9ec575e05a6`
- [078 - DL-180, DL-181 and DL-185 — What The Chat Opens, Its Column, Its Command Card And The Port (2026-10-09)](078-dl-180-dl-181-and-dl-185-what-the-chat-opens-its-column-its-comm.md) L27499-L27906 `7b28f67e7d2a2ae7ca2e3e66d7cf17ffc993ff46d6e7c52ae013b0295b3ec8a5`
- [079 - Grill Me rounds and agreement — DL-218](079-grill-me-rounds-and-agreement-dl-218.md) L27908-L28000 `8bd2da581a5194110dd51c2e345faa88808ca375325187043c5ed1c341493939`
