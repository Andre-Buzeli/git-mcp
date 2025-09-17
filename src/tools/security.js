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
exports.securityTool = void 0;
var zod_1 = require("zod");
var index_js_1 = require("../providers/index.js");
var validator_js_1 = require("./validator.js");
/**
 * Tool: security
 *
 * DESCRIÇÃO:
 * Gerenciamento completo de segurança e compliance com múltiplas ações
 *
 * FUNCIONALIDADES:
 * - Execução de scans de segurança
 * - Listagem de vulnerabilidades
 * - Gerenciamento de alertas de segurança
 * - Configuração de políticas de segurança
 * - Verificação de compliance
 * - Análise de dependências
 *
 * USO:
 * - Para monitorar vulnerabilidades
 * - Para configurar políticas de segurança
 * - Para compliance e auditoria
 * - Para análise de dependências
 *
 * RECOMENDAÇÕES:
 * - Execute scans regularmente
 * - Configure alertas automáticos
 * - Mantenha dependências atualizadas
 * - Implemente políticas rigorosas
 */
/**
 * Schema de validação para entrada da tool security
 */
var SecurityInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['scan', 'vulnerabilities', 'alerts', 'policies', 'compliance', 'dependencies', 'advisories']),
    // Parâmetros comuns
    repo: validator_js_1.CommonSchemas.repo,
    provider: validator_js_1.CommonSchemas.provider,
    // Parâmetros para listagem
    page: validator_js_1.CommonSchemas.page,
    limit: validator_js_1.CommonSchemas.limit,
    // Parâmetros para scan
    scan_type: zod_1.z.enum(['code', 'dependencies', 'secrets', 'infrastructure']).optional(),
    ref: validator_js_1.CommonSchemas.branch,
    // Parâmetros para vulnerabilidades
    severity: zod_1.z.enum(['low', 'medium', 'high', 'critical']).optional(),
    state: zod_1.z.enum(['open', 'fixed', 'dismissed']).optional(),
    ecosystem: validator_js_1.CommonSchemas.shortString,
    package_name: validator_js_1.CommonSchemas.shortString,
    // Parâmetros para alertas
    alert_id: validator_js_1.CommonSchemas.shortString,
    alert_number: zod_1.z.number().optional(),
    dismiss_reason: zod_1.z.enum(['fix_started', 'inaccurate', 'no_bandwidth', 'not_used', 'tolerable_risk']).optional(),
    dismiss_comment: validator_js_1.CommonSchemas.mediumString,
    // Parâmetros para políticas
    policy_name: validator_js_1.CommonSchemas.shortString,
    policy_type: zod_1.z.enum(['branch_protection', 'required_reviews', 'status_checks', 'restrictions']).optional(),
    policy_config: zod_1.z.record(zod_1.z.any()).optional(),
    // Parâmetros para compliance
    compliance_framework: zod_1.z.enum(['sox', 'pci', 'hipaa', 'gdpr', 'iso27001']).optional(),
    report_format: zod_1.z.enum(['json', 'csv', 'pdf']).optional(),
    // Filtros
    created_after: zod_1.z.string().optional(),
    created_before: zod_1.z.string().optional(),
    updated_after: zod_1.z.string().optional(),
    updated_before: zod_1.z.string().optional()
}).refine(function (data) {
    // Validações específicas por ação
    if (['alerts'].includes(data.action) && data.alert_id) {
        return data.owner || (await provider.getCurrentUser()).login && data.repo;
    }
    return data.owner || (await provider.getCurrentUser()).login && data.repo;
}, {
    message: "Parâmetros obrigatórios não fornecidos para a ação especificada"
});
/**
 * Schema de validação para resultado da tool security
 */
var SecurityResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    action: zod_1.z.string(),
    message: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional()
});
/**
 * Implementação da tool security
 */
