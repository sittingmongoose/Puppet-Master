"""Source-only census fixture. The scanner reads this module without importing it."""

import importlib
import operator
import pm_guard_isolation as engine
import prescan_fixture_pkg.nested.source

read_attribute = operator.attrgetter('label')
call_method = operator.methodcaller('strip')
loader = importlib.import_module
private_name = engine._fixture_marker


def production_only(table):
    table._restore()
