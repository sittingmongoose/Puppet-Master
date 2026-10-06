import math
# Data coordinates are (row, column); world coordinates are (x, y).
# Deliberately include a negative x direction to exercise orientation and ordering.
A = ((0.0, -0.2), (0.5, 0.0))
t = (100.0, -20.0)
p = (12.0, 30.0)
world = (t[0] + A[0][0]*p[0] + A[0][1]*p[1],
         t[1] + A[1][0]*p[0] + A[1][1]*p[1])
# determinant is nonzero; solve analytically for source coordinates
col = (world[0] - t[0]) / A[0][1]
row = (world[1] - t[1]) / A[1][0]
back = (row, col)
assert world == (94.0, -14.0)
assert back == p
# A sample center index (0,0) differs from its top-left array corner (-.5,-.5).
center00 = (t[0], t[1])
corner00 = (t[0] + A[0][0]*(-0.5) + A[0][1]*(-0.5),
            t[1] + A[1][0]*(-0.5) + A[1][1]*(-0.5))
assert center00 == (100.0, -20.0)
assert corner00 == (100.1, -20.25)
print({"source_row_col": p, "world_x_y": world, "inverse_row_col": back,
       "center_of_sample_0_0": center00, "array_corner_before_sample_0_0": corner00,
       "determinant": A[0][1]*A[1][0]})