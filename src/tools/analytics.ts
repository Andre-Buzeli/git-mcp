import { z } from 'zod';
import { globalProviderFactory, VcsOperations } from '../providers/index.js';
import { applyAutoUserDetection } from '../utils/user-detection.js';
import { ToolValidator, CommonSchemas, ToolSchemas } from './validator.js';

/**
 * Tool: analytics
 * 
 * DESCRIÇÃO:
 * Gerenciamento completo de analytics e insights com múltiplas ações
 * 
 * FUNCIONALIDADES:
 * - Estatísticas de tráfego
 * - Análise de contribuidores
 * - Atividade do repositório
 * - Métricas de performance
 * - Geração de relatórios customizados
 * - Análise de tendências
 * 
 * USO:
 * - Para monitorar performance do repositório
 * - Para análise de contribuições
 * - Para relatórios de atividade
 * - Para insights de desenvolvimento
 * 
 * RECOMENDAÇÕES:
 * - Monitore métricas regularmente
 * - Use insights para melhorar workflow
 * - Gere relatórios periódicos
 * - Analise tendências de contribuição
 */

/**
 * Schema de validação para entrada da tool analytics
 */
const AnalyticsInputSchema = z.object({
  action: z.enum(['traffic', 'contributors', 'activity', 'performance', 'reports', 'trends', 'insights']),
  
  // Parâmetros comuns
  owner: CommonSchemas.owner,
  repo: CommonSchemas.repo,
  provider: CommonSchemas.provider,
  
  // Parâmetros para listagem
  page: CommonSchemas.page,
  limit: CommonSchemas.limit,
  
  // Parâmetros de período
  period: z.enum(['day', 'week', 'month', 'quarter', 'year']).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  
  // Parâmetros para tráfego
  metric_type: z.enum(['views', 'clones', 'visitors', 'unique_visitors']).optional(),
  
  // Parâmetros para contribuidores
  contributor_type: z.enum(['all', 'internal', 'external', 'bots']).optional(),
  sort_by: z.enum(['commits', 'additions', 'deletions', 'contributions']).optional(),
  
  // Parâmetros para atividade
  activity_type: z.enum(['commits', 'issues', 'pulls', 'releases', 'all']).optional(),
  branch: CommonSchemas.branch,
  
  // Parâmetros para performance
  performance_metric: z.enum(['build_time', 'test_coverage', 'code_quality', 'deployment_frequency']).optional(),
  
  // Parâmetros para relatórios
  report_type: z.enum(['summary', 'detailed', 'trends', 'comparison']).optional(),
  report_format: z.enum(['json', 'csv', 'pdf', 'html']).optional(),
  include_charts: CommonSchemas.boolean,
  
  // Parâmetros para trends
  trend_metric: z.enum(['commits', 'contributors', 'issues', 'stars', 'forks']).optional(),
  trend_period: z.enum(['daily', 'weekly', 'monthly']).optional(),
  
  // Filtros
  author: CommonSchemas.shortString,
  path: CommonSchemas.mediumString,
  file_type: CommonSchemas.shortString
}).refine((data) => {
  return data.owner && data.repo;
}, {
  message: "Owner e repo são obrigatórios"
});

export type AnalyticsInput = z.infer<typeof AnalyticsInputSchema>;

/**
 * Schema de validação para resultado da tool analytics
 */
