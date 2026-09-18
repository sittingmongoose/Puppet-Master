# Decision drafts and historical dispositions

**Product choices remain pending; supported repairs have separate landing proof.** Root accepted the [independent v1 review](evaluator/v1-comparison-review.md): R1/R2 are conditional candidate-conformance checklists, not demonstrated missing canonical requirements; P1/P2 require measurement, compatibility and license evidence before selection. They preserve proposals from the v1 warmup's [J0005 comparison](runs/terminal-current-hybrid/jobs/J0005-compare/workspace/notes.md), whose native outcome was timeout despite a useful report. This is warmup evidence, separate from the amended [v4 trial](TRANSPORT_AMENDMENT.md). P3–P5 preserve three supported terminal/hybrid proposals. The [incomplete terminal/premium audit](evaluator/terminal-current-premium-v4-final-review.md) adds evidence to existing options and six conditional decision directions P6–P11; these are neither newly proven missing capabilities nor a yield count. Both bounded Usage attempts are closed, with a separate synthetic decision packet below. The original P1/P2/R1/R2 entries retain **L-9b450b5ab3e0**; these local labels are not four new leads. The bounded reviews do not certify every source, approve choices, or establish runtime acceptance. O/C/T/H/D references identify the warmup report's owner/consumer table.

## P3 — Optional enhanced terminal protocols

**Pending; neither approved nor landed.** Review a versioned capability profile with optional negotiated kitty keyboard enhancements. Alternatives are the current legacy input profile with honest unsupported results, selected enhancements, or a fuller implementation after conformance evidence. Image protocols remain an independent decision; keyboard adoption would not approve images.

Benefit: more precise modified-key handling and capability disclosure. Dependencies: selected engine, input encoder, shortcut ownership and tested local/Windows/SSH/tmux paths. Tradeoffs: compatibility gains versus negotiation/state-stack complexity and keyboard/IME regressions; image support adds separate decoding, memory and retention work. Acceptance includes non-mutating queries, bounded push/pop, independent normal/alternate stacks, chunk boundaries, reset/crash behavior and one owner per input. Source and exact alternatives: [J9 proposal](runs/terminal-current-hybrid-v4/jobs/J0009-compare/workspace/notes.md), **L-5746f5c667fd**. Existing protocol acceptance is covered; this is a specific optional extension, not a missing generic terminal capability.

Premium's **L-ae203bd99176** adds the same Kitty direction; the late input-path topic, embedded **L-c91a7e42d803** / registry **L-32d391838063**, adds an end-to-end host/toolkit feasibility prerequisite. Core support does not prove pinned Slint/platform field availability. [Consolidation and sources](evaluator/terminal-premium-decision-draft.md) retain the uncertain probe without asserting a Slint defect.

## P4 — Richer shell context and parser implementation

**Pending; neither approved nor landed.** Review capability-gated continuation/right-prompt boundaries and rich shell properties. Compare a minimal parser extension with a shared shell-capability implementation against the same byte-stream fixtures. Environment reporting is a separate scope decision because it broadens sensitive metadata intake.

Benefit: clearer multiline/custom-prompt boundaries and consistent replay. Dependencies: authoritative shell observations, protocol versions, source-qualified metadata and bounded scrubbed storage. Tradeoffs: a small parser adds less dependency weight but duplicates semantics; a shared implementation may reduce drift while adding integration assumptions. Acceptance includes chunk splitting, output before completion, malformed/forged sequences, nested prompts and consistent local/remote/replayed projections. [J13 proposal](runs/terminal-current-hybrid-v4/jobs/J0013-compare/workspace/notes.md), file-local **L-0691010de814**, registry **L-5f393eabe4ff**. Existing lifecycle ordering is already required.

## P5 — Conditional provider snapshot adapter

**Pending; neither approved nor landed.** If PM admits a provider with cumulative or rewritten output, classify updates as append, complete snapshot, rolling/truncated snapshot or final result. Prefer provider offsets/revisions. Without them, one bounded snapshot with disclosed uncertain continuity is a concrete alternative to heuristic text stitching. Keeping multiple snapshot versions is a separate retention decision.

Benefit: prevents repeated or rewritten output from masquerading as an exact transcript. Dependencies: a particular provider contract, invocation/revision identity, settlement, bounded retention and consistent Chat/Output projection. Tradeoffs: snapshot replacement loses earlier preview history; version retention costs storage; stitching can falsely join repeated text. Acceptance includes repeated motifs, shorter rewrites, no overlap, duplicate/late updates, a different final preview and concurrent readers. [J13 proposal](runs/terminal-current-hybrid-v4/jobs/J0013-compare/workspace/notes.md), file-local **L-1703bf453a12**, registry **L-6b1455da4870**. This approves no provider integration and grants no PTY authority to output-only work.

