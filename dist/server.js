"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GiteaMCPServer = void 0;
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const config_js_1 = require("./config.js");
const index_js_2 = require("./providers/index.js");
/**
 * Importação de todas as ferramentas MCP disponíveis (30 tools)
 *
 * GIT CORE (15 tools) - Funcionam com GitHub + Gitea:
 * - git-repositories: Gerenciamento de repositórios
 * - git-commits: Operações com commits
 * - git-branches: Operações com branches
 * - git-tags: Gerenciamento de tags
 * - git-files: Gerenciamento de arquivos
 * - git-issues: Gerenciamento de issues
 * - git-pulls: Pull requests e merges
 * - git-releases: Gerenciamento de releases
 * - git-webhooks: Gerenciamento de webhooks
 * - git-rebase: Operações de rebase
 * - git-reset: Operações de reset
 * - git-revert: Operações de revert
 * - git-stash: Gerenciamento de stash
 * - git-config: Configuração do Git
 * - git-remote: Gerenciamento de remotes
 *
 * GIT AVANÇADO (5 tools) - Funcionam com GitHub + Gitea:
 * - git-cherry-pick: Cherry-pick de commits
 * - git-submodule: Gerenciamento de submódulos
 * - git-worktree: Gerenciamento de worktrees
 * - git-archive: Criação de arquivos
 * - git-bundle: Transferência de repositórios
 *
 * GITHUB EXCLUSIVO (10 tools) - Apenas GitHub:
 * - gh-workflows: GitHub Actions workflows
 * - gh-actions: GitHub Actions runs
 * - gh-deployments: GitHub Deployments
 * - gh-security: GitHub Security
 * - gh-analytics: GitHub Analytics
 * - gh-code-review: GitHub Code Review
 * - gh-gists: GitHub Gists
 * - gh-codespaces: GitHub Codespaces
 * - gh-projects: GitHub Projects
 * - gh-sync: GitHub Sync
 */
// Git Core Tools (15)
const git_repositories_js_1 = require("./tools/git-repositories.js");
const git_commits_js_1 = require("./tools/git-commits.js");
const git_branches_js_1 = require("./tools/git-branches.js");
const git_tags_js_1 = require("./tools/git-tags.js");
const git_files_js_1 = require("./tools/git-files.js");
const git_upload_project_js_1 = require("./tools/git-upload-project.js");
const git_issues_js_1 = require("./tools/git-issues.js");
const git_pulls_js_1 = require("./tools/git-pulls.js");
const git_releases_js_1 = require("./tools/git-releases.js");
const git_webhooks_js_1 = require("./tools/git-webhooks.js");
const git_rebase_js_1 = require("./tools/git-rebase.js");
const git_reset_js_1 = require("./tools/git-reset.js");
const git_revert_js_1 = require("./tools/git-revert.js");
const git_stash_js_1 = require("./tools/git-stash.js");
const git_config_js_1 = require("./tools/git-config.js");
const git_remote_js_1 = require("./tools/git-remote.js");
// Git Avançado Tools (5)
const git_cherry_pick_js_1 = require("./tools/git-cherry-pick.js");
const git_submodule_js_1 = require("./tools/git-submodule.js");
const git_worktree_js_1 = require("./tools/git-worktree.js");
const git_archive_js_1 = require("./tools/git-archive.js");
const git_bundle_js_1 = require("./tools/git-bundle.js");
// GitHub Exclusivo Tools (10)
const gh_workflows_js_1 = require("./tools/gh-workflows.js");
const gh_actions_js_1 = require("./tools/gh-actions.js");
const gh_deployments_js_1 = require("./tools/gh-deployments.js");
const gh_security_js_1 = require("./tools/gh-security.js");
const gh_analytics_js_1 = require("./tools/gh-analytics.js");
const gh_code_review_js_1 = require("./tools/gh-code-review.js");
const gh_gists_js_1 = require("./tools/gh-gists.js");
const gh_codespaces_js_1 = require("./tools/gh-codespaces.js");
const gh_projects_js_1 = require("./tools/gh-projects.js");
const gh_sync_js_1 = require("./tools/gh-sync.js");
/**
 * Array de todas as ferramentas disponíveis (30 tools)
 *
 * ESTRUTURA:
 * - Cada tool deve implementar a interface Tool
 * - Nome, descrição e schema são obrigatórios
 * - Handler deve ser assíncrono e retornar resultado
 *
 * ORGANIZAÇÃO:
 * - Git Core (15): Funcionam com GitHub + Gitea
 * - Git Avançado (5): Funcionam com GitHub + Gitea
 * - GitHub Exclusivo (10): Apenas GitHub
 *
 * USO:
 * - Para listagem de tools disponíveis
 * - Para execução de tools específicas
 * - Para validação de parâmetros
 */
