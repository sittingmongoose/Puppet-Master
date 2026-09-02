"""Assertion-guarded PM7 T35 Usage residual repair.

This source layer is deliberately presentation-local.  It consumes the T34
Usage artifact, leaves the pinned base alone, and does not touch Settings or
either Assistant surface.
"""

from __future__ import annotations

import re

from pm7_transform_guards import (
    assert_effect_delta,
    assert_protected_sources_equal,
    capture_effect_surfaces,
    capture_protected_sources,
)


TRANSFORM_MARKER = "PM7 T35: Usage residual audit closure"


def _replace_once(doc, old, new, need, label):
    count = doc.count(old)
    need(count == 1, "%s: expected exactly one anchor, found %d" % (label, count))
    return doc.replace(old, new, 1)


def _sub_once(doc, pattern, replacement, need, label, flags=0):
    matches = list(re.finditer(pattern, doc, flags))
    need(len(matches) == 1, "%s: expected exactly one match, found %d" % (label, len(matches)))
    return re.sub(pattern, replacement, doc, count=1, flags=flags)


USAGE_STYLE_SCRIPT_ANCHOR = """</style>
<script>
(function () {
  'use strict';

  var app = document.getElementById('pm7UsageApp');"""


T35_CSS = r"""

/* PM7 T35: Usage residual audit closure.  Container queries follow the
   physical Usage stage, including space retained by Assistant. */
.pm7u-stage {
  container-type: inline-size;
  container-name: pm7u-stage;
  min-width: 0;
}
.pm7u-boardscroll { min-width: 0; }

/* Viewport media queries cannot see the physical Usage width left after the
   shared Assistant is seated.  The ResizeObserver projection below marks the
   shell itself, allowing the rail to become a collision-free two-row header
   at the same physical widths used by the board/card tiers. */
.pm7u-shell:is([data-physical-layout="compact"],[data-physical-layout="micro"]) {
  grid-template-columns: minmax(0,1fr) !important;
  grid-template-rows: auto minmax(0,1fr) !important;
}
.pm7u-shell:is([data-physical-layout="compact"],[data-physical-layout="micro"]) .pm7u-rail {
  display: grid !important;
  grid-template-columns: auto minmax(0,1fr) auto !important;
  grid-template-areas: "brand scope detail" "nav nav nav" !important;
  align-items: center !important;
  gap: 6px 8px !important;
  min-width: 0 !important;
  padding: 7px 9px !important;
  border-right: 0 !important;
  border-bottom: 1px solid var(--border-light) !important;
  overflow: hidden !important;
}
.pm7u-shell:is([data-physical-layout="compact"],[data-physical-layout="micro"]) .pm7u-brand {
  grid-area: brand !important;
  padding: 0 !important;
}
.pm7u-shell:is([data-physical-layout="compact"],[data-physical-layout="micro"]) .pm7u-live { display: none !important; }
.pm7u-shell:is([data-physical-layout="compact"],[data-physical-layout="micro"]) .pm7u-scope {
  grid-area: scope !important;
  justify-self: start !important;
  width: min(170px,100%) !important;
  min-width: 0 !important;
  margin: 0 !important;
}
.pm7u-shell:is([data-physical-layout="compact"],[data-physical-layout="micro"]) .pm7u-nav {
  grid-area: nav !important;
  display: flex !important;
  flex-direction: row !important;
  min-width: 0 !important;
  width: 100% !important;
  overflow-x: auto !important;
  overflow-y: hidden !important;
  scrollbar-width: none !important;
}
.pm7u-shell:is([data-physical-layout="compact"],[data-physical-layout="micro"]) .pm7u-nav::-webkit-scrollbar { display: none !important; }
.pm7u-shell:is([data-physical-layout="compact"],[data-physical-layout="micro"]) .pm7u-navbtn {
  width: auto !important;
  min-width: max-content !important;
  padding: 6px 8px !important;
}
.pm7u-shell:is([data-physical-layout="compact"],[data-physical-layout="micro"]) .pm7u-navbtn.active::before {
  left: 7px !important;
  right: 7px !important;
  top: auto !important;
  bottom: 0 !important;
  width: auto !important;
  height: 2px !important;
}
.pm7u-shell:is([data-physical-layout="compact"],[data-physical-layout="micro"]) :is(.pm7u-navico,.pm7u-navmeta,.pm7u-sep,.pm7u-more-toggle,.pm7u-detailcopy span) {
  display: none !important;
}
.pm7u-shell:is([data-physical-layout="compact"],[data-physical-layout="micro"]) :is(.pm7u-more,.pm7u-more.open) { display: contents !important; }
.pm7u-shell:is([data-physical-layout="compact"],[data-physical-layout="micro"]) .pm7u-detailbox {
  grid-area: detail !important;
  margin: 0 !important;
  padding: 0 !important;
}
.pm7u-shell:is([data-physical-layout="compact"],[data-physical-layout="micro"]) .pm7u-detailbtn { width: auto !important; }
.pm7u-shell:is([data-physical-layout="compact"],[data-physical-layout="micro"]) .pm7u-desc { display: none !important; }
.pm7u-shell[data-physical-layout="micro"] .pm7u-scope {
  width: 34px !important;
  padding: 8px !important;
  justify-content: center !important;
}
.pm7u-shell[data-physical-layout="micro"] .pm7u-scope-copy { display: none !important; }
.pm7u-shell[data-physical-layout="micro"] .pm7u-scope svg:last-child { display: none !important; }
.pm7u-card:has(.pm7u-setup-cta) .pm7u-cardbody {
  flex-direction: column !important;
  align-items: stretch !important;
  justify-content: flex-start !important;
}
.pm7u-card:has(.pm7u-setup-cta) .pm7u-cardbody > .pm7u-instrument {
  flex: 1 1 auto !important;
  min-height: 0 !important;
}
.pm7u-card:has(.pm7u-setup-cta) .pm7u-setup-cta {
  flex: 0 0 auto !important;
  width: auto !important;
  max-width: 100% !important;
  min-width: 0 !important;
  margin: 8px 0 0 !important;
  box-sizing: border-box !important;
  flex-wrap: wrap !important;
}
.pm7u-card:has(.pm7u-setup-cta) .pm7u-setup-cta > * {
  min-width: 0;
  overflow-wrap: anywhere;
}

/* The model-owned row/column geometry stays canonical.  This measured tier
   controls disclosure only, so a narrow physical card never attempts to
   paint the content budget of a much wider logical preset. */
.pm7u-card[data-content-tier="strip"] :is(.pm7u-tier-compact,.pm7u-tier-standard,.pm7u-tier-expanded,.pm7u-tier-maximum),
.pm7u-card[data-content-tier="compact"] :is(.pm7u-tier-standard,.pm7u-tier-expanded,.pm7u-tier-maximum),
.pm7u-card[data-content-tier="standard"] :is(.pm7u-tier-expanded,.pm7u-tier-maximum),
.pm7u-card[data-content-tier="expanded"] .pm7u-tier-maximum {
  display: none !important;
}
/* Deliberately no corresponding show rule: physical tiers may cap the
   logical preset's disclosure, but may never promote content the persisted
   row geometry did not authorize. */
.pm7u-card[data-content-tier="strip"] :is(.pm7u-mini-signal,.pm7u-summary-grid,.pm7u-instrument-details,.pm7u-instrument-foot,.pm7u-context-foot,.pm7u-segment-legend),
.pm7u-card[data-content-tier="compact"] :is(.pm7u-mini-signal.pm7u-tier-standard,.pm7u-chartnote,.pm7u-rowextra) {
  display: none !important;
}

/* Narrow cards mount complete primary facts and omit optional fragments.
   Wider list cards keep their value lane and use height for complete rows
   instead of sparse two-column islands. */
.pm7u-card .pm7u-cardtitle {
  position: relative !important;
  z-index: 1 !important;
  flex: 1 1 auto !important;
  min-width: 7ch !important;
}
.pm7u-card .pm7u-cardmeta {
  position: relative !important;
  z-index: 0 !important;
  flex: 0 1 122px !important;
  min-width: 0 !important;
  max-width: min(43%,122px) !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

/* A four-track chart is physically about 300px wide in the desktop grid.
   Two side-fact columns at that width force adjacent labels/values to touch
   (for example, `Input 1.30MOutput 222k`).  Keep the facts as complete rows
   until the card earns enough physical width for two independent columns. */
@container pm7u-card (max-width: 360px) {
  .pm7u-card[data-kind="chart"]:is([data-cols="2"],[data-cols="3"],[data-cols="4"]) .pm7u-sidefacts {
    grid-template-columns: minmax(0,1fr) !important;
    gap: 0 !important;
  }
}
.pm7u-card[data-content-width="narrow"] :is(.pm7u-cardmeta,.pm7u-instrument-name span,.pm7u-context-v2-copy span) {
  display: none !important;
}
.pm7u-card[data-content-width="regular"][data-content-tier="compact"] .pm7u-cardmeta,
.pm7u-card[data-content-width="narrow"] .pm7u-rowsub {
  display: none !important;
}
.pm7u-card[data-widget="ledger-main"][data-kind="list"] .pm7u-row {
  grid-template-columns: minmax(0,1fr) minmax(132px,max-content) !important;
}
.pm7u-card[data-widget="ledger-main"][data-kind="list"] .pm7u-rowsub {
  display: block !important;
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: clip !important;
}
.pm7u-card[data-widget="ledger-main"][data-kind="list"] .pm7u-rowval {
  width: auto !important;
  max-width: none !important;
  white-space: nowrap !important;
  overflow: visible !important;
  text-overflow: clip !important;
}
.pm7u-card[data-widget="ledger-main"][data-kind="list"][data-content-width="narrow"] .pm7u-row {
  grid-template-columns: minmax(0,1fr) !important;
  align-items: start !important;
  align-content: start !important;
  row-gap: 2px !important;
  min-height: 48px !important;
  padding-block: 3px !important;
  overflow: hidden !important;
}
.pm7u-card[data-widget="ledger-main"][data-kind="list"][data-content-width="narrow"] .pm7u-rowmain {
  position: relative !important;
  width: 100% !important;
  min-width: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
}
/* The repeated generic label remains in each button's accessible name but
   does not consume one of the tiny Ledger card's visible fact lines. */
.pm7u-card[data-widget="ledger-main"][data-kind="list"][data-content-width="narrow"] .pm7u-rowmain > b {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  margin: -1px !important;
  padding: 0 !important;
  overflow: hidden !important;
  clip: rect(0 0 0 0) !important;
  clip-path: inset(50%) !important;
  white-space: nowrap !important;
  border: 0 !important;
}
.pm7u-card[data-widget="ledger-main"][data-kind="list"][data-content-width="narrow"] .pm7u-rowsub {
  display: block !important;
  margin-top: 0 !important;
  max-height: 2.24em !important;
  font-size: 8.5px !important;
  line-height: 1.12 !important;
  white-space: normal !important;
  overflow: hidden !important;
  overflow-wrap: anywhere !important;
  text-overflow: clip !important;
}
.pm7u-card[data-widget="ledger-main"][data-kind="list"][data-content-width="narrow"] .pm7u-rowval {
  align-self: start !important;
  justify-self: stretch !important;
  width: 100% !important;
  max-width: 100% !important;
  max-height: 2.24em !important;
  padding: 0 !important;
  font-size: 8.5px !important;
  line-height: 1.12 !important;
  text-align: left !important;
  white-space: normal !important;
  overflow: hidden !important;
  overflow-wrap: anywhere !important;
  text-overflow: clip !important;
}
.pm7u-card[data-content-width="wide"]:is([data-widget="free-route"],[data-widget="provider-cost"]) .pm7u-rich-list {
  display: flex !important;
  grid-template-columns: none !important;
  grid-auto-rows: auto !important;
}
.pm7u-card[data-content-width="wide"]:is([data-widget="free-route"],[data-widget="provider-cost"]) .pm7u-rich-list .pm7u-row {
  grid-template-columns: minmax(0,1fr) minmax(116px,max-content) !important;
}
.pm7u-card[data-content-width="wide"]:is([data-widget="free-route"],[data-widget="provider-cost"]) .pm7u-rowval {
  width: auto !important;
  max-width: 140px !important;
  overflow: visible !important;
  text-overflow: clip !important;
}
.pm7u-card[data-content-width="wide"][data-widget="provider-cost"] .pm7u-rowextra {
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: clip !important;
  line-height: 1.25 !important;
}
.pm7u-card[data-content-width="wide"] .pm7u-signal-label {
  width: 100% !important;
  box-sizing: border-box !important;
  padding-right: 12px !important;
}

/* Old canvas placement rules survived a later flex-to-grid refactor and put
   facts in row two while meters occupied row one.  Keep both primary lanes in
   the same row so maximum account/plan cards earn their upper-left quadrant. */
.pm7u-card[data-content-width="wide"]:is([data-shape="wide"],[data-shape="canvas"])[data-kind="instrument"] .pm7u-instrument-core {
  grid-template-rows: minmax(0,1fr) !important;
  align-items: start !important;
}
.pm7u-card[data-content-width="wide"]:is([data-shape="wide"],[data-shape="canvas"])[data-kind="instrument"] .pm7u-statstack {
  grid-column: 1 !important;
  grid-row: 1 !important;
  align-self: start !important;
  margin-top: 0 !important;
}
.pm7u-card[data-content-width="wide"]:is([data-shape="wide"],[data-shape="canvas"])[data-kind="instrument"] .pm7u-meters {
  grid-column: 2 !important;
  grid-row: 1 !important;
  align-self: start !important;
}

/* Four- and five-row wide summaries use their earned height for the complete
   trend figure.  The existing right-hand authority facts remain unchanged. */
.pm7u-card[data-content-width="wide"]:is([data-shape="wide"],[data-shape="canvas"])[data-kind="summary"]:is([data-rows="4"],[data-rows="5"],[data-rows="6"],[data-rows="7"],[data-rows="8"]) .pm7u-summary-signal {
  align-self: stretch !important;
  height: auto !important;
  min-height: 98px !important;
  max-height: none !important;
}
.pm7u-card[data-content-width="wide"]:is([data-shape="wide"],[data-shape="canvas"])[data-kind="summary"]:is([data-rows="4"],[data-rows="5"],[data-rows="6"],[data-rows="7"],[data-rows="8"]) .pm7u-summary-signal > .pm7u-mini-signal {
  height: 100% !important;
  min-height: 98px !important;
  max-height: none !important;
}

/* Tiny charts keep their full accessible series while painting at most five
   deterministic labels.  This rule intentionally outranks older all-label
   experiments later in the inherited cascade. */
.pm7u-card .pm7u-barcol:not(.is-labeled) .pm7u-barvalue {
  display: none !important;
}

/* Painted values belong to their bar tops, not to the plot baseline.  The
   value is nested in its fill so the actual painted bar, rather than a second
   percentage calculation, is the positioning authority.  Keep the compact
   label intrinsic so a multi-character value is never cropped by its narrow
   grid column; the plot itself remains the clipping boundary. */
.pm7u-card .pm7u-barfill {
  overflow: visible !important;
}
.pm7u-card .pm7u-barcol.is-labeled .pm7u-barvalue {
  left: 50% !important;
  right: auto !important;
  top: 2px !important;
  bottom: auto !important;
  width: max-content !important;
  min-width: max-content !important;
  max-width: none !important;
  height: 11px !important;
  padding: 0 !important;
  justify-content: center !important;
  overflow: visible !important;
  transform: translateX(-50%) !important;
}
.pm7u-card .pm7u-barcol.is-labeled.is-short .pm7u-barvalue {
  top: -13px !important;
  bottom: auto !important;
}
.pm7u-card .pm7u-barcol.is-labeled:first-child .pm7u-barvalue {
  left: 0 !important;
  transform: none !important;
}
.pm7u-card .pm7u-barcol.is-labeled:last-child .pm7u-barvalue {
  left: auto !important;
  right: 0 !important;
  transform: none !important;
}

/* Keep the triangular grip artwork, but make the complete transparent 19px
   control box interactive.  Earlier visual layers clip the button itself to
   the painted triangle, which makes the center pickup miss at compact widths. */
.pm7u-drag {
  clip-path: none !important;
}
.pm7u-drag svg {
  pointer-events: none !important;
}
.pm7u-reorder-placeholder {
  outline: 3px dashed color-mix(in srgb,var(--accent-primary) 88%,white) !important;
  outline-offset: 6px !important;
  box-shadow: inset 0 0 0 2px color-mix(in srgb,var(--accent-primary) 42%,transparent),
              0 0 20px color-mix(in srgb,var(--accent-primary) 34%,transparent) !important;
}

/* The reorder clone is a body portal, so it must not inherit card entrance
   animation, delayed opacity, or a local stacking context. */
body > .pm7u-ghost {
  position: fixed !important;
  z-index: 2147483000 !important;
  display: flex !important;
  visibility: visible !important;
  opacity: .96 !important;
  pointer-events: none !important;
  animation: none !important;
  transition: none !important;
  transform: rotate(.5deg) !important;
  isolation: isolate !important;
  border: 2px solid var(--accent-primary) !important;
  background: var(--surface-elevated) !important;
  box-shadow: 0 18px 50px color-mix(in srgb,#000 35%,transparent),
              0 0 0 3px color-mix(in srgb,var(--accent-primary) 22%,transparent) !important;
}

@container pm7u-card (max-width: 250px) {
  .pm7u-card :is(.pm7u-instrument-details,.pm7u-sidefacts,.pm7u-context-foot) {
    grid-template-columns: minmax(0,1fr) !important;
  }
  .pm7u-card .pm7u-summary-grid { grid-template-columns: repeat(2,minmax(0,1fr)) !important; }
  .pm7u-card .pm7u-cardmeta { max-width: 30% !important; }
  .pm7u-card .pm7u-instrument-name span,
  .pm7u-card .pm7u-chartnote { display: none !important; }
}

@container pm7u-stage (max-width: 760px) {
  .pm7u-boardscroll {
    overflow-x: hidden !important;
    padding-inline: 10px !important;
  }
  .pm7u-board {
    min-width: 0 !important;
    grid-template-columns: repeat(6,minmax(0,1fr)) !important;
  }
  .pm7u-card[data-cols="2"],
  .pm7u-card[data-cols="3"] { grid-column: span 3 !important; }
  .pm7u-card:is([data-cols="4"],[data-cols="5"],[data-cols="6"],[data-cols="7"],[data-cols="8"],[data-cols="9"],[data-cols="10"],[data-cols="11"],[data-cols="12"]) {
    grid-column: 1 / -1 !important;
  }
  .pm7u-head,
  .pm7u-boardhead { flex-wrap: wrap !important; height: auto !important; min-height: 0 !important; }
  .pm7u-headcopy { flex: 1 1 210px !important; min-width: 0 !important; }
  .pm7u-headtools { flex: 1 1 250px !important; justify-content: flex-end !important; min-width: 0 !important; }
  .pm7u-boardhint { white-space: normal !important; }
}

@container pm7u-stage (max-width: 520px) {
  .pm7u-board { grid-template-columns: repeat(4,minmax(0,1fr)) !important; }
  .pm7u-card { grid-column: 1 / -1 !important; }
  .pm7u-boardscroll { padding-inline: 8px !important; }
  .pm7u-head { align-items: flex-start !important; padding: 9px 8px !important; gap: 7px !important; }
  .pm7u-headtools { justify-content: flex-start !important; flex-wrap: wrap !important; }
  .pm7u-range { max-width: 100% !important; overflow-x: auto !important; }
  .pm7u-boardhead { padding-inline: 8px !important; }
  .pm7u-card:has(.pm7u-setup-cta) .pm7u-setup-cta {
    align-items: flex-start !important;
    flex-direction: column !important;
  }
}
"""


