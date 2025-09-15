"use strict";
/**
 * Helper para obter usuário atual automaticamente
 *
 * Este módulo evita dependências circulares ao fornecer
 * funcionalidade de auto-detecção de usuário.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = getCurrentUser;
const index_js_1 = require("../providers/index.js");
/**
 * Obtém o usuário atual baseado no token de autenticação
 *
 * @param provider Nome do provider (opcional)
 * @returns Login do usuário atual
 */
async function getCurrentUser(provider) {
    try {
        const factory = index_js_1.globalProviderFactory;
        let providerInstance;
        if (provider) {
            providerInstance = factory.getProvider(provider);
        }
        else {
            providerInstance = factory.getDefaultProvider();
        }
        if (!providerInstance) {
            throw new Error('No provider available');
        }
        const userInfo = await providerInstance.getCurrentUser();
        return userInfo.login;
    }
    catch (error) {
        console.warn('Failed to get current user:', error);
        throw new Error('Unable to determine current user. Please provide owner/username explicitly.');
    }
}
//# sourceMappingURL=user-helper.js.map