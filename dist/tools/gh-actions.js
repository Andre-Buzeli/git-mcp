"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.actionsTool = void 0;
const zod_1 = require("zod");
const index_js_1 = require("../providers/index.js");
const user_detection_js_1 = require("../utils/user-detection.js");
const validator_js_1 = require("./validator.js");
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
const ActionsInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['list-runs', 'cancel', 'rerun', 'artifacts', 'secrets', 'jobs', 'download-artifact']),
    // Parâmetros comuns
    repo: validator_js_1.CommonSchemas.repo,
    // Parâmetros para listagem
    page: validator_js_1.CommonSchemas.page,
    limit: validator_js_1.CommonSchemas.limit,
    // Parâmetros para runs
    run_id: validator_js_1.CommonSchemas.shortString,
    workflow_id: validator_js_1.CommonSchemas.shortString,
    status: zod_1.z.enum(['queued', 'in_progress', 'completed', 'cancelled', 'failure', 'success']).optional(),
    branch: validator_js_1.CommonSchemas.branch,
    event: validator_js_1.CommonSchemas.shortString,
    // Parâmetros para jobs
    job_id: validator_js_1.CommonSchemas.shortString,
    // Parâmetros para artefatos
    artifact_id: validator_js_1.CommonSchemas.shortString,
    artifact_name: validator_js_1.CommonSchemas.shortString,
    download_path: validator_js_1.CommonSchemas.mediumString,
    // Parâmetros para secrets
    secret_name: validator_js_1.CommonSchemas.shortString,
    // Filtros de data
    created_after: zod_1.z.string().optional(),
    created_before: zod_1.z.string().optional()
}).refine((data) => {
    // Validações específicas por ação
    if (['cancel', 'rerun', 'jobs'].includes(data.action)) {
        return data.repo && data.run_id;
    }
    if (['download-artifact'].includes(data.action)) {
        return data.repo && (data.artifact_id || data.artifact_name);
    }
    return data.repo;
}, {
    message: "Parâmetros obrigatórios não fornecidos para a ação especificada"
});
/**
 * Schema de validação para resultado da tool actions
 */
const ActionsResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    action: zod_1.z.string(),
    message: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional()
});
/**
 * Implementação da tool actions
 */
