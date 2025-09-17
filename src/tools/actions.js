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
exports.actionsTool = void 0;
var zod_1 = require("zod");
var index_js_1 = require("../providers/index.js");
var validator_js_1 = require("./validator.js");
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
var ActionsInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['list-runs', 'cancel', 'rerun', 'artifacts', 'secrets', 'jobs', 'download-artifact']),
    // Parâmetros comuns
    repo: validator_js_1.CommonSchemas.repo,
    provider: validator_js_1.CommonSchemas.provider,
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
}).refine(function (data) {
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
var ActionsResultSchema = zod_1.z.object({
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
    name: 'actions',
    description: 'Gerenciamento completo de GitHub Actions e Gitea Actions com múltiplas operações.\n\nACTIONS DISPONÍVEIS:\n• list-runs: Lista execuções de workflows\n  - OBRIGATÓRIOS: repo\n  - OPCIONAIS: workflow_id, status, branch, event, created_after, created_before, page, limit\n\n• cancel: Cancela execução de workflow\n  - OBRIGATÓRIOS: repo, run_id\n\n• rerun: Re-executa workflow\n  - OBRIGATÓRIOS: repo, run_id\n\n• artifacts: Lista artefatos de execução\n  - OBRIGATÓRIOS: repo, run_id\n  - OPCIONAIS: page, limit\n\n• secrets: Lista secrets do repositório\n  - OBRIGATÓRIOS: repo\n  - OPCIONAIS: secret_name, page, limit\n\n• jobs: Lista jobs de execução\n  - OBRIGATÓRIOS: repo, run_id\n  - OPCIONAIS: page, limit\n\n• download-artifact: Baixa artefato\n  - OBRIGATÓRIOS: repo, download_path\n  - OBRIGATÓRIOS (um dos dois): artifact_id OU artifact_name\n\nPARÂMETROS COMUNS:\n• provider: "github" ou "gitea" (opcional)\n• repo: Nome do repositório\n\nBoas práticas: monitore execuções regularmente, limpe artefatos antigos, use re-execução apenas quando necessário e mantenha secrets seguros.',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['list-runs', 'cancel', 'rerun', 'artifacts', 'secrets', 'jobs', 'download-artifact'],
                description: 'Ação a executar: list-runs (lista execuções), cancel (cancela), rerun (re-executa), artifacts (artefatos), secrets (lista secrets), jobs (lista jobs), download-artifact (baixa artefato)'
            },
            repo: {
                type: 'string',
                description: 'Nome do repositório (OBRIGATÓRIO para todas as ações)'
            },
            provider: {
                type: 'string',
                description: 'Provider específico (github, gitea) ou usa padrão'
            },
            run_id: {
                type: 'string',
                description: 'ID da execução do workflow (OBRIGATÓRIO para cancel, rerun, jobs)'
            },
            workflow_id: {
                type: 'string',
                description: 'ID do workflow (OPCIONAL para list-runs)'
            },
            status: {
                type: 'string',
                enum: ['queued', 'in_progress', 'completed', 'cancelled', 'failure', 'success'],
                description: 'Status da execução para filtrar (OPCIONAL para list-runs)'
            },
            branch: {
                type: 'string',
                description: 'Branch para filtrar execuções (OPCIONAL para list-runs)'
            },
            event: {
                type: 'string',
                description: 'Evento que disparou a execução (OPCIONAL para list-runs)'
            },
            job_id: {
                type: 'string',
                description: 'ID do job específico (OBRIGATÓRIO para jobs)'
            },
            artifact_id: {
                type: 'string',
                description: 'ID do artefato (OBRIGATÓRIO para download-artifact se não usar artifact_name)'
            },
            artifact_name: {
                type: 'string',
                description: 'Nome do artefato (OBRIGATÓRIO para download-artifact se não usar artifact_id)'
            },
            download_path: {
                type: 'string',
                description: 'Caminho local para salvar o artefato (OBRIGATÓRIO para download-artifact)'
            },
            secret_name: {
                type: 'string',
                description: 'Nome do secret específico (OPCIONAL para secrets)'
            },
            created_after: {
                type: 'string',
                description: 'Filtrar execuções criadas após esta data (OPCIONAL para list-runs)'
            },
            created_before: {
                type: 'string',
                description: 'Filtrar execuções criadas antes desta data (OPCIONAL para list-runs)'
            },
            page: {
                type: 'number',
                description: 'Página da listagem (mínimo: 1, padrão: 1)',
                minimum: 1
            },
            limit: {
                type: 'number',
                description: 'Itens por página (mínimo: 1, máximo: 100, padrão: 30)',
                minimum: 1,
                maximum: 100
            }
        },
        required: ['action']
    },
    handler: function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var validatedInput, provider, _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 17, , 18]);
                        validatedInput = ActionsInputSchema.parse(input);
                        provider = validatedInput.provider
                            ? index_js_1.globalProviderFactory.getProvider(validatedInput.provider)
                            : index_js_1.globalProviderFactory.getDefaultProvider();
                        if (!provider) {
                            throw new Error("Provider '".concat(validatedInput.provider, "' n\u00E3o encontrado"));
                        }
                        _a = validatedInput.action;
                        switch (_a) {
                            case 'list-runs': return [3 /*break*/, 1];
                            case 'cancel': return [3 /*break*/, 3];
                            case 'rerun': return [3 /*break*/, 5];
                            case 'artifacts': return [3 /*break*/, 7];
                            case 'secrets': return [3 /*break*/, 9];
                            case 'jobs': return [3 /*break*/, 11];
                            case 'download-artifact': return [3 /*break*/, 13];
                        }
                        return [3 /*break*/, 15];
                    case 1: return [4 /*yield*/, this.listRuns(validatedInput, provider)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3: return [4 /*yield*/, this.cancelRun(validatedInput, provider)];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5: return [4 /*yield*/, this.rerunWorkflow(validatedInput, provider)];
                    case 6: return [2 /*return*/, _b.sent()];
                    case 7: return [4 /*yield*/, this.listArtifacts(validatedInput, provider)];
                    case 8: return [2 /*return*/, _b.sent()];
                    case 9: return [4 /*yield*/, this.listSecrets(validatedInput, provider)];
                    case 10: return [2 /*return*/, _b.sent()];
                    case 11: return [4 /*yield*/, this.listJobs(validatedInput, provider)];
                    case 12: return [2 /*return*/, _b.sent()];
                    case 13: return [4 /*yield*/, this.downloadArtifact(validatedInput, provider)];
                    case 14: return [2 /*return*/, _b.sent()];
                    case 15: throw new Error("A\u00E7\u00E3o n\u00E3o suportada: ".concat(validatedInput.action));
                    case 16: return [3 /*break*/, 18];
                    case 17:
                        error_1 = _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                action: input.action || 'unknown',
                                message: 'Erro na operação de actions',
                                error: error_1 instanceof Error ? error_1.message : String(error_1)
                            }];
                    case 18: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Lista execuções de workflows
     */
    listRuns: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        if (!provider.listWorkflowRuns) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'list-runs',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa listWorkflowRuns'
                                }];
                        }
                        return [4 /*yield*/, provider.listWorkflowRuns({
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
                            })];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'list-runs',
                                message: "".concat(((_a = result.runs) === null || _a === void 0 ? void 0 : _a.length) || 0, " execu\u00E7\u00F5es encontradas"),
                                data: result
                            }];
                    case 2:
                        error_2 = _b.sent();
                        throw new Error("Falha ao listar execu\u00E7\u00F5es: ".concat(error_2));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Cancela execução de workflow
     */
    cancelRun: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!provider.cancelWorkflowRun) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'cancel',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa cancelWorkflowRun'
                                }];
                        }
                        return [4 /*yield*/, provider.cancelWorkflowRun({
                                owner: (await provider.getCurrentUser()).login,
                                repo: params.repo,
                                run_id: params.run_id
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'cancel',
                                message: "Execu\u00E7\u00E3o cancelada com sucesso",
                                data: result
                            }];
                    case 2:
                        error_3 = _a.sent();
                        throw new Error("Falha ao cancelar execu\u00E7\u00E3o: ".concat(error_3));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Re-executa workflow
     */
    rerunWorkflow: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!provider.rerunWorkflow) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'rerun-workflow',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa rerunWorkflow'
                                }];
                        }
                        return [4 /*yield*/, provider.rerunWorkflow({
                                owner: (await provider.getCurrentUser()).login,
                                repo: params.repo,
                                run_id: params.run_id
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'rerun',
                                message: "Workflow re-executado com sucesso",
                                data: result
                            }];
                    case 2:
                        error_4 = _a.sent();
                        throw new Error("Falha ao re-executar workflow: ".concat(error_4));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Lista artefatos
     */
    listArtifacts: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_5;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        if (!provider.listArtifacts) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'list-artifacts',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa listArtifacts'
                                }];
                        }
                        return [4 /*yield*/, provider.listArtifacts({
                                owner: (await provider.getCurrentUser()).login,
                                repo: params.repo,
                                run_id: params.run_id,
                                page: params.page,
                                limit: params.limit
                            })];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'artifacts',
                                message: "".concat(((_a = result.artifacts) === null || _a === void 0 ? void 0 : _a.length) || 0, " artefatos encontrados"),
                                data: result
                            }];
                    case 2:
                        error_5 = _b.sent();
                        throw new Error("Falha ao listar artefatos: ".concat(error_5));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Lista secrets (read-only)
     */
    listSecrets: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_6;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        if (!provider.listSecrets) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'list-secrets',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa listSecrets'
                                }];
                        }
                        return [4 /*yield*/, provider.listSecrets({
                                owner: (await provider.getCurrentUser()).login,
                                repo: params.repo,
                                page: params.page,
                                limit: params.limit
                            })];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'secrets',
                                message: "".concat(((_a = result.secrets) === null || _a === void 0 ? void 0 : _a.length) || 0, " secrets encontrados"),
                                data: result
                            }];
                    case 2:
                        error_6 = _b.sent();
                        throw new Error("Falha ao listar secrets: ".concat(error_6));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Lista jobs de uma execução
     */
    listJobs: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_7;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        if (!provider.listJobs) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'list-jobs',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa listJobs'
                                }];
                        }
                        return [4 /*yield*/, provider.listJobs({
                                owner: (await provider.getCurrentUser()).login,
                                repo: params.repo,
                                run_id: params.run_id,
                                page: params.page,
                                limit: params.limit
                            })];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'jobs',
                                message: "".concat(((_a = result.jobs) === null || _a === void 0 ? void 0 : _a.length) || 0, " jobs encontrados"),
                                data: result
                            }];
                    case 2:
                        error_7 = _b.sent();
                        throw new Error("Falha ao listar jobs: ".concat(error_7));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Baixa artefato
     */
    downloadArtifact: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!provider.downloadArtifact) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'download-artifact',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa downloadArtifact'
                                }];
                        }
                        return [4 /*yield*/, provider.downloadArtifact({
                                owner: (await provider.getCurrentUser()).login,
                                repo: params.repo,
                                artifact_id: params.artifact_id,
                                artifact_name: params.artifact_name,
                                download_path: params.download_path
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'download-artifact',
                                message: "Artefato baixado com sucesso",
                                data: result
                            }];
                    case 2:
                        error_8 = _a.sent();
                        throw new Error("Falha ao baixar artefato: ".concat(error_8));
                    case 3: return [2 /*return*/];
                }
            });
        });
    }
};
