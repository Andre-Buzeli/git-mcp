import { z } from 'zod';
/**
 * Tool: git-reset
 *
 * DESCRIÇÃO:
 * Gerenciamento de reset Git (GitHub + Gitea) com múltiplas ações
 *
 * FUNCIONALIDADES:
 * - Reset soft (mantém mudanças no staging)
 * - Reset mixed (padrão, remove do staging)
 * - Reset hard (remove todas as mudanças)
 * - Reset para commit específico
 * - Reset de branch
 *
 * USO:
 * - Para desfazer commits
 * - Para limpar staging area
 * - Para voltar a estado anterior
 * - Para remover mudanças não commitadas
 *
 * RECOMENDAÇÕES:
 * - Use com cuidado, especialmente reset hard
 * - Faça backup antes de resets destrutivos
 * - Teste em branches locais primeiro
 */
declare const GitResetInputSchema: z.ZodObject<{
    action: z.ZodEnum<["soft", "mixed", "hard", "reset-to-commit", "reset-branch"]>;
    repo: z.ZodString;
    provider: z.ZodEnum<["gitea", "github"]>;
    projectPath: z.ZodString;
    commit_hash: z.ZodOptional<z.ZodString>;
    branch_name: z.ZodOptional<z.ZodString>;
    reset_type: z.ZodOptional<z.ZodEnum<["soft", "mixed", "hard"]>>;
    target_branch: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    provider: "gitea" | "github";
    repo: string;
    action: "soft" | "mixed" | "hard" | "reset-to-commit" | "reset-branch";
    projectPath: string;
    branch_name?: string | undefined;
    commit_hash?: string | undefined;
    reset_type?: "soft" | "mixed" | "hard" | undefined;
    target_branch?: string | undefined;
}, {
    provider: "gitea" | "github";
    repo: string;
    action: "soft" | "mixed" | "hard" | "reset-to-commit" | "reset-branch";
    projectPath: string;
    branch_name?: string | undefined;
    commit_hash?: string | undefined;
    reset_type?: "soft" | "mixed" | "hard" | undefined;
    target_branch?: string | undefined;
}>;
export type GitResetInput = z.infer<typeof GitResetInputSchema>;
declare const GitResetResultSchema: z.ZodObject<{
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
export type GitResetResult = z.infer<typeof GitResetResultSchema>;
export declare const gitResetTool: {
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
                enum: string[];
                description: string;
            };
            projectPath: {
                type: string;
                description: string;
            };
            commit_hash: {
                type: string;
                description: string;
            };
            branch_name: {
                type: string;
                description: string;
            };
            reset_type: {
                type: string;
                enum: string[];
                description: string;
            };
            target_branch: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: GitResetInput): Promise<GitResetResult>;
    softReset(params: GitResetInput): Promise<GitResetResult>;
    mixedReset(params: GitResetInput): Promise<GitResetResult>;
    hardReset(params: GitResetInput): Promise<GitResetResult>;
    resetToCommit(params: GitResetInput): Promise<GitResetResult>;
    resetBranch(params: GitResetInput): Promise<GitResetResult>;
    /**
     * Verifica se erro é relacionado a Git
     */
    isGitRelatedError(errorMessage: string): boolean;
};
export {};
//# sourceMappingURL=git-reset.d.ts.map