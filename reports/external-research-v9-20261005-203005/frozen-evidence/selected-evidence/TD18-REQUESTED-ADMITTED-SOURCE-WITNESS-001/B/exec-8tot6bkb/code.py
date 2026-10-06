import json, struct
pixel = [3.0, 2.0]
spacing = [0.5, 2.0]
origin = [10.0, -4.0]
physical_scale_then_translate = [p*s+o for p,s,o in zip(pixel, spacing, origin)]
wrong_translate_then_scale = [(p+o)*s for p,s,o in zip(pixel, spacing, origin)]
value64 = 104857.6
value32 = struct.unpack('!f', struct.pack('!f', value64))[0]
encoded = json.dumps({'coordinate': value64})
round_trip = json.loads(encoded)['coordinate']
print('pixel_xy:', pixel)
print('scale_then_translation:', physical_scale_then_translate)
print('translation_then_scale:', wrong_translate_then_scale)
print('orders_differ:', physical_scale_then_translate != wrong_translate_then_scale)
print('float32_error_px:', value32 - value64)
print('json_binary64_exact:', round_trip == value64)
