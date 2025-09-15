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
exports.filesTool = void 0;
var zod_1 = require("zod");
var index_js_1 = require("../providers/index.js");
/**
 * Tool: files
 *
 * DESCRIÇÃO:
 * Gerenciamento completo de arquivos e diretórios Gitea com múltiplas ações
 *
 * FUNCIONALIDADES:
 * - Criação de arquivos e diretórios
 * - Leitura e listagem de conteúdo
 * - Atualização de arquivos existentes
 * - Exclusão de arquivos e diretórios
 * - Busca por conteúdo e nome
 * - Controle de versão de arquivos
 *
 * USO:
 * - Para gerenciar arquivos de projeto
 * - Para automatizar criação de arquivos
 * - Para backup e migração de conteúdo
 * - Para sincronização de arquivos
 *
 * RECOMENDAÇÕES:
 * - Use mensagens de commit descritivas
 * - Mantenha estrutura de diretórios organizada
 * - Valide conteúdo antes de enviar
 * - Use branches para mudanças grandes
 */
/**
 * Schema de validação para entrada da tool files
 *
 * VALIDAÇÕES:
 * - action: Ação obrigatória (get, create, update, delete, list, search)
 * - Parâmetros específicos por ação
 * - Validação de tipos e formatos
 *
 * RECOMENDAÇÕES:
 * - Sempre valide entrada antes de usar
 * - Use parâmetros opcionais adequadamente
 * - Documente parâmetros obrigatórios
 */
var FilesInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['get', 'create', 'update', 'delete', 'list', 'search']),
    // Parâmetros comuns
    owner: zod_1.z.string().optional(),
    repo: zod_1.z.string().optional(),
    path: zod_1.z.string().optional(),
    provider: zod_1.z.enum(['gitea', 'github', 'both']).optional(), // Provider específico: gitea, github ou both
    // Para create/update
    content: zod_1.z.string().optional(),
    message: zod_1.z.string().optional(),
    branch: zod_1.z.string().optional(),
    // Para update/delete
    sha: zod_1.z.string().optional(),
    // Para list
    ref: zod_1.z.string().optional(),
    // Para search
    query: zod_1.z.string().optional(),
    // Para list com paginação
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
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
var FilesResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    action: zod_1.z.string(),
    message: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional()
});
/**
 * Tool: files
 *
 * DESCRIÇÃO:
 * Gerenciamento completo de arquivos e diretórios Gitea com múltiplas ações
 *
 * ACTIONS DISPONÍVEIS:
 *
 * 1. get - Obter conteúdo de arquivo
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - path (obrigatório): Caminho do arquivo
 *    - ref (opcional): Branch, tag ou commit (padrão: branch padrão)
 *
 * 2. create - Criar novo arquivo
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - path (obrigatório): Caminho do arquivo
 *    - content (obrigatório): Conteúdo do arquivo
 *    - message (obrigatório): Mensagem de commit
 *    - branch (opcional): Branch de destino (padrão: branch padrão)
 *
 * 3. update - Atualizar arquivo existente
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - path (obrigatório): Caminho do arquivo
 *    - content (obrigatório): Novo conteúdo
 *    - message (obrigatório): Mensagem de commit
 *    - sha (obrigatório): SHA do arquivo atual
 *    - branch (opcional): Branch de destino (padrão: branch padrão)
 *
 * 4. delete - Deletar arquivo
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - path (obrigatório): Caminho do arquivo
 *    - message (obrigatório): Mensagem de commit
 *    - sha (obrigatório): SHA do arquivo
 *    - branch (opcional): Branch de destino (padrão: branch padrão)
 *
 * 5. list - Listar conteúdo de diretório
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - path (opcional): Caminho do diretório (padrão: raiz)
 *    - ref (opcional): Branch, tag ou commit (padrão: branch padrão)
 *    - page (opcional): Página da listagem (padrão: 1)
 *    - limit (opcional): Itens por página (padrão: 30, máximo: 100)
 *
 * 6. search - Buscar arquivos por conteúdo
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - query (obrigatório): Termo de busca
 *    - ref (opcional): Branch, tag ou commit (padrão: branch padrão)
 *
 * RECOMENDAÇÕES DE USO:
 * - Use mensagens de commit descritivas
 * - Mantenha estrutura de diretórios organizada
 * - Valide conteúdo antes de enviar
 * - Use branches para mudanças grandes
 * - Documente mudanças importantes
 * - Mantenha histórico de commits limpo
 */
