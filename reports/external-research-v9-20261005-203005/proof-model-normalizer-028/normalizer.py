"""Exact observed GLM DTO join. No model inference, fallback, calls or IO."""
MODEL='builtin:zai-coding-plan/GLM-5.3-Flash'
PROVIDER_ID='builtin:zai-coding-plan'
MODEL_ID='GLM-5.3-Flash'

def observed_model(value):
    if type(value) is str:
        if value!=MODEL:raise ValueError('Unsupported observed model shorthand or different canonical model')
        return value  # Existing exact canonical-string form, no provider inference.
    if type(value) is not dict or set(value)!={'providerId','modelId'}:
        raise ValueError('Exact explicit observed providerId/modelId DTO required; missing or conflicting fields denied')
    if type(value['providerId']) is not str or type(value['modelId']) is not str or value['providerId']!=PROVIDER_ID or value['modelId']!=MODEL_ID:
        raise ValueError('Different, missing or conflicting explicit observed provider/model tuple denied')
    return value['providerId']+'/'+value['modelId']
