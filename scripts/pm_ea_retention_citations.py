"""Unit-bounded current retention evidence (MERGE3 post-landing finding 4).

Historical citations remain historical. A current witness must contain the
family's scope, selected policy, anchor and effective count, rather than merely
claiming registry membership. No policy is inferred from a grade verdict.
"""
import importlib.util
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('ea_retention_writer', ROOT / 'scripts/pm-ea-admission-writer.py')
w = importlib.util.module_from_spec(spec)
spec.loader.exec_module(w)
CREW = {'crew.board_message_posted', 'crew.board_message_read', 'crew.board_messages_archived'}
GITHUB_SIGN_IN = {
    'auth.github.authenticated',
    'auth.github.device_code.issued',
    'auth.github.disconnected',
    'auth.github.failed',
    'auth.github.token.polling',
}
# The Case L-3 assignment recorded in DL-2597 sets a separate Application
# limit for each of these three families in addition to their per-Run limit.
DT_SERVER_COUNT = {
    'run.background_enqueued',
    'tool.execution_completed',
    'tool.execution_started',
}


def scope_claims(body, scope):
    """Explicit EventRecord editions, never a policy object's count partition.

    In particular, the word Project in cardinality_scope=project or in an
    artifact body's partition is not evidence of an EventRecord's scope.
    Return the scope words so regression controls can remove scope alone
    without removing the selected policy/setting token.
    """
    value = re.sub(r'\\[nrt]', ' ', body).replace('\\', '')
    pattern = (
        r'\b(?:application_or_project|both scopes)\b'
        r'|\b' + scope + r'_only\b'
        r'|\b' + scope + r'(?=\s*(?:[- ](?:only|scop(?:e|ed))\b|'
        r'root edition\b|editions?\b|eventrecords?\b|records?\b|history\b|'
        r'=\s*(?:`|[\"\x27])?(?:RP-|ai\.usage\.usage-retention)))'
        r'|(?<=scope_kind)' + r'[\s\"\x27:=]*\b' + scope + r'\b'
        r'|(?<=scope_policy)' + r'[\s\"\x27:=]*\b' + scope + r'\b'
        r'|(?<=scope)' + r'[\s\"\x27:=]+\b' + scope + r'\b'
    )
    # A lookbehind on "scope" alone would also match cardinality_scope and
    # instance_scope. Only a standalone scope/key is an edition declaration.
    matches = []
    for match in re.finditer(pattern, value, re.I):
        prefix = value[:match.start()]
        if re.search(r'(?:cardinality_|instance_)scope$', prefix, re.I):
            continue
        matches.append((match.start(), match.end()))
    return value, matches


def without_scope_claims(bodies, scope):
    result = []
    for body in bodies:
        value, matches = scope_claims(body, scope)
        for start, end in reversed(matches):
            value = value[:start] + ' REMOVED_EVENT_SCOPE ' + value[end:]
        result.append(value)
    return result


def selections(row):
    if row.get('payload_versions'):
        return {x['scope_kind']: x.get('retention_policy_ref', row['retention_policy_ref']) for x in row['payload_versions']}
    return {row['scope_policy'].removesuffix('_only'): row['retention_policy_ref']}


