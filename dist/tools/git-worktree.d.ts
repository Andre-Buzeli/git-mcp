import { z } from 'zod';
/**
 * Tool: git-worktree
 *
 * DESCRIÇÃO:
 * Gerenciamento de worktrees Git (GitHub + Gitea) com múltiplas ações
 *
 * FUNCIONALIDADES:
 * - Adicionar worktree
 * - Remover worktree
 * - Listar worktrees
 * - Prune worktrees
 * - Mover worktree
 * - Reparar worktree
 *
 * USO:
 * - Para trabalhar em múltiplas branches simultaneamente
 * - Para testes em branches diferentes
 * - Para desenvolvimento paralelo
 * - Para builds em branches específicas
 *
 * RECOMENDAÇÕES:
 * - Use para branches de longa duração
 * - Mantenha worktrees organizados
 * - Limpe worktrees antigos
 */
declare const GitWorktreeInputSchema: z.ZodObject<{
    action: z.ZodEnum<["add", "remove", "list", "prune", "move", "repair"]>;
    owner: z.ZodString;
    repo: z.ZodString;
    provider: z.ZodEnum<["gitea", "github"]>;
    projectPath: z.ZodString;
    worktree_path: z.ZodOptional<z.ZodString>;
    branch_name: z.ZodOptional<z.ZodString>;
    commit_hash: z.ZodOptional<z.ZodString>;
    worktree_to_remove: z.ZodOptional<z.ZodString>;
    force: z.ZodOptional<z.ZodBoolean>;
    old_path: z.ZodOptional<z.ZodString>;
    new_path: z.ZodOptional<z.ZodString>;
    worktree_to_repair: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    provider: "gitea" | "github";
    owner: string;
    repo: string;
    action: "add" | "list" | "remove" | "prune" | "move" | "repair";
    projectPath: string;
    force?: boolean | undefined;
    branch_name?: string | undefined;
    commit_hash?: string | undefined;
    worktree_path?: string | undefined;
    worktree_to_remove?: string | undefined;
    old_path?: string | undefined;
    new_path?: string | undefined;
    worktree_to_repair?: string | undefined;
}, {
    provider: "gitea" | "github";
    owner: string;
    repo: string;
    action: "add" | "list" | "remove" | "prune" | "move" | "repair";
    projectPath: string;
    force?: boolean | undefined;
    branch_name?: string | undefined;
    commit_hash?: string | undefined;
    worktree_path?: string | undefined;
    worktree_to_remove?: string | undefined;
    old_path?: string | undefined;
    new_path?: string | undefined;
    worktree_to_repair?: string | undefined;
}>;
export type GitWorktreeInput = z.infer<typeof GitWorktreeInputSchema>;
declare const GitWorktreeResultSchema: z.ZodObject<{
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
export type GitWorktreeResult = z.infer<typeof GitWorktreeResultSchema>;
export declare const gitWorktreeTool: {
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
            worktree_path: {
                type: string;
                description: string;
            };
            branch_name: {
                type: string;
                description: string;
            };
            commit_hash: {
                type: string;
                description: string;
            };
            worktree_to_remove: {
                type: string;
                description: string;
            };
            force: {
                type: string;
                description: string;
            };
            old_path: {
                type: string;
                description: string;
            };
            new_path: {
                type: string;
                description: string;
            };
            worktree_to_repair: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: GitWorktreeInput): Promise<GitWorktreeResult>;
    add(params: GitWorktreeInput): Promise<GitWorktreeResult>;
    remove(params: GitWorktreeInput): Promise<GitWorktreeResult>;
    list(params: GitWorktreeInput): Promise<GitWorktreeResult>;
    prune(params: GitWorktreeInput): Promise<GitWorktreeResult>;
    move(params: GitWorktreeInput): Promise<GitWorktreeResult>;
    repair(params: GitWorktreeInput): Promise<GitWorktreeResult>;
};
export {};
//# sourceMappingURL=git-worktree.d.ts.map