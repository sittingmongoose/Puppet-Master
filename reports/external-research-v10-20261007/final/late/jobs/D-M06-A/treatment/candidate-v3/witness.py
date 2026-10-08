"""D-M06-A candidate-v3 bounded witness (candidate-authored).

Correct-implementation battery + RFC-published oracles (Appendix B Table 1,
section 3.2.3 expected sort order, section 3.2.4 canonical hex) + six
plausible-wrong controls that must each fail their targeted checks.
Reads /input.bin; prints one compact JSON line to stdout.
Exit 0 = all correct-impl checks passed AND all wrong controls discriminated.
"""
import hashlib
import json
import math
import struct
import sys
import time
import unicodedata
from fractions import Fraction


class JcsError(Exception):
    pass


# --- ECMA-262 7.1.12.1 (+ Note 2) number serialization, self-derived -------
def num_to_str(x):
    if isinstance(x, int):
        f = float(x)
        if math.isinf(f) or f != x:
            raise JcsError('integer not expressible as IEEE 754 binary64')
        x = f
    if math.isnan(x) or math.isinf(x):
        raise JcsError('NaN/Infinity prohibited (RFC 8785 3.2.2.3 Note)')
    if x == 0.0:
        return '0'  # -0 and 0 both emit "0" (Appendix B rows 1-2)
    sign = '-' if x < 0 else ''
    ax = abs(x)
    e10 = math.floor(math.log10(ax))
    while ax < 10.0 ** e10:
        e10 -= 1
    while e10 < 308 and 10.0 ** (e10 + 1) <= ax:  # 10.0**309 would overflow
        e10 += 1
    fx = Fraction(ax)
    maxf = Fraction(sys.float_info.max)  # exact bound; float(Fraction) overflows past it
    chosen = None  # (dist, s, k, n)
    # ECMA 7.1.12.1: k minimal, then (Note 2) s closest to x*10**(k-n), tie -> even s.
    # n is not pinned: the decade-shifted placement n=e10+2 can reach a shorter k
    # (e.g. Appendix B row 44b52d02c7e14af6 -> "1e+23").
    for k in range(1, 18):  # shortest k that round-trips; 17 always suffice
        for n in (e10 + 1, e10 + 2):
            t = fx * (Fraction(10) ** (k - n))
            lo = t.numerator // t.denominator
            for s in (lo, lo + 1):
                if s <= 0 or s < 10 ** (k - 1) or s >= 10 ** k:
                    continue
                val = Fraction(s) * (Fraction(10) ** (n - k))
                if val > maxf or float(val) != ax:
                    continue
                dist = abs(val - fx)
                if chosen is None or dist < chosen[0] or (
                        dist == chosen[0] and s % 2 == 0 and chosen[1] % 2 == 1):
                    chosen = (dist, s, k, n)
        if chosen is not None:
            break
    if chosen is None:
        raise JcsError('no shortest round-trip digits found')
    _, s, k, n = chosen
    digits = str(s)
    if k <= n <= 21:
        return sign + digits + '0' * (n - k)
    if 0 < n <= 21:
        return sign + digits[:n] + '.' + digits[n:]
    if -6 < n <= 0:
        return sign + '0.' + '0' * (-n) + digits
    exp = n - 1
    mant = digits[0] + ('.' + digits[1:] if k > 1 else '')
    return sign + mant + 'e' + ('+' if exp >= 0 else '-') + str(abs(exp))


# --- string serialization (RFC 8785 3.2.2.2) --------------------------------
_BRIEF = {0x08: '\\b', 0x09: '\\t', 0x0A: '\\n', 0x0C: '\\f', 0x0D: '\\r'}


def utf16_units(s):
    units = []
    for ch in s:
        cp = ord(ch)
        if 0xD800 <= cp <= 0xDFFF:
            raise JcsError('lone surrogate U+%04X (RFC 8785 3.2.2.2 Note)' % cp)
        if cp < 0x10000:
            units.append(cp)
        else:
            v = cp - 0x10000
            units += [0xD800 + (v >> 10), 0xDC00 + (v & 0x3FF)]
    return units


