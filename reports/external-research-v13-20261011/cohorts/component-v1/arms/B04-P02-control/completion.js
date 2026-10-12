const q = s => "'" + s.replaceAll("'", "'\\''") + "'";
const response = await tools.update_goal({status: "complete"});
const raw = JSON.stringify(response);
const save = "import os,sys; p=sys.argv[1]; fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o444); f=os.fdopen(fd,'w',encoding='utf-8'); f.write(sys.argv[2]); f.close()";
const saved = await tools.exec_command({cmd: "python3 -B -c " + q(save) + " " + q("ER13_RUNTIME/mechanics/dispatch-v1/admitted/B04-P02-control/native-goal-terminal.json") + " " + q(raw), max_output_tokens: 1000});
if (saved.exit_code !== 0 || saved.session_id) throw Error("STOP: terminal raw receipt save failed: " + saved.output);
text({terminal_receipt_path: "ER13_RUNTIME/mechanics/dispatch-v1/admitted/B04-P02-control/native-goal-terminal.json"});
