// Fresh critic only. Capture terminal directly after required science, then END task.
const stageDir = __STAGE_DIR_JSON__;
const config = __CONFIG_JSON__;
const helper = __HELPER_JSON__;
const q = s => "'" + s.replaceAll("'", "'\\''") + "'";
const save = "import os,sys; from pathlib import Path; p=Path(sys.argv[1]); assert p.is_absolute() and not any(x.is_symlink() for x in (p,*p.parents)); fd=os.open(p,os.O_CREAT|os.O_EXCL|os.O_WRONLY,0o444); f=os.fdopen(fd,'w'); f.write(sys.argv[2]); f.close()";
const active = await tools.get_goal({});
const captured = await tools.exec_command({cmd:"python3 -B -c " + q(save) + " " + q(stageDir + "/native-critic-complete-active.json") + " " + q(JSON.stringify(active)),max_output_tokens:500});
if (captured.exit_code !== 0 || captured.session_id) throw Error("STOP: critic precompletion capture failed");
const checked = await tools.exec_command({cmd:"python3 -B " + q(helper) + " critic-check --config " + q(config),max_output_tokens:500});
if (checked.exit_code !== 0 || checked.session_id) throw Error("STOP: critic incomplete/expired; retain partial: " + checked.output);
const raw = await tools.update_goal({status:"complete"});
const saved = await tools.exec_command({cmd:"python3 -B -c " + q(save) + " " + q(stageDir + "/native-goal-terminal.json") + " " + q(JSON.stringify(raw)),max_output_tokens:500});
if (saved.exit_code !== 0 || saved.session_id) throw Error("STOP: critic completion unknown; preserve same Goal, no replay");
text({critic_native_terminal_captured:true, path:stageDir + "/native-goal-terminal.json", next:"End the critic task now. Dispatcher must separately observe task terminal and freeze custody before author receives criticism."});
