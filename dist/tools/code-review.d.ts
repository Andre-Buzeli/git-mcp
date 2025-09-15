import { z } from 'zod';
import { VcsOperations } from '../providers/index.js';
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
declare const CodeReviewInputSchema: z.ZodEffects<z.ZodObject<{
    action: z.ZodEnum<["analyze", "review-file", "review-commit", "review-pr", "generate-report", "apply-suggestions"]>;
    owner: z.ZodOptional<z.ZodString>;
    repo: z.ZodOptional<z.ZodString>;
    provider: z.ZodOptional<z.ZodEnum<["gitea", "github", "both"]>>;
    code: z.ZodOptional<z.ZodString>;
    language: z.ZodOptional<z.ZodString>;
    file_path: z.ZodOptional<z.ZodString>;
    path: z.ZodOptional<z.ZodString>;
    sha: z.ZodOptional<z.ZodString>;
    branch: z.ZodOptional<z.ZodString>;
    pull_number: z.ZodOptional<z.ZodNumber>;
    report_type: z.ZodOptional<z.ZodEnum<["summary", "detailed", "security", "performance"]>>;
    include_suggestions: z.ZodOptional<z.ZodBoolean>;
    suggestions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        file_path: z.ZodString;
        line_number: z.ZodNumber;
        suggestion: z.ZodString;
        severity: z.ZodEnum<["low", "medium", "high", "critical"]>;
    }, "strip", z.ZodTypeAny, {
        severity: "high" | "medium" | "low" | "critical";
        file_path: string;
        line_number: number;
        suggestion: string;
    }, {
        severity: "high" | "medium" | "low" | "critical";
        file_path: string;
        line_number: number;
        suggestion: string;
    }>, "many">>;
    rules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    exclude_patterns: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    action: "analyze" | "review-file" | "review-commit" | "review-pr" | "generate-report" | "apply-suggestions";
    provider?: "gitea" | "github" | "both" | undefined;
    code?: string | undefined;
    path?: string | undefined;
    owner?: string | undefined;
    repo?: string | undefined;
    sha?: string | undefined;
    branch?: string | undefined;
    pull_number?: number | undefined;
    exclude_patterns?: string[] | undefined;
    report_type?: "security" | "performance" | "summary" | "detailed" | undefined;
    language?: string | undefined;
    file_path?: string | undefined;
    include_suggestions?: boolean | undefined;
    suggestions?: {
        severity: "high" | "medium" | "low" | "critical";
        file_path: string;
        line_number: number;
        suggestion: string;
    }[] | undefined;
    rules?: string[] | undefined;
}, {
    action: "analyze" | "review-file" | "review-commit" | "review-pr" | "generate-report" | "apply-suggestions";
    provider?: "gitea" | "github" | "both" | undefined;
    code?: string | undefined;
    path?: string | undefined;
    owner?: string | undefined;
    repo?: string | undefined;
    sha?: string | undefined;
    branch?: string | undefined;
    pull_number?: number | undefined;
    exclude_patterns?: string[] | undefined;
    report_type?: "security" | "performance" | "summary" | "detailed" | undefined;
    language?: string | undefined;
    file_path?: string | undefined;
    include_suggestions?: boolean | undefined;
    suggestions?: {
        severity: "high" | "medium" | "low" | "critical";
        file_path: string;
        line_number: number;
        suggestion: string;
    }[] | undefined;
    rules?: string[] | undefined;
}>, {
    action: "analyze" | "review-file" | "review-commit" | "review-pr" | "generate-report" | "apply-suggestions";
    provider?: "gitea" | "github" | "both" | undefined;
    code?: string | undefined;
    path?: string | undefined;
    owner?: string | undefined;
    repo?: string | undefined;
    sha?: string | undefined;
    branch?: string | undefined;
    pull_number?: number | undefined;
    exclude_patterns?: string[] | undefined;
    report_type?: "security" | "performance" | "summary" | "detailed" | undefined;
    language?: string | undefined;
    file_path?: string | undefined;
    include_suggestions?: boolean | undefined;
    suggestions?: {
        severity: "high" | "medium" | "low" | "critical";
        file_path: string;
        line_number: number;
        suggestion: string;
    }[] | undefined;
    rules?: string[] | undefined;
}, {
    action: "analyze" | "review-file" | "review-commit" | "review-pr" | "generate-report" | "apply-suggestions";
    provider?: "gitea" | "github" | "both" | undefined;
    code?: string | undefined;
    path?: string | undefined;
    owner?: string | undefined;
    repo?: string | undefined;
    sha?: string | undefined;
    branch?: string | undefined;
    pull_number?: number | undefined;
    exclude_patterns?: string[] | undefined;
    report_type?: "security" | "performance" | "summary" | "detailed" | undefined;
    language?: string | undefined;
    file_path?: string | undefined;
    include_suggestions?: boolean | undefined;
    suggestions?: {
        severity: "high" | "medium" | "low" | "critical";
        file_path: string;
        line_number: number;
        suggestion: string;
    }[] | undefined;
    rules?: string[] | undefined;
}>;
export type CodeReviewInput = z.infer<typeof CodeReviewInputSchema>;
/**
 * Schema de validação para resultado da tool code-review
 */
