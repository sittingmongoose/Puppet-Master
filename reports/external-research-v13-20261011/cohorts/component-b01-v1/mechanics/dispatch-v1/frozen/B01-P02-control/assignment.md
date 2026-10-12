ER13 COMPONENT B01-P02 control; run B01-P02-control

Complete all substantive research and planning obligations within a maximum of 25 elapsed minutes. Finish earlier when the complete output is ready. There is no minimum research duration, no requirement to consume the allowance, and no credit for waiting. The deadline includes arm-specific setup, provider queueing after admission, tools, native retries, handoffs, revision and delivery. Output quality is assessed independently of elapsed time.
T0: 2026-10-12T00:35:54.295724Z
Absolute deadline: 2026-10-12T01:00:54.295724Z. Preparation/queueing already consumes this clock; no reset. This is a component review/finalization test; no discovery-effectiveness claim follows.

Before reading scientific inputs, verify immutable files and remaining clock by executing: python3 -B ER13_RUNTIME/mechanics/dispatch-v1/admitted/B01-P02-control/native/verify-runtime.py verify --runtime-dir ER13_RUNTIME/mechanics/dispatch-v1/admitted/B01-P02-control
Then execute the exact activation.js body below ONCE in functions.exec using supported native Codex tools. It reads the frozen objective, invokes tools.create_goal once, saves the unmodified full response JSON and executes the byte-identical pinned native assertion. No manual transcription, extracted receipt, fallback, replacement or second Goal. Stop on unsupported tools or failed binding and preserve diagnostics.
```javascript
const clockCheck = await tools.exec_command({cmd: "python3 -B ER13_RUNTIME/mechanics/dispatch-v1/admitted/B01-P02-control/native/verify-runtime.py verify --runtime-dir ER13_RUNTIME/mechanics/dispatch-v1/admitted/B01-P02-control", max_output_tokens: 1000});
if (clockCheck.exit_code !== 0 || clockCheck.session_id) throw Error("STOP: frozen clock/input verification failed: " + clockCheck.output);
// functions.exec body. Root substitutes only "ER13_RUNTIME/mechanics/dispatch-v1/admitted/B01-P02-control" with JSON.stringify(knownStageDir).
const stageDir = "ER13_RUNTIME/mechanics/dispatch-v1/admitted/B01-P02-control";
const q = s => "'" + s.replaceAll("'", "'\\''") + "'";
const guard = "ER13_RUNTIME/mechanics/dispatch-v1/admitted/B01-P02-control/native/assert-active-goal.py";
const readObjective = "import json,sys; from pathlib import Path; p=Path(sys.argv[1]); assert p.is_absolute() and not any(x.is_symlink() for x in (p,*p.parents)); assert not (p.parent/'native-goal-create.json').exists(); f=json.loads(p.read_text()); o=f['native_goal_objective']; assert isinstance(o,str) and 0<len(o)<4000; print(json.dumps(o,ensure_ascii=False))";
if (typeof tools.exec_command !== "function" || typeof tools.create_goal !== "function") throw Error("STOP: native tools unsupported");
const read = await tools.exec_command({cmd: "python3 -B -c " + q(readObjective) + " " + q(stageDir + "/freeze.json"), max_output_tokens: 6000});
if (read.exit_code !== 0 || read.session_id) throw Error("STOP: objective read failed: " + read.output);
const objective = JSON.parse(read.output);
if (typeof objective !== "string" || !objective.length) throw Error("STOP: objective is not a string");
// One native call. No retry, replacement, extraction, transcription, normalization or fallback.
const response = await tools.create_goal({objective});
if (!response || typeof response !== "object" || Array.isArray(response)) throw Error("STOP: unsupported native response");
const receipt = JSON.stringify(response);
const save = "import os,sys; from pathlib import Path; p=Path(sys.argv[1]); assert p.is_absolute() and not any(x.is_symlink() for x in (p,*p.parents)); fd=os.open(str(p),os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o444); f=os.fdopen(fd,'w',encoding='utf-8'); f.write(sys.argv[2]); f.close()";
const checked = await tools.exec_command({cmd: "python3 -B -c " + q(save) + " " + q(stageDir + "/native-goal-create.json") + " " + q(receipt) + " && python3 -B " + q(guard) + " --stage-dir " + q(stageDir) + " --json " + q(receipt), max_output_tokens: 1500});
if (checked.exit_code !== 0 || checked.session_id) throw Error("STOP: save/binding failed; preserve original receipt/diagnostic; no second Goal: " + checked.output);
text({activation_binding_checked: true, receipt_path: stageDir + "/native-goal-create.json", provenance_and_freshness: "UNKNOWN beyond checker"});

```

