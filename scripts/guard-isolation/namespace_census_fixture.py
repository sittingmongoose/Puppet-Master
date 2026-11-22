"""Source-only fixtures for reflective attribute and format-field classification."""


def format_fields(template, item, frame, function):
    simple = '{0!r:>10}'.format(item)
    nested = '{0:{1}}'.format(item, 3)
    attribute = '{0.label}'.format(item)
    indexed = '{item[0]}'.format_map({'item': item})
    nested_attribute = '{0:{1.width}}'.format(item, item)
    dynamic = template.format(item)
    scope = frame.f_locals
    function_state = function.__closure__
    name_lookup = object.__getattribute__
    return (simple, nested, attribute, indexed, nested_attribute, dynamic, scope, function_state, name_lookup)
