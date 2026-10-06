from math import isclose

origin = (100.0, 100.0)
spacing = (2.0, 2.0)
indices = ((0.0, 0.0), (7.0, 7.0))
physical = tuple(tuple(o + s * i for o, s, i in zip(origin, spacing, point)) for point in indices)
recovered = tuple(tuple((p - o) / s for o, s, p in zip(origin, spacing, point)) for point in physical)
assert physical == ((100.0, 100.0), (114.0, 114.0))
assert all(isclose(actual, expected) for actual_point, expected_point in zip(recovered, indices) for actual, expected in zip(actual_point, expected_point))
print({"physical_points": physical, "round_trip_indices": recovered})