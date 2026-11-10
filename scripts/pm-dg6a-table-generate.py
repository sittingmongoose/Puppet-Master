#!/usr/bin/env python3
"""Write the DG6A Method B phase-table modules (scripts/pm_dg6a_table_*.py) from one row spec.

Usage: python3 scripts/pm-dg6a-table-generate.py scripts          (write)
       python3 scripts/pm-dg6a-table-generate.py scripts --check  (exit 1 on a stale or extra module)

Spec rows: (name, field, words, code, condition). The condition is the refusal condition over the
phase observation `value`, which holds exactly the module's FIELDS. The generated modules are the
checked-in source; edit a row here, regenerate and commit both. The DG6A checkers refuse only
through these rows (scripts/pm_dg6a_tables.py `first`/`every`). The nine hand-written phase modules
of the first pass (HANDWRITTEN) are kept as they are and are not managed here.
"""
import sys
from pathlib import Path

PREFIX = 'pm_dg6a_table_'
HANDWRITTEN = {'decision_citation', 'storage_schema', 'current_header', 'current_context', 'profile',
               'writer_policy', 'cursor', 'panel_scope', 'concern_scope'}
MODULES = {}


def module(name, doc, rows):
    assert name not in MODULES and name not in HANDWRITTEN, name
    assert 1 <= len(rows) <= 16, (name, len(rows))
    assert len({r[0] for r in rows}) == len(rows), name
    MODULES[name] = (doc, rows)


def v(fact):
    return f"value[{fact!r}]"


def chain(items, guard=None):
    """Early-return order: each row refuses only when every earlier fact holds.

    items: (row, fact, words, code). `guard` is an applicability condition prefixed to every row.
    """
    rows, earlier = [], []
    for row, fact, words, code in items:
        parts = ([guard] if guard else []) + [f'{v(f)} is True' for f in earlier] + [f'{v(fact)} is not True']
        rows.append((row, '/' + fact, words, code, ' and '.join(parts)))
        earlier.append(fact)
    return rows


def flat(items):
    """Independent collect-all rows: each refuses exactly when its own fact fails."""
    return [(row, '/' + fact, words, code, f'{v(fact)} is not True') for row, fact, words, code in items]


def verdict(name, subject, code):
    module(name, f'Schema occurrence: {subject}.', [
        (name.upper().replace('SCH_', '') + '_schema', '/schema_errors',
         f'{subject} validates (exact Draft 2020-12 types, enforced lane formats)', code,
         f"{v('schema_errors')} != 0"),
    ])


# ------------------------------------------------------------------ schema documents (standing check 9)
module('schema_document', 'A contract schema document is a valid Draft 2020-12 schema.', [
    ('SD01_metaschema', '/metaschema_valid', 'the schema validates against its metaschema (check_schema)',
     'invalid schema contract', f"{v('metaschema_valid')} is not True"),
])
module('schema_ref', 'Every local $ref of a schema document resolves, unused definitions included (one call per reference).',
       chain([
           ('SR01_local', 'local', "the reference is '#' or a '#/' JSON pointer", 'unresolved schema reference'),
           ('SR02_resolves', 'resolves', 'every pointer token names an existing member or index', 'unresolved schema reference'),
           ('SR03_target_schema', 'target_schema', 'the target is a schema (object or boolean)', 'unresolved schema reference'),
       ]))

# ------------------------------------------------------------------ alert payload (errors)
verdict('sch_alert_payload', 'the alert family payload', 'sch_alert_payload_schema')
module('alert_payload', 'Alert payload facts after the schema and writer policy accept (collect-all).',
       flat([('AP01_successor', 'successor', 'result_revision is prior_revision + 1', 'non-successor')])
       + chain([
           ('AP02_current', 'current', 'the guard current flag is exactly true', 'uncommitted/stale/refused'),
           ('AP03_allowed', 'allowed', 'the guard allowed flag is exactly true', 'uncommitted/stale/refused'),
           ('AP04_committed', 'committed', 'the guard committed flag is exactly true', 'uncommitted/stale/refused'),
       ])
       + flat([
           ('AP05_protection_bool', 'protection_is_bool', 'the protection proof is an exact boolean', 'invalid protection proof'),
           ('AP06_snooze_live', 'snooze_live', 'snooze_until, when present, is after ts (exact instant order)', 'expired snooze'),
       ])
       + [('AP07_no_protected_interruption', '/protected_truthy',
           'a snooze or rule mute never interrupts a protected alert', 'protected interruption',
           f"{v('interrupting_command')} is True and {v('protected_truthy')} is True")])

# ------------------------------------------------------------------ alert operation (operation_errors)
verdict('sch_alert_operation', 'the alert operation value', 'sch_alert_operation_schema')
module('alert_operation_size', 'Alert operation physical size (SP-337 inline limit).', [
    ('OS01_inline_size', '/encoded_bytes', 'the canonical MessagePack operation is at most 16384 bytes',
     'operation exceeds 16384 encoded bytes', f"{v('encoded_bytes')} > 16384"),
])
module('alert_operation_identity', 'Alert operation identity, frozen request digest and command presence (collect-all).', flat([
    ('OI01_operation_digest', 'operation_digest_exact', 'operation_digest is the recomputed identity digest',
     'operation identity digest mismatch'),
    ('OI02_event_id', 'event_id_exact', 'event_id is evt_<family>_<identity digest>', 'event identity mismatch'),
    ('OI03_request_digest', 'request_digest_exact', 'request_digest is the recomputed frozen command/payload digest',
     'frozen command digest mismatch'),
    ('OI04_command_fields', 'command_fields_present', 'the command carries every non-result payload field',
     'original command/payload field presence'),
]))
ALERT_COMMAND_KEYS = ('acknowledgement_reason_code', 'actor_ref', 'alert_id', 'alert_record_ref', 'alert_rule_id',
                      'alert_rule_ref', 'command_id', 'correlation_id', 'currentness_basis_ref', 'dismissal_reason_code',
                      'evidence_refs', 'handler_target', 'idempotency_key', 'mute_expires_at', 'mute_reason_code',
                      'mute_scope', 'origin', 'prior_acknowledgement_state', 'prior_alert_state', 'prior_mute_state',
                      'prior_revision', 'project_id', 'snooze_reason_code', 'snooze_until', 'source_refs', 'ts')
