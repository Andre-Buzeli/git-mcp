import { z } from 'zod';
import { VcsOperations } from '../providers/index.js';
/**
 * Tool: commits
 *
 * DESCRIÃ‡ÃƒO:
 * Gerenciamento completo de commits com suporte multi-provider (GitHub e Gitea)
 *
 * FUNCIONALIDADES:
 * - Listagem de histÃ³rico de commits
 * - ObtenÃ§Ã£o de detalhes especÃ­ficos
 * - CriaÃ§Ã£o de novos commits
 * - ComparaÃ§Ã£o entre commits
 * - Busca por mensagens e conteÃºdo
 * - AnÃ¡lise de mudanÃ§as
 *
 * USO:
 * - Para acompanhar histÃ³rico de mudanÃ§as
 * - Para analisar evoluÃ§Ã£o do cÃ³digo
 * - Para criar commits programaticamente
 * - Para auditoria de mudanÃ§as
 *
 * RECOMENDAÃ‡Ã•ES:
 * - Use mensagens de commit descritivas
 * - Mantenha commits atÃ´micos
 * - Documente mudanÃ§as importantes
 * - Revise histÃ³rico regularmente
 */
/**
 * Schema de validaÃ§Ã£o para entrada da tool commits
 *
 * VALIDAÃ‡Ã•ES:
 * - action: AÃ§Ã£o obrigatÃ³ria (list, get, create, compare, search)
 * - ParÃ¢metros especÃ­ficos por aÃ§Ã£o
 * - ValidaÃ§Ã£o de tipos e formatos
 *
 * RECOMENDAÃ‡Ã•ES:
 * - Sempre valide entrada antes de usar
 * - Use parÃ¢metros opcionais adequadamente
 * - Documente parÃ¢metros obrigatÃ³rios
 */
