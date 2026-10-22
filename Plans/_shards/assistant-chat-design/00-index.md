# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-10-22T23:03:30Z

Source SHA256: `7e213a615c0b7548e5ab3570e7367f25f09860cea7fe297ae58827bbc420f34a`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `54dd31369ee8ab3ff2d5e9c5187c43c467a2cbf969df0f72a1ab7dac28a8187e`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `072d3959c0d299a94f92eda24ccfc6eba6aa31a0d2e0f46600a33c0d9e67d4b1`
- [003 - Change Summary](003-change-summary.md) L14-L30 `3726c4eb9b472299e7ddb1b4b50f61aee40dde26251a071207920c77b32c1be4`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L32-L47 `3ee152dae1e67a3bf86a9981af9f7e17dbf8ad575450ec536bf83a4b2d2bb9b2`
- [005 - Executive Summary](005-executive-summary.md) L48-L52 `e50b41185c9e8e1e3a7e3b07df191d0bfb10fdbe35c6df770b13915bb28df167`
- [006 - Table of Contents](006-table-of-contents.md) L54-L90 `1332d9bc95e7e4a942ac089361e1c3b40365f95075a42960d7c529ffece2aceb`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L92-L207 `9f6339360ab96fe4ffb38b05b0854b3e898b642fb0a7521eb2ef07c23e7f6585`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L209-L232 `884cee7968228657e02334aeee0fbde2f2e0aef8346c3617ce0970b8c7a9e11d`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L234-L240 `e632af4fc0ad4fc312e08e7746ded648e3d829ebe6b5cb8d999fee14c62591b5`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L242-L291 `291c2a5b350bd61ba488d25bfc24cd647b5c38e056e9991c8f6b475f47ea73cb`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L292-L440 `5b8be7d936d2420e402f62d1cdd13e43b62c27234d094167128b838757ebf051`
- [012 - 6. Teach](012-6.-teach.md) L441-L483 `5afafe5ef6fcf7267111cdb0f7d54c2bc22258d467243819b9c3dadbd44b2420`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L485-L671 `8ded2a7196f5f548867b7242e621594aba1ccde8e9ff9a4413120cfe8514ca37`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L672-L964 `80ece731f93826b2dd8822e864354f97dfe52f101926a7c83f9f26ef637faa4c`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L966-L1008 `5dfaa222f3bc2d67068addd25e53df06e8ad2ee75cebe01c7ffa7ed28f2bd3b9`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L1010-L1080 `a535040d534ed81456a79e75d5e008598b56f967539f4ff547414681dc811418`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1081-L1258 `3c17cbf2343f92f630f3510af0b89bed98cad909372c502e71fc4f5e98913e20`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1259-L1367 `c0913f4ec5197115f5bbb1971d96a462ee850ade1c5c6f6ba5005ffbc0f837e6`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1368-L1785 `5506c8064970e32f9e43c0c98c2209ec03d81559256a10c74a94eff91741d6f6`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1786-L1903 `b2c075eb50de1a7a93711a3c0b50833be83570e5973c230eec1f2fd4d6386a83`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1904-L1937 `74393fa4c95d2fd7a54390487d18e1c0414d6d74668ed6a6f1d7d0b6ca4db44b`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1938-L1977 `21b82a8d43e517a9a2979f1fb9705f4e78963bf71c7b6d75ab0f4ddaf8cf8493`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1979-L2092 `2f4a007d32011c748b3161fa606f08b4b442dd67130eb8c76659fdbe9bb0f37b`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L2093-L2104 `17d5a4ca612c892dd07e8f856e5b902ee7158ea81527b519ced7786a49f50d88`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L2106-L2115 `e7bba86cde6971364daa1dd9cdd0ac0c2d417ee84839a06cf3498563f29707c1`
- [026 - 20. References](026-20.-references.md) L2117-L2146 `e82f705be0665b3e6adf50d9c11a076ab9af1031e46bbaa405312a16abb95f7a`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2147-L2165 `1b7988e7c1bbf946b2fd5530b45ab37d29e4c30c12032098f6dc01cc2cd8d3d3`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2167-L2201 `719d798077f0e602eb460f70b427b34d31a079cb0095eb6d366bc9ceeff6e47f`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2202-L2297 `8e821844a299a721b5739fc24a9887e85245145fb577f991f0d92c084582ff4b`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2299-L2352 `ebde2ab06ecd489d57dcdece036f2563e6f3579e5c3de0087b1c49e4e0ed681f`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2353-L2359 `0d98dd880929305186f1512926c19ff6f5bf39b894d5934ee214856f4a368436`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep)](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2360-L2462 `76e315066c2fae86230b8d9ad22fe0ad26a3b17580c3767768cefef3e36e8162`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2463-L2599 `1c3de4d94682838c17fce67fc1e4d19303f14787d2131eb54e2035f2a3e74514`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2601-L2646 `cbc717aa4d1054fab0275c0643eded20dd7f31216f58055cbbfb5e512fa8684c`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2647-L2756 `ff72112e25702d695e248643a539df72396c811aff780d2dffdbd93a6673c2be`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2758-L2773 `ef7f618eeeb80ad22974b07e5ef67eb77f7fbc9fd94dd9aacd1a388a91e546e2`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2774-L2786 `cb3cfc0e79f1c0691bafce98c6fbf5d6539dc1d187b423c554cae48fa12c06b0`
- [038 - Ledger Compile Addendum - pldg-20260630-001-feature-intake](038-ledger-compile-addendum-pldg-20260630-001-feature-intake.md) L2788-L2856 `34fc7a5297c60befe0f711bc5dfe172e959e7755c6849877c559bdd54861f292`
- [039 - Ledger Compile Addendum - pldg-20260624-001-provider-updates](039-ledger-compile-addendum-pldg-20260624-001-provider-updates.md) L2858-L3500 `8600112ede002605804a19ce361d06bf6f2f97a0b655ece57d33ca5876cbf730`
- [040 - Shared actor-boundary, route payload, and blocked_notice packet](040-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3501-L3521 `d7cd3b924386b62b4f5522a82e8e21b33dbf691ad53e38b1e7484b691a1467d9`
- [041 - Shared Conversational Actor Runtime Identity](041-shared-conversational-actor-runtime-identity.md) L3523-L3537 `fb914936abc56e8392ec22dd8241788d60bcd2fccd33982a30182f858d9b7211`
- [042 - Chat Route, Permission, and History Behaviors](042-chat-route-permission-and-history-behaviors.md) L3539-L3553 `71ec2da2db87bc8a233232cf8e0a3e19ab70475e05c9eee085eee65a55b80c9d`
- [043 - Owner / Consumer Map](043-owner-consumer-map.md) L3555-L3559 `d1ab76d0c44d47cab5338aeb5ea4ec83707648fd6ab033a7ad44a7b0566620d2`
- [044 - PlanUnits](044-planunits.md) L3561-L3612 `a734e4a3acc027cfd1a496c20803cf88af71b2269e345f1ffc0284eac5c6fe73`
- [045 - Shared runtime projection addendum (2026-08-13)](045-shared-runtime-projection-addendum-2026-08-13.md) L3614-L22417 `da64bed9422908d1887efd1844b8b17b42625d466a8759965e86e139402fb8ab`
- [046 - Migration Coverage](046-migration-coverage.md) L22419-L22449 `8da5ece13876a2418726e1012e365bcf73f829f418013b6e9cacf352b3889dd0`
- [047 - Ledger Compile Addendum - pldg-20260614-001](047-ledger-compile-addendum-pldg-20260614-001.md) L22451-L22539 `0b6bf24c1c67e52059fc18813190cea9882ceda95b6881a7cea5980ae7f9f2e7`
- [048 - Ledger Compile Addendum - pldg-20260615-001](048-ledger-compile-addendum-pldg-20260615-001.md) L22541-L22638 `e388dd92bbe23995d56b77ba76879d88153711fe13785125bb5ad96b665a1c84`
- [049 - Ledger Compile Addendum - pldg-20260616-001](049-ledger-compile-addendum-pldg-20260616-001.md) L22640-L22958 `9d88177e3263dd6a0afc5112f3dcf8d211f9d0dfc8df679abc5cf9802a447130`
- [050 - Ledger Compile Addendum - pldg-20260616-002](050-ledger-compile-addendum-pldg-20260616-002.md) L22960-L23027 `47c921a1823f118ad424ba3e8e7d51cef06fed52e95e0c0a2a3b88175f4b9025`
- [051 - Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard](051-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md) L23030-L23118 `98f8dc9180525c383e68e276658d75e0563929ee8589cb4e5c6c3a64d2ffde41`
- [052 - Ledger Compile Addendum - pldg-20260622-001-fff](052-ledger-compile-addendum-pldg-20260622-001-fff.md) L23120-L23206 `ae6c5c12c4898e8dab5d2c54360aa54fbc70f002fcbdc2cd66927a206e61c556`
- [053 - Ledger Compile Addendum - pldg-20260626-001-feature-name](053-ledger-compile-addendum-pldg-20260626-001-feature-name.md) L23209-L23585 `dda637e955b633e62830ce381f693284b087dd13d53caa1ee90132791895c759`
- [054 - Ledger Compile Addendum - pldg-20260627-001-feature-intake](054-ledger-compile-addendum-pldg-20260627-001-feature-intake.md) L23587-L23798 `069483b6800798db03afd8bf714dc80ed3068be45f944eb7fc27039de75f83bf`
- [055 - Ledger Compile Addendum - pldg-20260701-001-feature-intake](055-ledger-compile-addendum-pldg-20260701-001-feature-intake.md) L23800-L23879 `ef9d69c9fc200f0811e14c3ecb8d133311ad1c26a05f4c2b5dac0d6d1cca0e44`
- [056 - Ledger Compile Addendum - pldg-20260703-001-feature-intake](056-ledger-compile-addendum-pldg-20260703-001-feature-intake.md) L23881-L23946 `c6a54010c35528acb81c5c5ce75926e5471f4ede1007136f6a1cccbf0b1717ed`
- [057 - FABLE Residual Chat Mechanics Cleanup Addendum - 2026-07-07](057-fable-residual-chat-mechanics-cleanup-addendum-2026-07-07.md) L23948-L24019 `5563d1c3baad8fb45110386c51d8011b5ad5067afa7ee539a992079e248613b7`
- [058 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](058-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L24021-L24065 `74278f2a121edfac3c2c720fa4f006d034d31e9c3fcb863957dd9346b7e3d6f4`
- [059 - Usage GUI Propagation Addendum - 2026-07-09](059-usage-gui-propagation-addendum-2026-07-09.md) L24067-L24143 `9b29d18bb969da5fb11bda55bf90edcbda08b429f56b78a16938c743e8d93ec8`
- [060 - PMConcept6 Chat Polish Addendum - 2026-07-16](060-pmconcept6-chat-polish-addendum-2026-07-16.md) L24145-L24377 `1e761f2dc069258277f142a73f0b95686bd833b69ad063e904c6b72261ddade0`
- [061 - Immutable conversation restore-point lifecycle - Known-37 completion](061-immutable-conversation-restore-point-lifecycle-known-37-completi.md) L24380-L24397 `a0ed1a0eab710d69306f7e0e5d4d074e9c5fe4178c6632ea366489361032011d`
- [062 - PMConcept7 Concept Promotion Addendum - 2026-07-23](062-pmconcept7-concept-promotion-addendum-2026-07-23.md) L24399-L24783 `3343ccd6ccd68686290bcbaffd26ffe87ff83c66c96f2066f429af5091b118d1`
- [063 - PMConcept7 shared Assistant seating and context surfaces addendum - 2026-08-27](063-pmconcept7-shared-assistant-seating-and-context-surfaces-addendu.md) L24785-L24887 `f2091f6166e82e8bedf21e492ad4773ecd5b5dbaf8a7a2c49b54f957b98966a3`
- [064 - Additive Correction v4 — Consumed Assistant Behaviour (2026-09-03)](064-additive-correction-v4-consumed-assistant-behaviour-2026-09-03.md) L24889-L24937 `70b9b61d0047f3199a22de05d82ad0cf066090bb6abd325c6d6dbfe4735cb8ed`
- [065 - Working Notebook Surface Addendum (2026-09-05)](065-working-notebook-surface-addendum-2026-09-05.md) L24939-L25047 `4b704aadf29f03d40d2b24dc55157cace8afc6c56e1c3fb4b3fd146c03bae199`
- [066 - Cumulative v3 Assistant Interaction & Surface Specification (2026-09-07)](066-cumulative-v3-assistant-interaction-surface-specification-2026-0.md) L25049-L25418 `ac3839737fa9d81bd04d1fa274e3aa808f86a98a25c7a92a7b87e955cc46a186`
- [067 - Research decision packet review](067-research-decision-packet-review.md) L25422-L25517 `f9278c0b34ae84244b884b449e03dbd18cf429ad02f3d35e04111dadce6f0ad1`
- [068 - Context Lens Source and Preview Reconciliation — 2026-09-10](068-context-lens-source-and-preview-reconciliation-2026-09-10.md) L25519-L25583 `6a4043a0425f2587058949496838c8701b7c9a4ac1c4fb315fb399e696f9867b`
- [069 - Compaction completion Event Authority (DL-039 and DL-040)](069-compaction-completion-event-authority-dl-039-and-dl-040.md) L25585-L25638 `728c6ee1ac9642b78650e72fb47c2c6ded5b1339a76920e9a959b942aaa4bb2a`
- [070 - DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)](070-dl-042-historical-todo-event-migration-consumer-boundary-2026-09.md) L25641-L25688 `ebd76896dbbc006b64786154505d1b5d6c7a77fa9e0648bd5d612c74d132f5f2`
- [071 - Restore-point created native and historical consumers](071-restore-point-created-native-and-historical-consumers.md) L25691-L25865 `774e2aedc741d6d3df6444a94b20f3fdbdd2a149c30fdad7fdae0305afc18197`
- [072 - Deleted restore-point passive history admission](072-deleted-restore-point-passive-history-admission.md) L25868-L25934 `3aa00444273309cfcfe3f6febceb77faac43d6ef4bcbe63b0047fd02f2b012f4`
- [073 - Expired restore-point passive history admission](073-expired-restore-point-passive-history-admission.md) L25937-L26006 `cf99987233a9d425cbf34645a045af0a6936d9dce891280e6dc2773b55295e12`
- [074 - External Research Decision Packet Consumer Addendum (2026-09-17)](074-external-research-decision-packet-consumer-addendum-2026-09-17.md) L26008-L26058 `2f6e3b8ae4732cf874b07cfa1364cc55165a0c6087aa8b2758520b3e67665a01`
- [075 - Chat WOW Turn Presentation Addendum (2026-09-27)](075-chat-wow-turn-presentation-addendum-2026-09-27.md) L26060-L26712 `a6dcea3ea4155978eed6fec8f55158472b13e3414e61070b89da80d09ba9a1af`
- [076 - Wand Modules Redesign Addendum (2026-09-27)](076-wand-modules-redesign-addendum-2026-09-27.md) L26714-L27426 `42e3caf1ba7a59af4c1d572340ee4631703952577fd433cf3d3f16980ea03eb6`
- [077 - Chat Tweaks Addendum (2026-10-08)](077-chat-tweaks-addendum-2026-10-08.md) L27428-L27504 `e52ee5b2abbf5221a1551e6d28ae62602cba49b09ca2044defb93ad4f8574bb5`
- [078 - DL-180, DL-181 and DL-185 — What The Chat Opens, Its Column, Its Command Card And The Port (2026-10-09)](078-dl-180-dl-181-and-dl-185-what-the-chat-opens-its-column-its-comm.md) L27506-L27933 `8c1a0494d2bad3cb97eb94cb8c98d106183aac27f3e1841bd3d4409942ece727`
- [079 - Grill Me rounds and agreement — DL-218](079-grill-me-rounds-and-agreement-dl-218.md) L27935-L28147 `debd492042a19b86fa9116a1d4e5c516a40b252fabdcb1bddde54bfcaa0a1739`
