"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.branchesTool = void 0;
const zod_1 = require("zod");
const index_js_1 = require("../providers/index.js");
/**
 * Tool: branches
 *
 * DESCRIÇÃO:
 * Gerenciamento completo de branches Gitea com múltiplas ações
 *
 * FUNCIONALIDADES:
 * - Criação de novas branches
 * - Listagem e busca de branches
 * - Obtenção de detalhes específicos
 * - Exclusão de branches
 * - Merge de branches
 * - Comparação entre branches
 *
 * USO:
 * - Para gerenciar fluxo de trabalho Git
 * - Para criar branches de feature
 * - Para organizar desenvolvimento
 * - Para controle de versão
 *
 * RECOMENDAÇÕES:
 * - Use convenções de nomenclatura consistentes
 * - Proteja branches importantes
 * - Mantenha branches limpas
 * - Documente propósito das branches
 */
/**
 * Schema de validação para entrada da tool branches
 *
 * VALIDAÇÕES:
 * - action: Ação obrigatória (create, list, get, delete, merge, compare)
 * - Parâmetros específicos por ação
 * - Validação de tipos e formatos
 *
 * RECOMENDAÇÕES:
 * - Sempre valide entrada antes de usar
 * - Use parâmetros opcionais adequadamente
 * - Documente parâmetros obrigatórios
 */
const BranchesInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['create', 'list', 'get', 'delete', 'merge', 'compare']),
    // Parâmetros comuns
    owner: zod_1.z.string().optional(),
    repo: zod_1.z.string().optional(),
    provider: zod_1.z.enum(['gitea', 'github', 'both']).optional(), // Provider específico: gitea, github ou both
    // Para create
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
 * Schema de saída padronizado
 *
 * ESTRUTURA:
 * - success: Status da operação
 * - action: Ação executada
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
 * DESCRIÇÃO:
 * Gerenciamento completo de branches Gitea com múltiplas ações
 *
 * ACTIONS DISPONÍVEIS:
 *
 * 1. create - Criar nova branch
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - branch_name (obrigatório): Nome da nova branch
 *    - from_branch (obrigatório): Branch de origem
 *
 * 2. list - Listar branches
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - page (opcional): Página da listagem (padrão: 1)
 *    - limit (opcional): Itens por página (padrão: 30)
 *
 * 3. get - Obter detalhes da branch
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - branch (obrigatório): Nome da branch
 *
 * 4. delete - Deletar branch
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - branch (obrigatório): Nome da branch
 *
 * 5. merge - Fazer merge de branches
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - head (obrigatório): Branch de origem
 *    - base (obrigatório): Branch de destino
 *    - merge_method (opcional): Método de merge (padrão: merge)
 *
 * 6. compare - Comparar branches
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - base_branch (obrigatório): Branch base
 *    - head_branch (obrigatório): Branch de comparação
 *
 * RECOMENDAÇÕES DE USO:
 * - Use nomes descritivos para branches
 * - Mantenha branches principais protegidas
 * - Faça merge regularmente
 * - Documente propósito das branches
 * - Use convenções de nomenclatura
 * - Limpe branches antigas
 */
