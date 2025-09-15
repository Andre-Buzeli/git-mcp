import { z } from 'zod';
import { globalProviderFactory, VcsOperations } from '../providers/index.js';
import { applyAutoUserDetection } from '../utils/user-detection.js';
import { ToolValidator, CommonSchemas, ToolSchemas } from './validator.js';

/**
 * Tool: workflows
 * 
 * DESCRIÇÃO:
 * Gerenciamento completo de workflows CI/CD com múltiplas ações
 * 
 * FUNCIONALIDADES:
 * - Listagem de workflows ativos
 * - Criação de novos workflows
 * - Disparo manual de workflows
 * - Verificação de status de execução
 * - Obtenção de logs de execução
 * - Controle de workflows (enable/disable)
 * 
 * USO:
 * - Para automatizar CI/CD pipelines
 * - Para monitorar execuções
 * - Para gerenciar workflows de desenvolvimento
 * - Para integração com ferramentas de deploy
 * 
 * RECOMENDAÇÕES:
 * - Use workflows para automatizar testes
 * - Configure triggers apropriados
 * - Monitore logs regularmente
 * - Mantenha workflows simples e focados
 */

/**
 * Schema de validação para entrada da tool workflows
 * 
 * VALIDAÇÕES:
 * - action: Ação obrigatória (list, create, trigger, status, logs, disable, enable)
 * - Parâmetros específicos por ação
 * - Validação de tipos e formatos
 * 
 * RECOMENDAÇÕES:
 * - Sempre valide entrada antes de usar
 * - Use parâmetros opcionais adequadamente
 * - Documente parâmetros obrigatórios
 */
const WorkflowsInputSchema = z.object({
  action: z.enum(['list', 'create', 'trigger', 'status', 'logs', 'disable', 'enable']),
  
  // Parâmetros comuns
  owner: CommonSchemas.owner,
  repo: CommonSchemas.repo,
  provider: CommonSchemas.provider,
  
  // Parâmetros para listagem
  page: CommonSchemas.page,
  limit: CommonSchemas.limit,
  
  // Parâmetros para criação
  name: CommonSchemas.shortString,
  description: CommonSchemas.mediumString,
  workflow_content: CommonSchemas.longString,
  branch: CommonSchemas.branch,
  
  // Parâmetros para trigger e status
  workflow_id: CommonSchemas.shortString,
  workflow_name: CommonSchemas.shortString,
  run_id: CommonSchemas.shortString,
  
  // Parâmetros para logs
  job_id: CommonSchemas.shortString,
  step_number: z.number().optional(),
  
  // Parâmetros para inputs do workflow
  inputs: z.record(z.string()).optional(),
  ref: CommonSchemas.branch.optional()
}).refine((data) => {
  // Validações específicas por ação
  if (['create'].includes(data.action)) {
    return data.owner && data.repo && data.name && data.workflow_content;
  }
  if (['trigger', 'status', 'logs', 'disable', 'enable'].includes(data.action)) {
    return data.owner && data.repo && (data.workflow_id || data.workflow_name);
  }
  return data.owner && data.repo;
}, {
  message: "Parâmetros obrigatórios não fornecidos para a ação especificada"
});

export type WorkflowsInput = z.infer<typeof WorkflowsInputSchema>;

/**
 * Schema de validação para resultado da tool workflows
 */
