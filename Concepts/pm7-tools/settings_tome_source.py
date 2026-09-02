"""Source-owned T44 port of the winning K3 Tome Tabs Settings concept.

The standalone concept remains the layout/source input.  This transform reads
the pinned winner assets, verifies their hashes, adapts the CSS and JavaScript
for the PMConcept7 host, and replaces only the embedded Settings owner slices
plus the project-scoped theme-persistence seam.  The generated HTML is never
an authored source.

The browser prototype is deliberately conservative about the eventual Slint
1.17.1 port: no CSS backdrop filters, SVG filters, ``color-mix()``, or
``:has()`` selectors survive.  Width adaptation is expressed as host-width
container queries so the logic can map to Slint component geometry rather
than the desktop viewport.
"""

from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

import css_audit
from pm7_transform_guards import capture_effect_surfaces


HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
WINNER_DIR = REPO / "Concepts" / "settings-redesign-concepts" / "kimi-k3-polish"
ASSET_DIR = WINNER_DIR / "concept-12-kimi"

WINNER_SHA = "ee973df22fa57cbaeac1f034cc158525c0747f04be5d8b0e68054a84c5f9d958"
ASSET_SHAS = {
    "kimi.css": "d3a7ba468c31924845c6f80a4933c0c8e5abd7e668d168f9d38b3a74caf15b02",
    "kimi-reference.js": "10c0e516b4a213134651be2156f32c83bbb993bbf700105f2bdd81b5025815c8",
    "kimi-data.js": "8f31731eeaa2efd94b5f3160ff57a0a498e093c97936da6a3b4f94b1c3014087",
    "kimi.js": "459141a25152283135be49a3ae192f6268e9541ee676f677a9bd35782d4e863f",
}

TRANSFORM_MARKER = "PM7 T44: Settings Tome Tabs K3 port"
CREDENTIAL_SETTING_IDS = frozenset(
    {
        "ai.accounts.anthropic-api-key",
        "ai.accounts.openai-api-key",
        "ai.accounts.gemini-api-key",
        "ai.accounts.cursor-api-key",
        "ai.accounts.minimax-api-key",
        "ai.accounts.github-token",
        "ai.accounts.opencode-server-auth",
        "code.execution.dockerhub-token",
        "web.providers.firecrawl-api-key",
        "web.fetch.proxy-credentials",
        "system.mcp.remote-headers",
    }
)


