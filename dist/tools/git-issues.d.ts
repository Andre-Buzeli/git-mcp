import { z } from 'zod';
import { VcsOperations } from '../providers/index.js';
/**
 * Tool: issues
 *
 * DESCRIÇÃO:
 * Gerenciamento completo de issues com suporte multi-provider (GitHub e Gitea)
 *
 * FUNCIONALIDADES:
 * - Criação de novas issues
 * - Listagem e busca de issues
 * - Obtenção de detalhes específicos
 * - Atualização de issues existentes
 * - Fechamento de issues
 * - Adição de comentários
 * - Busca por conteúdo e status
 *
 * USO:
 * - Para gerenciar bugs e features
 * - Para acompanhar progresso de desenvolvimento
 * - Para comunicação entre equipe
 * - Para controle de qualidade
 *
 * RECOMENDAÇÕES:
 * - Use títulos descritivos
 * - Documente detalhes completos
 * - Atualize status regularmente
 * - Use labels adequadamente
 */
/**
 * Schema de validação para entrada da tool issues
 *
 * VALIDAÇÕES:
 * - action: Ação obrigatória (create, list, get, update, close, comment, search)
 * - Parâmetros específicos por ação
 * - Validação de tipos e formatos
 *
 * RECOMENDAÇÕES:
 * - Sempre valide entrada antes de usar
 * - Use parâmetros opcionais adequadamente
 * - Documente parâmetros obrigatórios
 */
