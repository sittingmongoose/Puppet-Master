"""Source-owned PM7 real-shell Guided Tour transform.

This module is deliberately registration-neutral.  ``build_pm7.py`` may call
``apply`` after the T45 Product Onboarding transform and before later
system/hover transforms.  The generated PMConcept7 artifact remains a build
output; this file never writes it.

The browser module is an explicitly bounded concept simulation.  It drives the
already-mounted Home Workspace, Usage, Assistant Chat, and PM_PAGES owners and
observes their receipts.  It owns no provider, runtime, command bus,
persistence, layout, widget, Planning Wizard, or AuthBrowserSession state.
"""

from __future__ import annotations

import hashlib
from pathlib import Path
import re

import guided_tour_practice_source
from guided_tour_practice_source import PLANNING_PRACTICE_SCRIPT

from pm7_transform_guards import (
    assert_effect_delta,
    assert_protected_sources_equal,
    capture_effect_surfaces,
    capture_protected_sources,
)


TRANSFORM_MARKER = "PM7 Guided Tour: deterministic real-shell teacher"


GUIDED_TOUR_MARKUP = r'''<!-- PM7 Guided Tour: deterministic real-shell teacher -->
<div id="pm7-guided-tour" class="pm7gt" data-open="false" data-motion="idle" data-step-id="tour.intro.comfort" data-choreography="idle" hidden>
  <div class="pm7gt-scrim" aria-hidden="true"></div>
  <div class="pm7gt-halo" aria-hidden="true"></div>
  <div class="pm7gt-pointer" aria-hidden="true"></div>
  <section class="pm7gt-callout" role="dialog" aria-modal="false">
    <header class="pm7gt-head">
      <div><span class="pm7gt-local">BEGINNER TOUR</span><span class="pm7gt-boundary">Try the real control, or choose Show Me</span></div>
      <div class="pm7gt-head-actions">
        <button type="button" id="pm7gt-eli5" class="pm7gt-quiet pm7gt-eli5" data-ui-action-id="ui.guided_tour.toggle_eli5" aria-pressed="false" data-pm-hover-label="Use simpler words" data-pm-hover-detail="The meaning stays accurate; only the explanation gets shorter and clearer.">ELI5: Off</button>
        <button type="button" class="pm7gt-quiet" data-ui-action-id="ui.guided_tour.pause">Pause</button>
        <button type="button" class="pm7gt-quiet" data-ui-action-id="ui.guided_tour.skip">Skip Tour</button>
      </div>
    </header>
    <div class="pm7gt-clip"><div class="pm7gt-stage" data-guided-tour-layer="current"></div></div>
    <footer class="pm7gt-foot">
      <button type="button" class="pm7gt-back" data-ui-action-id="ui.guided_tour.back">Back</button>
      <span class="pm7gt-progress" aria-live="polite">Introduction</span>
      <span class="pm7gt-forward-slot" role="status" aria-live="polite"><span class="pm7gt-status">Ready</span></span>
    </footer>
  </section>
</div>
<button type="button" id="pm7-guided-tour-resume" class="pm7gt-return" data-ui-action-id="ui.guided_tour.resume" hidden>Resume Guided Tour</button>
<button type="button" id="pm7-guided-tour-replay" class="pm7gt-return pm7gt-replay" data-ui-action-id="ui.guided_tour.replay" hidden>Replay Guided Tour</button>'''


GUIDED_TOUR_STYLE = r'''
<style id="pm7-guided-tour-css">
/* PM7 Guided Tour: deterministic real-shell teacher */
:root {
  --pm7gt-step-dur: 500ms;
  --pm7gt-focus-dur: 460ms;
  --pm7gt-micro-dur: 160ms;
  --pm7gt-demo-dur: 920ms;
}
.pm7gt { position: fixed; inset: 0; z-index: 2147481600; pointer-events: none; color: var(--text-primary); font-family: var(--body-font); }
.pm7gt[hidden] { display: none; }
.pm7gt-scrim { position: absolute; inset: 0; background: transparent; opacity: 1; pointer-events: none; }
.pm7gt-halo { position: fixed; left: 50%; top: 50%; width: 160px; height: 96px; box-sizing: border-box;
  border: 3px solid var(--accent-primary); border-radius: var(--radius-md); opacity: .95; pointer-events: none;
  transform: translate(-50%,-50%) scale(1); transition: opacity var(--pm7gt-focus-dur) var(--ease-out), transform var(--pm7gt-focus-dur) var(--ease-out); }
.pm7gt[data-target="missing"] .pm7gt-halo { opacity: 0; transform: translate(-50%,-50%) scale(.98); }
.pm7gt[data-target="internal"] .pm7gt-halo { opacity: 0; }
.pm7gt-pointer { position:fixed; z-index:2; left:50%; top:50%; width:16px; height:16px; border:2px solid var(--surface); border-radius:50%; background:var(--accent-primary); box-shadow:0 2px 9px rgba(0,0,0,.28); opacity:0; pointer-events:none; transform:translate(-50%,-50%); transition:left var(--pm7gt-focus-dur) var(--ease-out),top var(--pm7gt-focus-dur) var(--ease-out),opacity var(--pm7gt-micro-dur) var(--ease-default); }
.pm7gt[data-choreography="pre_cue"] .pm7gt-pointer,.pm7gt[data-choreography="travel"] .pm7gt-pointer,.pm7gt[data-choreography="arrival"] .pm7gt-pointer { opacity:1; }
.pm7gt[data-choreography="arrival"] .pm7gt-pointer { transform:translate(-50%,-50%) scale(.82); }
.pm7gt-callout { position: fixed; left: 50%; top: 50%; width: min(var(--pm7gt-theme-w,420px),var(--pm7gt-fit-w,100vw),calc(100vw - 24px)); max-height: min(640px,var(--pm7gt-fit-h,100vh),calc(100vh - 24px));
  box-sizing: border-box; display: grid; grid-template-rows: auto minmax(0,1fr) auto; overflow: visible;
  border: 1px solid var(--border); border-radius: var(--radius-lg); color: var(--text-primary); background: var(--surface-elevated);
  box-shadow: var(--elev-3); pointer-events: auto; transform: translate(-50%,-50%) scale(1); transform-origin: center; }
.pm7gt[data-motion="forward"] .pm7gt-callout { animation: pm7gt-forward var(--pm7gt-step-dur) var(--ease-out) both; }
.pm7gt[data-motion="back"] .pm7gt-callout { animation: pm7gt-back var(--pm7gt-step-dur) var(--ease-out) both; }
/* The shell never fades out between beats.  Keeping it opaque prevents the
   full-screen scrim from becoming the only visible tour surface while an
   owner page or panel rerenders underneath it. */
@keyframes pm7gt-forward { from { opacity: 1; transform: translate(-50%,-50%) scale(1); } to { opacity: 1; transform: translate(-50%,-50%) scale(1); } }
@keyframes pm7gt-back { from { opacity: 1; transform: translate(-50%,-50%) scale(1); } to { opacity: 1; transform: translate(-50%,-50%) scale(1); } }
.pm7gt[data-motion="forward"] .pm7gt-stage { animation: pm7gt-stage-forward var(--pm7gt-step-dur) var(--ease-out) both; }
.pm7gt[data-motion="back"] .pm7gt-stage { animation: pm7gt-stage-back var(--pm7gt-step-dur) var(--ease-out) both; }
@keyframes pm7gt-stage-forward { from { opacity: .84; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pm7gt-stage-back { from { opacity: .84; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
.pm7gt-head,.pm7gt-foot { display: flex; align-items: center; gap: 10px; padding: 11px 14px; }
.pm7gt-head { justify-content: space-between; border-bottom: 1px solid var(--border-light); }
.pm7gt-head > div:first-child { display: grid; gap: 2px; min-width: 0; max-width: 132px; }
.pm7gt-local { color: var(--accent-primary); font-size: 10px; font-weight: 900; letter-spacing: .12em; }
.pm7gt-boundary { color: var(--text-muted); font-size: 10px; white-space: normal; }
.pm7gt-head-actions,.pm7gt-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.pm7gt-head-actions { flex: 0 0 auto; flex-wrap: nowrap; gap: 4px; }
.pm7gt-head-actions button { min-height: 30px; padding: 5px 7px; font-size: 11px; white-space: nowrap; }
.pm7gt-clip { min-height: 0; overflow: auto; overscroll-behavior: contain; }
.pm7gt-stage { min-height: 0; overflow: visible; padding: 18px; box-sizing: border-box; }
.pm7gt-kicker { margin: 0 0 8px; color: var(--accent-primary); font-size: var(--fs-sm); font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
.pm7gt h2 { margin: 0; color: var(--text-primary); font-family: var(--display-font); font-size: clamp(20px,2.4vw,24px); line-height: 1.18; }
.pm7gt h2[data-pm-hover-exempt="programmatic-focus-landmark"]:focus,
.pm7gt h2[data-pm-hover-exempt="programmatic-focus-landmark"]:focus-visible { outline:none !important; outline-offset:0 !important; }
.pm7gt-copy { margin: 10px 0 0; color: var(--text-primary); font-size: 15px; font-weight: 650; line-height: 1.5; }
.pm7gt-note { margin: 12px 0 0; padding: 10px 11px; border: 1px solid var(--border-light); border-radius: var(--radius-sm); color: var(--text-secondary); background: var(--surface); font-size: 12px; line-height: 1.45; }
.pm7gt-reason { margin: 12px 0 0; padding: 9px 10px; background: var(--surface); }
.pm7gt-actions { margin-top: 16px; }
.pm7gt-actions:empty { display:none; margin:0; }
.pm7gt-actions > button { flex: 1 1 150px; }
.pm7gt-mode-label { flex:1 1 100%; color:var(--text-muted); font-size:11px; line-height:1.35; }
.pm7gt[data-action-mode="try"] .pm7gt-halo { box-shadow:0 0 0 5px var(--surface),0 0 24px var(--accent-primary); }
.pm7gt-watched { box-shadow: 0 0 0 3px var(--accent-primary); }
.pm7gt-eli5[aria-pressed="true"] { border-color: var(--accent-primary) !important; color: var(--accent-primary) !important; background: var(--surface) !important; }
.pm7gt-live { margin: 14px 0 0; min-height: 42px; display: grid; align-items: center; padding: 9px 11px; overflow: hidden; border: 1px solid var(--border-light); border-radius: var(--radius-md); background: var(--surface); color: var(--text-secondary); font-size: 12px; }
.pm7gt-live-track { position: relative; height: 4px; overflow: hidden; border-radius: var(--radius-pill); background: var(--border-light); }
.pm7gt-live-track::after { content: ""; position: absolute; inset: 0; background: var(--accent-primary); transform-origin: left center; animation: pm7gt-demo-progress var(--pm7gt-demo-dur,920ms) linear both; }
.pm7gt[data-demo="panel-round-trip"] .pm7gt-halo,.pm7gt[data-demo="planning-scan"] .pm7gt-halo { animation: pm7gt-halo-breathe 480ms var(--ease-out) infinite alternate; }
@keyframes pm7gt-demo-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes pm7gt-halo-breathe { from { opacity: .72; } to { opacity: 1; } }
.pm7gt-question-list { margin: 14px 0 0; display: grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap: 6px; padding: 0; list-style: none; }
.pm7gt-question-list li { margin: 0; padding: 0; }
.pm7gt-question-list button { width: 100%; min-height: 34px; padding: 7px 9px; border-color: var(--border-light); color: var(--text-secondary); background: var(--surface); font-size: 12px; text-align: left; }
.pm7gt-question-count { margin: 10px 0 0; color: var(--text-muted); font-size: 11px; line-height: 1.4; }
.pm7gt-question-more { margin:10px 0 0; border:1px solid var(--border-light); border-radius:var(--radius-sm); background:var(--surface); }
.pm7gt-question-more summary { min-height:36px; display:flex; align-items:center; padding:7px 10px; color:var(--text-primary); font-size:12px; font-weight:800; cursor:pointer; }
.pm7gt-question-more[open] summary { border-bottom:1px solid var(--border-light); }
.pm7gt-question-more .pm7gt-question-list { margin:0; padding:9px; }
.pm7gt-question-group { grid-column:1/-1; margin:4px 0 0; color:var(--accent-primary); font-size:10px; font-weight:900; letter-spacing:.07em; text-transform:uppercase; }
.pm7gt-teacher-card[data-copy-mode="eli5"] { border-width: 2px; }
.pm7gt-teacher-answer { display: block; }
.pm7gt-teacher-eli5 { margin-top: 10px !important; padding-top: 10px; border-top: 1px solid var(--border-light); }
.pm7gt-teacher-eli5[hidden] { display: none; }
.pm7gt button { min-height: 38px; padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-primary); background: var(--surface); font: inherit; cursor: pointer;
  transition: transform var(--pm7gt-micro-dur) var(--ease-out), background var(--pm7gt-micro-dur) var(--ease-default), opacity var(--pm7gt-micro-dur) var(--ease-default); }
.pm7gt button:hover:not(:disabled):not([aria-disabled="true"]),.pm7gt-return:hover:not(:disabled):not([aria-disabled="true"]) { transform: none; background: var(--border-light); box-shadow: 0 0 0 1px var(--border); }
.pm7gt button:active:not(:disabled):not([aria-disabled="true"]),.pm7gt-return:active:not(:disabled):not([aria-disabled="true"]) { transform: translateY(0) scale(.98); }
.pm7gt button:focus-visible,.pm7gt-return:focus-visible { outline: 3px solid var(--accent-primary); outline-offset: 2px; }
.pm7gt button:disabled,.pm7gt button[aria-disabled="true"] { cursor: not-allowed; opacity: .48; }
.pm7gt-primary { border-color: var(--accent-primary) !important; color: var(--surface) !important; background: var(--accent-primary) !important; font-weight: 800 !important; }
.pm7gt-secondary { font-weight: 700 !important; }
.pm7gt-quiet,.pm7gt-back { min-height: 32px !important; padding: 6px 8px !important; border-color: transparent !important; background: transparent !important; color: var(--text-secondary) !important; font-size: 12px !important; }
.pm7gt [data-ack="true"] { outline: 2px solid var(--accent-primary); outline-offset: 2px; }
.pm7gt-foot { display:grid; grid-template-columns:minmax(84px,1fr) auto minmax(132px,1fr); border-top: 1px solid var(--border-light); }
.pm7gt-progress { justify-self:center; color: var(--text-secondary); font-size: 12px; font-weight: 700; }
.pm7gt-forward-slot { min-width:0; display:flex; justify-content:flex-end; align-items:center; }
.pm7gt-forward-slot > button { min-height:34px; max-width:100%; padding:6px 10px; font-size:12px; white-space:normal; }
.pm7gt-status,.pm7gt-control-cue { max-width:176px; overflow-wrap:anywhere; color:var(--text-muted); font-size:11px; font-weight:700; line-height:1.3; text-align:right; }
.pm7gt-control-cue::before { content:""; display:inline-block; width:7px; height:7px; margin-right:6px; border:2px solid var(--accent-primary); border-radius:50%; vertical-align:-1px; }
.pm7gt-back[aria-disabled="true"] { opacity:.48; cursor:not-allowed; }
.pm7gt-return { position: fixed; right: 18px; bottom: 18px; z-index: 2147481599; min-height: 42px; padding: 9px 15px;
  border: 1px solid var(--accent-primary); border-radius: var(--radius-pill); color: var(--surface); background: var(--accent-primary);
  box-shadow: var(--elev-2); font: 800 var(--fs-md) var(--body-font); cursor: pointer; }
.pm7gt-replay { bottom: 68px; }
.pm7gt-return[hidden] { display: none; }
html[data-pm7-guided-tour-open="true"] #pm7-onboarding-resume { display: none !important; }
#pm7-onboarding-resume:not([hidden]) ~ #pm7-guided-tour-resume { bottom: 76px; }
.pm7gt-teacher-card { margin: 10px 8px; padding: 12px; border: 1px solid var(--accent-primary); border-radius: var(--radius-md); background: var(--surface); color: var(--text-primary); }
.pm7gt-teacher-card small { display: block; margin-bottom: 8px; color: var(--accent-primary); font-weight: 800; letter-spacing: .06em; }
.pm7gt-teacher-card p { margin: 6px 0; color: var(--text-secondary); line-height: 1.45; }
.pm7gt-teacher-card strong { color: var(--text-primary); }
.pm7gt-browse { grid-column:1/-1; width:100%; min-height:34px !important; margin-top:8px; font-size:12px !important; font-weight:800 !important; }
#pm7gt-teacher-library { position:absolute; inset:10px; z-index:2147481598; display:grid; grid-template-rows:auto minmax(0,1fr); overflow:hidden; box-sizing:border-box; border:1px solid var(--accent-primary); border-radius:var(--radius-lg); background:var(--surface-elevated); box-shadow:var(--elev-3); color:var(--text-primary); }
.pm7gt[data-teacher-library="open"] .pm7gt-callout { visibility:hidden; opacity:0; pointer-events:none; }
.pm7gt-library-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:10px 12px; border-bottom:1px solid var(--border-light); }
.pm7gt-library-head strong { font-family:var(--display-font); font-size:14px; }
.pm7gt-library-head button { min-height:32px; padding:5px 9px; border:1px solid var(--border); border-radius:var(--radius-sm); background:var(--surface); color:var(--text-primary); font:700 12px var(--body-font); cursor:pointer; }
.pm7gt-library-groups { min-height:0; overflow:auto; display:grid; gap:12px; padding:12px; }
.pm7gt-library-group { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:6px; }
.pm7gt-library-group h3 { grid-column:1/-1; margin:0 0 2px; color:var(--accent-primary); font-size:10px; letter-spacing:.07em; text-transform:uppercase; }
.pm7gt-library-group button { min-height:34px; padding:7px 9px; border:1px solid var(--border-light); border-radius:var(--radius-sm); background:var(--surface); color:var(--text-secondary); font:600 12px/1.3 var(--body-font); text-align:left; cursor:pointer; }
.pm7gt-practice-host { position:relative !important; overflow:hidden !important; }
.pm7gt-planning-practice { position:absolute; inset:0; z-index:80; box-sizing:border-box; overflow:auto; overscroll-behavior:contain; padding:clamp(16px,3vw,38px); color:var(--text-primary); background:var(--background); font-family:var(--body-font); }
.pm7gt-practice-head,.pm7gt-practice-body { width:min(820px,100%); margin-inline:auto; box-sizing:border-box; }
.pm7gt-practice-head { display:grid; gap:5px; margin-bottom:16px; }
.pm7gt-practice-head > span { color:var(--accent-primary); font-size:10px; font-weight:900; letter-spacing:.12em; }
.pm7gt-practice-head > strong { font:800 clamp(21px,3vw,30px)/1.1 var(--display-font); }
.pm7gt-practice-head > small { color:var(--text-muted); font-size:12px; }
.pm7gt-practice-body { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; align-content:start; }
.pm7gt-practice-body button,.pm7gt-practice-goal { min-width:0; box-sizing:border-box; border:1px solid var(--border); border-radius:var(--radius-md); color:var(--text-primary); background:var(--surface); font:inherit; }
.pm7gt-practice-body button { min-height:54px; padding:11px 13px; cursor:pointer; text-align:left; transition:transform 180ms var(--ease-out),background 180ms var(--ease-default),border-color 180ms var(--ease-default); }
.pm7gt-practice-body button:hover,.pm7gt-practice-body button:focus-visible { border-color:var(--accent-primary); background:var(--surface-elevated); outline:3px solid var(--accent-primary); outline-offset:2px; }
.pm7gt-practice-body button:active { transform:scale(.985); }
.pm7gt-practice-project,.pm7gt-practice-guided { display:grid; gap:3px; }
.pm7gt-practice-project span,.pm7gt-practice-guided span,.pm7gt-practice-goal small { color:var(--text-muted); font-size:10px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; }
.pm7gt-practice-project strong,.pm7gt-practice-guided strong { font-size:14px; }
.pm7gt-practice-project[aria-pressed="true"],.pm7gt-practice-guided[aria-pressed="true"] { border-color:var(--accent-primary); box-shadow:inset 0 0 0 2px var(--accent-primary); }
.pm7gt-practice-goal { grid-column:1/-1; display:grid; grid-template-columns:minmax(0,1fr) auto; gap:9px; padding:13px; }
.pm7gt-practice-goal > span,.pm7gt-practice-goal > small { grid-column:1/-1; color:var(--text-secondary); font-size:12px; font-weight:800; }
.pm7gt-practice-goal textarea { min-width:0; min-height:72px; resize:vertical; box-sizing:border-box; padding:10px 11px; border:1px solid var(--border-light); border-radius:var(--radius-sm); color:var(--text-primary); background:var(--background); font:600 13px/1.45 var(--body-font); }
.pm7gt-practice-goal button { min-height:42px; align-self:end; text-align:center; font-weight:800; }
.pm7gt-practice-goal.is-set { display:grid; grid-template-columns:1fr; }
.pm7gt-practice-goal.is-set strong { font-size:13px; line-height:1.45; }
.pm7gt-practice-primary { grid-column:1/-1; border-color:var(--accent-primary) !important; color:var(--surface) !important; background:var(--accent-primary) !important; text-align:center !important; font-weight:900 !important; }
.pm7gt-practice-outcomes,.pm7gt-practice-question,.pm7gt-practice-review { grid-column:1/-1; display:grid; gap:9px; padding:14px; border:1px solid var(--border); border-radius:var(--radius-md); background:var(--surface-elevated); animation:pm7gt-practice-arrive 420ms var(--ease-out) both; }
.pm7gt-practice-outcomes > div { padding:9px 11px; border:1px solid var(--border-light); border-radius:var(--radius-sm); background:var(--surface); font-size:13px; }
.pm7gt-practice-choices { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; }
.pm7gt-practice-choices button { min-height:44px; text-align:center; }
.pm7gt-practice-choices button[aria-pressed="true"] { border-color:var(--accent-primary); box-shadow:inset 0 0 0 2px var(--accent-primary); }
.pm7gt-practice-link { justify-self:start; min-height:34px !important; padding:6px 9px !important; color:var(--accent-primary) !important; font-weight:800 !important; }
.pm7gt-practice-why { margin:0; padding:10px 11px; border:1px solid var(--accent-primary); border-radius:var(--radius-sm); color:var(--text-secondary); background:var(--surface); font-size:12px; line-height:1.45; }
.pm7gt-practice-review { grid-template-columns:repeat(2,minmax(0,1fr)); }
.pm7gt-practice-review header { grid-column:1/-1; display:flex; justify-content:space-between; gap:12px; align-items:center; }
.pm7gt-practice-review header span { color:var(--accent-primary); font-size:11px; font-weight:850; }
.pm7gt-practice-review > div { display:grid; gap:4px; min-height:58px; padding:10px; border:1px solid var(--border-light); border-radius:var(--radius-sm); background:var(--surface); }
.pm7gt-practice-review small { color:var(--text-muted); font-size:9px; font-weight:900; letter-spacing:.08em; }
.pm7gt-practice-body button:disabled { cursor:default; opacity:.7; transform:none; }
.pm7gt-practice-body button:disabled:hover { outline:none; background:var(--surface); }
.pm7gt-practice-question[data-editing="true"] { border-color:var(--accent-primary); }
.pm7gt-practice-review .pm7gt-practice-changed { animation:pm7gt-practice-consequence 560ms var(--ease-out) both; }
@keyframes pm7gt-practice-consequence { from { transform:translateY(4px); outline:2px solid var(--accent-primary); outline-offset:3px; } to { transform:none; outline:2px solid transparent; outline-offset:0; } }
html[data-motion="reduced"] .pm7gt-practice-review .pm7gt-practice-changed { animation:none; outline:2px solid var(--accent-primary); outline-offset:2px; }
@media (prefers-reduced-motion:reduce) { .pm7gt-practice-review .pm7gt-practice-changed { animation:none; outline:2px solid var(--accent-primary); outline-offset:2px; } }
.pm7gt-practice-review b { font-size:12px; line-height:1.35; }
.pm7gt-practice-review > button { grid-column:1/-1; min-height:42px; text-align:center; font-weight:800; }
@keyframes pm7gt-practice-arrive { from { opacity:.2; transform:translateY(8px) scale(.99); } to { opacity:1; transform:translateY(0) scale(1); } }
html[data-theme^="friendly"] .pm7gt-planning-practice { background:var(--surface-alt); }
html[data-theme^="friendly"] .pm7gt-practice-body button,html[data-theme^="friendly"] .pm7gt-practice-goal,html[data-theme^="friendly"] .pm7gt-practice-outcomes,html[data-theme^="friendly"] .pm7gt-practice-question,html[data-theme^="friendly"] .pm7gt-practice-review { border-radius:20px 14px 22px 15px; box-shadow:0 8px 20px rgba(0,0,0,.10); }
html[data-theme^="glass"] .pm7gt-planning-practice { background:var(--background); }
html[data-theme^="glass"] .pm7gt-practice-body { padding:12px; border:1px solid var(--border-light); border-radius:20px; background:var(--surface-alt); box-shadow:12px 12px 0 -6px var(--border-light); }
html[data-theme^="glass"] .pm7gt-practice-body button,html[data-theme^="glass"] .pm7gt-practice-goal,html[data-theme^="glass"] .pm7gt-practice-outcomes,html[data-theme^="glass"] .pm7gt-practice-question,html[data-theme^="glass"] .pm7gt-practice-review { border-color:var(--border-light); background:var(--surface-elevated); box-shadow:inset 0 0 0 1px var(--border-light); }
html[data-theme^="basic"] .pm7gt-practice-body { gap:8px; }
html[data-theme^="basic"] .pm7gt-practice-body button,html[data-theme^="basic"] .pm7gt-practice-goal,html[data-theme^="basic"] .pm7gt-practice-outcomes,html[data-theme^="basic"] .pm7gt-practice-question,html[data-theme^="basic"] .pm7gt-practice-review,html[data-theme^="basic"] .pm7gt-practice-review > div { border-radius:0; box-shadow:none; }
html[data-theme^="retro"] .pm7gt-planning-practice { background:var(--background); font-family:monospace; }
html[data-theme^="retro"] .pm7gt-practice-head > strong { font-family:monospace; text-transform:uppercase; }
html[data-theme^="retro"] .pm7gt-practice-body { padding:10px; border:2px solid var(--accent-primary); box-shadow:6px 6px 0 var(--border); }
html[data-theme^="retro"] .pm7gt-practice-body button,html[data-theme^="retro"] .pm7gt-practice-goal,html[data-theme^="retro"] .pm7gt-practice-outcomes,html[data-theme^="retro"] .pm7gt-practice-question,html[data-theme^="retro"] .pm7gt-practice-review,html[data-theme^="retro"] .pm7gt-practice-review > div { border-radius:0; font-family:monospace; box-shadow:none; }
html[data-theme^="retro"] .pm7gt-practice-outcomes,html[data-theme^="retro"] .pm7gt-practice-question,html[data-theme^="retro"] .pm7gt-practice-review { animation-duration:140ms; animation-timing-function:steps(2,end); }
/* Four distinct visual directing systems. They share the same lesson and
   measured target adapter, but deliberately do not share one card silhouette. */
.pm7gt-callout::before,.pm7gt-callout::after { content:""; position:absolute; pointer-events:none; box-sizing:border-box; }
.pm7gt-kicker::before { content:""; display:inline-block; width:14px; height:14px; margin-right:8px; vertical-align:-2px; box-sizing:border-box; }
html[data-theme^="friendly"] .pm7gt-callout { --pm7gt-theme-w:440px; border-radius:36px 36px 36px 12px; background:var(--surface-elevated); box-shadow:0 22px 60px rgba(0,0,0,.24),0 0 0 7px var(--surface); }
html[data-theme^="friendly"] .pm7gt-callout::before { right:26px; top:-17px; width:54px; height:30px; border:7px solid var(--surface); border-radius:60% 45% 55% 40%; background:var(--accent-primary); transform:rotate(7deg); }
html[data-theme^="friendly"] .pm7gt-callout::after { right:12px; bottom:22px; width:22px; height:22px; border:5px solid var(--surface); border-radius:50%; background:var(--accent-primary); }
html[data-theme^="friendly"] .pm7gt-head { padding:16px 20px 13px; border-radius:36px 36px 0 0; background:var(--surface-alt); }
html[data-theme^="friendly"] .pm7gt-stage { padding:21px 24px; }
html[data-theme^="friendly"] .pm7gt-kicker::before { border:3px solid var(--accent-primary); border-radius:50% 50% 44% 56%; background:var(--surface); transform:rotate(-10deg); box-shadow:8px 3px 0 -4px var(--accent-primary); }
html[data-theme^="friendly"] .pm7gt-note,html[data-theme^="friendly"] .pm7gt-live,html[data-theme^="friendly"] .pm7gt-question-list button { border-radius:16px 12px 17px 13px; }
html[data-theme^="friendly"] .pm7gt-halo { border-width:4px; border-radius:999px; box-shadow:0 0 0 7px var(--surface); }
html[data-theme^="friendly"] .pm7gt-primary,html[data-theme^="friendly"] .pm7gt-secondary { border-radius:999px; }
html[data-theme^="glass"] .pm7gt-callout { --pm7gt-theme-w:448px; border-color:var(--border-light); border-radius:18px; background:var(--surface-elevated); box-shadow:0 30px 90px rgba(0,0,0,.38),inset 0 0 0 1px var(--border-light),12px 12px 0 -7px var(--surface-alt); }
html[data-theme^="glass"] .pm7gt-callout::before { inset:14px -14px -14px 14px; z-index:-1; border:1px solid var(--border-light); border-radius:18px; background:var(--surface-alt); }
html[data-theme^="glass"] .pm7gt-callout::after { right:24px; top:-13px; width:28px; height:28px; border:2px solid var(--accent-primary); border-radius:6px; background:var(--surface); transform:rotate(45deg); box-shadow:8px 8px 0 var(--border-light); }
html[data-theme^="glass"] .pm7gt-head { margin:7px 7px 0; border:1px solid var(--border-light); border-radius:13px; background:var(--surface); box-shadow:inset 0 0 0 1px var(--border-light); }
html[data-theme^="glass"] .pm7gt-foot { margin:0 7px 7px; border:1px solid var(--border-light); border-radius:13px; background:var(--surface); }
html[data-theme^="glass"] .pm7gt-kicker::before { border:2px solid var(--accent-primary); border-radius:3px; background:var(--surface); transform:rotate(45deg); box-shadow:5px 5px 0 var(--border-light),-5px -5px 0 var(--surface-alt); }
html[data-theme^="glass"] .pm7gt-halo { border-width:2px; border-radius:18px; box-shadow:0 0 0 5px var(--border-light),0 0 28px var(--accent-primary); }
html[data-theme^="glass"] .pm7gt-live-track { height:7px; border:1px solid var(--border-light); background:var(--surface-alt); }
html[data-theme^="basic"] .pm7gt-callout { --pm7gt-theme-w:392px; border:2px solid var(--text-primary); border-top-width:8px; border-radius:0; background:var(--surface); box-shadow:none; }
html[data-theme^="basic"] .pm7gt-callout::before { left:12px; right:12px; top:7px; height:1px; background:var(--border-light); }
html[data-theme^="basic"] .pm7gt-callout::after { right:12px; bottom:10px; width:54px; height:8px; border-top:2px solid var(--text-primary); border-bottom:2px solid var(--text-primary); }
html[data-theme^="basic"] .pm7gt-head,html[data-theme^="basic"] .pm7gt-foot { background:var(--background); }
html[data-theme^="basic"] .pm7gt-head { display:grid; grid-template-columns:minmax(0,1fr) auto; align-items:start; }
html[data-theme^="basic"] .pm7gt-stage { padding:16px; }
html[data-theme^="basic"] .pm7gt-kicker::before { border:2px solid var(--text-primary); border-radius:50%; background:var(--surface); box-shadow:inset 0 0 0 3px var(--surface),inset 0 0 0 4px var(--accent-primary); }
html[data-theme^="basic"] .pm7gt-note,html[data-theme^="basic"] .pm7gt-live,html[data-theme^="basic"] .pm7gt-question-list button,html[data-theme^="basic"] .pm7gt button { border-radius:2px; box-shadow:none; }
html[data-theme^="basic"] .pm7gt-halo { border-width:2px; border-radius:2px; box-shadow:6px 6px 0 var(--border-light); }
html[data-theme^="retro"] .pm7gt-callout,html[data-theme^="retro"] .pm7gt button,html[data-theme^="retro"] .pm7gt-return,html[data-theme^="retro"] .pm7gt-halo { border-radius: 0; }
html[data-theme^="retro"] .pm7gt-callout { --pm7gt-theme-w:460px; border:2px solid var(--accent-primary); box-shadow:7px 7px 0 var(--border); font-family:monospace; }
html[data-theme^="retro"] .pm7gt-callout::before { content:"TOUR.EXE"; right:9px; top:8px; width:auto; height:auto; color:var(--accent-primary); font:900 10px/1 monospace; letter-spacing:.12em; }
html[data-theme^="retro"] .pm7gt-callout::after { left:10px; right:10px; bottom:-6px; height:4px; background:var(--accent-primary); box-shadow:14px 0 0 var(--border),28px 0 0 var(--accent-primary); }
html[data-theme^="retro"] .pm7gt-head { background:var(--background); border-bottom:2px solid var(--accent-primary); }
html[data-theme^="retro"] .pm7gt-kicker::before { content:">"; width:16px; height:16px; border:0; color:var(--accent-primary); font:900 15px/16px monospace; transform:none; }
html[data-theme^="retro"] .pm7gt-halo { border:2px dashed var(--accent-primary); box-shadow:4px 4px 0 var(--border); }
html[data-theme^="retro"] .pm7gt[data-motion="forward"] .pm7gt-callout,
html[data-theme^="retro"] .pm7gt[data-motion="back"] .pm7gt-callout,
html[data-theme^="retro"] .pm7gt[data-motion="forward"] .pm7gt-stage,
html[data-theme^="retro"] .pm7gt[data-motion="back"] .pm7gt-stage { animation-duration: 140ms; animation-timing-function: steps(2,end); }
html[data-theme^="retro"] .pm7gt[data-motion="forward"] .pm7gt-callout { animation-name: pm7gt-retro-forward; }
html[data-theme^="retro"] .pm7gt[data-motion="back"] .pm7gt-callout { animation-name: pm7gt-retro-back; }
html[data-theme^="retro"] .pm7gt-live-track::after,
html[data-theme^="retro"] .pm7gt[data-demo] .pm7gt-halo { animation-duration: 140ms; animation-timing-function: steps(2,end); }
@keyframes pm7gt-retro-forward { from { opacity: 1; transform: translate(-50%,-50%); } to { opacity: 1; transform: translate(-50%,-50%); } }
@keyframes pm7gt-retro-back { from { opacity: 1; transform: translate(-50%,-50%); } to { opacity: 1; transform: translate(-50%,-50%); } }
html[data-theme^="retro"] .pm7gt-halo { transition-duration: 140ms; transition-timing-function: steps(2,end); transform: translate(-50%,-50%); }
/* Light and dark modes keep the same family silhouette but receive their own
   paint treatment. These are deliberate variants, not a generic opacity wash. */
html[data-theme="friendly-light"] .pm7gt-callout { box-shadow:0 20px 52px rgba(45,75,92,.18),0 0 0 7px var(--surface); }
html[data-theme="friendly-dark"] .pm7gt-callout { box-shadow:0 24px 68px rgba(0,0,0,.42),0 0 0 7px var(--surface); }
html[data-theme="glass-light"] .pm7gt-callout { box-shadow:0 28px 76px rgba(45,50,78,.22),inset 0 0 0 1px rgba(255,255,255,.74),12px 12px 0 -7px var(--surface-alt); }
html[data-theme="glass-dark"] .pm7gt-callout { box-shadow:0 34px 96px rgba(0,0,0,.52),inset 0 0 0 1px rgba(255,255,255,.14),12px 12px 0 -7px var(--surface-alt); }
html[data-theme="basic-light"] .pm7gt-callout { background:var(--surface); box-shadow:0 8px 0 rgba(20,30,38,.08); }
html[data-theme="basic-dark"] .pm7gt-callout { background:var(--background); box-shadow:0 8px 0 rgba(0,0,0,.30); }
html[data-theme="retro-light"] .pm7gt-callout { background:var(--surface); box-shadow:7px 7px 0 rgba(40,35,20,.22); }
html[data-theme="retro-dark"] .pm7gt-callout { background:var(--background); box-shadow:7px 7px 0 var(--border); }
html[data-theme^="friendly"] .pm7gt[data-motion="forward"] .pm7gt-stage { animation-name:pm7gt-friendly-stage; animation-duration:540ms; }
html[data-theme^="glass"] .pm7gt[data-motion="forward"] .pm7gt-stage { animation-name:pm7gt-glass-stage; animation-duration:500ms; }
html[data-theme^="basic"] .pm7gt[data-motion="forward"] .pm7gt-stage { animation-name:pm7gt-basic-stage; animation-duration:430ms; }
@keyframes pm7gt-friendly-stage { from { opacity:.9; transform:translate(8px,5px) rotate(.25deg); } to { opacity:1; transform:translate(0,0) rotate(0); } }
@keyframes pm7gt-glass-stage { from { opacity:.82; transform:translateY(9px); clip-path:inset(0 0 16% 0); } to { opacity:1; transform:translateY(0); clip-path:inset(0); } }
@keyframes pm7gt-basic-stage { from { opacity:1; transform:translateY(-3px); clip-path:inset(0 0 82% 0); } to { opacity:1; transform:translateY(0); clip-path:inset(0); } }
@media (max-width: 640px) {
  .pm7gt-callout { width: calc(100vw - 12px); max-height: min(300px,calc(100vh - 12px)); }
  /* During a watched click the real control, not the director card, owns the
     remaining screen.  The compact card can sit wholly above or below even in
     the 320 x 560 floor viewport; its middle remains scrollable. */
  .pm7gt[data-step-id] .pm7gt-callout { max-height: min(250px,calc(100vh - 12px)); }
  .pm7gt-head { display: grid; grid-template-columns: minmax(0,1fr) auto; align-items: start; }
  .pm7gt-head-actions { justify-content: end; gap: 2px; }
  .pm7gt-head-actions button { min-height: 30px !important; padding: 4px 6px !important; }
  .pm7gt-head,.pm7gt-foot { padding-block: 7px; }
  .pm7gt-stage { min-height: 0; padding: 14px; }
  .pm7gt-actions { position: static; margin: 12px 0 0; padding: 0; background: transparent; }
  .pm7gt-actions > button { flex: 1 1 100%; }
  .pm7gt-foot { grid-template-columns:auto 1fr minmax(112px,1.2fr); }
  .pm7gt-status,.pm7gt-control-cue { max-width:132px; }
  .pm7gt-library-group { grid-template-columns:1fr; }
  .pm7gt-planning-practice { padding:12px; }
  .pm7gt-practice-body,.pm7gt-practice-review { grid-template-columns:1fr; }
  .pm7gt-practice-goal,.pm7gt-practice-primary,.pm7gt-practice-outcomes,.pm7gt-practice-question,.pm7gt-practice-review,.pm7gt-practice-review header,.pm7gt-practice-review > button { grid-column:1; }
  .pm7gt-practice-choices { grid-template-columns:1fr; }
}
@media (max-width: 420px) {
  .pm7gt-boundary { display:none; }
  .pm7gt-head > div:first-child { max-width:72px; }
  .pm7gt h2 { font-size: 19px; }
  .pm7gt-copy { font-size: 13px; }
  .pm7gt-question-list { grid-template-columns:1fr; }
  .pm7gt-foot { grid-template-columns:auto 1fr minmax(100px,1.25fr); }
}
@media (prefers-reduced-motion: reduce) {
  .pm7gt *,.pm7gt *::before,.pm7gt *::after,.pm7gt-return { animation-duration: 80ms !important; animation-delay: 0ms !important; transition-duration: 80ms !important; }
}
html[data-motion="reduced"] .pm7gt *,html[data-motion="reduced"] .pm7gt *::before,html[data-motion="reduced"] .pm7gt *::after,html[data-motion="reduced"] .pm7gt-return { animation-duration: 80ms !important; animation-delay: 0ms !important; transition-duration: 80ms !important; }
</style>'''


