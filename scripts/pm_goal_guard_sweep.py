#!/usr/bin/env python3
"""PNC019 Goal sweep: full checker witnesses and gated Method B table receipts.

No private guard-removal result is credited. The adapter mirrors W3's pure
observation boundary; its provenance is recorded separately from tool credit.
Extensions register another case source; no family-name special case exists
in the isolation or mutation judge. Native execution remains NOT_RUN.
"""
import argparse
import base64
import contextlib
import copy
import gzip
import hashlib
import importlib
import io
import inspect
import json
from pathlib import Path
import pickle
import sys
import time

import pm_goal_guard_tables as tables
import pm_guard_isolation as g

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = None


_FUNCTION_CONTEXTS = {}


def digest(value):
    # Pure frozen codec functions are immutable checker context. Their pickle
    # module aliases depend on import order; bind their actual source instead.
    if isinstance(value,dict)and set(value)=={'args','kwargs'}:
        def context(item):
            if not inspect.isfunction(item):return item
            if item.__closure__ or item.__defaults__ or item.__kwdefaults__:
                raise ValueError('callable context needs an explicit state binding')
            if item not in _FUNCTION_CONTEXTS:
                path=Path(item.__code__.co_filename)
                if not path.is_file():raise ValueError('callable context has no source file')
                _FUNCTION_CONTEXTS[item]=dict(frozen_callable_source_sha256=hashlib.sha256(path.read_bytes()).hexdigest(),
                    function=item.__qualname__,line=item.__code__.co_firstlineno)
            return _FUNCTION_CONTEXTS[item]
        args=[context(item)for item in value['args']]
        kwargs={key:context(item)for key,item in value['kwargs'].items()}
        if any(a is not b for a,b in zip(args,value['args']))or any(kwargs[k]is not v for k,v in value['kwargs'].items()):
            def typed(item):
                if isinstance(item,dict):
                    return ('dict',tuple((typed(key),typed(item[key]))for key in sorted(item,key=lambda key:(type(key).__name__,repr(key)))))
                if isinstance(item,(list,tuple)):return (type(item).__name__,tuple(typed(x)for x in item))
                if isinstance(item,(set,frozenset)):
                    return (type(item).__name__,sorted((typed(x)for x in item),key=lambda x:json.dumps(x,ensure_ascii=True,separators=(',',':'))))
                if isinstance(item,str):return ('str',item)
                if isinstance(item,bytes):return ('bytes',item.hex())
                if item is None:return ('none',)
                if type(item)is bool:return ('bool',item)
                if type(item)is int:return ('int',hex(item))
                if type(item)is float:return ('float',item.hex())
                raise TypeError('unsupported frozen context type: '+type(item).__name__)
            # JSON has value semantics: pickle memo identity must not make a
            # source-bound witness depend on import-time string interning.
            return hashlib.sha256(json.dumps(typed(dict(args=args,kwargs=kwargs)),ensure_ascii=True,separators=(',',':')).encode()).hexdigest()
    return hashlib.sha256(pickle.dumps(value, protocol=5)).hexdigest()


