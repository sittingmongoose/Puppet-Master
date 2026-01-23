/**
 * Architecture Generation Prompt Template
 * 
 * Template for generating architecture documents from requirements and PRD.
 * P1-T19: Enhanced to include rich requirements context, NFRs, and required sections.
 * 
 * Implementation of architecture generation prompt (template not yet in REQUIREMENTS.md).
 */

import type { ParsedRequirements, ParsedSection } from '../../types/requirements.js';
import type { PRD, Phase, Task } from '../../types/prd.js';

/**
 * Required architecture sections that must be present in the output.
 * Used for validation and prompt guidance.
 */
export const REQUIRED_ARCH_SECTIONS = [
  'overview',
  'data_model',
  'api_boundaries',
  'deployment',
  'observability',
  'security',
  'test_strategy',
  'directory_structure',
] as const;

export type RequiredArchSection = typeof REQUIRED_ARCH_SECTIONS[number];

/**
 * Non-functional requirement categories to extract from requirements.
 */
export const NFR_CATEGORIES = [
  'performance',
  'scalability',
  'security',
  'reliability',
  'availability',
  'maintainability',
  'observability',
  'compliance',
] as const;

/**
 * Maximum characters for a single section summary to avoid context overflow.
 */
const MAX_SECTION_CHARS = 2000;

/**
 * Maximum total characters for requirements context.
 */
const MAX_REQUIREMENTS_CONTEXT_CHARS = 15000;

/**
 * Options for architecture prompt building.
 */
export interface ArchPromptOptions {
  /** Maximum characters for requirements context (default: 15000) */
  maxRequirementsChars?: number;
  /** Maximum characters per section (default: 2000) */
  maxSectionChars?: number;
  /** Include full section content vs summaries only */
  includeFullContent?: boolean;
}

/**
 * Builds the architecture generation prompt from parsed requirements and PRD.
 * P1-T19: Enhanced to include rich context, NFRs, and required sections guidance.
 * 
 * @param parsed - Parsed requirements document
 * @param prd - Generated PRD structure
 * @param projectName - Project name
 * @param options - Optional configuration for prompt building
 * @returns Complete prompt string for AI platform
 */
