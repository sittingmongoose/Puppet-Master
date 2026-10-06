"""Declared card-family reader and pure preactivation identity guards.

No file I/O, process launch, provider access, clock changes or label inference.
"""
FAMILIES={'glm':'Z','luna':'L'}
MODELS={
    'Z':{'glm 5.3 flash','glm-5.3-flash','builtin:zai-coding-plan/glm-5.3-flash'},
    'L':{'gpt-6 luna','gpt-6-luna'},
}

class FamilyBindingError(ValueError):
    pass

def _declared(value,field):
    if not isinstance(value,str) or value.strip().casefold() not in FAMILIES:
        raise FamilyBindingError('Missing, invalid or unsupported explicit '+field)
    return FAMILIES[value.strip().casefold()]

def declared_family(card):
    """Return canonical Z/L only from the explicit requested/candidate fields."""
    if not isinstance(card,dict):raise FamilyBindingError('Card must be an object')
    declared=[_declared(card[field],field) for field in ('requested_family','candidate_family') if field in card]
    if not declared:raise FamilyBindingError('No explicit declared family field')
    if len(set(declared))!=1:raise FamilyBindingError('Conflicting requested_family and candidate_family')
    return declared[0]

def _model(value,family):
    if not isinstance(value,str) or value.strip().casefold() not in MODELS[family]:
        raise FamilyBindingError('Exact supported model does not match declared family')

def _effort(value):
    if not isinstance(value,str) or value.strip().casefold()!='max':
        raise FamilyBindingError('Exact requested/actual max effort required')

def registered_family(card,owner_request,registered_family):
    """Check explicit frozen card/owner/registry identity; return canonical Z/L."""
    family=declared_family(card)
    if not isinstance(owner_request,dict):raise FamilyBindingError('Frozen owner request required')
    if registered_family!=family or owner_request.get('family')!=family:
        raise FamilyBindingError('Declared family differs from registered owner or queue family')
    _model(card.get('requested_model'),family);_effort(card.get('requested_effort'))
    _model(owner_request.get('requested_model'),family);_effort(owner_request.get('requested_effort'))
    return family

def validate_launch_binding(card,owner_request,registered_queue_family,verified_runtime_identity):
    """Validate a separately pinned actual identity, never an unbound template.

    verified_runtime_identity must be supplied after the caller checks its
    existing runtime pins/actual native configuration. This helper does not
    turn a label, missing luna_runtime, filename or model request into proof.
    """
    family=registered_family(card,owner_request,registered_queue_family)
    if not isinstance(verified_runtime_identity,dict) or verified_runtime_identity.get('verified') is not True:
        raise FamilyBindingError('Actual pinned runtime identity is unbound or unverified')
    if verified_runtime_identity.get('family')!=family:
        raise FamilyBindingError('Actual runtime family differs from frozen owner family')
    _model(verified_runtime_identity.get('model'),family)
    _effort(verified_runtime_identity.get('effort'))
    return family
