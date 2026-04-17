content = """### 1. Hook-Based Lifecycle Middleware (BeforeUnit/AfterUnit)

PLACEHOLDER_CONTENT
"""
forbidden = ["TierContext", "tier_id", "BeforeTierContext", "AfterTierContext"]
# TierContextInjectorHook is an explicit survivor — exclude it from the check
# by only checking standalone forbidden tokens, not substrings of longer identifiers
import re
issues = []
for f in forbidden:
    # Use word-boundary-like check: look for the string not immediately surrounded by alphanumeric or _
    matches = re.findall(r'(?<![A-Za-z0-9_])' + re.escape(f) + r'(?![A-Za-z0-9_])', content)
    if matches:
        issues.append(f"FOUND forbidden: {f} ({len(matches)} occurrences)")
if issues:
    for i in issues:
        print(i)
else:
    print("No standalone forbidden strings found (TierContextInjectorHook substrings are fine)")
