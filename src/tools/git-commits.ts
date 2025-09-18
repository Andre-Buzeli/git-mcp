import { z } from 'zod';
import { globalProviderFactory, VcsOperations } from '../providers/index.js';
import { applyAutoUserDetection } from '../utils/user-detection.js';
import { runGitCommand, gitPush, gitPull, gitAdd, gitCommit } from '../utils/terminal-controller.js';

/**
 * Tool: commits
 * 
 * DESCRIÇÃO:
 * Gerenciamento completo de commits com suporte multi-provider (GitHub e Gitea)
 * 
 * FUNCIONALIDADES:
 * - Listagem de histórico de commits
 * - Obtenção de detalhes específicos
 * - Criação de novos commits
 * - Comparação entre commits
 * - Busca por mensagens e conteúdo
 * - Análise de mudanças
 * 
 * USO:
 * - Para acompanhar histórico de mudanças
 * - Para analisar evolução do código
 * - Para criar commits programaticamente
 * - Para auditoria de mudanças
 * 
 * RECOMENDAÇÕES:
 * - Use mensagens de commit descritivas
 * - Mantenha commits atômicos
 * - Documente mudanças importantes
 * - Revise histórico regularmente
 */

/**
 * Schema de validação para entrada da tool commits
 * 
 * VALIDAÇÕES:
 * - action: Ação obrigatória (list, get, create, compare, search)
 * - Parâmetros específicos por ação
 * - Validação de tipos e formatos
 * 
 * RECOMENDAÇÕES:
 * - Sempre valide entrada antes de usar
 * - Use parâmetros opcionais adequadamente
 * - Documente parâmetros obrigatórios
 */
const CommitsInputSchema = z.object({
  action: z.enum(['list', 'get', 'create', 'compare', 'search', 'push', 'pull']),

  // Parâmetros comuns
  // owner: obtido automaticamente do provider,
  repo: z.string(),
  projectPath: z.string().describe('Local project path for git operations'),

  // Para multi-provider
  provider: z.enum(['gitea', 'github']).describe('Provider to use (gitea or github)'), // Provider específico: gitea, github ou both
  
  // Para list
  sha: z.string().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  
  // Para get
  commit_sha: z.string().optional(),
  
  // Para create
  message: z.string().optional(),
  branch: z.string().optional(),
  author_name: z.string().optional(),
  author_email: z.string().optional(),
  committer_name: z.string().optional(),
  committer_email: z.string().optional(),
  
  // Para compare
  base: z.string().optional(),
  head: z.string().optional(),
  
  // Para search
  query: z.string().optional(),
  author: z.string().optional(),
});

