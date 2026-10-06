"""One neutral fixed native read_file locator, no scientific hints or answers."""
FRAGMENT=(b'\n\n## Own-prior file navigation\n'
 b'Use the existing mcp__pm_boundary__read_file tool with {"path":"inputs/prior_file_index.json"} '
 b'to read the deterministic index of already-authorized SAME-ARM imported inputs. Use its exact listed '
 b'candidate-relative paths with that same read_file tool; ordinary bounded line/byte ranges remain available. '
 b'The index contains only existing paths, SHA256, byte lengths and optional authenticated origin identifiers. '
 b'It adds no source content, relevance ranking, grade, answer, directory-enumeration tool or new permission. '
 b'All original scientific duties, methods, briefs, criteria, artifact obligations, INLINE_ONLY empty adoption '
 b'semantics, native model/tool schemas and original allocation/action/cleanup clocks remain authoritative.\n')

def render():return FRAGMENT

def append(original_bytes,clock_suffix):
    if not original_bytes.endswith(clock_suffix):raise ValueError('Exact already-declared clock suffix required')
    if FRAGMENT in original_bytes:raise ValueError('Do not duplicate or silently retrofit an existing index locator')
    return original_bytes[:-len(clock_suffix)]+FRAGMENT+clock_suffix
