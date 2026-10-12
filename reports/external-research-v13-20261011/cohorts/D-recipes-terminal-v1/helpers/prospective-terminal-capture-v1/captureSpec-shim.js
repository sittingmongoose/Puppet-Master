// Inject IN MEMORY before the existing bootstrap's unique execution marker.
// Supersedes the activation-only shim, while reusing that installer unchanged.
captureSpec = async function(spec) {
  if (spec.alreadyDispatched) return spec;
  const helper = __HELPER_DIR_JSON__;
  const q = s => "'" + s.replaceAll("'", "'\\''") + "'";
  const p = await tools.exec_command({cmd: "python3 -B " + q(helper + "/install.py") + " --stage-dir " + q(spec.stageDir), max_output_tokens: 20000});
  if (p.exit_code !== 0 || p.session_id) throw Error("STOP: prospective activation+terminal preparation failed: " + p.output);
  return {...spec, ...JSON.parse(p.output)};
};
