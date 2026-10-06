axes = [2, 3, 4]
scale = [2, 3, 4]
translation = [10, 20, 30]
# OME-NGFF applies the dataset scale, then translation, in list order.
physical = [i * s + t for i, s, t in zip(axes, scale, translation)]
restored = [(p - t) / s for p, s, t in zip(physical, scale, translation)]
assert physical == [14, 29, 46]
assert restored == axes
# Deliberately show that swapping transform order changes the answer.
swapped = [(i + t) * s for i, s, t in zip(axes, scale, translation)]
assert swapped == [24, 69, 136]
print('scale_then_translation=', physical)
print('inverse_roundtrip=', restored)
print('translation_then_scale=', swapped)