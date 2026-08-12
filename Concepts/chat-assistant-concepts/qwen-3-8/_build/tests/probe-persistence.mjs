// Probe 7 — localStorage round-trip (packet §06/§07).
// Set thread-local model/access/BSD/crew/worktree on thread-17, reload,
// assert restored AND sibling thread-16 unaffected; __pmChatRestart restart
// simulation retains goal state.
import { startServer, openHost, settle, results } from "./pw.mjs";
import { record, check } from "./report.mjs";

const R = results("probe-persistence");
const server = await startServer();
const checks = [];
try {
  const { browser, page, errors } = await openHost(server.port, "w=w1&t=t1&theme=friendly-dark&width=975&dt=thread-17");
  await settle(page, 600);

  await page.evaluate(() => {
    const s = window.PMChatHost.api.store;
    s.applyModelChange("thread-17", { provider: "Anthropic", model: "Opus 5", accountId: "ant-pro" });
    s.accessSet("thread-17", "Auto accept edits");
    s.bsdSet("on", "thread");
    s.crewSet("thread-17", { title: "Persist probe crew", summary: "1 member", members: [{ role: "Probe", route: "Opus 5", state: "running" }] });
    s.opsAddWorktree("thread-17", { name: "persist-probe-wt", state: "isolated", owner: "probe" });
    s.setPin("w1", true);
  });
  await page.evaluate(() => new Promise(r => setTimeout(r, 450)));

  // capture thread-16 baseline (must stay default)
  const baseline16 = await page.evaluate(() => {
    const s = window.PMChatHost.api.store;
    return { settings: s.thread("thread-16").settings, bsd: s.thread("thread-16").bsd };
  });

  await page.reload({ waitUntil: "load" });
  await page.waitForSelector(".pmq-msg", { timeout: 15000 });
  await settle(page, 700);

  const restored = await page.evaluate(() => {
    const s = window.PMChatHost.api.store;
    const eff = s.effectiveSettings("thread-17");
    return {
      model: eff.model,
      account: eff.account,
      access: eff.access,
      bsd: s.thread("thread-17").bsd.mode,
      bsdScope: s.thread("thread-17").bsd.scope,
      crew: s.crewOf("thread-17") ? s.crewOf("thread-17").title : null,
      worktree: s.operationalOf("thread-17").worktrees.some(w => w.name === "persist-probe-wt"),
      pinned: s.isPinned("w1")
    };
  });
  checks.push(check("thread-local model+account restored", restored.model === "Opus 5" && restored.account === "ant-pro", JSON.stringify({ model: restored.model, account: restored.account })));
  checks.push(check("thread-local access restored", restored.access === "Auto accept edits", restored.access));
  checks.push(check("BSD mode/scope restored", restored.bsd === "on" && restored.bsdScope === "thread", restored.bsd + "/" + restored.bsdScope));
  checks.push(check("crew restored", restored.crew === "Persist probe crew", restored.crew));
  checks.push(check("worktree restored", restored.worktree === true));
  checks.push(check("pin state restored", restored.pinned === true));

  const after16 = await page.evaluate(() => {
    const s = window.PMChatHost.api.store;
    return { settings: s.thread("thread-16").settings, bsd: s.thread("thread-16").bsd };
  });
  const untouched = JSON.stringify(after16.settings) === JSON.stringify(baseline16.settings) && after16.bsd.mode === "auto";
  checks.push(check("sibling thread-16 unaffected", untouched, JSON.stringify(after16)));

  // restart simulation retains goal state
  await page.evaluate(() => window.__pmDemoTrigger("goal.pause", {}));
  await settle(page, 300);
  const restart = await page.evaluate(() => {
    const fresh = window.__pmChatRestart();
    return { goalStatus: fresh.thread("thread-17").goalStatus, outboxOk: !!fresh.state.connection };
  });
  checks.push(check("__pmChatRestart retains goal state", restart.goalStatus === "paused", JSON.stringify(restart)));

  checks.push(check("zero page errors", errors.length === 0, errors.slice(0, 2).join(" | ")));
  await browser.close();
} finally {
  server.proc.kill();
}
checks.forEach(c => R.check(c.name, c.pass, c.detail));
record("probe-persistence", "thread-17/16", "975", "friendly-dark", "full", checks);
const s = R.summary();
console.log(JSON.stringify(s));
process.exit(s.fail ? 1 : 0);