export function buildArchPrompt(
  parsed: ParsedRequirements,
  prd: PRD,
  projectName: string,
  options: ArchPromptOptions = {}
): string {
  const maxRequirementsChars = options.maxRequirementsChars ?? MAX_REQUIREMENTS_CONTEXT_CHARS;
  const maxSectionChars = options.maxSectionChars ?? MAX_SECTION_CHARS;

  const requirementsContext = formatRichRequirementsContext(parsed, maxRequirementsChars, maxSectionChars);
  const nfrSummary = extractNFRSummary(parsed);
  const prdSummary = formatDetailedPrdSummary(prd);
  const traceabilityContext = formatTraceabilityContext(prd);

  return `# Architecture Document Generation Request

## Project: ${projectName}

## CRITICAL REQUIREMENTS

The following sections are REQUIRED in your output. Missing any of these sections will cause validation failure:
1. **Overview** - High-level system description, purpose, key goals
2. **Data Model & Persistence** - Data structures, storage strategy, persistence layer
3. **API/Service Boundaries** - Service interfaces, API contracts, communication patterns
4. **Deployment & Environments** - Deployment strategy, environments, infrastructure
5. **Observability** - Logging, metrics, tracing, alerting strategy
6. **Security** - Authentication, authorization, secrets management, threat considerations
7. **Test Strategy** - Automated testing approach with verifiable commands (NO MANUAL-ONLY)
8. **Directory Structure** - Logical code organization

## Requirements Document Context

${requirementsContext}

## Non-Functional Requirements (NFRs)

${nfrSummary}

## PRD Structure (Generated from Requirements)

${prdSummary}

## Traceability References

${traceabilityContext}

## Your Task

Generate a COMPLETE and SPECIFIC architecture document for this project that:

1. **Is NOT generic** - Must reference specific requirements, use concrete names from the PRD
2. **Includes ALL required sections** listed above
3. **Has automated test strategy** - Every test/verification approach must include executable commands (NO "manually verify" or "visual inspection" only)
4. **References PRD items** - Module breakdown should map to PRD phases/tasks
5. **Addresses NFRs explicitly** - Each NFR category must be addressed somewhere in the architecture
6. **Is implementation-ready** - Should guide developers with specific patterns, not abstract concepts

## Output Format

Generate a markdown document with this EXACT structure:

\`\`\`markdown
# Architecture Document: ${projectName}

## Overview
[2-3 paragraphs: system purpose, key goals, high-level approach]
[Reference specific requirements and PRD phases]

## Data Model & Persistence
### Data Structures
[Key entities, relationships, schemas]
### Storage Strategy
[Database choice, caching, file storage]
### Data Flow
[How data moves through the system]

## API/Service Boundaries
### Service Architecture
[Monolith/microservices, service breakdown]
### API Contracts
[Key endpoints, request/response formats]
### Communication Patterns
[Sync/async, message queues, events]

## Deployment & Environments
### Deployment Model
[Container, serverless, VM, etc.]
### Environments
[Dev, staging, production differences]
### Infrastructure
[Required infrastructure components]

## Observability
### Logging Strategy
[What to log, log levels, aggregation]
### Metrics
[Key metrics to track, dashboards]
### Tracing
[Distributed tracing approach if applicable]
### Alerting
[Critical alerts, thresholds]

## Security
### Authentication
[Auth approach, identity provider]
### Authorization
[Permission model, access control]
### Secrets Management
[How secrets are stored/accessed]
### Security Considerations
[Key threats, mitigations]

## Test Strategy
### Unit Testing
[Framework, coverage expectations]
**Commands:** \`npm test\`, \`npm run test:unit\`

### Integration Testing
[Approach, test data]
**Commands:** \`npm run test:integration\`

### E2E Testing
[Framework, key scenarios]
**Commands:** \`npm run test:e2e\`

### Verification Mapping
[Which tests verify which PRD acceptance criteria]

## Directory Structure
\`\`\`
[Suggested directory tree]
\`\`\`
[Explanation of organization]

## Module Breakdown
[Detailed module descriptions mapped to PRD phases]

## Dependencies
### Internal Dependencies
[Module dependencies]
### External Dependencies
[Libraries, services, APIs]

## Tech Stack Recommendations
[Recommended technologies with rationale]
\`\`\`

## IMPORTANT CONSTRAINTS

1. **NO MANUAL-ONLY VERIFICATION**: Every test strategy item MUST include executable commands
2. **BE SPECIFIC**: Use actual names from requirements/PRD, not placeholders
3. **COMPLETE ALL SECTIONS**: Missing sections will fail validation
4. **REFERENCE REQUIREMENTS**: Tie architecture decisions back to specific requirements

## Generate the architecture document now

Output the complete markdown document.`;
}

/**
 * Builds an architecture outline prompt for Pass A of multi-pass generation.
 * Generates a skeletal architecture with section anchors.
 */
export function buildArchOutlinePrompt(
  parsed: ParsedRequirements,
  prd: PRD,
  projectName: string
): string {
  const briefContext = formatBriefRequirementsContext(parsed);
  const phaseList = prd.phases.map(p => `- ${p.id}: ${p.title}`).join('\n');

  return `# Architecture Outline Generation

## Project: ${projectName}

## Requirements Summary
${briefContext}

## PRD Phases
${phaseList}

## Your Task

Generate an OUTLINE for the architecture document with:
1. All required sections as headers
2. 1-2 sentence description of what each section will contain
3. Key decision points or considerations for each section
4. Placeholder references to relevant PRD phases

## Required Sections (must all be present):
- Overview
- Data Model & Persistence
- API/Service Boundaries
- Deployment & Environments
- Observability
- Security
- Test Strategy (with automated commands)
- Directory Structure
- Module Breakdown
- Dependencies
- Tech Stack

## Output Format

\`\`\`markdown
# Architecture Outline: ${projectName}

## Overview
[Brief: What this section will cover]
[Key considerations: ...]
[Relevant PRD phases: ...]

## Data Model & Persistence
[Brief: What this section will cover]
[Key considerations: ...]
[Relevant PRD phases: ...]

... (continue for all sections)
\`\`\`

Generate the outline now.`;
}

