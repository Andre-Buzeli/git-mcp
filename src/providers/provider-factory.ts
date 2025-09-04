import { VcsProvider, VcsProviderFactory, VcsOperations, VcsProviderConfig } from './types.js';
import { GiteaProvider } from './gitea-provider.js';
import { GitHubProvider } from './github-provider.js';

/**
 * Factory para criar e gerenciar providers VCS
 * Suporta Gitea e GitHub com configuração flexível
 */
export class ProviderFactory implements VcsProviderFactory {
  private providers: Map<string, VcsOperations> = new Map();
  private defaultProviderName: string = '';

  constructor(config?: VcsProviderConfig) {
    if (config) {
      this.initializeFromConfig(config);
    }
  }

  /**
   * Inicializa a factory a partir de uma configuração
   */
  private initializeFromConfig(config: VcsProviderConfig): void {
    this.defaultProviderName = config.defaultProvider;
    
    for (const providerConfig of config.providers) {
      this.createProvider(providerConfig);
    }
  }

  /**
   * Cria um novo provider baseado na configuração
   */
  createProvider(config: VcsProvider): VcsOperations {
    let provider: VcsOperations;

    switch (config.type) {
      case 'gitea':
        provider = new GiteaProvider(config);
        break;
      case 'github':
        provider = new GitHubProvider(config);
        break;
      default:
        throw new Error(`Provider type '${config.type}' not supported. Supported types: gitea, github`);
    }

    this.providers.set(config.name, provider);
    
    // Se for o primeiro provider, define como padrão
    if (this.providers.size === 1) {
      this.defaultProviderName = config.name;
    }

    return provider;
  }

  /**
   * Obtém um provider pelo nome
   */
  getProvider(name: string): VcsOperations | undefined {
    return this.providers.get(name);
  }

  /**
   * Lista todos os nomes de providers disponíveis
   */
  listProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Obtém o provider padrão
   */
  getDefaultProvider(): VcsOperations {
    if (this.providers.size === 0) {
      throw new Error('No providers configured');
    }

    if (!this.defaultProviderName || !this.providers.has(this.defaultProviderName)) {
      // Se não há provider padrão definido, usa o primeiro disponível
      const firstKey = this.providers.keys().next().value;
      if (firstKey) {
        this.defaultProviderName = firstKey;
      }
    }

    const provider = this.providers.get(this.defaultProviderName);
    if (!provider) {
      throw new Error(`Default provider '${this.defaultProviderName}' not found`);
    }

    return provider;
  }

  /**
   * Define o provider padrão
   */
  setDefaultProvider(name: string): void {
    if (!this.providers.has(name)) {
      throw new Error(`Provider '${name}' not found`);
    }
    this.defaultProviderName = name;
  }

  /**
   * Remove um provider
   */
  removeProvider(name: string): boolean {
    const removed = this.providers.delete(name);
    
    // Se o provider removido era o padrão, redefine o padrão
    if (removed && name === this.defaultProviderName) {
      if (this.providers.size > 0) {
        const firstKey = this.providers.keys().next().value;
        if (firstKey) {
          this.defaultProviderName = firstKey;
        } else {
          this.defaultProviderName = '';
        }
      } else {
        this.defaultProviderName = '';
      }
    }
    
    return removed;
  }

  /**
   * Verifica se um provider existe
   */
  hasProvider(name: string): boolean {
    return this.providers.has(name);
  }

  /**
   * Obtém informações sobre todos os providers
   */
  getProvidersInfo(): Array<{ name: string; type: string; isDefault: boolean }> {
    return Array.from(this.providers.entries()).map(([name, provider]) => ({
      name,
      type: (provider as any).config?.type || 'unknown',
      isDefault: name === this.defaultProviderName
    }));
  }

  /**
   * Limpa todos os providers
   */
  clear(): void {
    this.providers.clear();
    this.defaultProviderName = '';
  }

  /**
   * Obtém o número total de providers
   */
  getProviderCount(): number {
    return this.providers.size;
  }

  /**
   * Verifica se há providers configurados
   */
  isEmpty(): boolean {
    return this.providers.size === 0;
  }
}

/**
 * Factory singleton global para uso em todo o sistema
 */
export const globalProviderFactory = new ProviderFactory();

/**
 * Função helper para criar provider a partir de variáveis de ambiente
 */
