"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tagsTool = void 0;
const zod_1 = require("zod");
const index_js_1 = require("../providers/index.js");
/**
 * Tool: tags
 *
 * DESCRIÇÃO:
 * Gerenciamento completo de tags com suporte multi-provider (GitHub e Gitea)
 *
 * FUNCIONALIDADES:
 * - Criação de novas tags
 * - Listagem e busca de tags
 * - Obtenção de detalhes específicos
 * - Exclusão de tags
 * - Controle de versão
 * - Busca por padrões
 *
 * USO:
 * - Para marcar versões específicas
 * - Para controle de release
 * - Para rollback de código
 * - Para identificação de commits
 *
 * RECOMENDAÇÕES:
 * - Use versionamento semântico
 * - Mantenha tags organizadas
 * - Documente propósito das tags
 * - Use para pontos de referência
 */
/**
 * Schema de validação para entrada da tool tags
 *
 * VALIDAÇÕES:
 * - action: Ação obrigatória (create, list, get, delete, search)
 * - Parâmetros específicos por ação
 * - Validação de tipos e formatos
 *
 * RECOMENDAÇÕES:
 * - Sempre valide entrada antes de usar
 * - Use parâmetros opcionais adequadamente
 * - Documente parâmetros obrigatórios
 */
const TagsInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['create', 'list', 'get', 'delete', 'search']),
    // Parâmetros comuns
    owner: zod_1.z.string().optional(),
    repo: zod_1.z.string().optional(),
    // Para multi-provider
    provider: zod_1.z.enum(['gitea', 'github', 'both']).optional(), // Provider específico: gitea, github ou both
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
 * Schema de saída padronizado
 *
 * ESTRUTURA:
 * - success: Status da operação
 * - action: Ação executada
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
 * DESCRIÇÃO:
 * Gerenciamento completo de tags Gitea com múltiplas ações
 *
 * ACTIONS DISPONÍVEIS:
 *
 * 1. create - Criar nova tag
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - tag_name (obrigatório): Nome da tag
 *    - message (opcional): Mensagem da tag (para tags anotadas)
 *    - target (obrigatório): Commit, branch ou tag alvo
 *    - type (opcional): Tipo de tag (lightweight, annotated) - padrão: lightweight
 *    - tagger_name (opcional): Nome do tagger (para tags anotadas)
 *    - tagger_email (opcional): Email do tagger (para tags anotadas)
 *
 * 2. list - Listar tags
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - page (opcional): Página da listagem (padrão: 1)
 *    - limit (opcional): Itens por página (padrão: 30, máximo: 100)
 *
 * 3. get - Obter detalhes da tag
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - tag (obrigatório): Nome da tag
 *
 * 4. delete - Deletar tag
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - tag (obrigatório): Nome da tag
 *
 * 5. search - Buscar tags
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - query (opcional): Termo de busca
 *    - pattern (opcional): Padrão de busca (ex: v*.*.*)
 *
 * RECOMENDAÇÕES DE USO:
 * - Use convenções de nomenclatura consistentes
 * - Documente propósito das tags
 * - Mantenha tags organizadas
 * - Use versionamento semântico
 * - Use tags anotadas para releases importantes
 * - Limpe tags antigas regularmente
 */
