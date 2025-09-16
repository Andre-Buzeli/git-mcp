import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { VcsOperations, VcsProvider } from './types.js';
import { ErrorHandler, StandardError } from './error-handler.js';

/**
 * Classe base abstrata para todos os providers VCS
 * Implementa funcionalidades comuns e define interface unificada
 */
export abstract class BaseVcsProvider implements VcsOperations {
  protected client: AxiosInstance;
  protected config: VcsProvider;
  protected baseUrl: string;

  constructor(config: VcsProvider) {
    this.config = config;
    this.baseUrl = this.getBaseUrl(config);
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: this.getHeaders(config),
    });

    this.setupInterceptors();
  }

  /**
   * Configura interceptors para logging e tratamento de erros
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (process.env.DEBUG === 'true') {
          // Debug: API request
        }
        return config;
      },
      (error) => {
        console.error(`[${this.config.name}] Request error:`, error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        if (process.env.DEBUG === 'true') {
          // Debug: API response
        }
        return response;
      },
      (error) => {
        console.error(`[${this.config.name}] Response error:`, error.response?.status, error.response?.data);
        return Promise.reject(this.normalizeError(error));
      }
    );
  }

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
  protected normalizeError(error: any): Error {
    const standardError = ErrorHandler.normalizeError(error, this.config.name);
    
    if (process.env.DEBUG === 'true') {
      console.error('Error details:', ErrorHandler.formatForLogging(standardError));
    }
    
    return ErrorHandler.createError(standardError);
  }

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
   * Upload de projeto completo - deve ser implementado pelos providers específicos
   */
  abstract uploadProject(owner: string, repo: string, projectPath: string, message: string, branch?: string): Promise<{ uploaded: number; errors: string[] }>;

  /**
   * Executa uma requisição HTTP com tratamento de erro
   */
  protected async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.request<T>(config);
      return response.data;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  /**
   * Executa uma requisição GET
   */
  protected async get<T>(url: string, params?: any): Promise<T> {
    return this.request<T>({ method: 'GET', url, params });
  }

  /**
   * Executa uma requisição POST
   */
  protected async post<T>(url: string, data?: any): Promise<T> {
    return this.request<T>({ method: 'POST', url, data });
  }

  /**
   * Executa uma requisição PUT
   */
  protected async put<T>(url: string, data?: any): Promise<T> {
    return this.request<T>({ method: 'PUT', url, data });
  }

  /**
   * Executa uma requisição PATCH
   */
  protected async patch<T>(url: string, data?: any): Promise<T> {
    return this.request<T>({ method: 'PATCH', url, data });
  }

  /**
   * Executa uma requisição DELETE
   */
  protected async delete<T>(url: string, config?: any): Promise<T> {
    return this.request<T>({ method: 'DELETE', url, ...config });
  }

  // Implementações padrão das operações VCS
  // Cada provider pode sobrescrever conforme necessário

  async listRepositories(username?: string, page: number = 1, limit: number = 30): Promise<any[]> {
    throw new Error('listRepositories not implemented');
  }

  async getRepository(owner: string, repo: string): Promise<any> {
    throw new Error('getRepository not implemented');
  }

  async createRepository(name: string, description?: string, privateRepo: boolean = false): Promise<any> {
    throw new Error('createRepository not implemented');
  }

  async updateRepository(owner: string, repo: string, updates: any): Promise<any> {
    throw new Error('updateRepository not implemented');
  }

  async deleteRepository(owner: string, repo: string): Promise<boolean> {
    throw new Error('deleteRepository not implemented');
  }

  async forkRepository(owner: string, repo: string, organization?: string): Promise<any> {
    throw new Error('forkRepository not implemented');
  }

  async searchRepositories(query: string, page: number = 1, limit: number = 30): Promise<any[]> {
    throw new Error('searchRepositories not implemented');
  }

  async listBranches(owner: string, repo: string, page: number = 1, limit: number = 30): Promise<any[]> {
    throw new Error('listBranches not implemented');
  }

  async getBranch(owner: string, repo: string, branch: string): Promise<any> {
    throw new Error('getBranch not implemented');
  }

  async createBranch(owner: string, repo: string, branchName: string, fromBranch: string): Promise<any> {
    throw new Error('createBranch not implemented');
  }

  async deleteBranch(owner: string, repo: string, branch: string): Promise<boolean> {
    throw new Error('deleteBranch not implemented');
  }

  async getFile(owner: string, repo: string, path: string, ref?: string): Promise<any> {
    throw new Error('getFile not implemented');
  }

  async createFile(owner: string, repo: string, path: string, content: string, message: string, branch?: string): Promise<any> {
    throw new Error('createFile not implemented');
  }

  async updateFile(owner: string, repo: string, path: string, content: string, message: string, sha: string, branch?: string): Promise<any> {
    throw new Error('updateFile not implemented');
  }

  async deleteFile(owner: string, repo: string, path: string, message: string, sha: string, branch?: string): Promise<boolean> {
    throw new Error('deleteFile not implemented');
  }

  async listFiles(owner: string, repo: string, path: string, ref?: string): Promise<any[]> {
    throw new Error('listFiles not implemented');
  }

  async listCommits(owner: string, repo: string, branch?: string, page: number = 1, limit: number = 30): Promise<any[]> {
    throw new Error('listCommits not implemented');
  }

  async getCommit(owner: string, repo: string, sha: string): Promise<any> {
    throw new Error('getCommit not implemented');
  }

  async listIssues(owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open', page: number = 1, limit: number = 30): Promise<any[]> {
    throw new Error('listIssues not implemented');
  }

  async getIssue(owner: string, repo: string, issueNumber: number): Promise<any> {
    throw new Error('getIssue not implemented');
  }

  async createIssue(owner: string, repo: string, title: string, body?: string, assignees?: string[], labels?: string[]): Promise<any> {
    throw new Error('createIssue not implemented');
  }

  async updateIssue(owner: string, repo: string, issueNumber: number, updates: any): Promise<any> {
    throw new Error('updateIssue not implemented');
  }

  async closeIssue(owner: string, repo: string, issueNumber: number): Promise<any> {
    throw new Error('closeIssue not implemented');
  }

  async listPullRequests(owner: string, repo: string, state: 'open' | 'closed' | 'merged' | 'all' = 'open', page: number = 1, limit: number = 30): Promise<any[]> {
    throw new Error('listPullRequests not implemented');
  }

  async getPullRequest(owner: string, repo: string, pullNumber: number): Promise<any> {
    throw new Error('getPullRequest not implemented');
  }

  async createPullRequest(owner: string, repo: string, title: string, body: string, head: string, base: string): Promise<any> {
    throw new Error('createPullRequest not implemented');
  }

  async updatePullRequest(owner: string, repo: string, pullNumber: number, updates: any): Promise<any> {
    throw new Error('updatePullRequest not implemented');
  }

  async mergePullRequest(owner: string, repo: string, pullNumber: number, mergeMethod: 'merge' | 'rebase' | 'squash' = 'merge'): Promise<boolean> {
    throw new Error('mergePullRequest not implemented');
  }

  async listReleases(owner: string, repo: string, page: number = 1, limit: number = 30): Promise<any[]> {
    throw new Error('listReleases not implemented');
  }

  async getRelease(owner: string, repo: string, releaseId: number): Promise<any> {
    throw new Error('getRelease not implemented');
  }

  async createRelease(tagName: string, name: string, body?: string, draft: boolean = false, prerelease: boolean = false): Promise<any> {
    throw new Error('createRelease not implemented');
  }

  async updateRelease(releaseId: number, updates: any): Promise<any> {
    throw new Error('updateRelease not implemented');
  }

  async deleteRelease(releaseId: number): Promise<boolean> {
    throw new Error('deleteRelease not implemented');
  }

  async listTags(owner: string, repo: string, page: number = 1, limit: number = 30): Promise<any[]> {
    throw new Error('listTags not implemented');
  }

  async getTag(owner: string, repo: string, tag: string): Promise<any> {
    throw new Error('getTag not implemented');
  }

  async createTag(tagName: string, message: string, target: string): Promise<any> {
    throw new Error('createTag not implemented');
  }

  async deleteTag(owner: string, repo: string, tag: string): Promise<boolean> {
    throw new Error('deleteTag not implemented');
  }

  async getCurrentUser(): Promise<any> {
    throw new Error('getCurrentUser not implemented');
  }

  async getUser(username: string): Promise<any> {
    throw new Error('getUser not implemented');
  }

  async listUsers(page: number = 1, limit: number = 30): Promise<any[]> {
    throw new Error('listUsers not implemented');
  }

  async searchUsers(query: string, page: number = 1, limit: number = 30): Promise<any[]> {
    throw new Error('searchUsers not implemented');
  }

  async listWebhooks(owner: string, repo: string, page: number = 1, limit: number = 30): Promise<any[]> {
    throw new Error('listWebhooks not implemented');
  }

  async getWebhook(owner: string, repo: string, webhookId: number): Promise<any> {
    throw new Error('getWebhook not implemented');
  }

  async createWebhook(owner: string, repo: string, url: string, events: string[], secret?: string): Promise<any> {
    throw new Error('createWebhook not implemented');
  }

  async updateWebhook(owner: string, repo: string, webhookId: number, updates: any): Promise<any> {
    throw new Error('updateWebhook not implemented');
  }

  async deleteWebhook(owner: string, repo: string, webhookId: number): Promise<boolean> {
    throw new Error('deleteWebhook not implemented');
  }

  async createCommit(owner: string, repo: string, message: string, branch: string, changes?: any): Promise<any> {
    throw new Error('createCommit not implemented');
  }

  async getUserOrganizations(username: string, page: number = 1, limit: number = 30): Promise<any[]> {
    throw new Error('getUserOrganizations not implemented');
  }

  async getUserRepositories(username: string, page: number = 1, limit: number = 30): Promise<any[]> {
    throw new Error('getUserRepositories not implemented');
  }
}