PHYSICAL_TIER_SOURCE = r"""
  /* PM7 T35: derive disclosure from actual painted geometry. */
  function physicalContentTier(cardElement) {
    var rect = cardElement.getBoundingClientRect();
    var width = Math.round(rect.width), height = Math.round(rect.height);
    if (!width || !height) return null;
    var area = width * height;
    if (height < 150 || width < 150) return 'strip';
    if (height < 245 || width < 205 || area < 50000) return 'compact';
    if (height < 355 || width < 265 || area < 90000) return 'standard';
    if (height < 480 || area < 150000) return 'expanded';
    return 'maximum';
  }
  function applyPhysicalContentTier(cardElement) {
    var tier = physicalContentTier(cardElement);
    if (!tier) return null;
    cardElement.setAttribute('data-content-tier', tier);
    cardElement.setAttribute('data-content-width', cardElement.clientWidth < 300 ? 'narrow' : cardElement.clientWidth < 420 ? 'regular' : 'wide');
    return tier;
  }
  function applyPhysicalUsageLayout() {
    var width = Math.round(app.getBoundingClientRect().width);
    if (!width) return null;
    var layout = width <= 520 ? 'micro' : width <= 760 ? 'compact' : 'wide';
    app.setAttribute('data-physical-layout', layout);
    app.setAttribute('data-physical-width', String(width));
    return layout;
  }
  var physicalTierFrame = 0;
  function applyPhysicalContentTiers() {
    physicalTierFrame = 0;
    applyPhysicalUsageLayout();
    $$('.pm7u-card', board).forEach(applyPhysicalContentTier);
  }
  function schedulePhysicalContentTiers() {
    if (physicalTierFrame) cancelAnimationFrame(physicalTierFrame);
    physicalTierFrame = requestAnimationFrame(applyPhysicalContentTiers);
  }

"""


