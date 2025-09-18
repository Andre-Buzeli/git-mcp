"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.releasesTool = void 0;
const zod_1 = require("zod");
const index_js_1 = require("../providers/index.js");
const user_detection_js_1 = require("../utils/user-detection.js");
/**
 * Tool: releases
 *
 * DESCRIÇÃO:
 * Gerenciamento completo de releases com suporte multi-provider (GitHub e Gitea)
 *
 * FUNCIONALIDADES:
 * - Criação de novos releases
 * - Listagem e busca de releases
 * - Obtenção de detalhes específicos
 * - Atualização de releases existentes
 * - Publicação de releases
 * - Exclusão de releases
 * - Controle de versão
 *
 * USO:
 * - Para gerenciar versões do software
 * - Para controle de deploy
 * - Para documentação de mudanças
 * - Para distribuição de releases
 *
 * RECOMENDAÇÕES:
 * - Use versionamento semântico
 * - Documente mudanças detalhadamente
 * - Teste antes de publicar
 * - Mantenha histórico de versões
 */
/**
 * Schema de validação para entrada da tool releases
 *
 * VALIDAÇÕES:
 * - action: Ação obrigatória (create, list, get, update, delete, publish)
 * - Parâmetros específicos por ação
 * - Validação de tipos e formatos
 *
 * RECOMENDAÇÕES:
 * - Sempre valide entrada antes de usar
 * - Use parâmetros opcionais adequadamente
 * - Documente parâmetros obrigatórios
 */
const ReleasesInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['create', 'list', 'get', 'update', 'delete', 'publish']),
    // Parâmetros comuns
    repo: zod_1.z.string(),
    // Para multi-provider
    provider: zod_1.z.enum(['gitea', 'github']).describe('Provider to use (gitea or github)'), // Provider específico: gitea, github ou both
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
 * Schema de saída padronizado
 *
 * ESTRUTURA:
 * - success: Status da operação
 * - action: Ação executada
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
 * DESCRIÇÃO:
 * Gerenciamento completo de releases Gitea com múltiplas ações
 *
 * ACTIONS DISPONÍVEIS:
 *
 * 1. create - Criar novo release
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - tag_name (obrigatório): Nome da tag do release
 *    - name (opcional): Nome do release
 *    - body (opcional): Descrição detalhada (changelog)
 *    - draft (opcional): Se é um draft release (padrão: false)
 *    - prerelease (opcional): Se é um prerelease (padrão: false)
 *    - target_commitish (opcional): Branch ou commit alvo (padrão: branch padrão)
 *
 * 2. list - Listar releases
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - page (opcional): Página da listagem (padrão: 1)
 *    - limit (opcional): Itens por página (padrão: 30, máximo: 100)
 *
 * 3. get - Obter detalhes do release
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - release_id (obrigatório): ID do release
 *
 * 4. update - Atualizar release existente
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - release_id (obrigatório): ID do release
 *    - new_tag_name (opcional): Nova tag
 *    - new_name (opcional): Novo nome
 *    - new_body (opcional): Nova descrição
 *    - new_draft (opcional): Novo status de draft
 *    - new_prerelease (opcional): Novo status de prerelease
 *    - new_target_commitish (opcional): Nova branch/commit alvo
 *
 * 5. delete - Deletar release
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - release_id (obrigatório): ID do release
 *
 * 6. publish - Publicar release
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - release_id (obrigatório): ID do release
 *
 * RECOMENDAÇÕES DE USO:
 * - Use versionamento semântico (ex: v1.0.0, v2.1.3)
 * - Documente mudanças detalhadamente no body
 * - Use drafts para releases em preparação
 * - Marque prereleases adequadamente
 * - Teste releases antes de publicar
 * - Mantenha changelog organizado
 */
