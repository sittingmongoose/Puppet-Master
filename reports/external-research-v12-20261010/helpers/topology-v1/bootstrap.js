// Paste into T3 functions code mode. Edit these caller-owned paths/stage first.
const RECIPE_DIR = "ER12_RUNTIME/helpers/topology-v1";
const CONFIG = "/absolute/caller/path/er12-topology.json";
const STAGE = "investigator"; // A2: investigator, critic, notify; A7: investigator, critic-finalizer
// ROOT ONLY: reserve capacity in the existing queue before investigator/critic dispatch.
// No new queue, automatic follow-up stage dispatch, or worker dispatch.

const shq = s => "'" + String(s).replaceAll("'", "'\\''") + "'";
const py = async args => {
  const r = await tools.exec_command({cmd: `python3 ${shq(RECIPE_DIR + "/prepare.py")} ${args.map(shq).join(" ")}`, max_output_tokens: 2500});
  if (r.exit_code !== 0) throw new Error(r.output || `prepare.py exited ${r.exit_code}`);
  return JSON.parse(r.output);
};
const unpack = r => {
  if (r?.structuredContent) return r.structuredContent;
  const s = r?.content?.find(x => x.type === "text")?.text;
  if (!s) throw new Error("T3 response had no structured content or text JSON");
  return JSON.parse(s);
};
// Retained-author notification is an in-flight update, never a new delegated review round.
// This branch allocates no capacity and creates no task/Goal.
if (STAGE === "notify") {
  const depSpec = await py(["deps", "--config", CONFIG, "--stage", "critic"]);
  for (const dep of depSpec.predecessors) {
    const status = unpack(await tools.mcp__t3_code__task_status({taskId: dep.taskId}));
    await py(["record-status", "--config", CONFIG, "--stage", dep.stage, "--json", JSON.stringify(status)]);
  }
  const criticDep = await tools.exec_command({cmd: `python3 -c 'import json,sys;from pathlib import Path;c=json.load(open(sys.argv[1]));print(json.dumps(json.load(open(Path(c["runtime_root"])/"stages/critic/dispatch.json"))["returned"]))' ${shq(CONFIG)}`, max_output_tokens: 1000});
  if (criticDep.exit_code !== 0) throw new Error(criticDep.output);
  const critic = JSON.parse(criticDep.output);
  const status = unpack(await tools.mcp__t3_code__task_status({taskId: critic.taskId}));
  await py(["record-status", "--config", CONFIG, "--stage", "critic", "--json", JSON.stringify(status)]);
  const bound = await py(["bind-critic", "--config", CONFIG]);
  const target = depSpec.predecessors[0];
  const d = await tools.exec_command({cmd: `python3 -c 'import json,sys;from pathlib import Path;c=json.load(open(sys.argv[1]));print(json.dumps(json.load(open(Path(c["runtime_root"])/"stages/investigator/dispatch.json"))["returned"]))' ${shq(CONFIG)}`, max_output_tokens: 1000});
  if (d.exit_code !== 0) throw new Error(d.output);
  const investigator = JSON.parse(d.output);
  // Re-query after bind. If original task ended, do not reopen or substitute.
  const live = unpack(await tools.mcp__t3_code__task_status({taskId: target.taskId}));
  if (!["running", "waiting"].includes(live.status) || live.childRunId !== investigator.childRunId || live.childThreadId !== investigator.childThreadId || live.hasPendingChildRuns) {
    text({unsupported: "original A2 investigator is no longer active in its original run", live}); exit();
  }
  const response = await tools.mcp__t3_code__t3_thread_send({threadId: investigator.childThreadId, mode: "steer", message: bound.message, clientRequestId: bound.clientRequestId});
  const sent = unpack(response);
  const captured = JSON.stringify({captured_at_utc: new Date().toISOString(), raw_response: response});
  const saved = await tools.exec_command({cmd: `python3 -c 'import json,sys;from pathlib import Path;c=json.load(open(sys.argv[1]));p=Path(c["runtime_root"])/"control/notification-delivery.json";tmp=p.with_suffix(".tmp");tmp.write_text(sys.argv[2]+chr(10)) if not p.exists() else None;tmp.replace(p) if not p.exists() else None' ${shq(CONFIG)} ${shq(captured)}`, max_output_tokens: 1000});
  if (saved.exit_code !== 0) throw new Error(saved.output);
  if (sent.delivery !== "steered" || sent.runId !== investigator.childRunId || sent.threadId !== investigator.childThreadId) {
    text({unsupported: "notification did not steer the original investigator run; no fresh-Goal substitution", sent}); exit();
  }
  text({stage: "notify", taskId: investigator.taskId, childRunId: investigator.childRunId, notification: sent});
  exit();
}

