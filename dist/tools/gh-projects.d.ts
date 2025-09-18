import { z } from 'zod';
import { VcsOperations } from '../providers/index.js';
/**
 * Tool: gh-projects
 *
 * DESCRIÇÃO:
 * Gerenciamento de Projects GitHub (exclusivo GitHub) com múltiplas ações
 *
 * FUNCIONALIDADES:
 * - Listar projetos
 * - Criar projeto
 * - Obter projeto
 * - Atualizar projeto
 * - Deletar projeto
 * - Gerenciar itens do projeto
 * - Gerenciar campos do projeto
 *
 * USO:
 * - Para gerenciamento de projetos
 * - Para organização de tarefas
 * - Para planejamento de sprints
 * - Para tracking de progresso
 *
 * RECOMENDAÇÕES:
 * - Use para projetos de médio a longo prazo
 * - Configure campos personalizados adequadamente
 * - Mantenha itens organizados
 * - Use templates quando possível
 */
declare const GhProjectsInputSchema: z.ZodObject<{
    action: z.ZodEnum<["list", "create", "get", "update", "delete", "items", "fields"]>;
    repo: z.ZodString;
    projectPath: z.ZodString;
    project_id: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    body: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodEnum<["open", "closed"]>>;
    public: z.ZodOptional<z.ZodBoolean>;
    item_id: z.ZodOptional<z.ZodString>;
    content_id: z.ZodOptional<z.ZodString>;
    content_type: z.ZodOptional<z.ZodEnum<["Issue", "PullRequest", "DraftIssue"]>>;
    field_id: z.ZodOptional<z.ZodString>;
    field_value: z.ZodOptional<z.ZodString>;
    field_name: z.ZodOptional<z.ZodString>;
    field_type: z.ZodOptional<z.ZodEnum<["TEXT", "SINGLE_SELECT", "NUMBER", "DATE"]>>;
    field_options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    repo: string;
    action: "delete" | "get" | "list" | "create" | "update" | "items" | "fields";
    projectPath: string;
    title?: string | undefined;
    body?: string | undefined;
    state?: "open" | "closed" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    content_type?: "Issue" | "PullRequest" | "DraftIssue" | undefined;
    public?: boolean | undefined;
    project_id?: string | undefined;
    item_id?: string | undefined;
    content_id?: string | undefined;
    field_id?: string | undefined;
    field_value?: string | undefined;
    field_name?: string | undefined;
    field_type?: "TEXT" | "SINGLE_SELECT" | "NUMBER" | "DATE" | undefined;
    field_options?: string[] | undefined;
}, {
    repo: string;
    action: "delete" | "get" | "list" | "create" | "update" | "items" | "fields";
    projectPath: string;
    title?: string | undefined;
    body?: string | undefined;
    state?: "open" | "closed" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    content_type?: "Issue" | "PullRequest" | "DraftIssue" | undefined;
    public?: boolean | undefined;
    project_id?: string | undefined;
    item_id?: string | undefined;
    content_id?: string | undefined;
    field_id?: string | undefined;
    field_value?: string | undefined;
    field_name?: string | undefined;
    field_type?: "TEXT" | "SINGLE_SELECT" | "NUMBER" | "DATE" | undefined;
    field_options?: string[] | undefined;
}>;
export type GhProjectsInput = z.infer<typeof GhProjectsInputSchema>;
declare const GhProjectsResultSchema: z.ZodObject<{
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
export type GhProjectsResult = z.infer<typeof GhProjectsResultSchema>;
export declare const ghProjectsTool: {
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
            projectPath: {
                type: string;
                description: string;
            };
            project_id: {
                type: string;
                description: string;
            };
            title: {
                type: string;
                description: string;
            };
            body: {
                type: string;
                description: string;
            };
            state: {
                type: string;
                enum: string[];
                description: string;
            };
            public: {
                type: string;
                description: string;
            };
            item_id: {
                type: string;
                description: string;
            };
            content_id: {
                type: string;
                description: string;
            };
            content_type: {
                type: string;
                enum: string[];
                description: string;
            };
            field_id: {
                type: string;
                description: string;
            };
            field_value: {
                type: string;
                description: string;
            };
            field_name: {
                type: string;
                description: string;
            };
            field_type: {
                type: string;
                enum: string[];
                description: string;
            };
            field_options: {
                type: string;
                items: {
                    type: string;
                };
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
        };
        required: string[];
    };
    handler(input: GhProjectsInput): Promise<GhProjectsResult>;
    list(params: GhProjectsInput, provider: VcsOperations): Promise<GhProjectsResult>;
    create(params: GhProjectsInput, provider: VcsOperations): Promise<GhProjectsResult>;
    get(params: GhProjectsInput, provider: VcsOperations): Promise<GhProjectsResult>;
    update(params: GhProjectsInput, provider: VcsOperations): Promise<GhProjectsResult>;
    delete(params: GhProjectsInput, provider: VcsOperations): Promise<GhProjectsResult>;
    items(params: GhProjectsInput, provider: VcsOperations): Promise<GhProjectsResult>;
    fields(params: GhProjectsInput, provider: VcsOperations): Promise<GhProjectsResult>;
};
export {};
//# sourceMappingURL=gh-projects.d.ts.map