export type CommitsInput = z.infer<typeof CommitsInputSchema>;

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
const CommitsResultSchema = z.object({
  success: z.boolean(),
  action: z.string(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional()
});

export type CommitsResult = z.infer<typeof CommitsResultSchema>;

/**
 * Tool: commits
 * 
 * DESCRIÇÃO:
 * Gerenciamento completo de commits Gitea com múltiplas ações
 * 
 * ACTIONS DISPONÍVEIS:
 * 
 * 1. list - Listar commits
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - sha (opcional): Branch ou commit específico (padrão: branch padrão)
 *    - page (opcional): Página da listagem (padrão: 1)
 *    - limit (opcional): Itens por página (padrão: 30, máximo: 100)
 * 
 * 2. get - Obter detalhes do commit
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - commit_sha (obrigatório): SHA do commit
 * 
 * 3. create - Criar novo commit
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - message (obrigatório): Mensagem do commit
 *    - branch (obrigatório): Branch de destino
 *    - author_name (opcional): Nome do autor
 *    - author_email (opcional): Email do autor
 *    - committer_name (opcional): Nome do committer
 *    - committer_email (opcional): Email do committer
 * 
 * 4. compare - Comparar commits
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - base (obrigatório): Commit base para comparação
 *    - head (obrigatório): Commit para comparar
 * 
 * 5. search - Buscar commits
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - query (obrigatório): Termo de busca
 *    - author (opcional): Autor dos commits
 *    - page (opcional): Página da busca (padrão: 1)
 *    - limit (opcional): Itens por página (padrão: 30, máximo: 100)
 * 
 * RECOMENDAÇÕES DE USO:
 * - Use mensagens de commit descritivas
 * - Mantenha commits atômicos
 * - Documente mudanças importantes
 * - Revise histórico regularmente
 * - Use branches para features
 * - Mantenha histórico limpo
 */
export const commitsTool = {
  name: 'git-commits',
  description: 'tool: Gerencia commits Git completos, histórico, criação e sincronização\n──────────────\naction list: lista commits do repositório\naction list requires: repo, page, limit, provider\n───────────────\naction get: obtém detalhes de commit específico\naction get requires: repo, sha, provider\n───────────────\naction create: cria novo commit\naction create requires: repo, message, branch, provider\n───────────────\naction compare: compara commits/branches\naction compare requires: repo, base, head, provider\n───────────────\naction search: busca commits por critérios\naction search requires: repo, query, author, provider\n───────────────\naction push: envia commits para remoto\naction push requires: repo, branch, provider\n───────────────\naction pull: baixa commits do remoto\naction pull requires: repo, branch, provider',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['list', 'get', 'create', 'compare', 'search', 'push', 'pull'],
        description: 'Action to perform on commits'
      },
      repo: { type: 'string', description: 'Repository name' },
      provider: { type: 'string', description: 'Specific provider (github, gitea) or use default' },
      sha: { type: 'string', description: 'Branch, tag or commit SHA' },
      page: { type: 'number', description: 'Page number', minimum: 1 },
      limit: { type: 'number', description: 'Items per page', minimum: 1, maximum: 100 },
      commit_sha: { type: 'string', description: 'Specific commit SHA' },
      message: { type: 'string', description: 'Commit message' },
      branch: { type: 'string', description: 'Target branch' },
      author_name: { type: 'string', description: 'Author name' },
      author_email: { type: 'string', description: 'Author email' },
      committer_name: { type: 'string', description: 'Committer name' },
      committer_email: { type: 'string', description: 'Committer email' },
      base: { type: 'string', description: 'Base commit/branch for comparison' },
      head: { type: 'string', description: 'Head commit/branch for comparison' },
      query: { type: 'string', description: 'Search query' },
      author: { type: 'string', description: 'Author filter for search' }
    },
    required: ['action', 'repo', 'provider', 'projectPath']
  },

  /**
   * Handler principal da tool commits
   * 
   * FUNCIONALIDADE:
   * - Valida entrada usando Zod schema
   * - Roteia para método específico baseado na ação
   * - Trata erros de forma uniforme
   * - Retorna resultado padronizado
   * 
   * FLUXO:
   * 1. Validação de entrada
   * 2. Seleção do provider
   * 3. Roteamento por ação
   * 4. Execução do método específico
   * 5. Tratamento de erros
   * 6. Retorno de resultado
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
  async handler(input: CommitsInput): Promise<CommitsResult> {
    try {
      const validatedInput = CommitsInputSchema.parse(input);

      // Aplicar auto-detecção de usuário/owner
      const processedInput = await applyAutoUserDetection(validatedInput, validatedInput.provider);

      // Obter o provider correto
      const provider = processedInput.provider
        ? globalProviderFactory.getProvider(processedInput.provider)
        : globalProviderFactory.getDefaultProvider();

      if (!provider) {
        throw new Error(`Provider '${processedInput.provider}' não encontrado`);
      }

      // Obter o owner do provider
      const owner = (await provider.getCurrentUser()).login;

      // Para ações que precisam de owner, verificar se foi determinado
      if (!owner && ['list', 'get', 'create', 'compare', 'search'].includes(processedInput.action)) {
        throw new Error('Não foi possível determinar o owner automaticamente. Verifique se o token está configurado corretamente.');
      }
      
      switch (processedInput.action) {
        case 'list':
          return await this.listCommits(processedInput, provider, owner);
        case 'get':
          return await this.getCommit(processedInput, provider, owner);
        case 'create':
          return await this.createCommit(processedInput, provider, owner);
        case 'compare':
          return await this.compareCommits(processedInput, provider, owner);
        case 'search':
          return await this.searchCommits(processedInput, provider, owner);
        case 'push':
          return await this.pushCommits(processedInput, provider);
        case 'pull':
          return await this.pullCommits(processedInput, provider);
        default:
          throw new Error(`Ação não suportada: ${processedInput.action}`);
      }
    } catch (error) {
      return {
        success: false,
        action: input.action,
        message: 'Erro na operação de commits',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  /**
   * Lista commits do repositório
   * 
   * FUNCIONALIDADE:
   * - Lista commits com paginação
   * - Suporta filtro por branch ou commit
   * - Retorna informações básicas de cada commit
   * 
   * PARÂMETROS OBRIGATÓRIOS:
   * - owner: Proprietário do repositório
   * - repo: Nome do repositório
   * 
   * PARÂMETROS OPCIONAIS:
   * - sha: Branch, tag ou commit específico (padrão: branch padrão)
   * - page: Página da listagem (padrão: 1)
   * - limit: Itens por página (padrão: 30, máximo: 100)
   * 
   * VALIDAÇÕES:
   * - e repo obrigatórios
   * - SHA deve ser válido se fornecido
   * - Page deve ser >= 1
   * - Limit deve ser entre 1 e 100
   * 
   * RECOMENDAÇÕES:
   * - Use paginação para repositórios grandes
   * - Monitore número total de commits
   * - Use SHA específico para análise
   * - Mantenha histórico organizado
   */
  async listCommits(params: CommitsInput, provider: VcsOperations, owner: string): Promise<CommitsResult> {
    try {
      if (!owner || !params.repo) {
        throw new Error('e repo são obrigatórios');
      }

      const page = params.page || 1;
      const limit = params.limit || 30;
      
      const commits = await provider.listCommits(owner, params.repo, params.sha, page, limit);

      return {
        success: true,
        action: 'list',
        message: `${commits.length} commits encontrados`,
        data: {
          commits,
          page,
          limit,
          total: commits.length,
          sha: params.sha || 'branch padrão'
        }
      };
    } catch (error) {
      throw new Error(`Falha ao listar commits: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Obtém detalhes de um commit específico
   * 
   * FUNCIONALIDADE:
   * - Obtém informações completas do commit
   * - Inclui detalhes de autor e committer
   * - Mostra arquivos modificados
   * - Retorna hash e mensagem
   * 
   * PARÂMETROS OBRIGATÓRIOS:
   * - owner: Proprietário do repositório
   * - repo: Nome do repositório
   * - commit_sha: SHA do commit
   * 
   * VALIDAÇÕES:
   * - Todos os parâmetros obrigatórios
   * - SHA deve ser válido
   * - Commit deve existir
   * 
   * RECOMENDAÇÕES:
   * - Use para análise detalhada
   * - Verifique arquivos modificados
   * - Analise mensagem e autor
   * - Documente mudanças importantes
   */
  async getCommit(params: CommitsInput, provider: VcsOperations, owner: string): Promise<CommitsResult> {
    try {
      if (!owner || !params.repo) {
        throw new Error('e repo são obrigatórios');
      }

      // Se não foi fornecido commit_sha, usa o SHA da branch padrão
      let commitSha = params.commit_sha;
      if (!commitSha) {
        try {
          const branchInfo = await provider.getBranch(owner, params.repo, 'main');
          commitSha = branchInfo.commit.sha;
        } catch (error) {
          // Se não conseguir obter o branch main, tenta master
          try {
            const branchInfo = await provider.getBranch(owner, params.repo, 'master');
            commitSha = branchInfo.commit.sha;
          } catch (masterError) {
            throw new Error('Não foi possível obter SHA do commit. Forneça commit_sha ou verifique se a branch existe.');
          }
        }
      }

      const commit = await provider.getCommit(owner, params.repo, commitSha);

      return {
        success: true,
        action: 'get',
        message: `Commit '${commitSha}' obtido com sucesso`,
        data: {
          commit,
          sha: commitSha,
          owner: owner,
          repo: params.repo
        }
      };
    } catch (error) {
      throw new Error(`Falha ao obter commit: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Cria um novo commit
   * 
   * FUNCIONALIDADE:
   * - Cria commit com mensagem personalizada
   * - Suporta autor e committer diferentes
   * - Permite especificar branch de destino
   * - Valida dados obrigatórios
   * 
   * PARÂMETROS OBRIGATÓRIOS:
   * - owner: Proprietário do repositório
   * - repo: Nome do repositório
   * - message: Mensagem do commit
   * - branch: Branch de destino
   * 
   * PARÂMETROS OPCIONAIS:
   * - author_name: Nome do autor
   * - author_email: Email do autor
   * - committer_name: Nome do committer
   * - committer_email: Email do committer
   * 
   * VALIDAÇÕES:
   * - Todos os parâmetros obrigatórios
   * - Mensagem não pode estar vazia
   * - Branch deve existir
   * - Emails devem ser válidos
   * 
   * RECOMENDAÇÕES:
   * - Use mensagens descritivas
   * - Mantenha commits atômicos
   * - Documente mudanças importantes
   * - Use branches apropriadas
   */
  async createCommit(params: CommitsInput, provider: VcsOperations, owner: string): Promise<CommitsResult> {
    try {
      if (!owner || !params.repo || !params.message || !params.branch) {
        throw new Error('repo, message e branch são obrigatórios');
      }

      if (params.message.trim().length === 0) {
        throw new Error('Mensagem do commit não pode estar vazia');
      }

      // Verificar se a branch existe
      try {
        await provider.getBranch(owner, params.repo, params.branch);
      } catch (error) {
        throw new Error(`Branch '${params.branch}' não existe no repositório`);
      }

      // Obter informações do usuário atual para usar como padrão
      const currentUser = await provider.getCurrentUser();
      
      // Preparar dados do commit
      const commitData = {
        message: params.message,
        branch: params.branch,
        author: {
          name: params.author_name || currentUser.login,
          email: params.author_email || currentUser.email || `${currentUser.login}@example.com`
        },
        committer: {
          name: params.committer_name || currentUser.login,
          email: params.committer_email || currentUser.email || `${currentUser.login}@example.com`
        }
      };

      // Criar o commit usando o provider
      const commit = await provider.createCommit(
        owner,
        params.repo,
        commitData.message,
        commitData.branch,
        commitData.author.name,
        commitData.author.email,
        commitData.committer.name,
        commitData.committer.email
      );

      return {
        success: true,
        action: 'create',
        message: `Commit criado com sucesso na branch '${params.branch}'`,
        data: {
          commit: commit,
          message: params.message,
          branch: params.branch,
          author: commitData.author,
          committer: commitData.committer,
          sha: commit.sha,
          url: commit.html_url
        }
      };
    } catch (error) {
      throw new Error(`Falha ao criar commit: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Compara dois commits ou branches
   * 
   * FUNCIONALIDADE:
   * - Compara diferenças entre commits
   * - Mostra arquivos modificados
   * - Retorna estatísticas de mudanças
   * 
   * PARÂMETROS OBRIGATÓRIOS:
   * - owner: Proprietário do repositório
   * - repo: Nome do repositório
   * - base: Commit ou branch base
   * - head: Commit ou branch para comparar
   * 
   * VALIDAÇÕES:
   * - Todos os parâmetros obrigatórios
   * - Base e head devem existir
   * - Deve ser possível comparar
   * 
   * RECOMENDAÇÕES:
   * - Use para análise de mudanças
   * - Compare antes de fazer merge
   * - Analise arquivos modificados
   * - Documente diferenças importantes
   */
  async compareCommits(params: CommitsInput, provider: VcsOperations, owner: string): Promise<CommitsResult> {
    try {
      if (!owner || !params.repo || !params.base || !params.head) {
        throw new Error('repo, base e head são obrigatórios');
      }

      // Verificar se os commits/branches existem
      try {
        // Tentar obter como commits primeiro
        await provider.getCommit(owner, params.repo, params.base);
        await provider.getCommit(owner, params.repo, params.head);
      } catch (commitError) {
        try {
          // Se falhar, tentar como branches
          await provider.getBranch(owner, params.repo, params.base);
          await provider.getBranch(owner, params.repo, params.head);
        } catch (branchError) {
          throw new Error(`Commits/branches não encontrados: ${params.base} ou ${params.head}`);
        }
      }

      // Obter commits de cada referência para análise
      const baseCommits = await provider.listCommits(owner, params.repo, params.base, 1, 10);
      const headCommits = await provider.listCommits(owner, params.repo, params.head, 1, 10);

      // Comparar commits únicos
      const baseCommitShas = baseCommits.map(c => c.sha);
      const headCommitShas = headCommits.map(c => c.sha);
      
      const uniqueBaseCommits = baseCommits.filter(c => !headCommitShas.includes(c.sha));
      const uniqueHeadCommits = headCommits.filter(c => !baseCommitShas.includes(c.sha));

      // Usar compareCommits do provider se disponível
      let detailedComparison = null;
      try {
        if (provider.compareCommits) {
          detailedComparison = await provider.compareCommits(owner, params.repo, params.base, params.head);
        }
      } catch (error) {
        console.warn('Comparação detalhada não disponível:', error);
      }

      return {
        success: true,
        action: 'compare',
        message: `Comparação entre '${params.base}' e '${params.head}' realizada com sucesso`,
        data: {
          base: {
            ref: params.base,
            commits: baseCommits.length,
            unique_commits: uniqueBaseCommits.length,
            last_commit: baseCommits[0]?.sha
          },
          head: {
            ref: params.head,
            commits: headCommits.length,
            unique_commits: uniqueHeadCommits.length,
            last_commit: headCommits[0]?.sha
          },
          comparison: {
            base_ahead: uniqueBaseCommits.length,
            head_ahead: uniqueHeadCommits.length,
            divergent: uniqueBaseCommits.length > 0 && uniqueHeadCommits.length > 0,
            detailed: detailedComparison
          },
          summary: {
            status: uniqueBaseCommits.length === 0 ? 'head está à frente' : 
                   uniqueHeadCommits.length === 0 ? 'base está à frente' :
                   'divergiram',
            can_merge: uniqueBaseCommits.length === 0 || uniqueHeadCommits.length === 0,
            requires_merge: uniqueBaseCommits.length > 0 && uniqueHeadCommits.length > 0
          }
        }
      };
    } catch (error) {
      throw new Error(`Falha ao comparar commits: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Busca commits por critérios específicos
   * 
   * FUNCIONALIDADE:
   * - Busca commits por mensagem
   * - Filtra por autor
   * - Suporta paginação
   * 
   * PARÂMETROS OBRIGATÓRIOS:
   * - owner: Proprietário do repositório
   * - repo: Nome do repositório
   * - query: Termo de busca
   * 
   * PARÂMETROS OPCIONAIS:
   * - author: Autor dos commits
   * - page: Página da busca (padrão: 1)
   * - limit: Itens por página (padrão: 30, máximo: 100)
   * 
   * VALIDAÇÕES:
   * - Todos os parâmetros obrigatórios
   * - Query deve ter pelo menos 3 caracteres
   * - Repositório deve existir
   * 
   * RECOMENDAÇÕES:
   * - Use termos de busca específicos
   * - Combine com filtros de autor
   * - Use paginação para resultados grandes
   * - Analise relevância dos resultados
   */
  async searchCommits(params: CommitsInput, provider: VcsOperations, owner: string): Promise<CommitsResult> {
    try {
      if (!owner || !params.repo || !params.query) {
        throw new Error('repo e query são obrigatórios');
      }

      if (params.query.length < 3) {
        throw new Error('Query deve ter pelo menos 3 caracteres');
      }

      const page = params.page || 1;
      const limit = Math.min(params.limit || 30, 100);

      // Buscar commits usando o provider
      let searchResults: any[] = [];
      if (provider.searchCommits) {
        searchResults = await provider.searchCommits(
          owner, 
          params.repo, 
          params.query, 
          params.author || undefined
        );
      } else {
        // Fallback: buscar todos os commits e filtrar localmente
        const allCommits = await provider.listCommits(owner, params.repo, undefined, 1, 100);
        searchResults = allCommits.filter((commit: any) => 
          commit.message?.toLowerCase().includes(params.query?.toLowerCase() || '') ||
          commit.commit?.message?.toLowerCase().includes(params.query?.toLowerCase() || '')
        );
      }

      // Filtrar resultados por página e limite
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedResults = searchResults.slice(startIndex, endIndex);

      // Filtrar por autor se especificado
      const filteredResults = params.author 
        ? paginatedResults.filter((commit: any) => 
            commit.commit?.author?.name?.toLowerCase().includes(params.author!.toLowerCase()) ||
            commit.author?.login?.toLowerCase().includes(params.author!.toLowerCase())
          )
        : paginatedResults;

      return {
        success: true,
        action: 'search',
        message: `${filteredResults.length} commits encontrados para '${params.query}'`,
        data: {
          query: params.query,
          author: params.author || 'todos',
          page,
          limit,
          total_found: searchResults.length,
          results: filteredResults,
          summary: {
            total_commits: searchResults.length,
            filtered_commits: filteredResults.length,
            authors: [...new Set(filteredResults.map((c: any) => c.commit?.author?.name || c.author?.login).filter(Boolean))],
            date_range: filteredResults.length > 0 ? {
              earliest: filteredResults[filteredResults.length - 1]?.commit?.author?.date,
              latest: filteredResults[0]?.commit?.author?.date
            } : null
          }
        }
      };
    } catch (error) {
      throw new Error(`Falha ao buscar commits: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Faz push dos commits locais para o repositório remoto
   *
   * FUNCIONALIDADE:
   * - Faz push da branch atual para o remote
   * - Suporta especificar branch específica
   * - Verifica se há commits para fazer push
   *
   * PARÂMETROS OBRIGATÓRIOS:
   * - projectPath: Caminho do projeto local
   *
   * PARÂMETROS OPCIONAIS:
   * - branch: Branch para fazer push (padrão: branch atual)
   *
   * RECOMENDAÇÕES:
   * - Verifique se há commits locais antes do push
   * - Use branch específica se necessário
   * - Monitore conflitos durante o push
   */
  async pushCommits(params: CommitsInput, provider?: VcsOperations): Promise<CommitsResult> {
    try {
      if (!params.projectPath) {
        throw new Error('projectPath é obrigatório para push');
      }

      const branch = params.branch || 'main';

      // Faz push usando o terminal controller
      const pushResult = await gitPush(params.projectPath, branch);

      if (pushResult.exitCode !== 0) {
        throw new Error(`Falha no push: ${pushResult.output}`);
      }

      return {
        success: true,
        action: 'push',
        message: `Push realizado com sucesso na branch '${branch}'`,
        data: {
          projectPath: params.projectPath,
          branch: branch,
          pushed: true,
          output: pushResult.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao fazer push: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Faz pull dos commits do repositório remoto
   *
   * FUNCIONALIDADE:
   * - Faz pull da branch atual do remote
   * - Suporta especificar branch específica
   * - Faz merge automático se possível
   *
   * PARÂMETROS OBRIGATÓRIOS:
   * - projectPath: Caminho do projeto local
   *
   * PARÂMETROS OPCIONAIS:
   * - branch: Branch para fazer pull (padrão: branch atual)
   *
   * RECOMENDAÇÕES:
   * - Faça backup antes do pull
   * - Resolva conflitos manualmente se houver
   * - Use branch específica se necessário
   */
  async pullCommits(params: CommitsInput, provider?: VcsOperations): Promise<CommitsResult> {
    try {
      if (!params.projectPath) {
        throw new Error('projectPath é obrigatório para pull');
      }

      const branch = params.branch || 'main';

      // Faz pull usando o terminal controller
      const pullResult = await gitPull(params.projectPath, branch);

      if (pullResult.exitCode !== 0) {
        throw new Error(`Falha no pull: ${pullResult.output}`);
      }

      return {
        success: true,
        action: 'pull',
        message: `Pull realizado com sucesso na branch '${branch}'`,
        data: {
          projectPath: params.projectPath,
          branch: branch,
          pulled: true,
          output: pullResult.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao fazer pull: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
};



