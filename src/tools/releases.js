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
exports.releasesTool = void 0;
var zod_1 = require("zod");
var index_js_1 = require("../providers/index.js");
/**
 * Tool: releases
 *
 * DESCRIÇÃO:
 * Gerenciamento completo de releases com suporte multi-provider (GitHub e Gitea)
 *
 * FUNCIONALIDADES:
 * - Criação de novos releases
 * - Listagem e busca de releases
 * - Obtenção de detalhes específicos
 * - Atualização de releases existentes
 * - Publicação de releases
 * - Exclusão de releases
 * - Controle de versão
 *
 * USO:
 * - Para gerenciar versões do software
 * - Para controle de deploy
 * - Para documentação de mudanças
 * - Para distribuição de releases
 *
 * RECOMENDAÇÕES:
 * - Use versionamento semântico
 * - Documente mudanças detalhadamente
 * - Teste antes de publicar
 * - Mantenha histórico de versões
 */
/**
 * Schema de validação para entrada da tool releases
 *
 * VALIDAÇÕES:
 * - action: Ação obrigatória (create, list, get, update, delete, publish)
 * - Parâmetros específicos por ação
 * - Validação de tipos e formatos
 *
 * RECOMENDAÇÕES:
 * - Sempre valide entrada antes de usar
 * - Use parâmetros opcionais adequadamente
 * - Documente parâmetros obrigatórios
 */
var ReleasesInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['create', 'list', 'get', 'update', 'delete', 'publish']),
    // Parâmetros comuns
    owner: zod_1.z.string().optional(),
    repo: zod_1.z.string().optional(),
    // Para multi-provider
    provider: zod_1.z.enum(['gitea', 'github', 'both']).optional(), // Provider específico: gitea, github ou both
    // Para create
    tag_name: zod_1.z.string().optional(),
    name: zod_1.z.string().optional(),
    body: zod_1.z.string().optional(),
    draft: zod_1.z.boolean().optional(),
    prerelease: zod_1.z.boolean().optional(),
    target_commitish: zod_1.z.string().optional(),
    // Para get/update/delete/publish
    release_id: zod_1.z.number().optional(),
    // Para list
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    // Para update
    new_tag_name: zod_1.z.string().optional(),
    new_name: zod_1.z.string().optional(),
    new_body: zod_1.z.string().optional(),
    new_draft: zod_1.z.boolean().optional(),
    new_prerelease: zod_1.z.boolean().optional(),
    new_target_commitish: zod_1.z.string().optional(),
    // Para publish
    latest: zod_1.z.boolean().optional(),
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
var ReleasesResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    action: zod_1.z.string(),
    message: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional()
});
/**
 * Tool: releases
 *
 * DESCRIÇÃO:
 * Gerenciamento completo de releases Gitea com múltiplas ações
 *
 * ACTIONS DISPONÍVEIS:
 *
 * 1. create - Criar novo release
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - tag_name (obrigatório): Nome da tag do release
 *    - name (opcional): Nome do release
 *    - body (opcional): Descrição detalhada (changelog)
 *    - draft (opcional): Se é um draft release (padrão: false)
 *    - prerelease (opcional): Se é um prerelease (padrão: false)
 *    - target_commitish (opcional): Branch ou commit alvo (padrão: branch padrão)
 *
 * 2. list - Listar releases
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - page (opcional): Página da listagem (padrão: 1)
 *    - limit (opcional): Itens por página (padrão: 30, máximo: 100)
 *
 * 3. get - Obter detalhes do release
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - release_id (obrigatório): ID do release
 *
 * 4. update - Atualizar release existente
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - release_id (obrigatório): ID do release
 *    - new_tag_name (opcional): Nova tag
 *    - new_name (opcional): Novo nome
 *    - new_body (opcional): Nova descrição
 *    - new_draft (opcional): Novo status de draft
 *    - new_prerelease (opcional): Novo status de prerelease
 *    - new_target_commitish (opcional): Nova branch/commit alvo
 *
 * 5. delete - Deletar release
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - release_id (obrigatório): ID do release
 *
 * 6. publish - Publicar release
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - release_id (obrigatório): ID do release
 *
 * RECOMENDAÇÕES DE USO:
 * - Use versionamento semântico (ex: v1.0.0, v2.1.3)
 * - Documente mudanças detalhadamente no body
 * - Use drafts para releases em preparação
 * - Marque prereleases adequadamente
 * - Teste releases antes de publicar
 * - Mantenha changelog organizado
 */
