import sys as _sys
_sys.dont_write_bytecode=True
import datetime as _dt
import hashlib as _hh
import importlib.util as _iu
import json as _json
import os as _os
import pathlib as _pl
import re as _re
import select as _select
import signal as _si
import stat as _stat
import subprocess as _sp
_FILES={
"semantic_bundle.json":("IMMUTABLE_SEMANTIC_BUNDLE",900000),
"runner.py":("PROCESS_RUNNER",60000),
"evidence_recorder.py":("APPEND_ONLY_EVIDENCE_RECORDER",40000),
"offline_verifier.py":("OFFLINE_VERIFIER",95000),
}
_ROLES=(
"APPEND_ONLY_EVIDENCE_RECORDER",
"IMMUTABLE_SEMANTIC_BUNDLE",
"OFFLINE_VERIFIER",
"PROCESS_RUNNER",
)
_INS=(
b"TEST-TAKER TRANSPORT: Answer the frozen packet below directly in your first final response. "
b"Do not use tools, files, browsing, network, memory, delegation, or other agents.\n\n"
)
_ROUTES=[
{"slot":"slot-alpha","model":"gpt-5.4-mini","reasoning_effort":"xhigh"},
{"slot":"slot-bravo","model":"gpt-5.4-mini","reasoning_effort":"medium"},
{"slot":"slot-charlie","model":"gpt-5.6-luna","reasoning_effort":"medium"},
]
_SHARED=[
{"bytes":7024,"role":"OPERATING_CONTRACT","sha256":"764dd27b3f472a90eef0f8493e63ac8fb349fe05a3a97dc4673a4a835e6e8dbd","successor_root_relative_path":"r9_goal_operating_contract_v1.json"},
{"bytes":5909,"role":"SUBJECT_TRANSPORT_ADDENDUM","sha256":"7b5186b3c9f244488a75695b34b0d06e79ee6b720acb934fc3767315c4b005d8","successor_root_relative_path":"r9_subject_transport_addendum_subagent_invocations_v1.json"},
{"bytes":4780,"role":"ROUTE_CAPABILITY_RECEIPT","sha256":"3d523eac087e691b2336a6ab878dbfe64b8359891831dc866641039f97f8646a","successor_root_relative_path":"r9_subject_transport_subagent_route_capability_receipt_v1.json"},
]
_TP=set("schema_id role format lineage shared_authorities routes cells stage_order deterministic_stages schedule transport evidence_contract synthetic_scenarios regressions counterfactuals nonclaims".split())
_RF=set("schema_id run_id run_kind mode scenario created_utc component_identity component_provenance shared_authorities routes schedule route_count cells_per_route cell_count planned_call_count stage_count required_clean_stage_artifact_count regression_family_count regression_variant_count global_fault_count semantic_counterfactual_count retry_count best_of replacement_count custody".split())
_RW=set("row_id ordinal slot cell index nonce invocation_id task_name expected_canonical_task_path".split())
_ATF=set("schema_id run_id run_kind mode row_id slot cell index ordinal nonce invocation_id task_name expected_canonical_task_path agent_type fork_turns model reasoning_effort causal_inputs packet_sha256 packet_bytes message_sha256 message_bytes attempt retry_count best_of replacement_result no_retry no_relaunch admission_state".split())
_STF=set("schema_id run_id slot stage index rule finalization_row_id finalization_ordinal causal_inputs artifact_payload_utf8 artifact_payload_sha256 artifact_payload_bytes artifact_storage_sha256 artifact_storage_bytes".split())
_SF=set("schema_id run_id run_kind mode slot cell index ordinal nonce invocation_id task_name expected_canonical_task_path agent_type fork_turns model reasoning_effort packet_sha256 packet_bytes message_utf8 message_sha256 message_bytes attempt_sha256 attempt_bytes".split())
_SEF=set("schema_id invocation_id spawn_request_sha256 tool_result returned_identity_kind returned_canonical_task_path".split())
_TF=set("schema_id invocation_id returned_canonical_task_path message_type final_utf8 observed_activity terminal_status".split())
_FF=set("schema_id invocation_id phase failure_type detail".split())
_AF=set("tool_calls file_accesses browsing network_accesses delegations memory_accesses followup_turns nonterminal_messages observation_basis".split())
_SCS=(
"clean","observed_tool","observed_file","observed_browse","observed_network",
"observed_delegation","observed_memory","observed_followup","observed_nonterminal",
"missing_spawn","failed_spawn","wrong_path","wrong_sender","wrong_type",
"malformed_output","partial_output","missing_output","delayed_multi_poll",
)
_MAX=4*1024*1024
_SAFE=_re.compile(r"[A-Za-z0-9][A-Za-z0-9_.-]{0,191}\Z")
_HEX=_re.compile(r"[0-9a-f]{64}\Z")
_STOP=False
_SIGS={_si.SIGINT,_si.SIGTERM}
class _Invalid(RuntimeError):
	pass
def _sha(data):
	return _hh.sha256(data).hexdigest()
def _canon(value):
	try:
		return _json.dumps(value,ensure_ascii=False,allow_nan=False,sort_keys=True,
separators=(",",":")).encode("utf-8")
	except(TypeError,ValueError,UnicodeEncodeError)as exc:
		raise _Invalid(f"not canonical-JSON-able: {exc}")from exc
def _pairs(items):
	result={}
	for key,value in items:
		if key in result:
			raise _Invalid(f"duplicate JSON key: {key}")
		result[key]=value
	return result
def _lj(data,label,storage=False):
	payload=data
	if storage:
		if not data.endswith(b"\n")or data.endswith(b"\n\n")or b"\r" in data:
			raise _Invalid(f"{label}: not exact one-LF JSON storage")
		payload=data[:-1]
	try:
		value=_json.loads(payload.decode("utf-8"),object_pairs_hook=_pairs,
parse_constant=lambda item:(_ for _ in()).throw(_Invalid(item)))
	except(UnicodeDecodeError,_json.JSONDecodeError,_Invalid)as exc:
		raise _Invalid(f"{label}: invalid JSON: {exc}")from exc
	if not isinstance(value,dict)or _canon(value)!=payload:
		raise _Invalid(f"{label}: not a canonical JSON object")
	return value
def _lr(path,label):
	try:
		info=_os.lstat(path)
	except FileNotFoundError as exc:
		raise _Invalid(f"{label}: missing")from exc
	if _stat.S_ISLNK(info.st_mode)or not _stat.S_ISREG(info.st_mode):
		raise _Invalid(f"{label}: regular nonlink file required")
	return info
def _rd(path,label):
	before=_lr(path,label)
	fd=_os.open(path,_os.O_RDONLY|getattr(_os,"O_NOFOLLOW",0))
	parts=[]
	try:
		opened=_os.fstat(fd)
		if not _stat.S_ISREG(opened.st_mode)or(opened.st_dev,opened.st_ino)!=(before.st_dev,before.st_ino):
			raise _Invalid(f"{label}: reopen identity mismatch")
		while True:
			part=_os.read(fd,1024*1024)
			if not part:
				break
			parts.append(part)
	finally:
		_os.close(fd)
	data=b"".join(parts)
	after=_lr(path,label)
	if len(data)!=before.st_size or(after.st_dev,after.st_ino,after.st_size)!=(before.st_dev,before.st_ino,before.st_size):
		raise _Invalid(f"{label}: changed during reopen")
	return data
def _nal(path,label):
	if not _os.path.isabs(path)or any(part in{"",".",".."}for part in path.split(_os.sep)[1:]):
		raise _Invalid(f"{label}: unsafe lexical path")
	current=_os.sep
	for part in path.split(_os.sep)[1:]:
		current=_os.path.join(current,part)
		try:
			info=_os.lstat(current)
		except FileNotFoundError:
			continue
		if _stat.S_ISLNK(info.st_mode):
			raise _Invalid(f"{label}: symlink ancestor")
