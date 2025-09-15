import { z } from 'zod';
/**
 * Schema de validação para configuração do servidor MCP Gitea
 *
 * VALIDAÇÕES:
 * - giteaUrl: Deve ser uma URL válida
 * - giteaToken: Deve ter pelo menos 1 caractere
 * - giteaUsername: Opcional
 * - debug: Padrão false
 * - timeout: Deve ser positivo, padrão 30000ms
 *
 * RECOMENDAÇÕES:
 * - Use HTTPS para produção
 * - Token deve ter permissões adequadas
 * - Timeout deve considerar latência da rede
 */
declare const ConfigSchema: z.ZodEffects<z.ZodObject<{
    giteaUrl: z.ZodOptional<z.ZodString>;
    giteaToken: z.ZodOptional<z.ZodString>;
    giteaUsername: z.ZodOptional<z.ZodString>;
    githubToken: z.ZodOptional<z.ZodString>;
    provider: z.ZodOptional<z.ZodEnum<["gitea", "github"]>>;
    apiUrl: z.ZodOptional<z.ZodString>;
    apiToken: z.ZodOptional<z.ZodString>;
    defaultProvider: z.ZodOptional<z.ZodString>;
    providersJson: z.ZodEffects<z.ZodOptional<z.ZodString>, any, string | undefined>;
    debug: z.ZodDefault<z.ZodBoolean>;
    timeout: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    debug: boolean;
    timeout: number;
    giteaUrl?: string | undefined;
    giteaToken?: string | undefined;
    giteaUsername?: string | undefined;
    githubToken?: string | undefined;
    provider?: "gitea" | "github" | undefined;
    apiUrl?: string | undefined;
    apiToken?: string | undefined;
    defaultProvider?: string | undefined;
    providersJson?: any;
}, {
    giteaUrl?: string | undefined;
    giteaToken?: string | undefined;
    giteaUsername?: string | undefined;
    githubToken?: string | undefined;
    provider?: "gitea" | "github" | undefined;
    apiUrl?: string | undefined;
    apiToken?: string | undefined;
    defaultProvider?: string | undefined;
    providersJson?: string | undefined;
    debug?: boolean | undefined;
    timeout?: number | undefined;
}>, {
    debug: boolean;
    timeout: number;
    giteaUrl?: string | undefined;
    giteaToken?: string | undefined;
    giteaUsername?: string | undefined;
    githubToken?: string | undefined;
    provider?: "gitea" | "github" | undefined;
    apiUrl?: string | undefined;
    apiToken?: string | undefined;
    defaultProvider?: string | undefined;
    providersJson?: any;
}, {
    giteaUrl?: string | undefined;
    giteaToken?: string | undefined;
    giteaUsername?: string | undefined;
    githubToken?: string | undefined;
    provider?: "gitea" | "github" | undefined;
    apiUrl?: string | undefined;
    apiToken?: string | undefined;
    defaultProvider?: string | undefined;
    providersJson?: string | undefined;
    debug?: boolean | undefined;
    timeout?: number | undefined;
}>;
export type Config = z.infer<typeof ConfigSchema>;
export interface ProviderConfig {
    name: string;
    type: 'gitea' | 'github';
    apiUrl: string;
    token: string;
    username?: string;
}
export interface MultiProviderConfig {
    defaultProvider: string;
    providers: ProviderConfig[];
}
/**
 * Gerenciador de configuração usando padrão Singleton
 *
 * RESPONSABILIDADES:
 * - Carregar configuração do ambiente
 * - Validar parâmetros obrigatórios
 * - Fornecer acesso centralizado à configuração
 *
 * USO:
 * - const config = ConfigManager.getInstance();
 * - const url = config.getGiteaUrl();
 *
 * RECOMENDAÇÕES:
 * - Sempre use getInstance() para acessar
 * - Configure variáveis de ambiente adequadamente
 * - Valide configuração antes de usar
 */
