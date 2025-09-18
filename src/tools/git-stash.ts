import { z } from 'zod';
import { runGitCommand } from '../utils/terminal-controller.js';

/**
 * Tool: git-stash
 * 
 * DESCRIÇÃO:
 * Gerenciamento de stash Git (GitHub + Gitea) com múltiplas ações
 * 
 * FUNCIONALIDADES:
 * - Stash mudanças
 * - Listar stashes
 * - Aplicar stash
 * - Pop stash
 * - Mostrar stash
 * - Deletar stash
 * - Limpar todos os stashes
 * 
 * USO:
 * - Para salvar mudanças temporariamente
 * - Para trocar de branch rapidamente
 * - Para limpar working directory
 * - Para aplicar mudanças posteriormente
 * 
 * RECOMENDAÇÕES:
 * - Use mensagens descritivas para stashes
 * - Aplique stashes em ordem
 * - Limpe stashes antigos regularmente
 */

const GitStashInputSchema = z.object({
  action: z.enum(['stash', 'pop', 'apply', 'list', 'show', 'drop', 'clear']),
  // owner: obtido automaticamente do provider,
  repo: z.string(),
  provider: z.enum(['gitea', 'github']).describe('Provider to use (gitea or github)'),
  projectPath: z.string().describe('Local project path for git operations'),
  
  // Para stash
  message: z.string().optional(),
  include_untracked: z.boolean().optional(),
  keep_index: z.boolean().optional(),
  
  // Para pop/apply/show/drop
  stash_index: z.string().optional(),
  
  // Para show
  show_patch: z.boolean().optional(),
});

export type GitStashInput = z.infer<typeof GitStashInputSchema>;

