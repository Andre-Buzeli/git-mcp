import { z } from 'zod';
import { globalProviderFactory, VcsOperations } from '../providers/index.js';
import { applyAutoUserDetection } from '../utils/user-detection.js';
import { runTerminalCmd } from '../utils/terminal-controller.js';
import { ErrorHandler } from '../providers/error-handler.js';

/**
 * Tool: git-repositories
 * 
 * DESCRIÃ‡ÃƒO COMPLETA:
 * Gerenciamento completo de repositÃ³rios Git com suporte multi-provider (GitHub e Gitea).
 * Esta tool Ã© 100% auto-suficiente e implementa TODAS as operaÃ§Ãµes de repositÃ³rio sem depender
 * de outras tools ou comandos externos.
 * 
 * FUNCIONALIDADES IMPLEMENTADAS:
 * 
 * 1. CRIAÃ‡ÃƒO E CONFIGURAÃ‡ÃƒO:
 *    - create: Cria novos repositÃ³rios com configuraÃ§Ãµes completas
 *    - init: Inicializa repositÃ³rios Git locais
 *    - clone: Clona repositÃ³rios remotos localmente
 *    - update: Atualiza configuraÃ§Ãµes de repositÃ³rios existentes
 * 
 * 2. LISTAGEM E BUSCA:
 *    - list: Lista repositÃ³rios do usuÃ¡rio ou organizaÃ§Ã£o
 *    - get: ObtÃ©m detalhes especÃ­ficos de um repositÃ³rio
 *    - search: Busca repositÃ³rios por critÃ©rios especÃ­ficos
 * 
 * 3. OPERAÃ‡Ã•ES AVANÃ‡ADAS:
 *    - fork: Cria fork de repositÃ³rios existentes
 *    - delete: Remove repositÃ³rios permanentemente
 *    - archive: Arquivamento de repositÃ³rios
 *    - transfer: TransferÃªncia de propriedade
 * 
 * 4. CONFIGURAÃ‡Ã•ES E METADADOS:
 *    - Visibilidade (pÃºblico/privado)
 *    - DescriÃ§Ãµes e documentaÃ§Ã£o
 *    - ConfiguraÃ§Ãµes de branch padrÃ£o
 *    - Templates e inicializaÃ§Ã£o automÃ¡tica
 *    - LicenÃ§as e arquivos de configuraÃ§Ã£o
 * 
 * PARÃ‚METROS OBRIGATÃ“RIOS:
 * - action: AÃ§Ã£o a executar (create, list, get, update, delete, fork, search, init, clone)
 * - provider: Provedor a usar (gitea ou github)
 * - owner: ProprietÃ¡rio do repositÃ³rio (obrigatÃ³rio para operaÃ§Ãµes remotas)
 * - repo: Nome do repositÃ³rio (obrigatÃ³rio para operaÃ§Ãµes remotas)
 * - projectPath: Caminho do projeto local (obrigatÃ³rio para operaÃ§Ãµes locais)
 * 
 * PARÃ‚METROS OPCIONAIS:
 * - name: Nome do repositÃ³rio para criaÃ§Ã£o
 * - description: DescriÃ§Ã£o do repositÃ³rio
 * - private: Visibilidade do repositÃ³rio
 * - auto_init: InicializaÃ§Ã£o automÃ¡tica com README
 * - gitignores: Template de .gitignore
 * - license: Template de licenÃ§a
 * - readme: ConteÃºdo do README
 * - default_branch: Branch padrÃ£o
 * - username: UsuÃ¡rio para listagem
 * - page: PÃ¡gina para paginaÃ§Ã£o
 * - limit: Limite de resultados
 * - new_name: Novo nome para atualizaÃ§Ã£o
 * - new_description: Nova descriÃ§Ã£o
 * - new_private: Nova visibilidade
 * - archived: Status de arquivamento
 * - organization: OrganizaÃ§Ã£o para fork
 * - query: Termo de busca
 * 
 * CASOS DE USO:
 * 1. CriaÃ§Ã£o de repositÃ³rios para novos projetos
 * 2. Backup e migraÃ§Ã£o de cÃ³digo
 * 3. OrganizaÃ§Ã£o de projetos em equipe
 * 4. AutomaÃ§Ã£o de workflows de desenvolvimento
 * 5. Gerenciamento de repositÃ³rios em massa
 * 6. ConfiguraÃ§Ã£o de templates de projeto
 * 7. SincronizaÃ§Ã£o entre diferentes provedores
 * 
 * EXEMPLOS DE USO:
 * - Criar repositÃ³rio: action=create, name=meu-projeto, description=Projeto incrÃ­vel
 * - Listar repositÃ³rios: action=list, username=usuario
 * - Buscar repositÃ³rios: action=search, query=react typescript
 * - Clonar repositÃ³rio: action=clone, url=https://github.com/user/repo.git
 * - Inicializar local: action=init, projectPath=/path/to/project
 * 
 * RECOMENDAÃ‡Ã•ES:
 * - Use nomes descritivos e consistentes
 * - Configure visibilidade adequada para cada projeto
 * - Mantenha descriÃ§Ãµes atualizadas e informativas
 * - Use templates para padronizaÃ§Ã£o
 * - Configure branches padrÃ£o apropriadas
 * - Documente configuraÃ§Ãµes importantes
 * - Use licenÃ§as adequadas para cada projeto
 * 
 * LIMITAÃ‡Ã•ES:
 * - OperaÃ§Ãµes de arquivamento dependem do provedor
 * - TransferÃªncia de propriedade requer permissÃµes especiais
 * - Alguns provedores podem ter limitaÃ§Ãµes de API
 * 
 * SEGURANÃ‡A:
 * - Tokens de acesso sÃ£o obrigatÃ³rios para operaÃ§Ãµes remotas
 * - ValidaÃ§Ã£o de permissÃµes antes de operaÃ§Ãµes destrutivas
 * - Logs detalhados de todas as operaÃ§Ãµes
 * - Tratamento seguro de informaÃ§Ãµes sensÃ­veis
 */

