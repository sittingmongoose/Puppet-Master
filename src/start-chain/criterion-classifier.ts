/**
 * Criterion Classifier
 *
 * Classifies acceptance criterion descriptions into verifier types and
 * generates verifier token targets for PRD generation.
 *
 * NOTE: The runtime verification system uses these tokens in Criterion.target
 * (e.g., TEST:, FILE_VERIFY:). Downstream parsing/normalization is handled by
 * the verification layer (see prompt template in src/start-chain/prompts/prd-prompt.ts).
 */

import type { Criterion, CriterionType } from '../types/tiers.js';

export class CriterionClassifier {
  classifyAcceptanceCriterion(description: string): CriterionType {
    const normalized = description.trim();
    if (normalized.length === 0) return 'ai';

    const lower = normalized.toLowerCase();

    const hasTestWords = /\b(test|spec|unit|integration)\b/i.test(normalized);
    const hasBuildWords = /\b(build|compile|typecheck|lint)\b/i.test(normalized);
    const hasPerfWords = /\b(performance|latency|throughput)\b/i.test(normalized);
    const hasFileWords = /\b(create|add|file|exists)\b/i.test(normalized);
    const hasRegexWords = /\b(contain|include|match|pattern)\b/i.test(normalized);
    const hasUiWords = /\b(ui|display|render|show|visible)\b/i.test(normalized);

    // Prefer explicit, actionable command-like verifications.
    if (hasTestWords || hasBuildWords || hasPerfWords) return 'command';

    // Only classify to file/regex/browser when the description contains enough structure
    // to generate a meaningful verifier target.
    if (hasFileWords && this.extractLikelyFilePath(lower)) return 'file_exists';
    if (hasRegexWords && this.extractLikelyFilePath(lower) && this.extractLikelyPattern(normalized)) return 'regex';
    if (hasUiWords && this.extractUrl(normalized)) return 'browser_verify';

    return 'ai';
  }

  generateVerificationTarget(criterion: Criterion): string {
    const description = criterion.description.trim();

    // If the description already includes an explicit verifier token, keep it.
    const explicitToken = this.extractExplicitVerifierToken(description);
    if (explicitToken) return explicitToken;

    if (criterion.type === 'command') {
      const cmd = this.inferCommand(description);
      if (!cmd) return `AI_VERIFY:${description}`;

      const token =
        /\b(test|spec|unit|integration)\b/i.test(description) ? 'TEST' :
        /\b(performance|latency|throughput)\b/i.test(description) ? 'PERF_VERIFY' :
        'CLI_VERIFY';

      return `${token}:${cmd}`;
    }

    if (criterion.type === 'file_exists') {
      const filePath = this.extractLikelyFilePath(description);
      if (!filePath) return `AI_VERIFY:${description}`;
      const notExists = /\b(not exist|does not exist|doesn't exist|remove|delete)\b/i.test(description);
      return `FILE_VERIFY:${filePath}:${notExists ? 'not_exists' : 'exists'}`;
    }

    if (criterion.type === 'regex') {
      const filePath = this.extractLikelyFilePath(description);
      const pattern = this.extractLikelyPattern(description);
      if (!filePath || !pattern) return `AI_VERIFY:${description}`;
      return `REGEX_VERIFY:${filePath}:${pattern}`;
    }

    if (criterion.type === 'browser_verify') {
      const url = this.extractUrl(description);
      if (!url) return `AI_VERIFY:${description}`;
      return `BROWSER_VERIFY:${url}`;
    }

    return `AI_VERIFY:${description}`;
  }

  private inferCommand(description: string): string | null {
    const backticked = this.extractBacktickedCommand(description);
    if (backticked) return backticked;

    if (/\btypecheck\b/i.test(description)) return 'npm run typecheck';
    if (/\blint\b/i.test(description)) return 'npm run lint';
    if (/\bbuild\b|\bcompile\b/i.test(description)) return 'npm run build';
    if (/\b(test|spec|unit|integration)\b/i.test(description)) return 'npm test';

    // PERF_VERIFY requires an explicit command to time, otherwise fall back to AI verification.
    if (/\b(performance|latency|throughput)\b/i.test(description)) return null;

    return null;
  }

  private extractExplicitVerifierToken(description: string): string | null {
    const match = description.match(/\b(TEST|CLI_VERIFY|FILE_VERIFY|REGEX_VERIFY|BROWSER_VERIFY|PERF_VERIFY|AI_VERIFY):[^\s].*$/);
    return match ? match[0] : null;
  }

  private extractBacktickedCommand(description: string): string | null {
    const match = description.match(/`([^`]+)`/);
    if (!match) return null;
    const candidate = match[1].trim();
    if (candidate.length === 0) return null;
    // Heuristic: looks like a command if it has a space or is a known binary
    if (/\s/.test(candidate) || /^(npm|pnpm|yarn|node|bash|sh)\b/.test(candidate)) return candidate;
    return null;
  }

  private extractUrl(description: string): string | null {
    const match = description.match(/https?:\/\/[^\s)]+/i);
    return match ? match[0] : null;
  }

  private extractLikelyFilePath(description: string): string | null {
    // Prefer backticked file paths first.
    const backtickMatch = description.match(/`([^`]+)`/);
    if (backtickMatch) {
      const candidate = backtickMatch[1].trim();
      if (this.looksLikePath(candidate)) return candidate;
    }

    // Otherwise look for common path-ish tokens.
    const tokenMatch = description.match(/(?:^|\s)([A-Za-z0-9_./-]+\.[A-Za-z0-9]+)(?:$|\s)/);
    if (tokenMatch) {
      const candidate = tokenMatch[1].trim();
      if (this.looksLikePath(candidate)) return candidate;
    }

    // Fallback: common repo roots.
    const srcMatch = description.match(/(?:^|\s)(src\/[A-Za-z0-9_./-]+)(?:$|\s)/);
    return srcMatch ? srcMatch[1].trim() : null;
  }

  private looksLikePath(candidate: string): boolean {
    if (candidate.length < 3) return false;
    if (candidate.includes(' ')) return false;
    // Avoid capturing URLs as paths.
    if (/^https?:\/\//i.test(candidate)) return false;
    return candidate.includes('/') || candidate.includes('.') || candidate.startsWith('.');
  }

  private extractLikelyPattern(description: string): string | null {
    // If the description contains an explicit regex token, prefer its remainder.
    const tokenMatch = description.match(/\bREGEX_VERIFY:([^:]+):(.+)$/);
    if (tokenMatch) return tokenMatch[2].trim();

    // After "contain/include/match/pattern", take the rest as the intended pattern.
    const keywordMatch = description.match(/\b(contain|include|match|pattern)\b\s+(.+)$/i);
    if (keywordMatch) return keywordMatch[2].trim();

    return null;
  }
}

