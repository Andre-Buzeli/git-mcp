"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GiteaMCPServer = void 0;
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const config_js_1 = require("./config.js");
const index_js_2 = require("./providers/index.js");
/**
 * Importação de todas as ferramentas MCP disponíveis (21 tools)
 *
 * GIT CORE (21 tools) - Funcionam com GitHub + Gitea:
 * - git-repositories: Gerenciamento de repositórios
 * - git-commits: Operações com commits
 * - git-pulls: Pull requests e merges
 * - git-branches: Operações com branches
 * - git-tags: Gerenciamento de tags
 * - git-files: Gerenciamento de arquivos
 * - git-upload-project: Upload completo de projeto
 * - git-update-project: Atualização incremental de projeto
 * - git-initialize: Inicialização completa de repositório
 * - git-issues: Gerenciamento de issues
 * - git-releases: Gerenciamento de releases
 * - git-webhooks: Gerenciamento de webhooks
 * - git-reset: Operações de reset
 * - git-revert: Operações de revert
 * - git-stash: Gerenciamento de stash
 * - git-config: Configuração do Git
 * - git-remote: Gerenciamento de remotes
 * - git-archive: Criação de arquivos
 * - git-sync: Sincronização de repositórios
 * - git-packages: Gerenciamento de pacotes
 * - git-projects: Gerenciamento de projetos
 */
// Git Core Tools (21)
const git_repositories_js_1 = require("./tools/git-repositories.js");
const git_commits_js_1 = require("./tools/git-commits.js");
const git_branches_js_1 = require("./tools/git-branches.js");
const git_tags_js_1 = require("./tools/git-tags.js");
const git_files_js_1 = require("./tools/git-files.js");
const git_upload_project_js_1 = require("./tools/git-upload-project.js");
const git_update_project_js_1 = require("./tools/git-update-project.js");
const git_initialize_js_1 = require("./tools/git-initialize.js");
const git_issues_js_1 = require("./tools/git-issues.js");
const git_pulls_js_1 = require("./tools/git-pulls.js");
const git_releases_js_1 = require("./tools/git-releases.js");
// import { webhooksTool } from './tools/git-webhooks.js';
const git_reset_js_1 = require("./tools/git-reset.js");
const git_revert_js_1 = require("./tools/git-revert.js");
const git_stash_js_1 = require("./tools/git-stash.js");
const git_config_js_1 = require("./tools/git-config.js");
const git_remote_js_1 = require("./tools/git-remote.js");
const git_archive_js_1 = require("./tools/git-archive.js");
const git_sync_js_1 = require("./tools/git-sync.js");
const git_packages_js_1 = require("./tools/git-packages.js");
const git_projects_js_1 = require("./tools/git-projects.js");
/**
 * Array de todas as ferramentas disponíveis (21 tools)
 *
 * ESTRUTURA:
 * - Cada tool deve implementar a interface Tool
 * - Nome, descrição e schema são obrigatórios
 * - Handler deve ser assíncrono e retornar resultado
 *
 * ORGANIZAÇÃO:
 * - Git Core (21): Funcionam com GitHub + Gitea
 *
 * USO:
 * - Para listagem de tools disponíveis
 * - Para execução de tools específicas
 * - Para validação de parâmetros
 */
const tools = [
    // Git Core Tools (21) - GitHub + Gitea
    git_repositories_js_1.gitRepositoriesTool,
    git_commits_js_1.commitsTool,
    git_branches_js_1.branchesTool,
    git_tags_js_1.tagsTool,
    git_files_js_1.filesTool,
    git_upload_project_js_1.uploadProjectTool,
    git_update_project_js_1.gitUpdateProjectTool,
    git_initialize_js_1.initializeTool,
    git_issues_js_1.issuesTool,
    git_pulls_js_1.pullsTool,
    git_releases_js_1.releasesTool,
    // webhooksTool,
    git_reset_js_1.gitResetTool,
    git_revert_js_1.gitRevertTool,
    git_stash_js_1.gitStashTool,
    git_config_js_1.gitConfigTool,
    git_remote_js_1.gitRemoteTool,
    git_archive_js_1.gitArchiveTool,
    git_sync_js_1.gitSyncTool,
    git_packages_js_1.gitPackagesTool,
    git_projects_js_1.gitProjectsTool
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
            version: '2.37.0',
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
            // console.log('[SERVER] Inicializando provider factory...');
            const factory = (0, index_js_2.initializeFactoryFromEnv)();
            // Log detalhado dos providers configurados
            try {
                const providersInfo = factory.getProvidersInfo();
                // console.log('[SERVER] Providers configurados:');
                // providersInfo.forEach(p => {
                //   console.log(`  - ${p.name} (${p.type}) ${p.isDefault ? '[PADRÃO]' : ''}`);
                // });
            }
            catch (infoError) {
                // console.log('[SERVER] Não foi possível obter informações detalhadas dos providers');
            }
            // Atualizar o globalProviderFactory com a configuração
            Object.assign(index_js_2.globalProviderFactory, factory);
            // console.log('[SERVER] Provider factory inicializado com sucesso');
        }
        catch (error) {
            console.error('[SERVER] Erro ao inicializar providers:', error);
            // Tenta criar um provider fallback se houver falha completa
            try {
                // console.log('[SERVER] Tentando criar provider fallback...');
                // Criar provider GitHub básico como fallback
                const fallbackConfig = {
                    name: 'github-fallback',
                    type: 'github',
                    apiUrl: 'https://api.github.com',
                    baseUrl: 'https://github.com',
                    token: process.env.GITHUB_TOKEN || 'dummy_token',
                    username: process.env.GITHUB_USERNAME
                };
                const fallbackProvider = index_js_2.globalProviderFactory.createProvider(fallbackConfig);
                index_js_2.globalProviderFactory.setDefaultProvider('github-fallback');
                // console.log('[SERVER] Provider fallback criado com sucesso');
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