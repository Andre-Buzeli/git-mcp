"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseVcsProvider = void 0;
const axios_1 = __importDefault(require("axios"));
const error_handler_js_1 = require("./error-handler.js");
/**
 * Classe base abstrata para todos os providers VCS
 * Implementa funcionalidades comuns e define interface unificada
 */
class BaseVcsProvider {
    client;
    config;
    baseUrl;
    constructor(config) {
        this.config = config;
        this.baseUrl = this.getBaseUrl(config);
        this.client = axios_1.default.create({
            baseURL: this.baseUrl,
            timeout: 30000,
            headers: this.getHeaders(config),
        });
        this.setupInterceptors();
    }
    /**
     * Obtém a configuração do provider
     */
    getConfig() {
        return this.config;
    }
    /**
     * Configura interceptors para logging e tratamento de erros
     */
    setupInterceptors() {
        // Request interceptor
        this.client.interceptors.request.use((config) => {
            if (process.env.DEBUG === 'true') {
                // Debug: API request
            }
            return config;
        }, (error) => {
            console.error(`[${this.config.name}] Request error:`, error);
            return Promise.reject(error);
        });
        // Response interceptor
        this.client.interceptors.response.use((response) => {
            if (process.env.DEBUG === 'true') {
                // Debug: API response
            }
            return response;
        }, (error) => {
            console.error(`[${this.config.name}] Response error:`, error.response?.status, error.response?.data);
            return Promise.reject(this.normalizeError(error));
        });
    }
    /**
     * Normaliza erros para formato unificado usando ErrorHandler padrão
     */
    normalizeError(error) {
        const standardError = error_handler_js_1.ErrorHandler.normalizeError(error, this.config.name);
        if (process.env.DEBUG === 'true') {
            console.error('Error details:', error_handler_js_1.ErrorHandler.formatForLogging(standardError));
        }
        return error_handler_js_1.ErrorHandler.createError(standardError);
    }
    /**
     * Executa uma requisição HTTP com tratamento de erro
     */
    async request(config) {
        try {
            const response = await this.client.request(config);
            return response.data;
        }
        catch (error) {
            throw this.normalizeError(error);
        }
    }
    /**
     * Executa uma requisição GET
     */
    async get(url, params) {
        return this.request({ method: 'GET', url, params });
    }
    /**
     * Executa uma requisição POST
     */
    async post(url, data) {
        return this.request({ method: 'POST', url, data });
    }
    /**
     * Executa uma requisição PUT
     */
    async put(url, data) {
        return this.request({ method: 'PUT', url, data });
    }
    /**
     * Executa uma requisição PATCH
     */
    async patch(url, data) {
        return this.request({ method: 'PATCH', url, data });
    }
    /**
     * Executa uma requisição DELETE
     */
    async delete(url, config) {
        return this.request({ method: 'DELETE', url, ...config });
    }
    // Implementações padrão das operações VCS
    // Cada provider pode sobrescrever conforme necessário
    async listRepositories(username, page = 1, limit = 30) {
        throw new Error('listRepositories not implemented');
    }
    async getRepository(owner, repo) {
        throw new Error('getRepository not implemented');
    }
    async createRepository(name, description, privateRepo = false) {
        throw new Error('createRepository not implemented');
    }
    async updateRepository(owner, repo, updates) {
        throw new Error('updateRepository not implemented');
    }
    async deleteRepository(owner, repo) {
        throw new Error('deleteRepository not implemented');
    }
    async forkRepository(owner, repo, organization) {
        throw new Error('forkRepository not implemented');
    }
    async searchRepositories(query, page = 1, limit = 30) {
        throw new Error('searchRepositories not implemented');
    }
    async listBranches(owner, repo, page = 1, limit = 30) {
        throw new Error('listBranches not implemented');
    }
    async getBranch(owner, repo, branch) {
        throw new Error('getBranch not implemented');
    }
    async createBranch(owner, repo, branchName, fromBranch) {
        throw new Error('createBranch not implemented');
    }
    async deleteBranch(owner, repo, branch) {
        throw new Error('deleteBranch not implemented');
    }
    async getFile(owner, repo, path, ref) {
        throw new Error('getFile not implemented');
    }
    async createFile(owner, repo, path, content, message, branch) {
        throw new Error('createFile not implemented');
    }
    async updateFile(owner, repo, path, content, message, sha, branch) {
        throw new Error('updateFile not implemented');
    }
    async deleteFile(owner, repo, path, message, sha, branch) {
        throw new Error('deleteFile not implemented');
    }
    async listFiles(owner, repo, path, ref) {
        throw new Error('listFiles not implemented');
    }
    async listCommits(owner, repo, branch, page = 1, limit = 30) {
        throw new Error('listCommits not implemented');
    }
    async getCommit(owner, repo, sha) {
        throw new Error('getCommit not implemented');
    }
    async listIssues(owner, repo, state = 'open', page = 1, limit = 30) {
        throw new Error('listIssues not implemented');
    }
    async getIssue(owner, repo, issueNumber) {
        throw new Error('getIssue not implemented');
    }
    async createIssue(owner, repo, title, body, assignees, labels) {
        throw new Error('createIssue not implemented');
    }
    async updateIssue(owner, repo, issueNumber, updates) {
        throw new Error('updateIssue not implemented');
    }
    async closeIssue(owner, repo, issueNumber) {
        throw new Error('closeIssue not implemented');
    }
    async listPullRequests(owner, repo, state = 'open', page = 1, limit = 30) {
        throw new Error('listPullRequests not implemented');
    }
    async getPullRequest(owner, repo, pullNumber) {
        throw new Error('getPullRequest not implemented');
    }
    async createPullRequest(owner, repo, title, body, head, base) {
        throw new Error('createPullRequest not implemented');
    }
    async updatePullRequest(owner, repo, pullNumber, updates) {
        throw new Error('updatePullRequest not implemented');
    }
    async mergePullRequest(owner, repo, pullNumber, mergeMethod = 'merge') {
        throw new Error('mergePullRequest not implemented');
    }
    async listReleases(owner, repo, page = 1, limit = 30) {
        throw new Error('listReleases not implemented');
    }
    async getRelease(owner, repo, releaseId) {
        throw new Error('getRelease not implemented');
    }
    async createRelease(owner, repo, releaseData) {
        throw new Error('createRelease not implemented');
    }
    // Métodos adicionais para commits
    async compareCommits(owner, repo, base, head) {
        throw new Error('compareCommits not implemented');
    }
    async searchCommits(owner, repo, query, author) {
        throw new Error('searchCommits not implemented');
    }
    // Métodos adicionais para issues
    async addComment(owner, repo, issueNumber, commentBody) {
        throw new Error('addComment not implemented');
    }
    async searchIssues(owner, repo, query, author, assignee, label) {
        throw new Error('searchIssues not implemented');
    }
    async updateRelease(owner, repo, releaseId, updates) {
        throw new Error('updateRelease not implemented');
    }
    async deleteRelease(owner, repo, releaseId) {
        throw new Error('deleteRelease not implemented');
    }
    async listTags(owner, repo, page = 1, limit = 30) {
        throw new Error('listTags not implemented');
    }
    async getTag(owner, repo, tag) {
        throw new Error('getTag not implemented');
    }
    async createTag(owner, repo, tagData) {
        throw new Error('createTag not implemented');
    }
    async deleteTag(owner, repo, tag) {
        throw new Error('deleteTag not implemented');
    }
    async getCurrentUser() {
        throw new Error('getCurrentUser not implemented');
    }
    async getUser(username) {
        throw new Error('getUser not implemented');
    }
    async listUsers(page = 1, limit = 30) {
        throw new Error('listUsers not implemented');
    }
    async searchUsers(query, page = 1, limit = 30) {
        throw new Error('searchUsers not implemented');
    }
    async listWebhooks(owner, repo, page = 1, limit = 30) {
        throw new Error('listWebhooks not implemented');
    }
    async getWebhook(owner, repo, webhookId) {
        throw new Error('getWebhook not implemented');
    }
    async createWebhook(owner, repo, url, events, secret) {
        throw new Error('createWebhook not implemented');
    }
    async updateWebhook(owner, repo, webhookId, updates) {
        throw new Error('updateWebhook not implemented');
    }
    async deleteWebhook(owner, repo, webhookId) {
        throw new Error('deleteWebhook not implemented');
    }
    async createCommit(owner, repo, message, branch, changes) {
        throw new Error('createCommit not implemented');
    }
    async getUserOrganizations(username, page = 1, limit = 30) {
        throw new Error('getUserOrganizations not implemented');
    }
    async getUserRepositories(username, page = 1, limit = 30) {
        throw new Error('getUserRepositories not implemented');
    }
    // Packages
    async listPackages(owner, repo, page = 1, limit = 30) {
        throw new Error('listPackages not implemented');
    }
    async getPackage(owner, repo, packageId) {
        throw new Error('getPackage not implemented');
    }
    async createPackage(owner, repo, packageData) {
        throw new Error('createPackage not implemented');
    }
    async updatePackage(owner, repo, packageId, updates) {
        throw new Error('updatePackage not implemented');
    }
    async deletePackage(owner, repo, packageId) {
        throw new Error('deletePackage not implemented');
    }
    async publishPackage(owner, repo, packageId) {
        throw new Error('publishPackage not implemented');
    }
    async downloadPackage(owner, repo, packageId) {
        throw new Error('downloadPackage not implemented');
    }
    // Projects
    async listProjects(owner, repo, page = 1, limit = 30) {
        throw new Error('listProjects not implemented');
    }
    async getProject(owner, repo, projectId) {
        throw new Error('getProject not implemented');
    }
    async createProject(owner, repo, projectData) {
        throw new Error('createProject not implemented');
    }
    async updateProject(owner, repo, projectId, updates) {
        throw new Error('updateProject not implemented');
    }
    async deleteProject(owner, repo, projectId) {
        throw new Error('deleteProject not implemented');
    }
    async addProjectItem(owner, repo, projectId, item) {
        throw new Error('addProjectItem not implemented');
    }
    async updateProjectItem(owner, repo, projectId, itemId, updates) {
        throw new Error('updateProjectItem not implemented');
    }
    async deleteProjectItem(owner, repo, projectId, itemId) {
        throw new Error('deleteProjectItem not implemented');
    }
    async listProjectItems(owner, repo, projectId, page = 1, limit = 30) {
        throw new Error('listProjectItems not implemented');
    }
}
exports.BaseVcsProvider = BaseVcsProvider;
//# sourceMappingURL=base-provider.js.map