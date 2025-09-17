"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deploymentsTool = void 0;
var zod_1 = require("zod");
var index_js_1 = require("../providers/index.js");
var validator_js_1 = require("./validator.js");
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
var DeploymentsInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['list', 'create', 'status', 'environments', 'rollback', 'delete']),
    // Parâmetros comuns
    repo: validator_js_1.CommonSchemas.repo,
    provider: validator_js_1.CommonSchemas.provider,
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
}).refine(function (data) {
    // Validações específicas por ação
    if (['create'].includes(data.action)) {
        return data.owner || (await provider.getCurrentUser()).login && data.repo && data.ref && data.environment;
    }
    if (['status', 'rollback', 'delete'].includes(data.action)) {
        return data.owner || (await provider.getCurrentUser()).login && data.repo && data.deployment_id;
    }
    return data.owner || (await provider.getCurrentUser()).login && data.repo;
}, {
    message: "Parâmetros obrigatórios não fornecidos para a ação especificada"
});
/**
 * Schema de validação para resultado da tool deployments
 */
var DeploymentsResultSchema = zod_1.z.object({
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
    name: 'deployments',
    description: 'Gerenciamento completo de deployments.\n\nACTIONS DISPONÍVEIS:\n• list: Lista deployments do repositório\n  - OBRIGATÓRIOS: repo\n  - OPCIONAIS: environment, ref, task, page, limit\n\n• create: Cria novo deployment\n  - OBRIGATÓRIOS: repo, ref, environment\n  - OPCIONAIS: description, task, auto_merge, required_contexts, payload\n\n• status: Verifica status de deployment\n  - OBRIGATÓRIOS: repo, deployment_id\n  - OPCIONAIS: state, log_url, environment_url, description\n\n• environments: Lista ambientes de deployment\n  - OBRIGATÓRIOS: repo\n  - OPCIONAIS: page, limit\n\n• rollback: Reverte deployment\n  - OBRIGATÓRIOS: repo, deployment_id\n  - OPCIONAIS: environment\n\n• delete: Remove deployment\n  - OBRIGATÓRIOS: repo, deployment_id\n\nPARÂMETROS COMUNS:\n• provider: "github" ou "gitea" (opcional)\n• repo: Nome do repositório\n\nBoas práticas: use ambientes separados para staging/prod, monitore status de deployments, configure rollbacks automáticos e mantenha histórico de deployments.',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['list', 'create', 'status', 'environments', 'rollback', 'delete'],
                description: 'Action to perform on deployments'
            },
            repo: { type: 'string', description: 'Repository name' },
            provider: { type: 'string', description: 'Specific provider (github, gitea) or use default' },
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
        required: ['action']
    },
    handler: function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var validatedInput, provider, _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 15, , 16]);
                        validatedInput = DeploymentsInputSchema.parse(input);
                        provider = validatedInput.provider
                            ? index_js_1.globalProviderFactory.getProvider(validatedInput.provider)
                            : index_js_1.globalProviderFactory.getDefaultProvider();
                        if (!provider) {
                            throw new Error("Provider '".concat(validatedInput.provider, "' n\u00E3o encontrado"));
                        }
                        _a = validatedInput.action;
                        switch (_a) {
                            case 'list': return [3 /*break*/, 1];
                            case 'create': return [3 /*break*/, 3];
                            case 'status': return [3 /*break*/, 5];
                            case 'environments': return [3 /*break*/, 7];
                            case 'rollback': return [3 /*break*/, 9];
                            case 'delete': return [3 /*break*/, 11];
                        }
                        return [3 /*break*/, 13];
                    case 1: return [4 /*yield*/, this.listDeployments(validatedInput, provider)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3: return [4 /*yield*/, this.createDeployment(validatedInput, provider)];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5: return [4 /*yield*/, this.updateDeploymentStatus(validatedInput, provider)];
                    case 6: return [2 /*return*/, _b.sent()];
                    case 7: return [4 /*yield*/, this.listEnvironments(validatedInput, provider)];
                    case 8: return [2 /*return*/, _b.sent()];
                    case 9: return [4 /*yield*/, this.rollbackDeployment(validatedInput, provider)];
                    case 10: return [2 /*return*/, _b.sent()];
                    case 11: return [4 /*yield*/, this.deleteDeployment(validatedInput, provider)];
                    case 12: return [2 /*return*/, _b.sent()];
                    case 13: throw new Error("A\u00E7\u00E3o n\u00E3o suportada: ".concat(validatedInput.action));
                    case 14: return [3 /*break*/, 16];
                    case 15:
                        error_1 = _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                action: input.action || 'unknown',
                                message: 'Erro na operação de deployments',
                                error: error_1 instanceof Error ? error_1.message : String(error_1)
                            }];
                    case 16: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Lista deployments do repositório
     */
    listDeployments: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        if (!provider.listDeployments) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'list-deployments',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa listDeployments'
                                }];
                        }
                        return [4 /*yield*/, provider.listDeployments({
                                owner: (await provider.getCurrentUser()).login,
                                repo: params.repo,
                                sha: params.sha,
                                ref: params.ref,
                                task: params.task_filter,
                                environment: params.environment_filter,
                                page: params.page,
                                limit: params.limit
                            })];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'list',
                                message: "".concat(((_a = result.deployments) === null || _a === void 0 ? void 0 : _a.length) || 0, " deployments encontrados"),
                                data: result
                            }];
                    case 2:
                        error_2 = _b.sent();
                        throw new Error("Falha ao listar deployments: ".concat(error_2));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Cria novo deployment
     */
    createDeployment: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!provider.createDeployment) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'create-deployment',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa createDeployment'
                                }];
                        }
                        return [4 /*yield*/, provider.createDeployment({
                                owner: (await provider.getCurrentUser()).login,
                                repo: params.repo,
                                ref: params.ref,
                                environment: params.environment,
                                description: params.description,
                                task: params.task || 'deploy',
                                auto_merge: params.auto_merge,
                                required_contexts: params.required_contexts,
                                payload: params.payload
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'create',
                                message: "Deployment criado com sucesso",
                                data: result
                            }];
                    case 2:
                        error_3 = _a.sent();
                        throw new Error("Falha ao criar deployment: ".concat(error_3));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Atualiza status do deployment
     */
    updateDeploymentStatus: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!provider.updateDeploymentStatus) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'update-deployment-status',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa updateDeploymentStatus'
                                }];
                        }
                        return [4 /*yield*/, provider.updateDeploymentStatus({
                                owner: (await provider.getCurrentUser()).login,
                                repo: params.repo,
                                deployment_id: params.deployment_id,
                                state: params.state || 'pending',
                                log_url: params.log_url,
                                description: params.description,
                                environment_url: params.environment_url
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'status',
                                message: "Status do deployment atualizado com sucesso",
                                data: result
                            }];
                    case 2:
                        error_4 = _a.sent();
                        throw new Error("Falha ao atualizar status do deployment: ".concat(error_4));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Lista ambientes de deployment
     */
    listEnvironments: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_5;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        if (!provider.listEnvironments) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'list-environments',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa listEnvironments'
                                }];
                        }
                        return [4 /*yield*/, provider.listEnvironments({
                                owner: (await provider.getCurrentUser()).login,
                                repo: params.repo,
                                page: params.page,
                                limit: params.limit
                            })];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'environments',
                                message: "".concat(((_a = result.environments) === null || _a === void 0 ? void 0 : _a.length) || 0, " ambientes encontrados"),
                                data: result
                            }];
                    case 2:
                        error_5 = _b.sent();
                        throw new Error("Falha ao listar ambientes: ".concat(error_5));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Executa rollback de deployment
     */
    rollbackDeployment: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!provider.rollbackDeployment) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'rollback-deployment',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa rollbackDeployment'
                                }];
                        }
                        return [4 /*yield*/, provider.rollbackDeployment({
                                owner: (await provider.getCurrentUser()).login,
                                repo: params.repo,
                                deployment_id: params.deployment_id,
                                description: params.description || 'Rollback automático'
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'rollback',
                                message: "Rollback do deployment executado com sucesso",
                                data: result
                            }];
                    case 2:
                        error_6 = _a.sent();
                        throw new Error("Falha ao executar rollback: ".concat(error_6));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Remove deployment
     */
    deleteDeployment: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!provider.deleteDeployment) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'delete-deployment',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa deleteDeployment'
                                }];
                        }
                        return [4 /*yield*/, provider.deleteDeployment({
                                owner: (await provider.getCurrentUser()).login,
                                repo: params.repo,
                                deployment_id: params.deployment_id
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'delete',
                                message: "Deployment removido com sucesso",
                                data: result
                            }];
                    case 2:
                        error_7 = _a.sent();
                        throw new Error("Falha ao remover deployment: ".concat(error_7));
                    case 3: return [2 /*return*/];
                }
            });
        });
    }
};