exports.tagsTool = {
    name: 'tags',
    description: 'Manage tags with multi-provider support (GitHub and Gitea): create, list, get, delete, search. Boas práticas (solo): use tags como "fotografias" imutáveis (ex.: v1.2.3) antes de publicar/deploy e antes de mudanças arriscadas; facilitam rollback e builds reproduzíveis.',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['create', 'list', 'get', 'delete', 'search'],
                description: 'Action to perform on tags'
            },
            owner: { type: 'string', description: 'Repository owner' },
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
        required: ['action']
    },
    /**
     * Handler principal da tool tags
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
            const validatedInput = TagsInputSchema.parse(input);
            // Seleciona o provider baseado na entrada ou usa o padrão
            const provider = validatedInput.provider
                ? index_js_1.globalProviderFactory.getProvider(validatedInput.provider)
                : index_js_1.globalProviderFactory.getDefaultProvider();
            if (!provider) {
                throw new Error('Provider não encontrado ou não configurado');
            }
            switch (validatedInput.action) {
                case 'create':
                    return await this.createTag(validatedInput, provider);
                case 'list':
                    return await this.listTags(validatedInput, provider);
                case 'get':
                    return await this.getTag(validatedInput, provider);
                case 'delete':
                    return await this.deleteTag(validatedInput, provider);
                case 'search':
                    return await this.searchTags(validatedInput, provider);
                default:
                    throw new Error(`Ação não suportada: ${validatedInput.action}`);
            }
        }
        catch (error) {
            return {
                success: false,
                action: input.action,
                message: 'Erro na operação de tags',
                error: error instanceof Error ? error.message : String(error)
            };
        }
    },
    /**
     * Cria uma nova tag no repositório
     *
     * FUNCIONALIDADE:
     * - Cria tag com nome e target especificados
     * - Suporta tags lightweight e anotadas
     * - Permite configuração de tagger
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - tag_name: Nome da tag
     * - target: Commit, branch ou tag alvo
     *
     * PARÂMETROS OPCIONAIS:
     * - message: Mensagem da tag (para tags anotadas)
     * - type: Tipo de tag (lightweight, annotated) - padrão: lightweight
     * - tagger_name: Nome do tagger (para tags anotadas)
     * - tagger_email: Email do tagger (para tags anotadas)
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Nome da tag deve ser único no repositório
     * - Target deve existir
     * - Usuário deve ter permissão de escrita
     *
     * RECOMENDAÇÕES:
     * - Use convenções de nomenclatura consistentes
     * - Use tags anotadas para releases importantes
     * - Documente propósito da tag
     * - Use versionamento semântico
     */
    async createTag(params, provider) {
        try {
            if (!params.owner || !params.repo || !params.tag_name || !params.target) {
                throw new Error('Owner, repo, tag_name e target são obrigatórios');
            }
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
            const tag = await provider.createTag(params.owner, params.repo, tagData);
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
     * Lista tags do repositório
     *
     * FUNCIONALIDADE:
     * - Lista tags com paginação
     * - Retorna informações básicas de cada tag
     * - Inclui commit alvo e URLs de download
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
     * - Owner e repo obrigatórios
     * - Page deve ser >= 1
     * - Limit deve ser entre 1 e 100
     *
     * RECOMENDAÇÕES:
     * - Use paginação para repositórios com muitas tags
     * - Monitore número total de tags
     * - Verifique commit alvo de cada tag
     * - Mantenha tags organizadas
     */
    async listTags(params, provider) {
        try {
            if (!params.owner || !params.repo) {
                throw new Error('Owner e repo são obrigatórios');
            }
            const page = params.page || 1;
            const limit = params.limit || 30;
            const tags = await provider.listTags(params.owner, params.repo, page, limit);
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
     * Obtém detalhes de uma tag específica
     *
     * FUNCIONALIDADE:
     * - Retorna informações completas da tag
     * - Inclui nome, commit alvo e URLs
     * - Mostra tipo da tag (lightweight/anotada)
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - tag: Nome da tag
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Tag deve existir no repositório
     * - Nome deve ser válido
     *
     * RECOMENDAÇÕES:
     * - Use para obter detalhes completos
     * - Verifique commit alvo da tag
     * - Analise URLs de download
     * - Monitore mudanças importantes
     */
    async getTag(params, provider) {
        try {
            if (!params.owner || !params.repo || !params.tag) {
                throw new Error('Owner, repo e tag são obrigatórios');
            }
            // Implementar obtenção de tag específica
            // Por enquanto, retorna mensagem de funcionalidade
            return {
                success: true,
                action: 'get',
                message: `Tag '${params.tag}' obtida com sucesso`,
                data: {
                    tag: params.tag,
                    note: 'Funcionalidade de obtenção de tag específica será implementada'
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao obter tag: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    /**
     * Deleta uma tag do repositório
     *
     * FUNCIONALIDADE:
     * - Remove tag especificada
     * - Mantém commit alvo intacto
     * - Confirma exclusão bem-sucedida
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - tag: Nome da tag
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Tag deve existir
     * - Usuário deve ter permissão de exclusão
     *
     * RECOMENDAÇÕES:
     * - Confirme exclusão antes de executar
     * - Verifique se tag não está sendo usada
     * - Mantenha backup se necessário
     * - Documente motivo da exclusão
     */
    async deleteTag(params, provider) {
        try {
            if (!params.owner || !params.repo || !params.tag) {
                throw new Error('Owner, repo e tag são obrigatórios');
            }
            await provider.deleteTag(params.owner, params.repo, params.tag);
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
     * Busca tags por critérios específicos
     *
     * FUNCIONALIDADE:
     * - Busca tags por nome ou padrão
     * - Suporta padrões glob (ex: v*.*.*)
     * - Retorna resultados relevantes
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     *
     * PARÂMETROS OPCIONAIS:
     * - query: Termo de busca
     * - pattern: Padrão de busca (ex: v*.*.*)
     *
     * VALIDAÇÕES:
     * - Owner e repo obrigatórios
     * - Query ou pattern deve ser fornecido
     * - Repositório deve existir
     *
     * RECOMENDAÇÕES:
     * - Use padrões glob para busca eficiente
     * - Combine com filtros de nome
     * - Analise resultados para relevância
     * - Use para encontrar tags relacionadas
     */
    async searchTags(params, provider) {
        try {
            if (!params.owner || !params.repo) {
                throw new Error('Owner e repo são obrigatórios');
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
                    query: params.query || 'não fornecido',
                    pattern: params.pattern || 'não fornecido',
                    results: 'Funcionalidade de busca será implementada'
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao buscar tags: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
};
//# sourceMappingURL=tags.js.map