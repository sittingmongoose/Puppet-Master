import json

case = data
slice_key = case["fractional_slice_key"]
planar_key = case["planar_shape_key"]
old_exact = planar_key[0] <= slice_key <= planar_key[1]
new_half_slice = abs(slice_key - planar_key[0]) < 0.5
span = case["spanning_shape"]
span_outside = span[0] <= case["spanning_outside_slice"] <= span[1]
span_inside = span[0] <= case["spanning_inside_slice"] <= span[1]

index = case["index_zyx"]
scale = case["scale_zyx"]
translate = case["translate_zyx"]
physical = [t + i * s for i, s, t in zip(index, scale, translate)]
roundtrip = [(p - t) / s for p, s, t in zip(physical, scale, translate)]

chunk_bytes = case["chunk_shape_zyx"][0] * case["chunk_shape_zyx"][1] * case["bytes_per_sample"]
cache_bytes = case["cache_mib"] * 1024 * 1024
result = {
    "old_exact_planar_pick": old_exact,
    "new_half_slice_planar_pick": new_half_slice,
    "spanning_outside_visible": span_outside,
    "spanning_inside_visible": span_inside,
    "physical_zyx": physical,
    "index_roundtrip_zyx": roundtrip,
    "single_chunk_bytes": chunk_bytes,
    "chunks_in_cache_budget": cache_bytes // chunk_bytes,
}
assert result["old_exact_planar_pick"] is False
assert result["new_half_slice_planar_pick"] is True
assert result["spanning_outside_visible"] is False and result["spanning_inside_visible"] is True
assert all(abs(a - b) < 1e-12 for a, b in zip(roundtrip, index))
assert chunk_bytes == 128 * 1024
print(json.dumps(result, sort_keys=True))