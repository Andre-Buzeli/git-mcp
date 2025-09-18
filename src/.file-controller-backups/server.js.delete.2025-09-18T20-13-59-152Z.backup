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
exports.GiteaMCPServer = void 0;
var index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
var stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
var types_js_1 = require("@modelcontextprotocol/sdk/types.js");
var config_js_1 = require("./config.js");
var index_js_2 = require("./providers/index.js");
/**
 * Importação de todas as ferramentas MCP disponíveis
 *
 * FERRAMENTAS INCLUÍDAS:
 * - repositories: Gerenciamento de repositórios
 * - branches: Operações com branches
 * - files: Gerenciamento de arquivos
 * - commits: Histórico de commits
 * - issues: Gerenciamento de issues
 * - pulls: Pull requests e merges
 * - releases: Gerenciamento de releases
 * - tags: Gerenciamento de tags
 * - users: Operações com usuários
 * - webhooks: Gerenciamento de webhooks
 * - code-review: Análise e revisão de código
 */
var repositories_js_1 = require("./tools/repositories.js");
var branches_js_1 = require("./tools/branches.js");
var files_js_1 = require("./tools/files.js");
var commits_js_1 = require("./tools/commits.js");
var issues_js_1 = require("./tools/issues.js");
var pulls_js_1 = require("./tools/pulls.js");
var releases_js_1 = require("./tools/releases.js");
var tags_js_1 = require("./tools/tags.js");
var users_js_1 = require("./tools/users.js");
var webhooks_js_1 = require("./tools/webhooks.js");
var git_sync_js_1 = require("./tools/git-sync.js");
var version_control_js_1 = require("./tools/version-control.js");
var workflows_js_1 = require("./tools/workflows.js");
var actions_js_1 = require("./tools/actions.js");
var deployments_js_1 = require("./tools/deployments.js");
var security_js_1 = require("./tools/security.js");
var analytics_js_1 = require("./tools/analytics.js");
var code_review_js_1 = require("./tools/code-review.js");
/**
 * Array de todas as ferramentas disponíveis
 *
 * ESTRUTURA:
 * - Cada tool deve implementar a interface Tool
 * - Nome, descrição e schema são obrigatórios
 * - Handler deve ser assíncrono e retornar resultado
 *
 * USO:
 * - Para listagem de tools disponíveis
 * - Para execução de tools específicas
 * - Para validação de parâmetros
 */
var tools = [
    repositories_js_1.repositoriesTool,
    branches_js_1.branchesTool,
    files_js_1.filesTool,
    commits_js_1.commitsTool,
    issues_js_1.issuesTool,
    pulls_js_1.pullsTool,
    releases_js_1.releasesTool,
    tags_js_1.tagsTool,
    users_js_1.usersTool,
    webhooks_js_1.webhooksTool,
    git_sync_js_1.gitSyncTool,
    version_control_js_1.versionControlTool,
    workflows_js_1.workflowsTool,
    actions_js_1.actionsTool,
    deployments_js_1.deploymentsTool,
    security_js_1.securityTool,
    analytics_js_1.analyticsTool,
    code_review_js_1.codeReviewTool
];
/**
 * Servidor MCP principal para Gitea
 *
 * RESPONSABILIDADES:
 * - Inicializar servidor MCP
 * - Registrar handlers para requests
 * - Gerenciar ciclo de vida das tools
 * - Tratar erros e validações
 *
 * ARQUITETURA:
 * - Server MCP padrão com transport stdio
 * - Handlers para list e call de tools
 * - Tratamento centralizado de erros
 *
 * RECOMENDAÇÕES:
 * - Use apenas uma instância por processo
 * - Configure handlers antes de conectar
 * - Implemente graceful shutdown
 */
