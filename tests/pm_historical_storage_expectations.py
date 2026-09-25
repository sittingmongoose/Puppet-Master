"""Exact historical expectation adjustment for the recorded Usage ID repair.

Commit 8dbfe1371 changed only this invalid disposition identifier. Historical
prefix tests still compare every row and every other field without exemptions.
"""
from copy import deepcopy


def with_recorded_usage_id_correction(rows):
    old = "scd.usage.command_transport.v2"
    new = "scd.usage.quota_command_transport.v1"
    assert sum(row.get("disposition_id") == old for row in rows) == 1
    assert not any(row.get("disposition_id") == new for row in rows)
    expected = deepcopy(rows)
    next(row for row in expected if row["disposition_id"] == old)["disposition_id"] = new
    return expected
