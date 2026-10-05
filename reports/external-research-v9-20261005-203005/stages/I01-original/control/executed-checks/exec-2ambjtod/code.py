# W2: affine composition order and convention pin
# 2D affine as column-vector convention: p' = A @ p, A = [[a,b,tx],[c,d,ty],[0,0,1]]
def mat_scale(sx, sy):
    return [[sx, 0, 0], [0, sy, 0], [0, 0, 1]]

def mat_translate(tx, ty):
    return [[1, 0, tx], [0, 1, ty], [0, 0, 1]]

def mul(A, B):
    return [[sum(A[i][k] * B[k][j] for k in range(3)) for j in range(3)] for i in range(3)]

def apply(A, p):
    return tuple(A[i][0] * p[0] + A[i][1] * p[1] + A[i][2] for i in (0, 1))

S = mat_scale(2.0, 4.0)
T = mat_translate(10.0, 20.0)
p = (1.0, 1.0)

t_then_s = mul(S, T)   # apply T first, then S
s_then_t = mul(T, S)   # apply S first, then T
print("p                :", p)
print("translate->scale :", apply(t_then_s, p))
print("scale->translate :", apply(s_then_t, p))
print("orders equal     :", apply(t_then_s, p) == apply(s_then_t, p))
print("S then T matrix  :", s_then_t)
