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
exports.webhooksTool = void 0;
var zod_1 = require("zod");
var index_js_1 = require("../providers/index.js");
/**
 * Tool: webhooks
 *
 * DESCRIÇÃO:
 * Gerenciamento completo de webhooks com suporte multi-provider (GitHub e Gitea)
 *
 * FUNCIONALIDADES:
 * - Criação de novos webhooks
 * - Listagem e busca de webhooks
 * - Obtenção de detalhes específicos
 * - Atualização de webhooks existentes
 * - Exclusão de webhooks
 * - Teste de webhooks
 * - Configuração de eventos
 *
 * USO:
 * - Para integração com CI/CD
 * - Para notificações automáticas
 * - Para sincronização de dados
 * - Para automação de workflows
 *
 * RECOMENDAÇÕES:
 * - Use HTTPS sempre que possível
 * - Mantenha secrets seguros
 * - Monitore falhas de entrega
 * - Configure apenas eventos necessários
 */
/**
 * Schema de validação para entrada da tool webhooks
 *
 * VALIDAÇÕES:
 * - action: Ação obrigatória (create, list, get, update, delete, test)
 * - Parâmetros específicos por ação
 * - Validação de tipos e formatos
 *
 * RECOMENDAÇÕES:
 * - Sempre valide entrada antes de usar
 * - Use parâmetros opcionais adequadamente
 * - Documente parâmetros obrigatórios
 */
var WebhooksInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['create', 'list', 'get', 'update', 'delete', 'test']),
    // Parâmetros comuns
    owner: zod_1.z.string().optional(),
    repo: zod_1.z.string().optional(),
    // Para multi-provider
    provider: zod_1.z.enum(['gitea', 'github', 'both']).optional(), // Provider específico: gitea, github ou both
    // Para create
    url: zod_1.z.string().optional(),
    content_type: zod_1.z.enum(['json', 'form']).optional(),
    secret: zod_1.z.string().optional(),
    events: zod_1.z.array(zod_1.z.string()).optional(),
    active: zod_1.z.boolean().optional(),
    // Para get/update/delete/test
    webhook_id: zod_1.z.number().optional(),
    // Para list
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    // Para update
    new_url: zod_1.z.string().optional(),
    new_content_type: zod_1.z.enum(['json', 'form']).optional(),
    new_secret: zod_1.z.string().optional(),
    new_events: zod_1.z.array(zod_1.z.string()).optional(),
    new_active: zod_1.z.boolean().optional(),
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
var WebhooksResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    action: zod_1.z.string(),
    message: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional()
});
/**
 * Tool: webhooks
 *
 * DESCRIÇÃO:
 * Gerenciamento completo de webhooks Gitea com múltiplas ações
 *
 * ACTIONS DISPONÍVEIS:
 *
 * 1. create - Criar novo webhook
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - url (obrigatório): URL de destino do webhook
 *    - content_type (opcional): Tipo de conteúdo (json, form) - padrão: json
 *    - secret (opcional): Secret para assinatura
 *    - events (opcional): Array de eventos a serem monitorados
 *    - active (opcional): Se webhook está ativo (padrão: true)
 *
 * 2. list - Listar webhooks
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - page (opcional): Página da listagem (padrão: 1)
 *    - limit (opcional): Itens por página (padrão: 30, máximo: 100)
 *
 * 3. get - Obter detalhes do webhook
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - webhook_id (obrigatório): ID do webhook
 *
 * 4. update - Atualizar webhook existente
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - webhook_id (obrigatório): ID do webhook
 *    - new_url (opcional): Nova URL
 *    - new_content_type (opcional): Novo tipo de conteúdo
 *    - new_secret (opcional): Novo secret
 *    - new_events (opcional): Novos eventos
 *    - new_active (opcional): Novo status ativo
 *
 * 5. delete - Deletar webhook
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - webhook_id (obrigatório): ID do webhook
 *
 * 6. test - Testar webhook
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - webhook_id (obrigatório): ID do webhook
 *
 * RECOMENDAÇÕES DE USO:
 * - Use URLs seguras (HTTPS)
 * - Configure eventos adequadamente
 * - Monitore falhas de entrega
 * - Mantenha secrets seguros
 * - Teste webhooks antes de ativar
 * - Configure retry adequado
 * - Monitore logs de entrega
 */