/**
 * Builds a section expansion prompt for Pass B of multi-pass generation.
 * Expands a single architecture section in detail.
 */
export function buildSectionExpansionPrompt(
  sectionName: string,
  sectionOutline: string,
  parsed: ParsedRequirements,
  prd: PRD,
  projectName: string,
  previousSections: string
): string {
  // Get section-specific requirements context
  const relevantContext = extractSectionRelevantContext(sectionName, parsed);
  const relevantPrdItems = extractSectionRelevantPrdItems(sectionName, prd);

  return `# Architecture Section Expansion: ${sectionName}

## Project: ${projectName}

## Section Outline
${sectionOutline}

## Relevant Requirements
${relevantContext}

## Relevant PRD Items
${relevantPrdItems}

## Previous Sections (for consistency)
${previousSections.length > 3000 ? previousSections.substring(0, 3000) + '\n...[truncated]' : previousSections}

## Your Task

Expand the "${sectionName}" section with:
1. Detailed, specific content (not generic)
2. References to actual requirements and PRD items
3. Concrete recommendations with rationale
4. For Test Strategy: MUST include executable test commands (no manual-only)

## Output Format

Output ONLY the expanded section content (no header, just the content):

\`\`\`markdown
[Expanded section content here]
\`\`\``;
}

/**
 * Formats rich requirements context with full section content.
 * P1-T19: Enhanced to include more detail per section.
 */
function formatRichRequirementsContext(
  parsed: ParsedRequirements,
  maxTotalChars: number,
  maxSectionChars: number
): string {
  const lines: string[] = [];
  let totalChars = 0;

  if (parsed.title) {
    lines.push(`### Document: ${parsed.title}`);
    lines.push('');
  }

  // Add goals prominently
  if (parsed.extractedGoals.length > 0) {
    lines.push('### Goals');
    for (const goal of parsed.extractedGoals) {
      lines.push(`- ${goal}`);
    }
    lines.push('');
  }

  // Add constraints prominently
  if (parsed.extractedConstraints.length > 0) {
    lines.push('### Constraints');
    for (const constraint of parsed.extractedConstraints) {
      lines.push(`- ${constraint}`);
    }
    lines.push('');
  }

  // Add section content with chunking
  if (parsed.sections.length > 0) {
    lines.push('### Requirements Sections');
    lines.push('');

    for (const section of parsed.sections) {
      const sectionContent = formatSectionWithChildren(section, maxSectionChars, 0);
      const sectionText = `#### ${section.title}\n${sectionContent}\n`;
      
      if (totalChars + sectionText.length > maxTotalChars) {
        lines.push(`\n[...${parsed.sections.length - lines.filter(l => l.startsWith('####')).length} more sections truncated due to size limits...]`);
        break;
      }
      
      lines.push(sectionText);
      totalChars += sectionText.length;
    }
  }

  return lines.join('\n');
}

/**
 * Formats a section with its children, respecting character limits.
 */
function formatSectionWithChildren(
  section: ParsedSection,
  maxChars: number,
  depth: number
): string {
  const indent = '  '.repeat(depth);
  const lines: string[] = [];
  let currentChars = 0;

  // Add section content
  if (section.content.trim()) {
    const content = section.content.trim();
    if (content.length <= maxChars) {
      lines.push(content);
      currentChars += content.length;
    } else {
      // Truncate intelligently at sentence boundary if possible
      const truncated = truncateAtSentence(content, maxChars);
      lines.push(truncated + ' [...]');
      currentChars += truncated.length;
    }
  }

  // Add children if space allows
  const remainingChars = maxChars - currentChars;
  if (section.children.length > 0 && remainingChars > 200) {
    const charsPerChild = Math.floor(remainingChars / section.children.length);
    for (const child of section.children) {
      const childContent = formatSectionWithChildren(child, charsPerChild, depth + 1);
      if (childContent.trim()) {
        lines.push(`${indent}**${child.title}**`);
        lines.push(childContent);
      }
    }
  }

  return lines.join('\n');
}