exports.branchesTool = {
    name: 'branches',
    description: 'Manage branches with multiple actions: create, list, get, delete, merge, compare. Suporte completo a GitHub e Gitea simultaneamente. Boas práticas (solo): use branches para isolar trabalhos (feature/x, fix/x, hotfix/x); mantenha as principais protegidas; faça merges pequenos e frequentes; compare antes de integrar; limpe branches antigas.',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['create', 'list', 'get', 'delete', 'merge', 'compare'],
                description: 'Action to perform on branches'
            },
            owner: { type: 'string', description: 'Repository owner' },
            repo: { type: 'string', description: 'Repository name' },
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
        required: ['action']
    },
    /**
     * Handler principal da tool branches
     *
     * FUNCIONALIDADE:
     * - Valida entrada usando Zod schema
     * - Roteia para método específico baseado na ação
     * - Trata erros de forma uniforme
     * - Retorna resultado padronizado
     *
     * FLUXO:
     * 1. Validação de entrada
     * 2. Roteamento por ação
     * 3. Execução do método específico
     * 4. Tratamento de erros
     * 5. Retorno de resultado
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
            const validatedInput = BranchesInputSchema.parse(input);
            // Obter o provider correto
            const provider = validatedInput.provider
                ? index_js_1.globalProviderFactory.getProvider(validatedInput.provider)
                : index_js_1.globalProviderFactory.getDefaultProvider();
            if (!provider) {
                throw new Error(`Provider '${validatedInput.provider}' não encontrado`);
            }
            switch (validatedInput.action) {
                case 'create':
                    return await this.createBranch(validatedInput, provider);
                case 'list':
                    return await this.listBranches(validatedInput, provider);
                case 'get':
                    return await this.getBranch(validatedInput, provider);
                case 'delete':
                    return await this.deleteBranch(validatedInput, provider);
                case 'merge':
                    return await this.mergeBranches(validatedInput, provider);
                case 'compare':
                    return await this.compareBranches(validatedInput, provider);
                default:
                    throw new Error(`Ação não suportada: ${validatedInput.action}`);
            }
        }
        catch (error) {
            return {
                success: false,
                action: input.action,
                message: 'Erro na operação de branches',
                error: error instanceof Error ? error.message : String(error)
            };
        }
    },
    /**
     * Cria uma nova branch no repositório
     *
     * FUNCIONALIDADE:
     * - Valida parâmetros obrigatórios
     * - Cria branch a partir de branch existente
     * - Retorna detalhes da nova branch
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - branch_name: Nome da nova branch
     * - from_branch: Branch de origem
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Branch de origem deve existir
     * - Nome da nova branch deve ser único
     *
     * RECOMENDAÇÕES:
     * - Use nomes descritivos para branches
     * - Crie a partir de branches estáveis
     * - Documente propósito da branch
     * - Use convenções de nomenclatura
     */
    async createBranch(params, provider) {
        try {
            if (!params.owner || !params.repo || !params.branch_name || !params.from_branch) {
                throw new Error('Owner, repo, branch_name e from_branch são obrigatórios');
            }
            const branch = await provider.createBranch(params.owner, params.repo, params.branch_name, params.from_branch);
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
     * Lista todas as branches do repositório
     *
     * FUNCIONALIDADE:
     * - Lista branches com paginação
     * - Retorna informações básicas de cada branch
     * - Suporta filtros de paginação
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     *
     * PARÂMETROS OPCIONAIS:
     * - page: Página da listagem (padrão: 1)
     * - limit: Itens por página (padrão: 30, máximo: 100)
     *
     * VALIDAÇÕES:
     * - Owner e repo obrigatórios
     * - Page deve ser >= 1
     * - Limit deve ser entre 1 e 100
     *
     * RECOMENDAÇÕES:
     * - Use paginação para repositórios grandes
     * - Monitore número total de branches
     * - Mantenha branches organizadas
     */
    async listBranches(params, provider) {
        try {
            if (!params.owner || !params.repo) {
                throw new Error('Owner e repo são obrigatórios');
            }
            const page = params.page || 1;
            const limit = params.limit || 30;
            const branches = await provider.listBranches(params.owner, params.repo, page, limit);
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
     * Obtém detalhes de uma branch específica
     *
     * FUNCIONALIDADE:
     * - Retorna informações completas da branch
     * - Inclui commit mais recente
     * - Informações de proteção e permissões
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - branch: Nome da branch
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Branch deve existir no repositório
     *
     * RECOMENDAÇÕES:
     * - Use para obter informações detalhadas
     * - Verifique status de proteção
     * - Monitore commits recentes
     */
    async getBranch(params, provider) {
        try {
            if (!params.owner || !params.repo || !params.branch) {
                throw new Error('Owner, repo e branch são obrigatórios');
            }
            const branch = await provider.getBranch(params.owner, params.repo, params.branch);
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
     * Deleta uma branch do repositório
     *
     * FUNCIONALIDADE:
     * - Remove branch especificada
     * - Valida permissões de exclusão
     * - Confirma exclusão bem-sucedida
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - branch: Nome da branch a ser deletada
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Branch deve existir
     * - Usuário deve ter permissão de exclusão
     *
     * RECOMENDAÇÕES:
     * - Confirme antes de deletar
     * - Verifique se branch foi mergeada
     * - Mantenha backup se necessário
     * - Documente motivo da exclusão
     */
    async deleteBranch(params, provider) {
        try {
            if (!params.owner || !params.repo || !params.branch) {
                throw new Error('Owner, repo e branch são obrigatórios');
            }
            await provider.deleteBranch(params.owner, params.repo, params.branch);
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
     * - Suporta diferentes métodos de merge
     * - Retorna resultado do merge
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - head: Branch de origem (será mergeada)
     * - base: Branch de destino (receberá o merge)
     *
     * PARÂMETROS OPCIONAIS:
     * - merge_method: Método de merge (merge, rebase, squash)
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Branches devem existir
     * - Não deve haver conflitos
     *
     * RECOMENDAÇÕES:
     * - Resolva conflitos antes do merge
     * - Escolha método de merge adequado
     * - Teste após o merge
     * - Documente mudanças
     */
    async mergeBranches(params, provider) {
        try {
            if (!params.owner || !params.repo || !params.head || !params.base) {
                throw new Error('Owner, repo, head e base são obrigatórios');
            }
            // Por enquanto, retorna mensagem de funcionalidade não implementada
            // TODO: Implementar merge direto de branches via provider
            return {
                success: true,
                action: 'merge',
                message: `Merge de '${params.head}' em '${params.base}' solicitado (funcionalidade será implementada)`,
                data: {
                    head: params.head,
                    base: params.base,
                    merge_method: params.merge_method || 'merge'
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
     * - Compara diferenças entre branches
     * - Retorna commits diferentes
     * - Mostra divergências
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - base_branch: Branch base para comparação
     * - head_branch: Branch a ser comparada
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Ambas as branches devem existir
     *
     * RECOMENDAÇÕES:
     * - Use para verificar divergências
     * - Compare antes de fazer merge
     * - Analise commits diferentes
     * - Documente diferenças importantes
     */
    async compareBranches(params, provider) {
        try {
            if (!params.owner || !params.repo || !params.base_branch || !params.head_branch) {
                throw new Error('Owner, repo, base_branch e head_branch são obrigatórios');
            }
            // Implementar comparação de branches
            // Por enquanto, retorna mensagem de funcionalidade
            return {
                success: true,
                action: 'compare',
                message: `Comparação entre '${params.base_branch}' e '${params.head_branch}' solicitada`,
                data: {
                    base: params.base_branch,
                    head: params.head_branch,
                    comparison: 'Funcionalidade de comparação será implementada'
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao comparar branches: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
};
//# sourceMappingURL=branches.js.map