import struct, math

# W1: transform round-trip precision, float64 vs float32 storage.
# Scenario: voxel index -> physical micrometers with 90-degree rotation,
# anisotropic scale, and a large stage translation (typical tiled acquisition).
# p_phys = R @ (S * p_vox) + t ; check T^-1(T(p)) error for both precisions.

def f32(x):
    return struct.unpack('f', struct.pack('f', x))[0]

def vmap(v, R, S, t, cast):
    v = [cast(x) for x in v]
    s = [cast(S[i] * v[i]) for i in range(3)]
    out = []
    for i in range(3):
        acc = cast(t[i])
        for j in range(3):
            acc = cast(acc + cast(R[i][j] * s[j]))
        out.append(acc)
    return out

def vmap_inv(w, R, S, t, cast):
    w = [cast(x) for x in w]
    d = [cast(w[i] - cast(t[i])) for i in range(3)]
    out = []
    for j in range(3):
        acc = cast(0.0)
        for i in range(3):
            acc = cast(acc + cast(R[i][j] * d[i]))
        out.append(cast(acc / S[j]))
    return out

# 90-degree rotation about z: maps x->y
c, s = 0.0, 1.0
R = [[c, -s, 0.0], [s, c, 0.0], [0.0, 0.0, 1.0]]
S = (0.104, 0.104, 0.400)          # micrometer per voxel
t = (250000.0, -180000.0, 12000.0) # micrometer stage offset
p = (1023.0, 2047.0, 61.0)         # voxel coordinate deep in the volume

for name, cast in (("float64", float), ("float32", f32)):
    w = vmap(p, R, S, t, cast)
    p2 = vmap_inv(w, R, S, t, cast)
    err = max(abs(p2[i] - p[i]) for i in range(3))
    rel = err / max(abs(x) for x in p)
    print(f"{name}: phys={[f32(x) if cast is f32 else round(x,6) for x in w]}")
    print(f"{name}: max voxel error after round-trip = {err:.6g} voxels (rel {rel:.3g})")

print("threshold: float64 must stay < 1e-9 voxels; float32 shown for contrast")
