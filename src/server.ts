import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { config } from './config.js';
import { globalProviderFactory, initializeFactoryFromEnv } from './providers/index.js';

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
import { gitRepositoriesTool } from './tools/git-repositories.js';
import { commitsTool } from './tools/git-commits.js';
import { branchesTool } from './tools/git-branches.js';
import { tagsTool } from './tools/git-tags.js';
import { filesTool } from './tools/git-files.js';
import { uploadProjectTool } from './tools/git-upload-project.js';
import { issuesTool } from './tools/git-issues.js';
import { pullsTool } from './tools/git-pulls.js';
import { releasesTool } from './tools/git-releases.js';
import { webhooksTool } from './tools/git-webhooks.js';
import { gitRebaseTool } from './tools/git-rebase.js';
import { gitResetTool } from './tools/git-reset.js';
import { gitRevertTool } from './tools/git-revert.js';
import { gitStashTool } from './tools/git-stash.js';
import { gitConfigTool } from './tools/git-config.js';
import { gitRemoteTool } from './tools/git-remote.js';

// Git Avançado Tools (5)
import { gitCherryPickTool } from './tools/git-cherry-pick.js';
import { gitSubmoduleTool } from './tools/git-submodule.js';
import { gitWorktreeTool } from './tools/git-worktree.js';
import { gitArchiveTool } from './tools/git-archive.js';
import { gitBundleTool } from './tools/git-bundle.js';

// GitHub Exclusivo Tools (10)
import { workflowsTool } from './tools/gh-workflows.js';
import { actionsTool } from './tools/gh-actions.js';
import { deploymentsTool } from './tools/gh-deployments.js';
import { securityTool } from './tools/gh-security.js';
import { analyticsTool } from './tools/gh-analytics.js';
import { codeReviewTool } from './tools/gh-code-review.js';
import { ghGistsTool } from './tools/gh-gists.js';
import { ghCodespacesTool } from './tools/gh-codespaces.js';
import { ghProjectsTool } from './tools/gh-projects.js';
import { ghSyncTool } from './tools/gh-sync.js';

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
  gitRepositoriesTool,
  commitsTool,
  branchesTool,
  tagsTool,
  filesTool,
  uploadProjectTool,
  issuesTool,
  pullsTool,
  releasesTool,
  webhooksTool,
  gitRebaseTool,
  gitResetTool,
  gitRevertTool,
  gitStashTool,
  gitConfigTool,
  gitRemoteTool,
  
  // Git Avançado Tools (5) - GitHub + Gitea
  gitCherryPickTool,
  gitSubmoduleTool,
  gitWorktreeTool,
  gitArchiveTool,
  gitBundleTool,
  
  // GitHub Exclusivo Tools (10) - Apenas GitHub
  workflowsTool,
  actionsTool,
  deploymentsTool,
  securityTool,
  analyticsTool,
  codeReviewTool,
  ghGistsTool,
  ghCodespacesTool,
  ghProjectsTool,
  ghSyncTool
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
          name: 'git-mcp',
          version: '2.16.0',
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
      console.log('[SERVER] Inicializando provider factory...');
      const factory = initializeFactoryFromEnv();

      // Log detalhado dos providers configurados
      try {
        const providersInfo = factory.getProvidersInfo();
        console.log('[SERVER] Providers configurados:');
        providersInfo.forEach(p => {
          console.log(`  - ${p.name} (${p.type}) ${p.isDefault ? '[PADRÃO]' : ''}`);
        });
      } catch (infoError) {
        console.log('[SERVER] Não foi possível obter informações detalhadas dos providers');
      }

      // Atualizar o globalProviderFactory com a configuração
      Object.assign(globalProviderFactory, factory);

      console.log('[SERVER] Provider factory inicializado com sucesso');
    } catch (error) {
      console.error('[SERVER] Erro ao inicializar providers:', error);

      // Tenta criar um provider fallback se houver falha completa
      try {
        console.log('[SERVER] Tentando criar provider fallback...');

        // Criar provider GitHub básico como fallback
        const fallbackConfig = {
          name: 'github-fallback',
          type: 'github' as const,
          apiUrl: 'https://api.github.com',
          token: process.env.GITHUB_TOKEN || 'dummy_token',
          username: process.env.GITHUB_USERNAME
        };

        const fallbackProvider = globalProviderFactory.createProvider(fallbackConfig);
        globalProviderFactory.setDefaultProvider('github-fallback');

        console.log('[SERVER] Provider fallback criado com sucesso');
      } catch (fallbackError) {
        console.error('[SERVER] Falha ao criar provider fallback:', fallbackError);
        // Continua sem provider - algumas tools podem não funcionar
      }
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