class Collector:
    def __init__(self):
        self.checkpoint_path = OUTPUT
        self.active = None
        self.family_scope = None
        self.rows = {}
        self.calls = 0
        self.failures = []
        self.candidates = {}
        self.snapshots = {}
        self.schema_seeds = {}
        self.proof_providers = []
        self.store_snapshots = []

    def checkpoint(self):
        if OUTPUT is None:return
        OUTPUT.mkdir(parents=True,exist_ok=True)
        (OUTPUT/'partial-collection.json').write_text(json.dumps(dict(calls=self.calls,failures=self.failures,
            rows={name:{**slot,'sites':sorted(slot['sites'])} for name,slot in self.rows.items()}),indent=1)+'\n')

    def schema_seed(self, validator, value, prefix):
        key = (digest(validator.schema),value.get('schema_version') if isinstance(value,dict) else None)
        slot = self.schema_seeds.setdefault(key, [])
        if len(slot) < 64 and all(digest(v[1]) != digest(value) for v in slot):
            slot.append((validator, copy.deepcopy(value), prefix))

    def fuzz_schemas(self):
        """One JSON-location defect in a real, accepted schema boundary input.

        These are extra witness sources, not fabricated table booleans. Each
        candidate runs the full retained owner schema and earns credit only
        when the complete boundary has one first refusal.
        """
        import pm_goal_oracle_common as common
        def leaves(value, path=()):
            yield path, value
            if isinstance(value, dict):
                for key, child in value.items():
                    yield from leaves(child, path+(key,))
            elif isinstance(value, list):
                for key, child in enumerate(value):
                    yield from leaves(child, path+(key,))
        seeds = [seed for group in self.schema_seeds.values() for seed in group]
        for index, (validator, base, prefix) in enumerate(seeds):
            def evaluate(value, v=validator, p=prefix):
                gate = common.Gates()
                gate.schema(v, value, p)
                return gate.errors
            self.invoke(f'schema-witness/{index}/base', evaluate, base, True)
            for path, original in list(leaves(base)):
                alternatives = [None, False, 0, 1.5, '', 'foreign', [], {}]
                if isinstance(original, str):
                    alternatives += [original+'\n', '?' * max(1,len(original)), '2026-02-30T12:00:00Z']
                if isinstance(original, (int, float)) and not isinstance(original, bool):
                    alternatives += [-1, 0, 1.0, (1<<64)]
                if isinstance(original, list) and original:
                    alternatives += [[original[0], original[0]]]
                edits = [('replace', value) for value in alternatives]
                if path:
                    edits.append(('remove', None))
                for number, (op, replacement) in enumerate(edits):
                    changed = copy.deepcopy(base)
                    if path:
                        parent = changed
                        for part in path[:-1]:
                            parent = parent[part]
                        if op == 'remove':
                            del parent[path[-1]]
                        else:
                            parent[path[-1]] = replacement
                    else:
                        changed = replacement
                    # Preflight is witness selection, never checker/proof credit.
                    # Only replay full inputs that can expose an as-yet unproved
                    # declared assertion; this avoids repeating thousands of
                    # identical masks from equivalent retained schema sites.
                    errors = list(validator.iter_errors(changed))
                    def ids(error):
                        if hasattr(error,'oracle_guard'):
                            yield error.oracle_guard
                        for child in error.context:
                            yield from ids(child)
                    potential = {name for error in errors for name in ids(error)}
                    needed = set(self.rows)-set(self.candidates)
                    if len(potential) <= 4 and potential & needed:
                        self.invoke(f'schema-witness/{index}/{path!r}/{number}', evaluate, changed)

    def targeted_schema_witnesses(self):
        import pm_goal_oracle_common as common
        target='schema/4b9f9e20581832ca/type'
        if target not in self.rows or target in self.candidates:
            return
        def paths(value,path=()):
            if isinstance(value,dict):
                for key,child in value.items():
                    if key in ('status_before','status_after'):
                        yield path+(key,)
                    yield from paths(child,path+(key,))
            elif isinstance(value,list):
                for key,child in enumerate(value):
                    yield from paths(child,path+(key,))
        for seeds in list(self.schema_seeds.values()):
            for validator,base,prefix in seeds:
                for path in paths(base):
                    changed=copy.deepcopy(base);parent=changed
                    for key in path[:-1]:parent=parent[key]
                    parent[path[-1]]=False
                    def check(value,v=validator,p=prefix):
                        gate=common.Gates();gate.schema(v,value,p);return gate.errors
                    self.invoke('schema-single-defect/progressed-status/'+repr(path),check,changed,False)
                    if target in self.candidates:return

    def observe(self, name, holds, site):
        row = self.rows.setdefault(name, dict(sites=set(), controls=[], negatives=[], later=[]))
        row['sites'].add(tuple(site))
        scopes=row.setdefault('family_scopes',[])
        if self.family_scope and self.family_scope not in scopes:scopes.append(self.family_scope)
        if self.active is not None:
            self.active.append((name, holds))

    def invoke(self, label, evaluate, value, valid=None):
        before = digest(value)
        previous = self.active
        self.active = []
        try:
            result = evaluate(copy.deepcopy(value))
            errors = set(result['errors'] if isinstance(result, dict) else result)
            observed = self.active
        except Exception as exc:
            self.failures.append(dict(case=label, kind='exception', exception=type(exc).__name__, detail=str(exc)[:300]))
            return dict(errors=['UNEXPECTED_EXCEPTION'])
        finally:
            self.active = previous
        self.calls += 1
        if isinstance(result, dict) and 'store_snapshot_sha256' in result:
            self.store_snapshots.append(dict(case=label, before=result['store_snapshot_sha256'],
                                             after=result['store_after_sha256'], input_sha256=before,
                                             snapshot_pickle_base64=base64.b64encode(pickle.dumps(value['store'],protocol=5)).decode()))
        if self.calls % 1000 == 0:
            print(f'complete calls {self.calls}; rows {len(self.rows)}; isolated {len(self.candidates)}',
                  file=sys.stderr, flush=True)
        if digest(value) != before:
            self.failures.append(dict(case=label, kind='fixture_mutation'))
        if valid is not None and bool(errors) == valid:
            self.failures.append(dict(case=label, kind='expectation', valid=valid, errors=sorted(errors)))
        first = next((name for name, holds in observed if not holds), None)
        # A negative must have exactly one refusing row on the complete path.
        # Multi-row errors remain tests but earn no single-defect proof credit.
        one = len(errors) == 1 and first in errors
        merged = {}
        for name, holds in observed:
            merged[name] = merged.get(name, True) and holds
        for name, holds in merged.items():
            slot = self.rows[name]
            if not errors and holds and len(slot['controls']) < 2:
                slot['controls'].append(dict(source=label, input_sha256=before))
            elif not holds and one and name == first and len(slot['negatives']) < 2:
                slot['negatives'].append(dict(source=label, input_sha256=before, expected=name))
                self.candidates.setdefault(name, (evaluate, copy.deepcopy(value), label))
                self.snapshots.setdefault(name, copy.deepcopy(value))
            elif not holds and len(slot['later']) < 2:
                slot['later'].append(dict(source=label, errors=sorted(errors), first=first))
        return result

    def audit(self, audit):
        # Register schema sites before adding the authored per-type witnesses.
        for _, evaluate, value, valid, _ in list(audit.cases):
            if valid:
                self.invoke('schema-registration', lambda x, e=evaluate: e(x, set()), value)
        import pm_goal_oracle_common as common
        fixtures = common.load(ROOT / 'Plans/goal_oracle_schema_type_fixtures.json').get('suites', {}).get(audit.suite, {})
        for case in fixtures.get('cases', []):
            site = next((v for (_, prefix), v in common._SCHEMA_SITES.items() if prefix == case['site']), None)
            if site is None:
                self.failures.append(dict(kind='unknown_schema_site', site=case['site']))
                continue
            baseline = fixtures['bases'][case['base_id']]
            value = common.materialize_cases([
                dict(id='base', valid=True, input=baseline),
                dict(id=case['id'], base_id='base', valid=False, changes=case['changes'])])[1]['input']
            def schema(value, disabled, v=site, prefix=case['site']):
                gate = common.Gates(disabled)
                gate.schema(v, value, prefix)
                return gate.errors
            audit.case(case['id'], schema, value, False, base=baseline)
        start = len(self.failures)
        for name, evaluate, value, valid, base in audit.cases:
            self.invoke(audit.suite + '/' + name, lambda x, e=evaluate: e(x, set()), value, valid)
        failures = audit.failures + self.failures[start:]
        return dict(status='fail' if failures else 'pass', cases=len(audit.cases),
                    negatives=sum(not c[3] for c in audit.cases), failures=failures,
                    guard_removal=[], schema_type_inventory={}, native_execution='NOT_RUN')


