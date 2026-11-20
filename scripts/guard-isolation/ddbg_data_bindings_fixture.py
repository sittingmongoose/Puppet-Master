"""Two guard suites over the DDBG target digest, with a shared source census."""

import pm_guard_isolation as g

HEX = '0123456789abcdef'


def via_get(value, context):
    payload = value.get('payload')
    bindings = payload.get('target_bindings')
    digest = bindings.get('source_sha256')
    return 'invalid_payload' if not all(char.lower() in HEX and char == char.lower() for char in digest) else None


def via_unpack_and_loop(value, context):
    bindings, alphabet = value['payload']['target_bindings'], HEX
    for key, digest in bindings.items():
        if key.startswith('source_sha256'):
            return 'invalid_payload' if not all(char in alphabet for char in digest) else None
    return None


def get_case(value):
    table = g.GuardTable([
        g.Guard('payload.target_sha256_hex', g.Invariant('/payload/target_bindings/source_sha256',
            'has only lowercase hexadecimal characters'), 'invalid_payload', via_get)])
    context = None

    def check(value):
        table.require('payload.target_sha256_hex', value, context)
        return True

    return g.Case(table, check, context)


def unpack_case(value):
    table = g.GuardTable([
        g.Guard('payload.target_sha256_hex', g.Invariant('/payload/target_bindings/source_sha256',
            'has only lowercase hexadecimal characters'), 'invalid_payload', via_unpack_and_loop)])
    context = None

    def check(value):
        table.require('payload.target_sha256_hex', value, context)
        return True

    return g.Case(table, check, context)
