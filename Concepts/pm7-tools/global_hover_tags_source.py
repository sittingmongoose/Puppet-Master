"""Source-owned PMConcept7 global hover/focus tag transform (T47).

The browser artifact is a deterministic prototype of one native
``PMHoverTag`` model and one ``HoverTagController``.  Its public projection is
deliberately phrased in Slint terms: typed tag data, anchor rectangles, overlay
placement, timers, focus/hover inputs, and theme tokens.  No Canvas, WebGL,
browser-only physics, SVG filter, or heavy CSS filter is used.

``build_pm7.py`` owns registration.  This module only exports :func:`apply`
and effect-surface constants so the pipeline can register it after T46.
"""

from __future__ import annotations

from pm7_transform_guards import (
    assert_effect_delta,
    assert_protected_sources_equal,
    capture_effect_surfaces,
    capture_protected_sources,
)


TRANSFORM_MARKER = "PM7 T47: global hover and focus tags"
PREDECESSOR_MARKER = "PM7 T46: operational systems integration and K3 host adaptation"

# The controller is presentation/accessibility-only: no UICommand, domain
# event, or persistence surface is introduced. T47 adds only local DOM input
# types needed for hover/focus intent; pointer press and scroll may already be
# consumed elsewhere in the preceding PM7 artifact.
EXPECTED_EFFECT_SURFACE_DELTA = {
    "command_ids": {"added": [], "removed": []},
    "domain_event_ids": {"added": [], "removed": []},
    "dom_event_types": {"added": ["focusin", "pointerover"], "removed": []},
    "persistence_targets": {"added": [], "removed": []},
}

EXPECTED_RUNTIME_EFFECT_SURFACES = {
    "singleton": "window.PM_HOVER_TAG_CONTROLLER",
    "model": "window.PMHoverTag",
    "controller_type": "window.HoverTagController",
    "overlay_root": "#pm-hover-tag-root",
    "anchor_selector": "[data-pm-hover-bound=\"true\"]",
    "description_selector": "#pm-hover-tag-descriptions > [role=\"tooltip\"]",
    "dom_inputs": [
        "pointerover",
        "pointermove",
        "pointerout",
        "pointerdown",
        "focusin",
        "focusout",
        "keydown",
        "resize",
        "scroll",
        "input",
        "change",
        "MutationObserver",
        "matchMedia(prefers-reduced-motion)",
    ],
    "writes": [
        "data-pm-hover-* annotations",
        "aria-describedby additive token",
        "missing accessible-name repair from explicit UI copy",
        "native title migration",
        "disabled-to-aria-disabled focus bridge",
        "shared overlay geometry",
    ],
    "commands": [],
    "domain_events": [],
    "persistence": [],
}


HOVER_STYLE = r'''<style id="pm-hover-tags-css">
/* PM7 T47: global hover and focus tags */
#pm-hover-tag-root {
  position: fixed; inset: 0; z-index: 2147483000; pointer-events: none;
  contain: layout style; color-scheme: light dark;
}
#pm-hover-tag-root .pm-hover-tag {
  position: fixed; left: 0; top: 0; width: max-content;
  max-width: min(280px, max(1px, calc(100vw - 16px)));
  min-height: min(24px, max(1px, calc(100dvh - 16px)));
  max-height: max(1px, calc(100dvh - 16px));
  box-sizing: border-box; padding: 4px 8px;
  overflow-x: hidden; overflow-y: auto; overscroll-behavior: contain;
  border: 1px solid var(--border, rgba(255,255,255,.18));
  border-radius: 8px; color: var(--text-primary, #f7f4fb);
  background: var(--surface-elevated, #292431);
  box-shadow: 0 7px 20px rgba(0,0,0,.24);
  opacity: 0; visibility: hidden;
  transform: translateY(4px) scale(.98);
  transform-origin: 50% 100%;
  transition: opacity 240ms var(--ease-out, cubic-bezier(.22,1,.36,1)),
    transform 240ms var(--ease-out, cubic-bezier(.22,1,.36,1)),
    visibility 0ms linear 240ms;
}
#pm-hover-tag-root .pm-hover-tag[data-placement="below"] {
  transform: translateY(-4px) scale(.98); transform-origin: 50% 0%;
}
#pm-hover-tag-root .pm-hover-tag[data-open="true"] {
  opacity: 1; visibility: visible; transform: translateY(0) scale(1);
  transition-delay: 0ms;
}
#pm-hover-tag-root[data-visual-enabled="false"] .pm-hover-tag { display: none; }
.pm-hover-tag strong {
  display: block; max-width: 100%; margin: 0; color: inherit;
  font: 650 12px/1.3 var(--body-font, Inter, system-ui, sans-serif);
  overflow-wrap: anywhere;
}
.pm-hover-tag[data-detail="false"] strong { white-space: normal; }
.pm-hover-tag p {
  max-width: 100%; margin: 3px 0 0; color: var(--text-secondary, #c7bfce);
  font: 500 11px/1.35 var(--body-font, Inter, system-ui, sans-serif);
  overflow-wrap: anywhere;
}
.pm-hover-sr {
  position: fixed !important; width: 1px !important; height: 1px !important;
  padding: 0 !important; margin: -1px !important; overflow: hidden !important;
  clip: rect(0 0 0 0) !important; clip-path: inset(50%) !important;
  white-space: nowrap !important; border: 0 !important;
}
/* Thousands of persistent accessible descriptions must not form one enormous
   inline formatting row. Keep every role=tooltip node in the accessibility
   tree while giving the hidden owner a bounded, layout-inert paint footprint. */
.pm-hover-sr > .pm-hover-description {
  position: absolute !important; display: block !important;
  inset: 0 auto auto 0 !important; width: 1px !important; height: 1px !important;
  overflow: hidden !important;
}
[data-pm-hover-was-disabled="true"] {
  cursor: not-allowed !important; opacity: .56;
}
html[data-theme^="basic"] #pm-hover-tag-root .pm-hover-tag {
  border-radius: 6px; box-shadow: 0 6px 16px rgba(0,0,0,.22);
}
html[data-theme^="friendly"] #pm-hover-tag-root .pm-hover-tag {
  border-radius: 10px; box-shadow: 0 8px 22px rgba(0,0,0,.22);
}
html[data-theme^="glass"] #pm-hover-tag-root .pm-hover-tag {
  border-color: var(--glass-hairline, rgba(255,255,255,.24));
  background: rgba(var(--glass-tint-rgb, 28,22,38), calc(.72 + var(--glass-alpha, .55) * .22));
  box-shadow: inset 0 1px 0 var(--glass-edge, rgba(255,255,255,.16)), 0 8px 24px rgba(0,0,0,.28);
}
html[data-theme="glass-light"] #pm-hover-tag-root .pm-hover-tag {
  color: #18131e;
  background: rgba(var(--glass-tint-rgb, 247,243,250), calc(.78 + var(--glass-alpha, .55) * .18));
}
html[data-theme="glass-light"] #pm-hover-tag-root .pm-hover-tag p { color: #493f51; }
html[data-theme^="retro"] #pm-hover-tag-root .pm-hover-tag {
  border-radius: 0; box-shadow: 3px 3px 0 var(--border, #111);
  transform: translateY(3px); transition: opacity 140ms steps(2,end),
    transform 140ms steps(2,end), visibility 0ms linear 140ms;
}
html[data-theme^="retro"] #pm-hover-tag-root .pm-hover-tag[data-placement="below"] { transform: translateY(-3px); }
html[data-theme^="retro"] #pm-hover-tag-root .pm-hover-tag[data-open="true"] { transform: translateY(0); transition-delay: 0ms; }
html[data-theme$="-light"]:not([data-theme^="glass"]) #pm-hover-tag-root .pm-hover-tag {
  color: var(--text-primary, #211b26); background: var(--surface-elevated, #fff);
}
@media (prefers-reduced-motion: reduce) {
  #pm-hover-tag-root .pm-hover-tag,
  #pm-hover-tag-root .pm-hover-tag[data-placement="below"] {
    transition: none !important; transform: none !important;
  }
}
</style>'''