def collect(sources, *, fuzz=True):
    tables.ACTIVE = True
    collector = Collector()
    tables.COLLECTOR = collector
    try:
        for source in sources:
            module = importlib.import_module(source)
            before=collector.calls
            entry=getattr(module,'main',None)or getattr(module,'run')
            with contextlib.redirect_stdout(io.StringIO()) as captured:
                code=entry([])if 'argv'in inspect.signature(entry).parameters else entry()
            provider=getattr(module,'earlier_clause_proof',None)
            if provider is not None:collector.proof_providers.append(provider)
            if collector.calls==before:
                collector.failures.append(dict(kind='source_registered_no_complete_calls',source=source))
            if code:
                collector.failures.append(dict(kind='source_failed', source=source, exit=code, details=captured.getvalue()[-16000:]))
            collector.checkpoint()
            print(f'source {source}: calls={collector.calls} rows={len(collector.rows)} failures={len(collector.failures)}',
                  file=sys.stderr, flush=True)
        import pm_goal_oracle_common as common
        collector.targeted_schema_witnesses()
        # Receipt v1/v2 use their complete retained owner schemas. These
        # additional one-value fixtures cover the type declarations absent
        # from ATS-211's payload-oriented authored bank.
        receipt_editions=set()
        for seeds in list(collector.schema_seeds.values()):
            for validator,base,prefix in seeds:
                if 'event_append_receipt_contracts' not in repr(validator.schema):continue
                edition=(digest(validator.schema),base.get('schema_version') if isinstance(base,dict) else None)
                if edition in receipt_editions:continue
                receipt_editions.add(edition)
                def leafpaths(value,path=()):
                    yield path,value
                    if isinstance(value,dict):
                        for key,child in value.items():yield from leafpaths(child,path+(key,))
                    elif isinstance(value,list):
                        for key,child in enumerate(value):yield from leafpaths(child,path+(key,))
                def receipt_shape(value,v=validator,p=prefix):
                    gate=common.Gates();gate.schema(v,value,p);return gate.errors
                for path,original in leafpaths(base):
                    for number,replacement in enumerate((None,False,0,1.5,[],{})):
                        changed=copy.deepcopy(base)
                        if path:
                            parent=changed
                            for key in path[:-1]:parent=parent[key]
                            parent[path[-1]]=replacement
                        else:changed=replacement
                        collector.invoke('receipt-schema-single-defect/'+prefix+'/'+repr(path)+'/'+str(number),receipt_shape,changed)
        # Re-observe real accepted owner-schema inputs after discovering its
        # refusal names; a positive is never fabricated from a negative mask.
        import pm_goal_oracle_common as common
        for index, seeds in enumerate(collector.schema_seeds.values()):
            for number,(validator,value,prefix) in enumerate(seeds):
                def control(value,v=validator,p=prefix):
                    gate=common.Gates();gate.schema(v,value,p);return gate.errors
                collector.invoke(f'schema-control/{index}/{number}',control,value,True)
        if fuzz:
            collector.fuzz_schemas()
    finally:
        tables.COLLECTOR = None
    return collector


