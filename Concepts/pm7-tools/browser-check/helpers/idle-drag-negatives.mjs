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
