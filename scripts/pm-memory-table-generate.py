#!/usr/bin/env python3
"""Write the DMEM Method B phase-table modules (scripts/pm_memory_table_*.py) from one row spec.

Usage: python3 scripts/pm-memory-table-generate.py scripts [--check]

One phase is one original refusal site of the DMEM checkers (a former
``require``/``guard`` call, a conjunct chain of a boolean validator, or one
policy postcondition). Its rows are that site's predicates, split at every
``and``/``or`` and at every small literal field loop, in the original
evaluation order. A row that depends on an earlier row of the same phase is
gated on the observation that row reads, so a single-defect input fails one
row only. Sequential sites stay separate phases: the checker evaluates a phase
only after every earlier phase of its boundary passed, exactly as the former
short-circuit did.

Spec rows: (name, field, words, code, condition). The condition is the refusal
test over the phase observation ``value``; FIELDS is every ``value['...']`` key
the rows of the phase read. The checkers (pm_memory_maintenance_events.py,
pm_memory_archive_events.py, pm_memory_policy.py) derive every digest,
recomputed identity, encoded size, schema verdict, presence fact and mismatch
list; a refusal is issued only by a row. Variant chains reuse one predicate set
under the refusal code of their call site. The generated modules are the
checked-in source of truth; --check exits 1 when a module is stale, missing or
extra.
"""
import re
import sys
from pathlib import Path

PHASES = {}
CAP = 16384


def phase(name, doc, rows):
    assert name not in PHASES and 1 <= len(rows) <= 7, name
    for row in rows:
        assert len(row) == 5, row
    PHASES[name] = (doc, rows)


START = 'start_receipt_missing'
ACCESS = 'permission_or_withdrawal'


# --------------------------------------------------------------- reusable chains
def operation_chain(prefix, code, where):
    """valid_operation conjuncts (schema, value cap, receipts, prepared reserve, result)."""
    p = prefix.upper()
    phase(prefix + '_schema', f'valid_operation at {where}: the operation row satisfies its (historical) schema.', [
        (p + '01_schema', '/', 'satisfies the selected operation schema definition', code, "value['schema_valid'] is not True")])
    phase(prefix + '_cap', f'valid_operation at {where}: the operation value encodes within the Storage inline cap.', [
        (p + '02_value_cap', '/', 'encodes to at most 16384 binding bytes', code, f"value['value_bytes'] > {CAP}")])
    phase(prefix + '_receipts', f'valid_operation at {where}: recorded receipt ids equal the recomputed event ids.', [
        (p + '03_started_receipt', '/started_event_id', 'is null or the recomputed started event id', code,
         "value['started_event_id'] is not None and value['started_event_id'] != value['expected_started_event_id']"),
        (p + '04_completed_receipt', '/completed_event_id', 'is null or the recomputed completed event id', code,
         "value['completed_event_id'] is not None and value['completed_event_id'] != value['expected_completed_event_id']")])
    phase(prefix + '_reserve', f'valid_operation at {where}: a prepared row still fits after terminal custody.', [
        (p + '05_terminal_reserve', '/', 'the reserved terminal row encodes to at most 16384 binding bytes', code,
         f"value['terminal_bytes'] > {CAP}")])
    phase(prefix + '_result', f'valid_operation at {where}: an outcome row carries its recomputed result reference and digest.', [
        (p + '06_result_ref', '/result_ref', 'equals the recomputed result reference', code,
         "value['result_ref'] != value['expected_result_ref']"),
        (p + '07_result_digest', '/result_sha256', 'equals the recomputed result digest', code,
         "value['result_sha256'] != value['expected_result_sha256']")])


def target_chain(prefix, code, where, source=True):
    """valid_target conjuncts (schema, then order, manifest, source and identity).

    source=False drops the source-revision row where the caller builds the operation source from
    the target itself (valid_selector), so that comparison is the value with itself and cannot refuse.
    """
    p = prefix.upper()
    phase(prefix + '_schema', f'valid_target at {where}: the rebuild target satisfies its (historical) schema.', [
        (p + '01_schema', '/', 'satisfies the selected target schema definition', code, "value['schema_valid'] is not True")])
    rows = [(p + '02_artifact_order', '/artifacts/*/relative_name', 'names are sorted and unique', code,
             "value['names'] != value['sorted_unique_names']"),
            (p + '03_manifest', '/manifest_sha256', 'equals the recomputed artifact manifest digest', code,
             "value['manifest_sha256'] != value['expected_manifest_sha256']")]
    if source:
        rows.append((p + '04_source', '/source_revision_sha256', 'equals the operation source revision', code,
                     "value['source_revision_sha256'] != value['row_source_revision_sha256']"))
    rows.append((p + '05_identity', '/target_id', 'equals the target id recomputed from the operation and the recomputed manifest',
                 code, "value['target_id'] != value['expected_target_id']"))
    phase(prefix + '_body', f'valid_target at {where}: artifact order, manifest,{" source," if source else ""} and target identity.', rows)


def retained_chain(prefix, code, where, binding=True):
    """original_matches conjuncts: record shape, then flush, value binding and full-value digest."""
    p = prefix.upper()
    phase(prefix + '_shape', f'original_matches at {where}: the retained record has exactly its three fields.', [
        (p + '01_shape', '/', 'is an object with exactly full_value, full_value_sha256 and durability', code,
         "value['shape_valid'] is not True")])
    rows = [(p + '02_flush', '/durability', 'is full_flush', code, "value['durability'] != 'full_flush'")]
    if binding:
        rows.append((p + '03_binding', '/full_value', 'equals the expected full value', code, "value['value_matches'] is not True"))
    rows.append((p + '04_digest', '/full_value_sha256', 'equals the frozen integer-json-v1 digest of the retained value', code,
                 "value['full_value_sha256'] != value['expected_full_value_sha256']"))
    phase(prefix + '_body', f'original_matches at {where}: flush{", value binding" if binding else ""} and digest.', rows)


def history_chain(prefix, code, where):
    """historical_matches conjuncts for canonical retained envelopes."""
    p = prefix.upper()
    phase(prefix + '_shape', f'historical_matches at {where}: the retained record has exactly its three fields.', [
        (p + '01_shape', '/', 'is an object with exactly full_value, full_value_sha256 and durability', code,
         "value['shape_valid'] is not True")])
    phase(prefix + '_body', f'historical_matches at {where}: flush, digest and the frozen envelope edition.', [
        (p + '02_flush', '/durability', 'is full_flush', code, "value['durability'] != 'full_flush'"),
        (p + '03_digest', '/full_value_sha256', 'equals the frozen integer-json-v1 digest of the retained value', code,
         "value['full_value_sha256'] != value['expected_full_value_sha256']"),
        (p + '04_envelope', '/full_value', 'satisfies its closed retained envelope edition', code,
         "value['envelope_valid'] is not True")])
    phase(prefix + '_joins', f'historical_matches at {where}: payload schema, producer and semantic joins.', [
        (p + '05_payload_schema', '/full_value/payload', 'satisfies the family payload schema', code,
         "value['payload_valid'] is not True"),
        (p + '06_producer', '/full_value/actor_ref', 'is absent or the producer actor', code,
         "value['actor_ref'] != value['expected_actor_ref']"),
        (p + '07_binding', '/full_value', 'the semantic fields and payload equal the frozen write-time operation', code,
         "value['binding_matches'] is not True")])


