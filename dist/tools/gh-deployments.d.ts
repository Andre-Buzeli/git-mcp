import { z } from 'zod';
import { VcsOperations } from '../providers/index.js';
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
declare const DeploymentsInputSchema: z.ZodEffects<z.ZodObject<{
    action: z.ZodEnum<["list", "create", "status", "environments", "rollback", "delete"]>;
    repo: z.ZodString;
    provider: z.ZodEnum<["gitea", "github", "both"]>;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    deployment_id: z.ZodOptional<z.ZodString>;
    ref: z.ZodOptional<z.ZodString>;
    environment: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    task: z.ZodOptional<z.ZodString>;
    auto_merge: z.ZodOptional<z.ZodBoolean>;
    required_contexts: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    payload: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    state: z.ZodOptional<z.ZodEnum<["pending", "success", "error", "failure", "inactive", "in_progress", "queued"]>>;
    log_url: z.ZodOptional<z.ZodString>;
    environment_url: z.ZodOptional<z.ZodString>;
    environment_name: z.ZodOptional<z.ZodString>;
    wait_timer: z.ZodOptional<z.ZodNumber>;
    reviewers: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    sha: z.ZodOptional<z.ZodString>;
    task_filter: z.ZodOptional<z.ZodString>;
    environment_filter: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    provider: "gitea" | "github" | "both";
    repo: string;
    action: "status" | "delete" | "list" | "create" | "environments" | "rollback";
    description?: string | undefined;
    state?: "error" | "success" | "queued" | "in_progress" | "failure" | "pending" | "inactive" | undefined;
    ref?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    environment?: string | undefined;
    task?: string | undefined;
    auto_merge?: boolean | undefined;
    required_contexts?: string[] | undefined;
    payload?: Record<string, any> | undefined;
    deployment_id?: string | undefined;
    log_url?: string | undefined;
    environment_url?: string | undefined;
    sha?: string | undefined;
    reviewers?: string[] | undefined;
    environment_name?: string | undefined;
    wait_timer?: number | undefined;
    task_filter?: string | undefined;
    environment_filter?: string | undefined;
}, {
    provider: "gitea" | "github" | "both";
    repo: string;
    action: "status" | "delete" | "list" | "create" | "environments" | "rollback";
    description?: string | undefined;
    state?: "error" | "success" | "queued" | "in_progress" | "failure" | "pending" | "inactive" | undefined;
    ref?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    environment?: string | undefined;
    task?: string | undefined;
    auto_merge?: boolean | undefined;
    required_contexts?: string[] | undefined;
    payload?: Record<string, any> | undefined;
    deployment_id?: string | undefined;
    log_url?: string | undefined;
    environment_url?: string | undefined;
    sha?: string | undefined;
    reviewers?: string[] | undefined;
    environment_name?: string | undefined;
    wait_timer?: number | undefined;
    task_filter?: string | undefined;
    environment_filter?: string | undefined;
}>, {
    provider: "gitea" | "github" | "both";
    repo: string;
    action: "status" | "delete" | "list" | "create" | "environments" | "rollback";
    description?: string | undefined;
    state?: "error" | "success" | "queued" | "in_progress" | "failure" | "pending" | "inactive" | undefined;
    ref?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    environment?: string | undefined;
    task?: string | undefined;
    auto_merge?: boolean | undefined;
    required_contexts?: string[] | undefined;
    payload?: Record<string, any> | undefined;
    deployment_id?: string | undefined;
    log_url?: string | undefined;
    environment_url?: string | undefined;
    sha?: string | undefined;
    reviewers?: string[] | undefined;
    environment_name?: string | undefined;
    wait_timer?: number | undefined;
    task_filter?: string | undefined;
    environment_filter?: string | undefined;
}, {
    provider: "gitea" | "github" | "both";
    repo: string;
    action: "status" | "delete" | "list" | "create" | "environments" | "rollback";
    description?: string | undefined;
    state?: "error" | "success" | "queued" | "in_progress" | "failure" | "pending" | "inactive" | undefined;
    ref?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    environment?: string | undefined;
    task?: string | undefined;
    auto_merge?: boolean | undefined;
    required_contexts?: string[] | undefined;
    payload?: Record<string, any> | undefined;
    deployment_id?: string | undefined;
    log_url?: string | undefined;
    environment_url?: string | undefined;
    sha?: string | undefined;
    reviewers?: string[] | undefined;
    environment_name?: string | undefined;
    wait_timer?: number | undefined;
    task_filter?: string | undefined;
    environment_filter?: string | undefined;
}>;
export type DeploymentsInput = z.infer<typeof DeploymentsInputSchema>;
/**
 * Schema de validação para resultado da tool deployments
 */
declare const DeploymentsResultSchema: z.ZodObject<{
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
export type DeploymentsResult = z.infer<typeof DeploymentsResultSchema>;
/**
 * Implementação da tool deployments
 */
export declare const deploymentsTool: {
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
            deployment_id: {
                type: string;
                description: string;
            };
            ref: {
                type: string;
                description: string;
            };
            environment: {
                type: string;
                description: string;
            };
            description: {
                type: string;
                description: string;
            };
            task: {
                type: string;
                description: string;
            };
            auto_merge: {
                type: string;
                description: string;
            };
            required_contexts: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            payload: {
                type: string;
                description: string;
            };
            state: {
                type: string;
                enum: string[];
                description: string;
            };
            log_url: {
                type: string;
                description: string;
            };
            environment_url: {
                type: string;
                description: string;
            };
            environment_name: {
                type: string;
                description: string;
            };
            wait_timer: {
                type: string;
                description: string;
            };
            reviewers: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            sha: {
                type: string;
                description: string;
            };
            task_filter: {
                type: string;
                description: string;
            };
            environment_filter: {
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
    handler(input: DeploymentsInput): Promise<DeploymentsResult>;
    /**
     * Lista deployments do repositório
     */
    listDeployments(params: DeploymentsInput, provider: VcsOperations): Promise<DeploymentsResult>;
    /**
     * Cria novo deployment
     */
    createDeployment(params: DeploymentsInput, provider: VcsOperations): Promise<DeploymentsResult>;
    /**
     * Atualiza status do deployment
     */
    updateDeploymentStatus(params: DeploymentsInput, provider: VcsOperations): Promise<DeploymentsResult>;
    /**
     * Lista ambientes de deployment
     */
    listEnvironments(params: DeploymentsInput, provider: VcsOperations): Promise<DeploymentsResult>;
    /**
     * Executa rollback de deployment
     */
    rollbackDeployment(params: DeploymentsInput, provider: VcsOperations): Promise<DeploymentsResult>;
    /**
     * Remove deployment
     */
    deleteDeployment(params: DeploymentsInput, provider: VcsOperations): Promise<DeploymentsResult>;
};
export {};
//# sourceMappingURL=gh-deployments.d.ts.map