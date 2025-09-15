"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gitSubmoduleTool = void 0;
const zod_1 = require("zod");
const terminal_controller_js_1 = require("../utils/terminal-controller.js");
/**
 * Tool: git-submodule
 *
 * DESCRIÇÃO:
 * Gerenciamento de submódulos Git (GitHub + Gitea) com múltiplas ações
 *
 * FUNCIONALIDADES:
 * - Adicionar submódulo
 * - Atualizar submódulos
 * - Inicializar submódulos
 * - Deinicializar submódulos
 * - Status de submódulos
 * - Sincronizar submódulos
 *
 * USO:
 * - Para incluir repositórios externos
 * - Para gerenciar dependências
 * - Para manter versões específicas
 * - Para organizar projetos grandes
 *
 * RECOMENDAÇÕES:
 * - Use para dependências estáveis
 * - Mantenha versões específicas
 * - Documente submódulos no README
 */
const GitSubmoduleInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['add', 'update', 'init', 'deinit', 'status', 'sync']),
    owner: zod_1.z.string(),
    repo: zod_1.z.string(),
    provider: zod_1.z.enum(['gitea', 'github']).describe('Provider to use (gitea or github)'),
    projectPath: zod_1.z.string().describe('Local project path for git operations'),
    // Para add
    submodule_url: zod_1.z.string().optional(),
    submodule_path: zod_1.z.string().optional(),
    submodule_branch: zod_1.z.string().optional(),
    // Para update/init/deinit
    submodule_name: zod_1.z.string().optional(),
    // Para update
    recursive: zod_1.z.boolean().optional(),
    remote: zod_1.z.boolean().optional(),
    // Para sync
    recursive_sync: zod_1.z.boolean().optional(),
});
const GitSubmoduleResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    action: zod_1.z.string(),
    message: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional()
});
exports.gitSubmoduleTool = {
    name: 'git-submodule',
    description: 'Manage Git submodules (GitHub + Gitea) with multiple actions: add, update, init, deinit, status, sync. Suporte completo a GitHub e Gitea simultaneamente. Boas práticas (solo): use para incluir repositórios externos, gerenciar dependências, manter versões específicas; use para dependências estáveis, mantenha versões específicas.',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['add', 'update', 'init', 'deinit', 'status', 'sync'],
                description: 'Action to perform on submodules'
            },
            owner: { type: 'string', description: 'Repository owner' },
            repo: { type: 'string', description: 'Repository name' },
            provider: { type: 'string', enum: ['gitea', 'github'], description: 'Provider to use (gitea or github)' },
            projectPath: { type: 'string', description: 'Local project path for git operations' },
            submodule_url: { type: 'string', description: 'Submodule URL' },
            submodule_path: { type: 'string', description: 'Submodule path' },
            submodule_branch: { type: 'string', description: 'Submodule branch' },
            submodule_name: { type: 'string', description: 'Submodule name' },
            recursive: { type: 'boolean', description: 'Recursive operation' },
            remote: { type: 'boolean', description: 'Update from remote' },
            recursive_sync: { type: 'boolean', description: 'Recursive sync' }
        },
        required: ['action', 'owner', 'repo', 'provider', 'projectPath']
    },
    async handler(input) {
        try {
            const validatedInput = GitSubmoduleInputSchema.parse(input);
            switch (validatedInput.action) {
                case 'add':
                    return await this.add(validatedInput);
                case 'update':
                    return await this.update(validatedInput);
                case 'init':
                    return await this.init(validatedInput);
                case 'deinit':
                    return await this.deinit(validatedInput);
                case 'status':
                    return await this.status(validatedInput);
                case 'sync':
                    return await this.sync(validatedInput);
                default:
                    throw new Error(`Ação não suportada: ${validatedInput.action}`);
            }
        }
        catch (error) {
            return {
                success: false,
                action: input.action,
                message: 'Erro na operação de submódulo',
                error: error instanceof Error ? error.message : String(error)
            };
        }
    },
    async add(params) {
        try {
            if (!params.submodule_url || !params.submodule_path) {
                throw new Error('submodule_url e submodule_path são obrigatórios para add');
            }
            let gitCommand = `submodule add ${params.submodule_url} ${params.submodule_path}`;
            if (params.submodule_branch) {
                gitCommand += ` -b ${params.submodule_branch}`;
            }
            const result = await (0, terminal_controller_js_1.runGitCommand)(gitCommand, params.projectPath, 'Adicionando submódulo');
            if (result.exitCode !== 0) {
                throw new Error(`Falha ao adicionar submódulo: ${result.output}`);
            }
            return {
                success: true,
                action: 'add',
                message: `Submódulo adicionado com sucesso em ${params.submodule_path}`,
                data: {
                    submodule_url: params.submodule_url,
                    submodule_path: params.submodule_path,
                    submodule_branch: params.submodule_branch,
                    output: result.output
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao adicionar submódulo: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async update(params) {
        try {
            let gitCommand = `submodule update`;
            if (params.recursive) {
                gitCommand += ' --recursive';
            }
            if (params.remote) {
                gitCommand += ' --remote';
            }
            if (params.submodule_name) {
                gitCommand += ` ${params.submodule_name}`;
            }
            const result = await (0, terminal_controller_js_1.runGitCommand)(gitCommand, params.projectPath, 'Atualizando submódulos');
            if (result.exitCode !== 0) {
                throw new Error(`Falha ao atualizar submódulos: ${result.output}`);
            }
            return {
                success: true,
                action: 'update',
                message: 'Submódulos atualizados com sucesso',
                data: {
                    submodule_name: params.submodule_name,
                    recursive: params.recursive,
                    remote: params.remote,
                    output: result.output
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao atualizar submódulos: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async init(params) {
        try {
            let gitCommand = `submodule init`;
            if (params.submodule_name) {
                gitCommand += ` ${params.submodule_name}`;
            }
            const result = await (0, terminal_controller_js_1.runGitCommand)(gitCommand, params.projectPath, 'Inicializando submódulos');
            if (result.exitCode !== 0) {
                throw new Error(`Falha ao inicializar submódulos: ${result.output}`);
            }
            return {
                success: true,
                action: 'init',
                message: 'Submódulos inicializados com sucesso',
                data: {
                    submodule_name: params.submodule_name,
                    output: result.output
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao inicializar submódulos: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async deinit(params) {
        try {
            let gitCommand = `submodule deinit`;
            if (params.recursive) {
                gitCommand += ' --recursive';
            }
            if (params.submodule_name) {
                gitCommand += ` ${params.submodule_name}`;
            }
            const result = await (0, terminal_controller_js_1.runGitCommand)(gitCommand, params.projectPath, 'Deinicializando submódulos');
            if (result.exitCode !== 0) {
                throw new Error(`Falha ao deinicializar submódulos: ${result.output}`);
            }
            return {
                success: true,
                action: 'deinit',
                message: 'Submódulos deinicializados com sucesso',
                data: {
                    submodule_name: params.submodule_name,
                    recursive: params.recursive,
                    output: result.output
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao deinicializar submódulos: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async status(params) {
        try {
            let gitCommand = `submodule status`;
            if (params.recursive) {
                gitCommand += ' --recursive';
            }
            if (params.submodule_name) {
                gitCommand += ` ${params.submodule_name}`;
            }
            const result = await (0, terminal_controller_js_1.runGitCommand)(gitCommand, params.projectPath, 'Verificando status dos submódulos');
            if (result.exitCode !== 0) {
                throw new Error(`Falha ao verificar status dos submódulos: ${result.output}`);
            }
            const submodules = result.output.split('\n')
                .filter((line) => line.trim())
                .map((line) => {
                const parts = line.trim().split(' ');
                return {
                    status: parts[0],
                    commit: parts[1],
                    path: parts[2]
                };
            });
            return {
                success: true,
                action: 'status',
                message: 'Status dos submódulos obtido com sucesso',
                data: {
                    submodules,
                    recursive: params.recursive,
                    output: result.output
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao verificar status dos submódulos: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async sync(params) {
        try {
            let gitCommand = `submodule sync`;
            if (params.recursive_sync) {
                gitCommand += ' --recursive';
            }
            if (params.submodule_name) {
                gitCommand += ` ${params.submodule_name}`;
            }
            const result = await (0, terminal_controller_js_1.runGitCommand)(gitCommand, params.projectPath, 'Sincronizando submódulos');
            if (result.exitCode !== 0) {
                throw new Error(`Falha ao sincronizar submódulos: ${result.output}`);
            }
            return {
                success: true,
                action: 'sync',
                message: 'Submódulos sincronizados com sucesso',
                data: {
                    submodule_name: params.submodule_name,
                    recursive_sync: params.recursive_sync,
                    output: result.output
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao sincronizar submódulos: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
};
//# sourceMappingURL=git-submodule.js.map