"use strict";
/**
 * Utilitário para auto-detecção de usuário
 * Isolado para evitar dependências circulares
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = getCurrentUser;
exports.getCurrentUsername = getCurrentUsername;
exports.applyAutoUserDetection = applyAutoUserDetection;
const index_ts_1 = require("../providers/index.ts");
/**
 * Obtém o usuário atual do provider ativo
 * @param provider Nome do provider (opcional)
 * @returns Informações do usuário atual
 */
async function getCurrentUser(provider) {
    try {
        const providerInstance = provider
            ? index_ts_1.globalProviderFactory.getProvider(provider)
            : index_ts_1.globalProviderFactory.getDefaultProvider();
        if (!providerInstance) {
            throw new Error(`Provider '${provider}' not found`);
        }
        return await providerInstance.getCurrentUser();
    }
    catch (error) {
        throw new Error(`Failed to get current user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Obtém o username do usuário atual
 * @param provider Nome do provider (opcional)
 * @returns Username do usuário atual
 */
async function getCurrentUsername(provider) {
    try {
        const userInfo = await getCurrentUser(provider);
        return userInfo.login;
    }
    catch (error) {
        throw new Error(`Failed to get current username: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Aplica auto-detecção de usuário nos parâmetros de uma tool
 * @param params Parâmetros da tool
 * @param provider Nome do provider (opcional)
 * @returns Parâmetros atualizados com usuário detectado
 */
async function applyAutoUserDetection(params, provider) {
    // Retornar os parâmetros originais pois o owner agora é detectado internamente nos métodos
    return params;
}
//# sourceMappingURL=user-detection.js.map