# Step 8: owner precedence and verification boundaries

Review base: `4869b4cbaaa9e5452a1b16b68ce92b9f269df738`. Authority: `Plans/Decision_Log.md` DL-039 and the ten-step instruction. This report records root adjudication of evidence; it changes no product contract, registry admission, historical receipt, or validator.

## Goal contracts

The current Goal V2 owner explicitly retires phases, tranches, child Goals, Goal budgets, and mandatory Goal-specific review roles. This is settled canonical behavior, not a new question for Jared. The Step 7 schema-authority promotion explicitly preserves those boundaries.

The older 21-row event matrix remains useful as exact schema and historical-contract evidence. It cannot establish current write compatibility when it requires retired behavior. The following conflicts must remain visible in the fresh depth assessment:

| Evidence under review | Controlling current owner evidence | Adjudication |
| --- | --- | --- |
| Common `parent_goal_id`, mandatory `execution_role`, and the old Goal lifecycle (`Plans/Goal_Runtime_System.md:3420`, `:3424`, `:3453`) | Minimal Goal record, four-state lifecycle, and retired structures (`:65`, `:95`, `:235`) | A structurally defined older field or enum is not proof that current Goal V2 may write it. Evaluate each row's actual required and optional fields; distinguish retained historical evidence from current compatibility. |
| `goal.child_status_changed` and its child identity/transition (`:3615`) | Explicit prohibition of `goal.child_*` events (`:279`) | No new active child-Goal behavior may be admitted. Existing registered membership and retained history are separate facts; this review does not delete either. |
| `goal.created` full objective, separate criteria/scope/constraints, budget and model policy (`:3629`) | Text-only Goal creation creates no budget or child Goal (`:255`); event audit uses a hash and revision reference when sufficient (`:277`) | Do not claim the older required payload is compatible with the current creation contract. Schema authority alone cannot resolve this conflict. |
| `goal.updated` required child sets and optional budget/scope deltas (`:3692`) | Only direct user edits and explicitly approved agent replacement may update the objective (`:167`); retired structures remain forbidden (`:235`) | Preserve revision/CAS evidence where compatible; the older child/budget requirements do not establish current write depth. |
| `goal.completed` mandatory certification and `verifying` transition (`:3622`) | Host continuation closes on completion evidence supplied by the owning caller (`:125`); Goal has four states (`:95`) and no mandatory role cast (`:243`) | Workflow-owned completion evidence remains required. A mandatory Goal-specific certification lifecycle cannot be restored by citing the older matrix. |

The fresh matrix must label these conflicts explicitly. It must not resolve them by inventing identities, silently withdrawing registered families, or asking Jared to reapprove already retired structures. Missing consumer, projector, checkpoint or retention policy choices remain distinct from these settled precedence decisions.

## Queue naming cases

- `chat.thread.created`: the exact dotted spelling appears in an explicitly marked example (`Plans/Wiring_Matrix.md:76`), whereas the durable owner contract uses `chat.thread_created` (`Plans/Contracts_V0.md:975`, `Plans/storage-plan.md:1597`). The naming-conflict rule (`Plans/Commands_System.md:277`) does not itself register an alias. Classify the dotted example as unsupported for persisted-family admission; do not invent an alias relationship.
- `settings.agent_rules.dry_method_default_guard.updated`: UCC-104 (`Plans/UI_Command_Catalog.md:7624`) and WM-040 (`Plans/Wiring_Matrix.md:3720`) name the dedicated event, while the production row uses `settings.updated` (`Plans/Wiring_Matrix.production.json:55477`). The newer Settings contract permits exactly five canonical Settings commands and uses the generic transaction boundary (`Plans/Settings_System.md:785`, `Plans/UI_Wiring_Rules.md:895`). Retain the event-identity conflict; do not treat an older per-setting command as current dispatch evidence. The DRY setting and its provenance storage are already required by SP-223 (`Plans/storage-plan.md:15938`), so any card asks about event reconciliation, not whether the setting should persist or whether to restore a per-setting command.
- `chat.plan_todo_updated`: the durable minimal mutation payload is explicit (`Plans/Contracts_V0.md:1470`, `Plans/storage-plan.md:1773`). The current To-Do owner requires seven `todo.*` semantic names (`Plans/ToDo_Runtime.md:605`) but supplies no exact alias from the older name. Preserve both facts and request the missing transition/migration mapping. Do not silently choose `todo.updated`, reopen retired fields, or weaken per-item receipts and proposal-only model authority.

