import { z } from 'zod';
import { runGitCommand } from '../utils/terminal-controller.js';
import { ErrorHandler } from '../providers/error-handler.js';

/**
 * Tool: git-config
 * 
 * DESCRIÃ‡ÃƒO:
 * Gerenciamento de configuraÃ§Ã£o Git (GitHub + Gitea) com mÃºltiplas aÃ§Ãµes
 * 
 * FUNCIONALIDADES:
 * - Obter configuraÃ§Ãµes
 * - Definir configuraÃ§Ãµes
 * - Remover configuraÃ§Ãµes
 * - Listar configuraÃ§Ãµes
 * - Editar configuraÃ§Ã£o
 * - Mostrar configuraÃ§Ãµes
 * 
 * USO:
 * - Para configurar usuÃ¡rio e email
 * - Para configurar aliases
 * - Para configurar branches padrÃ£o
 * - Para configurar merge tools
 * - Para configurar credenciais
 * 
 * RECOMENDAÃ‡Ã•ES:
 * - Use configuraÃ§Ãµes globais para usuÃ¡rio
 * - Use configuraÃ§Ãµes locais para projeto
 * - Documente configuraÃ§Ãµes customizadas
 */

const GitConfigInputSchema = z.object({
  action: z.enum(['get', 'set', 'unset', 'list', 'edit', 'show']),
  // owner: obtido automaticamente do provider,
  repo: z.string(),
  provider: z.enum(['gitea', 'github']).describe('Provider to use (gitea or github)'),
  projectPath: z.string().describe('Local project path for git operations'),
  
  // Para get/set/unset
  key: z.string().optional(),
  value: z.string().optional(),
  
  // Para set
  scope: z.enum(['local', 'global', 'system']).optional(),
  
  // Para list
  pattern: z.string().optional(),
  
  // Para show
  show_origin: z.boolean().optional(),
});

export type GitConfigInput = z.infer<typeof GitConfigInputSchema>;

