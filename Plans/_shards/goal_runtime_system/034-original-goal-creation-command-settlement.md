# Shard 034: Original Goal creation command settlement

Source: `Plans/Goal_Runtime_System.md`

Source lines: L6086-L6098

Source SHA256: `efe049a451e77214ffbd3766ada3654d767328b13661ae0b00b1041e8deb082a`

---

## Original Goal creation command settlement

The existing `cmd.chat.goal.start` operation uses CV-341's exact `GoalStartRequestV2` and `GoalStartResultV2`, SIR-048's original source and SP-294's joined body/command custody. Original user creation authority, accepted source surfaces and exact objective text retain their existing Goal owner rules. Neither normalized request shape, matching digest, public registration, acknowledged dispatch nor an isolated body receipt establishes the complete creation result.

The actual original Goal builder commits revision 1 and its original SP-287 receipt once. Pending publication continues that same accepted body, original source, original event and first receipt. The source/event/result chain is acyclic: original body transaction, original shared event/first receipt, then actual immutable SIR/result settlement. It creates no durable pre-body objective copy or Goal reservation and never asks an event to contain its own future first receipt.

A successful command result proves the accepted original body revision, original `goal.created` EventRecord/first AppendReceipt, and actual terminal command outcome/result. It proves creation, not objective completion or workflow certification. Original first continuation is eligible only after that successful creation result has actually settled and all existing current Goal state, thread/run, permission, availability and Stop rules also allow it. Stop wins at the final original dispatch boundary. No fifth Goal state, invented blocked reason, automatic Goal resume or inferred scheduler/host permission follows from pending or terminal unknown custody.

Rejection or proven no-effect before original body admission writes no body/revision. After a valid joined body commit, a later unresolved or refused event/result operation preserves the already accepted original revision and pending custody, emits no success-shaped receipt, and creates no additional revision. Genuine earlier effects are not rolled back. An immutable original terminal no-effect or unknown result cannot be retried into a successful creation under its original command identity.

The active `goal.created` v3 payload preserves content-free revision/currentness/body-receipt/source references; the exact prior whole-v2 decoder retains historical interpretation without reviving retired structured objectives, budgets or child Goals. This start prerequisite does not materialize current event traversal, a durable projector/checkpoint, `goal.updated`, other Goal commands/events, or product runtime eligibility. Existing command controls remain subject to their full central-registration/wiring/readiness requirements.

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-064, ContractName:Plans/Contracts_V0.md#CV-341, ContractName:Plans/storage-plan.md#SP-294, ContractName:Plans/Shared_Integration_Runtime.md#SIR-048, ContractName:Plans/Decision_Log.md#DL-047
