import { z } from 'zod';
import { VcsOperations } from '../providers/index.js';
/**
 * Tool: gh-sync
 *
 * DESCRIÇÃO:
 * Sincronização GitHub (exclusivo GitHub) com múltiplas ações
 *
 * FUNCIONALIDADES:
 * - Sincronizar repositórios
 * - Sincronizar issues
 * - Sincronizar pull requests
 * - Sincronizar releases
 * - Sincronizar webhooks
 * - Sincronizar configurações
 *
 * USO:
 * - Para manter repositórios em sincronia
 * - Para backup de configurações
 * - Para migração de dados
 * - Para espelhamento de repositórios
 *
 * RECOMENDAÇÕES:
 * - Use para repositórios críticos
 * - Configure sincronização automática
 * - Monitore status de sincronização
 * - Teste em repositórios de teste primeiro
 */
declare const GhSyncInputSchema: z.ZodObject<{
    action: z.ZodEnum<["sync-repos", "sync-issues", "sync-pulls", "sync-releases", "sync-webhooks", "sync-config"]>;
    repo: z.ZodString;
    projectPath: z.ZodString;
    source_repo: z.ZodOptional<z.ZodString>;
    target_repo: z.ZodOptional<z.ZodString>;
    sync_branches: z.ZodOptional<z.ZodBoolean>;
    sync_tags: z.ZodOptional<z.ZodBoolean>;
    issue_number: z.ZodOptional<z.ZodNumber>;
    sync_comments: z.ZodOptional<z.ZodBoolean>;
    sync_labels: z.ZodOptional<z.ZodBoolean>;
    pull_number: z.ZodOptional<z.ZodNumber>;
    sync_reviews: z.ZodOptional<z.ZodBoolean>;
    sync_commits: z.ZodOptional<z.ZodBoolean>;
    release_tag: z.ZodOptional<z.ZodString>;
    sync_assets: z.ZodOptional<z.ZodBoolean>;
    webhook_id: z.ZodOptional<z.ZodString>;
    sync_events: z.ZodOptional<z.ZodBoolean>;
    config_type: z.ZodOptional<z.ZodEnum<["branches", "collaborators", "settings"]>>;
    dry_run: z.ZodOptional<z.ZodBoolean>;
    force: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    repo: string;
    action: "sync-repos" | "sync-issues" | "sync-pulls" | "sync-releases" | "sync-webhooks" | "sync-config";
    projectPath: string;
    force?: boolean | undefined;
    issue_number?: number | undefined;
    pull_number?: number | undefined;
    webhook_id?: string | undefined;
    source_repo?: string | undefined;
    target_repo?: string | undefined;
    sync_branches?: boolean | undefined;
    sync_tags?: boolean | undefined;
    sync_comments?: boolean | undefined;
    sync_labels?: boolean | undefined;
    sync_reviews?: boolean | undefined;
    sync_commits?: boolean | undefined;
    release_tag?: string | undefined;
    sync_assets?: boolean | undefined;
    sync_events?: boolean | undefined;
    config_type?: "branches" | "collaborators" | "settings" | undefined;
    dry_run?: boolean | undefined;
}, {
    repo: string;
    action: "sync-repos" | "sync-issues" | "sync-pulls" | "sync-releases" | "sync-webhooks" | "sync-config";
    projectPath: string;
    force?: boolean | undefined;
    issue_number?: number | undefined;
    pull_number?: number | undefined;
    webhook_id?: string | undefined;
    source_repo?: string | undefined;
    target_repo?: string | undefined;
    sync_branches?: boolean | undefined;
    sync_tags?: boolean | undefined;
    sync_comments?: boolean | undefined;
    sync_labels?: boolean | undefined;
    sync_reviews?: boolean | undefined;
    sync_commits?: boolean | undefined;
    release_tag?: string | undefined;
    sync_assets?: boolean | undefined;
    sync_events?: boolean | undefined;
    config_type?: "branches" | "collaborators" | "settings" | undefined;
    dry_run?: boolean | undefined;
}>;
export type GhSyncInput = z.infer<typeof GhSyncInputSchema>;
declare const GhSyncResultSchema: z.ZodObject<{
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
export type GhSyncResult = z.infer<typeof GhSyncResultSchema>;
export declare const ghSyncTool: {
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
            source_repo: {
                type: string;
                description: string;
            };
            target_repo: {
                type: string;
                description: string;
            };
            sync_branches: {
                type: string;
                description: string;
            };
            sync_tags: {
                type: string;
                description: string;
            };
            issue_number: {
                type: string;
                description: string;
            };
            sync_comments: {
                type: string;
                description: string;
            };
            sync_labels: {
                type: string;
                description: string;
            };
            pull_number: {
                type: string;
                description: string;
            };
            sync_reviews: {
                type: string;
                description: string;
            };
            sync_commits: {
                type: string;
                description: string;
            };
            release_tag: {
                type: string;
                description: string;
            };
            sync_assets: {
                type: string;
                description: string;
            };
            webhook_id: {
                type: string;
                description: string;
            };
            sync_events: {
                type: string;
                description: string;
            };
            config_type: {
                type: string;
                enum: string[];
                description: string;
            };
            dry_run: {
                type: string;
                description: string;
            };
            force: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: GhSyncInput): Promise<GhSyncResult>;
    syncRepos(params: GhSyncInput, provider: VcsOperations): Promise<GhSyncResult>;
    syncIssues(params: GhSyncInput, provider: VcsOperations): Promise<GhSyncResult>;
    syncPulls(params: GhSyncInput, provider: VcsOperations): Promise<GhSyncResult>;
    syncReleases(params: GhSyncInput, provider: VcsOperations): Promise<GhSyncResult>;
    syncWebhooks(params: GhSyncInput, provider: VcsOperations): Promise<GhSyncResult>;
    syncConfig(params: GhSyncInput, provider: VcsOperations): Promise<GhSyncResult>;
};
export {};
//# sourceMappingURL=gh-sync.d.ts.map