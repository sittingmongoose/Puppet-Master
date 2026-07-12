#!/usr/bin/env python3
import hashlib,json,os
from pathlib import Path
BASE=Path(__file__).resolve().parent;NS=BASE.parents[1];ROOT=BASE.parents[6]
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
receipts=[NS/f'dispatch/A005CDSV2-{i:04d}/attempt-0001/dispatch_receipt.json' for i in range(1,49)]
acts=[NS/'cohorts/cohort-0001/activation.v2.json',NS/'cohorts/cohort-0002/activation.v2.json',NS/'cohorts/cohort-0003/activation.v3.json',NS/'cohorts/cohort-0004/activation.v4.json']
data={'schema_version':'cross-domain-seam-postrun-authority-v1','status':'PRIMARY_REVIEW_ACTIVE_ZERO_CREDIT','audit_id':'audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive','wave_id':'cross-domain-seam-window-sharding-v2','concurrency_policy_v14_sha256':'6d64c47798f97cba4e2c30d9d3c6d3d1bedc1c974ba6033b6fce20efe0ff6375','routing_v2_sha256':'9105752f30b42d482454e8df7782bda95992d94ae7b149977e280ac83df83544','cache_reconciliation_sha256':'bfb3a7fc8a3723994f23930085f5989848c1aac85b4a6b39ed4dc0d15e0b3782','readiness_sha256':'a2913d9a26bc2ada12e72347b6bdf4d167e43644d713a5060f82b132f4bc3207','terminal_preparation_sha256':'1e8af80b32fb1d998d4f1bdb24f049f26f93b6c25892a60b96982bd17bc052c9','activation_hashes':[sha(p) for p in acts],'sealed_prior_receipt_root_sha256':hashlib.sha256(('\n'.join(sha(p) for p in receipts)+'\n').encode()).hexdigest(),'assignment_count':64,'cohort_count':4,'edge_count':9365,'feature_count':2495,'reviewer_model':'gpt-5.6-sol','reviewer_effort':'xhigh','promotion_credit':0,'validator_sha256':sha(BASE/'validate_primary_cohort.py'),'schema_sha256':sha(BASE/'primary-cohort-report.schema.json'),'tests_sha256':sha(BASE/'test_postrun_v1.py')}
out=BASE/'authority.json';raw=(json.dumps(data,indent=2,sort_keys=True)+'\n').encode();fd=os.open(out,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o444)
with os.fdopen(fd,'wb') as f:f.write(raw)
print(json.dumps({'path':str(out),'sha256':sha(out)},sort_keys=True))
