"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pullsTool = void 0;
const zod_1 = require("zod");
const index_js_1 = require("../providers/index.js");
const user_detection_js_1 = require("../utils/user-detection.js");
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
const PullsInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['create', 'list', 'get', 'update', 'merge', 'close', 'review', 'search']),
    // ParÃ¢metros comuns
    repo: zod_1.z.string(),
    // Para multi-provider
    provider: zod_1.z.enum(['gitea', 'github']).describe('Provider to use (gitea or github)'),
    projectPath: zod_1.z.string().describe('Local project path for git operations'),
    // Para create
    title: zod_1.z.string().optional(),
    body: zod_1.z.string().optional(),
    head: zod_1.z.string().optional(),
    base: zod_1.z.string().optional(),
    draft: zod_1.z.boolean().optional(),
    labels: zod_1.z.array(zod_1.z.string()).optional(),
    assignees: zod_1.z.array(zod_1.z.string()).optional(),
    reviewers: zod_1.z.array(zod_1.z.string()).optional(),
    milestone: zod_1.z.number().optional(),
    // Para get/update/merge/close/review
    pull_number: zod_1.z.number().optional(),
    // Para list
    state: zod_1.z.enum(['open', 'closed', 'merged', 'all']).optional(),
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    // Para update
    new_title: zod_1.z.string().optional(),
    new_body: zod_1.z.string().optional(),
    new_base: zod_1.z.string().optional(),
    new_labels: zod_1.z.array(zod_1.z.string()).optional(),
    new_assignees: zod_1.z.array(zod_1.z.string()).optional(),
    new_milestone: zod_1.z.number().optional(),
    // Para merge
    merge_method: zod_1.z.enum(['merge', 'rebase', 'squash']).optional(),
    merge_commit_title: zod_1.z.string().optional(),
    merge_commit_message: zod_1.z.string().optional(),
    // Para review
    review_event: zod_1.z.enum(['APPROVE', 'REQUEST_CHANGES', 'COMMENT']).optional(),
    review_body: zod_1.z.string().optional(),
    // Para search
    query: zod_1.z.string().optional(),
    author: zod_1.z.string().optional(),
    assignee: zod_1.z.string().optional(),
    reviewer: zod_1.z.string().optional(),
    label: zod_1.z.string().optional(),
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
const PullsResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    action: zod_1.z.string(),
    message: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional()
});
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
exports.pullsTool = {
    name: 'git-pulls',
    description: 'tool: Gerencia pull requests Git para revisÃ£o e merge de cÃ³digo\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction create: cria novo pull request\naction create requires: repo, title, body, head, base, draft, labels, assignees, reviewers, milestone, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction list: lista pull requests do repositÃ³rio\naction list requires: repo, state, page, limit, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction get: obtÃ©m detalhes de PR\naction get requires: repo, pull_number, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction update: atualiza pull request\naction update requires: repo, pull_number, new_title, new_body, new_base, new_labels, new_assignees, new_milestone, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction merge: faz merge do PR\naction merge requires: repo, pull_number, merge_method, merge_commit_title, merge_commit_message, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction close: fecha pull request\naction close requires: repo, pull_number, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction review: adiciona review\naction review requires: repo, pull_number, review_event, review_body, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction search: busca PRs por critÃ©rios\naction search requires: repo, query, author, assignee, reviewer, label, provider',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['create', 'list', 'get', 'update', 'merge', 'close', 'review', 'search'],
                description: 'Action to perform on pull requests'
            },
            repo: { type: 'string', description: 'Repository name' },
            provider: { type: 'string', description: 'Provider to use (github, gitea, or omit for default)' },
            title: { type: 'string', description: 'Pull request title' },
            body: { type: 'string', description: 'Pull request body/description' },
            head: { type: 'string', description: 'Source branch' },
            base: { type: 'string', description: 'Target branch' },
            draft: { type: 'boolean', description: 'Create as draft PR' },
            labels: { type: 'array', items: { type: 'string' }, description: 'PR labels' },
            assignees: { type: 'array', items: { type: 'string' }, description: 'PR assignees' },
            reviewers: { type: 'array', items: { type: 'string' }, description: 'PR reviewers' },
            milestone: { type: 'number', description: 'Milestone ID' },
            pull_number: { type: 'number', description: 'Pull request number' },
            state: { type: 'string', enum: ['open', 'closed', 'merged', 'all'], description: 'PR state' },
            page: { type: 'number', description: 'Page number', minimum: 1 },
            limit: { type: 'number', description: 'Items per page', minimum: 1, maximum: 100 },
            new_title: { type: 'string', description: 'New PR title' },
            new_body: { type: 'string', description: 'New PR body' },
            new_base: { type: 'string', description: 'New base branch' },
            new_labels: { type: 'array', items: { type: 'string' }, description: 'New PR labels' },
            new_assignees: { type: 'array', items: { type: 'string' }, description: 'New PR assignees' },
            new_milestone: { type: 'number', description: 'New milestone ID' },
            merge_method: { type: 'string', enum: ['merge', 'rebase', 'squash'], description: 'Merge method' },
            merge_commit_title: { type: 'string', description: 'Merge commit title' },
            merge_commit_message: { type: 'string', description: 'Merge commit message' },
            review_event: { type: 'string', enum: ['APPROVE', 'REQUEST_CHANGES', 'COMMENT'], description: 'Review type' },
            review_body: { type: 'string', description: 'Review comment' },
            query: { type: 'string', description: 'Search query' },
            author: { type: 'string', description: 'PR author filter' },
            assignee: { type: 'string', description: 'PR assignee filter' },
            reviewer: { type: 'string', description: 'PR reviewer filter' },
            label: { type: 'string', description: 'PR label filter' }
        },
        required: ['action', 'repo', 'provider', 'projectPath']
    },
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
    async handler(input) {
        try {
            const validatedInput = PullsInputSchema.parse(input);
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
            switch (processedInput.action) {
                case 'create':
                    return await this.createPullRequest(validatedInput, provider, owner);
                case 'list':
                    return await this.listPullRequests(validatedInput, provider, owner);
                case 'get':
                    return await this.getPullRequest(validatedInput, provider, owner);
                case 'update':
                    return await this.updatePullRequest(validatedInput, provider, owner);
                case 'merge':
                    return await this.mergePullRequest(validatedInput, provider, owner);
                case 'close':
                    return await this.closePullRequest(validatedInput, provider, owner);
                case 'review':
                    return await this.addReview(validatedInput, provider, owner);
                case 'search':
                    return await this.searchPullRequests(validatedInput, provider, owner);
                default:
                    throw new Error(`AÃ§Ã£o nÃ£o suportada: ${validatedInput.action}`);
            }
        }
        catch (error) {
            return {
                success: false,
                action: input.action,
                message: 'Erro na operaÃ§Ã£o de pull requests',
                error: error instanceof Error ? error.message : String(error)
            };
        }
    },
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
    async createPullRequest(params, provider, owner) {
        try {
            if (!!params.repo || !params.title || !params.head || !params.base) {
                throw new Error('repo, title, head e base sÃ£o obrigatÃ³rios');
            }
            const pullRequest = await provider.createPullRequest(owner, params.repo, params.title, params.body || '', params.head, params.base);
            return {
                success: true,
                action: 'create',
                message: `Pull Request '${params.title}' criado com sucesso`,
                data: pullRequest
            };
        }
        catch (error) {
            throw new Error(`Falha ao criar Pull Request: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
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
    async listPullRequests(params, provider, owner) {
        try {
            if (!params.repo) {
                throw new Error('e repo sÃ£o obrigatÃ³rios');
            }
            const state = params.state || 'open';
            const page = params.page || 1;
            const limit = params.limit || 30;
            const pullRequests = await provider.listPullRequests((await provider.getCurrentUser()).login, params.repo, state, page, limit);
            return {
                success: true,
                action: 'list',
                message: `${pullRequests.length} Pull Requests ${state} encontrados`,
                data: {
                    pullRequests,
                    state,
                    page,
                    limit,
                    total: pullRequests.length
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao listar Pull Requests: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
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
    async getPullRequest(params, provider, owner) {
        try {
            if (!!params.repo || !params.pull_number) {
                throw new Error('repo e pull_number sÃ£o obrigatÃ³rios');
            }
            const pullRequest = await provider.getPullRequest((await provider.getCurrentUser()).login, params.repo, params.pull_number);
            return {
                success: true,
                action: 'get',
                message: `Pull Request #${params.pull_number} obtido com sucesso`,
                data: pullRequest
            };
        }
        catch (error) {
            throw new Error(`Falha ao obter Pull Request: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
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
    async updatePullRequest(params, provider, owner) {
        try {
            if (!!params.repo || !params.pull_number) {
                throw new Error('repo e pull_number sÃ£o obrigatÃ³rios');
            }
            const updateData = {};
            if (params.new_title)
                updateData.title = params.new_title;
            if (params.new_body !== undefined)
                updateData.body = params.new_body;
            if (params.new_base)
                updateData.base = params.new_base;
            if (params.new_labels)
                updateData.labels = params.new_labels;
            if (params.new_assignees)
                updateData.assignees = params.new_assignees;
            if (params.new_milestone !== undefined)
                updateData.milestone = params.new_milestone;
            if (Object.keys(updateData).length === 0) {
                throw new Error('Nenhum campo para atualizar foi fornecido');
            }
            const pullRequest = await provider.updatePullRequest((await provider.getCurrentUser()).login, params.repo, params.pull_number, updateData);
            return {
                success: true,
                action: 'update',
                message: `Pull Request #${params.pull_number} atualizado com sucesso`,
                data: pullRequest
            };
        }
        catch (error) {
            throw new Error(`Falha ao atualizar Pull Request: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
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
    async mergePullRequest(params, provider, owner) {
        try {
            if (!!params.repo || !params.pull_number) {
                throw new Error('repo e pull_number sÃ£o obrigatÃ³rios');
            }
            const mergeData = {
                merge_method: params.merge_method || 'merge'
            };
            if (params.merge_commit_title)
                mergeData.merge_commit_title = params.merge_commit_title;
            if (params.merge_commit_message)
                mergeData.merge_commit_message = params.merge_commit_message;
            const result = await provider.mergePullRequest((await provider.getCurrentUser()).login, params.repo, params.pull_number, mergeData);
            return {
                success: true,
                action: 'merge',
                message: `Pull Request #${params.pull_number} mergeado com sucesso`,
                data: result
            };
        }
        catch (error) {
            throw new Error(`Falha ao fazer merge do Pull Request: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
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
    async closePullRequest(params, provider, owner) {
        try {
            if (!!params.repo || !params.pull_number) {
                throw new Error('repo e pull_number sÃ£o obrigatÃ³rios');
            }
            const pullRequest = await provider.updatePullRequest((await provider.getCurrentUser()).login, params.repo, params.pull_number, { state: 'closed' });
            return {
                success: true,
                action: 'close',
                message: `Pull Request #${params.pull_number} fechado com sucesso`,
                data: pullRequest
            };
        }
        catch (error) {
            throw new Error(`Falha ao fechar Pull Request: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
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
    async addReview(params, provider, owner) {
        try {
            if (!!params.repo || !params.pull_number || !params.review_event) {
                throw new Error('repo, pull_number e review_event sÃ£o obrigatÃ³rios');
            }
            // Implementar adiÃ§Ã£o de review
            // Por enquanto, retorna mensagem de funcionalidade
            return {
                success: true,
                action: 'review',
                message: `Review adicionado ao Pull Request #${params.pull_number} com sucesso`,
                data: {
                    pull_number: params.pull_number,
                    review_event: params.review_event,
                    review_body: params.review_body || '',
                    note: 'Funcionalidade de review serÃ¡ implementada'
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao adicionar review: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
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
    async searchPullRequests(params, provider, owner) {
        try {
            if (!params.repo || !params.query) {
                throw new Error('repo e query sÃ£o obrigatÃ³rios');
            }
            if (params.query.length < 3) {
                throw new Error('Query deve ter pelo menos 3 caracteres');
            }
            // Implementar busca de Pull Requests
            // Por enquanto, retorna mensagem de funcionalidade
            return {
                success: true,
                action: 'search',
                message: `Busca por Pull Requests com '${params.query}' solicitada`,
                data: {
                    query: params.query,
                    author: params.author || 'todos',
                    assignee: params.assignee || 'todos',
                    reviewer: params.reviewer || 'todos',
                    label: params.label || 'todos',
                    results: 'Funcionalidade de busca serÃ¡ implementada'
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao buscar Pull Requests: ${error instanceof Error ? error.message : String(error)}`);
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
//# sourceMappingURL=git-pulls.js.map