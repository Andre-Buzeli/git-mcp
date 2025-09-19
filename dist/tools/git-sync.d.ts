import { z } from 'zod';
/**
 * Tool: git-sync
 *
 * DESCRIÇÃO:
 * Sincronização entre dois repositórios hospedados em provedores distintos (ex.: Gitea <-> GitHub).
 *
 * OBJETIVOS:
 * - Configurar espelhamento (quando suportado pelo backend) e registrar estado
 * - Executar sincronização pontual (one-shot) de código e/ou metadados
 * - Consultar status/diagnóstico da sincronização
 *
 * LIMITAÇÕES:
 * - Histórico Git completo por API REST é limitado; prioriza espelhamento nativo (push mirrors) quando disponível
 * - Metadados (issues, labels, releases, PRs) têm mapeamento best-effort com diferenças entre plataformas
 *
 * DICAS (solo):
 * - Use para manter um backup/em espelho entre provedores
 * - Prefira one-shot antes de configurar contínuo; verifique status e conflitos
 * - Defina estratégia de conflito e escopos explicitamente
 */
declare const GitSyncInputSchema: z.ZodObject<{
    action: z.ZodEnum<["configure", "status", "one-shot"]>;
    source: z.ZodObject<{
        provider: z.ZodEnum<["gitea", "github"]>;
        repo: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        provider: "gitea" | "github";
        repo: string;
    }, {
        provider: "gitea" | "github";
        repo: string;
    }>;
    target: z.ZodObject<{
        provider: z.ZodEnum<["gitea", "github"]>;
        repo: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        provider: "gitea" | "github";
        repo: string;
    }, {
        provider: "gitea" | "github";
        repo: string;
    }>;
    direction: z.ZodOptional<z.ZodEnum<["one-way", "two-way"]>>;
    include: z.ZodOptional<z.ZodArray<z.ZodEnum<["git", "issues", "labels", "milestones", "releases", "pulls"]>, "many">>;
    strategy: z.ZodOptional<z.ZodEnum<["source-wins", "timestamp", "skip-conflicts"]>>;
    dry_run: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    action: "status" | "configure" | "one-shot";
    target: {
        provider: "gitea" | "github";
        repo: string;
    };
    source: {
        provider: "gitea" | "github";
        repo: string;
    };
    strategy?: "timestamp" | "source-wins" | "skip-conflicts" | undefined;
    direction?: "one-way" | "two-way" | undefined;
    include?: ("issues" | "labels" | "git" | "milestones" | "releases" | "pulls")[] | undefined;
    dry_run?: boolean | undefined;
}, {
    action: "status" | "configure" | "one-shot";
    target: {
        provider: "gitea" | "github";
        repo: string;
    };
    source: {
        provider: "gitea" | "github";
        repo: string;
    };
    strategy?: "timestamp" | "source-wins" | "skip-conflicts" | undefined;
    direction?: "one-way" | "two-way" | undefined;
    include?: ("issues" | "labels" | "git" | "milestones" | "releases" | "pulls")[] | undefined;
    dry_run?: boolean | undefined;
}>;
export type GitSyncInput = z.infer<typeof GitSyncInputSchema>;
declare const GitSyncResultSchema: z.ZodObject<{
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
export type GitSyncResult = z.infer<typeof GitSyncResultSchema>;
export declare const gitSyncTool: {
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
            source: {
                type: string;
                description: string;
                properties: {
                    provider: {
                        type: string;
                    };
                    owner: {
                        type: string;
                    };
                    repo: {
                        type: string;
                    };
                };
            };
            target: {
                type: string;
                description: string;
                properties: {
                    provider: {
                        type: string;
                    };
                    owner: {
                        type: string;
                    };
                    repo: {
                        type: string;
                    };
                };
            };
            direction: {
                type: string;
                enum: string[];
                description: string;
            };
            include: {
                type: string;
                items: {
                    type: string;
                    enum: string[];
                };
                description: string;
            };
            strategy: {
                type: string;
                enum: string[];
                description: string;
            };
            dry_run: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: GitSyncInput): Promise<GitSyncResult>;
    /**
     * Configura sincronização entre dois repositórios
     */
    configureSync(params: GitSyncInput): Promise<GitSyncResult>;
    /**
     * Obtém status da sincronização
     */
    getSyncStatus(params: GitSyncInput): Promise<GitSyncResult>;
    /**
     * Executa sincronização pontual
     */
    executeSync(params: GitSyncInput): Promise<GitSyncResult>;
<<<<<<< HEAD
    /**
     * Verifica se erro é relacionado a Git
     */
    isGitRelatedError(errorMessage: string): boolean;
=======
>>>>>>> parent of 6dfc0a9 (error handleing)
};
export {};
//# sourceMappingURL=git-sync.d.ts.map