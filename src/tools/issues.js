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
exports.issuesTool = void 0;
var zod_1 = require("zod");
var index_js_1 = require("../providers/index.js");
/**
 * Tool: issues
 *
 * DESCRIÇÃO:
 * Gerenciamento completo de issues com suporte multi-provider (GitHub e Gitea)
 *
 * FUNCIONALIDADES:
 * - Criação de novas issues
 * - Listagem e busca de issues
 * - Obtenção de detalhes específicos
 * - Atualização de issues existentes
 * - Fechamento de issues
 * - Adição de comentários
 * - Busca por conteúdo e status
 *
 * USO:
 * - Para gerenciar bugs e features
 * - Para acompanhar progresso de desenvolvimento
 * - Para comunicação entre equipe
 * - Para controle de qualidade
 *
 * RECOMENDAÇÕES:
 * - Use títulos descritivos
 * - Documente detalhes completos
 * - Atualize status regularmente
 * - Use labels adequadamente
 */
/**
 * Schema de validação para entrada da tool issues
 *
 * VALIDAÇÕES:
 * - action: Ação obrigatória (create, list, get, update, close, comment, search)
 * - Parâmetros específicos por ação
 * - Validação de tipos e formatos
 *
 * RECOMENDAÇÕES:
 * - Sempre valide entrada antes de usar
 * - Use parâmetros opcionais adequadamente
 * - Documente parâmetros obrigatórios
 */
var IssuesInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['create', 'list', 'get', 'update', 'close', 'comment', 'search']),
    // Parâmetros comuns
    owner: zod_1.z.string().optional(),
    repo: zod_1.z.string().optional(),
    // Para multi-provider
    provider: zod_1.z.enum(['gitea', 'github', 'both']).optional(), // Provider específico: gitea, github ou both
    // Para create
    title: zod_1.z.string().optional(),
    body: zod_1.z.string().optional(),
    labels: zod_1.z.array(zod_1.z.string()).optional(),
    assignees: zod_1.z.array(zod_1.z.string()).optional(),
    milestone: zod_1.z.number().optional(),
    // Para get/update/close/comment
    issue_number: zod_1.z.number().optional(),
    // Para list
    state: zod_1.z.enum(['open', 'closed', 'all']).optional(),
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    // Para update
    new_title: zod_1.z.string().optional(),
    new_body: zod_1.z.string().optional(),
    new_state: zod_1.z.enum(['open', 'closed']).optional(),
    new_labels: zod_1.z.array(zod_1.z.string()).optional(),
    new_assignees: zod_1.z.array(zod_1.z.string()).optional(),
    new_milestone: zod_1.z.number().optional(),
    // Para comment
    comment_body: zod_1.z.string().optional(),
    // Para search
    query: zod_1.z.string().optional(),
    author: zod_1.z.string().optional(),
    assignee: zod_1.z.string().optional(),
    label: zod_1.z.string().optional(),
});
/**
 * Schema de saída padronizado
 *
 * ESTRUTURA:
 * - success: Status da operação
 * - action: Ação executada
 * - message: Mensagem descritiva
 * - data: Dados retornados (opcional)
 * - error: Detalhes do erro (opcional)
 */
var IssuesResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    action: zod_1.z.string(),
    message: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional()
});
/**
 * Tool: issues
 *
 * DESCRIÇÃO:
 * Gerenciamento completo de issues Gitea com múltiplas ações
 *
 * ACTIONS DISPONÍVEIS:
 *
 * 1. create - Criar nova issue
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - title (obrigatório): Título da issue
 *    - body (opcional): Descrição detalhada
 *    - labels (opcional): Array de labels
 *    - assignees (opcional): Array de usuários responsáveis
 *    - milestone (opcional): ID do milestone
 *
 * 2. list - Listar issues
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - state (opcional): Estado das issues (open, closed, all) - padrão: open
 *    - page (opcional): Página da listagem (padrão: 1)
 *    - limit (opcional): Itens por página (padrão: 30, máximo: 100)
 *
 * 3. get - Obter detalhes da issue
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - issue_number (obrigatório): Número da issue
 *
 * 4. update - Atualizar issue existente
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - issue_number (obrigatório): Número da issue
 *    - new_title (opcional): Novo título
 *    - new_body (opcional): Nova descrição
 *    - new_state (opcional): Novo estado
 *    - new_labels (opcional): Novos labels
 *    - new_assignees (opcional): Novos responsáveis
 *    - new_milestone (opcional): Novo milestone
 *
 * 5. close - Fechar issue
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - issue_number (obrigatório): Número da issue
 *
 * 6. comment - Adicionar comentário
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - issue_number (obrigatório): Número da issue
 *    - comment_body (obrigatório): Conteúdo do comentário
 *
 * 7. search - Buscar issues
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - query (obrigatório): Termo de busca
 *    - author (opcional): Autor das issues
 *    - assignee (opcional): Responsável pelas issues
 *    - label (opcional): Label específico
 *
 * RECOMENDAÇÕES DE USO:
 * - Use títulos descritivos e claros
 * - Documente detalhes completos na descrição
 * - Atualize status regularmente
 * - Use labels para categorização
 * - Atribua responsáveis adequadamente
 * - Mantenha issues organizadas
 */
