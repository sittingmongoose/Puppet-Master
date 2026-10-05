axes = data["axes"]
index = data["index"]
scale = data["scale"]
translation = data["translation"]
physical = {axis: index[axis] * scale[axis] + translation[axis] for axis in axes}
expected = data["expected_physical"]
assert all(abs(physical[a] - expected[a]) < 1e-12 for a in axes)
recovered = {axis: (physical[axis] - translation[axis]) / scale[axis] for axis in axes}
assert all(abs(recovered[a] - index[a]) < 1e-12 for a in axes)
print({"physical": physical, "recovered_index": recovered, "round_trip": True})