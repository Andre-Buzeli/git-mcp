import { z } from 'zod';
import { globalProviderFactory, VcsOperations } from '../providers/index.js';
import { applyAutoUserDetection } from '../utils/user-detection.js';
import { ToolValidator, CommonSchemas, ToolSchemas } from './validator.js';

/**
 * Tool: deployments
 * 
 * DESCRIÇÃO:
 * Gerenciamento completo de deployments com múltiplas ações
 * 
 * FUNCIONALIDADES:
 * - Listagem de deployments
 * - Criação de deployment
 * - Atualização de status de deployment
 * - Gerenciamento de ambientes
 * - Rollback de deployments
 * - Monitoramento de status
 * 
 * USO:
 * - Para rastrear deployments em produção
 * - Para gerenciar ambientes de deploy
 * - Para automação de rollbacks
 * - Para monitoramento de releases
 * 
 * RECOMENDAÇÕES:
 * - Use ambientes separados para staging/prod
 * - Monitore status de deployments
 * - Configure rollbacks automáticos
 * - Mantenha histórico de deployments
 */

/**
 * Schema de validação para entrada da tool deployments
 */
const DeploymentsInputSchema = z.object({
  action: z.enum(['list', 'create', 'status', 'environments', 'rollback', 'delete']),
  
  // Parâmetros comuns
  repo: CommonSchemas.repo,
  provider: CommonSchemas.provider,
  
  // Parâmetros para listagem
  page: CommonSchemas.page,
  limit: CommonSchemas.limit,
  
  // Parâmetros para deployment
  deployment_id: CommonSchemas.shortString,
  ref: CommonSchemas.branch,
  environment: CommonSchemas.shortString,
  description: CommonSchemas.mediumString,
  
  // Parâmetros para criação
  task: CommonSchemas.shortString,
  auto_merge: CommonSchemas.boolean,
  required_contexts: z.array(z.string()).optional(),
  payload: z.record(z.any()).optional(),
  
  // Parâmetros para status
  state: z.enum(['pending', 'success', 'error', 'failure', 'inactive', 'in_progress', 'queued']).optional(),
  log_url: CommonSchemas.mediumString,
  environment_url: CommonSchemas.mediumString,
  
  // Parâmetros para ambientes
  environment_name: CommonSchemas.shortString,
  wait_timer: z.number().optional(),
  reviewers: z.array(z.string()).optional(),
  
  // Filtros
  sha: CommonSchemas.shortString,
  task_filter: CommonSchemas.shortString,
  environment_filter: CommonSchemas.shortString
}).refine((data) => {
  // Validações específicas por ação
  if (['create'].includes(data.action)) {
    return data.repo && data.ref && data.environment;
  }
  if (['status', 'rollback', 'delete'].includes(data.action)) {
    return data.repo && data.deployment_id;
  }
  return data.repo;
}, {
  message: "Parâmetros obrigatórios não fornecidos para a ação especificada"
});

export type DeploymentsInput = z.infer<typeof DeploymentsInputSchema>;

/**
 * Schema de validação para resultado da tool deployments
 */
