# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-10-23T09:09:06Z

Source SHA256: `76a7d0e54421af562554c88ed725cfd0cfc622bdd6c2bdcf9838b6a967a471a5`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `c6b5180f8cec1411a1ff58111f9930ee80881be827ffcee1b9688bb29524e0cb`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `3b5fd1ae1457ef516eb89f2640d65f61f83ef38e5c11ac4dfb2193f510d92493`
- [003 - Change Summary](003-change-summary.md) L14-L30 `b232443f427034e0c84a0d6e0b53c7ef49adc76cd1a0f2b37d15696715fbd71d`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L32-L47 `7727808b642f4b6262f25141e44fa060ca5ca7ce7605b6cbb4ad23cdbe5ce561`
- [005 - Executive Summary](005-executive-summary.md) L48-L52 `7f03ade4d3a554556978d661d4053799153ce5ff2085a7fe49426d45012cfa7f`
- [006 - Table of Contents](006-table-of-contents.md) L54-L90 `e20c46fa81a6b8e6548f8c8ca5c0bdf0ed72e8d38ee14c8f33bedbea8939356d`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L92-L207 `cde4a9842fc30c1698c701fe575b8ed2c12d7695b21c6a52ab333f9fe90c4e2e`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L209-L232 `ae870099f385d7bf732cb1d5d47bcb3e0da573a50e2cd7a14c1d39f8f63c4408`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L234-L240 `a39eb29d8452f9497dba187789b5f91ec997bfc46ede8b5e8832a79ba435737e`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L242-L291 `a64744e3486fad711f56652251ea91884669dce17918f7930169128986325195`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L292-L440 `3183a5c76e850e80e62b79c1e8746aacb742e857ad510d18f53b32813f84e6b2`
- [012 - 6. Teach](012-6.-teach.md) L441-L483 `54f69d370c214c33473d0a86f8816f0b9d9b50531d5707aef9f108439238c95f`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L485-L671 `e12d29479270e7ceab11b1f66400ddf2e6ae57104cfd16fb5ad9bf59fb0f193b`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L672-L964 `6a7c3f9113eb02ba5bc436228857e15a013bf6e7b683f342b2bbd3bde4fab00b`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L966-L1008 `b4c30d454e15c3b683eccc139558bbe4f6752a982b03388d3ae4d63afe4d7ae3`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L1010-L1080 `43eb2d262c60e3595b4d6e82d7742efb920fcff59cd08c9e58b34e25e0981805`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1081-L1258 `0ffe31f3efe3d07564419bb314e0be354a3e305ee508f8dafadcaa00b700a8bc`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1259-L1367 `912a80b87ebf6bc07fa3b5f71a6670c1d6feceea832f5bd4760ea918030e193b`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1368-L1785 `8b1da4ac5fbf78770741d668518981e932282179de50db0cd95c18280eebd1f8`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1786-L1903 `09302c5b71c4c1dc9bf8e44325758269a85a9b376d43eb4d384242feea35c497`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1904-L1937 `0f55858c9fd7fb68348a7c25295b03fda85e3cb106bafb08e33d467483e7cab5`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1938-L1977 `e669801272a697214f2a302da992c83493f05403f9963a546f5172c2b60636d5`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1979-L2092 `bd1f147349bb6dbe4ac0f5838acb22765c85cee786dee9906e6c6608da8a8369`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L2093-L2104 `1e5f6d2f3125abb6cf55dc599379768fa592f39940c02fce4e5dfd3b071b4d10`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L2106-L2115 `67db3c586913246968c35394ff8ac27b742acf79f13a1a28fac59e4e1805fcdd`
- [026 - 20. References](026-20.-references.md) L2117-L2146 `b48c6e3512993bd9b80d485a2f252411f95080ff80a1d95483ba43999db90c6b`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2147-L2165 `a25a28d6ab42e49dfc3f4ca9d5428c07267b36fac1253ba5cf1bfe5585cb4a20`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2167-L2201 `6ef753c848e9ec33e601887f42ff139690483e26c6d4922a9494c882c260987c`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2202-L2297 `5c5b8aab24b12ff2ddd9d3c5805372605ae075492358fedc8b754f3590b40fe4`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2299-L2352 `e485abdd9e95aca702f90e25e261696983610e40e299052c23366ba19624f8d5`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2353-L2359 `0123b65bd37ee917c99d78b830ecf3573bbffba423c063f3540327463dbce2c2`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep)](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2360-L2462 `f07b793a336bb80c633c66d6d79451c6455d9a5376fd70adea721c2a012ec469`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2463-L2599 `0be7eed5c32a26a16b3a1a3ab8e24e356941771bea602059d465fa1b0a63daa1`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2601-L2646 `7730c980dd37804eda0f28821226abe8e921970de64f196e46f4bbaaaf1fbcef`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2647-L2756 `0b54ac51b45dcdd4d87d805643ea052166b25323396d3c843cee35012abc1967`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2758-L2773 `8b2658c161e1516132e276c910eca7f9236352f6b62fd78133659642691654ad`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2774-L2786 `52b3ea08107b4a40bfad945f620db19181c3bdda78d3ae34878e69d4f6894446`
- [038 - Ledger Compile Addendum - pldg-20260630-001-feature-intake](038-ledger-compile-addendum-pldg-20260630-001-feature-intake.md) L2788-L2856 `7595276fd674f1e4db52a795618210d552314b98e672767ff9492ba6f499a2da`
- [039 - Ledger Compile Addendum - pldg-20260624-001-provider-updates](039-ledger-compile-addendum-pldg-20260624-001-provider-updates.md) L2858-L3500 `1aa0c2bc4daf92a091535663be04621df285152e2fc13210547667a5ec0fd079`
- [040 - Shared actor-boundary, route payload, and blocked_notice packet](040-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3501-L3521 `412df087abe17541ec9aa79cb733af01cc85b09926f90a0cf49e01017313d852`
- [041 - Shared Conversational Actor Runtime Identity](041-shared-conversational-actor-runtime-identity.md) L3523-L3537 `ffb9fb0174fde09823be610fe8a9dfdee4aca9608c98d983a1b7c08e051528af`
- [042 - Chat Route, Permission, and History Behaviors](042-chat-route-permission-and-history-behaviors.md) L3539-L3553 `00f9f00ebc47190869b33dcbc3a727a7b0b36d47d31db934b98a4ccbee7473a4`
- [043 - Owner / Consumer Map](043-owner-consumer-map.md) L3555-L3559 `4e3f0226691c34802e3636da63734b9ec25b73fc2c02ab9076e9abebc7ea4a4f`
- [044 - PlanUnits](044-planunits.md) L3561-L3612 `d59ad92821b52b360ac3d24c9d1026f1ce230f61741f2b540c57c9215a8c5cf0`
- [045 - Shared runtime projection addendum (2026-08-13)](045-shared-runtime-projection-addendum-2026-08-13.md) L3614-L22448 `97728fad1b81cbaa180aec1419c6ba0bcf5d1a7ce38603af6cec68e69ce4d833`
- [046 - Migration Coverage](046-migration-coverage.md) L22450-L22480 `2d6048f84066a04660f6b2a94561b45327e3339020b75454f7393b87c69924ab`
- [047 - Ledger Compile Addendum - pldg-20260614-001](047-ledger-compile-addendum-pldg-20260614-001.md) L22482-L22570 `694e6d0db0a0f959519be6d5fe583d188e270c720cfddc85065709aa87fc8f96`
- [048 - Ledger Compile Addendum - pldg-20260615-001](048-ledger-compile-addendum-pldg-20260615-001.md) L22572-L22669 `0928300933498e12664c22ba337a9f268ae1383d68c35a0c1bfc37363b2717e8`
- [049 - Ledger Compile Addendum - pldg-20260616-001](049-ledger-compile-addendum-pldg-20260616-001.md) L22671-L22989 `c1efe310ed8854795f50138c20b2f3642fb676e47c8fcb739a96d5a2c3b3577d`
- [050 - Ledger Compile Addendum - pldg-20260616-002](050-ledger-compile-addendum-pldg-20260616-002.md) L22991-L23058 `aa186d766301e63e1ec9944550029940f6560ed55162f1784e649bcfb72087ba`
- [051 - Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard](051-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md) L23061-L23149 `3ef230db376103e54c1d58c88dd5cdc2d5bc9dffc366b42332114c2a2078b05c`
- [052 - Ledger Compile Addendum - pldg-20260622-001-fff](052-ledger-compile-addendum-pldg-20260622-001-fff.md) L23151-L23237 `9db41afdfda6563e3a156f0f408f7f8f52c223039e852abb0f231babc87a43ad`
- [053 - Ledger Compile Addendum - pldg-20260626-001-feature-name](053-ledger-compile-addendum-pldg-20260626-001-feature-name.md) L23240-L23616 `2cf23d2a23c45672f5814ab7e257705ed26e7978589aa1ba8d405bd152fdedae`
- [054 - Ledger Compile Addendum - pldg-20260627-001-feature-intake](054-ledger-compile-addendum-pldg-20260627-001-feature-intake.md) L23618-L23829 `dda3bfc2805691cb070d8922c23847a01bd9772bd656da834d44584d4246ac08`
- [055 - Ledger Compile Addendum - pldg-20260701-001-feature-intake](055-ledger-compile-addendum-pldg-20260701-001-feature-intake.md) L23831-L23910 `b6cc75a527dac009b4cbfb04a20f3a9e58eb5123ba6433f40c1e6925fcb7ac8b`
- [056 - Ledger Compile Addendum - pldg-20260703-001-feature-intake](056-ledger-compile-addendum-pldg-20260703-001-feature-intake.md) L23912-L23977 `30f396357a34a1d200323e7d663826faf4bae722483fbe1c22ae802f9662750a`
- [057 - FABLE Residual Chat Mechanics Cleanup Addendum - 2026-07-07](057-fable-residual-chat-mechanics-cleanup-addendum-2026-07-07.md) L23979-L24050 `54563b560747370e91761be67b7c32222bfa2e8528888ad95ff8563b95fda8c4`
- [058 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](058-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L24052-L24096 `cdc5ee0cce2c0e2332a7a00e0deca93f9346a3b24cdfc3ef045abe39e2238cc6`
- [059 - Usage GUI Propagation Addendum - 2026-07-09](059-usage-gui-propagation-addendum-2026-07-09.md) L24098-L24174 `d766c73bd4c3edba80547582b9fb39ccdf29911884ff67d1074b2790b6b71da8`
- [060 - PMConcept6 Chat Polish Addendum - 2026-07-16](060-pmconcept6-chat-polish-addendum-2026-07-16.md) L24176-L24408 `3d1d49264c26a228177dbc229b975d4e10a85cc9f5bd5e033780d3d087fce80e`
- [061 - Immutable conversation restore-point lifecycle - Known-37 completion](061-immutable-conversation-restore-point-lifecycle-known-37-completi.md) L24411-L24428 `bc1bd66b29d8198879dd5e3eb816a148365f1e4ca619e1403b0b8129883c60cf`
- [062 - PMConcept7 Concept Promotion Addendum - 2026-07-23](062-pmconcept7-concept-promotion-addendum-2026-07-23.md) L24430-L24814 `b9d3761289cec483094f9bc167e2213b2d4819b7fb4e594227c470904a77210b`
- [063 - PMConcept7 shared Assistant seating and context surfaces addendum - 2026-08-27](063-pmconcept7-shared-assistant-seating-and-context-surfaces-addendu.md) L24816-L24918 `3bd9299dc4eb11496e59bff3758db2aeba9d26fc3d1655b276cbc61ef31ae6f9`
- [064 - Additive Correction v4 — Consumed Assistant Behaviour (2026-09-03)](064-additive-correction-v4-consumed-assistant-behaviour-2026-09-03.md) L24920-L24968 `a3bfbb6c033db2363d87da0a3301ba41d3fbe550130862f7b8541b083159122d`
- [065 - Working Notebook Surface Addendum (2026-09-05)](065-working-notebook-surface-addendum-2026-09-05.md) L24970-L25078 `635671349853e1c0fd871fae86fedffa02a19e8610b5f2856b3e762512dd5f0b`
- [066 - Cumulative v3 Assistant Interaction & Surface Specification (2026-09-07)](066-cumulative-v3-assistant-interaction-surface-specification-2026-0.md) L25080-L25449 `901f725945c3f7c6eda7f9f37618bd2e9e84ceb03e73d7d62678b580f893c072`
- [067 - Research decision packet review](067-research-decision-packet-review.md) L25453-L25548 `d7a045d10057074b3e2e81e20bfd0968ad9e62018bc0bb3bf688d3593309369a`
- [068 - Context Lens Source and Preview Reconciliation — 2026-09-10](068-context-lens-source-and-preview-reconciliation-2026-09-10.md) L25550-L25614 `5a89afb5e9adfe2edf1e5ad08d41ceb7dd353182da4445c7b1ee46346cc52d7d`
- [069 - Compaction completion Event Authority (DL-039 and DL-040)](069-compaction-completion-event-authority-dl-039-and-dl-040.md) L25616-L25669 `14ab8c9f0555f2c3043ff94b638dd22e326546eae5e063faf51354a5a293ddb9`
- [070 - DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)](070-dl-042-historical-todo-event-migration-consumer-boundary-2026-09.md) L25672-L25719 `9afa91872532049c3b5e0ec97c692a0462905343e5728d8027d5a3f75ab722eb`
- [071 - Restore-point created native and historical consumers](071-restore-point-created-native-and-historical-consumers.md) L25722-L25896 `f2c3104b59ca0be65fe088105ead277bd9e8606f685f56c37bb0002d7eb3d897`
- [072 - Deleted restore-point passive history admission](072-deleted-restore-point-passive-history-admission.md) L25899-L25965 `7ccf31aaafbe976dbb80d31ac32e078ca11130948e132652018978e7e0ea7671`
- [073 - Expired restore-point passive history admission](073-expired-restore-point-passive-history-admission.md) L25968-L26037 `97310760fd12f5f6e31d696caf50f5e33f153eac676ae32504a743ec99d6c638`
- [074 - External Research Decision Packet Consumer Addendum (2026-09-17)](074-external-research-decision-packet-consumer-addendum-2026-09-17.md) L26039-L26089 `db327698bf4cf1739a8fef5c3dfaea132c359024b47a0dcef82c7767277499f2`
- [075 - Chat WOW Turn Presentation Addendum (2026-09-27)](075-chat-wow-turn-presentation-addendum-2026-09-27.md) L26091-L26745 `eb58977db461f3da69bcd00e580fe714834e24e065973972675d3ac7ee6314b6`
- [076 - Wand Modules Redesign Addendum (2026-09-27)](076-wand-modules-redesign-addendum-2026-09-27.md) L26747-L27459 `2cddff0c7d3f841b322d4673956e2bf79ab712cb8c328cc5d052a9e706ddf9b6`
- [077 - Chat Tweaks Addendum (2026-10-08)](077-chat-tweaks-addendum-2026-10-08.md) L27461-L27537 `b826c47d1bbc1b66902fd9117a776817e1cface0537048f84163518a08d60265`
- [078 - DL-180, DL-181 and DL-185 — What The Chat Opens, Its Column, Its Command Card And The Port (2026-10-09)](078-dl-180-dl-181-and-dl-185-what-the-chat-opens-its-column-its-comm.md) L27539-L27966 `87c07ec126654d775e75934f1284332786f106b3daf11eb2412d72b492ef3218`
- [079 - Grill Me rounds and agreement — DL-218](079-grill-me-rounds-and-agreement-dl-218.md) L27968-L28181 `270508134d550fe164c71daa5a7c21a1748fba075c47eb78f0f2df9973f2a933`
