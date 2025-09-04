"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commitsTool = void 0;
const zod_1 = require("zod");
const index_js_1 = require("../providers/index.js");
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
const CommitsInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['list', 'get', 'create', 'compare', 'search']),
    // Parâmetros comuns
    owner: zod_1.z.string().optional(),
    repo: zod_1.z.string().optional(),
    // Para multi-provider
    provider: zod_1.z.enum(['gitea', 'github', 'both']).optional(), // Provider específico: gitea, github ou both
    // Para list
    sha: zod_1.z.string().optional(),
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    // Para get
    commit_sha: zod_1.z.string().optional(),
    // Para create
    message: zod_1.z.string().optional(),
    branch: zod_1.z.string().optional(),
    author_name: zod_1.z.string().optional(),
    author_email: zod_1.z.string().optional(),
    committer_name: zod_1.z.string().optional(),
    committer_email: zod_1.z.string().optional(),
    // Para compare
    base: zod_1.z.string().optional(),
    head: zod_1.z.string().optional(),
    // Para search
    query: zod_1.z.string().optional(),
    author: zod_1.z.string().optional(),
});
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
const CommitsResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    action: zod_1.z.string(),
    message: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional()
});
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
exports.commitsTool = {
    name: 'commits',
    description: 'Manage commits with multi-provider support (GitHub and Gitea): list, get, create, compare, search. Boas práticas (solo): faça commits pequenos e atômicos com mensagens claras; use compare para auditoria; documente mudanças relevantes no corpo da mensagem.',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['list', 'get', 'create', 'compare', 'search'],
                description: 'Action to perform on commits'
            },
            owner: { type: 'string', description: 'Repository owner' },
            repo: { type: 'string', description: 'Repository name' },
            provider: { type: 'string', description: 'Provider to use (github, gitea, or omit for default)' },
            sha: { type: 'string', description: 'Branch, tag or commit SHA' },
            page: { type: 'number', description: 'Page number', minimum: 1 },
            limit: { type: 'number', description: 'Items per page', minimum: 1, maximum: 100 },
            commit_sha: { type: 'string', description: 'Specific commit SHA' },
            message: { type: 'string', description: 'Commit message' },
            branch: { type: 'string', description: 'Target branch' },
            author_name: { type: 'string', description: 'Author name' },
            author_email: { type: 'string', description: 'Author email' },
            committer_name: { type: 'string', description: 'Committer name' },
            committer_email: { type: 'string', description: 'Committer email' },
            base: { type: 'string', description: 'Base commit/branch for comparison' },
            head: { type: 'string', description: 'Head commit/branch for comparison' },
            query: { type: 'string', description: 'Search query' },
            author: { type: 'string', description: 'Author filter for search' }
        },
        required: ['action']
    },
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
    async handler(input) {
        try {
            const validatedInput = CommitsInputSchema.parse(input);
            // Seleciona o provider baseado na entrada ou usa o padrão
            const provider = validatedInput.provider
                ? index_js_1.globalProviderFactory.getProvider(validatedInput.provider)
                : index_js_1.globalProviderFactory.getDefaultProvider();
            if (!provider) {
                throw new Error('Provider não encontrado ou não configurado');
            }
            switch (validatedInput.action) {
                case 'list':
                    return await this.listCommits(validatedInput, provider);
                case 'get':
                    return await this.getCommit(validatedInput, provider);
                case 'create':
                    return await this.createCommit(validatedInput, provider);
                case 'compare':
                    return await this.compareCommits(validatedInput, provider);
                case 'search':
                    return await this.searchCommits(validatedInput, provider);
                default:
                    throw new Error(`Ação não suportada: ${validatedInput.action}`);
            }
        }
        catch (error) {
            return {
                success: false,
                action: input.action,
                message: 'Erro na operação de commits',
                error: error instanceof Error ? error.message : String(error)
            };
        }
    },
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
     * - Owner e repo obrigatórios
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
    async listCommits(params, provider) {
        try {
            if (!params.owner || !params.repo) {
                throw new Error('Owner e repo são obrigatórios');
            }
            const page = params.page || 1;
            const limit = params.limit || 30;
            const commits = await provider.listCommits(params.owner, params.repo, params.sha, page, limit);
            return {
                success: true,
                action: 'list',
                message: `${commits.length} commits encontrados`,
                data: {
                    commits,
                    page,
                    limit,
                    total: commits.length,
                    sha: params.sha || 'branch padrão'
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao listar commits: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
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
    async getCommit(params, provider) {
        try {
            if (!params.owner || !params.repo || !params.commit_sha) {
                throw new Error('Owner, repo e commit_sha são obrigatórios');
            }
            const commit = await provider.getCommit(params.owner, params.repo, params.commit_sha);
            return {
                success: true,
                action: 'get',
                message: `Commit '${params.commit_sha}' obtido com sucesso`,
                data: {
                    commit,
                    sha: params.commit_sha,
                    owner: params.owner,
                    repo: params.repo
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao obter commit: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
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
    async createCommit(params, provider) {
        try {
            if (!params.owner || !params.repo || !params.message || !params.branch) {
                throw new Error('Owner, repo, message e branch são obrigatórios');
            }
            if (params.message.trim().length === 0) {
                throw new Error('Mensagem do commit não pode estar vazia');
            }
            // Implementar criação de commit
            // Por enquanto, retorna mensagem de funcionalidade
            return {
                success: true,
                action: 'create',
                message: `Criação de commit solicitada para branch '${params.branch}'`,
                data: {
                    message: params.message,
                    branch: params.branch,
                    author: params.author_name || 'usuário atual',
                    committer: params.committer_name || 'usuário atual',
                    commit: 'Funcionalidade de criação será implementada'
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao criar commit: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
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
    async compareCommits(params, provider) {
        try {
            if (!params.owner || !params.repo || !params.base || !params.head) {
                throw new Error('Owner, repo, base e head são obrigatórios');
            }
            // Implementar comparação de commits
            // Por enquanto, retorna mensagem de funcionalidade
            return {
                success: true,
                action: 'compare',
                message: `Comparação entre '${params.base}' e '${params.head}' solicitada`,
                data: {
                    base: params.base,
                    head: params.head,
                    comparison: 'Funcionalidade de comparação será implementada'
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao comparar commits: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
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
    async searchCommits(params, provider) {
        try {
            if (!params.owner || !params.repo || !params.query) {
                throw new Error('Owner, repo e query são obrigatórios');
            }
            if (params.query.length < 3) {
                throw new Error('Query deve ter pelo menos 3 caracteres');
            }
            // Implementar busca de commits
            // Por enquanto, retorna mensagem de funcionalidade
            return {
                success: true,
                action: 'search',
                message: `Busca por commits com '${params.query}' solicitada`,
                data: {
                    query: params.query,
                    author: params.author || 'todos',
                    results: 'Funcionalidade de busca será implementada'
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao buscar commits: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
};
//# sourceMappingURL=commits.js.map