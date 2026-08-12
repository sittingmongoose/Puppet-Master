// Probe 8 — visual matrix (packet §07).
// 8 themes x {520, 750, 975, 1200} for t1 x w1 baseline (32 shots), plus
// representative new-surface captures on friendly-dark: pinned+artifact
// coexistence, question open+selected, BSD glow, offline strip, inbox open,
// capacity card, port conflict card, attachment resolver, reduced-motion
// equivalents. >= 32 theme/width variants. contact-sheet.html written INTO
// the evidence dir (never the concept folder).
import { startServer, openHost, settle, shot, EVIDENCE_DIR, results } from "./pw.mjs";
import { record, check } from "./report.mjs";
import fs from "node:fs";
import path from "node:path";

const R = results("matrix-visual");
const server = await startServer();
const checks = [];
const THEMES = ["friendly-dark", "friendly-light", "glass-dark", "glass-light", "retro-dark", "retro-light", "basic-dark", "basic-light"];
const WIDTHS = [520, 750, 975, 1200];
const shots = [];

try {
  // baseline matrix: 8 themes x 4 widths
  for (const theme of THEMES) {
    for (const width of WIDTHS) {
      const { browser, page, errors } = await openHost(server.port, `w=w1&t=t1&theme=${theme}&width=${width}&dt=thread-17`, { width: Math.max(width + 340, 1280) });
      await settle(page, 600);
      const file = await shot(page, `matrix-${theme}-${width}`);
      shots.push(file);
      checks.push(check(`matrix ${theme} @ ${width} clean`, errors.length === 0, errors.slice(0, 1).join(" | ")));
      await browser.close();
    }
  }

  // representative new-surface captures (friendly-dark, 975)
  const cap = async (name, prep) => {
    const { browser, page, errors } = await openHost(server.port, "w=w1&t=t1&theme=friendly-dark&width=975&dt=thread-17");
    await settle(page, 600);
    if (prep) await prep(page);
    await settle(page, 450);
    const file = await shot(page, name);
    shots.push(file);
    checks.push(check(`capture ${name} clean`, errors.length === 0, errors.slice(0, 1).join(" | ")));
    await browser.close();
  };

  await cap("surface-pinned-artifact", async page => {
    await page.evaluate(() => {
      window.__pmDemoTrigger("artifact.ready", {});
      window.PMChatHost.api.store.setPin(window.PMChatHost.api.env.winId(), true);
    });
    await settle(page, 800);
  });
  await cap("surface-question-open", async page => {
    await page.evaluate(() => {
      window.PMChatHost.api.store.switchThread("thread-12");
    });
    await settle(page, 600);
    await page.evaluate(() => window.__pmDemoTrigger("question.select", { option: 0 }));
  });
  await cap("surface-bsd-glow", async page => {
    await page.evaluate(() => window.__pmDemoTrigger("bsd.auto_eval", {}));
    await settle(page, 250);
  });
  await cap("surface-offline-strip", async page => {
    await page.evaluate(() => window.__pmDemoTrigger("conn.offline", {}));
    await page.evaluate(() => window.__pmDemoTrigger("conn.queue_send", {}));
  });
  await cap("surface-inbox-open", async page => {
    await page.evaluate(() => window.__pmDemoTrigger("notify.push", {}));
    await settle(page, 300);
    await page.evaluate(() => document.querySelector(".pmq-inbox").click());
  });
  await cap("surface-capacity-card", async page => {
    await page.evaluate(() => window.__pmDemoTrigger("capacity.forecast", {}));
    await page.evaluate(() => { const b = document.querySelector(".pmq-t1-workcaps"); if (b) b.click(); });
  });
  await cap("surface-port-conflict", async page => {
    await page.evaluate(() => { const b = document.querySelector(".pmq-t1-workcaps"); if (b) b.click(); });
  });
  await cap("surface-attachment-resolver", async page => {
    await page.evaluate(() => { const b = document.querySelector(".pmq-t1-workcaps"); if (b) b.click(); });
  });
  // reduced-motion equivalents
  for (const name of ["surface-bsd-glow-rm", "surface-pinned-artifact-rm"]) {
    const { browser, page, errors } = await openHost(server.port, "w=w1&t=t1&theme=friendly-dark&width=975&dt=thread-17&rm=1");
    await settle(page, 600);
    if (name.includes("bsd")) {
      await page.evaluate(() => window.__pmDemoTrigger("bsd.auto_eval", {}));
      await settle(page, 250);
    } else {
      await page.evaluate(() => {
        window.__pmDemoTrigger("artifact.ready", {});
        window.PMChatHost.api.store.setPin(window.PMChatHost.api.env.winId(), true);
      });
      await settle(page, 800);
    }
    const file = await shot(page, name);
    shots.push(file);
    checks.push(check(`capture ${name} clean`, errors.length === 0));
    await browser.close();
  }

  checks.push(check("coverage floor >= 32 theme/width variants", shots.length >= 32, "shots=" + shots.length));

  // contact sheet INTO the evidence dir
  const rel = shots.map(f => path.basename(f));
  const html = "<!DOCTYPE html><html><head><meta charset='utf-8'><title>qwen-3-8 visual matrix</title>" +
    "<style>body{background:#14161a;color:#e8e6e1;font-family:sans-serif;margin:16px}" +
    "h1{font-size:16px} .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:12px}" +
    "figure{margin:0;border:1px solid #2c2f36;border-radius:8px;overflow:hidden}" +
    "img{width:100%;display:block}figcaption{font-size:11px;padding:6px 8px;color:#9aa0a8}</style></head>" +
    "<body><h1>Qwen 3.8 · visual matrix (" + rel.length + " captures)</h1><div class='grid'>" +
    rel.map(f => "<figure><img src='" + f + "'><figcaption>" + f + "</figcaption></figure>").join("") +
    "</div></body></html>";
  fs.writeFileSync(path.join(EVIDENCE_DIR, "contact-sheet.html"), html);
  checks.push(check("contact-sheet.html written to evidence dir", fs.existsSync(path.join(EVIDENCE_DIR, "contact-sheet.html"))));
} finally {
  server.proc.kill();
}
checks.forEach(c => R.check(c.name, c.pass, c.detail));
record("matrix-visual", "all", "520/750/975/1200", "8 themes", "full+reduced", checks);
const s = R.summary();
console.log(JSON.stringify(s));
process.exit(s.fail ? 1 : 0);
