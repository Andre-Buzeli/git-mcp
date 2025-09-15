import { z } from 'zod';
import { runGitCommand } from '../utils/terminal-controller.js';

/**
 * Tool: git-rebase
 * 
 * DESCRIÇÃO:
 * Gerenciamento de rebase Git (GitHub + Gitea) com múltiplas ações
 * 
 * FUNCIONALIDADES:
 * - Rebase interativo
 * - Rebase simples
 * - Abortar rebase
 * - Continuar rebase
 * - Pular commit
 * - Rebase de branch
 * 
 * USO:
 * - Para reescrever histórico de commits
 * - Para limpar commits antes do merge
 * - Para reorganizar commits
 * - Para resolver conflitos
 * 
 * RECOMENDAÇÕES:
 * - Use com cuidado em branches compartilhadas
 * - Faça backup antes de rebases complexos
 * - Teste em branches locais primeiro
 */

const GitRebaseInputSchema = z.object({
  action: z.enum(['rebase', 'interactive-rebase', 'abort', 'continue', 'skip']),
  owner: z.string(),
  repo: z.string(),
  provider: z.enum(['gitea', 'github']).describe('Provider to use (gitea or github)'),
  projectPath: z.string().describe('Local project path for git operations'),
  
  // Para rebase
  target_branch: z.string().optional(),
  base_branch: z.string().optional(),
  interactive: z.boolean().optional(),
  
  // Para interactive-rebase
  commit_range: z.string().optional(),
  rebase_commands: z.string().optional(),
});

export type GitRebaseInput = z.infer<typeof GitRebaseInputSchema>;

const GitRebaseResultSchema = z.object({
  success: z.boolean(),
  action: z.string(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional()
});

export type GitRebaseResult = z.infer<typeof GitRebaseResultSchema>;

export const gitRebaseTool = {
  name: 'git-rebase',
  description: 'Manage Git rebase operations (GitHub + Gitea) with multiple actions: rebase, interactive-rebase, abort, continue, skip. Suporte completo a GitHub e Gitea simultaneamente. Boas práticas (solo): use para reescrever histórico, limpar commits antes do merge, reorganizar commits; faça backup antes de rebases complexos, teste em branches locais primeiro.',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['rebase', 'interactive-rebase', 'abort', 'continue', 'skip'],
        description: 'Action to perform on rebase'
      },
      owner: { type: 'string', description: 'Repository owner' },
      repo: { type: 'string', description: 'Repository name' },
      provider: { type: 'string', enum: ['gitea', 'github'], description: 'Provider to use (gitea or github)' },
      projectPath: { type: 'string', description: 'Local project path for git operations' },
      target_branch: { type: 'string', description: 'Target branch for rebase' },
      base_branch: { type: 'string', description: 'Base branch for rebase' },
      interactive: { type: 'boolean', description: 'Interactive rebase' },
      commit_range: { type: 'string', description: 'Commit range for interactive rebase' },
      rebase_commands: { type: 'string', description: 'Rebase commands for interactive mode' }
    },
    required: ['action', 'owner', 'repo', 'provider', 'projectPath']
  },

  async handler(input: GitRebaseInput): Promise<GitRebaseResult> {
    try {
      const validatedInput = GitRebaseInputSchema.parse(input);
      
      switch (validatedInput.action) {
        case 'rebase':
          return await this.rebase(validatedInput);
        case 'interactive-rebase':
          return await this.interactiveRebase(validatedInput);
        case 'abort':
          return await this.abortRebase(validatedInput);
        case 'continue':
          return await this.continueRebase(validatedInput);
        case 'skip':
          return await this.skipCommit(validatedInput);
        default:
          throw new Error(`Ação não suportada: ${validatedInput.action}`);
      }
    } catch (error) {
      return {
        success: false,
        action: input.action,
        message: 'Erro na operação de rebase',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  async rebase(params: GitRebaseInput): Promise<GitRebaseResult> {
    try {
      if (!params.target_branch) {
        throw new Error('target_branch é obrigatório para rebase');
      }

      const gitCommand = params.interactive 
        ? `cd "${params.projectPath}" && git rebase -i ${params.target_branch}`
        : `cd "${params.projectPath}" && git rebase ${params.target_branch}`;

      const result = await runGitCommand(
        gitCommand,
        params.projectPath,
        'Executando rebase'
      );

      if (result.exitCode !== 0) {
        throw new Error(`Falha no rebase: ${result.output}`);
      }

      return {
        success: true,
        action: 'rebase',
        message: `Rebase executado com sucesso na branch ${params.target_branch}`,
        data: {
          target_branch: params.target_branch,
          interactive: params.interactive,
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao executar rebase: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async interactiveRebase(params: GitRebaseInput): Promise<GitRebaseResult> {
    try {
      if (!params.commit_range) {
        throw new Error('commit_range é obrigatório para rebase interativo');
      }

      const gitCommand = `rebase -i ${params.commit_range}`;
      
      const result = await runGitCommand(
        gitCommand,
        params.projectPath,
        'Executando rebase interativo'
      );

      if (result.exitCode !== 0) {
        throw new Error(`Falha no rebase interativo: ${result.output}`);
      }

      return {
        success: true,
        action: 'interactive-rebase',
        message: `Rebase interativo executado com sucesso no range ${params.commit_range}`,
        data: {
          commit_range: params.commit_range,
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao executar rebase interativo: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async abortRebase(params: GitRebaseInput): Promise<GitRebaseResult> {
    try {
      const result = await runGitCommand(
        `rebase --abort`,
        params.projectPath,
        'Abortando rebase'
      );

      if (result.exitCode !== 0) {
        throw new Error(`Falha ao abortar rebase: ${result.output}`);
      }

      return {
        success: true,
        action: 'abort',
        message: 'Rebase abortado com sucesso',
        data: {
          aborted: true,
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao abortar rebase: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async continueRebase(params: GitRebaseInput): Promise<GitRebaseResult> {
    try {
      const result = await runGitCommand(
        `rebase --continue`,
        params.projectPath,
        'Continuando rebase'
      );

      if (result.exitCode !== 0) {
        throw new Error(`Falha ao continuar rebase: ${result.output}`);
      }

      return {
        success: true,
        action: 'continue',
        message: 'Rebase continuado com sucesso',
        data: {
          continued: true,
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao continuar rebase: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async skipCommit(params: GitRebaseInput): Promise<GitRebaseResult> {
    try {
      const result = await runGitCommand(
        `rebase --skip`,
        params.projectPath,
        'Pulando commit no rebase'
      );

      if (result.exitCode !== 0) {
        throw new Error(`Falha ao pular commit: ${result.output}`);
      }

      return {
        success: true,
        action: 'skip',
        message: 'Commit pulado com sucesso',
        data: {
          skipped: true,
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao pular commit: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
};
