import { z } from 'zod';
import { globalProviderFactory, VcsOperations } from '../providers/index.js';
import { applyAutoUserDetection } from '../utils/user-detection.js';
import { ToolValidator, CommonSchemas, ToolSchemas } from './validator.js';

/**
 * Tool: security
 * 
 * DESCRIÇÃO:
 * Gerenciamento completo de segurança e compliance com múltiplas ações
 * 
 * FUNCIONALIDADES:
 * - Execução de scans de segurança
 * - Listagem de vulnerabilidades
 * - Gerenciamento de alertas de segurança
 * - Configuração de políticas de segurança
 * - Verificação de compliance
 * - Análise de dependências
 * 
 * USO:
 * - Para monitorar vulnerabilidades
 * - Para configurar políticas de segurança
 * - Para compliance e auditoria
 * - Para análise de dependências
 * 
 * RECOMENDAÇÕES:
 * - Execute scans regularmente
 * - Configure alertas automáticos
 * - Mantenha dependências atualizadas
 * - Implemente políticas rigorosas
 */

/**
 * Schema de validação para entrada da tool security
 */
const SecurityInputSchema = z.object({
  action: z.enum(['scan', 'vulnerabilities', 'alerts', 'policies', 'compliance', 'dependencies', 'advisories']),
  
  // Parâmetros comuns
  repo: CommonSchemas.repo,
  provider: CommonSchemas.provider,
  
  // Parâmetros para listagem
  page: CommonSchemas.page,
  limit: CommonSchemas.limit,
  
  // Parâmetros para scan
  scan_type: z.enum(['code', 'dependencies', 'secrets', 'infrastructure']).optional(),
  ref: CommonSchemas.branch,
  
  // Parâmetros para vulnerabilidades
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  state: z.enum(['open', 'fixed', 'dismissed']).optional(),
  ecosystem: CommonSchemas.shortString,
  package_name: CommonSchemas.shortString,
  
  // Parâmetros para alertas
  alert_id: CommonSchemas.shortString,
  alert_number: z.number().optional(),
  dismiss_reason: z.enum(['fix_started', 'inaccurate', 'no_bandwidth', 'not_used', 'tolerable_risk']).optional(),
  dismiss_comment: CommonSchemas.mediumString,
  
  // Parâmetros para políticas
  policy_name: CommonSchemas.shortString,
  policy_type: z.enum(['branch_protection', 'required_reviews', 'status_checks', 'restrictions']).optional(),
  policy_config: z.record(z.any()).optional(),
  
  // Parâmetros para compliance
  compliance_framework: z.enum(['sox', 'pci', 'hipaa', 'gdpr', 'iso27001']).optional(),
  report_format: z.enum(['json', 'csv', 'pdf']).optional(),
  
  // Filtros
  created_after: z.string().optional(),
  created_before: z.string().optional(),
  updated_after: z.string().optional(),
  updated_before: z.string().optional()
});

export type SecurityInput = z.infer<typeof SecurityInputSchema>;

/**
 * Schema de validação para resultado da tool security
 */