exports.actionsTool = {
    name: 'gh-actions',
    description: 'tool: Gerencia execuções de GitHub Actions para monitoramento e controle\n──────────────\naction list-runs: lista execuções de workflows\naction list-runs requires: repo, workflow_id, status, branch, event, created_after, created_before, page, limit\n───────────────\naction cancel: cancela execução de workflow\naction cancel requires: repo, run_id\n───────────────\naction rerun: re-executa workflow\naction rerun requires: repo, run_id\n───────────────\naction artifacts: lista artefatos de execução\naction artifacts requires: repo, run_id, page, limit\n───────────────\naction secrets: lista secrets do repositório\naction secrets requires: repo, secret_name, page, limit\n───────────────\naction jobs: lista jobs de execução\naction jobs requires: repo, run_id, page, limit\n───────────────\naction download-artifact: baixa artefato\naction download-artifact requires: repo, download_path, artifact_id, artifact_name',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['list-runs', 'cancel', 'rerun', 'artifacts', 'secrets', 'jobs', 'download-artifact'],
                description: 'Action to perform on GitHub Actions'
            },
            repo: { type: 'string', description: 'Repository name' },
            run_id: { type: 'string', description: 'Workflow run ID' },
            workflow_id: { type: 'string', description: 'Workflow ID' },
            status: { type: 'string', description: 'Status filter' },
            branch: { type: 'string', description: 'Branch to filter runs' },
            event: { type: 'string', description: 'Event that triggered the run' },
            job_id: { type: 'string', description: 'Job ID' },
            artifact_id: { type: 'string', description: 'Artifact ID' },
            artifact_name: { type: 'string', description: 'Artifact name' },
            download_path: { type: 'string', description: 'Local path to save artifact' },
            secret_name: { type: 'string', description: 'Specific secret name' },
            created_after: { type: 'string', description: 'Filter runs created after this date' },
            created_before: { type: 'string', description: 'Filter runs created before this date' },
            page: { type: 'number', description: 'Page number', minimum: 1 },
            limit: { type: 'number', description: 'Items per page', minimum: 1, maximum: 100 }
        },
        required: ['action', 'repo']
    },
    async handler(input) {
        try {
            const validatedInput = ActionsInputSchema.parse(input);
            // Fixar provider como github para tools exclusivas do GitHub
            const updatedParams = await (0, user_detection_js_1.applyAutoUserDetection)(validatedInput, 'github');
            const provider = index_js_1.globalProviderFactory.getProvider('github');
            if (!provider) {
                throw new Error('Provider GitHub não encontrado');
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
        }
        catch (error) {
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
    async listRuns(params, provider) {
        try {
            // Auto-detecção de owner/username se não fornecidos
            let updatedParams = { ...params };
            const currentUser = await provider.getCurrentUser();
            const owner = currentUser.login;
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
                owner: (await provider.getCurrentUser()).login,
                repo: params.repo,
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
        }
        catch (error) {
            throw new Error(`Falha ao listar execuções: ${error}`);
        }
    },
    /**
     * Cancela execução de workflow
     */
    async cancelRun(params, provider) {
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
                owner: (await provider.getCurrentUser()).login,
                repo: params.repo,
                run_id: params.run_id
            });
            return {
                success: true,
                action: 'cancel',
                message: `Execução cancelada com sucesso`,
                data: result
            };
        }
        catch (error) {
            throw new Error(`Falha ao cancelar execução: ${error}`);
        }
    },
    /**
     * Re-executa workflow
     */
    async rerunWorkflow(params, provider) {
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
                owner: (await provider.getCurrentUser()).login,
                repo: params.repo,
                run_id: params.run_id
            });
            return {
                success: true,
                action: 'rerun',
                message: `Workflow re-executado com sucesso`,
                data: result
            };
        }
        catch (error) {
            throw new Error(`Falha ao re-executar workflow: ${error}`);
        }
    },
    /**
     * Lista artefatos
     */
    async listArtifacts(params, provider) {
        try {
            // Auto-detecção de owner/username se não fornecidos
            let updatedParams = { ...params };
            const currentUser = await provider.getCurrentUser();
            const owner = currentUser.login;
            if (!provider.listArtifacts) {
                return {
                    success: false,
                    action: 'list-artifacts',
                    message: 'Funcionalidade não suportada por este provider',
                    error: 'Provider não implementa listArtifacts'
                };
            }
            const result = await provider.listArtifacts({
                owner: (await provider.getCurrentUser()).login,
                repo: params.repo,
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
        }
        catch (error) {
            throw new Error(`Falha ao listar artefatos: ${error}`);
        }
    },
    /**
     * Lista secrets (read-only)
     */
    async listSecrets(params, provider) {
        try {
            // Auto-detecção de owner/username se não fornecidos
            let updatedParams = { ...params };
            const currentUser = await provider.getCurrentUser();
            const owner = currentUser.login;
            if (!provider.listSecrets) {
                return {
                    success: false,
                    action: 'list-secrets',
                    message: 'Funcionalidade não suportada por este provider',
                    error: 'Provider não implementa listSecrets'
                };
            }
            const result = await provider.listSecrets({
                owner: (await provider.getCurrentUser()).login,
                repo: params.repo,
                page: params.page,
                limit: params.limit
            });
            return {
                success: true,
                action: 'secrets',
                message: `${result.secrets?.length || 0} secrets encontrados`,
                data: result
            };
        }
        catch (error) {
            throw new Error(`Falha ao listar secrets: ${error}`);
        }
    },
    /**
     * Lista jobs de uma execução
     */
    async listJobs(params, provider) {
        try {
            // Auto-detecção de owner/username se não fornecidos
            let updatedParams = { ...params };
            const currentUser = await provider.getCurrentUser();
            const owner = currentUser.login;
            if (!provider.listJobs) {
                return {
                    success: false,
                    action: 'list-jobs',
                    message: 'Funcionalidade não suportada por este provider',
                    error: 'Provider não implementa listJobs'
                };
            }
            const result = await provider.listJobs({
                owner: (await provider.getCurrentUser()).login,
                repo: params.repo,
                run_id: params.run_id,
                page: params.page,
                limit: params.limit
            });
            return {
                success: true,
                action: 'jobs',
                message: `${result.jobs?.length || 0} jobs encontrados`,
                data: result
            };
        }
        catch (error) {
            throw new Error(`Falha ao listar jobs: ${error}`);
        }
    },
    /**
     * Baixa artefato
     */
    async downloadArtifact(params, provider) {
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
                owner: (await provider.getCurrentUser()).login,
                repo: params.repo,
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
        }
        catch (error) {
            throw new Error(`Falha ao baixar artefato: ${error}`);
        }
    }
};
//# sourceMappingURL=gh-actions.js.map