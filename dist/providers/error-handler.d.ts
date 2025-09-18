/**
 * Classe utilitária para padronizar tratamento de erros entre providers
 * Fornece métodos consistentes para normalização e formatação de erros
 *
 * NOVA FUNCIONALIDADE:
 * - Análise inteligente de erros Git
 * - Sugestões automáticas de solução
 * - Integração com GitErrorAnalyzer
 */
import { IntelligentErrorResponse } from '../utils/git-error-analyzer.js';
export interface StandardError {
    code: string;
    message: string;
    provider: string;
    originalError?: any;
    statusCode?: number;
    retryable?: boolean;
    analysis?: any;
    suggestedSolutions?: string[];
}
export declare class ErrorHandler {
    /**
     * Normaliza erros de diferentes providers para formato padrão
     */
    static normalizeError(error: any, providerName: string): StandardError;
    /**
     * Mapeia códigos HTTP para códigos de erro padronizados
     */
    private static getErrorCode;
    /**
     * Gera mensagens de erro padronizadas e user-friendly
     */
    private static getErrorMessage;
    /**
     * Determina se um erro é passível de retry
     */
    private static isRetryable;
    /**
     * Extrai informações de rate limit dos headers
     */
    private static getRateLimitInfo;
    /**
     * Cria um Error padrão do JavaScript a partir de StandardError
     */
    static createError(standardError: StandardError): Error;
    /**
     * Formata erro para logging estruturado
     */
    static formatForLogging(standardError: StandardError): object;
    /**
     * Verifica se um erro é de um tipo específico
     */
    static isErrorType(error: any, type: string): boolean;
    /**
     * Verifica se um erro é retryable
     */
    static isRetryableError(error: any): boolean;
    /**
     * NOVO: Cria resposta inteligente de erro com análise Git
     */
    static createIntelligentGitError(action: string, error: string, provider?: string, context?: string): IntelligentErrorResponse;
    /**
     * NOVO: Gera próximos passos inteligentes baseados na análise
     */
    private static generateIntelligentNextSteps;
    /**
     * NOVO: Verifica se erro Git pode ser resolvido automaticamente
     */
    static isGitErrorAutoFixable(error: string): boolean;
    /**
     * NOVO: Retorna tools que podem resolver o erro Git
     */
    static getGitErrorRelatedTools(error: string): string[];
}
//# sourceMappingURL=error-handler.d.ts.map