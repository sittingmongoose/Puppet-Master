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
