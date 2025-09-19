import { z } from 'zod';
/**
 * Tool: git-stash
 *
 * DESCRIÇÃO:
 * Gerenciamento de stash Git (GitHub + Gitea) com múltiplas ações
 *
 * FUNCIONALIDADES:
 * - Stash mudanças
 * - Listar stashes
 * - Aplicar stash
 * - Pop stash
 * - Mostrar stash
 * - Deletar stash
 * - Limpar todos os stashes
 *
 * USO:
 * - Para salvar mudanças temporariamente
 * - Para trocar de branch rapidamente
 * - Para limpar working directory
 * - Para aplicar mudanças posteriormente
 *
 * RECOMENDAÇÕES:
 * - Use mensagens descritivas para stashes
 * - Aplique stashes em ordem
 * - Limpe stashes antigos regularmente
 */
declare const GitStashInputSchema: z.ZodObject<{
    action: z.ZodEnum<["stash", "pop", "apply", "list", "show", "drop", "clear"]>;
    repo: z.ZodString;
    provider: z.ZodEnum<["gitea", "github"]>;
    projectPath: z.ZodString;
    message: z.ZodOptional<z.ZodString>;
    include_untracked: z.ZodOptional<z.ZodBoolean>;
    keep_index: z.ZodOptional<z.ZodBoolean>;
    stash_index: z.ZodOptional<z.ZodString>;
    show_patch: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    provider: "gitea" | "github";
    repo: string;
    action: "pop" | "apply" | "list" | "show" | "drop" | "clear" | "stash";
    projectPath: string;
    message?: string | undefined;
    include_untracked?: boolean | undefined;
    keep_index?: boolean | undefined;
    stash_index?: string | undefined;
    show_patch?: boolean | undefined;
}, {
    provider: "gitea" | "github";
    repo: string;
    action: "pop" | "apply" | "list" | "show" | "drop" | "clear" | "stash";
    projectPath: string;
    message?: string | undefined;
    include_untracked?: boolean | undefined;
    keep_index?: boolean | undefined;
    stash_index?: string | undefined;
    show_patch?: boolean | undefined;
}>;
export type GitStashInput = z.infer<typeof GitStashInputSchema>;
declare const GitStashResultSchema: z.ZodObject<{
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
export type GitStashResult = z.infer<typeof GitStashResultSchema>;
export declare const gitStashTool: {
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
            message: {
                type: string;
                description: string;
            };
            include_untracked: {
                type: string;
                description: string;
            };
            keep_index: {
                type: string;
                description: string;
            };
            stash_index: {
                type: string;
                description: string;
            };
            show_patch: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: GitStashInput): Promise<GitStashResult>;
    stash(params: GitStashInput): Promise<GitStashResult>;
    pop(params: GitStashInput): Promise<GitStashResult>;
    apply(params: GitStashInput): Promise<GitStashResult>;
    list(params: GitStashInput): Promise<GitStashResult>;
    show(params: GitStashInput): Promise<GitStashResult>;
    drop(params: GitStashInput): Promise<GitStashResult>;
    clear(params: GitStashInput): Promise<GitStashResult>;
    /**
     * Verifica se erro é relacionado a Git
     */
    isGitRelatedError(errorMessage: string): boolean;
};
export {};
//# sourceMappingURL=git-stash.d.ts.map