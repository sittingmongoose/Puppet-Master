
import math, json

r = {}
# Hypothetical 3 GB uint16 volume: 2048 x 2048 x 366
Y, X, Z = 2048, 2048, 366
src_bytes = Y * X * Z * 2
r['source_bytes'] = src_bytes
r['source_GiB'] = round(src_bytes / 2**30, 3)

tile = (256, 256, 2)  # y, x, bytes (uint16)
tile_bytes = tile[0] * tile[1] * tile[2]
r['tile_bytes'] = tile_bytes                       # 128 KiB
r['tiles_per_z_plane'] = (Y // tile[0]) * (X // tile[1])
r['tiles_in_volume'] = (Y // tile[0]) * (X // tile[1]) * Z

cache_tiles = 128
r['lru_cache_bytes'] = cache_tiles * tile_bytes
r['displayed_plane_bytes'] = Y * X * 2
r['working_set_bytes'] = cache_tiles * tile_bytes + Y * X * 2
r['working_set_MiB'] = round(r['working_set_bytes'] / 2**20, 1)
r['budget_fraction_of_16GiB'] = round(r['working_set_bytes'] / (16 * 2**30), 6)
r['full_second_copy_bytes'] = src_bytes
r['working_set_vs_second_copy_ratio'] = round(r['working_set_bytes'] / src_bytes, 6)

# Zarr v2 chunk key (final-file form) for a 5-D array "0" with axes t,c,z,y,x
name = "0"
idx = (2, 1, 7, 13, 29)
key = name + "/" + ".".join(str(i) for i in idx)
r['zarr_v2_chunk_key_dotted'] = key
# NGFF 0.4 doc illustrates a nested directory layout; separator is configurable
# in .zarray ("dimension_separator"); nested form of the same chunk index:
r['zarr_nested_path_style'] = name + "/" + "/".join(str(i) for i in idx)

# Chunk touch cost while panning one full z plane at tile granularity
r['chunk_reads_per_plane_pan'] = r['tiles_per_z_plane']
r['bytes_read_per_plane_pan_MiB'] = round(r['tiles_per_z_plane'] * tile_bytes / 2**20, 1)

print(json.dumps(r, indent=1))
print("EXIT_OK")
