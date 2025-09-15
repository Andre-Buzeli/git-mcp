import { z } from 'zod';
/**
 * Tool: git-archive
 *
 * DESCRIÇÃO:
 * Gerenciamento de arquivos Git (GitHub + Gitea) com múltiplas ações
 *
 * FUNCIONALIDADES:
 * - Criar arquivo
 * - Extrair arquivo
 * - Listar conteúdo do arquivo
 * - Verificar arquivo
 * - Criar tarball
 * - Criar zip
 *
 * USO:
 * - Para criar releases
 * - Para backup de código
 * - Para distribuição de código
 * - Para deploy de versões específicas
 *
 * RECOMENDAÇÕES:
 * - Use para releases oficiais
 * - Inclua apenas arquivos necessários
 * - Teste arquivos antes da distribuição
 */
declare const GitArchiveInputSchema: z.ZodObject<{
    action: z.ZodEnum<["create", "extract", "list", "verify"]>;
    owner: z.ZodString;
    repo: z.ZodString;
    provider: z.ZodEnum<["gitea", "github"]>;
    projectPath: z.ZodString;
    archive_path: z.ZodOptional<z.ZodString>;
    commit_or_tree: z.ZodOptional<z.ZodString>;
    format: z.ZodOptional<z.ZodEnum<["tar", "zip", "tar.gz", "tar.bz2"]>>;
    archive_file: z.ZodOptional<z.ZodString>;
    extract_path: z.ZodOptional<z.ZodString>;
    list_archive: z.ZodOptional<z.ZodString>;
    verify_archive: z.ZodOptional<z.ZodString>;
    prefix: z.ZodOptional<z.ZodString>;
    output: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    provider: "gitea" | "github";
    owner: string;
    repo: string;
    action: "create" | "list" | "extract" | "verify";
    projectPath: string;
    archive_path?: string | undefined;
    commit_or_tree?: string | undefined;
    format?: "tar" | "zip" | "tar.gz" | "tar.bz2" | undefined;
    archive_file?: string | undefined;
    extract_path?: string | undefined;
    list_archive?: string | undefined;
    verify_archive?: string | undefined;
    prefix?: string | undefined;
    output?: string | undefined;
}, {
    provider: "gitea" | "github";
    owner: string;
    repo: string;
    action: "create" | "list" | "extract" | "verify";
    projectPath: string;
    archive_path?: string | undefined;
    commit_or_tree?: string | undefined;
    format?: "tar" | "zip" | "tar.gz" | "tar.bz2" | undefined;
    archive_file?: string | undefined;
    extract_path?: string | undefined;
    list_archive?: string | undefined;
    verify_archive?: string | undefined;
    prefix?: string | undefined;
    output?: string | undefined;
}>;
export type GitArchiveInput = z.infer<typeof GitArchiveInputSchema>;
declare const GitArchiveResultSchema: z.ZodObject<{
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
export type GitArchiveResult = z.infer<typeof GitArchiveResultSchema>;
export declare const gitArchiveTool: {
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
            archive_path: {
                type: string;
                description: string;
            };
            commit_or_tree: {
                type: string;
                description: string;
            };
            format: {
                type: string;
                enum: string[];
                description: string;
            };
            archive_file: {
                type: string;
                description: string;
            };
            extract_path: {
                type: string;
                description: string;
            };
            list_archive: {
                type: string;
                description: string;
            };
            verify_archive: {
                type: string;
                description: string;
            };
            prefix: {
                type: string;
                description: string;
            };
            output: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: GitArchiveInput): Promise<GitArchiveResult>;
    create(params: GitArchiveInput): Promise<GitArchiveResult>;
    extract(params: GitArchiveInput): Promise<GitArchiveResult>;
    list(params: GitArchiveInput): Promise<GitArchiveResult>;
    verify(params: GitArchiveInput): Promise<GitArchiveResult>;
};
export {};
//# sourceMappingURL=git-archive.d.ts.map