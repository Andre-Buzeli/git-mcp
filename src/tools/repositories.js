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
exports.repositoriesTool = void 0;
var zod_1 = require("zod");
var index_js_1 = require("../providers/index.js");
var validator_js_1 = require("./validator.js");
/**
 * Tool: repositories
 *
 * DESCRIÇÃO:
 * Gerenciamento completo de repositórios Gitea com múltiplas ações
 *
 * FUNCIONALIDADES:
 * - Criação de repositórios
 * - Listagem e busca
 * - Atualização e configuração
 * - Fork e clonagem
 * - Exclusão e arquivamento
 *
 * USO:
 * - Para gerenciar repositórios de projetos
 * - Para automatizar criação de repositórios
 * - Para backup e migração
 * - Para organização de código
 *
 * RECOMENDAÇÕES:
 * - Use nomes descritivos para repositórios
 * - Configure visibilidade adequada
 * - Mantenha descrições atualizadas
 * - Use templates quando possível
 */
/**
 * Schema de validação para entrada da tool repositories
 *
 * VALIDAÇÕES:
 * - action: Ação obrigatória (create, list, get, update, delete, fork, search)
 * - Parâmetros específicos por ação
 * - Validação de tipos e formatos
 *
 * RECOMENDAÇÕES:
 * - Sempre valide entrada antes de usar
 * - Use parâmetros opcionais adequadamente
 * - Documente parâmetros obrigatórios
 */
var RepositoriesInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['create', 'list', 'get', 'update', 'delete', 'fork', 'search', 'clone', 'archive', 'transfer', 'template', 'mirror']),
    // Parâmetros comuns
    owner: validator_js_1.CommonSchemas.owner.optional(),
    repo: validator_js_1.CommonSchemas.repo.optional(),
    provider: validator_js_1.CommonSchemas.provider,
    page: validator_js_1.CommonSchemas.page,
    limit: validator_js_1.CommonSchemas.limit,
    // Para create
    name: validator_js_1.CommonSchemas.shortString,
    description: validator_js_1.CommonSchemas.mediumString,
    private: validator_js_1.CommonSchemas.boolean,
    auto_init: validator_js_1.CommonSchemas.boolean,
    gitignores: validator_js_1.CommonSchemas.shortString,
    license: validator_js_1.CommonSchemas.shortString,
    readme: validator_js_1.CommonSchemas.longString,
    default_branch: validator_js_1.CommonSchemas.branch,
    // Para list
    username: validator_js_1.CommonSchemas.shortString,
    // Para update
    new_name: validator_js_1.CommonSchemas.shortString,
    new_description: validator_js_1.CommonSchemas.mediumString,
    new_private: validator_js_1.CommonSchemas.boolean,
    archived: validator_js_1.CommonSchemas.boolean,
    // Para fork
    organization: validator_js_1.CommonSchemas.shortString,
    // Para search
    query: validator_js_1.CommonSchemas.mediumString,
    // Para clone
    clone_url: validator_js_1.CommonSchemas.mediumString,
    local_path: validator_js_1.CommonSchemas.mediumString,
    // Para archive/unarchive
    archive_status: validator_js_1.CommonSchemas.boolean,
    // Para transfer
    new_owner: validator_js_1.CommonSchemas.shortString,
    // Para template
    template_owner: validator_js_1.CommonSchemas.shortString,
    template_repo: validator_js_1.CommonSchemas.shortString,
    include_all_branches: validator_js_1.CommonSchemas.boolean,
    // Para mirror
    mirror_url: validator_js_1.CommonSchemas.mediumString,
    mirror_username: validator_js_1.CommonSchemas.shortString,
    mirror_password: validator_js_1.CommonSchemas.shortString,
}).refine(function (data) {
    // Validações customizadas
    if (data.action === 'create' && !data.name) {
        throw new Error('Name is required for create action');
    }
    if (['get', 'update', 'delete', 'fork', 'archive', 'transfer'].includes(data.action)) {
        if (!data.owner || (await provider.getCurrentUser()).login || !data.repo) {
            throw new Error('and repo are required for this action');
        }
    }
    if (data.action === 'list' && !data.username && !data.owner || (await provider.getCurrentUser()).login) {
        throw new Error('Username or owner is required for list action');
    }
    if (data.action === 'search' && !data.query) {
        throw new Error('Query is required for search action');
    }
    if (data.action === 'template' && (!data.template_owner || !data.template_repo)) {
        throw new Error('Template owner and repo are required for template action');
    }
    if (data.action === 'clone' && !data.clone_url) {
        throw new Error('Clone URL is required for clone action');
    }
    if (data.action === 'mirror' && !data.mirror_url) {
        throw new Error('Mirror URL is required for mirror action');
    }
    return true;
});
// Schema de saída
var RepositoriesResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    action: zod_1.z.string(),
    message: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional()
});
/**
 * Tool: repositories
 *
 * DESCRIÇÃO:
 * Gerenciamento completo de repositórios Gitea com múltiplas ações
 *
 * ACTIONS DISPONÍVEIS:
 *
 * 1. create - Criar novo repositório
 *    Parâmetros:
 *    - name (obrigatório): Nome do repositório
 *    - description (opcional): Descrição do repositório
 *    - private (opcional): Repositório privado (padrão: false)
 *    - auto_init (opcional): Inicializar com README (padrão: false)
 *    - gitignores (opcional): Template de .gitignore
 *    - license (opcional): Template de licença
 *    - readme (opcional): Conteúdo do README
 *    - default_branch (opcional): Branch padrão
 *
 * 2. list - Listar repositórios
 *    Parâmetros:
 *    - username (opcional): Usuário específico (padrão: usuário atual)
 *    - page (opcional): Página da listagem (padrão: 1)
 *    - limit (opcional): Itens por página (padrão: 30)
 *
 * 3. get - Obter detalhes do repositório
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *
 * 4. update - Atualizar repositório
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - new_name (opcional): Novo nome
 *    - new_description (opcional): Nova descrição
 *    - new_private (opcional): Nova visibilidade
 *    - archived (opcional): Status de arquivamento
 *
 * 5. delete - Deletar repositório
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *
 * 6. fork - Fazer fork do repositório
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório original
 *    - repo (obrigatório): Nome do repositório original
 *    - organization (opcional): Organização de destino
 *
 * 7. search - Buscar repositórios
 *    Parâmetros:
 *    - query (obrigatório): Termo de busca
 *    - page (opcional): Página da busca (padrão: 1)
 *    - limit (opcional): Itens por página (padrão: 30)
 *
 * RECOMENDAÇÕES DE USO:
 * - Use nomes descritivos para repositórios
 * - Configure visibilidade adequada para o projeto
 * - Mantenha descrições atualizadas
 * - Use templates para projetos similares
 * - Configure branch padrão adequada
 * - Use paginação para listas grandes
 */
