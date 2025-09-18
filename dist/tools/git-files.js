"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filesTool = void 0;
const zod_1 = require("zod");
const index_js_1 = require("../providers/index.js");
const user_detection_js_1 = require("../utils/user-detection.js");
/**
 * Tool: files
 *
 * DESCRIÃ‡ÃƒO:
 * Gerenciamento completo de arquivos e diretÃ³rios Gitea com mÃºltiplas aÃ§Ãµes
 *
 * FUNCIONALIDADES:
 * - CriaÃ§Ã£o de arquivos e diretÃ³rios
 * - Leitura e listagem de conteÃºdo
 * - AtualizaÃ§Ã£o de arquivos existentes
 * - ExclusÃ£o de arquivos e diretÃ³rios
 * - Busca por conteÃºdo e nome
 * - Controle de versÃ£o de arquivos
 *
 * USO:
 * - Para gerenciar arquivos de projeto
 * - Para automatizar criaÃ§Ã£o de arquivos
 * - Para backup e migraÃ§Ã£o de conteÃºdo
 * - Para sincronizaÃ§Ã£o de arquivos
 *
 * RECOMENDAÃ‡Ã•ES:
 * - Use mensagens de commit descritivas
 * - Mantenha estrutura de diretÃ³rios organizada
 * - Valide conteÃºdo antes de enviar
 * - Use branches para mudanÃ§as grandes
 */
/**
 * Schema de validaÃ§Ã£o para entrada da tool files
 *
 * VALIDAÃ‡Ã•ES:
 * - action: AÃ§Ã£o obrigatÃ³ria (get, create, update, delete, list, search)
 * - ParÃ¢metros especÃ­ficos por aÃ§Ã£o
 * - ValidaÃ§Ã£o de tipos e formatos
 *
 * RECOMENDAÃ‡Ã•ES:
 * - Sempre valide entrada antes de usar
 * - Use parÃ¢metros opcionais adequadamente
 * - Documente parÃ¢metros obrigatÃ³rios
 */
const FilesInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['get', 'create', 'update', 'delete', 'list', 'search', 'upload-project']),
    // ParÃ¢metros comuns
    // owner: obtido automaticamente do provider,
    repo: zod_1.z.string(),
    path: zod_1.z.string().optional(),
    projectPath: zod_1.z.string().describe('Local project path for git operations'),
    provider: zod_1.z.enum(['gitea', 'github']).describe('Provider to use (gitea or github)'),
    content: zod_1.z.string().optional(),
    message: zod_1.z.string().optional(),
    branch: zod_1.z.string().optional(),
    // Para update/delete
    sha: zod_1.z.string().optional(),
    // Para list
    ref: zod_1.z.string().optional(),
    // Para search
    query: zod_1.z.string().optional(),
    // Para list com paginaÃ§Ã£o
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
});
/**
 * Schema de saÃ­da padronizado
 *
 * ESTRUTURA:
 * - success: Status da operaÃ§Ã£o
 * - action: AÃ§Ã£o executada
 * - message: Mensagem descritiva
 * - data: Dados retornados (opcional)
 * - error: Detalhes do erro (opcional)
 */
const FilesResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    action: zod_1.z.string(),
    message: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional()
});
/**
 * Tool: files
 *
 * DESCRIÃ‡ÃƒO:
 * Gerenciamento completo de arquivos e diretÃ³rios Gitea com mÃºltiplas aÃ§Ãµes
 *
 * ACTIONS DISPONÃVEIS:
 *
 * 1. get - Obter conteÃºdo de arquivo
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - path (obrigatÃ³rio): Caminho do arquivo
 *    - ref (opcional): Branch, tag ou commit (padrÃ£o: branch padrÃ£o)
 *
 * 2. create - Criar novo arquivo
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - path (obrigatÃ³rio): Caminho do arquivo
 *    - content (obrigatÃ³rio): ConteÃºdo do arquivo
 *    - message (obrigatÃ³rio): Mensagem de commit
 *    - branch (opcional): Branch de destino (padrÃ£o: branch padrÃ£o)
 *
 * 3. update - Atualizar arquivo existente
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - path (obrigatÃ³rio): Caminho do arquivo
 *    - content (obrigatÃ³rio): Novo conteÃºdo
 *    - message (obrigatÃ³rio): Mensagem de commit
 *    - sha (obrigatÃ³rio): SHA do arquivo atual
 *    - branch (opcional): Branch de destino (padrÃ£o: branch padrÃ£o)
 *
 * 4. delete - Deletar arquivo
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - path (obrigatÃ³rio): Caminho do arquivo
 *    - message (obrigatÃ³rio): Mensagem de commit
 *    - sha (obrigatÃ³rio): SHA do arquivo
 *    - branch (opcional): Branch de destino (padrÃ£o: branch padrÃ£o)
 *
 * 5. list - Listar conteÃºdo de diretÃ³rio
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - path (opcional): Caminho do diretÃ³rio (padrÃ£o: raiz)
 *    - ref (opcional): Branch, tag ou commit (padrÃ£o: branch padrÃ£o)
 *    - page (opcional): PÃ¡gina da listagem (padrÃ£o: 1)
 *    - limit (opcional): Itens por pÃ¡gina (padrÃ£o: 30, mÃ¡ximo: 100)
 *
 * 6. search - Buscar arquivos por conteÃºdo
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - query (obrigatÃ³rio): Termo de busca
 *    - ref (opcional): Branch, tag ou commit (padrÃ£o: branch padrÃ£o)
 *
 * RECOMENDAÃ‡Ã•ES DE USO:
 * - Use mensagens de commit descritivas
 * - Mantenha estrutura de diretÃ³rios organizada
 * - Valide conteÃºdo antes de enviar
 * - Use branches para mudanÃ§as grandes
 * - Documente mudanÃ§as importantes
 * - Mantenha histÃ³rico de commits limpo
 */
