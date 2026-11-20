#!/usr/bin/env python3
"""PNC-019 S6: source-bound token dispositions and a judgement queue.

This is a sizing/classification tool, never a denominator seal. In particular,
preparation, quarantine and registry membership do not certify contract depth.
Run again on a fresh post-admission edition before the final S6 owner review.
"""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import math
import re
import subprocess
from collections import Counter, defaultdict
from pathlib import Path

from pm_event_token_custody import custody_case
from pm_event_token_reconstruction import occurrence_case

ROOT = Path(__file__).resolve().parents[1]
AUDIT = 'Plans/.audits/event-authority-2026-08-13-currentness'
HISTORY = 'Plans/.audits/event-authority-2026-08-12'
REGISTRY = 'Plans/event_family_registry.json'
RECOUNT = 'reports/event-authority-20261104/census-recount-20261104/NEW-LIST.json'
OUTCOMES = HISTORY + '/recount/OUTCOMES.json'
BROWSER = 'Plans/browser_event_admission.json'
FILE_RE = re.compile(r'\.(?:json|jsonl|md|txt|bin|redb|xml|tmp|tsv|rs|py|toml|yaml|yml|db)$')
VERSION_RE = re.compile(r'(?:\.|_)v\d+$')
FIELD_RE = re.compile(r'^(?:payload|details|diagnostic|original|page|task|rule|artifact|self|cause|actual|affected_scope|allowed_scope|cancellation_scope|retention_hold_record|tier_node|parallel_group|done|format|config|settings|ui|local|widget|catalog|home)\.')
FINAL_EXCLUDED = {'RECLASSIFY_TO_EXCLUDED', 'RECONFIRM_EXCLUDE', 'CONFIRM_EXACT_EXCLUDE', 'REJECTED_LEXICAL_CANDIDATE'}
KEEP = {'KEEP_REGISTERED', 'KEEP_REGISTERED_AUGUST_LIVE'}
INTERIM = {'KEEP_QUARANTINED', 'NEEDS_MORE_EVIDENCE'}
# Ordered rules: exactly one of these is selected per token. Context rules are
# queue dispositions only, never an alias/admission inferred from a nearby word.
RULES = [
    ('registered', 'Exact live registry row; preserve membership only, with admission-record refs when present.'),
    ('landed_exclusion', 'Exact census/individual/supplemental row explicitly excludes or rejects the token.'),
    ('landed_alias', 'Exact landed ledger says RECLASSIFY_ALIAS; retain its alias target without inventing equivalence.'),
    ('holding_quarantine', 'Exact ledger row in quarantined_not_admitted; DL-039 holding decision, outside D.'),
    ('pending_ledger', 'Exact ledger has KEEP_QUARANTINED or NEEDS_MORE_EVIDENCE; pending admission, never final.'),
    ('recount_outcome', 'Exact OUTCOMES row; exclusion requires a landed DL and Plans owner citation; registration requires registry membership.'),
    ('pending_recount', 'Exact NEW-LIST row without a final outcome; preparation cannot authorize admission.'),
    ('pending_preparation', 'Exact Browser/readiness preparation row, without registry membership or final disposition.'),
    ('command_namespace', 'cmd. namespace denotes a command reference, not an event-family admission.'),
    ('identifier_namespace', 'pm./https./www. identifier namespace, as observed in the re-extracted source row.'),
    ('filename_reference', 'Exact dotted filename suffix (closed suffix list); cite the source occurrence.'),
    ('version_identifier', 'Exact .vN or _vN suffix denotes a version/key/schema identifier; cite the source occurrence.'),
    ('field_or_ui_path', 'Closed field/UI/ConfigKey prefix list; never infer role-qualified emitter/owner/projector identities.'),
    ('negative_context_reference', 'Non-event-like token with an explicit negative discovery window; cite that exact window, without inferring an alias.'),
    ('schema_fixture_reference', 'Non-event-like token in an actual schema/fixture discovery occurrence; queue classification only.'),
    ('lineage_context_reference', 'Non-event-like token in an actual compatibility/lineage discovery occurrence; queue classification only, no alias inferred.'),
    ('judgement_residue', 'Uncovered likely/contested/event-like or ambiguous token, or conflicting/incomplete authority; requires owner review.'),
]


