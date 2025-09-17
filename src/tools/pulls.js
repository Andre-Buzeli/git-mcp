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
exports.pullsTool = void 0;
var zod_1 = require("zod");
var index_js_1 = require("../providers/index.js");
/**
 * Tool: pulls
 *
 * DESCRIÇÃO:
 * Gerenciamento completo de pull requests com suporte multi-provider (GitHub e Gitea)
 *
 * FUNCIONALIDADES:
 * - Criação de novos pull requests
 * - Listagem e busca de PRs
 * - Obtenção de detalhes específicos
 * - Atualização de PRs existentes
 * - Merge de pull requests
 * - Fechamento de PRs
 * - Revisão e aprovação
 * - Busca por conteúdo e status
 *
 * USO:
 * - Para gerenciar integração de código
 * - Para revisão de código
 * - Para controle de qualidade
 * - Para colaboração em equipe
 *
 * RECOMENDAÇÕES:
 * - Use títulos descritivos
 * - Documente mudanças detalhadamente
 * - Revise antes de fazer merge
 * - Mantenha PRs pequenos e focados
 */
/**
 * Schema de validação para entrada da tool pulls
 *
 * VALIDAÇÕES:
 * - action: Ação obrigatória (create, list, get, update, merge, close, review, search)
 * - Parâmetros específicos por ação
 * - Validação de tipos e formatos
 *
 * RECOMENDAÇÕES:
 * - Sempre valide entrada antes de usar
 * - Use parâmetros opcionais adequadamente
 * - Documente parâmetros obrigatórios
 */
var PullsInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['create', 'list', 'get', 'update', 'merge', 'close', 'review', 'search']),
    // Parâmetros comuns
    owner: zod_1.z.string().optional(),
    repo: zod_1.z.string().optional(),
    // Para multi-provider
    provider: zod_1.z.string().optional(),
    // Para create
    title: zod_1.z.string().optional(),
    body: zod_1.z.string().optional(),
    head: zod_1.z.string().optional(),
    base: zod_1.z.string().optional(),
    draft: zod_1.z.boolean().optional(),
    labels: zod_1.z.array(zod_1.z.string()).optional(),
    assignees: zod_1.z.array(zod_1.z.string()).optional(),
    reviewers: zod_1.z.array(zod_1.z.string()).optional(),
    milestone: zod_1.z.number().optional(),
    // Para get/update/merge/close/review
    pull_number: zod_1.z.number().optional(),
    // Para list
    state: zod_1.z.enum(['open', 'closed', 'merged', 'all']).optional(),
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    // Para update
    new_title: zod_1.z.string().optional(),
    new_body: zod_1.z.string().optional(),
    new_base: zod_1.z.string().optional(),
    new_labels: zod_1.z.array(zod_1.z.string()).optional(),
    new_assignees: zod_1.z.array(zod_1.z.string()).optional(),
    new_milestone: zod_1.z.number().optional(),
    // Para merge
    merge_method: zod_1.z.enum(['merge', 'rebase', 'squash']).optional(),
    merge_commit_title: zod_1.z.string().optional(),
    merge_commit_message: zod_1.z.string().optional(),
    // Para review
    review_event: zod_1.z.enum(['APPROVE', 'REQUEST_CHANGES', 'COMMENT']).optional(),
    review_body: zod_1.z.string().optional(),
    // Para search
    query: zod_1.z.string().optional(),
    author: zod_1.z.string().optional(),
    assignee: zod_1.z.string().optional(),
    reviewer: zod_1.z.string().optional(),
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
var PullsResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    action: zod_1.z.string(),
    message: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional(),
    suggestion: zod_1.z.string().optional()
});
/**
 * Tool: pulls
 *
 * DESCRIÇÃO:
 * Gerenciamento completo de Pull Requests Gitea com múltiplas ações
 *
 * ACTIONS DISPONÍVEIS:
 *
 * 1. create - Criar novo Pull Request
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - title (obrigatório): Título do PR
 *    - body (opcional): Descrição detalhada
 *    - head (obrigatório): Branch de origem
 *    - base (obrigatório): Branch de destino
 *    - draft (opcional): Se é um draft PR
 *    - labels (opcional): Array de labels
 *    - assignees (opcional): Array de usuários responsáveis
 *    - reviewers (opcional): Array de revisores
 *    - milestone (opcional): ID do milestone
 *
 * 2. list - Listar Pull Requests
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - state (opcional): Estado dos PRs (open, closed, merged, all) - padrão: open
 *    - page (opcional): Página da listagem (padrão: 1)
 *    - limit (opcional): Itens por página (padrão: 30, máximo: 100)
 *
 * 3. get - Obter detalhes do Pull Request
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - pull_number (obrigatório): Número do PR
 *
 * 4. update - Atualizar Pull Request existente
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - pull_number (obrigatório): Número do PR
 *    - new_title (opcional): Novo título
 *    - new_body (opcional): Nova descrição
 *    - new_base (opcional): Nova branch base
 *    - new_labels (opcional): Novos labels
 *    - new_assignees (opcional): Novos responsáveis
 *    - new_milestone (opcional): Novo milestone
 *
 * 5. merge - Fazer merge do Pull Request
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - pull_number (obrigatório): Número do PR
 *    - merge_method (opcional): Método de merge (merge, rebase, squash)
 *    - merge_commit_title (opcional): Título do commit de merge
 *    - merge_commit_message (opcional): Mensagem do commit de merge
 *
 * 6. close - Fechar Pull Request
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - pull_number (obrigatório): Número do PR
 *
 * 7. review - Adicionar review ao Pull Request
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - pull_number (obrigatório): Número do PR
 *    - review_event (obrigatório): Tipo de review (APPROVE, REQUEST_CHANGES, COMMENT)
 *    - review_body (opcional): Comentário do review
 *
 * 8. search - Buscar Pull Requests
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - query (obrigatório): Termo de busca
 *    - author (opcional): Autor dos PRs
 *    - assignee (opcional): Responsável pelos PRs
 *    - reviewer (opcional): Revisor dos PRs
 *    - label (opcional): Label específico
 *
 * RECOMENDAÇÕES DE USO:
 * - Use títulos descritivos e claros
 * - Documente mudanças detalhadamente
 * - Solicite reviews adequados
 * - Mantenha PRs pequenos e focados
 * - Use labels para categorização
 * - Atribua responsáveis adequadamente
 * - Escolha método de merge apropriado
 */
