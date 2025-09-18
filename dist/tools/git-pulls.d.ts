import { z } from 'zod';
import { VcsOperations } from '../providers/index.js';
/**
 * Tool: pulls
 *
 * DESCRIÃ‡ÃƒO:
 * Gerenciamento completo de pull requests com suporte multi-provider (GitHub e Gitea)
 *
 * FUNCIONALIDADES:
 * - CriaÃ§Ã£o de novos pull requests
 * - Listagem e busca de PRs
 * - ObtenÃ§Ã£o de detalhes especÃ­ficos
 * - AtualizaÃ§Ã£o de PRs existentes
 * - Merge de pull requests
 * - Fechamento de PRs
 * - RevisÃ£o e aprovaÃ§Ã£o
 * - Busca por conteÃºdo e status
 *
 * USO:
 * - Para gerenciar integraÃ§Ã£o de cÃ³digo
 * - Para revisÃ£o de cÃ³digo
 * - Para controle de qualidade
 * - Para colaboraÃ§Ã£o em equipe
 *
 * RECOMENDAÃ‡Ã•ES:
 * - Use tÃ­tulos descritivos
 * - Documente mudanÃ§as detalhadamente
 * - Revise antes de fazer merge
 * - Mantenha PRs pequenos e focados
 */
/**
 * Schema de validaÃ§Ã£o para entrada da tool pulls
 *
 * VALIDAÃ‡Ã•ES:
 * - action: AÃ§Ã£o obrigatÃ³ria (create, list, get, update, merge, close, review, search)
 * - ParÃ¢metros especÃ­ficos por aÃ§Ã£o
 * - ValidaÃ§Ã£o de tipos e formatos
 *
 * RECOMENDAÃ‡Ã•ES:
 * - Sempre valide entrada antes de usar
 * - Use parÃ¢metros opcionais adequadamente
 * - Documente parÃ¢metros obrigatÃ³rios
 */
