/**
 * Wiring Auditor
 * 
 * Generic static analysis tool using TypeScript compiler API to detect:
 * - Orphan exports (exported but never imported)
 * - Unused container registrations
 * - Missing dependency injections
 * - Dead imports
 * 
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T22 for implementation details.
 */

import * as ts from 'typescript';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type {
  WiringAuditConfig,
  WiringAuditResult,
  WiringAuditSummary,
  WiringIssue,
  ExportInfo,
  ImportInfo,
  RegistrationInfo,
  ResolutionInfo,
} from './types.js';

/**
 * WiringAuditor class performs static analysis on TypeScript codebases
 * to detect wiring issues like orphan exports and unused registrations.
 */
export class WiringAuditor {
  private program: ts.Program | null = null;
  private checker: ts.TypeChecker | null = null;
  private exports: ExportInfo[] = [];
  private imports: ImportInfo[] = [];
  private registrations: RegistrationInfo[] = [];
  private resolutions: ResolutionInfo[] = [];

  constructor(private readonly config: WiringAuditConfig) {}

  /**
   * Initialize the TypeScript compiler program.
   */
  private initialize(): void {
    const configPath = ts.findConfigFile(
      this.config.rootDir,
      ts.sys.fileExists,
      'tsconfig.json'
    );

    if (!configPath) {
      throw new Error(`tsconfig.json not found in ${this.config.rootDir}`);
    }

    const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
    if (configFile.error) {
      throw new Error(`Error reading tsconfig.json: ${ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n')}`);
    }

    const parsedConfig = ts.parseJsonConfigFileContent(
      configFile.config,
      ts.sys,
      path.dirname(configPath)
    );

    // Filter files based on include/exclude patterns
    const filteredFiles = this.filterFiles(parsedConfig.fileNames);

    this.program = ts.createProgram(filteredFiles, parsedConfig.options);
    this.checker = this.program.getTypeChecker();
  }

  /**
   * Filter files based on include/exclude patterns.
   */
  private filterFiles(files: string[]): string[] {
    return files.filter((file) => {
      const relativePath = path.relative(this.config.rootDir, file);
      
      // Check exclude patterns
      for (const pattern of this.config.exclude) {
        if (this.matchesPattern(relativePath, pattern)) {
          return false;
        }
      }
      
      // Check include patterns (if specified)
      if (this.config.include.length > 0) {
        for (const pattern of this.config.include) {
          if (this.matchesPattern(relativePath, pattern)) {
            return true;
          }
        }
        return false;
      }
      
      return true;
    });
  }

  /**
   * Simple glob pattern matching.
   */
  private matchesPattern(filePath: string, pattern: string): boolean {
    // Convert glob to regex
    const regexPattern = pattern
      .replace(/\*\*/g, '<<<GLOBSTAR>>>')
      .replace(/\*/g, '[^/]*')
      .replace(/<<<GLOBSTAR>>>/g, '.*')
      .replace(/\?/g, '.');
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(filePath);
  }

  /**
   * Run the full wiring audit.
   */
  async audit(): Promise<WiringAuditResult> {
    const startTime = Date.now();
    
    this.initialize();
    
    if (!this.program || !this.checker) {
      throw new Error('TypeScript program not initialized');
    }

    // Collect all exports and imports from source files
    this.collectExportsAndImports();

    // Parse container registrations and resolutions
    this.parseContainerRegistrations();
    this.findContainerResolutions();

    // Run all checks
    const issues: WiringIssue[] = [];
    issues.push(...this.checkOrphanExports());
    issues.push(...this.checkUnusedRegistrations());
    issues.push(...this.checkDeadImports());
    // Note: checkMissingInjections is complex and may need separate implementation

    const summary = this.computeSummary(issues);
    const durationMs = Date.now() - startTime;

    return {
      issues,
      summary,
      passed: issues.filter((i) => i.severity === 'error').length === 0,
      durationMs,
      timestamp: new Date().toISOString(),
      config: this.config,
    };
  }