const tools = [
    // Git Core Tools (15) - GitHub + Gitea
    git_repositories_js_1.gitRepositoriesTool,
    git_commits_js_1.commitsTool,
    git_branches_js_1.branchesTool,
    git_tags_js_1.tagsTool,
    git_files_js_1.filesTool,
    git_upload_project_js_1.uploadProjectTool,
    git_issues_js_1.issuesTool,
    git_pulls_js_1.pullsTool,
    git_releases_js_1.releasesTool,
    git_webhooks_js_1.webhooksTool,
    git_rebase_js_1.gitRebaseTool,
    git_reset_js_1.gitResetTool,
    git_revert_js_1.gitRevertTool,
    git_stash_js_1.gitStashTool,
    git_config_js_1.gitConfigTool,
    git_remote_js_1.gitRemoteTool,
    // Git Avançado Tools (5) - GitHub + Gitea
    git_cherry_pick_js_1.gitCherryPickTool,
    git_submodule_js_1.gitSubmoduleTool,
    git_worktree_js_1.gitWorktreeTool,
    git_archive_js_1.gitArchiveTool,
    git_bundle_js_1.gitBundleTool,
    // GitHub Exclusivo Tools (10) - Apenas GitHub
    gh_workflows_js_1.workflowsTool,
    gh_actions_js_1.actionsTool,
    gh_deployments_js_1.deploymentsTool,
    gh_security_js_1.securityTool,
    gh_analytics_js_1.analyticsTool,
    gh_code_review_js_1.codeReviewTool,
    gh_gists_js_1.ghGistsTool,
    gh_codespaces_js_1.ghCodespacesTool,
    gh_projects_js_1.ghProjectsTool,
    gh_sync_js_1.ghSyncTool
];
/**
 * Servidor MCP principal para Gitea
 *
 * RESPONSABILIDADES:
 * - Inicializar servidor MCP
 * - Registrar handlers para requests
 * - Gerenciar ciclo de vida das tools
 * - Tratar erros e validações
 *
 * ARQUITETURA:
 * - Server MCP padrão com transport stdio
 * - Handlers para list e call de tools
 * - Tratamento centralizado de erros
 *
 * RECOMENDAÇÕES:
 * - Use apenas uma instância por processo
 * - Configure handlers antes de conectar
 * - Implemente graceful shutdown
 */
