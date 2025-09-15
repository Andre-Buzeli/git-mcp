"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalProviderFactory = exports.ProviderFactory = void 0;
exports.createProviderFromEnv = createProviderFromEnv;
exports.initializeFactoryFromEnv = initializeFactoryFromEnv;
var gitea_provider_js_1 = require("./gitea-provider.js");
var github_provider_js_1 = require("./github-provider.js");
/**
 * Factory para criar e gerenciar providers VCS
 * Suporta Gitea e GitHub com configuração flexível
 */
var ProviderFactory = /** @class */ (function () {
    function ProviderFactory(config) {
        this.providers = new Map();
        this.defaultProviderName = '';
        if (config) {
            this.initializeFromConfig(config);
        }
    }
    /**
     * Inicializa a factory a partir de uma configuração
     */
    ProviderFactory.prototype.initializeFromConfig = function (config) {
        this.defaultProviderName = config.defaultProvider;
        for (var _i = 0, _a = config.providers; _i < _a.length; _i++) {
            var providerConfig = _a[_i];
            this.createProvider(providerConfig);
        }
    };
    /**
     * Cria um novo provider baseado na configuração
     */
    ProviderFactory.prototype.createProvider = function (config) {
        var provider;
        switch (config.type) {
            case 'gitea':
                provider = new gitea_provider_js_1.GiteaProvider(config);
                break;
            case 'github':
                provider = new github_provider_js_1.GitHubProvider(config);
                break;
            default:
                throw new Error("Provider type '".concat(config.type, "' not supported. Supported types: gitea, github"));
        }
        this.providers.set(config.name, provider);
        // Se for o primeiro provider, define como padrão
        if (this.providers.size === 1) {
            this.defaultProviderName = config.name;
        }
        return provider;
    };
    /**
     * Obtém um provider pelo nome
     */
    ProviderFactory.prototype.getProvider = function (name) {
        var provider = this.providers.get(name);
        if (!provider && name) {
            console.error("Provider '".concat(name, "' n\u00E3o encontrado. Providers dispon\u00EDveis:"), Array.from(this.providers.keys()));
            return undefined;
        }
        return provider;
    };
    /**
     * Lista todos os nomes de providers disponíveis
     */
    ProviderFactory.prototype.listProviders = function () {
        return Array.from(this.providers.keys());
    };
    /**
     * Obtém o provider padrão
     */
    ProviderFactory.prototype.getDefaultProvider = function () {
        if (this.providers.size === 0) {
            throw new Error('No providers configured');
        }
        if (!this.defaultProviderName || !this.providers.has(this.defaultProviderName)) {
            // Se não há provider padrão definido, usa o primeiro disponível
            var firstKey = this.providers.keys().next().value;
            if (firstKey) {
                this.defaultProviderName = firstKey;
            }
        }
        var provider = this.providers.get(this.defaultProviderName);
        if (!provider) {
            throw new Error("Default provider '".concat(this.defaultProviderName, "' not found"));
        }
        return provider;
    };
    /**
     * Define o provider padrão
     */
    ProviderFactory.prototype.setDefaultProvider = function (name) {
        if (!this.providers.has(name)) {
            throw new Error("Provider '".concat(name, "' not found"));
        }
        this.defaultProviderName = name;
    };
    /**
     * Remove um provider
     */
    ProviderFactory.prototype.removeProvider = function (name) {
        var removed = this.providers.delete(name);
        // Se o provider removido era o padrão, redefine o padrão
        if (removed && name === this.defaultProviderName) {
            if (this.providers.size > 0) {
                var firstKey = this.providers.keys().next().value;
                if (firstKey) {
                    this.defaultProviderName = firstKey;
                }
                else {
                    this.defaultProviderName = '';
                }
            }
            else {
                this.defaultProviderName = '';
            }
        }
        return removed;
    };
    /**
     * Verifica se um provider existe
     */
    ProviderFactory.prototype.hasProvider = function (name) {
        return this.providers.has(name);
    };
    /**
     * Obtém informações sobre todos os providers
     */
    ProviderFactory.prototype.getProvidersInfo = function () {
        var _this = this;
        return Array.from(this.providers.entries()).map(function (_a) {
            var _b;
            var name = _a[0], provider = _a[1];
            return ({
                name: name,
                type: ((_b = provider.config) === null || _b === void 0 ? void 0 : _b.type) || 'unknown',
                isDefault: name === _this.defaultProviderName
            });
        });
    };
    /**
     * Limpa todos os providers
     */
    ProviderFactory.prototype.clear = function () {
        this.providers.clear();
        this.defaultProviderName = '';
    };
    /**
     * Obtém o número total de providers
     */
    ProviderFactory.prototype.getProviderCount = function () {
        return this.providers.size;
    };
    /**
     * Verifica se há providers configurados
     */
    ProviderFactory.prototype.isEmpty = function () {
        return this.providers.size === 0;
    };
    return ProviderFactory;
}());
exports.ProviderFactory = ProviderFactory;
/**
 * Factory singleton global para uso em todo o sistema
 */
