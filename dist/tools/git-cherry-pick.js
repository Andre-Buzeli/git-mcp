"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gitCherryPickTool = void 0;
const zod_1 = require("zod");
const terminal_controller_js_1 = require("../utils/terminal-controller.js");
/**
 * Tool: git-cherry-pick
 *
 * DESCRIÇÃO:
 * Gerenciamento de cherry-pick Git (GitHub + Gitea) com múltiplas ações
 *
 * FUNCIONALIDADES:
 * - Cherry-pick commit específico
 * - Cherry-pick range de commits
 * - Abortar cherry-pick
 * - Continuar cherry-pick
 * - Cherry-pick sem commit
 * - Cherry-pick com estratégia
 *
 * USO:
 * - Para aplicar commits específicos
 * - Para portar correções entre branches
 * - Para selecionar mudanças específicas
 * - Para manter histórico limpo
 *
 * RECOMENDAÇÕES:
 * - Use para commits pequenos e focados
 * - Teste antes de aplicar em produção
 * - Documente commits cherry-picked
 */
const GitCherryPickInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['cherry-pick', 'cherry-pick-range', 'abort', 'continue']),
    owner: zod_1.z.string(),
    repo: zod_1.z.string(),
    provider: zod_1.z.enum(['gitea', 'github']).describe('Provider to use (gitea or github)'),
    projectPath: zod_1.z.string().describe('Local project path for git operations'),
    // Para cherry-pick
    commit_hash: zod_1.z.string().optional(),
    commit_range: zod_1.z.string().optional(),
    // Para cherry-pick-range
    start_commit: zod_1.z.string().optional(),
    end_commit: zod_1.z.string().optional(),
    // Opções
    no_commit: zod_1.z.boolean().optional(),
    strategy: zod_1.z.enum(['ours', 'theirs']).optional(),
    mainline: zod_1.z.number().optional(),
    signoff: zod_1.z.boolean().optional(),
});
const GitCherryPickResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    action: zod_1.z.string(),
    message: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional()
});
exports.gitCherryPickTool = {
    name: 'git-cherry-pick',
    description: 'Manage Git cherry-pick operations (GitHub + Gitea) with multiple actions: cherry-pick, cherry-pick-range, abort, continue. Suporte completo a GitHub e Gitea simultaneamente. Boas práticas (solo): use para aplicar commits específicos, portar correções entre branches, selecionar mudanças específicas; use para commits pequenos e focados, teste antes de aplicar em produção.',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['cherry-pick', 'cherry-pick-range', 'abort', 'continue'],
                description: 'Action to perform on cherry-pick'
            },
            owner: { type: 'string', description: 'Repository owner' },
            repo: { type: 'string', description: 'Repository name' },
            provider: { type: 'string', enum: ['gitea', 'github'], description: 'Provider to use (gitea or github)' },
            projectPath: { type: 'string', description: 'Local project path for git operations' },
            commit_hash: { type: 'string', description: 'Commit hash to cherry-pick' },
            commit_range: { type: 'string', description: 'Commit range to cherry-pick' },
            start_commit: { type: 'string', description: 'Start commit for range' },
            end_commit: { type: 'string', description: 'End commit for range' },
            no_commit: { type: 'boolean', description: 'Do not commit automatically' },
            strategy: { type: 'string', enum: ['ours', 'theirs'], description: 'Cherry-pick strategy' },
            mainline: { type: 'number', description: 'Mainline for merge commits' },
            signoff: { type: 'boolean', description: 'Add signoff to commit' }
        },
        required: ['action', 'owner', 'repo', 'provider', 'projectPath']
    },
    async handler(input) {
        try {
            const validatedInput = GitCherryPickInputSchema.parse(input);
            switch (validatedInput.action) {
                case 'cherry-pick':
                    return await this.cherryPick(validatedInput);
                case 'cherry-pick-range':
                    return await this.cherryPickRange(validatedInput);
                case 'abort':
                    return await this.abort(validatedInput);
                case 'continue':
                    return await this.continue(validatedInput);
                default:
                    throw new Error(`Ação não suportada: ${validatedInput.action}`);
            }
        }
        catch (error) {
            return {
                success: false,
                action: input.action,
                message: 'Erro na operação de cherry-pick',
                error: error instanceof Error ? error.message : String(error)
            };
        }
    },
    async cherryPick(params) {
        try {
            if (!params.commit_hash) {
                throw new Error('commit_hash é obrigatório para cherry-pick');
            }
            let gitCommand = `cherry-pick ${params.commit_hash}`;
            if (params.no_commit) {
                gitCommand += ' --no-commit';
            }
            if (params.strategy) {
                gitCommand += ` -X ${params.strategy}`;
            }
            if (params.mainline) {
                gitCommand += ` -m ${params.mainline}`;
            }
            if (params.signoff) {
                gitCommand += ' --signoff';
            }
            const result = await (0, terminal_controller_js_1.runGitCommand)(gitCommand, params.projectPath, 'Executando cherry-pick');
            if (result.exitCode !== 0) {
                throw new Error(`Falha no cherry-pick: ${result.output}`);
            }
            return {
                success: true,
                action: 'cherry-pick',
                message: `Commit ${params.commit_hash} cherry-picked com sucesso`,
                data: {
                    commit_hash: params.commit_hash,
                    no_commit: params.no_commit,
                    strategy: params.strategy,
                    mainline: params.mainline,
                    signoff: params.signoff,
                    output: result.output
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao executar cherry-pick: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async cherryPickRange(params) {
        try {
            if (!params.start_commit || !params.end_commit) {
                throw new Error('start_commit e end_commit são obrigatórios para cherry-pick-range');
            }
            let gitCommand = `cherry-pick ${params.start_commit}..${params.end_commit}`;
            if (params.no_commit) {
                gitCommand += ' --no-commit';
            }
            if (params.strategy) {
                gitCommand += ` -X ${params.strategy}`;
            }
            if (params.signoff) {
                gitCommand += ' --signoff';
            }
            const result = await (0, terminal_controller_js_1.runGitCommand)(gitCommand, params.projectPath, 'Executando cherry-pick de range');
            if (result.exitCode !== 0) {
                throw new Error(`Falha no cherry-pick de range: ${result.output}`);
            }
            return {
                success: true,
                action: 'cherry-pick-range',
                message: `Range ${params.start_commit}..${params.end_commit} cherry-picked com sucesso`,
                data: {
                    start_commit: params.start_commit,
                    end_commit: params.end_commit,
                    no_commit: params.no_commit,
                    strategy: params.strategy,
                    signoff: params.signoff,
                    output: result.output
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao executar cherry-pick de range: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async abort(params) {
        try {
            const result = await (0, terminal_controller_js_1.runGitCommand)(`cherry-pick --abort`, params.projectPath, 'Abortando cherry-pick');
            if (result.exitCode !== 0) {
                throw new Error(`Falha ao abortar cherry-pick: ${result.output}`);
            }
            return {
                success: true,
                action: 'abort',
                message: 'Cherry-pick abortado com sucesso',
                data: {
                    aborted: true,
                    output: result.output
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao abortar cherry-pick: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async continue(params) {
        try {
            const result = await (0, terminal_controller_js_1.runGitCommand)(`cherry-pick --continue`, params.projectPath, 'Continuando cherry-pick');
            if (result.exitCode !== 0) {
                throw new Error(`Falha ao continuar cherry-pick: ${result.output}`);
            }
            return {
                success: true,
                action: 'continue',
                message: 'Cherry-pick continuado com sucesso',
                data: {
                    continued: true,
                    output: result.output
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao continuar cherry-pick: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
};
//# sourceMappingURL=git-cherry-pick.js.map