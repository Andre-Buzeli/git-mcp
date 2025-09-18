import { BaseVcsProvider } from './base-provider.js';
import { VcsProvider, RepositoryInfo, BranchInfo, FileInfo, CommitInfo, IssueInfo, PullRequestInfo, ReleaseInfo, TagInfo, UserInfo, OrganizationInfo, WebhookInfo } from './types.js';
/**
 * Provider específico para GitHub
 * Implementa todas as operações VCS usando a API REST do GitHub
 */
export declare class GitHubProvider extends BaseVcsProvider {
    constructor(config: VcsProvider);
    protected getBaseUrl(config: VcsProvider): string;
    protected getHeaders(config: VcsProvider): Record<string, string>;
    protected normalizeRepository(data: any): RepositoryInfo;
    protected normalizeBranch(data: any): BranchInfo;
    protected normalizeFile(data: any): FileInfo;
    protected normalizeCommit(data: any): CommitInfo;
    protected normalizeIssue(data: any): IssueInfo;
    protected normalizePullRequest(data: any): PullRequestInfo;
    protected normalizeRelease(data: any): ReleaseInfo;
    protected normalizeTag(data: any): TagInfo;
    protected normalizeUser(data: any): UserInfo;
    protected normalizeOrganization(data: any): OrganizationInfo;
    protected normalizeWebhook(data: any): WebhookInfo;
    listRepositories(username?: string, page?: number, limit?: number): Promise<RepositoryInfo[]>;
    getRepository(owner: string, repo: string): Promise<RepositoryInfo>;
    createRepository(name: string, description?: string, privateRepo?: boolean): Promise<RepositoryInfo>;
    updateRepository(owner: string, repo: string, updates: any): Promise<RepositoryInfo>;
    deleteRepository(owner: string, repo: string): Promise<boolean>;
    forkRepository(owner: string, repo: string, organization?: string): Promise<RepositoryInfo>;
    searchRepositories(query: string, page?: number, limit?: number): Promise<RepositoryInfo[]>;
    listBranches(owner: string, repo: string, page?: number, limit?: number): Promise<BranchInfo[]>;
    getBranch(owner: string, repo: string, branch: string): Promise<BranchInfo>;
    createBranch(owner: string, repo: string, branchName: string, fromBranch: string): Promise<BranchInfo>;
    deleteBranch(owner: string, repo: string, branch: string): Promise<boolean>;
    getFile(owner: string, repo: string, path: string, ref?: string): Promise<FileInfo>;
    createFile(owner: string, repo: string, path: string, content: string, message: string, branch?: string): Promise<FileInfo>;
    updateFile(owner: string, repo: string, path: string, content: string, message: string, sha: string, branch?: string): Promise<FileInfo>;
    deleteFile(owner: string, repo: string, path: string, message: string, sha: string, branch?: string): Promise<boolean>;
    listFiles(owner: string, repo: string, path: string, ref?: string): Promise<FileInfo[]>;
    uploadProject(owner: string, repo: string, projectPath: string, message: string, branch?: string): Promise<{
        uploaded: number;
        errors: string[];
    }>;
    listCommits(owner: string, repo: string, branch?: string, page?: number, limit?: number): Promise<CommitInfo[]>;
    getCommit(owner: string, repo: string, sha: string): Promise<CommitInfo>;
    listIssues(owner: string, repo: string, state?: 'open' | 'closed' | 'all', page?: number, limit?: number): Promise<IssueInfo[]>;
    getIssue(owner: string, repo: string, issueNumber: number): Promise<IssueInfo>;
    createIssue(owner: string, repo: string, title: string, body?: string, assignees?: string[], labels?: string[]): Promise<IssueInfo>;
    updateIssue(owner: string, repo: string, issueNumber: number, updates: any): Promise<IssueInfo>;
    closeIssue(owner: string, repo: string, issueNumber: number): Promise<IssueInfo>;
    listPullRequests(owner: string, repo: string, state?: 'open' | 'closed' | 'merged' | 'all', page?: number, limit?: number): Promise<PullRequestInfo[]>;
    getPullRequest(owner: string, repo: string, pullNumber: number): Promise<PullRequestInfo>;
    createPullRequest(owner: string, repo: string, title: string, body: string, head: string, base: string): Promise<PullRequestInfo>;
    updatePullRequest(owner: string, repo: string, pullNumber: number, updates: any): Promise<PullRequestInfo>;
    mergePullRequest(owner: string, repo: string, pullNumber: number, mergeMethod?: 'merge' | 'rebase' | 'squash'): Promise<boolean>;
    listReleases(owner: string, repo: string, page?: number, limit?: number): Promise<ReleaseInfo[]>;
    getRelease(owner: string, repo: string, releaseId: number): Promise<ReleaseInfo>;
    createRelease(owner: string, repo: string, releaseData: any): Promise<ReleaseInfo>;
    updateRelease(releaseId: number, updates: any): Promise<ReleaseInfo>;
    deleteRelease(releaseId: number): Promise<boolean>;
    listTags(owner: string, repo: string, page?: number, limit?: number): Promise<TagInfo[]>;
    getTag(owner: string, repo: string, tag: string): Promise<TagInfo>;
    createTag(owner: string, repo: string, tagData: any): Promise<TagInfo>;
    deleteTag(owner: string, repo: string, tag: string): Promise<boolean>;
    getCurrentUser(): Promise<UserInfo>;
    getUser(username: string): Promise<UserInfo>;
    listUsers(page?: number, limit?: number): Promise<UserInfo[]>;
    searchUsers(query: string, page?: number, limit?: number): Promise<UserInfo[]>;
    getUserOrganizations(username: string, page?: number, limit?: number): Promise<OrganizationInfo[]>;
    getUserRepositories(username: string, page?: number, limit?: number): Promise<RepositoryInfo[]>;
    listWebhooks(owner: string, repo: string, page?: number, limit?: number): Promise<WebhookInfo[]>;
    getWebhook(owner: string, repo: string, webhookId: number): Promise<WebhookInfo>;
    createWebhook(owner: string, repo: string, url: string, events: string[], secret?: string): Promise<WebhookInfo>;
    updateWebhook(owner: string, repo: string, webhookId: number, updates: any): Promise<WebhookInfo>;
    deleteWebhook(owner: string, repo: string, webhookId: number): Promise<boolean>;
    createCommit(owner: string, repo: string, message: string, branch: string, changes?: any): Promise<CommitInfo>;
    listWorkflows(params: any): Promise<any>;
    listWorkflowRuns(params: any): Promise<any>;
    listDeployments(params: any): Promise<any>;
    runSecurityScan(params: any): Promise<any>;
    getTrafficStats(params: any): Promise<any>;
    cloneRepository(params: any): Promise<any>;
    archiveRepository(params: any): Promise<any>;
    transferRepository(params: any): Promise<any>;
    createFromTemplate(params: any): Promise<any>;
    mirrorRepository(params: any): Promise<any>;
    analyzeContributors(params: any): Promise<any>;
    getActivityStats(params: any): Promise<any>;
    getRepositoryInsights(params: any): Promise<any>;
    createDeployment(params: any): Promise<any>;
    updateDeploymentStatus(params: any): Promise<any>;
    manageSecurityAlerts(params: any): Promise<any>;
    listSecurityVulnerabilities(params: any): Promise<any>;
    createWorkflow(params: any): Promise<any>;
    triggerWorkflow(params: any): Promise<any>;
    getWorkflowStatus(params: any): Promise<any>;
    getWorkflowLogs(params: any): Promise<any>;
    listWorkflowArtifacts(params: any): Promise<any>;
    downloadArtifact(params: any): Promise<any>;
    listSecrets(params: any): Promise<any>;
    listJobs(params: any): Promise<any>;
    /**
     * Obtém URL do repositório GitHub
     */
    getRepositoryUrl(owner: string, repo: string): string;
}
//# sourceMappingURL=github-provider.d.ts.map