def access_phase(name, prefix, where):
    p = prefix.upper()
    phase(name, f'{where}: current access and the withdrawal fence.', [
        (p + '01_permission', '/permission', 'is exactly true', ACCESS, "value['permission'] is not True"),
        (p + '02_withdrawn', '/withdrawn', 'is exactly false', ACCESS, "value['withdrawn'] is not False")])


# --------------------------------------------------------------- start custody gate (SP-630..SP-637)
phase('sg_withdrawn', 'start_custody_gate: the withdrawal fence precedes every custody read.', [
    ('SG01_withdrawn', '/withdrawn', 'is exactly false', ACCESS, "value['withdrawn'] is not False")])
phase('sg_phase', 'start_custody_gate: the operation phase is lawful for its command.', [
    ('SG02_phase', '/operation/phase', 'is one of the lawful phases of the command', START,
     "value['phase'] not in value['lawful_phases']")])
phase('sg_receipt', 'start_custody_gate: only an accepted row lacks a start receipt; every later row names this start.', [
    ('SG03_start_receipt', '/operation/started_event_id', 'is null exactly when accepted, else the recomputed start id', START,
     "value['started_event_id'] != value['expected_started_event_id']")])
phase('sg_record', 'start_custody_gate: a recorded receipt or a later original requires the retained start record.', [
    ('SG04_record_present', '/originals/<started>', 'the retained start record is present', START,
     "value['record_present'] is not True")])
phase('sg_canonical', 'start_custody_gate: the started writer keeps its own canonical original.', [
    ('SG05_canonical_present', '/original', 'the started writer has its retained canonical original', START,
     "value['canonical_present'] is not True")])
phase('sg_unrecorded', 'start_custody_gate: any path except first start admission resolves a start record.', [
    ('SG06_any_start', '/originals/<started> | /original', 'a retained start record or canonical original is present', START,
     "value['record_present'] is not True and value['canonical_present'] is not True")])
retained_chain('sgr', START, 'start_custody_gate (retained start record)')
history_chain('sgh', START, 'start_custody_gate (canonical history start record)')
retained_chain('sgc', START, 'start_custody_gate (started writer canonical original)', binding=False)
phase('sgc_envelope', 'start_custody_gate (started writer canonical original): the retained envelope edition.', [
    ('SGC05_envelope', '/original/full_value', 'satisfies its closed retained envelope edition', START,
     "value['envelope_valid'] is not True")])
phase('sgc_reference', 'start_custody_gate (started writer canonical original): the producer fields equal the canonical reference.', [
    ('SGC06_reference', '/original/full_value', 'the producer fields equal the canonical reference', START,
     "value['reference_matches'] is not True")])
phase('sgc_reduced', 'start_custody_gate (started writer canonical original): the reduced fields equal the expected start value (defence in depth: a subset of SGC06).', [
    ('SGC07_reduced', '/original/full_value', 'the reduced phase-model fields equal the expected start value', START,
     "value['reduced_matches'] is not True")])
phase('sgl_later', 'start_custody_gate: every later retained original cites exactly this start record.', [
    ('SGL01_object', '/<later original>/full_value', 'is an object', START, "value['is_object'] is not True"),
    ('SGL02_causation', '/<later original>/full_value/causation_event_id', 'equals the start event id', START,
     "value['is_object'] is True and value['causation_event_id'] != value['start_event_id']"),
    ('SGL03_payload_object', '/<later original>/full_value/payload', 'is an object', START,
     "value['is_object'] is True and value['payload_is_object'] is not True"),
    ('SGL04_payload_start', '/<later original>/full_value/payload/started_event_id', 'equals the start event id', START,
     "value['payload_is_object'] is True and value['payload_started_event_id'] != value['start_event_id']")])

# --------------------------------------------------------------- current writer (_append_current)
phase('ap_uint64', '_append_current: Storage uint64 metadata types (SP-236), before producer numbers.', [
    ('AP01_storage_uint64', '/sequence_id', 'every present Storage uint64 field is an SP-1100 uint64 (exact int 0..2^64-1)',
     'invalid_storage_uint64', "value['storage_uint64_refusals'] != []")])
phase('ap_numbers', '_append_current: every producer-owned number has a commitment encoding.', [
    ('AP02_producer_numbers', '/** (producer fields)', 'every producer number encodes under the current commitment recipe',
     'invalid_number', "value['number_error'] is not None")])
phase('ap_envelope', '_append_current: the candidate satisfies the current EventRecord envelope.', [
    ('AP03_envelope_schema', '/', 'satisfies the current memory EventRecord schema', 'invalid_event_record',
     "value['envelope_valid'] is not True")])
phase('ap_gate', '_append_current: replay policy (standing check 1), admission, access and the withdrawal fence.', [
    ('AP04_replay_only', '/replay_policy', 'is not projector_replay_only', 'replay_only_not_appendable',
     "value['replay_policy'] == 'projector_replay_only'"),
    ('AP05_replay_policy', '/replay_policy', 'is dedupe_by_idempotency_key', 'replay_policy_mismatch',
     "value['replay_policy'] != 'projector_replay_only' and value['replay_policy'] != 'dedupe_by_idempotency_key'"),
    ('AP06_admitted', '/admitted', 'is exactly true', 'not_admitted', "value['admitted'] is not True"),
    ('AP07_permission', '/permission', 'is exactly true', ACCESS, "value['permission'] is not True"),
    ('AP08_withdrawn', '/withdrawn', 'is exactly false', ACCESS, "value['withdrawn'] is not False")])
operation_chain('op', 'invalid_operation', 'the current boundaries')
target_chain('tgo', 'invalid_operation', 'valid_operation (prepared target)')
phase('ap_join', '_append_current: every producer field equals the recomputed canonical value (Storage fields excluded).', [
    ('AP09_retry_conflict', '/<producer fields>', 'a retry with the original identity changes no producer field', 'idempotency_conflict',
     "value['mismatched_fields'] != [] and value['retry_same_identity'] is True"),
    ('AP10_envelope_join', '/<producer fields>', 'a new candidate equals the recomputed canonical value', 'envelope_join',
     "value['mismatched_fields'] != [] and value['retry_same_identity'] is not True")])
