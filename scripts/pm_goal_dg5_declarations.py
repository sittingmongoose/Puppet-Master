"""Source-derived DG5 duplicate invariants, declared before checker execution.

The request's current integer primitive and its complete owner schema both
reject a Boolean expected_revision. SirOwner.admit checks those two sites
before hashing/storing the request. GH1 must prove each site and the joint
cut; this declaration itself earns no credit.
"""


def target(case, ordinary):
    if case['id'] == 'U2/N/expected_revision_bool':
        return ('dg5/dgu/sir/request/expected_revision/number', 'dg5/dgu/sir/request/schema')
    return ordinary
