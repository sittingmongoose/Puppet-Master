import datetime, hashlib, json, re
from pathlib import Path

ROOT=Path(__file__).resolve().parent.parent
BASE=Path('ER12_RUNTIME')
RUN=BASE/'runs/D-R2-04/control'
PLAN=BASE/'frozen-inputs/D-R2-04/plan.md'
FINAL=RUN/'stages/reviser/final.md'
data=json.loads((ROOT/'evidence/review-data.json').read_text())
original=json.loads((ROOT/'evidence/original-inspection.json').read_text())
retrieval=json.loads((ROOT/'evidence/primary/retrieval-manifest.json').read_text())
lookup={x['id']:x for x in retrieval}

# Each entry is an independent semantic disposition, not a copied candidate row.
# Numbers identify exact original plan sentences solely within this assessment.
ann={
1: ('PROTOCOL_UNKNOWN','The plan-release record is consistent with a concealed plan during discovery. Absence of earlier plan reading is not authenticated by these files. This is release administration, not a new research obligation.',[6,44,169]),
2: ('CONTEXT_PRESERVED','The final treats the plan as the authored request plus opportunities, and offers a later study rather than claiming the record contains results.',[16,40,203]),
3: ('CONTEXT_PRESERVED','No plan sentence is used as empirical evidence or as an answer key. The final independently proposes controls, measures and a decision sequence.',[8,65,104,163]),
4: ('MET','No predetermined winner is asserted; content, presentation, assisted/unchanged and no-change alternatives remain live.',[80,139]),
5: ('CONTEXT_PRESERVED','Authoring did not validate readers. The final expressly reports participant and local checks as unexecuted.',[163,170,171]),
6: ('IDENTITY_CONFIRMED','The original brief within the plan matches the frozen brief. The revealed plan matches the full original bytes; Appendix A reproduces the released record.',[203,225]),
7: ('MET','Original obligations are preserved in the clause table and substantive study. Critique additions clarify comparisons/eligibility without replacing the original request.',[16,80,104,176]),
8: ('MET','Bilingual course-notice context remains fictional; no actual language pair or current artifact is inferred.',[8,24,155]),
9: ('MET','Staff questions remain an ambiguous qualitative signal. Fee and seat-status tasks are separate; the question report is not turned into frequency or comprehension scores.',[10,74,116,128]),
10: ('MET','Concurrent shortening, translation revision and mobile distribution are treated as confounded changes. Timeline and controlled comparisons precede attribution.',[26,58,65,98]),
11: ('MET','Missing logs, interviews and stable old notices are explicit. The final does not reconstruct a historical baseline or invent a before/after effect.',[27,58,98,102]),
12: ('MET','Fictional status is explicit. No actual center is contacted or described as having supplied facts.',[28,35,170]),
13: ('SEMANTIC_MET_TIME_RECORDS_SEPARATE','The deliverable is a research proposal before rewriting/deployment. Saved stage-time fields are consistent with deadlines; exact runtime/provenance is assessed separately.',[8,29,96,163]),
14: ('MET_WITH_NONMATERIAL_DEPTH_LIMIT','Six plausible mechanisms, factor-specific alternatives and bounded implementation history are substantive. History is selective (L01), but no required mechanism/comparison or local decision is missing.',[65,80,141]),
15: ('MET','A later qualitative comparison is specified with eligible readers, accommodations, separate outcomes, consent and mock tasks. There is no website, final translation or publishable notice.',[104,116,135,174]),
16: ('MET','Fee correctness, reservation correctness, task behavior and confidence have separate coding elements. No composite is allowed to hide one error behind another outcome.',[116,126,133]),
17: ('MET','Content/information order and presentation/channel are controlled separately; current/unchanged and assisted routes are retained. Combined/no-change branches are also present.',[80,84,86,88,90,92,93]),
18: ('MET','Reader-chosen language, reading versus speaking comfort, literacy/access needs, mobile/print context and staff explanation are distinguished. Neither group is assumed uniform.',[59,106,112,126,133]),
19: ('MET_WITH_NONMATERIAL_DEPTH_LIMIT','Local notice/service history is explicitly future authorized work because records and contact are absent. ONS/pattern/report history and audience/delivery limits are investigated; L01 records additional useful thread depth.',[58,98,141,153]),
20: ('MET','Comparison stimuli, actual/likely reader criteria, accessible consent, separate measures and revision/retest gates are specified. Participant validation remains proposed; prior and reviser desk checks are distinguished.',[104,110,114,116,135,163]),
21: ('MET_IN_AUTHORED_DELIVERABLE_PROTOCOL_UNKNOWN','No prohibited recruitment/contact, personal data collection, publication or live form is evidenced or claimed. Future authorized study actions are explicitly conditional; whole-trace absence is UNKNOWN.',[35,114,170,171,174]),
22: ('MET','There are no invented scores, preferences, language equivalence results or representative demographics. Variation and missing coverage remain explicit.',[36,106,108,112,133]),
23: ('MET','Underlying policy is invariant and owner verified. Readability/foreign standards are never treated as comprehension or a legal/accessibility certificate.',[37,54,55,87,152,173]),
24: ('MET','Every listed unknown is retained in establishment gates and owner questions; missing resources/context do not select a solution.',[38,52,59,60,161]),
25: ('MET','The study provisionally puts critical reader errors first but explicitly leaves priority/tradeoff ownership open. It does not claim an agreed preference for reducing questions.',[39,60,139,161]),
26: ('MET','The policy/service/artifact/audience/decision facts to establish are concrete. Useful provisional contrasts remain specific and conditional.',[52,80,104]),
27: ('MET','Verify policy and practice first, then control wording/presentation and assistance conditions. Distinguish facts not found, facts misunderstood, reassurance and operational inconsistency.',[65,80,98,116,137]),
28: ('HONEST_EXTERNAL_DECISIONS_RETAINED','The final identifies missing facts, access/consent/budget and decision ownership. It offers provisional critical fee/state outcomes without claiming a finalized primary endpoint or approved protocol.',[52,104,108,114,137,161]),
29: ('MET','Phase 0 policy/history/process reconciliation precedes stimuli and reader rounds. A contradictory operation cannot be cured by layout alone.',[78,98,102,137]),
30: ('MET_AFTER_EXPLICIT_CORRECTION','Options 3/3a/4/4a/5 and session conditions make sequencing, explanation, bilingual organization, mobile/print and structured help separate feasible contrasts. No layout/channel is chosen.',[86,87,88,89,90,110]),
31: ('MET','Unchanged notice plus standardized help is an explicit branch; process/policy clarification means verifying truth, not changing a service rule for easier copy.',[84,85,90]),
32: ('MET','The table addresses translation/review cost, space, channel dependencies, staff availability, assistance masking and loss of attribution in a combined candidate.',[80,86,87,88,89,90,92,108]),
33: ('MET','No language version, layout, readability measure or delivery channel is declared correct. The final keeps no change and uncertainty.',[12,80,93,155]),
34: ('MET','Mechanisms explicitly cover payment meaning, inferred seat status, ambiguity/order, language revision and familiarity, hierarchy/preview and channel context; each has a discriminating observation.',[65,70,71,72,73,74,75]),
35: ('MET','Spontaneous help requests are categorized from participant accounts, with correctness independently scored and staff practice assessed separately.',[75,130]),
36: ('MET','Separate policy-coded fee/state explanation, fact finding, next action, assistance and confidence measures distinguish mechanisms. Confidence/questions never substitute for correctness.',[116,126,130,133]),
37: ('MET','Phase 0 names notices, language versions, approvals, translation revisions, distribution, policy versions, staff practice and enrollment/confirmation workflow, with dates and missing periods.',[58,59,98,100,102]),
38: ('MET_WITH_DISCLOSURE_LIMITS','The final identifies what comparable reports should disclose and admits incomplete reporting rather than inventing audience/recruitment/tasks/outcomes. Existing analogues remain method/history evidence, not a proven template.',[94,141,153]),
39: ('MET','The final explicitly treats the simultaneous changes as confounded and requires lineage/process evidence before causal attribution.',[26,58,72,100]),
40: ('MET','External sources frame questions and methods only; no notice or external design is adopted as the known-good solution.',[94,153,159]),
41: ('MET','Future owner-verified facts, approved non-operational mock stimuli, eligible readers, language/access support and consented tasks are sequenced; assistance and confidence are separately recorded.',[98,104,110,112,114,116,126]),
42: ('MET','Per-language allocation is explicitly budget-dependent and qualitative; missing access/version coverage is reported. Counterbalanced matched variants, first-exposure results, privacy safeguards and retesting are specified.',[108,112,114,133,135,139]),
43: ('MET','Literature and structure checks remain desk work. Rendering/readability/participant testing and translation equivalence are not claimed to have run.',[163,167,168,171,173]),
44: ('CONTEXT_PRESERVED','Synthetic authoring status is maintained, not presented as reader evidence.',[28,35,170,171]),
45: ('CONTEXT_PRESERVED','This statement describes case authoring. The final distinguishes subsequent source desk review from nonexistent local pilot, participant, implementation or performance validation.',[163,167,170,171,174]),
46: ('MET','The final explicitly differentiates investigator-recorded desk checks, the reviser disputed-source rechecks, and unexecuted local/participant/technical checks.',[163,167,168,169,170,171,173,174]),
47: ('SEMANTIC_MET_TIME_RECORDS_SEPARATE','The complete pipeline provides substantive discovery, causal comparison, bounded history and a coherent later study. Earlier completion is allowed; a source grade is not a latency/savings inference.',[8,65,80,96,141,163]),
48: ('MET','Reasoned conditional sample/study choices remain provisional. No method/notice/channel winner is asserted.',[12,108,110,139,161]),
49: ('MET','No product build is created, requested by the final, or falsely treated as a missing deployment.',[33,114,174]),
50: ('IDENTITY_CONFIRMED','Frozen brief, original plan, revealed copy and terminal-frozen science hashes match. Reviewer made no original-file change. Identity supports preservation only, not semantic correctness.',[6,169,203]),
51: ('PROTOCOL_UNKNOWN','The record supports discovery followed by plan release, but global exact recipe/budget-lock authorization and absence of designer feedback across the campaign are not authenticated within permitted evidence. No other outcome/history was read.',[6,169,203]),
52: ('PROTOCOL_UNKNOWN_CONTEXT_PRESERVED','Input readiness is not used as proof of release authorization. Global release-condition satisfaction remains UNKNOWN, separate from the assessed science.',[169,203]),
}

