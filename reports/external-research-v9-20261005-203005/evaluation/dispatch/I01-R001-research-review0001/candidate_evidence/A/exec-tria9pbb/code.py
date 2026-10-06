import json, struct

# W1: stored-coordinate precision and transform composition order.
# Claim to discriminate: storing annotation coordinates and calibration values as
# IEEE-754 double and serializing via JSON (Python repr, shortest round-trip form)
# is exact; routing intermediate math through float32 is not, when a large stage
# origin is present.

pts = [123456.7890123456, 2.9033, 0.1 + 0.2, 1e-7, 12345678901234.567]
roundtrip = {repr(p): (p == json.loads(json.dumps(p))) for p in pts}

def f32(x):
    return struct.unpack('f', struct.pack('f', x))[0]

origin, pixel_size_um, index = 100000.0, 0.101, 1234
world_f64 = origin + index * pixel_size_um
world_via_f32 = f32(f32(origin) + f32(index * pixel_size_um))
drift_um = abs(world_f64 - world_via_f32)

# composition order: scale S=(2,2), translate T=(10,0), point p=(2,3)
p, S, T = (2.0, 3.0), (2.0, 2.0), (10.0, 0.0)
scale_then_translate = (p[0]*S[0] + T[0], p[1]*S[1] + T[1])
translate_then_scale = ((p[0]+T[0])*S[0], (p[1]+T[1])*S[1])

out = {
    "json_float64_roundtrip_exact": roundtrip,
    "world_f64_um": world_f64,
    "world_via_f32_um": world_via_f32,
    "f32_drift_um": drift_um,
    "scale_then_translate": scale_then_translate,
    "translate_then_scale": translate_then_scale,
    "orders_differ": scale_then_translate != translate_then_scale,
}
print(json.dumps(out, indent=1))