# --- pluggable implementation -----------------------------------------------
def make_impl(sort_mode='utf16', normalize=False, number='ecma', dup='error',
              ascii_escape=False):
    def quote(s):
        if normalize:
            s = unicodedata.normalize('NFC', s)
        utf16_units(s)
        parts = ['"']
        for ch in s:
            cp = ord(ch)
            if cp < 0x20:
                parts.append(_BRIEF.get(cp, '\\u%04x' % cp))
            elif cp == 0x22:
                parts.append('\\"')
            elif cp == 0x5C:
                parts.append('\\\\')
            elif ascii_escape and cp > 0x7E:
                parts.append('\\u%04x' % cp)
            else:
                parts.append(ch)
        parts.append('"')
        return ''.join(parts)

    def num(x):
        if number == 'repr':
            if isinstance(x, int):
                x = float(x)
            if math.isnan(x) or math.isinf(x):
                raise JcsError('non-finite')
            return repr(x)
        return num_to_str(x)

    def sortkey(name):
        if sort_mode == 'codepoint':
            return [ord(c) for c in name]
        if sort_mode == 'escaped':
            return [ord(c) for c in quote(name)]
        return utf16_units(name)

    def dup_hook(pairs):
        seen = set()
        for k, _ in pairs:
            if k in seen:
                raise JcsError('duplicate property name after escape '
                               'resolution: %r' % k)
            seen.add(k)
        return dict(pairs)

    def parse(text):
        if dup == 'lastwins':
            return json.loads(text, parse_int=float)
        return json.loads(text, parse_int=float, object_pairs_hook=dup_hook)

    def canon(node):
        if node is None:
            return 'null'
        if node is True:
            return 'true'
        if node is False:
            return 'false'
        if isinstance(node, float):
            return num(node)
        if isinstance(node, int):
            return num(node)
        if isinstance(node, str):
            return quote(node)
        if isinstance(node, list):
            return '[' + ','.join(canon(v) for v in node) + ']'
        if isinstance(node, dict):
            items = sorted(node.items(), key=lambda kv: sortkey(kv[0]))
            return '{' + ','.join(quote(k) + ':' + canon(v)
                                  for k, v in items) + '}'
        raise JcsError('unsupported node')

    return {'parse': parse, 'canon': canon, 'quote': quote, 'num': num,
            'sortkey': sortkey}


CORRECT = make_impl()


