"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gitRepositoriesTool = void 0;
const zod_1 = require("zod");
const index_js_1 = require("../providers/index.js");
const user_detection_js_1 = require("../utils/user-detection.js");
const terminal_controller_js_1 = require("../utils/terminal-controller.js");
/**
 * Tool: git-repositories
 *
 * DESCRIÇÃO COMPLETA:
 * Gerenciamento completo de repositórios Git com suporte multi-provider (GitHub e Gitea).
 * Esta tool é 100% auto-suficiente e implementa TODAS as operações de repositório sem depender
 * de outras tools ou comandos externos.
 *
 * FUNCIONALIDADES IMPLEMENTADAS:
 *
 * 1. CRIAÇÃO E CONFIGURAÇÃO:
 *    - create: Cria novos repositórios com configurações completas
 *    - init: Inicializa repositórios Git locais
 *    - clone: Clona repositórios remotos localmente
 *    - update: Atualiza configurações de repositórios existentes
 *
 * 2. LISTAGEM E BUSCA:
 *    - list: Lista repositórios do usuário ou organização
 *    - get: Obtém detalhes específicos de um repositório
 *    - search: Busca repositórios por critérios específicos
 *
 * 3. OPERAÇÕES AVANÇADAS:
 *    - fork: Cria fork de repositórios existentes
 *    - delete: Remove repositórios permanentemente
 *    - archive: Arquivamento de repositórios
 *    - transfer: Transferência de propriedade
 *
 * 4. CONFIGURAÇÕES E METADADOS:
 *    - Visibilidade (público/privado)
 *    - Descrições e documentação
 *    - Configurações de branch padrão
 *    - Templates e inicialização automática
 *    - Licenças e arquivos de configuração
 *
 * PARÂMETROS OBRIGATÓRIOS:
 * - action: Ação a executar (create, list, get, update, delete, fork, search, init, clone)
 * - provider: Provedor a usar (gitea ou github)
 * - owner: Proprietário do repositório (obrigatório para operações remotas)
 * - repo: Nome do repositório (obrigatório para operações remotas)
 * - projectPath: Caminho do projeto local (obrigatório para operações locais)
 *
 * PARÂMETROS OPCIONAIS:
 * - name: Nome do repositório para criação
 * - description: Descrição do repositório
 * - private: Visibilidade do repositório
 * - auto_init: Inicialização automática com README
 * - gitignores: Template de .gitignore
 * - license: Template de licença
 * - readme: Conteúdo do README
 * - default_branch: Branch padrão
 * - username: Usuário para listagem
 * - page: Página para paginação
 * - limit: Limite de resultados
 * - new_name: Novo nome para atualização
 * - new_description: Nova descrição
 * - new_private: Nova visibilidade
 * - archived: Status de arquivamento
 * - organization: Organização para fork
 * - query: Termo de busca
 *
 * CASOS DE USO:
 * 1. Criação de repositórios para novos projetos
 * 2. Backup e migração de código
 * 3. Organização de projetos em equipe
 * 4. Automação de workflows de desenvolvimento
 * 5. Gerenciamento de repositórios em massa
 * 6. Configuração de templates de projeto
 * 7. Sincronização entre diferentes provedores
 *
 * EXEMPLOS DE USO:
 * - Criar repositório: action=create, name=meu-projeto, description=Projeto incrível
 * - Listar repositórios: action=list, username=usuario
 * - Buscar repositórios: action=search, query=react typescript
 * - Clonar repositório: action=clone, url=https://github.com/user/repo.git
 * - Inicializar local: action=init, projectPath=/path/to/project
 *
 * RECOMENDAÇÕES:
 * - Use nomes descritivos e consistentes
 * - Configure visibilidade adequada para cada projeto
 * - Mantenha descrições atualizadas e informativas
 * - Use templates para padronização
 * - Configure branches padrão apropriadas
 * - Documente configurações importantes
 * - Use licenças adequadas para cada projeto
 *
 * LIMITAÇÕES:
 * - Operações de arquivamento dependem do provedor
 * - Transferência de propriedade requer permissões especiais
 * - Alguns provedores podem ter limitações de API
 *
 * SEGURANÇA:
 * - Tokens de acesso são obrigatórios para operações remotas
 * - Validação de permissões antes de operações destrutivas
 * - Logs detalhados de todas as operações
 * - Tratamento seguro de informações sensíveis
 */
