import json, struct

def through_f32(x):
    """float64 -> IEEE-754 float32 -> float64 (what float32 storage would keep)."""
    return struct.unpack('f', struct.pack('f', x))[0]

# Calibration-like values: 0.3625 um pixel and 2.9033 um z-step appear in
# captured tifffile issue #334 metadata; the others probe large magnitudes.
cal = [0.3625, 2.9033, 1e-3, 1048576.5, 123456.789125]

json_rt_exact = all(json.loads(json.dumps(v)) == v for v in cal)
print("float64-JSON round-trip exact for all calibration values:", json_rt_exact)
for v in cal:
    print(f"  f32 abs error for {v!r}: {through_f32(v) - v:+.3e}")

def max_index_error(axis_len, spacing):
    """Max |round(f32(i*spacing)/spacing) - i| sampling the axis."""
    worst = 0
    step = max(1, axis_len // 50000)
    for i in range(0, axis_len, step):
        p = i * spacing
        worst = max(worst, abs(round(through_f32(p) / spacing) - i))
    return worst

r1 = max_index_error(3_000_000_000, 0.3625)  # pathological: one axis holds all 3 GB
r2 = max_index_error(54_772, 0.3625)         # 54772^2 uint8 = ~3 GB 2D slice
r3 = max_index_error(1442, 0.3625)           # 1442^3 uint8 = ~3 GB volume
print("max voxel-index error, float32 physical coords:")
print(f"  single-axis 3 GB extent: {r1}")
print(f"  2D slice 54772 px:       {r2}")
print(f"  volume 1442^3:           {r3}")
