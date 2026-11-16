"""DG5 written proofs for goal.updated rows that no single-defect negative can kill alone.

Loaded by pm_goal_dg5_justified.written_proofs and re-bound there to the exact source bytes of
every cited site. A proof closes its row only while every dependency row is closed in the same
family (matrix least fixpoint). Nothing here earns kill credit.
"""
U = 'scripts/pm_goal_dg_u_owners.py'
SRC = 'scripts/pm_goal_test_source.py'
SITE = 'dg5/site/pm_goal_dg_u_owners.py:'

PROOFS = {
    SITE + '1860': dict(
        kind='code-selection',
        families=['goal.updated'],
        depends_on=[SITE + '1861'],
        sites=[(U, 1858), (U, 1860), (U, 1861), (SRC, 283)],
        argument=(
            'EventInspector.inspect reaches :1860 only in the row-is-None branch (:1858-1861): the '
            'inspected event has no row in the acquired GenericSource snapshot. In that branch the '
            'checker can never accept: if snap.defect is not None, :1860 refuses with source_defect; '
            'otherwise the unconditional refuse at :1861 fires with event_unavailable. With :1860 '
            'cut, the same complete call still refuses at :1861 (the supplement '
            'U-DG5/N/inspect_source_defect witnesses the defect state: a custody defect halts '
            'GenericSource.acquire before the event, pm_goal_test_source.py:282-286). So :1860 is a '
            'code-selection predicate between two refusals of one branch, not an acceptance gate; '
            'no input is accepted by removing it. It closes by this proof once :1861 is closed.')),
    SITE + '1862': dict(
        kind='entailed-by-source-construction',
        families=['goal.updated'],
        depends_on=[],
        sites=[(U, 1858), (U, 1862), (SRC, 284), (SRC, 295), (SRC, 302)],
        argument=(
            ':1862 requires snap.defect is None or snap.defect[1] > row.position for the row '
            'selected at :1858 from snap.rows. GenericSource.acquire (pm_goal_test_source.py) '
            'constructs snap.rows halt-before-defect on every defect path: a custody defect '
            'records (code, position, event) and returns without appending that row (:282-286); '
            'a frame-tail or watermark defect records the next position, past every appended row '
            '(:293-297); a duplicate identity records the duplicate row position and truncates '
            'rows before it (:301-303). Positions are assigned 0..n-1 in append order (:278-290), '
            'so every row present in snap.rows has position < defect[1] whenever a defect exists. '
            'No complete inspect call can present a row at or after its snapshot defect, so :1862 '
            'can never refuse alone; it restates the acquisition invariant at the consumer.')),
    SITE + '1918': dict(
        kind='entailed-by-installation-graph',
        families=['goal.updated'],
        depends_on=[SITE + '496'],
        sites=[(U, 496), (U, 1854), (U, 1909), (U, 1917), (U, 1918)],
        argument=(
            ':1918 requires the final installation graph to equal the witness graph recorded at '
            ':1909 from w.installation.current(). Both reads sit behind require_installed in the '
            'same complete inspect call (the installation helper at :1854 and the final call at '
            ':1917), and require_installed refuses unless the cell graph equals the one static '
            'graph_sha256() of the loaded resource graph (:496). So whenever :1918 is reached, '
            'the witness graph and the final graph both equal that one value; no complete call '
            'can make :1918 refuse alone. It closes by this proof once :496 is closed.')),
    SITE + '1785': dict(
        kind='entailed-by-progress-schema',
        families=['goal.updated'],
        depends_on=['dg5/dgu/physical/logical/schema'],
        sites=[(U, 1783), (U, 1785), (U, 1786), ('Plans/goal_update_command_custody.schema.json', 1279)],
        argument=(
            'publish at :1785 requires phase in (event_ready, event_unknown) on the head progress '
            'record, after the event_issued replay return (:1783). The record reached publish only '
            'through read_progress -> unwrap_row, whose whole-root StorageProgress validation '
            '(row dg5/dgu/physical/logical/schema) admits exactly eight phase shapes '
            '(Progress oneOf, Plans/goal_update_command_custody.schema.json:1279): producer_input '
            'is an object only in event_ready, event_unknown and event_issued, and null in every '
            'other phase. So a record that fails :1785 always has producer_input null and the very '
            'next statement (:1786-1787) validates that null candidate against ProducerInput and '
            'refuses; publish can never accept by removing :1785. The single-defect attempt '
            '(event_ready record resealed as body_committed) is refused by that same schema shape. '
            'It closes by this proof once the physical logical schema row is closed.')),
    SITE + '1801': dict(
        kind='entailed-by-storage-receipt',
        families=['goal.updated'],
        depends_on=[],
        sites=[(U, 1797), (U, 1801), ('scripts/pm_goal_test_owner_adapters.py', 547),
               ('scripts/pm_goal_test_storage.py', 1544), ('scripts/pm_goal_test_storage.py', 1567),
               ('scripts/pm_goal_test_storage.py', 1631)],
        argument=(
            ':1801 compares the first receipt sequence with the stored event sequence from the '
            'same append: AppendOwner.append_original issues the first receipt for the appended '
            'event and binds the returned OriginalHandle to (event_id, receipt); first_receipt '
            'and event resolve that one handle (pm_goal_test_owner_adapters.py:541-551) to '
            'Storage.receipt_of (the custody row _custody_row built from the append frame) and '
            'Storage.read_event (that same frame decoded). Both sequences are the append frame '
            'sequence of one event, so no complete publish call can make them differ; a Storage '
            'that disagreed with itself here would already refuse in its own frame/custody joins. '
            'No boundary exists between append_original and the two reads in publish.')),
    SITE + '663': dict(
        kind='entailed-by-compact-row-shape',
        families=['goal.updated'],
        depends_on=[],
        sites=[(U, 649), (U, 663), ('scripts/pm_goal_test_storage.py', 61)],
        argument=(
            ':663 requires the payload_ref form of a physical row to fit CAP = STORED_PART_CAP '
            '= 16384 (pm_goal_test_storage.py:61). That form is built only at :654-662: record is '
            'null and every other field is a short literal or a 64-hex digest - schema_id and '
            'schema_version consts, logical_schema_id/version from the owner wrapper (GoalBodyOwner '
            'IDS and UpdateSourceOwner._wrap literals, each under 50 bytes), owner_identity_sha256 '
            'and value_sha256 (64 each), source_lifetime (bound_thread/authority_indefinite '
            'literals), and payload_ref {blake3 id 64, byte_size one uint64, the one MEDIA type}. '
            'The whole MessagePack row is bounded under 600 bytes for every wrapper any DG-U '
            'physical() caller builds (body row(), progress_writes, capture source/input, SIR '
            'terminal), an order of magnitude under the cap, so :663 can never refuse alone.')),
}
