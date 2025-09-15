"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.repositoriesTool = void 0;
const zod_1 = require("zod");
const index_js_1 = require("../providers/index.js");
const user_detection_js_1 = require("../utils/user-detection.js");
/**
 * Tool: repositories
 *
 * DESCRIÇÃO:
 * Gerenciamento completo de repositórios Gitea com múltiplas ações
 *
 * FUNCIONALIDADES:
 * - Criação de repositórios
 * - Listagem e busca
 * - Atualização e configuração
 * - Fork e clonagem
 * - Exclusão e arquivamento
 *
 * USO:
 * - Para gerenciar repositórios de projetos
 * - Para automatizar criação de repositórios
 * - Para backup e migração
 * - Para organização de código
 *
 * RECOMENDAÇÕES:
 * - Use nomes descritivos para repositórios
 * - Configure visibilidade adequada
 * - Mantenha descrições atualizadas
 * - Use templates quando possível
 */
/**
 * Schema de validação para entrada da tool repositories
 *
 * VALIDAÇÕES:
 * - action: Ação obrigatória (create, list, get, update, delete, fork, search)
 * - provider: Opcional (usa padrão se não especificado)
 * - Parâmetros específicos por ação
 * - Validação de tipos e formatos
 *
 * RECOMENDAÇÕES:
 * - Sempre valide entrada antes de usar
 * - Use parâmetros opcionais adequadamente
 * - Documente parâmetros obrigatórios
 */
const RepositoriesInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['create', 'list', 'get', 'update', 'delete', 'fork', 'search']),
    // Parâmetros comuns
    owner: zod_1.z.string().optional(),
    repo: zod_1.z.string().optional(),
    provider: zod_1.z.enum(['gitea', 'github']).optional().describe('Provider to use (gitea or github, optional - uses default if not specified)'),
    name: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    private: zod_1.z.boolean().optional(),
    auto_init: zod_1.z.boolean().optional(),
    gitignores: zod_1.z.string().optional(),
    license: zod_1.z.string().optional(),
    readme: zod_1.z.string().optional(),
    default_branch: zod_1.z.string().optional(),
    // Para list
    username: zod_1.z.string().optional(),
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    // Para update
    new_name: zod_1.z.string().optional(),
    new_description: zod_1.z.string().optional(),
    new_private: zod_1.z.boolean().optional(),
    archived: zod_1.z.boolean().optional(),
    // Para fork
    organization: zod_1.z.string().optional(),
    // Para search
    query: zod_1.z.string().optional(),
});
// Schema de saída
const RepositoriesResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    action: zod_1.z.string(),
    message: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional()
});
/**
 * Tool: repositories
 *
 * DESCRIÇÃO:
 * Gerenciamento completo de repositórios Gitea com múltiplas ações
 *
 * ACTIONS DISPONÍVEIS:
 *
 * 1. create - Criar novo repositório
 *    Parâmetros:
 *    - name (obrigatório): Nome do repositório
 *    - description (opcional): Descrição do repositório
 *    - private (opcional): Repositório privado (padrão: false)
 *    - auto_init (opcional): Inicializar com README (padrão: false)
 *    - gitignores (opcional): Template de .gitignore
 *    - license (opcional): Template de licença
 *    - readme (opcional): Conteúdo do README
 *    - default_branch (opcional): Branch padrão
 *
 * 2. list - Listar repositórios
 *    Parâmetros:
 *    - username (opcional): Usuário específico (padrão: usuário atual)
 *    - page (opcional): Página da listagem (padrão: 1)
 *    - limit (opcional): Itens por página (padrão: 30)
 *
 * 3. get - Obter detalhes do repositório
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *
 * 4. update - Atualizar repositório
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - new_name (opcional): Novo nome
 *    - new_description (opcional): Nova descrição
 *    - new_private (opcional): Nova visibilidade
 *    - archived (opcional): Status de arquivamento
 *
 * 5. delete - Deletar repositório
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *
 * 6. fork - Fazer fork do repositório
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório original
 *    - repo (obrigatório): Nome do repositório original
 *    - organization (opcional): Organização de destino
 *
 * 7. search - Buscar repositórios
 *    Parâmetros:
 *    - query (obrigatório): Termo de busca
 *    - page (opcional): Página da busca (padrão: 1)
 *    - limit (opcional): Itens por página (padrão: 30)
 *
 * RECOMENDAÇÕES DE USO:
 * - Use nomes descritivos para repositórios
 * - Configure visibilidade adequada para o projeto
 * - Mantenha descrições atualizadas
 * - Use templates para projetos similares
 * - Configure branch padrão adequada
 * - Use paginação para listas grandes
 */
