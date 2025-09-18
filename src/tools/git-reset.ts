import { z } from 'zod';
import { runGitCommand, runTerminalCmd } from '../utils/terminal-controller.js';

/**
 * Tool: git-reset
 * 
 * DESCRIÇÃO:
 * Gerenciamento de reset Git (GitHub + Gitea) com múltiplas ações
 * 
 * FUNCIONALIDADES:
 * - Reset soft (mantém mudanças no staging)
 * - Reset mixed (padrão, remove do staging)
 * - Reset hard (remove todas as mudanças)
 * - Reset para commit específico
 * - Reset de branch
 * 
 * USO:
 * - Para desfazer commits
 * - Para limpar staging area
 * - Para voltar a estado anterior
 * - Para remover mudanças não commitadas
 * 
 * RECOMENDAÇÕES:
 * - Use com cuidado, especialmente reset hard
 * - Faça backup antes de resets destrutivos
 * - Teste em branches locais primeiro
 */

const GitResetInputSchema = z.object({
  action: z.enum(['soft', 'mixed', 'hard', 'reset-to-commit', 'reset-branch']),
  // owner: obtido automaticamente do provider,
  repo: z.string(),
  provider: z.enum(['gitea', 'github']).describe('Provider to use (gitea or github)'),
  projectPath: z.string().describe('Local project path for git operations'),
  
  // Para reset
  commit_hash: z.string().optional(),
  branch_name: z.string().optional(),
  reset_type: z.enum(['soft', 'mixed', 'hard']).optional(),
  
  // Para reset-branch
  target_branch: z.string().optional(),
});

export type GitResetInput = z.infer<typeof GitResetInputSchema>;

const GitResetResultSchema = z.object({
  success: z.boolean(),
  action: z.string(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional()
});

export type GitResetResult = z.infer<typeof GitResetResultSchema>;

export const gitResetTool = {
  name: 'git-reset',
  description: 'tool: Gerencia operações Git reset para desfazer mudanças\n──────────────\naction soft: reset soft mantém mudanças no staging\naction soft requires: repo, commit_hash, provider, projectPath\n───────────────\naction mixed: reset mixed limpa staging area\naction mixed requires: repo, commit_hash, provider, projectPath\n───────────────\naction hard: reset hard remove todas as mudanças\naction hard requires: repo, commit_hash, provider, projectPath\n───────────────\naction reset-to-commit: reseta para commit específico\naction reset-to-commit requires: repo, commit_hash, reset_type, provider, projectPath\n───────────────\naction reset-branch: reseta branch específica\naction reset-branch requires: repo, branch_name, target_branch, provider, projectPath',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['soft', 'mixed', 'hard', 'reset-to-commit', 'reset-branch'],
        description: 'Action to perform on reset'
      },
      owner: { type: 'string', description: 'Repository owner' },
      repo: { type: 'string', description: 'Repository name' },
      provider: { type: 'string', enum: ['gitea', 'github'], description: 'Provider to use (gitea or github)' },
      projectPath: { type: 'string', description: 'Local project path for git operations' },
      commit_hash: { type: 'string', description: 'Commit hash to reset to' },
      branch_name: { type: 'string', description: 'Branch name for reset' },
      reset_type: { type: 'string', enum: ['soft', 'mixed', 'hard'], description: 'Type of reset' },
      target_branch: { type: 'string', description: 'Target branch for reset' }
    },
    required: ['action', 'repo', 'provider', 'projectPath']
  },

  async handler(input: GitResetInput): Promise<GitResetResult> {
    try {
      const validatedInput = GitResetInputSchema.parse(input);
      
      switch (validatedInput.action) {
        case 'soft':
          return await this.softReset(validatedInput);
        case 'mixed':
          return await this.mixedReset(validatedInput);
        case 'hard':
          return await this.hardReset(validatedInput);
        case 'reset-to-commit':
          return await this.resetToCommit(validatedInput);
        case 'reset-branch':
          return await this.resetBranch(validatedInput);
        default:
          throw new Error(`Ação não suportada: ${validatedInput.action}`);
      }
    } catch (error) {
      return {
        success: false,
        action: input.action,
        message: 'Erro na operação de reset',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  async softReset(params: GitResetInput): Promise<GitResetResult> {
    try {
      const target = params.commit_hash || params.branch_name || 'HEAD~1';
      
      const result = await runGitCommand(
        `reset --soft ${target}`,
        params.projectPath,
        'Executando reset soft'
      );

      if (result.exitCode !== 0) {
        throw new Error(`Falha no reset soft: ${result.output}`);
      }

      return {
        success: true,
        action: 'soft',
        message: `Reset soft executado com sucesso para ${target}`,
        data: {
          target,
          type: 'soft',
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao executar reset soft: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async mixedReset(params: GitResetInput): Promise<GitResetResult> {
    try {
      const target = params.commit_hash || params.branch_name || 'HEAD~1';
      
      const result = await runGitCommand(
        `reset --mixed ${target}`,
        params.projectPath,
        'Executando reset mixed'
      );

      if (result.exitCode !== 0) {
        throw new Error(`Falha no reset mixed: ${result.output}`);
      }

      return {
        success: true,
        action: 'mixed',
        message: `Reset mixed executado com sucesso para ${target}`,
        data: {
          target,
          type: 'mixed',
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao executar reset mixed: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async hardReset(params: GitResetInput): Promise<GitResetResult> {
    try {
      const target = params.commit_hash || params.branch_name || 'HEAD~1';
      
      const result = await runGitCommand(
        `reset --hard ${target}`,
        params.projectPath,
        'Executando reset hard'
      );

      if (result.exitCode !== 0) {
        throw new Error(`Falha no reset hard: ${result.output}`);
      }

      return {
        success: true,
        action: 'hard',
        message: `Reset hard executado com sucesso para ${target}`,
        data: {
          target,
          type: 'hard',
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao executar reset hard: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async resetToCommit(params: GitResetInput): Promise<GitResetResult> {
    try {
      if (!params.commit_hash) {
        throw new Error('commit_hash é obrigatório para reset-to-commit');
      }

      const resetType = params.reset_type || 'mixed';
      
      const result = await runTerminalCmd({
        command: `cd "${params.projectPath}" && git reset --${resetType} ${params.commit_hash}`,
        is_background: false,
        explanation: `Executando reset ${resetType} para commit`
      });

      if (result.exitCode !== 0) {
        throw new Error(`Falha no reset para commit: ${result.output}`);
      }

      return {
        success: true,
        action: 'reset-to-commit',
        message: `Reset ${resetType} executado com sucesso para commit ${params.commit_hash}`,
        data: {
          commit_hash: params.commit_hash,
          type: resetType,
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao executar reset para commit: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async resetBranch(params: GitResetInput): Promise<GitResetResult> {
    try {
      if (!params.target_branch) {
        throw new Error('target_branch é obrigatório para reset-branch');
      }

      const resetType = params.reset_type || 'mixed';
      
      const result = await runTerminalCmd({
        command: `cd "${params.projectPath}" && git reset --${resetType} ${params.target_branch}`,
        is_background: false,
        explanation: `Executando reset ${resetType} para branch`
      });

      if (result.exitCode !== 0) {
        throw new Error(`Falha no reset para branch: ${result.output}`);
      }

      return {
        success: true,
        action: 'reset-branch',
        message: `Reset ${resetType} executado com sucesso para branch ${params.target_branch}`,
        data: {
          target_branch: params.target_branch,
          type: resetType,
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao executar reset para branch: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
};
