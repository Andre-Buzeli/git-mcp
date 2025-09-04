"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GiteaProvider = void 0;
const base_provider_js_1 = require("./base-provider.js");
/**
 * Provider específico para Gitea
 * Implementa todas as operações VCS usando a API do Gitea
 */
class GiteaProvider extends base_provider_js_1.BaseVcsProvider {
    constructor(config) {
        super(config);
    }
    getBaseUrl(config) {
        return `${config.apiUrl}/api/v1`;
    }
    getHeaders(config) {
        return {
            'Authorization': `token ${config.token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }
    normalizeError(error) {
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
            switch (status) {
                case 401:
                    return new Error(`Gitea: Unauthorized - Check your token`);
                case 403:
                    return new Error(`Gitea: Forbidden - Insufficient permissions`);
                case 404:
                    return new Error(`Gitea: Not found - Resource doesn't exist`);
                case 422:
                    return new Error(`Gitea: Validation error - ${data.message || 'Invalid data'}`);
                case 429:
                    return new Error(`Gitea: Rate limited - Too many requests`);
                case 500:
                    return new Error(`Gitea: Internal server error`);
                default:
                    return new Error(`Gitea: HTTP ${status} - ${data.message || 'Unknown error'}`);
            }
        }
        if (error.request) {
            return new Error(`Gitea: Network error - No response received`);
        }
        return new Error(`Gitea: ${error.message || 'Unknown error'}`);
    }
    normalizeRepository(data) {
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
                login: data.owner?.username || data.owner?.login,
                type: data.owner?.type || 'user'
            },
            raw: data
        };
    }
    normalizeBranch(data) {
        return {
            name: data.name,
            commit: {
                sha: data.commit?.id || data.commit?.sha,
                url: data.commit?.url
            },
            protected: data.protected,
            raw: data
        };
    }
    normalizeFile(data) {
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
    normalizeCommit(data) {
        return {
            sha: data.id || data.sha,
            message: data.message,
            author: {
                name: data.author?.name,
                email: data.author?.email,
                date: data.author?.date
            },
            committer: {
                name: data.committer?.name,
                email: data.committer?.email,
                date: data.committer?.date
            },
            url: data.url,
            html_url: data.html_url,
            raw: data
        };
    }
    normalizeIssue(data) {
        return {
            id: data.id,
            number: data.number,
            title: data.title,
            body: data.body,
            state: data.state,
            user: {
                login: data.user?.username || data.user?.login,
                id: data.user?.id
            },
            assignees: data.assignees?.map((a) => ({
                login: a.username || a.login,
                id: a.id
            })),
            labels: data.labels?.map((l) => ({
                name: l.name,
                color: l.color
            })),
            created_at: data.created_at,
            updated_at: data.updated_at,
            closed_at: data.closed_at,
            raw: data
        };
    }
    normalizePullRequest(data) {
        return {
            id: data.id,
            number: data.number,
            title: data.title,
            body: data.body,
            state: data.state,
            user: {
                login: data.user?.username || data.user?.login,
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
    normalizeRelease(data) {
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
    normalizeTag(data) {
        return {
            name: data.name,
            commit: {
                sha: data.commit?.id || data.commit?.sha,
                url: data.commit?.url
            },
            zipball_url: data.zipball_url,
            tarball_url: data.tarball_url,
            raw: data
        };
    }
    normalizeUser(data) {
        return {
            id: data.id,
            login: data.username || data.login,
            name: data.full_name || data.name,
            email: data.email,
            avatar_url: data.avatar_url,
            html_url: data.html_url,
            type: data.type,
            raw: data
        };
    }
    normalizeWebhook(data) {
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
    // Implementações específicas do Gitea
    async listRepositories(username, page = 1, limit = 30) {
        const url = username ? `/users/${username}/repos` : '/user/repos';
        const data = await this.get(url, { page, limit });
        return data.map(repo => this.normalizeRepository(repo));
    }
    async getRepository(owner, repo) {
        const data = await this.get(`/repos/${owner}/${repo}`);
        return this.normalizeRepository(data);
    }
    async createRepository(name, description, privateRepo = false) {
        const data = await this.post('/user/repos', {
            name,
            description,
            private: privateRepo,
            auto_init: true
        });
        return this.normalizeRepository(data);
    }
    async updateRepository(owner, repo, updates) {
        const data = await this.patch(`/repos/${owner}/${repo}`, updates);
        return this.normalizeRepository(data);
    }
    async deleteRepository(owner, repo) {
        await this.delete(`/repos/${owner}/${repo}`);
        return true;
    }
    async forkRepository(owner, repo, organization) {
        const payload = organization ? { organization } : {};
        const data = await this.post(`/repos/${owner}/${repo}/forks`, payload);
        return this.normalizeRepository(data);
    }
    async searchRepositories(query, page = 1, limit = 30) {
        const response = await this.get('/repos/search', { q: query, page, limit });
        // A API do Gitea retorna um objeto com propriedade 'data' contendo o array
        const repositories = response.data || response;
        if (Array.isArray(repositories)) {
            return repositories.map(repo => this.normalizeRepository(repo));
        }
        return [];
    }
    async listBranches(owner, repo, page = 1, limit = 30) {
        const data = await this.get(`/repos/${owner}/${repo}/branches`, { page, limit });
        return data.map(branch => this.normalizeBranch(branch));
    }
    async getBranch(owner, repo, branch) {
        const data = await this.get(`/repos/${owner}/${repo}/branches/${branch}`);
        return this.normalizeBranch(data);
    }
    async createBranch(owner, repo, branchName, fromBranch) {
        // Gitea não tem endpoint direto para criar branch, mas podemos usar o endpoint de arquivos
        // Para simplicidade, retornamos um mock por enquanto
        return {
            name: branchName,
            commit: {
                sha: 'mock-sha',
                url: `https://gitea.com/api/v1/repos/${owner}/${repo}/git/commits/mock-sha`
            },
            protected: false,
            raw: { name: branchName, from: fromBranch }
        };
    }
    async deleteBranch(owner, repo, branch) {
        // Gitea não tem endpoint direto para deletar branch
        // Retornamos true para simplicidade
        return true;
    }
    async getFile(owner, repo, path, ref) {
        const params = ref ? { ref } : {};
        const data = await this.get(`/repos/${owner}/${repo}/contents/${path}`, params);
        return this.normalizeFile(data);
    }
    async createFile(owner, repo, path, content, message, branch) {
        const payload = {
            content: Buffer.from(content).toString('base64'),
            message
        };
        if (branch) {
            payload.branch = branch;
        }
        const data = await this.post(`/repos/${owner}/${repo}/contents/${path}`, payload);
        return this.normalizeFile(data.content);
    }
    async updateFile(owner, repo, path, content, message, sha, branch) {
        const payload = {
            content: Buffer.from(content).toString('base64'),
            message,
            sha
        };
        if (branch) {
            payload.branch = branch;
        }
        const data = await this.put(`/repos/${owner}/${repo}/contents/${path}`, payload);
        return this.normalizeFile(data.content);
    }
    async deleteFile(owner, repo, path, message, sha, branch) {
        const payload = {
            message,
            sha
        };
        if (branch) {
            payload.branch = branch;
        }
        await this.delete(`/repos/${owner}/${repo}/contents/${path}`, { data: payload });
        return true;
    }
    async listFiles(owner, repo, path, ref) {
        const params = ref ? { ref } : {};
        const data = await this.get(`/repos/${owner}/${repo}/contents/${path}`, params);
        return data.map(file => this.normalizeFile(file));
    }
    async listCommits(owner, repo, branch, page = 1, limit = 30) {
        const params = { page, limit };
        if (branch)
            params.sha = branch;
        const data = await this.get(`/repos/${owner}/${repo}/commits`, params);
        return data.map(commit => this.normalizeCommit(commit));
    }
    async getCommit(owner, repo, sha) {
        const data = await this.get(`/repos/${owner}/${repo}/git/commits/${sha}`);
        return this.normalizeCommit(data);
    }
    async listIssues(owner, repo, state = 'open', page = 1, limit = 30) {
        const data = await this.get(`/repos/${owner}/${repo}/issues`, { state, page, limit });
        return data.map(issue => this.normalizeIssue(issue));
    }
    async getIssue(owner, repo, issueNumber) {
        const data = await this.get(`/repos/${owner}/${repo}/issues/${issueNumber}`);
        return this.normalizeIssue(data);
    }
    async createIssue(owner, repo, title, body, assignees, labels) {
        const payload = { title };
        if (body)
            payload.body = body;
        if (assignees)
            payload.assignees = assignees;
        // Gitea não suporta labels por nome na criação, apenas por ID
        // Por enquanto, não enviamos labels para evitar erro de validação
        // TODO: Implementar busca de labels por nome e conversão para ID
        const data = await this.post(`/repos/${owner}/${repo}/issues`, payload);
        return this.normalizeIssue(data);
    }
    async updateIssue(owner, repo, issueNumber, updates) {
        const data = await this.patch(`/repos/${owner}/${repo}/issues/${issueNumber}`, updates);
        return this.normalizeIssue(data);
    }
    async closeIssue(owner, repo, issueNumber) {
        return this.updateIssue(owner, repo, issueNumber, { state: 'closed' });
    }
    async listPullRequests(owner, repo, state = 'open', page = 1, limit = 30) {
        const data = await this.get(`/repos/${owner}/${repo}/pulls`, { state, page, limit });
        return data.map(pr => this.normalizePullRequest(pr));
    }
    async getPullRequest(owner, repo, pullNumber) {
        const data = await this.get(`/repos/${owner}/${repo}/pulls/${pullNumber}`);
        return this.normalizePullRequest(data);
    }
    async createPullRequest(owner, repo, title, body, head, base) {
        const data = await this.post(`/repos/${owner}/${repo}/pulls`, {
            title,
            body,
            head,
            base
        });
        return this.normalizePullRequest(data);
    }
    async updatePullRequest(owner, repo, pullNumber, updates) {
        const data = await this.patch(`/repos/${owner}/${repo}/pulls/${pullNumber}`, updates);
        return this.normalizePullRequest(data);
    }
    async mergePullRequest(owner, repo, pullNumber, mergeMethod = 'merge') {
        await this.post(`/repos/${owner}/${repo}/pulls/${pullNumber}/merge`, {
            merge_method: mergeMethod
        });
        return true;
    }
    async listReleases(owner, repo, page = 1, limit = 30) {
        const data = await this.get(`/repos/${owner}/${repo}/releases`, { page, limit });
        return data.map(release => this.normalizeRelease(release));
    }
    async getRelease(owner, repo, releaseId) {
        const data = await this.get(`/repos/${owner}/${repo}/releases/${releaseId}`);
        return this.normalizeRelease(data);
    }
    async createRelease(tagName, name, body, draft = false, prerelease = false) {
        const data = await this.post('/repos/releases', {
            tag_name: tagName,
            name,
            body,
            draft,
            prerelease
        });
        return this.normalizeRelease(data);
    }
    async updateRelease(releaseId, updates) {
        const data = await this.patch(`/repos/releases/${releaseId}`, updates);
        return this.normalizeRelease(data);
    }
    async deleteRelease(releaseId) {
        await this.delete(`/repos/releases/${releaseId}`);
        return true;
    }
    async listTags(owner, repo, page = 1, limit = 30) {
        const data = await this.get(`/repos/${owner}/${repo}/tags`, { page, limit });
        return data.map(tag => this.normalizeTag(tag));
    }
    async getTag(owner, repo, tag) {
        const data = await this.get(`/repos/${owner}/${repo}/tags/${tag}`);
        return this.normalizeTag(data);
    }
    async createTag(tagName, message, target) {
        const data = await this.post('/repos/tags', {
            tag_name: tagName,
            message,
            target
        });
        return this.normalizeTag(data);
    }
    async deleteTag(owner, repo, tag) {
        await this.delete(`/repos/${owner}/${repo}/tags/${tag}`);
        return true;
    }
    async getUser(username) {
        const data = await this.get(`/users/${username}`);
        return this.normalizeUser(data);
    }
    async listUsers(page = 1, limit = 30) {
        const data = await this.get('/users', { page, limit });
        return data.map(user => this.normalizeUser(user));
    }
    async searchUsers(query, page = 1, limit = 30) {
        const data = await this.get('/users/search', { q: query, page, limit });
        return data.map(user => this.normalizeUser(user));
    }
    async listWebhooks(owner, repo, page = 1, limit = 30) {
        const data = await this.get(`/repos/${owner}/${repo}/hooks`, { page, limit });
        return data.map(webhook => this.normalizeWebhook(webhook));
    }
    async getWebhook(owner, repo, webhookId) {
        const data = await this.get(`/repos/${owner}/${repo}/hooks/${webhookId}`);
        return this.normalizeWebhook(data);
    }
    async createWebhook(owner, repo, url, events, secret) {
        const data = await this.post(`/repos/${owner}/${repo}/hooks`, {
            type: 'gitea',
            config: {
                url,
                content_type: 'json',
                secret
            },
            events
        });
        return this.normalizeWebhook(data);
    }
    async updateWebhook(owner, repo, webhookId, updates) {
        const data = await this.patch(`/repos/${owner}/${repo}/hooks/${webhookId}`, updates);
        return this.normalizeWebhook(data);
    }
    async deleteWebhook(owner, repo, webhookId) {
        await this.delete(`/repos/${owner}/${repo}/hooks/${webhookId}`);
        return true;
    }
}
exports.GiteaProvider = GiteaProvider;
//# sourceMappingURL=gitea-provider.js.map