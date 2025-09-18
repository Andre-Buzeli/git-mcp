import { z } from 'zod';
import { VcsOperations } from '../providers/index.js';
/**
 * Tool: pulls
 *
 * DESCRIÇÃO:
 * Gerenciamento completo de pull requests com suporte multi-provider (GitHub e Gitea)
 *
 * FUNCIONALIDADES:
 * - Criação de novos pull requests
 * - Listagem e busca de PRs
 * - Obtenção de detalhes específicos
 * - Atualização de PRs existentes
 * - Merge de pull requests
 * - Fechamento de PRs
 * - Revisão e aprovação
 * - Busca por conteúdo e status
 *
 * USO:
 * - Para gerenciar integração de código
 * - Para revisão de código
 * - Para controle de qualidade
 * - Para colaboração em equipe
 *
 * RECOMENDAÇÕES:
 * - Use títulos descritivos
 * - Documente mudanças detalhadamente
 * - Revise antes de fazer merge
 * - Mantenha PRs pequenos e focados
 */
/**
 * Schema de validação para entrada da tool pulls
 *
 * VALIDAÇÕES:
 * - action: Ação obrigatória (create, list, get, update, merge, close, review, search)
 * - Parâmetros específicos por ação
 * - Validação de tipos e formatos
 *
 * RECOMENDAÇÕES:
 * - Sempre valide entrada antes de usar
 * - Use parâmetros opcionais adequadamente
 * - Documente parâmetros obrigatórios
 */
