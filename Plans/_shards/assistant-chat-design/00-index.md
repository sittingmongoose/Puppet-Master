# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-06-13T16:19:12Z

Source SHA256: `93dc1617d67ab6484f0e6b7d8603aa0618e23afb27f6a857ce85a82004995dc5`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `46b19bfa4019f38f41ce14f696f935089fb439c61e8307f2b6e8108d3def4920`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `785605a9783b6c373793549a1879f155d129684a9673852b4abac66e07f6664a`
- [003 - Change Summary](003-change-summary.md) L14-L29 `d390cc4d291a068f8d1e63cc1ccd9818723cc85be2044674284bcbde46643662`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L31-L46 `2089fb053f971b8310d42d28568ce6cc1e1a5c248acd1d28413a47278b471ba8`
- [005 - Executive Summary](005-executive-summary.md) L47-L51 `5f6649575561e9007c825ffa4871280e7a24e097ac47f8b894c5c04ef4838d28`
- [006 - Table of Contents](006-table-of-contents.md) L53-L89 `574f7ec49f11065326cfcd10f00f2ac480c40968a4f6fbf4f0f0b2ab7485f436`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L91-L203 `fc6c0f95fce2b00fb85eb460352e279748984a44be86183c081b30ddd126ee73`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L205-L227 `91ae18793992c17c7c08d357e81db4ccc13bf215daeeea85d337536b2e3e6f2e`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L229-L235 `90ddd4ab90aa45a0c6e7f863365c0a91a29affdd7fdb5786e1f8bda382092695`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L237-L282 `9925c58f7c14df2bec4ea3d0d60b5eb5defbdec1ecc3e2d2a0e026be593b6fc1`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L283-L426 `1ae4a615ed0c0ed85f6e29afaadc089ebf16574ae1aec3e192e70023436d0d05`
- [012 - 6. Teach](012-6.-teach.md) L427-L465 `c6ec9128e7740a7bd367be030a4c14e8fd1c9f35c084692c17591dc7ffadffd0`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L467-L605 `957cf26f572a51d6828a867cdd293b0d1b4ad5b275e35c220386e01041e027bd`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L606-L896 `3fc46cbbbf703f16a1efd4dc3a6184a4bb987272bb18f82a1cf72851fe4941ea`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L898-L933 `36fd8df95b4b0bb4545d7a68049a8b8efdbc6cbeeb51e7354a3afd2f95dd8cb4`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L935-L1005 `3cf698c5ad4c2bcb5afd72a62d35d99d20d0fdb2b0f0ccf27d898853d5df82e5`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1006-L1151 `6f8911c0ab8d8f08185bd94ae395fc911c1d0d180d77d86c036c4f490839bbda`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1152-L1260 `17ae6aa1947de9de3da10a204bf2d3682719ddcbd5953ebf7161ac9a25f04e77`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1261-L1672 `53bbaad7edbc8b1c0ca9b80b75ca40ba207258714cdff91eac081980f91ca459`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1673-L1790 `3cbb86497b7eaacd83a5887110c276bb6327d5e152f4adb7fb7acae7d46a1284`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1791-L1824 `ae4566a3ec56d4645fd930b5ec5ac3b7b97cbc2e6566223bc8e6d82db73c7bd0`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1825-L1864 `6d9a6b25033d93508123f20f5137934f6c3c58812cc379056aa4c6473980f656`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1866-L1978 `a46bdcf035a1e749199a8e85d72605520a08521c9692d293a604e4820319e512`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L1979-L1990 `4cbb1ce51520730b0221cdc79408eee2c09ea220e40a606a82a90ded643a151e`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L1992-L2001 `25e3236b3a16731c77f80afcc3ae06c1c460c6dcf4762041659b7861229893ca`
- [026 - 20. References](026-20.-references.md) L2003-L2032 `0c1e191ba1826ba64d1ee0b8fd2b87f036eea64f326234d8e0a3f5f12cca79a2`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2033-L2051 `06cb003807cb5ec5c06f5bbee8687287cbbe4e40d0a08572915bfa2ca6aae594`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2053-L2084 `0adb45aaa6935a1f639c65e2b55fafac143d00b6873ef388c195af085c9c0a8f`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2085-L2180 `2dd676b28c6d3f072dfeb6e970327f05874e3fa282708ba0bc6c57cf9a3710f5`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2182-L2235 `14284762b27a691bb75e428b7bef9784668cb9b483f95d2ed733f381d5579901`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2236-L2242 `35b468eb9d155dcf4519c7135ce8e65ded85b68f9a07d223a05d1f3d249a18c5`
- [032 - 26. Per-Pass Validation Model/Provider Settings (Invariant Sweep)](032-26.-per-pass-validation-model-provider-settings-invariant-sweep.md) L2243-L2349 `894dcd470b48798518bb65c05d2152cc8d6a7c80de2d07bf120b7df3d4460d84`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2350-L2486 `870a5f8599bfc213838f9e193a8a48e939db7ecbe260fd9b0ca45a706934be06`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2488-L2531 `2c6df3719b082e018bcf435e7e9cd143b46c2ecff3723caddb5919b1735ecb87`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2532-L2641 `fa489fca691188087363c40c4b3ef556fabb791d400d46702b58a8238417f170`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2643-L2658 `f2ff3251972d79bf1a2bff05f82a2ef343d31a538ce14bef4ca307ccd729602f`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2659-L3263 `fb041d76e957e6c47f979ff2b1166055f6c88071ef78c063f3f6d7708336c25c`
- [038 - Shared actor-boundary, route payload, and blocked_notice packet](038-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3264-L3284 `349b78bfb221857c38b892abda1ec78bb2340985e333a091fb15bc8488c4cb15`
- [039 - Shared Conversational Actor Runtime Identity](039-shared-conversational-actor-runtime-identity.md) L3286-L3300 `6ea71c1caf30c1e5b59a1d96ddb8d4dd7a85bc9e44718191e3eda099307840b5`
- [040 - Chat Route, Permission, and History Behaviors](040-chat-route-permission-and-history-behaviors.md) L3302-L3316 `31ec6ce7ba165abf6d794c3a5452f7eb98469ca611c013c277cf75cb60ae9a4b`
- [041 - Owner / Consumer Map](041-owner-consumer-map.md) L3318-L3322 `ace5bf142d70672d932dfeb3462a40881a1d5121e5bb87e2fd9690aa4436e38a`
- [042 - PlanUnits](042-planunits.md) L3324-L21654 `4f6c4ba52786e5711de327608ecef95db8d49c3f658e2a13a8e5a0e2eb100e04`
- [043 - Migration Coverage](043-migration-coverage.md) L21656-L21686 `c908178a7aa6558b2fb057cd5b90b3000f950721b630787149f0ebb748e4e54b`
