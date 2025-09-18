"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.branchesTool = void 0;
const zod_1 = require("zod");
const index_js_1 = require("../providers/index.js");
const user_detection_js_1 = require("../utils/user-detection.js");
/**
 * Tool: branches
 *
 * DESCRIÃ‡ÃƒO:
 * Gerenciamento completo de branches Gitea com mÃºltiplas aÃ§Ãµes
 *
 * FUNCIONALIDADES:
 * - CriaÃ§Ã£o de novas branches
 * - Listagem e busca de branches
 * - ObtenÃ§Ã£o de detalhes especÃ­ficos
 * - ExclusÃ£o de branches
 * - Merge de branches
 * - ComparaÃ§Ã£o entre branches
 *
 * USO:
 * - Para gerenciar fluxo de trabalho Git
 * - Para criar branches de feature
 * - Para organizar desenvolvimento
 * - Para controle de versÃ£o
 *
 * RECOMENDAÃ‡Ã•ES:
 * - Use convenÃ§Ãµes de nomenclatura consistentes
 * - Proteja branches importantes
 * - Mantenha branches limpas
 * - Documente propÃ³sito das branches
 */
/**
 * Schema de validaÃ§Ã£o para entrada da tool branches
 *
 * VALIDAÃ‡Ã•ES:
 * - action: AÃ§Ã£o obrigatÃ³ria (create, list, get, delete, merge, compare)
 * - ParÃ¢metros especÃ­ficos por aÃ§Ã£o
 * - ValidaÃ§Ã£o de tipos e formatos
 *
 * RECOMENDAÃ‡Ã•ES:
 * - Sempre valide entrada antes de usar
 * - Use parÃ¢metros opcionais adequadamente
 * - Documente parÃ¢metros obrigatÃ³rios
 */
const BranchesInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['create', 'list', 'get', 'delete', 'merge', 'compare']),
    // ParÃ¢metros comuns
    repo: zod_1.z.string(),
    projectPath: zod_1.z.string().describe('Local project path for git operations'),
    provider: zod_1.z.enum(['gitea', 'github']).describe('Provider to use (gitea or github)'), // Para create
    branch_name: zod_1.z.string().optional(),
    from_branch: zod_1.z.string().optional(),
    // Para get/delete
    branch: zod_1.z.string().optional(),
    // Para merge
    head: zod_1.z.string().optional(),
    base: zod_1.z.string().optional(),
    merge_method: zod_1.z.enum(['merge', 'rebase', 'squash']).optional(),
    // Para list
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    // Para compare
    base_branch: zod_1.z.string().optional(),
    head_branch: zod_1.z.string().optional(),
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
const BranchesResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    action: zod_1.z.string(),
    message: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional()
});
/**
 * Tool: branches
 *
 * DESCRIÃ‡ÃƒO:
 * Gerenciamento completo de branches Gitea com mÃºltiplas aÃ§Ãµes
 *
 * ACTIONS DISPONÃVEIS:
 *
 * 1. create - Criar nova branch
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - branch_name (obrigatÃ³rio): Nome da nova branch
 *    - from_branch (obrigatÃ³rio): Branch de origem
 *
 * 2. list - Listar branches
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - page (opcional): PÃ¡gina da listagem (padrÃ£o: 1)
 *    - limit (opcional): Itens por pÃ¡gina (padrÃ£o: 30)
 *
 * 3. get - Obter detalhes da branch
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - branch (obrigatÃ³rio): Nome da branch
 *
 * 4. delete - Deletar branch
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - branch (obrigatÃ³rio): Nome da branch
 *
 * 5. merge - Fazer merge de branches
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - head (obrigatÃ³rio): Branch de origem
 *    - base (obrigatÃ³rio): Branch de destino
 *    - merge_method (opcional): MÃ©todo de merge (padrÃ£o: merge)
 *
 * 6. compare - Comparar branches
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - base_branch (obrigatÃ³rio): Branch base
 *    - head_branch (obrigatÃ³rio): Branch de comparaÃ§Ã£o
 *
 * RECOMENDAÃ‡Ã•ES DE USO:
 * - Use nomes descritivos para branches
 * - Mantenha branches principais protegidas
 * - FaÃ§a merge regularmente
 * - Documente propÃ³sito das branches
 * - Use convenÃ§Ãµes de nomenclatura
 * - Limpe branches antigas
 */