def missing_facets(body, row, policies):
    """Require actual binding values; words such as 'existing anchors' do not pass."""
    # Quotes may be exact serialized YAML, Markdown or JSON. Whitespace and
    # quoting punctuation cannot change a policy/anchor/count token's identity.
    value = re.sub(r'\\[nrt]', ' ', body).replace('\\', '')
    flat = re.sub(r'\s+', ' ', value).lower()
    missing = []
    for scope, binding in selections(row).items():
        if not scope_claims(body,scope)[1]:
            missing.append(scope + ':scope')
        token = binding.get('policy_id', binding.get('setting_key', ''))
        if not token or token.lower() not in flat:
            missing.append(scope + ':policy_or_setting')
        if binding.get('setting_key'):
            if binding.get('anchor', '').lower() not in flat or not binding.get('anchor'):
                missing.append(scope + ':anchor')
            if not re.search(r'no count eviction|no cardinality|count[^.]{0,60}(?:none|unlimited|not applied)', flat):
                missing.append(scope + ':count')
            continue
        policy = policies[token]
        aliases = {
            'creation':r'first[- ](?:durable[- ]?)?sav(?:e|ed)',
            'terminal_transition':r'terminal[- ]transition',
            'run_completion':r'run[- ]completion',
            'explicit_delete':r'explicit[- ]delet(?:e|ion)',
            'reference_release':r'reference[- ]release',
        }
        anchor = policy['anchor_kind'].lower()
        if anchor not in flat and not re.search(aliases.get(anchor, r'(?!)'), flat):
            missing.append(scope + ':anchor')
        if row['event_type'] in CREW:
            count = 'server counterpart' if scope == 'application' else 'project partition'
            if count not in flat:
                missing.append(scope + ':effective_count')
        else:
            count_scope = policy.get('cardinality_scope')
            if count_scope:
                if not re.search(r'cardinality_scope[\s"\x27:=]*' + count_scope + r'\b|(?:per[- ]|count[^.]{0,100})' + count_scope + r'\b', flat) and not (count_scope == 'instance' and re.search(r'application[- ](?:wide )?(?:allowance|bucket)|server[- ]wide.*bucket', flat)):
                    missing.append(scope + ':count_partition')
            elif not re.search(r'cardinality_scope[\s"\x27:=]*null\b|no (?:age or )?(?:count|cardinality)|unbounded|indefinite', flat):
                missing.append(scope + ':count_partition')
            maximum = policy.get('max_cardinality')
            if maximum is not None and str(maximum) not in flat.replace(',', '').replace('_', ''):
                missing.append(scope + ':count_limit')
    return sorted(set(missing))


def range_text(item, read):
    item = item.get('current_citation', item)
    path = item['path']
    if re.search(r'@[0-9a-f]{40}$', path):
        raise ValueError('historical-only evidence has no current citation')
    body = read(path)
    lines = body.splitlines()
    start = item.get('line_start', item.get('line'))
    end = item.get('line_end', start)
    if not isinstance(start, int) or not isinstance(end, int) or not 1 <= start <= end <= len(lines):
        raise ValueError('invalid current evidence range')
    unit = item.get('unit', '')
    if not path.startswith('Plans/') or not path.endswith('.md'):
        # A secondary oracle or exact policy object need not repeat the family
        # assignment (lead's 2026-11-19 retention-scope clarification). Its
        # actual current bytes still have to match their coordinates.
        result = '\n'.join(lines[start-1:end])
        if item.get('quote') and item['quote'] not in result:
            raise ValueError('current quote absent from cited range')
        return result
    span = w.unit_span(body, unit) if re.fullmatch(r'[A-Z][A-Z0-9]*-\d+', unit) else w.heading_span(body, unit.removeprefix('heading:'))
    if not span or not span[0] <= start <= end <= span[1]:
        raise ValueError('current retention range exceeds its declared unit')
    result = '\n'.join(lines[start-1:end])
    if item.get('quote') and item['quote'] not in result:
        raise ValueError('current quote absent from cited range')
    return result


