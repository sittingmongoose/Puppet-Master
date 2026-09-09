"""Assertion-guarded PM7 T37 component-scoped contrast repair.

The transform consumes T36.  It strengthens local semantic tokens only inside
the authorized Usage, Planning Wizard, Projects, and Orchestrator surfaces and
repairs the live-probed Glass enabled-primary collision.  Current Settings and
both Chat GUI lineages remain protected.
"""

from __future__ import annotations

import re

from pm7_transform_guards import (
    assert_effect_delta,
    assert_protected_sources_equal,
    capture_effect_surfaces,
    capture_protected_sources,
)


TRANSFORM_MARKER = "PM7 T37: component-scoped contrast repair"


def _assistant_slices(doc, need):
    popup = re.search(r"  function ctxPopupHTML\(\) \{.*?\n  \}\n(?=  function enhanceContext)", doc, re.S)
    drawer = re.search(r"  function contextDrawerHTML\(title\) \{.*?\n  \}\n(?=  function openContextDetails)", doc, re.S)
    need(popup is not None and drawer is not None, "T37: protected Assistant source slices missing")
    return popup.group(0), drawer.group(0)


def _settings_slice(doc, need):
    start = doc.find('<div class="page page-settings" id="panel-settings">')
    end = doc.find("\n        </main>", start)
    need(start >= 0 and end > start, "T37: protected Settings subtree missing")
    return doc[start:end]


# Projects is deliberately scoped to its ordinary direct-child surfaces.  Its
# protected s4 project-Settings modal is a sibling and cannot inherit these
# local semantic tokens.
SURFACES = r""":is(
  .pm7u-shell,
  .page-wizard,
  .page-orchestrator,
  .page-projects > .projects-header-bento,
  .page-projects > .projects-toolbar,
  .page-projects > .projects-grid-bento,
  .page-projects > .pm6-proj-empty,
  .page-projects > .pm6-proj-sheet-backdrop
)"""


T37_STYLE = r"""
<style id="pm7-t37-contrast">
/* PM7 T37: component-scoped contrast repair. These local variables do not
   alter global theme tokens and cannot enter Settings or Chat. */
html[data-theme="glass-light"] __SURFACES__ {
  --text-primary: #17222a;
  --text-secondary: #303c46;
  --text-muted: #2d3740;
  --accent-primary: #003f70;
  --accent-blue: #003f70;
  --accent-orange: #6a2f00;
  --accent-warning: #603600;
  --accent-lime: #0b4f31;
  --graph-passed: #0b4f31;
  --accent-error: #7c1730;
  --graph-failed: #7c1730;
  --accent-magenta: #78113f;
}
html[data-theme="glass-dark"] __SURFACES__ {
  --text-primary: #f1f4f7;
  --text-secondary: #d3d8e0;
  --text-muted: #b9c1cc;
  --accent-primary: #9fc3ff;
  --accent-blue: #9fc3ff;
  --accent-orange: #ffbf69;
  --accent-warning: #ffbf69;
  --accent-lime: #78cfa8;
  --graph-passed: #78cfa8;
  --accent-error: #ff91b8;
  --graph-failed: #ff91b8;
  --accent-magenta: #ff91b8;
}
html[data-theme="friendly-light"] __SURFACES__ {
  --text-secondary: #38424d;
  --text-muted: #4a5562;
  --accent-primary: #624493;
  --accent-blue: #624493;
  --accent-orange: #744400;
  --accent-warning: #744400;
  --accent-lime: #17613f;
  --graph-passed: #17613f;
  --accent-error: #8f1f3d;
  --graph-failed: #8f1f3d;
  --accent-magenta: #782252;
}
html[data-theme="friendly-dark"] __SURFACES__ {
  --text-secondary: #d6d0dc;
  --text-muted: #b4adbd;
  --accent-orange: #ffc36d;
  --accent-warning: #ffc36d;
  --accent-lime: #82d5ad;
  --graph-passed: #82d5ad;
  --accent-error: #ff9fbd;
  --graph-failed: #ff9fbd;
}
html[data-theme="retro-light"] __SURFACES__ {
  --text-secondary: #3f4548;
  --text-muted: #50575b;
  --accent-primary: #004b84;
  --accent-blue: #004b84;
  --accent-orange: #7a3600;
  --accent-warning: #6b4200;
  --accent-lime: #17613f;
  --graph-passed: #17613f;
  --accent-error: #8f1f3d;
  --graph-failed: #8f1f3d;
  --accent-magenta: #78113f;
}
html[data-theme="retro-dark"] __SURFACES__,
html[data-theme="basic-dark"] __SURFACES__ {
  --text-secondary: #d0d6df;
  --text-muted: #aeb7c2;
  --accent-orange: #ffbf69;
  --accent-warning: #ffbf69;
  --accent-lime: #78cfa8;
  --graph-passed: #78cfa8;
  --accent-error: #ff91b8;
  --graph-failed: #ff91b8;
}
html[data-theme="basic-light"] __SURFACES__ {
  --text-secondary: #35414c;
  --text-muted: #48545f;
  --accent-primary: #004b84;
  --accent-blue: #004b84;
  --accent-orange: #7a3600;
  --accent-warning: #6b4200;
  --accent-lime: #17613f;
  --graph-passed: #17613f;
  --accent-error: #8f1f3d;
  --graph-failed: #8f1f3d;
  --accent-magenta: #78113f;
}

/* A focused live probe proved the later Glass .pm6-orch-ctl !important rule
   washed out enabled primaries. One CTA click still produced exactly one
   run.approveGate log row, one terminal run.gate emission, and approved state;
   this rule changes paint only. */
html[data-theme="glass-light"] .page-orchestrator .pm6-orch-ctl.pm6-orch-ctl-primary:not(:disabled) {
  background: #003f70 !important;
  border-color: #003f70 !important;
  color: #ffffff !important;
}
html[data-theme="glass-dark"] .page-orchestrator .pm6-orch-ctl.pm6-orch-ctl-primary:not(:disabled) {
  background: #9fc3ff !important;
  border-color: #9fc3ff !important;
  color: #191128 !important;
}

/* Later Retro component rules restore saturated enabled paint after the
   general disabled state.  Reassert a deliberately quiet, readable disabled
   composite for the actual disabled and router-readable aria-disabled forms. */
html[data-theme="retro-dark"] .page-wizard .pm6-wiz-approve:is(:disabled,[aria-disabled="true"]) {
  background: #242720 !important;
  border: 1px solid #697164 !important;
  color: #c4cad2 !important;
}
html[data-theme="retro-light"] .page-wizard .pm6-wiz-approve:is(:disabled,[aria-disabled="true"]) {
  background: #e2ddd4 !important;
  border: 1px solid #7a817e !important;
  color: #3f4548 !important;
}

/* Retro Light's inherited primary-project rule paints dark text on a dark
   green CTA.  Keep the component local and use the passing semantic green. */
html[data-theme="retro-light"] .page-projects > .projects-header-bento .projects-actions > button.primary {
  background: #17613f !important;
  border-color: #17613f !important;
  color: #ffffff !important;
}

/* Friendly title-bar search fields: the frosted --pm6-cozy-field fill reads
   as a separate "typing box" floating inside the pill.  Drop the fill — the
   outlined pill plus focus ring carry the affordance, matching the repaired
   Settings search fields — and disable native field paint. */
[data-theme^="friendly"] .title-bar .search-bar,
[data-theme^="friendly"] .title-bar .pm6-tb-search-pop-input {
  -webkit-appearance: none;
  appearance: none;
  background-color: transparent;
}
</style>
""".replace("__SURFACES__", SURFACES)


