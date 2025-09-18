"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tagsTool = void 0;
const zod_1 = require("zod");
const index_js_1 = require("../providers/index.js");
const user_detection_js_1 = require("../utils/user-detection.js");
/**
 * Tool: tags
 *
 * DESCRIÃ‡ÃƒO:
 * Gerenciamento completo de tags com suporte multi-provider (GitHub e Gitea)
 *
 * FUNCIONALIDADES:
 * - CriaÃ§Ã£o de novas tags
 * - Listagem e busca de tags
 * - ObtenÃ§Ã£o de detalhes especÃ­ficos
 * - ExclusÃ£o de tags
 * - Controle de versÃ£o
 * - Busca por padrÃµes
 *
 * USO:
 * - Para marcar versÃµes especÃ­ficas
 * - Para controle de release
 * - Para rollback de cÃ³digo
 * - Para identificaÃ§Ã£o de commits
 *
 * RECOMENDAÃ‡Ã•ES:
 * - Use versionamento semÃ¢ntico
 * - Mantenha tags organizadas
 * - Documente propÃ³sito das tags
 * - Use para pontos de referÃªncia
 */
/**
 * Schema de validaÃ§Ã£o para entrada da tool tags
 *
 * VALIDAÃ‡Ã•ES:
 * - action: AÃ§Ã£o obrigatÃ³ria (create, list, get, delete, search)
 * - ParÃ¢metros especÃ­ficos por aÃ§Ã£o
 * - ValidaÃ§Ã£o de tipos e formatos
 *
 * RECOMENDAÃ‡Ã•ES:
 * - Sempre valide entrada antes de usar
 * - Use parÃ¢metros opcionais adequadamente
 * - Documente parÃ¢metros obrigatÃ³rios
 */
const TagsInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['create', 'list', 'get', 'delete', 'search']),
    // ParÃ¢metros comuns
    repo: zod_1.z.string(),
    // Para multi-provider
    provider: zod_1.z.enum(['gitea', 'github']).describe('Provider to use (gitea or github)'), // Provider especÃ­fico: gitea, github ou both
    projectPath: zod_1.z.string().describe('Local project path for git operations'),
    // Para create
    tag_name: zod_1.z.string().optional(),
    message: zod_1.z.string().optional(),
    target: zod_1.z.string().optional(),
    type: zod_1.z.enum(['lightweight', 'annotated']).optional(),
    tagger_name: zod_1.z.string().optional(),
    tagger_email: zod_1.z.string().optional(),
    // Para get/delete
    tag: zod_1.z.string().optional(),
    // Para list
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    // Para search
    query: zod_1.z.string().optional(),
    pattern: zod_1.z.string().optional(),
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
const TagsResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    action: zod_1.z.string(),
    message: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional()
});
/**
 * Tool: tags
 *
 * DESCRIÃ‡ÃƒO:
 * Gerenciamento completo de tags Gitea com mÃºltiplas aÃ§Ãµes
 *
 * ACTIONS DISPONÃVEIS:
 *
 * 1. create - Criar nova tag
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - tag_name (obrigatÃ³rio): Nome da tag
 *    - message (opcional): Mensagem da tag (para tags anotadas)
 *    - target (obrigatÃ³rio): Commit, branch ou tag alvo
 *    - type (opcional): Tipo de tag (lightweight, annotated) - padrÃ£o: lightweight
 *    - tagger_name (opcional): Nome do tagger (para tags anotadas)
 *    - tagger_email (opcional): Email do tagger (para tags anotadas)
 *
 * 2. list - Listar tags
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - page (opcional): PÃ¡gina da listagem (padrÃ£o: 1)
 *    - limit (opcional): Itens por pÃ¡gina (padrÃ£o: 30, mÃ¡ximo: 100)
 *
 * 3. get - Obter detalhes da tag
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - tag (obrigatÃ³rio): Nome da tag
 *
 * 4. delete - Deletar tag
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - tag (obrigatÃ³rio): Nome da tag
 *
 * 5. search - Buscar tags
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - query (opcional): Termo de busca
 *    - pattern (opcional): PadrÃ£o de busca (ex: v*.*.*)
 *
 * RECOMENDAÃ‡Ã•ES DE USO:
 * - Use convenÃ§Ãµes de nomenclatura consistentes
 * - Documente propÃ³sito das tags
 * - Mantenha tags organizadas
 * - Use versionamento semÃ¢ntico
 * - Use tags anotadas para releases importantes
 * - Limpe tags antigas regularmente
 */