clauses=[]
section=''
for lineno,line in enumerate(PLAN.read_text().splitlines(),1):
    if line.startswith('#'):
        section=line.lstrip('# ')
        continue
    if not line.strip() or line.startswith(('Case ID:','Slot ID:','Domain:','BEGIN ORIGINAL','END ORIGINAL')):
        continue
    for sentence in re.split(r'(?<=[.!?])\s+(?=[A-Z])',line.removeprefix('- ')):
        n=len(clauses)+1
        status, judgment, flines=ann[n]
        clauses.append({'id':f'P{n:02d}','exact_text':sentence,'section':section,'original_path':str(PLAN),'original_line':lineno,'disposition':status,'independent_assessment':judgment,'final_locators':[{'path':str(FINAL),'line':x} for x in flines]})
assert len(clauses)==52 and set(ann)==set(range(1,53))
data['exact_plan_clauses']=clauses
data['exact_plan_coverage']={'unit':'52 exact sentences, including compound clauses assessed in their dispositions','all_substantive_sentences_assessed':True,'headings_identifiers_delimiters':'Structural identity, not additional research obligations. Case/slot/domain retained; complete original plan separately hashed/read.','administrative_conditions_not_semantic_failures':['P01','P51','P52'],'unassessed':[]}
data['artifacts_inspected']=original['artifacts']
data['preservation_identity_checks']={k:original[k] for k in ['terminal_freeze_checks','stage_input_freeze_checks','brief_copy_exactly_matches_original','revealed_plan_exactly_matches_original']}
data['candidate_native_records']=original['native_records']
data['candidate_requested_routes']={s:json.loads((RUN/'stages'/s/'input-map.json').read_text())['requested_route'] for s in ('investigator','critic','reviser')}
data['candidate_native_status']='SAVED_ACTIVE_AND_COMPLETE_RESPONSE_RECORDS_CONSISTENT; AUTHENTICATED_PROVENANCE_UNKNOWN'
data['candidate_t3_status']={'evidence_path':str(RUN/'terminal-science-freeze-root.json'),'reported_observation_utc':'2026-10-10T07:30:52.933533+00:00','reported_terminal_status':'completed','reported_has_pending_child_runs':False,'native_proof':'NOT_INFERRED_FROM_T3'}
data['candidate_time_status']='RECORDED_DEADLINE_CONSISTENT; EFFECTIVE_TIME_AND_BILLING_UNKNOWN'
data['candidate_protocol_status']='UNKNOWN_BEYOND_BOUNDED_ARTIFACT_AND_RECORDED_LIFECYCLE_CHECKS'
data['candidate_effective_model_reasoning_tier_billing']='UNKNOWN'
data['reviewer_native_active_evidence']='evidence/reviewer-native-active.json'
data['saved_at_utc']=datetime.datetime.now(datetime.timezone.utc).isoformat()
data['reviewer_time']={'envelope_start_utc':data['assignment']['start_utc'],'envelope_deadline_utc':data['assignment']['deadline_utc'],'saved_at_utc':data['saved_at_utc'],'capped':False,'unassessed_axes':[],'elapsed_to_save_seconds':(datetime.datetime.fromisoformat(data['saved_at_utc'])-datetime.datetime.fromisoformat(data['assignment']['start_utc'].replace('Z','+00:00'))).total_seconds()}