for part, keys in (('a', ALERT_COMMAND_KEYS[:13]), ('b', ALERT_COMMAND_KEYS[13:])):
    module('alert_command_keys_' + part, 'Each original command field equals the payload field (one row per field).', flat([
        (f'OK{i:02d}_{key}', key, f'original_command.{key}, when present, equals payload.{key}',
         'original command/payload ' + key) for i, key in enumerate(keys, 1 if part == 'a' else 14)]))
module('alert_operation_joins', 'Alert operation/payload scope, key and revision joins (collect-all).', flat([
    ('OJ01_project', 'project_exact', 'operation project_id equals payload project_id', 'operation/payload project_id'),
    ('OJ02_key', 'key_exact', 'operation idempotency_key equals payload idempotency_key', 'operation/payload idempotency_key'),
    ('OJ03_successor', 'successor', 'result_revision is prior_revision + 1', 'non-successor'),
]))
OWNER_FIELDS = ('project_id', 'alert_id', 'alert_rule_id', 'source_record_ref', 'revision', 'acknowledgement_state', 'mute_state')
for side in ('prior', 'candidate'):
    module(f'alert_owner_{side}', f'The {side} owner snapshot agrees with the payload field by field (absent fields: not applicable).', flat([
        (f'{side[0].upper()}O{i:02d}_{field}', field, f'{side}_owner_state.{field}, when it applies to the family, equals its payload source',
         f'{side} owner {field}') for i, field in enumerate(OWNER_FIELDS, 1)]))
module('alert_candidate_state', 'Candidate owner state transition fields and live snooze (collect-all).', flat([
    ('CS01_root_cause_ref', 'root_cause_ref', 'a rule mute keeps root_cause_ref', 'candidate owner root_cause_ref'),
    ('CS02_mute_expires_at', 'mute_expires_at', 'a rule mute records the payload mute_expires_at', 'candidate owner mute_expires_at'),
    ('CS03_unread', 'unread', 'an alert transition sets unread as the family requires', 'candidate owner unread'),
    ('CS04_inbox_visible', 'inbox_visible', 'an alert transition sets inbox_visible as the family requires', 'candidate owner inbox_visible'),
    ('CS05_snooze_until', 'snooze_until', 'an alert transition sets snooze_until as the family requires', 'candidate owner snooze_until'),
    ('CS06_snooze_live', 'snooze_live', 'snooze_until, when present, is after ts (exact instant order)', 'expired snooze'),
]))

# ------------------------------------------------------------------ checkpoint (shared by every family)
verdict('sch_checkpoint', 'the family checkpoint value', 'sch_checkpoint_schema')
module('checkpoint_size', 'Checkpoint physical size.', [
    ('CZ01_inline_size', '/encoded_bytes', 'the canonical MessagePack checkpoint is at most 16384 bytes',
     'checkpoint exceeds 16384 encoded bytes', f"{v('encoded_bytes')} > 16384"),
])
module('checkpoint_token', 'Checkpoint Storage token and original-event context joins (collect-all).',
       chain([
           ('CT01_token_storage', 'token_storage', 'the token storage_instance_id equals the checkpoint storage_instance_id',
            'foreign Storage token'),
           ('CT02_selection_storage', 'selection_storage', 'the token source selection storage_instance_id equals the token storage_instance_id',
            'foreign Storage token'),
       ])
       + flat([(f'CT0{i}_{field}', field, f'the checkpoint {field}, when both carry it, equals the original-event context',
                'foreign original-event context: ' + field)
               for i, field in enumerate(('storage_instance_id', 'project_id', 'server_id', 'scope_partition'), 3)]))

# ------------------------------------------------------------------ protocol shape (alert, panel, concern)
module('protocol_shape', 'Protocol navigation containers, before any indexing (non-applicable members hold).', chain([
    ('PH01_context_object', 'context_object', 'the retry/recovery context is an object', 'invalid protocol shape'),
    ('PH02_members', 'members', 'the context carries every member its kind requires', 'invalid protocol shape'),
]) + [
    ('PH03_retry_command_object', '/retry_command_object', 'alert/panel: retry_command is an object', 'invalid protocol shape',
     f"{v('context_object')} is True and {v('members')} is True and {v('retry_command_object')} is not True"),
    ('PH04_retry_payload_object', '/retry_payload_object', 'alert/panel: retry_payload is an object', 'invalid protocol shape',
     f"{v('context_object')} is True and {v('members')} is True and {v('retry_payload_object')} is not True"),
    ('PH05_authority_object', '/authority_object', 'concern: authority is an object', 'invalid protocol shape',
     f"{v('context_object')} is True and {v('members')} is True and {v('authority_object')} is not True"),
    ('PH06_authority_members', '/authority_members', 'concern: authority carries every independent authority member',
     'invalid protocol shape',
     f"{v('context_object')} is True and {v('members')} is True and {v('authority_object')} is True and {v('authority_members')} is not True"),
])

