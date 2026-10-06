import re

# W1: notebook document semantics per jupyter nbformat v4.5 schema (captured schema used as spec)
# Schema constraints under test: cell id pattern/length; code_cell requires id, outputs,
# execution_count (null if not run); execute_result output carries its own execution_count.
CELL_ID = re.compile(r'^[a-zA-Z0-9-_]+$')

def make_cell(i, src, ec, outputs):
    return {"id": "cell-%02d" % i, "cell_type": "code", "metadata": {}, "source": src,
            "outputs": outputs, "execution_count": ec}

nb = {"nbformat": 4, "nbformat_minor": 5,
      "metadata": {"kernelspec": {"name": "python3", "display_name": "Python 3"}},
      "cells": [
          make_cell(1, "import pandas\n", 1, []),
          make_cell(2, "df = load()\ndf.shape\n", 2,
                    [{"output_type": "execute_result",
                      "data": {"text/plain": "(10, 3)"},
                      "metadata": {}, "execution_count": 2}]),
          make_cell(3, "plot(df)\n", 3, []),
      ]}

def valid_ids(doc):
    return all(CELL_ID.match(c["id"]) and 1 <= len(c["id"]) <= 64 for c in doc["cells"])

assert nb["nbformat"] == 4 and nb["nbformat_minor"] >= 5
assert valid_ids(nb)

by_id = {c["id"]: c for c in nb["cells"]}
orig_display_order = [c["id"] for c in nb["cells"]]
nb["cells"].reverse()  # user drags cells around: displayed order changes
assert valid_ids(nb)
assert [c["id"] for c in nb["cells"]] != orig_display_order, "display order changed"
assert by_id["cell-01"]["execution_count"] < by_id["cell-02"]["execution_count"] < by_id["cell-03"]["execution_count"], \
    "execution order (execution_count) is independent of display order"
out = by_id["cell-02"]["outputs"][0]
assert out["execution_count"] == by_id["cell-02"]["execution_count"] == 2, \
    "saved output remains associated with its producing execution after reorder"
draft = make_cell(4, "x = 1\n", None, [])
assert draft["execution_count"] is None, "schema: null execution_count means cell has not been run"
err = {"output_type": "error", "ename": "ValueError", "evalue": "bad value", "traceback": ["frame..."]}
assert set(err) == {"output_type", "ename", "evalue", "traceback"}, "error outputs are structured data, not prose"

print("W1 PASS")
print("display order after edit:", [c["id"] for c in nb["cells"]])
print("execution order from execution_count:", sorted(nb["cells"], key=lambda c: c["execution_count"] or -1)[0:0] or
      [c["id"] for c in sorted([c for c in nb["cells"] if c["execution_count"] is not None],
                               key=lambda c: c["execution_count"])])
print("output->execution association stable after reorder: cell-02 out ec == 2")
print("unexecuted cell ec null: OK; error output structured: OK")