def _bootstrap():
	source=__file__ if _os.path.isabs(__file__)else _os.path.join(_os.getcwd(),__file__)
	root=_os.path.dirname(source)
	parent=_os.path.dirname(root)
	leaf=_os.path.basename(root)
	if _os.path.basename(parent)!="r9_control_plane_stabilization_v1" or not(leaf=="iteration_011" or _re.fullmatch(r"formal_candidate_v[1-9][0-9]*",leaf)):
		raise _Invalid("x")
	_nal(root,"component root")
	root_info=_os.lstat(root)
	if _stat.S_ISLNK(root_info.st_mode)or not _stat.S_ISDIR(root_info.st_mode):
		raise _Invalid("x")
	names=set(_os.listdir(root))
	if names!=set(_FILES):
		raise _Invalid(f"component inventory mismatch: {sorted(names)}")
	infos={}
	for name,(_,maximum)in _FILES.items():
		info=_lr(_os.path.join(root,name),f"component {name}")
		if info.st_size<1 or info.st_size>maximum:
			raise _Invalid(f"component {name}: byte ceiling mismatch")
		infos[name]=info
	storages={name:_rd(_os.path.join(root,name),f"component {name}")for name in _FILES}
	for name,info in infos.items():
		if len(storages[name])!=info.st_size:
			raise _Invalid(f"component {name}: size drift")
	by_role={role:(name,storages[name])for name,(role,_)in _FILES.items()}
	parts=[{"role":role,"sha256":_sha(by_role[role][1]),"bytes":len(by_role[role][1])}for role in _ROLES]
	rows=_canon(parts)
	identity={
"schema_id":"pw-r9-four-part-component-identity-v1","part_count":4,
"aggregate_file_bytes":sum(item["bytes"]for item in parts),
"rows_sha256":_sha(rows),"rows_bytes":len(rows),"parts":parts,
}
	provenance={
"authority":False,
"parts":[{"role":role,"path":f"r9_control_plane_stabilization_v1/{leaf}/{by_role[role][0]}",
"sha256":_sha(by_role[role][1]),"bytes":len(by_role[role][1])}
for role in _ROLES],
}
	return root,storages,identity,provenance
_ROOT,_,_,_=_bootstrap()
_SU=_os.path.dirname(_os.path.dirname(_ROOT))
def _load_sibling(name):
	path=_os.path.join(_ROOT,f"{name}.py")
	module_name=f"_pw_r9_iteration_011_{name}"
	spec=_iu.spec_from_file_location(module_name,path)
	if spec is None or spec.loader is None:
		raise _Invalid(f"cannot load sibling {name}")
	module=_iu.module_from_spec(spec)
	_sys.modules[module_name]=module
	spec.loader.exec_module(module)
	if _os.path.abspath(getattr(module,"__file__",""))!=path:
		raise _Invalid(f"sibling import path mismatch: {name}")
	return module
_rr=_load_sibling("evidence_recorder")
_vr=_load_sibling("offline_verifier")
if set(getattr(_rr,"__all__",()))!={"create_run","admit_row","record_spawn","record_raw","record_completion","record_stage","seal_run"}:
	raise _Invalid("x")
if not callable(getattr(_vr,"verify",None)):
	raise _Invalid("x")
def _sn():
	root,storages,identity,provenance=_bootstrap()
	if root!=_ROOT:
		raise _Invalid("x")
	return storages,identity,provenance
def _name(value,label):
	if not isinstance(value,str)or not _SAFE.fullmatch(value)or value in{".",".."}:
		raise _Invalid(f"{label}: confined name required")
	return value
def _integer(value,label,minimum=0):
	if isinstance(value,bool)or not isinstance(value,int)or value<minimum:
		raise _Invalid(f"{label}: integer at least {minimum} required")
	return value
def _text(value,label,nonempty=True):
	if not isinstance(value,str)or(nonempty and not value):
		raise _Invalid(f"{label}: text required")
	try:
		value.encode("utf-8")
	except UnicodeEncodeError as exc:
		raise _Invalid(f"{label}: invalid UTF-8")from exc
	return value
def _au():
	for declaration in _SHARED:
		path=_os.path.join(_SU,declaration["successor_root_relative_path"])
		_nal(path,f"shared authority {declaration['role']}")
		first=_rd(path,f"shared authority {declaration['role']}")
		second=_rd(path,f"shared authority {declaration['role']} reopen")
		if first!=second or(_sha(first),len(first))!=(declaration["sha256"],declaration["bytes"]):
			raise _Invalid(f"shared authority drift: {declaration['role']}")
	return[dict(item)for item in _SHARED]
def _ep(projection):
	if not isinstance(projection,dict)or set(projection)!={"source_supported_candidate","supported_claims","apparent_discrepancies","source_bindings","predecessor_outputs"}:
		raise _Invalid("x")
	claims=projection["supported_claims"]
	bindings=projection["source_bindings"]
	discrepancies=projection["apparent_discrepancies"]
	candidate=projection["source_supported_candidate"]
	predecessors=projection["predecessor_outputs"]
	if not isinstance(claims,list)or len(claims)<2 or not isinstance(bindings,list)or not isinstance(discrepancies,list):
		raise _Invalid("x")
	binding_ids=set()
	for binding in bindings:
		if not isinstance(binding,dict)or set(binding)!={"authority","source_record_id"}:
			raise _Invalid("x")
		binding_ids.add(_name(binding["source_record_id"],"source record"))
		_text(binding["authority"],"source authority")
	if len(binding_ids)!=len(bindings):
		raise _Invalid("x")
	claim_by_id={}
	for claim in claims:
		if not isinstance(claim,dict)or set(claim)!={"claim_id","predicate","source_record_ids","value"}:
			raise _Invalid("x")
		claim_id=_name(claim["claim_id"],"claim id")
		if claim_id in claim_by_id or not isinstance(claim["source_record_ids"],list)or not claim["source_record_ids"]:
			raise _Invalid("x")
		sources=[_name(item,"claim source")for item in claim["source_record_ids"]]
		if len(set(sources))!=len(sources)or not set(sources).issubset(binding_ids):
			raise _Invalid("x")
		_text(claim["predicate"],"claim predicate")
		if isinstance(claim["value"],bool)or not isinstance(claim["value"],(str,int)):
			raise _Invalid("x")
		claim_by_id[claim_id]=claim
	if not isinstance(candidate,dict)or set(candidate)!={"claim_ids","discrepancy_ids"}:
		raise _Invalid("x")
	candidate_claims=candidate["claim_ids"]
	candidate_discrepancies=candidate["discrepancy_ids"]
	if not isinstance(candidate_claims,list)or len(set(candidate_claims))!=len(candidate_claims)or set(candidate_claims)!=set(claim_by_id):
		raise _Invalid("x")
	discrepancy_by_id={}
	pair_seen=set()
	for discrepancy in discrepancies:
		if not isinstance(discrepancy,dict)or set(discrepancy)!={"claim_ids","discrepancy_id","kind"}:
			raise _Invalid("x")
		discrepancy_id=_name(discrepancy["discrepancy_id"],"discrepancy id")
		ids=discrepancy["claim_ids"]
		if discrepancy_id in discrepancy_by_id or not isinstance(ids,list)or len(ids)!=2 or len(set(ids))!=2 or not set(ids).issubset(claim_by_id):
			raise _Invalid("x")
		pair=frozenset(ids)
		if pair in pair_seen or discrepancy["kind"]not in{"VALUE_CONFLICT","AUTHORITY_SCOPE_OVERLAP"}:
			raise _Invalid("x")
		pair_seen.add(pair)
		left,right=(claim_by_id[item]for item in ids)
		if left["predicate"]!=right["predicate"]or left["value"]==right["value"]:
			raise _Invalid("x")
		discrepancy_by_id[discrepancy_id]=discrepancy
	expected_pairs={frozenset((a,b))for index,a in enumerate(claim_by_id)for b in list(claim_by_id)[index+1:]
if claim_by_id[a]["predicate"]==claim_by_id[b]["predicate"]and claim_by_id[a]["value"]!=claim_by_id[b]["value"]}
	if pair_seen!=expected_pairs or not isinstance(candidate_discrepancies,list)or len(set(candidate_discrepancies))!=len(candidate_discrepancies)or set(candidate_discrepancies)!=set(discrepancy_by_id):
		raise _Invalid("x")
	if not isinstance(predecessors,dict)or set(predecessors)!={"decisions"}or not isinstance(predecessors["decisions"],list):
		raise _Invalid("x")
	decisions_by_discrepancy={}
	decision_ids=set()
	edges={item:set()for item in claim_by_id}
	unresolved=False
	for decision in predecessors["decisions"]:
		if not isinstance(decision,dict):
			raise _Invalid("x")
		kind=decision.get("decision")
		common={"decision","decision_id","discrepancy_id"}
		if kind=="select_current_and_supersede_other":
			required=common|{"selected_claim_id","superseded_claim_ids"}
		elif kind in{"preserve_unresolved_conflict","preserve_distinct_authorities"}:
			required=common|{"claim_ids"}
		else:
			raise _Invalid("x")
		if set(decision)!=required:
			raise _Invalid("x")
		decision_id=_name(decision["decision_id"],"decision id")
		discrepancy_id=_name(decision["discrepancy_id"],"decision discrepancy")
		if decision_id in decision_ids or discrepancy_id in decisions_by_discrepancy or discrepancy_id not in discrepancy_by_id:
			raise _Invalid("x")
		decision_ids.add(decision_id)
		decisions_by_discrepancy[discrepancy_id]=decision
		discrepancy=discrepancy_by_id[discrepancy_id]
		ids=set(discrepancy["claim_ids"])
		if kind=="select_current_and_supersede_other":
			if discrepancy["kind"]!="VALUE_CONFLICT" or decision["selected_claim_id"]not in ids or not isinstance(decision["superseded_claim_ids"],list):
				raise _Invalid("x")
			superseded=decision["superseded_claim_ids"]
			if len(set(superseded))!=len(superseded)or{decision["selected_claim_id"],*superseded}!=ids or decision["selected_claim_id"]in superseded:
				raise _Invalid("x")
			for old in superseded:
				edges[old].add(decision["selected_claim_id"])
		else:
			if not isinstance(decision["claim_ids"],list)or len(set(decision["claim_ids"]))!=len(decision["claim_ids"])or set(decision["claim_ids"])!=ids:
				raise _Invalid("x")
			expected_kind="VALUE_CONFLICT" if kind=="preserve_unresolved_conflict" else "AUTHORITY_SCOPE_OVERLAP"
			if discrepancy["kind"]!=expected_kind:
				raise _Invalid("x")
			unresolved=True
	visiting=set()
	visited=set()
	def visit(node):
		if node in visiting:
			raise _Invalid("x")
		if node in visited:
			return
		visiting.add(node)
		for successor in edges[node]:
			visit(successor)
		visiting.remove(node)
		visited.add(node)
	for claim_id in edges:
		visit(claim_id)
	return unresolved or any(item not in decisions_by_discrepancy for item in discrepancy_by_id)