# ------------------------------------------------------------------ alert protocol and retry
module('alert_protocol', 'Alert current retry evidence flags and original receipt (collect-all).', flat([
    ('PR01_admitted', 'admitted', 'the family admission flag is exactly true', 'admitted'),
    ('PR02_allowed', 'allowed', 'the permission flag is exactly true', 'allowed'),
    ('PR03_current', 'current', 'the currentness flag is exactly true', 'current'),
    ('PR04_source_verified', 'source_verified', 'the source verification flag is exactly true', 'source_verified'),
    ('PR05_receipt', 'receipt_exact', 'receipt_event_id equals the original event_id', 'wrong original receipt'),
]))
for caller, code in (('alert', 'idempotency_conflict'), ('panel', 'retry changed')):
    module(f'retry_current_{caller}', f'{caller} retry of a prepared operation: the frozen request digest (early return).', chain([
        ('RC01_preimage', 'preimage_ok', 'the retry command/payload preimage is in the semantic number and timestamp domain', code),
        ('RC02_digest', 'digest_equal', 'the recomputed retry request digest equals the original request digest', code),
    ]))
    module(f'retry_retained_{caller}', f'{caller} retry of a committed/settled operation: the retained original recipe (early return).', chain([
        ('RR01_admission', 'admission_evidence', 'the separately supplied original event is an object valid when written', code),
        ('RR02_edition_known', 'edition_known', 'the original event type selects a prepared alert/panel payload edition', code),
        ('RR03_stored_object', 'stored_object', 'the stored original payload is an object', code),
        ('RR04_stored_valid', 'stored_valid', 'the stored original payload validates against its edition', code),
        ('RR05_payload_stored', 'payload_is_stored', 'the operation payload is exactly the stored original payload', code),
        ('RR06_original_digest', 'original_digest_valid', 'the operation request_digest is the earlier recipe digest of the stored original', code),
        ('RR07_body_unchanged', 'body_unchanged', 'the retry command and payload are exactly the retained original body', code),
    ]))
    module(f'retry_retained_{caller}_entailed', f'{caller} retained retry digest (entailed by RR06 and RR07).', [
        ('RR08_digest', '/digest_equal', 'the earlier-recipe retry digest equals the original digest; entailed: RR07 makes '
         'the retry body exactly the stored body whose earlier-recipe digest RR06 equated with the original digest', code,
         f"{v('digest_equal')} is not True"),
    ])

module('append_result', 'Append recovery/return evidence joins to the separately retained original (collect-all).',
       flat([('AR01_resolved_exact', 'resolved_exact', 'the resolver output is exactly the independent original evidence',
              'resolved original append evidence mismatch')])
       + chain([(f'AR0{i}_{name}', fact, words, 'foreign original append family/scope/identity') for i, (name, fact, words) in enumerate((
           ('expected_object', 'expected_object', 'the independent original evidence is an object'),
           ('event_type', 'event_type', 'its event_type is the operation family'),
           ('event_id', 'event_id', 'its event_id is the operation event_id'),
           ('storage_instance_id', 'storage_instance_id', 'its storage_instance_id is the operation storage_instance_id'),
           ('project_id', 'project_id', 'its project_id is the operation project_id'),
           ('payload', 'payload', 'its payload is exactly the operation payload'),
           ('scope_partition', 'scope_partition', 'its scope_partition is the operation scope_partition (when the operation has one)'),
       ), 2)])
       + [
           ('AR09_settled_receipt_object', '/receipt_object', 'a settled operation has an original receipt object',
            'foreign original append-result reference', f"{v('settled')} is True and {v('receipt_object')} is not True"),
           ('AR10_settled_result_ref', '/receipt_ref_exact', 'a settled operation carries the original receipt append-result reference',
            'foreign original append-result reference',
            f"{v('settled')} is True and {v('receipt_object')} is True and {v('receipt_ref_exact')} is not True"),
           ('AR11_committed_no_ref', '/append_ref_null', 'a committed (unsettled) operation carries no append-result reference',
            'unsettled operation carries append-result reference', f"{v('committed')} is True and {v('append_ref_null')} is not True"),
       ])

# ------------------------------------------------------------------ retained-history reader (alert, panel, concern, card5)
module('history_shape', 'Historical read request navigation shape (early return).', chain([
    ('HS01_request_object', 'request_object', 'the request is an object', 'history_shape'),
    ('HS02_request_members', 'request_members', 'it carries checkpoint, event, disclosure and after_sequence_id', 'history_shape'),
    ('HS03_checkpoint_object', 'checkpoint_object', 'checkpoint is an object', 'history_shape'),
    ('HS04_event_object', 'event_object', 'event is an object', 'history_shape'),
    ('HS05_disclosure_object', 'disclosure_object', 'disclosure is an object', 'history_shape'),
    ('HS06_checkpoint_members', 'checkpoint_members', 'checkpoint carries state, through_sequence_id, publication_id, index_read_token', 'history_shape'),
    ('HS07_event_members', 'event_members', 'event carries every member of the original event evidence', 'history_shape'),
    ('HS08_payload_object', 'payload_object', 'event payload is an object', 'history_shape'),
    ('HS09_disclosure_members', 'disclosure_members', 'disclosure carries the five current disclosure flags', 'history_shape'),
]))
module('history_checkpoint', 'Retained read: checkpoint publication and original checkpoint (collect-all by guard).',
       flat([('HG01_checkpoint_publication', 'checkpoint_current', 'the checkpoint state is current', 'checkpoint_publication')])
       + chain([
           ('HG02_checkpoint_checker', 'checkpoint_valid', 'the checkpoint passes its family checkpoint checker against the original', 'checkpoint_original'),
           ('HG03_checkpoint_publication_exact', 'publication_exact', 'its publication fields exactly equal the independent original checkpoint', 'checkpoint_original'),
       ])
       + flat([('HG04_event_publication', 'event_current', 'the event state is current', 'event_publication')]))
IDENTITY_FIELDS = ('event_id', 'event_ref', 'event_type', 'project_id', 'scope_partition', 'sequence_id', 'storage_instance_id')
module('history_event', 'Retained read: the original event members (one guard, early return within it).', chain(
    [('HG05_event_instants', 'instants_valid', 'stored observed/persisted instants are valid', 'event_original'),
     ('HG06_event_members', 'members_equal', 'the event has exactly the original event members', 'event_original')]
    + [(f'HG{i:02d}_event_{field}', field, f'event {field} exactly equals the original (when the original has it)', 'event_original')
       for i, field in enumerate(IDENTITY_FIELDS, 7)]))