def apply(doc, notes, need):
    """Apply T37 after T36 and prove protected GUI source bytes remain exact."""
    need(TRANSFORM_MARKER not in doc, "T37: transform already applied")
    need("PM7 T36: physical-width cross-page layout repair" in doc, "T37: T36 source marker missing")

    protected_owner_before = capture_protected_sources(doc, need, "T37 input")
    effects_before = capture_effect_surfaces(doc)
    assistant_before = _assistant_slices(doc, need)
    settings_before = _settings_slice(doc, need)
    for forbidden in (".page-settings", ".s4-", ".chat-", ".context-", ".pm7ctx", ".chm-"):
        need(forbidden not in T37_STYLE, "T37: protected selector entered CSS: %s" % forbidden)
    need(doc.count("</head>") == 1, "T37: unique head close missing")
    doc = doc.replace("</head>", T37_STYLE + "\n</head>", 1)

    need(_assistant_slices(doc, need) == assistant_before, "T37: protected Assistant source changed")
    need(_settings_slice(doc, need) == settings_before, "T37: protected Settings subtree changed")
    protected_receipt = assert_protected_sources_equal(
        protected_owner_before,
        capture_protected_sources(doc, need, "T37 output"),
        need,
        "T37",
    )
    effect_receipt = assert_effect_delta(
        effects_before,
        capture_effect_surfaces(doc),
        {},
        need,
        "T37",
    )
    need(doc.count(TRANSFORM_MARKER) == 1, "T37: marker census mismatch")
    need(".pm6-orch-ctl.pm6-orch-ctl-primary:not(:disabled)" in doc, "T37: enabled Glass primary repair missing")
    need("background: #003f70 !important" in doc and "background: #9fc3ff !important" in doc, "T37: Glass primary theme pair incomplete")
    need(".pm6-wiz-approve:is(:disabled,[aria-disabled=\"true\"])" in doc and "#17613f" in doc, "T37: Retro component-state contrast repair missing")

    notes.update({
        "decision": "authorized T37 component-scoped contrast repair",
        "scope": ["Usage", "Planning Wizard", "Projects ordinary surface", "Orchestrator"],
        "glass_approval_probe": "external audit evidence; not executed by this build",
        "protected_embedded_source_guard": protected_receipt,
        "effect_surface_set_diff": effect_receipt,
    })
    return doc
