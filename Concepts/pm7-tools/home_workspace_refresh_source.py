"""Authored T48 refresh for the Home Workspace source embedded in the PM7 base.

The 2026-08-27 re-baseline retired the original T20 assembly transform into
``base/PM7-base.html``.  ``home_workspace_source.py`` subsequently received
factory-layout and migration repairs, so this narrow transform replaces only
the uniquely bounded T20 style and controller bands with their current
authored sources.  It does not rerun the retired T20 assembly or mutate the
frozen base.
"""

from __future__ import annotations

import hashlib

import home_workspace_source as home_source
from pm7_transform_guards import assert_effect_delta, capture_effect_surfaces


TRANSFORM_MARKER = "PM7 T48: Home workspace authored-source refresh"
STYLE_START = "/* PM7 T20: compact, model-owned Home workspace presentation. */"
STYLE_END = '[data-motion="reduced"] .pm-home-portal { transition-duration: 0s !important; }'
SCRIPT_START = "/* PM7 T20: Home workspace model-first controller. */"

PINNED_INPUT_SHA256 = {
    "markup": "04b7f065297853339c66c15bb31f9a7bad34791a91de4ba4fbbace05db171845",
    "style": "01e5bd1c0c7210323badf623870a29ee9ee40081a1d50f7788f6599a1a376781",
    "script": "73615ff4ed05750c08783cedc020523297169bba1bd654eb633422a99a584d8b",
}

EXPECTED_EFFECT_DELTA = {
    "command_ids": {"added": [], "removed": ["cmd.workspace_layout.size_surface"]},
    "domain_event_ids": {"added": [], "removed": []},
    "dom_event_types": {"added": [], "removed": []},
    "persistence_targets": {"added": [], "removed": []},
}


def _sha(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _bounded(doc: str, start: str, end: str, need, label: str):
    need(doc.count(start) == 1, "T48 %s start anchor count is not one" % label)
    begin = doc.index(start)
    finish = doc.index(end, begin) + len(end)
    need(finish > begin, "T48 %s anchors are out of order" % label)
    return begin, finish, doc[begin:finish]


def apply(doc, notes, need):
    """Refresh only the pinned T20 Home style/controller source bands."""
    need(TRANSFORM_MARKER not in doc, "T48: transform already applied")
    need(doc.count(home_source.HOME_TRANSFORM_MARKER) == 1, "T48: T20 markup lineage marker mismatch")
    need(doc.count('id="pm-home-workspace"') == 1, "T48: Home workspace root mismatch")

    markup_begin = doc.index("<!-- " + home_source.HOME_TRANSFORM_MARKER + " -->")
    markup_finish = doc.index('  <div id="glass-bg"', markup_begin)
    embedded_markup = doc[markup_begin:markup_finish].rstrip("\n")
    authored_markup = ("<!-- " + home_source.HOME_TRANSFORM_MARKER + " -->\n" + home_source.HOME_MARKUP).rstrip("\n")
    need(_sha(embedded_markup) == PINNED_INPUT_SHA256["markup"], "T48: embedded Home markup drift")
    need('data-pm-home-action="run-onboarding"' in authored_markup, "T48: authored Home setup-wizard relaunch control missing")
    need(authored_markup.count('data-pm-home-action="run-onboarding"') == 1, "T48: authored Home setup-wizard relaunch control census mismatch")
    need('data-source-surface="home_menu"' in authored_markup, "T48: Home setup-wizard relaunch source identity missing")

    style_begin, style_finish, embedded_style = _bounded(doc, STYLE_START, STYLE_END, need, "style")
    need(_sha(embedded_style) == PINNED_INPUT_SHA256["style"], "T48: embedded Home style drift")
    authored_style = home_source.HOME_STYLE.strip("\n")

    script_begin = doc.index(SCRIPT_START)
    need(doc.count(SCRIPT_START) == 1, "T48: Home controller start anchor mismatch")
    script_finish = doc.index("</script>", script_begin)
    embedded_script = doc[script_begin:script_finish].rstrip("\n")
    need(_sha(embedded_script) == PINNED_INPUT_SHA256["script"], "T48: embedded Home controller drift")
    authored_script = home_source.HOME_SCRIPT.strip("\n")

    effects_before = capture_effect_surfaces(doc)
    doc = doc[:script_begin] + "/* " + TRANSFORM_MARKER + " */\n" + authored_script + "\n" + doc[script_finish:]
    doc = doc[:markup_begin] + authored_markup + "\n" + doc[markup_finish:]
    doc = doc[:style_begin] + authored_style + doc[style_finish:]

    need(doc.count(TRANSFORM_MARKER) == 1, "T48: transform marker mismatch")
    need(doc.count(SCRIPT_START) == 1, "T48: refreshed Home controller mismatch")
    need('var CURRENT_LAYOUT_VERSION = "1.1.0";' in doc, "T48: current Home layout version missing")
    need('pm.homeWorkspaceLayout:v2:' in doc, "T48: v2 Home storage key missing")
    need('pm.homeWorkspaceLayout:v1:' in doc, "T48: v1 Home migration source missing")
    need("syncFactoryEditorProjection();" in doc and "captureBrowserChrome();" in doc, "T48: factory/browser reconciliation hooks missing")
    need('makeSurface("editor_panel_2", "editor_panel", "home_main", 2, false)' in doc, "T48: Panel 2 factory visibility or normalization-stable slot is incorrect")
    need('makeSurface("dashboard", "dashboard", "home_main", 1, true)' in doc, "T48: Dashboard factory visibility or normalization-stable slot is incorrect")
    need('makeSurface("chat", "chat", "dock_right", 0, true)' in doc, "T48: Chat factory visibility is not enabled")
    need(doc.count('data-pm-home-action="run-onboarding"') == 1, "T48: refreshed Home setup-wizard relaunch control mismatch")
    need('onboarding.replay({ source_surface: "home_menu" })' in doc, "T48: Home setup-wizard relaunch wiring missing")
    need("cmd.workspace_layout.size_surface" not in doc, "T48: retired preset-size compatibility command survived")
    need("cmd.workspace_layout.resize_surface" in doc, "T48: canonical Home resize command missing")
    need('#dashboardView.pm-home-surface { min-width: min(100%, 280px); }' in doc, "T48: Dashboard preferred floor must stay capped by its owning host so the corner grip cannot be occluded")

    effect_receipt = assert_effect_delta(
        effects_before,
        capture_effect_surfaces(doc),
        EXPECTED_EFFECT_DELTA,
        need,
        "T48",
    )
    notes.update(
        {
            "decision": "refresh the re-baselined T20 Home markup/style/controller from its current authored source without mutating the frozen base",
            "pinned_input_sha256": dict(PINNED_INPUT_SHA256),
            "authored_output_sha256": {
                "markup": _sha(authored_markup),
                "style": _sha(authored_style),
                "script": _sha(authored_script),
            },
            "factory_contract": "Basic Dark is theme-owned; Home shows Panel 1 and Chat, hides Panel 2, seats seven factory files plus Browser Preview and Automation in Panel 1",
            "migration_contract": "only an exact untouched v1 factory layout upgrades; customized v1 layouts copy forward without a destructive reset",
            "simulation_boundary": "generated browser concept only; no native Slint runtime, persistence, or migration execution certification",
            "slint_portability": "model records, owner references, bounded arrays, pointer/focus actions, and geometry tokens; browser persistence remains prototype-only",
            "effect_surface_set_diff": effect_receipt,
        }
    )
    return doc