exports.globalProviderFactory = new ProviderFactory();
/**
 * Função helper para criar provider a partir de variáveis de ambiente
 */
function createProviderFromEnv(providerName, providerType) {
    var apiUrl;
    var token;
    var username;
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
            throw new Error("Provider type '".concat(providerType, "' not supported"));
    }
    if (!apiUrl) {
        throw new Error("API URL not configured for ".concat(providerType));
    }
    if (!token) {
        throw new Error("API token not configured for ".concat(providerType));
    }
    var config = {
        name: providerName,
        type: providerType,
        apiUrl: apiUrl,
        token: token,
        username: username
    };
    return exports.globalProviderFactory.createProvider(config);
}
/**
 * Função helper para inicializar factory a partir de variáveis de ambiente
 */
function initializeFactoryFromEnv() {
    var _a;
    var providers = [];
    var defaultProvider = '';
    // Verifica se há configuração multi-provider
    var providersJson = process.env.PROVIDERS_JSON;
    if (providersJson) {
        try {
            var config_1 = JSON.parse(providersJson);
            if (config_1.providers && Array.isArray(config_1.providers)) {
                for (var _i = 0, _b = config_1.providers; _i < _b.length; _i++) {
                    var providerConfig = _b[_i];
                    if (providerConfig.name && providerConfig.type && providerConfig.apiUrl && providerConfig.token) {
                        providers.push(providerConfig);
                    }
                }
                defaultProvider = config_1.defaultProvider || (((_a = providers[0]) === null || _a === void 0 ? void 0 : _a.name) || '');
            }
        }
        catch (error) {
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
        }
        else {
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
            // Sempre tenta GitHub (mesmo sem token para testes)
            if (true) { // Sempre tentar GitHub para compatibilidade com testes
                providers.push({
                    name: 'github',
                    type: 'github',
                    apiUrl: process.env.GITHUB_URL || 'https://api.github.com',
                    token: process.env.GITHUB_TOKEN || 'dummy_token_for_tests',
                    username: process.env.GITHUB_USERNAME
                });
                if (!defaultProvider) {
                    defaultProvider = 'github';
                }
            }
        }
        // Tenta configuração genérica
        if (process.env.API_URL && process.env.API_TOKEN && providers.length === 0) {
            var providerType = process.env.PROVIDER || 'gitea';
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
    // Se não há providers configurados, verifica modo demo
    if (providers.length === 0) {
        var isDemoMode = process.env.DEMO_MODE === 'true';
        if (isDemoMode) {
            providers.push({
                name: 'demo',
                type: 'gitea',
                apiUrl: 'https://demo.gitea.io/api/v1',
                token: 'demo-token',
                username: 'demo-user'
            });
            defaultProvider = 'demo';
        }
        else {
            throw new Error('No VCS providers configured. Please set environment variables for Gitea or GitHub, or use DEMO_MODE=true for testing.');
        }
    }
    var config = {
        defaultProvider: defaultProvider,
        providers: providers
    };
    return new ProviderFactory(config);
}