HOVER_SCRIPT = r'''<script id="pm-hover-tags-js">
/* PM7 T47: global hover and focus tags */
(function () {
  'use strict';
  if (window.PM_HOVER_TAG_CONTROLLER) return;

  var ROOT_ID='pm-hover-tag-root', TAG_ID='pm-hover-tag-visual', DESCRIPTIONS_ID='pm-hover-tag-descriptions';
  var GAP=8, MARGIN=8, MAX_WIDTH=280, POINTER_OPEN_MS=1600, POINTER_STATIONARY_MS=1100, POINTER_RADIUS_PX=5, FOCUS_OPEN_MS=1000, DEPARTURE_GRACE_MS=160;
  var EXEMPTIONS=Object.freeze({
    'decorative':'Purely decorative, non-actionable paint with no user-visible datum.',
    'duplicate-visible-label':'Non-actionable duplicate text already described by the same semantic group.',
    'hidden-template':'Inert source template that is never mounted as an interactive surface.',
    'programmatic-focus-landmark':'Static heading focused only to announce a modal or route transition; it is not an action or a second tooltip target.',
    'tooltip-owner':'The shared hover-tag overlay and its persistent description nodes.',
    'noninteractive-chart-geometry':'Decorative chart scaffolding; each datum mark remains independently bound.'
  });
  var SEMANTIC_ACTION_SELECTOR='a[href],button,input:not([type="hidden"]),select,textarea,summary,[contenteditable="true"],[role="button"],[role="link"],[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"],[role="tab"],[role="checkbox"],[role="radio"],[role="switch"],[role="slider"],[data-action],[data-command-id],[data-ui-action-id],[data-callback],[onclick]';
  var ACTION_SELECTOR=SEMANTIC_ACTION_SELECTOR+',[tabindex]';
  var SEMANTIC_SELECTOR='[title],[data-hover-tip],[data-tooltip],[data-pm-hover-label],[data-pm-hover-detail],[data-technical-id],[data-setting-id],[data-widget-id],[data-chart-mark],[data-status],[class*="status"],[class*="badge"],[class*="pill"],code,kbd,samp,svg [data-value],svg [aria-label]';
  var BLOCKED_EVENTS=['click','dblclick','beforeinput','input','change','submit'];

  function clean(value){return String(value==null?'':value).replace(/\s+/g,' ').trim();}
  function slug(value){return clean(value).toLowerCase().replace(/[^a-z0-9_.:-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,72)||'item';}
  function hash(value){var h=2166136261;for(var i=0;i<value.length;i++){h^=value.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(36);}
  function attr(el,name){return clean(el&&el.getAttribute&&el.getAttribute(name));}
  function setAttrIfChanged(el,name,value){value=String(value);if(el.getAttribute(name)!==value)el.setAttribute(name,value);}
  function inOwner(el){return !!(el&&el.closest&&el.closest('#'+ROOT_ID));}
  function activeOverlay(){var tour=document.getElementById('pm7-guided-tour'),onboarding=document.getElementById('pm7-onboarding');if(tour&&attr(tour,'data-open')==='true')return tour;if(onboarding&&attr(onboarding,'data-open')==='true')return onboarding;return null;}
  function overlayAllows(el){var overlay=activeOverlay();return !overlay||!!(el&&overlay.contains(el));}
  function visibleText(el){
    if(!el)return '';
    /* textContent concatenates adjacent semantic children (for example a
       button's <span> label and <small> consequence) with no separator.
       Join direct child groups before whitespace normalization so the shared
       tag never renders words jammed together, while avoiding innerText's
       layout read across the whole census. */
    var source=el.textContent||'';
    if(el.childNodes&&el.childNodes.length>1){var parts=[];for(var i=0;i<el.childNodes.length;i++){var node=el.childNodes[i],value=node.nodeType===3?node.nodeValue:(node.nodeType===1?node.textContent:'');if(clean(value))parts.push(value);}if(parts.length)source=parts.join(' ');}
    return clean(source).slice(0,320);
  }
  function labelText(el){
    var by=attr(el,'aria-labelledby');
    if(by){var text=by.split(/\s+/).map(function(id){var node=document.getElementById(id);return visibleText(node);}).filter(Boolean).join(' ');if(text)return text;}
    var aria=attr(el,'aria-label');if(aria)return aria;
    if(el&&el.labels&&el.labels.length){var labels=Array.prototype.map.call(el.labels,visibleText).filter(Boolean).join(' ');if(labels)return labels;}
    var text=visibleText(el);if(text)return text;
    return '';
  }
  function isNativeDisabled(el){return !!(el&&el.matches&&el.matches('button:disabled,input:disabled,select:disabled,textarea:disabled,fieldset:disabled'));}
  function isDisabled(el){return isNativeDisabled(el)||attr(el,'aria-disabled')==='true'||attr(el,'data-disabled')==='true'||el.classList.contains('disabled');}
  function isActionable(el){
    if(!el||!el.matches||inOwner(el))return false;
    if(el.matches(SEMANTIC_ACTION_SELECTOR))return true;
    return el.tabIndex>=0;
  }
  function isTruncated(el){
    if(!el||!el.getBoundingClientRect)return false;
    var forced=attr(el,'data-truncated')==='true';
    var overflowed=(el.scrollWidth>el.clientWidth+1)||(el.scrollHeight>el.clientHeight+1);
    /* Most actionable elements are not truncated. Avoid a computed-style read
       (and the layout flush it can trigger) until cheap geometry or an exact
       owner annotation says truncation is actually possible. */
    if(!forced&&!overflowed)return false;if(forced)return true;
    var style;try{style=getComputedStyle(el);}catch(_error){return false;}
    return style.textOverflow==='ellipsis'||style.overflowX==='hidden'||style.overflowY==='hidden';
  }
  function technicalAttribute(el){
    if(!el||!el.attributes)return '';
    /* Command/UI-action attributes identify wiring, not user-facing technical
       values. They still make the element actionable, but their raw tokens do
       not leak into the hover copy. */
    var preferred=['data-technical-id','data-setting-id','data-widget-id','data-instance-id','data-run-id','data-thread-id'];
    for(var i=0;i<preferred.length;i++){var value=attr(el,preferred[i]);if(value)return value;}
    for(var j=0;j<el.attributes.length;j++){
      var a=el.attributes[j];
      /* Controller-owned annotations describe the hover system itself; they
         are not product identifiers and must never feed back into copy. */
      if(/^data-pm-hover-/.test(a.name))continue;
      if(/^data-[a-z0-9-]*(?:id|key|ref)$/.test(a.name)&&clean(a.value))return clean(a.value);
    }
    var cls=attr(el,'class');
    if(el.matches('code,kbd,samp')||/(^|\s)(mono|monospace|technical|identifier|hash|commit|sha|path)(\s|$)/i.test(cls))return visibleText(el);
    return '';
  }
  function isChartMark(el){return !!(el&&el.matches&&el.matches('[data-chart-mark],svg [data-value],svg [aria-label],svg [role="img"] [tabindex]'));}
  function isStatus(el){var cls=attr(el,'class');return !!(attr(el,'data-status')||/(^|[-_\s])status([-_\s]|$)/i.test(cls));}
  function isBadge(el){var cls=attr(el,'class');return /(^|[-_\s])(badge|pill)([-_\s]|$)/i.test(cls);}
  function factsFor(el){
    if(!el||el.nodeType!==1||inOwner(el))return null;
    var actionable=isActionable(el),disabled=isDisabled(el),truncated=isTruncated(el),technical=technicalAttribute(el);
    var status=isStatus(el),badge=isBadge(el),chart=isChartMark(el),nativeTitle=attr(el,'title');
    var kindList=[];
    if(actionable)kindList.push('actionable');if(disabled)kindList.push('disabled');if(truncated)kindList.push('truncated');
    if(technical)kindList.push('technical-identifier');if(status)kindList.push('status');if(badge)kindList.push('badge');
    if(chart)kindList.push('chart-mark');if(nativeTitle)kindList.push('native-title');
    return {actionable:actionable,disabled:disabled,truncated:truncated,technical:technical,status:status,badge:badge,chart:chart,native_title:nativeTitle,kinds:kindList};
  }
  function kinds(el){var facts=factsFor(el);return facts?facts.kinds:[];}
  function isCandidate(el,facts){facts=facts||factsFor(el);return !!(facts&&(facts.kinds.length||el.matches(SEMANTIC_SELECTOR)));}
  function pinState(el){
    var signal=[attr(el,'data-action'),attr(el,'data-command-id'),attr(el,'data-ui-action-id'),attr(el,'id'),attr(el,'aria-label'),visibleText(el)].join(' ');
    if(!/(^|[^a-z])(?:un)?pin(?:ned|ning)?([^a-z]|$)/i.test(signal))return null;
    var pressed=attr(el,'aria-pressed'),data=attr(el,'data-pinned');
    var pinned=pressed==='true'||data==='true'||el.classList.contains('pinned')||/\bunpin\b/i.test(attr(el,'aria-label'));
    return pinned;
  }
  function actionSignal(el){return attr(el,'data-pm-home-action')||attr(el,'data-pm-home-top-action')||attr(el,'data-ui-action-id')||attr(el,'data-command-id')||attr(el,'data-action');}
  function humanActionCopy(el){
    var action=actionSignal(el),id=attr(el,'id'),visible=visibleText(el),visibleLower=visible.toLowerCase(),signal=[action,id,attr(el,'class'),attr(el,'aria-label'),visible].join(' ').toLowerCase();
    if(action==='ui.guided_tour.next'){
      if(/simpler explanation/.test(visibleLower))return [visible||'Try a simpler explanation','Turn on ELI5 for this example, then see the result.'];
      if(/show me/.test(visibleLower))return [visible||'Show me','Open the example page and keep the tour beside you.'];
      if(/watch chat move/.test(visibleLower))return [visible,'Watch Chat float briefly, then return to its place.'];
      if(/moving and sizing chat/.test(visibleLower))return [visible,'Try moving Chat and giving it a little more or less room.'];
      if(/watch a card change/.test(visibleLower))return [visible,'Watch one card hide and return without stopping its work.'];
      if(/arranging a card/.test(visibleLower))return [visible,'Try changing one card’s options, place, size, and keyboard focus.'];
      if(/^next:/.test(visibleLower))return [visible,'Continue when you are ready.'];
    }
    if(action==='ui.onboarding.open_owner_flow'){
      if(/project i already have/.test(visibleLower))return [visible,'Choose where that project lives now.'];
      if(/github|elsewhere|online/.test(visibleLower))return [visible,'Bring in work that is already saved online.'];
      if(/private access/.test(visibleLower))return [visible,'Choose the simplest private way to reach this project when you are away.'];
      if(/another computer/.test(visibleLower))return [visible,'Find or connect the computer you want Puppet Master to use.'];
    }
    var exact={
      'ui.onboarding.start':['Open guided setup','Review the first-time setup choices.'],
      'ui.onboarding.next':['Continue','Go to the next setup step.'],
      'ui.onboarding.back':['Back','Return to the previous setup choice.'],
      'ui.onboarding.close':['Close setup','Leave setup and return to your workspace.'],
      'ui.onboarding.skip':['Skip for now','Continue without this optional choice.'],
      'ui.onboarding.defer':['Do this later','Save your place and return later.'],
      'ui.onboarding.open_details':['Details','Show or hide more about this step.'],
      'ui.onboarding.more_ways':['More choices','Show or hide additional choices.'],
      'ui.onboarding.choose_simple_path':['Use this starting point','Begin here; nothing changes until you review the complete setup.'],
      'ui.onboarding.open_owner_flow':['See what you need','Review this small choice before anything changes.'],
      'ui.onboarding.run_automatic_preparation':['Check my choices','Make sure the selected setup is ready.'],
      'ui.onboarding.choose_first_project':['Choose this project option','Use this choice for your first project.'],
      'ui.onboarding.finish':['Open Puppet Master','Finish setup and enter your workspace.'],
      'ui.guided_tour.start':['Start guided tour','Learn the workspace one step at a time.'],
      'ui.guided_tour.next':['Continue tour','Go to the next part of the tour.'],
      'ui.guided_tour.back':['Back','Return to the previous part of the tour.'],
      'ui.guided_tour.pause':['Pause tour','Hide the tour and keep your place.'],
      'ui.guided_tour.resume':['Resume tour','Continue from where you paused.'],
      'ui.guided_tour.skip':['Skip tour','End the tour and restore your workspace.'],
      'ui.guided_tour.replay':['Replay guided tour','Start the tour again from the beginning.'],
      'ui.guided_tour.focus_route':['Open this page','Change the page you are viewing.'],
      'ui.guided_tour.toggle_eli5':['Use simpler words','Explain the same idea with shorter words and a familiar example.'],
      'ui.guided_tour.finish':['Finish tour','Keep Teacher on the right and return to your work.'],
      'settings.onboarding.run_again':['Run setup again','Review your setup choices from the beginning.'],
      'settings.guided_tour.replay':['Replay guided tour','Learn the workspace again step by step.'],
      'reset-layout':['Reset layout','Return panels and cards to their original places.'],
      'run-onboarding':['Run setup again','Review your setup choices from the beginning.'],
      'navigate':['Open this page','Show this part of Puppet Master.'],
      'ui.settings.route.open':['Open Settings','Go to this Settings page.'],
      'all-settings-query':['Search Settings','Find a preference by name or description.'],
      'all-settings-filter':['Filter Settings','Show only preferences that match this choice.'],
      'clear-all-settings-filters':['Clear filters','Show all Settings preferences again.'],
      'browse-setting-path':['Find this setting','Open the section that contains this preference.'],
      'input-setting':['Change this setting','Update this preference.'],
      'run-setting-action':['Apply this setting','Make the requested Settings change.'],
      'open-structured-setting':['Open setting details','Review and change this preference.'],
      'open-resource-setting':['Open related settings','Review the preferences for this item.'],
      'page-options':['Page options','Change how this page is shown.'],
      'server-tab':['Computer settings','Show settings for connected computers.'],
      'browser-scm-tab':['Online project settings','Show settings for online project services.'],
      'project-sync-tab':['Project sharing settings','Show how this project stays up to date.']
    };
    if(exact[action])return exact[action];
    if(/reset[-_. ]?layout/.test(signal))return ['Reset layout','Return panels and cards to their original places.'];
    if(/run[-_. ]?onboarding|replay[-_. ]?onboarding/.test(signal))return ['Run setup again','Review your setup choices from the beginning.'];
    if(/start[-_. ]?guided[-_. ]?tour/.test(signal))return ['Start guided tour','Learn the workspace one step at a time.'];
    if(/theme/.test(signal))return ['Choose appearance','Change how Puppet Master looks.'];
    if(/settings/.test(signal)&&/add|create|new/.test(signal))return ['Add in Settings','Add another choice to this Settings section.'];
    if(/settings/.test(signal)&&/remove|delete/.test(signal))return ['Remove from Settings','Remove this choice from the Settings section.'];
    if(/settings/.test(signal)&&/edit|update|change/.test(signal))return ['Edit setting','Change this preference.'];
    if(/settings/.test(signal)&&/test|check|verify|run/.test(signal))return ['Check this setting','Make sure this choice works.'];
    if(/settings/.test(signal)&&/export|copy/.test(signal))return ['Save a copy','Save these details for later.'];
    if(/settings/.test(signal)&&/select|tab/.test(signal))return ['Open this Settings section','Show these preferences.'];
    if(/settings/.test(signal))return ['Open Settings','Change Puppet Master preferences.'];
    if(/(?:^|[-_. ])(?:navigate|open-page|page-tab)(?:$|[-_. ])/.test(signal))return ['Open this page','Show this part of Puppet Master.'];
    if(/close|dismiss/.test(signal))return ['Close','Hide this view.'];
    if(/remove|delete/.test(signal))return ['Remove','Take this item out of the current view.'];
    if(/add|create|new/.test(signal))return ['Add','Add a new item here.'];
    if(/refresh|reload|check/.test(signal))return ['Check again','Look for the latest information.'];
    if(/save|apply|confirm/.test(signal))return ['Save changes','Keep the choices you made.'];
    if(attr(el,'aria-expanded'))return ['',attr(el,'aria-expanded')==='true'?'Hide the related choices.':'Show the related choices.'];
    if(attr(el,'aria-pressed'))return ['',attr(el,'aria-pressed')==='true'?'Turn this choice off.':'Turn this choice on.'];
    if(el&&el.matches&&el.matches('[role="tab"],[data-page]'))return ['', 'Show this page.'];
    if(el&&el.matches&&el.matches('a[href]'))return ['', 'Open the linked page.'];
    if(el&&el.matches&&el.matches('input,select,textarea,[role="checkbox"],[role="radio"],[role="switch"],[role="slider"]'))return ['', 'Change this setting.'];
    return ['', 'Choose this option.'];
  }
  function looksInternal(value){return /(?:^|\s)(?:cmd|ui)\.[a-z0-9_.:-]+|\b(?:command[_ -]?id|action[_ -]?id|schema(?:[_ -]?id)?|owner[_ -]?route|runtime[_ -]?(?:handler|receipt)|fixture[_ -]?id|adapter[_ -]?id|production[_ -]?receipt|continuation[_ -]?generation|expected[_ -]?revision)\b|\bdata-[a-z0-9-]+|\b[a-z][a-z0-9-]*(?:[.:][a-z0-9_-]+)+\b|(?:^|\s)[a-z][a-z0-9-]*(?:_[a-z0-9-]+){1,}(?:\s|$)/i.test(clean(value));}
  function actionDetail(el){
    var shortcut=attr(el,'aria-keyshortcuts');if(shortcut)return 'Shortcut: '+shortcut+'.';
    return humanActionCopy(el)[1];
  }
  function descriptor(el,facts){
    facts=facts||factsFor(el)||{disabled:false,truncated:false,technical:''};
    var explicitLabel=attr(el,'data-pm-hover-label');
    var explicitDetail=attr(el,'data-pm-hover-detail');
    var legacy=attr(el,'data-hover-tip')||attr(el,'data-tooltip')||attr(el,'data-pm-hover-native-title')||attr(el,'title');
    var lines=String(legacy||'').split(/\r?\n/).map(clean).filter(Boolean);
    var structuredLabel='',structuredDetail='';
    if(el&&el.children){for(var childIndex=0;childIndex<el.children.length;childIndex++){var child=el.children[childIndex],copy=visibleText(child);if(!copy)continue;if(child.tagName==='SMALL'){if(!structuredDetail)structuredDetail=copy;}else if(!structuredLabel&&!child.matches('svg,[aria-hidden="true"]'))structuredLabel=copy;}}
    var label=explicitLabel||lines.shift()||structuredLabel||labelText(el);
    var detail=explicitDetail||lines.join(' ')||structuredDetail,actionCopy=humanActionCopy(el);
    var pin=pinState(el);
    if(pin!==null){
      var noun=/thread/i.test([label,attr(el,'data-action'),attr(el,'aria-label')].join(' '))?' thread':'';
      label=(pin?'Unpin':'Pin')+noun;
      detail=pin?'Move it back to its normal order.':'Keep it at the top.';
    }
    if(!label&&actionCopy[0])label=actionCopy[0];
    if(looksInternal(label))label=actionCopy[0]||'Choose this option';
    if(!label&&el.tagName==='INPUT')label=attr(el,'placeholder')||'Enter a value';
    var technical=facts.technical;
    if(!label){
      label=facts.status?'Current status':facts.chart?'Chart value':facts.badge?'Current state':facts.actionable?'Use this control':'More information';
    }
    if(looksInternal(detail))detail=actionCopy[1]||'See what this control does.';
    var disabledReason=attr(el,'data-disabled-reason');
    if(facts.disabled&&disabledReason)detail=disabledReason;
    if(!detail&&facts.disabled)detail='This choice is not ready yet. Move over it to learn what is still needed.';
    if(!detail&&facts.truncated){var full=visibleText(el);if(full&&full!==label)detail=full;}
    if(!detail&&facts.status)detail=el.closest&&el.closest('.pm7gt')?'Shows where you are in this tour.':'Shows the latest known state.';
    if(!detail&&facts.badge)detail='A quick summary of the current state.';
    if(!detail&&facts.chart)detail='Shows the value at this point in the chart.';
    if(!detail)detail=actionDetail(el);
    if(el.tagName==='INPUT'&&String(el.type).toLowerCase()==='password')detail='Protected value; contents are not exposed.';
    return {label:clean(label).slice(0,280),detail:clean(detail).slice(0,520)};
  }
  function structuralKey(el){
    var parts=[],node=el,depth=0;
    while(node&&node.nodeType===1&&node!==document.documentElement&&depth<64){
      var identity=attr(node,'id')||attr(node,'data-pm-surface-id')||attr(node,'data-surface-id')||attr(node,'data-widget-id')||attr(node,'data-page')||attr(node,'data-panel');
      var token=node.tagName.toLowerCase();
      if(identity)token+='#'+slug(identity);
      var action=attr(node,'data-command-id')||attr(node,'data-ui-action-id')||attr(node,'data-action')||attr(node,'name')||attr(node,'role');
      if(action)token+='@'+slug(action);
      var parent=node.parentElement;
      if(parent){var peers=Array.prototype.filter.call(parent.children,function(child){return child.tagName===node.tagName;});token+=':'+String(peers.indexOf(node)+1);}
      parts.unshift(token);node=parent;depth++;
    }
    return parts.join('>')||el.tagName.toLowerCase();
  }
  function keyOwner(registry,key){
    if(!registry||!key)return null;var owner=registry.get(key)||null;
    if(owner&&!owner.isConnected){registry.delete(key);owner=null;}return owner;
  }
  function keyFor(el,registry){
    var existing=attr(el,'data-pm-hover-key'),owner=keyOwner(registry,existing);
    if(existing&&(!owner||owner===el)){registry.set(existing,el);return existing;}
    var explicit=attr(el,'data-hover-key');
    var identity=attr(el,'id')||attr(el,'data-command-id')||attr(el,'data-ui-action-id')||attr(el,'data-action')||attr(el,'name')||technicalAttribute(el)||labelText(el);
    var base='pmht:'+(explicit?'legacy:'+slug(explicit)+':':'')+slug(identity||el.tagName)+':'+hash(structuralKey(el));
    var key=base,index=2;owner=keyOwner(registry,key);
    while(owner&&owner!==el){key=base+'-'+index;index++;owner=keyOwner(registry,key);}
    registry.set(key,el);return key;
  }
  function descriptionId(key){return 'pm-hover-desc-'+hash(key);}
  function addDescriptionToken(el,id){
    var tokens=attr(el,'aria-describedby').split(/\s+/).filter(Boolean);
    if(tokens.indexOf(id)>=0)return;tokens.push(id);el.setAttribute('aria-describedby',tokens.join(' '));
  }
  function removeDescriptionToken(el,id){
    if(!id)return;
    var tokens=attr(el,'aria-describedby').split(/\s+/).filter(function(token){return token&&token!==id;});
    if(tokens.length)el.setAttribute('aria-describedby',tokens.join(' '));else el.removeAttribute('aria-describedby');
  }
  function ensureAccessibleName(el){
    if(!el||labelText(el))return;
    var exact='';
    if(attr(el,'id')==='tbSearchInput')exact='Search files, commands, and settings';
    else if(el.matches&&el.matches('.pm6-chat-headsearch input'))exact='Search this chat';
    else if(el.matches&&el.matches('.pm6-chat-input'))exact='Message the agent';
    var fallback=attr(el,'data-pm-hover-label')||attr(el,'data-tooltip')||attr(el,'data-hover-tip')||attr(el,'title')||attr(el,'placeholder');
    var name=clean(exact||fallback).split(/\r?\n/)[0];
    if(name)setAttrIfChanged(el,'aria-label',name);
  }
  function migrateNativeTitle(el){
    var title=attr(el,'title');if(!title)return;
    if(!labelText(el))setAttrIfChanged(el,'aria-label',title.split(/\r?\n/)[0]);
    setAttrIfChanged(el,'data-pm-hover-native-title',title);el.removeAttribute('title');
  }
  function bridgeDisabled(el){
    if(!isNativeDisabled(el))return;
    setAttrIfChanged(el,'data-pm-hover-was-disabled','true');setAttrIfChanged(el,'aria-disabled','true');
    el.removeAttribute('disabled');if(el.tabIndex<0)el.tabIndex=0;
  }

  function PMHoverTag(value){
    value=value||{};this.key=clean(value.key);this.primary=clean(value.primary);this.detail=clean(value.detail);
    this.description_id=clean(value.description_id);this.kinds=(value.kinds||[]).slice();this.visual_enabled=value.visual_enabled!==false;
  }
  PMHoverTag.prototype.text=function(){return this.primary+(this.detail?' '+this.detail:'');};

  function HoverTagController(){
    this.root=null;this.tag=null;this.descriptions=null;this.active=null;this.activeModel=null;
    this.pendingOpenTimer=0;this.pendingOpenTarget=null;this.pendingOpenSource=null;this.pendingPointerIntent=null;this.departureTimer=0;this.closeTimer=0;this.scanFrame=0;this.pendingScanScope=null;this.visualEnabled=true;this.observer=null;this.overlayScope=null;
    this.keyOwners=new Map();this.preparedByElement=new WeakMap();this.scanNodes=[];this.scanPrepareCursor=0;this.scanPhase='idle';this.scanQueue=[];this.scanCursor=0;this.scanning=false;this.scanComplete=true;this.bootstrapPass=0;this.observeAfterBootstrap=false;this.lastScan={candidates:0,bound:0,duration_ms:0,batches:0};
    this.liveShallow=new Set();this.liveDeep=new Set();this.liveQueue=[];this.liveCursor=0;this.liveFrame=0;this.liveRunning=false;this.lastLive={candidates:0,bound:0,released:0,duration_ms:0,batches:0};
    this.started=false;this.motionQuery=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):null;this.reduced=!!(this.motionQuery&&this.motionQuery.matches);
    this.slint_projection=Object.freeze({
      schema_id:'pm.hover_tag.slint_projection.v1',
      model:'PMHoverTag { key: string, primary: string, detail: string, description_id: string, kinds: [HoverTagKind], visual_enabled: bool }',
      anchor_geometry:'AnchorGeometry { left: logical-length, top: logical-length, width: logical-length, height: logical-length }',
      overlay_geometry:'OverlayGeometry { left: logical-length, top: logical-length, max_width: 280px, max_height: viewport - feasible margins, gap: 8px, viewport_margin: up to 8px, placement: above|below }',
      timers:{pointer_open_ms:1600,pointer_stationary_ms:1100,pointer_radius_px:5,focus_open_ms:1000,departure_grace_ms:160,standard_motion_ms:240,retro_motion_ms:140,reduced_motion_ms:0},
      inputs:['pointer hover','pointer position','pointer press','scroll','anchor geometry','keyboard focus','Escape','theme tokens','show-tooltips','reduced motion'],
      theme_tokens:['theme family','light/dark mode','surface','border','text primary','text secondary','glass tint','glass transparency'],
      portability:'typed overlay + anchor geometry + timers + focus/hover + theme tokens; no Canvas, WebGL, browser-only physics, SVG filter, or heavy CSS filter'
    });
  }
  HoverTagController.prototype.ensureRoot=function(){
    if(this.root&&this.root.isConnected)return;
    var root=document.getElementById(ROOT_ID);
    if(!root){root=document.createElement('div');root.id=ROOT_ID;root.setAttribute('data-visual-enabled','true');root.setAttribute('data-pm-hover-exempt','tooltip-owner');
      root.innerHTML='<div id="'+TAG_ID+'" class="pm-hover-tag" role="tooltip" aria-hidden="true" data-open="false" data-detail="false" data-placement="above"><strong></strong><p></p></div><div id="'+DESCRIPTIONS_ID+'" class="pm-hover-sr" aria-live="off"></div>';document.body.appendChild(root);}
    this.root=root;this.tag=root.querySelector('#'+TAG_ID);this.descriptions=root.querySelector('#'+DESCRIPTIONS_ID);
  };
  HoverTagController.prototype.prepare=function(el){
    var facts=factsFor(el);if(!isCandidate(el,facts)||attr(el,'data-pm-hover-exempt'))return null;
    return {el:el,facts:facts,info:descriptor(el,facts)};
  };
  HoverTagController.prototype.bind=function(el,prepared){
    prepared=prepared&&prepared.el===el?prepared:this.preparedByElement.get(el)||this.prepare(el);if(!prepared)return null;
    var facts=prepared.facts,info=prepared.info;
    var currentKey=attr(el,'data-pm-hover-key'),currentId=currentKey&&descriptionId(currentKey),currentDesc=currentId&&document.getElementById(currentId);
    var currentOwner=currentKey&&keyOwner(this.keyOwners,currentKey),currentKinds=facts.kinds.join(','),currentText=info.label+(info.detail?' '+info.detail:'');
    var describedBy=attr(el,'aria-describedby').split(/\s+/);
    if(currentKey&&(!currentOwner||currentOwner===el)&&attr(el,'data-pm-hover-bound')==='true'&&attr(el,'data-pm-hover-kind')===currentKinds&&
       currentDesc&&currentDesc.getAttribute('role')==='tooltip'&&currentDesc.textContent===currentText&&describedBy.indexOf(currentId)>=0&&
       !facts.native_title&&!isNativeDisabled(el)&&labelText(el)){
      this.keyOwners.set(currentKey,el);
      return new PMHoverTag({key:currentKey,primary:info.label,detail:info.detail,description_id:currentId,kinds:facts.kinds,visual_enabled:this.visualEnabled});
    }
    ensureAccessibleName(el);migrateNativeTitle(el);bridgeDisabled(el);
    var previousKey=attr(el,'data-pm-hover-key'),key=keyFor(el,this.keyOwners),id=descriptionId(key),kindList=facts.kinds;
    if(previousKey&&previousKey!==key){removeDescriptionToken(el,descriptionId(previousKey));if(this.keyOwners.get(previousKey)===el)this.keyOwners.delete(previousKey);}
    this.keyOwners.set(key,el);
    setAttrIfChanged(el,'data-pm-hover-key',key);setAttrIfChanged(el,'data-pm-hover-bound','true');setAttrIfChanged(el,'data-pm-hover-kind',kindList.join(','));
    addDescriptionToken(el,id);
    var desc=document.getElementById(id);
    if(!desc){desc=document.createElement('span');desc.id=id;desc.className='pm-hover-description';this.descriptions.appendChild(desc);}
    if(overlayAllows(el)){setAttrIfChanged(desc,'role','tooltip');desc.removeAttribute('aria-hidden');}else{setAttrIfChanged(desc,'role','presentation');setAttrIfChanged(desc,'aria-hidden','true');}
    setAttrIfChanged(desc,'data-pm-hover-description-key',key);if(desc.textContent!==currentText)desc.textContent=currentText;
    return new PMHoverTag({key:key,primary:info.label,detail:info.detail,description_id:id,kinds:kindList,visual_enabled:this.visualEnabled});
  };
  HoverTagController.prototype.release=function(el){
    if(!el||el.nodeType!==1)return false;var key=attr(el,'data-pm-hover-key'),id=key&&descriptionId(key);
    if(this.pendingOpenTarget===el)this.cancelPendingOpen();
    var owner=key&&this.keyOwners.get(key),owns=!owner||owner===el;if(id)removeDescriptionToken(el,id);if(key&&owner===el)this.keyOwners.delete(key);
    ['data-pm-hover-key','data-pm-hover-bound','data-pm-hover-kind'].forEach(function(name){if(el.hasAttribute(name))el.removeAttribute(name);});
    var desc=id&&document.getElementById(id);if(desc&&owns)desc.remove();if(this.active===el)this.close(true);return !!key;
  };
  HoverTagController.prototype.collect=function(scope){
    var root=scope&&scope.nodeType===1?scope:document,all=[];
    if(root.nodeType===1&&!inOwner(root)&&root.matches(ACTION_SELECTOR+','+SEMANTIC_SELECTOR))all.push(root);
    /* Query only the declared selector union. Candidate analysis is a separate
       read phase so binding writes cannot force one layout per element. */
    var nodes=root.querySelectorAll?root.querySelectorAll(ACTION_SELECTOR+','+SEMANTIC_SELECTOR):[];
    for(var i=0;i<nodes.length;i++)if(!inOwner(nodes[i]))all.push(nodes[i]);
    return all;
  };
  HoverTagController.prototype.scan=function(scope){
    this.ensureRoot();this.syncVisualSetting();var started=performance.now(),nodes=this.collect(scope),prepared=[],bound=0;
    for(var i=0;i<nodes.length;i++){var row=this.prepare(nodes[i]);if(row)prepared.push(row);}
    for(var j=0;j<prepared.length;j++)if(this.bind(prepared[j].el,prepared[j]))bound++;
    this.pruneKeyOwners();this.lastScan={candidates:prepared.length,bound:bound,duration_ms:performance.now()-started,batches:1};
    return this.lastScan;
  };
  function commonScanScope(a,b){
    if(!a||!b||a===document||b===document||!a.isConnected||!b.isConnected)return document;
    if(a===b||a.contains(b))return a;if(b.contains(a))return b;
    var node=a.parentElement;while(node&&!node.contains(b))node=node.parentElement;return node||document;
  }
  HoverTagController.prototype.scheduleScan=function(scope){
    var self=this,next=scope&&scope.isConnected?scope:document;
    this.pendingScanScope=this.pendingScanScope?commonScanScope(this.pendingScanScope,next):next;
    this.scanComplete=false;if(this.scanFrame||this.scanning)return;
    this.scanFrame=requestAnimationFrame(function(){var pending=self.pendingScanScope||document;self.pendingScanScope=null;self.scanFrame=0;self.beginScan(pending);});
  };
  HoverTagController.prototype.pruneKeyOwners=function(){
    var self=this;this.keyOwners.forEach(function(el,key){if(el&&el.isConnected)return;self.keyOwners.delete(key);var desc=document.getElementById(descriptionId(key));if(desc)desc.remove();});
  };
  HoverTagController.prototype.beginScan=function(scope){
    if(this.liveRunning){var delayed=this;this.scanFrame=requestAnimationFrame(function(){delayed.scanFrame=0;delayed.beginScan(scope);});return;}
    this.ensureRoot();this.syncVisualSetting();this.preparedByElement=new WeakMap();
    this.scanStartedAt=performance.now();this.scanNodes=this.collect(scope);this.scanPrepareCursor=0;this.scanPhase='prepare';this.scanQueue=[];this.scanCursor=0;this.scanning=true;this.scanComplete=false;this.scanBound=0;this.scanCandidates=0;this.scanBatches=0;this.processScanBatch();
  };
  HoverTagController.prototype.processScanBatch=function(){
    if(!this.scanning)return;var self=this,started=performance.now(),limit;
    if(this.scanPhase==='prepare'){
      /* The time budget is the frame-safety authority. A 48-node hard cap
         stretched PM7's broad selector prefilter across nearly a thousand
         frames even when each candidate was cheap, leaving accessibility
         descriptions unsettled for many seconds. Keep a generous count guard
         for pathological clocks while consuming cheap rows until 3 ms. */
      limit=Math.min(this.scanNodes.length,this.scanPrepareCursor+384);
      while(this.scanPrepareCursor<limit&&performance.now()-started<3){var candidate=this.prepare(this.scanNodes[this.scanPrepareCursor++]);if(candidate){this.scanQueue.push(candidate);this.preparedByElement.set(candidate.el,candidate);}}
      this.scanBatches++;
      if(this.scanPrepareCursor<this.scanNodes.length){this.scanFrame=requestAnimationFrame(function(){self.scanFrame=0;self.processScanBatch();});return;}
      this.scanCandidates=this.scanQueue.length;this.scanNodes=[];this.scanPhase='bind';
      this.scanFrame=requestAnimationFrame(function(){self.scanFrame=0;self.processScanBatch();});return;
    }
    limit=Math.min(this.scanQueue.length,this.scanCursor+192);
    while(this.scanCursor<limit&&performance.now()-started<4){var row=this.scanQueue[this.scanCursor++];if(this.bind(row.el,row))this.scanBound++;}
    this.scanBatches++;
    if(this.scanCursor<this.scanQueue.length){this.scanFrame=requestAnimationFrame(function(){self.scanFrame=0;self.processScanBatch();});return;}
    this.scanning=false;this.scanPhase='idle';this.scanQueue=[];this.preparedByElement=new WeakMap();this.pruneKeyOwners();this.lastScan={candidates:this.scanCandidates,bound:this.scanBound,duration_ms:performance.now()-this.scanStartedAt,batches:this.scanBatches};
    if(this.pendingScanScope){var pending=this.pendingScanScope;this.pendingScanScope=null;this.scheduleScan(pending);return;}
    this.scanComplete=true;
  };
  HoverTagController.prototype.whenIdle=function(){
    var self=this;return new Promise(function(resolve){function inspect(){if(self.scanComplete&&!self.scanning&&!self.scanFrame&&!self.pendingScanScope){resolve(self.lastScan);return;}requestAnimationFrame(inspect);}inspect();});
  };
  HoverTagController.prototype.enqueueLive=function(el,deep){
    if(!el||el.nodeType!==1||!el.isConnected||inOwner(el))return;var self=this,covered=false,remove=[];
    if(deep){
      this.liveDeep.forEach(function(root){if(root===el||root.contains(el))covered=true;else if(el.contains(root))remove.push(root);});
      if(!covered){remove.forEach(function(root){self.liveDeep.delete(root);});this.liveDeep.add(el);this.liveShallow.forEach(function(node){if(el.contains(node))self.liveShallow.delete(node);});}
    }else{
      this.liveDeep.forEach(function(root){if(root===el||root.contains(el))covered=true;});if(!covered)this.liveShallow.add(el);
    }
    if(!this.liveFrame&&!this.liveRunning){this.liveFrame=requestAnimationFrame(function(){self.liveFrame=0;self.beginLive();});}
  };
  HoverTagController.prototype.cleanupRemoved=function(root){
    if(!root||root.nodeType!==1)return;var self=this,nodes=[];
    if(attr(root,'data-pm-hover-bound')==='true')nodes.push(root);
    var descendants=root.querySelectorAll?root.querySelectorAll('[data-pm-hover-bound="true"]'):[];
    for(var i=0;i<descendants.length;i++)nodes.push(descendants[i]);
    nodes.forEach(function(node){self.release(node);});if(this.active&&(this.active===root||root.contains(this.active)))this.close(true);
  };
  HoverTagController.prototype.beginLive=function(){
    var self=this;if(this.scanning||this.scanFrame){this.liveFrame=requestAnimationFrame(function(){self.liveFrame=0;self.beginLive();});return;}
    var nodes=[],seen=new Set();function add(node){if(!node||node.nodeType!==1||!node.isConnected||inOwner(node)||seen.has(node))return;seen.add(node);nodes.push(node);}
    this.liveShallow.forEach(add);this.liveDeep.forEach(function(root){
      add(root);var descendants=root.querySelectorAll?root.querySelectorAll(ACTION_SELECTOR+','+SEMANTIC_SELECTOR+',[data-pm-hover-bound="true"]'):[];
      for(var i=0;i<descendants.length;i++)add(descendants[i]);
    });
    this.liveShallow.clear();this.liveDeep.clear();var queue=[];
    for(var i=0;i<nodes.length;i++){var prepared=this.prepare(nodes[i]);if(prepared||attr(nodes[i],'data-pm-hover-bound')==='true')queue.push({el:nodes[i],prepared:prepared});}
    if(!queue.length){this.lastLive={candidates:0,bound:0,released:0,duration_ms:0,batches:0};return;}
    this.liveQueue=queue;this.liveCursor=0;this.liveRunning=true;this.liveStartedAt=performance.now();this.liveBound=0;this.liveReleased=0;this.liveBatches=0;this.processLiveBatch();
  };
  HoverTagController.prototype.processLiveBatch=function(){
    if(!this.liveRunning)return;var self=this,started=performance.now(),limit=Math.min(this.liveQueue.length,this.liveCursor+72);
    while(this.liveCursor<limit&&performance.now()-started<4){var row=this.liveQueue[this.liveCursor++];if(!row.el.isConnected||!row.prepared){if(this.release(row.el))this.liveReleased++;}else{var model=this.bind(row.el,row.prepared);if(model){this.liveBound++;if(this.active===row.el){this.activeModel=model;this.render(model);this.position();}}}}
    this.liveBatches++;
    if(this.liveCursor<this.liveQueue.length){this.liveFrame=requestAnimationFrame(function(){self.liveFrame=0;self.processLiveBatch();});return;}
    this.liveRunning=false;this.liveQueue=[];this.lastLive={candidates:this.liveCursor,bound:this.liveBound,released:this.liveReleased,duration_ms:performance.now()-this.liveStartedAt,batches:this.liveBatches};
    if(this.liveShallow.size||this.liveDeep.size)this.liveFrame=requestAnimationFrame(function(){self.liveFrame=0;self.beginLive();});
  };
  HoverTagController.prototype.refresh=function(el){
    if(!el||!el.isConnected)return null;var model=this.bind(el);
    if(this.active===el&&model){this.activeModel=model;this.render(model);this.position();}
    return model;
  };
  HoverTagController.prototype.motionMs=function(){
    if(this.reduced)return 0;return /^retro-/.test(attr(document.documentElement,'data-theme'))?140:240;
  };
  HoverTagController.prototype.render=function(model){
    if(!model)return;this.ensureRoot();
    this.tag.querySelector('strong').textContent=model.primary;this.tag.querySelector('p').textContent=model.detail;
    this.tag.setAttribute('data-detail',model.detail?'true':'false');this.tag.setAttribute('data-hover-key',model.key);
  };
  HoverTagController.prototype.overlayAllows=function(el){return overlayAllows(el);};
  function anchorGeometry(el){var rect=el&&el.getBoundingClientRect?el.getBoundingClientRect():null;return rect?{left:rect.left,top:rect.top,width:rect.width,height:rect.height}:null;}
  function sameGeometry(a,b){return !!a&&!!b&&Math.abs(a.left-b.left)<=.5&&Math.abs(a.top-b.top)<=.5&&Math.abs(a.width-b.width)<=.5&&Math.abs(a.height-b.height)<=.5;}
  function viewportGeometry(){var visual=window.visualViewport,width=visual&&visual.width||innerWidth,height=visual&&visual.height||innerHeight;return {left:visual&&visual.offsetLeft||0,top:visual&&visual.offsetTop||0,width:Math.max(1,width),height:Math.max(1,height)};}
  function feasibleMargin(size){return Math.min(MARGIN,Math.max(0,(size-1)/2));}
  function clamp(value,minimum,maximum){return Math.max(minimum,Math.min(value,Math.max(minimum,maximum)));}
  HoverTagController.prototype.cancelPendingOpen=function(){clearTimeout(this.pendingOpenTimer);this.pendingOpenTimer=0;this.pendingOpenTarget=null;this.pendingOpenSource=null;this.pendingPointerIntent=null;};
  HoverTagController.prototype.dropStaleTargets=function(){
    if(this.pendingOpenTarget&&!this.pendingOpenTarget.isConnected)this.cancelPendingOpen();
    if(this.active&&(!this.active.isConnected||!this.overlayAllows(this.active))){this.close(true);return true;}
    return false;
  };
  HoverTagController.prototype.schedulePointerIntent=function(){
    var intent=this.pendingPointerIntent,target=this.pendingOpenTarget;if(!intent||!target||this.pendingOpenSource!=='pointer')return false;
    clearTimeout(this.pendingOpenTimer);var self=this,now=performance.now(),due=Math.max(intent.entered_at+POINTER_OPEN_MS,intent.stationary_at+POINTER_STATIONARY_MS);
    this.pendingOpenTimer=setTimeout(function(){self.finishPendingOpen(target,'pointer');},Math.max(0,due-now));return true;
  };
  HoverTagController.prototype.resetPointerStationary=function(event,geometry){
    var intent=this.pendingPointerIntent;if(!intent)return false;var now=performance.now();intent.stationary_at=now;
    if(event&&Number.isFinite(event.clientX)&&Number.isFinite(event.clientY)){intent.origin_x=event.clientX;intent.origin_y=event.clientY;intent.pointer_id=event.pointerId==null?intent.pointer_id:event.pointerId;}
    intent.anchor_geometry=geometry||anchorGeometry(this.pendingOpenTarget);this.schedulePointerIntent();return true;
  };
  HoverTagController.prototype.notePointerMove=function(event,el){
    if(!event||event.buttons||!el)return false;
    if(!this.pendingOpenTarget){if(!this.active)this.open(el,'pointer',event);return true;}
    if(this.pendingOpenSource!=='pointer'||this.pendingOpenTarget!==el)return false;
    var intent=this.pendingPointerIntent,geometry=anchorGeometry(el);if(!intent)return false;
    if(!sameGeometry(intent.anchor_geometry,geometry)){this.resetPointerStationary(event,geometry);return true;}
    var dx=event.clientX-intent.origin_x,dy=event.clientY-intent.origin_y;if(dx*dx+dy*dy>POINTER_RADIUS_PX*POINTER_RADIUS_PX)this.resetPointerStationary(event,geometry);
    return true;
  };
  HoverTagController.prototype.finishPendingOpen=function(el,source){
    var target=this.pendingOpenTarget,pendingSource=this.pendingOpenSource,intent=this.pendingPointerIntent;
    if(target!==el||pendingSource!==source)return false;
    if(source==='pointer'){
      var geometry=anchorGeometry(target);if(!sameGeometry(intent&&intent.anchor_geometry,geometry)){this.resetPointerStationary(null,geometry);return false;}
    }
    this.cancelPendingOpen();
    if(!target.isConnected||!this.visualEnabled||!this.overlayAllows(target)||!isCandidate(target)||attr(target,'data-pm-hover-exempt')||attr(target,'data-pm-hover-visual-suppressed')==='true')return false;
    var stillPresent=source==='focus'?(target===document.activeElement||target.contains(document.activeElement)):false;
    if(source==='pointer')try{stillPresent=target.matches(':hover');}catch(_error){stillPresent=false;}
    if(!stillPresent)return false;
    var current=this.refresh(target)||this.bind(target);if(!current)return false;
    this.active=target;this.activeModel=current;this.render(current);this.tag.hidden=false;this.tag.setAttribute('aria-hidden','true');
    this.tag.setAttribute('data-source',source);this.position();this.tag.setAttribute('data-open','true');this.position();return true;
  };
  HoverTagController.prototype.syncOverlayState=function(){
    var overlay=activeOverlay();if(this.pendingOpenTarget&&!overlayAllows(this.pendingOpenTarget))this.cancelPendingOpen();
    if(this.active&&!overlayAllows(this.active))this.close(true);
    if(overlay===this.overlayScope)return;this.overlayScope=overlay;var self=this;
    this.keyOwners.forEach(function(el,key){var desc=document.getElementById(descriptionId(key));if(!desc)return;if(overlayAllows(el)){setAttrIfChanged(desc,'role','tooltip');desc.removeAttribute('aria-hidden');}else{setAttrIfChanged(desc,'role','presentation');setAttrIfChanged(desc,'aria-hidden','true');}});
  };
  HoverTagController.prototype.open=function(el,source,event){
    this.dropStaleTargets();
    if(!isCandidate(el)||attr(el,'data-pm-hover-exempt')||attr(el,'data-pm-hover-visual-suppressed')==='true'||!this.overlayAllows(el)){this.cancelPendingOpen();if(this.active&&this.active!==el)this.close(true);return false;}
    clearTimeout(this.departureTimer);clearTimeout(this.closeTimer);this.syncVisualSetting();
    var model=this.refresh(el)||this.bind(el);if(!model)return false;
    if(!this.visualEnabled){this.cancelPendingOpen();return false;}
    source=source==='focus'?'focus':'pointer';
    if(this.active===el&&this.tag&&this.tag.getAttribute('data-open')==='true')return true;
    if(this.pendingOpenTarget===el&&this.pendingOpenSource===source)return true;
    this.cancelPendingOpen();if(this.active&&this.active!==el)this.close(false);
    var self=this,now=performance.now();this.pendingOpenTarget=el;this.pendingOpenSource=source;
    if(source==='pointer'){
      var geometry=anchorGeometry(el),x=event&&Number.isFinite(event.clientX)?event.clientX:geometry.left+geometry.width/2,y=event&&Number.isFinite(event.clientY)?event.clientY:geometry.top+geometry.height/2;
      this.pendingPointerIntent={entered_at:now,stationary_at:now,origin_x:x,origin_y:y,pointer_id:event&&event.pointerId!=null?event.pointerId:null,anchor_geometry:geometry};this.schedulePointerIntent();
    }else this.pendingOpenTimer=setTimeout(function(){self.finishPendingOpen(el,'focus');},FOCUS_OPEN_MS);
    return true;
  };
  HoverTagController.prototype.close=function(immediate){
    this.cancelPendingOpen();clearTimeout(this.departureTimer);clearTimeout(this.closeTimer);this.active=null;this.activeModel=null;
    if(!this.tag)return;this.tag.setAttribute('data-open','false');
    if(immediate){this.closeTimer=0;this.tag.hidden=true;return;}
    var self=this,delay=this.motionMs();this.closeTimer=setTimeout(function(){if(!self.active&&self.tag)self.tag.hidden=true;},delay);
  };
  HoverTagController.prototype.depart=function(el){
    if(this.pendingOpenTarget&&(!el||this.pendingOpenTarget===el))this.cancelPendingOpen();
    var self=this;clearTimeout(this.departureTimer);this.departureTimer=setTimeout(function(){
      var el=self.active;if(!el)return;
      var focused=el===document.activeElement||el.contains(document.activeElement);
      var hovered=false;try{hovered=el.matches(':hover');}catch(_error){}
      if(!focused&&!hovered)self.close(false);
    },DEPARTURE_GRACE_MS);
  };
  HoverTagController.prototype.position=function(){
    if(this.dropStaleTargets()||!this.active||!this.tag||this.tag.hidden)return null;
    var anchor=this.active.getBoundingClientRect(),viewport=viewportGeometry(),marginX=feasibleMargin(viewport.width),marginY=feasibleMargin(viewport.height);
    var viewportRight=viewport.left+viewport.width,viewportBottom=viewport.top+viewport.height;
    this.tag.style.maxWidth=Math.min(MAX_WIDTH,Math.max(1,viewport.width-marginX*2))+'px';
    var availableHeight=Math.max(1,viewport.height-marginY*2);this.tag.style.minHeight=Math.min(24,availableHeight)+'px';this.tag.style.maxHeight=availableHeight+'px';
    var rect=this.tag.getBoundingClientRect(),left=anchor.left+anchor.width/2-rect.width/2;
    left=clamp(left,viewport.left+marginX,viewportRight-marginX-rect.width);
    var top=anchor.top-rect.height-GAP,placement='above';
    if(top<viewport.top+marginY){top=anchor.bottom+GAP;placement='below';}
    /* A tag inside a teaching card must explain the control without covering
       the lesson. Prefer a free edge outside the active modal/callout; only
       fall back to ordinary anchor placement when the viewport has no such
       region. */
    var teachingPanel=this.active.closest&&this.active.closest('.pm7gt-callout,.pm7ob-window');
    if(teachingPanel){var panel=teachingPanel.getBoundingClientRect(),outside=[
      {placement:'panel-right',left:panel.right+GAP,top:anchor.top+anchor.height/2-rect.height/2},
      {placement:'panel-left',left:panel.left-GAP-rect.width,top:anchor.top+anchor.height/2-rect.height/2},
      {placement:'panel-below',left:anchor.left+anchor.width/2-rect.width/2,top:panel.bottom+GAP},
      {placement:'panel-above',left:anchor.left+anchor.width/2-rect.width/2,top:panel.top-GAP-rect.height}
    ].filter(function(row){return row.left>=viewport.left+marginX&&row.top>=viewport.top+marginY&&row.left+rect.width<=viewportRight-marginX&&row.top+rect.height<=viewportBottom-marginY;});if(outside.length){outside.sort(function(a,b){var ah=Math.abs(a.left-(anchor.left+anchor.width/2))+Math.abs(a.top-(anchor.top+anchor.height/2)),bh=Math.abs(b.left-(anchor.left+anchor.width/2))+Math.abs(b.top-(anchor.top+anchor.height/2));return ah-bh;});left=outside[0].left;top=outside[0].top;placement=outside[0].placement;}}
    left=clamp(left,viewport.left+marginX,viewportRight-marginX-rect.width);
    top=clamp(top,viewport.top+marginY,viewportBottom-marginY-rect.height);
    this.tag.style.left=Math.round(left)+'px';this.tag.style.top=Math.round(top)+'px';this.tag.setAttribute('data-placement',placement);
    return {left:left,top:top,width:rect.width,height:rect.height,placement:placement,gap:GAP,margin_x:marginX,margin_y:marginY};
  };
  HoverTagController.prototype.readVisualSetting=function(){
    try{
      var api=window.PM12_KIMI,state=api&&typeof api.getState==='function'?api.getState():null;
      if(state&&state.settings&&Object.prototype.hasOwnProperty.call(state.settings,'general.interaction.show-tooltips'))return state.settings['general.interaction.show-tooltips']!==false;
      var cats=window.PM12_REFERENCE&&window.PM12_REFERENCE.byCat;
      if(cats)for(var key in cats){var rows=cats[key]&&cats[key].settings||[];for(var i=0;i<rows.length;i++)if(rows[i].id==='general.interaction.show-tooltips')return rows[i].value!==false;}
    }catch(_error){}
    return true;
  };
  HoverTagController.prototype.syncVisualSetting=function(){return this.setVisualEnabled(this.readVisualSetting());};
  HoverTagController.prototype.setVisualEnabled=function(value){
    this.ensureRoot();this.visualEnabled=value!==false;this.root.setAttribute('data-visual-enabled',String(this.visualEnabled));
    if(!this.visualEnabled){this.cancelPendingOpen();this.active=null;this.activeModel=null;clearTimeout(this.departureTimer);clearTimeout(this.closeTimer);if(this.tag){this.tag.setAttribute('data-open','false');this.tag.hidden=true;}}
    return this.visualEnabled;
  };
  HoverTagController.prototype.observe=function(){
    var self=this;if(this.observer)this.observer.disconnect();
    this.observer=new MutationObserver(function(records){
      for(var i=0;i<records.length;i++){
        var record=records[i];
        if(record.target&&record.target.nodeType===1&&inOwner(record.target))continue;
        /* Several retained shell fitters truthfully reassert the same ARIA/tab
           value while reconciling geometry. MutationObserver still reports
           those writes. Treat exact old/current equality as the semantic no-op
           it is, while preserving every real add/remove/change notification. */
        if(record.type==='attributes'&&record.target&&record.target.nodeType===1&&record.oldValue===record.target.getAttribute(record.attributeName))continue;
        /* Dynamic components sometimes restore a native title after their
           initial render. Migrate it in this observer microtask so the
           browser-native tooltip never becomes the user-facing path. */
        if(record.type==='attributes'&&record.attributeName==='title'&&record.target&&record.target.nodeType===1){self.bind(record.target);continue;}
        if(record.type==='attributes'&&record.target&&record.target.nodeType===1){
          if(record.target===document.documentElement&&record.attributeName==='data-theme'){self.position();continue;}
          self.enqueueLive(record.target,false);continue;
        }
        if(record.type==='characterData'){
          var parent=record.target&&record.target.parentElement,bound=parent&&parent.closest&&parent.closest('[data-pm-hover-bound="true"],'+ACTION_SELECTOR+','+SEMANTIC_SELECTOR);
          if(bound)self.enqueueLive(bound,false);continue;
        }
        if(record.type==='childList'){
          var target=record.target&&record.target.nodeType===1?record.target:null,targetBound=target&&target.closest&&target.closest('[data-pm-hover-bound="true"],'+ACTION_SELECTOR+','+SEMANTIC_SELECTOR);
          if(targetBound&&!inOwner(targetBound))self.enqueueLive(targetBound,false);
          for(var j=0;j<record.addedNodes.length;j++)if(record.addedNodes[j].nodeType===1&&!inOwner(record.addedNodes[j]))self.enqueueLive(record.addedNodes[j],true);
          for(var k=0;k<record.removedNodes.length;k++)if(record.removedNodes[k].nodeType===1)self.cleanupRemoved(record.removedNodes[k]);
        }
      }
      self.syncOverlayState();
    });
    this.observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeOldValue:true,attributeFilter:[
      'title','class','role','tabindex','href','disabled','hidden','aria-disabled','aria-label','aria-pressed','aria-selected',
      'data-action','data-command-id','data-ui-action-id','data-hover-tip','data-tooltip','data-hover-key','data-status','data-truncated',
      'data-technical-id','data-chart-mark','data-value','data-pinned','data-pm-hover-label','data-pm-hover-detail','data-pm-hover-exempt','data-theme','data-open'
    ]});return true;
  };
  HoverTagController.prototype.disconnect=function(){if(this.observer)this.observer.disconnect();this.cancelPendingOpen();cancelAnimationFrame(this.scanFrame);cancelAnimationFrame(this.liveFrame);this.scanFrame=0;this.liveFrame=0;this.pendingScanScope=null;this.scanNodes=[];this.scanPrepareCursor=0;this.scanPhase='idle';this.scanQueue=[];this.liveQueue=[];this.liveShallow.clear();this.liveDeep.clear();this.scanning=false;this.liveRunning=false;this.scanComplete=true;};
  HoverTagController.prototype.settle=function(scope){
    var self=this;this.scheduleScan(scope);return this.whenIdle().then(function(){return new Promise(function(resolve){requestAnimationFrame(function(){self.scan(scope);resolve(self.audit(scope));});});});
  };
  HoverTagController.prototype.audit=function(scope){
    this.ensureRoot();var nodes=this.collect(scope),failures=[],keys={},descriptions={},counts={candidates:nodes.length,bound:0,exemptions:0,actionable:0,truncated:0,technical_identifiers:0,statuses:0,badges:0,chart_marks:0,disabled:0};
    for(var i=0;i<nodes.length;i++){
      var el=nodes[i],kindList=kinds(el),exemption=attr(el,'data-pm-hover-exempt'),key=attr(el,'data-pm-hover-key');
      if(kindList.indexOf('actionable')>=0)counts.actionable++;if(kindList.indexOf('truncated')>=0)counts.truncated++;if(kindList.indexOf('technical-identifier')>=0)counts.technical_identifiers++;
      if(kindList.indexOf('status')>=0)counts.statuses++;if(kindList.indexOf('badge')>=0)counts.badges++;if(kindList.indexOf('chart-mark')>=0)counts.chart_marks++;if(isDisabled(el))counts.disabled++;
      if(exemption){counts.exemptions++;if(!EXEMPTIONS[exemption])failures.push({code:'undocumented_exemption',key:key||null,reason:exemption});if(isActionable(el))failures.push({code:'actionable_exemption',key:key||null,reason:exemption});continue;}
      if(key)(keys[key]||(keys[key]=[])).push(el);
      if(attr(el,'title'))failures.push({code:'native_title_only',key:key||null,title:attr(el,'title')});
      if(attr(el,'data-pm-hover-bound')!=='true'||!key){failures.push({code:'missing_binding',key:key||null,element:el.tagName.toLowerCase()});continue;}
      counts.bound++;
      var id=descriptionId(key),desc=document.getElementById(id),expected=descriptor(el),text=expected.label+(expected.detail?' '+expected.detail:'');
      var expectedRole=overlayAllows(el)?'tooltip':'presentation';
      if(!desc||desc.getAttribute('role')!==expectedRole||attr(el,'aria-describedby').split(/\s+/).indexOf(id)<0)failures.push({code:'missing_accessible_description',key:key,description_id:id});
      else {if(desc.textContent!==text)failures.push({code:'stale_text',key:key,expected:text,actual:desc.textContent});(descriptions[id]||(descriptions[id]=[])).push(key);}
      if(isDisabled(el)&&(el.tabIndex<0||attr(el,'aria-disabled')!=='true'))failures.push({code:'inaccessible_disabled_control',key:key,tab_index:el.tabIndex});
    }
    Object.keys(keys).forEach(function(key){if(keys[key].length>1)failures.push({code:'duplicate_key',key:key,count:keys[key].length});});
    Object.keys(descriptions).forEach(function(id){var unique=Array.from(new Set(descriptions[id]));if(unique.length>1)failures.push({code:'duplicate_description_id',description_id:id,keys:unique});});
    if(this.active&&this.tag&&!this.tag.hidden&&this.visualEnabled){var r=this.tag.getBoundingClientRect(),viewport=viewportGeometry(),marginX=feasibleMargin(viewport.width),marginY=feasibleMargin(viewport.height),right=viewport.left+viewport.width,bottom=viewport.top+viewport.height;if(r.left<viewport.left+marginX-.5||r.top<viewport.top+marginY-.5||r.right>right-marginX+.5||r.bottom>bottom-marginY+.5)failures.push({code:'clipping',rect:{left:r.left,top:r.top,right:r.right,bottom:r.bottom},viewport:viewport,margin_x:marginX,margin_y:marginY});}
    return {schema_id:'pm.hover_tag.census.v1',pass:failures.length===0,counts:counts,failures:failures,exemption_registry:EXEMPTIONS,slint_projection:this.slint_projection};
  };
  HoverTagController.prototype.start=function(){
    if(this.started)return this;this.started=true;this.ensureRoot();var self=this;
    if(this.motionQuery){var motionChanged=function(event){self.reduced=!!event.matches;if(self.reduced&&self.tag)self.tag.style.transition='none';else if(self.tag)self.tag.style.transition='';};if(this.motionQuery.addEventListener)this.motionQuery.addEventListener('change',motionChanged);else if(this.motionQuery.addListener)this.motionQuery.addListener(motionChanged);}
    document.addEventListener('pointerover',function(event){var el=event.target&&event.target.closest&&event.target.closest('[data-pm-hover-bound="true"],'+ACTION_SELECTOR+','+SEMANTIC_SELECTOR);if(el&&!inOwner(el))self.open(el,'pointer',event);},true);
    document.addEventListener('pointermove',function(event){var el=event.target&&event.target.closest&&event.target.closest('[data-pm-hover-bound="true"],'+ACTION_SELECTOR+','+SEMANTIC_SELECTOR);if(el&&!inOwner(el))self.notePointerMove(event,el);},true);
    document.addEventListener('pointerout',function(event){var el=event.target&&event.target.closest&&event.target.closest('[data-pm-hover-bound="true"]');if(el&&(!event.relatedTarget||!el.contains(event.relatedTarget)))self.depart(el);},true);
    document.addEventListener('pointerdown',function(){if(self.pendingOpenSource==='pointer')self.cancelPendingOpen();if(self.active&&self.tag&&self.tag.getAttribute('data-source')==='pointer')self.close(true);},true);
    document.addEventListener('focusin',function(event){var el=event.target&&event.target.closest&&event.target.closest('[data-pm-hover-bound="true"],'+ACTION_SELECTOR+','+SEMANTIC_SELECTOR);if(el&&!inOwner(el))self.open(el,'focus');},true);
    document.addEventListener('focusout',function(event){var el=event.target&&event.target.closest&&event.target.closest('[data-pm-hover-bound="true"]');if(el&&(!event.relatedTarget||!el.contains(event.relatedTarget)))self.depart(el);},true);
    document.addEventListener('keydown',function(event){
      if(event.key==='Escape'&&(self.active||self.pendingOpenTarget)){self.close(true);return;}
      var el=event.target&&event.target.closest&&event.target.closest('[data-pm-hover-was-disabled="true"]');
      if(el&&(event.key==='Enter'||event.key===' ')){event.preventDefault();event.stopImmediatePropagation();}
    },true);
    BLOCKED_EVENTS.forEach(function(type){document.addEventListener(type,function(event){var el=event.target&&event.target.closest&&event.target.closest('[data-pm-hover-was-disabled="true"]');if(el){event.preventDefault();event.stopImmediatePropagation();}},true);});
    var viewportChanged=function(){if(self.pendingOpenSource==='pointer')self.resetPointerStationary(null,anchorGeometry(self.pendingOpenTarget));self.position();};
    window.addEventListener('resize',viewportChanged);if(window.visualViewport){window.visualViewport.addEventListener('resize',viewportChanged);window.visualViewport.addEventListener('scroll',viewportChanged);}
    window.addEventListener('scroll',function(){if(self.pendingOpenSource==='pointer')self.cancelPendingOpen();if(self.active&&self.tag&&self.tag.getAttribute('data-source')==='pointer')self.close(true);else self.position();},true);
    document.addEventListener('input',function(event){self.syncVisualSetting();if(event.target&&event.target.nodeType===1)self.enqueueLive(event.target,false);},true);document.addEventListener('change',function(event){self.syncVisualSetting();if(event.target&&event.target.nodeType===1)self.enqueueLive(event.target,false);},true);
    /* Arm observation before collecting the one startup snapshot. Dynamic
       controls can be inserted in the several frame-bounded census batches;
       deferring the observer until the end created a real blind window. The
       generated attributes are either outside the filter or idempotent, and
       owner-root writes are ignored, so this does not create a second scan. */
    this.observe();this.scheduleScan(document);return this;
  };

  var controller=new HoverTagController();
  window.PMHoverTag=PMHoverTag;window.HoverTagController=HoverTagController;window.PM_HOVER_TAG_CONTROLLER=controller;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){controller.start();},{once:true});else controller.start();
})();
</script>'''


