# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-10-20T22:33:14Z

Source SHA256: `33007fdf581501ae7446911d56da60472bf8b258082eb909d624d6bc7b0b398c`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `7b149c4648d539a62ccc360bece4db46a8c219f1032e12ae17d20bfdaef1e1d3`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `866495d3a0d836161331e740f5b052175bfc39ec198d02e95362497b6628eb80`
- [003 - Change Summary](003-change-summary.md) L14-L30 `281ae5f9102b023472e0f9c39ea9abba342b7b5f4b1a1f194a5bd84276ed3fdf`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L32-L47 `065efe66b2b3656f775c8beaaddc3437109af24b5a6d3550d56e804228a98d1e`
- [005 - Executive Summary](005-executive-summary.md) L48-L52 `0d59db8083fff9c2d14fde8fa5c8d7b2b1b9da2cc9c4440db7b3bf4aaf6c67ea`
- [006 - Table of Contents](006-table-of-contents.md) L54-L90 `abc208f8b0bb26cf07b2af68134a3dacae8d810be1e2a10f270db10e15901352`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L92-L207 `6458a25e5d2ec2b56d3d69d5e4598ee8d1e924a3df63e9a5d9465b690deb74d1`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L209-L232 `aa7a96d78502bd28c08a2c2eb129c17874890996083f05b911408ac371ae19a0`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L234-L240 `d26d5878824d497eac7b1274790116c35a4b0fd6ef00e6939c202ed99474254c`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L242-L291 `89ba4104319db852f199f719c21cc11b35e34e3fd6507ac672f72d59fe7cf31a`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L292-L440 `d42bf4192b67a8615fe23b81f29b5cbe6f5d1f9d3280d2cd0651fca0bf1414b6`
- [012 - 6. Teach](012-6.-teach.md) L441-L483 `6c6c63ef7f53464e4859248f7fd00d613eaf21fe8cc41986a2bffabef152fd94`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L485-L671 `6597ff3d0cde06fcdff2600db299d2a06a00fb016400a6701bfdda17aa5d8d43`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L672-L964 `4350817882a4d4d9fd5b88f2017157a50fbd063c4c9e07ef0e27f285b759e7ea`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L966-L1008 `84a9d176b76885b78e9a23629fcec79c08049a99ed63da7a496429b6e488f729`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L1010-L1080 `bde475ce50189b25a4686e1b4e9b2adebe4cb5d1d7d321e36621f2754f1ae09b`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1081-L1258 `abfe7c74cb30bc50d9364af3bacab3a1d96fe9dae67735d4fe4b296e9eb70523`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1259-L1367 `ef52bfb4821de8e8cc4705acf90d66965a40c61aef4261e82c771f19ea3f3f3c`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1368-L1785 `f7bc1f837c00ae4873d8da784206dbf43eb225d292a5e5fb9db0288a6749bdb3`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1786-L1903 `e3a1c8dcedf0cf62a6c569bb753311fff1e51966a19e1f0ee6352d23b4275306`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1904-L1937 `95e93b3c9e223d58102af86405faf6fdf7c29db28f5ef0dfcc9f0ca2a30dcc37`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1938-L1977 `bbc77638639c6f5b1f5a9a727e702b8b775db340a993214e74e839022904da7b`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1979-L2092 `6df3b52648494cc9ba6a95a73767fa3fa0741b925c237448226a6fe2a5c8cb10`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L2093-L2104 `5add50d3ba06a27d7f21b9c43213e47a226d10b448e85cab72a55f36562bd4bb`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L2106-L2115 `a6d02be52b315ecdcc7b1c66c428b6b04b4dfcffee06aecbebfd7853b42df457`
- [026 - 20. References](026-20.-references.md) L2117-L2146 `03e816796da5d965b6dd9b8e885c44743c840316e39d1c191c8eba8867afaad8`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2147-L2165 `d4e2200d564bf4a5a681e4f7beea2d852665707aba3ffb4d8bc3059f6a9da8a4`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2167-L2201 `77dbadfbb393de0dfce256d1e1e0268df8eac0582a0fcbc005feff1ff18f0f0e`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2202-L2297 `19590ed416284fd90377923c155afddac2f058a6585caf23831f23b6b01b07f4`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2299-L2352 `8a8dfca305fe9f03e3e047b65445b575f34b62b674591656cc968a7955218410`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2353-L2359 `793ea5619593762f5f6f20b36f5cb10255715cd2e08156d7994c90780d4edc59`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep)](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2360-L2462 `d606f45bec566237bef23fceb25979dea1a0679aa0e4e43e751d4e629c2d38e6`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2463-L2599 `a213d6933c1b8f892e6502ccbf1a86d4159f53f52834964341684bcc72e90b20`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2601-L2646 `ace98c8a3ed692aabfd98d856f86a3ae62292ab2b9e74085169af9d4ae11375f`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2647-L2756 `db6983d610a9bb9f613402073696bca187657457d703625aca2f15b1117e45a0`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2758-L2773 `f3b880d8f0e5d09e5c6922b53e11d15af01f2d7b56e69e8ce60d0c0e73df08a0`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2774-L2786 `cefd7ec85538e0e3e4c4f14d9eab5a2bb57ce7b81bc54e7378217f5b59b06327`
- [038 - Ledger Compile Addendum - pldg-20260630-001-feature-intake](038-ledger-compile-addendum-pldg-20260630-001-feature-intake.md) L2788-L2856 `d93af82269eb16b52de770b6ae0267574df902868682260c30f6ffcff6ba64d0`
- [039 - Ledger Compile Addendum - pldg-20260624-001-provider-updates](039-ledger-compile-addendum-pldg-20260624-001-provider-updates.md) L2858-L3500 `096e2ee7698fdc4d45e7c63f1cf1d08c4fc051a479d759fbd85a836bb64f6cb0`
- [040 - Shared actor-boundary, route payload, and blocked_notice packet](040-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3501-L3521 `4e7c8fff9714d4b500a51c682a9f43abb0e06a51fe42a4f541e1fae49f778f93`
- [041 - Shared Conversational Actor Runtime Identity](041-shared-conversational-actor-runtime-identity.md) L3523-L3537 `5e4de530ae813adc808ba02184f5ccdfaafe197a3f174756aaba1df06d2fa3f3`
- [042 - Chat Route, Permission, and History Behaviors](042-chat-route-permission-and-history-behaviors.md) L3539-L3553 `68ad3a116c25d51816721a0440c9701b93a7d13bab6d702f7cfbffc3e45b3078`
- [043 - Owner / Consumer Map](043-owner-consumer-map.md) L3555-L3559 `4081301a6b09321acad6247f34327f9155d12699aa5e807d4c3a655b53cfa295`
- [044 - PlanUnits](044-planunits.md) L3561-L3612 `302495ccffcaadbceb4f4a2bef06d6ffcf6db6a6150faa8f187dab9c0c71f514`
- [045 - Shared runtime projection addendum (2026-08-13)](045-shared-runtime-projection-addendum-2026-08-13.md) L3614-L22417 `05a782ebd3a43ed126e1d5e6231700c82df4cf8bc15ecde57365ee9915a65eaf`
- [046 - Migration Coverage](046-migration-coverage.md) L22419-L22449 `ca76019ab9f8c9e17e92c700a0c777817448ab3b88237058a9fb6d03129ae3c4`
- [047 - Ledger Compile Addendum - pldg-20260614-001](047-ledger-compile-addendum-pldg-20260614-001.md) L22451-L22539 `1f0f6cad923b7351001ae7dbe6d3de429fa5c729c9d2050661e9ab98bf3578e9`
- [048 - Ledger Compile Addendum - pldg-20260615-001](048-ledger-compile-addendum-pldg-20260615-001.md) L22541-L22638 `e4d13c36cf32d1f0b11961c308d21cdeb452f85f0f53062a8e250a5e8044bf16`
- [049 - Ledger Compile Addendum - pldg-20260616-001](049-ledger-compile-addendum-pldg-20260616-001.md) L22640-L22958 `527ab8265f819df6006a0a28fbfb25f214bcce44e73083ef8d9f03247edcc6c4`
- [050 - Ledger Compile Addendum - pldg-20260616-002](050-ledger-compile-addendum-pldg-20260616-002.md) L22960-L23027 `a14096da6cd2b572557eb3ad693aadaf16260e516fb752731ff8120b08ec109a`
- [051 - Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard](051-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md) L23030-L23118 `ed8b6df62598670c3635d4e048bc531c541ef3e55181d80885abef771baac60a`
- [052 - Ledger Compile Addendum - pldg-20260622-001-fff](052-ledger-compile-addendum-pldg-20260622-001-fff.md) L23120-L23206 `9994de5d20e2f228791b31ca0d3779519158cbb8f667b86655d7f60ae55e6563`
- [053 - Ledger Compile Addendum - pldg-20260626-001-feature-name](053-ledger-compile-addendum-pldg-20260626-001-feature-name.md) L23209-L23585 `fff2e0af2a1b946a259c79bf8a0e31a9a06109dcc92efb313f0e33d34a306700`
- [054 - Ledger Compile Addendum - pldg-20260627-001-feature-intake](054-ledger-compile-addendum-pldg-20260627-001-feature-intake.md) L23587-L23798 `f044632836df5ee890e21317445c4b431afba0a8d3560aa55e9d77b443e41784`
- [055 - Ledger Compile Addendum - pldg-20260701-001-feature-intake](055-ledger-compile-addendum-pldg-20260701-001-feature-intake.md) L23800-L23879 `50199d2f5b594dd5c78b36c78d125cfd699022a79068734b1f826e107d586227`
- [056 - Ledger Compile Addendum - pldg-20260703-001-feature-intake](056-ledger-compile-addendum-pldg-20260703-001-feature-intake.md) L23881-L23946 `e8536b85c61848afc9a2f5b64ebefed07478c42a5d161d285bb2269eebf6cc18`
- [057 - FABLE Residual Chat Mechanics Cleanup Addendum - 2026-07-07](057-fable-residual-chat-mechanics-cleanup-addendum-2026-07-07.md) L23948-L24019 `f577d729583b3f7d9923289caa3784b20fb7be27fa29a75209c545a01d8b0a09`
- [058 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](058-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L24021-L24065 `d46ef69c7b9bcd44e938202428a6eb0215f90fcb7835d052d063738b3ceea15d`
- [059 - Usage GUI Propagation Addendum - 2026-07-09](059-usage-gui-propagation-addendum-2026-07-09.md) L24067-L24143 `50e26792133dd0dbdcbcb1de2a593195969ad693c1f57b440cf26e5e9d568890`
- [060 - PMConcept6 Chat Polish Addendum - 2026-07-16](060-pmconcept6-chat-polish-addendum-2026-07-16.md) L24145-L24377 `9a8b3edc702a567b9ad1f8ceb10f5b2fcb79cb96f1391d7c935d9808377687b9`
- [061 - Immutable conversation restore-point lifecycle - Known-37 completion](061-immutable-conversation-restore-point-lifecycle-known-37-completi.md) L24380-L24397 `3528e275e3bf2d04dbf95fd578f5c2c16ed2d866b573ff3537f9dbb2b46595e4`
- [062 - PMConcept7 Concept Promotion Addendum - 2026-07-23](062-pmconcept7-concept-promotion-addendum-2026-07-23.md) L24399-L24783 `0f82ca60e6214908fdc5b10a0356faa1c52dd8ce7b868c4594172400f2eca106`
- [063 - PMConcept7 shared Assistant seating and context surfaces addendum - 2026-08-27](063-pmconcept7-shared-assistant-seating-and-context-surfaces-addendu.md) L24785-L24887 `cd5930539c67e09b30e6836fd3abdd913f8b6ec5b52f6b8d3ac5b5a5f431b39e`
- [064 - Additive Correction v4 — Consumed Assistant Behaviour (2026-09-03)](064-additive-correction-v4-consumed-assistant-behaviour-2026-09-03.md) L24889-L24937 `30dc3a481e09a9cbc8c5db9611483ed86ec8944a8c0e85989fc5d18cc0ccaf0c`
- [065 - Working Notebook Surface Addendum (2026-09-05)](065-working-notebook-surface-addendum-2026-09-05.md) L24939-L25047 `c1e1d5d127872e31164cf12c8d992d2f44fe20050e9bb9a1c32a21e154c90e04`
- [066 - Cumulative v3 Assistant Interaction & Surface Specification (2026-09-07)](066-cumulative-v3-assistant-interaction-surface-specification-2026-0.md) L25049-L25418 `6eb07f2133218001ea3506d3d3cd9eed154561fa0fcb7d85cad381bbae0917fd`
- [067 - Research decision packet review](067-research-decision-packet-review.md) L25422-L25517 `3c647307fb57ff5beb71bc30e76b6f8b29911bda84515c0c2547d44637cb2dd8`
- [068 - Context Lens Source and Preview Reconciliation — 2026-09-10](068-context-lens-source-and-preview-reconciliation-2026-09-10.md) L25519-L25583 `3a248a3c4a414de603d8a865e9891d840da70f8366aed8b20f78de0a52ce8e7d`
- [069 - Compaction completion Event Authority (DL-039 and DL-040)](069-compaction-completion-event-authority-dl-039-and-dl-040.md) L25585-L25638 `1b90570b62764d88dcb4bbd1b317e543d352ec6ab8f7677085086b711512124d`
- [070 - DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)](070-dl-042-historical-todo-event-migration-consumer-boundary-2026-09.md) L25641-L25688 `eacd0e187716b2b6002bc51f03850963b3ab1cdc955be3c26a050a20845bb5c1`
- [071 - Restore-point created native and historical consumers](071-restore-point-created-native-and-historical-consumers.md) L25691-L25865 `b431159b03f5be1d056b0c73341d120bef82e34fa0b69b70f676c30d68156992`
- [072 - Deleted restore-point passive history admission](072-deleted-restore-point-passive-history-admission.md) L25868-L25934 `11e572a12feceb69a7de72019ebacad3742b76561a6b2e6c7e1c172584fb7c8d`
- [073 - Expired restore-point passive history admission](073-expired-restore-point-passive-history-admission.md) L25937-L26006 `3ef9ef03006db6977795122569d7be604627d408635fa49cc31d9560a8ad3417`
- [074 - External Research Decision Packet Consumer Addendum (2026-09-17)](074-external-research-decision-packet-consumer-addendum-2026-09-17.md) L26008-L26058 `1f84fefcdfab775296799aea74e1bc5717ede11d0c4f51a3540e0834619a1c46`
- [075 - Chat WOW Turn Presentation Addendum (2026-09-27)](075-chat-wow-turn-presentation-addendum-2026-09-27.md) L26060-L26712 `88211bca9e2addf0f6daf0ec567f39356e1eefa0d3a89e5ed2be50f2939c7d9d`
- [076 - Wand Modules Redesign Addendum (2026-09-27)](076-wand-modules-redesign-addendum-2026-09-27.md) L26714-L27419 `13ba825a4a6468765c91b6ade19386782f4c11f4b8c2836409af4ea4164f5569`
- [077 - Chat Tweaks Addendum (2026-10-08)](077-chat-tweaks-addendum-2026-10-08.md) L27421-L27497 `dc53b6ea65005f01f85e6183aecd3b2a6397b603fb27e3180568e8c44b94a4eb`
- [078 - DL-180, DL-181 and DL-185 — What The Chat Opens, Its Column, Its Command Card And The Port (2026-10-09)](078-dl-180-dl-181-and-dl-185-what-the-chat-opens-its-column-its-comm.md) L27499-L27906 `fa81a7e1cbb817007849579ace8a7ee763180e99251f9567911b9f90157492e9`
- [079 - Grill Me rounds and agreement — DL-218](079-grill-me-rounds-and-agreement-dl-218.md) L27908-L27986 `958b9aecce9cff4f82bbd7189a5b8f425f3626de877cf1d54b476168f930c840`
