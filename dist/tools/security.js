"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityTool = void 0;
const zod_1 = require("zod");
const index_js_1 = require("../providers/index.js");
const user_detection_js_1 = require("../utils/user-detection.js");
const validator_js_1 = require("./validator.js");
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
const SecurityInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['scan', 'vulnerabilities', 'alerts', 'policies', 'compliance', 'dependencies', 'advisories']),
    // Parâmetros comuns
    owner: validator_js_1.CommonSchemas.owner,
    repo: validator_js_1.CommonSchemas.repo,
    provider: validator_js_1.CommonSchemas.provider,
    // Parâmetros para listagem
    page: validator_js_1.CommonSchemas.page,
    limit: validator_js_1.CommonSchemas.limit,
    // Parâmetros para scan
    scan_type: zod_1.z.enum(['code', 'dependencies', 'secrets', 'infrastructure']).optional(),
    ref: validator_js_1.CommonSchemas.branch,
    // Parâmetros para vulnerabilidades
    severity: zod_1.z.enum(['low', 'medium', 'high', 'critical']).optional(),
    state: zod_1.z.enum(['open', 'fixed', 'dismissed']).optional(),
    ecosystem: validator_js_1.CommonSchemas.shortString,
    package_name: validator_js_1.CommonSchemas.shortString,
    // Parâmetros para alertas
    alert_id: validator_js_1.CommonSchemas.shortString,
    alert_number: zod_1.z.number().optional(),
    dismiss_reason: zod_1.z.enum(['fix_started', 'inaccurate', 'no_bandwidth', 'not_used', 'tolerable_risk']).optional(),
    dismiss_comment: validator_js_1.CommonSchemas.mediumString,
    // Parâmetros para políticas
    policy_name: validator_js_1.CommonSchemas.shortString,
    policy_type: zod_1.z.enum(['branch_protection', 'required_reviews', 'status_checks', 'restrictions']).optional(),
    policy_config: zod_1.z.record(zod_1.z.any()).optional(),
    // Parâmetros para compliance
    compliance_framework: zod_1.z.enum(['sox', 'pci', 'hipaa', 'gdpr', 'iso27001']).optional(),
    report_format: zod_1.z.enum(['json', 'csv', 'pdf']).optional(),
    // Filtros
    created_after: zod_1.z.string().optional(),
    created_before: zod_1.z.string().optional(),
    updated_after: zod_1.z.string().optional(),
    updated_before: zod_1.z.string().optional()
}).refine((data) => {
    // Validações específicas por ação
    if (['alerts'].includes(data.action) && data.alert_id) {
        return data.owner && data.repo;
    }
    return data.owner && data.repo;
}, {
    message: "Parâmetros obrigatórios não fornecidos para a ação especificada"
});
/**
 * Schema de validação para resultado da tool security
 */
const SecurityResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    action: zod_1.z.string(),
    message: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional()
});
/**
 * Implementação da tool security
 */
