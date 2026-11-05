// Private-document scheduler mutations for idle-in-drag selftests. Each must fail its behavioral assertion.
export const mutations = {
  "skip-body": [
    [
      "      fn(dl);",
      "      window.__reviewSkipped=(window.__reviewSkipped||0)+1;"
    ]
  ],
  "other-queue": [
    [
      "      fn(dl);",
      "      queueMicrotask(() => { window.__reviewMigrated=(window.__reviewMigrated||0)+1; fn(dl); });"
    ]
  ],
  "late-theme": [
    [
      "    const job = { dead: false, id: 0, timer: 0 };",
      "    const job = { dead: false, id: 0, timer: 0 }; const reviewTheme = /\\bat whenIdle\\b/.test(new Error().stack||'');"
    ],
    [
      "      fn(dl);",
      "      if (reviewTheme) { window.__reviewDelayed=(window.__reviewDelayed||0)+1; setTimeout(() => fn(dl), 20000); } else fn(dl);"
    ]
  ],
  "leak-theme": [
    [
      "  const idlePark = (job) => { idleParked.add(job); idleWait(); };",
      "  const idlePark = (job) => { idleParked.add(job); idleWait(); if(job.reviewLeak)job.reviewLeak(); };"
    ],
    [
      "    const job = { dead: false, id: 0, timer: 0 };",
      "    const job = { dead: false, id: 0, timer: 0 }; if (/\\bat whenIdle\\b/.test(new Error().stack||'')) { let leaked=false; job.reviewLeak=()=>{if(leaked)return;leaked=true;setTimeout(()=>{ const ev={at:performance.now(),drag:dragging()}; (window.__reviewLeaks||(window.__reviewLeaks=[])).push(ev);fn({timeRemaining:()=>50,didTimeout:true}); ev.done=performance.now(); },2500);}; }"
    ],
    [
      "    v.setAttribute('data-ready', '');\n    return v;",
      "    v.setAttribute('data-ready', ''); (window.__reviewPaints||(window.__reviewPaints=[])).push({at:performance.now(),drag:!!window.PM_BUSY.drag(),mode,ready:v.hasAttribute('data-ready')});\n    return v;"
    ],
    [
      "    v.setAttribute('data-warm', '');\n    let a = null;",
      "    v.setAttribute('data-warm', ''); (window.__reviewWarms||(window.__reviewWarms=[])).push({at:performance.now(),drag:!!window.PM_BUSY.drag(),warm:v.hasAttribute('data-warm')});\n    let a = null;"
    ]
  ],
  "wrong-body-v2": [
    [
      "  const idleAsked = new Set(), idleParked = new Set();",
      "  const idleAsked = new Set(), idleParked = new Set(); let reviewFirst = null;"
    ],
    [
      "    const job = { dead: false, id: 0, timer: 0 };",
      "    const job = { dead: false, id: 0, timer: 0 }; const reviewWrong=/\\bat whenIdle\\b/.test(new Error().stack||''); if (!reviewWrong && !reviewFirst) reviewFirst=fn;"
    ],
    [
      "      fn(dl);",
      "      if (reviewWrong) { window.__reviewWrong=(window.__reviewWrong||0)+1; reviewFirst(dl); } else fn(dl);"
    ]
  ]
};

// node helpers/idle-drag-negatives.mjs <head.html> <scratch-directory>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const src = fs.readFileSync(process.argv[2], 'utf8'), out = process.argv[3];
    fs.mkdirSync(out, { recursive: true });
    for (const [name, changes] of Object.entries(mutations)) {
        let text = src;
        for (const [before, after] of changes) {
            if (text.split(before).length !== 2) throw new Error(`${name}: mutation target must occur once: ${before}`);
            text = text.replace(before, after);
        }
        fs.writeFileSync(path.join(out, name + '.html'), text + `\n<!-- idle-drag-selftest:${name} -->\n`);
    }
}