module('history_original', 'Retained read: payload edition, receipt, source and admission (collect-all by guard).',
       chain([
           ('HG14_edition_known', 'edition_known', 'the original admission evidence selects a retained payload edition', 'historical_payload'),
           ('HG15_payload_schema', 'payload_schema_valid', 'the payload validates against that edition', 'historical_payload'),
           ('HG16_payload_exact', 'payload_exact', 'the payload exactly equals the original payload', 'historical_payload'),
       ])
       + chain([
           ('HG17_receipt_instants', 'receipt_instants_valid', 'the receipt instants are valid', 'original_receipt'),
           ('HG18_receipt_exact', 'receipt_exact', 'the receipt exactly equals the original receipt', 'original_receipt'),
       ])
       + flat([('HG19_source_exact', 'source_exact', 'the source selection exactly equals the original', 'original_source')])
       + chain([
           ('HG20_original_admitted', 'original_admitted', 'the original evidence was valid when written', 'original_admission'),
           ('HG21_event_admitted', 'event_admitted', 'the event was valid when written', 'original_admission'),
       ]))
module('history_disclosure', 'Retained read: current disclosure (collect-all by guard).',
       chain([
           ('HG22_permission', 'permission_allowed', 'current permission is exactly true', 'current_permission'),
           ('HG23_membership', 'membership_allowed', 'current membership is exactly true', 'current_permission'),
           ('HG24_source_access', 'source_access_allowed', 'current source access is exactly true', 'current_permission'),
       ])
       + flat([
           ('HG25_not_deleted', 'not_deleted', 'the source is not deleted (exactly false)', 'source_retained'),
           ('HG26_not_withdrawn', 'not_withdrawn', 'the event is not withdrawn (exactly false)', 'current_withdrawal'),
       ]))
module('history_page_bytes', 'Bounded read-through: the empty page fits.', [
    ('HP01_empty_page', '/empty_page_bytes', 'the empty response for this publication, token and cursor is at most 16384 bytes',
     'unpageable metadata or invalid cursor', f"{v('empty_page_bytes')} > 16384"),
])
module('history_page_ref', 'Bounded read-through: a ref that cannot fit refuses only on an empty page (otherwise the page ends).', [
    ('HP02_first_ref', '/result_empty', 'a candidate page over 16384 bytes already holds at least one ref',
     'individually unpageable ref/metadata', f"{v('candidate_fits')} is False and {v('result_empty')} is True"),
])


# ------------------------------------------------------------------ panel (pm-panel-event-contracts-check.py)
verdict('sch_panel_payload', 'the panel family payload', 'sch_panel_payload_schema')
module('panel_payload', 'Panel payload scope, CV-366 key, Home context and host successor (collect-all).',
       flat([('PP01_scope', 'scope_exact', 'scope_partition is app for an application payload, else the encoded project~ partition', 'scope mismatch'),
             ('PP02_application_key', 'application_key_exact', 'an application payload idempotency_key is the CV-366 application@1 key',
              'CV-366 application idempotency key mismatch')])
       + chain([('PP03_home_project', 'home_project', 'a home_workspace interaction carries a project', 'missing original Home context'),
                ('PP04_home_tab', 'home_tab', 'a home_workspace interaction carries a workspace tab', 'missing original Home context')])
       + flat([('PP05_host_successor', 'host_successor', 'new_host_revision is prior_host_revision + 1', 'not host revision successor')]))
verdict('sch_panel_operation', 'the panel operation value', 'sch_panel_operation_schema')
module('panel_operation_size', 'Panel operation physical size.', [
    ('PZ01_inline_size', '/encoded_bytes', 'the canonical MessagePack operation is at most 16384 bytes', 'operation too large',
     f"{v('encoded_bytes')} > 16384"),
])
module('panel_request', 'Panel frozen request digest.', flat([
    ('PQ01_request_digest', 'request_digest_exact', 'request_digest is the recomputed frozen command/payload digest', 'frozen command digest mismatch'),
]))
PANEL_COMMAND_KEYS = ('actor_ref', 'app_session_id', 'command_id', 'correlation_id', 'idempotency_key', 'origin', 'panel_id',
                      'prior_host_revision', 'project_id', 'scope_partition', 'server_id', 'storage_instance_id', 'target_host',
                      'window_id', 'workspace_tab_id')
module('panel_command_keys', 'Each frozen command field the payload also carries equals it (one row per field).', flat([
    (f'PK{i:02d}_{key}', key, f'original_command.{key}, when the command and payload carry it, equals payload.{key}',
     'frozen command/payload ' + key) for i, key in enumerate(PANEL_COMMAND_KEYS, 1)]))
module('panel_operation_joins', 'Panel command window and operation/payload joins (collect-all).', flat(
    [('PW01_window', 'window_exact', 'the command target_window (or window_id) equals the payload window_id', 'frozen command window mismatch')]
    + [(f'PJ{i:02d}_{key}', key, f'operation {key} equals payload {key}', 'operation/payload ' + key)
       for i, key in enumerate(('storage_instance_id', 'server_id', 'project_id', 'scope_partition', 'app_session_id', 'idempotency_key'), 1)]))
module('panel_identity', 'Panel original identity (one guard).', chain([
    ('PI01_operation_digest', 'operation_digest_exact', 'operation_digest is the recomputed identity digest', 'original identity mismatch'),
    ('PI02_event_id', 'event_id_exact', 'event_id is evt_<family>_<identity digest>', 'original identity mismatch'),
]))
for side, short in (('prior', 'R'), ('candidate', 'C')):
    module(f'panel_host_{side}', f'The {side} host snapshot agrees with the payload (one host guard, then the window guard).', chain([
        (f'H{short}1_session', 'session_exact', f'{side}_host_snapshot.app_session_id equals payload app_session_id', 'original host snapshot mismatch'),
        (f'H{short}2_host', 'host_exact', f'{side}_host_snapshot.host equals the payload {"source" if side == "prior" else "target"} host', 'original host snapshot mismatch'),
        (f'H{short}3_revision', 'revision_exact', f'{side}_host_snapshot.host_revision equals the payload {side} host revision', 'original host snapshot mismatch'),
    ]) + flat([
        (f'H{short}4_window', 'window_exact', f'{side}_host_snapshot.window_id is the payload window_id for a detached window, else null', 'original window mismatch'),
    ]))
