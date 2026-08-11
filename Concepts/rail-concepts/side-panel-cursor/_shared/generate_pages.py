#!/usr/bin/env python3
"""Generate shell + lab HTML pages for side-panel prototypes."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SHELLS = ROOT / "shells"
LABS = ROOT / "labs"
V = "20260724v8"

FONTS = (
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700"
    "&family=Nunito:wght@600;700&family=Orbitron:wght@600;700"
    "&family=Quicksand:wght@500;600;700&family=Rajdhani:wght@500;600;700&display=swap"
)

SHARED = f"""  <link rel="stylesheet" href="../_shared/tokens.css?v={V}" />
  <link rel="stylesheet" href="../_shared/sprout-menu.css?v={V}" />
  <link rel="stylesheet" href="../_shared/shell-chrome.css?v={V}" />
  <link rel="stylesheet" href="../_shared/lab-skins.css?v={V}" />
  <script src="../_shared/demo-data.js?v={V}"></script>
  <script src="../_shared/icons.js?v={V}"></script>
  <script src="../_shared/sprout-menu.js?v={V}"></script>
  <script src="../_shared/panels.js?v={V}"></script>
  <script src="../_shared/lab-variants.js?v={V}"></script>
  <script src="../_shared/shell-chrome.js?v={V}"></script>"""

SHELL_META = [
    ("01-stacked-rail.html", "01", "stacked", "Stacked Rail",
     "Zero nested cards. Sticky header + query/action rail; continuous list with hairline separators only. Status collapses to a chip that sprouts detail."),
    ("02-segment-strip.html", "02", "segment", "Segment Strip",
     "Horizontal segmented subviews (icon+label → compresses at 220px). Body is always one pure list. Overflow actions in a kebab sprout."),
    ("03-inspector-sheet.html", "03", "sheet", "Inspector Sheet",
     "List dominates (~80%). Selecting a row updates the in-panel bottom sheet — no side-by-side columns."),
    ("04-command-toolbar.html", "04", "toolbar", "Command Toolbar",
     "Dense icon toolbar + wrapping filter chips (collapse to overflow sprout at min width). Content flat; primary CTAs pin to footer."),
    ("05-icon-spine.html", "05", "spine", "Icon Spine",
     "Vertical subview spine on the panel inner edge; content column beside it. At 220px spine is 28px; labels live in tooltips."),
    ("06-focus-ladder.html", "06", "ladder", "Focus Ladder",
     "Only one accordion section open at a time; counts on headers. Scope/branch/runtime always use PM sprout menus."),
]

LABS_META = [
    ("search.html", "search", "Search"),
    ("source.html", "source", "Source Control"),
    ("actions.html", "actions", "GitHub Actions"),
    ("docker.html", "docker", "Docker Manager"),
    ("tests.html", "tests", "Testing"),
    ("agents.html", "agents", "Agents"),
    ("artifacts.html", "artifacts", "Artifacts"),
]


def shell_html(filename, shell_id, layout, title, blurb):
    return f"""<!DOCTYPE html>
<html lang="en" data-theme="friendly-dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>PM Side Panels — {shell_id} {title}</title>
  <link href="{FONTS}" rel="stylesheet" />
{SHARED}
</head>
<body>
<script>
SPProto.mountShell({{
  shellId: {shell_id!r},
  layout: {layout!r},
  title: {title!r},
  blurb: {blurb!r}
}});
</script>
</body>
</html>
"""


def studio_html():
    return f"""<!DOCTYPE html>
<html lang="en" data-theme="friendly-dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>PM Side Panels — Lab studio</title>
  <link href="{FONTS}" rel="stylesheet" />
{SHARED}
</head>
<body>
<script>
SPProto.mountLab({{}});
</script>
</body>
</html>
"""


def lab_html(filename, panel_id, title):
    """Thin wrapper: same unified studio mount, initial panel only."""
    return f"""<!DOCTYPE html>
<html lang="en" data-theme="friendly-dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>PM Side Panels Lab — {title}</title>
  <link href="{FONTS}" rel="stylesheet" />
{SHARED}
</head>
<body>
<script>
SPProto.mountLab({{ panelId: {panel_id!r} }});
</script>
</body>
</html>
"""


def main():
    SHELLS.mkdir(parents=True, exist_ok=True)
    LABS.mkdir(parents=True, exist_ok=True)
    for filename, shell_id, layout, title, blurb in SHELL_META:
        (SHELLS / filename).write_text(shell_html(filename, shell_id, layout, title, blurb), encoding="utf-8")
        print("wrote shells/" + filename)
    (LABS / "studio.html").write_text(studio_html(), encoding="utf-8")
    print("wrote labs/studio.html")
    for filename, panel_id, title in LABS_META:
        (LABS / filename).write_text(lab_html(filename, panel_id, title), encoding="utf-8")
        print("wrote labs/" + filename)
    print("done", V)


if __name__ == "__main__":
    main()
