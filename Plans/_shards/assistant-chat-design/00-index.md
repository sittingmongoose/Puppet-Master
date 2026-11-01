# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-10-31T22:34:01Z

Source SHA256: `daff80e144848e214adc7055bb6c52c866dd17ec7d7dce53ef2875d02a733dd6`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `1447c9868246ea3169e1d958cd30295a98702003d5e6e03a90d41045312ec94e`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `57db4673bfdc449687f7f4f19540451e4cbfcfcbfb5caf621906e02c73b32e7b`
- [003 - Change Summary](003-change-summary.md) L14-L30 `b23f7b451440ecc8af40b8019e4d18d4de413737ca5f32837cbe4a9391dd49e0`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L32-L47 `2a754ecb0ce0e991f45b5f0b7476b240cdbd02020cb7a135d3c4c0a341df11cd`
- [005 - Executive Summary](005-executive-summary.md) L48-L52 `6ab13c4ba70b74f6e3a89aa696af10fcc1de089cb27c073e447d9e3cdbe5e994`
- [006 - Table of Contents](006-table-of-contents.md) L54-L90 `ec9674f46eba6ec3b5e3dc7e587e452ad2fc56e14dceb3437aefc3d0e4595a02`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L92-L207 `f69a9be10cce2c9c8a04695f735475d4b2c5d2738c5ed1324791bddc984a2110`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L209-L232 `a5a4361133a5b6b4ec9a8bf5c1693d454d6f8c4622199f6b0965f135ad2dc7f2`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L234-L240 `ab3ea86da2d1520f77910f2310b68f25b0151b85e95ce8b9f86c0dcefb385f5b`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L242-L291 `ec86cd95965633038da2709b8c7503079fb16ba0206e8ce9fc5806291cfd640c`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L292-L440 `b073d7239633a6b84740b185429a418b75e23bc12e31aaace15cda809cf6c41b`
- [012 - 6. Teach](012-6.-teach.md) L441-L483 `c7ce42c7b223e8a10616ffab46f49bb2b6f289894b295f832caf1513951bd6d7`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L485-L671 `c0277a172ecdb2fee0f9ef9d81dff80c71eb6a15eeb906c805774301b4e11ab8`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L672-L964 `7cf5319a46e4f95af5dad8928d020cd35ce549dad31b91f8343212fd715cbc7e`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L966-L1008 `7f63ce1840d2c8f3bbd5fcb29a6d8e634fdb5c28a6f6b3c0893806fb8b936977`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L1010-L1081 `57f025b41607865c14548cb7c5103c0cabbd7c9b198fa1463c6efe6a4f78a4dc`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1082-L1259 `1d568b45b6434fb3a2ee6d818236954b3ec5d38f055d489f58c2b62fc58ca980`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1260-L1370 `d62bd32a0a678b6589693fb5738bbabfeb0281f763e4085d962bd8584a64991e`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1371-L1788 `98ce4d2fd0843228f26f5137a101b123449676a93c8ac584ca5805483066bfdf`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1789-L1906 `f2f7dd850d90e0811fc952d9d486c575501e6499f1c1ed7b80e63edafaaa61a4`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1907-L1940 `f5e8368b6cf25a5ddc2a93ae9c381e4ddab6a7369e3a45c1ca2616e79b3bed8c`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1941-L1980 `a3ed8375f3095f113754082073b61df8d475170b2b79abf94f4f9c361e1f4db5`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1982-L2095 `cf8605df8abc156771bd82850001ec7f6d13f186eaf9167602db3a1b127bc0e4`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L2096-L2107 `49bbda84fededbfe850186878c97a92e2eb7271a01ca4dba896c0c500360d947`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L2109-L2118 `a4afdc2e226c833776cbfcb4d1416295e3b9e03c1da567085d35c2fca172802b`
- [026 - 20. References](026-20.-references.md) L2120-L2149 `c7093e9793d6834363fb7820a580b72d3d0b9b207f54416d14ba412288981725`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2150-L2168 `876ffb101808345c4fcffd9b0ecec5b870f3cc29debd760e365d5169e2955104`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2170-L2204 `634e80043beaf0951ab73c0dd3c5fa094b99f088bcb0e721749c6250fbf1ac46`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2205-L2300 `9ab6231e7304ec70be1021be9477d237350e9cb479bcd6a681abbb0723ed294b`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2302-L2355 `cb84dc42f4f792eb95c9e762d367e07695f3c4b91e3161efebc915e76be34853`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2356-L2362 `db91b7bb5a631cb02ce51c60021425213d08841658350ce275046bd7c353776e`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep)](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2363-L2465 `42954ac9643a0ee9bb418240e0ce262b00fe567fef94327138b0019c90d8773e`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2466-L2602 `0447a362b1bf68da396aeb9884849c44f57cb7cbbd5e83a5ad634ff1efd52a57`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2604-L2649 `07a8e85413d1bb6f5e5856df1a193d1dec310ac5852cc59da3d0457e4af652e5`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2650-L2759 `cadd38b44489d5a70c009df69359710021baf6118e6311d5c9a5afdf7ebb625a`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2761-L2776 `16ecdb725af90fb90ce7da585b6fb61aab2be9bd4b40bc2e9734c84e3ba403b4`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2777-L2789 `2c4e38ff05e5ca56802cecfc0e6ad1a44a8c10384ed6986bfe06123a14499661`
- [038 - Ledger Compile Addendum - pldg-20260630-001-feature-intake](038-ledger-compile-addendum-pldg-20260630-001-feature-intake.md) L2791-L2859 `f4687e3d8176693edcac9a53c5c71c713601a27a20bdb055114275c3c11c18d5`
- [039 - Ledger Compile Addendum - pldg-20260624-001-provider-updates](039-ledger-compile-addendum-pldg-20260624-001-provider-updates.md) L2861-L3503 `d967ed8e1642b0d042b7cff7c17330d4fcde1a967a59527ead509c36e0452556`
- [040 - Shared actor-boundary, route payload, and blocked_notice packet](040-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3504-L3524 `00c54497b97bb51ed196ee0770bd59f8dc07de2e548bc0ac20308d0ff7f9ed2b`
- [041 - Shared Conversational Actor Runtime Identity](041-shared-conversational-actor-runtime-identity.md) L3526-L3540 `4529180522df3701b49cb62d8825ca204e141ce2c1d8e08c5b03daa5cbbf03ee`
- [042 - Chat Route, Permission, and History Behaviors](042-chat-route-permission-and-history-behaviors.md) L3542-L3556 `673f3788ec2071698d0af5cad8a2b621287415003a5e05ffd7617318153e6e4c`
- [043 - Owner / Consumer Map](043-owner-consumer-map.md) L3558-L3562 `b9d6e2cd77aebeb9ac45d71c9b686b0f562cec7a20466fad5196ebe8bd398ce4`
- [044 - PlanUnits](044-planunits.md) L3564-L3615 `dad7b5cd93d425bc14410e9bb9b3ccdc09fc7b4f04e6d4345bc89fab3991522c`
- [045 - Shared runtime projection addendum (2026-08-13)](045-shared-runtime-projection-addendum-2026-08-13.md) L3617-L22472 `89a66a1f727c1541d2f15dbf97e16688f210b2883983eabae27bcbd329b94835`
- [046 - Migration Coverage](046-migration-coverage.md) L22474-L22504 `4a501c6e28c3453d19933fbf00eaa427188d00aae1920c648efad3352bb880b8`
- [047 - Ledger Compile Addendum - pldg-20260614-001](047-ledger-compile-addendum-pldg-20260614-001.md) L22506-L22594 `0adadac03394fee860745490d16448869899131961212a5ba55a1d60611bd9dd`
- [048 - Ledger Compile Addendum - pldg-20260615-001](048-ledger-compile-addendum-pldg-20260615-001.md) L22596-L22693 `2da5d6ec6be6ed55f968031985f59c96ad62fe2a002e8b4f117f1e4d416fe1c8`
- [049 - Ledger Compile Addendum - pldg-20260616-001](049-ledger-compile-addendum-pldg-20260616-001.md) L22695-L23013 `f6e48207b2cb34269f1fac9f8ae8241d6f210ad95edb42b5cd59833de93b9f99`
- [050 - Ledger Compile Addendum - pldg-20260616-002](050-ledger-compile-addendum-pldg-20260616-002.md) L23015-L23082 `327244ca53e2f62ce797cbdb30c28af6dcf62cf9ec5c181a3c55e35dfc629105`
- [051 - Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard](051-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md) L23085-L23173 `84270f3b7311c44808814fb3bcf38c40eae0e51e7238bff4efcabc8c9473bc4f`
- [052 - Ledger Compile Addendum - pldg-20260622-001-fff](052-ledger-compile-addendum-pldg-20260622-001-fff.md) L23175-L23261 `944f2867116ec091c51e7b01241e3fe18ab314e55617c199276a56831cfc575c`
- [053 - Ledger Compile Addendum - pldg-20260626-001-feature-name](053-ledger-compile-addendum-pldg-20260626-001-feature-name.md) L23264-L23640 `2d715209e81253c33fbeaac55e156130de572dfca09c960df46e05c19ca4d06c`
- [054 - Ledger Compile Addendum - pldg-20260627-001-feature-intake](054-ledger-compile-addendum-pldg-20260627-001-feature-intake.md) L23642-L23853 `8ddbce595ef2d5d49899ff59f7183a48916ab89c6905155a5d8faaab6d7680f5`
- [055 - Ledger Compile Addendum - pldg-20260701-001-feature-intake](055-ledger-compile-addendum-pldg-20260701-001-feature-intake.md) L23855-L23934 `d5c62524d62b6b008fec5d394ecfbc7970bdbffff3bd0a5054095eaaf4391ba1`
- [056 - Ledger Compile Addendum - pldg-20260703-001-feature-intake](056-ledger-compile-addendum-pldg-20260703-001-feature-intake.md) L23936-L24001 `322560af3917d63771d74fab05ae9570a50dfc34c7ea72e56dddcee831042df7`
- [057 - FABLE Residual Chat Mechanics Cleanup Addendum - 2026-07-07](057-fable-residual-chat-mechanics-cleanup-addendum-2026-07-07.md) L24003-L24074 `2c6d6f3ad8c4dfec93957c76d7572dd4c8436f50e1e80ebdb37e5a5e55291ad8`
- [058 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](058-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L24076-L24120 `2fa7d9313f815080761e8784622647aec5b673aaa662bafcecf6f45201810d5b`
- [059 - Usage GUI Propagation Addendum - 2026-07-09](059-usage-gui-propagation-addendum-2026-07-09.md) L24122-L24198 `728e66684f6b9d94324a78f491041122629c875e5601c9125b933768d104f290`
- [060 - PMConcept6 Chat Polish Addendum - 2026-07-16](060-pmconcept6-chat-polish-addendum-2026-07-16.md) L24200-L24432 `610b26bf619fe141eaba9c45702267440d3f17de702a6f49be377ddb409b175b`
- [061 - Immutable conversation restore-point lifecycle - Known-37 completion](061-immutable-conversation-restore-point-lifecycle-known-37-completi.md) L24435-L24452 `92c9bdce3f7ae38a87d7e225b7371ec3da9ecac79e5140831003d8332e59718f`
- [062 - PMConcept7 Concept Promotion Addendum - 2026-07-23](062-pmconcept7-concept-promotion-addendum-2026-07-23.md) L24454-L24852 `6b075d1beb7a9a42b2fefdbd4ee9d58133054676ca1fd21c387df941dd8e86cf`
- [063 - PMConcept7 shared Assistant seating and context surfaces addendum - 2026-08-27](063-pmconcept7-shared-assistant-seating-and-context-surfaces-addendu.md) L24854-L24956 `1fbb751564f7509c7c401dd4dfac856fe9c142334b2322a59d81e86c84666e79`
- [064 - Additive Correction v4 — Consumed Assistant Behaviour (2026-09-03)](064-additive-correction-v4-consumed-assistant-behaviour-2026-09-03.md) L24958-L25006 `84e569d2820fdea5f297a760bdcb1826018e114f9e3e279690fa626629696d87`
- [065 - Working Notebook Surface Addendum (2026-09-05)](065-working-notebook-surface-addendum-2026-09-05.md) L25008-L25136 `eb1b31a99fec75de151686ca9a5669f9d70794f33ce2cce1e893511fbd3c591d`
- [066 - Cumulative v3 Assistant Interaction & Surface Specification (2026-09-07)](066-cumulative-v3-assistant-interaction-surface-specification-2026-0.md) L25138-L25533 `90fd6f116cde88da22b010c0869c6d6e82313097f4a624d69717d829c81b7657`
- [067 - Research decision packet review](067-research-decision-packet-review.md) L25537-L25632 `9915bac13d11c11fd2215c9924ccee6342d393573aefb8ea3fbcbc4c4885a18e`
- [068 - Context Lens Source and Preview Reconciliation — 2026-09-10](068-context-lens-source-and-preview-reconciliation-2026-09-10.md) L25634-L25698 `db7fa5a155fb35bc5befeed60db0757b0d3f35d9b8cfd1b34ab2362f4fb3f002`
- [069 - Compaction completion Event Authority (DL-039 and DL-040)](069-compaction-completion-event-authority-dl-039-and-dl-040.md) L25700-L25753 `a80d657646708857ed9f00934f08eda0a994f77037104f2c582276954c0ed356`
- [070 - DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)](070-dl-042-historical-todo-event-migration-consumer-boundary-2026-09.md) L25756-L25803 `ee0643d0e6ada224ba78f94889e6f54c0fd692b7595c08ecd0b18938c90f1f12`
- [071 - Restore-point created native and historical consumers](071-restore-point-created-native-and-historical-consumers.md) L25806-L25981 `962cd1d4c8b05dceb091b16ac039e8ca3e622033d4a69cee533748f2397aca50`
- [072 - Deleted restore-point passive history admission](072-deleted-restore-point-passive-history-admission.md) L25984-L26050 `84ed84d2d1e1af2311d44cab78d655fdccde72c00050571472a4cedefbbe07ec`
- [073 - Expired restore-point passive history admission](073-expired-restore-point-passive-history-admission.md) L26053-L26122 `8bd8e40e6a9b8c38f18f3c085bfbbd3cd0893b1463f0942dda5792d4f9bab9ca`
- [074 - External Research Decision Packet Consumer Addendum (2026-09-17)](074-external-research-decision-packet-consumer-addendum-2026-09-17.md) L26124-L26174 `a62bf330c5f835df3cb9ba32c050e1428d15d3a4eac79805ec92b38911b97d25`
- [075 - Chat WOW Turn Presentation Addendum (2026-09-27)](075-chat-wow-turn-presentation-addendum-2026-09-27.md) L26176-L26823 `ff6f29ff8a497d3738d7f28130eaf8a363ae1d126f0538a85c26a4611844a02a`
- [076 - Wand Modules Redesign Addendum (2026-09-27)](076-wand-modules-redesign-addendum-2026-09-27.md) L26825-L27556 `da7d9f183e4788c5810ac8b12677c0d59144c1a285cd09eaf7005748711c0ab1`
- [077 - Chat Tweaks Addendum (2026-10-08)](077-chat-tweaks-addendum-2026-10-08.md) L27558-L27634 `5902bb1f53aaee066251f30236b02e9b5394e2989e2a140258b82e217debed5e`
- [078 - DL-180, DL-181 and DL-185 — What The Chat Opens, Its Column, Its Command Card And The Port (2026-10-09)](078-dl-180-dl-181-and-dl-185-what-the-chat-opens-its-column-its-comm.md) L27636-L28125 `ca87e8c3cb0e8fc75bcdf8b145a2bc329d364e80645c2646ae1c24fae0938ba5`
- [079 - Grill Me rounds and agreement — DL-218](079-grill-me-rounds-and-agreement-dl-218.md) L28127-L28551 `794da5299334b85545dda5d549692511fa2d8973003ba3d025c28c887f07443e`
