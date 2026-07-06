# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-07-06T15:32:59Z

Source SHA256: `db0b94c750c7b812ceaa0c9bafd22d6e571af57eae0b7e4ecd0a3a8b7442f385`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `d7dff753ebb35fd7892409851c171f664f4cb7c78199b56a5cf15205c88b5c72`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `0f96f6a2a1288a369030d7bcf925f512b2d82e10afcc9bbd15db52669e9248e5`
- [003 - Change Summary](003-change-summary.md) L14-L29 `5aa0e136d81714b804b60b8d8c9b4cf821ed91d24ab6c914432a0028230d963f`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L31-L46 `f145aa8f1ca34a075a23b7b07bff84721464385f7356e2ef4193044f5c1bf01b`
- [005 - Executive Summary](005-executive-summary.md) L47-L51 `b73156c9f9024a5e68ff44536c0a6ab534ba06777fb2c7178cf818fa4a616f6b`
- [006 - Table of Contents](006-table-of-contents.md) L53-L89 `ec6f24942292532db0888552b58f01af09521a02af2ee284ea42d68aa29003f1`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L91-L203 `6f0bae39bd5ccf74da0311c407c280141198f01c48d67f00a270c7a6995501b2`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L205-L227 `504eaa82618a57c66144af89c347b5ac95929299d9f6086e6aa735a7865ba5ea`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L229-L235 `1dc20c1de0a4a5654a9681d7f38f46a9a2f93c2a68dd68cb81ad6dea1052fe29`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L237-L282 `3e2691b2ee8377773d16db8dd11629346df4bf9b1cffcf80dc013420a8de7e8c`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L283-L426 `43bb7d29355934362a5bcdd7ec6518b5f798993d7abf1cbe099279d0394e456d`
- [012 - 6. Teach](012-6.-teach.md) L427-L465 `630b1bcabcbca8b8407da31c5bee275f9ab3b3c40880a86e960c1b164ffb305e`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L467-L605 `95d7ed6b0d4d8f44df7484db04ffa4835c405cbe0c68ac8eb19daee426e2e92b`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L606-L896 `df912255075a09395546d15beb9f6ad80884b067ca6715b454d9c168f9900386`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L898-L933 `c84574a7d2c5d40931e27a1098a719edfaa3d5b0623e29dcc6da2c1f0276917b`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L935-L1005 `df54b99bf04d9952b818e4c9d698d1d475afd0b32e8011087d9a4a0059a7fdf6`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1006-L1151 `eaa62901d8f06caa94c41a9ac28285820163a86627014ce00303d2cc62bf2a9d`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1152-L1260 `55e06b9916eb8eb1ec02e15a1394716ca481af07bcda1e58983ffaa838cdf661`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1261-L1674 `6b07ed2bfac24720f1589a394b6d90295fef3d995f837477cb96d26a0dceb238`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1675-L1792 `b9c2db93452bac88fa67dcd24e5c515e55463ff4782d8b6afbc4a9e5a8de3235`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1793-L1826 `de738237c157bf2d635a4f7f11a1f7773b5209e950e129092968c5344746e09f`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1827-L1866 `f3a15fa8617ea99c15f26d5e0bc1ac63e5debdfb1f0fc4b9a9a6d970310bf050`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1868-L1980 `28322e9a8b70c98dd16dfabaa2482b83e77ecdc18f701ef9085d52e689b0f57f`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L1981-L1992 `7473f53a084756c2e3c0ae427e34f38fcb22ceaae8d9a3f102802998c0c474d9`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L1994-L2003 `6966c619b040b58531129e7b41ececb20ed66bd15b44cefc0a2813ddf4f56460`
- [026 - 20. References](026-20.-references.md) L2005-L2034 `807f8f0b77556fcda1d250dddb345ce461b105bec025ffa5a98f566531e45d7e`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2035-L2053 `0d3e96733937cc49a904077fb3d5fc4e5d664403e447ad6598889f6fc26c1266`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2055-L2086 `1de015419af0d2c50862bf28c2600308bcf68d8196a72cbac2efc9696b330570`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2087-L2182 `e0094ac74f98aa2d80802676f03a0f0933aa0ce8ae2deb0cc6c03a09cc956f82`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2184-L2237 `1e861b0cd1404e970afe1d909601e45dd0afcd53b7a46c3c1f255fa7065d066b`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2238-L2244 `77ee12126948fa98ea888122fcb677cec1cddf9676a6dc29acc50e83c3e38a4e`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep)](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2245-L2347 `2ea13998006f92402f3f3e478b724ff4529b9905815cad06b8576ee3004fa7a9`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2348-L2484 `19fd2e4dfee2f18cc295bd08594ed94be28b19f3787c5965256ca73c5bc04a62`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2486-L2529 `5583bad07589014ae6af4099c054cb6baf7d65fe18bbd7c200b10fb373f821f6`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2530-L2639 `9dba19160db8ef325b69ebb5c4ecb0abe779c173200cdd0a545a93016c823628`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2641-L2656 `7072230e9add03f6852bd8d92e1787df493f5becbe23d5730c3747fdd9b58a30`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2657-L2669 `1eca181f6df37ce470bb254ececba4e0722bb78a6bdc7c76d5edcb812e942b1b`
- [038 - Ledger Compile Addendum - pldg-20260630-001-feature-intake](038-ledger-compile-addendum-pldg-20260630-001-feature-intake.md) L2671-L2739 `5569c3e26a151593531741c421f05caa67b90c9436cf10715a634f556026efa6`
- [039 - Ledger Compile Addendum - pldg-20260624-001-provider-updates](039-ledger-compile-addendum-pldg-20260624-001-provider-updates.md) L2741-L3380 `45977927995f2a4326dd053b31f52f829a2429d0363571efdd90320131dc18d9`
- [040 - Shared actor-boundary, route payload, and blocked_notice packet](040-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3381-L3401 `e98374bfc6bbbc464f6ffabf05b2907ea1795be544d433455754bfaf1c85362e`
- [041 - Shared Conversational Actor Runtime Identity](041-shared-conversational-actor-runtime-identity.md) L3403-L3417 `9547c66b1f8057c82d0489a9901c491e40f2c5ac470727038a81e921b212508b`
- [042 - Chat Route, Permission, and History Behaviors](042-chat-route-permission-and-history-behaviors.md) L3419-L3433 `ec21023bb76497bb120de22a233dbc97d7cb6ee07b05a32743e6873e43f7c13d`
- [043 - Owner / Consumer Map](043-owner-consumer-map.md) L3435-L3439 `d9fd9263ad41963880721447758633b6cf2d2644b71fd145d6786291406da32e`
- [044 - PlanUnits](044-planunits.md) L3441-L21834 `712f0ad02199cdadcf551efe1a7fd027b8e99df14ecd1ff5d125f44a1492fd86`
- [045 - Migration Coverage](045-migration-coverage.md) L21836-L21866 `46ebd78b7ca6844c7e6734fb51a04ecdbf091f17388ef36bd5caa03ee65fb7a7`
- [046 - Ledger Compile Addendum - pldg-20260614-001](046-ledger-compile-addendum-pldg-20260614-001.md) L21868-L21956 `6ebfe1fb3a03d2fe18dd79c1c30fbb979cde6fd32a66cd60d1ce29c622e3106d`
- [047 - Ledger Compile Addendum - pldg-20260615-001](047-ledger-compile-addendum-pldg-20260615-001.md) L21958-L22055 `f9def38a916cf62b97aee53b1352083dbaee4770148d3bd29efd89a273e041ea`
- [048 - Ledger Compile Addendum - pldg-20260616-001](048-ledger-compile-addendum-pldg-20260616-001.md) L22057-L22369 `b54da0fd88fba71a2137ed52eddc4bd1c3045421b9b985a361cb01ae5a8d67a6`
- [049 - Ledger Compile Addendum - pldg-20260616-002](049-ledger-compile-addendum-pldg-20260616-002.md) L22371-L22438 `0a374fb2f8481eeb1bde8d61c166636782b37b5125567b09202df8d7d83a0ca6`
- [050 - Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard](050-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md) L22441-L22529 `e929eb946a57547ae9bf50bc5376b70f9fc754fbffa855abd537c27c5c22041e`
- [051 - Ledger Compile Addendum - pldg-20260622-001-fff](051-ledger-compile-addendum-pldg-20260622-001-fff.md) L22531-L22617 `0f00f2c14c2d90bf89b190993d5640f1270facec42bf9cb51876a04d95ee0778`
- [052 - Ledger Compile Addendum - pldg-20260626-001-feature-name](052-ledger-compile-addendum-pldg-20260626-001-feature-name.md) L22620-L22994 `31cd8c5ba477d283f7900fc2451b0d27f0726af802bfee1e36837c7d7f4b1052`
- [053 - Ledger Compile Addendum - pldg-20260627-001-feature-intake](053-ledger-compile-addendum-pldg-20260627-001-feature-intake.md) L22996-L23207 `45d5151fdc6bdce400ca4af80913c0514fa46916fbb1200d06106623bd270e86`
- [054 - Ledger Compile Addendum - pldg-20260701-001-feature-intake](054-ledger-compile-addendum-pldg-20260701-001-feature-intake.md) L23209-L23288 `a387e9c1a2074e024e1d3fe22f7d6c211081e3332a8f4d54b675347ad294e2ac`
- [055 - Ledger Compile Addendum - pldg-20260703-001-feature-intake](055-ledger-compile-addendum-pldg-20260703-001-feature-intake.md) L23290-L23355 `522f01bccf16b170c72121ba149a313b50d1cc2979c5397f560b27ee3ac3818d`
