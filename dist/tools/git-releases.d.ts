import { z } from 'zod';
import { VcsOperations } from '../providers/index.js';
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
declare const ReleasesInputSchema: z.ZodObject<{
    action: z.ZodEnum<["create", "list", "get", "update", "delete", "publish"]>;
    repo: z.ZodString;
    provider: z.ZodEnum<["gitea", "github"]>;
    projectPath: z.ZodString;
    tag_name: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    body: z.ZodOptional<z.ZodString>;
    draft: z.ZodOptional<z.ZodBoolean>;
    prerelease: z.ZodOptional<z.ZodBoolean>;
    target_commitish: z.ZodOptional<z.ZodString>;
    release_id: z.ZodOptional<z.ZodNumber>;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    new_tag_name: z.ZodOptional<z.ZodString>;
    new_name: z.ZodOptional<z.ZodString>;
    new_body: z.ZodOptional<z.ZodString>;
    new_draft: z.ZodOptional<z.ZodBoolean>;
    new_prerelease: z.ZodOptional<z.ZodBoolean>;
    new_target_commitish: z.ZodOptional<z.ZodString>;
    latest: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    provider: "gitea" | "github";
    repo: string;
    action: "delete" | "get" | "list" | "create" | "update" | "publish";
    projectPath: string;
    name?: string | undefined;
    body?: string | undefined;
    tag_name?: string | undefined;
    draft?: boolean | undefined;
    prerelease?: boolean | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    new_name?: string | undefined;
    new_body?: string | undefined;
    target_commitish?: string | undefined;
    release_id?: number | undefined;
    new_tag_name?: string | undefined;
    new_draft?: boolean | undefined;
    new_prerelease?: boolean | undefined;
    new_target_commitish?: string | undefined;
    latest?: boolean | undefined;
}, {
    provider: "gitea" | "github";
    repo: string;
    action: "delete" | "get" | "list" | "create" | "update" | "publish";
    projectPath: string;
    name?: string | undefined;
    body?: string | undefined;
    tag_name?: string | undefined;
    draft?: boolean | undefined;
    prerelease?: boolean | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    new_name?: string | undefined;
    new_body?: string | undefined;
    target_commitish?: string | undefined;
    release_id?: number | undefined;
    new_tag_name?: string | undefined;
    new_draft?: boolean | undefined;
    new_prerelease?: boolean | undefined;
    new_target_commitish?: string | undefined;
    latest?: boolean | undefined;
}>;
export type ReleasesInput = z.infer<typeof ReleasesInputSchema>;
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
declare const ReleasesResultSchema: z.ZodObject<{
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
export type ReleasesResult = z.infer<typeof ReleasesResultSchema>;
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
export declare const releasesTool: {
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
            tag_name: {
                type: string;
                description: string;
            };
            name: {
                type: string;
                description: string;
            };
            body: {
                type: string;
                description: string;
            };
            draft: {
                type: string;
                description: string;
            };
            prerelease: {
                type: string;
                description: string;
            };
            target_commitish: {
                type: string;
                description: string;
            };
            release_id: {
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
            new_tag_name: {
                type: string;
                description: string;
            };
            new_name: {
                type: string;
                description: string;
            };
            new_body: {
                type: string;
                description: string;
            };
            new_draft: {
                type: string;
                description: string;
            };
            new_prerelease: {
                type: string;
                description: string;
            };
            new_target_commitish: {
                type: string;
                description: string;
            };
            latest: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
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
    handler(input: ReleasesInput): Promise<ReleasesResult>;
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
    createRelease(params: ReleasesInput, provider: VcsOperations): Promise<ReleasesResult>;
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
    listReleases(params: ReleasesInput, provider: VcsOperations): Promise<ReleasesResult>;
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
    getRelease(params: ReleasesInput, provider: VcsOperations): Promise<ReleasesResult>;
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
    updateRelease(params: ReleasesInput, provider: VcsOperations): Promise<ReleasesResult>;
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
    deleteRelease(params: ReleasesInput, provider: VcsOperations): Promise<ReleasesResult>;
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
    publishRelease(params: ReleasesInput, provider: VcsOperations): Promise<ReleasesResult>;
};
export {};
//# sourceMappingURL=git-releases.d.ts.map