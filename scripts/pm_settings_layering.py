"""Static oracle for reviewed Settings classification and copy/resolution cases.

Own-value assignments come from the inventory, never from a runtime prefix
classifier. This oracle does not write Settings or authenticate owner receipts.
"""
from __future__ import annotations

import collections
import math

from pm_projects_refresh_contracts import Corpus, ROOT

LEVELS = frozenset(('everywhere', 'computer', 'device', 'project'))
NEW_IDS = frozenset((
    'code.execution.projects-folder', 'code.execution.no-project-chats-folder',
    'general.interaction.no-project-default-computer', 'safety.rules.cross-project-read-policy',
    'safety.rules.allow-project-reading', 'safety.rules.incoming-chat-messages',
    'safety.rules.computer-use',
))
PLACEMENT_IDS = frozenset((
    'code.execution.auto-preset',
    'code.execution.auto-weights',
    'code.execution.computer-level',
    'code.execution.in-use-less-often',
    'code.execution.work-placement',
    'code.execution.allowed-computers',
    'code.execution.default-computer',
))

MODEL_RETIRED_IDS = frozenset((
    'ai.models.default-variant', 'personas.tuning.default-variant',
    'ai.models.goal-worker-model', 'ai.models.goal-verifier-model',
    'ai.models.lane-bindings', 'ai.models.role-policy',
    'ai.models.per-lane-platform', 'ai.models.per-lane-model',
    'ai.models.execution-role', 'ai.models.resolution-policy',
    'ai.models.reasoning-effort', 'ai.models.subagent-model',
    'ai.models.subagent-effort', 'personas.tuning.default-model',
    'personas.tuning.default-platform', 'personas.tuning.reasoning-effort',
    'extensions.commands.command-model', 'media.image.provider',
))


def model_defaults_failures(inventory):
    """Static admission and compatibility checks; no native model dispatch or cost claim."""
    errors = []
    rows = {row['id']: row for row in inventory['settings']}
    retired = set(inventory.get('retired_input_ids', []))
    compat = inventory.get('compatibility_reads', {})
    contract = inventory.get('model_defaults', {})
    list_ids = set(contract.get('list_setting_ids', []))
    account_id = contract.get('account_setting_id')
    expected_models = {
        'ai.models.default-model', 'ai.models.overseer-model', 'ai.models.worker-model',
        'ai.models.low-effort-worker-model', 'ai.models.gui-worker-model',
        'ai.models.high-effort-worker-model', 'ai.models.auditor-model',
        'ai.models.thread-title-model', 'ai.models.teach-model',
        'safety.approvals.bsd-model', 'media.image.model', 'media.io.vision-fallback-model',
        'media.capabilities.video-model', 'media.capabilities.tts-model',
        'media.capabilities.music-model',
    }
    if list_ids != expected_models or account_id != 'ai.accounts.default-model':
        errors.append('model_defaults: incomplete list/account admission')
    if not MODEL_RETIRED_IDS <= retired or MODEL_RETIRED_IDS & rows.keys():
        errors.append('model_defaults: retired model rows are missing or active')
    if set(compat) - retired or not MODEL_RETIRED_IDS <= compat.keys():
        errors.append('model_defaults: incomplete compatibility reads')
    for key, read in compat.items():
        if (read.get('write_policy') != 'omit_retired_key'
                or read.get('transfer_policy') != 'omit_with_notice'
                or read.get('search_policy') != 'explain_retirement'
                or not read.get('label') or not read.get('search')
                or not read.get('read_rule') or set(read.get('replacement_ids', [])) - rows.keys()):
            errors.append(key + ': invalid retirement/transfer/search disposition')
    if contract.get('source_order') != [
            'manual_override', 'scope_policy', 'surface_default', 'manual_account_default',
            'project_list', 'everywhere_factory_list']:
        errors.append('model_defaults: selection source order')
    for key in sorted(list_ids | {account_id}):
        row = rows.get(key)
        if row is None:
            errors.append(str(key) + ': missing model row')
            continue
        picker = row.get('model_picker', {})
        if (row['type'] != 'model_picker' or picker.get('effort') != 'inside_picker'
                or picker.get('allow_exact_name') is not True
                or picker.get('validate_before_save') != 'small_call'):
            errors.append(key + ': model/depth picker or exact-name validation')
        levels = row['layering']['may_differ_by']
        if levels != ([] if key == account_id else ['everywhere', 'project']):
            errors.append(key + ': model defaults offered at an unapproved level')
        source = picker.get('inherit_from')
        if source not in {'factory', 'smallest_available', 'none', 'automatic_vision', 'normal_defaults'} and source not in list_ids:
            errors.append(key + ': missing named fallback source')
    easy = rows.get('ai.models.low-effort-worker-model', {})
    if easy.get('model_picker', {}).get('inherit_from') != 'ai.models.worker-model':
        errors.append('model_defaults: routine jobs do not follow Everyday building')
    if rows.get('ai.models.teach-model', {}).get('default') != 'Default':
        errors.append('model_defaults: Teach must default to the smallest available model')
    if rows.get('safety.approvals.bsd-model', {}).get('model_picker', {}).get('inherit_from') != 'ai.models.auditor-model':
        errors.append('model_defaults: BSD does not follow Checking finished work')
    return errors



