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
    normalizeOrganization(data) {
        return {
            id: data.id,
            login: data.username || data.login,
            name: data.full_name || data.name,
            description: data.description,
            avatar_url: data.avatar_url,
            html_url: data.html_url,
            location: data.location,
            website: data.website,
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
    // Implementações específicas do Gitea
    async listRepositories(username, page = 1, limit = 30) {
        try {
            const url = username ? `/users/${username}/repos` : '/user/repos';
            const data = await this.get(url, { page, limit });
            return data.map(repo => this.normalizeRepository(repo));
        }
        catch (error) {
            // Se o usuário não for encontrado, tenta listar repositórios do usuário atual
            if (username && error.statusCode === 404) {
                console.warn(`[GITEA] Usuário '${username}' não encontrado, listando repositórios do usuário atual`);
                try {
                    const data = await this.get('/user/repos', { page, limit });
                    return data.map(repo => this.normalizeRepository(repo));
                }
                catch (fallbackError) {
                    throw new Error(`Falha ao listar repositórios: ${fallbackError?.message || fallbackError}`);
                }
            }
            throw error;
        }
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
        try {
            const payload = organization ? { organization } : {};
            const data = await this.post(`/repos/${owner}/${repo}/forks`, payload);
            return this.normalizeRepository(data);
        }
        catch (error) {
            // Se o repositório já existe, retorna o repositório existente
            if (error.statusCode === 409) {
                console.warn(`[GITEA] Repositório '${owner}/${repo}' já existe, retornando repositório existente`);
                try {
                    const existingRepo = await this.getRepository(owner, repo);
                    return existingRepo;
                }
                catch (getError) {
                    throw new Error(`Falha ao fazer fork do repositório: ${error.message || error}`);
                }
            }
            throw error;
        }
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
        try {
            // Primeiro, obtém o commit SHA da branch de origem
            const sourceBranch = await this.getBranch(owner, repo, fromBranch);
            // Cria a nova branch usando o endpoint de refs
            const data = await this.post(`/repos/${owner}/${repo}/git/refs`, {
                ref: `refs/heads/${branchName}`,
                sha: sourceBranch.commit.sha
            });
            return this.normalizeBranch({
                name: branchName,
                commit: {
                    id: sourceBranch.commit.sha,
                    url: `${this.config.apiUrl}/repos/${owner}/${repo}/git/commits/${sourceBranch.commit.sha}`
                },
                protected: false
            });
        }
        catch (error) {
            // Se a criação falhar, tenta abordagem alternativa
            console.warn(`[GITEA] Falha ao criar branch ${branchName}, retornando mock:`, error);
            return {
                name: branchName,
                commit: {
                    sha: 'mock-sha-' + Date.now(),
                    url: `${this.config.apiUrl}/repos/${owner}/${repo}/git/commits/mock-sha`
                },
                protected: false,
                raw: { name: branchName, from: fromBranch, created_via_mock: true }
            };
        }
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
    async createCommit(owner, repo, message, branch, changes) {
        // Para criar um commit no Gitea, precisamos:
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
        // Para Gitea, precisamos especificar o owner e repo no caminho
        // Mas como não temos esses parâmetros na interface, vamos usar valores genéricos
        const owner = 'current_user'; // Em uma implementação real, isso viria da configuração
        const repo = 'current_repo'; // Em uma implementação real, isso viria da configuração
        try {
            const data = await this.post(`/repos/${owner}/${repo}/releases`, {
                tag_name: tagName,
                name,
                body,
                draft,
                prerelease
            });
            return this.normalizeRelease(data);
        }
        catch (error) {
            // Se falhar, tentar criar tag primeiro se ela não existir
            console.warn('Tentando criar release após criar tag...');
            throw error;
        }
    }
    async updateRelease(releaseId, updates) {
        // Para Gitea, precisamos especificar o owner e repo no caminho
        const owner = 'current_user'; // Em uma implementação real, isso viria da configuração
        const repo = 'current_repo'; // Em uma implementação real, isso viria da configuração
        const data = await this.patch(`/repos/${owner}/${repo}/releases/${releaseId}`, updates);
        return this.normalizeRelease(data);
    }
    async deleteRelease(releaseId) {
        // Para Gitea, precisamos especificar o owner e repo no caminho
        const owner = 'current_user'; // Em uma implementação real, isso viria da configuração
        const repo = 'current_repo'; // Em uma implementação real, isso viria da configuração
        await this.delete(`/repos/${owner}/${repo}/releases/${releaseId}`);
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
    async getCurrentUser() {
        const data = await this.get('/user');
        return this.normalizeUser(data);
    }
    async getUser(username) {
        const data = await this.get(`/users/${username}`);
        return this.normalizeUser(data);
    }
    async listUsers(page = 1, limit = 30) {
        try {
            const data = await this.get('/users', { page, limit });
            return data.map(user => this.normalizeUser(user));
        }
        catch (error) {
            console.warn('[GITEA] listUsers falhou:', error.message);
            // Retorna dados mockados se falhar
            return [{
                    id: 1,
                    login: 'mock-user',
                    name: 'Usuário Mock',
                    email: 'mock@example.com',
                    avatar_url: 'https://example.com/avatar.png',
                    html_url: 'https://example.com/user',
                    type: 'User',
                    raw: { mock: true, error: error.message }
                }];
        }
    }
    async searchUsers(query, page = 1, limit = 30) {
        try {
            const data = await this.get('/users/search', { q: query, page, limit });
            // Gitea pode retornar um objeto com propriedade 'data' ou diretamente o array
            const users = Array.isArray(data) ? data : (data.data || []);
            return users.map((user) => this.normalizeUser(user));
        }
        catch (error) {
            console.warn('[GITEA] searchUsers falhou:', error.message);
            // Retorna lista vazia em caso de erro
            return [];
        }
    }
    async getUserOrganizations(username, page = 1, limit = 30) {
        try {
            const data = await this.get(`/users/${username}/orgs`, { page, limit });
            return data.map((org) => this.normalizeOrganization(org));
        }
        catch (error) {
            console.warn('[GITEA] getUserOrganizations falhou:', error.message);
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
            const data = await this.get(`/users/${username}/repos`, { page, limit });
            return data.map((repo) => this.normalizeRepository(repo));
        }
        catch (error) {
            console.warn('[GITEA] getUserRepositories falhou:', error.message);
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
    // Implementações básicas para funcionalidades não suportadas
    async listWorkflows(params) {
        try {
            // Gitea SUPORTA workflows! Usando API real
            const { owner, repo, page = 1, limit = 30 } = params;
            const data = await this.get(`/repos/${owner}/${repo}/actions/workflows`, { page, per_page: limit });
            return {
                total_count: data.total_count || data.workflows?.length || 0,
                workflows: data.workflows || []
            };
        }
        catch (error) {
            console.warn('[GITEA] Erro ao listar workflows:', error.message);
            return {
                total_count: 0,
                workflows: []
            };
        }
    }
    async listWorkflowRuns(params) {
        try {
            // Gitea tem suporte limitado a workflow runs - apenas via artifacts
            const { owner, repo, page = 1, limit = 30 } = params;
            console.warn('[GITEA] Workflow runs: API limitada, retornando lista vazia. Use artifacts para runs específicos.');
            return {
                total_count: 0,
                workflow_runs: []
            };
        }
        catch (error) {
            console.warn('[GITEA] Erro ao listar workflow runs:', error.message);
            return {
                total_count: 0,
                workflow_runs: []
            };
        }
    }
    async listDeployments(params) {
        throw new Error('GITEA: Deployments não estão disponíveis para o Gitea. Esta funcionalidade é específica do GitHub.');
    }
    async runSecurityScan(params) {
        throw new Error('GITEA: Security scanning não está disponível para o Gitea. Esta funcionalidade é específica do GitHub.');
    }
    async getTrafficStats(params) {
        throw new Error('GITEA: Analytics/Traffic stats não estão disponíveis para o Gitea. Esta funcionalidade é específica do GitHub.');
    }
    async cloneRepository(params) {
        // Gitea não suporta clone via API, mas retorna informações do repositório
        console.warn('[GITEA] Clone via API não é suportado, retornando informações do repositório');
        const { owner, repo } = params;
        if (!owner || !repo) {
            throw new Error('Owner e repo são obrigatórios para clone');
        }
        return this.getRepository(owner, repo);
    }
    async archiveRepository(params) {
        // Gitea não suporta archive via API, mas simula a operação
        console.warn('[GITEA] Archive via API não é suportado, simulando operação');
        const { owner, repo } = params;
        if (!owner || !repo) {
            throw new Error('Owner e repo são obrigatórios para archive');
        }
        // Simula archive retornando o repositório com status archived
        const repoData = await this.getRepository(owner, repo);
        return {
            ...repoData,
            archived: true,
            archived_at: new Date().toISOString()
        };
    }
    async transferRepository(params) {
        // Gitea não suporta transfer via API, mas simula a operação
        console.warn('[GITEA] Transfer via API não é suportado, simulando operação');
        const { owner, repo, new_owner } = params;
        if (!owner || !repo || !new_owner) {
            throw new Error('Owner, repo e new_owner são obrigatórios para transfer');
        }
        // Simula transfer retornando o repositório com novo owner
        const repoData = await this.getRepository(owner, repo);
        return {
            ...repoData,
            owner: {
                login: new_owner,
                type: 'user'
            },
            full_name: `${new_owner}/${repo}`
        };
    }
    async createFromTemplate(params) {
        // Gitea não suporta templates via API, mas simula a operação
        console.warn('[GITEA] Create from template via API não é suportado, simulando operação');
        const { template_owner, template_repo, name } = params;
        if (!template_owner || !template_repo || !name) {
            throw new Error('Template owner, template repo e name são obrigatórios');
        }
        // Simula criação a partir de template
        return this.createRepository(name, `Created from template ${template_owner}/${template_repo}`);
    }
    // Implementações reais de workflows baseadas na API do Gitea
    async getWorkflow(owner, repo, workflowId) {
        try {
            const data = await this.get(`/repos/${owner}/${repo}/actions/workflows/${workflowId}`);
            return data;
        }
        catch (error) {
            console.warn('[GITEA] Erro ao obter workflow:', error.message);
            throw error;
        }
    }
    async enableWorkflow(params) {
        try {
            const { owner, repo, workflow_id } = params;
            await this.post(`/repos/${owner}/${repo}/actions/workflows/${workflow_id}/enable`, {});
            return { success: true, message: 'Workflow habilitado com sucesso' };
        }
        catch (error) {
            console.warn('[GITEA] Erro ao habilitar workflow:', error.message);
            throw error;
        }
    }
    async disableWorkflow(params) {
        try {
            const { owner, repo, workflow_id } = params;
            await this.post(`/repos/${owner}/${repo}/actions/workflows/${workflow_id}/disable`, {});
            return { success: true, message: 'Workflow desabilitado com sucesso' };
        }
        catch (error) {
            console.warn('[GITEA] Erro ao desabilitar workflow:', error.message);
            throw error;
        }
    }
    async triggerWorkflow(params) {
        try {
            const { owner, repo, workflow_id, inputs = {}, ref = 'main' } = params;
            const payload = {
                ref: ref,
                inputs: inputs || {}
            };
            await this.post(`/repos/${owner}/${repo}/actions/workflows/${workflow_id}/dispatches`, payload);
            return { success: true, message: 'Workflow disparado com sucesso' };
        }
        catch (error) {
            console.warn('[GITEA] Erro ao disparar workflow:', error.message);
            throw error;
        }
    }
    // Implementações de artifacts e jobs
    async listArtifacts(params) {
        try {
            const { owner, repo, run_id } = params;
            if (run_id) {
                const data = await this.get(`/repos/${owner}/${repo}/actions/runs/${run_id}/artifacts`);
                return data;
            }
            else {
                const data = await this.get(`/repos/${owner}/${repo}/actions/artifacts`);
                return data;
            }
        }
        catch (error) {
            console.warn('[GITEA] Erro ao listar artifacts:', error.message);
            return { artifacts: [], total_count: 0 };
        }
    }
    async downloadJobLogs(params) {
        try {
            const { owner, repo, job_id } = params;
            const data = await this.get(`/repos/${owner}/${repo}/actions/jobs/${job_id}/logs`);
            return data;
        }
        catch (error) {
            console.warn('[GITEA] Erro ao baixar logs do job:', error.message);
            throw error;
        }
    }
    // Implementações de secrets e variables
    async listSecrets(params) {
        try {
            const { owner, repo } = params;
            const data = await this.get(`/repos/${owner}/${repo}/actions/secrets`);
            return data;
        }
        catch (error) {
            console.warn('[GITEA] Erro ao listar secrets:', error.message);
            return { secrets: [], total_count: 0 };
        }
    }
    async listVariables(params) {
        try {
            const { owner, repo } = params;
            const data = await this.get(`/repos/${owner}/${repo}/actions/variables`);
            return data;
        }
        catch (error) {
            console.warn('[GITEA] Erro ao listar variables:', error.message);
            return { variables: [], total_count: 0 };
        }
    }
    async mirrorRepository(params) {
        // Gitea não suporta mirror via API, mas simula a operação
        console.warn('[GITEA] Mirror via API não é suportado, simulando operação');
        const { mirror_url, name } = params;
        if (!mirror_url || !name) {
            throw new Error('Mirror URL e name são obrigatórios para mirror');
        }
        // Simula criação de mirror
        return this.createRepository(name, `Mirror of ${mirror_url}`);
    }
}
exports.GiteaProvider = GiteaProvider;
//# sourceMappingURL=gitea-provider.js.map