_GUIDED_TOUR_LEGACY_SCRIPT = r'''
<script id="pm7-guided-tour-js">
/* PM7 Guided Tour: deterministic real-shell teacher */
(function () {
  'use strict';
  function installGuidedTour() {
  var root=document.getElementById('pm7-guided-tour'),resumeButton=document.getElementById('pm7-guided-tour-resume'),replayButton=document.getElementById('pm7-guided-tour-replay'),eli5Button=document.getElementById('pm7gt-eli5');
  if(!root||!resumeButton||!replayButton||!eli5Button||window.PM7_GUIDED_TOUR)return;
  var stage=root.querySelector('[data-guided-tour-layer="current"]'),halo=root.querySelector('.pm7gt-halo'),callout=root.querySelector('.pm7gt-callout');
  var backButton=root.querySelector('[data-ui-action-id="ui.guided_tour.back"]'),progress=root.querySelector('.pm7gt-progress'),forwardSlot=root.querySelector('.pm7gt-forward-slot');
  var STORYBOARD={schema_id:'pm.guided_tour.storyboard.v2',revision:'orientation-panel-usage-planning-teacher-2026-09-01',order:['usage','planning_wizard','chat_teacher'],promise:'Learn the workspace, see Usage and Planning, then ask Teacher for help.',scenes:[{id:'usage',purpose:'Orient to page navigation, watch real work panels rearrange and return, then verify one Usage card menu before a reversible resize, hide, and reveal film.'},{id:'planning_wizard',purpose:'Visit the mounted Planning intake, choose an unselected work type, and open the mounted requirements experience.'},{id:'chat_teacher',purpose:'Use Chat’s mounted guide picker to select Teacher, send a real suggested question, and receive a built-in reply.'}],continuity:'The story moves forward from orientation and Usage to Planning and then Chat.',mobile_rule:'Compact callouts stay fully visible and never replace the exact control being taught.'};
  var STEPS=STORYBOARD.order.slice();
  var PHASES={
    usage:['orientation','panel_round_trip','open_usage','usage_overview','usage_options_try','usage_card_film','usage_success'],
    planning_wizard:['planning_scan','planning_intent_try','planning_requirements_try','planning_success','planning_review'],
    chat_teacher:['chat_picker','teacher_select','teacher_composer','teacher_wait','teacher_reply']
  };
  var UI_ACTIONS=['ui.guided_tour.start','ui.guided_tour.next','ui.guided_tour.back','ui.guided_tour.pause','ui.guided_tour.resume','ui.guided_tour.skip','ui.guided_tour.focus_route','ui.guided_tour.toggle_eli5','ui.guided_tour.finish','ui.guided_tour.replay'];
  var timings={step_ms:500,focus_ms:460,minimum_non_retro_ms:420,maximum_non_retro_ms:560,retro_ms:140,reduced_ms:0,same_frame_ack_ms:0};
  var state={open:false,status:'first_launch',step:'chat_teacher',step_index:0,phase:0,phase_key:'chat_picker',last_action:null,last_result:null,last_error:null,
    layout_disposition:'pending',completed:false,skipped:false,transition_serial:0,motion:'idle',provider_use_count:0,
    teacher_mode:'local_deterministic_zero_provider',teacher_thread_id:null,teacher_persona_selected:false,teacher_message_sent:false,teacher_available_after_tour:false,
    teacher_answer_id:null,teacher_response_message_id:null,teacher_copy_mode:'normal',eli5_enabled:false,active_widget_id:null,panel_demo_target_id:null,panel_demo_pair_ids:null,demo_name:null,
    panel_demo_complete:false,usage_menu_verified:false,usage_card_demo_complete:false,planning_scan_target:'attach',planning_original_intent:null,planning_original_stage:null,planning_requirements_opened:false,planning_choice_arg:null,planning_choice_label:null,
    page_before_usage:null,low_resource_profile:false,shell_squeezed:false,source:'unknown'};
  var original=null,journal=[],history=[],uiActionLog=[],effectReceipts=[],listeners=[],transitionTimer=0,receiptSerial=0,sessionSerial=0,activeTarget=null,motionWritePending=false,ownerRouteSerial=0,ownerRoutePending=false;
  var lastOutsideFocus=null,lastOutsideFocusAt=0;
  var demoSequence=null,targetFrame=0,targetResizeObserver=null,teacherOriginalSend=null,teacherMessageSerial=0,teacherPending=null,teacherLibraryHostInlinePosition=null,restoringPlanning=false;
  var reduced=motionReduced();
  function clone(value){if(value===undefined)return undefined;return JSON.parse(JSON.stringify(value));}
  function motionReduced(){try{return document.documentElement.getAttribute('data-motion')==='reduced'||!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);}catch(error){return false;}}
  function currentTheme(){return document.documentElement.getAttribute('data-theme')||'unknown';}
  function snapshot(){
    return {schema_id:'pm.guided_tour.concept_snapshot.v1',schema_version:'1.0.0',concept_simulation_only:true,durable_session_record:false,
      real_shell_owner_observation:true,production_runtime_certification:false,open:state.open,status:state.status,step:state.step,step_index:state.step_index,
      phase:state.phase,phase_key:state.phase_key,last_action:state.last_action,last_result:clone(state.last_result),last_error:state.last_error,layout_disposition:state.layout_disposition,
      completed:state.completed,skipped:state.skipped,transition_serial:state.transition_serial,motion:state.motion,provider_use_count:0,
      teacher_mode:state.teacher_mode,teacher_thread_id:state.teacher_thread_id,teacher_persona_selected:state.teacher_persona_selected,
      teacher_message_sent:state.teacher_message_sent,teacher_available_after_tour:state.teacher_available_after_tour,teacher_answer_id:state.teacher_answer_id,teacher_response_message_id:state.teacher_response_message_id,teacher_copy_mode:state.teacher_copy_mode,
      active_widget_id:state.active_widget_id,demo_name:state.demo_name,eli5_enabled:state.eli5_enabled,panel_demo_target_id:state.panel_demo_target_id,panel_demo_pair_ids:clone(state.panel_demo_pair_ids),panel_demo_complete:state.panel_demo_complete,usage_menu_verified:state.usage_menu_verified,usage_card_demo_complete:state.usage_card_demo_complete,owner_route_pending:ownerRoutePending,
      planning_choice_arg:state.planning_choice_arg,planning_choice_label:state.planning_choice_label,history_depth:history.length,reduced_motion:reduced,low_resource_profile:state.low_resource_profile,shell_squeezed:state.shell_squeezed,
      source:state.source,theme:currentTheme(),timings:clone(timings),storyboard_revision:STORYBOARD.revision,story_order:STORYBOARD.order.slice(),layout_snapshot_captured:!!original,journal_depth:journal.length,
      demonstrated_action_ids:effectReceipts.filter(function(row){return row.mode==='watch';}).map(function(row){return row.action_id;}),
      completed_action_ids:effectReceipts.filter(function(row){return row.status==='applied'||row.status==='no_change';}).map(function(row){return row.action_id;}),
      effect_receipts:clone(effectReceipts),ui_action_log:clone(uiActionLog),target:targetAdapter.status(state.step,state.phase)};
  }
  function notify(){var value=snapshot();listeners.slice().forEach(function(fn){try{fn(value);}catch(error){}});}
  function recordUi(id,payload){var row={action_id:id,step:state.step,phase:state.phase,serial:uiActionLog.length+1,payload:clone(payload||{})};uiActionLog.push(row);return row;}
  function receipt(actionId,targetId,status,reason,before,after,owner,mode,metadata){
    var row={schema_id:'pm.guided_tour.concept_effect_receipt.v1',receipt_id:'guided-tour-effect-'+(++receiptSerial),action_id:actionId,
      step:state.step,phase:state.phase,target_id:targetId||null,status:status,reason:reason||null,before:clone(before),after:clone(after),
      owner_receipt:clone(owner||null),mode:mode||'try',concept_simulation_only:true,production_receipt:false};
    if(metadata)row.local_action_result=clone(metadata);
    effectReceipts.push(row);state.last_result=clone(row);state.last_error=status==='failed'||status==='disabled'?reason||status:null;notify();return row;
  }
  function ack(control,id){state.last_action=id;if(control){control.setAttribute('data-ack','true');control.dataset.ackFrame='same';}root.dataset.ack=id;root.dataset.ackFrame='same';notify();}
  function clearTransition(){if(transitionTimer){clearTimeout(transitionTimer);transitionTimer=0;}root.dataset.motion='idle';state.motion='idle';}
  function phaseKey(step,phase){var rows=PHASES[step]||[];return rows[Math.max(0,Math.min(rows.length-1,Number(phase)||0))]||'unknown';}
  function asyncToken(){return {session:sessionSerial,transition:state.transition_serial,step:state.step,phase:state.phase,phase_key:state.phase_key,thread:state.teacher_thread_id};}
  function tokenCurrent(token){return !!token&&state.open&&token.session===sessionSerial&&token.transition===state.transition_serial&&token.step===state.step&&token.phase===state.phase&&token.phase_key===state.phase_key&&token.thread===state.teacher_thread_id;}
  function finishDemoSequence(){var sequence=demoSequence;if(!sequence)return false;sequence.timers.forEach(clearTimeout);sequence.steps.forEach(function(step,index){if(!sequence.ran[index]){sequence.ran[index]=true;try{sequence.results.push(step.run());}catch(error){state.last_error=String(error&&error.message||error);}}});demoSequence=null;state.demo_name=null;root.removeAttribute('data-demo');sequence.done(sequence.results,sequence.token);return true;}
  function cancelDemoSequence(flush){if(!demoSequence)return false;if(flush)return finishDemoSequence();var sequence=demoSequence;sequence.timers.forEach(clearTimeout);demoSequence=null;state.demo_name=null;root.removeAttribute('data-demo');if(typeof sequence.rollback==='function')try{sequence.rollback();}catch(error){state.last_error=String(error&&error.message||error);}return true;}
  function startDemoSequence(name,steps,done,rollback){cancelDemoSequence(false);state.demo_name=name;root.dataset.demo=name;render('forward');var sequence={name:name,steps:steps,done:done,rollback:rollback,token:asyncToken(),ran:steps.map(function(){return false;}),results:[],timers:[]};demoSequence=sequence;if(reduced){finishDemoSequence();return snapshot();}var elapsed=0;steps.forEach(function(step,index){elapsed+=step.delay;sequence.timers.push(setTimeout(function(){if(demoSequence!==sequence||sequence.ran[index]||!tokenCurrent(sequence.token))return;sequence.ran[index]=true;try{sequence.results.push(step.run());}catch(error){state.last_error=String(error&&error.message||error);}scheduleTargetTracking();if(sequence.ran.every(Boolean)){demoSequence=null;state.demo_name=null;root.removeAttribute('data-demo');done(sequence.results,sequence.token);}},elapsed));});return snapshot();}
  function semanticHome(layout){var surfaces=layout&&layout.surfaces||[],mainTotal=surfaces.reduce(function(sum,surface){return sum+(surface.visible&&!surface.collapsed&&surface.host==='home_main'?Number(surface.size&&surface.size.basis_px)||0:0);},0);return surfaces.map(function(surface){var size=surface.size||{},semanticSize=surface.host==='home_main'&&surface.visible&&!surface.collapsed&&mainTotal?{basis_share_ppm:Math.round((Number(size.basis_px)||0)*1000000/mainTotal),cross_basis_px:Number(size.cross_basis_px),flex_weight:Number(size.flex_weight),min_width_px:Number(size.min_width_px),min_height_px:Number(size.min_height_px)}:{basis_px:Number(size.basis_px),cross_basis_px:Number(size.cross_basis_px),flex_weight:Number(size.flex_weight),min_width_px:Number(size.min_width_px),min_height_px:Number(size.min_height_px)};return {id:surface.surface_instance_id,host:surface.host,slot_index:surface.slot_index,visible:surface.visible,collapsed:surface.collapsed,
      last_docked_host:surface.last_docked_host,last_docked_slot_index:surface.last_docked_slot_index,
      size:semanticSize,
      floating_bounds:surface.host==='floating'?clone(surface.floating_bounds):null};}).sort(function(a,b){return a.id.localeCompare(b.id);});}
  function widgetLayout(api,id){var card=document.querySelector('#pm7uBoard .pm7u-card[data-widget="'+id+'"]');if(card)return {cols:Number(card.getAttribute('data-cols')),rows:Number(card.getAttribute('data-rows'))};var saved=api&&api.state&&api.state.layout&&api.state.layout[(api.state.room||'overview')+':'+id];return saved?{cols:Number(saved.cols),rows:Number(saved.rows)}:null;}
  function semanticUsage(){var api=window.PM7_USAGE;if(!api)return null;var ids=[];try{ids=api.visibleWidgets().map(function(item){return item.id;});}catch(error){}
    var layouts={};ids.forEach(function(id){try{layouts[id]=widgetLayout(api,id);}catch(error){}});
    return {room:api.state&&api.state.room||null,visible_widget_ids:ids,layouts:layouts};}
  function layoutNow(){var home=window.PM_HOME_WORKSPACE;return {home:home?semanticHome(home.layout):null,usage:semanticUsage()};}
  function rememberOutsideFocus(event){var node=event&&event.target&&event.target.closest?event.target.closest('button,a,input,textarea,select,[tabindex]:not([tabindex="-1"])'):null;if(!node||root.contains(node))return;lastOutsideFocus=node;lastOutsideFocusAt=Date.now();}
  document.addEventListener('pointerdown',rememberOutsideFocus,true);document.addEventListener('click',rememberOutsideFocus,true);
  function captureOriginal(preferredFocus){
    var tab=document.querySelector('.page-tab.active[data-page]'),eli5=document.querySelector('#chatPanel .toggle-eli5,#floatingChat .toggle-eli5'),persona=document.querySelector('#chatPanel .persona-label,#floatingChat .persona-label'),chatInput=document.querySelector('#chatPanel .pm6-chat-input,#floatingChat .pm6-chat-input'),active=document.activeElement,focusNode=preferredFocus||(active&&active!==document.body&&active!==document.documentElement&&active!==root?active:(lastOutsideFocus&&Date.now()-lastOutsideFocusAt<1200?lastOutsideFocus:null));
    original={semantic:layoutNow(),home_layout:window.PM_HOME_WORKSPACE?clone(window.PM_HOME_WORKSPACE.layout):null,
      page:window.PM_PAGES&&window.PM_PAGES.current||tab&&tab.getAttribute('data-page')||'dashboard',eli5_active:!!(eli5&&eli5.classList.contains('active')),
      chat_thread:window.PM_DEMO&&window.PM_DEMO.state&&window.PM_DEMO.state.chat&&window.PM_DEMO.state.chat.activeThread||null,
      persona:persona&&persona.textContent.trim()||'Product Manager',chat_placeholder:chatInput&&chatInput.getAttribute('placeholder')||'',chat_draft:chatInput&&chatInput.value||'',chat_selection_start:chatInput&&Number.isFinite(chatInput.selectionStart)?chatInput.selectionStart:null,chat_selection_end:chatInput&&Number.isFinite(chatInput.selectionEnd)?chatInput.selectionEnd:null,
      focus_node:focusNode&&focusNode!==document.body?focusNode:null,focus_id:focusNode&&focusNode.id||null,focus_od_id:focusNode&&focusNode.getAttribute&&focusNode.getAttribute('data-od-id')||null,focus_ui_action_id:focusNode&&focusNode.getAttribute&&focusNode.getAttribute('data-ui-action-id')||null,focus_command_id:focusNode&&focusNode.getAttribute&&focusNode.getAttribute('data-command-id')||null,
      document_scroll_left:Number(window.scrollX)||0,document_scroll_top:Number(window.scrollY||(document.scrollingElement&&document.scrollingElement.scrollTop))||0};
    return clone(original.semantic);
  }
  function restoreDocumentScroll(){var left=original?Number(original.document_scroll_left)||0:0,top=original?Number(original.document_scroll_top)||0:0;try{window.scrollTo(left,top);}catch(error){}if(document.scrollingElement){document.scrollingElement.scrollLeft=left;document.scrollingElement.scrollTop=top;}return true;}
  function same(a,b){return JSON.stringify(a)===JSON.stringify(b);}
  function ownerReceipt(api,beforeLength){var rows=api&&api.receipt_log||[];return rows.length>beforeLength?rows[rows.length-1]:null;}
  function homeSurface(id,layout){return (layout&&layout.surfaces||[]).filter(function(surface){return surface.surface_instance_id===id;})[0]||null;}
  function pushUndo(actionId,fn){journal.push({action_id:actionId,undo:fn});}
  function invokeHomeMove(actionId,targetHost,mode){
    var api=window.PM_HOME_WORKSPACE,id='chat',beforeLayout=api&&api.layout,before=homeSurface(id,beforeLayout),receiptCount=api&&api.receipt_log?api.receipt_log.length:0;
    if(!api||!before)return receipt(actionId,'chat','disabled','Chat isn’t available in the workspace right now.',null,null,null,mode);
    var result=actionId==='cmd.panel.undock'?api.popOutPanel(id):api.moveSurface(id,targetHost,{index:0});
    var afterLayout=api.layout,after=homeSurface(id,afterLayout),owner=ownerReceipt(api,receiptCount);
    var ok=!!(result&&result.ok!==false&&after&&after.host===targetHost),status=ok?(result.no_change?'no_change':'applied'):'failed';
    var reason=ok?null:'Chat couldn’t be moved. Try again.';
    if(ok&&!result.no_change)pushUndo(actionId,function(){var now=homeSurface(id,api.layout);if(!now)return false;var insertion={index:before.slot_index};if(before.host==='floating'&&before.floating_bounds)insertion.bounds=clone(before.floating_bounds);var restored=api.moveSurface(id,before.host,insertion);if(before.collapsed!==homeSurface(id,api.layout).collapsed)api.setCollapsed(id,before.collapsed);return !!(restored&&restored.ok!==false);});
    return receipt(actionId,'chat',status,reason,{host:before.host,slot_index:before.slot_index},{host:after&&after.host,slot_index:after&&after.slot_index},owner,mode);
  }
  function surfaceCheckpoint(id){var api=window.PM_HOME_WORKSPACE,row=api&&homeSurface(id,api.layout);return row?clone(row):null;}
  function restoreSurfaceCheckpoint(id,checkpoint){var api=window.PM_HOME_WORKSPACE;if(!api||!checkpoint)return false;var now=homeSurface(id,api.layout);if(!now)return false;if(!now.visible&&checkpoint.visible)api.setSurfaceVisible(id,true,'cmd.panel.switch');var insertion={index:checkpoint.slot_index};if(checkpoint.floating_bounds)insertion.bounds=clone(checkpoint.floating_bounds);var moved=api.moveSurface(id,checkpoint.host,insertion);now=homeSurface(id,api.layout);if(now&&now.collapsed!==checkpoint.collapsed)api.setCollapsed(id,checkpoint.collapsed);now=homeSurface(id,api.layout);if(now&&now.visible!==checkpoint.visible)api.setSurfaceVisible(id,checkpoint.visible,'cmd.panel.switch');now=homeSurface(id,api.layout);return !!(moved&&moved.ok!==false&&now&&now.host===checkpoint.host&&now.slot_index===checkpoint.slot_index&&now.visible===checkpoint.visible&&now.collapsed===checkpoint.collapsed);}
  function movePanelForDemo(id,targetHost,targetIndex){var api=window.PM_HOME_WORKSPACE,before=surfaceCheckpoint(id),count=api&&api.receipt_log?api.receipt_log.length:0;if(!api||!before)return receipt('cmd.workspace_layout.move_surface',id,'disabled','This panel is not available for the tour.',before,before,null,'watch');if(!before.visible)api.setSurfaceVisible(id,true,'cmd.panel.switch');var result=api.moveSurface(id,targetHost,{index:Number.isFinite(targetIndex)?targetIndex:0}),after=surfaceCheckpoint(id),ok=!!(result&&result.ok!==false&&after&&after.host===targetHost);return receipt('cmd.workspace_layout.move_surface',id,ok?(result.no_change?'no_change':'applied'):'failed',ok?null:'The panel could not move for the demonstration.',before,after,ownerReceipt(api,count),'watch');}
  function panelPairForDemo(){var api=window.PM_HOME_WORKSPACE,all=api&&api.layout&&api.layout.surfaces||[],stored=state.panel_demo_pair_ids;if(stored&&stored.length===2){var exact=stored.map(function(id){return all.find(function(row){return row.surface_instance_id===id;});});if(exact.every(Boolean))return exact;}var rows=all.filter(function(row){return row.surface_instance_id!=='chat'&&row.visible&&row.host==='home_main';}).sort(function(a,b){return a.slot_index-b.slot_index;}),pair=rows.length>=2?rows.slice(0,2):all.filter(function(row){return row.surface_instance_id!=='chat'&&row.surface_kind==='editor_panel';}).slice(0,2);if(pair.length===2){state.panel_demo_pair_ids=pair.map(function(row){return row.surface_instance_id;});state.panel_demo_target_id=pair[1].surface_instance_id;}return pair;}
  function runPanelRoundTrip(){var pair=panelPairForDemo();if(pair.length<2){state.last_error='Two work panels are not available for the rearrangement demonstration.';render('forward');return snapshot();}var first=pair[0],second=pair[1],firstCheckpoint=surfaceCheckpoint(first.surface_instance_id),secondCheckpoint=surfaceCheckpoint(second.surface_instance_id);return startDemoSequence('panel-round-trip',[{delay:120,run:function(){return movePanelForDemo(second.surface_instance_id,firstCheckpoint.host,firstCheckpoint.slot_index);}},{delay:820,run:function(){var before={first:surfaceCheckpoint(first.surface_instance_id),second:surfaceCheckpoint(second.surface_instance_id)},okSecond=restoreSurfaceCheckpoint(second.surface_instance_id,secondCheckpoint),okFirst=restoreSurfaceCheckpoint(first.surface_instance_id,firstCheckpoint),after={first:surfaceCheckpoint(first.surface_instance_id),second:surfaceCheckpoint(second.surface_instance_id)},ok=okFirst&&okSecond;return receipt('cmd.panel.redock',second.surface_instance_id,ok?'applied':'failed',ok?null:'The work panels did not return to their exact starting arrangement.',before,after,null,'watch',{round_trip_restore:true,rearranged_surface_ids:state.panel_demo_pair_ids.slice()});}}],function(results,token){sequenceSummary(results);state.panel_demo_complete=results.every(function(row){return row&&row.status!=='failed'&&row.status!=='disabled';});if(tokenCurrent(token))transitionTo(0,2,'forward',true);},function(){restoreSurfaceCheckpoint(second.surface_instance_id,secondCheckpoint);restoreSurfaceCheckpoint(first.surface_instance_id,firstCheckpoint);});}
  function usageCard(){
    var selector=state.active_widget_id?'#pm7uBoard .pm7u-card[data-widget="'+state.active_widget_id+'"]':null,card=selector?document.querySelector(selector):null;
    if(state.active_widget_id)return card;
    card=document.querySelector('#pm7uBoard .pm7u-card');if(card)state.active_widget_id=card.getAttribute('data-widget');
    return card;
  }
  function usagePopupFor(id){var pop=document.getElementById('pm7uCardPop'),row=pop&&pop.querySelector('[data-hide-card="'+id+'"]'),rect=pop&&pop.getBoundingClientRect();return pop&&row&&rect&&rect.width>0&&rect.height>0?pop:null;}
  function closeUsagePopover(){var pop=document.getElementById('pm7uCardPop'),rect=pop&&pop.getBoundingClientRect();if(!pop||!rect||rect.width<=0||rect.height<=0)return true;var card=usageCard(),menu=card&&card.querySelector('.pm7u-cardmenu');if(menu)menu.click();return true;}
  function usageCardCheckpoint(id){var api=window.PM7_USAGE,item=api&&api.widgetById&&api.widgetById(id),layout=item&&api.layoutFor?clone(api.layoutFor(item)):null,key=api&&api.state?(api.state.room+':'+id):null;return api&&item?{id:id,room:api.state.room,visible:!api.state.hidden[key],layout:layout}:null;}
  function openUsageCardMenu(id){var card=document.querySelector('#pm7uBoard .pm7u-card[data-widget="'+id+'"]'),menu=card&&card.querySelector('.pm7u-cardmenu');if(!menu)return false;if(!usagePopupFor(id))menu.click();return !!usagePopupFor(id);}
  function setUsageVisibilityThroughMountedControl(id,visible){var api=window.PM7_USAGE,key=api&&api.state&&(api.state.room+':'+id),isVisible=!!(api&&!api.state.hidden[key]);if(!api||isVisible===visible)return !!api&&isVisible===visible;if(!visible){if(!openUsageCardMenu(id))return false;var hide=document.querySelector('#pm7uCardPop [data-hide-card="'+id+'"]');if(!hide)return false;hide.click();return !!api.state.hidden[key]&&!document.querySelector('#pm7uBoard .pm7u-card[data-widget="'+id+'"]');}var chooser=document.getElementById('pm7uCustomize');if(!chooser)return false;chooser.click();var show=document.querySelector('#pm7uCustomizePop [data-toggle-widget="'+id+'"]');if(!show)return false;show.click();var restored=!api.state.hidden[key]&&!!document.querySelector('#pm7uBoard .pm7u-card[data-widget="'+id+'"]');if(document.querySelector('#pm7uCustomizePop.open'))chooser.click();return restored;}
  function resizeUsageThroughMountedControl(id){var api=window.PM7_USAGE,item=api&&api.widgetById&&api.widgetById(id),before=item&&api.layoutFor?clone(api.layoutFor(item)):null,count=api&&api.receipt_log?api.receipt_log.length:0;if(!api||!item||!before||!openUsageCardMenu(id))return receipt('cmd.widget.resize',id,'disabled','This Usage card cannot be resized in the tour right now.',before,before,null,'watch');var choices=[].slice.call(document.querySelectorAll('#pm7uCardPop [data-card-size]')),choice=choices.find(function(row){return row.getAttribute('data-card-size')!==before.cols+'x'+before.rows;});if(!choice)return receipt('cmd.widget.resize',id,'disabled','This card has no other useful size to demonstrate.',before,before,null,'watch');choice.click();var after=clone(api.layoutFor(item)),ok=!same(before,after);return receipt('cmd.widget.resize',id,ok?'applied':'failed',ok?null:'The card size did not change.',before,after,ownerReceipt(api,count),'watch',{mounted_control:'card_size_option'});}
  function restoreUsageCardCheckpoint(checkpoint){var api=window.PM7_USAGE,item=api&&checkpoint&&api.widgetById&&api.widgetById(checkpoint.id);if(!api||!item||!checkpoint)return false;var visibleOk=setUsageVisibilityThroughMountedControl(checkpoint.id,checkpoint.visible),now=api.layoutFor(item);if(checkpoint.layout&&!same(checkpoint.layout,now)){api.setLayout(item,checkpoint.layout.cols,checkpoint.layout.rows,'cmd.widget.resize','guided_tour_restore');if(api.rerender)api.rerender();}now=api.layoutFor(item);return visibleOk&&same(checkpoint.layout,now);}
  function runUsageCardFilm(){var card=usageCard(),id=card&&card.getAttribute('data-widget'),checkpoint=id&&usageCardCheckpoint(id),api=window.PM7_USAGE;if(!checkpoint||!api){state.last_error='A Usage card is not available for this demonstration.';render('forward');return snapshot();}closeUsagePopover();return startDemoSequence('usage-card-film',[{delay:120,run:function(){return resizeUsageThroughMountedControl(id);}},{delay:700,run:function(){var before=usageCardCheckpoint(id),count=api.receipt_log&&api.receipt_log.length||0,ok=setUsageVisibilityThroughMountedControl(id,false),after=usageCardCheckpoint(id);return receipt('cmd.widget.remove',id,ok?'applied':'failed',ok?null:'The card did not hide through its real menu.',before,after,ownerReceipt(api,count),'watch',{mounted_control:'remove_panel'});}},{delay:650,run:function(){var before=usageCardCheckpoint(id),count=api.receipt_log&&api.receipt_log.length||0,ok=setUsageVisibilityThroughMountedControl(id,true),after=usageCardCheckpoint(id);return receipt('cmd.widget.add',id,ok?'applied':'failed',ok?null:'The card did not return through the panel chooser.',before,after,ownerReceipt(api,count),'watch',{mounted_control:'panel_chooser'});}},{delay:700,run:function(){var before=usageCardCheckpoint(id),ok=restoreUsageCardCheckpoint(checkpoint),after=usageCardCheckpoint(id);return receipt('cmd.widget.resize',id,ok?'applied':'failed',ok?null:'The card did not return to its original size and visibility.',before,after,null,'watch',{round_trip_restore:true});}}],function(results,token){sequenceSummary(results);state.usage_card_demo_complete=results.every(function(row){return row&&row.status!=='failed'&&row.status!=='disabled';});if(tokenCurrent(token))transitionTo(0,6,'forward',true);},function(){restoreUsageCardCheckpoint(checkpoint);});}
  function localRouteResult(page,status,reason,before,after){return {schema_id:'pm.guided_tour.focus_route_result.v1',schema_version:'1.0.0',action_id:'ui.guided_tour.focus_route',tour_session_id:'guided-tour:concept:'+Math.max(1,sessionSerial),route_target:{page_id:page},status:status,before_page_id:before||null,after_page_id:after||null,error_code:status==='applied'?null:(status==='disabled'?'page_router_unavailable':'route_not_activated'),reason:reason||null,domain_mutation:false,persistence_write:false,return_focus_id:'guided_tour.usage.heading',result_revision:receiptSerial+1};}
  function routePage(page,mode){var before=window.PM_PAGES&&window.PM_PAGES.current,reason;if(!page){reason='No page was selected.';var missing=localRouteResult('missing','disabled',reason,before,before);missing.error_code='route_target_missing';return receipt('ui.guided_tour.focus_route',null,'disabled',reason,before,before,null,mode,missing);}if(!window.PM_PAGES||typeof window.PM_PAGES.go!=='function'){reason='Pages aren’t available right now.';return receipt('ui.guided_tour.focus_route',page,'disabled',reason,before,before,null,mode,localRouteResult(page,'disabled',reason,before,before));}window.PM_PAGES.go(page);var after=window.PM_PAGES.current,panel=document.querySelector('.primary-content > .page.page-'+page),ok=!!(panel&&panel.classList.contains('active'));reason=ok?null:'The '+page+' page didn’t open.';return receipt('ui.guided_tour.focus_route',page,ok?'applied':'failed',reason,before,after,null,mode,localRouteResult(page,ok?'applied':'failed',reason,before,after));}
  function hideChatForOpening(){var api=window.PM_HOME_WORKSPACE,chat=api&&homeSurface('chat',api.layout);if(!api||!chat||!chat.visible)return true;var beforeCount=api.receipt_log&&api.receipt_log.length||0,result=api.setSurfaceVisible('chat',false,'cmd.panel.switch'),ok=!!(result&&result.ok!==false);if(ok)pushUndo('cmd.panel.switch',function(){var restored=api.setSurfaceVisible('chat',true,'cmd.panel.switch');return !!(restored&&restored.ok!==false);});receipt('cmd.panel.switch','chat',ok?'applied':'failed',ok?null:'Assistant Chat could not make room for the opening scenes.',{visible:true},{visible:!ok},ownerReceipt(api,beforeCount),'watch');return ok;}
  function openChat(){
    var api=window.PM_HOME_WORKSPACE,before=api&&api.layout,chat=homeSurface('chat',before),receiptCount=api&&api.receipt_log?api.receipt_log.length:0;
    if(api&&chat&&!chat.visible){var result=api.setSurfaceVisible('chat',true,'cmd.panel.switch');if(result&&result.ok!==false)pushUndo('cmd.panel.switch',function(){return api.setSurfaceVisible('chat',false,'cmd.panel.switch').ok!==false;});receipt('cmd.panel.switch','chat',result&&result.ok!==false?'applied':'failed',result&&result.ok===false?'Chat couldn’t be opened for the tour.':null,{visible:false},{visible:homeSurface('chat',api.layout).visible},ownerReceipt(api,receiptCount),'watch');}
    chat=api&&homeSurface('chat',api.layout);if(chat&&chat.host!=='dock_right')invokeHomeMove('cmd.panel.redock','dock_right','watch');
    var element=document.getElementById('chatPanel');if(element){element.classList.remove('hidden');var focusTarget=element.querySelector('textarea,.chat-input-area [tabindex],button,[tabindex]')||element;try{focusTarget.focus({preventScroll:true});}catch(error){try{focusTarget.focus();}catch(ignored){}}}
    return !!element;
  }
  function selectedPlanningIntent(){return document.querySelector('#panel-wizard .pm6-wiz-intent-chip.sel');}
  function currentPlanningStage(){var stage=document.querySelector('#panel-wizard .pm6-wiz-stage.active[data-wiz-stage]');return stage&&stage.getAttribute('data-wiz-stage')||'intake';}
  function capturePlanningIntent(){if(state.planning_original_intent!==null)return state.planning_original_intent;var selected=selectedPlanningIntent();state.planning_original_intent=selected?selected.getAttribute('data-demo-arg')||'':'';return state.planning_original_intent;}
  function restorePlanningIntent(){if(state.planning_original_intent===null)return true;var selector='#panel-wizard .pm6-wiz-intent-chip[data-demo-arg="'+state.planning_original_intent+'"]',target=state.planning_original_intent?document.querySelector(selector):null,current=selectedPlanningIntent();if(target&&target!==current){restoringPlanning=true;target.click();restoringPlanning=false;}return !target||target.classList.contains('sel');}
  function planningTarget(){return document.querySelector('#panel-wizard .pm6-wiz-intent-chip:not(.sel)')||document.querySelector('#panel-wizard .pm6-wiz-intent-chip');}
  function restorePlanningStage(){if(!state.planning_original_stage||!window.PM_PAGES||typeof window.PM_PAGES.go!=='function')return true;window.PM_PAGES.go('wizard',state.planning_original_stage);return currentPlanningStage()===state.planning_original_stage;}
  function updatePlanningWatchBeat(target){state.planning_scan_target=target;stage.innerHTML=stepMarkup();var clip=stage.parentElement;if(clip)clip.scrollTop=0;syncFooterAction();activeTarget=targetAdapter.resolve('planning_wizard',0);positionTarget(activeTarget);scheduleTargetTracking();notify();return {status:'no_change',action_id:'ui.guided_tour.next',watch_target:target};}
  function runPlanningScan(){state.planning_scan_target='attach';return startDemoSequence('planning-scan',[{delay:80,run:function(){return updatePlanningWatchBeat('attach');}},{delay:800,run:function(){return updatePlanningWatchBeat('intent');}},{delay:800,run:function(){return updatePlanningWatchBeat('continue');}},{delay:800,run:function(){return {status:'no_change',action_id:'ui.guided_tour.next',watch_target:'complete'};}}],function(results,token){sequenceSummary(results);if(tokenCurrent(token))transitionTo(1,1,'forward',true);},function(){state.planning_scan_target='attach';});}
  function chatStream(){return document.querySelector('#chatPanel .messageStream,#chatPanel .pm6-chat-stream,#chatPanel .message-stream');}
  function removeTeacherCard(){var card=document.getElementById('pm7gt-teacher-card');if(card)card.remove();}
  function setTeacherInputPlaceholder(){document.querySelectorAll('#chatPanel .pm6-chat-input,#floatingChat .pm6-chat-input').forEach(function(input){input.setAttribute('placeholder','Ask Teacher anything about Puppet Master…');});}
  function syncEli5(){var toggle=document.querySelector('#chatPanel .toggle-eli5,#floatingChat .toggle-eli5'),active=!!(toggle&&toggle.classList.contains('active'));if(toggle&&active!==state.eli5_enabled)toggle.click();eli5Button.setAttribute('aria-pressed',String(state.eli5_enabled));eli5Button.textContent=state.eli5_enabled?'ELI5: On':'ELI5: Off';eli5Button.setAttribute('data-pm-hover-label',state.eli5_enabled?'Turn ELI5 off':'Turn ELI5 on');eli5Button.setAttribute('data-pm-hover-detail','Keep the same idea, using shorter words and an everyday comparison.');}
  function toggleEli5(){state.eli5_enabled=!state.eli5_enabled;state.teacher_copy_mode=state.eli5_enabled?'eli5':'normal';recordUi('ui.guided_tour.toggle_eli5',{enabled:state.eli5_enabled});syncEli5();state.last_result={status:'applied',enabled:state.eli5_enabled,applies_to:'tour_copy_and_next_teacher_reply'};state.last_error=null;render('forward');return clone(state.last_result);}
  function teacherTopic(id,priority,test,normal,eli5){return {id:id,priority:priority,test:test,normal:normal,eli5:eli5};}
  var TEACHER_ANSWERS=[
    teacherTopic('app_map',90,/main parts|parts of puppet master|workspace map|what am i looking at/i,'Puppet Master is organized into page navigation, a working area, movable panels, and Assistant Chat. Pages change the job you are viewing; panels change which tools stay beside it. Start by locating the page tabs, then keep only the panels you need.','Think of Puppet Master as a workshop with labeled rooms and movable tool carts. Tabs choose a room, and panels bring a cart beside you. Start by finding the tabs at the top.'),
    teacherTopic('page_navigation',100,/move between pages|page navigation|page tabs|open (the )?(usage|planning|settings) page/i,'Page tabs change the primary view without changing project data. The active tab identifies the page you are on, while panels can remain available beside it. Select Usage or Planning once and watch the active tab move.','Tabs are doors to different rooms. Opening another door changes what you see, not your saved work. Try the Usage tab once.'),
    teacherTopic('panel_move',110,/rearrange panels|move a panel|drag.*panel|panel.*grip/i,'A panel is a workspace surface whose host and order can change independently of its contents. Use its top-right move grip to dock it elsewhere; moving the panel does not move or delete project files. Make one move, then use Back if you prefer the old arrangement.','A panel is a tool tray you can slide around your desk. The little corner grip moves the tray, not the things inside it. Try one move and use Back to put it back.'),
    teacherTopic('panel_resize',110,/resize a panel|panel size|make.*panel (bigger|smaller)/i,'Panel dividers change the space assigned to adjacent surfaces; a floating panel also has a corner resize control. Resizing affects presentation only. Drag a divider a short distance and stop when both sides remain readable.','A divider is like the edge between two desk trays. Slide it a little to give one tray more room. Your work stays the same.'),
    teacherTopic('panel_restore',110,/restore.*layout|reset.*layout|put.*panels? back|old arrangement/i,'Layout restore returns panels to a known arrangement without changing project content. Use the workspace reset action for a full reset, or Back during this tour for its reversible demonstration. Save a custom layout only after it feels comfortable.','Layout restore puts the furniture back where it started. It does not throw away anything on the desk. Use Back in this tour or Reset Layout later.'),
    teacherTopic('panel_definition',70,/what is a panel|panels? do/i,'A panel is a dockable view such as Chat, an editor, or a dashboard. Its placement, size, visibility, and collapsed state are workspace settings separate from project data. Open one useful panel first and add others only when needed.','A panel is a movable window tile. Sliding or hiding the tile changes the desk, not the work inside it. Keep one helpful tile open first.'),
    teacherTopic('usage',100,/what does usage show|usage page|usage dashboard|activity.*limits.*cost/i,'Usage consolidates activity, capacity, limits, and cost signals into cards. Each card is a view of owner data, so hiding or moving it does not erase the underlying records. Open one card menu to see presentation choices.','Usage is the dashboard of gauges. Moving or hiding a gauge does not change the machine. Open one card menu to see your choices.'),
    teacherTopic('cards',80,/what is a card|usage card|hide a card|card options/i,'A card is a configurable view of one category of information. Its options can change presentation or visibility without changing the work it reports. Keep the cards you check often and hide only the views you do not need.','A card is a note that shows one kind of news. Putting the note away does not erase the news. Keep the notes you read most.'),
    teacherTopic('costs_limits',100,/costs?|spending|limits?|quota|tokens? used/i,'Cost and limit cards summarize measured usage from the named service or account. Treat them as status signals, then check that source before making a billing decision. Start with the time range and account shown on the card.','These cards are fuel gauges. Check which trip and which car the gauge describes before worrying about the number. Start with the card’s time range.'),
    teacherTopic('open_local_folder',110,/open a (local )?folder|folder on this (computer|machine)|local folder/i,'Opening a local folder points a project at an existing directory on this device. It does not require an online host, although source control can be added separately. Choose a folder you recognize and confirm its path before continuing.','This lets Puppet Master work with a folder already on this computer. It is like opening a labeled drawer. Pick a drawer you recognize first.'),
    teacherTopic('bring_online',110,/bring.*from online|clone.*online|online repository|git url/i,'An online project is normally brought in by cloning a Git URL or selecting a repository through a connected host account. The result is still a local working copy with an optional remote. Confirm the repository and destination before cloning.','This copies an online project into a working folder here. It is like checking out a library book while the library keeps its copy. Check the title and destination first.'),
    teacherTopic('cursor_origin',120,/cursor origin|origin host|origin repository/i,'Cursor Origin is an online Git host. It can hold a private or team-visible repository and work beside local Git or Jujutsu history. Connect an eligible Cursor account, choose the team or codebase, then verify the repository before the first push.','Cursor Origin is an online home for another copy of your project. Your save points still live here too. Connect the right Cursor team, check the project name, and then send the copy.'),
    teacherTopic('already_connected_source',120,/already connected.*source|source control.*already connected|already connected.*git/i,'Already Connected should mean the project already has a usable source-control remote and credentials outside this step. The setup must verify that remote instead of silently doing nothing. Check the detected remote name and a read-only connection result before continuing.','This means the project already knows where its online copy lives. Puppet Master should check the address instead of asking you to connect twice. Look for a successful check.'),
    teacherTopic('project',60,/what is a project|new project|project keeps/i,'A project groups one goal, its working files, configuration, recoverable versions, and approved work. Storage location and online source control are separate choices. Start with one clearly named project and verify its folder.','A project is one labeled box for an idea. Its pieces and save points stay together. Start with one box whose name you recognize.'),
    teacherTopic('requirements',105,/requirements?|why.*questions|planning.*ask/i,'Requirements record the result, constraints, exclusions, and decisions that a plan must respect. Planning asks only what it cannot safely infer, then carries those answers into review. Answer with the outcome you need and say when something must not change.','Requirements are the rules for the recipe. Say what the meal should be and what ingredients cannot be used. Answer one clear question at a time.'),
    teacherTopic('review_approval',105,/when.*work begin|review.*approve|approval|approve.*build/i,'Planning is preparatory until you approve the resulting plan or build action. Review scope, risky changes, and unresolved questions before approval. If a step is unclear, ask Teacher or revise the requirement first.','Nothing should start just because you answered questions. You get to read the recipe before cooking begins. Stop and ask about any step that feels wrong.'),
    teacherTopic('planning',80,/what does planning do|planning wizard|make a plan|planning/i,'Planning converts a goal and its constraints into reviewable work units while keeping unresolved decisions visible. It should use the chosen project context and never treat a first draft as approval. Begin with the outcome, then review every consequential step.','Planning turns a wish into a recipe you can check. It asks small questions and waits for your yes before cooking. Start with one clear wish.'),
    teacherTopic('source_control',75,/source control|what is git\b|what is jujutsu/i,'Source control records a structured history of file changes. Git or Jujutsu can maintain that history locally; an online host is optional for sharing or another copy. Start locally and add a remote only when it serves a clear purpose.','Source control is a labeled photo album of your changes. Git or Jujutsu arranges the album here, and an online site can keep another copy. Begin with the local album.'),
    teacherTopic('safe_history',115,/safe history|restore point|save point|undo changes/i,'Safe History creates recoverable versions on this computer. Git or Jujutsu can organize that local timeline; GitHub or GitLab can hold an optional online copy, while FileSafe protects selected file copies beside it. Keep local history enabled before adding optional sharing.','Safe History is a stack of save points kept on this computer. An online host may keep another stack, and FileSafe is a spare copy of important papers. Start with the local save points.'),
    teacherTopic('filesafe',115,/filesafe|file safe|protect.*files/i,'FileSafe protects selected file copies and complements recoverable history; it does not replace Safe History, Git, or Jujutsu. Confirm its destination and retention settings before relying on it. Use both protections when the files matter.','FileSafe is a spare folder of important papers. Safe History is the row of moments you can return to. Check where the spare folder lives.'),
    teacherTopic('github',115,/github account|sign in.*github|github.*sign in|use github/i,'GitHub is an optional online Git host. An account is needed for private repositories and authenticated account features, while public repositories may be readable without signing in. Connect it only if you want its hosting or collaboration features.','GitHub is an optional online library for Git projects. You need a library card for private shelves and account tools. Use it only if you want that library.'),
    teacherTopic('gitlab',115,/gitlab account|sign in.*gitlab|gitlab.*sign in|use gitlab/i,'GitLab is an optional Git host and may be cloud-hosted or self-managed. Account and authentication requirements come from the selected GitLab instance and repository access. Verify the instance address before signing in.','GitLab is another kind of online Git library, and some people run their own. Check which library address you are using before getting a key.'),
    teacherTopic('ssh_folder',120,/folder.*ssh|ssh.*folder|remote over ssh|ssh workflow/i,'An SSH-backed project works on a reachable remote machine rather than an SMB or NFS share. It requires a host, user, and approved authentication method, while the project path belongs to that remote host. Test a read-only connection before selecting the path.','SSH is a secure hallway to a folder on another computer. You need the computer address, your name there, and a safe key. Test the hallway before choosing the folder.'),
    teacherTopic('network_share',115,/smb|nfs|network share|shared folder/i,'SMB and NFS expose a remote folder through the operating system. Puppet Master should use the mounted path after the OS or VPN establishes access; it should not pretend that a path alone creates the connection. Confirm the share is mounted and readable first.','A network share is a drawer from another computer that your system makes look local. Connect the drawer first, then choose it like any other folder.'),
    teacherTopic('backup_location',110,/backup location|choose.*backup|where.*backup|advanced.*backup/i,'A backup destination and a project path are both locations, but they have different write, retention, and recovery requirements. A backup target should be separate enough to survive loss of the working copy. Verify free space and perform a restore test.','Your work folder is the desk; the backup should be a spare copy somewhere safer. Do not keep the only spare in the same drawer. Test that you can bring one file back.'),
    teacherTopic('connect_existing',120,/connect.*existing puppet|already have.*puppet master|existing server|another computer.*puppet/i,'Connecting to an existing Puppet Master should discover or accept that server’s reachable address, then authenticate this device with a pairing code or approved credential. It should not make you create another project or server. Start with local discovery when both devices are on the same reachable network.','You are visiting a clubhouse that already exists, not building a new one. Find the clubhouse, then use its invitation code to prove this device belongs.'),
    teacherTopic('local_discovery',125,/local discovery|find.*nearby|discover.*device|find.*server/i,'Local discovery advertises reachable Puppet Master instances on the current local network. It should present verified candidates and still require pairing; discovery is not authentication. Make sure both devices share the same reachable network and try again.','Discovery is calling out in the same building to find the clubhouse. Hearing an answer does not unlock the door. You still use an invitation code.'),
    teacherTopic('vpn',125,/local or vpn|through.*vpn|vpn.*discover|use.*vpn/i,'A VPN can make remote devices reachable through private network addresses, so discovery may behave like local discovery when multicast or the product’s discovery mechanism crosses that VPN. The VPN itself must already be connected. Enable it first, then discover or enter the server’s private name.','A VPN is a private hallway that can make far-away devices feel nearby. Open the hallway first, then look for the server. The hallway is not the invitation code.'),
    teacherTopic('tailscale',130,/tailscale/i,'Puppet Master includes its own Tailscale connection and never borrows or controls a Tailscale app already installed on this computer. After you sign in, it creates the Server’s private address automatically. The Puppet Master app can use this built-in path; a regular web browser still needs its device to reach that private network, or a separate path such as Reverse Proxy, Funnel, or Remote Link. Puppet Master pairing is still required.','Puppet Master carries its own pass for a private Tailscale road. It does not borrow another Tailscale app. The Puppet Master app can use that road; a normal web browser needs its device on the same road or needs another safe road. You still use Puppet Master’s invitation at the door.'),
    teacherTopic('headscale',130,/headscale/i,'Headscale is the sign-in service for a private network you or your organization runs. Give Puppet Master its protected Headscale address and approve enrollment; Puppet Master then creates its own private Server address automatically. Headscale supports the private path but not public Funnel access, and Puppet Master pairing remains a separate safety step.','Headscale is your own guest-list desk for the private road. Tell Puppet Master where that desk lives and approve its pass. It gets a private address, but not a public Funnel entrance. You still use Puppet Master’s invitation at the door.'),
    teacherTopic('reverse_proxy',130,/reverse proxy|custom address|caddy|traefik/i,'A reverse proxy gives an existing Puppet Master a stable HTTPS URL and forwards requests to it. A client connecting to an already configured server usually needs only that URL and Puppet Master pairing; proxy setup belongs on the server side. Label this option Reverse Proxy and ask for server configuration only when creating it.','A reverse proxy is a front desk with one public address. Visitors need the front-desk address and an invitation; they do not rebuild the desk on every device.'),
    teacherTopic('remote_link',130,/remote link|connection code|short code|qr code/i,'Remote Link should provide a product-managed path to an existing server using a short-lived connection code or QR code, followed by device approval. The server should display that information in its connection or device settings. Treat the code as temporary and do not post it publicly.','Remote Link is a temporary invitation card. Show or scan the card on the new device, approve it on the server, and keep the card private.'),
    teacherTopic('pairing',125,/pairing|pair.*device|where.*code|qr code|short code/i,'Pairing authenticates a new device after network reachability is established. The existing Puppet Master should show a short-lived code or QR in its device or connection settings, and the server owner should approve the request. A network address is not a substitute for pairing.','Finding the house is not the same as getting a key. Pairing uses a temporary invitation from the existing server. Approve only devices you recognize.'),
    teacherTopic('tls_certificates',125,/https certificate|tls|let'?s encrypt|certificate.*caddy|certificate.*traefik/i,'Caddy and Traefik can both obtain and renew ACME certificates, commonly from Let’s Encrypt, when DNS, ports, and configuration allow it. Certificate automation belongs to the reverse proxy on the server, not the connecting client. Verify renewal status before relying on the public URL.','HTTPS certificates are identity cards for the front desk. Caddy or Traefik can often renew them automatically. The server handles that card; a visiting device does not.'),
    teacherTopic('permissions',105,/permission|approve.*access|what.*allow/i,'Permissions limit what a person, device, or automation may read or change. Review the requested scope and deny access that is broader than the task requires. Approve one recognizable device or action at a time.','Permissions are keys for particular rooms. Give only the smallest key someone needs. Check the name before saying yes.'),
    teacherTopic('privacy_secrets',120,/password|private key|secret|token|safe to paste|privacy/i,'Do not paste passwords, private keys, recovery codes, access tokens, or unredacted personal data into Chat. Use the product’s credential controls and share only the minimum diagnostic detail. If a secret was exposed, rotate it at its owner immediately.','Secrets are house keys. Never paste a key into a message. Use the locked credential box, and replace any key that was shown by mistake.'),
    teacherTopic('runs_queue',100,/runs?|queue|queued|job status|what is running/i,'A run is one tracked execution; the queue orders work waiting for available capacity, and status shows its current lifecycle state. Opening a run should expose its inputs, progress, receipts, and any blocker. Inspect the oldest blocked or failed item first.','A run is one trip, and the queue is the line of trips waiting to leave. Status says waiting, moving, done, or stuck. Check the first stuck trip.'),
    teacherTopic('teacher_doctor',115,/teacher or doctor|doctor|getting unstuck|stuck|something.*wrong|error/i,'Teacher explains concepts and safe next actions; Doctor diagnoses product or environment failures. Describe what you expected, what occurred, and the exact visible error without including secrets. Use Teacher for understanding and Doctor for a malfunction.','Teacher explains the map; Doctor checks why the car will not start. Say what you tried and what surprised you. Never include a password.'),
    teacherTopic('settings_accessibility',105,/eli5|reduced motion|replay.*tour|accessibility|settings/i,'Settings controls presentation preferences such as ELI5 wording, reduced motion, and replaying onboarding or the tour. These preferences should change explanation and animation without changing project data. Adjust one preference and confirm the preview feels comfortable.','Settings changes how Puppet Master talks and moves. It does not change your project. Pick calmer motion or simpler words if that helps.'),
    teacherTopic('remote_access',85,/remote access|connect from away|phone.*server|laptop.*server/i,'Remote access combines network reachability with Puppet Master device authentication. Choose one supported path—private network, Tailscale or Headscale, reverse proxy, or Remote Link—then pair the device. Do not configure multiple paths unless you need them.','Remote access is a road to the server plus a key for its door. Choose one road, then pair the device. More roads are not automatically safer.'),
    teacherTopic('server',70,/what does.*server|what is.*server|server do|home base/i,'The Puppet Master server is the computer that keeps the authoritative service available to approved clients. Its network address answers where it is; pairing answers who may enter. Start on an existing always-on device only when you need shared or remote access.','The server is the clubhouse that stays ready. Its address tells you where the clubhouse is, and pairing gives your device a key. Use one clubhouse unless you need another.'),
    teacherTopic('teacher',60,/what can.*teacher|ask teacher|teacher help|explain/i,'Teacher explains Puppet Master features, gives examples, and suggests safe next steps. The tour’s built-in lesson works offline. Choose a suggested question or type a specific Puppet Master question.','Teacher is the guide beside the controls. Ask one clear Puppet Master question and I will explain it with a simple next step.'),
    teacherTopic('getting_started',50,/getting started|where do i start|first thing/i,'Begin by identifying whether you are creating a local project or connecting to an existing Puppet Master. Then confirm the project location, keep local recovery enabled, and add remote services only when needed. Use the setup summary to review each choice.','First decide whether you are making a new workspace or visiting one that already exists. Check the folder and save points, then add online parts only when you need them.'),
    teacherTopic('device_name_address',120,/device name|private address|server address|where.*address/i,'The existing server should display its recognized device name and reachable addresses in connection settings. Which address works depends on the active path: local network, VPN, tailnet, or public reverse proxy. Copy the value from the server instead of guessing it.','The server can have different street addresses for different roads. Open its connection settings and copy the address for the road you are using.'),
    teacherTopic('authentication',100,/authentication|credentials?|sign in|login/i,'Authentication proves an account or device identity after the network path reaches the service. Host sign-in, VPN enrollment, and Puppet Master pairing are separate layers and should be requested only when that layer needs them. Follow the prompt naming the exact owner.','Authentication is showing the right key at the right door. A neighborhood pass, website account, and Puppet Master invitation are different keys. Use only the one the named door asks for.'),
    teacherTopic('setup_summary',95,/review my choices|setup summary|choices update/i,'The setup summary should be derived from current selections and update whenever an earlier answer changes. It must distinguish configured, detected, deferred, and incomplete items. Review any incomplete row before applying setup.','The summary is your shopping list. It should change when you change your mind and mark what is ready or missing. Read the missing rows before continuing.')
  ];
  var TEACHER_FALLBACK={id:'supported_topics',normal:'This practice Teacher can answer more than forty Puppet Master topics across navigation, panels, projects, Planning, history, online copies, storage, Servers, connections, security, runs, and accessibility. Ask one specific product question, such as “How do I rearrange panels?” or “How does local discovery work?” Broader questions can go to the regular Assistant after the tour.',eli5:'This guidebook knows more than forty Puppet Master questions. Ask about moving around, projects, save points, connecting devices, safety, or getting unstuck. Try “How do I rearrange panels?”'};
  function teacherAnswer(text){var matches=TEACHER_ANSWERS.filter(function(item){item.test.lastIndex=0;return item.test.test(text);}).sort(function(a,b){return b.priority-a.priority||a.id.localeCompare(b.id);}),row=matches[0]||TEACHER_FALLBACK,eli5=state.eli5_enabled;return {id:row.id,copy_mode:eli5?'eli5':'normal',html:eli5?row.eli5:row.normal};}
  function completeTeacherTurn(d,threadId,msgId,text,answer,how){var pending=teacherPending,thread=d.state.chat.threads[threadId];if(thread)thread.messages.push({role:'assistant',html:answer.html,stopped:how==='stopped'});d.state.chat.busy=false;d.state.chat.activeStream=null;d.emit('chat.stream',{threadId:threadId,msgId:msgId,type:how==='stopped'?'stopped':'done'});d.emit('chat.state',{busy:false,context:d.state.chat.context,queue:d.state.chat.queue});var current=!!(pending&&pending.session===sessionSerial&&pending.thread===threadId&&pending.message===msgId);if(current){state.teacher_message_sent=how!=='stopped';state.teacher_answer_id=answer.id;state.teacher_response_message_id=msgId;state.teacher_copy_mode=answer.copy_mode;}receipt('ui.guided_tour.next','teacher-message',how!=='stopped'?'applied':'failed',how!=='stopped'?null:'Teacher’s reply was stopped.',{message_sent:false},{message_sent:how!=='stopped',answer_id:answer.id,copy_mode:answer.copy_mode},{thread_id:threadId,message_id:msgId,local_deterministic:true,provider_use_count:0},'try');setTimeout(function(){var message=document.querySelector('[data-pm6-mid="'+msgId+'"]'),answerNode=message&&message.querySelector('.pm6-chat-sink'),target=answerNode||message;if(message){message.classList.add('pm7gt-teacher-message');message.querySelectorAll('.runtime-snapshot,.msg-runtime-compact').forEach(function(node){node.remove();});}if(target)target.setAttribute('data-pm7gt-teacher-response','true');if(current&&state.open&&state.step==='chat_teacher'&&state.phase_key==='teacher_wait'&&teacherPending===pending){teacherPending=null;transitionTo(2,4,'forward',true);}},0);}
  function installTeacherSendAdapter(){var d=window.PM_DEMO;if(!d||!d.chat||typeof d.chat.send!=='function')return false;if(teacherOriginalSend)return true;teacherOriginalSend=d.chat.send;d.chat.send=function(threadId,text){var duringTour=state.open&&state.step==='chat_teacher'&&state.phase_key==='teacher_composer',afterTour=!state.open&&state.teacher_available_after_tour&&state.completed;if((!duringTour&&!afterTour)||!state.teacher_thread_id||threadId!==state.teacher_thread_id)return teacherOriginalSend.apply(d.chat,arguments);text=String(text==null?'':text).trim();if(!text)return {toast:'Type a message first.'};if(d.state.chat.busy)return {toast:'Teacher is finishing the last reply.'};var thread=d.state.chat.threads[threadId],answer=teacherAnswer(text),msgId='pm7gt-teacher-'+(++teacherMessageSerial);if(!thread)return {toast:'Teacher’s practice chat is not available.'};thread.messages.push({role:'user',text:text});d.emit('chat.stream',{threadId:threadId,type:'user',text:text});d.state.chat.busy=true;d.emit('chat.state',{busy:true,context:d.state.chat.context,queue:d.state.chat.queue});d.emit('chat.stream',{threadId:threadId,msgId:msgId,type:'start',intent:'guided_teacher'});if(duringTour)transitionTo(2,3,'forward',true);teacherPending={session:sessionSerial,thread:threadId,message:msgId,transition:state.transition_serial,after_tour:afterTour};if(d.stream&&typeof d.stream.start==='function'){d.state.chat.activeStream=d.stream.start(function(chunk){d.emit('chat.stream',{threadId:threadId,msgId:msgId,type:'chunk',html:chunk});},answer.html,{onDone:function(how){completeTeacherTurn(d,threadId,msgId,text,answer,how);}});}else{d.emit('chat.stream',{threadId:threadId,msgId:msgId,type:'chunk',html:answer.html});completeTeacherTurn(d,threadId,msgId,text,answer,'done');}return {ok:true,local_deterministic:true,provider_use_count:0,answer_id:answer.id,copy_mode:answer.copy_mode,available_after_tour:afterTour};};return true;}
  function uninstallTeacherSendAdapter(){var d=window.PM_DEMO;if(teacherOriginalSend&&d&&d.chat){d.chat.send=teacherOriginalSend;teacherOriginalSend=null;}teacherPending=null;return true;}
  function teacherPersonaButton(){return document.querySelector('.pm6-chat-persona-popout-portal.is-open .pm6-chat-personaitem[data-persona="Teacher"]');}
  function mountTeacherPersonaControl(){var existing=teacherPersonaButton(),list=document.querySelector('.pm6-chat-persona-popout-portal.is-open .pm6-chat-personalist');if(existing||!list)return existing;var teacher=document.createElement('button');teacher.type='button';teacher.className='pm6-chat-personaitem';teacher.setAttribute('data-persona','Teacher');teacher.setAttribute('data-od-id','persona-item-teacher');teacher.setAttribute('data-ui-action-id','ui.assistant_chat.select_persona');teacher.setAttribute('data-pm-hover-label','Choose Teacher');teacher.setAttribute('data-pm-hover-detail','Ask for a clear explanation or a safe next step in Puppet Master.');teacher.innerHTML='<span class="pm6-chat-personaname">Teacher</span><span class="pm6-chat-personacheck" aria-hidden="true"></span>';list.insertBefore(teacher,list.firstChild);return teacher;}
  function closeTeacherPicker(){var portal=document.querySelector('.pm6-chat-persona-popout-portal.is-open'),button=document.querySelector('#chatPanel .pm6-chat-personabtn,#floatingChat .pm6-chat-personabtn');if(portal&&button)button.click();return !document.querySelector('.pm6-chat-persona-popout-portal.is-open');}
  function openTeacherPicker(attempt){openChat();var button=document.querySelector('#chatPanel .pm6-chat-personabtn,#floatingChat .pm6-chat-personabtn');if(!button)return false;if(!document.querySelector('.pm6-chat-persona-popout-portal.is-open'))button.click();var teacher=mountTeacherPersonaControl();if(teacher){try{teacher.focus({preventScroll:true});}catch(error){}scheduleTargetTracking();return true;}if((attempt||0)<3)setTimeout(function(){if(state.open&&state.step==='chat_teacher'&&state.phase===1)openTeacherPicker((attempt||0)+1);},80);return false;}
  function prepareTeacherPractice(){openChat();removeTeacherCard();installTeacherSendAdapter();setTeacherInputPlaceholder();var d=window.PM_DEMO;if(!d||!d.chat||typeof d.chat.newThread!=='function')return false;if(!state.teacher_thread_id){var created=d.chat.newThread('teacher');state.teacher_thread_id=created&&created.threadId||null;if(state.teacher_thread_id&&d.state.chat.threads[state.teacher_thread_id])d.state.chat.threads[state.teacher_thread_id].title='Teacher — guided help';if(window.PM6_CHAT_THREADS&&state.teacher_thread_id&&window.PM6_CHAT_THREADS[state.teacher_thread_id])window.PM6_CHAT_THREADS[state.teacher_thread_id].title='Teacher — guided help';document.querySelectorAll('.chat-thread-item[data-thread="'+state.teacher_thread_id+'"] .thread-title').forEach(function(node){node.textContent='Teacher — guided help';});}syncEli5();return true;}
  function restoreHomeRowSizes(targetLayout){
    var api=window.PM_HOME_WORKSPACE;if(!api||!targetLayout)return true;
    /* Row-resize is geometry-backed: make the real Home host measurable before
       invoking its owner, then the terminal route moves on to Planning Wizard. */
    if(window.PM_PAGES&&typeof window.PM_PAGES.go==='function'&&window.PM_PAGES.current!=='dashboard')window.PM_PAGES.go('dashboard');
    var targetRows={};(targetLayout.surfaces||[]).forEach(function(surface){if(surface.visible&&surface.host==='home_main'){if(!targetRows.home_main)targetRows.home_main=[];targetRows.home_main.push(surface);}});
    var rows=targetRows.home_main||[],registry=api.host_registries&&api.host_registries.home_main||[];
    rows.sort(function(a,b){var ai=registry.indexOf(a.surface_instance_id),bi=registry.indexOf(b.surface_instance_id);return (ai<0?a.slot_index:ai)-(bi<0?b.slot_index:bi);});if(rows.length<2)return true;
    var targetSum=rows.reduce(function(sum,row){return sum+(Number(row.size&&row.size.basis_px)||0);},0),currentRows=rows.map(function(row){return homeSurface(row.surface_instance_id,api.layout);}),currentSum=currentRows.reduce(function(sum,row){return sum+(Number(row&&row.size&&row.size.basis_px)||0);},0);
    function sharesMatch(){var nowSum=rows.reduce(function(sum,row){var now=homeSurface(row.surface_instance_id,api.layout);return sum+(Number(now&&now.size&&now.size.basis_px)||0);},0);return !!targetSum&&!!nowSum&&rows.every(function(row){var now=homeSurface(row.surface_instance_id,api.layout);return now&&Math.abs((Number(now.size.basis_px)||0)/nowSum-(Number(row.size.basis_px)||0)/targetSum)<0.001;});}
    if(sharesMatch())return true;
    var goals={},assigned=0;rows.forEach(function(row,index){var goal=index===rows.length-1?currentSum-assigned:Math.round(currentSum*(Number(row.size.basis_px)||0)/targetSum);goals[row.surface_instance_id]=goal;assigned+=goal;});
    /* Include the registry's final surface: its unpaired resize is what can
       restore a pre-tour model sum after the host's rendered flex widths were
       frozen by the pairwise owner. */
    for(var index=0;index<rows.length;index+=1){var target=rows[index],current=homeSurface(target.surface_instance_id,api.layout),goal=goals[target.surface_instance_id];if(!current)continue;
      api.beginResize(target.surface_instance_id,{clientX:0,clientY:0},{});var draft=homeSurface(target.surface_instance_id,api.draft_layout),delta=goal-Number(draft&&draft.size.basis_px||current.size.basis_px),forced=delta===0;if(forced)delta=1;api.updateResize(target.surface_instance_id,{clientX:delta,clientY:0});api.commitResize();
      if(forced){api.beginResize(target.surface_instance_id,{clientX:0,clientY:0},{});draft=homeSurface(target.surface_instance_id,api.draft_layout);delta=goal-Number(draft&&draft.size.basis_px||goal);api.updateResize(target.surface_instance_id,{clientX:delta,clientY:0});api.commitResize();}
    }
    return sharesMatch();
  }
  function undoAll(){var failures=[];for(var i=journal.length-1;i>=0;i-=1){try{if(journal[i].undo()===false)failures.push(journal[i].action_id);}catch(error){failures.push(journal[i].action_id+':'+String(error&&error.message||error));}}journal=[];if(original&&!restoreHomeRowSizes(original.home_layout))failures.push('home_main_basis_restore');var after=layoutNow(),ok=!!original&&same(original.semantic,after);return {ok:ok&&failures.length===0,failures:failures,before:original&&clone(original.semantic),after:after};}
  function selectMountedPersona(name){var label=document.querySelector('#chatPanel .persona-label,#floatingChat .persona-label');if(!name||label&&label.textContent.trim()===name)return true;var button=document.querySelector('#chatPanel .pm6-chat-personabtn,#floatingChat .pm6-chat-personabtn');if(!button)return false;if(!document.querySelector('.pm6-chat-persona-popout-portal.is-open'))button.click();var item=[].slice.call(document.querySelectorAll('.pm6-chat-persona-popout-portal.is-open .pm6-chat-personaitem')).find(function(row){return row.getAttribute('data-persona')===name;});if(!item)return false;item.click();label=document.querySelector('#chatPanel .persona-label,#floatingChat .persona-label');return !!(label&&label.textContent.trim()===name);}
  function switchToOriginalThread(){if(!original||!original.chat_thread)return true;var d=window.PM_DEMO;if(d&&d.state&&d.state.chat&&d.state.chat.activeThread===original.chat_thread)return true;var item=document.querySelector('.chat-thread-item[data-thread="'+original.chat_thread+'"]');if(item)item.click();return !!(d&&d.state&&d.state.chat&&d.state.chat.activeThread===original.chat_thread);}
  function removeTeacherPracticeThread(){var id=state.teacher_thread_id,d=window.PM_DEMO;if(!id||original&&id===original.chat_thread)return true;if(d&&d.state&&d.state.chat){delete d.state.chat.threads[id];if(Array.isArray(d.state.chat.order))d.state.chat.order=d.state.chat.order.filter(function(row){return row!==id;});}if(window.PM6_CHAT_THREADS)delete window.PM6_CHAT_THREADS[id];document.querySelectorAll('.chat-thread-item[data-thread="'+id+'"]').forEach(function(row){row.remove();});return true;}
  function restoreOriginalChatState(keepTeacherThread){if(!original)return {ok:false,failures:['missing_original_chat_state']};var failures=[];closeTeacherPicker();if(!selectMountedPersona(original.persona))failures.push('persona');if(!switchToOriginalThread())failures.push('chat_thread');document.querySelectorAll('#chatPanel .pm6-chat-input,#floatingChat .pm6-chat-input').forEach(function(input){input.setAttribute('placeholder',original.chat_placeholder||'');input.value=original.chat_draft||'';input.dispatchEvent(new Event('input',{bubbles:true}));if(Number.isFinite(original.chat_selection_start)&&Number.isFinite(original.chat_selection_end))try{input.setSelectionRange(original.chat_selection_start,original.chat_selection_end);}catch(error){}});var toggle=document.querySelector('#chatPanel .toggle-eli5,#floatingChat .toggle-eli5'),active=!!(toggle&&toggle.classList.contains('active'));if(toggle&&active!==!!original.eli5_active)toggle.click();if(!keepTeacherThread)removeTeacherPracticeThread();return {ok:failures.length===0,failures:failures};}
  function originalFocusCandidate(){if(!original)return null;var settingsReturn=state.source==='settings'&&[].slice.call(document.querySelectorAll('button[data-action="start-guided-tour"]')).find(function(row){return row.getClientRects().length&&!row.closest('[inert]');})||null;if(settingsReturn)return settingsReturn;var node=original.focus_node;if(node&&node.isConnected&&node.getClientRects().length&&!node.closest('[inert]'))return node;return original.focus_id&&document.getElementById(original.focus_id)||[].slice.call(document.querySelectorAll('[data-od-id],[data-ui-action-id],[data-command-id]')).find(function(row){var exact=original.focus_od_id&&row.getAttribute('data-od-id')===original.focus_od_id||original.focus_ui_action_id&&row.getAttribute('data-ui-action-id')===original.focus_ui_action_id||original.focus_command_id&&row.getAttribute('data-command-id')===original.focus_command_id;return !!exact&&row.getClientRects().length&&!row.closest('[inert]');})||null;}
  function restoreOriginalFocus(attempt){attempt=Number(attempt)||0;requestAnimationFrame(function(){var node=originalFocusCandidate();if(node){try{node.focus({preventScroll:true});}catch(error){try{node.focus();}catch(ignored){}}if(document.activeElement===node){restoreDocumentScroll();return;}}if(attempt<24)setTimeout(function(){restoreOriginalFocus(attempt+1);},32);else restoreDocumentScroll();});return true;}
  function keepTeacherDestination(){var failures=[];if(window.PM_PAGES&&typeof window.PM_PAGES.go==='function')window.PM_PAGES.go('wizard');if(!openChat())failures.push('chat_surface');if(!selectMountedPersona('Teacher'))failures.push('teacher_persona');var d=window.PM_DEMO,id=state.teacher_thread_id,item=id&&document.querySelector('.chat-thread-item[data-thread="'+id+'"]');if(id&&d&&d.state&&d.state.chat&&d.state.chat.activeThread!==id&&item)item.click();if(id&&(!d||!d.state||!d.state.chat||d.state.chat.activeThread!==id))failures.push('teacher_thread');var chat=window.PM_HOME_WORKSPACE&&homeSurface('chat',window.PM_HOME_WORKSPACE.layout);if(!chat||!chat.visible||chat.host!=='dock_right')failures.push('chat_dock_right');journal=[];return {ok:failures.length===0,failures:failures,before:original&&clone(original.semantic),after:layoutNow(),kept_terminal_destination:true};}
  function focusTeacherAfterFinish(){requestAnimationFrame(function(){var input=document.querySelector('#chatPanel .pm6-chat-input,#floatingChat .pm6-chat-input');if(input)try{input.focus({preventScroll:true});}catch(error){try{input.focus();}catch(ignored){}}});return true;}
  function finish(disposition,reason){
    clearTransition();cancelDemoSequence(false);stopTargetTracking();ownerRoutePending=false;ownerRouteSerial+=1;root.removeAttribute('data-owner-route-pending');removeTeacherLibrary();restorePlanningIntent();restorePlanningStage();restoreDocumentScroll();closeUsagePopover();state.teacher_available_after_tour=disposition==='keep'&&reason==='complete';
    var chatRestoration=state.teacher_available_after_tour?{ok:true,failures:[]}:restoreOriginalChatState(false),restoration=state.teacher_available_after_tour?keepTeacherDestination():undoAll();if(!chatRestoration.ok){restoration.ok=false;restoration.failures=restoration.failures.concat(chatRestoration.failures.map(function(row){return 'chat_'+row;}));}
    if(!state.teacher_available_after_tour&&original&&window.PM_PAGES&&window.PM_PAGES.go)window.PM_PAGES.go(original.page);if(!state.teacher_available_after_tour)uninstallTeacherSendAdapter();
    state.layout_disposition=disposition;state.open=false;state.completed=reason==='complete';state.skipped=reason==='skip';state.status=reason==='skip'?'skipped':'completed';root.hidden=true;root.dataset.open='false';document.documentElement.removeAttribute('data-pm7-guided-tour-open');callout.removeAttribute('aria-labelledby');callout.removeAttribute('aria-describedby');resumeButton.hidden=true;replayButton.hidden=false;removeTeacherCard();restoreDocumentScroll();receipt('ui.guided_tour.finish','chat_teacher',restoration.ok?'applied':'failed',restoration.ok?null:(state.teacher_available_after_tour?'Teacher could not remain open on the right.':'The starting workspace could not be completely restored.'),restoration.before,layoutNow(),{layout_restore:restoration,teacher_terminal_scene_completed:disposition==='keep',exit_state_restored:!state.teacher_available_after_tour,teacher_destination_kept:state.teacher_available_after_tour,teacher_available_after_tour:state.teacher_available_after_tour,chat_host:window.PM_HOME_WORKSPACE&&homeSurface('chat',window.PM_HOME_WORKSPACE.layout)&&homeSurface('chat',window.PM_HOME_WORKSPACE.layout).host},'try');if(state.teacher_available_after_tour)focusTeacherAfterFinish();else restoreOriginalFocus();notify();return snapshot();
  }
  function pause(reason){if(!state.open)return snapshot();clearTransition();cancelDemoSequence(false);stopTargetTracking();ownerRoutePending=false;ownerRouteSerial+=1;root.removeAttribute('data-owner-route-pending');removeTeacherLibrary();state.open=false;state.status='paused';root.hidden=true;root.dataset.open='false';document.documentElement.removeAttribute('data-pm7-guided-tour-open');callout.removeAttribute('aria-labelledby');callout.removeAttribute('aria-describedby');resumeButton.hidden=false;replayButton.hidden=true;recordUi('ui.guided_tour.pause',{reason:reason||'user'});notify();return snapshot();}
  function escapeHtml(value){return String(value==null?'':value).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];});}
  function simple(normal,simpler){return state.eli5_enabled?simpler:normal;}
  function uiButton(id,label,primary,extra){return '<button type="button" class="'+(primary?'pm7gt-primary pm7gt-watched':'pm7gt-secondary')+'" data-ui-action-id="'+id+'" '+(extra||'')+'>'+escapeHtml(label)+'</button>';}
  function routeButton(page,label){var available=!!(window.PM_PAGES&&typeof window.PM_PAGES.go==='function'),reason=available?null:'This page is not available right now.';return uiButton('ui.guided_tour.focus_route',label,true,'data-route-page="'+escapeHtml(page)+'" aria-disabled="'+String(!available)+'"'+(reason?' data-disabled-reason="'+escapeHtml(reason)+'"':''));}
  function frame(kicker,title,instruction,note,actions){var support=note?(String(note).charAt(0)==='<'?note:'<p class="pm7gt-note">'+escapeHtml(note)+'</p>'):'';return '<p class="pm7gt-kicker">'+escapeHtml(kicker)+'</p><h2 id="pm7gt-title" tabindex="-1" data-pm-hover-exempt="programmatic-focus-landmark">'+escapeHtml(title)+'</h2><p class="pm7gt-copy" id="pm7gt-copy">'+escapeHtml(instruction)+'</p>'+support+'<div class="pm7gt-actions">'+(actions||'')+'</div>';}
  function liveDemo(label,duration){return state.demo_name?'<div class="pm7gt-live" role="status"><span>'+escapeHtml(label)+'</span><span class="pm7gt-live-track" style="--pm7gt-demo-dur:'+Number(duration||900)+'ms"></span></div>':'';}
  var TEACHER_SUGGESTIONS=['What are the main parts of Puppet Master?','How do I rearrange panels?','What does Planning do?','Can I use Safe History with GitHub?'];
  var TEACHER_MORE_GROUPS=[
    {label:'Projects and safe history',questions:['How do I open a folder on this computer?','How do I bring a project from online?','What is the difference between Git and Jujutsu?','What does FileSafe protect?','How do I restore a backup?','How does Cursor Origin work?']},
    {label:'Computers and connections',questions:['What is the Server?','Can Storage live on a different computer?','How do I connect through Tailscale?','How does Headscale differ?','What is a reverse proxy?','How does Remote Link work?','How does local discovery work?']},
    {label:'Planning and doing the work',questions:['What should I put in requirements?','When does work actually begin?','How do I read a plan before approving it?','What does a run show me?','How do I stop something safely?','Where do I see errors?']},
    {label:'Comfort and getting unstuck',questions:['What does ELI5 change?','How do I use calmer motion?','Can I use Puppet Master with the keyboard?','How do permissions keep me safe?','What can Teacher explain?','When should I use Settings instead?','When should I use Doctor?']}
  ];
  function questionButton(question){return '<li><button type="button" data-ui-action-id="ui.guided_tour.next" data-teacher-question="'+escapeHtml(question)+'">'+escapeHtml(question)+'</button></li>';}
  function teacherQuestions(){var primary='<ul class="pm7gt-question-list" aria-label="Suggested tour questions">'+TEACHER_SUGGESTIONS.map(questionButton).join('')+'</ul>';return primary+'<button type="button" class="pm7gt-browse" data-ui-action-id="ui.guided_tour.next" data-teacher-library-open="true">Browse 26 more</button><p class="pm7gt-question-count">You can also type your own question. Teacher knows 47 Puppet Master topics and works offline.</p>';}
  function teacherLibraryMarkup(){return '<section id="pm7gt-teacher-library" role="dialog" aria-modal="false" aria-labelledby="pm7gt-library-title"><header class="pm7gt-library-head"><strong id="pm7gt-library-title">More questions for Teacher</strong><button type="button" data-ui-action-id="ui.guided_tour.next" data-teacher-library-close="true">Close</button></header><div class="pm7gt-library-groups">'+TEACHER_MORE_GROUPS.map(function(group){return '<section class="pm7gt-library-group"><h3>'+escapeHtml(group.label)+'</h3>'+group.questions.map(function(question){return '<button type="button" data-ui-action-id="ui.guided_tour.next" data-teacher-question="'+escapeHtml(question)+'">'+escapeHtml(question)+'</button>';}).join('')+'</section>';}).join('')+'</div></section>';}
  function removeTeacherLibrary(){var library=document.getElementById('pm7gt-teacher-library'),host=document.getElementById('chatPanel');if(library)library.remove();delete root.dataset.teacherLibrary;callout.removeAttribute('aria-hidden');callout.removeAttribute('inert');if(host&&teacherLibraryHostInlinePosition!==null){host.style.position=teacherLibraryHostInlinePosition;teacherLibraryHostInlinePosition=null;}return true;}
  function openTeacherLibrary(){removeTeacherLibrary();var host=document.getElementById('chatPanel');if(!host)return false;teacherLibraryHostInlinePosition=host.style.position||'';if(getComputedStyle(host).position==='static')host.style.position='relative';host.insertAdjacentHTML('beforeend',teacherLibraryMarkup());var library=document.getElementById('pm7gt-teacher-library'),first=library&&library.querySelector('[data-teacher-question]');if(!library)return false;root.dataset.teacherLibrary='open';callout.setAttribute('aria-hidden','true');callout.setAttribute('inert','');if(first)try{first.focus({preventScroll:true});}catch(error){first.focus();}recordUi('ui.guided_tour.next',{via:'teacher_question_library',question_count:26,mounted_in:'assistant_chat'});return true;}
  function stepMarkup(){var p=state.phase,error=state.last_error?'What happened: '+state.last_error:'';
    if(state.step==='usage'){
      if(p===0)return frame('Scene 1 · Orientation',simple('Tabs take you to a new part of Puppet Master. Panels keep helpful tools close by.','Tabs are rooms. Panels are tool trays you can move.'),simple('Choose a tab for the job you want. Panels can move, resize, or tuck away without changing your project.','Open a room with a tab. Slide a tool tray around; your work stays safe.'),'ELI5 uses simpler words. Reduced Motion in Settings keeps every lesson calm.',uiButton('ui.guided_tour.next','Watch panels rearrange',true));
      if(p===1)return frame('Scene 1 · Panels',simple('Watch two panels swap places—and return.','Watch two tool trays swap places, then come home.'),simple('One panel moves, you see the new layout, then both return exactly where they began.','The trays trade places once. Then both go back exactly where they started.'),liveDemo('Rearranging two panels, then restoring the starting layout.',1040),uiButton('ui.guided_tour.next',state.demo_name?'Finish and restore':'Watch the round trip',true));
      if(p===2){var usageTabVisible=!!visibleTarget('.page-tab[data-page="usage"],#tab-usage');return frame('Scene 1 · Navigation',simple(usageTabVisible?'Open Usage with the highlighted tab.':'Open Usage with the button below.',usageTabVisible?'Open the Usage room with the glowing tab.':'Open the Usage room with the big button below.'),simple(usageTabVisible?'Click it once. When Usage opens, the lesson moves on automatically.':'This window is too narrow to show the Usage tab. The button below opens the same place, then the lesson moves on automatically.',usageTabVisible?'Press the glowing Usage tab. When the room opens, we keep going.':'The Usage tab is tucked away here. Press the big button and we will keep going.'),error||(usageTabVisible?'The lesson is waiting for the highlighted tab.':'Nothing is missing—the page button is the roomy-window version of this control.'),usageTabVisible?'':routeButton('usage','Open Usage'));}
      if(p===3)return frame('Scene 1 · Usage',simple('Usage brings activity, limits, capacity, and cost together in cards.','Usage is a board of gauges you can arrange.'),simple('Each card is one way to see the information. Resizing or hiding it never changes your project or the numbers behind it.','Moving or hiding a gauge does not change the machine. Keep the gauges you check often.'),'Next, open one card’s Options menu. The lesson advances when the right menu opens.',uiButton('ui.guided_tour.next','Try a card menu',true));
      if(p===4)return frame('Your turn · Usage',simple('Open the highlighted card’s Options menu.','Press the glowing Options button on the card.'),simple('Click it once. When that card’s menu opens, the lesson moves on automatically.','Press it once. If the right menu opens, we keep going.'),error,'');
      if(p===5)return frame('Watch a card change',simple('Watch one Usage card resize, disappear, return, and settle back into place.','Watch one gauge grow, hide, come back, and return to normal.'),simple('These are the same size, remove, and add controls you can use later. Every change is undone at the end of this moment.','These are the same buttons you will use. The gauge comes back exactly as it began.'),liveDemo('Resize → hide → reveal → restore.',2420),uiButton('ui.guided_tour.next',state.demo_name?'Finish and restore':'Play the card film',true));
      return frame('Scene 1 complete',simple('You navigated, rearranged panels, and changed a Usage card.','You opened a room, moved trays, and changed a gauge.'),simple('The panels and card are back in their exact starting places. Only what you saw changed; your project never did.','Everything is back where it started. Your work never moved.'),'Next is Planning, where an idea becomes a plan you can read before anything begins.',uiButton('ui.guided_tour.next','Continue to Planning',true));
    }
    if(state.step==='planning_wizard'){
      if(p===0){var beat=state.planning_scan_target,planningTitle=beat==='intent'?'Tell us what kind of help':(beat==='continue'?'Describe what success looks like':'Choose where the project is'),planningSimple=beat==='intent'?'Pick the kind of job you want help with.':(beat==='continue'?'Tell Planning what a good result looks like.':'First, show Planning which project you mean.'),planningInstruction=beat==='intent'?'Planning uses this choice to ask useful questions without starting any work.':(beat==='continue'?'Your own words and a few guided answers become a plan you can read and change.':'The project keeps every question and plan attached to the right work.'),planningEli5=beat==='intent'?'This helps Planning ask the right small questions.':(beat==='continue'?'Your words turn into a recipe you can check and change.':'This keeps the questions with the right folder.');return frame('Scene 2 · Planning',simple(planningTitle,planningSimple),simple(planningInstruction,planningEli5),liveDemo(beat==='intent'?'Kind of help':(beat==='continue'?'What success looks like':'Project location'),2480),uiButton('ui.guided_tour.next',state.demo_name?'Finish the preview':'Show me the path',true));}
      if(p===1)return frame('Your turn · Planning',simple('Choose a different kind of help.','Pick a different kind of job.'),simple('Click the highlighted choice. When Planning selects it, the lesson moves on. We put this practice choice back when you leave.','Press the glowing choice. When it is picked, we keep going.'),error||'This is only a practice choice. Nothing starts here.','');
      if(p===2)return frame('Your turn · Planning',simple('Open the questions about what you need.','Open the recipe questions.'),simple('Click Continue. You can add notes, answer a few guided questions, or do both. Nothing starts yet.','Press the glowing Continue button. The recipe questions will open, but no work begins.'),error||'You still review and approve the finished plan before work can start.','');
      if(p===3)return frame('Scene 2 · Your plan',simple('You reached the place where you describe success.','You reached the recipe questions.'),simple('Your notes and answers become a plan you can read and change. Nothing has started.','Add notes or answer simple questions. Nothing has started.'),'One last Planning moment shows where your approval belongs.',uiButton('ui.guided_tour.next','Show review and approval',true));
      return frame('Scene 2 complete',simple('Read and change the plan here. Nothing starts until you approve it.','Read the recipe here. Cooking waits for your yes.'),simple('The live plan stays open for edits. Approve only when the result, limits, and steps make sense to you.','Change anything that looks wrong. Press approve only when the recipe feels right.'),'We put the practice choice back before heading to Assistant Chat.',uiButton('ui.guided_tour.next','Continue to Teacher',true));
    }
    if(p===0)return frame('Scene 3 · Assistant Chat',simple('Teacher is a built-in guide for Puppet Master concepts and safe next steps.','Teacher is the friendly guide beside the controls.'),simple('Assistant Chat is on the far right. Open the highlighted guide menu beside the message box.','Press the glowing guide button beside the message box.'),'ELI5 changes both the tour wording and Teacher’s next answer.','');
    if(p===1)return frame('Choose Teacher',simple('Select Teacher from the guide list.','Press Teacher in the open list.'),simple('When Chat shows Teacher at the top, the lesson moves on automatically.','When Chat says Teacher, we keep going.'),error,'');
    if(p===2)return frame('Ask one real question',simple('Choose a suggestion or type a specific Puppet Master question, then Send.','Pick a question or type your own, then Send.'),simple('A suggestion fills the message box but never sends it. Teacher can explain navigation, panels, projects, Planning, storage, connections, safety, runs, and accessibility.','Pick a question below. It goes into the real message box, and you decide when to send.'),teacherQuestions(),'');
    if(p===3)return frame('Teacher is answering',simple('Teacher is preparing a built-in practice answer.','Your question is moving through the local guidebook.'),simple('You can go Back while the answer is being prepared. The lesson will wait for you.','You can go Back safely. The lesson waits for you.'),'This practice answer is built into Puppet Master and works without an internet connection.','');
    return frame('Tour complete',simple('Teacher answered in Assistant Chat.','Teacher answered right here.'),simple('This Teacher conversation stays available for more Puppet Master questions. Finish leaves Assistant Chat open on the right so you can keep asking.','This Teacher chat stays open on the right, ready for your next question.'),'Teacher is the last stop. Finish the tour and keep learning here whenever you need help.',uiButton('ui.guided_tour.finish','Finish tour',true));
  }
  function visibleTarget(selector){if(!selector)return null;var selectors=selector.split(',');for(var i=0;i<selectors.length;i+=1){var nodes=document.querySelectorAll(selectors[i].trim());for(var j=0;j<nodes.length;j+=1){var rect=nodes[j].getBoundingClientRect();if(rect.width>0&&rect.height>0&&rect.bottom>0&&rect.right>0&&rect.top<innerHeight&&rect.left<innerWidth)return nodes[j];}}return null;}
  function exactInteractionPhase(){return (state.step==='usage'&&(state.phase===2||state.phase===4))||(state.step==='planning_wizard'&&(state.phase===1||state.phase===2))||(state.step==='chat_teacher'&&(state.phase===0||state.phase===1||state.phase===2));}
  function liveControlCue(){if(state.step==='usage'&&state.phase===2)return 'Use the highlighted Usage tab';if(state.step==='usage'&&state.phase===4)return 'Use the highlighted Options button';if(state.step==='planning_wizard'&&state.phase===1)return 'Use the highlighted choice';if(state.step==='planning_wizard'&&state.phase===2)return 'Use the highlighted Continue button';if(state.step==='chat_teacher'&&state.phase===0)return 'Use the highlighted guide menu';if(state.step==='chat_teacher'&&state.phase===1)return 'Choose Teacher in the open list';if(state.step==='chat_teacher'&&state.phase===2)return 'Choose a question or type, then Send';return 'Use the highlighted control';}
  function syncFooterAction(){if(!forwardSlot)return;forwardSlot.innerHTML='';var primary=stage.querySelector('.pm7gt-actions > button.pm7gt-primary');if(exactInteractionPhase()){var cue=document.createElement('span');cue.className='pm7gt-control-cue';cue.textContent=liveControlCue();forwardSlot.appendChild(cue);return;}if(primary){forwardSlot.appendChild(primary);return;}var status=document.createElement('span');status.className='pm7gt-status';status.textContent=state.last_error||(state.step==='chat_teacher'&&state.phase===3?'Teacher is replying…':state.phase_key.replace(/_/g,' '));forwardSlot.appendChild(status);}
  function desiredOwnerRoute(step,phase){if(step==='usage'){if(phase>=3)return {page:'usage',subtab:null};return {page:phase===2?(state.page_before_usage||'dashboard'):'dashboard',subtab:null};}if(step==='planning_wizard')return {page:'wizard',subtab:phase>=3?'requirements':'intake'};return null;}
  function ownerPageReady(route){if(!route)return true;var panel=document.querySelector('.primary-content > .page.page-'+route.page),rect=panel&&panel.getBoundingClientRect(),ready=!!(window.PM_PAGES&&window.PM_PAGES.current===route.page&&panel&&panel.classList.contains('active')&&rect&&rect.width>0&&rect.height>0);if(!ready)return false;if(route.page==='usage'){var board=document.getElementById('pm7uBoard'),boardRect=board&&board.getBoundingClientRect();return !!(boardRect&&boardRect.width>0&&boardRect.height>0);}if(route.page==='wizard'){var active=document.querySelector('#panel-wizard .pm6-wiz-stage.active[data-wiz-stage]'),activeRect=active&&active.getBoundingClientRect(),stageName=active&&active.getAttribute('data-wiz-stage');return !!(activeRect&&activeRect.width>0&&activeRect.height>0&&(!route.subtab||stageName===route.subtab));}if(route.page==='dashboard'){var host=document.querySelector('[data-pm-home-host="home_main"],#pm-home-host-grid'),hostRect=host&&host.getBoundingClientRect();return !!(hostRect&&hostRect.width>0&&hostRect.height>0);}return true;}
  function prepareStep(direction){state.phase_key=phaseKey(state.step,state.phase);if(state.step==='usage'){if(state.phase<=2&&window.PM_PAGES&&window.PM_PAGES.go){var page=state.phase===2?(state.page_before_usage||'dashboard'):'dashboard';if(window.PM_PAGES.current!==page)window.PM_PAGES.go(page);}if(state.phase>=3){if(window.PM_PAGES&&window.PM_PAGES.go&&window.PM_PAGES.current!=='usage')window.PM_PAGES.go('usage');if(window.PM7_USAGE&&window.PM7_USAGE.rerender)window.PM7_USAGE.rerender();usageCard();}if(state.phase===1)panelPairForDemo();if(state.phase===4){closeUsagePopover();setTimeout(function(){var target=document.querySelector('#pm7uBoard .pm7u-card[data-widget="'+state.active_widget_id+'"] .pm7u-cardmenu');if(target)target.scrollIntoView({block:'center',inline:'nearest'});restoreDocumentScroll();scheduleTargetTracking();},0);}}else if(state.step==='planning_wizard'){if(state.planning_original_stage===null)state.planning_original_stage=currentPlanningStage();if(window.PM_PAGES&&window.PM_PAGES.go)window.PM_PAGES.go('wizard',state.phase>=3?'requirements':'intake');capturePlanningIntent();setTimeout(function(){var target=targetAdapter.resolve('planning_wizard',state.phase);if(target)target.scrollIntoView({block:'center',inline:'nearest'});restoreDocumentScroll();scheduleTargetTracking();},0);}else if(state.step==='chat_teacher'){if(state.phase!==2)removeTeacherLibrary();prepareTeacherPractice();restoreDocumentScroll();if(state.phase===1&&direction==='back')setTimeout(function(){if(state.open&&state.step==='chat_teacher'&&state.phase===1)openTeacherPicker(0);},0);}}
  function render(direction){clearTransition();reduced=motionReduced();state.phase_key=phaseKey(state.step,state.phase);syncEli5();state.motion=direction||'forward';state.transition_serial+=1;root.dataset.step=state.step;root.dataset.phase=String(state.phase);root.dataset.phaseKey=state.phase_key;root.dataset.motion=reduced?'idle':state.motion;stage.innerHTML=stepMarkup();var clip=stage.parentElement;if(clip)clip.scrollTop=0;if(state.step==='chat_teacher')setTeacherInputPlaceholder();callout.setAttribute('aria-labelledby','pm7gt-title');callout.setAttribute('aria-describedby','pm7gt-copy');var canBack=history.length>0;backButton.disabled=false;backButton.setAttribute('aria-disabled',String(!canBack));if(canBack)backButton.removeAttribute('data-disabled-reason');else backButton.setAttribute('data-disabled-reason','There is no earlier tour moment yet.');progress.textContent='Scene '+(state.step_index+1)+' of '+STEPS.length;syncFooterAction();activeTarget=targetAdapter.resolve(state.step,state.phase);positionTarget(activeTarget);scheduleTargetTracking();if(!exactInteractionPhase()){var heading=stage.querySelector('h2'),primary=forwardSlot&&forwardSlot.querySelector('.pm7gt-primary'),focus=heading||primary;if(focus)try{focus.focus({preventScroll:true});}catch(error){}}var serial=state.transition_serial,delay=reduced?0:(currentTheme().indexOf('retro')===0?timings.retro_ms:timings.step_ms);transitionTimer=setTimeout(function(){if(serial!==state.transition_serial)return;root.dataset.motion='idle';state.motion='idle';transitionTimer=0;notify();},delay);notify();}
  function transitionTo(stepIndex,phase,direction,pushHistory){stepIndex=Math.max(0,Math.min(STEPS.length-1,stepIndex));phase=Math.max(0,Math.min((PHASES[STEPS[stepIndex]]||['unknown']).length-1,phase));if(ownerRoutePending)return snapshot();var before={step_index:state.step_index,phase:state.phase},beforePage=window.PM_PAGES&&window.PM_PAGES.current,beforeSubtab=beforePage==='wizard'?currentPlanningStage():null,targetStep=STEPS[stepIndex],route=desiredOwnerRoute(targetStep,phase);if(demoSequence)cancelDemoSequence(false);function commit(){ownerRoutePending=false;root.removeAttribute('data-owner-route-pending');if(pushHistory)history.push(before);state.step_index=stepIndex;state.step=targetStep;state.phase=phase;state.phase_key=phaseKey(state.step,phase);state.last_error=null;state.last_result=null;prepareStep(direction);render(direction||'forward');return snapshot();}if(!route||ownerPageReady(route))return commit();if(!window.PM_PAGES||typeof window.PM_PAGES.go!=='function'){state.last_error='That part of Puppet Master is not available right now. Try again.';render('forward');return snapshot();}ownerRoutePending=true;root.dataset.ownerRoutePending=route.page;var serial=++ownerRouteSerial,startAt=performance.now(),painted=0;window.PM_PAGES.go(route.page,route.subtab);if(route.page==='usage'&&window.PM7_USAGE&&window.PM7_USAGE.rerender)window.PM7_USAGE.rerender();(function waitForOwner(){if(serial!==ownerRouteSerial||!ownerRoutePending)return;painted=ownerPageReady(route)?painted+1:0;if(painted>=2){commit();return;}if(performance.now()-startAt<420){requestAnimationFrame(waitForOwner);return;}ownerRoutePending=false;root.removeAttribute('data-owner-route-pending');if(beforePage&&window.PM_PAGES&&window.PM_PAGES.go)window.PM_PAGES.go(beforePage,beforeSubtab);state.last_error='That page took too long to get ready. Your tour stayed here, so you can try again.';render('forward');})();return snapshot();}
  function gotoStep(index,direction){return transitionTo(index,0,direction||'forward',direction!=='back');}
  function sequenceSummary(results){var rows=(results||[]).filter(Boolean),bad=rows.find(function(row){return row.status==='failed'||row.status==='disabled';}),changed=rows.some(function(row){return row.status==='applied';});state.last_result={status:bad?bad.status:(changed?'applied':'no_change'),steps:rows.map(function(row){return {action_id:row.action_id,status:row.status};}),reason:bad&&bad.reason||null};state.last_error=state.last_result.reason;return state.last_result;}
  function next(){recordUi('ui.guided_tour.next',{});state.last_error=null;if(ownerRoutePending)return snapshot();if(demoSequence){finishDemoSequence();return snapshot();}if(state.step==='usage'){if(state.phase===0)return transitionTo(0,1,'forward',true);if(state.phase===1)return runPanelRoundTrip();if(state.phase===3)return transitionTo(0,4,'forward',true);if(state.phase===5)return runUsageCardFilm();if(state.phase===6){closeUsagePopover();return transitionTo(1,0,'forward',true);}}else if(state.step==='planning_wizard'){if(state.phase===0)return runPlanningScan();if(state.phase===3)return transitionTo(1,4,'forward',true);if(state.phase===4){restorePlanningIntent();restorePlanningStage();return transitionTo(2,0,'forward',true);}}state.last_error='Use the highlighted control to continue this part.';render('forward');return snapshot();}
  function performLocalRoute(page,mode){recordUi('ui.guided_tour.focus_route',{route_target:{page_id:page},local_presentation_only:true,domain_mutation:false,persistence_write:false});var result=routePage(page,mode||'try');if(state.step==='usage'&&state.phase_key==='open_usage'&&result&&(result.status==='applied'||result.status==='no_change')){transitionTo(0,3,'forward',true);}else if(result&&(result.status==='failed'||result.status==='disabled')){state.last_error=result.reason;render('forward');}return result;}
  function back(){recordUi('ui.guided_tour.back',{});if(ownerRoutePending)return snapshot();cancelDemoSequence(false);if(!history.length)return false;var leaving={step_index:state.step_index,phase:state.phase},target=history.pop();if(leaving.step_index===2&&leaving.phase===4&&target.step_index===2&&target.phase===3&&history.length){target=history.pop();}teacherPending=null;removeTeacherLibrary();closeUsagePopover();if(leaving.step_index===2&&leaving.phase===1)closeTeacherPicker();if(state.step==='planning_wizard'&&state.phase>=1&&target.step_index===1&&target.phase<=1)restorePlanningIntent();if(leaving.step_index===1&&target.step_index!==1){restorePlanningIntent();restorePlanningStage();}if(state.step_index===2&&target.step_index===1)restorePlanningIntent();return transitionTo(target.step_index,target.phase,'back',false);}
  function start(options){options=options||{};clearTransition();cancelDemoSequence(false);stopTargetTracking();removeTeacherLibrary();uninstallTeacherSendAdapter();ownerRoutePending=false;ownerRouteSerial+=1;root.removeAttribute('data-owner-route-pending');var settingsTrigger=options.source==='settings'&&[].slice.call(document.querySelectorAll('button[data-action="start-guided-tour"]')).find(function(row){return row.getClientRects().length&&!row.closest('[inert]');})||null;if(!original||options.recapture!==false)captureOriginal(settingsTrigger);journal=[];history=[];effectReceipts.length=0;receiptSerial=0;state.open=true;state.status='demonstrating';state.completed=false;state.skipped=false;state.layout_disposition='pending';state.last_action='ui.guided_tour.start';state.last_result=null;state.last_error=null;state.source=options.source||'manual';state.low_resource_profile=!!options.low_resource_profile;state.shell_squeezed=innerWidth<720||innerHeight<560;state.phase=0;state.teacher_thread_id=null;state.teacher_persona_selected=false;state.teacher_message_sent=false;state.teacher_available_after_tour=false;state.teacher_answer_id=null;state.teacher_response_message_id=null;state.eli5_enabled=!!(original&&original.eli5_active);state.teacher_copy_mode=state.eli5_enabled?'eli5':'normal';state.active_widget_id=null;state.panel_demo_target_id=null;state.panel_demo_pair_ids=null;state.demo_name=null;state.panel_demo_complete=false;state.usage_menu_verified=false;state.usage_card_demo_complete=false;state.planning_scan_target='attach';state.planning_original_intent=null;state.planning_original_stage=null;state.planning_requirements_opened=false;state.planning_choice_arg=null;state.planning_choice_label=null;state.page_before_usage=original&&original.page||'dashboard';teacherPending=null;sessionSerial+=1;root.hidden=false;root.dataset.open='true';document.documentElement.setAttribute('data-pm7-guided-tour-open','true');resumeButton.hidden=true;replayButton.hidden=true;var requested=STEPS.indexOf(options.step),index=requested>=0?requested:0;state.step_index=index;state.step=STEPS[index];state.phase=0;state.phase_key=phaseKey(state.step,0);recordUi('ui.guided_tour.start',{source:state.source,session:'concept-'+sessionSerial,storyboard_revision:STORYBOARD.revision});prepareStep('forward');restoreDocumentScroll();render('forward');return snapshot();}
  function skip(){recordUi('ui.guided_tour.skip',{});return finish('restore','skip');}
  function resume(){recordUi('ui.guided_tour.resume',{});state.open=true;state.status='demonstrating';root.hidden=false;root.dataset.open='true';document.documentElement.setAttribute('data-pm7-guided-tour-open','true');resumeButton.hidden=true;replayButton.hidden=true;if(state.step==='chat_teacher'&&state.phase_key==='teacher_wait'&&state.teacher_message_sent){teacherPending=null;return transitionTo(2,4,'forward',true);}prepareStep('forward');render('forward');return snapshot();}
  function replay(options){recordUi('ui.guided_tour.replay',{});return start(Object.assign({source:'replay',recapture:true},options||{}));}
  function stopTargetTracking(){if(targetFrame){cancelAnimationFrame(targetFrame);targetFrame=0;}if(targetResizeObserver){targetResizeObserver.disconnect();targetResizeObserver=null;}}
  function scheduleTargetTracking(){if(!state.open)return;if(targetFrame)cancelAnimationFrame(targetFrame);targetFrame=requestAnimationFrame(function track(){targetFrame=0;activeTarget=targetAdapter.resolve(state.step,state.phase);positionTarget(activeTarget);if(demoSequence)targetFrame=requestAnimationFrame(track);});if(typeof ResizeObserver!=='undefined'){if(targetResizeObserver)targetResizeObserver.disconnect();targetResizeObserver=new ResizeObserver(function(){if(state.open)scheduleTargetTracking();});try{targetResizeObserver.observe(callout);if(activeTarget)targetResizeObserver.observe(activeTarget);}catch(error){}}}
  function overlapArea(a,b){var width=Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left)),height=Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));return width*height;}
  function positionTarget(target){
    var margin=8,descriptor=targetAdapter.descriptor(state.step,state.phase),fitKey=descriptor.key+'|'+currentTheme()+'|'+innerWidth+'x'+innerHeight;callout.dataset.fitKey=fitKey;callout.style.setProperty('--pm7gt-fit-w',innerWidth+'px');callout.style.setProperty('--pm7gt-fit-h',innerHeight+'px');
    if(target&&callout.contains(target)){root.dataset.target='internal';root.dataset.targetKey=descriptor.key;root.dataset.targetOverlapPx='0';callout.style.left='50%';callout.style.top='50%';return;}var rect=target&&target.getBoundingClientRect?target.getBoundingClientRect():null,visible=rect?{left:Math.max(margin,rect.left),top:Math.max(margin,rect.top),right:Math.min(innerWidth-margin,rect.right),bottom:Math.min(innerHeight-margin,rect.bottom)}:null,
      usable=!!(rect&&rect.width>0&&rect.height>0&&visible.right>visible.left&&visible.bottom>visible.top);
    root.dataset.target=usable?'available':'missing';if(!usable){halo.style.left='50%';halo.style.top='50%';halo.style.width='160px';halo.style.height='96px';callout.style.left='50%';callout.style.top='50%';return;}
    var pad=7,haloBox={left:Math.max(margin,visible.left-pad),top:Math.max(margin,visible.top-pad),right:Math.min(innerWidth-margin,visible.right+pad),bottom:Math.min(innerHeight-margin,visible.bottom+pad)},vw=visible.right-visible.left,vh=visible.bottom-visible.top;root.dataset.targetKey=descriptor.key;halo.style.left=((haloBox.left+haloBox.right)/2)+'px';halo.style.top=((haloBox.top+haloBox.bottom)/2)+'px';halo.style.width=(haloBox.right-haloBox.left)+'px';halo.style.height=(haloBox.bottom-haloBox.top)+'px';
    var cw=Math.min(callout.offsetWidth||400,Math.max(1,innerWidth-margin*2)),ch=Math.min(callout.offsetHeight||360,Math.max(1,innerHeight-margin*2)),gap=24,cx=visible.left+vw/2,cy=visible.top+vh/2;
    var candidates=innerWidth<620?[{side:'below',x:cx,y:visible.bottom+gap+ch/2},{side:'above',x:cx,y:visible.top-gap-ch/2},{side:'right',x:visible.right+gap+cw/2,y:cy},{side:'left',x:visible.left-gap-cw/2,y:cy}]:[{side:'right',x:visible.right+gap+cw/2,y:cy},{side:'left',x:visible.left-gap-cw/2,y:cy},{side:'below',x:cx,y:visible.bottom+gap+ch/2},{side:'above',x:cx,y:visible.top-gap-ch/2}];
    var best=null;candidates.forEach(function(candidate,index){var raw={left:candidate.x-cw/2,top:candidate.y-ch/2,right:candidate.x+cw/2,bottom:candidate.y+ch/2},overflow=Math.max(0,margin-raw.left)+Math.max(0,margin-raw.top)+Math.max(0,raw.right-(innerWidth-margin))+Math.max(0,raw.bottom-(innerHeight-margin)),x=Math.max(cw/2+margin,Math.min(innerWidth-cw/2-margin,candidate.x)),y=Math.max(ch/2+margin,Math.min(innerHeight-ch/2-margin,candidate.y)),box={left:x-cw/2,top:y-ch/2,right:x+cw/2,bottom:y+ch/2},overlap=overlapArea(box,visible),score=overflow*1000000+overlap*100+index;if(!best||score<best.score)best={x:x,y:y,side:candidate.side,score:score,overlap:overlap};});
    if(best.overlap>0){var strips=[{side:'below',space:innerHeight-margin-visible.bottom-gap,axis:'height'},{side:'above',space:visible.top-margin-gap,axis:'height'},{side:'right',space:innerWidth-margin-visible.right-gap,axis:'width'},{side:'left',space:visible.left-margin-gap,axis:'width'}],safe=strips.filter(function(row){return row.axis==='height'?row.space>=168:row.space>=260;}).sort(function(a,b){var ap=a.space/(a.axis==='height'?ch:cw),bp=b.space/(b.axis==='height'?ch:cw);return bp-ap;})[0];if(safe){if(safe.axis==='height'){callout.style.setProperty('--pm7gt-fit-h',Math.floor(safe.space)+'px');ch=Math.min(callout.offsetHeight||safe.space,safe.space);cw=Math.min(callout.offsetWidth||cw,innerWidth-margin*2);var sx=Math.max(cw/2+margin,Math.min(innerWidth-cw/2-margin,cx)),sy=safe.side==='below'?visible.bottom+gap+ch/2:visible.top-gap-ch/2;best={x:sx,y:sy,side:safe.side,overlap:0};}else{callout.style.setProperty('--pm7gt-fit-w',Math.floor(safe.space)+'px');cw=Math.min(callout.offsetWidth||safe.space,safe.space);ch=Math.min(callout.offsetHeight||ch,innerHeight-margin*2);var sy2=Math.max(ch/2+margin,Math.min(innerHeight-ch/2-margin,cy)),sx2=safe.side==='right'?visible.right+gap+cw/2:visible.left-gap-cw/2;best={x:sx2,y:sy2,side:safe.side,overlap:0};}var fitted={left:best.x-cw/2,top:best.y-ch/2,right:best.x+cw/2,bottom:best.y+ch/2};best.overlap=overlapArea(fitted,visible);}}
    callout.style.left=best.x+'px';callout.style.top=best.y+'px';root.dataset.calloutSide=best.side;root.dataset.targetOverlapPx=String(Math.round(best.overlap));
  }
  var targetAdapter={
    schema_id:'pm.guided_tour.deterministic_target_adapter.v1',
    descriptor:function(step,phase){var key=step+':'+phase+':'+phaseKey(step,phase),selector='';if(step==='usage'){usageCard();var card=state.active_widget_id?'#pm7uBoard .pm7u-card[data-widget="'+state.active_widget_id+'"]':'#pm7uBoard';if(phase===0)selector='.title-bar .page-tabs,.page-tabs';else if(phase===1){var panelId=state.panel_demo_target_id;selector=panelId?'[data-pm-home-surface="'+panelId+'"] [data-pm-home-handle="'+panelId+'"],[data-pm-home-surface="'+panelId+'"]':'[data-pm-home-host="home_main"],#pm-home-host-grid';}else if(phase===2)selector='.page-tab[data-page="usage"],#tab-usage,#pm7-guided-tour [data-ui-action-id="ui.guided_tour.focus_route"]';else if(phase===3)selector='#pm7uBoard';else if(phase===4)selector=card+' .pm7u-cardmenu';else selector=card;key+=':'+(state.active_widget_id||'board');}else if(step==='planning_wizard'){if(phase===0){selector=state.planning_scan_target==='intent'?'#pm6WizIntentRow':(state.planning_scan_target==='continue'?'#panel-wizard .pm6-wiz-bigbtn[data-demo-action="wizard.to_requirements"]':'#pm6WizAttachGrid,.pm6-wiz-attach-grid');key+=':'+state.planning_scan_target;}else if(phase===1)selector='#panel-wizard .pm6-wiz-intent-chip:not(.sel),#panel-wizard .pm6-wiz-intent-chip';else if(phase===2)selector='#panel-wizard .pm6-wiz-bigbtn[data-demo-action="wizard.to_requirements"]';else if(phase===3)selector='#pm6WizStageReqs .pm6-wiz-choice-grid,#pm6WizStageReqs';else selector='#pm6WizPrdDoc,#pm6WizReqFoot,#pm6WizStageReqs';}else if(step==='chat_teacher'){if(phase===0)selector='#chatPanel .pm6-chat-personabtn,#floatingChat .pm6-chat-personabtn';else if(phase===1)selector='.pm6-chat-persona-popout-portal.is-open .pm6-chat-personaitem[data-persona="Teacher"],#chatPanel .pm6-chat-personabtn';else if(phase===2)selector='#chatPanel .pm6-chat-input,#floatingChat .pm6-chat-input';else if(phase===3)selector='#chatPanel .messageStream,#chatPanel .pm6-chat-stream';else{selector=state.teacher_response_message_id?'[data-pm6-mid="'+state.teacher_response_message_id+'"] .pm6-chat-sink':'[data-pm7gt-teacher-response="true"],#chatPanel .messageStream';key+=':'+(state.teacher_response_message_id||'latest');}}return {key:key,selector:selector};},
    resolve:function(step,phase){var descriptor=this.descriptor(step,phase==null?state.phase:phase);return visibleTarget(descriptor.selector);},
    status:function(step,phase){phase=phase==null?state.phase:phase;var descriptor=this.descriptor(step,phase),target=this.resolve(step,phase),ownerReason=null;if(step==='usage'&&!window.PM7_USAGE)ownerReason='Usage cards are not available right now.';if(step==='planning_wizard'&&(!window.PM_PAGES||typeof window.PM_PAGES.go!=='function'))ownerReason='Planning is not available right now.';if(step==='chat_teacher'&&(!window.PM_HOME_WORKSPACE||!homeSurface('chat',window.PM_HOME_WORKSPACE.layout)))ownerReason='Assistant Chat is not available right now.';return {step:step,phase:phase,target_key:descriptor.key,selector:descriptor.selector,available:!!target&&!ownerReason,visible:!!target,reason:ownerReason||(!target?'The exact control is still coming into view.':null)};},
    perform:function(actionId){return actionId==='ui.guided_tour.focus_route'?performLocalRoute('usage','try'):null;},layoutSnapshot:function(){return layoutNow();},captureOriginal:function(){return captureOriginal();}
  };
  function fillTeacherQuestion(question){var input=targetAdapter.resolve('chat_teacher',2);if(!input)return false;input.value=String(question||'');input.dispatchEvent(new Event('input',{bubbles:true}));try{input.focus({preventScroll:true});}catch(error){input.focus();}recordUi('ui.guided_tour.next',{via:'teacher_suggestion',question:String(question||'')});state.last_result={status:'applied',suggestion_filled:true,question:String(question||'')};state.last_error=null;notify();return true;}
  root.addEventListener('click',function(event){var control=event.target.closest('button[data-ui-action-id],button[data-command-id]');if(!control||!root.contains(control)||control.disabled||control.getAttribute('aria-disabled')==='true')return;var id=control.getAttribute('data-ui-action-id')||control.getAttribute('data-command-id');ack(control,id);
    if(control.hasAttribute('data-teacher-question'))fillTeacherQuestion(control.getAttribute('data-teacher-question'));else if(control.hasAttribute('data-teacher-library-open'))openTeacherLibrary();else if(id==='ui.guided_tour.next')next();else if(id==='ui.guided_tour.focus_route')performLocalRoute(control.getAttribute('data-route-page')||'usage','try');else if(id==='ui.guided_tour.toggle_eli5')toggleEli5();else if(id==='ui.guided_tour.back')back();else if(id==='ui.guided_tour.pause')pause('user');else if(id==='ui.guided_tour.skip')skip();else if(id==='ui.guided_tour.finish'){recordUi(id,{});finish('keep','complete');}
  });
  resumeButton.addEventListener('click',function(){ack(resumeButton,'ui.guided_tour.resume');resume();});replayButton.addEventListener('click',function(){ack(replayButton,'ui.guided_tour.replay');replay();});
  document.addEventListener('click',function(event){if(!state.open)return;var target=event.target&&event.target.closest?event.target:null;
    var library=target&&target.closest('#pm7gt-teacher-library');if(library){var close=target.closest('[data-teacher-library-close]'),question=target.closest('[data-teacher-question]');if(close){recordUi('ui.guided_tour.next',{via:'teacher_question_library_close'});removeTeacherLibrary();return;}if(question){fillTeacherQuestion(question.getAttribute('data-teacher-question'));removeTeacherLibrary();return;}}
    if(state.step==='usage'&&state.phase===2){var tab=target&&target.closest('.page-tab[data-page="usage"],#tab-usage');if(tab){var routeToken=asyncToken(),before=window.PM_PAGES&&window.PM_PAGES.current;setTimeout(function(){requestAnimationFrame(function(){if(!tokenCurrent(routeToken))return;var panel=document.querySelector('.primary-content > .page.page-usage'),ok=!!(window.PM_PAGES&&window.PM_PAGES.current==='usage'&&panel&&panel.classList.contains('active'));recordUi('ui.guided_tour.focus_route',{via:'exact_page_tab',route_target:{page_id:'usage'}});receipt('ui.guided_tour.focus_route','usage',ok?'applied':'failed',ok?null:'Usage did not become the active page.',before,window.PM_PAGES&&window.PM_PAGES.current,null,'try',localRouteResult('usage',ok?'applied':'failed',ok?null:'Usage did not become the active page.',before,window.PM_PAGES&&window.PM_PAGES.current));if(ok)transitionTo(0,3,'forward',true);else render('forward');});},0);}}
    else if(state.step==='usage'&&state.phase===4){var menu=target&&target.closest('.pm7u-card[data-widget="'+state.active_widget_id+'"] .pm7u-cardmenu');if(menu){var usageToken=asyncToken(),usageStarted=performance.now(),usageFinished=false;(function waitForMatchingMenu(){if(usageFinished||!tokenCurrent(usageToken))return;var pop=usagePopupFor(state.active_widget_id);if(pop){usageFinished=true;ack(menu,'ui.guided_tour.next');state.usage_menu_verified=true;recordUi('ui.guided_tour.next',{via:'exact_usage_card_options',widget_id:state.active_widget_id,verified_popup:'#pm7uCardPop',owner_ready_ms:Math.round(performance.now()-usageStarted)});receipt('ui.guided_tour.next',state.active_widget_id,'applied',null,{options_open:false},{options_open:true,verified_widget_id:state.active_widget_id},{observed_control:'.pm7u-cardmenu',bounded_owner_readiness_ms:250},'try');transitionTo(0,5,'forward',true);return;}if(performance.now()-usageStarted<250){requestAnimationFrame(waitForMatchingMenu);return;}usageFinished=true;state.last_error='The matching card menu did not open. Try the highlighted Options button again.';receipt('ui.guided_tour.next',state.active_widget_id,'failed',state.last_error,{options_open:false},{options_open:false},{observed_control:'.pm7u-cardmenu',bounded_owner_readiness_ms:250},'try');render('forward');})();}}
    else if(state.step==='planning_wizard'&&state.phase===1&&!restoringPlanning){var choice=target&&target.closest('#panel-wizard .pm6-wiz-intent-chip');if(choice){var planningToken=asyncToken();setTimeout(function(){requestAnimationFrame(function(){if(!tokenCurrent(planningToken))return;var ok=choice.classList.contains('sel');if(ok){state.planning_choice_arg=choice.getAttribute('data-demo-arg')||'';state.planning_choice_label=choice.textContent.trim();recordUi('ui.guided_tour.next',{via:'exact_planning_choice',label:state.planning_choice_label,arg:state.planning_choice_arg,verified_selected:true});receipt('ui.guided_tour.next','planning-choice','applied',null,{selected:state.planning_original_intent},{selected:state.planning_choice_arg,label:state.planning_choice_label},{observed_control:'.pm6-wiz-intent-chip'},'try');transitionTo(1,2,'forward',true);}else{state.last_error='Planning did not mark that choice selected. Try an unselected choice again.';render('forward');}});},0);}}
    else if(state.step==='planning_wizard'&&state.phase===2){var requirementsButton=target&&target.closest('#panel-wizard .pm6-wiz-bigbtn[data-demo-action="wizard.to_requirements"]');if(requirementsButton){var requirementsToken=asyncToken();setTimeout(function(){requestAnimationFrame(function(){if(!tokenCurrent(requirementsToken))return;var requirementsStage=document.querySelector('#pm6WizStageReqs.pm6-wiz-stage.active[data-wiz-stage="requirements"]'),ok=!!requirementsStage;if(ok){state.planning_requirements_opened=true;recordUi('ui.guided_tour.next',{via:'exact_planning_requirements',verified_stage:'requirements'});receipt('ui.guided_tour.next','planning-requirements','applied',null,{stage:'intake'},{stage:'requirements'},{observed_control:'wizard.to_requirements'},'try');transitionTo(1,3,'forward',true);}else{state.last_error='The requirements screen did not open. Try the highlighted Continue button again.';render('forward');}});},0);}}
    else if(state.step==='chat_teacher'&&state.phase===0){var picker=target&&target.closest('#chatPanel .pm6-chat-personabtn,#floatingChat .pm6-chat-personabtn');if(picker){var pickerToken=asyncToken();setTimeout(function(){if(!tokenCurrent(pickerToken))return;var portal=document.querySelector('.pm6-chat-persona-popout-portal.is-open'),teacher=mountTeacherPersonaControl();if(portal&&teacher){recordUi('ui.guided_tour.next',{via:'exact_teacher_picker',verified_open:true,mounted_teacher_control:true});transitionTo(2,1,'forward',true);scheduleTargetTracking();}else{state.last_error='The Teacher list did not open. Try the highlighted guide button again.';render('forward');}},0);}}
    else if(state.step==='chat_teacher'&&state.phase===1){var teacher=target&&target.closest('.pm6-chat-personaitem[data-persona="Teacher"]');if(teacher){var teacherToken=asyncToken();setTimeout(function(){if(!tokenCurrent(teacherToken))return;var label=document.querySelector('#chatPanel .persona-label,#floatingChat .persona-label'),ok=!!(label&&label.textContent.trim()==='Teacher');if(ok){state.teacher_persona_selected=true;recordUi('ui.guided_tour.next',{teacher_persona_selected:true,via:'assistant_chat',verified_label:'Teacher'});transitionTo(2,2,'forward',true);}else{state.last_error='Chat did not confirm the Teacher persona. Choose Teacher again.';render('forward');}},0);}}
  },true);
  function tabStops(){var selector='button:not([disabled]):not([aria-disabled="true"]),input:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',nodes=[].slice.call(callout.querySelectorAll(selector)),library=document.getElementById('pm7gt-teacher-library');if(library)nodes=nodes.concat([].slice.call(library.querySelectorAll(selector)));if(state.step==='usage'&&(state.phase===2||state.phase===4)){var usageTarget=targetAdapter.resolve('usage',state.phase);if(usageTarget)nodes.push(usageTarget);}if(state.step==='planning_wizard'&&(state.phase===1||state.phase===2)){var choice=targetAdapter.resolve('planning_wizard',state.phase);if(choice)nodes.push(choice);}if(state.step==='chat_teacher'&&state.phase===0){var picker=targetAdapter.resolve('chat_teacher',0);if(picker)nodes.push(picker);}if(state.step==='chat_teacher'&&state.phase===1)nodes=nodes.concat([].slice.call(document.querySelectorAll('.pm6-chat-personaitem[data-persona="Teacher"]')));if(state.step==='chat_teacher'&&state.phase===2){var input=targetAdapter.resolve('chat_teacher',2);if(input)nodes.push(input);}return nodes.filter(function(node,index,list){var rect=node.getBoundingClientRect();return rect.width>0&&rect.height>0&&list.indexOf(node)===index;});}
  document.addEventListener('keydown',function(event){if(!state.open)return;if(event.key==='Escape'){event.preventDefault();if(document.getElementById('pm7gt-teacher-library')){removeTeacherLibrary();return;}pause('escape');return;}if(event.key!=='Tab')return;var nodes=tabStops();if(!nodes.length)return;var index=nodes.indexOf(document.activeElement),next;if(event.shiftKey)next=index<=0?nodes[nodes.length-1]:nodes[index-1];else next=index<0||index===nodes.length-1?nodes[0]:nodes[index+1];event.preventDefault();try{next.focus({preventScroll:true});}catch(error){next.focus();}},true);
  window.addEventListener('resize',function(){state.shell_squeezed=innerWidth<720||innerHeight<560;delete callout.dataset.fitKey;if(state.open)scheduleTargetTracking();notify();},{passive:true});
  window.addEventListener('scroll',function(){if(state.open)scheduleTargetTracking();},{passive:true,capture:true});
  if(window.matchMedia){var mq=window.matchMedia('(prefers-reduced-motion: reduce)');var motionChange=function(){reduced=motionReduced();if(state.open){clearTransition();root.dataset.motion='idle';render('forward');}};if(mq.addEventListener)mq.addEventListener('change',motionChange);else if(mq.addListener)mq.addListener(motionChange);}
  if(window.MutationObserver)new MutationObserver(function(records){if(!records.some(function(record){return record.attributeName==='data-motion';}))return;if(motionWritePending){motionWritePending=false;return;}if(state.open){reduced=motionReduced();clearTransition();render('forward');}}).observe(document.documentElement,{attributes:true,attributeFilter:['data-motion']});
  window.PM7_GUIDED_TOUR={schema_id:'pm.guided_tour.concept_api.v2',concept_simulation_only:true,production_runtime_certification:false,timings:timings,storyboard:clone(STORYBOARD),start:start,next:next,skip:skip,back:back,resume:resume,replay:replay,snapshot:snapshot,
    target_adapter:targetAdapter,effect_receipts:effectReceipts,ui_action_log:uiActionLog,subscribe:function(fn){if(typeof fn==='function')listeners.push(fn);return function(){listeners=listeners.filter(function(item){return item!==fn;});};}};
  }
  var installObserver=null;
  function mountGuidedTour(){
    installGuidedTour();
    if(window.PM7_GUIDED_TOUR&&installObserver){installObserver.disconnect();installObserver=null;}
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',mountGuidedTour,{once:true});
    if(window.MutationObserver){installObserver=new MutationObserver(mountGuidedTour);installObserver.observe(document.documentElement,{childList:true,subtree:true});}
  }else mountGuidedTour();
})();
</script>'''


