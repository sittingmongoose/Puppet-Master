#!/usr/bin/env python3
"""Reproduce the E14-B census from exact FIX4 receipts and six review rosters.

This is an evidence census, not a new semantic grade or a governance reseal.
The landing target remains the tested commit. Delivery may add this script and
the compact census bundle, but may change no product or admission bytes.
"""
import argparse
import collections
import hashlib
import json
import re
import subprocess
from pathlib import Path

TARGET = '074e85a9d585790a6d8b1bf7df0ddb4c7b86d301'
OUTPUT = 'reports/event-authority-20261116/admission-merge-2/census'
SCRIPT = 'scripts/pm-ea-merge2-census.py'
ROUNDS = ['MERGE2-astra62max', 'MERGE2-sol62max', 'MERGE2-R1-sol62max',
          'MERGE2-R2-astra62max', 'MERGE2-R2-sol62max', 'MERGE2-R3-sol62max']
FIX4 = 'drafts/PNC019/merge2-fix4/'


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def git(*argv):
    return subprocess.check_output(['git', *argv])


def classify(checks, findings):
    return 'LAND' if all(c['status'] == 'PASS' for c in checks.values()) and all(
        f['status'] == 'closed' for f in findings) else 'MERGE3'


class Census:
    def __init__(self, evidence):
        self.evidence = evidence
        self.inputs = {}
        self.cache = {}

    def raw(self, name):
        if name not in self.cache:
            raw = (self.evidence / name).read_bytes()
            self.cache[name] = raw
            self.inputs[name] = {'sha256': digest(raw), 'bytes': len(raw)}
        return self.cache[name]

    def read(self, name):
        return json.loads(self.raw(name))

    def final(self, name):
        return self.read(FIX4 + 'evidence/' + name)

    def review(self, round_name, name):
        return self.read('reviews/' + round_name + '/evidence/' + name)

    def build(self):
        # Authenticate the immutable FIX4 packet before reusing any execution.
        final = self.read(FIX4 + 'FINAL.json')
        manifest_raw = self.raw(FIX4 + 'SHA256SUMS')
        assert digest(manifest_raw) == final['manifest_sha256']
        manifest = dict(line.split('  ', 1)[::-1] for line in manifest_raw.decode().splitlines())
        assert final['head'] == TARGET and final['manifest_verified_files'] == 193
        assert final['jobs_settled'] and final['blocking'] == 0
        assert final['infrastructure_resolved'] and not final['unresolved_infrastructure']

        rosters = {r: self.read('reviews/' + r + '/family-verdicts.json') for r in ROUNDS}
        subjects = {x['event_type']: x for x in rosters[ROUNDS[-1]]}
        assert len(subjects) == 299
        for r, rows in rosters.items():
            assert len(rows) == 299 and {x['event_type'] for x in rows} == set(subjects)
            assert all((x['lane'], x['dl_id'], x['commit']) ==
                       tuple(subjects[x['event_type']][k] for k in ('lane', 'dl_id', 'commit')) for x in rows)
            self.raw('reviews/' + r + '/REVIEW.md')

        executions = self.final('target-commands.json')
        assert len(executions) == 20 and len({x['name'] for x in executions}) == 20
        catalog = {}
        for x in executions:
            assert x['head'] == TARGET and x['accepted']
            log_name = FIX4 + 'evidence/' + Path(x['log']).name
            assert digest(self.raw(log_name)) == x['log_sha256'], x['name']
            assert x['exit_code'] == 0 or x['name'] == 'numbers-all-final'
            if x['name'] == 'numbers-all-final':
                assert x['exit_code'] == 1 and x['exact_review_failures']
                assert x['exact_13626_case_outcomes'] and x['exact_288_nodes'] and x['exact_owner_integrations']
            catalog[x['name']] = {'status': 'PASS', 'head': TARGET,
                'argv': x['argv'], 'raw_exit': x['exit_code'],
                'receipt': FIX4 + 'evidence/target-commands.json',
                'log': log_name, 'log_sha256': x['log_sha256'],
                'qualification': x.get('qualification')}

        chain = self.final('chain-exact-head.json')
        owners = self.final('owner-sweep-exact-head.json')
        citations = self.final('citation-editions-final.json')
        records = self.final('record-verification.json')
        derived = self.final('derivations-final.json')
        preservation = self.final('preservation-final.json')
        dispositions = self.final('dispositions-final.json')
        assert chain['input_revision'] == TARGET and chain['families'] == 299 and not chain['findings']
        assert {x['event_type'] for x in chain['records']} == set(subjects)
        assert owners['admitted_families'] == 299 and not owners['findings']
        assert owners['selected_sections'] == 1641 and len(owners['multi_scope_checks']) == 100
        assert citations['status'] == 'pass' and len(citations['pairs']) == 50 and not citations['failures']
        assert all(x['mixed_input_refused'] and not x['rederived_problems'] for x in citations['controls'])
        assert records['status'] == derived['status'] == preservation['status'] == dispositions['status'] == 'pass'
        assert records['head'] == TARGET and records['admissions'] == derived['checked'] == 299
        assert not records['errors'] and not derived['errors'] and not dispositions['errors']
        assert dispositions['checked'] == 191 and dispositions['original_registry_checkpoints_preserved']
        for path, report in [('scripts/pm-ea-record-chain.py', chain), ('scripts/pm-ea-owner-sweep.py', owners)]:
            assert digest(git('show', TARGET + ':' + path)) == report['script_sha256']
        registry = json.loads(git('show', TARGET + ':Plans/event_family_registry.json'))
        by_event = {x['event_type']: x for x in registry['families']}
        assert len(by_event) == 518 and set(subjects) <= set(by_event)
        assert digest(git('show', TARGET + ':Plans/event_family_registry.json')) == records['registry_sha256']

        # Shared qualification is explicit, including the raw timeout, not copied
        # as a clean raw pass into the family rows.
        landing = self.final('dry-landing.log')
        resolution = self.final('landing-timeout-resolution.json')
        assert landing['commit'] == TARGET and landing['blocking'] == 0
        assert resolution['head'] == TARGET and resolution['resolved'] and not resolution['unresolved_infrastructure']
        assert resolution['original_infrastructure'] == landing['infrastructure']
        assert resolution['diagnostic_counts'] == {'audit_closure_validator_error': 200, 'audit_closure_reopened_rows_present': 1}
        assert digest(self.raw(FIX4 + 'evidence/closure-rerun.json')) == resolution['rerun_report_sha256']
        catalog['full-dry-landing'] = {'status': 'PASS', 'coverage': 'shared_repository',
            'head': TARGET, 'raw_exit': 1, 'blocking': 0,
            'receipt': FIX4 + 'evidence/dry-landing.log',
            'qualification': 'One 600-second audit-closure timeout completed by a same-head 1800-second rerun; 201 existing/staleness diagnostics; raw aggregate failures retained.',
            'resolution': FIX4 + 'evidence/landing-timeout-resolution.json'}

        # Re-check global R0 corrections directly in the named Git edition.
        ignore = self.read('drafts/PNC019/merge2-fix2/gitignore-authority.json')
        assert not ignore['uncovered'] and ignore['line_count'] == 28 and ignore['named_path_count'] == 18
        assert digest(git('show', TARGET + ':.gitignore')) == ignore['gitignore_sha256']
        signed = Path(ignore['signed_answer']['path']).read_bytes()
        assert digest(signed) == ignore['signed_answer']['sha256']
        self.inputs['signed_ignore_answer'] = {'path': ignore['signed_answer']['path'], 'sha256': digest(signed)}
        decision = git('show', TARGET + ':Plans/Decision_Log.md').decode()
        unit = re.search(r'(?ms)^### DL-694\b.*?(?=^### |\Z)', decision).group()
        test = git('show', TARGET + ':tests/test_pm_ea_admission_mode.py')
        assert len(test) == 43391 and digest(test) == '640805557ca5bd62f49fe5b1776ca5f7eb1f572052670e272badc9acd153aa6e'
        assert 'Correction dated 2026-11-19' in unit and digest(test) in unit and '43,391 bytes' in unit
        catalog['ignore-authority'] = {'status': 'PASS', 'coverage': 'shared_repository', 'head': TARGET,
            'receipt': 'drafts/PNC019/merge2-fix2/gitignore-authority.json',
            'qualification': 'Signed E10-2 A and explicit FIX2 exception; all 28 lines / 18 leaves accounted for; current ignore bytes unchanged.'}
        catalog['DL694-delivered-pin'] = {'status': 'PASS', 'coverage': 'shared_repository', 'head': TARGET,
            'source': 'Plans/Decision_Log.md#DL-694', 'test_bytes': len(test), 'test_sha256': digest(test)}
        ff = self.final('fast-forward-final.json')
        assert ff['head'] == TARGET and ff['main_is_ancestor']
        assert subprocess.run(['git', 'merge-base', '--is-ancestor', ff['main'], TARGET]).returncode == 0
        catalog['main-fast-forward'] = {'status': 'PASS', 'coverage': 'shared_repository', 'head': TARGET,
            'fetched_main': ff['main'], 'receipt': FIX4 + 'evidence/fast-forward-final.json',
            'qualification': 'Pass at the requested FIX4 edition; delivery ancestry is checked separately against freshly fetched main.'}

        # Scope each numbered review finding from its own structured witnesses.
        findings = []
        def add(round_name, number, title, events, closes, commits, expected, outside=(), status='closed', note=None):
            events = sorted(set(events))
            assert len(events) == expected and set(events) <= set(subjects), (round_name, number, len(events), expected)
            assert all(x in catalog or x in ('dual-scope-binding', 'depth-12-cells') for x in closes)
            for commit in commits:
                assert subprocess.run(['git', 'merge-base', '--is-ancestor', commit, TARGET]).returncode == 0
            findings.append({'id': round_name + ':' + str(number), 'round': round_name, 'finding': number,
                'title': title, 'source': 'reviews/' + round_name + '/REVIEW.md',
                'affected_families': events, 'affected_count': len(events), 'outside_cohort_events': list(outside),
                'status': status, 'closed_by_checks': closes if status == 'closed' else [],
                'fix_commits': commits if status == 'closed' else [], 'note': note})

        all_events = set(subjects)
        browser = {e for e, x in subjects.items() if x['lane'] == 'S4B'}
        astra = ROUNDS[0]
        active = self.review(astra, 'active-owners.json')['rows']
        excerpts = self.review(astra, 'excerpt-final.json')['rows']
        bare = self.review(astra, 'bare-lines.json')['cases']
        mixed = {e for e, x in excerpts.items() if x['kind'] == 'admission' and x['mismatches']} | {x['event'] for x in bare}
        memory = {x['event'] for x in self.review(astra, 'owner-dispatch.json')['deltas']}
        revisions = [x['event_type'] for x in records['revisions']]
        revision_bad = [e for e, x in excerpts.items() if x['kind'] == 'revision' and x['mismatches']]
        add(astra, 1, '130 active registration contradictions', active, ['owner-sweep-final'], ['ca51e78d48','d3f3137a34'],130)
        add(astra, 2, '51 Browser schema violations', browser, ['browser-whole-final','browser-preservation-final'], ['0f2a90ece5'],51)
        add(astra, 3, 'Mixed evidence editions and excerpt digests', mixed, ['records-final','citation-editions-final'], ['2bda6aeed0','d3f3137a34'],27,revision_bad)
        add(astra, 4, 'Protected ignore authorization', all_events, ['ignore-authority'], ['3236ac2f18'],299)
        add(astra, 5, 'Four Card 1b role mappings', memory, ['derivations-final','records-final','admission-mode-final'], ['0f2a90ece5'],4)
        add(astra, 6, '102 Browser landing blockers', browser, ['browser-whole-final','full-dry-landing'], ['0f2a90ece5'],51)
        tool_note = 'Unresolved non-REAL fixture/preservation tool issue concerns already registered S5b predecessors/successors, not one of the 299 new admissions. Raw known refusal remains disclosed; no family finding is marked closed by this exception.'
        add(astra, 7, 'T260 Goal same-run negative-control fixture', [], [], [],0,['goal_run.replanned'],'open',tool_note)
        add(astra, 8, 'T262 legacy registry-prefix tool check', [], [], [],0,revisions,'open',tool_note)
        sol = ROUNDS[1]
        add(sol, 1, 'Protected ignore authorization', all_events, ['ignore-authority'], ['3236ac2f18'],299)
        add(sol, 2, 'DL-694 delivered test-byte pin', all_events, ['DL694-delivered-pin'], ['ea68abacca'],299)
        add(sol, 3, '51 Browser writer/schema violations', browser, ['browser-whole-final','browser-preservation-final'], ['0f2a90ece5'],51)
        add(sol, 4, 'T261 Goal same-run negative-control fixture', [], [], [],0,['goal_run.replanned'],'open',tool_note)
        add(sol, 5, 'T262 historical preservation tool check', [], [], [],0,revisions,'open',tool_note)
        r1 = ROUNDS[2]
        pending25 = self.review(r1, 'owner-retention-findings.json')['events']
        cpu191 = {x['event_type'] for x in rosters[r1] if 'Finding 2.' in x['reason']}
        add(r1, 1, '25 pending owner retention contracts', pending25, ['owner-sweep-final','dual-scope-binding'], ['2bda6aeed0','ca51e78d48'],25)
        add(r1, 2, '191 stale disposition assessments and spans', cpu191, ['dispositions-final','records-final'], ['dfea17a6c4','d3f3137a34'],191)
        add(r1, 3, 'Fetched main omitted', all_events, ['main-fast-forward','preservation-final'], ['7cad2205a4'],299)
        blocking = self.review(ROUNDS[4], 'blocking-findings.json')
        do25 = set(blocking['bad_DO_source'])
        wrong24 = set(blocking['new_wrong_retention'])
        extra32 = set(blocking['additional_pending_owners'])
        for r in [ROUNDS[3], ROUNDS[4]]:
            add(r, 1, '25 DO historical source editions / T263', do25, ['citation-editions-final','records-final'], ['2bda6aeed0','d3f3137a34'],25)
            add(r, 2, '24 stored-value decisions misattributed to event history', wrong24, ['owner-sweep-final','dual-scope-binding'], ['2bda6aeed0','ca51e78d48'],24)
        add(ROUNDS[3], 3, 'Usage CV-614 separate original and backup retention', ['usage.event'], ['owner-sweep-final','usage-companion-final','records-final'], ['2bda6aeed0'],1)
        add(ROUNDS[4], 3, '32 additional pending selected owners', extra32, ['owner-sweep-final'], ['2bda6aeed0','ca51e78d48'],32)
        add(ROUNDS[4], 4, 'Two Goal Project v3 owner selectors', [], ['owner-sweep-final','records-final'], ['2bda6aeed0'],0,list(blocking['s5b_owner_selectors']))
        add(ROUNDS[4], 'T260/T261', 'Tracked Goal adapter fixture', [], [], [],0,['goal_run.replanned'],'open',tool_note)
        scope = self.review(ROUNDS[-1], 'scope-conflicts.json')
        fences = self.review(ROUNDS[-1], 'remaining-live-fences.json')
        add(ROUNDS[-1], 1, '299 predecessor assessment Git-pin mismatches / T267', all_events, ['record-chain-final'], ['d3f3137a34'],299)
        add(ROUNDS[-1], 2, '14 dual-scope families / 16 owner clauses / T268', [x['event_type'] for x in scope['observed']], ['dual-scope-binding','owner-sweep-final'], ['ca51e78d48'],14)
        add(ROUNDS[-1], 3, '47 families with live owner fences / omitted graded roles / T269', [x['event_type'] for x in fences['known_cases']], ['owner-sweep-final'], ['ca51e78d48'],47)
        assert len(findings) == 27

        # Every historical HOLD must have a mapped, now-closed family finding.
        history = {r: {x['event_type']: x for x in rows} for r, rows in rosters.items()}
        for r, rows in rosters.items():
            for x in rows:
                if x['verdict'] == 'HOLD':
                    assert any(f['round'] == r and x['event_type'] in f['affected_families'] for f in findings), (r,x['event_type'])

        scope_map = {x['event_type']: x for x in owners['multi_scope_checks']}
        owner_map = collections.defaultdict(list)
        for x in owners['owners']:
            owner_map[x['event_type']].append(x)
        pair_map = collections.defaultdict(list)
        for i,x in enumerate(citations['pairs']):
            pair_map[x['event_type']].append(i)
        chain_map = {x['event_type']: x for x in chain['records']}
        rows=[]
        for event, subject in sorted(subjects.items()):
            row = by_event[event]
            assess_path = 'reports/event-authority-20261116/admission-merge-2/depth/' + event + '.json'
            assess_raw = git('show', TARGET + ':' + assess_path)
            assess = json.loads(assess_raw)
            assert len(assess['rows']) == 1 and assess['rows'][0]['event_type'] == event
            cells = assess['rows'][0]['cells']
            assert len(cells) == 12
            assessment_pins=[x for x in chain_map[event]['pins'] if x['pin']=='current_assessment']
            assert len(assessment_pins)==1 and assessment_pins[0]['actual']==digest(assess_raw)
            assert all(p['claimed']==p['actual'] for p in chain_map[event]['pins'])
            checks={k:{'status':v['status'], 'coverage':'shared_repository', 'receipt_id':k} for k,v in catalog.items()}
            for k in ('record-chain-final','owner-sweep-final','derivations-final','records-final'):
                checks[k]['coverage']='every_family_individually'
            checks['record-chain-final']['pins_checked']=len(chain_map[event]['pins'])
            checks['owner-sweep-final']['sections']=owner_map[event]
            assert owner_map[event],event
            is_do=event in do25
            checks['citation-editions-final'].update(coverage='family_specific' if is_do else 'not_applicable',pair_indices=pair_map[event],reason=None if is_do else 'No DO paired historical/current citation obligation for this family.')
            if is_do:assert len(pair_map[event])==2
            scopes=[x['scope_kind'] for x in (row.get('payload_versions') or [])]
            multi=len(set(scopes))>1
            assert multi==(event in scope_map),(event,scopes)
            scope_result=scope_map.get(event)
            ok=all(x['decision_binding_matches'] for x in scope_result['editions']) if multi else True
            checks['dual-scope-binding']={'status':'PASS' if ok else 'FAIL','coverage':'family_specific' if multi else 'not_applicable','scopes':scopes,'proof':scope_result,'reason':None if multi else 'The family has no multi-scope payload selector.'}
            checks['depth-12-cells']={'status':'PASS' if all(x['status']=='PASS' for x in cells.values()) else 'FAIL','coverage':'family_specific','assessment':assess_path,'assessment_sha256':digest(assess_raw),'cells':{k:v['status'] for k,v in cells.items()}}
            applicable=[{'finding_id':f['id'],'status':f['status'],'closed_by_checks':f['closed_by_checks'],'fix_commits':f['fix_commits']} for f in findings if event in f['affected_families']]
            rows.append({'event_type':event,'lane':subject['lane'],'dl_id':subject['dl_id'],'original_append_commit':subject['commit'],'classification':classify(checks,applicable),'checks':checks,'review_findings':applicable,'review_history':[{'round':r,'verdict':history[r][event]['verdict'],'reason':history[r][event]['reason'],'source_index':next(i for i,x in enumerate(rosters[r]) if x['event_type']==event)} for r in ROUNDS]})

        # Every reused FIX4 file must be pinned by its already-published manifest.
        for name,raw in self.cache.items():
            if name.startswith(FIX4) and name not in (FIX4+'FINAL.json',FIX4+'SHA256SUMS'):
                assert digest(raw)==manifest[name[len(FIX4):]],name
        counts=collections.Counter(x['classification'] for x in rows)
        by_lane={}
        for lane in sorted({x['lane'] for x in rows}):
            group=[x for x in rows if x['lane']==lane]
            by_lane[lane]={k:sum(x['classification']==k for x in group) for k in ('LAND','MERGE3')}
        # Current task authorizes removing only actual MERGE3 admissions. This
        # census preserves all admissions when that set is empty.
        return {'schema_id':'pm.event_authority.merge2_census.v1','target_commit':TARGET,
            'target_tree':git('rev-parse',TARGET+'^{tree}').decode().strip(),
            'landing_head':TARGET,'evidence_root':str(self.evidence),
            'qualification':'PASS is an accepted check outcome, not necessarily raw exit 0. Shared repository checks and inapplicable family-specific obligations are labeled explicitly. No new semantic re-grade or independent review is claimed.',
            'counts':{'families':len(rows),'LAND':counts['LAND'],'MERGE3':counts['MERGE3']},
            'by_lane':by_lane,'check_catalog':catalog,'review_findings':findings,
            'outside_cohort_open_findings':[f['id'] for f in findings if f['status']=='open' and not f['affected_families']],
            'MERGE3':[x['event_type'] for x in rows if x['classification']=='MERGE3'],
            'inputs':dict(sorted(self.inputs.items())),'families':rows}


