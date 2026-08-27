import sys as _sys
_sys.dont_write_bytecode=True
import base64 as _b64
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
"runner.py":("PROCESS_RUNNER",80000),
"evidence_recorder.py":("APPEND_ONLY_EVIDENCE_RECORDER",85000),
"offline_verifier.py":("OFFLINE_VERIFIER",130000),
}
_PINS={
"semantic_bundle.json":("627e1843087aab37707909fe2416bb5d2d99c989a58eaf21dee977cf57b429ed",812299),
"evidence_recorder.py":("e33a3918b56955e34c3f5ef19bfa5fc4a83928e95cc177edf4f141e4c1aad582",83958),
"offline_verifier.py":("aa13d6edaf79b06a90074ca9d1a64c77976037e526b17f976e11f34be70b3cf0",129263),
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
{"bytes":7024,"role":"OPERATING_CONTRACT_GENERAL_SCOPE","sha256":"764dd27b3f472a90eef0f8493e63ac8fb349fe05a3a97dc4673a4a835e6e8dbd","successor_root_relative_path":"r9_goal_operating_contract_v1.json"},
{"bytes":10393,"role":"CODEX_CLI_TRANSPORT_USER_ADJUDICATION","sha256":"d10e90ab5d7d325c243352f758f5adc7c2ca6f71c3853779cb61e3643a54a7eb","successor_root_relative_path":"r9_control_plane_stabilization_v1/r9_codex_cli_transport_user_adjudication_v2.json"},
]
_TP=set("schema_id role format lineage shared_authorities routes cells stage_order deterministic_stages schedule transport evidence_contract synthetic_scenarios regressions counterfactuals nonclaims".split())
_RF=set("schema_id run_id run_kind mode scenario created_utc component_identity component_provenance shared_authorities shared_authority_count routes schedule route_count cells_per_route cell_count planned_call_count stage_count required_clean_stage_artifact_count regression_family_count regression_variant_count global_fault_count semantic_counterfactual_count transport_kind session_reuse retry_count relaunch_count best_of replacement_count public_commands custody seal_epoch seal_protocol_schema_id seal_scratch_name host_capture_frame_schema_id host_capture_result_schema_id host_transaction_derivation external_host_binding_required component_qualification_credit sequential_run_policy".split())
_RW=set("row_id ordinal slot cell index nonce invocation_id task_name logical_task_path".split())
_ATF=set("schema_id run_id run_kind mode row_id slot cell index ordinal nonce invocation_id task_name logical_task_path transport_kind session_reuse model reasoning_effort causal_inputs packet_sha256 packet_bytes message_sha256 message_bytes attempt retry_count relaunch_count best_of replacement_result no_retry no_relaunch admission_state".split())
_COF=set("schema_id run_id row_id attempt_sha256 attempt_bytes host_spawn_request_sha256 host_spawn_request_bytes host_capture_frame_sha256 host_capture_frame_bytes host_capture_result_sha256 host_capture_result_bytes consumer_result status cli_thread_id lifecycle_digest component_qualification_credit external_gate_eligible attempt retry_count relaunch_count best_of replacement_result session_reuse completion_is_last_row_write".split())
_STF=set("schema_id run_id slot stage index rule finalization_row_id finalization_ordinal causal_inputs artifact_payload_utf8 artifact_payload_sha256 artifact_payload_bytes artifact_storage_sha256 artifact_storage_bytes".split())
_SF=set("schema_id run_id run_kind mode row_id slot cell index ordinal nonce invocation_id task_name logical_task_path transport_kind session_reuse model reasoning_effort packet_sha256 packet_bytes message_sha256 message_bytes attempt_sha256 attempt_bytes".split())
_AF=set("tool_calls file_accesses browsing network_accesses delegations memory_accesses followup_turns nonterminal_messages observation_basis".split())
_HF=set("schema_id host_transaction_id spawn_request executable launch process captures".split())
_HR=set("schema_id host_transaction_id frame_sha256 frame_bytes process_disposition cli_thread_id lifecycle_digest lifecycle_status final activity stderr_sha256 stderr_bytes qualification_credit".split())
_SCS=(
"clean","observed_tool","observed_file","observed_browse","observed_network",
"observed_delegation","observed_memory","observed_followup","observed_nonterminal",
"missing_spawn","failed_spawn","wrong_path","wrong_sender","wrong_type",
"malformed_output","partial_output","missing_output","delayed_multi_poll",
)
_MAX=4*1024*1024
_SAFE=_re.compile(r"[A-Za-z0-9][A-Za-z0-9_.-]{0,191}\Z")
_HEX=_re.compile(r"[0-9a-f]{64}\Z")
_UUID=_re.compile(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\Z")
_STOP=False
_SIGS={_si.SIGINT,_si.SIGTERM}
class _Invalid(RuntimeError):
	pass
class _Busy(RuntimeError):
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
	if _os.path.basename(parent)!="r9_control_plane_stabilization_v1" or not(leaf=="iteration_012" or _re.fullmatch(r"formal_candidate_v[1-9][0-9]*",leaf)):
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
	for name,identity in _PINS.items():
		if(_sha(storages[name]),len(storages[name]))!=identity:
			raise _Invalid(f"component {name}: pinned identity mismatch")
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
	module_name=f"_pw_r9_iteration_012_{name}"
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
if tuple(getattr(_rr,"__all__",()))!=("begin_run",):
	raise _Invalid("x")
if not callable(getattr(_vr,"reopen",None)):
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
	if set(bundle)!=_TP or bundle.get("schema_id")!="pw-r9-immutable-semantic-bundle-v4" or bundle.get("role")!="IMMUTABLE_SEMANTIC_BUNDLE":
		raise _Invalid("x")
	lineage=_canon(bundle.get("lineage"))
	if(len(lineage),_sha(lineage))!=(10809,"f27ad5085d8aa33997a6f51163cddf635700ed0912a2c91225eafa3242e23074"):
		raise _Invalid("x")
	shared=_au()
	if bundle.get("shared_authorities")!=shared or bundle.get("routes")!=_ROUTES:
		raise _Invalid("x")
	transport=bundle.get("transport")
	if(len(_canon(transport)),_sha(_canon(transport)))!=(5698,"45686345ccf7d2d8b55a986c54210d7aef57f866809509d3943ff38931a00fa1"):
		raise _Invalid("x")
	transport_fields=set("actual_transaction_host cli_invocation component_qualification_credit family host_capture_result host_frame host_transaction_derivation instruction_bytes instruction_sha256 instruction_utf8 lifecycle_parser logical_compatibility_labels no_recovery observation_basis subject_visible_view synthetic_mode transport_kind uniqueness valid_actual_transport".split())
	if not isinstance(transport,dict)or set(transport)!=transport_fields:
		raise _Invalid("x")
	if transport.get("transport_kind")!="HOST_BOUND_RAW_CODEX_CLI_TRANSACTION_V1"or transport.get("component_qualification_credit")!=0 or transport.get("no_recovery")!={"best_of":False,"relaunch_count":0,"replacement_count":0,"retry_count":0,"session_reuse":False}:
		raise _Invalid("x")
	if transport.get("instruction_utf8")!=_INS.decode("utf-8")or transport.get("instruction_sha256")!=_sha(_INS)or transport.get("instruction_bytes")!=174:
		raise _Invalid("x")
	if transport.get("host_frame")!={"framing":"ONE_CANONICAL_OPAQUE_HOST_FRAME_JSON_OBJECT_PLUS_EXACTLY_ONE_LF_PER_ROW","runner_parse_owner":"PROCESS_RUNNER_INDEPENDENT_PARSE","schema_id":"pw-r9-host-capture-frame-v1","store_exact_including_lf_before_parse":True,"verifier_parse_owner":"OFFLINE_VERIFIER_INDEPENDENT_REPARSE"}:
		raise _Invalid("x")
	if transport.get("host_transaction_derivation")!={"canonical_spawn_request_terminal_lf":False,"digest":"sha256","formula":"sha256(b'PW_R9_HOST_TRANSACTION_V1\\0' + canonical_spawn_request_bytes_without_lf)","host_transaction_id_prefix":"r9-host-tx:","prefix_base64":"UFdfUjlfSE9TVF9UUkFOU0FDVElPTl9WMQA="}:
		raise _Invalid("x")
	if transport.get("observation_basis")!="ROOT_VISIBLE_CODEX_EXEC_JSONL_V0_148_0"or transport.get("synthetic_mode",{}).get("schema_id")!="pw-r9-synthetic-host-capture-frame-v1"or transport.get("cli_invocation",{}).get("start_count")!=1:
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
	if(len(_canon(contract)),_sha(_canon(contract)))!=(31196,"637279b1c2a67fa64bfcfbc13f70de5ab3873115d2b1de16e699d5217d7ab2df"):
		raise _Invalid("x")
	contract_fields=set("canonical_json_storage counterfactual_projection_contract dependency_gate durability external_qualification_gate failure_prefixes global_uniqueness_verification permanent_invalid_rule public_recovery raw_capture record_shapes recorder_component reopen row_inventory row_storage schedule_contract schema_ids schema_ownership scoring seal_transaction stage_finalization terminal_distinctions terminal_order transport_vocabulary write_order".split())
	if set(contract)!=contract_fields:
		raise _Invalid("x")
	schedule_contract=contract["schedule_contract"]
	row_rule={"collision_rule":"exactly one row_id per declared ordinal","format":"row-<ordinal:03d>","function_id":"pw-r9-row-id-v1","ordinal_base":0,"ordinal_range_by_run":{"run-canary":[0,2],"run-matrix":[0,290],"simulate":[0,290]}}
	nonce_rule={"algorithm":"sha256_canonical_utf8_tuple","function_id":"pw-r9-dispatch-nonce-v1","inputs":["run_id","schedule_index","slot","cell"],"predeclared_in_run_manifest":True,"semantic_manifest_contains_run_specific_nonce":False}
	ownership={"EXTERNAL_HOST_QUALIFICATION_GATE":"outside run root and sole qualification authority","EXTERNAL_TRANSACTION_HOST":"reports one opaque canonical host frame per actual row and receives zero component credit","IMMUTABLE_SEMANTIC_BUNDLE":"owns closed record shapes, schema IDs, lifecycle rules, and deterministic seal recipes","LIVE_SESSION_EVIDENCE_RECORDER":"owns all mutation through begin_run returned bound methods and one monolithic session.seal call","OFFLINE_VERIFIER":"independently reparses frames, rederives lifecycle and identities, and performs lock-set global uniqueness scan","PROCESS_RUNNER":"stores frame before parse, independently parses, routes exactly four commands, and never projects trusted spawn or terminal events","forbidden":["module-level existing-root mutator","attach","resume","recover","caller-projected CLI event evidence","proof authority from host frame"]}
	if schedule_contract.get("planned_rows")!={"run-canary":3,"run-matrix":291,"simulate":291}or schedule_contract.get("row_id_rule")!=row_rule or schedule_contract.get("nonce_rule")!=nonce_rule or contract.get("schema_ownership")!=ownership:
		raise _Invalid("x")
	row_files=["packet.txt","cli_stdin.txt","attempt.json","host_spawn_request.json","host_capture_frame.json","host_capture_result.json","completion.json"]
	public={"closed":True,"commands":["simulate","run-canary","run-matrix","reopen"],"no_admitted_state":True,"only_complete_may_be_external_gate_eligible":True,"public_recover":False,"public_resume":False,"reopen":{"read_only":True,"writes":False},"states":["BUSY_NO_WRITE","INCOMPLETE_CONSUMED_ZERO_CREDIT","COMPLETE_SCRATCH_CLEANUP_PENDING","COMPLETE","INVALID"],"surface_count":4}
	if contract.get("row_inventory")!=row_files or contract.get("write_order")!=row_files or contract.get("public_recovery")!=public or contract.get("raw_capture")!={"artifact":"host_capture_frame.json","framing":"one canonical opaque host frame line including exactly one LF","fsync_before_parse":True,"runner_parse":"independent","verifier_reparse":"independent","write_before_parse":True}:
		raise _Invalid("x")
	schemas={"accounting":"pw-r9-accounting-v5","attempt":"pw-r9-attempt-v6","completion":"pw-r9-completion-v6","consumer_result":"pw-r9-consumer-result-v3","host_capture_frame":"pw-r9-host-capture-frame-v1","host_capture_result":"pw-r9-host-capture-result-v1","host_spawn_request":"pw-r9-host-spawn-request-v1","matrix_terminal":"pw-r9-matrix-terminal-v5","path_terminal":"pw-r9-path-terminal-v5","reopen_result":"pw-r9-reopen-result-v6","run":"pw-r9-run-v7","runner_error":"pw-r9-runner-error-v2","seal_artifact_envelope":"pw-r9-seal-artifact-envelope-v1","seal_cursor":"pw-r9-seal-cursor-v1","seal_intent":"pw-r9-seal-intent-v1","seal_lock":"pw-r9-seal-lock-v1","seal_plan":"pw-r9-seal-plan-v1","seal_source_projection":"pw-r9-seal-source-projection-v1","seal_transaction_catalog":"pw-r9-seal-transaction-catalog-v2","stage":"pw-r9-stage-artifact-v1","synthetic_host_capture_frame":"pw-r9-synthetic-host-capture-frame-v1"}
	if contract.get("schema_ids")!=schemas:
		raise _Invalid("x")
	shapes=contract.get("record_shapes")
	shape_names=set("ACCOUNTING_V5 ATTEMPT_V6 BLOB_V1 COMPLETION_V6 CONSUMER_RESULT_V3 HOST_CAPTURE_FRAME_V1 HOST_CAPTURE_RESULT_V1 HOST_SPAWN_REQUEST_V1 LIFECYCLE_PROJECTION_ENTRY_V1 MATRIX_TERMINAL_V5 OPTIONAL_OUTPUT_BLOB_V1 PATH_TERMINAL_V5 REOPEN_RESULT_V6 RESIDUAL_GROUP_V1 RUN_V7 SCHEDULE_ROW SEAL_TRANSACTION_CATALOG_V2 SIGNAL_EVENT_V1 SYNTHETIC_HOST_CAPTURE_FRAME_V1 closed derivation".split())
	if not isinstance(shapes,dict)or set(shapes)!=shape_names or shapes.get("closed")is not True or set(shapes["RUN_V7"]["exact_fields"])!=_RF or set(shapes["SCHEDULE_ROW"]["exact_fields"])!=_RW or set(shapes["ATTEMPT_V6"]["exact_fields"])!=_ATF or set(shapes["COMPLETION_V6"]["exact_fields"])!=_COF or set(shapes["HOST_SPAWN_REQUEST_V1"]["exact_fields"])!=_SF or set(shapes["HOST_CAPTURE_FRAME_V1"]["exact_fields"])!=_HF or set(shapes["HOST_CAPTURE_RESULT_V1"]["exact_fields"])!=_HR:
		raise _Invalid("x")
	consumer_shape=shapes["CONSUMER_RESULT_V3"]
	if set(consumer_shape["exact_fields"])!={"schema_id","transport","result","score"}or set(consumer_shape["transport"]["exact_fields"])!={"host_transaction_id","transport_kind","cli_thread_id","lifecycle_digest","process_disposition","activity","prohibited_activity"}:
		raise _Invalid("x")
	run_constants={"best_of":False,"component_qualification_credit":0,"external_host_binding_required":{"actual":True,"synthetic":False},"host_capture_frame_schema_id":"pw-r9-host-capture-frame-v1","host_capture_result_schema_id":"pw-r9-host-capture-result-v1","host_transaction_derivation":"SHA256_PREFIX_PLUS_CANONICAL_HOST_SPAWN_REQUEST_BYTES_NO_LF","public_commands":["simulate","run-canary","run-matrix","reopen"],"relaunch_count":0,"replacement_count":0,"retry_count":0,"schema_id":"pw-r9-run-v7","sequential_run_policy":"FRESH_EVIDENCE_ROOT_NO_ACTUAL_CONCURRENCY","session_reuse":False,"shared_authority_count":2,"transport_kind":"HOST_BOUND_RAW_CODEX_CLI_TRANSACTION_V1"}
	if shapes["RUN_V7"].get("constants")!=run_constants:
		raise _Invalid("x")
	seal=contract.get("seal_transaction")
	if(len(_canon(seal)),_sha(_canon(seal)))!=(4623,"caddd0b0a020b59c83f019bc494d56292862b9f833d8a7f47edb88ff81af5238"):
		raise _Invalid("x")
	seal_fields=set("artifact_order audit_only_artifact_ids calls catalog_id closed dependency_ref envelope family post_accounting_scratch_cleanup publisher_constants recipe_catalog_id recovery runtime_ownership seal_invocation source_projection_row terminal_rule".split())
	if not isinstance(seal,dict)or set(seal)!=seal_fields or seal.get("catalog_id")!="pw-r9-seal-transaction-catalog-v2" or seal.get("recipe_catalog_id")!="pw-r9-seal-recipe-catalog-v2" or seal.get("closed")is not True or seal.get("recovery")is not False or seal.get("seal_invocation")!="ONE_SESSION_SEAL_CALL"or seal.get("calls")!={"collaboration":0,"model":0,"provider":0,"subject":0}:
		raise _Invalid("x")
	paths=("seal_intent.json","seal_plan.json","terminals/slot-alpha.json","cursors/000.json","terminals/slot-bravo.json","cursors/001.json","terminals/slot-charlie.json","cursors/002.json","matrix_terminal.json","cursors/003.json","accounting.json")
	payload_schemas=("pw-r9-seal-intent-v1","pw-r9-seal-plan-v1","pw-r9-path-terminal-v5","pw-r9-seal-cursor-v1","pw-r9-path-terminal-v5","pw-r9-seal-cursor-v1","pw-r9-path-terminal-v5","pw-r9-seal-cursor-v1","pw-r9-matrix-terminal-v5","pw-r9-seal-cursor-v1","pw-r9-accounting-v5")
	artifacts=seal.get("artifact_order")
	if not isinstance(artifacts,list)or len(artifacts)!=11:
		raise _Invalid("x")
	for index,item in enumerate(artifacts):
		artifact_id=f"a{index:02d}"
		expected={"artifact_id":artifact_id,"artifact_index":index,"dependencies":[f"a{prior:02d}"for prior in range(index)],"path":paths[index],"payload_schema_id":payload_schemas[index],"recipe_id":f"pw-r9-seal-recipe-a{index:02d}-v2"}
		if item!=expected:
			raise _Invalid("x")
	if seal.get("dependency_ref")!={"required_fields":["artifact_id","path","sha256","bytes"]}or seal.get("envelope")!={"required_fields":["schema_id","artifact_id","artifact_index","run_id","seal_epoch","recipe_id","dependencies","payload"],"schema_id":"pw-r9-seal-artifact-envelope-v1"}or seal.get("source_projection_row")!={"required_fields":["path","kind","mode","sha256","bytes"],"schema_id":"pw-r9-seal-source-projection-v1"}:
		raise _Invalid("x")
	runtime={"executable_mutation_owner":"LIVE_SESSION_EVIDENCE_RECORDER_BOUND_METHODS","external_qualification_owner":"SEPARATE_EXTERNAL_HOST_QUALIFICATION_GATE","independent_validation_owner":"OFFLINE_VERIFIER_CODE","seal_owner":"ONE_SESSION_SEAL_CALL"}
	recorder=contract.get("recorder_component",{})
	if recorder.get("public_api")!={"exact_python_tuple":"(begin_run,)","python___all__":["begin_run"]}or recorder.get("seal",{}).get("signature")!="session.seal(cause)"or seal.get("runtime_ownership")!=runtime or seal.get("terminal_rule")!={"artifact_id":"a10","last":True,"no_post_accounting_run_root_writes":True,"successor_artifact_id":None}or contract.get("terminal_order")!=list(paths):
		raise _Invalid("x")
	return{"bundle":bundle,"identity":identity,"provenance":provenance,"shared":shared,
"cells":cells,"cell_by_id":cell_by_id,"stages":stages,
"stage_by_id":stage_by_id,"scenario_map":scenario_map,"checks":checks}
def _utc_now():
	return _dt.datetime.now(_dt.timezone.utc).isoformat(timespec="microseconds").replace("+00:00","Z")
def _git(args,cwd):
	environment=dict(_os.environ)
	environment.pop("GIT_REPLACE_REF_BASE",None)
	environment.update({"GIT_NO_REPLACE_OBJECTS":"1","GIT_OPTIONAL_LOCKS":"0","LC_ALL":"C"})
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
	def refs():
		values=_git(["rev-parse","HEAD","refs/remotes/origin/main"],repo).decode("ascii").splitlines()
		if len(values)!=2:
			raise _Invalid("x")
		return values
	def head_blob(item):
		entry=_git(["ls-tree","-z",head,"--",item],repo)
		if not entry.endswith(b"\0")or b"\0" in entry[:-1]:
			raise _Invalid(f"actual custody non-blob HEAD entry: {item}")
		metadata,separator,path=entry[:-1].partition(b"\t")
		fields=metadata.split()
		if separator!=b"\t" or len(fields)!=3 or fields[0]not in{b"100644",b"100755"}or fields[1]!=b"blob" or path!=item.encode("utf-8")or not _re.fullmatch(rb"[0-9a-f]{40,64}",fields[2]):
			raise _Invalid(f"actual custody non-blob HEAD entry: {item}")
		return _git(["cat-file","blob",fields[2].decode("ascii")],repo)
	head,origin=refs()
	if not _re.fullmatch(r"[0-9a-f]{40,64}",head)or head!=origin:
		raise _Invalid("x")
	if _git(["cat-file","-t",head],repo)!=b"commit\n":
		raise _Invalid("x")
	relative=[]
	prefix=repo.rstrip(_os.sep)+_os.sep
	for name in _FILES:
		path=_os.path.join(_ROOT,name)
		if not path.startswith(prefix):
			raise _Invalid("x")
		item=path[len(prefix):].replace(_os.sep,"/")
		if head_blob(item)!=storages[name]:
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
		if head_blob(item)!=data:
			raise _Invalid(f"actual custody HEAD blob mismatch: {name}")
		relative.append(item)
	if _git(["status","--porcelain=v1","--untracked-files=all","--",*relative],repo):
		raise _Invalid("x")
	if refs()!=[head,origin]:
		raise _Invalid("x")
	return{"mode":"ACTUAL_GIT_CUSTODY","required":True,"status":"PASS",
"head":head,"origin_main":origin,"tracked_component_count":4,
"tracked_shared_authority_count":2,
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
	if _re.fullmatch(r"seal-staging-[0-9a-f]{64}",run_id):
		raise _Invalid("reserved seal scratch name cannot be a run id")
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
	scratch=set()
	for name in sorted(_os.listdir(evidence)):
		path=_os.path.join(evidence,name)
		if _re.fullmatch(r"seal-staging-[0-9a-f]{64}",name):
			_dir(path,f"seal scratch {name}")
			scratch.add(name)
			continue
		_dir(path,f"prior run {name}")
		run_path=_pl.Path(path)/"run.json"
		if not _os.path.lexists(run_path):
			raise _Invalid(f"prior run lacks run.json: {name}")
		_,run=_rjson(run_path,f"prior run {name}")
		if run.get("schema_id")=="pw-r9-run-v7":
			epoch=_sha(_canon([name,"pw-r9-v8-seal-epoch-v1"]))
			expected=f"seal-staging-{epoch}"
			if run.get("run_id")!=name or run.get("seal_epoch")!=epoch or run.get("seal_scratch_name")!=expected:
				raise _Invalid(f"prior V7 seal identity malformed: {name}")
		rows=run.get("schedule")
		if not isinstance(rows,list):
			raise _Invalid(f"prior run schedule malformed: {name}")
		for row in rows:
			if not isinstance(row,dict):
				raise _Invalid("x")
			nonce=row.get("nonce")
			invocation=row.get("invocation_id")
			task=row.get("task_name")
			logical_path=row.get("logical_task_path")
			if not isinstance(nonce,str)or not _HEX.fullmatch(nonce)or invocation!=f"r9-invocation:{nonce}"or task!=f"r9_{nonce}"or logical_path!=f"/root/{task}":
				raise _Invalid("x")
			for value in(nonce,invocation,logical_path):
				if value in used:
					raise _Invalid("x")
				used.add(value)
			frame_path=_pl.Path(path)/"rows"/str(row.get("row_id"))/"host_capture_frame.json"
			if run.get("mode")=="actual"and _os.path.lexists(frame_path):
				frame=_event(_rd(str(frame_path),f"prior host frame {name}/{row.get('row_id')}"),"prior host frame")
				if set(frame)!=_HF or frame.get("schema_id")!="pw-r9-host-capture-frame-v1": raise _Invalid("prior actual host frame malformed")
				tx=_text(frame.get("host_transaction_id"),"prior host transaction")
				captures=frame.get("captures")
				if not isinstance(captures,dict)or set(captures)!={"stdout_jsonl","stderr","output_last_message"}: raise _Invalid("prior captures malformed")
				thread,_,_,_=_lifecycle(_blob(captures["stdout_jsonl"],"prior stdout JSONL"))
				for value in(tx,thread):
					if value in used: raise _Invalid("prior actual host/thread collision")
					used.add(value)
	if scratch:
		raise _Invalid("prior seal scratch consumes sequential evidence root")
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
"logical_task_path":f"/root/{task_name}"})
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
def _finalize(session,root,row,cell,
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
		session.write_stage_artifact(envelope)
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
def _event(raw,label):
	if not raw or len(raw)>_MAX or not raw.endswith(b"\n")or raw.endswith(b"\n\n")or b"\r" in raw or b"\n" in raw[:-1]:
		raise _Invalid(f"{label}: exact canonical line framing mismatch")
	return _lj(raw[:-1],label,False)
def _clean_activity():
	return{"tool_calls":0,"file_accesses":0,"browsing":0,"network_accesses":0,
"delegations":0,"memory_accesses":0,"followup_turns":0,
"nonterminal_messages":[],"observation_basis":"ROOT_VISIBLE_CODEX_EXEC_JSONL_V0_148_0"}
def _blob(value,label,optional=False):
	fields={"state","base64","sha256","bytes"}if optional else{"base64","sha256","bytes"}
	if not isinstance(value,dict)or set(value)!=fields:
		raise _Invalid(f"{label}: blob shape")
	if optional and value["state"]=="ABSENT":
		if value!={"state":"ABSENT","base64":"","sha256":_sha(b""),"bytes":0}:
			raise _Invalid(f"{label}: absent blob mismatch")
		return None
	if optional and value["state"]!="PRESENT":
		raise _Invalid(f"{label}: optional blob state")
	try:
		data=_b64.b64decode(_text(value["base64"],f"{label} base64",False),validate=True)
	except Exception as exc:
		raise _Invalid(f"{label}: invalid base64")from exc
	if value["sha256"]!=_sha(data)or value["bytes"]!=len(data):
		raise _Invalid(f"{label}: blob identity")
	return data
def _activity_bad(value):
	if not isinstance(value,dict)or set(value)!=_AF:
		raise _Invalid("activity shape")
	return any(value[key]for key in _AF-{"nonterminal_messages","observation_basis"})or bool(value["nonterminal_messages"])
def _lifecycle(stdout):
	if not stdout or not stdout.endswith(b"\n")or b"\r"in stdout:
		raise _Invalid("Codex JSONL framing")
	lines=stdout.splitlines(keepends=True)
	events=[_event(line,f"Codex JSONL line {index}")for index,line in enumerate(lines,1)]
	thread=None; started=False; completed=False; messages=[]; activity=_clean_activity(); projection=[]
	known={"agent_message","reasoning","command_execution","file_change","mcp_tool_call","web_search","todo_list"}
	for sequence,event in enumerate(events,1):
		type_=_text(event.get("type"),"Codex event type")
		item_id=item_type=message=None
		if sequence==1:
			if set(event)!={"type","thread_id"}or type_!="thread.started"or not _UUID.fullmatch(_text(event["thread_id"],"CLI thread")):
				raise _Invalid("first Codex event is not exact thread.started")
			thread=event["thread_id"]
		elif completed:
			raise _Invalid("Codex event after turn.completed")
		elif type_=="turn.started":
			if set(event)!={"type"}or started:
				raise _Invalid("turn.started cardinality")
			started=True
		elif type_ in{"item.started","item.updated","item.completed"}:
			if set(event)!={"type","item"}or not started or not isinstance(event["item"],dict):
				raise _Invalid("Codex item envelope")
			item=event["item"]; item_id=_text(item.get("id"),"Codex item id"); item_type=_text(item.get("type"),"Codex item type")
			if item_type not in known:
				raise _Invalid("unknown Codex activity")
			if item_type in{"agent_message","reasoning"}:
				if set(item)!={"id","type","text"}or not isinstance(item["text"],str):
					raise _Invalid("Codex message item shape")
				message=item["text"]
				if type_=="item.completed"and item_type=="agent_message":
					messages.append(message)
			elif type_=="item.completed":
				activity["tool_calls"]+=1
				if item_type=="file_change": activity["file_accesses"]+=1
				if item_type=="web_search": activity["browsing"]+=1; activity["network_accesses"]+=1
				if item_type=="mcp_tool_call": activity["network_accesses"]+=1
		elif type_=="turn.completed":
			if set(event)!={"type","usage"}or not started or not isinstance(event["usage"],dict)or set(event["usage"])!={"input_tokens","cached_input_tokens","output_tokens"}or any(isinstance(v,bool)or not isinstance(v,int)or v<0 for v in event["usage"].values()):
				raise _Invalid("turn.completed shape")
			completed=True
		elif type_ in{"error","turn.failed"}:
			raise _Invalid("Codex failure event")
		else:
			raise _Invalid("unknown Codex event")
		data=message.encode("utf-8")if message is not None else None
		projection.append({"sequence":sequence,"event_type":type_,"cli_thread_id":thread,
"item_id":item_id,"item_type":item_type,"message_utf8":message,
"message_sha256":_sha(data)if data is not None else None,"message_bytes":len(data)if data is not None else None})
	if not completed or len(messages)<1:
		raise _Invalid("incomplete Codex lifecycle")
	for sequence,message in enumerate(messages[:-1],1):
		data=message.encode("utf-8"); activity["nonterminal_messages"].append({"sequence":sequence,"message_type":"MESSAGE","utf8":message,"sha256":_sha(data),"bytes":len(data)})
	return thread,_sha(_canon(projection)),messages[-1],activity
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
	if value["observation_basis"]!="ROOT_VISIBLE_CODEX_EXEC_JSONL_V0_148_0":
		raise _Invalid("x")
	return prohibited or bool(messages)
def _score(request,cell,result):
	raw=result["final"]["raw_utf8"].encode("utf-8"); activity=result["activity"]
	prohibited=_validate_activity(activity)
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
"schema_id":"pw-r9-consumer-result-v3",
"transport":{"host_transaction_id":result["host_transaction_id"],
"transport_kind":"HOST_BOUND_RAW_CODEX_CLI_TRANSACTION_V1",
"cli_thread_id":result["cli_thread_id"],"lifecycle_digest":result["lifecycle_digest"],
"process_disposition":result["process_disposition"],"activity":activity,
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
def _host_result(raw,request_bytes,request,message,route):
	frame=_event(raw,"host capture frame")
	if set(frame)!=_HF or frame.get("schema_id")!="pw-r9-host-capture-frame-v1": raise _Invalid("host frame shape")
	tx="r9-host-tx:"+_sha(b"PW_R9_HOST_TRANSACTION_V1\0"+request_bytes)
	if frame["host_transaction_id"]!=tx: raise _Invalid("host transaction derivation")
	wrapped=frame["spawn_request"]
	if not isinstance(wrapped,dict)or set(wrapped)!={"schema_id","base64","sha256","bytes"}or wrapped["schema_id"]!="pw-r9-host-spawn-request-v1": raise _Invalid("frame request wrapper")
	if _blob({key:wrapped[key]for key in("base64","sha256","bytes")},"frame request")!=request_bytes: raise _Invalid("frame request bytes")
	exe=frame["executable"]
	if not isinstance(exe,dict)or set(exe)!={"resolved_path","sha256","bytes","version"}or exe["resolved_path"]!="/home/sittingmongoose/.codex/packages/standalone/releases/0.148.0-x86_64-unknown-linux-musl/bin/codex"or exe["version"]!="codex-cli 0.148.0"or not _HEX.fullmatch(_text(exe["sha256"],"executable sha"))or _integer(exe["bytes"],"executable bytes",1)<1: raise _Invalid("executable binding")
	launch=frame["launch"]
	if not isinstance(launch,dict)or set(launch)!={"argv","cwd","stdin","stdin_write_count","stdin_closed","start_new_session","attempted_utc","attempted_monotonic_ns"}or launch["cwd"]!="/mnt/Cursor/PuppetMaster"or launch["stdin_write_count"]!=1 or launch["stdin_closed"]is not True or launch["start_new_session"]is not True or _blob(launch["stdin"],"launch stdin")!=message: raise _Invalid("launch binding")
	argv=launch["argv"]
	if not isinstance(argv,list)or len(argv)!=22 or not isinstance(argv[-2],str)or not _os.path.isabs(argv[-2]): raise _Invalid("argv output path")
	expected=[exe["resolved_path"],"exec","--ephemeral","--strict-config","-C","/mnt/Cursor/PuppetMaster","--sandbox","read-only","--color","never","--json","-m",route["model"],"-c",f'model_reasoning_effort="{route["reasoning_effort"]}"',"-c","suppress_unstable_features_warning=true","-o",argv[-2],"-"]
	if argv!=expected: raise _Invalid("argv mismatch")
	process=frame["process"]
	if not isinstance(process,dict)or set(process)!={"state","pid","process_group_id","started_utc","started_monotonic_ns","ended_utc","ended_monotonic_ns","returncode","timed_out","drain_timed_out","signal_events","residual_group"}: raise _Invalid("process shape")
	residual=process["residual_group"]
	if not isinstance(residual,dict)or set(residual)!={"state","process_group_id","member_pids","checked_utc","checked_monotonic_ns"}or residual["state"]not in{"ABSENT","PRESENT","UNKNOWN"}: raise _Invalid("residual group")
	if process["timed_out"]is True: disposition="INVALID_TIMEOUT"
	elif process["drain_timed_out"]is True: disposition="INVALID_DRAIN_TIMEOUT"
	elif residual["state"]!="ABSENT": disposition="INVALID_RESIDUAL_GROUP"
	elif process["returncode"]!=0: disposition="INVALID_PROCESS"
	else: disposition="VALID_RC0"
	captures=frame["captures"]
	if not isinstance(captures,dict)or set(captures)!={"stdout_jsonl","stderr","output_last_message"}: raise _Invalid("captures shape")
	stdout=_blob(captures["stdout_jsonl"],"stdout JSONL"); stderr=_blob(captures["stderr"],"stderr"); output=_blob(captures["output_last_message"],"output last message",True)
	thread,lifecycle,final,activity=_lifecycle(stdout)
	raw_final=final.encode("utf-8"); normalized=raw_final[:-1]if raw_final.endswith(b"\n")else raw_final
	if output is None or(output[:-1]if output.endswith(b"\n")else output)!=normalized: raise _Invalid("-o reconciliation")
	result={"schema_id":"pw-r9-host-capture-result-v1","host_transaction_id":tx,"frame_sha256":_sha(raw),"frame_bytes":len(raw),"process_disposition":disposition,"cli_thread_id":thread,"lifecycle_digest":lifecycle,"lifecycle_status":"COMPLETE","final":{"raw_utf8":final,"raw_sha256":_sha(raw_final),"raw_bytes":len(raw_final),"normalized_utf8":normalized.decode("utf-8"),"normalized_sha256":_sha(normalized),"normalized_bytes":len(normalized),"output_last_message_sha256":_sha(output),"output_last_message_bytes":len(output)},"activity":activity,"stderr_sha256":_sha(stderr),"stderr_bytes":len(stderr),"qualification_credit":0}
	if set(result)!=_HR:return None
	return result
def _synthetic(request,scenario,oracle):
	activity=_clean_activity(); final=oracle+"\n"; bad={"observed_tool":"tool_calls","observed_file":"file_accesses","observed_browse":"browsing","observed_network":"network_accesses","observed_delegation":"delegations","observed_memory":"memory_accesses","observed_followup":"followup_turns"}
	if scenario in bad: activity[bad[scenario]]=1
	if scenario=="observed_nonterminal":
		data=b"synthetic nonterminal message"; activity["nonterminal_messages"]=[{"sequence":1,"message_type":"MESSAGE","utf8":data.decode(),"sha256":_sha(data),"bytes":len(data)}]
	if scenario=="malformed_output": final="{malformed-output"
	if scenario=="partial_output": final=oracle[:max(1,len(oracle)//2)]
	events=[{"sequence":1,"event_type":"SYNTHETIC_FINAL","payload":{"final_utf8":final,"activity":activity}}]
	if scenario in{"missing_spawn","failed_spawn","wrong_path","wrong_sender","wrong_type","missing_output"}: events=[{"sequence":1,"event_type":"SYNTHETIC_FAILURE","payload":{"kind":scenario}}]
	tx="r9-synthetic-tx:"+_sha(_canon(request)); frame={"schema_id":"pw-r9-synthetic-host-capture-frame-v1","synthetic_transaction_id":tx,"scenario_id":scenario,"spawn_request":request,"synthetic_events":events}; raw=_canon(frame)+b"\n"
	if events[0]["event_type"]!="SYNTHETIC_FINAL": return raw,None
	raw_final=final.encode(); normalized=raw_final[:-1]if raw_final.endswith(b"\n")else raw_final; thread=f"{request['nonce'][:8]}-{request['nonce'][8:12]}-{request['nonce'][12:16]}-{request['nonce'][16:20]}-{request['nonce'][20:32]}"
	result={"schema_id":"pw-r9-host-capture-result-v1","host_transaction_id":tx,"frame_sha256":_sha(raw),"frame_bytes":len(raw),"process_disposition":"VALID_RC0","cli_thread_id":thread,"lifecycle_digest":_sha(_canon(events)),"lifecycle_status":"SYNTHETIC_COMPLETE","final":{"raw_utf8":final,"raw_sha256":_sha(raw_final),"raw_bytes":len(raw_final),"normalized_utf8":normalized.decode(),"normalized_sha256":_sha(normalized),"normalized_bytes":len(normalized),"output_last_message_sha256":_sha(normalized),"output_last_message_bytes":len(normalized)},"activity":activity,"stderr_sha256":_sha(b""),"stderr_bytes":0,"qualification_credit":0}
	return raw,result
def _stop(_signum,_frame):
	global _STOP
	_STOP=True
def _admit(session,root,run,row,
cell,causal):
	packet=cell["render_utf8"].encode("utf-8")
	message=_INS+packet[:-1]
	route=next(item for item in _ROUTES if item["slot"]==row["slot"])
	attempt={"schema_id":"pw-r9-attempt-v6","run_id":root.name,
"run_kind":run["run_kind"],"mode":run["mode"],"row_id":row["row_id"],
"slot":row["slot"],"cell":row["cell"],"index":row["index"],
"ordinal":row["ordinal"],"nonce":row["nonce"],
"invocation_id":row["invocation_id"],"task_name":row["task_name"],
"logical_task_path":row["logical_task_path"],
"transport_kind":"HOST_BOUND_RAW_CODEX_CLI_TRANSACTION_V1","session_reuse":False,
"model":route["model"],
"reasoning_effort":route["reasoning_effort"],"causal_inputs":causal,
"packet_sha256":_sha(packet),"packet_bytes":len(packet),
"message_sha256":_sha(message),"message_bytes":len(message),"attempt":1,
"retry_count":0,"relaunch_count":0,"best_of":False,"replacement_result":False,
"no_retry":True,"no_relaunch":True,"admission_state":"FUSED_BEFORE_HOST_REQUEST"}
	if set(attempt)!=_ATF:
		raise _Invalid("x")
	previous=_si.pthread_sigmask(_si.SIG_BLOCK,_SIGS)
	try:
		if _STOP or _SIGS.intersection(_si.sigpending()):
			return None
		session.write_row_artifact(row["row_id"],"packet.txt",packet)
		session.write_row_artifact(row["row_id"],"cli_stdin.txt",message)
		attempt_identity=session.write_row_artifact(row["row_id"],"attempt.json",attempt)
		request={"schema_id":"pw-r9-host-spawn-request-v1","run_id":root.name,
"run_kind":run["run_kind"],"mode":run["mode"],"row_id":row["row_id"],
"slot":row["slot"],"cell":row["cell"],"index":row["index"],"ordinal":row["ordinal"],
"nonce":row["nonce"],"invocation_id":row["invocation_id"],"task_name":row["task_name"],
"logical_task_path":row["logical_task_path"],"transport_kind":"HOST_BOUND_RAW_CODEX_CLI_TRANSACTION_V1",
"session_reuse":False,"model":route["model"],"reasoning_effort":route["reasoning_effort"],
"packet_sha256":_sha(packet),"packet_bytes":len(packet),"message_sha256":_sha(message),
"message_bytes":len(message),"attempt_sha256":attempt_identity[0],"attempt_bytes":attempt_identity[1]}
		if set(request)!=_SF: raise _Invalid("host spawn request shape")
		request_bytes=_canon(request)
		session.write_row_artifact(row["row_id"],"host_spawn_request.json",request)
	finally:
		_si.pthread_sigmask(_si.SIG_SETMASK,previous)
	return request_bytes,request
def _process_row(session,root,run,row,
cell,controls,reader,
scenario,completions,
artifacts,used):
	causal=_causal_inputs(root,row["slot"],cell,completions,artifacts)
	admission=_admit(session,root,run,row,cell,causal)
	if admission is None:
		return "STOP"
	request_bytes,request=admission
	if reader is not None:
		tx="r9-host-tx:"+_sha(b"PW_R9_HOST_TRANSACTION_V1\0"+request_bytes)
		if tx in used: raise _Invalid("host transaction collision")
		used.add(tx)
	if reader is not None:
		_sys.stdout.buffer.write(request_bytes+b"\n")
		_sys.stdout.buffer.flush()
		frame_raw=reader.raw()
	else:
		frame_raw,result=_synthetic(request,scenario,cell["expected_output_utf8"])
	try:
		frame_identity=session.write_host_capture_frame(row["row_id"],frame_raw)
	except Exception:
		if reader is not None:
			reader.reject_ready_extra()
		raise
	if reader is not None:
		reader.reject_ready_extra()
		route=next(item for item in _ROUTES if item["slot"]==row["slot"])
		result=_host_result(frame_raw,request_bytes,request,_INS+cell["render_utf8"].encode("utf-8")[:-1],route)
	if result is None: raise _Invalid("host capture did not produce a result")
	if reader is not None:
		if result["cli_thread_id"]in used: raise _Invalid("CLI thread collision")
		used.add(result["cli_thread_id"])
	result_identity=session.write_host_capture_result(row["row_id"],result)
	if result["process_disposition"]!="VALID_RC0": raise _Invalid("host process disposition invalid")
	consumer,verdict=_score(request,cell,result)
	completion={"schema_id":"pw-r9-completion-v6","run_id":root.name,
"row_id":row["row_id"],"attempt_sha256":request["attempt_sha256"],
"attempt_bytes":request["attempt_bytes"],"host_spawn_request_sha256":_sha(request_bytes),
"host_spawn_request_bytes":len(request_bytes),"host_capture_frame_sha256":frame_identity[0],
"host_capture_frame_bytes":frame_identity[1],"host_capture_result_sha256":result_identity[0],
"host_capture_result_bytes":result_identity[1],"consumer_result":consumer,"status":verdict,
"cli_thread_id":result["cli_thread_id"],"lifecycle_digest":result["lifecycle_digest"],
"component_qualification_credit":0,"external_gate_eligible":run["mode"]=="actual"and verdict=="PASS",
"attempt":1,"retry_count":0,"best_of":False,"replacement_result":False,
"relaunch_count":0,"session_reuse":False,"completion_is_last_row_write":True}
	if set(completion)!=_COF:
		raise _Invalid("x")
	session.write_completion(row["row_id"],completion)
	_stored(root/"rows"/row["row_id"]/"completion.json",completion,
f"completion {row['row_id']}")
	completions[(row["slot"],row["cell"])]=completion
	if verdict=="PASS":
		_finalize(session,root,row,cell,controls,completions,artifacts)
	return verdict
def _expected(root,run,evidence,
identity,shared):
	return{"schema_id":"pw-r9-verifier-expectation-v5","run_id":root.name,
"run_kind":run["run_kind"],"planned_call_count":run["planned_call_count"],
"evidence_root":evidence,"current_component_identity":identity,
"shared_authorities":shared}
def _seal_envelope(value,run,artifact_id,index):
	fields={"schema_id","artifact_id","artifact_index","run_id","seal_epoch","recipe_id","dependencies","payload"}
	if not isinstance(value,dict)or set(value)!=fields or value.get("schema_id")!="pw-r9-seal-artifact-envelope-v1" or value.get("artifact_id")!=artifact_id or value.get("artifact_index")!=index or value.get("run_id")!=run["run_id"]or value.get("seal_epoch")!=run["seal_epoch"]or value.get("recipe_id")!=f"pw-r9-seal-recipe-{artifact_id}-v2":
		raise _Invalid(f"{artifact_id} accounting envelope mismatch")
	dependencies=value.get("dependencies")
	if not isinstance(dependencies,list)or len(dependencies)!=index:
		raise _Invalid(f"{artifact_id} dependency prefix mismatch")
	for prior,ref in enumerate(dependencies):
		if not isinstance(ref,dict)or set(ref)!={"artifact_id","path","sha256","bytes"}or ref.get("artifact_id")!=f"a{prior:02d}"or not isinstance(ref.get("path"),str)or not _HEX.fullmatch(str(ref.get("sha256")))or isinstance(ref.get("bytes"),bool)or not isinstance(ref.get("bytes"),int)or ref.get("bytes")<1:
			raise _Invalid(f"{artifact_id} dependency reference mismatch")
	if not isinstance(value.get("payload"),dict):
		raise _Invalid(f"{artifact_id} payload mismatch")
	return value["payload"]
def _envelope_projection_check():
	run={"run_id":"fixture-run","seal_epoch":"0"*64}
	def envelope(artifact_id,index,key,value):
		return{"schema_id":"pw-r9-seal-artifact-envelope-v1","artifact_id":artifact_id,
"artifact_index":index,"run_id":run["run_id"],"seal_epoch":run["seal_epoch"],
"recipe_id":f"pw-r9-seal-recipe-{artifact_id}-v2",
"dependencies":[{"artifact_id":f"a{prior:02d}","path":f"fixture/{prior}",
"sha256":"0"*64,"bytes":1}for prior in range(index)],"payload":{key:value}}
	matrix_payload=_seal_envelope(envelope("a08",8,"matrix_terminal",{"status":"PASS"}),run,"a08",8)
	accounting_payload=_seal_envelope(envelope("a10",10,"accounting",{"schema_id":"pw-r9-accounting-v5"}),run,"a10",10)
	if set(matrix_payload)!={"matrix_terminal"}or matrix_payload["matrix_terminal"].get("status")!="PASS" or set(accounting_payload)!={"accounting"}or accounting_payload["accounting"].get("schema_id")!="pw-r9-accounting-v5":
		raise _Invalid("uniform seal envelope projection self-check failed")
def _verified_state(report,require_complete):
	if not isinstance(report,dict)or report.get("schema_id")!="pw-r9-offline-verifier-report-v5" or not isinstance(report.get("valid"),bool):
		raise _Invalid("offline verifier report shape mismatch")
	if report["valid"]is not True:
		return"INVALID"
	state=report.get("seal_state")
	if report.get("status")!=state or state not in{"INCOMPLETE_CONSUMED_ZERO_CREDIT","COMPLETE_SCRATCH_CLEANUP_PENDING","BUSY_NO_WRITE","COMPLETE"}:
		raise _Invalid("offline verifier state mismatch")
	credit=report.get("credit")
	authority=report.get("authority")
	if not isinstance(credit,dict)or isinstance(credit.get("qualification_clean_run_credit"),bool)or not isinstance(credit.get("qualification_clean_run_credit"),int)or not isinstance(authority,dict):
		raise _Invalid("offline verifier credit shape mismatch")
	if state!="COMPLETE":
		if report.get("matrix_status")is not None or credit.get("qualification_clean_run_credit")!=0 or authority.get("qualification_claim")is not False:
			raise _Invalid("noncomplete verifier state leaked status or qualification")
		if require_complete:
			raise _Invalid(f"complete seal required; verifier state {state}")
	return state
def _routing_projection_check():
	base={"schema_id":"pw-r9-offline-verifier-report-v5","valid":True,
"credit":{"qualification_clean_run_credit":0},"authority":{"qualification_claim":False},
"matrix_status":None}
	for state in("INCOMPLETE_CONSUMED_ZERO_CREDIT","COMPLETE_SCRATCH_CLEANUP_PENDING","BUSY_NO_WRITE"):
		report={**base,"status":state,"seal_state":state}
		if _verified_state(report,False)!=state:
			raise _Invalid("read-only state routing projection mismatch")
		try:
			_verified_state(report,True)
		except _Invalid:
			pass
		else:
			raise _Invalid("ordinary complete-only routing accepted incomplete state")
def _cli_grammar_check():
	expected={
"simulate":{"command":"simulate","run_root":"fixture","scenario":"clean"},
"run-canary":{"command":"run-canary","run_root":"fixture"},
"run-matrix":{"command":"run-matrix","run_root":"fixture"},
"reopen":{"command":"reopen","run_root":"fixture"},
}
	for command,wanted in expected.items():
		argv=[command,"--run-root","fixture"]
		if command=="simulate":
			argv.extend(("--scenario","clean"))
		if _parse(argv)!=wanted:
			raise _Invalid("public CLI grammar projection mismatch")
	try:
		_parse(["fifth-command","--run-root","fixture"])
	except _Invalid:
		pass
	else:
		raise _Invalid("unexpected fifth public command accepted")
def _rrs(root,evidence,controls,require_complete):
	run_bytes,run=_rjson(root/"run.json","run")
	if set(run)!=_RF or run.get("schema_id")!="pw-r9-run-v7" or run.get("run_id")!=root.name:
		raise _Invalid("x")
	storages,current_identity,_=_sn()
	del storages
	shared=_au()
	report=_vr.reopen(root,_expected(root,run,evidence,current_identity,shared))
	state=_verified_state(report,require_complete)
	if state=="INVALID":
		return{"schema_id":"pw-r9-reopen-result-v6","run_id":root.name,"state":"INVALID",
"valid":False,"writes":False,"component_qualification_credit":0,"external_gate_eligible":False,
"details":{"offline_verifier":report,"matrix_status":None}}
	if state!="COMPLETE":
		return{"schema_id":"pw-r9-reopen-result-v6","run_id":root.name,"state":state,
"valid":True,"writes":False,"component_qualification_credit":0,"external_gate_eligible":False,
"details":{"offline_verifier":report,"matrix_status":None}}
	_,matrix_envelope=_rjson(root/"matrix_terminal.json","matrix terminal")
	matrix_payload=_seal_envelope(matrix_envelope,run,"a08",8)
	if set(matrix_payload)!={"matrix_terminal"}or not isinstance(matrix_payload["matrix_terminal"],dict):
		raise _Invalid("a08 matrix payload wrapper mismatch")
	matrix=matrix_payload["matrix_terminal"]
	_,accounting_envelope=_rjson(root/"accounting.json","accounting")
	accounting_payload=_seal_envelope(accounting_envelope,run,"a10",10)
	if set(accounting_payload)!={"accounting"}or not isinstance(accounting_payload["accounting"],dict):
		raise _Invalid("a10 accounting payload wrapper mismatch")
	accounting=accounting_payload["accounting"]
	if accounting.get("schema_id")!="pw-r9-accounting-v5" or accounting.get("accounting_is_last_run_root_write")is not True or accounting.get("component_qualification_credit")!=0 or accounting.get("external_qualification_credit")!=0:
		raise _Invalid("a10 accounting terminal mismatch")
	matrix_status=matrix["status"]
	status=matrix_status
	if status not in{"PASS","VALID_SUBJECT_FAIL","STOPPED_AFTER_DRAIN","CONTROLLER_INVALID"}:
		status="CONTROLLER_INVALID"
	eligible=bool(accounting.get("external_gate_eligible"))and bool(matrix.get("external_gate_eligible"))
	return{"schema_id":"pw-r9-reopen-result-v6","run_id":root.name,"state":"COMPLETE",
"valid":status!="CONTROLLER_INVALID","writes":False,"component_qualification_credit":0,
"external_gate_eligible":eligible,"details":{"offline_verifier":report,"matrix_status":matrix_status}}
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
	planned=[value for row in rows for value in(row["nonce"],row["invocation_id"],row["logical_task_path"])]
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
	seal_epoch=_sha(_canon([root.name,"pw-r9-v8-seal-epoch-v1"]))
	run={"schema_id":"pw-r9-run-v7","run_id":root.name,"run_kind":run_kind,
"mode":mode,"scenario":requested_scenario if mode=="synthetic" else None,
"created_utc":_utc_now(),"component_identity":current_identity,
"component_provenance":current_provenance,"shared_authorities":controls["shared"],
"shared_authority_count":2,
"routes":[dict(item)for item in _ROUTES],"schedule":rows,"route_count":3,
"cells_per_route":cells_per_route,"cell_count":97,
"planned_call_count":len(rows),"stage_count":18,
"required_clean_stage_artifact_count":54 if len(rows)==291 else 0,
"regression_family_count":22,"regression_variant_count":56,
"global_fault_count":10,"semantic_counterfactual_count":7,
"transport_kind":"HOST_BOUND_RAW_CODEX_CLI_TRANSACTION_V1","session_reuse":False,
"retry_count":0,"relaunch_count":0,"best_of":False,"replacement_count":0,
"public_commands":["simulate","run-canary","run-matrix","reopen"],"custody":custody,
"seal_epoch":seal_epoch,"seal_protocol_schema_id":"pw-r9-seal-transaction-catalog-v2",
"seal_scratch_name":f"seal-staging-{seal_epoch}",
"host_capture_frame_schema_id":"pw-r9-host-capture-frame-v1",
"host_capture_result_schema_id":"pw-r9-host-capture-result-v1",
"host_transaction_derivation":"SHA256_PREFIX_PLUS_CANONICAL_HOST_SPAWN_REQUEST_BYTES_NO_LF",
"external_host_binding_required":{"actual":True,"synthetic":False},
"component_qualification_credit":0,
"sequential_run_policy":"FRESH_EVIDENCE_ROOT_NO_ACTUAL_CONCURRENCY"}
	if set(run)!=_RF:
		raise _Invalid("x")
	_STOP=False
	_si.signal(_si.SIGINT,_stop)
	_si.signal(_si.SIGTERM,_stop)
	session=_rr.begin_run(root,run)
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
			verdict=_process_row(session,root,run,row,cell,controls,reader,scenario or "clean",
completions,artifacts,used)
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
		session.seal(cause)
		result=_rrs(root,evidence,controls,True)
	finally:
		_si.pthread_sigmask(_si.SIG_SETMASK,previous)
	return result
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
			_envelope_projection_check()
			_routing_projection_check()
			_cli_grammar_check()
			checks=controls["checks"]
			result={"schema_id":"pw-r9-control-check-v5","status":"PASS",
"spawn_requests":0,"root_events_read":0,"evidence_writes":0,
"model_calls":0,"provider_calls":0,"subject_calls":0,"collaboration_calls":0,
"network_calls":0,"routes":3,"cells":97,"matrix_rows":291,
"reopen_noncomplete_routing_states":3,
"public_commands":["simulate","run-canary","run-matrix","reopen"],
"deterministic_stages_per_route":18,"required_clean_stage_artifacts":54,
"regression_families":22,"regression_variants":56,"global_faults":10,
"semantic_projections":checks["semantic_projections"],
"leakage_scans":checks["leakage_scans"],
"self_attestation_rejected":checks["self_attestation_rejected"],
"component_identity":controls["identity"],"component_qualification_credit":0,
"external_gate_eligible":False}
		elif command=="reopen":
			controls=_ct()
			evidence=_er()
			result=_rrs(_run_path(str(options["run_root"]),evidence,False),
evidence,controls,False)
		else:
			result=_execute(command,str(options["run_root"]),
str(options.get("scenario","actual")))
		_sys.stdout.buffer.write(_canon(result)+b"\n")
		_sys.stdout.buffer.flush()
		matrix=result.get("details",{}).get("matrix_status")if isinstance(result.get("details"),dict)else None
		if result.get("state")=="COMPLETE"and matrix=="PASS":
			return 0
		if result.get("state")=="COMPLETE"and matrix=="VALID_SUBJECT_FAIL":
			return 1
		if result.get("state")=="BUSY_NO_WRITE":
			return 75
		return 2
	except _Busy as exc:
		error={"schema_id":"pw-r9-runner-error-v2","status":"BUSY_NO_WRITE",
"component_qualification_credit":0,"external_gate_eligible":False,
"error_type":type(exc).__name__,"error":str(exc)}
		_sys.stdout.buffer.write(_canon(error)+b"\n")
		_sys.stdout.buffer.flush()
		return 75
	except Exception as exc:
		error={"schema_id":"pw-r9-runner-error-v2","status":"CONTROLLER_INVALID",
"component_qualification_credit":0,"external_gate_eligible":False,
"error_type":type(exc).__name__,"error":str(exc)}
		_sys.stdout.buffer.write(_canon(error)+b"\n")
		_sys.stdout.buffer.flush()
		return 2
if __name__=="__main__":
	raise SystemExit(main())
