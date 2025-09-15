import { z } from 'zod';
import { VcsOperations } from '../providers/index.js';
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
declare const SecurityInputSchema: z.ZodEffects<z.ZodObject<{
    action: z.ZodEnum<["scan", "vulnerabilities", "alerts", "policies", "compliance", "dependencies", "advisories"]>;
    owner: z.ZodString;
    repo: z.ZodString;
    provider: z.ZodEnum<["gitea", "github", "both"]>;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    scan_type: z.ZodOptional<z.ZodEnum<["code", "dependencies", "secrets", "infrastructure"]>>;
    ref: z.ZodOptional<z.ZodString>;
    severity: z.ZodOptional<z.ZodEnum<["low", "medium", "high", "critical"]>>;
    state: z.ZodOptional<z.ZodEnum<["open", "fixed", "dismissed"]>>;
    ecosystem: z.ZodOptional<z.ZodString>;
    package_name: z.ZodOptional<z.ZodString>;
    alert_id: z.ZodOptional<z.ZodString>;
    alert_number: z.ZodOptional<z.ZodNumber>;
    dismiss_reason: z.ZodOptional<z.ZodEnum<["fix_started", "inaccurate", "no_bandwidth", "not_used", "tolerable_risk"]>>;
    dismiss_comment: z.ZodOptional<z.ZodString>;
    policy_name: z.ZodOptional<z.ZodString>;
    policy_type: z.ZodOptional<z.ZodEnum<["branch_protection", "required_reviews", "status_checks", "restrictions"]>>;
    policy_config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    compliance_framework: z.ZodOptional<z.ZodEnum<["sox", "pci", "hipaa", "gdpr", "iso27001"]>>;
    report_format: z.ZodOptional<z.ZodEnum<["json", "csv", "pdf"]>>;
    created_after: z.ZodOptional<z.ZodString>;
    created_before: z.ZodOptional<z.ZodString>;
    updated_after: z.ZodOptional<z.ZodString>;
    updated_before: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    provider: "gitea" | "github" | "both";
    owner: string;
    repo: string;
    action: "scan" | "vulnerabilities" | "alerts" | "policies" | "compliance" | "dependencies" | "advisories";
    state?: "open" | "fixed" | "dismissed" | undefined;
    ref?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    alert_number?: number | undefined;
    dismiss_reason?: "tolerable_risk" | "fix_started" | "inaccurate" | "no_bandwidth" | "not_used" | undefined;
    dismiss_comment?: string | undefined;
    severity?: "high" | "medium" | "low" | "critical" | undefined;
    ecosystem?: string | undefined;
    package_name?: string | undefined;
    created_after?: string | undefined;
    created_before?: string | undefined;
    scan_type?: "code" | "secrets" | "dependencies" | "infrastructure" | undefined;
    alert_id?: string | undefined;
    policy_name?: string | undefined;
    policy_type?: "branch_protection" | "required_reviews" | "status_checks" | "restrictions" | undefined;
    policy_config?: Record<string, any> | undefined;
    compliance_framework?: "sox" | "pci" | "hipaa" | "gdpr" | "iso27001" | undefined;
    report_format?: "json" | "csv" | "pdf" | undefined;
    updated_after?: string | undefined;
    updated_before?: string | undefined;
}, {
    provider: "gitea" | "github" | "both";
    owner: string;
    repo: string;
    action: "scan" | "vulnerabilities" | "alerts" | "policies" | "compliance" | "dependencies" | "advisories";
    state?: "open" | "fixed" | "dismissed" | undefined;
    ref?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    alert_number?: number | undefined;
    dismiss_reason?: "tolerable_risk" | "fix_started" | "inaccurate" | "no_bandwidth" | "not_used" | undefined;
    dismiss_comment?: string | undefined;
    severity?: "high" | "medium" | "low" | "critical" | undefined;
    ecosystem?: string | undefined;
    package_name?: string | undefined;
    created_after?: string | undefined;
    created_before?: string | undefined;
    scan_type?: "code" | "secrets" | "dependencies" | "infrastructure" | undefined;
    alert_id?: string | undefined;
    policy_name?: string | undefined;
    policy_type?: "branch_protection" | "required_reviews" | "status_checks" | "restrictions" | undefined;
    policy_config?: Record<string, any> | undefined;
    compliance_framework?: "sox" | "pci" | "hipaa" | "gdpr" | "iso27001" | undefined;
    report_format?: "json" | "csv" | "pdf" | undefined;
    updated_after?: string | undefined;
    updated_before?: string | undefined;
}>, {
    provider: "gitea" | "github" | "both";
    owner: string;
    repo: string;
    action: "scan" | "vulnerabilities" | "alerts" | "policies" | "compliance" | "dependencies" | "advisories";
    state?: "open" | "fixed" | "dismissed" | undefined;
    ref?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    alert_number?: number | undefined;
    dismiss_reason?: "tolerable_risk" | "fix_started" | "inaccurate" | "no_bandwidth" | "not_used" | undefined;
    dismiss_comment?: string | undefined;
    severity?: "high" | "medium" | "low" | "critical" | undefined;
    ecosystem?: string | undefined;
    package_name?: string | undefined;
    created_after?: string | undefined;
    created_before?: string | undefined;
    scan_type?: "code" | "secrets" | "dependencies" | "infrastructure" | undefined;
    alert_id?: string | undefined;
    policy_name?: string | undefined;
    policy_type?: "branch_protection" | "required_reviews" | "status_checks" | "restrictions" | undefined;
    policy_config?: Record<string, any> | undefined;
    compliance_framework?: "sox" | "pci" | "hipaa" | "gdpr" | "iso27001" | undefined;
    report_format?: "json" | "csv" | "pdf" | undefined;
    updated_after?: string | undefined;
    updated_before?: string | undefined;
}, {
    provider: "gitea" | "github" | "both";
    owner: string;
    repo: string;
    action: "scan" | "vulnerabilities" | "alerts" | "policies" | "compliance" | "dependencies" | "advisories";
    state?: "open" | "fixed" | "dismissed" | undefined;
    ref?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    alert_number?: number | undefined;
    dismiss_reason?: "tolerable_risk" | "fix_started" | "inaccurate" | "no_bandwidth" | "not_used" | undefined;
    dismiss_comment?: string | undefined;
    severity?: "high" | "medium" | "low" | "critical" | undefined;
    ecosystem?: string | undefined;
    package_name?: string | undefined;
    created_after?: string | undefined;
    created_before?: string | undefined;
    scan_type?: "code" | "secrets" | "dependencies" | "infrastructure" | undefined;
    alert_id?: string | undefined;
    policy_name?: string | undefined;
    policy_type?: "branch_protection" | "required_reviews" | "status_checks" | "restrictions" | undefined;
    policy_config?: Record<string, any> | undefined;
    compliance_framework?: "sox" | "pci" | "hipaa" | "gdpr" | "iso27001" | undefined;
    report_format?: "json" | "csv" | "pdf" | undefined;
    updated_after?: string | undefined;
    updated_before?: string | undefined;
}>;
export type SecurityInput = z.infer<typeof SecurityInputSchema>;
/**
 * Schema de validação para resultado da tool security
 */