def snapshot_failures(record, rows):
    errors = []
    keys = set(record['values_by_setting_id'])
    if keys != set(record['source_by_setting_id']) or keys != set(record['setting_revisions']):
        errors.append('sparse_key_sets')
    target = record['target']
    for key in keys:
        row = rows.get(key)
        if row is None or target['level'] not in row['layering']['may_differ_by']:
            errors.append('unoffered_level')
        elif target['level'] == 'computer' and target['computer_key']['kind'] != row['layering']['computer_key']:
            errors.append('computer_key_domain')
    return errors


def resolve_setting(row, own_values, *, os_reduce_motion=False):
    layering = row['layering']
    levels = layering['may_differ_by']
    if not levels or any(level not in levels and value is not None for level, value in own_values.items()):
        raise ValueError('unoffered ordinary Settings level')
    values = [own_values[level] for level in ('everywhere', 'computer', 'device', 'project')
              if level in levels and own_values.get(level) is not None]
    requested = values[-1] if values else row['default']
    combine = layering['combine']
    if combine == 'computer_ceiling':
        if not values:
            return requested
        ceiling = own_values.get('computer')
        if type(requested) not in (int, float) or (ceiling is not None and type(ceiling) not in (int, float)):
            raise ValueError('capacity is not normalized numeric input')
        if not math.isfinite(requested) or ceiling is not None and not math.isfinite(ceiling):
            raise ValueError('capacity must be finite')
        return min(requested, ceiling) if ceiling is not None else requested
    if combine == 'more_careful':
        order = layering['careful_order']
        is_profile = row['id'] == 'safety.rules.permission-preset'
        if any(not any(type(v) is type(item) and v == item for item in order)
               and not (is_profile and v == 'custom') for v in values):
            raise ValueError('unvalidated protective own value')
        if row['id'] == 'general.visual.reduce-animations':
            return (any(values) if values else requested) or os_reduce_motion
        c, p = own_values.get('computer'), own_values.get('project')
        if c is not None and p is not None:
            if is_profile and (c == 'custom' or p == 'custom'):
                return c
            return min((c, p), key=order.index)
        return requested
    if combine == 'per_item' and values:
        raise ValueError('per-item maps require the owning permission/tool resolver')
    return requested


def repository_origin_resolution(record, rows):
    """Golden scenario: resolution alone never accepts repository loosening.

    repository_loosening is an input fact from the Permissions owner. Matching
    fixture evidence still requires that owner's real source authentication.
    """
    scenario = record['resolution']
    resolved = settings_predicate('settings.resolve', scenario, rows)
    gate = 'not_repository_loosening'
    if record['repository_loosening']:
        acceptance = record['acceptance']
        source = record['source']
        matches = acceptance is not None and all(
            acceptance.get(key) == source[key] for key in (
                'project_id', 'source_repository_ref', 'source_version', 'source_sha256'))
        if (matches and scenario['setting_id'] in acceptance['looser_rule_ids']
                and acceptance['person_decision_evidence']):
            gate = 'requires_actual_owner_validation'
        else:
            gate = 'held_for_repository_acceptance'
    return {'resolved_value': resolved, 'origin_gate': gate}


def onboarding_first_paint(record, rows):
    """Static presentation scenario, using the existing Settings resolver."""
    pairs = record['look_pairs'] if record['claimed_context'] else {}
    applicable = {level: pair for level, pair in pairs.items()
                  if level != 'project' or record['project_id'] is not None}
    result = {field: resolve_setting(rows[setting], {
        level: pair[field] for level, pair in applicable.items() if pair is not None})
        for field, setting in (('theme', 'general.visual.theme'), ('theme_mode', 'general.visual.theme-mode'))}
    motion = record['motion']
    own = {level: motion[level + '_own'] for level in LEVELS} if record['claimed_context'] else {}
    if record['project_id'] is None:
        own.pop('project', None)
    result['reduce_motion'] = resolve_setting(rows['general.visual.reduce-animations'], own,
                                             os_reduce_motion=motion['os_reduce_motion'])
    return result


