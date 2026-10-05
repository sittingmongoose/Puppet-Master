import json, struct

# Coordinate storage precision: float32 storage vs float64 vs JSON round-trip.
px = 104857.6            # ~1e5 px, far from origin; plausible for a large tiled frame
scale = 0.065            # um per px, typical high-NA objective pixel size

def as_f32(x):
    return struct.unpack('f', struct.pack('f', x))[0]

px32 = as_f32(px)
phys64 = px * scale
phys32 = px32 * as_f32(scale)
err_px = abs(px32 - px)
err_um = abs(phys32 - phys64)

doc = {"x_um": phys64, "y_px": px}
back = json.loads(json.dumps(doc))
exact64 = (struct.pack('d', back["x_um"]) == struct.pack('d', phys64)
           and struct.pack('d', back["y_px"]) == struct.pack('d', px))

px32_rt = json.loads(json.dumps({"v": px32}))["v"]
exact32 = struct.pack('d', px32_rt) == struct.pack('d', px32)

print("float64 stored px :", repr(px))
print("float32 stored px :", repr(px32), "err_px =", repr(err_px))
print("physical um f64   :", repr(phys64))
print("physical um f32   :", repr(phys32), "err_um =", repr(err_um))
print("json binary64 roundtrip exact :", exact64)
print("json text         :", json.dumps(doc))
print("float32 value roundtrips through JSON:", exact32,
      "(loss happens at storage width, not serialization)")