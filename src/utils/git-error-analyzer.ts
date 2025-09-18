/**
 * Analisador inteligente de erros Git com sugestões de solução automática
 * 
 * FUNCIONALIDADE:
 * - Analisa erros Git específicos
 * - Identifica a causa raiz do problema
 * - Sugere comandos Git para resolver
 * - Permite ao AI agent resolver automaticamente
 * 
 * CASOS DE USO:
 * - Conflitos de merge
 * - Problemas de autenticação
 * - Branches divergentes
 * - Repositórios não sincronizados
 * - Permissões insuficientes
 */

export interface GitErrorAnalysis {
  errorType: string;
  cause: string;
  solution: string;
  suggestedCommands: string[];
  autoFixable: boolean;
  requiresUserAction: boolean;
  relatedTools: string[];
}

export interface IntelligentErrorResponse {
  success: false;
  action: string;
  message: string;
  error: string;
  analysis: GitErrorAnalysis;
  nextSteps: string[];
}

export class GitErrorAnalyzer {
  
  /**
   * Analisa erro Git e retorna análise inteligente com sugestões
   */
  static analyzeGitError(error: string, context: string = ''): GitErrorAnalysis {
    const errorLower = error.toLowerCase();
    
    // 1. CONFLITOS DE MERGE
    if (errorLower.includes('conflict') || errorLower.includes('merge conflict')) {
      return {
        errorType: 'MERGE_CONFLICT',
        cause: 'Conflito de merge entre branches divergentes',
        solution: 'Resolver conflitos manualmente ou usar estratégia de merge',
        suggestedCommands: [
          'git status',
          'git diff',
          'git add .',
          'git commit -m "Resolve merge conflicts"',
          'git push origin main'
        ],
        autoFixable: false,
        requiresUserAction: true,
        relatedTools: ['git-commits', 'git-branches', 'git-files']
      };
    }
    
    // 2. BRANCHES DIVERGENTES
    if (errorLower.includes('divergent') || errorLower.includes('non-fast-forward')) {
      return {
        errorType: 'DIVERGENT_BRANCHES',
        cause: 'Branches locais e remotas divergiram - histórico não relacionado',
        solution: 'Sincronizar branches usando pull com rebase ou merge',
        suggestedCommands: [
          'git pull origin main --rebase',
          'git pull origin main --allow-unrelated-histories',
          'git push origin main --force'
        ],
        autoFixable: true,
        requiresUserAction: false,
        relatedTools: ['git-commits', 'git-branches', 'git-remote']
      };
    }
    
    // 3. REPOSITÓRIO NÃO SINCRONIZADO
    if (errorLower.includes('fetch first') || errorLower.includes('updates were rejected')) {
      return {
        errorType: 'OUT_OF_SYNC',
        cause: 'Repositório local está desatualizado em relação ao remoto',
        solution: 'Fazer pull para sincronizar antes do push',
        suggestedCommands: [
          'git pull origin main',
          'git push origin main'
        ],
        autoFixable: true,
        requiresUserAction: false,
        relatedTools: ['git-commits', 'git-remote']
      };
    }
    
    // 4. PROBLEMAS DE AUTENTICAÇÃO
    if (errorLower.includes('authentication') || errorLower.includes('unauthorized') || 
        errorLower.includes('failed to authenticate')) {
      return {
        errorType: 'AUTHENTICATION_ERROR',
        cause: 'Falha na autenticação - credenciais inválidas ou expiradas',
        solution: 'Verificar e configurar credenciais Git',
        suggestedCommands: [
          'git config --global user.name "Your Name"',
          'git config --global user.email "your.email@example.com"',
          'git remote set-url origin https://username:token@host/repo.git'
        ],
        autoFixable: false,
        requiresUserAction: true,
        relatedTools: ['git-config', 'git-remote']
      };
    }
    
    // 5. REPOSITÓRIO NÃO ENCONTRADO
    if (errorLower.includes('not found') || errorLower.includes('repository not found')) {
      return {
        errorType: 'REPOSITORY_NOT_FOUND',
        cause: 'Repositório não existe ou URL incorreta',
        solution: 'Verificar URL do repositório e permissões',
        suggestedCommands: [
          'git remote -v',
          'git remote set-url origin https://correct-url.git',
          'git push origin main'
        ],
        autoFixable: false,
        requiresUserAction: true,
        relatedTools: ['git-remote', 'git-repositories']
      };
    }
    
    // 6. PERMISSÕES INSUFICIENTES
    if (errorLower.includes('permission') || errorLower.includes('forbidden') || 
        errorLower.includes('access denied')) {
      return {
        errorType: 'PERMISSION_DENIED',
        cause: 'Usuário não tem permissão para realizar a operação',
        solution: 'Verificar permissões do usuário no repositório',
        suggestedCommands: [
          'git config --list | grep user',
          'git remote -v',
          'Verificar permissões no GitHub/Gitea'
        ],
        autoFixable: false,
        requiresUserAction: true,
        relatedTools: ['git-config', 'git-remote']
      };
    }
    
    // 7. WORKING DIRECTORY SUJO
    if (errorLower.includes('working tree') || errorLower.includes('uncommitted changes')) {
      return {
        errorType: 'DIRTY_WORKING_TREE',
        cause: 'Working directory tem mudanças não commitadas',
        solution: 'Fazer commit ou stash das mudanças antes da operação',
        suggestedCommands: [
          'git status',
          'git add .',
          'git commit -m "Save changes"',
          'git stash',
          'git stash pop'
        ],
        autoFixable: true,
        requiresUserAction: false,
        relatedTools: ['git-commits', 'git-stash']
      };
    }
    
    // 8. BRANCH NÃO EXISTE
    if (errorLower.includes('branch') && errorLower.includes('does not exist')) {
      return {
        errorType: 'BRANCH_NOT_FOUND',
        cause: 'Branch especificada não existe localmente ou remotamente',
        solution: 'Criar branch ou fazer checkout de branch existente',
        suggestedCommands: [
          'git branch -a',
          'git checkout -b new-branch',
          'git checkout existing-branch',
          'git push origin new-branch'
        ],
        autoFixable: true,
        requiresUserAction: false,
        relatedTools: ['git-branches']
      };
    }
    
    // 9. ERRO GENÉRICO - TENTAR ANÁLISE MAIS PROFUNDA
    return this.analyzeGenericError(error, context);
  }
  
