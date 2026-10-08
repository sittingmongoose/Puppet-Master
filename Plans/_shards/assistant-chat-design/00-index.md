# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-10-08T07:37:52Z

Source SHA256: `284326628056f4106d8107cd25d46608b0264d0d974da3feefaddb8ef84f1728`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `0b8a62bc472720add8de0c34b32a47e0458d8b6f32ff6610b7b367f2bb90f8de`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `677195a9f1451d7be117afe15a7217d5e50bd936a1aa0cbfbc17f7fec6b11c1c`
- [003 - Change Summary](003-change-summary.md) L14-L30 `89bb786e1c6489a086eab48f0b3236d87fbc158924a8e18ec39846a5cc719df8`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L32-L47 `685730a625ef464bce1613e28cb5a66479604ba82d4e57b6e9387b71bf8cad2d`
- [005 - Executive Summary](005-executive-summary.md) L48-L52 `3d36d8cc36dd94914d9b0bb9750ecf8f6120192b28b63a155e66664b91353021`
- [006 - Table of Contents](006-table-of-contents.md) L54-L90 `a84d805ea69f8ee667af20d072de7bc9d33edafd3454344a4739d736d03aaeec`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L92-L207 `a88ccb686798058c106572dc7567b5ea9be47386a89725d6dfc5c2343cd8e987`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L209-L232 `92280052d020dd6e48ecc4dc8040881bcf9d3834beae6b2e7d4f3cc20584562e`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L234-L240 `42a0a05b01ad9c6f4337382802de7f59d9c1df3dd5f1b6dcd713af3eca3159e4`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L242-L291 `e9528bc1117dd7e29bdb3b4f8fd3a63c7fa1bdb336636acc213c1cba9d182b62`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L292-L440 `188cb662a6cf9949f4a67ab81d46d91e7cfbda6f43eb06e77c1bd76a7f9555c9`
- [012 - 6. Teach](012-6.-teach.md) L441-L483 `7e77f91ed34249db5499ede3b36efc002198de4bb2bd8d360e88bbdaa4a77ddb`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L485-L670 `1b67fecb4514a8fd13abefb91949430debfdc9631749e410353a91732223eead`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L671-L963 `123880e8eb35309e8d2b56ba9d261b66525bf6b1fc9dcd74fd716e435ba99c97`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L965-L1007 `67cd2ee79c30a87e4f1da8a571c4ae474511fe55eaf8a51cc5bfeb93e9395ee8`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L1009-L1079 `108be42b2b0d496c8b1e8ea993ca25354727cacd45cb66c707cbe708de213676`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1080-L1257 `2e73f643689d832d9a6cc3f0f375aab6e5cb6f2eda8afa9d22bbf1e8b84bf13c`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1258-L1366 `10fd0cf430c3308f7e3ce8b9dbce92427f7fba68ab2e7ba5c557c7c9aeea0b45`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1367-L1782 `1acc12057751f983f7dc3a6f140dc4e271b387c2d0f0e9fb645585be24585950`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1783-L1900 `5e30b4a0abcd9a308d040ddfc5d028a2cccf485cb91c1440b2f07347b81ef5f6`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1901-L1934 `bb8e5fbbe61cd68376ab53ae7e5c5b0918c8f1fef0aae3b6fd184666cfd3f443`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1935-L1974 `28ea51bf047fcc264ba44ff1c757f20d5aeb9b9484c66b71019ca2c6ec807066`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1976-L2089 `015b0b3fd3f6377c1c6e07c82a00b9925418425b62e94660d650d39e30c12688`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L2090-L2101 `3623f4f2435cf33d9d6d4db65a5d61b1f165e3898dc1c8a41664df8bc1d0e5e0`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L2103-L2112 `178eb4371235ee7287c179fffdd3da9bb202138a90188922dcca322ffbb00c44`
- [026 - 20. References](026-20.-references.md) L2114-L2143 `876e441a0e8d3832dca91653b67e7f303d9fe54a99630e440e5034ffabffeb47`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2144-L2162 `9b7877da40b3651a8f7b4c3072b8553d79fc0f6758705bce149f2a60275568f7`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2164-L2195 `6af3f7fa6010698df1d35c9cf7767d2f450930e0fc65623da629e7a6457679a5`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2196-L2291 `e6b90db1a21b07cfe7a6354e81bf70f00e1cb43b8f39600a53a953170e0d1ebd`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2293-L2346 `75d1afb66f5007cd7a775ad1369ec760b0e961179ece7d1d49a749149812fe2d`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2347-L2353 `e53ef65a307f1baeedbc07d32837777840866e1ce69fe65634139cbb94112edd`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep)](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2354-L2456 `cc39b3f4441cd11d0bddf554c1a055c32e398b8026115301854530015597f9a9`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2457-L2593 `6583c89566db33c7b58b913ec7ad86d0e9eb350ce96fa919ec581df189b3c769`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2595-L2638 `ca29c9731b37216f68b8691506d4aa484d5aa84af9ab9e92de6604497e35a011`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2639-L2748 `ce2c2814625ed082cbbd4b52cd982511547e28d6991753cd2c0d044106299f92`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2750-L2765 `ce638d50f14a5278a6842916f9229859d6d65a8373af51a4ff6e6291259c1a1a`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2766-L2778 `3f8ee54b6dbe6ac075a25ca07293a4b60b7107255514007d1aa78a82efeedee2`
- [038 - Ledger Compile Addendum - pldg-20260630-001-feature-intake](038-ledger-compile-addendum-pldg-20260630-001-feature-intake.md) L2780-L2848 `6bb75ed976db3e69a4243c521b289e47b2761cc68f29249f53c0a7c18aeb6a15`
- [039 - Ledger Compile Addendum - pldg-20260624-001-provider-updates](039-ledger-compile-addendum-pldg-20260624-001-provider-updates.md) L2850-L3492 `71f19df9f01c991edf578fba6636429cfb65b25154b4436bb7f1d5e1e0eabd81`
- [040 - Shared actor-boundary, route payload, and blocked_notice packet](040-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3493-L3513 `f6d9acc121e0d0b6575ba7dba9380722ae9d6957a41c203e5126894856ec07d3`
- [041 - Shared Conversational Actor Runtime Identity](041-shared-conversational-actor-runtime-identity.md) L3515-L3529 `ea463c06e869e432bbcd5e5b889faf8d6d6b7c61eb39d89d5dd83e7e74a0310f`
- [042 - Chat Route, Permission, and History Behaviors](042-chat-route-permission-and-history-behaviors.md) L3531-L3545 `2943a3788f2e79ac600843d6a9483ed731459f319768bd43f51a3ede9cfb94b5`
- [043 - Owner / Consumer Map](043-owner-consumer-map.md) L3547-L3551 `9c7027e035b384d3e95a0cc9430dc6d947d608c416775a0fcff3cebdb27e7198`
- [044 - PlanUnits](044-planunits.md) L3553-L3604 `95e0a810c808031f318e1ec6598095440e457e7ec034c43530dbe43329a3fb1b`
- [045 - Shared runtime projection addendum (2026-08-13)](045-shared-runtime-projection-addendum-2026-08-13.md) L3606-L22257 `07007c1dc996b583aa393d8c92aae650af329d2e669ec283308537957d94d2e1`
- [046 - Migration Coverage](046-migration-coverage.md) L22259-L22289 `546e045fe9d43ca56a95fb5aa18c2d3101d33d0fd0111d918ac0bc8020813d74`
- [047 - Ledger Compile Addendum - pldg-20260614-001](047-ledger-compile-addendum-pldg-20260614-001.md) L22291-L22379 `b93ff893d5150e90080c1dc053208e56bb86cdab68a03763a31869e1273e0c4e`
- [048 - Ledger Compile Addendum - pldg-20260615-001](048-ledger-compile-addendum-pldg-20260615-001.md) L22381-L22478 `5dfdd02ab23c18b34c92957c4de1a152c002789020dbcdc5ee4d94c8d3c980be`
- [049 - Ledger Compile Addendum - pldg-20260616-001](049-ledger-compile-addendum-pldg-20260616-001.md) L22480-L22792 `e4e5dd6573a7d7722d6224721e39c451125d1164885ab0f0b90d8549d30aa69d`
- [050 - Ledger Compile Addendum - pldg-20260616-002](050-ledger-compile-addendum-pldg-20260616-002.md) L22794-L22861 `d8e6f42ca0dd229efdb51c5951a26306850cab6d77be2bed203a464eea7f39b7`
- [051 - Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard](051-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md) L22864-L22952 `338a1659ce0b51ed5fa80cd354e0fcd529fe60deefd105842efebd72afb1f0f2`
- [052 - Ledger Compile Addendum - pldg-20260622-001-fff](052-ledger-compile-addendum-pldg-20260622-001-fff.md) L22954-L23040 `e7a7cd6c14380b8dfeed7afaf4b6b319136a3a8f84ca8fcf11371a631c9e99ca`
- [053 - Ledger Compile Addendum - pldg-20260626-001-feature-name](053-ledger-compile-addendum-pldg-20260626-001-feature-name.md) L23043-L23419 `43ccc279bf255b0fcdddc58b79040704519257f1156e0c22fe9510d7fc97f144`
- [054 - Ledger Compile Addendum - pldg-20260627-001-feature-intake](054-ledger-compile-addendum-pldg-20260627-001-feature-intake.md) L23421-L23632 `c86e7fb35123715c5b5f4130cc78e7667c3e7709283925fda164b347ecb8a144`
- [055 - Ledger Compile Addendum - pldg-20260701-001-feature-intake](055-ledger-compile-addendum-pldg-20260701-001-feature-intake.md) L23634-L23713 `73c9067f55fd8d8998c585869f5845cd1d1160d1ccb778c1a4c9ba06b588a014`
- [056 - Ledger Compile Addendum - pldg-20260703-001-feature-intake](056-ledger-compile-addendum-pldg-20260703-001-feature-intake.md) L23715-L23780 `6446898e57542b078b5c5c64f187c9aa42d1b4ede6c8ede89c0ff642db4c61c0`
- [057 - FABLE Residual Chat Mechanics Cleanup Addendum - 2026-07-07](057-fable-residual-chat-mechanics-cleanup-addendum-2026-07-07.md) L23782-L23853 `6738a3695526a4a6ce18dc1ad874729d2f3d1691d194bb0f12d8a12b6d223fa5`
- [058 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](058-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L23855-L23899 `1da0456463746071c2f09099a3541d2c72cb60a7e76ad9bc499987c93a61f285`
- [059 - Usage GUI Propagation Addendum - 2026-07-09](059-usage-gui-propagation-addendum-2026-07-09.md) L23901-L23977 `5e5157dc301c0152589df3a23e224345c736b8beb75f0e89e023c7ac17fc6ace`
- [060 - PMConcept6 Chat Polish Addendum - 2026-07-16](060-pmconcept6-chat-polish-addendum-2026-07-16.md) L23979-L24203 `a7032f12a43ca2b7a6b0e79d73c4afc765f56e945636bbdfa6e739abaa2024e7`
- [061 - Immutable conversation restore-point lifecycle - Known-37 completion](061-immutable-conversation-restore-point-lifecycle-known-37-completi.md) L24206-L24223 `4a4178bc3e31c5b70ba9d8f8b12658ea154066f55718c9ef3ef0c32c6ea6fdf0`
- [062 - PMConcept7 Concept Promotion Addendum - 2026-07-23](062-pmconcept7-concept-promotion-addendum-2026-07-23.md) L24225-L24591 `c5f250032a1224980c67026d5bfdb62c496620042f11ac61c920e059b6049780`
- [063 - PMConcept7 shared Assistant seating and context surfaces addendum - 2026-08-27](063-pmconcept7-shared-assistant-seating-and-context-surfaces-addendu.md) L24593-L24683 `4fcedd19fa49df9e35ada9d33a7c43bf55d9836492c2a6ecc2ef29329fa6d71f`
- [064 - Additive Correction v4 — Consumed Assistant Behaviour (2026-09-03)](064-additive-correction-v4-consumed-assistant-behaviour-2026-09-03.md) L24685-L24733 `a3bb207ea968cb1bef3161ca6f095dfe52726ffebfc4ee9eedb73f22d3094c24`
- [065 - Working Notebook Surface Addendum (2026-09-05)](065-working-notebook-surface-addendum-2026-09-05.md) L24735-L24843 `a0eab6ae17516512b32316b1e5f07bc424a0033558c2706b7180162aadff2deb`
- [066 - Cumulative v3 Assistant Interaction & Surface Specification (2026-09-07)](066-cumulative-v3-assistant-interaction-surface-specification-2026-0.md) L24845-L25193 `f08b3be2347fb126dbf3b207633f2c542eee86dc0454c2afdd35bdbb83896d87`
- [067 - Research decision packet review](067-research-decision-packet-review.md) L25197-L25292 `da86cc5d0b8b266b04f26879ae6638cbc02cfd62400b2a5fa77b1096890bf2c0`
- [068 - Context Lens Source and Preview Reconciliation — 2026-09-10](068-context-lens-source-and-preview-reconciliation-2026-09-10.md) L25294-L25358 `7e909f941fc8f15276de779d48577778d238ddd0a2d5f84d040562fa9914aef6`
- [069 - Compaction completion Event Authority (DL-039 and DL-040)](069-compaction-completion-event-authority-dl-039-and-dl-040.md) L25360-L25413 `0423b652fd9005b5184e4746a1ccb28144e141f89973c2339e17df9fa3fcf825`
- [070 - DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)](070-dl-042-historical-todo-event-migration-consumer-boundary-2026-09.md) L25416-L25463 `1f4b7c378c88338af94665875b3eaa558c6d602034ab0d240e7dbba954a3d51d`
- [071 - Restore-point created native and historical consumers](071-restore-point-created-native-and-historical-consumers.md) L25466-L25640 `ac8fe199f10eeb7b8274a376b0d9c20292e36dc6e286222938145833049dc021`
- [072 - Deleted restore-point passive history admission](072-deleted-restore-point-passive-history-admission.md) L25643-L25709 `ee0798f09c5246e90fba435aa3ae84b18c287b9b292dd7dc024c8397701d0033`
- [073 - Expired restore-point passive history admission](073-expired-restore-point-passive-history-admission.md) L25712-L25781 `73a196fa4f8912fa4b77aed40445494765f177e09c39a43b2ae2fe9d92614118`
- [074 - External Research Decision Packet Consumer Addendum (2026-09-17)](074-external-research-decision-packet-consumer-addendum-2026-09-17.md) L25783-L25833 `52f5879b22436f5a57f623a0a447f5247be5932874f254f13e9643a40a8131dc`
- [075 - Chat WOW Turn Presentation Addendum (2026-09-27)](075-chat-wow-turn-presentation-addendum-2026-09-27.md) L25835-L26349 `639860272a2acd61de43c54af8b4e29b532c22a3b1913c913e77e2c335e7e71c`
- [076 - Wand Modules Redesign Addendum (2026-09-27)](076-wand-modules-redesign-addendum-2026-09-27.md) L26351-L27040 `e84ab1d05e8385166f4770b28edb07f2c98e7d7d94401536cec7137aae6b65a1`
- [077 - Chat Tweaks Addendum (2026-10-08)](077-chat-tweaks-addendum-2026-10-08.md) L27042-L27106 `6ade9e9235b3b301b9711019380c93305de1e4d638b0da1b097e239d62993440`
