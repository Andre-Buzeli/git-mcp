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
export declare class GiteaClient {
    private axios;
    private baseURL;
    private providerFactory;
    constructor();
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
    private request;
    getRepositories(username?: string, page?: number, limit?: number): Promise<GiteaRepository[]>;
    getRepository(owner: string, repo: string): Promise<GiteaRepository>;
    createRepository(data: any): Promise<GiteaRepository>;
    updateRepository(owner: string, repo: string, data: any): Promise<GiteaRepository>;
    deleteRepository(owner: string, repo: string): Promise<void>;
    forkRepository(owner: string, repo: string, organization?: string): Promise<GiteaRepository>;
    searchRepositories(query: string, page?: number, limit?: number): Promise<{
        data: GiteaRepository[];
    }>;
    getBranches(owner: string, repo: string, page?: number, limit?: number): Promise<GiteaBranch[]>;
    getBranch(owner: string, repo: string, branch: string): Promise<GiteaBranch>;
    createBranch(owner: string, repo: string, branchName: string, fromBranch: string): Promise<GiteaBranch>;
    deleteBranch(owner: string, repo: string, branch: string): Promise<void>;
    getFile(owner: string, repo: string, path: string, ref?: string): Promise<GiteaFile>;
    getDirectoryContents(owner: string, repo: string, path?: string, ref?: string): Promise<GiteaFile[]>;
    createFile(owner: string, repo: string, path: string, data: any): Promise<any>;
    updateFile(owner: string, repo: string, path: string, data: any): Promise<any>;
    deleteFile(owner: string, repo: string, path: string, data: any): Promise<any>;
    getCommits(owner: string, repo: string, page?: number, limit?: number, sha?: string): Promise<GiteaCommit[]>;
    getCommit(owner: string, repo: string, sha: string): Promise<GiteaCommit>;
    getIssues(owner: string, repo: string, state?: string, page?: number, limit?: number): Promise<GiteaIssue[]>;
    getIssue(owner: string, repo: string, index: number): Promise<GiteaIssue>;
    createIssue(owner: string, repo: string, data: any): Promise<GiteaIssue>;
    updateIssue(owner: string, repo: string, index: number, data: any): Promise<GiteaIssue>;
    createIssueComment(owner: string, repo: string, index: number, body: string): Promise<any>;
    getPullRequests(owner: string, repo: string, state?: string, page?: number, limit?: number): Promise<GiteaPullRequest[]>;
    getPullRequest(owner: string, repo: string, index: number): Promise<GiteaPullRequest>;
    createPullRequest(owner: string, repo: string, data: any): Promise<GiteaPullRequest>;
    updatePullRequest(owner: string, repo: string, index: number, data: any): Promise<GiteaPullRequest>;
    mergePullRequest(owner: string, repo: string, index: number, data: any): Promise<any>;
    getReleases(owner: string, repo: string, page?: number, limit?: number): Promise<GiteaRelease[]>;
    getRelease(owner: string, repo: string, id: number): Promise<GiteaRelease>;
    getLatestRelease(owner: string, repo: string): Promise<GiteaRelease>;
    createRelease(owner: string, repo: string, data: any): Promise<GiteaRelease>;
    updateRelease(owner: string, repo: string, id: number, data: any): Promise<GiteaRelease>;
    deleteRelease(owner: string, repo: string, id: number): Promise<void>;
    getTags(owner: string, repo: string, page?: number, limit?: number): Promise<GiteaTag[]>;
    createTag(owner: string, repo: string, data: any): Promise<any>;
    deleteTag(owner: string, repo: string, tag: string): Promise<void>;
    getCurrentUser(): Promise<GiteaUser>;
    getUser(username: string): Promise<GiteaUser>;
    searchUsers(query: string, page?: number, limit?: number): Promise<{
        data: GiteaUser[];
    }>;
    getUserOrganizations(username: string): Promise<any[]>;
    getWebhooks(owner: string, repo: string): Promise<GiteaWebhook[]>;
    getWebhook(owner: string, repo: string, id: number): Promise<GiteaWebhook>;
    createWebhook(owner: string, repo: string, data: any): Promise<GiteaWebhook>;
    updateWebhook(owner: string, repo: string, id: number, data: any): Promise<GiteaWebhook>;
    deleteWebhook(owner: string, repo: string, id: number): Promise<void>;
    testWebhook(owner: string, repo: string, id: number): Promise<any>;
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
export declare const giteaClient: GiteaClient;
//# sourceMappingURL=client.d.ts.map