def markdown(c):
    lines=['# Merge-2 family census','', 'Landing head: '+c['landing_head'], '',
           str(c['counts']['LAND'])+' LAND; '+str(c['counts']['MERGE3'])+' MERGE3, across 299 families.', '',
           '| Lane | LAND | MERGE3 |','|---|---:|---:|']
    for lane,counts in c['by_lane'].items():lines.append('| '+lane+' | '+str(counts['LAND'])+' | '+str(counts['MERGE3'])+' |')
    lines += ['', 'Every family row includes all 20 final FIX1–4 execution outcomes, the dual-scope obligation, all twelve depth cells, global ignore/DL-694/current-main checks, and the qualified full dry landing. Shared checks and non-applicable obligations are identified. The six original review verdicts and every applicable numbered finding are retained. Closure names exact committed checks and ancestor fix commits.', '',
      'All applicable family findings are closed by the recorded checks. No independent post-FIX4 review is claimed. The unresolved Goal adapter and legacy-prefix tool findings concern the eight pre-existing S5b successors outside this 299-family cohort; they remain explicitly open in the separate finding register. The complete Browser historical-preservation checks pass. Native execution remains NOT_RUN.', '',
      'Numeric raw exit 1 retains exactly the 35 approved T215 diagnostics. The full dry landing at the landing head returned raw 1 with zero blockers and one audit-closure timeout, completed by a same-head standalone rerun with an 1800-second limit. Its 201 existing/staleness diagnostics match the completed audit copy; no infrastructure result remains unresolved. Governance/migration staleness still requires the separately assigned post-landing refresh/reseal.', '',
      'The assessed admission content is unchanged when MERGE3 is empty. A separate DELIVERY.json pins the final delivery/landing head and any subsequent current-main integration. The census branch adds only this reproducible census, its compact reports and its committed checker; no admission, record or Decision Log byte is removed or changed.', '',
      'CENSUS.json contains exact evidence paths and SHA-256 pins, per-family check applicability, review closure links and the empty or non-empty MERGE3 set.']
    return '\n'.join(lines)+'\n'


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--evidence-root',type=Path,required=True)
    p.add_argument('--write',action='store_true')
    p.add_argument('--external-output',type=Path)
    p.add_argument('--self-test',action='store_true')
    a=p.parse_args()
    changed=set(git('diff','--name-only',TARGET).decode().splitlines())
    imported=[]
    for name in changed:
        if name==SCRIPT or name.startswith(OUTPUT+'/'):
            continue
        # Only the independently fetched Concept integration may accompany the
        # census. Never excuse an arbitrary changed admission/owner path.
        assert name.startswith('Concepts/'),name
        assert git('show','HEAD:'+name)==git('show','origin/main:'+name),name
        imported.append(name)
    census=Census(a.evidence_root).build()
    if a.self_test:
        assert classify({'proof':{'status':'PASS'}},[])=='LAND'
        assert classify({'proof':{'status':'FAIL'}},[])=='MERGE3'
        assert classify({'proof':{'status':'PASS'}},[{'status':'open'}])=='MERGE3'
        assert len({x['event_type'] for x in census['families']})==299
    raw=json.dumps(census,indent=2,sort_keys=True)+'\n';md=markdown(census)
    output=Path(OUTPUT)
    if a.write:
        output.mkdir(parents=True,exist_ok=True)
        (output/'CENSUS.json').write_text(raw)
        (output/'CENSUS.md').write_text(md)
    else:
        assert (output/'CENSUS.json').read_text()==raw,'Census JSON differs from reproduction'
        assert (output/'CENSUS.md').read_text()==md,'Census Markdown differs from reproduction'
    if a.external_output:
        a.external_output.mkdir(parents=True,exist_ok=True)
        (a.external_output/'CENSUS.json').write_text(raw)
        (a.external_output/'CENSUS.md').write_text(md)
    assert not census['MERGE3'], 'Nonempty MERGE3 requires a separately proved reduced landing head.'
    print(json.dumps({'status':'pass','target':TARGET,'counts':census['counts'],'by_lane':census['by_lane'],'census_sha256':digest(raw.encode()),'removed_admissions':[],'removed_set_equals_MERGE3':True,'admission_owner_and_decision_bytes_unchanged':True,'main_only_concept_paths':sorted(imported)},sort_keys=True))


if __name__=='__main__':
    main()
