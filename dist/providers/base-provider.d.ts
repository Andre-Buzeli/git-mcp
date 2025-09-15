import { AxiosInstance, AxiosRequestConfig } from 'axios';
import { VcsOperations, VcsProvider } from './types.js';
/**
 * Classe base abstrata para todos os providers VCS
 * Implementa funcionalidades comuns e define interface unificada
 */
export declare abstract class BaseVcsProvider implements VcsOperations {
    protected client: AxiosInstance;
    protected config: VcsProvider;
    protected baseUrl: string;
    constructor(config: VcsProvider);
    /**
     * Configura interceptors para logging e tratamento de erros
     */
    private setupInterceptors;
    /**
     * Obtém a URL base para o provider
     */
    protected abstract getBaseUrl(config: VcsProvider): string;
    /**
     * Obtém os headers específicos do provider
     */
    protected abstract getHeaders(config: VcsProvider): Record<string, string>;
    /**
     * Normaliza erros para formato unificado usando ErrorHandler padrão
     */
    protected normalizeError(error: any): Error;
    /**
     * Normaliza dados de repositório para formato unificado
     */
    protected abstract normalizeRepository(data: any): any;
    /**
     * Normaliza dados de branch para formato unificado
     */
    protected abstract normalizeBranch(data: any): any;
    /**
     * Normaliza dados de arquivo para formato unificado
     */
    protected abstract normalizeFile(data: any): any;
    /**
     * Normaliza dados de commit para formato unificado
     */
    protected abstract normalizeCommit(data: any): any;
    /**
     * Normaliza dados de issue para formato unificado
     */
    protected abstract normalizeIssue(data: any): any;
    /**
     * Normaliza dados de pull request para formato unificado
     */
    protected abstract normalizePullRequest(data: any): any;
    /**
     * Normaliza dados de release para formato unificado
     */
    protected abstract normalizeRelease(data: any): any;
    /**
     * Normaliza dados de tag para formato unificado
     */
    protected abstract normalizeTag(data: any): any;
    /**
     * Normaliza dados de usuário para formato unificado
     */
    protected abstract normalizeUser(data: any): any;
    /**
     * Normaliza dados de webhook para formato unificado
     */
    protected abstract normalizeWebhook(data: any): any;
    /**
     * Executa uma requisição HTTP com tratamento de erro
     */
    protected request<T>(config: AxiosRequestConfig): Promise<T>;
    /**
     * Executa uma requisição GET
     */
    protected get<T>(url: string, params?: any): Promise<T>;
    /**
     * Executa uma requisição POST
     */
    protected post<T>(url: string, data?: any): Promise<T>;
    /**
     * Executa uma requisição PUT
     */
    protected put<T>(url: string, data?: any): Promise<T>;
    /**
     * Executa uma requisição PATCH
     */
    protected patch<T>(url: string, data?: any): Promise<T>;
    /**
     * Executa uma requisição DELETE
     */
    protected delete<T>(url: string, config?: any): Promise<T>;
    listRepositories(username?: string, page?: number, limit?: number): Promise<any[]>;
    getRepository(owner: string, repo: string): Promise<any>;
    createRepository(name: string, description?: string, privateRepo?: boolean): Promise<any>;
    updateRepository(owner: string, repo: string, updates: any): Promise<any>;
    deleteRepository(owner: string, repo: string): Promise<boolean>;
    forkRepository(owner: string, repo: string, organization?: string): Promise<any>;
    searchRepositories(query: string, page?: number, limit?: number): Promise<any[]>;
    listBranches(owner: string, repo: string, page?: number, limit?: number): Promise<any[]>;
    getBranch(owner: string, repo: string, branch: string): Promise<any>;
    createBranch(owner: string, repo: string, branchName: string, fromBranch: string): Promise<any>;
    deleteBranch(owner: string, repo: string, branch: string): Promise<boolean>;
    getFile(owner: string, repo: string, path: string, ref?: string): Promise<any>;
    createFile(owner: string, repo: string, path: string, content: string, message: string, branch?: string): Promise<any>;
    updateFile(owner: string, repo: string, path: string, content: string, message: string, sha: string, branch?: string): Promise<any>;
    deleteFile(owner: string, repo: string, path: string, message: string, sha: string, branch?: string): Promise<boolean>;
    listFiles(owner: string, repo: string, path: string, ref?: string): Promise<any[]>;
    listCommits(owner: string, repo: string, branch?: string, page?: number, limit?: number): Promise<any[]>;
    getCommit(owner: string, repo: string, sha: string): Promise<any>;
    listIssues(owner: string, repo: string, state?: 'open' | 'closed' | 'all', page?: number, limit?: number): Promise<any[]>;
    getIssue(owner: string, repo: string, issueNumber: number): Promise<any>;
    createIssue(owner: string, repo: string, title: string, body?: string, assignees?: string[], labels?: string[]): Promise<any>;
    updateIssue(owner: string, repo: string, issueNumber: number, updates: any): Promise<any>;
    closeIssue(owner: string, repo: string, issueNumber: number): Promise<any>;
    listPullRequests(owner: string, repo: string, state?: 'open' | 'closed' | 'merged' | 'all', page?: number, limit?: number): Promise<any[]>;
    getPullRequest(owner: string, repo: string, pullNumber: number): Promise<any>;
    createPullRequest(owner: string, repo: string, title: string, body: string, head: string, base: string): Promise<any>;
    updatePullRequest(owner: string, repo: string, pullNumber: number, updates: any): Promise<any>;
    mergePullRequest(owner: string, repo: string, pullNumber: number, mergeMethod?: 'merge' | 'rebase' | 'squash'): Promise<boolean>;
    listReleases(owner: string, repo: string, page?: number, limit?: number): Promise<any[]>;
    getRelease(owner: string, repo: string, releaseId: number): Promise<any>;
    createRelease(tagName: string, name: string, body?: string, draft?: boolean, prerelease?: boolean): Promise<any>;
    updateRelease(releaseId: number, updates: any): Promise<any>;
    deleteRelease(releaseId: number): Promise<boolean>;
    listTags(owner: string, repo: string, page?: number, limit?: number): Promise<any[]>;
    getTag(owner: string, repo: string, tag: string): Promise<any>;
    createTag(tagName: string, message: string, target: string): Promise<any>;
    deleteTag(owner: string, repo: string, tag: string): Promise<boolean>;
    getCurrentUser(): Promise<any>;
    getUser(username: string): Promise<any>;
    listUsers(page?: number, limit?: number): Promise<any[]>;
    searchUsers(query: string, page?: number, limit?: number): Promise<any[]>;
    listWebhooks(owner: string, repo: string, page?: number, limit?: number): Promise<any[]>;
    getWebhook(owner: string, repo: string, webhookId: number): Promise<any>;
    createWebhook(owner: string, repo: string, url: string, events: string[], secret?: string): Promise<any>;
    updateWebhook(owner: string, repo: string, webhookId: number, updates: any): Promise<any>;
    deleteWebhook(owner: string, repo: string, webhookId: number): Promise<boolean>;
    createCommit(owner: string, repo: string, message: string, branch: string, changes?: any): Promise<any>;
}
//# sourceMappingURL=base-provider.d.ts.map