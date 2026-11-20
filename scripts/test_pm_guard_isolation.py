"""Focused regressions for the guard engine, using the DDBG fixtures where applicable."""

from pathlib import Path
import unittest

import pm_debug_investigation_guard_suites as ddbg
import pm_guard_isolation as guard


ROOT = Path(__file__).resolve().parent.parent


def reference_nodes(document):
    """The DDBG reference factory's original document-order walk."""
    nodes, pending = [], [document]
    while pending:
        node = pending.pop()
        if type(node) is dict:
            nodes.append(node)
            pending.extend(reversed(list(node.values())))
        elif type(node) is list:
            pending.extend(reversed(node))
    return nodes


class GuardEngineTests(unittest.TestCase):
    def test_ddbg_reversed_reference_walk(self):
        suite = ddbg.references_suite()
        document = suite.controls[0].value
        self.assertTrue(reference_nodes(document))
        # Snapshot the walk without the test module's unrelated globals.
        walk = type(reference_nodes)(reference_nodes.__code__, {'__builtins__': __builtins__})
        guard._certified_snapshot([walk], ROOT, identities=True)
        # Certification is by identity, including an alias of the real builtin.
        guard._certified_snapshot([{'walk_backwards': reversed}], ROOT, identities=True)
        with self.assertRaisesRegex(guard.IsolationError, 'external class graph'):
            guard._certified_snapshot([type('reversed', (), {'__module__': 'builtins'})], ROOT, identities=True)


if __name__ == '__main__':
    unittest.main()