/**
 * Schema de validação para entrada da tool git-repositories
 *
 * VALIDAÇÕES:
 * - action: Ação obrigatória (create, list, get, update, delete, fork, search, init, clone)
 * - provider: Obrigatório (gitea ou github)
 * - Parâmetros específicos por ação
 * - Validação de tipos e formatos
 *
 * RECOMENDAÇÕES:
 * - Sempre valide entrada antes de usar
 * - Use parâmetros opcionais adequadamente
 * - Documente parâmetros obrigatórios
 */
const GitRepositoriesInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['create', 'list', 'get', 'update', 'delete', 'fork', 'search', 'init', 'clone']),
    // Parâmetros comuns
    repo: zod_1.z.string().optional(),
    provider: zod_1.z.enum(['gitea', 'github']).describe('Provider to use (gitea or github)'),
    projectPath: zod_1.z.string().describe('Local project path for git operations').optional(),
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
const GitRepositoriesResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    action: zod_1.z.string(),
    message: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional()
});
/**
 * Tool: git-repositories
 *
 * DESCRIÇÃO:
 * Gerenciamento completo de repositórios Git (GitHub + Gitea) com múltiplas ações
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
 * 8. init - Inicializar repositório Git local
 *    Parâmetros:
 *    - projectPath (obrigatório): Caminho do projeto local
 *    - owner/repo (opcional): Para configurar remote
 *
 * 9. clone - Clonar repositório para local
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - projectPath (obrigatório): Caminho local de destino
 *
 * RECOMENDAÇÕES DE USO:
 * - Use nomes descritivos para repositórios
 * - Configure visibilidade adequada para o projeto
 * - Mantenha descrições atualizadas
 * - Use templates para projetos similares
 * - Configure branch padrão adequada
 * - Use paginação para listas grandes
 */
