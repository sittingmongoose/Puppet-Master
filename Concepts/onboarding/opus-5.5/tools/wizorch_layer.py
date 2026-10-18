# History (Q18, 2026-10-18): these patches are folded into ../base/.
# The live build no longer imports this module. Edit the base sources, not these lists.
"""The Planning Wizard and the Orchestrator: theme-matching fixes on the pinned base (Jared, 2026-10-13: "Minor fixes
and fixes to match the theme with the rest of the concept can be done to the orchestration and planning wizard pages";
both pages get their full redesign later, so their layout, structure and flows stay as they are).

build.py runs apply() at step 2c, after the base patches and the Usage layer and before the O55 splice. The look itself
(no pill labels, square-ended bars, tabs filled on their own box, the look's controls, Liquid Glass fills) is CSS, in
src/css/27-wizard-orch.css; this module only changes what CSS cannot reach:

1. The Orchestrator's "Retry from safe point" confirmation opened by itself the first time the page was shown. The
   named-plan scope script (T46, systems integration) shows or hides every direct child of #panel-orchestrator with
   the plan scope, and its "show" set hidden = false on all of them, including rows that were hidden for their own
   reasons: the confirmation's scrim (it opened with the fixture's placeholder text, sp-000 and n-00) and, after a
   scope change, the "Viewing historical run" banner. The loop now hides a row only if it was showing, marks it, and
   on the way back shows only the rows it hid itself; everything else keeps its own hidden state.
2. The node graph's problem list wrote "⚠" in front of each node in its chip. The chip is now a status mark and a word
   (DL-184 / F3-648), whose mark already says the same, so the symbol goes; the words are unchanged.
3. Liquid Glass wants the Orchestrator's controls on one header sheet (its review of 2026-10-13): the title row, the
   plan scope row the T46 script inserts after it, the run banners and the view tabs. A wrapper (.wo-orch-head) now
   holds them; outside Liquid Glass it is display: contents, so every other look lays them out exactly as before. The
   plan-scope script's show/hide loop reaches into the wrapper, so it treats those rows exactly as it did when they
   were the page's own children.
4. Liquid Glass: the page columns opt in to pm7-liquid-glass's sheets with data-lg-surface (its contract of 2026-10-13:
   panel for the big columns, card for a free-standing card, bar for a header strip, menu for anything floating; at
   most about three sheets on screen per page; never a sheet on a sheet). The attribute does nothing until glass.js is
   on the page and Liquid Glass is on in a Glass look; old Glass and every other look ignore it.

Every patch is guarded: its anchor must occur exactly once in the base, or the build stops.
"""
from __future__ import annotations

# (old, new, label)
PATCHES: list[tuple[str, str, str]] = [
    # 1. the scope loop shows again only what it hid itself (the confirmation and the banners keep their own state);
    #    it also reaches the rows inside the header wrapper (3), as it did when they were the page's own children
    ("[...orch.children].forEach(function(child){if(child===bar||child===cards||child.classList.contains('orch-header'))"
     "return;child.hidden=!showRun;});",
     "var woHead=orch.querySelector('.wo-orch-head');[...orch.children].concat(woHead?[...woHead.children]:[])"
     ".forEach(function(child){if(child===bar||child===cards||child===woHead||child.classList.contains('orch-header'))"
     "return;if(!showRun){if(!child.hidden){child.hidden=true;child.dataset.woScopeHid='1';}}"
     "else if(child.dataset.woScopeHid){child.hidden=false;delete child.dataset.woScopeHid;}});",
     'wizorch: the scope loop restores only what it hid'),
    # 2. the problem-node chip: its status mark replaces the warning symbol
    ("return chip('⚠ ' + n.id + ' ' + (n.degraded",
     "return chip(n.id + ' ' + (n.degraded",
     'wizorch: problem-node chip without the warning symbol'),
    # 3. one header for the Orchestrator's controls (title row, scope row, banners, view tabs)
    ('<div class="orch-header pm6-orch-header">',
     '<div class="wo-orch-head">\n            <div class="orch-header pm6-orch-header">',
     'wizorch: header wrapper opens'),
    ('<div class="orch-content pm6-orch-content">',
     '</div>\n            <div class="orch-content pm6-orch-content">',
     'wizorch: header wrapper closes'),
]

# 4. Liquid Glass opt-ins: (anchor, attribute added to that start tag, label). Only one Wizard stage shows at a time,
#    so each stage carries at most three sheets.
SURFACES: list[tuple[str, str, str]] = [
    # intake and requirements: the form column is one sheet; its cards are plain fills on it
    ('<div class="pm6-wiz-intake-scroll">', 'panel', 'intake column'),
    ('<div class="pm6-wiz-intake-scroll pm6-wiz-reqs-scroll">', 'panel', 'requirements column'),
    # the PRD Builder's three columns
    ('<aside class="pm6-wiz-prdrail" id="pm6WizPrdRail">', 'panel', 'PRD outline column'),
    ('<main class="pm6-wiz-prdchat-wrap">', 'panel', 'PRD chat column'),
    ('<aside class="pm6-wiz-prdpreview">', 'panel', 'PRD projection column'),
    # discovery: the one card on the page
    ('<div class="pm6-wiz-disc-card pm-enter-scale">', 'card', 'discovery card'),
    # the workspace's three columns (the right column holds the preview and the gates as plain fills)
    ('<aside class="pm6-wiz-topics">', 'panel', 'topic map column'),
    ('<main class="pm6-wiz-thread" id="pm6WizThread">', 'panel', 'topic thread column'),
    ('<aside class="pm6-wiz-right">', 'panel', 'plan preview column'),
    # floating: the expanded document and the safe-point confirmation
    ('<div class="pm6-wiz-doc-overlay-panel" role="dialog"', 'menu', 'expanded document'),
    ('<div class="pm6-orch-modal" role="dialog"', 'menu', 'safe-point confirmation'),
    # the Orchestrator: one header sheet (title, scope row, banners, the lens's tab strip) and its board
    ('<div class="wo-orch-head">', 'bar', 'orchestrator header'),
    ('<div class="orch-content pm6-orch-content">', 'panel', 'orchestrator board'),
]


def _surface_patch(anchor: str, kind: str) -> str:
    """The anchor's start tag with data-lg-surface added just after its tag name."""
    tag_end = anchor.index(' ')
    return anchor[:tag_end] + f' data-lg-surface="{kind}"' + anchor[tag_end:]


def apply(text: str, need) -> tuple[str, dict]:
    """Apply every patch exactly once; return the text and a note for the build summary."""
    applied = []
    for old, new, label in PATCHES:
        count = text.count(old)
        need(count == 1, f'patch "{label}": anchor found {count} times (need exactly 1)')
        text = text.replace(old, new, 1)
        applied.append(label)
    for anchor, kind, label in SURFACES:
        count = text.count(anchor)
        need(count == 1, f'patch "wizorch: Liquid Glass {label}": anchor found {count} times (need exactly 1)')
        text = text.replace(anchor, _surface_patch(anchor, kind), 1)
        applied.append(f'lg {kind}: {label}')
    return text, {'patches': len(PATCHES), 'surfaces': len(SURFACES), 'applied': applied}

