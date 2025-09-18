import { z } from 'zod';
import { VcsOperations } from '../providers/index.js';
/**
 * Tool: releases
 *
 * DESCRIÃ‡ÃƒO:
 * Gerenciamento completo de releases com suporte multi-provider (GitHub e Gitea)
 *
 * FUNCIONALIDADES:
 * - CriaÃ§Ã£o de novos releases
 * - Listagem e busca de releases
 * - ObtenÃ§Ã£o de detalhes especÃ­ficos
 * - AtualizaÃ§Ã£o de releases existentes
 * - PublicaÃ§Ã£o de releases
 * - ExclusÃ£o de releases
 * - Controle de versÃ£o
 *
 * USO:
 * - Para gerenciar versÃµes do software
 * - Para controle de deploy
 * - Para documentaÃ§Ã£o de mudanÃ§as
 * - Para distribuiÃ§Ã£o de releases
 *
 * RECOMENDAÃ‡Ã•ES:
 * - Use versionamento semÃ¢ntico
 * - Documente mudanÃ§as detalhadamente
 * - Teste antes de publicar
 * - Mantenha histÃ³rico de versÃµes
 */
/**
 * Schema de validaÃ§Ã£o para entrada da tool releases
 *
 * VALIDAÃ‡Ã•ES:
 * - action: AÃ§Ã£o obrigatÃ³ria (create, list, get, update, delete, publish)
 * - ParÃ¢metros especÃ­ficos por aÃ§Ã£o
 * - ValidaÃ§Ã£o de tipos e formatos
 *
 * RECOMENDAÃ‡Ã•ES:
 * - Sempre valide entrada antes de usar
 * - Use parÃ¢metros opcionais adequadamente
 * - Documente parÃ¢metros obrigatÃ³rios
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
 * Schema de saÃ­da padronizado
 *
 * ESTRUTURA:
 * - success: Status da operaÃ§Ã£o
 * - action: AÃ§Ã£o executada
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
 * DESCRIÃ‡ÃƒO:
 * Gerenciamento completo de releases Gitea com mÃºltiplas aÃ§Ãµes
 *
 * ACTIONS DISPONÃVEIS:
 *
 * 1. create - Criar novo release
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - tag_name (obrigatÃ³rio): Nome da tag do release
 *    - name (opcional): Nome do release
 *    - body (opcional): DescriÃ§Ã£o detalhada (changelog)
 *    - draft (opcional): Se Ã© um draft release (padrÃ£o: false)
 *    - prerelease (opcional): Se Ã© um prerelease (padrÃ£o: false)
 *    - target_commitish (opcional): Branch ou commit alvo (padrÃ£o: branch padrÃ£o)
 *
 * 2. list - Listar releases
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - page (opcional): PÃ¡gina da listagem (padrÃ£o: 1)
 *    - limit (opcional): Itens por pÃ¡gina (padrÃ£o: 30, mÃ¡ximo: 100)
 *
 * 3. get - Obter detalhes do release
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - release_id (obrigatÃ³rio): ID do release
 *
 * 4. update - Atualizar release existente
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - release_id (obrigatÃ³rio): ID do release
 *    - new_tag_name (opcional): Nova tag
 *    - new_name (opcional): Novo nome
 *    - new_body (opcional): Nova descriÃ§Ã£o
 *    - new_draft (opcional): Novo status de draft
 *    - new_prerelease (opcional): Novo status de prerelease
 *    - new_target_commitish (opcional): Nova branch/commit alvo
 *
 * 5. delete - Deletar release
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - release_id (obrigatÃ³rio): ID do release
 *
 * 6. publish - Publicar release
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - release_id (obrigatÃ³rio): ID do release
 *
 * RECOMENDAÃ‡Ã•ES DE USO:
 * - Use versionamento semÃ¢ntico (ex: v1.0.0, v2.1.3)
 * - Documente mudanÃ§as detalhadamente no body
 * - Use drafts para releases em preparaÃ§Ã£o
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
    handler(input: ReleasesInput): Promise<ReleasesResult>;
    /**
     * Cria um novo release no repositÃ³rio
     *
     * FUNCIONALIDADE:
     * - Cria release com tag e descriÃ§Ã£o
     * - Suporta configuraÃ§Ã£o de draft e prerelease
     * - Permite especificar branch/commit alvo
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - tag_name: Nome da tag do release
     *
     * PARÃ‚METROS OPCIONAIS:
     * - name: Nome do release
     * - body: DescriÃ§Ã£o detalhada (changelog)
     * - draft: Se Ã© um draft release (padrÃ£o: false)
     * - prerelease: Se Ã© um prerelease (padrÃ£o: false)
     * - target_commitish: Branch ou commit alvo (padrÃ£o: branch padrÃ£o)
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Tag deve ser Ãºnica no repositÃ³rio
     * - Target commitish deve existir
     * - UsuÃ¡rio deve ter permissÃ£o de escrita
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use versionamento semÃ¢ntico (ex: v1.0.0)
     * - Documente mudanÃ§as detalhadamente
     * - Use drafts para releases em preparaÃ§Ã£o
     * - Marque prereleases adequadamente
     */
    createRelease(params: ReleasesInput, provider: VcsOperations): Promise<ReleasesResult>;
    /**
     * Lista releases do repositÃ³rio
     *
     * FUNCIONALIDADE:
     * - Lista releases com paginaÃ§Ã£o
     * - Retorna informaÃ§Ãµes bÃ¡sicas de cada release
     * - Inclui status de draft e prerelease
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
     * - Use paginaÃ§Ã£o para repositÃ³rios com muitos releases
     * - Monitore nÃºmero total de releases
     * - Verifique status de draft e prerelease
     * - Mantenha releases organizados
     */
    listReleases(params: ReleasesInput, provider: VcsOperations): Promise<ReleasesResult>;
    /**
     * ObtÃ©m detalhes de um release especÃ­fico
     *
     * FUNCIONALIDADE:
     * - Retorna informaÃ§Ãµes completas do release
     * - Inclui tag, nome, descriÃ§Ã£o e status
     * - Mostra URLs de download
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - release_id: ID do release
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Release deve existir no repositÃ³rio
     * - ID deve ser vÃ¡lido
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use para obter detalhes completos
     * - Verifique status de draft e prerelease
     * - Analise changelog e descriÃ§Ã£o
     * - Monitore URLs de download
     */
    getRelease(params: ReleasesInput, provider: VcsOperations): Promise<ReleasesResult>;
    /**
     * Atualiza um release existente
     *
     * FUNCIONALIDADE:
     * - Atualiza campos do release
     * - Suporta mudanÃ§a de tag e descriÃ§Ã£o
     * - Permite alteraÃ§Ã£o de status
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - release_id: ID do release
     *
     * PARÃ‚METROS OPCIONAIS:
     * - new_tag_name: Nova tag
     * - new_name: Novo nome
     * - new_body: Nova descriÃ§Ã£o
     * - new_draft: Novo status de draft
     * - new_prerelease: Novo status de prerelease
     * - new_target_commitish: Nova branch/commit alvo
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Release deve existir
     * - Pelo menos um campo deve ser atualizado
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Atualize apenas campos necessÃ¡rios
     * - Use mensagens de commit descritivas
     * - Documente mudanÃ§as importantes
     * - Notifique usuÃ¡rios sobre mudanÃ§as
     */
    updateRelease(params: ReleasesInput, provider: VcsOperations): Promise<ReleasesResult>;
    /**
     * Deleta um release do repositÃ³rio
     *
     * FUNCIONALIDADE:
     * - Remove release especificado
     * - MantÃ©m tag associada (se existir)
     * - Confirma exclusÃ£o bem-sucedida
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - release_id: ID do release
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Release deve existir
     * - UsuÃ¡rio deve ter permissÃ£o de exclusÃ£o
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Confirme exclusÃ£o antes de executar
     * - Verifique se release nÃ£o estÃ¡ sendo usado
     * - Mantenha backup se necessÃ¡rio
     * - Documente motivo da exclusÃ£o
     */
    deleteRelease(params: ReleasesInput, provider: VcsOperations): Promise<ReleasesResult>;
    /**
     * Publica um release draft
     *
     * FUNCIONALIDADE:
     * - Altera status do release de draft para publicado
     * - MantÃ©m todas as outras configuraÃ§Ãµes
     * - Permite download pÃºblico
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - release_id: ID do release
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Release deve existir
     * - Release deve estar como draft
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Confirme que release estÃ¡ pronto
     * - Teste antes de publicar
     * - Verifique se nÃ£o hÃ¡ bugs conhecidos
     * - Notifique usuÃ¡rios sobre nova versÃ£o
     */
    publishRelease(params: ReleasesInput, provider: VcsOperations): Promise<ReleasesResult>;
    /**
     * Verifica se erro Ã© relacionado a Git
     */
    isGitRelatedError(errorMessage: string): boolean;
};
export {};
//# sourceMappingURL=git-releases.d.ts.map