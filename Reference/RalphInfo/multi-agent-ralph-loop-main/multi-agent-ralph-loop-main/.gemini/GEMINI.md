# Gemini CLI Configuration

## Overview
Configuration for Gemini CLI as subagent in Ralph Wiggum system.

## Capabilities
- Long context processing (up to 1M tokens)
- Web search integration
- Integration test generation
- Research and documentation
- Second opinion on complex issues

## Invocation Patterns

### Research
```bash
gemini "Research best practices for: $TOPIC" --yolo -o text
```

### Integration Tests
```bash
gemini "Generate integration tests for: $FILES
        Include: API tests, database tests, external service mocks." \
  --yolo -o text
```

### Code Review (Second Opinion)
```bash
gemini "Review this code from a different perspective: $FILES
        Previous findings: $FINDINGS
        Do you agree? Additional issues?" \
  --yolo -o json
```

### Documentation
```bash
gemini "Generate comprehensive documentation for: $PROJECT
        Include: overview, installation, usage, API reference." \
  --yolo -o text
```

## Output Formats

### JSON Output (-o json)
```json
{
  "analysis": "...",
  "findings": [],
  "recommendation": "...",
  "approved": true|false
}
```

### Text Output (-o text)
Plain markdown or text for documentation and research.

## Integration with Ralph

### As Subagent
- Called by Sonnet agents via bash
- Part of parallel subagent execution
- Used for integration tests and research

### In Adversarial Validation
- Acts as tie-breaker when Claude and Codex disagree
- Provides independent third opinion
- Required for 2/3 consensus

## Use Cases by Task

| Task | Gemini Role |
|------|-------------|
| Integration Tests | Primary |
| Research | Primary |
| Documentation | Primary |
| Long Context Analysis | Primary |
| Security Review | Secondary (tie-breaker) |
| Bug Hunting | Secondary (validation) |

## Iteration Limits
- No explicit iteration limit
- Bound by orchestrator's limits
- Used for single-shot tasks primarily
