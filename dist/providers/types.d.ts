/**
 * Interfaces base para o sistema multi-provider
 * Suporta GitHub e Gitea com operações unificadas
 */
export interface VcsProvider {
    name: string;
    type: 'github' | 'gitea';
    apiUrl: string;
    token: string;
    username?: string;
}
export interface VcsProviderConfig {
    defaultProvider: string;
    providers: VcsProvider[];
}
export interface RepositoryInfo {
    id: number;
    name: string;
    full_name: string;
    description?: string;
    private: boolean;
    html_url: string;
    clone_url: string;
    default_branch: string;
    created_at: string;
    updated_at: string;
    owner: {
        login: string;
        type: string;
    };
    raw?: any;
}
export interface BranchInfo {
    name: string;
    commit: {
        sha: string;
        url: string;
    };
    protected?: boolean;
    raw?: any;
}
export interface FileInfo {
    name: string;
    path: string;
    sha: string;
    size: number;
    url: string;
    html_url: string;
    git_url: string;
    download_url?: string;
    type: 'file' | 'dir';
    content?: string;
    encoding?: string;
    raw?: any;
}
export interface CommitInfo {
    sha: string;
    message: string;
    author: {
        name: string;
        email: string;
        date: string;
    };
    committer: {
        name: string;
        email: string;
        date: string;
    };
    url: string;
    html_url: string;
    raw?: any;
}
export interface IssueInfo {
    id: number;
    number: number;
    title: string;
    body?: string;
    state: 'open' | 'closed';
    user: {
        login: string;
        id: number;
    };
    assignees?: Array<{
        login: string;
        id: number;
    }>;
    labels?: Array<{
        name: string;
        color: string;
    }>;
    created_at: string;
    updated_at: string;
    closed_at?: string;
    raw?: any;
}
export interface PullRequestInfo {
    id: number;
    number: number;
    title: string;
    body?: string;
    state: 'open' | 'closed' | 'merged';
    user: {
        login: string;
        id: number;
    };
    head: {
        ref: string;
        sha: string;
        repo: {
            name: string;
            full_name: string;
        };
    };
    base: {
        ref: string;
        sha: string;
        repo: {
            name: string;
            full_name: string;
        };
    };
    created_at: string;
    updated_at: string;
    closed_at?: string;
    merged_at?: string;
    mergeable?: boolean;
    raw?: any;
}
export interface ReleaseInfo {
    id: number;
    tag_name: string;
    name: string;
    body?: string;
    draft: boolean;
    prerelease: boolean;
    created_at: string;
    published_at?: string;
    html_url: string;
    tarball_url: string;
    zipball_url: string;
    raw?: any;
}
export interface TagInfo {
    name: string;
    commit: {
        sha: string;
        url: string;
    };
    zipball_url: string;
    tarball_url: string;
    raw?: any;
}
export interface UserInfo {
    id: number;
    login: string;
    name?: string;
    email?: string;
    avatar_url: string;
    html_url: string;
    type: string;
    raw?: any;
}
export interface OrganizationInfo {
    id: number;
    login: string;
    name?: string;
    description?: string;
    avatar_url?: string;
    html_url?: string;
    location?: string;
    website?: string;
    public_repos?: number;
    public_members?: number;
    raw?: any;
}
export interface WebhookInfo {
    id: number;
    type: string;
    name: string;
    active: boolean;
    events: string[];
    config: {
        url: string;
        content_type: string;
        secret?: string;
    };
    created_at: string;
    updated_at: string;
    raw?: any;
}
export interface VcsOperations {
    listRepositories(username?: string, page?: number, limit?: number): Promise<RepositoryInfo[]>;
    getRepository(owner: string, repo: string): Promise<RepositoryInfo>;
    createRepository(name: string, description?: string, privateRepo?: boolean): Promise<RepositoryInfo>;
    updateRepository(owner: string, repo: string, updates: Partial<RepositoryInfo>): Promise<RepositoryInfo>;
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
    getRepositoryUrl(owner: string, repo: string): string;
    listCommits(owner: string, repo: string, branch?: string, page?: number, limit?: number): Promise<CommitInfo[]>;
    getCommit(owner: string, repo: string, sha: string): Promise<CommitInfo>;
    createCommit(owner: string, repo: string, message: string, branch: string, changes?: any): Promise<CommitInfo>;
    listIssues(owner: string, repo: string, state?: 'open' | 'closed' | 'all', page?: number, limit?: number): Promise<IssueInfo[]>;
    getIssue(owner: string, repo: string, issueNumber: number): Promise<IssueInfo>;
    createIssue(owner: string, repo: string, title: string, body?: string, assignees?: string[], labels?: string[]): Promise<IssueInfo>;
    updateIssue(owner: string, repo: string, issueNumber: number, updates: Partial<IssueInfo>): Promise<IssueInfo>;
    closeIssue(owner: string, repo: string, issueNumber: number): Promise<IssueInfo>;
    listPullRequests(owner: string, repo: string, state?: 'open' | 'closed' | 'merged' | 'all', page?: number, limit?: number): Promise<PullRequestInfo[]>;
    getPullRequest(owner: string, repo: string, pullNumber: number): Promise<PullRequestInfo>;
    createPullRequest(owner: string, repo: string, title: string, body: string, head: string, base: string): Promise<PullRequestInfo>;
    updatePullRequest(owner: string, repo: string, pullNumber: number, updates: Partial<PullRequestInfo>): Promise<PullRequestInfo>;
    mergePullRequest(owner: string, repo: string, pullNumber: number, mergeMethod?: 'merge' | 'rebase' | 'squash'): Promise<boolean>;
    listReleases(owner: string, repo: string, page?: number, limit?: number): Promise<ReleaseInfo[]>;
    getRelease(owner: string, repo: string, releaseId: number): Promise<ReleaseInfo>;
    createRelease(tagName: string, name: string, body?: string, draft?: boolean, prerelease?: boolean): Promise<ReleaseInfo>;
    updateRelease(releaseId: number, updates: Partial<ReleaseInfo>): Promise<ReleaseInfo>;
    deleteRelease(releaseId: number): Promise<boolean>;
    listTags(owner: string, repo: string, page?: number, limit?: number): Promise<TagInfo[]>;
    getTag(owner: string, repo: string, tag: string): Promise<TagInfo>;
    createTag(tagName: string, message: string, target: string): Promise<TagInfo>;
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
    updateWebhook(owner: string, repo: string, webhookId: number, updates: Partial<WebhookInfo>): Promise<WebhookInfo>;
    deleteWebhook(owner: string, repo: string, webhookId: number): Promise<boolean>;
    cloneRepository?(params: any): Promise<any>;
    archiveRepository?(params: any): Promise<any>;
    transferRepository?(params: any): Promise<any>;
    createFromTemplate?(params: any): Promise<any>;
    mirrorRepository?(params: any): Promise<any>;
    listWorkflows?(params: any): Promise<any>;
    createWorkflow?(params: any): Promise<any>;
    triggerWorkflow?(params: any): Promise<any>;
    getWorkflowStatus?(params: any): Promise<any>;
    getWorkflowLogs?(params: any): Promise<any>;
    disableWorkflow?(params: any): Promise<any>;
    enableWorkflow?(params: any): Promise<any>;
    listWorkflowRuns?(params: any): Promise<any>;
    cancelWorkflowRun?(params: any): Promise<any>;
    rerunWorkflow?(params: any): Promise<any>;
    listArtifacts?(params: any): Promise<any>;
    listSecrets?(params: any): Promise<any>;
    listJobs?(params: any): Promise<any>;
    downloadArtifact?(params: any): Promise<any>;
    listDeployments?(params: any): Promise<any>;
    createDeployment?(params: any): Promise<any>;
    updateDeploymentStatus?(params: any): Promise<any>;
    listEnvironments?(params: any): Promise<any>;
    rollbackDeployment?(params: any): Promise<any>;
    deleteDeployment?(params: any): Promise<any>;
    runSecurityScan?(params: any): Promise<any>;
    listVulnerabilities?(params: any): Promise<any>;
    listSecurityVulnerabilities?(params: any): Promise<any>;
    manageSecurityAlerts?(params: any): Promise<any>;
    manageSecurityPolicies?(params: any): Promise<any>;
    checkCompliance?(params: any): Promise<any>;
    analyzeDependencies?(params: any): Promise<any>;
    listSecurityAdvisories?(params: any): Promise<any>;
    getTrafficStats?(params: any): Promise<any>;
    analyzeContributors?(params: any): Promise<any>;
    getActivityStats?(params: any): Promise<any>;
    getPerformanceMetrics?(params: any): Promise<any>;
    generateReports?(params: any): Promise<any>;
    analyzeTrends?(params: any): Promise<any>;
    getRepositoryInsights?(params: any): Promise<any>;
    startCodeReview?(params: any): Promise<any>;
    reviewFile?(params: any): Promise<any>;
    reviewCommit?(params: any): Promise<any>;
    generateReviewReport?(params: any): Promise<any>;
    applyReviewSuggestions?(params: any): Promise<any>;
    getConfig?(): VcsProvider;
}
export interface VcsProviderFactory {
    createProvider(config: VcsProvider): VcsOperations;
    getProvider(name: string): VcsOperations | undefined;
    listProviders(): string[];
    getDefaultProvider(): VcsOperations;
}
//# sourceMappingURL=types.d.ts.map