phase('ap_payload', '_append_current: the payload satisfies the family payload schema.', [
    ('AP11_payload_schema', '/payload', 'satisfies the family payload schema', 'invalid_payload', "value['payload_valid'] is not True")])
phase('ap_inline', '_append_current: the inline payload fits the Storage inline cap.', [
    ('AP12_inline_cap', '/payload', 'encodes to at most 16384 binding bytes', 'inline_payload_too_large',
     f"value['payload_bytes'] > {CAP}")])
phase('ap_partition', '_append_current: the dedupe key uses the encoded project~ partition (CV-365).', [
    ('AP13_partition', '/dedupe_key', 'equals [project~ partition, event type, idempotency key]', 'scope_partition_mismatch',
     "value['dedupe_key'] != value['expected_dedupe_key']")])
retained_chain('apo', 'original_value_changed', '_append_current (returned original)', binding=False)
phase('apo_envelope', '_append_current (returned original): the retained envelope edition.', [
    ('APO05_envelope', '/original/full_value', 'satisfies its closed retained envelope edition', 'original_value_changed',
     "value['envelope_valid'] is not True")])
phase('apo_producer', '_append_current (returned original): the producer projection equals the retry candidate.', [
    ('APO06_producer', '/original/full_value', 'the producer fields equal the retry candidate', 'original_value_changed',
     "value['producer_matches'] is not True")])
phase('ap_phase', '_append_current: a new append requires its lawful operation phase.', [
    ('AP14_phase', '/operation/phase', 'is accepted for started and effect_committed for completed', 'wrong_phase',
     "value['phase'] != value['required_phase']")])

# --------------------------------------------------------------- phase model (_transition)
access_phase('tr_access', 'TR', '_transition (every path except crash)')
phase('tr_request', '_transition: the request digest is unchanged.', [
    ('TR03_request', '/operation/request_sha256', 'equals the durable request digest', 'request_changed',
     "value['request_sha256'] != value['state_request_sha256']")])
phase('sel_schema', 'valid_selector: a published selector satisfies its schema.', [
    ('SEL01_schema', '/selector', 'is null or satisfies the selector schema', 'invalid_selector', "value['schema_valid'] is not True")])
phase('sel_cap', 'valid_selector: a published selector fits the Storage inline cap.', [
    ('SEL02_value_cap', '/selector', 'encodes to at most 16384 binding bytes', 'invalid_selector', f"value['value_bytes'] > {CAP}")])
phase('sel_scope', 'valid_selector: the selector names this Store and Project.', [
    ('SEL03_store', '/selector/storage_instance_id', 'equals the operation Store', 'invalid_selector',
     "value['storage_instance_id'] != value['row_storage_instance_id']"),
    ('SEL04_project', '/selector/project_id', 'equals the operation Project', 'invalid_selector',
     "value['project_id'] != value['row_project_id']")])
target_chain('tgs', 'invalid_selector', 'valid_selector (selected target)', source=False)
phase('tr_cas', '_transition: the caller expected the current durable operation row.', [
    ('TR04_operation_cas', '/expected_operation', 'equals the durable operation row', 'operation_cas_conflict',
     "value['expected_matches'] is not True")])
phase('tr_action', '_transition: the action is a known transition.', [
    ('TR05_action', '/op', 'is a known transition', 'unknown_action',
     "value['op'] not in ('append_started', 'append_completed', 'advance_started', 'prepare', 'swap', 'settle', "
     "'advance_completed', 'retry', 'replay', 'crash', 'recover')")])
phase('tw_phase', '_transition append: the append requires its lawful operation phase.', [
    ('TW01_phase', '/operation/phase', 'is accepted for started and effect_committed for completed', 'wrong_phase',
     "value['phase'] != value['required_phase']")])
phase('tw_value', '_transition append: the supplied value is the recomputed phase-model value.', [
    ('TW02_value', '/value', 'equals the recomputed full value', 'original_value_changed', "value['value_matches'] is not True")])
retained_chain('twr', 'original_value_changed', '_transition append (existing original)')
phase('as_phase', '_transition advance_started: the row is accepted.', [
    ('AS01_phase', '/operation/phase', 'is accepted', START, "value['phase'] != 'accepted'")])
phase('pr_phase', '_transition prepare: a started index rebuild.', [
    ('PR01_phase', '/operation/phase', 'is started', 'wrong_phase', "value['phase'] != 'started'"),
    ('PR02_index', '/operation/command_id', 'is an index rebuild', 'wrong_phase', "value['is_index'] is not True")])
access_phase('ef_access', 'EF', 'effect_fences')
phase('ef_source', 'effect_fences: the source revision is current.', [
    ('EF03_source', '/operation/source_revision_sha256', 'equals the current source revision', 'source_changed',
     "value['source_revision_sha256'] != value['current_source_revision_sha256']")])
target_chain('tg', 'target_invalid', 'prepare and target_fences')
phase('pr_artifacts', '_transition prepare: the durable artifacts are exactly the target artifacts.', [
    ('PR03_artifacts', '/durable_artifacts', 'equals the target artifacts', 'target_invalid', "value['artifacts_match'] is not True")])
phase('pr_prior', '_transition prepare: the target names the current selector digest.', [
    ('PR04_prior_selector', '/target/prior_selector_sha256', 'equals the digest of the current selector, or null', 'prior_selector_mismatch',
     "value['prior_selector_sha256'] != value['current_selector_sha256']")])
phase('sw_phase', '_transition swap: the row is prepared.', [
    ('SW01_phase', '/operation/phase', 'is prepared', 'wrong_phase', "value['phase'] != 'prepared'")])
phase('tf_present', 'target_fences: a prepared target is present.', [
    ('TF01_present', '/operation/prepared_target', 'is present', 'target_invalid', "value['target_present'] is not True")])
phase('tf_artifacts', 'target_fences: the durable artifacts are exactly the target artifacts.', [
    ('TF02_artifacts', '/durable_artifacts', 'equals the prepared target artifacts', 'artifact_mismatch',
     "value['artifacts_match'] is not True")])
phase('sw_cas', '_transition swap: the selector is still the one the target was prepared against.', [
    ('SW02_selector_cas', '/selector', 'its digest equals the prepared prior selector digest', 'selector_cas_conflict',
     "value['current_selector_sha256'] != value['prior_selector_sha256']")])
phase('sw_once', '_transition swap: no effect or swap has happened.', [
    ('SW03_effect_count', '/effect_count', 'equals 0', 'repeated_effect', "value['effect_count'] != 0"),
    ('SW04_swap_count', '/swap_count', 'equals 0', 'repeated_effect', "value['swap_count'] != 0")])
