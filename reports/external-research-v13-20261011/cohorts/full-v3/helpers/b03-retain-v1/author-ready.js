// Bound prospectively by finite prepare. Run in original investigator functions.exec.
const stageDir = __STAGE_DIR_JSON__;
const config = __CONFIG_JSON__;
const q = s => "'" + s.replaceAll("'", "'\\''") + "'";
const helper = __HELPER_JSON__;
const save = "import os,sys; from pathlib import Path; p=Path(sys.argv[1]); assert p.is_absolute() and not any(x.is_symlink() for x in (p,*p.parents)); fd=os.open(p,os.O_CREAT|os.O_EXCL|os.O_WRONLY,0o444); f=os.fdopen(fd,'w'); f.write(sys.argv[2]); f.close()";
// get_goal observes the active original birth; no update_goal active/paused/complete.
const raw = await tools.get_goal({});
const saved = await tools.exec_command({cmd:"python3 -B -c " + q(save) + " " + q(stageDir + "/native-wait-active.json") + " " + q(JSON.stringify(raw)), max_output_tokens:500});
if (saved.exit_code !== 0 || saved.session_id) throw Error("STOP: active capture save failed; no replay/replacement");
const frozen = await tools.exec_command({cmd:"python3 -B " + q(helper) + " freeze-author --config " + q(config), max_output_tokens:500});
if (frozen.exit_code !== 0 || frozen.session_id) throw Error("STOP: draft freeze failed: " + frozen.output);
const waiter = await tools.exec_command({cmd:"python3 -B " + q(helper) + " wait --config " + q(config), yield_time_ms:1000, max_output_tokens:1000});
// Preserve/poll this SAME exec session via write_stdin, max 60s per poll.
text({blocking_wait:waiter, goal_kept_active:true, next:"No science or inference while waiting; poll the SAME session until successful release or honest failure/expiry."});
