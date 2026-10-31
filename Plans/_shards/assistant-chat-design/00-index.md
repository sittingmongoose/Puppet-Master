# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-10-31T17:42:58Z

Source SHA256: `f844135b97b3285cd88b3f0e377906be3dc72329a13056057c7b0e966720a041`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `32ef68d9d79ce64ef20e1e9e922b3f9458d3385e59ec6509d8cc7f97f80266d6`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `d8c636347889bbe36f62a5567b2e89a6a4d9c3258e0e5794dff053e01b24d86f`
- [003 - Change Summary](003-change-summary.md) L14-L30 `62d7a17ed3507da419267cf54039345015a937f0688a7fb562a31dc3b892d69d`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L32-L47 `17b31750b745430dbadda2b0a5e94e53f458512d20f8b6de9794bc6a6b90fda7`
- [005 - Executive Summary](005-executive-summary.md) L48-L52 `0da9f681c00d2d399c76c9fe1b4395b66530d79afea126cdd70638311bbab3e6`
- [006 - Table of Contents](006-table-of-contents.md) L54-L90 `aaad839166a6eecb697f45dc6c1cf838e42fc3a229aabcd7746170bbcbf12c13`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L92-L207 `d620fb13a1e72089d8b49b0e4663c51c406c93a3760e3ec263467d3ea319b1d1`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L209-L232 `05104a2039f89a3f6e02548ebb5d2635a4dfbb6a5a05562d058df86fbbe0a387`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L234-L240 `166ec206a6e56ebcd23858411c72f775e09f05bd1d613c7d2709d4d4c849e8d9`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L242-L291 `ddf09f7ff1689e110fc8f3221ab348bb693c07168135deef35068547851f5822`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L292-L440 `68b7012ac7b7b959a3eb1a84700200eaf8af21217b8ec7507c71bc50d2e19ef1`
- [012 - 6. Teach](012-6.-teach.md) L441-L483 `5051a6f886db469b2a1b88cafc1dbcadaf86503b2eef3fb7044e5f1647d0422d`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L485-L671 `ac554a63afac5834ceb9c4bba6118445d358de094df192c53821a07f44209125`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L672-L964 `bc3c4d693578e931c4fdf42dba3f9b9d7db1d4364e1deb18e965aafa78dff88b`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L966-L1008 `3e472feab5e85845a0b8818d96791ddc59f8fcb8b72827648bedd7fb92d3323a`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L1010-L1080 `d7a9a73b76c511ce92c8d76a65d76eb22adda3cf93308cb8a766acdb5b344d48`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1081-L1258 `47948a3f7a2ef88be42cc0d70d161854a4924b253a9c0de9d2b874bc506d9a73`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1259-L1367 `48549ad17d6228bfd2e79805de82d7ba2dba6cf9d2583c0de9d93ae1b07a6017`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1368-L1785 `d3f89fb99ead1e708393c21e6263f9a65b1c1cc6609898ffa35ba92d1b0a640b`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1786-L1903 `4e044bcce04c12dcce2b6774c8ddbc1b7e7c903573f52223913a5a47d92a2b46`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1904-L1937 `f45a897f664f7a523355269baa97c42642265d10eb8408e11e5c2f71390d2b0a`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1938-L1977 `d85ddd64e85b9f696fe45cac708d7cf7824a686e2d0f4f31d9b88cf6b7f36d24`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1979-L2092 `243cb65e1324c30aff5234498b1d24d9550f1ebe8818ee9c9d186ba26801aa71`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L2093-L2104 `09d58d59b9c922f5aaf611f35d50a9574ac527c109d3e676acb72698b7f07eae`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L2106-L2115 `df39e229b4b4ef65a29b4e15fdb487f291d3d902e32dcc21a4d6ba8b4b274456`
- [026 - 20. References](026-20.-references.md) L2117-L2146 `3fdf9613f36bc0bc343b7671c2e8ed2c29d08b102c47c7b9a8b56e5ae4a90bd9`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2147-L2165 `e8e9f609eb989d2be71d79d4396745a8820326dae1628d1ac78e7499762dc929`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2167-L2201 `c07b2d69b83e37691837dc11cdb097654b619f8f9065643e648c21f160b4ee47`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2202-L2297 `7360f13b4ac28782faad181332c106ae3f1a5f1f6424a52c58256a5f77ea1bcb`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2299-L2352 `1d88a182e0b4445b57d59971e3d3525fc41dc46e6c60b1b35ce9ad6e9ce9b094`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2353-L2359 `c1d7031b3ed6a965e6faf834cc368d4568a5b0e8131e08324977a2c380855c57`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep)](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2360-L2462 `64dc4081748a1b1f421516c2a11cc903612fdef9fee1784178d65165bb2b2c97`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2463-L2599 `3001f5930896046144cb400a5e1c82055e7b8fc3a8de5d520a12f38e05dc32fe`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2601-L2646 `9bfdd786f840961f4ee66fab612f1a0d42cd5acea7c5aa0a14dff38ed53c439e`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2647-L2756 `0eb4dac42e37b3c1fe29f40faddcdcc2730d9ed36bb59eaebd6d18f44f0ded37`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2758-L2773 `0b7fe2e5f65845713a4e1f5db7c35a15bd3f5481eb2d5b6eb7c52211aa064389`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2774-L2786 `63cc52251eb3c9a652446d8d55dc07bc09114442a0c674a5801ee34ec98a9cc5`
- [038 - Ledger Compile Addendum - pldg-20260630-001-feature-intake](038-ledger-compile-addendum-pldg-20260630-001-feature-intake.md) L2788-L2856 `520dafb52e3e4e3e45682a9d644ee1ce349c322b33e7eb01098ac9fd64e3c79b`
- [039 - Ledger Compile Addendum - pldg-20260624-001-provider-updates](039-ledger-compile-addendum-pldg-20260624-001-provider-updates.md) L2858-L3500 `bd7e075c94c16b6a301a57e0fcbb2e3163ace823ace7c7ae6e7f8eda4a6a4ae9`
- [040 - Shared actor-boundary, route payload, and blocked_notice packet](040-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3501-L3521 `74d7ea87ef466433197c6b861a3db5156ddc9936b11e942b4661ce0bb1705b18`
- [041 - Shared Conversational Actor Runtime Identity](041-shared-conversational-actor-runtime-identity.md) L3523-L3537 `628053954b7d3b45f7dc89406d2ab34dc60bd63acda5b15959ad7e698371db68`
- [042 - Chat Route, Permission, and History Behaviors](042-chat-route-permission-and-history-behaviors.md) L3539-L3553 `5a56e4c322b82d832a9f0852424d6054695e0c0a245b2916723abbe79dbd6ab8`
- [043 - Owner / Consumer Map](043-owner-consumer-map.md) L3555-L3559 `0001a0417193396a7b7f442178dac8be3a73586b2d03698580a4e14985ce6b9b`
- [044 - PlanUnits](044-planunits.md) L3561-L3612 `cc496a46ba40ecbbe8bda619b541a9dd8af680e394e21e32bb0a654649cc51e7`
- [045 - Shared runtime projection addendum (2026-08-13)](045-shared-runtime-projection-addendum-2026-08-13.md) L3614-L22455 `75dbc2ed8775bf85d6bee44f3bbf5c8fa6188365cf054a0cdfa07120f5cb1fca`
- [046 - Migration Coverage](046-migration-coverage.md) L22457-L22487 `5483b41deecc02b8754f774fb7204fc37bfb7c457f25153bca35bd8b39a9c49c`
- [047 - Ledger Compile Addendum - pldg-20260614-001](047-ledger-compile-addendum-pldg-20260614-001.md) L22489-L22577 `944917fb694429029259226e8ac446003f747d3fe08c75780706ef0d2faffd93`
- [048 - Ledger Compile Addendum - pldg-20260615-001](048-ledger-compile-addendum-pldg-20260615-001.md) L22579-L22676 `14e508a88145b553db7a247af3f9352d51deea1eec620980cfa5fc5d6244afc3`
- [049 - Ledger Compile Addendum - pldg-20260616-001](049-ledger-compile-addendum-pldg-20260616-001.md) L22678-L22996 `f10b440604405b7b8d2a54776d0b30331407dd14afd7c980db032c35805b1c83`
- [050 - Ledger Compile Addendum - pldg-20260616-002](050-ledger-compile-addendum-pldg-20260616-002.md) L22998-L23065 `d4ca01475cf28a2b846fb9dcd7f988527bcc5b634802ae4fec4da76ad37a8ce3`
- [051 - Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard](051-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md) L23068-L23156 `6d11cc21a391b97f774daec0745c641f12b175b05c47ef60f2aa6de002c0b9f3`
- [052 - Ledger Compile Addendum - pldg-20260622-001-fff](052-ledger-compile-addendum-pldg-20260622-001-fff.md) L23158-L23244 `5c357b547181a5d40446549e989f08c9e102c63ca6ae20bc33e31c58c579d38b`
- [053 - Ledger Compile Addendum - pldg-20260626-001-feature-name](053-ledger-compile-addendum-pldg-20260626-001-feature-name.md) L23247-L23623 `8d523f5104a93abc6c186d8d666f15ff6053777b947afb96b470f8a99b8090f8`
- [054 - Ledger Compile Addendum - pldg-20260627-001-feature-intake](054-ledger-compile-addendum-pldg-20260627-001-feature-intake.md) L23625-L23836 `a41c122123331d3f31124eb5f9714422992fbda545b95369501b0c345c44bd8e`
- [055 - Ledger Compile Addendum - pldg-20260701-001-feature-intake](055-ledger-compile-addendum-pldg-20260701-001-feature-intake.md) L23838-L23917 `2119de9f46938ccfd4310cd05690e151aeffc42916d34b878911fae7090c8c3c`
- [056 - Ledger Compile Addendum - pldg-20260703-001-feature-intake](056-ledger-compile-addendum-pldg-20260703-001-feature-intake.md) L23919-L23984 `e042d629c9226afb8e0252e5cc7e925c0cc8d414b8b695988d4a675eda876286`
- [057 - FABLE Residual Chat Mechanics Cleanup Addendum - 2026-07-07](057-fable-residual-chat-mechanics-cleanup-addendum-2026-07-07.md) L23986-L24057 `0d27fa39d0de793b1e31c45cb11e0805af324934840be38db326455728bd7e14`
- [058 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](058-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L24059-L24103 `2f915df06648419faaf168e8f346b1129deb93883df8f337835a1657d55fd633`
- [059 - Usage GUI Propagation Addendum - 2026-07-09](059-usage-gui-propagation-addendum-2026-07-09.md) L24105-L24181 `1d516ae5b2eebb376462f2f69812aba8d7209cae5ffcb668967c67debbcd1fff`
- [060 - PMConcept6 Chat Polish Addendum - 2026-07-16](060-pmconcept6-chat-polish-addendum-2026-07-16.md) L24183-L24415 `cfbe9df0a031f1d77bb2b486f82f88a720d3fb2fcd304940d4bdff2e9ea53a90`
- [061 - Immutable conversation restore-point lifecycle - Known-37 completion](061-immutable-conversation-restore-point-lifecycle-known-37-completi.md) L24418-L24435 `ab79ff5690af10291fb485c0732ca8b16428407afd36d2888055e17a3404c31d`
- [062 - PMConcept7 Concept Promotion Addendum - 2026-07-23](062-pmconcept7-concept-promotion-addendum-2026-07-23.md) L24437-L24835 `5c666011b9006712b0fff26328d17f453f853977fc23b0e698631e01c2f544c0`
- [063 - PMConcept7 shared Assistant seating and context surfaces addendum - 2026-08-27](063-pmconcept7-shared-assistant-seating-and-context-surfaces-addendu.md) L24837-L24939 `b749be73c676371a9e1e3f72129630ca5741e07e6672fba8c3de980fd706d5a6`
- [064 - Additive Correction v4 — Consumed Assistant Behaviour (2026-09-03)](064-additive-correction-v4-consumed-assistant-behaviour-2026-09-03.md) L24941-L24989 `af12e7be21d47b22de70707f51ed5d28c8658dd6df686085208291a3e7ac5763`
- [065 - Working Notebook Surface Addendum (2026-09-05)](065-working-notebook-surface-addendum-2026-09-05.md) L24991-L25119 `c1ee588e4c77ede231725dda0685139aeb2a5212ddfb5f4dcb87f082a4ea0f87`
- [066 - Cumulative v3 Assistant Interaction & Surface Specification (2026-09-07)](066-cumulative-v3-assistant-interaction-surface-specification-2026-0.md) L25121-L25516 `efb06b0412765c4dee53c790f17cbaa3aaa625eb665460a7eda5b59507f4275c`
- [067 - Research decision packet review](067-research-decision-packet-review.md) L25520-L25615 `17c23d88d60a44d3c283f054566ac60ca7db09613f6cc9d31362baff72c9aee0`
- [068 - Context Lens Source and Preview Reconciliation — 2026-09-10](068-context-lens-source-and-preview-reconciliation-2026-09-10.md) L25617-L25681 `5a6f033a97c550dee5b8e9027caac65401f292086b771ddba286bd508a11b050`
- [069 - Compaction completion Event Authority (DL-039 and DL-040)](069-compaction-completion-event-authority-dl-039-and-dl-040.md) L25683-L25736 `8091c69f1f829b380456e871616b769838fa9d36817120de860147d76d96a331`
- [070 - DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)](070-dl-042-historical-todo-event-migration-consumer-boundary-2026-09.md) L25739-L25786 `36f24666464403f7444786017a16a9c83ad9b3ad84cce73dac224d071d5a78d9`
- [071 - Restore-point created native and historical consumers](071-restore-point-created-native-and-historical-consumers.md) L25789-L25963 `a067ba4c1e601ddf60dfd1fe690b11858dec54e3dc646da60decfebf4e441876`
- [072 - Deleted restore-point passive history admission](072-deleted-restore-point-passive-history-admission.md) L25966-L26032 `b13221d14dab19ea17beed80496268f38cb3b1e646beb9b0cc7f580e75aedb6f`
- [073 - Expired restore-point passive history admission](073-expired-restore-point-passive-history-admission.md) L26035-L26104 `54706ee2d2f80c1eb766a5e4102e4a51553b1154a14823c32dd5c14d645a001b`
- [074 - External Research Decision Packet Consumer Addendum (2026-09-17)](074-external-research-decision-packet-consumer-addendum-2026-09-17.md) L26106-L26156 `385490b554c9dc60ad424f9970a316787fcf73657499fa7974bba4ba1cffdc03`
- [075 - Chat WOW Turn Presentation Addendum (2026-09-27)](075-chat-wow-turn-presentation-addendum-2026-09-27.md) L26158-L26805 `fd9a7e99fc3b66dc1b82044f32ecf398b988ea1e9c1fb143583e38daf0226983`
- [076 - Wand Modules Redesign Addendum (2026-09-27)](076-wand-modules-redesign-addendum-2026-09-27.md) L26807-L27538 `2d4b407711f2ba8fadb2101206cc11f3dd08263ffb020f5d0d2c445ea1f874ff`
- [077 - Chat Tweaks Addendum (2026-10-08)](077-chat-tweaks-addendum-2026-10-08.md) L27540-L27616 `5bc62e97b34d3f45d6affabcec79e76495aa74ffff871a855dadec6a198dbd94`
- [078 - DL-180, DL-181 and DL-185 — What The Chat Opens, Its Column, Its Command Card And The Port (2026-10-09)](078-dl-180-dl-181-and-dl-185-what-the-chat-opens-its-column-its-comm.md) L27618-L28107 `0ad99e91bfc54c48a333bb408803ff7f49e9ec9e1d2f6b6b99c37bff7c581cfd`
- [079 - Grill Me rounds and agreement — DL-218](079-grill-me-rounds-and-agreement-dl-218.md) L28109-L28533 `3abcfd31e7d3b8d0ffea38b1268c25d1a55a959f53ade9801687ce41787cc234`
