import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { config } from './config.js';
import { globalProviderFactory, initializeFactoryFromEnv } from './providers/index.js';

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
import { repositoriesTool } from './tools/repositories.js';
import { branchesTool } from './tools/branches.js';
import { filesTool } from './tools/files.js';
import { commitsTool } from './tools/commits.js';
import { issuesTool } from './tools/issues.js';
import { pullsTool } from './tools/pulls.js';
import { releasesTool } from './tools/releases.js';
import { tagsTool } from './tools/tags.js';
import { usersTool } from './tools/users.js';
import { webhooksTool } from './tools/webhooks.js';
import { gitSyncTool } from './tools/git-sync.js';
import { versionControlTool } from './tools/version-control.js';

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
  repositoriesTool,
  branchesTool,
  filesTool,
  commitsTool,
  issuesTool,
  pullsTool,
  releasesTool,
  tagsTool,
  usersTool,
  webhooksTool,
  gitSyncTool,
  versionControlTool
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
export class GiteaMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'gitea-mcp-v2',
        version: '2.0.0',
      }
    );

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
  private setupHandlers(): void {
    // Handler para listar tools disponíveis
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: tools.map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema
        }))
      };
    });

    // Handler para executar tools específicas
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      // Busca a tool solicitada
      const tool = tools.find(t => t.name === name);
      if (!tool) {
        throw new Error(`Tool '${name}' not found`);
      }

      try {
        // Executa o handler da tool
        const result = await tool.handler(args as any || {});
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error) {
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
  async run(): Promise<void> {
    const cfg = config.getConfig();
    
    if (cfg.debug) {
      // Server starting - debug info removed for MCP protocol compliance
    }

    // Inicializar provider factory com configuração
    try {
      const factory = initializeFactoryFromEnv();
      // Atualizar o globalProviderFactory com a configuração
      Object.assign(globalProviderFactory, factory);
    } catch (error) {
      throw new Error(`Failed to initialize providers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    const transport = new StdioServerTransport();
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
  async close(): Promise<void> {
    await this.server.close();
  }
}

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
