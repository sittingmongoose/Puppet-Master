/**
 * Requirements Interview Prompt Template
 *
 * Template for generating interview questions from parsed requirements.
 * Identifies gaps in requirements and generates qualifying questions.
 */

import type { ParsedRequirements, ParsedSection } from '../../types/requirements.js';

/**
 * Builds the requirements interview prompt from parsed requirements.
 *
 * @param parsed - Parsed requirements document
 * @param projectName - Project name for context
 * @param maxQuestions - Maximum number of questions to generate
 * @returns Complete prompt string for AI platform
 */
export function buildInterviewPrompt(
  parsed: ParsedRequirements,
  projectName: string,
  maxQuestions: number
): string {
  // Format requirements content
  const requirementsContent = formatRequirementsContent(parsed);

  return `# Requirements Interview Request

## Input Requirements Document

${requirementsContent}

## Your Task

Analyze the requirements above and generate qualifying questions to clarify ambiguities and fill gaps before PRD generation.

Your goal is to identify missing information that would prevent creating machine-verifiable acceptance criteria and ensure comprehensive coverage of all major component categories.

## Focus Areas

1. **Missing Information for Objective Criteria**
   - What details are needed to create machine-verifiable acceptance criteria?
   - What success metrics are unclear or missing?
   - What would make verification impossible or ambiguous?

2. **Ambiguous/Conflicting Requirements**
   - Are there contradictory statements?
   - Are terms used inconsistently?
   - Are there vague requirements that need clarification?

3. **Missing Non-Functional Requirements (NFRs)**
   - Security requirements, threat models, authentication/authorization
   - Performance targets, latency budgets, throughput requirements
   - Scalability requirements, resource constraints
   - Reliability requirements, error handling, recovery mechanisms

4. **Missing Major Component Categories**
   For each category below, determine if it's covered, missing, or explicitly out-of-scope:

   - **Product/UX**: User roles, key workflows, edge cases, accessibility requirements
   - **Data/Persistence**: Storage technology choice, schema design, migrations, backups, retention
   - **Security/Secrets**: Authentication/authorization strategy, secret storage, threat model, encryption
   - **Deployment/Environments**: Dev/staging/prod parity, configuration strategy, OS/platform support
   - **Observability**: Structured logging, metrics, tracing, crash reports, debugging tools
   - **Performance/Budgets**: Latency targets, throughput requirements, token costs, timeout policies
   - **Reliability**: Retry logic, circuit breakers, idempotency, resumability, failover
   - **Compatibility**: Windows/macOS/Linux differences, path handling, shell compatibility, browser support
   - **Testing/Verification**: Automated testing strategy, verification approach, test coverage goals

## Output Format

Generate valid JSON matching this schema:

\`\`\`typescript
interface InterviewResult {
  questions: InterviewQuestion[];
  assumptions: string[];
  coverageChecklist: CategoryCoverage[];
  timestamp: string;
  sourceDocument: {
    path: string;
    title: string;
    sectionCount: number;
  };
}

interface InterviewQuestion {
  id: string;  // Format: "Q-001", "Q-002", etc.
  category: "product_ux" | "data_persistence" | "security_secrets" |
            "deployment_environments" | "observability" | "performance_budgets" |
            "reliability" | "compatibility" | "testing_verification";
  question: string;  // The clarifying question to ask
  rationale: string;  // Why this matters for verification/testability
  defaultAssumption: string;  // What to assume if question isn't answered
  priority: "critical" | "high" | "medium" | "low";
}

interface CategoryCoverage {
  category: string;  // Same categories as above
  status: "covered" | "missing" | "out_of_scope";
  citations?: string[];  // If covered: section paths like "Requirements > Security > Auth"
  topQuestion?: string;  // If missing: the most important question to ask
  defaultAssumption?: string;  // If missing: what to assume
  rationale?: string;  // If out-of-scope: why this category is not applicable
}
\`\`\`

## Rules

1. **Limit to ${maxQuestions} questions maximum** - Prioritize the most impactful questions
2. **Prioritize by impact on verification/testability** - Questions that prevent automated acceptance criteria are highest priority
3. **Every question must include a sensible default assumption** - Default must be specific and actionable
4. **Coverage checklist must explicitly mark each category** as covered/missing/out-of-scope:
   - "covered" - Provide specific section citations
   - "missing" - Provide the top question + default assumption
   - "out_of_scope" - Provide rationale for why it doesn't apply
5. **For "covered" categories**, provide section paths showing where requirements address this
6. **For "missing" categories**, provide both the most important question AND a reasonable default
7. **Focus on gaps that would prevent automated acceptance criteria** - Manual tests are not allowed
8. **Rank questions by priority**:
   - "critical" - Missing info that blocks automated verification (security, testing, compatibility)
   - "high" - Missing info affecting architecture decisions (data persistence, deployment, performance)
   - "medium" - Missing info affecting quality (observability, reliability)
   - "low" - Missing details that have good defaults (product/UX specifics)
9. **Default assumptions must be specific**, not vague - e.g., "Use PostgreSQL with Prisma ORM" not "Use a database"
10. **Questions should be answerable** - Avoid overly broad or philosophical questions

## Project Name

Project: ${projectName}

## Generate the interview now

Output ONLY valid JSON, no markdown formatting or code blocks around the JSON.`;
}

/**
 * Formats parsed requirements into a readable string for the prompt.
 */
function formatRequirementsContent(parsed: ParsedRequirements): string {
  const lines: string[] = [];

  if (parsed.title) {
    lines.push(`# ${parsed.title}`);
    lines.push('');
  }

  // Add sections recursively
  for (const section of parsed.sections) {
    lines.push(formatSection(section, 0));
  }

  // Add extracted goals and constraints if present
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
