"use strict";
/**
 * Classe utilitária para padronizar tratamento de erros entre providers
 * Fornece métodos consistentes para normalização e formatação de erros
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
var ErrorHandler = /** @class */ (function () {
    function ErrorHandler() {
    }
    /**
     * Normaliza erros de diferentes providers para formato padrão
     */
    ErrorHandler.normalizeError = function (error, providerName) {
        if (error.response) {
            var status_1 = error.response.status;
            var data = error.response.data;
            return {
                code: this.getErrorCode(status_1),
                message: this.getErrorMessage(status_1, data, providerName),
                provider: providerName,
                statusCode: status_1,
                retryable: this.isRetryable(status_1),
                originalError: error
            };
        }
        if (error.request) {
            return {
                code: 'NETWORK_ERROR',
                message: "".concat(providerName, ": Network error - No response received"),
                provider: providerName,
                retryable: true,
                originalError: error
            };
        }
        return {
            code: 'UNKNOWN_ERROR',
            message: "".concat(providerName, ": ").concat(error.message || 'Unknown error'),
            provider: providerName,
            retryable: false,
            originalError: error
        };
    };
    /**
     * Mapeia códigos HTTP para códigos de erro padronizados
     */
    ErrorHandler.getErrorCode = function (status) {
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
                return "HTTP_".concat(status);
        }
    };
    /**
     * Gera mensagens de erro padronizadas e user-friendly
     */
    ErrorHandler.getErrorMessage = function (status, data, provider) {
        var baseMessage = (data === null || data === void 0 ? void 0 : data.message) || (data === null || data === void 0 ? void 0 : data.error) || '';
        switch (status) {
            case 400:
                return "".concat(provider, ": Bad request - ").concat(baseMessage || 'Invalid parameters');
            case 401:
                return "".concat(provider, ": Unauthorized - Check your token and permissions");
            case 403:
                return "".concat(provider, ": Forbidden - Insufficient permissions for this operation");
            case 404:
                if (baseMessage.includes('user') || baseMessage.includes('User')) {
                    return "".concat(provider, ": User not found - The specified user doesn't exist or has been deleted");
                }
                return "".concat(provider, ": Not found - Resource doesn't exist or has been deleted");
            case 409:
                if (baseMessage.includes('already exists') || baseMessage.includes('Conflict')) {
                    return "".concat(provider, ": Resource already exists - ").concat(baseMessage || 'The resource already exists');
                }
                return "".concat(provider, ": Conflict - ").concat(baseMessage || 'Resource already exists or conflicts with existing data');
            case 422:
                return "".concat(provider, ": Validation error - ").concat(baseMessage || 'Invalid data provided');
            case 429:
                return "".concat(provider, ": Rate limited - Too many requests. ").concat(this.getRateLimitInfo(data));
            case 500:
                return "".concat(provider, ": Internal server error - ").concat(baseMessage || 'Server encountered an error');
            case 502:
                return "".concat(provider, ": Bad gateway - Server is temporarily unavailable");
            case 503:
                return "".concat(provider, ": Service unavailable - Server is temporarily down for maintenance");
            case 504:
                return "".concat(provider, ": Gateway timeout - Server took too long to respond");
            default:
                return "".concat(provider, ": HTTP ").concat(status, " - ").concat(baseMessage || 'Unknown error');
        }
    };
    /**
     * Determina se um erro é passível de retry
     */
    ErrorHandler.isRetryable = function (status) {
        return [
            429, // Rate limited
            500, // Internal server error
            502, // Bad gateway
            503, // Service unavailable
            504 // Gateway timeout
        ].includes(status);
    };
    /**
     * Extrai informações de rate limit dos headers
     */
    ErrorHandler.getRateLimitInfo = function (data) {
        if (data === null || data === void 0 ? void 0 : data.headers) {
            var resetTime = data.headers['x-ratelimit-reset'] || data.headers['x-rate-limit-reset'];
            if (resetTime) {
                var resetDate = new Date(parseInt(resetTime) * 1000);
                return "Reset at: ".concat(resetDate.toLocaleTimeString());
            }
        }
        return 'Please try again later';
    };
    /**
     * Cria um Error padrão do JavaScript a partir de StandardError
     */
    ErrorHandler.createError = function (standardError) {
        var error = new Error(standardError.message);
        error.code = standardError.code;
        error.provider = standardError.provider;
        error.statusCode = standardError.statusCode;
        error.retryable = standardError.retryable;
        return error;
    };
    /**
     * Formata erro para logging estruturado
     */
    ErrorHandler.formatForLogging = function (standardError) {
        var _a;
        return {
            timestamp: new Date().toISOString(),
            level: 'error',
            code: standardError.code,
            message: standardError.message,
            provider: standardError.provider,
            statusCode: standardError.statusCode,
            retryable: standardError.retryable,
            stack: (_a = standardError.originalError) === null || _a === void 0 ? void 0 : _a.stack
        };
    };
    /**
     * Verifica se um erro é de um tipo específico
     */
    ErrorHandler.isErrorType = function (error, type) {
        return (error === null || error === void 0 ? void 0 : error.code) === type;
    };
    /**
     * Verifica se um erro é retryable
     */
    ErrorHandler.isRetryableError = function (error) {
        return (error === null || error === void 0 ? void 0 : error.retryable) === true;
    };
    return ErrorHandler;
}());
exports.ErrorHandler = ErrorHandler;
