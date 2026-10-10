# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-10-10T11:14:26Z

Source SHA256: `feebda270b973277d4b4a0cae68190f72e5f59f5cfdf0812801562b276d988c1`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `22d08337e61065a520b4d6d8352be5f6ff9750b11e8faa8d26c2677d0549e4f3`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `92bfde43110f4a05b0ca71d7394fd0e27885c7bcb640c6aa217dd1eaa8e1efb5`
- [003 - Change Summary](003-change-summary.md) L14-L30 `82cf84e16d1c76cbe518740e51c0583d8f8b6440ca99f6f6b0b4234b368d68f1`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L32-L47 `e432b4e8a836c46eef26e29e7dde0d43d9b7e7c119dcc8d111a4c070dfaf55d4`
- [005 - Executive Summary](005-executive-summary.md) L48-L52 `0c2615ab9540f1851e343d06870e2bb74e626efc3c3ea2fee3899d2068c4bb72`
- [006 - Table of Contents](006-table-of-contents.md) L54-L90 `1d6f4c7c98a964833a1ed9b69cc73ccfa34bf25daf5c13858ac1b80e17b7fab9`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L92-L207 `4315c2a43c11321f0e648352b001f699f1c166a45b78b0ddf0912815b5ad03f6`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L209-L232 `61dfac0783cfdf445fbff5df4d27d1e2687fe1bc8a55080fce2f003c1c178e66`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L234-L240 `8d156573dcf9c1bd8a8bb8462a7f471e07faf72c526abfbbeff63d4d54edcdf5`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L242-L291 `c3b9d78c87571ac17bdab9d80068ff9ae86ae3ece54f7494ca456701a37b27fe`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L292-L440 `5b8e9958d8829f681c35258c85e82189e3fd1a3e1b8e9ae099e855bae8fcd80a`
- [012 - 6. Teach](012-6.-teach.md) L441-L483 `abde7ca6d5d4c651400bfd30449d8d4910e812dacf2cee14c514541d9692db17`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L485-L671 `acc89527f4a6fd4eead705e4f80ec6ec6dd999c8c1bf46b2aa03ddc9e3a328a8`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L672-L964 `17ca33aa18d9f2cf7ccef727e81437feee1b1a95bfbef55b706d8986b136e9cb`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L966-L1008 `921772725149d18702d03733584feba70abb1ca4dd3af480f67d4c02a2f6f623`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L1010-L1080 `e6c3b32087efda396b325c1b8eddfbc811198476bc1f332d7ce1865570d57813`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1081-L1258 `e8768aada33b53287c91e8bc4ff6714306ea81ca2c56c157135f2670dd01f94b`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1259-L1367 `7428a03b7c0a89700f58e9faeb4e35206fa334f0ca6c99f3da1767ca49076603`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1368-L1783 `5514d17658cb34b5e95f14a4e10a9b7f4173120d4a573303f296caf85096f37c`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1784-L1901 `67dc514f8e0dc6c7bf8bc84cb3a6b46aaae4b602a96bdf81910187a5fc654dd5`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1902-L1935 `ec5e222e423c78bd8afb8b8edd299a36966647640acbb7f973cd74d094183d00`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1936-L1975 `65a4f83b86c3b7aae68fe52fa4989499e81837419a4e521ac60b57b165006baa`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1977-L2090 `54901380af8f88499310f3defb9da34a44dc1a1a36049623f00f420b905a7188`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L2091-L2102 `e519ad73143a0fd174960cd7031af3d7905268e7f678ba8e665a1f8f42e3254a`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L2104-L2113 `a03ac8d869530bc152381814311b6fe47ae74f786f64976fdd24a52244d985ed`
- [026 - 20. References](026-20.-references.md) L2115-L2144 `8a0c86ba7f773bd03e9fe23252fff1f802ad37fe2ce847f6aaac9a68e49e0ed5`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2145-L2163 `727b2a14ca5b09e4c429a1475b8d2e90fb376f1f128fc6497860b5014a510e4d`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2165-L2196 `dcdfa295276460e1a790bb2ca752c1a52a8338d55f0679d566584d5e8a2d975c`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2197-L2292 `d8b97ace749bb0a0948ab1952bd281674e85c9f11d607826c6aa94beac69f138`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2294-L2347 `b3dc6d01359b9a154ed376f3cf4e5ab6c61305b7a76cfc5d780467942f48a3f3`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2348-L2354 `a2b5dc194b0db47303e57f30614fb4ad5238b1974b01e7ee2bd9e715753a372b`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep)](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2355-L2457 `becb28cc3ec331cb02919e3922cce57d45e92926e0688779224e7ce49a079304`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2458-L2594 `f9ff852bd784c3d2a0b0b74ebd30daa411e96c9af21fa8768532bd7a5af28349`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2596-L2639 `6906c77362966500de9816fc7a04cf6c02549d83c5828e801ede6ef5861476ce`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2640-L2749 `f2e493558fb01d0c965f492f3b0665ad5fc7ec11bff6d119d64afb64c19636d6`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2751-L2766 `c4fb09012b544782852ec484cd704a2797ad6cdc869aed12442aa3313ec3e10c`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2767-L2779 `d51fd39f4ac6c596c95edecb0c5d3b27f2c7a4d702edec378faebc686c2639a9`
- [038 - Ledger Compile Addendum - pldg-20260630-001-feature-intake](038-ledger-compile-addendum-pldg-20260630-001-feature-intake.md) L2781-L2849 `a4f52d25809da750bb43e9336b25583bf176d50fbdb6ad2a2a433127365ba28b`
- [039 - Ledger Compile Addendum - pldg-20260624-001-provider-updates](039-ledger-compile-addendum-pldg-20260624-001-provider-updates.md) L2851-L3493 `7d3c148fc3855e1ae0829f13ef8fef526756e5d34d3954c94f0a7fd51e35e3f9`
- [040 - Shared actor-boundary, route payload, and blocked_notice packet](040-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3494-L3514 `9b03a20e8940d03a72bdb867429e4446cd9d5a95f627e26ded26852104fdf9df`
- [041 - Shared Conversational Actor Runtime Identity](041-shared-conversational-actor-runtime-identity.md) L3516-L3530 `6d3f9e032fccd587877ee282740f68d1f2e0bb31833498c4e735389daa607bd4`
- [042 - Chat Route, Permission, and History Behaviors](042-chat-route-permission-and-history-behaviors.md) L3532-L3546 `11be4f44d9e3bd147fb9a11bd2ebc115c7a34b4c2b139c54197a8590db63ea6e`
- [043 - Owner / Consumer Map](043-owner-consumer-map.md) L3548-L3552 `8f1f606d922353dc7699bb85f781678fe9b8c43fea61fdd1c5653a3f854f1cfd`
- [044 - PlanUnits](044-planunits.md) L3554-L3605 `96ec5012bd90ed3eaea2c9361c3fc26799c7e570c1a35355712aa95233efd1c8`
- [045 - Shared runtime projection addendum (2026-08-13)](045-shared-runtime-projection-addendum-2026-08-13.md) L3607-L22258 `7ca7f6117afcc971e3638803d77d34a0ed50befc4ef62b2564b31c14e9078bce`
- [046 - Migration Coverage](046-migration-coverage.md) L22260-L22290 `619afaba2c8bfb828f92f02442257bd7d0bd7c97083ebac99c82b4fcb18db427`
- [047 - Ledger Compile Addendum - pldg-20260614-001](047-ledger-compile-addendum-pldg-20260614-001.md) L22292-L22380 `ff7011efc6064467a259652b54ecdd27ca51b2cd242856ed100c42056ff342dd`
- [048 - Ledger Compile Addendum - pldg-20260615-001](048-ledger-compile-addendum-pldg-20260615-001.md) L22382-L22479 `f5353effa8348d4cc8db5bfb1fd12b75c31f63248f7eb6f127d0820f9bb96c52`
- [049 - Ledger Compile Addendum - pldg-20260616-001](049-ledger-compile-addendum-pldg-20260616-001.md) L22481-L22793 `2086ddcdd6f6da2c062d006ef33e66d0dc8e1e18f8b67374af91508b084de513`
- [050 - Ledger Compile Addendum - pldg-20260616-002](050-ledger-compile-addendum-pldg-20260616-002.md) L22795-L22862 `15bcbc87229635f254944b6ef8ba3ee8568d491472f2750a58114ad624b08cbd`
- [051 - Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard](051-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md) L22865-L22953 `34f4d3840739ca80a8bcab560aa85cffabd77835b1a40a6bb50657d7fa20eca8`
- [052 - Ledger Compile Addendum - pldg-20260622-001-fff](052-ledger-compile-addendum-pldg-20260622-001-fff.md) L22955-L23041 `a074ea0c826b833a14b19b9d9cf8b2ae8db120bf1404842bb73cb025f629241a`
- [053 - Ledger Compile Addendum - pldg-20260626-001-feature-name](053-ledger-compile-addendum-pldg-20260626-001-feature-name.md) L23044-L23420 `0e5c0518bcb8ef50c326e71b5f64eecd4ddfd182805de7c2c0a5a38047e4c324`
- [054 - Ledger Compile Addendum - pldg-20260627-001-feature-intake](054-ledger-compile-addendum-pldg-20260627-001-feature-intake.md) L23422-L23633 `6596eab89e3a672e26da7c81d4474dd80763cc0bdfced0a9eec472e8cf7090bb`
- [055 - Ledger Compile Addendum - pldg-20260701-001-feature-intake](055-ledger-compile-addendum-pldg-20260701-001-feature-intake.md) L23635-L23714 `77e83f530debf81004de3cdd7dd5a7389780c133d0624da90eb8e301c64c8f7c`
- [056 - Ledger Compile Addendum - pldg-20260703-001-feature-intake](056-ledger-compile-addendum-pldg-20260703-001-feature-intake.md) L23716-L23781 `a593cfa034541bc159bea139d49f6c25a9234af8e771579bebcbc5314b2f500b`
- [057 - FABLE Residual Chat Mechanics Cleanup Addendum - 2026-07-07](057-fable-residual-chat-mechanics-cleanup-addendum-2026-07-07.md) L23783-L23854 `9a6dbc490d93f7356a4f828e384f07d858ce98b28006e926ec8f5c119518b0f1`
- [058 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](058-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L23856-L23900 `742b246620ec043c8fb095b6ec4c852a7fca513ffaa4c3b99f7dcdced4f4e398`
- [059 - Usage GUI Propagation Addendum - 2026-07-09](059-usage-gui-propagation-addendum-2026-07-09.md) L23902-L23978 `caa370fae9fa344095625f2aecee84e10e182808b4d495ffa060aa53ec216df3`
- [060 - PMConcept6 Chat Polish Addendum - 2026-07-16](060-pmconcept6-chat-polish-addendum-2026-07-16.md) L23980-L24204 `bee306e4cd0c2ffa6b13f60a2af7f07281c4e1cf51fab622405aa112674bd841`
- [061 - Immutable conversation restore-point lifecycle - Known-37 completion](061-immutable-conversation-restore-point-lifecycle-known-37-completi.md) L24207-L24224 `215ef27f3eafedc53270ae5b106aeaacd541491e67ec22c3e86ea702683168a7`
- [062 - PMConcept7 Concept Promotion Addendum - 2026-07-23](062-pmconcept7-concept-promotion-addendum-2026-07-23.md) L24226-L24592 `e4782ee2e790088f4e424e52dc3d131c209eaecb3e92a7eb6ef8f4455286a0dc`
- [063 - PMConcept7 shared Assistant seating and context surfaces addendum - 2026-08-27](063-pmconcept7-shared-assistant-seating-and-context-surfaces-addendu.md) L24594-L24684 `8a018742eb2476a6d23962e4a1ebb2706fe053d7a7c9f2783ee0d851ea61824c`
- [064 - Additive Correction v4 — Consumed Assistant Behaviour (2026-09-03)](064-additive-correction-v4-consumed-assistant-behaviour-2026-09-03.md) L24686-L24734 `738a0456aa7ab77b62c0edea5626ef8fc7aaa0f7f06130084240e513579c8114`
- [065 - Working Notebook Surface Addendum (2026-09-05)](065-working-notebook-surface-addendum-2026-09-05.md) L24736-L24844 `1294a297837d2d841771d847509d1b3cf61858867ee399a61e11b653849a4c5d`
- [066 - Cumulative v3 Assistant Interaction & Surface Specification (2026-09-07)](066-cumulative-v3-assistant-interaction-surface-specification-2026-0.md) L24846-L25194 `63c74deb6ebf4baca94c099b25ed0ba0c26a76f59be8e21f30dc5bd9aa8c062c`
- [067 - Research decision packet review](067-research-decision-packet-review.md) L25198-L25293 `3bfd298bd20335873e8d6f9dbc458f2302a03298a39d9af495d95587bcbf7615`
- [068 - Context Lens Source and Preview Reconciliation — 2026-09-10](068-context-lens-source-and-preview-reconciliation-2026-09-10.md) L25295-L25359 `9745bc5f9b9820d267ed0c9d8733c3a7959e0d4fb9621012ed989fed3b87836f`
- [069 - Compaction completion Event Authority (DL-039 and DL-040)](069-compaction-completion-event-authority-dl-039-and-dl-040.md) L25361-L25414 `4094b10c5b6a4b4c37a4b8359b2be239f88f8ff8ed1243ef3fd2237bfd70aa5c`
- [070 - DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)](070-dl-042-historical-todo-event-migration-consumer-boundary-2026-09.md) L25417-L25464 `a8cac9d5aa5b433be53a6bb5c4c97b4d700d1c4b5ddb794d7eb38d74b58261a0`
- [071 - Restore-point created native and historical consumers](071-restore-point-created-native-and-historical-consumers.md) L25467-L25641 `47a04d3d76e1b54a3d08817e30dc16fea255c384afa9665a6eb6d67e827e13b7`
- [072 - Deleted restore-point passive history admission](072-deleted-restore-point-passive-history-admission.md) L25644-L25710 `b083a991e00ed0f4967d8a66188421c56d1aa41a2ace3913d2def280a13e1244`
- [073 - Expired restore-point passive history admission](073-expired-restore-point-passive-history-admission.md) L25713-L25782 `5c62abaa1acc0beeecde11ddfd82c054e4b363729e5c48da09c3eeb3183d8385`
- [074 - External Research Decision Packet Consumer Addendum (2026-09-17)](074-external-research-decision-packet-consumer-addendum-2026-09-17.md) L25784-L25834 `33d412da764051bce9f6a95d1155153612397c3fb99c0b9c764978ad17f331ae`
- [075 - Chat WOW Turn Presentation Addendum (2026-09-27)](075-chat-wow-turn-presentation-addendum-2026-09-27.md) L25836-L26382 `3b60d7750289e389e7e9ea4810bca79bcdff091ecc8c285d2d5e8c72576b256b`
- [076 - Wand Modules Redesign Addendum (2026-09-27)](076-wand-modules-redesign-addendum-2026-09-27.md) L26384-L27073 `ddcd7141f79707a215e74a03d48b451c8f23da2feba1f5a51acee121bcd64cac`
- [077 - Chat Tweaks Addendum (2026-10-08)](077-chat-tweaks-addendum-2026-10-08.md) L27075-L27147 `a99dc27c09af8fd05e55fddcddc7493ee847bf7eb8674dc9f0d26d03b7e1adbd`
