import json, os, struct, tempfile, sys

out = {}

# W1: precision of storing calibration / annotation coordinates in float32 vs float64
def as_f32(x):
    return struct.unpack('<f', struct.pack('<f', x))[0]

out['float32_cases'] = []
for v in [0.0645, 0.1, 2**24 + 0.25, 1e-7]:
    g = as_f32(v)
    out['float32_cases'].append({
        'value': v,
        'as_float32': g,
        'exactly_equal': (v == g),
        'abs_error': abs(v - g),
        'rel_error': abs(v - g) / abs(v),
    })
out['float64_roundtrip_0.0645_exact'] = (as_f32 and struct.unpack('<d', struct.pack('<d', 0.0645))[0] == 0.0645)

# W2: interrupted save vs atomic os.replace save (POSIX user-space simulation)
d = tempfile.mkdtemp()
p = os.path.join(d, 'project.json')
with open(p, 'w') as f:
    json.dump({'version': 1, 'annotations': 7}, f)
    f.flush(); os.fsync(f.fileno())

# writer killed mid-write into a temp file: original must be untouched
tmp = os.path.join(d, 'project.json.tmp-1')
with open(tmp, 'w') as f:
    f.write('{"version": 2, "annot')  # truncated: simulates process death before close
out['interrupted_save_original_intact'] = json.load(open(p))
out['interrupted_save_tmp_rejected'] = None
try:
    json.load(open(tmp))
except Exception as e:
    out['interrupted_save_tmp_rejected'] = type(e).__name__

# completed save: temp file fully written+fsynced, then atomic rename over target
with open(tmp, 'w') as f:
    f.write(json.dumps({'version': 2, 'annotations': 9}))
    f.flush(); os.fsync(f.fileno())
os.replace(tmp, p)
out['atomic_save_result'] = json.load(open(p))
out['temp_file_removed_by_replace'] = not os.path.exists(tmp)

print(json.dumps(out, indent=1))
sys.stderr.write('checks complete, exit 0\n')