declare const PullsInputSchema: z.ZodObject<{
    action: z.ZodEnum<["create", "list", "get", "update", "merge", "close", "review", "search"]>;
    repo: z.ZodString;
    provider: z.ZodEnum<["gitea", "github"]>;
    projectPath: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    body: z.ZodOptional<z.ZodString>;
    head: z.ZodOptional<z.ZodString>;
    base: z.ZodOptional<z.ZodString>;
    draft: z.ZodOptional<z.ZodBoolean>;
    labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    assignees: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    reviewers: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    milestone: z.ZodOptional<z.ZodNumber>;
    pull_number: z.ZodOptional<z.ZodNumber>;
    state: z.ZodOptional<z.ZodEnum<["open", "closed", "merged", "all"]>>;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    new_title: z.ZodOptional<z.ZodString>;
    new_body: z.ZodOptional<z.ZodString>;
    new_base: z.ZodOptional<z.ZodString>;
    new_labels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    new_assignees: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    new_milestone: z.ZodOptional<z.ZodNumber>;
    merge_method: z.ZodOptional<z.ZodEnum<["merge", "rebase", "squash"]>>;
    merge_commit_title: z.ZodOptional<z.ZodString>;
    merge_commit_message: z.ZodOptional<z.ZodString>;
    review_event: z.ZodOptional<z.ZodEnum<["APPROVE", "REQUEST_CHANGES", "COMMENT"]>>;
    review_body: z.ZodOptional<z.ZodString>;
    query: z.ZodOptional<z.ZodString>;
    author: z.ZodOptional<z.ZodString>;
    assignee: z.ZodOptional<z.ZodString>;
    reviewer: z.ZodOptional<z.ZodString>;
    label: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    provider: "gitea" | "github";
    repo: string;
    action: "merge" | "get" | "search" | "list" | "create" | "close" | "update" | "review";
    projectPath: string;
    title?: string | undefined;
    body?: string | undefined;
    state?: "open" | "closed" | "merged" | "all" | undefined;
    assignees?: string[] | undefined;
    labels?: string[] | undefined;
    head?: string | undefined;
    base?: string | undefined;
    draft?: boolean | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    query?: string | undefined;
    author?: string | undefined;
    merge_method?: "merge" | "rebase" | "squash" | undefined;
    milestone?: number | undefined;
    new_title?: string | undefined;
    new_body?: string | undefined;
    new_labels?: string[] | undefined;
    new_assignees?: string[] | undefined;
    new_milestone?: number | undefined;
    assignee?: string | undefined;
    label?: string | undefined;
    reviewers?: string[] | undefined;
    pull_number?: number | undefined;
    new_base?: string | undefined;
    merge_commit_title?: string | undefined;
    merge_commit_message?: string | undefined;
    review_event?: "APPROVE" | "REQUEST_CHANGES" | "COMMENT" | undefined;
    review_body?: string | undefined;
    reviewer?: string | undefined;
}, {
    provider: "gitea" | "github";
    repo: string;
    action: "merge" | "get" | "search" | "list" | "create" | "close" | "update" | "review";
    projectPath: string;
    title?: string | undefined;
    body?: string | undefined;
    state?: "open" | "closed" | "merged" | "all" | undefined;
    assignees?: string[] | undefined;
    labels?: string[] | undefined;
    head?: string | undefined;
    base?: string | undefined;
    draft?: boolean | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    query?: string | undefined;
    author?: string | undefined;
    merge_method?: "merge" | "rebase" | "squash" | undefined;
    milestone?: number | undefined;
    new_title?: string | undefined;
    new_body?: string | undefined;
    new_labels?: string[] | undefined;
    new_assignees?: string[] | undefined;
    new_milestone?: number | undefined;
    assignee?: string | undefined;
    label?: string | undefined;
    reviewers?: string[] | undefined;
    pull_number?: number | undefined;
    new_base?: string | undefined;
    merge_commit_title?: string | undefined;
    merge_commit_message?: string | undefined;
    review_event?: "APPROVE" | "REQUEST_CHANGES" | "COMMENT" | undefined;
    review_body?: string | undefined;
    reviewer?: string | undefined;
}>;
export type PullsInput = z.infer<typeof PullsInputSchema>;
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
declare const PullsResultSchema: z.ZodObject<{
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
export type PullsResult = z.infer<typeof PullsResultSchema>;
/**
 * Tool: pulls
 *
 * DESCRIÃ‡ÃƒO:
 * Gerenciamento completo de Pull Requests Gitea com mÃºltiplas aÃ§Ãµes
 *
 * ACTIONS DISPONÃVEIS:
 *
 * 1. create - Criar novo Pull Request
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - title (obrigatÃ³rio): TÃ­tulo do PR
 *    - body (opcional): DescriÃ§Ã£o detalhada
 *    - head (obrigatÃ³rio): Branch de origem
 *    - base (obrigatÃ³rio): Branch de destino
 *    - draft (opcional): Se Ã© um draft PR
 *    - labels (opcional): Array de labels
 *    - assignees (opcional): Array de usuÃ¡rios responsÃ¡veis
 *    - reviewers (opcional): Array de revisores
 *    - milestone (opcional): ID do milestone
 *
 * 2. list - Listar Pull Requests
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - state (opcional): Estado dos PRs (open, closed, merged, all) - padrÃ£o: open
 *    - page (opcional): PÃ¡gina da listagem (padrÃ£o: 1)
 *    - limit (opcional): Itens por pÃ¡gina (padrÃ£o: 30, mÃ¡ximo: 100)
 *
 * 3. get - Obter detalhes do Pull Request
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - pull_number (obrigatÃ³rio): NÃºmero do PR
 *
 * 4. update - Atualizar Pull Request existente
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - pull_number (obrigatÃ³rio): NÃºmero do PR
 *    - new_title (opcional): Novo tÃ­tulo
 *    - new_body (opcional): Nova descriÃ§Ã£o
 *    - new_base (opcional): Nova branch base
 *    - new_labels (opcional): Novos labels
 *    - new_assignees (opcional): Novos responsÃ¡veis
 *    - new_milestone (opcional): Novo milestone
 *
 * 5. merge - Fazer merge do Pull Request
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - pull_number (obrigatÃ³rio): NÃºmero do PR
 *    - merge_method (opcional): MÃ©todo de merge (merge, rebase, squash)
 *    - merge_commit_title (opcional): TÃ­tulo do commit de merge
 *    - merge_commit_message (opcional): Mensagem do commit de merge
 *
 * 6. close - Fechar Pull Request
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - pull_number (obrigatÃ³rio): NÃºmero do PR
 *
 * 7. review - Adicionar review ao Pull Request
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - pull_number (obrigatÃ³rio): NÃºmero do PR
 *    - review_event (obrigatÃ³rio): Tipo de review (APPROVE, REQUEST_CHANGES, COMMENT)
 *    - review_body (opcional): ComentÃ¡rio do review
 *
 * 8. search - Buscar Pull Requests
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - query (obrigatÃ³rio): Termo de busca
 *    - author (opcional): Autor dos PRs
 *    - assignee (opcional): ResponsÃ¡vel pelos PRs
 *    - reviewer (opcional): Revisor dos PRs
 *    - label (opcional): Label especÃ­fico
 *
 * RECOMENDAÃ‡Ã•ES DE USO:
 * - Use tÃ­tulos descritivos e claros
 * - Documente mudanÃ§as detalhadamente
 * - Solicite reviews adequados
 * - Mantenha PRs pequenos e focados
 * - Use labels para categorizaÃ§Ã£o
 * - Atribua responsÃ¡veis adequadamente
 * - Escolha mÃ©todo de merge apropriado
 */
export declare const pullsTool: {
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
            head: {
                type: string;
                description: string;
            };
            base: {
                type: string;
                description: string;
            };
            draft: {
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
            reviewers: {
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
            pull_number: {
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
            new_base: {
                type: string;
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
            merge_method: {
                type: string;
                enum: string[];
                description: string;
            };
            merge_commit_title: {
                type: string;
                description: string;
            };
            merge_commit_message: {
                type: string;
                description: string;
            };
            review_event: {
                type: string;
                enum: string[];
                description: string;
            };
            review_body: {
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
            reviewer: {
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
     * Handler principal da tool pulls
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
    handler(input: PullsInput): Promise<PullsResult>;
    /**
     * Cria um novo Pull Request
     *
     * FUNCIONALIDADE:
     * - Cria PR com tÃ­tulo e descriÃ§Ã£o
     * - Suporta configuraÃ§Ã£o de branches
     * - Permite configuraÃ§Ã£o de draft, labels, assignees
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - title: TÃ­tulo do PR
     * - head: Branch de origem
     * - base: Branch de destino
     *
     * PARÃ‚METROS OPCIONAIS:
     * - body: DescriÃ§Ã£o detalhada
     * - draft: Se Ã© um draft PR
     * - labels: Array de labels para categorizaÃ§Ã£o
     * - assignees: Array de usuÃ¡rios responsÃ¡veis
     * - reviewers: Array de revisores
     * - milestone: ID do milestone associado
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Branches devem existir
     * - Head e base devem ser diferentes
     * - UsuÃ¡rio deve ter permissÃ£o de escrita
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use tÃ­tulos descritivos e claros
     * - Documente mudanÃ§as detalhadamente
     * - Solicite reviews adequados
     * - Mantenha PRs pequenos e focados
     */
    createPullRequest(params: PullsInput, provider: VcsOperations, owner: string): Promise<PullsResult>;
    /**
     * Lista Pull Requests do repositÃ³rio
     *
     * FUNCIONALIDADE:
     * - Lista PRs com filtros de estado
     * - Suporta paginaÃ§Ã£o
     * - Retorna informaÃ§Ãµes bÃ¡sicas de cada PR
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     *
     * PARÃ‚METROS OPCIONAIS:
     * - state: Estado dos PRs (open, closed, merged, all) - padrÃ£o: open
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
     * - Use paginaÃ§Ã£o para repositÃ³rios com muitos PRs
     * - Monitore nÃºmero total de PRs
     * - Filtre por estado para organizaÃ§Ã£o
     * - Mantenha PRs organizados
     */
    listPullRequests(params: PullsInput, provider: VcsOperations, owner: string): Promise<PullsResult>;
    /**
     * ObtÃ©m detalhes de um Pull Request especÃ­fico
     *
     * FUNCIONALIDADE:
     * - Retorna informaÃ§Ãµes completas do PR
     * - Inclui tÃ­tulo, descriÃ§Ã£o, branches, labels
     * - Mostra status de merge e conflitos
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - pull_number: NÃºmero do PR
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - PR deve existir no repositÃ³rio
     * - NÃºmero deve ser vÃ¡lido
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use para obter detalhes completos
     * - Verifique status de merge
     * - Analise conflitos se houver
     * - Monitore mudanÃ§as importantes
     */
    getPullRequest(params: PullsInput, provider: VcsOperations, owner: string): Promise<PullsResult>;
    /**
     * Atualiza um Pull Request existente
     *
     * FUNCIONALIDADE:
     * - Atualiza campos do PR
     * - Suporta mudanÃ§a de branch base
     * - Permite alteraÃ§Ã£o de labels e assignees
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - pull_number: NÃºmero do PR
     *
     * PARÃ‚METROS OPCIONAIS:
     * - new_title: Novo tÃ­tulo
     * - new_body: Nova descriÃ§Ã£o
     * - new_base: Nova branch base
     * - new_labels: Novos labels
     * - new_assignees: Novos responsÃ¡veis
     * - new_milestone: Novo milestone
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - PR deve existir
     * - Pelo menos um campo deve ser atualizado
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Atualize apenas campos necessÃ¡rios
     * - Use mensagens de commit descritivas
     * - Documente mudanÃ§as importantes
     * - Notifique responsÃ¡veis sobre mudanÃ§as
     */
    updatePullRequest(params: PullsInput, provider: VcsOperations, owner: string): Promise<PullsResult>;
    /**
     * Faz merge de um Pull Request
     *
     * FUNCIONALIDADE:
     * - Merge do PR na branch base
     * - Suporta diferentes mÃ©todos de merge
     * - Permite customizaÃ§Ã£o de commit de merge
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - pull_number: NÃºmero do PR
     *
     * PARÃ‚METROS OPCIONAIS:
     * - merge_method: MÃ©todo de merge (merge, rebase, squash)
     * - merge_commit_title: TÃ­tulo do commit de merge
     * - merge_commit_message: Mensagem do commit de merge
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - PR deve existir e estar aberto
     * - NÃ£o deve haver conflitos
     * - PR deve ser mergeable
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Resolva conflitos antes do merge
     * - Escolha mÃ©todo de merge adequado
     * - Use tÃ­tulos e mensagens descritivas
     * - Teste apÃ³s o merge
     */
    mergePullRequest(params: PullsInput, provider: VcsOperations, owner: string): Promise<PullsResult>;
    /**
     * Fecha um Pull Request
     *
     * FUNCIONALIDADE:
     * - Altera estado do PR para closed
     * - MantÃ©m histÃ³rico e comentÃ¡rios
     * - Permite reabertura posterior
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - pull_number: NÃºmero do PR
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - PR deve existir
     * - PR deve estar aberto
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Confirme que PR nÃ£o Ã© mais necessÃ¡rio
     * - Documente motivo do fechamento
     * - Use comentÃ¡rio explicativo
     * - Verifique se nÃ£o hÃ¡ dependÃªncias
     */
    closePullRequest(params: PullsInput, provider: VcsOperations, owner: string): Promise<PullsResult>;
    /**
     * Adiciona review a um Pull Request
     *
     * FUNCIONALIDADE:
     * - Cria novo review no PR
     * - Suporta diferentes tipos de review
     * - MantÃ©m histÃ³rico de revisÃµes
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - pull_number: NÃºmero do PR
     * - review_event: Tipo de review (APPROVE, REQUEST_CHANGES, COMMENT)
     *
     * PARÃ‚METROS OPCIONAIS:
     * - review_body: ComentÃ¡rio do review
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - PR deve existir
     * - Review event deve ser vÃ¡lido
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use reviews para controle de qualidade
     * - Documente feedback adequadamente
     * - Use tipos de review apropriados
     * - Mantenha reviews construtivos
     */
    addReview(params: PullsInput, provider: VcsOperations, owner: string): Promise<PullsResult>;
    /**
     * Busca Pull Requests por critÃ©rios especÃ­ficos
     *
     * FUNCIONALIDADE:
     * - Busca PRs por conteÃºdo
     * - Filtra por autor, assignee, reviewer e label
     * - Retorna resultados relevantes
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - query: Termo de busca
     *
     * PARÃ‚METROS OPCIONAIS:
     * - author: Autor dos PRs
     * - assignee: ResponsÃ¡vel pelos PRs
     * - reviewer: Revisor dos PRs
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
     * - Use para encontrar PRs relacionados
     */
    searchPullRequests(params: PullsInput, provider: VcsOperations, owner: string): Promise<PullsResult>;
    /**
     * Verifica se erro Ã© relacionado a Git
     */
    isGitRelatedError(errorMessage: string): boolean;
};
export {};
//# sourceMappingURL=git-pulls.d.ts.map