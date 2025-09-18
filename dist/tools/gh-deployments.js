"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deploymentsTool = void 0;
const zod_1 = require("zod");
const index_js_1 = require("../providers/index.js");
const user_detection_js_1 = require("../utils/user-detection.js");
const validator_js_1 = require("./validator.js");
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
const DeploymentsInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['list', 'create', 'status', 'environments', 'rollback', 'delete']),
    // Parâmetros comuns
    repo: validator_js_1.CommonSchemas.repo,
    // Parâmetros para listagem
    page: validator_js_1.CommonSchemas.page,
    limit: validator_js_1.CommonSchemas.limit,
    // Parâmetros para deployment
    deployment_id: validator_js_1.CommonSchemas.shortString,
    ref: validator_js_1.CommonSchemas.branch,
    environment: validator_js_1.CommonSchemas.shortString,
    description: validator_js_1.CommonSchemas.mediumString,
    // Parâmetros para criação
    task: validator_js_1.CommonSchemas.shortString,
    auto_merge: validator_js_1.CommonSchemas.boolean,
    required_contexts: zod_1.z.array(zod_1.z.string()).optional(),
    payload: zod_1.z.record(zod_1.z.any()).optional(),
    // Parâmetros para status
    state: zod_1.z.enum(['pending', 'success', 'error', 'failure', 'inactive', 'in_progress', 'queued']).optional(),
    log_url: validator_js_1.CommonSchemas.mediumString,
    environment_url: validator_js_1.CommonSchemas.mediumString,
    // Parâmetros para ambientes
    environment_name: validator_js_1.CommonSchemas.shortString,
    wait_timer: zod_1.z.number().optional(),
    reviewers: zod_1.z.array(zod_1.z.string()).optional(),
    // Filtros
    sha: validator_js_1.CommonSchemas.shortString,
    task_filter: validator_js_1.CommonSchemas.shortString,
    environment_filter: validator_js_1.CommonSchemas.shortString
}).refine((data) => {
    // Validações específicas por ação
    if (['create'].includes(data.action)) {
        return data.repo && data.ref && data.environment;
    }
    if (['status', 'rollback', 'delete'].includes(data.action)) {
        return data.repo && data.deployment_id;
    }
    return data.repo;
}, {
    message: "Parâmetros obrigatórios não fornecidos para a ação especificada"
});
/**
 * Schema de validação para resultado da tool deployments
 */
const DeploymentsResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    action: zod_1.z.string(),
    message: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional()
});
/**
 * Implementação da tool deployments
 */
