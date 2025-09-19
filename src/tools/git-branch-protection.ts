import { z } from 'zod';
import { globalProviderFactory, VcsOperations } from '../providers/index.js';
import { applyAutoUserDetection } from '../utils/user-detection.js';

export const gitBranchProtection = {
  name: 'git-branch-protection',
  description: 'Gerencia proteções de branches em repositórios Git',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['list', 'create', 'get', 'update', 'delete'],
        description: 'Ação a executar'
      },
      repo: {
        type: 'string',
        description: 'Nome do repositório'
      },
      provider: {
        type: 'string',
        enum: ['gitea', 'github'],
        description: 'Provedor VCS'
      },
      projectPath: {
        type: 'string',
        description: 'Caminho do projeto local'
      },
      branch_name: {
        type: 'string',
        description: 'Nome da branch para proteger'
      },
      protection: {
        type: 'object',
        description: 'Configurações de proteção',
        properties: {
          required_status_checks: {
            type: 'object',
            properties: {
              strict: { type: 'boolean' },
              contexts: { type: 'array', items: { type: 'string' } }
            }
          },
          enforce_admins: { type: 'boolean' },
          required_pull_request_reviews: {
            type: 'object',
            properties: {
              required_approving_review_count: { type: 'number' },
              dismiss_stale_reviews: { type: 'boolean' },
              require_code_owner_reviews: { type: 'boolean' }
            }
          },
          restrictions: {
            type: 'object',
            properties: {
              users: { type: 'array', items: { type: 'string' } },
              teams: { type: 'array', items: { type: 'string' } }
            }
          }
        }
      }
    },
    required: ['action', 'repo', 'provider', 'projectPath']
  },

  async handler(input: any): Promise<any> {
    try {
      const provider = globalProviderFactory.getProvider(input.provider);
      if (!provider) {
        throw new Error(`Provider '${input.provider}' não encontrado`);
      }
      const currentUser = await provider.getCurrentUser();
      const owner = currentUser.login;

      switch (input.action) {
        case 'list':
          return await this.listBranchProtections(provider, owner, input.repo);
        
        case 'create':
          if (!input.branch_name || !input.protection) {
            throw new Error('branch_name e protection são obrigatórios para create');
          }
          return await this.createBranchProtection(provider, owner, input.repo, input.branch_name, input.protection);
        
        case 'get':
          if (!input.branch_name) {
            throw new Error('branch_name é obrigatório para get');
          }
          return await this.getBranchProtection(provider, owner, input.repo, input.branch_name);
        
        case 'update':
          if (!input.branch_name || !input.protection) {
            throw new Error('branch_name e protection são obrigatórios para update');
          }
          return await this.updateBranchProtection(provider, owner, input.repo, input.branch_name, input.protection);
        
        case 'delete':
          if (!input.branch_name) {
            throw new Error('branch_name é obrigatório para delete');
          }
          return await this.deleteBranchProtection(provider, owner, input.repo, input.branch_name);
        
        default:
          throw new Error(`Ação não suportada: ${input.action}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (this.isGitRelatedError(errorMessage)) {
        return {
          success: false,
          action: input.action,
          message: `[${input.provider.toUpperCase()}] Erro na operação de proteção de branch`,
          error: errorMessage,
          analysis: {
            type: 'branch_protection_error',
            cause: 'Falha na operação de proteção de branch',
            solution: 'Verifique as permissões e configurações de proteção'
          }
        };
      }
      return {
        success: false,
        action: input.action,
        message: 'Erro na operação de proteção de branch',
        error: errorMessage
      };
    }
  },

  async listBranchProtections(provider: any, owner: string, repo: string): Promise<any> {
    const protections = await provider.listBranchProtections(owner, repo);
    return {
      success: true,
      action: 'list',
      message: `Proteções de branch listadas com sucesso para ${owner}/${repo}`,
      data: protections
    };
  },

  async createBranchProtection(provider: any, owner: string, repo: string, branchName: string, protection: any): Promise<any> {
    const result = await provider.createBranchProtection(owner, repo, branchName, protection);
    return {
      success: true,
      action: 'create',
      message: `Proteção de branch '${branchName}' criada com sucesso`,
      data: result
    };
  },

  async getBranchProtection(provider: any, owner: string, repo: string, branchName: string): Promise<any> {
    const protection = await provider.getBranchProtection(owner, repo, branchName);
    return {
      success: true,
      action: 'get',
      message: `Proteção de branch '${branchName}' obtida com sucesso`,
      data: protection
    };
  },

  async updateBranchProtection(provider: any, owner: string, repo: string, branchName: string, protection: any): Promise<any> {
    const result = await provider.updateBranchProtection(owner, repo, branchName, protection);
    return {
      success: true,
      action: 'update',
      message: `Proteção de branch '${branchName}' atualizada com sucesso`,
      data: result
    };
  },

  async deleteBranchProtection(provider: any, owner: string, repo: string, branchName: string): Promise<any> {
    await provider.deleteBranchProtection(owner, repo, branchName);
    return {
      success: true,
      action: 'delete',
      message: `Proteção de branch '${branchName}' removida com sucesso`,
      data: { branch_name: branchName, deleted: true }
    };
  },

  /**
   * Verifica se erro é relacionado a Git
   */
  isGitRelatedError(errorMessage: string): boolean {
    const gitKeywords = [
      'git', 'commit', 'push', 'pull', 'merge', 'conflict', 'branch',
      'remote', 'repository', 'authentication', 'permission', 'unauthorized',
      'divergent', 'non-fast-forward', 'fetch first', 'working tree',
      'uncommitted', 'stash', 'rebase', 'reset', 'checkout', 'protection'
    ];
    
    const errorLower = errorMessage.toLowerCase();
    return gitKeywords.some(keyword => errorLower.includes(keyword));
  }
};