def _cf_checks(bundle):
	corpus=bundle["counterfactuals"]
	contract=bundle["evidence_contract"]["counterfactual_projection_contract"]
	if not isinstance(corpus,list)or len(corpus)!=7 or contract.get("semantic_case_count")!=6 or contract.get("leakage_case_count")!=1:
		raise _Invalid("x")
	projection_bytes=[]
	fixture_ids=[]
	for item in corpus[:6]:
		if not isinstance(item,dict)or set(item)!={"id","evaluation_authority","case"}or item["evaluation_authority"]!="INDEPENDENT_CODE_EVALUATOR_ONLY":
			raise _Invalid("x")
		case=item["case"]
		if not isinstance(case,dict)or set(case)!={"fixture_id","provider_projection","expected","canonical_projection"}:
			raise _Invalid("x")
		projection=case["provider_projection"]
		encoded=_canon(projection)
		identity=case["canonical_projection"]
		if identity!={"encoding":"UTF-8 canonical minified JSON without terminal LF","sha256":_sha(encoded),"bytes":len(encoded)}:
			raise _Invalid("x")
		observed=_ep(projection)
		expected=case["expected"]
		if not isinstance(expected,bool)or observed is not expected:
			raise _Invalid("x")
		projection_bytes.append(encoded)
		fixture_ids.append(_name(case["fixture_id"],"counterfactual fixture"))
	leakage_item=corpus[6]
	if not isinstance(leakage_item,dict)or set(leakage_item)!={"id","evaluation_authority","leakage_case"}or leakage_item["evaluation_authority"]!="INDEPENDENT_CODE_EVALUATOR_ONLY":
		raise _Invalid("x")
	leakage=leakage_item["leakage_case"]
	if not isinstance(leakage,dict)or set(leakage)!={"fixture_id","forbidden_keys","forbidden_tokens","projection_refs","scan_encoding"}:
		raise _Invalid("x")
	refs=[{"fixture_id":fixture_id,"sha256":_sha(data),"bytes":len(data)}for fixture_id,data in zip(fixture_ids,projection_bytes)]
	if leakage["projection_refs"]!=refs:
		raise _Invalid("x")
	for encoded in projection_bytes:
		for key in leakage["forbidden_keys"]:
			marker=_json.dumps(key,ensure_ascii=False).encode("utf-8")+b":"
			if marker in encoded:
				raise _Invalid(f"counterfactual forbidden recursive key leaked: {key}")
		for token in leakage["forbidden_tokens"]:
			if _text(token,"leakage token").encode("utf-8")in encoded:
				raise _Invalid(f"counterfactual forbidden token leaked: {token}")
	negative=dict(corpus[0]["case"]["provider_projection"])
	negative["observed_result"]=False
	try:
		_ep(negative)
	except _Invalid:
		self_attestation_rejected=True
	else:
		raise _Invalid("x")
	if contract.get("ordered_fixture_ids")!=fixture_ids+[leakage["fixture_id"]]:
		raise _Invalid("x")
	return{"semantic_projections":6,"leakage_scans":6,"self_attestation_rejected":self_attestation_rejected}
