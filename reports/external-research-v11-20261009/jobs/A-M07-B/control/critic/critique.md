# Critique — S01 field-inspections (A-M07-B control/critic)

Target: `../../research/draft.md` (final planning deliverable) with
`../../research/discovery.md`, `../../research/source-map.json` (S01–S15),
`../../research/revealed-plan.md`, and brief `cases/S01/brief.md`.
Critic evidence: `source-map.json` (C01–C08) + `sources/` in this directory.

## Method and verification baseline

Independently inspected the complete predecessor draft, discovery, source map,
revealed plan, brief, and all 15 captured evidence excerpts. Independently
re-fetched 8 governing primary sources (C01–C08); 5 matched predecessor byte
sizes exactly (C01/C02/C03/C04/C06), 1 drifted 12 bytes (C08), 1 differed by
transfer encoding only (C07). Every re-fetched verbatim claim in the
predecessor's excerpts was confirmed accurate: PowerSync PUT/PATCH/DELETE +
idempotency + simplest-backend per-field LWW + deletes-win (C01), PocketBase
~5MB/~10-char-suffix (C02) and pre-1.0 warning (C03), PouchDB 409 + upsert
(C04), CouchDB deterministic winner (C05), W3C 7-subpage index (C06),
attachments deprecation + metadata/provider pattern (C08).

So this critique does NOT allege fabricated evidence. The findings below are
about interpretation scope, disposition labels, over-universalized defaults,
nav-level evidence carrying behavior-level claims, omitted alternatives, and
validation applicability. Where a critic demand below would itself need evidence
I do not have, I say so — a demand I cannot ground is marked accordingly.

## Verdict

Direction sound, evidence honestly captured, dispositions mostly right, but the
final overstates how much of its governing rules are platform-observed versus
app-policy-proposed, blends two engines' conflict semantics, and leaves the
load-bearing Android/offline-upload and access-control mechanics unsourced.
A reviser should narrow universal rules to their engine, source or soften the
ODK review/permission claims, add the missing managed-hosting and photo-store
alternatives, and tighten V3/V5 pass criteria. None of this flips the ODK-first
recommendation, which survives scrutiny as the best-evidenced fit for the brief.

## Material findings

### M1 — P1 CORRECTION is right in outcome, overstated in mechanism (P1, O2)

The outcome (native Android capture, not PWA+localStorage, for day-long offline
records) is well-defended: localStorage's ~5MB/synchronous/evictable character
is correctly stated as disqualifying for a photo-carrying outbox. But three
mechanism claims exceed the evidence:

(a) The draft never sourced any Android, PWA, IndexedDB, service-worker, or
WorkManager documentation — zero of S01–S15 cover the client platform at all.
"IndexedDB-backed PWA with service workers remains weaker than native for
camera/GPS, large outboxes, background upload under battery optimization, and
managed deployment" is therefore an unsourced comparative claim. It is
plausible (and the localStorage half is independently checkable browser
knowledge), but a correction that rests entirely on platform behavior should
cite at least one platform source.

(b) "Retain the PWA only as the coordinator's online review companion" concedes
a PWA suffices for the coordinator surface — which undercuts the blanket
"Never ship PWA offline" framing. The honest rule is narrower: PWA is rejected
as the *inspector offline-record store*, not as a technology. Material clarity,
minor wording.

