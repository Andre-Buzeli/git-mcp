import { z } from 'zod';
/**
 * Tool: git-rebase
 *
 * DESCRIÇÃO:
 * Gerenciamento de rebase Git (GitHub + Gitea) com múltiplas ações
 *
 * FUNCIONALIDADES:
 * - Rebase interativo
 * - Rebase simples
 * - Abortar rebase
 * - Continuar rebase
 * - Pular commit
 * - Rebase de branch
 *
 * USO:
 * - Para reescrever histórico de commits
 * - Para limpar commits antes do merge
 * - Para reorganizar commits
 * - Para resolver conflitos
 *
 * RECOMENDAÇÕES:
 * - Use com cuidado em branches compartilhadas
 * - Faça backup antes de rebases complexos
 * - Teste em branches locais primeiro
 */
declare const GitRebaseInputSchema: z.ZodObject<{
    action: z.ZodEnum<["rebase", "interactive-rebase", "abort", "continue", "skip"]>;
    repo: z.ZodString;
    provider: z.ZodEnum<["gitea", "github"]>;
    projectPath: z.ZodString;
    target_branch: z.ZodOptional<z.ZodString>;
    base_branch: z.ZodOptional<z.ZodString>;
    interactive: z.ZodOptional<z.ZodBoolean>;
    commit_range: z.ZodOptional<z.ZodString>;
    rebase_commands: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    provider: "gitea" | "github";
    repo: string;
    action: "rebase" | "interactive-rebase" | "abort" | "continue" | "skip";
    projectPath: string;
    base_branch?: string | undefined;
    target_branch?: string | undefined;
    interactive?: boolean | undefined;
    commit_range?: string | undefined;
    rebase_commands?: string | undefined;
}, {
    provider: "gitea" | "github";
    repo: string;
    action: "rebase" | "interactive-rebase" | "abort" | "continue" | "skip";
    projectPath: string;
    base_branch?: string | undefined;
    target_branch?: string | undefined;
    interactive?: boolean | undefined;
    commit_range?: string | undefined;
    rebase_commands?: string | undefined;
}>;
export type GitRebaseInput = z.infer<typeof GitRebaseInputSchema>;
declare const GitRebaseResultSchema: z.ZodObject<{
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
export type GitRebaseResult = z.infer<typeof GitRebaseResultSchema>;
export declare const gitRebaseTool: {
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
            target_branch: {
                type: string;
                description: string;
            };
            base_branch: {
                type: string;
                description: string;
            };
            interactive: {
                type: string;
                description: string;
            };
            commit_range: {
                type: string;
                description: string;
            };
            rebase_commands: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: GitRebaseInput): Promise<GitRebaseResult>;
    rebase(params: GitRebaseInput): Promise<GitRebaseResult>;
    interactiveRebase(params: GitRebaseInput): Promise<GitRebaseResult>;
    abortRebase(params: GitRebaseInput): Promise<GitRebaseResult>;
    continueRebase(params: GitRebaseInput): Promise<GitRebaseResult>;
    skipCommit(params: GitRebaseInput): Promise<GitRebaseResult>;
};
export {};
//# sourceMappingURL=git-rebase.d.ts.map