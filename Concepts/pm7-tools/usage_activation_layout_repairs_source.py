"""Source-owned T42 first-visible Usage layout restoration.

T42 follows T41 and is deliberately limited to the user-reported cold-entry
defect: a persisted Usage room could be rendered while ``#panel-usage`` was
hidden, causing zero-geometry slot projection to stamp degenerate inline grid
placements.  The first visible render then appeared as a single collapsed row
until another room change forced a visible re-render.

The generated PMConcept7 artifact is never edited directly.  The transform
protects the embedded Settings and Assistant owners byte-for-byte and adds no
command, event, or persistence surface.
"""

from __future__ import annotations

from pm7_transform_guards import (
    assert_effect_delta,
    assert_protected_sources_equal,
    capture_effect_surfaces,
    capture_protected_sources,
)


TRANSFORM_MARKER = "PM7 T42: first-visible Usage slot restoration"


def _replace_once(doc, old, new, need, label):
    count = doc.count(old)
    need(count == 1, "T42 %s: expected one anchor, found %d" % (label, count))
    return doc.replace(old, new, 1)


SYNC_USAGE_LAYER_BEFORE = r'''  function syncUsageLayer() {
    document.body.classList.toggle('pm7u-page-active', usagePanel.classList.contains('active'));
  }
'''


SYNC_USAGE_LAYER_AFTER = r'''  /* PM7 T42: first-visible Usage slot restoration. */
  var usageVisibleLayoutFrame = 0;
  var usageVisibleLayoutReady = false;
  function restoreUsageLayoutWhenVisible() {
    usageVisibleLayoutFrame = 0;
    if (!usagePanel.classList.contains('active') || usageVisibleLayoutReady) return;
    /* A positive-width ResizeObserver notification retries a zero-geometry
       activation.  Pointer transactions retry on their next frame without
       letting render()'s operation guard masquerade as completed work. */
    if (board.clientWidth <= 0) return;
    if (document.body.classList.contains('pm7u-pointer-op')) return;
    render();
    usageVisibleLayoutReady = true;
  }
  function scheduleUsageVisibleLayout() {
    if (usageVisibleLayoutReady || usageVisibleLayoutFrame || !usagePanel.classList.contains('active')) return;
    usageVisibleLayoutFrame = requestAnimationFrame(restoreUsageLayoutWhenVisible);
  }
  function syncUsageLayer() {
    var active = usagePanel.classList.contains('active');
    document.body.classList.toggle('pm7u-page-active', active);
    if (active) scheduleUsageVisibleLayout();
  }
'''


SETTLED_SLOT_BEFORE = r'''  function applySettledUsageSlots() {
    var cards = $$('.pm7u-card',board);
'''


SETTLED_SLOT_AFTER = r'''  function applySettledUsageSlots() {
    /* Persisted slots require physical card and board geometry.  Hidden-page
       boot renders keep their authored flow instead of projecting from zero. */
    if (!usagePanel.classList.contains('active') || board.clientWidth <= 0) return false;
    var cards = $$('.pm7u-card',board);
'''


PHYSICAL_OBSERVER_BEFORE = r'''  var physicalTierObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(schedulePhysicalContentTiers) : null;
'''


PHYSICAL_OBSERVER_AFTER = r'''  var physicalTierObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(function () {
    schedulePhysicalContentTiers();
    scheduleUsageVisibleLayout();
  }) : null;
'''


OP_OFF_BEFORE = r'''  function opOff() { resetUsageMagnetState(); document.body.classList.remove('pm7u-pointer-op'); }
'''


OP_OFF_AFTER = r'''  function opOff() {
    resetUsageMagnetState();
    document.body.classList.remove('pm7u-pointer-op');
    scheduleUsageVisibleLayout();
  }
'''