def _ct():
	storages,identity,provenance=_sn()
	bundle=_lj(storages["semantic_bundle.json"],"semantic bundle",True)
	if set(bundle)!=_TP or bundle.get("schema_id")!="pw-r9-immutable-semantic-bundle-v1" or bundle.get("role")!="IMMUTABLE_SEMANTIC_BUNDLE":
		raise _Invalid("x")
	shared=_au()
	if bundle.get("shared_authorities")!=shared or bundle.get("routes")!=_ROUTES:
		raise _Invalid("x")
	transport=bundle.get("transport")
	transport_fields=set("actual_dispatch_adapter adjudication_boundary agent_type attempt best_of canonical_task_path event_cardinality failure_schema_id fork_turns instruction_bytes instruction_sha256 instruction_utf8 invocation_id nonce observation_basis observed_activity observed_activity_fields prohibited_activity raw_root_event replacement_count retry_count root_event_contract spawn_receipt_schema_id spawn_request spawn_request_schema_id subject_visible_view task_name terminal_delivery_schema_id".split())
	if not isinstance(transport,dict)or set(transport)!=transport_fields:
		raise _Invalid("x")
	if(transport.get("agent_type"),transport.get("fork_turns"),transport.get("attempt"),transport.get("retry_count"),transport.get("best_of"),transport.get("replacement_count"))!=("default","none",1,0,False,0):
		raise _Invalid("x")
	if transport.get("instruction_utf8")!=_INS.decode("utf-8")or transport.get("instruction_sha256")!=_sha(_INS)or transport.get("instruction_bytes")!=174:
		raise _Invalid("x")
	if(transport.get("spawn_request_schema_id"),transport.get("spawn_receipt_schema_id"),transport.get("terminal_delivery_schema_id"),transport.get("failure_schema_id"))!=("pw-r9-subagent-spawn-request-v1","pw-r9-subagent-spawn-receipt-event-v1","pw-r9-subagent-terminal-delivery-event-v1","pw-r9-subagent-transport-failure-event-v1"):
		raise _Invalid("x")
	if set(transport["spawn_request"].get("exact_fields",[]))!=_SF or transport["raw_root_event"].get("maximum_bytes_including_lf")!=_MAX or set(transport.get("observed_activity_fields",[]))!=_AF:
		raise _Invalid("x")
	root_events=transport.get("root_event_contract")
	if(set(root_events["spawn_receipt"].get("exact_fields",[]))!=_SEF
or set(root_events["terminal_delivery"].get("exact_fields",[]))!=_TF
or set(root_events["transport_failure"].get("exact_fields",[]))!=_FF):
		raise _Invalid("x")
	cells=bundle.get("cells")
	if not isinstance(cells,list)or len(cells)!=97:
		raise _Invalid("x")
	cell_fields=set("cell dependency_gate expected_output expected_output_bytes expected_output_sha256 expected_output_storage_bytes expected_output_storage_sha256 expected_output_utf8 index render_utf8 render_utf8_bytes render_utf8_sha256".split())
	cell_by_id={}
	for index,cell in enumerate(cells):
		if not isinstance(cell,dict)or set(cell)!=cell_fields or cell.get("index")!=index:
			raise _Invalid("x")
		cell_id=_name(cell.get("cell"),"cell id")
		if cell_id in cell_by_id:
			raise _Invalid("x")
		render=_text(cell.get("render_utf8"),"cell render").encode("utf-8")
		if not render.endswith(b"\n")or render.endswith(b"\n\n")or b"\r" in render or(cell.get("render_utf8_sha256"),cell.get("render_utf8_bytes"))!=(_sha(render),len(render)):
			raise _Invalid("x")
		oracle=_text(cell.get("expected_output_utf8"),"cell oracle").encode("utf-8")
		try:
			oracle_value=_json.loads(oracle.decode("utf-8"),object_pairs_hook=_pairs,
parse_constant=lambda item:(_ for _ in()).throw(_Invalid(item)))
		except(UnicodeDecodeError,_json.JSONDecodeError,_Invalid)as exc:
			raise _Invalid(f"cell oracle malformed: {exc}")from exc
		if _json.dumps(oracle_value,ensure_ascii=False,allow_nan=False,separators=(",",":")).encode("utf-8")!=oracle or oracle_value!=cell.get("expected_output")or(cell.get("expected_output_sha256"),cell.get("expected_output_bytes"))!=(_sha(oracle),len(oracle))or(cell.get("expected_output_storage_sha256"),cell.get("expected_output_storage_bytes"))!=(_sha(oracle+b"\n"),len(oracle)+1):
			raise _Invalid("x")
		gate=cell.get("dependency_gate")
		if not isinstance(gate,dict)or set(gate)!={"rule","required_pass_cells","required_stage_artifacts"}or gate.get("rule")!="pw-r9-exact-input-frozen-artifact-v1":
			raise _Invalid("x")
		for key in("required_pass_cells","required_stage_artifacts"):
			if not isinstance(gate[key],list)or len(set(gate[key]))!=len(gate[key]):
				raise _Invalid("x")
		cell_by_id[cell_id]=cell
	schedule=bundle.get("schedule")
	if not isinstance(schedule,list)or len(schedule)!=291:
		raise _Invalid("x")
	for index,item in enumerate(schedule):
		route_index,cell_index=divmod(index,97)
		expected={"index":index,"route_index":route_index,"route_ref":f"/routes/{route_index}","cell_index":cell_index,"cell_ref":f"/cells/{cell_index}"}
		if item!=expected:
			raise _Invalid("x")
	stage_order=bundle.get("stage_order")
	stages=bundle.get("deterministic_stages")
	if not isinstance(stage_order,list)or len(stage_order)!=18 or len(set(stage_order))!=18 or not isinstance(stages,list)or len(stages)!=18:
		raise _Invalid("x")
	stage_fields=set("direct_subject_cells expected_artifact expected_artifact_bytes expected_artifact_sha256 expected_artifact_storage_bytes expected_artifact_storage_sha256 expected_artifact_utf8 finalization_boundary index predecessor_stages route_local_artifacts rule stage".split())
	stage_by_id={}
	for index,stage in enumerate(stages):
		if not isinstance(stage,dict)or set(stage)!=stage_fields or stage.get("index")!=index or stage.get("stage")!=stage_order[index]or stage.get("rule")!="pw-r9-exact-input-frozen-artifact-v1":
			raise _Invalid("x")
		stage_id=_name(stage["stage"],"stage id")
		payload=_text(stage.get("expected_artifact_utf8"),"stage artifact payload").encode("utf-8")
		try:
			payload_value=_json.loads(payload.decode("utf-8"),object_pairs_hook=_pairs,
parse_constant=lambda item:(_ for _ in()).throw(_Invalid(item)))
		except(UnicodeDecodeError,_json.JSONDecodeError,_Invalid)as exc:
			raise _Invalid(f"stage payload malformed: {exc}")from exc
		if not isinstance(payload_value,dict)or _json.dumps(payload_value,ensure_ascii=False,allow_nan=False,separators=(",",":")).encode("utf-8")!=payload or payload_value!=stage.get("expected_artifact")or(stage.get("expected_artifact_sha256"),stage.get("expected_artifact_bytes"))!=(_sha(payload),len(payload))or(stage.get("expected_artifact_storage_sha256"),stage.get("expected_artifact_storage_bytes"))!=(_sha(payload+b"\n"),len(payload)+1):
			raise _Invalid("x")
		predecessors=stage.get("predecessor_stages")
		direct=stage.get("direct_subject_cells")
		if not isinstance(predecessors,list)or len(set(predecessors))!=len(predecessors)or any(item not in stage_order[:index]for item in predecessors)or not isinstance(direct,list)or len(set(direct))!=len(direct)or any(item not in cell_by_id for item in direct)or(not predecessors and not direct):
			raise _Invalid("x")
		boundary=stage.get("finalization_boundary")
		if not isinstance(boundary,dict)or set(boundary)!={"after_cell_index","after_cell","stage_order_index"}or boundary.get("stage_order_index")!=index:
			raise _Invalid("x")
		after=_integer(boundary.get("after_cell_index"),"stage boundary")
		if after>=97 or boundary.get("after_cell")!=cells[after]["cell"]or any(cell_by_id[item]["index"]>after for item in direct):
			raise _Invalid("x")
		route_local=stage.get("route_local_artifacts")
		expected_local=[{"artifact_id":f"{route['slot']}:{stage_id}","artifact_oracle_ref":f"/deterministic_stages/{index}/expected_artifact_utf8","route_ref":f"/routes/{route_index}","stage_ref":f"/deterministic_stages/{index}"}for route_index,route in enumerate(_ROUTES)]
		if route_local!=expected_local:
			raise _Invalid("x")
		stage_by_id[stage_id]=stage
	for cell in cells:
		gate=cell["dependency_gate"]
		if any(item not in cell_by_id or cell_by_id[item]["index"]>=cell["index"]for item in gate["required_pass_cells"]):
			raise _Invalid("x")
		if any(item not in stage_by_id or stage_by_id[item]["finalization_boundary"]["after_cell_index"]>=cell["index"]for item in gate["required_stage_artifacts"]):
			raise _Invalid("x")
	scenarios=bundle.get("synthetic_scenarios")
	if not isinstance(scenarios,list)or[item.get("scenario_id")for item in scenarios if isinstance(item,dict)]!=list(_SCS)or any(set(item)!={"scenario_id","event_rule"}or not isinstance(item["event_rule"],str)for item in scenarios):
		raise _Invalid("x")
	regressions=bundle.get("regressions")
	regression_projection=_canon(regressions)
	if(len(regression_projection),_sha(regression_projection))!=(78600,"a3fb8d6607723a60b5e589da12fd9ef9feac86ac5a8d877e9da2a73d0dea4cf9"):
		raise _Invalid("x")
	if not isinstance(regressions,dict)or(regressions.get("family_count"),regressions.get("variant_count"),regressions.get("global_fault_count"),regressions.get("qualification_credit"),regressions.get("calls"))!=(22,56,10,0,{"network":0,"provider":0,"subject":0}):
		raise _Invalid("x")
	families=regressions.get("families")
	globals_=regressions.get("global_faults")
	if not isinstance(families,list)or len(families)!=22 or not isinstance(globals_,list)or len(globals_)!=10:
		raise _Invalid("x")
	variants=set()
	scenario_map={item:item for item in _SCS}
	family_ids=set()
	for family in families:
		family_id=_name(family.get("scenario_id"),"regression family")
		rows=family.get("variants")
		if family_id in family_ids or not isinstance(rows,list)or family.get("variant_count")!=len(rows):
			raise _Invalid("x")
		family_ids.add(family_id)
		for variant in rows:
			variant_id=_name(variant.get("variant_id"),"regression variant")
			if variant_id in variants:
				raise _Invalid("x")
			variants.add(variant_id)
			backend=variant.get("backend_scenario")
			if backend is not None:
				if backend not in _SCS:
					raise _Invalid("x")
				scenario_map[variant_id]=backend
	if len(variants)!=56 or len({_name(item.get("case_id"),"global fault")for item in globals_})!=10:
		raise _Invalid("x")
	checks=_cf_checks(bundle)
	contract=bundle["evidence_contract"]
	schedule_contract=contract["schedule_contract"]
	row_rule={"collision_rule":"exactly one row_id per declared ordinal","format":"row-<ordinal:03d>","function_id":"pw-r9-row-id-v1","ordinal_base":0,"ordinal_range_by_run":{"run-canary":[0,2],"run-matrix":[0,290],"simulate":[0,290]}}
	nonce_rule={"algorithm":"sha256_canonical_utf8_tuple","function_id":"pw-r9-dispatch-nonce-v1","inputs":["run_id","schedule_index","slot","cell"],"predeclared_in_run_manifest":True,"semantic_manifest_contains_run_specific_nonce":False}
	ownership={"APPEND_ONLY_EVIDENCE_RECORDER":"owns create-only mechanical construction","IMMUTABLE_SEMANTIC_BUNDLE":"owns schema IDs plus semantic invariants","OFFLINE_VERIFIER":"independently owns exact field, type, hash, causal, and inventory validation","PROCESS_RUNNER":"constructs values","forbidden":["duplicate JSON-Schema authority","proof authority","callback authority"]}
	if schedule_contract.get("planned_rows")!={"run-canary":3,"run-matrix":291,"simulate":291}or schedule_contract.get("row_id_rule")!=row_rule or schedule_contract.get("nonce_rule")!=nonce_rule or contract.get("schema_ownership")!=ownership:
		raise _Invalid("x")
	return{"bundle":bundle,"identity":identity,"provenance":provenance,"shared":shared,
"cells":cells,"cell_by_id":cell_by_id,"stages":stages,
"stage_by_id":stage_by_id,"scenario_map":scenario_map,"checks":checks}
def _utc_now():
	return _dt.datetime.now(_dt.timezone.utc).isoformat(timespec="microseconds").replace("+00:00","Z")
