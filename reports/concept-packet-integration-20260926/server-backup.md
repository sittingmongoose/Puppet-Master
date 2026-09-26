# Server / Backup integration audit — reviewed corrections (2026-09-26)

Scope: `PM_Server_First_Backbone_Delivery_Bundle_FINAL_WAN_MVP_2026-08-14`
(both nested bundles) + `PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01`,
through server/client/home ownership, remote access, tsnet/pairing,
forge capability/auth, and backup/recovery + UI/Plans/command/wiring
integration. Audit basis: worktree == `origin/main` at `9a40601e9`.
Concept authority: selected sources under `Concepts/` (Settings
`settings_refresh` managers, `onboarding/opus-5.5` screens), not the
generated `TestOpus5.5PmConcept.html` alone. Current canonical Plans and
the selected GUI trump packet candidate spellings on decided points.
This revision corrects the original G1/G2/C2 verdicts per the independent
review at `/home/sittingmongoose/PM-Experiments/concept-packet-integration-20260926/server-backup/sol-review.md`,
with every load-bearing cite re-verified in-tree. Packet prompts/validators
are historical assets, not executed. Static schemas, fixtures, `handler_unavailable`
rows, and the 67-scenario acceptance registry (NOT_RUN by design) remain
planning evidence only; no runtime, provider, recovery, security, visual,
or readiness proof is claimed.

## Verdict

G1 rejected as false positive (no missing-alias finding; mapping below lives
in this report). G2 narrowed to a open concept-projection gap (existing
Save/Print/Test covered; residual handoff/rotation work owned by the
future owner/consumer implementation; the experimental source draft was rejected). C2 corrected
to owner-covered / concept-integration-partial, retained as future owner/consumer integration.
G3 accepted and applied as low-impact reader routing (RAS-003 pointer added
in this worktree; landing/regen left to the landing flow). 0 product-choice
blockers, No new product decision is needed for these dispositions. The 16-cluster packet census is
preserved as the routing map.

## Corrected findings

### G1 — REJECTED: no 11 missing dispositions; candidate functional mapping only

