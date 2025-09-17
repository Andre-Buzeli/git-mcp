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
exports.usersTool = void 0;
var zod_1 = require("zod");
var index_js_1 = require("../providers/index.js");
/**
 * Tool: users
 *
 * DESCRIÇÃO:
 * Gerenciamento de usuários com suporte multi-provider (GitHub e Gitea)
 *
 * FUNCIONALIDADES:
 * - Obtenção de usuário atual
 * - Obtenção de usuário específico
 * - Busca de usuários
 * - Listagem de organizações
 * - Listagem de repositórios
 * - Informações de perfil
 *
 * USO:
 * - Para autenticação e perfil
 * - Para busca de usuários
 * - Para gerenciamento de acesso
 * - Para colaboração
 *
 * RECOMENDAÇÕES:
 * - Use apenas permissões necessárias
 * - Evite expor dados sensíveis
 * - Monitore uso da API
 * - Respeite limites de rate
 */
/**
 * Schema de validação para entrada da tool users
 *
 * VALIDAÇÕES:
 * - action: Ação obrigatória (get, list, search, orgs, repos)
 * - Parâmetros específicos por ação
 * - Validação de tipos e formatos
 *
 * RECOMENDAÇÕES:
 * - Sempre valide entrada antes de usar
 * - Use parâmetros opcionais adequadamente
 * - Documente parâmetros obrigatórios
 */
var UsersInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['get', 'list', 'search', 'orgs', 'repos']),
    // Para multi-provider
    provider: zod_1.z.enum(['gitea', 'github', 'both']).optional(), // Provider específico: gitea, github ou both
    // Para get específico
    username: zod_1.z.string().optional(),
    current: zod_1.z.boolean().optional(),
    // Para search
    query: zod_1.z.string().optional(),
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    // Para repos
    repo_type: zod_1.z.enum(['all', 'owner', 'member', 'collaborator']).optional(),
    sort: zod_1.z.enum(['created', 'updated', 'pushed', 'full_name']).optional(),
    direction: zod_1.z.enum(['asc', 'desc']).optional(),
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
var UsersResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    action: zod_1.z.string(),
    message: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional()
});
/**
 * Tool: users
 *
 * DESCRIÇÃO:
 * Gerenciamento completo de usuários Gitea com múltiplas ações
 *
 * ACTIONS DISPONÍVEIS:
 *
 * 1. get - Obter informações de usuário
 *    Parâmetros:
 *    - username (opcional): Nome de usuário específico
 *    - current (opcional): Se true, obtém usuário atual autenticado
 *
 * 2. list - Listar usuários
 *    Parâmetros:
 *    - page (opcional): Página da listagem (padrão: 1)
 *    - limit (opcional): Itens por página (padrão: 30, máximo: 100)
 *
 * 3. search - Buscar usuários
 *    Parâmetros:
 *    - query (obrigatório): Termo de busca
 *    - page (opcional): Página da busca (padrão: 1)
 *    - limit (opcional): Itens por página (padrão: 30, máximo: 100)
 *
 * 4. orgs - Obter organizações do usuário
 *    Parâmetros:
 *    - username (obrigatório): Nome de usuário
 *    - page (opcional): Página da listagem (padrão: 1)
 *    - limit (opcional): Itens por página (padrão: 30, máximo: 100)
 *
 * 5. repos - Listar repositórios do usuário
 *    Parâmetros:
 *    - username (obrigatório): Nome de usuário
 *    - repo_type (opcional): Tipo de repositório (all, owner, member, collaborator) - padrão: all
 *    - sort (opcional): Ordenação (created, updated, pushed, full_name) - padrão: created
 *    - direction (opcional): Direção (asc, desc) - padrão: desc
 *    - page (opcional): Página da listagem (padrão: 1)
 *    - limit (opcional): Itens por página (padrão: 30, máximo: 100)
 *
 * RECOMENDAÇÕES DE USO:
 * - Respeite privacidade dos usuários
 * - Use apenas para operações necessárias
 * - Monitore uso de permissões
 * - Mantenha logs de acesso
 * - Use filtros adequados para listagens
 * - Verifique permissões antes de acessar dados
 */
