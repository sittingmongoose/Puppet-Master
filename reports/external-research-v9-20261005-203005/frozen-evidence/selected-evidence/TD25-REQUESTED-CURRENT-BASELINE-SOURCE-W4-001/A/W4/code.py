import json
m = data["index_to_world"]
p = data["point_index"]
world = [sum(m[r][c] * (p + [1])[c] for c in range(4)) for r in range(3)]
inv = data["world_to_index"]
q0 = [world[i] - m[i][3] for i in range(3)]
back = [sum(inv[r][c] * q0[c] for c in range(3)) for r in range(3)]
print("input sample-center index xyz:", p)
print("world xyz um:", world)
print("inverse sample-center index xyz:", back)
print("roundtrip exact:", back == p)
assert world == [99.25, 202.0, 304.0]
assert back == p