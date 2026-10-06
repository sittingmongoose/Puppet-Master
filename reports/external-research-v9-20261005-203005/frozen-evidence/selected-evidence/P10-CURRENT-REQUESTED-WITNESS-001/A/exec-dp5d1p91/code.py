
# W2: bounded-access budget check for a 3.0 GB uint16 volume-slice source.
# Grid 60000 x 25000 px @ 2 B = 3.0 GB. Tiles of 1024x1024 -> 2 MiB each.
import random, math
from collections import OrderedDict

W, H, BPP, TILE = 60000, 25000, 2, 1024
total_gb = W*H*BPP/1e9
gx, gy = math.ceil(W/TILE), math.ceil(H/TILE)
ntiles = gx*gy
print("source %.2f GB, tile grid %dx%d = %d tiles, %.2f MiB/tile, full second in-RAM copy would be %.2f GB" %
      (total_gb, gx, gy, ntiles, TILE*TILE*BPP/2**20, total_gb))

def run(cache_tiles, steps=20000, seed=7):
    rnd = random.Random(seed)
    cache = OrderedDict()
    hits = misses = 0
    cx, cy = gx//2, gy//2
    for _ in range(steps):
        # random walk = pan; 5% of steps are zoom jumps elsewhere
        if rnd.random() < 0.05:
            cx, cy = rnd.randrange(gx), rnd.randrange(gy)
        else:
            cx = max(0, min(gx-1, cx + rnd.randint(-3, 3)))
            cy = max(0, min(gy-1, cy + rnd.randint(-3, 3)))
        key = (cx, cy)
        if key in cache:
            hits += 1; cache.move_to_end(key)
        else:
            misses += 1
            cache[key] = True
            if len(cache) > cache_tiles:
                cache.popitem(last=False)
    return hits/steps

for n, mib in ((32, 64), (128, 256), (512, 1024)):
    print("LRU cache %4d tiles (%4d MiB): hit rate %.1f%% over 20000 pan/zoom tile requests" % (n, mib, 100*run(n)))
