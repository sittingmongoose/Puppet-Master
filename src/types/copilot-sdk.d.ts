/**
 * Type declarations for @github/copilot-sdk
 *
 * This is a stub module declaration for TypeScript compilation.
 * The actual SDK package is not yet publicly available on npm.
 * The code uses dynamic imports that gracefully handle missing modules at runtime.
 *
 * @see src/platforms/copilot-sdk-runner.ts - Uses SDK for Copilot execution
 * @see src/doctor/checks/cli-tools.ts - Health check for SDK availability
 */
declare module '@github/copilot-sdk' {
  export interface SessionConfig {
    model?: string;
    tools?: Array<{
      name: string;
      description: string;
      parameters?: Record<string, unknown>;
      handler: (params: Record<string, unknown>) => Promise<unknown>;
    }>;
  }

  export interface CopilotSession {
    send(options: { prompt: string }): Promise<CopilotResponse>;
    export?(): Promise<unknown>;
    destroy(): Promise<void>;
  }

  export interface CopilotResponse {
    status: 'completed' | 'error' | 'tool_use';
    content: string;
    tokensUsed?: number;
    toolCalls?: Array<{ name: string; result: unknown }>;
  }

  export class CopilotClient {
    constructor();
    start(): Promise<void>;
    stop(): Promise<void>;
    getStatus(): Promise<{ version: string; cliVersion?: string }>;
    getAuthStatus(): Promise<{ authenticated: boolean; authType?: string }>;
    listModels(): Promise<string[]>;
    createSession(config: SessionConfig): Promise<CopilotSession>;
    resumeSession?(state: unknown): Promise<CopilotSession>;
  }
}