export declare class ConfigManager {
    private static instance;
    private config;
    private constructor();
    /**
     * Obtém a instância única do ConfigManager
     *
     * IMPLEMENTAÇÃO:
     * - Singleton pattern para configuração global
     * - Thread-safe para aplicações concorrentes
     *
     * RETORNO:
     * - Instância única do ConfigManager
     */
    static getInstance(): ConfigManager;
    /**
     * Carrega e valida a configuração do ambiente
     *
     * FONTES DE CONFIGURAÇÃO:
     * - Variáveis de ambiente (prioridade alta)
     * - Valores padrão (fallback)
     *
     * VALIDAÇÃO:
     * - Schema Zod para validação rigorosa
     * - Mensagens de erro descritivas
     *
     * ERROS:
     * - Configuração inválida gera exceção
     * - Token obrigatório deve ser fornecido
     */
    private loadConfig;
    /**
     * Obtém a configuração completa validada
     *
     * RETORNO:
     * - Objeto Config com todos os parâmetros
     *
     * USO:
     * - Para acesso direto à configuração
     * - Para validação de parâmetros
     */
    getConfig(): Config;
    /**
     * Obtém a URL base do Gitea
     *
     * RETORNO:
     * - URL completa do servidor Gitea
     *
     * EXEMPLO:
     * - http://gitea.local:3000
     * - https://gitea.company.com
     */
    getGiteaUrl(): string | undefined;
    /**
     * Obtém o token de autenticação
     *
     * SEGURANÇA:
     * - Token deve ser mantido seguro
     * - Não logar em produção
     * - Rotacionar periodicamente
     *
     * RETORNO:
     * - Token de acesso pessoal
     */
    getGiteaToken(): string | undefined;
    /**
     * Obtém o nome de usuário configurado
     *
     * RETORNO:
     * - Nome de usuário ou undefined
     *
     * USO:
     * - Para operações específicas do usuário
     * - Para identificação em logs
     */
    getGiteaUsername(): string | undefined;
    /**
     * Verifica se o modo debug está ativo
     *
     * RETORNO:
     * - true se debug ativo, false caso contrário
     *
     * RECOMENDAÇÕES:
     * - Use apenas em desenvolvimento
     * - Desative em produção
     * - Configure via DEBUG=true
     */
    isDebug(): boolean;
    /**
     * Obtém o timeout das requisições HTTP
     *
     * RETORNO:
     * - Timeout em milissegundos
     *
     * RECOMENDAÇÕES:
     * - 30000ms para redes locais
     * - 60000ms para redes com latência
     * - Configure via TIMEOUT=60000
     */
    getTimeout(): number;
    /**
     * Obtém o tipo de provider configurado
     *
     * RETORNO:
     * - Tipo do provider ('gitea' ou 'github')
     */
    getProvider(): 'gitea' | 'github' | undefined;
    /**
     * Obtém a URL da API genérica
     *
     * RETORNO:
     * - URL da API ou undefined
     */
    getApiUrl(): string | undefined;
    /**
     * Obtém o token da API genérica
     *
     * RETORNO:
     * - Token da API ou undefined
     */
    getApiToken(): string | undefined;
    /**
     * Obtém o token do GitHub
     *
     * RETORNO:
     * - Token do GitHub ou undefined
     */
    getGitHubToken(): string | undefined;
    /**
     * Obtém o provider padrão configurado
     *
     * RETORNO:
     * - Nome do provider padrão ou undefined
     */
    getDefaultProvider(): string | undefined;
    /**
     * Obtém a configuração multi-provider
     *
     * RETORNO:
     * - Configuração multi-provider parseada ou undefined
     */
    getProvidersJson(): MultiProviderConfig | undefined;
    /**
     * Verifica se está usando configuração multi-provider
     *
     * RETORNO:
     * - true se usando multi-provider, false caso contrário
     */
    isMultiProvider(): boolean;
    /**
     * Verifica se está usando configuração genérica
     *
     * RETORNO:
     * - true se usando configuração genérica, false caso contrário
     */
    isGenericConfig(): boolean;
    /**
     * Verifica se está usando configuração legacy do Gitea
     *
     * RETORNO:
     * - true se usando configuração legacy, false caso contrário
     */
    isLegacyGitea(): boolean;
    /**
     * Verifica se está em modo demo
     *
     * RETORNO:
     * - true se em modo demo, false caso contrário
     */
    isDemoMode(): boolean;
    /**
     * Obtém configuração demo para testes
     *
     * RETORNO:
     * - Configuração mock para modo demo
     */
    getDemoConfig(): MultiProviderConfig;
}
/**
 * Instância global do ConfigManager
 *
 * USO DIRETO:
 * - import { config } from './config.js';
 * - const url = config.getGiteaUrl();
 *
 * RECOMENDAÇÕES:
 * - Use esta instância para acesso direto
 * - Não crie novas instâncias
 * - Configure antes de usar
 */
export declare const config: ConfigManager;
export {};
//# sourceMappingURL=config.d.ts.map