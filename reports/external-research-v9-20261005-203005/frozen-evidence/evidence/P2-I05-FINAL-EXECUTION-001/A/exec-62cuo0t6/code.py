import json

def apply_h(matrix, point):
    q = [*point, 1.0]
    out = [sum(a * b for a, b in zip(row, q)) for row in matrix]
    assert out[2] != 0
    return [out[0] / out[2], out[1] / out[2]]

src = data["source_index_xy"]
source_to_derived = data["source_to_derived_xy_homogeneous"]
derived_to_source = data["derived_to_source_xy_homogeneous"]
source_index = apply_h(source_to_derived, src)
reopened_source_index = apply_h(derived_to_source, source_index)
world = apply_h(data["source_index_to_world_um_homogeneous"], src)
assert source_index == data["expected_derived_index_xy"]
assert all(abs(a - b) < 1e-12 for a, b in zip(reopened_source_index, src))
assert world == data["expected_world_xy_um"]
print(json.dumps({"source_index_xy": src, "derived_index_xy": source_index, "roundtrip_source_index_xy": reopened_source_index, "source_world_xy_um": world, "passed": True}, sort_keys=True))