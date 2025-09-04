"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.giteaClient = exports.GiteaClient = void 0;
const axios_1 = __importDefault(require("axios"));
const config_js_1 = require("./config.js");
const index_js_1 = require("./providers/index.js");
/**
 * Cliente principal para API Gitea
 *
 * RESPONSABILIDADES:
 * - Configuração do cliente HTTP
 * - Gerenciamento de autenticação
 * - Implementação de todos os endpoints
 * - Tratamento de erros e respostas
 *
 * ARQUITETURA:
 * - Cliente Axios configurado
 * - Headers de autenticação automáticos
 * - Base URL configurável
 * - Timeout configurável
 *
 * RECOMENDAÇÕES:
 * - Use apenas uma instância por aplicação
 * - Configure interceptors para logging
 * - Trate erros de autenticação adequadamente
 * - Monitore uso da API
 */
class GiteaClient {
    axios;
    baseURL;
    providerFactory;
    constructor() {
        // Inicializa o sistema multi-provider
        try {
            this.providerFactory = (0, index_js_1.initializeFactoryFromEnv)();
            // Se multi-provider funcionou, usa o provider padrão
            const defaultProvider = this.providerFactory.getDefaultProvider();
            this.axios = defaultProvider.client;
            this.baseURL = defaultProvider.baseUrl;
        }
        catch (error) {
            // Fallback para configuração legacy
            const cfg = config_js_1.config.getConfig();
            if (!cfg.giteaUrl || !cfg.giteaToken) {
                throw new Error('No valid VCS provider configuration found. Please configure GITEA_URL and GITEA_TOKEN, or use multi-provider configuration.');
            }
            this.baseURL = `${cfg.giteaUrl}/api/v1`;
            // Configuração do cliente Axios com autenticação
            this.axios = axios_1.default.create({
                baseURL: this.baseURL,
                timeout: cfg.timeout,
                headers: {
                    'Authorization': `token ${cfg.giteaToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });
        }
        // Configuração de interceptors para debug e logging
        // Apenas ativo quando DEBUG=true
        if (config_js_1.config.isDebug()) {
            // Interceptor para requisições - log de método e URL
            this.axios.interceptors.request.use((config) => {
                // Debug: API request
                return config;
            }, (error) => {
                console.error('[Gitea API] Request error:', error);
                return Promise.reject(error);
            });
            // Interceptor para respostas - log de status e URL
            this.axios.interceptors.response.use((response) => {
                // Debug: API response
                return response;
            }, (error) => {
                console.error('[Gitea API] Response error:', error.response?.status, error.response?.data);
                return Promise.reject(error);
            });
        }
    }
    /**
     * Método helper para chamadas da API
     *
     * FUNCIONALIDADE:
     * - Executa requisições HTTP para API Gitea
     * - Trata erros de forma uniforme
     * - Formata mensagens de erro
     * - Suporta todos os métodos HTTP
     *
     * PARÂMETROS:
     * - method: Método HTTP (GET, POST, PUT, DELETE, PATCH)
     * - url: Endpoint da API
     * - data: Dados para envio (opcional)
     *
     * TRATAMENTO DE ERROS:
     * - Erros HTTP: formata com status e mensagem
     * - Erros de rede: propaga erro original
     * - Timeout: captura e formata adequadamente
     *
     * RECOMENDAÇÕES:
     * - Use para todas as chamadas da API
     * - Trate erros específicos por status
     * - Implemente retry para erros temporários
     */
    async request(method, url, data) {
        try {
            const response = await this.axios.request({
                method,
                url,
                data,
            });
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                const message = error.response?.data?.message || error.message;
                throw new Error(`Gitea API Error (${error.response?.status}): ${message}`);
            }
            throw error;
        }
    }
    // Repository methods
    async getRepositories(username, page = 1, limit = 30) {
        const url = username ? `/users/${username}/repos` : '/user/repos';
        return this.request('GET', `${url}?page=${page}&limit=${limit}`);
    }
    async getRepository(owner, repo) {
        return this.request('GET', `/repos/${owner}/${repo}`);
    }
    async createRepository(data) {
        return this.request('POST', '/user/repos', data);
    }
    async updateRepository(owner, repo, data) {
        return this.request('PATCH', `/repos/${owner}/${repo}`, data);
    }
    async deleteRepository(owner, repo) {
        await this.request('DELETE', `/repos/${owner}/${repo}`);
    }
    async forkRepository(owner, repo, organization) {
        const data = organization ? { organization } : {};
        return this.request('POST', `/repos/${owner}/${repo}/forks`, data);
    }
    async searchRepositories(query, page = 1, limit = 30) {
        return this.request('GET', `/repos/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    }
    // Branch methods
    async getBranches(owner, repo, page = 1, limit = 30) {
        return this.request('GET', `/repos/${owner}/${repo}/branches?page=${page}&limit=${limit}`);
    }
    async getBranch(owner, repo, branch) {
        return this.request('GET', `/repos/${owner}/${repo}/branches/${branch}`);
    }
    async createBranch(owner, repo, branchName, fromBranch) {
        const data = { new_branch_name: branchName, old_branch_name: fromBranch };
        return this.request('POST', `/repos/${owner}/${repo}/branches`, data);
    }
    async deleteBranch(owner, repo, branch) {
        await this.request('DELETE', `/repos/${owner}/${repo}/branches/${branch}`);
    }
    // File methods
    async getFile(owner, repo, path, ref) {
        const url = `/repos/${owner}/${repo}/contents/${path}${ref ? `?ref=${ref}` : ''}`;
        return this.request('GET', url);
    }
    async getDirectoryContents(owner, repo, path = '', ref) {
        const url = `/repos/${owner}/${repo}/contents/${path}${ref ? `?ref=${ref}` : ''}`;
        return this.request('GET', url);
    }
    async createFile(owner, repo, path, data) {
        return this.request('POST', `/repos/${owner}/${repo}/contents/${path}`, data);
    }
    async updateFile(owner, repo, path, data) {
        return this.request('PUT', `/repos/${owner}/${repo}/contents/${path}`, data);
    }
    async deleteFile(owner, repo, path, data) {
        return this.request('DELETE', `/repos/${owner}/${repo}/contents/${path}`, data);
    }
    // Commit methods
    async getCommits(owner, repo, page = 1, limit = 30, sha) {
        const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
        if (sha)
            params.append('sha', sha);
        return this.request('GET', `/repos/${owner}/${repo}/commits?${params}`);
    }
    async getCommit(owner, repo, sha) {
        return this.request('GET', `/repos/${owner}/${repo}/commits/${sha}`);
    }
    // Issue methods
    async getIssues(owner, repo, state = 'open', page = 1, limit = 30) {
        return this.request('GET', `/repos/${owner}/${repo}/issues?state=${state}&page=${page}&limit=${limit}`);
    }
    async getIssue(owner, repo, index) {
        return this.request('GET', `/repos/${owner}/${repo}/issues/${index}`);
    }
    async createIssue(owner, repo, data) {
        return this.request('POST', `/repos/${owner}/${repo}/issues`, data);
    }
    async updateIssue(owner, repo, index, data) {
        return this.request('PATCH', `/repos/${owner}/${repo}/issues/${index}`, data);
    }
    async createIssueComment(owner, repo, index, body) {
        return this.request('POST', `/repos/${owner}/${repo}/issues/${index}/comments`, { body });
    }
    // Pull Request methods
    async getPullRequests(owner, repo, state = 'open', page = 1, limit = 30) {
        return this.request('GET', `/repos/${owner}/${repo}/pulls?state=${state}&page=${page}&limit=${limit}`);
    }
    async getPullRequest(owner, repo, index) {
        return this.request('GET', `/repos/${owner}/${repo}/pulls/${index}`);
    }
    async createPullRequest(owner, repo, data) {
        return this.request('POST', `/repos/${owner}/${repo}/pulls`, data);
    }
    async updatePullRequest(owner, repo, index, data) {
        return this.request('PATCH', `/repos/${owner}/${repo}/pulls/${index}`, data);
    }
    async mergePullRequest(owner, repo, index, data) {
        return this.request('POST', `/repos/${owner}/${repo}/pulls/${index}/merge`, data);
    }
    // Release methods
    async getReleases(owner, repo, page = 1, limit = 30) {
        return this.request('GET', `/repos/${owner}/${repo}/releases?page=${page}&limit=${limit}`);
    }
    async getRelease(owner, repo, id) {
        return this.request('GET', `/repos/${owner}/${repo}/releases/${id}`);
    }
    async getLatestRelease(owner, repo) {
        return this.request('GET', `/repos/${owner}/${repo}/releases/latest`);
    }
    async createRelease(owner, repo, data) {
        return this.request('POST', `/repos/${owner}/${repo}/releases`, data);
    }
    async updateRelease(owner, repo, id, data) {
        return this.request('PATCH', `/repos/${owner}/${repo}/releases/${id}`, data);
    }
    async deleteRelease(owner, repo, id) {
        await this.request('DELETE', `/repos/${owner}/${repo}/releases/${id}`);
    }
    // Tag methods
    async getTags(owner, repo, page = 1, limit = 30) {
        return this.request('GET', `/repos/${owner}/${repo}/tags?page=${page}&limit=${limit}`);
    }
    async createTag(owner, repo, data) {
        return this.request('POST', `/repos/${owner}/${repo}/tags`, data);
    }
    async deleteTag(owner, repo, tag) {
        await this.request('DELETE', `/repos/${owner}/${repo}/tags/${tag}`);
    }
    // User methods
    async getCurrentUser() {
        return this.request('GET', '/user');
    }
    async getUser(username) {
        return this.request('GET', `/users/${username}`);
    }
    async searchUsers(query, page = 1, limit = 30) {
        return this.request('GET', `/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    }
    async getUserOrganizations(username) {
        return this.request('GET', `/users/${username}/orgs`);
    }
    // Webhook methods
    async getWebhooks(owner, repo) {
        return this.request('GET', `/repos/${owner}/${repo}/hooks`);
    }
    async getWebhook(owner, repo, id) {
        return this.request('GET', `/repos/${owner}/${repo}/hooks/${id}`);
    }
    async createWebhook(owner, repo, data) {
        return this.request('POST', `/repos/${owner}/${repo}/hooks`, data);
    }
    async updateWebhook(owner, repo, id, data) {
        return this.request('PATCH', `/repos/${owner}/${repo}/hooks/${id}`, data);
    }
    async deleteWebhook(owner, repo, id) {
        await this.request('DELETE', `/repos/${owner}/${repo}/hooks/${id}`);
    }
    async testWebhook(owner, repo, id) {
        return this.request('POST', `/repos/${owner}/${repo}/hooks/${id}/tests`);
    }
}
exports.GiteaClient = GiteaClient;
/**
 * Instância global do cliente Gitea
 *
 * USO:
 * - import { giteaClient } from './client.js';
 * - const repos = await giteaClient.getRepositories();
 *
 * RECOMENDAÇÕES:
 * - Use esta instância para todas as operações
 * - Não crie novas instâncias
 * - Configure antes de usar
 * - Monitore uso e performance
 */
exports.giteaClient = new GiteaClient();
//# sourceMappingURL=client.js.map