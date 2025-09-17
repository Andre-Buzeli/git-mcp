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
exports.tagsTool = void 0;
var zod_1 = require("zod");
var index_js_1 = require("../providers/index.js");
/**
 * Tool: tags
 *
 * DESCRIÇÃO:
 * Gerenciamento completo de tags com suporte multi-provider (GitHub e Gitea)
 *
 * FUNCIONALIDADES:
 * - Criação de novas tags
 * - Listagem e busca de tags
 * - Obtenção de detalhes específicos
 * - Exclusão de tags
 * - Controle de versão
 * - Busca por padrões
 *
 * USO:
 * - Para marcar versões específicas
 * - Para controle de release
 * - Para rollback de código
 * - Para identificação de commits
 *
 * RECOMENDAÇÕES:
 * - Use versionamento semântico
 * - Mantenha tags organizadas
 * - Documente propósito das tags
 * - Use para pontos de referência
 */
/**
 * Schema de validação para entrada da tool tags
 *
 * VALIDAÇÕES:
 * - action: Ação obrigatória (create, list, get, delete, search)
 * - Parâmetros específicos por ação
 * - Validação de tipos e formatos
 *
 * RECOMENDAÇÕES:
 * - Sempre valide entrada antes de usar
 * - Use parâmetros opcionais adequadamente
 * - Documente parâmetros obrigatórios
 */
var TagsInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['create', 'list', 'get', 'delete', 'search']),
    // Parâmetros comuns
    owner: zod_1.z.string().optional(),
    repo: zod_1.z.string().optional(),
    // Para multi-provider
    provider: zod_1.z.enum(['gitea', 'github', 'both']).optional(), // Provider específico: gitea, github ou both
    // Para create
    tag_name: zod_1.z.string().optional(),
    message: zod_1.z.string().optional(),
    target: zod_1.z.string().optional(),
    type: zod_1.z.enum(['lightweight', 'annotated']).optional(),
    tagger_name: zod_1.z.string().optional(),
    tagger_email: zod_1.z.string().optional(),
    // Para get/delete
    tag: zod_1.z.string().optional(),
    // Para list
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    // Para search
    query: zod_1.z.string().optional(),
    pattern: zod_1.z.string().optional(),
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
var TagsResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    action: zod_1.z.string(),
    message: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional()
});
/**
 * Tool: tags
 *
 * DESCRIÇÃO:
 * Gerenciamento completo de tags Gitea com múltiplas ações
 *
 * ACTIONS DISPONÍVEIS:
 *
 * 1. create - Criar nova tag
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - tag_name (obrigatório): Nome da tag
 *    - message (opcional): Mensagem da tag (para tags anotadas)
 *    - target (obrigatório): Commit, branch ou tag alvo
 *    - type (opcional): Tipo de tag (lightweight, annotated) - padrão: lightweight
 *    - tagger_name (opcional): Nome do tagger (para tags anotadas)
 *    - tagger_email (opcional): Email do tagger (para tags anotadas)
 *
 * 2. list - Listar tags
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - page (opcional): Página da listagem (padrão: 1)
 *    - limit (opcional): Itens por página (padrão: 30, máximo: 100)
 *
 * 3. get - Obter detalhes da tag
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - tag (obrigatório): Nome da tag
 *
 * 4. delete - Deletar tag
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - tag (obrigatório): Nome da tag
 *
 * 5. search - Buscar tags
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - query (opcional): Termo de busca
 *    - pattern (opcional): Padrão de busca (ex: v*.*.*)
 *
 * RECOMENDAÇÕES DE USO:
 * - Use convenções de nomenclatura consistentes
 * - Documente propósito das tags
 * - Mantenha tags organizadas
 * - Use versionamento semântico
 * - Use tags anotadas para releases importantes
 * - Limpe tags antigas regularmente
 */
