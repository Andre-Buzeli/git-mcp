"use strict";
/**
 * Índice de providers VCS
 * Exporta todas as interfaces, classes e funções relacionadas aos providers
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = exports.initializeFactoryFromEnv = exports.createProviderFromEnv = exports.globalProviderFactory = exports.ProviderFactory = exports.GitHubProvider = exports.GiteaProvider = exports.BaseVcsProvider = void 0;
// Interfaces e tipos
__exportStar(require("./types.js"), exports);
// Classe base
var base_provider_js_1 = require("./base-provider.js");
Object.defineProperty(exports, "BaseVcsProvider", { enumerable: true, get: function () { return base_provider_js_1.BaseVcsProvider; } });
// Providers específicos
var gitea_provider_js_1 = require("./gitea-provider.js");
Object.defineProperty(exports, "GiteaProvider", { enumerable: true, get: function () { return gitea_provider_js_1.GiteaProvider; } });
var github_provider_js_1 = require("./github-provider.js");
Object.defineProperty(exports, "GitHubProvider", { enumerable: true, get: function () { return github_provider_js_1.GitHubProvider; } });
// Factory e helpers
var provider_factory_js_1 = require("./provider-factory.js");
Object.defineProperty(exports, "ProviderFactory", { enumerable: true, get: function () { return provider_factory_js_1.ProviderFactory; } });
Object.defineProperty(exports, "globalProviderFactory", { enumerable: true, get: function () { return provider_factory_js_1.globalProviderFactory; } });
Object.defineProperty(exports, "createProviderFromEnv", { enumerable: true, get: function () { return provider_factory_js_1.createProviderFromEnv; } });
Object.defineProperty(exports, "initializeFactoryFromEnv", { enumerable: true, get: function () { return provider_factory_js_1.initializeFactoryFromEnv; } });
// Error handling
var error_handler_js_1 = require("./error-handler.js");
Object.defineProperty(exports, "ErrorHandler", { enumerable: true, get: function () { return error_handler_js_1.ErrorHandler; } });
//# sourceMappingURL=index.js.map