def apply(doc, notes, need):
    """Apply T42 after T41 and emit fail-closed source/effect receipts."""
    need(TRANSFORM_MARKER not in doc, "T42: transform already applied")
    need(
        "PM7 T41: stable Usage control acquisition and page overflow" in doc,
        "T42: T41 marker missing",
    )
    protected_before = capture_protected_sources(doc, need, "T42 input")
    effects_before = capture_effect_surfaces(doc)

    doc = _replace_once(
        doc,
        SYNC_USAGE_LAYER_BEFORE,
        SYNC_USAGE_LAYER_AFTER,
        need,
        "Usage activation observer",
    )
    doc = _replace_once(
        doc,
        SETTLED_SLOT_BEFORE,
        SETTLED_SLOT_AFTER,
        need,
        "settled-slot visibility guard",
    )
    doc = _replace_once(
        doc,
        PHYSICAL_OBSERVER_BEFORE,
        PHYSICAL_OBSERVER_AFTER,
        need,
        "positive-width retry observer",
    )
    doc = _replace_once(
        doc,
        OP_OFF_BEFORE,
        OP_OFF_AFTER,
        need,
        "post-transaction activation retry",
    )

    protected_receipt = assert_protected_sources_equal(
        protected_before,
        capture_protected_sources(doc, need, "T42 output"),
        need,
        "T42",
    )
    effect_receipt = assert_effect_delta(
        effects_before,
        capture_effect_surfaces(doc),
        {},
        need,
        "T42",
    )

    need(doc.count(TRANSFORM_MARKER) == 1, "T42: transform marker census mismatch")
    need(
        "if (!usagePanel.classList.contains('active') || board.clientWidth <= 0) return false;"
        in doc,
        "T42: hidden settled-slot projection guard missing",
    )
    need(
        "function restoreUsageLayoutWhenVisible()" in doc
        and "function scheduleUsageVisibleLayout()" in doc
        and "usageVisibleLayoutFrame = requestAnimationFrame(restoreUsageLayoutWhenVisible);" in doc
        and "if (board.clientWidth <= 0) return;" in doc
        and "if (document.body.classList.contains('pm7u-pointer-op')) return;" in doc
        and "render();\n    usageVisibleLayoutReady = true;" in doc
        and "schedulePhysicalContentTiers();\n    scheduleUsageVisibleLayout();" in doc,
        "T42: coalesced first-visible render incomplete",
    )
    need(
        "document.body.classList.remove('pm7u-pointer-op');\n    scheduleUsageVisibleLayout();"
        in doc,
        "T42: post-transaction activation retry missing",
    )
    need(
        doc.index("render();\n    usageVisibleLayoutReady = true;")
        < doc.index("var physicalTierObserver = typeof ResizeObserver"),
        "T42: readiness must follow the completed activation render",
    )
    authored_t42 = "\n".join(
        [
            SYNC_USAGE_LAYER_AFTER,
            SETTLED_SLOT_AFTER,
            PHYSICAL_OBSERVER_AFTER,
            OP_OFF_AFTER,
        ]
    )
    need(
        all(
            token not in authored_t42
            for token in [
                "cmd.workspace_layout",
                "context.compaction",
                "workspace.layout_changed",
                "pm:workspace-layout-changed",
                "localStorage",
                "sessionStorage",
            ]
        ),
        "T42: unauthorized command/event/storage surface",
    )
    need(
        all(
            token not in authored_t42
            for token in [
                "PM7_CONTEXT",
                "Tome Tabs",
                "Kimi",
                "PM_Chat_Assistant_5.6_Pro_Standalone",
            ]
        ),
        "T42: protected Chat or Settings source referenced",
    )

    notes.update(
        {
            "decision": "authorized T42 repair for persisted Usage layouts on cold first entry",
            "first_visible_layout": "hidden boot renders cannot project persisted slots from zero geometry; class activation and the existing board ResizeObserver coalesce a retry until one active positive-width non-transaction render completes",
            "protected_embedded_source_guard": protected_receipt,
            "effect_surface_set_diff": effect_receipt,
        }
    )
    return doc