`Plans/Forge_Integrations.md` §3.1 closes the provider-neutral command owner
at 46 exact IDs (L401-467); FGI-013 admits nine distinct September 1 commands
and states they are not aliases (L807-839; "None of the nine ... is an
alias"). Absence of eleven packet candidate spellings from central files
proves only non-admission. It does not justify new aliases, production
exclusions, Touch Closure rows, or UI commands, and this audit admits none.
Functional dispositions (no new commands; no new native behavior prescribed):

| Packet candidate(s) | Disposition |
|---|---|
| `cmd.forge.review.list` | Covered by function: ReviewRequest is an SCS-016 observed projection (`Source_Control_System.md:1047-1053`); `cmd.forge.review.open\|refresh` (census L416-417) serve exact selected-review work. No list alias. |
| `cmd.forge.pipeline.definitions`, `.artifacts.list` | Covered by function: SCS-016 owns AutomationDefinition/RemoteArtifact records; `cmd.forge.pipeline.list\|refresh\|open_job\|open_logs` serve run navigation; F3-529 requires definition/artifact regions (pinned/available definitions, artifacts/retention, `FinalGUISpec.md:35773-35775`). No separate enumerating command. |
| `cmd.forge.pipeline.definition.pin` | Covered in selected GUI, owner-scoped: Settings pins workflows (`settings_refresh/managers/35-source.js:314-318,468`); GUI owner retains GitHub-specific `cmd.github.actions.pin\|unpin` + pinned-workflow state (`FinalGUISpec.md:1697`). Provider-neutral pinning beyond that needs an owner decision; not an alias to run/list. |
| `cmd.forge.pipeline.artifact.download` | OPEN, unproven: F3-529 requires explicit import/download with no auto-execute (`FinalGUISpec.md:35785-35787`); SCS-016 owns RemoteArtifact identity; `cmd.forge.release.asset.download` is deliberately distinct from pipeline artifacts. Selected source already offers preview-disabled `Open artifacts in service` through `cmd.forge.pipeline.open_in_browser` (`forge_backup_post_integration_source.py:209-216`); FGI-015 already settles capability-gated native actions with official external fallback. Native CI download/import command coverage remains incomplete, not a new product choice. Not covered by release-asset download; no command invented here. |
| `cmd.forge.pipeline.secret.set\|remove`, `.variable.set\|remove` | OPEN, conditional, unproven: FGI-015 + F3-529 require independently gated hosted-admin read/write with official external fallback (`Forge_Integrations.md:921-954`; `FinalGUISpec.md:35806`); credential broker owns secret bytes. The selected source offers preview-disabled `Open service settings`; FGI-015 already owns supported native actions and official external fallback. Native mutation command coverage remains incomplete, not a new product choice. Not Settings mutation; no secret values in Forge records; no native commands prescribed here. |
| `cmd.forge.capabilities.refresh` | Covered by function: capability probing belongs to connection/test and current provider profile via shared `cmd.integration.connection.add\|update\|test\|remove\|open_details` (`Forge_Integrations.md:452-456`; `cmd.integration.connection.test` in `Commands_System.md:5315`). No bare forge refresh alias. |
| `cmd.source_control.publication.preview` | Covered by function: publication preview/approval retained by Source Control / forge workflow before `cmd.source_control.remote.publish` (`Source_Control_System.md:312,396`). Not `cmd.forge.repository.policy.preview`; packet spelling admits no new command. |

### G2 — NARROWED, PENDING: Save/Print/Test covered; protected-handoff + rotation/compromise projection gap awaits source verification

The original literal-label grep missed actual controls. Covered in the
selected Settings source (`settings_refresh/managers/54-backup.js`): Save
Recovery Kit action (L50-54), `Print it` save target (L225-228), Test
Recovery Kit three-step check (L206-211), status Not saved / Saved · Not
tested / Saved · Tested (L27). Covered in onboarding (`onboarding/opus-5.5/src/js/72-screens-review.js`):
Recovery Kit check command after Project commit (`cmd.backup.recovery_key.export/test`
flow, L273-342). Exact packet labels (`Test Saved Kit`, `Recovery not
confirmed`, `Unlock required`) need not be copied verbatim. BRS-012 already
owns these actions with handlers unavailable (`Backup_Restore_System.md:484-510`;
BRS-011), so nothing here is a missing canonical command.

Residual concept-projection gap (NOT closed; selected source preserved; attempted repair rejected): no distinct key-slot rotation versus
suspected-compromise/new-domain re-encryption presentation in the Settings
manager; no owner-bound protected handoff/step-up/currentness shown for
Save/Copy/Print/Test; ordinary Copy writes an example key to the clipboard
(`54-backup.js:236`) and onboarding renders six example Recovery Kit words
(`72-screens-review.js:305,330-333`), while F3-528 prohibits Recovery Key/Kit
bytes in concept fixtures and ordinary clipboard history
(`FinalGUISpec.md:35695`). Required future correction: protected, secret-free owner handoffs with real result predicates; preserve Save/Print/Test and use the authored TestPM → O55 generation chain. This delivery does not claim that correction.

### G3 — ACCEPTED, APPLIED: narrow RAS-003 successor pointer to RAS-015

RAS-003 retains compatible host-install reuse, private Serve, and
initiating-active-Client lifetime clauses inline
(`Remote_Access_System.md:127-175`); RAS-015 explicitly supersedes exactly
those mechanics (`:854-881` + `supersedes` list) with the PM-owned tsnet
connector, independent private listener, external-only host installation,
and durable Server-owned authorization handoff. Applied in this worktree: a
four-line successor-pointer note under the RAS-003 heading routing isolated
readers to RAS-015 ("in conflicts RAS-015 controls"). Historical clauses,
all other RAS-003 semantics, and the PlanUnit YAML (status, canonical text,
acceptance criteria, metadata) are byte-preserved; no new transport,
command, or handler behavior; no new unit. Evidence: the RAS-015 `supersedes`
list already decided the conflict, so the pointer adds routing only.
Companion need: none (prose pointer; no schema/fixture/catalog/wiring/touch
change). Shard/index regen and landing are left to the landing flow per
worktree rules (this worker performs no regen, commits, or pushes).

## Coverage by cluster (all packet sections dispositioned; preserved)

- C1 Server/client/home ownership — already covered. SBI `02` (L7-29),
  `03` L59-63 (routes are not Project settings), `04` vault/catalog (L4-28) →
  SRV-001..013 (SRV-004 L161, SRV-005 L200), PJCT-001..008, SP catalog/vault
  families, SSYS-012 manager routes. (`Project_System.md` under concurrent
  edit by another worker; no edits proposed there.)
- C2 Discovery/pairing/claim — owner covered; concept integration partial,
  PENDING (corrected). SBI `05` §8, `10` L47-58 + L126-139, SBO `01`
  L68-80/`02`/`03`, v5/10 §4 lineage → SRV-002..004, RAS-001/RAS-014,
  PWIZ-024/025, `cmd.server.*`/`cmd.client.pair.*` + production wiring.
  The `s-ready` QR/code/link/countdown card exists
  (`68-screens-server.js:151-175`), so a post-claim pairing card is present.
  Residual seam (selected prototype still needs native owner mapping; not a
  missing screen): the `cmd.server.claim` concept operation includes a local
  `pair` phase and sets `server_trust_confirmed=true` on claim completion
  (`:125-138`) before any separately evidenced `cmd.server.bootstrap.start`
  or `cmd.client.pair.start|approve` result, while SRV-005 requires a
  distinct durable ServerBootstrapRun after claim and SRV-004 requires exact
  PairingRun identity plus explicit approval before Client trust. Preserve
  the card; map its Ready claim and pair material to owner bootstrap and
  PairingRun states. Coordinate with ongoing Final GUI / Planning Wizard
  owner edits; re-read changed text before landing.
- C3 Tailscale/tsnet — superseded-with-record, already covered. SBI `05` §3 +
  `18` full-packaging text superseded by FB `13` TSX-001..005 and tsnet `01`-`10`
  (Go `pm-tailnet-connector`, userspace, one node/server, IPC, state machine) →
  RAS-015, SIR-032/033 consumers, connector commands + compatibility
  aliases, `remote_access_system_contracts.*`; concept Away From Home route model,
  Tailscale/Headscale/Funnel states.
- C4 Funnel/proxy/VPN/Remote Link — already covered. SBI `05` §§4-7, SBO `01`
  L93-117 → RAS-002 route order, RAS-004/005/006/007; concept connect copy.
- C5 Packaging (Docker/TrueNAS/Unraid/K8s, WSL) — already covered. SBI `05` §9,
  `06`, tsnet `03` (no sidecar/TUN/operator) → RAS-008/010/015, Release owners;
  concept NAS/server-kind install copy.
- C6 Forge capability/auth/providers — already covered (G1 rejected; mapping in
  this report, not new dispositions). FB `02` SCM-001..009, `03` FORGE-001..009,
  `05` MAT-001..005, `06` SAUTH-001..005 → SCS-001..020, JJI-001..012, FGI-001..020,
  Origin/GitLab/Azure/Bitbucket owners, 13 machine profiles; concept provider
  sign-in copy. The existing official-service presentation is covered; native artifact-download and secret/variable command coverage remains incomplete under the already-decided FGI-015 fallback.
- C7 Left-rail GUI — already covered. FB `04` GUI-001..008 →
  `repository_automation` occupant + `github_actions` alias, source-manager
  placement (`Actions & Pipelines` tab), concept occupant + review/publish copy.
- C8 Backup architecture/capture/engine — already covered. SBI `08` L37-45, FB
  `07` BKP-001..012 (restic reference, coordinator, barriers, JJ/Git closure,
  secrets boundary) → BRS-001..010, BRS-017; v5/09 lineage retained via
  243-row coverage + `baseline_dispositions.json`.
- C9 Destinations/auth — already covered. FB `08` CLOUD-001..008 (11 families,
  canary test, PM-registered OAuth, headless gate) → BRS-013, BRS-018, SAUTH
  consumers, `backup_destinations.json`; concept destination picker.
- C10 Encryption/kit — already covered in Plans, partial in concept, PENDING
  (see narrowed G2). FB `09` KEY-001..007 → BRS-012, Permissions/redaction
  consumers, F3-528 handoff rules.
- C11 Restore/browse/retrieve — already covered. FB `10` REST-001..009 → BRS-006,
  BRS-014, PJCT-004/005, SRV-013; concept restore-from-kit flow incl. unlock
  phrase, preview, never-restore-secrets.
- C12 Automation/retention/verification — already covered. FB `11` AUTO-001..006
  (7/4/6 default, holds, prune, drills) → BRS-015, BRS-004/005; concept
  retention + daily-backup copy.
- C13 Settings/onboarding/Doctor — already covered. SBI `09`/`16`, SBO `01`-`03`,
  FB `12` BGUI-001..005 + handoffs → SSYS-012/015/020/026, PWIZ-024/025, N2-156,
  F3-520/522 consumers; placement map tabs; Doctor route/backup projections.
- C14 Commands/wiring/DRY/schemas — already covered (G1 rejected; no new
  alias/external-only/deferred rows prescribed). SBI `10`/`11`, SBO `02`,
  FB `14` CMDX + 168-action census, `15` OWN-001..006, tsnet `05`/`06` →
  CS-073/CS-074, UCC-151/152, WM-050/051, UIW-016, owner schemas + fixtures,
  `cmd.connection.*` recorded (catalog + exclusions), serve-ID compatibility
  map in RAS-015.
- C15 Tests/acceptance — already covered as obligations. SBI `14`, SBO `03`,
  tsnet `08`, FB `16` TEST-001..003 → ATS-043/044 +
  `Plans/forge_backup_tsnet_acceptance.json` (67 scenarios, 132 joins, NOT_RUN by
  design — not a failure), BRS-010/RAS-010 gates.
- C16 Negatives/retirements — already covered. SBI `01` L67-85 + `15`, tsnet
  `09`, FB `18` → Crosswalk C-052 + AUTH-006 (source token preserved, visible
  copy normalized to `Built into Puppet Master`), F3 negatives, SRV L556;
  serve-CLI only in compatibility rows, routine-`Synced` prohibitions present.

## Explicit non-findings (checked, no action)

- Visible copy `Built into Puppet Master` (spaced) in concept + RAS/F3/Settings:
  deliberate normalization recorded in Crosswalk AUTH-006; source token
  `Built into PuppetMaster` preserved in `preserved_exact_tokens`.
- Scalar `settings_inventory.json` (887 rows) has no backup/remote/forge rows:
  correct — manager routing lives in the authored placement map; inventory holds
  scalar settings only.
- `cmd.connection.test/update/remove/open_details` in exclusions rather than
  production rows: recorded disposition, accepted.
- `handler_unavailable` + `expected_event_types=[]` everywhere in scope: current
  planning posture, not scored.
- Packet candidate spellings absent from central files: non-admission, not a
  finding (see G1).

## Product choice vs mechanical omission

No new product decision is required or made here. G1 is rejected; G2/C2
residuals are concept-projection repairs owned by another worker; G3 is
applied reader routing. Standing product-owned items stay with their owners:
CLOUD-005 headless-web-OAuth broker as release gate (BRS-018), Tailcat
unapproved pending pricing (Crosswalk AUTH-006), Remote Link provider
abstraction (RAS-006), backup-default expansion with consent (AUTH-008),
provider-neutral pipeline pinning, and artifact-download / hosted-admin
execution routes (pending provider-source review).

## Owner-consumer overlap edges (coordination only, no edits)

Server_System ↔ Remote_Access (identity/endpoints/trust) ↔ Project_System
(Home assignment, backup/restore-as-new) ↔ Backup_Restore (coordinator, kit,
destinations) ↔ storage-plan (vaults, barriers, families) ↔ Source_Control/
Jujutsu/Forge + provider docs (bindings, capability, automation) ↔ Settings
(SSYS-012/026 routes + placement) ↔ FinalGUI (F3-520/522/527/528) ↔ Planning
Wizard (PWIZ-024/025) ↔ Doctor/N2-156 ↔ Shared Runtime (SIR-032/033) ↔ Commands/
Catalog/Wiring/Touch ↔ Tests (ATS-043/044 + acceptance registry).
Concurrent workers own Project_System, FinalGUISpec/Planning_Wizard text, the
concept-owner projections, and provider-source review; this report prescribes
no edits outside `Plans/Remote_Access_System.md` (G3 pointer, applied) and
coordinates by citation everywhere else.

## File coverage

Read fully: SBI `00`-`20` (19 via counts+rule: 243 rows/21 domains);
delivery `00_DELIVERY_README.md`, `05_DELIVERY_VALIDATION.md`;
SBO `00`-`03`, `09`; FB `00`-`18`, `20`, tsnet `01`-`10`, both handoffs,
`machine/SCHEMA_NOTES.md`, `source_baseline/README.md`.
Machine JSON via structural + ID extraction (all files in both `machine/`
dirs + `tsnet/machine/`).
Lineage via headings + keyword scan + targeted excerpts (pairing, backup
records, remote insertion, ingress bounds); remainder superseded per SBI `01`
precedence + `20` changelog, retained through the 243-row coverage +
`baseline_dispositions.json`.
Duplicates (16 sha256 groups, read once): WAN authority x3; SBO 00/01/02/03 =
source_authority onboarding_doctor copies; SBO 05 = SBI 07; SBO 06 = machine
remote-access JSON; SBO 07/08 = final_remote_access 02/04; both goal-prompt txt =
SBI prompts copies; FB source_baseline x4 = server-bundle copies.
Review pass re-verified in-tree: forge census + FGI-013/S-016/FGI-015 rows,
connection-test family, publish path, F3-528/529 clauses, `54-backup.js` /
`35-source.js` / `68-screens-server.js` / `72-screens-review.js` cites above.

## Final route review

The selected two official-service buttons currently carry the same command ID without distinct destination metadata. They are disabled previews, not working deep links. Native owner wiring must bind the exact artifact-run page versus hosted-settings page, normalized provider origin and current context before enabling either. Do not map pipeline downloads to release assets or infer a secret editor from a navigation link. The RAS pointer was corrected after review to reference the complete RAS-015 supersession list, including component and per-WSL mechanics; it adds no dependency cycle.

## Source-draft disposition

The attempted concept-owner-projections repair was rejected after independent review: it introduced incorrect pairing-expiry/approval behavior and did not establish genuine Recovery Kit result predicates. Its patch and hashes are preserved outside the repository. All of its authored-source/output edits were restored; the shipped PMConcept7 remains byte-identical to the user-selected TestOpus. G2 and C2 therefore remain open consumer-integration requirements, not completed fixes.
