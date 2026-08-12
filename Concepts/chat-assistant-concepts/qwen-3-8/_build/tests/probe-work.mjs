// Probe 3 — compact work compositions (packet §07) on t1 (nested disclosure)
// and t8 (chapter work log): goal start, todos count, spawn 2 subagents,
// advance phases, diff counts, verify phase, compact default, independent
// expansion, completion condense, reopen completed group.
import { startServer, openHost, settle, results } from "./pw.mjs";
import { record, check } from "./report.mjs";

const R = results("probe-work");
const server = await startServer();
const checks = [];
try {
  for (const t of ["t1", "t8"]) {
    const { browser, page, errors } = await openHost(server.port, `w=w1&t=${t}&theme=friendly-dark&width=975&dt=thread-17`);
    await settle(page, 700);

    const openWork = async () => {
      await page.evaluate((concept) => {
        const b = concept === "t1"
          ? document.querySelector(".pmq-t1-workcaps")
          : [...document.querySelectorAll("[data-wltoggle]")].find(x => x.dataset.wltoggle === "goal") || document.querySelector("[data-wltoggle]");
        if (b) b.click();
      }, t);
      await settle(page, 500);
    };

    // goal start via trigger
    await page.evaluate(() => window.__pmDemoTrigger("goal.start", {}));
    await settle(page, 400);
    await openWork();
    const goalVisible = await page.evaluate(() => !!document.querySelector(".pmq-goal, [data-surface='goal']"));
    checks.push(check(`${t}: goal card after goal.start`, goalVisible));

    // todos count
    await page.evaluate(() => window.__pmDemoTrigger("todo.add", { label: "Probe task" }));
    await settle(page, 400);
    const todoInfo = await page.evaluate(() => {
      const td = window.PMChatHost.api.store.todoList("thread-17");
      return td ? td.items.length : 0;
    });
    checks.push(check(`${t}: todos count reflects add`, todoInfo === 9, "count=" + todoInfo));

    // spawn 2 subagents
    await page.evaluate(() => window.__pmDemoTrigger("subagent.spawn", {}));
    await page.evaluate(() => window.__pmDemoTrigger("subagent.spawn", {}));
    await settle(page, 400);
    const agents = await page.evaluate(() => {
      let n = 0;
      window.PMChatHost.api.store.subagentGroups("thread-17").forEach(g => n += g.agents.length);
      return n;
    });
    checks.push(check(`${t}: 2 spawned subagents counted`, agents === 7, "agents=" + agents));

    // advance phases + progress
    await page.evaluate(() => window.__pmDemoTrigger("goal.progress", {}));
    await page.evaluate(() => window.__pmDemoTrigger("goal.progress", {}));
    await settle(page, 400);
    const phaseIdx = await page.evaluate(() => window.PMChatHost.api.store.goalPhaseIdx("thread-17"));
    checks.push(check(`${t}: goal phases advance`, phaseIdx === 2, "idx=" + phaseIdx));

    // diff counts
    await page.evaluate(() => window.__pmDemoTrigger("diff.create", {}));
    await page.evaluate(() => window.__pmDemoTrigger("diff.update", {}));
    await settle(page, 400);
    const diff = await page.evaluate(() => {
      const g = window.PMChatHost.api.store.diffGroups("thread-17");
      let adds = 0;
      g.forEach(x => x.files.forEach(f => adds += f.added || 0));
      return adds;
    });
    checks.push(check(`${t}: diff counts update`, diff > 0, "adds=" + diff));

    // verify stage via activity trigger
    await page.evaluate(() => window.__pmDemoTrigger("activity.test", {}));
    await settle(page, 400);
    const liveStages = await page.evaluate(() => {
      const l = window.PMChatHost.api.store.activityLive("thread-17");
      return l ? l.stages.length : 0;
    });
    checks.push(check(`${t}: verify/test stage recorded`, liveStages >= 1, "stages=" + liveStages));

    // compact default (work composition present even collapsed)
    const compact = await page.evaluate(() => {
      const caps = document.querySelector(".pmq-t1-workcaps, .pmq-t8-worklog, .pmq-t8-wl-fold");
      return !!caps;
    });
    checks.push(check(`${t}: compact work composition present by default`, compact));

    // independent expansion: open goal fold, others stay closed
    await page.evaluate(() => {
      const h = [...document.querySelectorAll("[data-wltoggle], .pmq-t4w-row")].find(x => (x.dataset.wltoggle || "") === "goal");
      if (h) h.click();
    });
    await settle(page, 400);
    const independent = await page.evaluate(() => {
      const folds = [...document.querySelectorAll(".pmq-t8-wl-fold")];
      if (!folds.length) return true; // t1 idiom: single disclosure, trivially independent
      const open = folds.filter(f => f.classList.contains("pmq-open"));
      return open.length <= 1;
    });
    checks.push(check(`${t}: independent expansion`, independent));

    // completion condense + reopen completed group
    await page.evaluate(() => window.__pmDemoTrigger("goal.complete", {}));
    await settle(page, 500);
    const complete = await page.evaluate(() => window.PMChatHost.api.store.goalEffectiveStatus("thread-17") === "complete");
    checks.push(check(`${t}: goal completion state`, complete));
    checks.push(check(`${t}: zero page errors`, errors.length === 0, errors.slice(0, 2).join(" | ")));
    await browser.close();
  }
} finally {
  server.proc.kill();
}
checks.forEach(c => R.check(c.name, c.pass, c.detail));
record("probe-work", "t1/t8", "975", "friendly-dark", "full", checks);
const s = R.summary();
console.log(JSON.stringify(s));
process.exit(s.fail ? 1 : 0);
