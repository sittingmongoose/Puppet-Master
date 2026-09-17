# Thirteen continuation-4 corrections

Each entry names the existing promise or contradiction it repairs, the passage it cites, and what changed. That is what
makes each one a correction rather than a feature. Nineteen correction-shaped candidates were adjudicated; two pairs
merged, one was covered by existing canon, one was rejected as inside a continuation-3 rejection, and two were
reclassified as product choices and answered separately as DL-056 and DL-057.

## Record 1 — restore object verification depth (C4C-01, claude; C4G-01, glm53)

Repairs JJI-008 (`Plans/Jujutsu_Integration.md`), whose acceptance criterion already required the drill to "restore the
selected historical operation with object verification" and whose receipt already gated activation-eligible outcomes to
`object_closure_result: complete`, but which defined the phrase nowhere; a reachability-only pass satisfied the words.
Change: JJI-008 defines the term as full object-store integrity verification, and the receipt requires
`object_verification_depth` referencing the Backup owner's `integrity_verification_level` enum, with `complete`
admissible only at `full_data_read_passed`. The two arms reached it from opposite directions and both started from the
same frozen discovery lead; three arms with the same lead did not convert it.

## Record 2 — divergent change representability (C4H-05, claude-hicap; muse13 concurring)

Repairs SCS-017 and JJI-003. Canon contemplated divergence in owner prose, inside an unapproved capability and in
future-test lists, while every closed enum that would have to represent it omitted it. Change: `node_state` gains
`divergent`, `graph_states` gains it appended, and `change_divergent_ambiguous_target` is minted. Refusal is the whole
obligation; no convergence command is landed.

## Records 3 and 6 — native toolchain identity and the certification matrix (C4D-01, deepseek41; C4U-02, union)

Repairs JJI-008's "version-compatible" and JJI-006's "current certification evidence". Neither closure record bound any
version and the certification refs were opaque with no scenario axis. Change: one shared `native_toolchain_identity`
block serves the closure record, the restore receipt and the effective-capability snapshot, and the snapshot gains a
nine-row `certified_scenarios` matrix on JJI-022's pattern.

## Records 4 and 5 — store pointer resolution (C4M-02, muse13; C4C-02, claude)

Repairs JJI-008 and SCS-014. The closure recorded the result of discovery and nothing about how discovery resolved, and
`isolated_verification` was typed `{"const": true}` with nothing constraining what made it true. Change: every hop is
recorded with the base it resolved against, the resolving environment is recorded as non-secret references or explicit
absence, and a claimed isolation admits no pointer that left the boundary.

## Record 7 — a read is proven non-mutating (C4H-02, claude-hicap; C4U-01, union)

Repairs JJI-008 and section 3.3. The obligation lived only in an `x-puppet-master-assertions` prose string with the
qualifier "where required" and no field behind it. Change: `read_pinning` requires an exact pinned operation and an
ignore-working-copy mode, the receipt records the operation-head set before and after, and a verification-authored
operation is a typed failure. Both arms keep the read branch's null authority, which is the side continuation 3 took.

## Record 8 — machine-local store entries (C4C-03, claude)

Repairs JJI-008 and SCS-014's sanitization clause, neither of which reached the entries inside the store tree that are
neither history nor configuration. Change, narrowed to three obligations: source-traced classification against the
pinned version, machine-local and ephemeral entries never restored as active state, and an unrecognized entry yielding
`partial`. The enumerated list is open question `q-008`.

## Record 9 — GC fence coverage (C4C-05, claude)

Repairs JJI-004 and SCS-014. `gc_fence_outcome: held_during_capture` stated that the fence held and never what it
covered. Change: `gc_fence_covered_paths` enumerates the writer paths with evidence, and a complete capture admits no
uncovered or unknown path. One supporting leg was withdrawn before landing; see the evidence note below.

## Record 10 — no canonical command reaches an interactive editor (C4H-01, claude-hicap)

Repairs JJI-003 and SCS-015, which claim split is preserved while `command_target` cannot express a non-interactive
split. Change, narrowed to the refusal: `interactive_editor_session_required` and a criterion that no canonical command
reaches an invocation that can start an interactive editor. The content-selection vocabulary that would make split
executable is an optional capability and is not landed.

## Record 11 — the recovery action floor (C4H-03, claude-hicap)

Repairs Contracts_V0's recovery-action rule and JJI-006. `allowed_action_ids` had no floor, so an empty array validated
for a quarantined repository. Change: a conditional requires operation log and operation show for the quarantine and
staleness reason codes, both already in the frozen inventory. Servability is open question `q-010`.

## Record 12 — bookmark tracking is local (C4H-04, claude-hicap)

Repairs an inconsistency inside a single shipped record: the schema pinned track and untrack to `transport_mutation`
with a required credential lease while the fixtures recorded `permission.scope: local_mutation`. Change: both move to
`local_mutation` with a null credential lease, keeping every other fence.

## Record 13 — closure completeness has a decision procedure (C4M-01, muse13)

Repairs JJI-008 and SCS-014, which stated the ends of completeness and named no procedure. Change: a
`closure_expansion` record with four verified stages, four typed blockers and a dependency-safe materialization order.

## Currentness re-check against current main

Every cited passage was re-read on `main` at `a6162b559b` before any edit. Seventeen of forty-six cited line numbers had
drifted since the frozen adjudication snapshot and were re-verified individually; no cited text had changed, and neither
F106 to F109 nor DL-051 to DL-054 covered any of the thirteen. The re-verification is recorded in
`~/PM-Experiments/c4-candidates-20260917/ADJUDICATION_PART1.md` and its hash manifest.

## Evidence

The twenty-three run-state evidence files the nineteen candidates cite live outside this repository under
`/home/sittingmongoose/PM-Experiments/jujutsu-followup-20260911/continuation4/runs/`. All twenty-three were re-hashed
against the adjudication bundle's record with zero mismatches; the bundle that carries their paths and hashes is
`reports/jujutsu-research-2026-09-11/continuation4/adjudication/`, which is in this repository. The landing bundle's
`evidence-receipts.json` names what each file actually supports.

One supporting leg was withdrawn before landing and is recorded here so it is not cited again. The adjudication bundle's
own amendment withdraws Arm C's claim that jj's op-store GC with `SystemTime::UNIX_EPOCH` "preserves nothing by
recency": `remove_file_if_not_new` keeps a file when its mtime is newer than `keep_newer`, so `UNIX_EPOCH` removes
nothing. Record 9 stands on its lock-coverage leg alone and nothing in this wave cites the withdrawn claim.

Targets: `Plans/Jujutsu_Integration.md`, `Plans/Source_Control_System.md`, `Plans/Decision_Log.md`.