  /**
   * Collect all exports and imports from source files.
   */
  private collectExportsAndImports(): void {
    if (!this.program) return;

    for (const sourceFile of this.program.getSourceFiles()) {
      // Skip declaration files and node_modules
      if (sourceFile.isDeclarationFile) continue;
      if (sourceFile.fileName.includes('node_modules')) continue;

      const relativePath = path.relative(this.config.rootDir, sourceFile.fileName);

      // Visit each node in the file
      ts.forEachChild(sourceFile, (node) => {
        this.visitNode(node, sourceFile, relativePath);
      });
    }
  }

  /**
   * Visit a node to extract export/import information.
   */
  private visitNode(node: ts.Node, sourceFile: ts.SourceFile, relativePath: string): void {
    // Handle export declarations
    if (ts.isExportDeclaration(node)) {
      this.handleExportDeclaration(node, sourceFile, relativePath);
    }
    // Handle export assignments (export default)
    else if (ts.isExportAssignment(node)) {
      this.handleExportAssignment(node, sourceFile, relativePath);
    }
    // Handle function/class/variable declarations with export modifier
    else if (this.hasExportModifier(node)) {
      this.handleExportedDeclaration(node, sourceFile, relativePath);
    }
    // Handle import declarations
    else if (ts.isImportDeclaration(node)) {
      this.handleImportDeclaration(node, sourceFile, relativePath);
    }
  }

  /**
   * Check if a node has the export modifier.
   */
  private hasExportModifier(node: ts.Node): boolean {
    const modifiers = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
    return modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false;
  }

  /**
   * Handle export declarations (export { x } from 'y' or export { x }).
   */
  private handleExportDeclaration(
    node: ts.ExportDeclaration,
    sourceFile: ts.SourceFile,
    relativePath: string
  ): void {
    const isTypeOnly = node.isTypeOnly;
    const moduleSpecifier = node.moduleSpecifier;
    const isReExport = moduleSpecifier !== undefined;
    const reExportSource = isReExport && ts.isStringLiteral(moduleSpecifier)
      ? moduleSpecifier.text
      : undefined;

    if (node.exportClause && ts.isNamedExports(node.exportClause)) {
      for (const element of node.exportClause.elements) {
        const symbolName = element.name.text;
        const line = sourceFile.getLineAndCharacterOfPosition(element.getStart()).line + 1;
        
        this.exports.push({
          symbol: symbolName,
          file: relativePath,
          line,
          isType: isTypeOnly || element.isTypeOnly,
          isReExport,
          reExportSource,
        });
      }
    } else if (!node.exportClause && isReExport) {
      // export * from 'module' - mark as a special re-export
      const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
      this.exports.push({
        symbol: '*',
        file: relativePath,
        line,
        isType: isTypeOnly,
        isReExport: true,
        reExportSource,
      });
    }
  }

  /**
   * Handle export assignments (export default x).
   */
  private handleExportAssignment(
    node: ts.ExportAssignment,
    sourceFile: ts.SourceFile,
    relativePath: string
  ): void {
    const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
    
    this.exports.push({
      symbol: 'default',
      file: relativePath,
      line,
      isType: false,
      isReExport: false,
    });
  }

  /**
   * Handle declarations with export modifier.
   */
  private handleExportedDeclaration(
    node: ts.Node,
    sourceFile: ts.SourceFile,
    relativePath: string
  ): void {
    let symbolName: string | undefined;
    const isTypeOnly = ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node);

