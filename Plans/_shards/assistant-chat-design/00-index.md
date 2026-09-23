# Shard Index: Plans/assistant-chat-design.md

Generated: 2026-09-23T17:06:00Z

Source SHA256: `8b1cfe27bc861b853c0ed88c516e1c48a955074f926bcebded388e88f1a31e45`

Manifest: [`manifest.json`](manifest.json)

## Shards

- [001 - Preamble](001-preamble.md) L1-L1 `c59d3d9bbcdc45b0af4a58b146d52e676496e46f8d7de7f6ae8519e80e201b9d`
- [002 - Canonical owner-section requirements](002-canonical-owner-section-requirements.md) L4-L12 `cd2b1fa3d14c5f6bff4be7aa9b5a91e5d355afbfa088abcc20d9f9623ad97fda`
- [003 - Change Summary](003-change-summary.md) L14-L30 `555299ef37ec037e6ace0a3b490fe206e3434f1c585c1113f42163e8b566dd5b`
- [004 - Rewrite alignment (2026-02-21)](004-rewrite-alignment-2026-02-21.md) L32-L47 `e6d1d79a2739a886e83e564f81d3cc132c646473c5bf323384a310dc56aefc73`
- [005 - Executive Summary](005-executive-summary.md) L48-L52 `5b6ea33f91c5ed0395cbfed5b7f9821ce11ad2c43ce6ce8ea79328b34f39a9be`
- [006 - Table of Contents](006-table-of-contents.md) L54-L90 `f2ba2c806c22a6dacc699ac38d006f51bd471cc1af82a5cbaf2289eead9dde1f`
- [007 - 1. Modes Overview](007-1.-modes-overview.md) L92-L207 `226b34beffe03c7738910c3052a8209f34e58cc1ea48c09991836d9893619d5d`
- [008 - 2. ELI5 Mode](008-2.-eli5-mode.md) L209-L231 `a2490c0764cb58c9c30115054e4261055d4025ae1e166628d6f9af7fe54d3fbf`
- [009 - 3. Permissions: YOLO vs Regular](009-3.-permissions-yolo-vs-regular.md) L233-L239 `6915efb4f9b798cb23fdcb706644ccc24498ef3955a60ed81463f96cb6336e16`
- [010 - 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop](010-4.-message-submission-steer-vs-queue-queued-editing-interrupt-an.md) L241-L289 `275e534fa3dcbecd6fc222e647dc88c08be8c27313ae7142fd1ea46bd69a83e4`
- [011 - 5. Commands (slash commands and custom commands)](011-5.-commands-slash-commands-and-custom-commands.md) L290-L438 `2aacf4a085d10c9b0fb292a0a5692c3e1ae3b90c5ea8f52ea821f597c5627ca0`
- [012 - 6. Teach](012-6.-teach.md) L439-L477 `0782301d8e2137c285eeb00dd900db763c015a5d469d493e96b575455ea117b2`
- [013 - 7. Attachments, Web Search, and Extensibility](013-7.-attachments-web-search-and-extensibility.md) L479-L664 `357b54ffc3f314ca7217041c81025d44e19abac76905aee75d01277d173a2833`
- [014 - 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)](014-8.-plan-mode-deep-plan-mode-and-plan-thoroughness-pt.md) L665-L957 `fc7748c935d078b7417efa912d0b03582a4aae3137a593468186a55b292a9911`
- [015 - 9. File Manager, IDE-style editor, and @ Mention](015-9.-file-manager-ide-style-editor-and-mention.md) L959-L1000 `2984a1e4918e851e63bffd36f242e327bcf45f1ee262a06e359d892e42e65d42`
- [016 - 10. Chat History Search](016-10.-chat-history-search.md) L1002-L1072 `7a5470e7eb403b5b41b5e4622e2845e4e983a3bf487e053385a1d3d41aae0e74`
- [017 - 11. Threads and chat management](017-11.-threads-and-chat-management.md) L1073-L1250 `cd6fe5df42a99528e7f67520d4e7221a2e74f984cc3a501fe78e9c845a92ec99`
- [018 - 12. Context usage display](018-12.-context-usage-display.md) L1251-L1359 `c7c561c1b102712de847f8d397095c106e3c8ea6b50985de10713e76924689f8`
- [019 - 13. Activity transparency: search, bash, and file activity](019-13.-activity-transparency-search-bash-and-file-activity.md) L1360-L1775 `a9e82df6f42d15d7e5fcd57d63c96f66700fc206de1f6a99cce77c6ecf529d80`
- [020 - 14. Subagents & Crew](020-14.-subagents-crew.md) L1776-L1893 `d7712fe4e54c4c001d9e5e54bb53537ab0df8e0e8414d359891f8cd20f7a547d`
- [021 - 15. Plan Mode + Crew Mode](021-15.-plan-mode-crew-mode.md) L1894-L1927 `b7244e54bc7eba45d811f40beecb1978a0e4121159875708c09a5c8f008bddc1`
- [022 - 16. Interview Phase UX (Chat Surface)](022-16.-interview-phase-ux-chat-surface.md) L1928-L1967 `7b1f0c621262fd561b89d8a9ddb03ec512fa5d489bb0258989769dd81a68b2d1`
- [023 - 17. Context & Truncation](023-17.-context-truncation.md) L1969-L2082 `396dacaf078d88edd76e9e70dabe1bedcb613f491ceb3ed2b7bc6742ba4d77fc`
- [024 - 18. BrainStorm Mode](024-18.-brainstorm-mode.md) L2083-L2094 `5f5d16e15bc8120fb52251f4ba86667b0421c266273ba0370aba91374b0e8610`
- [025 - 19. Documentation Audience (AI Overseer)](025-19.-documentation-audience-ai-overseer.md) L2096-L2105 `7822c5f5cd48f83750d8693b9c4650eec8155b0bed08abb67efea37d8f38cc2a`
- [026 - 20. References](026-20.-references.md) L2107-L2136 `d067057b099bceb7c2ee67f53fd1da2c5f667421008604557297bc3413960ddb`
- [027 - 21. Dashboard Warnings and Calls to Action](027-21.-dashboard-warnings-and-calls-to-action.md) L2137-L2155 `fcda1b21160b2cb3da9d44908646e7919c0de4f2365da34064c867f0ee414a10`
- [028 - 22. Live Testing Tools and Hot Reload](028-22.-live-testing-tools-and-hot-reload.md) L2157-L2188 `d6da3dce66be32d4f1fda35a20d775dc6f9400e2ebfea845b20221c54836662d`
- [029 - 23. Gaps, Competitive Comparison, and Enhancements](029-23.-gaps-competitive-comparison-and-enhancements.md) L2189-L2284 `8422850a56b84cb3c19e0385c344cae233bffc7fef7a96cf2035474439e4b039`
- [030 - 24. Chat thread performance, virtualization, and flicker avoidance](030-24.-chat-thread-performance-virtualization-and-flicker-avoidance.md) L2286-L2339 `10e2b2095a5d627e1bdcc8b961d53a24426f03ca0728357923f41c34e539ba50`
- [031 - 25. Context Circle Enhancements (Addendum -- 2026-02-23)](031-25.-context-circle-enhancements-addendum-2026-02-23.md) L2340-L2346 `f2ac61030d82aa48026af324ceb32ea530647ae1933bde59f7e6d47ec8bf6137`
- [032 - 26. Auditor Audit-To-Repair Loop Model/Provider Settings (Invariant Sweep)](032-26.-auditor-audit-to-repair-loop-model-provider-settings-invaria.md) L2347-L2449 `a7f00f135ff103d84a728fbaa673cabda62d5d1af72f341d30708ff9f937c625`
- [033 - 27. Persona Control in Assistant Chat (2026-03-06)](033-27.-persona-control-in-assistant-chat-2026-03-06.md) L2450-L2586 `f25738a0ed229d7cba7e73bb5f17296a2e03c214a80c81dfade4dc97d5a2afde`
- [034 - 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)](034-28.-markdown-and-mermaid-rendering-in-chat-and-planning-surfaces.md) L2588-L2631 `d1e1418b30c46e34fa980bfb74cdeeaf3093d40d406dd4c4c2954dae61607b70`
- [035 - 29. Natural-language Mode Invocation and Wizard Escalation (2026-03-08)](035-29.-natural-language-mode-invocation-and-wizard-escalation-2026-.md) L2632-L2741 `842ff1c51f1a02a1f4cf58e7dffbb9a2c043385586b0da40e3ab434d17e54458`
- [036 - Unified Thread Blocked-State Lifecycle](036-unified-thread-blocked-state-lifecycle.md) L2743-L2758 `fd5a9c944cc7b6d955b64d540bfd18a55cfdca0f4cb18a7161e582045df6570f`
- [037 - Worktrees in Assistant](037-worktrees-in-assistant.md) L2759-L2771 `7a045ea1967fb20579c272439942af390d337254e98d5f8a283faa4ed57345a2`
- [038 - Ledger Compile Addendum - pldg-20260630-001-feature-intake](038-ledger-compile-addendum-pldg-20260630-001-feature-intake.md) L2773-L2841 `842b41e499a5352c3add1596b5407d62195d375b0c95400c4ae3163731fd4e59`
- [039 - Ledger Compile Addendum - pldg-20260624-001-provider-updates](039-ledger-compile-addendum-pldg-20260624-001-provider-updates.md) L2843-L3485 `db9bc0237c555a0f33735609ebdbc20896e52ad55e5c33b3e345ce5ae806c1f1`
- [040 - Shared actor-boundary, route payload, and blocked_notice packet](040-shared-actor-boundary-route-payload-and-blocked_notice-packet.md) L3486-L3506 `60696f299bcc091adb129e689433a61447476865aa478d6d5acbaf50c1a7bedd`
- [041 - Shared Conversational Actor Runtime Identity](041-shared-conversational-actor-runtime-identity.md) L3508-L3522 `26b13602e3ec855733534383418ab7cd2ae15d60b97fc5fcf0a98d211f6738df`
- [042 - Chat Route, Permission, and History Behaviors](042-chat-route-permission-and-history-behaviors.md) L3524-L3538 `c19e0d5efd38add9c8bf129ebe8961e4b1e1adbfa1e7b7234e8923d6af6cdbf0`
- [043 - Owner / Consumer Map](043-owner-consumer-map.md) L3540-L3544 `88d1c1ea4f3b88ebb62994f0b48dad3bc27f23f4e0f2cc41bc857a48ecc2c50b`
- [044 - PlanUnits](044-planunits.md) L3546-L3597 `694ab336821432558ddad82de2410fe0271240a85508cc2b6cc036e5f894ed59`
- [045 - Shared runtime projection addendum (2026-08-13)](045-shared-runtime-projection-addendum-2026-08-13.md) L3599-L22234 `02e558e28427e111da3f2b28fae4a15ea7c3652d7406d67a07b480e72eb9fcd4`
- [046 - Migration Coverage](046-migration-coverage.md) L22236-L22266 `63346fbe69724a48fce23b1fc31fd0e994c6607ee53979aa6860980ed10eef9a`
- [047 - Ledger Compile Addendum - pldg-20260614-001](047-ledger-compile-addendum-pldg-20260614-001.md) L22268-L22356 `fa44db7562ada9c15b952bdb6ef230281bd6aba231ced80342b19df624cc6e3f`
- [048 - Ledger Compile Addendum - pldg-20260615-001](048-ledger-compile-addendum-pldg-20260615-001.md) L22358-L22455 `4590bd94596a62fecf352c59e358f95d7eeb7bf6fec0daa85432c895cf1d3217`
- [049 - Ledger Compile Addendum - pldg-20260616-001](049-ledger-compile-addendum-pldg-20260616-001.md) L22457-L22769 `c98859dd055a38715f9ac58dcf66dc55853931da1ad9354e56a479e397ec651c`
- [050 - Ledger Compile Addendum - pldg-20260616-002](050-ledger-compile-addendum-pldg-20260616-002.md) L22771-L22838 `e0345de3815e30c31a73c2f4f114fb74e3a69e948ce13e08ecce0d8eb4e5787c`
- [051 - Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard](051-ledger-compile-addendum-pldg-20260618-001-prd-planning-wizard.md) L22841-L22929 `ea171710c15767b8abe043022026faccec112ab97ef5967f8a985b00a8f4b178`
- [052 - Ledger Compile Addendum - pldg-20260622-001-fff](052-ledger-compile-addendum-pldg-20260622-001-fff.md) L22931-L23017 `992b71b35f34f3d3af1dbfe49bf114eb6e464e561c3c224ea552e163908e75fe`
- [053 - Ledger Compile Addendum - pldg-20260626-001-feature-name](053-ledger-compile-addendum-pldg-20260626-001-feature-name.md) L23020-L23394 `8ef94e56d899601c98a391df346477969f3e811793d2635058b10ff81f09626b`
- [054 - Ledger Compile Addendum - pldg-20260627-001-feature-intake](054-ledger-compile-addendum-pldg-20260627-001-feature-intake.md) L23396-L23607 `c1b6fe5a89d67d9cd7e139c324e840315bd25a8c6267b67a626122cd1271d753`
- [055 - Ledger Compile Addendum - pldg-20260701-001-feature-intake](055-ledger-compile-addendum-pldg-20260701-001-feature-intake.md) L23609-L23688 `0d41c8d2c1613221ffe7e893013c9c2d5d6393e0a048b9f8188bc8943077ab54`
- [056 - Ledger Compile Addendum - pldg-20260703-001-feature-intake](056-ledger-compile-addendum-pldg-20260703-001-feature-intake.md) L23690-L23755 `99fda8c5a773be24f761d5e72e44b9653dc90f8c62dfe7d89f7afc3322e69da4`
- [057 - FABLE Residual Chat Mechanics Cleanup Addendum - 2026-07-07](057-fable-residual-chat-mechanics-cleanup-addendum-2026-07-07.md) L23757-L23828 `b6db7062d3babd9f509543bec14988b04495811bc6993e505fc3438581e043ce`
- [058 - FABLE Deferred Action Concrete Repair Addendum - 2026-07-08](058-fable-deferred-action-concrete-repair-addendum-2026-07-08.md) L23830-L23874 `2cf6c1eda1e50c117c3d4f97f9b0519a594708d3e936529684806480158482c9`
- [059 - Usage GUI Propagation Addendum - 2026-07-09](059-usage-gui-propagation-addendum-2026-07-09.md) L23876-L23952 `9cc2a8e14027e479f27cc9ef85536718d200f56ef73759ccaf2b920ca5505c7d`
- [060 - PMConcept6 Chat Polish Addendum - 2026-07-16](060-pmconcept6-chat-polish-addendum-2026-07-16.md) L23954-L24173 `28716b52a1f3b98f94b999f499dc32ecd6739fc52ac8fb34d18a3a13d92cbe12`
- [061 - Immutable conversation restore-point lifecycle - Known-37 completion](061-immutable-conversation-restore-point-lifecycle-known-37-completi.md) L24176-L24193 `8c59772a83c12263ccc0b16c2909c12fd77768400dd4083adbb7070893627d61`
- [062 - PMConcept7 Concept Promotion Addendum - 2026-07-23](062-pmconcept7-concept-promotion-addendum-2026-07-23.md) L24195-L24561 `7adb7ba495b09e434c316ca81b2d043d19fb8912d16b9bb8d46506d60f5ecec0`
- [063 - PMConcept7 shared Assistant seating and context surfaces addendum - 2026-08-27](063-pmconcept7-shared-assistant-seating-and-context-surfaces-addendu.md) L24563-L24653 `bde99e16974b3b7a1a4a0572ea62f82ecc29f94b771a681d24aa25d69409b3f0`
- [064 - Additive Correction v4 — Consumed Assistant Behaviour (2026-09-03)](064-additive-correction-v4-consumed-assistant-behaviour-2026-09-03.md) L24655-L24692 `092911937a90d4b10f906eff351a5ffa4f1d0a1de2778812352d9728199d3be8`
- [065 - Working Notebook Surface Addendum (2026-09-05)](065-working-notebook-surface-addendum-2026-09-05.md) L24694-L24802 `fd322bb15ed3df30cf17a79b6713bff9105d98dd8857335b95f00de8dfaf5ca8`
- [066 - Cumulative v3 Assistant Interaction & Surface Specification (2026-09-07)](066-cumulative-v3-assistant-interaction-surface-specification-2026-0.md) L24804-L25152 `673844878fafa83d9ebecebace6808002384db3e3ea19ce01a227e0300ec2f40`
- [067 - Research decision packet review](067-research-decision-packet-review.md) L25156-L25251 `c3064fc3807ba126ecd44ab975548d3785144f4d4963a9538519bcbd0022c0f9`
- [068 - Context Lens Source and Preview Reconciliation — 2026-09-10](068-context-lens-source-and-preview-reconciliation-2026-09-10.md) L25253-L25317 `1e6a10f7f42e446b4dd185952ea6c946f3c8cc97a81376d1ca59a511a7e2c1af`
- [069 - Compaction completion Event Authority (DL-039 and DL-040)](069-compaction-completion-event-authority-dl-039-and-dl-040.md) L25319-L25372 `dc0cb7e53fefaa62763e16d1cd8ef7ff7464187090dd3f93e782be9eb2d86516`
- [070 - DL-042 — Historical TODO Event Migration Consumer Boundary (2026-09-11)](070-dl-042-historical-todo-event-migration-consumer-boundary-2026-09.md) L25375-L25416 `2ca0e3d763ed858122e6b3481bc7b3b16377e68d59f6bd2f97203592b8ea976a`
- [071 - Restore-point created native and historical consumers](071-restore-point-created-native-and-historical-consumers.md) L25419-L25593 `19f26fc2e2387e17ae5eaf8a6b74f1302147796c8dbde760518c2904a468de61`
- [072 - Deleted restore-point passive history admission](072-deleted-restore-point-passive-history-admission.md) L25596-L25662 `08cbbcbbf3b9e12b9901be75c51db50aa6bde585f3555434298f2e23cf2e95e0`
- [073 - Expired restore-point passive history admission](073-expired-restore-point-passive-history-admission.md) L25665-L25734 `5657af5c4b6d4c5eb1b6a7d1c564c37524b3688d623832fd8c490b88d6518be2`
- [074 - External Research Decision Packet Consumer Addendum (2026-09-17)](074-external-research-decision-packet-consumer-addendum-2026-09-17.md) L25736-L25786 `0a701938273d1f81c7d032e1ce2c49ce63a9ef2091d4fde4fca859d75af1c8d6`
