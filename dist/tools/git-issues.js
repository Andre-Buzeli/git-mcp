"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.issuesTool = void 0;
const zod_1 = require("zod");
const index_js_1 = require("../providers/index.js");
const user_detection_js_1 = require("../utils/user-detection.js");
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
const IssuesInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['create', 'list', 'get', 'update', 'close', 'comment', 'search']),
    // ParÃ¢metros comuns
    repo: zod_1.z.string(),
    // Para multi-provider
    provider: zod_1.z.enum(['gitea', 'github']).describe('Provider to use (gitea or github)'), // Provider especÃ­fico: gitea, github ou both
    projectPath: zod_1.z.string().describe('Local project path for git operations'),
    // Para create
    title: zod_1.z.string().optional(),
    body: zod_1.z.string().optional(),
    labels: zod_1.z.array(zod_1.z.string()).optional(),
    assignees: zod_1.z.array(zod_1.z.string()).optional(),
    milestone: zod_1.z.number().optional(),
    // Para get/update/close/comment
    issue_number: zod_1.z.number().optional(),
    // Para list
    state: zod_1.z.enum(['open', 'closed', 'all']).optional(),
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    // Para update
    new_title: zod_1.z.string().optional(),
    new_body: zod_1.z.string().optional(),
    new_state: zod_1.z.enum(['open', 'closed']).optional(),
    new_labels: zod_1.z.array(zod_1.z.string()).optional(),
    new_assignees: zod_1.z.array(zod_1.z.string()).optional(),
    new_milestone: zod_1.z.number().optional(),
    // Para comment
    comment_body: zod_1.z.string().optional(),
    // Para search
    query: zod_1.z.string().optional(),
    author: zod_1.z.string().optional(),
    assignee: zod_1.z.string().optional(),
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
const IssuesResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    action: zod_1.z.string(),
    message: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional()
});
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
exports.issuesTool = {
    name: 'git-issues',
    description: 'tool: Gerencia issues Git, bugs, features e tarefas\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction create: cria nova issue\naction create requires: repo, title, body, labels, assignees, milestone, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction list: lista issues do repositÃ³rio\naction list requires: repo, state, page, limit, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction get: obtÃ©m detalhes de issue\naction get requires: repo, issue_number, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction update: atualiza issue existente\naction update requires: repo, issue_number, new_title, new_body, new_state, new_labels, new_assignees, new_milestone, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction close: fecha issue\naction close requires: repo, issue_number, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction comment: adiciona comentÃ¡rio\naction comment requires: repo, issue_number, comment_body, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction search: busca issues por critÃ©rios\naction search requires: repo, query, author, assignee, label, provider',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['create', 'list', 'get', 'update', 'close', 'comment', 'search'],
                description: 'Action to perform on issues'
            },
            repo: { type: 'string', description: 'Repository name' },
            provider: { type: 'string', description: 'Provider to use (github, gitea, or omit for default)' },
            title: { type: 'string', description: 'Issue title' },
            body: { type: 'string', description: 'Issue body/description' },
            labels: { type: 'array', items: { type: 'string' }, description: 'Issue labels' },
            assignees: { type: 'array', items: { type: 'string' }, description: 'Issue assignees' },
            milestone: { type: 'number', description: 'Milestone ID' },
            issue_number: { type: 'number', description: 'Issue number' },
            state: { type: 'string', enum: ['open', 'closed', 'all'], description: 'Issue state' },
            page: { type: 'number', description: 'Page number', minimum: 1 },
            limit: { type: 'number', description: 'Items per page', minimum: 1, maximum: 100 },
            new_title: { type: 'string', description: 'New issue title' },
            new_body: { type: 'string', description: 'New issue body' },
            new_state: { type: 'string', enum: ['open', 'closed'], description: 'New issue state' },
            new_labels: { type: 'array', items: { type: 'string' }, description: 'New issue labels' },
            new_assignees: { type: 'array', items: { type: 'string' }, description: 'New issue assignees' },
            new_milestone: { type: 'number', description: 'New milestone ID' },
            comment_body: { type: 'string', description: 'Comment content' },
            query: { type: 'string', description: 'Search query' },
            author: { type: 'string', description: 'Issue author filter' },
            assignee: { type: 'string', description: 'Issue assignee filter' },
            label: { type: 'string', description: 'Issue label filter' }
        },
        required: ['action', 'repo', 'provider', 'projectPath']
    },
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
    async handler(input) {
        try {
            const validatedInput = IssuesInputSchema.parse(input);
            // Aplicar auto-detecÃ§Ã£o de usuÃ¡rio/owner
            const processedInput = await (0, user_detection_js_1.applyAutoUserDetection)(validatedInput, validatedInput.provider);
            // Obter o provider correto
            let provider;
            try {
                if (processedInput.provider) {
                    const requestedProvider = index_js_1.globalProviderFactory.getProvider(processedInput.provider);
                    if (!requestedProvider) {
                        console.warn(`[ISSUES] Provider '${processedInput.provider}' nÃ£o encontrado, usando padrÃ£o`);
                        provider = index_js_1.globalProviderFactory.getDefaultProvider();
                    }
                    else {
                        provider = requestedProvider;
                    }
                }
                else {
                    provider = index_js_1.globalProviderFactory.getDefaultProvider();
                }
                if (!provider) {
                    throw new Error('Nenhum provider disponÃ­vel');
                }
            }
            catch (providerError) {
                console.error('[ISSUES] Erro ao obter provider:', providerError);
                throw new Error(`Erro de configuraÃ§Ã£o do provider: ${providerError instanceof Error ? providerError.message : 'Provider nÃ£o disponÃ­vel'}`);
            }
            // Obter o owner do provider
            const owner = (await provider.getCurrentUser()).login;
            switch (processedInput.action) {
                case 'create':
                    return await this.createIssue(processedInput, provider, owner);
                case 'list':
                    return await this.listIssues(processedInput, provider, owner);
                case 'get':
                    return await this.getIssue(processedInput, provider, owner);
                case 'update':
                    return await this.updateIssue(processedInput, provider, owner);
                case 'close':
                    return await this.closeIssue(processedInput, provider, owner);
                case 'comment':
                    return await this.addComment(processedInput, provider, owner);
                case 'search':
                    return await this.searchIssues(processedInput, provider, owner);
                default:
                    throw new Error(`AÃ§Ã£o nÃ£o suportada: ${processedInput.action}`);
            }
        }
        catch (error) {
            return {
                success: false,
                action: input.action,
                message: 'Erro na operaÃ§Ã£o de issues',
                error: error instanceof Error ? error.message : String(error)
            };
        }
    },
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
    async createIssue(params, provider, owner) {
        try {
            if (!owner) {
                throw new Error('Ã© obrigatÃ³rio');
            }
            if (!params.repo) {
                throw new Error('Repo Ã© obrigatÃ³rio');
            }
            if (!params.title) {
                throw new Error('Title Ã© obrigatÃ³rio');
            }
            const issue = await provider.createIssue(owner, params.repo, params.title, params.body, params.assignees, params.labels);
            return {
                success: true,
                action: 'create',
                message: `Issue '${params.title}' criada com sucesso`,
                data: issue
            };
        }
        catch (error) {
            throw new Error(`Falha ao criar issue: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
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
    async listIssues(params, provider, owner) {
        try {
            if (!owner) {
                throw new Error('Ã© obrigatÃ³rio');
            }
            if (!params.repo) {
                throw new Error('Repo Ã© obrigatÃ³rio');
            }
            const state = params.state || 'open';
            const page = params.page || 1;
            const limit = params.limit || 30;
            const issues = await provider.listIssues((await provider.getCurrentUser()).login, params.repo, state, page, limit);
            return {
                success: true,
                action: 'list',
                message: `${issues.length} issues ${state} encontradas`,
                data: {
                    issues,
                    state,
                    page,
                    limit,
                    total: issues.length
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao listar issues: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
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
    async getIssue(params, provider, owner) {
        try {
            // Aplicar auto-detecÃ§Ã£o se necessÃ¡rio
            if (!owner) {
                throw new Error('Ã© obrigatÃ³rio');
            }
            if (!params.repo) {
                throw new Error('Repo Ã© obrigatÃ³rio');
            }
            if (!params.issue_number) {
                throw new Error('Issue_number Ã© obrigatÃ³rio');
            }
            const issue = await provider.getIssue((await provider.getCurrentUser()).login, params.repo, params.issue_number);
            return {
                success: true,
                action: 'get',
                message: `Issue #${params.issue_number} obtida com sucesso`,
                data: issue
            };
        }
        catch (error) {
            throw new Error(`Falha ao obter issue: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
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
    async updateIssue(params, provider, owner) {
        try {
            if (!owner) {
                throw new Error('Ã© obrigatÃ³rio');
            }
            if (!params.repo) {
                throw new Error('Repo Ã© obrigatÃ³rio');
            }
            if (!params.issue_number) {
                throw new Error('Issue_number Ã© obrigatÃ³rio');
            }
            const updateData = {};
            if (params.new_title)
                updateData.title = params.new_title;
            if (params.new_body !== undefined)
                updateData.body = params.new_body;
            if (params.new_state)
                updateData.state = params.new_state;
            if (params.new_labels)
                updateData.labels = params.new_labels;
            if (params.new_assignees)
                updateData.assignees = params.new_assignees;
            if (params.new_milestone !== undefined)
                updateData.milestone = params.new_milestone;
            if (Object.keys(updateData).length === 0) {
                throw new Error('Nenhum campo para atualizar foi fornecido');
            }
            const issue = await provider.updateIssue((await provider.getCurrentUser()).login, params.repo, params.issue_number, updateData);
            return {
                success: true,
                action: 'update',
                message: `Issue #${params.issue_number} atualizada com sucesso`,
                data: issue
            };
        }
        catch (error) {
            throw new Error(`Falha ao atualizar issue: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
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
    async closeIssue(params, provider, owner) {
        try {
            if (!owner) {
                throw new Error('Ã© obrigatÃ³rio');
            }
            if (!params.repo) {
                throw new Error('Repo Ã© obrigatÃ³rio');
            }
            if (!params.issue_number) {
                throw new Error('Issue_number Ã© obrigatÃ³rio');
            }
            const issue = await provider.updateIssue((await provider.getCurrentUser()).login, params.repo, params.issue_number, { state: 'closed' });
            return {
                success: true,
                action: 'close',
                message: `Issue #${params.issue_number} fechada com sucesso`,
                data: issue
            };
        }
        catch (error) {
            throw new Error(`Falha ao fechar issue: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
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
    async addComment(params, provider, owner) {
        try {
            if (!owner) {
                throw new Error('Ã© obrigatÃ³rio');
            }
            if (!params.repo) {
                throw new Error('Repo Ã© obrigatÃ³rio');
            }
            if (!params.issue_number) {
                throw new Error('Issue_number Ã© obrigatÃ³rio');
            }
            if (!params.comment_body) {
                throw new Error('Comment_body Ã© obrigatÃ³rio');
            }
            // Verificar se a issue existe
            try {
                await provider.getIssue(owner, params.repo, params.issue_number);
            }
            catch (error) {
                throw new Error(`Issue #${params.issue_number} nÃ£o encontrada no repositÃ³rio`);
            }
            // Adicionar comentÃ¡rio usando o provider
            const comment = await provider.addComment(owner, params.repo, params.issue_number, params.comment_body);
            return {
                success: true,
                action: 'comment',
                message: `ComentÃ¡rio adicionado Ã  issue #${params.issue_number} com sucesso`,
                data: {
                    issue_number: params.issue_number,
                    comment: comment,
                    body: params.comment_body,
                    created_at: comment.created_at,
                    updated_at: comment.updated_at,
                    user: comment.user,
                    html_url: comment.html_url
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao adicionar comentÃ¡rio: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
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
    async searchIssues(params, provider, owner) {
        try {
            if (!owner) {
                throw new Error('Ã© obrigatÃ³rio');
            }
            if (!params.repo) {
                throw new Error('Repo Ã© obrigatÃ³rio');
            }
            if (!params.query) {
                throw new Error('Query Ã© obrigatÃ³rio');
            }
            if (params.query.length < 3) {
                throw new Error('Query deve ter pelo menos 3 caracteres');
            }
            const page = params.page || 1;
            const limit = Math.min(params.limit || 30, 100);
            // Buscar issues usando o provider
            let searchResults = [];
            if (provider.searchIssues) {
                searchResults = await provider.searchIssues(owner, params.repo, params.query, params.author || undefined, params.assignee || undefined, params.label || undefined);
            }
            else {
                // Fallback: buscar todas as issues e filtrar localmente
                const allIssues = await provider.listIssues(owner, params.repo, 'all', 1, 100);
                searchResults = allIssues.filter((issue) => issue.title?.toLowerCase().includes(params.query?.toLowerCase() || '') ||
                    issue.body?.toLowerCase().includes(params.query?.toLowerCase() || ''));
            }
            // Filtrar resultados por pÃ¡gina e limite
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedResults = searchResults.slice(startIndex, endIndex);
            // Aplicar filtros adicionais se especificados
            let filteredResults = paginatedResults;
            if (params.author) {
                filteredResults = filteredResults.filter((issue) => issue.user?.login?.toLowerCase().includes(params.author.toLowerCase()));
            }
            if (params.assignee) {
                filteredResults = filteredResults.filter((issue) => issue.assignees?.some((assignee) => assignee.login?.toLowerCase().includes(params.assignee.toLowerCase())));
            }
            if (params.label) {
                filteredResults = filteredResults.filter((issue) => issue.labels?.some((label) => label.name?.toLowerCase().includes(params.label.toLowerCase())));
            }
            return {
                success: true,
                action: 'search',
                message: `${filteredResults.length} issues encontradas para '${params.query}'`,
                data: {
                    query: params.query,
                    author: params.author || 'todos',
                    assignee: params.assignee || 'todos',
                    label: params.label || 'todos',
                    page,
                    limit,
                    total_found: searchResults.length,
                    results: filteredResults,
                    summary: {
                        total_issues: searchResults.length,
                        filtered_issues: filteredResults.length,
                        states: {
                            open: filteredResults.filter((i) => i.state === 'open').length,
                            closed: filteredResults.filter((i) => i.state === 'closed').length
                        },
                        labels: [...new Set(filteredResults.flatMap((i) => i.labels?.map((l) => l.name) || []).filter(Boolean))],
                        assignees: [...new Set(filteredResults.flatMap((i) => i.assignees?.map((a) => a.login) || []).filter(Boolean))]
                    }
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao buscar issues: ${error instanceof Error ? error.message : String(error)}`);
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
//# sourceMappingURL=git-issues.js.map