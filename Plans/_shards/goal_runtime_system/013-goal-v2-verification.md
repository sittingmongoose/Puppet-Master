# Shard 013: Goal V2 verification

Source: `Plans/Goal_Runtime_System.md`

Source lines: L298-L308

Source SHA256: `905e3f1889eb2f6aaf3583d278b9d49b80cc69be4f01fecefbcbda7f3887d429`

---

## Goal V2 verification

Structural tests validate the V2 schema and fixtures, the absence of every retired field, revision monotonicity, compare-and-swap rejection of a stale `currentness_hash`, the two-value `change_source` enum, objective-length rejection, and the four-value lifecycle enum with cancellation modelled as a receipt rather than a state.

Behavioral tests must prove that a Goal continues past a single model response across at least three host-admitted turns; that continuation survives a simulated restart and a compaction without growing the prompt; that a manual Stop, Pause, or Cancel defeats continuation, scheduled resume, Usage-reset resume, execution-window resume, and provider-native retry; that a direct user edit writes revision `n+1` with no approval dialog; that an agent proposal writes nothing before approval and nothing after denial; that an unrequested silent rewrite is refused with a typed error; and that a `complete` result requires recorded completion evidence rather than a model assertion.

Negative tests must prove that no active surface exposes a phase, tranche, child Goal, budget, or mandatory verifier role; that a Goal cannot be inferred without an explicit user request; that a blocked Goal cannot resume until its named condition clears; and that BSD state — Off, Auto, On, degraded, or quarantined — changes no Goal outcome.

Internal-caller tests must prove that a research Goal, a ledger-to-Plans Goal, and a PlanUnit-generation Goal each complete multi-turn work while keeping their own workflow state under their own owners, and that none of them writes a Goal field to hold it.

ContractRef: ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/Progression_Gates.md
