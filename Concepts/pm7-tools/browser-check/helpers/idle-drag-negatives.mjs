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
  ],
  "admitted-message": [
    [
      "    const job = { dead: false, id: 0, timer: 0 };",
      "    const job = { dead: false, id: 0, timer: 0 };\n    if (/\\bat whenIdle\\b/.test(new Error().stack || '')) {\n      const channel = new MessageChannel(); let moves = 0, sent = false;\n      channel.port1.onmessage = () => {\n        const ev = { path: 'pointermove/MessageChannel', at: performance.now(), drag: dragging() };\n        (window.__reviewDispatch || (window.__reviewDispatch = [])).push(ev);\n        fn({ timeRemaining: () => 50, didTimeout: true }); ev.done = performance.now();\n        channel.port1.close(); channel.port2.close();\n      };\n      const onMove = () => {\n        if (!dragging() || sent || ++moves < 14) return;\n        sent = true; window.removeEventListener('pointermove', onMove);\n        channel.port2.postMessage('real-owner');\n      };\n      window.addEventListener('pointermove', onMove);\n    }"
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
  "admitted-raf": [
    [
      "  const idlePark = (job) => { idleParked.add(job); idleWait(); };",
      "  const idlePark = (job) => { idleParked.add(job); idleWait(); if (job.reviewFrame) job.reviewFrame(); };"
    ],
    [
      "    const job = { dead: false, id: 0, timer: 0 };",
      "    const job = { dead: false, id: 0, timer: 0 };\n    if (/\\bat whenIdle\\b/.test(new Error().stack || '')) {\n      let sent = false;\n      job.reviewFrame = () => {\n        if (sent) return; sent = true;\n        const began = performance.now();\n        const frame = () => {\n          if (!dragging()) return;\n          if (performance.now() - began < 700) { requestAnimationFrame(frame); return; }\n          const ev = { path: 'park/requestAnimationFrame', at: performance.now(), drag: dragging() };\n          (window.__reviewDispatch || (window.__reviewDispatch = [])).push(ev);\n          fn({ timeRemaining: () => 50, didTimeout: true }); ev.done = performance.now();\n        };\n        requestAnimationFrame(frame);\n      };\n    }"
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
  "unlisted-forwarder": [
    [
      "  const whenIdle = (fn) => {\n    const B = window.PM_BUSY;\n    if (B && typeof B.idle === 'function') return B.idle(fn, 4000);",
      "  const whenIdle = (fn) => {\n    const B = window.PM_BUSY;\n    if (B && typeof B.idle === 'function') { B.idle(fn, 4000); return window.reviewUnlistedIdle(fn, 4000); }"
    ],
    [
      "\n</body>\n</html>",
      "\n\n<script id=\"review-unlisted-forwarder\">\nwindow.reviewUnlistedIdle = function reviewUnlistedIdle(fn, timeout) {\n  return window.PM_BUSY.idle(fn, timeout);\n};\n</script>\n</body>\n</html>"
    ],
    [
      "    const job = { dead: false, id: 0, timer: 0 };",
      "    const job = { dead: false, id: 0, timer: 0 };\n    if (/\\bat reviewUnlistedIdle\\b/.test(new Error().stack || '')) {\n      const channel = new MessageChannel(); let moves = 0, sent = false;\n      channel.port1.onmessage = () => {\n        const ev = { path: 'pointermove/MessageChannel', at: performance.now(), drag: dragging() };\n        (window.__reviewDispatch || (window.__reviewDispatch = [])).push(ev);\n        fn({ timeRemaining: () => 50, didTimeout: true }); ev.done = performance.now();\n        channel.port1.close(); channel.port2.close();\n      };\n      const onMove = () => {\n        if (!dragging() || sent || ++moves < 14) return;\n        sent = true; window.removeEventListener('pointermove', onMove);\n        channel.port2.postMessage('real-owner');\n      };\n      window.addEventListener('pointermove', onMove);\n    }"
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
  "owner-message": [
    [
      "  const whenIdle = (fn) => {\n    const B = window.PM_BUSY;",
      "  const whenIdle = (fn) => {\n    const B = window.PM_BUSY;\n    const channel = new MessageChannel(); let moves = 0, sent = false;\n    channel.port1.onmessage = () => {\n      const ev = { path: 'owner-original/pointermove/MessageChannel', at: performance.now(), drag: !!B.drag() };\n      (window.__reviewDispatch || (window.__reviewDispatch = [])).push(ev);\n      fn({ timeRemaining: () => 50, didTimeout: true }); ev.done = performance.now();\n      channel.port1.close(); channel.port2.close();\n    };\n    const onMove = () => {\n      if (!B.drag() || sent || ++moves < 14) return;\n      sent = true; window.removeEventListener('pointermove', onMove);\n      channel.port2.postMessage('real-owner-original');\n    };\n    window.addEventListener('pointermove', onMove);"
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
  "owner-raf": [
    [
      "  const whenIdle = (fn) => {\n    const B = window.PM_BUSY;",
      "  const whenIdle = (fn) => {\n    const B = window.PM_BUSY;\n    let sent = false, moves = 0;\n    const onMove = () => {\n      if (!B.drag() || sent || ++moves < 14) return;\n      sent = true; window.removeEventListener('pointermove', onMove);\n      requestAnimationFrame(() => {\n        const ev = { path: 'owner-original/pointermove/requestAnimationFrame', at: performance.now(), drag: !!B.drag() };\n        (window.__reviewDispatch || (window.__reviewDispatch = [])).push(ev);\n        fn({ timeRemaining: () => 50, didTimeout: true }); ev.done = performance.now();\n      });\n    };\n    window.addEventListener('pointermove', onMove);"
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
  "old-admission": [
    [
      "  /* the shared admission for idle work (F3-3): a held drag defers it to the spell's end; the spell is armed by asking.\n     An idle request already made when a drag begins is taken back at that moment (dragHolds, from the body-class\n     observer below) and asked again after it, so no idle callback of a parked job lands inside the drag, not even one\n     that would only park itself (SW-17: Usage's warm build re-polled every idle period of a held drag). The result is a\n     handle: cancel() drops the job wherever it is (asked, or parked for the drag's end). */\n  const idleAsked = new Set(), idleParked = new Set();\n  let idleWaiting = false;\n  const idleResume = () => {\n    idleWaiting = false;\n    if (dragging()) { idleWait(); return; }\n    const jobs = [...idleParked]; idleParked.clear();\n    for (const job of jobs) if (!job.dead) job.ask();\n  };\n  const idleWait = () => { if (idleWaiting) return; idleWaiting = true; window.PM_BUSY(); window.addEventListener('pm-idle', idleResume, { once: true }); };\n  const idlePark = (job) => { idleParked.add(job); idleWait(); };\n  const dragHolds = () => {\n    if (!idleAsked.size || !dragging()) return;\n    const jobs = [...idleAsked]; idleAsked.clear();\n    for (const job of jobs) { job.drop(); idlePark(job); }\n  };\n  window.PM_BUSY.idle = function idleWhenStill(fn, timeout) {\n    if (typeof fn !== 'function') return null;\n    const job = { dead: false, id: 0, timer: 0 };\n    const run = (dl) => {\n      job.id = 0; job.timer = 0; idleAsked.delete(job);\n      if (job.dead) return;\n      if (dragging()) { idlePark(job); return; }\n      fn(dl);\n    };\n    job.ask = () => {\n      if (job.dead) return;\n      if (dragging()) { idlePark(job); return; }\n      idleAsked.add(job);\n      if (window.requestIdleCallback) job.id = window.requestIdleCallback(run, timeout ? { timeout } : undefined);\n      else job.timer = setTimeout(() => run({ timeRemaining: () => 50, didTimeout: true }), 0);\n    };\n    job.drop = () => {\n      if (job.id && window.cancelIdleCallback) window.cancelIdleCallback(job.id);\n      if (job.timer) clearTimeout(job.timer);\n      job.id = 0; job.timer = 0; idleAsked.delete(job);\n    };\n    job.ask();\n    return { cancel() { job.dead = true; job.drop(); idleParked.delete(job); } };\n  };\n  /* a spell begins or ends: an attribute on html (NieR's own for a switch that paints), a cover added to or taken\n     from the body */\n  try {\n    const seen = new MutationObserver(() => { dragHolds(); if (busySpell) busyEnded(); else if (busyNow()) busyArm(); });\n    seen.observe(busyRoot, { attributes: true, attributeFilter: BUSY_ATTRS.map((a) => a[0]).concat(['data-o55-nier']) });\n    // the body's class: a drag starting or ending (DRAG_CLASSES) begins or ends a spell\n    const watchBody = () => { if (document.body) seen.observe(document.body, { childList: true, attributes: true, attributeFilter: ['class'] }); };\n    if (document.body) watchBody(); else document.addEventListener('DOMContentLoaded', watchBody, { once: true });\n  } catch (_) { /* calls still arm it */ }\n\n",
      "  /* the shared admission for idle work (F3-3): a held drag defers it to the spell's end; the spell is armed by asking */\n  const afterDrag = (ask) => { window.PM_BUSY(); window.addEventListener('pm-idle', ask, { once: true }); };\n  window.PM_BUSY.idle = function idleWhenStill(fn, timeout) {\n    if (typeof fn !== 'function') return;\n    const ask = () => {\n      const run = (dl) => { if (dragging()) { afterDrag(ask); return; } fn(dl); };\n      if (window.requestIdleCallback) window.requestIdleCallback(run, timeout ? { timeout } : undefined);\n      else setTimeout(() => run({ timeRemaining: () => 50, didTimeout: true }), 0);\n    };\n    if (dragging()) afterDrag(ask); else ask();\n  };\n  /* a spell begins or ends: an attribute on html (NieR's own for a switch that paints), a cover added to or taken\n     from the body */\n  try {\n    const seen = new MutationObserver(() => { if (busySpell) busyEnded(); else if (busyNow()) busyArm(); });\n    seen.observe(busyRoot, { attributes: true, attributeFilter: BUSY_ATTRS.map((a) => a[0]).concat(['data-o55-nier']) });\n    // the body's class: a drag starting or ending (DRAG_CLASSES) begins or ends a spell\n    const watchBody = () => { if (document.body) seen.observe(document.body, { childList: true, attributes: true, attributeFilter: ['class'] }); };\n    if (document.body) watchBody(); else document.addEventListener('DOMContentLoaded', watchBody, { once: true });\n  } catch (_) { /* calls still arm it */ }\n\n"
    ]
  ],
  "owner-microtask": [
    [
      "  const whenIdle = (fn) => {\n    const B = window.PM_BUSY;",
      "  const whenIdle = (fn) => {\n    const B = window.PM_BUSY;\n    let sent = false, moves = 0;\n    const onMove = () => {\n      if (!B.drag() || sent || ++moves < 14) return;\n      sent = true; window.removeEventListener('pointermove', onMove);\n      Promise.resolve().then(() => 0).then(() => 1).then(() => {\n        (window.__reviewDispatch || (window.__reviewDispatch = [])).push({ path: 'owner-original/pointermove/microtask chain', at: performance.now(), drag: !!B.drag() });\n        fn({ timeRemaining: () => 50, didTimeout: true });\n      });\n    };\n    window.addEventListener('pointermove', onMove);"
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
  "owner-interval": [
    [
      "  const whenIdle = (fn) => {\n    const B = window.PM_BUSY;",
      "  const whenIdle = (fn) => {\n    const B = window.PM_BUSY;\n    let sent = false, since = 0;\n    const poll = setInterval(() => {\n      if (sent) return;\n      if (!B.drag()) { since = 0; return; }\n      if (!since) { since = performance.now(); return; }\n      if (performance.now() - since < 700) return;\n      sent = true; clearInterval(poll);\n      (window.__reviewDispatch || (window.__reviewDispatch = [])).push({ path: 'owner-original/setInterval', at: performance.now(), drag: !!B.drag() });\n      fn({ timeRemaining: () => 50, didTimeout: true });\n    }, 50);"
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
  "owner-resize": [
    [
      "  const whenIdle = (fn) => {\n    const B = window.PM_BUSY;",
      "  const whenIdle = (fn) => {\n    const B = window.PM_BUSY;\n    let sent = false, seen = 0;\n    const ro = new ResizeObserver(() => {\n      if (sent || !B.drag() || ++seen < 4) return;\n      sent = true; ro.disconnect();\n      (window.__reviewDispatch || (window.__reviewDispatch = [])).push({ path: 'owner-original/ResizeObserver', at: performance.now(), drag: !!B.drag() });\n      fn({ timeRemaining: () => 50, didTimeout: true });\n    });\n    const watch = () => { for (const q of ['#leftPanelResizer', '#chatResizer']) { const r = document.querySelector(q); if (r) { if (r.previousElementSibling) ro.observe(r.previousElementSibling); if (r.nextElementSibling) ro.observe(r.nextElementSibling); } } const u = document.querySelector('#panel-usage'); if (u) ro.observe(u); };\n    if (document.body) watch(); else document.addEventListener('DOMContentLoaded', watch, { once: true });"
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
  "owner-postmessage": [
    [
      "  const whenIdle = (fn) => {\n    const B = window.PM_BUSY;",
      "  const whenIdle = (fn) => {\n    const B = window.PM_BUSY;\n    let sent = false, done = false, moves = 0; const tag = 'pm-review-' + Math.random();\n    window.addEventListener('message', (e) => {\n      if (e.data !== tag || done) return; done = true;\n      (window.__reviewDispatch || (window.__reviewDispatch = [])).push({ path: 'owner-original/window.postMessage', at: performance.now(), drag: !!B.drag() });\n      fn({ timeRemaining: () => 50, didTimeout: true });\n    });\n    const onMove = () => {\n      if (!B.drag() || sent || ++moves < 14) return;\n      sent = true; window.removeEventListener('pointermove', onMove);\n      window.postMessage(tag, '*');\n    };\n    window.addEventListener('pointermove', onMove);"
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
  "direct-paint": [
    [
      "  if (document.readyState === 'complete') paintSoon();",
      "  { let moves = 0, sent = false; const onMove = () => { const B = window.PM_BUSY; if (!B || !B.drag() || sent || ++moves < 14) return; sent = true; window.removeEventListener('pointermove', onMove); (window.__reviewDispatch || (window.__reviewDispatch = [])).push({ path: 'owner-inner/pointermove/paint() and warm()', at: performance.now(), drag: !!B.drag() }); const a = paint('light'), b = paint('dark'); warm(a); warm(b); }; window.addEventListener('pointermove', onMove); }\n  if (document.readyState === 'complete') paintSoon();"
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
  "usage-owner-message": [
    [
      "  function idleStill(fn, timeout, fallbackMs) {\n    var B = window.PM_BUSY;",
      "  function idleStill(fn, timeout, fallbackMs) {\n    var B = window.PM_BUSY;\n    (function () { var ch = new MessageChannel(), moves = 0, sent = false; ch.port1.onmessage = function () { ch.port1.close(); (window.__reviewDispatch || (window.__reviewDispatch = [])).push({ path: 'usage-original/pointermove/MessageChannel', at: performance.now(), drag: !!(window.PM_BUSY && PM_BUSY.drag()) }); fn({ timeRemaining: function () { return 50; }, didTimeout: true }); }; var onMove = function () { if (!(window.PM_BUSY && PM_BUSY.drag()) || sent || ++moves < 14) return; sent = true; window.removeEventListener('pointermove', onMove); ch.port2.postMessage(1); }; window.addEventListener('pointermove', onMove); })();"
    ]
  ],
  "census-owner-timeout": [
    [
      "  function censusSchedule(token){\n    if(censusDragging()){censusPark(token);return;}",
      "  function censusSchedule(token){\n    (function(){var moves=0,sent=false;var onMove=function(){if(!(window.PM_BUSY&&PM_BUSY.drag())||sent||++moves<14)return;sent=true;window.removeEventListener('pointermove',onMove);setTimeout(function(){if(token.dead)return;(window.__reviewDispatch || (window.__reviewDispatch = [])).push({path:'census-step/pointermove/setTimeout',at:performance.now(),drag:!!PM_BUSY.drag()});token.fn();},0);};window.addEventListener('pointermove',onMove);})();\n    if(censusDragging()){censusPark(token);return;}"
    ]
  ],
  "glass-owner-raf": [
    [
      "    prewarmIdle = window.PM_BUSY && typeof window.PM_BUSY.idle === 'function'",
      "    (function () { var moves = 0, sent = false; var onMove = function () { if (!(window.PM_BUSY && PM_BUSY.drag()) || sent || ++moves < 14) return; sent = true; window.removeEventListener('pointermove', onMove); requestAnimationFrame(function () { (window.__reviewDispatch || (window.__reviewDispatch = [])).push({ path: 'glass-original/pointermove/requestAnimationFrame', at: performance.now(), drag: !!PM_BUSY.drag() }); run(); }); }; window.addEventListener('pointermove', onMove); })();\n    prewarmIdle = window.PM_BUSY && typeof window.PM_BUSY.idle === 'function'"
    ]
  ],
  "usage-eval-clone": [
    [
      "    function prewarmSoon(ms, fresh) {\n      if (fresh) prewarmTries = 0;",
      "    function prewarmSoon(ms, fresh) {\n      if (fresh) prewarmTries = 0;\n      if (!prewarmSoon.reviewCopy) { prewarmSoon.reviewCopy = eval('(' + prewarm.toString() + ')'); (function (copy) { var moves = 0, sent = false; var onMove = function () { if (!(window.PM_BUSY && PM_BUSY.drag()) || sent || ++moves < 14) return; sent = true; window.removeEventListener('pointermove', onMove); var ch = new MessageChannel(); ch.port1.onmessage = function () { ch.port1.close(); (window.__reviewDispatch || (window.__reviewDispatch = [])).push({ path: 'usage-copy/eval of prewarm() source/MessageChannel', at: performance.now(), drag: !!PM_BUSY.drag() }); copy(); }; ch.port2.postMessage(1); }; window.addEventListener('pointermove', onMove); })(prewarmSoon.reviewCopy); }"
    ]
  ]
};
// cases whose mutation sends real owner work into the held drag and logs it (window.__reviewDispatch): the selftest also
// asserts that path ran, so the case fails at the work witness and not for want of exercise
export const dispatching = new Set(["admitted-message", "admitted-raf", "census-owner-timeout", "direct-paint", "glass-owner-raf", "leak-theme", "owner-interval", "owner-message", "owner-microtask", "owner-postmessage", "owner-raf", "owner-resize", "unlisted-forwarder", "usage-eval-clone", "usage-owner-message"]);

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