module('panel_result_refs', 'A committed/settled panel operation carries the payload result refs (one row per ref).', flat([
    (f'PF0{i}_{field}', field, f'operation {field} equals payload {payload_field} once committed', 'original result/receipt mismatch')
    for i, (field, payload_field) in enumerate((('owner_commit_ref', 'owner_commit_ref'), ('result_ref', 'command_result_ref'),
                                                ('dispatch_receipt_ref', 'dispatch_receipt_ref')), 1)]))
module('panel_protocol', 'Panel current retry evidence (collect-all).', flat([
    ('PN01_admitted', 'admitted', 'the family admission flag is exactly true', 'family absent'),
    ('PN02_desktop', 'desktop', 'the desktop flag is exactly true', 'unsupported web'),
    ('PN03_source_verified', 'source_verified', 'the source verification flag is exactly true', 'unverified source'),
    ('PN04_receipt', 'receipt_exact', 'receipt_event_id equals original_event_id', 'wrong original receipt'),
    ('PN05_original_event', 'original_event_exact', 'original_event_id equals the original operation event_id', 'forged original event identity'),
    ('PN06_session', 'session_exact', 'the acting session is the original app_session_id', 'prior session cannot act'),
    ('PN07_window', 'window_exact', 'the acting window is the original window_id', 'wrong window'),
]))
module('panel_publication', 'Panel publication and cursor (one guard).', chain([
    ('PN08_publication', 'publication_current', 'the publication state is current', 'unavailable publication/cursor'),
    ('PN09_cursor', 'cursor_valid', 'the cursor/frontier pass the unsigned cursor rows', 'unavailable publication/cursor'),
]))

# ------------------------------------------------------------------ concern.created (pm-concern-created-contracts-check.py)
verdict('sch_concern_payload', 'the concern.created payload', 'sch_concern_payload_schema')
verdict('sch_concern_operation', 'the concern.created operation value', 'sch_concern_operation_schema')
verdict('sch_concern_operation_payload', 'the concern.created operation payload against the payload schema', 'sch_concern_operation_payload_schema')
module('concern_operation_size', 'concern.created operation physical size.', [
    ('CZ01_inline_size', '/encoded_bytes', 'the canonical MessagePack operation is at most 16384 bytes', 'operation exceeds 16384 bytes',
     f"{v('encoded_bytes')} > 16384"),
])
module('concern_identity', 'concern.created original identity, frozen digest and partition (collect-all).',
       chain([
           ('CI01_operation_digest', 'operation_digest_exact', 'operation_digest is the recomputed identity digest', 'original identity mismatch'),
           ('CI02_event_id', 'event_id_exact', 'event_id is evt_concern_created_<identity digest>', 'original identity mismatch'),
           ('CI03_concern_id', 'concern_id_exact', 'payload concern_id is concern_<identity digest>', 'original identity mismatch'),
       ])
       + flat([
           ('CI04_request_digest', 'request_digest_exact', 'request_digest is the recomputed command/payload/record digest',
            'frozen command/payload/record digest mismatch'),
           ('CI05_partition', 'partition_exact', 'scope_partition is the encoded project~ partition', 'Project partition mismatch'),
       ]))
CONCERN_COMMAND_KEYS = ('actor_ref', 'category', 'command_id', 'correlation_id', 'currentness_basis_ref', 'evidence_refs',
                        'handler_target', 'idempotency_key', 'origin', 'owner_kind', 'owner_ref', 'project_id', 'run_ref',
                        'scope_ref', 'severity', 'source_refs', 'ts')
for part, keys, start in (('a', CONCERN_COMMAND_KEYS[:9], 1), ('b', CONCERN_COMMAND_KEYS[9:], 10)):
    module('concern_command_keys_' + part, 'Each original command field the payload also carries equals it (one row per field).', flat([
        (f'CK{i:02d}_{key}', key, f'original_command.{key}, when the payload carries it, equals payload.{key}',
         'original command/payload ' + key) for i, key in enumerate(keys, start)]))
module('concern_operation_joins', 'concern.created scope/key, creator and record-ref joins (collect-all).',
       chain([
           ('CJ01_payload_project', 'payload_project', 'operation project_id equals payload project_id', 'original scope/key mismatch'),
           ('CJ02_record_project', 'record_project', 'payload project_id equals candidate record project_id', 'original scope/key mismatch'),
           ('CJ03_key', 'key_exact', 'operation idempotency_key equals payload idempotency_key', 'original scope/key mismatch'),
       ])
       + flat([
           ('CJ04_creator', 'creator_exact', 'payload actor_ref equals created_by_ref', 'creator/actor mismatch'),
           ('CJ05_record_ref', 'record_ref_exact', 'payload concern_record_ref is the revision-one record ref', 'original revision-one record ref mismatch'),
       ]))
CONCERN_RECORD_KEYS = ('record_id', 'concern_id', 'revision', 'status', 'concern_category', 'severity', 'owner_kind', 'owner_ref',
                       'creator_ref', 'created_by_ref', 'created_by_kind', 'subject_ref', 'source_event_refs', 'evidence_refs',
                       'artifact_refs', 'lineage_refs', 'summary', 'created_at', 'updated_at', 'visibility_level', 'attention_level',
                       'chatworthy', 'blocking_effect_ref', 'run_ref', 'scope_ref', 'resolution_kind', 'resolver_ref', 'resolved_at')
