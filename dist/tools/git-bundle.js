"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gitBundleTool = void 0;
const zod_1 = require("zod");
const terminal_controller_js_1 = require("../utils/terminal-controller.js");
/**
 * Tool: git-bundle
 *
 * DESCRIÇÃO:
 * Gerenciamento de bundles Git (GitHub + Gitea) com múltiplas ações
 *
 * FUNCIONALIDADES:
 * - Criar bundle
 * - Verificar bundle
 * - Listar heads do bundle
 * - Unbundle
 * - Criar bundle incremental
 * - Criar bundle com tags
 *
 * USO:
 * - Para transferir repositórios offline
 * - Para backup completo de repositórios
 * - Para sincronização sem rede
 * - Para distribuição de código
 *
 * RECOMENDAÇÕES:
 * - Use para transferências offline
 * - Inclua tags quando necessário
 * - Verifique bundles antes de usar
 */
const GitBundleInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['create', 'verify', 'list-heads', 'unbundle']),
    owner: zod_1.z.string(),
    repo: zod_1.z.string(),
    provider: zod_1.z.enum(['gitea', 'github']).describe('Provider to use (gitea or github)'),
    projectPath: zod_1.z.string().describe('Local project path for git operations'),
    // Para create
    bundle_file: zod_1.z.string().optional(),
    commit_range: zod_1.z.string().optional(),
    branch_name: zod_1.z.string().optional(),
    // Para verify
    verify_bundle: zod_1.z.string().optional(),
    // Para list-heads
    list_bundle: zod_1.z.string().optional(),
    // Para unbundle
    unbundle_file: zod_1.z.string().optional(),
    unbundle_path: zod_1.z.string().optional(),
    // Opções
    all_branches: zod_1.z.boolean().optional(),
    all_tags: zod_1.z.boolean().optional(),
    all_remotes: zod_1.z.boolean().optional(),
});
const GitBundleResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    action: zod_1.z.string(),
    message: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional()
});
exports.gitBundleTool = {
    name: 'git-bundle',
    description: 'Manage Git bundles (GitHub + Gitea) with multiple actions: create, verify, list-heads, unbundle. Suporte completo a GitHub e Gitea simultaneamente. Boas práticas (solo): use para transferir repositórios offline, backup completo de repositórios, sincronização sem rede; use para transferências offline, inclua tags quando necessário.',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['create', 'verify', 'list-heads', 'unbundle'],
                description: 'Action to perform on bundles'
            },
            owner: { type: 'string', description: 'Repository owner' },
            repo: { type: 'string', description: 'Repository name' },
            provider: { type: 'string', enum: ['gitea', 'github'], description: 'Provider to use (gitea or github)' },
            projectPath: { type: 'string', description: 'Local project path for git operations' },
            bundle_file: { type: 'string', description: 'Bundle file path' },
            commit_range: { type: 'string', description: 'Commit range for bundle' },
            branch_name: { type: 'string', description: 'Branch name for bundle' },
            verify_bundle: { type: 'string', description: 'Bundle file to verify' },
            list_bundle: { type: 'string', description: 'Bundle file to list heads' },
            unbundle_file: { type: 'string', description: 'Bundle file to unbundle' },
            unbundle_path: { type: 'string', description: 'Path to unbundle to' },
            all_branches: { type: 'boolean', description: 'Include all branches' },
            all_tags: { type: 'boolean', description: 'Include all tags' },
            all_remotes: { type: 'boolean', description: 'Include all remotes' }
        },
        required: ['action', 'owner', 'repo', 'provider', 'projectPath']
    },
    async handler(input) {
        try {
            const validatedInput = GitBundleInputSchema.parse(input);
            switch (validatedInput.action) {
                case 'create':
                    return await this.create(validatedInput);
                case 'verify':
                    return await this.verify(validatedInput);
                case 'list-heads':
                    return await this.listHeads(validatedInput);
                case 'unbundle':
                    return await this.unbundle(validatedInput);
                default:
                    throw new Error(`Ação não suportada: ${validatedInput.action}`);
            }
        }
        catch (error) {
            return {
                success: false,
                action: input.action,
                message: 'Erro na operação de bundle',
                error: error instanceof Error ? error.message : String(error)
            };
        }
    },
    async create(params) {
        try {
            if (!params.bundle_file) {
                throw new Error('bundle_file é obrigatório para create');
            }
            let gitCommand = `bundle create ${params.bundle_file}`;
            if (params.all_branches) {
                gitCommand += ' --all';
            }
            else if (params.all_tags) {
                gitCommand += ' --all-tags';
            }
            else if (params.all_remotes) {
                gitCommand += ' --all-remotes';
            }
            else if (params.commit_range) {
                gitCommand += ` ${params.commit_range}`;
            }
            else if (params.branch_name) {
                gitCommand += ` ${params.branch_name}`;
            }
            else {
                gitCommand += ' HEAD';
            }
            const result = await (0, terminal_controller_js_1.runGitCommand)(gitCommand, params.projectPath, 'Criando bundle');
            if (result.exitCode !== 0) {
                throw new Error(`Falha ao criar bundle: ${result.output}`);
            }
            return {
                success: true,
                action: 'create',
                message: `Bundle criado com sucesso: ${params.bundle_file}`,
                data: {
                    bundle_file: params.bundle_file,
                    commit_range: params.commit_range,
                    branch_name: params.branch_name,
                    all_branches: params.all_branches,
                    all_tags: params.all_tags,
                    all_remotes: params.all_remotes,
                    output: result.output
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao criar bundle: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async verify(params) {
        try {
            if (!params.verify_bundle) {
                throw new Error('verify_bundle é obrigatório para verify');
            }
            const result = await (0, terminal_controller_js_1.runGitCommand)(`bundle verify ${params.verify_bundle}`, params.projectPath, 'Verificando bundle');
            const isValid = result.exitCode === 0;
            return {
                success: true,
                action: 'verify',
                message: `Bundle ${isValid ? 'válido' : 'inválido'}: ${params.verify_bundle}`,
                data: {
                    bundle: params.verify_bundle,
                    valid: isValid,
                    output: result.output
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao verificar bundle: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async listHeads(params) {
        try {
            if (!params.list_bundle) {
                throw new Error('list_bundle é obrigatório para list-heads');
            }
            const result = await (0, terminal_controller_js_1.runGitCommand)(`bundle list-heads ${params.list_bundle}`, params.projectPath, 'Listando heads do bundle');
            if (result.exitCode !== 0) {
                throw new Error(`Falha ao listar heads do bundle: ${result.output}`);
            }
            const heads = result.output.split('\n')
                .filter((line) => line.trim())
                .map((line) => {
                const parts = line.trim().split(' ');
                return {
                    commit: parts[0],
                    ref: parts[1] || 'HEAD'
                };
            });
            return {
                success: true,
                action: 'list-heads',
                message: `Heads do bundle listados com sucesso: ${params.list_bundle}`,
                data: {
                    bundle: params.list_bundle,
                    heads,
                    output: result.output
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao listar heads do bundle: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async unbundle(params) {
        try {
            if (!params.unbundle_file) {
                throw new Error('unbundle_file é obrigatório para unbundle');
            }
            const unbundlePath = params.unbundle_path || params.projectPath;
            const gitCommand = `bundle unbundle ${params.unbundle_file}`;
            const result = await (0, terminal_controller_js_1.runGitCommand)(gitCommand, unbundlePath, 'Unbundling bundle');
            if (result.exitCode !== 0) {
                throw new Error(`Falha ao unbundle: ${result.output}`);
            }
            return {
                success: true,
                action: 'unbundle',
                message: `Bundle unbundled com sucesso: ${params.unbundle_file}`,
                data: {
                    bundle_file: params.unbundle_file,
                    unbundle_path: unbundlePath,
                    output: result.output
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao unbundle: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
};
//# sourceMappingURL=git-bundle.js.map