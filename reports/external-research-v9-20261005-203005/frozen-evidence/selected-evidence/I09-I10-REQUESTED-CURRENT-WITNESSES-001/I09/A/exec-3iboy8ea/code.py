# Discriminating check W2: affine transform algebra for the data->physical->display contract.
# 2D affine stored as (a, c, e, b, d, f) rows of [[a c e],[b d f],[0 0 1]].
def mat(a, c, e, b, d, f):
    return (a, c, e, b, d, f, 0.0, 0.0, 1.0)

def mul(A, B):
    a1, c1, e1, b1, d1, f1 = A[:6]
    a2, c2, e2, b2, d2, f2 = B[:6]
    return (a1*a2 + c1*b2, a1*c2 + c1*d2, a1*e2 + c1*f2 + e1,
            b1*a2 + d1*b2, b1*c2 + d1*d2, b1*e2 + d1*f2 + f1,
            0.0, 0.0, 1.0)

def inv(A):
    a, c, e, b, d, f = A[:6]
    det = a*d - c*b
    ia, ic, ib, id_ = d/det, -c/det, -b/det, a/det
    return (ia, ic, -(ia*e + ic*f), ib, id_, -(ib*e + id_*f), 0.0, 0.0, 1.0)

def apply(A, x, y):
    a, c, e, b, d, f = A[:6]
    return (a*x + c*y + e, b*x + d*y + f)

# project record: voxel->physical (NGFF-style scale+translation, 0.65 um/px)
phys = mat(0.65, 0.0, 11.5, 0.0, 0.65, 3.25)
# view state: physical->display pixels (zoom x2, pan) -- must NEVER be written into stored coords
disp = mat(2.0, 0.0, -120.25, 0.0, 2.0, -45.5)
both = mul(disp, phys)
max_seq = max_inv = 0.0
for (x, y) in [(0, 0), (1023, 767), (512.3, 300.7), (0.05, 4095.95)]:
    px, py = apply(phys, x, y)
    qx, qy = apply(disp, px, py)
    cx, cy = apply(both, x, y)
    max_seq = max(max_seq, abs(qx - cx), abs(qy - cy))
    ix, iy = apply(inv(both), cx, cy)
    max_inv = max(max_inv, abs(ix - x), abs(iy - y))
print({"max_sequential_vs_composed_err": max_seq,
       "max_inverse_roundtrip_err": max_inv,
       "determinant_nonzero": (both[0]*both[4] - both[1]*both[3]) != 0.0})
ok = max_seq < 1e-9 and max_inv < 1e-6
print("EXIT_OK" if ok else "EXIT_FAIL")