const WorkflowsResultSchema = z.object({
  success: z.boolean(),
  action: z.string(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional()
});

export type WorkflowsResult = z.infer<typeof WorkflowsResultSchema>;

/**
 * Implementação da tool workflows
 * 
 * ESTRUTURA:
 * - Validação de entrada
 * - Seleção do provider
 * - Execução da ação
 * - Tratamento de erros
 * - Formatação do resultado
 * 
 * AÇÕES SUPORTADAS:
 * - list: Lista workflows do repositório
 * - create: Cria novo workflow
 * - trigger: Dispara workflow manualmente
 * - status: Verifica status de execução
 * - logs: Obtém logs de execução
 * - disable: Desabilita workflow
 * - enable: Habilita workflow
 * 
 * TRATAMENTO DE ERROS:
 * - Validação de parâmetros
 * - Verificação de permissões
 * - Tratamento de falhas de API
 * - Logs detalhados para debug
 */
export const workflowsTool = {
  name: 'workflows',
  description: 'Manage CI/CD workflows with multiple actions: list, create, trigger, status, logs, disable, enable. Suporte completo a GitHub Actions e Gitea Actions simultaneamente. Boas práticas: use para automatizar CI/CD pipelines, monitorar execuções, configurar triggers apropriados e manter workflows simples e focados.',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['list', 'create', 'trigger', 'status', 'logs', 'disable', 'enable'],
        description: 'Action to perform on workflows'
      },
      owner: { type: 'string', description: 'Repository owner' },
      repo: { type: 'string', description: 'Repository name' },
      provider: { type: 'string', description: 'Specific provider (github, gitea) or use default' },
      name: { type: 'string', description: 'Workflow name for creation' },
      description: { type: 'string', description: 'Workflow description' },
      workflow_content: { type: 'string', description: 'Workflow YAML content' },
      branch: { type: 'string', description: 'Target branch' },
      workflow_id: { type: 'string', description: 'Workflow ID' },
      workflow_name: { type: 'string', description: 'Workflow name' },
      run_id: { type: 'string', description: 'Workflow run ID' },
      job_id: { type: 'string', description: 'Job ID for logs' },
      step_number: { type: 'number', description: 'Step number for logs' },
      inputs: { type: 'object', description: 'Workflow inputs' },
      ref: { type: 'string', description: 'Git reference for trigger' },
      page: { type: 'number', description: 'Page number', minimum: 1 },
      limit: { type: 'number', description: 'Items per page', minimum: 1, maximum: 100 }
    },
    required: ['action']
  },

  /**
   * Handler principal da tool workflows
   * 
   * FLUXO:
   * 1. Validação da entrada
   * 2. Seleção do provider
   * 3. Execução da ação específica
   * 4. Formatação e retorno do resultado
   * 
   * PARÂMETROS:
   * @param input - Dados de entrada validados
   * 
   * RETORNO:
   * @returns Promise<WorkflowsResult> - Resultado da operação
   * 
   * ERROS:
   * - Lança exceção em caso de erro de validação
   * - Retorna erro formatado em caso de falha de API
   */
  async handler(input: WorkflowsInput): Promise<WorkflowsResult> {
    try {
      // Validação da entrada
      const validatedInput = WorkflowsInputSchema.parse(input);

      // Aplicar auto-detecção de usuário
      const updatedParams = await applyAutoUserDetection(validatedInput, validatedInput.provider);
      
      // Seleção do provider
      const provider = updatedParams.provider

        ? globalProviderFactory.getProvider(updatedParams.provider)

        : globalProviderFactory.getDefaultProvider();
      
      if (!provider) {
        throw new Error(`Provider '${updatedParams.provider}' não encontrado`);
      }
      
      // Execução da ação específica
      switch (updatedParams.action) {
        case 'list':
          return await this.listWorkflows(updatedParams, provider);
        case 'create':
          return await this.createWorkflow(updatedParams, provider);
        case 'trigger':
          return await this.triggerWorkflow(updatedParams, provider);
        case 'status':
          return await this.getWorkflowStatus(updatedParams, provider);
        case 'logs':
          return await this.getWorkflowLogs(updatedParams, provider);
        case 'disable':
          return await this.disableWorkflow(updatedParams, provider);
        case 'enable':
          return await this.enableWorkflow(updatedParams, provider);
        default:
          throw new Error(`Ação não suportada: ${updatedParams.action}`);
      }
    } catch (error) {
      return {
        success: false,
        action: input.action || 'unknown',
        message: 'Erro na operação de workflows',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  /**
   * Lista workflows do repositório
   */
  async listWorkflows(params: WorkflowsInput, provider: VcsOperations): Promise<WorkflowsResult> {
    try {
      // Auto-detecção de owner/username se não fornecidos
      let updatedParams = { ...params };
      if (!updatedParams.owner) {
        try {
          const currentUser = await provider.getCurrentUser();
          updatedParams.owner = currentUser.login;
        } catch (error) {
          console.warn('[WORKFLOWS.TS] Falha na auto-detecção de usuário');
        }
      }

      
      if (!provider.listWorkflows) {
        return {
          success: true,
          action: 'list',
          message: 'Funcionalidade de workflows não suportada por este provider',
          data: {
            total_count: 0,
            workflows: [],
            note: 'Workflows não disponíveis neste provider'
          }
        };
      }
      
      const result = await provider.listWorkflows({
        owner: params.owner!,
        repo: params.repo!,
        page: params.page,
        limit: params.limit
      });
      
      return {
        success: true,
        action: 'list',
        message: `${result.workflows?.length || 0} workflows encontrados`,
        data: result
      };
    } catch (error) {
      throw new Error(`Falha ao listar workflows: ${error}`);
    }
  },

  /**
   * Cria novo workflow
   */
  async createWorkflow(params: WorkflowsInput, provider: VcsOperations): Promise<WorkflowsResult> {
    try {
      if (!provider.createWorkflow) {
        return {
          success: false,
          action: 'create-workflow',
          message: 'Funcionalidade não suportada por este provider',
          error: 'Provider não implementa createWorkflow'
        };
      }
      
      const result = await provider.createWorkflow({
        owner: params.owner!,
        repo: params.repo!,
        name: params.name!,
        description: params.description,
        content: params.workflow_content!,
        branch: params.branch
      });
      
      return {
        success: true,
        action: 'create',
        message: `Workflow '${params.name}' criado com sucesso`,
        data: result
      };
    } catch (error) {
      throw new Error(`Falha ao criar workflow: ${error}`);
    }
  },

  /**
   * Dispara workflow manualmente
   */
  async triggerWorkflow(params: WorkflowsInput, provider: VcsOperations): Promise<WorkflowsResult> {
    try {
      if (!provider.triggerWorkflow) {
        return {
          success: false,
          action: 'trigger-workflow',
          message: 'Funcionalidade não suportada por este provider',
          error: 'Provider não implementa triggerWorkflow'
        };
      }
      
      const result = await provider.triggerWorkflow({
        owner: params.owner!,
        repo: params.repo!,
        workflow_id: params.workflow_id,
        workflow_name: params.workflow_name,
        ref: params.ref || 'main',
        inputs: params.inputs
      });
      
      return {
        success: true,
        action: 'trigger',
        message: `Workflow disparado com sucesso`,
        data: result
      };
    } catch (error) {
      throw new Error(`Falha ao disparar workflow: ${error}`);
    }
  },

  /**
   * Verifica status de execução do workflow
   */
  async getWorkflowStatus(params: WorkflowsInput, provider: VcsOperations): Promise<WorkflowsResult> {
    try {
      // Auto-detecção de owner/username se não fornecidos
      let updatedParams = { ...params };
      if (!updatedParams.owner) {
        try {
          const currentUser = await provider.getCurrentUser();
          updatedParams.owner = currentUser.login;
        } catch (error) {
          console.warn('[WORKFLOWS.TS] Falha na auto-detecção de usuário');
        }
      }

      
      if (!provider.getWorkflowStatus) {
        return {
          success: false,
          action: 'get-workflow-status',
          message: 'Funcionalidade não suportada por este provider',
          error: 'Provider não implementa getWorkflowStatus'
        };
      }
      
      const result = await provider.getWorkflowStatus({
        owner: params.owner!,
        repo: params.repo!,
        run_id: params.run_id,
        workflow_id: params.workflow_id
      });
      
      return {
        success: true,
        action: 'status',
        message: `Status do workflow obtido com sucesso`,
        data: result
      };
    } catch (error) {
      throw new Error(`Falha ao obter status do workflow: ${error}`);
    }
  },

  /**
   * Obtém logs de execução do workflow
   */
  async getWorkflowLogs(params: WorkflowsInput, provider: VcsOperations): Promise<WorkflowsResult> {
    try {
      // Auto-detecção de owner/username se não fornecidos
      let updatedParams = { ...params };
      if (!updatedParams.owner) {
        try {
          const currentUser = await provider.getCurrentUser();
          updatedParams.owner = currentUser.login;
        } catch (error) {
          console.warn('[WORKFLOWS.TS] Falha na auto-detecção de usuário');
        }
      }

      
      if (!provider.getWorkflowLogs) {
        return {
          success: false,
          action: 'get-workflow-logs',
          message: 'Funcionalidade não suportada por este provider',
          error: 'Provider não implementa getWorkflowLogs'
        };
      }
      
      const result = await provider.getWorkflowLogs({
        owner: params.owner!,
        repo: params.repo!,
        run_id: params.run_id!,
        job_id: params.job_id,
        step_number: params.step_number
      });
      
      return {
        success: true,
        action: 'logs',
        message: `Logs do workflow obtidos com sucesso`,
        data: result
      };
    } catch (error) {
      throw new Error(`Falha ao obter logs do workflow: ${error}`);
    }
  },

  /**
   * Desabilita workflow
   */
  async disableWorkflow(params: WorkflowsInput, provider: VcsOperations): Promise<WorkflowsResult> {
    try {
      if (!provider.disableWorkflow) {
        return {
          success: false,
          action: 'disable-workflow',
          message: 'Funcionalidade não suportada por este provider',
          error: 'Provider não implementa disableWorkflow'
        };
      }
      
      const result = await provider.disableWorkflow({
        owner: params.owner!,
        repo: params.repo!,
        workflow_id: params.workflow_id!,
        workflow_name: params.workflow_name
      });
      
      return {
        success: true,
        action: 'disable',
        message: `Workflow desabilitado com sucesso`,
        data: result
      };
    } catch (error) {
      throw new Error(`Falha ao desabilitar workflow: ${error}`);
    }
  },

  /**
   * Habilita workflow
   */
  async enableWorkflow(params: WorkflowsInput, provider: VcsOperations): Promise<WorkflowsResult> {
    try {
      if (!provider.enableWorkflow) {
        return {
          success: false,
          action: 'enable-workflow',
          message: 'Funcionalidade não suportada por este provider',
          error: 'Provider não implementa enableWorkflow'
        };
      }
      
      const result = await provider.enableWorkflow({
        owner: params.owner!,
        repo: params.repo!,
        workflow_id: params.workflow_id!,
        workflow_name: params.workflow_name
      });
      
      return {
        success: true,
        action: 'enable',
        message: `Workflow habilitado com sucesso`,
        data: result
      };
    } catch (error) {
      throw new Error(`Falha ao habilitar workflow: ${error}`);
    }
  }
};