# Keep the broad, reviewed local Teacher corpus while replacing the old
# numeric-phase controller.  Only this bounded fragment is carried into the
# generated module; none of the retired controller is emitted.
_TEACHER_LIBRARY_START = _GUIDED_TOUR_LEGACY_SCRIPT.index("  function teacherTopic")
_TEACHER_LIBRARY_END = _GUIDED_TOUR_LEGACY_SCRIPT.index("  function completeTeacherTurn")
_TEACHER_LIBRARY_FRAGMENT = _GUIDED_TOUR_LEGACY_SCRIPT[_TEACHER_LIBRARY_START:_TEACHER_LIBRARY_END]


_GUIDED_TOUR_V3_PREFIX = r'''
<script id="pm7-guided-tour-js">
/* PM7 Guided Tour: deterministic real-shell teacher */
(function () {
  'use strict';
  function installGuidedTour() {
  var root=document.getElementById('pm7-guided-tour'),resumeButton=document.getElementById('pm7-guided-tour-resume'),replayButton=document.getElementById('pm7-guided-tour-replay'),eli5Button=document.getElementById('pm7gt-eli5');
  if(!root||!resumeButton||!replayButton||!eli5Button||window.PM7_GUIDED_TOUR)return;
  var stage=root.querySelector('[data-guided-tour-layer="current"]'),halo=root.querySelector('.pm7gt-halo'),pointer=root.querySelector('.pm7gt-pointer'),callout=root.querySelector('.pm7gt-callout');
  var backButton=root.querySelector('[data-ui-action-id="ui.guided_tour.back"]'),progress=root.querySelector('.pm7gt-progress'),forwardSlot=root.querySelector('.pm7gt-forward-slot');
  var AUTHORITATIVE_PROMPT='What happens before Puppet Master changes my files?';
  var AUTHORITATIVE_ANSWER={id:'before_files_change',normal:'Before work begins, Puppet Master turns your request into a plan. You can review the important choices, correct anything that looks wrong, and decide when to begin. Your Project permissions still control what the work may change.',eli5:'First, Puppet Master writes down what it thinks you want. You can fix the plan before anything starts. It waits for your decision to begin.'};
  var BOOK_CLUB_GOAL='Create a simple website for my neighborhood book club. It should show the next meeting, the current book, and how to join.';
  var BOOK_CLUB_OUTCOMES=['Visitors can see the next meeting.','Visitors can see the current book.','New members can learn how to join.'];
  var WHY_COPY='This decides whether the site needs shared sign-in and editing. Answering now keeps Puppet Master from planning the wrong kind of site.';
  var UI_ACTIONS=['ui.guided_tour.start','ui.guided_tour.next','ui.guided_tour.show_me','ui.guided_tour.back','ui.guided_tour.pause','ui.guided_tour.resume','ui.guided_tour.skip','ui.guided_tour.focus_route','ui.guided_tour.toggle_eli5','ui.guided_tour.finish','ui.guided_tour.replay'];
  var STEP_DEFS=[
    {id:'tour.intro.comfort',chapter:'intro',meaningful:false,dwell_ms:0,action_id:'ui.guided_tour.next'},
    {id:'tour.chat.open',chapter:'chat_teacher',meaningful:false,dwell_ms:650,action_id:'ui.guided_tour.next'},
    {id:'tour.chat.teacher.select',chapter:'chat_teacher',meaningful:true,dwell_ms:650,action_id:'cmd.persona.select'},
    {id:'tour.chat.teacher.ask',chapter:'chat_teacher',meaningful:true,dwell_ms:700,action_id:'cmd.chat.send'},
    {id:'tour.chat.teacher.reply',chapter:'chat_teacher',meaningful:false,dwell_ms:500,action_id:'ui.guided_tour.next'},
    {id:'tour.chat.teacher.eli5',chapter:'chat_teacher',meaningful:true,dwell_ms:650,action_id:'cmd.chat.eli5.set'},
    {id:'tour.workspace.navigation',chapter:'workspace',meaningful:false,dwell_ms:650,action_id:'ui.guided_tour.next'},
    {id:'tour.workspace.chat.dock',chapter:'workspace',meaningful:true,dwell_ms:700,action_id:'cmd.workspace_layout.move_surface'},
    {id:'tour.workspace.panels.rearrange',chapter:'workspace',meaningful:true,dwell_ms:750,action_id:'cmd.workspace_layout.move_surface'},
    {id:'tour.workspace.usage.open',chapter:'workspace',meaningful:true,dwell_ms:650,action_id:'ui.guided_tour.focus_route'},
    {id:'tour.workspace.widget.manage',chapter:'workspace',meaningful:true,dwell_ms:900,action_id:'cmd.widget.configure'},
    {id:'tour.planning.open',chapter:'planning_wizard',meaningful:true,dwell_ms:900,action_id:'ui.planning_wizard.open'},
    {id:'tour.planning.project_source',chapter:'planning_wizard',meaningful:true,dwell_ms:900,action_id:'wizard.attach'},
    {id:'tour.planning.goal',chapter:'planning_wizard',meaningful:true,dwell_ms:1000,action_id:'wizard.practice_goal'},
    {id:'tour.planning.guided_help',chapter:'planning_wizard',meaningful:true,dwell_ms:900,action_id:'wizard.intent'},
    {id:'tour.planning.requirements',chapter:'planning_wizard',meaningful:true,dwell_ms:950,action_id:'wizard.to_requirements'},
    {id:'tour.planning.question',chapter:'planning_wizard',meaningful:true,dwell_ms:1050,action_id:'wizard.practice_answer'},
    {id:'tour.planning.why',chapter:'planning_wizard',meaningful:true,dwell_ms:950,action_id:'wizard.practice_why'},
    {id:'tour.planning.review',chapter:'planning_wizard',meaningful:true,dwell_ms:1100,action_id:'wizard.practice_review'},
    {id:'tour.planning.edit',chapter:'planning_wizard',meaningful:true,dwell_ms:1100,action_id:'wizard.practice_edit'},
    {id:'tour.planning.consequence',chapter:'planning_wizard',meaningful:false,dwell_ms:900,action_id:'ui.guided_tour.next'},
    {id:'tour.planning.approval_boundary',chapter:'planning_wizard',meaningful:false,dwell_ms:900,action_id:'ui.guided_tour.finish'}
  ];
  var STEP_BY_ID={};STEP_DEFS.forEach(function(row,index){row.index=index;STEP_BY_ID[row.id]=row;});
  var STORYBOARD={schema_id:'pm.guided_tour.storyboard.v3',revision:'newbie-first-chat-workspace-planning-2026-09-04',order:STEP_DEFS.map(function(row){return row.id;}),chapter_order:['chat_teacher','workspace','planning_wizard'],promise:'Ask Teacher, make the workspace yours, then plan before building.',continuity:'Assistant Chat and Teacher come first; workspace navigation and reversible layout practice come second; Planning Wizard owns the final and longest chapter.',final_destination:'planning_wizard',work_started:false};
  var meaningful=STEP_DEFS.filter(function(row){return row.meaningful;}),planningMeaningful=meaningful.filter(function(row){return row.chapter==='planning_wizard';}),meaningfulDwell=meaningful.reduce(function(sum,row){return sum+row.dwell_ms;},0),planningDwell=planningMeaningful.reduce(function(sum,row){return sum+row.dwell_ms;},0);
  var timings={step_ms:500,focus_ms:460,show_me_normal_ms:260,show_me_reduced_ms:80,minimum_non_retro_ms:420,maximum_non_retro_ms:560,retro_ms:140,reduced_ms:80,same_frame_ack_ms:0};
  var state={open:false,status:'first_launch',step_id:'tour.intro.comfort',step:'intro',step_index:0,phase:0,phase_key:'comfort',last_action:null,last_result:null,last_error:null,action_mode:null,action_status:'idle',choreography_state:'idle',layout_disposition:'pending',layout_snapshot_restored:false,completed:false,skipped:false,transition_serial:0,motion:'idle',source:'unknown',eli5_enabled:false,teacher_mode:'local_deterministic_zero_provider',teacher_thread_id:null,teacher_persona_selected:false,teacher_message_sent:false,teacher_answer_id:null,teacher_response_message_id:null,teacher_response_index:null,teacher_copy_mode:'normal',active_widget_id:null,panel_demo_pair_ids:null,panel_demo_complete:false,usage_card_demo_complete:false,planning_goal:'',planning_answer:null,planning_why_open:false,planning_reviewed:false,planning_edited:false,planning_consequence_visible:false,planning_project_selected:false,planning_requirements_opened:false,work_started:false,provider_request_baseline:0,usage_baseline:0,provider_request_delta:0,usage_delta:0,zero_provider_verified:true,zero_usage_verified:true,low_resource_profile:false,shell_squeezed:false};
  var original=null,history=[],uiActionLog=[],effectReceipts=[],listeners=[],receiptSerial=0,sessionSerial=0,transitionTimer=0,choreographyTimers=[],targetFrame=0,targetResizeObserver=null,activeTarget=null,lastOutsideFocus=null,lastOutsideFocusAt=0,teacherOriginalSend=null,teacherPending=null,teacherMessageSerial=0,restoring=false,widgetCheckpoint=null,planningFixture=null,reduced=motionReduced();
  function clone(value){if(value===undefined)return undefined;return JSON.parse(JSON.stringify(value));}
  function same(a,b){return JSON.stringify(a)===JSON.stringify(b);}
  function motionReduced(){try{return document.documentElement.getAttribute('data-motion')==='reduced'||!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);}catch(error){return false;}}
  function currentTheme(){return document.documentElement.getAttribute('data-theme')||'unknown';}
  function stepDef(id){return STEP_BY_ID[id||state.step_id]||STEP_DEFS[0];}
  function chapterPhase(def){var rows=STEP_DEFS.filter(function(row){return row.chapter===def.chapter;});return Math.max(0,rows.indexOf(def));}
  function syncCompatibility(){var def=stepDef();state.step=def.chapter;state.step_index=def.index;state.phase=chapterPhase(def);state.phase_key=def.id.split('.').slice(2).join('_')||'comfort';}
  function counterNumber(value){if(Array.isArray(value))return value.length;return typeof value==='number'&&Number.isFinite(value)&&value>=0?value:null;}
  function firstCounter(values){for(var i=0;i<values.length;i+=1){var value=counterNumber(values[i]);if(value!==null)return value;}return null;}
  function measureCounters(){var d=window.PM_DEMO,s=d&&d.state||{},usage=s.usage||{},provider=s.providers||{};return {provider_requests:firstCounter([s.provider_request_count,provider.request_count,provider.requests,d&&d.provider_request_log]),usage:firstCounter([s.usage_count,usage.request_count,usage.events,usage.receipts])};}
  function updateCounterDeltas(){var now=measureCounters();state.provider_request_delta=now.provider_requests===null||state.provider_request_baseline===null?null:now.provider_requests-state.provider_request_baseline;state.usage_delta=now.usage===null||state.usage_baseline===null?null:now.usage-state.usage_baseline;state.zero_provider_verified=state.provider_request_delta===0;state.zero_usage_verified=state.usage_delta===0;return now;}
  function recordUi(id,payload){var row={action_id:id,step_id:state.step_id,serial:uiActionLog.length+1,payload:clone(payload||{})};uiActionLog.push(row);return row;}
  function receipt(actionId,targetId,status,reason,before,after,owner,mode,metadata){var row={schema_id:'pm.guided_tour.concept_effect_receipt.v2',receipt_id:'guided-tour-effect-'+(++receiptSerial),action_id:actionId,step_id:state.step_id,target_id:targetId||null,status:status,reason:reason||null,before:clone(before),after:clone(after),owner_receipt:clone(owner||null),mode:mode||state.action_mode||'try',concept_simulation_only:true,production_receipt:false};if(metadata)row.local_action_result=clone(metadata);effectReceipts.push(row);state.last_result=clone(row);state.last_error=status==='failed'||status==='disabled'?reason||status:null;notify();return row;}
  function snapshot(){syncCompatibility();updateCounterDeltas();var def=stepDef();return {schema_id:'pm.guided_tour.concept_snapshot.v2',schema_version:'2.0.0',concept_simulation_only:true,durable_session_record:false,real_shell_owner_observation:true,production_runtime_certification:false,open:state.open,status:state.status,step_id:state.step_id,step:state.step,step_index:state.step_index,phase:state.phase,phase_key:state.phase_key,chapter:def.chapter,last_action:state.last_action,last_result:clone(state.last_result),last_error:state.last_error,action_mode:state.action_mode,action_status:state.action_status,choreography_state:state.choreography_state,layout_disposition:state.layout_disposition,layout_snapshot_restored:state.layout_snapshot_restored,completed:state.completed,skipped:state.skipped,transition_serial:state.transition_serial,motion:state.motion,source:state.source,eli5_enabled:state.eli5_enabled,teacher_mode:state.teacher_mode,teacher_thread_id:state.teacher_thread_id,teacher_persona_selected:state.teacher_persona_selected,teacher_message_sent:state.teacher_message_sent,teacher_answer_id:state.teacher_answer_id,teacher_response_message_id:state.teacher_response_message_id,teacher_copy_mode:state.teacher_copy_mode,active_widget_id:state.active_widget_id,panel_demo_pair_ids:clone(state.panel_demo_pair_ids),panel_demo_complete:state.panel_demo_complete,usage_card_demo_complete:state.usage_card_demo_complete,planning_goal:state.planning_goal,planning_answer:state.planning_answer,planning_why_open:state.planning_why_open,planning_reviewed:state.planning_reviewed,planning_edited:state.planning_edited,planning_consequence_visible:state.planning_consequence_visible,planning_project_selected:state.planning_project_selected,planning_requirements_opened:state.planning_requirements_opened,work_started:false,provider_request_baseline:state.provider_request_baseline,provider_request_delta:state.provider_request_delta,provider_use_count:state.provider_request_delta,usage_baseline:state.usage_baseline,usage_delta:state.usage_delta,zero_provider_verified:state.zero_provider_verified,zero_usage_verified:state.zero_usage_verified,reduced_motion:reduced,low_resource_profile:state.low_resource_profile,shell_squeezed:state.shell_squeezed,theme:currentTheme(),timings:clone(timings),storyboard_revision:STORYBOARD.revision,story_order:STORYBOARD.order.slice(),chapter_order:STORYBOARD.chapter_order.slice(),meaningful_action_count:meaningful.length,planning_meaningful_action_count:planningMeaningful.length,meaningful_dwell_ms:meaningfulDwell,planning_dwell_ms:planningDwell,planning_action_share:planningMeaningful.length/meaningful.length,planning_dwell_share:planningDwell/meaningfulDwell,history:history.slice(),layout_snapshot_captured:!!original,journal_depth:0,effect_receipts:clone(effectReceipts),ui_action_log:clone(uiActionLog),target:targetAdapter.status(state.step_id)};}
  function notify(){var value=snapshot();listeners.slice().forEach(function(fn){try{fn(value);}catch(error){}});}
  function ack(control,id){state.last_action=id;if(control){control.setAttribute('data-ack','true');control.dataset.ackFrame='same';}root.dataset.ack=id;root.dataset.ackFrame='same';notify();}
'''