(c) The "Room outbox drained by WorkManager" custom path and "Android battery
optimization" hazard are named without any Android source. Since background
upload reliability is THE load-bearing risk of the custom path (the draft
itself lists it as unmeasured uncertainty), P1's correction stands on one
sourced leg (server/sync docs) and one unsourced leg (client platform). The
critic demand — fetch one Android offline-persistence/background-work source
or soften the comparative claims to explicitly-marked engineering judgment —
is valid and cheap. I did not fetch one in this window (time prioritized to
re-verifying the predecessor's own claims); that gap is mine, recorded in
uncertainty.

Disposition verdict: CORRECTION stands; mechanism prose needs sourcing or
softening. Not a false correction.

### M2 — P2's "governing rules" conflate PowerSync defaults with universal law (P2, O2)

C01 confirms the PowerSync facts but also their scope: per-field LWW and
deletes-win are "the simplest backend implementation" and "typically ... the
backend should be implemented" — the default with a naive connector plus a
recommendation, with custom resolution as the documented escape hatch. The
draft's rules present per-field LWW as the corrected design while demanding
"deletes-win only where the product intends" — but C01's default is "Deletes
ALWAYS win" with later updates ignored. Scoping deletes-win to "where intended"
REQUIRES the custom connector; the final should say plainly that rules 3/4 are
a custom policy to build, not a default to inherit. A team shipping the naive
backend gets silent delete-wins-everywhere — the exact failure warned about.

Second, the draft blends CouchDB semantics into the same paragraph: "both
revisions retained with a deterministic winner" (C05 confirms). But the CouchDB
winner is arbitrary-but-deterministic (C05), NOT per-field LWW — different
conflict semantics from different engines, and the five rules (read as one
design) do not say which engine each rule belongs to. Rule 1 (field-level ops,
never whole blobs) is PowerSync-shaped; CouchDB replicates whole-document
revisions with deterministic winners (C05) plus app-level merge. The draft's
doc-model guidance (document-per-entity, immutable event docs, upsert deltas)
is genuinely CouchDB-appropriate (C04/C05), but sits inside a section whose
headline rules are PowerSync-shaped. A reviser must split the rules per engine
or state which engine the rules assume. This is the sharpest technical finding,
fully grounded in C01 vs C05.

Third, rule 4's review-state machine (submitted → in-review →
approved/changes-requested) is pure app policy presented alongside engine
defaults: no ODK review-state machine was captured (C07 — nav labels only),
and the PowerSync "completed order locks" line (C01) is illustrative, not an
inspection workflow. The policy is good design, but must be labeled PROPOSED
POLICY, not implied platform behavior. Same for the dead-letter queue: the
pattern is PowerSync-docs-grounded (S07, not independently re-fetched —
flagged in index), not ODK- or CouchDB-native.

Disposition verdict: CORRECTION stands (whole-doc LWW rightly rejected);
rules need engine-scoping and policy-vs-default labeling. Not a false correction.

### M3 — P3's universal bytes rule is contradicted by the draft's own CouchDB path (P3, O2)

The core correction is right: URL-only records omit the bytes half, and the
metadata + storage-provider pattern (C08) is the correct default. But "photo
bytes must NEVER live as blobs or base64 inside synced database rows" is
over-universal: CouchDB/PouchDB attachments are DESIGNED to ride replication —
the discovery section itself says so. The final's P3 rule and the discovery's
attachment note cannot both be unconditional. The honest rule: never inline
full-resolution photo bytes in PowerSync-synced SQLite rows (C08) or PocketBase
record JSON; on the CouchDB path, attachments are a supported mechanism with
size/compaction trade-offs to bound.

Further, P3's metadata-row shape (inspection id, capture time, GPS, hash,
uploader, review state) is sensible proposal presented as requirement with no
platform source for the hash or review-state fields. Either elaborate (what
hashes, verified when?) or mark the row shape illustrative.

Finally, the PocketBase local→S3 cutover rests on explicitly-flagged secondary
corroboration (S10), NOT re-verified here (C02). Plausible, honestly flagged —
but P3 carries it as a decided growth path. Verify firsthand or downgrade to
"vendor-claimed, unverified".

Disposition verdict: CORRECTION (half already-covered) stands; universalize
less, scope per engine, verify the S3 setting. Not a false correction.

### M4 — P4's enhancement bundle stacks nav-level evidence into behavior claims (P4, O2)

Disposition correct; accessibility checklist (C06) plus export-without-lock-in
the right enhancements. But the paragraph asserts behaviors observed only as
navigation labels: review-state machine + role separation (S02 nav, never a
state machine or permission matrix — C07); encrypted-forms/audit-log options
(same nav provenance; no key management or retention behavior); "database dump
+ filestore copy + API/OData + restore runbook" (ODK OData rests on a homepage
one-liner; no dump/restore procedure; no backup-during-write caveat for the
SQLite-file-copy claim); conflict surfacing as first-class UI (a requirement
stated as design; no review-UI component sourced from any platform).

None false; all plausible; but a nonprofit reader could conclude ODK ships the
full review/export subsystem out of the box. Label each P4 enhancement as
observed-capability vs build-work — valid demand, no new sources needed,
only honest labeling.

Disposition verdict: ALREADY-COVERED + OPTIONAL ENHANCEMENT stands; needs
observed-vs-built labeling. Not a false disposition.

### M5 — P5's label contradicts its own escape hatch; retrofit costs unsourced (P5)

