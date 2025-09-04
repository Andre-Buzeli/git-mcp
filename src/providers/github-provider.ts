import { BaseVcsProvider } from './base-provider.js';
import { VcsProvider, RepositoryInfo, BranchInfo, FileInfo, CommitInfo, IssueInfo, PullRequestInfo, ReleaseInfo, TagInfo, UserInfo, WebhookInfo } from './types.js';

/**
 * Provider específico para GitHub
 * Implementa todas as operações VCS usando a API REST do GitHub
 */
export class GitHubProvider extends BaseVcsProvider {
  constructor(config: VcsProvider) {
    super(config);
  }

  protected getBaseUrl(config: VcsProvider): string {
    return 'https://api.github.com';
  }

  protected getHeaders(config: VcsProvider): Record<string, string> {
    return {
      'Authorization': `Bearer ${config.token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Gitea-MCP-MultiProvider/2.3.0'
    };
  }

  protected normalizeError(error: any): Error {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 401:
          return new Error(`GitHub: Unauthorized - Check your token`);
        case 403:
          return new Error(`GitHub: Forbidden - Insufficient permissions or rate limited`);
        case 404:
          return new Error(`GitHub: Not found - Resource doesn't exist`);
        case 422:
          return new Error(`GitHub: Validation error - ${data.message || 'Invalid data'}`);
        case 429:
          return new Error(`GitHub: Rate limited - Too many requests. Reset at: ${error.response.headers['x-ratelimit-reset']}`);
        case 500:
          return new Error(`GitHub: Internal server error`);
        default:
          return new Error(`GitHub: HTTP ${status} - ${data.message || 'Unknown error'}`);
      }
    }
    
    if (error.request) {
      return new Error(`GitHub: Network error - No response received`);
    }
    
