"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gitArchiveTool = void 0;
const zod_1 = require("zod");
const terminal_controller_js_1 = require("../utils/terminal-controller.js");
/**
 * Tool: git-archive
 *
 * DESCRIÇÃO:
 * Gerenciamento de arquivos Git (GitHub + Gitea) com múltiplas ações
 *
 * FUNCIONALIDADES:
 * - Criar arquivo
 * - Extrair arquivo
 * - Listar conteúdo do arquivo
 * - Verificar arquivo
 * - Criar tarball
 * - Criar zip
 *
 * USO:
 * - Para criar releases
 * - Para backup de código
 * - Para distribuição de código
 * - Para deploy de versões específicas
 *
 * RECOMENDAÇÕES:
 * - Use para releases oficiais
 * - Inclua apenas arquivos necessários
 * - Teste arquivos antes da distribuição
 */
const GitArchiveInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['create', 'extract', 'list', 'verify']),
    // owner: obtido automaticamente do provider,
    repo: zod_1.z.string(),
    provider: zod_1.z.enum(['gitea', 'github']).describe('Provider to use (gitea or github)'),
    projectPath: zod_1.z.string().describe('Local project path for git operations'),
    // Para create
    archive_path: zod_1.z.string().optional(),
    commit_or_tree: zod_1.z.string().optional(),
    format: zod_1.z.enum(['tar', 'zip', 'tar.gz', 'tar.bz2']).optional(),
    // Para extract
    archive_file: zod_1.z.string().optional(),
    extract_path: zod_1.z.string().optional(),
    // Para list
    list_archive: zod_1.z.string().optional(),
    // Para verify
    verify_archive: zod_1.z.string().optional(),
    // Opções
    prefix: zod_1.z.string().optional(),
    output: zod_1.z.string().optional(),
});
const GitArchiveResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    action: zod_1.z.string(),
    message: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional()
});
exports.gitArchiveTool = {
    name: 'git-archive',
    description: 'tool: Gerencia arquivos Git para distribuição e backup\n──────────────\naction create: cria arquivo compactado\naction create requires: repo, provider, projectPath, archive_path, commit_or_tree, format, prefix, output\n───────────────\naction extract: extrai arquivo compactado\naction extract requires: repo, provider, projectPath, archive_file, extract_path\n───────────────\naction list: lista conteúdo do arquivo\naction list requires: repo, provider, projectPath, list_archive\n───────────────\naction verify: verifica integridade do arquivo\naction verify requires: repo, provider, projectPath, verify_archive',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['create', 'extract', 'list', 'verify'],
                description: 'Action to perform on archives'
            },
            owner: { type: 'string', description: 'Repository owner' },
            repo: { type: 'string', description: 'Repository name' },
            provider: { type: 'string', enum: ['gitea', 'github'], description: 'Provider to use (gitea or github)' },
            projectPath: { type: 'string', description: 'Local project path for git operations' },
            archive_path: { type: 'string', description: 'Archive output path' },
            commit_or_tree: { type: 'string', description: 'Commit or tree to archive' },
            format: { type: 'string', enum: ['tar', 'zip', 'tar.gz', 'tar.bz2'], description: 'Archive format' },
            archive_file: { type: 'string', description: 'Archive file to extract' },
            extract_path: { type: 'string', description: 'Path to extract to' },
            list_archive: { type: 'string', description: 'Archive to list' },
            verify_archive: { type: 'string', description: 'Archive to verify' },
            prefix: { type: 'string', description: 'Prefix for archive entries' },
            output: { type: 'string', description: 'Output file path' }
        },
        required: ['action', 'repo', 'provider', 'projectPath']
    },
    async handler(input) {
        try {
            const validatedInput = GitArchiveInputSchema.parse(input);
            switch (validatedInput.action) {
                case 'create':
                    return await this.create(validatedInput);
                case 'extract':
                    return await this.extract(validatedInput);
                case 'list':
                    return await this.list(validatedInput);
                case 'verify':
                    return await this.verify(validatedInput);
                default:
                    throw new Error(`Ação não suportada: ${validatedInput.action}`);
            }
        }
        catch (error) {
            return {
                success: false,
                action: input.action,
                message: 'Erro na operação de archive',
                error: error instanceof Error ? error.message : String(error)
            };
        }
    },
    async create(params) {
        try {
            if (!params.archive_path || !params.commit_or_tree) {
                throw new Error('archive_path e commit_or_tree são obrigatórios para create');
            }
            const format = params.format || 'tar.gz';
            let gitCommand = `archive --format=${format}`;
            if (params.prefix) {
                gitCommand += ` --prefix=${params.prefix}/`;
            }
            if (params.output) {
                gitCommand += ` --output=${params.output}`;
            }
            gitCommand += ` ${params.commit_or_tree}`;
            const result = await (0, terminal_controller_js_1.runGitCommand)(gitCommand, params.projectPath, 'Criando arquivo');
            if (result.exitCode !== 0) {
                throw new Error(`Falha ao criar arquivo: ${result.output}`);
            }
            return {
                success: true,
                action: 'create',
                message: `Arquivo criado com sucesso: ${params.archive_path}`,
                data: {
                    archive_path: params.archive_path,
                    commit_or_tree: params.commit_or_tree,
                    format,
                    prefix: params.prefix,
                    output: params.output,
                    output_result: result.output
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao criar arquivo: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async extract(params) {
        try {
            if (!params.archive_file || !params.extract_path) {
                throw new Error('archive_file e extract_path são obrigatórios para extract');
            }
            const result = await (0, terminal_controller_js_1.runTerminalCmd)({
                command: `tar -xf ${params.archive_file} -C ${params.extract_path}`,
                is_background: false,
                explanation: 'Extraindo arquivo',
                projectPath: params.projectPath
            });
            if (result.exitCode !== 0) {
                throw new Error(`Falha ao extrair arquivo: ${result.output}`);
            }
            return {
                success: true,
                action: 'extract',
                message: `Arquivo extraído com sucesso para ${params.extract_path}`,
                data: {
                    archive_file: params.archive_file,
                    extract_path: params.extract_path,
                    output: result.output
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao extrair arquivo: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async list(params) {
        try {
            if (!params.list_archive) {
                throw new Error('list_archive é obrigatório para list');
            }
            const result = await (0, terminal_controller_js_1.runTerminalCmd)({
                command: `tar -tf ${params.list_archive}`,
                is_background: false,
                explanation: 'Listando conteúdo do arquivo',
                projectPath: params.projectPath
            });
            if (result.exitCode !== 0) {
                throw new Error(`Falha ao listar arquivo: ${result.output}`);
            }
            const files = result.output.split('\n').filter((line) => line.trim());
            return {
                success: true,
                action: 'list',
                message: `Conteúdo do arquivo listado com sucesso: ${params.list_archive}`,
                data: {
                    archive: params.list_archive,
                    files,
                    output: result.output
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao listar arquivo: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async verify(params) {
        try {
            if (!params.verify_archive) {
                throw new Error('verify_archive é obrigatório para verify');
            }
            const result = await (0, terminal_controller_js_1.runTerminalCmd)({
                command: `tar -tf ${params.verify_archive} > /dev/null`,
                is_background: false,
                explanation: 'Verificando arquivo',
                projectPath: params.projectPath
            });
            const isValid = result.exitCode === 0;
            return {
                success: true,
                action: 'verify',
                message: `Arquivo ${isValid ? 'válido' : 'inválido'}: ${params.verify_archive}`,
                data: {
                    archive: params.verify_archive,
                    valid: isValid,
                    output: result.output
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao verificar arquivo: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    /**
     * Verifica se erro é relacionado a Git
     */
    isGitRelatedError(errorMessage) {
        const gitKeywords = [
            'git', 'commit', 'push', 'pull', 'merge', 'conflict', 'branch',
            'remote', 'repository', 'authentication', 'permission', 'unauthorized',
            'divergent', 'non-fast-forward', 'fetch first', 'working tree',
            'uncommitted', 'stash', 'rebase', 'reset', 'checkout'
        ];
        const errorLower = errorMessage.toLowerCase();
        return gitKeywords.some(keyword => errorLower.includes(keyword));
    }
};
//# sourceMappingURL=git-archive.js.map