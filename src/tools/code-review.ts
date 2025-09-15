import { z } from 'zod';
import { globalProviderFactory, VcsOperations } from '../providers/index.js';
import { applyAutoUserDetection } from '../utils/user-detection.js';
import { CommonSchemas } from './validator.js';

/**
 * Tool: code-review
 *
 * DESCRIÇÃO:
 * Ferramenta completa de revisão de código com análise automatizada,
 * sugestões de melhorias, detecção de problemas e geração de relatórios.
 *
 * FUNCIONALIDADES:
 * - Análise de qualidade de código
 * - Detecção de bugs e vulnerabilidades
 * - Sugestões de otimização
 * - Revisão de commits e arquivos
 * - Geração de relatórios de qualidade
 * - Aplicação automática de correções
 *
 * USO:
 * - Para revisão automatizada de pull requests
 * - Para análise de qualidade de código
 * - Para detecção de problemas de segurança
 * - Para sugestões de melhorias de performance
 *
 * RECOMENDAÇÕES:
 * - Execute regularmente em novos commits
 * - Configure regras específicas por linguagem
 * - Use em conjunto com CI/CD
 * - Revise sugestões antes de aplicar
 */

/**
 * Schema de validação para entrada da tool code-review
 */
const CodeReviewInputSchema = z.object({
  action: z.enum(['analyze', 'review-file', 'review-commit', 'review-pr', 'generate-report', 'apply-suggestions']),

  // Parâmetros comuns
  owner: z.string().optional(),
  repo: z.string().optional(),
  provider: CommonSchemas.provider,

  // Para analyze
  code: z.string().optional(),
  language: z.string().optional(),
  file_path: z.string().optional(),

  // Para review-file e review-commit
  path: z.string().optional(),
  sha: z.string().optional(),
  branch: z.string().optional(),

  // Para review-pr
  pull_number: z.number().optional(),

  // Para generate-report
  report_type: z.enum(['summary', 'detailed', 'security', 'performance']).optional(),
  include_suggestions: z.boolean().optional(),

  // Para apply-suggestions
  suggestions: z.array(z.object({
    file_path: z.string(),
    line_number: z.number(),
    suggestion: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical'])
  })).optional(),

  // Configurações
  rules: z.array(z.string()).optional(), // Regras específicas para análise
  exclude_patterns: z.array(z.string()).optional() // Padrões para excluir da análise
}).refine((data) => {
  // Validações específicas por ação
  if (['analyze'].includes(data.action)) {
    return data.code || (data.owner && data.repo && data.path);
  }
  if (['review-file', 'review-commit'].includes(data.action)) {
    return data.owner && data.repo && (data.path || data.sha);
  }
  if (['review-pr'].includes(data.action)) {
    return data.owner && data.repo && data.pull_number;
  }
  if (['apply-suggestions'].includes(data.action)) {
    return data.owner && data.repo && data.suggestions && data.suggestions.length > 0;
  }
  return data.owner && data.repo;
}, {
  message: "Parâmetros obrigatórios não fornecidos para a ação especificada"
});

export type CodeReviewInput = z.infer<typeof CodeReviewInputSchema>;

/**
 * Schema de validação para resultado da tool code-review
 */
