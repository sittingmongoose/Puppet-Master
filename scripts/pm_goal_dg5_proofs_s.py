"""DG5 written proofs for goal_run.started (owner: helper B, SPLIT.md section 2).

PROOFS = {row: dict(kind, argument, depends_on=[rows], sites=[(path, line)],
families=['goal_run.started'])}. pm_goal_dg5_justified re-binds each proof to
the exact source bytes of its cited sites; the matrix closes a proof row only
once every dependency is closed (least fixpoint grounded in killed rows).
"""
READERS = 'scripts/pm_goal_dg_s_readers.py'
START = 'scripts/pm_goal_dg_s_start.py'
R837 = 'dg5/site/pm_goal_dg_s_readers.py:837'
R258 = 'dg5/site/pm_goal_dg_s_readers.py:258'

PROOFS = {
    'dg5/site/pm_goal_dg_s_readers.py:834': dict(
        kind='entailment',
        families=['goal_run.started'],
        depends_on=[R837, R258],
        sites=[(READERS, 834), (READERS, 837), (READERS, 258), (READERS, 191), (READERS, 224),
               (READERS, 200), (START, 1109)],
        argument=(
            "In every read_current that reaches h_current_start, the original was acquired first by "
            "original_started, whose :258 require makes every relations() check true for the presented "
            "retained graph. relations binds the transition-after commitment to the authenticated event: "
            "payload/after_revision (goal_run_revision == after.body_revision, :224) and "
            "native/body_revision (after == before + 1, :191), binds candidate/commit/origin/head "
            "after_body selectors to after.body, and resolve/after_body (:200) resolves that selector "
            "against Storage custody. The update carrying the commitment is digest-pinned by "
            "d01_origin/update and head/update, whose own selectors are resolved in the same acquisition, "
            "so the presented commitment is the issued one; at issuance StartOwner.body_commitment sets "
            "body_revision from the very body its body selector names (pm_goal_dg_s_start.py:1109). With "
            ":837 passing, the presented native body is byte-identical to that after body (digest join), "
            "so its record revision equals after.body_revision and :834 cannot refuse. Any defect that "
            "makes :834's comparison false therefore refuses at :258 or :837 first in the same complete "
            "call; :834 has no single-defect witness through read_current.")),
    'dg5/site/pm_goal_dg_s_readers.py:835': dict(
        kind='entailment',
        families=['goal_run.started'],
        depends_on=[R837, R258],
        sites=[(READERS, 835), (READERS, 837), (READERS, 258), (READERS, 189), (READERS, 190),
               (READERS, 200), (START, 1109)],
        argument=(
            "Same acquisition as :834: relations (required at :258) binds the after commitment's status "
            "to 'running' and its activation state to 'active' (native/after_status :189, "
            "native/after_activation :190), the commitment is digest-pinned to issuance as for :834, and "
            "at issuance its status fields are copied from the body its selector names "
            "(pm_goal_dg_s_start.py:1109-1110). :835 compares the presented native body's own status and "
            "activation state, both inside the body record that :837 digests live: any body whose status "
            "or activation state differs from the after body's differs in bytes, so :837 refuses in the "
            "same complete call. With :837 passing the presented body is the after body, whose status is "
            "'running' and activation state 'active', so :835 cannot refuse alone through read_current.")),
}