MINI_BARS_SOURCE = r"""  function sampledBarLabel(index, count) {
    if (count <= 5) return true;
    var slots = 5, selected = {};
    for (var slot = 0; slot < slots; slot += 1) {
      selected[Math.round(slot * (count - 1) / (slots - 1))] = true;
    }
    return !!selected[index];
  }
  function compactBarValue(value) {
    if (value >= 1000000) return (Math.round(value / 100000) / 10) + 'm';
    if (value >= 1000) return (Math.round(value / 100) / 10) + 'k';
    return String(value);
  }
  function miniBars(values, tier, label) {
    var clean = (values || []).map(function (value) {
      var numeric = Number(value);
      return Math.max(0, Math.round(isFinite(numeric) ? numeric : 0));
    });
    var latest = clean.length ? clean[clean.length - 1] : 0;
    var peak = Math.max.apply(Math, clean.concat([1]));
    var count = clean.length;
    var seriesLabel = label || 'Recent trend';
    var seriesSummary = 'Latest ' + compactBarValue(latest) + (peak !== latest ? ' · peak ' + compactBarValue(peak) : '');
    /* Map peak to ~90% plot height so the tallest bar isn’t flush-clipped. */
    var HEADROOM = 0.90;
    return '<div class="pm7u-mini-signal ' + (tier ? 'pm7u-tier-' + tier : '') + '" data-bars="' + count + '">' +
      '<div class="pm7u-signal-label"><span title="' + esc(seriesLabel) + '">' + esc(seriesLabel) + '</span><b title="' + esc(seriesSummary) + '">' + esc(seriesSummary) + '</b></div>' +
      '<div class="pm7u-mini-bars" style="--pm7u-bar-count:' + count + '" role="img" aria-label="' + esc(seriesLabel + ', values ' + clean.join(', ') + '; ' + seriesSummary) + '">' + clean.map(function (value, index) {
        var recent = index >= count - 4;
        var visualHeight = value <= 0 ? 0 : Math.max(8, Math.min(Math.round(100 * HEADROOM), Math.round(value / peak * 100 * HEADROOM)));
        var short = visualHeight < 34;
        var labeled = sampledBarLabel(index, count);
        return '<span class="pm7u-barcol' + (recent ? ' is-recent' : '') + (short ? ' is-short' : '') + (labeled ? ' is-labeled' : '') + '" style="--pm7u-bar-height:' + visualHeight + '%" data-value="' + value + '" title="' + esc(seriesLabel + ': ' + value) + '">' +
          '<span class="pm7u-barfill">' + (labeled ? '<b class="pm7u-barvalue">' + esc(compactBarValue(value)) + '</b>' : '') + '</span></span>';
      }).join('') + '</div></div>';
}
"""


