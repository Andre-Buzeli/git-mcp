import { z } from 'zod';
/**
 * Tool: git-cherry-pick
 *
 * DESCRIÇÃO:
 * Gerenciamento de cherry-pick Git (GitHub + Gitea) com múltiplas ações
 *
 * FUNCIONALIDADES:
 * - Cherry-pick commit específico
 * - Cherry-pick range de commits
 * - Abortar cherry-pick
 * - Continuar cherry-pick
 * - Cherry-pick sem commit
 * - Cherry-pick com estratégia
 *
 * USO:
 * - Para aplicar commits específicos
 * - Para portar correções entre branches
 * - Para selecionar mudanças específicas
 * - Para manter histórico limpo
 *
 * RECOMENDAÇÕES:
 * - Use para commits pequenos e focados
 * - Teste antes de aplicar em produção
 * - Documente commits cherry-picked
 */
declare const GitCherryPickInputSchema: z.ZodObject<{
    action: z.ZodEnum<["cherry-pick", "cherry-pick-range", "abort", "continue"]>;
    owner: z.ZodString;
    repo: z.ZodString;
    provider: z.ZodEnum<["gitea", "github"]>;
    projectPath: z.ZodString;
    commit_hash: z.ZodOptional<z.ZodString>;
    commit_range: z.ZodOptional<z.ZodString>;
    start_commit: z.ZodOptional<z.ZodString>;
    end_commit: z.ZodOptional<z.ZodString>;
    no_commit: z.ZodOptional<z.ZodBoolean>;
    strategy: z.ZodOptional<z.ZodEnum<["ours", "theirs"]>>;
    mainline: z.ZodOptional<z.ZodNumber>;
    signoff: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    provider: "gitea" | "github";
    owner: string;
    repo: string;
    action: "abort" | "continue" | "cherry-pick" | "cherry-pick-range";
    projectPath: string;
    commit_range?: string | undefined;
    commit_hash?: string | undefined;
    no_commit?: boolean | undefined;
    mainline?: number | undefined;
    strategy?: "ours" | "theirs" | undefined;
    start_commit?: string | undefined;
    end_commit?: string | undefined;
    signoff?: boolean | undefined;
}, {
    provider: "gitea" | "github";
    owner: string;
    repo: string;
    action: "abort" | "continue" | "cherry-pick" | "cherry-pick-range";
    projectPath: string;
    commit_range?: string | undefined;
    commit_hash?: string | undefined;
    no_commit?: boolean | undefined;
    mainline?: number | undefined;
    strategy?: "ours" | "theirs" | undefined;
    start_commit?: string | undefined;
    end_commit?: string | undefined;
    signoff?: boolean | undefined;
}>;
export type GitCherryPickInput = z.infer<typeof GitCherryPickInputSchema>;
declare const GitCherryPickResultSchema: z.ZodObject<{
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
export type GitCherryPickResult = z.infer<typeof GitCherryPickResultSchema>;
export declare const gitCherryPickTool: {
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
            commit_hash: {
                type: string;
                description: string;
            };
            commit_range: {
                type: string;
                description: string;
            };
            start_commit: {
                type: string;
                description: string;
            };
            end_commit: {
                type: string;
                description: string;
            };
            no_commit: {
                type: string;
                description: string;
            };
            strategy: {
                type: string;
                enum: string[];
                description: string;
            };
            mainline: {
                type: string;
                description: string;
            };
            signoff: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    handler(input: GitCherryPickInput): Promise<GitCherryPickResult>;
    cherryPick(params: GitCherryPickInput): Promise<GitCherryPickResult>;
    cherryPickRange(params: GitCherryPickInput): Promise<GitCherryPickResult>;
    abort(params: GitCherryPickInput): Promise<GitCherryPickResult>;
    continue(params: GitCherryPickInput): Promise<GitCherryPickResult>;
};
export {};
//# sourceMappingURL=git-cherry-pick.d.ts.map