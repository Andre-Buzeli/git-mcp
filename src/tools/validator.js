"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolSchemas = exports.ToolValidator = exports.RepositorySchemas = exports.CommonSchemas = void 0;
var zod_1 = require("zod");
/**
 * Validador comum para todas as tools
 * Fornece schemas e métodos de validação padronizados
 */
// Schemas comuns reutilizáveis
exports.CommonSchemas = {
    // Identificadores
    owner: zod_1.z.string().min(1, 'Owner is required').max(100, 'Owner too long'),
    repo: zod_1.z.string().min(1, 'Repository name is required').max(100, 'Repository name too long'),
    provider: zod_1.z.enum(['gitea', 'github', 'both']).optional(),
    // Paginação
    page: zod_1.z.number().min(1, 'Page must be at least 1').max(1000, 'Page too high').optional(),
    limit: zod_1.z.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').optional(),
    // Strings opcionais com limites
    shortString: zod_1.z.string().max(255, 'String too long').optional(),
    mediumString: zod_1.z.string().max(1000, 'String too long').optional(),
    longString: zod_1.z.string().max(10000, 'String too long').optional(),
    // Identificadores específicos
    branch: zod_1.z.string().min(1, 'Branch name is required').max(255, 'Branch name too long').optional(),
    tag: zod_1.z.string().min(1, 'Tag name is required').max(255, 'Tag name too long').optional(),
    sha: zod_1.z.string().regex(/^[a-f0-9]{7,40}$/i, 'Invalid SHA format').optional(),
    // Paths e URLs
    filePath: zod_1.z.string().min(1, 'File path is required').max(1000, 'File path too long').optional(),
    url: zod_1.z.string().url('Invalid URL format').optional(),
    // Estados
    issueState: zod_1.z.enum(['open', 'closed', 'all']).optional(),
    prState: zod_1.z.enum(['open', 'closed', 'merged', 'all']).optional(),
    // Arrays
    stringArray: zod_1.z.array(zod_1.z.string().max(255)).max(50, 'Too many items').optional(),
    // Booleanos
    boolean: zod_1.z.boolean().optional(),
    // Números
    positiveNumber: zod_1.z.number().positive('Must be positive').optional(),
    issueNumber: zod_1.z.number().min(1, 'Issue number must be positive').max(999999, 'Issue number too high').optional(),
    // Enums específicos
    mergeMethod: zod_1.z.enum(['merge', 'rebase', 'squash']).optional(),
    syncDirection: zod_1.z.enum(['one-way', 'two-way']).optional(),
    syncStrategy: zod_1.z.enum(['source-wins', 'timestamp', 'skip-conflicts']).optional()
};
// Schemas para repositórios
exports.RepositorySchemas = {
    source: zod_1.z.object({
        provider: zod_1.z.enum(['gitea', 'github']),
        owner: exports.CommonSchemas.owner,
        repo: exports.CommonSchemas.repo
    }).optional(),
    target: zod_1.z.object({
        provider: zod_1.z.enum(['gitea', 'github']),
        owner: exports.CommonSchemas.owner,
        repo: exports.CommonSchemas.repo
    }).optional()
};
// TODO: Implementar getCurrentUser helper
// Validações customizadas
var ToolValidator = /** @class */ (function () {
    function ToolValidator() {
    }
    /**
     * Valida se pelo menos um dos campos obrigatórios está presente
     */
    ToolValidator.requireOneOf = function (data, fields, errorMessage) {
        var hasRequired = fields.some(function (field) { return data[field] !== undefined && data[field] !== null && data[field] !== ''; });
        if (!hasRequired) {
            throw new Error(errorMessage || "At least one of the following fields is required: ".concat(fields.join(', ')));
        }
    };
    /**
     * Valida se todos os campos de um grupo estão presentes ou ausentes
     */
    ToolValidator.requireAllOrNone = function (data, fields, errorMessage) {
        var presentFields = fields.filter(function (field) { return data[field] !== undefined && data[field] !== null && data[field] !== ''; });
        if (presentFields.length > 0 && presentFields.length < fields.length) {
            throw new Error(errorMessage || "All or none of these fields must be provided: ".concat(fields.join(', ')));
        }
    };
    /**
     * Valida formato de versão semântica
     */
    ToolValidator.validateSemVer = function (version) {
        var semVerRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
        return semVerRegex.test(version);
    };
    /**
     * Valida nome de branch Git
     */
    ToolValidator.validateBranchName = function (branch) {
        // Regras básicas do Git para nomes de branch
        var invalidPatterns = [
            /^\./, // Não pode começar com ponto
            /\.\./, // Não pode conter dois pontos consecutivos
            /[\x00-\x1f\x7f]/, // Não pode conter caracteres de controle
            /[\s~^:?*\[]/, // Não pode conter espaços ou caracteres especiais
            /\/$/, // Não pode terminar com /
            /\.lock$/, // Não pode terminar com .lock
            /@\{/ // Não pode conter @{
        ];
        return !invalidPatterns.some(function (pattern) { return pattern.test(branch); }) && branch.length > 0 && branch.length <= 255;
    };
    /**
     * Valida nome de arquivo/path
     */
    ToolValidator.validateFilePath = function (path) {
        // Não pode conter caracteres inválidos para sistemas de arquivo
        var invalidChars = /[<>:"|?*\x00-\x1f]/;
        return !invalidChars.test(path) && path.length > 0 && path.length <= 1000;
    };
    /**
     * Sanitiza entrada de texto removendo caracteres perigosos
     */
    ToolValidator.sanitizeText = function (text) {
        return text
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove caracteres de controle
            .replace(/[<>"'&]/g, '') // Remove caracteres HTML perigosos
            .trim();
    };
    /**
     * Valida e sanitiza parâmetros de entrada de uma tool
     */
    ToolValidator.validateAndSanitize = function (data, schema) {
        try {
            // Primeiro valida com Zod
            var validated = schema.parse(data);
            // Depois sanitiza strings se necessário
            var sanitized = this.sanitizeObject(validated);
            return sanitized;
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                var issues = error.issues.map(function (issue) { return "".concat(issue.path.join('.'), ": ").concat(issue.message); }).join(', ');
                throw new Error("Validation failed: ".concat(issues));
            }
            throw error;
        }
    };
    /**
     * Sanitiza recursivamente um objeto
     */
    ToolValidator.sanitizeObject = function (obj) {
        var _this = this;
        if (typeof obj === 'string') {
            return this.sanitizeText(obj);
        }
        if (Array.isArray(obj)) {
            return obj.map(function (item) { return _this.sanitizeObject(item); });
        }
        if (obj && typeof obj === 'object') {
            var sanitized = {};
            for (var _i = 0, _a = Object.entries(obj); _i < _a.length; _i++) {
                var _b = _a[_i], key = _b[0], value = _b[1];
                sanitized[key] = this.sanitizeObject(value);
            }
            return sanitized;
        }
        return obj;
    };
    /**
     * Cria um schema base para tools com parâmetros comuns
     */
    ToolValidator.createBaseToolSchema = function (additionalFields) {
        if (additionalFields === void 0) { additionalFields = {}; }
        return zod_1.z.object(__assign({ owner: exports.CommonSchemas.owner, repo: exports.CommonSchemas.repo, provider: exports.CommonSchemas.provider, page: exports.CommonSchemas.page, limit: exports.CommonSchemas.limit }, additionalFields));
    };
    return ToolValidator;
}());
exports.ToolValidator = ToolValidator;
// Schemas pré-definidos para tools comuns
exports.ToolSchemas = {
    // Schema básico para operações de repositório
    repositoryOperation: ToolValidator.createBaseToolSchema(),
    // Schema para operações com arquivos
    fileOperation: ToolValidator.createBaseToolSchema({
        path: exports.CommonSchemas.filePath,
        content: exports.CommonSchemas.longString,
        message: exports.CommonSchemas.mediumString,
        branch: exports.CommonSchemas.branch,
        sha: exports.CommonSchemas.sha
    }),
    // Schema para operações com issues
    issueOperation: ToolValidator.createBaseToolSchema({
        title: exports.CommonSchemas.mediumString,
        body: exports.CommonSchemas.longString,
        state: exports.CommonSchemas.issueState,
        labels: exports.CommonSchemas.stringArray,
        assignees: exports.CommonSchemas.stringArray,
        issue_number: exports.CommonSchemas.issueNumber
    }),
    // Schema para operações com branches
    branchOperation: ToolValidator.createBaseToolSchema({
        branch: exports.CommonSchemas.branch,
        from_branch: exports.CommonSchemas.branch,
        branch_name: exports.CommonSchemas.branch
    })
};