METER_LINE_SOURCE = r"""  function meterLine(label, value, pct, color, tier) {
    var safePct = Math.max(0, Math.min(100, Math.round(Number(pct) || 0)));
    var tierClass = tier ? ' pm7u-tier-' + tier : '';
    var primary = value == null || value === '' ? '' : String(value);
    var percentText = safePct + '%';
    var repeatsPercent = primary.replace(/\\s+/g, '') === percentText;
    var fullValue = primary ? (repeatsPercent ? primary : primary + ' · ' + percentText) : percentText;
    return '<div class="pm7u-meterline' + tierClass + '" data-meter-pct="' + safePct + '">' +
      '<div class="pm7u-metertrack" role="img" aria-label="' + esc(label) + ': ' + esc(fullValue) + '">' +
        '<i class="pm7u-meterfill ' + (color || '') + '" style="--fill:' + safePct + '%"></i>' +
        '<span class="pm7u-meterlabel" title="' + esc(label) + '">' + esc(label) + '</span>' +
        '<b class="pm7u-metervalue" title="' + esc(fullValue) + '">' +
          (primary ? '<span>' + esc(primary) + '</span>' : '') + ((!primary || !repeatsPercent) ? '<em>' + percentText + '</em>' : '') +
        '</b>' +
      '</div></div>';
  }
"""


