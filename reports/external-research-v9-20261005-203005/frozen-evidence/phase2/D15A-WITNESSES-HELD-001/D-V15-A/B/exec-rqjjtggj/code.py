chunk_shape = data["chunk_shape_zyx"]
chunk_bytes = chunk_shape[0] * chunk_shape[1] * chunk_shape[2] * data["bytes_per_sample"]
print(repr(chunk_shape), repr(chunk_bytes), repr(128 * 1024), chunk_bytes == 128 * 1024)