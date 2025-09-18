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
exports.analyticsTool = void 0;
var zod_1 = require("zod");
var index_js_1 = require("../providers/index.js");
var validator_js_1 = require("./validator.js");
/**
 * Tool: analytics
 *
 * DESCRIÇÃO:
 * Gerenciamento completo de analytics e insights com múltiplas ações
 *
 * FUNCIONALIDADES:
 * - Estatísticas de tráfego
 * - Análise de contribuidores
 * - Atividade do repositório
 * - Métricas de performance
 * - Geração de relatórios customizados
 * - Análise de tendências
 *
 * USO:
 * - Para monitorar performance do repositório
 * - Para análise de contribuições
 * - Para relatórios de atividade
 * - Para insights de desenvolvimento
 *
 * RECOMENDAÇÕES:
 * - Monitore métricas regularmente
 * - Use insights para melhorar workflow
 * - Gere relatórios periódicos
 * - Analise tendências de contribuição
 */
/**
 * Schema de validação para entrada da tool analytics
 */
var AnalyticsInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['traffic', 'contributors', 'activity', 'performance', 'reports', 'trends', 'insights']),
    // Parâmetros comuns
    repo: validator_js_1.CommonSchemas.repo,
    provider: validator_js_1.CommonSchemas.provider,
    // Parâmetros para listagem
    page: validator_js_1.CommonSchemas.page,
    limit: validator_js_1.CommonSchemas.limit,
    // Parâmetros de período
    period: zod_1.z.enum(['day', 'week', 'month', 'quarter', 'year']).optional(),
    start_date: zod_1.z.string().optional(),
    end_date: zod_1.z.string().optional(),
    // Parâmetros para tráfego
    metric_type: zod_1.z.enum(['views', 'clones', 'visitors', 'unique_visitors']).optional(),
    // Parâmetros para contribuidores
    contributor_type: zod_1.z.enum(['all', 'internal', 'external', 'bots']).optional(),
    sort_by: zod_1.z.enum(['commits', 'additions', 'deletions', 'contributions']).optional(),
    // Parâmetros para atividade
    activity_type: zod_1.z.enum(['commits', 'issues', 'pulls', 'releases', 'all']).optional(),
    branch: validator_js_1.CommonSchemas.branch,
    // Parâmetros para performance
    performance_metric: zod_1.z.enum(['build_time', 'test_coverage', 'code_quality', 'deployment_frequency']).optional(),
    // Parâmetros para relatórios
    report_type: zod_1.z.enum(['summary', 'detailed', 'trends', 'comparison']).optional(),
    report_format: zod_1.z.enum(['json', 'csv', 'pdf', 'html']).optional(),
    include_charts: validator_js_1.CommonSchemas.boolean,
    // Parâmetros para trends
    trend_metric: zod_1.z.enum(['commits', 'contributors', 'issues', 'stars', 'forks']).optional(),
    trend_period: zod_1.z.enum(['daily', 'weekly', 'monthly']).optional(),
    // Filtros
    author: validator_js_1.CommonSchemas.shortString,
    path: validator_js_1.CommonSchemas.mediumString,
    file_type: validator_js_1.CommonSchemas.shortString
}).refine(function (data) {
    return data.owner || (await provider.getCurrentUser()).login && data.repo;
}, {
    message: "Owner e repo são obrigatórios"
});
/**
 * Schema de validação para resultado da tool analytics
 */
var AnalyticsResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    action: zod_1.z.string(),
    message: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional()
});
/**
 * Implementação da tool analytics
 */
