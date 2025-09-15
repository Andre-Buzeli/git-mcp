import { z } from 'zod';
import { VcsOperations } from '../providers/index.js';
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
declare const WebhooksInputSchema: z.ZodObject<{
    action: z.ZodEnum<["create", "list", "get", "update", "delete", "test"]>;
    owner: z.ZodString;
    repo: z.ZodString;
    provider: z.ZodEnum<["gitea", "github"]>;
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
    owner: string;
    repo: string;
    action: "delete" | "get" | "create" | "list" | "update" | "test";
    active?: boolean | undefined;
    events?: string[] | undefined;
    url?: string | undefined;
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
    owner: string;
    repo: string;
    action: "delete" | "get" | "create" | "list" | "update" | "test";
    active?: boolean | undefined;
    events?: string[] | undefined;
    url?: string | undefined;
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
 * Schema de saída padronizado
 *
 * ESTRUTURA:
 * - success: Status da operação
 * - action: Ação executada
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
            owner: {
                type: string;
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
    handler(input: WebhooksInput): Promise<WebhooksResult>;
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
    createWebhook(params: WebhooksInput, provider: VcsOperations): Promise<WebhooksResult>;
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
    listWebhooks(params: WebhooksInput, provider: VcsOperations): Promise<WebhooksResult>;
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
    getWebhook(params: WebhooksInput, provider: VcsOperations): Promise<WebhooksResult>;
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
    updateWebhook(params: WebhooksInput, provider: VcsOperations): Promise<WebhooksResult>;
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
    deleteWebhook(params: WebhooksInput, provider: VcsOperations): Promise<WebhooksResult>;
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
    testWebhook(params: WebhooksInput, provider: VcsOperations): Promise<WebhooksResult>;
};
export {};
//# sourceMappingURL=git-webhooks.d.ts.map