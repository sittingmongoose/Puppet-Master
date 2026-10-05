import json, struct

# W1: coordinate storage precision - float32 vs float64 vs JSON round-trip
scale = 0.065  # micrometers per pixel (typical 20x objective)
x_px = 104857.6  # pixel coordinate far from origin

def f32(v):
    return struct.unpack('f', struct.pack('f', v))[0]

x_px32 = f32(x_px)
um64 = x_px * scale
um32 = f32(x_px32 * f32(scale))
back32 = f32(um32 / f32(scale))

print("float64 stored px :", repr(x_px))
print("float32 stored px :", repr(x_px32), "err_px =", abs(x_px32 - x_px))
print("physical um f64   :", repr(um64))
print("physical um f32   :", repr(um32), "err_um =", abs(um32 - um64))
print("roundtrip f32 px  :", repr(back32), "err_px =", abs(back32 - x_px))

# JSON round-trip of Python float (IEEE-754 binary64)
s = json.dumps({"x_um": um64, "y_px": x_px})
rt = json.loads(s)
print("json roundtrip exact:", rt["x_um"] == um64 and rt["y_px"] == x_px)
print("json text:", s)

# float32 value serialized to JSON and reinterpreted
s32 = json.dumps({"x_um": um32})
print("float32 value in json:", s32, "-> reloaded equal:", json.loads(s32)["x_um"] == um32)
