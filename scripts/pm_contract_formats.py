"""Explicit contract formats, independent of jsonschema's optional extras.

Preserve original spelling and arbitrary fractional precision. This performs
validation only: it never rounds a timestamp or rewrites identity/source bytes.
"""
import re
import calendar
from datetime import datetime, timedelta
from jsonschema import FormatChecker as _FormatChecker
from jsonschema.exceptions import FormatError

DATE_TIME = re.compile(
    r'([0-9]{4})-([0-9]{2})-([0-9]{2})[Tt]([0-9]{2}):([0-9]{2}):([0-9]{2})'
    r'(?:\.[0-9]+)?([Zz]|[+-]([0-9]{2}):([0-9]{2}))')


def calendar_valid(year, month, day):
    return 1 <= month <= 12 and 1 <= day <= calendar.monthrange(year, month)[1]


def date_time(value):
    if not isinstance(value, str):
        return True  # The schema's type keyword owns non-string inputs.
    match = DATE_TIME.fullmatch(value)
    if match is None:
        return False
    year, month, day, hour, minute, second = (int(match[i]) for i in range(1, 7))
    if not calendar_valid(year, month, day):
        return False
    if hour > 23 or minute > 59 or second > 60:
        return False
    if match[8] is not None and (int(match[8]) > 23 or int(match[9]) > 59):
        return False
    if second == 60:
        # RFC3339 5.7: the UTC month-end leap point shifts with the offset.
        # This is format validation, not a claim that a clock/source is genuine.
        offset = 0 if match[8] is None else (int(match[8]) * 60 + int(match[9])) * (-1 if match[7][0] == '-' else 1)
        try:
            utc = datetime(year, month, day, hour, minute, 59) - timedelta(minutes=offset)
        except (ValueError, OverflowError):
            return False
        return utc.hour == 23 and utc.minute == 59 and utc.day == calendar.monthrange(utc.year, utc.month)[1]
    return True


class FormatChecker(_FormatChecker):
    def __init__(self, formats=None):
        super().__init__(formats)
        self.checks('date-time')(date_time)

    def check(self, instance, format):
        if format not in self.checkers:
            raise FormatError('unimplemented contract format: ' + format)
        return super().check(instance, format)
