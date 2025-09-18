import { z } from 'zod';
import { globalProviderFactory, VcsOperations } from '../providers/index.js';
import { applyAutoUserDetection } from '../utils/user-detection.js';
import { runTerminalCmd } from '../utils/terminal-controller.js';

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
const RepositoriesInputSchema = z.object({
  action: z.enum(['create', 'list', 'get', 'update', 'delete', 'fork', 'search', 'init', 'clone']),

  // Parâmetros comuns
  // owner: obtido automaticamente do provider,
  repo: z.string(),
  provider: z.enum(['gitea', 'github']).describe('Provider to use (gitea or github)'),
  projectPath: z.string().describe('Local project path for git operations'),
  name: z.string().optional(),
  description: z.string().optional(),
  private: z.boolean().optional(),
  auto_init: z.boolean().optional(),
  gitignores: z.string().optional(),
  license: z.string().optional(),
  readme: z.string().optional(),
  default_branch: z.string().optional(),

  // Para list
  username: z.string().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),

  // Para update
  new_name: z.string().optional(),
  new_description: z.string().optional(),
  new_private: z.boolean().optional(),
  archived: z.boolean().optional(),

  // Para fork
  organization: z.string().optional(),

  // Para search
  query: z.string().optional(),
});

export type RepositoriesInput = z.infer<typeof RepositoriesInputSchema>;