for part, keys, start in (('a', CONCERN_RECORD_KEYS[:14], 1), ('b', CONCERN_RECORD_KEYS[14:], 15)):
    module('concern_record_' + part, 'The candidate record is the revision-one record the command determines (one row per field).', flat([
        (f'CR{i:02d}_{key}', key, f'candidate_record.{key} equals its value derived from the original command and identity',
         'original candidate record ' + key) for i, key in enumerate(keys, start)]))
module('concern_protocol_flags', 'concern.created current authority flags (collect-all).', flat([
    (f'CP0{i}_{key}', key, f'context {key} is exactly true', key)
    for i, key in enumerate(('admitted', 'authority_verified', 'source_current', 'permission_allowed'), 1)]))
module('concern_existence', 'concern.created existence proof and recreation (one guard each).',
       chain([
           ('CE01_subject_bool', 'subject_bool', 'subject_already_active is an exact boolean', 'invalid concern existence proof'),
           ('CE02_key_bool', 'key_bool', 'concern_key_exists is an exact boolean', 'invalid concern existence proof'),
       ])
       + chain([
           ('CE03_subject_absent', 'subject_absent', 'a prepared creation has no active subject concern (exactly false)', 'existing concern cannot be recreated'),
           ('CE04_key_absent', 'key_absent', 'a prepared creation has no existing concern key (exactly false)', 'existing concern cannot be recreated'),
       ], guard=f"{v('prepared')} is True"))
module('concern_authority', 'concern.created independent authority equals the original command (one row per member).', flat([
    (f'CA0{i}_{key}', key, f'authority.{key} equals original_command.{key}', 'independent authority ' + key)
    for i, key in enumerate(('actor_ref', 'creator_kind', 'project_id', 'authority_basis_ref', 'currentness_basis_ref',
                             'permission_snapshot_ref', 'source_refs'), 1)]))
module('concern_creator', 'concern.created creator kind and remaining retry evidence (collect-all).',
       chain([
           ('CC01_creator_string', 'creator_string', 'authority creator_kind is a string', 'nomination or owner label grants no creation'),
           ('CC02_creator_allowed', 'creator_allowed', 'authority creator_kind is an authorized direct creator', 'nomination or owner label grants no creation'),
       ])
       + flat([
           ('CC03_receipt', 'receipt_exact', 'receipt_event_id equals the original event_id', 'wrong original receipt'),
           ('CC04_retry_digest', 'retry_digest_exact', 'retry_digest equals the original request_digest', 'idempotency_conflict'),
           ('CC05_caller_body', 'caller_body_exact', 'retry_body is exactly the UCC-147 caller body of the original command', 'changed caller semantic body'),
           ('CC06_publication', 'publication_current', 'the publication state is current', 'withdrawn History'),
       ]))

# ------------------------------------------------------------------ Card 5 (pm-card5-event-contracts-check.py)
# operation_guards: each pre-table require(name, ...) is one row whose code is that guard name. A guard
# the family branch does not require holds (not applicable); a guard required with a different predicate
# on a different branch is its own row with the same code (recorder, old_owner, new_owner).
verdict('sch_c5_operation', 'the Card 5 operation value', 'operation_schema')
verdict('sch_c5_payload', 'the Card 5 family payload', 'payload_schema')
verdict('sch_c5_field', 'one Card 5 schema field occurrence (schema_field stage)', 'schema_field')


def c5(name, doc, items):
    module(name, doc, flat([(f'G_{fact}', fact, words, code) for fact, words, code in items]))


def g(fact, words, code=None):
    return (fact, words, code or fact)


c5('c5_core_a', 'Card 5 operation size, identity, digest and joins.', [
    g('operation_bytes', 'the canonical MessagePack operation is at most 16384 bytes'),
    g('operation_identity', 'operation_digest is the recomputed identity digest'),
    g('event_identity', 'event_id is evt_<slug>_<identity digest>'),
    g('request_digest', 'request_digest is the recomputed digest of command, payload, before and after'),
    g('project_join', 'operation project_id equals payload project_id'),
    g('key_join', 'operation idempotency_key equals payload idempotency_key'),
    g('partition', 'scope_partition is the encoded project~ partition'),
    g('command_payload', 'the original command payload is exactly the payload'),
    g('actor_join', 'the action actor_ref equals the payload actor_ref'),
])
c5('c5_core_b', 'Card 5 action authority flags, revision and after-record joins.', [
    g('authorized', 'the action is authorized (exactly true)'),
    g('source_access', 'source access holds (exactly true)'),
    g('currentness', 'the action is current (exactly true)'),
    g('allowed_transition', 'the transition is allowed (exactly true)'),
    g('existing_approvals', 'existing approvals are satisfied (exactly true)'),
    g('revision_successor', 'result_revision is prior_revision + 1'),
    g('after_revision', 'after.revision equals result_revision'),
    g('after_ref', 'after.record_ref equals after_record_ref'),
    g('after_project', 'after.project_id equals payload project_id'),
])
c5('c5_phase', 'Card 5 operation phase refs agree with its state.', [
    g('phase_owner_commit_ref', 'owner_commit_ref is null exactly when the operation is prepared'),
    g('phase_result_ref', 'result_ref is null exactly when the operation is prepared'),
    g('phase_dispatch_receipt_ref', 'dispatch_receipt_ref is null exactly when the operation is prepared'),
    g('phase_append_ref', 'original_append_result_ref is present exactly when the operation is settled'),
])
c5('c5_before', 'Card 5 before-record joins (a before record other than note creation).', [
    g('before_revision', 'before.revision equals prior_revision'),
    g('before_ref', 'before.record_ref equals before_record_ref'),
    g('before_project', 'before.project_id equals payload project_id'),
])
NOTE_FIELDS = ('bundle_id', 'doc_id', 'annotation_id', 'note_id', 'provenance_ref')
c5('c5_note_ids', 'Bundle note identity fields of the after and before records.', [
    item for field in NOTE_FIELDS for item in (
        g('note_after_' + field, f'after.{field} equals payload {field}'),
        g('note_before_' + field, f'before.{field} equals payload {field} (a before record other than note creation)'))])
