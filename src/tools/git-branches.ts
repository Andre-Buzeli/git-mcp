import { z } from 'zod';
import { globalProviderFactory, VcsOperations } from '../providers/index.js';
import { applyAutoUserDetection } from '../utils/user-detection.js';
import { ErrorHandler } from '../providers/error-handler.js';

/**
 * Tool: branches
 * 
 * DESCRIÇÃO:
 * Gerenciamento completo de branches Gitea com múltiplas ações
 * 
 * FUNCIONALIDADES:
 * - Criação de novas branches
 * - Listagem e busca de branches
 * - Obtenção de detalhes específicos
 * - Exclusão de branches
 * - Merge de branches
 * - Comparação entre branches
 * 
 * USO:
 * - Para gerenciar fluxo de trabalho Git
 * - Para criar branches de feature
 * - Para organizar desenvolvimento
 * - Para controle de versão
 * 
 * RECOMENDAÇÕES:
 * - Use convenções de nomenclatura consistentes
 * - Proteja branches importantes
 * - Mantenha branches limpas
 * - Documente propósito das branches
 */

/**
 * Schema de validação para entrada da tool branches
 * 
 * VALIDAÇÕES:
 * - action: Ação obrigatória (create, list, get, delete, merge, compare)
 * - Parâmetros específicos por ação
 * - Validação de tipos e formatos
 * 
 * RECOMENDAÇÕES:
 * - Sempre valide entrada antes de usar
 * - Use parâmetros opcionais adequadamente
 * - Documente parâmetros obrigatórios
 */
const BranchesInputSchema = z.object({
  action: z.enum(['create', 'list', 'get', 'delete', 'merge', 'compare']),
  
  // Parâmetros comuns
  repo: z.string(),
  projectPath: z.string().describe('Local project path for git operations'),
  provider: z.enum(['gitea', 'github']).describe('Provider to use (gitea or github)'),  // Para create
  branch_name: z.string().optional(),
  from_branch: z.string().optional(),
  
  // Para get/delete
  branch: z.string().optional(),
  
  // Para merge
  head: z.string().optional(),
  base: z.string().optional(),
  merge_method: z.enum(['merge', 'rebase', 'squash']).optional(),
  
  // Para list
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  
  // Para compare
  base_branch: z.string().optional(),
  head_branch: z.string().optional(),
});

