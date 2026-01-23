/**
 * Dead Code Detector
 * 
 * TypeScript compiler-based static analysis tool to detect:
 * - Orphan exports (exported but never imported)
 * - Unused classes (never instantiated)
 * - Unused functions (never called)
 * - Unused methods (never called, excluding interface implementations)
 * 
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T25 for implementation details.
 */

import * as ts from 'typescript';
import * as path from 'node:path';
import type {
  DeadCodeIssue,
  DeadCodeIssueType,
  DeadCodeReport,
  DeadCodeSummary,
  DeadCodeDetectorConfig,
} from './types.js';
import { DEFAULT_DEAD_CODE_CONFIG } from './types.js';

/**
 * Symbol usage tracking information.
 */
interface SymbolUsage {
  /** Symbol being tracked */
  symbol: ts.Symbol;
  /** All nodes where this symbol is referenced */
  references: ts.Node[];
  /** The declaration node */
  declaration?: ts.Node;
  /** Source file containing declaration */
  sourceFile?: ts.SourceFile;
}

/**
 * DeadCodeDetector uses the TypeScript compiler API to find
 * implemented-but-unused code in a codebase.
 */
export class DeadCodeDetector {
  private program: ts.Program | null = null;
  private checker: ts.TypeChecker | null = null;
  private symbolUsages: Map<string, SymbolUsage> = new Map();
  private readonly config: DeadCodeDetectorConfig;