declare const CodeReviewResultSchema: z.ZodObject<{
    success: z.ZodBoolean;
    action: z.ZodString;
    message: z.ZodString;
    data: z.ZodOptional<z.ZodAny>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message: string;
    action: string;
    success: boolean;
    error?: string | undefined;
    data?: any;
}, {
    message: string;
    action: string;
    success: boolean;
    error?: string | undefined;
    data?: any;
}>;
export type CodeReviewResult = z.infer<typeof CodeReviewResultSchema>;
/**
 * Implementação da tool code-review
 */
export declare const codeReviewTool: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            action: {
                type: string;
                enum: string[];
                description: string;
            };
            owner: {
                type: string;
                description: string;
            };
            repo: {
                type: string;
                description: string;
            };
            provider: {
                type: string;
                description: string;
            };
            code: {
                type: string;
                description: string;
            };
            language: {
                type: string;
                description: string;
            };
            file_path: {
                type: string;
                description: string;
            };
            path: {
                type: string;
                description: string;
            };
            sha: {
                type: string;
                description: string;
            };
            branch: {
                type: string;
                description: string;
            };
            pull_number: {
                type: string;
                description: string;
            };
            report_type: {
                type: string;
                enum: string[];
                description: string;
            };
            include_suggestions: {
                type: string;
                description: string;
            };
            suggestions: {
                type: string;
                items: {
                    type: string;
                    properties: {
                        file_path: {
                            type: string;
                        };
                        line_number: {
                            type: string;
                        };
                        suggestion: {
                            type: string;
                        };
                        severity: {
                            type: string;
                            enum: string[];
                        };
                    };
                };
                description: string;
            };
            rules: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            exclude_patterns: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
        };
        required: string[];
    };
    handler(input: CodeReviewInput): Promise<CodeReviewResult>;
    /**
     * Análise geral de código
     */
    analyzeCode(params: CodeReviewInput): Promise<CodeReviewResult>;
    /**
     * Revisão de arquivo específico
     */
    reviewFile(params: CodeReviewInput, provider: VcsOperations): Promise<CodeReviewResult>;
    /**
     * Revisão de commit específico
     */
    reviewCommit(params: CodeReviewInput, provider: VcsOperations): Promise<CodeReviewResult>;
    /**
     * Revisão de Pull Request
     */
    reviewPullRequest(params: CodeReviewInput, provider: VcsOperations): Promise<CodeReviewResult>;
    /**
     * Geração de relatório de qualidade
     */
    generateReport(params: CodeReviewInput, provider: VcsOperations): Promise<CodeReviewResult>;
    /**
     * Aplicação de sugestões de correção
     */
    applySuggestions(params: CodeReviewInput, provider: VcsOperations): Promise<CodeReviewResult>;
    /**
     * Análise básica de código
     */
    performCodeAnalysis(code: string, language: string, fileName: string, rules?: string[]): any;
    /**
     * Detecta linguagem baseada na extensão do arquivo
     */
    detectLanguage(filePath: string): string;
    /**
     * Análise de mensagem de commit
     */
    analyzeCommitMessage(message: string): any;
    /**
     * Calcula score de qualidade básico
     */
    calculateQualityScore(data: any): number;
};
export {};
//# sourceMappingURL=code-review.d.ts.map