phase('se_phase', '_transition settle: the row is started or prepared.', [
    ('SE01_phase', '/operation/phase', 'is started or prepared', 'wrong_phase', "value['phase'] not in ('started', 'prepared')")])
phase('se_outcome', '_transition settle: the outcome is succeeded or failed.', [
    ('SE02_outcome', '/status', 'is succeeded or failed', 'outcome_invalid', "value['status'] not in ('succeeded', 'failed')")])
phase('se_selected', '_transition settle (index success): the selector is the selected target.', [
    ('SE03_selected', '/selector', 'equals the selector value built from the prepared target', 'selected_target_mismatch',
     "value['selector_matches'] is not True")])
phase('se_effects', '_transition settle (index success): exactly one effect and one swap.', [
    ('SE04_effect_count', '/effect_count', 'equals 1', 'effect_count_mismatch', "value['effect_count'] != 1"),
    ('SE05_swap_count', '/swap_count', 'equals 1', 'effect_count_mismatch', "value['swap_count'] != 1")])
phase('se_index_failed', '_transition settle (index failure): no effect or swap committed.', [
    ('SE06_effect_count', '/effect_count', 'equals 0', 'committed_effect_cannot_fail', "value['effect_count'] != 0"),
    ('SE07_swap_count', '/swap_count', 'equals 0', 'committed_effect_cannot_fail', "value['swap_count'] != 0")])
phase('se_once', '_transition settle (non-index success): no effect has happened.', [
    ('SE08_effect_count', '/effect_count', 'equals 0', 'repeated_effect', "value['effect_count'] != 0")])
phase('se_failed', '_transition settle (non-index failure): no effect committed.', [
    ('SE09_effect_count', '/effect_count', 'equals 0', 'committed_effect_cannot_fail', "value['effect_count'] != 0")])
phase('ac_phase', '_transition advance_completed: the effect is committed.', [
    ('AC01_phase', '/operation/phase', 'is effect_committed', 'terminal_receipt_missing', "value['phase'] != 'effect_committed'")])
retained_chain('cut', 'terminal_receipt_missing', 'custody (terminal original)')
access_phase('rr_access', 'RR', '_transition retry and replay')
phase('rr_event', '_transition retry and replay: the requested event is a phase of this operation.', [
    ('RR03_event', '/event_type', 'equals the operation event type of its phase suffix', 'original_missing',
     "value['event_type'] != value['expected_event_type']")])
retained_chain('cuo', 'original_missing', 'custody (requested original)')
phase('rr_value', '_transition retry and replay: the supplied value is the retained original.', [
    ('RR04_value', '/value', 'equals the retained original full value', 'original_value_changed',
     "value['value_matches'] is not True")])
access_phase('rc_access', 'RC', '_transition recover')
operation_chain('opa', 'invalid_operation_after', '_transition (post-state)')
target_chain('tgoa', 'invalid_operation_after', 'valid_operation (post-state prepared target)')

# --------------------------------------------------------------- history readers
access_phase('rh_access', 'RH', 'read_history and read_canonical_history')
phase('rh_event', 'read_history and read_canonical_history: the read names a phase event of this operation.', [
    ('RH03_suffix', '/event', 'ends in started or completed', 'unknown_event', "value['suffix'] not in ('started', 'completed')"),
    ('RH04_event', '/event', 'equals the operation event type of its suffix', 'unknown_event',
     "value['suffix'] in ('started', 'completed') and value['event'] != value['expected_event_type']")])
history_chain('hm', 'original_missing', 'read_canonical_history (requested original)')

# --------------------------------------------------------------- reduced boundary (accept)
CANDIDATE = 'boundary_refused'
phase('bd_schema', 'accept: the candidate payload satisfies the family payload schema.', [
    ('BD01_payload_schema', '/payload', 'satisfies the family payload schema', 'invalid_payload', "value['payload_valid'] is not True")])
phase('bd_zone', 'accept: the candidate occurrence time takes the frozen operation time profile (shared CV-1101 storage_utc_z).', [
    ('BD02_utc_zone', '/payload/occurred_at_utc', 'is accepted by the shared date_time predicate under storage_utc_z', CANDIDATE,
     "value['utc_z'] is not True")])
phase('bd_flags', 'accept: admission, the withdrawal fence and access.', [
    ('BD03_admitted', '/context/admitted', 'is exactly true', 'not_admitted', "value['admitted'] is not True"),
    ('BD04_withdrawn', '/context/withdrawn', 'is exactly false', ACCESS, "value['withdrawn'] is not False"),
    ('BD05_permission', '/context/permission', 'is exactly true', ACCESS, "value['permission'] is not True")])
phase('bd_scope', 'accept: the payload names the context Project, operation and source revision.', [
    ('BD06_project', '/payload/project_id', 'equals the context Project', CANDIDATE, "value['project_id'] != value['context_project_id']"),
    ('BD07_operation', '/payload/operation_id', 'equals the context operation', CANDIDATE,
     "value['operation_id'] != value['context_operation_id']"),
    ('BD08_source', '/payload/source_revision_sha256', 'equals the context source revision', CANDIDATE,
     "value['source_revision_sha256'] != value['context_source_revision_sha256']")])
phase('bd_snapshot', 'accept: the request and source snapshots are current.', [
    ('BD09_request_matches', '/context/request_matches', 'is exactly true', CANDIDATE, "value['request_matches'] is not True"),
    ('BD10_current_source', '/context/current_source', 'is exactly true', CANDIDATE, "value['current_source'] is not True")])
phase('bd_request', 'accept: the operation request digest equals the context request.', [
    ('BD11_request', '/context/operation/request_sha256', 'equals the context request digest', CANDIDATE,
     "value['request_sha256'] != value['context_request_sha256']")])
phase('bd_payload', 'accept: the payload equals the payload recomputed from the operation.', [
    ('BD12_payload', '/payload', 'equals the recomputed payload', CANDIDATE, "value['payload_matches'] is not True")])
phase('bd_terminal', 'accept (completed): start receipt, settled effect and retained full value flags.', [
    ('BD13_started_receipt', '/context/started_receipt', 'is exactly true', CANDIDATE, "value['started_receipt'] is not True"),
    ('BD14_effect_settled', '/context/effect_settled', 'is exactly true', CANDIDATE, "value['effect_settled'] is not True"),
    ('BD15_original_full_value', '/context/original_full_value', 'is exactly true', CANDIDATE,
     "value['original_full_value'] is not True"),
])
phase('bd_terminal_phase', 'accept (completed): the row has committed its effect (defence in depth: BD12 decides first).', [
    ('BD16_phase', '/context/operation/phase', 'is effect_committed or completed', CANDIDATE,
     "value['phase'] not in ('effect_committed', 'completed')")])
