import { z } from 'zod';
import { VcsOperations } from '../providers/index.js';
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
declare const WebhooksInputSchema: z.ZodObject<{
    action: z.ZodEnum<["create", "list", "get", "update", "delete", "test"]>;
    repo: z.ZodString;
    provider: z.ZodEnum<["gitea", "github"]>;
    projectPath: z.ZodString;
    url: z.ZodOptional<z.ZodString>;
    content_type: z.ZodOptional<z.ZodEnum<["json", "form"]>>;
    secret: z.ZodOptional<z.ZodString>;
    events: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    active: z.ZodOptional<z.ZodBoolean>;
    webhook_id: z.ZodOptional<z.ZodNumber>;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    new_url: z.ZodOptional<z.ZodString>;
    new_content_type: z.ZodOptional<z.ZodEnum<["json", "form"]>>;
    new_secret: z.ZodOptional<z.ZodString>;
    new_events: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    new_active: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    provider: "gitea" | "github";
    repo: string;
    action: "delete" | "get" | "list" | "create" | "update" | "test";
    projectPath: string;
    active?: boolean | undefined;
    url?: string | undefined;
    events?: string[] | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    content_type?: "json" | "form" | undefined;
    secret?: string | undefined;
    webhook_id?: number | undefined;
    new_url?: string | undefined;
    new_content_type?: "json" | "form" | undefined;
    new_secret?: string | undefined;
    new_events?: string[] | undefined;
    new_active?: boolean | undefined;
}, {
    provider: "gitea" | "github";
    repo: string;
    action: "delete" | "get" | "list" | "create" | "update" | "test";
    projectPath: string;
    active?: boolean | undefined;
    url?: string | undefined;
    events?: string[] | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    content_type?: "json" | "form" | undefined;
    secret?: string | undefined;
    webhook_id?: number | undefined;
    new_url?: string | undefined;
    new_content_type?: "json" | "form" | undefined;
    new_secret?: string | undefined;
    new_events?: string[] | undefined;
    new_active?: boolean | undefined;
}>;
export type WebhooksInput = z.infer<typeof WebhooksInputSchema>;
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
declare const WebhooksResultSchema: z.ZodObject<{
    success: z.ZodBoolean;
    action: z.ZodString;
    message: z.ZodString;
    data: z.ZodOptional<z.ZodAny>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message: string;
    action: string;
    success: boolean;
    error?: string | undefined;
    data?: any;
}, {
    message: string;
    action: string;
    success: boolean;
    error?: string | undefined;
    data?: any;
}>;
export type WebhooksResult = z.infer<typeof WebhooksResultSchema>;
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
export declare const webhooksTool: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            action: {
                type: string;
                enum: string[];
                description: string;
            };
            repo: {
                type: string;
                description: string;
            };
            provider: {
                type: string;
                description: string;
            };
            url: {
                type: string;
                description: string;
            };
            content_type: {
                type: string;
                enum: string[];
                description: string;
            };
            secret: {
                type: string;
                description: string;
            };
            events: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            active: {
                type: string;
                description: string;
            };
            webhook_id: {
                type: string;
                description: string;
            };
            page: {
                type: string;
                description: string;
                minimum: number;
            };
            limit: {
                type: string;
                description: string;
                minimum: number;
                maximum: number;
            };
            new_url: {
                type: string;
                description: string;
            };
            new_content_type: {
                type: string;
                enum: string[];
                description: string;
            };
            new_secret: {
                type: string;
                description: string;
            };
            new_events: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            new_active: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
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
    handler(input: WebhooksInput): Promise<WebhooksResult>;
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
    createWebhook(params: WebhooksInput, provider: VcsOperations, owner: string): Promise<WebhooksResult>;
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
    listWebhooks(params: WebhooksInput, provider: VcsOperations, owner: string): Promise<WebhooksResult>;
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
    getWebhook(params: WebhooksInput, provider: VcsOperations, owner: string): Promise<WebhooksResult>;
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
    updateWebhook(params: WebhooksInput, provider: VcsOperations, owner: string): Promise<WebhooksResult>;
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
    deleteWebhook(params: WebhooksInput, provider: VcsOperations, owner: string): Promise<WebhooksResult>;
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
    testWebhook(params: WebhooksInput, provider: VcsOperations, owner: string): Promise<WebhooksResult>;
    /**
     * Verifica se erro Ã© relacionado a Git
     */
    isGitRelatedError(errorMessage: string): boolean;
};
export {};
//# sourceMappingURL=git-webhooks.d.ts.map