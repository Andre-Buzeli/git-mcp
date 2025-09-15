"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gitRemoteTool = void 0;
const zod_1 = require("zod");
const terminal_controller_js_1 = require("../utils/terminal-controller.js");
/**
 * Tool: git-remote
 *
 * DESCRIÇÃO:
 * Gerenciamento de remotes Git (GitHub + Gitea) com múltiplas ações
 *
 * FUNCIONALIDADES:
 * - Adicionar remote
 * - Remover remote
 * - Renomear remote
 * - Mostrar remotes
 * - Definir URL do remote
 * - Prune remotes
 *
 * USO:
 * - Para configurar repositórios remotos
 * - Para gerenciar múltiplos remotes
 * - Para sincronizar com diferentes servidores
 * - Para configurar upstream
 *
 * RECOMENDAÇÕES:
 * - Use 'origin' como remote principal
 * - Configure upstream para branches
 * - Mantenha URLs atualizadas
 */
const GitRemoteInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['add', 'remove', 'rename', 'show', 'set-url', 'prune']),
    owner: zod_1.z.string(),
    repo: zod_1.z.string(),
    provider: zod_1.z.enum(['gitea', 'github']).describe('Provider to use (gitea or github)'),
    projectPath: zod_1.z.string().describe('Local project path for git operations'),
    // Para add/set-url
    remote_name: zod_1.z.string().optional(),
    remote_url: zod_1.z.string().optional(),
    // Para remove/rename/show
    remote: zod_1.z.string().optional(),
    // Para rename
    new_name: zod_1.z.string().optional(),
    // Para prune
    remote_to_prune: zod_1.z.string().optional(),
});
const GitRemoteResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    action: zod_1.z.string(),
    message: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional()
});
exports.gitRemoteTool = {
    name: 'git-remote',
    description: 'Manage Git remotes (GitHub + Gitea) with multiple actions: add, remove, rename, show, set-url, prune. Suporte completo a GitHub e Gitea simultaneamente. Boas práticas (solo): use para configurar repositórios remotos, gerenciar múltiplos remotes, sincronizar com diferentes servidores; use origin como remote principal, configure upstream para branches.',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['add', 'remove', 'rename', 'show', 'set-url', 'prune'],
                description: 'Action to perform on remotes'
            },
            owner: { type: 'string', description: 'Repository owner' },
            repo: { type: 'string', description: 'Repository name' },
            provider: { type: 'string', enum: ['gitea', 'github'], description: 'Provider to use (gitea or github)' },
            projectPath: { type: 'string', description: 'Local project path for git operations' },
            remote_name: { type: 'string', description: 'Remote name' },
            remote_url: { type: 'string', description: 'Remote URL' },
            remote: { type: 'string', description: 'Remote to operate on' },
            new_name: { type: 'string', description: 'New remote name' },
            remote_to_prune: { type: 'string', description: 'Remote to prune' }
        },
        required: ['action', 'owner', 'repo', 'provider', 'projectPath']
    },
    async handler(input) {
        try {
            const validatedInput = GitRemoteInputSchema.parse(input);
            switch (validatedInput.action) {
                case 'add':
                    return await this.add(validatedInput);
                case 'remove':
                    return await this.remove(validatedInput);
                case 'rename':
                    return await this.rename(validatedInput);
                case 'show':
                    return await this.show(validatedInput);
                case 'set-url':
                    return await this.setUrl(validatedInput);
                case 'prune':
                    return await this.prune(validatedInput);
                default:
                    throw new Error(`Ação não suportada: ${validatedInput.action}`);
            }
        }
        catch (error) {
            return {
                success: false,
                action: input.action,
                message: 'Erro na operação de remote',
                error: error instanceof Error ? error.message : String(error)
            };
        }
    },
    async add(params) {
        try {
            if (!params.remote_name || !params.remote_url) {
                throw new Error('remote_name e remote_url são obrigatórios para add');
            }
            const gitCommand = `remote add ${params.remote_name} ${params.remote_url}`;
            const result = await (0, terminal_controller_js_1.runGitCommand)(gitCommand, params.projectPath, 'Adicionando remote');
            if (result.exitCode !== 0) {
                throw new Error(`Falha ao adicionar remote: ${result.output}`);
            }
            return {
                success: true,
                action: 'add',
                message: `Remote ${params.remote_name} adicionado com sucesso`,
                data: {
                    remote_name: params.remote_name,
                    remote_url: params.remote_url,
                    output: result.output
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao adicionar remote: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async remove(params) {
        try {
            if (!params.remote) {
                throw new Error('remote é obrigatório para remove');
            }
            const gitCommand = `remote remove ${params.remote}`;
            const result = await (0, terminal_controller_js_1.runGitCommand)(gitCommand, params.projectPath, 'Removendo remote');
            if (result.exitCode !== 0) {
                throw new Error(`Falha ao remover remote: ${result.output}`);
            }
            return {
                success: true,
                action: 'remove',
                message: `Remote ${params.remote} removido com sucesso`,
                data: {
                    remote: params.remote,
                    output: result.output
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao remover remote: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async rename(params) {
        try {
            if (!params.remote || !params.new_name) {
                throw new Error('remote e new_name são obrigatórios para rename');
            }
            const gitCommand = `remote rename ${params.remote} ${params.new_name}`;
            const result = await (0, terminal_controller_js_1.runGitCommand)(gitCommand, params.projectPath, 'Renomeando remote');
            if (result.exitCode !== 0) {
                throw new Error(`Falha ao renomear remote: ${result.output}`);
            }
            return {
                success: true,
                action: 'rename',
                message: `Remote ${params.remote} renomeado para ${params.new_name} com sucesso`,
                data: {
                    old_name: params.remote,
                    new_name: params.new_name,
                    output: result.output
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao renomear remote: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async show(params) {
        try {
            if (!params.remote) {
                // Listar todos os remotes
                const gitCommand = `remote -v`;
                const result = await (0, terminal_controller_js_1.runGitCommand)(gitCommand, params.projectPath, 'Listando remotes');
                if (result.exitCode !== 0) {
                    throw new Error(`Falha ao listar remotes: ${result.output}`);
                }
                const remotes = result.output.split('\n')
                    .filter(line => line.trim())
                    .map(line => {
                    const [name, url] = line.split('\t');
                    return { name, url };
                });
                return {
                    success: true,
                    action: 'show',
                    message: 'Remotes listados com sucesso',
                    data: {
                        remotes,
                        output: result.output
                    }
                };
            }
            else {
                // Mostrar remote específico
                const gitCommand = `remote show ${params.remote}`;
                const result = await (0, terminal_controller_js_1.runGitCommand)(gitCommand, params.projectPath, 'Mostrando remote');
                if (result.exitCode !== 0) {
                    throw new Error(`Falha ao mostrar remote: ${result.output}`);
                }
                return {
                    success: true,
                    action: 'show',
                    message: `Remote ${params.remote} mostrado com sucesso`,
                    data: {
                        remote: params.remote,
                        output: result.output
                    }
                };
            }
        }
        catch (error) {
            throw new Error(`Falha ao mostrar remote: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async setUrl(params) {
        try {
            if (!params.remote || !params.remote_url) {
                throw new Error('remote e remote_url são obrigatórios para set-url');
            }
            const gitCommand = `remote set-url ${params.remote} ${params.remote_url}`;
            const result = await (0, terminal_controller_js_1.runGitCommand)(gitCommand, params.projectPath, 'Definindo URL do remote');
            if (result.exitCode !== 0) {
                throw new Error(`Falha ao definir URL do remote: ${result.output}`);
            }
            return {
                success: true,
                action: 'set-url',
                message: `URL do remote ${params.remote} definida com sucesso`,
                data: {
                    remote: params.remote,
                    remote_url: params.remote_url,
                    output: result.output
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao definir URL do remote: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async prune(params) {
        try {
            const remote = params.remote_to_prune || '--all';
            const gitCommand = `remote prune ${remote}`;
            const result = await (0, terminal_controller_js_1.runGitCommand)(gitCommand, params.projectPath, 'Prunando remotes');
            if (result.exitCode !== 0) {
                throw new Error(`Falha ao prunar remotes: ${result.output}`);
            }
            return {
                success: true,
                action: 'prune',
                message: `Remotes prunados com sucesso`,
                data: {
                    remote,
                    output: result.output
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao prunar remotes: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
};
//# sourceMappingURL=git-remote.js.map