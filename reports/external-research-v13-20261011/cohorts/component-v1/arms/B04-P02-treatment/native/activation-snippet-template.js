// functions.exec body. Root substitutes only __STAGE_DIR_JSON__ with JSON.stringify(knownStageDir).
const stageDir = __STAGE_DIR_JSON__;
const q = s => "'" + s.replaceAll("'", "'\\''") + "'";
const guard = "ER12_RUNTIME/mechanics/exact-goal-binding-guard-v1/assert-active-goal.py";
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
