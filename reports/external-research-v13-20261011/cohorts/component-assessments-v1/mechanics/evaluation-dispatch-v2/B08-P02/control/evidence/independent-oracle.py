"""Independent finite arithmetic from Unicode 15.1 normative test/data rows.

This is not a normalization implementation or target CPython execution.
Input fixture records the retrieved primary-body hashes and exact source rows.
"""
import json
from pathlib import Path

data = json.loads((Path(__file__).parent / 'oracle-input.json').read_text())
folds = {int(k): v for k, v in data['full_fold_C_F'].items()}

def decode(field):
    return ''.join(chr(int(x, 16)) for x in field.split())

def full_fold(text):
    return ''.join(folds.get(ord(c), c) for c in text)

rows = {}
for item in data['normalization_rows']:
    fields = item['row'].split(';')[:5]
    source, nfc, nfd, nfkc, nfkd = map(decode, fields)
    rows[ord(source)] = {'source': source, 'nfc': nfc, 'nfkc': nfkc}

results = []
for cp, repetitions in [(0x00BC, 820), (0xFDFA, 1365)]:
    row = rows[cp]
    key = full_fold(row['nfkc'])
    # These outputs have no combining marks and cannot interact at joins.
    results.append({'source_codepoint': f'U+{cp:04X}',
                    'single_original_bytes': len(row['source'].encode('utf-8')),
                    'single_key_bytes': len(key.encode('utf-8')),
                    'single_key_codepoints': len(key),
                    'repetitions': repetitions,
                    'repeated_original_bytes': len(row['source'].encode('utf-8')) * repetitions,
                    'repeated_key_bytes': len(key.encode('utf-8')) * repetitions})

# NFC-only and NFC-then-casefold are different useful policies.
mode_distinctions = {
    'ASCII_A_a_NFC_only_equal': 'A' == 'a',
    'ASCII_A_a_NFC_then_full_fold_equal': full_fold('A') == full_fold('a'),
    'fullwidth_A_NFC_then_full_fold_key': full_fold(rows[0xFF21]['nfc']),
    'fullwidth_A_NFKC_then_full_fold_key': full_fold(rows[0xFF21]['nfkc']),
}
print(json.dumps({'oracle': 'Unicode 15.1.0 NormalizationTest rows plus C/F CaseFolding mappings',
                  'arithmetic': results, 'mode_distinctions': mode_distinctions,
                  'limits': ['Selected normative rows only; not arbitrary-sequence conformance.',
                             'No candidate code was executed.',
                             'No CPython 3.13.9 executable, UI, persistence, or migration was tested.']},
                 ensure_ascii=False, sort_keys=True, indent=2))
