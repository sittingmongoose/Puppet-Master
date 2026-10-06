import json

spec = data
axes = spec["axes"]
index = spec["index"]
scale = spec["scale"]
translation = spec["translation"]
physical = [translation[i] + scale[i] * index[i] for i in range(len(axes))]
roundtrip = [(physical[i] - translation[i]) / scale[i] for i in range(len(axes))]
assert roundtrip == [float(v) for v in index]

chunk_bytes = spec["tile_y"] * spec["tile_x"] * spec["bytes_per_sample"]
cache_bytes = chunk_bytes * spec["cached_tiles"]
whole_source = spec["source_bytes"]
print(json.dumps({
    "axes_order": axes,
    "index": index,
    "physical": physical,
    "inverse_index": roundtrip,
    "tile_bytes": chunk_bytes,
    "cache_bytes": cache_bytes,
    "whole_source_bytes": whole_source,
    "source_to_cache_ratio": whole_source / cache_bytes,
}, sort_keys=True))