def generate(collector, *, replace=False):
    """Deterministically generate checked-in table code, never generated evidence."""
    path = ROOT / 'scripts/pm_goal_guard_rows.json'
    mapping = json.loads(path.read_text()) if path.exists() and not replace else {}
    names = sorted(collector.rows)
    # One row per table keeps independent helper/refusal boundaries explicit.
    # Eight is a maximum, not a minimum. No row borrows a different guard's cut.
    for name in names:
        table = hashlib.sha256(name.encode()).hexdigest()[:16]
        path = ROOT / f'scripts/{tables.PREFIX}{table}.py'
        path.write_text('"""Goal named predicate observation; generated by pm_goal_guard_sweep.py --generate."""\n'
            'import pm_guard_isolation as g\n\n'
            'def predicate(value, context):\n'
            f'    return {name!r} if value[{name!r}] is not True else None\n\n'
            'def case(value):\n'
            '    context = None\n'
            '    table = g.GuardTable([\n'
            f'        g.Guard({name!r}, g.Invariant({("/"+name)!r}, "complete checker predicate holds"), {name!r}, predicate),\n'
            '    ])\n'
            '    def check(value):\n'
            f'        table.require({name!r}, value, context)\n'
            '        return True\n'
            '    return g.Case(table, check, context)\n')
        def site_location(site):
            path=Path(site[0])
            return (str(path.relative_to(ROOT))if path.is_absolute()and path.is_relative_to(ROOT)else site[0],site[1])
        mapping[name] = dict(table=table, sites=sorted(site_location(site)for site in collector.rows[name]['sites']))
    (ROOT / 'scripts/pm_goal_guard_rows.json').write_text(json.dumps(mapping, indent=2, sort_keys=True)+'\n')
    path = ROOT / 'scripts/pm_goal_guard_witnesses.json'
    witnesses = json.loads(path.read_text()) if path.exists() and not replace else {}
    for name, (_, value, label) in collector.candidates.items():
        witnesses[name] = dict(expected_refusal=name, source=label, input_sha256=digest(value))
    path.write_text(json.dumps(witnesses,indent=2,sort_keys=True)+'\n')
    if replace:
        keep = {tables.PREFIX+row['table'] for row in mapping.values()}
        for path in (ROOT/'scripts').glob(tables.PREFIX+'*.py'):
            if path.stem not in keep and 'generated by pm_goal_guard_sweep.py' in path.read_text().splitlines()[0]:
                path.unlink()


