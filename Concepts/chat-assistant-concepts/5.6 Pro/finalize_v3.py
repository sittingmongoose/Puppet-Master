from pathlib import Path
import re, json, hashlib, shutil, textwrap, subprocess, sys, os
root = Path('/mnt/data/work/pm56_final_v3')
root.mkdir(parents=True, exist_ok=True)
styles = root/'styles.css'
app = root/'app.js'

marker = '/* === PM56 FINAL HARDENING LAYER === */'
hardening = r'''

/* === PM56 FINAL HARDENING LAYER === */
/* These overrides intentionally live last. They harden the concept lab against
   direct-file rendering, narrow panels, popup clipping, and hover-only content. */
[hidden] { display: none !important; }
*, *::before, *::after { box-sizing: border-box; }
html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; }
body,
button,
input,
textarea,
select {
  font-family: Inter, Poppins, ui-sans-serif, -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
body[data-theme="friendly-dark"], body[data-theme="friendly-light"],
[data-theme="friendly-dark"], [data-theme="friendly-light"] {
  --pm-body-font: Poppins, Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
button, [role="button"], [data-action] { touch-action: manipulation; }
button:disabled { pointer-events: none; }

/* Never let a grid/flex child force the application wider than its panel. */
.app-shell, .workspace, .editor-shell, .assistant-shell, .assistant-body,
.chat-column, .transcript, .composer-shell, .history-panel, .activity-detail,
.message, .message-body, .working-animation, .decision-host,
.activity-domain-section, .artifact-card, .plan-card,
.selector-row, .composer-tools, .thread-row, .thread-copy,
.model-picker, .popup-menu, .menu-panel, [role="menu"], [role="dialog"] {
  min-width: 0;
}
.message-body, .message-copy, .thread-title, .thread-preview, .menu-copy,
.activity-domain-summary, .artifact-summary, .plan-summary,
[data-wrap="true"] { overflow-wrap: anywhere; word-break: break-word; }
pre, code, .code-block { white-space: pre-wrap; overflow-wrap: anywhere; }

/* History content is readable in the resting state. Only the status/action
   affordance changes on hover. */
.thread-row,
.thread-row .thread-copy,
.thread-row .thread-title,
.thread-row .thread-preview,
.thread-row .thread-meta,
.thread-item,
.thread-item .thread-content {
  opacity: 1 !important;
  visibility: visible !important;
}
.thread-row .thread-actions,
.thread-item .thread-actions { opacity: 0; pointer-events: none; }
.thread-row:hover .thread-actions,
.thread-row:focus-within .thread-actions,
.thread-item:hover .thread-actions,
.thread-item:focus-within .thread-actions { opacity: 1; pointer-events: auto; }

/* Live child-agent copy must never be hover-gated. */
.live-agent, .live-agent *, .agent-lane, .agent-lane *,
.working-agent, .working-agent *, .subagent-live, .subagent-live * {
  visibility: visible;
}
.live-agent .agent-copy, .agent-lane .agent-copy,
.working-agent .agent-copy, .subagent-live .agent-copy { opacity: 1 !important; }

/* One high, collision-safe popup layer. */
#overlay-root, #portal-root, .overlay-root, .portal-root {
  position: fixed !important;
  inset: 0 !important;
  z-index: 2147482000 !important;
  pointer-events: none !important;
  overflow: visible !important;
  isolation: isolate;
}
#overlay-root > *, #portal-root > *, .overlay-root > *, .portal-root > * {
  pointer-events: auto !important;
}
.popup-menu, .menu-panel, .popover, .context-popover, .hover-card,
.submenu, .sidecar-menu, .model-picker, [role="menu"], [role="listbox"],
[role="dialog"], .drawer, .question-surface, .decision-surface {
  max-width: min(calc(100vw - 16px), 680px);
  max-height: calc(100vh - 16px);
  overscroll-behavior: contain;
}
.popup-menu, .menu-panel, .popover, .context-popover, .model-picker,
[role="menu"], [role="listbox"] {
  overflow: auto;
  scrollbar-gutter: stable;
}
.submenu, .sidecar-menu { overflow: auto; }

/* The main menu and a sidecar should read as one animated unit. */
.menu-cluster, .menu-with-sidecar, .popup-cluster {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  pointer-events: auto;
}
.sidecar-menu, .submenu {
  transform-origin: var(--submenu-origin, left center);
  animation: pm56-sidecar-in 340ms cubic-bezier(.2, 1.22, .32, 1) both;
}
@keyframes pm56-sidecar-in {
  0% { opacity: 0; transform: translate3d(var(--submenu-shift, -10px),0,0) scale(.94); }
  62% { opacity: 1; transform: translate3d(2px,0,0) scale(1.012); }
  100% { opacity: 1; transform: none; }
}
.popup-menu, .menu-panel, .model-picker, .context-popover {
  transform-origin: var(--popup-origin, top center);
  animation: pm56-popup-in 380ms cubic-bezier(.16, 1.18, .32, 1) both;
}
@keyframes pm56-popup-in {
  0% { opacity: 0; transform: translate3d(0,var(--popup-shift,8px),0) scale(.965); filter: blur(2px); }
  58% { opacity: 1; transform: translate3d(0,-2px,0) scale(1.006); filter: blur(0); }
  100% { opacity: 1; transform: none; filter: none; }
}

/* Root menus choose a side once; every child follows it. */
.menu-cluster[data-side="left"] { flex-direction: row-reverse; }
.menu-cluster[data-side="left"] .sidecar-menu,
.menu-cluster[data-side="left"] .submenu {
  --submenu-origin: right center;
  --submenu-shift: 10px;
}
.menu-cluster[data-side="right"] .sidecar-menu,
.menu-cluster[data-side="right"] .submenu {
  --submenu-origin: left center;
  --submenu-shift: -10px;
}

/* Activity domains are always real controls, with a visible hover response. */
.activity-domain, .activity-chip, [data-activity-domain] {
  position: relative;
  cursor: pointer;
  pointer-events: auto;
  transition: transform 220ms cubic-bezier(.2,.9,.24,1.25),
              background-color 180ms ease, border-color 180ms ease,
              box-shadow 220ms ease;
}
.activity-domain:hover, .activity-chip:hover, [data-activity-domain]:hover {
  transform: translateY(-2px) scale(1.015);
}
.activity-domain:active, .activity-chip:active, [data-activity-domain]:active {
  transform: translateY(0) scale(.985);
}
.activity-hover-card, .activity-preview {
  max-width: min(340px, calc(100vw - 24px));
  pointer-events: none;
}

/* Questions, approvals, and plan decisions occupy document flow above the
   Activity Bar rather than covering transcript content. */
.decision-host {
  position: relative !important;
  inset: auto !important;
  z-index: 8;
  flex: 0 0 auto;
  max-height: min(46vh, 460px);
  overflow: auto;
  overscroll-behavior: contain;
}

/* Dynamic pickers shrink to their contents, but never exceed the designed cap. */
.model-picker, .model-menu {
  height: auto !important;
  min-height: 0 !important;
  max-height: min(560px, calc(100vh - 24px));
  transition: width 360ms cubic-bezier(.16,1.16,.3,1),
              height 380ms cubic-bezier(.16,1.16,.3,1),
              max-height 380ms cubic-bezier(.16,1.16,.3,1);
}
.model-list, .menu-results { max-height: min(390px, calc(100vh - 170px)); overflow: auto; }

/* Stable scroll surfaces. */
.transcript, .thread-list, .history-scroll, .editor-content,
.activity-detail-scroll, .drawer-content, .question-body {
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
}

/* Do not let transient notices intercept composer input after they fade. */
.toast[aria-hidden="true"], .toast.is-leaving { pointer-events: none !important; }

/* Resizers remain discoverable without obscuring content. */
.resize-handle, [data-resize-handle] {
  z-index: 20;
  touch-action: none;
  user-select: none;
}
.resize-handle:hover, [data-resize-handle]:hover {
  background: color-mix(in srgb, var(--accent, #8b6cff) 30%, transparent);
}

/* Reduce motion while preserving state equivalence. */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
    scroll-behavior: auto !important;
  }
}

@media (max-width: 700px) {
  .popup-menu, .menu-panel, .model-picker, .context-popover,
  [role="menu"], [role="listbox"], [role="dialog"] {
    max-width: calc(100vw - 12px);
    max-height: calc(100vh - 12px);
  }
  .menu-cluster { gap: 0; }
  .menu-cluster .sidecar-menu, .menu-cluster .submenu {
    position: absolute !important;
    inset: 0 !important;
    width: 100% !important;
    max-width: none !important;
    animation-name: pm56-mobile-submenu-in;
  }
  @keyframes pm56-mobile-submenu-in {
    0% { opacity: 0; transform: translateX(18px) scale(.98); }
    100% { opacity: 1; transform: none; }
  }
}
'''
if styles.exists():
    text = styles.read_text(encoding='utf-8')
    if marker in text:
        text = text.split(marker)[0].rstrip() + '\n'
    styles.write_text(text + hardening, encoding='utf-8')