_GUIDED_TOUR_V3_SUFFIX = r'''
  var broadTeacherAnswer=teacherAnswer;
  function guidedTeacherAnswer(text){if(/what happens before puppet master changes my files/i.test(String(text||'')))return {id:AUTHORITATIVE_ANSWER.id,copy_mode:state.eli5_enabled?'eli5':'normal',html:state.eli5_enabled?AUTHORITATIVE_ANSWER.eli5:AUTHORITATIVE_ANSWER.normal};return broadTeacherAnswer(text);}
  function homeSurface(id,layout){return (layout&&layout.surfaces||[]).filter(function(row){return row.surface_instance_id===id;})[0]||null;}
  function semanticHome(layout){var surfaces=layout&&layout.surfaces||[],mainTotal=surfaces.reduce(function(sum,surface){return sum+(surface.visible&&!surface.collapsed&&surface.host==='home_main'?Number(surface.size&&surface.size.basis_px)||0:0);},0);return surfaces.map(function(surface){var size=surface.size||{},semanticSize=surface.host==='home_main'&&surface.visible&&!surface.collapsed&&mainTotal?{basis_share_ppm:Math.round((Number(size.basis_px)||0)*1000000/mainTotal),cross_basis_px:Number(size.cross_basis_px),flex_weight:Number(size.flex_weight),min_width_px:Number(size.min_width_px),min_height_px:Number(size.min_height_px)}:{basis_px:Number(size.basis_px),cross_basis_px:Number(size.cross_basis_px),flex_weight:Number(size.flex_weight),min_width_px:Number(size.min_width_px),min_height_px:Number(size.min_height_px)};return {id:surface.surface_instance_id,host:surface.host,slot_index:surface.slot_index,visible:surface.visible,collapsed:surface.collapsed,size:semanticSize,floating_bounds:surface.host==='floating'?clone(surface.floating_bounds):null};}).sort(function(a,b){return a.id.localeCompare(b.id);});}
  function usageLayout(){var api=window.PM7_USAGE;if(!api||!api.state)return null;var ids=[];try{ids=api.visibleWidgets().map(function(item){return item.id;});}catch(error){}var layouts={};ids.forEach(function(id){var item=api.widgetById&&api.widgetById(id);if(item&&api.layoutFor)layouts[id]=clone(api.layoutFor(item));});return {room:api.state.room,visible_widget_ids:ids,hidden:clone(api.state.hidden||{}),layouts:layouts};}
  function layoutNow(){var home=window.PM_HOME_WORKSPACE;return {home:home?semanticHome(home.layout):null,usage:usageLayout()};}
  function rememberOutsideFocus(event){var node=event&&event.target&&event.target.closest?event.target.closest('button,a,input,textarea,select,[tabindex]:not([tabindex="-1"])'):null;if(!node||root.contains(node))return;lastOutsideFocus=node;lastOutsideFocusAt=Date.now();}
  document.addEventListener('pointerdown',rememberOutsideFocus,true);
  function captureOriginal(preferredFocus){var api=window.PM_HOME_WORKSPACE,tab=document.querySelector('.page-tab.active[data-page]'),toggle=document.querySelector('#chatPanel .toggle-eli5,#floatingChat .toggle-eli5'),persona=document.querySelector('#chatPanel .persona-label,#floatingChat .persona-label'),input=document.querySelector('#chatPanel .pm6-chat-input,#floatingChat .pm6-chat-input'),active=document.activeElement,focus=preferredFocus||(active&&active!==document.body&&active!==document.documentElement&&active!==root?active:(lastOutsideFocus&&Date.now()-lastOutsideFocusAt<1200?lastOutsideFocus:null)),attach=document.querySelector('#panel-wizard .pm6-wiz-attach-card.selected'),intent=document.querySelector('#panel-wizard .pm6-wiz-intent-chip.sel'),wizStage=document.querySelector('#panel-wizard .pm6-wiz-stage.active[data-wiz-stage]'),counters=measureCounters();original={semantic:layoutNow(),home_layout:api?clone(api.layout):null,usage:usageLayout(),page:window.PM_PAGES&&window.PM_PAGES.current||tab&&tab.getAttribute('data-page')||'dashboard',chat_thread:window.PM_DEMO&&window.PM_DEMO.state&&window.PM_DEMO.state.chat&&window.PM_DEMO.state.chat.activeThread||null,persona:persona&&persona.textContent.trim()||'Product Manager',chat_placeholder:input&&input.getAttribute('placeholder')||'',chat_draft:input&&input.value||'',eli5_active:!!(toggle&&toggle.classList.contains('active')),attach:attach&&attach.getAttribute('data-demo-arg')||null,intent:intent&&intent.getAttribute('data-demo-arg')||null,wizard_stage:wizStage&&wizStage.getAttribute('data-wiz-stage')||'intake',focus_node:focus&&focus!==document.body?focus:null,scroll_left:Number(window.scrollX)||0,scroll_top:Number(window.scrollY||(document.scrollingElement&&document.scrollingElement.scrollTop))||0,counters:counters};state.provider_request_baseline=counters.provider_requests;state.usage_baseline=counters.usage;return clone(original.semantic);}
  function restoreDocumentScroll(){var left=original?original.scroll_left:0,top=original?original.scroll_top:0;try{window.scrollTo(left,top);}catch(error){}if(document.scrollingElement){document.scrollingElement.scrollLeft=left;document.scrollingElement.scrollTop=top;}}
  function setUsageVisible(id,visible){var api=window.PM7_USAGE,item=api&&api.widgetById&&api.widgetById(id),key=api&&api.state&&(api.state.room+':'+id);if(!api||!item)return false;var current=!api.state.hidden[key];if(current===visible)return true;if(!visible){var card=document.querySelector('#pm7uBoard .pm7u-card[data-widget="'+id+'"]'),menu=card&&card.querySelector('.pm7u-cardmenu');if(menu)menu.click();var hide=document.querySelector('#pm7uCardPop [data-hide-card="'+id+'"]');if(hide)hide.click();}else{var chooser=document.getElementById('pm7uCustomize');if(chooser)chooser.click();var show=document.querySelector('#pm7uCustomizePop [data-toggle-widget="'+id+'"]');if(show)show.click();if(document.querySelector('#pm7uCustomizePop.open')&&chooser)chooser.click();}return !api.state.hidden[key]===visible;}
  function restoreHomeSizes(api,surfaces){
    // Placement can normalize row bases; restore their saved ratios only after
    // moving, through the workspace's bounded semantic resize owner.
    if(typeof api.resizeSurface!=='function')return false;
    return surfaces.every(function(want){
      var layout=api.layout,now=homeSurface(want.surface_instance_id,layout);if(!now)return false;
      if(now.size.basis_px===want.size.basis_px&&now.size.cross_basis_px===want.size.cross_basis_px&&now.size.flex_weight===want.size.flex_weight)return true;
      var result=api.resizeSurface(want.surface_instance_id,{width_px:want.size.basis_px,height_px:want.size.cross_basis_px,flex_weight:want.size.flex_weight,expected_layout_revision:layout.layout_revision});
      return !!result&&result.ok===true;
    });
  }
  function restoreWorkspaceSnapshot(){
    var failures=[],api=window.PM_HOME_WORKSPACE;
    if(original&&api&&original.home_layout){
      var surfaces=original.home_layout.surfaces||[];
      surfaces.slice().sort(function(a,b){return a.slot_index-b.slot_index;}).forEach(function(want){
        try{
          var id=want.surface_instance_id,now=homeSurface(id,api.layout);if(!now)return failures.push('missing:'+id);
          // Unchanged hidden panels must not be opened and reinserted as visible slots.
          if(now.host!==want.host||now.slot_index!==want.slot_index||want.host==='floating'&&!same(now.floating_bounds,want.floating_bounds)){
            var insertion={index:want.slot_index};if(want.floating_bounds)insertion.bounds=clone(want.floating_bounds);var moved=api.moveSurface(id,want.host,insertion);if(!moved||moved.ok===false)failures.push('move:'+id);
          }
          now=homeSurface(id,api.layout);if(now&&now.collapsed!==want.collapsed)api.setCollapsed(id,want.collapsed);
          now=homeSurface(id,api.layout);if(now&&now.visible!==want.visible)api.setSurfaceVisible(id,want.visible,'cmd.panel.switch');
        }catch(error){failures.push(want.surface_instance_id);}
      });
      try{if(!restoreHomeSizes(api,surfaces))failures.push('size_restore');}catch(error){failures.push('size_restore');}
    }
    var u=window.PM7_USAGE;if(original&&original.usage&&u){Object.keys(original.usage.layouts||{}).forEach(function(id){var item=u.widgetById&&u.widgetById(id),want=original.usage.layouts[id];if(item&&want&&u.setLayout&&!same(u.layoutFor(item),want))u.setLayout(item,want.cols,want.rows,'cmd.widget.resize','guided_tour_snapshot_restore');});Object.keys(u.state.hidden||{}).forEach(function(key){var id=key.split(':').slice(1).join(':'),want=!!original.usage.hidden[key];if(id)setUsageVisible(id,!want);});if(u.rerender)u.rerender();}
    var after=layoutNow(),ok=!!original&&same(original.semantic,after);return {ok:ok&&failures.length===0,failures:failures,before:original&&clone(original.semantic),after:after};
  }
  function selectPersona(name){var label=document.querySelector('#chatPanel .persona-label,#floatingChat .persona-label');if(label&&label.textContent.trim()===name)return true;var button=document.querySelector('#chatPanel .pm6-chat-personabtn,#floatingChat .pm6-chat-personabtn');if(!button)return false;if(!document.querySelector('.pm6-chat-persona-popout-portal.is-open'))button.click();var item=[].slice.call(document.querySelectorAll('.pm6-chat-persona-popout-portal.is-open .pm6-chat-personaitem')).find(function(row){return row.getAttribute('data-persona')===name;});if(item)item.click();label=document.querySelector('#chatPanel .persona-label,#floatingChat .persona-label');return !!(label&&label.textContent.trim()===name);}
  function restoreChatState(preserveTeacher){
    var d=window.PM_DEMO;if(!original||!d||!d.state||!d.state.chat)return false;
    if(original.chat_thread&&!d.state.chat.threads[original.chat_thread])return false;
    if(!selectPersona(original.persona))return false;
    if(original.chat_thread){var item=document.querySelector('.chat-thread-item[data-thread="'+original.chat_thread+'"]');if(item)item.click();d.state.chat.activeThread=original.chat_thread;}
    var inputs=document.querySelectorAll('#chatPanel .pm6-chat-input,#floatingChat .pm6-chat-input');if(!inputs.length)return false;
    inputs.forEach(function(input){input.setAttribute('placeholder',original.chat_placeholder);input.value=original.chat_draft;input.dispatchEvent(new Event('input',{bubbles:true}));});
    document.querySelectorAll('#chatPanel .toggle-eli5,#floatingChat .toggle-eli5').forEach(function(toggle){toggle.classList.toggle('active',original.eli5_active);});
    var id=state.teacher_thread_id;if(!preserveTeacher&&id&&id!==original.chat_thread){delete d.state.chat.threads[id];if(Array.isArray(d.state.chat.order))d.state.chat.order=d.state.chat.order.filter(function(row){return row!==id;});if(window.PM6_CHAT_THREADS)delete window.PM6_CHAT_THREADS[id];document.querySelectorAll('.chat-thread-item[data-thread="'+id+'"]').forEach(function(row){row.remove();});}
    return (!original.chat_thread||d.state.chat.activeThread===original.chat_thread)&&[].every.call(inputs,function(input){return input.value===original.chat_draft&&input.getAttribute('placeholder')===original.chat_placeholder;});
  }
  function restorePlanningChoice(){if(!original)return;restoring=true;var attach=original.attach&&document.querySelector('#panel-wizard .pm6-wiz-attach-card[data-demo-arg="'+original.attach+'"]'),intent=original.intent&&document.querySelector('#panel-wizard .pm6-wiz-intent-chip[data-demo-arg="'+original.intent+'"]');if(attach&&!attach.classList.contains('selected'))attach.click();if(intent&&!intent.classList.contains('sel'))intent.click();restoring=false;}
  function originalFocus(){var node=original&&original.focus_node;if(node&&node.isConnected&&node.getClientRects().length){requestAnimationFrame(function(){try{node.focus({preventScroll:true});}catch(error){}restoreDocumentScroll();});}}
  function mountedTarget(selector){if(!selector)return null;var selectors=selector.split(',');for(var i=0;i<selectors.length;i+=1){var nodes=document.querySelectorAll(selectors[i].trim());for(var j=0;j<nodes.length;j+=1){var rect=nodes[j].getBoundingClientRect();if(rect.width>0&&rect.height>0)return nodes[j];}}return null;}
  function visibleTarget(selector){if(!selector)return null;var selectors=selector.split(',');for(var i=0;i<selectors.length;i+=1){var nodes=document.querySelectorAll(selectors[i].trim());for(var j=0;j<nodes.length;j+=1){var rect=nodes[j].getBoundingClientRect();if(rect.width>0&&rect.height>0&&rect.bottom>0&&rect.right>0&&rect.top<innerHeight&&rect.left<innerWidth)return nodes[j];}}return null;}
  function activeChat(){return visibleTarget('#chatPanel:not(.hidden),#floatingChat');}
  function chatOpenControl(){return visibleTarget('.activity-bar .icon[title="Chat"],[data-demo-action="cmd.panel.switch"][data-demo-arg*="chat"]');}
  function teacherPersonaButton(){return visibleTarget('.pm6-chat-persona-popout-portal.is-open .pm6-chat-personaitem[data-persona="Teacher"]');}
  function mountTeacherPersonaControl(){var existing=teacherPersonaButton(),list=document.querySelector('.pm6-chat-persona-popout-portal.is-open .pm6-chat-personalist');if(existing||!list)return existing;var teacher=document.createElement('button');teacher.type='button';teacher.className='pm6-chat-personaitem';teacher.setAttribute('data-persona','Teacher');teacher.setAttribute('data-od-id','persona-item-teacher');teacher.setAttribute('data-pm-hover-label','Choose Teacher');teacher.setAttribute('data-pm-hover-detail','Ask for a clear explanation or a safe next step in Puppet Master.');teacher.innerHTML='<span class="pm6-chat-personaname">Teacher</span><span class="pm6-chat-personacheck" aria-hidden="true"></span>';list.insertBefore(teacher,list.firstChild);return teacher;}
  function openChatSurface(){var api=window.PM_HOME_WORKSPACE,chat=api&&homeSurface('chat',api.layout);if(api&&chat&&!chat.visible)api.setSurfaceVisible('chat',true,'cmd.panel.switch');var panel=document.getElementById('chatPanel');if(panel)panel.classList.remove('hidden');return !!activeChat();}
  function setTeacherPlaceholder(){document.querySelectorAll('#chatPanel .pm6-chat-input,#floatingChat .pm6-chat-input').forEach(function(input){input.setAttribute('placeholder','Ask Teacher anything about Puppet Master…');});}
  var guidedThreadIds=Object.create(null);
  function teacherTurnCurrent(pending){var d=window.PM_DEMO;return !!(pending&&teacherPending===pending&&pending.session===sessionSerial&&d&&d.state.chat.threads[pending.thread]===pending.thread_record&&(!pending.stream||d.state.chat.activeStream===pending.stream));}
  function cancelTeacherTurn(){
    var pending=teacherPending,d=window.PM_DEMO;if(!pending)return;teacherPending=null;
    if(pending.stream&&typeof pending.stream.cancel==='function')pending.stream.cancel();
    if(d&&d.state.chat.activeStream===pending.stream){d.state.chat.busy=false;d.state.chat.activeStream=null;d.emit('chat.stream',{threadId:pending.thread,msgId:pending.message,type:'stopped'});d.emit('chat.state',{busy:false,context:d.state.chat.context,queue:d.state.chat.queue});}
  }
  function completeTeacherTurn(d,pending,answer,how){
    if(!teacherTurnCurrent(pending))return false;
    var threadId=pending.thread,msgId=pending.message,thread=pending.thread_record,currentLesson=threadId===state.teacher_thread_id&&d.state.chat.activeThread===threadId;
    thread.messages.push({role:'assistant',html:answer.html,stopped:how==='stopped',guided_example:true});
    d.state.chat.busy=false;d.state.chat.activeStream=null;
    d.emit('chat.stream',{threadId:threadId,msgId:msgId,type:how==='stopped'?'stopped':'done'});d.emit('chat.state',{busy:false,context:d.state.chat.context,queue:d.state.chat.queue});
    if(currentLesson){state.teacher_response_index=thread.messages.length-1;state.teacher_message_sent=how!=='stopped';state.teacher_answer_id=answer.id;state.teacher_response_message_id=msgId;state.teacher_copy_mode=answer.copy_mode;}
    teacherPending=null;
    setTimeout(function(){
      if(pending.session!==sessionSerial||d.state.chat.threads[threadId]!==thread)return;
      var message=document.querySelector('[data-pm6-mid="'+msgId+'"]'),sink=message&&message.querySelector('.pm6-chat-sink');
      if(message){message.classList.add('pm7gt-teacher-message');message.setAttribute('data-guided-example','true');message.querySelectorAll('.runtime-snapshot,.msg-runtime-compact').forEach(function(node){node.remove();});}
      if(sink)sink.setAttribute('data-pm7gt-teacher-response','true');
      if(how!=='stopped'&&currentLesson&&state.open&&state.step_id===pending.step_id&&pending.step_id==='tour.chat.teacher.ask'&&state.action_status==='watching')completeStep('applied',{thread_id:threadId,message_id:msgId,local_deterministic:true});
    },0);return true;
  }
  function installTeacherSendAdapter(){
    var d=window.PM_DEMO;if(!d||!d.chat||typeof d.chat.send!=='function')return false;if(teacherOriginalSend)return true;
    teacherOriginalSend=d.chat.send;
    d.chat.send=function(threadId,text){
      var thread=d.state.chat.threads[threadId],guided=!!(guidedThreadIds[threadId]||thread&&thread.guided_example===true);
      if(!guided)return teacherOriginalSend.apply(d.chat,arguments);
      // A guided thread remains local when paused, in another chapter, or retained after a replay.
      if(!thread)return {ok:false,toast:'This guided example has ended. Replay the tour to start another.'};
      text=String(text==null?'':text).trim();if(!text)return {toast:'Type a message first.'};
      if(d.state.chat.busy)return {toast:'Teacher is finishing the last reply.'};
      var answer=guidedTeacherAnswer(text),msgId='pm7gt-teacher-'+(++teacherMessageSerial),pending={session:sessionSerial,thread:threadId,thread_record:thread,message:msgId,step_id:state.step_id,stream:null};
      if(threadId===state.teacher_thread_id)state.teacher_last_prompt=text;
      thread.messages.push({role:'user',text:text,guided_example:true});d.emit('chat.stream',{threadId:threadId,type:'user',text:text});d.state.chat.busy=true;
      d.emit('chat.state',{busy:true,context:d.state.chat.context,queue:d.state.chat.queue});d.emit('chat.stream',{threadId:threadId,msgId:msgId,type:'start',intent:'guided_teacher'});teacherPending=pending;
      function chunk(html){if(teacherTurnCurrent(pending))d.emit('chat.stream',{threadId:threadId,msgId:msgId,type:'chunk',html:html});}
      if(d.stream&&typeof d.stream.start==='function'){pending.stream=d.stream.start(chunk,answer.html,{onDone:function(how){completeTeacherTurn(d,pending,answer,how);}});if(teacherTurnCurrent(pending))d.state.chat.activeStream=pending.stream;}
      else{chunk(answer.html);completeTeacherTurn(d,pending,answer,'done');}
      return {ok:true,local_deterministic:true,provider_dispatch:false,usage_write:false,answer_id:answer.id,copy_mode:answer.copy_mode,available_after_tour:!state.open};
    };return true;
  }
  function uninstallTeacherSendAdapter(){cancelTeacherTurn();/* Keep the local guard for retained threads and retired IDs. Ordinary threads still delegate. */}
  function prepareTeacherPractice(){
    openChatSurface();installTeacherSendAdapter();setTeacherPlaceholder();var d=window.PM_DEMO;
    if(!d||!d.chat||typeof d.chat.newThread!=='function')return false;
    if(!state.teacher_thread_id){
      var created=d.chat.newThread('teacher');state.teacher_thread_id=created&&created.threadId||null;
      if(state.teacher_thread_id&&d.state.chat.threads[state.teacher_thread_id]){var thread=d.state.chat.threads[state.teacher_thread_id];thread.title='Guided example · Teacher';thread.guided_example=true;guidedThreadIds[state.teacher_thread_id]=true;}
      if(window.PM6_CHAT_THREADS&&state.teacher_thread_id)window.PM6_CHAT_THREADS[state.teacher_thread_id].title='Guided example · Teacher';
      document.querySelectorAll('.chat-thread-item[data-thread="'+state.teacher_thread_id+'"] .thread-title').forEach(function(node){node.textContent='Guided example · Teacher';});
      // Re-enter through the existing thread switcher after the title is set;
      // changing only the roster model left the mounted header saying New thread.
      var row=document.querySelector('.chat-thread-item[data-thread="'+state.teacher_thread_id+'"]');if(row)row.click();
      document.querySelectorAll('#chatPanel .pm6-chat-sys,#floatingChat .pm6-chat-sys').forEach(function(node){if(node.textContent.indexOf('New thread')===0)node.textContent='Guided example · Replies are built into this tour. No online AI service is used.';});
    }
    return !!(state.teacher_thread_id&&d.state.chat.threads[state.teacher_thread_id]);
  }
  function sendGuidedComposer(event){
    var target=event.target,d=window.PM_DEMO;if(!target||!target.closest||!d||!d.state||!d.state.chat)return;
    var input=event.type==='keydown'&&target.matches('.pm6-chat-input')?target:null;
    if(event.type==='keydown'&&(!input||event.key!=='Enter'||event.shiftKey||event.isComposing))return;
    if(event.type==='click'){var button=target.closest('.pm6-chat-send');if(!button)return;var host=button.closest('#chatPanel,#floatingChat');input=host&&host.querySelector('.pm6-chat-input');}
    if(!input||!input.closest('#chatPanel,#floatingChat'))return;
    var id=d.state.chat.activeThread,thread=d.state.chat.threads[id];if(!guidedThreadIds[id]&&!(thread&&thread.guided_example===true))return;
    // Capture before the ordinary composer's /web parser or queue shortcuts.
    // Deterministic guided text must never become a tool or provider request.
    event.preventDefault();event.stopImmediatePropagation();installTeacherSendAdapter();
    var result=d.chat.send(id,input.value);if(result&&result.ok){input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));}
    else if(result&&result.toast){state.last_error=result.toast;if(state.open)render('forward');}
  }
  document.addEventListener('keydown',sendGuidedComposer,true);
  document.addEventListener('click',sendGuidedComposer,true);
  function fillTeacherQuestion(){var input=visibleTarget('#chatPanel .pm6-chat-input,#floatingChat .pm6-chat-input');if(!input)return false;input.value=AUTHORITATIVE_PROMPT;input.dispatchEvent(new Event('input',{bubbles:true}));try{input.focus({preventScroll:true});}catch(error){}return true;}
  function applyTeacherMode(){var d=window.PM_DEMO,thread=d&&d.state&&d.state.chat&&d.state.chat.threads[state.teacher_thread_id],answer=guidedTeacherAnswer(state.teacher_last_prompt||AUTHORITATIVE_PROMPT),html=answer.html;if(thread&&Number.isFinite(state.teacher_response_index)&&thread.messages[state.teacher_response_index])thread.messages[state.teacher_response_index].html=html;var sink=document.querySelector('[data-pm6-mid="'+state.teacher_response_message_id+'"] .pm6-chat-sink,[data-pm7gt-teacher-response="true"]');if(sink)sink.textContent=html;state.teacher_answer_id=answer.id;state.teacher_copy_mode=answer.copy_mode;return !!sink;}
  function syncEli5(){eli5Button.setAttribute('aria-pressed',String(state.eli5_enabled));eli5Button.textContent=state.eli5_enabled?'ELI5: On':'ELI5: Off';eli5Button.setAttribute('data-pm-hover-label',state.eli5_enabled?'Use regular wording':'Use simpler wording');eli5Button.setAttribute('data-pm-hover-detail',state.eli5_enabled?'Return to the fuller explanation.':'Keep the same meaning with fewer, friendlier words.');document.querySelectorAll('#chatPanel .toggle-eli5,#floatingChat .toggle-eli5').forEach(function(toggle){toggle.classList.toggle('active',state.eli5_enabled);});}
  function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(character){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character];});}
  var STEP_COPY={
    'tour.intro.comfort':{kicker:'A short guided film',title:'Let’s make Puppet Master feel familiar.',normal:'You’ll try a few real actions. This guided example does not change your files or use your AI plan.',eli5:'We will practice together. Nothing here changes your files or uses your AI plan.',note:'Want gentler movement or simpler words? Reduced Motion is in Settings, and ELI5 stays at the top of this tour.'},
    'tour.chat.open':{kicker:'Ask and understand',title:'Meet Assistant Chat.',normal:'Assistant Chat begins at the far right, where you can ask for help without leaving what you are doing.',eli5:'Assistant Chat waits on the right so help stays beside your work.',success:'Assistant Chat is ready.'},
    'tour.chat.teacher.select':{kicker:'Ask and understand',title:'Choose Teacher.',normal:'Teacher explains the screen you are on, an unfamiliar term, or why a choice matters.',eli5:'Teacher explains what you see and why a choice matters.',success:'Teacher is listening.'},
    'tour.chat.teacher.ask':{kicker:'Ask and understand',title:'Ask the example question.',normal:'Send “What happens before Puppet Master changes my files?” The answer is built into this guide and uses no online AI service.',eli5:'Send the example question. Its answer is already in this guide, so it costs nothing.',success:'Teacher answered inside Assistant Chat.'},
    'tour.chat.teacher.reply':{kicker:'Teacher answered',title:'A useful answer stays close to the work.',normal:AUTHORITATIVE_ANSWER.normal,eli5:AUTHORITATIVE_ANSWER.eli5,note:'This thread is labeled as a guided example. After the tour, Teacher can explain many more Puppet Master topics.'},
    'tour.chat.teacher.eli5':{kicker:'Choose your reading style',title:'Try ELI5.',normal:'ELI5 makes the same answer shorter and clearer without changing what it means.',eli5:'ELI5 uses fewer, simpler words but keeps the same meaning.',success:'The same answer is now easier to read.'},
    'tour.workspace.navigation':{kicker:'Make the workspace yours',title:'Pages and panels do different jobs.',normal:'The tabs across the top change your main page. Panels such as Assistant Chat can stay beside you as you move around.',eli5:'Top tabs change the main page. Side panels can follow you.'},
    'tour.workspace.chat.dock':{kicker:'Make the workspace yours',title:'Move Assistant Chat.',normal:'Drag Assistant Chat toward the highlighted side. The same conversation stays with you; only its place changes.',eli5:'Move Chat to the highlighted side. The messages stay the same.',success:'Assistant Chat moved and kept the same conversation.'},
    'tour.workspace.panels.rearrange':{kicker:'Make the workspace yours',title:'Rearrange one more panel.',normal:'Use a panel’s move handle to put the tools you need next to each other. Your project files do not move.',eli5:'Move one panel. Only the window moves, not your files.',success:'The panel moved to its new place.'},
    'tour.workspace.usage.open':{kicker:'Make the workspace yours',title:'Open Usage.',normal:'Usage gathers activity, limits, and cost signals into cards. Moving a card never changes the work it reports.',eli5:'Usage is a page of gauges. Moving a gauge does not change your work.',success:'Usage is open.'},
    'tour.workspace.widget.manage':{kicker:'Make the workspace yours',title:'Keep a useful card nearby.',normal:'Add or resize a card so the information you check often is easy to glance at while planning.',eli5:'Put one useful card where it is easy to see.',success:'The card changed through its real widget controls.'},
    'tour.planning.open':{kicker:'Plan before building',title:'Open Planning Wizard.',normal:'Planning Wizard turns a rough idea into a plan you can inspect before any work begins.',eli5:'Planning Wizard turns your idea into steps you can check first.',success:'Planning Wizard is open.'},
    'tour.planning.project_source':{kicker:'Plan before building',title:'Choose the project for this practice.',normal:'The Wizard keeps every decision attached to the right Project. Choose the local practice Project.',eli5:'Choose which Project this practice belongs to.',success:'The practice Project is selected.'},
    'tour.planning.goal':{kicker:'Plan before building',title:'Describe the outcome in one sentence.',normal:'Use the book-club example. A clear result is more useful than a list of technical instructions.',eli5:'Say what you want to make. One clear sentence is enough.',success:'The idea is ready to turn into outcomes.'},
    'tour.planning.guided_help':{kicker:'Plan before building',title:'Choose guided planning.',normal:'Guided planning asks only the decisions that can change the result and explains why each one matters.',eli5:'Guided planning asks one useful question at a time.',success:'Guided planning is selected.'},
    'tour.planning.requirements':{kicker:'Plan before building',title:'Turn the idea into outcomes.',normal:'Open the outcome view and check that it describes what visitors should be able to do.',eli5:'See the three things the finished site should do.',success:'Three clear outcomes are visible.'},
    'tour.planning.question':{kicker:'Plan before building',title:'Answer the question that changes the result.',normal:'Choose who should be able to update the meeting and book. This affects whether shared sign-in and editing are needed.',eli5:'Choose who can change the meeting and book.',success:'Your decision is part of the plan.'},
    'tour.planning.why':{kicker:'Plan before building',title:'See why the question matters.',normal:WHY_COPY,eli5:'This answer decides whether other people need a safe way to sign in and edit.',success:'The reason is visible beside the decision.'},
    'tour.planning.review':{kicker:'Plan before building',title:'Review before anything starts.',normal:'Check the outcomes, decisions, assumptions, and anything that is still uncertain.',eli5:'Read what Puppet Master understood before it starts.',success:'The complete practice plan is open for review.'},
    'tour.planning.edit':{kicker:'Plan before building',title:'Change one answer and watch the plan react.',normal:'Choose Edit, then select a different answer about who can update the site. Only shared sign-in and organizer access should change; the three outcomes stay still.',eli5:'Choose Edit, then change who can update the site. Only the related part of the plan should move.',success:'One answer changed one consequence.'},
    'tour.planning.consequence':{kicker:'Cause and effect',title:'The unaffected outcomes stayed put.',normal:'Shared sign-in and organizer access changed because your answer changed. The meeting, book, and join outcomes did not.',eli5:'Your one answer changed one matching part. Everything else stayed still.'},
    'tour.planning.approval_boundary':{kicker:'Ready when you are',title:'This is the boundary before building.',normal:'Nothing has been built yet. That is the planning loop: describe the outcome, answer only what matters, review the plan, then decide whether to begin.',eli5:'Nothing started. You described, answered, checked, and now you decide.',note:'Your Project is ready. Start with one sentence about what you want to make or change.'}
  };
  var chapterLabels={intro:'Introduction',chat_teacher:'Ask and understand',workspace:'Make the workspace yours',planning_wizard:'Plan before building'};
  var stepBaseline=null,stepPoll=0,practiceRoot=null,practiceWidget=null,practiceWidgetId=null,workspacePanelId=null;
  function cancelStepPoll(){if(stepPoll){clearInterval(stepPoll);stepPoll=0;}}
  function clearChoreography(){choreographyTimers.forEach(clearTimeout);choreographyTimers=[];state.choreography_state='idle';root.dataset.choreography='idle';pointer.style.opacity='';}
  function scheduleChoreography(fn,delay){var timer=setTimeout(fn,delay);choreographyTimers.push(timer);return timer;}
  function currentDef(){return stepDef(state.step_id);}
  function copyForStep(){var row=STEP_COPY[state.step_id]||STEP_COPY['tour.intro.comfort'];return {kicker:row.kicker,title:row.title,body:state.eli5_enabled?row.eli5:row.normal,note:row.note||'',success:row.success||''};}
  function localActionResult(actionId,status,reason,extra){return Object.assign({schema_id:'pm.guided_tour.local_action_result.v1',action_id:actionId,step_id:state.step_id,status:status,disabled_reason:reason||null,domain_mutation:false,persistence_write:false,concept_simulation_only:true},extra||{});}
  function persistCheckpoint(){try{sessionStorage.setItem('pm7:guided-tour:checkpoint:v3',JSON.stringify({schema_id:'pm.guided_tour.safe_checkpoint.v1',step_id:state.step_id,eli5_enabled:state.eli5_enabled,status:state.status,source:state.source}));}catch(error){}}
  function clearCheckpoint(){try{sessionStorage.removeItem('pm7:guided-tour:checkpoint:v3');}catch(error){}}
  function savedCheckpoint(){try{var value=JSON.parse(sessionStorage.getItem('pm7:guided-tour:checkpoint:v3')||'null');return value&&value.schema_id==='pm.guided_tour.safe_checkpoint.v1'&&STEP_BY_ID[value.step_id]?value:null;}catch(error){return null;}}
  function ownerActionEvent(actionId,payload){var detail=Object.assign({schema_id:'pm.guided_tour.owner_action.v1',action_id:actionId,step_id:state.step_id,mode:state.action_mode||'try',concept_simulation_only:true,production_receipt:false},payload||{});window.dispatchEvent(new CustomEvent('pm7.guided-tour.owner-action',{detail:detail}));return detail;}
  function pageIs(page){return !!(window.PM_PAGES&&window.PM_PAGES.current===page)||!!document.querySelector('.page-tab.active[data-page="'+page+'"]');}
  function goPage(page){var tab=visibleTarget('.page-tab[data-page="'+page+'"]');if(tab)tab.click();else if(window.PM_PAGES&&typeof window.PM_PAGES.go==='function')window.PM_PAGES.go(page);return pageIs(page);}
  function chatSurfaceRecord(){var api=window.PM_HOME_WORKSPACE;return api&&homeSurface('chat',api.layout);}
  function chatMoved(){var now=chatSurfaceRecord();return !!(stepBaseline&&stepBaseline.chat&&now&&(now.host!==stepBaseline.chat.host||now.slot_index!==stepBaseline.chat.slot_index));}
  function movablePanel(){var api=window.PM_HOME_WORKSPACE,surfaces=api&&api.layout&&api.layout.surfaces||[],row=surfaces.filter(function(item){return item.visible&&item.surface_instance_id!=='chat';})[0]||null;workspacePanelId=row&&row.surface_instance_id||null;return row;}
  function panelMoved(){var api=window.PM_HOME_WORKSPACE,now=api&&homeSurface(workspacePanelId,api.layout);return !!(stepBaseline&&stepBaseline.panel&&now&&(now.host!==stepBaseline.panel.host||now.slot_index!==stepBaseline.panel.slot_index));}
  function alternateHost(surface){var api=window.PM_HOME_WORKSPACE,hosts=Object.keys(api&&api.host_registries||{}),preferred=['dock_right','home_right','home_main','dock_left','floating'];for(var i=0;i<preferred.length;i+=1)if(hosts.indexOf(preferred[i])>=0&&preferred[i]!==surface.host)return preferred[i];return hosts.filter(function(host){return host!==surface.host;})[0]||surface.host;}
  function moveWorkspaceSurface(id){var api=window.PM_HOME_WORKSPACE,surface=api&&homeSurface(id,api.layout);if(!api||!surface||typeof api.moveSurface!=='function')return false;var host=alternateHost(surface),before=clone(surface);api.moveSurface(id,host,{index:0});var after=homeSurface(id,api.layout),ok=!!after&&(after.host!==before.host||after.slot_index!==before.slot_index);ownerActionEvent('cmd.workspace_layout.move_surface',{surface_instance_id:id,from_host:before.host,to_host:host,success:ok});return ok;}
  function chooseUsageWidget(){var api=window.PM7_USAGE;if(!api||!api.state)return null;var rows=typeof api.roomWidgets==='function'?api.roomWidgets(api.state.room):[],hidden=rows.filter(function(item){return api.state.hidden[api.state.room+':'+item.id];})[0],visible=rows.filter(function(item){return !api.state.hidden[api.state.room+':'+item.id];})[0];return hidden||visible||null;}
  function usageWidgetReady(){var item=practiceWidgetId&&window.PM7_USAGE&&window.PM7_USAGE.widgetById&&window.PM7_USAGE.widgetById(practiceWidgetId),card=item&&document.querySelector('#pm7uBoard .pm7u-card[data-widget="'+practiceWidgetId+'"]');if(!item||!card)return false;var layout=window.PM7_USAGE.layoutFor&&window.PM7_USAGE.layoutFor(item);return !!layout&&!!stepBaseline&&!!stepBaseline.widget&&(layout.cols!==stepBaseline.widget.cols||layout.rows!==stepBaseline.widget.rows||stepBaseline.widget.hidden);}
  function configureUsageWidget(){var api=window.PM7_USAGE,item=chooseUsageWidget();if(!api||!item)return false;practiceWidgetId=item.id;state.active_widget_id=item.id;var key=api.state.room+':'+item.id,hidden=!!api.state.hidden[key];if(hidden){setUsageVisible(item.id,true);ownerActionEvent('cmd.widget.add',{widget_id:item.id,success:!api.state.hidden[key]});return !api.state.hidden[key];}var before=api.layoutFor(item),presets=api.sizePresets?api.sizePresets(item):[],next=presets.filter(function(row){return row[0]!==before.cols||row[1]!==before.rows;})[0];if(!next)next=[Math.min((before.cols||2)+1,6),before.rows||2];api.setLayout(item,next[0],next[1],'cmd.widget.configure','guided_tour');var after=api.layoutFor(item),ok=after.cols!==before.cols||after.rows!==before.rows;ownerActionEvent('cmd.widget.configure',{widget_id:item.id,before:before,after:after,success:ok});return ok;}
  var practiceModel=createGuidedPlanningPractice({goal:BOOK_CLUB_GOAL});
  function freshPlanningFixture(){return practiceModel.create();}
  function practiceButton(action,label,extra){
    return '<button type="button" data-ui-action-id="ui.guided_tour.next" data-practice-action="'+action+'" '+(extra||'')+' data-pm-hover-label="'+esc(label)+'" data-pm-hover-detail="Use this choice in the local guided example.">'+esc(label)+'</button>';
  }
  function planningFixtureMarkup(){
    var f=planningFixture||freshPlanningFixture(),view=practiceModel.view(f);
    var outcomes=f.outcomes_visible?'<section data-practice-key="outcomes" class="pm7gt-practice-outcomes" data-tour-fixture-id="planning-outcomes"><strong>What success looks like</strong>'+BOOK_CLUB_OUTCOMES.map(function(item,index){return '<div data-practice-key="outcome-'+index+'">'+esc(item)+'</div>';}).join('')+'</section>':'';
    var question=f.outcomes_visible?'<section data-practice-key="question" class="pm7gt-practice-question" data-tour-fixture-id="planning-question" data-editing="'+String(f.editing)+'"><strong>Who should be able to update the meeting and book?</strong><div class="pm7gt-practice-choices">'+[['me','Only me.'],['organizers','A few organizers.'],['unsure','I’m not sure yet.']].map(function(row){
      return practiceButton('answer',row[1],'data-practice-key="answer-'+row[0]+'" data-practice-value="'+row[0]+'" aria-pressed="'+String(f.answer===row[0])+'"'+(f.editing&&row[0]===f.edit_from?' disabled':''));
    }).join('')+'</div>'+(f.editing?'<p data-practice-key="edit-instruction" class="pm7gt-practice-why" role="status">Choose a different answer. The review below will show exactly what changes.</p>':'')+
      (f.why_visible?'<p data-practice-key="why" class="pm7gt-practice-why" role="note">'+esc(WHY_COPY)+'</p>':practiceButton('why','Why this matters','data-practice-key="why" class="pm7gt-practice-link"'))+'</section>':'';
    var review=f.review_visible?'<section data-practice-key="review" class="pm7gt-practice-review" data-tour-fixture-id="planning-review"><header><strong>Plan review</strong><span>Nothing has been built</span></header>'+
      '<div data-practice-key="review-outcomes"><small>OUTCOMES</small><b>3 clear results</b></div>'+
      '<div data-practice-key="review-decision"><small>DECISION</small><b>'+esc(view.decision)+'</b></div>'+
      '<div data-practice-key="review-access" data-tour-fixture-id="planning-shared-access" data-state="'+view.access_state+'" data-consequence-revision="'+f.consequence_revision+'"><small>SHARED ACCESS</small><b>'+esc(view.access)+'</b></div>'+
      '<div data-practice-key="review-assumptions"><small>ASSUMPTION</small><b>'+esc(view.assumption)+'</b></div>'+
      '<div data-practice-key="review-uncertain"><small>UNRESOLVED CHOICES</small><b>'+esc(view.unresolved)+'</b></div>'+
      practiceButton('edit',f.editing?'Choose your new answer above':'Edit who can update it','data-practice-key="review-edit"'+(f.editing?' disabled':''))+'</section>':'';
    var goal=f.goal_submitted?'<div data-practice-key="goal" class="pm7gt-practice-goal is-set" data-tour-fixture-id="planning-goal"><small>Your practice goal</small><strong>'+esc(f.goal)+'</strong></div>':
      '<label data-practice-key="goal" class="pm7gt-practice-goal" data-tour-fixture-id="planning-goal"><span>What would you like to make?</span><textarea rows="3" data-practice-goal data-pm-hover-label="Practice goal" data-pm-hover-detail="Describe the result in everyday words.">'+esc(f.goal)+'</textarea>'+practiceButton('goal','Use this idea')+'</label>';
    return '<header data-practice-key="head" class="pm7gt-practice-head"><span>PLANNING WIZARD · GUIDED EXAMPLE</span><strong>Neighborhood book club</strong><small>Local practice · no files changed · no work started</small></header><div data-practice-key="body" class="pm7gt-practice-body">'+
      '<button type="button" data-practice-key="project" class="pm7gt-practice-project" data-ui-action-id="ui.guided_tour.next" data-practice-action="project" aria-pressed="'+String(f.project_selected)+'" data-pm-hover-label="Choose the practice Project" data-pm-hover-detail="Keep these practice decisions together in the local guided example."><span>Project</span><strong>'+(f.project_selected?'Book club · selected':'Choose Book club')+'</strong></button>'+goal+
      '<button type="button" data-practice-key="guided" class="pm7gt-practice-guided" data-ui-action-id="ui.guided_tour.next" data-practice-action="guided" aria-pressed="'+String(f.guided_selected)+'" data-pm-hover-label="Use guided planning" data-pm-hover-detail="Ask only decisions that can change the result."><span>Planning style</span><strong>'+(f.guided_selected?'Guided planning · selected':'Use guided planning')+'</strong></button>'+
      (f.goal_submitted&&f.guided_selected&&!f.outcomes_visible?practiceButton('outcomes','Show the outcomes','data-practice-key="open-outcomes" class="pm7gt-practice-primary"'):'')+outcomes+question+
      (f.answer&&!f.review_visible?practiceButton('review','Review this plan','data-practice-key="open-review" class="pm7gt-practice-primary"'):'')+review+'</div>';
  }
  function ensurePlanningFixture(){
    if(practiceRoot&&practiceRoot.isConnected)return practiceRoot;
    var host=document.getElementById('panel-wizard');if(!host)return null;
    planningFixture=planningFixture||freshPlanningFixture();host.classList.add('pm7gt-practice-host');
    practiceRoot=document.createElement('section');practiceRoot.id='pm7gt-planning-practice';practiceRoot.className='pm7gt-planning-practice';
    practiceRoot.setAttribute('data-concept-fixture-only','true');practiceRoot.setAttribute('aria-label','Guided Planning Wizard example');
    practiceRoot.innerHTML=planningFixtureMarkup();host.appendChild(practiceRoot);return practiceRoot;
  }
  function updatePracticeTree(current,next){
    if(current.isEqualNode(next))return current;
    if(current.nodeType!==next.nodeType||current.nodeName!==next.nodeName){var replacement=next.cloneNode(true);current.replaceWith(replacement);return replacement;}
    if(current.nodeType!==1){current.nodeValue=next.nodeValue;return current;}
    [].slice.call(current.attributes).forEach(function(attr){if(!next.hasAttribute(attr.name))current.removeAttribute(attr.name);});
    [].slice.call(next.attributes).forEach(function(attr){if(current.getAttribute(attr.name)!==attr.value)current.setAttribute(attr.name,attr.value);});
    var prior=[].slice.call(current.childNodes),used=[];
    [].slice.call(next.childNodes).forEach(function(want,index){
      var key=want.nodeType===1&&want.getAttribute('data-practice-key'),have=key?prior.find(function(node){return node.nodeType===1&&node.getAttribute('data-practice-key')===key;}):prior[index];
      if(have&&(used.indexOf(have)>=0||(!key&&have.nodeType===1&&have.hasAttribute('data-practice-key'))))have=null;
      if(have){used.push(have);if(current.childNodes[index]!==have)current.insertBefore(have,current.childNodes[index]||null);updatePracticeTree(have,want);}
      else current.insertBefore(want.cloneNode(true),current.childNodes[index]||null);
    });
    prior.forEach(function(node){if(used.indexOf(node)<0&&node.parentNode===current)node.remove();});
    return current;
  }
  function renderPlanningFixture(){
    var node=ensurePlanningFixture();if(!node)return null;
    var template=document.createElement('section');template.innerHTML=planningFixtureMarkup();
    var before=node.querySelector('[data-tour-fixture-id="planning-shared-access"]'),revision=before&&before.getAttribute('data-consequence-revision');
    [].slice.call(template.children).forEach(function(next){var current=node.querySelector(':scope > [data-practice-key="'+next.getAttribute('data-practice-key')+'"]');if(current)updatePracticeTree(current,next);else node.appendChild(next.cloneNode(true));});
    var consequence=node.querySelector('[data-tour-fixture-id="planning-shared-access"]');
    if(consequence&&revision!==null&&revision!==consequence.getAttribute('data-consequence-revision')){
      consequence.classList.remove('pm7gt-practice-changed');void consequence.offsetWidth;consequence.classList.add('pm7gt-practice-changed');
    }
    return node;
  }
  function removePlanningFixture(){var host=document.getElementById('panel-wizard');if(practiceRoot&&practiceRoot.isConnected)practiceRoot.remove();if(host)host.classList.remove('pm7gt-practice-host');practiceRoot=null;}
  function planningAction(action,value){
    planningFixture=planningFixture||freshPlanningFixture();
    if(action==='goal'){var input=practiceRoot&&practiceRoot.querySelector('[data-practice-goal]');value=input?input.value:planningFixture.goal;}
    var result=practiceModel.apply(planningFixture,action,value);
    if(!result.ok){state.last_error=result.error;return false;}
    planningFixture=result.state;
    Object.assign(state,{planning_project_selected:planningFixture.project_selected,planning_goal:planningFixture.goal_submitted?planningFixture.goal:'',
      planning_answer:planningFixture.answer,planning_why_open:planningFixture.why_visible,planning_reviewed:planningFixture.review_visible,
      planning_edited:planningFixture.edited,planning_consequence_visible:planningFixture.edited&&!planningFixture.editing,planning_requirements_opened:planningFixture.outcomes_visible});
    renderPlanningFixture();
    if(action==='edit'){
      var choice=practiceRoot&&practiceRoot.querySelector('[data-practice-action="answer"]:not([disabled])');
      if(choice){choice.scrollIntoView({block:'nearest'});if(state.action_mode!=='show_me')choice.focus({preventScroll:true});}
    }
    ownerActionEvent(({project:'wizard.attach',goal:'wizard.practice_goal',guided:'wizard.intent',outcomes:'wizard.to_requirements',answer:'wizard.practice_answer',why:'wizard.practice_why',review:'wizard.practice_review',edit:'wizard.practice_edit'})[action]||'ui.guided_tour.next',{fixture_action:action,value:value||null,editing:planningFixture.editing,consequence_revision:planningFixture.consequence_revision,work_started:false});
    scheduleTargetTracking();return true;
  }
  function planningPredicate(id){var f=planningFixture||{};return id==='tour.planning.project_source'?!!f.project_selected:id==='tour.planning.goal'?!!f.goal_submitted:id==='tour.planning.guided_help'?!!f.guided_selected:id==='tour.planning.requirements'?!!f.outcomes_visible:id==='tour.planning.question'?!!f.answer:id==='tour.planning.why'?!!f.why_visible:id==='tour.planning.review'?!!f.review_visible:id==='tour.planning.edit'?!!f.edited&&!f.editing:false;}
  var TEACHER_SUGGESTIONS=['What are the main parts of Puppet Master?','How do I rearrange panels?','What does Planning do?','Can I use Safe History with GitHub?','What is a Server?','How does local discovery work?'];
  var TEACHER_MORE_GROUPS=[
    {label:'Projects and save points',questions:['How do I open a folder on this computer?','How do I bring a project from online?','What is the difference between Git and Jujutsu?','What does FileSafe protect?','How do I restore a backup?','How does Cursor Origin work?']},
    {label:'Computers and connections',questions:['Can Storage live on a different computer?','How do I connect through Tailscale?','How does Headscale differ?','What is a reverse proxy?','How does Remote Link work?','How does a VPN help?']},
    {label:'Planning and the work',questions:['What should I put in requirements?','When does work actually begin?','How do I read a plan before approving it?','What does a run show me?','How do I stop something safely?','Where do I see errors?']},
    {label:'Comfort and safety',questions:['What does ELI5 change?','How do I use calmer motion?','How do permissions keep me safe?','What can Teacher explain?','When should I use Settings?','When should I use Doctor?']}
  ];
  function teacherQuestionButton(question){return '<li><button type="button" data-ui-action-id="ui.guided_tour.next" data-teacher-question="'+esc(question)+'" data-pm-hover-label="Ask Teacher" data-pm-hover-detail="Send this built-in question without using an online AI service.">'+esc(question)+'</button></li>';}
  function teacherQuestionsMarkup(){return '<details class="pm7gt-question-more"><summary>See 30 example questions</summary><ul class="pm7gt-question-list"><li class="pm7gt-question-group">Good starting points</li>'+TEACHER_SUGGESTIONS.map(teacherQuestionButton).join('')+TEACHER_MORE_GROUPS.map(function(group){return '<li class="pm7gt-question-group">'+esc(group.label)+'</li>'+group.questions.map(teacherQuestionButton).join('');}).join('')+'</ul></details><p class="pm7gt-question-count">Teacher knows 46 built-in Puppet Master topics and works without an online AI account.</p>';}
  function closeTeacherPicker(){var portal=document.querySelector('.pm6-chat-persona-popout-portal.is-open'),button=document.querySelector('#chatPanel .pm6-chat-personabtn,#floatingChat .pm6-chat-personabtn');if(portal&&button)button.click();return !document.querySelector('.pm6-chat-persona-popout-portal.is-open');}
  function placeChatRight(){var api=window.PM_HOME_WORKSPACE,chat=api&&homeSurface('chat',api.layout);if(!api||!chat)return false;if(!chat.visible&&api.setSurfaceVisible)api.setSurfaceVisible('chat',true,'cmd.panel.switch');chat=homeSurface('chat',api.layout);if(chat&&chat.host!=='dock_right'&&api.moveSurface){var hosts=Object.keys(api.host_registries||{});if(hosts.indexOf('dock_right')>=0)api.moveSurface('chat','dock_right',{index:0});}openChatSurface();return !!activeChat();}
  function fillTeacherQuestionText(question){var input=visibleTarget('#chatPanel .pm6-chat-input,#floatingChat .pm6-chat-input');if(!input)return false;input.value=String(question||AUTHORITATIVE_PROMPT);input.dispatchEvent(new Event('input',{bubbles:true}));try{input.focus({preventScroll:true});}catch(error){}return true;}
  function sendTeacherQuestion(question){prepareTeacherPractice();fillTeacherQuestionText(question);var send=visibleTarget('#chatPanel .pm6-chat-send,#floatingChat .pm6-chat-send');if(send){send.click();return true;}var input=visibleTarget('#chatPanel .pm6-chat-input,#floatingChat .pm6-chat-input');if(input){input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',bubbles:true,cancelable:true}));return true;}return false;}
  function toggleEli5(force){var before=state.eli5_enabled;state.eli5_enabled=typeof force==='boolean'?force:!before;syncEli5();if(state.teacher_response_message_id)applyTeacherMode();ownerActionEvent('cmd.chat.eli5.set',{enabled:state.eli5_enabled,meaning_preserved:true});recordUi('ui.guided_tour.toggle_eli5',{enabled:state.eli5_enabled});return state.eli5_enabled!==before||state.eli5_enabled===force;}
  function stepTargetSelector(id){
    if(id==='tour.chat.open')return '#chatPanel:not(.hidden),#floatingChat';
    if(id==='tour.chat.teacher.select')return '.pm6-chat-persona-popout-portal.is-open .pm6-chat-personaitem[data-persona="Teacher"],#chatPanel .pm6-chat-personabtn,#floatingChat .pm6-chat-personabtn';
    if(id==='tour.chat.teacher.ask')return '#chatPanel .pm6-chat-send,#floatingChat .pm6-chat-send,#chatPanel .pm6-chat-input,#floatingChat .pm6-chat-input';
    if(id==='tour.chat.teacher.reply')return state.teacher_response_message_id?'[data-pm6-mid="'+state.teacher_response_message_id+'"] .pm6-chat-sink,[data-pm7gt-teacher-response="true"]':'#chatPanel .messageStream,#floatingChat .messageStream';
    if(id==='tour.chat.teacher.eli5')return '#pm7gt-eli5';
    if(id==='tour.workspace.navigation')return '.title-bar .page-tabs,.page-tabs';
    if(id==='tour.workspace.chat.dock')return '[data-pm-home-handle="chat"],[data-pm-home-surface="chat"]';
    if(id==='tour.workspace.panels.rearrange')return workspacePanelId?'[data-pm-home-handle="'+workspacePanelId+'"],[data-pm-home-surface="'+workspacePanelId+'"]':'[data-pm-home-host="home_main"]';
    if(id==='tour.workspace.usage.open')return '.page-tab[data-page="usage"],#tab-usage';
    if(id==='tour.workspace.widget.manage')return practiceWidgetId?'#pm7uBoard .pm7u-card[data-widget="'+practiceWidgetId+'"] .pm7u-cardmenu,#pm7uBoard .pm7u-card[data-widget="'+practiceWidgetId+'"],#pm7uCustomize':'#pm7uCustomize,#pm7uBoard';
    if(id==='tour.planning.open')return '.page-tab[data-page="wizard"],#tab-wizard';
    if(id==='tour.planning.project_source')return '#pm7gt-planning-practice [data-practice-action="project"]';
    if(id==='tour.planning.goal')return '#pm7gt-planning-practice [data-practice-action="goal"],#pm7gt-planning-practice [data-practice-goal]';
    if(id==='tour.planning.guided_help')return '#pm7gt-planning-practice [data-practice-action="guided"]';
    if(id==='tour.planning.requirements')return '#pm7gt-planning-practice [data-practice-action="outcomes"]';
    if(id==='tour.planning.question')return '#pm7gt-planning-practice .pm7gt-practice-choices';
    if(id==='tour.planning.why')return '#pm7gt-planning-practice [data-practice-action="why"],#pm7gt-planning-practice .pm7gt-practice-why';
    if(id==='tour.planning.review')return '#pm7gt-planning-practice [data-practice-action="review"]';
    if(id==='tour.planning.edit')return planningFixture&&planningFixture.editing?'#pm7gt-planning-practice .pm7gt-practice-choices':'#pm7gt-planning-practice [data-practice-action="edit"]';
    if(id==='tour.planning.consequence')return '#pm7gt-planning-practice [data-tour-fixture-id="planning-shared-access"]';
    if(id==='tour.planning.approval_boundary')return '#pm7gt-planning-practice .pm7gt-practice-review,#pm7gt-planning-practice';
    return '';
  }
  function prepareStep(def){
    cancelStepPoll();clearChoreography();stepBaseline=null;state.action_mode=null;state.action_status=stepIsComplete(def.id)?'complete':'idle';state.last_error=null;root.dataset.actionMode=state.action_status;
    if(def.id.indexOf('tour.chat.')===0){placeChatRight();installTeacherSendAdapter();setTeacherPlaceholder();}
    if(def.id==='tour.chat.teacher.select'){var picker=visibleTarget('#chatPanel .pm6-chat-personabtn,#floatingChat .pm6-chat-personabtn');if(picker&&!document.querySelector('.pm6-chat-persona-popout-portal.is-open'))picker.click();mountTeacherPersonaControl();}
    if(def.id==='tour.chat.teacher.ask'){selectPersona('Teacher');state.teacher_persona_selected=true;prepareTeacherPractice();fillTeacherQuestion();}
    if(def.id==='tour.workspace.navigation'){closeTeacherPicker();goPage('dashboard');}
    if(def.id==='tour.workspace.chat.dock'){goPage('dashboard');var chat=chatSurfaceRecord();stepBaseline={chat:clone(chat)};}
    if(def.id==='tour.workspace.panels.rearrange'){goPage('dashboard');var panel=movablePanel();stepBaseline={panel:clone(panel)};}
    if(def.id==='tour.workspace.widget.manage'){goPage('usage');if(window.PM7_USAGE&&window.PM7_USAGE.rerender)window.PM7_USAGE.rerender();var widget=chooseUsageWidget();practiceWidgetId=widget&&widget.id||null;var hidden=!!(widget&&window.PM7_USAGE.state.hidden[window.PM7_USAGE.state.room+':'+widget.id]),layout=widget&&window.PM7_USAGE.layoutFor(widget);stepBaseline={widget:{id:practiceWidgetId,hidden:hidden,cols:layout&&layout.cols,rows:layout&&layout.rows}};}
    if(def.id.indexOf('tour.planning.')===0&&def.id!=='tour.planning.open'){goPage('wizard');ensurePlanningFixture();renderPlanningFixture();}
    syncCompatibility();persistCheckpoint();var mounted=mountedTarget(stepTargetSelector(def.id));if(mounted&&mounted.scrollIntoView)mounted.scrollIntoView({block:'nearest',inline:'nearest'});setTimeout(function(){activeTarget=targetAdapter.resolve(def.id);scheduleTargetTracking();},0);
  }
  function stepPredicate(id){
    if(id==='tour.chat.teacher.select'){var label=document.querySelector('#chatPanel .persona-label,#floatingChat .persona-label');return !!(label&&label.textContent.trim()==='Teacher');}
    if(id==='tour.chat.teacher.ask')return !!state.teacher_message_sent;
    if(id==='tour.chat.teacher.eli5')return !!state.eli5_enabled&&state.teacher_copy_mode==='eli5';
    if(id==='tour.workspace.chat.dock')return chatMoved();
    if(id==='tour.workspace.panels.rearrange')return panelMoved();
    if(id==='tour.workspace.usage.open')return pageIs('usage');
    if(id==='tour.workspace.widget.manage')return usageWidgetReady();
    if(id==='tour.planning.open')return pageIs('wizard');
    if(id.indexOf('tour.planning.')===0)return planningPredicate(id);
    return false;
  }
  function performOwnerAction(def){
    var ok=false,action=def.action_id;
    if(def.id==='tour.chat.teacher.select'){ok=selectPersona('Teacher');state.teacher_persona_selected=ok;}
    else if(def.id==='tour.chat.teacher.ask')ok=sendTeacherQuestion(AUTHORITATIVE_PROMPT);
    else if(def.id==='tour.chat.teacher.eli5')ok=toggleEli5(true);
    else if(def.id==='tour.workspace.chat.dock')ok=moveWorkspaceSurface('chat');
    else if(def.id==='tour.workspace.panels.rearrange')ok=!!workspacePanelId&&moveWorkspaceSurface(workspacePanelId);
    else if(def.id==='tour.workspace.usage.open'){ok=goPage('usage');ownerActionEvent(action,{page_id:'usage',success:ok});}
    else if(def.id==='tour.workspace.widget.manage')ok=configureUsageWidget();
    else if(def.id==='tour.planning.open'){ok=goPage('wizard');ownerActionEvent(action,{page_id:'wizard',success:ok});}
    else if(def.id==='tour.planning.project_source')ok=planningAction('project');
    else if(def.id==='tour.planning.goal')ok=planningAction('goal');
    else if(def.id==='tour.planning.guided_help')ok=planningAction('guided');
    else if(def.id==='tour.planning.requirements')ok=planningAction('outcomes');
    else if(def.id==='tour.planning.question')ok=planningAction('answer','organizers');
    else if(def.id==='tour.planning.why')ok=planningAction('why');
    else if(def.id==='tour.planning.review')ok=planningAction('review');
    else if(def.id==='tour.planning.edit'){
      ok=planningAction('edit');
      if(ok&&state.action_mode==='show_me'){
        var changeTo=practiceModel.view(planningFixture).edit_choice,session=sessionSerial;
        scheduleChoreography(function(){
          if(!state.open||state.step_id!==def.id||state.action_mode!=='show_me'||session!==sessionSerial)return;
          var choice=visibleTarget('#pm7gt-planning-practice [data-practice-action="answer"][data-practice-value="'+changeTo+'"]');
          if(choice){var box=choice.getBoundingClientRect();pointer.style.opacity='1';pointer.style.left=(box.left+box.width/2)+'px';pointer.style.top=(box.top+box.height/2)+'px';}
          scheduleChoreography(function(){if(choice&&choice.isConnected&&state.open&&state.step_id===def.id&&state.action_mode==='show_me'&&session===sessionSerial)choice.click();},reduced?80:560);
        },reduced?80:360);
      }
    }
    return localActionResult(action,ok?'applied':'failed',ok?null:'The highlighted action is not available yet.',{owner_action_dispatched:true,target_id:def.id,work_started:false});
  }
  var completedSteps={},autoAdvanceTimer=0;
  function clearAutoAdvance(){if(autoAdvanceTimer){clearTimeout(autoAdvanceTimer);autoAdvanceTimer=0;}}
  function stepIsComplete(id){return !!completedSteps[id];}
  function completeStep(status,metadata){
    var def=currentDef();if(status!=='applied'&&status!=='no_change'){state.action_status='failed';state.last_error=metadata&&metadata.reason||'That action did not finish. Try it again or choose Show Me.';render('forward');return snapshot();}
    if(stepIsComplete(def.id))return snapshot();
    cancelStepPoll();clearChoreography();state.action_status='complete';state.last_error=null;completedSteps[def.id]={status:status,mode:state.action_mode||'try',at:Date.now(),metadata:clone(metadata||{})};
    receipt(def.action_id,def.id,status,null,stepBaseline,{predicate:true,work_started:false},metadata&&metadata.owner_receipt||null,state.action_mode||'try',localActionResult(def.action_id,status,null,{predicate_verified:true,work_started:false}));
    render('forward');clearAutoAdvance();autoAdvanceTimer=setTimeout(function(){autoAdvanceTimer=0;if(state.open&&state.step_id===def.id)goTo(def.index+1,'forward',true);},reduced?90:560);return snapshot();
  }
  function watchCurrentPredicate(){
    cancelStepPoll();var id=state.step_id;
    function check(){if(!state.open||state.step_id!==id){cancelStepPoll();return;}var ok=false;try{ok=stepPredicate(id);}catch(error){state.last_error=String(error&&error.message||error);}if(ok)completeStep('applied',{observed_predicate:id,provider_request_delta:0,usage_delta:0,work_started:false});}
    stepPoll=setInterval(check,120);setTimeout(check,0);
  }
  function beginTry(control){var def=currentDef();if(!def.meaningful)return next();ack(control,'ui.guided_tour.next');state.action_mode='try';state.action_status='watching';state.last_error=null;root.dataset.actionMode='try';recordUi('ui.guided_tour.next',{mode:'try',step_id:def.id,owner_action_id:def.action_id});render('forward');watchCurrentPredicate();return snapshot();}
  function runShowMeAction(def){if(!state.open||state.step_id!==def.id)return;state.choreography_state='arrival';root.dataset.choreography='arrival';var result=performOwnerAction(def);state.last_result=clone(result);scheduleTargetTracking();watchCurrentPredicate();scheduleChoreography(function(){if(state.open&&state.step_id===def.id){state.choreography_state='settle';root.dataset.choreography='settle';pointer.style.opacity='0';if(result.status==='failed'&&!stepPredicate(def.id)){state.action_status='failed';state.last_error=result.disabled_reason;render('forward');}}},reduced?80:180);}
  function beginShowMe(control){
    var def=currentDef();if(!def.meaningful)return next();ack(control,'ui.guided_tour.show_me');clearChoreography();state.action_mode='show_me';state.action_status='watching';state.last_error=null;root.dataset.actionMode='show_me';recordUi('ui.guided_tour.show_me',{step_id:def.id,owner_action_id:def.action_id,same_handler:'performOwnerAction',predicate:'stepPredicate'});render('forward');
    var target=targetAdapter.resolve(def.id),calloutRect=callout.getBoundingClientRect(),targetRect=target&&target.getBoundingClientRect(),startX=Math.max(16,Math.min(innerWidth-16,calloutRect.right-28)),startY=Math.max(16,Math.min(innerHeight-16,calloutRect.bottom-24));pointer.style.left=startX+'px';pointer.style.top=startY+'px';pointer.style.opacity='1';state.choreography_state='pre_cue';root.dataset.choreography='pre_cue';
    var pre=reduced?0:90,travel=reduced?80:460;scheduleChoreography(function(){if(!state.open||state.step_id!==def.id)return;state.choreography_state='travel';root.dataset.choreography='travel';if(targetRect){pointer.style.left=(targetRect.left+targetRect.width/2)+'px';pointer.style.top=(targetRect.top+targetRect.height/2)+'px';}},pre);scheduleChoreography(function(){runShowMeAction(def);},pre+travel);return snapshot();
  }
  function stageButton(action,label,kind,extra){return '<button type="button" class="'+(kind==='primary'?'pm7gt-primary':'pm7gt-secondary')+'" data-ui-action-id="'+action+'" '+(extra||'')+'>'+esc(label)+'</button>';}
  function render(direction){
    clearTimeout(transitionTimer);reduced=motionReduced();syncCompatibility();syncEli5();var def=currentDef(),copy=copyForStep(),done=stepIsComplete(def.id),actions='',status='Ready';state.motion=direction||'forward';state.transition_serial+=1;root.dataset.stepId=def.id;root.dataset.chapter=def.chapter;root.dataset.motion=reduced?'idle':state.motion;root.dataset.actionMode=state.action_mode||'idle';
    if(def.id==='tour.planning.approval_boundary'){actions='<label class="pm7gt-note"><input type="checkbox" data-tour-keep-layout '+(state.keep_layout?'checked':'')+'> Keep this workspace arrangement</label><p class="pm7gt-note">Leave this off to restore your starting layout. Your practice plan will be cleared either way.</p>'+stageButton('ui.guided_tour.finish','Finish at Planning','primary','data-tour-action="finish"');status='No work has started';}
    else if(!def.meaningful){actions=stageButton('ui.guided_tour.next',def.index===0?'Begin with Teacher':'Continue','primary','data-tour-action="continue"');status='Take this at your pace';}
    else if(done||state.action_status==='complete'){actions=stageButton('ui.guided_tour.next','Continue','primary','data-tour-action="continue"');status=copy.success||'Done';}
    else if(state.action_status==='watching'){actions=stageButton('ui.guided_tour.show_me','Show me','secondary','data-tour-action="show"');status=state.action_mode==='show_me'?'Showing the same action':'Waiting for the highlighted control';}
    else{actions=stageButton('ui.guided_tour.next','Try it','primary','data-tour-action="try"')+stageButton('ui.guided_tour.show_me','Show me','secondary','data-tour-action="show"');status='You stay in control';}
    var note=copy.note?'<p class="pm7gt-note">'+esc(copy.note)+'</p>':'',error=state.last_error?'<p class="pm7gt-reason" role="alert">'+esc(state.last_error)+'</p>':'',questions=def.id==='tour.chat.teacher.reply'?teacherQuestionsMarkup():'';
    stage.innerHTML='<p class="pm7gt-kicker">'+esc(copy.kicker)+'</p><h2 id="pm7gt-title" tabindex="-1" data-pm-hover-exempt="programmatic-focus-landmark">'+esc(copy.title)+'</h2><p class="pm7gt-copy" id="pm7gt-copy">'+esc(done&&copy.success?copy.success:copy.body)+'</p>'+note+error+'<div class="pm7gt-actions">'+actions+'</div>'+questions;
    var clip=stage.parentElement;if(clip)clip.scrollTop=0;callout.setAttribute('aria-labelledby','pm7gt-title');callout.setAttribute('aria-describedby','pm7gt-copy');backButton.disabled=def.index===0;backButton.setAttribute('aria-disabled',String(def.index===0));progress.textContent='Step '+(def.index+1)+' of '+STEP_DEFS.length+' · '+chapterLabels[def.chapter];forwardSlot.innerHTML='<span class="pm7gt-status">'+esc(status)+'</span>';
    activeTarget=targetAdapter.resolve(def.id);positionTarget(activeTarget);scheduleTargetTracking();var heading=stage.querySelector('h2');if(!def.meaningful&&heading)try{heading.focus({preventScroll:true});}catch(error){}
    var serial=state.transition_serial,delay=reduced?80:(currentTheme().indexOf('retro')===0?timings.retro_ms:timings.step_ms);transitionTimer=setTimeout(function(){if(serial!==state.transition_serial)return;root.dataset.motion='idle';state.motion='idle';transitionTimer=0;notify();},delay);notify();
  }
  function goTo(index,direction,remember){
    clearAutoAdvance();cancelStepPoll();clearChoreography();if(index<0||index>=STEP_DEFS.length)return snapshot();var leaving=state.step_id;if(remember&&leaving)history.push(leaving);state.step_id=STEP_DEFS[index].id;state.step_index=index;state.action_mode=null;state.action_status=stepIsComplete(state.step_id)?'complete':'idle';state.last_error=null;prepareStep(STEP_DEFS[index]);render(direction||'forward');return snapshot();
  }
  function next(){var def=currentDef();recordUi('ui.guided_tour.next',{step_id:def.id});if(def.id==='tour.planning.approval_boundary')return finish('complete');if(def.meaningful&&!stepIsComplete(def.id)){state.last_error='Try the highlighted action, or choose Show Me and I will demonstrate it.';render('forward');return snapshot();}return goTo(def.index+1,'forward',true);}
  function back(){var def=currentDef();recordUi('ui.guided_tour.back',{step_id:def.id});if(def.index===0)return snapshot();if(history.length)history.pop();return goTo(def.index-1,'back',false);}
  function stopTargetTracking(){if(targetFrame){cancelAnimationFrame(targetFrame);targetFrame=0;}if(targetResizeObserver){targetResizeObserver.disconnect();targetResizeObserver=null;}}
  function scheduleTargetTracking(){if(!state.open)return;if(targetFrame)cancelAnimationFrame(targetFrame);targetFrame=requestAnimationFrame(function(){targetFrame=0;activeTarget=targetAdapter.resolve(state.step_id);positionTarget(activeTarget);});if(typeof ResizeObserver!=='undefined'){if(targetResizeObserver)targetResizeObserver.disconnect();targetResizeObserver=new ResizeObserver(function(){if(state.open&&!targetFrame)scheduleTargetTracking();});try{targetResizeObserver.observe(callout);if(activeTarget)targetResizeObserver.observe(activeTarget);}catch(error){}}}
  function overlapArea(a,b){return Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));}
  function positionTarget(target){
    var margin=10,descriptor=targetAdapter.descriptor(state.step_id);callout.style.setProperty('--pm7gt-fit-w',Math.max(1,innerWidth-margin*2)+'px');callout.style.setProperty('--pm7gt-fit-h',Math.max(1,innerHeight-margin*2)+'px');
    if(target&&callout.contains(target)){root.dataset.target='internal';root.dataset.targetKey=descriptor.key;root.dataset.targetOverlapPx='0';halo.style.opacity='0';callout.style.left='50%';callout.style.top='50%';return;}
    var rect=target&&target.getBoundingClientRect?target.getBoundingClientRect():null,visible=rect?{left:Math.max(margin,rect.left),top:Math.max(margin,rect.top),right:Math.min(innerWidth-margin,rect.right),bottom:Math.min(innerHeight-margin,rect.bottom)}:null,usable=!!(visible&&rect.width>0&&rect.height>0&&visible.right>visible.left&&visible.bottom>visible.top);
    root.dataset.target=usable?'available':'missing';root.dataset.targetKey=descriptor.key;if(!usable){halo.style.opacity='0';callout.style.left='50%';callout.style.top='50%';root.dataset.targetOverlapPx='0';return;}
    halo.style.opacity='';var pad=8,hLeft=Math.max(margin,visible.left-pad),hTop=Math.max(margin,visible.top-pad),hRight=Math.min(innerWidth-margin,visible.right+pad),hBottom=Math.min(innerHeight-margin,visible.bottom+pad);halo.style.left=((hLeft+hRight)/2)+'px';halo.style.top=((hTop+hBottom)/2)+'px';halo.style.width=(hRight-hLeft)+'px';halo.style.height=(hBottom-hTop)+'px';
    var cw=Math.min(callout.offsetWidth||420,innerWidth-margin*2),ch=Math.min(callout.offsetHeight||360,innerHeight-margin*2),gap=22,cx=(visible.left+visible.right)/2,cy=(visible.top+visible.bottom)/2,candidates=[{side:'right',x:visible.right+gap+cw/2,y:cy},{side:'left',x:visible.left-gap-cw/2,y:cy},{side:'below',x:cx,y:visible.bottom+gap+ch/2},{side:'above',x:cx,y:visible.top-gap-ch/2}],best=null;
    if(innerWidth<680)candidates=[candidates[2],candidates[3],candidates[0],candidates[1]];
    candidates.forEach(function(candidate,index){var x=Math.max(margin+cw/2,Math.min(innerWidth-margin-cw/2,candidate.x)),y=Math.max(margin+ch/2,Math.min(innerHeight-margin-ch/2,candidate.y)),box={left:x-cw/2,top:y-ch/2,right:x+cw/2,bottom:y+ch/2},overlap=overlapArea(box,visible),travel=Math.abs(x-candidate.x)+Math.abs(y-candidate.y),score=overlap*1000+travel+index;if(!best||score<best.score)best={x:x,y:y,side:candidate.side,overlap:overlap,score:score};});
    callout.style.left=best.x+'px';callout.style.top=best.y+'px';root.dataset.calloutSide=best.side;root.dataset.targetOverlapPx=String(Math.round(best.overlap));
  }
  var targetAdapter={
    schema_id:'pm.guided_tour.deterministic_target_adapter.v3',
    descriptor:function(step){var id=step||state.step_id;return {key:id+':'+(practiceWidgetId||workspacePanelId||'default'),step_id:id,selector:stepTargetSelector(id)};},
    resolve:function(step){var descriptor=this.descriptor(step);return visibleTarget(descriptor.selector);},
    status:function(step){var descriptor=this.descriptor(step),target=this.resolve(step),def=stepDef(step),reason=null;if(def.chapter==='workspace'&&!window.PM_HOME_WORKSPACE)reason='The workspace controls are not ready yet.';if(def.chapter==='planning_wizard'&&!window.PM_PAGES)reason='Planning is not ready yet.';if(def.chapter==='chat_teacher'&&!window.PM_DEMO)reason='Assistant Chat is not ready yet.';return {step_id:def.id,target_key:descriptor.key,selector:descriptor.selector,available:!!target&&!reason,visible:!!target,reason:reason||(!target&&def.meaningful?'The highlighted control is still coming into view.':null)};},
    perform:function(actionId){var def=currentDef();if(actionId&&actionId!==def.action_id&&actionId!=='ui.guided_tour.show_me')return localActionResult(actionId,'disabled','That action belongs to another tour step.');return performOwnerAction(def);},
    predicate:function(step){return stepPredicate(step||state.step_id);},layoutSnapshot:function(){return layoutNow();},captureOriginal:function(){return captureOriginal();}
  };
  function cleanupForExit(complete){
    clearAutoAdvance();cancelStepPoll();clearChoreography();stopTargetTracking();cancelTeacherTurn();closeTeacherPicker();
    var keep=!!complete&&state.keep_layout===true,restoration,chatOk=false,routeOk=false;
    try{restoration=keep?{ok:!!original,kept_by_explicit_choice:true,before:original&&clone(original.semantic),after:layoutNow()}:restoreWorkspaceSnapshot();}catch(error){restoration={ok:false,failures:['workspace_restore_failed']};}
    try{chatOk=restoreChatState(complete);restorePlanningChoice();}catch(error){chatOk=false;}
    removePlanningFixture();
    try{routeOk=goPage(complete?'wizard':original&&original.page);if(!complete&&routeOk&&original.page==='wizard'&&window.PM_PAGES)window.PM_PAGES.go('wizard',original.wizard_stage);}catch(error){routeOk=false;}
    state.layout_snapshot_restored=!keep&&!!restoration.ok;state.layout_disposition=restoration.ok?(keep?'kept':'restored'):'restore_failed';
    restoreDocumentScroll();return {ok:!!restoration.ok&&chatOk!==false&&routeOk,layout:restoration,chat_restored:chatOk!==false,teacher_preserved:!!complete,final_page:routeOk?(complete?'wizard':original&&original.page):null,work_started:false};
  }
  function finish(reason){
    var complete=reason==='complete',action=complete?'ui.guided_tour.finish':'ui.guided_tour.skip';
    if(!original||(!state.open&&state.status!=='paused'&&state.status!=='recovery_required'))return snapshot();
    if(complete&&(state.step_id!=='tour.planning.approval_boundary'||meaningful.some(function(def){return !stepIsComplete(def.id);})||!planningFixture||!planningFixture.review_visible||!planningFixture.edited||teacherPending)){
      state.last_error='Finish the practice actions before ending the tour. You can skip at any time.';if(state.open)render('forward');return snapshot();
    }
    recordUi(action,{reason:reason,keep_layout:complete&&state.keep_layout===true});var restoration=cleanupForExit(complete);
    if(!restoration.ok){
      state.completed=false;state.skipped=false;state.status='recovery_required';state.open=true;state.action_status='failed';state.last_error='Your starting arrangement could not be fully restored. The tour has not finished. Try again when the workspace controls are ready.';
      root.hidden=false;root.dataset.open='true';document.documentElement.setAttribute('data-pm7-guided-tour-open','true');resumeButton.hidden=true;replayButton.hidden=true;
      receipt(action,'original_workspace','failed',state.last_error,original&&original.semantic,layoutNow(),restoration,'try',localActionResult(action,'failed','restore_incomplete',{work_started:false}));persistCheckpoint();render('forward');return snapshot();
    }
    state.open=false;state.completed=complete;state.skipped=!complete;state.status=complete?'completed':'skipped';state.work_started=false;root.hidden=true;root.dataset.open='false';document.documentElement.removeAttribute('data-pm7-guided-tour-open');resumeButton.hidden=true;replayButton.hidden=false;clearCheckpoint();
    receipt(action,complete?'planning_wizard':'original_workspace','applied',null,original&&original.semantic,layoutNow(),restoration,'try',localActionResult(action,'applied',null,{final_page:restoration.final_page,work_started:false}));if(complete)focusPlanningPage();else originalFocus();notify();return snapshot();
  }
  function focusPlanningPage(){var session=sessionSerial;requestAnimationFrame(function(){if(session!==sessionSerial||state.open||!state.completed||!pageIs('wizard'))return;var host=document.getElementById('panel-wizard');if(!host)return;if(!host.hasAttribute('tabindex'))host.setAttribute('tabindex','-1');if(!host.hasAttribute('role'))host.setAttribute('role','region');if(!host.hasAttribute('aria-label'))host.setAttribute('aria-label','Planning Wizard');try{host.focus({preventScroll:true});}catch(error){host.focus();}});}
  function skip(){return finish('skip');}
  function pause(reason){if(!state.open)return snapshot();clearAutoAdvance();cancelStepPoll();clearChoreography();stopTargetTracking();cancelTeacherTurn();removePlanningFixture();state.open=false;state.status='paused';root.hidden=true;root.dataset.open='false';document.documentElement.removeAttribute('data-pm7-guided-tour-open');resumeButton.hidden=false;replayButton.hidden=true;recordUi('ui.guided_tour.pause',{reason:reason||'user',step_id:state.step_id});persistCheckpoint();notify();return snapshot();}
  function start(options){
    options=options||{};clearAutoAdvance();cancelStepPoll();clearChoreography();stopTargetTracking();cancelTeacherTurn();if(original&&!state.completed&&!state.skipped){var previous=cleanupForExit(false);if(!previous.ok){state.last_error='The previous practice could not be restored. Resume it and retry before starting another tour.';state.status='recovery_required';resumeButton.hidden=false;return snapshot();}}uninstallTeacherSendAdapter();removePlanningFixture();planningFixture=null;practiceWidgetId=null;workspacePanelId=null;completedSteps={};history=[];effectReceipts.length=0;uiActionLog.length=0;receiptSerial=0;sessionSerial+=1;captureOriginal(options.focus_node||null);state.keep_layout=false;
    Object.assign(state,{open:true,status:'demonstrating',completed:false,skipped:false,last_action:'ui.guided_tour.start',last_result:null,last_error:null,action_mode:null,action_status:'idle',choreography_state:'idle',layout_disposition:'pending',layout_snapshot_restored:false,source:options.source||'manual',teacher_thread_id:null,teacher_persona_selected:false,teacher_message_sent:false,teacher_answer_id:null,teacher_response_message_id:null,teacher_response_index:null,teacher_copy_mode:'normal',teacher_last_prompt:AUTHORITATIVE_PROMPT,eli5_enabled:false,active_widget_id:null,panel_demo_pair_ids:null,panel_demo_complete:false,usage_card_demo_complete:false,planning_goal:'',planning_answer:null,planning_why_open:false,planning_reviewed:false,planning_edited:false,planning_consequence_visible:false,planning_project_selected:false,planning_requirements_opened:false,work_started:false,shell_squeezed:innerWidth<720||innerHeight<560});
    var aliases={chat_teacher:'tour.chat.open',workspace:'tour.workspace.navigation',usage:'tour.workspace.usage.open',widget_workspace:'tour.workspace.widget.manage',planning_wizard:'tour.planning.open'},requested=aliases[options.step]||options.step,index=requested&&STEP_BY_ID[requested]?STEP_BY_ID[requested].index:0;state.step_id=STEP_DEFS[index].id;state.step_index=index;root.hidden=false;root.dataset.open='true';document.documentElement.setAttribute('data-pm7-guided-tour-open','true');resumeButton.hidden=true;replayButton.hidden=true;placeChatRight();recordUi('ui.guided_tour.start',{source:state.source,session:'concept-'+sessionSerial,storyboard_revision:STORYBOARD.revision});prepareStep(STEP_DEFS[index]);render('forward');return snapshot();
  }
  function resume(){recordUi('ui.guided_tour.resume',{step_id:state.step_id});if(!original)return start({source:'checkpoint',step:state.step_id});state.open=true;state.status='demonstrating';root.hidden=false;root.dataset.open='true';document.documentElement.setAttribute('data-pm7-guided-tour-open','true');resumeButton.hidden=true;replayButton.hidden=true;prepareStep(currentDef());render('forward');return snapshot();}
  function replay(options){return start(Object.assign({source:'replay'},options||{}));}
  root.addEventListener('change',function(event){if(event.target&&event.target.matches('[data-tour-keep-layout]'))state.keep_layout=event.target.checked===true;});
  root.addEventListener('click',function(event){
    var control=event.target&&event.target.closest&&event.target.closest('button[data-ui-action-id],button[data-command-id]');if(!control||!root.contains(control)||control.disabled||control.getAttribute('aria-disabled')==='true')return;var id=control.getAttribute('data-ui-action-id')||control.getAttribute('data-command-id'),tourAction=control.getAttribute('data-tour-action');
    if(control.hasAttribute('data-teacher-question')){ack(control,id);sendTeacherQuestion(control.getAttribute('data-teacher-question'));return;}
    if(tourAction==='try'){beginTry(control);return;}if(tourAction==='show'){beginShowMe(control);return;}if(tourAction==='continue'){ack(control,id);next();return;}if(tourAction==='finish'){ack(control,id);finish('complete');return;}
    if(id==='ui.guided_tour.toggle_eli5'){ack(control,id);toggleEli5();render('forward');if(state.step_id==='tour.chat.teacher.eli5'&&state.action_status==='watching'&&stepPredicate(state.step_id))completeStep('applied',{eli5_enabled:true,meaning_preserved:true});}
    else if(id==='ui.guided_tour.back'){ack(control,id);back();}
    else if(id==='ui.guided_tour.pause'){ack(control,id);pause('user');}
    else if(id==='ui.guided_tour.skip'){ack(control,id);skip();}
  });
  document.addEventListener('click',function(event){
    var control=event.target&&event.target.closest&&event.target.closest('[data-practice-action],[data-teacher-question]');if(!control)return;
    if(control.hasAttribute('data-teacher-question')&&!root.contains(control)){sendTeacherQuestion(control.getAttribute('data-teacher-question'));return;}
    if(!state.open||!control.hasAttribute('data-practice-action'))return;planningAction(control.getAttribute('data-practice-action'),control.getAttribute('data-practice-value'));if(state.action_status==='watching')setTimeout(function(){if(stepPredicate(state.step_id))completeStep('applied',{via:'planning_practice_control',work_started:false});},0);
  },true);
  document.addEventListener('click',function(){if(!state.open||state.action_status!=='watching')return;setTimeout(function(){if(state.open&&state.action_status==='watching'&&stepPredicate(state.step_id))completeStep('applied',{via:'mounted_owner_control',work_started:false});},0);});
  resumeButton.addEventListener('click',function(){ack(resumeButton,'ui.guided_tour.resume');resume();});
  replayButton.addEventListener('click',function(){ack(replayButton,'ui.guided_tour.replay');replay();});
  function tabStops(){var selector='button:not([disabled]):not([aria-disabled="true"]),input:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])',nodes=[].slice.call(callout.querySelectorAll(selector));if(state.action_status==='watching'){var target=targetAdapter.resolve(state.step_id);if(target)nodes.push(target);if(practiceRoot)nodes=nodes.concat([].slice.call(practiceRoot.querySelectorAll(selector)));}return nodes.filter(function(node,index,list){var rect=node.getBoundingClientRect();return rect.width>0&&rect.height>0&&list.indexOf(node)===index;});}
  document.addEventListener('keydown',function(event){if(!state.open)return;if(event.key==='Escape'){event.preventDefault();pause('escape');return;}if(event.key!=='Tab')return;var nodes=tabStops();if(!nodes.length)return;var index=nodes.indexOf(document.activeElement),next=event.shiftKey?(index<=0?nodes[nodes.length-1]:nodes[index-1]):(index<0||index===nodes.length-1?nodes[0]:nodes[index+1]);event.preventDefault();try{next.focus({preventScroll:true});}catch(error){next.focus();}},true);
  window.addEventListener('resize',function(){state.shell_squeezed=innerWidth<720||innerHeight<560;if(state.open)scheduleTargetTracking();},{passive:true});
  window.addEventListener('scroll',function(){if(state.open)scheduleTargetTracking();},{passive:true,capture:true});
  if(window.matchMedia){var motionQuery=window.matchMedia('(prefers-reduced-motion: reduce)'),onMotionChange=function(){reduced=motionReduced();if(state.open)render('forward');};if(motionQuery.addEventListener)motionQuery.addEventListener('change',onMotionChange);else if(motionQuery.addListener)motionQuery.addListener(onMotionChange);}
  if(window.MutationObserver){
    new MutationObserver(function(records){var motionChanged=records.some(function(record){return record.attributeName==='data-motion'&&record.oldValue!==document.documentElement.getAttribute('data-motion');}),themeChanged=records.some(function(record){return record.attributeName==='data-theme'&&record.oldValue!==document.documentElement.getAttribute('data-theme');});if(!state.open)return;if(motionChanged){reduced=motionReduced();render('forward');}else if(themeChanged)scheduleTargetTracking();}).observe(document.documentElement,{attributes:true,attributeOldValue:true,attributeFilter:['data-motion','data-theme']});
    new MutationObserver(function(){if(state.open&&state.step_id==='tour.chat.teacher.select'&&!teacherPersonaButton())mountTeacherPersonaControl();}).observe(document.body,{childList:true,subtree:true});
  }
  var checkpoint=savedCheckpoint();if(checkpoint&&checkpoint.status==='paused'){state.step_id=checkpoint.step_id;state.step_index=stepDef(checkpoint.step_id).index;state.eli5_enabled=!!checkpoint.eli5_enabled;state.source=checkpoint.source||'checkpoint';state.status='paused';resumeButton.hidden=false;}
  window.PM7_GUIDED_TOUR={schema_id:'pm.guided_tour.concept_api.v3',concept_simulation_only:true,production_runtime_certification:false,timings:clone(timings),storyboard:clone(STORYBOARD),start:start,next:next,back:back,pause:pause,resume:resume,skip:skip,finish:function(){return finish('complete');},replay:replay,snapshot:snapshot,target_adapter:targetAdapter,effect_receipts:effectReceipts,ui_action_log:uiActionLog,teacher_topics:TEACHER_ANSWERS.length,subscribe:function(fn){if(typeof fn==='function')listeners.push(fn);return function(){listeners=listeners.filter(function(item){return item!==fn;});};}};
  }
  var installObserver=null;
  function mountGuidedTour(){installGuidedTour();if(window.PM7_GUIDED_TOUR&&installObserver){installObserver.disconnect();installObserver=null;}}
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',mountGuidedTour,{once:true});
    if(window.MutationObserver){installObserver=new MutationObserver(mountGuidedTour);installObserver.observe(document.documentElement,{childList:true,subtree:true});}
  }else mountGuidedTour();
})();
</script>
'''


