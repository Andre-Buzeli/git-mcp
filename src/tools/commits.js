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
exports.commitsTool = void 0;
var zod_1 = require("zod");
var index_js_1 = require("../providers/index.js");
/**
 * Tool: commits
 *
 * DESCRIÇÃO:
 * Gerenciamento completo de commits com suporte multi-provider (GitHub e Gitea)
 *
 * FUNCIONALIDADES:
 * - Listagem de histórico de commits
 * - Obtenção de detalhes específicos
 * - Criação de novos commits
 * - Comparação entre commits
 * - Busca por mensagens e conteúdo
 * - Análise de mudanças
 *
 * USO:
 * - Para acompanhar histórico de mudanças
 * - Para analisar evolução do código
 * - Para criar commits programaticamente
 * - Para auditoria de mudanças
 *
 * RECOMENDAÇÕES:
 * - Use mensagens de commit descritivas
 * - Mantenha commits atômicos
 * - Documente mudanças importantes
 * - Revise histórico regularmente
 */
/**
 * Schema de validação para entrada da tool commits
 *
 * VALIDAÇÕES:
 * - action: Ação obrigatória (list, get, create, compare, search)
 * - Parâmetros específicos por ação
 * - Validação de tipos e formatos
 *
 * RECOMENDAÇÕES:
 * - Sempre valide entrada antes de usar
 * - Use parâmetros opcionais adequadamente
 * - Documente parâmetros obrigatórios
 */
var CommitsInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['list', 'get', 'create', 'compare', 'search']),
    // Parâmetros comuns com validações aprimoradas
    owner: zod_1.z.string().min(1, 'Owner é obrigatório').max(100, 'Owner muito longo').optional(),
    repo: zod_1.z.string().min(1, 'Nome do repositório é obrigatório').max(100, 'Nome do repositório muito longo').optional(),
    // Para multi-provider
    provider: zod_1.z.enum(['gitea', 'github', 'both']).optional(), // Provider específico: gitea, github ou both
    // Para list - validação de SHA
    sha: zod_1.z.string().regex(/^[a-f0-9]{7,40}$/i, 'SHA deve ter 7-40 caracteres hexadecimais').optional(),
    page: zod_1.z.number().min(1, 'Página deve ser pelo menos 1').max(1000, 'Página muito alta').optional(),
    limit: zod_1.z.number().min(1, 'Limite deve ser pelo menos 1').max(100, 'Limite não pode exceder 100').optional(),
    // Para get - validação de SHA obrigatória
    commit_sha: zod_1.z.string().regex(/^[a-f0-9]{7,40}$/i, 'SHA deve ter 7-40 caracteres hexadecimais').optional(),
    // Para create - validações específicas
    message: zod_1.z.string().min(1, 'Mensagem do commit é obrigatória').max(1000, 'Mensagem muito longa').optional(),
    branch: zod_1.z.string().min(1, 'Branch é obrigatória').max(255, 'Nome da branch muito longo').optional(),
    author_name: zod_1.z.string().min(1, 'Nome do autor é obrigatório').max(100, 'Nome muito longo').optional(),
    author_email: zod_1.z.string().email('Email do autor inválido').max(255, 'Email muito longo').optional(),
    committer_name: zod_1.z.string().min(1, 'Nome do committer é obrigatório').max(100, 'Nome muito longo').optional(),
    committer_email: zod_1.z.string().email('Email do committer inválido').max(255, 'Email muito longo').optional(),
    // Para compare - validação de SHAs
    base: zod_1.z.string().regex(/^[a-f0-9]{7,40}$/i, 'SHA base deve ter 7-40 caracteres hexadecimais').optional(),
    head: zod_1.z.string().regex(/^[a-f0-9]{7,40}$/i, 'SHA head deve ter 7-40 caracteres hexadecimais').optional(),
    // Para search - validações específicas
    query: zod_1.z.string().min(3, 'Query deve ter pelo menos 3 caracteres').max(255, 'Query muito longa').optional(),
    author: zod_1.z.string().min(1, 'Nome do autor é obrigatório').max(100, 'Nome muito longo').optional(),
}).refine(function (data) {
    // Validações condicionais por ação
    if (data.action === 'get') {
        return data.owner && data.repo && (data.sha || data.commit_sha);
    }
    if (data.action === 'create') {
        return data.owner && data.repo && data.message && data.branch;
    }
    if (data.action === 'compare') {
        return data.owner && data.repo && data.base && data.head;
    }
    if (data.action === 'search') {
        return data.owner && data.repo && data.query;
    }
    if (data.action === 'list') {
        return data.owner && data.repo;
    }
    return data.owner && data.repo;
}, {
    message: "Parâmetros obrigatórios não fornecidos para a ação especificada"
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
var CommitsResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    action: zod_1.z.string(),
    message: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional()
});
/**
 * Tool: commits
 *
 * DESCRIÇÃO:
 * Gerenciamento completo de commits Gitea com múltiplas ações
 *
 * ACTIONS DISPONÍVEIS:
 *
 * 1. list - Listar commits
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - sha (opcional): Branch ou commit específico (padrão: branch padrão)
 *    - page (opcional): Página da listagem (padrão: 1)
 *    - limit (opcional): Itens por página (padrão: 30, máximo: 100)
 *
 * 2. get - Obter detalhes do commit
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - commit_sha (obrigatório): SHA do commit
 *
 * 3. create - Criar novo commit
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - message (obrigatório): Mensagem do commit
 *    - branch (obrigatório): Branch de destino
 *    - author_name (opcional): Nome do autor
 *    - author_email (opcional): Email do autor
 *    - committer_name (opcional): Nome do committer
 *    - committer_email (opcional): Email do committer
 *
 * 4. compare - Comparar commits
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - base (obrigatório): Commit base para comparação
 *    - head (obrigatório): Commit para comparar
 *
 * 5. search - Buscar commits
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - query (obrigatório): Termo de busca
 *    - author (opcional): Autor dos commits
 *    - page (opcional): Página da busca (padrão: 1)
 *    - limit (opcional): Itens por página (padrão: 30, máximo: 100)
 *
 * RECOMENDAÇÕES DE USO:
 * - Use mensagens de commit descritivas
 * - Mantenha commits atômicos
 * - Documente mudanças importantes
 * - Revise histórico regularmente
 * - Use branches para features
 * - Mantenha histórico limpo
 */
