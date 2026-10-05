
# W1: notebook-document fidelity check (informed by pinned nbformat v4.5 schema).
# Scope: schema-level rules only; does not run the real nbformat library.
import json, re, hashlib

ID_RE = re.compile(r'^[a-zA-Z0-9-_]+$')
OUT_TYPES = {"execute_result", "display_data", "stream", "error"}
problems = []

def check_cell(c, where):
    for k in ("cell_type", "metadata", "source"):
        if k not in c:
            problems.append(f"{where}: missing required key {k}")
    cid = c.get("id")
    if cid is None:
        problems.append(f"{where}: missing required id (nbformat>=4.5)")
    elif not isinstance(cid, str) or not ID_RE.match(cid) or not (1 <= len(cid) <= 64):
        problems.append(f"{where}: id violates ^[a-zA-Z0-9-_]+$/, len 1..64: {cid!r}")
    if c.get("cell_type") == "code":
        for k in ("outputs", "execution_count"):
            if k not in c:
                problems.append(f"{where}: code cell missing required {k}")
        ec = c.get("execution_count")
        if not (ec is None or (isinstance(ec, int) and not isinstance(ec, bool) and ec >= 0)):
            problems.append(f"{where}: execution_count must be integer>=0 or null, got {ec!r}")
        for i, o in enumerate(c.get("outputs", [])):
            if not isinstance(o, dict) or o.get("output_type") not in OUT_TYPES:
                problems.append(f"{where}: output[{i}] output_type not in {sorted(OUT_TYPES)}")
            if o.get("output_type") == "error" and not all(k in o for k in ("ename", "evalue", "traceback")):
                problems.append(f"{where}: error output missing ename/evalue/traceback")

# Display order deliberately differs from execution order (out-of-order kernel runs).
nb = {
    "cells": [
        {"id": "cell-load", "cell_type": "code", "metadata": {}, "source": ["df = load()"],
         "outputs": [{"output_type": "stream", "name": "stdout", "text": ["loaded"]}], "execution_count": 1},
        {"id": "cell-plot", "cell_type": "code", "metadata": {}, "source": ["show(df)"],
         "outputs": [{"output_type": "display_data", "data": {"text/plain": ["<fig>"]}, "metadata": {}},
                     {"output_type": "error", "ename": "ValueError", "evalue": "bad col", "traceback": ["..."]}],
         "execution_count": 3},
        {"id": "note-md", "cell_type": "markdown", "metadata": {}, "source": ["# notes"]},
        {"id": "cell-stat", "cell_type": "code", "metadata": {}, "source": ["df.mean()"],
         "outputs": [{"output_type": "execute_result", "execution_count": 2,
                      "data": {"text/plain": ["0.5"]}, "metadata": {}}], "execution_count": 2},
        {"id": "cell-fresh", "cell_type": "code", "metadata": {}, "source": ["new_cell()"],
         "outputs": [], "execution_count": None},
    ],
    "metadata": {"kernelspec": {"name": "python3", "display_name": "Python 3"},
                 "language_info": {"name": "python"}},
    "nbformat": 4,
    "nbformat_minor": 5,
}

ks = nb["metadata"].get("kernelspec", {})
if not ({"name", "display_name"} <= set(ks)):
    problems.append("kernelspec requires name and display_name")
if nb.get("nbformat") != 4 or nb.get("nbformat_minor", 0) < 5:
    problems.append("nbformat must be 4.x with minor>=5 for cell ids")

for i, c in enumerate(nb["cells"]):
    check_cell(c, f"cells[{i}]")

# Display order vs execution order vs replay order
display_order = [c["id"] for c in nb["cells"] if c["cell_type"] == "code"]
exec_order = [c["id"] for c in sorted((c for c in nb["cells"] if c["cell_type"] == "code"),
                                      key=lambda c: c["execution_count"])]
assert display_order == ["cell-load", "cell-plot", "cell-stat", "cell-fresh"]
assert exec_order == ["cell-load", "cell-stat", "cell-plot", "cell-fresh"], exec_order
assert display_order != exec_order, "expected display order to differ from execution order"

receipt = {
    "check": "W1 nbformat-4.5-informed document fidelity",
    "cells_validated": len(nb["cells"]),
    "problems": problems,
    "display_order": display_order,
    "replay_order_by_execution_count": exec_order,
    "doc_sha256": hashlib.sha256(json.dumps(nb, sort_keys=True).encode()).hexdigest()[:16],
}
print(json.dumps(receipt, indent=1))
assert not problems, "document violates schema-derived rules"
print("W1 PASS")
