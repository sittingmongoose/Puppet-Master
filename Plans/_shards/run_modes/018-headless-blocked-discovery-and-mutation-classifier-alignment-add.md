# Shard 018: Headless Blocked Discovery and Mutation Classifier Alignment Addendum

Source: `Plans/Run_Modes.md`

Source lines: L690-L710

Source SHA256: `a55e0f6be429d71cc0380293d4d2ddfeac8abf084f4f1667346376ce9380f178`

---

## Headless Blocked Discovery and Mutation Classifier Alignment Addendum

### Headless `headless_ask_denied` discovery

When `headless_ask_denied` blocks a node in a headless or non-interactive run mode:

1. A `blocked_notice` event is emitted to the event bus with `blocked_reason_code: headless_ask_denied`.
2. The run status summary (visible in CLI output, logs, or dashboard if a UI session is connected) shows the blocked node count.
3. If the run has a connected UI session, a dashboard notification badge appears.
4. The blocked notice includes the specific permission or approval that was needed and could not be presented interactively.

Recovery: the user must either (a) change the run mode to interactive and resume, (b) adjust permission presets to pre-approve the needed action, or (c) abort the blocked node.

### Safe-point and mutation_capable alignment

`mutation_capable` classification is performed by the **tool registry** (each tool declares `mutation_capable: bool`, default `false`). The **node planner** propagates this to the node plan record. Run modes do not override `mutation_capable` classification but do control whether safe points are created:

- `regular` and `yolo` modes: safe points are created before mutation-capable attempts as normal.
- `ask` and `plan` modes: no mutation-capable attempts occur by definition, so no safe points are needed.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Tools.md, ContractName:Plans/Contracts_V0.md