def apply(doc, notes, need):
    """Insert T47 after the exact T46 predecessor and emit fail-closed receipts."""
    need(TRANSFORM_MARKER not in doc, "T47: transform already applied")
    need(PREDECESSOR_MARKER in doc, "T47: exact T46 predecessor marker missing")
    need(doc.count("</head>") == 1, "T47: unique head-close anchor missing")
    need(doc.count("</body>") == 1, "T47: unique body-close anchor missing")
    # Earlier presentation transforms may safely call the controller once T47
    # is installed.  A reference is not a competing singleton; only the owned
    # style/script IDs or an earlier assignment are identity collisions.
    for identity in ('id="pm-hover-tags-css"', 'id="pm-hover-tags-js"', "window.PM_HOVER_TAG_CONTROLLER="):
        need(identity not in doc, "T47: host identity already exists: %s" % identity)

    protected_before = capture_protected_sources(doc, need, "T47 input")
    effects_before = capture_effect_surfaces(doc)
    doc = doc.replace("</head>", HOVER_STYLE + "\n</head>", 1)
    doc = doc.replace("</body>", HOVER_SCRIPT + "\n</body>", 1)

    protected_receipt = assert_protected_sources_equal(
        protected_before,
        capture_protected_sources(doc, need, "T47 output"),
        need,
        "T47",
    )
    effect_receipt = assert_effect_delta(
        effects_before,
        capture_effect_surfaces(doc),
        EXPECTED_EFFECT_SURFACE_DELTA,
        need,
        "T47",
    )

    need(doc.count(TRANSFORM_MARKER) == 2, "T47: CSS/script marker census mismatch")
    need(doc.count('id="pm-hover-tags-css"') == 1, "T47: style identity census mismatch")
    need(doc.count('id="pm-hover-tags-js"') == 1, "T47: script identity census mismatch")
    need(doc.count("window.PM_HOVER_TAG_CONTROLLER=controller") == 1, "T47: singleton controller census mismatch")
    need("role=\"tooltip\"" in HOVER_SCRIPT and "aria-describedby" in HOVER_SCRIPT, "T47: accessible description contract missing")
    need("'programmatic-focus-landmark'" in HOVER_SCRIPT and "SEMANTIC_ACTION_SELECTOR" in HOVER_SCRIPT, "T47: static programmatic-focus landmark exemption contract missing")
    need("function actionDetail(el)" in HOVER_SCRIPT and "function humanActionCopy(el)" in HOVER_SCRIPT and "parts.join(' ')" in HOVER_SCRIPT and "Run setup again" in HOVER_SCRIPT and "Reset layout" in HOVER_SCRIPT and "Choose appearance" in HOVER_SCRIPT and "Use simpler words" in HOVER_SCRIPT and "Finish tour" in HOVER_SCRIPT, "T47: human contextual copy and structured-child spacing contract missing")
    need("function looksInternal(value)" in HOVER_SCRIPT and "readableToken" not in HOVER_SCRIPT and "Run '+" not in HOVER_SCRIPT and "technical)detail=technical" not in HOVER_SCRIPT, "T47: raw internal identifier copy fallback returned")
    need("'data-command-id','data-ui-action-id'" not in HOVER_SCRIPT.split("function technicalAttribute(el)", 1)[1].split("function isChartMark", 1)[0], "T47: hidden action wiring leaked back into technical-value hover copy")
    need("ensureAccessibleName" in HOVER_SCRIPT and "Search files, commands, and settings" in HOVER_SCRIPT and "Message the agent" in HOVER_SCRIPT, "T47: accessible-name repair contract missing")
    need("POINTER_OPEN_MS=1600" in HOVER_SCRIPT and "POINTER_STATIONARY_MS=1100" in HOVER_SCRIPT and "POINTER_RADIUS_PX=5" in HOVER_SCRIPT and "FOCUS_OPEN_MS=1000" in HOVER_SCRIPT and "DEPARTURE_GRACE_MS=160" in HOVER_SCRIPT and "cancelPendingOpen" in HOVER_SCRIPT, "T47: deliberate-intent dwell or departure timing drift")
    need("notePointerMove" in HOVER_SCRIPT and "sameGeometry" in HOVER_SCRIPT and "pointerdown" in HOVER_SCRIPT and "window.addEventListener('scroll'" in HOVER_SCRIPT and "resetPointerStationary" in HOVER_SCRIPT, "T47: stationary pointer-intent cancellation/reset contract missing")
    need("prototype.dropStaleTargets" in HOVER_SCRIPT and "!this.pendingOpenTarget.isConnected" in HOVER_SCRIPT and "!this.active.isConnected" in HOVER_SCRIPT and "if(immediate){this.closeTimer=0;this.tag.hidden=true;return;}" in HOVER_SCRIPT, "T47: disconnected-anchor or immediate singleton cleanup contract missing")
    need("if(this.active===row.el){this.activeModel=model;this.render(model);this.position();}" in HOVER_SCRIPT, "T47: live rerender must refresh the one active singleton model")
    need("standard_motion_ms:240" in HOVER_SCRIPT and "retro_motion_ms:140" in HOVER_SCRIPT, "T47: motion timing drift")
    need("MAX_WIDTH=280" in HOVER_SCRIPT and "GAP=8" in HOVER_SCRIPT and "MARGIN=8" in HOVER_SCRIPT, "T47: geometry token drift")
    need('.pm-hover-tag[data-detail="false"] strong { white-space: normal; }' in HOVER_STYLE and "overflow-wrap: anywhere" in HOVER_STYLE, "T47: detail-free labels must remain safely wrappable")
    need("max-height: max(1px, calc(100dvh - 16px))" in HOVER_STYLE and "overflow-y: auto" in HOVER_STYLE and "this.tag.style.maxHeight" in HOVER_SCRIPT, "T47: tall-tag viewport bound or internal overflow fallback missing")
    need("function viewportGeometry()" in HOVER_SCRIPT and "window.visualViewport" in HOVER_SCRIPT and HOVER_SCRIPT.count("left=clamp(") == 2 and "top=clamp(" in HOVER_SCRIPT and "feasibleMargin" in HOVER_SCRIPT, "T47: four-edge narrow/zoom viewport clamping contract missing")
    need("general.interaction.show-tooltips" in HOVER_SCRIPT, "T47: Settings projection bridge missing")
    need("function activeOverlay()" in HOVER_SCRIPT and "prototype.overlayAllows" in HOVER_SCRIPT and "document.getElementById('pm7-guided-tour')" in HOVER_SCRIPT and "document.getElementById('pm7-onboarding')" in HOVER_SCRIPT and "self.syncOverlayState()" in HOVER_SCRIPT and "setAttrIfChanged(desc,'role','presentation')" in HOVER_SCRIPT, "T47: onboarding/guided-tour hover containment contract missing")
    need("duplicate_key" in HOVER_SCRIPT and "stale_text" in HOVER_SCRIPT and "native_title_only" in HOVER_SCRIPT, "T47: deterministic census guards incomplete")
    need("this.observe();this.scheduleScan(document);return this" in HOVER_SCRIPT, "T47: startup observer must be armed before the one bounded census snapshot")
    need("this.bootstrapPass<1" not in HOVER_SCRIPT and "attributeOldValue:true" in HOVER_SCRIPT and "record.oldValue===record.target.getAttribute(record.attributeName)" in HOVER_SCRIPT, "T47: startup or live observer still repeats whole-document/no-op semantic work")
    need("processScanBatch" in HOVER_SCRIPT and "processLiveBatch" in HOVER_SCRIPT and "whenIdle" in HOVER_SCRIPT and HOVER_SCRIPT.count("performance.now()-started<4") == 2 and "performance.now()-started<3" in HOVER_SCRIPT and "attributeFilter" in HOVER_SCRIPT, "T47: bounded census and incremental relevant-mutation contracts missing")
    need("takeRecords()" not in HOVER_SCRIPT and "ownMutation" not in HOVER_SCRIPT and "setAttrIfChanged" in HOVER_SCRIPT, "T47: observer-safe idempotent writes missing")
    need("this.keyOwners=new Map()" in HOVER_SCRIPT and "document.querySelector('[data-pm-hover-key=" not in HOVER_SCRIPT, "T47: key ownership must remain near-linear")
    lowered = (HOVER_STYLE + HOVER_SCRIPT).lower()
    for forbidden in ("<canvas", "getcontext(", "webglrenderingcontext", "backdrop-filter", "url(#", "spring("):
        need(forbidden not in lowered, "T47: non-portable primitive entered module: %s" % forbidden)

    notes.update(
        {
            "decision": "one source-owned global PMHoverTag/HoverTagController for pointer and keyboard focus disclosure",
            "predecessor": PREDECESSOR_MARKER,
            "overlay_contract": "one shared root; center above, flip below, clamp to every visible-viewport edge with a feasible margin up to 8px; 8px anchor gap; max width 280px; viewport-bounded height with internal overflow",
            "timings_ms": {"pointer_open": 1600, "pointer_stationary": 1100, "pointer_radius_px": 5, "focus_open": 1000, "departure_grace": 160, "standard_motion": 240, "retro_stepped_motion": 140, "reduced_motion": 0},
            "accessibility_contract": "persistent description nodes and additive stable aria-describedby tokens remain when show-tooltips hides visual tags; while onboarding or the guided tour is open, descriptions outside that modal temporarily lose tooltip semantics and are hidden from accessibility, then restore; missing names are repaired from exact UI copy before native titles migrate",
            "coverage_contract": "actionable/focusable, truncated, technical identifier, status, badge, chart mark, disabled, and dynamic pin/unpin candidates are live-bound; persistent accessible descriptions bind immediately, while visual tags require 1600ms pointer residence plus 1100ms stationary intent within a 5px radius or 1000ms keyboard focus; pointer press and scroll cancel pending pointer help, target motion resets stationary intent, and every new anchor earns a full dwell; observation is armed before the one startup snapshot, which uses frame-bounded read-then-write batches, so controls inserted during bootstrap are retained without a second whole-document pass; exact old/current attribute reassertions are semantic no-ops rather than invalidations; open onboarding and guided-tour overlays suppress anchors outside their own surface",
            "theme_contract": "Basic/Friendly/Glass/Retro light and dark; Glass consumes live tint/transparency with a readable opaque floor and no blur",
            "slint_portability": "typed PMHoverTag, anchor/overlay geometry, pointer coordinates/radius, timers, press/scroll/focus inputs, and theme tokens; no Canvas, WebGL, browser-only physics, SVG filter, or heavy CSS filter",
            "deterministic_api": "window.PM_HOVER_TAG_CONTROLLER",
            "expected_runtime_effect_surfaces": EXPECTED_RUNTIME_EFFECT_SURFACES,
            "protected_embedded_source_guard": protected_receipt,
            "effect_surface_set_diff": effect_receipt,
        }
    )
    return doc