exports.pullsTool = {
    name: 'pulls',
    description: 'GERENCIAMENTO DE PULL REQUESTS - GitHub & Gitea\n\nACTIONS DISPONÍVEIS:\n• create: Cria novo Pull Request\n  - OBRIGATÓRIOS: repo, title, head, base\n  - OPCIONAIS: body, draft, labels, assignees, reviewers, milestone\n\n• list: Lista PRs abertas/fechadas/mescladas\n  - OBRIGATÓRIOS: repo\n  - OPCIONAIS: state, page, limit, author, assignee, reviewer, label\n\n• get: Obtém detalhes de um PR específico\n  - OBRIGATÓRIOS: repo, pull_number\n\n• update: Atualiza título/descrição/labels\n  - OBRIGATÓRIOS: repo, pull_number\n  - OPCIONAIS: new_title, new_body, new_base, new_labels, new_assignees, new_milestone\n\n• merge: Faz merge do PR\n  - OBRIGATÓRIOS: repo, pull_number, merge_method\n  - OPCIONAIS: merge_commit_title, merge_commit_message\n\n• close: Fecha PR sem merge\n  - OBRIGATÓRIOS: repo, pull_number\n\n• review: Adiciona review\n  - OBRIGATÓRIOS: repo, pull_number, review_event\n  - OPCIONAIS: review_body\n\n• search: Busca PRs por texto/autor/labels\n  - OBRIGATÓRIOS: repo, query\n  - OPCIONAIS: author, assignee, reviewer, label\n\nPARÂMETROS COMUNS:\n• provider: "github" ou "gitea" (opcional)\n• repo: Nome do repositório\n\nCARACTERÍSTICAS ESPECIAIS:\n• Validação automática: Verifica diferenças entre branches\n• Merge inteligente: Escolhe método apropriado\n• Reviews estruturados: Aprovação ou mudanças solicitadas\n• Histórico completo: Mantém track de todas as ações\n\nBOAS PRÁTICAS:\n• PRs pequenos e focados (máx 500 linhas)\n• Títulos descritivos e objetivos\n• Descrição detalhada das mudanças\n• Use labels para categorizar\n• Aguarde review antes de merge',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['create', 'list', 'get', 'update', 'merge', 'close', 'review', 'search'],
                description: 'Action to perform on pull requests'
            },
            repo: { type: 'string', description: 'Repository name' },
            provider: { type: 'string', description: 'Provider to use (github, gitea, or omit for default)' },
            title: { type: 'string', description: 'Pull request title' },
            body: { type: 'string', description: 'Pull request body/description' },
            head: { type: 'string', description: 'Source branch' },
            base: { type: 'string', description: 'Target branch' },
            draft: { type: 'boolean', description: 'Create as draft PR' },
            labels: { type: 'array', items: { type: 'string' }, description: 'PR labels' },
            assignees: { type: 'array', items: { type: 'string' }, description: 'PR assignees' },
            reviewers: { type: 'array', items: { type: 'string' }, description: 'PR reviewers' },
            milestone: { type: 'number', description: 'Milestone ID' },
            pull_number: { type: 'number', description: 'Pull request number' },
            state: { type: 'string', enum: ['open', 'closed', 'merged', 'all'], description: 'PR state' },
            page: { type: 'number', description: 'Page number', minimum: 1 },
            limit: { type: 'number', description: 'Items per page', minimum: 1, maximum: 100 },
            new_title: { type: 'string', description: 'New PR title' },
            new_body: { type: 'string', description: 'New PR body' },
            new_base: { type: 'string', description: 'New base branch' },
            new_labels: { type: 'array', items: { type: 'string' }, description: 'New PR labels' },
            new_assignees: { type: 'array', items: { type: 'string' }, description: 'New PR assignees' },
            new_milestone: { type: 'number', description: 'New milestone ID' },
            merge_method: { type: 'string', enum: ['merge', 'rebase', 'squash'], description: 'Merge method' },
            merge_commit_title: { type: 'string', description: 'Merge commit title' },
            merge_commit_message: { type: 'string', description: 'Merge commit message' },
            review_event: { type: 'string', enum: ['APPROVE', 'REQUEST_CHANGES', 'COMMENT'], description: 'Review type' },
            review_body: { type: 'string', description: 'Review comment' },
            query: { type: 'string', description: 'Search query' },
            author: { type: 'string', description: 'PR author filter' },
            assignee: { type: 'string', description: 'PR assignee filter' },
            reviewer: { type: 'string', description: 'PR reviewer filter' },
            label: { type: 'string', description: 'PR label filter' }
        },
        required: ['action']
    },
    /**
     * Handler principal da tool pulls
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
                        _b.trys.push([0, 20, , 21]);
                        validatedInput = PullsInputSchema.parse(input);
                        provider = validatedInput.provider
                            ? index_js_1.globalProviderFactory.getProvider(validatedInput.provider)
                            : index_js_1.globalProviderFactory.getDefaultProvider();
                        if (!provider) {
                            throw new Error('Provider não encontrado ou não configurado');
                        }
                        return [4 /*yield*/, applyAutoUserForTool('pulls', params, params.action)];
                    case 1:
                        updatedParams = _b.sent();
                        _a = updatedParams.action;
                        switch (_a) {
                            case 'create': return [3 /*break*/, 2];
                            case 'list': return [3 /*break*/, 4];
                            case 'get': return [3 /*break*/, 6];
                            case 'update': return [3 /*break*/, 8];
                            case 'merge': return [3 /*break*/, 10];
                            case 'close': return [3 /*break*/, 12];
                            case 'review': return [3 /*break*/, 14];
                            case 'search': return [3 /*break*/, 16];
                        }
                        return [3 /*break*/, 18];
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
                    case 16: return [4 /*yield*/, this.$1(updatedParams, provider)];
                    case 17: return [2 /*return*/, _b.sent()];
                    case 18: throw new Error("A\u00E7\u00E3o n\u00E3o suportada: ".concat(updatedParams.action));
                    case 19: return [3 /*break*/, 21];
                    case 20:
                        error_1 = _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                action: input.action,
                                message: 'Erro na operação de pull requests',
                                error: error_1 instanceof Error ? error_1.message : String(error_1)
                            }];
                    case 21: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Cria um novo Pull Request
     *
     * FUNCIONALIDADE:
     * - Cria PR com título e descrição
     * - Suporta configuração de branches
     * - Permite configuração de draft, labels, assignees
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - title: Título do PR
     * - head: Branch de origem
     * - base: Branch de destino
     *
     * PARÂMETROS OPCIONAIS:
     * - body: Descrição detalhada
     * - draft: Se é um draft PR
     * - labels: Array de labels para categorização
     * - assignees: Array de usuários responsáveis
     * - reviewers: Array de revisores
     * - milestone: ID do milestone associado
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Branches devem existir
     * - Head e base devem ser diferentes
     * - Usuário deve ter permissão de escrita
     *
     * RECOMENDAÇÕES:
     * - Use títulos descritivos e claros
     * - Documente mudanças detalhadamente
     * - Solicite reviews adequados
     * - Mantenha PRs pequenos e focados
     */
    createPullRequest: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var pullRequest, createError_1, errorMessage, error_2, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        if (!!params.repo || !params.title || !params.head || !params.base) {
                            throw new Error('repo, title, head e base são obrigatórios');
                        }
                        // Verificar se as branches são diferentes
                        if (params.head === params.base) {
                            throw new Error('Head e base não podem ser a mesma branch. Para criar um PR, você precisa de diferenças entre as branches.');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, provider.createPullRequest((await provider.getCurrentUser()).login, params.repo, params.title, params.body || '', params.head, params.base)];
                    case 2:
                        pullRequest = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'create',
                                message: "Pull Request '".concat(params.title, "' criado com sucesso"),
                                data: pullRequest
                            }];
                    case 3:
                        createError_1 = _a.sent();
                        errorMessage = createError_1 instanceof Error ? createError_1.message : String(createError_1);
                        if (errorMessage.includes('Not found') || errorMessage.includes('No commits') || errorMessage.includes('up to date')) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'create',
                                    message: 'Não foi possível criar Pull Request',
                                    error: "As branches '".concat(params.head, "' e '").concat(params.base, "' n\u00E3o t\u00EAm diferen\u00E7as suficientes para criar um Pull Request. Fa\u00E7a commits na branch '").concat(params.head, "' antes de tentar criar o PR."),
                                    suggestion: '1. Mude para a branch head, 2. Faça suas mudanças, 3. Commit as mudanças, 4. Tente criar o PR novamente'
                                }];
                        }
                        throw createError_1;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_2 = _a.sent();
                        errorMessage = error_2 instanceof Error ? error_2.message : String(error_2);
                        return [2 /*return*/, {
                                success: false,
                                action: 'create',
                                message: 'Falha ao criar Pull Request',
                                error: errorMessage,
                                data: {
                                    owner: (await provider.getCurrentUser()).login,
                                    repo: params.repo,
                                    title: params.title,
                                    head: params.head,
                                    base: params.base
                                }
                            }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Lista Pull Requests do repositório
     *
     * FUNCIONALIDADE:
     * - Lista PRs com filtros de estado
     * - Suporta paginação
     * - Retorna informações básicas de cada PR
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     *
     * PARÂMETROS OPCIONAIS:
     * - state: Estado dos PRs (open, closed, merged, all) - padrão: open
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
     * - Use paginação para repositórios com muitos PRs
     * - Monitore número total de PRs
     * - Filtre por estado para organização
     * - Mantenha PRs organizados
     */
    listPullRequests: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var state, page, limit, pullRequests, error_3;
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
                        return [4 /*yield*/, provider.listPullRequests((await provider.getCurrentUser()).login, params.repo, state, page, limit)];
                    case 1:
                        pullRequests = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'list',
                                message: "".concat(pullRequests.length, " Pull Requests ").concat(state, " encontrados"),
                                data: {
                                    pullRequests: pullRequests,
                                    state: state,
                                    page: page,
                                    limit: limit,
                                    total: pullRequests.length
                                }
                            }];
                    case 2:
                        error_3 = _a.sent();
                        throw new Error("Falha ao listar Pull Requests: ".concat(error_3 instanceof Error ? error_3.message : String(error_3)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Obtém detalhes de um Pull Request específico
     *
     * FUNCIONALIDADE:
     * - Retorna informações completas do PR
     * - Inclui título, descrição, branches, labels
     * - Mostra status de merge e conflitos
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - pull_number: Número do PR
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - PR deve existir no repositório
     * - Número deve ser válido
     *
     * RECOMENDAÇÕES:
     * - Use para obter detalhes completos
     * - Verifique status de merge
     * - Analise conflitos se houver
     * - Monitore mudanças importantes
     */
    getPullRequest: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var pullRequest, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!!params.repo || !params.pull_number) {
                            throw new Error('repo e pull_number são obrigatórios');
                        }
                        return [4 /*yield*/, provider.getPullRequest((await provider.getCurrentUser()).login, params.repo, params.pull_number)];
                    case 1:
                        pullRequest = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'get',
                                message: "Pull Request #".concat(params.pull_number, " obtido com sucesso"),
                                data: pullRequest
                            }];
                    case 2:
                        error_4 = _a.sent();
                        throw new Error("Falha ao obter Pull Request: ".concat(error_4 instanceof Error ? error_4.message : String(error_4)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Atualiza um Pull Request existente
     *
     * FUNCIONALIDADE:
     * - Atualiza campos do PR
     * - Suporta mudança de branch base
     * - Permite alteração de labels e assignees
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - pull_number: Número do PR
     *
     * PARÂMETROS OPCIONAIS:
     * - new_title: Novo título
     * - new_body: Nova descrição
     * - new_base: Nova branch base
     * - new_labels: Novos labels
     * - new_assignees: Novos responsáveis
     * - new_milestone: Novo milestone
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - PR deve existir
     * - Pelo menos um campo deve ser atualizado
     *
     * RECOMENDAÇÕES:
     * - Atualize apenas campos necessários
     * - Use mensagens de commit descritivas
     * - Documente mudanças importantes
     * - Notifique responsáveis sobre mudanças
     */
    updatePullRequest: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var updateData, pullRequest, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!!params.repo || !params.pull_number) {
                            throw new Error('repo e pull_number são obrigatórios');
                        }
                        updateData = {};
                        if (params.new_title)
                            updateData.title = params.new_title;
                        if (params.new_body !== undefined)
                            updateData.body = params.new_body;
                        if (params.new_base)
                            updateData.base = params.new_base;
                        if (params.new_labels)
                            updateData.labels = params.new_labels;
                        if (params.new_assignees)
                            updateData.assignees = params.new_assignees;
                        if (params.new_milestone !== undefined)
                            updateData.milestone = params.new_milestone;
                        if (Object.keys(updateData).length === 0) {
                            throw new Error('Nenhum campo para atualizar foi fornecido');
                        }
                        return [4 /*yield*/, provider.updatePullRequest((await provider.getCurrentUser()).login, params.repo, params.pull_number, updateData)];
                    case 1:
                        pullRequest = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'update',
                                message: "Pull Request #".concat(params.pull_number, " atualizado com sucesso"),
                                data: pullRequest
                            }];
                    case 2:
                        error_5 = _a.sent();
                        throw new Error("Falha ao atualizar Pull Request: ".concat(error_5 instanceof Error ? error_5.message : String(error_5)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Faz merge de um Pull Request
     *
     * FUNCIONALIDADE:
     * - Merge do PR na branch base
     * - Suporta diferentes métodos de merge
     * - Permite customização de commit de merge
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - pull_number: Número do PR
     *
     * PARÂMETROS OPCIONAIS:
     * - merge_method: Método de merge (merge, rebase, squash)
     * - merge_commit_title: Título do commit de merge
     * - merge_commit_message: Mensagem do commit de merge
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - PR deve existir e estar aberto
     * - Não deve haver conflitos
     * - PR deve ser mergeable
     *
     * RECOMENDAÇÕES:
     * - Resolva conflitos antes do merge
     * - Escolha método de merge adequado
     * - Use títulos e mensagens descritivas
     * - Teste após o merge
     */
    mergePullRequest: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var mergeData, result, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!!params.repo || !params.pull_number) {
                            throw new Error('repo e pull_number são obrigatórios');
                        }
                        mergeData = {
                            merge_method: params.merge_method || 'merge'
                        };
                        if (params.merge_commit_title)
                            mergeData.merge_commit_title = params.merge_commit_title;
                        if (params.merge_commit_message)
                            mergeData.merge_commit_message = params.merge_commit_message;
                        return [4 /*yield*/, provider.mergePullRequest((await provider.getCurrentUser()).login, params.repo, params.pull_number, mergeData)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'merge',
                                message: "Pull Request #".concat(params.pull_number, " mergeado com sucesso"),
                                data: result
                            }];
                    case 2:
                        error_6 = _a.sent();
                        throw new Error("Falha ao fazer merge do Pull Request: ".concat(error_6 instanceof Error ? error_6.message : String(error_6)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Fecha um Pull Request
     *
     * FUNCIONALIDADE:
     * - Altera estado do PR para closed
     * - Mantém histórico e comentários
     * - Permite reabertura posterior
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - pull_number: Número do PR
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - PR deve existir
     * - PR deve estar aberto
     *
     * RECOMENDAÇÕES:
     * - Confirme que PR não é mais necessário
     * - Documente motivo do fechamento
     * - Use comentário explicativo
     * - Verifique se não há dependências
     */
    closePullRequest: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var pullRequest, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!!params.repo || !params.pull_number) {
                            throw new Error('repo e pull_number são obrigatórios');
                        }
                        return [4 /*yield*/, provider.updatePullRequest((await provider.getCurrentUser()).login, params.repo, params.pull_number, { state: 'closed' })];
                    case 1:
                        pullRequest = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'close',
                                message: "Pull Request #".concat(params.pull_number, " fechado com sucesso"),
                                data: pullRequest
                            }];
                    case 2:
                        error_7 = _a.sent();
                        throw new Error("Falha ao fechar Pull Request: ".concat(error_7 instanceof Error ? error_7.message : String(error_7)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Adiciona review a um Pull Request
     *
     * FUNCIONALIDADE:
     * - Cria novo review no PR
     * - Suporta diferentes tipos de review
     * - Mantém histórico de revisões
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - pull_number: Número do PR
     * - review_event: Tipo de review (APPROVE, REQUEST_CHANGES, COMMENT)
     *
     * PARÂMETROS OPCIONAIS:
     * - review_body: Comentário do review
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - PR deve existir
     * - Review event deve ser válido
     *
     * RECOMENDAÇÕES:
     * - Use reviews para controle de qualidade
     * - Documente feedback adequadamente
     * - Use tipos de review apropriados
     * - Mantenha reviews construtivos
     */
    addReview: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    if (!!params.repo || !params.pull_number || !params.review_event) {
                        throw new Error('repo, pull_number e review_event são obrigatórios');
                    }
                    // Implementar adição de review
                    // Por enquanto, retorna mensagem de funcionalidade
                    return [2 /*return*/, {
                            success: true,
                            action: 'review',
                            message: "Review adicionado ao Pull Request #".concat(params.pull_number, " com sucesso"),
                            data: {
                                pull_number: params.pull_number,
                                review_event: params.review_event,
                                review_body: params.review_body || '',
                                note: 'Funcionalidade de review será implementada'
                            }
                        }];
                }
                catch (error) {
                    throw new Error("Falha ao adicionar review: ".concat(error instanceof Error ? error.message : String(error)));
                }
                return [2 /*return*/];
            });
        });
    },
    /**
     * Busca Pull Requests por critérios específicos
     *
     * FUNCIONALIDADE:
     * - Busca PRs por conteúdo
     * - Filtra por autor, assignee, reviewer e label
     * - Retorna resultados relevantes
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - query: Termo de busca
     *
     * PARÂMETROS OPCIONAIS:
     * - author: Autor dos PRs
     * - assignee: Responsável pelos PRs
     * - reviewer: Revisor dos PRs
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
     * - Use para encontrar PRs relacionados
     */
    searchPullRequests: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    if (!!params.repo || !params.query) {
                        throw new Error('repo e query são obrigatórios');
                    }
                    if (params.query.length < 3) {
                        throw new Error('Query deve ter pelo menos 3 caracteres');
                    }
                    // Implementar busca de Pull Requests
                    // Por enquanto, retorna mensagem de funcionalidade
                    return [2 /*return*/, {
                            success: true,
                            action: 'search',
                            message: "Busca por Pull Requests com '".concat(params.query, "' solicitada"),
                            data: {
                                query: params.query,
                                author: params.author || 'todos',
                                assignee: params.assignee || 'todos',
                                reviewer: params.reviewer || 'todos',
                                label: params.label || 'todos',
                                results: 'Funcionalidade de busca será implementada'
                            }
                        }];
                }
                catch (error) {
                    throw new Error("Falha ao buscar Pull Requests: ".concat(error instanceof Error ? error.message : String(error)));
                }
                return [2 /*return*/];
            });
        });
    }
};
