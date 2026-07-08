# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-07-08T13:17:20Z

Source SHA256: `4fd3675adb0a6362669302310d9685d8c8392f3da3904c38c29dfa47e953ba79`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `d30f5290936ed35b61b886dcb7769185626fa670943f6ac6a106a26fcb9cebaa`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `1c64eb4316756e812dba83f5544eba751493d047861ce3aa454a1fb5f179f08c`
- [003 - Change Summary](003-change-summary.md) L14-L29 `fc5aaf828192be021a01e956842d548f5a5e8f4c223eef937d47fe72c5249fe8`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L31-L46 `d1d0f1f6d507582fe4c81a926cbe0fe540e6b8403f6cf700eb0a84a5797fc34e`
- [005 - Executive Summary](005-executive-summary.md) L47-L51 `cceef4a11c8c74604fa62f7f4f998f370c87a6854689c00bad97c531f7f8bc7f`
- [006 - Table of Contents](006-table-of-contents.md) L53-L89 `0c908bd1a13bc09621c36bfe04b0872f2f162e441dc5c3b50453eb7d8904e18f`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L91-L203 `f7fa655bbe8064f313b8f722a96f620af34e92eae83b37b5bf953acafd78e2f8`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L205-L227 `cd35a59380fcb8143e9ef9ba30538f9c643b4dff66427dcced8b2d8b37cedbdf`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L229-L235 `dc0f9780b693fb90afa02b392c14e6df7292aa890df1969027e6a44cf8068a8c`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L237-L285 `b9325fda718d0f20c2c4c29c1cd085a7786cce489ff577e90975f4f942443a4d`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L286-L429 `8ba8a35986e2cb41ada77e01a5c7023ef577e2f4cd59f798bbada412367bd887`
- [012 - 6. Teach](012-6.-teach.md) L430-L468 `f68113773d7ccf6727006eb666e36a8bc1135c2175a3aa50d913b03ccb2fba7e`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L470-L653 `75c10328ca9090d38668590c5880d5bcd31f6512db03f3df4342ec4ec70af1a4`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L654-L946 `1a346a9957af5d2d88de6d7ec7de30994ea04cedd38a7f0528881d48b9da4d16`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L948-L983 `a68fc2d0493bba232924cdddf7488fb56097d8fcb5f4fcdd3d66f8ce486daaa1`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L985-L1055 `c9d531041659fc06ebc95e875a4ad88f572abc5b51bcfbb39a7d7ef5cc395a6d`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1056-L1210 `3a6e5698b38f5fd653467cf8833816b679376b1e5239d65cd0f20c7a690fed2b`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1211-L1319 `888a864a33b7fc3fcd70e21e82f04f82ecadc5f203883fc81e05240d7c290f09`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1320-L1733 `e15e6a1f9148fa1d911a725b1b4c028b10f39c560ac15a0740aea4f53f48df38`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1734-L1851 `91291b0768c16a1871590f57adc11d5ddd31c910aac8fec6a5a02c46e54e849a`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1852-L1885 `2ce231b3d50c9998cb6b22123f0a83b8af0fdf1f05dc83bfdc8c11d7507eefbc`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1886-L1925 `696a92f2a28509493c47152f9291e4740b04f4675dde8d8608f29ed9ffdeb821`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1927-L2039 `39aa1faa082a88cc883fe77ec8d1fa8df4a9be0acc2bfcf2c3f5139a932d5a2a`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L2040-L2051 `574f701d3ef0bdb396626b47e7ccc14d2e505f8b41d257367a7ee519b9921ad8`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L2053-L2062 `bce5865e934e0ddcc6877447cc05f593110ba437132dc6e75be30bc08e09acb6`
- [026 - 20. References](026-20.-references.md) L2064-L2093 `c1427434fd86aa3c167dd6e1c26b8cea8f9c2c345809fc2fd11b67616f3d463a`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2094-L2112 `c242c78aab561f7acd699e38dff031d8e044d93dfadc45f10d4738ddb62e098b`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2114-L2145 `2178876147adf2fde0ae4cc9f2bc9c368e3e329f26196c234af64e07a9b23d24`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2146-L2241 `1b20f32c7402bc50feb80d63aa95318db66da84572c4de1667dda59323225242`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2243-L2296 `1953a979bf583370dc04202ec06cd7baa660d3a11643ff63b0ff1422ff89d3ef`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2297-L2303 `13790e8d897cf0873586174628ed7a6836607127d1f42e5ecab02a475aa847cc`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep)](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2304-L2406 `09b4a3c6412097812faf812987893cdec46de277c3f6549f7760688caa657885`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2407-L2543 `097ac4a3acf718736404aeeca5c3970519869c98535ce0b28134ba29bf4723ed`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2545-L2588 `ede5ff0d384e795d65741edc8c4cb799dc5675d070820bbcbfe526dc711f0136`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2589-L2698 `76afae9e67058a68fdd7587c4a16b7b1e64622b0aab3073343dcff3df582af20`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2700-L2715 `bc3f9a49b4c2c32b60e1c29e7c18388117bee3611adbef1f58651dadd1066cfa`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2716-L2728 `128703fbf5c641375065d648bcfc95a79135fd1ab961690900a0e0ea82670c8f`
- [038 - Ledger Compile Addendum - pldg-20260630-001-feature-intake](038-ledger-compile-addendum-pldg-20260630-001-feature-intake.md) L2730-L2798 `780b8330b990f68338b1a64a107cbafef7fe1733cb8eb1a1027870abd2195b98`
- [039 - Ledger Compile Addendum - pldg-20260624-001-provider-updates](039-ledger-compile-addendum-pldg-20260624-001-provider-updates.md) L2800-L3439 `9e7bed4c8371d46ff11807243d7a5a1516a00e2dc5236b21ea666dddcb612c7a`
- [040 - Shared actor-boundary, route payload, and blocked_notice packet](040-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3440-L3460 `c241a94e499608dea092e186b7fd8bd6a29767cc319e0d4f75f2e9ae21ca0ead`
- [041 - Shared Conversational Actor Runtime Identity](041-shared-conversational-actor-runtime-identity.md) L3462-L3476 `ce69065a2bbb1cdbfd233af3ea2913abcbe27991af3540b3e4fbe73d5b936c35`
- [042 - Chat Route, Permission, and History Behaviors](042-chat-route-permission-and-history-behaviors.md) L3478-L3492 `36057d05b9b7050256c52822c3e27ad12fed8b00115f814d32beb1c3b911083e`
- [043 - Owner / Consumer Map](043-owner-consumer-map.md) L3494-L3498 `73b0346e03fb86b8bda4de8635d59aa54e8ce8d631a36bfa417da97f1c912582`
- [044 - PlanUnits](044-planunits.md) L3500-L21918 `ecfc229021bf52cbf11687029abe0d15dd8aa5695e3fbd97b3c46d5e291f6f72`
- [045 - Migration Coverage](045-migration-coverage.md) L21920-L21950 `c81e4ba837f8e123fddff2370c7319a3f478684957e5e58c15db6d054683fc22`
- [046 - Ledger Compile Addendum - pldg-20260614-001](046-ledger-compile-addendum-pldg-20260614-001.md) L21952-L22040 `4784da9713041c564a30761f8b891e17cf2382476922dec673685b3b07588d1d`
- [047 - Ledger Compile Addendum - pldg-20260615-001](047-ledger-compile-addendum-pldg-20260615-001.md) L22042-L22139 `3c4a4006b1d20e8b850047981edd505d7a95bf7c5f9c6d28b480bab2f1e322fd`
- [048 - Ledger Compile Addendum - pldg-20260616-001](048-ledger-compile-addendum-pldg-20260616-001.md) L22141-L22453 `a64c6993606b8cb868af24015940360e046e616de8aa59c7ff9b04450cf86fe6`
- [049 - Ledger Compile Addendum - pldg-20260616-002](049-ledger-compile-addendum-pldg-20260616-002.md) L22455-L22522 `669f1d15337da302ba164f3de93c6081f6ff97597fbd99ab212d340aeb850ca7`
- [050 - Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard](050-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md) L22525-L22613 `85760af436b9c134fcfa61b1bcfbbdebc9c470d75f8ac69426988c01d90ac706`
- [051 - Ledger Compile Addendum - pldg-20260622-001-fff](051-ledger-compile-addendum-pldg-20260622-001-fff.md) L22615-L22701 `19656289914a27c745c307425718d819dfb39686592c912fa1d40e8b1fb2f74e`
- [052 - Ledger Compile Addendum - pldg-20260626-001-feature-name](052-ledger-compile-addendum-pldg-20260626-001-feature-name.md) L22704-L23078 `e3e85cfbc3c9a6aa2573878889fb9bed29383a899be9f60da77488f4573a7661`
- [053 - Ledger Compile Addendum - pldg-20260627-001-feature-intake](053-ledger-compile-addendum-pldg-20260627-001-feature-intake.md) L23080-L23291 `8d8a108d2b3c0319eae2eee7b9c0ed9f38272388dbc2806c70caf58f48d9303d`
- [054 - Ledger Compile Addendum - pldg-20260701-001-feature-intake](054-ledger-compile-addendum-pldg-20260701-001-feature-intake.md) L23293-L23372 `1d495f7c26999416456b6c1eb0e8694ca841cdd05050dd49ae4d83ee15c20053`
- [055 - Ledger Compile Addendum - pldg-20260703-001-feature-intake](055-ledger-compile-addendum-pldg-20260703-001-feature-intake.md) L23374-L23439 `d03b1e7fa9b5366f28df6022c2b7d7b79a2fd0b7fce458ade7a764da00a1aa97`
- [056 - FABLE Residual Chat Mechanics Cleanup Addendum - 2026-07-07](056-fable-residual-chat-mechanics-cleanup-addendum-2026-07-07.md) L23441-L23512 `eb8ecde99eec7a9cce02e640cc8f647111c38d989e5b7bf7e3e97bbea3d02a4a`
- [057 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](057-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L23514-L23558 `27f2e4055425aab72f7bf4f1b2330d281ebdc5431f4c05c286fa52e08ee6af89`