def run_check(cid, impl, inp):
    f = inp['fixtures']
    fx = {row['id']: row['input'] for row in f}
    ex = inp['extra_inputs']
    if cid == 'C01_sort_f04':  # obligation 2: RFC 3.2.3 built-in sort oracle
        names = sorted(fx['f04'] and CORRECT_parse(impl, fx['f04']).keys(),
                       key=impl['sortkey'])
        ok = names == inp['sort_oracle_f04_expected_order']
        return ok, 'got=' + json.dumps(names, ensure_ascii=True)
    if cid == 'C02_nonbmp_f05':  # obligation 2: minimal non-BMP pair
        obj = CORRECT_parse(impl, fx['f05'])
        names = sorted(obj.keys(), key=impl['sortkey'])
        want = inp['sort_oracle_f04_expected_order'][5:7]
        out = impl['canon'](obj)
        exp = '{' + impl_quote_lit(want[0]) + ':2,' + impl_quote_lit(want[1]) + ':1}'
        return names == want and out == exp, 'out=' + json.dumps(out, ensure_ascii=True)
    if cid == 'C03_hex_f03':  # obligations 1/3/4 end-to-end vs RFC 3.2.4 bytes
        exp = bytes.fromhex(''.join(inp['hex_oracle_f03_lines']).replace(' ', ''))
        got = impl['canon'](impl['parse'](fx['f03'])).encode('utf-8')
        return got == exp, 'got=' + json.dumps(got.decode('utf-8'), ensure_ascii=True)
    if cid == 'C04_preserve_f09_f10':  # obligation 4: preservation, not NFC
        o9 = impl['canon'](impl['parse'](fx['f09']))
        o10 = impl['canon'](impl['parse'](fx['f10']))
        ok = (o9 != o10 and '\u0301' not in o9 and '\u0301' in o10
              and '\u00e9' in o9 and '\u0308' in o10
              and 'caf\u00e9' in o9 and 'cafe\u0301' in o10)
        b9 = o9.encode('utf-8')
        return ok and b9.endswith(b'\xc3\xafve"}') and b'\xc3\xa9' in b9, (
            'o9=' + json.dumps(o9, ensure_ascii=True) + ' o10=' +
            json.dumps(o10, ensure_ascii=True))
    if cid == 'C05_num_identity_f12':  # obligation 3: one double, one token
        out = impl['canon'](impl['parse'](fx['f12']))
        return out == '{"w":4.5,"x":4.5,"y":4.5,"z":4.5}', 'out=' + out
    if cid == 'C06_zero_f13':  # obligation 3: -0 -> "0"
        out = impl['canon'](impl['parse'](fx['f13']))
        return out == '[0,0,0,0]', 'out=' + out
    if cid == 'C07_window_f14':  # obligation 3: exponent window edges
        out = impl['canon'](impl['parse'](fx['f14']))
        want = '[1e+21,999999999999999900000,0.000001,1e-27,0.000001,0.002]'
        return out == want, 'out=' + out
    if cid == 'C08_appendixB':  # obligation 3: full Table 1 oracle incl. errors
        bad = []
        for i, row in enumerate(inp['appendix_b_table1']):
            v = struct.unpack('>d', bytes.fromhex(row['bits']))[0]
            try:
                tok = impl['num'](v)
            except JcsError:
                if row['expect'] is not None:
                    bad.append('r%d:errored' % i)
            else:
                if row['expect'] is None or tok != row['expect']:
                    bad.append('r%d:%s' % (i, tok))
        return not bad, 'mismatches=' + (','.join(bad) or 'none')
    if cid == 'C09_duplicates_f07_f08':  # obligation 1: reject duplicates
        for fid in ('f07', 'f08'):
            try:
                impl['parse'](fx[fid])
            except JcsError:
                continue
            return False, fid + ' not rejected'
        return True, 'both rejected'
    if cid == 'C10_surrogate_f11':  # obligations 1/4: lone surrogate errors
        try:
            impl['canon'](impl['parse'](fx['f11']))
        except JcsError:
            return True, 'rejected'
        return False, 'lone surrogate passed through'
    if cid == 'C11_prohibited_f16_f17':  # obligation 3: overflow must error
        for fid in ('f16', 'f17'):
            try:
                impl['canon'](impl['parse'](fx[fid]))
            except JcsError:
                continue
            return False, fid + ' overflow passed through'
        return True, 'both rejected'
    if cid == 'C12_domain_f18':  # obligation 1: 2^53 boundary, dual binding
        try:
            impl['canon'](json.loads(fx['f18']))  # ints kept exact: strict I-JSON reading
            strict = 'accepted'
        except JcsError:
            strict = 'error'
        out = impl['canon'](json.loads(fx['f18'], parse_int=float))
        return out == '[9007199254740991,9007199254740992,9007199254740992]', (
            'ecma_parse=' + out + ' int_exact_binding=' + strict)
    if cid == 'C13_metamorphic_order':  # obligations 1/2: order + spelling invariance
        a = impl['canon'](impl['parse'](fx['f01']))
        b = impl['canon'](impl['parse'](ex['f01_reversed']))
        c = impl['canon'](impl['parse'](fx['f02']))
        d = impl['canon'](impl['parse'](ex['f02_compact']))
        return a == b and c == d, 'f01==f01r:%s f02==f02c:%s a=%s c=%s' % (
            a == b, c == d, a, c)
    if cid == 'C14_roundtoeven_f15':  # obligation 3: Appendix B note 4
        out = impl['canon'](impl['parse'](fx['f15']))
        return out == '1424953923781206.2', 'out=' + out
    if cid == 'C15_basics_f02':  # obligations 1/2: no whitespace, sorted
        out = impl['canon'](impl['parse'](fx['f02']))
        return out == '{"a":2,"b":1}', 'out=' + out
    raise KeyError(cid)


