import { z } from 'zod';
import { runGitCommand } from '../utils/terminal-controller.js';

/**
 * Tool: git-worktree
 * 
 * DESCRIÇÃO:
 * Gerenciamento de worktrees Git (GitHub + Gitea) com múltiplas ações
 * 
 * FUNCIONALIDADES:
 * - Adicionar worktree
 * - Remover worktree
 * - Listar worktrees
 * - Prune worktrees
 * - Mover worktree
 * - Reparar worktree
 * 
 * USO:
 * - Para trabalhar em múltiplas branches simultaneamente
 * - Para testes em branches diferentes
 * - Para desenvolvimento paralelo
 * - Para builds em branches específicas
 * 
 * RECOMENDAÇÕES:
 * - Use para branches de longa duração
 * - Mantenha worktrees organizados
 * - Limpe worktrees antigos
 */

const GitWorktreeInputSchema = z.object({
  action: z.enum(['add', 'remove', 'list', 'prune', 'move', 'repair']),
  owner: z.string(),
  repo: z.string(),
  provider: z.enum(['gitea', 'github']).describe('Provider to use (gitea or github)'),
  projectPath: z.string().describe('Local project path for git operations'),
  
  // Para add
  worktree_path: z.string().optional(),
  branch_name: z.string().optional(),
  commit_hash: z.string().optional(),
  
  // Para remove
  worktree_to_remove: z.string().optional(),
  force: z.boolean().optional(),
  
  // Para move
  old_path: z.string().optional(),
  new_path: z.string().optional(),
  
  // Para repair
  worktree_to_repair: z.string().optional(),
});

export type GitWorktreeInput = z.infer<typeof GitWorktreeInputSchema>;