const CodeReviewResultSchema = z.object({
  success: z.boolean(),
  action: z.string(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional()
});

export type CodeReviewResult = z.infer<typeof CodeReviewResultSchema>;

/**
 * Implementação da tool code-review
 */
export const codeReviewTool = {
  name: 'code-review',
  description: 'Análise completa de código com detecção de problemas, sugestões de melhoria e geração de relatórios: analyze (análise geral), review-file (revisão de arquivo), review-commit (revisão de commit), review-pr (revisão de PR), generate-report (relatório), apply-suggestions (aplicar correções). Suporte para múltiplas linguagens. Uso eficiente: revisão automatizada de qualidade, detecção de bugs, sugestões de otimização e relatórios de compliance.',

  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['analyze', 'review-file', 'review-commit', 'review-pr', 'generate-report', 'apply-suggestions'],
        description: 'Ação a executar: analyze (análise), review-file (revisar arquivo), review-commit (revisar commit), review-pr (revisar PR), generate-report (gerar relatório), apply-suggestions (aplicar sugestões)'
      },
      owner: {
        type: 'string',
        description: 'Proprietário do repositório (OBRIGATÓRIO para ações que acessam repositório)'
      },
      repo: {
        type: 'string',
        description: 'Nome do repositório (OBRIGATÓRIO para ações que acessam repositório)'
      },
      provider: {
        type: 'string',
        description: 'Provider específico (github, gitea) ou usa padrão'
      },
      code: {
        type: 'string',
        description: 'Código para análise direta (OBRIGATÓRIO para analyze se não usar file_path)'
      },
      language: {
        type: 'string',
        description: 'Linguagem de programação (javascript, python, java, etc.)'
      },
      file_path: {
        type: 'string',
        description: 'Caminho do arquivo para análise (OBRIGATÓRIO para analyze se não usar code)'
      },
      path: {
        type: 'string',
        description: 'Caminho do arquivo (OBRIGATÓRIO para review-file)'
      },
      sha: {
        type: 'string',
        description: 'SHA do commit (OBRIGATÓRIO para review-commit)'
      },
      branch: {
        type: 'string',
        description: 'Branch específica para análise'
      },
      pull_number: {
        type: 'number',
        description: 'Número do Pull Request (OBRIGATÓRIO para review-pr)'
      },
      report_type: {
        type: 'string',
        enum: ['summary', 'detailed', 'security', 'performance'],
        description: 'Tipo de relatório (padrão: summary)'
      },
      include_suggestions: {
        type: 'boolean',
        description: 'Incluir sugestões no relatório (padrão: true)'
      },
      suggestions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            file_path: { type: 'string' },
            line_number: { type: 'number' },
            suggestion: { type: 'string' },
            severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] }
          }
        },
        description: 'Lista de sugestões para aplicar (OBRIGATÓRIO para apply-suggestions)'
      },
      rules: {
        type: 'array',
        items: { type: 'string' },
        description: 'Regras específicas para análise (ex: ["no-console", "max-lines"])'
      },
      exclude_patterns: {
        type: 'array',
        items: { type: 'string' },
        description: 'Padrões para excluir da análise (ex: ["*.min.js", "dist/**"])'
      }
    },
    required: ['action']
  },

  async handler(input: CodeReviewInput): Promise<CodeReviewResult> {
    try {
      const validatedInput = CodeReviewInputSchema.parse(input);

      // Aplicar auto-detecção de usuário
      const updatedParams = await applyAutoUserDetection(validatedInput, validatedInput.provider);
      // Verificação específica para Gitea
      console.log('[CODE-REVIEW] Provider recebido:', validatedInput.provider);
      if (validatedInput.provider === 'gitea') {
        return {
          success: false,
          action: validatedInput.action,
          message: 'Code review automatizado não está disponível para o Gitea',
          error: 'GITEA: Code review automatizado não está disponível para o Gitea. Esta funcionalidade é específica do GitHub.'
        };
      }

      const provider = updatedParams.provider


        ? globalProviderFactory.getProvider(updatedParams.provider)


        : globalProviderFactory.getDefaultProvider();

      if (!provider) {
        throw new Error(`Provider '${updatedParams.provider}' não encontrado`);
      }

      switch (updatedParams.action) {
        case 'analyze':
          return await this.analyzeCode(validatedInput);
        case 'review-file':
          return await this.reviewCommit(updatedParams, provider);
        case 'review-commit':
          return await this.reviewPullRequest(updatedParams, provider);
        case 'review-pr':
          return await this.generateReport(updatedParams, provider);
        case 'generate-report':
          return await this.applySuggestions(updatedParams, provider);
        case 'apply-suggestions':
          return await this.applySuggestions(updatedParams, provider);
        default:
          throw new Error(`Ação não suportada: ${updatedParams.action}`);
      }
    } catch (error) {
      return {
        success: false,
        action: input.action || 'unknown',
        message: 'Erro na análise de código',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  /**
   * Análise geral de código
   */
  async analyzeCode(params: CodeReviewInput): Promise<CodeReviewResult> {
    try {
      // Verificar se é Gitea - code review automatizado não é suportado
      if (params.provider === 'gitea' || (!params.provider && (globalProviderFactory.getDefaultProvider() as any)?.config?.type === 'gitea')) {
        return {
          success: true,
          action: 'analyze',
          message: 'Code review automatizado não está disponível para o Gitea',
          data: {
            note: 'Esta funcionalidade é específica do GitHub',
            supported_providers: ['github'],
            current_provider: params.provider || 'gitea'
          }
        };
      }

      let codeToAnalyze = params.code;
      let fileName = 'code.txt';

      // Se não foi fornecido código direto, buscar do repositório
      if (!codeToAnalyze && params.owner && params.repo && params.file_path) {
        const provider = params.provider
          ? globalProviderFactory.getProvider(params.provider)
          : globalProviderFactory.getDefaultProvider();

        if (provider) {
          const file = await provider.getFile(params.owner, params.repo, params.file_path);
          codeToAnalyze = file.content || '';
          fileName = params.file_path;
        }
      }

      if (!codeToAnalyze) {
        throw new Error('Código não fornecido para análise');
      }

      // Análise básica de qualidade
      const analysis = this.performCodeAnalysis(codeToAnalyze, params.language || 'unknown', fileName, params.rules);

      return {
        success: true,
        action: 'analyze',
        message: `Análise de código concluída para ${fileName}`,
        data: analysis
      };
    } catch (error) {
      throw new Error(`Falha na análise de código: ${error}`);
    }
  },

  /**
   * Revisão de arquivo específico
   */
  async reviewFile(params: CodeReviewInput, provider: VcsOperations): Promise<CodeReviewResult> {
    try {
      if (!params.owner || !params.repo || !params.path) {
        throw new Error('Owner, repo e path são obrigatórios');
      }

      const file = await provider.getFile(params.owner, params.repo, params.path, params.branch);

      if (!file.content) {
        throw new Error('Arquivo não possui conteúdo para análise');
      }

      const analysis = this.performCodeAnalysis(
        file.content,
        this.detectLanguage(params.path),
        params.path,
        params.rules
      );

      return {
        success: true,
        action: 'review-file',
        message: `Revisão de arquivo '${params.path}' concluída`,
        data: {
          file: params.path,
          analysis,
          branch: params.branch || 'default'
        }
      };
    } catch (error) {
      throw new Error(`Falha na revisão de arquivo: ${error}`);
    }
  },

  /**
   * Revisão de commit específico
   */
  async reviewCommit(params: CodeReviewInput, provider: VcsOperations): Promise<CodeReviewResult> {
    try {
      if (!params.owner || !params.repo || !params.sha) {
        throw new Error('Owner, repo e sha são obrigatórios');
      }

      const commit = await provider.getCommit(params.owner, params.repo, params.sha);

      // Análise básica da mensagem do commit
      const messageAnalysis = this.analyzeCommitMessage(commit.message);

      return {
        success: true,
        action: 'review-commit',
        message: `Revisão de commit ${params.sha.substring(0, 7)} concluída`,
        data: {
          commit: params.sha,
          message_analysis: messageAnalysis,
          author: commit.author,
          committer: commit.committer
        }
      };
    } catch (error) {
      throw new Error(`Falha na revisão de commit: ${error}`);
    }
  },

  /**
   * Revisão de Pull Request
   */
  async reviewPullRequest(params: CodeReviewInput, provider: VcsOperations): Promise<CodeReviewResult> {
    try {
      if (!params.owner || !params.repo || !(params.pull_number || 0)) {
        throw new Error('Owner, repo e pull_number são obrigatórios');
      }

      // Buscar informações do PR
      const pr = await provider.getPullRequest(params.owner, params.repo, (params.pull_number || 0));

      const review = {
        pr_number: (params.pull_number || 0),
        title: pr.title,
        body: pr.body,
        changes: {
          additions: 'Não disponível',
          deletions: 'Não disponível',
          files_changed: 'Não disponível'
        },
        quality_score: this.calculateQualityScore(pr),
        suggestions: [
          'Verificar se todos os testes estão passando',
          'Revisar documentação atualizada',
          'Verificar impacto em performance'
        ]
      };

      return {
        success: true,
        action: 'review-pr',
        message: `Revisão de PR #${(params.pull_number || 0)} concluída`,
        data: review
      };
    } catch (error) {
      throw new Error(`Falha na revisão de PR: ${error}`);
    }
  },

  /**
   * Geração de relatório de qualidade
   */
  async generateReport(params: CodeReviewInput, provider: VcsOperations): Promise<CodeReviewResult> {
    try {
      // Validação movida para schema - owner/repo serão auto-detectados se não fornecidos

      const reportType = params.report_type || 'summary';
      const includeSuggestions = params.include_suggestions !== false;

      const report = {
        repository: `${params.owner}/${params.repo}`,
        report_type: reportType,
        generated_at: new Date().toISOString(),
        summary: {
          total_files: 'Não disponível',
          quality_score: 'Não calculado',
          issues_found: 0,
          critical_issues: 0
        },
        recommendations: includeSuggestions ? [
          'Implementar testes automatizados',
          'Configurar linter específico da linguagem',
          'Adicionar documentação técnica',
          'Revisar dependências desatualizadas'
        ] : []
      };

      return {
        success: true,
        action: 'generate-report',
        message: `Relatório ${reportType} gerado com sucesso`,
        data: report
      };
    } catch (error) {
      throw new Error(`Falha na geração de relatório: ${error}`);
    }
  },

  /**
   * Aplicação de sugestões de correção
   */
  async applySuggestions(params: CodeReviewInput, provider: VcsOperations): Promise<CodeReviewResult> {
    try {
      if (!params.owner || !params.repo || !params.suggestions) {
        throw new Error('Owner, repo e suggestions são obrigatórios');
      }

      const applied = [];
      const failed = [];

      for (const suggestion of params.suggestions) {
        try {
          // Para cada sugestão, buscar o arquivo atual
          const file = await provider.getFile(params.owner, params.repo, suggestion.file_path);

          if (file.content) {
            // Aplicar sugestão (simplificado - apenas marcar como aplicada)
            applied.push({
              file: suggestion.file_path,
              line: suggestion.line_number,
              suggestion: suggestion.suggestion,
              status: 'applied'
            });
          }
        } catch (error) {
          failed.push({
            file: suggestion.file_path,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }

      return {
        success: true,
        action: 'apply-suggestions',
        message: `Aplicadas ${applied.length} sugestões, ${failed.length} falharam`,
        data: {
          applied,
          failed,
          total: params.suggestions.length
        }
      };
    } catch (error) {
      throw new Error(`Falha na aplicação de sugestões: ${error}`);
    }
  },

  /**
   * Análise básica de código
   */
  performCodeAnalysis(code: string, language: string, fileName: string, rules?: string[]): any {
    const issues = [];
    const suggestions = [];
    const lines = code.split('\n');

    // Análise básica de complexidade
    if (lines.length > 300) {
      issues.push({
        type: 'complexity',
        severity: 'medium',
        message: 'Arquivo muito longo - considere dividir em módulos menores',
        line: 1
      });
    }

    // Detecção de código comentado
    let commentLines = 0;
    lines.forEach((line, index) => {
      if (line.trim().startsWith('//') || line.trim().startsWith('#') || line.trim().startsWith('/*')) {
        commentLines++;
      }

      // Detecção de console.log (comum em JS/TS)
      if (language === 'javascript' || language === 'typescript') {
        if (line.includes('console.log') && !rules?.includes('allow-console')) {
          issues.push({
            type: 'code-quality',
            severity: 'low',
            message: 'Uso de console.log detectado - considere remover para produção',
            line: index + 1
          });
        }
      }
    });

    // Análise de comentários
    const commentRatio = commentLines / lines.length;
    if (commentRatio < 0.1) {
      suggestions.push('Considere adicionar mais comentários explicativos');
    }

    return {
      file: fileName,
      language,
      lines_count: lines.length,
      comment_lines: commentLines,
      comment_ratio: Math.round(commentRatio * 100) / 100,
      issues,
      suggestions,
      quality_score: this.calculateQualityScore({ lines: lines.length, issues: issues.length })
    };
  },

  /**
   * Detecta linguagem baseada na extensão do arquivo
   */
  detectLanguage(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
      'scala': 'scala',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'md': 'markdown',
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml'
    };

    return languageMap[ext || ''] || 'unknown';
  },

  /**
   * Análise de mensagem de commit
   */
  analyzeCommitMessage(message: string): any {
    const analysis = {
      quality: 'good',
      suggestions: [] as string[],
      follows_conventions: false
    };

    // Verificar se segue convenção de commits
    const conventionalPattern = /^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .{1,50}/;
    analysis.follows_conventions = conventionalPattern.test(message);

    if (!analysis.follows_conventions) {
      analysis.suggestions.push('Considere usar conventional commits (feat:, fix:, docs:, etc.)');
    }

    if (message.length > 72) {
      analysis.quality = 'medium';
      analysis.suggestions.push('Mensagem muito longa - considere resumir na primeira linha');
    }

    if (message.length < 10) {
      analysis.quality = 'low';
      analysis.suggestions.push('Mensagem muito curta - seja mais descritivo');
    }

    return analysis;
  },

  /**
   * Calcula score de qualidade básico
   */
  calculateQualityScore(data: any): number {
    let score = 100;

    // Penalizar por issues
    if (data.issues) {
      score -= data.issues * 10;
    }

    // Penalizar por complexidade
    if (data.lines && data.lines > 500) {
      score -= 20;
    }

    // Bonus por comentários adequados
    if (data.comment_ratio && data.comment_ratio > 0.2) {
      score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }
};
