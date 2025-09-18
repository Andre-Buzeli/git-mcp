/**
 * Classe utilitária para padronizar tratamento de erros entre providers
 * Fornece métodos consistentes para normalização e formatação de erros
 * 
 * NOVA FUNCIONALIDADE:
 * - Análise inteligente de erros Git
 * - Sugestões automáticas de solução
 * - Integração com GitErrorAnalyzer
 */

import { GitErrorAnalyzer, IntelligentErrorResponse } from '../utils/git-error-analyzer.js';

export interface StandardError {
  code: string;
  message: string;
  provider: string;
  originalError?: any;
  statusCode?: number;
  retryable?: boolean;
  analysis?: any; // Análise inteligente do erro
  suggestedSolutions?: string[]; // Soluções sugeridas
}

export class ErrorHandler {
  /**
   * Normaliza erros de diferentes providers para formato padrão
   */
  static normalizeError(error: any, providerName: string): StandardError {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      return {
        code: this.getErrorCode(status),
        message: this.getErrorMessage(status, data, providerName),
        provider: providerName,
        statusCode: status,
        retryable: this.isRetryable(status),
        originalError: error
      };
    }
    
    if (error.request) {
      return {
        code: 'NETWORK_ERROR',
        message: `${providerName}: Network error - No response received`,
        provider: providerName,
        retryable: true,
        originalError: error
      };
    }
    
