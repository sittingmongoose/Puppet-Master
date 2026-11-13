# Shard 060: Command registration coverage supplement (DL-471, 2026-11-09)

Source: `Plans/UI_Command_Catalog.md`

Source lines: L22000-L22046

Source SHA256: `78bf4a426edef7bf5093860c971f08913c96530985654373ee23e8bcff7dc938`

---

## Command registration coverage supplement (DL-471, 2026-11-09)

### UCC-231 - Existing Docker And Worktree Command Registration Coverage

```yaml
plan_unit_id: UCC-231
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  cmd.docker.bake is the live bare Bake command exposed by CRAU-011 and the catalog's reserved Docker
  namespace, with a production wiring row catalog.docker_bake. cmd.docker.container.stats shows live or
  cached container stats with freshness markers under section 2.5A's docker_available and container_selected
  preconditions. cmd.git.worktree.open_topology and cmd.git.worktree.repair are the live project-scope ids listed
  by Plans/GitHub_Integration.md Worktree Topology Commands. This unit makes those existing registrations
  addressable for UCC-230's closed outside_range_commands list without adding args to catalog rows.
  CRAU-115 defines the two Docker payloads and W-095 the two worktree payloads. The bare Bake operation's
    relation to bake.run, stats' view/result behavior, topology's distinct view and repair's admission and
  unavailable-until-defined policy are decided by DL-471 Q-ID3/Q-ID4/Q-ID6/Q-ID7a/Q-ID7b. Repair has no admitted
  mutation algorithm yet and returns handler_unavailable without mutation until its owner defines one.
  No new production wiring row or API behavior is certified by registration. DL-471 Q-ID1 decides cmd.docker.remove is a compatibility_alias of cmd.docker.container.delete.
  DL-471 Q-ID2 decides cmd.git.worktree is a non-dispatch family token. UCC-230 records both dispositions. UCC-132 already registers merge and UCC-142 the two debug phase commands.
gui_related: false
gui_classification_reason: Makes existing command registrations addressable; owner docs retain behavior.
depends_on: [DL-471, CRAU-011, UCC-049, UCC-054, UCC-132, UCC-142]
unblocks: [CRAU-115, W-095]
acceptance_criteria:
  - Only the four preserved existing commands are registered by this coverage supplement.
  - UCC-230 routes them explicitly and requires exactly one owner definition under all ordinary rules.
  - DL-471 records the owner-decided standings and semantics, including Repair staying unavailable until its operation is defined; no implicit command or wiring scope expansion occurs.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests or production build tasks are created.
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py --json
  - python3 scripts/pm-plan-index.py validate
risk_class: unrouted_command_registration_drift
reasoning_tier: high
context_scope: command_registration_coverage
implementation_surfaces: [Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: command_registration_coverage, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "DL-341 coordinator resolution 5; DL-471 quotes the owner decisions."
preserved_exact_tokens: [cmd.docker.bake, cmd.docker.container.stats, cmd.git.worktree.open_topology, cmd.git.worktree.repair]
negative_constraints:
  - Do not infer repair mutations, manufacture new provider semantics, or certify production wiring here.
  - Do not rename or delete the unresolved legacy rows.
owner_hints: [Plans/Containers_Registry_and_Unraid.md, Plans/WorktreeGitImprovement.md, Plans/GitHub_Integration.md]
```
