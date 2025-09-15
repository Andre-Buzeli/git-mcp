import { z } from 'zod';
/**
 * Tool: version-control
 *
 * DESCRIÇÃO:
 * Sistema completo de versionamento, backup e rastreio de alterações para projetos.
 * Gerencia versões semânticas, cria backups automáticos e rastreia mudanças ao longo do tempo.
 *
 * OBJETIVOS:
 * - Versionamento semântico automático (MAJOR.MINOR.PATCH)
 * - Backup automático com snapshots incrementais
 * - Rastreio de alterações com histórico detalhado
 * - Rollback para versões anteriores
 * - Análise de mudanças entre versões
 *
 * LIMITAÇÕES:
 * - Backup baseado em API REST (não histórico Git completo)
 * - Snapshots incrementais dependem de storage disponível
 * - Rollback requer reaplicação manual de mudanças
 *
 * DICAS (solo):
 * - Use para manter histórico de versões estáveis
 * - Configure backup automático para mudanças críticas
 * - Documente mudanças significativas em cada versão
 * - Teste rollback em ambiente de desenvolvimento
 */
declare const VersionControlInputSchema: z.ZodObject<{
    action: z.ZodEnum<["version", "backup", "track", "rollback", "history", "analyze"]>;
    project: z.ZodOptional<z.ZodString>;
    version: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    auto_backup: z.ZodOptional<z.ZodBoolean>;
    backup_retention: z.ZodOptional<z.ZodNumber>;
    include_files: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    exclude_patterns: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    dry_run: z.ZodOptional<z.ZodBoolean>;
    provider: z.ZodOptional<z.ZodEnum<["gitea", "github", "both"]>>;
}, "strip", z.ZodTypeAny, {
    action: "version" | "backup" | "track" | "rollback" | "history" | "analyze";
    provider?: "gitea" | "github" | "both" | undefined;
    description?: string | undefined;
    dry_run?: boolean | undefined;
    version?: string | undefined;
    project?: string | undefined;
    auto_backup?: boolean | undefined;
    backup_retention?: number | undefined;
    include_files?: string[] | undefined;
    exclude_patterns?: string[] | undefined;
}, {
    action: "version" | "backup" | "track" | "rollback" | "history" | "analyze";
    provider?: "gitea" | "github" | "both" | undefined;
    description?: string | undefined;
    dry_run?: boolean | undefined;
    version?: string | undefined;
    project?: string | undefined;
    auto_backup?: boolean | undefined;
    backup_retention?: number | undefined;
    include_files?: string[] | undefined;
    exclude_patterns?: string[] | undefined;
}>;
export type VersionControlInput = z.infer<typeof VersionControlInputSchema>;
declare const VersionControlResultSchema: z.ZodObject<{
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
export type VersionControlResult = z.infer<typeof VersionControlResultSchema>;
export declare const versionControlTool: {
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
            project: {
                type: string;
                description: string;
            };
            version: {
                type: string;
                description: string;
            };
            description: {
                type: string;
                description: string;
            };
            auto_backup: {
                type: string;
                description: string;
            };
            backup_retention: {
                type: string;
                description: string;
            };
            include_files: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            exclude_patterns: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            dry_run: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: VersionControlInput): Promise<VersionControlResult>;
};
export {};
//# sourceMappingURL=version-control.d.ts.map