def _git(args,cwd):
	environment=dict(_os.environ)
	environment.update({"GIT_OPTIONAL_LOCKS":"0","LC_ALL":"C"})
	result=_sp.run(["git","-C",cwd,*args],stdin=_sp.DEVNULL,
stdout=_sp.PIPE,stderr=_sp.PIPE,
env=environment,timeout=30,check=False)
	if result.returncode!=0:
		raise _Invalid(f"git {' '.join(args)} failed: {result.stderr.decode('utf-8','replace').strip()}")
	return result.stdout
def _ac(storages):
	repo=_git(["rev-parse","--show-toplevel"],_ROOT).decode("utf-8").strip()
	if not _os.path.isabs(repo):
		raise _Invalid("x")
	head=_git(["rev-parse","HEAD"],repo).decode("ascii").strip()
	origin=_git(["rev-parse","refs/remotes/origin/main"],repo).decode("ascii").strip()
	if not _re.fullmatch(r"[0-9a-f]{40,64}",head)or head!=origin:
		raise _Invalid("x")
	relative=[]
	prefix=repo.rstrip(_os.sep)+_os.sep
	for name in _FILES:
		path=_os.path.join(_ROOT,name)
		if not path.startswith(prefix):
			raise _Invalid("x")
		item=path[len(prefix):].replace(_os.sep,"/")
		_git(["ls-files","--error-unmatch","--",item],repo)
		if _git(["cat-file","blob",f"HEAD:{item}"],repo)!=storages[name]:
			raise _Invalid(f"actual custody HEAD blob mismatch: {name}")
		relative.append(item)
	for declaration in _SHARED:
		name=declaration["successor_root_relative_path"]
		path=_os.path.join(_SU,name)
		_nal(path,f"shared authority {declaration['role']}")
		data=_rd(path,f"shared authority {declaration['role']} custody")
		if(_sha(data),len(data))!=(declaration["sha256"],declaration["bytes"]):
			raise _Invalid("x")
		if not path.startswith(prefix):
			raise _Invalid("x")
		item=path[len(prefix):].replace(_os.sep,"/")
		_git(["ls-files","--error-unmatch","--",item],repo)
		if _git(["cat-file","blob",f"HEAD:{item}"],repo)!=data:
			raise _Invalid(f"actual custody HEAD blob mismatch: {name}")
		relative.append(item)
	if _git(["status","--porcelain=v1","--untracked-files=all","--",*relative],repo):
		raise _Invalid("x")
	return{"mode":"ACTUAL_GIT_CUSTODY","required":True,"status":"PASS",
"head":head,"origin_main":origin,"tracked_component_count":4,
"tracked_shared_authority_count":3,
"scoped_clean":True,"head_blob_equal":True}
def _dir(path,label):
	try:
		info=_os.lstat(path)
	except FileNotFoundError as exc:
		raise _Invalid(f"{label}: missing directory")from exc
	if _stat.S_ISLNK(info.st_mode)or not _stat.S_ISDIR(info.st_mode):
		raise _Invalid(f"{label}: nonlink directory required")
def _er():
	value=_os.environ.get("PW_R9_EVIDENCE_ROOT")
	if not value or not _os.path.isabs(value)or ".." in _pl.PurePath(value).parts:
		raise _Invalid("x")
	root=_os.path.abspath(value)
	current=_pl.Path(root).anchor
	for part in _pl.Path(root).parts[1:]:
		current=_os.path.join(current,part)
		info=_os.lstat(current)
		if _stat.S_ISLNK(info.st_mode):
			raise _Invalid(f"evidence root symlink ancestor: {current}")
	_dir(root,"evidence root")
	return root
def _run_path(argument,evidence,create):
	if _os.path.isabs(argument):
		path=_os.path.abspath(argument)
		if _os.path.dirname(path)!=evidence:
			raise _Invalid("x")
		run_id=_os.path.basename(path)
	else:
		run_id=_name(argument,"run id")
		path=_os.path.join(evidence,run_id)
	_name(run_id,"run id")
	exists=_os.path.lexists(path)
	if create and exists:
		raise _Invalid("x")
	if not create:
		_dir(path,"run root")
	return _pl.Path(path)
def _rjson(path,label):
	data=_rd(str(path),label)
	return data,_lj(data,label,True)
def _ui(evidence):
	used=set()
	for name in sorted(_os.listdir(evidence)):
		path=_os.path.join(evidence,name)
		_dir(path,f"prior run {name}")
		run_path=_pl.Path(path)/"run.json"
		if not _os.path.lexists(run_path):
			raise _Invalid(f"prior run lacks run.json: {name}")
		_,run=_rjson(run_path,f"prior run {name}")
		rows=run.get("schedule")
		if not isinstance(rows,list):
			raise _Invalid(f"prior run schedule malformed: {name}")
		for row in rows:
			if not isinstance(row,dict):
				raise _Invalid("x")
			nonce=row.get("nonce")
			invocation=row.get("invocation_id")
			task=row.get("task_name")
			canonical_path=row.get("expected_canonical_task_path")
			if not isinstance(nonce,str)or not _HEX.fullmatch(nonce)or invocation!=f"r9-invocation:{nonce}"or task!=f"r9_{nonce}"or canonical_path!=f"/root/{task}":
				raise _Invalid("x")
			for value in(nonce,invocation,canonical_path):
				if value in used:
					raise _Invalid("x")
				used.add(value)
	return used
def _rows(run_id,run_kind,controls):
	if run_kind=="run-canary":
		selected=[(route,controls["cells"][0])for route in _ROUTES]
	else:
		selected=[(route,cell)for route in _ROUTES for cell in controls["cells"]]
	rows=[]
	for ordinal,(route,cell)in enumerate(selected):
		row_id=f"row-{ordinal:03d}"
		nonce_input=[run_id,ordinal,route["slot"],cell["cell"]]
		nonce=_sha(_canon(nonce_input))
		task_name=f"r9_{nonce}"
		rows.append({"row_id":row_id,"ordinal":ordinal,"slot":route["slot"],
"cell":cell["cell"],"index":ordinal,"nonce":nonce,
"invocation_id":f"r9-invocation:{nonce}","task_name":task_name,
"expected_canonical_task_path":f"/root/{task_name}"})
	expected=3 if run_kind=="run-canary" else 291
	if len(rows)!=expected or any(set(row)!=_RW or row["ordinal"]!=index or row["index"]!=index for index,row in enumerate(rows)):
		raise _Invalid("x")
	return rows
def _binding(root,path,kind,identity):
	data=_rd(str(path),f"causal {kind}/{identity}")
	return{"kind":kind,"id":identity,"path":path.relative_to(root).as_posix(),
"sha256":_sha(data),"bytes":len(data)}
def _stored(path,expected,label):
	data,value=_rjson(path,label)
	if value!=expected:
		raise _Invalid(f"{label}: deterministic value drift")
	return data
def _causal_inputs(root,slot,cell,
completions,
artifacts):
	refs=[]
	for cell_id in cell["dependency_gate"]["required_pass_cells"]:
		expected=completions.get((slot,cell_id))
		if expected is None or expected.get("status")!="PASS":
			raise _Invalid(f"required PASS cell unavailable: {slot}/{cell_id}")
		path=root/"rows"/expected["row_id"]/"completion.json"
		_stored(path,expected,f"PASS dependency {slot}/{cell_id}")
		refs.append(_binding(root,path,"PASS_CELL",cell_id))
	for stage_id in cell["dependency_gate"]["required_stage_artifacts"]:
		expected=artifacts.get((slot,stage_id))
		if expected is None:
			raise _Invalid(f"required stage unavailable: {slot}/{stage_id}")
		path=root/"artifacts"/slot/f"{stage_id}.json"
		_stored(path,expected,f"stage dependency {slot}/{stage_id}")
		refs.append(_binding(root,path,"STAGE_ARTIFACT",stage_id))
	refs.sort(key=lambda item:(item["kind"],item["id"],item["path"]))
	return refs
