"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GiteaMCPServer = void 0;
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const config_js_1 = require("./config.js");
const index_js_2 = require("./providers/index.js");
/**
 * Importação de todas as ferramentas MCP disponíveis
 *
 * FERRAMENTAS INCLUÍDAS:
 * - repositories: Gerenciamento de repositórios
 * - branches: Operações com branches
 * - files: Gerenciamento de arquivos
 * - commits: Histórico de commits
 * - issues: Gerenciamento de issues
 * - pulls: Pull requests e merges
 * - releases: Gerenciamento de releases
 * - tags: Gerenciamento de tags
 * - users: Operações com usuários
 * - webhooks: Gerenciamento de webhooks
 */
const repositories_js_1 = require("./tools/repositories.js");
const branches_js_1 = require("./tools/branches.js");
const files_js_1 = require("./tools/files.js");
const commits_js_1 = require("./tools/commits.js");
const issues_js_1 = require("./tools/issues.js");
const pulls_js_1 = require("./tools/pulls.js");
const releases_js_1 = require("./tools/releases.js");
const tags_js_1 = require("./tools/tags.js");
const users_js_1 = require("./tools/users.js");
const webhooks_js_1 = require("./tools/webhooks.js");
const git_sync_js_1 = require("./tools/git-sync.js");
const version_control_js_1 = require("./tools/version-control.js");
/**
 * Array de todas as ferramentas disponíveis
 *
 * ESTRUTURA:
 * - Cada tool deve implementar a interface Tool
 * - Nome, descrição e schema são obrigatórios
 * - Handler deve ser assíncrono e retornar resultado
 *
 * USO:
 * - Para listagem de tools disponíveis
 * - Para execução de tools específicas
 * - Para validação de parâmetros
 */
const tools = [
    repositories_js_1.repositoriesTool,
    branches_js_1.branchesTool,
    files_js_1.filesTool,
    commits_js_1.commitsTool,
    issues_js_1.issuesTool,
    pulls_js_1.pullsTool,
    releases_js_1.releasesTool,
    tags_js_1.tagsTool,
    users_js_1.usersTool,
    webhooks_js_1.webhooksTool,
    git_sync_js_1.gitSyncTool,
    version_control_js_1.versionControlTool
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
            name: 'gitea-mcp-v2',
            version: '2.0.0',
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
            const factory = (0, index_js_2.initializeFactoryFromEnv)();
            // Atualizar o globalProviderFactory com a configuração
            Object.assign(index_js_2.globalProviderFactory, factory);
        }
        catch (error) {
            throw new Error(`Failed to initialize providers: ${error instanceof Error ? error.message : 'Unknown error'}`);
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