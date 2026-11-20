"""Native nesting and media logic must not hide a broad invalidation set. Stdlib only."""
import unittest
import invalidation_sets as lint


class InvalidationSetsTests(unittest.TestCase):
    def problems(self, css):
        return lint.published_problems('<style id="probe">' + css + '</style>', known={})

    def test_review_flat_rule(self):
        self.assertEqual(len(self.problems('.card:hover * { color:red }')), 1)

    def test_review_native_nesting(self):
        self.assertEqual(len(self.problems('.card { &:hover * { color:red } }')), 1)

    def test_review_or_media(self):
        self.assertEqual(len(self.problems('@media (hover:none) or (min-width:1px) { .card:hover * { color:red } }')), 1)

    def test_implicit_descendant_and_parent_list(self):
        p = self.problems('.card:hover, .tile:hover { color:blue; * { color:red } }')
        self.assertEqual(len(p), 1)  # :is() parent list writes one set entry for :hover
        self.assertIn(':is(.card:hover, .tile:hover) *', p[0])

    def test_supports_and_layer_inside_style(self):
        self.assertEqual(len(self.problems('.card { @supports (display:grid) { @layer ui { &:hover * { color:red } } } }')), 1)

    def test_selector_functions_with_nesting(self):
        for fn in ('is', 'where', 'not'):
            with self.subTest(fn=fn):
                self.assertEqual(len(self.problems(f'.card {{ &:{fn}(:hover, :focus-visible) * {{ color:red }} }}')), 2)
        self.assertEqual(len(self.problems(':is(.card:hover, .tile) { & > :where(*) { color:red } }')), 1)
        self.assertEqual(self.problems('.card:hover { :is(.title, .copy) { color:red } }'), [])

    def test_attribute_string_comma_bracket_and_brace(self):
        p = self.problems('[data-name="a,]b{c"] { &:hover * { color:red } }')
        self.assertEqual(len(p), 1)
        self.assertIn('[data-name="a,]b{c"]:hover *', p[0])

    def test_comment_inside_selector(self):
        p = self.problems('.card/**/:hover { /* between */ & > * { color:red } }')
        self.assertEqual(len(p), 1)
        self.assertIn('`.card:hover > *`', p[0])

    def test_escaped_colon_is_not_a_pseudo_class(self):
        self.assertEqual(self.problems(r'.card\:hover * { color:red }'), [])
        self.assertEqual(len(self.problems(r'.card\:name { &:hover * { color:red } }')), 1)

    def test_escaped_type_selector(self):
        self.assertEqual(len(self.problems(r'\78 -tag:hover * { color:red }')), 1)
        self.assertEqual(len(self.problems(r'\x-tag:hover * { color:red }')), 1)

    def test_inactive_media_logic(self):
        for media in ['(hover:none)', '(hover:none) and (min-width:1px)', '(hover:none) or print',
                      '((hover:none) or (pointer:coarse))', 'not (hover:hover)', 'not screen',
                      'not ((hover:hover) and (pointer:fine))']:
            with self.subTest(media=media):
                self.assertEqual(self.problems('@media ' + media + ' { .card:hover * {color:red} }'), [])
        for media in ['(hover:none) or (min-width:1px)', '(hover:none), screen',
                      'not (hover:none)', 'not screen and (hover:none)', '(hover:hover) and (width > 1px)',
                      'not ((hover:none) and (width > 1px))']:
            with self.subTest(media=media):
                self.assertEqual(len(self.problems('@media ' + media + ' { .card:hover * {color:red} }')), 1)

    def test_inline_script_style_literal_is_not_a_stylesheet(self):
        page = '<script>const html = "<style>"; const re = /fake/; </script><style id="real">.card:hover * {color:red}</style>'
        blocks = lint.blocks_of(page)
        self.assertEqual([b[0] for b in blocks], ['real'])
        self.assertEqual(len(lint.published_problems(page, known={})), 1)

    def test_group_without_nesting_and_keyframes(self):
        self.assertEqual(len(self.problems('@supports (display:grid) { @layer ui { .card:hover * {color:red} } }')), 1)
        self.assertEqual(self.problems('@keyframes loop { from {opacity:0} to {opacity:1} }'), [])

    # PM7PERF-LINT-MEDIA-NOT (R11 F1): a comma binds loosest; `not <type>` negates its own query, not the list
    def test_media_not_type_inside_a_list(self):
        self.assertEqual(len(self.problems('@media not print and (hover:none), screen { .card:hover * {color:red} }')), 1)
        self.assertEqual(len(self.problems('@media screen, not print and (hover:none) { .card:hover * {color:red} }')), 1)
        self.assertEqual(self.problems('@media not screen, print { .card:hover * {color:red} }'), [])

    # PM7PERF-LINT-ESCAPED-STATE (R12-2): escaped names are the names Chrome keys its sets on
    def test_escaped_state_names(self):
        self.assertEqual(len(self.problems(r'.card:hov\65 r * { color:red }')), 1)
        self.assertEqual(len(self.problems(r'.card:HOVER * { color:red }')), 1)
        self.assertEqual(len(self.problems(r'.card.pmh\-on * { color:red }')), 1)
        self.assertEqual(len(self.problems(r'[aria\-selected="true"] * { color:red }')), 1)
        self.assertEqual(len(self.problems(r'.card:hover .t\69 tle { color:red }')), 0)  # keyed on .title, escaped

    # R51 F3: escapes decode in one pass; \5c is a literal backslash in the name, so ':\5c hover' is not :hover
    def test_escape_decoded_once(self):
        self.assertEqual(lint.css_unescape(r'\5c hover'), '\\hover')
        self.assertEqual(lint.css_unescape(r'\\68 over'), '\\68 over')
        self.assertEqual(lint.css_unescape(r'hov\65 r'), 'hover')
        self.assertEqual(lint.css_unescape(r'pmh\-on'), 'pmh-on')
        self.assertEqual(self.problems(r'.card:\5c hover * { color:red }'), [])
        self.assertEqual(len(self.problems(r'.card:\68 over * { color:red }')), 1)

    # R53-C2, R54 F2: a hex escape's terminating space is the escape's; the whitespace after it is still a combinator
    def test_escape_terminator_then_descendant(self):
        self.assertEqual(len(self.problems(r'.card:hove\72  * { color:red }')), 1)
        self.assertEqual(len(self.problems(r'.card.pmh-o\6e  * { color:red }')), 1)
        self.assertEqual(len(self.problems('.card:hove\\72\r\n\t* { color:red }')), 1)
        self.assertEqual(len(self.problems(r'.card:hove\72 { * { color:red } }')), 1)  # a nesting parent ending in one
        self.assertEqual(len(self.problems(r'.card:hove\72 { & * { color:red } }')), 1)
        self.assertEqual(len(self.problems(r'@scope (.card:hove\72 ) { * { color:red } }')), 1)  # a scope root ending in one
        self.assertEqual(self.problems(r'.card:hove\72 x { color:red }'), [])  # one space: part of the escape, :hoverx
        self.assertEqual(len(self.problems(r'.card:hove\72 > * { color:red }')), 1)

    # PM7PERF-LINT-SCOPE-ROOT (R18-2): a scope root's (and limit's) state is the state of the rules inside
    def test_scope_root_state(self):
        self.assertEqual(len(self.problems('@scope (.card:hover) { * { color:red } }')), 1)
        self.assertEqual(len(self.problems('@scope (.card) { :scope:hover * { color:red } }')), 1)
        self.assertEqual(len(self.problems('@scope (.card) to (.slot:hover) { * { color:red } }')), 1)
        self.assertEqual(len(self.problems('.list { @scope (.card:hover) { svg { color:red } } }')), 1)
        self.assertEqual(self.problems('@scope (.card:hover) { .title { color:red } }'), [])

    # PM7PERF-LINT-UPPERCASE-AT (R18-3): at-keywords are case-insensitive
    def test_uppercase_at_rules(self):
        self.assertEqual(len(self.problems('@MEDIA screen { .card:hover * { color:red } }')), 1)
        self.assertEqual(len(self.problems('@Supports (display:grid) { .card:hover * { color:red } }')), 1)
        self.assertEqual(len(self.problems('@LAYER ui { .card:hover * { color:red } }')), 1)
        self.assertEqual(self.problems('@MEDIA (hover:none) { .card:hover * { color:red } }'), [])


if __name__ == '__main__':
    unittest.main()
