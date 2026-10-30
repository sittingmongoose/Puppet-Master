# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-10-30T18:28:13Z

Source SHA256: `7f36bba1b2ee8a701239d6b0ad57a4921dbdeae2edd3f2fcfb5e9a8d75f9a587`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `4279825621bc5ee9295fb9b803d5259081d9d0e16fca576f81826699ca3cfe80`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `36f3dead93281662b032745e363e97477c55279cc14ef2df7b85467546d1eafd`
- [003 - Change Summary](003-change-summary.md) L14-L30 `54f0fdef52c8d92cb06546bd2a3186373bd2d2b1eac11a26c27bdd96c514f168`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L32-L47 `748a2609f11358324e5f0e23146eaa3f80361c7f1cd26934147e0d607fc03429`
- [005 - Executive Summary](005-executive-summary.md) L48-L52 `a5422aa586b0453af86cf5b832e90d4a12bff6242dd7f2f091e3948917b5c8de`
- [006 - Table of Contents](006-table-of-contents.md) L54-L90 `c192eebc0edc5988678b0cb58a009d3ca7bf7e47c4a224ba7af99c4f82cf7fcf`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L92-L207 `158c94a97b34a17d197b419d5d9ceb8ab0eb611c48c71309b0daa889c2ca89b3`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L209-L232 `1a9f9fb4a5827e96339fe3f3916347a9c5287fbbdc8dc7fa06173b5e577cc594`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L234-L240 `e0ac25101a7669924bf4d45c02f19b694d3214f3552d7482a2c73614bcb805c8`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L242-L291 `e2e90c870bbc012b36906f5f833fb28fe8786e98bc32d9127ddab0b228d5a999`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L292-L440 `5dfec9a59c9779579cfe5746339d525cd33983d7ca6f8328f38f3a2be5434100`
- [012 - 6. Teach](012-6.-teach.md) L441-L483 `2f73b0663c90e51aa37df0eb314cd4d0ba5c9cfadc151f2443409e09e0e2cf22`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L485-L671 `105e15cf81ff7b17716106b7068408803ce73376fe4f2a683ce634fe81ebfb28`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L672-L964 `065c86ee7c6c293ddb8258caaa4ccbb5b5c6525d306ba2ea11032bf7406ea42b`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L966-L1008 `9f04775132c9fb7b17dbcf637a447ba184f7d064dbe34ea1b149c3839a42fc62`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L1010-L1080 `08c6258dca84cf8bb1d21ab34f43b870fc71fe21fa05d02d410fb7673ef2a18a`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1081-L1258 `e7dbc6725ebde22e5fa567d6d2e93a622565dd1a733c13906cc8ee4f2e5fa789`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1259-L1367 `b3009670d9acb63069246e6a4db0984bf6bbfd0faa7c5510d7ddf172988c73ce`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1368-L1785 `f8a358c3b2534d7794d1a3e6cffcbe91863c3267a66a6f269f6bbefc4d284d3f`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1786-L1903 `fd96fb483d3e520c9f0a2efc9b1d598dfbbec182e50186b358a2a277ff319a39`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1904-L1937 `6761f3a8359dd6affe25771dcdc573c046d4719a7f9f83f4e49b4e8579c93cc1`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1938-L1977 `be9c0b10f2bac2a61731d743fe0f31515602250ceba051372ce1fee9a47a97ea`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1979-L2092 `c3bd759fb76ab87bbb233909b7797d3377a3afcfa5f6ecd2ebfe06023e9cd638`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L2093-L2104 `511753f78635dfc2d67811b0c84ad133f91e618db3b4291109f83490c39e7c2e`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L2106-L2115 `9110c4ea24ed5839cb53c2ba5ce43d7d4a8ca9d0b47fc694a0d72c4b11f3e1fe`
- [026 - 20. References](026-20.-references.md) L2117-L2146 `eab3296a492299250a1b1f5072551c06c13adaa558b35e0adfcdd218542776f4`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2147-L2165 `01144eb3f631126fe2678deb93e4373c63f9cfe807af5aa8183fa81ebc27d122`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2167-L2201 `b15bbbb2b26f8374ab3ce6aad2d00f9155c74cda1f5546d5b8ed3e1f00e5203a`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2202-L2297 `d7307a5878588ac69a63915636f6987f2b23aa01b1fbdf949c2be3bf4aabee17`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2299-L2352 `a10ce8450cced5638722bfe083e006ec492238d9ce342481b7fc29d44b244c77`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2353-L2359 `c74f21d750f2a18b7cf8595749be39f83a34f27804f9612f56c9689140e9fb44`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep)](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2360-L2462 `95817cef82c55aa72844a4c19a23a6b5e7171b001489e66b53a191dec083ff72`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2463-L2599 `aa76104386f4affb7826b9bf6629c863a3e51de791ab9ee4758fde965c172cc4`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2601-L2646 `bbb9cf984a55794f107e4d344cbf23b3b25f672a212e4bc666b8d97bee425d9f`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2647-L2756 `3de7e04865604368464672fd752b4fb7987294783f67ae4b501083ec55789c99`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2758-L2773 `9a59c8614099cb405ff87568d5df509ff6e089919519e4a4ef6754e9197a672f`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2774-L2786 `552843cdf407c53201f17362849ec3497b6c904b8d1b72e08cf0e360d8d53658`
- [038 - Ledger Compile Addendum - pldg-20260630-001-feature-intake](038-ledger-compile-addendum-pldg-20260630-001-feature-intake.md) L2788-L2856 `dd1463d7cf8ba3ee307cdafb462b08cb46c9dee13a95cd4d32641ee5db0dc691`
- [039 - Ledger Compile Addendum - pldg-20260624-001-provider-updates](039-ledger-compile-addendum-pldg-20260624-001-provider-updates.md) L2858-L3500 `e0777468ddcde8665fc3652b847303c42eee7aa1fc745fa8b8d06086a1403605`
- [040 - Shared actor-boundary, route payload, and blocked_notice packet](040-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3501-L3521 `7d214bea54819f1e6c4ab30797eafd27dfa14b7c98801eb6132cc75fe8f198f2`
- [041 - Shared Conversational Actor Runtime Identity](041-shared-conversational-actor-runtime-identity.md) L3523-L3537 `de1e54092012cca8d308fcade74b187c0708635338f950aada75d2032be84e45`
- [042 - Chat Route, Permission, and History Behaviors](042-chat-route-permission-and-history-behaviors.md) L3539-L3553 `6729f71f862e26e6474999cd3a80bc82cd2b177fbf703c64bccc481c44c12826`
- [043 - Owner / Consumer Map](043-owner-consumer-map.md) L3555-L3559 `1c077467348bf730aced4a5e0e88514a8daa99a4646347733d2728bc6563908d`
- [044 - PlanUnits](044-planunits.md) L3561-L3612 `308ae8de9291968e9e04c7ce7cab665a29ea8b7bb377c457f3a8185e73cd8128`
- [045 - Shared runtime projection addendum (2026-08-13)](045-shared-runtime-projection-addendum-2026-08-13.md) L3614-L22455 `61d62ac3f448bee976c6c7a07688aa093ac86289343346f8a6012b274a0ed946`
- [046 - Migration Coverage](046-migration-coverage.md) L22457-L22487 `0bb354fec743111cf06be6a5bd84462fcf542660992e887437b16184e1b0edb0`
- [047 - Ledger Compile Addendum - pldg-20260614-001](047-ledger-compile-addendum-pldg-20260614-001.md) L22489-L22577 `056a0ce4217fa7cafbb2aa0b1d0e43e823bfda7609c499456349463d97e35f26`
- [048 - Ledger Compile Addendum - pldg-20260615-001](048-ledger-compile-addendum-pldg-20260615-001.md) L22579-L22676 `92c8bb07c3d78a4b82acb57066c4a8842f385b3d760e55c8aaf32e6b1d6a75ab`
- [049 - Ledger Compile Addendum - pldg-20260616-001](049-ledger-compile-addendum-pldg-20260616-001.md) L22678-L22996 `1a0f856657d14dcb0d72624e4d96a5519ea9884d20815435f0467cf245c153bf`
- [050 - Ledger Compile Addendum - pldg-20260616-002](050-ledger-compile-addendum-pldg-20260616-002.md) L22998-L23065 `1add69c699ebff3b25b0fb3e9b897bf26b38d75ae9032db03423ee3a2acf4c4c`
- [051 - Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard](051-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md) L23068-L23156 `03c4374b55488bc652522de900e008815811df79f15245d08f5ce60afc4a8910`
- [052 - Ledger Compile Addendum - pldg-20260622-001-fff](052-ledger-compile-addendum-pldg-20260622-001-fff.md) L23158-L23244 `789752334b7d2a31d13b90a3ea1863705ddcffa3b36dd460037830ba842ba19a`
- [053 - Ledger Compile Addendum - pldg-20260626-001-feature-name](053-ledger-compile-addendum-pldg-20260626-001-feature-name.md) L23247-L23623 `e299f424e0d28800fd0db148031d05b8c248c34ca2494539f47b55deacd29f3c`
- [054 - Ledger Compile Addendum - pldg-20260627-001-feature-intake](054-ledger-compile-addendum-pldg-20260627-001-feature-intake.md) L23625-L23836 `b78cb72b6148a7c743a5ae3fcdc13c5dc34bca6e182cfe8e092b367f2d7e636a`
- [055 - Ledger Compile Addendum - pldg-20260701-001-feature-intake](055-ledger-compile-addendum-pldg-20260701-001-feature-intake.md) L23838-L23917 `cf962a3e9dec5201a0f22c73f17d13a5f9cc4c604fab9cefda37beabe44b9296`
- [056 - Ledger Compile Addendum - pldg-20260703-001-feature-intake](056-ledger-compile-addendum-pldg-20260703-001-feature-intake.md) L23919-L23984 `c59d974af8ef6e694f207a8a9a55e37f542cb8d1f5344e643a67edd4305f759d`
- [057 - FABLE Residual Chat Mechanics Cleanup Addendum - 2026-07-07](057-fable-residual-chat-mechanics-cleanup-addendum-2026-07-07.md) L23986-L24057 `9249cd4cd76d1978f0af9c21cd4ae30c185154055533ff66466dbdbeb153de46`
- [058 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](058-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L24059-L24103 `b93bfcde4d7b0ea523aa477118b3980b708a21191f15ae9ed19f59aa943ba87b`
- [059 - Usage GUI Propagation Addendum - 2026-07-09](059-usage-gui-propagation-addendum-2026-07-09.md) L24105-L24181 `857cbbe5a054a26528ce940f8255b5facf46c27ab15c9bf87f74038387c6ed70`
- [060 - PMConcept6 Chat Polish Addendum - 2026-07-16](060-pmconcept6-chat-polish-addendum-2026-07-16.md) L24183-L24415 `3360edd16bd34ebed50782d24d28fb5cdc1ff1e971da75392597a11e550a7225`
- [061 - Immutable conversation restore-point lifecycle - Known-37 completion](061-immutable-conversation-restore-point-lifecycle-known-37-completi.md) L24418-L24435 `3283827b2bcdd0a5ea9623d74f223a5f4086845135634dc35d8d88ba1bf19a2f`
- [062 - PMConcept7 Concept Promotion Addendum - 2026-07-23](062-pmconcept7-concept-promotion-addendum-2026-07-23.md) L24437-L24835 `82f9e363000a970586dfb510efa145cb4d5dc2eddbbd5b7bf0edf1f4e2fcae75`
- [063 - PMConcept7 shared Assistant seating and context surfaces addendum - 2026-08-27](063-pmconcept7-shared-assistant-seating-and-context-surfaces-addendu.md) L24837-L24939 `e1abb8f64951a3123e37431a00c1c448314b392330adf4d22bdb5b0e3afdcc78`
- [064 - Additive Correction v4 — Consumed Assistant Behaviour (2026-09-03)](064-additive-correction-v4-consumed-assistant-behaviour-2026-09-03.md) L24941-L24989 `c69d2a00e731d3c8c98d93f04f03cca849a4a34441aea7795dcc15bd5c23b8e6`
- [065 - Working Notebook Surface Addendum (2026-09-05)](065-working-notebook-surface-addendum-2026-09-05.md) L24991-L25119 `f0daf79e381e77df3688e18d58b8d56a369c86b4fb14a4ae28ad2f59205092b2`
- [066 - Cumulative v3 Assistant Interaction & Surface Specification (2026-09-07)](066-cumulative-v3-assistant-interaction-surface-specification-2026-0.md) L25121-L25516 `b7e6de033718a7f61762b8cd5243ccb3108d25218b9438d6a33dff9a658c78ab`
- [067 - Research decision packet review](067-research-decision-packet-review.md) L25520-L25615 `27869d0403d585a6428fde990ab95aa3bd8477b23be7884743de58c7d39152fc`
- [068 - Context Lens Source and Preview Reconciliation — 2026-09-10](068-context-lens-source-and-preview-reconciliation-2026-09-10.md) L25617-L25681 `8b11624fc4a96ea20532a727e1d1aa246552a7d51dd9e313dc02df81088f0ab5`
- [069 - Compaction completion Event Authority (DL-039 and DL-040)](069-compaction-completion-event-authority-dl-039-and-dl-040.md) L25683-L25736 `c70f60ccbf8e40273b3bb02008dc4f0e1c6225f30f58d3d926216c21d8f4a3bd`
- [070 - DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)](070-dl-042-historical-todo-event-migration-consumer-boundary-2026-09.md) L25739-L25786 `65e087bb242d292aba23ff23f655e9ad02ead3289455562a3dc5adb667f34579`
- [071 - Restore-point created native and historical consumers](071-restore-point-created-native-and-historical-consumers.md) L25789-L25963 `a360ffb4a4f2e3962be03a8b124a8e613945fbca8611e06aa7708bf10200034f`
- [072 - Deleted restore-point passive history admission](072-deleted-restore-point-passive-history-admission.md) L25966-L26032 `e60e257b75a99b5bcc6d30d071af91845d252e9b7597dd1ca31d45f76c1dae30`
- [073 - Expired restore-point passive history admission](073-expired-restore-point-passive-history-admission.md) L26035-L26104 `eaad8499f4fcd8cb2a038d3d0bc051a1b51d93853024226f73267dac8fb60b90`
- [074 - External Research Decision Packet Consumer Addendum (2026-09-17)](074-external-research-decision-packet-consumer-addendum-2026-09-17.md) L26106-L26156 `d2a8fd6ec567ff7bd47ea317fb42b37343ca5a7acc083cffb589ae78173bf87f`
- [075 - Chat WOW Turn Presentation Addendum (2026-09-27)](075-chat-wow-turn-presentation-addendum-2026-09-27.md) L26158-L26834 `d1fb39d2c704c4a0ab633703fb717f892a571921e7e57981a12ffec5041ed55e`
- [076 - Wand Modules Redesign Addendum (2026-09-27)](076-wand-modules-redesign-addendum-2026-09-27.md) L26836-L27565 `a01929af673aa6003a81b2c73ea3476280435c73070b3e41ca3da6cb3d307e08`
- [077 - Chat Tweaks Addendum (2026-10-08)](077-chat-tweaks-addendum-2026-10-08.md) L27567-L27643 `bce7deee414f1d60da61099a9c0a4b844577e30bbedd6a8fb332c9c39601a3e8`
- [078 - DL-180, DL-181 and DL-185 — What The Chat Opens, Its Column, Its Command Card And The Port (2026-10-09)](078-dl-180-dl-181-and-dl-185-what-the-chat-opens-its-column-its-comm.md) L27645-L28080 `cf6dc415e3be186e0581c5e5f52c261d7d60f622224eb86e6345ed28e7aef062`
- [079 - Grill Me rounds and agreement — DL-218](079-grill-me-rounds-and-agreement-dl-218.md) L28082-L28523 `70fc3ab21a71bae44ccd7b2ae4c739ebe9a344bbb74883b1673f8b05189877ad`
