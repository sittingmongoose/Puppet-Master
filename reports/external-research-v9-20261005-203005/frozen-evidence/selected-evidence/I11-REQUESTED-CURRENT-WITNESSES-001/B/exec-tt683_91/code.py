
# Witness W2: transform ORDER is semantically load-bearing.
# Given pixel index i=2, scale s=0.5 um/px, origin offset t=10 um:
#   "scale then translate"  -> p = s*i + t      = 11.0
#   "translate then scale"  -> p = s*(i + t)    = 6.0
# Same numbers, different physical locations => a project file must record
# the order/convention explicitly, not just the numbers.
def scale_then_translate(i, s, t): return s * i + t
def translate_then_scale(i, s, t): return s * (i + t)

i, s, t = 2.0, 0.5, 10.0
a = scale_then_translate(i, s, t)
b = translate_then_scale(i, s, t)
print("index i =", i, "px ; scale s =", s, "um/px ; translation t =", t, "um")
print("apply scale then translation  :", a, "um")
print("apply translation then scale  :", b, "um")
print("differ:", a != b, "; delta =", a - b, "um =", (a - b) / s, "px")

# sanity: inverting the wrong order to recover index gives wrong pixel
inv_a = (a - t) / s
inv_b_wrong = a / s - t
print("recover index from p=11: (p-t)/s =", inv_a, " ; wrong-order inverse p/s-t =", inv_b_wrong)
