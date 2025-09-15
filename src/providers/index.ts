/**
 * Índice de providers VCS
 * Exporta todas as interfaces, classes e funções relacionadas aos providers
 */

// Interfaces e tipos
export * from './types.js';

// Classe base
export { BaseVcsProvider } from './base-provider.js';

// Providers específicos
export { GiteaProvider } from './gitea-provider.js';
export { GitHubProvider } from './github-provider.js';

// Factory e helpers
export { 
  ProviderFactory, 
  globalProviderFactory, 
  createProviderFromEnv, 
  initializeFactoryFromEnv 
} from './provider-factory.js';

// Error handling
export { ErrorHandler } from './error-handler.js';
export type { StandardError } from './error-handler.js';

// Re-export para compatibilidade
export type { VcsOperations as VcsProviderOperations } from './types.js';
