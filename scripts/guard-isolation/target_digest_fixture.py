"""The original DDBG target digest predicate, isolated from its schema rows."""

import pm_guard_isolation as g

HEX = '0123456789abcdef'


def digest_characters(value, context):
    digest = value['payload']['target_bindings']['source_sha256']
    return 'invalid_payload' if not all(character in HEX for character in digest) else None


def make_case(value):
    table = g.GuardTable([
        g.Guard('payload.target_sha256_hex', g.Invariant('/payload/target_bindings/source_sha256',
            'has only lowercase hexadecimal characters'), 'invalid_payload', digest_characters)])
    context = None

    def check(value):
        table.require('payload.target_sha256_hex', value, context)
        return True

    return g.Case(table, check, context)
