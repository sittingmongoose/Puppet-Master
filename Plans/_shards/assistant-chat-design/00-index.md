# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-10-29T23:20:23Z

Source SHA256: `63c9c2df0d06e50d6f0e803255e1aedcde0319ecf34fae55f25c4b5a68a06159`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `49f06062f3b63d028272ebc636b53909bc0c306e27740bffda94899ec7beaccf`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `19166c19af1ef5857d71013ac2e686f5d0af5bea355db7e7221fa16ac696228f`
- [003 - Change Summary](003-change-summary.md) L14-L30 `5a3a7d218fc22ba6b6f1e124163b8babff1799021cb37e3d92891ddb51f72822`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L32-L47 `51efb6ce726ccb504b88c2ff6e345a0ad81dba0b2dff4da00e1c680e720f6264`
- [005 - Executive Summary](005-executive-summary.md) L48-L52 `d339e062cd660e8d1e9613c9211aa7542e68d124245f2e87397b722bdc5a4862`
- [006 - Table of Contents](006-table-of-contents.md) L54-L90 `625d0917ef9f26f353790a92cf471548e4bedaa6f3bfc9657beebbfd638a4078`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L92-L207 `948da5c3a8e3508a0890c9a8e3290493d7f6cc8514c131aefb36e1016920d3de`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L209-L232 `51d60ad5a3e5d1aa3a282c7a93f1ca07f68f2e2d4af7ef6714b1845c5e3bbb1d`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L234-L240 `29fc4a47ca09e57d059ce7246a9b987f8e1cc4d0bad81629cbf2fad89da48cc6`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L242-L291 `ed6af0a15530885fc3429e4a7391ea3d6ec37b95f005b0ab455a8b2025af7acc`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L292-L440 `a2632dd813a1269391f9113f7e8c31dddf229681a571ff442996bc8d0d6e6f40`
- [012 - 6. Teach](012-6.-teach.md) L441-L483 `564169d8ff937edd40b3f60ffe649f424a5f562524204bdb37e9b14fed950ffa`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L485-L671 `bd4661a04c0651960b737649e806b81388a6b1e87673a9aa65fe407f8dbdd475`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L672-L964 `de75f8214d09da1093f4a8470ca220eb01f54465e3eaa815e361f77312cac8ea`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L966-L1008 `8fdb147b64674aa9df3010b541bf9f9bde86e3c79468c29ae556f9cdf002ad7c`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L1010-L1080 `8c9969167f0f84188b099af6b79d42e4a5862a49bb1571d3dfb5b39d167db3cf`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1081-L1258 `48c1f0f1600e45ff92de3a506b85c2a48ec0fd847c1cf48bb8a05f6f4fcf7560`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1259-L1367 `75d71cdd7af6ce5fefac213c2e803b01cdd3431c891acedda3ae5cbc1a25de4a`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1368-L1785 `a5a6e3342a183999ce715ba5c62576efe23b82bdd0c3c6602e6c6921470bd05a`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1786-L1903 `2afe9533e0371acaaf2d039408c4a1ad34b5955b69fabc69aacbd535f01d0d3d`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1904-L1937 `617ecd6ffeb5b6d757a5198958ef7e07749cf690809878d00a8c3143d730f0f2`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1938-L1977 `36884aa2b2c6e2d2363d237ab94fb71e663d648dca59846e9bcba81b19ea2b7f`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1979-L2092 `f7772f883e597b31302bfc2244208c501d1a3c86e876e1900cb29e09727c6576`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L2093-L2104 `a1e62c37b744d860f50f890ee63acf82df18810222675e0142094cf333c103c2`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L2106-L2115 `ddf8a56cf8da2d51bdd552cbd67f0b0325ddb35d776390e49cfdbdee602821ae`
- [026 - 20. References](026-20.-references.md) L2117-L2146 `1e239301b4fce15ed0756c3811a9a567aeae1658bca48a4b94f8052c7b594d75`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2147-L2165 `16947530e0005dd2dc75d2617680d0c117e8ce7a7981a1102a5fbba999639137`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2167-L2201 `39b6c151f56ae86cc59bf75083e697f0e0a1454423508c2691a607350e3f3dad`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2202-L2297 `2e436bab60045c9b4477cfdc6de460f841a7d651e80b7bf88d8dc2e4ec03daa0`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2299-L2352 `fae78693120991d15b977b441155ab769b0e0f8d2a51279404c64ac45ab6f2ef`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2353-L2359 `bc6cd3e0db471d0291c62e09bfb589820641a7f4de950d9318471475b102b609`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep)](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2360-L2462 `517295029f8dc1defa91a3aedba058ff64acab5739f20d5f7e82818d6e62c450`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2463-L2599 `9793bee0069e5cce374a3f4a95441cd767429bc9cd6ffff596cb05921a737856`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2601-L2646 `51787104c379f4aaeebed0a0b59232c4dd5dc0469af758b13f52ae32dad749bc`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2647-L2756 `1e5cbccf6d3f2d18e94186a52f51a5537686892e77ea4d7fd0717687c3ae5d13`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2758-L2773 `68068ff57c1fc18da4db58bf0286451f5fa1516a0e9a9908def69bb308433618`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2774-L2786 `58569eb5ebb4b0ba2aa93a7123e31b202328ba8fa6c891b119dcbf1d339ebc45`
- [038 - Ledger Compile Addendum - pldg-20260630-001-feature-intake](038-ledger-compile-addendum-pldg-20260630-001-feature-intake.md) L2788-L2856 `e24a12ffd3d614f7eed817fd14ecdc4fb07253f4e6b4705a6174c8ec39e20dee`
- [039 - Ledger Compile Addendum - pldg-20260624-001-provider-updates](039-ledger-compile-addendum-pldg-20260624-001-provider-updates.md) L2858-L3500 `5c403b4922649c1ee8a4990f8ddc78a5465c39a1842fe954f2b0073216790e84`
- [040 - Shared actor-boundary, route payload, and blocked_notice packet](040-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3501-L3521 `46ec03c68b2889e3cc143d21e0820bbad8f3232145d12a718e6b736698aaf8b5`
- [041 - Shared Conversational Actor Runtime Identity](041-shared-conversational-actor-runtime-identity.md) L3523-L3537 `50b2c6c8d24a0b9c51a6c6b7be8ccedc069182f5631940f124ad0be2b6435017`
- [042 - Chat Route, Permission, and History Behaviors](042-chat-route-permission-and-history-behaviors.md) L3539-L3553 `e67050a406db0cbc5328f09989a8fa8568ce9588a764c02030633b76b3874f0b`
- [043 - Owner / Consumer Map](043-owner-consumer-map.md) L3555-L3559 `4a29ad4e190b9c2bdb9dda17b1e84682a547f59169a1771bd5e74a3e56be2436`
- [044 - PlanUnits](044-planunits.md) L3561-L3612 `847bf6cd20aabfc9e9ec488c6137d8647f2dd7b28a17b258ccb5f545e2269838`
- [045 - Shared runtime projection addendum (2026-08-13)](045-shared-runtime-projection-addendum-2026-08-13.md) L3614-L22455 `08fcf825035cfe4a2895c50ba28ada742573d932279676cd87569ef531238f55`
- [046 - Migration Coverage](046-migration-coverage.md) L22457-L22487 `bb8c0e71816888e3ff257c31becb0a2c791897280d385cfa0621201f209ef597`
- [047 - Ledger Compile Addendum - pldg-20260614-001](047-ledger-compile-addendum-pldg-20260614-001.md) L22489-L22577 `f90a587aee6d7d94157084165b15e51d908646966187c720e146c5649bc25287`
- [048 - Ledger Compile Addendum - pldg-20260615-001](048-ledger-compile-addendum-pldg-20260615-001.md) L22579-L22676 `6f6238fa70bb42461720fce751344fd1ebe17f3743e55c8b26b66533addd9701`
- [049 - Ledger Compile Addendum - pldg-20260616-001](049-ledger-compile-addendum-pldg-20260616-001.md) L22678-L22996 `8334f63ef43291f2de920a44ab9e8cd5ddccf4c3102366b3a46659b9af1e83f9`
- [050 - Ledger Compile Addendum - pldg-20260616-002](050-ledger-compile-addendum-pldg-20260616-002.md) L22998-L23065 `a8d8488fcf9eea8b2b468a22dc551ca6973e59d260d9c7493e2fc8c40087a70c`
- [051 - Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard](051-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md) L23068-L23156 `b1a7e880d4202a605633ccda0fd0ad6e831dc4c48ce560c8c5f3370cf4f8f835`
- [052 - Ledger Compile Addendum - pldg-20260622-001-fff](052-ledger-compile-addendum-pldg-20260622-001-fff.md) L23158-L23244 `63d92a5c5faff0706bd6f7aa8a0d57c1f387dda26e80bf4edd662ae75385be98`
- [053 - Ledger Compile Addendum - pldg-20260626-001-feature-name](053-ledger-compile-addendum-pldg-20260626-001-feature-name.md) L23247-L23623 `88ef8913e8d1f9c7a361737ab3568f43b83ddf763d94747e79ce366cb27a3d56`
- [054 - Ledger Compile Addendum - pldg-20260627-001-feature-intake](054-ledger-compile-addendum-pldg-20260627-001-feature-intake.md) L23625-L23836 `733bab88b5b833f5b4484216034ac30320c97f47f679f780dde7eba976246143`
- [055 - Ledger Compile Addendum - pldg-20260701-001-feature-intake](055-ledger-compile-addendum-pldg-20260701-001-feature-intake.md) L23838-L23917 `8a31561518f5de6c460dea9ced6350fbd24d33cf5cb138135e846d13f438d10b`
- [056 - Ledger Compile Addendum - pldg-20260703-001-feature-intake](056-ledger-compile-addendum-pldg-20260703-001-feature-intake.md) L23919-L23984 `daec52e42d66d30ecd7d9e57558b5021106b2ff3f88a510d6b6a654c627c823b`
- [057 - FABLE Residual Chat Mechanics Cleanup Addendum - 2026-07-07](057-fable-residual-chat-mechanics-cleanup-addendum-2026-07-07.md) L23986-L24057 `7ec058651dfa748bec36785b39c537f205df6404ca95eeb7c9f08bbd5446f163`
- [058 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](058-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L24059-L24103 `4568c695a6af65d92385b390ce8770d4cca3dfcb73a664e722bcaa4cc6e9eff7`
- [059 - Usage GUI Propagation Addendum - 2026-07-09](059-usage-gui-propagation-addendum-2026-07-09.md) L24105-L24181 `8984e064f7d436d0c313fc471317b953c29f697c7550fb0f8045ba985bdad847`
- [060 - PMConcept6 Chat Polish Addendum - 2026-07-16](060-pmconcept6-chat-polish-addendum-2026-07-16.md) L24183-L24415 `14334d43f5e152a4f8542cbb2ab661e82f09d42d74c78ef138eed90665d9bdb5`
- [061 - Immutable conversation restore-point lifecycle - Known-37 completion](061-immutable-conversation-restore-point-lifecycle-known-37-completi.md) L24418-L24435 `66484b85d0165ef39169ae7b78041aaf3b1475eef441aaa72ef6cb7146e486f3`
- [062 - PMConcept7 Concept Promotion Addendum - 2026-07-23](062-pmconcept7-concept-promotion-addendum-2026-07-23.md) L24437-L24821 `eb7d1fc9d408f0a4b41c04ac82fdec4236392f3b44d87af0dd088e2b29657ddc`
- [063 - PMConcept7 shared Assistant seating and context surfaces addendum - 2026-08-27](063-pmconcept7-shared-assistant-seating-and-context-surfaces-addendu.md) L24823-L24925 `38b66bb1b11c0e0e76b08f7151463c533b020efdfcf479a39645dc98ef05d02f`
- [064 - Additive Correction v4 — Consumed Assistant Behaviour (2026-09-03)](064-additive-correction-v4-consumed-assistant-behaviour-2026-09-03.md) L24927-L24975 `59988e1bd65b291492cbc49b0a031931c957fb21c5838f562961b7bf0bab3436`
- [065 - Working Notebook Surface Addendum (2026-09-05)](065-working-notebook-surface-addendum-2026-09-05.md) L24977-L25105 `03b386e6457abb2c26495eb049a294fbfcbb7eb0426c3d2831bdf1320968a0b7`
- [066 - Cumulative v3 Assistant Interaction & Surface Specification (2026-09-07)](066-cumulative-v3-assistant-interaction-surface-specification-2026-0.md) L25107-L25493 `7cd0613f4cbaf343e546e01a8b31b5cd14a43b687fca820939c839cb546eb52c`
- [067 - Research decision packet review](067-research-decision-packet-review.md) L25497-L25592 `3b0cac15a55aa94cade8358c463273d67ab0d45b38b82032bf6b0765ad154a99`
- [068 - Context Lens Source and Preview Reconciliation — 2026-09-10](068-context-lens-source-and-preview-reconciliation-2026-09-10.md) L25594-L25658 `c152d4a835547064ea74f27f3eca15aace40df3fb3c55a01004506bc797506eb`
- [069 - Compaction completion Event Authority (DL-039 and DL-040)](069-compaction-completion-event-authority-dl-039-and-dl-040.md) L25660-L25713 `fe98c71b54b74c7da38372936f5927eaefdd3126ebfdbebc2cde080fc3bbbeb4`
- [070 - DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)](070-dl-042-historical-todo-event-migration-consumer-boundary-2026-09.md) L25716-L25763 `feed4d5cc7f7de20e8344ad8ebd441f97c31a27acad153da81253683fe425329`
- [071 - Restore-point created native and historical consumers](071-restore-point-created-native-and-historical-consumers.md) L25766-L25940 `43dd57133293cf3778f99b100d5095d1f7977d694955bdab8fa75169be1eedd5`
- [072 - Deleted restore-point passive history admission](072-deleted-restore-point-passive-history-admission.md) L25943-L26009 `7c710c609a996fa831e3eca9f31061e2d5d27dc5119b435ceca5fc8737f0ee23`
- [073 - Expired restore-point passive history admission](073-expired-restore-point-passive-history-admission.md) L26012-L26081 `a601c6bb533a8b9b24d22dc64bcb5727b23ee19e5c288f0ac0810c31c49a5dfa`
- [074 - External Research Decision Packet Consumer Addendum (2026-09-17)](074-external-research-decision-packet-consumer-addendum-2026-09-17.md) L26083-L26133 `e2bbd3d3b7853e91a989eaaf64aae4209adf12d9100ed7cf251bdf1cfd41fa35`
- [075 - Chat WOW Turn Presentation Addendum (2026-09-27)](075-chat-wow-turn-presentation-addendum-2026-09-27.md) L26135-L26805 `d4c70a4431baf183fa6da01905636ad9c1585e7e72234eea7a20bef7706438cd`
- [076 - Wand Modules Redesign Addendum (2026-09-27)](076-wand-modules-redesign-addendum-2026-09-27.md) L26807-L27520 `9e07bab5f38d2d649cf578ccfe120d9ea2c689d7f1da50710151c5990dec6ab7`
- [077 - Chat Tweaks Addendum (2026-10-08)](077-chat-tweaks-addendum-2026-10-08.md) L27522-L27598 `91d7f55c91b3e395a9a20a8e0add4cfb65b1157453dc15909b7f61e55dfa402a`
- [078 - DL-180, DL-181 and DL-185 — What The Chat Opens, Its Column, Its Command Card And The Port (2026-10-09)](078-dl-180-dl-181-and-dl-185-what-the-chat-opens-its-column-its-comm.md) L27600-L28029 `7e36ab3fd46a9e2381f84760cd380101ac350214f513bddcb6ec6e5d599a5f35`
- [079 - Grill Me rounds and agreement — DL-218](079-grill-me-rounds-and-agreement-dl-218.md) L28031-L28446 `443ae71af331822f98c9117dcd037417b31ae5a11f2ce676d9f6cf442e603d65`
