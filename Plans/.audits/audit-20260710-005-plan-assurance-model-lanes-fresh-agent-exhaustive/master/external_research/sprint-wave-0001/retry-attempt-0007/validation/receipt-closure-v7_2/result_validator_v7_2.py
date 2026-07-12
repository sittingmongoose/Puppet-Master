#!/usr/bin/env python3
from __future__ import annotations
import sys
from pathlib import Path
from typing import Any
BASE=Path(__file__).resolve().parent;NS=BASE.parents[1];sys.path.insert(0,str(NS/'tools'))
import canonical_json,common

def result_errors_v7_2(value:dict[str,Any],assignment:dict[str,Any],core:dict[str,Any],authorization:dict[str,Any],core_file_sha256:str,authorization_file_sha256:str)->list[str]:
 schema=common.load(NS/'schema/external_research_result_v7.schema.json');packet=common.load(common.packet_path(assignment['assignment_id']));errors=common.draft_errors(value,schema)
 expected={'audit_id':common.AUDIT_ID,'schema_version':common.RESULT_SCHEMA_VERSION,'assignment_id':assignment['assignment_id'],'attempt_id':common.ATTEMPT_ID,'controller_thread_id':common.CONTROLLER_THREAD_ID,'agent_path':assignment['canonical_agent_path'],'model':common.MODEL,'reasoning_effort':common.REASONING_EFFORT,'status':'completed','activation_transaction_id':core.get('activation_transaction_id'),'activation_core_sha256':core_file_sha256,'leaf_dispatch_authorization_sha256':authorization_file_sha256,'topic':packet['topic'],'owner_domains':packet['owner_domains'],'feature_refs':packet['feature_refs'],'research_questions':packet['research_questions']}
 for key,want in expected.items():
  if value.get(key)!=want:errors.append('binding:'+key)
 errors.extend(common.forbidden_identity_errors(value));att=common.load(NS/'leaf_initial_task_contract.json')['required_self_attestations']
 for key in att:
  if value.get('self_attestation',{}).get(key) is not True:errors.append('self-attestation:'+key)
 errors.extend(common.semantic_errors(value,packet));return sorted(set(errors))

def validate_result_buffer_v7_2(raw:bytes,assignment:dict[str,Any],core:dict[str,Any],authorization:dict[str,Any],core_file_sha256:str,authorization_file_sha256:str):
 file_sha=common.sha_bytes(raw)
 try:canonical=canonical_json.canonical_sha256_from_buffer(raw);value=common.parse_standard_exact(raw)
 except Exception as exc:return None,file_sha,'',['result-json:'+type(exc).__name__+':'+str(exc)]
 return value,file_sha,canonical,result_errors_v7_2(value,assignment,core,authorization,core_file_sha256,authorization_file_sha256)
