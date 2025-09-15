import { z } from 'zod';
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
declare const PermissionsInputSchema: z.ZodObject<{
    action: z.ZodEnum<["check", "check-all", "report"]>;
    provider: z.ZodOptional<z.ZodString>;
    generateReport: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    action: "check" | "check-all" | "report";
    generateReport: boolean;
    provider?: string | undefined;
}, {
    action: "check" | "check-all" | "report";
    provider?: string | undefined;
    generateReport?: boolean | undefined;
}>;
export type PermissionsInput = z.infer<typeof PermissionsInputSchema>;
declare const PermissionsResultSchema: z.ZodObject<{
    success: z.ZodBoolean;
    action: z.ZodString;
    message: z.ZodString;
    data: z.ZodOptional<z.ZodAny>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message: string;
    action: string;
    success: boolean;
    error?: string | undefined;
    data?: any;
}, {
    message: string;
    action: string;
    success: boolean;
    error?: string | undefined;
    data?: any;
}>;
export type PermissionsResult = z.infer<typeof PermissionsResultSchema>;
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
export declare const permissionsTool: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            action: {
                type: string;
                enum: string[];
                description: string;
            };
            provider: {
                type: string;
                description: string;
            };
            generateReport: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    /**
     * Handler principal da tool permissions
     */
    handler(input: PermissionsInput): Promise<PermissionsResult>;
    /**
     * Verifica permissões de um provider específico
     */
    checkProviderPermissions(params: PermissionsInput): Promise<PermissionsResult>;
    /**
     * Verifica permissões de todos os providers
     */
    checkAllProviders(params: PermissionsInput): Promise<PermissionsResult>;
    /**
     * Gera relatório de verificações
     */
    generateReport(params: PermissionsInput): Promise<PermissionsResult>;
};
export {};
//# sourceMappingURL=permissions.d.ts.map