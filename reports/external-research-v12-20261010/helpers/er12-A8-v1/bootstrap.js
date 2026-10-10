// ROOT ONLY. Paste into T3 functions code mode after existing-queue capacity reservation.
// R0 bootstrap unchanged except recipe/config paths; no worker dispatch.
const RECIPE_DIR = "ER12_RUNTIME/helpers/er12-A8-v1";
const CONFIG = "/absolute/caller/path/er12-A8.json";
const STAGE = "investigator"; // investigator, critic, or reviser; one stage per invocation

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
const escJson = x => shq(JSON.stringify(x));

// Initialize/check the live catalog in this T3 turn; no pre-seeded functions.exec store is read.
const capRaw = await tools.mcp__t3_code__orchestrator_capabilities({});
const cap = unpack(capRaw);
const provider = cap.providers?.find(x => x.providerInstanceId === "AUTHORIZED_CODEX_PROVIDER_ID");
const model = provider?.models?.find(x => x.id === "gpt-6-luna");
const supported = (id, value) => model?.options?.some(x => x.id === id && x.options?.some(y => y.id === value));
if (!provider || !model || !supported("reasoningEffort", "max") || !supported("serviceTier", "priority")) {
  throw new Error("Authorized AUTHORIZED_CODEX_PROVIDER_ID / gpt-6-luna / max / priority route is unavailable; do not silently substitute.");
}
const capSnapshot = {
  observed_at_utc: new Date().toISOString(), providerInstanceId: provider.providerInstanceId,
  driverKind: provider.driverKind, model: model.id,
  supported: { reasoningEffort: ["max"], serviceTier: ["priority"] }
};
await py(["record-capabilities", "--config", CONFIG, "--stage", "investigator", "--json", JSON.stringify(capSnapshot)]);

// Each later stage must await its own exact predecessor T3 task(s), including zero pending runs.
const depSpec = await py(["deps", "--config", CONFIG, "--stage", STAGE]);
for (const dep of depSpec.predecessors) {
  const statusRaw = await tools.mcp__t3_code__task_status({taskId: dep.taskId});
  const status = unpack(statusRaw);
  if (status.taskId !== dep.taskId || status.status !== "completed" || status.hasPendingChildRuns) {
    text(JSON.stringify({blocked: "predecessor is not terminal", predecessor: dep.stage, taskId: dep.taskId, status}));
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