    if (ts.isFunctionDeclaration(node) && node.name) {
      symbolName = node.name.text;
    } else if (ts.isClassDeclaration(node) && node.name) {
      symbolName = node.name.text;
    } else if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        if (ts.isIdentifier(decl.name)) {
          const varLine = sourceFile.getLineAndCharacterOfPosition(decl.getStart()).line + 1;
          this.exports.push({
            symbol: decl.name.text,
            file: relativePath,
            line: varLine,
            isType: false,
            isReExport: false,
          });
        }
      }
      return;
    } else if (ts.isTypeAliasDeclaration(node)) {
      symbolName = node.name.text;
    } else if (ts.isInterfaceDeclaration(node)) {
      symbolName = node.name.text;
    } else if (ts.isEnumDeclaration(node)) {
      symbolName = node.name.text;
    }

    if (symbolName) {
      const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
      this.exports.push({
        symbol: symbolName,
        file: relativePath,
        line,
        isType: isTypeOnly,
        isReExport: false,
      });
    }
  }

  /**
   * Handle import declarations.
   */
  private handleImportDeclaration(
    node: ts.ImportDeclaration,
    sourceFile: ts.SourceFile,
    relativePath: string
  ): void {
    if (!ts.isStringLiteral(node.moduleSpecifier)) return;

    const fromModule = node.moduleSpecifier.text;
    const isTypeOnly = node.importClause?.isTypeOnly ?? false;

    // Named imports
    if (node.importClause?.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
      for (const element of node.importClause.namedBindings.elements) {
        const symbolName = element.propertyName?.text ?? element.name.text;
        const line = sourceFile.getLineAndCharacterOfPosition(element.getStart()).line + 1;
        
        // Check if the import is used in the file
        const isUsed = this.isSymbolUsedInFile(element.name.text, sourceFile, node);
        
        this.imports.push({
          symbol: symbolName,
          file: relativePath,
          line,
          fromModule,
          isType: isTypeOnly || element.isTypeOnly,
          isUsed,
        });
      }
    }

    // Default import
    if (node.importClause?.name) {
      const line = sourceFile.getLineAndCharacterOfPosition(node.importClause.name.getStart()).line + 1;
      const isUsed = this.isSymbolUsedInFile(node.importClause.name.text, sourceFile, node);
      
      this.imports.push({
        symbol: 'default',
        file: relativePath,
        line,
        fromModule,
        isType: isTypeOnly,
        isUsed,
      });
    }

    // Namespace import (import * as x)
    if (node.importClause?.namedBindings && ts.isNamespaceImport(node.importClause.namedBindings)) {
      const name = node.importClause.namedBindings.name.text;
      const line = sourceFile.getLineAndCharacterOfPosition(node.importClause.namedBindings.getStart()).line + 1;
      const isUsed = this.isSymbolUsedInFile(name, sourceFile, node);
      
      this.imports.push({
        symbol: '*',
        file: relativePath,
        line,
        fromModule,
        isType: isTypeOnly,
        isUsed,
      });
    }
  }

  /**
   * Check if a symbol is used in a file (beyond its import).
   */
  private isSymbolUsedInFile(symbolName: string, sourceFile: ts.SourceFile, importNode: ts.Node): boolean {
    let used = false;

    const visit = (node: ts.Node): void => {
      // Skip the import node itself
      if (node === importNode) return;

      // Check if this is an identifier matching our symbol
      if (ts.isIdentifier(node) && node.text === symbolName) {
        // Make sure it's not part of the import declaration
        let parent = node.parent;
        while (parent) {
          if (parent === importNode) return;
          parent = parent.parent;
        }
        used = true;
        return;
      }

      ts.forEachChild(node, visit);
    };

    ts.forEachChild(sourceFile, visit);
    return used;
  }

  /**
   * Parse container registrations from the container file.
   */
  private parseContainerRegistrations(): void {
    const containerPath = path.join(this.config.rootDir, this.config.containerFile);
    
    if (!fs.existsSync(containerPath)) {
      return;
    }

    const containerSource = fs.readFileSync(containerPath, 'utf8');
    const lines = containerSource.split('\n');

    // Match patterns like:
    // container.register('key', ...)
    // container.register<Type>('key', ...)
    // container.registerInstance('key', ...)
    const registerPattern = /container\.(register|registerInstance)(?:<[^>]*>)?\s*\(\s*['"]([^'"]+)['"]/g;

    let match;
    while ((match = registerPattern.exec(containerSource)) !== null) {
      const method = match[1];
      const key = match[2];
      
      // Find line number
      let lineNumber = 1;
      let charCount = 0;
      for (let i = 0; i < lines.length; i++) {
        charCount += lines[i].length + 1; // +1 for newline
        if (charCount > match.index) {
          lineNumber = i + 1;
          break;
        }
      }

      this.registrations.push({
        key,
        line: lineNumber,
        registrationType: method === 'registerInstance' ? 'instance' : 'singleton',
      });
    }
  }

  /**
   * Find all container resolution calls.
   */
  private findContainerResolutions(): void {
    if (!this.program) return;

    for (const sourceFile of this.program.getSourceFiles()) {
      if (sourceFile.isDeclarationFile) continue;
      if (sourceFile.fileName.includes('node_modules')) continue;

      const relativePath = path.relative(this.config.rootDir, sourceFile.fileName);
      const sourceText = sourceFile.getFullText();

      // Match patterns like:
      // container.resolve('key')
      // container.resolve<Type>('key')
      const resolvePattern = /container\.resolve(?:<[^>]*>)?\s*\(\s*['"]([^'"]+)['"]/g;

      let match;
      while ((match = resolvePattern.exec(sourceText)) !== null) {
        const key = match[1];
        const pos = match.index;
        const line = sourceFile.getLineAndCharacterOfPosition(pos).line + 1;

        this.resolutions.push({
          key,
          file: relativePath,
          line,
        });
      }
    }
  }

  /**
   * Check for orphan exports (exports that are never imported).
   */
  private checkOrphanExports(): WiringIssue[] {
    const issues: WiringIssue[] = [];

    for (const exp of this.exports) {
      // Skip entry points
      if (this.isEntryPoint(exp.file)) continue;

      // Skip index.ts barrel files for certain checks
      if (exp.file.endsWith('index.ts') && exp.isReExport) continue;

      // Skip wildcard re-exports
      if (exp.symbol === '*') continue;

      // Skip allowed orphan paths
      if (this.config.allowedOrphanPaths?.some((p) => exp.file.includes(p))) continue;

      // Skip ignored symbols
      if (this.config.ignoreSymbols?.includes(exp.symbol)) continue;

      // Check if this export is imported anywhere
      const isImported = this.imports.some((imp) => {
        // The import must reference this file (resolve module path)
        const importedFrom = this.resolveModulePath(imp.fromModule, imp.file);
        const exportFile = exp.file.replace(/\.ts$/, '');
        
        // Check if paths match (consider index.ts re-exports)
        const pathsMatch = 
          importedFrom === exportFile ||
          importedFrom === exportFile.replace(/\/index$/, '') ||
          (importedFrom.endsWith('/index') && exportFile === importedFrom.replace(/\/index$/, ''));

        // Check if symbol matches
        const symbolsMatch = imp.symbol === exp.symbol || imp.symbol === '*';

        return pathsMatch && symbolsMatch;
      });

      if (!isImported) {
        issues.push({
          type: 'orphan_export',
          severity: 'warning',
          location: {
            file: exp.file,
            line: exp.line,
            symbol: exp.symbol,
          },
          description: `Exported '${exp.symbol}' is never imported anywhere`,
          suggestion: `Either import and use '${exp.symbol}' or remove the export`,
        });
      }
    }

    return issues;
  }

  /**
   * Check for unused container registrations.
   */
  private checkUnusedRegistrations(): WiringIssue[] {
    const issues: WiringIssue[] = [];

    for (const reg of this.registrations) {
      // Check if this registration is ever resolved
      const isResolved = this.resolutions.some((res) => res.key === reg.key);

      if (!isResolved) {
        issues.push({
          type: 'unused_registration',
          severity: 'error',
          location: {
            file: this.config.containerFile,
            line: reg.line,
            symbol: reg.key,
          },
          description: `Container registration '${reg.key}' is never resolved`,
          suggestion: `Either use 'container.resolve("${reg.key}")' somewhere, or remove the registration`,
        });
      }
    }

    return issues;
  }

  /**
   * Check for dead imports (imports that are not used in the file).
   */
  private checkDeadImports(): WiringIssue[] {
    const issues: WiringIssue[] = [];

    for (const imp of this.imports) {
      // Skip type-only imports (they may be used for type annotations only)
      if (imp.isType) continue;

      // Skip namespace imports (harder to detect usage)
      if (imp.symbol === '*') continue;

      if (!imp.isUsed) {
        issues.push({
          type: 'dead_import',
          severity: 'warning',
          location: {
            file: imp.file,
            line: imp.line,
            symbol: imp.symbol,
          },
          description: `Import '${imp.symbol}' from '${imp.fromModule}' is never used in this file`,
          suggestion: `Remove the unused import or use the imported symbol`,
        });
      }
    }

    return issues;
  }

  /**
   * Check if a file is an entry point.
   */
  private isEntryPoint(file: string): boolean {
    return this.config.entryPoints.some((ep) => file.includes(ep));
  }

  /**
   * Resolve a module path relative to the importing file.
   */
  private resolveModulePath(modulePath: string, importingFile: string): string {
    if (!modulePath.startsWith('.')) {
      // External module, return as-is
      return modulePath;
    }

    const importDir = path.dirname(importingFile);
    let resolved = path.join(importDir, modulePath);
    
    // Remove .js extension (TypeScript import convention)
    resolved = resolved.replace(/\.js$/, '');
    
    // Normalize path separators
    resolved = resolved.replace(/\\/g, '/');
    
    return resolved;
  }

  /**
   * Compute summary statistics from issues.
   */
  private computeSummary(issues: WiringIssue[]): WiringAuditSummary {
    return {
      totalExports: this.exports.length,
      orphanExports: issues.filter((i) => i.type === 'orphan_export').length,
      totalRegistrations: this.registrations.length,
      unusedRegistrations: issues.filter((i) => i.type === 'unused_registration').length,
      totalInjections: 0, // TODO: implement injection analysis
      missingInjections: issues.filter((i) => i.type === 'missing_injection').length,
      totalImports: this.imports.length,
      deadImports: issues.filter((i) => i.type === 'dead_import').length,
      eventMismatches: issues.filter((i) => i.type === 'event_mismatch').length,
      verifierGaps: issues.filter((i) => i.type === 'unresolved_dependency').length,
    };
  }

  /**
   * Get all collected exports (for testing).
   */
  getExports(): ExportInfo[] {
    return [...this.exports];
  }

  /**
   * Get all collected imports (for testing).
   */
  getImports(): ImportInfo[] {
    return [...this.imports];
  }

  /**
   * Get all container registrations (for testing).
   */
  getRegistrations(): RegistrationInfo[] {
    return [...this.registrations];
  }

  /**
   * Get all container resolutions (for testing).
   */
  getResolutions(): ResolutionInfo[] {
    return [...this.resolutions];
  }
}

/**
 * Create a default wiring audit config for a project.
 */
export function createDefaultConfig(projectRoot: string): WiringAuditConfig {
  return {
    rootDir: projectRoot,
    include: ['src/**/*.ts'],
    exclude: ['**/*.test.ts', '**/*.spec.ts', '**/*.d.ts'],
    entryPoints: ['src/cli/index.ts', 'src/gui/server.ts', 'src/index.ts'],
    containerFile: 'src/core/container.ts',
    allowedOrphanPaths: ['src/types/'],
    ignoreSymbols: [],
  };
}