primary=[]
for s in data['sources']:
    r=lookup[s['id']]
    rec=dict(s)
    rec.update({'evidence_id':'E-'+s['id'],'candidate_source_id':s['id'],'url':r['requested_url'],'resolved_url':r['resolved_url'],'access_started_utc':r['access_started_utc'],'access_completed_utc':r['access_completed_utc'],'http_status':r['status'],'operation':'Independent unauthenticated retrieval and semantic reading of governing/adjacent sections, not candidate source-map agreement.','raw_path':r['raw_path'],'raw_sha256':r['raw_sha256'],'text_path':r['text_path'],'text_sha256':r['text_sha256'],'review_scope':'Governing and surrounding context for claims and conditions; does not assert review of every unrelated criterion/navigation element.'})
    if s['id']=='S10': rec['additional_captures']=[lookup['S10-current'],lookup['S10-dated']]
    if s['id']=='S07': rec['additional_captures']=[lookup[x] for x in ['S07-api','S07-comments','S07-events']]; rec['complete_comment_body_capture']='evidence/primary/S07-comment-bodies.md'
    for loc in rec['locators']: loc['path']='evidence/primary/'+loc['file']
    primary.append(rec)

smap={'schema_version':'er12-independent-source-map-v1','slot':'D-R2-04','arm':'control','assessment_version':'control-v1','purpose':'Independent governing primary evidence; original IDs have not been rebound. E-prefixed IDs identify this review retrieval.','source_index':'evidence/index.md','sources':primary,'original_inputs':[{'id':'ORIGINAL_BRIEF','path':str(BASE/'frozen-inputs/D-R2-04/brief.md')},{'id':'ORIGINAL_PLAN','path':str(PLAN)},{'id':'RUBRIC','path':str(BASE/'assessment/RUBRIC-v1.md')}],'original_inspected_hashes':'evidence/original-inspection.json','native_active_evidence':'evidence/reviewer-native-active.json','critic_dispositions':data['critic_dispositions'],'exact_plan_clauses':clauses,'retrieval_manifest':'evidence/primary/retrieval-manifest.json','evidence_scope':'Only this control pipeline and directly relevant governing public primary evidence; no other arm/outcome/campaign history. Hashes are identity evidence, not semantic proof.'}
(ROOT/'source-map.json').write_text(json.dumps(smap,indent=2,ensure_ascii=False)+'\n')
data['sources']=[{'id':s['id'],'evidence_id':'E-'+s['id'],'url':s['url'],'resolved_url':s['resolved_url'],'version':s['version'],'judgment':s['judgment'],'detail_source_map_pointer':'source-map.json#/sources/'+str(i)} for i,s in enumerate(primary)]
data['source_map']='source-map.json'
data['source_judgment']=data['judgment']['source_judgment']
data['per_arm']={'control':{'source_judgment':data['judgment']['source_judgment'],'axis_coverage':'ALL_SIX_ASSESSED','remaining_material_findings':[], 'native':'SAVED_RESPONSE_RECORDS_CONSISTENT; PROVENANCE_UNKNOWN','t3':'TERMINAL_COMPLETION_RECORDED_IN_ROOT_FREEZE','protocol':'UNKNOWN_BEYOND_BOUNDED_RECORDS','time':'RECORDED_DEADLINE_CONSISTENT; EFFECTIVE_TIME_UNKNOWN','effective_route':'UNKNOWN','billing':'UNKNOWN'}}
data['reviewer_native_status_at_judgment_save']='ACTIVE; completion must follow saved judgment'
(ROOT/'assessment.json').write_text(json.dumps(data,indent=2,ensure_ascii=False)+'\n')