// Schema de saída
const RepositoriesResultSchema = z.object({
  success: z.boolean(),
  action: z.string(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional()
});

export type RepositoriesResult = z.infer<typeof RepositoriesResultSchema>;

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
export const repositoriesTool = {
  name: 'repositories',
  description: 'Manage repositories with multiple actions: create, list, get, update, delete, fork, search. Suporte completo a GitHub e Gitea simultaneamente. Boas práticas (solo): use para iniciar projetos, ajustar descrição/privacidade e manter organização; inicialize com README/LICENSE/.gitignore e defina a branch padrão. Crie tags e releases para pontos estáveis e rollback mais simples.',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['create', 'list', 'get', 'update', 'delete', 'fork', 'search', 'init', 'clone'],
        description: 'Action to perform on repositories'
      },
      owner: { type: 'string', description: 'Repository owner' },
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
    required: ['action', 'owner', 'repo', 'provider', 'projectPath']
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
  async handler(input: RepositoriesInput): Promise<RepositoriesResult> {
    try {
      const validatedInput = RepositoriesInputSchema.parse(input);
      
      // Aplicar auto-detecção apenas para owner/username dentro do provider especificado
      const processedInput = await applyAutoUserDetection(validatedInput, validatedInput.provider);

      // Usar o provider especificado pelo usuário ou o padrão se não especificado
      let provider: VcsOperations;
      try {
        if (processedInput.provider) {
          const requestedProvider = globalProviderFactory.getProvider(processedInput.provider);
          if (!requestedProvider) {
            console.warn(`[REPOSITORIES] Provider '${processedInput.provider}' não encontrado, usando padrão`);
            provider = globalProviderFactory.getDefaultProvider();
          } else {
            provider = requestedProvider;
          }
        } else {
          provider = globalProviderFactory.getDefaultProvider();
        }

        if (!provider) {
          throw new Error('Nenhum provider disponível');
        }
      } catch (providerError) {
        console.error('[REPOSITORIES] Erro ao obter provider:', providerError);
        throw new Error(`Erro de configuração do provider: ${providerError instanceof Error ? providerError.message : 'Provider não disponível'}`);
      }

      // Obter o owner do provider
      const owner = (await provider.getCurrentUser()).login;
      
      switch (processedInput.action) {
        case 'create':
          return await this.createRepository(processedInput, provider, owner);
        case 'list':
          return await this.listRepositories(processedInput, provider, owner);
        case 'get':
          return await this.getRepository(processedInput, provider, owner);
        case 'update':
          return await this.updateRepository(processedInput, provider, owner);
        case 'delete':
          return await this.deleteRepository(processedInput, provider, owner);
        case 'fork':
          return await this.forkRepository(processedInput, provider, owner);
        case 'search':
          return await this.searchRepositories(processedInput, provider, owner);
        case 'init':
          return await this.initRepository(processedInput, provider, owner);
        case 'clone':
          return await this.cloneRepository(processedInput, provider, owner);
        default:
          throw new Error(`Ação não suportada: ${processedInput.action}`);
      }
    } catch (error) {
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
  async createRepository(params: RepositoriesInput, provider: VcsOperations, owner: string): Promise<RepositoriesResult> {
    try {
      if (!params.name) {
        throw new Error('Nome do repositório é obrigatório');
      }

      const repository = await provider.createRepository(
        params.name,
        params.description,
        params.private || false
      );

      return {
        success: true,
        action: 'create',
        message: `Repositório '${params.name}' criado com sucesso`,
        data: repository
      };
    } catch (error) {
      throw new Error(`Falha ao criar repositório: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async listRepositories(params: RepositoriesInput, provider: VcsOperations, owner: string): Promise<RepositoriesResult> {
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
    } catch (error) {
      throw new Error(`Falha ao listar repositórios: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async getRepository(params: RepositoriesInput, provider: VcsOperations, owner: string): Promise<RepositoriesResult> {
    try {
      if (!owner || !params.repo) {
        throw new Error('e nome do repositório são obrigatórios');
      }

      const repository = await provider.getRepository(owner, params.repo);

      return {
        success: true,
        action: 'get',
        message: `Repositório '${owner}/${params.repo}' obtido com sucesso`,
        data: repository
      };
    } catch (error) {
      throw new Error(`Falha ao obter repositório: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async updateRepository(params: RepositoriesInput, provider: VcsOperations, owner: string): Promise<RepositoriesResult> {
    try {
      if (!owner || !params.repo) {
        throw new Error('e nome do repositório são obrigatórios');
      }

      const updateData: any = {};
      if (params.new_name) updateData.name = params.new_name;
      if (params.new_description !== undefined) updateData.description = params.new_description;
      if (params.new_private !== undefined) updateData.private = params.new_private;
      if (params.archived !== undefined) updateData.archived = params.archived;

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
    } catch (error) {
      throw new Error(`Falha ao atualizar repositório: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async deleteRepository(params: RepositoriesInput, provider: VcsOperations, owner: string): Promise<RepositoriesResult> {
    try {
      if (!owner || !params.repo) {
        throw new Error('e nome do repositório são obrigatórios');
      }

      await provider.deleteRepository(owner, params.repo);

      return {
        success: true,
        action: 'delete',
        message: `Repositório '${owner}/${params.repo}' deletado com sucesso`,
        data: { deleted: true }
      };
    } catch (error) {
      throw new Error(`Falha ao deletar repositório: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async forkRepository(params: RepositoriesInput, provider: VcsOperations, owner: string): Promise<RepositoriesResult> {
    try {
      if (!owner || !params.repo) {
        throw new Error('e nome do repositório são obrigatórios');
      }

      const repository = await provider.forkRepository(owner, params.repo, params.organization);

      return {
        success: true,
        action: 'fork',
        message: `Fork do repositório '${owner}/${params.repo}' criado com sucesso`,
        data: repository
      };
    } catch (error) {
      throw new Error(`Falha ao fazer fork do repositório: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async searchRepositories(params: RepositoriesInput, provider: VcsOperations, owner: string): Promise<RepositoriesResult> {
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
    } catch (error) {
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
  async initRepository(params: RepositoriesInput, provider?: VcsOperations, owner?: string): Promise<RepositoriesResult> {
    try {
      if (!params.projectPath) {
        throw new Error('projectPath é obrigatório para inicialização do repositório');
      }

      // Executa git init no diretório especificado
      const initResult = await runTerminalCmd({
        command: `git init "${params.projectPath}"`,
        is_background: false,
        explanation: 'Inicializando repositório Git local'
      });

      if (initResult.exitCode !== 0) {
        throw new Error(`Falha ao inicializar repositório: ${initResult.output}`);
      }

      // Se owner/repo foram especificados, configura remote
      if (owner && params.repo) {
        // Obtém URL base do provider
        const providerConfig = provider?.getConfig ? provider.getConfig() : null;
        const baseUrl = providerConfig?.apiUrl || (params.provider === 'gitea' ? 'http://nas-ubuntu:3000' : 'https://github.com');
        const remoteUrl = params.provider === 'gitea'
          ? `${baseUrl.replace('/api/v1', '')}/${owner}/${params.repo}.git`
          : `https://github.com/${owner}/${params.repo}.git`;

        const remoteResult = await runTerminalCmd({
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
          remoteConfigured: !!(owner && params.repo && provider)
        }
      };
    } catch (error) {
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
  async cloneRepository(params: RepositoriesInput, provider: VcsOperations, owner: string): Promise<RepositoriesResult> {
    try {
      if (!owner || !params.repo || !params.projectPath) {
        throw new Error('owner, repo e projectPath são obrigatórios para clonagem');
      }

      // Obtém URL do repositório
      const providerConfig = provider?.getConfig ? provider.getConfig() : null;
      const baseUrl = providerConfig?.apiUrl || (params.provider === 'gitea' ? 'http://nas-ubuntu:3000' : 'https://github.com');
      const repoUrl = params.provider === 'gitea'
        ? `${baseUrl.replace('/api/v1', '')}/${owner}/${params.repo}.git`
        : `https://github.com/${owner}/${params.repo}.git`;

      // Executa git clone
      const cloneResult = await runTerminalCmd({
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
    } catch (error) {
      throw new Error(`Falha ao clonar repositório: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
};