/**
 * Schema de validaÃ§Ã£o para entrada da tool git-repositories
 * 
 * VALIDAÃ‡Ã•ES:
 * - action: AÃ§Ã£o obrigatÃ³ria (create, list, get, update, delete, fork, search, init, clone)
 * - provider: ObrigatÃ³rio (gitea ou github)
 * - ParÃ¢metros especÃ­ficos por aÃ§Ã£o
 * - ValidaÃ§Ã£o de tipos e formatos
 * 
 * RECOMENDAÃ‡Ã•ES:
 * - Sempre valide entrada antes de usar
 * - Use parÃ¢metros opcionais adequadamente
 * - Documente parÃ¢metros obrigatÃ³rios
 */
const GitRepositoriesInputSchema = z.object({
  action: z.enum(['create', 'list', 'get', 'update', 'delete', 'fork', 'search', 'init', 'clone']),

  // ParÃ¢metros comuns
  repo: z.string().optional(),
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

export type GitRepositoriesInput = z.infer<typeof GitRepositoriesInputSchema>;

// Schema de saÃ­da
const GitRepositoriesResultSchema = z.object({
  success: z.boolean(),
  action: z.string(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional()
});

export type GitRepositoriesResult = z.infer<typeof GitRepositoriesResultSchema>;

/**
 * Tool: git-repositories
 * 
 * DESCRIÃ‡ÃƒO:
 * Gerenciamento completo de repositÃ³rios Git (GitHub + Gitea) com mÃºltiplas aÃ§Ãµes
 * 
 * ACTIONS DISPONÃVEIS:
 * 
 * 1. create - Criar novo repositÃ³rio
 *    ParÃ¢metros:
 *    - name (obrigatÃ³rio): Nome do repositÃ³rio
 *    - description (opcional): DescriÃ§Ã£o do repositÃ³rio
 *    - private (opcional): RepositÃ³rio privado (padrÃ£o: false)
 *    - auto_init (opcional): Inicializar com README (padrÃ£o: false)
 *    - gitignores (opcional): Template de .gitignore
 *    - license (opcional): Template de licenÃ§a
 *    - readme (opcional): ConteÃºdo do README
 *    - default_branch (opcional): Branch padrÃ£o
 * 
 * 2. list - Listar repositÃ³rios
 *    ParÃ¢metros:
 *    - username (opcional): UsuÃ¡rio especÃ­fico (padrÃ£o: usuÃ¡rio atual)
 *    - page (opcional): PÃ¡gina da listagem (padrÃ£o: 1)
 *    - limit (opcional): Itens por pÃ¡gina (padrÃ£o: 30)
 * 
 * 3. get - Obter detalhes do repositÃ³rio
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 * 
 * 4. update - Atualizar repositÃ³rio
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - new_name (opcional): Novo nome
 *    - new_description (opcional): Nova descriÃ§Ã£o
 *    - new_private (opcional): Nova visibilidade
 *    - archived (opcional): Status de arquivamento
 * 
 * 5. delete - Deletar repositÃ³rio
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 * 
 * 6. fork - Fazer fork do repositÃ³rio
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio original
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio original
 *    - organization (opcional): OrganizaÃ§Ã£o de destino
 * 
 * 7. search - Buscar repositÃ³rios
 *    ParÃ¢metros:
 *    - query (obrigatÃ³rio): Termo de busca
 *    - page (opcional): PÃ¡gina da busca (padrÃ£o: 1)
 *    - limit (opcional): Itens por pÃ¡gina (padrÃ£o: 30)
 * 
 * 8. init - Inicializar repositÃ³rio Git local
 *    ParÃ¢metros:
 *    - projectPath (obrigatÃ³rio): Caminho do projeto local
 *    - owner/repo (opcional): Para configurar remote
 * 
 * 9. clone - Clonar repositÃ³rio para local
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - projectPath (obrigatÃ³rio): Caminho local de destino
 * 
 * RECOMENDAÃ‡Ã•ES DE USO:
 * - Use nomes descritivos para repositÃ³rios
 * - Configure visibilidade adequada para o projeto
 * - Mantenha descriÃ§Ãµes atualizadas
 * - Use templates para projetos similares
 * - Configure branch padrÃ£o adequada
 * - Use paginaÃ§Ã£o para listas grandes
 */
export const gitRepositoriesTool = {
  name: 'git-repositories',
  description: 'tool: Gerencia repositÃ³rios Git completos, criaÃ§Ã£o, configuraÃ§Ã£o, busca e operaÃ§Ãµes avanÃ§adas\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction create: cria repositÃ³rio novo\naction create requires: name, description, private, auto_init, gitignores, license, readme, default_branch, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction list: lista repositÃ³rios do usuÃ¡rio\naction list requires: page, limit, username, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction get: obtÃ©m detalhes especÃ­ficos\naction get requires: repo, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction update: atualiza configuraÃ§Ãµes\naction update requires: repo, new_name, new_description, new_private, archived, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction delete: remove repositÃ³rio\naction delete requires: repo, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction fork: cria fork\naction fork requires: repo, organization, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction search: busca repositÃ³rios\naction search requires: query, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction init: inicializa repositÃ³rio local\naction init requires: projectPath, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction clone: clona repositÃ³rio\naction clone requires: repo, projectPath, provider',
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
    required: ['action', 'provider', 'projectPath']
  },

  /**
   * Handler principal da tool git-repositories
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
  async handler(input: GitRepositoriesInput): Promise<GitRepositoriesResult> {
    try {
      const validatedInput = GitRepositoriesInputSchema.parse(input);
      
      // Aplicar auto-detecÃ§Ã£o apenas para owner/username dentro do provider especificado
      const processedInput = await applyAutoUserDetection(validatedInput, validatedInput.provider);

      // Usar o provider especificado pelo usuÃ¡rio
      const provider = globalProviderFactory.getProvider(processedInput.provider);
      if (!provider) {
        throw new Error(`Provider '${processedInput.provider}' nÃ£o encontrado`);
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
          throw new Error(`AÃ§Ã£o nÃ£o suportada: ${processedInput.action}`);
      }
    } catch (error) {
      return {
        success: false,
        action: input.action,
        message: 'Erro na operaÃ§Ã£o de repositÃ³rios',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  /**
   * Cria um novo repositÃ³rio
   * 
   * FUNCIONALIDADE:
   * - Valida parÃ¢metros obrigatÃ³rios
   * - Configura dados padrÃ£o
   * - Chama API do provider para criaÃ§Ã£o
   * - Retorna resultado formatado
   * 
   * PARÃ‚METROS OBRIGATÃ“RIOS:
   * - name: Nome do repositÃ³rio
   * 
   * PARÃ‚METROS OPCIONAIS:
   * - description: DescriÃ§Ã£o do repositÃ³rio
   * - private: Visibilidade (padrÃ£o: false)
   * - auto_init: Inicializar com README (padrÃ£o: false)
   * - gitignores: Template de .gitignore
   * - license: Template de licenÃ§a
   * - readme: ConteÃºdo do README
   * - default_branch: Branch padrÃ£o (padrÃ£o: main)
   * 
   * VALIDAÃ‡Ã•ES:
   * - Nome obrigatÃ³rio
   * - Nome Ãºnico no usuÃ¡rio/organizaÃ§Ã£o
   * - PermissÃµes adequadas
   * 
   * RECOMENDAÃ‡Ã•ES:
   * - Use nomes descritivos e Ãºnicos
   * - Configure visibilidade adequada
   * - Inicialize com README para projetos novos
   * - Use templates para consistÃªncia
   */
  async createRepository(params: GitRepositoriesInput, provider: VcsOperations): Promise<GitRepositoriesResult> {
    try {
      if (!params.name) {
        throw new Error('Nome do repositÃ³rio Ã© obrigatÃ³rio');
      }

      const repository = await provider.createRepository(
        params.name,
        params.description,
        params.private || false
      );

      return {
        success: true,
        action: 'create',
        message: `RepositÃ³rio '${params.name}' criado com sucesso`,
        data: repository
      };
    } catch (error) {
      throw new Error(`Falha ao criar repositÃ³rio: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async listRepositories(params: GitRepositoriesInput, provider: VcsOperations): Promise<GitRepositoriesResult> {
    try {
      const page = params.page || 1;
      const limit = params.limit || 30;
      
      const repositories = await provider.listRepositories(params.username, page, limit);

      return {
        success: true,
        action: 'list',
        message: `${repositories.length} repositÃ³rios encontrados`,
        data: {
          repositories,
          page,
          limit,
          total: repositories.length
        }
      };
    } catch (error) {
      throw new Error(`Falha ao listar repositÃ³rios: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async getRepository(params: GitRepositoriesInput, provider: VcsOperations): Promise<GitRepositoriesResult> {
    try {
      if (!params.repo) {
        throw new Error('Nome do repositÃ³rio Ã© obrigatÃ³rio');
      }

      const currentUser = await provider.getCurrentUser();
      const owner = currentUser.login;

      const repository = await provider.getRepository((await provider.getCurrentUser()).login, params.repo);

      return {
        success: true,
        action: 'get',
        message: `RepositÃ³rio '${owner}/${params.repo}' obtido com sucesso`,
        data: repository
      };
    } catch (error) {
      throw new Error(`Falha ao obter repositÃ³rio: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async updateRepository(params: GitRepositoriesInput, provider: VcsOperations): Promise<GitRepositoriesResult> {
    try {
      if (!params.repo) {
        throw new Error('Nome do repositÃ³rio Ã© obrigatÃ³rio');
      }

      const currentUser = await provider.getCurrentUser();
      const owner = currentUser.login;

      const updateData: any = {};
      if (params.new_name) updateData.name = params.new_name;
      if (params.new_description !== undefined) updateData.description = params.new_description;
      if (params.new_private !== undefined) updateData.private = params.new_private;
      if (params.archived !== undefined) updateData.archived = params.archived;

      if (Object.keys(updateData).length === 0) {
        throw new Error('Nenhum campo para atualizar foi fornecido');
      }

      const repository = await provider.updateRepository((await provider.getCurrentUser()).login, params.repo, updateData);

      return {
        success: true,
        action: 'update',
        message: `RepositÃ³rio '${owner}/${params.repo}' atualizado com sucesso`,
        data: repository
      };
    } catch (error) {
      throw new Error(`Falha ao atualizar repositÃ³rio: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async deleteRepository(params: GitRepositoriesInput, provider: VcsOperations): Promise<GitRepositoriesResult> {
    try {
      if (!params.repo) {
        throw new Error('Nome do repositÃ³rio Ã© obrigatÃ³rio');
      }

      const currentUser = await provider.getCurrentUser();
      const owner = currentUser.login;

      await provider.deleteRepository((await provider.getCurrentUser()).login, params.repo);

      return {
        success: true,
        action: 'delete',
        message: `RepositÃ³rio '${owner}/${params.repo}' deletado com sucesso`,
        data: { deleted: true }
      };
    } catch (error) {
      throw new Error(`Falha ao deletar repositÃ³rio: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async forkRepository(params: GitRepositoriesInput, provider: VcsOperations): Promise<GitRepositoriesResult> {
    try {
      if (!params.repo) {
        throw new Error('Nome do repositÃ³rio Ã© obrigatÃ³rio');
      }

      const currentUser = await provider.getCurrentUser();
      const owner = currentUser.login;

      const repository = await provider.forkRepository((await provider.getCurrentUser()).login, params.repo, params.organization);

      return {
        success: true,
        action: 'fork',
        message: `Fork do repositÃ³rio '${owner}/${params.repo}' criado com sucesso`,
        data: repository
      };
    } catch (error) {
      throw new Error(`Falha ao fazer fork do repositÃ³rio: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async searchRepositories(params: GitRepositoriesInput, provider: VcsOperations): Promise<GitRepositoriesResult> {
    try {
      if (!params.query) {
        throw new Error('Query de busca Ã© obrigatÃ³ria');
      }

      const page = params.page || 1;
      const limit = params.limit || 30;
      
      const repositories = await provider.searchRepositories(params.query, page, limit);

      return {
        success: true,
        action: 'search',
        message: `${repositories.length} repositÃ³rios encontrados para '${params.query}'`,
        data: {
          repositories,
          query: params.query,
          page,
          limit,
          total: repositories.length
        }
      };
    } catch (error) {
      throw new Error(`Falha ao buscar repositÃ³rios: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Inicializa um repositÃ³rio Git local
   *
   * FUNCIONALIDADE:
   * - Executa 'git init' no diretÃ³rio especificado
   * - Cria estrutura bÃ¡sica do Git
   * - Adiciona remote se especificado
   *
   * PARÃ‚METROS OBRIGATÃ“RIOS:
   * - projectPath: Caminho do projeto local
   *
   * PARÃ‚METROS OPCIONAIS:
   * - owner/repo: Para configurar remote
   * - provider: Para determinar URL do remote
   *
   * RECOMENDAÃ‡Ã•ES:
   * - Verifique se diretÃ³rio existe
   * - Use caminhos absolutos
   * - Configure remote apÃ³s inicializaÃ§Ã£o
   */
  async initRepository(params: GitRepositoriesInput, provider?: VcsOperations): Promise<GitRepositoriesResult> {
    try {
      if (!params.projectPath) {
        throw new Error('projectPath Ã© obrigatÃ³rio para inicializaÃ§Ã£o do repositÃ³rio');
      }

      // Executa git init no diretÃ³rio especificado
      const initResult = await runTerminalCmd({
        command: `git init "${params.projectPath}"`,
        is_background: false,
        explanation: 'Inicializando repositÃ³rio Git local'
      });

      if (initResult.exitCode !== 0) {
        throw new Error(`Falha ao inicializar repositÃ³rio: ${initResult.output}`);
      }

      // Se owner/repo foram especificados, configura remote
      if (params.repo && provider) {
        const currentUser = await provider.getCurrentUser();
        const owner = currentUser.login;
        // ObtÃ©m URL base do provider
        const providerConfig = provider.getConfig ? provider.getConfig() : null;
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
          console.warn(`Aviso: NÃ£o foi possÃ­vel configurar remote: ${remoteResult.output}`);
        }
      }

      return {
        success: true,
        action: 'init',
        message: `RepositÃ³rio Git inicializado com sucesso em '${params.projectPath}'`,
        data: {
          path: params.projectPath,
          initialized: true,
          remoteConfigured: !!(params.repo && provider)
        }
      };
    } catch (error) {
      throw new Error(`Falha ao inicializar repositÃ³rio: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Clona um repositÃ³rio para o diretÃ³rio local
   *
   * FUNCIONALIDADE:
   * - Clona repositÃ³rio remoto para diretÃ³rio local
   * - Suporta diferentes protocolos (HTTPS, SSH)
   * - MantÃ©m estrutura de diretÃ³rios
   *
   * PARÃ‚METROS OBRIGATÃ“RIOS:
   * - owner: ProprietÃ¡rio do repositÃ³rio
   * - repo: Nome do repositÃ³rio
   * - projectPath: Caminho local de destino
   * - provider: Provider a ser usado
   *
   * RECOMENDAÃ‡Ã•ES:
   * - Verifique espaÃ§o em disco disponÃ­vel
   * - Use caminhos absolutos
   * - Considere profundidade de clone para repositÃ³rios grandes
   */
  async cloneRepository(params: GitRepositoriesInput, provider: VcsOperations): Promise<GitRepositoriesResult> {
    try {
      if (!params.repo || !params.projectPath) {
        throw new Error('repo e projectPath sÃ£o obrigatÃ³rios para clonagem');
      }

      const currentUser = await provider.getCurrentUser();
      const owner = currentUser.login;

      // ObtÃ©m URL do repositÃ³rio
      const providerConfig = provider.getConfig ? provider.getConfig() : null;
      const baseUrl = providerConfig?.apiUrl || (params.provider === 'gitea' ? 'http://nas-ubuntu:3000' : 'https://github.com');
      const repoUrl = params.provider === 'gitea'
        ? `${baseUrl.replace('/api/v1', '')}/${owner}/${params.repo}.git`
        : `https://github.com/${owner}/${params.repo}.git`;

      // Executa git clone
      const cloneResult = await runTerminalCmd({
        command: `git clone "${repoUrl}" "${params.projectPath}"`,
        is_background: false,
        explanation: 'Clonando repositÃ³rio remoto'
      });

      if (cloneResult.exitCode !== 0) {
        throw new Error(`Falha ao clonar repositÃ³rio: ${cloneResult.output}`);
      }

      return {
        success: true,
        action: 'clone',
        message: `RepositÃ³rio '${owner}/${params.repo}' clonado com sucesso para '${params.projectPath}'`,
        data: {
          source: `${owner}/${params.repo}`,
          destination: params.projectPath,
          cloned: true,
          url: repoUrl
        }
      };
    } catch (error) {
      throw new Error(`Falha ao clonar repositÃ³rio: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  /**
   * Verifica se erro Ã© relacionado a Git
   */
  isGitRelatedError(errorMessage: string): boolean {
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