const GitWorktreeResultSchema = z.object({
  success: z.boolean(),
  action: z.string(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional()
});

export type GitWorktreeResult = z.infer<typeof GitWorktreeResultSchema>;

export const gitWorktreeTool = {
  name: 'git-worktree',
  description: 'Manage Git worktrees (GitHub + Gitea) with multiple actions: add, remove, list, prune, move, repair. Suporte completo a GitHub e Gitea simultaneamente. Boas práticas (solo): use para trabalhar em múltiplas branches simultaneamente, testes em branches diferentes, desenvolvimento paralelo; use para branches de longa duração, mantenha worktrees organizados.',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['add', 'remove', 'list', 'prune', 'move', 'repair'],
        description: 'Action to perform on worktrees'
      },
      owner: { type: 'string', description: 'Repository owner' },
      repo: { type: 'string', description: 'Repository name' },
      provider: { type: 'string', enum: ['gitea', 'github'], description: 'Provider to use (gitea or github)' },
      projectPath: { type: 'string', description: 'Local project path for git operations' },
      worktree_path: { type: 'string', description: 'Worktree path' },
      branch_name: { type: 'string', description: 'Branch name' },
      commit_hash: { type: 'string', description: 'Commit hash' },
      worktree_to_remove: { type: 'string', description: 'Worktree to remove' },
      force: { type: 'boolean', description: 'Force operation' },
      old_path: { type: 'string', description: 'Old worktree path' },
      new_path: { type: 'string', description: 'New worktree path' },
      worktree_to_repair: { type: 'string', description: 'Worktree to repair' }
    },
    required: ['action', 'owner', 'repo', 'provider', 'projectPath']
  },

  async handler(input: GitWorktreeInput): Promise<GitWorktreeResult> {
    try {
      const validatedInput = GitWorktreeInputSchema.parse(input);
      
      switch (validatedInput.action) {
        case 'add':
          return await this.add(validatedInput);
        case 'remove':
          return await this.remove(validatedInput);
        case 'list':
          return await this.list(validatedInput);
        case 'prune':
          return await this.prune(validatedInput);
        case 'move':
          return await this.move(validatedInput);
        case 'repair':
          return await this.repair(validatedInput);
        default:
          throw new Error(`Ação não suportada: ${validatedInput.action}`);
      }
    } catch (error) {
      return {
        success: false,
        action: input.action,
        message: 'Erro na operação de worktree',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  async add(params: GitWorktreeInput): Promise<GitWorktreeResult> {
    try {
      if (!params.worktree_path) {
        throw new Error('worktree_path é obrigatório para add');
      }

      let gitCommand = `worktree add ${params.worktree_path}`;
      
      if (params.branch_name) {
        gitCommand += ` -b ${params.branch_name}`;
      } else if (params.commit_hash) {
        gitCommand += ` ${params.commit_hash}`;
      }

      const result = await runGitCommand(
        gitCommand,
        params.projectPath,
        'Adicionando worktree'
      );

      if (result.exitCode !== 0) {
        throw new Error(`Falha ao adicionar worktree: ${result.output}`);
      }

      return {
        success: true,
        action: 'add',
        message: `Worktree adicionado com sucesso em ${params.worktree_path}`,
        data: {
          worktree_path: params.worktree_path,
          branch_name: params.branch_name,
          commit_hash: params.commit_hash,
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao adicionar worktree: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async remove(params: GitWorktreeInput): Promise<GitWorktreeResult> {
    try {
      if (!params.worktree_to_remove) {
        throw new Error('worktree_to_remove é obrigatório para remove');
      }

      let gitCommand = `worktree remove ${params.worktree_to_remove}`;
      
      if (params.force) {
        gitCommand += ' --force';
      }

      const result = await runGitCommand(
        gitCommand,
        params.projectPath,
        'Removendo worktree'
      );

      if (result.exitCode !== 0) {
        throw new Error(`Falha ao remover worktree: ${result.output}`);
      }

      return {
        success: true,
        action: 'remove',
        message: `Worktree removido com sucesso: ${params.worktree_to_remove}`,
        data: {
          worktree_to_remove: params.worktree_to_remove,
          force: params.force,
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao remover worktree: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async list(params: GitWorktreeInput): Promise<GitWorktreeResult> {
    try {
      const result = await runGitCommand(
        `worktree list`,
        params.projectPath,
        'Listando worktrees'
      );

      if (result.exitCode !== 0) {
        throw new Error(`Falha ao listar worktrees: ${result.output}`);
      }

      const worktrees = result.output.split('\n')
        .filter((line: string) => line.trim())
        .map((line: string) => {
          const parts = line.trim().split(' ');
          return {
            path: parts[0],
            commit: parts[1],
            branch: parts[2] || 'detached'
          };
        });

      return {
        success: true,
        action: 'list',
        message: 'Worktrees listados com sucesso',
        data: {
          worktrees,
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao listar worktrees: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async prune(params: GitWorktreeInput): Promise<GitWorktreeResult> {
    try {
      const result = await runGitCommand(
        `worktree prune`,
        params.projectPath,
        'Prunando worktrees'
      );

      if (result.exitCode !== 0) {
        throw new Error(`Falha ao prunar worktrees: ${result.output}`);
      }

      return {
        success: true,
        action: 'prune',
        message: 'Worktrees prunados com sucesso',
        data: {
          pruned: true,
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao prunar worktrees: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async move(params: GitWorktreeInput): Promise<GitWorktreeResult> {
    try {
      if (!params.old_path || !params.new_path) {
        throw new Error('old_path e new_path são obrigatórios para move');
      }

      const result = await runGitCommand(
        `worktree move ${params.old_path} ${params.new_path}`,
        params.projectPath,
        'Movendo worktree'
      );

      if (result.exitCode !== 0) {
        throw new Error(`Falha ao mover worktree: ${result.output}`);
      }

      return {
        success: true,
        action: 'move',
        message: `Worktree movido de ${params.old_path} para ${params.new_path}`,
        data: {
          old_path: params.old_path,
          new_path: params.new_path,
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao mover worktree: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async repair(params: GitWorktreeInput): Promise<GitWorktreeResult> {
    try {
      if (!params.worktree_to_repair) {
        throw new Error('worktree_to_repair é obrigatório para repair');
      }

      const result = await runGitCommand(
        `worktree repair ${params.worktree_to_repair}`,
        params.projectPath,
        'Reparando worktree'
      );

      if (result.exitCode !== 0) {
        throw new Error(`Falha ao reparar worktree: ${result.output}`);
      }

      return {
        success: true,
        action: 'repair',
        message: `Worktree reparado com sucesso: ${params.worktree_to_repair}`,
        data: {
          worktree_to_repair: params.worktree_to_repair,
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao reparar worktree: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
};
