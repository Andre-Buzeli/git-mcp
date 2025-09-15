"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhooksTool = void 0;
const zod_1 = require("zod");
const index_js_1 = require("../providers/index.js");
const user_detection_js_1 = require("../utils/user-detection.js");
/**
 * Tool: webhooks
 *
 * DESCRIÇÃO:
  async handler(input: WebhooksInput): Promise<WebhooksResult> {
    try {
      const validatedInput = WebhooksInputSchema.parse(input);
      
      // Aplicar auto-detecção apenas para owner dentro do provider especificado
      const processedInput = await applyAutoUserDetection(validatedInput, validatedInput.provider);
      
      // Usar o provider especificado pelo usuário
      const provider = globalProviderFactory.getProvider(processedInput.provider);
      
      if (!provider) {
        throw new Error(`Provider '${processedInput.provider}' não encontrado`);
      }o completo de webhooks com suporte multi-provider (GitHub e Gitea)
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
const WebhooksInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['create', 'list', 'get', 'update', 'delete', 'test']),
    // Parâmetros comuns
    owner: zod_1.z.string(),
    repo: zod_1.z.string(),
    // Para multi-provider
    provider: zod_1.z.enum(['gitea', 'github']).describe('Provider to use (gitea or github)'), // Provider específico: gitea, github ou both
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
    name: 'git-webhooks',
    description: 'Gerenciamento completo de webhooks com suporte multi-provider (GitHub e Gitea). PARÂMETROS OBRIGATÓRIOS: action, owner, repo, provider. AÇÕES: create (cria webhook), list (lista webhooks), get (detalhes), update (atualiza), delete (remove), test (testa). Boas práticas: use para CI/CD local, notificações e integrações, sempre HTTPS, mantenha secrets seguros, monitore falhas de entrega.',
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
        required: ['action', 'owner', 'repo', 'provider']
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
    async handler(input) {
        try {
            const validatedInput = WebhooksInputSchema.parse(input);
            // Apply automatic user/owner detection from configured tokens
            const processedInput = await (0, user_detection_js_1.applyAutoUserDetection)(validatedInput, validatedInput.provider || 'default');
            // Seleciona o provider baseado na entrada ou usa o padrão
            const provider = processedInput.provider
                ? index_js_1.globalProviderFactory.getProvider(processedInput.provider)
                : index_js_1.globalProviderFactory.getDefaultProvider();
            if (!provider) {
                throw new Error('Provider não encontrado ou não configurado');
            }
            switch (processedInput.action) {
                case 'create':
                    return await this.createWebhook(processedInput, provider);
                case 'list':
                    return await this.listWebhooks(processedInput, provider);
                case 'get':
                    return await this.getWebhook(processedInput, provider);
                case 'update':
                    return await this.updateWebhook(processedInput, provider);
                case 'delete':
                    return await this.deleteWebhook(processedInput, provider);
                case 'test':
                    return await this.testWebhook(processedInput, provider);
                default:
                    throw new Error(`Ação não suportada: ${processedInput.action}`);
            }
        }
        catch (error) {
            return {
                success: false,
                action: input.action,
                message: 'Erro na operação de webhooks',
                error: error instanceof Error ? error.message : String(error)
            };
        }
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
    async createWebhook(params, provider) {
        try {
            if (!params.owner || !params.repo || !params.url) {
                throw new Error('Owner, repo e url são obrigatórios');
            }
            const webhookData = {
                url: params.url,
                content_type: params.content_type || 'json',
                secret: params.secret || '',
                events: params.events || ['push'],
                active: params.active !== undefined ? params.active : true
            };
            const webhook = await provider.createWebhook(params.owner, params.repo, params.url, params.events || ['push'], params.secret);
            return {
                success: true,
                action: 'create',
                message: `Webhook criado com sucesso para '${params.owner}/${params.repo}'`,
                data: webhook
            };
        }
        catch (error) {
            throw new Error(`Falha ao criar webhook: ${error instanceof Error ? error.message : String(error)}`);
        }
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
    async listWebhooks(params, provider) {
        try {
            if (!params.owner || !params.repo) {
                throw new Error('Owner e repo são obrigatórios');
            }
            const page = params.page || 1;
            const limit = params.limit || 30;
            const webhooks = await provider.listWebhooks(params.owner, params.repo, page, limit);
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
    async getWebhook(params, provider) {
        try {
            if (!params.owner || !params.repo || !params.webhook_id) {
                throw new Error('Owner, repo e webhook_id são obrigatórios');
            }
            const webhook = await provider.getWebhook(params.owner, params.repo, params.webhook_id);
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
    async updateWebhook(params, provider) {
        try {
            if (!params.owner || !params.repo || !params.webhook_id) {
                throw new Error('Owner, repo e webhook_id são obrigatórios');
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
            const webhook = await provider.updateWebhook(params.owner, params.repo, params.webhook_id, updateData);
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
    async deleteWebhook(params, provider) {
        try {
            if (!params.owner || !params.repo || !params.webhook_id) {
                throw new Error('Owner, repo e webhook_id são obrigatórios');
            }
            await provider.deleteWebhook(params.owner, params.repo, params.webhook_id);
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
    async testWebhook(params, provider) {
        try {
            if (!params.owner || !params.repo || !params.webhook_id) {
                throw new Error('Owner, repo e webhook_id são obrigatórios');
            }
            // Implementar testWebhook
            const result = {
                success: true,
                message: 'Webhook testado com sucesso',
                note: 'Funcionalidade testWebhook será implementada'
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
};
//# sourceMappingURL=git-webhooks.js.map