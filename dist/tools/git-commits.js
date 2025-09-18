"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commitsTool = void 0;
const zod_1 = require("zod");
const index_js_1 = require("../providers/index.js");
const user_detection_js_1 = require("../utils/user-detection.js");
const terminal_controller_js_1 = require("../utils/terminal-controller.js");
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
const CommitsInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['list', 'get', 'create', 'compare', 'search', 'push', 'pull']),
    // ParÃ¢metros comuns
    // owner: obtido automaticamente do provider,
    repo: zod_1.z.string(),
    projectPath: zod_1.z.string().describe('Local project path for git operations'),
    // Para multi-provider
    provider: zod_1.z.enum(['gitea', 'github']).describe('Provider to use (gitea or github)'), // Provider especÃ­fico: gitea, github ou both
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
 * Schema de saÃ­da padronizado
 *
 * ESTRUTURA:
 * - success: Status da operaÃ§Ã£o
 * - action: AÃ§Ã£o executada
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
exports.commitsTool = {
    name: 'git-commits',
    description: 'tool: Gerencia commits Git completos, histÃ³rico, criaÃ§Ã£o e sincronizaÃ§Ã£o\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction list: lista commits do repositÃ³rio\naction list requires: repo, page, limit, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction get: obtÃ©m detalhes de commit especÃ­fico\naction get requires: repo, sha, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction create: cria novo commit\naction create requires: repo, message, branch, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction compare: compara commits/branches\naction compare requires: repo, base, head, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction search: busca commits por critÃ©rios\naction search requires: repo, query, author, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction push: envia commits para remoto\naction push requires: repo, branch, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction pull: baixa commits do remoto\naction pull requires: repo, branch, provider',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['list', 'get', 'create', 'compare', 'search', 'push', 'pull'],
                description: 'Action to perform on commits'
            },
            repo: { type: 'string', description: 'Repository name' },
            provider: { type: 'string', description: 'Specific provider (github, gitea) or use default' },
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
        required: ['action', 'repo', 'provider', 'projectPath']
    },
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
    async handler(input) {
        try {
            const validatedInput = CommitsInputSchema.parse(input);
            // Aplicar auto-detecÃ§Ã£o de usuÃ¡rio/owner
            const processedInput = await (0, user_detection_js_1.applyAutoUserDetection)(validatedInput, validatedInput.provider);
            // Obter o provider correto
            const provider = processedInput.provider
                ? index_js_1.globalProviderFactory.getProvider(processedInput.provider)
                : index_js_1.globalProviderFactory.getDefaultProvider();
            if (!provider) {
                throw new Error(`Provider '${processedInput.provider}' nÃ£o encontrado`);
            }
            // Obter o owner do provider
            const owner = (await provider.getCurrentUser()).login;
            // Para aÃ§Ãµes que precisam de owner, verificar se foi determinado
            if (!owner && ['list', 'get', 'create', 'compare', 'search'].includes(processedInput.action)) {
                throw new Error('NÃ£o foi possÃ­vel determinar o owner automaticamente. Verifique se o token estÃ¡ configurado corretamente.');
            }
            switch (processedInput.action) {
                case 'list':
                    return await this.listCommits(processedInput, provider, owner);
                case 'get':
                    return await this.getCommit(processedInput, provider, owner);
                case 'create':
                    return await this.createCommit(processedInput, provider, owner);
                case 'compare':
                    return await this.compareCommits(processedInput, provider, owner);
                case 'search':
                    return await this.searchCommits(processedInput, provider, owner);
                case 'push':
                    return await this.pushCommits(processedInput, provider);
                case 'pull':
                    return await this.pullCommits(processedInput, provider);
                default:
                    throw new Error(`AÃ§Ã£o nÃ£o suportada: ${processedInput.action}`);
            }
        }
        catch (error) {
            return {
                success: false,
                action: input.action,
                message: 'Erro na operaÃ§Ã£o de commits',
                error: error instanceof Error ? error.message : String(error)
            };
        }
    },
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
    async listCommits(params, provider, owner) {
        try {
            if (!owner || !params.repo) {
                throw new Error('e repo sÃ£o obrigatÃ³rios');
            }
            const page = params.page || 1;
            const limit = params.limit || 30;
            const commits = await provider.listCommits(owner, params.repo, params.sha, page, limit);
            return {
                success: true,
                action: 'list',
                message: `${commits.length} commits encontrados`,
                data: {
                    commits,
                    page,
                    limit,
                    total: commits.length,
                    sha: params.sha || 'branch padrÃ£o'
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao listar commits: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
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
    async getCommit(params, provider, owner) {
        try {
            if (!owner || !params.repo) {
                throw new Error('e repo sÃ£o obrigatÃ³rios');
            }
            // Se nÃ£o foi fornecido commit_sha, usa o SHA da branch padrÃ£o
            let commitSha = params.commit_sha;
            if (!commitSha) {
                try {
                    const branchInfo = await provider.getBranch(owner, params.repo, 'main');
                    commitSha = branchInfo.commit.sha;
                }
                catch (error) {
                    // Se nÃ£o conseguir obter o branch main, tenta master
                    try {
                        const branchInfo = await provider.getBranch(owner, params.repo, 'master');
                        commitSha = branchInfo.commit.sha;
                    }
                    catch (masterError) {
                        throw new Error('NÃ£o foi possÃ­vel obter SHA do commit. ForneÃ§a commit_sha ou verifique se a branch existe.');
                    }
                }
            }
            const commit = await provider.getCommit(owner, params.repo, commitSha);
            return {
                success: true,
                action: 'get',
                message: `Commit '${commitSha}' obtido com sucesso`,
                data: {
                    commit,
                    sha: commitSha,
                    owner: owner,
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
    async createCommit(params, provider, owner) {
        try {
            if (!owner || !params.repo || !params.message || !params.branch) {
                throw new Error('repo, message e branch sÃ£o obrigatÃ³rios');
            }
            if (params.message.trim().length === 0) {
                throw new Error('Mensagem do commit nÃ£o pode estar vazia');
            }
            // Verificar se a branch existe
            try {
                await provider.getBranch(owner, params.repo, params.branch);
            }
            catch (error) {
                throw new Error(`Branch '${params.branch}' nÃ£o existe no repositÃ³rio`);
            }
            // Obter informaÃ§Ãµes do usuÃ¡rio atual para usar como padrÃ£o
            const currentUser = await provider.getCurrentUser();
            // Preparar dados do commit
            const commitData = {
                message: params.message,
                branch: params.branch,
                author: {
                    name: params.author_name || currentUser.login,
                    email: params.author_email || currentUser.email || `${currentUser.login}@example.com`
                },
                committer: {
                    name: params.committer_name || currentUser.login,
                    email: params.committer_email || currentUser.email || `${currentUser.login}@example.com`
                }
            };
            // Criar o commit usando o provider
            const commit = await provider.createCommit(owner, params.repo, commitData.message, commitData.branch, commitData.author.name, commitData.author.email, commitData.committer.name, commitData.committer.email);
            return {
                success: true,
                action: 'create',
                message: `Commit criado com sucesso na branch '${params.branch}'`,
                data: {
                    commit: commit,
                    message: params.message,
                    branch: params.branch,
                    author: commitData.author,
                    committer: commitData.committer,
                    sha: commit.sha,
                    url: commit.html_url
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
    async compareCommits(params, provider, owner) {
        try {
            if (!owner || !params.repo || !params.base || !params.head) {
                throw new Error('repo, base e head sÃ£o obrigatÃ³rios');
            }
            // Verificar se os commits/branches existem
            try {
                // Tentar obter como commits primeiro
                await provider.getCommit(owner, params.repo, params.base);
                await provider.getCommit(owner, params.repo, params.head);
            }
            catch (commitError) {
                try {
                    // Se falhar, tentar como branches
                    await provider.getBranch(owner, params.repo, params.base);
                    await provider.getBranch(owner, params.repo, params.head);
                }
                catch (branchError) {
                    throw new Error(`Commits/branches nÃ£o encontrados: ${params.base} ou ${params.head}`);
                }
            }
            // Obter commits de cada referÃªncia para anÃ¡lise
            const baseCommits = await provider.listCommits(owner, params.repo, params.base, 1, 10);
            const headCommits = await provider.listCommits(owner, params.repo, params.head, 1, 10);
            // Comparar commits Ãºnicos
            const baseCommitShas = baseCommits.map(c => c.sha);
            const headCommitShas = headCommits.map(c => c.sha);
            const uniqueBaseCommits = baseCommits.filter(c => !headCommitShas.includes(c.sha));
            const uniqueHeadCommits = headCommits.filter(c => !baseCommitShas.includes(c.sha));
            // Usar compareCommits do provider se disponÃ­vel
            let detailedComparison = null;
            try {
                if (provider.compareCommits) {
                    detailedComparison = await provider.compareCommits(owner, params.repo, params.base, params.head);
                }
            }
            catch (error) {
                console.warn('ComparaÃ§Ã£o detalhada nÃ£o disponÃ­vel:', error);
            }
            return {
                success: true,
                action: 'compare',
                message: `ComparaÃ§Ã£o entre '${params.base}' e '${params.head}' realizada com sucesso`,
                data: {
                    base: {
                        ref: params.base,
                        commits: baseCommits.length,
                        unique_commits: uniqueBaseCommits.length,
                        last_commit: baseCommits[0]?.sha
                    },
                    head: {
                        ref: params.head,
                        commits: headCommits.length,
                        unique_commits: uniqueHeadCommits.length,
                        last_commit: headCommits[0]?.sha
                    },
                    comparison: {
                        base_ahead: uniqueBaseCommits.length,
                        head_ahead: uniqueHeadCommits.length,
                        divergent: uniqueBaseCommits.length > 0 && uniqueHeadCommits.length > 0,
                        detailed: detailedComparison
                    },
                    summary: {
                        status: uniqueBaseCommits.length === 0 ? 'head estÃ¡ Ã  frente' :
                            uniqueHeadCommits.length === 0 ? 'base estÃ¡ Ã  frente' :
                                'divergiram',
                        can_merge: uniqueBaseCommits.length === 0 || uniqueHeadCommits.length === 0,
                        requires_merge: uniqueBaseCommits.length > 0 && uniqueHeadCommits.length > 0
                    }
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao comparar commits: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
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
    async searchCommits(params, provider, owner) {
        try {
            if (!owner || !params.repo || !params.query) {
                throw new Error('repo e query sÃ£o obrigatÃ³rios');
            }
            if (params.query.length < 3) {
                throw new Error('Query deve ter pelo menos 3 caracteres');
            }
            const page = params.page || 1;
            const limit = Math.min(params.limit || 30, 100);
            // Buscar commits usando o provider
            let searchResults = [];
            if (provider.searchCommits) {
                searchResults = await provider.searchCommits(owner, params.repo, params.query, params.author || undefined);
            }
            else {
                // Fallback: buscar todos os commits e filtrar localmente
                const allCommits = await provider.listCommits(owner, params.repo, undefined, 1, 100);
                searchResults = allCommits.filter((commit) => commit.message?.toLowerCase().includes(params.query?.toLowerCase() || '') ||
                    commit.commit?.message?.toLowerCase().includes(params.query?.toLowerCase() || ''));
            }
            // Filtrar resultados por pÃ¡gina e limite
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedResults = searchResults.slice(startIndex, endIndex);
            // Filtrar por autor se especificado
            const filteredResults = params.author
                ? paginatedResults.filter((commit) => commit.commit?.author?.name?.toLowerCase().includes(params.author.toLowerCase()) ||
                    commit.author?.login?.toLowerCase().includes(params.author.toLowerCase()))
                : paginatedResults;
            return {
                success: true,
                action: 'search',
                message: `${filteredResults.length} commits encontrados para '${params.query}'`,
                data: {
                    query: params.query,
                    author: params.author || 'todos',
                    page,
                    limit,
                    total_found: searchResults.length,
                    results: filteredResults,
                    summary: {
                        total_commits: searchResults.length,
                        filtered_commits: filteredResults.length,
                        authors: [...new Set(filteredResults.map((c) => c.commit?.author?.name || c.author?.login).filter(Boolean))],
                        date_range: filteredResults.length > 0 ? {
                            earliest: filteredResults[filteredResults.length - 1]?.commit?.author?.date,
                            latest: filteredResults[0]?.commit?.author?.date
                        } : null
                    }
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao buscar commits: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
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
    async pushCommits(params, provider) {
        try {
            if (!params.projectPath) {
                throw new Error('projectPath Ã© obrigatÃ³rio para push');
            }
            const branch = params.branch || 'main';
            // Faz push usando o terminal controller
            const pushResult = await (0, terminal_controller_js_1.gitPush)(params.projectPath, branch);
            if (pushResult.exitCode !== 0) {
                throw new Error(`Falha no push: ${pushResult.output}`);
            }
            return {
                success: true,
                action: 'push',
                message: `Push realizado com sucesso na branch '${branch}'`,
                data: {
                    projectPath: params.projectPath,
                    branch: branch,
                    pushed: true,
                    output: pushResult.output
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao fazer push: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
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
    async pullCommits(params, provider) {
        try {
            if (!params.projectPath) {
                throw new Error('projectPath Ã© obrigatÃ³rio para pull');
            }
            const branch = params.branch || 'main';
            // Faz pull usando o terminal controller
            const pullResult = await (0, terminal_controller_js_1.gitPull)(params.projectPath, branch);
            if (pullResult.exitCode !== 0) {
                throw new Error(`Falha no pull: ${pullResult.output}`);
            }
            return {
                success: true,
                action: 'pull',
                message: `Pull realizado com sucesso na branch '${branch}'`,
                data: {
                    projectPath: params.projectPath,
                    branch: branch,
                    pulled: true,
                    output: pullResult.output
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao fazer pull: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Verifica se erro Ã© relacionado a Git
     */
    ,
    /**
     * Verifica se erro Ã© relacionado a Git
     */
    isGitRelatedError(errorMessage) {
        const gitKeywords = [
            'git', 'commit', 'push', 'pull', 'merge', 'conflict', 'branch',
            'remote', 'repository', 'authentication', 'permission', 'unauthorized',
            'divergent', 'non-fast-forward', 'fetch first', 'working tree',
            'uncommitted', 'stash', 'rebase', 'reset', 'checkout'
        ];
        const errorLower = errorMessage.toLowerCase();
        return gitKeywords.some(keyword => errorLower.includes(keyword));
    }
};
//# sourceMappingURL=git-commits.js.map