phase('bd_terminal_start', 'accept (completed): the payload names the context start event.', [
    ('BD17_started_event', '/payload/started_event_id', 'equals the context start event id', CANDIDATE,
     "value['started_event_id'] != value['context_started_event_id']")])
phase('bd_durable', 'accept (started): the acceptance is durable.', [
    ('BD18_acceptance_durable', '/context/acceptance_durable', 'is exactly true', CANDIDATE, "value['acceptance_durable'] is not True")])
retained_chain('bdo', CANDIDATE, 'accept (requested original)')
phase('bd_completed', 'accept: a completed row keeps its retained terminal original.', [
    ('BD19_completed_original', '/context/originals/<completed>', 'a completed row has its retained terminal original', CANDIDATE,
     "value['completed_row'] is True and value['original_present'] is not True")])

# --------------------------------------------------------------- SP-278 checkpoint join
CK = 'checkpoint_join'
phase('ck_envelope', 'checkpoint_identity_matches: the retained envelope and the checkpoint schema.', [
    ('CK01_envelope', '/value', 'satisfies its closed retained envelope edition', CK, "value['envelope_valid'] is not True"),
    ('CK02_checkpoint_schema', '/checkpoint/checkpoint', 'satisfies the SP-278 checkpoint schema', CK,
     "value['checkpoint_valid'] is not True")])
phase('ck_store', 'checkpoint_identity_matches: checkpoint Store and key.', [
    ('CK03_store', '/checkpoint/checkpoint/storage_instance_id', 'equals the operation Store', CK,
     "value['checkpoint_storage_instance_id'] != value['storage_instance_id']"),
    ('CK04_key', '/checkpoint/checkpoint_key', 'equals event_record_index_checkpoint.v1: plus the Store', CK,
     "value['checkpoint_key'] != value['expected_checkpoint_key']")])
phase('ck_event', 'checkpoint_identity_matches: event family and identity.', [
    ('CK05_event_type', '/value/event_type', 'equals the checkpointed family', CK, "value['event_type'] != value['expected_event_type']"),
    ('CK06_event_id', '/value/event_id', 'equals the recomputed event id', CK, "value['event_id'] != value['expected_event_id']"),
    ('CK07_idempotency_key', '/value/idempotency_key', 'equals the recomputed key', CK,
     "value['idempotency_key'] != value['expected_idempotency_key']"),
])
phase('ck_scope', 'checkpoint_identity_matches: Project scope (defence in depth: the retained envelope pins it, CK01 first).', [
    ('CK08_scope_kind', '/value/scope_kind', 'is project', CK, "value['scope_kind'] != 'project'")])
phase('ck_project', 'checkpoint_identity_matches: Project and payload.', [
    ('CK09_project', '/value/project_id', 'equals the operation Project', CK, "value['project_id'] != value['expected_project_id']"),
    ('CK10_payload', '/value/payload', 'equals the payload recomputed from the operation', CK, "value['payload_matches'] is not True")])

# --------------------------------------------------------------- Card 1b archive families (pm_memory_archive_events.py)
phase('cg_present', 'cutoff_gate: the operation names an approved cutoff authority.', [
    ('CG01_available', '/cutoff_authorities/<cutoff_ref>', 'is present', 'cutoffs_unavailable', "value['record_present'] is not True")])
phase('cg_record', 'cutoff_gate: the cutoff authority record has exactly its six fields.', [
    ('CG02_record', '/cutoff_authorities/<cutoff_ref>', 'is an object with exactly the six cutoff fields', 'cutoff_record',
     "value['shape_valid'] is not True")])
phase('cg_body', 'cutoff_gate: reference, uniqueness, job, scope, Project and commitment.', [
    ('CG03_reference', '/cutoff_ref', 'the record names the operation cutoff reference', 'cutoff_reference',
     "value['record_cutoff_ref'] != value['cutoff_ref']"),
    ('CG04_unique', '/cutoff_authorities', 'at most one authority names the reference', 'cutoff_unique', "value['naming_count'] > 1"),
    ('CG05_job', '/job', 'equals the operation job', 'cutoff_scope', "value['job'] != value['expected_job']"),
    ('CG06_scope_kind', '/scope_kind', 'is project', 'cutoff_scope', "value['scope_kind'] != 'project'"),
    ('CG07_project', '/project_id', 'equals the operation Project', 'cutoff_scope', "value['project_id'] != value['expected_project_id']")])
phase('cg_commitment', 'cutoff_gate: the operation commits to the cutoff record digest.', [
    ('CG08_commitment', '/cutoff_sha256', 'equals the digest of the cutoff record', 'cutoff_commitment',
     "value['cutoff_sha256'] != value['record_sha256']")])
phase('ac_flags', 'archive_candidate: memory pin and archive flags are exact Booleans.', [
    ('ACF01_memory_flags', '/memories', 'an object of objects whose pinned and archived are exact Booleans', 'memory_flags',
     "value['flags_valid'] is not True")])
phase('ac_fields', 'archive_candidate: every memory carries evidence_refs and version_ref.', [
    ('ACF02_memory_fields', '/memories/*', 'carries evidence_refs and version_ref', 'memory_fields', "value['missing_fields'] != []")])
phase('ac_ids_type', 'archive_candidate: the selection is an exact list of exact strings.', [
    ('ACS01_ids_type', '/selected_ids', 'is an exact list of exact strings', 'selection_ids_type', "value['ids_valid'] is not True")])
phase('ac_selection', 'archive_candidate: uniqueness, existence, pins, kind and evidence types of the selection.', [
    ('ACS02_unique', '/selected_ids', 'is sorted and unique', 'selection_unique', "value['selected_ids'] != value['sorted_unique_ids']"),
    ('ACS03_exists', '/selected_ids/*', 'names an existing memory', 'selection_exists', "value['missing_ids'] != []"),
    ('ACS04_pinned', '/memories/<selected>/pinned', 'is not true', 'selection_pinned', "value['pinned_ids'] != []"),
    ('ACS05_kind', '/memories/<selected>/kind', 'is Note for monthly summary', 'selection_kind', "value['non_note_ids'] != []"),
    ('ACS06_evidence_type', '/memories/<selected>/evidence_refs', 'is an exact list of exact strings', 'selection_evidence_type',
     "value['bad_evidence_ids'] != []")])
phase('ps_scope', 'selection_checks: one nonempty Project and every unpinned selected original in it.', [
    ('PS01_project_type', '/project_id', 'is a string', 'selection_scope', "value['project_type'] != 'str'"),
    ('PS02_project_nonempty', '/project_id', 'is nonempty', 'selection_scope', "value['project_type'] == 'str' and value['project_empty'] is True"),
    ('PS03_members', '/memories/<selected>/project_id', 'equals the snapshot Project', 'selection_scope', "value['foreign_ids'] != []")])
