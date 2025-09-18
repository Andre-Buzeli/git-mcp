"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.releasesTool = void 0;
const zod_1 = require("zod");
const index_js_1 = require("../providers/index.js");
const user_detection_js_1 = require("../utils/user-detection.js");
/**
 * Tool: releases
 *
 * DESCRIÃ‡ÃƒO:
 * Gerenciamento completo de releases com suporte multi-provider (GitHub e Gitea)
 *
 * FUNCIONALIDADES:
 * - CriaÃ§Ã£o de novos releases
 * - Listagem e busca de releases
 * - ObtenÃ§Ã£o de detalhes especÃ­ficos
 * - AtualizaÃ§Ã£o de releases existentes
 * - PublicaÃ§Ã£o de releases
 * - ExclusÃ£o de releases
 * - Controle de versÃ£o
 *
 * USO:
 * - Para gerenciar versÃµes do software
 * - Para controle de deploy
 * - Para documentaÃ§Ã£o de mudanÃ§as
 * - Para distribuiÃ§Ã£o de releases
 *
 * RECOMENDAÃ‡Ã•ES:
 * - Use versionamento semÃ¢ntico
 * - Documente mudanÃ§as detalhadamente
 * - Teste antes de publicar
 * - Mantenha histÃ³rico de versÃµes
 */
/**
 * Schema de validaÃ§Ã£o para entrada da tool releases
 *
 * VALIDAÃ‡Ã•ES:
 * - action: AÃ§Ã£o obrigatÃ³ria (create, list, get, update, delete, publish)
 * - ParÃ¢metros especÃ­ficos por aÃ§Ã£o
 * - ValidaÃ§Ã£o de tipos e formatos
 *
 * RECOMENDAÃ‡Ã•ES:
 * - Sempre valide entrada antes de usar
 * - Use parÃ¢metros opcionais adequadamente
 * - Documente parÃ¢metros obrigatÃ³rios
 */
const ReleasesInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['create', 'list', 'get', 'update', 'delete', 'publish']),
    // ParÃ¢metros comuns
    repo: zod_1.z.string(),
    // Para multi-provider
    provider: zod_1.z.enum(['gitea', 'github']).describe('Provider to use (gitea or github)'), // Provider especÃ­fico: gitea, github ou both
    projectPath: zod_1.z.string().describe('Local project path for git operations'),
    // Para create
    tag_name: zod_1.z.string().optional(),
    name: zod_1.z.string().optional(),
    body: zod_1.z.string().optional(),
    draft: zod_1.z.boolean().optional(),
    prerelease: zod_1.z.boolean().optional(),
    target_commitish: zod_1.z.string().optional(),
    // Para get/update/delete/publish
    release_id: zod_1.z.number().optional(),
    // Para list
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    // Para update
    new_tag_name: zod_1.z.string().optional(),
    new_name: zod_1.z.string().optional(),
    new_body: zod_1.z.string().optional(),
    new_draft: zod_1.z.boolean().optional(),
    new_prerelease: zod_1.z.boolean().optional(),
    new_target_commitish: zod_1.z.string().optional(),
    // Para publish
    latest: zod_1.z.boolean().optional(),
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
const ReleasesResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    action: zod_1.z.string(),
    message: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional()
});
/**
 * Tool: releases
 *
 * DESCRIÃ‡ÃƒO:
 * Gerenciamento completo de releases Gitea com mÃºltiplas aÃ§Ãµes
 *
 * ACTIONS DISPONÃVEIS:
 *
 * 1. create - Criar novo release
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - tag_name (obrigatÃ³rio): Nome da tag do release
 *    - name (opcional): Nome do release
 *    - body (opcional): DescriÃ§Ã£o detalhada (changelog)
 *    - draft (opcional): Se Ã© um draft release (padrÃ£o: false)
 *    - prerelease (opcional): Se Ã© um prerelease (padrÃ£o: false)
 *    - target_commitish (opcional): Branch ou commit alvo (padrÃ£o: branch padrÃ£o)
 *
 * 2. list - Listar releases
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - page (opcional): PÃ¡gina da listagem (padrÃ£o: 1)
 *    - limit (opcional): Itens por pÃ¡gina (padrÃ£o: 30, mÃ¡ximo: 100)
 *
 * 3. get - Obter detalhes do release
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - release_id (obrigatÃ³rio): ID do release
 *
 * 4. update - Atualizar release existente
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - release_id (obrigatÃ³rio): ID do release
 *    - new_tag_name (opcional): Nova tag
 *    - new_name (opcional): Novo nome
 *    - new_body (opcional): Nova descriÃ§Ã£o
 *    - new_draft (opcional): Novo status de draft
 *    - new_prerelease (opcional): Novo status de prerelease
 *    - new_target_commitish (opcional): Nova branch/commit alvo
 *
 * 5. delete - Deletar release
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - release_id (obrigatÃ³rio): ID do release
 *
 * 6. publish - Publicar release
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - release_id (obrigatÃ³rio): ID do release
 *
 * RECOMENDAÃ‡Ã•ES DE USO:
 * - Use versionamento semÃ¢ntico (ex: v1.0.0, v2.1.3)
 * - Documente mudanÃ§as detalhadamente no body
 * - Use drafts para releases em preparaÃ§Ã£o
 * - Marque prereleases adequadamente
 * - Teste releases antes de publicar
 * - Mantenha changelog organizado
 */