def prove(collector, out, only=None):
    reports = []
    out.mkdir(parents=True, exist_ok=True)
    for name in sorted(collector.rows):
        spec = tables.rows()[name]
        if only and spec['table'] not in only:
            continue
        slot = collector.rows.get(name, {})
        entry = dict(guard=name, table=spec['table'], controls=slot.get('controls', []),
                     negatives=slot.get('negatives', []), sites=slot.get('sites', []),family_scopes=slot.get('family_scopes',[]))
        if entry['controls'] and entry['negatives']:
            module = importlib.import_module(tables.PREFIX + spec['table'])
            path = f'scripts/{tables.PREFIX}{spec["table"]}.py'
            controls = [g.Control('control', {name: True}, 'synthetic')]
            negatives = [g.Negative('negative', {name: False}, name, name, 'control',
                'Complete checker first-refusal single-row witness: '+entry['negatives'][0]['source'])]
            suite = g.Suite('Goal '+name, module.case, controls, negatives, (path,), ROOT,
                non_guards=[g.NonGuard(path, 'case', 'return', 'return g.Case(table, check, context)',
                    'Fresh engine Case construction; no acceptance/refusal decision.')])
            report = g.run(suite)
            filename = spec['table'] + '.json.gz'
            with gzip.open(out / filename, 'wt') as handle:
                json.dump(report, handle, sort_keys=True)
            entry.update(status=report['status'], proved=sum(r['proved'] for r in report.get('rows', [])),
                         failures=report.get('failures', []), report=filename)
        else:
            entry.update(status='UNPROVED', proved=0, later=slot.get('later', []))
        reports.append(entry)
        if len(reports) % 25 == 0:
            print(f'tables {len(reports)} proved {sum(x["proved"] for x in reports)}', flush=True)
        (out / 'summary.json').write_text(json.dumps(reports, indent=1, default=list)+'\n')
    for entry in reports:
        if entry['status']=='UNPROVED':
            proof=dominance_proof(entry['guard'],reports)
            for provider in collector.proof_providers:
                if proof:break
                candidate=provider(entry['guard'],reports)
                if candidate:
                    earlier=candidate.get('earlier_guards',[])
                    if not earlier or any(not any(row['guard']==name and row['status']=='PASS'for row in reports)for name in earlier):
                        raise ValueError('earlier-clause proof lacks a proved dependency: '+entry['guard'])
                    proof=candidate
            if proof:entry['proof']=proof
    (out/'summary.json').write_text(json.dumps(reports,indent=1,default=list)+'\n')
    return reports