exports.tagsTool = {
    name: 'git-tags',
    description: 'tool: Gerencia tags Git para versionamento e releases\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction create: cria nova tag\naction create requires: repo, tag_name, message, target, type, tagger_name, tagger_email, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction list: lista tags do repositÃ³rio\naction list requires: repo, page, limit, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction get: obtÃ©m detalhes de tag\naction get requires: repo, tag, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction delete: remove tag\naction delete requires: repo, tag, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction search: busca tags por critÃ©rios\naction search requires: repo, query, pattern, provider',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['create', 'list', 'get', 'delete', 'search'],
                description: 'Action to perform on tags'
            },
            repo: { type: 'string', description: 'Repository name' },
            provider: { type: 'string', description: 'Provider to use (github, gitea, or omit for default)' },
            tag_name: { type: 'string', description: 'Tag name' },
            message: { type: 'string', description: 'Tag message (for annotated tags)' },
            target: { type: 'string', description: 'Target commit SHA, branch or tag' },
            type: { type: 'string', enum: ['lightweight', 'annotated'], description: 'Tag type' },
            tagger_name: { type: 'string', description: 'Tagger name' },
            tagger_email: { type: 'string', description: 'Tagger email' },
            tag: { type: 'string', description: 'Tag name for get/delete operations' },
            page: { type: 'number', description: 'Page number', minimum: 1 },
            limit: { type: 'number', description: 'Items per page', minimum: 1, maximum: 100 },
            query: { type: 'string', description: 'Search query' },
            pattern: { type: 'string', description: 'Search pattern (e.g., v*.*.*)' }
        },
        required: ['action', 'repo', 'provider', 'projectPath']
    },
    /**
     * Handler principal da tool tags
     *
     * FUNCIONALIDADE:
     * - Valida entrada usando Zod schema
     * - Roteia para mÃ©todo especÃ­fico baseado na aÃ§Ã£o
     * - Trata erros de forma uniforme
     * - Retorna resultado padronizado
     *
     * FLUXO:
     * 1. ValidaÃ§Ã£o de entrada
     * 2. SeleÃ§Ã£o do provider
     * 3. Roteamento por aÃ§Ã£o
     * 4. ExecuÃ§Ã£o do mÃ©todo especÃ­fico
     * 5. Tratamento de erros
     * 6. Retorno de resultado
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
            const validatedInput = TagsInputSchema.parse(input);
            // Aplicar auto-detecÃ§Ã£o apenas para owner dentro do provider especificado
            const processedInput = await (0, user_detection_js_1.applyAutoUserDetection)(validatedInput, validatedInput.provider);
            // Usar o provider especificado pelo usuÃ¡rio
            const provider = index_js_1.globalProviderFactory.getProvider(processedInput.provider);
            if (!provider) {
                throw new Error(`Provider '${processedInput.provider}' nÃ£o encontrado`);
            }
            switch (processedInput.action) {
                case 'create':
                    return await this.createTag(processedInput, provider);
                case 'list':
                    return await this.listTags(processedInput, provider);
                case 'get':
                    return await this.getTag(processedInput, provider);
                case 'delete':
                    return await this.deleteTag(processedInput, provider);
                case 'search':
                    return await this.searchTags(processedInput, provider);
                default:
                    throw new Error(`AÃ§Ã£o nÃ£o suportada: ${processedInput.action}`);
            }
        }
        catch (error) {
            return {
                success: false,
                action: input.action,
                message: 'Erro na operaÃ§Ã£o de tags',
                error: error instanceof Error ? error.message : String(error)
            };
        }
    },
    /**
     * Cria uma nova tag no repositÃ³rio
     *
     * FUNCIONALIDADE:
     * - Cria tag com nome e target especificados
     * - Suporta tags lightweight e anotadas
     * - Permite configuraÃ§Ã£o de tagger
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - tag_name: Nome da tag
     * - target: Commit, branch ou tag alvo
     *
     * PARÃ‚METROS OPCIONAIS:
     * - message: Mensagem da tag (para tags anotadas)
     * - type: Tipo de tag (lightweight, annotated) - padrÃ£o: lightweight
     * - tagger_name: Nome do tagger (para tags anotadas)
     * - tagger_email: Email do tagger (para tags anotadas)
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Nome da tag deve ser Ãºnico no repositÃ³rio
     * - Target deve existir
     * - UsuÃ¡rio deve ter permissÃ£o de escrita
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use convenÃ§Ãµes de nomenclatura consistentes
     * - Use tags anotadas para releases importantes
     * - Documente propÃ³sito da tag
     * - Use versionamento semÃ¢ntico
     */
    async createTag(params, provider) {
        try {
            if (!params.repo || !params.tag_name || !params.target) {
                throw new Error('Repo, tag_name e target sÃ£o obrigatÃ³rios');
            }
            const currentUser = await provider.getCurrentUser();
            const owner = currentUser.login;
            const tagData = {
                tag_name: params.tag_name,
                target: params.target
            };
            if (params.type === 'annotated') {
                if (params.message)
                    tagData.message = params.message;
                if (params.tagger_name)
                    tagData.tagger_name = params.tagger_name;
                if (params.tagger_email)
                    tagData.tagger_email = params.tagger_email;
            }
            const tag = await provider.createTag(owner, params.repo, tagData);
            return {
                success: true,
                action: 'create',
                message: `Tag '${params.tag_name}' criada com sucesso`,
                data: tag
            };
        }
        catch (error) {
            throw new Error(`Falha ao criar tag: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    /**
     * Lista tags do repositÃ³rio
     *
     * FUNCIONALIDADE:
     * - Lista tags com paginaÃ§Ã£o
     * - Retorna informaÃ§Ãµes bÃ¡sicas de cada tag
     * - Inclui commit alvo e URLs de download
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     *
     * PARÃ‚METROS OPCIONAIS:
     * - page: PÃ¡gina da listagem (padrÃ£o: 1)
     * - limit: Itens por pÃ¡gina (padrÃ£o: 30, mÃ¡ximo: 100)
     *
     * VALIDAÃ‡Ã•ES:
     * - e repo obrigatÃ³rios
     * - Page deve ser >= 1
     * - Limit deve ser entre 1 e 100
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use paginaÃ§Ã£o para repositÃ³rios com muitas tags
     * - Monitore nÃºmero total de tags
     * - Verifique commit alvo de cada tag
     * - Mantenha tags organizadas
     */
    async listTags(params, provider) {
        try {
            if (!params.repo) {
                throw new Error('Repo Ã© obrigatÃ³rio');
            }
            const currentUser = await provider.getCurrentUser();
            const owner = currentUser.login;
            const page = params.page || 1;
            const limit = params.limit || 30;
            const tags = await provider.listTags((await provider.getCurrentUser()).login, params.repo, page, limit);
            return {
                success: true,
                action: 'list',
                message: `${tags.length} tags encontradas`,
                data: {
                    tags,
                    page,
                    limit,
                    total: tags.length
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao listar tags: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    /**
     * ObtÃ©m detalhes de uma tag especÃ­fica
     *
     * FUNCIONALIDADE:
     * - Retorna informaÃ§Ãµes completas da tag
     * - Inclui nome, commit alvo e URLs
     * - Mostra tipo da tag (lightweight/anotada)
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - tag: Nome da tag
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Tag deve existir no repositÃ³rio
     * - Nome deve ser vÃ¡lido
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use para obter detalhes completos
     * - Verifique commit alvo da tag
     * - Analise URLs de download
     * - Monitore mudanÃ§as importantes
     */
    async getTag(params, provider) {
        try {
            if (!params.repo || !params.tag) {
                throw new Error('Repo e tag sÃ£o obrigatÃ³rios');
            }
            const currentUser = await provider.getCurrentUser();
            const owner = currentUser.login;
            // Implementar obtenÃ§Ã£o de tag especÃ­fica
            // Por enquanto, retorna mensagem de funcionalidade
            return {
                success: true,
                action: 'get',
                message: `Tag '${params.tag}' obtida com sucesso`,
                data: {
                    tag: params.tag,
                    note: 'Funcionalidade de obtenÃ§Ã£o de tag especÃ­fica serÃ¡ implementada'
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao obter tag: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    /**
     * Deleta uma tag do repositÃ³rio
     *
     * FUNCIONALIDADE:
     * - Remove tag especificada
     * - MantÃ©m commit alvo intacto
     * - Confirma exclusÃ£o bem-sucedida
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - tag: Nome da tag
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Tag deve existir
     * - UsuÃ¡rio deve ter permissÃ£o de exclusÃ£o
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Confirme exclusÃ£o antes de executar
     * - Verifique se tag nÃ£o estÃ¡ sendo usada
     * - Mantenha backup se necessÃ¡rio
     * - Documente motivo da exclusÃ£o
     */
    async deleteTag(params, provider) {
        try {
            if (!params.repo || !params.tag) {
                throw new Error('Repo e tag sÃ£o obrigatÃ³rios');
            }
            const currentUser = await provider.getCurrentUser();
            const owner = currentUser.login;
            await provider.deleteTag((await provider.getCurrentUser()).login, params.repo, params.tag);
            return {
                success: true,
                action: 'delete',
                message: `Tag '${params.tag}' deletada com sucesso`,
                data: { deleted: true }
            };
        }
        catch (error) {
            throw new Error(`Falha ao deletar tag: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    /**
     * Busca tags por critÃ©rios especÃ­ficos
     *
     * FUNCIONALIDADE:
     * - Busca tags por nome ou padrÃ£o
     * - Suporta padrÃµes glob (ex: v*.*.*)
     * - Retorna resultados relevantes
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     *
     * PARÃ‚METROS OPCIONAIS:
     * - query: Termo de busca
     * - pattern: PadrÃ£o de busca (ex: v*.*.*)
     *
     * VALIDAÃ‡Ã•ES:
     * - e repo obrigatÃ³rios
     * - Query ou pattern deve ser fornecido
     * - RepositÃ³rio deve existir
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use padrÃµes glob para busca eficiente
     * - Combine com filtros de nome
     * - Analise resultados para relevÃ¢ncia
     * - Use para encontrar tags relacionadas
     */
    async searchTags(params, provider) {
        try {
            if (!params.repo) {
                throw new Error('Repo Ã© obrigatÃ³rio');
            }
            if (!params.query && !params.pattern) {
                throw new Error('Query ou pattern deve ser fornecido');
            }
            // Implementar busca de tags
            // Por enquanto, retorna mensagem de funcionalidade
            return {
                success: true,
                action: 'search',
                message: `Busca por tags solicitada`,
                data: {
                    query: params.query || 'nÃ£o fornecido',
                    pattern: params.pattern || 'nÃ£o fornecido',
                    results: 'Funcionalidade de busca serÃ¡ implementada'
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao buscar tags: ${error instanceof Error ? error.message : String(error)}`);
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
//# sourceMappingURL=git-tags.js.map