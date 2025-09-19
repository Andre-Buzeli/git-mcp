import { z } from 'zod';
/**
 * Tool: git-revert
 *
 * DESCRIÇÃO:
 * Gerenciamento de revert Git (GitHub + Gitea) com múltiplas ações
 *
 * FUNCIONALIDADES:
 * - Reverter commit específico
 * - Reverter merge commit
 * - Reverter range de commits
 * - Reverter com mensagem customizada
 * - Reverter sem commit automático
 *
 * USO:
 * - Para desfazer commits de forma segura
 * - Para reverter mudanças em branches compartilhadas
 * - Para criar commits de reversão
 * - Para manter histórico limpo
 *
 * RECOMENDAÇÕES:
 * - Use revert em vez de reset para branches compartilhadas
 * - Teste reversões em branches locais primeiro
 * - Documente motivos da reversão
 */
declare const GitRevertInputSchema: z.ZodObject<{
    action: z.ZodEnum<["revert-commit", "revert-merge", "revert-range"]>;
    repo: z.ZodString;
    provider: z.ZodEnum<["gitea", "github"]>;
    projectPath: z.ZodString;
    commit_hash: z.ZodOptional<z.ZodString>;
    message: z.ZodOptional<z.ZodString>;
    no_commit: z.ZodOptional<z.ZodBoolean>;
    merge_commit_hash: z.ZodOptional<z.ZodString>;
    mainline: z.ZodOptional<z.ZodNumber>;
    commit_range: z.ZodOptional<z.ZodString>;
    strategy: z.ZodOptional<z.ZodEnum<["ours", "theirs"]>>;
}, "strip", z.ZodTypeAny, {
    provider: "gitea" | "github";
    repo: string;
    action: "revert-commit" | "revert-merge" | "revert-range";
    projectPath: string;
    message?: string | undefined;
    commit_hash?: string | undefined;
    no_commit?: boolean | undefined;
    merge_commit_hash?: string | undefined;
    mainline?: number | undefined;
    commit_range?: string | undefined;
    strategy?: "ours" | "theirs" | undefined;
}, {
    provider: "gitea" | "github";
    repo: string;
    action: "revert-commit" | "revert-merge" | "revert-range";
    projectPath: string;
    message?: string | undefined;
    commit_hash?: string | undefined;
    no_commit?: boolean | undefined;
    merge_commit_hash?: string | undefined;
    mainline?: number | undefined;
    commit_range?: string | undefined;
    strategy?: "ours" | "theirs" | undefined;
}>;
export type GitRevertInput = z.infer<typeof GitRevertInputSchema>;
declare const GitRevertResultSchema: z.ZodObject<{
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
export type GitRevertResult = z.infer<typeof GitRevertResultSchema>;
export declare const gitRevertTool: {
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
            message: {
                type: string;
                description: string;
            };
            no_commit: {
                type: string;
                description: string;
            };
            merge_commit_hash: {
                type: string;
                description: string;
            };
            mainline: {
                type: string;
                description: string;
            };
            commit_range: {
                type: string;
                description: string;
            };
            strategy: {
                type: string;
                enum: string[];
                description: string;
            };
        };
        required: string[];
    };
    handler(input: GitRevertInput): Promise<GitRevertResult>;
    revertCommit(params: GitRevertInput): Promise<GitRevertResult>;
    revertMerge(params: GitRevertInput): Promise<GitRevertResult>;
    revertRange(params: GitRevertInput): Promise<GitRevertResult>;
    /**
     * Verifica se erro é relacionado a Git
     */
    isGitRelatedError(errorMessage: string): boolean;
};
export {};
//# sourceMappingURL=git-revert.d.ts.map