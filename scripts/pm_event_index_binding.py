"""Static SP-278 canonical binding codec; no source or publication validation.

Only pm.event_index.binding.msgpack_sha256.v1 is implemented. Inputs are
built-in None, bool, int, str, list and dict values. Dicts represent maps with
already-unique keys; callers decoding input must reject duplicate keys before
constructing a dict. This codec is not an EventRecord or payload hash recipe.
"""

import hashlib


_DOMAIN = "pm.event_index.binding.msgpack_sha256.v1"


def _length_prefix(length: int, kind: str) -> bytes:
    """Encode the shortest string/array/map header (lengths are uint32)."""
    if not 0 <= length <= 0xFFFFFFFF:
        raise ValueError("MessagePack length exceeds uint32")
    if kind == "str":
        if length < 32:
            return bytes([0xA0 + length])
        if length <= 0xFF:
            return b"\xd9" + length.to_bytes(1, "big")
        tag16, tag32 = b"\xda", b"\xdb"
    elif kind == "array":
        if length < 16:
            return bytes([0x90 + length])
        tag16, tag32 = b"\xdc", b"\xdd"
    elif kind == "map":
        if length < 16:
            return bytes([0x80 + length])
        tag16, tag32 = b"\xde", b"\xdf"
    else:
        raise ValueError("Unsupported MessagePack container kind")
    if length <= 0xFFFF:
        return tag16 + length.to_bytes(2, "big")
    return tag32 + length.to_bytes(4, "big")


def binding_bytes(value: object) -> bytes:
    """Return canonical MessagePack bytes of V, without the digest wrapper.

    Unsupported Python types raise TypeError; out-of-range integers raise
    ValueError; invalid Unicode raises UnicodeEncodeError. Only built-in
    containers are accepted, avoiding coercion or custom serialization hooks.
    """
    if value is None:
        return b"\xc0"
    if type(value) is bool:
        return b"\xc3" if value else b"\xc2"
    if type(value) is int:
        if not 0 <= value <= 0xFFFFFFFFFFFFFFFF:
            raise ValueError("Binding integers must be uint64")
        if value <= 0x7F:
            return bytes([value])
        for maximum, tag, width in (
            (0xFF, b"\xcc", 1),
            (0xFFFF, b"\xcd", 2),
            (0xFFFFFFFF, b"\xce", 4),
            (0xFFFFFFFFFFFFFFFF, b"\xcf", 8),
        ):
            if value <= maximum:
                return tag + value.to_bytes(width, "big")
    if type(value) is str:
        encoded = value.encode("utf-8", errors="strict")
        return _length_prefix(len(encoded), "str") + encoded
    if type(value) is list:
        return _length_prefix(len(value), "array") + b"".join(
            binding_bytes(item) for item in value
        )
    if type(value) is dict:
        keys = []
        for key in value:
            if type(key) is not str:
                raise TypeError("Binding map keys must be strings")
            keys.append((key.encode("utf-8", errors="strict"), key))
        keys.sort()
        return _length_prefix(len(value), "map") + b"".join(
            _length_prefix(len(encoded), "str") + encoded + binding_bytes(value[key])
            for encoded, key in keys
        )
    raise TypeError(f"Unsupported binding value type: {type(value).__name__}")


def binding_digest(value: object) -> str:
    """Return lowercase SHA-256 of the canonical SP-278 domain/value wrapper."""
    return hashlib.sha256(binding_bytes({"domain": _DOMAIN, "value": value})).hexdigest()