phase('ps_active', 'selection_checks: no unpinned selected original is already archived.', [
    ('PS04_active', '/memories/<selected>/archived', 'is not true', 'selection_active', "value['archived_ids'] != []")])
phase('pt_instant', 'instant: a policy timestamp is an exact string the shared CV-1101 date_time predicate accepts (broad RFC 3339 profile).', [
    ('PT01_type', '/<timestamp>', 'is an exact string', 'selection_timestamp', "value['value_type'] != 'str'"),
    ('PT02_format', '/<timestamp>', 'is accepted by the shared CV-1101 date_time predicate (event_record profile)', 'selection_timestamp',
     "value['value_type'] == 'str' and value['conforms'] is not True")])
phase('ps_age', 'selection_checks: every unpinned selected original is idle for at least the approved days.', [
    ('PS05_age', '/memories/<selected>', 'idle (later of edit and access, else creation) at least the cutoff days', 'selection_age',
     "value['young_ids'] != []")])
phase('ps_score', 'selection_checks: exact finite scores below the approved cutoff.', [
    ('PS06_score_type', '/memories/<selected>/usefulness_score', 'is an exact finite int, float or Decimal', 'selection_score_type',
     "value['bad_type_ids'] != []"),
    ('PS07_score', '/memories/<selected>/usefulness_score', 'is below the approved cutoff', 'selection_score',
     "value['bad_type_ids'] == [] and value['high_ids'] != []")])
phase('av_before_flags', 'archive_checks: exact pin and archive flags before.', [
    ('AV01_before_flags', '/before/memories', 'pinned and archived are exact Booleans', 'memory_flags', "value['before_valid'] is not True")])
phase('av_after_flags', 'archive_checks: exact pin and archive flags after.', [
    ('AV02_after_flags', '/after/memories', 'pinned and archived are exact Booleans', 'memory_flags', "value['after_valid'] is not True")])
phase('av_fields', 'archive_checks: every output memory carries evidence_refs and version_ref.', [
    ('AV03_fields', '/after/memories/*', 'carries evidence_refs and version_ref', 'memory_fields', "value['missing_fields'] != []")])
phase('av_snapshot', 'archive_checks: every snapshot field the job does not write is preserved exactly.', [
    ('AV04_snapshot', '/after', 'every field except memories and summary is preserved exactly', 'snapshot_preserved',
     "value['snapshot_same'] is not True")])
phase('av_preserve', 'archive_checks: originals, evidence, versions, selected fields and pins.', [
    ('AV05_originals', '/after/memories', 'keeps every original', 'originals_preserved', "value['lost_ids'] != []"),
    ('AV06_evidence', '/after/memories/*/evidence_refs', 'is preserved exactly', 'evidence_preserved', "value['evidence_changed'] != []"),
    ('AV07_versions', '/after/memories/*/version_ref', 'is preserved exactly', 'versions_preserved', "value['versions_changed'] != []"),
    ('AV08_selected_fields', '/after/memories/<selected>', 'every field except archived, evidence and version is preserved', 'selected_fields_preserved',
     "value['selected_changed'] != []"),
    ('AV09_pins', '/after/memories/<pinned>', 'is preserved exactly', 'pins_preserved', "value['pins_changed'] != []")])
phase('av_disposition', 'archive_checks: selected archived, unselected unchanged, no extra memory.', [
    ('AV10_selected_archived', '/after/memories/<selected>/archived', 'is true', 'selected_archived', "value['unarchived_ids'] != []"),
    ('AV11_unselected', '/after/memories/<unselected>', 'is preserved exactly', 'unselected_preserved', "value['unselected_changed'] != []"),
    ('AV12_no_extra', '/after/memories', 'adds no memory', 'no_extra_memories', "value['extra_ids'] != []")])
phase('av_summary', 'archive_checks (monthly summary): the summary keeps its originals and evidence.', [
    ('AV13_summary', '/after/summary', 'equals the selected ids and the union of their evidence', 'summary_provenance',
     "value['summary_matches'] is not True")])
phase('av_no_summary', 'archive_checks (prune): prune creates, changes or deletes no summary.', [
    ('AV14_summary_presence', '/after/summary', 'is present exactly when it was present before', 'no_prune_summary',
     "value['present_after'] != value['present_before']"),
    ('AV15_summary_value', '/after/summary', 'equals the summary before', 'no_prune_summary', "value['summary_same'] is not True")])
phase('at_scope', 'archive transition (settle success): the archive snapshot is the operation Project.', [
    ('AT01_scope', '/archive/project_id', 'equals the operation Project', 'selection_scope', "value['project_id'] != value['operation_project_id']")])
phase('aa_envelope', 'archive append_current: the candidate satisfies the current EventRecord envelope.', [
    ('AA02_envelope_schema', '/', 'satisfies the current memory EventRecord schema', 'envelope_schema', "value['envelope_valid'] is not True")])
phase('aa_gate', 'archive append_current: replay policy, admission, access and the withdrawal fence.', [
    ('AA03_replay_only', '/replay_policy', 'is not projector_replay_only', 'replay_only_not_appendable',
     "value['replay_policy'] == 'projector_replay_only'"),
    ('AA04_replay_policy', '/replay_policy', 'is dedupe_by_idempotency_key', 'replay_policy',
     "value['replay_policy'] != 'projector_replay_only' and value['replay_policy'] != 'dedupe_by_idempotency_key'"),
    ('AA05_admitted', '/admitted', 'is exactly true', 'admission', "value['admitted'] is not True"),
    ('AA06_permission', '/permission', 'is exactly true', ACCESS, "value['permission'] is not True"),
    ('AA07_withdrawn', '/withdrawn', 'is exactly false', ACCESS, "value['withdrawn'] is not False")])
operation_chain('aop', 'operation_valid', 'archive append_current')
phase('aa_producer', 'archive append_current: producer fields (payload and replay policy excluded) equal the canonical value.', [
    ('AA08_producer_join', '/<producer fields>', 'equal the recomputed canonical value', 'producer_join', "value['mismatched_fields'] != []")])
phase('aa_payload', 'archive append_current: the payload satisfies the family payload schema.', [
    ('AA09_payload_schema', '/payload', 'satisfies the family payload schema', 'payload_schema', "value['payload_valid'] is not True")])
phase('aa_payload_join', 'archive append_current: every recomputed payload field is carried exactly.', [
    ('AA10_payload_join', '/payload/<fields>', 'equal the recomputed payload fields', 'payload_join', "value['mismatched_fields'] != []")])
phase('aa_partition', 'archive append_current: the dedupe key uses the encoded project~ partition (CV-365).', [
    ('AA11_partition', '/dedupe_key', 'equals [project~ partition, event type, idempotency key]', 'partition',
     "value['dedupe_key'] != value['expected_dedupe_key']")])
