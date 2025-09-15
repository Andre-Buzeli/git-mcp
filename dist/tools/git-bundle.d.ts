import { z } from 'zod';
/**
 * Tool: git-bundle
 *
 * DESCRIÇÃO:
 * Gerenciamento de bundles Git (GitHub + Gitea) com múltiplas ações
 *
 * FUNCIONALIDADES:
 * - Criar bundle
 * - Verificar bundle
 * - Listar heads do bundle
 * - Unbundle
 * - Criar bundle incremental
 * - Criar bundle com tags
 *
 * USO:
 * - Para transferir repositórios offline
 * - Para backup completo de repositórios
 * - Para sincronização sem rede
 * - Para distribuição de código
 *
 * RECOMENDAÇÕES:
 * - Use para transferências offline
 * - Inclua tags quando necessário
 * - Verifique bundles antes de usar
 */
declare const GitBundleInputSchema: z.ZodObject<{
    action: z.ZodEnum<["create", "verify", "list-heads", "unbundle"]>;
    owner: z.ZodString;
    repo: z.ZodString;
    provider: z.ZodEnum<["gitea", "github"]>;
    projectPath: z.ZodString;
    bundle_file: z.ZodOptional<z.ZodString>;
    commit_range: z.ZodOptional<z.ZodString>;
    branch_name: z.ZodOptional<z.ZodString>;
    verify_bundle: z.ZodOptional<z.ZodString>;
    list_bundle: z.ZodOptional<z.ZodString>;
    unbundle_file: z.ZodOptional<z.ZodString>;
    unbundle_path: z.ZodOptional<z.ZodString>;
    all_branches: z.ZodOptional<z.ZodBoolean>;
    all_tags: z.ZodOptional<z.ZodBoolean>;
    all_remotes: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    provider: "gitea" | "github";
    owner: string;
    repo: string;
    action: "create" | "verify" | "list-heads" | "unbundle";
    projectPath: string;
    branch_name?: string | undefined;
    commit_range?: string | undefined;
    bundle_file?: string | undefined;
    verify_bundle?: string | undefined;
    list_bundle?: string | undefined;
    unbundle_file?: string | undefined;
    unbundle_path?: string | undefined;
    all_branches?: boolean | undefined;
    all_tags?: boolean | undefined;
    all_remotes?: boolean | undefined;
}, {
    provider: "gitea" | "github";
    owner: string;
    repo: string;
    action: "create" | "verify" | "list-heads" | "unbundle";
    projectPath: string;
    branch_name?: string | undefined;
    commit_range?: string | undefined;
    bundle_file?: string | undefined;
    verify_bundle?: string | undefined;
    list_bundle?: string | undefined;
    unbundle_file?: string | undefined;
    unbundle_path?: string | undefined;
    all_branches?: boolean | undefined;
    all_tags?: boolean | undefined;
    all_remotes?: boolean | undefined;
}>;
export type GitBundleInput = z.infer<typeof GitBundleInputSchema>;
declare const GitBundleResultSchema: z.ZodObject<{
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
export type GitBundleResult = z.infer<typeof GitBundleResultSchema>;
export declare const gitBundleTool: {
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
            bundle_file: {
                type: string;
                description: string;
            };
            commit_range: {
                type: string;
                description: string;
            };
            branch_name: {
                type: string;
                description: string;
            };
            verify_bundle: {
                type: string;
                description: string;
            };
            list_bundle: {
                type: string;
                description: string;
            };
            unbundle_file: {
                type: string;
                description: string;
            };
            unbundle_path: {
                type: string;
                description: string;
            };
            all_branches: {
                type: string;
                description: string;
            };
            all_tags: {
                type: string;
                description: string;
            };
            all_remotes: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: GitBundleInput): Promise<GitBundleResult>;
    create(params: GitBundleInput): Promise<GitBundleResult>;
    verify(params: GitBundleInput): Promise<GitBundleResult>;
    listHeads(params: GitBundleInput): Promise<GitBundleResult>;
    unbundle(params: GitBundleInput): Promise<GitBundleResult>;
};
export {};
//# sourceMappingURL=git-bundle.d.ts.map