exports.filesTool = {
    name: 'git-files',
    description: 'tool: Gerencia arquivos Git, upload, download, busca e sincronizaÃ§Ã£o\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction get: obtÃ©m arquivo especÃ­fico\naction get requires: repo, path, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction create: cria novo arquivo\naction create requires: repo, path, content, message, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction update: atualiza arquivo existente\naction update requires: repo, path, content, message, sha, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction delete: remove arquivo\naction delete requires: repo, path, message, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction list: lista arquivos do diretÃ³rio\naction list requires: repo, path, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction search: busca conteÃºdo em arquivos\naction search requires: repo, query, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction upload-project: envia projeto completo\naction upload-project requires: repo, projectPath, message, provider',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['get', 'create', 'update', 'delete', 'list', 'search', 'upload-project'],
                description: 'Action to perform on files'
            },
            repo: { type: 'string', description: 'Repository name' },
            provider: { type: 'string', enum: ['gitea', 'github'], description: 'Provider to use (github, gitea) or use default' },
            path: { type: 'string', description: 'File or directory path' },
            projectPath: { type: 'string', description: 'Local project path for git operations' },
            content: { type: 'string', description: 'File content' },
            message: { type: 'string', description: 'Commit message' },
            branch: { type: 'string', description: 'Target branch' },
            sha: { type: 'string', description: 'File SHA hash' },
            ref: { type: 'string', description: 'Branch, tag or commit reference' },
            query: { type: 'string', description: 'Search query' },
            page: { type: 'number', description: 'Page number', minimum: 1 },
            limit: { type: 'number', description: 'Items per page', minimum: 1, maximum: 100 }
        },
        required: ['action', 'repo', 'provider', 'projectPath']
    },
    /**
     * Handler principal da tool files
     *
     * FUNCIONALIDADE:
     * - Valida entrada usando Zod schema
     * - Roteia para mÃ©todo especÃ­fico baseado na aÃ§Ã£o
     * - Trata erros de forma uniforme
     * - Retorna resultado padronizado
     *
     * FLUXO:
     * 1. ValidaÃ§Ã£o de entrada
     * 2. Roteamento por aÃ§Ã£o
     * 3. ExecuÃ§Ã£o do mÃ©todo especÃ­fico
     * 4. Tratamento de erros
     * 5. Retorno de resultado
     *
     * TRATAMENTO DE ERROS:
     * - ValidaÃ§Ã£o: erro de schema
     * - ExecuÃ§Ã£o: erro da operaÃ§Ã£o
     * - Roteamento: aÃ§Ã£o nÃ£o suportada
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Sempre valide entrada antes de processar
     * - Trate erros especÃ­ficos adequadamente
     * - Log detalhes de erro para debug
     * - Retorne mensagens de erro Ãºteis
     */
    async handler(input) {
        try {
            const validatedInput = FilesInputSchema.parse(input);
            // Aplicar auto-detecÃ§Ã£o apenas para owner dentro do provider especificado
            const processedInput = await (0, user_detection_js_1.applyAutoUserDetection)(validatedInput, validatedInput.provider);
            // Usar o provider especificado pelo usuÃ¡rio
            const provider = index_js_1.globalProviderFactory.getProvider(processedInput.provider);
            if (!provider) {
                throw new Error(`Provider '${processedInput.provider}' nÃ£o encontrado`);
            }
            // Obter o owner do provider
            const owner = (await provider.getCurrentUser()).login;
            switch (processedInput.action) {
                case 'get':
                    return await this.getFile(processedInput, provider, owner);
                case 'create':
                    return await this.createFile(processedInput, provider, owner);
                case 'update':
                    return await this.updateFile(processedInput, provider, owner);
                case 'delete':
                    return await this.deleteFile(processedInput, provider, owner);
                case 'list':
                    return await this.listFiles(processedInput, provider, owner);
                case 'search':
                    return await this.searchFiles(processedInput, provider, owner);
                case 'upload-project':
                    return await this.uploadProject(processedInput, provider, owner);
                default:
                    throw new Error(`AÃ§Ã£o nÃ£o suportada: ${processedInput.action}`);
            }
        }
        catch (error) {
            return {
                success: false,
                action: input.action,
                message: 'Erro na operaÃ§Ã£o de arquivos',
                error: error instanceof Error ? error.message : String(error)
            };
        }
    },
    /**
     * ObtÃ©m o conteÃºdo de um arquivo especÃ­fico
     *
     * FUNCIONALIDADE:
     * - Retorna conteÃºdo completo do arquivo
     * - Inclui metadados (SHA, tamanho, tipo)
     * - Suporta diferentes referÃªncias (branch, tag, commit)
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - path: Caminho do arquivo
     *
     * PARÃ‚METROS OPCIONAIS:
     * - ref: Branch, tag ou commit (padrÃ£o: branch padrÃ£o)
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Arquivo deve existir no caminho especificado
     * - ReferÃªncia deve ser vÃ¡lida
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use para leitura de arquivos de configuraÃ§Ã£o
     * - Verifique tamanho antes de ler arquivos grandes
     * - Use referÃªncias especÃ­ficas para versÃµes
     * - Trate arquivos binÃ¡rios adequadamente
     */
    async getFile(params, provider, owner) {
        try {
            if (!owner || !params.repo || !params.path) {
                throw new Error('repo e path sÃ£o obrigatÃ³rios');
            }
            const file = await provider.getFile(owner, params.repo, params.path, params.ref);
            return {
                success: true,
                action: 'get',
                message: `Arquivo '${params.path}' obtido com sucesso`,
                data: file
            };
        }
        catch (error) {
            throw new Error(`Falha ao obter arquivo: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    /**
     * Cria um novo arquivo no repositÃ³rio
     *
     * FUNCIONALIDADE:
     * - Cria arquivo com conteÃºdo especificado
     * - Faz commit automÃ¡tico com mensagem
     * - Suporta criaÃ§Ã£o em branches especÃ­ficas
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - path: Caminho do arquivo
     * - content: ConteÃºdo do arquivo
     * - message: Mensagem de commit
     *
     * PARÃ‚METROS OPCIONAIS:
     * - branch: Branch de destino (padrÃ£o: branch padrÃ£o)
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Caminho deve ser vÃ¡lido
     * - UsuÃ¡rio deve ter permissÃ£o de escrita
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use mensagens de commit descritivas
     * - Valide conteÃºdo antes de enviar
     * - Use branches para mudanÃ§as grandes
     * - Documente propÃ³sito do arquivo
     */
    async createFile(params, provider, owner) {
        try {
            if (!owner || !params.repo || !params.path || !params.content || !params.message) {
                throw new Error('repo, path, content e message sÃ£o obrigatÃ³rios');
            }
            const result = await provider.createFile(owner, params.repo, params.path, params.content, params.message, params.branch);
            return {
                success: true,
                action: 'create',
                message: `Arquivo '${params.path}' criado com sucesso`,
                data: result
            };
        }
        catch (error) {
            throw new Error(`Falha ao criar arquivo: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    /**
     * Atualiza um arquivo existente no repositÃ³rio
     *
     * FUNCIONALIDADE:
     * - Atualiza conteÃºdo do arquivo
     * - Faz commit com nova versÃ£o
     * - Requer SHA do arquivo atual
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - path: Caminho do arquivo
     * - content: Novo conteÃºdo
     * - message: Mensagem de commit
     * - sha: SHA do arquivo atual
     *
     * PARÃ‚METROS OPCIONAIS:
     * - branch: Branch de destino (padrÃ£o: branch padrÃ£o)
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Arquivo deve existir
     * - SHA deve ser vÃ¡lido
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Sempre obtenha SHA atual antes de atualizar
     * - Use mensagens de commit descritivas
     * - Verifique se arquivo nÃ£o foi modificado por outro usuÃ¡rio
     * - Teste mudanÃ§as antes de commitar
     */
    async updateFile(params, provider, owner) {
        try {
            if (!owner || !params.repo || !params.path || !params.content || !params.message) {
                throw new Error('repo, path, content e message sÃ£o obrigatÃ³rios');
            }
            // Se nÃ£o foi fornecido SHA, obter automaticamente
            let fileSha = params.sha;
            if (!fileSha) {
                try {
                    const existingFile = await provider.getFile(owner, params.repo, params.path, params.branch);
                    fileSha = existingFile.sha;
                }
                catch (error) {
                    throw new Error('NÃ£o foi possÃ­vel obter SHA do arquivo. ForneÃ§a sha ou verifique se o arquivo existe.');
                }
            }
            const result = await provider.updateFile(owner, params.repo, params.path, params.content, params.message, fileSha, params.branch);
            return {
                success: true,
                action: 'update',
                message: `Arquivo '${params.path}' atualizado com sucesso`,
                data: result
            };
        }
        catch (error) {
            throw new Error(`Falha ao atualizar arquivo: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    /**
     * Deleta um arquivo do repositÃ³rio
     *
     * FUNCIONALIDADE:
     * - Remove arquivo especificado
     * - Faz commit de exclusÃ£o
     * - Requer SHA do arquivo
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - path: Caminho do arquivo
     * - message: Mensagem de commit
     * - sha: SHA do arquivo
     *
     * PARÃ‚METROS OPCIONAIS:
     * - branch: Branch de destino (padrÃ£o: branch padrÃ£o)
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Arquivo deve existir
     * - SHA deve ser vÃ¡lido
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Confirme exclusÃ£o antes de executar
     * - Use mensagens de commit descritivas
     * - Verifique dependÃªncias do arquivo
     * - Mantenha backup se necessÃ¡rio
     */
    async deleteFile(params, provider, owner) {
        try {
            if (!owner || !params.repo || !params.path || !params.message) {
                throw new Error('repo, path e message sÃ£o obrigatÃ³rios');
            }
            // Se nÃ£o foi fornecido SHA, obter automaticamente
            let fileSha = params.sha;
            if (!fileSha) {
                try {
                    const existingFile = await provider.getFile(owner, params.repo, params.path, params.branch);
                    fileSha = existingFile.sha;
                }
                catch (error) {
                    throw new Error('NÃ£o foi possÃ­vel obter SHA do arquivo. ForneÃ§a sha ou verifique se o arquivo existe.');
                }
            }
            const result = await provider.deleteFile(owner, params.repo, params.path, params.message, fileSha, params.branch);
            return {
                success: true,
                action: 'delete',
                message: `Arquivo '${params.path}' deletado com sucesso`,
                data: { deleted: result }
            };
        }
        catch (error) {
            throw new Error(`Falha ao deletar arquivo: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    /**
     * Lista conteÃºdo de um diretÃ³rio
     *
     * FUNCIONALIDADE:
     * - Lista arquivos e subdiretÃ³rios
     * - Suporta paginaÃ§Ã£o
     * - Inclui metadados de cada item
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     *
     * PARÃ‚METROS OPCIONAIS:
     * - path: Caminho do diretÃ³rio (padrÃ£o: raiz)
     * - ref: Branch, tag ou commit (padrÃ£o: branch padrÃ£o)
     * - page: PÃ¡gina da listagem (padrÃ£o: 1)
     * - limit: Itens por pÃ¡gina (padrÃ£o: 30, mÃ¡ximo: 100)
     *
     * VALIDAÃ‡Ã•ES:
     * - e repo obrigatÃ³rios
     * - DiretÃ³rio deve existir
     * - Page deve ser >= 1
     * - Limit deve ser entre 1 e 100
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use paginaÃ§Ã£o para diretÃ³rios grandes
     * - Monitore nÃºmero total de itens
     * - Use referÃªncias especÃ­ficas para versÃµes
     * - Organize estrutura de diretÃ³rios
     */
    async listFiles(params, provider, owner) {
        try {
            if (!owner || !params.repo) {
                throw new Error('e repo sÃ£o obrigatÃ³rios');
            }
            const path = params.path || '';
            const page = params.page || 1;
            const limit = params.limit || 30;
            const files = await provider.listFiles(owner, params.repo, path, params.ref);
            return {
                success: true,
                action: 'list',
                message: `${files.length} itens encontrados em '${path || 'raiz'}'`,
                data: {
                    path,
                    files,
                    page,
                    limit,
                    total: files.length
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao listar arquivos: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    /**
     * Busca arquivos por conteÃºdo
     *
     * FUNCIONALIDADE:
     * - Busca arquivos que contenham texto especÃ­fico
     * - Suporta diferentes referÃªncias
     * - Retorna resultados relevantes
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - query: Termo de busca
     *
     * PARÃ‚METROS OPCIONAIS:
     * - ref: Branch, tag ou commit (padrÃ£o: branch padrÃ£o)
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Query deve ter pelo menos 3 caracteres
     * - RepositÃ³rio deve existir
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use termos de busca especÃ­ficos
     * - Combine com filtros de diretÃ³rio
     * - Use referÃªncias para versÃµes especÃ­ficas
     * - Analise resultados para relevÃ¢ncia
     */
    async searchFiles(params, provider, owner) {
        try {
            if (!owner || !params.repo || !params.query) {
                throw new Error('repo e query sÃ£o obrigatÃ³rios');
            }
            if (params.query.length < 3) {
                throw new Error('Query deve ter pelo menos 3 caracteres');
            }
            // Implementar busca de arquivos por conteÃºdo
            // Por enquanto, retorna mensagem de funcionalidade
            return {
                success: true,
                action: 'search',
                message: `Busca por '${params.query}' solicitada`,
                data: {
                    query: params.query,
                    ref: params.ref || 'branch padrÃ£o',
                    results: 'Funcionalidade de busca serÃ¡ implementada'
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao buscar arquivos: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    /**
     * Faz upload de todo o projeto para o repositÃ³rio
     *
     * FUNCIONALIDADE:
     * - Envia todos os arquivos do projeto local
     * - Ignora diretÃ³rios desnecessÃ¡rios (node_modules, .git, dist)
     * - Ignora arquivos temporÃ¡rios e logs
     * - Faz commit com mensagem personalizada
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - projectPath: Caminho do projeto local
     * - message: Mensagem de commit
     *
     * PARÃ‚METROS OPCIONAIS:
     * - branch: Branch de destino (padrÃ£o: branch padrÃ£o)
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Projeto deve existir no caminho especificado
     * - UsuÃ¡rio deve ter permissÃ£o de escrita
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use mensagens de commit descritivas
     * - Verifique se o repositÃ³rio estÃ¡ limpo
     * - Use branches para mudanÃ§as grandes
     * - Monitore erros de upload
     */
    async uploadProject(params, provider, owner) {
        try {
            if (!owner || !params.repo || !params.projectPath || !params.message) {
                throw new Error('repo, projectPath e message sÃ£o obrigatÃ³rios');
            }
            const result = await provider.uploadProject(owner, params.repo, params.projectPath, params.message, params.branch);
            return {
                success: true,
                action: 'upload-project',
                message: `Projeto enviado com sucesso: ${result.uploaded} arquivos enviados`,
                data: {
                    uploaded: result.uploaded,
                    errors: result.errors,
                    totalErrors: result.errors.length
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao fazer upload do projeto: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Verifica se erro Ã© relacionado a Git
     */
    ,
    /**
     * Verifica se erro Ã© relacionado a Git
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
//# sourceMappingURL=git-files.js.map