const GitConfigResultSchema = z.object({
  success: z.boolean(),
  action: z.string(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional()
});

export type GitConfigResult = z.infer<typeof GitConfigResultSchema>;

export const gitConfigTool = {
  name: 'git-config',
  description: 'tool: Gerencia configuraÃ§Ãµes Git para personalizaÃ§Ã£o do ambiente\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction get: obtÃ©m valor de configuraÃ§Ã£o\naction get requires: repo, key, scope, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction set: define valor de configuraÃ§Ã£o\naction set requires: repo, key, value, scope, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction unset: remove configuraÃ§Ã£o\naction unset requires: repo, key, scope, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction list: lista configuraÃ§Ãµes\naction list requires: repo, pattern, scope, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction edit: edita arquivo de configuraÃ§Ã£o\naction edit requires: repo, scope, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction show: mostra configuraÃ§Ãµes com origem\naction show requires: repo, show_origin, provider',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['get', 'set', 'unset', 'list', 'edit', 'show'],
        description: 'Action to perform on config'
      },
      owner: { type: 'string', description: 'Repository owner' },
      repo: { type: 'string', description: 'Repository name' },
      provider: { type: 'string', enum: ['gitea', 'github'], description: 'Provider to use (gitea or github)' },
      projectPath: { type: 'string', description: 'Local project path for git operations' },
      key: { type: 'string', description: 'Config key' },
      value: { type: 'string', description: 'Config value' },
      scope: { type: 'string', enum: ['local', 'global', 'system'], description: 'Config scope' },
      pattern: { type: 'string', description: 'Pattern for listing configs' },
      show_origin: { type: 'boolean', description: 'Show origin of config values' }
    },
    required: ['action', 'repo', 'provider', 'projectPath']
  },

  async handler(input: GitConfigInput): Promise<GitConfigResult> {
    try {
      const validatedInput = GitConfigInputSchema.parse(input);
      
      switch (validatedInput.action) {
        case 'get':
          return await this.get(validatedInput);
        case 'set':
          return await this.set(validatedInput);
        case 'unset':
          return await this.unset(validatedInput);
        case 'list':
          return await this.list(validatedInput);
        case 'edit':
          return await this.edit(validatedInput);
        case 'show':
          return await this.show(validatedInput);
        default:
          throw new Error(`AÃ§Ã£o nÃ£o suportada: ${validatedInput.action}`);
      }
    } catch (error) {
      return {
        success: false,
        action: input.action,
        message: 'Erro na operaÃ§Ã£o de config',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  async get(params: GitConfigInput): Promise<GitConfigResult> {
    try {
      if (!params.key) {
        throw new Error('key Ã© obrigatÃ³rio para get');
      }

      const scope = params.scope || 'local';
      const gitCommand = `config --${scope} ${params.key}`;

      const result = await runGitCommand(
        gitCommand,
        params.projectPath,
        'Obtendo configuraÃ§Ã£o'
      );

      if (result.exitCode !== 0) {
        throw new Error(`Falha ao obter configuraÃ§Ã£o: ${result.output}`);
      }

      return {
        success: true,
        action: 'get',
        message: `ConfiguraÃ§Ã£o ${params.key} obtida com sucesso`,
        data: {
          key: params.key,
          value: result.output.trim(),
          scope,
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao obter configuraÃ§Ã£o: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async set(params: GitConfigInput): Promise<GitConfigResult> {
    try {
      if (!params.key || !params.value) {
        throw new Error('key e value sÃ£o obrigatÃ³rios para set');
      }

      const scope = params.scope || 'local';
      const gitCommand = `config --${scope} ${params.key} "${params.value}"`;

      const result = await runGitCommand(
        gitCommand,
        params.projectPath,
        'Definindo configuraÃ§Ã£o'
      );

      if (result.exitCode !== 0) {
        throw new Error(`Falha ao definir configuraÃ§Ã£o: ${result.output}`);
      }

      return {
        success: true,
        action: 'set',
        message: `ConfiguraÃ§Ã£o ${params.key} definida com sucesso`,
        data: {
          key: params.key,
          value: params.value,
          scope,
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao definir configuraÃ§Ã£o: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async unset(params: GitConfigInput): Promise<GitConfigResult> {
    try {
      if (!params.key) {
        throw new Error('key Ã© obrigatÃ³rio para unset');
      }

      const scope = params.scope || 'local';
      const gitCommand = `config --${scope} --unset ${params.key}`;

      const result = await runGitCommand(
        gitCommand,
        params.projectPath,
        'Removendo configuraÃ§Ã£o'
      );

      if (result.exitCode !== 0) {
        throw new Error(`Falha ao remover configuraÃ§Ã£o: ${result.output}`);
      }

      return {
        success: true,
        action: 'unset',
        message: `ConfiguraÃ§Ã£o ${params.key} removida com sucesso`,
        data: {
          key: params.key,
          scope,
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao remover configuraÃ§Ã£o: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async list(params: GitConfigInput): Promise<GitConfigResult> {
    try {
      const scope = params.scope || 'local';
      let gitCommand = `config --${scope} --list`;
      
      if (params.pattern) {
        gitCommand += ` | grep "${params.pattern}"`;
      }

      const result = await runGitCommand(
        gitCommand,
        params.projectPath,
        'Listando configuraÃ§Ãµes'
      );

      if (result.exitCode !== 0) {
        throw new Error(`Falha ao listar configuraÃ§Ãµes: ${result.output}`);
      }

      const configs = result.output.split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [key, ...valueParts] = line.split('=');
          return { key, value: valueParts.join('=') };
        });

      return {
        success: true,
        action: 'list',
        message: `ConfiguraÃ§Ãµes ${scope} listadas com sucesso`,
        data: {
          scope,
          pattern: params.pattern,
          configs,
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao listar configuraÃ§Ãµes: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async edit(params: GitConfigInput): Promise<GitConfigResult> {
    try {
      const scope = params.scope || 'local';
      const gitCommand = `config --${scope} --edit`;

      const result = await runGitCommand(
        gitCommand,
        params.projectPath,
        'Editando configuraÃ§Ã£o'
      );

      if (result.exitCode !== 0) {
        throw new Error(`Falha ao editar configuraÃ§Ã£o: ${result.output}`);
      }

      return {
        success: true,
        action: 'edit',
        message: `ConfiguraÃ§Ã£o ${scope} editada com sucesso`,
        data: {
          scope,
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao editar configuraÃ§Ã£o: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async show(params: GitConfigInput): Promise<GitConfigResult> {
    try {
      const scope = params.scope || 'local';
      let gitCommand = `config --${scope} --list`;
      
      if (params.show_origin) {
        gitCommand = `config --${scope} --show-origin --list`;
      }

      const result = await runGitCommand(
        gitCommand,
        params.projectPath,
        'Mostrando configuraÃ§Ãµes'
      );

      if (result.exitCode !== 0) {
        throw new Error(`Falha ao mostrar configuraÃ§Ãµes: ${result.output}`);
      }

      return {
        success: true,
        action: 'show',
        message: `ConfiguraÃ§Ãµes ${scope} mostradas com sucesso`,
        data: {
          scope,
          show_origin: params.show_origin,
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao mostrar configuraÃ§Ãµes: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  /**
   * Verifica se erro Ã© relacionado a Git
   */
  isGitRelatedError(errorMessage: string): boolean {
    const gitKeywords = [
      'git', 'commit', 'push', 'pull', 'merge', 'conflict', 'branch',
      'remote', 'repository', 'authentication', 'permission', 'unauthorized',
      'divergent', 'non-fast-forward', 'fetch first', 'working tree',
      'uncommitted', 'stash', 'rebase', 'reset', 'checkout'
    ];
    
    const errorLower = errorMessage.toLowerCase();
    return gitKeywords.some(keyword => errorLower.includes(keyword));
  }
};