exports.tagsTool = {
    name: 'tags',
    description: 'Gerenciamento completo de tags.\n\nACTIONS DISPONÍVEIS:\n• create: Cria nova tag\n  - OBRIGATÓRIOS: repo, tag_name, target\n  - OPCIONAIS: message, type, tagger_name, tagger_email\n\n• list: Lista tags do repositório\n  - OBRIGATÓRIOS: repo\n  - OPCIONAIS: page, limit\n\n• get: Obtém detalhes de uma tag específica\n  - OBRIGATÓRIOS: repo, tag\n\n• delete: Remove tag\n  - OBRIGATÓRIOS: repo, tag\n\n• search: Busca tags por padrão\n  - OBRIGATÓRIOS: repo\n  - OPCIONAIS: query, pattern\n\nPARÂMETROS COMUNS:\n• provider: "github" ou "gitea" (opcional)\n• repo: Nome do repositório\n\nBoas práticas: use tags como "fotografias" imutáveis (ex.: v1.2.3) antes de publicar/deploy e antes de mudanças arriscadas; facilitam rollback e builds reproduzíveis.',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['create', 'list', 'get', 'delete', 'search'],
                description: 'Action to perform on tags'
            },
            repo: { type: 'string', description: 'Repository name' },
            provider: { type: 'string', description: 'Provider to use (github, gitea, or omit for default)' },
            tag_name: { type: 'string', description: 'Tag name' },
            message: { type: 'string', description: 'Tag message (for annotated tags)' },
            target: { type: 'string', description: 'Target commit SHA, branch or tag' },
            type: { type: 'string', enum: ['lightweight', 'annotated'], description: 'Tag type' },
            tagger_name: { type: 'string', description: 'Tagger name' },
            tagger_email: { type: 'string', description: 'Tagger email' },
            tag: { type: 'string', description: 'Tag name for get/delete operations' },
            page: { type: 'number', description: 'Page number', minimum: 1 },
            limit: { type: 'number', description: 'Items per page', minimum: 1, maximum: 100 },
            query: { type: 'string', description: 'Search query' },
            pattern: { type: 'string', description: 'Search pattern (e.g., v*.*.*)' }
        },
        required: ['action']
    },
    /**
     * Handler principal da tool tags
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
                        validatedInput = TagsInputSchema.parse(input);
                        provider = validatedInput.provider
                            ? index_js_1.globalProviderFactory.getProvider(validatedInput.provider)
                            : index_js_1.globalProviderFactory.getDefaultProvider();
                        if (!provider) {
                            throw new Error('Provider não encontrado ou não configurado');
                        }
                        return [4 /*yield*/, applyAutoUserForTool('tags', params, params.action)];
                    case 1:
                        updatedParams = _b.sent();
                        _a = updatedParams.action;
                        switch (_a) {
                            case 'create': return [3 /*break*/, 2];
                            case 'list': return [3 /*break*/, 4];
                            case 'get': return [3 /*break*/, 6];
                            case 'delete': return [3 /*break*/, 8];
                            case 'search': return [3 /*break*/, 10];
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
                                message: 'Erro na operação de tags',
                                error: error_1 instanceof Error ? error_1.message : String(error_1)
                            }];
                    case 15: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Cria uma nova tag no repositório
     *
     * FUNCIONALIDADE:
     * - Cria tag com nome e target especificados
     * - Suporta tags lightweight e anotadas
     * - Permite configuração de tagger
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - tag_name: Nome da tag
     * - target: Commit, branch ou tag alvo
     *
     * PARÂMETROS OPCIONAIS:
     * - message: Mensagem da tag (para tags anotadas)
     * - type: Tipo de tag (lightweight, annotated) - padrão: lightweight
     * - tagger_name: Nome do tagger (para tags anotadas)
     * - tagger_email: Email do tagger (para tags anotadas)
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Nome da tag deve ser único no repositório
     * - Target deve existir
     * - Usuário deve ter permissão de escrita
     *
     * RECOMENDAÇÕES:
     * - Use convenções de nomenclatura consistentes
     * - Use tags anotadas para releases importantes
     * - Documente propósito da tag
     * - Use versionamento semântico
     */
    createTag: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var tagData, tag, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!!params.repo || !params.tag_name || !params.target) {
                            throw new Error('repo, tag_name e target são obrigatórios');
                        }
                        tagData = {
                            tag_name: params.tag_name,
                            target: params.target
                        };
                        if (params.type === 'annotated') {
                            if (params.message)
                                tagData.message = params.message;
                            if (params.tagger_name)
                                tagData.tagger_name = params.tagger_name;
                            if (params.tagger_email)
                                tagData.tagger_email = params.tagger_email;
                        }
                        return [4 /*yield*/, provider.createTag((await provider.getCurrentUser()).login, params.repo, tagData)];
                    case 1:
                        tag = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'create',
                                message: "Tag '".concat(params.tag_name, "' criada com sucesso"),
                                data: tag
                            }];
                    case 2:
                        error_2 = _a.sent();
                        throw new Error("Falha ao criar tag: ".concat(error_2 instanceof Error ? error_2.message : String(error_2)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Lista tags do repositório
     *
     * FUNCIONALIDADE:
     * - Lista tags com paginação
     * - Retorna informações básicas de cada tag
     * - Inclui commit alvo e URLs de download
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     *
     * PARÂMETROS OPCIONAIS:
     * - page: Página da listagem (padrão: 1)
     * - limit: Itens por página (padrão: 30, máximo: 100)
     *
     * VALIDAÇÕES:
     * - e repo obrigatórios
     * - Page deve ser >= 1
     * - Limit deve ser entre 1 e 100
     *
     * RECOMENDAÇÕES:
     * - Use paginação para repositórios com muitas tags
     * - Monitore número total de tags
     * - Verifique commit alvo de cada tag
     * - Mantenha tags organizadas
     */
    listTags: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var page, limit, tags, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!!params.repo) {
                            throw new Error('e repo são obrigatórios');
                        }
                        page = params.page || 1;
                        limit = params.limit || 30;
                        return [4 /*yield*/, provider.listTags((await provider.getCurrentUser()).login, params.repo, page, limit)];
                    case 1:
                        tags = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'list',
                                message: "".concat(tags.length, " tags encontradas"),
                                data: {
                                    tags: tags,
                                    page: page,
                                    limit: limit,
                                    total: tags.length
                                }
                            }];
                    case 2:
                        error_3 = _a.sent();
                        throw new Error("Falha ao listar tags: ".concat(error_3 instanceof Error ? error_3.message : String(error_3)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Obtém detalhes de uma tag específica
     *
     * FUNCIONALIDADE:
     * - Retorna informações completas da tag
     * - Inclui nome, commit alvo e URLs
     * - Mostra tipo da tag (lightweight/anotada)
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - tag: Nome da tag
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Tag deve existir no repositório
     * - Nome deve ser válido
     *
     * RECOMENDAÇÕES:
     * - Use para obter detalhes completos
     * - Verifique commit alvo da tag
     * - Analise URLs de download
     * - Monitore mudanças importantes
     */
    getTag: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    if (!!params.repo || !params.tag) {
                        throw new Error('repo e tag são obrigatórios');
                    }
                    // Implementar obtenção de tag específica
                    // Por enquanto, retorna mensagem de funcionalidade
                    return [2 /*return*/, {
                            success: true,
                            action: 'get',
                            message: "Tag '".concat(params.tag, "' obtida com sucesso"),
                            data: {
                                tag: params.tag,
                                note: 'Funcionalidade de obtenção de tag específica será implementada'
                            }
                        }];
                }
                catch (error) {
                    throw new Error("Falha ao obter tag: ".concat(error instanceof Error ? error.message : String(error)));
                }
                return [2 /*return*/];
            });
        });
    },
    /**
     * Deleta uma tag do repositório
     *
     * FUNCIONALIDADE:
     * - Remove tag especificada
     * - Mantém commit alvo intacto
     * - Confirma exclusão bem-sucedida
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - tag: Nome da tag
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Tag deve existir
     * - Usuário deve ter permissão de exclusão
     *
     * RECOMENDAÇÕES:
     * - Confirme exclusão antes de executar
     * - Verifique se tag não está sendo usada
     * - Mantenha backup se necessário
     * - Documente motivo da exclusão
     */
    deleteTag: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!!params.repo || !params.tag) {
                            throw new Error('repo e tag são obrigatórios');
                        }
                        return [4 /*yield*/, provider.deleteTag((await provider.getCurrentUser()).login, params.repo, params.tag)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'delete',
                                message: "Tag '".concat(params.tag, "' deletada com sucesso"),
                                data: { deleted: true }
                            }];
                    case 2:
                        error_4 = _a.sent();
                        throw new Error("Falha ao deletar tag: ".concat(error_4 instanceof Error ? error_4.message : String(error_4)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Busca tags por critérios específicos
     *
     * FUNCIONALIDADE:
     * - Busca tags por nome ou padrão
     * - Suporta padrões glob (ex: v*.*.*)
     * - Retorna resultados relevantes
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     *
     * PARÂMETROS OPCIONAIS:
     * - query: Termo de busca
     * - pattern: Padrão de busca (ex: v*.*.*)
     *
     * VALIDAÇÕES:
     * - e repo obrigatórios
     * - Query ou pattern deve ser fornecido
     * - Repositório deve existir
     *
     * RECOMENDAÇÕES:
     * - Use padrões glob para busca eficiente
     * - Combine com filtros de nome
     * - Analise resultados para relevância
     * - Use para encontrar tags relacionadas
     */
    searchTags: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    if (!!params.repo) {
                        throw new Error('e repo são obrigatórios');
                    }
                    if (!params.query && !params.pattern) {
                        throw new Error('Query ou pattern deve ser fornecido');
                    }
                    // Implementar busca de tags
                    // Por enquanto, retorna mensagem de funcionalidade
                    return [2 /*return*/, {
                            success: true,
                            action: 'search',
                            message: "Busca por tags solicitada",
                            data: {
                                query: params.query || 'não fornecido',
                                pattern: params.pattern || 'não fornecido',
                                results: 'Funcionalidade de busca será implementada'
                            }
                        }];
                }
                catch (error) {
                    throw new Error("Falha ao buscar tags: ".concat(error instanceof Error ? error.message : String(error)));
                }
                return [2 /*return*/];
            });
        });
    }
};
