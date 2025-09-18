import { z } from 'zod';
import { VcsOperations } from '../providers/index.js';
/**
 * Tool: gh-codespaces
 *
 * DESCRIÇÃO:
 * Gerenciamento de Codespaces GitHub (exclusivo GitHub) com múltiplas ações
 *
 * FUNCIONALIDADES:
 * - Listar codespaces
 * - Criar codespace
 * - Deletar codespace
 * - Iniciar codespace
 * - Parar codespace
 * - Rebuild codespace
 * - Obter logs do codespace
 *
 * USO:
 * - Para desenvolvimento em nuvem
 * - Para ambientes de desenvolvimento consistentes
 * - Para colaboração remota
 * - Para testes em diferentes ambientes
 *
 * RECOMENDAÇÕES:
 * - Use para projetos que precisam de ambientes específicos
 * - Configure devcontainers adequadamente
 * - Monitore uso de recursos
 * - Limpe codespaces não utilizados
 */
declare const GhCodespacesInputSchema: z.ZodObject<{
    action: z.ZodEnum<["list", "create", "delete", "start", "stop", "rebuild", "logs"]>;
    repo: z.ZodString;
    projectPath: z.ZodString;
    codespace_name: z.ZodOptional<z.ZodString>;
    branch: z.ZodOptional<z.ZodString>;
    machine_type: z.ZodOptional<z.ZodString>;
    display_name: z.ZodOptional<z.ZodString>;
    codespace_id: z.ZodOptional<z.ZodString>;
    log_type: z.ZodOptional<z.ZodEnum<["build", "start", "stop"]>>;
}, "strip", z.ZodTypeAny, {
    repo: string;
    action: "delete" | "list" | "create" | "logs" | "start" | "stop" | "rebuild";
    projectPath: string;
    branch?: string | undefined;
    codespace_name?: string | undefined;
    machine_type?: string | undefined;
    display_name?: string | undefined;
    codespace_id?: string | undefined;
    log_type?: "build" | "start" | "stop" | undefined;
}, {
    repo: string;
    action: "delete" | "list" | "create" | "logs" | "start" | "stop" | "rebuild";
    projectPath: string;
    branch?: string | undefined;
    codespace_name?: string | undefined;
    machine_type?: string | undefined;
    display_name?: string | undefined;
    codespace_id?: string | undefined;
    log_type?: "build" | "start" | "stop" | undefined;
}>;
export type GhCodespacesInput = z.infer<typeof GhCodespacesInputSchema>;
declare const GhCodespacesResultSchema: z.ZodObject<{
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
export type GhCodespacesResult = z.infer<typeof GhCodespacesResultSchema>;
export declare const ghCodespacesTool: {
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
            repo: {
                type: string;
                description: string;
            };
            projectPath: {
                type: string;
                description: string;
            };
            codespace_name: {
                type: string;
                description: string;
            };
            branch: {
                type: string;
                description: string;
            };
            machine_type: {
                type: string;
                description: string;
            };
            display_name: {
                type: string;
                description: string;
            };
            codespace_id: {
                type: string;
                description: string;
            };
            log_type: {
                type: string;
                enum: string[];
                description: string;
            };
        };
        required: string[];
    };
    handler(input: GhCodespacesInput): Promise<GhCodespacesResult>;
    list(params: GhCodespacesInput, provider: VcsOperations): Promise<GhCodespacesResult>;
    create(params: GhCodespacesInput, provider: VcsOperations): Promise<GhCodespacesResult>;
    delete(params: GhCodespacesInput, provider: VcsOperations): Promise<GhCodespacesResult>;
    start(params: GhCodespacesInput, provider: VcsOperations): Promise<GhCodespacesResult>;
    stop(params: GhCodespacesInput, provider: VcsOperations): Promise<GhCodespacesResult>;
    rebuild(params: GhCodespacesInput, provider: VcsOperations): Promise<GhCodespacesResult>;
    logs(params: GhCodespacesInput, provider: VcsOperations): Promise<GhCodespacesResult>;
};
export {};
//# sourceMappingURL=gh-codespaces.d.ts.map