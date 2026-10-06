import json

case = {
    "source_index": [2.0, 3.0],
    "ngff_scale": [0.5, 2.0],
    "ngff_translation": [100.0, -7.0],
    "source_to_derived": [[0.0, -1.0, 5.0], [1.0, 0.0, 2.0], [0.0, 0.0, 1.0]],
}

def scale_then_translate(point, scale, translation):
    return [point[i] * scale[i] + translation[i] for i in range(len(point))]

def apply_2d(matrix, point):
    x, y = point
    return [matrix[0][0] * x + matrix[0][1] * y + matrix[0][2],
            matrix[1][0] * x + matrix[1][1] * y + matrix[1][2]]

def inverse_orthogonal_affine(matrix, point):
    a, b, tx = matrix[0]
    c, d, ty = matrix[1]
    det = a * d - b * c
    x, y = point[0] - tx, point[1] - ty
    return [(d * x - b * y) / det, (-c * x + a * y) / det]

p = case["source_index"]
world = scale_then_translate(p, case["ngff_scale"], case["ngff_translation"])
q = apply_2d(case["source_to_derived"], p)
back = inverse_orthogonal_affine(case["source_to_derived"], q)
assert world == [101.0, -1.0]
assert q == [2.0, 4.0]
assert back == p
reverse_order = [(p[i] + case["ngff_translation"][i]) * case["ngff_scale"][i] for i in range(2)]
assert reverse_order != world
print("source index:", p)
print("NGFF scale then translation => world:", world)
print("source_to_derived => derived index:", q)
print("inverse export mapping => source index:", back)
print("translation then scale differs:", reverse_order != world)
print("frame-aware coordinate round-trip:", back == p)
