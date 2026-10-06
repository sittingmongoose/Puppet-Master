import json

def matvec(matrix, vector):
    return [sum(a * b for a, b in zip(row, vector)) for row in matrix]

axes = data["axes"]
idx = data["sample_index_by_axis"]
assert axes == ["t", "c", "z", "y", "x"]
index_xyz = [idx[axis] for axis in ("x", "y", "z")]
physical = [a + b for a, b in zip(data["origin_um"], matvec(data["index_to_physical_um"], index_xyz))]
# source = crop_offset + sampling_matrix * derived_index
source_from_derived = [
    a + b for a, b in zip(data["crop_offset_xyz"], matvec(data["source_per_derived_xyz"], data["derived_index_xyz"]))
]
derived_back = [
    (s - o) / scale
    for s, o, scale in zip(source_from_derived, data["crop_offset_xyz"], data["source_per_derived_diagonal_xyz"])
]
assert index_xyz == data["expected_source_index_xyz"]
assert physical == data["expected_physical_um"]
assert source_from_derived == index_xyz
assert derived_back == data["derived_index_xyz"]
print(json.dumps({
    "source_index_xyz": index_xyz,
    "physical_um": physical,
    "source_index_from_derived_grid": source_from_derived,
    "derived_index_roundtrip": derived_back,
    "passed": True,
}, sort_keys=True))