import { z } from 'zod';
/**
 * Tool: git-remote
 *
 * DESCRIÇÃO:
 * Gerenciamento de remotes Git (GitHub + Gitea) com múltiplas ações
 *
 * FUNCIONALIDADES:
 * - Adicionar remote
 * - Remover remote
 * - Renomear remote
 * - Mostrar remotes
 * - Definir URL do remote
 * - Prune remotes
 *
 * USO:
 * - Para configurar repositórios remotos
 * - Para gerenciar múltiplos remotes
 * - Para sincronizar com diferentes servidores
 * - Para configurar upstream
 *
 * RECOMENDAÇÕES:
 * - Use 'origin' como remote principal
 * - Configure upstream para branches
 * - Mantenha URLs atualizadas
 */
declare const GitRemoteInputSchema: z.ZodObject<{
    action: z.ZodEnum<["add", "remove", "rename", "show", "set-url", "prune"]>;
    repo: z.ZodString;
    provider: z.ZodEnum<["gitea", "github"]>;
    projectPath: z.ZodString;
    remote_name: z.ZodOptional<z.ZodString>;
    remote_url: z.ZodOptional<z.ZodString>;
    remote: z.ZodOptional<z.ZodString>;
    new_name: z.ZodOptional<z.ZodString>;
    remote_to_prune: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    provider: "gitea" | "github";
    repo: string;
    action: "add" | "show" | "remove" | "prune" | "set-url" | "rename";
    projectPath: string;
    remote?: string | undefined;
    new_name?: string | undefined;
    remote_name?: string | undefined;
    remote_url?: string | undefined;
    remote_to_prune?: string | undefined;
}, {
    provider: "gitea" | "github";
    repo: string;
    action: "add" | "show" | "remove" | "prune" | "set-url" | "rename";
    projectPath: string;
    remote?: string | undefined;
    new_name?: string | undefined;
    remote_name?: string | undefined;
    remote_url?: string | undefined;
    remote_to_prune?: string | undefined;
}>;
export type GitRemoteInput = z.infer<typeof GitRemoteInputSchema>;
declare const GitRemoteResultSchema: z.ZodObject<{
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
export type GitRemoteResult = z.infer<typeof GitRemoteResultSchema>;
export declare const gitRemoteTool: {
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
            remote_name: {
                type: string;
                description: string;
            };
            remote_url: {
                type: string;
                description: string;
            };
            remote: {
                type: string;
                description: string;
            };
            new_name: {
                type: string;
                description: string;
            };
            remote_to_prune: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: GitRemoteInput): Promise<GitRemoteResult>;
    add(params: GitRemoteInput): Promise<GitRemoteResult>;
    remove(params: GitRemoteInput): Promise<GitRemoteResult>;
    rename(params: GitRemoteInput): Promise<GitRemoteResult>;
    show(params: GitRemoteInput): Promise<GitRemoteResult>;
    setUrl(params: GitRemoteInput): Promise<GitRemoteResult>;
    prune(params: GitRemoteInput): Promise<GitRemoteResult>;
};
export {};
//# sourceMappingURL=git-remote.d.ts.map