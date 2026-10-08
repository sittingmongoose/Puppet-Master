#!/usr/bin/env python3
"""Build a different explicit final bundle from frozen metadata and exact bindings.

The caller supplies the completed-case bindings and an independently validated
actual descendant-quiet receipt. This program never captures or grades science.
"""
from pathlib import Path
import argparse
import copy
import hashlib
import importlib.util
import json


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--config', type=Path, required=True)
    args = ap.parse_args()
    cfg_bytes = args.config.read_bytes()
    cfg = json.loads(cfg_bytes)
    assert cfg['schema'] == 'ER10_ROOT_FINAL_METADATA_BUILD_CONFIG_V1'
    root = Path(cfg['bundle_directory']).resolve()
    base_manifest = Path(cfg['base_manifest'])
    original_manifest = json.loads(base_manifest.read_bytes())
    assert base_manifest.parent.resolve() == root
    files = {item['source']: copy.deepcopy(item) for item in original_manifest['files']}
    fmap = json.loads(Path(cfg['base_field_map']).read_bytes())
    records = []

    def add_file(item, body):
        assert digest(body) == item['sha256'] and len(body) == item['bytes']
        sid = item['source']
        if sid in files:
            old = files[sid]
            assert all(old[k] == item[k] for k in ('original_path', 'sha256', 'bytes'))
            return
        rel = 'inputs/by-source/' + digest(sid.encode()) + Path(item['original_path']).suffix
        target = root / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.exists():
            assert target.read_bytes() == body
        else:
            with target.open('xb') as f:
                f.write(body)
        files[sid] = {**copy.deepcopy(item), 'bundle_path': rel}

    for entry in cfg['additional_catalogs']:
        path = Path(entry['path'])
        raw = path.read_bytes()
        assert digest(raw) == entry['sha256']
        records.append({'path': str(path), 'sha256': digest(raw), 'bytes': len(raw)})
        catalog = json.loads(raw)
        for item in catalog['files']:
            add_file(item, (path.parent / item['bundle_path']).read_bytes())

    replacements, patches = {}, {}
    for entry in cfg['binding_files']:
        path = Path(entry['path'])
        raw = path.read_bytes()
        assert digest(raw) == entry['sha256']
        records.append({'path': str(path), 'sha256': digest(raw), 'bytes': len(raw)})
        doc = json.loads(raw)
        patches.update(doc.get('template_list_patches', {}))
        for rule in doc['entries']:
            replacements[rule['output_pointer']] = copy.deepcopy(rule)
    rules, seen = [], set()
    for rule in fmap['entries']:
        pointer = rule['output_pointer']
        rules.append(replacements.get(pointer, rule))
        seen.add(pointer)
    rules.extend(rule for pointer, rule in replacements.items() if pointer not in seen)
    for rule in rules:
        refs = [rule['original']] if rule.get('original') else []
        refs += [binding['original'] for binding in rule.get('semantic_bindings', [])]
        for ref in refs:
            if ref['source'] not in files:
                body = Path(ref['original_path']).read_bytes()
                add_file({k: ref[k] for k in ('source', 'original_path', 'sha256', 'bytes')}, body)
            item = files[ref['source']]
            assert all(item[k] == ref[k] for k in ('original_path', 'sha256'))
            ref['bundle_path'] = item['bundle_path']
    fmap['entries'] = rules

    quiet_path = Path(cfg['quiet_receipt']['path'])
    quiet_body = quiet_path.read_bytes()
    assert digest(quiet_body) == cfg['quiet_receipt']['sha256']
    quiet = json.loads(quiet_body)
    assert quiet['all_owned_candidate_review_helper_coordinator_task_trees_actual_quiet'] is True
    assert quiet['all_owned_backing_threads_settled'] is True
    assert quiet['complete_project_paginated_census'] is True
    quiet_source = 'final_actual_quiet/' + quiet_path.name
    add_file(dict(source=quiet_source, original_path=str(quiet_path),
                  sha256=digest(quiet_body), bytes=len(quiet_body)), quiet_body)
    evidence = []
    for sid in ['D-M06-A', 'D-M06-B', 'D-M07-B', 'D-M09-A']:
        q = quiet['cases'][sid]
        assert q['all_task_trees_and_descendants_actual_quiet'] is True
        assert q['scope'] == 'ALL_ORIGINAL_CANDIDATE_REVIEW_TASK_TREES_AND_DESCENDANTS_QUIET'
        evidence.append(dict(slot_id=sid, scope=q['scope'], exact_value=True,
                             original={**files[quiet_source],
                                       'pointer': '/cases/' + sid + '/all_task_trees_and_descendants_actual_quiet'}))
    template = fmap['ledger_template']
    template['status'] = 'FINAL_EXPLICIT_FROZEN'
    template['campaign_terminal'] = True
    template['logical_denominator']['closed'] = 40
    template['logical_denominator']['live_held'] = 0
    for row in template['slots']:
        row['closure'] = 'CLOSED'
        for key, value in patches.get(row['slot_id'], {}).items():
            row[key] = copy.deepcopy(value)
    manifest = dict(schema='ER10_EXPLICIT_FROZEN_FINAL_INPUT_MANIFEST_V1',
                    campaign_terminal=True, all_40_slots_actual_quiet=True,
                    index_sha256=cfg['index_sha256'],
                    closed_slot_ids=[x['slot_id'] for x in template['slots']],
                    closure_evidence=evidence, files=list(files.values()),
                    build_config_sha256=digest(cfg_bytes), binding_identities=records,
                    original_working_manifest_unchanged=True,
                    scope='Frozen metadata replay and exact actual queue closure. CLOSED includes honest failed or unassessed dispositions; it does not certify full source quality or native qualification.')
    assert len(manifest['closed_slot_ids']) == len(set(manifest['closed_slot_ids'])) == 40
    manifest_path, fmap_path = root / cfg['manifest_name'], root / cfg['field_map_name']
    assert not manifest_path.exists() and not fmap_path.exists()
    for path, value in [(manifest_path, manifest), (fmap_path, fmap)]:
        with path.open('x') as f:
            json.dump(value, f, indent=2, ensure_ascii=False)
            f.write('\n')
    spec = importlib.util.spec_from_file_location('er10_final_offline_replay', cfg['replay_code'])
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    bundle = module.Bundle(manifest_path)
    ledger, gaps = module.replay(bundle, fmap)
    historical = json.loads(Path(cfg['immutable_working_ledger']).read_bytes())
    byid = {row['slot_id']: row for row in ledger['slots']}
    for prior in historical['slots']:
        if prior['closure'] != 'CLOSED':
            continue
        for arm, old in prior['arms'].items():
            for field in ['original_grade_string', 'original_grade_record']:
                assert byid[prior['slot_id']]['arms'][arm][field]['value'] == old[field]['value']
    for rule in fmap['entries']:
        cell = module.at(ledger, rule['output_pointer'])
        assert module.evaluate(rule, bundle, ledger) == cell
        if rule['transformation'] == 'record_reference':
            assert cell['state'] != 'UNKNOWN', rule['output_pointer']
        if rule['transformation'] == 'enum_bool':
            assert rule.get('semantic_bindings') and rule.get('scope')
        if rule['output_pointer'].endswith(('/full_scientific_coverage', '/full_declared_primary_source_coverage')):
            assert rule['transformation'] in {'explicit_bool', 'enum_bool', 'unknown', 'all_three_valued', 'paired_values'}
            if rule['transformation'] in {'explicit_bool', 'enum_bool'}:
                assert rule.get('semantic_bindings')
    assert all(sum(v['counts'].values()) == v['denominator'] for v in ledger['aggregates'].values())
    receipt = dict(schema='ER10_ROOT_FINAL_METADATA_BUILD_VALIDATION_V1', passed=True,
                   frozen_input_files=len(files), frozen_input_bytes=sum(x['bytes'] for x in files.values()),
                   mapping_entries=len(rules), original_36_closed_grade_terms_and_records_unchanged=True,
                   every_mapping_replayed=True, every_record_reference_resolved=True,
                   no_coverage_from_counts_or_terminals=True,
                   logical_denominator=ledger['logical_denominator'],
                   mapping_coverage=ledger['mapping_coverage'],
                   manifest_sha256=digest(manifest_path.read_bytes()),
                   field_map_sha256=digest(fmap_path.read_bytes()),
                   original_grade_or_scientific_conclusion_written=False)
    with (root / cfg['validation_name']).open('x') as f:
        json.dump(receipt, f, indent=2)
        f.write('\n')
    print(json.dumps(receipt))


if __name__ == '__main__':
    main()
