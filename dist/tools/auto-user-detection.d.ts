/**
 * Auto-detecção de usuário para tools
 *
 * Este módulo fornece funções para auto-detectar o usuário atual
 * baseado no token de autenticação, evitando a necessidade de
 * passar owner/username em cada tool call.
 */
/**
 * Interface para parâmetros que podem ter owner/username
 */
export interface AutoUserParams {
    owner?: string;
    username?: string;
    provider?: string;
}
/**
 * Aplica auto-detecção de usuário aos parâmetros
 *
 * @param params Parâmetros da tool
 * @param actionsForOwner Ações que requerem owner
 * @param actionsForUsername Ações que requerem username
 * @returns Parâmetros atualizados com usuário auto-detectado
 */
export declare function applyAutoUserDetection(params: AutoUserParams, actionsForOwner?: string[], actionsForUsername?: string[], action?: string): Promise<AutoUserParams>;
/**
 * Configurações padrão para auto-detecção por tool
 */
export declare const AUTO_USER_CONFIG: {
    repositories: {
        ownerActions: string[];
        usernameActions: string[];
    };
    branches: {
        ownerActions: string[];
        usernameActions: never[];
    };
    files: {
        ownerActions: string[];
        usernameActions: never[];
    };
    commits: {
        ownerActions: string[];
        usernameActions: never[];
    };
    issues: {
        ownerActions: string[];
        usernameActions: never[];
    };
    pulls: {
        ownerActions: string[];
        usernameActions: never[];
    };
    releases: {
        ownerActions: string[];
        usernameActions: never[];
    };
    tags: {
        ownerActions: string[];
        usernameActions: never[];
    };
    users: {
        ownerActions: never[];
        usernameActions: string[];
    };
    webhooks: {
        ownerActions: string[];
        usernameActions: never[];
    };
    workflows: {
        ownerActions: string[];
        usernameActions: never[];
    };
    actions: {
        ownerActions: string[];
        usernameActions: never[];
    };
    deployments: {
        ownerActions: string[];
        usernameActions: never[];
    };
    security: {
        ownerActions: string[];
        usernameActions: never[];
    };
    analytics: {
        ownerActions: string[];
        usernameActions: never[];
    };
    'code-review': {
        ownerActions: string[];
        usernameActions: never[];
    };
};
/**
 * Aplica auto-detecção para uma tool específica
 *
 * @param toolName Nome da tool
 * @param params Parâmetros da tool
 * @param action Ação sendo executada
 * @returns Parâmetros atualizados
 */
export declare function applyAutoUserForTool(toolName: keyof typeof AUTO_USER_CONFIG, params: AutoUserParams, action?: string): Promise<AutoUserParams>;
//# sourceMappingURL=auto-user-detection.d.ts.map