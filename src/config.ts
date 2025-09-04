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
const ConfigSchema = z.object({
  // Configuração legacy para Gitea
  giteaUrl: z.string().url().optional(),
  giteaToken: z.string().min(1).optional(),
  giteaUsername: z.string().optional(),
  
  // Configuração para GitHub
  githubToken: z.string().min(1).optional(),
  
  // Configuração genérica para multi-provider
  provider: z.enum(['gitea', 'github']).optional(),
  apiUrl: z.string().url().optional(),
  apiToken: z.string().min(1).optional(),
  
  // Configuração multi-provider
  defaultProvider: z.string().optional(),
  providersJson: z.string().optional().transform(val => {
    if (val) {
      try {
        return JSON.parse(val);
      } catch (e) {
        console.error("Error parsing PROVIDERS_JSON:", e);
        return undefined;
      }
    }
    return undefined;
  }),
  
  // Configurações gerais
  debug: z.boolean().default(false),
  timeout: z.number().positive().default(30000),
}).superRefine((data, ctx) => {
  // Validação: deve ter pelo menos uma configuração válida
  const hasGiteaConfig = data.giteaUrl && data.giteaToken;
  const hasGitHubConfig = data.githubToken;
  const hasGenericConfig = data.apiUrl && data.apiToken;
  const hasMultiProviderConfig = data.providersJson;
  
  const configCount = [hasGiteaConfig, hasGitHubConfig, hasGenericConfig, hasMultiProviderConfig].filter(Boolean).length;
  
  if (configCount === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Configuration required: At least one provider configuration must be provided (GITEA_URL+GITEA_TOKEN, GITHUB_TOKEN, API_URL+API_TOKEN, or PROVIDERS_JSON).",
      path: ['giteaUrl', 'githubToken', 'apiUrl', 'providersJson'],
    });
  }
  
  // Se provider é especificado, apiUrl e apiToken são obrigatórios
  if (data.provider && (!data.apiUrl || !data.apiToken)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "When provider is specified, both apiUrl and apiToken are required.",
      path: ['apiUrl', 'apiToken'],
    });
  }
});

export type Config = z.infer<typeof ConfigSchema>;

// Tipo para configuração de provider individual
export interface ProviderConfig {
  name: string;
  type: 'gitea' | 'github';
  apiUrl: string;
  token: string;
  username?: string;
}

// Tipo para configuração multi-provider
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
export class ConfigManager {
  private static instance: ConfigManager;
  private config: Config;

  private constructor() {
    this.config = this.loadConfig();
  }

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
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

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
  private loadConfig(): Config {
    const config = {
      // Configuração legacy para Gitea
      giteaUrl: process.env.GITEA_URL,
      giteaToken: process.env.GITEA_TOKEN,
      giteaUsername: process.env.GITEA_USERNAME,
      
      // Configuração para GitHub
      githubToken: process.env.GITHUB_TOKEN,
      
      // Configuração genérica para multi-provider
      provider: (process.env.PROVIDER as 'gitea' | 'github'),
      apiUrl: process.env.API_URL,
      apiToken: process.env.API_TOKEN,
      
      // Configuração multi-provider
      defaultProvider: process.env.DEFAULT_PROVIDER,
      providersJson: process.env.PROVIDERS_JSON,
      
      // Configurações gerais
      debug: process.env.DEBUG === 'true',
      timeout: parseInt(process.env.TIMEOUT || '30000'),
    };

            // Auto-detectar configuração multi-provider se ambos Gitea e GitHub estão configurados
        if (config.giteaUrl && config.giteaToken && config.githubToken && !config.providersJson) {
          config.providersJson = JSON.stringify({
        defaultProvider: 'gitea',
        providers: [
          {
            name: 'gitea',
            type: 'gitea',
            apiUrl: config.giteaUrl,
            token: config.giteaToken,
            username: config.giteaUsername
          },
          {
            name: 'github',
            type: 'github',
            apiUrl: 'https://api.github.com',
            token: config.githubToken
          }
        ]
      });
    }

    try {
      return ConfigSchema.parse(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
        throw new Error(`Configuration validation failed: ${issues}`);
      }
      throw error;
    }
  }

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
  public getConfig(): Config {
    return this.config;
  }

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
  public getGiteaUrl(): string | undefined {
    return this.config.giteaUrl;
  }

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
  public getGiteaToken(): string | undefined {
    return this.config.giteaToken;
  }

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
  public getGiteaUsername(): string | undefined {
    return this.config.giteaUsername;
  }

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
  public isDebug(): boolean {
    return this.config.debug;
  }

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
  public getTimeout(): number {
    return this.config.timeout;
  }

  /**
   * Obtém o tipo de provider configurado
   * 
   * RETORNO:
   * - Tipo do provider ('gitea' ou 'github')
   */
  public getProvider(): 'gitea' | 'github' | undefined {
    return this.config.provider;
  }

  /**
   * Obtém a URL da API genérica
   * 
   * RETORNO:
   * - URL da API ou undefined
   */
  public getApiUrl(): string | undefined {
    return this.config.apiUrl;
  }

  /**
   * Obtém o token da API genérica
   * 
   * RETORNO:
   * - Token da API ou undefined
   */
  public getApiToken(): string | undefined {
    return this.config.apiToken;
  }

  /**
   * Obtém o token do GitHub
   * 
   * RETORNO:
   * - Token do GitHub ou undefined
   */
  public getGitHubToken(): string | undefined {
    return this.config.githubToken;
  }

  /**
   * Obtém o provider padrão configurado
   * 
   * RETORNO:
   * - Nome do provider padrão ou undefined
   */
  public getDefaultProvider(): string | undefined {
    return this.config.defaultProvider;
  }

  /**
   * Obtém a configuração multi-provider
   * 
   * RETORNO:
   * - Configuração multi-provider parseada ou undefined
   */
  public getProvidersJson(): MultiProviderConfig | undefined {
    return this.config.providersJson;
  }

  /**
   * Verifica se está usando configuração multi-provider
   * 
   * RETORNO:
   * - true se usando multi-provider, false caso contrário
   */
  public isMultiProvider(): boolean {
    return !!this.config.providersJson;
  }

  /**
   * Verifica se está usando configuração genérica
   * 
   * RETORNO:
   * - true se usando configuração genérica, false caso contrário
   */
  public isGenericConfig(): boolean {
    return !!(this.config.apiUrl && this.config.apiToken);
  }

  /**
   * Verifica se está usando configuração legacy do Gitea
   * 
   * RETORNO:
   * - true se usando configuração legacy, false caso contrário
   */
  public isLegacyGitea(): boolean {
    return !!(this.config.giteaUrl && this.config.giteaToken);
  }
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
export const config = ConfigManager.getInstance();