exports.deploymentsTool = {
    name: 'gh-deployments',
    description: 'tool: Gerencia deployments GitHub para controle de versões em produção\n──────────────\naction list: lista deployments do repositório\naction list requires: repo, environment, ref, task, page, limit\n───────────────\naction create: cria novo deployment\naction create requires: repo, ref, environment, description, task, auto_merge, required_contexts, payload\n───────────────\naction status: verifica status de deployment\naction status requires: repo, deployment_id, state, log_url, environment_url, description\n───────────────\naction environments: lista ambientes de deployment\naction environments requires: repo, page, limit\n───────────────\naction rollback: reverte deployment\naction rollback requires: repo, deployment_id, environment\n───────────────\naction delete: remove deployment\naction delete requires: repo, deployment_id',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['list', 'create', 'status', 'environments', 'rollback', 'delete'],
                description: 'Action to perform on deployments'
            },
            repo: { type: 'string', description: 'Repository name' },
            deployment_id: { type: 'string', description: 'Deployment ID' },
            ref: { type: 'string', description: 'Git reference to deploy' },
            environment: { type: 'string', description: 'Deployment environment' },
            description: { type: 'string', description: 'Deployment description' },
            task: { type: 'string', description: 'Deployment task' },
            auto_merge: { type: 'boolean', description: 'Auto merge deployment' },
            required_contexts: { type: 'array', items: { type: 'string' }, description: 'Required status contexts' },
            payload: { type: 'object', description: 'Deployment payload' },
            state: { type: 'string', enum: ['pending', 'success', 'error', 'failure', 'inactive', 'in_progress', 'queued'], description: 'Deployment state' },
            log_url: { type: 'string', description: 'Log URL' },
            environment_url: { type: 'string', description: 'Environment URL' },
            environment_name: { type: 'string', description: 'Environment name' },
            wait_timer: { type: 'number', description: 'Wait timer in minutes' },
            reviewers: { type: 'array', items: { type: 'string' }, description: 'Environment reviewers' },
            sha: { type: 'string', description: 'Commit SHA filter' },
            task_filter: { type: 'string', description: 'Task filter' },
            environment_filter: { type: 'string', description: 'Environment filter' },
            page: { type: 'number', description: 'Page number', minimum: 1 },
            limit: { type: 'number', description: 'Items per page', minimum: 1, maximum: 100 }
        },
        required: ['action', 'repo']
    },
    async handler(input) {
        try {
            const validatedInput = DeploymentsInputSchema.parse(input);
            // Fixar provider como github para tools exclusivas do GitHub
            const updatedParams = await (0, user_detection_js_1.applyAutoUserDetection)(validatedInput, 'github');
            const provider = index_js_1.globalProviderFactory.getProvider('github');
            if (!provider) {
                throw new Error('Provider GitHub não encontrado');
            }
            switch (updatedParams.action) {
                case 'list':
                    return await this.listDeployments(updatedParams, provider);
                case 'create':
                    return await this.createDeployment(updatedParams, provider);
                case 'status':
                    return await this.updateDeploymentStatus(updatedParams, provider);
                case 'environments':
                    return await this.listEnvironments(updatedParams, provider);
                case 'rollback':
                    return await this.rollbackDeployment(updatedParams, provider);
                case 'delete':
                    return await this.deleteDeployment(updatedParams, provider);
                default:
                    throw new Error(`Ação não suportada: ${updatedParams.action}`);
            }
        }
        catch (error) {
            return {
                success: false,
                action: input.action || 'unknown',
                message: 'Erro na operação de deployments',
                error: error instanceof Error ? error.message : String(error)
            };
        }
    },
    /**
     * Lista deployments do repositório
     */
    async listDeployments(params, provider) {
        try {
            const currentUser = await provider.getCurrentUser();
            const owner = currentUser.login;
            if (!provider.listDeployments) {
                return {
                    success: true,
                    action: 'list',
                    message: 'Funcionalidade de deployments não suportada por este provider',
                    data: {
                        total_count: 0,
                        deployments: [],
                        note: 'Deployments não disponíveis neste provider'
                    }
                };
            }
            const result = await provider.listDeployments({
                owner,
                repo: params.repo,
                sha: params.sha,
                ref: params.ref,
                task: params.task_filter,
                environment: params.environment_filter,
                page: params.page,
                limit: params.limit
            });
            return {
                success: true,
                action: 'list',
                message: `${result.deployments?.length || 0} deployments encontrados`,
                data: result
            };
        }
        catch (error) {
            throw new Error(`Falha ao listar deployments: ${error}`);
        }
    },
    /**
     * Cria novo deployment
     */
    async createDeployment(params, provider) {
        try {
            if (!provider.createDeployment) {
                return {
                    success: false,
                    action: 'create-deployment',
                    message: 'Funcionalidade não suportada por este provider',
                    error: 'Provider não implementa createDeployment'
                };
            }
            const currentUser = await provider.getCurrentUser();
            const owner = currentUser.login;
            const result = await provider.createDeployment({
                owner,
                repo: params.repo,
                ref: params.ref,
                environment: params.environment,
                description: params.description,
                task: params.task || 'deploy',
                auto_merge: params.auto_merge,
                required_contexts: params.required_contexts,
                payload: params.payload
            });
            return {
                success: true,
                action: 'create',
                message: 'Deployment criado com sucesso',
                data: result
            };
        }
        catch (error) {
            throw new Error(`Falha ao criar deployment: ${error}`);
        }
    },
    /**
     * Atualiza status do deployment
     */
    async updateDeploymentStatus(params, provider) {
        try {
            if (!provider.updateDeploymentStatus) {
                return {
                    success: false,
                    action: 'update-deployment-status',
                    message: 'Funcionalidade não suportada por este provider',
                    error: 'Provider não implementa updateDeploymentStatus'
                };
            }
            const currentUser = await provider.getCurrentUser();
            const owner = currentUser.login;
            const result = await provider.updateDeploymentStatus({
                owner,
                repo: params.repo,
                deployment_id: params.deployment_id,
                state: params.state || 'pending',
                log_url: params.log_url,
                description: params.description,
                environment_url: params.environment_url
            });
            return {
                success: true,
                action: 'status',
                message: `Status do deployment atualizado com sucesso`,
                data: result
            };
        }
        catch (error) {
            throw new Error(`Falha ao atualizar status do deployment: ${error}`);
        }
    },
    /**
     * Lista ambientes de deployment
     */
    async listEnvironments(params, provider) {
        try {
            if (!provider.listEnvironments) {
                return {
                    success: false,
                    action: 'list-environments',
                    message: 'Funcionalidade não suportada por este provider',
                    error: 'Provider não implementa listEnvironments'
                };
            }
            const currentUser = await provider.getCurrentUser();
            const owner = currentUser.login;
            const result = await provider.listEnvironments({
                owner,
                repo: params.repo,
                page: params.page,
                limit: params.limit
            });
            return {
                success: true,
                action: 'environments',
                message: `${result.environments?.length || 0} ambientes encontrados`,
                data: result
            };
        }
        catch (error) {
            throw new Error(`Falha ao listar ambientes: ${error}`);
        }
    },
    /**
     * Executa rollback de deployment
     */
    async rollbackDeployment(params, provider) {
        try {
            if (!provider.rollbackDeployment) {
                return {
                    success: false,
                    action: 'rollback-deployment',
                    message: 'Funcionalidade não suportada por este provider',
                    error: 'Provider não implementa rollbackDeployment'
                };
            }
            const currentUser = await provider.getCurrentUser();
            const owner = currentUser.login;
            const result = await provider.rollbackDeployment({
                owner,
                repo: params.repo,
                deployment_id: params.deployment_id,
                description: params.description || 'Rollback automático'
            });
            return {
                success: true,
                action: 'rollback',
                message: `Rollback do deployment executado com sucesso`,
                data: result
            };
        }
        catch (error) {
            throw new Error(`Falha ao executar rollback: ${error}`);
        }
    },
    /**
     * Remove deployment
     */
    async deleteDeployment(params, provider) {
        try {
            if (!provider.deleteDeployment) {
                return {
                    success: false,
                    action: 'delete-deployment',
                    message: 'Funcionalidade não suportada por este provider',
                    error: 'Provider não implementa deleteDeployment'
                };
            }
            const currentUser = await provider.getCurrentUser();
            const owner = currentUser.login;
            const result = await provider.deleteDeployment({
                owner,
                repo: params.repo,
                deployment_id: params.deployment_id
            });
            return {
                success: true,
                action: 'delete',
                message: `Deployment removido com sucesso`,
                data: result
            };
        }
        catch (error) {
            throw new Error(`Falha ao remover deployment: ${error}`);
        }
    }
};
//# sourceMappingURL=gh-deployments.js.map