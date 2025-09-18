"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gitWorktreeTool = void 0;
const zod_1 = require("zod");
const terminal_controller_js_1 = require("../utils/terminal-controller.js");
/**
 * Tool: git-worktree
 *
 * DESCRIÇÃO:
 * Gerenciamento de worktrees Git (GitHub + Gitea) com múltiplas ações
 *
 * FUNCIONALIDADES:
 * - Adicionar worktree
 * - Remover worktree
 * - Listar worktrees
 * - Prune worktrees
 * - Mover worktree
 * - Reparar worktree
 *
 * USO:
 * - Para trabalhar em múltiplas branches simultaneamente
 * - Para testes em branches diferentes
 * - Para desenvolvimento paralelo
 * - Para builds em branches específicas
 *
 * RECOMENDAÇÕES:
 * - Use para branches de longa duração
 * - Mantenha worktrees organizados
 * - Limpe worktrees antigos
 */
const GitWorktreeInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['add', 'remove', 'list', 'prune', 'move', 'repair']),
    // owner: obtido automaticamente do provider,
    repo: zod_1.z.string(),
    provider: zod_1.z.enum(['gitea', 'github']).describe('Provider to use (gitea or github)'),
    projectPath: zod_1.z.string().describe('Local project path for git operations'),
    // Para add
    worktree_path: zod_1.z.string().optional(),
    branch_name: zod_1.z.string().optional(),
    commit_hash: zod_1.z.string().optional(),
    // Para remove
    worktree_to_remove: zod_1.z.string().optional(),
    force: zod_1.z.boolean().optional(),
    // Para move
    old_path: zod_1.z.string().optional(),
    new_path: zod_1.z.string().optional(),
    // Para repair
    worktree_to_repair: zod_1.z.string().optional(),
});
const GitWorktreeResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    action: zod_1.z.string(),
    message: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional()
});
exports.gitWorktreeTool = {
    name: 'git-worktree',
    description: 'tool: Gerencia worktrees Git para trabalhar em múltiplas branches\n──────────────\naction add: adiciona novo worktree\naction add requires: repo, provider, projectPath, worktree_path, branch_name, commit_hash\n───────────────\naction remove: remove worktree\naction remove requires: repo, provider, projectPath, worktree_to_remove, force\n───────────────\naction list: lista worktrees disponíveis\naction list requires: repo, provider, projectPath\n───────────────\naction prune: remove worktrees órfãos\naction prune requires: repo, provider, projectPath, force\n───────────────\naction move: move worktree para novo local\naction move requires: repo, provider, projectPath, old_path, new_path, force\n───────────────\naction repair: repara worktree corrompido\naction repair requires: repo, provider, projectPath, worktree_to_repair',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['add', 'remove', 'list', 'prune', 'move', 'repair'],
                description: 'Action to perform on worktrees'
            },
            owner: { type: 'string', description: 'Repository owner' },
            repo: { type: 'string', description: 'Repository name' },
            provider: { type: 'string', enum: ['gitea', 'github'], description: 'Provider to use (gitea or github)' },
            projectPath: { type: 'string', description: 'Local project path for git operations' },
            worktree_path: { type: 'string', description: 'Worktree path' },
            branch_name: { type: 'string', description: 'Branch name' },
            commit_hash: { type: 'string', description: 'Commit hash' },
            worktree_to_remove: { type: 'string', description: 'Worktree to remove' },
            force: { type: 'boolean', description: 'Force operation' },
            old_path: { type: 'string', description: 'Old worktree path' },
            new_path: { type: 'string', description: 'New worktree path' },
            worktree_to_repair: { type: 'string', description: 'Worktree to repair' }
        },
        required: ['action', 'repo', 'provider', 'projectPath']
    },
    async handler(input) {
        try {
            const validatedInput = GitWorktreeInputSchema.parse(input);
            switch (validatedInput.action) {
                case 'add':
                    return await this.add(validatedInput);
                case 'remove':
                    return await this.remove(validatedInput);
                case 'list':
                    return await this.list(validatedInput);
                case 'prune':
                    return await this.prune(validatedInput);
                case 'move':
                    return await this.move(validatedInput);
                case 'repair':
                    return await this.repair(validatedInput);
                default:
                    throw new Error(`Ação não suportada: ${validatedInput.action}`);
            }
        }
        catch (error) {
            return {
                success: false,
                action: input.action,
                message: 'Erro na operação de worktree',
                error: error instanceof Error ? error.message : String(error)
            };
        }
    },
    async add(params) {
        try {
            if (!params.worktree_path) {
                throw new Error('worktree_path é obrigatório para add');
            }
            let gitCommand = `worktree add ${params.worktree_path}`;
            if (params.branch_name) {
                gitCommand += ` -b ${params.branch_name}`;
            }
            else if (params.commit_hash) {
                gitCommand += ` ${params.commit_hash}`;
            }
            const result = await (0, terminal_controller_js_1.runGitCommand)(gitCommand, params.projectPath, 'Adicionando worktree');
            if (result.exitCode !== 0) {
                throw new Error(`Falha ao adicionar worktree: ${result.output}`);
            }
            return {
                success: true,
                action: 'add',
                message: `Worktree adicionado com sucesso em ${params.worktree_path}`,
                data: {
                    worktree_path: params.worktree_path,
                    branch_name: params.branch_name,
                    commit_hash: params.commit_hash,
                    output: result.output
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao adicionar worktree: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async remove(params) {
        try {
            if (!params.worktree_to_remove) {
                throw new Error('worktree_to_remove é obrigatório para remove');
            }
            let gitCommand = `worktree remove ${params.worktree_to_remove}`;
            if (params.force) {
                gitCommand += ' --force';
            }
            const result = await (0, terminal_controller_js_1.runGitCommand)(gitCommand, params.projectPath, 'Removendo worktree');
            if (result.exitCode !== 0) {
                throw new Error(`Falha ao remover worktree: ${result.output}`);
            }
            return {
                success: true,
                action: 'remove',
                message: `Worktree removido com sucesso: ${params.worktree_to_remove}`,
                data: {
                    worktree_to_remove: params.worktree_to_remove,
                    force: params.force,
                    output: result.output
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao remover worktree: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async list(params) {
        try {
            const result = await (0, terminal_controller_js_1.runGitCommand)(`worktree list`, params.projectPath, 'Listando worktrees');
            if (result.exitCode !== 0) {
                throw new Error(`Falha ao listar worktrees: ${result.output}`);
            }
            const worktrees = result.output.split('\n')
                .filter((line) => line.trim())
                .map((line) => {
                const parts = line.trim().split(' ');
                return {
                    path: parts[0],
                    commit: parts[1],
                    branch: parts[2] || 'detached'
                };
            });
            return {
                success: true,
                action: 'list',
                message: 'Worktrees listados com sucesso',
                data: {
                    worktrees,
                    output: result.output
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao listar worktrees: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async prune(params) {
        try {
            const result = await (0, terminal_controller_js_1.runGitCommand)(`worktree prune`, params.projectPath, 'Prunando worktrees');
            if (result.exitCode !== 0) {
                throw new Error(`Falha ao prunar worktrees: ${result.output}`);
            }
            return {
                success: true,
                action: 'prune',
                message: 'Worktrees prunados com sucesso',
                data: {
                    pruned: true,
                    output: result.output
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao prunar worktrees: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async move(params) {
        try {
            if (!params.old_path || !params.new_path) {
                throw new Error('old_path e new_path são obrigatórios para move');
            }
            const result = await (0, terminal_controller_js_1.runGitCommand)(`worktree move ${params.old_path} ${params.new_path}`, params.projectPath, 'Movendo worktree');
            if (result.exitCode !== 0) {
                throw new Error(`Falha ao mover worktree: ${result.output}`);
            }
            return {
                success: true,
                action: 'move',
                message: `Worktree movido de ${params.old_path} para ${params.new_path}`,
                data: {
                    old_path: params.old_path,
                    new_path: params.new_path,
                    output: result.output
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao mover worktree: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async repair(params) {
        try {
            if (!params.worktree_to_repair) {
                throw new Error('worktree_to_repair é obrigatório para repair');
            }
            const result = await (0, terminal_controller_js_1.runGitCommand)(`worktree repair ${params.worktree_to_repair}`, params.projectPath, 'Reparando worktree');
            if (result.exitCode !== 0) {
                throw new Error(`Falha ao reparar worktree: ${result.output}`);
            }
            return {
                success: true,
                action: 'repair',
                message: `Worktree reparado com sucesso: ${params.worktree_to_repair}`,
                data: {
                    worktree_to_repair: params.worktree_to_repair,
                    output: result.output
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao reparar worktree: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
};
//# sourceMappingURL=git-worktree.js.map