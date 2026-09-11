"""Static codec checks only; these do not prove native storage behavior."""

import hashlib
import json
from pathlib import Path
import sys
import unittest


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from pm_event_index_binding import _length_prefix, binding_bytes, binding_digest


class BindingCodecTests(unittest.TestCase):
    def test_all_canonical_vectors(self):
        vectors = json.loads(
            (ROOT / "Plans/event_record_index_binding_hash_vectors.json").read_text(
                encoding="utf-8"
            )
        )
        self.assertEqual(vectors["algorithm"], "pm.event_index.binding.msgpack_sha256.v1")
        self.assertEqual(len(vectors["vectors"]), 11)
        for vector in vectors["vectors"]:
            with self.subTest(value=vector["value"]):
                self.assertEqual(binding_bytes(vector["value"]).hex(), vector["encoded_hex"])
                self.assertEqual(binding_digest(vector["value"]), vector["binding_sha256"])

    def test_nil_bool_and_uint_are_distinct(self):
        self.assertEqual(binding_bytes([None, False, True, 0, 1]), b"\x95\xc0\xc2\xc3\x00\x01")
        self.assertNotEqual(binding_digest(True), binding_digest(1))
        self.assertNotEqual(binding_digest(False), binding_digest(0))

    def test_uint_boundaries(self):
        cases = {
            0: "00", 127: "7f", 128: "cc80", 255: "ccff", 256: "cd0100",
            65535: "cdffff", 65536: "ce00010000", 4294967295: "ceffffffff",
            4294967296: "cf0000000100000000", 18446744073709551615: "cfffffffffffffffff",
        }
        for value, expected in cases.items():
            with self.subTest(value=value):
                self.assertEqual(binding_bytes(value).hex(), expected)

    def test_string_length_boundaries(self):
        for length, prefix in (
            (0, "a0"), (31, "bf"), (32, "d920"), (255, "d9ff"),
            (256, "da0100"), (65535, "daffff"), (65536, "db00010000"),
        ):
            with self.subTest(length=length):
                self.assertEqual(binding_bytes("x" * length), bytes.fromhex(prefix) + b"x" * length)
        self.assertEqual(binding_bytes("🙂" * 8), b"\xd9\x20" + "🙂".encode() * 8)

    def test_array_length_boundaries(self):
        for length, prefix in (
            (0, "90"), (15, "9f"), (16, "dc0010"),
            (65535, "dcffff"), (65536, "dd00010000"),
        ):
            with self.subTest(length=length):
                self.assertEqual(binding_bytes([None] * length), bytes.fromhex(prefix) + b"\xc0" * length)

    def test_map_length_boundaries(self):
        for length, prefix in (
            (0, "80"), (15, "8f"), (16, "de0010"),
            (65535, "deffff"), (65536, "df00010000"),
        ):
            with self.subTest(length=length):
                value = {f"{i:05d}": None for i in reversed(range(length))}
                expected_body = b"".join(
                    b"\xa5" + f"{i:05d}".encode("ascii") + b"\xc0" for i in range(length)
                )
                self.assertEqual(binding_bytes(value), bytes.fromhex(prefix) + expected_body)

    def test_uint32_length_limit_without_gigabyte_allocation(self):
        for kind, tag in (("str", "db"), ("array", "dd"), ("map", "df")):
            with self.subTest(kind=kind):
                self.assertEqual(_length_prefix(0xFFFFFFFF, kind).hex(), tag + "ffffffff")
                for invalid in (-1, 0x100000000):
                    with self.assertRaises(ValueError):
                        _length_prefix(invalid, kind)

    def test_utf8_map_order_and_nested_maps(self):
        # UTF-8 orders U+E000 before U+10000, unlike UTF-16 code units.
        first = {"\U00010000": 3, "\ue000": 2, "a": {"z": 1, "a": 0}}
        second = {"a": {"a": 0, "z": 1}, "\ue000": 2, "\U00010000": 3}
        expected = bytes.fromhex("83a16182a16100a17a01a3ee808002a4f090808003")
        self.assertEqual(binding_bytes(first), expected)
        self.assertEqual(binding_bytes(second), expected)
        self.assertEqual(binding_digest(first), binding_digest(second))

    def test_no_unicode_normalization_or_array_reordering(self):
        self.assertEqual(binding_bytes("é").hex(), "a2c3a9")
        self.assertEqual(binding_bytes("e\u0301").hex(), "a365cc81")
        self.assertNotEqual(binding_digest("é"), binding_digest("e\u0301"))
        self.assertEqual(binding_bytes({"é": 0, "e\u0301": 1}).hex(), "82a365cc8101a2c3a900")
        self.assertNotEqual(binding_digest([1, 2]), binding_digest([2, 1]))

    def test_digest_domain_wrapper(self):
        domain = b"pm.event_index.binding.msgpack_sha256.v1"
        preimage = b"\x82\xa6domain\xd9" + bytes([len(domain)]) + domain + b"\xa5value\xc0"
        self.assertEqual(binding_digest(None), hashlib.sha256(preimage).hexdigest())

    def test_reject_out_of_range_integers(self):
        for value in (-1, -2**64, 2**64, 2**100):
            for encode in (binding_bytes, binding_digest):
                with self.subTest(value=value, encode=encode.__name__):
                    with self.assertRaises(ValueError):
                        encode(value)

    def test_reject_unsupported_values(self):
        class Extension:
            pass

        for value in (0.0, -0.0, float("nan"), float("inf"), float("-inf"),
                      b"binary", bytearray(b"binary"), memoryview(b"binary"),
                      (), set(), Extension(), complex(1, 2)):
            for encode in (binding_bytes, binding_digest):
                with self.subTest(value=repr(value), encode=encode.__name__):
                    with self.assertRaises(TypeError):
                        encode(value)
        with self.assertRaises(TypeError):
            binding_bytes({"nested": [b"binary"]})

    def test_reject_non_string_keys_and_surrogates(self):
        for key in (None, False, 0, 1.5, b"key", ("key",)):
            with self.subTest(key=key):
                with self.assertRaises(TypeError):
                    binding_bytes({key: 1})
        for text in ("\ud800", "\udfff", "\ud83d\ude42"):
            for value in (text, {text: 1}, {"nested": [text]}):
                with self.subTest(value=repr(value)):
                    with self.assertRaises(UnicodeEncodeError):
                        binding_bytes(value)

    def test_reject_custom_containers_and_scalar_subclasses(self):
        class DuplicateMap(dict):
            def items(self):
                return [("a", 0), ("a", 1)]

        class CustomInt(int):
            pass

        class CustomString(str):
            pass

        for value in (DuplicateMap(), CustomInt(1), CustomString("a")):
            with self.subTest(value=type(value).__name__):
                with self.assertRaises(TypeError):
                    binding_bytes(value)


if __name__ == "__main__":
    unittest.main()
