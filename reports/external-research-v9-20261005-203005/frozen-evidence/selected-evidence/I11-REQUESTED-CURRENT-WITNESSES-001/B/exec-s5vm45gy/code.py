
# Witness W1: float32 storage of pixel coordinates loses precision at
# large-field microscopy scales; JSON float64 round-trips exactly.
# Justification: IEEE-754 binary32 has a 24-bit significand; ULP at 6e4 is 2^-10 * 2^16 = 0.00390625.
import struct, json, math

def to_f32(x):
    return struct.unpack('f', struct.pack('f', x))[0]

x_true = 60000.001          # px, plausible coordinate in a ~3 GB uint8 image ~60000x50000
x_f32 = to_f32(x_true)
err = x_f32 - x_true
ulp = to_f32(60000.0 + 2**-9) - 60000.0

# polygon vertex pair distinguishability after float32
v1 = to_f32(60000.0001); v2 = to_f32(60000.0004)

# JSON round-trip of float64 coordinate
c = 60000.001234567891
rt = json.loads(json.dumps(c))
print("x_true        =", x_true)
print("x_float32     =", repr(x_f32))
print("error_px      =", err, "(", abs(err), "px )")
print("float32 ULP@6e4=", ulp)
print("v1_f32 != v2_f32 :", v1 != v2, "-> vertices 0.0003 px apart collide in float32:", v1 == v2)
print("json roundtrip exact:", rt == c, repr(rt))
