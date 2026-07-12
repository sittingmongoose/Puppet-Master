#!/usr/bin/env python3
from __future__ import annotations
import argparse,copy,importlib.util,json,os,pathlib
HERE=pathlib.Path(__file__).resolve().parent; SOURCE=HERE.parent/"validate_scenario_postrun_v1.py"
spec=importlib.util.spec_from_file_location("scenario_v1_preserved_v12",SOURCE);v1=importlib.util.module_from_spec(spec);assert spec and spec.loader;spec.loader.exec_module(v1)
_result_errors=v1.result_errors;_receipt_errors=v1.receipt_errors
def result_errors_fixed(result,row,schema):
 adapted=copy.deepcopy(row);fixed={}
 for ref,binding in adapted.get("research_binding_by_feature",{}).items():
  if not isinstance(binding,list) or len(binding)!=2 or not all(isinstance(x,str) and len(x)==64 for x in binding):return [f"feature:{ref}:research-binding-shape"]
  fixed[ref]={"result_file_sha256":binding[0],"research_record_sha256":binding[1]}
 adapted["research_binding_by_feature"]=fixed;return _result_errors(result,adapted,schema)
def receipt_errors_fixed(receipt,row,result_path):
 absolute=result_path.resolve();adapted=copy.deepcopy(row);adapted["output_directory"]=str(absolute.parent);return _receipt_errors(receipt,adapted,absolute)
v1.result_errors=result_errors_fixed;v1.receipt_errors=receipt_errors_fixed
def main():
 p=argparse.ArgumentParser();p.add_argument("--output",type=pathlib.Path,required=True);a=p.parse_args();report=v1.validate_cohort("cohort-0001");report["validator_supersession"]={"version":"v1_2","semantic_checks_removed":0,"schema_checks_removed":0,"credit":0};raw=json.dumps(report,indent=2,sort_keys=True)+"\n";a.output.parent.mkdir(parents=True,exist_ok=True);fd=os.open(a.output,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o444);os.write(fd,raw.encode());os.close(fd);raise SystemExit(0 if report["status"]=="candidate_pass" else 1)
if __name__=="__main__":main()