declare const IssuesInputSchema: z.ZodObject<{
    action: z.ZodEnum<["create", "list", "get", "update", "close", "comment", "search"]>;
    repo: z.ZodString;
    provider: z.ZodEnum<["gitea", "github"]>;
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
    title?: string | undefined;
    body?: string | undefined;
    state?: "open" | "closed" | "all" | undefined;
    assignees?: string[] | undefined;
    labels?: string[] | undefined;
    author?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    query?: string | undefined;
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
    title?: string | undefined;
    body?: string | undefined;
    state?: "open" | "closed" | "all" | undefined;
    assignees?: string[] | undefined;
    labels?: string[] | undefined;
    author?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    query?: string | undefined;
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
 * Schema de saída padronizado
 *
 * ESTRUTURA:
 * - success: Status da operação
 * - action: Ação executada
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
 * DESCRIÇÃO:
 * Gerenciamento completo de issues Gitea com múltiplas ações
 *
 * ACTIONS DISPONÍVEIS:
 *
 * 1. create - Criar nova issue
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - title (obrigatório): Título da issue
 *    - body (opcional): Descrição detalhada
 *    - labels (opcional): Array de labels
 *    - assignees (opcional): Array de usuários responsáveis
 *    - milestone (opcional): ID do milestone
 *
 * 2. list - Listar issues
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - state (opcional): Estado das issues (open, closed, all) - padrão: open
 *    - page (opcional): Página da listagem (padrão: 1)
 *    - limit (opcional): Itens por página (padrão: 30, máximo: 100)
 *
 * 3. get - Obter detalhes da issue
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - issue_number (obrigatório): Número da issue
 *
 * 4. update - Atualizar issue existente
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - issue_number (obrigatório): Número da issue
 *    - new_title (opcional): Novo título
 *    - new_body (opcional): Nova descrição
 *    - new_state (opcional): Novo estado
 *    - new_labels (opcional): Novos labels
 *    - new_assignees (opcional): Novos responsáveis
 *    - new_milestone (opcional): Novo milestone
 *
 * 5. close - Fechar issue
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - issue_number (obrigatório): Número da issue
 *
 * 6. comment - Adicionar comentário
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - issue_number (obrigatório): Número da issue
 *    - comment_body (obrigatório): Conteúdo do comentário
 *
 * 7. search - Buscar issues
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - query (obrigatório): Termo de busca
 *    - author (opcional): Autor das issues
 *    - assignee (opcional): Responsável pelas issues
 *    - label (opcional): Label específico
 *
 * RECOMENDAÇÕES DE USO:
 * - Use títulos descritivos e claros
 * - Documente detalhes completos na descrição
 * - Atualize status regularmente
 * - Use labels para categorização
 * - Atribua responsáveis adequadamente
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
    handler(input: IssuesInput): Promise<IssuesResult>;
    /**
     * Cria uma nova issue no repositório
     *
     * FUNCIONALIDADE:
     * - Cria issue com título e descrição
     * - Suporta labels, assignees e milestone
     * - Retorna detalhes da issue criada
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - title: Título da issue
     *
     * PARÂMETROS OPCIONAIS:
     * - body: Descrição detalhada
     * - labels: Array de labels para categorização
     * - assignees: Array de usuários responsáveis
     * - milestone: ID do milestone associado
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Título deve ser único no repositório
     * - Labels devem existir no repositório
     * - Assignees devem ser usuários válidos
     *
     * RECOMENDAÇÕES:
     * - Use títulos descritivos e claros
     * - Documente detalhes completos
     * - Use labels para categorização
     * - Atribua responsáveis adequadamente
     */
    createIssue(params: IssuesInput, provider: VcsOperations, owner: string): Promise<IssuesResult>;
    /**
     * Lista issues do repositório
     *
     * FUNCIONALIDADE:
     * - Lista issues com filtros de estado
     * - Suporta paginação
     * - Retorna informações básicas de cada issue
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     *
     * PARÂMETROS OPCIONAIS:
     * - state: Estado das issues (open, closed, all) - padrão: open
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
     * - Use paginação para repositórios com muitas issues
     * - Monitore número total de issues
     * - Filtre por estado para organização
     * - Mantenha issues organizadas
     */
    listIssues(params: IssuesInput, provider: VcsOperations, owner: string): Promise<IssuesResult>;
    /**
     * Obtém detalhes de uma issue específica
     *
     * FUNCIONALIDADE:
     * - Retorna informações completas da issue
     * - Inclui título, descrição, labels, assignees
     * - Mostra histórico de comentários
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - issue_number: Número da issue
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Issue deve existir no repositório
     * - Número deve ser válido
     *
     * RECOMENDAÇÕES:
     * - Use para obter detalhes completos
     * - Verifique status e labels
     * - Analise comentários e histórico
     * - Monitore mudanças importantes
     */
    getIssue(params: IssuesInput, provider: VcsOperations, owner: string): Promise<IssuesResult>;
    /**
     * Atualiza uma issue existente
     *
     * FUNCIONALIDADE:
     * - Atualiza campos da issue
     * - Suporta mudança de estado
     * - Permite alteração de labels e assignees
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - issue_number: Número da issue
     *
     * PARÂMETROS OPCIONAIS:
     * - new_title: Novo título
     * - new_body: Nova descrição
     * - new_state: Novo estado
     * - new_labels: Novos labels
     * - new_assignees: Novos responsáveis
     * - new_milestone: Novo milestone
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Issue deve existir
     * - Pelo menos um campo deve ser atualizado
     *
     * RECOMENDAÇÕES:
     * - Atualize apenas campos necessários
     * - Use mensagens de commit descritivas
     * - Documente mudanças importantes
     * - Notifique responsáveis sobre mudanças
     */
    updateIssue(params: IssuesInput, provider: VcsOperations, owner: string): Promise<IssuesResult>;
    /**
     * Fecha uma issue
     *
     * FUNCIONALIDADE:
     * - Altera estado da issue para closed
     * - Mantém histórico e comentários
     * - Permite reabertura posterior
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - issue_number: Número da issue
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Issue deve existir
     * - Issue deve estar aberta
     *
     * RECOMENDAÇÕES:
     * - Confirme que issue foi resolvida
     * - Documente solução aplicada
     * - Use comentário explicativo
     * - Verifique se não há dependências
     */
    closeIssue(params: IssuesInput, provider: VcsOperations, owner: string): Promise<IssuesResult>;
    /**
     * Adiciona comentário a uma issue
     *
     * FUNCIONALIDADE:
     * - Cria novo comentário na issue
     * - Mantém histórico de discussão
     * - Suporta formatação Markdown
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - issue_number: Número da issue
     * - comment_body: Conteúdo do comentário
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Issue deve existir
     * - Comentário não pode estar vazio
     *
     * RECOMENDAÇÕES:
     * - Use comentários para atualizações
     * - Documente progresso e decisões
     * - Use formatação Markdown adequadamente
     * - Mantenha comentários relevantes
     */
    addComment(params: IssuesInput, provider: VcsOperations, owner: string): Promise<IssuesResult>;
    /**
     * Busca issues por critérios específicos
     *
     * FUNCIONALIDADE:
     * - Busca issues por conteúdo
     * - Filtra por autor, assignee e label
     * - Retorna resultados relevantes
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - query: Termo de busca
     *
     * PARÂMETROS OPCIONAIS:
     * - author: Autor das issues
     * - assignee: Responsável pelas issues
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
     * - Use para encontrar issues relacionadas
     */
    searchIssues(params: IssuesInput, provider: VcsOperations, owner: string): Promise<IssuesResult>;
};
export {};
//# sourceMappingURL=git-issues.d.ts.map