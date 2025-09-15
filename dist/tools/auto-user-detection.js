"use strict";
/**
 * Auto-detecção de usuário para tools
 *
 * Este módulo fornece funções para auto-detectar o usuário atual
 * baseado no token de autenticação, evitando a necessidade de
 * passar owner/username em cada tool call.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTO_USER_CONFIG = void 0;
exports.applyAutoUserDetection = applyAutoUserDetection;
exports.applyAutoUserForTool = applyAutoUserForTool;
const user_helper_js_1 = require("./user-helper.js");
/**
 * Aplica auto-detecção de usuário aos parâmetros
 *
 * @param params Parâmetros da tool
 * @param actionsForOwner Ações que requerem owner
 * @param actionsForUsername Ações que requerem username
 * @returns Parâmetros atualizados com usuário auto-detectado
 */
async function applyAutoUserDetection(params, actionsForOwner = [], actionsForUsername = [], action) {
    const updatedParams = { ...params };
    try {
        // Auto-detectar owner se necessário
        if (!updatedParams.owner && action && actionsForOwner.includes(action)) {
            updatedParams.owner = await (0, user_helper_js_1.getCurrentUser)(updatedParams.provider);
        }
        // Auto-detectar username se necessário
        if (!updatedParams.username && action && actionsForUsername.includes(action)) {
            updatedParams.username = await (0, user_helper_js_1.getCurrentUser)(updatedParams.provider);
        }
        // Para ações de list, se nem username nem owner foram fornecidos, usa owner como fallback
        if (action === 'list' && !updatedParams.username && !updatedParams.owner) {
            updatedParams.username = await (0, user_helper_js_1.getCurrentUser)(updatedParams.provider);
        }
        return updatedParams;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (action && actionsForOwner.includes(action)) {
            throw new Error(`Owner é obrigatório para a ação '${action}' e não foi possível auto-detectar o usuário atual. Erro: ${errorMessage}`);
        }
        if (action && actionsForUsername.includes(action)) {
            throw new Error(`Username é obrigatório para a ação '${action}' e não foi possível auto-detectar o usuário atual. Erro: ${errorMessage}`);
        }
        throw error;
    }
}
/**
 * Configurações padrão para auto-detecção por tool
 */
exports.AUTO_USER_CONFIG = {
    repositories: {
        ownerActions: ['get', 'update', 'delete', 'fork', 'archive', 'transfer'],
        usernameActions: ['list']
    },
    branches: {
        ownerActions: ['create', 'list', 'get', 'delete', 'merge', 'compare'],
        usernameActions: []
    },
    files: {
        ownerActions: ['get', 'create', 'update', 'delete', 'list'],
        usernameActions: []
    },
    commits: {
        ownerActions: ['list', 'get', 'create', 'compare', 'search'],
        usernameActions: []
    },
    issues: {
        ownerActions: ['create', 'list', 'get', 'update', 'close', 'comment', 'search'],
        usernameActions: []
    },
    pulls: {
        ownerActions: ['create', 'list', 'get', 'update', 'merge', 'close', 'review', 'search'],
        usernameActions: []
    },
    releases: {
        ownerActions: ['create', 'list', 'get', 'update', 'delete', 'publish'],
        usernameActions: []
    },
    tags: {
        ownerActions: ['create', 'list', 'get', 'delete', 'search'],
        usernameActions: []
    },
    users: {
        ownerActions: [],
        usernameActions: ['get', 'list', 'search']
    },
    webhooks: {
        ownerActions: ['create', 'list', 'get', 'update', 'delete'],
        usernameActions: []
    },
    workflows: {
        ownerActions: ['list', 'create', 'trigger', 'status', 'logs', 'disable', 'enable'],
        usernameActions: []
    },
    actions: {
        ownerActions: ['list-runs', 'cancel', 'rerun', 'artifacts', 'secrets', 'jobs', 'download-artifact'],
        usernameActions: []
    },
    deployments: {
        ownerActions: ['list', 'create', 'status', 'environments', 'rollback', 'delete'],
        usernameActions: []
    },
    security: {
        ownerActions: ['scan', 'vulnerabilities', 'alerts', 'policies', 'compliance', 'dependencies', 'advisories'],
        usernameActions: []
    },
    analytics: {
        ownerActions: ['traffic', 'contributors', 'activity', 'performance', 'reports', 'trends', 'insights'],
        usernameActions: []
    },
    'code-review': {
        ownerActions: ['analyze', 'review-file', 'review-commit', 'review-pr', 'generate-report', 'apply-suggestions'],
        usernameActions: []
    }
};
/**
 * Aplica auto-detecção para uma tool específica
 *
 * @param toolName Nome da tool
 * @param params Parâmetros da tool
 * @param action Ação sendo executada
 * @returns Parâmetros atualizados
 */
async function applyAutoUserForTool(toolName, params, action) {
    const config = exports.AUTO_USER_CONFIG[toolName];
    if (!config) {
        return params;
    }
    return applyAutoUserDetection(params, config.ownerActions, config.usernameActions, action);
}
//# sourceMappingURL=auto-user-detection.js.map