def complete_range(item, row, policies, read):
    """Expand only inside the original unit. Return no proof when it lacks values."""
    current = item.get('current_citation', item)
    path, unit = current['path'], current.get('unit', '')
    if not path.startswith('Plans/') or not path.endswith('.md'):
        return None
    body = read(path)
    span = w.unit_span(body, unit) if re.fullmatch(r'[A-Z][A-Z0-9]*-\d+', unit) else w.heading_span(body, unit.removeprefix('heading:'))
    if not span:
        return None
    lines = body.splitlines()
    first, last = span[0], min(span[1], len(lines))
    if missing_facets('\n'.join(lines[first-1:last]), row, policies):
        return None
    # Preserve the family's current assignment, then contract the surrounding
    # range while every actual binding token remains present.
    matches = [i for i in range(first, last+1) if 'Current selected assignment' in lines[i-1] and row['event_type']+'@' in lines[i-1]]
    anchor = matches[0] if len(matches) == 1 else current.get('line_start', first)
    if not first <= anchor <= last:
        return None
    while first < anchor and not missing_facets('\n'.join(lines[first:last]), row, policies):
        first += 1
    while last > anchor and not missing_facets('\n'.join(lines[first-1:last-1]), row, policies):
        last -= 1
    return dict(path=path, unit=unit, line_start=first, line_end=last,
        quote='\n'.join(lines[first-1:last]), quote_check='exact',
        quote_scope=f'unit {unit}, {path}:{span[0]}-{span[1]}')


def assignment_range(item, row, read):
    """The whole physical paragraph, including YAML wrapping, in its own unit."""
    item = item.get('current_citation', item)
    path, unit = item['path'], item.get('unit', '')
    body = read(path)
    if not path.startswith('Plans/') or not path.endswith('.md'):
        return None
    span = w.unit_span(body, unit) if re.fullmatch(r'[A-Z][A-Z0-9]*-\d+', unit) else w.heading_span(body, unit.removeprefix('heading:'))
    if not span:
        return None
    lines = body.splitlines()
    first, last = span[0], min(span[1], len(lines))
    hits = [i for i in range(first, last+1) if 'Current selected assignment' in lines[i-1] and row['event_type']+'@' in lines[i-1]]
    if len(hits) != 1:
        return None
    start = end = hits[0]
    while end < last and lines[end].strip():
        if lines[end].lstrip().startswith(('Current selected assignment', 'gui_related:', '```')):
            break
        end += 1
    return dict(path=path, unit=unit, line_start=start, line_end=end,
        quote='\n'.join(lines[start-1:end]), quote_check='exact',
        quote_scope=f'unit {unit}, {path}:{span[0]}-{span[1]}')


def union_range(item, row, policies, read):
    """Find existing complete proof in this exact unit, including setting rules."""
    paragraph = assignment_range(item, row, read)
    if paragraph and not union_missing([paragraph['quote']], row, policies)[0]:
        return paragraph
    item = item.get('current_citation', item)
    path, unit = item['path'], item.get('unit', '')
    if not path.startswith('Plans/') or not path.endswith('.md'):
        return None
    body = read(path)
    span = w.unit_span(body, unit) if re.fullmatch(r'[A-Z][A-Z0-9]*-\d+', unit) else w.heading_span(body, unit.removeprefix('heading:'))
    if not span:
        return None
    lines = body.splitlines()
    first, last = span[0], min(span[1], len(lines))
    if union_missing(['\n'.join(lines[first-1:last])], row, policies)[0]:
        return None
    # Retain the explicit current assignment where it exists; otherwise retain
    # this family's named owner contract and its actual policy/scope values.
    anchor = paragraph['line_start'] if paragraph else first
    while first < anchor and not union_missing(['\n'.join(lines[first:last])], row, policies)[0]:
        first += 1
    while last > anchor and not union_missing(['\n'.join(lines[first-1:last-1])], row, policies)[0]:
        last -= 1
    return dict(path=path, unit=unit, line_start=first, line_end=last,
        quote='\n'.join(lines[first-1:last]), quote_check='exact',
        quote_scope=f'unit {unit}, {path}:{span[0]}-{span[1]}')


def github_count_evidenced(bodies):
    assignment = shared_limit = False
    for body in bodies:
        clause = re.sub(r'\s+', ' ', body).lower()
        assignment |= (
            'scope_kind=application' in clause
            and 'counts in `app:github_sign_in`' in clause
            and 'dl-401 gives these five' in clause
            and all(f'`{event}`' in clause for event in GITHUB_SIGN_IN)
        )
        shared_limit |= (
            'each application-wide bucket retains at most 2,000,000 records' in clause
            and 'counting every record in the bucket whichever of its families wrote it' in clause
        )
    return assignment and shared_limit


