// Phase-2 gate: cmd.chat.* cutover — exercise EVERY canonical producer row,
// capture all events via the pmq-uicommand listener, and assert each row's
// payload contract (required keys + values). No old IDs may appear.
import { startServer, openHost, settle, results } from "./pw.mjs";

const R = results("probe-phase2-commands");
const server = await startServer();
try {
  const { browser, page, errors } = await openHost(server.port, "w=w1&t=t12&theme=friendly-dark&width=975");
  await settle(page, 500);
  const info = await page.evaluate(() => {
    const events = [];
    const listener = e => { events.push(JSON.parse(JSON.stringify(e.detail))); };
    window.addEventListener("pmq-uicommand", listener);
    const s = window.PMChatHost.api.store;
    const key = "thread-12";
    s.switchThread(key);

    // question family: answer / skip / submit / cancel
    const q1 = s.activeQuestionnaire(key);
    if (q1) {
      const first = q1.questions[0];
      s.questSetAnswer(q1, first, first.kind === "freeform" ? "probe answer" : (first.options ? [first.options[0].id || first.options[0]] : ["a"]));
      s.questSkip(q1);
      s.questCancel(q1);
    }
    // submit path on the second questionnaire if present, else re-cancel safety
    const q2 = s.activeQuestionnaire(key);
    if (q2) {
      q2.questions.forEach(qq => s.questSetAnswer(q2, qq, qq.kind === "freeform" ? "v" : (qq.options ? [qq.options[0].id || qq.options[0]] : ["a"])));
      s.questSubmit(q2);
    }

    // goal family: start / pause / resume / stop / update / replan
    s.goalAct("thread-14", "start");
    s.goalAct("thread-14", "pause");
    s.goalAct("thread-14", "resume");
    s.goalAct("thread-14", "stop");
    s.goalSaveObjective("thread-14", "Cutover probe objective");

    // context family: compact_now / lens_set_mode / lens_toggle / source.add / source.remove
    s.compactNow(key);
    s.lensSetMode("subcompact");
    const msgs = s.messages(key);
    const mid = msgs.length ? msgs[msgs.length - 1].id : null;
    if (mid) s.lensToggle(mid);
    s.lensSetMode("off");
    s.contextSourceAdd(key, "thread-04", mid);
    const adm = s.admissionOf(key);
    const removableIdx = adm.included.findIndex(x => x.removable);
    s.admissionRemove(key, removableIdx >= 0 ? removableIdx : adm.included.length - 1);

    // route.select (model change) + access.set + bsd.set
    s.applyModelChange(key, { provider: "Anthropic", model: "Opus 5", accountId: "ant-pro" });
    s.applyModelChange(key, { provider: "Alibaba", model: "Qwen 3.8" });
    s.setAccount("ali-work");
    s.accessSet(key, "Auto");
    s.accessSet(key, "Ask for approval");
    s.bsdSet("on", "turn");
    s.bsdSet("auto", "thread");

    // redirect (payload must include text)
    s.redirectTurn(key, "cutover redirect text");

    // thread.request / await / branch / spawn / rewind / restore_point.create
    const reqId = s.threadRequestSend("thread-04", "cutover request text");
    s.threadRequestReceive(key, reqId, "response");
    s.restorePointCreate(key, mid);
    const rps = s.thread(key).restorePoints;
    s.rewindTo(key, rps[rps.length - 1].id);
    const branchId = s.branchFrom(key, mid, { model: "Kimi K3" });
    const spawnId = s.spawnRelated(key, "cutover spawn");

    // history.pin / unpin
    s.setPin("w1", true);
    s.setPin("w1", false);

    // artifact.open / close / switch / retry
    s.artOpen("w1", "art-spec");
    s.artSwitch("w1", "art-plan");
    s.artRetry(key, "art-plan", "w1");
    s.artClose("w1");

    // approval.deny / allow_once / allow_session / details
    const ap1 = s.approvalInject(key, { kind: "tool", question: "cutover deny?" });
    s.approvalResolve(key, ap1, "deny");
    const ap2 = s.approvalInject(key, { kind: "tool", question: "cutover once?" });
    s.approvalResolve(key, ap2, "allow_once");
    const ap3 = s.approvalInject(key, { kind: "tool", question: "cutover session?" });
    s.approvalResolve(key, ap3, "allow_session");
    s.approvalDetails(key, ap3);

    // warning.resolve (capacity kind) + cross_project.request
    const wr1 = s.warningInject(key, { kind: "capacity", text: "capacity probe", choices: ["Reduce"] });
    s.warningResolve(key, wr1, "reduce");
    const wr2 = s.warningInject(key, { kind: "cross-project", text: "cross probe", projectRead: "Project A", projectWrite: "Project B", choices: ["Allow once"] });
    s.warningResolve(key, wr2, "allow-once");

    // attachment.resolve / attachment.route
    s.attachSetRoute(key, "att-probe", "unsupported", false);
    s.attachResolve("att-probe", "pm-transformed");
    s.attachConsentAlternate("att-probe", "Gemini");

    // crew.start
    s.crewStart(key, "crew-probe");

    // outbox.queue / outbox.flush
    s.connSetStatus("offline");
    s.connQueue({ threadKey: key, text: "offline probe", attachments: [] });
    s.connReconnect();

    // browser_program.open via shell hostApi
    try { window.PMChatHost.api.env.hostApi.openEditorTab({ id: "bp-1", title: "Capture", kind: "browser capture", detail: "demo" }); } catch (e) {}

    // cleanup probe side effects
    s.state.extraThreads = s.state.extraThreads.filter(t => t.id !== branchId && t.id !== spawnId);
    delete s.state.threads[branchId]; delete s.state.threads[spawnId];
    s.thread(key).warnings = s.thread(key).warnings.filter(w => !["capacity", "cross-project"].includes(w.kind) || w.resolved);
    s.thread(key).admission = null;
    s.state.connection.outbox = [];
    window.removeEventListener("pmq-uicommand", listener);
    return events;
  });
  R.check("zero page errors", errors.length === 0, errors.slice(0, 3).join(" | "));

  const oldPatterns = [/cmd\.questionnaire\./, /cmd\.goal\./, /cmd\.warning\./, /cmd\.approval\./, /cmd\.context_lens\./, /cmd\.artifact\.open_workspace/, /cmd\.chat\.turn\.redirect/, /cmd\.chat\.create_restore_point/, /cmd\.chat\.rewind\b/, /cmd\.context\.compact_now/, /cmd\.chat\.thread\.request_send/, /cmd\.chat\.thread\.request_receive/, /cmd\.chat\.thread\.spawn_related/];
  const oldHits = info.filter(e => oldPatterns.some(p => p.test(e.id)));
  R.check("no old command IDs emitted", oldHits.length === 0, oldHits.map(e => e.id).join(","));
  const uncataloged = info.filter(e => !e.cataloged);
  R.check("all emitted commands cataloged", uncataloged.length === 0, uncataloged.map(e => e.id).join(","));

  // per-row payload contracts: id -> required keys (and optional value predicates)
  const contracts = {
    "cmd.chat.question.answer": { keys: ["questionnaire_id", "question_id", "value"] },
    "cmd.chat.question.skip": { keys: ["questionnaire_id", "question_id"] },
    "cmd.chat.question.submit": { keys: ["questionnaire_id", "answers"] },
    "cmd.chat.question.cancel": { keys: ["questionnaire_id"] },
    "cmd.chat.goal.start": { keys: ["thread_id", "goal_id"] },
    "cmd.chat.goal.pause": { keys: ["thread_id", "goal_id"] },
    "cmd.chat.goal.resume": { keys: ["thread_id", "goal_id"] },
    "cmd.chat.goal.stop": { keys: ["thread_id", "goal_id"] },
    "cmd.chat.goal.update": { keys: ["thread_id", "goal_id", "objective"] },
    "cmd.chat.goal.replan": { keys: ["thread_id", "goal_id", "replan_count"], test: e => typeof e.payload.replan_count === "number" },
    "cmd.chat.context.compact_now": { keys: ["thread_id", "summary"] },
    "cmd.chat.context.lens_set_mode": { keys: ["thread_id", "mode"] },
    "cmd.chat.context.lens_toggle": { keys: ["thread_id", "mode", "message_id"] },
    "cmd.chat.context.source.add": { keys: ["thread_id", "thread_source", "message_id"] },
    "cmd.chat.context.source.remove": { keys: ["thread_id", "label"] },
    "cmd.chat.route.select": { keys: ["thread_id", "account_id"], test: e => ("kind" in e.payload && e.payload.kind === "account") || (["provider", "model", "effort", "speed"].every(k => k in e.payload)) },
    "cmd.chat.access.set": { keys: ["thread_id", "access"] },
    "cmd.chat.bsd.set": { keys: ["thread_id", "mode", "scope"] },
    "cmd.chat.redirect": { keys: ["thread_id", "text"], test: e => e.payload.text === "cutover redirect text" },
    "cmd.chat.thread.request": { keys: ["thread_id", "target_thread", "request_id", "text"], test: e => e.payload.text === "cutover request text" },
    "cmd.chat.thread.await": { keys: ["request_id"] },
    "cmd.chat.thread.branch": { keys: ["thread_id", "source_thread", "new_thread", "message_id", "model"], test: e => e.payload.source_thread === e.payload.thread_id && e.payload.model === "Kimi K3" },
    "cmd.chat.thread.spawn": { keys: ["thread_id", "new_thread", "parent"] },
    "cmd.chat.thread.rewind": { keys: ["thread_id", "restore_point"] },
    "cmd.chat.restore_point.create": { keys: ["thread_id", "message_id"] },
    "cmd.chat.history.pin": { keys: ["window_id"] },
    "cmd.chat.history.unpin": { keys: ["window_id"] },
    "cmd.chat.artifact.open": { keys: ["window_id", "artifact_id"] },
    "cmd.chat.artifact.close": { keys: ["window_id", "artifact_id"] },
    "cmd.chat.artifact.switch": { keys: ["window_id", "artifact_id"], test: e => e.payload.artifact_id === "art-plan" },
    "cmd.chat.artifact.retry": { keys: ["window_id", "artifact_id"] },
    "cmd.chat.approval.deny": { keys: ["thread_id", "approval_id"] },
    "cmd.chat.approval.allow_once": { keys: ["thread_id", "approval_id"] },
    "cmd.chat.approval.allow_session": { keys: ["thread_id", "approval_id"] },
    "cmd.chat.approval.details": { keys: ["thread_id", "approval_id"] },
    "cmd.chat.warning.resolve": { keys: ["thread_id", "warning_id", "kind", "choice"], test: e => e.payload.kind === "capacity" },
    "cmd.chat.attachment.resolve": { keys: ["attachment_id", "route"], test: e => e.payload.route === "pm-transformed" },
    "cmd.chat.attachment.route": { keys: ["attachment_id", "target"], test: e => e.payload.target === "Gemini" },
    "cmd.chat.crew.start": { keys: ["thread_id", "crew_id"] },
    "cmd.chat.cross_project.request": { keys: ["thread_id", "project_read", "project_write", "scope"], test: e => e.payload.project_read === "Project A" && e.payload.project_write === "Project B" },
    "cmd.chat.outbox.queue": { keys: ["entry_id"] },
    "cmd.chat.outbox.flush": { keys: ["count"], test: e => e.payload.count >= 1 },
    "cmd.browser_program.open": { keys: ["kind"], test: e => e.payload.kind === "Browser Program capture" }
  };
  const problems = [];
  Object.keys(contracts).forEach(id => {
    const evs = info.filter(e => e.id === id);
    if (!evs.length) { problems.push(id + ": never emitted"); return; }
    const c = contracts[id];
    evs.forEach((ev, n) => {
      const missingKeys = c.keys.filter(k => !(k in ev.payload));
      if (missingKeys.length) problems.push(id + "#" + n + ": missing keys " + missingKeys.join(","));
      if (c.test && !c.test(ev)) problems.push(id + "#" + n + ": value contract failed");
    });
  });
  R.check("every canonical row emitted with contract payload", problems.length === 0, problems.join(" | "));

  // Visible-button path: click "Switch here" on thread-17's seeded route warning.
  // cmd.chat.route.select must fire; cmd.chat.warning.resolve must NOT fire for route kind.
  await page.evaluate(() => window.PMChatHost.api.store.switchThread("thread-17"));
  await settle(page, 700);
  await page.evaluate(() => {
    window.__pmClickEvents = [];
    window.__pmClickListener = e => window.__pmClickEvents.push(JSON.parse(JSON.stringify(e.detail)));
    window.addEventListener("pmq-uicommand", window.__pmClickListener);
  });
  const hasBtn = await page.locator('.pmq-warning [data-wract="Switch here"]').count() > 0;
  R.check("route warning Switch here button present", hasBtn);
  if (hasBtn) {
    // Open the t1 work disclosure so the warning card is laid out and
    // hit-testable, then drive the real button with a strict pointer click.
    await page.evaluate(() => {
      const caps = document.querySelector(".pmq-t1-workcaps");
      if (caps && caps.getAttribute("aria-expanded") !== "true") caps.click();
    });
    await settle(page, 500);
    const btn = page.locator('.pmq-warning [data-wract="Switch here"]').first();
    await btn.scrollIntoViewIfNeeded();
    await btn.click({ timeout: 8000 });
    await settle(page, 500);
    const clickInfo = await page.evaluate(() => {
      window.removeEventListener("pmq-uicommand", window.__pmClickListener);
      return window.__pmClickEvents;
    });
    const routeSel = clickInfo.find(e => e.id === "cmd.chat.route.select" && e.payload.provider === "Anthropic" && e.payload.model === "Opus 5");
    R.check("Switch here emits route.select", !!routeSel, clickInfo.map(e => e.id).join(","));
    const doubleResolve = clickInfo.find(e => e.id === "cmd.chat.warning.resolve" && e.payload.kind === "route");
    R.check("route resolution emits no warning.resolve", !doubleResolve);
    // restore thread-17 route for downstream phases
    await page.evaluate(() => window.PMChatHost.api.store.applyModelChange("thread-17", { provider: "Alibaba", model: "Qwen 3.8" }));
  }
  await browser.close();
} finally {
  server.proc.kill();
}
const s = R.summary();
console.log(JSON.stringify(s));
process.exit(s.fail ? 1 : 0);
