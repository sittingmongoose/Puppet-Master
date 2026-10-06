
# W1 (fixed): discriminate the pixel->world convention and the position-vs-size sign rule
# that napari PR #9339 was about (positions use signed scale; sizes/handles use |scale|).
def apply(M, p):
    # 2x3 homogeneous affine (last row implicitly [0,0,1])
    return (M[0][0]*p[0]+M[0][1]*p[1]+M[0][2], M[1][0]*p[0]+M[1][1]*p[1]+M[1][2])

def mul(A, B):
    return [[sum(A[i][k]*B[k][j] for k in range(2)) for j in range(3)] for i in range(2)]

# data-axis order (y, x); scale s=(sy,sx)=(0.5,0.25); translate t=(ty,tx)=(10,20)
s = (0.5, 0.25); t = (10.0, 20.0)
T = [[1.0, 0.0, t[0]], [0.0, 1.0, t[1]]]      # translate
S = [[s[0], 0.0, 0.0], [0.0, s[1], 0.0]]      # scale
M = mul(T, S)                                  # world = scale then translate

pts = [(0.0, 0.0), (100.0, 200.0), (31.4, -17.3), (-5.0, 40.0)]
ok = True
for p in pts:
    elem = (p[0]*s[0] + t[0], p[1]*s[1] + t[1])
    mat = apply(M, p)
    if abs(elem[0]-mat[0]) > 1e-12 or abs(elem[1]-mat[1]) > 1e-12:
        ok = False
    print("p=%-16s elementwise=%-24s matrix(T*S)=%s" % (str(p), str(elem), str(mat)))
print("convention world = data*scale + translate matches matrix T*S:", ok)

# Wrong convention: translate applied BEFORE scale
wrong = [((p[0] + t[0]) * s[0], (p[1] + t[1]) * s[1]) for p in pts]
maxd = max(max(abs(w[0]-(p[0]*s[0]+t[0])), abs(w[1]-(p[1]*s[1]+t[1]))) for p, w in zip(pts, wrong))
print("max |diff| if implementation scaled after translating: %.1f world units" % maxd)

# PR #9339 lesson: with a reflecting scale s=-1 the POSITION mapping flips,
# but marker sizes/vertex radii must use |s| or they go negative.
sp = -1.0
pos = 40.0*sp
size_signed = 10.0 * sp     # what napari passed to vispy before the fix
size_abs = 10.0 * abs(sp)   # after the fix
print("reflect scale=-1: position 40 -> %+.0f (flip kept), size signed=%+.0f (invalid), size |s|=%.0f (valid)" % (pos, size_signed, size_abs))
