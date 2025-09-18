/**
 * Índice de providers VCS
 * Exporta todas as interfaces, classes e funções relacionadas aos providers
 */

// Interfaces e tipos
export * from './types.ts';

// Classe base
export { BaseVcsProvider } from './base-provider.ts';

// Providers específicos
export { GiteaProvider } from './gitea-provider.ts';
export { GitHubProvider } from './github-provider.ts';

// Factory e helpers
export { 
  ProviderFactory, 
  globalProviderFactory, 
  createProviderFromEnv, 
  initializeFactoryFromEnv 
} from './provider-factory.ts';

// Error handling
export { ErrorHandler } from './error-handler.ts';
export type { StandardError } from './error-handler.ts';

// Re-export para compatibilidade
export type { VcsOperations as VcsProviderOperations } from './types.ts';

