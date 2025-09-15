/**
 * Utilitário para auto-detecção de usuário
 * Isolado para evitar dependências circulares
 */
import { UserInfo } from '../providers/types.js';
/**
 * Obtém o usuário atual do provider ativo
 * @param provider Nome do provider (opcional)
 * @returns Informações do usuário atual
 */
export declare function getCurrentUser(provider?: string): Promise<UserInfo>;
/**
 * Obtém o username do usuário atual
 * @param provider Nome do provider (opcional)
 * @returns Username do usuário atual
 */
export declare function getCurrentUsername(provider?: string): Promise<string>;
/**
 * Aplica auto-detecção de usuário nos parâmetros de uma tool
 * @param params Parâmetros da tool
 * @param provider Nome do provider (opcional)
 * @returns Parâmetros atualizados com usuário detectado
 */
export declare function applyAutoUserDetection(params: any, provider?: string): Promise<any>;
//# sourceMappingURL=user-detection.d.ts.map