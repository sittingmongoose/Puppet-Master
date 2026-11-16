"""DG5 written proofs for goal.updated rows that no single-defect negative can kill alone.

Loaded by pm_goal_dg5_justified.written_proofs and re-bound there to the exact source bytes of
every cited site. A proof closes its row only while every dependency row is closed in the same
family (matrix least fixpoint). Nothing here earns kill credit.
"""
U = 'scripts/pm_goal_dg_u_owners.py'
SRC = 'scripts/pm_goal_test_source.py'
SITE = 'dg5/site/pm_goal_dg_u_owners.py:'

PROOFS = {
    SITE + '1867': dict(
        kind='code-selection',
        families=['goal.updated'],
        depends_on=[SITE + '1868'],
        sites=[(U, 1865), (U, 1867), (U, 1868), (SRC, 283)],
        argument=(
            'EventInspector.inspect reaches :1867 only in the row-is-None branch (:1865-1868): the '
            'inspected event has no row in the acquired GenericSource snapshot. In that branch the '
            'checker can never accept: if snap.defect is not None, :1867 refuses with source_defect; '
            'otherwise the unconditional refuse at :1868 fires with event_unavailable. With :1867 '
            'cut, the same complete call still refuses at :1868 (the supplement '
            'U-DG5/N/inspect_source_defect witnesses the defect state: a custody defect halts '
            'GenericSource.acquire before the event, pm_goal_test_source.py:282-286). So :1867 is a '
            'code-selection predicate between two refusals of one branch, not an acceptance gate; '
            'no input is accepted by removing it. It closes by this proof once :1868 is closed.')),
    SITE + '1869': dict(
        kind='entailed-by-source-construction',
        families=['goal.updated'],
        depends_on=[],
        sites=[(U, 1865), (U, 1869), (SRC, 284), (SRC, 295), (SRC, 302)],
        argument=(
            ':1869 requires snap.defect is None or snap.defect[1] > row.position for the row '
            'selected at :1865 from snap.rows. GenericSource.acquire (pm_goal_test_source.py) '
            'constructs snap.rows halt-before-defect on every defect path: a custody defect '
            'records (code, position, event) and returns without appending that row (:282-286); '
            'a frame-tail or watermark defect records the next position, past every appended row '
            '(:293-297); a duplicate identity records the duplicate row position and truncates '
            'rows before it (:301-303). Positions are assigned 0..n-1 in append order (:278-290), '
            'so every row present in snap.rows has position < defect[1] whenever a defect exists. '
            'No complete inspect call can present a row at or after its snapshot defect, so :1869 '
            'can never refuse alone; it restates the acquisition invariant at the consumer.')),
    SITE + '1925': dict(
        kind='entailed-by-installation-graph',
        families=['goal.updated'],
        depends_on=[SITE + '503'],
        sites=[(U, 503), (U, 1861), (U, 1916), (U, 1924), (U, 1925)],
        argument=(
            ':1925 requires the final installation graph to equal the witness graph recorded at '
            ':1916 from w.installation.current(). Both reads sit behind require_installed in the '
            'same complete inspect call (the installation helper at :1861 and the final call at '
            ':1924), and require_installed refuses unless the cell graph equals the one static '
            'graph_sha256() of the loaded resource graph (:503). So whenever :1925 is reached, '
            'the witness graph and the final graph both equal that one value; no complete call '
            'can make :1925 refuse alone. It closes by this proof once :503 is closed.')),
    SITE + '1792': dict(
        kind='entailed-by-progress-schema',
        families=['goal.updated'],
        depends_on=['dg5/dgu/physical/logical/schema'],
        sites=[(U, 1790), (U, 1792), (U, 1793), ('Plans/goal_update_command_custody.schema.json', 1279)],
        argument=(
            'publish at :1792 requires phase in (event_ready, event_unknown) on the head progress '
            'record, after the event_issued replay return (:1790). The record reached publish only '
            'through read_progress -> unwrap_row, whose whole-root StorageProgress validation '
            '(row dg5/dgu/physical/logical/schema) admits exactly eight phase shapes '
            '(Progress oneOf, Plans/goal_update_command_custody.schema.json:1286): producer_input '
            'is an object only in event_ready, event_unknown and event_issued, and null in every '
            'other phase. So a record that fails :1792 always has producer_input null and the very '
            'next statement (:1793-1794) validates that null candidate against ProducerInput and '
            'refuses; publish can never accept by removing :1792. The single-defect attempt '
            '(event_ready record resealed as body_committed) is refused by that same schema shape. '
            'It closes by this proof once the physical logical schema row is closed.')),
    SITE + '1808': dict(
        kind='entailed-by-storage-receipt',
        families=['goal.updated'],
        depends_on=[],
        sites=[(U, 1804), (U, 1808), ('scripts/pm_goal_test_owner_adapters.py', 629),
               ('scripts/pm_goal_test_storage.py', 1544), ('scripts/pm_goal_test_storage.py', 1567),
               ('scripts/pm_goal_test_storage.py', 1631)],
        argument=(
            ':1808 compares the first receipt sequence with the stored event sequence from the '
            'same append: AppendOwner.append_original issues the first receipt for the appended '
            'event and binds the returned OriginalHandle to (event_id, receipt); first_receipt '
            'and event resolve that one handle (pm_goal_test_owner_adapters.py:623-633) to '
            'Storage.receipt_of (the custody row _custody_row built from the append frame) and '
            'Storage.read_event (that same frame decoded). Both sequences are the append frame '
            'sequence of one event, so no complete publish call can make them differ; a Storage '
            'that disagreed with itself here would already refuse in its own frame/custody joins. '
            'No boundary exists between append_original and the two reads in publish.')),
    SITE + '670': dict(
        kind='entailed-by-compact-row-shape',
        families=['goal.updated'],
        depends_on=[],
        sites=[(U, 656), (U, 670), ('scripts/pm_goal_test_storage.py', 61)],
        argument=(
            ':670 requires the payload_ref form of a physical row to fit CAP = STORED_PART_CAP '
            '= 16384 (pm_goal_test_storage.py:61). That form is built only at :661-669: record is '
            'null and every other field is a short literal or a 64-hex digest - schema_id and '
            'schema_version consts, logical_schema_id/version from the owner wrapper (GoalBodyOwner '
            'IDS and UpdateSourceOwner._wrap literals, each under 50 bytes), owner_identity_sha256 '
            'and value_sha256 (64 each), source_lifetime (bound_thread/authority_indefinite '
            'literals), and payload_ref {blake3 id 64, byte_size one uint64, the one MEDIA type}. '
            'The whole MessagePack row is bounded under 600 bytes for every wrapper any DG-U '
            'physical() caller builds (body row(), progress_writes, capture source/input, SIR '
            'terminal), an order of magnitude under the cap, so :670 can never refuse alone.')),
    SITE + '899': dict(
        kind='code-selection',
        families=['goal.updated'],
        depends_on=[SITE + '901'],
        sites=[(U, 898), (U, 899), (U, 901)],
        argument=(
            'terminalize final boundary: :899 requires the re-read head epoch and snapshot key '
            'unchanged; :901 requires the re-read snapshot wrapper sha to equal the terminal '
            'commitment over the first snapshot. Any head movement that fails :899 selects a '
            'different epoch snapshot whose record carries that different progress_epoch, so its '
            'wrapper bytes and sha also differ and :901 refuses; a same-epoch snapshot with the '
            'same wrapper passes both. With :899 cut, every reachable head movement still refuses '
            'at :901, so :899 selects the exact code and never gates acceptance alone.')),
    SITE + '969': dict(
        kind='code-selection',
        families=['goal.updated'],
        depends_on=[SITE + '970'],
        sites=[(U, 925), (U, 969), (U, 970)],
        argument=(
            'HITL capture: :969 requires the proposal target storage id to be a hyphenated '
            '8-4-4-4-12 hex UUID (_uuid_ok, :925); :970 requires it to equal this Storage '
            'instance id, which Storage creates as a hyphenated UUID spelling. A malformed '
            'spelling can never equal that id, so with :969 cut the same call still refuses at '
            ':970 (the authored target_uuid_malformed witness); a well-formed foreign spelling '
            'passes :969 and is judged at :970 alone (U-DG5/N/hitl_foreign_storage_only). :969 '
            'selects the exact code and never gates acceptance alone.')),
    SITE + '1188': dict(
        kind='code-selection',
        families=['goal.updated'],
        depends_on=['dg5/site/pm_goal_test_storage.py:1657'],
        sites=[(U, 1187), (U, 1188), (U, 1195), ('scripts/pm_goal_test_storage.py', 1657)],
        argument=(
            'body.reserve final boundary: :1188 requires the re-read control record to equal the '
            'first-read control exactly. The reserve writes then go through Storage transact with '
            'expected=first-read control_version (:1195), whose CAS version check '
            '(pm_goal_test_storage.py:1657) refuses unless the current cell version is still that '
            'version. Storage transact is the only cell writer in every complete call and always '
            'increments a written cell version, so any reachable control change between the reads '
            'bumps the version and still refuses at the CAS with :1188 cut; an unchanged version '
            'means no write occurred and the record is the same. :1188 selects the exact code '
            'and never gates acceptance alone. It closes once the CAS row is closed.')),
    SITE + '1874': dict(
        kind='entailed-by-selected-event-schema-and-producer-join',
        families=['goal.updated'],
        depends_on=['dg5/dgu/inspect/event/schema', SITE + '1891'],
        sites=[(U, 1874), (U, 1876), (U, 1891),
               ('Plans/goal_updated_consumer_contracts.schema.json', 497)],
        argument=(
            ':1874 requires event_type goal.updated, the goal.updated payload_schema_id and '
            'scope_kind project. The SelectedActiveEvent schema validated two statements later '
            '(:1876, row dg5/dgu/inspect/event/schema) carries exactly those three consts on the '
            'same fields. With both cut, the frozen-producer join (:1891) still compares '
            'producer25(event) - the whole event minus Storage fields, including event_type and '
            'payload_schema_id - with the frozen producer_input, a genuine goal.updated '
            'ProducerInput whose metadata was built with those values (:1549-1557) and schema-'
            'validated at freeze; scope_kind project is likewise in that metadata. An event '
            'failing any :1874 conjunct therefore still refuses at the schema or at :1891 (and a '
            'non-goal payload shape fails the payload $ref or the body_receipt_request access at '
            ':1881). The authored other_family_event and a type-flipped goal.updated copy both '
            'witness those later refusals; :1874 never gates acceptance alone.')),
    SITE + '170': dict(
        kind='entailed-by-owner-schemas',
        families=['goal.updated'],
        depends_on=['dg5/dgu/sir/request/schema', 'dg5/dgu/sir/proposal/schema',
                    'dg5/dgu/sir/terminal/result/schema'],
        sites=[(U, 170), (U, 722), (U, 728), (U, 770), (U, 773), (U, 877)],
        argument=(
            'jcs key type (:170) is reached only from jcs(request) at :728, jcs(proposal) at '
            ':773, jcs(result) at :878 and the event_identity list at :237. The first three run '
            'only after their whole-root owner schemas validate the same value (:722 '
            'GoalUpdateRequestV2, :770 GoalUpdateProposalRequest, :877 the branch result): a '
            'non-string dict key is refused there first (witnessed: an int-keyed request refuses '
            'at dgu/sir/request/schema). The result dict is otherwise owner-built with literal '
            'keys, and the identity value is a list of literal and schema-validated strings with '
            'no dict at all. No complete call can present a non-string key to :170.')),
    SITE + '690': dict(
        kind='entailed-by-canonical-decode',
        families=['goal.updated'],
        depends_on=[],
        sites=[(U, 186), (U, 689), (U, 690), ('scripts/pm_goal_test_owner_adapters.py', 71),
               ('scripts/pm_goal_test_numrule.py', 185), ('scripts/pm_goal_test_numrule.py', 190),
               ('scripts/pm_event_numbers.py', 309), ('scripts/pm_event_numbers.py', 400)],
        argument=(
            'unwrap_row at :689 obtains wrapper only from NR.decode_event_value(raw), whose '
            'N.decode_storage_value returns a value only after requiring '
            'storage_value_bytes(value, EVENT_VALUE) == raw (pm_event_numbers.py:407-408). '
            'The owner msgpack at :186 is A.canonical, which is NR.event_value_bytes - the same '
            'N.storage_value_bytes(value, EVENT_VALUE) call. So whenever :690 is reached, '
            'msgpack(wrapper) is exactly the byte string decode already required to equal raw; '
            ':690 can never refuse alone. The authored noncanonical_pack_bytes case witnesses '
            'the decode refusal itself (dgu/physical/decode/numrule/physical_noncanonical); '
            'that shared decode call is not a DG5 cuttable site row, so no duplicate-set credit '
            'is claimed for it.')),
    SITE + '178': dict(
        kind='entailed-by-owner-schemas',
        families=['goal.updated'],
        depends_on=['dg5/dgu/sir/request/schema', 'dg5/dgu/sir/proposal/schema',
                    'dg5/dgu/sir/terminal/result/schema'],
        sites=[(U, 178), (U, 722), (U, 728), (U, 770), (U, 773), (U, 877)],
        argument=(
            'jcs value type (:178, the else branch for values that are not int/dict/list/str and '
            'not float, which :165 refuse()s first) has the same four call paths as :170. Every '
            'value in a schema-validated request, proposal or branch result is a JSON scalar, '
            'array or object by the schema types validated before jcs runs (witnessed: a bytes '
            'objective_text refuses at dgu/sir/request/schema/objective_text), the result dict '
            'is owner-built from those validated scalars, and the identity list holds strings '
            'only. No complete call can present another Python type to :178.')),
    SITE + '1842': dict(
        kind='code-selection',
        families=['goal.updated'],
        depends_on=['dg5/site/pm_goal_test_storage.py:1633'],
        sites=[(U, 1842), (U, 1843), ('scripts/pm_goal_test_storage.py', 1632),
               ('scripts/pm_goal_test_storage.py', 1633)],
        argument=(
            'EventInspector.request_for at :1842 requires the Storage event index entry to '
            'exist before calling storage.read_event(event_id) on the next line. read_event '
            'looks up the same index and requires the same entry at '
            'pm_goal_test_storage.py:1633 (read/event_unavailable). With :1842 cut, every '
            'unknown event still refuses there (the authored inspect_request_unknown_event '
            'chain witnesses exactly this), so :1842 selects the inspector code '
            'dgu/inspect/event_unavailable and never gates acceptance alone. It closes by '
            'this proof once the Storage read row is closed.')),
    'dg5/dgu/body/goal_objective_revision/schema': dict(
        kind='entailed-by-body-and-pending-schemas',
        families=['goal.updated'],
        depends_on=['dg5/dgu/body/goal_body_record/schema', 'dg5/dgu/body/reserve/pending/schema'],
        sites=[(U, 1099), (U, 1114), (U, 1231), (U, 1257),
               ('Plans/goal_body_custody.schema.json', 5), ('Plans/goal_body_custody.schema.json', 105),
               ('Plans/goal_body_custody.schema.json', 341)],
        argument=(
            'The storage_revision whole-root validation in GoalBodyOwner.row (dg5/dgu/body/'
            'goal_objective_revision/schema) is reached only from start and commit. At start '
            '(:1099-1114) the revision record is owner-built: goal_id and objective_text are the '
            'identical values the body record carries, bounded identically in the body and '
            'revision definitions (goal_body_custody.schema.json body :5 vs revision :105), '
            'and the body row() validation runs first in the same writes list; every other '
            'revision field is a constant (revision 1, change_source user_direct, null '
            'source/approval/prior) or computed (revision_hash, created_at from the same now '
            'the body record carries). At commit (:1231-1257) the record is the pending '
            'accepted_revision verbatim, already validated against the identical revision '
            'definition through the pending schema at reserve (pending.accepted_revision '
            'references the same revision definition, :341), and the after body row() again '
            'validates first. No complete call can make this row refuse while its two '
            'dependency rows hold; it never gates acceptance alone.')),
}
