import { z } from 'zod';
/**
 * Validador comum para todas as tools
 * Fornece schemas e métodos de validação padronizados
 */
export declare const CommonSchemas: {
    owner: z.ZodOptional<z.ZodString>;
    username: z.ZodOptional<z.ZodString>;
    repo: z.ZodString;
    provider: z.ZodOptional<z.ZodEnum<["gitea", "github", "both"]>>;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    shortString: z.ZodOptional<z.ZodString>;
    mediumString: z.ZodOptional<z.ZodString>;
    longString: z.ZodOptional<z.ZodString>;
    branch: z.ZodOptional<z.ZodString>;
    tag: z.ZodOptional<z.ZodString>;
    sha: z.ZodOptional<z.ZodString>;
    filePath: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
    issueState: z.ZodOptional<z.ZodEnum<["open", "closed", "all"]>>;
    prState: z.ZodOptional<z.ZodEnum<["open", "closed", "merged", "all"]>>;
    stringArray: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    boolean: z.ZodOptional<z.ZodBoolean>;
    positiveNumber: z.ZodOptional<z.ZodNumber>;
    issueNumber: z.ZodOptional<z.ZodNumber>;
    mergeMethod: z.ZodOptional<z.ZodEnum<["merge", "rebase", "squash"]>>;
    syncDirection: z.ZodOptional<z.ZodEnum<["one-way", "two-way"]>>;
    syncStrategy: z.ZodOptional<z.ZodEnum<["source-wins", "timestamp", "skip-conflicts"]>>;
};
export declare const RepositorySchemas: {
    source: z.ZodOptional<z.ZodObject<{
        provider: z.ZodEnum<["gitea", "github"]>;
        owner: z.ZodOptional<z.ZodString>;
        repo: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        provider: "gitea" | "github";
        repo: string;
        owner?: string | undefined;
    }, {
        provider: "gitea" | "github";
        repo: string;
        owner?: string | undefined;
    }>>;
    target: z.ZodOptional<z.ZodObject<{
        provider: z.ZodEnum<["gitea", "github"]>;
        owner: z.ZodOptional<z.ZodString>;
        repo: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        provider: "gitea" | "github";
        repo: string;
        owner?: string | undefined;
    }, {
        provider: "gitea" | "github";
        repo: string;
        owner?: string | undefined;
    }>>;
};
export declare class ToolValidator {
    /**
     * Valida se pelo menos um dos campos obrigatórios está presente
     */
    static requireOneOf<T>(data: T, fields: (keyof T)[], errorMessage?: string): void;
    /**
     * Valida se todos os campos de um grupo estão presentes ou ausentes
     */
    static requireAllOrNone<T>(data: T, fields: (keyof T)[], errorMessage?: string): void;
    /**
     * Valida formato de versão semântica
     */
    static validateSemVer(version: string): boolean;
    /**
     * Valida nome de branch Git
     */
    static validateBranchName(branch: string): boolean;
    /**
     * Valida nome de arquivo/path
     */
    static validateFilePath(path: string): boolean;
    /**
     * Sanitiza entrada de texto removendo caracteres perigosos
     */
    static sanitizeText(text: string): string;
    /**
     * Valida e sanitiza parâmetros de entrada de uma tool
     */
    static validateAndSanitize<T>(data: T, schema: z.ZodSchema<T>): T;
    /**
     * Sanitiza recursivamente um objeto
     */
    private static sanitizeObject;
    /**
     * Cria um schema base para tools com parâmetros comuns
     */
    static createBaseToolSchema(additionalFields?: Record<string, z.ZodTypeAny>): z.ZodObject<{
        owner: z.ZodOptional<z.ZodString>;
        repo: z.ZodString;
        provider: z.ZodOptional<z.ZodEnum<["gitea", "github", "both"]>>;
        page: z.ZodOptional<z.ZodNumber>;
        limit: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        repo: string;
        provider?: "gitea" | "github" | "both" | undefined;
        owner?: string | undefined;
        page?: number | undefined;
        limit?: number | undefined;
    }, {
        repo: string;
        provider?: "gitea" | "github" | "both" | undefined;
        owner?: string | undefined;
        page?: number | undefined;
        limit?: number | undefined;
    }>;
}
export declare const ToolSchemas: {
    repositoryOperation: z.ZodObject<{
        owner: z.ZodOptional<z.ZodString>;
        repo: z.ZodString;
        provider: z.ZodOptional<z.ZodEnum<["gitea", "github", "both"]>>;
        page: z.ZodOptional<z.ZodNumber>;
        limit: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        repo: string;
        provider?: "gitea" | "github" | "both" | undefined;
        owner?: string | undefined;
        page?: number | undefined;
        limit?: number | undefined;
    }, {
        repo: string;
        provider?: "gitea" | "github" | "both" | undefined;
        owner?: string | undefined;
        page?: number | undefined;
        limit?: number | undefined;
    }>;
    fileOperation: z.ZodObject<{
        owner: z.ZodOptional<z.ZodString>;
        repo: z.ZodString;
        provider: z.ZodOptional<z.ZodEnum<["gitea", "github", "both"]>>;
        page: z.ZodOptional<z.ZodNumber>;
        limit: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        repo: string;
        provider?: "gitea" | "github" | "both" | undefined;
        owner?: string | undefined;
        page?: number | undefined;
        limit?: number | undefined;
    }, {
        repo: string;
        provider?: "gitea" | "github" | "both" | undefined;
        owner?: string | undefined;
        page?: number | undefined;
        limit?: number | undefined;
    }>;
    issueOperation: z.ZodObject<{
        owner: z.ZodOptional<z.ZodString>;
        repo: z.ZodString;
        provider: z.ZodOptional<z.ZodEnum<["gitea", "github", "both"]>>;
        page: z.ZodOptional<z.ZodNumber>;
        limit: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        repo: string;
        provider?: "gitea" | "github" | "both" | undefined;
        owner?: string | undefined;
        page?: number | undefined;
        limit?: number | undefined;
    }, {
        repo: string;
        provider?: "gitea" | "github" | "both" | undefined;
        owner?: string | undefined;
        page?: number | undefined;
        limit?: number | undefined;
    }>;
    branchOperation: z.ZodObject<{
        owner: z.ZodOptional<z.ZodString>;
        repo: z.ZodString;
        provider: z.ZodOptional<z.ZodEnum<["gitea", "github", "both"]>>;
        page: z.ZodOptional<z.ZodNumber>;
        limit: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        repo: string;
        provider?: "gitea" | "github" | "both" | undefined;
        owner?: string | undefined;
        page?: number | undefined;
        limit?: number | undefined;
    }, {
        repo: string;
        provider?: "gitea" | "github" | "both" | undefined;
        owner?: string | undefined;
        page?: number | undefined;
        limit?: number | undefined;
    }>;
};
//# sourceMappingURL=validator.d.ts.map