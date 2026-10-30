# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-10-30T06:43:30Z

Source SHA256: `75e1c620b8a3b984d78b36c8c7b8b349e20327a9e83f95c6f5728e3d0ad12001`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `7b26844b144f8f03c2f6e87c904b4aca012d2cd7bc21d6731bca317e6f8a9666`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `8dcf21d7160c59dcb3b2cd4d6cb8ff80d7cd8f21abaf0cf59c631fa489091161`
- [003 - Change Summary](003-change-summary.md) L14-L30 `92151add24201da2a9ca77cdedebd2c649e7f33bf7d1637fe002a3a197f101d6`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L32-L47 `d74a91ce266d1cfb1e1828716e455cd04c8cec497f7bd45fcbbfbd815a966af6`
- [005 - Executive Summary](005-executive-summary.md) L48-L52 `de95d82c4c0c65d94521e1172d4b50258e9a6c72d2071cc5bc7dfa0d7a8cde11`
- [006 - Table of Contents](006-table-of-contents.md) L54-L90 `325dbdfb3051ee071df5e467b026a1a44632a19c40a520360fcb9720e8d6ca10`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L92-L207 `d59976cb0184440097c8ad57697098d300cfb15dd052d4e586b59b86ed7a9e4a`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L209-L232 `2b5f9451543af61fbc945cea388c12c191b7ed7e45810ffc3901cd0be15053ef`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L234-L240 `f15ebbbd097e92c2bfba48cad62438898a5d1833b777840f3da51f438f3fc2be`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L242-L291 `a622cedc3a57384697ee28f73271c5edd5661d1eba4686c58cf9dd7f1c2cca96`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L292-L440 `461d5536f9fabd13ed3853d054404a9846f6e698f882ed61042805b8fa2abb4f`
- [012 - 6. Teach](012-6.-teach.md) L441-L483 `32a80fe71bfecfe7a67d77b97b64a6612b55f7bdad19a934e4ce4e49f83696ea`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L485-L671 `7ce4e8aa8fe88043dafafb993facb6ce430d63b4572f97f355c323afa810c712`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L672-L964 `a8f23ce2381c627d4e19a960ebd9a70a96f41633788bf84ffa798e1aa6e053f8`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L966-L1008 `b5e2834c6700bd4af8ca0a1b6f8aee450310849db461702953f46343c05489df`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L1010-L1080 `824b5e992415f58ed68025ee8750c62d03faba5f93b0a8d9402f1058eb9b5d97`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1081-L1258 `8224cc861cca12f76dccb5f27e5e000250759047b870145b4e5db9ef4fe8af0a`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1259-L1367 `e3cfe5d59ac5c0ae96db8d9f769dcba39928e32ab5dabdf68bcfa4b42dd25d04`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1368-L1785 `ffc3633aeef097c832a79878ffc3dd1970d2cd41690f1b13b7e0c10a27d8dba6`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1786-L1903 `ac53ed2ac4ea95ed0b2ba6406f938c434a77bc9402761deb270fc81c556bebdc`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1904-L1937 `44731545b63bc49bffcb37e7c76fb138305ca851b5f6fca9d80f33f2b1fb3bdf`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1938-L1977 `532f0353c3b8e2206f8f3ecc0341b0eaec4b25c366400492cc24082f36639a99`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1979-L2092 `880b9963169e8b3eaee51b05399957754b9618b2fdbdac37488639a41820a144`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L2093-L2104 `439d2084e488b4edba825dc58443f0fb824bba50bc8b2413bbd7d62ef57b6c46`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L2106-L2115 `0f30b2e92e9f7878c3465cd2687bf0316285f7a5bbb1c7b01bbddbe3531ffeb1`
- [026 - 20. References](026-20.-references.md) L2117-L2146 `f7c6078920b023dd3a50d54af4a579d16b36f5085cde96a848cb44fc5566afd7`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2147-L2165 `30261ee98c374104455cac32082433611848752125c1adec76f65f80d2395c26`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2167-L2201 `e786b91bba4e50acbd96a20a82b43a27661743d7ea9b3cb962660079c536026a`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2202-L2297 `6d6098a3bd957b48c3faf1eec465c9cefdfb641e8ccc1cfce364b4c460f825b3`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2299-L2352 `2944ef0ab9a29b9e0ef62afc3cc169930675476069e8b6672ba377c5fe167fc8`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2353-L2359 `5173d71eb9241b4c6063544e12a685359ba191bf12bd64a1e70aaa0ca96d14d8`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep)](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2360-L2462 `acfc4c126d2684cf93b2c5a44a47855b001a734e8429746507da2535cb61ebbb`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2463-L2599 `ddba5300a427b1659acface8d013c722d9a9ca66ee52df91bdb3a235b931722e`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2601-L2646 `6135a448a40b95a054ce3dc22be5b1d20586f684919601e108a9d5964e18f3c1`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2647-L2756 `faffc1bec6d2be366cbfb67b8f68fbc81d740d9c4622014a304114333d1f24c4`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2758-L2773 `e32a994904c2e0378ab7356fd7fdf8070637df6742055b285bf7caced1e5195d`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2774-L2786 `a8cfdce591165e324a61344321ff1be750f79dd4f52e4efb5f522354adbcdac7`
- [038 - Ledger Compile Addendum - pldg-20260630-001-feature-intake](038-ledger-compile-addendum-pldg-20260630-001-feature-intake.md) L2788-L2856 `41ce57c9130c93ab1a92de956cdb6344760d90bec1ab533ba121a0ec68b42b5a`
- [039 - Ledger Compile Addendum - pldg-20260624-001-provider-updates](039-ledger-compile-addendum-pldg-20260624-001-provider-updates.md) L2858-L3500 `4f0a5a0c4374f5dd4d6cd6ee33311dc07e6408f1c1cc09c39ad8f13315733241`
- [040 - Shared actor-boundary, route payload, and blocked_notice packet](040-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3501-L3521 `21077002650cfbf406a1c9786581cbaa90251323ed299579dd208be3731421b0`
- [041 - Shared Conversational Actor Runtime Identity](041-shared-conversational-actor-runtime-identity.md) L3523-L3537 `426db4a093a9b0ca841dde17849d4b97c9f1c78a4731fe85498a9b0a1072c716`
- [042 - Chat Route, Permission, and History Behaviors](042-chat-route-permission-and-history-behaviors.md) L3539-L3553 `2b328cf8daf7856423754885912ead53b1242d7a8974dcdf82da9f3d1fb2c303`
- [043 - Owner / Consumer Map](043-owner-consumer-map.md) L3555-L3559 `ee7b8a2dc9ae8ac16f2121cfd0aee93b391c96cf40a0304eb4ec7594ac54dec4`
- [044 - PlanUnits](044-planunits.md) L3561-L3612 `7b5bce21c7b9b1b92c5cb905dafe522c5fcdb508181ec13d9fb310bef1e6dc78`
- [045 - Shared runtime projection addendum (2026-08-13)](045-shared-runtime-projection-addendum-2026-08-13.md) L3614-L22455 `317490644939178f0f48f7c2697d9e5b5d776a12c7dae00a18fde0564aa7d216`
- [046 - Migration Coverage](046-migration-coverage.md) L22457-L22487 `7bbb819ab4391e41de047fcd10d119c3bc7e3fec2a1437be970fe112b6603dc8`
- [047 - Ledger Compile Addendum - pldg-20260614-001](047-ledger-compile-addendum-pldg-20260614-001.md) L22489-L22577 `5cd4b3ca229b6ecd49bb7881655964dcb0bf95e4182bcea7258c4c2bb6c7fd66`
- [048 - Ledger Compile Addendum - pldg-20260615-001](048-ledger-compile-addendum-pldg-20260615-001.md) L22579-L22676 `aca1af9d7fafd7f62f827b3b2372a1d31f546759ac0044088d6aa096365c1c8a`
- [049 - Ledger Compile Addendum - pldg-20260616-001](049-ledger-compile-addendum-pldg-20260616-001.md) L22678-L22996 `bcf804cffc12a78059d2a235fc64a352e328ee8f335d8b3423aa2da4bcf7ea7a`
- [050 - Ledger Compile Addendum - pldg-20260616-002](050-ledger-compile-addendum-pldg-20260616-002.md) L22998-L23065 `ed3d822e956c7baa23e438092bb073377bc25189d53d7a996e64792bd52e470e`
- [051 - Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard](051-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md) L23068-L23156 `0e7172451328d86494f8cc7db7b67bb04aa0d2160d7b9a60d2f20949a69efbac`
- [052 - Ledger Compile Addendum - pldg-20260622-001-fff](052-ledger-compile-addendum-pldg-20260622-001-fff.md) L23158-L23244 `000085af954be0fc04e72dfc48da844c11f8d84b41cec21afd98015ce176ae62`
- [053 - Ledger Compile Addendum - pldg-20260626-001-feature-name](053-ledger-compile-addendum-pldg-20260626-001-feature-name.md) L23247-L23623 `ea78ac69dfe5334278b910a89424e1c456baedd7df2f5bcd7aa5366dd35adc6d`
- [054 - Ledger Compile Addendum - pldg-20260627-001-feature-intake](054-ledger-compile-addendum-pldg-20260627-001-feature-intake.md) L23625-L23836 `d4dbf0a41194b177eac36b22b404742bbdabac2ae28861cbf99ea0db1c445515`
- [055 - Ledger Compile Addendum - pldg-20260701-001-feature-intake](055-ledger-compile-addendum-pldg-20260701-001-feature-intake.md) L23838-L23917 `aacdc71f22fe37beaa2c70c85f7398fc9385280a7f5c25fc05bdfa64c2fa2911`
- [056 - Ledger Compile Addendum - pldg-20260703-001-feature-intake](056-ledger-compile-addendum-pldg-20260703-001-feature-intake.md) L23919-L23984 `d9e4dbe9c2c212d40b7941793bc4ef745876640dc879c6349b4f20d4476c4f9f`
- [057 - FABLE Residual Chat Mechanics Cleanup Addendum - 2026-07-07](057-fable-residual-chat-mechanics-cleanup-addendum-2026-07-07.md) L23986-L24057 `95a36d6d860b46e3ae2f5ce61252f562a42ebe9048e698f6e390099cd746e8c6`
- [058 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](058-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L24059-L24103 `3277b3f35f76ae46675c414dcf04bb59633d4745219431f45882771072505cd0`
- [059 - Usage GUI Propagation Addendum - 2026-07-09](059-usage-gui-propagation-addendum-2026-07-09.md) L24105-L24181 `fc36d7e3253baed40bcaed9410f5ed495d8ad7f9c4138cba487a47acf78ed7be`
- [060 - PMConcept6 Chat Polish Addendum - 2026-07-16](060-pmconcept6-chat-polish-addendum-2026-07-16.md) L24183-L24415 `f8014560b085bd72346bbe77fed6f9e323dd4ed8d6cbbeab3f49fa7a6c36efa8`
- [061 - Immutable conversation restore-point lifecycle - Known-37 completion](061-immutable-conversation-restore-point-lifecycle-known-37-completi.md) L24418-L24435 `765a7014269d11155497c3bb6b94d23f40675c819fc062a8c10af291e81f29cf`
- [062 - PMConcept7 Concept Promotion Addendum - 2026-07-23](062-pmconcept7-concept-promotion-addendum-2026-07-23.md) L24437-L24835 `fe6df02ad00ff8f5ee8e32bd7aab93b806268395b7000550b246aa4f35214e7a`
- [063 - PMConcept7 shared Assistant seating and context surfaces addendum - 2026-08-27](063-pmconcept7-shared-assistant-seating-and-context-surfaces-addendu.md) L24837-L24939 `c62ad72ba3b836b30335d788a564ddc8cb8951ec9db07c0355e4cbcee25f7b94`
- [064 - Additive Correction v4 — Consumed Assistant Behaviour (2026-09-03)](064-additive-correction-v4-consumed-assistant-behaviour-2026-09-03.md) L24941-L24989 `bcfcd54aa68425dba48faf87214252ca68d1ed2b1251a40d0ffac9a9170da848`
- [065 - Working Notebook Surface Addendum (2026-09-05)](065-working-notebook-surface-addendum-2026-09-05.md) L24991-L25119 `9bc360bf4f28a016e93d9070d961aeb1317e14198b913531a495b3d0c7c9598b`
- [066 - Cumulative v3 Assistant Interaction & Surface Specification (2026-09-07)](066-cumulative-v3-assistant-interaction-surface-specification-2026-0.md) L25121-L25516 `5ce2edfed407918c8cb0dc9262812991d0eb8dc2084baf9990cda0b0a6a527a2`
- [067 - Research decision packet review](067-research-decision-packet-review.md) L25520-L25615 `2895fe84548a3d0a8fe18bfc5163cd0ad7652aabe9e80a5689c1f16da9e75937`
- [068 - Context Lens Source and Preview Reconciliation — 2026-09-10](068-context-lens-source-and-preview-reconciliation-2026-09-10.md) L25617-L25681 `430b8826962fb0b1d91756b19eda274994c9fb03d81f894b2de4a35c56bf0978`
- [069 - Compaction completion Event Authority (DL-039 and DL-040)](069-compaction-completion-event-authority-dl-039-and-dl-040.md) L25683-L25736 `30d2441ecc5843cb52703c085f44673c08a3b2b540bb241cd5b37da06a0ac47d`
- [070 - DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)](070-dl-042-historical-todo-event-migration-consumer-boundary-2026-09.md) L25739-L25786 `9ddf37d724c0b666078c89279b1d83af6849b7d2be4ea730b829e00f862432b2`
- [071 - Restore-point created native and historical consumers](071-restore-point-created-native-and-historical-consumers.md) L25789-L25963 `e6f26193bd7ca1816a17858fb28a2eb5911c45a182fea8231f9ae5857bcd682d`
- [072 - Deleted restore-point passive history admission](072-deleted-restore-point-passive-history-admission.md) L25966-L26032 `207323a6881b544ca175c47ac4d19db7541728b9d69b33c7dce92dcd8657a616`
- [073 - Expired restore-point passive history admission](073-expired-restore-point-passive-history-admission.md) L26035-L26104 `a54e97bd136896dcdb808cdda9b5e39557a53e013f6185cf96eec8936e2485bc`
- [074 - External Research Decision Packet Consumer Addendum (2026-09-17)](074-external-research-decision-packet-consumer-addendum-2026-09-17.md) L26106-L26156 `9c3d9a9b09bdc70f178794f5c450408217ec7bb572e211f21d268ef409375012`
- [075 - Chat WOW Turn Presentation Addendum (2026-09-27)](075-chat-wow-turn-presentation-addendum-2026-09-27.md) L26158-L26828 `683515f98bbb9baa444d8c84f11e07edbfafe66325477f4731b633c990a976ac`
- [076 - Wand Modules Redesign Addendum (2026-09-27)](076-wand-modules-redesign-addendum-2026-09-27.md) L26830-L27554 `3332ba558fe6ca8f260aeac65148e5c51ee5387d70e0a6ed76e969b7ffc2fcb4`
- [077 - Chat Tweaks Addendum (2026-10-08)](077-chat-tweaks-addendum-2026-10-08.md) L27556-L27632 `f352e398447eb640aa353d580fcfca9449bfa1e4690217db0d97e5940d6e5e74`
- [078 - DL-180, DL-181 and DL-185 — What The Chat Opens, Its Column, Its Command Card And The Port (2026-10-09)](078-dl-180-dl-181-and-dl-185-what-the-chat-opens-its-column-its-comm.md) L27634-L28066 `5a7199ffca71772456338ab964a6dbe8a8666728af5c27f6436dc59c565065cc`
- [079 - Grill Me rounds and agreement — DL-218](079-grill-me-rounds-and-agreement-dl-218.md) L28068-L28503 `4eb8ca695594878450684b615ba952cc8e529a07b1e9b9150ad862c2bc5a30d4`