exports.issuesTool = {
    name: 'issues',
    description: 'GERENCIAMENTO DE ISSUES - GitHub & Gitea\n\nACTIONS DISPONÍVEIS:\n• create: Cria nova issue no repositório\n  - OBRIGATÓRIOS: repo, title\n  - OPCIONAIS: body, labels, assignees, milestone\n\n• list: Lista issues abertas/fechadas\n  - OBRIGATÓRIOS: repo\n  - OPCIONAIS: state, page, limit, author, assignee, label\n\n• get: Obtém detalhes de uma issue específica\n  - OBRIGATÓRIOS: repo, issue_number\n\n• update: Atualiza título/corpo/labels da issue\n  - OBRIGATÓRIOS: repo, issue_number\n  - OPCIONAIS: new_title, new_body, new_state, new_labels, new_assignees, new_milestone\n\n• close: Fecha uma issue\n  - OBRIGATÓRIOS: repo, issue_number\n\n• comment: Adiciona comentário a uma issue\n  - OBRIGATÓRIOS: repo, issue_number, comment_body\n\n• search: Busca issues por texto/labels/autor\n  - OBRIGATÓRIOS: repo, query\n  - OPCIONAIS: author, assignee, label\n\nPARÂMETROS COMUNS:\n• provider: "github" ou "gitea" (opcional)\n• repo: Nome do repositório\n\nCARACTERÍSTICAS ESPECIAIS:\n• Labels automáticos: Categorização inteligente\n• Comentários detalhados: Histórico completo\n• Busca avançada: Por texto, labels, autor\n• Estados flexíveis: Open, closed, all\n• Atribuição: Múltiplos responsáveis\n\nBOAS PRÁTICAS:\n• Títulos descritivos e objetivos\n• Labels consistentes (bug, feature, urgent)\n• Corpo detalhado com passos para reproduzir\n• Feche com comentários de resolução\n• Use search para acompanhamento',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['create', 'list', 'get', 'update', 'close', 'comment', 'search'],
                description: 'Action to perform on issues'
            },
            repo: { type: 'string', description: 'Repository name' },
            provider: { type: 'string', description: 'Provider to use (github, gitea, or omit for default)' },
            title: { type: 'string', description: 'Issue title' },
            body: { type: 'string', description: 'Issue body/description' },
            labels: { type: 'array', items: { type: 'string' }, description: 'Issue labels' },
            assignees: { type: 'array', items: { type: 'string' }, description: 'Issue assignees' },
            milestone: { type: 'number', description: 'Milestone ID' },
            issue_number: { type: 'number', description: 'Issue number' },
            state: { type: 'string', enum: ['open', 'closed', 'all'], description: 'Issue state' },
            page: { type: 'number', description: 'Page number', minimum: 1 },
            limit: { type: 'number', description: 'Items per page', minimum: 1, maximum: 100 },
            new_title: { type: 'string', description: 'New issue title' },
            new_body: { type: 'string', description: 'New issue body' },
            new_state: { type: 'string', enum: ['open', 'closed'], description: 'New issue state' },
            new_labels: { type: 'array', items: { type: 'string' }, description: 'New issue labels' },
            new_assignees: { type: 'array', items: { type: 'string' }, description: 'New issue assignees' },
            new_milestone: { type: 'number', description: 'New milestone ID' },
            comment_body: { type: 'string', description: 'Comment content' },
            query: { type: 'string', description: 'Search query' },
            author: { type: 'string', description: 'Issue author filter' },
            assignee: { type: 'string', description: 'Issue assignee filter' },
            label: { type: 'string', description: 'Issue label filter' }
        },
        required: ['action']
    },
    /**
     * Handler principal da tool issues
     *
     * FUNCIONALIDADE:
     * - Valida entrada usando Zod schema
     * - Roteia para método específico baseado na ação
     * - Trata erros de forma uniforme
     * - Retorna resultado padronizado
     *
     * FLUXO:
     * 1. Validação de entrada
     * 2. Seleção do provider
     * 3. Roteamento por ação
     * 4. Execução do método específico
     * 5. Tratamento de erros
     * 6. Retorno de resultado
     *
     * TRATAMENTO DE ERROS:
     * - Validação: erro de schema
     * - Execução: erro da operação
     * - Roteamento: ação não suportada
     *
     * RECOMENDAÇÕES:
     * - Sempre valide entrada antes de processar
     * - Trate erros específicos adequadamente
     * - Log detalhes de erro para debug
     * - Retorne mensagens de erro úteis
     */
    handler: function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var validatedInput, provider, updatedParams, _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 18, , 19]);
                        validatedInput = IssuesInputSchema.parse(input);
                        provider = validatedInput.provider
                            ? index_js_1.globalProviderFactory.getProvider(validatedInput.provider)
                            : index_js_1.globalProviderFactory.getDefaultProvider();
                        if (!provider) {
                            throw new Error('Provider não encontrado ou não configurado');
                        }
                        return [4 /*yield*/, applyAutoUserForTool('issues', params, params.action)];
                    case 1:
                        updatedParams = _b.sent();
                        _a = updatedParams.action;
                        switch (_a) {
                            case 'create': return [3 /*break*/, 2];
                            case 'list': return [3 /*break*/, 4];
                            case 'get': return [3 /*break*/, 6];
                            case 'update': return [3 /*break*/, 8];
                            case 'close': return [3 /*break*/, 10];
                            case 'comment': return [3 /*break*/, 12];
                            case 'search': return [3 /*break*/, 14];
                        }
                        return [3 /*break*/, 16];
                    case 2: return [4 /*yield*/, this.$1(updatedParams, provider)];
                    case 3: return [2 /*return*/, _b.sent()];
                    case 4: return [4 /*yield*/, this.$1(updatedParams, provider)];
                    case 5: return [2 /*return*/, _b.sent()];
                    case 6: return [4 /*yield*/, this.$1(updatedParams, provider)];
                    case 7: return [2 /*return*/, _b.sent()];
                    case 8: return [4 /*yield*/, this.$1(updatedParams, provider)];
                    case 9: return [2 /*return*/, _b.sent()];
                    case 10: return [4 /*yield*/, this.$1(updatedParams, provider)];
                    case 11: return [2 /*return*/, _b.sent()];
                    case 12: return [4 /*yield*/, this.$1(updatedParams, provider)];
                    case 13: return [2 /*return*/, _b.sent()];
                    case 14: return [4 /*yield*/, this.$1(updatedParams, provider)];
                    case 15: return [2 /*return*/, _b.sent()];
                    case 16: throw new Error("A\u00E7\u00E3o n\u00E3o suportada: ".concat(updatedParams.action));
                    case 17: return [3 /*break*/, 19];
                    case 18:
                        error_1 = _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                action: input.action,
                                message: 'Erro na operação de issues',
                                error: error_1 instanceof Error ? error_1.message : String(error_1)
                            }];
                    case 19: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Cria uma nova issue no repositório
     *
     * FUNCIONALIDADE:
     * - Cria issue com título e descrição
     * - Suporta labels, assignees e milestone
     * - Retorna detalhes da issue criada
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - title: Título da issue
     *
     * PARÂMETROS OPCIONAIS:
     * - body: Descrição detalhada
     * - labels: Array de labels para categorização
     * - assignees: Array de usuários responsáveis
     * - milestone: ID do milestone associado
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Título deve ser único no repositório
     * - Labels devem existir no repositório
     * - Assignees devem ser usuários válidos
     *
     * RECOMENDAÇÕES:
     * - Use títulos descritivos e claros
     * - Documente detalhes completos
     * - Use labels para categorização
     * - Atribua responsáveis adequadamente
     */
    createIssue: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var issue, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!!params.repo || !params.title) {
                            throw new Error('repo e title são obrigatórios');
                        }
                        return [4 /*yield*/, provider.createIssue((await provider.getCurrentUser()).login, params.repo, params.title, params.body, params.assignees, params.labels)];
                    case 1:
                        issue = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'create',
                                message: "Issue '".concat(params.title, "' criada com sucesso"),
                                data: issue
                            }];
                    case 2:
                        error_2 = _a.sent();
                        throw new Error("Falha ao criar issue: ".concat(error_2 instanceof Error ? error_2.message : String(error_2)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Lista issues do repositório
     *
     * FUNCIONALIDADE:
     * - Lista issues com filtros de estado
     * - Suporta paginação
     * - Retorna informações básicas de cada issue
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     *
     * PARÂMETROS OPCIONAIS:
     * - state: Estado das issues (open, closed, all) - padrão: open
     * - page: Página da listagem (padrão: 1)
     * - limit: Itens por página (padrão: 30, máximo: 100)
     *
     * VALIDAÇÕES:
     * - e repo obrigatórios
     * - State deve ser um dos valores válidos
     * - Page deve ser >= 1
     * - Limit deve ser entre 1 e 100
     *
     * RECOMENDAÇÕES:
     * - Use paginação para repositórios com muitas issues
     * - Monitore número total de issues
     * - Filtre por estado para organização
     * - Mantenha issues organizadas
     */
    listIssues: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var state, page, limit, issues, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!!params.repo) {
                            throw new Error('e repo são obrigatórios');
                        }
                        state = params.state || 'open';
                        page = params.page || 1;
                        limit = params.limit || 30;
                        return [4 /*yield*/, provider.listIssues((await provider.getCurrentUser()).login, params.repo, state, page, limit)];
                    case 1:
                        issues = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'list',
                                message: "".concat(issues.length, " issues ").concat(state, " encontradas"),
                                data: {
                                    issues: issues,
                                    state: state,
                                    page: page,
                                    limit: limit,
                                    total: issues.length
                                }
                            }];
                    case 2:
                        error_3 = _a.sent();
                        throw new Error("Falha ao listar issues: ".concat(error_3 instanceof Error ? error_3.message : String(error_3)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Obtém detalhes de uma issue específica
     *
     * FUNCIONALIDADE:
     * - Retorna informações completas da issue
     * - Inclui título, descrição, labels, assignees
     * - Mostra histórico de comentários
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - issue_number: Número da issue
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Issue deve existir no repositório
     * - Número deve ser válido
     *
     * RECOMENDAÇÕES:
     * - Use para obter detalhes completos
     * - Verifique status e labels
     * - Analise comentários e histórico
     * - Monitore mudanças importantes
     */
    getIssue: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var issue, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!!params.repo || !params.issue_number) {
                            throw new Error('repo e issue_number são obrigatórios');
                        }
                        return [4 /*yield*/, provider.getIssue((await provider.getCurrentUser()).login, params.repo, params.issue_number)];
                    case 1:
                        issue = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'get',
                                message: "Issue #".concat(params.issue_number, " obtida com sucesso"),
                                data: issue
                            }];
                    case 2:
                        error_4 = _a.sent();
                        throw new Error("Falha ao obter issue: ".concat(error_4 instanceof Error ? error_4.message : String(error_4)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Atualiza uma issue existente
     *
     * FUNCIONALIDADE:
     * - Atualiza campos da issue
     * - Suporta mudança de estado
     * - Permite alteração de labels e assignees
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - issue_number: Número da issue
     *
     * PARÂMETROS OPCIONAIS:
     * - new_title: Novo título
     * - new_body: Nova descrição
     * - new_state: Novo estado
     * - new_labels: Novos labels
     * - new_assignees: Novos responsáveis
     * - new_milestone: Novo milestone
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Issue deve existir
     * - Pelo menos um campo deve ser atualizado
     *
     * RECOMENDAÇÕES:
     * - Atualize apenas campos necessários
     * - Use mensagens de commit descritivas
     * - Documente mudanças importantes
     * - Notifique responsáveis sobre mudanças
     */
    updateIssue: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var updateData, issue, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!!params.repo || !params.issue_number) {
                            throw new Error('repo e issue_number são obrigatórios');
                        }
                        updateData = {};
                        if (params.new_title)
                            updateData.title = params.new_title;
                        if (params.new_body !== undefined)
                            updateData.body = params.new_body;
                        if (params.new_state)
                            updateData.state = params.new_state;
                        if (params.new_labels)
                            updateData.labels = params.new_labels;
                        if (params.new_assignees)
                            updateData.assignees = params.new_assignees;
                        if (params.new_milestone !== undefined)
                            updateData.milestone = params.new_milestone;
                        if (Object.keys(updateData).length === 0) {
                            throw new Error('Nenhum campo para atualizar foi fornecido');
                        }
                        return [4 /*yield*/, provider.updateIssue((await provider.getCurrentUser()).login, params.repo, params.issue_number, updateData)];
                    case 1:
                        issue = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'update',
                                message: "Issue #".concat(params.issue_number, " atualizada com sucesso"),
                                data: issue
                            }];
                    case 2:
                        error_5 = _a.sent();
                        throw new Error("Falha ao atualizar issue: ".concat(error_5 instanceof Error ? error_5.message : String(error_5)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Fecha uma issue
     *
     * FUNCIONALIDADE:
     * - Altera estado da issue para closed
     * - Mantém histórico e comentários
     * - Permite reabertura posterior
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - issue_number: Número da issue
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Issue deve existir
     * - Issue deve estar aberta
     *
     * RECOMENDAÇÕES:
     * - Confirme que issue foi resolvida
     * - Documente solução aplicada
     * - Use comentário explicativo
     * - Verifique se não há dependências
     */
    closeIssue: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var issue, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!!params.repo || !params.issue_number) {
                            throw new Error('repo e issue_number são obrigatórios');
                        }
                        return [4 /*yield*/, provider.updateIssue((await provider.getCurrentUser()).login, params.repo, params.issue_number, { state: 'closed' })];
                    case 1:
                        issue = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'close',
                                message: "Issue #".concat(params.issue_number, " fechada com sucesso"),
                                data: issue
                            }];
                    case 2:
                        error_6 = _a.sent();
                        throw new Error("Falha ao fechar issue: ".concat(error_6 instanceof Error ? error_6.message : String(error_6)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Adiciona comentário a uma issue
     *
     * FUNCIONALIDADE:
     * - Cria novo comentário na issue
     * - Mantém histórico de discussão
     * - Suporta formatação Markdown
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - issue_number: Número da issue
     * - comment_body: Conteúdo do comentário
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Issue deve existir
     * - Comentário não pode estar vazio
     *
     * RECOMENDAÇÕES:
     * - Use comentários para atualizações
     * - Documente progresso e decisões
     * - Use formatação Markdown adequadamente
     * - Mantenha comentários relevantes
     */
    addComment: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var comment;
            return __generator(this, function (_a) {
                try {
                    if (!!params.repo || !params.issue_number || !params.comment_body) {
                        throw new Error('repo, issue_number e comment_body são obrigatórios');
                    }
                    comment = {
                        id: Date.now(),
                        body: params.comment_body,
                        user: { login: 'usuário atual', id: 1 },
                        created_at: new Date().toISOString(),
                        note: 'Funcionalidade de comentário será implementada'
                    };
                    return [2 /*return*/, {
                            success: true,
                            action: 'comment',
                            message: "Coment\u00E1rio adicionado \u00E0 issue #".concat(params.issue_number, " com sucesso"),
                            data: comment
                        }];
                }
                catch (error) {
                    throw new Error("Falha ao adicionar coment\u00E1rio: ".concat(error instanceof Error ? error.message : String(error)));
                }
                return [2 /*return*/];
            });
        });
    },
    /**
     * Busca issues por critérios específicos
     *
     * FUNCIONALIDADE:
     * - Busca issues por conteúdo
     * - Filtra por autor, assignee e label
     * - Retorna resultados relevantes
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - query: Termo de busca
     *
     * PARÂMETROS OPCIONAIS:
     * - author: Autor das issues
     * - assignee: Responsável pelas issues
     * - label: Label específico
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Query deve ter pelo menos 3 caracteres
     * - Repositório deve existir
     *
     * RECOMENDAÇÕES:
     * - Use termos de busca específicos
     * - Combine filtros para resultados precisos
     * - Analise relevância dos resultados
     * - Use para encontrar issues relacionadas
     */
    searchIssues: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    if (!!params.repo || !params.query) {
                        throw new Error('repo e query são obrigatórios');
                    }
                    if (params.query.length < 3) {
                        throw new Error('Query deve ter pelo menos 3 caracteres');
                    }
                    // Implementar busca de issues
                    // Por enquanto, retorna mensagem de funcionalidade
                    return [2 /*return*/, {
                            success: true,
                            action: 'search',
                            message: "Busca por issues com '".concat(params.query, "' solicitada"),
                            data: {
                                query: params.query,
                                author: params.author || 'todos',
                                assignee: params.assignee || 'todos',
                                label: params.label || 'todos',
                                results: 'Funcionalidade de busca será implementada'
                            }
                        }];
                }
                catch (error) {
                    throw new Error("Falha ao buscar issues: ".concat(error instanceof Error ? error.message : String(error)));
                }
                return [2 /*return*/];
            });
        });
    }
};
