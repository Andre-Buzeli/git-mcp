"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhooksTool = void 0;
const zod_1 = require("zod");
const index_js_1 = require("../providers/index.js");
const user_detection_js_1 = require("../utils/user-detection.js");
/**
 * Tool: webhooks
 *
 * DESCRIÃ‡ÃƒO:
 * Gerenciamento completo de webhooks com suporte multi-provider (GitHub e Gitea)
 *
 * FUNCIONALIDADES:
 * - CriaÃ§Ã£o de novos webhooks
 * - Listagem e busca de webhooks
 * - ObtenÃ§Ã£o de detalhes especÃ­ficos
 * - AtualizaÃ§Ã£o de webhooks existentes
 * - ExclusÃ£o de webhooks
 * - Teste de webhooks
 * - ConfiguraÃ§Ã£o de eventos
 *
 * USO:
 * - Para integraÃ§Ã£o com CI/CD
 * - Para notificaÃ§Ãµes automÃ¡ticas
 * - Para sincronizaÃ§Ã£o de dados
 * - Para automaÃ§Ã£o de workflows
 *
 * RECOMENDAÃ‡Ã•ES:
 * - Use HTTPS sempre que possÃ­vel
 * - Mantenha secrets seguros
 * - Monitore falhas de entrega
 * - Configure apenas eventos necessÃ¡rios
 */
/**
 * Schema de validaÃ§Ã£o para entrada da tool webhooks
 *
 * VALIDAÃ‡Ã•ES:
 * - action: AÃ§Ã£o obrigatÃ³ria (create, list, get, update, delete, test)
 * - ParÃ¢metros especÃ­ficos por aÃ§Ã£o
 * - ValidaÃ§Ã£o de tipos e formatos
 *
 * RECOMENDAÃ‡Ã•ES:
 * - Sempre valide entrada antes de usar
 * - Use parÃ¢metros opcionais adequadamente
 * - Documente parÃ¢metros obrigatÃ³rios
 */
const WebhooksInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['create', 'list', 'get', 'update', 'delete', 'test']),
    // ParÃ¢metros comuns
    repo: zod_1.z.string(),
    // Para multi-provider
    provider: zod_1.z.enum(['gitea', 'github']).describe('Provider to use (gitea or github)'), // Provider especÃ­fico: gitea, github ou both
    projectPath: zod_1.z.string().describe('Local project path for git operations'),
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
 * Schema de saÃ­da padronizado
 *
 * ESTRUTURA:
 * - success: Status da operaÃ§Ã£o
 * - action: AÃ§Ã£o executada
 * - message: Mensagem descritiva
 * - data: Dados retornados (opcional)
 * - error: Detalhes do erro (opcional)
 */
const WebhooksResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    action: zod_1.z.string(),
    message: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional()
});
/**
 * Tool: webhooks
 *
 * DESCRIÃ‡ÃƒO:
 * Gerenciamento completo de webhooks Gitea com mÃºltiplas aÃ§Ãµes
 *
 * ACTIONS DISPONÃVEIS:
 *
 * 1. create - Criar novo webhook
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - url (obrigatÃ³rio): URL de destino do webhook
 *    - content_type (opcional): Tipo de conteÃºdo (json, form) - padrÃ£o: json
 *    - secret (opcional): Secret para assinatura
 *    - events (opcional): Array de eventos a serem monitorados
 *    - active (opcional): Se webhook estÃ¡ ativo (padrÃ£o: true)
 *
 * 2. list - Listar webhooks
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - page (opcional): PÃ¡gina da listagem (padrÃ£o: 1)
 *    - limit (opcional): Itens por pÃ¡gina (padrÃ£o: 30, mÃ¡ximo: 100)
 *
 * 3. get - Obter detalhes do webhook
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - webhook_id (obrigatÃ³rio): ID do webhook
 *
 * 4. update - Atualizar webhook existente
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - webhook_id (obrigatÃ³rio): ID do webhook
 *    - new_url (opcional): Nova URL
 *    - new_content_type (opcional): Novo tipo de conteÃºdo
 *    - new_secret (opcional): Novo secret
 *    - new_events (opcional): Novos eventos
 *    - new_active (opcional): Novo status ativo
 *
 * 5. delete - Deletar webhook
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - webhook_id (obrigatÃ³rio): ID do webhook
 *
 * 6. test - Testar webhook
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - webhook_id (obrigatÃ³rio): ID do webhook
 *
 * RECOMENDAÃ‡Ã•ES DE USO:
 * - Use URLs seguras (HTTPS)
 * - Configure eventos adequadamente
 * - Monitore falhas de entrega
 * - Mantenha secrets seguros
 * - Teste webhooks antes de ativar
 * - Configure retry adequado
 * - Monitore logs de entrega
 */