  constructor(projectRoot: string, options?: Partial<DeadCodeDetectorConfig>) {
    this.config = {
      rootDir: projectRoot,
      ...DEFAULT_DEAD_CODE_CONFIG,
      ...options,
    };
  }

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
      throw new Error(
        `Error reading tsconfig.json: ${ts.flattenDiagnosticMessageText(
          configFile.error.messageText,
          '\n'
        )}`
      );
    }

    const parsedConfig = ts.parseJsonConfigFileContent(
      configFile.config,
      ts.sys,
      path.dirname(configPath)
    );

    this.program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options);
    this.checker = this.program.getTypeChecker();
  }

  /**
   * Run dead code detection and return a report.
   */
  async detect(): Promise<DeadCodeReport> {
    const startTime = Date.now();

    this.initialize();

    if (!this.program || !this.checker) {
      throw new Error('TypeScript program not initialized');
    }

    // Phase 1: Collect all symbol definitions and usages
    this.collectSymbolUsages();

    // Phase 2: Run all detection checks
    const issues: DeadCodeIssue[] = [];
    issues.push(...this.findOrphanExports());
    issues.push(...this.findUnusedClasses());
    issues.push(...this.findUnusedFunctions());
    
    if (this.config.checkMethods) {
      issues.push(...this.findUnusedMethods());
    }

    // Generate summary
    const summary = this.generateSummary(issues);
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
   * Collect all symbol definitions and usages from the codebase.
   */
  private collectSymbolUsages(): void {
    if (!this.program || !this.checker) return;

    for (const sourceFile of this.program.getSourceFiles()) {
      // Skip declaration files and node_modules
      if (sourceFile.isDeclarationFile) continue;
      if (sourceFile.fileName.includes('node_modules')) continue;

      // Skip test files if configured
      if (!this.config.includeTests && this.isTestFile(sourceFile.fileName)) {
        continue;
      }

      this.visitNode(sourceFile, sourceFile);
    }
  }

  /**
   * Visit a node to track symbol usages.
   */
  private visitNode(node: ts.Node, sourceFile: ts.SourceFile): void {
    if (!this.checker) return;

    // Track identifier usages
    if (ts.isIdentifier(node)) {
      const symbol = this.checker.getSymbolAtLocation(node);
      if (symbol) {
        const key = this.getSymbolKey(symbol);
        const existing = this.symbolUsages.get(key);
        if (existing) {
          existing.references.push(node);
        } else {
          this.symbolUsages.set(key, {
            symbol,
            references: [node],
          });
        }
      }
    }

    // Track declarations
    if (ts.isClassDeclaration(node) && node.name) {
      this.trackDeclaration(node.name, node, sourceFile);
    } else if (ts.isFunctionDeclaration(node) && node.name) {
      this.trackDeclaration(node.name, node, sourceFile);
    } else if (ts.isMethodDeclaration(node) && node.name && ts.isIdentifier(node.name)) {
      this.trackDeclaration(node.name, node, sourceFile);
    }

    ts.forEachChild(node, (child) => this.visitNode(child, sourceFile));
  }

  /**
   * Track a declaration node.
   */
  private trackDeclaration(
    nameNode: ts.Identifier,
    declarationNode: ts.Node,
    sourceFile: ts.SourceFile
  ): void {
    if (!this.checker) return;

    const symbol = this.checker.getSymbolAtLocation(nameNode);
    if (symbol) {
      const key = this.getSymbolKey(symbol);
      const existing = this.symbolUsages.get(key);
      if (existing) {
        existing.declaration = declarationNode;
        existing.sourceFile = sourceFile;
      } else {
        this.symbolUsages.set(key, {
          symbol,
          references: [nameNode],
          declaration: declarationNode,
          sourceFile,
        });
      }
    }
  }

  /**
   * Get a unique key for a symbol.
   */
  private getSymbolKey(symbol: ts.Symbol): string {
    const declarations = symbol.declarations;
    if (declarations && declarations.length > 0) {
      const decl = declarations[0];
      const sourceFile = decl.getSourceFile();
      const pos = decl.getStart();
      return `${sourceFile.fileName}:${pos}:${symbol.name}`;
    }
    return symbol.name;
  }

  /**
   * Find orphan exports (exported but never imported).
   */
  private findOrphanExports(): DeadCodeIssue[] {
    const issues: DeadCodeIssue[] = [];
    if (!this.program || !this.checker) return issues;

    for (const sourceFile of this.program.getSourceFiles()) {
      if (sourceFile.isDeclarationFile) continue;
      if (sourceFile.fileName.includes('node_modules')) continue;
      if (!this.config.includeTests && this.isTestFile(sourceFile.fileName)) continue;

      const relativePath = this.getRelativePath(sourceFile.fileName);

      // Skip entry points
      if (this.isEntryPoint(relativePath)) continue;

      // Skip configured skip paths
      if (this.shouldSkipPath(relativePath)) continue;

      // Get module exports
      const moduleSymbol = this.checker.getSymbolAtLocation(sourceFile);
      if (!moduleSymbol) continue;

      const exports = this.checker.getExportsOfModule(moduleSymbol);

      for (const exp of exports) {
        // Skip ignored symbols
        if (this.config.ignoreSymbols.includes(exp.name)) continue;

        // Count external usages (usages from other files)
        const key = this.getSymbolKey(exp);
        const usage = this.symbolUsages.get(key);
        const references = usage?.references ?? [];

        // Filter to get usages from OTHER files only
        const externalUsages = references.filter((ref) => {
          const refFile = ref.getSourceFile();
          return refFile !== sourceFile;
        });

        if (externalUsages.length === 0) {
          const declaration = exp.declarations?.[0];
          if (declaration) {
            const line = sourceFile.getLineAndCharacterOfPosition(
              declaration.getStart()
            ).line + 1;

            issues.push({
              type: 'orphan_export',
              severity: 'warning',
              file: relativePath,
              line,
              symbol: exp.name,
              description: `Exported '${exp.name}' is never imported by other files`,
              linesOfCode: this.countLines(declaration),
            });
          }
        }
      }
    }

    return issues;
  }

  /**
   * Find unused classes (never instantiated).
   */
  private findUnusedClasses(): DeadCodeIssue[] {
    const issues: DeadCodeIssue[] = [];
    if (!this.program || !this.checker) return issues;

    for (const sourceFile of this.program.getSourceFiles()) {
      if (sourceFile.isDeclarationFile) continue;
      if (sourceFile.fileName.includes('node_modules')) continue;
      if (!this.config.includeTests && this.isTestFile(sourceFile.fileName)) continue;

      const relativePath = this.getRelativePath(sourceFile.fileName);

      // Skip configured skip paths
      if (this.shouldSkipPath(relativePath)) continue;

      ts.forEachChild(sourceFile, (node) => {
        if (ts.isClassDeclaration(node) && node.name) {
          const className = node.name.text;

          // Skip ignored symbols
          if (this.config.ignoreSymbols.includes(className)) return;

          // Check if class is instantiated anywhere
          const isInstantiated = this.isClassInstantiated(node, sourceFile);

          // Check if class is extended (used as base class)
          const isExtended = this.isClassExtended(className);

          // Check if class is used in type annotations only
          const isExportedAndUsed = this.isExported(node) && 
            this.isEntryPoint(relativePath);

          if (!isInstantiated && !isExtended && !isExportedAndUsed) {
            const line = sourceFile.getLineAndCharacterOfPosition(
              node.getStart()
            ).line + 1;

            issues.push({
              type: 'unused_class',
              severity: 'warning',
              file: relativePath,
              line,
              symbol: className,
              description: `Class '${className}' is never instantiated or extended`,
              linesOfCode: this.countLines(node),
            });
          }
        }
      });
    }

    return issues;
  }

  /**
   * Check if a class is instantiated anywhere.
   */
  private isClassInstantiated(
    classNode: ts.ClassDeclaration,
    _declaringFile: ts.SourceFile
  ): boolean {
    if (!this.program || !this.checker || !classNode.name) return true;

    const className = classNode.name.text;

    // Search through all source files for `new ClassName(`
    for (const sourceFile of this.program.getSourceFiles()) {
      if (sourceFile.isDeclarationFile) continue;
      if (sourceFile.fileName.includes('node_modules')) continue;

      const found = this.findInNode(sourceFile, (node) => {
        if (ts.isNewExpression(node)) {
          const expr = node.expression;
          if (ts.isIdentifier(expr) && expr.text === className) {
            return true;
          }
        }
        return false;
      });

      if (found) return true;
    }

    return false;
  }

  /**
   * Check if a class is extended by another class.
   */
  private isClassExtended(className: string): boolean {
    if (!this.program) return false;

    for (const sourceFile of this.program.getSourceFiles()) {
      if (sourceFile.isDeclarationFile) continue;
      if (sourceFile.fileName.includes('node_modules')) continue;

      const found = this.findInNode(sourceFile, (node) => {
        if (ts.isClassDeclaration(node) && node.heritageClauses) {
          for (const heritage of node.heritageClauses) {
            if (heritage.token === ts.SyntaxKind.ExtendsKeyword) {
              for (const type of heritage.types) {
                if (ts.isIdentifier(type.expression) && 
                    type.expression.text === className) {
                  return true;
                }
              }
            }
          }
        }
        return false;
      });

      if (found) return true;
    }

    return false;
  }

  /**
   * Find unused functions (never called).
   */
  private findUnusedFunctions(): DeadCodeIssue[] {
    const issues: DeadCodeIssue[] = [];
    if (!this.program || !this.checker) return issues;

    for (const sourceFile of this.program.getSourceFiles()) {
      if (sourceFile.isDeclarationFile) continue;
      if (sourceFile.fileName.includes('node_modules')) continue;
      if (!this.config.includeTests && this.isTestFile(sourceFile.fileName)) continue;

      const relativePath = this.getRelativePath(sourceFile.fileName);

      // Skip configured skip paths
      if (this.shouldSkipPath(relativePath)) continue;

      ts.forEachChild(sourceFile, (node) => {
        if (ts.isFunctionDeclaration(node) && node.name) {
          const funcName = node.name.text;

          // Skip ignored symbols
          if (this.config.ignoreSymbols.includes(funcName)) return;

          // Skip exported functions from entry points
          if (this.isExported(node) && this.isEntryPoint(relativePath)) return;

          // Check if function is called anywhere
          const isCalled = this.isFunctionCalled(funcName, sourceFile);

          // If not called and not exported (or exported but never imported)
          if (!isCalled) {
            // For exported functions, check if they're imported elsewhere
            if (this.isExported(node)) {
              const isImported = this.isSymbolImported(funcName);
              if (isImported) return;
            }

            const line = sourceFile.getLineAndCharacterOfPosition(
              node.getStart()
            ).line + 1;

            issues.push({
              type: 'unused_function',
              severity: 'warning',
              file: relativePath,
              line,
              symbol: funcName,
              description: `Function '${funcName}' is never called`,
              linesOfCode: this.countLines(node),
            });
          }
        }
      });
    }

    return issues;
  }

  /**
   * Check if a function is called anywhere.
   */
  private isFunctionCalled(funcName: string, declaringFile: ts.SourceFile): boolean {
    if (!this.program) return true;

    for (const sourceFile of this.program.getSourceFiles()) {
      if (sourceFile.isDeclarationFile) continue;
      if (sourceFile.fileName.includes('node_modules')) continue;

      const found = this.findInNode(sourceFile, (node) => {
        // Check for direct call: funcName()
        if (ts.isCallExpression(node)) {
          const expr = node.expression;
          if (ts.isIdentifier(expr) && expr.text === funcName) {
            // Make sure it's not the declaration itself
            if (sourceFile !== declaringFile || 
                node.getStart() !== declaringFile.getStart()) {
              return true;
            }
          }
        }
        return false;
      });

      if (found) return true;
    }

    return false;
  }

  /**
   * Find unused methods (never called, excluding interface implementations).
   */
  private findUnusedMethods(): DeadCodeIssue[] {
    const issues: DeadCodeIssue[] = [];
    if (!this.program || !this.checker) return issues;

    for (const sourceFile of this.program.getSourceFiles()) {
      if (sourceFile.isDeclarationFile) continue;
      if (sourceFile.fileName.includes('node_modules')) continue;
      if (!this.config.includeTests && this.isTestFile(sourceFile.fileName)) continue;

      const relativePath = this.getRelativePath(sourceFile.fileName);

      // Skip configured skip paths
      if (this.shouldSkipPath(relativePath)) continue;

      this.visitForMethods(sourceFile, relativePath, issues);
    }

    return issues;
  }

  /**
   * Visit nodes to find unused methods.
   */
  private visitForMethods(
    node: ts.Node,
    relativePath: string,
    issues: DeadCodeIssue[]
  ): void {
    if (ts.isClassDeclaration(node)) {
      const className = node.name?.text;
      if (!className) return;

      // Check if class implements any interfaces
      const implementsInterface = this.classImplementsInterface(node);

      for (const member of node.members) {
        if (ts.isMethodDeclaration(member) && 
            member.name && 
            ts.isIdentifier(member.name)) {
          const methodName = member.name.text;

          // Skip constructor
          if (methodName === 'constructor') continue;

          // Skip ignored symbols
          if (this.config.ignoreSymbols.includes(methodName)) continue;

          // Skip private methods starting with _ (convention for internal methods)
          if (methodName.startsWith('_')) continue;

          // Skip if class implements interface (method might be required)
          if (implementsInterface) continue;

          // Skip static methods that might be called directly
          const isStatic = member.modifiers?.some(
            (m) => m.kind === ts.SyntaxKind.StaticKeyword
          );

          // Check if method is called
          const isCalled = this.isMethodCalled(className, methodName, isStatic ?? false);

          if (!isCalled) {
            const sourceFile = node.getSourceFile();
            const line = sourceFile.getLineAndCharacterOfPosition(
              member.getStart()
            ).line + 1;

            issues.push({
              type: 'unused_method',
              severity: 'warning',
              file: relativePath,
              line,
              symbol: methodName,
              description: `Method '${className}.${methodName}' is never called`,
              linesOfCode: this.countLines(member),
              parentClass: className,
            });
          }
        }
      }
    }

    ts.forEachChild(node, (child) => this.visitForMethods(child, relativePath, issues));
  }

  /**
   * Check if a class implements any interface.
   */
  private classImplementsInterface(node: ts.ClassDeclaration): boolean {
    if (!node.heritageClauses) return false;

    return node.heritageClauses.some(
      (hc) => hc.token === ts.SyntaxKind.ImplementsKeyword
    );
  }

  /**
   * Check if a method is called anywhere.
   */
  private isMethodCalled(
    className: string,
    methodName: string,
    isStatic: boolean
  ): boolean {
    if (!this.program) return true;

    for (const sourceFile of this.program.getSourceFiles()) {
      if (sourceFile.isDeclarationFile) continue;
      if (sourceFile.fileName.includes('node_modules')) continue;

      const found = this.findInNode(sourceFile, (node) => {
        // Check for: instance.methodName() or ClassName.methodName() for static
        if (ts.isCallExpression(node)) {
          const expr = node.expression;
          if (ts.isPropertyAccessExpression(expr)) {
            const propName = expr.name.text;
            if (propName === methodName) {
              // For static methods, check if called on class directly
              if (isStatic && ts.isIdentifier(expr.expression)) {
                if (expr.expression.text === className) {
                  return true;
                }
              } else {
                // For instance methods, any property access with method name counts
                return true;
              }
            }
          }
        }
        
        // Check for: this.methodName() inside the class
        if (ts.isCallExpression(node)) {
          const expr = node.expression;
          if (ts.isPropertyAccessExpression(expr)) {
            if (expr.expression.kind === ts.SyntaxKind.ThisKeyword) {
              if (expr.name.text === methodName) {
                return true;
              }
            }
          }
        }

        return false;
      });

      if (found) return true;
    }

    return false;
  }

  /**
   * Check if a symbol is imported by any other file.
   */
  private isSymbolImported(symbolName: string): boolean {
    if (!this.program) return false;

    for (const sourceFile of this.program.getSourceFiles()) {
      if (sourceFile.isDeclarationFile) continue;
      if (sourceFile.fileName.includes('node_modules')) continue;

      const found = this.findInNode(sourceFile, (node) => {
        if (ts.isImportDeclaration(node)) {
          const importClause = node.importClause;
          if (importClause?.namedBindings && 
              ts.isNamedImports(importClause.namedBindings)) {
            for (const element of importClause.namedBindings.elements) {
              const importedName = element.propertyName?.text ?? element.name.text;
              if (importedName === symbolName) {
                return true;
              }
            }
          }
        }
        return false;
      });

      if (found) return true;
    }

    return false;
  }

  /**
   * Search a node tree for a predicate match.
   */
  private findInNode(
    node: ts.Node,
    predicate: (node: ts.Node) => boolean
  ): boolean {
    if (predicate(node)) return true;

    let found = false;
    ts.forEachChild(node, (child) => {
      if (!found) {
        found = this.findInNode(child, predicate);
      }
    });

    return found;
  }

  /**
   * Count the lines of code for a node.
   */
  private countLines(node: ts.Node): number {
    const sourceFile = node.getSourceFile();
    const start = sourceFile.getLineAndCharacterOfPosition(node.getStart());
    const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd());
    return end.line - start.line + 1;
  }

  /**
   * Check if a node has the export modifier.
   */
  private isExported(node: ts.Node): boolean {
    const modifiers = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
    return modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false;
  }

  /**
   * Check if a file is an entry point.
   */
  private isEntryPoint(relativePath: string): boolean {
    return this.config.entryPoints.some((ep) => 
      relativePath.includes(ep) || relativePath === ep
    );
  }

  /**
   * Check if a path should be skipped.
   */
  private shouldSkipPath(relativePath: string): boolean {
    return this.config.skipPaths.some((sp) => relativePath.includes(sp));
  }

  /**
   * Check if a file is a test file.
   */
  private isTestFile(fileName: string): boolean {
    return (
      fileName.includes('.test.') ||
      fileName.includes('.spec.') ||
      fileName.includes('__tests__')
    );
  }

  /**
   * Get relative path from project root.
   */
  private getRelativePath(fileName: string): string {
    return path.relative(this.config.rootDir, fileName);
  }

  /**
   * Generate summary statistics from issues.
   */
  private generateSummary(issues: DeadCodeIssue[]): DeadCodeSummary {
    const totalDeadLines = issues.reduce((sum, i) => sum + i.linesOfCode, 0);

    const byType: Record<DeadCodeIssueType, number> = {
      orphan_export: 0,
      unused_class: 0,
      unused_function: 0,
      unused_method: 0,
      unreachable_code: 0,
      unused_parameter: 0,
    };

    for (const issue of issues) {
      byType[issue.type] += issue.linesOfCode;
    }

    const largestOrphans = [...issues]
      .sort((a, b) => b.linesOfCode - a.linesOfCode)
      .slice(0, 10);

    return {
      totalDeadLines,
      byType,
      largestOrphans,
      errorCount: issues.filter((i) => i.severity === 'error').length,
      warningCount: issues.filter((i) => i.severity === 'warning').length,
    };
  }

  /**
   * Get the configuration used by this detector.
   */
  getConfig(): DeadCodeDetectorConfig {
    return { ...this.config };
  }
}

/**
 * Create a DeadCodeDetector with default configuration.
 */
export function createDeadCodeDetector(
  projectRoot: string,
  options?: Partial<DeadCodeDetectorConfig>
): DeadCodeDetector {
  return new DeadCodeDetector(projectRoot, options);
}

/**
 * Run dead code detection and return a report.
 * Convenience function for one-shot detection.
 */
export async function detectDeadCode(
  projectRoot: string,
  options?: Partial<DeadCodeDetectorConfig>
): Promise<DeadCodeReport> {
  const detector = createDeadCodeDetector(projectRoot, options);
  return detector.detect();
}
