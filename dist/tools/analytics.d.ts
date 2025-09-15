import { z } from 'zod';
import { VcsOperations } from '../providers/index.js';
/**
 * Tool: analytics
 *
 * DESCRIÇÃO:
 * Gerenciamento completo de analytics e insights com múltiplas ações
 *
 * FUNCIONALIDADES:
 * - Estatísticas de tráfego
 * - Análise de contribuidores
 * - Atividade do repositório
 * - Métricas de performance
 * - Geração de relatórios customizados
 * - Análise de tendências
 *
 * USO:
 * - Para monitorar performance do repositório
 * - Para análise de contribuições
 * - Para relatórios de atividade
 * - Para insights de desenvolvimento
 *
 * RECOMENDAÇÕES:
 * - Monitore métricas regularmente
 * - Use insights para melhorar workflow
 * - Gere relatórios periódicos
 * - Analise tendências de contribuição
 */
/**
 * Schema de validação para entrada da tool analytics
 */
declare const AnalyticsInputSchema: z.ZodEffects<z.ZodObject<{
    action: z.ZodEnum<["traffic", "contributors", "activity", "performance", "reports", "trends", "insights"]>;
    owner: z.ZodOptional<z.ZodString>;
    repo: z.ZodString;
    provider: z.ZodOptional<z.ZodEnum<["gitea", "github", "both"]>>;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    period: z.ZodOptional<z.ZodEnum<["day", "week", "month", "quarter", "year"]>>;
    start_date: z.ZodOptional<z.ZodString>;
    end_date: z.ZodOptional<z.ZodString>;
    metric_type: z.ZodOptional<z.ZodEnum<["views", "clones", "visitors", "unique_visitors"]>>;
    contributor_type: z.ZodOptional<z.ZodEnum<["all", "internal", "external", "bots"]>>;
    sort_by: z.ZodOptional<z.ZodEnum<["commits", "additions", "deletions", "contributions"]>>;
    activity_type: z.ZodOptional<z.ZodEnum<["commits", "issues", "pulls", "releases", "all"]>>;
    branch: z.ZodOptional<z.ZodString>;
    performance_metric: z.ZodOptional<z.ZodEnum<["build_time", "test_coverage", "code_quality", "deployment_frequency"]>>;
    report_type: z.ZodOptional<z.ZodEnum<["summary", "detailed", "trends", "comparison"]>>;
    report_format: z.ZodOptional<z.ZodEnum<["json", "csv", "pdf", "html"]>>;
    include_charts: z.ZodOptional<z.ZodBoolean>;
    trend_metric: z.ZodOptional<z.ZodEnum<["commits", "contributors", "issues", "stars", "forks"]>>;
    trend_period: z.ZodOptional<z.ZodEnum<["daily", "weekly", "monthly"]>>;
    author: z.ZodOptional<z.ZodString>;
    path: z.ZodOptional<z.ZodString>;
    file_type: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    repo: string;
    action: "traffic" | "contributors" | "activity" | "performance" | "reports" | "trends" | "insights";
    provider?: "gitea" | "github" | "both" | undefined;
    path?: string | undefined;
    owner?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    branch?: string | undefined;
    author?: string | undefined;
    report_format?: "json" | "csv" | "pdf" | "html" | undefined;
    period?: "day" | "week" | "month" | "quarter" | "year" | undefined;
    start_date?: string | undefined;
    end_date?: string | undefined;
    metric_type?: "views" | "clones" | "visitors" | "unique_visitors" | undefined;
    contributor_type?: "all" | "internal" | "external" | "bots" | undefined;
    sort_by?: "commits" | "additions" | "deletions" | "contributions" | undefined;
    activity_type?: "issues" | "all" | "commits" | "pulls" | "releases" | undefined;
    performance_metric?: "build_time" | "test_coverage" | "code_quality" | "deployment_frequency" | undefined;
    report_type?: "trends" | "summary" | "detailed" | "comparison" | undefined;
    include_charts?: boolean | undefined;
    trend_metric?: "issues" | "stars" | "commits" | "contributors" | "forks" | undefined;
    trend_period?: "daily" | "weekly" | "monthly" | undefined;
    file_type?: string | undefined;
}, {
    repo: string;
    action: "traffic" | "contributors" | "activity" | "performance" | "reports" | "trends" | "insights";
    provider?: "gitea" | "github" | "both" | undefined;
    path?: string | undefined;
    owner?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    branch?: string | undefined;
    author?: string | undefined;
    report_format?: "json" | "csv" | "pdf" | "html" | undefined;
    period?: "day" | "week" | "month" | "quarter" | "year" | undefined;
    start_date?: string | undefined;
    end_date?: string | undefined;
    metric_type?: "views" | "clones" | "visitors" | "unique_visitors" | undefined;
    contributor_type?: "all" | "internal" | "external" | "bots" | undefined;
    sort_by?: "commits" | "additions" | "deletions" | "contributions" | undefined;
    activity_type?: "issues" | "all" | "commits" | "pulls" | "releases" | undefined;
    performance_metric?: "build_time" | "test_coverage" | "code_quality" | "deployment_frequency" | undefined;
    report_type?: "trends" | "summary" | "detailed" | "comparison" | undefined;
    include_charts?: boolean | undefined;
    trend_metric?: "issues" | "stars" | "commits" | "contributors" | "forks" | undefined;
    trend_period?: "daily" | "weekly" | "monthly" | undefined;
    file_type?: string | undefined;
}>, {
    repo: string;
    action: "traffic" | "contributors" | "activity" | "performance" | "reports" | "trends" | "insights";
    provider?: "gitea" | "github" | "both" | undefined;
    path?: string | undefined;
    owner?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    branch?: string | undefined;
    author?: string | undefined;
    report_format?: "json" | "csv" | "pdf" | "html" | undefined;
    period?: "day" | "week" | "month" | "quarter" | "year" | undefined;
    start_date?: string | undefined;
    end_date?: string | undefined;
    metric_type?: "views" | "clones" | "visitors" | "unique_visitors" | undefined;
    contributor_type?: "all" | "internal" | "external" | "bots" | undefined;
    sort_by?: "commits" | "additions" | "deletions" | "contributions" | undefined;
    activity_type?: "issues" | "all" | "commits" | "pulls" | "releases" | undefined;
    performance_metric?: "build_time" | "test_coverage" | "code_quality" | "deployment_frequency" | undefined;
    report_type?: "trends" | "summary" | "detailed" | "comparison" | undefined;
    include_charts?: boolean | undefined;
    trend_metric?: "issues" | "stars" | "commits" | "contributors" | "forks" | undefined;
    trend_period?: "daily" | "weekly" | "monthly" | undefined;
    file_type?: string | undefined;
}, {
    repo: string;
    action: "traffic" | "contributors" | "activity" | "performance" | "reports" | "trends" | "insights";
    provider?: "gitea" | "github" | "both" | undefined;
    path?: string | undefined;
    owner?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    branch?: string | undefined;
    author?: string | undefined;
    report_format?: "json" | "csv" | "pdf" | "html" | undefined;
    period?: "day" | "week" | "month" | "quarter" | "year" | undefined;
    start_date?: string | undefined;
    end_date?: string | undefined;
    metric_type?: "views" | "clones" | "visitors" | "unique_visitors" | undefined;
    contributor_type?: "all" | "internal" | "external" | "bots" | undefined;
    sort_by?: "commits" | "additions" | "deletions" | "contributions" | undefined;
    activity_type?: "issues" | "all" | "commits" | "pulls" | "releases" | undefined;
    performance_metric?: "build_time" | "test_coverage" | "code_quality" | "deployment_frequency" | undefined;
    report_type?: "trends" | "summary" | "detailed" | "comparison" | undefined;
    include_charts?: boolean | undefined;
    trend_metric?: "issues" | "stars" | "commits" | "contributors" | "forks" | undefined;
    trend_period?: "daily" | "weekly" | "monthly" | undefined;
    file_type?: string | undefined;
}>;
export type AnalyticsInput = z.infer<typeof AnalyticsInputSchema>;
/**
 * Schema de validação para resultado da tool analytics
 */