retained_chain('aao', 'original_value', 'archive append_current (returned terminal original)', binding=False)
phase('aao_envelope', 'archive append_current (returned terminal original): the retained envelope edition.', [
    ('AAO05_envelope', '/original/full_value', 'satisfies its closed retained envelope edition', 'original_value',
     "value['envelope_valid'] is not True")])
phase('aao_projection', 'archive append_current (returned terminal original): the non-Storage projection equals the candidate.', [
    ('AAO06_projection', '/original/full_value', 'the non-Storage fields equal the retry candidate', 'original_value',
     "value['projection_matches'] is not True")])
phase('aa_phase', 'archive append_current: a new append requires its lawful operation phase.', [
    ('AA12_phase', '/operation/phase', 'is accepted for started and effect_committed for completed', 'phase',
     "value['phase'] != value['required_phase']")])
retained_chain('asc', START, 'archive start_custody_gate (started writer canonical original)', binding=False)
phase('asc_object', 'archive start_custody_gate (started writer canonical original): the full value is an object.', [
    ('ASC00_object', '/original/full_value', 'is an object', START, "value['is_object'] is not True")])
phase('asc_envelope', 'archive start_custody_gate (started writer canonical original): the retained envelope edition.', [
    ('ASC05_envelope', '/original/full_value', 'satisfies its closed retained envelope edition', START, "value['envelope_valid'] is not True")])
phase('asc_payload_schema', 'archive start_custody_gate (started writer canonical original): the started payload schema.', [
    ('ASC06_payload_schema', '/original/full_value/payload', 'satisfies the started payload schema', START, "value['payload_valid'] is not True")])
phase('asc_joins', 'archive start_custody_gate (started writer canonical original): producer, policy and payload binding.', [
    ('ASC07_producer', '/original/full_value', 'producer fields (payload and replay policy excluded) equal the reference', START,
     "value['producer_matches'] is not True"),
    ('ASC08_replay_policy', '/original/full_value/replay_policy', 'equals the reference replay policy', START,
     "value['replay_policy'] != value['reference_replay_policy']"),
    ('ASC09_payload', '/original/full_value/payload', 'equals the reference payload', START, "value['payload_matches'] is not True")])

# --------------------------------------------------------------- Card 6 dedup (pm_memory_policy.py)
DI = 'dedup_input_shape'
phase('dc_input', 'dedup_candidate: input memories, merge records and member fields.', [
    ('DC01_memories', '/memories', 'is an object', DI, "value['memories_type'] != 'dict'"),
    ('DC02_merge_records', '/merge_records', 'is an array', DI, "value['merge_records_type'] != 'list'"),
    ('DC03_members', '/memories/*', 'is an object', DI, "value['memories_type'] == 'dict' and value['nonobject_ids'] != []"),
    ('DC04_member_evidence', '/memories/*/evidence_refs', 'is present', DI,
     "value['memories_type'] == 'dict' and value['no_evidence_ids'] != []"),
    ('DC05_member_versions', '/memories/*/versions', 'is present', DI,
     "value['memories_type'] == 'dict' and value['no_versions_ids'] != []")])
phase('dc_group_type', 'dedup_candidate: the eligible group is an exact list.', [
    ('DC06_group_type', '/eligible_ids', 'is an exact list', 'dedup_eligible_group', "value['ids_type'] != 'list'")])
phase('dc_group_min', 'dedup_candidate: the eligible group has at least two originals.', [
    ('DC07_group_minimum', '/eligible_ids', 'has at least two ids', 'dedup_eligible_group', "value['count'] < 2")])
phase('dc_group_exists', 'dedup_candidate: every eligible id is an exact string naming an existing memory.', [
    ('DC08_group_exists', '/eligible_ids/*', 'is an exact string naming an existing memory', 'dedup_eligible_group',
     "value['bad_ids'] != []")])
phase('dc_group_unique', 'dedup_candidate: eligible ids are unique.', [
    ('DC09_group_unique', '/eligible_ids', 'has no repeated id', 'dedup_eligible_group', "value['count'] != value['distinct_count']")])
phase('dc_flags', 'dedup_candidate and dedup_checks: every input memory pin and archive flag is an exact Boolean.', [
    ('DC10_pinned_type', '/memories/*/pinned', 'is an exact Boolean', 'dedup_flags', "value['bad_pinned_ids'] != []"),
    ('DC11_archived_type', '/memories/*/archived', 'is an exact Boolean', 'dedup_flags', "value['bad_archived_ids'] != []")])
phase('dc_protected', 'dedup_candidate: no pinned or archived original enters the group (DL-444).', [
    ('DC12_not_pinned', '/memories/<group>/pinned', 'is false', 'dedup_protected', "value['pinned_ids'] != []"),
    ('DC13_not_archived', '/memories/<group>/archived', 'is false', 'dedup_protected', "value['archived_ids'] != []")])
phase('dc_scope', 'dedup_candidate: one nonempty Project and every group member in it.', [
    ('DC14_project_type', '/project_id', 'is a string', 'dedup_scope', "value['project_type'] != 'str'"),
    ('DC15_project_nonempty', '/project_id', 'is nonempty', 'dedup_scope', "value['project_type'] == 'str' and value['project_empty'] is True"),
    ('DC16_members', '/memories/<group>/project_id', 'equals the snapshot Project', 'dedup_scope', "value['foreign_ids'] != []")])
phase('dc_hash_type', 'dedup_candidate: every group embed_text_hash is an exact string.', [
    ('DC17_hash_type', '/memories/<group>/embed_text_hash', 'is an exact string', 'dedup_identical', "value['bad_hash_ids'] != []")])
phase('dc_hash', 'dedup_candidate: the group shares one embed_text_hash.', [
    ('DC18_identical', '/memories/<group>/embed_text_hash', 'is one value for the whole group', 'dedup_identical',
     "value['distinct_hashes'] != 1")])
phase('dc_evidence_type', 'dedup_candidate: every group evidence list is an exact list of exact strings.', [
    ('DC19_evidence_type', '/memories/<group>/evidence_refs', 'is an exact list of exact strings', 'dedup_evidence_type',
     "value['bad_evidence_ids'] != []")])