## Representation and frozen checks

The registry family schema disallows unknown fields and has no producer, consumer/checkpoint, transition, replay or oracle properties (`Plans/event_family_registry.schema.json`, `$defs.family`). That limits the present registry representation; it does not by itself create a product decision. Exact normative owner evidence, structured registry evidence, listed-only references and absent evidence must be reported separately. A larger registry object must not be fabricated merely to increase a PASS count.

Two existing checks also constrain later re-certification:

- `scripts/pm-event-authority-currentness.py:383` generates historical depth counts and zero fresh depth rows. Its read-only check at `:517` requires `INCOMPLETE` with zero fresh rows. Fresh Step 8 assessments therefore belong in separate result artifacts; hand-editing the retained currentness status cannot honestly refresh this custody checkpoint.
- The frozen independent validator at `Plans/.audits/event-authority-2026-08-12/independent-validator/pm_event_authority_independent_validator.py:433` requires the live set beyond Known37 to equal exactly the two August families. As already recorded in Step 6, a legitimate fortieth family would fail `unexpected_august_set`. No validator exception or modification is authorized by this report.

These findings do not revoke DL-039's conditional seal approval. They identify prerequisites and verification limitations that must be reported honestly. No seal, closure hash restamp, or validator edit follows from this review.

## Source pins

| Source at review base | SHA-256 |
| --- | --- |
| `Plans/Goal_Runtime_System.md` | `b8a2a5abb2332037d65697115619d0469241d076bb04c38a99d7b7223db1a4aa` |
| `Plans/event_family_registry.schema.json` | `c4afe062bcd097180cc948cc52998b77926b195d197ebea779e4ff992c89d072` |
| `scripts/pm-event-authority-currentness.py` | `89ffee0b5749d98f2372674feb81677e509fbcb51296ab5fb1c630d32e6e9de9` |
| `Plans/.audits/event-authority-2026-08-12/independent-validator/pm_event_authority_independent_validator.py` | `bd54afffc689146753daec474d6cdbc7ac663afaf21d842aad4fcf10255112d5` |
| `Plans/Wiring_Matrix.md` | `cf2670dc74a8f798dfa913c8604634c8acd11520975d90c836bf68edb2493013` |
| `Plans/Commands_System.md` | `4db908950fd355b040ad67c3e4730fd479bad8eb70cc34ed4b05c52e821d08b4` |
| `Plans/UI_Command_Catalog.md` | `46e57138eeec16db54907afcf615a2a2512fa935f6d8a3e47e3be44519ff23c1` |
| `Plans/Wiring_Matrix.production.json` | `9332dac75325902c3fdd22043b9017413cde7c20d2963524dd57ed02565e1315` |
| `Plans/Settings_System.md` | `a14860a96110f33b65bd5d9468979032788fe03ab7c861d50017f74f93c6937e` |
| `Plans/UI_Wiring_Rules.md` | `d986040d92b297ae8682fa6569fd2cc6c25faa26497c785130c4b3e475fb195d` |
| `Plans/ToDo_Runtime.md` | `bac4d5a7012a0928a155b4126950a171eb4180a5d5e6dbbae6475ed3c0e5c6a9` |
| `Plans/storage-plan.md` | `2478a1aabda7f3fa3c39de5b3fab2e94fcf5c633c60b00645849b76098ac4ac6` |
| `Plans/Contracts_V0.md` | `9f6fcbd34976838f699d26ebbedd3869dcef019318b6ac4b51076ec442fe21ea` |

Cost: root source review; token and dollar breakdown unavailable.
