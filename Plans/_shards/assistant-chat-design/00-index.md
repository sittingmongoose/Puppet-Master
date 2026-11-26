# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-11-26T02:04:51Z

Source SHA256: `85c7c710c2dae5df1e6a2c77cc8f04e0c853b52853082d4457e03c4fb9c68678`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `ab68e93b73f59c2922693e9e58a9d68e3165ef38954a51cb3f0c1fc2cf1f289d`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `19c5ec1b5b6b6fc4020f709e2215f3e384e31e6d08c5317f35b2c2645a8c6fa0`
- [003 - Change Summary](003-change-summary.md) L14-L30 `6f6fe46e37d9ed4894c370575d8e3806a0d77653215c66a9e2d36fc1acd27947`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L32-L47 `11095979ca384cdecd0c8a867879deabd9280f31abec702f284d35778b0b5c47`
- [005 - Executive Summary](005-executive-summary.md) L48-L52 `a97f5c1310cc53b752f3dc4f19672a88a3a2ccaf84cacd8ac3832f1507b0b7e7`
- [006 - Table of Contents](006-table-of-contents.md) L54-L90 `7a120dd24e8d97c8598d7e5b5340b456f4ebd700fb71105311f6a2a68e988801`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L92-L207 `889c4aa33ba1dda7bef088ce1815aa376e897d6a6df178808f827719a6a8cf6a`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L209-L232 `beceeb5c3eeae5512cd179bd7051934739b3b6f1e4a7865c1cc0d31793cbb4f7`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L234-L240 `99712aa29b896141430d4b3cb6cc143f50b6dee2e168bb6d89502f4b8a32415b`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L242-L291 `10fdf425c713e3723f62a26f6fdc8f4b2aa7b9b8ee6f86d1e841ec9b3129510b`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L292-L440 `62730f05666c12620475753696a711bb2db21eaff932c3155c1abb931774621a`
- [012 - 6. Teach](012-6.-teach.md) L441-L479 `91e312575af36187cc870c7dc5be60653aa254567796e61400b71d1219fd0f67`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L481-L667 `dbd51b15c39fdbdc31f9f97f7d06176113d8f70b2eaae22236cfd181f6d31dac`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L668-L960 `aedc5490229ec754a11020fade26f57a15822a310ca90d0c45a149e34116c26e`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L962-L1004 `58c4b6236cbb37170ba67512bf74ae3ab9e990bac8769397f53641316aa57a48`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L1006-L1077 `9bf6ffd87cdfd14a4c929da1e6e974ce6f4140b4b9bcbfbe9ce3abce4f1d4d79`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1078-L1258 `db60963cc24a192c56af2dd97bd722b573bf511dd09a9efc0291d631fa82f0d3`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1259-L1365 `5aef67e405200d7d6d40551697f202f7bad40e7e0ff8dffd6a449e294bf07259`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1366-L1783 `a2e55cdcb3fc0f7b19046cbb9a3c25bed52d2557ae416c924a145e1a3c89b3d8`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1784-L1901 `b290f3bc81d46a817011e0f8025d5b411f5d98a5f5b768cfc6ad946ba1acd9e8`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1902-L1935 `e4ed435fd41d2695a2230856b373538f397a4f95b5894354a18489d0ad15d622`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1936-L1975 `1bfb702f0ad6a2db6df31551cf8fa5545480c8602711ab69fe8ba2c70272a74b`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1977-L2090 `4968a10a661a5cd1a9223d2bc4c91b6e5146fc1e0cd22efdb79ecef33c78fa39`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L2091-L2102 `0530156492ccfb802b87ba377bb75af4fd606d03cb781c0895561afa9c90f87a`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L2104-L2113 `b2bda82da0342952e4bab3751c8e50e5077bd3b6fbe9c92b48b5c4b90b7aecb1`
- [026 - 20. References](026-20.-references.md) L2115-L2144 `1743ec54cf4aa4386b744c1bf29de0c7300a9905f82c672879cc23b73ce84826`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2145-L2163 `f31bdcdf43089815a43c0389c511ae281da8ddc476732fc22de88fc3c883690e`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2165-L2199 `35d436675153fd5a61ef06f7091679fa15c7ec9a396aa6f03211277f62934002`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2200-L2295 `d341d486f82cb9b4a1d9e5f235ecb825e87b9cc8698a8e6ff074a9cd9e638fb2`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2297-L2351 `d228a1ef31835c62adc685a47a9d1f48377dfe6c9fba17b5d41114354ecfea24`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2352-L2358 `d1505a08a7f03b36e61fdfa133f820bc38d92f028249f63ff5e511883223a5dd`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep) And Loop Specification](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2359-L2599 `acc5cb1c2b5d2e47c600068ff1406580e39fab8db29e7e45f024500716ea8191`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2601-L2737 `d3612dbd6211bad5334978b7a2cf81a508926823fd88165a3c011138772fd40f`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2739-L2784 `94dade9c90e9cc522272acf3939ba620e48ca27390cc0c7a9983fd955e654512`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2785-L2894 `9529328628180ae82bd376c947d758afc109702c60c8eff3765a4400637f5a61`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2896-L2911 `32614ddcc8e90b53b093d239a191f2d447c182e0bbf1321cb88ae76bdee32158`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2912-L2924 `d23525eed3c858e157270e0c46ea62410f4fca2a7308261bfd12528642e20641`
- [038 - Ledger Compile Addendum - pldg-20260630-001-feature-intake](038-ledger-compile-addendum-pldg-20260630-001-feature-intake.md) L2926-L2994 `f88530101e09e04bca0ee05504b43325f523e1447e914d63c474209fe4eea542`
- [039 - Ledger Compile Addendum - pldg-20260624-001-provider-updates](039-ledger-compile-addendum-pldg-20260624-001-provider-updates.md) L2996-L3638 `8b58c61cf850dae50da312fd3636e5256259e5f2937ee021e2854682bd6afb0d`
- [040 - Shared actor-boundary, route payload, and blocked_notice packet](040-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3639-L3659 `6e0a40d76493bdac6bb2e98481cb5dbde796fe1638de6856da41032c18c3a4ea`
- [041 - Shared Conversational Actor Runtime Identity](041-shared-conversational-actor-runtime-identity.md) L3661-L3675 `073df822ae44acf6346257fc7bd5d764965ed9b238087c4dc63849d26fb1e3e5`
- [042 - Chat Route, Permission, and History Behaviors](042-chat-route-permission-and-history-behaviors.md) L3677-L3691 `20aeb307f40bdd2f7218d128aea1967c962da06176c3fa425f605f007ffc625c`
- [043 - Owner / Consumer Map](043-owner-consumer-map.md) L3693-L3697 `4b55a85c4409e44a4e6de189f41a9992baf2ffd6e3d983f695765f9d710cf2a7`
- [044 - PlanUnits](044-planunits.md) L3699-L3750 `22f1444d250ef5eb98802b1224b57c81c845c83949cb9fe10d6130047270c9c3`
- [045 - Shared runtime projection addendum (2026-08-13)](045-shared-runtime-projection-addendum-2026-08-13.md) L3752-L23148 `cb68e6ea18ed7e09b73fd0a7be1e643c312d48b22729b1b975c5b7c5891c8e24`
- [046 - Migration Coverage](046-migration-coverage.md) L23150-L23180 `91f6c89e019d02e4e99694d21f8b9c70313695bc881cba9ca5b8af84058e73f6`
- [047 - Ledger Compile Addendum - pldg-20260614-001](047-ledger-compile-addendum-pldg-20260614-001.md) L23182-L23270 `ac3ea06846df0140df937f3745a6ab47cf5ddfcb001b83f7d79e691c3da66a56`
- [048 - Ledger Compile Addendum - pldg-20260615-001](048-ledger-compile-addendum-pldg-20260615-001.md) L23272-L23369 `56d950d24b36ab8b0d5692372da5118dbea3c5877b0b100af1dde431b259d328`
- [049 - Ledger Compile Addendum - pldg-20260616-001](049-ledger-compile-addendum-pldg-20260616-001.md) L23371-L23697 `3ec0683b96c8245eab5a67f60c712b282a70cdcc9da3257150863016b3b102cb`
- [050 - Ledger Compile Addendum - pldg-20260616-002](050-ledger-compile-addendum-pldg-20260616-002.md) L23699-L23772 `d0c2f1aa73e27517fddaa9d9578c46cc14e41c1b3a74c90d643c498ed59cb9bc`
- [051 - Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard](051-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md) L23775-L23863 `138e5264df2d461f1c7549faa93fe7dc0538a17d8c58affda46c240b55e79d76`
- [052 - Ledger Compile Addendum - pldg-20260622-001-fff](052-ledger-compile-addendum-pldg-20260622-001-fff.md) L23865-L23951 `20fc07d976b350e823b162ede237b73a9ef5e818475b1516e8a7c62ecb79fe90`
- [053 - Ledger Compile Addendum - pldg-20260626-001-feature-name](053-ledger-compile-addendum-pldg-20260626-001-feature-name.md) L23954-L24294 `c6e513f28e1906d5757245452fe2c1967da65018943ad6bfb3b996ccfbf4dbcd`
- [054 - Ledger Compile Addendum - pldg-20260627-001-feature-intake](054-ledger-compile-addendum-pldg-20260627-001-feature-intake.md) L24296-L24507 `943c2e3dbc7dfde7955acc3e241e00055b38d85618372cc18623e71fd1131a0e`
- [055 - Ledger Compile Addendum - pldg-20260701-001-feature-intake](055-ledger-compile-addendum-pldg-20260701-001-feature-intake.md) L24509-L24590 `bbb4ed178a819d4c0a30a97f3d0f3d1360a13bad43efa4c90498d6ca5bc75211`
- [056 - Ledger Compile Addendum - pldg-20260703-001-feature-intake](056-ledger-compile-addendum-pldg-20260703-001-feature-intake.md) L24592-L24657 `ca98fc065552528d0fa13f5324ec2c218f388786f94d8c6d74df3be28eeecd5a`
- [057 - FABLE Residual Chat Mechanics Cleanup Addendum - 2026-07-07](057-fable-residual-chat-mechanics-cleanup-addendum-2026-07-07.md) L24659-L24730 `fedc93a70db3b931b6ce8d553001084a7a0e66851a34280d3fb5e6f13ea29031`
- [058 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](058-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L24732-L24781 `1cbd6b4a9b95f557554858e5da5f9d9ad37af0cda192ce09b735f45321668d3a`
- [059 - Usage GUI Propagation Addendum - 2026-07-09](059-usage-gui-propagation-addendum-2026-07-09.md) L24783-L24870 `e28578778a71c22c91e8a61d35dd7a2e37546e083ba6529d341c6403cb15d0c5`
- [060 - PMConcept6 Chat Polish Addendum - 2026-07-16](060-pmconcept6-chat-polish-addendum-2026-07-16.md) L24872-L25107 `16393f3a9d3b250e21f16848199edb7578a48f49074a0beaa51873cb7fb42736`
- [061 - Immutable conversation restore-point lifecycle - Known-37 completion](061-immutable-conversation-restore-point-lifecycle-known-37-completi.md) L25110-L25127 `5bd1b2bddc1c145344f1872d7bd745104a508e9503b8e8378e034e3bcc50181b`
- [062 - PMConcept7 Concept Promotion Addendum - 2026-07-23](062-pmconcept7-concept-promotion-addendum-2026-07-23.md) L25129-L25501 `06b3a3b6f1cc26f4e936f0f91f47b3a066f48017def580f3b5df5669e39bc5ad`
- [063 - PMConcept7 shared Assistant seating and context surfaces addendum - 2026-08-27](063-pmconcept7-shared-assistant-seating-and-context-surfaces-addendu.md) L25503-L25609 `0c49bc2f05b72c91f6591c82cca8f32d47a7718b17bcf18cd7e9487e500fa4d4`
- [064 - Additive Correction v4 — Consumed Assistant Behaviour (2026-09-03)](064-additive-correction-v4-consumed-assistant-behaviour-2026-09-03.md) L25611-L25659 `fd25583340487481b60ca9a2ef134d5d0ff518a315bee03034cf2e378b50403c`
- [065 - Working Notebook Surface Addendum (2026-09-05)](065-working-notebook-surface-addendum-2026-09-05.md) L25661-L25800 `8109e390acbc61bdff376cc4568bf37f157b8f58e249efdf35a03bfe49e684e4`
- [066 - Cumulative v3 Assistant Interaction & Surface Specification (2026-09-07)](066-cumulative-v3-assistant-interaction-surface-specification-2026-0.md) L25802-L26195 `8d62fcd90cf3e09415baaebd510bb38a17518fba0dd9099b8dcb9a3cf3d58717`
- [067 - Research decision packet review](067-research-decision-packet-review.md) L26199-L26294 `f4684fddbba17bfb7b58a4b3789f6eab49674542fff77c9a51b87a402f9e9e76`
- [068 - Context Lens Source and Preview Reconciliation — 2026-09-10](068-context-lens-source-and-preview-reconciliation-2026-09-10.md) L26296-L26360 `87f0ca62f678d9d8e4bc5bdfd397a0a5df2d43b39f86e8fca83e24a30913cc24`
- [069 - Compaction completion Event Authority (DL-039 and DL-040)](069-compaction-completion-event-authority-dl-039-and-dl-040.md) L26362-L26426 `226532f1b8254ab5f472bd6f741dff83bc5c41d4f42d036a48a72278963d80cd`
- [070 - DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)](070-dl-042-historical-todo-event-migration-consumer-boundary-2026-09.md) L26429-L26484 `b21b889df2fe3624b587f70ca2566a4459dc5c758ddda59e8ef35f7ec8b90291`
- [071 - Restore-point created native and historical consumers](071-restore-point-created-native-and-historical-consumers.md) L26487-L26682 `a9ced2811f7a760f3fc7a2e7a69f36aef8a265bb7484bf69c286d54b97b99e29`
- [072 - Deleted restore-point passive history admission](072-deleted-restore-point-passive-history-admission.md) L26685-L26751 `f52414e935072cfbb338c616afa83cb88fcbf9f7d3d4025edc8c203eda385dac`
- [073 - Expired restore-point passive history admission](073-expired-restore-point-passive-history-admission.md) L26754-L26823 `fa2e0a2ab99da44378a90f51da5c37d259e37fdd45535f697033d1619c3b524f`
- [074 - External Research Decision Packet Consumer Addendum (2026-09-17)](074-external-research-decision-packet-consumer-addendum-2026-09-17.md) L26825-L26875 `dce736f7b461ca00f091d3d4567cbdf5bf90045e0aca7997ed1f957916e02aa1`
- [075 - Chat WOW Turn Presentation Addendum (2026-09-27)](075-chat-wow-turn-presentation-addendum-2026-09-27.md) L26877-L27525 `b7b81a0d1f17d080642d978cdb1b34160fa516d5475dc39dfef7a40f15e643ce`
- [076 - Wand Modules Redesign Addendum (2026-09-27)](076-wand-modules-redesign-addendum-2026-09-27.md) L27527-L28221 `e9c1bd9209ba51bdc79a6e1ef56c4316fa24ff149e1d6987b106e336cc2dd492`
- [077 - Chat Tweaks Addendum (2026-10-08)](077-chat-tweaks-addendum-2026-10-08.md) L28223-L28299 `2500f171fdeb0006f49851c0a8e3fd8905e8cb3fcf5f0ff02c4f6be6ba0556e1`
- [078 - DL-180, DL-181 and DL-185 — What The Chat Opens, Its Column, Its Command Card And The Port (2026-10-09)](078-dl-180-dl-181-and-dl-185-what-the-chat-opens-its-column-its-comm.md) L28301-L28792 `cf6748c43c1e013585830a2946089c35da1f410d3e1ee6654f69ceb4ec50ef90`
- [079 - Grill Me rounds and agreement — DL-218](079-grill-me-rounds-and-agreement-dl-218.md) L28794-L29567 `3828a35e88c234fbd4f4eb1960c162e4f47f55525294bddbf5fbc17143e504f1`
- [080 - Command payload definitions (DL-333, 2026-11-05)](080-command-payload-definitions-dl-333-2026-11-05.md) L29569-L33478 `22e5d19ad84055bc52a6af0620c7c9609ce042a42d4013a04e630e287ad955b2`
- [081 - Markdown Pipeline, Streaming Correctness, Sanitization, And Math Addendum (2026-11-23, DL-2601)](081-markdown-pipeline-streaming-correctness-sanitization-and-math-ad.md) L33480-L33857 `0f1be28cde34ec8f08d0cb757abbcbc587e68732fa1269978862ed84999405c5`