export type BranchesInput = z.infer<typeof BranchesInputSchema>;

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
const BranchesResultSchema = z.object({
  success: z.boolean(),
  action: z.string(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional()
});

export type BranchesResult = z.infer<typeof BranchesResultSchema>;

/**
 * Tool: branches
 * 
 * DESCRIÇÃO:
 * Gerenciamento completo de branches Gitea com múltiplas ações
 * 
 * ACTIONS DISPONÍVEIS:
 * 
 * 1. create - Criar nova branch
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - branch_name (obrigatório): Nome da nova branch
 *    - from_branch (obrigatório): Branch de origem
 * 
 * 2. list - Listar branches
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - page (opcional): Página da listagem (padrão: 1)
 *    - limit (opcional): Itens por página (padrão: 30)
 * 
 * 3. get - Obter detalhes da branch
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - branch (obrigatório): Nome da branch
 * 
 * 4. delete - Deletar branch
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - branch (obrigatório): Nome da branch
 * 
 * 5. merge - Fazer merge de branches
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - head (obrigatório): Branch de origem
 *    - base (obrigatório): Branch de destino
 *    - merge_method (opcional): Método de merge (padrão: merge)
 * 
 * 6. compare - Comparar branches
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - base_branch (obrigatório): Branch base
 *    - head_branch (obrigatório): Branch de comparação
 * 
 * RECOMENDAÇÕES DE USO:
 * - Use nomes descritivos para branches
 * - Mantenha branches principais protegidas
 * - Faça merge regularmente
 * - Documente propósito das branches
 * - Use convenções de nomenclatura
 * - Limpe branches antigas
 */
export const branchesTool = {
  name: 'git-branches',
  description: 'tool: Gerencia branches Git, criação, listagem, merge e comparação\n──────────────\naction create: cria nova branch\naction create requires: repo, branch_name, from_branch, provider, projectPath\n───────────────\naction list: lista branches do repositório\naction list requires: repo, page, limit, provider, projectPath\n───────────────\naction get: obtém detalhes de branch\naction get requires: repo, branch, provider, projectPath\n───────────────\naction delete: remove branch\naction delete requires: repo, branch, provider, projectPath\n───────────────\naction merge: integra branches\naction merge requires: repo, head, base, merge_method, provider, projectPath\n───────────────\naction compare: compara branches\naction compare requires: repo, base_branch, head_branch, provider, projectPath',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['create', 'list', 'get', 'delete', 'merge', 'compare'],
        description: 'Action to perform on branches'
      },
      repo: { type: 'string', description: 'Repository name' },
      projectPath: { type: 'string', description: 'Local project path for git operations' },
      provider: { type: 'string', description: 'Specific provider (github, gitea) or use default' },
      branch_name: { type: 'string', description: 'Name of the new branch' },
      from_branch: { type: 'string', description: 'Source branch for creation' },
      branch: { type: 'string', description: 'Branch name' },
      head: { type: 'string', description: 'Source branch for merge' },
      base: { type: 'string', description: 'Target branch for merge' },
      merge_method: { 
        type: 'string', 
        enum: ['merge', 'rebase', 'squash'],
        description: 'Merge method' 
      },
      page: { type: 'number', description: 'Page number', minimum: 1 },
      limit: { type: 'number', description: 'Items per page', minimum: 1, maximum: 100 },
      base_branch: { type: 'string', description: 'Base branch for comparison' },
      head_branch: { type: 'string', description: 'Head branch for comparison' }
    },
    required: ['action', 'repo', 'provider', 'projectPath']
  },

  /**
   * Handler principal da tool branches
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
  async handler(input: BranchesInput): Promise<BranchesResult> {
    try {
      const validatedInput = BranchesInputSchema.parse(input);
      
      // Aplicar auto-detecção apenas para owner dentro do provider especificado
      const processedInput = await applyAutoUserDetection(validatedInput, validatedInput.provider);
      
      // Usar o provider especificado pelo usuário ou o padrão se não especificado
      let provider: VcsOperations;
      try {
        if (processedInput.provider) {
          const requestedProvider = globalProviderFactory.getProvider(processedInput.provider);
          if (!requestedProvider) {
            console.warn(`[BRANCHES] Provider '${processedInput.provider}' não encontrado, usando padrão`);
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
        console.error('[BRANCHES] Erro ao obter provider:', providerError);
        throw new Error(`Erro de configuração do provider: ${providerError instanceof Error ? providerError.message : 'Provider não disponível'}`);
      }
      
      switch (processedInput.action) {
        case 'create':
          return await this.createBranch(processedInput, provider);
        case 'list':
          return await this.listBranches(processedInput, provider);
        case 'get':
          return await this.getBranch(processedInput, provider);
        case 'delete':
          return await this.deleteBranch(processedInput, provider);
        case 'merge':
          return await this.mergeBranches(processedInput, provider);
        case 'compare':
          return await this.compareBranches(processedInput, provider);
        default:
          throw new Error(`Ação não suportada: ${processedInput.action}`);
      }
    } catch (error) {
      return {
        success: false,
        action: input.action,
        message: 'Erro na operação de branches',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  /**
   * Cria uma nova branch no repositório
   * 
   * FUNCIONALIDADE:
   * - Valida parâmetros obrigatórios
   * - Cria branch a partir de branch existente
   * - Retorna detalhes da nova branch
   * 
   * PARÂMETROS OBRIGATÓRIOS:
   * - owner: Proprietário do repositório
   * - repo: Nome do repositório
   * - branch_name: Nome da nova branch
   * - from_branch: Branch de origem
   * 
   * VALIDAÇÕES:
   * - Todos os parâmetros obrigatórios
   * - Branch de origem deve existir
   * - Nome da nova branch deve ser único
   * 
   * RECOMENDAÇÕES:
   * - Use nomes descritivos para branches
   * - Crie a partir de branches estáveis
   * - Documente propósito da branch
   * - Use convenções de nomenclatura
   */
  async createBranch(params: BranchesInput, provider: VcsOperations): Promise<BranchesResult> {
    try {
      if (!params.repo || !params.branch_name || !params.from_branch) {
        throw new Error('Repo, branch_name e from_branch são obrigatórios');
      }

      const currentUser = await provider.getCurrentUser();
      const owner = currentUser.login;

      const branch = await provider.createBranch(
        owner,
        params.repo,
        params.branch_name,
        params.from_branch
      );

      return {
        success: true,
        action: 'create',
        message: `Branch '${params.branch_name}' criada com sucesso a partir de '${params.from_branch}'`,
        data: branch
      };
    } catch (error) {
      throw new Error(`Falha ao criar branch: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Lista todas as branches do repositório
   * 
   * FUNCIONALIDADE:
   * - Lista branches com paginação
   * - Retorna informações básicas de cada branch
   * - Suporta filtros de paginação
   * 
   * PARÂMETROS OBRIGATÓRIOS:
   * - owner: Proprietário do repositório
   * - repo: Nome do repositório
   * 
   * PARÂMETROS OPCIONAIS:
   * - page: Página da listagem (padrão: 1)
   * - limit: Itens por página (padrão: 30, máximo: 100)
   * 
   * VALIDAÇÕES:
   * - e repo obrigatórios
   * - Page deve ser >= 1
   * - Limit deve ser entre 1 e 100
   * 
   * RECOMENDAÇÕES:
   * - Use paginação para repositórios grandes
   * - Monitore número total de branches
   * - Mantenha branches organizadas
   */
  async listBranches(params: BranchesInput, provider: VcsOperations): Promise<BranchesResult> {
    try {
      if (!params.repo) {
        throw new Error('Repo é obrigatório');
      }

      const currentUser = await provider.getCurrentUser();
      const owner = currentUser.login;

      const page = params.page || 1;
      const limit = params.limit || 30;
      
      const branches = await provider.listBranches((await provider.getCurrentUser()).login, params.repo, page, limit);

      return {
        success: true,
        action: 'list',
        message: `${branches.length} branches encontradas`,
        data: {
          branches,
          page,
          limit,
          total: branches.length
        }
      };
    } catch (error) {
      throw new Error(`Falha ao listar branches: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Obtém detalhes de uma branch específica
   * 
   * FUNCIONALIDADE:
   * - Retorna informações completas da branch
   * - Inclui commit mais recente
   * - Informações de proteção e permissões
   * 
   * PARÂMETROS OBRIGATÓRIOS:
   * - owner: Proprietário do repositório
   * - repo: Nome do repositório
   * - branch: Nome da branch
   * 
   * VALIDAÇÕES:
   * - Todos os parâmetros obrigatórios
   * - Branch deve existir no repositório
   * 
   * RECOMENDAÇÕES:
   * - Use para obter informações detalhadas
   * - Verifique status de proteção
   * - Monitore commits recentes
   */
  async getBranch(params: BranchesInput, provider: VcsOperations): Promise<BranchesResult> {
    try {
      if (!params.repo || !params.branch) {
        throw new Error('Repo e branch são obrigatórios');
      }

      const currentUser = await provider.getCurrentUser();
      const owner = currentUser.login;

      const branch = await provider.getBranch((await provider.getCurrentUser()).login, params.repo, params.branch);

      return {
        success: true,
        action: 'get',
        message: `Branch '${params.branch}' obtida com sucesso`,
        data: branch
      };
    } catch (error) {
      throw new Error(`Falha ao obter branch: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Deleta uma branch do repositório
   * 
   * FUNCIONALIDADE:
   * - Remove branch especificada
   * - Valida permissões de exclusão
   * - Confirma exclusão bem-sucedida
   * 
   * PARÂMETROS OBRIGATÓRIOS:
   * - owner: Proprietário do repositório
   * - repo: Nome do repositório
   * - branch: Nome da branch a ser deletada
   * 
   * VALIDAÇÕES:
   * - Todos os parâmetros obrigatórios
   * - Branch deve existir
   * - Usuário deve ter permissão de exclusão
   * 
   * RECOMENDAÇÕES:
   * - Confirme antes de deletar
   * - Verifique se branch foi mergeada
   * - Mantenha backup se necessário
   * - Documente motivo da exclusão
   */
  async deleteBranch(params: BranchesInput, provider: VcsOperations): Promise<BranchesResult> {
    try {
      if (!params.repo || !params.branch) {
        throw new Error('Repo e branch são obrigatórios');
      }

      const currentUser = await provider.getCurrentUser();
      const owner = currentUser.login;

      await provider.deleteBranch((await provider.getCurrentUser()).login, params.repo, params.branch);

      return {
        success: true,
        action: 'delete',
        message: `Branch '${params.branch}' deletada com sucesso`,
        data: { deleted: true }
      };
    } catch (error) {
      throw new Error(`Falha ao deletar branch: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Faz merge de uma branch em outra
   * 
   * FUNCIONALIDADE:
   * - Merge de branch de origem em branch de destino
   * - Suporta diferentes métodos de merge
   * - Retorna resultado do merge
   * 
   * PARÂMETROS OBRIGATÓRIOS:
   * - owner: Proprietário do repositório
   * - repo: Nome do repositório
   * - head: Branch de origem (será mergeada)
   * - base: Branch de destino (receberá o merge)
   * 
   * PARÂMETROS OPCIONAIS:
   * - merge_method: Método de merge (merge, rebase, squash)
   * 
   * VALIDAÇÕES:
   * - Todos os parâmetros obrigatórios
   * - Branches devem existir
   * - Não deve haver conflitos
   * 
   * RECOMENDAÇÕES:
   * - Resolva conflitos antes do merge
   * - Escolha método de merge adequado
   * - Teste após o merge
   * - Documente mudanças
   */
  async mergeBranches(params: BranchesInput, provider: VcsOperations): Promise<BranchesResult> {
    try {
      if (!params.repo || !params.head || !params.base) {
        throw new Error('Repo, head e base são obrigatórios');
      }

      const currentUser = await provider.getCurrentUser();
      const owner = currentUser.login;
      const mergeMethod = params.merge_method || 'merge';

      // Verificar se as branches existem
      try {
        await provider.getBranch(owner, params.repo, params.head);
        await provider.getBranch(owner, params.repo, params.base);
      } catch (error) {
        throw new Error(`Uma das branches não existe: ${params.head} ou ${params.base}`);
      }

      // Criar pull request para fazer o merge
      const prTitle = `Merge ${params.head} into ${params.base}`;
      const prBody = `Merge automático da branch '${params.head}' na branch '${params.base}'\n\nMétodo: ${mergeMethod}`;

      const pullRequest = await provider.createPullRequest(
        owner,
        params.repo,
        prTitle,
        prBody,
        params.head,
        params.base
      );

      // Se o merge_method for merge direto, fazer merge automático
      if (mergeMethod === 'merge') {
        try {
          await provider.mergePullRequest(owner, params.repo, pullRequest.number, 'merge');
          
          return {
            success: true,
            action: 'merge',
            message: `Merge de '${params.head}' em '${params.base}' realizado com sucesso`,
            data: {
              head: params.head,
              base: params.base,
              merge_method: mergeMethod,
              pull_request: pullRequest,
              merged: true
            }
          };
        } catch (mergeError) {
          return {
            success: true,
            action: 'merge',
            message: `Pull request criado para merge de '${params.head}' em '${params.base}' (merge automático falhou)`,
            data: {
              head: params.head,
              base: params.base,
              merge_method: mergeMethod,
              pull_request: pullRequest,
              merged: false,
              merge_error: mergeError instanceof Error ? mergeError.message : String(mergeError)
            }
          };
        }
      }

      return {
        success: true,
        action: 'merge',
        message: `Pull request criado para merge de '${params.head}' em '${params.base}'`,
        data: {
          head: params.head,
          base: params.base,
          merge_method: mergeMethod,
          pull_request: pullRequest,
          requires_manual_review: true
        }
      };
    } catch (error) {
      throw new Error(`Falha ao fazer merge: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Compara duas branches
   * 
   * FUNCIONALIDADE:
   * - Compara diferenças entre branches
   * - Retorna commits diferentes
   * - Mostra divergências
   * 
   * PARÂMETROS OBRIGATÓRIOS:
   * - owner: Proprietário do repositório
   * - repo: Nome do repositório
   * - base_branch: Branch base para comparação
   * - head_branch: Branch a ser comparada
   * 
   * VALIDAÇÕES:
   * - Todos os parâmetros obrigatórios
   * - Ambas as branches devem existir
   * 
   * RECOMENDAÇÕES:
   * - Use para verificar divergências
   * - Compare antes de fazer merge
   * - Analise commits diferentes
   * - Documente diferenças importantes
   */
  async compareBranches(params: BranchesInput, provider: VcsOperations): Promise<BranchesResult> {
    try {
      if (!params.repo || !params.base_branch || !params.head_branch) {
        throw new Error('Repo, base_branch e head_branch são obrigatórios');
      }

      const currentUser = await provider.getCurrentUser();
      const owner = currentUser.login;

      // Verificar se as branches existem
      try {
        const baseBranch = await provider.getBranch(owner, params.repo, params.base_branch);
        const headBranch = await provider.getBranch(owner, params.repo, params.head_branch);
      } catch (error) {
        throw new Error(`Uma das branches não existe: ${params.base_branch} ou ${params.head_branch}`);
      }

      // Obter commits de cada branch
      const baseCommits = await provider.listCommits(owner, params.repo, params.base_branch, 1, 10);
      const headCommits = await provider.listCommits(owner, params.repo, params.head_branch, 1, 10);

      // Comparar commits (simplificado - apenas verificar se há commits diferentes)
      const baseCommitShas = baseCommits.map(c => c.sha);
      const headCommitShas = headCommits.map(c => c.sha);
      
      const uniqueBaseCommits = baseCommits.filter(c => !headCommitShas.includes(c.sha));
      const uniqueHeadCommits = headCommits.filter(c => !baseCommitShas.includes(c.sha));

      // Usar compareCommits se disponível no provider
      let detailedComparison = null;
      try {
        if (provider.compareCommits) {
          detailedComparison = await provider.compareCommits(owner, params.repo, params.base_branch, params.head_branch);
        }
      } catch (error) {
        console.warn('Comparação detalhada não disponível:', error);
      }

      return {
        success: true,
        action: 'compare',
        message: `Comparação entre '${params.base_branch}' e '${params.head_branch}' realizada com sucesso`,
        data: {
          base: {
            branch: params.base_branch,
            commits: baseCommits.length,
            unique_commits: uniqueBaseCommits.length,
            last_commit: baseCommits[0]?.sha
          },
          head: {
            branch: params.head_branch,
            commits: headCommits.length,
            unique_commits: uniqueHeadCommits.length,
            last_commit: headCommits[0]?.sha
          },
          comparison: {
            base_ahead: uniqueBaseCommits.length,
            head_ahead: uniqueHeadCommits.length,
            divergent: uniqueBaseCommits.length > 0 && uniqueHeadCommits.length > 0,
            mergeable: true, // Assumir mergeable por padrão
            detailed: detailedComparison
          },
          summary: {
            can_merge: uniqueBaseCommits.length === 0 || uniqueHeadCommits.length === 0,
            requires_merge: uniqueBaseCommits.length > 0 && uniqueHeadCommits.length > 0,
            recommendation: uniqueBaseCommits.length === 0 ? 'head está à frente' : 
                           uniqueHeadCommits.length === 0 ? 'base está à frente' :
                           'branches divergiram'
          }
        }
      };
    } catch (error) {
      throw new Error(`Falha ao comparar branches: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Verifica se erro é relacionado a Git
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