exports.analyticsTool = {
    name: 'analytics',
    description: 'tool: Gera insights e métricas de repositório (GitHub/Gitea) para análise\n──────────────\naction traffic: estatísticas de tráfego do repositório\naction traffic requires: repo, metric_type, period, start_date, end_date\n───────────────\naction contributors: análise de contribuidores\naction contributors requires: repo, contributor_type, sort_by, period, start_date, end_date, page, limit\n───────────────\naction activity: atividade do repositório\naction activity requires: repo, activity_type, branch, author, period, start_date, end_date\n───────────────\naction performance: métricas de performance\naction performance requires: repo, performance_metric, period, start_date, end_date\n───────────────\naction reports: relatórios customizados\naction reports requires: repo, report_type, report_format, include_charts, period, start_date, end_date\n───────────────\naction trends: análise de tendências\naction trends requires: repo, trend_metric, trend_period, period, start_date, end_date\n───────────────\naction insights: insights gerais do repositório\naction insights requires: repo, period, start_date, end_date, include_charts',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['traffic', 'contributors', 'activity', 'performance', 'reports', 'trends', 'insights'],
                description: 'Ação a executar: traffic (tráfego), contributors (contribuidores), activity (atividade), performance (performance), reports (relatórios), trends (tendências), insights (insights gerais)'
            },
            owner: {
                type: 'string',
                description: 'Proprietário do repositório (OBRIGATÓRIO para todas as ações)'
            },
            repo: {
                type: 'string',
                description: 'Nome do repositório (OBRIGATÓRIO para todas as ações)'
            },
            provider: {
                type: 'string',
                description: 'Provider específico (github, gitea) ou usa padrão'
            },
            period: {
                type: 'string',
                enum: ['day', 'week', 'month', 'quarter', 'year'],
                description: 'Período de análise (padrão: week para traffic, month para outros)'
            },
            start_date: {
                type: 'string',
                description: 'Data inicial para análise (formato: YYYY-MM-DD)'
            },
            end_date: {
                type: 'string',
                description: 'Data final para análise (formato: YYYY-MM-DD)'
            },
            metric_type: {
                type: 'string',
                enum: ['views', 'clones', 'visitors', 'unique_visitors'],
                description: 'Tipo de métrica de tráfego (OBRIGATÓRIO para traffic, padrão: views)'
            },
            contributor_type: {
                type: 'string',
                enum: ['all', 'internal', 'external', 'bots'],
                description: 'Tipo de contribuidores (padrão: all)'
            },
            sort_by: {
                type: 'string',
                enum: ['commits', 'additions', 'deletions', 'contributions'],
                description: 'Ordenar contribuidores por (padrão: commits)'
            },
            activity_type: {
                type: 'string',
                enum: ['commits', 'issues', 'pulls', 'releases', 'all'],
                description: 'Tipo de atividade (padrão: all)'
            },
            branch: {
                type: 'string',
                description: 'Branch específico para análise'
            },
            performance_metric: {
                type: 'string',
                enum: ['build_time', 'test_coverage', 'code_quality', 'deployment_frequency'],
                description: 'Métrica de performance específica'
            },
            report_type: {
                type: 'string',
                enum: ['summary', 'detailed', 'trends', 'comparison'],
                description: 'Tipo de relatório (padrão: summary)'
            },
            report_format: {
                type: 'string',
                enum: ['json', 'csv', 'pdf', 'html'],
                description: 'Formato do relatório (padrão: json)'
            },
            include_charts: {
                type: 'boolean',
                description: 'Incluir gráficos no relatório (padrão: false)'
            },
            trend_metric: {
                type: 'string',
                enum: ['commits', 'contributors', 'issues', 'stars', 'forks'],
                description: 'Métrica para análise de tendências (padrão: commits)'
            },
            trend_period: {
                type: 'string',
                enum: ['daily', 'weekly', 'monthly'],
                description: 'Período para análise de tendências (padrão: weekly)'
            },
            author: {
                type: 'string',
                description: 'Filtrar por autor específico'
            },
            path: {
                type: 'string',
                description: 'Filtrar por caminho específico'
            },
            file_type: {
                type: 'string',
                description: 'Filtrar por tipo de arquivo'
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
                        validatedInput = AnalyticsInputSchema.parse(input);
                        provider = validatedInput.provider
                            ? index_js_1.globalProviderFactory.getProvider(validatedInput.provider)
                            : index_js_1.globalProviderFactory.getDefaultProvider();
                        if (!provider) {
                            throw new Error("Provider '".concat(validatedInput.provider, "' n\u00E3o encontrado"));
                        }
                        _a = validatedInput.action;
                        switch (_a) {
                            case 'traffic': return [3 /*break*/, 1];
                            case 'contributors': return [3 /*break*/, 3];
                            case 'activity': return [3 /*break*/, 5];
                            case 'performance': return [3 /*break*/, 7];
                            case 'reports': return [3 /*break*/, 9];
                            case 'trends': return [3 /*break*/, 11];
                            case 'insights': return [3 /*break*/, 13];
                        }
                        return [3 /*break*/, 15];
                    case 1: return [4 /*yield*/, this.getTrafficStats(validatedInput, provider)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3: return [4 /*yield*/, this.analyzeContributors(validatedInput, provider)];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5: return [4 /*yield*/, this.getActivityStats(validatedInput, provider)];
                    case 6: return [2 /*return*/, _b.sent()];
                    case 7: return [4 /*yield*/, this.getPerformanceMetrics(validatedInput, provider)];
                    case 8: return [2 /*return*/, _b.sent()];
                    case 9: return [4 /*yield*/, this.generateReports(validatedInput, provider)];
                    case 10: return [2 /*return*/, _b.sent()];
                    case 11: return [4 /*yield*/, this.analyzeTrends(validatedInput, provider)];
                    case 12: return [2 /*return*/, _b.sent()];
                    case 13: return [4 /*yield*/, this.getRepositoryInsights(validatedInput, provider)];
                    case 14: return [2 /*return*/, _b.sent()];
                    case 15: throw new Error("A\u00E7\u00E3o n\u00E3o suportada: ".concat(validatedInput.action));
                    case 16: return [3 /*break*/, 18];
                    case 17:
                        error_1 = _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                action: input.action || 'unknown',
                                message: 'Erro na operação de analytics',
                                error: error_1 instanceof Error ? error_1.message : String(error_1)
                            }];
                    case 18: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Obtém estatísticas de tráfego
     */
    getTrafficStats: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!provider.getTrafficStats) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'get-traffic-stats',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa getTrafficStats'
                                }];
                        }
                        return [4 /*yield*/, provider.getTrafficStats({
                                owner: (await provider.getCurrentUser()).login,
                                repo: params.repo,
                                metric_type: params.metric_type || 'views',
                                period: params.period || 'week',
                                start_date: params.start_date,
                                end_date: params.end_date
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'traffic',
                                message: "Estat\u00EDsticas de tr\u00E1fego obtidas com sucesso",
                                data: result
                            }];
                    case 2:
                        error_2 = _a.sent();
                        throw new Error("Falha ao obter estat\u00EDsticas de tr\u00E1fego: ".concat(error_2));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Analisa contribuidores
     */
    analyzeContributors: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!provider.analyzeContributors) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'analyze-contributors',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa analyzeContributors'
                                }];
                        }
                        return [4 /*yield*/, provider.analyzeContributors({
                                owner: (await provider.getCurrentUser()).login,
                                repo: params.repo,
                                contributor_type: params.contributor_type || 'all',
                                sort_by: params.sort_by || 'commits',
                                period: params.period,
                                start_date: params.start_date,
                                end_date: params.end_date,
                                page: params.page,
                                limit: params.limit
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'contributors',
                                message: "An\u00E1lise de contribuidores executada com sucesso",
                                data: result
                            }];
                    case 2:
                        error_3 = _a.sent();
                        throw new Error("Falha ao analisar contribuidores: ".concat(error_3));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Obtém estatísticas de atividade
     */
    getActivityStats: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!provider.getActivityStats) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'get-activity-stats',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa getActivityStats'
                                }];
                        }
                        return [4 /*yield*/, provider.getActivityStats({
                                owner: (await provider.getCurrentUser()).login,
                                repo: params.repo,
                                activity_type: params.activity_type || 'all',
                                branch: params.branch,
                                author: params.author,
                                period: params.period || 'month',
                                start_date: params.start_date,
                                end_date: params.end_date
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'activity',
                                message: "Estat\u00EDsticas de atividade obtidas com sucesso",
                                data: result
                            }];
                    case 2:
                        error_4 = _a.sent();
                        throw new Error("Falha ao obter estat\u00EDsticas de atividade: ".concat(error_4));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Obtém métricas de performance
     */
    getPerformanceMetrics: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!provider.getPerformanceMetrics) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'get-performance-metrics',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa getPerformanceMetrics'
                                }];
                        }
                        return [4 /*yield*/, provider.getPerformanceMetrics({
                                owner: (await provider.getCurrentUser()).login,
                                repo: params.repo,
                                performance_metric: params.performance_metric,
                                period: params.period || 'month',
                                start_date: params.start_date,
                                end_date: params.end_date
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'performance',
                                message: "M\u00E9tricas de performance obtidas com sucesso",
                                data: result
                            }];
                    case 2:
                        error_5 = _a.sent();
                        throw new Error("Falha ao obter m\u00E9tricas de performance: ".concat(error_5));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Gera relatórios customizados
     */
    generateReports: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!provider.generateReports) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'generate-reports',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa generateReports'
                                }];
                        }
                        return [4 /*yield*/, provider.generateReports({
                                owner: (await provider.getCurrentUser()).login,
                                repo: params.repo,
                                report_type: params.report_type || 'summary',
                                report_format: params.report_format || 'json',
                                include_charts: params.include_charts || false,
                                period: params.period || 'month',
                                start_date: params.start_date,
                                end_date: params.end_date
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'reports',
                                message: "Relat\u00F3rio gerado com sucesso",
                                data: result
                            }];
                    case 2:
                        error_6 = _a.sent();
                        throw new Error("Falha ao gerar relat\u00F3rio: ".concat(error_6));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Analisa tendências
     */
    analyzeTrends: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!provider.analyzeTrends) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'analyze-trends',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa analyzeTrends'
                                }];
                        }
                        return [4 /*yield*/, provider.analyzeTrends({
                                owner: (await provider.getCurrentUser()).login,
                                repo: params.repo,
                                trend_metric: params.trend_metric || 'commits',
                                trend_period: params.trend_period || 'weekly',
                                period: params.period || 'quarter',
                                start_date: params.start_date,
                                end_date: params.end_date
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'trends',
                                message: "An\u00E1lise de tend\u00EAncias executada com sucesso",
                                data: result
                            }];
                    case 2:
                        error_7 = _a.sent();
                        throw new Error("Falha ao analisar tend\u00EAncias: ".concat(error_7));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Obtém insights gerais do repositório
     */
    getRepositoryInsights: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!provider.getRepositoryInsights) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'get-repository-insights',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa getRepositoryInsights'
                                }];
                        }
                        return [4 /*yield*/, provider.getRepositoryInsights({
                                owner: (await provider.getCurrentUser()).login,
                                repo: params.repo,
                                period: params.period || 'month',
                                start_date: params.start_date,
                                end_date: params.end_date,
                                include_charts: params.include_charts || true
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'insights',
                                message: "Insights do reposit\u00F3rio obtidos com sucesso",
                                data: result
                            }];
                    case 2:
                        error_8 = _a.sent();
                        throw new Error("Falha ao obter insights do reposit\u00F3rio: ".concat(error_8));
                    case 3: return [2 /*return*/];
                }
            });
        });
    }
};
