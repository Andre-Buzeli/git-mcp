/**
 * Utilitário para auto-detecção de usuário
 * Isolado para evitar dependências circulares
 */

import { globalProviderFactory } from '../providers/index.js';
import { UserInfo } from '../providers/types.js';

/**
 * Obtém o usuário atual do provider ativo
 * @param provider Nome do provider (opcional)
 * @returns Informações do usuário atual
 */
export async function getCurrentUser(provider?: string): Promise<UserInfo> {
  try {
    const providerInstance = provider 
      ? globalProviderFactory.getProvider(provider)
      : globalProviderFactory.getDefaultProvider();
    
    if (!providerInstance) {
      throw new Error(`Provider '${provider}' not found`);
    }
    
    return await providerInstance.getCurrentUser();
  } catch (error) {
    throw new Error(`Failed to get current user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Obtém o username do usuário atual
 * @param provider Nome do provider (opcional)
 * @returns Username do usuário atual
 */
export async function getCurrentUsername(provider?: string): Promise<string> {
  try {
    const userInfo = await getCurrentUser(provider);
    return userInfo.login;
  } catch (error) {
    throw new Error(`Failed to get current username: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Aplica auto-detecção de usuário nos parâmetros de uma tool
 * @param params Parâmetros da tool
 * @param provider Nome do provider (opcional)
 * @returns Parâmetros atualizados com usuário detectado
 */
export async function applyAutoUserDetection(params: any, provider?: string): Promise<any> {
  const updatedParams = { ...params };
  
  try {
    // Se owner não foi fornecido, usar usuário atual
    if (!updatedParams.owner) {
      updatedParams.owner = await getCurrentUsername(provider);
    }
    
    // Se username não foi fornecido, usar usuário atual
    if (!updatedParams.username) {
      updatedParams.username = await getCurrentUsername(provider);
    }
    
    return updatedParams;
  } catch (error) {
    // Se falhar na auto-detecção, retornar parâmetros originais
    console.warn('Auto-user detection failed:', error instanceof Error ? error.message : 'Unknown error');
    return updatedParams;
  }
}
