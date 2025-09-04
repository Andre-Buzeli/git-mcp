import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { config } from './config.js';
import { globalProviderFactory, initializeFactoryFromEnv } from './providers/index.js';

/**
 * Cliente HTTP para API Gitea
 * 
 * RESPONSABILIDADES:
 * - Comunicação com API REST do Gitea
 * - Gerenciamento de autenticação
 * - Tratamento de requisições HTTP
 * - Logging e debug de operações
 * 
 * ARQUITETURA:
 * - Cliente Axios configurável
 * - Interceptors para logging
 * - Tratamento centralizado de erros
 * - Timeout configurável
 * 
 * RECOMENDAÇÕES:
 * - Configure timeout adequado para sua rede
 * - Use HTTPS em produção
 * - Rotacione tokens periodicamente
 * - Monitore rate limits da API
 */

/**
 * Interface para repositório Gitea
 * 
 * PROPRIEDADES:
 * - id: Identificador único do repositório
 * - name: Nome do repositório
 * - full_name: Nome completo (owner/repo)
 * - description: Descrição do repositório
 * - private: Se é privado ou público
 * - fork: Se é um fork de outro repositório
 * - html_url: URL para visualização web
 * - clone_url: URL para clone HTTP
 * - ssh_url: URL para clone SSH
 * - default_branch: Branch padrão
 * - created_at: Data de criação
 * - updated_at: Data da última atualização
 */
export interface GiteaRepository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  fork: boolean;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  default_branch: string;
  created_at: string;
  updated_at: string;
}

export interface GiteaBranch {
  name: string;
  commit: {
    id: string;
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
}

export interface GiteaFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: 'file' | 'dir';
  content?: string;
  encoding?: string;
}

export interface GiteaCommit {
  sha: string;
  commit: {
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
  };
  author: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
}

export interface GiteaIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  user: {
    login: string;
    avatar_url: string;
  };
  labels: Array<{
    name: string;
    color: string;
  }>;
  created_at: string;
  updated_at: string;
  html_url: string;
}

export interface GiteaPullRequest {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed' | 'merged';
  user: {
    login: string;
    avatar_url: string;
  };
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
    sha: string;
  };
  mergeable: boolean;
  merged: boolean;
  created_at: string;
  updated_at: string;
  html_url: string;
}

export interface GiteaRelease {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  published_at: string;
  html_url: string;
  tarball_url: string;
  zipball_url: string;
}

export interface GiteaTag {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  zipball_url: string;
  tarball_url: string;
}

