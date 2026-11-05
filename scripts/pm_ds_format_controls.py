"""Explicit grammar controls; normal format refusal is required, never a crash."""
import pm_contract_formats as formats
from jsonschema import Draft202012Validator


def cases():
    invalid=['2026-09-10T00:00:00','2026/09/10T00:00:00Z','2026-13-10T00:00:00Z',
             '2026-02-30T00:00:00Z','2026-09-10T24:00:00Z','2026-09-10T00:60:00Z',
             '2026-09-10T00:00:61Z','2026-09-10T00:00:60Z','2026-09-10T00:00:00Z\n',
             '2026-09-10T00:00:00.Z','2026-09-10T00:00:00+24:00','2026-09-10T00:00:00+00:60',
             '2026-09-30T23:59:60+01:00','2026-09-30T23:58:60Z','0000-01-01T00:00:60Z']
    valid=['2026-09-10T00:00:00.123456789123Z','2026-09-10t00:00:00z',
           '1990-12-31T23:59:60Z','1990-12-31T15:59:60-08:00','0000-01-01T00:00:00Z']
    rows=[]
    for value in invalid+valid:
        expected=value in valid
        def broken(v=value,e=expected):
            try:return formats.date_time(v) is not e
            except Exception:return True
        rows.append(('FORMAT:exact_grammar:'+value,broken))
    for value in (None,False,1,[],{}):
        rows.append(('FORMAT:type_keyword_owns:'+repr(value),lambda v=value:formats.date_time(v) is not True))
    def unknown():
        try:formats.FormatChecker().check('value','not-an-implemented-format')
        except formats.FormatError:return False
        except Exception:return True
        return True
    rows.append(('FORMAT:unknown_format_cannot_skip',unknown))
    return rows


def refusal_cases():
    """Only actual schema acceptance callbacks for the acceptance-removal table.

    Fault/representation assertions above stay in their separate proof class.
    Exceptions here propagate to the audit and receive no acceptance credit.
    """
    selected=Draft202012Validator({'type':'string','format':'date-time'},format_checker=formats.FormatChecker())
    rows=[]
    for name,_ in cases():
        if not name.startswith('FORMAT:exact_grammar:'):continue
        value=name[len('FORMAT:exact_grammar:'):]
        if not formats.date_time(value):rows.append((name,lambda v=value:selected.is_valid(v)))
    unknown=Draft202012Validator({'type':'string','format':'not-an-implemented-format'},format_checker=formats.FormatChecker())
    rows.append(('FORMAT:unknown_format_schema_fault',lambda:unknown.is_valid('value')))
    return rows
