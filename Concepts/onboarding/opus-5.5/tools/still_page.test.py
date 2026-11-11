#!/usr/bin/env python3
"""still_page: which rules of a page give an element an endless animation, and the pause rules written for them
(the still page, PERF-3). Small pages, no browser. Run: python3 Concepts/onboarding/opus-5.5/tools/still_page.test.py"""
import re
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import still_page as sp  # noqa: E402


def page(css: str, js: str = '') -> str:
    return (f'<!doctype html><html><head><style id="t">{css}</style>\n</head>\n<body>'
            f'<script>{js}\nwindow.PM_STILL_SHEETS=[];</script></body></html>')


def rules(css: str, js: str = ''):
    """{(context, selector): body} of the generated sheet"""
    text, stats, notes = sp.generate(page(css, js))
    out = {}
    for ctx, sel, decls, _line, _part in sp.walk(text, 1):
        for one in sp.split_top(sel, ','):
            out[(ctx, ' '.join(one.split()))] = ' '.join(decls.split()).rstrip(';').strip()
    return out, stats, notes


def toggling(out):
    return {sel: body for (ctx, sel), body in out.items() if sp.HELD not in ctx}


def held(out):
    return {sel for (ctx, sel) in out if sp.HELD in ctx}


class Endless(unittest.TestCase):
    def test_literal_infinite_shorthand_and_count(self):
        out, _s, _n = rules('.a { animation: spin 1s linear infinite; } .b { animation: pop 300ms both; } '
                            '.c { animation-name: x; animation-iteration-count: infinite; }')
        sels = toggling(out)
        self.assertTrue(any(s.endswith(' .a') for s in sels))
        self.assertTrue(any(s.endswith(' .c') for s in sels))
        self.assertFalse(any(s.endswith(' .b') for s in sels), 'a finite animation is never held')
        self.assertTrue(all(b == sp.PLAY for b in sels.values()))

    def test_custom_property_values(self):
        css = ('.lens { animation: var(--lens-anim, none); } .on { --lens-anim: breathe 2s infinite; } '
               '.k { animation: var(--k1) var(--nx-1); } :root { --nx-1: 520ms ease backwards; } '
               '.t { animation: fade var(--gl-drain, 420ms) var(--ease-x, linear) both; } '
               '.d { animation: blip 900ms linear calc(800ms + var(--o) * 30ms) both; }')
        sels = toggling(rules(css)[0])
        self.assertTrue(any(s.endswith(' .lens') for s in sels), 'a custom property that may hold infinite')
        for finite in ('.k', '.t', '.d'):
            self.assertFalse(any(s.endswith(' ' + finite) for s in sels), f'{finite}: a time, an easing or a name')

    def test_script_only_custom_property(self):
        sels, _s, notes = rules('.u { animation: var(--made-by-script); } .w { animation: var(--ab-anim-goal); }')
        sels = toggling(sels)
        self.assertTrue(any(s.endswith(' .u') for s in sels), 'unknown: counted as endless')
        self.assertTrue(any('--made-by-script' in n for n in notes), 'and named in the build log')
        self.assertTrue(any(s.endswith(' .w') for s in sels), 'SCRIPT_VARS says --ab-anim-* is endless')

    def test_invalid_rule_with_at_keyword_is_dropped(self):
        out, _s, _n = rules('[data-theme^="retro"] @keyframes pulse { 0% { opacity: 0 } } .a { animation: x 1s infinite }')
        self.assertTrue(any(s.endswith(' .a') for s in toggling(out)))

    def test_quote_after_a_comment_closed_early(self):
        # base/style/pm6-css-dashboard.css: `min-*/` ends the comment, and "dashboard's" then opens a string that CSS
        # ends at the line's end; the rule below must still be read (it was missed while strings could run on)
        css = ('/* the blanket wall (width/min-*/\n   cut the dashboard\'s scroller. */\n.surf { color: red }\n'
               '.a { box-sizing: border-box; }\n.ph { animation: breath 1.8s ease-in-out infinite; }\n.z { content: \'x\'; }')
        sels = toggling(rules(css)[0])
        self.assertTrue(any(s.endswith(' .ph') for s in sels), sels)

    def test_style_inside_a_script_is_not_the_page(self):
        out, _s, _n = rules('.a { color: red }', js="const s = '<style>.b { animation: x 1s infinite }</style>';")
        self.assertFalse(any(s.endswith(' .b') for s in toggling(out)))


