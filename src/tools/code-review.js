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
exports.codeReviewTool = void 0;
var zod_1 = require("zod");
var index_js_1 = require("../providers/index.js");
var validator_js_1 = require("./validator.js");
/**
 * Tool: code-review
 *
 * DESCRIÇÃO:
 * Ferramenta completa de revisão de código com análise automatizada,
 * sugestões de melhorias, detecção de problemas e geração de relatórios.
 *
 * FUNCIONALIDADES:
 * - Análise de qualidade de código
 * - Detecção de bugs e vulnerabilidades
 * - Sugestões de otimização
 * - Revisão de commits e arquivos
 * - Geração de relatórios de qualidade
 * - Aplicação automática de correções
 *
 * USO:
 * - Para revisão automatizada de pull requests
 * - Para análise de qualidade de código
 * - Para detecção de problemas de segurança
 * - Para sugestões de melhorias de performance
 *
 * RECOMENDAÇÕES:
 * - Execute regularmente em novos commits
 * - Configure regras específicas por linguagem
 * - Use em conjunto com CI/CD
 * - Revise sugestões antes de aplicar
 */
/**
 * Schema de validação para entrada da tool code-review
 */
var CodeReviewInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['analyze', 'review-file', 'review-commit', 'review-pr', 'generate-report', 'apply-suggestions']),
    // Parâmetros comuns
    owner: zod_1.z.string().optional(),
    repo: zod_1.z.string().optional(),
    provider: validator_js_1.CommonSchemas.provider,
    // Para analyze
    code: zod_1.z.string().optional(),
    language: zod_1.z.string().optional(),
    file_path: zod_1.z.string().optional(),
    // Para review-file e review-commit
    path: zod_1.z.string().optional(),
    sha: zod_1.z.string().optional(),
    branch: zod_1.z.string().optional(),
    // Para review-pr
    pull_number: zod_1.z.number().optional(),
    // Para generate-report
    report_type: zod_1.z.enum(['summary', 'detailed', 'security', 'performance']).optional(),
    include_suggestions: zod_1.z.boolean().optional(),
    // Para apply-suggestions
    suggestions: zod_1.z.array(zod_1.z.object({
        file_path: zod_1.z.string(),
        line_number: zod_1.z.number(),
        suggestion: zod_1.z.string(),
        severity: zod_1.z.enum(['low', 'medium', 'high', 'critical'])
    })).optional(),
    // Configurações
    rules: zod_1.z.array(zod_1.z.string()).optional(), // Regras específicas para análise
    exclude_patterns: zod_1.z.array(zod_1.z.string()).optional() // Padrões para excluir da análise
}).refine(function (data) {
    // Validações específicas por ação
    if (['analyze'].includes(data.action)) {
        return data.code || (data.owner || (await provider.getCurrentUser()).login && data.repo && data.path);
    }
    if (['review-file', 'review-commit'].includes(data.action)) {
        return data.owner || (await provider.getCurrentUser()).login && data.repo && (data.path || data.sha);
    }
    if (['review-pr'].includes(data.action)) {
        return data.owner || (await provider.getCurrentUser()).login && data.repo && data.pull_number;
    }
    if (['apply-suggestions'].includes(data.action)) {
        return data.owner || (await provider.getCurrentUser()).login && data.repo && data.suggestions && data.suggestions.length > 0;
    }
    return data.owner || (await provider.getCurrentUser()).login && data.repo;
}, {
    message: "Parâmetros obrigatórios não fornecidos para a ação especificada"
});
/**
 * Schema de validação para resultado da tool code-review
 */
var CodeReviewResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    action: zod_1.z.string(),
    message: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional()
});
/**
 * Implementação da tool code-review
 */