  /**
   * Analisa erros genéricos tentando extrair informações úteis
   */
  private static analyzeGenericError(error: string, context: string): GitErrorAnalysis {
    const errorLower = error.toLowerCase();
    
    // Verificar se é erro de rede
    if (errorLower.includes('network') || errorLower.includes('connection') || 
        errorLower.includes('timeout')) {
      return {
        errorType: 'NETWORK_ERROR',
        cause: 'Problema de conectividade de rede',
        solution: 'Verificar conexão e tentar novamente',
        suggestedCommands: [
          'ping hostname',
          'git remote -v',
          'Tentar novamente em alguns minutos'
        ],
        autoFixable: true,
        requiresUserAction: false,
        relatedTools: ['git-remote']
      };
    }
    
    // Verificar se é erro de espaço em disco
    if (errorLower.includes('space') || errorLower.includes('disk') || 
        errorLower.includes('full')) {
      return {
        errorType: 'DISK_SPACE_ERROR',
        cause: 'Espaço em disco insuficiente',
        solution: 'Liberar espaço em disco',
        suggestedCommands: [
          'df -h',
          'git gc --prune=now',
          'git remote prune origin'
        ],
        autoFixable: false,
        requiresUserAction: true,
        relatedTools: []
      };
    }
    
    // Erro desconhecido
    return {
      errorType: 'UNKNOWN_ERROR',
      cause: 'Erro não identificado - análise manual necessária',
      solution: 'Verificar logs detalhados e documentação',
      suggestedCommands: [
        'git status',
        'git log --oneline -5',
        'git remote -v',
        'Verificar documentação Git'
      ],
      autoFixable: false,
      requiresUserAction: true,
      relatedTools: ['git-commits', 'git-remote', 'git-config']
    };
  }
  
  /**
   * Cria resposta inteligente de erro com análise e sugestões
   */
  static createIntelligentErrorResponse(
    action: string, 
    error: string, 
    context: string = ''
  ): IntelligentErrorResponse {
    const analysis = this.analyzeGitError(error, context);
    
    return {
      success: false,
      action,
      message: `Erro na operação ${action}: ${analysis.cause}`,
      error: error,
      analysis,
      nextSteps: this.generateNextSteps(analysis)
    };
  }
  
  /**
   * Gera próximos passos baseados na análise do erro
   */
  private static generateNextSteps(analysis: GitErrorAnalysis): string[] {
    const steps: string[] = [];
    
    if (analysis.autoFixable) {
      steps.push(`✅ ERRO AUTOMATICAMENTE RESOLVÍVEL: ${analysis.solution}`);
      steps.push(`🔧 Use as seguintes tools para resolver:`);
      analysis.relatedTools.forEach(tool => {
        steps.push(`   - ${tool}: Para ${this.getToolDescription(tool)}`);
      });
    } else {
      steps.push(`⚠️ ERRO REQUER AÇÃO MANUAL: ${analysis.solution}`);
      steps.push(`📋 Comandos sugeridos:`);
      analysis.suggestedCommands.forEach(cmd => {
        steps.push(`   - ${cmd}`);
      });
    }
    
    steps.push(`🎯 CAUSA IDENTIFICADA: ${analysis.cause}`);
    steps.push(`💡 TIPO DE ERRO: ${analysis.errorType}`);
    
    return steps;
  }
  
  /**
   * Retorna descrição da tool para contexto
   */
  private static getToolDescription(tool: string): string {
    const descriptions: Record<string, string> = {
      'git-commits': 'gerenciar commits e histórico',
      'git-branches': 'gerenciar branches',
      'git-remote': 'configurar repositórios remotos',
      'git-config': 'configurar credenciais Git',
      'git-files': 'gerenciar arquivos',
      'git-stash': 'salvar mudanças temporariamente',
      'git-repositories': 'gerenciar repositórios'
    };
    
    return descriptions[tool] || 'operar com Git';
  }
  
  /**
   * Verifica se um erro pode ser resolvido automaticamente
   */
  static isAutoFixable(error: string): boolean {
    const analysis = this.analyzeGitError(error);
    return analysis.autoFixable;
  }
  
  /**
   * Retorna as tools relacionadas que podem ajudar a resolver o erro
   */
  static getRelatedTools(error: string): string[] {
    const analysis = this.analyzeGitError(error);
    return analysis.relatedTools;
  }
}