STORAGE = 'scripts/pm_goal_test_storage.py'
WORLD_PY = 'scripts/pm_goal_dg_s_world.py'
PROOFS.update({
    'dg5/site/pm_goal_dg_s_start.py:848': dict(
        kind='entailment', families=['goal_run.started'],
        depends_on=['dg5/site/pm_goal_dg_s_start.py:847'],
        sites=[(START, 848), (START, 847), (START, 183)],
        argument=(
            "848 compares the stored StartControl epoch to 0 on the same cell value that :847 has just "
            "required, with only pending_candidate nulled, to be identical to the birth StartControl, "
            "whose record epoch is fixed at 0 when NativeOwner.birth_run issuing it "
            "(pm_goal_dg_s_start.py:183). Any epoch other than 0 therefore refuses at :847 first in the "
            "same entry_joins call; with :847 passing the epoch is 0, so :848 has no single-defect "
            "witness through commit_start.")),
    'dg5/site/pm_goal_dg_s_start.py:849': dict(
        kind='entailment', families=['goal_run.started'],
        depends_on=['dg5/site/pm_goal_dg_s_start.py:847'],
        sites=[(START, 849), (START, 847), (START, 185)],
        argument=(
            "Same cell and same :847 identity as :848: the birth StartControl record is issued with "
            "committed_start=None (pm_goal_dg_s_start.py:185), and :847's base nulls only "
            "pending_candidate, so a non-None committed_start refuses at :847 before :849 is evaluated. "
            "With :847 passing, committed_start is None and :849 cannot refuse through commit_start.")),
    'dg5/native/body_revision/number': dict(
        kind='entailment', families=['goal_run.started'],
        depends_on=['dg5/producer/goal_run_revision/number'],
        sites=[(START, 240), (START, 931), (START, 977), (START, 1000), (START, 826)],
        argument=(
            "Every complete call that reaches NativeOwner.after_images does so inside commit_start: "
            "producer_submission (called at :977) first computes goal_run_revision as NR.uint64 of the "
            "same native before revision + 1 at :931, and only then candidate() (:1000) calls "
            "after_images, whose :240 computes NR.uint64 of that identical value. The prepared-submission "
            "path skips producer_submission only for an operation whose earlier commit_start already ran "
            "it at the same before revision, which :826 re-binds to the birth body on the retry. So "
            "whenever :240 runs, before + 1 is already known uint64-representable and :240 cannot be the "
            "first refusal.")),
    'dg5/projector/now/date-time': dict(
        kind='construction', families=['goal_run.started'],
        depends_on=[],
        sites=[(READERS, 632), (STORAGE, 741), (STORAGE, 745)],
        argument=(
            "The only value ever passed at readers:632 is the return of Storage._tick(), which returns "
            "format_ms(clock_last_ms); format_ms itself returns only text already accepted by "
            "NR.storage_time at 'clock/format' (pm_goal_test_storage.py:741-745), the same shared "
            "storage-time grammar readers:632 applies. A formatting refusal therefore happens inside "
            "_tick in shared Storage code and never reaches :632, so the re-check cannot refuse in any "
            "complete family call.")),
    'dg5/site/pm_goal_dg_s_world.py:306': dict(
        kind='construction', families=['goal_run.started'],
        depends_on=[],
        sites=[(WORLD_PY, 306), (START, 560)],
        argument=(
            "Context.identity() is reached in this family's complete calls only from entry_joins of a "
            "world built by StartWorld.issue_sources, whose step 2 binds ctx.workgraph_sha256 from the "
            "installed graph (pm_goal_dg_s_start.py:560) before native birth and long before any "
            "commit_start or reader entry can run. Binder.bind likewise only substitutes an identity "
            "when the hash is already bound. No complete family call can present a Context whose "
            "workgraph_sha256 is still None, so :306 cannot refuse.")),
})

SOURCE = 'scripts/pm_goal_test_source.py'
PROOFS.update({
    'dg5/site/pm_goal_dg_s_readers.py:655': dict(
        kind='entailment', families=['goal_run.started'],
        depends_on=['dg5/site/pm_goal_dg_s_readers.py:654', R258],
        sites=[(READERS, 655), (READERS, 654), (READERS, 651), (READERS, 321), (SOURCE, 365)],
        argument=(
            ":655 is evaluated only after :654 has required the projection complete. "
            "GenericSource.project reports complete only with no halt and no snapshot defect "
            "(pm_goal_test_source.py:365). The snapshot was acquired from the same Storage immediately "
            "before original_started succeeded at readers:651, so the start frame is retained and "
            "readable; acquisition scans every retained segment group in sequence and appends each "
            "non-defect row, and any defect truncating or preceding that row makes the projection "
            "incomplete at :654 first. The projector's select matches the event's ctx project/run, "
            "which relations (:258) binds, the retained map is keyed by that event id, and the reducer "
            "sets state['started'] for exactly that row (readers:321). A complete projection therefore "
            "always has a started state, and :655 cannot be the first refusal in replay.")),
    'dg5/site/pm_goal_dg_s_readers.py:792': dict(
        kind='construction', families=['goal_run.started'],
        depends_on=[],
        sites=[(READERS, 792), (READERS, 783), (READERS, 763)],
        argument=(
            "In every reader body, Storage generations move only inside the named synchronous hooks: "
            "the helpers acquire, read, decode and issue in-memory originals, and perform no Storage "
            "transaction. StartedReaders._hook brackets each hook call with the exact commit-generation "
            "and cell-generation deltas and adds them to self._delta (readers:763-769), and _passive "
            "snapshots both generations before the body runs (readers:783-784). The finally comparison "
            "at :792 is therefore an identity over the modeled hook transitions of this family: the "
            "measured generation movement is exactly the sum the hooks were charged, so it cannot "
            "refuse in a complete reader call.")),
})

PROOFS.update({
    'dg5/site/pm_goal_dg_s_start.py:1360': dict(
        kind='construction', families=['goal_run.started'],
        depends_on=[],
        sites=[(START, 1360), (START, 1343), (START, 1357)],
        argument=(
            "recover_start is passive by construction: after snapshotting commit_generation at :1342 "
            "it only reads Storage cells, the reservation state and first custody "
            "(pm_goal_dg_s_start.py:1343-1357), issuing no transaction, append or pack write on any "
            "path, and its own docstring and the S1 recover cases pin that it never writes. No Storage "
            "generation can move between the snapshot and the :1360 comparison inside one recover_start "
            "call, so the check cannot refuse.")),
})
