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


if __name__ == '__main__':
    unittest.main()
