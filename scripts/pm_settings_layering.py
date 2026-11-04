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
    if not values:
        return row['default']
    combine = layering['combine']
    if combine == 'computer_ceiling':
        requested = values[-1]
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
        if is_profile:
            c, p = own_values.get('computer'), own_values.get('project')
            if c is not None and p is not None and (c == 'custom' or p == 'custom'):
                return c
            if 'custom' in values:
                return values[-1]
        chosen = min(values, key=order.index)
        if row['id'] == 'general.visual.reduce-animations':
            chosen = chosen or os_reduce_motion
        return chosen
    if combine == 'per_item':
        raise ValueError('per-item maps require the owning permission/tool resolver')
    return values[-1]


def settings_predicate(predicate, record, rows, expected=None):
    if predicate in ('settings.level_and_sparse_maps', 'settings.identical_sparse_key_sets'):
        errors = snapshot_failures(record, rows)
        return 'refuse_unoffered_level' if 'unoffered_level' in errors else 'refuse' if errors else 'accept'
    if predicate == 'settings.reviewed_classification':
        return expected if rows[expected]['layering'] == record else 'classification_mismatch'
    if predicate == 'settings.resolve':
        return resolve_setting(rows[record['setting_id']], {level: record[level + '_own'] for level in LEVELS},
                               os_reduce_motion=record['os_reduce_motion'])
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
        allowed = {'Standard': {1, 2, 3, 4, 5, 6, 7}, 'Conservative': {2, 5, 6, 7, 9},
                   'Aggressive': set(range(1, 10))}
        return 'accept' if record['precedence_tier'] in allowed.get(record['strategy'], set()) else 'refuse'
    raise ValueError('unknown Settings predicate: ' + predicate)


def check(root=ROOT, corpus=None):
    corpus = corpus or Corpus(root)
    inventory = corpus.document('Plans/settings_inventory.json')
    pack = corpus.document('Plans/settings_system_contract_fixtures.json')
    rows = {row['id']: row for row in inventory['settings']}
    errors = []
    counts = collections.Counter(rows=len(rows), categories=len(inventory['categories']),
                                 managers=len(pack['manager_registry']))
    if len(rows) != len(inventory['settings']) or len(rows) != 1017 or not NEW_IDS <= rows.keys():
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