const GitStashResultSchema = z.object({
  success: z.boolean(),
  action: z.string(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional()
});

export type GitStashResult = z.infer<typeof GitStashResultSchema>;

export const gitStashTool = {
  name: 'git-stash',
  description: 'tool: Gerencia operações Git stash para salvar mudanças temporariamente\n──────────────\naction stash: salva mudanças no stash\naction stash requires: repo, message, include_untracked, keep_index, provider, projectPath\n───────────────\naction pop: aplica e remove stash do topo\naction pop requires: repo, stash_index, provider, projectPath\n───────────────\naction apply: aplica stash sem remover\naction apply requires: repo, stash_index, provider, projectPath\n───────────────\naction list: lista stashes disponíveis\naction list requires: repo, provider, projectPath\n───────────────\naction show: mostra detalhes do stash\naction show requires: repo, stash_index, show_patch, provider, projectPath\n───────────────\naction drop: remove stash específico\naction drop requires: repo, stash_index, provider, projectPath\n───────────────\naction clear: remove todos os stashes\naction clear requires: repo, provider, projectPath',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['stash', 'pop', 'apply', 'list', 'show', 'drop', 'clear'],
        description: 'Action to perform on stash'
      },
      owner: { type: 'string', description: 'Repository owner' },
      repo: { type: 'string', description: 'Repository name' },
      provider: { type: 'string', enum: ['gitea', 'github'], description: 'Provider to use (gitea or github)' },
      projectPath: { type: 'string', description: 'Local project path for git operations' },
      message: { type: 'string', description: 'Stash message' },
      include_untracked: { type: 'boolean', description: 'Include untracked files' },
      keep_index: { type: 'boolean', description: 'Keep changes in index' },
      stash_index: { type: 'string', description: 'Stash index to operate on' },
      show_patch: { type: 'boolean', description: 'Show patch in stash show' }
    },
    required: ['action', 'repo', 'provider', 'projectPath']
  },

  async handler(input: GitStashInput): Promise<GitStashResult> {
    try {
      const validatedInput = GitStashInputSchema.parse(input);
      
      switch (validatedInput.action) {
        case 'stash':
          return await this.stash(validatedInput);
        case 'pop':
          return await this.pop(validatedInput);
        case 'apply':
          return await this.apply(validatedInput);
        case 'list':
          return await this.list(validatedInput);
        case 'show':
          return await this.show(validatedInput);
        case 'drop':
          return await this.drop(validatedInput);
        case 'clear':
          return await this.clear(validatedInput);
        default:
          throw new Error(`Ação não suportada: ${validatedInput.action}`);
      }
    } catch (error) {
      return {
        success: false,
        action: input.action,
        message: 'Erro na operação de stash',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  async stash(params: GitStashInput): Promise<GitStashResult> {
    try {
      let gitCommand = 'stash';
      
      if (params.message) {
        gitCommand += ` push -m "${params.message}"`;
      }
      
      if (params.include_untracked) {
        gitCommand += ' -u';
      }
      
      if (params.keep_index) {
        gitCommand += ' --keep-index';
      }

      const result = await runGitCommand(
        gitCommand,
        params.projectPath,
        'Executando stash'
      );

      if (result.exitCode !== 0) {
        throw new Error(`Falha no stash: ${result.output}`);
      }

      return {
        success: true,
        action: 'stash',
        message: 'Mudanças salvas no stash com sucesso',
        data: {
          message: params.message,
          include_untracked: params.include_untracked,
          keep_index: params.keep_index,
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao executar stash: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async pop(params: GitStashInput): Promise<GitStashResult> {
    try {
      const stashIndex = params.stash_index || 'stash@{0}';
      
      const result = await runGitCommand(
        `stash pop ${stashIndex}`,
        params.projectPath,
        'Executando stash pop'
      );

      if (result.exitCode !== 0) {
        throw new Error(`Falha no stash pop: ${result.output}`);
      }

      return {
        success: true,
        action: 'pop',
        message: `Stash ${stashIndex} aplicado e removido com sucesso`,
        data: {
          stash_index: stashIndex,
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao executar stash pop: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async apply(params: GitStashInput): Promise<GitStashResult> {
    try {
      const stashIndex = params.stash_index || 'stash@{0}';
      
      const result = await runGitCommand(
        `stash apply ${stashIndex}`,
        params.projectPath,
        'Executando stash apply'
      );

      if (result.exitCode !== 0) {
        throw new Error(`Falha no stash apply: ${result.output}`);
      }

      return {
        success: true,
        action: 'apply',
        message: `Stash ${stashIndex} aplicado com sucesso`,
        data: {
          stash_index: stashIndex,
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao executar stash apply: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async list(params: GitStashInput): Promise<GitStashResult> {
    try {
      const result = await runGitCommand(
        `stash list`,
        params.projectPath,
        'Listando stashes'
      );

      if (result.exitCode !== 0) {
        throw new Error(`Falha ao listar stashes: ${result.output}`);
      }

      return {
        success: true,
        action: 'list',
        message: 'Lista de stashes obtida com sucesso',
        data: {
          stashes: result.output.split('\n').filter((line: string) => line.trim()),
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao listar stashes: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async show(params: GitStashInput): Promise<GitStashResult> {
    try {
      const stashIndex = params.stash_index || 'stash@{0}';
      let gitCommand = `stash show ${stashIndex}`;
      
      if (params.show_patch) {
        gitCommand += ' -p';
      }

      const result = await runGitCommand(
        gitCommand,
        params.projectPath,
        'Mostrando stash'
      );

      if (result.exitCode !== 0) {
        throw new Error(`Falha ao mostrar stash: ${result.output}`);
      }

      return {
        success: true,
        action: 'show',
        message: `Stash ${stashIndex} mostrado com sucesso`,
        data: {
          stash_index: stashIndex,
          show_patch: params.show_patch,
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao mostrar stash: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async drop(params: GitStashInput): Promise<GitStashResult> {
    try {
      const stashIndex = params.stash_index || 'stash@{0}';
      
      const result = await runGitCommand(
        `stash drop ${stashIndex}`,
        params.projectPath,
        'Removendo stash'
      );

      if (result.exitCode !== 0) {
        throw new Error(`Falha ao remover stash: ${result.output}`);
      }

      return {
        success: true,
        action: 'drop',
        message: `Stash ${stashIndex} removido com sucesso`,
        data: {
          stash_index: stashIndex,
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao remover stash: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async clear(params: GitStashInput): Promise<GitStashResult> {
    try {
      const result = await runGitCommand(
        `stash clear`,
        params.projectPath,
        'Limpando todos os stashes'
      );

      if (result.exitCode !== 0) {
        throw new Error(`Falha ao limpar stashes: ${result.output}`);
      }

      return {
        success: true,
        action: 'clear',
        message: 'Todos os stashes foram removidos com sucesso',
        data: {
          cleared: true,
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao limpar stashes: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
};
