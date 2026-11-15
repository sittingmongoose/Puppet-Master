"""Exact ordering after the shared CV-1101 date-time check; no new grammar."""
import datetime
from decimal import Decimal
from fractions import Fraction
from functools import total_ordering
import pm_event_datetime as dt


def duration_seconds(value):
    if isinstance(value,datetime.timedelta):
        return Fraction(value.days*86400+value.seconds)+Fraction(value.microseconds,1000000)
    return Fraction(value)


class Span(Fraction):
    def total_seconds(self):return Fraction(self)
    def __ge__(self,other):return Fraction(self)>=duration_seconds(other)
    def __gt__(self,other):return Fraction(self)>duration_seconds(other)
    def __le__(self,other):return Fraction(self)<=duration_seconds(other)
    def __lt__(self,other):return Fraction(self)<duration_seconds(other)


@total_ordering
class Instant:
    def __init__(self,seconds):self.seconds=Fraction(seconds)
    def __eq__(self,other):return isinstance(other,Instant) and self.seconds==other.seconds
    def __lt__(self,other):
        if not isinstance(other,Instant):return NotImplemented
        return self.seconds<other.seconds
    def __sub__(self,other):
        if isinstance(other,Instant):return Span(self.seconds-other.seconds)
        if isinstance(other,datetime.timedelta):return Instant(self.seconds-duration_seconds(other))
        return NotImplemented
    def __add__(self,other):
        if isinstance(other,datetime.timedelta):return Instant(self.seconds+duration_seconds(other))
        return NotImplemented


def instant(value,*,profile=dt.EVENT_RECORD):
    dt.date_time(value,profile=profile)
    match=dt._DATE_TIME.fullmatch(value)
    year,month,day,hour,minute,second=map(int,match.group(1,2,3,4,5,6))
    fraction,zone=match.group(7,8)
    offset=0 if zone in ('Z','z') else (1 if zone[0]=='+' else -1)*(int(zone[1:3])*3600+int(zone[4:6])*60)
    base=dt._day_number(year,month,day)*86400+hour*3600+minute*60+min(second,59)-offset
    leaps=sum(point<base for point in dt._LEAP_PRECEDING_SECONDS)+(second==60)
    # Decimal construction and its exact ratio avoid Python's digit-rendering
    # cap and preserve arbitrary fractional precision without a float.
    tail=Fraction(Decimal('0.'+fraction)) if fraction else Fraction(0)
    return Instant(Fraction(base+leaps)+tail)
