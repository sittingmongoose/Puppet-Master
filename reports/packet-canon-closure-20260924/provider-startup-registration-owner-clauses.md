# Provider startup and registration-disabled owner clauses

Status: reviewed owner prose integrated; technical/runtime companions remain open.

The packet requires zero unconfigured-provider startup probes, not merely
staggering probes or filtering providers later at request time. SIR-040 now
states that exact catalog/discovery/availability boundary, uses existing cached
currentness projections, and preserves explicit actions and installed-integration
maintenance under their existing owners. CBP-012 supplies bridged-provider
examples, not a universal definition of every provider's configuration.

FGI-011 now requires Create account suppression for a selected admitted
Forgejo/Gitea instance authoritatively observed to disable user self-registration.
Account creation then follows administrator invitation or external provisioning;
existing-account sign-in retains the admitted PAT-default and registered OAuth
routes. Unknown state is not silently classified as disabled or enabled, and
no new unknown-state presentation policy is chosen. Current official-page
proof remains MACS-005's responsibility.

The authoritative registration-state observation/currentness contract is still
an explicit technical prerequisite. OAuth-app registration and runner registration
do not provide it. This prose does not manufacture a probe, schema field, issuer,
native test result or GUI implementation. The registration companion is a
separate follow-up stage, not closed by naming the requirement.

External evidence directory:
`/home/sittingmongoose/PM-Experiments/packet-parallel-20260925-WF6UrR/case-reconciliation/five-owner-clauses-correction-02/`.

- Native author `OWNER-PROSE.patch`, SHA-256
  `3a1f7cbe2ca31cabac977a7bd8272236b8d42556265556733267b610b1c5a269`.
- Different-Sol V2 review, SHA-256
  `e73fb7e9f9abca014844992cf15b604a7a58646be3688eed4c8878e077bc902a`.
- Selected corrected `corrected-sol-v3/OWNER-PROSE-SOL-V3.patch`, SHA-256
  `9df127ec5e90381327695e111099560b0c287c7f24ad2d887612c7545b496e58`.
- Selected handoff SHA-256
  `a1944e84f6d2ec615ef08e74795ecf96460e6f57bf80a54e2fee2f0094a8beaf`.

Root accepted the selected semantics, quoting the FGI YAML criterion solely
to prevent its internal colon being parsed as a mapping. Both new criteria
parse as strings in the generated index. Shard generation/check passes (99
documents, 2,766 shards); index generation passes (6,747 units), with only the
two edited owner documents' 73 indexed records changed. No unrelated owner
shards changed, no WorkNodes were created and runtime certification remains
blocked. Separate index validation is pending at this checkpoint. No governance
reseal, main landing, or full packet completion is claimed.
