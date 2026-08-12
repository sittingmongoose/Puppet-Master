// Probe 1 — pinned history geometry (packet §07).
// open -> pin -> pinned visible + no intersection with transcript/composer boxes
// -> chat width >= 520 floor -> scroll -> pin persists -> switch thread and back
// -> resize 975 -> 620 -> 975 mode transitions -> unpin transient returns.
// Windows w1, w2, w4, w6 (pin repaired there in Rev-2).
import { startServer, openHost, settle, results } from "./pw.mjs";
import { record, check } from "./report.mjs";

const R = results("probe-pinned");
const server = await startServer();
const checks = [];
try {
  for (const w of ["w1", "w2", "w4", "w6"]) {
    const { browser, page, errors } = await openHost(server.port, `w=${w}&t=t1&theme=friendly-dark&width=975&dt=thread-17`);
    await settle(page, 600);

    await page.evaluate(() => window.PMChatHost.api.store.setPin(window.PMChatHost.api.env.winId(), true));
    await settle(page, 600);
    const geo = await page.evaluate(() => {
      const col = document.querySelector(".pmq-pincol");
      const stream = document.querySelector(".pmq-stream");
      const composer = document.querySelector(".pmq-composerzone");
      const chat = document.querySelector(".pmq-chat-stage");
      const overlap = (a, b) => {
        if (!a || !b) return false;
        return !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);
      };
      const cr = col && col.getBoundingClientRect();
      const sr = stream && stream.getBoundingClientRect();
      const mr = composer && composer.getBoundingClientRect();
      return {
        pinned: !!col && cr.width > 0,
        intersectsTranscript: overlap(cr, sr),
        intersectsComposer: overlap(cr, mr),
        chatWidth: chat ? chat.getBoundingClientRect().width : 0
      };
    });
    checks.push(check(`${w}: pinned visible, no intersection, chat >= 520`, geo.pinned && !geo.intersectsTranscript && !geo.intersectsComposer && geo.chatWidth >= 520, JSON.stringify(geo)));

    // scroll transcript, pin persists
    await page.evaluate(() => { const sc = document.querySelector(".pmq-scroller"); if (sc) sc.scrollTop = 300; });
    await settle(page, 300);
    const stillPinned = await page.evaluate(() => !!document.querySelector(".pmq-pincol"));
    checks.push(check(`${w}: pin persists across scroll`, stillPinned));

    // switch thread and back
    await page.evaluate(() => window.PMChatHost.api.store.switchThread("thread-04"));
    await settle(page, 400);
    await page.evaluate(() => window.PMChatHost.api.store.switchThread("thread-17"));
    await settle(page, 400);
    const afterSwitch = await page.evaluate(() => window.PMChatHost.api.store.isPinned(window.PMChatHost.api.env.winId()));
    checks.push(check(`${w}: pin persists across thread switch`, afterSwitch === true));

    // resize transitions 975 -> 620 -> 975
    const modes = [];
    for (const width of [620, 975]) {
      // Governor demotes pin forms before chat width; full pin at 975 needs a
      // stage wider than 975 + rail, so widen the viewport for that case.
      await page.setViewportSize({ width: width === 975 ? 1600 : 1280, height: 900 });
      await page.evaluate(w2 => {
        const url = new URL(location.href);
        url.searchParams.set("width", w2);
        location.href = url.toString();
      }, width);
      await page.waitForSelector(".pmq-msg", { timeout: 15000 });
      await settle(page, 700);
      const m = await page.evaluate(() => {
        const col = document.querySelector(".pmq-pincol");
        return col ? col.dataset.mode : null;
      });
      modes.push(m);
    }
    checks.push(check(`${w}: compact/full mode transitions on resize`, modes[0] === "compact" && modes[1] === "full", JSON.stringify(modes)));

    // unpin -> transient (no pincol)
    await page.evaluate(() => window.PMChatHost.api.store.setPin(window.PMChatHost.api.env.winId(), false));
    await settle(page, 500);
    const unpinned = await page.evaluate(() => !document.querySelector(".pmq-pincol"));
    checks.push(check(`${w}: unpin removes region`, unpinned));
    checks.push(check(`${w}: zero page errors`, errors.length === 0, errors.slice(0, 2).join(" | ")));
    await browser.close();
  }
} finally {
  server.proc.kill();
}
checks.forEach(c => R.check(c.name, c.pass, c.detail));
record("probe-pinned", "w1/w2/w4/w6", "975/620", "friendly-dark", "full", checks);
const s = R.summary();
console.log(JSON.stringify(s));
process.exit(s.fail ? 1 : 0);
