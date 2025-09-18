import { z } from 'zod';
import { VcsOperations } from '../providers/index.js';
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
declare const ActionsInputSchema: z.ZodEffects<z.ZodObject<{
    action: z.ZodEnum<["list-runs", "cancel", "rerun", "artifacts", "secrets", "jobs", "download-artifact"]>;
    repo: z.ZodString;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    run_id: z.ZodOptional<z.ZodString>;
    workflow_id: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["queued", "in_progress", "completed", "cancelled", "failure", "success"]>>;
    branch: z.ZodOptional<z.ZodString>;
    event: z.ZodOptional<z.ZodString>;
    job_id: z.ZodOptional<z.ZodString>;
    artifact_id: z.ZodOptional<z.ZodString>;
    artifact_name: z.ZodOptional<z.ZodString>;
    download_path: z.ZodOptional<z.ZodString>;
    secret_name: z.ZodOptional<z.ZodString>;
    created_after: z.ZodOptional<z.ZodString>;
    created_before: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    repo: string;
    action: "list-runs" | "cancel" | "rerun" | "artifacts" | "secrets" | "jobs" | "download-artifact";
    status?: "success" | "queued" | "in_progress" | "completed" | "cancelled" | "failure" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    workflow_id?: string | undefined;
    run_id?: string | undefined;
    job_id?: string | undefined;
    artifact_id?: string | undefined;
    download_path?: string | undefined;
    branch?: string | undefined;
    event?: string | undefined;
    artifact_name?: string | undefined;
    secret_name?: string | undefined;
    created_after?: string | undefined;
    created_before?: string | undefined;
}, {
    repo: string;
    action: "list-runs" | "cancel" | "rerun" | "artifacts" | "secrets" | "jobs" | "download-artifact";
    status?: "success" | "queued" | "in_progress" | "completed" | "cancelled" | "failure" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    workflow_id?: string | undefined;
    run_id?: string | undefined;
    job_id?: string | undefined;
    artifact_id?: string | undefined;
    download_path?: string | undefined;
    branch?: string | undefined;
    event?: string | undefined;
    artifact_name?: string | undefined;
    secret_name?: string | undefined;
    created_after?: string | undefined;
    created_before?: string | undefined;
}>, {
    repo: string;
    action: "list-runs" | "cancel" | "rerun" | "artifacts" | "secrets" | "jobs" | "download-artifact";
    status?: "success" | "queued" | "in_progress" | "completed" | "cancelled" | "failure" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    workflow_id?: string | undefined;
    run_id?: string | undefined;
    job_id?: string | undefined;
    artifact_id?: string | undefined;
    download_path?: string | undefined;
    branch?: string | undefined;
    event?: string | undefined;
    artifact_name?: string | undefined;
    secret_name?: string | undefined;
    created_after?: string | undefined;
    created_before?: string | undefined;
}, {
    repo: string;
    action: "list-runs" | "cancel" | "rerun" | "artifacts" | "secrets" | "jobs" | "download-artifact";
    status?: "success" | "queued" | "in_progress" | "completed" | "cancelled" | "failure" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    workflow_id?: string | undefined;
    run_id?: string | undefined;
    job_id?: string | undefined;
    artifact_id?: string | undefined;
    download_path?: string | undefined;
    branch?: string | undefined;
    event?: string | undefined;
    artifact_name?: string | undefined;
    secret_name?: string | undefined;
    created_after?: string | undefined;
    created_before?: string | undefined;
}>;
export type ActionsInput = z.infer<typeof ActionsInputSchema>;
/**
 * Schema de validação para resultado da tool actions
 */
declare const ActionsResultSchema: z.ZodObject<{
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
export type ActionsResult = z.infer<typeof ActionsResultSchema>;
/**
 * Implementação da tool actions
 */
export declare const actionsTool: {
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
            repo: {
                type: string;
                description: string;
            };
            run_id: {
                type: string;
                description: string;
            };
            workflow_id: {
                type: string;
                description: string;
            };
            status: {
                type: string;
                description: string;
            };
            branch: {
                type: string;
                description: string;
            };
            event: {
                type: string;
                description: string;
            };
            job_id: {
                type: string;
                description: string;
            };
            artifact_id: {
                type: string;
                description: string;
            };
            artifact_name: {
                type: string;
                description: string;
            };
            download_path: {
                type: string;
                description: string;
            };
            secret_name: {
                type: string;
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
    handler(input: ActionsInput): Promise<ActionsResult>;
    /**
     * Lista execuções de workflows
     */
    listRuns(params: ActionsInput, provider: VcsOperations): Promise<ActionsResult>;
    /**
     * Cancela execução de workflow
     */
    cancelRun(params: ActionsInput, provider: VcsOperations): Promise<ActionsResult>;
    /**
     * Re-executa workflow
     */
    rerunWorkflow(params: ActionsInput, provider: VcsOperations): Promise<ActionsResult>;
    /**
     * Lista artefatos
     */
    listArtifacts(params: ActionsInput, provider: VcsOperations): Promise<ActionsResult>;
    /**
     * Lista secrets (read-only)
     */
    listSecrets(params: ActionsInput, provider: VcsOperations): Promise<ActionsResult>;
    /**
     * Lista jobs de uma execução
     */
    listJobs(params: ActionsInput, provider: VcsOperations): Promise<ActionsResult>;
    /**
     * Baixa artefato
     */
    downloadArtifact(params: ActionsInput, provider: VcsOperations): Promise<ActionsResult>;
};
export {};
//# sourceMappingURL=gh-actions.d.ts.map