export interface GiteaUser {
  id: number;
  login: string;
  full_name: string;
  email: string;
  avatar_url: string;
  website: string;
  location: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface GiteaWebhook {
  id: number;
  type: string;
  config: {
    url: string;
    content_type: string;
    secret?: string;
  };
  events: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

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
export class GiteaClient {
  private axios: AxiosInstance;
  private baseURL: string;
  private providerFactory: any;

  constructor() {
    // Inicializa o sistema multi-provider
    try {
      this.providerFactory = initializeFactoryFromEnv();
      // Se multi-provider funcionou, usa o provider padrão
      const defaultProvider = this.providerFactory.getDefaultProvider();
      this.axios = (defaultProvider as any).client;
      this.baseURL = (defaultProvider as any).baseUrl;
    } catch (error) {
      // Fallback para configuração legacy
      const cfg = config.getConfig();
      
      if (!cfg.giteaUrl || !cfg.giteaToken) {
        throw new Error('No valid VCS provider configuration found. Please configure GITEA_URL and GITEA_TOKEN, or use multi-provider configuration.');
      }
      
      this.baseURL = `${cfg.giteaUrl}/api/v1`;
      
      // Configuração do cliente Axios com autenticação
      this.axios = axios.create({
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
    if (config.isDebug()) {
      // Interceptor para requisições - log de método e URL
      this.axios.interceptors.request.use(
        (config) => {
          // Debug: API request
          return config;
        },
        (error) => {
          console.error('[Gitea API] Request error:', error);
          return Promise.reject(error);
        }
      );

      // Interceptor para respostas - log de status e URL
      this.axios.interceptors.response.use(
        (response) => {
          // Debug: API response
          return response;
        },
        (error) => {
          console.error('[Gitea API] Response error:', error.response?.status, error.response?.data);
          return Promise.reject(error);
        }
      );
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
  private async request<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH', url: string, data?: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axios.request({
        method,
        url,
        data,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new Error(`Gitea API Error (${error.response?.status}): ${message}`);
      }
      throw error;
    }
  }

  // Repository methods
  async getRepositories(username?: string, page = 1, limit = 30): Promise<GiteaRepository[]> {
    const url = username ? `/users/${username}/repos` : '/user/repos';
    return this.request<GiteaRepository[]>('GET', `${url}?page=${page}&limit=${limit}`);
  }

  async getRepository(owner: string, repo: string): Promise<GiteaRepository> {
    return this.request<GiteaRepository>('GET', `/repos/${owner}/${repo}`);
  }

  async createRepository(data: any): Promise<GiteaRepository> {
    return this.request<GiteaRepository>('POST', '/user/repos', data);
  }

  async updateRepository(owner: string, repo: string, data: any): Promise<GiteaRepository> {
    return this.request<GiteaRepository>('PATCH', `/repos/${owner}/${repo}`, data);
  }

  async deleteRepository(owner: string, repo: string): Promise<void> {
    await this.request<void>('DELETE', `/repos/${owner}/${repo}`);
  }

  async forkRepository(owner: string, repo: string, organization?: string): Promise<GiteaRepository> {
    const data = organization ? { organization } : {};
    return this.request<GiteaRepository>('POST', `/repos/${owner}/${repo}/forks`, data);
  }

  async searchRepositories(query: string, page = 1, limit = 30): Promise<{ data: GiteaRepository[] }> {
    return this.request<{ data: GiteaRepository[] }>('GET', `/repos/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  }

  // Branch methods
  async getBranches(owner: string, repo: string, page = 1, limit = 30): Promise<GiteaBranch[]> {
    return this.request<GiteaBranch[]>('GET', `/repos/${owner}/${repo}/branches?page=${page}&limit=${limit}`);
  }

  async getBranch(owner: string, repo: string, branch: string): Promise<GiteaBranch> {
    return this.request<GiteaBranch>('GET', `/repos/${owner}/${repo}/branches/${branch}`);
  }

  async createBranch(owner: string, repo: string, branchName: string, fromBranch: string): Promise<GiteaBranch> {
    const data = { new_branch_name: branchName, old_branch_name: fromBranch };
    return this.request<GiteaBranch>('POST', `/repos/${owner}/${repo}/branches`, data);
  }

  async deleteBranch(owner: string, repo: string, branch: string): Promise<void> {
    await this.request<void>('DELETE', `/repos/${owner}/${repo}/branches/${branch}`);
  }

  // File methods
  async getFile(owner: string, repo: string, path: string, ref?: string): Promise<GiteaFile> {
    const url = `/repos/${owner}/${repo}/contents/${path}${ref ? `?ref=${ref}` : ''}`;
    return this.request<GiteaFile>('GET', url);
  }

  async getDirectoryContents(owner: string, repo: string, path: string = '', ref?: string): Promise<GiteaFile[]> {
    const url = `/repos/${owner}/${repo}/contents/${path}${ref ? `?ref=${ref}` : ''}`;
    return this.request<GiteaFile[]>('GET', url);
  }

  async createFile(owner: string, repo: string, path: string, data: any): Promise<any> {
    return this.request<any>('POST', `/repos/${owner}/${repo}/contents/${path}`, data);
  }

  async updateFile(owner: string, repo: string, path: string, data: any): Promise<any> {
    return this.request<any>('PUT', `/repos/${owner}/${repo}/contents/${path}`, data);
  }

  async deleteFile(owner: string, repo: string, path: string, data: any): Promise<any> {
    return this.request<any>('DELETE', `/repos/${owner}/${repo}/contents/${path}`, data);
  }

  // Commit methods
  async getCommits(owner: string, repo: string, page = 1, limit = 30, sha?: string): Promise<GiteaCommit[]> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (sha) params.append('sha', sha);
    return this.request<GiteaCommit[]>('GET', `/repos/${owner}/${repo}/commits?${params}`);
  }

  async getCommit(owner: string, repo: string, sha: string): Promise<GiteaCommit> {
    return this.request<GiteaCommit>('GET', `/repos/${owner}/${repo}/commits/${sha}`);
  }

  // Issue methods
  async getIssues(owner: string, repo: string, state = 'open', page = 1, limit = 30): Promise<GiteaIssue[]> {
    return this.request<GiteaIssue[]>('GET', `/repos/${owner}/${repo}/issues?state=${state}&page=${page}&limit=${limit}`);
  }

  async getIssue(owner: string, repo: string, index: number): Promise<GiteaIssue> {
    return this.request<GiteaIssue>('GET', `/repos/${owner}/${repo}/issues/${index}`);
  }

  async createIssue(owner: string, repo: string, data: any): Promise<GiteaIssue> {
    return this.request<GiteaIssue>('POST', `/repos/${owner}/${repo}/issues`, data);
  }

  async updateIssue(owner: string, repo: string, index: number, data: any): Promise<GiteaIssue> {
    return this.request<GiteaIssue>('PATCH', `/repos/${owner}/${repo}/issues/${index}`, data);
  }

  async createIssueComment(owner: string, repo: string, index: number, body: string): Promise<any> {
    return this.request<any>('POST', `/repos/${owner}/${repo}/issues/${index}/comments`, { body });
  }

  // Pull Request methods
  async getPullRequests(owner: string, repo: string, state = 'open', page = 1, limit = 30): Promise<GiteaPullRequest[]> {
    return this.request<GiteaPullRequest[]>('GET', `/repos/${owner}/${repo}/pulls?state=${state}&page=${page}&limit=${limit}`);
  }

  async getPullRequest(owner: string, repo: string, index: number): Promise<GiteaPullRequest> {
    return this.request<GiteaPullRequest>('GET', `/repos/${owner}/${repo}/pulls/${index}`);
  }

  async createPullRequest(owner: string, repo: string, data: any): Promise<GiteaPullRequest> {
    return this.request<GiteaPullRequest>('POST', `/repos/${owner}/${repo}/pulls`, data);
  }

  async updatePullRequest(owner: string, repo: string, index: number, data: any): Promise<GiteaPullRequest> {
    return this.request<GiteaPullRequest>('PATCH', `/repos/${owner}/${repo}/pulls/${index}`, data);
  }

  async mergePullRequest(owner: string, repo: string, index: number, data: any): Promise<any> {
    return this.request<any>('POST', `/repos/${owner}/${repo}/pulls/${index}/merge`, data);
  }

  // Release methods
  async getReleases(owner: string, repo: string, page = 1, limit = 30): Promise<GiteaRelease[]> {
    return this.request<GiteaRelease[]>('GET', `/repos/${owner}/${repo}/releases?page=${page}&limit=${limit}`);
  }

  async getRelease(owner: string, repo: string, id: number): Promise<GiteaRelease> {
    return this.request<GiteaRelease>('GET', `/repos/${owner}/${repo}/releases/${id}`);
  }

  async getLatestRelease(owner: string, repo: string): Promise<GiteaRelease> {
    return this.request<GiteaRelease>('GET', `/repos/${owner}/${repo}/releases/latest`);
  }

  async createRelease(owner: string, repo: string, data: any): Promise<GiteaRelease> {
    return this.request<GiteaRelease>('POST', `/repos/${owner}/${repo}/releases`, data);
  }

  async updateRelease(owner: string, repo: string, id: number, data: any): Promise<GiteaRelease> {
    return this.request<GiteaRelease>('PATCH', `/repos/${owner}/${repo}/releases/${id}`, data);
  }

  async deleteRelease(owner: string, repo: string, id: number): Promise<void> {
    await this.request<void>('DELETE', `/repos/${owner}/${repo}/releases/${id}`);
  }

  // Tag methods
  async getTags(owner: string, repo: string, page = 1, limit = 30): Promise<GiteaTag[]> {
    return this.request<GiteaTag[]>('GET', `/repos/${owner}/${repo}/tags?page=${page}&limit=${limit}`);
  }

  async createTag(owner: string, repo: string, data: any): Promise<any> {
    return this.request<any>('POST', `/repos/${owner}/${repo}/tags`, data);
  }

  async deleteTag(owner: string, repo: string, tag: string): Promise<void> {
    await this.request<void>('DELETE', `/repos/${owner}/${repo}/tags/${tag}`);
  }

  // User methods
  async getCurrentUser(): Promise<GiteaUser> {
    return this.request<GiteaUser>('GET', '/user');
  }

  async getUser(username: string): Promise<GiteaUser> {
    return this.request<GiteaUser>('GET', `/users/${username}`);
  }

  async searchUsers(query: string, page = 1, limit = 30): Promise<{ data: GiteaUser[] }> {
    return this.request<{ data: GiteaUser[] }>('GET', `/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  }

  async getUserOrganizations(username: string): Promise<any[]> {
    return this.request<any[]>('GET', `/users/${username}/orgs`);
  }

  // Webhook methods
  async getWebhooks(owner: string, repo: string): Promise<GiteaWebhook[]> {
    return this.request<GiteaWebhook[]>('GET', `/repos/${owner}/${repo}/hooks`);
  }

  async getWebhook(owner: string, repo: string, id: number): Promise<GiteaWebhook> {
    return this.request<GiteaWebhook>('GET', `/repos/${owner}/${repo}/hooks/${id}`);
  }

  async createWebhook(owner: string, repo: string, data: any): Promise<GiteaWebhook> {
    return this.request<GiteaWebhook>('POST', `/repos/${owner}/${repo}/hooks`, data);
  }

  async updateWebhook(owner: string, repo: string, id: number, data: any): Promise<GiteaWebhook> {
    return this.request<GiteaWebhook>('PATCH', `/repos/${owner}/${repo}/hooks/${id}`, data);
  }

  async deleteWebhook(owner: string, repo: string, id: number): Promise<void> {
    await this.request<void>('DELETE', `/repos/${owner}/${repo}/hooks/${id}`);
  }

  async testWebhook(owner: string, repo: string, id: number): Promise<any> {
    return this.request<any>('POST', `/repos/${owner}/${repo}/hooks/${id}/tests`);
  }
}

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
export const giteaClient = new GiteaClient();