import { z } from 'zod';
import { globalProviderFactory, VcsOperations } from '../providers/index.js';
import { applyAutoUserDetection } from '../utils/user-detection.js';
import { ToolValidator, CommonSchemas, ToolSchemas } from './validator.js';

/**
 * Tool: actions
 * 
 * DESCRIÇÃO:
 * Gerenciamento completo de GitHub Actions com múltiplas ações
 * 
 * FUNCIONALIDADES:
 * - Listagem de execuções de actions
 * - Cancelamento de execuções
 * - Re-execução de actions falhadas
 * - Gerenciamento de artefatos
 * - Gerenciamento de secrets (read-only)
 * - Monitoramento de jobs
 * 
 * USO:
 * - Para monitorar execuções de CI/CD
 * - Para gerenciar artefatos de build
 * - Para troubleshooting de falhas
 * - Para automação de re-execuções
 * 
 * RECOMENDAÇÕES:
 * - Monitore execuções regularmente
 * - Limpe artefatos antigos
 * - Use re-execução apenas quando necessário
 * - Mantenha secrets seguros
 */

/**
 * Schema de validação para entrada da tool actions
 */
const ActionsInputSchema = z.object({
  action: z.enum(['list-runs', 'cancel', 'rerun', 'artifacts', 'secrets', 'jobs', 'download-artifact']),
  
  // Parâmetros comuns
  owner: CommonSchemas.owner,
  repo: CommonSchemas.repo,
  provider: CommonSchemas.provider,
  
  // Parâmetros para listagem
  page: CommonSchemas.page,
  limit: CommonSchemas.limit,
  
  // Parâmetros para runs
  run_id: CommonSchemas.shortString,
  workflow_id: CommonSchemas.shortString,
  status: z.enum(['queued', 'in_progress', 'completed', 'cancelled', 'failure', 'success']).optional(),
  branch: CommonSchemas.branch,
  event: CommonSchemas.shortString,
  
  // Parâmetros para jobs
  job_id: CommonSchemas.shortString,
  
  // Parâmetros para artefatos
  artifact_id: CommonSchemas.shortString,
  artifact_name: CommonSchemas.shortString,
  download_path: CommonSchemas.mediumString,
  
  // Parâmetros para secrets
  secret_name: CommonSchemas.shortString,
  
  // Filtros de data
  created_after: z.string().optional(),
  created_before: z.string().optional()
}).refine((data) => {
  // Validações específicas por ação
  if (['cancel', 'rerun', 'jobs'].includes(data.action)) {
    return data.owner && data.repo && data.run_id;
  }
  if (['download-artifact'].includes(data.action)) {
    return data.owner && data.repo && (data.artifact_id || data.artifact_name);
  }
  return data.owner && data.repo;
}, {
  message: "Parâmetros obrigatórios não fornecidos para a ação especificada"
});

export type ActionsInput = z.infer<typeof ActionsInputSchema>;

/**
 * Schema de validação para resultado da tool actions
 */