declare const AnalyticsResultSchema: z.ZodObject<{
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
export type AnalyticsResult = z.infer<typeof AnalyticsResultSchema>;
/**
 * Implementação da tool analytics
 */
export declare const analyticsTool: {
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
                description: string;
            };
            period: {
                type: string;
                enum: string[];
                description: string;
            };
            start_date: {
                type: string;
                description: string;
            };
            end_date: {
                type: string;
                description: string;
            };
            metric_type: {
                type: string;
                enum: string[];
                description: string;
            };
            contributor_type: {
                type: string;
                enum: string[];
                description: string;
            };
            sort_by: {
                type: string;
                enum: string[];
                description: string;
            };
            activity_type: {
                type: string;
                enum: string[];
                description: string;
            };
            branch: {
                type: string;
                description: string;
            };
            performance_metric: {
                type: string;
                enum: string[];
                description: string;
            };
            report_type: {
                type: string;
                enum: string[];
                description: string;
            };
            report_format: {
                type: string;
                enum: string[];
                description: string;
            };
            include_charts: {
                type: string;
                description: string;
            };
            trend_metric: {
                type: string;
                enum: string[];
                description: string;
            };
            trend_period: {
                type: string;
                enum: string[];
                description: string;
            };
            author: {
                type: string;
                description: string;
            };
            path: {
                type: string;
                description: string;
            };
            file_type: {
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
        };
        required: string[];
    };
    handler(input: AnalyticsInput): Promise<AnalyticsResult>;
    /**
     * Obtém estatísticas de tráfego
     */
    getTrafficStats(params: AnalyticsInput, provider: VcsOperations): Promise<AnalyticsResult>;
    /**
     * Analisa contribuidores
     */
    analyzeContributors(params: AnalyticsInput, provider: VcsOperations): Promise<AnalyticsResult>;
    /**
     * Obtém estatísticas de atividade
     */
    getActivityStats(params: AnalyticsInput, provider: VcsOperations): Promise<AnalyticsResult>;
    /**
     * Obtém métricas de performance
     */
    getPerformanceMetrics(params: AnalyticsInput, provider: VcsOperations): Promise<AnalyticsResult>;
    /**
     * Gera relatórios customizados
     */
    generateReports(params: AnalyticsInput, provider: VcsOperations): Promise<AnalyticsResult>;
    /**
     * Analisa tendências
     */
    analyzeTrends(params: AnalyticsInput, provider: VcsOperations): Promise<AnalyticsResult>;
    /**
     * Obtém insights gerais do repositório
     */
    getRepositoryInsights(params: AnalyticsInput, provider: VcsOperations): Promise<AnalyticsResult>;
};
export {};
//# sourceMappingURL=analytics.d.ts.map