// Initialize/check the live catalog in this T3 turn; no pre-seeded functions.exec store is read.
const capRaw = await tools.mcp__t3_code__orchestrator_capabilities({});
const cap = unpack(capRaw);
const provider = cap.providers?.find(x => x.providerInstanceId === "AUTHORIZED_PROVIDER_INSTANCE");
const model = provider?.models?.find(x => x.id === "gpt-6-luna");
const supported = (id, value) => model?.options?.some(x => x.id === id && x.options?.some(y => y.id === value));
if (!provider || !model || !supported("reasoningEffort", "max") || !supported("serviceTier", "priority")) {
  throw new Error("Authorized AUTHORIZED_PROVIDER_INSTANCE / gpt-6-luna / max / priority route is unavailable; do not silently substitute.");
}
const capSnapshot = {
  observed_at_utc: new Date().toISOString(), providerInstanceId: provider.providerInstanceId,
  driverKind: provider.driverKind, model: model.id,
  supported: { reasoningEffort: ["max"], serviceTier: ["priority"] }
};
await py(["record-capabilities", "--config", CONFIG, "--stage", "investigator", "--json", JSON.stringify(capSnapshot)]);

// Read only exact owned predecessor IDs; A2 is active-original, A7 is terminal/quiet.
const depSpec = await py(["deps", "--config", CONFIG, "--stage", STAGE]);
for (const dep of depSpec.predecessors) {
  const statusRaw = await tools.mcp__t3_code__task_status({taskId: dep.taskId});
  const status = unpack(statusRaw);
  const acceptable = dep.required_state === "original-active"
    ? ["running", "waiting"].includes(status.status)
    : status.status === "completed";
  if (status.taskId !== dep.taskId || !acceptable || status.hasPendingChildRuns) {
    text(JSON.stringify({blocked: "predecessor does not satisfy topology lifecycle", predecessor: dep.stage, taskId: dep.taskId, status}));
    exit();
  }
  await py(["record-status", "--config", CONFIG, "--stage", dep.stage, "--json", JSON.stringify(status)]);
}

// prepare.py writes immutable assignment/request inputs first and reuses the same idempotency key on retry.
const spec = await py(["prepare", "--config", CONFIG, "--stage", STAGE]);
if (spec.alreadyDispatched) {
  const d = spec.dispatch.returned || {};
  text(JSON.stringify({alreadyDispatched: true, stage: STAGE, taskId: d.taskId, childThreadId: d.childThreadId, childRunId: d.childRunId, status: d.status}));
  exit();
}
// Current T3 machine rule: every new worker requires at least 6 GB available.
// A blocked retry keeps the exact frozen request and original deadlines.
const mem = await tools.exec_command({cmd: "free -g", max_output_tokens: 300});
const memRow = mem.output.split("\n").find(x => /^Mem:/.test(x));
const availableGiB = Number(memRow?.trim().split(/\s+/).at(-1));
if (mem.exit_code !== 0 || !Number.isFinite(availableGiB) || availableGiB < 6) {
  text({blocked: "T3 requires at least 6 GB available before another worker", availableGiB});
  exit();
}
const response = await tools.mcp__t3_code__delegate_task(spec.args);
let returned = null;
try { returned = unpack(response); } catch { returned = {}; }
await py(["record", "--config", CONFIG, "--stage", STAGE, "--json", JSON.stringify(response)]);
text(JSON.stringify({
  stage: STAGE, clientRequestId: spec.args.clientRequestId,
  taskId: returned?.taskId || null, childThreadId: returned?.childThreadId || null,
  childRunId: returned?.childRunId || null, providerInstanceId: returned?.providerInstanceId || null,
  model: returned?.model || null, status: returned?.status || null,
  optionsEffective: "UNKNOWN unless returned by a supported runtime observation"
}));
