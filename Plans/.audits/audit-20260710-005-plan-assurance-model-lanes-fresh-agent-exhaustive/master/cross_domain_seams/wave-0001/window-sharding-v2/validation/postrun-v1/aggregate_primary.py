#!/usr/bin/env python3
import hashlib,json,os,sys
from pathlib import Path
BASE=Path(__file__).resolve().parent;ROOT=BASE.parents[6];sys.path.insert(0,str(ROOT/'master/dependencies/jsonschema-draft202012-v1/site-packages'));import jsonschema
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
schema=json.loads((BASE/'primary-cohort-report.schema.json').read_text());reports=[]
for i in range(1,5):
 p=BASE/f'cohort-reports/cohort-{i:04d}-primary.json';d=json.loads(p.read_text());jsonschema.Draft202012Validator(schema).validate(d);reports.append((p,d))
eligible=[];rejected=[]
for _,d in reports:eligible+=d['eligible_assignment_ids'];rejected+=d['rejected_assignment_ids']
out={'schema_version':'cross-domain-seam-primary-aggregate-v1','status':'primary_complete_candidate_only','cohort_count':4,'assignment_count':64,'eligible_assignment_ids':eligible,'rejected_assignment_ids':rejected,'eligible_count':len(eligible),'rejected_count':len(rejected),'cohort_report_hashes':{d['cohort_id']:sha(p) for p,d in reports},'independent_credit':0,'coverage_credit':0,'promotion_credit':0,'merge_credit':0,'spec_credit':0}
p=BASE/'aggregate-primary-report.json';raw=(json.dumps(out,indent=2,sort_keys=True)+'\n').encode();fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o444)
with os.fdopen(fd,'wb') as f:f.write(raw)
print(json.dumps({'path':str(p),'sha256':sha(p),'eligible':len(eligible),'rejected':rejected},indent=2,sort_keys=True))