exports.filesTool = {
    name: 'files',
    description: 'GERENCIAMENTO DE ARQUIVOS - GitHub & Gitea\n\nACTIONS DISPONÍVEIS:\n• get: Obtém conteúdo de um arquivo específico\n• create: Cria novo arquivo no repositório\n• update: Atualiza conteúdo de arquivo existente (SHA automático)\n• delete: Remove arquivo do repositório (SHA automático)\n• list: Lista arquivos em um diretório\n• search: Busca arquivos por conteúdo\n\nPARÂMETROS COMUNS:\n• provider: "github" ou "gitea" (opcional)\n• owner: Proprietário do repositório\n• repo: Nome do repositório\n• path: Caminho do arquivo/diretório\n• branch: Branch alvo (padrão: main/master)\n\nPARÂMETROS OBRIGATÓRIOS POR ACTION:\n- get: owner + repo + path\n- create: owner + repo + path + content + message\n- update: owner + repo + path + content + message\n- delete: owner + repo + path + message\n- list: owner + repo\n- search: owner + repo + query\n\nPARÂMETROS OPCIONAIS:\n• sha: Hash do arquivo (automático para update/delete)\n• branch: Branch específica (padrão: main)\n\nEXEMPLOS DE USO:\n• Obter arquivo: {"action":"get","owner":"johndoe","repo":"myproject","path":"README.md"}\n• Criar arquivo: {"action":"create","owner":"johndoe","repo":"myproject","path":"src/main.js","content":"console.log(\'Hello\');","message":"Add main file"}\n• Atualizar: {"action":"update","owner":"johndoe","repo":"myproject","path":"README.md","content":"Novo conteúdo","message":"Update README"}\n• Buscar: {"action":"search","owner":"johndoe","repo":"myproject","query":"function"}\n\nCARACTERÍSTICAS ESPECIAIS:\n• SHA automático: Não precisa fornecer SHA para update/delete\n• Commits automáticos: Mensagens claras de commit\n• Busca por conteúdo: Localiza arquivos por texto\n• Suporte a branches: Trabalhe em branches específicas',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['get', 'create', 'update', 'delete', 'list', 'search'],
                description: 'Action to perform on files'
            },
            owner: { type: 'string', description: 'Repository owner' },
            repo: { type: 'string', description: 'Repository name' },
            path: { type: 'string', description: 'File or directory path' },
            provider: { type: 'string', description: 'Specific provider (github, gitea) or use default' },
            content: { type: 'string', description: 'File content' },
            message: { type: 'string', description: 'Commit message' },
            branch: { type: 'string', description: 'Target branch' },
            sha: { type: 'string', description: 'File SHA hash' },
            ref: { type: 'string', description: 'Branch, tag or commit reference' },
            query: { type: 'string', description: 'Search query' },
            page: { type: 'number', description: 'Page number', minimum: 1 },
            limit: { type: 'number', description: 'Items per page', minimum: 1, maximum: 100 }
        },
        required: ['action']
    },
    /**
     * Handler principal da tool files
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
            var validatedInput, provider, _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 15, , 16]);
                        validatedInput = FilesInputSchema.parse(input);
                        provider = validatedInput.provider
                            ? index_js_1.globalProviderFactory.getProvider(validatedInput.provider)
                            : index_js_1.globalProviderFactory.getDefaultProvider();
                        if (!provider) {
                            throw new Error("Provider '".concat(validatedInput.provider, "' n\u00E3o encontrado"));
                        }
                        _a = validatedInput.action;
                        switch (_a) {
                            case 'get': return [3 /*break*/, 1];
                            case 'create': return [3 /*break*/, 3];
                            case 'update': return [3 /*break*/, 5];
                            case 'delete': return [3 /*break*/, 7];
                            case 'list': return [3 /*break*/, 9];
                            case 'search': return [3 /*break*/, 11];
                        }
                        return [3 /*break*/, 13];
                    case 1: return [4 /*yield*/, this.getFile(validatedInput, provider)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3: return [4 /*yield*/, this.createFile(validatedInput, provider)];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5: return [4 /*yield*/, this.updateFile(validatedInput, provider)];
                    case 6: return [2 /*return*/, _b.sent()];
                    case 7: return [4 /*yield*/, this.deleteFile(validatedInput, provider)];
                    case 8: return [2 /*return*/, _b.sent()];
                    case 9: return [4 /*yield*/, this.listFiles(validatedInput, provider)];
                    case 10: return [2 /*return*/, _b.sent()];
                    case 11: return [4 /*yield*/, this.searchFiles(validatedInput, provider)];
                    case 12: return [2 /*return*/, _b.sent()];
                    case 13: throw new Error("A\u00E7\u00E3o n\u00E3o suportada: ".concat(validatedInput.action));
                    case 14: return [3 /*break*/, 16];
                    case 15:
                        error_1 = _b.sent();
                        return [2 /*return*/, {
                                success: false,
                                action: input.action,
                                message: 'Erro na operação de arquivos',
                                error: error_1 instanceof Error ? error_1.message : String(error_1)
                            }];
                    case 16: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Obtém o conteúdo de um arquivo específico
     *
     * FUNCIONALIDADE:
     * - Retorna conteúdo completo do arquivo
     * - Inclui metadados (SHA, tamanho, tipo)
     * - Suporta diferentes referências (branch, tag, commit)
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - path: Caminho do arquivo
     *
     * PARÂMETROS OPCIONAIS:
     * - ref: Branch, tag ou commit (padrão: branch padrão)
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Arquivo deve existir no caminho especificado
     * - Referência deve ser válida
     *
     * RECOMENDAÇÕES:
     * - Use para leitura de arquivos de configuração
     * - Verifique tamanho antes de ler arquivos grandes
     * - Use referências específicas para versões
     * - Trate arquivos binários adequadamente
     */
    getFile: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var file, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!params.owner || !params.repo || !params.path) {
                            throw new Error('Owner, repo e path são obrigatórios');
                        }
                        return [4 /*yield*/, provider.getFile(params.owner, params.repo, params.path, params.ref)];
                    case 1:
                        file = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'get',
                                message: "Arquivo '".concat(params.path, "' obtido com sucesso"),
                                data: file
                            }];
                    case 2:
                        error_2 = _a.sent();
                        throw new Error("Falha ao obter arquivo: ".concat(error_2 instanceof Error ? error_2.message : String(error_2)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Cria um novo arquivo no repositório
     *
     * FUNCIONALIDADE:
     * - Cria arquivo com conteúdo especificado
     * - Faz commit automático com mensagem
     * - Suporta criação em branches específicas
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - path: Caminho do arquivo
     * - content: Conteúdo do arquivo
     * - message: Mensagem de commit
     *
     * PARÂMETROS OPCIONAIS:
     * - branch: Branch de destino (padrão: branch padrão)
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Caminho deve ser válido
     * - Usuário deve ter permissão de escrita
     *
     * RECOMENDAÇÕES:
     * - Use mensagens de commit descritivas
     * - Valide conteúdo antes de enviar
     * - Use branches para mudanças grandes
     * - Documente propósito do arquivo
     */
    createFile: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!params.owner || !params.repo || !params.path || !params.content || !params.message) {
                            throw new Error('Owner, repo, path, content e message são obrigatórios');
                        }
                        return [4 /*yield*/, provider.createFile(params.owner, params.repo, params.path, params.content, params.message, params.branch)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'create',
                                message: "Arquivo '".concat(params.path, "' criado com sucesso"),
                                data: result
                            }];
                    case 2:
                        error_3 = _a.sent();
                        throw new Error("Falha ao criar arquivo: ".concat(error_3 instanceof Error ? error_3.message : String(error_3)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Atualiza um arquivo existente no repositório
     *
     * FUNCIONALIDADE:
     * - Atualiza conteúdo do arquivo
     * - Faz commit com nova versão
     * - Requer SHA do arquivo atual
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - path: Caminho do arquivo
     * - content: Novo conteúdo
     * - message: Mensagem de commit
     * - sha: SHA do arquivo atual
     *
     * PARÂMETROS OPCIONAIS:
     * - branch: Branch de destino (padrão: branch padrão)
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Arquivo deve existir
     * - SHA deve ser válido
     *
     * RECOMENDAÇÕES:
     * - Sempre obtenha SHA atual antes de atualizar
     * - Use mensagens de commit descritivas
     * - Verifique se arquivo não foi modificado por outro usuário
     * - Teste mudanças antes de commitar
     */
    updateFile: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var fileSha, fileInfo, error_4, result, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        if (!params.owner || !params.repo || !params.path || !params.content || !params.message) {
                            throw new Error('Owner, repo, path, content e message são obrigatórios');
                        }
                        fileSha = params.sha;
                        if (!!fileSha) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, provider.getFile(params.owner, params.repo, params.path, params.branch)];
                    case 2:
                        fileInfo = _a.sent();
                        fileSha = fileInfo.sha;
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        throw new Error("N\u00E3o foi poss\u00EDvel obter SHA automaticamente para '".concat(params.path, "'. Forne\u00E7a o par\u00E2metro 'sha' manualmente."));
                    case 4: return [4 /*yield*/, provider.updateFile(params.owner, params.repo, params.path, params.content, params.message, fileSha, params.branch)];
                    case 5:
                        result = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'update',
                                message: "Arquivo '".concat(params.path, "' atualizado com sucesso"),
                                data: result
                            }];
                    case 6:
                        error_5 = _a.sent();
                        throw new Error("Falha ao atualizar arquivo: ".concat(error_5 instanceof Error ? error_5.message : String(error_5)));
                    case 7: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Deleta um arquivo do repositório
     *
     * FUNCIONALIDADE:
     * - Remove arquivo especificado
     * - Faz commit de exclusão
     * - Requer SHA do arquivo
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - path: Caminho do arquivo
     * - message: Mensagem de commit
     * - sha: SHA do arquivo
     *
     * PARÂMETROS OPCIONAIS:
     * - branch: Branch de destino (padrão: branch padrão)
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Arquivo deve existir
     * - SHA deve ser válido
     *
     * RECOMENDAÇÕES:
     * - Confirme exclusão antes de executar
     * - Use mensagens de commit descritivas
     * - Verifique dependências do arquivo
     * - Mantenha backup se necessário
     */
    deleteFile: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var fileSha, fileInfo, error_6, result, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        if (!params.owner || !params.repo || !params.path || !params.message) {
                            throw new Error('Owner, repo, path e message são obrigatórios');
                        }
                        fileSha = params.sha;
                        if (!!fileSha) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, provider.getFile(params.owner, params.repo, params.path, params.branch)];
                    case 2:
                        fileInfo = _a.sent();
                        fileSha = fileInfo.sha;
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _a.sent();
                        throw new Error("N\u00E3o foi poss\u00EDvel obter SHA automaticamente para '".concat(params.path, "'. Forne\u00E7a o par\u00E2metro 'sha' manualmente."));
                    case 4: return [4 /*yield*/, provider.deleteFile(params.owner, params.repo, params.path, params.message, fileSha, params.branch)];
                    case 5:
                        result = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'delete',
                                message: "Arquivo '".concat(params.path, "' deletado com sucesso"),
                                data: { deleted: result }
                            }];
                    case 6:
                        error_7 = _a.sent();
                        throw new Error("Falha ao deletar arquivo: ".concat(error_7 instanceof Error ? error_7.message : String(error_7)));
                    case 7: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Lista conteúdo de um diretório
     *
     * FUNCIONALIDADE:
     * - Lista arquivos e subdiretórios
     * - Suporta paginação
     * - Inclui metadados de cada item
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     *
     * PARÂMETROS OPCIONAIS:
     * - path: Caminho do diretório (padrão: raiz)
     * - ref: Branch, tag ou commit (padrão: branch padrão)
     * - page: Página da listagem (padrão: 1)
     * - limit: Itens por página (padrão: 30, máximo: 100)
     *
     * VALIDAÇÕES:
     * - Owner e repo obrigatórios
     * - Diretório deve existir
     * - Page deve ser >= 1
     * - Limit deve ser entre 1 e 100
     *
     * RECOMENDAÇÕES:
     * - Use paginação para diretórios grandes
     * - Monitore número total de itens
     * - Use referências específicas para versões
     * - Organize estrutura de diretórios
     */
    listFiles: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var path, page, limit, files, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!params.owner || !params.repo) {
                            throw new Error('Owner e repo são obrigatórios');
                        }
                        path = params.path || '';
                        page = params.page || 1;
                        limit = params.limit || 30;
                        return [4 /*yield*/, provider.listFiles(params.owner, params.repo, path, params.ref)];
                    case 1:
                        files = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                action: 'list',
                                message: "".concat(files.length, " itens encontrados em '").concat(path || 'raiz', "'"),
                                data: {
                                    path: path,
                                    files: files,
                                    page: page,
                                    limit: limit,
                                    total: files.length
                                }
                            }];
                    case 2:
                        error_8 = _a.sent();
                        throw new Error("Falha ao listar arquivos: ".concat(error_8 instanceof Error ? error_8.message : String(error_8)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Busca arquivos por conteúdo
     *
     * FUNCIONALIDADE:
     * - Busca arquivos que contenham texto específico
     * - Suporta diferentes referências
     * - Retorna resultados relevantes
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - query: Termo de busca
     *
     * PARÂMETROS OPCIONAIS:
     * - ref: Branch, tag ou commit (padrão: branch padrão)
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Query deve ter pelo menos 3 caracteres
     * - Repositório deve existir
     *
     * RECOMENDAÇÕES:
     * - Use termos de busca específicos
     * - Combine com filtros de diretório
     * - Use referências para versões específicas
     * - Analise resultados para relevância
     */
    searchFiles: function (params, provider) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    if (!params.owner || !params.repo || !params.query) {
                        throw new Error('Owner, repo e query são obrigatórios');
                    }
                    if (params.query.length < 3) {
                        throw new Error('Query deve ter pelo menos 3 caracteres');
                    }
                    // Implementar busca de arquivos por conteúdo
                    // Por enquanto, retorna mensagem de funcionalidade
                    return [2 /*return*/, {
                            success: true,
                            action: 'search',
                            message: "Busca por '".concat(params.query, "' solicitada"),
                            data: {
                                query: params.query,
                                ref: params.ref || 'branch padrão',
                                results: 'Funcionalidade de busca será implementada'
                            }
                        }];
                }
                catch (error) {
                    throw new Error("Falha ao buscar arquivos: ".concat(error instanceof Error ? error.message : String(error)));
                }
                return [2 /*return*/];
            });
        });
    }
};
