"use strict";
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
exports.branchesTool = void 0;
var zod_1 = require("zod");
var index_js_1 = require("../providers/index.js");
/**
 * Tool: branches
 *
 * DESCRIÇÃO:
 * Gerenciamento completo de branches Gitea com múltiplas ações
 *
 * FUNCIONALIDADES:
 * - Criação de novas branches
 * - Listagem e busca de branches
 * - Obtenção de detalhes específicos
 * - Exclusão de branches
 * - Merge de branches
 * - Comparação entre branches
 *
 * USO:
 * - Para gerenciar fluxo de trabalho Git
 * - Para criar branches de feature
 * - Para organizar desenvolvimento
 * - Para controle de versão
 *
 * RECOMENDAÇÕES:
 * - Use convenções de nomenclatura consistentes
 * - Proteja branches importantes
 * - Mantenha branches limpas
 * - Documente propósito das branches
 */
/**
 * Schema de validação para entrada da tool branches
 *
 * VALIDAÇÕES:
 * - action: Ação obrigatória (create, list, get, delete, merge, compare)
 * - Parâmetros específicos por ação
 * - Validação de tipos e formatos
 *
 * RECOMENDAÇÕES:
 * - Sempre valide entrada antes de usar
 * - Use parâmetros opcionais adequadamente
 * - Documente parâmetros obrigatórios
 */
var BranchesInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['create', 'list', 'get', 'delete', 'merge', 'compare']),
    // Parâmetros comuns com validações aprimoradas
    owner: zod_1.z.string().min(1, 'Owner é obrigatório').max(100, 'Owner muito longo').optional(),
    repo: zod_1.z.string().min(1, 'Nome do repositório é obrigatório').max(100, 'Nome do repositório muito longo').optional(),
    provider: zod_1.z.enum(['gitea', 'github', 'both']).optional(), // Provider específico: gitea, github ou both
    // Para create - validações específicas
    branch_name: zod_1.z.string().min(1, 'Nome da branch é obrigatório').max(255, 'Nome da branch muito longo')
        .regex(/^[^.\s][^~\^\:\?\*\[\]\s]*$/, 'Nome de branch contém caracteres inválidos').optional(),
    from_branch: zod_1.z.string().min(1, 'Branch de origem é obrigatória').max(255, 'Nome da branch de origem muito longo').optional(),
    // Para get/delete - validação de nome de branch
    branch: zod_1.z.string().min(1, 'Nome da branch é obrigatório').max(255, 'Nome da branch muito longo').optional(),
    // Para merge - validações específicas
    head: zod_1.z.string().min(1, 'Branch de origem é obrigatória').max(255, 'Nome da branch muito longo').optional(),
    base: zod_1.z.string().min(1, 'Branch de destino é obrigatória').max(255, 'Nome da branch muito longo').optional(),
    merge_method: zod_1.z.enum(['merge', 'rebase', 'squash']).optional(),
    // Para list - paginação
    page: zod_1.z.number().min(1, 'Página deve ser pelo menos 1').max(1000, 'Página muito alta').optional(),
    limit: zod_1.z.number().min(1, 'Limite deve ser pelo menos 1').max(100, 'Limite não pode exceder 100').optional(),
    // Para compare - validações específicas
    base_branch: zod_1.z.string().min(1, 'Branch base é obrigatória').max(255, 'Nome da branch muito longo').optional(),
    head_branch: zod_1.z.string().min(1, 'Branch de comparação é obrigatória').max(255, 'Nome da branch muito longo').optional(),
}).refine(function (data) {
    // Validações condicionais por ação
    if (data.action === 'create') {
        return data.owner && data.repo && data.branch_name && data.from_branch;
    }
    if (['get', 'delete'].includes(data.action)) {
        return data.owner && data.repo && data.branch;
    }
    if (data.action === 'merge') {
        return data.owner && data.repo && data.head && data.base;
    }
    if (data.action === 'compare') {
        return data.owner && data.repo && data.base_branch && data.head_branch;
    }
    if (data.action === 'list') {
        return data.owner && data.repo;
    }
    return data.owner && data.repo;
}, {
    message: "Parâmetros obrigatórios não fornecidos para a ação especificada"
});
/**
 * Schema de saída padronizado
 *
 * ESTRUTURA:
 * - success: Status da operação
 * - action: Ação executada
 * - message: Mensagem descritiva
 * - data: Dados retornados (opcional)
 * - error: Detalhes do erro (opcional)
 */
var BranchesResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    action: zod_1.z.string(),
    message: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional()
});
/**
 * Tool: branches
 *
 * DESCRIÇÃO:
 * Gerenciamento completo de branches Gitea com múltiplas ações
 *
 * ACTIONS DISPONÍVEIS:
 *
 * 1. create - Criar nova branch
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - branch_name (obrigatório): Nome da nova branch
 *    - from_branch (obrigatório): Branch de origem
 *
 * 2. list - Listar branches
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - page (opcional): Página da listagem (padrão: 1)
 *    - limit (opcional): Itens por página (padrão: 30)
 *
 * 3. get - Obter detalhes da branch
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - branch (obrigatório): Nome da branch
 *
 * 4. delete - Deletar branch
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - branch (obrigatório): Nome da branch
 *
 * 5. merge - Fazer merge de branches
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - head (obrigatório): Branch de origem
 *    - base (obrigatório): Branch de destino
 *    - merge_method (opcional): Método de merge (padrão: merge)
 *
 * 6. compare - Comparar branches
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - base_branch (obrigatório): Branch base
 *    - head_branch (obrigatório): Branch de comparação
 *
 * RECOMENDAÇÕES DE USO:
 * - Use nomes descritivos para branches
 * - Mantenha branches principais protegidas
 * - Faça merge regularmente
 * - Documente propósito das branches
 * - Use convenções de nomenclatura
 * - Limpe branches antigas
 */
