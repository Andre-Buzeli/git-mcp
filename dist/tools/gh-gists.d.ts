import { z } from 'zod';
import { VcsOperations } from '../providers/index.js';
/**
 * Tool: gh-gists
 *
 * DESCRIÇÃO:
 * Gerenciamento de Gists GitHub (exclusivo GitHub) com múltiplas ações
 *
 * FUNCIONALIDADES:
 * - Criar gist
 * - Listar gists
 * - Obter gist
 * - Atualizar gist
 * - Deletar gist
 * - Fazer fork do gist
 * - Favoritar gist
 * - Comentar gist
 *
 * USO:
 * - Para compartilhar código rapidamente
 * - Para snippets de código
 * - Para documentação rápida
 * - Para testes de código
 *
 * RECOMENDAÇÕES:
 * - Use para código pequeno e focado
 * - Adicione descrições claras
 * - Use tags apropriadas
 * - Mantenha gists organizados
 */
declare const GhGistsInputSchema: z.ZodObject<{
    action: z.ZodEnum<["create", "list", "get", "update", "delete", "fork", "star", "comment"]>;
    owner: z.ZodString;
    repo: z.ZodString;
    provider: z.ZodEnum<["github"]>;
    projectPath: z.ZodString;
    gist_id: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    files: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        content: z.ZodString;
        filename: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        content: string;
        filename?: string | undefined;
    }, {
        content: string;
        filename?: string | undefined;
    }>>>;
    public: z.ZodOptional<z.ZodBoolean>;
    username: z.ZodOptional<z.ZodString>;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    star: z.ZodOptional<z.ZodBoolean>;
    comment_body: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    provider: "github";
    owner: string;
    repo: string;
    action: "delete" | "get" | "list" | "create" | "update" | "fork" | "comment" | "star";
    projectPath: string;
    description?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    username?: string | undefined;
    comment_body?: string | undefined;
    star?: boolean | undefined;
    gist_id?: string | undefined;
    files?: Record<string, {
        content: string;
        filename?: string | undefined;
    }> | undefined;
    public?: boolean | undefined;
}, {
    provider: "github";
    owner: string;
    repo: string;
    action: "delete" | "get" | "list" | "create" | "update" | "fork" | "comment" | "star";
    projectPath: string;
    description?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    username?: string | undefined;
    comment_body?: string | undefined;
    star?: boolean | undefined;
    gist_id?: string | undefined;
    files?: Record<string, {
        content: string;
        filename?: string | undefined;
    }> | undefined;
    public?: boolean | undefined;
}>;
export type GhGistsInput = z.infer<typeof GhGistsInputSchema>;
declare const GhGistsResultSchema: z.ZodObject<{
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
export type GhGistsResult = z.infer<typeof GhGistsResultSchema>;
export declare const ghGistsTool: {
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
            gist_id: {
                type: string;
                description: string;
            };
            description: {
                type: string;
                description: string;
            };
            files: {
                type: string;
                description: string;
            };
            public: {
                type: string;
                description: string;
            };
            username: {
                type: string;
                description: string;
            };
            page: {
                type: string;
                description: string;
                minimum: number;
            };
            limit: {
                type: string;
                description: string;
                minimum: number;
                maximum: number;
            };
            star: {
                type: string;
                description: string;
            };
            comment_body: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: GhGistsInput): Promise<GhGistsResult>;
    create(params: GhGistsInput, provider: VcsOperations): Promise<GhGistsResult>;
    list(params: GhGistsInput, provider: VcsOperations): Promise<GhGistsResult>;
    get(params: GhGistsInput, provider: VcsOperations): Promise<GhGistsResult>;
    update(params: GhGistsInput, provider: VcsOperations): Promise<GhGistsResult>;
    delete(params: GhGistsInput, provider: VcsOperations): Promise<GhGistsResult>;
    fork(params: GhGistsInput, provider: VcsOperations): Promise<GhGistsResult>;
    star(params: GhGistsInput, provider: VcsOperations): Promise<GhGistsResult>;
    comment(params: GhGistsInput, provider: VcsOperations): Promise<GhGistsResult>;
};
export {};
//# sourceMappingURL=gh-gists.d.ts.map