GUIDED_TOUR_SCRIPT = _GUIDED_TOUR_V3_PREFIX + PLANNING_PRACTICE_SCRIPT + _TEACHER_LIBRARY_FRAGMENT + _GUIDED_TOUR_V3_SUFFIX


def apply(doc, notes, need):
    """Insert the Guided Tour after T45 without registering it in the pipeline."""
    need(TRANSFORM_MARKER not in doc, "guided tour: transform already applied")
    need("PM7 Product Onboarding: simple cinematic guided setup" in doc, "guided tour: T45 onboarding marker missing")
    need(doc.count("</head>") == 1, "guided tour: unique head close missing")
    need(doc.count("</body>") == 1, "guided tour: unique body close missing")
    for identity in ('id="pm7-guided-tour"', 'id="pm7-guided-tour-css"', 'id="pm7-guided-tour-js"'):
        need(identity not in doc, "guided tour: host identity already exists: %s" % identity)

    protected_before = capture_protected_sources(doc, need, "guided tour input")
    effects_before = capture_effect_surfaces(doc)
    # Register the controller from the head before first-launch Onboarding can
    # make later parser-added body children inert. The controller itself waits
    # for DOMContentLoaded, so its markup still mounts from the body tail.
    doc = doc.replace("</head>", GUIDED_TOUR_STYLE + "\n" + GUIDED_TOUR_SCRIPT + "\n</head>", 1)
    doc = doc.replace("</body>", GUIDED_TOUR_MARKUP + "\n</body>", 1)

    protected_receipt = assert_protected_sources_equal(
        protected_before,
        capture_protected_sources(doc, need, "guided tour output"),
        need,
        "guided tour",
    )
    effects_after = capture_effect_surfaces(doc)
    effect_receipt = assert_effect_delta(
        effects_before,
        effects_after,
        {
            "command_ids": {"added": ["cmd.chat.eli5.set", "cmd.chat.send", "cmd.persona.select", "cmd.widget.configure"], "removed": []},
            "domain_event_ids": {"added": ["pm7.guided-tour.owner-action"], "removed": []},
            "dom_event_types": {"added": [], "removed": []},
            "persistence_targets": {
                "added": [
                    "sessionStorage.removeItem:'pm7:guided-tour:checkpoint:v3'",
                    "sessionStorage.setItem:'pm7:guided-tour:checkpoint:v3'",
                ],
                "removed": [],
            },
        },
        need,
        "guided tour",
    )

    need(doc.count(TRANSFORM_MARKER) == 3, "guided tour: style/markup/script marker census mismatch")
    need(doc.count('id="pm7-guided-tour"') == 1, "guided tour: root census mismatch")
    need(doc.count('id="pm7-guided-tour-css"') == 1, "guided tour: style census mismatch")
    need(doc.count('id="pm7-guided-tour-js"') == 1, "guided tour: script census mismatch")
    need("document.addEventListener('DOMContentLoaded',mountGuidedTour,{once:true})" in GUIDED_TOUR_SCRIPT, "guided tour: head registration no longer survives first-launch body inerting")
    need("installObserver.observe(document.documentElement,{childList:true,subtree:true})" in GUIDED_TOUR_SCRIPT, "guided tour: parser-time markup observer missing")
    need("<canvas" not in GUIDED_TOUR_MARKUP.lower(), "guided tour: Canvas dependency entered module")
    need("webgl" not in (GUIDED_TOUR_STYLE + GUIDED_TOUR_SCRIPT).lower(), "guided tour: WebGL dependency entered module")
    for forbidden in ("backdrop-filter", "filter:", "color-mix(", "url(#"):
        need(forbidden not in GUIDED_TOUR_STYLE.lower(), "guided tour: non-portable visual primitive: %s" % forbidden)
    for network_primitive in ("fetch(", "xmlhttprequest", "websocket(", "eventsource(", "new worker("):
        need(network_primitive not in GUIDED_TOUR_SCRIPT.lower(), "guided tour: network/provider primitive entered local teacher: %s" % network_primitive)

    authored = GUIDED_TOUR_MARKUP + GUIDED_TOUR_SCRIPT
    controls = re.findall(r"<button\b[^>]*>", authored, re.I)
    untyped = [control for control in controls if len(re.findall(r"\bdata-(?:command|ui-action)-id=", control)) != 1]
    need(not untyped, "guided tour: every authored button must carry exactly one typed action id")
    ui_ids = sorted(set(re.findall(r"ui\.guided_tour\.[a-z0-9_]+", authored)))
    expected_ui_ids = sorted(
        [
            "ui.guided_tour.back",
            "ui.guided_tour.finish",
            "ui.guided_tour.focus_route",
            "ui.guided_tour.next",
            "ui.guided_tour.pause",
            "ui.guided_tour.replay",
            "ui.guided_tour.resume",
            "ui.guided_tour.show_me",
            "ui.guided_tour.skip",
            "ui.guided_tour.start",
            "ui.guided_tour.toggle_eli5",
        ]
    )
    need(ui_ids == expected_ui_ids, "guided tour: authored UI action vocabulary drifted: %r" % ui_ids)
    need("cmd.nav.focus_route" not in authored, "guided tour: a false navigation domain command entered the local UI-action boundary")
    need("local_action_result" in authored and "domain_mutation:false" in authored and "persistence_write:false" in authored, "guided tour: typed local action result or no-domain/no-persistence boundary is incomplete")
    step_rows = re.findall(
        r"\{id:'([^']+)',chapter:'([^']+)',meaningful:(true|false),dwell_ms:(\d+),action_id:'([^']+)'\}",
        GUIDED_TOUR_SCRIPT,
    )
    expected_step_ids = [
        "tour.intro.comfort",
        "tour.chat.open",
        "tour.chat.teacher.select",
        "tour.chat.teacher.ask",
        "tour.chat.teacher.reply",
        "tour.chat.teacher.eli5",
        "tour.workspace.navigation",
        "tour.workspace.chat.dock",
        "tour.workspace.panels.rearrange",
        "tour.workspace.usage.open",
        "tour.workspace.widget.manage",
        "tour.planning.open",
        "tour.planning.project_source",
        "tour.planning.goal",
        "tour.planning.guided_help",
        "tour.planning.requirements",
        "tour.planning.question",
        "tour.planning.why",
        "tour.planning.review",
        "tour.planning.edit",
        "tour.planning.consequence",
        "tour.planning.approval_boundary",
    ]
    actual_step_ids = [row[0] for row in step_rows]
    need(actual_step_ids == expected_step_ids and len(set(actual_step_ids)) == len(actual_step_ids), "guided tour: stable newbie-first step manifest drifted: %r" % actual_step_ids)
    meaningful_rows = [row for row in step_rows if row[2] == "true"]
    planning_rows = [row for row in meaningful_rows if row[1] == "planning_wizard"]
    meaningful_dwell = sum(int(row[3]) for row in meaningful_rows)
    planning_dwell = sum(int(row[3]) for row in planning_rows)
    need(len(planning_rows) * 2 >= len(meaningful_rows) and planning_dwell * 2 >= meaningful_dwell, "guided tour: Planning Wizard no longer owns at least half of meaningful practice and dwell")
    need("newbie-first-chat-workspace-planning-2026-09-04" in authored and "chapter_order:['chat_teacher','workspace','planning_wizard']" in authored and "final_destination:'planning_wizard'" in authored and "work_started:false" in authored, "guided tour: Chat to workspace to Planning story or no-build boundary is incomplete")
    authoritative_prompt = "What happens before Puppet Master changes my files?"
    need(authoritative_prompt in authored and "Before work begins, Puppet Master turns your request into a plan." in authored and "First, Puppet Master writes down what it thinks you want." in authored, "guided tour: authoritative Teacher prompt/normal/ELI5 fixture drifted")
    need("Create a simple website for my neighborhood book club." in authored and all(outcome in authored for outcome in ("Visitors can see the next meeting.", "Visitors can see the current book.", "New members can learn how to join.")), "guided tour: book-club goal or outcomes drifted")
    need("This decides whether the site needs shared sign-in and editing." in authored and "Who should be able to update the meeting and book?" in authored, "guided tour: question/why cause-and-effect fixture drifted")
    need("ui.guided_tour.show_me" in authored and "same_handler:'performOwnerAction'" in authored and "function performOwnerAction(def)" in authored and "function stepPredicate(id)" in authored and "function watchCurrentPredicate()" in authored, "guided tour: Try It and Show Me do not share one action/predicate path")
    need("if(ok)completeStep('applied'" in authored and "observed_predicate:id" in authored and "setInterval(check,120)" in authored, "guided tour: completion is not driven by a verified owner predicate")
    need("pre_cue" in authored and "travel" in authored and "arrival" in authored and "settle" in authored and "runShowMeAction(def)" in authored, "guided tour: interruptible Show Me choreography is incomplete")
    need("placeChatRight" in authored and "chat.host!=='dock_right'" in authored and "cmd.workspace_layout.move_surface" in authored, "guided tour: Assistant Chat is not staged at the far right or movable through its owner")
    need("restoreWorkspaceSnapshot" in authored and "restoreChatState(complete)" in authored and "removePlanningFixture();" in authored and "goPage(complete?'wizard':original&&original.page)" in authored and "teacher_preserved:!!complete" in authored and "state.status='recovery_required'" in authored and "data-tour-keep-layout" in authored, "guided tour: verified cleanup, explicit Keep, or final real Planning destination is incomplete")
    need("teacherTurnCurrent(pending)" in authored and "thread.guided_example===true" in authored and "guidedThreadIds[threadId]" in authored and "cancelTeacherTurn();removePlanningFixture();state.open=false;state.status='paused'" in authored, "guided tour: local Teacher ownership or interrupted-turn fencing is incomplete")
    need("pm7:guided-tour:checkpoint:v3" in authored and "safe_checkpoint.v1" in authored and "function savedCheckpoint()" in authored, "guided tour: safe step checkpoint/resume is incomplete")
    need("callout.offsetWidth" in authored and "overlapArea(box,visible)" in authored and "targetOverlapPx" in authored and "Math.min(innerWidth-margin-cw/2" in authored, "guided tour: target measurement, collision scoring, or viewport clamping is incomplete")
    need("data-concept-fixture-only" in authored and "pm7gt-planning-practice" in authored and "data-practice-action" in authored and "Nothing has been built" in authored, "guided tour: real Planning page practice fixture or explicit simulation boundary is incomplete")
    need("prepareTeacherPractice" in authored and "mountTeacherPersonaControl" in authored and all(action in authored for action in ("cmd.persona.select", "cmd.chat.send", "cmd.chat.eli5.set")) and "teacher_message_sent" in authored and "TEACHER_ANSWERS" in authored and "data-pm7gt-teacher-response" in authored, "guided tour: mounted Teacher selection/message/reply practice is incomplete")
    need("ui.assistant_chat." not in authored, "guided tour: concept-only Chat aliases replaced canonical owner commands")
    need("createGuidedPlanningPractice" in authored and "updatePracticeTree" in authored and "consequence_revision" in authored and "Shared access needs a decision" in authored, "guided tour: genuine answer edit, unresolved choice, or stable outcome identity regressed")
    need("A project is one labeled box" in authored and "A project groups one goal" in authored, "guided tour: normal and ELI5 Teacher answers are not materially distinct")
    need("Safe History creates recoverable versions on this computer" in authored and "Git or Jujutsu can organize that local timeline" in authored and "GitHub or GitLab can hold an optional online copy" in authored and "FileSafe protects selected file copies beside it" in authored, "guided tour: Safe History/source-control/FileSafe relationship drifted")
    need(authored.count("teacherTopic('") >= 40 and "TEACHER_SUGGESTIONS" in authored and "TEACHER_MORE_GROUPS" in authored and "See 30 example questions" in authored and "data-teacher-question" in authored, "guided tour: broad deterministic Teacher topic library regressed")
    need("function tabStops()" in authored and "event.key!=='Tab'" in authored and "event.key==='Escape'" in authored, "guided tour: focus containment or Escape pause is incomplete")
    need("border-left" not in GUIDED_TOUR_STYLE.lower(), "guided tour: rejected left-edge accent returned")
    for family in ("friendly", "glass", "basic", "retro"):
        need('html[data-theme="%s-light"] .pm7gt-callout' % family in GUIDED_TOUR_STYLE and 'html[data-theme="%s-dark"] .pm7gt-callout' % family in GUIDED_TOUR_STYLE, "guided tour: %s light/dark paint variants are incomplete" % family)
    need("border-radius:36px 36px 36px 12px" in GUIDED_TOUR_STYLE and "inset:14px -14px -14px 14px" in GUIDED_TOUR_STYLE and "border-top-width:8px" in GUIDED_TOUR_STYLE and 'content:"TOUR.EXE"' in GUIDED_TOUR_STYLE, "guided tour: theme families collapsed into color-only variants")
    need("from { opacity: 0" not in GUIDED_TOUR_STYLE and ".pm7gt-scrim { position: absolute; inset: 0; background: transparent" in GUIDED_TOUR_STYLE and "full-screen scrim" in GUIDED_TOUR_STYLE and ".pm7gt-stage" in GUIDED_TOUR_STYLE, "guided tour: stable non-flashing callout surface regressed")
    need("#pm7-onboarding-resume:not([hidden]) ~ #pm7-guided-tour-resume" in GUIDED_TOUR_STYLE, "guided tour: paused-tour Resume can overlap setup Resume")
    need("reduced_ms:80" in authored and "show_me_reduced_ms:80" in authored and "animation-duration: 80ms !important" in GUIDED_TOUR_STYLE, "guided tour: reduced motion lost its restrained 80 ms cause-and-effect path")
    need("<canvas" not in authored.lower() and "html2canvas" not in authored.lower() and "screenshot" not in authored.lower(), "guided tour: screenshot/canvas substitution entered the live-control lesson")
    need('data-pm-hover-exempt="programmatic-focus-landmark"' in authored and 'h2[data-pm-hover-exempt="programmatic-focus-landmark"]:focus-visible' in GUIDED_TOUR_STYLE, "guided tour: announced headings must not show a stray programmatic focus outline or hover tag")
    for retired_visible_copy in ("LOCAL TOUR TEACHER", "Shell navigation ·", "Next: shell navigation", "Provider/model/token/AI-plan use", "Last receipt:", "owner command is cmd.widget"):
        need(retired_visible_copy not in authored, "guided tour: developer-facing tour copy returned: %s" % retired_visible_copy)

    notes.update(
        {
            "decision": "newbie-first guided film: Assistant Chat and local Teacher first; reversible workspace and Usage practice second; Planning Wizard owns the final and longest chapter",
            "integration_position": "after T45 Product Onboarding and before later system/hover transforms",
            "step_ids": expected_step_ids,
            "chapter_order": ["chat_teacher", "workspace", "planning_wizard"],
            "storyboard_revision": "newbie-first-chat-workspace-planning-2026-09-04",
            "planning_practice_helper_sha256": hashlib.sha256(Path(guided_tour_practice_source.__file__).read_bytes()).hexdigest(),
            "teacher_boundary": "baked-in local deterministic exchange; provider/model/network/token/AI-plan use is exactly zero",
            "runtime_ownership_boundary": "calls mounted PM_HOME_WORKSPACE, PM7_USAGE, Assistant Chat, and PM_PAGES owners; owns no parallel runtime, layout, widget, command, persistence, or Planning Wizard state",
            "simulation_boundary": "browser concept behavior and observed owner receipts only; not native Slint compilation, production wiring, runtime certification, or protected AuthBrowserSession evidence",
            "timings_ms": {"non_retro": 500, "non_retro_allowed": [420, 560], "retro_stepped": 140, "reduced_motion": 80, "same_frame_ack": 0},
            "slint_portability": "opacity/translation/scale/clipping states only; no Canvas, WebGL, backdrop blur, SVG filter, runtime color mixing, or network primitive",
            "deterministic_api": "window.PM7_GUIDED_TOUR with start/next/back/pause/skip/resume/finish/replay/snapshot and target_adapter",
            "layout_exit": "Skip restores the captured page, layout, composer draft, placeholder, ELI5 state, document scroll, and focus; successful Finish restores layout, preserves the local Teacher thread, and leaves Planning Wizard visible with work_started false",
            "protected_embedded_source_guard": protected_receipt,
            "effect_surface_set_diff": effect_receipt,
        }
    )
    return doc