DO = 'dedup_output_shape'
phase('dv_shape', 'dedup_checks: the outcome has the shape the postconditions read.', [
    ('DV01_memories', '/memories', 'is an object', DO, "value['memories_type'] != 'dict'"),
    ('DV02_members', '/memories/*', 'is an object', DO, "value['memories_type'] == 'dict' and value['nonobject_ids'] != []"),
    ('DV03_member_fields', '/memories/*', 'carries evidence_refs, versions and archived', DO,
     "value['memories_type'] == 'dict' and value['missing_field_ids'] != []"),
    ('DV04_records', '/merge_records', 'is an array', DO, "value['records_type'] != 'list'"),
    ('DV05_records_nonempty', '/merge_records', 'is nonempty', DO, "value['records_type'] == 'list' and value['records_count'] == 0"),
    ('DV06_record_object', '/merge_records/-1', 'is an object', DO,
     "value['records_type'] == 'list' and value['records_count'] > 0 and value['last_type'] != 'dict'"),
    ('DV07_record_fields', '/merge_records/-1', 'has exactly original_ids, survivor_id and original_evidence_refs', DO,
     "value['last_type'] == 'dict' and value['last_keys'] != ['original_evidence_refs', 'original_ids', 'survivor_id']")])
phase('dv_snapshot', 'dedup_checks: every snapshot field the job does not write is preserved exactly.', [
    ('DV08_snapshot', '/', 'every field except memories and merge_records is preserved exactly', 'dedup_snapshot',
     "value['snapshot_same'] is not True")])
phase('dv_survivor', 'dedup_checks: the survivor is the oldest original, tie broken by note id (DL-444).', [
    ('DV09_survivor', '/merge_records/-1/survivor_id', 'equals the oldest eligible original', 'dedup_survivor',
     "value['survivor_matches'] is not True")])
phase('dv_originals', 'dedup_checks: the outcome keeps exactly the input originals.', [
    ('DV10_originals', '/memories', 'has exactly the input memory ids', 'dedup_originals', "value['same_ids'] is not True")])
phase('dv_lineage', 'dedup_checks: earlier merge records and the new record lineage.', [
    ('DV11_prior_records', '/merge_records/0..-2', 'are preserved exactly', 'dedup_lineage', "value['prior_same'] is not True"),
    ('DV12_original_ids', '/merge_records/-1/original_ids', 'equals the sorted eligible ids', 'dedup_lineage', "value['ids_same'] is not True"),
    ('DV13_original_evidence', '/merge_records/-1/original_evidence_refs', 'equals every eligible original evidence list', 'dedup_lineage',
     "value['evidence_same'] is not True")])
phase('dv_evidence', 'dedup_checks: the survivor holds the evidence union; every other original is unchanged.', [
    ('DV14_evidence', '/memories/*/evidence_refs', 'is the union for the survivor and preserved otherwise', 'dedup_evidence',
     "value['changed_ids'] != []")])
phase('dv_versions', 'dedup_checks: every original keeps its versions exactly.', [
    ('DV15_versions', '/memories/*/versions', 'is preserved exactly', 'dedup_versions', "value['changed_ids'] != []")])
phase('dv_disposition', 'dedup_checks: every non-survivor is archived and the survivor is not (DL-445).', [
    ('DV16_disposition', '/memories/<group>/archived', 'is true exactly for the non-survivors', 'dedup_disposition',
     "value['wrong_ids'] != []")])
phase('dv_links', 'dedup_checks: survivor links (DL-445).', [
    ('DV17_member_links', '/memories/<non-survivor>/survivor_id', 'names the survivor', 'dedup_links', "value['unlinked_ids'] != []"),
    ('DV18_survivor_link', '/memories/<survivor>/survivor_id', 'is preserved exactly (no new self link)', 'dedup_links',
     "value['survivor_link_same'] is not True")])
phase('dv_fields', 'dedup_checks: every other field of a group original is preserved.', [
    ('DV19_original_fields', '/memories/<group>', 'every field except evidence, versions, archived and survivor_id is preserved',
     'dedup_original_fields', "value['changed_ids'] != []")])
phase('dv_unselected', 'dedup_checks: every original outside the group is preserved exactly.', [
    ('DV20_unselected', '/memories/<other>', 'is preserved exactly', 'dedup_unselected', "value['changed_ids'] != []")])


HEADER = '''"""DMEM guard table {phase}: {doc}

Generated by scripts/pm-memory-table-generate.py; do not edit by hand.
Method B guard rows for the DMEM checkers. Each predicate reads one
observation record that the checker derives from the complete boundary input
(recomputed identities and digests, encoded sizes, schema verdicts, presence
facts and mismatch lists); predicates never recompute, repair or call helpers.
The checker refuses only through these rows, in this order
(pm_memory_maintenance_events.py:table_refusal), and asserts that every
factory requires its rows in table order. FIELDS names every observation the
rows read; the checker passes exactly these.
"""
import pm_guard_isolation as g

FIELDS = {fields}
'''


INDEX = '''"""DMEM guard-table index: every phase table module, in spec order.

Generated by scripts/pm-memory-table-generate.py; do not edit by hand.
"""
PHASES = (
{phases})
'''


def render(name, doc, rows):
    fields = []
    for _, _, _, _, condition in rows:
        for key in re.findall(r"value\['([a-z_0-9]+)'\]", condition):
            if key not in fields:
                fields.append(key)
    out = [HEADER.format(phase=name, doc=doc, fields=repr(tuple(fields)))]
    for row, _, _, code, condition in rows:
        out.append(f'\n\ndef {row}(value, context):\n    return {code!r} if {condition} else None\n')
    guards = ''.join(f"        g.Guard({row!r}, g.Invariant({field!r}, {words!r}), {code!r}, {row}),\n"
                     for row, field, words, code, _ in rows)
    requires = ''.join(f"        table.require({row!r}, value, context)\n" for row, *_ in rows)
    out.append(f'\n\ndef case(value):\n    context = None\n    table = g.GuardTable([\n{guards}    ])\n\n'
               f'    def check(value):\n{requires}        return True\n    return g.Case(table, check, context)\n')
    return ''.join(out)


def main():
    out = Path(sys.argv[1])
    check = '--check' in sys.argv[2:]
    names = [row[0] for _, rows in PHASES.values() for row in rows]
    assert len(names) == len(set(names)), 'duplicate row name'
    expected = {f'pm_memory_table_{name}.py': render(name, *spec) for name, spec in PHASES.items()}
    problems = []
    for path in sorted(out.glob('pm_memory_table_*.py')):
        if path.name not in expected:
            problems.append('extra ' + path.name)
            if not check:
                path.unlink()
    expected['pm_memory_tables.py'] = INDEX.format(phases=''.join(f'    {name!r},\n' for name in PHASES))
    for filename, text in expected.items():
        path = out / filename
        if check:
            if not path.exists() or path.read_text() != text:
                problems.append('stale ' + filename)
        else:
            path.write_text(text)
    if check:
        print('\n'.join(problems) or f'{len(expected)} DMEM table modules current ({len(names)} rows)')
        return 1 if problems else 0
    print(f'wrote {len(expected)} DMEM table modules ({len(names)} rows)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
