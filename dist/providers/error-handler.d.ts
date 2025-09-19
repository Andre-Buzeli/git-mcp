/**
 * Classe utilitária para padronizar tratamento de erros entre providers
 * Fornece métodos consistentes para normalização e formatação de erros
 */
export interface StandardError {
    code: string;
    message: string;
    provider: string;
    originalError?: any;
    statusCode?: number;
    retryable?: boolean;
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
}
//# sourceMappingURL=error-handler.d.ts.map