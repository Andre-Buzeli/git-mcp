import { VcsProvider, VcsProviderFactory, VcsOperations, VcsProviderConfig } from './types.js';
/**
 * Factory para criar e gerenciar providers VCS
 * Suporta Gitea e GitHub com configuração flexível
 */
export declare class ProviderFactory implements VcsProviderFactory {
    private providers;
    private defaultProviderName;
    constructor(config?: VcsProviderConfig);
    /**
     * Inicializa a factory a partir de uma configuração
     */
    private initializeFromConfig;
    /**
     * Cria um novo provider baseado na configuração
     */
    createProvider(config: VcsProvider): VcsOperations;
    /**
     * Obtém um provider pelo nome
     */
    getProvider(name: string): VcsOperations | undefined;
    /**
     * Lista todos os nomes de providers disponíveis
     */
    listProviders(): string[];
    /**
     * Obtém o provider padrão
     */
    getDefaultProvider(): VcsOperations;
    /**
     * Define o provider padrão
     */
    setDefaultProvider(name: string): void;
    /**
     * Remove um provider
     */
    removeProvider(name: string): boolean;
    /**
     * Verifica se um provider existe
     */
    hasProvider(name: string): boolean;
    /**
     * Obtém informações sobre todos os providers
     */
    getProvidersInfo(): Array<{
        name: string;
        type: string;
        isDefault: boolean;
    }>;
    /**
     * Limpa todos os providers
     */
    clear(): void;
    /**
     * Obtém o número total de providers
     */
    getProviderCount(): number;
    /**
     * Verifica se há providers configurados
     */
    isEmpty(): boolean;
}
/**
 * Factory singleton global para uso em todo o sistema
 */
export declare const globalProviderFactory: ProviderFactory;
/**
 * Função helper para criar provider a partir de variáveis de ambiente
 */
export declare function createProviderFromEnv(providerName: string, providerType: 'gitea' | 'github'): VcsOperations;
/**
 * Função helper para inicializar factory a partir de variáveis de ambiente
 */
export declare function initializeFactoryFromEnv(): ProviderFactory;
//# sourceMappingURL=provider-factory.d.ts.map