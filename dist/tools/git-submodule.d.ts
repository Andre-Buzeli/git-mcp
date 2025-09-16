import { z } from 'zod';
/**
 * Tool: git-submodule
 *
 * DESCRIÇÃO:
 * Gerenciamento de submódulos Git (GitHub + Gitea) com múltiplas ações
 *
 * FUNCIONALIDADES:
 * - Adicionar submódulo
 * - Atualizar submódulos
 * - Inicializar submódulos
 * - Deinicializar submódulos
 * - Status de submódulos
 * - Sincronizar submódulos
 *
 * USO:
 * - Para incluir repositórios externos
 * - Para gerenciar dependências
 * - Para manter versões específicas
 * - Para organizar projetos grandes
 *
 * RECOMENDAÇÕES:
 * - Use para dependências estáveis
 * - Mantenha versões específicas
 * - Documente submódulos no README
 */
declare const GitSubmoduleInputSchema: z.ZodObject<{
    action: z.ZodEnum<["add", "update", "init", "deinit", "status", "sync"]>;
    owner: z.ZodString;
    repo: z.ZodString;
    provider: z.ZodEnum<["gitea", "github"]>;
    projectPath: z.ZodString;
    submodule_url: z.ZodOptional<z.ZodString>;
    submodule_path: z.ZodOptional<z.ZodString>;
    submodule_branch: z.ZodOptional<z.ZodString>;
    submodule_name: z.ZodOptional<z.ZodString>;
    recursive: z.ZodOptional<z.ZodBoolean>;
    remote: z.ZodOptional<z.ZodBoolean>;
    recursive_sync: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    provider: "gitea" | "github";
    owner: string;
    repo: string;
    action: "status" | "init" | "add" | "update" | "deinit" | "sync";
    projectPath: string;
    recursive?: boolean | undefined;
    remote?: boolean | undefined;
    submodule_url?: string | undefined;
    submodule_path?: string | undefined;
    submodule_branch?: string | undefined;
    submodule_name?: string | undefined;
    recursive_sync?: boolean | undefined;
}, {
    provider: "gitea" | "github";
    owner: string;
    repo: string;
    action: "status" | "init" | "add" | "update" | "deinit" | "sync";
    projectPath: string;
    recursive?: boolean | undefined;
    remote?: boolean | undefined;
    submodule_url?: string | undefined;
    submodule_path?: string | undefined;
    submodule_branch?: string | undefined;
    submodule_name?: string | undefined;
    recursive_sync?: boolean | undefined;
}>;
export type GitSubmoduleInput = z.infer<typeof GitSubmoduleInputSchema>;
declare const GitSubmoduleResultSchema: z.ZodObject<{
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
export type GitSubmoduleResult = z.infer<typeof GitSubmoduleResultSchema>;
export declare const gitSubmoduleTool: {
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
            submodule_url: {
                type: string;
                description: string;
            };
            submodule_path: {
                type: string;
                description: string;
            };
            submodule_branch: {
                type: string;
                description: string;
            };
            submodule_name: {
                type: string;
                description: string;
            };
            recursive: {
                type: string;
                description: string;
            };
            remote: {
                type: string;
                description: string;
            };
            recursive_sync: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: GitSubmoduleInput): Promise<GitSubmoduleResult>;
    add(params: GitSubmoduleInput): Promise<GitSubmoduleResult>;
    update(params: GitSubmoduleInput): Promise<GitSubmoduleResult>;
    init(params: GitSubmoduleInput): Promise<GitSubmoduleResult>;
    deinit(params: GitSubmoduleInput): Promise<GitSubmoduleResult>;
    status(params: GitSubmoduleInput): Promise<GitSubmoduleResult>;
    sync(params: GitSubmoduleInput): Promise<GitSubmoduleResult>;
};
export {};
//# sourceMappingURL=git-submodule.d.ts.map