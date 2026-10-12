// Loaded once after outputs, in the same actual candidate native Goal context.
const stageDir = "ER13_RUNTIME/mechanics/dispatch-v1/admitted/D-R2-P04-control/run/D-R2-P04-control/stages/reviser";
const checker = stageDir + "/native-terminal-check.py";
const q = s => "'" + s.replaceAll("'", "'\\''") + "'";
const checkPin = "import hashlib,sys; from pathlib import Path; p=Path(sys.argv[1]); assert p.is_absolute() and not any(x.is_symlink() for x in (p,*p.parents)); assert hashlib.sha256(p.read_bytes()).hexdigest()==sys.argv[2], 'completion checker pin mismatch'";
const pinCommand = "python3 -B -c " + q(checkPin) + " " + q(checker) + " " + q("df755488646c925e64e01141b2c1a58140873fa4a4bd92c1aadd771e47640a2c");
const call = async (action, raw) => tools.exec_command({cmd: pinCommand + " && python3 -B " + q(checker) + " --stage-dir " + q(stageDir) + " --binding-sha " + q("b7f85dec77a8cf948cb9d33d9fc00f14ca22af7374b06212b37dd7855a521e97") + " --action " + q(action) + (raw === undefined ? "" : " --json " + q(raw)), max_output_tokens: 1500});
let phase = "preflight";
try {
  if (typeof tools.exec_command !== "function" || typeof tools.get_goal !== "function" || typeof tools.update_goal !== "function") throw Error("unsupported native tools");
  const disk = await call("preflight");
  if (disk.exit_code !== 0 || disk.session_id) throw Error("original birth/deadline/outputs preflight failed: " + disk.output);
  // Getter is identity/status preflight ONLY. Never a completion receipt.
  const live = await tools.get_goal({});
  const claimed = await call("claim", JSON.stringify(live));
  if (claimed.exit_code !== 0 || claimed.session_id) throw Error("same active birth/attempt claim failed: " + claimed.output);
  phase = "update_outcome_unknown";
  // One actual update, after exclusive attempt claim. No retry or replacement Goal.
  const response = await tools.update_goal({status: "complete"});
  phase = "direct_response_save_or_guard_failed";
  const receipt = JSON.stringify(response);
  text(receipt); // Entire ACTUAL update return, even if the following save fails.
  if (typeof receipt !== "string") throw Error("direct completion return is not serializable JSON");
  const saved = await call("save", receipt);
  if (saved.exit_code !== 0 || saved.session_id) throw Error("direct terminal save/binding/output check failed: " + saved.output);
  text({terminal_capture_checked: true, receipt_path: stageDir + "/native-goal-terminal.json", source: "direct_update_goal_return", provenance_independently_proved: false});
} catch (error) {
  const failed = {terminal_capture_failed: true, phase, reason: String(error), completion_retry_allowed: false, getter_is_not_completion_receipt: true};
  text(failed);
  try {
    const recorded = await call("failure", JSON.stringify(failed));
    if (recorded.exit_code !== 0 || recorded.session_id) text({failed_capture_record_save_failed: true, preserve_original_error: true, detail: recorded.output});
  } catch (recordError) {
    text({failed_capture_record_save_failed: true, preserve_original_error: true, detail: String(recordError)});
  }
  throw Error("STOP: completion capture failed/unknown; preserve original response/attempt/diagnostic; no retry, getter substitution or new Goal");
}
