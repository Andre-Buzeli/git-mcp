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
exports.workflowsTool = void 0;
var zod_1 = require("zod");
var index_js_1 = require("../providers/index.js");
var validator_js_1 = require("./validator.js");
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
var WorkflowsInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['list', 'create', 'trigger', 'status', 'logs', 'disable', 'enable']),
    // Parâmetros comuns
    repo: validator_js_1.CommonSchemas.repo,
    provider: validator_js_1.CommonSchemas.provider,
    // Parâmetros para listagem
    page: validator_js_1.CommonSchemas.page,
    limit: validator_js_1.CommonSchemas.limit,
    // Parâmetros para criação
    name: validator_js_1.CommonSchemas.shortString,
    description: validator_js_1.CommonSchemas.mediumString,
    workflow_content: validator_js_1.CommonSchemas.longString,
    branch: validator_js_1.CommonSchemas.branch,
    // Parâmetros para trigger e status
    workflow_id: validator_js_1.CommonSchemas.shortString,
    workflow_name: validator_js_1.CommonSchemas.shortString,
    run_id: validator_js_1.CommonSchemas.shortString,
    // Parâmetros para logs
    job_id: validator_js_1.CommonSchemas.shortString,
    step_number: zod_1.z.number().optional(),
    // Parâmetros para inputs do workflow
    inputs: zod_1.z.record(zod_1.z.string()).optional(),
    ref: validator_js_1.CommonSchemas.branch.optional()
}).refine(function (data) {
    // Validações específicas por ação
    if (['create'].includes(data.action)) {
        return data.owner || (await provider.getCurrentUser()).login && data.repo && data.name && data.workflow_content;
    }
    if (['trigger', 'status', 'logs', 'disable', 'enable'].includes(data.action)) {
        return data.owner || (await provider.getCurrentUser()).login && data.repo && (data.workflow_id || data.workflow_name);
    }
    return data.owner || (await provider.getCurrentUser()).login && data.repo;
}, {
    message: "Parâmetros obrigatórios não fornecidos para a ação especificada"
});
/**
 * Schema de validação para resultado da tool workflows
 */
var WorkflowsResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    action: zod_1.z.string(),
    message: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional()
});
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
exports.workflowsTool = {
    name: 'workflows',
    description: 'Gerenciamento completo de workflows CI/CD.\n\nACTIONS DISPONÍVEIS:\n• list: Lista workflows do repositório\n  - OBRIGATÓRIOS: repo\n  - OPCIONAIS: page, limit\n\n• create: Cria novo workflow\n  - OBRIGATÓRIOS: repo, name, workflow_content\n  - OPCIONAIS: description, branch\n\n• trigger: Dispara workflow manualmente\n  - OBRIGATÓRIOS: repo, workflow_id\n  - OPCIONAIS: ref, inputs\n\n• status: Verifica status de execução\n  - OBRIGATÓRIOS: repo, run_id\n\n• logs: Obtém logs de execução\n  - OBRIGATÓRIOS: repo, run_id\n  - OPCIONAIS: job_id, step_number\n\n• disable: Desabilita workflow\n  - OBRIGATÓRIOS: repo, workflow_id\n\n• enable: Habilita workflow\n  - OBRIGATÓRIOS: repo, workflow_id\n\nPARÂMETROS COMUNS:\n• provider: "github" ou "gitea" (opcional)\n• repo: Nome do repositório\n\nBoas práticas: use para automatizar CI/CD pipelines, monitorar execuções, configurar triggers apropriados e manter workflows simples e focados.',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['list', 'create', 'trigger', 'status', 'logs', 'disable', 'enable'],
                description: 'Action to perform on workflows'
            },
            repo: { type: 'string', description: 'Repository name' },
            provider: { type: 'string', description: 'Specific provider (github, gitea) or use default' },
            name: { type: 'string', description: 'Workflow name for creation' },
            description: { type: 'string', description: 'Workflow description' },
            workflow_content: { type: 'string', description: 'Workflow YAML content' },
            branch: { type: 'string', description: 'Target branch' },
            workflow_id: { type: 'string', description: 'Workflow ID' },
            workflow_name: { type: 'string', description: 'Workflow name' },
            run_id: { type: 'string', description: 'Workflow run ID' },
            job_id: { type: 'string', description: 'Job ID for logs' },
            step_number: { type: 'number', description: 'Step number for logs' },
            inputs: { type: 'object', description: 'Workflow inputs' },
            ref: { type: 'string', description: 'Git reference for trigger' },
            page: { type: 'number', description: 'Page number', minimum: 1 },
            limit: { type: 'number', description: 'Items per page', minimum: 1, maximum: 100 }
        },
        required: ['action']
    },
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
    handler: function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var validatedInput, provider, _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 17, , 18]);
                        validatedInput = WorkflowsInputSchema.parse(input);
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
                            case 'trigger': return [3 /*break*/, 5];
                            case 'status': return [3 /*break*/, 7];
                            case 'logs': return [3 /*break*/, 9];
                            case 'disable': return [3 /*break*/, 11];
                            case 'enable': return [3 /*break*/, 13];
                        }
                        return [3 /*break*/, 15];
                    case 1: return [4 /*yield*/, this.listWorkflows(validatedInput, provider)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3: return [4 /*yield*/, this.createWorkflow(validatedInput, provider)];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5: return [4 /*yield*/, this.triggerWorkflow(validatedInput, provider)];
                    case 6: return [2 /*return*/, _b.sent()];
                    case 7: return [4 /*yield*/, this.getWorkflowStatus(validatedInput, provider)];
                    case 8: return [2 /*return*/, _b.sent()];
                    case 9: return [4 /*yield*/, this.getWorkflowLogs(validatedInput, provider)];
                    case 10: return [2 /*return*/, _b.sent()];
                    case 11: return [4 /*yield*/, this.disableWorkflow(validatedInput, provider)];
                    case 12: return [2 /*return*/, _b.sent()];
                    case 13: return [4 /*yield*/, this.enableWorkflow(validatedInput, provider)];
                    case 14: return [2 /*return*/, _b.sent()];
                    case 15: throw new Error("A\u00E7\u00E3o n\u00E3o suportada: ".concat(validatedInput.action));
                    case 16: return [3 /*break*/, 18];
                    case 17:
                        error_1 = _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                action: input.action || 'unknown',
                                message: 'Erro na operação de workflows',
                                error: error_1 instanceof Error ? error_1.message : String(error_1)
                            }];
                    case 18: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Lista workflows do repositório
     */
    listWorkflows: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        if (!provider.listWorkflows) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'list-workflows',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa listWorkflows'
                                }];
                        }
                        if (!provider.listWorkflows) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'list',
                                    message: 'Funcionalidade de workflows não suportada por este provider',
                                    error: 'Provider não implementa listWorkflows'
                                }];
                        }
                        return [4 /*yield*/, provider.listWorkflows({
                                owner: (await provider.getCurrentUser()).login,
                                repo: params.repo,
                                page: params.page,
                                limit: params.limit
                            })];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'list',
                                message: "".concat(((_a = result.workflows) === null || _a === void 0 ? void 0 : _a.length) || 0, " workflows encontrados"),
                                data: result
                            }];
                    case 2:
                        error_2 = _b.sent();
                        throw new Error("Falha ao listar workflows: ".concat(error_2));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Cria novo workflow
     */
    createWorkflow: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!provider.createWorkflow) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'create-workflow',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa createWorkflow'
                                }];
                        }
                        return [4 /*yield*/, provider.createWorkflow({
                                owner: (await provider.getCurrentUser()).login,
                                repo: params.repo,
                                name: params.name,
                                description: params.description,
                                content: params.workflow_content,
                                branch: params.branch
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'create',
                                message: "Workflow '".concat(params.name, "' criado com sucesso"),
                                data: result
                            }];
                    case 2:
                        error_3 = _a.sent();
                        throw new Error("Falha ao criar workflow: ".concat(error_3));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Dispara workflow manualmente
     */
    triggerWorkflow: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!provider.triggerWorkflow) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'trigger-workflow',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa triggerWorkflow'
                                }];
                        }
                        return [4 /*yield*/, provider.triggerWorkflow({
                                owner: (await provider.getCurrentUser()).login,
                                repo: params.repo,
                                workflow_id: params.workflow_id,
                                workflow_name: params.workflow_name,
                                ref: params.ref || 'main',
                                inputs: params.inputs
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'trigger',
                                message: "Workflow disparado com sucesso",
                                data: result
                            }];
                    case 2:
                        error_4 = _a.sent();
                        throw new Error("Falha ao disparar workflow: ".concat(error_4));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Verifica status de execução do workflow
     */
    getWorkflowStatus: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!provider.getWorkflowStatus) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'get-workflow-status',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa getWorkflowStatus'
                                }];
                        }
                        return [4 /*yield*/, provider.getWorkflowStatus({
                                owner: (await provider.getCurrentUser()).login,
                                repo: params.repo,
                                run_id: params.run_id,
                                workflow_id: params.workflow_id
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'status',
                                message: "Status do workflow obtido com sucesso",
                                data: result
                            }];
                    case 2:
                        error_5 = _a.sent();
                        throw new Error("Falha ao obter status do workflow: ".concat(error_5));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Obtém logs de execução do workflow
     */
    getWorkflowLogs: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!provider.getWorkflowLogs) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'get-workflow-logs',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa getWorkflowLogs'
                                }];
                        }
                        return [4 /*yield*/, provider.getWorkflowLogs({
                                owner: (await provider.getCurrentUser()).login,
                                repo: params.repo,
                                run_id: params.run_id,
                                job_id: params.job_id,
                                step_number: params.step_number
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'logs',
                                message: "Logs do workflow obtidos com sucesso",
                                data: result
                            }];
                    case 2:
                        error_6 = _a.sent();
                        throw new Error("Falha ao obter logs do workflow: ".concat(error_6));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Desabilita workflow
     */
    disableWorkflow: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!provider.disableWorkflow) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'disable-workflow',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa disableWorkflow'
                                }];
                        }
                        return [4 /*yield*/, provider.disableWorkflow({
                                owner: (await provider.getCurrentUser()).login,
                                repo: params.repo,
                                workflow_id: params.workflow_id,
                                workflow_name: params.workflow_name
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'disable',
                                message: "Workflow desabilitado com sucesso",
                                data: result
                            }];
                    case 2:
                        error_7 = _a.sent();
                        throw new Error("Falha ao desabilitar workflow: ".concat(error_7));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Habilita workflow
     */
    enableWorkflow: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!provider.enableWorkflow) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'enable-workflow',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa enableWorkflow'
                                }];
                        }
                        return [4 /*yield*/, provider.enableWorkflow({
                                owner: (await provider.getCurrentUser()).login,
                                repo: params.repo,
                                workflow_id: params.workflow_id,
                                workflow_name: params.workflow_name
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'enable',
                                message: "Workflow habilitado com sucesso",
                                data: result
                            }];
                    case 2:
                        error_8 = _a.sent();
                        throw new Error("Falha ao habilitar workflow: ".concat(error_8));
                    case 3: return [2 /*return*/];
                }
            });
        });
    }
};
