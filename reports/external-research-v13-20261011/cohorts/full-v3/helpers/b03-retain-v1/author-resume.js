// Run after the original blocking waiter succeeds, in SAME context + SAME Goal.
const stageDir = __STAGE_DIR_JSON__;
const config = __CONFIG_JSON__;
const helper = __HELPER_JSON__;
const q = s => "'" + s.replaceAll("'", "'\\''") + "'";
const save = "import os,sys; from pathlib import Path; p=Path(sys.argv[1]); assert p.is_absolute() and not any(x.is_symlink() for x in (p,*p.parents)); fd=os.open(p,os.O_CREAT|os.O_EXCL|os.O_WRONLY,0o444); f=os.fdopen(fd,'w'); f.write(sys.argv[2]); f.close()";
const raw = await tools.get_goal({});
const saved = await tools.exec_command({cmd:"python3 -B -c " + q(save) + " " + q(stageDir + "/native-resume-active.json") + " " + q(JSON.stringify(raw)),max_output_tokens:500});
if (saved.exit_code !== 0 || saved.session_id) throw Error("STOP: original active capture failed; no new Goal");
const resumed = await tools.exec_command({cmd:"python3 -B " + q(helper) + " resume --config " + q(config),max_output_tokens:2000});
if (resumed.exit_code !== 0 || resumed.session_id) throw Error("STOP: original-author resume refused: " + resumed.output);
text(resumed.output);
