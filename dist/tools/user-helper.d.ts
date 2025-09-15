/**
 * Helper para obter usuário atual automaticamente
 *
 * Este módulo evita dependências circulares ao fornecer
 * funcionalidade de auto-detecção de usuário.
 */
/**
 * Obtém o usuário atual baseado no token de autenticação
 *
 * @param provider Nome do provider (opcional)
 * @returns Login do usuário atual
 */
export declare function getCurrentUser(provider?: string): Promise<string>;
//# sourceMappingURL=user-helper.d.ts.map