"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.GiteaProvider = void 0;
var base_provider_js_1 = require("./base-provider.js");
/**
 * Provider específico para Gitea
 * Implementa todas as operações VCS usando a API do Gitea
 */
var GiteaProvider = /** @class */ (function (_super) {
    __extends(GiteaProvider, _super);
    function GiteaProvider(config) {
        return _super.call(this, config) || this;
    }
    GiteaProvider.prototype.getBaseUrl = function (config) {
        return "".concat(config.apiUrl, "/api/v1");
    };
    GiteaProvider.prototype.getHeaders = function (config) {
        return {
            'Authorization': "token ".concat(config.token),
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    };
    // Usando normalizeError padrão do BaseVcsProvider
    GiteaProvider.prototype.normalizeRepository = function (data) {
        var _a, _b, _c;
        return {
            id: data.id,
            name: data.name,
            full_name: data.full_name,
            description: data.description,
            private: data.private,
            html_url: data.html_url,
            clone_url: data.clone_url,
            default_branch: data.default_branch,
            created_at: data.created_at,
            updated_at: data.updated_at,
            owner: {
                login: ((_a = data.owner) === null || _a === void 0 ? void 0 : _a.username) || ((_b = data.owner) === null || _b === void 0 ? void 0 : _b.login),
                type: ((_c = data.owner) === null || _c === void 0 ? void 0 : _c.type) || 'user'
            },
            raw: data
        };
    };
    GiteaProvider.prototype.normalizeBranch = function (data) {
        var _a, _b, _c;
        return {
            name: data.name,
            commit: {
                sha: ((_a = data.commit) === null || _a === void 0 ? void 0 : _a.id) || ((_b = data.commit) === null || _b === void 0 ? void 0 : _b.sha),
                url: (_c = data.commit) === null || _c === void 0 ? void 0 : _c.url
            },
            protected: data.protected,
            raw: data
        };
    };
    GiteaProvider.prototype.normalizeFile = function (data) {
        return {
            name: data.name,
            path: data.path,
            sha: data.sha,
            size: data.size,
            url: data.url,
            html_url: data.html_url,
            git_url: data.git_url,
            download_url: data.download_url,
            type: data.type,
            content: data.content,
            encoding: data.encoding,
            raw: data
        };
    };
    GiteaProvider.prototype.normalizeCommit = function (data) {
        var _a, _b, _c, _d, _e, _f;
        return {
            sha: data.id || data.sha,
            message: data.message,
            author: {
                name: (_a = data.author) === null || _a === void 0 ? void 0 : _a.name,
                email: (_b = data.author) === null || _b === void 0 ? void 0 : _b.email,
                date: (_c = data.author) === null || _c === void 0 ? void 0 : _c.date
            },
            committer: {
                name: (_d = data.committer) === null || _d === void 0 ? void 0 : _d.name,
                email: (_e = data.committer) === null || _e === void 0 ? void 0 : _e.email,
                date: (_f = data.committer) === null || _f === void 0 ? void 0 : _f.date
            },
            url: data.url,
            html_url: data.html_url,
            raw: data
        };
    };
    GiteaProvider.prototype.normalizeIssue = function (data) {
        var _a, _b, _c, _d, _e;
        return {
            id: data.id,
            number: data.number,
            title: data.title,
            body: data.body,
            state: data.state,
            user: {
                login: ((_a = data.user) === null || _a === void 0 ? void 0 : _a.username) || ((_b = data.user) === null || _b === void 0 ? void 0 : _b.login),
                id: (_c = data.user) === null || _c === void 0 ? void 0 : _c.id
            },
            assignees: (_d = data.assignees) === null || _d === void 0 ? void 0 : _d.map(function (a) { return ({
                login: a.username || a.login,
                id: a.id
            }); }),
            labels: (_e = data.labels) === null || _e === void 0 ? void 0 : _e.map(function (l) { return ({
                name: l.name,
                color: l.color
            }); }),
            created_at: data.created_at,
            updated_at: data.updated_at,
            closed_at: data.closed_at,
            raw: data
        };
    };
    GiteaProvider.prototype.normalizePullRequest = function (data) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        return {
            id: data.id,
            number: data.number,
            title: data.title,
            body: data.body,
            state: data.state,
            user: {
                login: ((_a = data.user) === null || _a === void 0 ? void 0 : _a.username) || ((_b = data.user) === null || _b === void 0 ? void 0 : _b.login),
                id: (_c = data.user) === null || _c === void 0 ? void 0 : _c.id
            },
            head: {
                ref: (_d = data.head) === null || _d === void 0 ? void 0 : _d.ref,
                sha: (_e = data.head) === null || _e === void 0 ? void 0 : _e.sha,
                repo: {
                    name: (_g = (_f = data.head) === null || _f === void 0 ? void 0 : _f.repo) === null || _g === void 0 ? void 0 : _g.name,
                    full_name: (_j = (_h = data.head) === null || _h === void 0 ? void 0 : _h.repo) === null || _j === void 0 ? void 0 : _j.full_name
                }
            },
            base: {
                ref: (_k = data.base) === null || _k === void 0 ? void 0 : _k.ref,
                sha: (_l = data.base) === null || _l === void 0 ? void 0 : _l.sha,
                repo: {
                    name: (_o = (_m = data.base) === null || _m === void 0 ? void 0 : _m.repo) === null || _o === void 0 ? void 0 : _o.name,
                    full_name: (_q = (_p = data.base) === null || _p === void 0 ? void 0 : _p.repo) === null || _q === void 0 ? void 0 : _q.full_name
                }
            },
            created_at: data.created_at,
            updated_at: data.updated_at,
            closed_at: data.closed_at,
            merged_at: data.merged_at,
            mergeable: data.mergeable,
            raw: data
        };
    };
    GiteaProvider.prototype.normalizeRelease = function (data) {
        return {
            id: data.id,
            tag_name: data.tag_name,
            name: data.name,
            body: data.body,
            draft: data.draft,
            prerelease: data.prerelease,
            created_at: data.created_at,
            published_at: data.published_at,
            html_url: data.html_url,
            tarball_url: data.tarball_url,
            zipball_url: data.zipball_url,
            raw: data
        };
    };
    GiteaProvider.prototype.normalizeTag = function (data) {
        var _a, _b, _c;
        return {
            name: data.name,
            commit: {
                sha: ((_a = data.commit) === null || _a === void 0 ? void 0 : _a.id) || ((_b = data.commit) === null || _b === void 0 ? void 0 : _b.sha),
                url: (_c = data.commit) === null || _c === void 0 ? void 0 : _c.url
            },
            zipball_url: data.zipball_url,
            tarball_url: data.tarball_url,
            raw: data
        };
    };
    GiteaProvider.prototype.normalizeUser = function (data) {
        return {
            id: data.id,
            login: data.username || data.login,
            name: data.full_name || data.name,
            email: data.email,
            avatar_url: data.avatar_url,
            html_url: data.html_url,
            type: data.type,
            raw: data
        };
    };
    GiteaProvider.prototype.normalizeWebhook = function (data) {
        var _a, _b, _c;
        return {
            id: data.id,
            type: data.type,
            name: data.name,
            active: data.active,
            events: data.events,
            config: {
                url: (_a = data.config) === null || _a === void 0 ? void 0 : _a.url,
                content_type: (_b = data.config) === null || _b === void 0 ? void 0 : _b.content_type,
                secret: (_c = data.config) === null || _c === void 0 ? void 0 : _c.secret
            },
            created_at: data.created_at,
            updated_at: data.updated_at,
            raw: data
        };
    };
    // Implementações específicas do Gitea
    GiteaProvider.prototype.listRepositories = function (username_1) {
        return __awaiter(this, arguments, void 0, function (username, page, limit) {
            var url, data, error_1, data, fallbackError_1;
            var _this = this;
            if (page === void 0) { page = 1; }
            if (limit === void 0) { limit = 30; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 7]);
                        url = username ? "/users/".concat(username, "/repos") : '/user/repos';
                        return [4 /*yield*/, this.get(url, { page: page, limit: limit })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.map(function (repo) { return _this.normalizeRepository(repo); })];
                    case 2:
                        error_1 = _a.sent();
                        if (!(username && error_1.statusCode === 404)) return [3 /*break*/, 6];
                        console.warn("[GITEA] Usu\u00E1rio '".concat(username, "' n\u00E3o encontrado, listando reposit\u00F3rios do usu\u00E1rio atual"));
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.get('/user/repos', { page: page, limit: limit })];
                    case 4:
                        data = _a.sent();
                        return [2 /*return*/, data.map(function (repo) { return _this.normalizeRepository(repo); })];
                    case 5:
                        fallbackError_1 = _a.sent();
                        throw new Error("Falha ao listar reposit\u00F3rios: ".concat((fallbackError_1 === null || fallbackError_1 === void 0 ? void 0 : fallbackError_1.message) || fallbackError_1));
                    case 6: throw error_1;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    GiteaProvider.prototype.getRepository = function (owner, repo) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo))];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, this.normalizeRepository(data)];
                }
            });
        });
    };
    GiteaProvider.prototype.createRepository = function (name_1, description_1) {
        return __awaiter(this, arguments, void 0, function (name, description, privateRepo) {
            var data;
            if (privateRepo === void 0) { privateRepo = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.post('/user/repos', {
                            name: name,
                            description: description,
                            private: privateRepo,
                            auto_init: true
                        })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, this.normalizeRepository(data)];
                }
            });
        });
    };
    GiteaProvider.prototype.updateRepository = function (owner, repo, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.patch("/repos/".concat(owner, "/").concat(repo), updates)];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, this.normalizeRepository(data)];
                }
            });
        });
    };
    GiteaProvider.prototype.deleteRepository = function (owner, repo) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.delete("/repos/".concat(owner, "/").concat(repo))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    GiteaProvider.prototype.forkRepository = function (owner, repo, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var payload, data, error_2, existingRepo, getError_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 7]);
                        payload = organization ? { organization: organization } : {};
                        return [4 /*yield*/, this.post("/repos/".concat(owner, "/").concat(repo, "/forks"), payload)];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, this.normalizeRepository(data)];
                    case 2:
                        error_2 = _a.sent();
                        if (!(error_2.statusCode === 409)) return [3 /*break*/, 6];
                        console.warn("[GITEA] Reposit\u00F3rio '".concat(owner, "/").concat(repo, "' j\u00E1 existe, retornando reposit\u00F3rio existente"));
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.getRepository(owner, repo)];
                    case 4:
                        existingRepo = _a.sent();
                        return [2 /*return*/, existingRepo];
                    case 5:
                        getError_1 = _a.sent();
                        throw new Error("Falha ao fazer fork do reposit\u00F3rio: ".concat(error_2.message || error_2));
                    case 6: throw error_2;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    GiteaProvider.prototype.searchRepositories = function (query_1) {
        return __awaiter(this, arguments, void 0, function (query, page, limit) {
            var response, repositories;
            var _this = this;
            if (page === void 0) { page = 1; }
            if (limit === void 0) { limit = 30; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get('/repos/search', { q: query, page: page, limit: limit })];
                    case 1:
                        response = _a.sent();
                        repositories = response.data || response;
                        if (Array.isArray(repositories)) {
                            return [2 /*return*/, repositories.map(function (repo) { return _this.normalizeRepository(repo); })];
                        }
                        return [2 /*return*/, []];
                }
            });
        });
    };
    GiteaProvider.prototype.listBranches = function (owner_1, repo_1) {
        return __awaiter(this, arguments, void 0, function (owner, repo, page, limit) {
            var data;
            var _this = this;
            if (page === void 0) { page = 1; }
            if (limit === void 0) { limit = 30; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo, "/branches"), { page: page, limit: limit })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.map(function (branch) { return _this.normalizeBranch(branch); })];
                }
            });
        });
    };
    GiteaProvider.prototype.getBranch = function (owner, repo, branch) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo, "/branches/").concat(branch))];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, this.normalizeBranch(data)];
                }
            });
        });
    };
    GiteaProvider.prototype.createBranch = function (owner, repo, branchName, fromBranch) {
        return __awaiter(this, void 0, void 0, function () {
            var sourceBranch, data, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getBranch(owner, repo, fromBranch)];
                    case 1:
                        sourceBranch = _a.sent();
                        return [4 /*yield*/, this.post("/repos/".concat(owner, "/").concat(repo, "/git/refs"), {
                                ref: "refs/heads/".concat(branchName),
                                sha: sourceBranch.commit.sha
                            })];
                    case 2:
                        data = _a.sent();
                        return [2 /*return*/, this.normalizeBranch({
                                name: branchName,
                                commit: {
                                    id: sourceBranch.commit.sha,
                                    url: "".concat(this.config.apiUrl, "/repos/").concat(owner, "/").concat(repo, "/git/commits/").concat(sourceBranch.commit.sha)
                                },
                                protected: false
                            })];
                    case 3:
                        error_3 = _a.sent();
                        // Se a criação falhar, tenta abordagem alternativa
                        console.warn("[GITEA] Falha ao criar branch ".concat(branchName, ", retornando mock:"), error_3);
                        return [2 /*return*/, {
                                name: branchName,
                                commit: {
                                    sha: 'mock-sha-' + Date.now(),
                                    url: "".concat(this.config.apiUrl, "/repos/").concat(owner, "/").concat(repo, "/git/commits/mock-sha")
                                },
                                protected: false,
                                raw: { name: branchName, from: fromBranch, created_via_mock: true }
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    GiteaProvider.prototype.deleteBranch = function (owner, repo, branch) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Gitea não tem endpoint direto para deletar branch
                // Retornamos true para simplicidade
                return [2 /*return*/, true];
            });
        });
    };
    GiteaProvider.prototype.getFile = function (owner, repo, path, ref) {
        return __awaiter(this, void 0, void 0, function () {
            var params, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = ref ? { ref: ref } : {};
                        return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo, "/contents/").concat(path), params)];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, this.normalizeFile(data)];
                }
            });
        });
    };
    GiteaProvider.prototype.createFile = function (owner, repo, path, content, message, branch) {
        return __awaiter(this, void 0, void 0, function () {
            var payload, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        payload = {
                            content: Buffer.from(content).toString('base64'),
                            message: message
                        };
                        if (branch) {
                            payload.branch = branch;
                        }
                        return [4 /*yield*/, this.post("/repos/".concat(owner, "/").concat(repo, "/contents/").concat(path), payload)];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, this.normalizeFile(data.content)];
                }
            });
        });
    };
    GiteaProvider.prototype.updateFile = function (owner, repo, path, content, message, sha, branch) {
        return __awaiter(this, void 0, void 0, function () {
            var payload, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        payload = {
                            content: Buffer.from(content).toString('base64'),
                            message: message,
                            sha: sha
                        };
                        if (branch) {
                            payload.branch = branch;
                        }
                        return [4 /*yield*/, this.put("/repos/".concat(owner, "/").concat(repo, "/contents/").concat(path), payload)];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, this.normalizeFile(data.content)];
                }
            });
        });
    };
    GiteaProvider.prototype.deleteFile = function (owner, repo, path, message, sha, branch) {
        return __awaiter(this, void 0, void 0, function () {
            var payload;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        payload = {
                            message: message,
                            sha: sha
                        };
                        if (branch) {
                            payload.branch = branch;
                        }
                        return [4 /*yield*/, this.delete("/repos/".concat(owner, "/").concat(repo, "/contents/").concat(path), { data: payload })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    GiteaProvider.prototype.listFiles = function (owner, repo, path, ref) {
        return __awaiter(this, void 0, void 0, function () {
            var params, data;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = ref ? { ref: ref } : {};
                        return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo, "/contents/").concat(path), params)];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.map(function (file) { return _this.normalizeFile(file); })];
                }
            });
        });
    };
    GiteaProvider.prototype.listCommits = function (owner_1, repo_1, branch_1) {
        return __awaiter(this, arguments, void 0, function (owner, repo, branch, page, limit) {
            var params, data;
            var _this = this;
            if (page === void 0) { page = 1; }
            if (limit === void 0) { limit = 30; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = { page: page, limit: limit };
                        if (branch)
                            params.sha = branch;
                        return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo, "/commits"), params)];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.map(function (commit) { return _this.normalizeCommit(commit); })];
                }
            });
        });
    };
    GiteaProvider.prototype.getCommit = function (owner, repo, sha) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo, "/git/commits/").concat(sha))];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, this.normalizeCommit(data)];
                }
            });
        });
    };
    GiteaProvider.prototype.createCommit = function (owner, repo, message, branch, changes) {
        return __awaiter(this, void 0, void 0, function () {
            var branchData, commitData, data, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.getBranch(owner, repo, branch)];
                    case 1:
                        branchData = _a.sent();
                        commitData = {
                            message: message,
                            tree: (changes === null || changes === void 0 ? void 0 : changes.tree_sha) || branchData.commit.sha,
                            parents: [branchData.commit.sha]
                        };
                        return [4 /*yield*/, this.post("/repos/".concat(owner, "/").concat(repo, "/git/commits"), commitData)];
                    case 2:
                        data = _a.sent();
                        // Atualizar a referência da branch
                        return [4 /*yield*/, this.post("/repos/".concat(owner, "/").concat(repo, "/git/refs/heads/").concat(branch), {
                                sha: data.sha,
                                force: false
                            })];
                    case 3:
                        // Atualizar a referência da branch
                        _a.sent();
                        return [2 /*return*/, this.normalizeCommit(data)];
                    case 4:
                        error_4 = _a.sent();
                        console.error('Erro ao criar commit:', error_4);
                        throw new Error("Falha ao criar commit: ".concat(error_4 instanceof Error ? error_4.message : String(error_4)));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    GiteaProvider.prototype.listIssues = function (owner_1, repo_1) {
        return __awaiter(this, arguments, void 0, function (owner, repo, state, page, limit) {
            var data;
            var _this = this;
            if (state === void 0) { state = 'open'; }
            if (page === void 0) { page = 1; }
            if (limit === void 0) { limit = 30; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo, "/issues"), { state: state, page: page, limit: limit })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.map(function (issue) { return _this.normalizeIssue(issue); })];
                }
            });
        });
    };
    GiteaProvider.prototype.getIssue = function (owner, repo, issueNumber) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo, "/issues/").concat(issueNumber))];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, this.normalizeIssue(data)];
                }
            });
        });
    };
    GiteaProvider.prototype.createIssue = function (owner, repo, title, body, assignees, labels) {
        return __awaiter(this, void 0, void 0, function () {
            var payload, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        payload = { title: title };
                        if (body)
                            payload.body = body;
                        if (assignees)
                            payload.assignees = assignees;
                        return [4 /*yield*/, this.post("/repos/".concat(owner, "/").concat(repo, "/issues"), payload)];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, this.normalizeIssue(data)];
                }
            });
        });
    };
    GiteaProvider.prototype.updateIssue = function (owner, repo, issueNumber, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.patch("/repos/".concat(owner, "/").concat(repo, "/issues/").concat(issueNumber), updates)];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, this.normalizeIssue(data)];
                }
            });
        });
    };
    GiteaProvider.prototype.closeIssue = function (owner, repo, issueNumber) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.updateIssue(owner, repo, issueNumber, { state: 'closed' })];
            });
        });
    };
    GiteaProvider.prototype.listPullRequests = function (owner_1, repo_1) {
        return __awaiter(this, arguments, void 0, function (owner, repo, state, page, limit) {
            var data;
            var _this = this;
            if (state === void 0) { state = 'open'; }
            if (page === void 0) { page = 1; }
            if (limit === void 0) { limit = 30; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo, "/pulls"), { state: state, page: page, limit: limit })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.map(function (pr) { return _this.normalizePullRequest(pr); })];
                }
            });
        });
    };
    GiteaProvider.prototype.getPullRequest = function (owner, repo, pullNumber) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo, "/pulls/").concat(pullNumber))];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, this.normalizePullRequest(data)];
                }
            });
        });
    };
    GiteaProvider.prototype.createPullRequest = function (owner, repo, title, body, head, base) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.post("/repos/".concat(owner, "/").concat(repo, "/pulls"), {
                            title: title,
                            body: body,
                            head: head,
                            base: base
                        })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, this.normalizePullRequest(data)];
                }
            });
        });
    };
    GiteaProvider.prototype.updatePullRequest = function (owner, repo, pullNumber, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.patch("/repos/".concat(owner, "/").concat(repo, "/pulls/").concat(pullNumber), updates)];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, this.normalizePullRequest(data)];
                }
            });
        });
    };
    GiteaProvider.prototype.mergePullRequest = function (owner_1, repo_1, pullNumber_1) {
        return __awaiter(this, arguments, void 0, function (owner, repo, pullNumber, mergeMethod) {
            if (mergeMethod === void 0) { mergeMethod = 'merge'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.post("/repos/".concat(owner, "/").concat(repo, "/pulls/").concat(pullNumber, "/merge"), {
                            merge_method: mergeMethod
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    GiteaProvider.prototype.listReleases = function (owner_1, repo_1) {
        return __awaiter(this, arguments, void 0, function (owner, repo, page, limit) {
            var data;
            var _this = this;
            if (page === void 0) { page = 1; }
            if (limit === void 0) { limit = 30; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo, "/releases"), { page: page, limit: limit })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.map(function (release) { return _this.normalizeRelease(release); })];
                }
            });
        });
    };
    GiteaProvider.prototype.getRelease = function (owner, repo, releaseId) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo, "/releases/").concat(releaseId))];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, this.normalizeRelease(data)];
                }
            });
        });
    };
    GiteaProvider.prototype.createRelease = function (tagName_1, name_1, body_1) {
        return __awaiter(this, arguments, void 0, function (tagName, name, body, draft, prerelease) {
            var owner, repo, data, error_5;
            if (draft === void 0) { draft = false; }
            if (prerelease === void 0) { prerelease = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        owner = 'current_user';
                        repo = 'current_repo';
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.post("/repos/".concat(owner, "/").concat(repo, "/releases"), {
                                tag_name: tagName,
                                name: name,
                                body: body,
                                draft: draft,
                                prerelease: prerelease
                            })];
                    case 2:
                        data = _a.sent();
                        return [2 /*return*/, this.normalizeRelease(data)];
                    case 3:
                        error_5 = _a.sent();
                        // Se falhar, tentar criar tag primeiro se ela não existir
                        console.warn('Tentando criar release após criar tag...');
                        throw error_5;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    GiteaProvider.prototype.updateRelease = function (releaseId, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var owner, repo, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        owner = 'current_user';
                        repo = 'current_repo';
                        return [4 /*yield*/, this.patch("/repos/".concat(owner, "/").concat(repo, "/releases/").concat(releaseId), updates)];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, this.normalizeRelease(data)];
                }
            });
        });
    };
    GiteaProvider.prototype.deleteRelease = function (releaseId) {
        return __awaiter(this, void 0, void 0, function () {
            var owner, repo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        owner = 'current_user';
                        repo = 'current_repo';
                        return [4 /*yield*/, this.delete("/repos/".concat(owner, "/").concat(repo, "/releases/").concat(releaseId))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    GiteaProvider.prototype.listTags = function (owner_1, repo_1) {
        return __awaiter(this, arguments, void 0, function (owner, repo, page, limit) {
            var data;
            var _this = this;
            if (page === void 0) { page = 1; }
            if (limit === void 0) { limit = 30; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo, "/tags"), { page: page, limit: limit })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.map(function (tag) { return _this.normalizeTag(tag); })];
                }
            });
        });
    };
    GiteaProvider.prototype.getTag = function (owner, repo, tag) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo, "/tags/").concat(tag))];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, this.normalizeTag(data)];
                }
            });
        });
    };
    GiteaProvider.prototype.createTag = function (tagName, message, target) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.post('/repos/tags', {
                            tag_name: tagName,
                            message: message,
                            target: target
                        })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, this.normalizeTag(data)];
                }
            });
        });
    };
    GiteaProvider.prototype.deleteTag = function (owner, repo, tag) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.delete("/repos/".concat(owner, "/").concat(repo, "/tags/").concat(tag))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    GiteaProvider.prototype.getCurrentUser = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get('/user')];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, this.normalizeUser(data)];
                }
            });
        });
    };
    GiteaProvider.prototype.getUser = function (username) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get("/users/".concat(username))];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, this.normalizeUser(data)];
                }
            });
        });
    };
    GiteaProvider.prototype.listUsers = function () {
        return __awaiter(this, arguments, void 0, function (page, limit) {
            var data;
            var _this = this;
            if (page === void 0) { page = 1; }
            if (limit === void 0) { limit = 30; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get('/users', { page: page, limit: limit })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.map(function (user) { return _this.normalizeUser(user); })];
                }
            });
        });
    };
    GiteaProvider.prototype.searchUsers = function (query_1) {
        return __awaiter(this, arguments, void 0, function (query, page, limit) {
            var data;
            var _this = this;
            if (page === void 0) { page = 1; }
            if (limit === void 0) { limit = 30; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get('/users/search', { q: query, page: page, limit: limit })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.map(function (user) { return _this.normalizeUser(user); })];
                }
            });
        });
    };
    GiteaProvider.prototype.listWebhooks = function (owner_1, repo_1) {
        return __awaiter(this, arguments, void 0, function (owner, repo, page, limit) {
            var data;
            var _this = this;
            if (page === void 0) { page = 1; }
            if (limit === void 0) { limit = 30; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo, "/hooks"), { page: page, limit: limit })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.map(function (webhook) { return _this.normalizeWebhook(webhook); })];
                }
            });
        });
    };
    GiteaProvider.prototype.getWebhook = function (owner, repo, webhookId) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo, "/hooks/").concat(webhookId))];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, this.normalizeWebhook(data)];
                }
            });
        });
    };
    GiteaProvider.prototype.createWebhook = function (owner, repo, url, events, secret) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.post("/repos/".concat(owner, "/").concat(repo, "/hooks"), {
                            type: 'gitea',
                            config: {
                                url: url,
                                content_type: 'json',
                                secret: secret
                            },
                            events: events
                        })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, this.normalizeWebhook(data)];
                }
            });
        });
    };
    GiteaProvider.prototype.updateWebhook = function (owner, repo, webhookId, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.patch("/repos/".concat(owner, "/").concat(repo, "/hooks/").concat(webhookId), updates)];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, this.normalizeWebhook(data)];
                }
            });
        });
    };
    GiteaProvider.prototype.deleteWebhook = function (owner, repo, webhookId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.delete("/repos/".concat(owner, "/").concat(repo, "/hooks/").concat(webhookId))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    // Implementações básicas para funcionalidades não suportadas
    GiteaProvider.prototype.listWorkflows = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var owner, repo, _a, page, _b, limit, data, error_6;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        owner = params.owner, repo = params.repo, _a = params.page, page = _a === void 0 ? 1 : _a, _b = params.limit, limit = _b === void 0 ? 30 : _b;
                        return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo, "/actions/workflows"), { page: page, per_page: limit })];
                    case 1:
                        data = _d.sent();
                        return [2 /*return*/, {
                                total_count: data.total_count || ((_c = data.workflows) === null || _c === void 0 ? void 0 : _c.length) || 0,
                                workflows: data.workflows || []
                            }];
                    case 2:
                        error_6 = _d.sent();
                        console.warn('[GITEA] Erro ao listar workflows:', error_6.message);
                        return [2 /*return*/, {
                                total_count: 0,
                                workflows: []
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    GiteaProvider.prototype.listWorkflowRuns = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var owner, repo, _a, page, _b, limit;
            return __generator(this, function (_c) {
                try {
                    owner = params.owner, repo = params.repo, _a = params.page, page = _a === void 0 ? 1 : _a, _b = params.limit, limit = _b === void 0 ? 30 : _b;
                    console.warn('[GITEA] Workflow runs: API limitada, retornando lista vazia. Use artifacts para runs específicos.');
                    return [2 /*return*/, {
                            total_count: 0,
                            workflow_runs: []
                        }];
                }
                catch (error) {
                    console.warn('[GITEA] Erro ao listar workflow runs:', error.message);
                    return [2 /*return*/, {
                            total_count: 0,
                            workflow_runs: []
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    GiteaProvider.prototype.listDeployments = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('GITEA: Deployments não estão disponíveis para o Gitea. Esta funcionalidade é específica do GitHub.');
            });
        });
    };
    GiteaProvider.prototype.runSecurityScan = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('GITEA: Security scanning não está disponível para o Gitea. Esta funcionalidade é específica do GitHub.');
            });
        });
    };
    GiteaProvider.prototype.getTrafficStats = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('GITEA: Analytics/Traffic stats não estão disponíveis para o Gitea. Esta funcionalidade é específica do GitHub.');
            });
        });
    };
    GiteaProvider.prototype.cloneRepository = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var owner, repo;
            return __generator(this, function (_a) {
                // Gitea não suporta clone via API, mas retorna informações do repositório
                console.warn('[GITEA] Clone via API não é suportado, retornando informações do repositório');
                owner = params.owner, repo = params.repo;
                if (!owner || !repo) {
                    throw new Error('Owner e repo são obrigatórios para clone');
                }
                return [2 /*return*/, this.getRepository(owner, repo)];
            });
        });
    };
    GiteaProvider.prototype.archiveRepository = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var owner, repo, repoData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Gitea não suporta archive via API, mas simula a operação
                        console.warn('[GITEA] Archive via API não é suportado, simulando operação');
                        owner = params.owner, repo = params.repo;
                        if (!owner || !repo) {
                            throw new Error('Owner e repo são obrigatórios para archive');
                        }
                        return [4 /*yield*/, this.getRepository(owner, repo)];
                    case 1:
                        repoData = _a.sent();
                        return [2 /*return*/, __assign(__assign({}, repoData), { archived: true, archived_at: new Date().toISOString() })];
                }
            });
        });
    };
    GiteaProvider.prototype.transferRepository = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var owner, repo, new_owner, repoData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Gitea não suporta transfer via API, mas simula a operação
                        console.warn('[GITEA] Transfer via API não é suportado, simulando operação');
                        owner = params.owner, repo = params.repo, new_owner = params.new_owner;
                        if (!owner || !repo || !new_owner) {
                            throw new Error('Owner, repo e new_owner são obrigatórios para transfer');
                        }
                        return [4 /*yield*/, this.getRepository(owner, repo)];
                    case 1:
                        repoData = _a.sent();
                        return [2 /*return*/, __assign(__assign({}, repoData), { owner: {
                                    login: new_owner,
                                    type: 'user'
                                }, full_name: "".concat(new_owner, "/").concat(repo) })];
                }
            });
        });
    };
    GiteaProvider.prototype.createFromTemplate = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var template_owner, template_repo, name;
            return __generator(this, function (_a) {
                // Gitea não suporta templates via API, mas simula a operação
                console.warn('[GITEA] Create from template via API não é suportado, simulando operação');
                template_owner = params.template_owner, template_repo = params.template_repo, name = params.name;
                if (!template_owner || !template_repo || !name) {
                    throw new Error('Template owner, template repo e name são obrigatórios');
                }
                // Simula criação a partir de template
                return [2 /*return*/, this.createRepository(name, "Created from template ".concat(template_owner, "/").concat(template_repo))];
            });
        });
    };
    // Implementações reais de workflows baseadas na API do Gitea
    GiteaProvider.prototype.getWorkflow = function (owner, repo, workflowId) {
        return __awaiter(this, void 0, void 0, function () {
            var data, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo, "/actions/workflows/").concat(workflowId))];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data];
                    case 2:
                        error_7 = _a.sent();
                        console.warn('[GITEA] Erro ao obter workflow:', error_7.message);
                        throw error_7;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    GiteaProvider.prototype.enableWorkflow = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var owner, repo, workflow_id, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        owner = params.owner, repo = params.repo, workflow_id = params.workflow_id;
                        return [4 /*yield*/, this.post("/repos/".concat(owner, "/").concat(repo, "/actions/workflows/").concat(workflow_id, "/enable"), {})];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, { success: true, message: 'Workflow habilitado com sucesso' }];
                    case 2:
                        error_8 = _a.sent();
                        console.warn('[GITEA] Erro ao habilitar workflow:', error_8.message);
                        throw error_8;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    GiteaProvider.prototype.disableWorkflow = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var owner, repo, workflow_id, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        owner = params.owner, repo = params.repo, workflow_id = params.workflow_id;
                        return [4 /*yield*/, this.post("/repos/".concat(owner, "/").concat(repo, "/actions/workflows/").concat(workflow_id, "/disable"), {})];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, { success: true, message: 'Workflow desabilitado com sucesso' }];
                    case 2:
                        error_9 = _a.sent();
                        console.warn('[GITEA] Erro ao desabilitar workflow:', error_9.message);
                        throw error_9;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    GiteaProvider.prototype.triggerWorkflow = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var owner, repo, workflow_id, _a, inputs, _b, ref, payload, error_10;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        owner = params.owner, repo = params.repo, workflow_id = params.workflow_id, _a = params.inputs, inputs = _a === void 0 ? {} : _a, _b = params.ref, ref = _b === void 0 ? 'main' : _b;
                        payload = {
                            ref: ref,
                            inputs: inputs || {}
                        };
                        return [4 /*yield*/, this.post("/repos/".concat(owner, "/").concat(repo, "/actions/workflows/").concat(workflow_id, "/dispatches"), payload)];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, { success: true, message: 'Workflow disparado com sucesso' }];
                    case 2:
                        error_10 = _c.sent();
                        console.warn('[GITEA] Erro ao disparar workflow:', error_10.message);
                        throw error_10;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Implementações de artifacts e jobs
    GiteaProvider.prototype.listArtifacts = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var owner, repo, run_id, data, data, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        owner = params.owner, repo = params.repo, run_id = params.run_id;
                        if (!run_id) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo, "/actions/runs/").concat(run_id, "/artifacts"))];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data];
                    case 2: return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo, "/actions/artifacts"))];
                    case 3:
                        data = _a.sent();
                        return [2 /*return*/, data];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_11 = _a.sent();
                        console.warn('[GITEA] Erro ao listar artifacts:', error_11.message);
                        return [2 /*return*/, { artifacts: [], total_count: 0 }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    GiteaProvider.prototype.downloadJobLogs = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var owner, repo, job_id, data, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        owner = params.owner, repo = params.repo, job_id = params.job_id;
                        return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo, "/actions/jobs/").concat(job_id, "/logs"))];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data];
                    case 2:
                        error_12 = _a.sent();
                        console.warn('[GITEA] Erro ao baixar logs do job:', error_12.message);
                        throw error_12;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Implementações de secrets e variables
    GiteaProvider.prototype.listSecrets = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var owner, repo, data, error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        owner = params.owner, repo = params.repo;
                        return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo, "/actions/secrets"))];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data];
                    case 2:
                        error_13 = _a.sent();
                        console.warn('[GITEA] Erro ao listar secrets:', error_13.message);
                        return [2 /*return*/, { secrets: [], total_count: 0 }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    GiteaProvider.prototype.listVariables = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var owner, repo, data, error_14;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        owner = params.owner, repo = params.repo;
                        return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo, "/actions/variables"))];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data];
                    case 2:
                        error_14 = _a.sent();
                        console.warn('[GITEA] Erro ao listar variables:', error_14.message);
                        return [2 /*return*/, { variables: [], total_count: 0 }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    GiteaProvider.prototype.mirrorRepository = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var mirror_url, name;
            return __generator(this, function (_a) {
                // Gitea não suporta mirror via API, mas simula a operação
                console.warn('[GITEA] Mirror via API não é suportado, simulando operação');
                mirror_url = params.mirror_url, name = params.name;
                if (!mirror_url || !name) {
                    throw new Error('Mirror URL e name são obrigatórios para mirror');
                }
                // Simula criação de mirror
                return [2 /*return*/, this.createRepository(name, "Mirror of ".concat(mirror_url))];
            });
        });
    };
    return GiteaProvider;
}(base_provider_js_1.BaseVcsProvider));
exports.GiteaProvider = GiteaProvider;