class GiteaMCPServer {
    server;
    constructor() {
        this.server = new index_js_1.Server({
            name: 'git-mcp',
            version: '2.16.0',
        });
        this.setupHandlers();
    }
    /**
     * Configura os handlers para requests MCP
     *
     * HANDLERS IMPLEMENTADOS:
     * - ListTools: Lista todas as tools disponíveis
     * - CallTool: Executa uma tool específica
     *
     * FLUXO:
     * 1. Validação de parâmetros
     * 2. Busca da tool solicitada
     * 3. Execução com tratamento de erros
     * 4. Retorno de resultado ou erro
     *
     * TRATAMENTO DE ERROS:
     * - Tool não encontrada: erro específico
     * - Erro de execução: captura e formata
     * - Erro de validação: mensagem descritiva
     */
    setupHandlers() {
        // Handler para listar tools disponíveis
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
            return {
                tools: tools.map(tool => ({
                    name: tool.name,
                    description: tool.description,
                    inputSchema: tool.inputSchema
                }))
            };
        });
        // Handler para executar tools específicas
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            // Busca a tool solicitada
            const tool = tools.find(t => t.name === name);
            if (!tool) {
                throw new Error(`Tool '${name}' not found`);
            }
            try {
                // Executa o handler da tool
                const result = await tool.handler(args || {});
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2)
                        }
                    ]
                };
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: false,
                                action: name,
                                message: 'Erro na execução da tool',
                                error: errorMessage
                            }, null, 2)
                        }
                    ],
                    isError: true
                };
            }
        });
    }
    /**
     * Inicializa e executa o servidor MCP
     *
     * FLUXO DE INICIALIZAÇÃO:
     * 1. Validação de configuração
     * 2. Verificação de token obrigatório
     * 3. Conexão com transport stdio
     * 4. Log de status e debug
     *
     * VALIDAÇÕES:
     * - Token de autenticação obrigatório
     * - URL do Gitea válida
     * - Configuração de debug opcional
     *
     * RECOMENDAÇÕES:
     * - Configure DEBUG=true para desenvolvimento
     * - Valide token antes de iniciar
     * - Configure timeout adequado
     */
    async run() {
        const cfg = config_js_1.config.getConfig();
        if (cfg.debug) {
            // Server starting - debug info removed for MCP protocol compliance
        }
        // Inicializar provider factory com configuração
        try {
            console.log('[SERVER] Inicializando provider factory...');
            const factory = (0, index_js_2.initializeFactoryFromEnv)();
            // Log detalhado dos providers configurados
            try {
                const providersInfo = factory.getProvidersInfo();
                console.log('[SERVER] Providers configurados:');
                providersInfo.forEach(p => {
                    console.log(`  - ${p.name} (${p.type}) ${p.isDefault ? '[PADRÃO]' : ''}`);
                });
            }
            catch (infoError) {
                console.log('[SERVER] Não foi possível obter informações detalhadas dos providers');
            }
            // Atualizar o globalProviderFactory com a configuração
            Object.assign(index_js_2.globalProviderFactory, factory);
            console.log('[SERVER] Provider factory inicializado com sucesso');
        }
        catch (error) {
            console.error('[SERVER] Erro ao inicializar providers:', error);
            // Tenta criar um provider fallback se houver falha completa
            try {
                console.log('[SERVER] Tentando criar provider fallback...');
                // Criar provider GitHub básico como fallback
                const fallbackConfig = {
                    name: 'github-fallback',
                    type: 'github',
                    apiUrl: 'https://api.github.com',
                    token: process.env.GITHUB_TOKEN || 'dummy_token',
                    username: process.env.GITHUB_USERNAME
                };
                const fallbackProvider = index_js_2.globalProviderFactory.createProvider(fallbackConfig);
                index_js_2.globalProviderFactory.setDefaultProvider('github-fallback');
                console.log('[SERVER] Provider fallback criado com sucesso');
            }
            catch (fallbackError) {
                console.error('[SERVER] Falha ao criar provider fallback:', fallbackError);
                // Continua sem provider - algumas tools podem não funcionar
            }
        }
        const transport = new stdio_js_1.StdioServerTransport();
        await this.server.connect(transport);
        if (cfg.debug) {
            // Server connected and ready
        }
    }
    /**
     * Fecha o servidor MCP graciosamente
     *
     * USO:
     * - Durante shutdown da aplicação
     * - Para limpeza de recursos
     * - Para finalização controlada
     *
     * RECOMENDAÇÕES:
     * - Sempre chame antes de sair
     * - Aguarde a conclusão da operação
     * - Trate erros de fechamento
     */
    async close() {
        await this.server.close();
    }
}
exports.GiteaMCPServer = GiteaMCPServer;
/**
 * Handlers para sinais do sistema
 *
 * SINAIS TRATADOS:
 * - SIGINT: Interrupção do usuário (Ctrl+C)
 * - unhandledRejection: Promises rejeitadas
 * - uncaughtException: Exceções não tratadas
 *
 * COMPORTAMENTO:
 * - SIGINT: Shutdown gracioso
 * - Erros não tratados: Exit com código 1
 * - Log de erro antes de sair
 *
 * RECOMENDAÇÕES:
 * - Implemente graceful shutdown
 * - Log todos os erros fatais
 * - Use códigos de saída apropriados
 */
// Handler para interrupção do usuário (Ctrl+C)
process.on('SIGINT', async () => {
    // Shutting down server
    process.exit(0);
});
// Handler para promises rejeitadas não tratadas
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
// Handler para exceções não tratadas
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map