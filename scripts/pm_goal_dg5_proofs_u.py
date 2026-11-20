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
        sites=[(U, 1804), (U, 1808), ('scripts/pm_goal_test_owner_adapters.py', 630),
               ('scripts/pm_goal_test_storage.py', 1544), ('scripts/pm_goal_test_storage.py', 1567),
               ('scripts/pm_goal_test_storage.py', 1631)],
        argument=(
            ':1808 compares the first receipt sequence with the stored event sequence from the '
            'same append: AppendOwner.append_original issues the first receipt for the appended '
            'event and binds the returned OriginalHandle to (event_id, receipt); first_receipt '
            'and event resolve that one handle (pm_goal_test_owner_adapters.py:624-634) to '
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
        sites=[(U, 186), (U, 689), (U, 690), ('scripts/pm_goal_test_owner_adapters.py', 72),
               ('scripts/pm_goal_test_numrule.py', 185), ('scripts/pm_goal_test_numrule.py', 190),
               ('scripts/pm_event_numbers.py', 309), ('scripts/pm_event_numbers.py', 400)],
        argument=(
            'unwrap_row at :689 obtains wrapper only from NR.decode_event_value(raw), whose '
            'N.decode_storage_value returns a value only after requiring '
            'storage_value_bytes(value, EVENT_VALUE) == raw (pm_event_numbers.py:400-401). '
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
    'dg5/dgu/source/capture/prepared_producer/schema': dict(
        kind='entailed-by-producer-construction',
        families=['goal.updated'],
        depends_on=[],
        sites=[(U, 235), (U, 1549), (U, 1609), (U, 1621),
               ('Plans/goal_update_command_custody.schema.json', 755),
               ('Plans/goal_update_command_custody.schema.json', 875)],
        argument=(
            'prepared_event (:1609-1621) validates a ProducerInput assembled only from the '
            'capture metadata (:1549-1559) and a placeholder payload: every metadata field '
            'is a schema constant (schema_id, version, scope_kind, event_type, payload_schema_id, '
            'redaction/replay policies, null run/node/attempt/causation/parent/migration), an '
            'event_identity output (:235, computed non-empty strings), a scope or actor value '
            'already bounded identically by the validated GoalUpdateRequestV2 (project/thread/'
            'actor maxLength 256), or the admission clock value; the payload carries the same '
            'bounded scope ids, integer revisions from the read-validated body, placeholder '
            '64-hex hashes, and acceptance fields copied from the read-validated source record. '
            'ProducerInput (:755) is ProducerMetadata (:875) plus that payload, with no bound '
            'tighter than its sources at any copied field, so no complete capture call can make '
            'this row refuse alone.')),
    'dg5/dgu/producer/freeze/producer_input/schema': dict(
        kind='entailed-by-producer-construction',
        families=['goal.updated'],
        depends_on=[],
        sites=[(U, 1469), (U, 1490), (U, 1752), (U, 1770), (U, 1777), (U, 1778), (U, 1779),
               ('Plans/goal_update_command_custody.schema.json', 755),
               ('Plans/goal_update_command_custody.schema.json', 1711)],
        argument=(
            'freeze (:1752-1770) validates a ProducerInput whose metadata half is the stored '
            'progress producer_metadata verbatim (validated as ProducerMetadata when the '
            'progress snapshot was written and again on every read) and whose payload is '
            'assembled only from the read-validated body receipt (revision integers and '
            'pattern hashes), the read-validated accepted revision, and acceptance fields of '
            'the read-validated source record, each bounded identically in ProducerInput '
            '(:755). The event_identity join (:1765) has already refused any metadata/payload '
            'identity mismatch before validation. The unchanged candidate becomes the required '
            'producer_input in event_ready Progress, which uses the same ProducerInput '
            'definition. Disabling only the first schema check reached this exact later '
            'Progress validation. Restoration repeated the original refusal.')),
    'dg5/dgu/producer/publish/producer_input/schema': dict(
        kind='entailed-by-producer-construction',
        families=['goal.updated'],
        depends_on=['dg5/dgu/producer/freeze/producer_input/schema'],
        sites=[(U, 1460), (U, 1461), (U, 1788), (U, 1792), (U, 1793), (U, 1794), (U, 1800),
               ('Plans/goal_update_command_custody.schema.json', 755),
               ('Plans/goal_update_command_custody.schema.json', 1711),
               ('Plans/goal_update_command_custody.schema.json', 1797),
               ('Plans/goal_update_command_custody.schema.json', 2385)],
        argument=(
            'publish (:1793-1794) validates a verbatim deepcopy of the frozen progress '
            'producer_input, which freeze already validated against the identical '
            'ProducerInput definition (:755) before the snapshot was written and which every '
            'progress read revalidates under the StorageProgress root. The identical value '
            'cannot newly fail the identical root. The final candidate equality check '
            'also compares its unchanged type-exact value against the read-validated frozen '
            'input. It refused the same invalid document with only the schema check disabled.')),
    'dg5/dgu/producer/publish/publication/schema': dict(
        kind='entailed-by-producer-construction',
        families=['goal.updated'],
        depends_on=[],
        sites=[(U, 1469), (U, 1490), (U, 1805), (U, 1809), (U, 1814), (U, 1815), (U, 1816),
               ('scripts/pm_goal_test_owner_adapters.py', 630), ('scripts/pm_goal_test_storage.py', 598),
               ('Plans/goal_update_command_custody.schema.json', 151),
               ('Plans/goal_update_command_custody.schema.json', 1886)],
        argument=(
            'publish (:1809-1814) validates an OriginalPublication assembled only from the '
            'append result the same call just read back: event_id from the frame-validated '
            'stored event, first_append_receipt and original_event_value_commitment verbatim '
            'from AppendOwner.first_receipt (constructed by Storage receipts_from_commit, '
            'pm_goal_test_storage.py:598, in exactly the AppendReceipt/commitment shapes '
            'OriginalPublication references, :151), and original_append_result copied from '
            'that receipt plus the stored sequence. Every field is either a constant-shape '
            'storage output or copied verbatim from it. During the original recovery call '
            'after the first receipt, disabling only this check sends the unchanged invalid '
            'publication to Progress. That schema requires the identical OriginalPublication '
            'definition in its event_issued branch. The original refusal returns on restoration.')),
    'dg5/dgu/inspect/event/schema': dict(
        kind='code-selection',
        families=['goal.updated'],
        depends_on=['dg5/dgu/producer/freeze/producer_input/schema'],
        sites=[(U, 1871), (U, 1874), (U, 1876), (U, 1891), ('scripts/pm_goal_test_storage.py', 580),
               ('scripts/pm_goal_test_storage.py', 1861), ('scripts/pm_goal_test_owner_adapters.py', 83),
               ('Plans/goal_updated_consumer_contracts.schema.json', 497)],
        argument=(
            'inspect validates the selected event against SelectedActiveEvent (:1876: the '
            'EventRecord root plus goal.updated consts and the payload definition, :497) only '
            'after the const triple is required at :1874-1875, and Storage has already '
            'frame-validated the identical EventRecord root at decode. The one tighter '
            'part is the payload definition, and every payload or metadata byte is compared '
            'verbatim at :1891 (producer25 of the whole event minus storage-assigned fields '
            'against the frozen ProducerInput, pm_goal_test_storage.py:1861): a producer-issued '
            'event carries the freeze-validated payload, and any other event differs from the '
            'frozen input and refuses there. The complete call with the selected-event schema '
            'disabled reaches that type-exact comparison with the extra event field and refuses '
            'at :1891. Restoring the check repeats the earlier exact validation message.')),
    'dg5/dgu/inspect/observation/schema': dict(
        kind='entailed-by-inspect-construction',
        families=['goal.updated'],
        depends_on=['dg5/dgu/inspect/event/schema', 'dg5/dgu/inspect/request/schema'],
        sites=[(U, 1903), (U, 1917), ('Plans/goal_updated_consumer_contracts.schema.json', 144)],
        argument=(
            'inspect builds the observation (:1903-1908) only from constants (reader_binding, '
            'payload_schema_id, action_authority, checkpoint_effect), the request-validated '
            'scope ids, and fields copied verbatim from the event just validated against '
            'SelectedActiveEvent (event/thread/goal ids, sequence within the same uint64 '
            'bound, occurred_at under the same date-time format, and the payload against the '
            'identical payload reference, EventObservation :144). Every bound in the '
            'observation definition is identical to a bound its sources already passed, so '
            'no complete inspect call can make this row refuse alone. It closes by this '
            'proof once the inspect event and request schema rows are closed.')),
    'dg5/dgu/producer/freeze/receipt_request/schema': dict(
        kind='entailed-by-progress-schema',
        families=['goal.updated'],
        depends_on=[],
        sites=[(U, 1371), (U, 1740), ('Plans/goal_update_command_custody.schema.json', 708),
               ('Plans/goal_body_custody.schema.json', 720)],
        argument=(
            'freeze reads the body receipt through read_receipt_private (:1740), whose first '
            'statement validates the request against receipt_read_request (:1371, '
            'goal_body_custody.schema.json:720). The request object is the stored progress '
            'body_commit.receipt_request verbatim, already validated against the identical '
            'referenced definition (BodyCommit.receipt_request, '
            'goal_update_command_custody.schema.json:708) when the progress snapshot was '
            'written and on every read. The identical value cannot newly fail the identical '
            'definition, so no complete freeze call can make this row refuse alone.')),
    'dg5/dgu/sir/terminal/receipt_request/schema': dict(
        kind='entailed-by-progress-schema',
        families=['goal.updated'],
        depends_on=[],
        sites=[(U, 831), (U, 1371), ('Plans/goal_update_command_custody.schema.json', 708),
               ('Plans/goal_body_custody.schema.json', 720)],
        argument=(
            'terminalize (succeeded) reads the body receipt through read_receipt_private '
            '(:831) with the stored progress body_commit.receipt_request verbatim, already '
            'validated against the identical referenced receipt_read_request definition '
            '(BodyCommit, goal_update_command_custody.schema.json:708, referencing '
            'goal_body_custody.schema.json:720) at progress write and on every read. The '
            'identical value cannot newly fail the identical definition at :1371, so no '
            'complete terminalize call can make this row refuse alone.')),
    'dg5/dgu/inspect/receipt_request/schema': dict(
        kind='entailed-by-selected-event-schema',
        families=['goal.updated'],
        depends_on=['dg5/dgu/inspect/event/schema'],
        sites=[(U, 1371), (U, 1899)],
        argument=(
            'inspect reads the body receipt through read_receipt_private (:1898-1899) with '
            'payload.body_receipt_request verbatim from the event validated moments earlier '
            'against SelectedActiveEvent, whose payload definition carries a '
            'body_receipt_request object byte-identical in constraints to the '
            'receipt_read_request definition validated at :1371 (same required fields, '
            'const reader_binding and string bounds). The identical value cannot newly fail '
            'the identical constraints, so no complete inspect call can make this row refuse '
            'alone. It closes by this proof once the inspect event schema row is closed.')),
    'dg5/dgu/body/reserve/pending/schema': dict(
        kind='entailed-by-body-control-pending',
        families=['goal.updated'],
        depends_on=['dg5/dgu/body/goal_body_control/schema'],
        sites=[(U, 1081), (U, 1181), (U, 1183), (U, 1189), (U, 1196),
               ('Plans/goal_cancel_command_custody.schema.json', 1481),
               ('Plans/goal_cancel_command_custody.schema.json', 3693)],
        argument=(
            'Reservation inserts an exact copy of its pending document into the Body Control '
            'record and checks equality before the write. Body Control requires the identical '
            'pending schema for a non-null value. The complete call passed the same invalid '
            'document to that later check with only the earlier check disabled.')),
    'dg5/dgu/sir/terminal/result/schema': dict(
        kind='entailed-by-stored-terminal-result',
        families=['goal.updated'],
        depends_on=[],
        sites=[(U, 841), (U, 859), (U, 876), (U, 877), (U, 889), (U, 893),
               ('Plans/goal_update_command_custody.schema.json', 2079),
               ('Plans/goal_update_command_custody.schema.json', 2170),
               ('Plans/goal_update_command_custody.schema.json', 2261)],
        argument=(
            'Terminalize validates each of its three result variants and then places the same '
            'document in the corresponding stored Terminal branch. Every branch requires the '
            'original result definition. Each complete call refuses in its stored terminal when '
            'only the earlier check is disabled. The matching later branch repeats the exact '
            'result-rule messages for the invalid documents from each variant.')),
    'dg5/dgu/inspect/request/schema': dict(
        kind='entailed-by-inspection-witness-request',
        families=['goal.updated'],
        depends_on=[],
        sites=[(U, 1854), (U, 1909), (U, 1918), ('Plans/goal_updated_consumer_contracts.schema.json', 535)],
        argument=(
            'The inspection witness requires the exact EventReadRequest and the original caller '
            'forwards the same request through the same bank. The complete call still refuses '
            'at the later request field with only the first check disabled. The later witness '
            'also repeated the exact message for every independently tested request rule. '
            'This proof covers the required request field of the witness.')),
    'dg5/dgu/reader/audit/request/schema': dict(
        kind='entailed-by-audit-result-request',
        families=['goal.updated'],
        depends_on=[],
        sites=[(U, 1637), (U, 1667), (U, 1670), (U, 1674),
               ('Plans/goal_updated_consumer_contracts.schema.json', 382),
               ('Plans/goal_updated_consumer_contracts.schema.json', 437)],
        argument=(
            'The audit reader forwards its original request into the progress and terminal result '
            'schemas. Each requires that field and directly references the identical AuditReadRequest. '
            'Both original calls still refuse on that field with only the first check disabled. '
            'Both later schemas also repeated the exact request message for every rule. '
            'This proof covers the required request field of each result.')),
    'dg5/dgu/reader/input/request/schema': dict(
        kind='entailed-by-input-result-request',
        families=['goal.updated'],
        depends_on=['dg5/dgu/reader/input/result/schema'],
        sites=[(U, 1689), (U, 1702), (U, 1704), ('Plans/goal_updated_consumer_contracts.schema.json', 474),
               ('Plans/goal_updated_consumer_contracts.schema.json', 484)],
        argument=(
            'The input reader forwards the original request into the result. InputReadResult '
            'requires that field and validates it against the identical InputReadRequest '
            'definition in the same schema bank. The complete call reaches that result '
            'validation with the same invalid request when only the first check is disabled.')),
    'dg5/dgu/reader/receipt/receipt_request/schema': dict(
        kind='entailed-by-final-receipt-request',
        families=['goal.updated'],
        depends_on=['dg5/dgu/reader/receipt/final/receipt_request/schema'],
        sites=[(U, 1371), (U, 1386), (U, 1392), ('Plans/goal_body_custody.schema.json', 720)],
        argument=(
            'Both receipt reads pass the original request to the same read_receipt_private '
            'validation using the same schema. The complete call reaches the final '
            'request validation with identical invalid data when just the first check '
            'is disabled, and restoring that check repeats the original refusal.')),
    'dg5/oracle/receipt_request/schema': dict(
        kind='entailed-by-progress-schema',
        families=['goal.updated'],
        depends_on=['dg5/dgu/reader/receipt/receipt_request/schema'],
        sites=[(U, 1371), ('scripts/pm_goal_dg_u_oracles.py', 184),
               ('Plans/goal_update_command_custody.schema.json', 708)],
        argument=(
            'This row is the same read_receipt_private validation (:1371) reached only with '
            'where=oracle from the oracle harness self-checks (pm_goal_dg_u_oracles.py:184), '
            'always with the genuine progress body_commit.receipt_request - the identical '
            'object class, identical referenced definition (BodyCommit, '
            'goal_update_command_custody.schema.json:708) and identical validation call as '
            'the reader receipt rows. It can refuse only where those rows refuse, so it '
            'never gates acceptance alone and closes with the reader receipt row.')),
    'dg5/dgu/physical/row/schema': dict(
        kind='entailed-by-physical-construction',
        families=['goal.updated'],
        depends_on=[],
        sites=[(U, 656), (U, 671), (U, 1079), (U, 1081)],
        argument=(
            'PhysicalMixin.physical (:656-671) validates a row it has just assembled '
            'from schema constants (schema_id, schema_version, the wrapper logical ids '
            'from the validated wrapper itself), a computed owner-identity digest, a '
            'lifetime taken from the owner LIFETIME table, the computed value_sha256 of '
            'the canonical wrapper bytes, and either that wrapper verbatim (already '
            'validated against its logical root by row() at :1081 before physical runs) '
            'or a pack reference whose media and bytes were verified by put_pack/'
            'read_pack in the same call plus the compact-row cap at :670. Every '
            'physical-row schema bound is a const, a computed digest, or identical to a '
            'bound its sources already passed, so no complete owner call can make this '
            'row refuse alone.')),
    'dg5/dgu/reader/audit/result/schema': dict(
        kind='entailed-by-audit-construction',
        families=['goal.updated'],
        depends_on=[],
        sites=[(U, 1632), (U, 1667), (U, 1674),
               ('Plans/goal_updated_consumer_contracts.schema.json', 364),
               ('Plans/goal_updated_consumer_contracts.schema.json', 418)],
        argument=(
            'read_audit builds its result (:1667-1674) only from constants '
            '(reader_binding, action_authority, checkpoint_effect), the request just '
            'validated against AuditReadRequest at entry, the source wrapper and '
            'progress snapshot just read through their own whole-root validations, a '
            'selector computed from that snapshot, and - for the terminal branch - the '
            'terminal wrapper just unwrapped against StorageTerminal. AuditedProgress '
            'and AuditedTerminal (:364/:418) reference exactly those validated shapes '
            'with no tighter bound at any copied field, so no complete read_audit call '
            'can make this row refuse alone. (Its clause-closure roots are a separate '
            'gate.)')),
    'dg5/dgu/inspect/witness/schema': dict(
        kind='entailed-by-inspect-construction',
        families=['goal.updated'],
        depends_on=['dg5/dgu/inspect/event/schema'],
        sites=[(U, 1909), (U, 1918), ('Plans/goal_updated_consumer_contracts.schema.json', 520)],
        argument=(
            'inspect builds the witness (:1909-1916) only from the request just '
            'validated against EventReadRequest, the snapshot read token, the event '
            'just validated against SelectedActiveEvent, the read-validated source '
            'wrapper, progress head and selected snapshot, the body receipt wrapper '
            'just read through its own whole-root validation, the frozen publication '
            'already join-checked at :1891-1892, and the installed resource graph '
            'digest. PrivateEventReadWitness (:520) references exactly those validated '
            'shapes with no tighter bound at any copied field, so no complete inspect '
            'call can make this row refuse alone once the inspect event row holds. '
            '(Its clause-closure root is a separate gate.)')),
}