/**
 * Truncates text at a sentence boundary.
 */
function truncateAtSentence(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  
  const truncated = text.substring(0, maxChars);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('. '),
    truncated.lastIndexOf('.\n'),
    truncated.lastIndexOf('? '),
    truncated.lastIndexOf('! ')
  );
  
  if (lastSentenceEnd > maxChars * 0.5) {
    return truncated.substring(0, lastSentenceEnd + 1);
  }
  
  return truncated;
}

/**
 * Formats brief requirements context for outline generation.
 */
function formatBriefRequirementsContext(parsed: ParsedRequirements): string {
  const lines: string[] = [];

  if (parsed.title) {
    lines.push(`**Title:** ${parsed.title}`);
  }

  // Goals summary
  if (parsed.extractedGoals.length > 0) {
    lines.push(`**Goals:** ${parsed.extractedGoals.slice(0, 5).join('; ')}`);
  }

  // Section titles only
  if (parsed.sections.length > 0) {
    const sectionTitles = parsed.sections.map(s => s.title).slice(0, 10);
    lines.push(`**Sections:** ${sectionTitles.join(', ')}`);
  }

  return lines.join('\n');
}

/**
 * Extracts and summarizes NFRs from requirements.
 * P1-T19: New function to explicitly surface non-functional requirements.
 */
function extractNFRSummary(parsed: ParsedRequirements): string {
  const nfrs: Record<string, string[]> = {};
  const rawText = parsed.rawText.toLowerCase();
  const content = parsed.sections.map(s => s.content).join('\n');

  // Keywords for each NFR category
  const nfrKeywords: Record<string, string[]> = {
    performance: ['performance', 'latency', 'response time', 'throughput', 'fast', 'speed', 'milliseconds', 'ms'],
    scalability: ['scale', 'scalability', 'concurrent', 'users', 'load', 'capacity', 'horizontal', 'vertical'],
    security: ['security', 'authentication', 'authorization', 'encrypt', 'secure', 'ssl', 'tls', 'oauth', 'jwt', 'rbac'],
    reliability: ['reliability', 'fault', 'tolerant', 'recovery', 'backup', 'failover', 'uptime', 'sla'],
    availability: ['availability', 'uptime', '99.9', 'always-on', 'redundant', 'ha ', 'high availability'],
    maintainability: ['maintainability', 'modular', 'clean code', 'documentation', 'readable'],
    observability: ['observability', 'logging', 'monitoring', 'metrics', 'tracing', 'alerting', 'dashboard'],
    compliance: ['compliance', 'gdpr', 'hipaa', 'pci', 'audit', 'regulatory', 'legal'],
  };

  // Extract sentences containing NFR keywords
  const sentences = content.split(/[.!?]+/);
  
  for (const [category, keywords] of Object.entries(nfrKeywords)) {
    const relevant: string[] = [];
    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      if (keywords.some(kw => lowerSentence.includes(kw))) {
        const trimmed = sentence.trim();
        if (trimmed.length > 10 && trimmed.length < 300) {
          relevant.push(trimmed);
        }
      }
    }
    if (relevant.length > 0) {
      nfrs[category] = relevant.slice(0, 3); // Top 3 per category
    }
  }

  // Format output
  const lines: string[] = [];
  
  if (Object.keys(nfrs).length === 0) {
    lines.push('*No explicit NFRs detected. Architecture should address standard NFR categories.*');
    lines.push('');
    lines.push('Categories to address:');
    for (const category of NFR_CATEGORIES) {
      lines.push(`- **${category.charAt(0).toUpperCase() + category.slice(1)}**: [Define based on project context]`);
    }
  } else {
    for (const [category, items] of Object.entries(nfrs)) {
      lines.push(`### ${category.charAt(0).toUpperCase() + category.slice(1)}`);
      for (const item of items) {
        lines.push(`- ${item}`);
      }
      lines.push('');
    }
    
    // Note missing categories
    const coveredCategories = Object.keys(nfrs);
    const missingCategories = NFR_CATEGORIES.filter(c => !coveredCategories.includes(c));
    if (missingCategories.length > 0) {
      lines.push('### Categories Not Explicitly Mentioned');
      lines.push('*Architecture should still address:*');
      for (const category of missingCategories) {
        lines.push(`- ${category.charAt(0).toUpperCase() + category.slice(1)}`);
      }
    }
  }

  return lines.join('\n');
}