    return {
      code: 'UNKNOWN_ERROR',
      message: `${providerName}: ${error.message || 'Unknown error'}`,
      provider: providerName,
      retryable: false,
      originalError: error
    };
  }

  /**
   * Mapeia códigos HTTP para códigos de erro padronizados
   */
  private static getErrorCode(status: number): string {
    switch (status) {
      case 400:
        return 'BAD_REQUEST';
      case 401:
        return 'UNAUTHORIZED';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'NOT_FOUND';
      case 409:
        return 'CONFLICT';
      case 422:
        return 'VALIDATION_ERROR';
      case 429:
        return 'RATE_LIMITED';
      case 500:
        return 'INTERNAL_SERVER_ERROR';
      case 502:
        return 'BAD_GATEWAY';
      case 503:
        return 'SERVICE_UNAVAILABLE';
      case 504:
        return 'GATEWAY_TIMEOUT';
      default:
        return `HTTP_${status}`;
    }
  }

  /**
   * Gera mensagens de erro padronizadas e user-friendly
   */
  private static getErrorMessage(status: number, data: any, provider: string): string {
    const baseMessage = data?.message || data?.error || '';
    
    switch (status) {
      case 400:
        return `${provider}: Bad request - ${baseMessage || 'Invalid parameters'}`;
      case 401:
        return `${provider}: Unauthorized - Check your token and permissions`;
      case 403:
        return `${provider}: Forbidden - Insufficient permissions for this operation`;
      case 404:
        if (baseMessage.includes('user') || baseMessage.includes('User')) {
          return `${provider}: User not found - The specified user doesn't exist or has been deleted`;
        }
        return `${provider}: Not found - Resource doesn't exist or has been deleted`;
      case 409:
        if (baseMessage.includes('already exists') || baseMessage.includes('Conflict')) {
          return `${provider}: Resource already exists - ${baseMessage || 'The resource already exists'}`;
        }
        return `${provider}: Conflict - ${baseMessage || 'Resource already exists or conflicts with existing data'}`;
      case 422:
        return `${provider}: Validation error - ${baseMessage || 'Invalid data provided'}`;
      case 429:
        return `${provider}: Rate limited - Too many requests. ${this.getRateLimitInfo(data)}`;
      case 500:
        return `${provider}: Internal server error - ${baseMessage || 'Server encountered an error'}`;
      case 502:
        return `${provider}: Bad gateway - Server is temporarily unavailable`;
      case 503:
        return `${provider}: Service unavailable - Server is temporarily down for maintenance`;
      case 504:
        return `${provider}: Gateway timeout - Server took too long to respond`;
      default:
        return `${provider}: HTTP ${status} - ${baseMessage || 'Unknown error'}`;
    }
  }

  /**
   * Determina se um erro é passível de retry
   */
  private static isRetryable(status: number): boolean {
    return [
      429, // Rate limited
      500, // Internal server error
      502, // Bad gateway
      503, // Service unavailable
      504  // Gateway timeout
    ].includes(status);
  }

  /**
   * Extrai informações de rate limit dos headers
   */
  private static getRateLimitInfo(data: any): string {
    if (data?.headers) {
      const resetTime = data.headers['x-ratelimit-reset'] || data.headers['x-rate-limit-reset'];
      if (resetTime) {
        const resetDate = new Date(parseInt(resetTime) * 1000);
        return `Reset at: ${resetDate.toLocaleTimeString()}`;
      }
    }
    return 'Please try again later';
  }

  /**
   * Cria um Error padrão do JavaScript a partir de StandardError
   */
  static createError(standardError: StandardError): Error {
    const error = new Error(standardError.message);
    (error as any).code = standardError.code;
    (error as any).provider = standardError.provider;
    (error as any).statusCode = standardError.statusCode;
    (error as any).retryable = standardError.retryable;
    return error;
  }

  /**
   * Formata erro para logging estruturado
   */
  static formatForLogging(standardError: StandardError): object {
    return {
      timestamp: new Date().toISOString(),
      level: 'error',
      code: standardError.code,
      message: standardError.message,
      provider: standardError.provider,
      statusCode: standardError.statusCode,
      retryable: standardError.retryable,
      stack: standardError.originalError?.stack
    };
  }

  /**
   * Verifica se um erro é de um tipo específico
   */
  static isErrorType(error: any, type: string): boolean {
    return error?.code === type;
  }

  /**
   * Verifica se um erro é retryable
   */
  static isRetryableError(error: any): boolean {
    return error?.retryable === true;
  }

  /**
   * NOVO: Cria resposta inteligente de erro com análise Git
   */
  static createIntelligentGitError(
    action: string,
    error: string,
    provider: string = 'git',
    context: string = ''
  ): IntelligentErrorResponse {
    const analysis = GitErrorAnalyzer.analyzeGitError(error, context);
    
    return {
      success: false,
      action,
      message: `[${provider.toUpperCase()}] ${analysis.cause}`,
      error: error,
      analysis,
      nextSteps: this.generateIntelligentNextSteps(analysis, provider)
    };
  }

  /**
   * NOVO: Gera próximos passos inteligentes baseados na análise
   */
  private static generateIntelligentNextSteps(analysis: any, provider: string): string[] {
    const steps: string[] = [];
    
    steps.push(`🔍 ANÁLISE DO ERRO:`);
    steps.push(`   Tipo: ${analysis.errorType}`);
    steps.push(`   Causa: ${analysis.cause}`);
    steps.push(`   Solução: ${analysis.solution}`);
    
    if (analysis.autoFixable) {
      steps.push(`✅ RESOLUÇÃO AUTOMÁTICA DISPONÍVEL:`);
      steps.push(`   Este erro pode ser resolvido automaticamente usando outras tools.`);
      steps.push(`   Tools recomendadas:`);
      analysis.relatedTools.forEach((tool: string) => {
        steps.push(`   - ${tool}`);
      });
    } else {
      steps.push(`⚠️ AÇÃO MANUAL NECESSÁRIA:`);
      steps.push(`   Comandos Git sugeridos:`);
      analysis.suggestedCommands.forEach((cmd: string) => {
        steps.push(`   - ${cmd}`);
      });
    }
    
    steps.push(`💡 DICA: Use as tools relacionadas para resolver automaticamente!`);
    
    return steps;
  }

  /**
   * NOVO: Verifica se erro Git pode ser resolvido automaticamente
   */
  static isGitErrorAutoFixable(error: string): boolean {
    return GitErrorAnalyzer.isAutoFixable(error);
  }

  /**
   * NOVO: Retorna tools que podem resolver o erro Git
   */
  static getGitErrorRelatedTools(error: string): string[] {
    return GitErrorAnalyzer.getRelatedTools(error);
  }
}