def apply(doc, notes, need):
    """Apply T35 to the T34 output and record narrow, truthful receipts."""
    need(TRANSFORM_MARKER not in doc, "T35: transform already applied")
    need("PM7 T34: Usage audit corrections" in doc, "T35: T34 source marker missing")
    protected_before = capture_protected_sources(doc, need, "T35 input")
    effects_before = capture_effect_surfaces(doc)
    for forbidden in (".page-settings", ".s4-", ".chat-", ".pm6-chat-", ".context-", ".pm7ctx", ".chm-"):
        need(forbidden not in T35_CSS, "T35: protected selector entered CSS: %s" % forbidden)

    doc = _replace_once(
        doc,
        '<nav class="pm7u-nav" id="pm7uNav">',
        '<nav class="pm7u-nav" id="pm7uNav" aria-label="Usage rooms">',
        need,
        "Usage room navigation name",
    )
    doc = _replace_once(
        doc,
        '<button type="button" class="pm7u-scope" id="pm7uScopeBtn" aria-haspopup="listbox" aria-expanded="false">',
        '<button type="button" class="pm7u-scope" id="pm7uScopeBtn" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="pm7uScopeLabel pm7uScopeMeta" title="Usage scope">',
        need,
        "Usage scope accessible name",
    )

    # Source Authority must disclose exactly 4 / 6 / 8 cards.
    tier_replacements = (
        ("widget('pricing-provenance', 'Pricing provenance', 'current range', 'orange', 2, 4, 'diagnostics'", "widget('pricing-provenance', 'Pricing provenance', 'current range', 'orange', 2, 4, 'detailed'"),
        ("widget('auth-list','Current sources','diagnostics','purple',4,4,'diagnostics'", "widget('auth-list','Current sources','diagnostics','purple',4,4,'detailed'"),
        ("summaryCard('auth-summary','Provider reported','current','green','4 / 6','top-level readings','fresh','',[['Allowance','4'],['Reset','4'],['Spend','1'],['Cache','3']],'Oldest','1m','diagnostics'", "summaryCard('auth-summary','Provider reported','current','green','4 / 6','top-level readings','fresh','',[['Allowance','4'],['Reset','4'],['Spend','1'],['Cache','3']],'Oldest','1m','glance'"),
        ("summaryCard('auth-est','PM estimates','current','orange','2','derived readings','labeled','warn',[['Forecast','pace model'],['Savings','catalog price'],['Confidence','87%'],['Stale','0']],'Derived','explicit','diagnostics'", "summaryCard('auth-est','PM estimates','current','orange','2','derived readings','labeled','warn',[['Forecast','pace model'],['Savings','catalog price'],['Confidence','87%'],['Stale','0']],'Derived','explicit','glance'"),
        ("summaryCard('auth-stale','Stale readings','current','green','0','older than policy','clear','',[['Policy','5m'],['Oldest','1m'],['Missing','0'],['Unknown','0']],'Freshness','pass','diagnostics'", "summaryCard('auth-stale','Stale readings','current','green','0','older than policy','clear','',[['Policy','5m'],['Oldest','1m'],['Missing','0'],['Unknown','0']],'Freshness','pass','glance'"),
        ("summaryCard('auth-coverage','Authority coverage','current','blue','100%','readings with named authority','all labeled','',[['Provider','4'],['PM','2'],['Unknown','0'],['Expired','0']],'Policy','pass','diagnostics'", "summaryCard('auth-coverage','Authority coverage','current','blue','100%','readings with named authority','all labeled','',[['Provider','4'],['PM','2'],['Unknown','0'],['Expired','0']],'Policy','pass','glance'"),
    )
    for old, new in tier_replacements:
        doc = _replace_once(doc, old, new, need, "Source Authority disclosure tier")

    doc = _sub_once(
        doc,
        r"  function miniBars\(values, tier, label\) \{.*?\n  \}\n(?=  function seriesFromValue)",
        MINI_BARS_SOURCE,
        need,
        "deterministic chart label sampling",
        re.S,
    )

    # Some Plan-allocation fixtures already carry their percentage as the
    # primary value.  Do not paint that same value a second time, while still
    # retaining both facts for meters whose primary value is a reset time,
    # currency amount, or other non-percentage reading.
    doc = _sub_once(
        doc,
        r"  function meterLine\(label, value, pct, color, tier\) \{.*?\n  \}\n(?=  function sampledBarLabel)",
        METER_LINE_SOURCE,
        need,
        "nonduplicating meter value labels",
        re.S,
    )

    doc = _replace_once(
        doc,
        USAGE_STYLE_SCRIPT_ANCHOR,
        T35_CSS + "\n" + USAGE_STYLE_SCRIPT_ANCHOR,
        need,
        "T35 Usage CSS insertion",
    )

    doc = _replace_once(
        doc,
        "  function render() {\n    if (document.body.classList.contains('pm7u-pointer-op')) return;",
        PHYSICAL_TIER_SOURCE + "  function render() {\n    if (document.body.classList.contains('pm7u-pointer-op')) return;",
        need,
        "measured content tier source",
    )
    doc = _replace_once(
        doc,
        "    wireCards();\n    syncNavInk(true);\n  }",
        "    wireCards();\n    schedulePhysicalContentTiers();\n    syncNavInk(true);\n  }",
        need,
        "render content tier schedule",
    )
    doc = _replace_once(
        doc,
        "    return density;\n  }\n\n  function startResize(event, cardElement, item) {",
        "    applyPhysicalContentTier(cardElement);\n    return density;\n  }\n\n  function startResize(event, cardElement, item) {",
        need,
        "live resize content tier",
    )
    doc = _replace_once(
        doc,
        "  render(); enhanceContext(document);\n  function usageExportJson(kind) {",
        "  render(); enhanceContext(document);\n  var physicalTierObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(schedulePhysicalContentTiers) : null;\n  if (physicalTierObserver) { physicalTierObserver.observe(app); physicalTierObserver.observe(board); }\n  window.addEventListener('resize', schedulePhysicalContentTiers, { passive:true });\n  function usageExportJson(kind) {",
        need,
        "physical tier observer initialization",
    )
    doc = _replace_once(
        doc,
        "    densityFor:densityFor, shapeFor:shapeFor, layoutFor:layoutFor, command:command,",
        "    densityFor:densityFor, shapeFor:shapeFor, layoutFor:layoutFor, physicalContentTier:physicalContentTier, applyPhysicalUsageLayout:applyPhysicalUsageLayout, applyPhysicalContentTiers:applyPhysicalContentTiers, command:command,",
        need,
        "T35 test surface export",
    )

    protected_receipt = assert_protected_sources_equal(
        protected_before,
        capture_protected_sources(doc, need, "T35 output"),
        need,
        "T35",
    )
    effect_receipt = assert_effect_delta(
        effects_before,
        capture_effect_surfaces(doc),
        {},
        need,
        "T35",
    )
    need(doc.count(TRANSFORM_MARKER) == 1, "T35: marker census mismatch")
    need('aria-label="Usage rooms"' in doc, "T35: Usage nav accessible name missing")
    need("function sampledBarLabel(index, count)" in doc and "function compactBarValue(value)" in doc and "(labeled ? ' is-labeled' : '')" in doc and "clean.join(', ')" in doc and "<span class=\"pm7u-barfill\">' + (labeled ? '<b class=\"pm7u-barvalue\">" in doc and "top: -13px" in doc and "width: max-content" in doc, "T35: deterministic label sampler, bar-top placement, or truthful full-series accessible label missing")
    need("var repeatsPercent = primary.replace(/\\s+/g, '') === percentText;" in doc and "(!primary || !repeatsPercent)" in doc, "T35: duplicate percentage meter labels are not suppressed")
    need('aria-labelledby="pm7uScopeLabel pm7uScopeMeta"' in doc, "T35: icon-only micro scope control lacks an accessible name")
    need("data-content-tier" in doc and "data-physical-layout" in doc and "ResizeObserver(schedulePhysicalContentTiers)" in doc, "T35: measured disclosure or shell layout missing")
    need("body > .pm7u-ghost" in doc and "z-index: 2147483000" in doc and ".pm7u-drag {\n  clip-path: none !important;" in doc and ".pm7u-drag svg {\n  pointer-events: none !important;" in doc and "outline-offset: 6px !important" in doc, "T35: visible reorder marker/ghost or complete move hit target missing")
    need("container-name: pm7u-stage" in doc and "@container pm7u-stage (max-width: 520px)" in doc, "T35: physical-width response missing")
    need("min-width: 7ch !important" in doc and "flex: 0 1 122px !important" in doc and "grid-row: 1 !important" in doc and "height: auto !important" in doc and "@container pm7u-card (max-width: 360px)" in doc, "T35: card identity, narrow chart facts, or earned wide-tier composition missing")
    need('data-widget="ledger-main"' in doc and "min-height: 48px !important" in doc and "clip-path: inset(50%) !important" in doc and "overflow-wrap: anywhere !important" in doc, "T35: narrow Ledger rows are not contained or semantically preserved")
    need("Claude Sonnet · fallback" not in doc and "contextAttempt.effective_route_id" in doc, "T35: hard-coded Context route survived")
    need(doc.count("widget('provider-probe-state', 'Provider probe state'") == 1 and doc.count("widget('unknown-versus-zero', 'Unknown versus zero'") == 1, "T35: diagnostics-only authority cards drifted")

    notes.update({
        "decision": "authorized T35 Usage residual closure only",
        "source_authority_disclosure": {"glance": 4, "detailed": 6, "diagnostics": 8},
        "chart_label_sampling": "deterministic, full series accessible, at most five painted labels",
        "physical_width_breakpoints_px": {"shell": [760, 520], "card": [420, 300]},
        "protected_embedded_source_guard": protected_receipt,
        "effect_surface_set_diff": effect_receipt,
    })
    return doc
