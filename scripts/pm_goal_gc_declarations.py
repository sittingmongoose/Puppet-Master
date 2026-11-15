"""PNC-019 C12-GC declarations for scripts/pm-goal-gc-guard-tables.py: duplicate sets and justified singletons.

DUPLICATES[source][row] = dict(rows=later rows of the same complete call that enforce the same owner invariant on
the same input fact, evidence=why). A duplicate-set kill needs the joint cut of the row and its later sites to let
the complete checker accept, and the restored checker to refuse with the row's own code. It is reported apart
from single-row kills.

JUSTIFIED[source][row] = dict(category, proof): why a row has no killing witness. Categories:
  presence - the row guards a member the next statement dereferences; with the row cut the checker raises, so no
             input that falsifies the row is accepted (an exception never earns credit).
  typed    - the row guards a CV-1100 typed computation that itself refuses by raising on the wrong type.
  entailed - an earlier row refuses first on every input that falsifies this row (stated, with the earlier row).
Nothing here grants credit: justified rows stay unproved singletons, each alone in its own table.
"""

_A = 'scripts/pm_goal_own_a_oracles.py'
_B = 'scripts/pm_goal_own_b_oracles.py'

DUPLICATES = {
    'own_a': {
        'authority/permission': dict(rows=['append/authority'], evidence=f'{_A} admit_static and append both require the current permission (SB2 entry, SB3 final predicate).'),
        'authority/recovery': dict(rows=['append/authority'], evidence=f'{_A} admit_static and append both require recovery_hold false.'),
        'authority/storage': dict(rows=['append/authority'], evidence=f'{_A} admit_static and append both require storage_writable.'),
        'writer/withdrawal': dict(rows=['append/writer_withdrawal'], evidence=f'{_A} admission and append both refuse a withdrawn writer (SP-426/427 writer cutoff at the final predicate).'),
        'operation/immutable_conflict': dict(rows=['recovery/frozen'], evidence=f'{_A} run_writer compares the held intent with the request; recover compares the held frozen event with it again.'),
        'receipt/type': dict(rows=['receipt/original'], evidence=f'{_A} retry_checks: a supplied receipt of the wrong type also differs from the Storage original (typed comparison).'),
        'reader/whole_value': dict(rows=['reader/retained/original_binding'], evidence=f'{_A} inspect: the sealed receipt binds the producer digest of the original, so an at-rest change also fails the receipt-selected read.'),
        'reader/first_custody': dict(rows=['reader/retained/original_verification'], evidence=f'{_A} inspect: the sealed receipt binds the exact first receipt bytes.'),
        'reader/receipt': dict(rows=['reader/retained/original_verification'], evidence=f'{_A} inspect: the sealed receipt binds the exact first receipt bytes.'),
        'project/native_floor': dict(rows=['project/native_chronology'], evidence=f'{_A} reduce: GRS-202 floor and the authenticated non-emitting chronology both bound the expected revision.'),
        'project/unsupported': dict(rows=['project/edge'], evidence=f'{_A} reduce: an unsupported family is also not a lifecycle edge.'),
        'project/v2_row': dict(rows=['project/original_result'], evidence=f'{_A} reduce: a v2 row is never the published v3 original of its operation.'),
        'project/frame_custody': dict(rows=['project/original_result'], evidence=f'{_A} reduce: the stored frame must equal the original result event.'),
        'project/token_schema': dict(rows=['project/token_current', 'publish/cas_generic', 'candidate/schema', 'publish/candidate_schema', 'publish/candidate'], evidence=f'{_A} reduce: the current generic token is schema-valid, so a schema-invalid token also differs from it.'),
        'project/token_storage': dict(rows=['project/token_current', 'publish/cas_generic'], evidence=f'{_A} reduce: the current token names this Storage instance.'),
        'project/token_current': dict(rows=['publish/cas_generic'], evidence=f'{_A} publish_projection repeats the generic-frontier comparison inside the Storage transaction (whole-preimage CAS).'),
        'project/native_after': dict(rows=['project/native_d01'], evidence=f'{_A} reduce: the D01 update binds the same before/after revisions.'),
        'publish/candidate_schema': dict(rows=['publish/candidate'], evidence=f'{_A} publish_projection: the rederived candidate is schema-valid, so a schema-invalid one also differs.'),
        'candidate/schema': dict(rows=['publish/candidate_schema', 'publish/candidate'], evidence=f'{_A} project_prefix validates the candidate parts; publish_projection validates the whole candidate and compares it with the rederived one.'),
        'receipt/schema': dict(rows=['root/StorageStopResult', 'root/StorageBlockResult'], evidence=f'{_A} append validates the first receipt; the closed Result wrapper embeds the same full-value result.'),
        'generation/slots': dict(rows=['candidate/schema', 'publish/candidate_schema', 'publish/candidate'], evidence=f'{_A} the checkpoint root allows at most three generations (StorageCheckpoint maxItems).'),
        'part/hash': dict(rows=['part/size'], evidence=f'{_A} resolve_part: a forged body of another length also fails the declared size.'),
        'request/schema': dict(rows=['native/revision', 'route', 'root/StorageStopIntent', 'root/StorageBlockIntent'],
                               evidence=f'{_A} the closed intent record embeds the request (CV-1110 Intent), so the same Request clause is checked again at the intent wrapper; a request field also joins the native revision or the route set.'),
        'project/edge': dict(rows=['project/original_result'], evidence=f'{_A} reduce: a row after an illegal edge is never a published original of the run.'),
    },
    'own_b': {
        **{f'schema/{route}_{method}_request': dict(rows=['schema/request'], evidence=f'{_B} guarded() validates the method request root, then source() validates the shared request definition; CV-1120..1122 make every method request root the same closed definition.')
           for route in ('blocked', 'completed', 'exception') for method in ('capture', 'reserve', 'commit_body', 'freeze_event', 'append', 'resolve', 'publish', 'inspect')},
        **{f'schema/storage_{route}_source': dict(rows=[f'schema/{route}_source'], evidence=f'{_B} read_part: the storage wrapper embeds the source definition, and the unwrapped value is validated against it again.')
           for route in ('blocked', 'completed', 'exception')},
        'physical/partition': dict(rows=['physical/key'], evidence=f'{_B} physical_key: the key is derived from the partition.'),
        'physical/read_size': dict(rows=['physical/bytes'], evidence=f'{_B} read_part: a padded row is also not the canonical encoding.'),
        'source/target': dict(rows=['body/identity', 'exception/certification_target'], evidence=f'{_B} the body identity and the exception certificate bind the same target.'),
        'schema/revision': dict(rows=['body/accepted_history'], evidence=f'{_B} body_predicates: the accepted origin history is compared record by record with the live history.'),
        'schema/receipt': dict(rows=['receipt/body_original'], evidence=f'{_B} resolve_body: the stored body receipt must equal the receipt the body commit issued.'),
        'schema/payload': dict(rows=['event/semantic'], evidence=f'{_B} event_predicates: the producer semantic digest covers the payload.'),
        'event/receipt_digest': dict(rows=['event/semantic'], evidence=f'{_B} event_predicates: the receipt digest is a payload member, so the semantic digest also differs.'),
        'schema/full_value_result': dict(rows=['schema/AppendReceipt'], evidence=f'{_B} resolve_event: the full-value result embeds the first AppendReceipt, validated again on its own.'),
        'result/terminal_immutable': dict(rows=['result/no_effect_proof'], evidence=f'{_B} terminal(): a second terminal after an unknown result also lacks the no-effect proof.'),
        'reference/hash': dict(rows=['reference/size'], evidence=f'{_B} unpack: a padded pack body also fails the declared size.'),
        'schema/todo': dict(rows=['completed/todo_original'], evidence=f'{_B} body_predicates: the live ToDo record must equal the source snapshot.'),
        'completed/skip_origin': dict(rows=['completed/skip_actor'], evidence=f'{_B} the disposition custody binds both its hash and its actor.'),
        'schema/approval_request': dict(rows=['exception/approval_origin'], evidence=f'{_B} exception(): the approval resolution binds the request digest.'),
        'schema/exception': dict(rows=['exception/original_workflow', 'exception/certification_target'], evidence=f'{_B} exception(): the workflow record must equal its original.'),
        'exception/original_workflow': dict(rows=['exception/certification_target'], evidence=f'{_B} the certificate joins the workflow record fields again.'),
        'exception/certification_original': dict(rows=['exception/certification_target'], evidence=f'{_B} the certificate joins the workflow record fields again.'),
        'exception/source': dict(rows=['completed/exception_evidence'], evidence=f'{_B} the completion evidence must name the exception receipt.'),
    },
}