def settings_predicate(predicate, record, rows, expected=None):
    if predicate in ('settings.level_and_sparse_maps', 'settings.identical_sparse_key_sets'):
        errors = snapshot_failures(record, rows)
        return 'refuse_unoffered_level' if 'unoffered_level' in errors else 'refuse' if errors else 'accept'
    if predicate == 'settings.reviewed_classification':
        return expected if rows[expected]['layering'] == record else 'classification_mismatch'
    if predicate == 'settings.resolve':
        return resolve_setting(rows[record['setting_id']], {level: record[level + '_own'] for level in LEVELS},
                               os_reduce_motion=record['os_reduce_motion'])
    if predicate == 'settings.repository_origin_resolution':
        return repository_origin_resolution(record, rows)
    if predicate == 'settings.onboarding_first_paint':
        return onboarding_first_paint(record, rows)
    if predicate == 'settings.onboarding_ready_destination':
        if not record['owner_complete'] or not record['last_block_landed']:
            return 'wait'
        if record['path'] == 'later' and record['project_id'] is None:
            return 'No project'
        if record['path'] == 'project' and record['project_id']:
            return 'Planning Wizard'
        return 'refuse'
    if predicate == 'settings.cas':
        return 'accept' if record['expected_setting_revision'] == record['actual_setting_revision'] else 'refuse'
    if predicate == 'settings.theme_atomic_pair':
        revisions = record['theme_pair_revisions']
        return 'accept' if revisions['theme'] == revisions['theme_mode'] else 'refuse'
    if predicate == 'settings.selector_subset':
        return 'accept' if set(record['selected_ids']) <= set(record['eligible_ids']) else 'refuse'
    if predicate == 'settings.no_credentials':
        return 'refuse' if record['credential_bytes_present'] else 'accept'
    if predicate == 'settings.account_reuse':
        if record['credential_bytes_present'] or not record['selected_account_id']:
            return 'refuse'
        if record['source_host_id'] != record['destination_host_id']:
            return 'resolve_there'
        return 'accept' if record['selected_account_id'] == record['authenticated_account_id'] else 'refuse'
    if predicate == 'models.strategy_tier_allowed':
        allowed = {'Standard': {1, 2, 3, 4, 5, 6, 7}, 'Conservative': {1, 2, 5, 6, 7, 9},
                   'Aggressive': set(range(1, 10))}
        return 'accept' if record['precedence_tier'] in allowed.get(record['strategy'], set()) else 'refuse'
    raise ValueError('unknown Settings predicate: ' + predicate)


def check(root=ROOT, corpus=None):
    corpus = corpus or Corpus(root)
    inventory = corpus.document('Plans/settings_inventory.json')
    pack = corpus.document('Plans/settings_system_contract_fixtures.json')
    rows = {row['id']: row for row in inventory['settings']}
    errors = model_defaults_failures(inventory)
    counts = collections.Counter(rows=len(rows), categories=len(inventory['categories']),
                                 managers=len(pack['manager_registry']))
    if len(rows) != len(inventory['settings']) or not rows or not (NEW_IDS | PLACEMENT_IDS) <= rows.keys():
        errors.append('Settings identity census')
    if len(inventory['categories']) != 12 or len(pack['manager_registry']) != 38:
        errors.append('Settings category/manager census')
    for row in inventory['settings']:
        layer = row['layering']
        offered = set(layer['may_differ_by'])
        if offered | set(layer['not_offered']) != LEVELS or offered & set(layer['not_offered']):
            errors.append(row['id'] + ': incomplete level reasons')
        if {'computer', 'device'} <= offered:
            errors.append(row['id'] + ': Computer/Device confusion')
        if layer['home'] == 'thing' and offered not in (set(), {'project'}):
            errors.append(row['id'] + ': owner thing became ordinary value')
        if ('careful_order' in layer) != (layer['combine'] == 'more_careful'):
            errors.append(row['id'] + ': protective order mismatch')
    scalar_safety = [r for r in rows.values() if r['layering'].get('careful_order') == ['deny', 'ask', 'allow']]
    if {r['id'] for r in scalar_safety} != {
            'safety.rules.default-tool-permission', 'safety.approvals.doom-loop-action',
            'safety.protection.external-dir-action', 'safety.rules.computer-use'}:
        errors.append('scalar safety census')
    theme = [r['id'] for r in rows.values() if r['layering']['atomic_group'] == 'theme_pair']
    if set(theme) != {'general.visual.theme', 'general.visual.theme-mode'}:
        errors.append('atomic theme pair')
    for key, manager in pack['manager_registry'].items():
        if manager['settings_is_runtime_owner'] is not False:
            errors.append(key + ': duplicate owner writer')
        for switch in manager['project_switch_ids']:
            if switch not in rows or rows[switch]['layering']['may_differ_by'] != ['project']:
                errors.append(key + ': invalid Project switch ' + switch)
    for case in pack['projects_refresh_cases']:
        for rule in case['semantic_checks']:
            try:
                got = settings_predicate(rule['predicate_id'], case['record'], rows, rule['expected'])
            except (KeyError, ValueError, TypeError) as exc:
                errors.append(case['case_id'] + ': invalid semantic input: ' + str(exc))
                continue
            counts['semantic_cases'] += 1
            if type(got) is not type(rule['expected']) or got != rule['expected']:
                errors.append(case['case_id'] + ': expected ' + repr(rule['expected']) + ', got ' + repr(got))
    return errors, counts