class InputError(RuntimeError):
    pass


def require_case(case, value):
    """Runtime dispatch uses the very predicates Method B cuts in isolation.

    GuardTable.require itself belongs to the proof engine's bound Case runs;
    an ordinary CLI does not bind or call the engine's private runtime methods.
    """
    for row in case.table.guards.values():
        code = row.predicate(value, case.context)
        if code is not None:
            raise InputError(code)


def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()


def sha(data):
    return hashlib.sha256(data).hexdigest()


def git(root, *args):
    return subprocess.run(['git', *args], cwd=root, check=True, capture_output=True).stdout


def unique_json(data):
    def pairs(items):
        result = {}
        for key, value in items:
            if key in result:
                raise InputError(f'duplicate JSON key: {key}')
            result[key] = value
        return result
    def constant(token):
        raise InputError('non-finite JSON number: ' + token)
    def real(token):
        value = float(token)
        if not math.isfinite(value):
            raise InputError('non-finite JSON number: ' + token)
        return value
    return json.loads(data, object_pairs_hook=pairs, parse_constant=constant, parse_float=real)


class Sources:
    """Authority comes from this pinned Git revision, never an unlanded edit."""
    def __init__(self, root):
        self.root = root.resolve()
        self.head = git(root, 'rev-parse', 'HEAD').decode().strip()
        self.paths = set(git(root, 'ls-tree', '-r', '--name-only', self.head).decode().splitlines())
        self.blobs = {}

    def read(self, path, optional=False):
        if path not in self.paths:
            if optional:
                return None
            raise InputError(f'required landed authority missing: {path}')
        if path not in self.blobs:
            data = git(self.root, 'show', self.head + ':' + path)
            local = self.root / path
            if local.exists() and local.read_bytes() != data:
                raise InputError(f'uncommitted authority source: {path}')
            self.blobs[path] = data
        return self.blobs[path]

    def ref(self, path, value, pointer='', line=None):
        return {'path': path, 'sha256': sha(self.read(path)), 'git_commit': self.head,
                'json_pointer': pointer, 'line': line, 'row_sha256': sha(canonical(value))}

    def rows(self, path, key, container=None, optional=False):
        data = self.read(path, optional)
        if data is None:
            return {}
        doc = ([unique_json(x) for x in data.splitlines() if x.strip()]
               if path.endswith('.jsonl') else unique_json(data))
        if container:
            doc = doc[container]
        if not isinstance(doc, list):
            raise InputError(f'authority rows must be an array: {path}')
        result = {}
        for n, row in enumerate(doc):
            if not isinstance(row, dict):
                raise InputError(f'authority row must be an object: {path}:{n + 1}')
            token = row.get(key)
            if not isinstance(token, str) or not token or token in result:
                raise InputError(f'invalid/duplicate authority token: {path}:{n + 1}')
            pointer = f'/{container}/{n}' if container else f'/{n}'
            result[token] = (row, self.ref(path, row, pointer, n + 1 if path.endswith('.jsonl') else None))
        return result