c5('c5_note_state', 'Bundle note actor, state, creation and status change.', [
    g('note_actor', 'the actor is a controller or user, or an authorized owner'),
    g('note_state', 'after.state equals payload state'),
    g('creation_absence', 'note creation has no before record'),
    g('creation_revision', 'note creation has prior_revision 0'),
    g('creation_previous', 'note creation has no previous_state'),
    g('creation_state', 'note creation starts open'),
    g('note_previous', 'before.state equals payload previous_state'),
    g('note_real_change', 'the status actually changes'),
])
c5('c5_concern_a', 'Concern ids, action ref, worker proposals, recorder authority, reopen and areas.', [
    g('concern_before_id', 'before.concern_id equals payload concern_id'),
    g('concern_after_id', 'after.concern_id equals payload concern_id'),
    g('action_ref', 'the action action_ref equals payload action_ref'),
    g('worker_proposal_only', 'a worker proposal never becomes a record'),
    g('recorder_user_or_controller', '5.c: the recorder is a user or controller', 'recorder'),
    g('recorder_owner', '5.e: the recorder is the before owner', 'recorder'),
    g('reopen_state', '5.e: only a resolved or dismissed concern reopens'),
    g('reopen_evidence', '5.e: reopening has changed evidence'),
    g('reopen_terminal', '5.e: reopening names the prior terminal record'),
    g('recorder_controller', '5.b/5.d/5.f/5.g: the recorder is a controller', 'recorder'),
    g('recorder_area', 'the action area_ref equals before.area_ref'),
    g('widening_area', 'a wider scope changes the area'),
])
c5('c5_concern_b', 'Concern assignment, promotion and ownership transfer.', [
    g('assignment_change', '5.b: assignment transfers ownership'),
    g('old_owner', '5.b: old_owner_ref is the before owner'),
    g('new_owner', '5.b: new_owner_ref is the after owner'),
    g('promotion_change', '5.d: promotion widens scope'),
    g('transfer_old_owner', '5.d/5.f transfer: old_owner_ref is the before owner', 'old_owner'),
    g('transfer_new_owner', '5.d/5.f transfer: new_owner_ref is the after owner', 'new_owner'),
])
for prefix, last in (('outgoing', g('outgoing_human', 'the outgoing approver is a human')),
                     ('receiving', g('receiving_identity', 'the receiving acceptance actor is the after owner'))):
    c5('c5_' + prefix, f'Cross-area transfer: the {prefix} confirmation.', [
        g(prefix + '_present', f'a cross-area transfer has a {prefix} confirmation'),
        g(prefix + '_explicit', 'it is explicit'),
        g(prefix + '_permission', 'its permission holds'),
        g(prefix + '_action', 'it names the action'),
        g(prefix + '_separate', 'its evidence is separate from the action'),
        g(prefix + '_role', 'it has the required role'),
        g(prefix + '_decision', 'it has the required decision'),
        g(prefix + '_area', 'it names the required area'),
        last,
    ])
c5('c5_concern_c', 'Concern transfer link, promotion evidence and evidence changes.', [
    g('linked_transfer', '5.d/5.f transfer: a transfer evidence ref is linked'),
    g('promotion_evidence', 'promotion carries promotion evidence'),
    g('promotion_approvals', 'promotion approvals are satisfied'),
    g('evidence_nonempty', '5.c: the action links evidence'),
    g('evidence_real_change', '5.c: linking changes the evidence set'),
    g('current_evidence_nonempty', '5.d-5.g: the action carries current evidence'),
])
c5('c5_resolution', '5.f resolution kind, accepted-risk human decision and lineage.', [
    g('resolution_kind', 'a resolution kind is given'),
    g('resolution_state', 'only an active or acknowledged concern resolves'),
    g('resolution_evidence', 'resolution has changed evidence'),
    g('risk_human_present', 'accepted risk has a human decision'),
    g('risk_human_role', 'the decision role is authorized_human'),
    g('risk_human_kind', 'the decision actor is a human'),
    g('risk_human_action', 'the decision names the action'),
    g('risk_human_explicit', 'the decision is explicit'),
    g('risk_human_permission', 'the decision permission holds'),
    g('risk_human_decision', 'the decision is approved'),
    g('risk_human_area', 'the decision names the before area'),
    g('remaining_risk', 'accepted risk names the remaining risk'),
    g('guided_lineage', 'superseded/merged/split names a lineage action'),
    g('lineage_preserved', 'every before lineage ref is kept'),
    g('lineage_link', 'a lineage ref is added'),
])
c5('c5_assessment', '5.g assessment patch.', [
    g('assessment_nonempty', 'the patch sets at least one field'),
    g('assessment_real_change', 'the patch changes at least one field'),
])
C5_AFTER_FIELDS = ('bundle_id', 'doc_id', 'annotation_id', 'note_id', 'state', 'provenance_ref', 'owner_ref', 'owner_kind',
                   'area_ref', 'authority_ref', 'severity', 'category', 'evidence_refs', 'lineage_refs', 'creator_ref',
                   'blocking_effect_ref')
c5('c5_after', 'Every other after-record field is exactly its expected post-state value.', [
    g('after_' + field, f'after.{field} exactly equals its expected value') for field in C5_AFTER_FIELDS])
