"""Lane DS sweep part 2A witnesses: one coherent complete input per table row that
no existing witness refuses alone. Each is built from a named valid parent with one
changed fact and every copy that observes it moved, and must be refused first at
exactly its target row (scripts/pm-ds-guard-tables.py checks this)."""
from __future__ import annotations


def cases():
    """(id, zero-argument call that runs the complete checker on the witness)."""
    return []
