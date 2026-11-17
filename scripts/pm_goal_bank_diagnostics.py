"""Keep stock integer range/type verdicts renderable at Python's decimal cap."""
from functools import wraps


class _DiagnosticInteger(int):
    def __repr__(self):
        return '<%sinteger of %d bits>' % ('negative ' if self < 0 else '', self.bit_length())


class _DiagnosticValue:
    def __init__(self, instance):
        self.kind = type(instance).__name__

    def __repr__(self):
        return '<%s containing an oversized integer>' % self.kind


class _TypeView:
    def __init__(self, validator, original, display):
        self.validator, self.original, self.display = validator, original, display

    def is_type(self, instance, kind):
        return self.validator.is_type(self.original if instance is self.display else instance, kind)

    def descend(self, instance, *args, **kwargs):
        return self.validator.descend(self.original if instance is self.display else instance, *args, **kwargs)

    def evolve(self, **changes):
        return _TypeView(self.validator.evolve(**changes), self.original, self.display)

    def is_valid(self, instance):
        return self.validator.is_valid(self.original if instance is self.display else instance)

    def __getattr__(self, name):
        return getattr(self.validator, name)


def _renderable(callback):
    @wraps(callback)
    def keyword(validator, constraint, instance, schema):
        try:
            yield from callback(validator, constraint, instance, schema)
        except ValueError as error:
            if not ('Exceeds the limit (' in str(error) and 'integer string conversion' in str(error)):
                raise
            # Numeric value and the original type verdict stay exact. Only the
            # diagnostic repr changes. The outer validator attaches the actual
            # original instance, keyword, schema and paths to yielded errors.
            display = (_DiagnosticInteger(instance) if type(instance) is int
                       else _DiagnosticValue(instance))
            yield from callback(_TypeView(validator, instance, display), constraint, display, schema)
    return keyword


def integer_diagnostics(base):
    """Wrap each selected dialect's own bounds/type callbacks, never its schema."""
    return {name: _renderable(base.VALIDATORS[name]) for name in
            ('minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum', 'type', 'anyOf', 'oneOf', 'not')
            if name in base.VALIDATORS}