declare const PullsInputSchema: z.ZodObject<{
    action: z.ZodEnum<["create", "list", "get", "update", "merge", "close", "review", "search"]>;
    repo: z.ZodString;
    provider: z.ZodEnum<["gitea", "github"]>;
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
 * Schema de saída padronizado
 *
 * ESTRUTURA:
 * - success: Status da operação
 * - action: Ação executada
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
 * DESCRIÇÃO:
 * Gerenciamento completo de Pull Requests Gitea com múltiplas ações
 *
 * ACTIONS DISPONÍVEIS:
 *
 * 1. create - Criar novo Pull Request
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - title (obrigatório): Título do PR
 *    - body (opcional): Descrição detalhada
 *    - head (obrigatório): Branch de origem
 *    - base (obrigatório): Branch de destino
 *    - draft (opcional): Se é um draft PR
 *    - labels (opcional): Array de labels
 *    - assignees (opcional): Array de usuários responsáveis
 *    - reviewers (opcional): Array de revisores
 *    - milestone (opcional): ID do milestone
 *
 * 2. list - Listar Pull Requests
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - state (opcional): Estado dos PRs (open, closed, merged, all) - padrão: open
 *    - page (opcional): Página da listagem (padrão: 1)
 *    - limit (opcional): Itens por página (padrão: 30, máximo: 100)
 *
 * 3. get - Obter detalhes do Pull Request
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - pull_number (obrigatório): Número do PR
 *
 * 4. update - Atualizar Pull Request existente
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - pull_number (obrigatório): Número do PR
 *    - new_title (opcional): Novo título
 *    - new_body (opcional): Nova descrição
 *    - new_base (opcional): Nova branch base
 *    - new_labels (opcional): Novos labels
 *    - new_assignees (opcional): Novos responsáveis
 *    - new_milestone (opcional): Novo milestone
 *
 * 5. merge - Fazer merge do Pull Request
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - pull_number (obrigatório): Número do PR
 *    - merge_method (opcional): Método de merge (merge, rebase, squash)
 *    - merge_commit_title (opcional): Título do commit de merge
 *    - merge_commit_message (opcional): Mensagem do commit de merge
 *
 * 6. close - Fechar Pull Request
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - pull_number (obrigatório): Número do PR
 *
 * 7. review - Adicionar review ao Pull Request
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - pull_number (obrigatório): Número do PR
 *    - review_event (obrigatório): Tipo de review (APPROVE, REQUEST_CHANGES, COMMENT)
 *    - review_body (opcional): Comentário do review
 *
 * 8. search - Buscar Pull Requests
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - query (obrigatório): Termo de busca
 *    - author (opcional): Autor dos PRs
 *    - assignee (opcional): Responsável pelos PRs
 *    - reviewer (opcional): Revisor dos PRs
 *    - label (opcional): Label específico
 *
 * RECOMENDAÇÕES DE USO:
 * - Use títulos descritivos e claros
 * - Documente mudanças detalhadamente
 * - Solicite reviews adequados
 * - Mantenha PRs pequenos e focados
 * - Use labels para categorização
 * - Atribua responsáveis adequadamente
 * - Escolha método de merge apropriado
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
    handler(input: PullsInput): Promise<PullsResult>;
    /**
     * Cria um novo Pull Request
     *
     * FUNCIONALIDADE:
     * - Cria PR com título e descrição
     * - Suporta configuração de branches
     * - Permite configuração de draft, labels, assignees
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - title: Título do PR
     * - head: Branch de origem
     * - base: Branch de destino
     *
     * PARÂMETROS OPCIONAIS:
     * - body: Descrição detalhada
     * - draft: Se é um draft PR
     * - labels: Array de labels para categorização
     * - assignees: Array de usuários responsáveis
     * - reviewers: Array de revisores
     * - milestone: ID do milestone associado
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Branches devem existir
     * - Head e base devem ser diferentes
     * - Usuário deve ter permissão de escrita
     *
     * RECOMENDAÇÕES:
     * - Use títulos descritivos e claros
     * - Documente mudanças detalhadamente
     * - Solicite reviews adequados
     * - Mantenha PRs pequenos e focados
     */
    createPullRequest(params: PullsInput, provider: VcsOperations, owner: string): Promise<PullsResult>;
    /**
     * Lista Pull Requests do repositório
     *
     * FUNCIONALIDADE:
     * - Lista PRs com filtros de estado
     * - Suporta paginação
     * - Retorna informações básicas de cada PR
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     *
     * PARÂMETROS OPCIONAIS:
     * - state: Estado dos PRs (open, closed, merged, all) - padrão: open
     * - page: Página da listagem (padrão: 1)
     * - limit: Itens por página (padrão: 30, máximo: 100)
     *
     * VALIDAÇÕES:
     * - e repo obrigatórios
     * - State deve ser um dos valores válidos
     * - Page deve ser >= 1
     * - Limit deve ser entre 1 e 100
     *
     * RECOMENDAÇÕES:
     * - Use paginação para repositórios com muitos PRs
     * - Monitore número total de PRs
     * - Filtre por estado para organização
     * - Mantenha PRs organizados
     */
    listPullRequests(params: PullsInput, provider: VcsOperations, owner: string): Promise<PullsResult>;
    /**
     * Obtém detalhes de um Pull Request específico
     *
     * FUNCIONALIDADE:
     * - Retorna informações completas do PR
     * - Inclui título, descrição, branches, labels
     * - Mostra status de merge e conflitos
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - pull_number: Número do PR
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - PR deve existir no repositório
     * - Número deve ser válido
     *
     * RECOMENDAÇÕES:
     * - Use para obter detalhes completos
     * - Verifique status de merge
     * - Analise conflitos se houver
     * - Monitore mudanças importantes
     */
    getPullRequest(params: PullsInput, provider: VcsOperations, owner: string): Promise<PullsResult>;
    /**
     * Atualiza um Pull Request existente
     *
     * FUNCIONALIDADE:
     * - Atualiza campos do PR
     * - Suporta mudança de branch base
     * - Permite alteração de labels e assignees
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - pull_number: Número do PR
     *
     * PARÂMETROS OPCIONAIS:
     * - new_title: Novo título
     * - new_body: Nova descrição
     * - new_base: Nova branch base
     * - new_labels: Novos labels
     * - new_assignees: Novos responsáveis
     * - new_milestone: Novo milestone
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - PR deve existir
     * - Pelo menos um campo deve ser atualizado
     *
     * RECOMENDAÇÕES:
     * - Atualize apenas campos necessários
     * - Use mensagens de commit descritivas
     * - Documente mudanças importantes
     * - Notifique responsáveis sobre mudanças
     */
    updatePullRequest(params: PullsInput, provider: VcsOperations, owner: string): Promise<PullsResult>;
    /**
     * Faz merge de um Pull Request
     *
     * FUNCIONALIDADE:
     * - Merge do PR na branch base
     * - Suporta diferentes métodos de merge
     * - Permite customização de commit de merge
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - pull_number: Número do PR
     *
     * PARÂMETROS OPCIONAIS:
     * - merge_method: Método de merge (merge, rebase, squash)
     * - merge_commit_title: Título do commit de merge
     * - merge_commit_message: Mensagem do commit de merge
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - PR deve existir e estar aberto
     * - Não deve haver conflitos
     * - PR deve ser mergeable
     *
     * RECOMENDAÇÕES:
     * - Resolva conflitos antes do merge
     * - Escolha método de merge adequado
     * - Use títulos e mensagens descritivas
     * - Teste após o merge
     */
    mergePullRequest(params: PullsInput, provider: VcsOperations, owner: string): Promise<PullsResult>;
    /**
     * Fecha um Pull Request
     *
     * FUNCIONALIDADE:
     * - Altera estado do PR para closed
     * - Mantém histórico e comentários
     * - Permite reabertura posterior
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - pull_number: Número do PR
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - PR deve existir
     * - PR deve estar aberto
     *
     * RECOMENDAÇÕES:
     * - Confirme que PR não é mais necessário
     * - Documente motivo do fechamento
     * - Use comentário explicativo
     * - Verifique se não há dependências
     */
    closePullRequest(params: PullsInput, provider: VcsOperations, owner: string): Promise<PullsResult>;
    /**
     * Adiciona review a um Pull Request
     *
     * FUNCIONALIDADE:
     * - Cria novo review no PR
     * - Suporta diferentes tipos de review
     * - Mantém histórico de revisões
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - pull_number: Número do PR
     * - review_event: Tipo de review (APPROVE, REQUEST_CHANGES, COMMENT)
     *
     * PARÂMETROS OPCIONAIS:
     * - review_body: Comentário do review
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - PR deve existir
     * - Review event deve ser válido
     *
     * RECOMENDAÇÕES:
     * - Use reviews para controle de qualidade
     * - Documente feedback adequadamente
     * - Use tipos de review apropriados
     * - Mantenha reviews construtivos
     */
    addReview(params: PullsInput, provider: VcsOperations, owner: string): Promise<PullsResult>;
    /**
     * Busca Pull Requests por critérios específicos
     *
     * FUNCIONALIDADE:
     * - Busca PRs por conteúdo
     * - Filtra por autor, assignee, reviewer e label
     * - Retorna resultados relevantes
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - query: Termo de busca
     *
     * PARÂMETROS OPCIONAIS:
     * - author: Autor dos PRs
     * - assignee: Responsável pelos PRs
     * - reviewer: Revisor dos PRs
     * - label: Label específico
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Query deve ter pelo menos 3 caracteres
     * - Repositório deve existir
     *
     * RECOMENDAÇÕES:
     * - Use termos de busca específicos
     * - Combine filtros para resultados precisos
     * - Analise relevância dos resultados
     * - Use para encontrar PRs relacionados
     */
    searchPullRequests(params: PullsInput, provider: VcsOperations, owner: string): Promise<PullsResult>;
};
export {};
//# sourceMappingURL=git-pulls.d.ts.map