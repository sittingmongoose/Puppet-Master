# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-06-18T03:28:12Z

Source SHA256: `18d83140885795522460af266e2e1478ff3227d9a1d610a5e20ee9250aa52324`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `04a058fae2785d6ad608acce2ec0a0e628ba91aec4766fcf0b964fe3e9c552f5`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `13fd13efcf6760f2a366ce9055dc94c85b69bd822ef1ba1d65cba4c0d3eb8c3c`
- [003 - Change Summary](003-change-summary.md) L14-L29 `79d6cca6cdce44bc28b13695dbe354025ca71c8afa78a14ef81d74cc0887791a`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L31-L46 `2c3c42de6f0bbb219b9c018fbd6b22db928d1033d4f0bdc27eff0662744d312f`
- [005 - Executive Summary](005-executive-summary.md) L47-L51 `5ecc8e24f53afe203e294dd362117b1ee0d119eb7b1b9aebcae23e72be4ab914`
- [006 - Table of Contents](006-table-of-contents.md) L53-L89 `b7170fcba7e99a3c226e4f485e79472d9a4fe2d0607b2a632a1dc5b3da0d95cd`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L91-L203 `3c02667a8fdf7f8d190f15e0b2f67ef250967735218954062c2a12e215e975f9`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L205-L227 `40dabebbb0ec8282bc2ebeb64b44b362cef83fe32891605487644e211b4197aa`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L229-L235 `75fe20ecbb57cd0aad8ef0fb09d99a6a1434c7a3cac99e8d375d37bcc4c68faa`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L237-L282 `09ae60169de3f7aa0bba070c289a271df4c6a53b28824c2c16b8c89845440a85`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L283-L426 `b7cff26a7f74febce7ebde1b9880a9d39550af26efadeac3bc2ef07fe188f98f`
- [012 - 6. Teach](012-6.-teach.md) L427-L465 `18c0644969685d7c978e2ed27553b7a87154ca59fcb0ef1509db04ddd3ba4f08`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L467-L605 `e69b9862ccdee15bd101c91803b1594969e8e0b03d54f26f59d5283125c1e3d5`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L606-L896 `f974153213afebd6262a42ec0a6a7917b8b8a540d6e5a7d41f15ca8d67c329c1`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L898-L933 `c7c8a5b97d8ebc12edd7ebd0cd5ae0d54d56b730c8827b89bd63034e3fcb2bb3`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L935-L1005 `2f30d6de063fb48c3cb55563df22d06377148d9d5992ee47bf6a7ef91d103796`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1006-L1151 `ef23a4b4b6ef5b66198eabd351159fb70ac438cc2f93c00a37d571461809caa9`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1152-L1260 `0e87dc16e3ac2a78261c14132b1474d6303371389081e50de9de520e74f9f7fe`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1261-L1674 `3551119790596d867dfc546a2aab8441a86d5a5381dd7699e02e38885a18e364`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1675-L1792 `e98bdb4218d3f67fb6353318ff318dc79af2d1a0ea43f80010ec7adf262f926d`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1793-L1826 `83bcc42d43be8a70149360cb3ae362ea4a82d702175a7e296db4f4d7d612c8f8`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1827-L1866 `3aeed85438b0b9e3aa9e8cdc2b2c2e28ae1818d2aa47f0b110eb722935f0d47c`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1868-L1980 `adf3dd11b676ad9d657fbd71f652133f6a682402c0ed7447bda89ba5a8dab7e6`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L1981-L1992 `3a00290149a4697d7be4b629600d22363e10cdc6f5e26b38f9fdb49395c51f85`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L1994-L2003 `d7ae55e2c4acd04f6442e026bdba301e1b96d9904bd1d0fbb933e193f52543c3`
- [026 - 20. References](026-20.-references.md) L2005-L2034 `591ac46f6b483dc2c962a396ba349f502a073e0e23471a3e65152f607076db1c`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2035-L2053 `36191982744448ad70dd96c013bea0bb49f7d9d67bd6058b241a213dbd8ef267`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2055-L2086 `39dd5ef9dbc1da3bd15c7da55cfa6d3fdda9703bab2abc46af62026106ef0f09`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2087-L2182 `69cb46f6f2d939ec1414836f281a079aa9c0760ced6cce3f2156044ce187fb2a`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2184-L2237 `67286fa80fa16c47f2f292d7ce47d697be954d9b3ace19c609edd5ca76afe40a`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2238-L2244 `9fd52d91139fdbb81dc6499545962593c49cc1757fce747753e7f0a94098b902`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep)](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2245-L2347 `fde848059146c4be06585e913ad308033507ecb0f9f56d193d3aadfda183906a`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2348-L2484 `56c56e40eaea4ec6d02bb262ac143ae9a677fd31d52b4379e701b73fdeb4d7c9`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2486-L2529 `8fa39ec9897011d531378ef2a85230096f4b6fe266c698e8f6babd9aeda739d9`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2530-L2639 `8fd0e1129556941df988ce31d1b686ba83c60dcc671271007db163a4b8afca57`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2641-L2656 `b9981715500d381c4c79235e3723ae79d20b7b6670059f0a410cbe326c265490`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2657-L3261 `c7454b7a340f9517b17a0ce6867e050189447074767bb023ea89fb60f1a65148`
- [038 - Shared actor-boundary, route payload, and blocked_notice packet](038-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3262-L3282 `a34dc07c3bafc00ae4431c81a0d7923653dc7836d72314ba14a068b5c8b41303`
- [039 - Shared Conversational Actor Runtime Identity](039-shared-conversational-actor-runtime-identity.md) L3284-L3298 `5ed9b14043b267c35658557a1f71c13535b8ee87c98da44df62d7a840f13eabd`
- [040 - Chat Route, Permission, and History Behaviors](040-chat-route-permission-and-history-behaviors.md) L3300-L3314 `22b7f7fc6bbc7167fece031dca216dfd58a47b098dd7833bd38e942530edc7f7`
- [041 - Owner / Consumer Map](041-owner-consumer-map.md) L3316-L3320 `ddbd25d1bf7f58a870a7bbd795877f2d51d4cd461b8d26a1f04107bed11bc44a`
- [042 - PlanUnits](042-planunits.md) L3322-L21665 `1b6f3e56ebf687c4bb3ed844870f90f3cbe8665f73609b43ee19589d3b0ff47a`
- [043 - Migration Coverage](043-migration-coverage.md) L21667-L21697 `fb43332015cf26818e1a66d5aa628c2961476cf6b9ef2df4bed0298cc4dad788`
- [044 - Ledger Compile Addendum - pldg-20260614-001](044-ledger-compile-addendum-pldg-20260614-001.md) L21699-L21779 `ade78700ea2d4afa290619e879645357a93b5aec13ff1e4f1ddfb8a603c5d0bf`
- [045 - Ledger Compile Addendum - pldg-20260615-001](045-ledger-compile-addendum-pldg-20260615-001.md) L21781-L21878 `4a30ceb19f38ac59a7b5f6218625068e082b73191fcfdffe4b5ae22e7d6ae46e`
- [046 - Ledger Compile Addendum - pldg-20260616-001](046-ledger-compile-addendum-pldg-20260616-001.md) L21880-L22192 `cf36ba607a982e5160f89477218a39a3455527097ee27ac75ef2bd40de7c9474`
- [047 - Ledger Compile Addendum - pldg-20260616-002](047-ledger-compile-addendum-pldg-20260616-002.md) L22194-L22259 `86507c72545f039f91b927372d3c5233b9cd24a5daff3f8c53e14c7c124a7ee4`
