import { z } from 'zod';
import { runGitCommand } from '../utils/terminal-controller.js';

/**
 * Tool: git-revert
 * 
 * DESCRIÇÃO:
 * Gerenciamento de revert Git (GitHub + Gitea) com múltiplas ações
 * 
 * FUNCIONALIDADES:
 * - Reverter commit específico
 * - Reverter merge commit
 * - Reverter range de commits
 * - Reverter com mensagem customizada
 * - Reverter sem commit automático
 * 
 * USO:
 * - Para desfazer commits de forma segura
 * - Para reverter mudanças em branches compartilhadas
 * - Para criar commits de reversão
 * - Para manter histórico limpo
 * 
 * RECOMENDAÇÕES:
 * - Use revert em vez de reset para branches compartilhadas
 * - Teste reversões em branches locais primeiro
 * - Documente motivos da reversão
 */

const GitRevertInputSchema = z.object({
  action: z.enum(['revert-commit', 'revert-merge', 'revert-range']),
  // owner: obtido automaticamente do provider,
  repo: z.string(),
  provider: z.enum(['gitea', 'github']).describe('Provider to use (gitea or github)'),
  projectPath: z.string().describe('Local project path for git operations'),
  
  // Para revert-commit
  commit_hash: z.string().optional(),
  message: z.string().optional(),
  no_commit: z.boolean().optional(),
  
  // Para revert-merge
  merge_commit_hash: z.string().optional(),
  mainline: z.number().optional(),
  
  // Para revert-range
  commit_range: z.string().optional(),
  strategy: z.enum(['ours', 'theirs']).optional(),
});

export type GitRevertInput = z.infer<typeof GitRevertInputSchema>;

const GitRevertResultSchema = z.object({
  success: z.boolean(),
  action: z.string(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional()
});

export type GitRevertResult = z.infer<typeof GitRevertResultSchema>;

export const gitRevertTool = {
  name: 'git-revert',
  description: 'tool: Gerencia operações Git revert para desfazer mudanças de forma segura\n──────────────\naction revert-commit: reverte commit específico\naction revert-commit requires: repo, commit_hash, message, no_commit, provider, projectPath\n───────────────\naction revert-merge: reverte merge commit\naction revert-merge requires: repo, merge_commit_hash, mainline, message, provider, projectPath\n───────────────\naction revert-range: reverte range de commits\naction revert-range requires: repo, commit_range, strategy, message, provider, projectPath',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['revert-commit', 'revert-merge', 'revert-range'],
        description: 'Action to perform on revert'
      },
      owner: { type: 'string', description: 'Repository owner' },
      repo: { type: 'string', description: 'Repository name' },
      provider: { type: 'string', enum: ['gitea', 'github'], description: 'Provider to use (gitea or github)' },
      projectPath: { type: 'string', description: 'Local project path for git operations' },
      commit_hash: { type: 'string', description: 'Commit hash to revert' },
      message: { type: 'string', description: 'Custom revert message' },
      no_commit: { type: 'boolean', description: 'Do not commit automatically' },
      merge_commit_hash: { type: 'string', description: 'Merge commit hash to revert' },
      mainline: { type: 'number', description: 'Mainline for merge revert' },
      commit_range: { type: 'string', description: 'Commit range to revert' },
      strategy: { type: 'string', enum: ['ours', 'theirs'], description: 'Revert strategy' }
    },
    required: ['action', 'repo', 'provider', 'projectPath']
  },

  async handler(input: GitRevertInput): Promise<GitRevertResult> {
    try {
      const validatedInput = GitRevertInputSchema.parse(input);
      
      switch (validatedInput.action) {
        case 'revert-commit':
          return await this.revertCommit(validatedInput);
        case 'revert-merge':
          return await this.revertMerge(validatedInput);
        case 'revert-range':
          return await this.revertRange(validatedInput);
        default:
          throw new Error(`Ação não suportada: ${validatedInput.action}`);
      }
    } catch (error) {
      return {
        success: false,
        action: input.action,
        message: 'Erro na operação de revert',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  async revertCommit(params: GitRevertInput): Promise<GitRevertResult> {
    try {
      if (!params.commit_hash) {
        throw new Error('commit_hash é obrigatório para revert-commit');
      }

      let gitCommand = `revert ${params.commit_hash}`;
      
      if (params.no_commit) {
        gitCommand += ' --no-commit';
      }
      
      if (params.message) {
        gitCommand += ` -m "${params.message}"`;
      }

      const result = await runGitCommand(
        gitCommand,
        params.projectPath,
        'Executando revert de commit'
      );

      if (result.exitCode !== 0) {
        throw new Error(`Falha no revert de commit: ${result.output}`);
      }

      return {
        success: true,
        action: 'revert-commit',
        message: `Commit ${params.commit_hash} revertido com sucesso`,
        data: {
          commit_hash: params.commit_hash,
          message: params.message,
          no_commit: params.no_commit,
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao executar revert de commit: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async revertMerge(params: GitRevertInput): Promise<GitRevertResult> {
    try {
      if (!params.merge_commit_hash) {
        throw new Error('merge_commit_hash é obrigatório para revert-merge');
      }

      if (!params.mainline) {
        throw new Error('mainline é obrigatório para revert de merge');
      }

      let gitCommand = `revert -m ${params.mainline} ${params.merge_commit_hash}`;
      
      if (params.message) {
        gitCommand += ` -m "${params.message}"`;
      }

      const result = await runGitCommand(
        gitCommand,
        params.projectPath,
        'Executando revert de merge'
      );

      if (result.exitCode !== 0) {
        throw new Error(`Falha no revert de merge: ${result.output}`);
      }

      return {
        success: true,
        action: 'revert-merge',
        message: `Merge commit ${params.merge_commit_hash} revertido com sucesso`,
        data: {
          merge_commit_hash: params.merge_commit_hash,
          mainline: params.mainline,
          message: params.message,
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao executar revert de merge: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async revertRange(params: GitRevertInput): Promise<GitRevertResult> {
    try {
      if (!params.commit_range) {
        throw new Error('commit_range é obrigatório para revert-range');
      }

      let gitCommand = `revert ${params.commit_range}`;
      
      if (params.strategy) {
        gitCommand += ` -X ${params.strategy}`;
      }
      
      if (params.message) {
        gitCommand += ` -m "${params.message}"`;
      }

      const result = await runGitCommand(
        gitCommand,
        params.projectPath,
        'Executando revert de range'
      );

      if (result.exitCode !== 0) {
        throw new Error(`Falha no revert de range: ${result.output}`);
      }

      return {
        success: true,
        action: 'revert-range',
        message: `Range ${params.commit_range} revertido com sucesso`,
        data: {
          commit_range: params.commit_range,
          strategy: params.strategy,
          message: params.message,
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao executar revert de range: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
};


