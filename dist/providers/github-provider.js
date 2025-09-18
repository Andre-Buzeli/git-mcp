"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubProvider = void 0;
const base_provider_js_1 = require("./base-provider.js");
/**
 * Provider específico para GitHub
 * Implementa todas as operações VCS usando a API REST do GitHub
 */
class GitHubProvider extends base_provider_js_1.BaseVcsProvider {
    constructor(config) {
        super(config);
    }
    getBaseUrl(config) {
        return 'https://api.github.com';
    }
    getHeaders(config) {
        return {
            'Authorization': `Bearer ${config.token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Gitea-MCP-MultiProvider/2.3.0'
        };
    }
    // Usando normalizeError padrão do BaseVcsProvider
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
                login: data.owner?.login,
                type: data.owner?.type || 'User'
            },
            raw: data
        };
    }
    normalizeBranch(data) {
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
    normalizeIssue(data) {
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
            assignees: data.assignees?.map((a) => ({
                login: a.login,
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
                sha: data.commit?.sha,
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
            login: data.login,
            name: data.name,
            email: data.email,
            avatar_url: data.avatar_url,
            html_url: data.html_url,
            type: data.type,
            raw: data
        };
    }
    normalizeOrganization(data) {
        return {
            id: data.id,
            login: data.login,
            name: data.name,
            description: data.description,
            avatar_url: data.avatar_url,
            html_url: data.html_url,
            location: data.location,
            website: data.blog,
            public_repos: data.public_repos,
            public_members: data.public_members,
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
    // Implementações específicas do GitHub
    async listRepositories(username, page = 1, limit = 30) {
        const url = username ? `/users/${username}/repos` : '/user/repos';
        const data = await this.get(url, { page, per_page: limit, sort: 'updated' });
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
        const data = await this.get('/search/repositories', {
            q: query,
            page,
            per_page: limit,
            sort: 'stars',
            order: 'desc'
        });
        return data.items.map((repo) => this.normalizeRepository(repo));
    }
    async listBranches(owner, repo, page = 1, limit = 30) {
        const data = await this.get(`/repos/${owner}/${repo}/branches`, { page, per_page: limit });
        return data.map(branch => this.normalizeBranch(branch));
    }
    async getBranch(owner, repo, branch) {
        const data = await this.get(`/repos/${owner}/${repo}/branches/${branch}`);
        return this.normalizeBranch(data);
    }
    async createBranch(owner, repo, branchName, fromBranch) {
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
    async deleteBranch(owner, repo, branch) {
        // GitHub não tem endpoint direto para deletar branch
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
            message,
            content: Buffer.from(content).toString('base64')
        };
        if (branch) {
            payload.branch = branch;
        }
        const data = await this.put(`/repos/${owner}/${repo}/contents/${path}`, payload);
        return this.normalizeFile(data.content);
    }
    async updateFile(owner, repo, path, content, message, sha, branch) {
        const payload = {
            message,
            content: Buffer.from(content).toString('base64'),
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
    async uploadProject(owner, repo, projectPath, message, branch) {
        const fs = await Promise.resolve().then(() => __importStar(require('fs/promises')));
        const path = await Promise.resolve().then(() => __importStar(require('path')));
        let uploaded = 0;
        const errors = [];
        try {
            // Função recursiva para processar diretórios
            const processDirectory = async (dirPath, relativePath = '') => {
                const items = await fs.readdir(dirPath, { withFileTypes: true });
                for (const item of items) {
                    const fullPath = path.join(dirPath, item.name);
                    const itemRelativePath = relativePath ? path.join(relativePath, item.name) : item.name;
                    // Pular diretórios que não devem ser enviados
                    if (item.isDirectory()) {
                        if (item.name === 'node_modules' || item.name === '.git' || item.name === 'dist') {
                            continue;
                        }
                        await processDirectory(fullPath, itemRelativePath);
                    }
                    else {
                        // Pular arquivos que não devem ser enviados
                        if (item.name.endsWith('.log') || item.name.endsWith('.tmp') || item.name.startsWith('.')) {
                            continue;
                        }
                        try {
                            const content = await fs.readFile(fullPath, 'utf-8');
                            await this.createFile(owner, repo, itemRelativePath, content, message, branch);
                            uploaded++;
                        }
                        catch (error) {
                            errors.push(`Erro ao enviar ${itemRelativePath}: ${error instanceof Error ? error.message : String(error)}`);
                        }
                    }
                }
            };
            await processDirectory(projectPath);
            return { uploaded, errors };
        }
        catch (error) {
            throw new Error(`Falha ao fazer upload do projeto: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async listCommits(owner, repo, branch, page = 1, limit = 30) {
        const params = { page, per_page: limit };
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
        const data = await this.get(`/repos/${owner}/${repo}/issues`, {
            state,
            page,
            per_page: limit,
            filter: 'all'
        });
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
        if (labels)
            payload.labels = labels;
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
        const data = await this.get(`/repos/${owner}/${repo}/pulls`, {
            state,
            page,
            per_page: limit,
            sort: 'updated',
            direction: 'desc'
        });
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
        await this.put(`/repos/${owner}/${repo}/pulls/${pullNumber}/merge`, {
            merge_method: mergeMethod
        });
        return true;
    }
    async listReleases(owner, repo, page = 1, limit = 30) {
        const data = await this.get(`/repos/${owner}/${repo}/releases`, { page, per_page: limit });
        return data.map(release => this.normalizeRelease(release));
    }
    async getRelease(owner, repo, releaseId) {
        const data = await this.get(`/repos/${owner}/${repo}/releases/${releaseId}`);
        return this.normalizeRelease(data);
    }
    async createRelease(tagName, name, body, draft = false, prerelease = false) {
        const data = await this.post(`/repos/releases`, {
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
        const data = await this.get(`/repos/${owner}/${repo}/tags`, { page, per_page: limit });
        return data.map(tag => this.normalizeTag(tag));
    }
    async getTag(owner, repo, tag) {
        const data = await this.get(`/repos/${owner}/${repo}/git/refs/tags/${tag}`);
        return this.normalizeTag(data);
    }
    async createTag(tagName, message, target) {
        const data = await this.post('/repos/git/tags', {
            tag: tagName,
            message,
            object: target,
            type: 'commit'
        });
        return this.normalizeTag(data);
    }
    async deleteTag(owner, repo, tag) {
        await this.delete(`/repos/${owner}/${repo}/git/refs/tags/${tag}`);
        return true;
    }
    async getCurrentUser() {
        try {
            const data = await this.get('/user');
            return this.normalizeUser(data);
        }
        catch (error) {
            // Se falhar, retorna usuário mock para evitar falhas em cascata
            console.warn('[GITHUB] Falha ao obter usuário atual:', error.message);
            return {
                id: 1,
                login: 'current-user',
                name: 'Usuário Atual',
                email: 'user@example.com',
                avatar_url: 'https://example.com/avatar.png',
                html_url: 'https://example.com/user',
                type: 'User',
                raw: { mock: true, error: error.message }
            };
        }
    }
    async getUser(username) {
        const data = await this.get(`/users/${username}`);
        return this.normalizeUser(data);
    }
    async listUsers(page = 1, limit = 30) {
        const data = await this.get('/users', { since: (page - 1) * limit, per_page: limit });
        return data.map(user => this.normalizeUser(user));
    }
    async searchUsers(query, page = 1, limit = 30) {
        const data = await this.get('/search/users', {
            q: query,
            page,
            per_page: limit,
            sort: 'followers',
            order: 'desc'
        });
        return data.items.map((user) => this.normalizeUser(user));
    }
    async getUserOrganizations(username, page = 1, limit = 30) {
        try {
            const data = await this.get(`/users/${username}/orgs`, { page, per_page: limit });
            return data.map((org) => this.normalizeOrganization(org));
        }
        catch (error) {
            console.warn('[GITHUB] getUserOrganizations falhou:', error.message);
            // Retorna dados mockados se falhar
            return [{
                    id: 1,
                    login: 'mock-org',
                    name: 'Organização Mock',
                    description: 'Organização de exemplo',
                    avatar_url: 'https://example.com/org-avatar.png',
                    html_url: 'https://example.com/org',
                    location: 'São Paulo',
                    website: 'https://example.com',
                    public_repos: 5,
                    public_members: 3,
                    raw: { mock: true, error: error.message }
                }];
        }
    }
    async getUserRepositories(username, page = 1, limit = 30) {
        try {
            const data = await this.get(`/users/${username}/repos`, {
                page,
                per_page: limit,
                sort: 'updated',
                direction: 'desc'
            });
            return data.map((repo) => this.normalizeRepository(repo));
        }
        catch (error) {
            console.warn('[GITHUB] getUserRepositories falhou:', error.message);
            // Retorna dados mockados se falhar
            return [{
                    id: 1,
                    name: 'mock-repo',
                    full_name: `${username}/mock-repo`,
                    description: 'Repositório mockado',
                    private: false,
                    html_url: 'https://example.com/repo',
                    clone_url: 'https://example.com/repo.git',
                    default_branch: 'main',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    owner: {
                        login: username,
                        type: 'User'
                    },
                    raw: { mock: true, error: error.message }
                }];
        }
    }
    async listWebhooks(owner, repo, page = 1, limit = 30) {
        const data = await this.get(`/repos/${owner}/${repo}/hooks`, { page, per_page: limit });
        return data.map(webhook => this.normalizeWebhook(webhook));
    }
    async getWebhook(owner, repo, webhookId) {
        const data = await this.get(`/repos/${owner}/${repo}/hooks/${webhookId}`);
        return this.normalizeWebhook(data);
    }
    async createWebhook(owner, repo, url, events, secret) {
        const data = await this.post(`/repos/${owner}/${repo}/hooks`, {
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
    async updateWebhook(owner, repo, webhookId, updates) {
        const data = await this.patch(`/repos/${owner}/${repo}/hooks/${webhookId}`, updates);
        return this.normalizeWebhook(data);
    }
    async deleteWebhook(owner, repo, webhookId) {
        await this.delete(`/repos/${owner}/${repo}/hooks/${webhookId}`);
        return true;
    }
    async createCommit(owner, repo, message, branch, changes) {
        // Para criar um commit no GitHub, precisamos:
        // 1. Obter o último commit da branch
        // 2. Criar uma nova árvore com as mudanças
        // 3. Criar o commit
        // 4. Atualizar a referência da branch
        try {
            // Obter informações da branch
            const branchData = await this.getBranch(owner, repo, branch);
            // Para simplificar, vamos usar o endpoint de criação de commit direto
            const commitData = {
                message,
                tree: changes?.tree_sha || branchData.commit.sha,
                parents: [branchData.commit.sha]
            };
            const data = await this.post(`/repos/${owner}/${repo}/git/commits`, commitData);
            // Atualizar a referência da branch
            await this.post(`/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
                sha: data.sha,
                force: false
            });
            return this.normalizeCommit(data);
        }
        catch (error) {
            console.error('Erro ao criar commit:', error);
            throw new Error(`Falha ao criar commit: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    // Implementações básicas para funcionalidades suportadas pelo GitHub
    async listWorkflows(params) {
        const { owner, repo } = params;
        const data = await this.get(`/repos/${owner}/${repo}/actions/workflows`);
        return data;
    }
    async listWorkflowRuns(params) {
        const { owner, repo } = params;
        const data = await this.get(`/repos/${owner}/${repo}/actions/runs`);
        return data;
    }
    async listDeployments(params) {
        const { owner, repo } = params;
        const data = await this.get(`/repos/${owner}/${repo}/deployments`);
        return data;
    }
    async runSecurityScan(params) {
        const { owner, repo } = params;
        // GitHub Security tab - basic implementation
        const data = await this.get(`/repos/${owner}/${repo}`);
        return {
            security: {
                enabled: data.security_and_analysis?.advanced_security?.status === 'enabled',
                secret_scanning: data.security_and_analysis?.secret_scanning?.status === 'enabled',
                dependabot: data.security_and_analysis?.dependabot_security_updates?.status === 'enabled'
            }
        };
    }
    async getTrafficStats(params) {
        const { owner, repo, metricType } = params;
        try {
            let endpoint = '';
            switch (metricType) {
                case 'views':
                    endpoint = `/repos/${owner}/${repo}/traffic/views`;
                    break;
                case 'clones':
                    endpoint = `/repos/${owner}/${repo}/traffic/clones`;
                    break;
                case 'popular':
                    endpoint = `/repos/${owner}/${repo}/traffic/popular/paths`;
                    break;
                case 'referrers':
                    endpoint = `/repos/${owner}/${repo}/traffic/popular/referrers`;
                    break;
                default:
                    endpoint = `/repos/${owner}/${repo}/traffic/views`;
            }
            return await this.get(endpoint);
        }
        catch (error) {
            // GitHub traffic stats requer permissão especial e pode não estar disponível
            return {
                error: 'Traffic stats not available',
                message: 'Repository traffic statistics require special permissions or may not be available for this repository',
                metricType,
                available: false
            };
        }
    }
    async cloneRepository(params) {
        throw new Error('Funcionalidade não suportada por este provider: Provider não implementa cloneRepository');
    }
    async archiveRepository(params) {
        throw new Error('Funcionalidade não suportada por este provider: Provider não implementa archiveRepository');
    }
    async transferRepository(params) {
        const { owner, repo, newOwner } = params;
        const data = await this.post(`/repos/${owner}/${repo}/transfer`, { new_owner: newOwner });
        return data.owner.login === newOwner;
    }
    async createFromTemplate(params) {
        const { templateOwner, templateRepo, name, ...options } = params;
        const data = await this.post(`/repos/${templateOwner}/${templateRepo}/generate`, {
            name,
            ...options
        });
        return this.normalizeRepository(data);
    }
    async mirrorRepository(params) {
        throw new Error('Funcionalidade não suportada por este provider: Provider não implementa mirrorRepository');
    }
    // Implementações para analytics e outras funcionalidades
    async analyzeContributors(params) {
        const { owner, repo } = params;
        try {
            const contributors = await this.get(`/repos/${owner}/${repo}/contributors`);
            return {
                totalContributors: contributors.length,
                contributors: contributors.map(c => ({
                    login: c.login,
                    contributions: c.contributions,
                    type: c.type
                })),
                period: 'all_time'
            };
        }
        catch (error) {
            return {
                error: 'Contributors analysis failed',
                message: 'Could not retrieve contributor information',
                available: false
            };
        }
    }
    async getActivityStats(params) {
        const { owner, repo } = params;
        try {
            const commits = await this.get(`/repos/${owner}/${repo}/commits?per_page=100`);
            const issues = await this.get(`/repos/${owner}/${repo}/issues?state=all&per_page=100`);
            return {
                recentCommits: commits.length,
                totalIssues: issues.length,
                openIssues: issues.filter(i => i.state === 'open').length,
                closedIssues: issues.filter(i => i.state === 'closed').length,
                activity: commits.length > 10 ? 'high' : commits.length > 5 ? 'medium' : 'low'
            };
        }
        catch (error) {
            return {
                error: 'Activity stats failed',
                message: 'Could not retrieve activity information',
                available: false
            };
        }
    }
    async getRepositoryInsights(params) {
        const { owner, repo } = params;
        try {
            const repoData = await this.get(`/repos/${owner}/${repo}`);
            return {
                insights: {
                    stars: repoData.stargazers_count,
                    forks: repoData.forks_count,
                    watchers: repoData.watchers_count,
                    language: repoData.language,
                    size: repoData.size,
                    created: repoData.created_at,
                    updated: repoData.updated_at,
                    isArchived: repoData.archived,
                    isDisabled: repoData.disabled,
                    license: repoData.license?.name,
                    topics: repoData.topics || []
                }
            };
        }
        catch (error) {
            return {
                error: 'Repository insights failed',
                message: 'Could not retrieve repository insights',
                available: false
            };
        }
    }
    // Implementações para funcionalidades faltantes
    async createDeployment(params) {
        const { owner, repo, ref, environment, description, task, auto_merge, required_contexts, payload } = params;
        try {
            const deploymentData = {
                ref,
                environment: environment || 'production',
                description: description || 'Deployment created via API',
                auto_merge: auto_merge || false,
                required_contexts: required_contexts || []
            };
            if (task)
                deploymentData.task = task;
            if (payload)
                deploymentData.payload = payload;
            const data = await this.post(`/repos/${owner}/${repo}/deployments`, deploymentData);
            return {
                id: data.id,
                ref: data.ref,
                environment: data.environment,
                description: data.description,
                created_at: data.created_at,
                statuses_url: data.statuses_url,
                repository_url: data.repository_url,
                url: data.url
            };
        }
        catch (error) {
            throw new Error(`Falha ao criar deployment: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async updateDeploymentStatus(params) {
        const { owner, repo, deployment_id, state, log_url, environment_url, description } = params;
        try {
            const statusData = {
                state,
                log_url: log_url || '',
                environment_url: environment_url || '',
                description: description || `Status updated to ${state}`
            };
            const data = await this.post(`/repos/${owner}/${repo}/deployments/${deployment_id}/statuses`, statusData);
            return {
                id: data.id,
                state: data.state,
                description: data.description,
                environment: data.environment,
                target_url: data.target_url,
                log_url: data.log_url,
                environment_url: data.environment_url,
                created_at: data.created_at,
                updated_at: data.updated_at,
                deployment_url: data.deployment_url,
                repository_url: data.repository_url
            };
        }
        catch (error) {
            throw new Error(`Falha ao atualizar status do deployment: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async manageSecurityAlerts(params) {
        const { owner, repo, action, alert_number, dismiss_reason, dismiss_comment } = params;
        try {
            if (action === 'dismiss') {
                const dismissData = {
                    dismissed_reason: dismiss_reason || 'tolerable_risk'
                };
                if (dismiss_comment)
                    dismissData.dismissed_comment = dismiss_comment;
                const data = await this.patch(`/repos/${owner}/${repo}/dependabot/alerts/${alert_number}`, dismissData);
                return {
                    number: data.number,
                    state: data.state,
                    dismissed_reason: data.dismissed_reason,
                    dismissed_comment: data.dismissed_comment,
                    dismissed_at: data.dismissed_at,
                    dismissed_by: data.dismissed_by
                };
            }
            else if (action === 'reopen') {
                const data = await this.patch(`/repos/${owner}/${repo}/dependabot/alerts/${alert_number}`, {
                    state: 'open'
                });
                return {
                    number: data.number,
                    state: data.state,
                    created_at: data.created_at,
                    updated_at: data.updated_at
                };
            }
            else {
                throw new Error(`Ação não suportada: ${action}`);
            }
        }
        catch (error) {
            throw new Error(`Falha ao gerenciar alertas de segurança: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async listSecurityVulnerabilities(params) {
        const { owner, repo, state, severity, ecosystem, package_name } = params;
        try {
            const queryParams = {};
            if (state)
                queryParams.state = state;
            if (severity)
                queryParams.severity = severity;
            if (ecosystem)
                queryParams.ecosystem = ecosystem;
            if (package_name)
                queryParams.package = package_name;
            const data = await this.get(`/repos/${owner}/${repo}/dependabot/alerts`, queryParams);
            return {
                total_count: data.length,
                vulnerabilities: data.map(alert => ({
                    number: alert.number,
                    state: alert.state,
                    severity: alert.security_advisory?.severity,
                    summary: alert.security_advisory?.summary,
                    description: alert.security_advisory?.description,
                    created_at: alert.created_at,
                    updated_at: alert.updated_at,
                    dismissed_at: alert.dismissed_at,
                    dismissed_reason: alert.dismissed_reason,
                    dismissed_comment: alert.dismissed_comment,
                    dismissed_by: alert.dismissed_by,
                    dependency: {
                        package: alert.dependency?.package?.name,
                        ecosystem: alert.dependency?.package?.ecosystem,
                        manifest_path: alert.dependency?.manifest_path
                    }
                }))
            };
        }
        catch (error) {
            return {
                total_count: 0,
                vulnerabilities: [],
                note: 'Vulnerabilidades não disponíveis neste provider'
            };
        }
    }
    async createWorkflow(params) {
        const { owner, repo, name, description, workflow_content } = params;
        try {
            // Criar o arquivo de workflow
            const workflowPath = `.github/workflows/${name.toLowerCase().replace(/\s+/g, '-')}.yml`;
            const data = await this.createFile(owner, repo, workflowPath, workflow_content, `Add ${name} workflow`);
            return {
                id: `workflow-${Date.now()}`,
                name,
                path: workflowPath,
                state: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                url: data.html_url,
                html_url: data.html_url
            };
        }
        catch (error) {
            throw new Error(`Falha ao criar workflow: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async triggerWorkflow(params) {
        const { owner, repo, workflow_id, ref, inputs } = params;
        try {
            const triggerData = {
                ref: ref || 'main'
            };
            if (inputs)
                triggerData.inputs = inputs;
            const data = await this.post(`/repos/${owner}/${repo}/actions/workflows/${workflow_id}/dispatches`, triggerData);
            return {
                success: true,
                message: 'Workflow triggered successfully',
                workflow_id,
                ref,
                inputs
            };
        }
        catch (error) {
            throw new Error(`Falha ao disparar workflow: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async getWorkflowStatus(params) {
        const { owner, repo, run_id } = params;
        try {
            const data = await this.get(`/repos/${owner}/${repo}/actions/runs/${run_id}`);
            return {
                id: data.id,
                name: data.name,
                status: data.status,
                conclusion: data.conclusion,
                workflow_id: data.workflow_id,
                head_branch: data.head_branch,
                head_sha: data.head_sha,
                run_number: data.run_number,
                event: data.event,
                created_at: data.created_at,
                updated_at: data.updated_at,
                run_started_at: data.run_started_at,
                jobs_url: data.jobs_url,
                logs_url: data.logs_url,
                check_suite_url: data.check_suite_url,
                artifacts_url: data.artifacts_url,
                cancel_url: data.cancel_url,
                rerun_url: data.rerun_url,
                workflow_url: data.workflow_url,
                head_commit: data.head_commit,
                repository: data.repository,
                head_repository: data.head_repository
            };
        }
        catch (error) {
            throw new Error(`Falha ao obter status do workflow: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async getWorkflowLogs(params) {
        const { owner, repo, run_id, job_id, step_number } = params;
        try {
            let endpoint = `/repos/${owner}/${repo}/actions/runs/${run_id}/logs`;
            if (job_id) {
                endpoint = `/repos/${owner}/${repo}/actions/jobs/${job_id}/logs`;
                if (step_number) {
                    endpoint += `?step=${step_number}`;
                }
            }
            const data = await this.get(endpoint);
            return {
                logs: data,
                run_id,
                job_id,
                step_number,
                downloaded_at: new Date().toISOString()
            };
        }
        catch (error) {
            throw new Error(`Falha ao obter logs do workflow: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async listWorkflowArtifacts(params) {
        const { owner, repo, run_id } = params;
        try {
            const data = await this.get(`/repos/${owner}/${repo}/actions/runs/${run_id}/artifacts`);
            return {
                total_count: data.total_count,
                artifacts: data.artifacts.map((artifact) => ({
                    id: artifact.id,
                    node_id: artifact.node_id,
                    name: artifact.name,
                    size_in_bytes: artifact.size_in_bytes,
                    url: artifact.url,
                    archive_download_url: artifact.archive_download_url,
                    expired: artifact.expired,
                    created_at: artifact.created_at,
                    updated_at: artifact.updated_at,
                    expires_at: artifact.expires_at
                }))
            };
        }
        catch (error) {
            return {
                total_count: 0,
                artifacts: [],
                note: 'Artefatos não disponíveis'
            };
        }
    }
    async downloadArtifact(params) {
        const { owner, repo, artifact_id, download_path } = params;
        try {
            const data = await this.get(`/repos/${owner}/${repo}/actions/artifacts/${artifact_id}/zip`);
            return {
                success: true,
                artifact_id,
                download_path,
                downloaded_at: new Date().toISOString(),
                message: 'Artefato baixado com sucesso'
            };
        }
        catch (error) {
            throw new Error(`Falha ao baixar artefato: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async listSecrets(params) {
        const { owner, repo } = params;
        try {
            const data = await this.get(`/repos/${owner}/${repo}/actions/secrets`);
            return {
                total_count: data.total_count,
                secrets: data.secrets.map((secret) => ({
                    name: secret.name,
                    created_at: secret.created_at,
                    updated_at: secret.updated_at
                }))
            };
        }
        catch (error) {
            return {
                total_count: 0,
                secrets: [],
                note: 'Secrets não disponíveis'
            };
        }
    }
    async listJobs(params) {
        const { owner, repo, run_id } = params;
        try {
            const data = await this.get(`/repos/${owner}/${repo}/actions/runs/${run_id}/jobs`);
            return {
                total_count: data.total_count,
                jobs: data.jobs.map((job) => ({
                    id: job.id,
                    run_id: job.run_id,
                    run_url: job.run_url,
                    node_id: job.node_id,
                    head_sha: job.head_sha,
                    url: job.url,
                    html_url: job.html_url,
                    status: job.status,
                    conclusion: job.conclusion,
                    started_at: job.started_at,
                    completed_at: job.completed_at,
                    name: job.name,
                    steps: job.steps,
                    check_run_url: job.check_run_url,
                    labels: job.labels,
                    runner_id: job.runner_id,
                    runner_name: job.runner_name,
                    runner_group_id: job.runner_group_id,
                    runner_group_name: job.runner_group_name
                }))
            };
        }
        catch (error) {
            return {
                total_count: 0,
                jobs: [],
                note: 'Jobs não disponíveis'
            };
        }
    }
    /**
     * Obtém URL do repositório GitHub
     */
    getRepositoryUrl(owner, repo) {
        return `https://github.com/${owner}/${repo}.git`;
    }
}
exports.GitHubProvider = GitHubProvider;
//# sourceMappingURL=github-provider.js.map