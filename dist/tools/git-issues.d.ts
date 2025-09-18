import { z } from 'zod';
import { VcsOperations } from '../providers/index.js';
/**
 * Tool: issues
 *
 * DESCRIÃ‡ÃƒO:
 * Gerenciamento completo de issues com suporte multi-provider (GitHub e Gitea)
 *
 * FUNCIONALIDADES:
 * - CriaÃ§Ã£o de novas issues
 * - Listagem e busca de issues
 * - ObtenÃ§Ã£o de detalhes especÃ­ficos
 * - AtualizaÃ§Ã£o de issues existentes
 * - Fechamento de issues
 * - AdiÃ§Ã£o de comentÃ¡rios
 * - Busca por conteÃºdo e status
 *
 * USO:
 * - Para gerenciar bugs e features
 * - Para acompanhar progresso de desenvolvimento
 * - Para comunicaÃ§Ã£o entre equipe
 * - Para controle de qualidade
 *
 * RECOMENDAÃ‡Ã•ES:
 * - Use tÃ­tulos descritivos
 * - Documente detalhes completos
 * - Atualize status regularmente
 * - Use labels adequadamente
 */
/**
 * Schema de validaÃ§Ã£o para entrada da tool issues
 *
 * VALIDAÃ‡Ã•ES:
 * - action: AÃ§Ã£o obrigatÃ³ria (create, list, get, update, close, comment, search)
 * - ParÃ¢metros especÃ­ficos por aÃ§Ã£o
 * - ValidaÃ§Ã£o de tipos e formatos
 *
 * RECOMENDAÃ‡Ã•ES:
 * - Sempre valide entrada antes de usar
 * - Use parÃ¢metros opcionais adequadamente
 * - Documente parÃ¢metros obrigatÃ³rios
 */