def link(path,line=None,label=None):
    p=str(path)
    target=p+(':'+str(line) if line else '')
    return f'[{label or Path(p).name}]({target})'

md=['# Independent ER12 assessment — D-R2-04 control v1','', '**Source judgment: PASS_WITH_LIMITATIONS.** All six axes and all 52 exact plan sentences were assessed. No remaining material error, omission, wrong correction or unsupported consequential decision was found in the completed final. Earlier defects are preserved below; the qualification does not make discovery/draft retrospectively defect-free.','', 'The ordinary final is '+link(FINAL)+'. This is a proposal for a later study, with no local policy, participant, translation-equivalence, accessibility or deployment validation claimed. Honest missing external facts are not counted as failed nonexistent implementations.','', 'The judgment is based on full authored text and independently retrieved governing evidence. Hashes establish identity only. Native, T3, protocol, effective routing, time and billing are separate from the source judgment.','', '## Review scope and inspected artifacts','',f'Reviewer: `{data["assignment"]["reviewer"]}`. Envelope began {data["assignment"]["start_utc"]}, with a fixed deadline of {data["assignment"]["deadline_utc"]}; saved at {data["saved_at_utc"]}. All declared axes were completed before the cap. No nested delegation, candidate feedback/repair, other-arm/outcome/history lookup, ER11 rescore, account change, Git or publication occurred. Only this identity\'s mailbox was checked.','', 'Read in full: RUBRIC-v1; original frozen brief and plan; terminal-science-freeze-root.json; investigator discovery/draft/revealed plan/plan reveal/source map/source index; critic critique/source map/source index; reviser final/source map; all three current assignments, input maps, freezes and native create/complete response records. Source directories contain compact authored indexes only; there are no frozen raw source-response captures. The final includes its own navigable source index and all four criticism dispositions; no separate disposition/check file was found in the permitted stage inventory.','', 'Independent retrieval covered all eleven carried sources, the current and dated WCAG editions, and the full GitHub issue/comment API capture to get behind the HTML Load more boundary. Reading targeted all consequential claims and surrounding conditions; no claim is made to have reviewed every unrelated WCAG criterion or navigation link.','', 'All terminal-frozen science hashes and all current per-stage frozen-input hashes match. The control brief and released plan match the full original inputs. See [original-inspection.json](evidence/original-inspection.json) for every original hash and [source-map.json](source-map.json) / [evidence index](evidence/index.md) for primary captures, access times, locators, versions and conditions. No required science artifact is missing or incomplete.','', '## Six-axis assessment','']
for a in data['axes']:
    md += [f'### Axis {a["id"]}: {a["name"]}','',f'**{a["judgment"]}; {a["coverage"]}.** {a["analysis"]}','', 'Original/final locators: '+ '; '.join(a.get('original_locators',[])+a['candidate_locators'])+'. Source records: '+', '.join(a['source_refs'])+'.','']

