import { z } from 'zod';
import { VcsOperations } from '../providers/index.js';
/**
 * Tool: tags
 *
 * DESCRIÃ‡ÃƒO:
 * Gerenciamento completo de tags com suporte multi-provider (GitHub e Gitea)
 *
 * FUNCIONALIDADES:
 * - CriaÃ§Ã£o de novas tags
 * - Listagem e busca de tags
 * - ObtenÃ§Ã£o de detalhes especÃ­ficos
 * - ExclusÃ£o de tags
 * - Controle de versÃ£o
 * - Busca por padrÃµes
 *
 * USO:
 * - Para marcar versÃµes especÃ­ficas
 * - Para controle de release
 * - Para rollback de cÃ³digo
 * - Para identificaÃ§Ã£o de commits
 *
 * RECOMENDAÃ‡Ã•ES:
 * - Use versionamento semÃ¢ntico
 * - Mantenha tags organizadas
 * - Documente propÃ³sito das tags
 * - Use para pontos de referÃªncia
 */
/**
 * Schema de validaÃ§Ã£o para entrada da tool tags
 *
 * VALIDAÃ‡Ã•ES:
 * - action: AÃ§Ã£o obrigatÃ³ria (create, list, get, delete, search)
 * - ParÃ¢metros especÃ­ficos por aÃ§Ã£o
 * - ValidaÃ§Ã£o de tipos e formatos
 *
 * RECOMENDAÃ‡Ã•ES:
 * - Sempre valide entrada antes de usar
 * - Use parÃ¢metros opcionais adequadamente
 * - Documente parÃ¢metros obrigatÃ³rios
 */