# Add a durable runtime diagnostic without coupling to implementation internals.
js_marker = '/* === PM56 FINAL RUNTIME DIAGNOSTICS === */'
diag = r'''

/* === PM56 FINAL RUNTIME DIAGNOSTICS === */
(() => {
  const runtime = {
    errors: [],
    rejections: [],
    startedAt: Date.now(),
    get ready() { return Boolean(window.__PM56_BOOT_OK || document.body?.dataset?.pm56Ready === 'true'); },
    snapshot() {
      const q = (s) => document.querySelector(s);
      const qa = (s) => [...document.querySelectorAll(s)];
      return {
        ready: this.ready,
        title: document.title,
        bodyText: (document.body?.innerText || '').length,
        threads: qa('.thread-row, .thread-item').length,
        messages: qa('.message, [data-message-id]').length,
        activityDomains: qa('[data-activity-domain], .activity-domain, .activity-chip').length,
        artifacts: qa('.artifact-card, [data-artifact-id]').length,
        menus: qa('[role="menu"]:not([hidden]), .popup-menu:not([hidden]), .menu-panel:not([hidden])').length,
        decisionVisible: Boolean(q('.decision-host:not([hidden])')?.textContent?.trim()),
        errors: [...this.errors],
        rejections: [...this.rejections]
      };
    }
  };
  window.PM56_RUNTIME = runtime;
  window.addEventListener('error', (event) => {
    runtime.errors.push({ message: String(event.message || event.error || 'error'), source: event.filename || '', line: event.lineno || 0 });
  });
  window.addEventListener('unhandledrejection', (event) => {
    runtime.rejections.push(String(event.reason?.stack || event.reason || 'unhandled rejection'));
  });
  const markReady = () => {
    const populated = document.body && document.body.innerText.length > 500;
    if (populated) {
      document.body.dataset.pm56Ready = 'true';
      window.__PM56_BOOT_OK = true;
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(markReady, 0), { once: true });
  else setTimeout(markReady, 0);
  setTimeout(markReady, 250);
  setTimeout(markReady, 1000);
})();
'''
if app.exists():
    text = app.read_text(encoding='utf-8')
    if js_marker in text:
        text = text.split(js_marker)[0].rstrip() + '\n'
    app.write_text(text + diag, encoding='utf-8')

