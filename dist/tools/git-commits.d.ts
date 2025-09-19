import { z } from 'zod';
import { VcsOperations } from '../providers/index.js';
/**
 * Tool: commits
 *
 * DESCRIÇÃO:
 * Gerenciamento completo de commits com suporte multi-provider (GitHub e Gitea)
 *
 * FUNCIONALIDADES:
 * - Listagem de histórico de commits
 * - Obtenção de detalhes específicos
 * - Criação de novos commits
 * - Comparação entre commits
 * - Busca por mensagens e conteúdo
 * - Análise de mudanças
 *
 * USO:
 * - Para acompanhar histórico de mudanças
 * - Para analisar evolução do código
 * - Para criar commits programaticamente
 * - Para auditoria de mudanças
 *
 * RECOMENDAÇÕES:
 * - Use mensagens de commit descritivas
 * - Mantenha commits atômicos
 * - Documente mudanças importantes
 * - Revise histórico regularmente
 */
/**
 * Schema de validação para entrada da tool commits
 *
 * VALIDAÇÕES:
 * - action: Ação obrigatória (list, get, create, compare, search)
 * - Parâmetros específicos por ação
 * - Validação de tipos e formatos
 *
 * RECOMENDAÇÕES:
 * - Sempre valide entrada antes de usar
 * - Use parâmetros opcionais adequadamente
 * - Documente parâmetros obrigatórios
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
 * Schema de saída padronizado
 *
 * ESTRUTURA:
 * - success: Status da operação
 * - action: Ação executada
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
 * DESCRIÇÃO:
 * Gerenciamento completo de commits Gitea com múltiplas ações
 *
 * ACTIONS DISPONÍVEIS:
 *
 * 1. list - Listar commits
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - sha (opcional): Branch ou commit específico (padrão: branch padrão)
 *    - page (opcional): Página da listagem (padrão: 1)
 *    - limit (opcional): Itens por página (padrão: 30, máximo: 100)
 *
 * 2. get - Obter detalhes do commit
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - commit_sha (obrigatório): SHA do commit
 *
 * 3. create - Criar novo commit
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - message (obrigatório): Mensagem do commit
 *    - branch (obrigatório): Branch de destino
 *    - author_name (opcional): Nome do autor
 *    - author_email (opcional): Email do autor
 *    - committer_name (opcional): Nome do committer
 *    - committer_email (opcional): Email do committer
 *
 * 4. compare - Comparar commits
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - base (obrigatório): Commit base para comparação
 *    - head (obrigatório): Commit para comparar
 *
 * 5. search - Buscar commits
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - query (obrigatório): Termo de busca
 *    - author (opcional): Autor dos commits
 *    - page (opcional): Página da busca (padrão: 1)
 *    - limit (opcional): Itens por página (padrão: 30, máximo: 100)
 *
 * RECOMENDAÇÕES DE USO:
 * - Use mensagens de commit descritivas
 * - Mantenha commits atômicos
 * - Documente mudanças importantes
 * - Revise histórico regularmente
 * - Use branches para features
 * - Mantenha histórico limpo
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
    handler(input: CommitsInput): Promise<CommitsResult>;
    /**
     * Lista commits do repositório
     *
     * FUNCIONALIDADE:
     * - Lista commits com paginação
     * - Suporta filtro por branch ou commit
     * - Retorna informações básicas de cada commit
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     *
     * PARÂMETROS OPCIONAIS:
     * - sha: Branch, tag ou commit específico (padrão: branch padrão)
     * - page: Página da listagem (padrão: 1)
     * - limit: Itens por página (padrão: 30, máximo: 100)
     *
     * VALIDAÇÕES:
     * - e repo obrigatórios
     * - SHA deve ser válido se fornecido
     * - Page deve ser >= 1
     * - Limit deve ser entre 1 e 100
     *
     * RECOMENDAÇÕES:
     * - Use paginação para repositórios grandes
     * - Monitore número total de commits
     * - Use SHA específico para análise
     * - Mantenha histórico organizado
     */
    listCommits(params: CommitsInput, provider: VcsOperations, owner: string): Promise<CommitsResult>;
    /**
     * Obtém detalhes de um commit específico
     *
     * FUNCIONALIDADE:
     * - Obtém informações completas do commit
     * - Inclui detalhes de autor e committer
     * - Mostra arquivos modificados
     * - Retorna hash e mensagem
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - commit_sha: SHA do commit
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - SHA deve ser válido
     * - Commit deve existir
     *
     * RECOMENDAÇÕES:
     * - Use para análise detalhada
     * - Verifique arquivos modificados
     * - Analise mensagem e autor
     * - Documente mudanças importantes
     */
    getCommit(params: CommitsInput, provider: VcsOperations, owner: string): Promise<CommitsResult>;
    /**
     * Cria um novo commit
     *
     * FUNCIONALIDADE:
     * - Cria commit com mensagem personalizada
     * - Suporta autor e committer diferentes
     * - Permite especificar branch de destino
     * - Valida dados obrigatórios
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - message: Mensagem do commit
     * - branch: Branch de destino
     *
     * PARÂMETROS OPCIONAIS:
     * - author_name: Nome do autor
     * - author_email: Email do autor
     * - committer_name: Nome do committer
     * - committer_email: Email do committer
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Mensagem não pode estar vazia
     * - Branch deve existir
     * - Emails devem ser válidos
     *
     * RECOMENDAÇÕES:
     * - Use mensagens descritivas
     * - Mantenha commits atômicos
     * - Documente mudanças importantes
     * - Use branches apropriadas
     */
    createCommit(params: CommitsInput, provider: VcsOperations, owner: string): Promise<CommitsResult>;
    /**
     * Compara dois commits ou branches
     *
     * FUNCIONALIDADE:
     * - Compara diferenças entre commits
     * - Mostra arquivos modificados
     * - Retorna estatísticas de mudanças
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - base: Commit ou branch base
     * - head: Commit ou branch para comparar
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Base e head devem existir
     * - Deve ser possível comparar
     *
     * RECOMENDAÇÕES:
     * - Use para análise de mudanças
     * - Compare antes de fazer merge
     * - Analise arquivos modificados
     * - Documente diferenças importantes
     */
    compareCommits(params: CommitsInput, provider: VcsOperations, owner: string): Promise<CommitsResult>;
    /**
     * Busca commits por critérios específicos
     *
     * FUNCIONALIDADE:
     * - Busca commits por mensagem
     * - Filtra por autor
     * - Suporta paginação
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - query: Termo de busca
     *
     * PARÂMETROS OPCIONAIS:
     * - author: Autor dos commits
     * - page: Página da busca (padrão: 1)
     * - limit: Itens por página (padrão: 30, máximo: 100)
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Query deve ter pelo menos 3 caracteres
     * - Repositório deve existir
     *
     * RECOMENDAÇÕES:
     * - Use termos de busca específicos
     * - Combine com filtros de autor
     * - Use paginação para resultados grandes
     * - Analise relevância dos resultados
     */
    searchCommits(params: CommitsInput, provider: VcsOperations, owner: string): Promise<CommitsResult>;
    /**
     * Faz push dos commits locais para o repositório remoto
     *
     * FUNCIONALIDADE:
     * - Faz push da branch atual para o remote
     * - Suporta especificar branch específica
     * - Verifica se há commits para fazer push
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - projectPath: Caminho do projeto local
     *
     * PARÂMETROS OPCIONAIS:
     * - branch: Branch para fazer push (padrão: branch atual)
     *
     * RECOMENDAÇÕES:
     * - Verifique se há commits locais antes do push
     * - Use branch específica se necessário
     * - Monitore conflitos durante o push
     */
    pushCommits(params: CommitsInput, provider?: VcsOperations): Promise<CommitsResult>;
    /**
     * Faz pull dos commits do repositório remoto
     *
     * FUNCIONALIDADE:
     * - Faz pull da branch atual do remote
     * - Suporta especificar branch específica
     * - Faz merge automático se possível
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - projectPath: Caminho do projeto local
     *
     * PARÂMETROS OPCIONAIS:
     * - branch: Branch para fazer pull (padrão: branch atual)
     *
     * RECOMENDAÇÕES:
     * - Faça backup antes do pull
     * - Resolva conflitos manualmente se houver
     * - Use branch específica se necessário
     */
    pullCommits(params: CommitsInput, provider?: VcsOperations): Promise<CommitsResult>;
    /**
     * Verifica se erro é relacionado a Git
     */
    isGitRelatedError(errorMessage: string): boolean;
};
export {};
//# sourceMappingURL=git-commits.d.ts.map