declare const TagsInputSchema: z.ZodObject<{
    action: z.ZodEnum<["create", "list", "get", "delete", "search"]>;
    repo: z.ZodString;
    provider: z.ZodEnum<["gitea", "github"]>;
    projectPath: z.ZodString;
    tag_name: z.ZodOptional<z.ZodString>;
    message: z.ZodOptional<z.ZodString>;
    target: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["lightweight", "annotated"]>>;
    tagger_name: z.ZodOptional<z.ZodString>;
    tagger_email: z.ZodOptional<z.ZodString>;
    tag: z.ZodOptional<z.ZodString>;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    query: z.ZodOptional<z.ZodString>;
    pattern: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    provider: "gitea" | "github";
    repo: string;
    action: "delete" | "get" | "search" | "list" | "create";
    projectPath: string;
    message?: string | undefined;
    type?: "lightweight" | "annotated" | undefined;
    tag_name?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    tag?: string | undefined;
    query?: string | undefined;
    target?: string | undefined;
    tagger_name?: string | undefined;
    tagger_email?: string | undefined;
    pattern?: string | undefined;
}, {
    provider: "gitea" | "github";
    repo: string;
    action: "delete" | "get" | "search" | "list" | "create";
    projectPath: string;
    message?: string | undefined;
    type?: "lightweight" | "annotated" | undefined;
    tag_name?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    tag?: string | undefined;
    query?: string | undefined;
    target?: string | undefined;
    tagger_name?: string | undefined;
    tagger_email?: string | undefined;
    pattern?: string | undefined;
}>;
export type TagsInput = z.infer<typeof TagsInputSchema>;
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
declare const TagsResultSchema: z.ZodObject<{
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
export type TagsResult = z.infer<typeof TagsResultSchema>;
/**
 * Tool: tags
 *
 * DESCRIÃ‡ÃƒO:
 * Gerenciamento completo de tags Gitea com mÃºltiplas aÃ§Ãµes
 *
 * ACTIONS DISPONÃVEIS:
 *
 * 1. create - Criar nova tag
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - tag_name (obrigatÃ³rio): Nome da tag
 *    - message (opcional): Mensagem da tag (para tags anotadas)
 *    - target (obrigatÃ³rio): Commit, branch ou tag alvo
 *    - type (opcional): Tipo de tag (lightweight, annotated) - padrÃ£o: lightweight
 *    - tagger_name (opcional): Nome do tagger (para tags anotadas)
 *    - tagger_email (opcional): Email do tagger (para tags anotadas)
 *
 * 2. list - Listar tags
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - page (opcional): PÃ¡gina da listagem (padrÃ£o: 1)
 *    - limit (opcional): Itens por pÃ¡gina (padrÃ£o: 30, mÃ¡ximo: 100)
 *
 * 3. get - Obter detalhes da tag
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - tag (obrigatÃ³rio): Nome da tag
 *
 * 4. delete - Deletar tag
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - tag (obrigatÃ³rio): Nome da tag
 *
 * 5. search - Buscar tags
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - query (opcional): Termo de busca
 *    - pattern (opcional): PadrÃ£o de busca (ex: v*.*.*)
 *
 * RECOMENDAÃ‡Ã•ES DE USO:
 * - Use convenÃ§Ãµes de nomenclatura consistentes
 * - Documente propÃ³sito das tags
 * - Mantenha tags organizadas
 * - Use versionamento semÃ¢ntico
 * - Use tags anotadas para releases importantes
 * - Limpe tags antigas regularmente
 */
export declare const tagsTool: {
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
            message: {
                type: string;
                description: string;
            };
            target: {
                type: string;
                description: string;
            };
            type: {
                type: string;
                enum: string[];
                description: string;
            };
            tagger_name: {
                type: string;
                description: string;
            };
            tagger_email: {
                type: string;
                description: string;
            };
            tag: {
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
            query: {
                type: string;
                description: string;
            };
            pattern: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    /**
     * Handler principal da tool tags
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
    handler(input: TagsInput): Promise<TagsResult>;
    /**
     * Cria uma nova tag no repositÃ³rio
     *
     * FUNCIONALIDADE:
     * - Cria tag com nome e target especificados
     * - Suporta tags lightweight e anotadas
     * - Permite configuraÃ§Ã£o de tagger
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - tag_name: Nome da tag
     * - target: Commit, branch ou tag alvo
     *
     * PARÃ‚METROS OPCIONAIS:
     * - message: Mensagem da tag (para tags anotadas)
     * - type: Tipo de tag (lightweight, annotated) - padrÃ£o: lightweight
     * - tagger_name: Nome do tagger (para tags anotadas)
     * - tagger_email: Email do tagger (para tags anotadas)
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Nome da tag deve ser Ãºnico no repositÃ³rio
     * - Target deve existir
     * - UsuÃ¡rio deve ter permissÃ£o de escrita
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use convenÃ§Ãµes de nomenclatura consistentes
     * - Use tags anotadas para releases importantes
     * - Documente propÃ³sito da tag
     * - Use versionamento semÃ¢ntico
     */
    createTag(params: TagsInput, provider: VcsOperations): Promise<TagsResult>;
    /**
     * Lista tags do repositÃ³rio
     *
     * FUNCIONALIDADE:
     * - Lista tags com paginaÃ§Ã£o
     * - Retorna informaÃ§Ãµes bÃ¡sicas de cada tag
     * - Inclui commit alvo e URLs de download
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
     * - Use paginaÃ§Ã£o para repositÃ³rios com muitas tags
     * - Monitore nÃºmero total de tags
     * - Verifique commit alvo de cada tag
     * - Mantenha tags organizadas
     */
    listTags(params: TagsInput, provider: VcsOperations): Promise<TagsResult>;
    /**
     * ObtÃ©m detalhes de uma tag especÃ­fica
     *
     * FUNCIONALIDADE:
     * - Retorna informaÃ§Ãµes completas da tag
     * - Inclui nome, commit alvo e URLs
     * - Mostra tipo da tag (lightweight/anotada)
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - tag: Nome da tag
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Tag deve existir no repositÃ³rio
     * - Nome deve ser vÃ¡lido
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use para obter detalhes completos
     * - Verifique commit alvo da tag
     * - Analise URLs de download
     * - Monitore mudanÃ§as importantes
     */
    getTag(params: TagsInput, provider: VcsOperations): Promise<TagsResult>;
    /**
     * Deleta uma tag do repositÃ³rio
     *
     * FUNCIONALIDADE:
     * - Remove tag especificada
     * - MantÃ©m commit alvo intacto
     * - Confirma exclusÃ£o bem-sucedida
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - tag: Nome da tag
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Tag deve existir
     * - UsuÃ¡rio deve ter permissÃ£o de exclusÃ£o
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Confirme exclusÃ£o antes de executar
     * - Verifique se tag nÃ£o estÃ¡ sendo usada
     * - Mantenha backup se necessÃ¡rio
     * - Documente motivo da exclusÃ£o
     */
    deleteTag(params: TagsInput, provider: VcsOperations): Promise<TagsResult>;
    /**
     * Busca tags por critÃ©rios especÃ­ficos
     *
     * FUNCIONALIDADE:
     * - Busca tags por nome ou padrÃ£o
     * - Suporta padrÃµes glob (ex: v*.*.*)
     * - Retorna resultados relevantes
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     *
     * PARÃ‚METROS OPCIONAIS:
     * - query: Termo de busca
     * - pattern: PadrÃ£o de busca (ex: v*.*.*)
     *
     * VALIDAÃ‡Ã•ES:
     * - e repo obrigatÃ³rios
     * - Query ou pattern deve ser fornecido
     * - RepositÃ³rio deve existir
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use padrÃµes glob para busca eficiente
     * - Combine com filtros de nome
     * - Analise resultados para relevÃ¢ncia
     * - Use para encontrar tags relacionadas
     */
    searchTags(params: TagsInput, provider: VcsOperations): Promise<TagsResult>;
    /**
     * Verifica se erro Ã© relacionado a Git
     */
    isGitRelatedError(errorMessage: string): boolean;
};
export {};
//# sourceMappingURL=git-tags.d.ts.map