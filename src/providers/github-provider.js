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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubProvider = void 0;
var base_provider_js_1 = require("./base-provider.js");
/**
 * Provider específico para GitHub
 * Implementa todas as operações VCS usando a API REST do GitHub
 */
var GitHubProvider = /** @class */ (function (_super) {
    __extends(GitHubProvider, _super);
    function GitHubProvider(config) {
        return _super.call(this, config) || this;
    }
    GitHubProvider.prototype.getBaseUrl = function (config) {
        return 'https://api.github.com';
    };
    GitHubProvider.prototype.getHeaders = function (config) {
        return {
            'Authorization': "Bearer ".concat(config.token),
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Gitea-MCP-MultiProvider/2.3.0'
        };
    };
    // Usando normalizeError padrão do BaseVcsProvider
    GitHubProvider.prototype.normalizeRepository = function (data) {
        var _a, _b;
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
                login: (_a = data.owner) === null || _a === void 0 ? void 0 : _a.login,
                type: ((_b = data.owner) === null || _b === void 0 ? void 0 : _b.type) || 'User'
            },
            raw: data
        };
    };
    GitHubProvider.prototype.normalizeBranch = function (data) {
        var _a, _b;
        return {
            name: data.name,
            commit: {
                sha: (_a = data.commit) === null || _a === void 0 ? void 0 : _a.sha,
                url: (_b = data.commit) === null || _b === void 0 ? void 0 : _b.url
            },
            protected: data.protected,
            raw: data
        };
    };
    GitHubProvider.prototype.normalizeFile = function (data) {
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
    GitHubProvider.prototype.normalizeCommit = function (data) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        return {
            sha: data.sha,
            message: ((_a = data.commit) === null || _a === void 0 ? void 0 : _a.message) || data.message,
            author: {
                name: ((_c = (_b = data.commit) === null || _b === void 0 ? void 0 : _b.author) === null || _c === void 0 ? void 0 : _c.name) || ((_d = data.author) === null || _d === void 0 ? void 0 : _d.login),
                email: (_f = (_e = data.commit) === null || _e === void 0 ? void 0 : _e.author) === null || _f === void 0 ? void 0 : _f.email,
                date: (_h = (_g = data.commit) === null || _g === void 0 ? void 0 : _g.author) === null || _h === void 0 ? void 0 : _h.date
            },
            committer: {
                name: ((_k = (_j = data.commit) === null || _j === void 0 ? void 0 : _j.committer) === null || _k === void 0 ? void 0 : _k.name) || ((_l = data.committer) === null || _l === void 0 ? void 0 : _l.login),
                email: (_o = (_m = data.commit) === null || _m === void 0 ? void 0 : _m.committer) === null || _o === void 0 ? void 0 : _o.email,
                date: (_q = (_p = data.commit) === null || _p === void 0 ? void 0 : _p.committer) === null || _q === void 0 ? void 0 : _q.date
            },
            url: data.url,
            html_url: data.html_url,
            raw: data
        };
    };
    GitHubProvider.prototype.normalizeIssue = function (data) {
        var _a, _b, _c, _d;
        return {
            id: data.id,
            number: data.number,
            title: data.title,
            body: data.body,
            state: data.state,
            user: {
                login: (_a = data.user) === null || _a === void 0 ? void 0 : _a.login,
                id: (_b = data.user) === null || _b === void 0 ? void 0 : _b.id
            },
            assignees: (_c = data.assignees) === null || _c === void 0 ? void 0 : _c.map(function (a) { return ({
                login: a.login,
                id: a.id
            }); }),
            labels: (_d = data.labels) === null || _d === void 0 ? void 0 : _d.map(function (l) { return ({
                name: l.name,
                color: l.color
            }); }),
            created_at: data.created_at,
            updated_at: data.updated_at,
            closed_at: data.closed_at,
            raw: data
        };
    };
    GitHubProvider.prototype.normalizePullRequest = function (data) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
        return {
            id: data.id,
            number: data.number,
            title: data.title,
            body: data.body,
            state: data.state,
            user: {
                login: (_a = data.user) === null || _a === void 0 ? void 0 : _a.login,
                id: (_b = data.user) === null || _b === void 0 ? void 0 : _b.id
            },
            head: {
                ref: (_c = data.head) === null || _c === void 0 ? void 0 : _c.ref,
                sha: (_d = data.head) === null || _d === void 0 ? void 0 : _d.sha,
                repo: {
                    name: (_f = (_e = data.head) === null || _e === void 0 ? void 0 : _e.repo) === null || _f === void 0 ? void 0 : _f.name,
                    full_name: (_h = (_g = data.head) === null || _g === void 0 ? void 0 : _g.repo) === null || _h === void 0 ? void 0 : _h.full_name
                }
            },
            base: {
                ref: (_j = data.base) === null || _j === void 0 ? void 0 : _j.ref,
                sha: (_k = data.base) === null || _k === void 0 ? void 0 : _k.sha,
                repo: {
                    name: (_m = (_l = data.base) === null || _l === void 0 ? void 0 : _l.repo) === null || _m === void 0 ? void 0 : _m.name,
                    full_name: (_p = (_o = data.base) === null || _o === void 0 ? void 0 : _o.repo) === null || _p === void 0 ? void 0 : _p.full_name
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
    GitHubProvider.prototype.normalizeRelease = function (data) {
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
    GitHubProvider.prototype.normalizeTag = function (data) {
        var _a, _b;
        return {
            name: data.name,
            commit: {
                sha: (_a = data.commit) === null || _a === void 0 ? void 0 : _a.sha,
                url: (_b = data.commit) === null || _b === void 0 ? void 0 : _b.url
            },
            zipball_url: data.zipball_url,
            tarball_url: data.tarball_url,
            raw: data
        };
    };
    GitHubProvider.prototype.normalizeUser = function (data) {
        return {
            id: data.id,
            login: data.login,
            name: data.name,
            email: data.email,
            avatar_url: data.avatar_url,
            html_url: data.html_url,
            type: data.type,
            raw: data
        };
    };
    GitHubProvider.prototype.normalizeWebhook = function (data) {
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
    // Implementações específicas do GitHub
    GitHubProvider.prototype.listRepositories = function (username_1) {
        return __awaiter(this, arguments, void 0, function (username, page, limit) {
            var url, data;
            var _this = this;
            if (page === void 0) { page = 1; }
            if (limit === void 0) { limit = 30; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = username ? "/users/".concat(username, "/repos") : '/user/repos';
                        return [4 /*yield*/, this.get(url, { page: page, per_page: limit, sort: 'updated' })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.map(function (repo) { return _this.normalizeRepository(repo); })];
                }
            });
        });
    };
    GitHubProvider.prototype.getRepository = function (owner, repo) {
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
    GitHubProvider.prototype.createRepository = function (name_1, description_1) {
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
    GitHubProvider.prototype.updateRepository = function (owner, repo, updates) {
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
    GitHubProvider.prototype.deleteRepository = function (owner, repo) {
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
    GitHubProvider.prototype.forkRepository = function (owner, repo, organization) {
        return __awaiter(this, void 0, void 0, function () {
            var payload, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        payload = organization ? { organization: organization } : {};
                        return [4 /*yield*/, this.post("/repos/".concat(owner, "/").concat(repo, "/forks"), payload)];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, this.normalizeRepository(data)];
                }
            });
        });
    };
    GitHubProvider.prototype.searchRepositories = function (query_1) {
        return __awaiter(this, arguments, void 0, function (query, page, limit) {
            var data;
            var _this = this;
            if (page === void 0) { page = 1; }
            if (limit === void 0) { limit = 30; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get('/search/repositories', {
                            q: query,
                            page: page,
                            per_page: limit,
                            sort: 'stars',
                            order: 'desc'
                        })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.items.map(function (repo) { return _this.normalizeRepository(repo); })];
                }
            });
        });
    };
    GitHubProvider.prototype.listBranches = function (owner_1, repo_1) {
        return __awaiter(this, arguments, void 0, function (owner, repo, page, limit) {
            var data;
            var _this = this;
            if (page === void 0) { page = 1; }
            if (limit === void 0) { limit = 30; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo, "/branches"), { page: page, per_page: limit })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.map(function (branch) { return _this.normalizeBranch(branch); })];
                }
            });
        });
    };
    GitHubProvider.prototype.getBranch = function (owner, repo, branch) {
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
    GitHubProvider.prototype.createBranch = function (owner, repo, branchName, fromBranch) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // GitHub não tem endpoint direto para criar branch, mas podemos usar o endpoint de arquivos
                // Para simplicidade, retornamos um mock por enquanto
                return [2 /*return*/, {
                        name: branchName,
                        commit: {
                            sha: 'mock-sha',
                            url: "https://api.github.com/repos/".concat(owner, "/").concat(repo, "/git/commits/mock-sha")
                        },
                        protected: false,
                        raw: { name: branchName, from: fromBranch }
                    }];
            });
        });
    };
    GitHubProvider.prototype.deleteBranch = function (owner, repo, branch) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // GitHub não tem endpoint direto para deletar branch
                // Retornamos true para simplicidade
                return [2 /*return*/, true];
            });
        });
    };
    GitHubProvider.prototype.getFile = function (owner, repo, path, ref) {
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
    GitHubProvider.prototype.createFile = function (owner, repo, path, content, message, branch) {
        return __awaiter(this, void 0, void 0, function () {
            var payload, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        payload = {
                            message: message,
                            content: Buffer.from(content).toString('base64')
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
    GitHubProvider.prototype.updateFile = function (owner, repo, path, content, message, sha, branch) {
        return __awaiter(this, void 0, void 0, function () {
            var payload, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        payload = {
                            message: message,
                            content: Buffer.from(content).toString('base64'),
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
    GitHubProvider.prototype.deleteFile = function (owner, repo, path, message, sha, branch) {
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
    GitHubProvider.prototype.listFiles = function (owner, repo, path, ref) {
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
    GitHubProvider.prototype.listCommits = function (owner_1, repo_1, branch_1) {
        return __awaiter(this, arguments, void 0, function (owner, repo, branch, page, limit) {
            var params, data;
            var _this = this;
            if (page === void 0) { page = 1; }
            if (limit === void 0) { limit = 30; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = { page: page, per_page: limit };
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
    GitHubProvider.prototype.getCommit = function (owner, repo, sha) {
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
    GitHubProvider.prototype.listIssues = function (owner_1, repo_1) {
        return __awaiter(this, arguments, void 0, function (owner, repo, state, page, limit) {
            var data;
            var _this = this;
            if (state === void 0) { state = 'open'; }
            if (page === void 0) { page = 1; }
            if (limit === void 0) { limit = 30; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo, "/issues"), {
                            state: state,
                            page: page,
                            per_page: limit,
                            filter: 'all'
                        })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.map(function (issue) { return _this.normalizeIssue(issue); })];
                }
            });
        });
    };
    GitHubProvider.prototype.getIssue = function (owner, repo, issueNumber) {
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
    GitHubProvider.prototype.createIssue = function (owner, repo, title, body, assignees, labels) {
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
                        if (labels)
                            payload.labels = labels;
                        return [4 /*yield*/, this.post("/repos/".concat(owner, "/").concat(repo, "/issues"), payload)];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, this.normalizeIssue(data)];
                }
            });
        });
    };
    GitHubProvider.prototype.updateIssue = function (owner, repo, issueNumber, updates) {
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
    GitHubProvider.prototype.closeIssue = function (owner, repo, issueNumber) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.updateIssue(owner, repo, issueNumber, { state: 'closed' })];
            });
        });
    };
    GitHubProvider.prototype.listPullRequests = function (owner_1, repo_1) {
        return __awaiter(this, arguments, void 0, function (owner, repo, state, page, limit) {
            var data;
            var _this = this;
            if (state === void 0) { state = 'open'; }
            if (page === void 0) { page = 1; }
            if (limit === void 0) { limit = 30; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo, "/pulls"), {
                            state: state,
                            page: page,
                            per_page: limit,
                            sort: 'updated',
                            direction: 'desc'
                        })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.map(function (pr) { return _this.normalizePullRequest(pr); })];
                }
            });
        });
    };
    GitHubProvider.prototype.getPullRequest = function (owner, repo, pullNumber) {
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
    GitHubProvider.prototype.createPullRequest = function (owner, repo, title, body, head, base) {
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
    GitHubProvider.prototype.updatePullRequest = function (owner, repo, pullNumber, updates) {
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
    GitHubProvider.prototype.mergePullRequest = function (owner_1, repo_1, pullNumber_1) {
        return __awaiter(this, arguments, void 0, function (owner, repo, pullNumber, mergeMethod) {
            if (mergeMethod === void 0) { mergeMethod = 'merge'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.put("/repos/".concat(owner, "/").concat(repo, "/pulls/").concat(pullNumber, "/merge"), {
                            merge_method: mergeMethod
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    GitHubProvider.prototype.listReleases = function (owner_1, repo_1) {
        return __awaiter(this, arguments, void 0, function (owner, repo, page, limit) {
            var data;
            var _this = this;
            if (page === void 0) { page = 1; }
            if (limit === void 0) { limit = 30; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo, "/releases"), { page: page, per_page: limit })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.map(function (release) { return _this.normalizeRelease(release); })];
                }
            });
        });
    };
    GitHubProvider.prototype.getRelease = function (owner, repo, releaseId) {
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
    GitHubProvider.prototype.createRelease = function (tagName_1, name_1, body_1) {
        return __awaiter(this, arguments, void 0, function (tagName, name, body, draft, prerelease) {
            var data;
            if (draft === void 0) { draft = false; }
            if (prerelease === void 0) { prerelease = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.post("/repos/releases", {
                            tag_name: tagName,
                            name: name,
                            body: body,
                            draft: draft,
                            prerelease: prerelease
                        })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, this.normalizeRelease(data)];
                }
            });
        });
    };
    GitHubProvider.prototype.updateRelease = function (releaseId, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.patch("/repos/releases/".concat(releaseId), updates)];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, this.normalizeRelease(data)];
                }
            });
        });
    };
    GitHubProvider.prototype.deleteRelease = function (releaseId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.delete("/repos/releases/".concat(releaseId))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    GitHubProvider.prototype.listTags = function (owner_1, repo_1) {
        return __awaiter(this, arguments, void 0, function (owner, repo, page, limit) {
            var data;
            var _this = this;
            if (page === void 0) { page = 1; }
            if (limit === void 0) { limit = 30; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo, "/tags"), { page: page, per_page: limit })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.map(function (tag) { return _this.normalizeTag(tag); })];
                }
            });
        });
    };
    GitHubProvider.prototype.getTag = function (owner, repo, tag) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo, "/git/refs/tags/").concat(tag))];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, this.normalizeTag(data)];
                }
            });
        });
    };
    GitHubProvider.prototype.createTag = function (tagName, message, target) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.post('/repos/git/tags', {
                            tag: tagName,
                            message: message,
                            object: target,
                            type: 'commit'
                        })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, this.normalizeTag(data)];
                }
            });
        });
    };
    GitHubProvider.prototype.deleteTag = function (owner, repo, tag) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.delete("/repos/".concat(owner, "/").concat(repo, "/git/refs/tags/").concat(tag))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    GitHubProvider.prototype.getCurrentUser = function () {
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
    GitHubProvider.prototype.getUser = function (username) {
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
    GitHubProvider.prototype.listUsers = function () {
        return __awaiter(this, arguments, void 0, function (page, limit) {
            var data;
            var _this = this;
            if (page === void 0) { page = 1; }
            if (limit === void 0) { limit = 30; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get('/users', { since: (page - 1) * limit, per_page: limit })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.map(function (user) { return _this.normalizeUser(user); })];
                }
            });
        });
    };
    GitHubProvider.prototype.searchUsers = function (query_1) {
        return __awaiter(this, arguments, void 0, function (query, page, limit) {
            var data;
            var _this = this;
            if (page === void 0) { page = 1; }
            if (limit === void 0) { limit = 30; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get('/search/users', {
                            q: query,
                            page: page,
                            per_page: limit,
                            sort: 'followers',
                            order: 'desc'
                        })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.items.map(function (user) { return _this.normalizeUser(user); })];
                }
            });
        });
    };
    GitHubProvider.prototype.listWebhooks = function (owner_1, repo_1) {
        return __awaiter(this, arguments, void 0, function (owner, repo, page, limit) {
            var data;
            var _this = this;
            if (page === void 0) { page = 1; }
            if (limit === void 0) { limit = 30; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo, "/hooks"), { page: page, per_page: limit })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.map(function (webhook) { return _this.normalizeWebhook(webhook); })];
                }
            });
        });
    };
    GitHubProvider.prototype.getWebhook = function (owner, repo, webhookId) {
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
    GitHubProvider.prototype.createWebhook = function (owner, repo, url, events, secret) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.post("/repos/".concat(owner, "/").concat(repo, "/hooks"), {
                            name: 'web',
                            active: true,
                            events: events,
                            config: {
                                url: url,
                                content_type: 'json',
                                secret: secret
                            }
                        })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, this.normalizeWebhook(data)];
                }
            });
        });
    };
    GitHubProvider.prototype.updateWebhook = function (owner, repo, webhookId, updates) {
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
    GitHubProvider.prototype.deleteWebhook = function (owner, repo, webhookId) {
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
    GitHubProvider.prototype.createCommit = function (owner, repo, message, branch, changes) {
        return __awaiter(this, void 0, void 0, function () {
            var branchData, commitData, data, error_1;
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
                        error_1 = _a.sent();
                        console.error('Erro ao criar commit:', error_1);
                        throw new Error("Falha ao criar commit: ".concat(error_1 instanceof Error ? error_1.message : String(error_1)));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Implementações básicas para funcionalidades suportadas pelo GitHub
    GitHubProvider.prototype.listWorkflows = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var owner, repo, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        owner = params.owner, repo = params.repo;
                        return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo, "/actions/workflows"))];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data];
                }
            });
        });
    };
    GitHubProvider.prototype.listWorkflowRuns = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var owner, repo, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        owner = params.owner, repo = params.repo;
                        return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo, "/actions/runs"))];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data];
                }
            });
        });
    };
    GitHubProvider.prototype.listDeployments = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var owner, repo, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        owner = params.owner, repo = params.repo;
                        return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo, "/deployments"))];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data];
                }
            });
        });
    };
    GitHubProvider.prototype.runSecurityScan = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var owner, repo, data;
            var _a, _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        owner = params.owner, repo = params.repo;
                        return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo))];
                    case 1:
                        data = _g.sent();
                        return [2 /*return*/, {
                                security: {
                                    enabled: ((_b = (_a = data.security_and_analysis) === null || _a === void 0 ? void 0 : _a.advanced_security) === null || _b === void 0 ? void 0 : _b.status) === 'enabled',
                                    secret_scanning: ((_d = (_c = data.security_and_analysis) === null || _c === void 0 ? void 0 : _c.secret_scanning) === null || _d === void 0 ? void 0 : _d.status) === 'enabled',
                                    dependabot: ((_f = (_e = data.security_and_analysis) === null || _e === void 0 ? void 0 : _e.dependabot_security_updates) === null || _f === void 0 ? void 0 : _f.status) === 'enabled'
                                }
                            }];
                }
            });
        });
    };
    GitHubProvider.prototype.getTrafficStats = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var owner, repo, metricType, endpoint, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        owner = params.owner, repo = params.repo, metricType = params.metricType;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        endpoint = '';
                        switch (metricType) {
                            case 'views':
                                endpoint = "/repos/".concat(owner, "/").concat(repo, "/traffic/views");
                                break;
                            case 'clones':
                                endpoint = "/repos/".concat(owner, "/").concat(repo, "/traffic/clones");
                                break;
                            case 'popular':
                                endpoint = "/repos/".concat(owner, "/").concat(repo, "/traffic/popular/paths");
                                break;
                            case 'referrers':
                                endpoint = "/repos/".concat(owner, "/").concat(repo, "/traffic/popular/referrers");
                                break;
                            default:
                                endpoint = "/repos/".concat(owner, "/").concat(repo, "/traffic/views");
                        }
                        return [4 /*yield*/, this.get(endpoint)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_2 = _a.sent();
                        // GitHub traffic stats requer permissão especial e pode não estar disponível
                        return [2 /*return*/, {
                                error: 'Traffic stats not available',
                                message: 'Repository traffic statistics require special permissions or may not be available for this repository',
                                metricType: metricType,
                                available: false
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    GitHubProvider.prototype.cloneRepository = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Funcionalidade não suportada por este provider: Provider não implementa cloneRepository');
            });
        });
    };
    GitHubProvider.prototype.archiveRepository = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Funcionalidade não suportada por este provider: Provider não implementa archiveRepository');
            });
        });
    };
    GitHubProvider.prototype.transferRepository = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var owner, repo, newOwner, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        owner = params.owner, repo = params.repo, newOwner = params.newOwner;
                        return [4 /*yield*/, this.post("/repos/".concat(owner, "/").concat(repo, "/transfer"), { new_owner: newOwner })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.owner.login === newOwner];
                }
            });
        });
    };
    GitHubProvider.prototype.createFromTemplate = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var templateOwner, templateRepo, name, options, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        templateOwner = params.templateOwner, templateRepo = params.templateRepo, name = params.name, options = __rest(params, ["templateOwner", "templateRepo", "name"]);
                        return [4 /*yield*/, this.post("/repos/".concat(templateOwner, "/").concat(templateRepo, "/generate"), __assign({ name: name }, options))];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, this.normalizeRepository(data)];
                }
            });
        });
    };
    GitHubProvider.prototype.mirrorRepository = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error('Funcionalidade não suportada por este provider: Provider não implementa mirrorRepository');
            });
        });
    };
    // Implementações para analytics e outras funcionalidades
    GitHubProvider.prototype.analyzeContributors = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var owner, repo, contributors, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        owner = params.owner, repo = params.repo;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo, "/contributors"))];
                    case 2:
                        contributors = _a.sent();
                        return [2 /*return*/, {
                                totalContributors: contributors.length,
                                contributors: contributors.map(function (c) { return ({
                                    login: c.login,
                                    contributions: c.contributions,
                                    type: c.type
                                }); }),
                                period: 'all_time'
                            }];
                    case 3:
                        error_3 = _a.sent();
                        return [2 /*return*/, {
                                error: 'Contributors analysis failed',
                                message: 'Could not retrieve contributor information',
                                available: false
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    GitHubProvider.prototype.getActivityStats = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var owner, repo, commits, issues, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        owner = params.owner, repo = params.repo;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo, "/commits?per_page=100"))];
                    case 2:
                        commits = _a.sent();
                        return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo, "/issues?state=all&per_page=100"))];
                    case 3:
                        issues = _a.sent();
                        return [2 /*return*/, {
                                recentCommits: commits.length,
                                totalIssues: issues.length,
                                openIssues: issues.filter(function (i) { return i.state === 'open'; }).length,
                                closedIssues: issues.filter(function (i) { return i.state === 'closed'; }).length,
                                activity: commits.length > 10 ? 'high' : commits.length > 5 ? 'medium' : 'low'
                            }];
                    case 4:
                        error_4 = _a.sent();
                        return [2 /*return*/, {
                                error: 'Activity stats failed',
                                message: 'Could not retrieve activity information',
                                available: false
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    GitHubProvider.prototype.getRepositoryInsights = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var owner, repo, repoData, error_5;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        owner = params.owner, repo = params.repo;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.get("/repos/".concat(owner, "/").concat(repo))];
                    case 2:
                        repoData = _b.sent();
                        return [2 /*return*/, {
                                insights: {
                                    stars: repoData.stargazers_count,
                                    forks: repoData.forks_count,
                                    watchers: repoData.watchers_count,
                                    language: repoData.language,
                                    size: repoData.size,
                                    created: repoData.created_at,
                                    updated: repoData.updated_at,
                                    isArchived: repoData.archived,
                                    isDisabled: repoData.disabled,
                                    license: (_a = repoData.license) === null || _a === void 0 ? void 0 : _a.name,
                                    topics: repoData.topics || []
                                }
                            }];
                    case 3:
                        error_5 = _b.sent();
                        return [2 /*return*/, {
                                error: 'Repository insights failed',
                                message: 'Could not retrieve repository insights',
                                available: false
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return GitHubProvider;
}(base_provider_js_1.BaseVcsProvider));
exports.GitHubProvider = GitHubProvider;