exports.branchesTool = {
    name: 'git-branches',
    description: 'tool: Gerencia branches Git, criaÃ§Ã£o, listagem, merge e comparaÃ§Ã£o\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction create: cria nova branch\naction create requires: repo, branch_name, from_branch, provider, projectPath\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction list: lista branches do repositÃ³rio\naction list requires: repo, page, limit, provider, projectPath\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction get: obtÃ©m detalhes de branch\naction get requires: repo, branch, provider, projectPath\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction delete: remove branch\naction delete requires: repo, branch, provider, projectPath\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction merge: integra branches\naction merge requires: repo, head, base, merge_method, provider, projectPath\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction compare: compara branches\naction compare requires: repo, base_branch, head_branch, provider, projectPath',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['create', 'list', 'get', 'delete', 'merge', 'compare'],
                description: 'Action to perform on branches'
            },
            repo: { type: 'string', description: 'Repository name' },
            projectPath: { type: 'string', description: 'Local project path for git operations' },
            provider: { type: 'string', description: 'Specific provider (github, gitea) or use default' },
            branch_name: { type: 'string', description: 'Name of the new branch' },
            from_branch: { type: 'string', description: 'Source branch for creation' },
            branch: { type: 'string', description: 'Branch name' },
            head: { type: 'string', description: 'Source branch for merge' },
            base: { type: 'string', description: 'Target branch for merge' },
            merge_method: {
                type: 'string',
                enum: ['merge', 'rebase', 'squash'],
                description: 'Merge method'
            },
            page: { type: 'number', description: 'Page number', minimum: 1 },
            limit: { type: 'number', description: 'Items per page', minimum: 1, maximum: 100 },
            base_branch: { type: 'string', description: 'Base branch for comparison' },
            head_branch: { type: 'string', description: 'Head branch for comparison' }
        },
        required: ['action', 'repo', 'provider', 'projectPath']
    },
    /**
     * Handler principal da tool branches
     *
     * FUNCIONALIDADE:
     * - Valida entrada usando Zod schema
     * - Roteia para mÃ©todo especÃ­fico baseado na aÃ§Ã£o
     * - Trata erros de forma uniforme
     * - Retorna resultado padronizado
     *
     * FLUXO:
     * 1. ValidaÃ§Ã£o de entrada
     * 2. Roteamento por aÃ§Ã£o
     * 3. ExecuÃ§Ã£o do mÃ©todo especÃ­fico
     * 4. Tratamento de erros
     * 5. Retorno de resultado
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
            const validatedInput = BranchesInputSchema.parse(input);
            // Aplicar auto-detecÃ§Ã£o apenas para owner dentro do provider especificado
            const processedInput = await (0, user_detection_js_1.applyAutoUserDetection)(validatedInput, validatedInput.provider);
            // Usar o provider especificado pelo usuÃ¡rio ou o padrÃ£o se nÃ£o especificado
            let provider;
            try {
                if (processedInput.provider) {
                    const requestedProvider = index_js_1.globalProviderFactory.getProvider(processedInput.provider);
                    if (!requestedProvider) {
                        console.warn(`[BRANCHES] Provider '${processedInput.provider}' nÃ£o encontrado, usando padrÃ£o`);
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
                console.error('[BRANCHES] Erro ao obter provider:', providerError);
                throw new Error(`Erro de configuraÃ§Ã£o do provider: ${providerError instanceof Error ? providerError.message : 'Provider nÃ£o disponÃ­vel'}`);
            }
            switch (processedInput.action) {
                case 'create':
                    return await this.createBranch(processedInput, provider);
                case 'list':
                    return await this.listBranches(processedInput, provider);
                case 'get':
                    return await this.getBranch(processedInput, provider);
                case 'delete':
                    return await this.deleteBranch(processedInput, provider);
                case 'merge':
                    return await this.mergeBranches(processedInput, provider);
                case 'compare':
                    return await this.compareBranches(processedInput, provider);
                default:
                    throw new Error(`AÃ§Ã£o nÃ£o suportada: ${processedInput.action}`);
            }
        }
        catch (error) {
            return {
                success: false,
                action: input.action,
                message: 'Erro na operaÃ§Ã£o de branches',
                error: error instanceof Error ? error.message : String(error)
            };
        }
    },
    /**
     * Cria uma nova branch no repositÃ³rio
     *
     * FUNCIONALIDADE:
     * - Valida parÃ¢metros obrigatÃ³rios
     * - Cria branch a partir de branch existente
     * - Retorna detalhes da nova branch
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - branch_name: Nome da nova branch
     * - from_branch: Branch de origem
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Branch de origem deve existir
     * - Nome da nova branch deve ser Ãºnico
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use nomes descritivos para branches
     * - Crie a partir de branches estÃ¡veis
     * - Documente propÃ³sito da branch
     * - Use convenÃ§Ãµes de nomenclatura
     */
    async createBranch(params, provider) {
        try {
            if (!params.repo || !params.branch_name || !params.from_branch) {
                throw new Error('Repo, branch_name e from_branch sÃ£o obrigatÃ³rios');
            }
            const currentUser = await provider.getCurrentUser();
            const owner = currentUser.login;
            const branch = await provider.createBranch(owner, params.repo, params.branch_name, params.from_branch);
            return {
                success: true,
                action: 'create',
                message: `Branch '${params.branch_name}' criada com sucesso a partir de '${params.from_branch}'`,
                data: branch
            };
        }
        catch (error) {
            throw new Error(`Falha ao criar branch: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    /**
     * Lista todas as branches do repositÃ³rio
     *
     * FUNCIONALIDADE:
     * - Lista branches com paginaÃ§Ã£o
     * - Retorna informaÃ§Ãµes bÃ¡sicas de cada branch
     * - Suporta filtros de paginaÃ§Ã£o
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     *
     * PARÃ‚METROS OPCIONAIS:
     * - page: PÃ¡gina da listagem (padrÃ£o: 1)
     * - limit: Itens por pÃ¡gina (padrÃ£o: 30, mÃ¡ximo: 100)
     *
     * VALIDAÃ‡Ã•ES:
     * - e repo obrigatÃ³rios
     * - Page deve ser >= 1
     * - Limit deve ser entre 1 e 100
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use paginaÃ§Ã£o para repositÃ³rios grandes
     * - Monitore nÃºmero total de branches
     * - Mantenha branches organizadas
     */
    async listBranches(params, provider) {
        try {
            if (!params.repo) {
                throw new Error('Repo Ã© obrigatÃ³rio');
            }
            const currentUser = await provider.getCurrentUser();
            const owner = currentUser.login;
            const page = params.page || 1;
            const limit = params.limit || 30;
            const branches = await provider.listBranches((await provider.getCurrentUser()).login, params.repo, page, limit);
            return {
                success: true,
                action: 'list',
                message: `${branches.length} branches encontradas`,
                data: {
                    branches,
                    page,
                    limit,
                    total: branches.length
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao listar branches: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    /**
     * ObtÃ©m detalhes de uma branch especÃ­fica
     *
     * FUNCIONALIDADE:
     * - Retorna informaÃ§Ãµes completas da branch
     * - Inclui commit mais recente
     * - InformaÃ§Ãµes de proteÃ§Ã£o e permissÃµes
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - branch: Nome da branch
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Branch deve existir no repositÃ³rio
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use para obter informaÃ§Ãµes detalhadas
     * - Verifique status de proteÃ§Ã£o
     * - Monitore commits recentes
     */
    async getBranch(params, provider) {
        try {
            if (!params.repo || !params.branch) {
                throw new Error('Repo e branch sÃ£o obrigatÃ³rios');
            }
            const currentUser = await provider.getCurrentUser();
            const owner = currentUser.login;
            const branch = await provider.getBranch((await provider.getCurrentUser()).login, params.repo, params.branch);
            return {
                success: true,
                action: 'get',
                message: `Branch '${params.branch}' obtida com sucesso`,
                data: branch
            };
        }
        catch (error) {
            throw new Error(`Falha ao obter branch: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    /**
     * Deleta uma branch do repositÃ³rio
     *
     * FUNCIONALIDADE:
     * - Remove branch especificada
     * - Valida permissÃµes de exclusÃ£o
     * - Confirma exclusÃ£o bem-sucedida
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - branch: Nome da branch a ser deletada
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Branch deve existir
     * - UsuÃ¡rio deve ter permissÃ£o de exclusÃ£o
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Confirme antes de deletar
     * - Verifique se branch foi mergeada
     * - Mantenha backup se necessÃ¡rio
     * - Documente motivo da exclusÃ£o
     */
    async deleteBranch(params, provider) {
        try {
            if (!params.repo || !params.branch) {
                throw new Error('Repo e branch sÃ£o obrigatÃ³rios');
            }
            const currentUser = await provider.getCurrentUser();
            const owner = currentUser.login;
            await provider.deleteBranch((await provider.getCurrentUser()).login, params.repo, params.branch);
            return {
                success: true,
                action: 'delete',
                message: `Branch '${params.branch}' deletada com sucesso`,
                data: { deleted: true }
            };
        }
        catch (error) {
            throw new Error(`Falha ao deletar branch: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    /**
     * Faz merge de uma branch em outra
     *
     * FUNCIONALIDADE:
     * - Merge de branch de origem em branch de destino
     * - Suporta diferentes mÃ©todos de merge
     * - Retorna resultado do merge
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - head: Branch de origem (serÃ¡ mergeada)
     * - base: Branch de destino (receberÃ¡ o merge)
     *
     * PARÃ‚METROS OPCIONAIS:
     * - merge_method: MÃ©todo de merge (merge, rebase, squash)
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Branches devem existir
     * - NÃ£o deve haver conflitos
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Resolva conflitos antes do merge
     * - Escolha mÃ©todo de merge adequado
     * - Teste apÃ³s o merge
     * - Documente mudanÃ§as
     */
    async mergeBranches(params, provider) {
        try {
            if (!params.repo || !params.head || !params.base) {
                throw new Error('Repo, head e base sÃ£o obrigatÃ³rios');
            }
            const currentUser = await provider.getCurrentUser();
            const owner = currentUser.login;
            const mergeMethod = params.merge_method || 'merge';
            // Verificar se as branches existem
            try {
                await provider.getBranch(owner, params.repo, params.head);
                await provider.getBranch(owner, params.repo, params.base);
            }
            catch (error) {
                throw new Error(`Uma das branches nÃ£o existe: ${params.head} ou ${params.base}`);
            }
            // Criar pull request para fazer o merge
            const prTitle = `Merge ${params.head} into ${params.base}`;
            const prBody = `Merge automÃ¡tico da branch '${params.head}' na branch '${params.base}'\n\nMÃ©todo: ${mergeMethod}`;
            const pullRequest = await provider.createPullRequest(owner, params.repo, prTitle, prBody, params.head, params.base);
            // Se o merge_method for merge direto, fazer merge automÃ¡tico
            if (mergeMethod === 'merge') {
                try {
                    await provider.mergePullRequest(owner, params.repo, pullRequest.number, 'merge');
                    return {
                        success: true,
                        action: 'merge',
                        message: `Merge de '${params.head}' em '${params.base}' realizado com sucesso`,
                        data: {
                            head: params.head,
                            base: params.base,
                            merge_method: mergeMethod,
                            pull_request: pullRequest,
                            merged: true
                        }
                    };
                }
                catch (mergeError) {
                    return {
                        success: true,
                        action: 'merge',
                        message: `Pull request criado para merge de '${params.head}' em '${params.base}' (merge automÃ¡tico falhou)`,
                        data: {
                            head: params.head,
                            base: params.base,
                            merge_method: mergeMethod,
                            pull_request: pullRequest,
                            merged: false,
                            merge_error: mergeError instanceof Error ? mergeError.message : String(mergeError)
                        }
                    };
                }
            }
            return {
                success: true,
                action: 'merge',
                message: `Pull request criado para merge de '${params.head}' em '${params.base}'`,
                data: {
                    head: params.head,
                    base: params.base,
                    merge_method: mergeMethod,
                    pull_request: pullRequest,
                    requires_manual_review: true
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao fazer merge: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    /**
     * Compara duas branches
     *
     * FUNCIONALIDADE:
     * - Compara diferenÃ§as entre branches
     * - Retorna commits diferentes
     * - Mostra divergÃªncias
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - base_branch: Branch base para comparaÃ§Ã£o
     * - head_branch: Branch a ser comparada
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Ambas as branches devem existir
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use para verificar divergÃªncias
     * - Compare antes de fazer merge
     * - Analise commits diferentes
     * - Documente diferenÃ§as importantes
     */
    async compareBranches(params, provider) {
        try {
            if (!params.repo || !params.base_branch || !params.head_branch) {
                throw new Error('Repo, base_branch e head_branch sÃ£o obrigatÃ³rios');
            }
            const currentUser = await provider.getCurrentUser();
            const owner = currentUser.login;
            // Verificar se as branches existem
            try {
                const baseBranch = await provider.getBranch(owner, params.repo, params.base_branch);
                const headBranch = await provider.getBranch(owner, params.repo, params.head_branch);
            }
            catch (error) {
                throw new Error(`Uma das branches nÃ£o existe: ${params.base_branch} ou ${params.head_branch}`);
            }
            // Obter commits de cada branch
            const baseCommits = await provider.listCommits(owner, params.repo, params.base_branch, 1, 10);
            const headCommits = await provider.listCommits(owner, params.repo, params.head_branch, 1, 10);
            // Comparar commits (simplificado - apenas verificar se hÃ¡ commits diferentes)
            const baseCommitShas = baseCommits.map(c => c.sha);
            const headCommitShas = headCommits.map(c => c.sha);
            const uniqueBaseCommits = baseCommits.filter(c => !headCommitShas.includes(c.sha));
            const uniqueHeadCommits = headCommits.filter(c => !baseCommitShas.includes(c.sha));
            // Usar compareCommits se disponÃ­vel no provider
            let detailedComparison = null;
            try {
                if (provider.compareCommits) {
                    detailedComparison = await provider.compareCommits(owner, params.repo, params.base_branch, params.head_branch);
                }
            }
            catch (error) {
                console.warn('ComparaÃ§Ã£o detalhada nÃ£o disponÃ­vel:', error);
            }
            return {
                success: true,
                action: 'compare',
                message: `ComparaÃ§Ã£o entre '${params.base_branch}' e '${params.head_branch}' realizada com sucesso`,
                data: {
                    base: {
                        branch: params.base_branch,
                        commits: baseCommits.length,
                        unique_commits: uniqueBaseCommits.length,
                        last_commit: baseCommits[0]?.sha
                    },
                    head: {
                        branch: params.head_branch,
                        commits: headCommits.length,
                        unique_commits: uniqueHeadCommits.length,
                        last_commit: headCommits[0]?.sha
                    },
                    comparison: {
                        base_ahead: uniqueBaseCommits.length,
                        head_ahead: uniqueHeadCommits.length,
                        divergent: uniqueBaseCommits.length > 0 && uniqueHeadCommits.length > 0,
                        mergeable: true, // Assumir mergeable por padrÃ£o
                        detailed: detailedComparison
                    },
                    summary: {
                        can_merge: uniqueBaseCommits.length === 0 || uniqueHeadCommits.length === 0,
                        requires_merge: uniqueBaseCommits.length > 0 && uniqueHeadCommits.length > 0,
                        recommendation: uniqueBaseCommits.length === 0 ? 'head estÃ¡ Ã  frente' :
                            uniqueHeadCommits.length === 0 ? 'base estÃ¡ Ã  frente' :
                                'branches divergiram'
                    }
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao comparar branches: ${error instanceof Error ? error.message : String(error)}`);
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
//# sourceMappingURL=git-branches.js.map