def CORRECT_parse(impl, text):
    return impl['parse'](text)


def impl_quote_lit(s):
    return CORRECT['quote'](s)


ALL_CHECKS = ['C01_sort_f04', 'C02_nonbmp_f05', 'C03_hex_f03',
              'C04_preserve_f09_f10', 'C05_num_identity_f12', 'C06_zero_f13',
              'C07_window_f14', 'C08_appendixB', 'C09_duplicates_f07_f08',
              'C10_surrogate_f11', 'C11_prohibited_f16_f17', 'C12_domain_f18',
              'C13_metamorphic_order', 'C14_roundtoeven_f15', 'C15_basics_f02']

CONTROLS = [
    ('W1_codepoint_sort', make_impl(sort_mode='codepoint'),
     ['C01_sort_f04', 'C02_nonbmp_f05']),
    ('W2_escapedtext_sort', make_impl(sort_mode='escaped'),
     ['C01_sort_f04']),
    ('W3_nfc_normalize', make_impl(normalize=True),
     ['C04_preserve_f09_f10']),
    ('W4_repr_numbers', make_impl(number='repr'),
     ['C08_appendixB']),
    ('W5_lastwins_duplicates', make_impl(dup='lastwins'),
     ['C09_duplicates_f07_f08']),
    ('W6_ascii_escape', make_impl(ascii_escape=True),
     ['C03_hex_f03']),
]


def main():
    t0 = time.monotonic()
    raw = open('/input.bin', 'rb').read()
    inp = json.loads(raw)
    checks, passed = {}, 0
    for cid in ALL_CHECKS:
        try:
            ok, detail = run_check(cid, CORRECT, inp)
        except Exception as exc:  # unexpected crash = failed check
            ok, detail = False, 'exception:%r' % (exc,)
        checks[cid] = [bool(ok), str(detail)[:300]]
        passed += bool(ok)
    controls = {}
    discriminated = 0
    for wid, impl, cids in CONTROLS:
        failures = []
        for cid in cids:
            try:
                ok, detail = run_check(cid, impl, inp)
            except Exception as exc:
                ok, detail = False, 'exception:%r' % (exc,)
            if not ok:
                failures.append(cid)
            else:
                failures.append('!%s-passed-should-fail' % cid)
        disc = any(not f.startswith('!') for f in failures)
        discriminated += disc
        controls[wid] = {'ran': cids, 'failed': [f for f in failures
                                                 if not f.startswith('!')],
                         'discriminated': disc}
    result = {
        'summary': {
            'checks_passed': passed, 'checks_total': len(ALL_CHECKS),
            'controls_discriminated': discriminated,
            'controls_total': len(CONTROLS),
            'all_checks_passed': passed == len(ALL_CHECKS),
            'all_controls_discriminated': discriminated == len(CONTROLS),
        },
        'checks': checks,
        'controls': controls,
        'binding': {
            'witness_input_sha256': hashlib.sha256(raw).hexdigest(),
            'fixtures_sha256_expected': inp['binding']['fixtures_sha256'],
            'rfc8785_sha256_expected': inp['binding']['rfc8785_sha256'],
            'harness': 'sandbox.py bwrap+seccomp single process',
            'witness_scope': 'this code on these inputs only',
        },
        'elapsed_seconds': round(time.monotonic() - t0, 3),
    }
    sys.stdout.write(json.dumps(result, ensure_ascii=True,
                                separators=(',', ':')) + '\n')
    ok = (passed == len(ALL_CHECKS) and discriminated == len(CONTROLS))
    sys.exit(0 if ok else 3)


main()