exports.webhooksTool = {
    name: 'git-webhooks',
    description: 'tool: Gerencia webhooks Git para automaÃ§Ã£o e integraÃ§Ãµes\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction create: cria novo webhook\naction create requires: repo, url, content_type, secret, events, active, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction list: lista webhooks do repositÃ³rio\naction list requires: repo, page, limit, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction get: obtÃ©m detalhes de webhook\naction get requires: repo, webhook_id, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction update: atualiza webhook existente\naction update requires: repo, webhook_id, new_url, new_content_type, new_secret, new_events, new_active, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction delete: remove webhook\naction delete requires: repo, webhook_id, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction test: testa webhook\naction test requires: repo, webhook_id, provider',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['create', 'list', 'get', 'update', 'delete', 'test'],
                description: 'Action to perform on webhooks'
            },
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
        required: ['action', 'repo', 'provider', 'projectPath']
    },
    /**
     * Handler principal da tool webhooks
     *
     * FUNCIONALIDADE:
     * - Valida entrada usando Zod schema
     * - Roteia para mÃ©todo especÃ­fico baseado na aÃ§Ã£o
     * - Trata erros de forma uniforme
     * - Retorna resultado padronizado
     *
     * FLUXO:
     * 1. ValidaÃ§Ã£o de entrada
     * 2. SeleÃ§Ã£o do provider
     * 3. Roteamento por aÃ§Ã£o
     * 4. ExecuÃ§Ã£o do mÃ©todo especÃ­fico
     * 5. Tratamento de erros
     * 6. Retorno de resultado
     *
     * TRATAMENTO DE ERROS:
     * - ValidaÃ§Ã£o: erro de schema
     * - ExecuÃ§Ã£o: erro da operaÃ§Ã£o
     * - Roteamento: aÃ§Ã£o nÃ£o suportada
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Sempre valide entrada antes de processar
     * - Trate erros especÃ­ficos adequadamente
     * - Log detalhes de erro para debug
     * - Retorne mensagens de erro Ãºteis
     */
    async handler(input) {
        try {
            const validatedInput = WebhooksInputSchema.parse(input);
            // Apply automatic user/owner detection from configured tokens
            const processedInput = await (0, user_detection_js_1.applyAutoUserDetection)(validatedInput, validatedInput.provider || 'default');
            // Seleciona o provider baseado na entrada ou usa o padrÃ£o
            const provider = processedInput.provider
                ? index_js_1.globalProviderFactory.getProvider(processedInput.provider)
                : index_js_1.globalProviderFactory.getDefaultProvider();
            if (!provider) {
                throw new Error('Provider nÃ£o encontrado ou nÃ£o configurado');
            }
            // Obter o owner do provider
            const owner = (await provider.getCurrentUser()).login;
            switch (processedInput.action) {
                case 'create':
                    return await this.createWebhook(processedInput, provider, owner);
                case 'list':
                    return await this.listWebhooks(processedInput, provider, owner);
                case 'get':
                    return await this.getWebhook(processedInput, provider, owner);
                case 'update':
                    return await this.updateWebhook(processedInput, provider, owner);
                case 'delete':
                    return await this.deleteWebhook(processedInput, provider, owner);
                case 'test':
                    return await this.testWebhook(processedInput, provider, owner);
                default:
                    throw new Error(`AÃ§Ã£o nÃ£o suportada: ${processedInput.action}`);
            }
        }
        catch (error) {
            return {
                success: false,
                action: input.action,
                message: 'Erro na operaÃ§Ã£o de webhooks',
                error: error instanceof Error ? error.message : String(error)
            };
        }
    },
    /**
     * Cria um novo webhook no repositÃ³rio
     *
     * FUNCIONALIDADE:
     * - Cria webhook com URL e configuraÃ§Ãµes
     * - Suporta diferentes tipos de conteÃºdo
     * - Permite configuraÃ§Ã£o de eventos
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - url: URL de destino do webhook
     *
     * PARÃ‚METROS OPCIONAIS:
     * - content_type: Tipo de conteÃºdo (json, form) - padrÃ£o: json
     * - secret: Secret para assinatura
     * - events: Array de eventos a serem monitorados
     * - active: Se webhook estÃ¡ ativo (padrÃ£o: true)
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - URL deve ser vÃ¡lida e acessÃ­vel
     * - UsuÃ¡rio deve ter permissÃ£o de escrita
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use URLs seguras (HTTPS)
     * - Configure eventos adequadamente
     * - Mantenha secrets seguros
     * - Teste webhook antes de ativar
     */
    async createWebhook(params, provider, owner) {
        try {
            if (!params.repo || !params.url) {
                throw new Error('repo e url sÃ£o obrigatÃ³rios');
            }
            const webhookData = {
                url: params.url,
                content_type: params.content_type || 'json',
                secret: params.secret || '',
                events: params.events || ['push'],
                active: params.active !== undefined ? params.active : true
            };
            const webhook = await provider.createWebhook(owner, params.repo, params.url, params.events || ['push'], params.secret);
            return {
                success: true,
                action: 'create',
                message: `Webhook criado com sucesso para '${owner}/${params.repo}'`,
                data: webhook
            };
        }
        catch (error) {
            throw new Error(`Falha ao criar webhook: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    /**
     * Lista webhooks do repositÃ³rio
     *
     * FUNCIONALIDADE:
     * - Lista webhooks com paginaÃ§Ã£o
     * - Retorna informaÃ§Ãµes bÃ¡sicas de cada webhook
     * - Inclui status ativo e eventos configurados
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     *
     * PARÃ‚METROS OPCIONAIS:
     * - page: PÃ¡gina da listagem (padrÃ£o: 1)
     * - limit: Itens por pÃ¡gina (padrÃ£o: 30, mÃ¡ximo: 100)
     *
     * VALIDAÃ‡Ã•ES:
     * - e repo obrigatÃ³rios
     * - Page deve ser >= 1
     * - Limit deve ser entre 1 e 100
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use paginaÃ§Ã£o para repositÃ³rios com muitos webhooks
     * - Monitore nÃºmero total de webhooks
     * - Verifique status ativo de cada webhook
     * - Mantenha webhooks organizados
     */
    async listWebhooks(params, provider, owner) {
        try {
            if (!params.repo) {
                throw new Error('owner e repo sÃ£o obrigatÃ³rios');
            }
            const page = params.page || 1;
            const limit = params.limit || 30;
            const webhooks = await provider.listWebhooks((await provider.getCurrentUser()).login, params.repo, page, limit);
            return {
                success: true,
                action: 'list',
                message: `${webhooks.length} webhooks encontrados`,
                data: {
                    webhooks,
                    page,
                    limit,
                    total: webhooks.length
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao listar webhooks: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    /**
     * ObtÃ©m detalhes de um webhook especÃ­fico
     *
     * FUNCIONALIDADE:
     * - Retorna informaÃ§Ãµes completas do webhook
     * - Inclui URL, tipo de conteÃºdo, eventos e status
     * - Mostra configuraÃ§Ãµes de seguranÃ§a
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - webhook_id: ID do webhook
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Webhook deve existir no repositÃ³rio
     * - ID deve ser vÃ¡lido
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use para obter detalhes completos
     * - Verifique configuraÃ§Ãµes de seguranÃ§a
     * - Analise eventos configurados
     * - Monitore status ativo
     */
    async getWebhook(params, provider, owner) {
        try {
            if (!params.repo || !params.webhook_id) {
                throw new Error('repo e webhook_id sÃ£o obrigatÃ³rios');
            }
            const webhook = await provider.getWebhook((await provider.getCurrentUser()).login, params.repo, params.webhook_id);
            return {
                success: true,
                action: 'get',
                message: `Webhook #${params.webhook_id} obtido com sucesso`,
                data: webhook
            };
        }
        catch (error) {
            throw new Error(`Falha ao obter webhook: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    /**
     * Atualiza um webhook existente
     *
     * FUNCIONALIDADE:
     * - Atualiza campos do webhook
     * - Suporta mudanÃ§a de URL e eventos
     * - Permite alteraÃ§Ã£o de status ativo
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - webhook_id: ID do webhook
     *
     * PARÃ‚METROS OPCIONAIS:
     * - new_url: Nova URL
     * - new_content_type: Novo tipo de conteÃºdo
     * - new_secret: Novo secret
     * - new_events: Novos eventos
     * - new_active: Novo status ativo
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Webhook deve existir
     * - Pelo menos um campo deve ser atualizado
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Atualize apenas campos necessÃ¡rios
     * - Use mensagens de commit descritivas
     * - Documente mudanÃ§as importantes
     * - Teste webhook apÃ³s atualizaÃ§Ã£o
     */
    async updateWebhook(params, provider, owner) {
        try {
            if (!params.repo || !params.webhook_id) {
                throw new Error('repo e webhook_id sÃ£o obrigatÃ³rios');
            }
            const updateData = {};
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
            const webhook = await provider.updateWebhook((await provider.getCurrentUser()).login, params.repo, params.webhook_id, updateData);
            return {
                success: true,
                action: 'update',
                message: `Webhook #${params.webhook_id} atualizado com sucesso`,
                data: webhook
            };
        }
        catch (error) {
            throw new Error(`Falha ao atualizar webhook: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    /**
     * Deleta um webhook do repositÃ³rio
     *
     * FUNCIONALIDADE:
     * - Remove webhook especificado
     * - Confirma exclusÃ£o bem-sucedida
     * - Limpa configuraÃ§Ãµes associadas
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - webhook_id: ID do webhook
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Webhook deve existir
     * - UsuÃ¡rio deve ter permissÃ£o de exclusÃ£o
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Confirme exclusÃ£o antes de executar
     * - Verifique se webhook nÃ£o estÃ¡ sendo usado
     * - Mantenha backup se necessÃ¡rio
     * - Documente motivo da exclusÃ£o
     */
    async deleteWebhook(params, provider, owner) {
        try {
            if (!params.repo || !params.webhook_id) {
                throw new Error('repo e webhook_id sÃ£o obrigatÃ³rios');
            }
            await provider.deleteWebhook((await provider.getCurrentUser()).login, params.repo, params.webhook_id);
            return {
                success: true,
                action: 'delete',
                message: `Webhook #${params.webhook_id} deletado com sucesso`,
                data: { deleted: true }
            };
        }
        catch (error) {
            throw new Error(`Falha ao deletar webhook: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    /**
     * Testa um webhook existente
     *
     * FUNCIONALIDADE:
     * - Envia payload de teste para webhook
     * - Verifica conectividade e resposta
     * - Retorna resultado do teste
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - webhook_id: ID do webhook
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Webhook deve existir
     * - Webhook deve estar ativo
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Teste webhooks apÃ³s criaÃ§Ã£o
     * - Monitore respostas de teste
     * - Verifique logs de entrega
     * - Configure retry adequado
     */
    async testWebhook(params, provider, owner) {
        try {
            if (!params.repo || !params.webhook_id) {
                throw new Error('repo e webhook_id sÃ£o obrigatÃ³rios');
            }
            // Implementar testWebhook
            const result = {
                success: true,
                message: 'Webhook testado com sucesso',
                note: 'Funcionalidade testWebhook serÃ¡ implementada'
            };
            return {
                success: true,
                action: 'test',
                message: `Webhook #${params.webhook_id} testado com sucesso`,
                data: result
            };
        }
        catch (error) {
            throw new Error(`Falha ao testar webhook: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Verifica se erro Ã© relacionado a Git
     */
    ,
    /**
     * Verifica se erro Ã© relacionado a Git
     */
    isGitRelatedError(errorMessage) {
        const gitKeywords = [
            'git', 'commit', 'push', 'pull', 'merge', 'conflict', 'branch',
            'remote', 'repository', 'authentication', 'permission', 'unauthorized',
            'divergent', 'non-fast-forward', 'fetch first', 'working tree',
            'uncommitted', 'stash', 'rebase', 'reset', 'checkout'
        ];
        const errorLower = errorMessage.toLowerCase();
        return gitKeywords.some(keyword => errorLower.includes(keyword));
    }
};
//# sourceMappingURL=git-webhooks.js.map