def _stage_inputs(root,slot,stage,
completions,
artifacts):
	refs=[]
	for cell_id in stage["direct_subject_cells"]:
		expected=completions.get((slot,cell_id))
		if expected is None or expected.get("status")!="PASS":
			return None
		path=root/"rows"/expected["row_id"]/"completion.json"
		_stored(path,expected,f"stage PASS input {slot}/{cell_id}")
		refs.append(_binding(root,path,"PASS_CELL",cell_id))
	for stage_id in stage["predecessor_stages"]:
		expected=artifacts.get((slot,stage_id))
		if expected is None:
			return None
		path=root/"artifacts"/slot/f"{stage_id}.json"
		_stored(path,expected,f"stage predecessor {slot}/{stage_id}")
		refs.append(_binding(root,path,"STAGE_ARTIFACT",stage_id))
	refs.sort(key=lambda item:(item["kind"],item["id"],item["path"]))
	return refs
def _finalize(root,row,cell,
controls,completions,
artifacts):
	slot=row["slot"]
	for stage in controls["stages"]:
		key=(slot,stage["stage"])
		if key in artifacts:
			_stored(root/"artifacts"/slot/f"{stage['stage']}.json",
artifacts[key],f"existing stage {slot}/{stage['stage']}")
			continue
		if stage["finalization_boundary"]["after_cell_index"]>cell["index"]:
			continue
		causal=_stage_inputs(root,slot,stage,completions,artifacts)
		if causal is None:
			continue
		payload=stage["expected_artifact_utf8"].encode("utf-8")
		envelope={
"schema_id":"pw-r9-stage-artifact-v1","run_id":root.name,
"slot":slot,"stage":stage["stage"],"index":stage["index"],
"rule":stage["rule"],"finalization_row_id":row["row_id"],
"finalization_ordinal":row["ordinal"],"causal_inputs":causal,
"artifact_payload_utf8":stage["expected_artifact_utf8"],
"artifact_payload_sha256":_sha(payload),"artifact_payload_bytes":len(payload),
"artifact_storage_sha256":_sha(payload+b"\n"),
"artifact_storage_bytes":len(payload)+1,
}
		if set(envelope)!=_STF or(envelope["artifact_payload_sha256"],envelope["artifact_payload_bytes"],envelope["artifact_storage_sha256"],envelope["artifact_storage_bytes"])!=(stage["expected_artifact_sha256"],stage["expected_artifact_bytes"],stage["expected_artifact_storage_sha256"],stage["expected_artifact_storage_bytes"]):
			raise _Invalid("x")
		_rr.record_stage(root,envelope)
		_stored(root/"artifacts"/slot/f"{stage['stage']}.json",envelope,
f"new stage {slot}/{stage['stage']}")
		artifacts[key]=envelope
class _Reader:
	def __init__(self):
		try:
			self.fd=_sys.stdin.fileno()
		except(AttributeError,OSError)as exc:
			raise _Invalid("x")from exc
		self.buffer=bytearray()
		self.eof=False
	def raw(self):
		while b"\n" not in self.buffer and len(self.buffer)<=_MAX:
			if self.eof:
				break
			part=_os.read(self.fd,65536)
			if not part:
				self.eof=True
			else:
				self.buffer.extend(part)
		if b"\n" in self.buffer:
			index=self.buffer.index(10)+1
			if index>_MAX:
				index=_MAX+1
			raw=bytes(self.buffer[:index])
			del self.buffer[:index]
			return raw
		if len(self.buffer)>_MAX:
			raw=bytes(self.buffer[:_MAX+1])
			del self.buffer[:_MAX+1]
			return raw
		raw=bytes(self.buffer)
		self.buffer.clear()
		return raw
	def reject_ready_extra(self):
		if self.buffer:
			raise _Invalid("x")
		if self.eof:
			return
		ready,_,_=_select.select([self.fd],[],[],0)
		if ready:
			extra=_os.read(self.fd,1)
			if extra:
				self.buffer.extend(extra)
				raise _Invalid("x")
			self.eof=True
	def require_eof(self):
		digest=_hh.sha256()
		count=len(self.buffer)
		digest.update(self.buffer)
		self.buffer.clear()
		while not self.eof:
			part=_os.read(self.fd,65536)
			if part:
				digest.update(part)
				count+=len(part)
			else:
				self.eof=True
		if count:
			raise _Invalid(f"trailing root bytes:{count}:{digest.hexdigest()}")
class _Polls:
	def __init__(self,groups):
		if not isinstance(groups,list):
			raise _Invalid("x")
		self.groups,self.index,self.poll_count=groups,0,0
	def poll(self):
		if self.index==len(self.groups):
			return None
		group=self.groups[self.index]
		self.index+=1
		self.poll_count+=1
		if not isinstance(group,list)or len(group)>1:
			raise _Invalid("x")
		return group
	def finish(self):
		if self.index!=len(self.groups):
			raise _Invalid("x")
def _event(raw,label):
	if not raw or len(raw)>_MAX or not raw.endswith(b"\n")or raw.endswith(b"\n\n")or b"\r" in raw or b"\n" in raw[:-1]:
		raise _Invalid(f"{label}: exact canonical line framing mismatch")
	return _lj(raw[:-1],label,False)