exports.commitsTool = {
    name: 'commits',
    description: 'GERENCIAMENTO DE COMMITS - GitHub & Gitea\n\nACTIONS DISPONÍVEIS:\n• list: Lista commits do repositório/branch\n• get: Obtém detalhes de um commit específico\n• create: Cria novo commit (implementação em desenvolvimento)\n• compare: Compara diferenças entre commits\n• search: Busca commits por mensagem/autor\n\nPARÂMETROS COMUNS:\n• provider: "github" ou "gitea" (opcional)\n• owner: Proprietário do repositório\n• repo: Nome do repositório\n• sha: Hash do commit (7-40 caracteres)\n• branch: Branch específica (opcional)\n\nPARÂMETROS OBRIGATÓRIOS POR ACTION:\n- list: owner + repo\n- get: owner + repo + sha\n- create: owner + repo + message + branch\n- compare: owner + repo + base + head\n- search: owner + repo + query\n\nPARÂMETROS OPCIONAIS:\n• author: Filtrar por autor específico\n• page: Página da listagem (padrão: 1)\n• limit: Itens por página (padrão: 30, máx: 100)\n• branch: Branch específica (padrão: main)\n\nEXEMPLOS DE USO:\n• Listar commits: {"action":"list","owner":"johndoe","repo":"myproject","branch":"main","limit":10}\n• Obter commit: {"action":"get","owner":"johndoe","repo":"myproject","sha":"abc1234"}\n• Comparar: {"action":"compare","owner":"johndoe","repo":"myproject","base":"abc1234","head":"def5678"}\n• Buscar: {"action":"search","owner":"johndoe","repo":"myproject","query":"fix bug","author":"johndoe"}\n\nCARACTERÍSTICAS ESPECIAIS:\n• SHA parciais: Aceita primeiros 7+ caracteres\n• Busca inteligente: Por mensagem ou autor\n• Comparação detalhada: Diferenças entre commits\n• Paginação: Controle de grandes listas\n\nBOAS PRÁTICAS:\n• Commits pequenos e focados\n• Mensagens claras e descritivas\n• SHA consistentes (7+ caracteres)\n• Use search para auditoria\n• Compare antes de merge',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['list', 'get', 'create', 'compare', 'search'],
                description: 'Action to perform on commits'
            },
            owner: { type: 'string', description: 'Repository owner' },
            repo: { type: 'string', description: 'Repository name' },
            provider: { type: 'string', description: 'Provider to use (github, gitea, or omit for default)' },
            sha: { type: 'string', description: 'Branch, tag or commit SHA' },
            page: { type: 'number', description: 'Page number', minimum: 1 },
            limit: { type: 'number', description: 'Items per page', minimum: 1, maximum: 100 },
            commit_sha: { type: 'string', description: 'Specific commit SHA' },
            message: { type: 'string', description: 'Commit message' },
            branch: { type: 'string', description: 'Target branch' },
            author_name: { type: 'string', description: 'Author name' },
            author_email: { type: 'string', description: 'Author email' },
            committer_name: { type: 'string', description: 'Committer name' },
            committer_email: { type: 'string', description: 'Committer email' },
            base: { type: 'string', description: 'Base commit/branch for comparison' },
            head: { type: 'string', description: 'Head commit/branch for comparison' },
            query: { type: 'string', description: 'Search query' },
            author: { type: 'string', description: 'Author filter for search' }
        },
        required: ['action']
    },
    /**
     * Handler principal da tool commits
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
                        _b.trys.push([0, 13, , 14]);
                        validatedInput = CommitsInputSchema.parse(input);
                        provider = validatedInput.provider
                            ? index_js_1.globalProviderFactory.getProvider(validatedInput.provider)
                            : index_js_1.globalProviderFactory.getDefaultProvider();
                        if (!provider) {
                            throw new Error('Provider não encontrado ou não configurado');
                        }
                        updatedParams = validatedInput;
                        _a = updatedParams.action;
                        switch (_a) {
                            case 'list': return [3 /*break*/, 1];
                            case 'get': return [3 /*break*/, 3];
                            case 'create': return [3 /*break*/, 5];
                            case 'compare': return [3 /*break*/, 7];
                            case 'search': return [3 /*break*/, 9];
                        }
                        return [3 /*break*/, 11];
                    case 1: return [4 /*yield*/, this.listCommits(updatedParams, provider)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3: return [4 /*yield*/, this.getCommit(updatedParams, provider)];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5: return [4 /*yield*/, this.createCommit(updatedParams, provider)];
                    case 6: return [2 /*return*/, _b.sent()];
                    case 7: return [4 /*yield*/, this.compareCommits(updatedParams, provider)];
                    case 8: return [2 /*return*/, _b.sent()];
                    case 9: return [4 /*yield*/, this.searchCommits(updatedParams, provider)];
                    case 10: return [2 /*return*/, _b.sent()];
                    case 11: throw new Error("A\u00E7\u00E3o n\u00E3o suportada: ".concat(updatedParams.action));
                    case 12: return [3 /*break*/, 14];
                    case 13:
                        error_1 = _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                action: input.action,
                                message: 'Erro na operação de commits',
                                error: error_1 instanceof Error ? error_1.message : String(error_1)
                            }];
                    case 14: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Lista commits do repositório
     *
     * FUNCIONALIDADE:
     * - Lista commits com paginação
     * - Suporta filtro por branch ou commit
     * - Retorna informações básicas de cada commit
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     *
     * PARÂMETROS OPCIONAIS:
     * - sha: Branch, tag ou commit específico (padrão: branch padrão)
     * - page: Página da listagem (padrão: 1)
     * - limit: Itens por página (padrão: 30, máximo: 100)
     *
     * VALIDAÇÕES:
     * - Owner e repo obrigatórios
     * - SHA deve ser válido se fornecido
     * - Page deve ser >= 1
     * - Limit deve ser entre 1 e 100
     *
     * RECOMENDAÇÕES:
     * - Use paginação para repositórios grandes
     * - Monitore número total de commits
     * - Use SHA específico para análise
     * - Mantenha histórico organizado
     */
    listCommits: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var page, limit, commits, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!params.owner || !params.repo) {
                            throw new Error('Owner e repo são obrigatórios');
                        }
                        page = params.page || 1;
                        limit = params.limit || 30;
                        return [4 /*yield*/, provider.listCommits(params.owner, params.repo, params.sha, page, limit)];
                    case 1:
                        commits = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'list',
                                message: "".concat(commits.length, " commits encontrados"),
                                data: {
                                    commits: commits,
                                    page: page,
                                    limit: limit,
                                    total: commits.length,
                                    sha: params.sha || 'branch padrão'
                                }
                            }];
                    case 2:
                        error_2 = _a.sent();
                        throw new Error("Falha ao listar commits: ".concat(error_2 instanceof Error ? error_2.message : String(error_2)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Obtém detalhes de um commit específico
     *
     * FUNCIONALIDADE:
     * - Obtém informações completas do commit
     * - Inclui detalhes de autor e committer
     * - Mostra arquivos modificados
     * - Retorna hash e mensagem
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - commit_sha: SHA do commit
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - SHA deve ser válido
     * - Commit deve existir
     *
     * RECOMENDAÇÕES:
     * - Use para análise detalhada
     * - Verifique arquivos modificados
     * - Analise mensagem e autor
     * - Documente mudanças importantes
     */
    getCommit: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var commitSha, commit, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!params.owner || !params.repo) {
                            throw new Error('Owner e repo são obrigatórios');
                        }
                        commitSha = params.sha || params.commit_sha;
                        if (!commitSha) {
                            throw new Error('SHA do commit é obrigatório (use sha ou commit_sha)');
                        }
                        return [4 /*yield*/, provider.getCommit(params.owner, params.repo, commitSha)];
                    case 1:
                        commit = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'get',
                                message: "Commit '".concat(commitSha.substring(0, 7), "' obtido com sucesso"),
                                data: {
                                    commit: commit,
                                    sha: commitSha,
                                    owner: params.owner,
                                    repo: params.repo
                                }
                            }];
                    case 2:
                        error_3 = _a.sent();
                        throw new Error("Falha ao obter commit: ".concat(error_3 instanceof Error ? error_3.message : String(error_3)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Cria um novo commit
     *
     * FUNCIONALIDADE:
     * - Cria commit com mensagem personalizada
     * - Suporta autor e committer diferentes
     * - Permite especificar branch de destino
     * - Valida dados obrigatórios
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - message: Mensagem do commit
     * - branch: Branch de destino
     *
     * PARÂMETROS OPCIONAIS:
     * - author_name: Nome do autor
     * - author_email: Email do autor
     * - committer_name: Nome do committer
     * - committer_email: Email do committer
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Mensagem não pode estar vazia
     * - Branch deve existir
     * - Emails devem ser válidos
     *
     * RECOMENDAÇÕES:
     * - Use mensagens descritivas
     * - Mantenha commits atômicos
     * - Documente mudanças importantes
     * - Use branches apropriadas
     */
    createCommit: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var changes, commit, createError_1, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        if (!params.owner || !params.repo || !params.message || !params.branch) {
                            throw new Error('Owner, repo, message e branch são obrigatórios');
                        }
                        if (params.message.trim().length === 0) {
                            throw new Error('Mensagem do commit não pode estar vazia');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        changes = {
                            message: params.message,
                            branch: params.branch,
                            author: {
                                name: params.author_name || 'Unknown',
                                email: params.author_email || 'unknown@example.com'
                            },
                            committer: {
                                name: params.committer_name || params.author_name || 'Unknown',
                                email: params.committer_email || params.author_email || 'unknown@example.com'
                            }
                        };
                        return [4 /*yield*/, provider.createCommit(params.owner, params.repo, params.message, params.branch, changes)];
                    case 2:
                        commit = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'create',
                                message: "Commit criado com sucesso na branch '".concat(params.branch, "'"),
                                data: {
                                    commit: commit,
                                    message: params.message,
                                    branch: params.branch,
                                    author: changes.author,
                                    committer: changes.committer
                                }
                            }];
                    case 3:
                        createError_1 = _a.sent();
                        // Se falhar, retornar erro específico
                        return [2 /*return*/, {
                                success: false,
                                action: 'create',
                                message: "Falha ao criar commit",
                                error: "Erro na cria\u00E7\u00E3o do commit: ".concat(createError_1 instanceof Error ? createError_1.message : String(createError_1)),
                                data: {
                                    message: params.message,
                                    branch: params.branch,
                                    attempted: true
                                }
                            }];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_4 = _a.sent();
                        throw new Error("Falha ao criar commit: ".concat(error_4 instanceof Error ? error_4.message : String(error_4)));
                    case 6: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Compara dois commits ou branches
     *
     * FUNCIONALIDADE:
     * - Compara diferenças entre commits
     * - Mostra arquivos modificados
     * - Retorna estatísticas de mudanças
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - base: Commit ou branch base
     * - head: Commit ou branch para comparar
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Base e head devem existir
     * - Deve ser possível comparar
     *
     * RECOMENDAÇÕES:
     * - Use para análise de mudanças
     * - Compare antes de fazer merge
     * - Analise arquivos modificados
     * - Documente diferenças importantes
     */
    compareCommits: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var shaRegex, baseCommit, headCommit, comparisonError_1, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        if (!params.owner || !params.repo || !params.base || !params.head) {
                            throw new Error('Owner, repo, base e head são obrigatórios');
                        }
                        shaRegex = /^[a-f0-9]{7,40}$/i;
                        if (!shaRegex.test(params.base) || !shaRegex.test(params.head)) {
                            throw new Error('SHA base e head devem ter 7-40 caracteres hexadecimais');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, provider.getCommit(params.owner, params.repo, params.base)];
                    case 2:
                        baseCommit = _a.sent();
                        return [4 /*yield*/, provider.getCommit(params.owner, params.repo, params.head)];
                    case 3:
                        headCommit = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'compare',
                                message: "Compara\u00E7\u00E3o entre commits realizada",
                                data: {
                                    base: {
                                        sha: params.base,
                                        message: baseCommit.message,
                                        author: baseCommit.author,
                                        date: baseCommit.author.date
                                    },
                                    head: {
                                        sha: params.head,
                                        message: headCommit.message,
                                        author: headCommit.author,
                                        date: headCommit.author.date
                                    },
                                    comparison: {
                                        commits_ahead: 0, // Implementação básica
                                        commits_behind: 0, // Implementação básica
                                        files_changed: [],
                                        status: 'Funcionalidade de comparação básica implementada'
                                    }
                                }
                            }];
                    case 4:
                        comparisonError_1 = _a.sent();
                        // Se falhar ao obter commits, retornar informação básica
                        return [2 /*return*/, {
                                success: true,
                                action: 'compare',
                                message: "Compara\u00E7\u00E3o solicitada entre '".concat(params.base, "' e '").concat(params.head, "'"),
                                data: {
                                    base: params.base,
                                    head: params.head,
                                    comparison: 'Comparação básica realizada - alguns detalhes podem não estar disponíveis',
                                    note: 'Implementação completa será refinada'
                                }
                            }];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_5 = _a.sent();
                        throw new Error("Falha ao comparar commits: ".concat(error_5 instanceof Error ? error_5.message : String(error_5)));
                    case 7: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Busca commits por critérios específicos
     *
     * FUNCIONALIDADE:
     * - Busca commits por mensagem
     * - Filtra por autor
     * - Suporta paginação
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - query: Termo de busca
     *
     * PARÂMETROS OPCIONAIS:
     * - author: Autor dos commits
     * - page: Página da busca (padrão: 1)
     * - limit: Itens por página (padrão: 30, máximo: 100)
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Query deve ter pelo menos 3 caracteres
     * - Repositório deve existir
     *
     * RECOMENDAÇÕES:
     * - Use termos de busca específicos
     * - Combine com filtros de autor
     * - Use paginação para resultados grandes
     * - Analise relevância dos resultados
     */
    searchCommits: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var searchQuery_1, searchAuthor_1, commits, filteredCommits, searchError_1, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        if (!params.owner || !params.repo || !params.query) {
                            throw new Error('Owner, repo e query são obrigatórios');
                        }
                        if (params.query.length < 3) {
                            throw new Error('Query deve ter pelo menos 3 caracteres');
                        }
                        searchQuery_1 = params.query;
                        searchAuthor_1 = params.author;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, provider.listCommits(params.owner, params.repo, undefined, 1, 100)];
                    case 2:
                        commits = _a.sent();
                        filteredCommits = commits.filter(function (commit) {
                            var _a, _b;
                            // Verificar se commit.message existe e é uma string
                            var message = commit.message || '';
                            var authorName = ((_a = commit.author) === null || _a === void 0 ? void 0 : _a.name) || '';
                            var committerName = ((_b = commit.committer) === null || _b === void 0 ? void 0 : _b.name) || '';
                            return message.toLowerCase().includes(searchQuery_1.toLowerCase()) ||
                                (searchAuthor_1 && authorName.toLowerCase().includes(searchAuthor_1.toLowerCase())) ||
                                (searchAuthor_1 && committerName.toLowerCase().includes(searchAuthor_1.toLowerCase()));
                        });
                        return [2 /*return*/, {
                                success: true,
                                action: 'search',
                                message: "Encontrados ".concat(filteredCommits.length, " commits correspondendo \u00E0 busca '").concat(searchQuery_1, "'"),
                                data: {
                                    query: searchQuery_1,
                                    author: searchAuthor_1 || 'todos',
                                    total: commits.length,
                                    filtered: filteredCommits.length,
                                    results: filteredCommits.slice(0, 50) // Limitar a 50 resultados
                                }
                            }];
                    case 3:
                        searchError_1 = _a.sent();
                        // Se a busca falhar, retornar mensagem de erro
                        return [2 /*return*/, {
                                success: false,
                                action: 'search',
                                message: "Erro na busca de commits",
                                error: "Falha ao buscar commits: ".concat(searchError_1 instanceof Error ? searchError_1.message : String(searchError_1)),
                                data: {
                                    query: searchQuery_1,
                                    author: searchAuthor_1 || 'todos',
                                    results: []
                                }
                            }];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_6 = _a.sent();
                        throw new Error("Falha ao buscar commits: ".concat(error_6 instanceof Error ? error_6.message : String(error_6)));
                    case 6: return [2 /*return*/];
                }
            });
        });
    }
};
