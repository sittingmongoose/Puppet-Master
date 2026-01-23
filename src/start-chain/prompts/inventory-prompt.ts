/**
 * Requirements Inventory Prompt Template
 *
 * Template for AI refinement of heuristic requirement candidates.
 * Converts candidates into atomic units with classification.
 *
 * See P1-T20: Start Chain - Requirements Inventory (Atomic REQ Units)
 */

import type { ParsedRequirements, ParsedSection } from '../../types/requirements.js';
import type { HeuristicCandidate } from '../../types/requirements-inventory.js';

/**
 * Builds the inventory refinement prompt from parsed requirements and candidates.
 *
 * @param parsed - Parsed requirements document
 * @param candidates - Heuristic candidates extracted from the document
 * @returns Complete prompt string for AI platform
 */
export function buildInventoryPrompt(
  parsed: ParsedRequirements,
  candidates: HeuristicCandidate[]
): string {
  const requirementsContent = formatRequirementsContent(parsed);
  const candidatesContent = formatCandidates(candidates);

  return `# Requirements Inventory Refinement

## Source Requirements Document

${requirementsContent}

## Heuristic Candidates

The following requirement candidates were extracted using heuristic rules (bullets, numbered lists, requirement keywords):

${candidatesContent}

## Your Task

Refine these heuristic candidates into atomic, self-contained requirement units. Your goals:

1. **Deduplicate**: Remove redundant or overlapping candidates
2. **Split compound requirements**: If a candidate contains multiple distinct requirements, split them
3. **Merge fragments**: If related candidates form a single requirement, merge them
4. **Classify**: Assign the correct kind and severity to each requirement
5. **Preserve completeness**: Do NOT drop requirements; every important requirement from the source must appear

## Output Format

Generate valid JSON matching this schema:

\`\`\`typescript
interface RequirementUnit {
  excerpt: string;         // The atomic requirement text (minimal, self-contained)
  sectionPath: string;     // Section path: "Title > Section > Subsection"
  kind: 'functional' | 'nfr' | 'constraint' | 'open_question';
  severity: 'must' | 'should' | 'could';
  lineNumbers?: [number, number];  // Optional line range if known
}
\`\`\`

## Classification Guidelines

### Kind Classification

- **functional**: Core feature requirements describing what the system does
  - Examples: "The system shall allow users to login", "API must return JSON responses"

- **nfr** (Non-Functional Requirement): Quality attributes and cross-cutting concerns
  - Performance: latency, throughput, response time targets
  - Security: authentication, authorization, encryption requirements
  - Scalability: load handling, concurrent user limits
  - Reliability: uptime, error rates, recovery requirements
  - Examples: "Response time must be under 200ms", "Support 1000 concurrent users"

- **constraint**: Limitations, boundaries, or restrictions on the solution
  - Technology constraints: "Must use PostgreSQL", "Node.js 18+"
  - Budget/timeline constraints: "Complete within Q1 2024"
  - Regulatory constraints: "Must comply with GDPR"
  - Examples: "Cannot use external APIs", "Must run on Windows and Linux"

- **open_question**: Unclear, ambiguous, or TBD items that need clarification
  - Contains "TBD", "to be determined", "unclear", question marks
  - Examples: "Authentication method TBD", "Storage limits?"

### Severity Classification (RFC 2119)

- **must**: Absolute requirement, mandatory for success
  - Keywords: must, shall, required, will, need
  - System is non-compliant without this

- **should**: Strongly recommended, expected in most cases
  - Keywords: should, recommended, ought
  - Can be omitted with good justification

- **could**: Optional, nice-to-have, lower priority
  - Keywords: could, may, optional, might
  - Only if time/resources permit

## Rules

1. **Preserve all substantive requirements** - Do not drop requirements to simplify
2. **Make excerpts atomic** - Each excerpt should express exactly one requirement
3. **Make excerpts self-contained** - Reader should understand without context
4. **Use original wording** - Minimize paraphrasing; preserve intent
5. **Assign severity conservatively** - When unclear, prefer 'should' over 'could'
6. **Flag ambiguities** - Use 'open_question' for genuinely unclear items
7. **Maintain document order** - Output should follow source document order

## Output

Output ONLY valid JSON array of RequirementUnit objects, no markdown formatting or code blocks around the JSON.`;
}

/**
 * Formats parsed requirements into a readable string.
 */
function formatRequirementsContent(parsed: ParsedRequirements): string {
  const lines: string[] = [];

  if (parsed.title) {
    lines.push(`# ${parsed.title}`);
    lines.push('');
  }

  for (const section of parsed.sections) {
    lines.push(formatSection(section, 0));
  }

  if (parsed.extractedGoals.length > 0) {
    lines.push('');
    lines.push('## Goals');
    for (const goal of parsed.extractedGoals) {
      lines.push(`- ${goal}`);
    }
  }

  if (parsed.extractedConstraints.length > 0) {
    lines.push('');
    lines.push('## Constraints');
    for (const constraint of parsed.extractedConstraints) {
      lines.push(`- ${constraint}`);
    }
  }

  return lines.join('\n');
}

/**
 * Formats a section recursively with proper heading levels.
 */
function formatSection(section: ParsedSection, baseLevel: number): string {
  const lines: string[] = [];
  const headingLevel = '#'.repeat(baseLevel + section.level);
  lines.push(`${headingLevel} ${section.title}`);
  lines.push('');

  if (section.content.trim()) {
    lines.push(section.content.trim());
    lines.push('');
  }

  for (const child of section.children) {
    lines.push(formatSection(child, baseLevel));
  }

  return lines.join('\n');
}

/**
 * Formats heuristic candidates for the prompt.
 */
function formatCandidates(candidates: HeuristicCandidate[]): string {
  const lines: string[] = [];

  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    const severity = c.detectedSeverity ? ` [${c.detectedSeverity}]` : '';
    lines.push(`${i + 1}. [${c.sourceType}] ${c.sectionPath}${severity}`);
    lines.push(`   "${c.text}"`);
    lines.push('');
  }

  return lines.join('\n');
}