The [bounded hybrid review](evaluator/terminal-current-hybrid-v4-final-review.md) supports these as three material proposals, not three adopted features. The tool-invocation/block association recommendation remains an additional design clarification whose necessity is unresolved. Late research directions and placeholders remain retained in their source reports.

## P1 — Engine and driver selection

**Status: pending product decision; neither approved nor landed.** The warmup's proposed evaluation preference is pinned `alacritty_terminal` Term/vte behind PM's model boundary with a PM-owned renderer/logical-selection adapter; review the supplied loop versus a PM process-host driver separately. Alternatives include wezterm-term, libghostty-vt with host rendering/shaping still required, portable-pty as a complementary process layer, termwiz/parser-only integration, or retaining an unselected core. Neither a PTY layer nor termwiz escape decoding supplies a terminal emulator. The inspected development commit is evidence, not a shipping recommendation.

Benefit: reuse established terminal machinery. Dependencies/tradeoffs: revision/license/API maintenance, Host/Server ownership, Slint integration, logical-history mapping and R1/R2 gates; custom drivers add response/timeout/lifecycle work. No measured speedup is claimed. Acceptance: supported-platform rendering/fallback, IME/accessibility/input, command metadata, and one/multiple-pane latency, memory, lock, flush and cancellation measurements. Owners: Section15 O3–O6, FinalGUI C2, Storage C3, ATS T1, Server H2, Supply Chain D1. Evidence: S00018–23, S00063–65, S00075, S00100–101; [full P1](runs/terminal-current-hybrid/jobs/J0005-compare/workspace/notes.md#p1--reviewable-proposal-adopt-an-alacritty-engine-adapter-with-driver-choice-explicit).

Premium [candidate evidence](evaluator/terminal-premium-decision-draft.md) adds **L-cc82a3bfe171**, **L-bf66679ef7aa**, and **L-e88369c1c852** to this same choice. Renderer/cache and packed-scrollback ideas remain optional experiments under the existing fidelity/storage obligations. No benchmark win, remote screen-delta protocol, image admission or text-loss policy is implied.

## P2 — Windows console deployment

**Status: pending product decision, independent of P1; neither approved nor landed.** Evaluate PM-managed, version-pinned ConPTY components with verified installation/provenance and explicit OS fallback; alternatives are OS-only or explicit external installation. Package publication does not prove a compatible binary pair or authorize broader OS support.

Benefit: reproducible, independently serviceable behavior. Dependencies/tradeoffs: verified layout/exports/architectures, release ownership, footprint, compatibility matrix and rollback. Acceptance: absent/untrusted/incompatible components, creation failure, resize/Unicode and teardown matrices, failed update/rollback; no backend hot-swap or command replay. Owners: Section15 O6/SMPFS-132, Supply Chain/Shared Runtime D1, Storage C3, ATS T1. Evidence: S00022, S00032–33, S00037, S00073, S00078; [full P2](runs/terminal-current-hybrid/jobs/J0005-compare/workspace/notes.md#p2--reviewable-proposal-pin-and-own-windows-console-deployment).

## P6–P11 — Additional conditional directions from the stopped premium run

**All remain unapproved and unlanded.** The [concrete decision packet](evaluator/terminal-premium-decision-draft.md) supplies each choice's benefit, dependencies, downsides, alternatives, acceptance evidence, exact lead IDs and source-report links. This table preserves navigation; it does not add executable work or treat a proposal as a proven omission.

| ID | Choice to review | Boundary |
| --- | --- | --- |
| P6 | Explicit remote terminfo installation or a disclosed conservative terminal profile | Per-host authorization and verified capabilities; preserve ordinary SSH when declined. |
| P7 | Pane-local advisory OSC progress and collision policy | Cannot establish command/Goal completion; taskbar aggregation is outside this choice. |
| P8 | Insert a retained command without execution; open retained output in an editor | No shell-history import or automatic execution; coherent backing and source identity remain required. |
| P9 | Redacted environment provenance and pending-for-next-launch display | Unknown provenance stays unknown; no automatic relaunch or added collection authority. |
| P10 | Explicit live-pane input protection | Output continues; agent-input scope and persistence remain product choices. |
| P11 | Evaluate an optional external mux transport adapter | Hold selection until compatibility with PM Server ownership is resolved; no automatic daemon installation. |

The action-palette repair is excluded: FinalGUI F3-413 already requires terminal-action parity. Startup/teardown, whole-input-path feasibility and byte-flow accounting remain existing-contract refinements. Duplicate children, unresolved probes and unrun comparisons remain in the audit rather than becoming extra decisions.

## R1 — Conditional candidate-conformance checklist: adapter fidelity

**Status: reviewed conditional checklist under P1; not approved or landed.** Existing owner obligations are already present; a future implementation packet may bind these checks without a canonical amendment. Preserve existing PM contracts while validating effective geometry, surviving logical selections, coherent snapshots/damage, overlay invalidation, parser/response continuity and faithful text/defaults. This does not select an engine or relax fidelity.

Benefit: avoid corrupt copy/rendering and invalid resize calls. Dependencies/tradeoffs: adapter bookkeeping, bounded text associations and differential/native testing. Acceptance: 0/1/2-column wide-character transitions, exact surviving copy, full-versus-damage rendering, synchronized-update boundaries and explicit degradation. Owners: Section15 O3–O5, ATS-022 T1, FinalGUI C2, Chat C1, Storage C3, Catalog C4. Evidence: S00021–23, S00035, S00063–65; [full R1](runs/terminal-current-hybrid/jobs/J0005-compare/workspace/notes.md#r1--concrete-repair-admit-the-core-through-a-pm-fidelity-adapter).

## R2 — Conditional candidate-conformance checklist: process host

**Status: reviewed conditional checklist; not approved or landed.** This is candidate admission work, not a demonstrated missing host-safety requirement. Contain spawn/resize failures, clean partial resources, validate cwd at execution, preserve buffered progress, distinguish exit/drain/retention/closure, and retain the responsible reader across shutdown. Candidate lost-wakeup and versioned teardown behavior still require reproduction.

Benefit: prevent crashes, wrong-directory execution, stalls and false completion. Dependencies/tradeoffs: supervision, backend provenance, schema admission and costly native failure/version matrices. Acceptance: error injection, cwd race, barrier-controlled wakeup, sustained output, versioned teardown and Client-independent Server continuity. Owners: Section15 O4/O5, ATS T1, Chat C1, Catalog/Wiring C4/C6, Storage C3, Runtime/Server H1/H2. Evidence: S00022–23, S00033–34, S00036, S00062, S00077, S00102; [full R2](runs/terminal-current-hybrid/jobs/J0005-compare/workspace/notes.md#r2--concrete-repair-process-host-errors-progress-and-shutdown-are-independent-contracts).

## Synthetic Usage app — separate decision exercise

The [Usage decision packet](evaluator/usage-product-decisions.md) consolidates 13 product and policy choices from both arms' final saved synthetic-fixture comparisons. It covers cache controls/warming, context display, retention/erasure, date-origin policy, rate refresh/recalculation, currency scope, richer navigation, contingent branch reporting, live timing detail, provider-charge lookups, external log ingestion, public interoperability and full typed conversation restoration. Each has alternatives, tradeoffs, proposed acceptance evidence and report/lead references. All remain unapproved; these packet IDs do not extend live PM's P1–P11. Accounting for existing auxiliary calls is a correctness clarification; initiating new calls is a separate product choice. Deferred mentions and unsaved claimed proposals are excluded from the decision count.

The narrow existing-attempt clarification is [landed in a separate synthetic derivative](landings/usage-thin-amended/Plans/Usage.md), with [receipt](landings/usage-thin-amended/landing.json) and [independent actual-file verification](evaluator/usage-derivative-review.md). It introduces no new provider traffic or optional UI. Live PM Usage and the frozen test fixture are unchanged; one evaluator-assisted document amendment is counted, with no runtime-test or retroactive-score claim.

## Historical repairs — accepted and landed separately

The September 8 [authorization record](/mnt/Cursor/PuppetMaster/Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/source_shards/authorization.md) retains Jared's exact instruction, “ok set a goal, and get to work,” accepting the proposed bounded historical corrections, not later product choices.

- **Retry identity:** accepted and landed in ACD-108, UCC-067, matching prose and ATS-021.
- **Output-read truth:** accepted and landed in SMPFS-023, SP-125, matching prose/anchor clarification and ATS-022.

[Exact patch](repairs/terminal-corrections.patch) · [independent verification](repairs/independent-medium-review.md). These historical repairs span five canonical documents; they are not new workflow yield or runtime acceptance. Governance remains unsealed.

## Workflow findings — supported repairs

**ConPTY conformance, residual GUI retry wording and command-block value alignment are accepted and landed under the existing bounded repair authorization.** [Initial landing receipt](repairs/workflow-initial-landing.json) records SMPFS-070/ATS-022 and F3-360 across three documents. The first refines existing host behavior; the second repairs another consumer occurrence in the historical retry family. The [schema landing](repairs/schema-landing.json) adds the reviewed one-family value mapping, owner/acceptance changes and named fixture/checker; 73 checks pass against the live schema. It preserves the old key and legacy schema, with actual production graph registration and native migration obligations still unexecuted. These are separate evaluator-assisted compilations after the frozen participant output. No P1–P11 product decision is implied by these repairs.
