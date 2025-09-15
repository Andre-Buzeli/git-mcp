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
exports.gitSyncTool = void 0;
var zod_1 = require("zod");
/**
 * Tool: git-sync
 *
 * DESCRIÇÃO:
 * Sincronização entre dois repositórios hospedados em provedores distintos (ex.: Gitea <-> GitHub).
 *
 * OBJETIVOS:
 * - Configurar espelhamento (quando suportado pelo backend) e registrar estado
 * - Executar sincronização pontual (one-shot) de código e/ou metadados
 * - Consultar status/diagnóstico da sincronização
 *
 * LIMITAÇÕES:
 * - Histórico Git completo por API REST é limitado; prioriza espelhamento nativo (push mirrors) quando disponível
 * - Metadados (issues, labels, releases, PRs) têm mapeamento best-effort com diferenças entre plataformas
 *
 * DICAS (solo):
 * - Use para manter um backup/em espelho entre provedores
 * - Prefira one-shot antes de configurar contínuo; verifique status e conflitos
 * - Defina estratégia de conflito e escopos explicitamente
 */
var GitSyncInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['configure', 'status', 'one-shot']),
    source: zod_1.z.object({ provider: zod_1.z.string(), owner: zod_1.z.string(), repo: zod_1.z.string() }).optional(),
    target: zod_1.z.object({ provider: zod_1.z.string(), owner: zod_1.z.string(), repo: zod_1.z.string() }).optional(),
    direction: zod_1.z.enum(['one-way', 'two-way']).optional(),
    include: zod_1.z.array(zod_1.z.enum(['git', 'issues', 'labels', 'milestones', 'releases', 'pulls'])).optional(),
    strategy: zod_1.z.enum(['source-wins', 'timestamp', 'skip-conflicts']).optional(),
    dry_run: zod_1.z.boolean().optional()
});
var GitSyncResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    action: zod_1.z.string(),
    message: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional()
});
exports.gitSyncTool = {
    name: 'git-sync',
    description: 'Synchronize two repositories across providers (Gitea <-> GitHub). Modos: configure (espelhamento quando suportado), one-shot (execução pontual) e status (diagnóstico). Dicas: execute dry-run primeiro, escolha escopos e estratégia de conflito.',
    inputSchema: {
        type: 'object',
        properties: {
            action: { type: 'string', enum: ['configure', 'status', 'one-shot'], description: 'Sync action' },
            source: {
                type: 'object',
                description: 'Source repository descriptor',
                properties: {
                    provider: { type: 'string' },
                    owner: { type: 'string' },
                    repo: { type: 'string' }
                }
            },
            target: {
                type: 'object',
                description: 'Target repository descriptor',
                properties: {
                    provider: { type: 'string' },
                    owner: { type: 'string' },
                    repo: { type: 'string' }
                }
            },
            direction: { type: 'string', enum: ['one-way', 'two-way'], description: 'Sync direction' },
            include: { type: 'array', items: { type: 'string', enum: ['git', 'issues', 'labels', 'milestones', 'releases', 'pulls'] }, description: 'Scopes to include' },
            strategy: { type: 'string', enum: ['source-wins', 'timestamp', 'skip-conflicts'], description: 'Conflict strategy' },
            dry_run: { type: 'boolean', description: 'Simulate without applying changes' }
        },
        required: ['action']
    },
    handler: function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var params;
            return __generator(this, function (_a) {
                try {
                    params = GitSyncInputSchema.parse(input);
                    switch (params.action) {
                        case 'configure':
                            return [2 /*return*/, {
                                    success: true,
                                    action: 'configure',
                                    message: 'Configuração registrada (placeholder). Integração com providers será aplicada na próxima etapa da implementação.',
                                    data: { params: params }
                                }];
                        case 'status':
                            return [2 /*return*/, {
                                    success: true,
                                    action: 'status',
                                    message: 'Status coletado (placeholder).',
                                    data: { health: 'unknown', details: params }
                                }];
                        case 'one-shot':
                            return [2 /*return*/, {
                                    success: true,
                                    action: 'one-shot',
                                    message: 'Sincronização pontual executada (placeholder).',
                                    data: { params: params, applied: false }
                                }];
                        default:
                            throw new Error("A\u00E7\u00E3o n\u00E3o suportada: ".concat(params.action));
                    }
                }
                catch (error) {
                    return [2 /*return*/, {
                            success: false,
                            action: input.action,
                            message: 'Erro na execução do git-sync',
                            error: error instanceof Error ? error.message : String(error)
                        }];
                }
                return [2 /*return*/];
            });
        });
    }
};