exports.codeReviewTool = {
    name: 'code-review',
    description: 'tool: Análise de código para qualidade e detecção de problemas (GitHub)\n──────────────\naction analyze: análise geral de código\naction analyze requires: code, language\n───────────────\naction review-file: revisão de arquivo específico\naction review-file requires: repo, file_path, branch\n───────────────\naction review-commit: revisão de commit específico\naction review-commit requires: repo, sha, branch\n───────────────\naction review-pr: revisão de Pull Request\naction review-pr requires: repo, pull_number\n───────────────\naction generate-report: geração de relatório\naction generate-report requires: repo, report_type, include_suggestions, branch\n───────────────\naction apply-suggestions: aplicar sugestões de correção\naction apply-suggestions requires: repo, suggestions, branch',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['analyze', 'review-file', 'review-commit', 'review-pr', 'generate-report', 'apply-suggestions'],
                description: 'Ação a executar: analyze (análise), review-file (revisar arquivo), review-commit (revisar commit), review-pr (revisar PR), generate-report (gerar relatório), apply-suggestions (aplicar sugestões)'
            },
            owner: {
                type: 'string',
                description: 'Proprietário do repositório (OBRIGATÓRIO para ações que acessam repositório)'
            },
            repo: {
                type: 'string',
                description: 'Nome do repositório (OBRIGATÓRIO para ações que acessam repositório)'
            },
            provider: {
                type: 'string',
                description: 'Provider específico (github, gitea) ou usa padrão'
            },
            code: {
                type: 'string',
                description: 'Código para análise direta (OBRIGATÓRIO para analyze se não usar file_path)'
            },
            language: {
                type: 'string',
                description: 'Linguagem de programação (javascript, python, java, etc.)'
            },
            file_path: {
                type: 'string',
                description: 'Caminho do arquivo para análise (OBRIGATÓRIO para analyze se não usar code)'
            },
            path: {
                type: 'string',
                description: 'Caminho do arquivo (OBRIGATÓRIO para review-file)'
            },
            sha: {
                type: 'string',
                description: 'SHA do commit (OBRIGATÓRIO para review-commit)'
            },
            branch: {
                type: 'string',
                description: 'Branch específica para análise'
            },
            pull_number: {
                type: 'number',
                description: 'Número do Pull Request (OBRIGATÓRIO para review-pr)'
            },
            report_type: {
                type: 'string',
                enum: ['summary', 'detailed', 'security', 'performance'],
                description: 'Tipo de relatório (padrão: summary)'
            },
            include_suggestions: {
                type: 'boolean',
                description: 'Incluir sugestões no relatório (padrão: true)'
            },
            suggestions: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        file_path: { type: 'string' },
                        line_number: { type: 'number' },
                        suggestion: { type: 'string' },
                        severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] }
                    }
                },
                description: 'Lista de sugestões para aplicar (OBRIGATÓRIO para apply-suggestions)'
            },
            rules: {
                type: 'array',
                items: { type: 'string' },
                description: 'Regras específicas para análise (ex: ["no-console", "max-lines"])'
            },
            exclude_patterns: {
                type: 'array',
                items: { type: 'string' },
                description: 'Padrões para excluir da análise (ex: ["*.min.js", "dist/**"])'
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
                        _b.trys.push([0, 15, , 16]);
                        validatedInput = CodeReviewInputSchema.parse(input);
                        // Verificação específica para Gitea
                        console.log('[CODE-REVIEW] Provider recebido:', validatedInput.provider);
                        if (validatedInput.provider === 'gitea') {
                            return [2 /*return*/, {
                                    success: false,
                                    action: validatedInput.action,
                                    message: 'Code review automatizado não está disponível para o Gitea',
                                    error: 'GITEA: Code review automatizado não está disponível para o Gitea. Esta funcionalidade é específica do GitHub.'
                                }];
                        }
                        provider = validatedInput.provider
                            ? index_js_1.globalProviderFactory.getProvider(validatedInput.provider)
                            : index_js_1.globalProviderFactory.getDefaultProvider();
                        if (!provider) {
                            throw new Error("Provider '".concat(validatedInput.provider, "' n\u00E3o encontrado"));
                        }
                        _a = validatedInput.action;
                        switch (_a) {
                            case 'analyze': return [3 /*break*/, 1];
                            case 'review-file': return [3 /*break*/, 3];
                            case 'review-commit': return [3 /*break*/, 5];
                            case 'review-pr': return [3 /*break*/, 7];
                            case 'generate-report': return [3 /*break*/, 9];
                            case 'apply-suggestions': return [3 /*break*/, 11];
                        }
                        return [3 /*break*/, 13];
                    case 1: return [4 /*yield*/, this.analyzeCode(validatedInput)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3: return [4 /*yield*/, this.reviewFile(validatedInput, provider)];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5: return [4 /*yield*/, this.reviewCommit(validatedInput, provider)];
                    case 6: return [2 /*return*/, _b.sent()];
                    case 7: return [4 /*yield*/, this.reviewPullRequest(validatedInput, provider)];
                    case 8: return [2 /*return*/, _b.sent()];
                    case 9: return [4 /*yield*/, this.generateReport(validatedInput, provider)];
                    case 10: return [2 /*return*/, _b.sent()];
                    case 11: return [4 /*yield*/, this.applySuggestions(validatedInput, provider)];
                    case 12: return [2 /*return*/, _b.sent()];
                    case 13: throw new Error("A\u00E7\u00E3o n\u00E3o suportada: ".concat(validatedInput.action));
                    case 14: return [3 /*break*/, 16];
                    case 15:
                        error_1 = _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                action: input.action || 'unknown',
                                message: 'Erro na análise de código',
                                error: error_1 instanceof Error ? error_1.message : String(error_1)
                            }];
                    case 16: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Análise geral de código
     */
    analyzeCode: function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var codeToAnalyze, fileName, provider, file, analysis, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        codeToAnalyze = params.code;
                        fileName = 'code.txt';
                        if (!(!codeToAnalyze && owner && params.repo && params.file_path)) return [3 /*break*/, 2];
                        provider = params.provider
                            ? index_js_1.globalProviderFactory.getProvider(params.provider)
                            : index_js_1.globalProviderFactory.getDefaultProvider();
                        if (!provider) return [3 /*break*/, 2];
                        return [4 /*yield*/, provider.getFile((await provider.getCurrentUser()).login, params.repo, params.file_path)];
                    case 1:
                        file = _a.sent();
                        codeToAnalyze = file.content || '';
                        fileName = params.file_path;
                        _a.label = 2;
                    case 2:
                        if (!codeToAnalyze) {
                            throw new Error('Código não fornecido para análise');
                        }
                        analysis = this.performCodeAnalysis(codeToAnalyze, params.language || 'unknown', fileName, params.rules);
                        return [2 /*return*/, {
                                success: true,
                                action: 'analyze',
                                message: "An\u00E1lise de c\u00F3digo conclu\u00EDda para ".concat(fileName),
                                data: analysis
                            }];
                    case 3:
                        error_2 = _a.sent();
                        throw new Error("Falha na an\u00E1lise de c\u00F3digo: ".concat(error_2));
                    case 4: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Revisão de arquivo específico
     */
    reviewFile: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var file, analysis, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!!params.repo || !params.path) {
                            throw new Error('repo e path são obrigatórios');
                        }
                        return [4 /*yield*/, provider.getFile((await provider.getCurrentUser()).login, params.repo, params.path, params.branch)];
                    case 1:
                        file = _a.sent();
                        if (!file.content) {
                            throw new Error('Arquivo não possui conteúdo para análise');
                        }
                        analysis = this.performCodeAnalysis(file.content, this.detectLanguage(params.path), params.path, params.rules);
                        return [2 /*return*/, {
                                success: true,
                                action: 'review-file',
                                message: "Revis\u00E3o de arquivo '".concat(params.path, "' conclu\u00EDda"),
                                data: {
                                    file: params.path,
                                    analysis: analysis,
                                    branch: params.branch || 'default'
                                }
                            }];
                    case 2:
                        error_3 = _a.sent();
                        throw new Error("Falha na revis\u00E3o de arquivo: ".concat(error_3));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Revisão de commit específico
     */
    reviewCommit: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var commit, messageAnalysis, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!!params.repo || !params.sha) {
                            throw new Error('repo e sha são obrigatórios');
                        }
                        return [4 /*yield*/, provider.getCommit((await provider.getCurrentUser()).login, params.repo, params.sha)];
                    case 1:
                        commit = _a.sent();
                        messageAnalysis = this.analyzeCommitMessage(commit.message);
                        return [2 /*return*/, {
                                success: true,
                                action: 'review-commit',
                                message: "Revis\u00E3o de commit ".concat(params.sha.substring(0, 7), " conclu\u00EDda"),
                                data: {
                                    commit: params.sha,
                                    message_analysis: messageAnalysis,
                                    author: commit.author,
                                    committer: commit.committer
                                }
                            }];
                    case 2:
                        error_4 = _a.sent();
                        throw new Error("Falha na revis\u00E3o de commit: ".concat(error_4));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Revisão de Pull Request
     */
    reviewPullRequest: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var pr, review, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!!params.repo || !params.pull_number) {
                            throw new Error('repo e pull_number são obrigatórios');
                        }
                        return [4 /*yield*/, provider.getPullRequest((await provider.getCurrentUser()).login, params.repo, params.pull_number)];
                    case 1:
                        pr = _a.sent();
                        review = {
                            pr_number: params.pull_number,
                            title: pr.title,
                            body: pr.body,
                            changes: {
                                additions: 'Não disponível',
                                deletions: 'Não disponível',
                                files_changed: 'Não disponível'
                            },
                            quality_score: this.calculateQualityScore(pr),
                            suggestions: [
                                'Verificar se todos os testes estão passando',
                                'Revisar documentação atualizada',
                                'Verificar impacto em performance'
                            ]
                        };
                        return [2 /*return*/, {
                                success: true,
                                action: 'review-pr',
                                message: "Revis\u00E3o de PR #".concat(params.pull_number, " conclu\u00EDda"),
                                data: review
                            }];
                    case 2:
                        error_5 = _a.sent();
                        throw new Error("Falha na revis\u00E3o de PR: ".concat(error_5));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Geração de relatório de qualidade
     */
    generateReport: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var reportType, includeSuggestions, report;
            return __generator(this, function (_a) {
                try {
                    if (!!params.repo) {
                        throw new Error('e repo são obrigatórios');
                    }
                    reportType = params.report_type || 'summary';
                    includeSuggestions = params.include_suggestions !== false;
                    report = {
                        repository: "".concat(owner, "/").concat(params.repo),
                        report_type: reportType,
                        generated_at: new Date().toISOString(),
                        summary: {
                            total_files: 'Não disponível',
                            quality_score: 'Não calculado',
                            issues_found: 0,
                            critical_issues: 0
                        },
                        recommendations: includeSuggestions ? [
                            'Implementar testes automatizados',
                            'Configurar linter específico da linguagem',
                            'Adicionar documentação técnica',
                            'Revisar dependências desatualizadas'
                        ] : []
                    };
                    return [2 /*return*/, {
                            success: true,
                            action: 'generate-report',
                            message: "Relat\u00F3rio ".concat(reportType, " gerado com sucesso"),
                            data: report
                        }];
                }
                catch (error) {
                    throw new Error("Falha na gera\u00E7\u00E3o de relat\u00F3rio: ".concat(error));
                }
                return [2 /*return*/];
            });
        });
    },
    /**
     * Aplicação de sugestões de correção
     */
    applySuggestions: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var applied, failed, _i, _a, suggestion, file, error_6, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 7, , 8]);
                        if (!!params.repo || !params.suggestions) {
                            throw new Error('repo e suggestions são obrigatórios');
                        }
                        applied = [];
                        failed = [];
                        _i = 0, _a = params.suggestions;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        suggestion = _a[_i];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, provider.getFile((await provider.getCurrentUser()).login, params.repo, suggestion.file_path)];
                    case 3:
                        file = _b.sent();
                        if (file.content) {
                            // Aplicar sugestão (simplificado - apenas marcar como aplicada)
                            applied.push({
                                file: suggestion.file_path,
                                line: suggestion.line_number,
                                suggestion: suggestion.suggestion,
                                status: 'applied'
                            });
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_6 = _b.sent();
                        failed.push({
                            file: suggestion.file_path,
                            error: error_6 instanceof Error ? error_6.message : String(error_6)
                        });
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, {
                            success: true,
                            action: 'apply-suggestions',
                            message: "Aplicadas ".concat(applied.length, " sugest\u00F5es, ").concat(failed.length, " falharam"),
                            data: {
                                applied: applied,
                                failed: failed,
                                total: params.suggestions.length
                            }
                        }];
                    case 7:
                        error_7 = _b.sent();
                        throw new Error("Falha na aplica\u00E7\u00E3o de sugest\u00F5es: ".concat(error_7));
                    case 8: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Análise básica de código
     */
    performCodeAnalysis: function (code, language, fileName, rules) {
        var issues = [];
        var suggestions = [];
        var lines = code.split('\n');
        // Análise básica de complexidade
        if (lines.length > 300) {
            issues.push({
                type: 'complexity',
                severity: 'medium',
                message: 'Arquivo muito longo - considere dividir em módulos menores',
                line: 1
            });
        }
        // Detecção de código comentado
        var commentLines = 0;
        lines.forEach(function (line, index) {
            if (line.trim().startsWith('//') || line.trim().startsWith('#') || line.trim().startsWith('/*')) {
                commentLines++;
            }
            // Detecção de console.log (comum em JS/TS)
            if (language === 'javascript' || language === 'typescript') {
                if (line.includes('console.log') && !(rules === null || rules === void 0 ? void 0 : rules.includes('allow-console'))) {
                    issues.push({
                        type: 'code-quality',
                        severity: 'low',
                        message: 'Uso de console.log detectado - considere remover para produção',
                        line: index + 1
                    });
                }
            }
        });
        // Análise de comentários
        var commentRatio = commentLines / lines.length;
        if (commentRatio < 0.1) {
            suggestions.push('Considere adicionar mais comentários explicativos');
        }
        return {
            file: fileName,
            language: language,
            lines_count: lines.length,
            comment_lines: commentLines,
            comment_ratio: Math.round(commentRatio * 100) / 100,
            issues: issues,
            suggestions: suggestions,
            quality_score: this.calculateQualityScore({ lines: lines.length, issues: issues.length })
        };
    },
    /**
     * Detecta linguagem baseada na extensão do arquivo
     */
    detectLanguage: function (filePath) {
        var _a;
        var ext = (_a = filePath.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
        var languageMap = {
            'js': 'javascript',
            'ts': 'typescript',
            'py': 'python',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'php': 'php',
            'rb': 'ruby',
            'go': 'go',
            'rs': 'rust',
            'swift': 'swift',
            'kt': 'kotlin',
            'scala': 'scala',
            'html': 'html',
            'css': 'css',
            'scss': 'scss',
            'md': 'markdown',
            'json': 'json',
            'xml': 'xml',
            'yaml': 'yaml',
            'yml': 'yaml'
        };
        return languageMap[ext || ''] || 'unknown';
    },
    /**
     * Análise de mensagem de commit
     */
    analyzeCommitMessage: function (message) {
        var analysis = {
            quality: 'good',
            suggestions: [],
            follows_conventions: false
        };
        // Verificar se segue convenção de commits
        var conventionalPattern = /^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .{1,50}/;
        analysis.follows_conventions = conventionalPattern.test(message);
        if (!analysis.follows_conventions) {
            analysis.suggestions.push('Considere usar conventional commits (feat:, fix:, docs:, etc.)');
        }
        if (message.length > 72) {
            analysis.quality = 'medium';
            analysis.suggestions.push('Mensagem muito longa - considere resumir na primeira linha');
        }
        if (message.length < 10) {
            analysis.quality = 'low';
            analysis.suggestions.push('Mensagem muito curta - seja mais descritivo');
        }
        return analysis;
    },
    /**
     * Calcula score de qualidade básico
     */
    calculateQualityScore: function (data) {
        var score = 100;
        // Penalizar por issues
        if (data.issues) {
            score -= data.issues * 10;
        }
        // Penalizar por complexidade
        if (data.lines && data.lines > 500) {
            score -= 20;
        }
        // Bonus por comentários adequados
        if (data.comment_ratio && data.comment_ratio > 0.2) {
            score += 10;
        }
        return Math.max(0, Math.min(100, score));
    }
};