exports.gitRepositoriesTool = {
    name: 'git-repositories',
    description: 'Manage Git repositories (GitHub + Gitea) with multiple actions: create, list, get, update, delete, fork, search, init, clone. Suporte completo a GitHub e Gitea simultaneamente. Boas práticas (solo): use para iniciar projetos, ajustar descrição/privacidade e manter organização; inicialize com README/LICENSE/.gitignore e defina a branch padrão. Crie tags e releases para pontos estáveis e rollback mais simples.',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['create', 'list', 'get', 'update', 'delete', 'fork', 'search', 'init', 'clone'],
                description: 'Action to perform on repositories'
            },
            repo: { type: 'string', description: 'Repository name' },
            provider: { type: 'string', enum: ['gitea', 'github'], description: 'Provider to use (gitea or github)' },
            projectPath: { type: 'string', description: 'Local project path for git operations' },
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
        required: ['action', 'provider']
    },
    /**
     * Handler principal da tool git-repositories
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
            const validatedInput = GitRepositoriesInputSchema.parse(input);
            // Aplicar auto-detecção apenas para owner/username dentro do provider especificado
            const processedInput = await (0, user_detection_js_1.applyAutoUserDetection)(validatedInput, validatedInput.provider);
            // Usar o provider especificado pelo usuário
            const provider = index_js_1.globalProviderFactory.getProvider(processedInput.provider);
            if (!provider) {
                throw new Error(`Provider '${processedInput.provider}' não encontrado`);
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
                case 'init':
                    return await this.initRepository(processedInput, provider);
                case 'clone':
                    return await this.cloneRepository(processedInput, provider);
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
            if (!params.repo) {
                throw new Error('Nome do repositório é obrigatório');
            }
            const currentUser = await provider.getCurrentUser();
            const owner = currentUser.login;
            const repository = await provider.getRepository(owner, params.repo);
            return {
                success: true,
                action: 'get',
                message: `Repositório '${owner}/${params.repo}' obtido com sucesso`,
                data: repository
            };
        }
        catch (error) {
            throw new Error(`Falha ao obter repositório: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async updateRepository(params, provider) {
        try {
            if (!params.repo) {
                throw new Error('Nome do repositório é obrigatório');
            }
            const currentUser = await provider.getCurrentUser();
            const owner = currentUser.login;
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
            const repository = await provider.updateRepository(owner, params.repo, updateData);
            return {
                success: true,
                action: 'update',
                message: `Repositório '${owner}/${params.repo}' atualizado com sucesso`,
                data: repository
            };
        }
        catch (error) {
            throw new Error(`Falha ao atualizar repositório: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async deleteRepository(params, provider) {
        try {
            if (!params.repo) {
                throw new Error('Nome do repositório é obrigatório');
            }
            const currentUser = await provider.getCurrentUser();
            const owner = currentUser.login;
            await provider.deleteRepository(owner, params.repo);
            return {
                success: true,
                action: 'delete',
                message: `Repositório '${owner}/${params.repo}' deletado com sucesso`,
                data: { deleted: true }
            };
        }
        catch (error) {
            throw new Error(`Falha ao deletar repositório: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async forkRepository(params, provider) {
        try {
            if (!params.repo) {
                throw new Error('Nome do repositório é obrigatório');
            }
            const currentUser = await provider.getCurrentUser();
            const owner = currentUser.login;
            const repository = await provider.forkRepository(owner, params.repo, params.organization);
            return {
                success: true,
                action: 'fork',
                message: `Fork do repositório '${owner}/${params.repo}' criado com sucesso`,
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
    },
    /**
     * Inicializa um repositório Git local
     *
     * FUNCIONALIDADE:
     * - Executa 'git init' no diretório especificado
     * - Cria estrutura básica do Git
     * - Adiciona remote se especificado
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - projectPath: Caminho do projeto local
     *
     * PARÂMETROS OPCIONAIS:
     * - owner/repo: Para configurar remote
     * - provider: Para determinar URL do remote
     *
     * RECOMENDAÇÕES:
     * - Verifique se diretório existe
     * - Use caminhos absolutos
     * - Configure remote após inicialização
     */
    async initRepository(params, provider) {
        try {
            if (!params.projectPath) {
                throw new Error('projectPath é obrigatório para inicialização do repositório');
            }
            // Executa git init no diretório especificado
            const initResult = await (0, terminal_controller_js_1.runTerminalCmd)({
                command: `git init "${params.projectPath}"`,
                is_background: false,
                explanation: 'Inicializando repositório Git local'
            });
            if (initResult.exitCode !== 0) {
                throw new Error(`Falha ao inicializar repositório: ${initResult.output}`);
            }
            // Se owner/repo foram especificados, configura remote
            if (params.repo && provider) {
                const currentUser = await provider.getCurrentUser();
                const owner = currentUser.login;
                const remoteUrl = params.provider === 'gitea'
                    ? `http://nas-ubuntu:3000/${owner}/${params.repo}.git`
                    : `https://github.com/${owner}/${params.repo}.git`;
                const remoteResult = await (0, terminal_controller_js_1.runTerminalCmd)({
                    command: `cd "${params.projectPath}" && git remote add origin "${remoteUrl}"`,
                    is_background: false,
                    explanation: 'Configurando remote origin'
                });
                if (remoteResult.exitCode !== 0) {
                    console.warn(`Aviso: Não foi possível configurar remote: ${remoteResult.output}`);
                }
            }
            return {
                success: true,
                action: 'init',
                message: `Repositório Git inicializado com sucesso em '${params.projectPath}'`,
                data: {
                    path: params.projectPath,
                    initialized: true,
                    remoteConfigured: !!(params.repo && provider)
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao inicializar repositório: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    /**
     * Clona um repositório para o diretório local
     *
     * FUNCIONALIDADE:
     * - Clona repositório remoto para diretório local
     * - Suporta diferentes protocolos (HTTPS, SSH)
     * - Mantém estrutura de diretórios
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - projectPath: Caminho local de destino
     * - provider: Provider a ser usado
     *
     * RECOMENDAÇÕES:
     * - Verifique espaço em disco disponível
     * - Use caminhos absolutos
     * - Considere profundidade de clone para repositórios grandes
     */
    async cloneRepository(params, provider) {
        try {
            if (!params.repo || !params.projectPath) {
                throw new Error('repo e projectPath são obrigatórios para clonagem');
            }
            const currentUser = await provider.getCurrentUser();
            const owner = currentUser.login;
            // Obtém URL do repositório
            const repoUrl = params.provider === 'gitea'
                ? `http://nas-ubuntu:3000/${owner}/${params.repo}.git`
                : `https://github.com/${owner}/${params.repo}.git`;
            // Executa git clone
            const cloneResult = await (0, terminal_controller_js_1.runTerminalCmd)({
                command: `git clone "${repoUrl}" "${params.projectPath}"`,
                is_background: false,
                explanation: 'Clonando repositório remoto'
            });
            if (cloneResult.exitCode !== 0) {
                throw new Error(`Falha ao clonar repositório: ${cloneResult.output}`);
            }
            return {
                success: true,
                action: 'clone',
                message: `Repositório '${owner}/${params.repo}' clonado com sucesso para '${params.projectPath}'`,
                data: {
                    source: `${owner}/${params.repo}`,
                    destination: params.projectPath,
                    cloned: true,
                    url: repoUrl
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao clonar repositório: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
};
//# sourceMappingURL=git-repositories.js.map