JUSTIFIED = {
    'own_a': {
        'native/exists': dict(category='presence', proof=f'{_A} admit: w["native"] is dereferenced on the next line.'),
        'cause/exists': dict(category='presence', proof=f'{_A} admit: w["causes"][op] is dereferenced on the next line.'),
        'goal/exists': dict(category='presence', proof=f'{_A} admit: w["goal"] is dereferenced on the next line.'),
        'project/inherited_original': dict(category='presence', proof=f'{_A} reduce: the inherited original record is read for its revision right after the row.'),
        'read/root': dict(category='presence', proof=f'{_A} read_projection: the selected generation of the root is dereferenced right after the row.'),
        'part/present': dict(category='presence', proof=f'{_A} resolve_part: packs[ref] is read right after the row.'),
        'reader/present': dict(category='presence', proof=f'{_A} inspect: the frame and first custody are dereferenced by the following rows.'),
        'native/value_revision_type': dict(category='typed', proof=f'{_A} admit: the SP-426/427 identity recipe takes the native revision through current_revision_text, which raises integer_type on a non-integer (CV-1100).'),
        'event/producer_representable': dict(category='typed', proof=f'{_A} run_writer: semantic_digest (RFC8785 producer projection) raises jcs_binary64 on the same value right after admission.'),
        'event/storage_representable': dict(category='entailed', proof='Earlier row event/producer_representable: every EventRecord integer the physical value codec cannot hold (outside int64/uint64) is also outside the exact binary64 JCS route, so the producer row always refuses first.'),
        'project/token_schema': dict(category='entailed', proof=f'{_A} the supplied token is carried into the consumer result (processed.generic_token); with this row and its declared later sites cut, the closed ConsumerResult definition (self-check assert/result_root) refuses the same DurableToken clause, so no input is accepted.'),
        'project/unsupported': dict(category='presence', proof=f'{_A} reduce: past the row the family indexes RULE/PAYLOAD, which hold only the five supported families (joint cut with project/edge raises KeyError).'),
        'project/edge': dict(category='presence', proof=f'{_A} reduce: a row after an illegal edge has no published operation; with the edge and original-result rows cut the held operation is dereferenced as None (TypeError).'),
        'part/hash': dict(category='presence', proof=f'{_A} resolve_part: a forged body is decoded right after the hash and size rows; the joint cut raises on the undecodable bytes (ExtraData).'),
    },
    'own_b': {
        'dispatch/method': dict(category='presence', proof=f'{_B} call(): the action is looked up by method name right after the row.'),
        'source/available': dict(category='presence', proof=f'{_B} source(): sources[ref] and origins[ref] are read right after the row.'),
        'physical/available': dict(category='presence', proof=f'{_B} read_part: physical_rows[role] is read right after the row.'),
        'body/reserved': dict(category='presence', proof=f'{_B} commit_body: the reservation record is dereferenced right after the row.'),
        'receipt/body_available': dict(category='presence', proof=f'{_B} resolve_body: original_receipts[operation] is read right after the row.'),
        'event/pending': dict(category='presence', proof=f'{_B} append: the pending event is dereferenced right after the row.'),
        'receipt/event_available': dict(category='presence', proof=f'{_B} resolve_event: append_custody[event_id] is read right after the row.'),
        'result/available': dict(category='presence', proof=f'{_B} retained(): the issued result bytes are decoded right after the row.'),
        'reference/available': dict(category='presence', proof=f'{_B} unpack: packs[hash] is read right after the row.'),
        'schema/disposition': dict(category='presence', proof=f'{_B} body_predicates: the disposition record is dereferenced right after its definition check (an absent one fails the definition).'),
        'event/body_committed': dict(category='presence', proof=f'{_B} freeze_event: the body receipt this phase guard protects does not exist before the commit (receipt/body_available, then a KeyError).'),
        'result/event_committed': dict(category='presence', proof=f'{_B} publish: the event custody this phase guard protects does not exist before the append.'),
        'completed/todo_status': dict(category='branch', proof=f'{_B} body_predicates: the row is the refusal of its own branch (a required item neither completed nor accepted-skipped), so no accepted call evaluates it; its negative kills (open_required_todo).'),
        'schema/request': dict(category='entailed', proof='Earlier rows schema/<route>_<method>_request: every method request root is the same closed request definition (CV-1120..1122) and guarded() validates it before source() validates the shared one.'),
        'source/final_original': dict(category='entailed', proof='Earlier row source/origin: the final re-read decodes the same custody bytes, whose SHA-256 the request and the origin pin; any change of those bytes refuses at source/origin first.'),
        'schema/AppendReceipt': dict(category='entailed', proof='Earlier rows schema/full_value_result and receipt/full_result: the first receipt must equal the full-value result copy, whose embedded AppendReceipt the full-value definition has already validated.'),
        'retained/current_disclosure': dict(category='entailed', proof='Earlier row access/disclosure: authority() refuses a withdrawn disclosure before the receipt-selected read, whose disclosure input is the same flag.'),
        'event/producer_representable': dict(category='entailed', proof='The original source is stored as canonical JCS custody (install/inject_source): a source carrying an integer past the exact binary64 route cannot be issued, so no event built from it reaches this row.'),
        'event/storage_representable': dict(category='entailed', proof='As event/producer_representable, and the physical source codec forbids floats and integers outside int64/uint64 at rest.'),
        'result/terminal_kind': dict(category='entailed', proof=f'{_B} terminal(): with the row cut a published terminal builds a result that the closed result definition refuses (the writer self-check assert/write/<route>_result); the row and the definition state the same status set.'),
        'physical/read_size': dict(category='presence', proof=f'{_B} read_part: the padded row is decoded right after the size row; with read_size and bytes cut it is undecodable (ValueError).'),
        **{f'schema/{route}_result': dict(category='entailed', proof=f'{_B} retained(): the issued result is embedded in the closed inspect response, which the writer self-check assert/write/{route}_inspect_response validates; a cut of this row and result/physical is refused there.')
           for route in ('blocked', 'completed', 'exception')},
        'schema/exception_workflow_inputs': dict(category='entailed', proof=f'{_B} exception(): the same inputs are embedded in the native receipt, whose closed definition the writer self-check validates next.'),
    },
}