const SecurityResultSchema = z.object({
  success: z.boolean(),
  action: z.string(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional()
});

export type SecurityResult = z.infer<typeof SecurityResultSchema>;

/**
 * Implementação da tool security
 */
export const securityTool = {
  name: 'gh-security',
  description: 'Gerenciamento completo de GitHub Security (EXCLUSIVO GITHUB).\n\nACTIONS DISPONÍVEIS:\n• scan: Executa scan de segurança\n  - OBRIGATÓRIOS: repo, scan_type\n  - OPCIONAIS: ref\n\n• vulnerabilities: Lista vulnerabilidades\n  - OBRIGATÓRIOS: repo\n  - OPCIONAIS: severity, state, ecosystem, package_name, page, limit\n\n• alerts: Lista alertas de segurança\n  - OBRIGATÓRIOS: repo\n  - OPCIONAIS: alert_id, alert_number, state, page, limit\n\n• policies: Gerencia políticas de segurança\n  - OBRIGATÓRIOS: repo\n  - OPCIONAIS: policy_name, policy_type, policy_config\n\n• compliance: Verifica conformidade\n  - OBRIGATÓRIOS: repo\n  - OPCIONAIS: compliance_framework, report_format\n\n• dependencies: Analisa dependências\n  - OBRIGATÓRIOS: repo\n  - OPCIONAIS: ecosystem, package_name, page, limit\n\n• advisories: Lista avisos de segurança\n  - OBRIGATÓRIOS: repo\n  - OPCIONAIS: ecosystem, package_name, page, limit\n\nPARÂMETROS COMUNS:\n• repo: Nome do repositório\n• provider: Fixo como "github"\n• owner: Fixo como usuário do GitHub\n\nBoas práticas: execute scans regularmente, configure alertas automáticos, mantenha dependências atualizadas.',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['scan', 'vulnerabilities', 'alerts', 'policies', 'compliance', 'dependencies', 'advisories'],
        description: 'Action to perform on security'
      },
      repo: { type: 'string', description: 'Repository name' },
      scan_type: { type: 'string', enum: ['code', 'dependencies', 'secrets', 'infrastructure'], description: 'Type of security scan' },
      ref: { type: 'string', description: 'Git reference to scan' },
      severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'], description: 'Vulnerability severity filter' },
      state: { type: 'string', enum: ['open', 'fixed', 'dismissed'], description: 'Vulnerability state filter' },
      ecosystem: { type: 'string', description: 'Package ecosystem' },
      package_name: { type: 'string', description: 'Package name' },
      alert_id: { type: 'string', description: 'Security alert ID' },
      alert_number: { type: 'number', description: 'Security alert number' },
      dismiss_reason: { type: 'string', enum: ['fix_started', 'inaccurate', 'no_bandwidth', 'not_used', 'tolerable_risk'], description: 'Reason for dismissing alert' },
      dismiss_comment: { type: 'string', description: 'Comment for dismissing alert' },
      policy_name: { type: 'string', description: 'Security policy name' },
      policy_type: { type: 'string', enum: ['branch_protection', 'required_reviews', 'status_checks', 'restrictions'], description: 'Security policy type' },
      policy_config: { type: 'object', description: 'Security policy configuration' },
      compliance_framework: { type: 'string', enum: ['sox', 'pci', 'hipaa', 'gdpr', 'iso27001'], description: 'Compliance framework' },
      report_format: { type: 'string', enum: ['json', 'csv', 'pdf'], description: 'Report format' },
      created_after: { type: 'string', description: 'Filter items created after date' },
      created_before: { type: 'string', description: 'Filter items created before date' },
      updated_after: { type: 'string', description: 'Filter items updated after date' },
      updated_before: { type: 'string', description: 'Filter items updated before date' },
      page: { type: 'number', description: 'Page number', minimum: 1 },
      limit: { type: 'number', description: 'Items per page', minimum: 1, maximum: 100 }
    },
    required: ['action', 'repo']
  },

  async handler(input: SecurityInput): Promise<SecurityResult> {
    try {
      const validatedInput = SecurityInputSchema.parse(input);

      // Fixar provider como github para tools exclusivas do GitHub
      const updatedParams = await applyAutoUserDetection(validatedInput, 'github');
      const provider = globalProviderFactory.getProvider('github');
      
      if (!provider) {
        throw new Error('Provider GitHub não encontrado');
      }
      
      switch (updatedParams.action) {
        case 'scan':
          return await this.runSecurityScan(updatedParams, provider);
        case 'vulnerabilities':
          return await this.listVulnerabilities(updatedParams, provider);
        case 'alerts':
          return await this.manageSecurityAlerts(updatedParams, provider);
        case 'policies':
          return await this.manageSecurityPolicies(updatedParams, provider);
        case 'compliance':
          return await this.checkCompliance(updatedParams, provider);
        case 'dependencies':
          return await this.analyzeDependencies(updatedParams, provider);
        case 'advisories':
          return await this.listSecurityAdvisories(updatedParams, provider);
        default:
          throw new Error(`Ação não suportada: ${updatedParams.action}`);
      }
    } catch (error) {
      return {
        success: false,
        action: input.action || 'unknown',
        message: 'Erro na operação de security',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  /**
   * Executa scan de segurança
   */
  async runSecurityScan(params: SecurityInput, provider: VcsOperations): Promise<SecurityResult> {
    try {
      if (!provider.runSecurityScan) {
        return {
          success: true,
          action: 'scan',
          message: 'Funcionalidade de security scan não suportada por este provider',
          data: {
            scan_type: params.scan_type || 'code',
            findings: [],
            note: 'Security scan não disponível neste provider'
          }
        };
      }
      
      const result = await provider.runSecurityScan({
        owner: (await provider.getCurrentUser()).login,
        repo: params.repo!,
        scan_type: params.scan_type || 'code',
        ref: params.ref || 'main'
      });
      
      return {
        success: true,
        action: 'scan',
        message: `Scan de segurança executado com sucesso`,
        data: result
      };
    } catch (error) {
      throw new Error(`Falha ao executar scan de segurança: ${error}`);
    }
  },

  /**
   * Lista vulnerabilidades
   */
  async listVulnerabilities(params: SecurityInput, provider: VcsOperations): Promise<SecurityResult> {
    try {
      // Auto-detecção de owner/username se não fornecidos
      let updatedParams = { ...params };
      const currentUser = await provider.getCurrentUser();
      const owner = currentUser.login;

      
      if (!provider.listSecurityVulnerabilities) {
        return {
          success: true,
          action: 'vulnerabilities',
          message: 'Funcionalidade de vulnerabilidades não suportada por este provider',
          data: {
            total_count: 0,
            vulnerabilities: [],
            note: 'Vulnerabilidades não disponíveis neste provider'
          }
        };
      }
      
      const result = await provider.listSecurityVulnerabilities({
        owner: (await provider.getCurrentUser()).login,
        repo: params.repo!,
        severity: params.severity,
        state: params.state,
        ecosystem: params.ecosystem,
        package_name: params.package_name,
        page: params.page,
        limit: params.limit
      });
      
      return {
        success: true,
        action: 'vulnerabilities',
        message: `${result.vulnerabilities?.length || 0} vulnerabilidades encontradas`,
        data: result
      };
    } catch (error) {
      throw new Error(`Falha ao listar vulnerabilidades: ${error}`);
    }
  },

  /**
   * Gerencia alertas de segurança
   */
  async manageSecurityAlerts(params: SecurityInput, provider: VcsOperations): Promise<SecurityResult> {
    try {
      if (!provider.manageSecurityAlerts) {
        return {
          success: false,
          action: 'manage-security-alerts',
          message: 'Funcionalidade não suportada por este provider',
          error: 'Provider não implementa manageSecurityAlerts'
        };
      }
      
      const result = await provider.manageSecurityAlerts({
        owner: (await provider.getCurrentUser()).login,
        repo: params.repo!,
        action: 'dismiss', // ou 'reopen' baseado nos parâmetros
        alert_number: params.alert_number,
        dismiss_reason: params.dismiss_reason,
        dismiss_comment: params.dismiss_comment
      });
      
      return {
        success: true,
        action: 'alerts',
        message: `Alertas de segurança gerenciados com sucesso`,
        data: result
      };
    } catch (error) {
      throw new Error(`Falha ao gerenciar alertas de segurança: ${error}`);
    }
  },

  /**
   * Gerencia políticas de segurança
   */
  async manageSecurityPolicies(params: SecurityInput, provider: VcsOperations): Promise<SecurityResult> {
    try {
      if (!provider.manageSecurityPolicies) {
        return {
          success: false,
          action: 'manage-security-policies',
          message: 'Funcionalidade não suportada por este provider',
          error: 'Provider não implementa manageSecurityPolicies'
        };
      }
      
      const result = await provider.manageSecurityPolicies({
        owner: (await provider.getCurrentUser()).login,
        repo: params.repo!,
        policy_name: params.policy_name,
        policy_type: params.policy_type,
        policy_config: params.policy_config,
        page: params.page,
        limit: params.limit
      });
      
      return {
        success: true,
        action: 'policies',
        message: `Políticas de segurança gerenciadas com sucesso`,
        data: result
      };
    } catch (error) {
      throw new Error(`Falha ao gerenciar políticas de segurança: ${error}`);
    }
  },

  /**
   * Verifica compliance
   */
  async checkCompliance(params: SecurityInput, provider: VcsOperations): Promise<SecurityResult> {
    try {
      if (!provider.checkCompliance) {
        return {
          success: false,
          action: 'check-compliance',
          message: 'Funcionalidade não suportada por este provider',
          error: 'Provider não implementa checkCompliance'
        };
      }
      
      const result = await provider.checkCompliance({
        owner: (await provider.getCurrentUser()).login,
        repo: params.repo!,
        framework: params.compliance_framework,
        report_format: params.report_format || 'json'
      });
      
      return {
        success: true,
        action: 'compliance',
        message: `Verificação de compliance executada com sucesso`,
        data: result
      };
    } catch (error) {
      throw new Error(`Falha ao verificar compliance: ${error}`);
    }
  },

  /**
   * Analisa dependências
   */
  async analyzeDependencies(params: SecurityInput, provider: VcsOperations): Promise<SecurityResult> {
    try {
      if (!provider.analyzeDependencies) {
        return {
          success: false,
          action: 'analyze-dependencies',
          message: 'Funcionalidade não suportada por este provider',
          error: 'Provider não implementa analyzeDependencies'
        };
      }
      
      const result = await provider.analyzeDependencies({
        owner: (await provider.getCurrentUser()).login,
        repo: params.repo!,
        ecosystem: params.ecosystem,
        package: params.package_name,
        ref: params.ref
      });
      
      return {
        success: true,
        action: 'dependencies',
        message: `Análise de dependências executada com sucesso`,
        data: result
      };
    } catch (error) {
      throw new Error(`Falha ao analisar dependências: ${error}`);
    }
  },

  /**
   * Lista advisories de segurança
   */
  async listSecurityAdvisories(params: SecurityInput, provider: VcsOperations): Promise<SecurityResult> {
    try {
      // Auto-detecção de owner/username se não fornecidos
      let updatedParams = { ...params };
      const currentUser = await provider.getCurrentUser();
      const owner = currentUser.login;

      
      if (!provider.listSecurityAdvisories) {
        return {
          success: false,
          action: 'list-security-advisories',
          message: 'Funcionalidade não suportada por este provider',
          error: 'Provider não implementa listSecurityAdvisories'
        };
      }
      
      const result = await provider.listSecurityAdvisories({
        owner: (await provider.getCurrentUser()).login,
        repo: params.repo!,
        severity: params.severity,
        ecosystem: params.ecosystem,
        package: params.package_name,
        page: params.page,
        limit: params.limit
      });
      
      return {
        success: true,
        action: 'advisories',
        message: `${result.advisories?.length || 0} advisories encontrados`,
        data: result
      };
    } catch (error) {
      throw new Error(`Falha ao listar advisories: ${error}`);
    }
  }
};