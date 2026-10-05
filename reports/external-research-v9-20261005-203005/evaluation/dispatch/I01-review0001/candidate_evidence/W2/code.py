# Transform composition order must be a pinned schema constant:
# translate-then-scale vs scale-then-translate give different results
# for the same point. Column-vector convention, affine 3x3 matrices.

def apply(m, p):
    return (m[0][0]*p[0] + m[0][1]*p[1] + m[0][2],
            m[1][0]*p[0] + m[1][1]*p[1] + m[1][2])

def scale_m(s):
    return [[s[0], 0.0, 0.0], [0.0, s[1], 0.0], [0.0, 0.0, 1.0]]

def trans_m(t):
    return [[1.0, 0.0, t[0]], [0.0, 1.0, t[1]], [0.0, 0.0, 1.0]]

def matmul(a, b):
    return [[sum(a[i][k]*b[k][j] for k in range(3)) for j in range(3)]
            for i in range(3)]

S = scale_m((2.0, 4.0))
T = trans_m((10.0, 20.0))
p = (1.0, 1.0)

scale_then_translate = apply(matmul(T, S), p)  # p scaled first, offset added after
translate_then_scale = apply(matmul(S, T), p)  # offset added first, then scaled

print("p                 :", p)
print("translate->scale  :", translate_then_scale)
print("scale->translate  :", scale_then_translate)
print("orders equal      :", translate_then_scale == scale_then_translate)
print("S-then-T matrix   :", matmul(T, S))