exports.releasesTool = {
    name: 'git-releases',
    description: 'tool: Gerencia releases Git para distribuiÃ§Ã£o de versÃµes\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction create: cria nova release\naction create requires: repo, tag_name, name, body, draft, prerelease, target_commitish, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction list: lista releases do repositÃ³rio\naction list requires: repo, page, limit, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction get: obtÃ©m detalhes de release\naction get requires: repo, release_id, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction update: atualiza release existente\naction update requires: repo, release_id, new_tag_name, new_name, new_body, new_draft, new_prerelease, new_target_commitish, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction delete: remove release\naction delete requires: repo, release_id, provider\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction publish: publica release\naction publish requires: repo, release_id, latest, provider',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['create', 'list', 'get', 'update', 'delete', 'publish'],
                description: 'Action to perform on releases'
            },
            repo: { type: 'string', description: 'Repository name' },
            provider: { type: 'string', description: 'Provider to use (github, gitea, or omit for default)' },
            tag_name: { type: 'string', description: 'Release tag name' },
            name: { type: 'string', description: 'Release name' },
            body: { type: 'string', description: 'Release description/notes' },
            draft: { type: 'boolean', description: 'Create as draft release' },
            prerelease: { type: 'boolean', description: 'Mark as prerelease' },
            target_commitish: { type: 'string', description: 'Target branch or commit' },
            release_id: { type: 'number', description: 'Release ID' },
            page: { type: 'number', description: 'Page number', minimum: 1 },
            limit: { type: 'number', description: 'Items per page', minimum: 1, maximum: 100 },
            new_tag_name: { type: 'string', description: 'New tag name' },
            new_name: { type: 'string', description: 'New release name' },
            new_body: { type: 'string', description: 'New release description' },
            new_draft: { type: 'boolean', description: 'New draft status' },
            new_prerelease: { type: 'boolean', description: 'New prerelease status' },
            new_target_commitish: { type: 'string', description: 'New target branch or commit' },
            latest: { type: 'boolean', description: 'Get latest release' }
        },
        required: ['action', 'repo', 'provider', 'projectPath']
    },
    /**
     * Handler principal da tool releases
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
            const validatedInput = ReleasesInputSchema.parse(input);
            // Aplicar auto-detecÃ§Ã£o apenas para owner dentro do provider especificado
            const processedInput = await (0, user_detection_js_1.applyAutoUserDetection)(validatedInput, validatedInput.provider);
            // Usar o provider especificado pelo usuÃ¡rio
            const provider = index_js_1.globalProviderFactory.getProvider(processedInput.provider);
            if (!provider) {
                throw new Error(`Provider '${processedInput.provider}' nÃ£o encontrado`);
            }
            switch (processedInput.action) {
                case 'create':
                    return await this.createRelease(processedInput, provider);
                case 'list':
                    return await this.listReleases(processedInput, provider);
                case 'get':
                    return await this.getRelease(processedInput, provider);
                case 'update':
                    return await this.updateRelease(processedInput, provider);
                case 'delete':
                    return await this.deleteRelease(processedInput, provider);
                case 'publish':
                    return await this.publishRelease(processedInput, provider);
                default:
                    throw new Error(`AÃ§Ã£o nÃ£o suportada: ${processedInput.action}`);
            }
        }
        catch (error) {
            return {
                success: false,
                action: input.action,
                message: 'Erro na operaÃ§Ã£o de releases',
                error: error instanceof Error ? error.message : String(error)
            };
        }
    },
    /**
     * Cria um novo release no repositÃ³rio
     *
     * FUNCIONALIDADE:
     * - Cria release com tag e descriÃ§Ã£o
     * - Suporta configuraÃ§Ã£o de draft e prerelease
     * - Permite especificar branch/commit alvo
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - tag_name: Nome da tag do release
     *
     * PARÃ‚METROS OPCIONAIS:
     * - name: Nome do release
     * - body: DescriÃ§Ã£o detalhada (changelog)
     * - draft: Se Ã© um draft release (padrÃ£o: false)
     * - prerelease: Se Ã© um prerelease (padrÃ£o: false)
     * - target_commitish: Branch ou commit alvo (padrÃ£o: branch padrÃ£o)
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Tag deve ser Ãºnica no repositÃ³rio
     * - Target commitish deve existir
     * - UsuÃ¡rio deve ter permissÃ£o de escrita
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use versionamento semÃ¢ntico (ex: v1.0.0)
     * - Documente mudanÃ§as detalhadamente
     * - Use drafts para releases em preparaÃ§Ã£o
     * - Marque prereleases adequadamente
     */
    async createRelease(params, provider) {
        try {
            if (!params.repo || !params.tag_name) {
                throw new Error('repo e tag_name sÃ£o obrigatÃ³rios');
            }
            const releaseData = {
                tag_name: params.tag_name,
                name: params.name || params.tag_name,
                body: params.body || '',
                draft: params.draft || false,
                prerelease: params.prerelease || false,
                target_commitish: params.target_commitish || 'main'
            };
            const owner = (await provider.getCurrentUser()).login;
            const release = await provider.createRelease(owner, params.repo, {
                tag_name: params.tag_name,
                name: params.name || params.tag_name,
                body: params.body || '',
                draft: params.draft || false,
                prerelease: params.prerelease || false,
                target_commitish: params.target_commitish || 'main'
            });
            return {
                success: true,
                action: 'create',
                message: `Release '${params.tag_name}' criado com sucesso`,
                data: release
            };
        }
        catch (error) {
            throw new Error(`Falha ao criar release: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    /**
     * Lista releases do repositÃ³rio
     *
     * FUNCIONALIDADE:
     * - Lista releases com paginaÃ§Ã£o
     * - Retorna informaÃ§Ãµes bÃ¡sicas de cada release
     * - Inclui status de draft e prerelease
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
     * - Use paginaÃ§Ã£o para repositÃ³rios com muitos releases
     * - Monitore nÃºmero total de releases
     * - Verifique status de draft e prerelease
     * - Mantenha releases organizados
     */
    async listReleases(params, provider) {
        try {
            if (!params.repo) {
                throw new Error('e repo sÃ£o obrigatÃ³rios');
            }
            const page = params.page || 1;
            const limit = params.limit || 30;
            const releases = await provider.listReleases((await provider.getCurrentUser()).login, params.repo, page, limit);
            return {
                success: true,
                action: 'list',
                message: `${releases.length} releases encontrados`,
                data: {
                    releases,
                    page,
                    limit,
                    total: releases.length
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao listar releases: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    /**
     * ObtÃ©m detalhes de um release especÃ­fico
     *
     * FUNCIONALIDADE:
     * - Retorna informaÃ§Ãµes completas do release
     * - Inclui tag, nome, descriÃ§Ã£o e status
     * - Mostra URLs de download
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - release_id: ID do release
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Release deve existir no repositÃ³rio
     * - ID deve ser vÃ¡lido
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use para obter detalhes completos
     * - Verifique status de draft e prerelease
     * - Analise changelog e descriÃ§Ã£o
     * - Monitore URLs de download
     */
    async getRelease(params, provider) {
        try {
            if (!params.repo || !params.release_id) {
                throw new Error('repo e release_id sÃ£o obrigatÃ³rios');
            }
            const release = await provider.getRelease((await provider.getCurrentUser()).login, params.repo, params.release_id);
            return {
                success: true,
                action: 'get',
                message: `Release #${params.release_id} obtido com sucesso`,
                data: release
            };
        }
        catch (error) {
            throw new Error(`Falha ao obter release: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    /**
     * Atualiza um release existente
     *
     * FUNCIONALIDADE:
     * - Atualiza campos do release
     * - Suporta mudanÃ§a de tag e descriÃ§Ã£o
     * - Permite alteraÃ§Ã£o de status
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - release_id: ID do release
     *
     * PARÃ‚METROS OPCIONAIS:
     * - new_tag_name: Nova tag
     * - new_name: Novo nome
     * - new_body: Nova descriÃ§Ã£o
     * - new_draft: Novo status de draft
     * - new_prerelease: Novo status de prerelease
     * - new_target_commitish: Nova branch/commit alvo
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Release deve existir
     * - Pelo menos um campo deve ser atualizado
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Atualize apenas campos necessÃ¡rios
     * - Use mensagens de commit descritivas
     * - Documente mudanÃ§as importantes
     * - Notifique usuÃ¡rios sobre mudanÃ§as
     */
    async updateRelease(params, provider) {
        try {
            if (!params.repo || !params.release_id) {
                throw new Error('repo e release_id sÃ£o obrigatÃ³rios');
            }
            const updateData = {};
            if (params.new_tag_name)
                updateData.tag_name = params.new_tag_name;
            if (params.new_name)
                updateData.name = params.new_name;
            if (params.new_body !== undefined)
                updateData.body = params.new_body;
            if (params.new_draft !== undefined)
                updateData.draft = params.new_draft;
            if (params.new_prerelease !== undefined)
                updateData.prerelease = params.new_prerelease;
            if (params.new_target_commitish)
                updateData.target_commitish = params.new_target_commitish;
            if (Object.keys(updateData).length === 0) {
                throw new Error('Nenhum campo para atualizar foi fornecido');
            }
            const release = await provider.updateRelease(params.release_id, updateData);
            return {
                success: true,
                action: 'update',
                message: `Release #${params.release_id} atualizado com sucesso`,
                data: release
            };
        }
        catch (error) {
            throw new Error(`Falha ao atualizar release: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    /**
     * Deleta um release do repositÃ³rio
     *
     * FUNCIONALIDADE:
     * - Remove release especificado
     * - MantÃ©m tag associada (se existir)
     * - Confirma exclusÃ£o bem-sucedida
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - release_id: ID do release
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Release deve existir
     * - UsuÃ¡rio deve ter permissÃ£o de exclusÃ£o
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Confirme exclusÃ£o antes de executar
     * - Verifique se release nÃ£o estÃ¡ sendo usado
     * - Mantenha backup se necessÃ¡rio
     * - Documente motivo da exclusÃ£o
     */
    async deleteRelease(params, provider) {
        try {
            if (!params.repo || !params.release_id) {
                throw new Error('repo e release_id sÃ£o obrigatÃ³rios');
            }
            await provider.deleteRelease(params.release_id);
            return {
                success: true,
                action: 'delete',
                message: `Release #${params.release_id} deletado com sucesso`,
                data: { deleted: true }
            };
        }
        catch (error) {
            throw new Error(`Falha ao deletar release: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    /**
     * Publica um release draft
     *
     * FUNCIONALIDADE:
     * - Altera status do release de draft para publicado
     * - MantÃ©m todas as outras configuraÃ§Ãµes
     * - Permite download pÃºblico
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - release_id: ID do release
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Release deve existir
     * - Release deve estar como draft
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Confirme que release estÃ¡ pronto
     * - Teste antes de publicar
     * - Verifique se nÃ£o hÃ¡ bugs conhecidos
     * - Notifique usuÃ¡rios sobre nova versÃ£o
     */
    async publishRelease(params, provider) {
        try {
            if (!params.repo || !params.release_id) {
                throw new Error('repo e release_id sÃ£o obrigatÃ³rios');
            }
            // Publicar release alterando status de draft para false
            const release = await provider.updateRelease(params.release_id, { draft: false });
            return {
                success: true,
                action: 'publish',
                message: `Release #${params.release_id} publicado com sucesso`,
                data: release
            };
        }
        catch (error) {
            throw new Error(`Falha ao publicar release: ${error instanceof Error ? error.message : String(error)}`);
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
//# sourceMappingURL=git-releases.js.map