declare const CommitsInputSchema: z.ZodObject<{
    action: z.ZodEnum<["list", "get", "create", "compare", "search", "push", "pull"]>;
    repo: z.ZodString;
    projectPath: z.ZodString;
    provider: z.ZodEnum<["gitea", "github"]>;
    sha: z.ZodOptional<z.ZodString>;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    commit_sha: z.ZodOptional<z.ZodString>;
    message: z.ZodOptional<z.ZodString>;
    branch: z.ZodOptional<z.ZodString>;
    author_name: z.ZodOptional<z.ZodString>;
    author_email: z.ZodOptional<z.ZodString>;
    committer_name: z.ZodOptional<z.ZodString>;
    committer_email: z.ZodOptional<z.ZodString>;
    base: z.ZodOptional<z.ZodString>;
    head: z.ZodOptional<z.ZodString>;
    query: z.ZodOptional<z.ZodString>;
    author: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    provider: "gitea" | "github";
    repo: string;
    action: "push" | "get" | "search" | "pull" | "list" | "create" | "compare";
    projectPath: string;
    message?: string | undefined;
    branch?: string | undefined;
    head?: string | undefined;
    base?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sha?: string | undefined;
    query?: string | undefined;
    commit_sha?: string | undefined;
    author_name?: string | undefined;
    author_email?: string | undefined;
    committer_name?: string | undefined;
    committer_email?: string | undefined;
    author?: string | undefined;
}, {
    provider: "gitea" | "github";
    repo: string;
    action: "push" | "get" | "search" | "pull" | "list" | "create" | "compare";
    projectPath: string;
    message?: string | undefined;
    branch?: string | undefined;
    head?: string | undefined;
    base?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sha?: string | undefined;
    query?: string | undefined;
    commit_sha?: string | undefined;
    author_name?: string | undefined;
    author_email?: string | undefined;
    committer_name?: string | undefined;
    committer_email?: string | undefined;
    author?: string | undefined;
}>;
export type CommitsInput = z.infer<typeof CommitsInputSchema>;
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
declare const CommitsResultSchema: z.ZodObject<{
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
export type CommitsResult = z.infer<typeof CommitsResultSchema>;
/**
 * Tool: commits
 *
 * DESCRIÃ‡ÃƒO:
 * Gerenciamento completo de commits Gitea com mÃºltiplas aÃ§Ãµes
 *
 * ACTIONS DISPONÃVEIS:
 *
 * 1. list - Listar commits
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - sha (opcional): Branch ou commit especÃ­fico (padrÃ£o: branch padrÃ£o)
 *    - page (opcional): PÃ¡gina da listagem (padrÃ£o: 1)
 *    - limit (opcional): Itens por pÃ¡gina (padrÃ£o: 30, mÃ¡ximo: 100)
 *
 * 2. get - Obter detalhes do commit
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - commit_sha (obrigatÃ³rio): SHA do commit
 *
 * 3. create - Criar novo commit
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - message (obrigatÃ³rio): Mensagem do commit
 *    - branch (obrigatÃ³rio): Branch de destino
 *    - author_name (opcional): Nome do autor
 *    - author_email (opcional): Email do autor
 *    - committer_name (opcional): Nome do committer
 *    - committer_email (opcional): Email do committer
 *
 * 4. compare - Comparar commits
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - base (obrigatÃ³rio): Commit base para comparaÃ§Ã£o
 *    - head (obrigatÃ³rio): Commit para comparar
 *
 * 5. search - Buscar commits
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - query (obrigatÃ³rio): Termo de busca
 *    - author (opcional): Autor dos commits
 *    - page (opcional): PÃ¡gina da busca (padrÃ£o: 1)
 *    - limit (opcional): Itens por pÃ¡gina (padrÃ£o: 30, mÃ¡ximo: 100)
 *
 * RECOMENDAÃ‡Ã•ES DE USO:
 * - Use mensagens de commit descritivas
 * - Mantenha commits atÃ´micos
 * - Documente mudanÃ§as importantes
 * - Revise histÃ³rico regularmente
 * - Use branches para features
 * - Mantenha histÃ³rico limpo
 */
export declare const commitsTool: {
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
            sha: {
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
            commit_sha: {
                type: string;
                description: string;
            };
            message: {
                type: string;
                description: string;
            };
            branch: {
                type: string;
                description: string;
            };
            author_name: {
                type: string;
                description: string;
            };
            author_email: {
                type: string;
                description: string;
            };
            committer_name: {
                type: string;
                description: string;
            };
            committer_email: {
                type: string;
                description: string;
            };
            base: {
                type: string;
                description: string;
            };
            head: {
                type: string;
                description: string;
            };
            query: {
                type: string;
                description: string;
            };
            author: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    /**
     * Handler principal da tool commits
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
    handler(input: CommitsInput): Promise<CommitsResult>;
    /**
     * Lista commits do repositÃ³rio
     *
     * FUNCIONALIDADE:
     * - Lista commits com paginaÃ§Ã£o
     * - Suporta filtro por branch ou commit
     * - Retorna informaÃ§Ãµes bÃ¡sicas de cada commit
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     *
     * PARÃ‚METROS OPCIONAIS:
     * - sha: Branch, tag ou commit especÃ­fico (padrÃ£o: branch padrÃ£o)
     * - page: PÃ¡gina da listagem (padrÃ£o: 1)
     * - limit: Itens por pÃ¡gina (padrÃ£o: 30, mÃ¡ximo: 100)
     *
     * VALIDAÃ‡Ã•ES:
     * - e repo obrigatÃ³rios
     * - SHA deve ser vÃ¡lido se fornecido
     * - Page deve ser >= 1
     * - Limit deve ser entre 1 e 100
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use paginaÃ§Ã£o para repositÃ³rios grandes
     * - Monitore nÃºmero total de commits
     * - Use SHA especÃ­fico para anÃ¡lise
     * - Mantenha histÃ³rico organizado
     */
    listCommits(params: CommitsInput, provider: VcsOperations, owner: string): Promise<CommitsResult>;
    /**
     * ObtÃ©m detalhes de um commit especÃ­fico
     *
     * FUNCIONALIDADE:
     * - ObtÃ©m informaÃ§Ãµes completas do commit
     * - Inclui detalhes de autor e committer
     * - Mostra arquivos modificados
     * - Retorna hash e mensagem
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - commit_sha: SHA do commit
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - SHA deve ser vÃ¡lido
     * - Commit deve existir
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use para anÃ¡lise detalhada
     * - Verifique arquivos modificados
     * - Analise mensagem e autor
     * - Documente mudanÃ§as importantes
     */
    getCommit(params: CommitsInput, provider: VcsOperations, owner: string): Promise<CommitsResult>;
    /**
     * Cria um novo commit
     *
     * FUNCIONALIDADE:
     * - Cria commit com mensagem personalizada
     * - Suporta autor e committer diferentes
     * - Permite especificar branch de destino
     * - Valida dados obrigatÃ³rios
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - message: Mensagem do commit
     * - branch: Branch de destino
     *
     * PARÃ‚METROS OPCIONAIS:
     * - author_name: Nome do autor
     * - author_email: Email do autor
     * - committer_name: Nome do committer
     * - committer_email: Email do committer
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Mensagem nÃ£o pode estar vazia
     * - Branch deve existir
     * - Emails devem ser vÃ¡lidos
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use mensagens descritivas
     * - Mantenha commits atÃ´micos
     * - Documente mudanÃ§as importantes
     * - Use branches apropriadas
     */
    createCommit(params: CommitsInput, provider: VcsOperations, owner: string): Promise<CommitsResult>;
    /**
     * Compara dois commits ou branches
     *
     * FUNCIONALIDADE:
     * - Compara diferenÃ§as entre commits
     * - Mostra arquivos modificados
     * - Retorna estatÃ­sticas de mudanÃ§as
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - base: Commit ou branch base
     * - head: Commit ou branch para comparar
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Base e head devem existir
     * - Deve ser possÃ­vel comparar
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use para anÃ¡lise de mudanÃ§as
     * - Compare antes de fazer merge
     * - Analise arquivos modificados
     * - Documente diferenÃ§as importantes
     */
    compareCommits(params: CommitsInput, provider: VcsOperations, owner: string): Promise<CommitsResult>;
    /**
     * Busca commits por critÃ©rios especÃ­ficos
     *
     * FUNCIONALIDADE:
     * - Busca commits por mensagem
     * - Filtra por autor
     * - Suporta paginaÃ§Ã£o
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - query: Termo de busca
     *
     * PARÃ‚METROS OPCIONAIS:
     * - author: Autor dos commits
     * - page: PÃ¡gina da busca (padrÃ£o: 1)
     * - limit: Itens por pÃ¡gina (padrÃ£o: 30, mÃ¡ximo: 100)
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Query deve ter pelo menos 3 caracteres
     * - RepositÃ³rio deve existir
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use termos de busca especÃ­ficos
     * - Combine com filtros de autor
     * - Use paginaÃ§Ã£o para resultados grandes
     * - Analise relevÃ¢ncia dos resultados
     */
    searchCommits(params: CommitsInput, provider: VcsOperations, owner: string): Promise<CommitsResult>;
    /**
     * Faz push dos commits locais para o repositÃ³rio remoto
     *
     * FUNCIONALIDADE:
     * - Faz push da branch atual para o remote
     * - Suporta especificar branch especÃ­fica
     * - Verifica se hÃ¡ commits para fazer push
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - projectPath: Caminho do projeto local
     *
     * PARÃ‚METROS OPCIONAIS:
     * - branch: Branch para fazer push (padrÃ£o: branch atual)
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Verifique se hÃ¡ commits locais antes do push
     * - Use branch especÃ­fica se necessÃ¡rio
     * - Monitore conflitos durante o push
     */
    pushCommits(params: CommitsInput, provider?: VcsOperations): Promise<CommitsResult>;
    /**
     * Faz pull dos commits do repositÃ³rio remoto
     *
     * FUNCIONALIDADE:
     * - Faz pull da branch atual do remote
     * - Suporta especificar branch especÃ­fica
     * - Faz merge automÃ¡tico se possÃ­vel
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - projectPath: Caminho do projeto local
     *
     * PARÃ‚METROS OPCIONAIS:
     * - branch: Branch para fazer pull (padrÃ£o: branch atual)
     *
     * RECOMENDAÃ‡Ã•ES:
     * - FaÃ§a backup antes do pull
     * - Resolva conflitos manualmente se houver
     * - Use branch especÃ­fica se necessÃ¡rio
     */
    pullCommits(params: CommitsInput, provider?: VcsOperations): Promise<CommitsResult>;
    /**
     * Verifica se erro Ã© relacionado a Git
     */
    isGitRelatedError(errorMessage: string): boolean;
};
export {};
//# sourceMappingURL=git-commits.d.ts.map