exports.securityTool = {
    name: 'security',
    description: 'Manage security and compliance with multiple actions: scan, vulnerabilities, alerts, policies, compliance, dependencies. Suporte completo a GitHub Security e Gitea Security simultaneamente. Boas práticas: execute scans regularmente, configure alertas automáticos, mantenha dependências atualizadas e implemente políticas rigorosas.',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['scan', 'vulnerabilities', 'alerts', 'policies', 'compliance', 'dependencies', 'advisories'],
                description: 'Action to perform on security'
            },
            repo: { type: 'string', description: 'Repository name' },
            provider: { type: 'string', description: 'Specific provider (github, gitea) or use default' },
            scan_type: { type: 'string', enum: ['code', 'dependencies', 'secrets', 'infrastructure'], description: 'Type of security scan' },
            ref: { type: 'string', description: 'Git reference to scan' },
            severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'], description: 'Vulnerability severity filter' },
            state: { type: 'string', enum: ['open', 'fixed', 'dismissed'], description: 'Vulnerability state filter' },
            ecosystem: { type: 'string', description: 'Package ecosystem' },
            package_name: { type: 'string', description: 'Package name' },
            alert_id: { type: 'string', description: 'Security alert ID' },
            alert_number: { type: 'number', description: 'Security alert number' },
            dismiss_reason: { type: 'string', enum: ['fix_started', 'inaccurate', 'no_bandwidth', 'not_used', 'tolerable_risk'], description: 'Reason for dismissing alert' },
            dismiss_comment: { type: 'string', description: 'Comment for dismissing alert' },
            policy_name: { type: 'string', description: 'Security policy name' },
            policy_type: { type: 'string', enum: ['branch_protection', 'required_reviews', 'status_checks', 'restrictions'], description: 'Security policy type' },
            policy_config: { type: 'object', description: 'Security policy configuration' },
            compliance_framework: { type: 'string', enum: ['sox', 'pci', 'hipaa', 'gdpr', 'iso27001'], description: 'Compliance framework' },
            report_format: { type: 'string', enum: ['json', 'csv', 'pdf'], description: 'Report format' },
            created_after: { type: 'string', description: 'Filter items created after date' },
            created_before: { type: 'string', description: 'Filter items created before date' },
            updated_after: { type: 'string', description: 'Filter items updated after date' },
            updated_before: { type: 'string', description: 'Filter items updated before date' },
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
                        _b.trys.push([0, 17, , 18]);
                        validatedInput = SecurityInputSchema.parse(input);
                        provider = validatedInput.provider
                            ? index_js_1.globalProviderFactory.getProvider(validatedInput.provider)
                            : index_js_1.globalProviderFactory.getDefaultProvider();
                        if (!provider) {
                            throw new Error("Provider '".concat(validatedInput.provider, "' n\u00E3o encontrado"));
                        }
                        _a = validatedInput.action;
                        switch (_a) {
                            case 'scan': return [3 /*break*/, 1];
                            case 'vulnerabilities': return [3 /*break*/, 3];
                            case 'alerts': return [3 /*break*/, 5];
                            case 'policies': return [3 /*break*/, 7];
                            case 'compliance': return [3 /*break*/, 9];
                            case 'dependencies': return [3 /*break*/, 11];
                            case 'advisories': return [3 /*break*/, 13];
                        }
                        return [3 /*break*/, 15];
                    case 1: return [4 /*yield*/, this.runSecurityScan(validatedInput, provider)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3: return [4 /*yield*/, this.listVulnerabilities(validatedInput, provider)];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5: return [4 /*yield*/, this.manageSecurityAlerts(validatedInput, provider)];
                    case 6: return [2 /*return*/, _b.sent()];
                    case 7: return [4 /*yield*/, this.manageSecurityPolicies(validatedInput, provider)];
                    case 8: return [2 /*return*/, _b.sent()];
                    case 9: return [4 /*yield*/, this.checkCompliance(validatedInput, provider)];
                    case 10: return [2 /*return*/, _b.sent()];
                    case 11: return [4 /*yield*/, this.analyzeDependencies(validatedInput, provider)];
                    case 12: return [2 /*return*/, _b.sent()];
                    case 13: return [4 /*yield*/, this.listSecurityAdvisories(validatedInput, provider)];
                    case 14: return [2 /*return*/, _b.sent()];
                    case 15: throw new Error("A\u00E7\u00E3o n\u00E3o suportada: ".concat(validatedInput.action));
                    case 16: return [3 /*break*/, 18];
                    case 17:
                        error_1 = _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                action: input.action || 'unknown',
                                message: 'Erro na operação de security',
                                error: error_1 instanceof Error ? error_1.message : String(error_1)
                            }];
                    case 18: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Executa scan de segurança
     */
    runSecurityScan: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!provider.runSecurityScan) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'run-security-scan',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa runSecurityScan'
                                }];
                        }
                        return [4 /*yield*/, provider.runSecurityScan({
                                owner: (await provider.getCurrentUser()).login,
                                repo: params.repo,
                                scan_type: params.scan_type || 'code',
                                ref: params.ref || 'main'
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'scan',
                                message: "Scan de seguran\u00E7a executado com sucesso",
                                data: result
                            }];
                    case 2:
                        error_2 = _a.sent();
                        throw new Error("Falha ao executar scan de seguran\u00E7a: ".concat(error_2));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Lista vulnerabilidades
     */
    listVulnerabilities: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_3;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        if (!provider.listVulnerabilities) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'list-vulnerabilities',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa listVulnerabilities'
                                }];
                        }
                        return [4 /*yield*/, provider.listVulnerabilities({
                                owner: (await provider.getCurrentUser()).login,
                                repo: params.repo,
                                severity: params.severity,
                                state: params.state,
                                ecosystem: params.ecosystem,
                                package: params.package_name,
                                page: params.page,
                                limit: params.limit
                            })];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'vulnerabilities',
                                message: "".concat(((_a = result.vulnerabilities) === null || _a === void 0 ? void 0 : _a.length) || 0, " vulnerabilidades encontradas"),
                                data: result
                            }];
                    case 2:
                        error_3 = _b.sent();
                        throw new Error("Falha ao listar vulnerabilidades: ".concat(error_3));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Gerencia alertas de segurança
     */
    manageSecurityAlerts: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!provider.manageSecurityAlerts) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'manage-security-alerts',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa manageSecurityAlerts'
                                }];
                        }
                        return [4 /*yield*/, provider.manageSecurityAlerts({
                                owner: (await provider.getCurrentUser()).login,
                                repo: params.repo,
                                alert_id: params.alert_id,
                                alert_number: params.alert_number,
                                dismiss_reason: params.dismiss_reason,
                                dismiss_comment: params.dismiss_comment,
                                state: params.state,
                                page: params.page,
                                limit: params.limit
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'alerts',
                                message: "Alertas de seguran\u00E7a gerenciados com sucesso",
                                data: result
                            }];
                    case 2:
                        error_4 = _a.sent();
                        throw new Error("Falha ao gerenciar alertas de seguran\u00E7a: ".concat(error_4));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Gerencia políticas de segurança
     */
    manageSecurityPolicies: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!provider.manageSecurityPolicies) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'manage-security-policies',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa manageSecurityPolicies'
                                }];
                        }
                        return [4 /*yield*/, provider.manageSecurityPolicies({
                                owner: (await provider.getCurrentUser()).login,
                                repo: params.repo,
                                policy_name: params.policy_name,
                                policy_type: params.policy_type,
                                policy_config: params.policy_config,
                                page: params.page,
                                limit: params.limit
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'policies',
                                message: "Pol\u00EDticas de seguran\u00E7a gerenciadas com sucesso",
                                data: result
                            }];
                    case 2:
                        error_5 = _a.sent();
                        throw new Error("Falha ao gerenciar pol\u00EDticas de seguran\u00E7a: ".concat(error_5));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Verifica compliance
     */
    checkCompliance: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!provider.checkCompliance) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'check-compliance',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa checkCompliance'
                                }];
                        }
                        return [4 /*yield*/, provider.checkCompliance({
                                owner: (await provider.getCurrentUser()).login,
                                repo: params.repo,
                                framework: params.compliance_framework,
                                report_format: params.report_format || 'json'
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'compliance',
                                message: "Verifica\u00E7\u00E3o de compliance executada com sucesso",
                                data: result
                            }];
                    case 2:
                        error_6 = _a.sent();
                        throw new Error("Falha ao verificar compliance: ".concat(error_6));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Analisa dependências
     */
    analyzeDependencies: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!provider.analyzeDependencies) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'analyze-dependencies',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa analyzeDependencies'
                                }];
                        }
                        return [4 /*yield*/, provider.analyzeDependencies({
                                owner: (await provider.getCurrentUser()).login,
                                repo: params.repo,
                                ecosystem: params.ecosystem,
                                package: params.package_name,
                                ref: params.ref
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'dependencies',
                                message: "An\u00E1lise de depend\u00EAncias executada com sucesso",
                                data: result
                            }];
                    case 2:
                        error_7 = _a.sent();
                        throw new Error("Falha ao analisar depend\u00EAncias: ".concat(error_7));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Lista advisories de segurança
     */
    listSecurityAdvisories: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_8;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        if (!provider.listSecurityAdvisories) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'list-security-advisories',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa listSecurityAdvisories'
                                }];
                        }
                        return [4 /*yield*/, provider.listSecurityAdvisories({
                                owner: (await provider.getCurrentUser()).login,
                                repo: params.repo,
                                severity: params.severity,
                                ecosystem: params.ecosystem,
                                package: params.package_name,
                                page: params.page,
                                limit: params.limit
                            })];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'advisories',
                                message: "".concat(((_a = result.advisories) === null || _a === void 0 ? void 0 : _a.length) || 0, " advisories encontrados"),
                                data: result
                            }];
                    case 2:
                        error_8 = _b.sent();
                        throw new Error("Falha ao listar advisories: ".concat(error_8));
                    case 3: return [2 /*return*/];
                }
            });
        });
    }
};