exports.repositoriesTool = {
    name: 'repositories',
    description: 'Manage repositories with multiple actions: create, list, get, update, delete, fork, search. Suporte completo a GitHub e Gitea simultaneamente. Boas práticas (solo): use para iniciar projetos, ajustar descrição/privacidade e manter organização; inicialize com README/LICENSE/.gitignore e defina a branch padrão. Crie tags e releases para pontos estáveis e rollback mais simples.',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['create', 'list', 'get', 'update', 'delete', 'fork', 'search'],
                description: 'Action to perform on repositories'
            },
            owner: { type: 'string', description: 'Repository owner' },
            repo: { type: 'string', description: 'Repository name' },
            provider: { type: 'string', enum: ['gitea', 'github'], description: 'Provider to use (gitea or github)' },
            name: { type: 'string', description: 'Repository name for creation' },
            description: { type: 'string', description: 'Repository description' },
            private: { type: 'boolean', description: 'Private repository' },
            auto_init: { type: 'boolean', description: 'Auto initialize with README' },
            gitignores: { type: 'string', description: 'Gitignore template' },
            license: { type: 'string', description: 'License template' },
            readme: { type: 'string', description: 'README content' },
            default_branch: { type: 'string', description: 'Default branch name' },
            username: { type: 'string', description: 'Username for listing repos' },
            page: { type: 'number', description: 'Page number', minimum: 1 },
            limit: { type: 'number', description: 'Items per page', minimum: 1, maximum: 100 },
            new_name: { type: 'string', description: 'New repository name' },
            new_description: { type: 'string', description: 'New repository description' },
            new_private: { type: 'boolean', description: 'New privacy setting' },
            archived: { type: 'boolean', description: 'Archive status' },
            organization: { type: 'string', description: 'Organization for fork' },
            query: { type: 'string', description: 'Search query' }
        },
        required: ['action']
    },
    /**
     * Handler principal da tool repositories
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
            const validatedInput = RepositoriesInputSchema.parse(input);
            // Aplicar auto-detecção apenas para owner/username dentro do provider especificado
            const processedInput = await (0, user_detection_js_1.applyAutoUserDetection)(validatedInput, validatedInput.provider);
            // Usar o provider especificado pelo usuário ou o padrão se não especificado
            let provider;
            try {
                if (processedInput.provider) {
                    const requestedProvider = index_js_1.globalProviderFactory.getProvider(processedInput.provider);
                    if (!requestedProvider) {
                        console.warn(`[REPOSITORIES] Provider '${processedInput.provider}' não encontrado, usando padrão`);
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
                    throw new Error('Nenhum provider disponível');
                }
            }
            catch (providerError) {
                console.error('[REPOSITORIES] Erro ao obter provider:', providerError);
                throw new Error(`Erro de configuração do provider: ${providerError instanceof Error ? providerError.message : 'Provider não disponível'}`);
            }
            switch (processedInput.action) {
                case 'create':
                    return await this.createRepository(processedInput, provider);
                case 'list':
                    return await this.listRepositories(processedInput, provider);
                case 'get':
                    return await this.getRepository(processedInput, provider);
                case 'update':
                    return await this.updateRepository(processedInput, provider);
                case 'delete':
                    return await this.deleteRepository(processedInput, provider);
                case 'fork':
                    return await this.forkRepository(processedInput, provider);
                case 'search':
                    return await this.searchRepositories(processedInput, provider);
                default:
                    throw new Error(`Ação não suportada: ${processedInput.action}`);
            }
        }
        catch (error) {
            return {
                success: false,
                action: input.action,
                message: 'Erro na operação de repositórios',
                error: error instanceof Error ? error.message : String(error)
            };
        }
    },
    /**
     * Cria um novo repositório
     *
     * FUNCIONALIDADE:
     * - Valida parâmetros obrigatórios
     * - Configura dados padrão
     * - Chama API do provider para criação
     * - Retorna resultado formatado
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - name: Nome do repositório
     *
     * PARÂMETROS OPCIONAIS:
     * - description: Descrição do repositório
     * - private: Visibilidade (padrão: false)
     * - auto_init: Inicializar com README (padrão: false)
     * - gitignores: Template de .gitignore
     * - license: Template de licença
     * - readme: Conteúdo do README
     * - default_branch: Branch padrão (padrão: main)
     *
     * VALIDAÇÕES:
     * - Nome obrigatório
     * - Nome único no usuário/organização
     * - Permissões adequadas
     *
     * RECOMENDAÇÕES:
     * - Use nomes descritivos e únicos
     * - Configure visibilidade adequada
     * - Inicialize com README para projetos novos
     * - Use templates para consistência
     */
    async createRepository(params, provider) {
        try {
            if (!params.name) {
                throw new Error('Nome do repositório é obrigatório');
            }
            const repository = await provider.createRepository(params.name, params.description, params.private || false);
            return {
                success: true,
                action: 'create',
                message: `Repositório '${params.name}' criado com sucesso`,
                data: repository
            };
        }
        catch (error) {
            throw new Error(`Falha ao criar repositório: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async listRepositories(params, provider) {
        try {
            const page = params.page || 1;
            const limit = params.limit || 30;
            const repositories = await provider.listRepositories(params.username, page, limit);
            return {
                success: true,
                action: 'list',
                message: `${repositories.length} repositórios encontrados`,
                data: {
                    repositories,
                    page,
                    limit,
                    total: repositories.length
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao listar repositórios: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async getRepository(params, provider) {
        try {
            if (!params.owner || !params.repo) {
                throw new Error('Owner e nome do repositório são obrigatórios');
            }
            const repository = await provider.getRepository(params.owner, params.repo);
            return {
                success: true,
                action: 'get',
                message: `Repositório '${params.owner}/${params.repo}' obtido com sucesso`,
                data: repository
            };
        }
        catch (error) {
            throw new Error(`Falha ao obter repositório: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async updateRepository(params, provider) {
        try {
            if (!params.owner || !params.repo) {
                throw new Error('Owner e nome do repositório são obrigatórios');
            }
            const updateData = {};
            if (params.new_name)
                updateData.name = params.new_name;
            if (params.new_description !== undefined)
                updateData.description = params.new_description;
            if (params.new_private !== undefined)
                updateData.private = params.new_private;
            if (params.archived !== undefined)
                updateData.archived = params.archived;
            if (Object.keys(updateData).length === 0) {
                throw new Error('Nenhum campo para atualizar foi fornecido');
            }
            const repository = await provider.updateRepository(params.owner, params.repo, updateData);
            return {
                success: true,
                action: 'update',
                message: `Repositório '${params.owner}/${params.repo}' atualizado com sucesso`,
                data: repository
            };
        }
        catch (error) {
            throw new Error(`Falha ao atualizar repositório: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async deleteRepository(params, provider) {
        try {
            if (!params.owner || !params.repo) {
                throw new Error('Owner e nome do repositório são obrigatórios');
            }
            await provider.deleteRepository(params.owner, params.repo);
            return {
                success: true,
                action: 'delete',
                message: `Repositório '${params.owner}/${params.repo}' deletado com sucesso`,
                data: { deleted: true }
            };
        }
        catch (error) {
            throw new Error(`Falha ao deletar repositório: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async forkRepository(params, provider) {
        try {
            if (!params.owner || !params.repo) {
                throw new Error('Owner e nome do repositório são obrigatórios');
            }
            const repository = await provider.forkRepository(params.owner, params.repo, params.organization);
            return {
                success: true,
                action: 'fork',
                message: `Fork do repositório '${params.owner}/${params.repo}' criado com sucesso`,
                data: repository
            };
        }
        catch (error) {
            throw new Error(`Falha ao fazer fork do repositório: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async searchRepositories(params, provider) {
        try {
            if (!params.query) {
                throw new Error('Query de busca é obrigatória');
            }
            const page = params.page || 1;
            const limit = params.limit || 30;
            const repositories = await provider.searchRepositories(params.query, page, limit);
            return {
                success: true,
                action: 'search',
                message: `${repositories.length} repositórios encontrados para '${params.query}'`,
                data: {
                    repositories,
                    query: params.query,
                    page,
                    limit,
                    total: repositories.length
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao buscar repositórios: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
};
//# sourceMappingURL=repositories.js.map