class Selectors(unittest.TestCase):
    def test_state_on_html(self):
        sels = toggling(rules('html[data-x] .a { animation: s 1s infinite } :root .b { animation: s 1s infinite } '
                              '[data-theme^="glass"] .c { animation: s 1s infinite } body .d { animation: s 1s infinite }')[0])
        self.assertTrue(any(re.fullmatch(r'html\[data-pm-still~="\d"\]\[data-x\] \.a', s) for s in sels), sels)
        self.assertTrue(any(re.fullmatch(r':root\[data-pm-still~="\d"\] \.b', s) for s in sels), sels)
        # data-theme is on <html>: written both ways
        self.assertTrue(any(re.fullmatch(r'html\[data-pm-still~="\d"\] \[data-theme\^="glass"\] \.c', s) for s in sels))
        self.assertTrue(any(re.fullmatch(r'html\[data-pm-still~="\d"\]\[data-theme\^="glass"\] \.c', s) for s in sels))
        # body is never <html>: only the descendant form
        self.assertEqual([s for s in sels if s.endswith(' .d')], [s for s in sels if re.fullmatch(r'html\[data-pm-still~="\d"\] body \.d', s)])

    def test_attribute_with_tilde_survives(self):
        sels = toggling(rules('html[data-parts~="square"] .a { animation: s 1s infinite }')[0])
        self.assertTrue(any('[data-parts~="square"]' in s for s in sels), sels)

    def test_media_context_kept(self):
        out, _s, _n = rules('@media (prefers-reduced-motion: no-preference) { .a { animation: s 1s infinite } }')
        self.assertTrue(any(ctx == ('@media (prefers-reduced-motion: no-preference)',) and sel.endswith(' .a') for ctx, sel in out))

    def test_broad_subject_held_through_its_ancestor(self):
        out, _s, _n = rules('.wave i { animation: eq 1s infinite } .st-working .nx-p { animation: l 9s infinite } '
                            '.beat > svg.nx .nx-p { animation: l 2s infinite }')
        sels = toggling(out)
        self.assertTrue(any(s.endswith(' .wave') and b == sp.HOLD for s, b in sels.items()), sels)
        self.assertTrue(any(s.endswith(' .st-working') and b == sp.HOLD for s, b in sels.items()))
        self.assertTrue(any(s.endswith(' .beat') and b == sp.HOLD for s, b in sels.items()), 'an svg is never the flag')
        self.assertEqual(held(out), {'.wave i', '.st-working .nx-p', '.beat > svg.nx .nx-p'})
        self.assertFalse(any(s.endswith(' i') or s.endswith('.nx-p') for s in sels), 'no toggling rule keyed on a broad subject')

    def test_broad_subject_without_ancestor_is_direct_and_noted(self):
        out, _s, notes = rules('html:not([data-motion]) i { animation: s 1s infinite }')
        self.assertTrue(any(s.endswith(' i') for s in toggling(out)))
        self.assertTrue(any('no narrow ancestor' in n for n in notes))

    def test_bare_universal_subject_fails(self):
        with self.assertRaises(sp.StillError):
            sp.generate(page('.x * { animation: s 1s infinite }'))

    def test_inline_style_in_markup(self):
        js = "const h = '<div class=\"work-progress\"><i style=\"width:72%;animation:scan 1.6s linear infinite\"></i></div>';"
        out, stats, _n = rules('.a { color: red }', js)
        self.assertEqual(stats['inline'], ['.work-progress > i[style*="infinite"]'])
        self.assertIn('.work-progress > i[style*="infinite"]', held(out))
        self.assertTrue(any(s.endswith(' .work-progress') for s in toggling(out)))

    def test_runtime_sheet_found(self):
        js = ("function animStyle() { const s = document.createElement('style'); s.id = 'pm-logo-anim'; }\n"
              "const ANIM = (n) => `animation:${n} var(--pml-dur) linear infinite var(--pml-ps,running)`;")
        _o, stats, _n = rules('.a { color: red }', js)
        self.assertEqual(stats['runtime_sheets'], ['pm-logo-anim'])

    def test_groups_share_keys_and_lint(self):
        css = ' '.join(f'.k{i} .p{i} {{ animation: s 1s infinite }} .k{i} .q{i} {{ animation: s 2s infinite }}' for i in range(12))
        text, stats, _n = sp.generate(page(css))
        self.assertEqual(sp.lint(text), [])
        groups = {}
        for ctx, sel, decls, _l, _p in sp.walk(text, 1):
            m = re.search(r'data-pm-still~="(\d)"', sel)
            if m:
                groups.setdefault(m.group(1), set()).add(sel)
        self.assertEqual(set(groups), {'1', '2', '3', '4'}, 'all four groups used')
        self.assertLessEqual(max(stats['group_weights']) - min(stats['group_weights']), 2)

    def test_blink_key(self):
        self.assertEqual(sp.blink_key('.a.b'), '.a')
        self.assertEqual(sp.blink_key('i[style*="x"]'), '[style')
        self.assertEqual(sp.blink_key(':where(.o55-spin):not(.t7)'), '.o55-spin')
        self.assertEqual(sp.blink_key('svg'), 'svg')
        self.assertEqual(sp.blink_key('#x.y'), '#x')


if __name__ == '__main__':
    unittest.main(verbosity=1)
