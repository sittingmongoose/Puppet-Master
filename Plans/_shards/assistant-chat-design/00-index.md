# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-09-10T02:47:39Z

Source SHA256: `b6e967a9240db69b449e5d0861fd4eed988ef07e7e00f2d639f0f7abba686d24`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `e3a2a72f7ef9e4c51c42fd94e7090ececd3666be2c674d1417a3fff039009b47`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `f8ce96add0c1f6ba9c85852dfb6c1d99ec09f5b5bd374fffd3d8bd62406bab41`
- [003 - Change Summary](003-change-summary.md) L14-L29 `fcc3573e335e95b32b1d94130b10860c2c1dbf33bbbcac6d37d22e1802d0bc7d`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L31-L46 `d1bcce5e122ec5f23b0ace5f5205a18ddd3fc943b376b1b79618656dbdcd86ac`
- [005 - Executive Summary](005-executive-summary.md) L47-L51 `77828b820c8f9a3b612e71f7f4951ca0d76443b1f0d8cc17579a74552f9e3f1f`
- [006 - Table of Contents](006-table-of-contents.md) L53-L89 `6b24bb3fdcac246ccf6afe2da779a5fc993d10118b495d41820e8ea62cd02927`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L91-L206 `2a11f4e377fefe2cd2cc8488175bd808c9ed2a537cfd688616307b453f76fb58`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L208-L230 `8a7639a02db8f76a666dbb5ba4d7e2449842a52038aba169e6e47ca82036397d`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L232-L238 `676e991b1bf80440e912d0e5ae437a728d2ace1a8ed9dea5245feee9e7eb5a56`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L240-L288 `45307eac639c72007ad54eb120e75da441a7ac1ef7bfaf45dd6ae956be50a2a2`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L289-L432 `5852d02b30468e8fc97166efde19d040ecf2130233a8ff7b9c1b091f741c05da`
- [012 - 6. Teach](012-6.-teach.md) L433-L471 `0740237dbc255681eb812d5abba18eba6b6db9e208bf6968b7b991b16adc63f0`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L473-L658 `20effff52c901ebefb230839879f5bd95f62e0a8e561d67462de56e29529aa25`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L659-L951 `2d4104f407839dbc9a1af6da825f7f7c56353d0ec765c611dd72db0f09b6b6a3`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L953-L994 `019cd88a240f1bf277f8c8efe2137663bee21dd9607b9c6518cd15548abb0fa0`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L996-L1066 `0dc936cf2d4e7bc5eb4140943fc9a446f846918f24f9858a7cdcb45b0fbf1cd5`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1067-L1244 `e214405dd75806e76df5da75ba296899477b6fbcc921e46b28a4ab8f2f67d8da`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1245-L1353 `3399d9134e56eae738b9af35ed54e16171b43028a4683e13b6cc834a5d2c520f`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1354-L1769 `c88610f79affeee47e9dc0422536237b09e6a463f4b6f224e170f9ed5b8ed008`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1770-L1887 `3882b25561d9ec73cb0d5a71ee1a1d8c1a833957752c48aecc08a729e7bc30e2`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1888-L1921 `9133a768e0c73af0ff9e3f43b998dd4df263cf698fc4cff1602d2d5063f53d20`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1922-L1961 `405bca22184b0185580e0d591e863ae1bf76e5fc323e1110f35b6b722c203424`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1963-L2076 `23f855b8b1e06071fb237543df25c1051b9e48eaaf26b57801e983454f38d3b4`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L2077-L2088 `c1bdee689fabfbde07546f7707d82ee8d2bf4e7f02d27789ead3de212b191263`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L2090-L2099 `4ad5e3532d1e14e5608d9ab2d54843c5abf7831b4e9ae8b56fac295b799ad34c`
- [026 - 20. References](026-20.-references.md) L2101-L2130 `9ea9a628bfecec3168e4eea687bfb607c674bda31134beb47f87ee918ffaa4a7`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2131-L2149 `ec26499c792b0621a021f9bd842153e87dda3a6beb0c14f396f54f172d4a978d`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2151-L2182 `62dbf1bfb45bf23fe20c4edd70c37e02b20fff1cbeb8e542275b8e14f8583ac0`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2183-L2278 `1970ca5a70aa3cabd6aa578727497ac8b8fc4bb1caa43fe6d2195156d9ff5442`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2280-L2333 `b1e852749ed9f5cabeb62e9cad11233fc71aa0fd6a31f57559565ff18737d777`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2334-L2340 `12a5ef6b824007e000428098dafe4a0a899ed1fdd8bdaf18fb7847ed6cc38cfb`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep)](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2341-L2443 `c36342d14e5771bb8d2b08ae075b209494d2ba2acf650b6d858b610b21863a11`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2444-L2580 `0a79b1191e3704e0c40faeb12e2325a8a339395bee2cc8042aee595fb63a6cb9`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2582-L2625 `23717b57b58556e52b0889777021901441ee1d0925980bfdbea487d2c23af306`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2626-L2735 `a10fee327517ce685df05e1a38de9013a81d2e05bfc0751cf747f7eca3fa0c4c`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2737-L2752 `f91298ac417f2dbc0dc8ab5fe5e42a1564aa59d3e23659a8d5ea8629fb754b44`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2753-L2765 `4bf3322d630c75611491406808528d2afc0815870fc20611f01edc36920019d4`
- [038 - Ledger Compile Addendum - pldg-20260630-001-feature-intake](038-ledger-compile-addendum-pldg-20260630-001-feature-intake.md) L2767-L2835 `6e52967ebd80781dd5b0383b04d7910dd444a73c53c7cab29642505075929930`
- [039 - Ledger Compile Addendum - pldg-20260624-001-provider-updates](039-ledger-compile-addendum-pldg-20260624-001-provider-updates.md) L2837-L3479 `50cb2374a0d9512a5a7d1cbf322923385d8f632f344702110b08919bb81c6116`
- [040 - Shared actor-boundary, route payload, and blocked_notice packet](040-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3480-L3500 `2ccd37fc84d95b8ecdb46184348450344aa9462e1717e294d4a5670591162c38`
- [041 - Shared Conversational Actor Runtime Identity](041-shared-conversational-actor-runtime-identity.md) L3502-L3516 `a0d73adbbb333d751e3fddc570186f3ff66beac91d694da3206c88773834eb9e`
- [042 - Chat Route, Permission, and History Behaviors](042-chat-route-permission-and-history-behaviors.md) L3518-L3532 `0207172497f86e4ead6d7e4482ae6846f31de76a7d5e2baa92b3ad623da0efb5`
- [043 - Owner / Consumer Map](043-owner-consumer-map.md) L3534-L3538 `8df74c2a58f97786f754cd41370c33f91cb66d09c165bb686ad196a7153a7479`
- [044 - PlanUnits](044-planunits.md) L3540-L3591 `e0cb9b46d3bc8e80670d2f09484a3c327e6bed4d40d1e59d1b8b9daa5e459ece`
- [045 - Shared runtime projection addendum (2026-08-13)](045-shared-runtime-projection-addendum-2026-08-13.md) L3593-L22201 `c37f657e2bec2c1f431385cdcb962781b237e57f9b055f7cbb0275563c40fab8`
- [046 - Migration Coverage](046-migration-coverage.md) L22203-L22233 `1bae016eb095e6e5ea9e3b9e7096582a38ab316d86826a2951ae4baa9ac142c7`
- [047 - Ledger Compile Addendum - pldg-20260614-001](047-ledger-compile-addendum-pldg-20260614-001.md) L22235-L22323 `97763069d0bbcc3b90b8b1d4478994d1ef06c29583fa99ed05f69202ff341df5`
- [048 - Ledger Compile Addendum - pldg-20260615-001](048-ledger-compile-addendum-pldg-20260615-001.md) L22325-L22422 `5f7a92abe8c3747c00aa928282db54f5d541a96fffcafb1cfcd0759fdc9af991`
- [049 - Ledger Compile Addendum - pldg-20260616-001](049-ledger-compile-addendum-pldg-20260616-001.md) L22424-L22736 `d94a4f92b1583623d5819872c785fb686ebd823af2d9a0a336a54f8478e2b2ac`
- [050 - Ledger Compile Addendum - pldg-20260616-002](050-ledger-compile-addendum-pldg-20260616-002.md) L22738-L22805 `b51334c5b130a08be0b8c7ff6a2a6e96632ff768651ec3efeab306e772a5b217`
- [051 - Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard](051-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md) L22808-L22896 `435e65028b8a73b4d008b8f9851dfe68d774e421009fef0cf6ed53c67619f39b`
- [052 - Ledger Compile Addendum - pldg-20260622-001-fff](052-ledger-compile-addendum-pldg-20260622-001-fff.md) L22898-L22984 `6d290ee6e31d905de077226ee46412aa48c417fa4b8aadfdada83b8de75f2df8`
- [053 - Ledger Compile Addendum - pldg-20260626-001-feature-name](053-ledger-compile-addendum-pldg-20260626-001-feature-name.md) L22987-L23361 `1bf7e84261eb9a1c3d02dc39327c692811c374ba36d81bcd3035d91529d06af7`
- [054 - Ledger Compile Addendum - pldg-20260627-001-feature-intake](054-ledger-compile-addendum-pldg-20260627-001-feature-intake.md) L23363-L23574 `dd8ba7dc54990e8fcd6b90ae362d2270de251f95b4d7bfdcf1b6404d2c08e7aa`
- [055 - Ledger Compile Addendum - pldg-20260701-001-feature-intake](055-ledger-compile-addendum-pldg-20260701-001-feature-intake.md) L23576-L23655 `21f6e2bbf76731ffc483666d0e4a124335e17561f48c37cb7561a6f1c4844440`
- [056 - Ledger Compile Addendum - pldg-20260703-001-feature-intake](056-ledger-compile-addendum-pldg-20260703-001-feature-intake.md) L23657-L23722 `1322d8bdef9d59ae3569a05897a164964cf49244f38ac2e2ff886ee582d2902a`
- [057 - FABLE Residual Chat Mechanics Cleanup Addendum - 2026-07-07](057-fable-residual-chat-mechanics-cleanup-addendum-2026-07-07.md) L23724-L23795 `2b2662cbc13c01a5a422b4d8c0ab3e453ceed2bfa6a0bca042a4ff27056ed7ab`
- [058 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](058-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L23797-L23841 `4348fa82ff2e9724f7b323c24b2870de864010dee51ac4354bd11cfbe38d6a3a`
- [059 - Usage GUI Propagation Addendum - 2026-07-09](059-usage-gui-propagation-addendum-2026-07-09.md) L23843-L23919 `874180112fe66bd7842a5f2fc6f8839846758179b707654fae0b1c3c18776772`
- [060 - PMConcept6 Chat Polish Addendum - 2026-07-16](060-pmconcept6-chat-polish-addendum-2026-07-16.md) L23921-L24140 `232ac46e5ef3815db275a03253cd4f9c07bfdbbd6b7707e7f3a60f0ce3a484a2`
- [061 - Immutable conversation restore-point lifecycle - Known-37 completion](061-immutable-conversation-restore-point-lifecycle-known-37-completi.md) L24143-L24160 `b92d366c81566403a9e8c7230fa133e158387ffda780536c0160ccb8c931fd01`
- [062 - PMConcept7 Concept Promotion Addendum - 2026-07-23](062-pmconcept7-concept-promotion-addendum-2026-07-23.md) L24162-L24528 `ebc9f22bbf5196209d23fd2d9efcfc18b37a9f2bf9ab29c98b5190c57c403947`
- [063 - PMConcept7 shared Assistant seating and context surfaces addendum - 2026-08-27](063-pmconcept7-shared-assistant-seating-and-context-surfaces-addendu.md) L24530-L24620 `30d2f31a936d3f12199d65843adeb1cd91d45fa63df4065a6eb8a09262657bf7`
- [064 - Additive Correction v4 — Consumed Assistant Behaviour (2026-09-03)](064-additive-correction-v4-consumed-assistant-behaviour-2026-09-03.md) L24622-L24659 `ee52f43342bf17f0725237430c0124c5dc6b7f19f1d35db99787eadbb8074eeb`
- [065 - Working Notebook Surface Addendum (2026-09-05)](065-working-notebook-surface-addendum-2026-09-05.md) L24661-L24769 `7a9451a8bc7038e9bbe24d1bf524dd57d61c364875aac01d920f445a78536e12`
- [066 - Cumulative v3 Assistant Interaction & Surface Specification (2026-09-07)](066-cumulative-v3-assistant-interaction-surface-specification-2026-0.md) L24771-L25119 `6fbb4b7c4cb2ba0f3a44889403a7ca41cd036c30633884040bbdc02b100342c3`
- [067 - Research decision packet review](067-research-decision-packet-review.md) L25123-L25218 `db646723c6acd1f146e816005c90a41f4a300b0c75f386c42d07d3ba3c214566`