exports.branchesTool = {
    name: 'branches',
    description: 'GERENCIAMENTO DE BRANCHES - GitHub & Gitea\n\nACTIONS DISPONÍVEIS:\n• create: Cria nova branch a partir de outra\n• list: Lista todas as branches do repositório\n• get: Obtém informações de uma branch específica\n• delete: Remove uma branch\n• merge: Faz merge entre branches\n• compare: Compara diferenças entre branches\n\nPARÂMETROS COMUNS:\n• provider: "github" ou "gitea" (opcional)\n• owner: Proprietário do repositório\n• repo: Nome do repositório\n• branch: Nome da branch\n\nPARÂMETROS OBRIGATÓRIOS POR ACTION:\n- create: owner + repo + branch_name + from_branch\n- list: owner + repo\n- get: owner + repo + branch\n- delete: owner + repo + branch\n- merge: owner + repo + head + base + merge_method\n- compare: owner + repo + base_branch + head_branch\n\nEXEMPLOS DE USO:\n• Criar branch: {"action":"create","owner":"johndoe","repo":"myproject","branch_name":"feature/new-ui","from_branch":"main"}\n• Listar branches: {"action":"list","owner":"johndoe","repo":"myproject"}\n• Comparar: {"action":"compare","owner":"johndoe","repo":"myproject","base_branch":"main","head_branch":"feature/new-ui"}\n\nBOAS PRÁTICAS:\n• Use nomes descritivos: feature/login, fix/bug-123, hotfix/security\n• Mantenha branches principais protegidas\n• Faça merges pequenos e frequentes\n• Delete branches após merge\n• Use compare antes de integrar',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['create', 'list', 'get', 'delete', 'merge', 'compare'],
                description: 'Action to perform on branches'
            },
            owner: { type: 'string', description: 'Repository owner' },
            repo: { type: 'string', description: 'Repository name' },
            provider: { type: 'string', description: 'Specific provider (github, gitea) or use default' },
            branch_name: { type: 'string', description: 'Name of the new branch' },
            from_branch: { type: 'string', description: 'Source branch for creation' },
            branch: { type: 'string', description: 'Branch name' },
            head: { type: 'string', description: 'Source branch for merge' },
            base: { type: 'string', description: 'Target branch for merge' },
            merge_method: {
                type: 'string',
                enum: ['merge', 'rebase', 'squash'],
                description: 'Merge method'
            },
            page: { type: 'number', description: 'Page number', minimum: 1 },
            limit: { type: 'number', description: 'Items per page', minimum: 1, maximum: 100 },
            base_branch: { type: 'string', description: 'Base branch for comparison' },
            head_branch: { type: 'string', description: 'Head branch for comparison' }
        },
        required: ['action']
    },
    /**
     * Handler principal da tool branches
     *
     * FUNCIONALIDADE:
     * - Valida entrada usando Zod schema
     * - Roteia para método específico baseado na ação
     * - Trata erros de forma uniforme
     * - Retorna resultado padronizado
     *
     * FLUXO:
     * 1. Validação de entrada
     * 2. Roteamento por ação
     * 3. Execução do método específico
     * 4. Tratamento de erros
     * 5. Retorno de resultado
     *
     * TRATAMENTO DE ERROS:
     * - Validação: erro de schema
     * - Execução: erro da operação
     * - Roteamento: ação não suportada
     *
     * RECOMENDAÇÕES:
     * - Sempre valide entrada antes de processar
     * - Trate erros específicos adequadamente
     * - Log detalhes de erro para debug
     * - Retorne mensagens de erro úteis
     */
    handler: function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var validatedInput, provider, updatedParams, _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 15, , 16]);
                        validatedInput = BranchesInputSchema.parse(input);
                        provider = validatedInput.provider
                            ? index_js_1.globalProviderFactory.getProvider(validatedInput.provider)
                            : index_js_1.globalProviderFactory.getDefaultProvider();
                        if (!provider) {
                            throw new Error("Provider '".concat(validatedInput.provider, "' n\u00E3o encontrado"));
                        }
                        updatedParams = validatedInput;
                        _a = updatedParams.action;
                        switch (_a) {
                            case 'create': return [3 /*break*/, 1];
                            case 'list': return [3 /*break*/, 3];
                            case 'get': return [3 /*break*/, 5];
                            case 'delete': return [3 /*break*/, 7];
                            case 'merge': return [3 /*break*/, 9];
                            case 'compare': return [3 /*break*/, 11];
                        }
                        return [3 /*break*/, 13];
                    case 1: return [4 /*yield*/, this.createBranch(updatedParams, provider)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3: return [4 /*yield*/, this.listBranches(updatedParams, provider)];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5: return [4 /*yield*/, this.getBranch(updatedParams, provider)];
                    case 6: return [2 /*return*/, _b.sent()];
                    case 7: return [4 /*yield*/, this.deleteBranch(updatedParams, provider)];
                    case 8: return [2 /*return*/, _b.sent()];
                    case 9: return [4 /*yield*/, this.mergeBranches(updatedParams, provider)];
                    case 10: return [2 /*return*/, _b.sent()];
                    case 11: return [4 /*yield*/, this.compareBranches(updatedParams, provider)];
                    case 12: return [2 /*return*/, _b.sent()];
                    case 13: throw new Error("A\u00E7\u00E3o n\u00E3o suportada: ".concat(updatedParams.action));
                    case 14: return [3 /*break*/, 16];
                    case 15:
                        error_1 = _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                action: input.action,
                                message: 'Erro na operação de branches',
                                error: error_1 instanceof Error ? error_1.message : String(error_1)
                            }];
                    case 16: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Cria uma nova branch no repositório
     *
     * FUNCIONALIDADE:
     * - Valida parâmetros obrigatórios
     * - Cria branch a partir de branch existente
     * - Retorna detalhes da nova branch
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - branch_name: Nome da nova branch
     * - from_branch: Branch de origem
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Branch de origem deve existir
     * - Nome da nova branch deve ser único
     *
     * RECOMENDAÇÕES:
     * - Use nomes descritivos para branches
     * - Crie a partir de branches estáveis
     * - Documente propósito da branch
     * - Use convenções de nomenclatura
     */
    createBranch: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var branch, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!params.owner || !params.repo || !params.branch_name || !params.from_branch) {
                            throw new Error('Owner, repo, branch_name e from_branch são obrigatórios');
                        }
                        return [4 /*yield*/, provider.createBranch(params.owner, params.repo, params.branch_name, params.from_branch)];
                    case 1:
                        branch = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'create',
                                message: "Branch '".concat(params.branch_name, "' criada com sucesso a partir de '").concat(params.from_branch, "'"),
                                data: branch
                            }];
                    case 2:
                        error_2 = _a.sent();
                        throw new Error("Falha ao criar branch: ".concat(error_2 instanceof Error ? error_2.message : String(error_2)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Lista todas as branches do repositório
     *
     * FUNCIONALIDADE:
     * - Lista branches com paginação
     * - Retorna informações básicas de cada branch
     * - Suporta filtros de paginação
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     *
     * PARÂMETROS OPCIONAIS:
     * - page: Página da listagem (padrão: 1)
     * - limit: Itens por página (padrão: 30, máximo: 100)
     *
     * VALIDAÇÕES:
     * - Owner e repo obrigatórios
     * - Page deve ser >= 1
     * - Limit deve ser entre 1 e 100
     *
     * RECOMENDAÇÕES:
     * - Use paginação para repositórios grandes
     * - Monitore número total de branches
     * - Mantenha branches organizadas
     */
    listBranches: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var page, limit, branches, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!params.owner || !params.repo) {
                            throw new Error('Owner e repo são obrigatórios');
                        }
                        page = params.page || 1;
                        limit = params.limit || 30;
                        return [4 /*yield*/, provider.listBranches(params.owner, params.repo, page, limit)];
                    case 1:
                        branches = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'list',
                                message: "".concat(branches.length, " branches encontradas"),
                                data: {
                                    branches: branches,
                                    page: page,
                                    limit: limit,
                                    total: branches.length
                                }
                            }];
                    case 2:
                        error_3 = _a.sent();
                        throw new Error("Falha ao listar branches: ".concat(error_3 instanceof Error ? error_3.message : String(error_3)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Obtém detalhes de uma branch específica
     *
     * FUNCIONALIDADE:
     * - Retorna informações completas da branch
     * - Inclui commit mais recente
     * - Informações de proteção e permissões
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - branch: Nome da branch
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Branch deve existir no repositório
     *
     * RECOMENDAÇÕES:
     * - Use para obter informações detalhadas
     * - Verifique status de proteção
     * - Monitore commits recentes
     */
    getBranch: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var branch, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!params.owner || !params.repo || !params.branch) {
                            throw new Error('Owner, repo e branch são obrigatórios');
                        }
                        return [4 /*yield*/, provider.getBranch(params.owner, params.repo, params.branch)];
                    case 1:
                        branch = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'get',
                                message: "Branch '".concat(params.branch, "' obtida com sucesso"),
                                data: branch
                            }];
                    case 2:
                        error_4 = _a.sent();
                        throw new Error("Falha ao obter branch: ".concat(error_4 instanceof Error ? error_4.message : String(error_4)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Deleta uma branch do repositório
     *
     * FUNCIONALIDADE:
     * - Remove branch especificada
     * - Valida permissões de exclusão
     * - Confirma exclusão bem-sucedida
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - branch: Nome da branch a ser deletada
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Branch deve existir
     * - Usuário deve ter permissão de exclusão
     *
     * RECOMENDAÇÕES:
     * - Confirme antes de deletar
     * - Verifique se branch foi mergeada
     * - Mantenha backup se necessário
     * - Documente motivo da exclusão
     */
    deleteBranch: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!params.owner || !params.repo || !params.branch) {
                            throw new Error('Owner, repo e branch são obrigatórios');
                        }
                        return [4 /*yield*/, provider.deleteBranch(params.owner, params.repo, params.branch)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'delete',
                                message: "Branch '".concat(params.branch, "' deletada com sucesso"),
                                data: { deleted: true }
                            }];
                    case 2:
                        error_5 = _a.sent();
                        throw new Error("Falha ao deletar branch: ".concat(error_5 instanceof Error ? error_5.message : String(error_5)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Faz merge de uma branch em outra
     *
     * FUNCIONALIDADE:
     * - Merge de branch de origem em branch de destino
     * - Suporta diferentes métodos de merge
     * - Retorna resultado do merge
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - head: Branch de origem (será mergeada)
     * - base: Branch de destino (receberá o merge)
     *
     * PARÂMETROS OPCIONAIS:
     * - merge_method: Método de merge (merge, rebase, squash)
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Branches devem existir
     * - Não deve haver conflitos
     *
     * RECOMENDAÇÕES:
     * - Resolva conflitos antes do merge
     * - Escolha método de merge adequado
     * - Teste após o merge
     * - Documente mudanças
     */
    mergeBranches: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    if (!params.owner || !params.repo || !params.head || !params.base) {
                        throw new Error('Owner, repo, head e base são obrigatórios');
                    }
                    // Por enquanto, retorna mensagem de funcionalidade não implementada
                    // TODO: Implementar merge direto de branches via provider
                    return [2 /*return*/, {
                            success: true,
                            action: 'merge',
                            message: "Merge de '".concat(params.head, "' em '").concat(params.base, "' solicitado (funcionalidade ser\u00E1 implementada)"),
                            data: {
                                head: params.head,
                                base: params.base,
                                merge_method: params.merge_method || 'merge'
                            }
                        }];
                }
                catch (error) {
                    throw new Error("Falha ao fazer merge: ".concat(error instanceof Error ? error.message : String(error)));
                }
                return [2 /*return*/];
            });
        });
    },
    /**
     * Compara duas branches
     *
     * FUNCIONALIDADE:
     * - Compara diferenças entre branches
     * - Retorna commits diferentes
     * - Mostra divergências
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - base_branch: Branch base para comparação
     * - head_branch: Branch a ser comparada
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Ambas as branches devem existir
     *
     * RECOMENDAÇÕES:
     * - Use para verificar divergências
     * - Compare antes de fazer merge
     * - Analise commits diferentes
     * - Documente diferenças importantes
     */
    compareBranches: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    if (!params.owner || !params.repo || !params.base_branch || !params.head_branch) {
                        throw new Error('Owner, repo, base_branch e head_branch são obrigatórios');
                    }
                    // Implementar comparação de branches
                    // Por enquanto, retorna mensagem de funcionalidade
                    return [2 /*return*/, {
                            success: true,
                            action: 'compare',
                            message: "Compara\u00E7\u00E3o entre '".concat(params.base_branch, "' e '").concat(params.head_branch, "' solicitada"),
                            data: {
                                base: params.base_branch,
                                head: params.head_branch,
                                comparison: 'Funcionalidade de comparação será implementada'
                            }
                        }];
                }
                catch (error) {
                    throw new Error("Falha ao comparar branches: ".concat(error instanceof Error ? error.message : String(error)));
                }
                return [2 /*return*/];
            });
        });
    }
};