def _sha(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _read_sources(need):
    winner = (WINNER_DIR / "concept-12-tome-tabs.html").read_text(encoding="utf-8")
    need(_sha(winner) == WINNER_SHA, "T44: winning HTML hash drift")
    sources = {}
    for name, expected in ASSET_SHAS.items():
        text = (ASSET_DIR / name).read_text(encoding="utf-8")
        need(_sha(text) == expected, "T44: %s hash drift" % name)
        need("</script" not in text.lower(), "T44: unsafe literal script terminator in %s" % name)
        sources[name] = text
    need(
        "./concept-12-kimi/kimi.css" in winner
        and "./concept-12-kimi/kimi-reference.js" in winner
        and "./concept-12-kimi/kimi-data.js" in winner
        and "./concept-12-kimi/kimi.js" in winner,
        "T44: winner no longer references the pinned K3 source set",
    )
    return winner, sources


def _canonical_reference(need):
    """Project the live canonical Settings inventory into K3's read model."""
    inventory_path = REPO / "Plans" / "settings_inventory.json"
    raw = inventory_path.read_text(encoding="utf-8")
    inventory = json.loads(raw)
    categories = inventory.get("categories") or []
    settings = inventory.get("settings") or []
    category_ids = [category.get("id") for category in categories]
    setting_ids = [row.get("id") for row in settings]
    need(len(category_ids) == len(set(category_ids)), "T44: duplicate canonical Settings category id")
    need(len(setting_ids) == len(set(setting_ids)), "T44: duplicate canonical setting id")
    need(all(isinstance(value, str) and value.count(".") >= 2 for value in setting_ids), "T44: malformed canonical setting id")

    by_cat = {}
    for category in categories:
        cat_id = category["id"]
        rows = []
        subgroup_counts = {sub["id"]: 0 for sub in category.get("subgroups", [])}
        for source in settings:
            parts = source["id"].split(".")
            if parts[0] != cat_id:
                continue
            subgroup = parts[1]
            subgroup_counts[subgroup] = subgroup_counts.get(subgroup, 0) + 1
            row = dict(source)
            row["cat"] = cat_id
            row["sub"] = subgroup
            if row["id"] in CREDENTIAL_SETTING_IDS:
                row["credential_ref_only"] = True
                row["default"] = None
                row["recommended"] = None
            rows.append(row)
        subgroups = [
            {"id": sub["id"], "title": sub["title"], "count": subgroup_counts.get(sub["id"], 0)}
            for sub in category.get("subgroups", [])
        ]
        by_cat[cat_id] = {"title": category["title"], "subgroups": subgroups, "settings": rows}

    projection = {
        "version": inventory.get("schema_version", 1),
        "total": len(settings),
        "inventory_sha256": _sha(raw),
        "categories": [{"id": category["id"], "title": category["title"]} for category in categories],
        "byCat": by_cat,
    }
    return "window.PM12_REFERENCE = " + json.dumps(projection, separators=(",", ":"), ensure_ascii=False) + ";", projection


def _project_inventory_json(need):
    """Build the current inert PM7 compatibility payload with T44 scope."""
    inventory_path = REPO / "Plans" / "settings_inventory.json"
    inventory = json.loads(inventory_path.read_text(encoding="utf-8"))
    rows = inventory.get("settings") or []
    for row in rows:
        row["scope"] = ["project"]
        if row.get("id") in CREDENTIAL_SETTING_IDS:
            row["credential_ref_only"] = True
            row["default"] = None
            row["recommended"] = None
    inventory["scope_policy"] = "all persisted Settings values are project-owned; no-project is ephemeral"
    need(len(rows) == 828, "T44: compatibility Settings inventory count changed")
    need(len({row.get("id") for row in rows}) == len(rows), "T44: compatibility Settings inventory ids are not unique")
    return json.dumps(inventory, separators=(",", ":"), ensure_ascii=False)


def _transfer_category_registry(need):
    """Freeze the K3 transfer taxonomy to exact canonical ids.

    The inventory does not own this ten-way UX taxonomy, so this adapter
    materializes explicit, pairwise-disjoint ID sets and validates every
    member against the current 828-row inventory at build time.
    """
    rows = json.loads((REPO / "Plans" / "settings_inventory.json").read_text(encoding="utf-8"))["settings"]
    canonical = {row["id"] for row in rows}
    notification_ids = {
        "general.interaction.notifications-enabled",
        "general.interaction.notification-method",
        "general.interaction.tray-notifications",
        "general.interaction.sound-effects",
        "general.interaction.sound-catalog",
        "general.interaction.notification-severity",
        "general.interaction.notification-destinations",
        "general.interaction.notification-mapping",
        "general.interaction.sound-management",
        "general.interaction.sound-mapping",
        "general.interaction.alert-quiet-window",
    }
    appearance_interaction_ids = {
        "general.interaction.show-tooltips",
        "general.interaction.submit-key",
        "general.interaction.auto-follow",
        "general.interaction.unread-marker",
        "general.interaction.copy-code-button",
        "general.interaction.edit-resend",
        "general.interaction.question-cards",
        "general.interaction.question-drafts",
        "general.interaction.context-usage",
        "general.interaction.activity-cards",
        "general.interaction.file-discovery-cards",
        "general.interaction.mermaid",
        "general.interaction.inline-visualizers",
        "general.interaction.natural-language-modes",
        "general.interaction.subagent-disclosure",
        "general.interaction.provider-disclosure",
        "general.interaction.composer-media-controls",
        "general.interaction.browser-capture",
        "general.interaction.language-detection",
        "general.interaction.hide-ignored-files",
        "general.interaction.expand-current-file",
        "general.interaction.settings-search",
        "general.interaction.scope-labels",
        "general.interaction.dashboard-widgets",
        "general.interaction.activity-bar-order",
        "general.interaction.panel-dock",
        "general.interaction.rediscoverability",
        "general.interaction.max-editor-tabs",
        "general.interaction.row-cap",
        "general.interaction.drop-conflict",
        "general.interaction.drop-action",
        "general.interaction.persist-tree-state",
        "general.interaction.run-graph-mode",
        "general.interaction.graph-density",
        "general.interaction.progress-widget-layout",
    }
    goal_ids = {
        "ai.models.goal-worker-model",
        "ai.models.goal-verifier-model",
        "ai.usage.max-goal-turns",
        "memory.limits.goal-token-budget",
        "planning.verification.goal-template",
        "planning.verification.invisible-goal-authority",
        "planning.verification.goal-auto-resume",
        "planning.verification.goal-checkpoint-cadence",
        "planning.verification.goal-replan-behavior",
        "planning.verification.goal-replan-events",
        "planning.verification.goal-interruption",
        "planning.verification.goal-write-mode",
    }
    project_sync_ids = {
        "code.execution.ssh-remotes",
        "planning.interview.wizard-project-path",
        "code.terminal.layout-restore",
        "code.editing.lsp-root-override",
        "web.index.remote-cache-mode",
    }
    registry = {
        "AI providers & accounts": {value for value in canonical if value.startswith("ai.accounts.")},
        "Model routing": {
            value for value in canonical if value.startswith("ai.models.") and value not in goal_ids
        },
        "Source control": {value for value in canonical if value.startswith("branching.worktrees.")},
        "Notifications & sounds": notification_ids,
        "Permissions": {value for value in canonical if value.startswith("safety.")},
        "Testing profiles": {value for value in canonical if value.startswith("planning.testing.")},
        "Appearance & input": {
            value for value in canonical if value.startswith("general.visual.")
        }
        | appearance_interaction_ids,
        "Context & memory behavior": {
            value for value in canonical if value.startswith("memory.") and value not in goal_ids
        },
        "Goals & personas": {value for value in canonical if value.startswith("personas.")} | goal_ids,
        "Project & sync": project_sync_ids,
    }
    seen = {}
    for category, setting_ids in registry.items():
        need(bool(setting_ids), "T44 transfer category %s is empty" % category)
        unknown = sorted(setting_ids - canonical)
        need(not unknown, "T44 transfer category %s has unknown ids %s" % (category, unknown))
        for setting_id in setting_ids:
            need(setting_id not in seen, "T44 transfer id %s overlaps %s and %s" % (setting_id, seen.get(setting_id), category))
            seen[setting_id] = category
    frozen = {category: sorted(setting_ids) for category, setting_ids in registry.items()}
    return json.dumps(frozen, separators=(",", ":"), ensure_ascii=False)


def _replace_once(text, old, new, need, label):
    count = text.count(old)
    need(count == 1, "T44 %s: expected one anchor, found %d" % (label, count))
    return text.replace(old, new, 1)


def _replace_band(text, start, end, replacement, need, label):
    need(text.count(start) == 1, "T44 %s: start count %d" % (label, text.count(start)))
    need(text.count(end) == 1, "T44 %s: end count %d" % (label, text.count(end)))
    a = text.index(start)
    z = text.index(end, a)
    need(z > a, "T44 %s: invalid anchor order" % label)
    return text[:a] + replacement + "\n" + text[z:]


def _owner_block(doc, block_id, need, stage):
    pattern = re.compile(
        r'<(?P<tag>style|script)\b(?=[^>]*\bid="' + re.escape(block_id)
        + r'")[^>]*>.*?</(?P=tag)>',
        re.S | re.I,
    )
    matches = list(pattern.finditer(doc))
    need(len(matches) == 1, "T44 %s: owner block %s count %d" % (stage, block_id, len(matches)))
    return matches[0].group(0)


def _balanced_element(doc, element_id, need, stage):
    opening = re.compile(
        r'<(?P<tag>[A-Za-z][A-Za-z0-9:-]*)\b(?=[^>]*\bid="'
        + re.escape(element_id) + r'")[^>]*>',
        re.S,
    )
    matches = list(opening.finditer(doc))
    need(len(matches) == 1, "T44 %s: element %s count %d" % (stage, element_id, len(matches)))
    match = matches[0]
    tag = match.group("tag")
    token_pattern = re.compile(r'</?' + re.escape(tag) + r'\b[^>]*>', re.S | re.I)
    depth = 0
    for token in token_pattern.finditer(doc, match.start()):
        source = token.group(0)
        if source.startswith("</"):
            depth -= 1
            if depth == 0:
                return doc[match.start():token.end()], match.group(0), source
        elif not source.rstrip().endswith("/>"):
            depth += 1
    need(False, "T44 %s: element %s unbalanced" % (stage, element_id))
    return "", "", ""


def _chat_sources(doc, need, stage):
    ids = ("pm6-css-chat", "pm6-js-chat-data", "pm6-js-chat")
    result = {block_id: _owner_block(doc, block_id, need, stage) for block_id in ids}
    for element_id in ("chat-panel", "chatResizer", "chatPanel", "floatingChat", "pm6WizPrdChat"):
        result[element_id] = _balanced_element(doc, element_id, need, stage)[0]
    return result


TOKEN_RENAMES = {
    "--bg-0": "--k3-bg-0",
    "--bg-1": "--k3-bg-1",
    "--bg-2": "--k3-bg-2",
    "--surface-0": "--k3-surface-0",
    "--surface-1": "--k3-surface-1",
    "--surface-2": "--k3-surface-2",
    "--surface-3": "--k3-surface-3",
    "--line-strong": "--k3-line-strong",
    "--line": "--k3-line",
    "--text-1": "--k3-text-1",
    "--text-2": "--k3-text-2",
    "--text-3": "--k3-text-3",
    "--muted": "--k3-muted",
    "--accent-soft-2": "--k3-accent-soft-2",
    "--accent-soft": "--k3-accent-soft",
    "--accent-2": "--k3-accent-2",
    "--accent": "--k3-accent",
    "--green-soft": "--k3-green-soft",
    "--green": "--k3-green",
    "--amber-soft": "--k3-amber-soft",
    "--amber": "--k3-amber",
    "--red-soft": "--k3-red-soft",
    "--red": "--k3-red",
    "--blue-soft": "--k3-blue-soft",
    "--blue": "--k3-blue",
    "--shadow-lg": "--k3-shadow-lg",
    "--shadow-md": "--k3-shadow-md",
    "--radius-xl": "--k3-radius-xl",
    "--radius-lg": "--k3-radius-lg",
    "--radius-md": "--k3-radius-md",
    "--radius-sm": "--k3-radius-sm",
    "--dur-fast": "--k3-dur-fast",
    "--dur-med": "--k3-dur-med",
    "--dur-slow": "--k3-dur-slow",
    "--ease-out": "--k3-ease-out",
    "--ease-expo": "--k3-ease-expo",
    "--ease-spring": "--k3-ease-spring",
    "--rail-w": "--k3-rail-w",
    "--topbar-h": "--k3-topbar-h",
}


def _scope_selector(selector):
    selector = selector.strip()
    selector = selector.replace(":has(> .manager-tabs)", ".has-manager-tabs")
    selector = selector.replace(":not(:has(> .manager-tabs))", ":not(.has-manager-tabs)")
    selector = re.sub(r"^:root\b", "#panel-settings", selector)
    selector = re.sub(r"^(?:html\s*,\s*body|html\s+body|html|body)\b", "#panel-settings", selector)
    if not selector.startswith("#panel-settings"):
        selector = "#panel-settings " + selector
    return selector


def _scope_css(css, need):
    rules = css_audit.iter_rules(css)
    edits = []
    for rule in rules:
        if rule.kind == "atomic-at" and rule.selector.lstrip().lower().startswith("@font-face"):
            edits.append((rule.start, rule.end, ""))
            continue
        if rule.kind != "rule":
            continue
        raw = css[rule.start:rule.body_open]
        selectors = css_audit.split_selector_list(raw)
        if any(s.strip() in ("body::before", "body::after") for s in selectors):
            edits.append((rule.start, rule.end, ""))
            continue
        scoped = ", ".join(_scope_selector(s) for s in selectors)
        edits.append((rule.start, rule.body_open, scoped + " "))
    edits.sort(key=lambda item: item[0])
    for i in range(1, len(edits)):
        need(edits[i][0] >= edits[i - 1][1], "T44 CSS: overlapping selector edits")
    out = []
    pos = 0
    for a, z, replacement in edits:
        out.append(css[pos:a])
        out.append(replacement)
        pos = z
    out.append(css[pos:])
    css = "".join(out)

    for old, new in sorted(TOKEN_RENAMES.items(), key=lambda pair: -len(pair[0])):
        css = css.replace(old, new)

    need(css.count("color-scheme: dark;") == 1, "T44 CSS: pinned K3 color-scheme anchor drift")
    css = css.replace("color-scheme: dark;", "color-scheme: var(--pm-settings-color-scheme, dark);", 1)

    css = re.sub(r"@media\s*\((min|max)-width\s*:", r"@container settings-host (\1-width:", css)
    # A query container cannot style itself from its own size query.  K3's
    # original :root breakpoint variables therefore belong on the owned
    # Settings root child after viewport media queries become host container
    # queries; descendants then inherit the exact 215/76/0 rail and 55px
    # compact-topbar values without coupling to the desktop viewport.
    for declaration in (
        "--k3-rail-w: 215px;",
        "--k3-rail-w: 76px;",
        "--k3-rail-w: 0px; --k3-topbar-h: 55px;",
    ):
        source = "#panel-settings { %s }" % declaration
        target = "#panel-settings > #pm-settings-root { %s }" % declaration
        need(css.count(source) == 1, "T44 CSS: responsive root declaration drift: %s" % declaration)
        css = css.replace(source, target, 1)
    css = css.replace(
        "/* No backdrop-filter: blur on a transformed ancestor softens all text */",
        "/* No browser blur: transformed ancestors must keep text crisp. */",
    )
    css = re.sub(r"(?:-webkit-)?backdrop-filter\s*:[^;{}]+;?", "", css)
    # Every K3 portal and narrow rail is seated inside the Settings page, not
    # the desktop viewport.  Percentages resolve against that owned host.
    css = re.sub(r"\bposition\s*:\s*fixed\b", "position: absolute", css)
    css = re.sub(r"(?<![\w-])(\d+(?:\.\d+)?)v[wh]\b", r"\1%", css)

    replacements = {
        "color-mix(in srgb, var(--k3-bg-2) 96%, transparent)": "var(--k3-bg-2)",
        "color-mix(in srgb, var(--k3-surface-1) 50%, var(--k3-bg-0) 50%)": "var(--k3-bg-1)",
        "color-mix(in srgb, var(--k3-surface-1) 88%, transparent)": "var(--k3-surface-1)",
        "color-mix(in srgb, var(--k3-surface-1) 80%, transparent)": "var(--k3-surface-1)",
        "color-mix(in srgb, var(--k3-bg-0) 89%, transparent)": "var(--k3-bg-0)",
        "color-mix(in srgb, var(--k3-bg-2) 78%, transparent 22%)": "var(--k3-bg-2)",
        "color-mix(in srgb, var(--k3-accent) 40%, var(--k3-line))": "var(--k3-line-strong)",
        "color-mix(in srgb, var(--k3-accent) 45%, var(--k3-line))": "var(--k3-line-strong)",
        "color-mix(in srgb, var(--k3-accent) 50%, var(--k3-line))": "var(--k3-line-strong)",
        "color-mix(in srgb, var(--k3-accent) 55%, var(--k3-line))": "var(--k3-line-strong)",
        "color-mix(in srgb, var(--k3-accent) 65%, var(--k3-line))": "var(--k3-accent)",
    }
    for old, new in replacements.items():
        css = css.replace(old, new)
    need("color-mix(" not in css, "T44 CSS: unsupported color-mix survived")
    need("backdrop-filter" not in css, "T44 CSS: unsupported backdrop filter survived")
    need(":has(" not in css, "T44 CSS: unsupported :has survived")
    need(not re.search(r"\d(?:vh|vw)\b", css), "T44 CSS: viewport unit survived")
    need("position: fixed" not in css, "T44 CSS: fixed positioning escaped Settings host")

    overrides = r'''
/* PM7 T44 semantic host bridge.  K3 geometry is preserved; paint is PM7-owned. */
#panel-settings {
  container: settings-host / inline-size;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  --k3-bg-0: var(--background);
  --k3-bg-1: var(--surface-alt);
  --k3-bg-2: var(--surface);
  --k3-surface-0: var(--surface);
  --k3-surface-1: var(--surface-elevated, var(--surface));
  --k3-surface-2: var(--surface-alt);
  --k3-surface-3: var(--surface-elevated, var(--surface));
  --k3-line: var(--border);
  --k3-line-strong: var(--border);
  --k3-text-1: var(--text-primary);
  --k3-text-2: var(--text-secondary);
  --k3-text-3: var(--text-muted);
  --k3-muted: var(--text-muted);
  --k3-accent: var(--accent-primary);
  --k3-accent-2: var(--accent-blue);
  --k3-accent-soft: rgba(var(--accent-primary-rgb), .15);
  --k3-accent-soft-2: rgba(var(--accent-primary-rgb), .08);
  --k3-green: var(--accent-lime);
  --k3-green-soft: rgba(var(--accent-primary-rgb), .14);
  --k3-amber: var(--accent-warning);
  --k3-amber-soft: rgba(212, 157, 68, .14);
  --k3-red: var(--accent-error);
  --k3-red-soft: rgba(205, 78, 91, .14);
  --k3-blue: var(--accent-blue);
  --k3-blue-soft: rgba(var(--accent-primary-rgb), .12);
  --k3-shadow-lg: var(--elev-3);
  --k3-shadow-md: var(--elev-2);
  --k3-rail-w: 250px;
  --k3-topbar-h: 62px;
  --pm-settings-color-scheme: dark;
  color: var(--text-primary);
  background: var(--background);
  font-family: var(--body-font);
}
:is(html[data-theme="friendly-light"],html[data-theme="glass-light"],html[data-theme="retro-light"],html[data-theme="basic-light"]) #panel-settings {
  --pm-settings-color-scheme: light;
  color-scheme: light;
}
:is(html[data-theme="friendly-dark"],html[data-theme="glass-dark"],html[data-theme="retro-dark"],html[data-theme="basic-dark"]) #panel-settings {
  --pm-settings-color-scheme: dark;
  color-scheme: dark;
}
#panel-settings > #pm-settings-root { width:100%; height:100%; min-width:0; min-height:0; }
#panel-settings > #pm-settings-portals { position:absolute; inset:0; z-index:300; pointer-events:none; overflow:hidden; }
#panel-settings > #pm-settings-portals > * { pointer-events:auto; }
#panel-settings > #pm-settings-portals > :is(.toast-stack,.tooltip) { pointer-events:none; }
#panel-settings :is(.overlay,.drawer-wrap) { position:absolute; inset:0; }
#panel-settings :is(.search-results,.popover,.toast-stack,.tooltip) { position:absolute; }
#panel-settings .breadcrumb { display:none !important; }
#panel-settings .topbar { background:var(--surface-alt); }
#panel-settings .workspace-tabs,
#panel-settings .document-toolbar,
#panel-settings .domain-rail,
#panel-settings .page-index { background:var(--surface); }
/* A soft remount acknowledges an in-place state change. Replaying the
   manager-body translation moves controls underneath an already committed
   pointer target, so only true route changes receive the entrance motion. */
#panel-settings .document-layout.is-soft-remount .manager-page .manager-body {
  animation:none !important; opacity:1 !important; transform:none !important;
}
#panel-settings .search-results,
#panel-settings .popover,
#panel-settings .dialog,
#panel-settings .drawer,
#panel-settings .toast,
#panel-settings .tooltip,
#panel-settings .panel-card,
#panel-settings .stat-card,
#panel-settings .side-card { background:var(--surface-elevated, var(--surface)); color:var(--text-primary); }
#panel-settings .setting-row,
#panel-settings .library-item,
#panel-settings .workflow-step,
#panel-settings .data-table tr { border-color:var(--border); }
#panel-settings .all-settings-catalog { padding:0 18px 18px; }
#panel-settings .all-settings-facets {
  display:grid; grid-template-columns:minmax(220px,2fr) repeat(3,minmax(118px,1fr));
  gap:8px; align-items:center; margin:0 0 10px;
}
#panel-settings .all-settings-facets .text-control,
#panel-settings .all-settings-facets .select-control { width:100%; min-width:0; }
#panel-settings .all-settings-summary {
  display:flex; align-items:center; justify-content:space-between; gap:10px;
  margin:0 0 8px; color:var(--text-muted); font-size:11px;
}
#panel-settings .all-settings-viewport {
  position:relative; height:560px; min-height:360px; overflow:auto;
  border:1px solid var(--border); border-radius:var(--radius-md);
  background:var(--surface); contain:layout paint style; overscroll-behavior:contain;
}
#panel-settings .all-settings-spacer { position:relative; width:100%; }
#panel-settings .all-settings-window { position:relative; padding-right:10px; }
#panel-settings .all-settings-virtual-pad { width:100%; pointer-events:none; }
#panel-settings .all-settings-window .setting-row {
  position:relative; width:auto; min-height:104px; height:auto; margin:4px 0;
  overflow:visible; background:var(--surface-elevated);
}
#panel-settings .slider-control { display:grid; grid-template-columns:minmax(96px,1fr) auto; align-items:center; gap:8px; min-width:180px; }
#panel-settings .slider-control input { width:100%; accent-color:var(--accent-primary); }
#panel-settings .slider-control output { min-width:42px; text-align:right; color:var(--text-secondary); font-family:var(--mono-font); }
#panel-settings .path-control { display:flex; align-items:center; gap:7px; min-width:min(360px,100%); }
#panel-settings .path-control .text-control { min-width:0; flex:1 1 auto; }
#panel-settings .owner-redirects { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin:0 0 10px; padding:9px 10px; border:1px solid var(--border); background:var(--surface-alt); }
#panel-settings .owner-redirects > span { color:var(--text-muted); font-size:11px; margin-right:auto; }
#panel-settings .all-settings-empty {
  display:grid; place-items:center; min-height:220px; color:var(--text-muted);
}
#projectSettingsModal { display:none !important; }
html[data-theme^="glass"] #panel-settings {
  --k3-bg-1: rgba(var(--glass-tint-rgb), var(--glass-alpha));
  --k3-bg-2: rgba(var(--glass-tint-rgb), var(--glass-alpha));
  --k3-surface-0: rgba(var(--glass-tint-rgb), var(--glass-alpha));
  --k3-surface-1: rgba(var(--glass-tint-rgb), var(--glass-alpha));
  --k3-surface-2: rgba(var(--glass-tint-rgb), var(--glass-alpha));
  --k3-surface-3: rgba(var(--glass-tint-rgb), var(--glass-alpha));
}
html[data-theme^="retro"] #panel-settings {
  --k3-radius-xl:0px; --k3-radius-lg:0px; --k3-radius-md:0px; --k3-radius-sm:0px;
  --k3-dur-fast:70ms; --k3-dur-med:100ms; --k3-dur-slow:140ms;
  font-family:var(--mono-font);
}
html[data-theme^="retro"] #panel-settings :is(button,.btn,.panel-card,.stat-card,.setting-row,.popover,.dialog,.drawer) {
  border-radius:0 !important; box-shadow:2px 2px 0 var(--border);
}
html[data-theme^="retro"] #panel-settings :is(.page-enter,.manager-body,.section-block.is-revealed) {
  animation-timing-function:steps(3,end) !important;
}
@media (prefers-reduced-motion: reduce) {
  #panel-settings *, #panel-settings *::before, #panel-settings *::after {
    animation-duration:.01ms !important; animation-iteration-count:1 !important; transition-duration:.01ms !important;
  }
}
@container settings-host (max-width: 760px) {
  #panel-settings .all-settings-facets { grid-template-columns:1fr 1fr; }
  #panel-settings .all-settings-window .setting-row {
    min-height:140px; height:auto; grid-template-columns:minmax(0,1fr) auto;
  }
  #panel-settings .all-settings-window .setting-control {
    grid-column:1 / -1; justify-content:flex-start;
  }
}
@container settings-host (max-width: 420px) {
  #panel-settings .all-settings-facets { grid-template-columns:1fr; }
  #panel-settings .settings-doc-header,
  #panel-settings .settings-section { padding-left:10px; padding-right:10px; }
  #panel-settings .section-heading-row { flex-direction:column; gap:8px; }
  #panel-settings .setting-row,
  #panel-settings .all-settings-window .setting-row {
    grid-template-columns:minmax(0,1fr); min-height:0; padding:10px; gap:8px;
  }
  #panel-settings .setting-copy { padding-right:0; }
  #panel-settings .setting-control {
    grid-column:1; width:100%; min-width:0; justify-content:flex-start;
  }
  #panel-settings .details-btn {
    position:static; grid-column:1; width:auto; min-width:0; justify-self:start; padding:0 8px;
  }
  #panel-settings .select-control,
  #panel-settings .text-control,
  #panel-settings .slider-control,
  #panel-settings .path-control { width:100%; min-width:0; max-width:100%; }
}
'''
    combined = "/* %s */\n" % TRANSFORM_MARKER + css + overrides
    need("color-scheme: var(--pm-settings-color-scheme, dark);" in combined, "T44 CSS: K3 UA color-scheme bridge missing")
    for theme in ("friendly-light", "friendly-dark", "glass-light", "glass-dark", "retro-light", "retro-dark", "basic-light", "basic-dark"):
        need('data-theme="%s"' % theme in combined, "T44 CSS: UA color-scheme variant missing %s" % theme)
    need("@container settings-host (max-width: 760px)" in combined and "@container settings-host (max-width: 420px)" in combined, "T44 CSS: All Settings responsive facets missing")
    return combined


THEME_ROWS = r'''        setting('general.visual.theme', 'Theme', 'Choose the Puppet Master theme for this project.', 'select', 'Basic Dark', details(
          'Changes the application palette, surfaces, contrast, syntax colors, charts, and chrome as one coordinated eight-theme system.',
          'Each project keeps its own theme. A window with no project uses ephemeral Basic Dark and does not write Settings.',
          'Basic Dark is the untouched fresh-project factory seed; explicit saved selections win, and copied projects receive a detached snapshot that diverges independently.',
          'This project.',
          ['Glass background', 'Glass transparency', 'Interface density']
        ), { options: ['Friendly Dark', 'Friendly Light', 'Glass Dark', 'Glass Light', 'Retro Dark', 'Retro Light', 'Basic Dark', 'Basic Light'] }),
        setting('general.visual.glass-background-mode', 'Glass background', 'Choose the portable background treatment used by Glass themes.', 'select', 'Mesh', details(
          'Selects Mesh, Depth, or Minimal behind the shared Glass palette without relying on browser blur or SVG filters.',
          'The same setting maps to precomputed Slint-safe paint assets in the native implementation.',
          'Use Minimal on lower-power hosts and Depth when spatial separation is useful.',
          'This project.', ['Theme', 'Glass transparency']), { options: ['Mesh', 'Depth', 'Minimal'] }),
        setting('general.visual.glass-transparency', 'Glass transparency', 'Adjust readable surface opacity for Glass themes.', 'stepper', 0.55, details(
          'Changes the project Glass surface alpha while enforcing the PM readability floor.',
          'A bounded control avoids fully transparent panels and keeps light and dark text legible.',
          '55% is the fresh-project default; choose a higher value when the background is visually busy.',
          'This project; visible only as paint when a Glass theme is active.', ['Theme', 'Glass background']), { min: 0.35, max: 1.0, step: 0.01, unit: '%' }),
'''


COPY_HELPERS_TEMPLATE = r'''  const TRANSFER_CATEGORY_SETTING_IDS=__TRANSFER_CATEGORY_SETTING_IDS__;
  const TRANSFER_CREDENTIAL_IDS=new Set(['ai.accounts.anthropic-api-key','ai.accounts.openai-api-key','ai.accounts.gemini-api-key','ai.accounts.cursor-api-key','ai.accounts.minimax-api-key','ai.accounts.github-token','ai.accounts.opencode-server-auth','code.execution.dockerhub-token','web.providers.firecrawl-api-key','web.fetch.proxy-credentials','system.mcp.remote-headers']);
  function transferSelection(categories){
    const names=Array.isArray(categories)?categories.map(value=>String(value).trim()).filter(Boolean):[];
    if(!names.length)return {ok:false,reason:'Choose at least one Settings transfer category.'};
    const unknown=[...new Set(names.filter(name=>!Object.prototype.hasOwnProperty.call(TRANSFER_CATEGORY_SETTING_IDS,name)))];
    if(unknown.length)return {ok:false,reason:'Unknown Settings transfer categories: '+unknown.join(', ')};
    const ids=new Set();for(const name of names)for(const id of TRANSFER_CATEGORY_SETTING_IDS[name])ids.add(id);
    if(!ids.size)return {ok:false,reason:'The selected transfer categories contain no canonical Settings IDs.'};
    return {ok:true,names:[...new Set(names)],ids};
  }
  function transferCategoryForId(id){
    for(const [name,ids] of Object.entries(TRANSFER_CATEGORY_SETTING_IDS))if(ids.includes(id))return name;
    return null;
  }
  function stableValue(value){
    if(Array.isArray(value))return value.map(stableValue);
    if(value&&typeof value==='object'){const out={};for(const key of Object.keys(value).sort())out[key]=stableValue(value[key]);return out;}
    return value;
  }
  function equalSettingValue(a,b){return JSON.stringify(stableValue(a))===JSON.stringify(stableValue(b));}
  function transferPreviewValue(value){
    const text=typeof value==='string'?value:JSON.stringify(stableValue(value));
    return (text==null?'—':text).slice(0,140);
  }
  function settingsCopyPreviewPage(prepared,page=0){
    const size=40,total=prepared.changes.length,pages=Math.max(1,Math.ceil(total/size)),safePage=Math.max(0,Math.min(pages-1,page)),start=safePage*size,end=Math.min(total,start+size);
    const rerender=next=>{const holder=portalRoot().querySelector('[data-settings-copy-preview]');if(holder)holder.innerHTML=settingsCopyPreviewPage(prepared,next);};
    return `<div class="all-settings-summary"><span>${total?`${start+1}–${end} of ${total}`:'No changed values'}</span><span>Page ${safePage+1} of ${pages}</span></div><div class="workflow-list">${prepared.changes.slice(start,end).map((row,i)=>workflowStep(start+i+1,row.label,`${row.id} · ${transferPreviewValue(row.destinationValue)} → ${transferPreviewValue(row.sourceValue)}`,row.decision,'open-transfer-category',{category:row.category,id:row.id})).join('')}</div><div class="table-actions"><button class="btn" ${safePage===0?'disabled':''} data-callback="${registerAction(()=>rerender(safePage-1))}">Previous changed values</button><button class="btn" ${safePage>=pages-1?'disabled':''} data-callback="${registerAction(()=>rerender(safePage+1))}">Next changed values</button></div>`;
  }
  function settingsCopySources(){
    const current=window.PM7_SETTINGS_TOME.project()?.id,rows=[],seen=new Set();
    const add=(id,label)=>{if(typeof id!=='string'||!id||id===current||seen.has(id))return;const snapshot=window.PM7_SETTINGS_TOME.projectSnapshot(id);if(!snapshot?.settings)return;seen.add(id);rows.push({value:id,label:String(label||id)});};
    for(const row of Array.isArray(window.PM_SETTINGS_PROJECT_CATALOG)?window.PM_SETTINGS_PROJECT_CATALOG:[])if(row)add(row.id,row.label);
    for(const id of Object.keys(window.PM_SETTINGS_PROJECT_SNAPSHOTS||{}))add(id,window.PM_SETTINGS_PROJECT_SNAPSHOTS[id]?.label||id);
    try{for(let index=0;index<localStorage.length;index++){const key=localStorage.key(index)||'';if(!key.startsWith('pm7:settings:tome-tabs:v1:'))continue;const id=decodeURIComponent(key.slice('pm7:settings:tome-tabs:v1:'.length));add(id,id);}}catch(_e){}
    return rows.sort((a,b)=>a.label.localeCompare(b.label));
  }
  function settingsTransferProvenanceHtml(){
    const source=state.settingsSourceSnapshot;
    if(!source)return infoRow('Source','Fresh-project defaults · detached')+infoRow('Destination',projectDisplayName())+infoRow('Inheritance','None; project diverges independently')+infoRow('Receipt','No copy receipt')+infoRow('Credential material','Secure owner only')+infoRow('Currentness',state.settingsProjectionSource||'Default fixture');
    return infoRow('Source project ID',source.source_project_id)+infoRow('Destination project ID',source.destination_project_id)+infoRow('Copied',String(source.copied_setting_ids?.length||0)+' canonical values')+infoRow('Inheritance','Detached; no live link')+infoRow('Receipt',source.receipt_id||'Not supplied')+infoRow('Projection',source.fixture_mode?'Concept fixture transaction':'Settings owner receipt');
  }
  function prepareDetachedSettingsCopy(sourceProjectId,categories,options={}){
    const destination=window.PM7_SETTINGS_TOME.project();
    if(!destination)return {ok:false,reason:'Select or create the destination project before copying Settings.'};
    if(state.settingsProjectionReadOnly===true)return {ok:false,reason:'The attached Settings owner has not supplied a current readable destination projection.'};
    if(!sourceProjectId||sourceProjectId===destination.id)return {ok:false,reason:'Choose a different readable source project by stable project ID.'};
    const selection=transferSelection(categories);if(!selection.ok)return selection;
    const snapshot=window.PM7_SETTINGS_TOME.projectSnapshot(sourceProjectId);
    if(!snapshot?.settings)return {ok:false,reason:'The selected project has no readable Settings snapshot.'};
    const canonicalRows=Object.values(window.PM12_REFERENCE?.byCat||{}).flatMap(cat=>cat.settings||[]),canonical=new Map(canonicalRows.map(row=>[row.id,row]));
    const conflicts=String(options.conflicts||'Preview every changed value'),copied={},changes=[];
    for(const [id,sourceValue] of Object.entries(snapshot.settings)){
      const row=canonical.get(id);if(!row||!selection.ids.has(id)||TRANSFER_CREDENTIAL_IDS.has(id)||row.credential_ref_only)continue;
      const found=findSettingGlobal(id),destinationValue=found?settingValue(found.setting):state.settings[id];
      if(equalSettingValue(sourceValue,destinationValue))continue;
      const conflict=true,keep=conflicts==='Keep destination on conflicts';
      changes.push({id,label:row.label||id,category:transferCategoryForId(id),sourceValue:clone(sourceValue),destinationValue:clone(destinationValue),decision:keep?'Keep destination':'Use source',changed:!keep});
      if(!keep)copied[id]=clone(sourceValue);
    }
    const copyAccountReferences=String(options.credentials||'Keep existing destination credential ownership')==='Reference compatible saved accounts'&&selection.names.includes('AI providers & accounts');
    if(!changes.length&&!copyAccountReferences)return {ok:false,reason:'No canonical transferable values differ for the selected categories and policy.'};
    return {ok:true,sourceProjectId,destination,selection,snapshot,copied,changes,copyAccountReferences,conflicts,credentialPolicy:String(options.credentials||'Keep existing destination credential ownership')};
  }
  function applyDetachedSettingsCopy(sourceProjectId,categories,options={}){
    const prepared=prepareDetachedSettingsCopy(sourceProjectId,categories,options);if(!prepared.ok)return prepared;
    if(!Object.keys(prepared.copied).length&&!prepared.copyAccountReferences)return {ok:false,reason:'Every changed value is configured to keep the destination.'};
    const registry=window.PM_SETTINGS_REGISTRY,batch=registry&&registry.applyDetachedProjectCopy,receiptId=uid('settings-copy'),createRollback=options.rollback!==false;
    const prior={settings:clone(state.settings),changed:clone(state.changed)};
    let ownerResult=null,applied=registry?null:prepared.copied,fixtureMode=!registry;
    if(registry){
      if(typeof batch!=='function')return {ok:false,reason:'The Settings owner does not expose the required atomic detached-copy transaction.'};
      ownerResult=batch({source_project_id:sourceProjectId,destination_project_id:prepared.destination.id,setting_values:clone(prepared.copied),copy_account_references:prepared.copyAccountReferences,conflict_behavior:prepared.conflicts,credential_policy:prepared.credentialPolicy,create_rollback:createRollback,inheritance:'detached'});
      if(ownerResult&&typeof ownerResult.then==='function')return {ok:false,reason:'The Settings owner must return an accepted transaction receipt before this concept updates its projection.'};
      if(!ownerResult||ownerResult.ok===false)return {ok:false,reason:ownerResult?.safe_user_message||ownerResult?.reason||'The Settings owner rejected the detached copy.'};
      if(typeof ownerResult.receipt_id!=='string'||!ownerResult.receipt_id.trim())return {ok:false,reason:'The Settings owner did not return a durable detached-copy receipt ID.'};
      if(!ownerResult.applied_values||typeof ownerResult.applied_values!=='object'||Array.isArray(ownerResult.applied_values))return {ok:false,reason:'The Settings owner did not return the exact applied values.'};
      if(createRollback&&(typeof ownerResult.rollback_ref!=='string'||!ownerResult.rollback_ref.trim()))return {ok:false,reason:'The Settings owner did not return the requested rollback reference.'};
      applied=ownerResult.applied_values;
    }else if(prepared.copyAccountReferences)return {ok:false,reason:'Compatible account references require the Settings owner; fixture fallback never copies credentials or account references.'};
    const appliedEntries=Object.entries(applied||{});
    const invalid=appliedEntries.filter(([id])=>!Object.prototype.hasOwnProperty.call(prepared.copied,id)||!prepared.selection.ids.has(id)||TRANSFER_CREDENTIAL_IDS.has(id)||!window.PM12_REFERENCE?.byCat?.[id.split('.')[0]]?.settings?.some(row=>row.id===id));
    if(invalid.length)return {ok:false,reason:'The Settings owner returned values outside the validated detached-copy set.'};
    for(const [id,value] of appliedEntries){state.settings[id]=clone(value);state.changed[id]=true;}
    state.settingsTransferRollbacks=state.settingsTransferRollbacks||{};
    if(fixtureMode&&createRollback)state.settingsTransferRollbacks[receiptId]=prior;
    const durableReceiptId=fixtureMode?receiptId:ownerResult.receipt_id,rollbackRef=fixtureMode?(createRollback?receiptId:null):ownerResult.rollback_ref||null,copiedIds=appliedEntries.map(([id])=>id);
    state.settingsSourceSnapshot={source_project_id:sourceProjectId,destination_project_id:prepared.destination.id,copied_setting_ids:copiedIds,copied_at:new Date().toISOString(),inheritance:'detached',receipt_id:durableReceiptId,rollback_ref:rollbackRef,fixture_mode:fixtureMode,account_reference_count:Number(ownerResult?.account_reference_count||0)};
    saveState();window.PM7_SETTINGS_TOME.applyPaint(state);return {ok:true,count:copiedIds.length,accountReferenceCount:Number(ownerResult?.account_reference_count||0),receiptId:durableReceiptId,rollbackRef,fixtureMode};
  }
'''


def _adapt_data(source, need):
    old_details = """  const details = (what, why, example, applies, related = [], notes = '') => ({\n    what, why, example, applies, related, notes\n  });"""
    new_details = """  const details = (what, why, example, applies, related = [], notes = '') => ({\n    what, why, example, applies: 'This project. Values are stored with the project; a no-project window is ephemeral.', related, notes\n  });"""
    source = _replace_once(source, old_details, new_details, need, "project-scoped detail grammar")
    source = _replace_band(
        source,
        "        setting('theme', 'Theme'",
        "        setting('accent', 'Accent color'",
        THEME_ROWS,
        need,
        "eight-theme and glass rows",
    )
    source = _replace_once(
        source,
        "setting('density', 'Interface density'",
        "setting('general.visual.interface-density', 'Interface density'",
        need,
        "canonical interface density id",
    )
    source = _replace_once(
        source,
        "setting('sidebar-order', 'Sidebar icon order'",
        "setting('general.interaction.activity-bar-order', 'Sidebar icon order'",
        need,
        "canonical activity bar order id",
    )
    inheritance = "      setting('inheritance', 'Settings inheritance', 'Choose how this project receives future application-default changes.', 'segmented', 'Copy then diverge', details('Controls whether project values stay linked, inherit only untouched defaults, or remain a fixed copy.','Copy then diverge makes project customization predictable and prevents surprise changes.','A newly added default can still appear, while an edited project value remains independent.','Per project.',['Copy settings from project','Reset category']), { options: ['Follow defaults', 'Copy then diverge', 'Fully independent'] }),"
    detached = "      setting('settings-source-snapshot', 'Settings source snapshot', 'Review where this project received its initial detached settings copy.', 'resource', 'Independent project snapshot', details('Records the fresh-project defaults or copied-project source without creating a live inheritance link.','Projects remain reproducible and do not change when another project changes later.','Copy from Settings Lab, preview the diff, then let both projects diverge independently.','This project.',['Copy settings from project','Reset category'])),"
    source = _replace_once(source, inheritance, detached, need, "remove continuous project inheritance")
    source = source.replace("defaults, and inheritance.", "defaults, and detached settings source.")
    source = _replace_once(
        source,
        "(row.legacyScope || []).join(', '),",
        "'This project',",
        need,
        "canonical inventory project scope projection",
    )
    source = _replace_once(
        source,
        "{ id: 'source-manager', label: 'Source Control Manager', type: 'sourceControl' }",
        "{ id: 'source-manager', label: 'Source Control Manager', type: 'sourceControl' },\n      { id: 'browser-scm', label: 'Browser & SCM', type: 'browserScm' }",
        need,
        "browser and SCM workspace",
    )
    source = _replace_once(
        source,
        "{ id: 'doctor', label: 'Doctor', type: 'doctor' },",
        "{ id: 'doctor', label: 'Readiness & Setup', type: 'doctor' },",
        need,
        "Doctor dependency projection label",
    )
    source = _replace_once(
        source,
        "{ id: 'project-settings', label: 'All Project Settings', type: 'settings', sections: projectSettingsSections },",
        "{ id: 'project-settings', label: 'All Project Settings', type: 'settings', sections: projectSettingsSections, virtualAllSettings: true },",
        need,
        "virtualized All Project Settings workspace",
    )
    source = _replace_once(source, "  const normalizeLabel = (label) => String(label || '').trim().toLowerCase();\n  const labelsOf = (sections) => {\n    const labels = new Set();\n    for (const section of sections || []) for (const s of section.settings || []) labels.add(normalizeLabel(s.label));\n    return labels;\n  };", "  const idsOf = (sections) => {\n    const ids = new Set();\n    for (const section of sections || []) for (const s of section.settings || []) ids.add(s.id);\n    return ids;\n  };", need, "canonical id dedupe helper")
    source = _replace_once(source, "      case 'number': case 'slider': return 'stepper';\n      case 'action': return 'action';\n      case 'multiselect': return Array.isArray(row.options) && row.options.length ? 'multiselect' : 'textarea';\n      case 'text': case 'path': case 'list': case 'keyvalue': return 'textarea';", "      case 'number': return Number.isFinite(Number.parseFloat(row.default))?'number':'number-inherited';\n      case 'slider': { const range=(row.options||[]).map(String).find(value=>/^[-+]?\\d*\\.?\\d+\\s*-\\s*[-+]?\\d*\\.?\\d+%?$/.test(value)); if(range&&Number.isFinite(Number.parseFloat(row.default)))return 'slider'; return Number.isFinite(Number.parseFloat(row.default))?'number':'slider-inherited'; }\n      case 'action': return 'action';\n      case 'multiselect': return Array.isArray(row.options) && row.options.length ? 'multiselect' : 'list';\n      case 'text': return row.credential_ref_only ? 'credential' : 'text';\n      case 'path': return 'path';\n      case 'list': return 'list';\n      case 'keyvalue': return row.credential_ref_only ? 'credential' : 'keyvalue';", need, "safe typed canonical control mapping")
    source = _replace_once(
        source,
        "  const refUnitFromLabel = (label) => {",
        "  const refRangeFor = (row) => { const source=(row.options||[]).map(String).find(value=>/^[-+]?\\d*\\.?\\d+\\s*-\\s*[-+]?\\d*\\.?\\d+%?$/.test(value)); if(!source)return null;const match=/^([-+]?\\d*\\.?\\d+)\\s*-\\s*([-+]?\\d*\\.?\\d+)(%?)$/.exec(source);return match?{min:Number(match[1]),max:Number(match[2]),step:(Number(match[2])-Number(match[1]))<=2?.01:1,unit:match[3]||undefined}:null; };\n  const refUnitFromLabel = (label) => {",
        need,
        "canonical slider range parser",
    )
    source = _replace_once(source, "      case 'stepper': { const n = Number(d); return Number.isFinite(n) ? n : 0; }", "      case 'number': case 'number-inherited': case 'slider': case 'slider-inherited': return d;", need, "typed canonical scalar defaults")
    source = _replace_once(source, "      case 'multiselect': return Array.isArray(d) ? d : [];\n      case 'action': return row.label;\n      default: return typeof d === 'string' ? d : (d == null ? '' : JSON.stringify(d));", "      case 'multiselect': case 'list': return Array.isArray(d) ? d.slice() : [];\n      case 'keyvalue': return d && typeof d === 'object' && !Array.isArray(d) ? {...d} : {};\n      case 'action': return row.label;\n      default: return typeof d === 'string' ? d : (d == null ? '' : JSON.stringify(d));", need, "structured canonical defaults")
    source = _replace_once(source, "      general: labelsOf(appInputSections),\n      code: labelsOf(editorRuntimeSections),\n      system: labelsOf(advancedSections)", "      general: idsOf(appInputSections),\n      code: idsOf(editorRuntimeSections),\n      system: idsOf(advancedSections)", need, "canonical authored id census")
    source = source.replace("const seenLabels = seenByDomain[placement.domain] || (seenByDomain[placement.domain] = new Set());", "const seenIds = seenByDomain[placement.domain] || (seenByDomain[placement.domain] = new Set());")
    source = source.replace("if (seenLabels.has(normalizeLabel(row.label))) { skipped.push(row.id); return null; }\n            seenLabels.add(normalizeLabel(row.label));", "if (seenIds.has(row.id)) { skipped.push(row.id); return null; }\n            seenIds.add(row.id);")
    source = _replace_once(
        source,
        "const extra = { searchTerms: Array.isArray(row.search) ? row.search.slice() : [] };",
        "const range=refRangeFor(row); const extra = { searchTerms: Array.isArray(row.search) ? row.search.slice() : [], tier: row.tier || 'simple', curated: row.curated === true, category: row.cat, subgroup: row.sub, canonicalType: row.type, applicabilityMetadata: Array.isArray(row.scope) ? row.scope.slice() : [], ownerStatus: row.status && row.status.state ? String(row.status.state) : 'ok', resultType: 'ordinary-setting', sourceOwner: row.src || 'settings_inventory', credentialRefOnly: row.credential_ref_only === true, ...(range||{}) };",
        need,
        "canonical setting facet metadata",
    )
    source = _replace_once(source, "            if (control === 'stepper') { const unit = refUnitFromLabel(row.label); if (unit) extra.unit = unit; }", "            if (control === 'number' && !extra.unit) { const unit = refUnitFromLabel(row.label); if (unit) extra.unit = unit; }", need, "typed numeric unit projection")
    need("Follow defaults" not in source, "T44 data: continuous inheritance option survived")
    return source


SERVER_RENDER = r'''  function renderServers(){
    const tabs=[['claim','Claim & Bootstrap'],['hosts','Hosts & Environments'],['clients','Clients & Continuity'],['deploy','Deployment'],['backup','Full Server Backup'],['diagnostics','Diagnostics']].map(([id,label])=>({id,label}));
    if(!state.serverTab)state.serverTab='claim';
    return `<div class="manager-page page-enter">${pageHeader('network','Server Claim, Bootstrap & Continuity','Claim or bootstrap through exact owner identities. Until a server projection is attached, every identity and status below is explicitly a concept fixture.',`<button class="btn" data-action="server-tab" data-tab="diagnostics">${icon('test')} Diagnostics</button><button class="btn primary" data-action="open-server-claim">${icon('plus')} Claim server</button>`)}${managerTabs(tabs,state.serverTab,'server-tab')}<div class="manager-body"><div class="manager-scroll">${renderServerTab()}</div></div></div>`;
  }
  function renderServerTab(){
    const P=state.projectSync;
    if(state.serverTab==='hosts')return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Hosts and environments · concept fixture</div><div class="panel-subtitle">Installation, readiness, trust, and topology never transfer between host/environment pairs by label. These example rows are not owner evidence.</div></div><button class="btn primary" data-action="add-server-host">${icon('plus')} Add host</button></div><table class="data-table"><thead><tr><th>Host</th><th>Environment</th><th>Role</th><th>Projection</th><th></th></tr></thead><tbody><tr><td>Example · Home TrueNAS</td><td>Linux container · server</td><td>Authoritative server</td><td>${renderStatus('attention','Fixture only')}</td><td><button class="btn small" data-action="edit-server-host" data-id="truenas">Edit</button><button class="btn small" data-action="verify-server-host" data-id="truenas">Verify</button></td></tr><tr><td>Example · Windows Workstation</td><td>WSL2 · Ubuntu</td><td>Execution host</td><td>${renderStatus('attention','Fixture only')}</td><td><button class="btn small" data-action="edit-server-host" data-id="windows-wsl">Edit</button><button class="btn small" data-action="verify-server-host" data-id="windows-wsl">Verify</button></td></tr><tr><td>Example · MacBook Air</td><td>Native macOS</td><td>Client + execution</td><td>${renderStatus('attention','Fixture only')}</td><td><button class="btn small" data-action="edit-server-host" data-id="mac">Edit</button><button class="btn small" data-action="verify-server-host" data-id="mac">Verify</button></td></tr></tbody></table></section>`;
    if(state.serverTab==='clients')return `<div class="card-grid two"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Clients · concept fixture</div><div class="panel-subtitle">Compatibility, role, freshness, and continuity eligibility require an owner projection.</div></div><button class="btn" data-action="navigate" data-domain="projects" data-workspace="project-sync">Open project clients</button></div><div class="workflow-list">${P.clients.map((c,i)=>workflowStep(i+1,`Example · ${c.name}`,`${c.platform} · ${c.role} · ${c.lastSync}`,'Fixture','open-project-client',{id:c.id})).join('')}</div></section><section class="panel-card"><div class="panel-title">Continuity projection</div><div class="info-grid">${Object.entries(P.continuity).map(([k,v])=>infoRow(humanize(k),v?'Fixture: eligible':'Fixture: not eligible')).join('')}${infoRow('Authority','Project Sync owner')}${infoRow('Currentness','Owner feed not attached')}</div><button class="btn primary" style="margin-top:12px" data-action="navigate" data-domain="projects" data-workspace="project-sync">Configure continuity</button></section></div>`;
    if(state.serverTab==='deploy')return `<div class="card-grid two"><section class="panel-card"><div class="panel-title">Server deployment</div><p class="section-description">Signed source, exact target Host/Environment, topology generation, migration preview, rollback point, and post-deploy verification.</p><button class="btn primary" data-action="open-server-bootstrap">Configure bootstrap or deployment</button></section><section class="panel-card"><div class="panel-title">Installation ownership</div><div class="info-grid">${infoRow('Application install','Shared Integration Runtime')}${infoRow('Project and Vault sync','Project Sync owner')}${infoRow('Credentials','OS credential store')}${infoRow('Server authority','Claim/bootstrap receipt')}</div></section></div>`;
    if(state.serverTab==='backup')return `<div class="card-grid two"><section class="panel-card"><div class="panel-title">Full Server backup</div><p class="section-description">Protect server configuration, databases, Project and Vault metadata, histories, receipts, and owner indexes while excluding raw credentials and disposable caches.</p><button class="btn primary" data-action="navigate" data-domain="system" data-workspace="backup">Open Full Server Backup</button></section><section class="panel-card"><div class="info-grid">${infoRow('Server configuration','Included by policy')}${infoRow('Databases and indexes','Included by policy')}${infoRow('Projects and Vault metadata','Included by policy')}${infoRow('Credential material','Excluded; secure references only')}${infoRow('Fixture receipt example',state.backup.history[0]?.receipt||'None')}${infoRow('Owner verification','Not attached')}</div></section></div>`;
    if(state.serverTab==='diagnostics')return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Server topology diagnostics</div><div class="panel-subtitle">Read-only fixture routes; operational Doctor UI and owner evidence remain outside this Settings port.</div></div><button class="btn primary" data-action="verify-server-host" data-id="topology">Preview verification</button></div><div class="workflow-list">${workflowStep(1,'Claim receipt','Server identity and ownership','Fixture','open-server-check',{id:'claim'})}${workflowStep(2,'Host and environment proofs','Native, WSL, container, SSH kept distinct','Fixture','open-server-check',{id:'hosts'})}${workflowStep(3,'Project and Vault authority',P.location,'Fixture','open-server-check',{id:'authority'})}${workflowStep(4,'Clients and continuity',`${P.clients.length} fixture clients`,'Fixture','open-server-check',{id:'clients'})}${workflowStep(5,'Backup and recovery',state.backup.history[0]?.receipt||'No fixture receipt','Fixture','open-server-check',{id:'backup'})}</div></section>`;
    return `<div class="card-grid two"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Claim existing server · concept fixture</div><div class="panel-subtitle">Bind a discovered server only after exact owner identity, proof, trust, and topology generation.</div></div><button class="btn primary" data-action="open-server-claim">Preview claim</button></div><div class="info-grid">${infoRow('Candidate example','Home TrueNAS')}${infoRow('Host example','truenas.home')}${infoRow('Environment example','Linux container · server')}${infoRow('Project authority example',P.location)}${infoRow('Trust','Not owner-verified')}${infoRow('Claim status','Not claimed by this fixture')}</div></section><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Bootstrap new server</div><div class="panel-subtitle">Preview official source, target host/environment, storage, migration, sync, clients, rollback, and verification before consent.</div></div><button class="btn" data-action="open-server-bootstrap">Preview bootstrap</button></div><div class="alert-strip info">${icon('info')}<div>Visibility never counts as install consent. Nothing downloads or mutates in this concept fixture.</div></div></section></div>`;
  }
'''


DOCTOR_RENDER = r'''  function renderDoctor(){
    return `<div class="manager-page page-enter">${pageHeader('test','Readiness & Setup','Settings shows the dependency shape and routes to each owner. No Onboarding or Doctor owner feed is attached to this concept fixture.')}<div class="manager-body"><div class="manager-scroll"><div class="card-grid three"><article class="stat-card"><div class="stat-label">Setup state</div><div class="stat-value" style="font-size:13px">Fixture only</div><div class="stat-note">No readiness claim</div></article><article class="stat-card"><div class="stat-label">Projection freshness</div><div class="stat-value" style="font-size:13px">Not attached</div><div class="stat-note">Owner currentness required</div></article><article class="stat-card"><div class="stat-label">Limited mode</div><div class="stat-value" style="font-size:13px">Owner-defined</div><div class="stat-note">Route remains visible</div></article></div><section class="panel-card" style="margin-top:10px"><div class="panel-title">Setup dependencies · concept fixture</div><div class="workflow-list">${workflowStep(1,'Providers and exact routes','Installation, authentication, entitlement, catalog, invocation','Fixture','navigate',{domain:'ai',workspace:'providers'})}${workflowStep(2,'Source control and SSH','Tools, forge accounts, repositories, remotes','Fixture','navigate',{domain:'source',workspace:'source-manager'})}${workflowStep(3,'Server claim and bootstrap','Host, Environment, authority, clients, continuity','Fixture','navigate',{domain:'system',workspace:'servers'})}${workflowStep(4,'Full Server backup','Destination, scope, receipt, restore rehearsal','Fixture','navigate',{domain:'system',workspace:'backup'})}${workflowStep(5,'Project location and sync','Authority, clients, move/copy, conflicts, rollback','Fixture','navigate',{domain:'projects',workspace:'project-sync'})}</div></section><div class="alert-strip info" style="margin-top:10px">${icon('info')}<div>Repairs run in the owning manager and require fresh currentness, permission, preview, and a receipt. Settings does not simulate a successful Doctor run.</div></div></div></div></div>`;
  }
'''


BROWSER_SCM_RENDER = r'''  function renderBrowserScm(){
    return `<div class="manager-page page-enter">${pageHeader('browser','Browser & SCM','Configure PM-native browser boundaries and inspect source-control hand-offs without turning Settings into a live browser, terminal, or Doctor surface.')}<div class="manager-body"><div class="manager-scroll"><div class="card-grid two"><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Browser Runtime Service</div><div class="panel-subtitle">PM-native browser identity, requested/effective disclosure, agent sharing, captures, and bounded code evaluation.</div></div><button class="btn primary" data-action="navigate" data-domain="ai" data-workspace="web">Open web routes</button></div><div class="info-grid">${infoRow('Runtime','PM-native CEF')}${infoRow('Tab cap','32')}${infoRow('Warning threshold','24')}${infoRow('Agent sharing','Explicit and revocable')}${infoRow('Captures','Durable artifact refs')}${infoRow('Ordinary clicks','Never silently injected')}</div></section><section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">Auth Browser</div><div class="panel-subtitle">Protected sign-in lane for provider and forge authentication.</div></div></div><div class="info-grid">${infoRow('Persistence','Ephemeral')}${infoRow('Capture','Disabled')}${infoRow('Automation','Disabled')}${infoRow('Export and restore','Disabled')}${infoRow('Credential custody','Provider or OS credential store')}${infoRow('Playwright Settings','Not present')}</div></section></div><section class="panel-card" style="margin-top:10px"><div class="panel-title-row"><div><div class="panel-title">SCM hand-off</div><div class="panel-subtitle">Repositories, worktrees, hosted forges, GitHub API operations, SSH remotes, policy, recovery, and CI remain in their owners.</div></div><button class="btn primary" data-action="navigate" data-domain="source" data-workspace="source-manager">Open Source Control Manager</button></div><div class="info-grid">${infoRow('GitHub HTTPS operations','GitHub API tool')}${infoRow('Git and Jujutsu','Per Host/Environment')}${infoRow('Remote projects','Project Location & Sync')}${infoRow('SSH CRUD','Add, edit, test, disable, remove')}${infoRow('Requested/effective state','Visible')}${infoRow('Stale state','Mutation disabled until revalidation')}</div></section></div></div></div>`;
  }
'''


ALL_SETTINGS_RENDER = r'''  const allSettingsView={query:'',category:'all',exposure:'all',control:'all',applicability:'all',ownerStatus:'all',resultType:'all',scrollTop:0,start:-1,end:-1,generation:0,activeSettingId:null,heights:new Map()};
  let allSettingsCatalogCache=null;
  let allSettingsResizeObserver=null;
  let allSettingsQueryTimer=0;
  function fuzzyTokenScore(token,term){
    if(token===term)return 40;
    if(token.startsWith(term))return 32-Math.min(8,token.length-term.length);
    const exact=token.indexOf(term);if(exact>=0)return 24-Math.min(8,exact);
    if(term.length<3||term.length/token.length<.38)return 0;
    let ti=0,gaps=0,last=-1,maxGap=0;
    for(let i=0;i<token.length&&ti<term.length;i++)if(token[i]===term[ti]){if(last>=0){const gap=i-last-1;gaps+=gap;maxGap=Math.max(maxGap,gap);}last=i;ti++;}
    if(ti!==term.length||maxGap>2||gaps>Math.max(2,Math.floor(term.length*.55)))return 0;
    return Math.max(8,20-gaps*2-(token.length-term.length));
  }
  function fuzzySubsequenceScore(text,term){
    text=String(text||'').toLowerCase();term=String(term||'').toLowerCase().trim();
    if(!term)return 1;
    if(text===term)return 48;
    const phrase=text.indexOf(term);if(phrase>=0)return 34-Math.min(10,phrase/12);
    const tokens=text.split(/[^a-z0-9]+/).filter(Boolean);
    let best=0;for(const token of tokens)best=Math.max(best,fuzzyTokenScore(token,term));
    return best;
  }
  function allSettingsCatalog(){
    if(allSettingsCatalogCache)return allSettingsCatalogCache;
    const rows=[],seen=new Set(),canonicalRows=Object.values(window.PM12_REFERENCE?.byCat||{}).flatMap(category=>category.settings||[]),canonicalById=new Map(canonicalRows.map(setting=>[setting.id,setting])),canonicalIds=new Set(canonicalById.keys());
    for(const domain of D.domains)for(const workspace of domain.workspaces){
      if(workspace.type!=='settings')continue;
      for(const section of workspace.sections||[])for(const setting of section.settings||[]){
        if(!canonicalIds.has(setting.id)||seen.has(setting.id))continue;seen.add(setting.id);
        const canonical=canonicalById.get(setting.id)||{},category=canonical.cat||setting.category||setting.id.split('.')[0]||domain.id,exposure=canonical.tier||setting.tier||'simple',control=canonical.type||setting.canonicalType||setting.control||'text';
        const applicability=(Array.isArray(canonical.scope)&&canonical.scope.length?canonical.scope:Array.isArray(setting.applicabilityMetadata)&&setting.applicabilityMetadata.length?setting.applicabilityMetadata:['project']).map(value=>String(value).toLowerCase());
        const ownerStatus=String(canonical.status?.state||setting.ownerStatus||'ok').toLowerCase(),resultType=String(setting.resultType||'ordinary-setting').toLowerCase();
        const destination={domain_id:domain.id,domain_label:domain.label,workspace_id:workspace.id,workspace_label:workspace.label,section_id:section.id,section_label:section.label};
        const searchIndex={stable_id:setting.id,label:setting.label||canonical.label||'',description:setting.description||canonical.desc||'',aliases:[...(canonical.search||[]),...(setting.searchTerms||[])].map(String),destination_metadata:Object.values(destination).join(' ')};
        const boost=(canonical.curated===true||setting.curated===true?40:0)+(exposure==='simple'?22:0)+(ownerStatus!=='ok'?10:0);
        rows.push({setting,section,workspace,domain,category,exposure,control,applicability,ownerStatus,resultType,destination,searchIndex,boost});
      }
    }
    allSettingsCatalogCache=rows.sort((a,b)=>a.setting.id.localeCompare(b.setting.id));
    return rows;
  }
  function allSettingsFiltered(){
    const terms=allSettingsView.query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const matches=allSettingsCatalog().map(entry=>{
      if(allSettingsView.category!=='all'&&entry.category!==allSettingsView.category)return null;
      if(allSettingsView.exposure!=='all'&&entry.exposure!==allSettingsView.exposure)return null;
      if(allSettingsView.control!=='all'&&entry.control!==allSettingsView.control)return null;
      if(allSettingsView.applicability!=='all'&&!entry.applicability.includes(allSettingsView.applicability))return null;
      if(allSettingsView.ownerStatus!=='all'&&entry.ownerStatus!==allSettingsView.ownerStatus)return null;
      if(allSettingsView.resultType!=='all'&&entry.resultType!==allSettingsView.resultType)return null;
      const fields=[entry.searchIndex.stable_id,entry.searchIndex.label,entry.searchIndex.description,entry.searchIndex.aliases.join(' '),entry.searchIndex.destination_metadata];
      let score=entry.boost;for(const term of terms){let hit=0;for(const field of fields)hit=Math.max(hit,fuzzySubsequenceScore(field,term));if(!hit)return null;score+=hit;}
      return {entry,score};
    }).filter(Boolean).sort((a,b)=>terms.length?(b.score-a.score||a.entry.setting.label.localeCompare(b.entry.setting.label)||a.entry.setting.id.localeCompare(b.entry.setting.id)):(a.entry.setting.label.localeCompare(b.entry.setting.label)||a.entry.setting.id.localeCompare(b.entry.setting.id)));
    return (terms.length?matches.slice(0,60):matches).map(x=>x.entry);
  }
  function allSettingsRowHtml(entry,index,workspace){
    const html=renderSettingRow(entry.setting,entry.section,workspace);
    return html.replace('<div class="setting-row ',`<div data-all-setting-index="${index}" data-all-setting-id="${escAttr(entry.setting.id)}" data-all-setting-category="${escAttr(entry.category)}" data-all-setting-exposure="${escAttr(entry.exposure)}" data-all-setting-control="${escAttr(entry.control)}" data-all-setting-applicability="${escAttr(entry.applicability.join(' '))}" data-all-setting-owner-status="${escAttr(entry.ownerStatus)}" data-all-setting-result-type="${escAttr(entry.resultType)}" data-all-setting-destination="${escAttr(`${entry.destination.domain_id}/${entry.destination.workspace_id}/${entry.destination.section_id}`)}" class="setting-row `);
  }
  function allSettingsEstimatedHeight(entry){
    const measured=allSettingsView.heights.get(entry.setting.id);if(measured)return measured;
    if(entry.control==='multiselect')return hostIsNarrow()?220:168;
    if(entry.control==='path'||entry.control==='list'||entry.control==='keyvalue'||entry.control==='number')return hostIsNarrow()?176:132;
    return hostIsNarrow()?156:116;
  }
  function allSettingsPrefix(rows){
    const prefix=[0];for(const entry of rows)prefix.push(prefix[prefix.length-1]+allSettingsEstimatedHeight(entry));return prefix;
  }
  function allSettingsIndexAt(prefix,offset){
    let lo=0,hi=Math.max(0,prefix.length-2);while(lo<hi){const mid=Math.floor((lo+hi+1)/2);if(prefix[mid]<=offset)lo=mid;else hi=mid-1;}return lo;
  }
  function renderAllSettingsWindow(rows,start,end,rowHeight,workspace){
    const prefix=rowHeight,top=Math.max(0,prefix[start]||0),bottom=Math.max(0,(prefix[rows.length]||0)-(prefix[end]||0));
    return `<div class="all-settings-virtual-pad" aria-hidden="true" style="height:${top}px"></div>${rows.slice(start,end).map((entry,offset)=>allSettingsRowHtml(entry,start+offset,workspace)).join('')}<div class="all-settings-virtual-pad" aria-hidden="true" style="height:${bottom}px"></div>`;
  }
  function renderAllSettingsSection(workspace){
    const rows=allSettingsFiltered(),rowHeight=allSettingsPrefix(rows),end=Math.min(rows.length,18);
    const options=(values,current,label,format=humanize)=>`<option value="all">${escapeHtml(label)}</option>${[...new Set(values)].sort().map(value=>`<option value="${escAttr(value)}" ${current===value?'selected':''}>${escapeHtml(format(value))}</option>`).join('')}`;
    const catalog=allSettingsCatalog(),categoryLabels=new Map((window.PM12_REFERENCE?.categories||[]).map(row=>[row.id,row.title]));
    const categories=options(catalog.map(x=>x.category),allSettingsView.category,'All categories',value=>categoryLabels.get(value)||humanize(value));
    const exposures=options(catalog.map(x=>x.exposure),allSettingsView.exposure,'All exposure levels');
    const controls=options(catalog.map(x=>x.control),allSettingsView.control,'All control types');
    const applicability=options(catalog.flatMap(x=>x.applicability),allSettingsView.applicability,'All applicability');
    const ownerStatuses=options(catalog.map(x=>x.ownerStatus),allSettingsView.ownerStatus,'All owner statuses');
    const resultTypes=options(catalog.map(x=>x.resultType),allSettingsView.resultType,'All result types');
    return `<section class="settings-section all-settings-catalog" id="section-all-settings" data-section-id="all-settings"><div class="section-heading-row"><div class="section-heading-copy"><div class="section-kicker">Project-owned catalog</div><h2 class="section-title">All Settings</h2><p class="section-description">Fuzzy-search and facet the complete Settings model. Only the visible variable-height row window is mounted, matching the model-backed ListView required by the Slint port.</p></div><button class="btn small" data-action="clear-all-settings-filters">Clear filters</button></div><div class="all-settings-facets"><input class="text-control all-settings-query" data-action="all-settings-query" value="${escAttr(allSettingsView.query)}" placeholder="Fuzzy search labels, IDs, descriptions, aliases, or destinations" aria-label="Fuzzy search all settings"><select class="select-control" aria-label="Filter by category" data-action="all-settings-filter" data-filter="category">${categories}</select><select class="select-control" aria-label="Filter by exposure" data-action="all-settings-filter" data-filter="exposure">${exposures}</select><select class="select-control" aria-label="Filter by control type" data-action="all-settings-filter" data-filter="control">${controls}</select><select class="select-control" aria-label="Filter by applicability" data-action="all-settings-filter" data-filter="applicability">${applicability}</select><select class="select-control" aria-label="Filter by owner status" data-action="all-settings-filter" data-filter="ownerStatus">${ownerStatuses}</select><select class="select-control" aria-label="Filter by result type" data-action="all-settings-filter" data-filter="resultType">${resultTypes}</select></div><div class="all-settings-summary" role="status" aria-live="polite"><span data-all-settings-count>${rows.length} of ${catalog.length} settings</span><span>Virtualized · project scope</span></div><div class="all-settings-viewport" data-all-settings-viewport tabindex="0" aria-label="All Settings virtualized list"><div class="all-settings-spacer" data-all-settings-spacer><div class="all-settings-window" data-all-settings-window>${renderAllSettingsWindow(rows,0,end,rowHeight,workspace)}</div></div></div></section>`;
  }
  function refreshAllSettingsVirtual(resetScroll=false){
    const viewport=root.querySelector('[data-all-settings-viewport]');if(!viewport)return;
    const generation=++allSettingsView.generation;
    if(resetScroll){allSettingsView.scrollTop=0;allSettingsView.start=-1;allSettingsView.end=-1;viewport.scrollTop=0;}else if(Math.abs(viewport.scrollTop-allSettingsView.scrollTop)>1)viewport.scrollTop=allSettingsView.scrollTop;
    const rows=allSettingsFiltered(),prefix=allSettingsPrefix(rows),visibleStart=allSettingsIndexAt(prefix,viewport.scrollTop),start=Math.max(0,visibleStart-4),end=Math.min(rows.length,allSettingsIndexAt(prefix,viewport.scrollTop+viewport.clientHeight)+5);
    const workspace=getWorkspace(getDomain(),'project-settings');
    const spacer=viewport.querySelector('[data-all-settings-spacer]'),windowEl=viewport.querySelector('[data-all-settings-window]'),count=root.querySelector('[data-all-settings-count]');
    if(spacer)spacer.style.minHeight=`${Math.max(viewport.clientHeight,prefix[rows.length]||0)}px`;
    if(windowEl&&(start!==allSettingsView.start||end!==allSettingsView.end||resetScroll)){
      allSettingsView.start=start;allSettingsView.end=end;windowEl.innerHTML=renderAllSettingsWindow(rows,start,end,prefix,workspace);
      requestAnimationFrame(()=>{
        if(generation!==allSettingsView.generation||!viewport.isConnected||!windowEl.isConnected)return;
        const mounted=[...windowEl.querySelectorAll('.setting-row')];if(!mounted.length)return;
        const anchorOffset=viewport.scrollTop-(prefix[start]||0);let changed=false;
        for(const node of mounted){const style=getComputedStyle(node),height=node.getBoundingClientRect().height+(parseFloat(style.marginTop)||0)+(parseFloat(style.marginBottom)||0),id=node.dataset.allSettingId;if(id&&Number.isFinite(height)&&height>0&&Math.abs((allSettingsView.heights.get(id)||0)-height)>.5){allSettingsView.heights.set(id,height);changed=true;}}
        if(changed){const nextPrefix=allSettingsPrefix(rows);allSettingsView.scrollTop=Math.max(0,(nextPrefix[start]||0)+anchorOffset);viewport.scrollTop=allSettingsView.scrollTop;allSettingsView.start=-1;requestAnimationFrame(()=>{if(generation===allSettingsView.generation)refreshAllSettingsVirtual(false);});}
      });
    }
    if(count)count.textContent=`${rows.length} of ${allSettingsCatalog().length} settings`;
  }
  function setupAllSettingsVirtual(){
    const viewport=root.querySelector('[data-all-settings-viewport]');if(!viewport)return;
    viewport.scrollTop=allSettingsView.scrollTop;
    viewport.addEventListener('scroll',()=>{allSettingsView.scrollTop=viewport.scrollTop;refreshAllSettingsVirtual(false);},{passive:true});
    if(allSettingsResizeObserver)allSettingsResizeObserver.disconnect();
    if(typeof ResizeObserver==='function'){
      let priorWidth=viewport.clientWidth;
      allSettingsResizeObserver=new ResizeObserver(()=>{const next=viewport.clientWidth;if(next!==priorWidth){priorWidth=next;allSettingsView.heights.clear();allSettingsView.start=-1;requestAnimationFrame(()=>refreshAllSettingsVirtual(false));}});
      allSettingsResizeObserver.observe(viewport);
    }
    refreshAllSettingsVirtual(false);
  }
'''


ADAPTER_PRELUDE = r'''/* PM7 T44 project-scoped Settings adapter. */
(function () {
  'use strict';
  /* PMConcept7 is an explicit concept fixture.  Once an owner registry is
     attached, browser fixtures and shadows are never treated as owner state. */
  var CONCEPT_FIXTURE_MODE=true;
  var PREFIX='pm7:settings:tome-tabs:v1:';
  var bridgeDepth=0;
  var lastProject='';
  var lastChatLayout='';
  var commandSeq=0;
  var continuations=new Map();
  var credentialSettingIds=new Set(['ai.accounts.anthropic-api-key','ai.accounts.openai-api-key','ai.accounts.gemini-api-key','ai.accounts.cursor-api-key','ai.accounts.minimax-api-key','ai.accounts.github-token','ai.accounts.opencode-server-auth','code.execution.dockerhub-token','web.providers.firecrawl-api-key','web.fetch.proxy-credentials','system.mcp.remote-headers']);
  function scrubCredentialSettings(snapshot){var copy=clone(snapshot||{});copy.settings=copy.settings||{};credentialSettingIds.forEach(function(id){delete copy.settings[id];});return copy;}
  function projectRecord(){
    if(typeof window.PM_ACTIVE_PROJECT_ID==='string'){
      var explicit=window.PM_ACTIVE_PROJECT_ID.trim();
      if(!explicit||/^(none|no-project)$/i.test(explicit))return null;
      return {id:explicit,label:explicit};
    }
    var selected=document.querySelector('#projectMenu .pm6-tb-menu-item.is-selected[data-project]');
    var label=document.getElementById('projectMenuLabel');
    var id=selected&&selected.getAttribute('data-project')||label&&label.textContent.trim()||'';
    if(!id||/^(none|no project|select project)$/i.test(id))return null;
    return {id:id,label:label&&label.textContent.trim()||id};
  }
  function key(){var p=projectRecord();return p?PREFIX+encodeURIComponent(p.id):null;}
  function clone(v){return JSON.parse(JSON.stringify(v));}
  function themeSlug(value){return String(value||'Basic Dark').trim().toLowerCase().replace(/\s+/g,'-');}
  function themeLabel(slug){return String(slug||'basic-dark').split('-').map(function(x){return x.charAt(0).toUpperCase()+x.slice(1);}).join(' ');}
  function configuredThemeSlug(settings,hasProject){
    var selected=hasProject?themeSlug(settings['general.visual.theme']||'Basic Dark'):'basic-dark';
    var family=(selected.split('-')[0]||'basic'),explicitMode=(selected.split('-')[1]||'dark');
    var mode=hasProject?String(settings['general.visual.theme-mode']||explicitMode).toLowerCase():'dark';
    if(['light','dark','auto'].indexOf(mode)<0)mode=explicitMode;
    var scheme=mode==='auto'?(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):mode;
    return family+'-'+scheme;
  }
  function clampGlassAlpha(settings,value){
    var raw=value==null?settings['general.visual.glass-transparency']:value;
    var n=Number(raw==null ? .55 : raw);if(n>1)n/=100;if(!Number.isFinite(n))n=.55;
    var slug=configuredThemeSlug(settings,true),lo=/-light$/.test(slug)?.45:.35;
    return Math.max(lo,Math.min(1,n));
  }
  function glassAlpha(settings,slug){
    var n=clampGlassAlpha(settings,settings['general.visual.glass-transparency']);
    var light=/-light$/.test(slug),lo=light?.45:.35;
    return Math.max(lo,Math.min(1,n));
  }
  function applyPaint(snapshot){
    snapshot=snapshot||{};var settings=snapshot.settings||{};var p=projectRecord();
    var selected=p?themeSlug(settings['general.visual.theme']||'Basic Dark'):'basic-dark';
    var family=(selected.split('-')[0]||'basic'),explicitMode=(selected.split('-')[1]||'dark');
    var mode=p?String(settings['general.visual.theme-mode']||explicitMode).toLowerCase():'dark';
    if(['light','dark','auto'].indexOf(mode)<0)mode=explicitMode;
    var slug=family+'-'+(mode==='auto'?(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):mode);
    bridgeDepth++;
    try{
      if(window.PM_THEME&&typeof window.PM_THEME.setFamily==='function'&&typeof window.PM_THEME.setMode==='function'){
        window.PM_THEME.setFamily(family,{persist:false,dispatch:false});
        window.PM_THEME.setMode(mode,{persist:false,dispatch:false});
        slug=window.PM_THEME.get();
      }
      else document.documentElement.setAttribute('data-theme',slug);
      var bg=String(settings['general.visual.glass-background-mode']||'Mesh').toLowerCase();
      if(['mesh','depth','minimal'].indexOf(bg)<0)bg='mesh';
      document.documentElement.setAttribute('data-glass-bg',bg);
      var alpha=glassAlpha(settings,slug);settings['general.visual.glass-transparency']=alpha;
      document.documentElement.style.setProperty('--glass-alpha',String(alpha));
      if(settings['general.visual.reduce-animations'])document.documentElement.setAttribute('data-motion','reduced');
      else document.documentElement.removeAttribute('data-motion');
      var chat=String(settings['general.visual.chat-layout-mode']||'Docked').toLowerCase();
      if(chat!==lastChatLayout&&window.PM_DEMO&&typeof window.PM_DEMO.emit==='function'){lastChatLayout=chat;window.PM_DEMO.emit('chat.layout',{mode:chat,origin:'settings'});}
      if(window.PM_GLASS_LOCK_REFRESH)try{window.PM_GLASS_LOCK_REFRESH();}catch(_e){}
    }finally{bridgeDepth--;}
  }
  function load(defaults,merge){
    var base=clone(defaults),k=key();
    base.settings=base.settings||{};
    if(!k){base.settings['general.visual.theme']='Basic Dark';base.settings['general.visual.theme-mode']='Dark';base.settings['general.visual.glass-background-mode']='Mesh';base.settings['general.visual.glass-transparency']=.55;return base;}
    base.settings['general.visual.theme']='Basic Dark';base.settings['general.visual.theme-mode']='Dark';base.settings['general.visual.glass-background-mode']='Mesh';base.settings['general.visual.glass-transparency']=.55;
    try{
      var p=projectRecord(),registry=window.PM_SETTINGS_REGISTRY,getCurrent=registry&&registry.getProjectSnapshot,projection=null,source='concept_default_fixture';
      if(registry){
        if(typeof getCurrent!=='function'){base.settingsProjectionSource='owner_registry_read_unavailable';base.settingsProjectionReadOnly=true;return base;}
        projection=getCurrent({project_id:p.id});
        if(projection&&typeof projection.then==='function'){base.settingsProjectionSource='owner_registry_async_unavailable';base.settingsProjectionReadOnly=true;return base;}
        if(!projection||!projection.settings){base.settingsProjectionSource='owner_registry_projection_unavailable';base.settingsProjectionReadOnly=true;return base;}
        source='owner_registry';
      }else if(CONCEPT_FIXTURE_MODE){
        var fixture=window.PM_SETTINGS_PROJECT_SNAPSHOTS&&window.PM_SETTINGS_PROJECT_SNAPSHOTS[p.id];
        if(fixture&&fixture.settings){projection=fixture;source='supplied_concept_fixture';}
        if(!projection){projection=JSON.parse(localStorage.getItem(k)||'{}');source=projection&&projection.settings?'local_concept_fixture':'concept_default_fixture';}
      }
      var saved=merge(base,scrubCredentialSettings(projection||{}));saved.settingsProjectionSource=source;saved.settingsProjectionReadOnly=false;credentialSettingIds.forEach(function(id){delete saved.settings[id];});
      if(projection&&projection.settings&&projection.settings['general.visual.theme']&&!Object.prototype.hasOwnProperty.call(projection.settings,'general.visual.theme-mode')){var legacyMode=themeSlug(projection.settings['general.visual.theme']).split('-')[1];if(legacyMode==='light'||legacyMode==='dark')saved.settings['general.visual.theme-mode']=themeLabel(legacyMode);}
      var priorAlpha=saved.settings['general.visual.glass-transparency'],alpha=clampGlassAlpha(saved.settings,priorAlpha);saved.settings['general.visual.glass-transparency']=alpha;
      if(source==='local_concept_fixture'&&projection&&projection.settings&&Number(priorAlpha)!==alpha){var repaired=scrubCredentialSettings(projection);repaired.settings['general.visual.glass-transparency']=alpha;try{localStorage.setItem(k,JSON.stringify(repaired));}catch(_e){}}
      return saved;
    }catch(_e){base.settingsProjectionSource=window.PM_SETTINGS_REGISTRY?'owner_registry_read_failed':'concept_default_fixture';base.settingsProjectionReadOnly=!!window.PM_SETTINGS_REGISTRY;return base;}
  }
  function save(snapshot){
    var k=key(),safe=scrubCredentialSettings(snapshot);safe.settings['general.visual.glass-transparency']=clampGlassAlpha(safe.settings,safe.settings['general.visual.glass-transparency']);var owned={schema_version:'pm7.settings.project_projection.v1',settings:safe.settings,changed:clone(snapshot&&snapshot.changed||{}),domain:snapshot&&snapshot.domain,workspace:snapshot&&snapshot.workspace,activeSection:clone(snapshot&&snapshot.activeSection||{}),transferCategories:clone(snapshot&&snapshot.transferCategories||[]),settingsTransferHistory:clone(snapshot&&snapshot.settingsTransferHistory||[]),settingsTransferRollbacks:clone(snapshot&&snapshot.settingsTransferRollbacks||{}),settingsSourceSnapshot:clone(snapshot&&snapshot.settingsSourceSnapshot||null)};
    if(k&&!window.PM_SETTINGS_REGISTRY&&CONCEPT_FIXTURE_MODE)try{localStorage.setItem(k,JSON.stringify(owned));}catch(_e){}
    if(!bridgeDepth)applyPaint(snapshot);
  }
  function reset(){var k=key();if(k)try{localStorage.removeItem(k);}catch(_e){}}
  function projectSnapshot(projectId){
    var owner=window.PM_SETTINGS_REGISTRY,registry=owner&&owner.getProjectSnapshot;
    if(owner){
      if(typeof registry!=='function')return null;
      try{var owned=registry({project_id:projectId});if(owned&&typeof owned.then==='function')return null;if(owned&&owned.settings)return scrubCredentialSettings(owned);return null;}catch(_e){return null;}
    }
    if(!CONCEPT_FIXTURE_MODE)return null;
    var fixture=window.PM_SETTINGS_PROJECT_SNAPSHOTS&&window.PM_SETTINGS_PROJECT_SNAPSHOTS[projectId];
    if(fixture&&fixture.settings)return scrubCredentialSettings(fixture);
    try{var saved=JSON.parse(localStorage.getItem(PREFIX+encodeURIComponent(projectId))||'null');return saved&&saved.settings?scrubCredentialSettings(saved):null;}catch(_e){return null;}
  }
  function commandId(prefix){commandSeq+=1;return prefix+'-'+Date.now().toString(36)+'-'+commandSeq.toString(36);}
  function dispatch(canonicalCommandId,operationFields,continuation){
    var p=projectRecord(),runtime=window.PM_SETTINGS_RUNTIME_CONTEXT||{},instance=commandId('settings-command');
    var missing=[];
    if(!p)missing.push('project_id');
    ['project_home_server_id','execution_host_id','execution_environment_id','actor_ref','permission_snapshot_ref','binding_sha256'].forEach(function(name){if(!runtime[name])missing.push(name);});
    if(!Number.isInteger(runtime.topology_generation)||runtime.topology_generation<0)missing.push('topology_generation');
    if(runtime.binding_sha256&&!/^[0-9a-f]{64}$/.test(runtime.binding_sha256))missing.push('binding_sha256_format');
    var request=Object.assign({
      schema_id:'pm.shared_runtime.command_request.v1',schema_version:'1.0.0',command_id:canonicalCommandId,
      command_instance_id:instance,
      idempotency:{schema_id:'pm.shared_runtime.command_idempotency.v1',idempotency_key:commandId('settings-idem'),scope_ref:p?'project:'+p.id:'project:unresolved',binding_sha256:runtime.binding_sha256||'0'.repeat(64),replay_policy:'join_inflight_same_binding',conflict_behavior:'reject_same_key_different_binding',original_operation_id:null,original_result_ref:null},
      project_id:p?p.id:'',project_home_server_id:runtime.project_home_server_id||'',execution_host_id:runtime.execution_host_id||'',execution_environment_id:runtime.execution_environment_id||'',source_location_id:runtime.source_location_id||null,topology_generation:Number.isInteger(runtime.topology_generation)?runtime.topology_generation:0,actor_ref:runtime.actor_ref||'',permission_snapshot_ref:runtime.permission_snapshot_ref||'',goal_id:runtime.goal_id||null,plan_id:runtime.plan_id||null,run_id:runtime.run_id||null,thread_id:runtime.thread_id||null,agent_id:runtime.agent_id||null,crew_id:runtime.crew_id||null,deadline_utc:runtime.deadline_utc||null,recovery_of_operation_id:runtime.recovery_of_operation_id||null
    },operationFields||{});
    var preview={request:request,origin_surface:'settings',origin_route:'ai/providers/installation',continuation:{project_id:p?p.id:null,return_surface:'settings',return_route:'ai/providers/installation'}};
    if(missing.length){
      try{window.dispatchEvent(new CustomEvent('pm7.settings.command.preview',{detail:preview}));}catch(_e){}
      return {mode:'blocked_runtime_context',missing:missing,preview:preview};
    }
    if(continuation&&typeof continuation==='object')continuations.set(instance,Object.assign({},continuation,{command_instance_id:instance,project_id:p?p.id:null}));
    var host=window.PM_DISPATCH_COMMAND;
    if(typeof host==='function'){
      try{
        var ownerResult=host(request);
        if(ownerResult&&typeof ownerResult.then==='function')return {mode:'host_pending',request:request,result:ownerResult};
        if(ownerResult===false||(ownerResult&&ownerResult.ok===false))return {mode:'host_rejected',request:request,result:ownerResult,error:String(ownerResult&&ownerResult.safe_user_message||ownerResult&&ownerResult.reason||'Owner rejected the request')};
        if(ownerResult&&(ownerResult.terminal===true||ownerResult.result_receipt_ref||ownerResult.receipt_ref))return {mode:'host_result',request:request,result:ownerResult};
        return {mode:'host_pending',request:request,result:ownerResult};
      }catch(error){return {mode:'host_error',request:request,error:String(error&&error.message||error)};}
    }
    try{window.dispatchEvent(new CustomEvent('pm:command-dispatch',{detail:request}));return {mode:'event_pending',request:request};}
    catch(error){return {mode:'event_error',request:request,error:String(error&&error.message||error)};}
  }
  function consumeCommandResult(commandInstanceId,result){
    var continuation=continuations.get(commandInstanceId);if(!continuation)return null;
    var mode=result&&result.mode||'',terminal=mode==='host_result'||mode==='host_rejected'||mode==='host_error'||mode==='event_error'||result&&result.terminal===true||result&&result.result_receipt_ref||result&&result.receipt_ref;
    if(!terminal)return continuation;
    continuations.delete(commandInstanceId);
    var activeProject=projectRecord(),sameProject=!!activeProject&&activeProject.id===continuation.project_id;
    if(!sameProject){
      try{window.dispatchEvent(new CustomEvent('pm7.settings.command.returned',{detail:{command_instance_id:commandInstanceId,provider_id:continuation.provider_id,origin_action:continuation.origin_action,return_surface:'settings',return_route:'ai/providers/installation',routing_disposition:'cancelled_project_changed'}}));}catch(_e){}
      return Object.assign({},continuation,{routing_disposition:'cancelled_project_changed'});
    }
    var panel=document.getElementById('panel-settings');
    if(panel&&!panel.classList.contains('active')){var tab=document.getElementById('tab-settings');if(tab)tab.click();}
    if(window.PM12_KIMI&&typeof window.PM12_KIMI.returnToProviderInstallation==='function')window.PM12_KIMI.returnToProviderInstallation(continuation.provider_id,continuation.origin_action);
    var selector='[data-action="'+String(continuation.origin_action||'').replace(/[^a-z-]/g,'')+'-provider"][data-provider="'+String(continuation.provider_id||'').replace(/["\\]/g,'')+'"]';
    requestAnimationFrame(function(){var target=continuation.invoker&&continuation.invoker.isConnected?continuation.invoker:panel&&panel.querySelector(selector);if(target&&typeof target.focus==='function')target.focus();});
    var terminalDisposition=String(result&&result.disposition||result&&result.status||result&&result.mode||'terminal_result_received');
    try{window.dispatchEvent(new CustomEvent('pm7.settings.command.returned',{detail:{command_instance_id:commandInstanceId,provider_id:continuation.provider_id,origin_action:continuation.origin_action,return_surface:'settings',return_route:'ai/providers/installation',routing_disposition:'returned',terminal_disposition:terminalDisposition}}));}catch(_e){}
    return Object.assign({},continuation,{routing_disposition:'returned',terminal_disposition:terminalDisposition});
  }
  function setChromeThemeFamily(family){
    if(!projectRecord()||!window.PM12_KIMI)return applyPaint(window.PM12_KIMI?window.PM12_KIMI.getState():{});
    var mode=window.PM_THEME&&window.PM_THEME.getMode?window.PM_THEME.getMode():'dark';
    var scheme=mode==='auto'?(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):mode;
    window.PM12_KIMI.setSettingFromHost('general.visual.theme',themeLabel(family+'-'+scheme),false,false);
    applyPaint(window.PM12_KIMI.getState());
  }
  function setChromeThemeMode(mode){
    if(!projectRecord()||!window.PM12_KIMI)return applyPaint(window.PM12_KIMI?window.PM12_KIMI.getState():{});
    window.PM12_KIMI.setSettingFromHost('general.visual.theme-mode',themeLabel(mode),false,true);
    applyPaint(window.PM12_KIMI.getState());
  }
  function routeForCategory(category){
    var map={general:['general','general-reference'],ai:['ai','ai-reference'],web:['ai','web-reference'],media:['ai','media-reference'],code:['code','code-reference'],extensions:['code','extensions-reference'],memory:['memory','memory-reference'],personas:['memory','personas-reference'],planning:['planning','planning-reference'],branching:['planning','branching-reference'],safety:['safety','safety-reference'],system:['system','system-reference']};
    return map[category]||['general','app-input'];
  }
  function openBloom(category,focusSettingId){
    var route=routeForCategory(category),tab=document.getElementById('tab-settings');if(tab)tab.click();
    if(!window.PM12_KIMI)return false;
    window.PM12_KIMI.navigate(route[0],route[1],focusSettingId?{detailSetting:focusSettingId}:{});return true;
  }
  function redirectProjectModal(){
    var modal=document.getElementById('projectSettingsModal');if(!modal)return;
    var redirect=function(){if(!modal.classList.contains('visible'))return;modal.classList.remove('visible');var tab=document.getElementById('tab-settings');if(tab)tab.click();if(window.PM12_KIMI)window.PM12_KIMI.navigate('projects','project-settings');};
    new MutationObserver(redirect).observe(modal,{attributes:true,attributeFilter:['class']});
  }
  function reloadOnProjectChange(){
    var label=document.getElementById('projectMenuLabel'),menu=document.getElementById('projectMenu');
    lastProject=(projectRecord()||{}).id||'';
    var check=function(){var id=(projectRecord()||{}).id||'';if(id===lastProject)return;lastProject=id;if(window.PM12_KIMI&&window.PM12_KIMI.reloadProject)window.PM12_KIMI.reloadProject();};
    if(label)new MutationObserver(check).observe(label,{childList:true,characterData:true,subtree:true});
    if(menu)new MutationObserver(check).observe(menu,{attributes:true,subtree:true,attributeFilter:['class']});
  }
  function installPanelLifecycle(){
    var panel=document.getElementById('panel-settings');if(!panel)return;
    var closeIfInactive=function(payload){
      var page=payload&&payload.detail?payload.detail.page:payload&&payload.page;
      if(page==='settings'||(!page&&panel.classList.contains('active')))return;
      if((page&&page!=='settings')||!panel.classList.contains('active')){
        if(window.PM12_KIMI&&typeof window.PM12_KIMI.closeTransientUi==='function')window.PM12_KIMI.closeTransientUi();
      }
    };
    if(window.PM_DEMO&&typeof window.PM_DEMO.on==='function')try{window.PM_DEMO.on('page.changed',closeIfInactive);}catch(_e){}
    document.addEventListener('page.changed',closeIfInactive);
    new MutationObserver(function(){closeIfInactive({page:panel.classList.contains('active')?'settings':'inactive'});}).observe(panel,{attributes:true,attributeFilter:['class']});
  }
  window.PM7_SETTINGS_TOME={load:load,save:save,reset:reset,projectSnapshot:projectSnapshot,dispatch:dispatch,consumeCommandResult:consumeCommandResult,applyPaint:applyPaint,clampGlassAlpha:clampGlassAlpha,configuredThemeSlug:configuredThemeSlug,setChromeThemeFamily:setChromeThemeFamily,setChromeThemeMode:setChromeThemeMode,project:projectRecord,projectLabel:function(){var p=projectRecord();return p?p.label:'No project';},portal:function(){return document.getElementById('pm-settings-portals')||document.getElementById('panel-settings')||document.body;},ownsEvent:function(target){var root=document.getElementById('pm-settings-root'),portal=document.getElementById('pm-settings-portals');return !!(target&&((root&&root.contains(target))||(portal&&portal.contains(target))));},openBloom:openBloom};
  window.PM7_SETTINGS_OPEN_BLOOM=openBloom;
  document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){redirectProjectModal();reloadOnProjectChange();installPanelLifecycle();window.addEventListener('pm7.settings.runtime-context.changed',function(){if(window.PM12_KIMI&&typeof window.PM12_KIMI.renderApp==='function')window.PM12_KIMI.renderApp({soft:true});});if(window.PM12_KIMI)applyPaint(window.PM12_KIMI.getState());},0);});
})();
'''


def _adapt_js(source, need):
    transfer_category_json = _transfer_category_registry(need)
    source = _replace_once(
        source,
        "  const STORAGE_KEY = 'pm-settings-kimi-concept12-v4';",
        "  const STORAGE_KEY = 'pm7-project-settings-tome-v1';\n  const portalRoot = () => window.PM7_SETTINGS_TOME.portal();",
        need,
        "project store constant",
    )
    source = _replace_once(
        source,
        'data-action="page-options" title="Page options" aria-label="Page options"',
        'data-action="page-options" data-pm-hover-label="Page options" data-pm-hover-detail="Open actions for this Settings page." aria-label="Page options"',
        need,
        "page options shared hover metadata",
    )
    source = _replace_once(
        source,
        'data-action="play-sound" data-id="${escAttr(s.id)}" title="Play ${escAttr(s.name)}"',
        'data-action="play-sound" data-id="${escAttr(s.id)}" data-pm-hover-label="Play ${escAttr(s.name)}" data-pm-hover-detail="Preview this notification sound." aria-label="Play ${escAttr(s.name)}"',
        need,
        "sound preview shared hover metadata",
    )
    source = _replace_once(
        source,
        "  let detailInspectorVisible = false;",
        r"""  let detailInspectorVisible = false;
  function captureTransientFocus(preferred=null){
    const candidate=preferred||document.activeElement;
    return candidate&&candidate.nodeType===1&&window.PM7_SETTINGS_TOME.ownsEvent(candidate)?candidate:null;
  }
  function restoreTransientFocus(candidate){
    requestAnimationFrame(()=>{
      const target=candidate&&candidate.isConnected&&window.PM7_SETTINGS_TOME.ownsEvent(candidate)?candidate:root.querySelector('[data-global-search],.domain-link,button,[tabindex]:not([tabindex="-1"])');
      if(target&&typeof target.focus==='function')try{target.focus({preventScroll:true});}catch(_e){target.focus();}
    });
  }
  function closePopover(pop,restoreFocus=true){
    if(!pop)return;const target=pop._pmReturnFocus||menuAnchorEl;pop.remove();menuAnchorEl=null;if(restoreFocus)restoreTransientFocus(target);
  }""",
        need,
        "Settings transient focus helpers",
    )
    source = _replace_band(
        source,
        "  function loadState() {",
        "  function mergeState(base, saved) {",
        "  function loadState() {\n    return window.PM7_SETTINGS_TOME.load(clone(defaultState), mergeState);\n  }\n",
        need,
        "project load adapter",
    )
    source = _replace_band(
        source,
        "  function saveState() {",
        "  const iconPaths = {",
        "  function saveState() {\n    searchIndexDirty = true;\n    const copy = clone(state);\n    delete copy.home; delete copy.railOpen; delete copy.resourceRosterOpen;\n    window.PM7_SETTINGS_TOME.save(copy);\n  }\n\n",
        need,
        "project save adapter",
    )
    source = _replace_once(
        source,
        "  const nowLabel = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });",
        r"""  const nowLabel = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const projectDisplayName = () => window.PM7_SETTINGS_TOME.projectLabel();
  const dispatchSettingsCommand = (commandId,args={},continuation=null) => window.PM7_SETTINGS_TOME.dispatch(commandId,args,continuation);
  function normalizedSettingValue(id,value){
    if(id==='general.visual.glass-transparency'){const settings={...(state.settings||{}),[id]:value};value=window.PM7_SETTINGS_TOME.clampGlassAlpha(settings,value);}
    return value;
  }
  function commitSettingValues(settingValues){
    const project=window.PM7_SETTINGS_TOME.project();
    if(!project){showToast('Select or create a project','No-project mode is an ephemeral Basic Dark projection and does not accept Settings writes.','warning');return false;}
    if(state.settingsProjectionReadOnly===true){showToast('Settings were not changed','The attached Settings owner has not supplied a current readable project projection.','error');return false;}
    const writes={};for(const [id,value] of Object.entries(settingValues||{}))writes[id]=normalizedSettingValue(id,value);
    const entries=Object.entries(writes);if(!entries.length)return true;
    const registry=window.PM_SETTINGS_REGISTRY;
    if(registry){
      let result;
      if(entries.length>1){
        const batch=registry.applyProjectValues||registry.setProjectValues;
        if(typeof batch!=='function'){showToast('Settings were not changed','The Settings owner does not expose the required atomic batch transaction.','error');return false;}
        result=batch({project_id:project.id,setting_values:clone(writes),atomic:true});
      }else{
        const setter=registry.setProjectValue;
        if(typeof setter!=='function'){showToast('Setting was not changed','The Settings owner does not expose a project-value transaction.','error');return false;}
        result=setter({project_id:project.id,setting_id:entries[0][0],value:clone(entries[0][1])});
      }
      if(result&&typeof result.then==='function'){showToast('Settings were not changed','The concept requires an accepted owner transaction receipt before updating its projection.','error');return false;}
      if(!result||result.ok===false){showToast(entries.length>1?'Settings were not changed':'Setting was not changed',result?.safe_user_message||result?.reason||'The Settings owner rejected this transaction.','error');return false;}
    }
    for(const [id,value] of entries){state.settings[id]=clone(value);state.changed[id]=true;}return true;
  }
  function commitSettingValue(id,value,options={}){
    const writes={[id]:normalizedSettingValue(id,value)};
    if(options.syncRelated===false)return commitSettingValues(writes);
    if(id==='general.visual.theme'){
      const mode=String(value||'').trim().split(/\s+/).pop();
      if(/^(light|dark)$/i.test(mode))writes['general.visual.theme-mode']=cap(mode);
    }else if(id==='general.visual.theme-mode'&&!/^auto$/i.test(String(value))){
      const family=String(state.settings['general.visual.theme']||'Basic Dark').trim().split(/\s+/)[0]||'Basic';
      writes['general.visual.theme']=family+' '+cap(value);
    }
    if(id==='general.visual.theme'||id==='general.visual.theme-mode'){
      const candidate={...(state.settings||{}),...writes},current=Number(state.settings['general.visual.glass-transparency']);
      const clamped=window.PM7_SETTINGS_TOME.clampGlassAlpha(candidate,current);if(!Number.isFinite(current)||clamped!==current)writes['general.visual.glass-transparency']=clamped;
    }
    return commitSettingValues(writes);
  }
  function restoreSettingDefault(id){
    const project=window.PM7_SETTINGS_TOME.project();
    if(!project){showToast('Select or create a project','No-project mode does not have persisted Settings defaults to restore.','warning');return false;}
    if(state.settingsProjectionReadOnly===true){showToast('Default was not restored','The attached Settings owner has not supplied a current readable project projection.','error');return false;}
    const restore=window.PM_SETTINGS_REGISTRY&&window.PM_SETTINGS_REGISTRY.restoreProjectDefault;
    if(window.PM_SETTINGS_REGISTRY&&typeof restore!=='function'){showToast('Default was not restored','The Settings owner does not expose the required project-default transaction.','error');return false;}
    if(typeof restore==='function'){
      const result=restore({project_id:project?.id||null,setting_id:id});
      if(result&&typeof result.then==='function'){showToast('Default was not restored','The concept requires an accepted owner receipt before updating its projection.','error');return false;}
      if(!result||result.ok===false){showToast('Default was not restored',result?.safe_user_message||result?.reason||'The Settings owner rejected this restore.','error');return false;}
    }
    delete state.settings[id];delete state.changed[id];return true;
  }
  function restoreAllProjectDefaults(){
    const project=window.PM7_SETTINGS_TOME.project(),registry=window.PM_SETTINGS_REGISTRY,restore=registry&&registry.restoreProjectDefaults;
    if(!project){showToast('Select or create a project','No-project mode has no persisted Settings defaults to restore.','warning');return false;}
    if(state.settingsProjectionReadOnly===true){showToast('Defaults were not restored','The attached Settings owner has not supplied a current readable project projection.','error');return false;}
    if(typeof restore!=='function'){showToast('Defaults were not restored','The Settings owner does not expose the required atomic restore-all transaction.','warning');return false;}
    const result=restore({project_id:project.id,create_rollback:true,preserve_credential_references:true});
    if(result&&typeof result.then==='function'){showToast('Defaults were not restored','The concept requires an accepted owner receipt before updating its projection.','error');return false;}
    if(!result||result.ok===false){showToast('Defaults were not restored',result?.safe_user_message||result?.reason||'The Settings owner rejected restore-all.','error');return false;}
    state=loadState();ensureStateShape();state.detailSetting=null;renderApp();window.PM7_SETTINGS_TOME.applyPaint(state);showToast('Project defaults restored','The owner restored ordinary project Settings atomically and preserved secure credential references.','warning');return true;
  }
  function portalFrame(){const portal=portalRoot(),rect=portal.getBoundingClientRect();return {portal,rect,width:portal.clientWidth||rect.width,height:portal.clientHeight||rect.height};}
  function hostIsNarrow(){return root.clientWidth>0&&root.clientWidth<=720;}
  function installHostWidthObserver(){
    if(typeof ResizeObserver!=='function')return;let priorWidth=root.clientWidth,narrow=hostIsNarrow();
    const observer=new ResizeObserver(()=>{const width=root.clientWidth,next=hostIsNarrow(),activated=priorWidth===0&&width>0,breakpointChanged=next!==narrow,widthChanged=Math.abs(width-priorWidth)>=1;priorWidth=width;if(!activated&&!breakpointChanged&&!widthChanged)return;narrow=next;if(activated||breakpointChanged)renderApp({soft:true});else requestAnimationFrame(afterRender);});
    observer.observe(root);
  }
  const INSTALLATION_DISABLED_REASONS={
    install:new Set(['already_in_state','operation_in_progress','setup_required','approval_required','official_source_unverified','host_environment_mismatch','permission_required','policy_denied']),
    repair:new Set(['already_in_state','operation_in_progress','setup_required','approval_required','official_source_unverified','host_environment_mismatch','permission_required','policy_denied','target_missing','resource_blocked']),
    verify:new Set(['target_missing','host_environment_mismatch','operation_in_progress','policy_denied'])
  };
  const INSTALLATION_DISABLED_COPY={already_in_state:'The requested installation state is already current.',operation_in_progress:'Another installation operation is in progress.',setup_required:'Required setup is incomplete.',approval_required:'Approval is required before this operation.',official_source_unverified:'The official source is not verified.',host_environment_mismatch:'The projected Host and Environment do not match this installation.',permission_required:'Additional permission is required.',policy_denied:'Policy denies this operation.',target_missing:'The installation target is missing.',resource_blocked:'A required resource is blocked.'};
  function installationCommandProjection(action,provider){
    const runtime=window.PM_SETTINGS_RUNTIME_CONTEXT||{},commands=runtime.state?.commands||runtime.commands||state.commands||{},bucket=commands['installation_'+action],id=provider?.id;
    if(!bucket||!id)return null;
    if(bucket.providers&&Object.prototype.hasOwnProperty.call(bucket.providers,id))return bucket.providers[id];
    if(bucket.by_subject&&Object.prototype.hasOwnProperty.call(bucket.by_subject,id))return bucket.by_subject[id];
    if(bucket.subjects&&Object.prototype.hasOwnProperty.call(bucket.subjects,id))return bucket.subjects[id];
    if(bucket.provider_id===id||bucket.subject_id===id)return bucket;
    return null;
  }
  function installationCommandState(action,provider){
    const projection=installationCommandProjection(action,provider),projected=!!projection&&Object.prototype.hasOwnProperty.call(projection,'availability');
    const availability=projected?projection.availability:null,available=availability===true;
    let disabledReasonCode='',disabledReason='';
    if(!available){
      disabledReasonCode=!projected?'availability_not_projected':availability!==false?'availability_invalid':String(projection?.disabled_reason||'disabled_reason_missing');
      disabledReason=INSTALLATION_DISABLED_REASONS[action]?.has(disabledReasonCode)?INSTALLATION_DISABLED_COPY[disabledReasonCode]:'Owner supplied no recognized availability reason for this provider and action.';
    }
    return {available,availability,disabledReason,disabledReasonCode,projection};
  }
  function installationActionAttrs(action,provider){
    const command=installationCommandState(action,provider),availability=command.availability===null?'unknown':String(command.availability);
    return 'data-command-availability="'+escAttr(availability)+'" data-disabled-reason="'+escAttr(command.disabledReasonCode)+'" aria-disabled="'+(command.available?'false':'true')+'" '+(command.available?'':'data-pm-hover-label="'+escAttr(humanize(action)+' unavailable')+'" data-pm-hover-detail="'+escAttr(command.disabledReason)+'" aria-label="'+escAttr(humanize(action)+' unavailable: '+command.disabledReason)+'"');
  }
  function providerOwnerInstalled(provider){const installationId=window.PM_SETTINGS_RUNTIME_CONTEXT?.installation_subjects?.[provider?.id]?.installation_id;return typeof installationId==='string'&&installationId.trim().length>0;}
  function installationRequest(provider,action){
    const subject=window.PM_SETTINGS_RUNTIME_CONTEXT?.installation_subjects?.[provider.id];
    const required=['provider_cli','installation_id','official_source_ref','provenance_ref','target_release_ref','repair_plan_ref','rollback_target_ref','verification_policy_ref'];
    const nullable=new Set(['installation_id','official_source_ref','target_release_ref','repair_plan_ref','rollback_target_ref','verification_policy_ref']);
    const validRef=value=>typeof value==='string'&&value.trim()&&!/[\r\n]/.test(value);
    const missing=!subject?['installation_subjects.'+provider.id]:required.filter(name=>{
      if(!Object.prototype.hasOwnProperty.call(subject,name))return true;
      const value=subject[name];if(name==='provider_cli')return typeof value!=='boolean';
      if(value===null)return !nullable.has(name);
      return !validRef(value);
    });
    if(subject&&subject.provider_cli===true&&action==='install'&&!validRef(subject.official_source_ref))missing.push('official_source_ref_for_provider_cli_install');
    if(subject&&(action==='repair'||action==='verify')&&!validRef(subject.installation_id))missing.push('installation_id_for_'+action);
    if(subject&&action==='repair'&&!validRef(subject.repair_plan_ref))missing.push('repair_plan_ref_for_repair');
    if(subject&&action==='verify'&&!validRef(subject.verification_policy_ref))missing.push('verification_policy_ref_for_verify');
    if(missing.length)return {fields:null,missing};
    const acquisitionBasis=subject.provider_cli===false?'non_provider_demand':action==='install'?'explicit_user_acquisition':'post_consent_management';
    return {fields:{action,subject_kind:'provider',subject_id:provider.id,provider_cli:subject.provider_cli,acquisition_basis:acquisitionBasis,installation_id:subject.installation_id,official_source_ref:subject.official_source_ref,provenance_ref:subject.provenance_ref,target_release_ref:subject.target_release_ref,repair_plan_ref:subject.repair_plan_ref,rollback_target_ref:subject.rollback_target_ref,verification_policy_ref:subject.verification_policy_ref},missing:[]};
  }
  function dispatchInstallationAction(provider,action,invoker){
    const command=`cmd.installation.${action}`,runtime=window.PM_SETTINGS_RUNTIME_CONTEXT||{},host=runtime.execution_host_id||'Unresolved runtime host',environment=runtime.execution_environment_id||'Unresolved runtime environment';
    const commandState=installationCommandState(action,provider),subject=installationRequest(provider,action);
    let result;
    if(!commandState.available){
      result={mode:'blocked_command_availability',missing:['state.commands.installation_'+action+'.providers.'+provider.id+'.availability'],disabled_reason:commandState.disabledReason,disabled_reason_code:commandState.disabledReasonCode};
      try{window.dispatchEvent(new CustomEvent('pm7.settings.command.preview',{detail:{command_id:command,provider_id:provider.id,disabled_reason:commandState.disabledReasonCode,origin_surface:'settings',origin_route:'ai/providers/installation'}}));}catch(_e){}
    }else if(!subject.fields){
      result={mode:'blocked_subject_projection',missing:subject.missing};
      try{window.dispatchEvent(new CustomEvent('pm7.settings.command.preview',{detail:{command_id:command,provider_id:provider.id,missing:subject.missing,origin_surface:'settings',origin_route:'ai/providers/installation'}}));}catch(_e){}
    }else result=dispatchSettingsCommand(command,subject.fields,{origin_surface:'settings',origin_route:'ai/providers/installation',origin_action:action,provider_id:provider.id,return_surface:'settings',return_route:'ai/providers/installation',invoker});
    const pending=result.mode==='host_pending'||result.mode==='event_pending';
    const blocked=result.mode==='blocked_runtime_context'||result.mode==='blocked_subject_projection'||result.mode==='blocked_command_availability';
    const rejected=result.mode==='host_rejected'||result.mode==='host_error'||result.mode==='event_error';
    const instance=result.request?.command_instance_id||null;
    const disposition=pending?'Dispatched; awaiting owner result receipt':result.mode==='blocked_command_availability'?`Unavailable · ${result.disabled_reason}`:blocked?`Preview only; missing ${result.missing.join(', ')}`:rejected?`Owner did not accept: ${result.error||result.mode}`:result.mode==='host_result'?'Owner returned a terminal receipt; inspect its typed disposition':`Dispatch state: ${result.mode}`;
    infoDrawer(`${humanize(action)} ${provider.name}`,blocked?'The concept lacks an exact owner projection, so no production command was sent.':'Accepted dispatch is not terminal success; owner evidence and a result receipt decide the outcome.',[['Command',command],['Command instance',instance||'Preview only'],['Provider',provider.name],['Source display hint',provider.installSource],['Owner source ref',subject.fields?.official_source_ref||'Not projected'],['Host ID',host],['Environment ID',environment],['Return after operation','AI & Providers / Installation'],['Disposition',disposition]],{intro:'Installation, authentication, entitlement, catalog, invocation, readiness, and Usage remain separate states.'});
    if(instance&&(result.mode==='host_result'||rejected))requestAnimationFrame(()=>window.PM7_SETTINGS_TOME.consumeCommandResult(instance,result));
    return result;
  }
  function transferPrefixes(categories){
    const map={'AI providers & accounts':['ai.'],'Model routing':['ai.'],'Source control':['branching.','code.execution.'],'Notifications & sounds':['general.interaction.'],'Permissions':['safety.'],'Testing profiles':['planning.testing.'],'Appearance & input':['general.visual.','general.interaction.'],'Context & memory behavior':['memory.'],'Goals & personas':['planning.','personas.'],'Project & sync':['system.','code.execution.']};
    return [...new Set((categories||[]).flatMap(category=>map[category]||[]))];
  }
  function settingsCopySources(){
    const current=window.PM7_SETTINGS_TOME.project()?.id;
    const supplied=Array.isArray(window.PM_SETTINGS_PROJECT_CATALOG)?window.PM_SETTINGS_PROJECT_CATALOG:[];
    const valid=supplied.filter(row=>row&&typeof row.id==='string'&&row.id&&row.id!==current).map(row=>({value:row.id,label:String(row.label||row.id)}));
    return valid.length?valid:[{value:'project:settings-lab',label:'Settings Lab'},{value:'project:puppet-master-stable',label:'Puppet Master Stable'},{value:'project:concept-scratch',label:'Concept Scratch'}].filter(row=>row.value!==current);
  }
  function applyDetachedSettingsCopy(sourceProjectId,categories,options={}){
    const destination=window.PM7_SETTINGS_TOME.project();
    if(!destination)return {ok:false,reason:'Select or create the destination project before copying Settings.'};
    if(!sourceProjectId||sourceProjectId===destination.id)return {ok:false,reason:'Choose a different source project by stable project ID.'};
    const snapshot=window.PM7_SETTINGS_TOME.projectSnapshot(sourceProjectId);
    if(!snapshot||!snapshot.settings)return {ok:false,reason:'The selected project has no readable Settings snapshot.'};
    const canonical=new Set(Object.values(window.PM12_REFERENCE?.byCat||{}).flatMap(cat=>(cat.settings||[]).map(row=>row.id)));
    const prefixes=transferPrefixes(categories),credentialPolicy=String(options.credentials||'Keep existing destination credential ownership'),conflicts=String(options.conflicts||'Preview every changed value'),copied={};
    const sensitive=id=>/(?:credential|secret|password|api[-_.]?key|token|\.accounts?\b)/i.test(id);
    for(const [id,value] of Object.entries(snapshot.settings)){
      if(!canonical.has(id)||prefixes.length&&!prefixes.some(prefix=>id.startsWith(prefix)))continue;
      if(credentialPolicy!=='Reference compatible saved accounts'&&sensitive(id))continue;
      if(conflicts==='Keep destination on conflicts'&&Object.prototype.hasOwnProperty.call(state.settings,id))continue;
      copied[id]=clone(value);
    }
    if(!Object.keys(copied).length)return {ok:false,reason:'No canonical transferable values matched the selected categories and credential policy.'};
    const registry=window.PM_SETTINGS_REGISTRY,batch=registry&&registry.applyDetachedProjectCopy,receiptId=uid('settings-copy'),createRollback=options.rollback!==false;
    const prior={settings:clone(state.settings),changed:clone(state.changed)};
    let ownerResult=null,applied=copied,fixtureMode=!registry;
    if(registry){
      if(typeof batch!=='function')return {ok:false,reason:'The Settings owner does not expose the required atomic detached-copy transaction.'};
      ownerResult=batch({source_project_id:sourceProjectId,destination_project_id:destination.id,setting_values:clone(copied),conflict_behavior:conflicts,credential_policy:credentialPolicy,create_rollback:createRollback,inheritance:'detached'});
      if(ownerResult&&typeof ownerResult.then==='function')return {ok:false,reason:'The Settings owner must return an accepted transaction receipt before this concept updates its projection.'};
      if(!ownerResult||ownerResult.ok===false)return {ok:false,reason:ownerResult?.safe_user_message||ownerResult?.reason||'The Settings owner rejected the detached copy.'};
      if(ownerResult.applied_values&&typeof ownerResult.applied_values==='object')applied=ownerResult.applied_values;
    }else if(credentialPolicy==='Reference compatible saved accounts')return {ok:false,reason:'Compatible account references require the Settings owner; fixture fallback never copies credential or account references.'};
    for(const [id,value] of Object.entries(applied)){state.settings[id]=clone(value);state.changed[id]=true;}
    state.settingsTransferRollbacks=state.settingsTransferRollbacks||{};
    if(fixtureMode&&createRollback)state.settingsTransferRollbacks[receiptId]=prior;
    const rollbackRef=ownerResult?.rollback_ref||(fixtureMode&&createRollback?receiptId:null);
    state.settingsSourceSnapshot={source_project_id:sourceProjectId,destination_project_id:destination.id,copied_setting_ids:Object.keys(applied),copied_at:new Date().toISOString(),inheritance:'detached',receipt_id:ownerResult?.receipt_id||receiptId,rollback_ref:rollbackRef,fixture_mode:fixtureMode};
    saveState();window.PM7_SETTINGS_TOME.applyPaint(state);return {ok:true,count:Object.keys(applied).length,receiptId:ownerResult?.receipt_id||receiptId,rollbackRef,fixtureMode};
  }
  function rollbackDetachedSettingsCopy(historyIndex){
    const item=state.settingsTransferHistory[historyIndex];if(!item||!item.rollback_ref)return {ok:false,reason:'This transfer has no rollback snapshot.'};
    const registry=window.PM_SETTINGS_REGISTRY,ownerRollback=registry&&registry.rollbackDetachedProjectCopy;
    if(registry){const result=typeof ownerRollback==='function'?ownerRollback({project_id:window.PM7_SETTINGS_TOME.project()?.id,receipt_id:item.receipt_id,rollback_ref:item.rollback_ref}):null;if(!result||result.ok===false)return {ok:false,reason:result?.safe_user_message||result?.reason||'The Settings owner rejected rollback.'};if(result.restored_values)for(const [id,value] of Object.entries(result.restored_values))state.settings[id]=clone(value);}
    else {const prior=state.settingsTransferRollbacks?.[item.rollback_ref];if(!prior)return {ok:false,reason:'The fixture rollback snapshot is unavailable.'};state.settings=clone(prior.settings);state.changed=clone(prior.changed);delete state.settingsTransferRollbacks[item.rollback_ref];}
    saveState();renderApp();window.PM7_SETTINGS_TOME.applyPaint(state);return {ok:true};
  }""",
        need,
        "project display and command helpers",
    )
    copy_helpers = COPY_HELPERS_TEMPLATE.replace("__TRANSFER_CATEGORY_SETTING_IDS__", transfer_category_json)
    source = _replace_band(
        source,
        "  function transferPrefixes(categories){",
        "  function rollbackDetachedSettingsCopy(historyIndex){",
        copy_helpers,
        need,
        "exact detached Settings copy helpers",
    )
    source = _replace_band(
        source,
        "  function rollbackDetachedSettingsCopy(historyIndex){",
        "  const defaultState = {",
        r'''  function rollbackDetachedSettingsCopy(historyIndex){
    if(state.settingsProjectionReadOnly===true)return {ok:false,reason:'The attached Settings owner has not supplied a current readable project projection.'};
    const item=state.settingsTransferHistory[historyIndex];if(!item||!item.rollback_ref)return {ok:false,reason:'This transfer has no rollback snapshot.'};
    const registry=window.PM_SETTINGS_REGISTRY,ownerRollback=registry&&registry.rollbackDetachedProjectCopy;
    let receiptId=null;
    if(registry){
      if(typeof ownerRollback!=='function')return {ok:false,reason:'The Settings owner does not expose detached-copy rollback.'};
      const result=ownerRollback({project_id:window.PM7_SETTINGS_TOME.project()?.id,receipt_id:item.receipt_id,rollback_ref:item.rollback_ref});
      if(result&&typeof result.then==='function')return {ok:false,reason:'The Settings owner must return a terminal rollback receipt and effective values before this concept updates its projection.'};
      if(!result||result.ok===false)return {ok:false,reason:result?.safe_user_message||result?.reason||'The Settings owner rejected rollback.'};
      if(typeof result.receipt_id!=='string'||!result.receipt_id.trim())return {ok:false,reason:'The Settings owner did not return a durable rollback receipt ID.'};
      if(!result.restored_values||typeof result.restored_values!=='object'||Array.isArray(result.restored_values))return {ok:false,reason:'The Settings owner did not return the exact restored values.'};
      const provenance=state.settingsSourceSnapshot,allowed=new Set(provenance?.receipt_id===item.receipt_id?(provenance.copied_setting_ids||[]):[]),canonical=new Set(Object.values(window.PM12_REFERENCE?.byCat||{}).flatMap(cat=>(cat.settings||[]).map(row=>row.id))),entries=Object.entries(result.restored_values);
      if(!allowed.size||entries.some(([id])=>!allowed.has(id)||!canonical.has(id)||TRANSFER_CREDENTIAL_IDS.has(id)))return {ok:false,reason:'The Settings owner returned rollback values outside the validated detached-copy set.'};
      const nextSettings=clone(state.settings),nextChanged=clone(state.changed);for(const [id,value] of entries){nextSettings[id]=clone(value);nextChanged[id]=true;}state.settings=nextSettings;state.changed=nextChanged;receiptId=result.receipt_id;
    }else{
      const prior=state.settingsTransferRollbacks?.[item.rollback_ref];if(!prior)return {ok:false,reason:'The concept fixture rollback snapshot is unavailable.'};
      state.settings=clone(prior.settings);state.changed=clone(prior.changed);delete state.settingsTransferRollbacks[item.rollback_ref];receiptId=item.rollback_ref;
    }
    saveState();renderApp();window.PM7_SETTINGS_TOME.applyPaint(state);return {ok:true,receiptId};
  }
''',
        need,
        "typed detached-copy rollback",
    )
    source = source.replace("Project: Puppet Master", "Project: ${escapeHtml(projectDisplayName())} · concept fixture")
    source = source.replace("${icon('folder')} Puppet Master ${icon('down')}", "${icon('folder')} ${escapeHtml(projectDisplayName())} ${icon('down')}")
    narrow_count = len(re.findall(r"window\.innerWidth\s*<=\s*720", source))
    need(narrow_count == 4, "T44 host-width renderer anchor count %d" % narrow_count)
    source = re.sub(r"window\.innerWidth\s*<=\s*720", "hostIsNarrow()", source)
    source = source.replace(
        "Every project-level setting in one continuous, searchable page. Values can inherit, copy then diverge, or remain independent.",
        "Every project-level setting in one continuous, searchable page. Untouched fresh projects use Basic Dark; explicit saved themes win, and copied projects receive a detached snapshot that diverges independently.",
    )
    source = _replace_once(
        source,
        "    if (options.type === 'select') control = `<select class=\"form-select\" name=\"${escAttr(name)}\">${(options.choices || []).map(choice => `<option ${String(choice) === String(value) ? 'selected' : ''}>${escapeHtml(choice)}</option>`).join('')}</select>`;",
        "    if (options.type === 'select') control = `<select class=\"form-select\" name=\"${escAttr(name)}\">${(options.choices || []).map(choice => {const optionValue=choice&&typeof choice==='object'?choice.value:choice,optionLabel=choice&&typeof choice==='object'?choice.label:choice;return `<option value=\"${escAttr(optionValue)}\" ${String(optionValue) === String(value) ? 'selected' : ''}>${escapeHtml(optionLabel)}</option>`;}).join('')}</select>`;",
        need,
        "stable-id form choices",
    )
    source = _replace_once(
        source,
        "  function getDomain(id = state.domain) { return D.domains.find(d => d.id === id) || D.domains[0]; }",
        "  function releaseActionCallbacks(scope){if(!scope)return;const nodes=[];if(scope.nodeType===1&&scope.matches?.('[data-callback]'))nodes.push(scope);if(scope.querySelectorAll)nodes.push(...scope.querySelectorAll('[data-callback]'));for(const node of nodes)actionCallbacks.delete(node.dataset.callback);}\n  function installActionCallbackCleanup(){const observer=new MutationObserver(records=>{for(const record of records)for(const node of record.removedNodes)releaseActionCallbacks(node);});observer.observe(root,{childList:true,subtree:true});const portal=portalRoot();if(portal!==root)observer.observe(portal,{childList:true,subtree:true});}\n\n  function getDomain(id = state.domain) { return D.domains.find(d => d.id === id) || D.domains[0]; }",
        need,
        "portal callback lifecycle cleanup",
    )
    source = _replace_once(
        source,
        "  function renderSettingsWorkspace(workspace, domain) {",
        ALL_SETTINGS_RENDER + "\n  function renderSettingsWorkspace(workspace, domain) {",
        need,
        "virtualized All Settings renderer",
    )
    source = _replace_once(
        source,
        "    if (setting.control === 'stepper') return `<div class=\"stepper\"><button data-action=\"step-setting\" ${data} data-step=\"-1\">−</button><span class=\"stepper-value\">${escapeHtml(value)} ${escapeHtml(setting.unit || '')}</span><button data-action=\"step-setting\" ${data} data-step=\"1\">+</button></div>`;",
        "    if (setting.control === 'stepper') {const alpha=setting.id==='general.visual.glass-transparency',step=setting.step??(alpha ? .01 : 1),shown=alpha?`${Math.round(Number(value)*100)}%`:`${value} ${setting.unit||''}`.trim();return `<div class=\"stepper\"><button data-action=\"step-setting\" ${data} data-step=\"${-step}\">−</button><span class=\"stepper-value\">${escapeHtml(shown)}</span><button data-action=\"step-setting\" ${data} data-step=\"${step}\">+</button></div>`;}\n    if (setting.control === 'slider') {const raw=String(value??''),number=Number.parseFloat(raw),suffix=raw.replace(/^[-+]?\\d*\\.?\\d+\\s*/,''),current=Number.isFinite(number)?number:0,min=setting.min??0,max=setting.max??(suffix==='%'?100:Math.max(1,current*2)),step=setting.step??((max-min)>20?1:.01);return `<label class=\"slider-control\"><input type=\"range\" min=\"${min}\" max=\"${max}\" step=\"${step}\" value=\"${current}\" data-action=\"input-setting\" data-setting=\"${escAttr(setting.id)}\" data-value-suffix=\"${escAttr(suffix)}\"><output>${escapeHtml(`${current}${suffix}`)}</output></label>`;}",
        need,
        "canonical scalar stepper and slider controls",
    )
    source = _replace_once(
        source,
        "  function renderSettingsSection(section, workspace, index) {",
        r"""  function renderOwnerRedirects(section){
    const ids=(section.settings||[]).map(setting=>setting.id);
    if(!ids.some(id=>/^code\.execution\.(?:docker|container|registry|k8s)/.test(id)))return '';
    return `<div class="owner-redirects"><span>Container values stay ordinary project Settings; live containers and exact execution identities remain in their owners.</span><button class="btn" data-action="open-docker-manager">Open Docker Manager</button><button class="btn" data-action="open-hosts-manager">Open Hosts</button></div>`;
  }

  function renderSettingsSection(section, workspace, index) {""",
        need,
        "container owner redirects",
    )
    source = _replace_once(
        source,
        "      <div class=\"setting-list\">${section.settings.map(setting => renderSettingRow(setting, section, workspace)).join('')}</div>",
        "      ${renderOwnerRedirects(section)}<div class=\"setting-list\">${section.settings.map(setting => renderSettingRow(setting, section, workspace)).join('')}</div>",
        need,
        "container owner redirect placement",
    )
    source = _replace_once(
        source,
        "    if (setting.control === 'resource') return `<button class=\"btn\" data-action=\"open-resource-setting\" ${data}>${escapeHtml(value)} ${icon('chevron')}</button>`;",
        """    if (setting.control === 'number') {
      const raw=String(value??''),numeric=Number.parseFloat(raw),unit=raw.replace(/^[-+]?\\d*\\.?\\d+\\s*/,''),shown=Number.isFinite(numeric)?numeric:'';
      return `<label class="slider-control"><input class="text-control" type="number" step="any" value="${escAttr(shown)}" data-action="input-setting" data-value-suffix="${escAttr(unit)}" ${data}><output>${escapeHtml(unit||'number')}</output></label>`;
    }
    if (setting.control === 'number-inherited') {
      const numeric=Number(value);
      if(Number.isFinite(numeric))return `<label class="slider-control"><input class="text-control" type="number" step="any" value="${numeric}" data-action="input-setting" ${data}><output>override</output></label>`;
      return `<button class="btn" data-action="set-slider-override" ${data}>${escapeHtml(value==null?'Inherited / owner default':value)} · set numeric override</button>`;
    }
    if (setting.control === 'slider-inherited') {
      const numeric=Number(value);
      if(Number.isFinite(numeric)&&Number.isFinite(setting.min)&&Number.isFinite(setting.max))return `<label class="slider-control"><input type="range" min="${setting.min}" max="${setting.max}" step="${setting.step||.01}" value="${numeric}" data-action="input-setting" ${data}><output>${escapeHtml(numeric)}${escapeHtml(setting.unit||'')}</output></label>`;
      if(Number.isFinite(numeric))return `<label class="slider-control"><input class="text-control" type="number" step="any" value="${numeric}" data-action="input-setting" ${data}><output>override</output></label>`;
      return `<button class="btn" data-action="set-slider-override" ${data}>${escapeHtml(value==null?'Inherited / model default':value)} · set numeric override</button>`;
    }
    if (setting.control === 'slider') {
      const raw=Number.parseFloat(value),numeric=Number.isFinite(raw)?raw:0,unit=String(value??'').replace(String(raw),'').trim();
      const fractional=Math.abs(numeric)<=1,min=setting.min??0,max=setting.max??(fractional?1:Math.max(100,Math.ceil(Math.abs(numeric)*2))),step=setting.step??(fractional?.01:1);
      return `<label class="slider-control"><input type="range" min="${min}" max="${max}" step="${step}" value="${numeric}" data-action="input-setting" ${data}><output>${escapeHtml(numeric)}${escapeHtml(unit)}</output></label>`;
    }
    if (setting.control === 'path') return `<div class="path-control"><input class="text-control" value="${escAttr(value)}" data-action="input-setting" ${data}><button class="btn" data-action="browse-setting-path" ${data}>Browse</button></div>`;
    if (setting.control === 'list' || setting.control === 'keyvalue') {
      const count=Array.isArray(value)?value.length:(value&&typeof value==='object'?Object.keys(value).length:0);
      return `<button class="btn" data-action="open-structured-setting" ${data}>${count} ${setting.control==='list'?'items':'entries'} ${icon('chevron')}</button>`;
    }
    if (setting.control === 'credential') return `<button class="btn" data-action="manage-credential-reference" ${data}>Manage secure reference ${icon('chevron')}</button>`;
    if (setting.control === 'resource') return `<button class="btn" data-action="open-resource-setting" ${data}>${escapeHtml(value)} ${icon('chevron')}</button>`;""",
        need,
        "portable canonical control renderers",
    )
    source = _replace_once(
        source,
        "      if (w.type === 'settings') {\n        sections = (w.sections || []).map(s => ({ id: s.id, label: s.label }));\n        body = (w.sections || []).map((section, index) => renderSettingsSection(section, w, index)).join('');\n      } else {",
        "      if (w.type === 'settings') {\n        if (w.virtualAllSettings) {\n          sections = [{ id: 'all-settings', label: 'All Settings' }];\n          body = renderAllSettingsSection(w);\n        } else {\n          sections = (w.sections || []).map(s => ({ id: s.id, label: s.label }));\n          body = (w.sections || []).map((section, index) => renderSettingsSection(section, w, index)).join('');\n        }\n      } else {",
        need,
        "virtualized continuous workspace branch",
    )
    source = _replace_once(
        source,
        "    const found = findSettingInDomain(state.detailSetting, getDomain());\n    const { inspector } = getDetailNodes();",
        "    const found = findSettingInDomain(state.detailSetting, getDomain()) || findSettingGlobal(state.detailSetting);\n    const { inspector } = getDetailNodes();",
        need,
        "All Settings detail fallback",
    )
    source = _replace_once(
        source,
        "    armSectionReveal();\n    moveTabInks();",
        "    setupAllSettingsVirtual();\n    armSectionReveal();\n    moveTabInks();",
        need,
        "All Settings viewport setup",
    )
    source = _replace_once(
        source,
        "      sourceControl: renderSourceControl,",
        "      sourceControl: renderSourceControl,\n      browserScm: renderBrowserScm,",
        need,
        "browser SCM renderer route",
    )
    source = _replace_once(
        source,
        "  function renderSourceControl(){",
        BROWSER_SCM_RENDER + "\n  function renderSourceControl(){",
        need,
        "browser SCM manager",
    )
    source = _replace_band(source, "  function renderDoctor(){", "  function renderServers(){", DOCTOR_RENDER, need, "Doctor dependency projection")
    source = _replace_band(source, "  function renderServers(){", "  function renderUpdates(){", SERVER_RENDER, need, "server claim manager")
    source = _replace_band(
        source,
        "  function taskDrawer(title, steps, options = {}) {",
        "  function openMenu(anchor, items, title = '') {",
        r'''  function taskDrawer(title, steps, options = {}) {
    const taskId=uid('task');
    const body=`<div class="alert-strip info" id="${taskId}-summary">${icon('info')}<div><strong>Concept fixture preview</strong><br>This animation previews stages only. It does not run an owner command, prove readiness, or create a production receipt.</div></div><div class="workflow-list" id="${taskId}">${steps.map((step,i)=>workflowStep(i+1,step[0]||step,step[1]||'Preview only',i===0?'Previewing':'Queued','task-step-details',{task:taskId,index:i})).join('')}</div>`;
    openDrawer({title,subtitle:'Owner execution and terminal evidence remain outside this concept fixture.',body});
    const run=portalRoot().querySelector(`#${cssEscape(taskId)}`),summary=portalRoot().querySelector(`#${cssEscape(taskId)}-summary`);if(!run)return;
    [...run.querySelectorAll('.workflow-step')].forEach((node,index)=>setTimeout(()=>{const status=node.querySelector('.workflow-status');if(status)status.innerHTML='<span class="status-dot active"></span>Previewed';node.classList.add('is-complete');if(index===run.querySelectorAll('.workflow-step').length-1&&summary){summary.className='alert-strip info';summary.innerHTML=`${icon('info')}<div><strong>Concept preview complete</strong><br>No production state changed. Dispatch through the owning command and wait for its result receipt.</div>`;}},180+index*220));
  }
''',
        need,
        "non-authoritative concept task preview",
    )
    source = _replace_once(
        source,
        "pageHeader('archive','Data, Backup & Retention','Back up complete application state, manage destinations and schedules, verify backups, restore selectively, configure retention, and inspect receipts.'",
        "pageHeader('archive','Full Server Backup · concept fixture','Preserves the complete backup manager layout and exact inclusion boundary. Destinations, schedules, status, receipts, verification, restore, and cleanup require the Full Server Backup owner feed, which is not attached here.'",
        need,
        "Full Server Backup manager title and scope",
    )
    source = _replace_once(
        source,
        "<div class=\"stat-value\" style=\"font-size:13px\">Full state</div><div class=\"stat-note\">Settings, DB, Goals, history</div>",
        "<div class=\"stat-value\" style=\"font-size:13px\">Full Server</div><div class=\"stat-note\">Server, DB, Project and Vault</div>",
        need,
        "Full Server Backup coverage summary",
    )
    source = _replace_once(
        source,
        "${infoRow('Application databases','Included')}${infoRow('Settings','Included')}${infoRow('Provider credentials','Secure references')}${infoRow('Goal/chat state','Included')}${infoRow('Project metadata','Included')}${infoRow('Disposable caches','Excluded')}",
        "${infoRow('Server configuration','Included')}${infoRow('Databases and owner indexes','Included')}${infoRow('Project and Vault metadata','Included')}${infoRow('Histories and receipts','Included')}${infoRow('Credential material','Excluded; secure references only')}${infoRow('Disposable caches','Excluded')}",
        need,
        "Full Server Backup exact inclusion boundary",
    )
    source = source.replace("${renderStatus(h.result==='Verified'?'ready':'attention',h.result)}", "${renderStatus('attention','Fixture: '+h.result)}")
    source = source.replace("<div class=\"panel-title\">Latest verified receipt</div>", "<div class=\"panel-title\">Latest fixture receipt example</div>")
    source = source.replace("${infoRow('Latest verified',B.history[0]?.receipt||'None')}", "${infoRow('Fixture receipt example',B.history[0]?.receipt||'None')}")
    source = source.replace("<div class=\"panel-title\">Backup destinations</div>", "<div class=\"panel-title\">Backup destinations · concept fixture</div>")
    source = source.replace("<div class=\"panel-title\">Backup schedules</div>", "<div class=\"panel-title\">Backup schedules · concept fixture</div>")
    source = source.replace("<div class=\"panel-title\">Backup history</div>", "<div class=\"panel-title\">Backup history · concept fixture</div>")
    source = source.replace("<div class=\"stat-label\">Latest backup</div><div class=\"stat-value\" style=\"font-size:13px\">${escapeHtml(B.history[0]?.result||'None')}</div>", "<div class=\"stat-label\">Fixture backup example</div><div class=\"stat-value\" style=\"font-size:13px\">${escapeHtml(B.history[0]?.result||'None')}</div>")
    source = _replace_once(
        source,
        "projectSync:{serverHost:'Home TrueNAS',executionHost:'Windows WSL',location:",
        "projectSync:{serverHost:'Home TrueNAS',executionHost:'Windows WSL',executionEnvironment:'WSL2 · Ubuntu',location:",
        need,
        "exact execution environment fixture",
    )
    source = _replace_once(
        source,
        "settingsTransferHistory:[{time:'Today · 9:18 AM',action:'Copied from Settings Lab',categories:6,result:'Applied with preview'},{time:'Yesterday',action:'Exported project settings',categories:10,result:'Encrypted archive'}],",
        "settingsTransferHistory:[{time:'Today · 9:18 AM',action:'Copied from Settings Lab',source_project_id:'project:settings-lab',categories:6,result:'Historical concept fixture; rollback not created',receipt_id:null,rollback_ref:null,rollback_available:false,fixture_mode:true},{time:'Yesterday',action:'Exported project settings',categories:10,result:'Encrypted archive',receipt_id:null,rollback_ref:null,rollback_available:false}],settingsTransferRollbacks:{},",
        need,
        "truthful settings transfer fixture history",
    )
    source = _replace_once(
        source,
        "${infoRow('Installed', provider.installed ? 'Yes' : 'No')}${infoRow('Version', provider.version)}${infoRow('Source', provider.installSource)}${infoRow('Host', 'Current execution host')}",
        "${infoRow('Owner installation projection', providerOwnerInstalled(provider) ? 'Installation ID supplied' : 'No installation ID supplied')}${infoRow('Fixture catalog hint', provider.installed ? 'Installed example' : 'Not installed example')}${infoRow('Version hint', provider.version)}${infoRow('Official source display hint', provider.installSource)}${infoRow('Host', state.projectSync.executionHost)}${infoRow('Environment', state.projectSync.executionEnvironment)}${infoRow('Return after operation', 'AI & Providers / Installation')}",
        need,
        "provider Host Environment and continuation disclosure",
    )
    source = _replace_once(
        source,
        "<article class=\"stat-card\"><div class=\"stat-label\">Connection state</div><div class=\"stat-value\">${provider.status === 'active' ? 'Ready' : provider.installed ? 'Needs attention' : 'Not installed'}</div><div class=\"stat-note\">Authentication and invocation are checked separately.</div></article>",
        "<article class=\"stat-card\"><div class=\"stat-label\">Owner installation state</div><div class=\"stat-value\">${providerOwnerInstalled(provider)?'Installation ID supplied':'Not projected'}</div><div class=\"stat-note\">The account, model, and health counts beside this card are concept fixtures until their owners attach.</div></article>",
        need,
        "truthful provider overview state",
    )
    source = _replace_once(
        source,
        "${infoRow('Installed', provider.installed ? 'Yes' : 'No')}",
        "${infoRow('Owner installation', providerOwnerInstalled(provider)?'Installation ID supplied':'Not projected')}${infoRow('Fixture installed hint',provider.installed?'Yes':'No')}",
        need,
        "provider overview owner and fixture split",
    )
    source = _replace_once(
        source,
        "<div class=\"panel-subtitle\">Each action changes or validates real provider fixture state.</div>",
        "<div class=\"panel-subtitle\">Install, Repair, and Verify dispatch only from provider-bound owner projections; other controls below are labeled concept fixtures.</div>",
        need,
        "provider quick-action authority disclosure",
    )
    source = _replace_once(
        source,
        "${provider.installed ? `<button class=\"btn\" data-action=\"provider-tab-jump\" data-tab=\"accounts\">${icon('users')} Manage accounts</button><button class=\"btn\" data-action=\"provider-tab-jump\" data-tab=\"models\">${icon('brain')} Review exact models</button><button class=\"btn\" data-action=\"provider-tab-jump\" data-tab=\"routing\">${icon('route')} Configure routing & fallback</button>` : `<button class=\"btn primary\" data-action=\"install-provider\" data-provider=\"${provider.id}\">${icon('download')} Install from official provider</button>`}",
        "${providerOwnerInstalled(provider)?`<button class=\"btn\" data-action=\"provider-tab-jump\" data-tab=\"accounts\">${icon('users')} Open account fixture</button><button class=\"btn\" data-action=\"provider-tab-jump\" data-tab=\"models\">${icon('brain')} Open model fixture</button><button class=\"btn\" data-action=\"provider-tab-jump\" data-tab=\"routing\">${icon('route')} Open routing fixture</button>`:`<button class=\"btn primary\" ${installationActionAttrs('install',provider)} data-action=\"install-provider\" data-provider=\"${provider.id}\">${icon('download')} Install from official provider</button>`}",
        need,
        "provider overview actions from owner installation projection",
    )
    source = _replace_once(
        source,
        "['Installation detected', provider.installed ? 'ready' : 'blocked', provider.installed ? provider.version : 'Install required'],",
        "['Owner installation projection', providerOwnerInstalled(provider)?'ready':'blocked', providerOwnerInstalled(provider)?'Installation ID supplied':'No provider-bound installation ID'],",
        need,
        "provider diagnostic installation truth",
    )

    source = _replace_once(
        source,
        "${provider.installed ? `<button class=\"btn\" data-action=\"check-provider-update\" data-provider=\"${provider.id}\">${icon('refresh')} Check for update</button><button class=\"btn\" data-action=\"repair-provider\" data-provider=\"${provider.id}\">${icon('test')} Repair / verify</button><button class=\"btn danger\" data-action=\"uninstall-provider\" data-provider=\"${provider.id}\">${icon('trash')} Uninstall</button>` :",
        "${providerOwnerInstalled(provider) ? `<button class=\"btn\" data-action=\"check-provider-update\" data-provider=\"${provider.id}\">${icon('refresh')} Check for update</button><button class=\"btn\" ${installationActionAttrs('repair',provider)} data-action=\"repair-provider\" data-provider=\"${provider.id}\">${icon('refresh')} Repair</button><button class=\"btn\" ${installationActionAttrs('verify',provider)} data-action=\"verify-provider\" data-provider=\"${provider.id}\">${icon('test')} Verify</button>` :",
        need,
        "separate provider Repair and Verify",
    )
    install_button = '<button class="btn primary" data-action="install-provider"'
    need(source.count(install_button) == 1, "T44 provider installation-tab install button anchor count changed")
    source = source.replace(install_button, '<button class="btn primary" ${installationActionAttrs(\'install\',provider)} data-action="install-provider"')
    empty_install = 'actionLabel ? `<div class="empty-actions"><button class="btn primary" data-action="${action}" '
    need(source.count(empty_install) == 1, "T44 empty-manager install anchor count changed")
    source = source.replace(empty_install, 'actionLabel ? `<div class="empty-actions"><button class="btn primary" ${action===\'install-provider\'?installationActionAttrs(\'install\',providerById(data.provider)):\'\'} data-action="${action}" ')
    old_menu = "const p=providerById(ds(el,'provider'));openMenu(el,[{label:'Manage accounts',icon:'users',onClick:()=>{state.providerTab='accounts';rerender();}},{label:'Models & capabilities',icon:'brain',onClick:()=>{state.providerTab='models';rerender();}},{label:'Routing & fallback',icon:'route',onClick:()=>{state.providerTab='routing';rerender();}},{label:'Installation & updates',icon:'download',onClick:()=>{state.providerTab='installation';rerender();}},{label:'Export diagnostics',icon:'download',onClick:()=>dispatchAction('export-provider-diagnostics',el,event)},{separator:true},{label:'Uninstall provider',icon:'trash',danger:true,disabled:p.id==='free-models'||!p.installed,onClick:()=>dispatchAction('uninstall-provider',el,event)}],p.name);return;"
    new_menu = "const p=providerById(ds(el,'provider')),repairCommand=installationCommandState('repair',p),verifyCommand=installationCommandState('verify',p);openMenu(el,[{label:'Manage accounts',icon:'users',onClick:()=>{state.providerTab='accounts';rerender();}},{label:'Models & capabilities',icon:'brain',onClick:()=>{state.providerTab='models';rerender();}},{label:'Routing & fallback',icon:'route',onClick:()=>{state.providerTab='routing';rerender();}},{label:'Installation & updates',icon:'download',onClick:()=>{state.providerTab='installation';rerender();}},{label:'Repair installation',icon:'refresh',ariaDisabled:!repairCommand.available,meta:repairCommand.available?'':repairCommand.disabledReason,onClick:()=>dispatchAction('repair-provider',el,event)},{label:'Verify readiness',icon:'test',ariaDisabled:!verifyCommand.available,meta:verifyCommand.available?'':verifyCommand.disabledReason,onClick:()=>dispatchAction('verify-provider',el,event)},{label:'Export diagnostics',icon:'download',onClick:()=>dispatchAction('export-provider-diagnostics',el,event)}],p.name);return;"
    source = _replace_once(source, old_menu, new_menu, need, "provider menu without Uninstall")
    source = _replace_once(
        source,
        "${item.disabled ? 'disabled' : ''}>${icon(item.icon || 'settings')}",
        "${item.disabled ? `disabled aria-disabled=\"true\" data-pm-hover-label=\"${escAttr(item.label+' unavailable')}\" data-pm-hover-detail=\"${escAttr(item.meta||'Unavailable')}\"` : item.ariaDisabled ? `aria-disabled=\"true\" data-pm-hover-label=\"${escAttr(item.label+' unavailable')}\" data-pm-hover-detail=\"${escAttr(item.meta||'Unavailable')}\" aria-label=\"${escAttr(item.label+' unavailable: '+(item.meta||'Unavailable'))}\"` : ''}>${icon(item.icon || 'settings')}",
        need,
        "disabled menu action reason",
    )
    source = _replace_band(
        source,
        "      case 'uninstall-provider': {",
        "      case 'export-provider-diagnostics':",
        "      case 'verify-provider': {const p=providerById(ds(el,'provider'));dispatchInstallationAction(p,'verify',el);return;}\n",
        need,
        "remove provider Uninstall action",
    )
    source = _replace_once(
        source,
        "      case 'install-provider': {\n        const p=providerById(ds(el,'provider'));taskDrawer(`Install ${p.name}`,[['Verify official provider source',p.installSource],['Download and verify package','No silent install'],['Install on selected execution host','Preserve installation receipt'],['Detect CLI or connection','Then offer sign-in']],{onComplete:()=>{p.installed=true;p.version='Installed · verification pending';p.status='attention';p.statusLabel='Installed · Sign in';p.diagnostics.push('Official installation completed in concept session');saveState();}});return;\n      }",
        "      case 'install-provider': {const p=providerById(ds(el,'provider'));dispatchInstallationAction(p,'install',el);return;}",
        need,
        "typed provider install command",
    )
    source = _replace_once(
        source,
        "      case 'repair-provider': {\n        const p=providerById(ds(el,'provider'));taskDrawer(`Repair ${p.name}`,[['Preserve account and routing settings','No credential export'],['Recheck installation','Official source'],['Reconnect supported authentication','No unsupported OAuth'],['Retest exact model endpoint',p.routing.defaultModel||'First enabled model']],{onComplete:()=>{p.status=p.signedIn?'active':'attention';p.statusLabel=p.signedIn?`Active · ${p.accounts.length} account${p.accounts.length===1?'':'s'}`:'Installed · Sign in';saveState();}});return;\n      }",
        "      case 'repair-provider': {const p=providerById(ds(el,'provider'));dispatchInstallationAction(p,'repair',el);return;}",
        need,
        "typed provider repair command",
    )

    remote_branch = r'''if(state.projectSyncTab==='remote')return `<section class="panel-card"><div class="panel-title-row"><div><div class="panel-title">SSH remotes and remote projects · concept fixture</div><div class="panel-subtitle">The Project Sync owner feed is not attached. These example identities preserve the CRUD layout; every control below opens a preview and cannot claim currentness or mutate production state.</div></div><button class="btn primary" data-action="add-ssh-remote">${icon('plus')} Preview add SSH remote</button><button class="btn" data-action="import-remote-project">${icon('download')} Preview import</button></div><table class="data-table"><thead><tr><th>Remote</th><th>Type</th><th>Address</th><th>Projection</th><th></th></tr></thead><tbody>${P.remotes.map(r=>`<tr><td>Example · ${escapeHtml(r.name)}</td><td>${escapeHtml(r.type)}</td><td>${escapeHtml(r.address)}</td><td>${renderStatus('attention','Fixture: '+r.status)}</td><td><button class="btn small" data-action="edit-ssh-remote" data-id="${r.id}">Preview edit</button><button class="btn small" data-action="test-ssh-remote" data-id="${r.id}">Preview test</button><button class="btn small" data-action="toggle-ssh-remote" data-id="${r.id}">Preview ${r.status==='disabled'?'enable':'disable'}</button><button class="btn small" data-action="remove-ssh-remote" data-id="${r.id}">Preview remove</button></td></tr>`).join('')}</tbody></table><div class="alert-strip info" style="margin-top:12px">${icon('info')}<div>Production authentication remains in the credential store or SSH agent, host keys remain strict, and the Project Sync owner must return current state and receipts. No fixture control copies secrets or changes a remote.</div></div></section>`;'''
    source = _replace_band(source, "if(state.projectSyncTab==='remote')return", "if(state.projectSyncTab==='move')return", remote_branch, need, "SSH remote CRUD")

    source = _replace_once(
        source,
        "      case 'add-ssh-remote': case 'import-remote-project': {",
        "      case 'edit-ssh-remote': {const r=state.projectSync.remotes.find(x=>x.id===ds(el,'id'));if(!r)return;openDialog({title:`Preview edit · ${r.name}`,subtitle:'Concept fixture only. The Project Sync owner is not attached, so this form cannot save or establish currentness.',body:formGrid([{label:'Name',name:'name',value:r.name},{label:'Type',name:'type',value:r.type,type:'select',choices:['SSH remote','Mounted storage','Hosted repository']},{label:'Address / path',name:'address',value:r.address},{label:'Requested state',name:'status',value:r.status,type:'select',choices:['ready','disabled','attention']}]),saveLabel:'Review preview',onSave:()=>{showToast('SSH edit preview complete','No remote identity or owner state changed.','info');}});return;}\n      case 'test-ssh-remote': {const r=state.projectSync.remotes.find(x=>x.id===ds(el,'id'));if(r)taskDrawer(`Preview test · ${r.name}`,[['Resolve exact Host and Environment',r.address],['Verify host key','Strict'],['Verify credential reference','No secret export'],['Read-only discovery','No local fallback'],['Require owner currentness receipt','Owner feed not attached']]);return;}\n      case 'toggle-ssh-remote': {const r=state.projectSync.remotes.find(x=>x.id===ds(el,'id'));if(r)showToast('SSH state-change preview',`${r.name} would request ${r.status==='disabled'?'enable':'disable'} from the Project Sync owner; no state changed.`,'info');return;}\n      case 'remove-ssh-remote': {const r=state.projectSync.remotes.find(x=>x.id===ds(el,'id'));if(!r)return;confirmDialog(`Preview removal · ${r.name}`,'The owner would first check active projects, Goals, mounts, and continuity references. This concept removes nothing.', 'Review preview',()=>showToast('Removal preview complete','No remote, file, credential, or owner state changed.','info'),true);return;}\n      case 'add-ssh-remote': case 'import-remote-project': {",
        need,
        "SSH CRUD handlers",
    )
    source = _replace_once(
        source,
        "onSave:(_v,form)=>{const v=readForm(form);state.projectSync.remotes.push({id:uid('remote',v.name),name:v.name,type:v.type,address:v.address,status:'ready'});saveState();renderApp();showToast('Remote project location saved',`${v.name} is ready for continuity and sync testing.`);}",
        "onSave:(_v,form)=>{const v=readForm(form);showToast('Remote preview complete',`${v.name} was not saved; the Project Sync owner feed is not attached.`,'info');}",
        need,
        "SSH add and import preview-only fixture",
    )
    source = _replace_once(
        source,
        "      case 'edit-project-location': case 'add-project-location': editProjectSync('location');return;\n      case 'manage-clients': editProjectSync('clients');return;\n      case 'edit-continuity': editProjectSync('continuity');return;",
        "      case 'edit-project-location': case 'add-project-location': infoDrawer('Project authority preview','Concept fixture only. The Project Sync owner must supply current locations and accept any authority mutation.',[['Fixture project location',state.projectSync.location],['Fixture server host',state.projectSync.serverHost],['Fixture execution host',state.projectSync.executionHost],['Currentness','Owner feed not attached'],['Mutation','Not performed']]);return;\n      case 'manage-clients': infoDrawer('Clients & continuity preview','Concept fixture only; client enrollment and continuity eligibility remain in the Project Sync owner.',state.projectSync.clients.map(c=>['Example · '+c.name,`${c.platform} · fixture ${c.status} · ${c.role}`]));return;\n      case 'edit-continuity': infoDrawer('Continuity preview','Concept fixture only; these toggles are examples and cannot mutate durable continuity policy.',Object.entries(state.projectSync.continuity).map(([k,v])=>[humanize(k),`Fixture: ${v?'on':'off'}`]));return;",
        need,
        "Project Sync owner-unattached mutation fence",
    )
    source = _replace_once(
        source,
        "state.transferCategories=listValue(v.categories);openDrawer({title:'Settings copy preview'",
        "state.transferCategories=listValue(v.categories);const prepared=prepareDetachedSettingsCopy(v.source,state.transferCategories,{credentials:v.credentials,conflicts:v.conflicts,rollback:v.rollback});if(!prepared.ok){showToast('Settings copy preview unavailable',prepared.reason,'warning');return false;}openDrawer({title:'Settings copy preview'",
        need,
        "detached Settings copy validation before preview",
    )
    source = _replace_once(
        source,
        "${state.transferCategories.map((c,i)=>workflowStep(i+1,c,'Compare source, destination, inheritance, and owner','Ready','open-transfer-category',{category:c})).join('')}",
        "<div data-settings-copy-preview>${settingsCopyPreviewPage(prepared,0)}</div>",
        need,
        "per-setting detached Settings diff preview",
    )
    source = _replace_once(
        source,
        "Provider credentials remain in their existing secure owner. The copy applies selected references and settings, then the destination can diverge independently.",
        "${prepared.changes.length} changed canonical values were compared. Credential material is never copied; compatible account references are reconciled only by the Settings owner when requested. The destination receives a detached snapshot and diverges independently.",
        need,
        "detached Settings preview custody disclosure",
    )
    source = _replace_once(
        source,
        "onPrimary:()=>{state.settingsTransferHistory.unshift({time:`Today · ${nowLabel()}`,action:`Copied from ${v.source}`,categories:state.transferCategories.length,result:'Applied with preview'});saveState();renderApp();showToast('Settings copied',`${state.transferCategories.length} categories applied with rollback receipt.`);}",
        "onPrimary:()=>{const applied=applyDetachedSettingsCopy(v.source,state.transferCategories,{credentials:v.credentials,conflicts:v.conflicts,rollback:v.rollback});if(!applied.ok){showToast('Settings were not copied',applied.reason,'error');return false;}state.settingsTransferHistory.unshift({time:`Today · ${nowLabel()}`,action:`Copied from ${v.source}`,source_project_id:v.source,categories:state.transferCategories.length,result:`Detached snapshot · ${applied.count} values${applied.fixtureMode?' · concept fixture':''}`,receipt_id:applied.receiptId,rollback_ref:applied.rollbackRef,rollback_available:!!applied.rollbackRef,fixture_mode:applied.fixtureMode});saveState();renderApp();showToast('Settings copied',`${applied.count} canonical project values copied as a detached snapshot.`);return true;}",
        need,
        "detached settings snapshot copy",
    )
    source = _replace_once(
        source,
        "{label:'Source project',name:'source',value:'Settings Lab',type:'select',choices:['Settings Lab','Puppet Master Stable','Concept Scratch']}",
        "{label:'Source project',name:'source',value:settingsCopySources()[0]?.value||'',type:'select',choices:settingsCopySources()}",
        need,
        "stable settings copy source id",
    )
    source = _replace_once(
        source,
        "${infoRow('Source','Settings Lab')}${infoRow('Destination','Puppet Master')}${infoRow('Conflict behavior','Review differences')}${infoRow('Credentials','Keep destination credentials')}${infoRow('Resource references','Reconnect when needed')}${infoRow('Rollback','Create snapshot')}",
        "${settingsTransferProvenanceHtml()}",
        need,
        "detached Settings source provenance card",
    )
    source = _replace_once(
        source,
        "state.transferCategories=['AI providers & accounts','Model routing','Source control','Notifications & sounds','Permissions','Testing profiles','Appearance & desktop','Memory & automation','Projects & sync','System behavior'];",
        "state.transferCategories=['AI providers & accounts','Model routing','Source control','Notifications & sounds','Permissions','Testing profiles','Appearance & input','Context & memory behavior','Goals & personas','Project & sync'];",
        need,
        "settings copy category registry alignment",
    )
    source = _replace_once(
        source,
        "<button class=\"btn small\" data-action=\"open-transfer-receipt\" data-index=\"${i}\">Open</button><button class=\"btn small\" data-action=\"rollback-settings-transfer\" data-index=\"${i}\">Roll back</button>",
        "<button class=\"btn small\" data-action=\"open-transfer-receipt\" data-index=\"${i}\">Open</button>${h.rollback_available?`<button class=\"btn small\" data-action=\"rollback-settings-transfer\" data-index=\"${i}\">Roll back</button>`:''}",
        need,
        "settings transfer rollback availability control",
    )
    source = _replace_once(
        source,
        "const h=state.settingsTransferHistory[Number(ds(el,'index'))];infoDrawer('Settings transfer receipt','Source, categories, preview, applied values, owner references, and rollback remain inspectable.',[['Time',h?.time],['Action',h?.action],['Categories',h?.categories],['Result',h?.result],['Rollback','Available'],['Credential material','Not exported']]);return;",
        "const h=state.settingsTransferHistory[Number(ds(el,'index'))];infoDrawer('Settings transfer receipt','Source, categories, applied values, owner references, and actual rollback availability remain inspectable.',[['Time',h?.time],['Action',h?.action],['Source project ID',h?.source_project_id],['Categories',h?.categories],['Result',h?.result],['Receipt',h?.receipt_id],['Rollback',h?.rollback_available?'Available':'Not created'],['Credential material','Not exported']]);return;",
        need,
        "truthful settings copy receipt",
    )
    source = _replace_once(
        source,
        "const h=state.settingsTransferHistory[Number(ds(el,'index'))];confirmDialog('Roll back settings transfer',`Restore values from before “${h?.action}”? Current changed values will be previewed first.`, 'Preview rollback',()=>showToast('Rollback preview ready','No setting was changed until confirmation.','info'));return;",
        "const index=Number(ds(el,'index')),h=state.settingsTransferHistory[index];if(!h?.rollback_available){showToast('Rollback unavailable','This receipt has no owner or fixture rollback snapshot.','warning');return;}confirmDialog('Roll back settings transfer',`Restore the snapshot from before “${h.action}”?`, 'Restore snapshot',()=>{const result=rollbackDetachedSettingsCopy(index);showToast(result.ok?'Settings restored':'Rollback failed',result.ok?'The detached-copy snapshot was restored.':result.reason,result.ok?'success':'error');});return;",
        need,
        "functional settings copy rollback",
    )

    source = _replace_band(
        source,
        "      case 'backup-tab': switchManagerTab(el);return;",
        "      /* Doctor, Servers, Updates */",
        r'''      case 'backup-tab': switchManagerTab(el);return;
      case 'add-backup-destination': case 'edit-backup-schedule': case 'add-backup-schedule': {
        const schedule=action.includes('schedule');openDialog({title:`Preview ${action==='add-backup-destination'?'backup destination':schedule?'backup schedule':'backup configuration'}`,subtitle:'Concept fixture only. The Full Server Backup owner feed is not attached; this form cannot save, verify, or establish readiness.',body:formGrid(schedule?[{label:'Schedule name',name:'name',value:'Example schedule',autofocus:true},{label:'When',name:'when',value:'2:00 AM'},{label:'Destination',name:'destination',value:state.backup.destinations[0]?.name||'Owner destination required'},{label:'Retention',name:'retention',value:'30 daily'}]:[{label:'Destination name',name:'name',value:'Example destination',autofocus:true},{label:'Type',name:'type',value:'Network storage'},{label:'Path / bucket',name:'path',value:'/owner/path'},{label:'Encryption',name:'encryption',value:'Required'}]),saveLabel:'Review preview',onSave:()=>showToast('Backup configuration preview complete','No destination, schedule, readiness state, or owner receipt changed.','info')});return;
      }
      case 'backup-destination-menu': {
        const d=state.backup.destinations.find(x=>x.id===ds(el,'id'));if(!d)return;openMenu(el,[{label:'Preview configuration',icon:'edit',onClick:()=>dispatchAction('add-backup-destination',el,event)},{label:'Preview write and restore test',icon:'test',onClick:()=>taskDrawer(`Preview test · ${d.name}`,[['Resolve owner destination',d.path],['Require encrypted write','Owner not attached'],['Require isolated restore and hash','No fixture execution'],['Require durable receipt','No receipt created']])},{label:'View exact coverage',icon:'eye',onClick:()=>dispatchAction('view-backup-coverage',el,event)},{label:'Preview safe removal',icon:'trash',danger:true,onClick:()=>showToast('Removal preview complete','No destination or backup data changed.','info')}],`Fixture · ${d.name}`);return;
      }
      case 'toggle-backup-schedule': showToast('Schedule change preview','No schedule changed; the Full Server Backup owner feed is not attached.','info');return;
      case 'run-backup': taskDrawer('Preview Full Server backup',[['Resolve exact owner destination','Owner feed not attached'],['Snapshot server configuration and databases','Preview only'],['Include Project and Vault metadata, histories, receipts, and indexes','Preview only'],['Exclude raw credentials and disposable caches','Required boundary'],['Require verification and durable receipt','No production receipt created']]);return;
      case 'verify-latest-backup': taskDrawer('Preview backup verification',[['Resolve an owner receipt','Fixture example is not admissible'],['Verify manifest, signatures, and hashes','Preview only'],['Run isolated restore test','Preview only'],['Check compatibility','Preview only'],['Require terminal verification receipt','No production receipt created']]);return;
      case 'view-backup-coverage': infoDrawer('Full Server Backup coverage','Canonical inclusion boundary; this is not a current backup projection.',[['Server configuration','Included by policy'],['Databases and owner indexes','Included by policy'],['Project and Vault metadata','Included by policy'],['Histories and receipts','Included by policy'],['Credential material','Excluded; secure references only'],['Disposable caches','Excluded'],['Currentness','Owner feed not attached']]);return;
      case 'edit-backup-retention': case 'review-backup-cleanup': infoDrawer('Backup retention and cleanup preview','Concept fixture only. The owner must project candidates, protection, recovery value, and deletion receipts before any mutation.',[['Fixture retention',JSON.stringify(state.backup.retention)],['Currentness','Owner feed not attached'],['Deleted','Nothing']]);return;
      case 'start-restore': case 'configure-granular-restore': openDialog({title:'Preview Full Server restore',subtitle:'Concept fixture only. Choose example scope and destination; no backup is verified and no restore can start without the owner.',wide:true,body:formGrid([{label:'Fixture receipt example',name:'backup',value:state.backup.history[0]?.receipt||'No owner receipt'},{label:'Restore scope',name:'scope',value:'Full Server',type:'select',choices:['Full Server','Settings only','Project and Vault metadata','Selected data families']},{label:'Restore destination',name:'destination',value:'Isolated verification location'},{label:'Require current-state safety backup',name:'safety',value:true,type:'checkbox',full:true},{label:'Require verification before authority switch',name:'verify',value:true,type:'checkbox',full:true}]),saveLabel:'Review preview',onSave:(_v,form)=>{const v=readForm(form);openDrawer({title:'Restore preview only',subtitle:'No owner receipt is attached and no data changed.',body:`<div class="workflow-list">${workflowStep(1,'Resolve and verify owner backup',v.backup,'Fixture','generic-workflow-detail',{action})}${workflowStep(2,'Create current-state safety backup',v.safety?'Required':'Not requested','Preview','generic-workflow-detail',{action})}${workflowStep(3,'Restore selected scope',v.scope,'Not run','generic-workflow-detail',{action})}${workflowStep(4,'Verify isolated destination',v.destination,'Not run','generic-workflow-detail',{action})}${workflowStep(5,'Switch or roll back','Owner receipt required','Not run','generic-workflow-detail',{action})}</div>`});return false;}});return;
      case 'open-backup-receipt': {
        const h=state.backup.history[Number(ds(el,'index'))];infoDrawer(`Fixture receipt example · ${h?.receipt||'none'}`,'Seeded concept data only; it is not an owner receipt and proves no backup or restore result.',[['Example time',h?.time],['Example type',h?.type],['Example destination',h?.destination],['Example size',h?.size],['Example result',h?.result],['Currentness','Owner feed not attached'],['Restore test','Not run by this concept']]);return;
      }
      case 'backup-receipt-menu': {const h=state.backup.history[Number(ds(el,'index'))];openMenu(el,[{label:'Open fixture example',icon:'file',onClick:()=>dispatchAction('open-backup-receipt',el,event)},{label:'Preview verification',icon:'test',onClick:()=>dispatchAction('verify-latest-backup',el,event)},{label:'Preview restore',icon:'restore',onClick:()=>dispatchAction('start-restore',el,event)}],`Fixture · ${h?.receipt||'backup'}`);return;}
      case 'export-backup-history': showToast('Backup export preview','No owner history is attached and no production receipt export was created.','info');return;
''',
        need,
        "Full Server Backup preview-only fixture handlers",
    )

    source = _replace_band(
        source,
        "      /* Doctor, Servers, Updates */",
        "      case 'updates-tab': switchManagerTab(el);return;",
        r'''      /* Readiness projection, server claim/bootstrap, and updates */
      case 'server-tab': switchManagerTab(el);return;
      case 'open-server-claim': openDialog({title:'Claim existing server',subtitle:'Bind exact server, Host, Environment, trust proof, project/Vault identity, topology generation, and rollback.',wide:true,body:formGrid([{label:'Server endpoint',name:'endpoint',value:'wss://truenas.home:7443',autofocus:true},{label:'Host identity',name:'host',value:'truenas.home'},{label:'Environment',name:'environment',value:'Linux container · server'},{label:'Project authority',name:'authority',value:state.projectSync.location},{label:'Verify before claim',name:'verify',value:true,type:'checkbox',full:true}]),saveLabel:'Preview claim',onSave:()=>{showToast('Claim preview ready','No ownership changed; review proof and topology before approval.','info');}});return;
      case 'open-server-bootstrap': openDialog({title:'Bootstrap server',subtitle:'Visibility is not consent. Preview official source, exact target, storage, migration, sync, clients, verification, and rollback.',wide:true,body:formGrid([{label:'Target Host',name:'host',value:'New server host',autofocus:true},{label:'Target Environment',name:'environment',value:'Native Linux',type:'select',choices:['Native Linux','Linux container','Windows WSL2','SSH remote']},{label:'Official source',name:'source',value:'Signed Puppet Master release'},{label:'Project and Vault bind',name:'bind',value:'After verified deployment'},{label:'Create rollback point',name:'rollback',value:true,type:'checkbox',full:true}]),saveLabel:'Preview bootstrap',onSave:()=>{showToast('Bootstrap preview ready','No download, install, sync, or authority switch occurred.','info');}});return;
      case 'add-server-host': case 'edit-server-host': openDialog({title:action==='add-server-host'?'Preview add Host and Environment':'Preview edit Host and Environment',subtitle:'Concept fixture only. Readiness and installation are scoped to the exact Host/Environment pair, and the server owner feed is not attached.',body:formGrid([{label:'Host identity',name:'host',value:ds(el,'id')||'host-name',autofocus:true},{label:'Environment',name:'environment',value:'Native',type:'select',choices:['Native','WSL2','Container','Kubernetes','SSH']},{label:'Role',name:'role',value:'Execution host'},{label:'Require owner verification',name:'verify',value:true,type:'checkbox',full:true}]),saveLabel:'Review preview',onSave:()=>showToast('Host preview complete','No Host, Environment, readiness, or owner state changed.','info')});return;
      case 'verify-server-host': taskDrawer('Verify Host and Environment',[['Resolve exact identity',ds(el,'id')||'topology'],['Verify trust and reachability','No label-based reuse'],['Verify installation and versions','Official source and compatibility'],['Verify project/Vault topology',state.projectSync.location],['Write currentness receipt','Readiness remains distinct from installation']],{successMessage:'Host and Environment verification completed for this concept fixture.'});return;
      case 'test-server-status': case 'open-server-check': infoDrawer(`Server fixture projection · ${humanize(ds(el,'id')||'status')}`,'Concept fixture only. Claim, bootstrap, sync, backup, and repair route to their canonical owners; no owner feed or currentness receipt is attached.',[['Example server host',state.projectSync.serverHost],['Example execution host',state.projectSync.executionHost],['Example project authority',state.projectSync.location],['Currentness','Owner feed not attached'],['Mutation owner','Server Claim / Project Sync / Shared Integration Runtime']]);return;
      case 'updates-tab': switchManagerTab(el);return;
''',
        need,
        "remove operational Doctor handlers and add server handlers",
    )
    source = _replace_once(
        source,
        "const expectedTypes=new Set(['settings','providers','webRoutes','mediaRoutes','bsd','toolchain','testing','memory','goals','personas','owners','sourceControl','notifications','projectSync','projectHistory','permissions','settingsTransfer','backup','doctor','servers','updates']);",
        "const expectedTypes=new Set(['settings','providers','webRoutes','mediaRoutes','bsd','toolchain','testing','memory','goals','personas','owners','sourceControl','browserScm','notifications','projectSync','projectHistory','permissions','settingsTransfer','backup','doctor','servers','updates']);",
        need,
        "workspace audit inventory",
    )
    source = _replace_once(
        source,
        "pageHeader('network','Project Location & Sync','Configure project authority, local and remote locations, clients, execution hosts, continuity, copy/move operations, conflict behavior, and diagnostics.'",
        "pageHeader('network','Project Location & Sync','Concept fixture preserving the complete manager layout. Current authority, locations, clients, remotes, continuity, conflicts, and mutations require the Project Sync owner feed, which is not attached here.'",
        need,
        "Project Sync fixture authority disclosure",
    )
    source = source.replace("<div class=\"panel-title\">Project locations and authority</div>", "<div class=\"panel-title\">Project locations and authority · concept fixture</div>")
    source = source.replace("<div class=\"panel-title\">Connected clients</div>", "<div class=\"panel-title\">Connected clients · concept fixture</div>")
    source = source.replace("<div class=\"panel-title\">Project Sync diagnostics</div>", "<div class=\"panel-title\">Project Sync diagnostics · concept fixture</div>")
    source = source.replace("'Current fixture status','Ready'", "'Owner feed not attached','Fixture'")
    source = source.replace("<div class=\"panel-title\">Current project authority</div><div class=\"panel-subtitle\">The exact location and owning server remain visible.</div>", "<div class=\"panel-title\">Project authority · concept fixture</div><div class=\"panel-subtitle\">Example topology only; the exact current location and owning server require the Project Sync owner feed.</div>")
    source = _replace_once(
        source,
        "      case 'edit-conflict-policy': editObjectDialog({title:'Project sync conflict policy'",
        "      case 'edit-conflict-policy': infoDrawer('Project sync conflict policy preview','Concept fixture only. The Project Sync owner must accept and receipt any policy change.',[['Fixture policy',state.projectSync.conflictPolicy],['Currentness','Owner feed not attached'],['Mutation','Not performed']]);return;\n      case 'unused-edit-conflict-policy': editObjectDialog({title:'Project sync conflict policy'",
        need,
        "Project Sync conflict policy preview-only fixture",
    )

    source = source.replace("document.body.append(stack)", "portalRoot().append(stack)")
    source = source.replace("document.body.append(wrap)", "portalRoot().append(wrap)")
    source = source.replace("document.body.append(searchEl)", "portalRoot().append(searchEl)")
    source = source.replace("document.body.append(overlay)", "portalRoot().append(overlay)")
    source = source.replace("document.body.append(pop)", "portalRoot().append(pop)")
    source = source.replace("document.body.append(tooltipEl)", "portalRoot().append(tooltipEl)")
    source = source.replace("obs.observe(document.body, { childList: true });", "obs.observe(portalRoot(), { childList: true });")
    source = source.replace("document.querySelectorAll('.popover')", "portalRoot().querySelectorAll('.popover')")
    source = source.replace("document.querySelectorAll('.overlay')", "portalRoot().querySelectorAll('.overlay')")
    source = source.replace("document.querySelectorAll('.drawer-wrap')", "portalRoot().querySelectorAll('.drawer-wrap')")
    source = source.replace("document.querySelector('.popover')", "portalRoot().querySelector('.popover')")
    source = source.replace("document.querySelector('.overlay [role=\"dialog\"],.drawer-wrap [role=\"dialog\"]')", "portalRoot().querySelector('.overlay [role=\"dialog\"],.drawer-wrap [role=\"dialog\"]')")
    source = source.replace("document.querySelector('.pm-shell')?.classList.remove('rail-open')", "root.querySelector('.pm-shell')?.classList.remove('rail-open')")
    source = source.replace("document.querySelectorAll('.popover').forEach(el=>el.remove())", "portalRoot().querySelectorAll('.popover').forEach(el=>el.remove())")
    source = source.replace("document.querySelectorAll('.section-block, .settings-section, .manager-section')", "root.querySelectorAll('.section-block, .settings-section, .manager-section')")
    source = source.replace("document.getElementById('settings-document')", "root.querySelector('#settings-document')")
    source = source.replace("document.getElementById(`section-${sectionId}`)", "root.querySelector(`#section-${cssEscape(sectionId)}`)")
    source = source.replace("document.getElementById(`setting-${settingId}`)", "root.querySelector(`#setting-${cssEscape(settingId)}`)")
    source = source.replace("document.querySelector('[data-autofocus]')", "portalRoot().querySelector('[data-autofocus]') || root.querySelector('[data-autofocus]')")
    source = source.replace("document.getElementById('toast-stack')", "portalRoot().querySelector('#toast-stack')")
    source = source.replace("document.getElementById('memory-query')", "root.querySelector('#memory-query')")
    source = source.replace("document.querySelectorAll('.sound-row.is-playing')", "root.querySelectorAll('.sound-row.is-playing')")
    source = source.replace("document.getElementById(map[ds(el,'roster')]||ds(el,'roster'))", "root.querySelector('#'+cssEscape(map[ds(el,'roster')]||ds(el,'roster')))")
    source = source.replace("document.querySelectorAll('#memory-list [data-filter-text]')", "root.querySelectorAll('#memory-list [data-filter-text]')")

    source = _replace_once(
        source,
        """      const rect = (input.closest('.rail-search, .hero-search') || input).getBoundingClientRect();
      searchEl = document.createElement('div');
      searchEl.className = 'search-results';
      searchEl.dataset.mode = mode;
      searchEl.style.position = 'fixed';
      searchEl.style.left = `${Math.max(12, rect.left)}px`;
      searchEl.style.top = `${rect.bottom + 6}px`;
      searchEl.style.width = `${mode === 'rail' ? Math.min(380, window.innerWidth - 24) : Math.min(Math.max(rect.width, 420), window.innerWidth - 24)}px`;
      searchEl.style.zIndex = '240';
      portalRoot().append(searchEl);""",
        """      const rect = (input.closest('.rail-search, .hero-search') || input).getBoundingClientRect(),frame=portalFrame();
      searchEl = document.createElement('div');
      searchEl.className = 'search-results';
      searchEl.dataset.mode = mode;
      searchEl.style.position = 'absolute';
      searchEl.style.left = `${Math.max(12, rect.left-frame.rect.left)}px`;
      searchEl.style.top = `${rect.bottom-frame.rect.top+6}px`;
      searchEl.style.width = `${mode === 'rail' ? Math.min(380, frame.width - 24) : Math.min(Math.max(rect.width, 420), frame.width - 24)}px`;
      searchEl.style.zIndex = '240';
      frame.portal.append(searchEl);""",
        need,
        "host-relative Settings search placement",
    )
    source = _replace_once(
        source,
        """    portalRoot().append(pop);
    menuAnchorEl = anchor || null;
    const rect = anchor?.getBoundingClientRect?.() || {right:window.innerWidth - 16,bottom:16,left:window.innerWidth - 220,top:16};
    const width = Math.max(190, pop.offsetWidth || 210);
    const left = Math.max(8, Math.min(window.innerWidth - width - 8, rect.right - width));
    const top = Math.min(window.innerHeight - (pop.offsetHeight || 240) - 8, rect.bottom + 6);
    pop.style.left = `${left}px`;
    pop.style.top = `${Math.max(8, top)}px`;""",
        """    const frame=portalFrame();frame.portal.append(pop);
    menuAnchorEl = anchor || null;
    const rect = anchor?.getBoundingClientRect?.() || {right:frame.rect.right-16,bottom:frame.rect.top+16,left:frame.rect.right-220,top:frame.rect.top+16};
    const width = Math.max(190, pop.offsetWidth || 210);
    const left = Math.max(8, Math.min(frame.width - width - 8, rect.right-frame.rect.left-width));
    const top = Math.min(frame.height - (pop.offsetHeight || 240) - 8, rect.bottom-frame.rect.top+6);
    pop.style.left = `${left}px`;
    pop.style.top = `${Math.max(8, top)}px`;""",
        need,
        "host-relative Settings popover placement",
    )
    source = _replace_once(
        source,
        """      hideTooltip();tooltipEl=document.createElement('div');tooltipEl.className='tooltip';tooltipEl.textContent=text;portalRoot().append(tooltipEl);
      const r=target.getBoundingClientRect(),w=tooltipEl.offsetWidth,h=tooltipEl.offsetHeight;
      let left=Math.max(8,Math.min(window.innerWidth-w-8,r.left+(r.width-w)/2));let top=r.bottom+7;
      if(top+h>window.innerHeight-8)top=Math.max(8,r.top-h-7);
      tooltipEl.style.left=`${left}px`;tooltipEl.style.top=`${top}px`;""",
        """      hideTooltip();tooltipEl=document.createElement('div');tooltipEl.className='tooltip';tooltipEl.textContent=text;const frame=portalFrame();frame.portal.append(tooltipEl);
      const r=target.getBoundingClientRect(),w=tooltipEl.offsetWidth,h=tooltipEl.offsetHeight;
      let left=Math.max(8,Math.min(frame.width-w-8,r.left-frame.rect.left+(r.width-w)/2));let top=r.bottom-frame.rect.top+7;
      if(top+h>frame.height-8)top=Math.max(8,r.top-frame.rect.top-h-7);
      tooltipEl.style.left=`${left}px`;tooltipEl.style.top=`${top}px`;""",
        need,
        "host-relative Settings tooltip placement",
    )

    source = _replace_band(
        source,
        "  function closeOverlay() {",
        "  function focusSettingsSearch() {",
        r'''  function closeOverlay(restoreFocus=true) {
    closeSearch();
    let returnTarget=null;
    const pops=[...portalRoot().querySelectorAll('.popover')];
    for(const pop of pops){returnTarget=returnTarget||pop._pmReturnFocus||menuAnchorEl;closePopover(pop,false);}
    const overlays=[...portalRoot().querySelectorAll('.overlay')];
    for(const overlay of overlays){returnTarget=returnTarget||overlay._pmReturnFocus;overlay._pmCleanup?.();overlay.remove();}
    const drawers=[...portalRoot().querySelectorAll('.drawer-wrap')];
    for(const wrap of drawers){returnTarget=returnTarget||wrap._pmReturnFocus;closeDrawerWrap(wrap,null,false);}
    if(restoreFocus&&returnTarget)restoreTransientFocus(returnTarget);
  }

  function closeDrawerWrap(wrap,onDone,restoreFocus=true) {
    if(!wrap){onDone?.();return;}
    wrap._pmCleanup?.();
    const returnTarget=wrap._pmReturnFocus;
    if(!wrap.isConnected){if(restoreFocus)restoreTransientFocus(returnTarget);onDone?.();return;}
    if(wrap.dataset.closing==='1')return;
    wrap.dataset.closing='1';
    /* Closing motion is visual only: focus and hit testing return in the same
       frame so a rapid reversal can open another detail without the outgoing
       drawer swallowing the user's click. */
    wrap.setAttribute('aria-hidden','true');wrap.style.pointerEvents='none';
    if(restoreFocus)restoreTransientFocus(returnTarget);
    const drawer=wrap.querySelector('.drawer');
    wrap.classList.remove('is-settled');wrap.classList.add('is-closing');void wrap.offsetWidth;wrap.classList.remove('is-open');
    let finished=false;
    const finish=()=>{if(finished)return;finished=true;wrap.removeEventListener('transitionend',onEnd);wrap.remove();onDone?.();};
    const onEnd=e=>{if(e.target!==drawer&&e.target!==wrap)return;if(e.propertyName!=='transform'&&e.propertyName!=='opacity')return;finish();};
    if(motionReduced()){finish();return;}
    wrap.addEventListener('transitionend',onEnd);setTimeout(finish,280);
  }

  function openDrawer({ title, subtitle = '', body = '', primaryLabel = '', onPrimary = null }) {
    const returnTarget=captureTransientFocus();closeOverlay(false);
    const wrap=document.createElement('div');wrap.className='drawer-wrap';wrap._pmReturnFocus=returnTarget;
    wrap.innerHTML=`<aside class="drawer" role="dialog" aria-modal="true" aria-label="${escAttr(title)}">
      <div class="dialog-head"><div class="dialog-head-copy"><div class="dialog-title">${escapeHtml(title)}</div>${subtitle?`<div class="dialog-sub">${escapeHtml(subtitle)}</div>`:''}</div><button class="icon-btn" data-action="close-overlay" aria-label="Close">${icon('close')}</button></div>
      <div class="drawer-body">${body}</div>
      <div class="drawer-footer"><button class="btn" data-action="close-overlay">Close</button>${onPrimary?`<button class="btn primary" data-callback="${registerAction(()=>{const result=onPrimary(wrap);if(result!==false&&wrap.isConnected)closeDrawerWrap(wrap);})}">${escapeHtml(primaryLabel||'Apply')}</button>`:''}</div>
    </aside>`;
    const drawer=wrap.querySelector('.drawer');
    const onEsc=e=>{if(e.key!=='Escape'||!wrap.isConnected||!window.PM7_SETTINGS_TOME.ownsEvent(e.target))return;e.stopPropagation();closeDrawerWrap(wrap);};
    const cleanup=()=>{document.removeEventListener('keydown',onEsc,true);wrap._pmCleanup=null;};wrap._pmCleanup=cleanup;
    wrap.addEventListener('mousedown',e=>{if(e.target===wrap)closeDrawerWrap(wrap);});
    portalRoot().append(wrap);document.addEventListener('keydown',onEsc,true);void wrap.offsetWidth;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{if(!wrap.isConnected)return;wrap.classList.add('is-open');if(motionReduced())wrap.classList.add('is-settled');else{const onSettled=e=>{if(e.target!==drawer||e.propertyName!=='transform')return;drawer.removeEventListener('transitionend',onSettled);if(wrap.isConnected&&wrap.classList.contains('is-open'))wrap.classList.add('is-settled');};drawer.addEventListener('transitionend',onSettled);}wrap.querySelector('button')?.focus();}));
    return wrap;
  }
''',
        need,
        "Settings-owned drawer lifecycle and focus",
    )

    source = _replace_band(
        source,
        "  function openDialog({ title, subtitle = '', body = '', saveLabel = 'Save changes', cancelLabel = 'Cancel', wide = false, onSave = null, onOpen = null }) {",
        "  function formField(label, name, value = '', options = {}) {",
        r'''  function openDialog({ title, subtitle = '', body = '', saveLabel = 'Save changes', cancelLabel = 'Cancel', wide = false, onSave = null, onOpen = null }) {
    const returnTarget=captureTransientFocus();closeOverlay(false);
    const overlay=document.createElement('div');overlay.className='overlay';overlay._pmReturnFocus=returnTarget;
    overlay.innerHTML=`<section class="dialog ${wide?'wide':''}" role="dialog" aria-modal="true" aria-label="${escAttr(title)}">
      <div class="dialog-head"><div class="dialog-head-copy"><div class="dialog-title">${escapeHtml(title)}</div>${subtitle?`<div class="dialog-sub">${escapeHtml(subtitle)}</div>`:''}</div><button class="icon-btn" data-action="close-overlay" aria-label="Close">${icon('close')}</button></div>
      <form class="dialog-form"><div class="dialog-body">${body}</div><div class="dialog-footer"><button type="button" class="btn" data-action="close-overlay">${escapeHtml(cancelLabel)}</button>${onSave?`<button type="submit" class="btn primary">${escapeHtml(saveLabel)}</button>`:''}</div></form>
    </section>`;
    portalRoot().append(overlay);overlay.addEventListener('mousedown',e=>{if(e.target===overlay)closeOverlay();});
    const form=overlay.querySelector('form');
    if(onSave)form.addEventListener('submit',e=>{e.preventDefault();const data=Object.fromEntries(new FormData(form).entries()),result=onSave(data,form);if(result!==false&&overlay.isConnected)closeOverlay();});
    requestAnimationFrame(()=>{const target=overlay.querySelector('[data-autofocus], input, select, textarea, button');if(target)target.focus();if(onOpen)onOpen(overlay);});
    return overlay;
  }
''',
        need,
        "Settings-owned dialog lifecycle and focus",
    )

    source = _replace_band(
        source,
        "  function openMenu(anchor, items, title = '') {",
        "  function genericActionDrawer(action, el) {",
        r'''  function openMenu(anchor,items,title='') {
    portalRoot().querySelectorAll('.popover').forEach(pop=>closePopover(pop,false));
    const pop=document.createElement('div');pop.className='popover';pop.setAttribute('role','menu');pop._pmReturnFocus=captureTransientFocus(anchor);
    pop.innerHTML=`${title?`<div class="popover-title">${escapeHtml(title)}</div>`:''}${items.map(item=>{
      if(item.separator)return '<div class="menu-sep"></div>';
      const callback=registerAction(()=>{if(item.disabled||item.ariaDisabled)return;closePopover(pop,false);item.onClick?.();});
      const unavailable=item.disabled||item.ariaDisabled,attrs=item.disabled?`disabled aria-disabled="true" data-pm-hover-label="${escAttr(item.label+' unavailable')}" data-pm-hover-detail="${escAttr(item.meta||'Unavailable')}"`:item.ariaDisabled?`aria-disabled="true" data-pm-hover-label="${escAttr(item.label+' unavailable')}" data-pm-hover-detail="${escAttr(item.meta||'Unavailable')}" aria-label="${escAttr(item.label+' unavailable: '+(item.meta||'Unavailable'))}"`:'';
      return `<button class="menu-item ${item.danger?'danger':''}" role="menuitem" data-callback="${callback}" ${attrs}>${icon(item.icon||'settings')}<span>${escapeHtml(item.label)}</span>${item.meta?`<span class="menu-meta">${escapeHtml(item.meta)}</span>`:''}</button>`;
    }).join('')}`;
    const frame=portalFrame();frame.portal.append(pop);menuAnchorEl=anchor||null;
    const rect=anchor?.getBoundingClientRect?.()||{right:frame.rect.right-16,bottom:frame.rect.top+16,left:frame.rect.right-220,top:frame.rect.top+16},width=Math.max(190,pop.offsetWidth||210);
    const left=Math.max(8,Math.min(frame.width-width-8,rect.right-frame.rect.left-width)),top=Math.min(frame.height-(pop.offsetHeight||240)-8,rect.bottom-frame.rect.top+6);
    pop.style.left=`${left}px`;pop.style.top=`${Math.max(8,top)}px`;requestAnimationFrame(()=>pop.querySelector('button:not([disabled])')?.focus());return pop;
  }
''',
        need,
        "Settings-owned menu lifecycle and focus",
    )
    source = source.replace("portalRoot().querySelectorAll('.popover').forEach(el => el.remove());", "portalRoot().querySelectorAll('.popover').forEach(el => closePopover(el,false));")
    source = source.replace("portalRoot().querySelectorAll('.popover').forEach(el=>el.remove())", "portalRoot().querySelectorAll('.popover').forEach(el=>closePopover(el,false))")
    source = source.replace("if (menuAnchorEl && menuAnchorEl.contains(event.target)) { event.preventDefault(); openPop.remove(); return; }", "if (menuAnchorEl && menuAnchorEl.contains(event.target)) { event.preventDefault(); closePopover(openPop); return; }")
    source = source.replace("if (!openPop.contains(event.target)) openPop.remove();", "if (!openPop.contains(event.target)) closePopover(openPop);")

    source = _replace_once(source, "  function updateHash() {", "  function updateHash() { return;\n    /* PM7 owns the document URL; Settings never mutates its hash. */", need, "disable K3 hash writes")
    source = _replace_once(source, "  function readHash() {", "  function readHash() { return;\n    /* PM7 owns route restoration. */", need, "disable K3 hash reads")
    source = source.replace("window.addEventListener('popstate',()=>{readHash();renderApp();});", "/* PM7 owns popstate. */")
    source = source.replace("window.addEventListener('hashchange',()=>{const before=`${state.domain}/${state.workspace}`;readHash();if(before!==`${state.domain}/${state.workspace}`)renderApp();});", "/* PM7 owns hashchange. */")

    source = _replace_once(
        source,
        "    document.addEventListener('click', event => {\n      const callbackEl=event.target.closest('[data-callback]');",
        "    document.addEventListener('click', event => {\n      if(!window.PM7_SETTINGS_TOME.ownsEvent(event.target)){portalRoot().querySelectorAll('.popover').forEach(el=>el.remove());if(searchEl)closeSearch();return;}\n      const callbackEl=event.target.closest('[data-callback]');",
        need,
        "shared root and portal click delegation",
    )
    source = _replace_once(source, "    document.addEventListener('input', event => {\n      const target = event.target;", "    document.addEventListener('input', event => {\n      if(!window.PM7_SETTINGS_TOME.ownsEvent(event.target))return;\n      const target = event.target;", need, "shared root and portal input delegation")
    source = _replace_once(source, "    document.addEventListener('change',event=>{const el=event.target.closest('[data-action]');", "    document.addEventListener('change',event=>{if(!window.PM7_SETTINGS_TOME.ownsEvent(event.target))return;const el=event.target.closest('[data-action]');", need, "shared root and portal change delegation")
    source = _replace_once(source, "    document.addEventListener('mouseover',event=>{const el=event.target.closest('[data-tooltip]');if(el&&!el.contains(event.relatedTarget))showTooltip(el);});", "    /* T47 PMHoverTagController owns all Settings pointer/focus tooltip presentation. */", need, "retire local Settings tooltip enter path")
    source = _replace_once(source, "    document.addEventListener('mouseout',event=>{const el=event.target.closest('[data-tooltip]');if(el&&!el.contains(event.relatedTarget))hideTooltip();});", "    /* data-tooltip remains descriptor input for the shared T47 controller. */", need, "retire local Settings tooltip exit path")
    source = _replace_once(
        source,
        "    document.addEventListener('keydown',event=>{\n      if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k')",
        "    document.addEventListener('keydown',event=>{\n      if(!window.PM7_SETTINGS_TOME.ownsEvent(event.target))return;\n      if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k')",
        need,
        "scope Settings keyboard ownership",
    )
    source = _replace_once(
        source,
        "  function onDetailEsc(e) {\n    if (e.key !== 'Escape') return;",
        "  function onDetailEsc(e) {\n    if (e.key !== 'Escape' || !window.PM7_SETTINGS_TOME.ownsEvent(e.target)) return;",
        need,
        "scope detail inspector Escape ownership",
    )
    source = _replace_once(
        source,
        "  function handleInputAction(action, el) {\n    if (action === 'input-setting') {",
        "  function handleInputAction(action, el) {\n    if (action === 'all-settings-query') {allSettingsView.query=el.value;clearTimeout(allSettingsQueryTimer);allSettingsQueryTimer=setTimeout(()=>{allSettingsQueryTimer=0;refreshAllSettingsVirtual(true);},80);return;}\n    if (action === 'input-setting') {",
        need,
        "All Settings fuzzy query handler",
    )
    source = _replace_once(
        source,
        "      const id=ds(el,'setting'); state.settings[id]=el.value; state.changed[id]=true; saveState(); return;",
        "      const id=ds(el,'setting'),found=findSettingGlobal(id),suffix=ds(el,'valueSuffix','');const next=suffix?`${el.value}${suffix}`:(found&&typeof found.setting.value==='number'?Number(el.value):el.value);if(!commitSettingValue(id,next))return;const output=el.closest('.slider-control')?.querySelector('output');if(output)output.textContent=suffix?`${el.value}${suffix}`:el.value;saveState();return;",
        need,
        "typed text setting mutation",
    )
    source = _replace_once(
        source,
        "  function handleChangeAction(action, el) {\n    if (action === 'change-setting') {",
        "  function handleChangeAction(action, el) {\n    if (action === 'all-settings-filter') {allSettingsView[ds(el,'filter')]=el.value;refreshAllSettingsVirtual(true);return;}\n    if (action === 'change-setting') {",
        need,
        "All Settings facet handler",
    )
    source = _replace_once(
        source,
        "const id=ds(el,'setting'),found=findSettingGlobal(id);if(!found)return;state.settings[id]=el.value;state.changed[id]=true;saveState();showToast('Setting updated',`${found.setting.label} is now ${el.value}.`);return;",
        "const id=ds(el,'setting'),found=findSettingGlobal(id);if(!found||!commitSettingValue(id,el.value))return;saveState();showToast('Setting updated',`${found.setting.label} is now ${el.value}.`);return;",
        need,
        "typed select setting mutation",
    )
    source = _replace_once(
        source,
        "      case 'open-resource-setting': {",
        """      case 'browse-setting-path': {
        const found=findSettingGlobal(ds(el,'setting'));if(!found)return;const picker=window.PM_SETTINGS_PICK_PATH;
        if(typeof picker==='function'){const chosen=picker({project_id:window.PM7_SETTINGS_TOME.project()?.id||null,setting_id:found.setting.id,current_value:settingValue(found.setting)});if(typeof chosen==='string'&&commitSettingValue(found.setting.id,chosen)){saveState();renderApp();}return;}
        openDialog({title:`Browse · ${found.setting.label}`,subtitle:'The native Slint picker binds this field to the selected project-scoped path.',body:formGrid([{label:'Path',name:'path',value:settingValue(found.setting),autofocus:true}]),saveLabel:'Use path',onSave:(_v,form)=>{const value=readForm(form).path;if(!commitSettingValue(found.setting.id,value))return false;saveState();renderApp();return true;}});return;
      }
      case 'open-structured-setting': {
        const found=findSettingGlobal(ds(el,'setting'));if(!found)return;const current=settingValue(found.setting),kind=found.setting.control;
        openDialog({title:found.setting.label,subtitle:kind==='list'?'Edit one JSON array for this project.':'Edit one JSON object for this project.',wide:true,body:formGrid([{label:kind==='list'?'Items':'Entries',name:'structured',value:JSON.stringify(current,null,2),type:'textarea',full:true,autofocus:true}]),saveLabel:'Validate and save',onSave:(_v,form)=>{try{const parsed=JSON.parse(readForm(form).structured),valid=kind==='list'?Array.isArray(parsed):(parsed&&typeof parsed==='object'&&!Array.isArray(parsed));if(!valid)throw new Error(kind==='list'?'Expected a JSON array.':'Expected a JSON object.');if(!commitSettingValue(found.setting.id,parsed))return false;saveState();renderApp();return true;}catch(error){showToast('Structured value is invalid',error.message,'error');return false;}}});return;
      }
      case 'open-resource-setting': {""",
        need,
        "path and structured setting handlers",
    )
    source = _replace_once(
        source,
        "      case 'toggle-setting': {",
        "      case 'manage-credential-reference': {const found=findSettingGlobal(ds(el,'setting'));if(!found)return;const owner=window.PM_SETTINGS_CREDENTIALS&&window.PM_SETTINGS_CREDENTIALS.open;if(typeof owner==='function'){owner({project_id:window.PM7_SETTINGS_TOME.project()?.id||null,setting_id:found.setting.id,mode:'reference_only'});return;}infoDrawer(found.setting.label,'Credential material is never rendered, copied into project Settings, or persisted by this concept. The native owner opens the OS credential store and returns only a redacted reference/status.',[['Setting ID',found.setting.id],['Storage owner','OS credential store / secure Settings owner'],['Project value','Redacted reference only'],['Owner UI','Not attached to this concept fixture']]);return;}\n      case 'clear-all-settings-filters': {clearTimeout(allSettingsQueryTimer);allSettingsQueryTimer=0;allSettingsView.query='';allSettingsView.category='all';allSettingsView.exposure='all';allSettingsView.control='all';allSettingsView.applicability='all';allSettingsView.ownerStatus='all';allSettingsView.resultType='all';allSettingsView.scrollTop=0;renderApp({soft:true});return;}\n      case 'open-docker-manager': {const target=document.querySelector('.activity-bar .icon[data-target=\"panel-docker\"]');if(target){target.click();showToast('Docker Manager opened','Container operations remain outside Settings.','info');}else showToast('Docker Manager unavailable','The owner surface is not mounted in this host.','warning');return;}\n      case 'open-hosts-manager': state.serverTab='hosts';navigate('system','servers');return;\n      case 'toggle-setting': {",
        need,
        "All Settings clear filters action",
    )
    source = _replace_once(
        source,
        "case 'manage-credential-reference': {const found=findSettingGlobal(ds(el,'setting'));if(!found)return;const owner=window.PM_SETTINGS_CREDENTIALS&&window.PM_SETTINGS_CREDENTIALS.open;if(typeof owner==='function'){owner({project_id:window.PM7_SETTINGS_TOME.project()?.id||null,setting_id:found.setting.id,mode:'reference_only'});return;}",
        "case 'manage-credential-reference': {const found=findSettingGlobal(ds(el,'setting')),project=window.PM7_SETTINGS_TOME.project();if(!found)return;if(!project){showToast('Select or create a project','No-project mode cannot open mutation-capable credential Settings.','warning');return;}const owner=window.PM_SETTINGS_CREDENTIALS&&window.PM_SETTINGS_CREDENTIALS.open;if(typeof owner==='function'){owner({project_id:project.id,setting_id:found.setting.id,mode:'reference_only'});return;}",
        need,
        "credential owner no-project fence",
    )
    source = _replace_once(
        source,
        "case 'manage-credential-reference': {",
        "case 'set-slider-override': {const found=findSettingGlobal(ds(el,'setting'));if(!found)return;openDialog({title:'Set numeric override · '+found.setting.label,subtitle:'Enter an explicit finite value. Leave the setting inherited by cancelling.',body:formGrid([{label:'Numeric value',name:'value',value:'',type:'number',autofocus:true,help:Number.isFinite(found.setting.min)&&Number.isFinite(found.setting.max)?('Allowed range: '+found.setting.min+' to '+found.setting.max):'The owner inventory supplies no finite bounds; any finite number is accepted.'}]),saveLabel:'Use override',onSave:(_v,form)=>{const next=Number(readForm(form).value);if(!Number.isFinite(next)||(Number.isFinite(found.setting.min)&&next<found.setting.min)||(Number.isFinite(found.setting.max)&&next>found.setting.max)){showToast('Numeric override is invalid','Enter a finite value inside the owner-supplied range.','error');return false;}if(!commitSettingValue(found.setting.id,next))return false;saveState();renderApp();return true;}});return;}\n      case 'manage-credential-reference': {",
        need,
        "inherited slider numeric override",
    )
    setting_mutation_replacements = {
        "confirmDialog('Restore default settings','Preview and restore application defaults while preserving provider credentials, project files, histories, and a rollback receipt?', 'Restore defaults',()=>{state.settings={};state.changed={};state.detailSetting=null;rerender('Defaults restored','Ordinary settings returned to defaults; owned resources and credentials were preserved.','warning');},true);return;":
            "confirmDialog('Restore project defaults','Ask the Settings owner to restore this project atomically while preserving credential references, project files, histories, and a rollback receipt?', 'Restore defaults',()=>restoreAllProjectDefaults(),true);return;",
        "const id=ds(el,'setting'),found=findSettingGlobal(id);if(!found)return;state.settings[id]=!settingValue(found.setting);state.changed[id]=true;rerender('Setting updated',`${found.setting.label} is now ${state.settings[id]?'on':'off'}.`);return;":
            "const id=ds(el,'setting'),found=findSettingGlobal(id);if(!found)return;const next=!settingValue(found.setting);if(!commitSettingValue(id,next))return;rerender('Setting updated',`${found.setting.label} is now ${next?'on':'off'}.`);return;",
        "const id=ds(el,'setting'),found=findSettingGlobal(id);if(!found)return;state.settings[id]=value;state.changed[id]=true;rerender('Setting updated',`${found.setting.label} is now ${value}.`);return;":
            "const id=ds(el,'setting'),found=findSettingGlobal(id);if(!found||!commitSettingValue(id,value))return;rerender('Setting updated',`${found.setting.label} is now ${value}.`);return;",
        "const id=ds(el,'setting'),found=findSettingGlobal(id);if(!found)return;const current=Number(settingValue(found.setting))||0;const next=current+Number(ds(el,'step','1'));const min=found.setting.min??0,max=found.setting.max??100;state.settings[id]=Math.max(min,Math.min(max,next));state.changed[id]=true;rerender();return;":
            "const id=ds(el,'setting'),found=findSettingGlobal(id);if(!found)return;const current=Number(settingValue(found.setting))||0;const next=current+Number(ds(el,'step','1'));const min=found.setting.min??0,max=found.setting.max??100;if(!commitSettingValue(id,Math.max(min,Math.min(max,next))))return;rerender();return;",
        "const id=ds(el,'setting'),found=findSettingGlobal(id);if(!found)return;const arr=[...(settingValue(found.setting)||[])],i=arr.indexOf(value);if(i>=0)arr.splice(i,1);else arr.push(value);state.settings[id]=arr;state.changed[id]=true;rerender();return;":
            "const id=ds(el,'setting'),found=findSettingGlobal(id);if(!found)return;const arr=[...(settingValue(found.setting)||[])],i=arr.indexOf(value);if(i>=0)arr.splice(i,1);else arr.push(value);if(!commitSettingValue(id,arr))return;rerender();return;",
        "const id=ds(el,'setting'),found=findSettingGlobal(id);if(!found)return;const arr=[...(settingValue(found.setting)||[])];if(moveItem(arr,Number(ds(el,'index')),Number(ds(el,'direction')))){state.settings[id]=arr;state.changed[id]=true;rerender();}return;":
            "const id=ds(el,'setting'),found=findSettingGlobal(id);if(!found)return;const arr=[...(settingValue(found.setting)||[])];if(moveItem(arr,Number(ds(el,'index')),Number(ds(el,'direction')))&&commitSettingValue(id,arr))rerender();return;",
        "const id=ds(el,'setting'),found=findSettingGlobal(id);if(!found)return;delete state.settings[id];delete state.changed[id];rerender('Default restored',`${found.setting.label} now uses its default value.`);return;":
            "const id=ds(el,'setting'),found=findSettingGlobal(id);if(!found||!restoreSettingDefault(id))return;rerender('Default restored',`${found.setting.label} now uses its default value.`);return;",
    }
    for old, new in setting_mutation_replacements.items():
        source = _replace_once(source, old, new, need, "typed setting mutation command")
    source = _replace_once(
        source,
        "      const inHay = item.hay.includes(term);\n      score += (inTitle ? 8 : 0) + (inExtra ? 6 : 0) + (inPath ? 3 : 0) + (inHay ? 1 : -20);\n      const hit = inTitle ? 8 : inExtra ? 6 : inPath ? 3 : inHay ? 1 : -20;",
        "      const inHay = item.hay.includes(term);\n      const fuzzy = inHay ? 1 : fuzzySubsequenceScore(item.hay, term);\n      score += (inTitle ? 8 : 0) + (inExtra ? 6 : 0) + (inPath ? 3 : 0) + (fuzzy > 0 ? fuzzy : -20);\n      const hit = inTitle ? 8 : inExtra ? 6 : inPath ? 3 : fuzzy > 0 ? fuzzy : -20;",
        need,
        "global fuzzy search scoring",
    )

    source = _replace_once(
        source,
        "      reset:()=>{localStorage.removeItem(STORAGE_KEY);state=clone(defaultState);ensureStateShape();renderApp();},",
        "      reset:()=>{window.PM7_SETTINGS_TOME.reset();state=loadState();ensureStateShape();renderApp();window.PM7_SETTINGS_TOME.applyPaint(state);},\n      reloadProject:()=>{state=loadState();ensureStateShape();renderApp();window.PM7_SETTINGS_TOME.applyPaint(state);},\n      setSettingFromHost:(id,value,rerenderView=true,syncRelated=true)=>{if(!commitSettingValue(id,value,{syncRelated})){window.PM7_SETTINGS_TOME.applyPaint(state);return false;}saveState();if(rerenderView)renderApp();return true;},\n      closeTransientUi:()=>{hideTooltip();closeSearch();closeOverlay(false);document.removeEventListener('keydown',onDetailEsc,true);detailInspectorVisible=false;state.detailSetting=null;state.railOpen=false;state.resourceRosterOpen=false;root.querySelector('.pm-shell')?.classList.remove('rail-open');const active=document.activeElement;if(window.PM7_SETTINGS_TOME.ownsEvent(active)&&typeof active.blur==='function')active.blur();},\n      returnToProviderInstallation:(providerId,action)=>{state.domain='ai';state.workspace='providers';state.providerTab='installation';if(providerId)state.selectedProvider=providerId;renderApp({soft:true});return {providerId,action};},",
        need,
        "project reload and host setting API",
    )
    source = _replace_once(
        source,
        "    bindEvents();\n    renderApp();",
        "    bindEvents();\n    installActionCallbackCleanup();\n    installHostWidthObserver();\n    renderApp();",
        need,
        "callback cleanup boot",
    )
    source = _replace_once(source, "      version:'12.4-complete',", "      version:'12.5-pm7-t44',", need, "embedded version")
    source = _replace_once(
        source,
        "    root.classList.add('is-ready');\n    requestAnimationFrame(afterRender);",
        "    root.classList.add('is-ready');\n    root.querySelectorAll('.manager-page').forEach(node=>node.classList.toggle('has-manager-tabs',!!node.querySelector(':scope > .manager-tabs')));\n    requestAnimationFrame(afterRender);",
        need,
        "portable manager tab class",
    )
    source = _replace_once(
        source,
        "          ${renderTopbar(domain, workspace)}\n          ${state.home ? '<div></div>' : renderWorkspaceTabs(domain, workspace)}",
        "          ${renderTopbar(domain, workspace)}\n          ${state.settingsProjectionReadOnly===true?`<div class=\"alert-strip warning\" role=\"status\" style=\"margin:8px 12px 0\">${icon('alert')}<div><strong>Settings owner projection unavailable · read only</strong><br>No fixture or browser shadow is being shown as current owner state. Restore, copy, and setting mutations remain disabled until a readable project projection arrives.</div></div>`:''}\n          ${state.home ? '<div></div>' : renderWorkspaceTabs(domain, workspace)}",
        need,
        "visible owner-currentness read-only banner",
    )
    source = _replace_once(
        source,
        "${escapeHtml(section.label)} · ${state.changed[setting.id] ? 'Changed in this project' : 'Using the current configured value'}",
        "${escapeHtml(section.label)} · ${state.settingsProjectionReadOnly===true?'Owner projection unavailable · fallback defaults are not current':state.changed[setting.id]?'Changed in this project':'Using the current project value'}",
        need,
        "truthful detail currentness label",
    )
    need("uninstall-provider" not in source.lower(), "T44 JS: provider Uninstall action survived")
    need("Full host claiming" not in source and "intentionally deferred" not in source, "T44 JS: obsolete server deferral survived")
    need("window.addEventListener('hashchange'" not in source, "T44 JS: hash listener survived")
    need("window.innerWidth" not in source and "window.innerHeight" not in source, "T44 JS: viewport-width positioning survived")
    need(' title="' not in source, "T44 JS: native title tooltip survived shared hover metadata migration")
    for required in (
        "stable_id:setting.id",
        "description:setting.description||canonical.desc||''",
        "aliases:[...(canonical.search||[]),...(setting.searchTerms||[])].map(String)",
        "destination_metadata:Object.values(destination).join(' ')",
        "(canonical.curated===true||setting.curated===true?40:0)",
        "(exposure==='simple'?22:0)",
        "(ownerStatus!=='ok'?10:0)",
        "matches.slice(0,60)",
        "allSettingsQueryTimer=setTimeout",
        "},80)",
        "data-filter=\"category\"",
        "data-filter=\"exposure\"",
        "data-filter=\"control\"",
        "data-filter=\"applicability\"",
        "data-filter=\"ownerStatus\"",
        "data-filter=\"resultType\"",
    ):
        need(required in source, "T44 JS: SSYS-005 search/facet contract missing %s" % required)
    return source


def _settings_script(reference, data, js):
    return "\n".join(
        [
            "/* %s */" % TRANSFORM_MARKER,
            "/* Pinned K3 reference inventory. */",
            reference,
            "/* K3 data adapted to project scope and later packet corrections. */",
            data,
            ADAPTER_PRELUDE,
            "/* K3 interaction engine adapted for the PM7 owner boundary. */",
            js,
        ]
    )


def apply(doc, notes, need):
    need(TRANSFORM_MARKER not in doc, "T44: transform already applied")
    need("PM7 T43: live occupied-neighbor Usage resize preview" in doc, "T44: T43 marker missing")
    winner, sources = _read_sources(need)
    chat_before = _chat_sources(doc, need, "input")
    effects_before = capture_effect_surfaces(doc)

    css = _scope_css(sources["kimi.css"], need)
    data = _adapt_data(sources["kimi-data.js"], need)
    js = _adapt_js(sources["kimi.js"], need)
    reference, reference_projection = _canonical_reference(need)
    compatibility_inventory = _project_inventory_json(need)
    script = _settings_script(reference, data, js)

    old_css = _owner_block(doc, "pm4-settings-css", need, "input")
    old_script = _owner_block(doc, "pm4-settings-js", need, "input")
    doc = _replace_once(doc, old_css, '<style id="pm4-settings-css">\n' + css + "\n</style>", need, "Settings CSS owner")
    doc = _replace_once(doc, old_script, '<script id="pm4-settings-js">\n' + script + "\n</script>", need, "Settings script owner")
    old_inventory = _owner_block(doc, "pm7-settings-data", need, "input")
    doc = _replace_once(
        doc,
        old_inventory,
        '<script type="application/json" id="pm7-settings-data">' + compatibility_inventory + "</script>",
        need,
        "current project-scoped compatibility inventory",
    )
    doc = _replace_once(
        doc,
        "18. settings-data-json (script#pm7-settings-data) - inert JSON payload for PM_SETTINGS_DATA (T11 parse defer); parsed lazily on first settings access",
        "18. settings-data-json (script#pm7-settings-data) - current project-scoped Settings compatibility payload; T44 runtime uses PM12_REFERENCE",
        need,
        "Settings part-index description",
    )
    doc = _replace_once(
        doc,
        "PM7 SECTION 18/32: settings-data-json - inert JSON payload for PM_SETTINGS_DATA (T11 parse defer); parsed lazily on first settings access (script#pm7-settings-data)",
        "PM7 SECTION 18/32: settings-data-json - current 828-row project-scoped compatibility payload; T44 runtime uses PM12_REFERENCE (script#pm7-settings-data)",
        need,
        "Settings section description",
    )

    old_panel, opening, closing = _balanced_element(doc, "panel-settings", need, "input")
    panel = opening + "\n            <div id=\"pm-settings-root\" class=\"pm-app\" aria-live=\"polite\"></div>\n            <div id=\"pm-settings-portals\"></div>\n          " + closing
    doc = _replace_once(doc, old_panel, panel, need, "Settings panel body")

    # Theme is project-scoped.  The pre-paint boot and later titlebar wire use
    # ephemeral Basic Dark without reading/writing legacy global theme keys; T44's
    # adapter applies the selected project's snapshot after DOMContentLoaded.
    doc = _replace_once(
        doc,
        "        var fam = localStorage.getItem('pm.themeFamily');\n        var tmode = localStorage.getItem('pm.themeMode');\n        var leg = /^(friendly|glass|retro|basic)-(light|dark)$/.exec(localStorage.getItem('pm.theme') || '');",
        "        var fam = 'basic';\n        var tmode = 'dark';\n        var leg = null;",
        need,
        "theme boot project-neutral read",
    )
    doc = _replace_once(
        doc,
        "        localStorage.setItem('pm.themeFamily', fam);\n        localStorage.setItem('pm.themeMode', tmode);\n        localStorage.setItem('pm.theme', t);",
        "        /* T44: project-scoped Settings owns persistence; no global theme write. */",
        need,
        "theme boot global writes",
    )
    doc = _replace_once(
        doc,
        "        var g = localStorage.getItem('pm.glassBg');",
        "        var g = 'mesh';",
        need,
        "glass background project-neutral boot",
    )
    doc = _replace_once(
        doc,
        "        var a = parseFloat(localStorage.getItem('pm.glassAlpha'));",
        "        var a = NaN;",
        need,
        "glass alpha project-neutral boot",
    )
    doc = _replace_once(
        doc,
        "    var st = themeReadState();\n    themeApply(st.family, st.mode, { dispatch: false });",
        "    var st = { family: 'basic', mode: 'dark' };\n    themeApply(st.family, st.mode, { dispatch: false, persist: false });",
        need,
        "titlebar theme project-neutral boot",
    )
    doc = _replace_once(
        doc,
        "window.PM_THEME.setMode(seg.getAttribute('data-mode-value'));",
        "window.PM7_SETTINGS_TOME.setChromeThemeMode(seg.getAttribute('data-mode-value'));",
        need,
        "titlebar theme-mode owner bridge",
    )
    doc = _replace_once(
        doc,
        "window.PM_THEME.setFamily(row.getAttribute('data-family'));",
        "window.PM7_SETTINGS_TOME.setChromeThemeFamily(row.getAttribute('data-family'));",
        need,
        "titlebar theme-family owner bridge",
    )

    chat_after = _chat_sources(doc, need, "output")
    changed_chat = [key for key in chat_before if chat_before[key] != chat_after[key]]
    need(not changed_chat, "T44: protected Chat source changed: %s" % ", ".join(changed_chat))
    effects_after = capture_effect_surfaces(doc)

    need(doc.count(TRANSFORM_MARKER) == 2, "T44: CSS/script marker census mismatch")
    need(doc.count('id="pm-settings-root"') == 1, "T44: Settings root census mismatch")
    need(doc.count('id="pm-settings-portals"') == 1, "T44: Settings portal census mismatch")
    need(doc.count('id="panel-settings"') == 1, "T44: Settings panel identity changed")
    need(doc.count('id="projectSettingsModal"') == 1, "T44: project Settings modal identity changed")
    need(doc.count('id="tab-settings"') == 1, "T44: Settings tab identity changed")
    need(doc.count('id="pm7-settings-data"') == 1, "T44: canonical inventory block changed")
    need("PM7_SETTINGS_OPEN_BLOOM" in doc and "window.PM12_KIMI" in doc, "T44: compatibility APIs missing")
    need("Basic Dark" in data and "Basic Dark" in script, "T44: project/no-project theme defaults missing")
    need("base.settings['general.visual.theme']='Basic Dark'" in script and "settings['general.visual.theme']||'Basic Dark'" in script, "T44: Basic Dark fresh-project factory seed drifted")
    need("Friendly Dark is the untouched fresh-project default" not in script and "Untouched fresh projects use Friendly Dark" not in script, "T44: superseded Friendly Dark factory seed returned")
    need("Provider Uninstall" not in script and "uninstall-provider" not in script.lower(), "T44: unsupported provider Uninstall survived")
    need("Claim & Bootstrap" in script and "Full Server Backup" in script and "SSH remote" in script, "T44: later-packet managers incomplete")

    notes.update(
        {
            "decision": "port exact K3 Tome Tabs geometry into the generated PM7 Settings owner",
            "winner_sha256": WINNER_SHA,
            "source_sha256": dict(ASSET_SHAS),
            "canonical_inventory_sha256": reference_projection["inventory_sha256"],
            "canonical_setting_count": reference_projection["total"],
            "layout_contract": "K3 rail/topbar/workspace tabs/continuous document/index/detail/manager geometry retained; only PM7 host containment and later-authority content additions applied",
            "theme_contract": "eight PM7 themes; Basic Dark untouched first-open/fresh-project factory seed; ephemeral Basic Dark with no project; explicit saved project selection and copied detached snapshot preserved; Glass background/transparency bridged without browser blur",
            "later_packet_additions": [
                "server claim/bootstrap and exact Host/Environment",
                "clients and continuity routes",
                "project authority/sync/move/copy/conflict/recovery",
                "SSH remote CRUD",
                "Full Server backup",
                "PM-native browser and SCM dependency surface",
                "Onboarding and Doctor route/dependency seams; T46 supplies the operational Doctor presentation",
            ],
            "provider_contract": "Repair and Verify are separate; Provider Uninstall is absent",
            "compatibility_contract": ["PM7_SETTINGS_OPEN_BLOOM", "PM_THEME", "PM_GLASS_LOCK_REFRESH", "PM12_KIMI"],
            "slint_portability": "no :has, color-mix, backdrop-filter, SVG filter, or viewport-width dependency in the adapted Settings owner",
            "protected_chat_source_guard": {"result": "pass", "slice_ids": sorted(chat_before)},
            "effect_surface_delta": {
                category: {
                    "added": sorted(effects_after[category] - effects_before[category]),
                    "removed": sorted(effects_before[category] - effects_after[category]),
                }
                for category in effects_before
            },
        }
    )
    return doc