const ActionsResultSchema = z.object({
  success: z.boolean(),
  action: z.string(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional()
});

export type ActionsResult = z.infer<typeof ActionsResultSchema>;

/**
 * Implementação da tool actions
 */
export const actionsTool = {
  name: 'actions',
  description: 'Gerenciamento completo de GitHub Actions e Gitea Actions com múltiplas operações: list-runs (lista execuções), cancel (cancela execução), rerun (re-executa workflow), artifacts (gerencia artefatos), secrets (lista secrets), jobs (lista jobs). Suporte simultâneo para GitHub Actions e Gitea Actions. Boas práticas: monitore execuções regularmente, limpe artefatos antigos, use re-execução apenas quando necessário e mantenha secrets seguros. Uso eficiente: ideal para CI/CD, debugging de pipelines e automação de workflows.',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['list-runs', 'cancel', 'rerun', 'artifacts', 'secrets', 'jobs', 'download-artifact'],
        description: 'Ação a executar: list-runs (lista execuções), cancel (cancela), rerun (re-executa), artifacts (artefatos), secrets (lista secrets), jobs (lista jobs), download-artifact (baixa artefato)'
      },
      owner: {
        type: 'string',
        description: 'Proprietário do repositório (OBRIGATÓRIO para todas as ações)'
      },
      repo: {
        type: 'string',
        description: 'Nome do repositório (OBRIGATÓRIO para todas as ações)'
      },
      provider: {
        type: 'string',
        description: 'Provider específico (github, gitea) ou usa padrão'
      },
      run_id: {
        type: 'string',
        description: 'ID da execução do workflow (OBRIGATÓRIO para cancel, rerun, jobs)'
      },
      workflow_id: {
        type: 'string',
        description: 'ID do workflow (OPCIONAL para list-runs)'
      },
      status: {
        type: 'string',
        enum: ['queued', 'in_progress', 'completed', 'cancelled', 'failure', 'success'],
        description: 'Status da execução para filtrar (OPCIONAL para list-runs)'
      },
      branch: {
        type: 'string',
        description: 'Branch para filtrar execuções (OPCIONAL para list-runs)'
      },
      event: {
        type: 'string',
        description: 'Evento que disparou a execução (OPCIONAL para list-runs)'
      },
      job_id: {
        type: 'string',
        description: 'ID do job específico (OBRIGATÓRIO para jobs)'
      },
      artifact_id: {
        type: 'string',
        description: 'ID do artefato (OBRIGATÓRIO para download-artifact se não usar artifact_name)'
      },
      artifact_name: {
        type: 'string',
        description: 'Nome do artefato (OBRIGATÓRIO para download-artifact se não usar artifact_id)'
      },
      download_path: {
        type: 'string',
        description: 'Caminho local para salvar o artefato (OBRIGATÓRIO para download-artifact)'
      },
      secret_name: {
        type: 'string',
        description: 'Nome do secret específico (OPCIONAL para secrets)'
      },
      created_after: {
        type: 'string',
        description: 'Filtrar execuções criadas após esta data (OPCIONAL para list-runs)'
      },
      created_before: {
        type: 'string',
        description: 'Filtrar execuções criadas antes desta data (OPCIONAL para list-runs)'
      },
      page: {
        type: 'number',
        description: 'Página da listagem (mínimo: 1, padrão: 1)',
        minimum: 1
      },
      limit: {
        type: 'number',
        description: 'Itens por página (mínimo: 1, máximo: 100, padrão: 30)',
        minimum: 1,
        maximum: 100
      }
    },
    required: ['action']
  },

  async handler(input: ActionsInput): Promise<ActionsResult> {
    try {
      const validatedInput = ActionsInputSchema.parse(input);

      // Aplicar auto-detecção de usuário
      const updatedParams = await applyAutoUserDetection(validatedInput, validatedInput.provider);
      const provider = updatedParams.provider

        ? globalProviderFactory.getProvider(updatedParams.provider)

        : globalProviderFactory.getDefaultProvider();
      
      if (!provider) {
        throw new Error(`Provider '${updatedParams.provider}' não encontrado`);
      }
      
      switch (updatedParams.action) {
        case 'list-runs':
          return await this.listRuns(updatedParams, provider);
        case 'cancel':
          return await this.cancelRun(updatedParams, provider);
        case 'rerun':
          return await this.rerunWorkflow(updatedParams, provider);
        case 'artifacts':
          return await this.listArtifacts(updatedParams, provider);
        case 'secrets':
          return await this.listSecrets(updatedParams, provider);
        case 'jobs':
          return await this.listJobs(updatedParams, provider);
        case 'download-artifact':
          return await this.downloadArtifact(updatedParams, provider);
        default:
          throw new Error(`Ação não suportada: ${updatedParams.action}`);
      }
    } catch (error) {
      return {
        success: false,
        action: input.action || 'unknown',
        message: 'Erro na operação de actions',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  /**
   * Lista execuções de workflows
   */
  async listRuns(params: ActionsInput, provider: VcsOperations): Promise<ActionsResult> {
    try {
      // Auto-detecção de owner/username se não fornecidos
      let updatedParams = { ...params };
      if (!updatedParams.owner) {
        try {
          const currentUser = await provider.getCurrentUser();
          updatedParams.owner = currentUser.login;
        } catch (error) {
          console.warn('[ACTIONS.TS] Falha na auto-detecção de usuário');
        }
      }

      
      if (!provider.listWorkflowRuns) {
        return {
          success: true,
          action: 'list-runs',
          message: 'Funcionalidade de workflow runs não suportada por este provider',
          data: {
            total_count: 0,
            workflow_runs: [],
            note: 'Workflow runs não disponíveis neste provider'
          }
        };
      }
      
      const result = await provider.listWorkflowRuns({
        owner: params.owner!,
        repo: params.repo!,
        workflow_id: params.workflow_id,
        status: params.status,
        branch: params.branch,
        event: params.event,
        created_after: params.created_after,
        created_before: params.created_before,
        page: params.page,
        limit: params.limit
      });
      
      return {
        success: true,
        action: 'list-runs',
        message: `${result.runs?.length || 0} execuções encontradas`,
        data: result
      };
    } catch (error) {
      throw new Error(`Falha ao listar execuções: ${error}`);
    }
  },

  /**
   * Cancela execução de workflow
   */
  async cancelRun(params: ActionsInput, provider: VcsOperations): Promise<ActionsResult> {
    try {
      if (!provider.cancelWorkflowRun) {
        return {
          success: false,
          action: 'cancel',
          message: 'Funcionalidade não suportada por este provider',
          error: 'Provider não implementa cancelWorkflowRun'
        };
      }
      
      const result = await provider.cancelWorkflowRun({
        owner: params.owner!,
        repo: params.repo!,
        run_id: params.run_id!
      });
      
      return {
        success: true,
        action: 'cancel',
        message: `Execução cancelada com sucesso`,
        data: result
      };
    } catch (error) {
      throw new Error(`Falha ao cancelar execução: ${error}`);
    }
  },

  /**
   * Re-executa workflow
   */
  async rerunWorkflow(params: ActionsInput, provider: VcsOperations): Promise<ActionsResult> {
    try {
      if (!provider.rerunWorkflow) {
        return {
          success: false,
          action: 'rerun-workflow',
          message: 'Funcionalidade não suportada por este provider',
          error: 'Provider não implementa rerunWorkflow'
        };
      }
      
      const result = await provider.rerunWorkflow({
        owner: params.owner!,
        repo: params.repo!,
        run_id: params.run_id!
      });
      
      return {
        success: true,
        action: 'rerun',
        message: `Workflow re-executado com sucesso`,
        data: result
      };
    } catch (error) {
      throw new Error(`Falha ao re-executar workflow: ${error}`);
    }
  },

  /**
   * Lista artefatos
   */
  async listArtifacts(params: ActionsInput, provider: VcsOperations): Promise<ActionsResult> {
    try {
      // Auto-detecção de owner/username se não fornecidos
      let updatedParams = { ...params };
      if (!updatedParams.owner) {
        try {
          const currentUser = await provider.getCurrentUser();
          updatedParams.owner = currentUser.login;
        } catch (error) {
          console.warn('[ACTIONS.TS] Falha na auto-detecção de usuário');
        }
      }

      
      if (!provider.listArtifacts) {
        return {
          success: false,
          action: 'list-artifacts',
          message: 'Funcionalidade não suportada por este provider',
          error: 'Provider não implementa listArtifacts'
        };
      }
      
      const result = await provider.listArtifacts({
        owner: params.owner!,
        repo: params.repo!,
        run_id: params.run_id,
        page: params.page,
        limit: params.limit
      });
      
      return {
        success: true,
        action: 'artifacts',
        message: `${result.artifacts?.length || 0} artefatos encontrados`,
        data: result
      };
    } catch (error) {
      throw new Error(`Falha ao listar artefatos: ${error}`);
    }
  },

  /**
   * Lista secrets (read-only)
   */
  async listSecrets(params: ActionsInput, provider: VcsOperations): Promise<ActionsResult> {
    try {
      // Auto-detecção de owner/username se não fornecidos
      let updatedParams = { ...params };
      if (!updatedParams.owner) {
        try {
          const currentUser = await provider.getCurrentUser();
          updatedParams.owner = currentUser.login;
        } catch (error) {
          console.warn('[ACTIONS.TS] Falha na auto-detecção de usuário');
        }
      }

      
      if (!provider.listSecrets) {
        return {
          success: false,
          action: 'list-secrets',
          message: 'Funcionalidade não suportada por este provider',
          error: 'Provider não implementa listSecrets'
        };
      }
      
      const result = await provider.listSecrets({
        owner: params.owner!,
        repo: params.repo!,
        page: params.page,
        limit: params.limit
      });
      
      return {
        success: true,
        action: 'secrets',
        message: `${result.secrets?.length || 0} secrets encontrados`,
        data: result
      };
    } catch (error) {
      throw new Error(`Falha ao listar secrets: ${error}`);
    }
  },

  /**
   * Lista jobs de uma execução
   */
  async listJobs(params: ActionsInput, provider: VcsOperations): Promise<ActionsResult> {
    try {
      // Auto-detecção de owner/username se não fornecidos
      let updatedParams = { ...params };
      if (!updatedParams.owner) {
        try {
          const currentUser = await provider.getCurrentUser();
          updatedParams.owner = currentUser.login;
        } catch (error) {
          console.warn('[ACTIONS.TS] Falha na auto-detecção de usuário');
        }
      }

      
      if (!provider.listJobs) {
        return {
          success: false,
          action: 'list-jobs',
          message: 'Funcionalidade não suportada por este provider',
          error: 'Provider não implementa listJobs'
        };
      }
      
      const result = await provider.listJobs({
        owner: params.owner!,
        repo: params.repo!,
        run_id: params.run_id!,
        page: params.page,
        limit: params.limit
      });
      
      return {
        success: true,
        action: 'jobs',
        message: `${result.jobs?.length || 0} jobs encontrados`,
        data: result
      };
    } catch (error) {
      throw new Error(`Falha ao listar jobs: ${error}`);
    }
  },

  /**
   * Baixa artefato
   */
  async downloadArtifact(params: ActionsInput, provider: VcsOperations): Promise<ActionsResult> {
    try {
      if (!provider.downloadArtifact) {
        return {
          success: false,
          action: 'download-artifact',
          message: 'Funcionalidade não suportada por este provider',
          error: 'Provider não implementa downloadArtifact'
        };
      }
      
      const result = await provider.downloadArtifact({
        owner: params.owner!,
        repo: params.repo!,
        artifact_id: params.artifact_id,
        artifact_name: params.artifact_name,
        download_path: params.download_path
      });
      
      return {
        success: true,
        action: 'download-artifact',
        message: `Artefato baixado com sucesso`,
        data: result
      };
    } catch (error) {
      throw new Error(`Falha ao baixar artefato: ${error}`);
    }
  }
};