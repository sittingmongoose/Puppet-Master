"""Reviewer-authored arithmetic checks; never imports or executes candidate/public code."""
from fractions import Fraction as F
from pathlib import Path
from datetime import datetime, timezone
import json

checks = []
def record(name, expected, actual, limitation):
    assert actual == expected, (name, expected, actual)
    checks.append({"id": name, "expected": expected, "actual": actual,
                   "passed": True, "limitation": limitation})

# Categorical codes are identifiers: average can invent a different identifier.
record("class-arithmetic", 2, (1 + 3) // 2,
       "Arithmetic only. Does not execute Rasterio/GDAL or prove overview behavior on a tile.")
# Dataset-wide OR cannot represent independent per-band validity.
m1, m2 = [False, True], [True, False]
record("dataset-or-loss", [True, True], [a or b for a,b in zip(m1,m2)],
       "Boolean counterexample to equating a shared OR mask with either band mask.")
# Boolean conversion discards coverage magnitude.
record("mask-boolean-loss", [False, True, True], [bool(x) for x in (0, 1, 255)],
       "Python Boolean semantics match the cited nonzero-to-bool idea; no GDAL interpolation was run.")
# Exact affine geometry for odd dimensions, unequal downsampling and rotation.
source = (F(2), F(1,2), F(100), F(1,4), F(-3), F(200))
w, h, ow, oh = 7, 5, 3, 2
def point(t,x,y):
    a,b,c,d,e,f = t
    return (a*x+b*y+c, d*x+e*y+f)
def scale(t,sx,sy):
    a,b,c,d,e,f = t
    return (a*sx,b*sy,c,d*sx,e*sy,f)
target = scale(source,F(w,ow),F(h,oh))
corner_pairs = [
    (point(source,0,0),point(target,0,0)),
    (point(source,w,0),point(target,ow,0)),
    (point(source,0,h),point(target,0,oh)),
    (point(source,w,h),point(target,ow,oh))]
record("affine-outer-corners", [True]*4, [a == b for a,b in corner_pairs],
       "Exact algebra, not a raster export test.")
record("affine-center", True,
       point(target,F(1,2),F(1,2)) == point(source,F(w,2*ow),F(h,2*oh)),
       "New pixel center is mapped coherently; it need not equal an original pixel center.")
# Crop geometry needs a translated window origin and window dimensions.
x0,y0,cw,ch = F(1),F(1),F(5),F(3)
a,b,c,d,e,f=source
window=(a,b,c+a*x0+b*y0,d,e,f+d*x0+e*y0)
cropped=scale(window,F(cw,2),F(ch,1))
record("window-corners", True,
       point(cropped,2,1) == point(source,x0+cw,y0+ch),
       "Exact algebra for an in-bounds source window; no boundless read test.")
result = {"kind":"reviewer_common_arithmetic_checks",
          "captured_utc":datetime.now(timezone.utc).isoformat(),
          "checks":checks,
          "candidate_tests_executed":False,
          "runtime_probe":{"rasterio":"ModuleNotFoundError in selected python3",
                           "gdal_shared_library":"ctypes.util.find_library('gdal') returned None",
                           "installed_or_changed_environment":False}}
Path("arithmetic-checks.json").write_text(json.dumps(result,indent=2)+"\n")
print(json.dumps(result,indent=2))
