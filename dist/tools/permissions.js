"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissionsTool = void 0;
const zod_1 = require("zod");
const permission_checker_js_1 = require("./permission-checker.js");
/**
 * Tool: permissions
 *
 * DESCRIÇÃO:
 * Verificação de permissões de tokens para Gitea e GitHub
 *
 * FUNCIONALIDADES:
 * - Verificar permissões de token específico
 * - Verificar todos os providers configurados
 * - Gerar relatórios de permissões
 * - Validar acesso a repositórios privados
 *
 * USO:
 * - Para validar configuração de tokens
 * - Para diagnosticar problemas de acesso
 * - Para verificar permissões antes de operações críticas
 * - Para auditoria de segurança
 *
 * RECOMENDAÇÕES:
 * - Execute regularmente para validar tokens
 * - Verifique antes de operações em massa
 * - Monitore mudanças de permissões
 * - Mantenha logs de verificações
 */
/**
 * Schema de validação para entrada da tool permissions
 */
const PermissionsInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['check', 'check-all', 'report']),
    provider: zod_1.z.string().optional(),
    generateReport: zod_1.z.boolean().optional().default(true)
});
// Schema de saída
const PermissionsResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    action: zod_1.z.string(),
    message: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional()
});
/**
 * Tool: permissions
 *
 * ACTIONS DISPONÍVEIS:
 *
 * 1. check - Verificar permissões de um provider específico
 *    Parâmetros:
 *    - provider (opcional): Provider específico para verificar
 *    - generateReport (opcional): Gerar relatório formatado (padrão: true)
 *
 * 2. check-all - Verificar permissões de todos os providers
 *    Parâmetros:
 *    - generateReport (opcional): Gerar relatório formatado (padrão: true)
 *
 * 3. report - Gerar apenas relatório das últimas verificações
 *    Parâmetros:
 *    - provider (opcional): Provider específico
 *
 * RECOMENDAÇÕES DE USO:
 * - Use 'check-all' para auditoria completa
 * - Use 'check' para verificação específica
 * - Use 'report' para visualizar resultados
 * - Execute regularmente para monitoramento
 */
exports.permissionsTool = {
    name: 'permissions',
    description: 'VERIFICAÇÃO DE PERMISSÕES DE TOKENS - GitHub & Gitea\n\nACTIONS DISPONÍVEIS:\n• check: Verifica permissões de um provider específico\n• check-all: Verifica permissões de todos os providers\n• report: Gera relatório de verificações\n\nPARÂMETROS COMUNS:\n• provider: Provider específico (github, gitea) ou usa todos\n• generateReport: Gerar relatório formatado (padrão: true)\n\nEXEMPLOS DE USO:\n• Verificar provider específico: {"action":"check","provider":"gitea"}\n• Verificar todos: {"action":"check-all"}\n• Gerar relatório: {"action":"report","provider":"github"}',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['check', 'check-all', 'report'],
                description: 'Action to perform on permissions'
            },
            provider: { type: 'string', description: 'Specific provider to check' },
            generateReport: { type: 'boolean', description: 'Generate formatted report' }
        },
        required: ['action']
    },
    /**
     * Handler principal da tool permissions
     */
    async handler(input) {
        try {
            const params = PermissionsInputSchema.parse(input);
            switch (params.action) {
                case 'check':
                    return await this.checkProviderPermissions(params);
                case 'check-all':
                    return await this.checkAllProviders(params);
                case 'report':
                    return await this.generateReport(params);
                default:
                    throw new Error(`Ação não suportada: ${params.action}`);
            }
        }
        catch (error) {
            return {
                success: false,
                action: input.action,
                message: 'Erro na verificação de permissões',
                error: error instanceof Error ? error.message : String(error)
            };
        }
    },
    /**
     * Verifica permissões de um provider específico
     */
    async checkProviderPermissions(params) {
        try {
            const result = await (0, permission_checker_js_1.checkTokenPermissions)(params.provider);
            let message = `Verificação de permissões concluída para provider '${result.provider}'`;
            if (!result.success) {
                message += ' - Problemas detectados';
            }
            const response = {
                success: result.success,
                action: 'check',
                message,
                data: {
                    result,
                    report: params.generateReport ? (0, permission_checker_js_1.generatePermissionReport)(result) : undefined
                }
            };
            return response;
        }
        catch (error) {
            throw new Error(`Falha ao verificar permissões: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    /**
     * Verifica permissões de todos os providers
     */
    async checkAllProviders(params) {
        try {
            const results = await (0, permission_checker_js_1.checkAllProvidersPermissions)();
            const successCount = results.filter(r => r.success).length;
            const totalCount = results.length;
            let message = `Verificação concluída para ${totalCount} provider(s). ${successCount}/${totalCount} com permissões adequadas`;
            if (successCount < totalCount) {
                message += ' - Problemas detectados';
            }
            const response = {
                success: successCount === totalCount,
                action: 'check-all',
                message,
                data: {
                    results,
                    summary: {
                        total: totalCount,
                        successful: successCount,
                        failed: totalCount - successCount
                    },
                    reports: params.generateReport ? results.map(r => (0, permission_checker_js_1.generatePermissionReport)(r)) : undefined
                }
            };
            return response;
        }
        catch (error) {
            throw new Error(`Falha ao verificar permissões de todos os providers: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    /**
     * Gera relatório de verificações
     */
    async generateReport(params) {
        try {
            let results;
            if (params.provider) {
                const result = await (0, permission_checker_js_1.checkTokenPermissions)(params.provider);
                results = [result];
            }
            else {
                results = await (0, permission_checker_js_1.checkAllProvidersPermissions)();
            }
            const reports = results.map(r => (0, permission_checker_js_1.generatePermissionReport)(r));
            const combinedReport = reports.join('\n' + '='.repeat(50) + '\n');
            return {
                success: true,
                action: 'report',
                message: `Relatório gerado para ${results.length} provider(s)`,
                data: {
                    report: combinedReport,
                    results
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao gerar relatório: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
};
//# sourceMappingURL=permissions.js.map