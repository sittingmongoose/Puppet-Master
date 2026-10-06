import json, hashlib

# W3: (a) napari PR #5004 mechanism: rank map after dimension reduction,
# old (single argsort) vs fixed (double argsort); (b) annotation JSON
# round-trip + canonical-hash stability with float64 coordinates.

def old_reorder(order):  # single argsort (pre-fix napari/components/dims.py)
    return tuple(sorted(range(len(order)), key=lambda x: order[x]))

def new_reorder(order):  # double argsort (post-fix napari/utils/misc.py)
    def argsort(vals):
        return sorted(range(len(vals)), key=vals.__getitem__)
    return tuple(argsort(argsort(order)))

print("order        single-argsort   double-argsort (identity-preserving)")
for order in [(0,1), (1,0), (2,1,0), (2,0,1), (4,0,2)]:
    print(f"{str(order):13}{str(old_reorder(order)):17}{str(new_reorder(order))}")

ann = {
  "id": "a-9f31",
  "type": "polygon",
  "frame": {"axes": ["z","y","x"], "index": {"z": 17}},
  "space": {"name": "image0_physical", "units": ["um","um","um"]},
  "coordinates": [[250000.5, -179999.25, 12320.125],
                  [250010.5, -179999.25, 12320.125],
                  [250010.5, -179989.25, 12330.125]],
  "style_ref": "st-tumor",
  "properties": {"class": "tumor"},
  "source_image": {"id": "img-001", "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
}
s1 = json.dumps(ann, sort_keys=True, separators=(",",":"))
h1 = hashlib.sha256(s1.encode()).hexdigest()
ann2 = json.loads(s1)
s2 = json.dumps(ann2, sort_keys=True, separators=(",",":"))
h2 = hashlib.sha256(s2.encode()).hexdigest()
coord_exact = ann["coordinates"] == ann2["coordinates"]
print("json round-trip exact float coordinates:", coord_exact)
print("canonical sha256 stable:", h1 == h2, h1[:16])