(a) "REJECTED (user decision only with stated risk)" is internally inconsistent
under the brief's O4 taxonomy (correction / enhancement / user decision /
already-covered / rejected / uncertain are DISTINCT). A clause that becomes a
user decision under stated conditions is a USER DECISION with a recommended
default (ship scoping day one), not rejected. Substance exactly right; label
misfiles it. Since O4 explicitly requires distinguishing these, the label
matters for evaluation. Recommend: USER DECISION (recommendation: do not defer;
deferral valid only with the four stated conditions).

(b) The scoping mechanics (PowerSync rules/streams, CouchDB selectors, ODK
projects, PocketBase API rules) are overview/nav-level one-liners; no rule
syntax, selector semantics, permission matrix, or scope-change migration
behavior was captured. Yet the retrofit cost ("re-syncing every device,
re-cutting every rule, leak window") is asserted as the reason deferral is
dangerous. Plausible, endorsed in direction — but unsourced mechanism. Keep the
recommendation; mark retrofit-cost as sound-but-unsourced engineering judgment;
do not present the four mechanisms as equivalently understood.

The four deferral conditions are sensible inventions, not brief derivations
(the brief never mentions tenant-data sensitivity) — fine, conditions are the
author's job. "Do not treat silence as consent to defer" rightly places the
burden. Keep.

Disposition verdict: change label to USER DECISION with recommended default.
The REJECTED label is a miscategorization — the closest thing to a false
disposition in the draft — though the advice is correct, so a labeling error,
not a direction error.

### M6 — P6 correctly rejects toggle-only testing; V-matrix has three gaps (P6, O6)

Retaining the toggle as smoke while rejecting it as the plan is exactly right;
executed-vs-proposed separation exemplary (no runtime claimed; P6 smoke
explicitly NOT claimed executed). Three gaps:

(a) V3's load ("200 photos × 3–8 MB") contradicts the P3-captured PocketBase
default (~5MB/file, C02): 8MB photos exceed the evidenced default without
stating the limit change in setup. Either include "raise file-field cap to
≥8MB" or restate load as "3–5MB within default cap, plus an over-cap rejection
case". A validation contradicting the plan's own defaults is confused, not
discriminating. Genuine defect, cheap fix.

(b) V5's "byte-identical exports" is too strict: CSV row ordering, timestamp
formatting, and attachment filename suffixes (C02's RANDOM suffix) may
legitimately differ across runs. Byte-identity could fail a correct system
(the suffix alone breaks it if export regenerates names). Restate as semantic
identity (same records, same photo bytes addressable by hash, working review
history) plus a stated comparison procedure.

(c) V2 misses delete/delete (C01's "ignore DELETE of missing row" gives the
expected behavior — cheap, discriminating cell) and offline-edit-after-approval
(the core threat to rule 4's monotonicity). V6 conflates two runbooks (ODK
compose vs PocketBase binary+systemd) into one "single VPS" check — needs
per-footprint setup. V4's TalkBack/focus-order has no procedure (no Android
source anywhere — M1); needs a named procedure to be executable.

Disposition verdict: CORRECTION (retain as smoke) stands. Fix V3 (material),
V5 to semantic identity (material), extend V2 / parameterize V6 (material —
untestable validations fail O6's "meaningful discriminating" bar).

### M7 — Discovery strong but omits two brief-direct alternatives (O1, O5)

O1's four discoveries (ODK, PowerSync, PocketBase, CouchDB/PouchDB) plus photo
pattern and accessibility baseline are genuinely useful, unfamiliar vs the thin
plan, and materially different — O1 satisfied. Honest-gap recording good. But:

(a) MANAGED HOSTING is never compared. The brief says "keep deployments simple"
(now) and "a future small self-hosted deployment" (later) — managed-now/
migrate-later may dominate self-host-day-one on simplicity. ODK Cloud (banner
on both ODK pages, C07) and PowerSync Cloud (named in the draft's own decision
list) are directly responsive alternatives, buried as a one-line user decision
with no comparison: no cost, no export/migration parity (does managed ODK
Cloud export as cleanly as self-hosted Central?), no lock-in analysis — though
anti-lock-in is an explicit brief constraint. The managed-vs-self-host lock-in
comparison IS the analysis, and it is missing. Largest discovery omission.
Demand (compare on simplicity + lock-in, even briefly) is valid; I ground the
alternative's existence in C07 but did not fetch managed terms — specifics
remain uncertain, marked not filled.

(b) S3-COMPATIBLE PHOTO-STORE SELECTION unresolved. The photo architecture
terminates in "any S3/R2/Supabase-style object store" or PocketBase's
unverified S3 setting (M3), with MinIO/Garage unobserved. For a nonprofit that
may self-host photos, "any S3-compatible" is not a finding — single-binary
MinIO/Garage on the same VPS vs hosted R2/Supabase differ in cost, backup, and
sizing. Accept the window constraint (redirect chain genuinely unusable), but
carry the selection as an explicit open decision with criteria (single-binary?
same-VPS? backup story?) rather than dissolving it into "any".

Defended non-omissions: QField/Mapeo (map-first, poor fit for form-first —
correctly deprioritized); Electric variants (covered conceptually);
k3s/Coolify (overkill — correctly excluded). Promote the two brief-direct gaps
from "recorded gaps" to "open decisions with criteria".

### M8 — O3 satisfied by E1; framing gaps, not honesty gaps (O3)

E1 (attachments deprecation → built-in helpers + migration notes, C08) is a
genuine evolution chain with direct consequence — O3's "at least one chain"
satisfied by E1 alone. E2/E3 honestly presented as process/marker evidence;
S15's chrome-dominated capture correctly refused as a quote source. Good
epistemic hygiene, upheld.

Framing gaps: the attachment helpers' ALPHA status with per-SDK minima (S08)
is the photo pipeline's newest, least-stable dependency — the component most
likely to regress under V3 load — but recorded as a list, not framed as the
regression risk it is. The pre-1.0 warning (C03: "NOT recommended for
production critical applications") is stronger than the draft's "acceptable
with pinning + runbook" digests: pinning delays migration churn but accumulates
unpatched-bug exposure — state the trade-off. Neither needs new sources.
A demand for "one more issue/fix with commit" would be INVALID — window finite,
E1 satisfies, absence honestly declared.

### M9 — Conditions/alternatives cohere; two internal tensions (O5)

(a) "Per-field LWW and deletes-win hold only inside the stated policy" vs P2
presenting them as governing design: if they are PowerSync naive defaults (C01)
that the custom policy OVERRIDES (scoped deletes-win, monotonic approvals),
the condition should say "the naive defaults hold only until the custom policy
replaces them". As written, a reader cannot tell whether LWW/deletes-win are
the design or the hazard. Resolve in favor of: defaults = hazard; custom
policy = design.

(b) Alternative (d) "PocketBase + hand-rolled outbox ... with a dated migration
to (a)/(b)/(c)" understates cost: migrating a hand-rolled queue to PowerSync/
CouchDB is a client sync-layer REWRITE (new op model, new conflict UX, data
migration), not an upgrade. Either cost it as a rewrite or demote (d) to
"prototype-only, unmigrated data discarded". Related: missing alternative (e)
managed ODK Cloud / PowerSync Cloud start (M7a) belongs in the retained set.

Missing-open-decision rollup for the reviser: ODK-vs-custom trigger threshold
("hard custom-UX requirement" is vague — name 2–3 concrete triggers, e.g.
non-form capture flow, custom conflict UI beyond review queue, app-store
distribution need); photo retention/EXIF policy (named as decision, correctly
unresolved); device provisioning (QR/adb observed S04 at nav level — adequate
pointer, needs no more at this stage).

## Minor findings

- m1. "Apache 2.0" for Central claimed via "ecosystem corroboration", not a
  fetched license file — one-line unsourced claim; verify or drop.
- m2. "Single ~11–12MB binary" is the ZIP size, not the unpacked binary —
  minor imprecision; say "≈11–12MB downloads".
- m3. "$5–20 VPS" pricing unsourced and mutable — mark as rough/stale-prone
  or drop the numbers.
- m4. PouchDB "v9.0.0" correctly flagged as site chrome (C04 confirms) — good;
  keep the flag wherever the version is cited.
- m5. "CouchDB cluster or single node" hosting mentioned without a source —
  minor; the single-node shape is all the brief needs.
- m6. W3C "polite/assertive live-region" terms correct but subpage content
  never fetched (C06) — nav-derived checklist; adequate for planning, flag
  before building pass/fail criteria (see M4/V4).
- m7. P1 "already-covered in intent but corrected in mechanism" and P3 "half
  already-covered" are honest nuances that blur the O4 taxonomy count — keep
  the nuance, pick one primary label each (both: CORRECTION).
- m8. "Never ship ... toggle-only testing as specified in the thin plan" —
  "toggle-only" is a fair paraphrase of P6, not a strawman. Defended.
- m9. Marketing claims ("2M users/250M submissions") correctly not relied upon
  — good; consider dropping from the final to avoid borrowed credibility.
- m10. Lifecycle note (Goal created, discovery frozen by reveal script) is
  procedural and not critic-verifiable — accept as stated; no finding.
- m11. Source bibliography timestamps (19:31–19:34Z) consistent with source-map
  access window — good; mutable drift flags (incl. S15 master-branch) honest.
- m12. Usage/billing null everywhere, immutable IDs, no silent rebind —
  honored in both stages; upheld.
- m13. Typo watch for reviser: PowerSync source spells it "reconcilliation"
  [sic] (C01) — do not propagate the misspelling into the final.

## Uncertainty and invalid-demand admissions

- U1. No Android platform source fetched by predecessor or critic. All
  client-platform comparative claims (M1) rest on general engineering knowledge
  in both stages. My demand for one Android source is valid; my own failure to
  fetch it (time prioritized to C01–C08 verification) leaves the point
  symmetric — a reviser with a fresh window should close it first.
- U2. PowerSync custom-resolution CrudEntry shape (S07) relied on truncated
  predecessor capture; field optionality (metadata/trackPrevious) less certain.
  The dead-letter-pattern grounding inherits this weakness — flagged, not
  fatal, since C01 independently confirms custom resolution exists as the
  escape hatch.
- U3. PocketBase S3-offload setting, ODK review-state/permission/backup
  behaviors, Central sizing, PowerSync Cloud/managed terms, MinIO/Garage
  behavior: all unobserved in both stages. Demands above are scoped to
  label-as-unverified or decide-with-criteria, never to assert content.
- U4. INVALID demands I considered and rejected: (i) "add a second issue/fix
  chain with commit" — E1 satisfies O3; (ii) "demote ODK-first" — no evidence
  supports flipping the best-evidenced recommendation; (iii) "execute V1–V6" —
  no runtime/sandbox in this stage by design, and the draft honestly separates
  proposed from executed; (iv) "repair the draft" — outside the critic recipe
  (critique only, no candidate repair).

## Proposed checks (no witness executed — no qualified sandbox)

P-C1. Byte-compare re-fetch: `curl -sL <each S-URL> | sha256sum` vs a
  predecessor-byte capture, to detect drift before the reviser relies on
  excerpts (spot-check C01/C08 sizes already done here: match / 12-byte drift).
P-C2. V3-setup consistency grep: any photo-size figure in validations must
  satisfy `≤ file-field cap` stated in setup (would have caught M6a).
P-C3. Disposition-label lint: every P disposition ∈ {correction, enhancement,
  user-decision, already-covered, rejected, uncertain} with exactly one primary
  label (would have caught M5a/M7-note-m7).
P-C4. Engine-scope lint: every sentence containing "LWW", "deletes-win",
  "deterministic winner", or "409" must name its engine in the same paragraph
  (would have caught M2).
P-C5. Observed-vs-built lint: every platform-capability sentence in P4/P5 must
  carry an (observed: S-ID/C-ID) or (proposed) tag (would have caught M4/M5b).
P-C6. Fresh-window fetches for the reviser, in priority order: (1) Android
  background-work/offline doc (closes M1/U1); (2) W3C subpages Validating +
  Notifications (closes V4 procedure); (3) ODK review-state/role docs or a
  verified "not publicly documented" note (closes M4); (4) PocketBase S3
  settings page (closes M3); (5) ODK Cloud + PowerSync Cloud export/lock-in
  terms (closes M7a).

## Lifecycle note

One fresh native Goal created for this assignment and verified active before
writing (see tool record, not a handwritten receipt); all science above
(critique, source map, evidence, index) saved before any terminal completion.
Method M07 v1 evidence-on-demand, control arm: conventional draft + source
bibliography + complete own-arm captured evidence, normal navigation. No nested
agents, no repo/canon edits, no executable downloads, no counterpart/campaign/
evaluator/history reads, no account/config changes. Usage/billing: unobserved
(null). Per-stage deadline 2026-10-09T19:51:18Z; whole-arm deadline
2026-10-09T20:30:16Z.