export function createProviderFromEnv(providerName: string, providerType: 'gitea' | 'github'): VcsOperations {
  let apiUrl: string;
  let token: string;
  let username: string | undefined;

  switch (providerType) {
    case 'gitea':
      apiUrl = process.env.GITEA_URL || process.env.API_URL || '';
      token = process.env.GITEA_TOKEN || process.env.API_TOKEN || '';
      username = process.env.GITEA_USERNAME || process.env.USERNAME;
      break;
    case 'github':
      apiUrl = process.env.GITHUB_URL || process.env.API_URL || 'https://api.github.com';
      token = process.env.GITHUB_TOKEN || process.env.API_TOKEN || '';
      username = process.env.GITHUB_USERNAME || process.env.USERNAME;
      break;
    default:
      throw new Error(`Provider type '${providerType}' not supported`);
  }

  if (!apiUrl) {
    throw new Error(`API URL not configured for ${providerType}`);
  }

  if (!token) {
    throw new Error(`API token not configured for ${providerType}`);
  }

  const config: VcsProvider = {
    name: providerName,
    type: providerType,
    apiUrl,
    token,
    username
  };

  return globalProviderFactory.createProvider(config);
}

/**
 * Função helper para inicializar factory a partir de variáveis de ambiente
 */
export function initializeFactoryFromEnv(): ProviderFactory {
  const providers: VcsProvider[] = [];
  let defaultProvider = '';

  // Verifica se há configuração multi-provider
  const providersJson = process.env.PROVIDERS_JSON;
  if (providersJson) {
    try {
      const config = JSON.parse(providersJson);
      if (config.providers && Array.isArray(config.providers)) {
        for (const providerConfig of config.providers) {
          if (providerConfig.name && providerConfig.type && providerConfig.apiUrl && providerConfig.token) {
            providers.push(providerConfig);
          }
        }
        defaultProvider = config.defaultProvider || (providers[0]?.name || '');
      }
    } catch (error) {
      console.error('Error parsing PROVIDERS_JSON:', error);
    }
  }

  // Se não há configuração multi-provider, tenta configuração individual
  if (providers.length === 0) {
    // Auto-detectar configuração multi-provider se ambos Gitea e GitHub estão configurados
    if (process.env.GITEA_URL && process.env.GITEA_TOKEN && process.env.GITHUB_TOKEN) {
      // Configuração multi-provider com Gitea como padrão
      providers.push({
        name: 'gitea',
        type: 'gitea',
        apiUrl: process.env.GITEA_URL,
        token: process.env.GITEA_TOKEN,
        username: process.env.GITEA_USERNAME
      });
      providers.push({
        name: 'github',
        type: 'github',
        apiUrl: process.env.GITHUB_URL || 'https://api.github.com',
        token: process.env.GITHUB_TOKEN,
        username: process.env.GITHUB_USERNAME
      });
      defaultProvider = 'gitea';
    } else {
      // Tenta Gitea
      if (process.env.GITEA_URL && process.env.GITEA_TOKEN) {
        providers.push({
          name: 'gitea',
          type: 'gitea',
          apiUrl: process.env.GITEA_URL,
          token: process.env.GITEA_TOKEN,
          username: process.env.GITEA_USERNAME
        });
        defaultProvider = 'gitea';
      }

      // Tenta GitHub
      if (process.env.GITHUB_TOKEN) {
        providers.push({
          name: 'github',
          type: 'github',
          apiUrl: process.env.GITHUB_URL || 'https://api.github.com',
          token: process.env.GITHUB_TOKEN,
          username: process.env.GITHUB_USERNAME
        });
        if (!defaultProvider) {
          defaultProvider = 'github';
        }
      }
    }

    // Tenta configuração genérica
    if (process.env.API_URL && process.env.API_TOKEN && providers.length === 0) {
      const providerType = process.env.PROVIDER as 'gitea' | 'github' || 'gitea';
      providers.push({
        name: providerType,
        type: providerType,
        apiUrl: process.env.API_URL,
        token: process.env.API_TOKEN,
        username: process.env.USERNAME
      });
      defaultProvider = providerType;
    }
  }

  if (providers.length === 0) {
    throw new Error('No VCS providers configured. Please set environment variables for Gitea or GitHub.');
  }

  const config: VcsProviderConfig = {
    defaultProvider,
    providers
  };

  return new ProviderFactory(config);
}