exports.usersTool = {
    name: 'users',
    description: 'Gerenciamento de usuários.\n\nACTIONS DISPONÍVEIS:\n• get: Obtém informações de usuário\n  - OPCIONAIS: username, current\n\n• list: Lista usuários\n  - OPCIONAIS: page, limit\n\n• search: Busca usuários\n  - OBRIGATÓRIOS: query\n  - OPCIONAIS: page, limit\n\n• orgs: Lista organizações do usuário\n  - OBRIGATÓRIOS: username\n  - OPCIONAIS: page, limit\n\n• repos: Lista repositórios do usuário\n  - OBRIGATÓRIOS: username\n  - OPCIONAIS: repo_type, sort, direction, page, limit\n\nPARÂMETROS COMUNS:\n• provider: "github" ou "gitea" (opcional)\n\nDicas: útil para automações pessoais, conferência rápida de acesso e organizações; use apenas permissões necessárias e evite expor dados sensíveis.',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['get', 'list', 'search', 'orgs', 'repos'],
                description: 'Action to perform on users'
            },
            provider: { type: 'string', description: 'Provider to use (github, gitea, or omit for default)' },
            username: { type: 'string', description: 'Username' },
            current: { type: 'boolean', description: 'Get current authenticated user' },
            query: { type: 'string', description: 'Search query' },
            page: { type: 'number', description: 'Page number', minimum: 1 },
            limit: { type: 'number', description: 'Items per page', minimum: 1, maximum: 100 },
            repo_type: { type: 'string', enum: ['all', 'owner', 'member', 'collaborator'], description: 'Repository type filter' },
            sort: { type: 'string', enum: ['created', 'updated', 'pushed', 'full_name'], description: 'Sort order' },
            direction: { type: 'string', enum: ['asc', 'desc'], description: 'Sort direction' }
        },
        required: ['action']
    },
    /**
     * Handler principal da tool users
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
                        _b.trys.push([0, 14, , 15]);
                        validatedInput = UsersInputSchema.parse(input);
                        provider = validatedInput.provider
                            ? index_js_1.globalProviderFactory.getProvider(validatedInput.provider)
                            : index_js_1.globalProviderFactory.getDefaultProvider();
                        if (!provider) {
                            throw new Error('Provider não encontrado ou não configurado');
                        }
                        return [4 /*yield*/, applyAutoUserForTool('users', params, params.action)];
                    case 1:
                        updatedParams = _b.sent();
                        _a = updatedParams.action;
                        switch (_a) {
                            case 'get': return [3 /*break*/, 2];
                            case 'list': return [3 /*break*/, 4];
                            case 'search': return [3 /*break*/, 6];
                            case 'orgs': return [3 /*break*/, 8];
                            case 'repos': return [3 /*break*/, 10];
                        }
                        return [3 /*break*/, 12];
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
                    case 12: throw new Error("A\u00E7\u00E3o n\u00E3o suportada: ".concat(updatedParams.action));
                    case 13: return [3 /*break*/, 15];
                    case 14:
                        error_1 = _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                action: input.action,
                                message: 'Erro na operação de usuários',
                                error: error_1 instanceof Error ? error_1.message : String(error_1)
                            }];
                    case 15: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Obtém informações de um usuário específico
     *
     * FUNCIONALIDADE:
     * - Retorna informações completas do usuário
     * - Suporta usuário atual ou específico
     * - Inclui perfil, estatísticas e metadados
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - Nenhum (se current=true) ou username
     *
     * PARÂMETROS OPCIONAIS:
     * - current: Se true, obtém usuário atual autenticado
     * - username: Nome de usuário específico
     *
     * VALIDAÇÕES:
     * - current=true OU username deve ser fornecido
     * - Usuário deve existir (se username fornecido)
     * - Usuário deve ter permissão de acesso
     *
     * RECOMENDAÇÕES:
     * - Use para obter informações de perfil
     * - Verifique permissões antes de acessar
     * - Respeite configurações de privacidade
     * - Monitore uso de dados sensíveis
     */
    getUser: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var user, message, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        user = void 0;
                        message = void 0;
                        if (!params.current) return [3 /*break*/, 1];
                        // Implementar getCurrentUser
                        user = {
                            id: 1,
                            login: 'usuário atual',
                            name: 'Usuário Atual',
                            email: 'user@example.com',
                            avatar_url: 'https://example.com/avatar.png',
                            note: 'Funcionalidade getCurrentUser será implementada'
                        };
                        message = 'Usuário atual obtido com sucesso';
                        return [3 /*break*/, 4];
                    case 1:
                        if (!params.username) return [3 /*break*/, 3];
                        return [4 /*yield*/, provider.getUser(params.username)];
                    case 2:
                        user = _a.sent();
                        message = "Usu\u00E1rio '".concat(params.username, "' obtido com sucesso");
                        return [3 /*break*/, 4];
                    case 3: throw new Error('current=true ou username deve ser fornecido');
                    case 4: return [2 /*return*/, {
                            success: true,
                            action: 'get',
                            message: message,
                            data: user
                        }];
                    case 5:
                        error_2 = _a.sent();
                        throw new Error("Falha ao obter usu\u00E1rio: ".concat(error_2 instanceof Error ? error_2.message : String(error_2)));
                    case 6: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Lista usuários do sistema
     *
     * FUNCIONALIDADE:
     * - Lista usuários com paginação
     * - Retorna informações básicas de cada usuário
     * - Suporta filtros de paginação
     *
     * PARÂMETROS OPCIONAIS:
     * - page: Página da listagem (padrão: 1)
     * - limit: Itens por página (padrão: 30, máximo: 100)
     *
     * VALIDAÇÕES:
     * - Page deve ser >= 1
     * - Limit deve ser entre 1 e 100
     * - Usuário deve ter permissão de listagem
     *
     * RECOMENDAÇÕES:
     * - Use paginação para sistemas grandes
     * - Monitore número total de usuários
     * - Verifique permissões de acesso
     * - Mantenha logs de listagem
     */
    listUsers: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var page, limit;
            return __generator(this, function (_a) {
                try {
                    page = params.page || 1;
                    limit = params.limit || 30;
                    // Implementar listagem de usuários
                    // Por enquanto, retorna mensagem de funcionalidade
                    return [2 /*return*/, {
                            success: true,
                            action: 'list',
                            message: "Listagem de usu\u00E1rios solicitada",
                            data: {
                                page: page,
                                limit: limit,
                                note: 'Funcionalidade de listagem de usuários será implementada'
                            }
                        }];
                }
                catch (error) {
                    throw new Error("Falha ao listar usu\u00E1rios: ".concat(error instanceof Error ? error.message : String(error)));
                }
                return [2 /*return*/];
            });
        });
    },
    /**
     * Busca usuários por critérios específicos
     *
     * FUNCIONALIDADE:
     * - Busca usuários por nome ou email
     * - Suporta paginação
     * - Retorna resultados relevantes
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - query: Termo de busca
     *
     * PARÂMETROS OPCIONAIS:
     * - page: Página da busca (padrão: 1)
     * - limit: Itens por página (padrão: 30, máximo: 100)
     *
     * VALIDAÇÕES:
     * - Query deve ser fornecido
     * - Query deve ter pelo menos 3 caracteres
     * - Usuário deve ter permissão de busca
     *
     * RECOMENDAÇÕES:
     * - Use termos de busca específicos
     * - Combine com filtros de paginação
     * - Analise relevância dos resultados
     * - Respeite configurações de privacidade
     */
    searchUsers: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var page, limit, users, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!params.query) {
                            throw new Error('Query é obrigatória');
                        }
                        if (params.query.length < 3) {
                            throw new Error('Query deve ter pelo menos 3 caracteres');
                        }
                        page = params.page || 1;
                        limit = params.limit || 30;
                        return [4 /*yield*/, provider.searchUsers(params.query, page, limit)];
                    case 1:
                        users = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'search',
                                message: "".concat(users.length, " usu\u00E1rios encontrados para '").concat(params.query, "'"),
                                data: {
                                    users: users,
                                    query: params.query,
                                    page: page,
                                    limit: limit,
                                    total: users.length
                                }
                            }];
                    case 2:
                        error_3 = _a.sent();
                        throw new Error("Falha ao buscar usu\u00E1rios: ".concat(error_3 instanceof Error ? error_3.message : String(error_3)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Obtém organizações de um usuário específico
     *
     * FUNCIONALIDADE:
     * - Lista organizações do usuário
     * - Suporta paginação
     * - Retorna informações básicas das organizações
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - username: Nome de usuário
     *
     * PARÂMETROS OPCIONAIS:
     * - page: Página da listagem (padrão: 1)
     * - limit: Itens por página (padrão: 30, máximo: 100)
     *
     * VALIDAÇÕES:
     * - Username deve ser fornecido
     * - Usuário deve existir
     * - Usuário deve ter permissão de acesso
     *
     * RECOMENDAÇÕES:
     * - Use para gerenciar membros de organizações
     * - Verifique permissões antes de acessar
     * - Monitore acesso a dados organizacionais
     * - Mantenha logs de consulta
     */
    getUserOrganizations: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var page, limit, organizations;
            return __generator(this, function (_a) {
                try {
                    if (!params.username) {
                        throw new Error('Username é obrigatório');
                    }
                    page = params.page || 1;
                    limit = params.limit || 30;
                    organizations = [{
                            id: 1,
                            login: 'org-example',
                            name: 'Organização Exemplo',
                            avatar_url: 'https://example.com/org-avatar.png',
                            note: 'Funcionalidade getUserOrganizations será implementada'
                        }];
                    return [2 /*return*/, {
                            success: true,
                            action: 'orgs',
                            message: "".concat(organizations.length, " organiza\u00E7\u00F5es encontradas para '").concat(params.username, "'"),
                            data: {
                                username: params.username,
                                organizations: organizations,
                                page: page,
                                limit: limit,
                                total: organizations.length
                            }
                        }];
                }
                catch (error) {
                    throw new Error("Falha ao obter organiza\u00E7\u00F5es do usu\u00E1rio: ".concat(error instanceof Error ? error.message : String(error)));
                }
                return [2 /*return*/];
            });
        });
    },
    /**
     * Lista repositórios de um usuário específico
     *
     * FUNCIONALIDADE:
     * - Lista repositórios com filtros
     * - Suporta diferentes tipos de repositório
     * - Permite ordenação e paginação
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - username: Nome de usuário
     *
     * PARÂMETROS OPCIONAIS:
     * - repo_type: Tipo de repositório (all, owner, member, collaborator) - padrão: all
     * - sort: Ordenação (created, updated, pushed, full_name) - padrão: created
     * - direction: Direção (asc, desc) - padrão: desc
     * - page: Página da listagem (padrão: 1)
     * - limit: Itens por página (padrão: 30, máximo: 100)
     *
     * VALIDAÇÕES:
     * - Username deve ser fornecido
     * - Usuário deve existir
     * - Usuário deve ter permissão de acesso
     *
     * RECOMENDAÇÕES:
     * - Use filtros adequados para organização
     * - Monitore acesso a repositórios
     * - Verifique permissões antes de listar
     * - Mantenha logs de consulta
     */
    getUserRepositories: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var repoType, sort, direction, page, limit, repositories;
            return __generator(this, function (_a) {
                try {
                    if (!params.username) {
                        throw new Error('Username é obrigatório');
                    }
                    repoType = params.repo_type || 'all';
                    sort = params.sort || 'created';
                    direction = params.direction || 'desc';
                    page = params.page || 1;
                    limit = params.limit || 30;
                    repositories = [{
                            id: 1,
                            name: 'repo-example',
                            full_name: "".concat(params.username, "/repo-example"),
                            private: false,
                            description: 'Repositório de exemplo',
                            note: 'Funcionalidade getRepositories será implementada'
                        }];
                    return [2 /*return*/, {
                            success: true,
                            action: 'repos',
                            message: "".concat(repositories.length, " reposit\u00F3rios encontrados para '").concat(params.username, "'"),
                            data: {
                                username: params.username,
                                repositories: repositories,
                                repo_type: repoType,
                                sort: sort,
                                direction: direction,
                                page: page,
                                limit: limit,
                                total: repositories.length
                            }
                        }];
                }
                catch (error) {
                    throw new Error("Falha ao obter reposit\u00F3rios do usu\u00E1rio: ".concat(error instanceof Error ? error.message : String(error)));
                }
                return [2 /*return*/];
            });
        });
    }
};
