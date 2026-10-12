// Root injects this immediately before the existing bootstrap's
// "// Paste into T3 functions code mode." marker, in memory only.
// install.py itself calls the original v21 transform on the first preparation.
captureSpec = async function(spec) {
  if (spec.alreadyDispatched) return spec;
  const helper = __HELPER_DIR_JSON__;
  const q = s => "'" + s.replaceAll("'", "'\\''") + "'";
  const p = await tools.exec_command({cmd: "python3 -B " + q(helper + "/install.py") + " --stage-dir " + q(spec.stageDir), max_output_tokens: 16000});
  if (p.exit_code !== 0 || p.session_id) throw Error("STOP: prospective capture preparation failed: " + p.output);
  return {...spec, ...JSON.parse(p.output)};
};