def dominance_proof(name,reports):
    """Verify the three nullable branch declarations' earlier union, not a sample mask."""
    import pm_goal_oracle_common as c
    location=c._SCHEMA_LOCATIONS.get(name,'')
    doc=c.load(ROOT/'Plans/event_record.schema.json')
    receipt=c.load(ROOT/'Plans/event_append_receipt_contracts.schema.json')
    selectors=[receipt['$id']+'/$defs/'+name+'/type' for name in ('custody_v1_reader','custody_v2')]
    if location in selectors:
        branches=receipt['$defs']['custody_reader']['oneOf']
        if {x.get('$ref') for x in branches}!={'#/$defs/custody_v1_reader','#/$defs/custody_v2'}:return None
        if any(receipt['$defs'][ref['$ref'].split('/')[-1]].get('type')!='object' for ref in branches):return None
        parent=c.guard_for_location(receipt['$id']+'/$defs/custody_reader/oneOf')
        if not any(r['guard']==parent and r['status']=='PASS' for r in reports):return None
        return dict(kind='earlier_owner_edition_union',earlier_guard=parent,
            owner='Plans/event_append_receipt_contracts.schema.json#/$defs/custody_reader',
            owner_sha256=hashlib.sha256((ROOT/'Plans/event_append_receipt_contracts.schema.json').read_bytes()).hexdigest(),
            checker='scripts/pm_goal_oracle_common.py:schema_guards',
            proof='Both supported editions require an object. On a non-object both branch types fail and schema_guards reports the complete oneOf before branch attribution. On an object both root type predicates hold. Therefore neither edition root type can refuse first; the earlier edition-union predicate is separately proved.')
    prefix=doc['$id']+'/'
    if not location.startswith(prefix) or '/anyOf/' not in location or not location.endswith('/type'):
        return None
    node_location=location.rsplit('/anyOf/',1)[0]
    pointer=node_location[len(doc['$id']):]
    node=doc
    for key in pointer.strip('/').split('/'):
        node=node[key.replace('~1','/').replace('~0','~')]
    if not isinstance(node.get('anyOf'),list) or len(node['anyOf'])!=2:
        return None
    def branch_type(branch):
        if '$ref' in branch:
            target=doc
            for key in branch['$ref'].removeprefix('#/').split('/'):
                target=target[key]
            return target.get('type')
        return branch.get('type')
    if {branch_type(x) for x in node['anyOf']} not in ({'integer','null'},{'string','null'}):
        return None
    parent=c.guard_for_location(node_location+'/anyOf')
    earlier=next((r for r in reports if r['guard']==parent),None)
    if earlier is None or earlier['status']!='PASS':return None
    source=ROOT/'scripts/pm_goal_oracle_common.py'
    line=next(i for i,x in enumerate(source.read_text().splitlines(),1) if 'if union_errors:' in x)
    return dict(kind='earlier_owner_union',earlier_guard=parent,
        owner='Plans/event_record.schema.json#'+pointer,owner_sha256=hashlib.sha256((ROOT/'Plans/event_record.schema.json').read_bytes()).hexdigest(),
        checker='scripts/pm_goal_oracle_common.py:'+str(line),
        proof='The branch declaration selects one nullable alternative. A valid other alternative accepts without a refusal. If the complete union fails, schema_guards returns the parent anyOf refusal before branch attribution. Thus this branch row can never refuse first; the parent row is separately proved.')


def exact_refusal(evaluate,value,expected):
    try:
        result=evaluate(copy.deepcopy(value))
        errors=set(result['errors'] if isinstance(result,dict) else result)
    except Exception as exc:
        return False,dict(exception=type(exc).__name__)
    return errors=={expected},dict(baseline=sorted(errors))