md += ['## Criticism dispositions and preserved lineage defects','', 'Critic agreement is not used as evidence. Each issue was checked against original scope or governing primary context. There is no remaining material finding; this section records explicitly corrected original defects.','', '| Finding | Original lineage | Final disposition and independent result |','|---|---|---|']
for c in data['critic_dispositions']:
    md.append(f'| {c["id"]} ({c["critic_classification"]}) | {c["original_defect"]} Locators: {"; ".join(c["original_locators"])}. | {c["final_disposition"]} {c["independent_judgment"]} Locators: {"; ".join(c["final_locators"])}. |')
md += ['', 'Finalization does not introduce a wrong rejection: the refused outputs/actions are outside the present stage or unsupported shortcuts. Rejecting automatic translation here is not scored as a universal claim that future reviewed machine-assisted translation is forbidden. Conditional minor eligibility protocols do not assert that minors actually attend or that a particular jurisdictional legal rule applies.','', '## Remaining limitations and honest external choices','']
for x in data['limitations']:
    md += [f'**{x["id"]} — {x["severity"]}.** {x["description"]} {x["why_not_material"]}','']
md += ['The useful additional history in L01 is documented independently, not supplied as candidate feedback or retroactive science. See the [2022 implemented-service account](https://github.com/alphagov/govuk-design-system/issues/6037#issuecomment-6058188426), [2023 early-test account](https://github.com/alphagov/govuk-design-system/issues/6037#issuecomment-6058188646), and [contrasting follow-up-channel account](https://github.com/alphagov/govuk-design-system/issues/6037#issuecomment-6058184341). These reports lack enough methodology for a transferable causal estimate.','']
for x in data['honestly_unresolved']:
    md += [f'**{x["subject"]} ({x["status"]}).** {x["detail"]}','']

