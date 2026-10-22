"""Build-time NieR lists for 19-nier-parts.js; layers supply NIER_ENTRIES, never source anchors.

emit(text, need, layers) renders all six declarations. The order below is the publication order,
independent of registration order. Missing layers contribute nothing; titles replace the Usage title.
Keep TITLES['usage'] as an empty slot before settings so the contributed Usage title
retains its publication order after the legacy fallback is retired.
"""
from __future__ import annotations

import re


LISTS = {
    'usage': ('cursor', 'chosen', 'strip', 'titles', 'confirm', 'cancel'),
    'home': ('cursor', 'chosen', 'strip'),
    'rail': ('chosen', 'strip'),
    'chat56': ('cursor', 'chosen', 'strip'),
}
USAGE_SLOT, HOME_SLOT, RAIL_SLOT, CHAT56_SLOT = object(), object(), object(), object()
SLOT_LAYERS = {USAGE_SLOT: 'usage', HOME_SLOT: 'home', RAIL_SLOT: 'rail', CHAT56_SLOT: 'chat56'}
CURSOR_ROWS = (
    ('.page-tab:not(.active)', '.pm6-tb-menu-item', '.pm6-tt-mode', '.pm6-tb-pages-more-item', '.activity-bar .icon', '.domain-link'),
    ('.side-link', '.index-link', '.page-index-title', '.workspace-tab', '.manager-tab', '.resource-row', '.pm51-popout-item:not([aria-disabled="true"])'),
    ('.pm51-menu-item', USAGE_SLOT, '.orch-tab', '.pm-segtab-item:not(.active)', '.fm-row', '.fm-ctx-item', '.ctx-item', '.menu-item'),
    ('.chat-dropdown-item', '.pm6-chat-more-item', '.cl-mode-item', '.pm-home-menu-row', '.palette-item', '.search-result-item', '.slash-cmd-item', HOME_SLOT),
    ('.pm6-chat-slash-item', '.pm6-fab-item', '.chat-thread-item', '.pm6-dash-catalog-item', '[role="menuitem"]', '[role="option"]:not([aria-disabled="true"])',
     CHAT56_SLOT),
)
RAIL_CURSOR_COMMENT = (
    '    /* the left rail (concept D, Polish, Concepts/leftrail-redesign): its rows and every PMR.menu item carry .pmr-cur;\n'
    '       their ink bar is the rail package\'s CSS (src/css/40-nier.css), the square cursor and its tick come from here */\n'
)
CHOSEN = ('.page-tab', '.workspace-tab', '.manager-tab', '.orch-tab', USAGE_SLOT, '.domain-link', '.side-link', '.index-link',
          '.page-index-title', '.pm-segtab-item', RAIL_SLOT, '.activity-bar .icon', '.resource-row', HOME_SLOT, CHAT56_SLOT)
STRIP = ('.page-tab', RAIL_SLOT, '.workspace-tab', '.manager-tab', '.orch-tab', '.pm-segtab-item', HOME_SLOT,
         '.pm6-tt-mode', USAGE_SLOT, CHAT56_SLOT)
TITLES = {
    'dashboard': '.page-dashboard .pm6-dash-card-title',
    'projects': '.page-projects .projects-title',
    'wizard': '.page-wizard .pm6-wiz-hero-title',
    'orchestrator': '.page-orchestrator .orch-title',
    'usage': '',  # The Usage layer supplies this page's title selectors.
    'settings': '#panel-settings .rail-title, #panel-settings .workspace-separator h2',
}
CONFIRM = ('.btn.primary', 'button[type="submit"]', '.n-btn.primary', '.pm6-dash-btn:not(.pm6-dash-btn--ghost)',
           '.primary-button', '.o55-btn-primary', '[data-o55-preview="keep"]')
CANCEL = ('[data-action="close-overlay"]', '.n-x', '[aria-label="Close"]', '[aria-label="Dismiss"]', '.n-btn.danger',
          '[data-o55-preview="back"]', '[data-o55-nier-note="close"]')
DECLARATION = re.compile(
    r"^  const (CURSOR_SEL|CHOSEN_SEL|STRIP_SEL|PAGE_TITLES|CONFIRM_SEL|CANCEL_SEL) = "
    r"(?:__NIER_[A-Z]+__|\[[\s\S]*?\]\.join\(','\)|\{[\s\S]*?^  \}|'(?:\\.|[^'\\\n])*');$", re.M)


def _quote(value: str) -> str:
    return "'" + value.replace('\\', '\\\\').replace("'", "\\'") + "'"


def emit(text: str, need, layers: dict[str, dict[str, list[str]]]) -> str:
    """Emit from data into named declarations, including re-emission for the rail review profile."""
    for layer, entries in layers.items():
        need(layer in LISTS, f'NieR registry: unknown layer {layer!r}')
        need(isinstance(entries, dict), f'NieR registry: {layer} entries must be a dictionary')
        for name, values in entries.items():
            need(name in LISTS[layer], f'NieR registry: {layer} has unknown list {name!r}')
            need(isinstance(values, list) and all(isinstance(v, str) and v and '\n' not in v and '\r' not in v for v in values),
                 f'NieR registry: {layer}.{name} must be a list of nonempty, single-line selectors')

    def values(layer: str, name: str) -> list[str]:
        return layers.get(layer, {}).get(name, [])

    def expand(entries: tuple, name: str) -> list[str]:
        out = []
        for entry in entries:
            if entry in SLOT_LAYERS:
                out.extend(values(SLOT_LAYERS[entry], name))
            else:
                out.append(entry)
        return out

    cursor = [expand(row, 'cursor') for row in CURSOR_ROWS]
    chosen = expand(CHOSEN, 'chosen')
    strip = expand(STRIP, 'strip')
    titles = dict(TITLES)
    titles['usage'] = ', '.join(values('usage', 'titles'))
    expressions = {
        'CURSOR_SEL': ('[' + ',\n    '.join(', '.join(map(_quote, row)) for row in cursor) + ',\n'
                       + RAIL_CURSOR_COMMENT + "    '.pmr-cur:not(.active):not([aria-disabled=\"true\"])'].join(',')"),
        'CHOSEN_SEL': _quote(', '.join(chosen)),
        'STRIP_SEL': _quote(', '.join(strip)),
        'PAGE_TITLES': '{\n' + ',\n'.join(f'    {page}: {_quote(selectors)}' for page, selectors in titles.items()
                                       if selectors is not None) + '\n  }',
        'CONFIRM_SEL': _quote(', '.join([*CONFIRM, *values('usage', 'confirm')])),
        'CANCEL_SEL': _quote(', '.join([*CANCEL, *values('usage', 'cancel')])),
    }
    matches = list(DECLARATION.finditer(text))
    for name in expressions:
        count = sum(m.group(1) == name for m in matches)
        need(count == 1, f'NieR registry: declaration {name} found {count} times (need exactly 1)')
    return DECLARATION.sub(lambda m: f'  const {m.group(1)} = {expressions[m.group(1)]};', text)
