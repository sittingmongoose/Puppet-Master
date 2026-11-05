#!/usr/bin/env python3
"""Mandatory DCH format checks; no optional format dependencies."""
from datetime import date
import ipaddress
import re
from jsonschema import FormatChecker as JSONFormatChecker


def utc_datetime(value):
    if not isinstance(value, str):
        return True  # JSON Schema type owns non-string values.
    match = re.fullmatch(r'([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})(?:\.[0-9]+)?Z', value)
    if match is None:
        return False
    year, month, day, hour, minute, second = map(int, match.groups())
    try:
        date(year, month, day)
    except ValueError:
        return False
    return hour < 24 and minute < 60 and second < 60


# RFC 3986: pct-encoded / unreserved / sub-delims. Raw non-ASCII is an IRI,
# not a URI. A port is syntactic digits, without a new host/port allowlist.
_UNRESERVED = r'A-Za-z0-9._~\-'
_SUBDELIMS = r"!$&'()*+,;="
_UNIT = rf'(?:[{_UNRESERVED}{_SUBDELIMS}]|%[0-9A-Fa-f]{{2}})'
_PCHAR = rf'(?:{_UNIT}|[:@])'
_URI = re.compile(rf'https://(?:(?P<userinfo>(?:{_UNIT}|:)*)@)?(?P<host>\[[^\[\]]+\]|{_UNIT}+)(?::[0-9]*)?(?:/{_PCHAR}*)*(?:\?(?:{_PCHAR}|[/?])*)?(?:\#(?:{_PCHAR}|[/?])*)?')


def https_uri(value):
    if not isinstance(value, str):
        return True
    match = _URI.fullmatch(value)
    if match is None:
        return False
    host = match['host']
    if not host.startswith('['):
        return True
    host = host[1:-1]
    if re.fullmatch(rf'[vV][0-9A-Fa-f]+\.[{_UNRESERVED}{_SUBDELIMS}:]+', host):
        return True  # RFC 3986 IPvFuture
    try:
        ipaddress.IPv6Address(host)
        return '%' not in host
    except ValueError:
        return False


def FormatChecker():
    checker = JSONFormatChecker()
    checker.checks('date-time')(utc_datetime)
    checker.checks('uri')(https_uri)
    return checker


def legacy_format_checker():
    # The pinned original checker did not install the optional URI/date-time
    # plugins. Preserve that written recipe, independent of today's environment.
    checker = JSONFormatChecker()
    checker.checkers.pop('date-time', None)
    checker.checkers.pop('uri', None)
    return checker