def census_module(root):
    # This is the currentness producer, not the frozen seal validator.
    spec = importlib.util.spec_from_file_location('pm_s6_currentness', root / 'scripts/pm-event-authority-currentness.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    module.ROOT = root
    module.PLANS = root / 'Plans'
    module.HISTORICAL_INVENTORY = root / HISTORY / 'closed-world-census/CURRENT_SOURCE_INVENTORY.FRESH_20260812T0900.json'
    return module


def edition_inputs(root, edition):
    """Rehash AND re-extract; recomputed hashes alone cannot bless an omission."""
    producer = census_module(root)
    raw = {p.name: p.read_bytes() for p in edition.iterdir() if p.is_file()}
    inventory = unique_json(raw['CURRENT_EVENT_SOURCE_INVENTORY.json'])
    receipt = unique_json(raw['VALIDATOR_RECEIPT.json'])
    status = unique_json(raw['EVENT_FAMILY_DENOMINATOR_STATUS.json'])
    if (inventory.get('schema_id') != 'pm.event_authority.current_source_inventory.v1'
            or receipt.get('schema_id') != 'pm.event_authority.currentness_validator_receipt.v1'
            or status.get('schema_id') != 'pm.event_authority.denominator_currentness_status.v1'
            or receipt.get('validator_path') != 'scripts/pm-event-authority-currentness.py'
            or receipt.get('evidence_valid') is not True):
        raise InputError('invalid edition identity or failed producer receipt')
    rows = [unique_json(x) for x in raw['EVENT_OCCURRENCES.jsonl'].splitlines() if x.strip()]
    source_rows = inventory['sources']
    names = [x['path'] for x in source_rows]
    if len(names) != len(set(names)):
        raise InputError('duplicate edition source path')
    live_paths = producer.source_paths()
    frozen = {p: p.read_bytes() for p in live_paths}
    live_hashes = {p.relative_to(root).as_posix(): [len(data), sha(data)] for p, data in frozen.items()}
    expected_hashes = {x['path']: [x['bytes'], x['sha256']] for x in source_rows}
    registered = {x['event_type'] for x in unique_json(frozen[root / REGISTRY])['families']}
    # The receipt's complete artifact map is checked, including custody groups.
    observed_artifacts = {}
    for path in receipt['artifact_hashes']:
        relative = Path(path).relative_to(AUDIT)
        if '..' in relative.parts or relative.is_absolute():
            raise InputError('unsafe edition artifact path')
        immutable = (relative.as_posix() == 'adjudication/EXPECTED_252_EVENT_TYPES.tsv'
                     or relative.as_posix().startswith('adjudication/source_groups/'))
        physical = root / path if immutable else edition / relative
        observed_artifacts[path] = sha(physical.read_bytes())
    required = {AUDIT + '/' + x for x in ('CURRENT_EVENT_SOURCE_INVENTORY.json', 'EVENT_OCCURRENCES.jsonl', 'EVENT_FAMILY_DENOMINATOR_STATUS.json')}
    if not required <= set(observed_artifacts):
        raise InputError('receipt omits required edition artifact')
    value = {
        'validator_hash': sha((root / 'scripts/pm-event-authority-currentness.py').read_bytes()),
        'receipt_validator_hash': receipt['validator_sha256'],
        'artifact_hashes': observed_artifacts, 'receipt_artifact_hashes': receipt['artifact_hashes'],
        'source_paths': sorted(live_hashes), 'inventory_source_paths': sorted(names),
        'source_hashes': live_hashes, 'inventory_source_hashes': expected_hashes,
        'source_manifest_hash': sha(canonical(source_rows)), 'inventory_manifest_hash': inventory['sources_sha256'],
    }
    require_case(custody_case(), value)
    rebuilt = producer.build_occurrences(frozen, registered)
    require_case(occurrence_case(), {'occurrences_sha256': sha(raw['EVENT_OCCURRENCES.jsonl']),
                                    'reconstructed_occurrences_sha256': sha(b''.join(canonical(x) + b'\n' for x in rebuilt))})
    census = status['live_mechanical_census']
    if census['unique_tokens'] != len(rows) or census['occurrences'] != sum(x['occurrence_count'] for x in rows):
        raise InputError('edition status census count mismatch')
    if census['classification_counts'] != dict(Counter(x['primary_mechanical_classification'] for x in rows)):
        raise InputError('edition status discovery class mismatch')
    if status['registry']['sha256'] != sha(frozen[root / REGISTRY]):
        raise InputError('edition registry status drift')
    return rows, frozen, {'edition': str(edition), 'artifacts': {k: sha(v) for k, v in sorted(raw.items())},
                          'source_manifest_sha256': inventory['sources_sha256'],
                          'edition_generated_at_utc': inventory['generated_at_utc']}


def authority(sources, readiness):
    registries = sources.rows(REGISTRY, 'event_type', 'families')
    ledgers = defaultdict(list)
    ledger_dirs = {HISTORY + '/' + d for d in ('census-adjudication', 'individual-disposition')}
    for path in sorted(sources.paths):
        # Source shards and old overlay ledgers are lineage. Only the two live
        # top-level ledgers and their explicit new-name supplements grant a row.
        if path.rsplit('/', 1)[0] in ledger_dirs:
            name = Path(path).name
            if name == 'LEDGER.jsonl' or name.endswith('-NEW-NAMES-LEDGER.jsonl'):
                for token, pair in sources.rows(path, 'event_type').items():
                    ledgers[token].append(pair)
    recount = sources.rows(RECOUNT, 'name')
    outcomes = {}
    data = sources.read(OUTCOMES, optional=True)
    if data is not None:
        doc = unique_json(data)
        if isinstance(doc, dict):
            containers = [k for k in ('rows', 'outcomes') if isinstance(doc.get(k), list)]
            if len(containers) != 1:
                raise InputError('OUTCOMES needs exactly one rows/outcomes array')
            container = containers[0]
            values = doc[container]
        else:
            container, values = None, doc
        if not isinstance(values, list):
            raise InputError('OUTCOMES must contain an array')
        for n, row in enumerate(values):
            if not isinstance(row, dict):
                raise InputError('recount outcome must be an object')
            token = row.get('event_type', row.get('name'))
            if not isinstance(token, str) or token not in recount or token in outcomes:
                raise InputError('invalid, extra or duplicate recount outcome')
            outcomes[token] = (row, sources.ref(OUTCOMES, row, f'/{container}/{n}' if container else f'/{n}'))
    prepared = defaultdict(list)
    for token, pair in sources.rows(BROWSER, 'event_type', 'rows').items():
        prepared[token].append(pair)
    external = []
    for path in readiness:
        data = path.read_bytes()
        rows = unique_json(data)
        if not isinstance(rows, list):
            raise InputError('readiness input must be an array')
        seen = set()
        for n, row in enumerate(rows):
            if not isinstance(row, dict):
                raise InputError('readiness row must be an object')
            token = row.get('event_type')
            if not isinstance(token, str) or token in seen:
                raise InputError('invalid/duplicate readiness token')
            seen.add(token)
            ref = {'path': str(path), 'sha256': sha(data), 'json_pointer': f'/{n}',
                   'row_sha256': sha(canonical(row)), 'authority': 'preparation_only_not_admission'}
            # External readouts are lineage, not landed authority. Resolve their
            # pinned report whenever supplied and keep stale pins visible.
            if row.get('source') and row.get('source_sha256'):
                landed = sources.read(row['source'], optional=True)
                ref['landed_source_pin_current'] = landed is not None and sha(landed) == row['source_sha256']
            prepared[token].append((row, ref))
        external.append({'path': str(path), 'sha256': sha(data), 'rows': len(rows)})
    return registries, ledgers, recount, outcomes, prepared, external


def occurrence_ref(row, evidence, desired=None):
    candidates = [x for x in row['occurrences'] if x['mechanical_classification'] == desired]
    occ = (candidates or row['occurrences'])[0]
    source_hash, lines = evidence[occ['path']]
    lo, hi = max(0, occ['line'] - 2), min(len(lines), occ['line'] + 1)
    return {'path': occ['path'], 'sha256': source_hash, 'line': occ['line'],
            'context_sha256': occ['context_sha256'], 'excerpt': '\n'.join(lines[lo:hi]),
            'window_start_line': lo + 1, 'window_end_line': hi}


def exclusion_evidence(sources, token, row):
    """Validate the frozen recount row's actual DL/owner-span fields.

    This consumes the producer's row format; it does not invoke, edit or replace
    the independently frozen seal validator or certify its admission checks.
    """
    if (set(row) != {'event_type', 'outcome', 'disposition', 'decision_ref', 'decision_section_sha256', 'rationale', 'source_citations'}
            or row.get('disposition') != 'RECLASSIFY_TO_EXCLUDED'
            or not isinstance(row.get('rationale'), str) or not row['rationale'].strip()):
        return None
    decision = row.get('decision_ref', '')
    if not isinstance(decision, str) or not re.fullmatch(r'Plans/Decision_Log\.md#DL-\d+', decision):
        return None
    number = decision.split('#')[1]
    data = sources.read('Plans/Decision_Log.md')
    marker = ('### ' + number + ':').encode()
    if data.count(marker) != 1:
        return None
    start = data.index(marker)
    body = data.index(b'\n', start) + 1
    following = re.search(rb'(?m)^#{1,3} ', data[body:])
    end = body + following.start() if following else len(data)
    section = data[start:end]
    token_re = r'(?<![A-Za-z0-9_.])' + re.escape(token) + r'(?![A-Za-z0-9_.])'
    if sha(section) != row.get('decision_section_sha256') or not re.search(token_re, section.decode()):
        return None
    refs = [dict(sources.ref('Plans/Decision_Log.md', section.decode(), line=data[:start].count(b'\n') + 1),
                 anchor=number, section_sha256=sha(section))]
    citations = row.get('source_citations')
    if not isinstance(citations, list) or not citations:
        return None
    for cite in citations:
        if not isinstance(cite, dict) or set(cite) != {'path', 'sha256', 'line_start', 'line_end'}:
            return None
        path = cite['path']
        if not isinstance(path, str) or not path.startswith('Plans/'):
            return None
        raw = sources.read(path, optional=True)
        if raw is None or sha(raw) != cite['sha256']:
            return None
        lines = raw.decode().splitlines()
        lo, hi = cite['line_start'], cite['line_end']
        if type(lo) is not int or type(hi) is not int or not 1 <= lo <= hi <= len(lines):
            return None
        excerpt = '\n'.join(lines[lo - 1:hi])
        if not re.search(token_re, excerpt):
            return None
        refs.append(dict(sources.ref(path, excerpt, line=lo), window_start_line=lo, window_end_line=hi, excerpt=excerpt))
    return refs


def choose(row, registry, ledgers, recount, outcomes, prepared, producer, sources):
    token = row['exact_token']
    history = ledgers.get(token, [])
    prep = prepared.get(token, [])
    support = [ref for _, ref in history + prep]
    if token in registry:
        value, ref = registry[token]
        return 'registered', 'REGISTERED_MEMBERSHIP_OBSERVED', 'observed', [ref] + support, None
    if history:
        dispositions = {x.get('disposition') for x, _ in history}
        # Do not silently pick one of the nine conflicting CPU exclusions over
        # its still-quarantined mirror; S4x owns their reconciliation.
        if dispositions <= FINAL_EXCLUDED:
            return 'landed_exclusion', 'EXCLUDED_BY_LANDED_ROW', 'disposed', support, None
        if dispositions == {'RECLASSIFY_ALIAS'}:
            return 'landed_alias', 'ALIAS_ONLY_NOT_ADMITTED', 'disposed', support, None
        if dispositions <= INTERIM and all(x.get('category', x.get('bucket')) == 'quarantined_not_admitted' for x, _ in history):
            return 'holding_quarantine', 'HOLDING_QUARANTINE_OUTSIDE_D', 'disposed', support, None
        if dispositions <= INTERIM:
            return 'pending_ledger', 'PENDING_ADMISSION_OR_OWNER_EVIDENCE', 'pending', support, None
        return 'judgement_residue', 'OWNER_REVIEW_REQUIRED', 'judgement', support, 'conflicting_or_unrecognized_landed_ledger_dispositions:' + ','.join(sorted(str(x) for x in dispositions))
    if token in outcomes:
        value, ref = outcomes[token]
        if value.get('outcome') == 'excluded':
            # A string saying excluded is insufficient: the final writer must
            # cite its own landed decision and an exact Plans owner passage.
            evidence = exclusion_evidence(sources, token, value)
            if evidence:
                return 'recount_outcome', 'EXCLUDED_BY_RECOUNT_OUTCOME', 'disposed', [ref] + evidence + support, None
        return 'judgement_residue', 'OWNER_REVIEW_REQUIRED', 'judgement', [ref] + support, 'incomplete_or_unreconciled_recount_outcome'
    if token in recount:
        return 'pending_recount', 'PENDING_RECOUNT_OUTCOME', 'pending', [recount[token][1]] + support, None
    if prep:
        return 'pending_preparation', 'PREPARED_NOT_ADMITTED', 'pending', support, None
    # Strong lexical shapes precede contextual discovery classes. Role names
    # such as owner.debug.* and projector.chat.* deliberately have no shortcut.
    if token.startswith('cmd.'):
        return 'command_namespace', 'NON_EVENT_COMMAND_REFERENCE', 'mechanical', [], None
    if token.startswith(('pm.', 'https.', 'www.')):
        return 'identifier_namespace', 'NON_EVENT_IDENTIFIER_REFERENCE', 'mechanical', [], None
    if FILE_RE.search(token):
        return 'filename_reference', 'NON_EVENT_FILENAME_REFERENCE', 'mechanical', [], None
    if VERSION_RE.search(token):
        return 'version_identifier', 'NON_EVENT_VERSION_IDENTIFIER', 'mechanical', [], None
    # Product event namespaces (config/settings/home/...) can also name real
    # families. Positive emit/event_type bindings override this lexical hint.
    positive_pattern = (r'\bemit\w*\s+(?:canonical\s+)?[`\"]?' + re.escape(token)
                        + r'(?![A-Za-z0-9_.])|[\"\']event_type[\"\']\s*:\s*[\"\']' + re.escape(token) + r'[\"\']')
    positive_binding = any(re.search(positive_pattern, x['context'], re.I) for x in row['occurrences'])
    if FIELD_RE.search(token) and not positive_binding:
        return 'field_or_ui_path', 'NON_EVENT_FIELD_OR_UI_REFERENCE', 'mechanical', [], None
    primary = row['primary_mechanical_classification']
    event_like = producer.EVENT_VERB_RE.search(token.rsplit('.', 1)[-1])
    contexts = {
        'explicit_non_event_or_forbidden_family': ('negative_context_reference', 'NON_EVENT_NEGATIVE_CONTEXT_REFERENCE'),
        'schema_or_fixture_event_example': ('schema_fixture_reference', 'SCHEMA_FIXTURE_CONTEXT_REFERENCE'),
        'compatibility_or_source_lineage': ('lineage_context_reference', 'LINEAGE_CONTEXT_REFERENCE'),
    }
    if not event_like and primary in contexts:
        cls, disposition = contexts[primary]
        return cls, disposition, 'mechanical', [], None
    return 'judgement_residue', 'OWNER_REVIEW_REQUIRED', 'judgement', [], ('uncovered_event_like_token' if event_like else 'uncovered_ambiguous_token')


def build(root, edition, readiness):
    sources = Sources(root)
    rows, frozen, edition_meta = edition_inputs(root, edition)
    corpus_paths = {p.relative_to(root).as_posix() for p in frozen}
    changed = set(git(root, 'diff', '--name-only', sources.head, '--', 'Plans').decode().splitlines())
    if (corpus_paths - sources.paths) or (corpus_paths & changed):
        raise InputError('edition corpus includes unlanded sources: ' + ','.join(sorted((corpus_paths - sources.paths) | (corpus_paths & changed))))
    registry, ledgers, recount, outcomes, prepared, external = authority(sources, readiness)
    producer = census_module(root)
    evidence = {p.relative_to(root).as_posix(): (sha(data), data.decode('utf-8', errors='replace').splitlines())
                for p, data in frozen.items()}
    output = []
    for row in rows:
        cls, disposition, state, refs, reason = choose(row, registry, ledgers, recount, outcomes, prepared, producer, sources)
        desired = {'negative_context_reference': 'explicit_non_event_or_forbidden_family',
                   'schema_fixture_reference': 'schema_or_fixture_event_example',
                   'lineage_context_reference': 'compatibility_or_source_lineage'}.get(cls)
        ref = occurrence_ref(row, evidence, desired)
        admission = 'reports/event-authority-20260911/admission-records/' + row['exact_token'] + '.json'
        if cls == 'registered' and sources.read(admission, optional=True) is not None:
            value = unique_json(sources.read(admission))
            refs.append(sources.ref(admission, value))
        output.append({'exact_token': row['exact_token'], 'class': cls, 'rule_id': cls,
                       'disposition': disposition, 'resolution_state': state,
                       'discovery_class': row['primary_mechanical_classification'],
                       'occurrence_count': row['occurrence_count'], 'source_rows': refs + [ref],
                       'judgement_reason': reason})
    residual = [x for x in output if x['resolution_state'] == 'judgement']
    summary = {
        'schema_id': 'pm.event_authority.token_disposition_sizing.v1',
        'mode': 'sizing_only_not_final_s6_ledger', 'event_authority_closed': False,
        'complete_denominator_known': False, 'contract_depth_complete': False,
        'build_or_pnc019_authority': False, 'head': sources.head,
        'tokens': len(output), 'occurrences': sum(x['occurrence_count'] for x in output),
        'counts_by_class': {name: sum(x['class'] == name for x in output) for name, _ in RULES},
        'discovery_counts': dict(sorted(Counter(x['discovery_class'] for x in output).items())),
        'counts_by_resolution_state': dict(sorted(Counter(x['resolution_state'] for x in output).items())),
        'judgement_residue': len(residual), 'residue_tokens': [x['exact_token'] for x in residual],
        'edition': edition_meta, 'readiness_inputs': external,
        'authority_inputs': [{'path': p, 'sha256': sha(data)} for p, data in sorted(sources.blobs.items())],
        'tool_inputs': [{'path': p, 'sha256': sha((root / p).read_bytes())} for p in (
            'scripts/pm-event-token-dispositions.py', 'scripts/pm_event_token_custody.py',
            'scripts/pm_event_token_reconstruction.py')],
        'boundary': 'Context classes are mechanical queue dispositions, not semantic event exclusions or alias grants. Pending sources and owner residue must be resolved after admissions; final owner review and S7/S8 certification remain separate.',
    }
    return output, residual, summary


def bundle(output, residual, summary):
    lines = ['# S6 judgement residue', '', f"{len(residual)} tokens; head `{summary['head']}`. Sizing only; no closure claim.", '',
             '| Exact token | Reason | Current source |', '|---|---|---|']
    for row in residual:
        ref = row['source_rows'][-1]
        lines.append(f"| `{row['exact_token']}` | {row['judgement_reason']} | `{ref['path']}:{ref['line']}` |")
    rules = ['# S6 classifier rules', '', 'One selected rule per token; every output row carries its granting source row plus a current occurrence.', '', '| Class / rule id | Predicate and boundary |', '|---|---|']
    rules += [f'| `{name}` | {text} |' for name, text in RULES]
    return {
        'TOKEN_DISPOSITIONS.jsonl': b''.join(canonical(x) + b'\n' for x in output),
        'RESIDUE.jsonl': b''.join(canonical(x) + b'\n' for x in residual),
        'SUMMARY.json': json.dumps(summary, indent=2, ensure_ascii=False).encode() + b'\n',
        'RESIDUE.md': ('\n'.join(lines) + '\n').encode(),
        'RULES.md': ('\n'.join(rules) + '\n').encode(),
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=('classify', 'validate'))
    parser.add_argument('--root', type=Path, default=ROOT)
    parser.add_argument('--edition', type=Path, required=True)
    parser.add_argument('--readiness', type=Path, action='append', default=[])
    parser.add_argument('--outdir', type=Path, required=True)
    args = parser.parse_args()
    try:
        root, edition, outdir = args.root.resolve(strict=True), args.edition.resolve(strict=True), args.outdir.resolve()
        readiness = [x.resolve(strict=True) for x in args.readiness]
        if outdir.is_relative_to(root) or outdir == edition or outdir.is_relative_to(edition) or edition.is_relative_to(outdir):
            raise InputError('outputs must be external to the repository and separate from immutable edition inputs')
        if args.command == 'classify' and outdir.exists() and any(outdir.iterdir()):
            raise InputError('classification requires an empty output directory')
        result = build(root, edition, readiness)
        artifacts = bundle(*result)
        if args.command == 'classify':
            outdir.mkdir(parents=True, exist_ok=True)
            for name, data in artifacts.items():
                (outdir / name).write_bytes(data)
        else:
            for name, data in artifacts.items():
                if (outdir / name).read_bytes() != data:
                    raise InputError(f'classifier output differs from current reclassification: {name}')
        summary = result[2]
        print(json.dumps({'classification_valid': True, 'event_authority_closed': False,
                          'tokens': summary['tokens'], 'occurrences': summary['occurrences'],
                          'counts_by_class': summary['counts_by_class'],
                          'counts_by_resolution_state': summary['counts_by_resolution_state'],
                          'judgement_residue': summary['judgement_residue']}, indent=2))
        return 0
    except (InputError, OSError, ValueError, KeyError, TypeError, subprocess.CalledProcessError) as exc:
        print(json.dumps({'classification_valid': False, 'event_authority_closed': False,
                          'error': str(exc)}))
        return 2


if __name__ == '__main__':
    raise SystemExit(main())