exports.releasesTool = {
    name: 'git-releases',
    description: 'tool: Gerencia releases Git para distribuição de versões\n──────────────\naction create: cria nova release\naction create requires: repo, tag_name, name, body, draft, prerelease, target_commitish, provider\n───────────────\naction list: lista releases do repositório\naction list requires: repo, page, limit, provider\n───────────────\naction get: obtém detalhes de release\naction get requires: repo, release_id, provider\n───────────────\naction update: atualiza release existente\naction update requires: repo, release_id, new_tag_name, new_name, new_body, new_draft, new_prerelease, new_target_commitish, provider\n───────────────\naction delete: remove release\naction delete requires: repo, release_id, provider\n───────────────\naction publish: publica release\naction publish requires: repo, release_id, latest, provider',
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
        required: ['action', 'repo', 'provider']
    },
    /**
     * Handler principal da tool releases
     *
     * FUNCIONALIDADE:
     * - Valida entrada usando Zod schema
     * - Roteia para método específico baseado na ação
     * - Trata erros de forma uniforme
     * - Retorna resultado padronizado
     *
     * FLUXO:
     * 1. Validação de entrada
     * 2. Seleção do provider
     * 3. Roteamento por ação
     * 4. Execução do método específico
     * 5. Tratamento de erros
     * 6. Retorno de resultado
     *
     * TRATAMENTO DE ERROS:
     * - Validação: erro de schema
     * - Execução: erro da operação
     * - Roteamento: ação não suportada
     *
     * RECOMENDAÇÕES:
     * - Sempre valide entrada antes de processar
     * - Trate erros específicos adequadamente
     * - Log detalhes de erro para debug
     * - Retorne mensagens de erro úteis
     */
    async handler(input) {
        try {
            const validatedInput = ReleasesInputSchema.parse(input);
            // Aplicar auto-detecção apenas para owner dentro do provider especificado
            const processedInput = await (0, user_detection_js_1.applyAutoUserDetection)(validatedInput, validatedInput.provider);
            // Usar o provider especificado pelo usuário
            const provider = index_js_1.globalProviderFactory.getProvider(processedInput.provider);
            if (!provider) {
                throw new Error(`Provider '${processedInput.provider}' não encontrado`);
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
                    throw new Error(`Ação não suportada: ${processedInput.action}`);
            }
        }
        catch (error) {
            return {
                success: false,
                action: input.action,
                message: 'Erro na operação de releases',
                error: error instanceof Error ? error.message : String(error)
            };
        }
    },
    /**
     * Cria um novo release no repositório
     *
     * FUNCIONALIDADE:
     * - Cria release com tag e descrição
     * - Suporta configuração de draft e prerelease
     * - Permite especificar branch/commit alvo
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - tag_name: Nome da tag do release
     *
     * PARÂMETROS OPCIONAIS:
     * - name: Nome do release
     * - body: Descrição detalhada (changelog)
     * - draft: Se é um draft release (padrão: false)
     * - prerelease: Se é um prerelease (padrão: false)
     * - target_commitish: Branch ou commit alvo (padrão: branch padrão)
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Tag deve ser única no repositório
     * - Target commitish deve existir
     * - Usuário deve ter permissão de escrita
     *
     * RECOMENDAÇÕES:
     * - Use versionamento semântico (ex: v1.0.0)
     * - Documente mudanças detalhadamente
     * - Use drafts para releases em preparação
     * - Marque prereleases adequadamente
     */
    async createRelease(params, provider) {
        try {
            if (!!params.repo || !params.tag_name) {
                throw new Error('repo e tag_name são obrigatórios');
            }
            const releaseData = {
                tag_name: params.tag_name,
                name: params.name || params.tag_name,
                body: params.body || '',
                draft: params.draft || false,
                prerelease: params.prerelease || false,
                target_commitish: params.target_commitish || 'main'
            };
            const release = await provider.createRelease(params.tag_name, params.name || params.tag_name, params.body, params.draft, params.prerelease);
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
     * Lista releases do repositório
     *
     * FUNCIONALIDADE:
     * - Lista releases com paginação
     * - Retorna informações básicas de cada release
     * - Inclui status de draft e prerelease
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     *
     * PARÂMETROS OPCIONAIS:
     * - page: Página da listagem (padrão: 1)
     * - limit: Itens por página (padrão: 30, máximo: 100)
     *
     * VALIDAÇÕES:
     * - e repo obrigatórios
     * - Page deve ser >= 1
     * - Limit deve ser entre 1 e 100
     *
     * RECOMENDAÇÕES:
     * - Use paginação para repositórios com muitos releases
     * - Monitore número total de releases
     * - Verifique status de draft e prerelease
     * - Mantenha releases organizados
     */
    async listReleases(params, provider) {
        try {
            if (!params.repo) {
                throw new Error('e repo são obrigatórios');
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
     * Obtém detalhes de um release específico
     *
     * FUNCIONALIDADE:
     * - Retorna informações completas do release
     * - Inclui tag, nome, descrição e status
     * - Mostra URLs de download
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - release_id: ID do release
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Release deve existir no repositório
     * - ID deve ser válido
     *
     * RECOMENDAÇÕES:
     * - Use para obter detalhes completos
     * - Verifique status de draft e prerelease
     * - Analise changelog e descrição
     * - Monitore URLs de download
     */
    async getRelease(params, provider) {
        try {
            if (!!params.repo || !params.release_id) {
                throw new Error('repo e release_id são obrigatórios');
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
     * - Suporta mudança de tag e descrição
     * - Permite alteração de status
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - release_id: ID do release
     *
     * PARÂMETROS OPCIONAIS:
     * - new_tag_name: Nova tag
     * - new_name: Novo nome
     * - new_body: Nova descrição
     * - new_draft: Novo status de draft
     * - new_prerelease: Novo status de prerelease
     * - new_target_commitish: Nova branch/commit alvo
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Release deve existir
     * - Pelo menos um campo deve ser atualizado
     *
     * RECOMENDAÇÕES:
     * - Atualize apenas campos necessários
     * - Use mensagens de commit descritivas
     * - Documente mudanças importantes
     * - Notifique usuários sobre mudanças
     */
    async updateRelease(params, provider) {
        try {
            if (!!params.repo || !params.release_id) {
                throw new Error('repo e release_id são obrigatórios');
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
     * Deleta um release do repositório
     *
     * FUNCIONALIDADE:
     * - Remove release especificado
     * - Mantém tag associada (se existir)
     * - Confirma exclusão bem-sucedida
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - release_id: ID do release
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Release deve existir
     * - Usuário deve ter permissão de exclusão
     *
     * RECOMENDAÇÕES:
     * - Confirme exclusão antes de executar
     * - Verifique se release não está sendo usado
     * - Mantenha backup se necessário
     * - Documente motivo da exclusão
     */
    async deleteRelease(params, provider) {
        try {
            if (!!params.repo || !params.release_id) {
                throw new Error('repo e release_id são obrigatórios');
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
     * - Mantém todas as outras configurações
     * - Permite download público
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - release_id: ID do release
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Release deve existir
     * - Release deve estar como draft
     *
     * RECOMENDAÇÕES:
     * - Confirme que release está pronto
     * - Teste antes de publicar
     * - Verifique se não há bugs conhecidos
     * - Notifique usuários sobre nova versão
     */
    async publishRelease(params, provider) {
        try {
            if (!!params.repo || !params.release_id) {
                throw new Error('repo e release_id são obrigatórios');
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
};
//# sourceMappingURL=git-releases.js.map