const DeploymentsResultSchema = z.object({
  success: z.boolean(),
  action: z.string(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional()
});

export type DeploymentsResult = z.infer<typeof DeploymentsResultSchema>;

/**
 * Implementação da tool deployments
 */
export const deploymentsTool = {
  name: 'gh-deployments',
  description: 'Gerenciamento completo de GitHub Deployments (EXCLUSIVO GITHUB). PARÂMETROS OBRIGATÓRIOS: action, owner, repo, provider (deve ser github). AÇÕES: list (lista deployments), create (cria), status (verifica status), environments (ambientes), rollback (reverte), delete (remove). Boas práticas: use ambientes separados para staging/prod, monitore status de deployments, configure rollbacks automáticos.',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['list', 'create', 'status', 'environments', 'rollback', 'delete'],
        description: 'Action to perform on deployments'
      },
      owner: { type: 'string', description: 'Repository owner' },
      repo: { type: 'string', description: 'Repository name' },
      provider: { type: 'string', description: 'Specific provider (github, gitea) or use default' },
      deployment_id: { type: 'string', description: 'Deployment ID' },
      ref: { type: 'string', description: 'Git reference to deploy' },
      environment: { type: 'string', description: 'Deployment environment' },
      description: { type: 'string', description: 'Deployment description' },
      task: { type: 'string', description: 'Deployment task' },
      auto_merge: { type: 'boolean', description: 'Auto merge deployment' },
      required_contexts: { type: 'array', items: { type: 'string' }, description: 'Required status contexts' },
      payload: { type: 'object', description: 'Deployment payload' },
      state: { type: 'string', enum: ['pending', 'success', 'error', 'failure', 'inactive', 'in_progress', 'queued'], description: 'Deployment state' },
      log_url: { type: 'string', description: 'Log URL' },
      environment_url: { type: 'string', description: 'Environment URL' },
      environment_name: { type: 'string', description: 'Environment name' },
      wait_timer: { type: 'number', description: 'Wait timer in minutes' },
      reviewers: { type: 'array', items: { type: 'string' }, description: 'Environment reviewers' },
      sha: { type: 'string', description: 'Commit SHA filter' },
      task_filter: { type: 'string', description: 'Task filter' },
      environment_filter: { type: 'string', description: 'Environment filter' },
      page: { type: 'number', description: 'Page number', minimum: 1 },
      limit: { type: 'number', description: 'Items per page', minimum: 1, maximum: 100 }
    },
    required: ['action', 'repo', 'provider']
  },

  async handler(input: DeploymentsInput): Promise<DeploymentsResult> {
    try {
      const validatedInput = DeploymentsInputSchema.parse(input);

      // Aplicar auto-detecção de usuário
      const updatedParams = await applyAutoUserDetection(validatedInput, validatedInput.provider);
      const provider = updatedParams.provider

        ? globalProviderFactory.getProvider(updatedParams.provider)

        : globalProviderFactory.getDefaultProvider();
      
      if (!provider) {
        throw new Error(`Provider '${updatedParams.provider}' não encontrado`);
      }
      
      switch (updatedParams.action) {
        case 'list':
          return await this.listDeployments(updatedParams, provider);
        case 'create':
          return await this.createDeployment(updatedParams, provider);
        case 'status':
          return await this.updateDeploymentStatus(updatedParams, provider);
        case 'environments':
          return await this.listEnvironments(updatedParams, provider);
        case 'rollback':
          return await this.rollbackDeployment(updatedParams, provider);
        case 'delete':
          return await this.deleteDeployment(updatedParams, provider);
        default:
          throw new Error(`Ação não suportada: ${updatedParams.action}`);
      }
    } catch (error) {
      return {
        success: false,
        action: input.action || 'unknown',
        message: 'Erro na operação de deployments',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  /**
   * Lista deployments do repositório
   */
  async listDeployments(params: DeploymentsInput, provider: VcsOperations): Promise<DeploymentsResult> {
    try {
      const currentUser = await provider.getCurrentUser();
      const owner = currentUser.login;

      if (!provider.listDeployments) {
        return {
          success: true,
          action: 'list',
          message: 'Funcionalidade de deployments não suportada por este provider',
          data: {
            total_count: 0,
            deployments: [],
            note: 'Deployments não disponíveis neste provider'
          }
        };
      }
      
      const result = await provider.listDeployments({
        owner,
        repo: params.repo!,
        sha: params.sha,
        ref: params.ref,
        task: params.task_filter,
        environment: params.environment_filter,
        page: params.page,
        limit: params.limit
      });
      
      return {
        success: true,
        action: 'list',
        message: `${result.deployments?.length || 0} deployments encontrados`,
        data: result
      };
    } catch (error) {
      throw new Error(`Falha ao listar deployments: ${error}`);
    }
  },

  /**
   * Cria novo deployment
   */
  async createDeployment(params: DeploymentsInput, provider: VcsOperations): Promise<DeploymentsResult> {
    try {
      if (!provider.createDeployment) {
        return {
          success: false,
          action: 'create-deployment',
          message: 'Funcionalidade não suportada por este provider',
          error: 'Provider não implementa createDeployment'
        };
      }
      
      const currentUser = await provider.getCurrentUser();
      const owner = currentUser.login;

      const result = await provider.createDeployment({
        owner,
        repo: params.repo!,
        ref: params.ref!,
        environment: params.environment!,
        description: params.description,
        task: params.task || 'deploy',
        auto_merge: params.auto_merge,
        required_contexts: params.required_contexts,
        payload: params.payload
      });
      
      return {
        success: true,
        action: 'create',
        message: 'Deployment criado com sucesso',
        data: result
      };
    } catch (error) {
      throw new Error(`Falha ao criar deployment: ${error}`);
    }
  },

  /**
   * Atualiza status do deployment
   */
  async updateDeploymentStatus(params: DeploymentsInput, provider: VcsOperations): Promise<DeploymentsResult> {
    try {
      if (!provider.updateDeploymentStatus) {
        return {
          success: false,
          action: 'update-deployment-status',
          message: 'Funcionalidade não suportada por este provider',
          error: 'Provider não implementa updateDeploymentStatus'
        };
      }
      
      const currentUser = await provider.getCurrentUser();
      const owner = currentUser.login;

      const result = await provider.updateDeploymentStatus({
        owner,
        repo: params.repo!,
        deployment_id: params.deployment_id!,
        state: params.state || 'pending',
        log_url: params.log_url,
        description: params.description,
        environment_url: params.environment_url
      });
      
      return {
        success: true,
        action: 'status',
        message: `Status do deployment atualizado com sucesso`,
        data: result
      };
    } catch (error) {
      throw new Error(`Falha ao atualizar status do deployment: ${error}`);
    }
  },

  /**
   * Lista ambientes de deployment
   */
  async listEnvironments(params: DeploymentsInput, provider: VcsOperations): Promise<DeploymentsResult> {
    try {
      if (!provider.listEnvironments) {
        return {
          success: false,
          action: 'list-environments',
          message: 'Funcionalidade não suportada por este provider',
          error: 'Provider não implementa listEnvironments'
        };
      }
      
      const currentUser = await provider.getCurrentUser();
      const owner = currentUser.login;

      const result = await provider.listEnvironments({
        owner,
        repo: params.repo!,
        page: params.page,
        limit: params.limit
      });
      
      return {
        success: true,
        action: 'environments',
        message: `${result.environments?.length || 0} ambientes encontrados`,
        data: result
      };
    } catch (error) {
      throw new Error(`Falha ao listar ambientes: ${error}`);
    }
  },

  /**
   * Executa rollback de deployment
   */
  async rollbackDeployment(params: DeploymentsInput, provider: VcsOperations): Promise<DeploymentsResult> {
    try {
      if (!provider.rollbackDeployment) {
        return {
          success: false,
          action: 'rollback-deployment',
          message: 'Funcionalidade não suportada por este provider',
          error: 'Provider não implementa rollbackDeployment'
        };
      }
      
      const currentUser = await provider.getCurrentUser();
      const owner = currentUser.login;

      const result = await provider.rollbackDeployment({
        owner,
        repo: params.repo!,
        deployment_id: params.deployment_id!,
        description: params.description || 'Rollback automático'
      });
      
      return {
        success: true,
        action: 'rollback',
        message: `Rollback do deployment executado com sucesso`,
        data: result
      };
    } catch (error) {
      throw new Error(`Falha ao executar rollback: ${error}`);
    }
  },

  /**
   * Remove deployment
   */
  async deleteDeployment(params: DeploymentsInput, provider: VcsOperations): Promise<DeploymentsResult> {
    try {
      if (!provider.deleteDeployment) {
        return {
          success: false,
          action: 'delete-deployment',
          message: 'Funcionalidade não suportada por este provider',
          error: 'Provider não implementa deleteDeployment'
        };
      }
      
      const currentUser = await provider.getCurrentUser();
      const owner = currentUser.login;

      const result = await provider.deleteDeployment({
        owner,
        repo: params.repo!,
        deployment_id: params.deployment_id!
      });
      
      return {
        success: true,
        action: 'delete',
        message: `Deployment removido com sucesso`,
        data: result
      };
    } catch (error) {
      throw new Error(`Falha ao remover deployment: ${error}`);
    }
  }
};