module('c5_mapping_shape', 'HISTORICAL_ONLY mapping classification shape (early return).', chain([
    ('MS01_mapping_object', 'mapping_object', 'the mapping is an object', 'mapping_shape'),
    ('MS02_mapping_members', 'mapping_members', 'it has exactly the seven mapping members', 'mapping_shape'),
    ('MS03_original_object', 'original_object', 'the original mapping evidence is an object', 'mapping_shape'),
    ('MS04_original_members', 'original_members', 'it has exactly the original members', 'mapping_shape'),
    ('MS05_after_object', 'after_object', 'original after is an object', 'mapping_shape'),
    ('MS06_after_state', 'after_state', 'original after has a state', 'mapping_shape'),
    ('MS07_before_object', 'before_object', 'original before is null or an object', 'mapping_shape'),
    ('MS08_before_state', 'before_state', 'a before object has a state', 'mapping_shape'),
]))
module('c5_mapping', 'HISTORICAL_ONLY mapping classification facts (collect-all).', flat(
    [(f'MP0{i}_{key}', key, f'mapping {key} exactly equals the original', 'mapping_' + key)
     for i, key in enumerate(('original_event_ref', 'bundle_id', 'doc_id', 'annotation_id', 'note_id', 'provenance_ref'), 1)]
    + [('MP07_proof', 'proof', 'the mapping proof is verified (exactly true)', 'mapping_proof'),
       ('MP08_approval', 'approval', 'the owner approved (exactly true)', 'mapping_approval'),
       ('MP09_unambiguous', 'unambiguous', 'the mapping is unambiguous (exactly false)', 'mapping_ambiguous'),
       ('MP10_kind', 'kind', 'mapped_kind is creation exactly when there is no before record', 'mapping_kind'),
       ('MP11_change', 'change', 'a status change changes the state', 'mapping_no_change')]))
module('c5_history_mapping_object', 'HISTORICAL_ONLY read: request mapping and original mapping evidence are objects.', chain([
    ('HM01_mapping_object', 'mapping_object', 'the request mapping is an object', 'mapping_shape'),
    ('HM02_original_object', 'original_object', 'the original mapping evidence is an object', 'mapping_shape'),
]))
module('c5_history_mapping_payload', 'HISTORICAL_ONLY read: original mapping evidence joins the original payload (collect-all).', flat(
    [(f'HN0{i}_{key}', key, f'original mapping {key} exactly equals the original payload', 'mapping_payload_' + key)
     for i, key in enumerate(('original_event_ref', 'bundle_id', 'doc_id', 'annotation_id', 'note_id', 'provenance_ref'), 1)]
    + [('HN07_original_event', 'original_event', 'the payload original_event_ref is the original event_ref', 'mapping_original_event'),
       ('HN08_absent_before', 'absent_before_ok', 'an absent before snapshot belongs to a creation payload', 'mapping_absent_before')]))
MAPPING_SNAPSHOT_KEYS = ('revision', 'state', 'record_ref', 'project_id', 'bundle_id', 'doc_id', 'annotation_id', 'note_id', 'provenance_ref')
for phase in ('before', 'after'):
    module(f'c5_history_mapping_{phase}', f'HISTORICAL_ONLY read: the {phase} snapshot joins the payload (collect-all).', flat([
        (f'H{phase[0].upper()}{i}_{key}', key, f'{phase} snapshot {key} exactly equals its payload source', f'mapping_{phase}_{key}')
        for i, key in enumerate(MAPPING_SNAPSHOT_KEYS, 1)]))
module('c5_history_mapping_after_entailed', 'HISTORICAL_ONLY read: an after snapshot is present (entailed by MS05).', [
    ('HN09_after_present', '/after_present', 'the after snapshot is present; entailed: mapping_errors (MS05_after_object) '
     'refuses a non-object after first', 'mapping_absent_before', f"{v('after_present')} is not True"),
])

def fields_of(rows):
    names = []
    for _, _, _, _, cond in rows:
        for part in cond.split("value['")[1:]:
            name = part.split("'", 1)[0]
            if name not in names:
                names.append(name)
    return tuple(names)


def render(name, doc, rows):
    fields = fields_of(rows)
    lines = [
        f'"""DG6A guard table {name}: {doc}',
        '',
        'Method B guard rows (scripts/pm_guard_isolation.py) for the DG6A checkers. Each predicate reads one',
        'observation the checker derives from the complete boundary input (recomputed digests and identities,',
        'canonical-byte sizes, typed joins, presence). Predicates never recompute, repair or call helpers.',
        'The checkers refuse only through these rows, in this order (scripts/pm_dg6a_tables.py).',
        'FIELDS names every observation the rows read; the checker passes no other.',
        'Generated by scripts/pm-dg6a-table-generate.py; edit the row spec there.',
        '"""',
        'import pm_guard_isolation as g',
        '',
        f'FIELDS = {fields!r}',
        '',
    ]
    for row, _, _, code, cond in rows:
        lines += ['', f'def {row}(value, context):', f'    return {code!r} if {cond} else None', '']
    lines += ['', 'def case(value):', '    context = None', '    table = g.GuardTable([']
    for row, field, words, code, _ in rows:
        lines.append(f'        g.Guard({row!r}, g.Invariant({field!r}, {words!r}), {code!r}, {row}),')
    lines += ['    ])', '', '    def check(value):']
    for row, *_ in rows:
        lines.append(f'        table.require({row!r}, value, context)')
    lines += ['        return True', '    return g.Case(table, check, context)', '']
    return '\n'.join(lines)


def main():
    out = Path(sys.argv[1])
    check = '--check' in sys.argv[2:]
    wanted = {PREFIX + name + '.py': render(name, *spec) for name, spec in MODULES.items()}
    stale = []
    for filename, text in sorted(wanted.items()):
        path = out / filename
        if check:
            if not path.exists() or path.read_text() != text:
                stale.append(filename)
        else:
            path.write_text(text)
    managed = set(wanted) | {PREFIX + name + '.py' for name in HANDWRITTEN}
    extra = sorted(p.name for p in out.glob(PREFIX + '*.py') if p.name not in managed)
    rows = sum(len(spec[1]) for spec in MODULES.values())
    print(f'{len(MODULES)} generated tables, {rows} rows (+{len(HANDWRITTEN)} hand-written); stale {stale}; extra {extra}')
    return 1 if (check and stale) or extra else 0


if __name__ == '__main__':
    sys.exit(main())
