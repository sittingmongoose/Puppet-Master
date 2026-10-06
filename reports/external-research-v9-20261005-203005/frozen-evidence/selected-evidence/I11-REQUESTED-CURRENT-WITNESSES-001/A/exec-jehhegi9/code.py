import json, struct

def f32(x):
    return struct.unpack('<f', struct.pack('<f', x))[0]

out = {}
# Scenario: annotation vertex stored in physical units. Motorized-stage
# origin 231000.0 um plus a 0.004 um (4 nm) feature offset (sub-diffraction
# scale relevant to microscopy calibration).
origin, offset = 231000.0, 0.004
true_pos = origin + offset
out['true_position_um'] = true_pos
out['float32_value_um'] = f32(true_pos)
out['float32_abs_error_um'] = abs(f32(true_pos) - true_pos)
out['float64_abs_error_um'] = abs(true_pos - true_pos)
# Integer pixel index beyond the float32 exact-integer range (2^24):
idx = 2**24 + 1
out['index_true'] = idx
out['index_in_float32'] = f32(idx)
out['index_loss'] = idx - f32(idx)
# JSON round-trip of the float64 value (CPython json uses repr():
# shortest string that round-trips):
out['json_roundtrip_float64_equal'] = json.loads(json.dumps(true_pos)) == true_pos
print(json.dumps(out, indent=1))
print("EXPECTED: float32 loses the entire 0.004 um offset (ulp at 2.3e5 is 2^-6 um);")
print("2^24+1 collapses to 2^24 in float32; float64 and its JSON repr round-trip exactly.")