md += ['## Supported meaning and useful discovery','', '| Meaning | Lineage locator | Assessment |','|---|---|---|']
for x in data['preservation']: md.append(f'| {x["meaning"]} | {x["path"]} | {x["status"]} |')
md += ['', 'Useful discoveries are evaluated for what they enable, not source count. The language-specific testing/assurance method, distinction between completed step and overall service state, message-preview versus full reading, and factor-specific explanation/bilingual/assistance comparisons lead to discriminating observations in the proposed study. The proposal does not substitute repeated uncertainty for investigation. Structured discovery records and prospective discriminators are in assessment.json/useful_discoveries.','', '## Proposed and executed validation; applicable oracles','', '| Check | Candidate execution status | Independent assessment / oracle |','|---|---|---|']
for x in data['validation']: md.append(f'| {x["check"]} | {x["candidate_status"]} | {x["reviewer_observation"]} Oracle: {x["oracle"]} |')
md += ['', 'Reviewer execution: full assigned original-text review, independent unauthenticated primary retrieval and source-condition reading, source/JSON navigation and frozen-identity checks. No participant, translation, rendering, accessibility, local policy or deployment validation was performed by the reviewer either. Original source read actions are not authenticated by a current source map, although their consequential content is independently supported.','', '## Native, T3, protocol, time, effective route and billing','', '| Stage | Saved active/complete identity | Recorded native times | Reported usage | Deadline |','|---|---|---|']
for n in data['candidate_native_records']:
    md.append(f'| {n["stage"]} | Same thread/objective; frozen objective matches; active → complete in saved records | {n["reported_created_utc"]} → {n["reported_completed_utc"]} | {n["reported_time_used_seconds"]} s; {n["reported_tokens_used"]} native-reported tokens | {n["stage_deadline_utc"]}; recorded completion earlier |')
md += ['', 'These are the fields in the saved candidate native response records, not authenticated runtime provenance or billed-token measurements. No invocation/guard configuration is treated as proof that a native call occurred. Provenance/freshness, pre-input ordering across the complete runtime, exactly-one-call count beyond the saved pair, absence of unauthorized activity, effective model/reasoning/service tier and billing remain **UNKNOWN** without authenticated traces. The terminal freeze separately reports the final T3 task completed with no pending child runs; that is not native proof.','', 'Frozen requested route for each stage: AUTHORIZED_PROVIDER_INSTANCE / gpt-6-luna / max reasoning / default service tier. This is a request, not evidence of effective routing. Recorded completion fits the stage deadlines and the whole deadline 2026-10-10T07:57:22.653Z. No speed, occupancy, inference-time or billing-savings claim is made; no paired arm was inspected. Global recipe/budget-lock release authorization and campaign-wide no-feedback compliance are UNKNOWN. These protocol unknowns do not silently change the independent source diagnosis.','', 'For this reviewer, one actual native Goal was activated through the native tool in this context. The exact directly observed active get_goal response is [saved](evidence/reviewer-native-active.json). Complete judgment is saved before requesting completion of that same Goal.','', '## Every exact original plan clause','', 'P01–P52 are reviewer sentence identifiers, not IDs authored by the plan. Each exact sentence is reproduced from the original frozen file; compound requirements/negative constraints are assessed in full in each disposition. Headings, identifiers and delimiters are structural identity, not added product obligations. Administrative release clauses are separately UNKNOWN where the authorized packet cannot prove them.','']
for c in clauses:
    md += [f'### {c["id"]} — {c["section"]}','',f'> {c["exact_text"]}','',f'**{c["disposition"]}.** {c["independent_assessment"]}','',link(PLAN,c['original_line'],'Original clause')+'; final evidence: '+', '.join(link(FINAL,x['line'],str(x['line'])) for x in c['final_locators'])+'.','']