def judge_self_test():
    import pm_goal_shared_oracles as shared
    previous=tables.DISCOVERY;tables.DISCOVERY=True
    try:
        family,base=next(shared.originals())
        missing=copy.deepcopy(base);missing['store']['sealed_receipts']=[]
        broken=copy.deepcopy(base);del broken['event']['event_id']
        cases=[('expected_refusal',missing,'retained/original_receipt_missing',True),
               ('different_refusal',missing,'retained/original_receipt_seal',False),
               ('unexpected_exception',broken,'retained/original_receipt_missing',False),
               ('accepted_input',base,'retained/original_receipt_missing',False)]
        rows=[]
        for name,value,expected,kill in cases:
            actual,detail=exact_refusal(shared.check_read,value,expected)
            rows.append(dict(case=name,expected_kill=kill,actual_kill=actual,**detail))
        return dict(status='pass' if all(r['expected_kill']==r['actual_kill']for r in rows) else 'fail',cases=rows)
    finally:tables.DISCOVERY=previous


def mutations(collector):
    rows = []
    manifest = json.loads((ROOT/'scripts/pm_goal_guard_witnesses.json').read_text())
    for name in sorted(collector.rows):
        spec = manifest.get(name)
        candidate = collector.candidates.get(name)
        if spec is None or candidate is None:
            rows.append(dict(guard=name,killed=False,cut_flips=False,reason='no sealed expected-refusal witness'))
            continue
        evaluate, value, label = candidate
        try:
            matched,detail=exact_refusal(evaluate,value,spec['expected_refusal'])
            if 'exception' in detail:
                rows.append(dict(guard=name,witness=label,killed=False,**detail));continue
            errors=set(detail['baseline'])
            expected=matched and label==spec['source'] and digest(value)==spec['input_sha256']
        except Exception as exc:
            rows.append(dict(guard=name,witness=label,exception=type(exc).__name__,killed=False))
            continue
        row=dict(guard=name,witness=label,baseline=sorted(errors),expected_refusal=spec['expected_refusal'],killed=expected,cut_flips=False)
        try:
            tables.CUT=frozenset({name})
            changed=evaluate(copy.deepcopy(value))
            actual=set(changed['errors'] if isinstance(changed,dict) else changed)
            row.update(cut_result=sorted(actual),cut_flips=expected and not actual)
        except Exception as exc:
            # This deliberately altered-checker diagnostic is separate from
            # the data mutation judge. Its exception never supplies a kill.
            row['cut_exception']=type(exc).__name__
        finally:tables.CUT=frozenset()
        rows.append(row)
    return rows


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--generate', action='store_true')
    parser.add_argument('--replace-generated',action='store_true',help='Replace only this runner’s generated inventory with all supplied sources; otherwise preserve other source tables')
    parser.add_argument('--judge-self-test',action='store_true')
    parser.add_argument('--prove-generated',action='store_true',help='Prove and replay cuts after deterministic generation in this process')
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--source', action='append')
    parser.add_argument('--table', action='append')
    parser.add_argument('--collect-only', action='store_true')
    parser.add_argument('--no-fuzz',action='store_true',help='Skip optional exploratory mutation search; run authored and explicit single-defect witnesses')
    args = parser.parse_args()
    global OUTPUT
    OUTPUT=args.out
    if args.judge_self_test:
        result=judge_self_test();args.out.mkdir(parents=True,exist_ok=True)
        (args.out/'judge-self-test.json').write_text(json.dumps(result,indent=1)+'\n')
        print(json.dumps(result));return int(result['status']!='pass')
    source_paths=sorted((ROOT/'scripts').glob('pm_goal*.py'))+[ROOT/'scripts'/name for name in
        ('pm_guard_isolation.py','pm_event_numbers.py','pm_event_datetime.py','pm_event_numbers_corpus.py')]
    code_bindings={str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest()for p in source_paths}
    all_code_bindings=code_bindings.copy()  # Includes proof helpers imported later.
    sources = args.source or ['pm_goal_history_reader_fixtures', 'pm_goal_own_d_oracles',
                             'pm_goal_own_d_supplement','pm_goal_complete_oracles','pm_goal_shared_oracles']
    tables.DISCOVERY = True  # Identical witness collection for generation and replay.
    collector = collect(sources,fuzz=not args.no_fuzz)
    args.out.mkdir(parents=True, exist_ok=True)
    import pm_goal_oracle_common as common
    (args.out/'schema-inventory.json').write_text(json.dumps(dict(types=common._SCHEMA_TYPES,inactive=common._SCHEMA_INACTIVE_TYPES,duplicates={k:sorted(v) for k,v in common._SCHEMA_DUPLICATES.items()},locations=common._SCHEMA_LOCATIONS),indent=1)+'\n')
    summary = dict(calls=collector.calls, guards=len(collector.rows), failures=collector.failures,
        store_snapshots=collector.store_snapshots,
        rows={name: {**slot, 'sites': sorted(slot['sites'])} for name, slot in collector.rows.items()},
        native_execution='NOT_RUN')
    (args.out / 'collection.json').write_text(json.dumps(summary, indent=1)+'\n')
    if args.generate:
        generate(collector, replace=args.replace_generated)
        tables.DISCOVERY = False
        tables._ROWS = None
        tables._PREDICATES.clear()
    used_scripts={str(Path(module.__file__).resolve().relative_to(ROOT))for module in tuple(sys.modules.values())
        if getattr(module,'__file__',None)and Path(module.__file__).resolve().is_relative_to(ROOT)
        and Path(module.__file__).name.startswith('pm_goal')and Path(module.__file__).suffix=='.py'}
    code_bindings={path:sha for path,sha in code_bindings.items()if path in used_scripts or not Path(path).name.startswith('pm_goal')}
    if not args.collect_only:
        tables.DISCOVERY=False
    for name in ('pm_goal_guard_rows.json','pm_goal_guard_witnesses.json'):
        path=ROOT/'scripts'/name
        code_bindings[str(path.relative_to(ROOT))]=hashlib.sha256(path.read_bytes()).hexdigest()
    if (not args.generate or args.prove_generated) and not args.collect_only:
        for name in collector.rows:
            spec=tables.rows()[name];path=ROOT/'scripts'/(tables.PREFIX+spec['table']+'.py')
            code_bindings[str(path.relative_to(ROOT))]=hashlib.sha256(path.read_bytes()).hexdigest()
        report = prove(collector, args.out / 'tables', args.table)
        mutation = mutations(collector)
        (args.out / 'mutations.json').write_text(json.dumps(mutation, indent=1)+'\n')
        print(json.dumps(dict(calls=collector.calls, guards=len(collector.rows),
            proved=sum(r['proved'] for r in report), mutations=len(mutation),
            killed=sum(r['killed'] for r in mutation), failures=len(collector.failures))))
    failed = bool(collector.failures)
    if (not args.generate or args.prove_generated) and not args.collect_only:
        proved_names={r['guard'] for r in report if r['status']=='PASS'}
        failed = failed or any(r['status'] != 'PASS' and not r.get('proof') for r in report) or any(not r['killed'] for r in mutation if r['guard'] in proved_names)
    # A proof provider may import a source helper only during prove(). Bind it
    # to the bytes captured before collection, not to a fresh end-of-run hash.
    for module in tuple(sys.modules.values()):
        filename=getattr(module,'__file__',None)
        if not filename:continue
        path=Path(filename).resolve()
        if path.is_relative_to(ROOT)and path.name.startswith('pm_goal')and path.suffix=='.py':
            relative=str(path.relative_to(ROOT))
            if relative not in code_bindings:
                if relative not in all_code_bindings:raise ValueError('unbound late source: '+relative)
                code_bindings[relative]=all_code_bindings[relative]
    source_bindings={**code_bindings,**common.SOURCE_BINDINGS}
    drift=[path for path,sha in source_bindings.items()if not (ROOT/path).exists()or hashlib.sha256((ROOT/path).read_bytes()).hexdigest()!=sha]
    (args.out/'source-bindings.json').write_text(json.dumps(dict(files=source_bindings,changed_during_run=drift),indent=1,sort_keys=True)+'\n')
    if drift:print('Source changed during run: '+', '.join(drift),file=sys.stderr)
    return int(failed or bool(drift))


if __name__ == '__main__':
    sys.exit(main())