def dt_count_evidenced(bodies):
    for body in bodies:
        clause = re.sub(r'\s+', ' ', body).lower()
        if (
            'application eventrecords of' in clause
            and all(f'`{event}`' in clause for event in DT_SERVER_COUNT)
            and 'its own sp-349 server-wide counterpart bucket' in clause
            and '5,000,000 per puppet master server and storage instance' in clause
            and '1,000,000 per actual run' in clause
        ):
            return True
    return False


def effective_count_missing(bodies, event, scope, lower):
    if event in CREW:
        return ('server counterpart' if scope == 'application' else 'project partition') not in lower
    if scope != 'application':
        return False
    if event in GITHUB_SIGN_IN:
        return not github_count_evidenced(bodies)
    if event == 'filesafe.policy_degraded':
        return not all(token in lower for token in ('app:filesafe_policy_degraded', 'server', 'dl-2450'))
    return event in DT_SERVER_COUNT and not dt_count_evidenced(bodies)


def union_missing(bodies, row, policies):
    """Per-family credit; naming an exact policy establishes its object fields.

    Secondary witnesses are allowed. Each scope still needs an actual current
    assignment naming its selected object, not a row hash or a PASS verdict.
    Effective owner count overrides are checked separately from base objects.
    """
    value = re.sub(r'\\[nrt]', ' ', ' '.join(bodies)).replace('\\', '')
    flat = re.sub(r'\s+', ' ', value)
    lower = flat.lower()
    gaps, bindings = [], []
    for scope, selected in selections(row).items():
        token = selected.get('policy_id', selected.get('setting_key', ''))
        named = bool(token and token in flat)
        # The row's exact policy version is authenticated independently from
        # the text. Never accept a policy-looking string absent from canon.
        policy = policies.get(selected.get('policy_id'))
        exact = bool(policy and policy['policy_version'] == selected.get('policy_version')) if selected.get('policy_id') else selected.get('setting_key') == 'ai.usage.usage-retention'
        if not named or not exact:
            gaps.append(scope+':selected_policy_assignment')
        scoped = any(scope_claims(body, scope)[1] for body in bodies)
        names = {v.get('policy_id', v.get('setting_key')) for v in selections(row).values()}
        if len(names) > 1:
            labels = list(re.finditer(r'\b(application|project)(?=\s*(?:=|editions?\b|records?\b|history\b))', flat, re.I))
            scope_values = []
            for i, label in enumerate(labels):
                end = labels[i+1].start() if i+1 < len(labels) else len(flat)
                if label[1].lower() == scope:
                    scope_values.append(flat[label.end():end])
            scoped = scoped and any(token in clause for clause in scope_values)
        if not scoped:
            gaps.append(scope+':assignment_scope')
        if selected.get('setting_key') and selected.get('anchor', '') not in flat:
            gaps.append(scope+':setting_anchor')
        if selected.get('setting_key') and not re.search(r'no count eviction|no cardinality|count[^.]{0,60}(?:none|unlimited|not applied)', lower):
            gaps.append(scope+':setting_count')
        event = row['event_type']
        if effective_count_missing(bodies, event, scope, lower):
            gaps.append(scope+':effective_count')
        count_owner = 'SP-351' if event in CREW else None
        if scope == 'application' and event in GITHUB_SIGN_IN:
            count_owner = 'DL-401'
        elif scope == 'application' and event in DT_SERVER_COUNT:
            count_owner = 'DL-2597'
        elif scope == 'application' and event == 'filesafe.policy_degraded':
            count_owner = 'DL-2450'
        bindings.append(dict(scope=scope, selected=selected, named_in_current_union=named,
            policy_object_fields=policy, effective_count_owner=count_owner))
    return sorted(set(gaps)), bindings
