import json

# W2: axis-order ambiguity discrimination on a synthetic acquisition.
# Same stored linear sample sequence (16 samples: C-major "CZ" layout, C=2, Z=2, Y=1, X=1,
# value = 10*c + z). Two equally plausible axis-order readings of the same stored
# sequence give different channel values. This is the failure class that explicit
# axes metadata (NGFF-style) exists to prevent.

C, Z = 2, 2
stored = [10 * c + z for c in range(C) for z in range(Z)]  # writer intended CZ

def read(order, ci, zi):
    if order == "CZ":
        return stored[ci * Z + zi]
    if order == "ZC":
        return stored[zi * C + ci]
    raise ValueError(order)

query = {"c": 1, "z": 0}
a = read("CZ", query["c"], query["z"])
b = read("ZC", query["c"], query["z"])

out = {
    "stored_sequence": stored,
    "query": query,
    "value_if_axes_CZ": a,
    "value_if_axes_ZC": b,
    "readings_disagree": a != b,
    "note": "same bytes, same index query, different sample; only explicit axes metadata disambiguates",
}
print(json.dumps(out, indent=1))