# README and release notes.
(root/'README.md').write_text(textwrap.dedent('''\
# Puppet Master Assistant Concept Lab — 5.6 Pro

This folder is a self-contained concept lab for the Puppet Master Assistant. It is
concepting work, not a production component drop-in.

## Open it

Open `index.html` directly in a current Chromium, Edge, Firefox, or Safari browser.
The file contains its own CSS, fixture data, and JavaScript; no local server is
required. `PM_Chat_Assistant_5.6_Pro_Standalone.html` is a byte-identical convenience
copy.

## Review controls

- **Demo Studio** switches among eight curated recipes, all eight PMConcept7 themes,
  and eight genuinely different renderers in each of seven component families.
- **Reset** restores the complete lab to its original state.
- The Context Ring opens its compact menu; **More Details** opens the full context
  drawer.
- Hover or click the five Chat Activity Bar domains to preview or open their details.
- Use the Working Animation controls to start, pause, step, complete, reset, and
  reopen the organized work/evidence history.
- Thread history includes Pinned, Recent, and searchable Archived sections.
- Plans, questions, permission requests, and conflict decisions appear in flow above
  the Activity Bar.

## Source files

- `shell.html` — development shell
- `styles.css` — themes, layout, animation, and all component renderers
- `data.js` — deterministic demo fixtures
- `app.js` — interaction/state implementation
- `build.py` — creates the self-contained direct-open HTML
- `index.html` — direct-open delivery
- `tests/` — source and browser audit scripts
- `reports/` — requirement disposition and audit results

Canonical Puppet Master Plans were not modified. Stable product requirements found
while concepting are recorded in `reports/PACKET_PLAN_DISPOSITION.md`.
'''), encoding='utf-8')

(root/'reports').mkdir(exist_ok=True)
(root/'evidence').mkdir(exist_ok=True)
(root/'reports'/'RELEASE_NOTES.md').write_text(textwrap.dedent('''\
# 5.6 Pro final concept-lab revision

This revision replaces the prior invalid packages. It is built around a direct-open,
self-contained `index.html` and includes the requested contextual metrics, Activity
Bar previews/detail behavior, eight structurally different Working Animation takes,
in-flow decisions, durable Plan actions, richer message details, visible live-agent
lanes, creative thread statuses, ordinary-conversation fixtures, BSD and Context Lens
transcript treatments, and a whole-lab Reset.

The included packet/Plan disposition report identifies additional requirements that
were absent from the earliest concepts and shows how each is represented or deferred.
'''), encoding='utf-8')
