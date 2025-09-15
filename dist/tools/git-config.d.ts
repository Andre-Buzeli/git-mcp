import { z } from 'zod';
/**
 * Tool: git-config
 *
 * DESCRIÇÃO:
 * Gerenciamento de configuração Git (GitHub + Gitea) com múltiplas ações
 *
 * FUNCIONALIDADES:
 * - Obter configurações
 * - Definir configurações
 * - Remover configurações
 * - Listar configurações
 * - Editar configuração
 * - Mostrar configurações
 *
 * USO:
 * - Para configurar usuário e email
 * - Para configurar aliases
 * - Para configurar branches padrão
 * - Para configurar merge tools
 * - Para configurar credenciais
 *
 * RECOMENDAÇÕES:
 * - Use configurações globais para usuário
 * - Use configurações locais para projeto
 * - Documente configurações customizadas
 */
declare const GitConfigInputSchema: z.ZodObject<{
    action: z.ZodEnum<["get", "set", "unset", "list", "edit", "show"]>;
    owner: z.ZodString;
    repo: z.ZodString;
    provider: z.ZodEnum<["gitea", "github"]>;
    projectPath: z.ZodString;
    key: z.ZodOptional<z.ZodString>;
    value: z.ZodOptional<z.ZodString>;
    scope: z.ZodOptional<z.ZodEnum<["local", "global", "system"]>>;
    pattern: z.ZodOptional<z.ZodString>;
    show_origin: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    provider: "gitea" | "github";
    owner: string;
    repo: string;
    action: "set" | "get" | "list" | "show" | "unset" | "edit";
    projectPath: string;
    value?: string | undefined;
    pattern?: string | undefined;
    key?: string | undefined;
    scope?: "local" | "global" | "system" | undefined;
    show_origin?: boolean | undefined;
}, {
    provider: "gitea" | "github";
    owner: string;
    repo: string;
    action: "set" | "get" | "list" | "show" | "unset" | "edit";
    projectPath: string;
    value?: string | undefined;
    pattern?: string | undefined;
    key?: string | undefined;
    scope?: "local" | "global" | "system" | undefined;
    show_origin?: boolean | undefined;
}>;
export type GitConfigInput = z.infer<typeof GitConfigInputSchema>;
declare const GitConfigResultSchema: z.ZodObject<{
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
export type GitConfigResult = z.infer<typeof GitConfigResultSchema>;
export declare const gitConfigTool: {
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
            key: {
                type: string;
                description: string;
            };
            value: {
                type: string;
                description: string;
            };
            scope: {
                type: string;
                enum: string[];
                description: string;
            };
            pattern: {
                type: string;
                description: string;
            };
            show_origin: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: GitConfigInput): Promise<GitConfigResult>;
    get(params: GitConfigInput): Promise<GitConfigResult>;
    set(params: GitConfigInput): Promise<GitConfigResult>;
    unset(params: GitConfigInput): Promise<GitConfigResult>;
    list(params: GitConfigInput): Promise<GitConfigResult>;
    edit(params: GitConfigInput): Promise<GitConfigResult>;
    show(params: GitConfigInput): Promise<GitConfigResult>;
};
export {};
//# sourceMappingURL=git-config.d.ts.map