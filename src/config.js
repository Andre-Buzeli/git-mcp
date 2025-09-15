"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.ConfigManager = void 0;
var zod_1 = require("zod");
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
var ConfigSchema = zod_1.z.object({
    // Configuração legacy para Gitea
    giteaUrl: zod_1.z.string().url().optional(),
    giteaToken: zod_1.z.string().min(1).optional(),
    giteaUsername: zod_1.z.string().optional(),
    // Configuração para GitHub
    githubToken: zod_1.z.string().min(1).optional(),
    // Configuração genérica para multi-provider
    provider: zod_1.z.enum(['gitea', 'github']).optional(),
    apiUrl: zod_1.z.string().url().optional(),
    apiToken: zod_1.z.string().min(1).optional(),
    // Configuração multi-provider
    defaultProvider: zod_1.z.string().optional(),
    providersJson: zod_1.z.string().optional().transform(function (val) {
        if (val) {
            try {
                return JSON.parse(val);
            }
            catch (e) {
                console.error("Error parsing PROVIDERS_JSON:", e);
                return undefined;
            }
        }
        return undefined;
    }),
    // Configurações gerais
    debug: zod_1.z.boolean().default(false),
    timeout: zod_1.z.number().positive().default(30000),
}).superRefine(function (data, ctx) {
    // Validação: deve ter pelo menos uma configuração válida ou modo demo
    var hasGiteaConfig = data.giteaUrl && data.giteaToken;
    var hasGitHubConfig = data.githubToken;
    var hasGenericConfig = data.apiUrl && data.apiToken;
    var hasMultiProviderConfig = data.providersJson;
    var isDemoMode = process.env.DEMO_MODE === 'true';
    var configCount = [hasGiteaConfig, hasGitHubConfig, hasGenericConfig, hasMultiProviderConfig].filter(Boolean).length;
    if (configCount === 0 && !isDemoMode) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "Configuration required: At least one provider configuration must be provided (GITEA_URL+GITEA_TOKEN, GITHUB_TOKEN, API_URL+API_TOKEN, or PROVIDERS_JSON). Use DEMO_MODE=true for testing without real providers.",
            path: ['giteaUrl', 'githubToken', 'apiUrl', 'providersJson'],
        });
    }
    // Se provider é especificado, apiUrl e apiToken são obrigatórios
    if (data.provider && (!data.apiUrl || !data.apiToken)) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "When provider is specified, both apiUrl and apiToken are required.",
            path: ['apiUrl', 'apiToken'],
        });
    }
});
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
var ConfigManager = /** @class */ (function () {
    function ConfigManager() {
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
    ConfigManager.getInstance = function () {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    };
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
    ConfigManager.prototype.loadConfig = function () {
        var config = {
            // Configuração legacy para Gitea
            giteaUrl: process.env.GITEA_URL,
            giteaToken: process.env.GITEA_TOKEN,
            giteaUsername: process.env.GITEA_USERNAME,
            // Configuração para GitHub
            githubToken: process.env.GITHUB_TOKEN,
            // Configuração genérica para multi-provider
            provider: process.env.PROVIDER,
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
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                var issues = error.issues.map(function (issue) { return "".concat(issue.path.join('.'), ": ").concat(issue.message); }).join(', ');
                throw new Error("Configuration validation failed: ".concat(issues));
            }
            throw error;
        }
    };
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
    ConfigManager.prototype.getConfig = function () {
        return this.config;
    };
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
    ConfigManager.prototype.getGiteaUrl = function () {
        return this.config.giteaUrl;
    };
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
    ConfigManager.prototype.getGiteaToken = function () {
        return this.config.giteaToken;
    };
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
    ConfigManager.prototype.getGiteaUsername = function () {
        return this.config.giteaUsername;
    };
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
    ConfigManager.prototype.isDebug = function () {
        return this.config.debug;
    };
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
    ConfigManager.prototype.getTimeout = function () {
        return this.config.timeout;
    };
    /**
     * Obtém o tipo de provider configurado
     *
     * RETORNO:
     * - Tipo do provider ('gitea' ou 'github')
     */
    ConfigManager.prototype.getProvider = function () {
        return this.config.provider;
    };
    /**
     * Obtém a URL da API genérica
     *
     * RETORNO:
     * - URL da API ou undefined
     */
    ConfigManager.prototype.getApiUrl = function () {
        return this.config.apiUrl;
    };
    /**
     * Obtém o token da API genérica
     *
     * RETORNO:
     * - Token da API ou undefined
     */
    ConfigManager.prototype.getApiToken = function () {
        return this.config.apiToken;
    };
    /**
     * Obtém o token do GitHub
     *
     * RETORNO:
     * - Token do GitHub ou undefined
     */
    ConfigManager.prototype.getGitHubToken = function () {
        return this.config.githubToken;
    };
    /**
     * Obtém o provider padrão configurado
     *
     * RETORNO:
     * - Nome do provider padrão ou undefined
     */
    ConfigManager.prototype.getDefaultProvider = function () {
        return this.config.defaultProvider;
    };
    /**
     * Obtém a configuração multi-provider
     *
     * RETORNO:
     * - Configuração multi-provider parseada ou undefined
     */
    ConfigManager.prototype.getProvidersJson = function () {
        return this.config.providersJson;
    };
    /**
     * Verifica se está usando configuração multi-provider
     *
     * RETORNO:
     * - true se usando multi-provider, false caso contrário
     */
    ConfigManager.prototype.isMultiProvider = function () {
        return !!this.config.providersJson;
    };
    /**
     * Verifica se está usando configuração genérica
     *
     * RETORNO:
     * - true se usando configuração genérica, false caso contrário
     */
    ConfigManager.prototype.isGenericConfig = function () {
        return !!(this.config.apiUrl && this.config.apiToken);
    };
    /**
     * Verifica se está usando configuração legacy do Gitea
     *
     * RETORNO:
     * - true se usando configuração legacy, false caso contrário
     */
    ConfigManager.prototype.isLegacyGitea = function () {
        return !!(this.config.giteaUrl && this.config.giteaToken);
    };
    /**
     * Verifica se está em modo demo
     *
     * RETORNO:
     * - true se em modo demo, false caso contrário
     */
    ConfigManager.prototype.isDemoMode = function () {
        return process.env.DEMO_MODE === 'true';
    };
    /**
     * Obtém configuração demo para testes
     *
     * RETORNO:
     * - Configuração mock para modo demo
     */
    ConfigManager.prototype.getDemoConfig = function () {
        return {
            defaultProvider: 'demo',
            providers: [{
                    name: 'demo',
                    type: 'gitea',
                    apiUrl: 'https://demo.gitea.io/api/v1',
                    token: 'demo-token',
                    username: 'demo-user'
                }]
        };
    };
    return ConfigManager;
}());
exports.ConfigManager = ConfigManager;
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
exports.config = ConfigManager.getInstance();