exports.securityTool = {
    name: 'security',
    description: 'Manage security and compliance with multiple actions: scan, vulnerabilities, alerts, policies, compliance, dependencies. Suporte completo a GitHub Security e Gitea Security simultaneamente. Boas práticas: execute scans regularmente, configure alertas automáticos, mantenha dependências atualizadas e implemente políticas rigorosas.',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['scan', 'vulnerabilities', 'alerts', 'policies', 'compliance', 'dependencies', 'advisories'],
                description: 'Action to perform on security'
            },
            owner: { type: 'string', description: 'Repository owner' },
            repo: { type: 'string', description: 'Repository name' },
            provider: { type: 'string', description: 'Specific provider (github, gitea) or use default' },
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
        required: ['action', 'owner', 'repo', 'provider']
    },
    async handler(input) {
        try {
            const validatedInput = SecurityInputSchema.parse(input);
            // Aplicar auto-detecção de usuário
            const updatedParams = await (0, user_detection_js_1.applyAutoUserDetection)(validatedInput, validatedInput.provider);
            const provider = updatedParams.provider
                ? index_js_1.globalProviderFactory.getProvider(updatedParams.provider)
                : index_js_1.globalProviderFactory.getDefaultProvider();
            if (!provider) {
                throw new Error(`Provider '${updatedParams.provider}' não encontrado`);
            }
            switch (updatedParams.action) {
                case 'scan':
                    return await this.listVulnerabilities(updatedParams, provider);
                case 'vulnerabilities':
                    return await this.manageSecurityAlerts(updatedParams, provider);
                case 'alerts':
                    return await this.manageSecurityPolicies(updatedParams, provider);
                case 'policies':
                    return await this.checkCompliance(updatedParams, provider);
                case 'compliance':
                    return await this.analyzeDependencies(updatedParams, provider);
                case 'dependencies':
                    return await this.listSecurityAdvisories(updatedParams, provider);
                case 'advisories':
                    return await this.listSecurityAdvisories(updatedParams, provider);
                default:
                    throw new Error(`Ação não suportada: ${updatedParams.action}`);
            }
        }
        catch (error) {
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
    async runSecurityScan(params, provider) {
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
                owner: params.owner,
                repo: params.repo,
                scan_type: params.scan_type || 'code',
                ref: params.ref || 'main'
            });
            return {
                success: true,
                action: 'scan',
                message: `Scan de segurança executado com sucesso`,
                data: result
            };
        }
        catch (error) {
            throw new Error(`Falha ao executar scan de segurança: ${error}`);
        }
    },
    /**
     * Lista vulnerabilidades
     */
    async listVulnerabilities(params, provider) {
        try {
            // Auto-detecção de owner/username se não fornecidos
            let updatedParams = { ...params };
            if (!updatedParams.owner) {
                try {
                    const currentUser = await provider.getCurrentUser();
                    updatedParams.owner = currentUser.login;
                }
                catch (error) {
                    console.warn('[SECURITY.TS] Falha na auto-detecção de usuário');
                }
            }
            if (!provider.listVulnerabilities) {
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
            const result = await provider.listVulnerabilities({
                owner: params.owner,
                repo: params.repo,
                severity: params.severity,
                state: params.state,
                ecosystem: params.ecosystem,
                package: params.package_name,
                page: params.page,
                limit: params.limit
            });
            return {
                success: true,
                action: 'vulnerabilities',
                message: `${result.vulnerabilities?.length || 0} vulnerabilidades encontradas`,
                data: result
            };
        }
        catch (error) {
            throw new Error(`Falha ao listar vulnerabilidades: ${error}`);
        }
    },
    /**
     * Gerencia alertas de segurança
     */
    async manageSecurityAlerts(params, provider) {
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
                owner: params.owner,
                repo: params.repo,
                alert_id: params.alert_id,
                alert_number: params.alert_number,
                dismiss_reason: params.dismiss_reason,
                dismiss_comment: params.dismiss_comment,
                state: params.state,
                page: params.page,
                limit: params.limit
            });
            return {
                success: true,
                action: 'alerts',
                message: `Alertas de segurança gerenciados com sucesso`,
                data: result
            };
        }
        catch (error) {
            throw new Error(`Falha ao gerenciar alertas de segurança: ${error}`);
        }
    },
    /**
     * Gerencia políticas de segurança
     */
    async manageSecurityPolicies(params, provider) {
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
                owner: params.owner,
                repo: params.repo,
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
        }
        catch (error) {
            throw new Error(`Falha ao gerenciar políticas de segurança: ${error}`);
        }
    },
    /**
     * Verifica compliance
     */
    async checkCompliance(params, provider) {
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
                owner: params.owner,
                repo: params.repo,
                framework: params.compliance_framework,
                report_format: params.report_format || 'json'
            });
            return {
                success: true,
                action: 'compliance',
                message: `Verificação de compliance executada com sucesso`,
                data: result
            };
        }
        catch (error) {
            throw new Error(`Falha ao verificar compliance: ${error}`);
        }
    },
    /**
     * Analisa dependências
     */
    async analyzeDependencies(params, provider) {
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
                owner: params.owner,
                repo: params.repo,
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
        }
        catch (error) {
            throw new Error(`Falha ao analisar dependências: ${error}`);
        }
    },
    /**
     * Lista advisories de segurança
     */
    async listSecurityAdvisories(params, provider) {
        try {
            // Auto-detecção de owner/username se não fornecidos
            let updatedParams = { ...params };
            if (!updatedParams.owner) {
                try {
                    const currentUser = await provider.getCurrentUser();
                    updatedParams.owner = currentUser.login;
                }
                catch (error) {
                    console.warn('[SECURITY.TS] Falha na auto-detecção de usuário');
                }
            }
            if (!provider.listSecurityAdvisories) {
                return {
                    success: false,
                    action: 'list-security-advisories',
                    message: 'Funcionalidade não suportada por este provider',
                    error: 'Provider não implementa listSecurityAdvisories'
                };
            }
            const result = await provider.listSecurityAdvisories({
                owner: params.owner,
                repo: params.repo,
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
        }
        catch (error) {
            throw new Error(`Falha ao listar advisories: ${error}`);
        }
    }
};
//# sourceMappingURL=security.js.map