After successful activation, read input-map.json and only its permitted copied inputs. Work as one fresh finalizer resolving common source-backed criticism. After the shared source-backed critique, author a complete fresh final rewrite.

Both arms preserve all brief/plan obligations, supported capabilities, governing conditions and versions, negative constraints, useful alternatives, legitimate rejections, original history, uncertainty and future validation. Check the entire draft and corrections; deliver COMPLETE self-contained final.md, never just patches, excerpts or a criticism list. Full criticism dispositions must give accept/amend/reject/keep/uncertain decisions with primary evidence and reasons for every material criticism; B05/B08 generate their own critique.md as well. source-map.json maps final claims/sections to public primary URL, exact locator, version/hash where known, governing scope and unresolved uncertainty. When using any executable witness, save actual code, command/runtime/version, stdout/stderr/results and interpretation/limits; no invented execution. B01 treatment also saves amendments.json, assemble.py and actual assembly-results.json; record retained text intervals and replacements so assembly is reproducible. There is no scope truncation or word cap.

Tools frozen: ["functions.exec", "tools.exec_command", "tools.create_goal", "tools.update_goal", "tools.get_goal", "existing primary-source web/search tools when available"]. Both arms may independently expand source inspection and primary lookup. All execution is charged to this arm. No nested delegates, launches, reserve use, scheduler, provider/account/tier changes, parent history, evaluators, preparer scripts/findings/rubrics, sibling files or other arms. B05 control has no cache access. Filesystem access boundaries are an instruction contract, not proven sandbox isolation. Only the root dispatches and accounts for jobs. Requested route: Luna Max Standard; do not substitute another provider/model/tier. Record actual returned identity/observed options when available; unknown stays unknown.

Save outputs in ER13_RUNTIME/mechanics/dispatch-v1/admitted/B01-P02-control; required selection: ["final.md", "criticism-dispositions.md", "source-map.json", "witnesses/ actual code/results when used", "native-goal-create.json", "native-goal-terminal.json"]. Before the absolute deadline, after saving the complete result, complete the SAME native Goal once through tools.update_goal and save its full raw response by executing completion.js below in functions.exec. If incomplete, preserve partial artifacts with honest status and report failure; do not claim completion or reset/relaunch.
```javascript
const q = s => "'" + s.replaceAll("'", "'\\''") + "'";
const response = await tools.update_goal({status: "complete"});
const raw = JSON.stringify(response);
const save = "import os,sys; p=sys.argv[1]; fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o444); f=os.fdopen(fd,'w',encoding='utf-8'); f.write(sys.argv[2]); f.close()";
const saved = await tools.exec_command({cmd: "python3 -B -c " + q(save) + " " + q("ER13_RUNTIME/mechanics/dispatch-v1/admitted/B01-P02-control/native-goal-terminal.json") + " " + q(raw), max_output_tokens: 1000});
if (saved.exit_code !== 0 || saved.session_id) throw Error("STOP: terminal raw receipt save failed: " + saved.output);
text({terminal_receipt_path: "ER13_RUNTIME/mechanics/dispatch-v1/admitted/B01-P02-control/native-goal-terminal.json"});

```