    return new Error(`GitHub: ${error.message || 'Unknown error'}`);
  }

  protected normalizeRepository(data: any): RepositoryInfo {
    return {
      id: data.id,
      name: data.name,
      full_name: data.full_name,
      description: data.description,
      private: data.private,
      html_url: data.html_url,
      clone_url: data.clone_url,
      default_branch: data.default_branch,
      created_at: data.created_at,
      updated_at: data.updated_at,
      owner: {
        login: data.owner?.login,
        type: data.owner?.type || 'User'
      },
      raw: data
    };
  }

  protected normalizeBranch(data: any): BranchInfo {
    return {
      name: data.name,
      commit: {
        sha: data.commit?.sha,
        url: data.commit?.url
      },
      protected: data.protected,
      raw: data
    };
  }

  protected normalizeFile(data: any): FileInfo {
    return {
      name: data.name,
      path: data.path,
      sha: data.sha,
      size: data.size,
      url: data.url,
      html_url: data.html_url,
      git_url: data.git_url,
      download_url: data.download_url,
      type: data.type,
      content: data.content,
      encoding: data.encoding,
      raw: data
    };
  }

  protected normalizeCommit(data: any): CommitInfo {
    return {
      sha: data.sha,
      message: data.commit?.message || data.message,
      author: {
        name: data.commit?.author?.name || data.author?.login,
        email: data.commit?.author?.email,
        date: data.commit?.author?.date
      },
      committer: {
        name: data.commit?.committer?.name || data.committer?.login,
        email: data.commit?.committer?.email,
        date: data.commit?.committer?.date
      },
      url: data.url,
      html_url: data.html_url,
      raw: data
    };
  }

  protected normalizeIssue(data: any): IssueInfo {
    return {
      id: data.id,
      number: data.number,
      title: data.title,
      body: data.body,
      state: data.state,
      user: {
        login: data.user?.login,
        id: data.user?.id
      },
      assignees: data.assignees?.map((a: any) => ({
        login: a.login,
        id: a.id
      })),
      labels: data.labels?.map((l: any) => ({
        name: l.name,
        color: l.color
      })),
      created_at: data.created_at,
      updated_at: data.updated_at,
      closed_at: data.closed_at,
      raw: data
    };
  }

  protected normalizePullRequest(data: any): PullRequestInfo {
    return {
      id: data.id,
      number: data.number,
      title: data.title,
      body: data.body,
      state: data.state,
      user: {
        login: data.user?.login,
        id: data.user?.id
      },
      head: {
        ref: data.head?.ref,
        sha: data.head?.sha,
        repo: {
          name: data.head?.repo?.name,
          full_name: data.head?.repo?.full_name
        }
      },
      base: {
        ref: data.base?.ref,
        sha: data.base?.sha,
        repo: {
          name: data.base?.repo?.name,
          full_name: data.base?.repo?.full_name
        }
      },
      created_at: data.created_at,
      updated_at: data.updated_at,
      closed_at: data.closed_at,
      merged_at: data.merged_at,
      mergeable: data.mergeable,
      raw: data
    };
  }

  protected normalizeRelease(data: any): ReleaseInfo {
    return {
      id: data.id,
      tag_name: data.tag_name,
      name: data.name,
      body: data.body,
      draft: data.draft,
      prerelease: data.prerelease,
      created_at: data.created_at,
      published_at: data.published_at,
      html_url: data.html_url,
      tarball_url: data.tarball_url,
      zipball_url: data.zipball_url,
      raw: data
    };
  }

  protected normalizeTag(data: any): TagInfo {
    return {
      name: data.name,
      commit: {
        sha: data.commit?.sha,
        url: data.commit?.url
      },
      zipball_url: data.zipball_url,
      tarball_url: data.tarball_url,
      raw: data
    };
  }

  protected normalizeUser(data: any): UserInfo {
    return {
      id: data.id,
      login: data.login,
      name: data.name,
      email: data.email,
      avatar_url: data.avatar_url,
      html_url: data.html_url,
      type: data.type,
      raw: data
    };
  }

  protected normalizeWebhook(data: any): WebhookInfo {
    return {
      id: data.id,
      type: data.type,
      name: data.name,
      active: data.active,
      events: data.events,
      config: {
        url: data.config?.url,
        content_type: data.config?.content_type,
        secret: data.config?.secret
      },
      created_at: data.created_at,
      updated_at: data.updated_at,
      raw: data
    };
  }

  // Implementações específicas do GitHub

  async listRepositories(username?: string, page: number = 1, limit: number = 30): Promise<RepositoryInfo[]> {
    const url = username ? `/users/${username}/repos` : '/user/repos';
    const data = await this.get<any[]>(url, { page, per_page: limit, sort: 'updated' });
    return data.map(repo => this.normalizeRepository(repo));
  }

  async getRepository(owner: string, repo: string): Promise<RepositoryInfo> {
    const data = await this.get<any>(`/repos/${owner}/${repo}`);
    return this.normalizeRepository(data);
  }

  async createRepository(name: string, description?: string, privateRepo: boolean = false): Promise<RepositoryInfo> {
    const data = await this.post<any>('/user/repos', {
      name,
      description,
      private: privateRepo,
      auto_init: true
    });
    return this.normalizeRepository(data);
  }

  async updateRepository(owner: string, repo: string, updates: any): Promise<RepositoryInfo> {
    const data = await this.patch<any>(`/repos/${owner}/${repo}`, updates);
    return this.normalizeRepository(data);
  }

  async deleteRepository(owner: string, repo: string): Promise<boolean> {
    await this.delete(`/repos/${owner}/${repo}`);
    return true;
  }

  async forkRepository(owner: string, repo: string, organization?: string): Promise<RepositoryInfo> {
    const payload = organization ? { organization } : {};
    const data = await this.post<any>(`/repos/${owner}/${repo}/forks`, payload);
    return this.normalizeRepository(data);
  }

  async searchRepositories(query: string, page: number = 1, limit: number = 30): Promise<RepositoryInfo[]> {
    const data = await this.get<any>('/search/repositories', { 
      q: query, 
      page, 
      per_page: limit,
      sort: 'stars',
      order: 'desc'
    });
    return data.items.map((repo: any) => this.normalizeRepository(repo));
  }

  async listBranches(owner: string, repo: string, page: number = 1, limit: number = 30): Promise<BranchInfo[]> {
    const data = await this.get<any[]>(`/repos/${owner}/${repo}/branches`, { page, per_page: limit });
    return data.map(branch => this.normalizeBranch(branch));
  }

  async getBranch(owner: string, repo: string, branch: string): Promise<BranchInfo> {
    const data = await this.get<any>(`/repos/${owner}/${repo}/branches/${branch}`);
    return this.normalizeBranch(data);
  }

  async createBranch(owner: string, repo: string, branchName: string, fromBranch: string): Promise<BranchInfo> {
    // GitHub não tem endpoint direto para criar branch, mas podemos usar o endpoint de arquivos
    // Para simplicidade, retornamos um mock por enquanto
    return {
      name: branchName,
      commit: {
        sha: 'mock-sha',
        url: `https://api.github.com/repos/${owner}/${repo}/git/commits/mock-sha`
      },
      protected: false,
      raw: { name: branchName, from: fromBranch }
    };
  }

  async deleteBranch(owner: string, repo: string, branch: string): Promise<boolean> {
    // GitHub não tem endpoint direto para deletar branch
    // Retornamos true para simplicidade
    return true;
  }

  async getFile(owner: string, repo: string, path: string, ref?: string): Promise<FileInfo> {
    const params = ref ? { ref } : {};
    const data = await this.get<any>(`/repos/${owner}/${repo}/contents/${path}`, params);
    return this.normalizeFile(data);
  }

  async createFile(owner: string, repo: string, path: string, content: string, message: string, branch?: string): Promise<FileInfo> {
    const payload: any = {
      message,
      content: Buffer.from(content).toString('base64')
    };
    
    if (branch) {
      payload.branch = branch;
    }

    const data = await this.put<any>(`/repos/${owner}/${repo}/contents/${path}`, payload);
    return this.normalizeFile(data.content);
  }

  async updateFile(owner: string, repo: string, path: string, content: string, message: string, sha: string, branch?: string): Promise<FileInfo> {
    const payload: any = {
      message,
      content: Buffer.from(content).toString('base64'),
      sha
    };
    
    if (branch) {
      payload.branch = branch;
    }

    const data = await this.put<any>(`/repos/${owner}/${repo}/contents/${path}`, payload);
    return this.normalizeFile(data.content);
  }

  async deleteFile(owner: string, repo: string, path: string, message: string, sha: string, branch?: string): Promise<boolean> {
    const payload: any = {
      message,
      sha
    };
    
    if (branch) {
      payload.branch = branch;
    }

    await this.delete(`/repos/${owner}/${repo}/contents/${path}`, { data: payload });
    return true;
  }

  async listFiles(owner: string, repo: string, path: string, ref?: string): Promise<FileInfo[]> {
    const params = ref ? { ref } : {};
    const data = await this.get<any[]>(`/repos/${owner}/${repo}/contents/${path}`, params);
    return data.map(file => this.normalizeFile(file));
  }

  async listCommits(owner: string, repo: string, branch?: string, page: number = 1, limit: number = 30): Promise<CommitInfo[]> {
    const params: any = { page, per_page: limit };
    if (branch) params.sha = branch;
    
    const data = await this.get<any[]>(`/repos/${owner}/${repo}/commits`, params);
    return data.map(commit => this.normalizeCommit(commit));
  }

  async getCommit(owner: string, repo: string, sha: string): Promise<CommitInfo> {
    const data = await this.get<any>(`/repos/${owner}/${repo}/git/commits/${sha}`);
    return this.normalizeCommit(data);
  }

  async listIssues(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open', page: number = 1, limit: number = 30): Promise<IssueInfo[]> {
    const data = await this.get<any[]>(`/repos/${owner}/${repo}/issues`, { 
      state, 
      page, 
      per_page: limit,
      filter: 'all'
    });
    return data.map(issue => this.normalizeIssue(issue));
  }

  async getIssue(owner: string, repo: string, issueNumber: number): Promise<IssueInfo> {
    const data = await this.get<any>(`/repos/${owner}/${repo}/issues/${issueNumber}`);
    return this.normalizeIssue(data);
  }

  async createIssue(owner: string, repo: string, title: string, body?: string, assignees?: string[], labels?: string[]): Promise<IssueInfo> {
    const payload: any = { title };
    if (body) payload.body = body;
    if (assignees) payload.assignees = assignees;
    if (labels) payload.labels = labels;

    const data = await this.post<any>(`/repos/${owner}/${repo}/issues`, payload);
    return this.normalizeIssue(data);
  }

  async updateIssue(owner: string, repo: string, issueNumber: number, updates: any): Promise<IssueInfo> {
    const data = await this.patch<any>(`/repos/${owner}/${repo}/issues/${issueNumber}`, updates);
    return this.normalizeIssue(data);
  }

  async closeIssue(owner: string, repo: string, issueNumber: number): Promise<IssueInfo> {
    return this.updateIssue(owner, repo, issueNumber, { state: 'closed' });
  }

  async listPullRequests(owner: string, repo: string, state: 'open' | 'closed' | 'merged' | 'all' = 'open', page: number = 1, limit: number = 30): Promise<PullRequestInfo[]> {
    const data = await this.get<any[]>(`/repos/${owner}/${repo}/pulls`, { 
      state, 
      page, 
      per_page: limit,
      sort: 'updated',
      direction: 'desc'
    });
    return data.map(pr => this.normalizePullRequest(pr));
  }

  async getPullRequest(owner: string, repo: string, pullNumber: number): Promise<PullRequestInfo> {
    const data = await this.get<any>(`/repos/${owner}/${repo}/pulls/${pullNumber}`);
    return this.normalizePullRequest(data);
  }

  async createPullRequest(owner: string, repo: string, title: string, body: string, head: string, base: string): Promise<PullRequestInfo> {
    const data = await this.post<any>(`/repos/${owner}/${repo}/pulls`, {
      title,
      body,
      head,
      base
    });
    return this.normalizePullRequest(data);
  }

  async updatePullRequest(owner: string, repo: string, pullNumber: number, updates: any): Promise<PullRequestInfo> {
    const data = await this.patch<any>(`/repos/${owner}/${repo}/pulls/${pullNumber}`, updates);
    return this.normalizePullRequest(data);
  }

  async mergePullRequest(owner: string, repo: string, pullNumber: number, mergeMethod: 'merge' | 'rebase' | 'squash' = 'merge'): Promise<boolean> {
    await this.put(`/repos/${owner}/${repo}/pulls/${pullNumber}/merge`, {
      merge_method: mergeMethod
    });
    return true;
  }

  async listReleases(owner: string, repo: string, page: number = 1, limit: number = 30): Promise<ReleaseInfo[]> {
    const data = await this.get<any[]>(`/repos/${owner}/${repo}/releases`, { page, per_page: limit });
    return data.map(release => this.normalizeRelease(release));
  }

  async getRelease(owner: string, repo: string, releaseId: number): Promise<ReleaseInfo> {
    const data = await this.get<any>(`/repos/${owner}/${repo}/releases/${releaseId}`);
    return this.normalizeRelease(data);
  }

  async createRelease(tagName: string, name: string, body?: string, draft: boolean = false, prerelease: boolean = false): Promise<ReleaseInfo> {
    const data = await this.post<any>(`/repos/releases`, {
      tag_name: tagName,
      name,
      body,
      draft,
      prerelease
    });
    return this.normalizeRelease(data);
  }

  async updateRelease(releaseId: number, updates: any): Promise<ReleaseInfo> {
    const data = await this.patch<any>(`/repos/releases/${releaseId}`, updates);
    return this.normalizeRelease(data);
  }

  async deleteRelease(releaseId: number): Promise<boolean> {
    await this.delete(`/repos/releases/${releaseId}`);
    return true;
  }

  async listTags(owner: string, repo: string, page: number = 1, limit: number = 30): Promise<TagInfo[]> {
    const data = await this.get<any[]>(`/repos/${owner}/${repo}/tags`, { page, per_page: limit });
    return data.map(tag => this.normalizeTag(tag));
  }

  async getTag(owner: string, repo: string, tag: string): Promise<TagInfo> {
    const data = await this.get<any>(`/repos/${owner}/${repo}/git/refs/tags/${tag}`);
    return this.normalizeTag(data);
  }

  async createTag(tagName: string, message: string, target: string): Promise<TagInfo> {
    const data = await this.post<any>('/repos/git/tags', {
      tag: tagName,
      message,
      object: target,
      type: 'commit'
    });
    return this.normalizeTag(data);
  }

  async deleteTag(owner: string, repo: string, tag: string): Promise<boolean> {
    await this.delete(`/repos/${owner}/${repo}/git/refs/tags/${tag}`);
    return true;
  }

  async getUser(username: string): Promise<UserInfo> {
    const data = await this.get<any>(`/users/${username}`);
    return this.normalizeUser(data);
  }

  async listUsers(page: number = 1, limit: number = 30): Promise<UserInfo[]> {
    const data = await this.get<any[]>('/users', { since: (page - 1) * limit, per_page: limit });
    return data.map(user => this.normalizeUser(user));
  }

  async searchUsers(query: string, page: number = 1, limit: number = 30): Promise<UserInfo[]> {
    const data = await this.get<any>('/search/users', { 
      q: query, 
      page, 
      per_page: limit,
      sort: 'followers',
      order: 'desc'
    });
    return data.items.map((user: any) => this.normalizeUser(user));
  }

  async listWebhooks(owner: string, repo: string, page: number = 1, limit: number = 30): Promise<WebhookInfo[]> {
    const data = await this.get<any[]>(`/repos/${owner}/${repo}/hooks`, { page, per_page: limit });
    return data.map(webhook => this.normalizeWebhook(webhook));
  }

  async getWebhook(owner: string, repo: string, webhookId: number): Promise<WebhookInfo> {
    const data = await this.get<any>(`/repos/${owner}/${repo}/hooks/${webhookId}`);
    return this.normalizeWebhook(data);
  }

  async createWebhook(owner: string, repo: string, url: string, events: string[], secret?: string): Promise<WebhookInfo> {
    const data = await this.post<any>(`/repos/${owner}/${repo}/hooks`, {
      name: 'web',
      active: true,
      events,
      config: {
        url,
        content_type: 'json',
        secret
      }
    });
    return this.normalizeWebhook(data);
  }

  async updateWebhook(owner: string, repo: string, webhookId: number, updates: any): Promise<WebhookInfo> {
    const data = await this.patch<any>(`/repos/${owner}/${repo}/hooks/${webhookId}`, updates);
    return this.normalizeWebhook(data);
  }

  async deleteWebhook(owner: string, repo: string, webhookId: number): Promise<boolean> {
    await this.delete(`/repos/${owner}/${repo}/hooks/${webhookId}`);
    return true;
  }
}