const AnalyticsResultSchema = z.object({
  success: z.boolean(),
  action: z.string(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional()
});

export type AnalyticsResult = z.infer<typeof AnalyticsResultSchema>;

/**
 * Implementação da tool analytics
 */
export const analyticsTool = {
  name: 'analytics',
  description: 'Geração completa de insights e métricas de repositório: traffic (estatísticas de tráfego), contributors (análise de contribuidores), activity (atividade do repositório), performance (métricas de performance), reports (relatórios customizados), trends (análise de tendências). Suporte simultâneo para GitHub Insights e Gitea Analytics. Boas práticas: monitore métricas regularmente, use insights para melhorar workflow, gere relatórios periódicos e analise tendências de contribuição. Uso eficiente: análise de performance, tomada de decisões baseada em dados, otimização de processos de desenvolvimento.',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['traffic', 'contributors', 'activity', 'performance', 'reports', 'trends', 'insights'],
        description: 'Ação a executar: traffic (tráfego), contributors (contribuidores), activity (atividade), performance (performance), reports (relatórios), trends (tendências), insights (insights gerais)'
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
      period: {
        type: 'string',
        enum: ['day', 'week', 'month', 'quarter', 'year'],
        description: 'Período de análise (padrão: week para traffic, month para outros)'
      },
      start_date: {
        type: 'string',
        description: 'Data inicial para análise (formato: YYYY-MM-DD)'
      },
      end_date: {
        type: 'string',
        description: 'Data final para análise (formato: YYYY-MM-DD)'
      },
      metric_type: {
        type: 'string',
        enum: ['views', 'clones', 'visitors', 'unique_visitors'],
        description: 'Tipo de métrica de tráfego (OBRIGATÓRIO para traffic, padrão: views)'
      },
      contributor_type: {
        type: 'string',
        enum: ['all', 'internal', 'external', 'bots'],
        description: 'Tipo de contribuidores (padrão: all)'
      },
      sort_by: {
        type: 'string',
        enum: ['commits', 'additions', 'deletions', 'contributions'],
        description: 'Ordenar contribuidores por (padrão: commits)'
      },
      activity_type: {
        type: 'string',
        enum: ['commits', 'issues', 'pulls', 'releases', 'all'],
        description: 'Tipo de atividade (padrão: all)'
      },
      branch: {
        type: 'string',
        description: 'Branch específico para análise'
      },
      performance_metric: {
        type: 'string',
        enum: ['build_time', 'test_coverage', 'code_quality', 'deployment_frequency'],
        description: 'Métrica de performance específica'
      },
      report_type: {
        type: 'string',
        enum: ['summary', 'detailed', 'trends', 'comparison'],
        description: 'Tipo de relatório (padrão: summary)'
      },
      report_format: {
        type: 'string',
        enum: ['json', 'csv', 'pdf', 'html'],
        description: 'Formato do relatório (padrão: json)'
      },
      include_charts: {
        type: 'boolean',
        description: 'Incluir gráficos no relatório (padrão: false)'
      },
      trend_metric: {
        type: 'string',
        enum: ['commits', 'contributors', 'issues', 'stars', 'forks'],
        description: 'Métrica para análise de tendências (padrão: commits)'
      },
      trend_period: {
        type: 'string',
        enum: ['daily', 'weekly', 'monthly'],
        description: 'Período para análise de tendências (padrão: weekly)'
      },
      author: {
        type: 'string',
        description: 'Filtrar por autor específico'
      },
      path: {
        type: 'string',
        description: 'Filtrar por caminho específico'
      },
      file_type: {
        type: 'string',
        description: 'Filtrar por tipo de arquivo'
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

  async handler(input: AnalyticsInput): Promise<AnalyticsResult> {
    try {
      const validatedInput = AnalyticsInputSchema.parse(input);

      // Aplicar auto-detecção de usuário
      const updatedParams = await applyAutoUserDetection(validatedInput, validatedInput.provider);
      const provider = updatedParams.provider

        ? globalProviderFactory.getProvider(updatedParams.provider)

        : globalProviderFactory.getDefaultProvider();
      
      if (!provider) {
        throw new Error(`Provider '${updatedParams.provider}' não encontrado`);
      }
      
      switch (updatedParams.action) {
        case 'traffic':
          return await this.analyzeContributors(updatedParams, provider);
        case 'contributors':
          return await this.getActivityStats(updatedParams, provider);
        case 'activity':
          return await this.getPerformanceMetrics(updatedParams, provider);
        case 'performance':
          return await this.generateReports(updatedParams, provider);
        case 'reports':
          return await this.analyzeTrends(updatedParams, provider);
        case 'trends':
          return await this.getRepositoryInsights(updatedParams, provider);
        case 'insights':
          return await this.getRepositoryInsights(updatedParams, provider);
        default:
          throw new Error(`Ação não suportada: ${updatedParams.action}`);
      }
    } catch (error) {
      return {
        success: false,
        action: input.action || 'unknown',
        message: 'Erro na operação de analytics',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  /**
   * Obtém estatísticas de tráfego
   */
  async getTrafficStats(params: AnalyticsInput, provider: VcsOperations): Promise<AnalyticsResult> {
    try {
      // Auto-detecção de owner/username se não fornecidos
      let updatedParams = { ...params };
      if (!updatedParams.owner) {
        try {
          const currentUser = await provider.getCurrentUser();
          updatedParams.owner = currentUser.login;
        } catch (error) {
          console.warn('[ANALYTICS.TS] Falha na auto-detecção de usuário');
        }
      }

      
      if (!provider.getTrafficStats) {
        return {
          success: false,
          action: 'get-traffic-stats',
          message: 'Funcionalidade não suportada por este provider',
          error: 'Provider não implementa getTrafficStats'
        };
      }
      
      const result = await provider.getTrafficStats({
        owner: params.owner!,
        repo: params.repo!,
        metric_type: params.metric_type || 'views',
        period: params.period || 'week',
        start_date: params.start_date,
        end_date: params.end_date
      });
      
      return {
        success: true,
        action: 'traffic',
        message: `Estatísticas de tráfego obtidas com sucesso`,
        data: result
      };
    } catch (error) {
      throw new Error(`Falha ao obter estatísticas de tráfego: ${error}`);
    }
  },

  /**
   * Analisa contribuidores
   */
  async analyzeContributors(params: AnalyticsInput, provider: VcsOperations): Promise<AnalyticsResult> {
    try {
      if (!provider.analyzeContributors) {
        return {
          success: false,
          action: 'analyze-contributors',
          message: 'Funcionalidade não suportada por este provider',
          error: 'Provider não implementa analyzeContributors'
        };
      }
      
      const result = await provider.analyzeContributors({
        owner: params.owner!,
        repo: params.repo!,
        contributor_type: params.contributor_type || 'all',
        sort_by: params.sort_by || 'commits',
        period: params.period,
        start_date: params.start_date,
        end_date: params.end_date,
        page: params.page,
        limit: params.limit
      });
      
      return {
        success: true,
        action: 'contributors',
        message: `Análise de contribuidores executada com sucesso`,
        data: result
      };
    } catch (error) {
      throw new Error(`Falha ao analisar contribuidores: ${error}`);
    }
  },

  /**
   * Obtém estatísticas de atividade
   */
  async getActivityStats(params: AnalyticsInput, provider: VcsOperations): Promise<AnalyticsResult> {
    try {
      // Auto-detecção de owner/username se não fornecidos
      let updatedParams = { ...params };
      if (!updatedParams.owner) {
        try {
          const currentUser = await provider.getCurrentUser();
          updatedParams.owner = currentUser.login;
        } catch (error) {
          console.warn('[ANALYTICS.TS] Falha na auto-detecção de usuário');
        }
      }

      
      if (!provider.getActivityStats) {
        return {
          success: false,
          action: 'get-activity-stats',
          message: 'Funcionalidade não suportada por este provider',
          error: 'Provider não implementa getActivityStats'
        };
      }
      
      const result = await provider.getActivityStats({
        owner: params.owner!,
        repo: params.repo!,
        activity_type: params.activity_type || 'all',
        branch: params.branch,
        author: params.author,
        period: params.period || 'month',
        start_date: params.start_date,
        end_date: params.end_date
      });
      
      return {
        success: true,
        action: 'activity',
        message: `Estatísticas de atividade obtidas com sucesso`,
        data: result
      };
    } catch (error) {
      throw new Error(`Falha ao obter estatísticas de atividade: ${error}`);
    }
  },

  /**
   * Obtém métricas de performance
   */
  async getPerformanceMetrics(params: AnalyticsInput, provider: VcsOperations): Promise<AnalyticsResult> {
    try {
      // Auto-detecção de owner/username se não fornecidos
      let updatedParams = { ...params };
      if (!updatedParams.owner) {
        try {
          const currentUser = await provider.getCurrentUser();
          updatedParams.owner = currentUser.login;
        } catch (error) {
          console.warn('[ANALYTICS.TS] Falha na auto-detecção de usuário');
        }
      }

      
      if (!provider.getPerformanceMetrics) {
        return {
          success: false,
          action: 'get-performance-metrics',
          message: 'Funcionalidade não suportada por este provider',
          error: 'Provider não implementa getPerformanceMetrics'
        };
      }
      
      const result = await provider.getPerformanceMetrics({
        owner: params.owner!,
        repo: params.repo!,
        performance_metric: params.performance_metric,
        period: params.period || 'month',
        start_date: params.start_date,
        end_date: params.end_date
      });
      
      return {
        success: true,
        action: 'performance',
        message: `Métricas de performance obtidas com sucesso`,
        data: result
      };
    } catch (error) {
      throw new Error(`Falha ao obter métricas de performance: ${error}`);
    }
  },

  /**
   * Gera relatórios customizados
   */
  async generateReports(params: AnalyticsInput, provider: VcsOperations): Promise<AnalyticsResult> {
    try {
      if (!provider.generateReports) {
        return {
          success: false,
          action: 'generate-reports',
          message: 'Funcionalidade não suportada por este provider',
          error: 'Provider não implementa generateReports'
        };
      }
      
      const result = await provider.generateReports({
        owner: params.owner!,
        repo: params.repo!,
        report_type: params.report_type || 'summary',
        report_format: params.report_format || 'json',
        include_charts: params.include_charts || false,
        period: params.period || 'month',
        start_date: params.start_date,
        end_date: params.end_date
      });
      
      return {
        success: true,
        action: 'reports',
        message: `Relatório gerado com sucesso`,
        data: result
      };
    } catch (error) {
      throw new Error(`Falha ao gerar relatório: ${error}`);
    }
  },

  /**
   * Analisa tendências
   */
  async analyzeTrends(params: AnalyticsInput, provider: VcsOperations): Promise<AnalyticsResult> {
    try {
      if (!provider.analyzeTrends) {
        return {
          success: false,
          action: 'analyze-trends',
          message: 'Funcionalidade não suportada por este provider',
          error: 'Provider não implementa analyzeTrends'
        };
      }
      
      const result = await provider.analyzeTrends({
        owner: params.owner!,
        repo: params.repo!,
        trend_metric: params.trend_metric || 'commits',
        trend_period: params.trend_period || 'weekly',
        period: params.period || 'quarter',
        start_date: params.start_date,
        end_date: params.end_date
      });
      
      return {
        success: true,
        action: 'trends',
        message: `Análise de tendências executada com sucesso`,
        data: result
      };
    } catch (error) {
      throw new Error(`Falha ao analisar tendências: ${error}`);
    }
  },

  /**
   * Obtém insights gerais do repositório
   */
  async getRepositoryInsights(params: AnalyticsInput, provider: VcsOperations): Promise<AnalyticsResult> {
    try {
      // Auto-detecção de owner/username se não fornecidos
      let updatedParams = { ...params };
      if (!updatedParams.owner) {
        try {
          const currentUser = await provider.getCurrentUser();
          updatedParams.owner = currentUser.login;
        } catch (error) {
          console.warn('[ANALYTICS.TS] Falha na auto-detecção de usuário');
        }
      }

      
      if (!provider.getRepositoryInsights) {
        return {
          success: true,
          action: 'insights',
          message: 'Funcionalidade de analytics/insights não suportada por este provider',
          data: {
            period: params.period || 'month',
            metrics: {},
            note: 'Insights não disponíveis neste provider'
          }
        };
      }
      
      const result = await provider.getRepositoryInsights({
        owner: params.owner!,
        repo: params.repo!,
        period: params.period || 'month',
        start_date: params.start_date,
        end_date: params.end_date,
        include_charts: params.include_charts || true
      });
      
      return {
        success: true,
        action: 'insights',
        message: `Insights do repositório obtidos com sucesso`,
        data: result
      };
    } catch (error) {
      throw new Error(`Falha ao obter insights do repositório: ${error}`);
    }
  }
};