
# W1c (corrected): 3x3 homogeneous composition; discriminates the pixel->world convention
# and the position-vs-size sign rule from napari PR #9339.
def mul3(A, B):
    return [[sum(A[i][k]*B[k][j] for k in range(3)) for j in range(3)] for i in range(3)]

def apply3(M, p):
    v = [M[i][0]*p[0] + M[i][1]*p[1] + M[i][2] for i in range(2)]
    return (v[0], v[1])

s = (0.5, 0.25); t = (10.0, 20.0)   # axis order (y, x)
S = [[s[0], 0.0, 0.0], [0.0, s[1], 0.0], [0.0, 0.0, 1.0]]
T = [[1.0, 0.0, t[0]], [0.0, 1.0, t[1]], [0.0, 0.0, 1.0]]
M = mul3(T, S)   # world = scale, then translate

pts = [(0.0, 0.0), (100.0, 200.0), (31.4, -17.3), (-5.0, 40.0)]
ok = True
for p in pts:
    elem = (p[0]*s[0] + t[0], p[1]*s[1] + t[1])
    mat = apply3(M, p)
    if abs(elem[0]-mat[0]) > 1e-12 or abs(elem[1]-mat[1]) > 1e-12:
        ok = False
    print("p=%-16s elementwise=%-24s matrix3(T@S)=%s" % (str(p), str(elem), str(mat)))
print("world = data*scale + translate equals homogeneous T@S applied to data:", ok)

wrong = [((p[0] + t[0]) * s[0], (p[1] + t[1]) * s[1]) for p in pts]
maxd = max(max(abs(w[0]-(p[0]*s[0]+t[0])), abs(w[1]-(p[1]*s[1]+t[1]))) for p, w in zip(pts, wrong))
print("max |diff| if translation were applied before scaling: %.1f world units" % maxd)

sp = -1.0
print("reflect scale=-1: position 40 -> %+.0f (flip kept); size signed=%+.0f (invalid); size |s|=%.0f (valid)"
      % (40.0*sp, 10.0*sp, 10.0*abs(sp)))