exports.releasesTool = {
    name: 'releases',
    description: 'Gerenciamento completo de releases.\n\nACTIONS DISPONÍVEIS:\n• create: Cria novo release\n  - OBRIGATÓRIOS: repo, tag_name\n  - OPCIONAIS: name, body, draft, prerelease, target_commitish\n\n• list: Lista releases do repositório\n  - OBRIGATÓRIOS: repo\n  - OPCIONAIS: page, limit\n\n• get: Obtém detalhes de um release específico\n  - OBRIGATÓRIOS: repo, release_id\n  - OPCIONAIS: latest\n\n• update: Atualiza release existente\n  - OBRIGATÓRIOS: repo, release_id\n  - OPCIONAIS: new_tag_name, new_name, new_body, new_draft, new_prerelease, new_target_commitish\n\n• delete: Remove release\n  - OBRIGATÓRIOS: repo, release_id\n\n• publish: Publica release draft\n  - OBRIGATÓRIOS: repo, release_id\n\nPARÂMETROS COMUNS:\n• provider: "github" ou "gitea" (opcional)\n• repo: Nome do repositório\n\nBoas práticas: use versionamento semântico (vMAJOR.MINOR.PATCH); documente mudanças no body (changelog); utilize prerelease/draft; crie releases para cada entrega "rodável"; para rollback, redeploy do release anterior.',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['create', 'list', 'get', 'update', 'delete', 'publish'],
                description: 'Action to perform on releases'
            },
            repo: { type: 'string', description: 'Repository name' },
            provider: { type: 'string', description: 'Provider to use (github, gitea, or omit for default)' },
            tag_name: { type: 'string', description: 'Release tag name' },
            name: { type: 'string', description: 'Release name' },
            body: { type: 'string', description: 'Release description/notes' },
            draft: { type: 'boolean', description: 'Create as draft release' },
            prerelease: { type: 'boolean', description: 'Mark as prerelease' },
            target_commitish: { type: 'string', description: 'Target branch or commit' },
            release_id: { type: 'number', description: 'Release ID' },
            page: { type: 'number', description: 'Page number', minimum: 1 },
            limit: { type: 'number', description: 'Items per page', minimum: 1, maximum: 100 },
            new_tag_name: { type: 'string', description: 'New tag name' },
            new_name: { type: 'string', description: 'New release name' },
            new_body: { type: 'string', description: 'New release description' },
            new_draft: { type: 'boolean', description: 'New draft status' },
            new_prerelease: { type: 'boolean', description: 'New prerelease status' },
            new_target_commitish: { type: 'string', description: 'New target branch or commit' },
            latest: { type: 'boolean', description: 'Get latest release' }
        },
        required: ['action']
    },
    /**
     * Handler principal da tool releases
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
                        _b.trys.push([0, 16, , 17]);
                        validatedInput = ReleasesInputSchema.parse(input);
                        provider = validatedInput.provider
                            ? index_js_1.globalProviderFactory.getProvider(validatedInput.provider)
                            : index_js_1.globalProviderFactory.getDefaultProvider();
                        if (!provider) {
                            throw new Error('Provider não encontrado ou não configurado');
                        }
                        return [4 /*yield*/, applyAutoUserForTool('releases', params, params.action)];
                    case 1:
                        updatedParams = _b.sent();
                        _a = updatedParams.action;
                        switch (_a) {
                            case 'create': return [3 /*break*/, 2];
                            case 'list': return [3 /*break*/, 4];
                            case 'get': return [3 /*break*/, 6];
                            case 'update': return [3 /*break*/, 8];
                            case 'delete': return [3 /*break*/, 10];
                            case 'publish': return [3 /*break*/, 12];
                        }
                        return [3 /*break*/, 14];
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
                    case 14: throw new Error("A\u00E7\u00E3o n\u00E3o suportada: ".concat(updatedParams.action));
                    case 15: return [3 /*break*/, 17];
                    case 16:
                        error_1 = _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                action: input.action,
                                message: 'Erro na operação de releases',
                                error: error_1 instanceof Error ? error_1.message : String(error_1)
                            }];
                    case 17: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Cria um novo release no repositório
     *
     * FUNCIONALIDADE:
     * - Cria release com tag e descrição
     * - Suporta configuração de draft e prerelease
     * - Permite especificar branch/commit alvo
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - tag_name: Nome da tag do release
     *
     * PARÂMETROS OPCIONAIS:
     * - name: Nome do release
     * - body: Descrição detalhada (changelog)
     * - draft: Se é um draft release (padrão: false)
     * - prerelease: Se é um prerelease (padrão: false)
     * - target_commitish: Branch ou commit alvo (padrão: branch padrão)
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Tag deve ser única no repositório
     * - Target commitish deve existir
     * - Usuário deve ter permissão de escrita
     *
     * RECOMENDAÇÕES:
     * - Use versionamento semântico (ex: v1.0.0)
     * - Documente mudanças detalhadamente
     * - Use drafts para releases em preparação
     * - Marque prereleases adequadamente
     */
    createRelease: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var releaseData, release, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!!params.repo || !params.tag_name) {
                            throw new Error('repo e tag_name são obrigatórios');
                        }
                        releaseData = {
                            tag_name: params.tag_name,
                            name: params.name || params.tag_name,
                            body: params.body || '',
                            draft: params.draft || false,
                            prerelease: params.prerelease || false,
                            target_commitish: params.target_commitish || 'main'
                        };
                        return [4 /*yield*/, provider.createRelease(params.tag_name, params.name || params.tag_name, params.body, params.draft, params.prerelease)];
                    case 1:
                        release = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'create',
                                message: "Release '".concat(params.tag_name, "' criado com sucesso"),
                                data: release
                            }];
                    case 2:
                        error_2 = _a.sent();
                        throw new Error("Falha ao criar release: ".concat(error_2 instanceof Error ? error_2.message : String(error_2)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Lista releases do repositório
     *
     * FUNCIONALIDADE:
     * - Lista releases com paginação
     * - Retorna informações básicas de cada release
     * - Inclui status de draft e prerelease
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
     * - Use paginação para repositórios com muitos releases
     * - Monitore número total de releases
     * - Verifique status de draft e prerelease
     * - Mantenha releases organizados
     */
    listReleases: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var page, limit, releases, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!!params.repo) {
                            throw new Error('e repo são obrigatórios');
                        }
                        page = params.page || 1;
                        limit = params.limit || 30;
                        return [4 /*yield*/, provider.listReleases((await provider.getCurrentUser()).login, params.repo, page, limit)];
                    case 1:
                        releases = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'list',
                                message: "".concat(releases.length, " releases encontrados"),
                                data: {
                                    releases: releases,
                                    page: page,
                                    limit: limit,
                                    total: releases.length
                                }
                            }];
                    case 2:
                        error_3 = _a.sent();
                        throw new Error("Falha ao listar releases: ".concat(error_3 instanceof Error ? error_3.message : String(error_3)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Obtém detalhes de um release específico
     *
     * FUNCIONALIDADE:
     * - Retorna informações completas do release
     * - Inclui tag, nome, descrição e status
     * - Mostra URLs de download
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - release_id: ID do release
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Release deve existir no repositório
     * - ID deve ser válido
     *
     * RECOMENDAÇÕES:
     * - Use para obter detalhes completos
     * - Verifique status de draft e prerelease
     * - Analise changelog e descrição
     * - Monitore URLs de download
     */
    getRelease: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var release, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!!params.repo || !params.release_id) {
                            throw new Error('repo e release_id são obrigatórios');
                        }
                        return [4 /*yield*/, provider.getRelease((await provider.getCurrentUser()).login, params.repo, params.release_id)];
                    case 1:
                        release = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'get',
                                message: "Release #".concat(params.release_id, " obtido com sucesso"),
                                data: release
                            }];
                    case 2:
                        error_4 = _a.sent();
                        throw new Error("Falha ao obter release: ".concat(error_4 instanceof Error ? error_4.message : String(error_4)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Atualiza um release existente
     *
     * FUNCIONALIDADE:
     * - Atualiza campos do release
     * - Suporta mudança de tag e descrição
     * - Permite alteração de status
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - release_id: ID do release
     *
     * PARÂMETROS OPCIONAIS:
     * - new_tag_name: Nova tag
     * - new_name: Novo nome
     * - new_body: Nova descrição
     * - new_draft: Novo status de draft
     * - new_prerelease: Novo status de prerelease
     * - new_target_commitish: Nova branch/commit alvo
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Release deve existir
     * - Pelo menos um campo deve ser atualizado
     *
     * RECOMENDAÇÕES:
     * - Atualize apenas campos necessários
     * - Use mensagens de commit descritivas
     * - Documente mudanças importantes
     * - Notifique usuários sobre mudanças
     */
    updateRelease: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var updateData, release, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!!params.repo || !params.release_id) {
                            throw new Error('repo e release_id são obrigatórios');
                        }
                        updateData = {};
                        if (params.new_tag_name)
                            updateData.tag_name = params.new_tag_name;
                        if (params.new_name)
                            updateData.name = params.new_name;
                        if (params.new_body !== undefined)
                            updateData.body = params.new_body;
                        if (params.new_draft !== undefined)
                            updateData.draft = params.new_draft;
                        if (params.new_prerelease !== undefined)
                            updateData.prerelease = params.new_prerelease;
                        if (params.new_target_commitish)
                            updateData.target_commitish = params.new_target_commitish;
                        if (Object.keys(updateData).length === 0) {
                            throw new Error('Nenhum campo para atualizar foi fornecido');
                        }
                        return [4 /*yield*/, provider.updateRelease(params.release_id, updateData)];
                    case 1:
                        release = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'update',
                                message: "Release #".concat(params.release_id, " atualizado com sucesso"),
                                data: release
                            }];
                    case 2:
                        error_5 = _a.sent();
                        throw new Error("Falha ao atualizar release: ".concat(error_5 instanceof Error ? error_5.message : String(error_5)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Deleta um release do repositório
     *
     * FUNCIONALIDADE:
     * - Remove release especificado
     * - Mantém tag associada (se existir)
     * - Confirma exclusão bem-sucedida
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - release_id: ID do release
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Release deve existir
     * - Usuário deve ter permissão de exclusão
     *
     * RECOMENDAÇÕES:
     * - Confirme exclusão antes de executar
     * - Verifique se release não está sendo usado
     * - Mantenha backup se necessário
     * - Documente motivo da exclusão
     */
    deleteRelease: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!!params.repo || !params.release_id) {
                            throw new Error('repo e release_id são obrigatórios');
                        }
                        return [4 /*yield*/, provider.deleteRelease(params.release_id)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'delete',
                                message: "Release #".concat(params.release_id, " deletado com sucesso"),
                                data: { deleted: true }
                            }];
                    case 2:
                        error_6 = _a.sent();
                        throw new Error("Falha ao deletar release: ".concat(error_6 instanceof Error ? error_6.message : String(error_6)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Publica um release draft
     *
     * FUNCIONALIDADE:
     * - Altera status do release de draft para publicado
     * - Mantém todas as outras configurações
     * - Permite download público
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - release_id: ID do release
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Release deve existir
     * - Release deve estar como draft
     *
     * RECOMENDAÇÕES:
     * - Confirme que release está pronto
     * - Teste antes de publicar
     * - Verifique se não há bugs conhecidos
     * - Notifique usuários sobre nova versão
     */
    publishRelease: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var release, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!!params.repo || !params.release_id) {
                            throw new Error('repo e release_id são obrigatórios');
                        }
                        return [4 /*yield*/, provider.updateRelease(params.release_id, { draft: false })];
                    case 1:
                        release = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'publish',
                                message: "Release #".concat(params.release_id, " publicado com sucesso"),
                                data: release
                            }];
                    case 2:
                        error_7 = _a.sent();
                        throw new Error("Falha ao publicar release: ".concat(error_7 instanceof Error ? error_7.message : String(error_7)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    }
};