exports.repositoriesTool = {
    name: 'repositories',
    description: 'GERENCIAMENTO COMPLETO DE REPOSITÓRIOS - GitHub & Gitea\n\nACTIONS DISPONÍVEIS:\n• list: Lista repositórios do usuário/organização\n  - OBRIGATÓRIOS: username OU owner\n  - OPCIONAIS: page, limit, type, sort\n\n• get: Obtém detalhes de um repositório específico\n  - OBRIGATÓRIOS: repo\n\n• create: Cria novo repositório\n  - OBRIGATÓRIOS: name\n  - OPCIONAIS: description, private, auto_init, gitignores, license, readme, default_branch\n\n• update: Atualiza informações do repositório\n  - OBRIGATÓRIOS: repo\n  - OPCIONAIS: new_name, new_description, new_private, archived\n\n• delete: Remove repositório\n  - OBRIGATÓRIOS: repo\n\n• fork: Cria fork do repositório\n  - OBRIGATÓRIOS: repo\n  - OPCIONAIS: organization\n\n• search: Busca repositórios por nome/descrição\n  - OBRIGATÓRIOS: query\n  - OPCIONAIS: page, limit\n\n• clone: Clona repositório localmente\n  - OBRIGATÓRIOS: clone_url\n  - OPCIONAIS: local_path\n\n• archive: Arquiva repositório\n  - OBRIGATÓRIOS: repo\n\n• transfer: Transfere propriedade\n  - OBRIGATÓRIOS: repo, new_owner\n\n• template: Cria repo a partir de template\n  - OBRIGATÓRIOS: template_owner, template_repo, name\n  - OPCIONAIS: description, private\n\n• mirror: Configura espelhamento\n  - OBRIGATÓRIOS: mirror_url, name\n  - OPCIONAIS: mirror_username, mirror_password\n\nPARÂMETROS COMUNS:\n• provider: "github" ou "gitea" (opcional)\n• repo: Nome do repositório',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['create', 'list', 'get', 'update', 'delete', 'fork', 'search', 'clone', 'archive', 'transfer', 'template', 'mirror'],
                description: 'Action to perform on repositories'
            },
            repo: { type: 'string', description: 'Repository name' },
            provider: { type: 'string', description: 'Specific provider (github, gitea) or use default' },
            name: { type: 'string', description: 'Repository name for creation' },
            description: { type: 'string', description: 'Repository description' },
            private: { type: 'boolean', description: 'Private repository' },
            auto_init: { type: 'boolean', description: 'Auto initialize with README' },
            gitignores: { type: 'string', description: 'Gitignore template' },
            license: { type: 'string', description: 'License template' },
            readme: { type: 'string', description: 'README content' },
            default_branch: { type: 'string', description: 'Default branch name' },
            username: { type: 'string', description: 'Username for listing repos' },
            page: { type: 'number', description: 'Page number', minimum: 1 },
            limit: { type: 'number', description: 'Items per page', minimum: 1, maximum: 100 },
            new_name: { type: 'string', description: 'New repository name' },
            new_description: { type: 'string', description: 'New repository description' },
            new_private: { type: 'boolean', description: 'New privacy setting' },
            archived: { type: 'boolean', description: 'Archive status' },
            organization: { type: 'string', description: 'Organization for fork' },
            query: { type: 'string', description: 'Search query' },
            clone_url: { type: 'string', description: 'Repository clone URL' },
            local_path: { type: 'string', description: 'Local path for clone' },
            archive_status: { type: 'boolean', description: 'Archive status' },
            new_owner: { type: 'string', description: 'New owner for transfer' },
            template_owner: { type: 'string', description: 'Template repository owner' },
            template_repo: { type: 'string', description: 'Template repository name' },
            include_all_branches: { type: 'boolean', description: 'Include all branches from template' },
            mirror_url: { type: 'string', description: 'Mirror repository URL' },
            mirror_username: { type: 'string', description: 'Mirror username' },
            mirror_password: { type: 'string', description: 'Mirror password' }
        },
        required: ['action']
    },
    /**
     * Handler principal da tool repositories
     *
     * FUNCIONALIDADE:
     * - Valida entrada usando Zod schema
     * - Roteia para método específico baseado na ação
     * - Trata erros de forma uniforme
     * - Retorna resultado padronizado
     *
     * FLUXO:
     * 1. Validação de entrada
     * 2. Roteamento por ação
     * 3. Execução do método específico
     * 4. Tratamento de erros
     * 5. Retorno de resultado
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
            var params, provider, updatedParams, providerName, _a, error_1;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 27, , 28]);
                        params = RepositoriesInputSchema.parse(input);
                        provider = params.provider
                            ? index_js_1.globalProviderFactory.getProvider(params.provider)
                            : index_js_1.globalProviderFactory.getDefaultProvider();
                        if (!provider) {
                            throw new Error("Provider '".concat(params.provider, "' n\u00E3o encontrado"));
                        }
                        updatedParams = params;
                        providerName = params.provider || 'default';
                        console.log("[REPOSITORIES] Solicitado provider: ".concat(providerName));
                        console.log("[REPOSITORIES] Provider selecionado: ".concat(provider.constructor.name));
                        console.log("[REPOSITORIES] URL do provider: ".concat(((_b = provider.config) === null || _b === void 0 ? void 0 : _b.apiUrl) || 'N/A'));
                        _a = updatedParams.action;
                        switch (_a) {
                            case 'create': return [3 /*break*/, 1];
                            case 'list': return [3 /*break*/, 3];
                            case 'get': return [3 /*break*/, 5];
                            case 'update': return [3 /*break*/, 7];
                            case 'delete': return [3 /*break*/, 9];
                            case 'fork': return [3 /*break*/, 11];
                            case 'search': return [3 /*break*/, 13];
                            case 'clone': return [3 /*break*/, 15];
                            case 'archive': return [3 /*break*/, 17];
                            case 'transfer': return [3 /*break*/, 19];
                            case 'template': return [3 /*break*/, 21];
                            case 'mirror': return [3 /*break*/, 23];
                        }
                        return [3 /*break*/, 25];
                    case 1: return [4 /*yield*/, this.createRepository(updatedParams, provider)];
                    case 2: return [2 /*return*/, _c.sent()];
                    case 3: return [4 /*yield*/, this.listRepositories(updatedParams, provider)];
                    case 4: return [2 /*return*/, _c.sent()];
                    case 5: return [4 /*yield*/, this.getRepository(updatedParams, provider)];
                    case 6: return [2 /*return*/, _c.sent()];
                    case 7: return [4 /*yield*/, this.updateRepository(updatedParams, provider)];
                    case 8: return [2 /*return*/, _c.sent()];
                    case 9: return [4 /*yield*/, this.deleteRepository(updatedParams, provider)];
                    case 10: return [2 /*return*/, _c.sent()];
                    case 11: return [4 /*yield*/, this.forkRepository(updatedParams, provider)];
                    case 12: return [2 /*return*/, _c.sent()];
                    case 13: return [4 /*yield*/, this.searchRepositories(updatedParams, provider)];
                    case 14: return [2 /*return*/, _c.sent()];
                    case 15: return [4 /*yield*/, this.cloneRepository(updatedParams, provider)];
                    case 16: return [2 /*return*/, _c.sent()];
                    case 17: return [4 /*yield*/, this.archiveRepository(updatedParams, provider)];
                    case 18: return [2 /*return*/, _c.sent()];
                    case 19: return [4 /*yield*/, this.transferRepository(updatedParams, provider)];
                    case 20: return [2 /*return*/, _c.sent()];
                    case 21: return [4 /*yield*/, this.createFromTemplate(updatedParams, provider)];
                    case 22: return [2 /*return*/, _c.sent()];
                    case 23: return [4 /*yield*/, this.mirrorRepository(updatedParams, provider)];
                    case 24: return [2 /*return*/, _c.sent()];
                    case 25: throw new Error("A\u00E7\u00E3o n\u00E3o suportada: ".concat(updatedParams.action));
                    case 26: return [3 /*break*/, 28];
                    case 27:
                        error_1 = _c.sent();
                        return [2 /*return*/, {
                                success: false,
                                action: input.action,
                                message: 'Erro na operação de repositórios',
                                error: error_1 instanceof Error ? error_1.message : String(error_1)
                            }];
                    case 28: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Cria um novo repositório
     *
     * FUNCIONALIDADE:
     * - Valida parâmetros obrigatórios
     * - Configura dados padrão
     * - Chama API do provider para criação
     * - Retorna resultado formatado
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - name: Nome do repositório
     *
     * PARÂMETROS OPCIONAIS:
     * - description: Descrição do repositório
     * - private: Visibilidade (padrão: false)
     * - auto_init: Inicializar com README (padrão: false)
     * - gitignores: Template de .gitignore
     * - license: Template de licença
     * - readme: Conteúdo do README
     * - default_branch: Branch padrão (padrão: main)
     *
     * VALIDAÇÕES:
     * - Nome obrigatório
     * - Nome único no usuário/organização
     * - Permissões adequadas
     *
     * RECOMENDAÇÕES:
     * - Use nomes descritivos e únicos
     * - Configure visibilidade adequada
     * - Inicialize com README para projetos novos
     * - Use templates para consistência
     */
    createRepository: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var repository, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!params.name) {
                            throw new Error('Nome do repositório é obrigatório');
                        }
                        return [4 /*yield*/, provider.createRepository(params.name, params.description, params.private || false)];
                    case 1:
                        repository = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'create',
                                message: "Reposit\u00F3rio '".concat(params.name, "' criado com sucesso"),
                                data: repository
                            }];
                    case 2:
                        error_2 = _a.sent();
                        throw new Error("Falha ao criar reposit\u00F3rio: ".concat(error_2 instanceof Error ? error_2.message : String(error_2)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    listRepositories: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var page, limit, targetUser, repositories, error_3, repositories, fallbackError_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 7]);
                        page = params.page || 1;
                        limit = params.limit || 30;
                        targetUser = params.username || owner;
                        return [4 /*yield*/, provider.listRepositories(targetUser, page, limit)];
                    case 1:
                        repositories = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'list',
                                message: "".concat(repositories.length, " reposit\u00F3rios encontrados"),
                                data: {
                                    repositories: repositories,
                                    page: page,
                                    limit: limit,
                                    total: repositories.length,
                                    target: targetUser
                                }
                            }];
                    case 2:
                        error_3 = _a.sent();
                        if (!(error_3 instanceof Error && (error_3.message.includes('User not found') || error_3.message.includes('Not found')))) return [3 /*break*/, 6];
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        console.warn("[REPOSITORIES] Usu\u00E1rio '".concat(params.username || owner, "' n\u00E3o encontrado, tentando listar reposit\u00F3rios do usu\u00E1rio atual"));
                        return [4 /*yield*/, provider.listRepositories(undefined, params.page || 1, params.limit || 30)];
                    case 4:
                        repositories = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'list',
                                message: "".concat(repositories.length, " reposit\u00F3rios encontrados (fallback para usu\u00E1rio atual)"),
                                data: {
                                    repositories: repositories,
                                    page: params.page || 1,
                                    limit: params.limit || 30,
                                    total: repositories.length,
                                    target: 'current_user',
                                    fallback: true
                                }
                            }];
                    case 5:
                        fallbackError_1 = _a.sent();
                        throw new Error("Falha ao listar reposit\u00F3rios: ".concat(fallbackError_1 instanceof Error ? fallbackError_1.message : String(fallbackError_1)));
                    case 6: throw new Error("Falha ao listar reposit\u00F3rios: ".concat(error_3 instanceof Error ? error_3.message : String(error_3)));
                    case 7: return [2 /*return*/];
                }
            });
        });
    },
    getRepository: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var repository, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!!params.repo) {
                            throw new Error('e nome do repositório são obrigatórios');
                        }
                        return [4 /*yield*/, provider.getRepository((await provider.getCurrentUser()).login, params.repo)];
                    case 1:
                        repository = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'get',
                                message: "Reposit\u00F3rio '".concat(owner, "/").concat(params.repo, "' obtido com sucesso"),
                                data: repository
                            }];
                    case 2:
                        error_4 = _a.sent();
                        throw new Error("Falha ao obter reposit\u00F3rio: ".concat(error_4 instanceof Error ? error_4.message : String(error_4)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    updateRepository: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var updateData, repository, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!!params.repo) {
                            throw new Error('e nome do repositório são obrigatórios');
                        }
                        updateData = {};
                        if (params.new_name)
                            updateData.name = params.new_name;
                        if (params.new_description !== undefined)
                            updateData.description = params.new_description;
                        if (params.new_private !== undefined)
                            updateData.private = params.new_private;
                        if (params.archived !== undefined)
                            updateData.archived = params.archived;
                        if (Object.keys(updateData).length === 0) {
                            throw new Error('Nenhum campo para atualizar foi fornecido');
                        }
                        return [4 /*yield*/, provider.updateRepository((await provider.getCurrentUser()).login, params.repo, updateData)];
                    case 1:
                        repository = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'update',
                                message: "Reposit\u00F3rio '".concat(owner, "/").concat(params.repo, "' atualizado com sucesso"),
                                data: repository
                            }];
                    case 2:
                        error_5 = _a.sent();
                        throw new Error("Falha ao atualizar reposit\u00F3rio: ".concat(error_5 instanceof Error ? error_5.message : String(error_5)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    deleteRepository: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!!params.repo) {
                            throw new Error('e nome do repositório são obrigatórios');
                        }
                        return [4 /*yield*/, provider.deleteRepository((await provider.getCurrentUser()).login, params.repo)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'delete',
                                message: "Reposit\u00F3rio '".concat(owner, "/").concat(params.repo, "' deletado com sucesso"),
                                data: { deleted: true }
                            }];
                    case 2:
                        error_6 = _a.sent();
                        throw new Error("Falha ao deletar reposit\u00F3rio: ".concat(error_6 instanceof Error ? error_6.message : String(error_6)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    forkRepository: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var repository, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!!params.repo) {
                            throw new Error('e nome do repositório são obrigatórios');
                        }
                        return [4 /*yield*/, provider.forkRepository((await provider.getCurrentUser()).login, params.repo, params.organization)];
                    case 1:
                        repository = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'fork',
                                message: "Fork do reposit\u00F3rio '".concat(owner, "/").concat(params.repo, "' criado com sucesso"),
                                data: repository
                            }];
                    case 2:
                        error_7 = _a.sent();
                        throw new Error("Falha ao fazer fork do reposit\u00F3rio: ".concat(error_7 instanceof Error ? error_7.message : String(error_7)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    searchRepositories: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var page, limit, repositories, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!params.query) {
                            throw new Error('Query de busca é obrigatória');
                        }
                        page = params.page || 1;
                        limit = params.limit || 30;
                        return [4 /*yield*/, provider.searchRepositories(params.query, page, limit)];
                    case 1:
                        repositories = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'search',
                                message: "".concat(repositories.length, " reposit\u00F3rios encontrados para '").concat(params.query, "'"),
                                data: {
                                    repositories: repositories,
                                    query: params.query,
                                    page: page,
                                    limit: limit,
                                    total: repositories.length
                                }
                            }];
                    case 2:
                        error_8 = _a.sent();
                        throw new Error("Falha ao buscar reposit\u00F3rios: ".concat(error_8 instanceof Error ? error_8.message : String(error_8)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Clona repositório localmente
     */
    cloneRepository: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!provider.cloneRepository) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'clone',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa cloneRepository'
                                }];
                        }
                        return [4 /*yield*/, provider.cloneRepository({
                                owner: (await provider.getCurrentUser()).login,
                                repo: params.repo,
                                clone_url: params.clone_url,
                                local_path: params.local_path
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'clone',
                                message: "Reposit\u00F3rio clonado com sucesso",
                                data: result
                            }];
                    case 2:
                        error_9 = _a.sent();
                        throw new Error("Falha ao clonar reposit\u00F3rio: ".concat(error_9));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Arquiva/desarquiva repositório
     */
    archiveRepository: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_10;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        if (!provider.archiveRepository) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'archive',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa archiveRepository'
                                }];
                        }
                        return [4 /*yield*/, provider.archiveRepository({
                                owner: (await provider.getCurrentUser()).login,
                                repo: params.repo,
                                archived: (_a = params.archive_status) !== null && _a !== void 0 ? _a : true
                            })];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'archive',
                                message: "Reposit\u00F3rio ".concat(params.archive_status ? 'arquivado' : 'desarquivado', " com sucesso"),
                                data: result
                            }];
                    case 2:
                        error_10 = _b.sent();
                        throw new Error("Falha ao arquivar reposit\u00F3rio: ".concat(error_10));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Transfere repositório para outro owner
     */
    transferRepository: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!provider.transferRepository) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'transfer',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa transferRepository'
                                }];
                        }
                        return [4 /*yield*/, provider.transferRepository({
                                owner: (await provider.getCurrentUser()).login,
                                repo: params.repo,
                                new_owner: params.new_owner
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'transfer',
                                message: "Reposit\u00F3rio transferido para ".concat(params.new_owner, " com sucesso"),
                                data: result
                            }];
                    case 2:
                        error_11 = _a.sent();
                        throw new Error("Falha ao transferir reposit\u00F3rio: ".concat(error_11));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Cria repositório a partir de template
     */
    createFromTemplate: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!provider.createFromTemplate) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'template',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa createFromTemplate'
                                }];
                        }
                        return [4 /*yield*/, provider.createFromTemplate({
                                template_owner: params.template_owner,
                                template_repo: params.template_repo,
                                owner: (await provider.getCurrentUser()).login,
                                name: params.name,
                                description: params.description,
                                private: params.private,
                                include_all_branches: params.include_all_branches
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'template',
                                message: "Reposit\u00F3rio criado a partir do template com sucesso",
                                data: result
                            }];
                    case 2:
                        error_12 = _a.sent();
                        throw new Error("Falha ao criar reposit\u00F3rio a partir do template: ".concat(error_12));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Configura espelhamento de repositório
     */
    mirrorRepository: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!provider.mirrorRepository) {
                            return [2 /*return*/, {
                                    success: false,
                                    action: 'mirror',
                                    message: 'Funcionalidade não suportada por este provider',
                                    error: 'Provider não implementa mirrorRepository'
                                }];
                        }
                        return [4 /*yield*/, provider.mirrorRepository({
                                owner: (await provider.getCurrentUser()).login,
                                repo: params.repo,
                                mirror_url: params.mirror_url,
                                mirror_username: params.mirror_username,
                                mirror_password: params.mirror_password
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'mirror',
                                message: "Espelhamento configurado com sucesso",
                                data: result
                            }];
                    case 2:
                        error_13 = _a.sent();
                        throw new Error("Falha ao configurar espelhamento: ".concat(error_13));
                    case 3: return [2 /*return*/];
                }
            });
        });
    }
};
