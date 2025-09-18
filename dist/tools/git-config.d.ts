import { z } from 'zod';
/**
 * Tool: git-config
 *
 * DESCRIÃ‡ÃƒO:
 * Gerenciamento de configuraÃ§Ã£o Git (GitHub + Gitea) com mÃºltiplas aÃ§Ãµes
 *
 * FUNCIONALIDADES:
 * - Obter configuraÃ§Ãµes
 * - Definir configuraÃ§Ãµes
 * - Remover configuraÃ§Ãµes
 * - Listar configuraÃ§Ãµes
 * - Editar configuraÃ§Ã£o
 * - Mostrar configuraÃ§Ãµes
 *
 * USO:
 * - Para configurar usuÃ¡rio e email
 * - Para configurar aliases
 * - Para configurar branches padrÃ£o
 * - Para configurar merge tools
 * - Para configurar credenciais
 *
 * RECOMENDAÃ‡Ã•ES:
 * - Use configuraÃ§Ãµes globais para usuÃ¡rio
 * - Use configuraÃ§Ãµes locais para projeto
 * - Documente configuraÃ§Ãµes customizadas
 */
declare const GitConfigInputSchema: z.ZodObject<{
    action: z.ZodEnum<["get", "set", "unset", "list", "edit", "show"]>;
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
    /**
     * Verifica se erro Ã© relacionado a Git
     */
    isGitRelatedError(errorMessage: string): boolean;
};
export {};
//# sourceMappingURL=git-config.d.ts.map