md += ['## Original inspected hashes','', 'The complete manifest includes bytes/line counts, freeze comparisons and native-record evidence. Hashes are never a semantic oracle.','', '| Original inspected path | SHA-256 |','|---|---|']
for a in data['artifacts_inspected']: md.append(f'| {a["path"]} | `{a["sha256"]}` |')
md += ['', 'No axis is unassessed. No material remaining finding is hidden by PASS_WITH_LIMITATIONS. No original frozen file was edited. This assessment is a v1 independent judgment; any later dispute disposition must remain separate.','']
(ROOT/'assessment.md').write_text('\n'.join(md))

idx=['# Independent evidence index — D-R2-04 control v1','', '[Assessment](../assessment.md) · [Structured assessment](../assessment.json) · [Source map](../source-map.json) · [Original inspected hashes](original-inspection.json) · [Retrieval manifest](primary/retrieval-manifest.json)','', 'Every E-Sxx source below is independently retrieved primary evidence. Sxx is only the corresponding carried candidate ID. Raw and extracted captures remain separate from the unchanged original source freeze. Line numbers in the extracted files are stable local locators.','']
for s in primary:
    idx += [f'## {s["evidence_id"]} (candidate {s["id"]})','',f'[{s["url"]}]({s["url"]})','',f'Resolved URL: {s["resolved_url"]}. Version: {s["version"]} Access: {s["access_started_utc"]} – {s["access_completed_utc"]}.','',f'[Extracted text](primary/{s["id"]}.txt) · [Raw response](primary/{s["id"]}.html). Raw SHA-256: `{s["raw_sha256"]}`. Text SHA-256: `{s["text_sha256"]}`.','', 'Reviewed local lines: '+ '; '.join(f'{x["file"]} {x["lines"][0]}–{x["lines"][1]}' for x in s['locators'])+'. Full semantic conditions/type/units are in the source-map record.','']
    if s['id']=='S07': idx += ['[Full comment bodies](primary/S07-comment-bodies.md) · [Issue API](primary/S07-api.json) · [Comments API](primary/S07-comments.json) · [Events API](primary/S07-events.json). The API comment capture bypasses HTML Load more; a capture count is not semantic proof.','']
    if s['id']=='S10': idx += ['[Current edition](primary/S10-current.txt) · [Pinned dated edition](primary/S10-dated.txt). The original query-string URL remains captured separately.','']
idx += ['## Mechanics and review reproducibility','', '[Direct reviewer native active response](reviewer-native-active.json) · [Semantic review data](review-data.json) · [Read-only original inspection script](inspect-originals.py) · [Report builder](build-assessment.py). Candidate saved native response paths and hashes are in original-inspection.json; their freshness/provenance is UNKNOWN.','']
idx += ['[Independent source acquisition script](acquire-primary.py). Raw primary captures are retained as requested evidence; extracted line files make the governing context navigable.','']
(ROOT/'evidence/index.md').write_text('\n'.join(idx))
print(json.dumps({'source_judgment':data['judgment']['source_judgment'],'axes':len(data['axes']),'clauses':len(clauses),'saved_at_utc':data['saved_at_utc'],'files':{x:(ROOT/x).stat().st_size for x in ['assessment.md','assessment.json','source-map.json','evidence/index.md']},'remaining_material_findings':len(data['judgment']['remaining_material_findings'])},indent=2))
