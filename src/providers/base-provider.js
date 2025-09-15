"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseVcsProvider = void 0;
var axios_1 = require("axios");
var error_handler_js_1 = require("./error-handler.js");
/**
 * Classe base abstrata para todos os providers VCS
 * Implementa funcionalidades comuns e define interface unificada
 */
var BaseVcsProvider = /** @class */ (function () {
    function BaseVcsProvider(config) {
        this.config = config;
        this.baseUrl = this.getBaseUrl(config);
        this.client = axios_1.default.create({
            baseURL: this.baseUrl,
            timeout: 30000,
            headers: this.getHeaders(config),
        });
        this.setupInterceptors();
    }
    /**
     * Configura interceptors para logging e tratamento de erros
     */
    BaseVcsProvider.prototype.setupInterceptors = function () {
        var _this = this;
        // Request interceptor
        this.client.interceptors.request.use(function (config) {
            if (process.env.DEBUG === 'true') {
                // Debug: API request
            }
            return config;
        }, function (error) {
            console.error("[".concat(_this.config.name, "] Request error:"), error);
            return Promise.reject(error);
        });
        // Response interceptor
        this.client.interceptors.response.use(function (response) {
            if (process.env.DEBUG === 'true') {
                // Debug: API response
            }
            return response;
        }, function (error) {
            var _a, _b;
            console.error("[".concat(_this.config.name, "] Response error:"), (_a = error.response) === null || _a === void 0 ? void 0 : _a.status, (_b = error.response) === null || _b === void 0 ? void 0 : _b.data);
            return Promise.reject(_this.normalizeError(error));
        });
    };
    /**
     * Normaliza erros para formato unificado usando ErrorHandler padrão
     */
    BaseVcsProvider.prototype.normalizeError = function (error) {
        var standardError = error_handler_js_1.ErrorHandler.normalizeError(error, this.config.name);
        if (process.env.DEBUG === 'true') {
            console.error('Error details:', error_handler_js_1.ErrorHandler.formatForLogging(standardError));
        }
        return error_handler_js_1.ErrorHandler.createError(standardError);
    };
    /**
     * Executa uma requisição HTTP com tratamento de erro
     */
    BaseVcsProvider.prototype.request = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.request(config)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 2:
                        error_1 = _a.sent();
                        throw this.normalizeError(error_1);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Executa uma requisição GET
     */
    BaseVcsProvider.prototype.get = function (url, params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request({ method: 'GET', url: url, params: params })];
            });
        });
    };
    /**
     * Executa uma requisição POST
     */
    BaseVcsProvider.prototype.post = function (url, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request({ method: 'POST', url: url, data: data })];
            });
        });
    };
    /**
     * Executa uma requisição PUT
     */
    BaseVcsProvider.prototype.put = function (url, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request({ method: 'PUT', url: url, data: data })];
            });
        });
    };
    /**
     * Executa uma requisição PATCH
     */
    BaseVcsProvider.prototype.patch = function (url, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request({ method: 'PATCH', url: url, data: data })];
            });
        });
    };
    /**
     * Executa uma requisição DELETE
     */
    BaseVcsProvider.prototype.delete = function (url, config) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request(__assign({ method: 'DELETE', url: url }, config))];
            });
        });
    };
    // Implementações padrão das operações VCS
    // Cada provider pode sobrescrever conforme necessário
    BaseVcsProvider.prototype.listRepositories = function (username_1) {
        return __awaiter(this, arguments, void 0, function (username, page, limit) {
            if (page === void 0) { page = 1; }
            if (limit === void 0) { limit = 30; }
            return __generator(this, function (_a) {
                throw new Error('listRepositories not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.getRepository = function (owner, repo) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('getRepository not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.createRepository = function (name_1, description_1) {
        return __awaiter(this, arguments, void 0, function (name, description, privateRepo) {
            if (privateRepo === void 0) { privateRepo = false; }
            return __generator(this, function (_a) {
                throw new Error('createRepository not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.updateRepository = function (owner, repo, updates) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('updateRepository not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.deleteRepository = function (owner, repo) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('deleteRepository not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.forkRepository = function (owner, repo, organization) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('forkRepository not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.searchRepositories = function (query_1) {
        return __awaiter(this, arguments, void 0, function (query, page, limit) {
            if (page === void 0) { page = 1; }
            if (limit === void 0) { limit = 30; }
            return __generator(this, function (_a) {
                throw new Error('searchRepositories not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.listBranches = function (owner_1, repo_1) {
        return __awaiter(this, arguments, void 0, function (owner, repo, page, limit) {
            if (page === void 0) { page = 1; }
            if (limit === void 0) { limit = 30; }
            return __generator(this, function (_a) {
                throw new Error('listBranches not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.getBranch = function (owner, repo, branch) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('getBranch not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.createBranch = function (owner, repo, branchName, fromBranch) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('createBranch not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.deleteBranch = function (owner, repo, branch) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('deleteBranch not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.getFile = function (owner, repo, path, ref) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('getFile not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.createFile = function (owner, repo, path, content, message, branch) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('createFile not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.updateFile = function (owner, repo, path, content, message, sha, branch) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('updateFile not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.deleteFile = function (owner, repo, path, message, sha, branch) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('deleteFile not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.listFiles = function (owner, repo, path, ref) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('listFiles not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.listCommits = function (owner_1, repo_1, branch_1) {
        return __awaiter(this, arguments, void 0, function (owner, repo, branch, page, limit) {
            if (page === void 0) { page = 1; }
            if (limit === void 0) { limit = 30; }
            return __generator(this, function (_a) {
                throw new Error('listCommits not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.getCommit = function (owner, repo, sha) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('getCommit not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.listIssues = function (owner_1, repo_1) {
        return __awaiter(this, arguments, void 0, function (owner, repo, state, page, limit) {
            if (state === void 0) { state = 'open'; }
            if (page === void 0) { page = 1; }
            if (limit === void 0) { limit = 30; }
            return __generator(this, function (_a) {
                throw new Error('listIssues not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.getIssue = function (owner, repo, issueNumber) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('getIssue not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.createIssue = function (owner, repo, title, body, assignees, labels) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('createIssue not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.updateIssue = function (owner, repo, issueNumber, updates) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('updateIssue not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.closeIssue = function (owner, repo, issueNumber) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('closeIssue not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.listPullRequests = function (owner_1, repo_1) {
        return __awaiter(this, arguments, void 0, function (owner, repo, state, page, limit) {
            if (state === void 0) { state = 'open'; }
            if (page === void 0) { page = 1; }
            if (limit === void 0) { limit = 30; }
            return __generator(this, function (_a) {
                throw new Error('listPullRequests not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.getPullRequest = function (owner, repo, pullNumber) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('getPullRequest not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.createPullRequest = function (owner, repo, title, body, head, base) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('createPullRequest not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.updatePullRequest = function (owner, repo, pullNumber, updates) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('updatePullRequest not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.mergePullRequest = function (owner_1, repo_1, pullNumber_1) {
        return __awaiter(this, arguments, void 0, function (owner, repo, pullNumber, mergeMethod) {
            if (mergeMethod === void 0) { mergeMethod = 'merge'; }
            return __generator(this, function (_a) {
                throw new Error('mergePullRequest not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.listReleases = function (owner_1, repo_1) {
        return __awaiter(this, arguments, void 0, function (owner, repo, page, limit) {
            if (page === void 0) { page = 1; }
            if (limit === void 0) { limit = 30; }
            return __generator(this, function (_a) {
                throw new Error('listReleases not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.getRelease = function (owner, repo, releaseId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('getRelease not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.createRelease = function (tagName_1, name_1, body_1) {
        return __awaiter(this, arguments, void 0, function (tagName, name, body, draft, prerelease) {
            if (draft === void 0) { draft = false; }
            if (prerelease === void 0) { prerelease = false; }
            return __generator(this, function (_a) {
                throw new Error('createRelease not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.updateRelease = function (releaseId, updates) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('updateRelease not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.deleteRelease = function (releaseId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('deleteRelease not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.listTags = function (owner_1, repo_1) {
        return __awaiter(this, arguments, void 0, function (owner, repo, page, limit) {
            if (page === void 0) { page = 1; }
            if (limit === void 0) { limit = 30; }
            return __generator(this, function (_a) {
                throw new Error('listTags not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.getTag = function (owner, repo, tag) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('getTag not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.createTag = function (tagName, message, target) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('createTag not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.deleteTag = function (owner, repo, tag) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('deleteTag not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.getUser = function (username) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('getUser not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.listUsers = function () {
        return __awaiter(this, arguments, void 0, function (page, limit) {
            if (page === void 0) { page = 1; }
            if (limit === void 0) { limit = 30; }
            return __generator(this, function (_a) {
                throw new Error('listUsers not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.searchUsers = function (query_1) {
        return __awaiter(this, arguments, void 0, function (query, page, limit) {
            if (page === void 0) { page = 1; }
            if (limit === void 0) { limit = 30; }
            return __generator(this, function (_a) {
                throw new Error('searchUsers not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.listWebhooks = function (owner_1, repo_1) {
        return __awaiter(this, arguments, void 0, function (owner, repo, page, limit) {
            if (page === void 0) { page = 1; }
            if (limit === void 0) { limit = 30; }
            return __generator(this, function (_a) {
                throw new Error('listWebhooks not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.getWebhook = function (owner, repo, webhookId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('getWebhook not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.createWebhook = function (owner, repo, url, events, secret) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('createWebhook not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.updateWebhook = function (owner, repo, webhookId, updates) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('updateWebhook not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.deleteWebhook = function (owner, repo, webhookId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('deleteWebhook not implemented');
            });
        });
    };
    BaseVcsProvider.prototype.createCommit = function (owner, repo, message, branch, changes) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('createCommit not implemented');
            });
        });
    };
    return BaseVcsProvider;
}());
exports.BaseVcsProvider = BaseVcsProvider;