declare const IssuesInputSchema: z.ZodObject<{
    action: z.ZodEnum<["create", "list", "get", "update", "close", "comment", "search"]>;
    repo: z.ZodString;
    provider: z.ZodEnum<["gitea", "github"]>;
    projectPath: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    body: z.ZodOptional<z.ZodString>;
    labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    assignees: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    milestone: z.ZodOptional<z.ZodNumber>;
    issue_number: z.ZodOptional<z.ZodNumber>;
    state: z.ZodOptional<z.ZodEnum<["open", "closed", "all"]>>;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    new_title: z.ZodOptional<z.ZodString>;
    new_body: z.ZodOptional<z.ZodString>;
    new_state: z.ZodOptional<z.ZodEnum<["open", "closed"]>>;
    new_labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    new_assignees: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    new_milestone: z.ZodOptional<z.ZodNumber>;
    comment_body: z.ZodOptional<z.ZodString>;
    query: z.ZodOptional<z.ZodString>;
    author: z.ZodOptional<z.ZodString>;
    assignee: z.ZodOptional<z.ZodString>;
    label: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    provider: "gitea" | "github";
    repo: string;
    action: "get" | "search" | "list" | "create" | "close" | "update" | "comment";
    projectPath: string;
    title?: string | undefined;
    body?: string | undefined;
    state?: "open" | "closed" | "all" | undefined;
    assignees?: string[] | undefined;
    labels?: string[] | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    query?: string | undefined;
    author?: string | undefined;
    milestone?: number | undefined;
    issue_number?: number | undefined;
    new_title?: string | undefined;
    new_body?: string | undefined;
    new_state?: "open" | "closed" | undefined;
    new_labels?: string[] | undefined;
    new_assignees?: string[] | undefined;
    new_milestone?: number | undefined;
    comment_body?: string | undefined;
    assignee?: string | undefined;
    label?: string | undefined;
}, {
    provider: "gitea" | "github";
    repo: string;
    action: "get" | "search" | "list" | "create" | "close" | "update" | "comment";
    projectPath: string;
    title?: string | undefined;
    body?: string | undefined;
    state?: "open" | "closed" | "all" | undefined;
    assignees?: string[] | undefined;
    labels?: string[] | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    query?: string | undefined;
    author?: string | undefined;
    milestone?: number | undefined;
    issue_number?: number | undefined;
    new_title?: string | undefined;
    new_body?: string | undefined;
    new_state?: "open" | "closed" | undefined;
    new_labels?: string[] | undefined;
    new_assignees?: string[] | undefined;
    new_milestone?: number | undefined;
    comment_body?: string | undefined;
    assignee?: string | undefined;
    label?: string | undefined;
}>;
export type IssuesInput = z.infer<typeof IssuesInputSchema>;
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
declare const IssuesResultSchema: z.ZodObject<{
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
export type IssuesResult = z.infer<typeof IssuesResultSchema>;
/**
 * Tool: issues
 *
 * DESCRIÃ‡ÃƒO:
 * Gerenciamento completo de issues Gitea com mÃºltiplas aÃ§Ãµes
 *
 * ACTIONS DISPONÃVEIS:
 *
 * 1. create - Criar nova issue
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - title (obrigatÃ³rio): TÃ­tulo da issue
 *    - body (opcional): DescriÃ§Ã£o detalhada
 *    - labels (opcional): Array de labels
 *    - assignees (opcional): Array de usuÃ¡rios responsÃ¡veis
 *    - milestone (opcional): ID do milestone
 *
 * 2. list - Listar issues
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - state (opcional): Estado das issues (open, closed, all) - padrÃ£o: open
 *    - page (opcional): PÃ¡gina da listagem (padrÃ£o: 1)
 *    - limit (opcional): Itens por pÃ¡gina (padrÃ£o: 30, mÃ¡ximo: 100)
 *
 * 3. get - Obter detalhes da issue
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - issue_number (obrigatÃ³rio): NÃºmero da issue
 *
 * 4. update - Atualizar issue existente
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - issue_number (obrigatÃ³rio): NÃºmero da issue
 *    - new_title (opcional): Novo tÃ­tulo
 *    - new_body (opcional): Nova descriÃ§Ã£o
 *    - new_state (opcional): Novo estado
 *    - new_labels (opcional): Novos labels
 *    - new_assignees (opcional): Novos responsÃ¡veis
 *    - new_milestone (opcional): Novo milestone
 *
 * 5. close - Fechar issue
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - issue_number (obrigatÃ³rio): NÃºmero da issue
 *
 * 6. comment - Adicionar comentÃ¡rio
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - issue_number (obrigatÃ³rio): NÃºmero da issue
 *    - comment_body (obrigatÃ³rio): ConteÃºdo do comentÃ¡rio
 *
 * 7. search - Buscar issues
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - query (obrigatÃ³rio): Termo de busca
 *    - author (opcional): Autor das issues
 *    - assignee (opcional): ResponsÃ¡vel pelas issues
 *    - label (opcional): Label especÃ­fico
 *
 * RECOMENDAÃ‡Ã•ES DE USO:
 * - Use tÃ­tulos descritivos e claros
 * - Documente detalhes completos na descriÃ§Ã£o
 * - Atualize status regularmente
 * - Use labels para categorizaÃ§Ã£o
 * - Atribua responsÃ¡veis adequadamente
 * - Mantenha issues organizadas
 */
export declare const issuesTool: {
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
            title: {
                type: string;
                description: string;
            };
            body: {
                type: string;
                description: string;
            };
            labels: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            assignees: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            milestone: {
                type: string;
                description: string;
            };
            issue_number: {
                type: string;
                description: string;
            };
            state: {
                type: string;
                enum: string[];
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
            new_title: {
                type: string;
                description: string;
            };
            new_body: {
                type: string;
                description: string;
            };
            new_state: {
                type: string;
                enum: string[];
                description: string;
            };
            new_labels: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            new_assignees: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            new_milestone: {
                type: string;
                description: string;
            };
            comment_body: {
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
            assignee: {
                type: string;
                description: string;
            };
            label: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    /**
     * Handler principal da tool issues
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
    handler(input: IssuesInput): Promise<IssuesResult>;
    /**
     * Cria uma nova issue no repositÃ³rio
     *
     * FUNCIONALIDADE:
     * - Cria issue com tÃ­tulo e descriÃ§Ã£o
     * - Suporta labels, assignees e milestone
     * - Retorna detalhes da issue criada
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - title: TÃ­tulo da issue
     *
     * PARÃ‚METROS OPCIONAIS:
     * - body: DescriÃ§Ã£o detalhada
     * - labels: Array de labels para categorizaÃ§Ã£o
     * - assignees: Array de usuÃ¡rios responsÃ¡veis
     * - milestone: ID do milestone associado
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - TÃ­tulo deve ser Ãºnico no repositÃ³rio
     * - Labels devem existir no repositÃ³rio
     * - Assignees devem ser usuÃ¡rios vÃ¡lidos
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use tÃ­tulos descritivos e claros
     * - Documente detalhes completos
     * - Use labels para categorizaÃ§Ã£o
     * - Atribua responsÃ¡veis adequadamente
     */
    createIssue(params: IssuesInput, provider: VcsOperations, owner: string): Promise<IssuesResult>;
    /**
     * Lista issues do repositÃ³rio
     *
     * FUNCIONALIDADE:
     * - Lista issues com filtros de estado
     * - Suporta paginaÃ§Ã£o
     * - Retorna informaÃ§Ãµes bÃ¡sicas de cada issue
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     *
     * PARÃ‚METROS OPCIONAIS:
     * - state: Estado das issues (open, closed, all) - padrÃ£o: open
     * - page: PÃ¡gina da listagem (padrÃ£o: 1)
     * - limit: Itens por pÃ¡gina (padrÃ£o: 30, mÃ¡ximo: 100)
     *
     * VALIDAÃ‡Ã•ES:
     * - e repo obrigatÃ³rios
     * - State deve ser um dos valores vÃ¡lidos
     * - Page deve ser >= 1
     * - Limit deve ser entre 1 e 100
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use paginaÃ§Ã£o para repositÃ³rios com muitas issues
     * - Monitore nÃºmero total de issues
     * - Filtre por estado para organizaÃ§Ã£o
     * - Mantenha issues organizadas
     */
    listIssues(params: IssuesInput, provider: VcsOperations, owner: string): Promise<IssuesResult>;
    /**
     * ObtÃ©m detalhes de uma issue especÃ­fica
     *
     * FUNCIONALIDADE:
     * - Retorna informaÃ§Ãµes completas da issue
     * - Inclui tÃ­tulo, descriÃ§Ã£o, labels, assignees
     * - Mostra histÃ³rico de comentÃ¡rios
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - issue_number: NÃºmero da issue
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Issue deve existir no repositÃ³rio
     * - NÃºmero deve ser vÃ¡lido
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use para obter detalhes completos
     * - Verifique status e labels
     * - Analise comentÃ¡rios e histÃ³rico
     * - Monitore mudanÃ§as importantes
     */
    getIssue(params: IssuesInput, provider: VcsOperations, owner: string): Promise<IssuesResult>;
    /**
     * Atualiza uma issue existente
     *
     * FUNCIONALIDADE:
     * - Atualiza campos da issue
     * - Suporta mudanÃ§a de estado
     * - Permite alteraÃ§Ã£o de labels e assignees
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - issue_number: NÃºmero da issue
     *
     * PARÃ‚METROS OPCIONAIS:
     * - new_title: Novo tÃ­tulo
     * - new_body: Nova descriÃ§Ã£o
     * - new_state: Novo estado
     * - new_labels: Novos labels
     * - new_assignees: Novos responsÃ¡veis
     * - new_milestone: Novo milestone
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Issue deve existir
     * - Pelo menos um campo deve ser atualizado
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Atualize apenas campos necessÃ¡rios
     * - Use mensagens de commit descritivas
     * - Documente mudanÃ§as importantes
     * - Notifique responsÃ¡veis sobre mudanÃ§as
     */
    updateIssue(params: IssuesInput, provider: VcsOperations, owner: string): Promise<IssuesResult>;
    /**
     * Fecha uma issue
     *
     * FUNCIONALIDADE:
     * - Altera estado da issue para closed
     * - MantÃ©m histÃ³rico e comentÃ¡rios
     * - Permite reabertura posterior
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - issue_number: NÃºmero da issue
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Issue deve existir
     * - Issue deve estar aberta
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Confirme que issue foi resolvida
     * - Documente soluÃ§Ã£o aplicada
     * - Use comentÃ¡rio explicativo
     * - Verifique se nÃ£o hÃ¡ dependÃªncias
     */
    closeIssue(params: IssuesInput, provider: VcsOperations, owner: string): Promise<IssuesResult>;
    /**
     * Adiciona comentÃ¡rio a uma issue
     *
     * FUNCIONALIDADE:
     * - Cria novo comentÃ¡rio na issue
     * - MantÃ©m histÃ³rico de discussÃ£o
     * - Suporta formataÃ§Ã£o Markdown
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - issue_number: NÃºmero da issue
     * - comment_body: ConteÃºdo do comentÃ¡rio
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Issue deve existir
     * - ComentÃ¡rio nÃ£o pode estar vazio
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use comentÃ¡rios para atualizaÃ§Ãµes
     * - Documente progresso e decisÃµes
     * - Use formataÃ§Ã£o Markdown adequadamente
     * - Mantenha comentÃ¡rios relevantes
     */
    addComment(params: IssuesInput, provider: VcsOperations, owner: string): Promise<IssuesResult>;
    /**
     * Busca issues por critÃ©rios especÃ­ficos
     *
     * FUNCIONALIDADE:
     * - Busca issues por conteÃºdo
     * - Filtra por autor, assignee e label
     * - Retorna resultados relevantes
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - query: Termo de busca
     *
     * PARÃ‚METROS OPCIONAIS:
     * - author: Autor das issues
     * - assignee: ResponsÃ¡vel pelas issues
     * - label: Label especÃ­fico
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Query deve ter pelo menos 3 caracteres
     * - RepositÃ³rio deve existir
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use termos de busca especÃ­ficos
     * - Combine filtros para resultados precisos
     * - Analise relevÃ¢ncia dos resultados
     * - Use para encontrar issues relacionadas
     */
    searchIssues(params: IssuesInput, provider: VcsOperations, owner: string): Promise<IssuesResult>;
    /**
     * Verifica se erro Ã© relacionado a Git
     */
    isGitRelatedError(errorMessage: string): boolean;
};
export {};
//# sourceMappingURL=git-issues.d.ts.map