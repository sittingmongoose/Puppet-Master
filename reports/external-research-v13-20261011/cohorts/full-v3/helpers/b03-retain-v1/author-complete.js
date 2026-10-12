// One successful same-Goal completion, only AFTER complete final output is frozen.
const stageDir = __STAGE_DIR_JSON__;
const config = __CONFIG_JSON__;
const helper = __HELPER_JSON__;
const q = s => "'" + s.replaceAll("'", "'\\''") + "'";
const save = "import os,sys; from pathlib import Path; p=Path(sys.argv[1]); assert p.is_absolute() and not any(x.is_symlink() for x in (p,*p.parents)); fd=os.open(p,os.O_CREAT|os.O_EXCL|os.O_WRONLY,0o444); f=os.fdopen(fd,'w'); f.write(sys.argv[2]); f.close()";
const active = await tools.get_goal({});
const captured = await tools.exec_command({cmd:"python3 -B -c " + q(save) + " " + q(stageDir + "/native-complete-active.json") + " " + q(JSON.stringify(active)),max_output_tokens:500});
if (captured.exit_code !== 0 || captured.session_id) throw Error("STOP: completion precheck capture failed");
const ready = await tools.exec_command({cmd:"python3 -B " + q(helper) + " finish --config " + q(config),max_output_tokens:500});
if (ready.exit_code !== 0 || ready.session_id) throw Error("STOP: complete final not ready; retain partial: " + ready.output);
// Actual native completion. No update_goal active exists or is needed.
const raw = await tools.update_goal({status:"complete"});
const saved = await tools.exec_command({cmd:"python3 -B -c " + q(save) + " " + q(stageDir + "/native-goal-terminal.json") + " " + q(JSON.stringify(raw)),max_output_tokens:500});
if (saved.exit_code !== 0 || saved.session_id) throw Error("STOP: native completion capture unknown; reconcile SAME Goal, no replay");
const terminal = await tools.exec_command({cmd:"python3 -B " + q(helper) + " terminal --config " + q(config),max_output_tokens:1500});
if (terminal.exit_code !== 0 || terminal.session_id) throw Error("STOP: terminal observation failed; preserve original receipt: " + terminal.output);
text(terminal.output);