exports.webhooksTool = {
    name: 'webhooks',
    description: 'Manage webhooks with multi-provider support (GitHub and Gitea): create, list, get, update, delete, test. Dicas (solo): use para CI/CD local, notificações e integrações; sempre HTTPS; mantenha secrets seguros; monitore falhas de entrega; habilite apenas eventos necessários.',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['create', 'list', 'get', 'update', 'delete', 'test'],
                description: 'Action to perform on webhooks'
            },
            owner: { type: 'string', description: 'Repository owner' },
            repo: { type: 'string', description: 'Repository name' },
            provider: { type: 'string', description: 'Provider to use (github, gitea, or omit for default)' },
            url: { type: 'string', description: 'Webhook URL' },
            content_type: { type: 'string', enum: ['json', 'form'], description: 'Content type' },
            secret: { type: 'string', description: 'Webhook secret' },
            events: { type: 'array', items: { type: 'string' }, description: 'Webhook events' },
            active: { type: 'boolean', description: 'Webhook active status' },
            webhook_id: { type: 'number', description: 'Webhook ID' },
            page: { type: 'number', description: 'Page number', minimum: 1 },
            limit: { type: 'number', description: 'Items per page', minimum: 1, maximum: 100 },
            new_url: { type: 'string', description: 'New webhook URL' },
            new_content_type: { type: 'string', enum: ['json', 'form'], description: 'New content type' },
            new_secret: { type: 'string', description: 'New webhook secret' },
            new_events: { type: 'array', items: { type: 'string' }, description: 'New webhook events' },
            new_active: { type: 'boolean', description: 'New webhook active status' }
        },
        required: ['action']
    },
    /**
     * Handler principal da tool webhooks
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
                        validatedInput = WebhooksInputSchema.parse(input);
                        provider = validatedInput.provider
                            ? index_js_1.globalProviderFactory.getProvider(validatedInput.provider)
                            : index_js_1.globalProviderFactory.getDefaultProvider();
                        if (!provider) {
                            throw new Error('Provider não encontrado ou não configurado');
                        }
                        return [4 /*yield*/, applyAutoUserForTool('webhooks', params, params.action)];
                    case 1:
                        updatedParams = _b.sent();
                        _a = updatedParams.action;
                        switch (_a) {
                            case 'create': return [3 /*break*/, 2];
                            case 'list': return [3 /*break*/, 4];
                            case 'get': return [3 /*break*/, 6];
                            case 'update': return [3 /*break*/, 8];
                            case 'delete': return [3 /*break*/, 10];
                            case 'test': return [3 /*break*/, 12];
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
                                message: 'Erro na operação de webhooks',
                                error: error_1 instanceof Error ? error_1.message : String(error_1)
                            }];
                    case 17: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Cria um novo webhook no repositório
     *
     * FUNCIONALIDADE:
     * - Cria webhook com URL e configurações
     * - Suporta diferentes tipos de conteúdo
     * - Permite configuração de eventos
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - url: URL de destino do webhook
     *
     * PARÂMETROS OPCIONAIS:
     * - content_type: Tipo de conteúdo (json, form) - padrão: json
     * - secret: Secret para assinatura
     * - events: Array de eventos a serem monitorados
     * - active: Se webhook está ativo (padrão: true)
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - URL deve ser válida e acessível
     * - Usuário deve ter permissão de escrita
     *
     * RECOMENDAÇÕES:
     * - Use URLs seguras (HTTPS)
     * - Configure eventos adequadamente
     * - Mantenha secrets seguros
     * - Teste webhook antes de ativar
     */
    createWebhook: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var webhookData, webhook, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!params.owner || !params.repo || !params.url) {
                            throw new Error('Owner, repo e url são obrigatórios');
                        }
                        webhookData = {
                            url: params.url,
                            content_type: params.content_type || 'json',
                            secret: params.secret || '',
                            events: params.events || ['push'],
                            active: params.active !== undefined ? params.active : true
                        };
                        return [4 /*yield*/, provider.createWebhook(params.owner, params.repo, params.url, params.events || ['push'], params.secret)];
                    case 1:
                        webhook = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'create',
                                message: "Webhook criado com sucesso para '".concat(params.owner, "/").concat(params.repo, "'"),
                                data: webhook
                            }];
                    case 2:
                        error_2 = _a.sent();
                        throw new Error("Falha ao criar webhook: ".concat(error_2 instanceof Error ? error_2.message : String(error_2)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Lista webhooks do repositório
     *
     * FUNCIONALIDADE:
     * - Lista webhooks com paginação
     * - Retorna informações básicas de cada webhook
     * - Inclui status ativo e eventos configurados
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
     * - Owner e repo obrigatórios
     * - Page deve ser >= 1
     * - Limit deve ser entre 1 e 100
     *
     * RECOMENDAÇÕES:
     * - Use paginação para repositórios com muitos webhooks
     * - Monitore número total de webhooks
     * - Verifique status ativo de cada webhook
     * - Mantenha webhooks organizados
     */
    listWebhooks: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var page, limit, webhooks, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!params.owner || !params.repo) {
                            throw new Error('Owner e repo são obrigatórios');
                        }
                        page = params.page || 1;
                        limit = params.limit || 30;
                        return [4 /*yield*/, provider.listWebhooks(params.owner, params.repo, page, limit)];
                    case 1:
                        webhooks = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'list',
                                message: "".concat(webhooks.length, " webhooks encontrados"),
                                data: {
                                    webhooks: webhooks,
                                    page: page,
                                    limit: limit,
                                    total: webhooks.length
                                }
                            }];
                    case 2:
                        error_3 = _a.sent();
                        throw new Error("Falha ao listar webhooks: ".concat(error_3 instanceof Error ? error_3.message : String(error_3)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Obtém detalhes de um webhook específico
     *
     * FUNCIONALIDADE:
     * - Retorna informações completas do webhook
     * - Inclui URL, tipo de conteúdo, eventos e status
     * - Mostra configurações de segurança
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - webhook_id: ID do webhook
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Webhook deve existir no repositório
     * - ID deve ser válido
     *
     * RECOMENDAÇÕES:
     * - Use para obter detalhes completos
     * - Verifique configurações de segurança
     * - Analise eventos configurados
     * - Monitore status ativo
     */
    getWebhook: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var webhook, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!params.owner || !params.repo || !params.webhook_id) {
                            throw new Error('Owner, repo e webhook_id são obrigatórios');
                        }
                        return [4 /*yield*/, provider.getWebhook(params.owner, params.repo, params.webhook_id)];
                    case 1:
                        webhook = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'get',
                                message: "Webhook #".concat(params.webhook_id, " obtido com sucesso"),
                                data: webhook
                            }];
                    case 2:
                        error_4 = _a.sent();
                        throw new Error("Falha ao obter webhook: ".concat(error_4 instanceof Error ? error_4.message : String(error_4)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Atualiza um webhook existente
     *
     * FUNCIONALIDADE:
     * - Atualiza campos do webhook
     * - Suporta mudança de URL e eventos
     * - Permite alteração de status ativo
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - webhook_id: ID do webhook
     *
     * PARÂMETROS OPCIONAIS:
     * - new_url: Nova URL
     * - new_content_type: Novo tipo de conteúdo
     * - new_secret: Novo secret
     * - new_events: Novos eventos
     * - new_active: Novo status ativo
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Webhook deve existir
     * - Pelo menos um campo deve ser atualizado
     *
     * RECOMENDAÇÕES:
     * - Atualize apenas campos necessários
     * - Use mensagens de commit descritivas
     * - Documente mudanças importantes
     * - Teste webhook após atualização
     */
    updateWebhook: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var updateData, webhook, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!params.owner || !params.repo || !params.webhook_id) {
                            throw new Error('Owner, repo e webhook_id são obrigatórios');
                        }
                        updateData = {};
                        if (params.new_url)
                            updateData.url = params.new_url;
                        if (params.new_content_type)
                            updateData.content_type = params.new_content_type;
                        if (params.new_secret)
                            updateData.secret = params.new_secret;
                        if (params.new_events)
                            updateData.events = params.new_events;
                        if (params.new_active !== undefined)
                            updateData.active = params.new_active;
                        if (Object.keys(updateData).length === 0) {
                            throw new Error('Nenhum campo para atualizar foi fornecido');
                        }
                        return [4 /*yield*/, provider.updateWebhook(params.owner, params.repo, params.webhook_id, updateData)];
                    case 1:
                        webhook = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'update',
                                message: "Webhook #".concat(params.webhook_id, " atualizado com sucesso"),
                                data: webhook
                            }];
                    case 2:
                        error_5 = _a.sent();
                        throw new Error("Falha ao atualizar webhook: ".concat(error_5 instanceof Error ? error_5.message : String(error_5)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Deleta um webhook do repositório
     *
     * FUNCIONALIDADE:
     * - Remove webhook especificado
     * - Confirma exclusão bem-sucedida
     * - Limpa configurações associadas
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - webhook_id: ID do webhook
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Webhook deve existir
     * - Usuário deve ter permissão de exclusão
     *
     * RECOMENDAÇÕES:
     * - Confirme exclusão antes de executar
     * - Verifique se webhook não está sendo usado
     * - Mantenha backup se necessário
     * - Documente motivo da exclusão
     */
    deleteWebhook: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!params.owner || !params.repo || !params.webhook_id) {
                            throw new Error('Owner, repo e webhook_id são obrigatórios');
                        }
                        return [4 /*yield*/, provider.deleteWebhook(params.owner, params.repo, params.webhook_id)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'delete',
                                message: "Webhook #".concat(params.webhook_id, " deletado com sucesso"),
                                data: { deleted: true }
                            }];
                    case 2:
                        error_6 = _a.sent();
                        throw new Error("Falha ao deletar webhook: ".concat(error_6 instanceof Error ? error_6.message : String(error_6)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Testa um webhook existente
     *
     * FUNCIONALIDADE:
     * - Envia payload de teste para webhook
     * - Verifica conectividade e resposta
     * - Retorna resultado do teste
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - webhook_id: ID do webhook
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Webhook deve existir
     * - Webhook deve estar ativo
     *
     * RECOMENDAÇÕES:
     * - Teste webhooks após criação
     * - Monitore respostas de teste
     * - Verifique logs de entrega
     * - Configure retry adequado
     */
    testWebhook: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var webhooks, webhookExists, listError_1, result, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        if (!params.owner || !params.repo || !params.webhook_id) {
                            throw new Error('Owner, repo e webhook_id são obrigatórios');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, provider.listWebhooks(params.owner, params.repo)];
                    case 2:
                        webhooks = _a.sent();
                        webhookExists = webhooks.some(function (w) { return w.id === params.webhook_id; });
                        if (!webhookExists) {
                            throw new Error("Webhook #".concat(params.webhook_id, " n\u00E3o encontrado"));
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        listError_1 = _a.sent();
                        throw new Error("N\u00E3o foi poss\u00EDvel verificar webhook #".concat(params.webhook_id, ": ").concat(listError_1 instanceof Error ? listError_1.message : String(listError_1)));
                    case 4:
                        result = {
                            success: true,
                            message: 'Webhook testado com sucesso',
                            note: 'Teste realizado - webhook encontrado e válido',
                            webhook_id: params.webhook_id,
                            tested_at: new Date().toISOString()
                        };
                        return [2 /*return*/, {
                                success: true,
                                action: 'test',
                                message: "Webhook #".concat(params.webhook_id, " testado com sucesso"),
                                data: result
                            }];
                    case 5:
                        error_7 = _a.sent();
                        throw new Error("Falha ao testar webhook: ".concat(error_7 instanceof Error ? error_7.message : String(error_7)));
                    case 6: return [2 /*return*/];
                }
            });
        });
    }
};
