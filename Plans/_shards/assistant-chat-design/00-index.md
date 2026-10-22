# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-10-22T23:44:47Z

Source SHA256: `bc8b8db37af9d33c6726f2abdf60a9a8104471c190c39a1ebddcc9ebe2bf6340`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `a171b8daa04648b133603caf1bba4d226835a683a44dd80320b2a1bd57157504`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `ba8696abf43883109ab49fc5772e62837cbc772d3741bf03941c7ba1677ac751`
- [003 - Change Summary](003-change-summary.md) L14-L30 `a32a545893b9543265489a04fc131674dccc2ecaefb5f5f551a75655b4c24660`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L32-L47 `c4c4cbc3bcd112380cb61cae5a76e5fcc218754eac94ee74ba8fe35f8fe8ef46`
- [005 - Executive Summary](005-executive-summary.md) L48-L52 `9b61f2d67a892cebf1c903c500256ee6d37970c8d7ff019796ed730cfd2d8b5e`
- [006 - Table of Contents](006-table-of-contents.md) L54-L90 `e6176de46725d599af85f2eb68e641bba0977adc59f81946c5bddbae1be03baa`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L92-L207 `cb1db2d83a3e2166e3bd46e5288fb036191a1c6f7c43c263912bc6d14cd8cca6`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L209-L232 `fa3f0be60899cad9fee6ed3b45e22daeaa9fd34c67307562a17193f7ab465963`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L234-L240 `396df8d1f1bc1784a2e250a6c49a770f5ad3b0adcd563e00e75b2e6e37f5464e`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L242-L291 `b3f9988a17b5c90060971426cc548010fdf5f838a5b294f78f854c50dcab158b`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L292-L440 `b99322a0c1cf9f1f337a4c54b17252bca2dfd945fc3988cf87dcbbe62413fb6f`
- [012 - 6. Teach](012-6.-teach.md) L441-L483 `1a7f40f00ebacb33fc1b98382b199a431bf0acc7de225740dd6d9d46dad9a4c8`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L485-L671 `54fff62df505ad3ce36717cff332945ca23c81eb2c4b3f9cf6318fe518cbebf8`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L672-L964 `58f539cbcba233ccb0c0a0aea9f540686267dd5a6dbaab3865e4ad7af22cd3a2`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L966-L1008 `7255e30b3befba862d3d35ef889856d2b5c144ca08b165cffd65354c395acc2f`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L1010-L1080 `bfdd2dd469c74b0ef642f87f1a6b74620a01632490ef5efbe0be9829a604b991`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1081-L1258 `660e947fcb4851244c0b6c0bfa84d1b775c1fe35e4b1db623455e8b8e4e571a2`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1259-L1367 `fd019627e060b9532b03fad2a71bd143fe6ae66855fcd8cc5d2ba98643c8e1c3`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1368-L1785 `1a4be72a5fc1aae48f640647e0f4a1c6e44ddb84b0dc130cc2b2115d5c5c6e43`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1786-L1903 `13d91e7e0ed201cb615e2685b7c8b06723e81ca625e8a8b8bd79bf5775c40274`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1904-L1937 `735404fcbd18e9f6695cbdc99919db8d2c92c6b61ea08d4f6c9166e2e3db75a8`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1938-L1977 `42720f700b74721363a5142166035ed3e8bd3659474405eba46cf69688c25a2f`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1979-L2092 `b6cefc8e330c66bfc1bccd2a3a3ecf1d3b466aac74b45cd1966464c9ad81b63c`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L2093-L2104 `b84116495b29b5edeb75de84e1959a64c571ab9918b2f8751cd0c0999ee16e0d`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L2106-L2115 `b71c9e481635eb0df9cea2a4f6dd5ec0a2c2f7d1e7e61cd2fea27bd5ed9caaa0`
- [026 - 20. References](026-20.-references.md) L2117-L2146 `402e3972ca7d13b8c5a3fc90233ba5aebad66414ecac601e3035c59583cfe0f7`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2147-L2165 `40571214674c9cd992c03b8d1d7d45e1bc49fa539d83dc24db69fb6152ef8619`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2167-L2201 `e7c2cef8cc1c5f0eb0bca13198174f21c8f7f1901f1c32d544cb005feb32b75e`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2202-L2297 `3ae1403c8350112a9ebc5a47bb65ac208ed56d1614151ea4a13d2f6a00b8a1e9`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2299-L2352 `d81ef3267b5fc3421c71cdce6e0a9a3af80f05c584ff392614a3e693bfa9bacc`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2353-L2359 `9125eb8876de3d851c3ffd17a1e981a7de42f8cf207ae8e04eeb5737e893e0b0`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep)](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2360-L2462 `41655f38f6221acaf91562304e82425dc7564de9e639609f8293c2bb970e2612`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2463-L2599 `a81703976bf1a30f2613bb534848428ef01069910e6060c94d54168650d0a31d`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2601-L2646 `58f3e975d724dbe0045e6c4b8f8815f191d03a09a03f6b0ff0ffe07e73da4667`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2647-L2756 `9edda69c9d356265a7fdb09371f735d5cba243211df4aed17a5376a56f671fc8`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2758-L2773 `5ab5580ec61b224927f58080e113cf8f29ac76da6597d0954d44060b95255a0d`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2774-L2786 `4b8f0385947c64f4145d92d54427776fc4b5240fb0840d05da7ae67e9554d729`
- [038 - Ledger Compile Addendum - pldg-20260630-001-feature-intake](038-ledger-compile-addendum-pldg-20260630-001-feature-intake.md) L2788-L2856 `1d030ddbe4f68ca630fb974291862f9696c8e4b7dc8d02ccacb5683eb1dbe0db`
- [039 - Ledger Compile Addendum - pldg-20260624-001-provider-updates](039-ledger-compile-addendum-pldg-20260624-001-provider-updates.md) L2858-L3500 `43a788cd65f00a5afcab96c104ebd86208182d570d8925d7530de644016f904e`
- [040 - Shared actor-boundary, route payload, and blocked_notice packet](040-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3501-L3521 `f40ffcc9db794db9c9250412e36a0f9e1ead73163991b351c74836e8198bbdf0`
- [041 - Shared Conversational Actor Runtime Identity](041-shared-conversational-actor-runtime-identity.md) L3523-L3537 `532a07f34d6765e92779ab7d1bca5eeb37fb4f81701ef5ec33f4f64f8e1598c0`
- [042 - Chat Route, Permission, and History Behaviors](042-chat-route-permission-and-history-behaviors.md) L3539-L3553 `3db3e65524de6b71e391f14fc27f171826a4dddad0fe05726147bf8dc372ccd5`
- [043 - Owner / Consumer Map](043-owner-consumer-map.md) L3555-L3559 `2a1653f1505e556461ac4b99867cc499b22262018957b7431f417b2e637a60e5`
- [044 - PlanUnits](044-planunits.md) L3561-L3612 `12512a2bdf9c6391c6cc8f75180732abde7f8c895d232dd4dffe8b01b17e04a8`
- [045 - Shared runtime projection addendum (2026-08-13)](045-shared-runtime-projection-addendum-2026-08-13.md) L3614-L22417 `bbf9bf6efbe761e4c8bcf647ea3aef6455fa31f2e1aa2e8a25db12e41d0de4de`
- [046 - Migration Coverage](046-migration-coverage.md) L22419-L22449 `47797ca28d3d4e9495fba090f0d8512de26569fc3bf087ebaa8835e3786ead7d`
- [047 - Ledger Compile Addendum - pldg-20260614-001](047-ledger-compile-addendum-pldg-20260614-001.md) L22451-L22539 `03ab2d95cb379a9cb00f11d7626fc43e048faa263794baf06f3d7c7ab69a115c`
- [048 - Ledger Compile Addendum - pldg-20260615-001](048-ledger-compile-addendum-pldg-20260615-001.md) L22541-L22638 `154431c47dcd40b15693e64392306d1d2c301c83165c44564c3d59d47e9aebf9`
- [049 - Ledger Compile Addendum - pldg-20260616-001](049-ledger-compile-addendum-pldg-20260616-001.md) L22640-L22958 `bbbbf9db33be16d286a4caa7ab59aa6ad0f2f885318a3229e47a702fb455e9f7`
- [050 - Ledger Compile Addendum - pldg-20260616-002](050-ledger-compile-addendum-pldg-20260616-002.md) L22960-L23027 `79d5f04ec7e9075ab54cd35a74f577c8fd50f8c91194914bc094673b01db921a`
- [051 - Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard](051-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md) L23030-L23118 `52ff16ef931cb11742d68516f30ce754a90b5e520ee2730e90adcd9fc74bb7a6`
- [052 - Ledger Compile Addendum - pldg-20260622-001-fff](052-ledger-compile-addendum-pldg-20260622-001-fff.md) L23120-L23206 `455b75f95fbb9e656c278a1c774d730a2436f200f51c7ae7bcb711d036da798b`
- [053 - Ledger Compile Addendum - pldg-20260626-001-feature-name](053-ledger-compile-addendum-pldg-20260626-001-feature-name.md) L23209-L23585 `8e8647416e14e9aad2357b4fd140013359bc620720d39455bcc94c7bfc2fe2c7`
- [054 - Ledger Compile Addendum - pldg-20260627-001-feature-intake](054-ledger-compile-addendum-pldg-20260627-001-feature-intake.md) L23587-L23798 `031d596620c5d955a22403da9d5b6f0b5486d36f8eff935bee894dbe465521cb`
- [055 - Ledger Compile Addendum - pldg-20260701-001-feature-intake](055-ledger-compile-addendum-pldg-20260701-001-feature-intake.md) L23800-L23879 `e6b8658da2e8e2759ed5666036418d0f23f45fea177b62b4f24e476821d7110a`
- [056 - Ledger Compile Addendum - pldg-20260703-001-feature-intake](056-ledger-compile-addendum-pldg-20260703-001-feature-intake.md) L23881-L23946 `2d6fa64043587971008abf4e3fa612ae387e1cfc2b402ffb07ef28e78cd33847`
- [057 - FABLE Residual Chat Mechanics Cleanup Addendum - 2026-07-07](057-fable-residual-chat-mechanics-cleanup-addendum-2026-07-07.md) L23948-L24019 `fb0ca7c7777030582e6aba3376de7d886d935dee2b1c2b000a42b878258a6d1d`
- [058 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](058-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L24021-L24065 `3937331eff2ca6bcd3b6a078561d802bcbbfead0a845f1db6baa46570ee1f216`
- [059 - Usage GUI Propagation Addendum - 2026-07-09](059-usage-gui-propagation-addendum-2026-07-09.md) L24067-L24143 `4f56bd5caa28fc627307d8bf86be1c06fffa639e20d226bd70c6d2ec21918e39`
- [060 - PMConcept6 Chat Polish Addendum - 2026-07-16](060-pmconcept6-chat-polish-addendum-2026-07-16.md) L24145-L24377 `bfda2ba82cd1e80287e70e9e868be8369ad9251a25beca8e73d3aabccaf12262`
- [061 - Immutable conversation restore-point lifecycle - Known-37 completion](061-immutable-conversation-restore-point-lifecycle-known-37-completi.md) L24380-L24397 `746064b55bb93175ba6eb4d9a1c3a64557b273fbdadc87a14cacfd5983dcb12c`
- [062 - PMConcept7 Concept Promotion Addendum - 2026-07-23](062-pmconcept7-concept-promotion-addendum-2026-07-23.md) L24399-L24783 `f08a98f27688f6c05dd1ccf7db18d3d765b0ef5708e1f69e718d1325299e13e4`
- [063 - PMConcept7 shared Assistant seating and context surfaces addendum - 2026-08-27](063-pmconcept7-shared-assistant-seating-and-context-surfaces-addendu.md) L24785-L24887 `8249ca3123de0c4fcde4d10a140f605e1eb9ec7d90e8d1b7ce3c99533a254585`
- [064 - Additive Correction v4 — Consumed Assistant Behaviour (2026-09-03)](064-additive-correction-v4-consumed-assistant-behaviour-2026-09-03.md) L24889-L24937 `9b4af093a715b76a55392561e2ce627737d91c082ccd3340c42ed997b646c220`
- [065 - Working Notebook Surface Addendum (2026-09-05)](065-working-notebook-surface-addendum-2026-09-05.md) L24939-L25047 `2c9082974545139ce694cbd06781401ebdfd3edb66ff53ada875a5b101b288ff`
- [066 - Cumulative v3 Assistant Interaction & Surface Specification (2026-09-07)](066-cumulative-v3-assistant-interaction-surface-specification-2026-0.md) L25049-L25418 `2f9325948a01058a4ba84f3e261fcdaceef96ec73c4211c2582b0ab3124fea06`
- [067 - Research decision packet review](067-research-decision-packet-review.md) L25422-L25517 `81ae9df87467c909ac0d0ce82398536d3701fa182edf1a152fc5add388c4a3e5`
- [068 - Context Lens Source and Preview Reconciliation — 2026-09-10](068-context-lens-source-and-preview-reconciliation-2026-09-10.md) L25519-L25583 `b96b0b8853c44fb2faf723cc422e3e17ff9851f9d5e653069d39d6e28405b653`
- [069 - Compaction completion Event Authority (DL-039 and DL-040)](069-compaction-completion-event-authority-dl-039-and-dl-040.md) L25585-L25638 `8d37dd023c7511cffaa6dc35048874d56742df680e6ab3adfa581742474507f5`
- [070 - DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)](070-dl-042-historical-todo-event-migration-consumer-boundary-2026-09.md) L25641-L25688 `3a98a9ef33328251be94e7b3d858171cde059e1826045087c7b23d3d5a2deb84`
- [071 - Restore-point created native and historical consumers](071-restore-point-created-native-and-historical-consumers.md) L25691-L25865 `c9fbab91e6cb6ab0178a34ea7d4407590513285d4f5a759b1b3c1eadf76b7d3f`
- [072 - Deleted restore-point passive history admission](072-deleted-restore-point-passive-history-admission.md) L25868-L25934 `d291caff0150e0a591724ead2e5c565bac723b38931addf18ff7562bd13597d0`
- [073 - Expired restore-point passive history admission](073-expired-restore-point-passive-history-admission.md) L25937-L26006 `5bff88ca66aafcf8f0ece943643dfe439c6c17899b51777a19b5d2c993bff15f`
- [074 - External Research Decision Packet Consumer Addendum (2026-09-17)](074-external-research-decision-packet-consumer-addendum-2026-09-17.md) L26008-L26058 `5ecae20768f2525e17451a0f052f35c9c9b580d6c10788271d740e45fcf4f3ab`
- [075 - Chat WOW Turn Presentation Addendum (2026-09-27)](075-chat-wow-turn-presentation-addendum-2026-09-27.md) L26060-L26712 `1c1c120ae60141346c8c2cd17e95c33c5620666541cd70567a2bef9e6d7b2eb9`
- [076 - Wand Modules Redesign Addendum (2026-09-27)](076-wand-modules-redesign-addendum-2026-09-27.md) L26714-L27426 `0b77e67d13e96b5c76b6adf8170034ba0832fa188a4f2a37fa5c50f81efd9d06`
- [077 - Chat Tweaks Addendum (2026-10-08)](077-chat-tweaks-addendum-2026-10-08.md) L27428-L27504 `6ea80d130fc6cc525328e9ab959139b52f715c6cf36bc682d98e2129567c33c5`
- [078 - DL-180, DL-181 and DL-185 — What The Chat Opens, Its Column, Its Command Card And The Port (2026-10-09)](078-dl-180-dl-181-and-dl-185-what-the-chat-opens-its-column-its-comm.md) L27506-L27933 `fee4de450f30cb53e39e43cdb33948357bc6a8b071fc27dd488065c3a9ee3261`
- [079 - Grill Me rounds and agreement — DL-218](079-grill-me-rounds-and-agreement-dl-218.md) L27935-L28147 `d3da1f875355c31955072bab023e3deb595eed53604bfec53cb287ebc0c9e4a5`
