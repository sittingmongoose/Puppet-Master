#!/usr/bin/env python3
from __future__ import annotations
import argparse,hashlib,importlib.util,json,sys
from pathlib import Path
BASE=Path(__file__).resolve().parent;NS=BASE.parents[1];ROOT=BASE.parents[6]
sys.path.insert(0,str(ROOT/'master/dependencies/jsonschema-draft202012-v1/site-packages'))
import jsonschema
SPEC=importlib.util.spec_from_file_location('frozen_postrun',NS/'tools/validate_postrun_v2.py');F=importlib.util.module_from_spec(SPEC);SPEC.loader.exec_module(F)
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def jrows(p):return [json.loads(x) for x in Path(p).read_text().splitlines() if x.strip()]
def root(paths):return hashlib.sha256(('\n'.join(f'{Path(p)}:{sha(p)}' for p in paths)+'\n').encode()).hexdigest()
def validate(cid):
    authority=BASE/'authority.json';rows=jrows(NS/f'cohorts/{cid}/manifest.jsonl');base=F.validate_cohort(cid);reports=base['assignments'];eligible=[x['assignment_id'] for x in reports if x['eligible']];rejected=[x['assignment_id'] for x in reports if not x['eligible']]
    result_paths=[Path(x['output_directory'])/'result.json' for x in rows];receipt_paths=[NS/f"dispatch/{x['assignment_id']}/attempt-0001/dispatch_receipt.json" for x in rows]
    report={'schema_version':'cross-domain-seam-primary-cohort-report-v1','cohort_id':cid,'status':'pass_candidate_only' if len(eligible)==16 else 'fail_closed','assignment_count':16,'eligible_assignment_ids':eligible,'rejected_assignment_ids':rejected,'assignment_reports':reports,'validator_sha256':sha(Path(__file__)),'authority_sha256':sha(authority),'result_root_sha256':root(result_paths),'receipt_root_sha256':root(receipt_paths),'promotion_credit':0}
    schema=json.loads((BASE/'primary-cohort-report.schema.json').read_text());jsonschema.Draft202012Validator(schema).validate(report);return report
if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--cohort-id',required=True);a=ap.parse_args();print(json.dumps(validate(a.cohort_id),indent=2,sort_keys=True))
