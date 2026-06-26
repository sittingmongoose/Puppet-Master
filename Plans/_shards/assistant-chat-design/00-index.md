# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-06-26T16:51:50Z

Source SHA256: `5e64367eb48c2cf54a7b091dddf3fecfe85f5b7f7d8cdd5ad2ffa18a28c3aadb`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `9e99be95bafae47e83646e21d9d96eb7e3136f0130ed6f88ecb9124a3a20897c`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `4a90581d031e78d6cdc2cf23b473c346401d8095ae47068f5714e240efa2db9d`
- [003 - Change Summary](003-change-summary.md) L14-L29 `d96e13f571378cb04d4f96c9f99bbd7f1854de8fdce71220ec061c3a3d6b9a8b`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L31-L46 `87aab76805400f4c83ccc1d32ba085605d3267831186807a5a3ac20b77aac48e`
- [005 - Executive Summary](005-executive-summary.md) L47-L51 `145a50df1ec06e324e603afb4bfea96c4f29301e77635fb899316265ecba8f98`
- [006 - Table of Contents](006-table-of-contents.md) L53-L89 `eb81ed11d5477747065da5a964f1a3aec5f71e5e875e098b8f4a7fbb79f735e4`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L91-L203 `1f55264cd7d6031b85f2cbb8d7fc8b34f5b4c27a7e91f2766f95924abb8058a7`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L205-L227 `6dde86e581f8ffb0e9f2acbd26e49cf877f81be220b77003b39d255b48119e3d`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L229-L235 `a7ef9aa02174f51b8dd561347218855a82d7fe859d8c3fc096931da3fe0b5fb0`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L237-L282 `deaea5e3791f148492d5dffd85a82dcf72df4fb353e4a0eafe38071b7c938a1e`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L283-L426 `218960e0b3309ea10aa1e9f45148b6f5690e1dbeccee4e659e3a0b826df1fc84`
- [012 - 6. Teach](012-6.-teach.md) L427-L465 `44cf001983d1cb92a9864ab1a8b7983eea9cda10f0d1653577ee61e461798c3a`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L467-L605 `67e0f5264e6bee1c8c31f4bf3bea097c1605226627d86f2c63856953310ae07e`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L606-L896 `a4bd82760ede7d77b7d8119cde1f9c33ee8c683b00923134ec6e79c116a31b00`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L898-L933 `03f1f7e1ff30183eefbab176533bcf1b01481f5bd9b8cc428820e3e20f1cf853`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L935-L1005 `68b8a3926f1bc78f94ae69324dbf72d3fcb2baf7430b77e4bbf7e3ea2232b3d8`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1006-L1151 `d592efb17af47d748e749f4de55edc6bc31e9ba03cafb2b5436062c3ae9a0a37`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1152-L1260 `6e8e449abedf3fb2f6f38a03912d91611dfeba60a831ce24497a49bf438640eb`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1261-L1674 `6905e4105c252f62fca20bccd82907e1c3accf3d1b79978022d3162e23ace36d`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1675-L1792 `0d61c8eb2bba65dd41277d19a222f87c58114c85bdb21c7f882d0da335859a9b`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1793-L1826 `623d20802c40722e9f21c52c74564477e72d14adfd3299c92be3d6aa7cf452fc`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1827-L1866 `66de8744071a53e9bf94572a5b18a8da4e9758f73e25a9e7d979dbc07d20be28`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1868-L1980 `86abb04b5a853bb74444a1f39269194bd5442a042b2063b902f00c001495d3d9`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L1981-L1992 `837aaad14c4abc52152c672160ab57124c7cde2730903a0ba1aabd880d28cf88`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L1994-L2003 `0b1bc2ca5e531234a50a07bcda59a6ead55f9332022b142b3e67eae7c496ea15`
- [026 - 20. References](026-20.-references.md) L2005-L2034 `5a95063cfd3d4300a8fe1463cf2f420d2e5855c5ff4ed99d750173cf8fd9fa29`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2035-L2053 `3e7087d22318b4228576352b6ef356d248c1ef656f0a7a17b9d746d2c912362c`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2055-L2086 `48c0e9d486d72a851bda0b37dea500ec289489a89c519a66832162ac34f7c87f`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2087-L2182 `5c918f49194e994b4fb7df226c8d0f215df7bb9da38822e59059fcab4989cf24`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2184-L2237 `f35bda01e21fa1942bc94502c8c0339dbc6e2b0a397b465dcf7cc00699abffec`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2238-L2244 `86079ab86a9aa206c42645f3623d535ff5b28bdb23cb998bc8d68d11b7e7aeb4`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep)](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2245-L2347 `0a54b5491f4be1d385dbd37c0a24e97c6cc10a4f24613275ff8b3bfeb22ed60d`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2348-L2484 `88c6e40be25e0f02b54da3449c44bc5d62072b06406f60771221a7944951faa5`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2486-L2529 `d2ffa1aa497402e917fcbdc70f18b5151adbe563588cf823d0596be029c1229e`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2530-L2639 `aa6ebf38ffcfbf56a5371a959d4be1a1f82e172f2d0b003f4ada608f6d3c0847`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2641-L2656 `80cdd5c484944b32dbb3b2af2ebeba7a6ab0be40b40a48b47d171558e799bbcd`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2657-L2669 `142393bab0ddff9efa7850cfda4b1a8eed82b5822a44788ad0eda03f7d333b0c`
- [038 - Ledger Compile Addendum - pldg-20260624-001-provider-updates](038-ledger-compile-addendum-pldg-20260624-001-provider-updates.md) L2671-L3310 `0c39d50bcff33732b1267ac0a2ccc6f24e17e8986507a63d6b2426080aa0597b`
- [039 - Shared actor-boundary, route payload, and blocked_notice packet](039-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3311-L3331 `ddfe17c46001be0df078c61475b5a206ead3d8f5f1453f621d49895231ee2da0`
- [040 - Shared Conversational Actor Runtime Identity](040-shared-conversational-actor-runtime-identity.md) L3333-L3347 `7e897c47ee1a8cba0a37cfaddf0e0b6b7fa65a74d2532bcf6036d13e5a6d0a41`
- [041 - Chat Route, Permission, and History Behaviors](041-chat-route-permission-and-history-behaviors.md) L3349-L3363 `22cd8bb894e8169a1598c3c5631fb8529605ff7daa6b04b4dcd31ee927d85977`
- [042 - Owner / Consumer Map](042-owner-consumer-map.md) L3365-L3369 `795b895672db35835a392ba57d909ee71b0ac01ec832da66f12b04a3825b410a`
- [043 - PlanUnits](043-planunits.md) L3371-L21730 `6296b9cd692a49ad0dc389ead8e46d064319e1b2b835165267b55a14cd8f127a`
- [044 - Migration Coverage](044-migration-coverage.md) L21732-L21762 `6635642fda8df28ba9a047b3a9e47d2c45511f4cc6e612f51f309fa85ef381a9`
- [045 - Ledger Compile Addendum - pldg-20260614-001](045-ledger-compile-addendum-pldg-20260614-001.md) L21764-L21844 `255091cd0542dba4ec2928032591d422ee442cf623fa430536381b89b9267d29`
- [046 - Ledger Compile Addendum - pldg-20260615-001](046-ledger-compile-addendum-pldg-20260615-001.md) L21846-L21943 `b2dfebfb5bbad8a50fedb4742fc1742c2cf0c267cd057bc90701f0b6e35d1dec`
- [047 - Ledger Compile Addendum - pldg-20260616-001](047-ledger-compile-addendum-pldg-20260616-001.md) L21945-L22257 `68409164a2c0502bb1bc4c823f64bc91793b549908e41da0fffa7d3394eaac7b`
- [048 - Ledger Compile Addendum - pldg-20260616-002](048-ledger-compile-addendum-pldg-20260616-002.md) L22259-L22326 `56b00d67251a6f99b6309569b7015955df8850f2174db803fbffaf824c68df0a`
- [049 - Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard](049-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md) L22329-L22417 `ed74fe65e08380a9939e8f60871575def86836228b3b4fb530f8c34df8a62557`
- [050 - Ledger Compile Addendum - pldg-20260622-001-fff](050-ledger-compile-addendum-pldg-20260622-001-fff.md) L22419-L22503 `8d007339a3f2adc51fb3559c0a44770e169342a02419b54d45551e406774e16a`
