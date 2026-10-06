import json

# W2: memory-budget arithmetic for a 3 GB uint16 volume on a 16 GB workstation.
# Pure arithmetic model; no image decoding is performed.

vol = (2048, 2048, 362)                # z, y, x voxels
bytes_total = vol[0]*vol[1]*vol[2]*2
chunk = (64, 256, 256)                 # voxels per chunk (z,y,x)
chunk_bytes = chunk[0]*chunk[1]*chunk[2]*2

nchunks = tuple(-(-v//c) for v, c in zip(vol, chunk))
nchunks_total = nchunks[0]*nchunks[1]*nchunks[2]

ram_total = 16*2**30
os_app_reserve = 4*2**30               # OS + UI + python runtime (engineering estimate)
cache_budget = 512*2**20               # LRU chunk cache budget (product choice)
slice_bytes = vol[1]*vol[2]*2          # one full y,x plane uint16
annotation_budget = 64*2**20

free = ram_total - os_app_reserve - cache_budget - annotation_budget

cache_chunks = cache_budget // chunk_bytes

# read amplification while scrolling z at fixed y,x window of 512x512:
# each new z plane touches ceil(512/256)^2 = 4 chunks (one z-layer of chunks)
chunks_per_plane_step = (-(-512//chunk[1])) * (-(-512//chunk[2]))

print(json.dumps({
  "volume_GB": round(bytes_total/2**30, 3),
  "chunk_bytes": chunk_bytes,
  "chunk_grid": nchunks,
  "chunks_total": nchunks_total,
  "ram_total_GB": 16, "os_app_reserve_GB": 4,
  "cache_budget_MB": 512, "annotation_budget_MB": 64,
  "free_headroom_GB": round(free/2**30, 3),
  "cache_holds_chunks": cache_chunks,
  "cache_coverage_pct": round(100*cache_chunks/nchunks_total, 3),
  "full_plane_bytes": slice_bytes,
  "chunks_touched_per_512x512_zstep": chunks_per_plane_step,
  "in_flight_working_set_MB": round((4*chunk_bytes + slice_bytes)/2**20, 2),
}, indent=1))
print("PASS criterion: free_headroom_GB > 0 and in_flight working set << free headroom")