var GiteaMCPServer = /** @class */ (function () {
    function GiteaMCPServer() {
        this.server = new index_js_1.Server({
            name: 'git-mcp',
            version: '2.6.2',
        });
        this.setupHandlers();
    }
    /**
     * Configura os handlers para requests MCP
     *
     * HANDLERS IMPLEMENTADOS:
     * - ListTools: Lista todas as tools disponíveis
     * - CallTool: Executa uma tool específica
     *
     * FLUXO:
     * 1. Validação de parâmetros
     * 2. Busca da tool solicitada
     * 3. Execução com tratamento de erros
     * 4. Retorno de resultado ou erro
     *
     * TRATAMENTO DE ERROS:
     * - Tool não encontrada: erro específico
     * - Erro de execução: captura e formata
     * - Erro de validação: mensagem descritiva
     */
    GiteaMCPServer.prototype.setupHandlers = function () {
        var _this = this;
        // Handler para listar tools disponíveis
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {
                        tools: tools.map(function (tool) { return ({
                            name: tool.name,
                            description: tool.description,
                            inputSchema: tool.inputSchema
                        }); })
                    }];
            });
        }); });
        // Handler para executar tools específicas
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, function (request) { return __awaiter(_this, void 0, void 0, function () {
            var _a, name, args, tool, result, error_1, errorMessage;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = request.params, name = _a.name, args = _a.arguments;
                        tool = tools.find(function (t) { return t.name === name; });
                        if (!tool) {
                            throw new Error("Tool '".concat(name, "' not found"));
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, tool.handler(args || {})];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: 'text',
                                        text: JSON.stringify(result, null, 2)
                                    }
                                ]
                            }];
                    case 3:
                        error_1 = _b.sent();
                        errorMessage = error_1 instanceof Error ? error_1.message : String(error_1);
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: 'text',
                                        text: JSON.stringify({
                                            success: false,
                                            action: name,
                                            message: 'Erro na execução da tool',
                                            error: errorMessage
                                        }, null, 2)
                                    }
                                ],
                                isError: true
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * Inicializa e executa o servidor MCP
     *
     * FLUXO DE INICIALIZAÇÃO:
     * 1. Validação de configuração
     * 2. Verificação de token obrigatório
     * 3. Conexão com transport stdio
     * 4. Log de status e debug
     *
     * VALIDAÇÕES:
     * - Token de autenticação obrigatório
     * - URL do Gitea válida
     * - Configuração de debug opcional
     *
     * RECOMENDAÇÕES:
     * - Configure DEBUG=true para desenvolvimento
     * - Valide token antes de iniciar
     * - Configure timeout adequado
     */
    GiteaMCPServer.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cfg, factory, providersInfo, transport;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cfg = config_js_1.config.getConfig();
                        if (cfg.debug) {
                            // Server starting - debug info removed for MCP protocol compliance
                        }
                        // Inicializar provider factory com configuração
                        try {
                            console.log('[SERVER] Inicializando provider factory...');
                            factory = (0, index_js_2.initializeFactoryFromEnv)();
                            providersInfo = factory.getProvidersInfo();
                            console.log('[SERVER] Providers configurados:');
                            providersInfo.forEach(function (p) {
                                console.log("  - ".concat(p.name, " (").concat(p.type, ") ").concat(p.isDefault ? '[PADRÃO]' : ''));
                            });
                            // Atualizar o globalProviderFactory com a configuração
                            Object.assign(index_js_2.globalProviderFactory, factory);
                            console.log('[SERVER] Provider factory inicializado com sucesso');
                        }
                        catch (error) {
                            console.error('[SERVER] Erro ao inicializar providers:', error);
                            throw new Error("Failed to initialize providers: ".concat(error instanceof Error ? error.message : 'Unknown error'));
                        }
                        transport = new stdio_js_1.StdioServerTransport();
                        return [4 /*yield*/, this.server.connect(transport)];
                    case 1:
                        _a.sent();
                        if (cfg.debug) {
                            // Server connected and ready
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fecha o servidor MCP graciosamente
     *
     * USO:
     * - Durante shutdown da aplicação
     * - Para limpeza de recursos
     * - Para finalização controlada
     *
     * RECOMENDAÇÕES:
     * - Sempre chame antes de sair
     * - Aguarde a conclusão da operação
     * - Trate erros de fechamento
     */
    GiteaMCPServer.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.server.close()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return GiteaMCPServer;
}());
exports.GiteaMCPServer = GiteaMCPServer;
/**
 * Handlers para sinais do sistema
 *
 * SINAIS TRATADOS:
 * - SIGINT: Interrupção do usuário (Ctrl+C)
 * - unhandledRejection: Promises rejeitadas
 * - uncaughtException: Exceções não tratadas
 *
 * COMPORTAMENTO:
 * - SIGINT: Shutdown gracioso
 * - Erros não tratados: Exit com código 1
 * - Log de erro antes de sair
 *
 * RECOMENDAÇÕES:
 * - Implemente graceful shutdown
 * - Log todos os erros fatais
 * - Use códigos de saída apropriados
 */
// Handler para interrupção do usuário (Ctrl+C)
process.on('SIGINT', function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        // Shutting down server
        process.exit(0);
        return [2 /*return*/];
    });
}); });
// Handler para promises rejeitadas não tratadas
process.on('unhandledRejection', function (reason, promise) {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
// Handler para exceções não tratadas
process.on('uncaughtException', function (error) {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