def _clean_activity():
	return{"tool_calls":0,"file_accesses":0,"browsing":0,"network_accesses":0,
"delegations":0,"memory_accesses":0,"followup_turns":0,
"nonterminal_messages":[],"observation_basis":"ROOT_VISIBLE_COLLABORATION_DELIVERIES"}
def _spawn_receipt(request):
	path=request["expected_canonical_task_path"]
	return{"schema_id":"pw-r9-subagent-spawn-receipt-event-v1",
"invocation_id":request["invocation_id"],"spawn_request_sha256":_sha(_canon(request)),
"tool_result":{"task_name":path},"returned_identity_kind":"canonical_task_path",
"returned_canonical_task_path":path}
def _delivery(request,final):
	return{"schema_id":"pw-r9-subagent-terminal-delivery-event-v1",
"invocation_id":request["invocation_id"],
"returned_canonical_task_path":request["expected_canonical_task_path"],
"message_type":"FINAL_ANSWER","final_utf8":final,
"observed_activity":_clean_activity(),"terminal_status":"FINAL_RETURNED"}
def _failure(request,phase,failure_type,detail):
	return{"schema_id":"pw-r9-subagent-transport-failure-event-v1",
"invocation_id":request["invocation_id"],"phase":phase,
"failure_type":failure_type,"detail":detail}
def _sg(request,scenario,oracle):
	if scenario=="missing_spawn":
		return[[_failure(request,"SPAWN_ATTEMPT","SPAWN_MISSING","synthetic spawn result was not returned")]]
	if scenario=="failed_spawn":
		return[[_failure(request,"SPAWN_ATTEMPT","SPAWN_FAILED","synthetic spawn failure")]]
	receipt=_spawn_receipt(request)
	if scenario=="wrong_path":
		receipt["returned_canonical_task_path"]="/root/synthetic-wrong-path"
		return[[receipt]]
	if scenario=="missing_output":
		return[[receipt],[_failure(request,"TERMINAL_DRAIN","TERMINAL_DELIVERY_MISSING","synthetic terminal delivery missing")]]
	final=oracle+"\n"
	if scenario=="malformed_output":
		final="{malformed-output"
	elif scenario=="partial_output":
		final=oracle[:max(1,len(oracle)//2)]
	delivery=_delivery(request,final)
	if scenario=="wrong_sender":
		delivery["returned_canonical_task_path"]="/root/synthetic-wrong-sender"
	elif scenario=="wrong_type":
		delivery["message_type"]="MESSAGE"
	activity={"observed_tool":"tool_calls","observed_file":"file_accesses",
"observed_browse":"browsing","observed_network":"network_accesses",
"observed_delegation":"delegations","observed_memory":"memory_accesses",
"observed_followup":"followup_turns"}
	if scenario in activity:
		delivery["observed_activity"][activity[scenario]]=1
	elif scenario=="observed_nonterminal":
		message="synthetic nonterminal message"
		encoded=message.encode("utf-8")
		delivery["observed_activity"]["nonterminal_messages"]=[{"sequence":1,
"message_type":"MESSAGE","utf8":message,"sha256":_sha(encoded),"bytes":len(encoded)}]
	if scenario=="delayed_multi_poll":
		return[[receipt],[],[],[delivery]]
	return[[receipt],[delivery]]
def _validate_spawn(value,request):
	path=request["expected_canonical_task_path"]
	if set(value)!=_SEF or value.get("schema_id")!="pw-r9-subagent-spawn-receipt-event-v1" or value.get("invocation_id")!=request["invocation_id"]or value.get("spawn_request_sha256")!=_sha(_canon(request))or value.get("tool_result")!={"task_name":path}or value.get("returned_identity_kind")!="canonical_task_path" or value.get("returned_canonical_task_path")!=path:
		raise _Invalid("x")
def _validate_activity(value):
	if not isinstance(value,dict)or set(value)!=_AF:
		raise _Invalid("x")
	prohibited=False
	for key in("tool_calls","file_accesses","browsing","network_accesses","delegations","memory_accesses","followup_turns"):
		prohibited=bool(_integer(value[key],f"activity {key}"))or prohibited
	messages=value["nonterminal_messages"]
	if not isinstance(messages,list):
		raise _Invalid("x")
	for sequence,message in enumerate(messages,1):
		if not isinstance(message,dict)or set(message)!={"sequence","message_type","utf8","sha256","bytes"}:
			raise _Invalid("x")
		data=_text(message["utf8"],"nonterminal message",False).encode("utf-8")
		if message["sequence"]!=sequence or isinstance(message["sequence"],bool)or message["message_type"]!="MESSAGE" or message["sha256"]!=_sha(data)or message["bytes"]!=len(data):
			raise _Invalid("x")
	if value["observation_basis"]!="ROOT_VISIBLE_COLLABORATION_DELIVERIES":
		raise _Invalid("x")
	return prohibited or bool(messages)
def _consume_terminal(value,request,cell):
	if set(value)!=_TF or value.get("schema_id")!="pw-r9-subagent-terminal-delivery-event-v1" or value.get("invocation_id")!=request["invocation_id"]or value.get("returned_canonical_task_path")!=request["expected_canonical_task_path"]or value.get("message_type")!="FINAL_ANSWER" or value.get("terminal_status")!="FINAL_RETURNED":
		raise _Invalid("x")
	raw=_text(value.get("final_utf8"),"terminal final_utf8",False).encode("utf-8")
	prohibited=_validate_activity(value.get("observed_activity"))
	if raw.endswith(b"\n"):
		normalized=raw[:-1]
		normalization="REMOVED_EXACTLY_ONE_FINAL_LF"
	else:
		normalized=raw
		normalization="PRESERVED_NO_FINAL_LF"
	expected=cell["expected_output_utf8"].encode("utf-8")
	returncode=86 if prohibited else 0
	if prohibited:
		verdict,reason="FAIL","PROHIBITED_ACTIVITY_AFTER_FINAL"
	elif normalized!=expected:
		verdict,reason="FAIL","EXACT_OUTPUT_MISMATCH"
	else:
		verdict,reason="PASS","EXACT_UTF8_MATCH"
	consumer={
"schema_id":"pw-r9-consumer-result-v1",
"transport":{"invocation_id":request["invocation_id"],
"canonical_task_path":request["expected_canonical_task_path"],
"terminal_status":"FINAL_RETURNED","message_type":"FINAL_ANSWER",
"observed_activity":value["observed_activity"],
"prohibited_activity":prohibited},
"result":{"normalization":normalization,"raw_final_sha256":_sha(raw),
"raw_final_bytes":len(raw),"normalized_utf8":normalized.decode("utf-8"),
"normalized_sha256":_sha(normalized),"normalized_bytes":len(normalized),
"returncode":returncode},
"score":{"rule":"EXACT_UTF8_REMOVE_AT_MOST_ONE_FINAL_LF","verdict":verdict,
"reason":reason,"expected_sha256":cell["expected_output_sha256"],
"expected_bytes":cell["expected_output_bytes"],"actual_sha256":_sha(normalized),
"actual_bytes":len(normalized),"returncode":returncode},
}
	return consumer,verdict
def _stop(_signum,_frame):
	global _STOP
	_STOP=True
def _admit(root,run,row,
cell,causal):
	packet=cell["render_utf8"].encode("utf-8")
	message=_INS+packet[:-1]
	route=next(item for item in _ROUTES if item["slot"]==row["slot"])
	attempt={"schema_id":"pw-r9-attempt-v4","run_id":root.name,
"run_kind":run["run_kind"],"mode":run["mode"],"row_id":row["row_id"],
"slot":row["slot"],"cell":row["cell"],"index":row["index"],
"ordinal":row["ordinal"],"nonce":row["nonce"],
"invocation_id":row["invocation_id"],"task_name":row["task_name"],
"expected_canonical_task_path":row["expected_canonical_task_path"],
"agent_type":"default","fork_turns":"none","model":route["model"],
"reasoning_effort":route["reasoning_effort"],"causal_inputs":causal,
"packet_sha256":_sha(packet),"packet_bytes":len(packet),
"message_sha256":_sha(message),"message_bytes":len(message),"attempt":1,
"retry_count":0,"best_of":False,"replacement_result":False,
"no_retry":True,"no_relaunch":True,"admission_state":"FUSED_BEFORE_SPAWN"}
	if set(attempt)!=_ATF:
		raise _Invalid("x")
	previous=_si.pthread_sigmask(_si.SIG_BLOCK,_SIGS)
	try:
		if _STOP or _SIGS.intersection(_si.sigpending()):
			return None
		request_bytes=_rr.admit_row(root,row["row_id"],packet,message,attempt)
	finally:
		_si.pthread_sigmask(_si.SIG_SETMASK,previous)
	request=_lj(request_bytes,"spawn request",False)
	if set(request)!=_SF:
		raise _Invalid("x")
	return request_bytes,request
def _process_row(root,run,row,
cell,controls,reader,
scenario,completions,
artifacts):
	causal=_causal_inputs(root,row["slot"],cell,completions,artifacts)
	admission=_admit(root,run,row,cell,causal)
	if admission is None:
		return "STOP"
	request_bytes,request=admission
	if reader is not None:
		_sys.stdout.buffer.write(request_bytes+b"\n")
		_sys.stdout.buffer.flush()
		spawn_raw=reader.raw()
		polls=None
	else:
		polls=_Polls(_sg(request,scenario,cell["expected_output_utf8"]))
		group=polls.poll()
		item=group[0]if group else None
		spawn_raw=_canon(item)+b"\n" if item is not None else b""
	try:
		spawn_identity=_rr.record_spawn(root,row["row_id"],spawn_raw)
	except Exception:
		if reader is not None:
			reader.reject_ready_extra()
		else:
			polls.finish()
		raise
	spawn_event=_event(spawn_raw,"spawn receipt")
	_validate_spawn(spawn_event,request)
	if reader is not None:
		terminal_raw=reader.raw()
	else:
		empty_polls=0
		while True:
			group=polls.poll()
			if group is None or group:
				break
			empty_polls+=1
		if empty_polls!=(2 if scenario=="delayed_multi_poll" else 0):
			raise _Invalid("x")
		item=group[0]if group else None
		terminal_raw=_canon(item)+b"\n" if item is not None else b""
	try:
		raw_identity=_rr.record_raw(root,row["row_id"],terminal_raw)
	except Exception:
		if reader is not None:
			reader.reject_ready_extra()
		else:
			polls.finish()
		raise
	terminal_event=_event(terminal_raw,"terminal delivery")
	consumer,verdict=_consume_terminal(terminal_event,request,cell)
	if reader is not None:
		reader.reject_ready_extra()
		observation={"kind":"ROOT_EVENT_LINE_READ","spawn_observations":1,"terminal_observations":1,"empty_terminal_observations":0}
	else:
		polls.finish()
		if scenario=="delayed_multi_poll" and polls.poll_count!=4:
			raise _Invalid("x")
		observation={"kind":"SYNTHETIC_EVENT_GROUP_POLL","spawn_observations":1,"terminal_observations":polls.poll_count-1,"empty_terminal_observations":empty_polls}
		expected_observation={"kind":"SYNTHETIC_EVENT_GROUP_POLL","spawn_observations":1,"terminal_observations":3 if scenario=="delayed_multi_poll" else 1,"empty_terminal_observations":2 if scenario=="delayed_multi_poll" else 0}
		if observation!=expected_observation:
			raise _Invalid("x")
	consumer["transport"]["transport_observation"]=observation
	completion={"schema_id":"pw-r9-completion-v4","run_id":root.name,
"row_id":row["row_id"],"attempt_sha256":request["attempt_sha256"],
"attempt_bytes":request["attempt_bytes"],"spawn_record_sha256":spawn_identity[0],
"spawn_record_bytes":spawn_identity[1],"raw_result_sha256":raw_identity[0],
"raw_result_bytes":raw_identity[1],"consumer_result":consumer,"status":verdict,
"attempt":1,"retry_count":0,"best_of":False,"replacement_result":False,
"completion_is_last_row_write":True}
	_rr.record_completion(root,row["row_id"],completion)
	_stored(root/"rows"/row["row_id"]/"completion.json",completion,
f"completion {row['row_id']}")
	completions[(row["slot"],row["cell"])]=completion
	if verdict=="PASS":
		_finalize(root,row,cell,controls,completions,artifacts)
	return verdict
def _expected(root,run,evidence,
identity,shared):
	return{"schema_id":"pw-r9-verifier-expectation-v4","run_id":root.name,
"run_kind":run["run_kind"],"planned_call_count":run["planned_call_count"],
"evidence_root":evidence,"current_component_identity":identity,
"shared_authorities":shared}
def _rrs(root,evidence,controls):
	run_bytes,run=_rjson(root/"run.json","run")
	if set(run)!=_RF or run.get("schema_id")!="pw-r9-run-v4" or run.get("run_id")!=root.name:
		raise _Invalid("x")
	_,matrix=_rjson(root/"matrix_terminal.json","matrix terminal")
	storages,current_identity,_=_sn()
	del storages
	shared=_au()
	report=_vr.verify(root,_expected(root,run,evidence,current_identity,shared))
	if not isinstance(report,dict)or not isinstance(report.get("valid"),bool):
		raise _Invalid("x")
	matrix_status=matrix.get("status")
	status=matrix_status if report["valid"]else "CONTROLLER_INVALID"
	if status not in{"PASS","VALID_SUBJECT_FAIL","STOPPED_AFTER_DRAIN","CONTROLLER_INVALID"}:
		status="CONTROLLER_INVALID"
	return{"schema_id":"pw-r9-reopen-result-v4","run_id":root.name,
"run_sha256":_sha(run_bytes),"run_bytes":len(run_bytes),"status":status,
"matrix_status":matrix_status,"offline_verifier":report}
def _execute(run_kind,run_argument,requested_scenario):
	global _STOP
	controls=_ct()
	scenario=controls["scenario_map"].get(requested_scenario)
	if run_kind=="simulate" and scenario is None:
		raise _Invalid("x")
	evidence=_er()
	root=_run_path(run_argument,evidence,True)
	used=_ui(evidence)
	rows=_rows(root.name,run_kind,controls)
	planned=[value for row in rows for value in(row["nonce"],row["invocation_id"],row["expected_canonical_task_path"])]
	if len(set(planned))!=len(planned)or any(value in used for value in planned):
		raise _Invalid("x")
	mode="synthetic" if run_kind=="simulate" else "actual"
	storages,current_identity,current_provenance=_sn()
	if current_identity!=controls["identity"]:
		raise _Invalid("x")
	custody=({"mode":"SYNTHETIC_PRECOMMIT_ALLOWED","required":False,
"qualification_credit":0,"current_git_custody_reported_by_verifier":True}
if mode=="synthetic" else _ac(storages))
	cells_per_route=1 if run_kind=="run-canary" else 97
	run={"schema_id":"pw-r9-run-v4","run_id":root.name,"run_kind":run_kind,
"mode":mode,"scenario":requested_scenario if mode=="synthetic" else None,
"created_utc":_utc_now(),"component_identity":current_identity,
"component_provenance":current_provenance,"shared_authorities":controls["shared"],
"routes":[dict(item)for item in _ROUTES],"schedule":rows,"route_count":3,
"cells_per_route":cells_per_route,"cell_count":97,
"planned_call_count":len(rows),"stage_count":18,
"required_clean_stage_artifact_count":54 if len(rows)==291 else 0,
"regression_family_count":22,"regression_variant_count":56,
"global_fault_count":10,"semantic_counterfactual_count":7,
"retry_count":0,"best_of":False,"replacement_count":0,"custody":custody}
	if set(run)!=_RF:
		raise _Invalid("x")
	_STOP=False
	_si.signal(_si.SIGINT,_stop)
	_si.signal(_si.SIGTERM,_stop)
	_rr.create_run(root,run)
	reader=_Reader()if mode=="actual" else None
	cause=None
	failed_slots=set()
	completions={}
	artifacts={}
	for row in rows:
		if _STOP:
			cause={"kind":"STOPPED_AFTER_DRAIN","detail":"signal before next admission"}
			break
		if row["slot"]in failed_slots:
			continue
		cell=controls["cell_by_id"][row["cell"]]
		try:
			verdict=_process_row(root,run,row,cell,controls,reader,scenario or "clean",
completions,artifacts)
			if verdict=="STOP":
				cause={"kind":"STOPPED_AFTER_DRAIN","detail":"signal pending before admission fuse"}
				break
			if verdict=="FAIL":
				failed_slots.add(row["slot"])
		except Exception as exc:
			cause={"kind":"CONTROLLER_INVALID",
"detail":f"ROW_{row['ordinal']}_INVALID:{type(exc).__name__}:{exc}"}
			break
		if _STOP:
			cause={"kind":"STOPPED_AFTER_DRAIN",
"detail":"signal drained admitted receipt and terminal chain durably"}
			break
	if reader is not None:
		try:
			reader.require_eof()
		except Exception as exc:
			cause={"kind":"CONTROLLER_INVALID","detail":f"ROOT_EOF_INVALID:{type(exc).__name__}:{exc}"}
	previous=_si.pthread_sigmask(_si.SIG_BLOCK,_SIGS)
	try:
		stopped=_STOP or bool(_SIGS.intersection(_si.sigpending()))
		if stopped and(cause is None or cause.get("kind")!="CONTROLLER_INVALID"):
			cause={"kind":"STOPPED_AFTER_DRAIN","detail":"signal at terminal decision boundary"}
		_rr.seal_run(root,cause)
	finally:
		_si.pthread_sigmask(_si.SIG_SETMASK,previous)
	return _rrs(root,evidence,controls)
def _parse(argv):
	if not argv or argv[0]not in{"simulate","run-canary","run-matrix","reopen"}:
		raise _Invalid("x")
	command=argv[0]
	options={"command":command}
	index=1
	while index<len(argv):
		option=argv[index]
		if option=="--check-only" and command=="simulate" and "check_only" not in options:
			options["check_only"]=True
			index+=1
			continue
		if option in{"--run-root","--scenario"}and option[2:].replace("-","_")not in options and index+1<len(argv):
			key=option[2:].replace("-","_")
			options[key]=argv[index+1]
			index+=2
			continue
		raise _Invalid(f"invalid or duplicate option: {option}")
	if options.get("check_only"):
		if set(options)!={"command","check_only"}:
			raise _Invalid("x")
	elif command=="simulate":
		if set(options)!={"command","run_root","scenario"}:
			raise _Invalid("x")
	elif set(options)!={"command","run_root"}:
		raise _Invalid(f"{command} requires only --run-root")
	return options
def main(argv=None):
	try:
		options=_parse(list(_sys.argv[1:]if argv is None else argv))
		command=str(options["command"])
		if options.get("check_only"):
			controls=_ct()
			checks=controls["checks"]
			result={"schema_id":"pw-r9-control-check-v4","status":"PASS",
"spawn_requests":0,"root_events_read":0,"evidence_writes":0,
"provider_calls":0,"subject_calls":0,"collaboration_calls":0,
"network_calls":0,"routes":3,"cells":97,"matrix_rows":291,
"deterministic_stages_per_route":18,"required_clean_stage_artifacts":54,
"regression_families":22,"regression_variants":56,"global_faults":10,
"semantic_projections":checks["semantic_projections"],
"leakage_scans":checks["leakage_scans"],
"self_attestation_rejected":checks["self_attestation_rejected"],
"component_identity":controls["identity"],"qualification_credit":0}
		elif command=="reopen":
			controls=_ct()
			evidence=_er()
			result=_rrs(_run_path(str(options["run_root"]),evidence,False),
evidence,controls)
		else:
			result=_execute(command,str(options["run_root"]),
str(options.get("scenario","actual")))
		_sys.stdout.buffer.write(_canon(result)+b"\n")
		_sys.stdout.buffer.flush()
		if result.get("status")=="PASS":
			return 0
		if result.get("status")=="VALID_SUBJECT_FAIL":
			return 1
		return 2
	except Exception as exc:
		error={"schema_id":"pw-r9-runner-error-v1","status":"CONTROLLER_INVALID",
"error_type":type(exc).__name__,"error":str(exc)}
		_sys.stdout.buffer.write(_canon(error)+b"\n")
		_sys.stdout.buffer.flush()
		return 2
if __name__=="__main__":
	raise SystemExit(main())
