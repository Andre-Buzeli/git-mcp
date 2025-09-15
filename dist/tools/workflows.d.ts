import { z } from 'zod';
import { VcsOperations } from '../providers/index.js';
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
declare const WorkflowsInputSchema: z.ZodEffects<z.ZodObject<{
    action: z.ZodEnum<["list", "create", "trigger", "status", "logs", "disable", "enable"]>;
    owner: z.ZodString;
    repo: z.ZodString;
    provider: z.ZodEnum<["gitea", "github", "both"]>;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    workflow_content: z.ZodOptional<z.ZodString>;
    branch: z.ZodOptional<z.ZodString>;
    workflow_id: z.ZodOptional<z.ZodString>;
    workflow_name: z.ZodOptional<z.ZodString>;
    run_id: z.ZodOptional<z.ZodString>;
    job_id: z.ZodOptional<z.ZodString>;
    step_number: z.ZodOptional<z.ZodNumber>;
    inputs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    ref: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    provider: "gitea" | "github" | "both";
    owner: string;
    repo: string;
    action: "status" | "create" | "list" | "trigger" | "logs" | "disable" | "enable";
    name?: string | undefined;
    description?: string | undefined;
    ref?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    workflow_id?: string | undefined;
    inputs?: Record<string, string> | undefined;
    run_id?: string | undefined;
    job_id?: string | undefined;
    branch?: string | undefined;
    workflow_content?: string | undefined;
    workflow_name?: string | undefined;
    step_number?: number | undefined;
}, {
    provider: "gitea" | "github" | "both";
    owner: string;
    repo: string;
    action: "status" | "create" | "list" | "trigger" | "logs" | "disable" | "enable";
    name?: string | undefined;
    description?: string | undefined;
    ref?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    workflow_id?: string | undefined;
    inputs?: Record<string, string> | undefined;
    run_id?: string | undefined;
    job_id?: string | undefined;
    branch?: string | undefined;
    workflow_content?: string | undefined;
    workflow_name?: string | undefined;
    step_number?: number | undefined;
}>, {
    provider: "gitea" | "github" | "both";
    owner: string;
    repo: string;
    action: "status" | "create" | "list" | "trigger" | "logs" | "disable" | "enable";
    name?: string | undefined;
    description?: string | undefined;
    ref?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    workflow_id?: string | undefined;
    inputs?: Record<string, string> | undefined;
    run_id?: string | undefined;
    job_id?: string | undefined;
    branch?: string | undefined;
    workflow_content?: string | undefined;
    workflow_name?: string | undefined;
    step_number?: number | undefined;
}, {
    provider: "gitea" | "github" | "both";
    owner: string;
    repo: string;
    action: "status" | "create" | "list" | "trigger" | "logs" | "disable" | "enable";
    name?: string | undefined;
    description?: string | undefined;
    ref?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    workflow_id?: string | undefined;
    inputs?: Record<string, string> | undefined;
    run_id?: string | undefined;
    job_id?: string | undefined;
    branch?: string | undefined;
    workflow_content?: string | undefined;
    workflow_name?: string | undefined;
    step_number?: number | undefined;
}>;
export type WorkflowsInput = z.infer<typeof WorkflowsInputSchema>;
/**
 * Schema de validação para resultado da tool workflows
 */
declare const WorkflowsResultSchema: z.ZodObject<{
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
export declare const workflowsTool: {
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
            name: {
                type: string;
                description: string;
            };
            description: {
                type: string;
                description: string;
            };
            workflow_content: {
                type: string;
                description: string;
            };
            branch: {
                type: string;
                description: string;
            };
            workflow_id: {
                type: string;
                description: string;
            };
            workflow_name: {
                type: string;
                description: string;
            };
            run_id: {
                type: string;
                description: string;
            };
            job_id: {
                type: string;
                description: string;
            };
            step_number: {
                type: string;
                description: string;
            };
            inputs: {
                type: string;
                description: string;
            };
            ref: {
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
    handler(input: WorkflowsInput): Promise<WorkflowsResult>;
    /**
     * Lista workflows do repositório
     */
    listWorkflows(params: WorkflowsInput, provider: VcsOperations): Promise<WorkflowsResult>;
    /**
     * Cria novo workflow
     */
    createWorkflow(params: WorkflowsInput, provider: VcsOperations): Promise<WorkflowsResult>;
    /**
     * Dispara workflow manualmente
     */
    triggerWorkflow(params: WorkflowsInput, provider: VcsOperations): Promise<WorkflowsResult>;
    /**
     * Verifica status de execução do workflow
     */
    getWorkflowStatus(params: WorkflowsInput, provider: VcsOperations): Promise<WorkflowsResult>;
    /**
     * Obtém logs de execução do workflow
     */
    getWorkflowLogs(params: WorkflowsInput, provider: VcsOperations): Promise<WorkflowsResult>;
    /**
     * Desabilita workflow
     */
    disableWorkflow(params: WorkflowsInput, provider: VcsOperations): Promise<WorkflowsResult>;
    /**
     * Habilita workflow
     */
    enableWorkflow(params: WorkflowsInput, provider: VcsOperations): Promise<WorkflowsResult>;
};
export {};
//# sourceMappingURL=workflows.d.ts.map