import json

c = data
slice_key = c["fractional_slice_key"]
planar = c["planar_shape_key"]
old_exact = planar[0] <= slice_key <= planar[1]
half_slice = abs(slice_key - planar[0]) < 0.5
span = c["spanning_shape"]
span_outside = span[0] <= c["spanning_outside_slice"] <= span[1]
span_inside = span[0] <= c["spanning_inside_slice"] <= span[1]
index = c["index_zyx"]
scale = c["scale_zyx"]
translate = c["translate_zyx"]
physical = [t + i * s for i, s, t in zip(index, scale, translate)]
roundtrip = [(p - t) / s for p, s, t in zip(physical, scale, translate)]
chunk_bytes = c["chunk_shape_zyx"][0] * c["chunk_shape_zyx"][1] * c["chunk_shape_zyx"][2] * c["bytes_per_sample"]
cache_bytes = c["cache_mib"] * 1024 * 1024
result = {
    "old_exact_planar_pick": old_exact,
    "new_half_slice_planar_pick": half_slice,
    "spanning_outside_visible": span_outside,
    "spanning_inside_visible": span_inside,
    "physical_zyx": physical,
    "index_roundtrip_zyx": roundtrip,
    "single_chunk_bytes": chunk_bytes,
    "chunks_in_cache_budget": cache_bytes // chunk_bytes,
}
print(json.dumps(result, sort_keys=True))
assert old_exact is False and half_slice is True
assert span_outside is False and span_inside is True
assert all(abs(a - b) < 1e-12 for a, b in zip(roundtrip, index))
assert chunk_bytes == 131072