/**
 * Formats detailed PRD summary with acceptance criteria.
 * P1-T19: Enhanced to include more detail.
 */
function formatDetailedPrdSummary(prd: PRD): string {
  const lines: string[] = [];

  lines.push(`**Project:** ${prd.project}`);
  lines.push(`**Description:** ${prd.description}`);
  lines.push('');
  lines.push(`**Total Phases:** ${prd.phases.length}`);
  lines.push(`**Total Tasks:** ${prd.phases.reduce((sum, p) => sum + p.tasks.length, 0)}`);
  lines.push('');

  for (const phase of prd.phases) {
    lines.push(`### Phase: ${phase.id} - ${phase.title}`);
    
    if (phase.description) {
      const desc = phase.description.trim();
      lines.push(desc.length > 300 ? desc.substring(0, 300) + '...' : desc);
    }
    
    // Include acceptance criteria summary
    if (phase.acceptanceCriteria.length > 0) {
      lines.push('**Acceptance Criteria:**');
      for (const criterion of phase.acceptanceCriteria.slice(0, 3)) {
        lines.push(`- ${criterion.description}`);
      }
      if (phase.acceptanceCriteria.length > 3) {
        lines.push(`  *(+${phase.acceptanceCriteria.length - 3} more)*`);
      }
    }
    
    // Include tasks with detail
    if (phase.tasks.length > 0) {
      lines.push(`**Tasks (${phase.tasks.length}):**`);
      for (const task of phase.tasks) {
        lines.push(`- **${task.id}**: ${task.title}`);
        if (task.description) {
          const taskDesc = task.description.trim().split('\n')[0];
          if (taskDesc && taskDesc.length < 150) {
            lines.push(`  ${taskDesc}`);
          }
        }
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Formats traceability context showing requirement-to-PRD mapping.
 * P1-T19: New function to include traceability in architecture context.
 */
function formatTraceabilityContext(prd: PRD): string {
  const lines: string[] = [];
  let hasSourceRefs = false;

  lines.push('*PRD items traced to requirements:*');
  lines.push('');

  for (const phase of prd.phases) {
    if (phase.sourceRefs && phase.sourceRefs.length > 0) {
      hasSourceRefs = true;
      lines.push(`- **${phase.id}** ← ${phase.sourceRefs.map(r => r.sectionPath).join(', ')}`);
    }
    for (const task of phase.tasks) {
      if (task.sourceRefs && task.sourceRefs.length > 0) {
        hasSourceRefs = true;
        lines.push(`- **${task.id}** ← ${task.sourceRefs.map(r => r.sectionPath).join(', ')}`);
      }
    }
  }

  if (!hasSourceRefs) {
    lines.push('*No explicit traceability links. Architecture should ensure all PRD items are addressed.*');
  }

  return lines.join('\n');
}

/**
 * Extracts requirements context relevant to a specific architecture section.
 */
function extractSectionRelevantContext(
  sectionName: string,
  parsed: ParsedRequirements
): string {
  const sectionKeywords: Record<string, string[]> = {
    'Data Model & Persistence': ['data', 'database', 'storage', 'model', 'entity', 'schema', 'persist', 'cache'],
    'API/Service Boundaries': ['api', 'service', 'endpoint', 'interface', 'contract', 'rest', 'graphql', 'rpc'],
    'Deployment & Environments': ['deploy', 'environment', 'staging', 'production', 'docker', 'kubernetes', 'cloud'],
    'Observability': ['log', 'metric', 'trace', 'monitor', 'alert', 'dashboard', 'observ'],
    'Security': ['security', 'auth', 'permission', 'role', 'secret', 'encrypt', 'token', 'access'],
    'Test Strategy': ['test', 'coverage', 'unit', 'integration', 'e2e', 'verify', 'quality'],
  };

  const keywords = sectionKeywords[sectionName] || [];
  if (keywords.length === 0) {
    return formatBriefRequirementsContext(parsed);
  }

  const relevantSentences: string[] = [];
  const content = parsed.sections.map(s => s.content).join('\n');
  const sentences = content.split(/[.!?]+/);

  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    if (keywords.some(kw => lowerSentence.includes(kw))) {
      const trimmed = sentence.trim();
      if (trimmed.length > 10 && trimmed.length < 300) {
        relevantSentences.push(trimmed);
      }
    }
  }

  if (relevantSentences.length === 0) {
    return '*No specific requirements found for this section.*';
  }

  return relevantSentences.slice(0, 10).map(s => `- ${s}`).join('\n');
}

/**
 * Extracts PRD items relevant to a specific architecture section.
 */
function extractSectionRelevantPrdItems(
  sectionName: string,
  prd: PRD
): string {
  const sectionKeywords: Record<string, string[]> = {
    'Data Model & Persistence': ['data', 'database', 'storage', 'model', 'entity', 'schema'],
    'API/Service Boundaries': ['api', 'service', 'endpoint', 'interface'],
    'Deployment & Environments': ['deploy', 'environment', 'setup', 'config'],
    'Observability': ['log', 'metric', 'monitor', 'trace'],
    'Security': ['security', 'auth', 'permission', 'access'],
    'Test Strategy': ['test', 'verify', 'quality', 'coverage'],
  };

  const keywords = sectionKeywords[sectionName] || [];
  const relevantItems: string[] = [];

  for (const phase of prd.phases) {
    const phaseText = `${phase.title} ${phase.description || ''}`.toLowerCase();
    if (keywords.some(kw => phaseText.includes(kw))) {
      relevantItems.push(`- **${phase.id}**: ${phase.title}`);
    }
    for (const task of phase.tasks) {
      const taskText = `${task.title} ${task.description || ''}`.toLowerCase();
      if (keywords.some(kw => taskText.includes(kw))) {
        relevantItems.push(`- **${task.id}**: ${task.title}`);
      }
    }
  }

  if (relevantItems.length === 0) {
    return '*No specific PRD items mapped to this section.*';
  }

  return relevantItems.slice(0, 10).join('\n');
}

// Keep backward compatibility exports
/**
 * Formats a concise summary of requirements for the prompt.
 * @deprecated Use formatRichRequirementsContext for better results
 */
function formatRequirementsSummary(parsed: ParsedRequirements): string {
  return formatBriefRequirementsContext(parsed);
}

/**
 * Formats a concise summary of PRD structure for the prompt.
 * @deprecated Use formatDetailedPrdSummary for better results
 */
function formatPrdSummary(prd: PRD): string {
  const lines: string[] = [];

  lines.push(`**Project:** ${prd.project}`);
  lines.push(`**Description:** ${prd.description}`);
  lines.push('');
  lines.push(`**Phases:** ${prd.phases.length}`);
  lines.push('');

  for (const phase of prd.phases) {
    lines.push(`### Phase: ${phase.id} - ${phase.title}`);
    if (phase.description) {
      const preview = phase.description.trim().split('\n')[0];
      if (preview && preview.length < 200) {
        lines.push(`  ${preview}`);
      }
    }
    lines.push(`  **Tasks:** ${phase.tasks.length}`);
    
    for (const task of phase.tasks) {
      lines.push(`  - Task: ${task.id} - ${task.title}`);
      lines.push(`    **Subtasks:** ${task.subtasks.length}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