declare const SecurityResultSchema: z.ZodObject<{
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
export type SecurityResult = z.infer<typeof SecurityResultSchema>;
/**
 * Implementação da tool security
 */
export declare const securityTool: {
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
            owner: {
                type: string;
                description: string;
            };
            repo: {
                type: string;
                description: string;
            };
            provider: {
                type: string;
                description: string;
            };
            scan_type: {
                type: string;
                enum: string[];
                description: string;
            };
            ref: {
                type: string;
                description: string;
            };
            severity: {
                type: string;
                enum: string[];
                description: string;
            };
            state: {
                type: string;
                enum: string[];
                description: string;
            };
            ecosystem: {
                type: string;
                description: string;
            };
            package_name: {
                type: string;
                description: string;
            };
            alert_id: {
                type: string;
                description: string;
            };
            alert_number: {
                type: string;
                description: string;
            };
            dismiss_reason: {
                type: string;
                enum: string[];
                description: string;
            };
            dismiss_comment: {
                type: string;
                description: string;
            };
            policy_name: {
                type: string;
                description: string;
            };
            policy_type: {
                type: string;
                enum: string[];
                description: string;
            };
            policy_config: {
                type: string;
                description: string;
            };
            compliance_framework: {
                type: string;
                enum: string[];
                description: string;
            };
            report_format: {
                type: string;
                enum: string[];
                description: string;
            };
            created_after: {
                type: string;
                description: string;
            };
            created_before: {
                type: string;
                description: string;
            };
            updated_after: {
                type: string;
                description: string;
            };
            updated_before: {
                type: string;
                description: string;
            };
            page: {
                type: string;
                description: string;
                minimum: number;
            };
            limit: {
                type: string;
                description: string;
                minimum: number;
                maximum: number;
            };
        };
        required: string[];
    };
    handler(input: SecurityInput): Promise<SecurityResult>;
    /**
     * Executa scan de segurança
     */
    runSecurityScan(params: SecurityInput, provider: VcsOperations): Promise<SecurityResult>;
    /**
     * Lista vulnerabilidades
     */
    listVulnerabilities(params: SecurityInput, provider: VcsOperations): Promise<SecurityResult>;
    /**
     * Gerencia alertas de segurança
     */
    manageSecurityAlerts(params: SecurityInput, provider: VcsOperations): Promise<SecurityResult>;
    /**
     * Gerencia políticas de segurança
     */
    manageSecurityPolicies(params: SecurityInput, provider: VcsOperations): Promise<SecurityResult>;
    /**
     * Verifica compliance
     */
    checkCompliance(params: SecurityInput, provider: VcsOperations): Promise<SecurityResult>;
    /**
     * Analisa dependências
     */
    analyzeDependencies(params: SecurityInput, provider: VcsOperations): Promise<SecurityResult>;
    /**
     * Lista advisories de segurança
     */
    listSecurityAdvisories(params: SecurityInput, provider: VcsOperations): Promise<SecurityResult>;
};
export {};
//# sourceMappingURL=gh-security.d.ts.map