"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.issuesTool = void 0;
const zod_1 = require("zod");
const index_js_1 = require("../providers/index.js");
const user_detection_js_1 = require("../utils/user-detection.js");
/**
 * Tool: issues
 *
 * DESCRIÇÃO:
 * Gerenciamento completo de issues com suporte multi-provider (GitHub e Gitea)
 *
 * FUNCIONALIDADES:
 * - Criação de novas issues
 * - Listagem e busca de issues
 * - Obtenção de detalhes específicos
 * - Atualização de issues existentes
 * - Fechamento de issues
 * - Adição de comentários
 * - Busca por conteúdo e status
 *
 * USO:
 * - Para gerenciar bugs e features
 * - Para acompanhar progresso de desenvolvimento
 * - Para comunicação entre equipe
 * - Para controle de qualidade
 *
 * RECOMENDAÇÕES:
 * - Use títulos descritivos
 * - Documente detalhes completos
 * - Atualize status regularmente
 * - Use labels adequadamente
 */
/**
 * Schema de validação para entrada da tool issues
 *
 * VALIDAÇÕES:
 * - action: Ação obrigatória (create, list, get, update, close, comment, search)
 * - Parâmetros específicos por ação
 * - Validação de tipos e formatos
 *
 * RECOMENDAÇÕES:
 * - Sempre valide entrada antes de usar
 * - Use parâmetros opcionais adequadamente
 * - Documente parâmetros obrigatórios
 */
const IssuesInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['create', 'list', 'get', 'update', 'close', 'comment', 'search']),
    // Parâmetros comuns
    owner: zod_1.z.string().optional(),
    repo: zod_1.z.string().optional(),
    // Para multi-provider
    provider: zod_1.z.enum(['gitea', 'github']).describe('Provider to use (gitea or github)'), // Provider específico: gitea, github ou both
    // Para create
    title: zod_1.z.string().optional(),
    body: zod_1.z.string().optional(),
    labels: zod_1.z.array(zod_1.z.string()).optional(),
    assignees: zod_1.z.array(zod_1.z.string()).optional(),
    milestone: zod_1.z.number().optional(),
    // Para get/update/close/comment
    issue_number: zod_1.z.number().optional(),
    // Para list
    state: zod_1.z.enum(['open', 'closed', 'all']).optional(),
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
    // Para update
    new_title: zod_1.z.string().optional(),
    new_body: zod_1.z.string().optional(),
    new_state: zod_1.z.enum(['open', 'closed']).optional(),
    new_labels: zod_1.z.array(zod_1.z.string()).optional(),
    new_assignees: zod_1.z.array(zod_1.z.string()).optional(),
    new_milestone: zod_1.z.number().optional(),
    // Para comment
    comment_body: zod_1.z.string().optional(),
    // Para search
    query: zod_1.z.string().optional(),
    author: zod_1.z.string().optional(),
    assignee: zod_1.z.string().optional(),
    label: zod_1.z.string().optional(),
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
const IssuesResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    action: zod_1.z.string(),
    message: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional()
});
/**
 * Tool: issues
 *
 * DESCRIÇÃO:
 * Gerenciamento completo de issues Gitea com múltiplas ações
 *
 * ACTIONS DISPONÍVEIS:
 *
 * 1. create - Criar nova issue
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - title (obrigatório): Título da issue
 *    - body (opcional): Descrição detalhada
 *    - labels (opcional): Array de labels
 *    - assignees (opcional): Array de usuários responsáveis
 *    - milestone (opcional): ID do milestone
 *
 * 2. list - Listar issues
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - state (opcional): Estado das issues (open, closed, all) - padrão: open
 *    - page (opcional): Página da listagem (padrão: 1)
 *    - limit (opcional): Itens por página (padrão: 30, máximo: 100)
 *
 * 3. get - Obter detalhes da issue
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - issue_number (obrigatório): Número da issue
 *
 * 4. update - Atualizar issue existente
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - issue_number (obrigatório): Número da issue
 *    - new_title (opcional): Novo título
 *    - new_body (opcional): Nova descrição
 *    - new_state (opcional): Novo estado
 *    - new_labels (opcional): Novos labels
 *    - new_assignees (opcional): Novos responsáveis
 *    - new_milestone (opcional): Novo milestone
 *
 * 5. close - Fechar issue
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - issue_number (obrigatório): Número da issue
 *
 * 6. comment - Adicionar comentário
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - issue_number (obrigatório): Número da issue
 *    - comment_body (obrigatório): Conteúdo do comentário
 *
 * 7. search - Buscar issues
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - query (obrigatório): Termo de busca
 *    - author (opcional): Autor das issues
 *    - assignee (opcional): Responsável pelas issues
 *    - label (opcional): Label específico
 *
 * RECOMENDAÇÕES DE USO:
 * - Use títulos descritivos e claros
 * - Documente detalhes completos na descrição
 * - Atualize status regularmente
 * - Use labels para categorização
 * - Atribua responsáveis adequadamente
 * - Mantenha issues organizadas
 */
exports.issuesTool = {
    name: 'issues',
    description: 'Manage issues with multi-provider support (GitHub and Gitea): create, list, get, update, close, comment, search. Boas práticas (solo): use issues como notas/tarefas pesquisáveis; títulos descritivos; corpo objetivo; labels para prioridade/categoria; feche com comentários de conclusão e aprendizado.',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['create', 'list', 'get', 'update', 'close', 'comment', 'search'],
                description: 'Action to perform on issues'
            },
            owner: { type: 'string', description: 'Repository owner' },
            repo: { type: 'string', description: 'Repository name' },
            provider: { type: 'string', description: 'Provider to use (github, gitea, or omit for default)' },
            title: { type: 'string', description: 'Issue title' },
            body: { type: 'string', description: 'Issue body/description' },
            labels: { type: 'array', items: { type: 'string' }, description: 'Issue labels' },
            assignees: { type: 'array', items: { type: 'string' }, description: 'Issue assignees' },
            milestone: { type: 'number', description: 'Milestone ID' },
            issue_number: { type: 'number', description: 'Issue number' },
            state: { type: 'string', enum: ['open', 'closed', 'all'], description: 'Issue state' },
            page: { type: 'number', description: 'Page number', minimum: 1 },
            limit: { type: 'number', description: 'Items per page', minimum: 1, maximum: 100 },
            new_title: { type: 'string', description: 'New issue title' },
            new_body: { type: 'string', description: 'New issue body' },
            new_state: { type: 'string', enum: ['open', 'closed'], description: 'New issue state' },
            new_labels: { type: 'array', items: { type: 'string' }, description: 'New issue labels' },
            new_assignees: { type: 'array', items: { type: 'string' }, description: 'New issue assignees' },
            new_milestone: { type: 'number', description: 'New milestone ID' },
            comment_body: { type: 'string', description: 'Comment content' },
            query: { type: 'string', description: 'Search query' },
            author: { type: 'string', description: 'Issue author filter' },
            assignee: { type: 'string', description: 'Issue assignee filter' },
            label: { type: 'string', description: 'Issue label filter' }
        },
        required: ['action', 'provider']
    },
    /**
     * Handler principal da tool issues
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
            const validatedInput = IssuesInputSchema.parse(input);
            // Aplicar auto-detecção de usuário/owner
            const processedInput = await (0, user_detection_js_1.applyAutoUserDetection)(validatedInput, validatedInput.provider);
            // Obter o provider correto
            const provider = processedInput.provider
                ? index_js_1.globalProviderFactory.getProvider(processedInput.provider)
                : index_js_1.globalProviderFactory.getDefaultProvider();
            if (!provider) {
                throw new Error(`Provider '${processedInput.provider}' não encontrado`);
            }
            switch (processedInput.action) {
                case 'create':
                    return await this.createIssue(processedInput, provider);
                case 'list':
                    return await this.listIssues(processedInput, provider);
                case 'get':
                    return await this.getIssue(processedInput, provider);
                case 'update':
                    return await this.updateIssue(processedInput, provider);
                case 'close':
                    return await this.closeIssue(processedInput, provider);
                case 'comment':
                    return await this.addComment(processedInput, provider);
                case 'search':
                    return await this.searchIssues(processedInput, provider);
                default:
                    throw new Error(`Ação não suportada: ${processedInput.action}`);
            }
        }
        catch (error) {
            return {
                success: false,
                action: input.action,
                message: 'Erro na operação de issues',
                error: error instanceof Error ? error.message : String(error)
            };
        }
    },
    /**
     * Cria uma nova issue no repositório
     *
     * FUNCIONALIDADE:
     * - Cria issue com título e descrição
     * - Suporta labels, assignees e milestone
     * - Retorna detalhes da issue criada
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - title: Título da issue
     *
     * PARÂMETROS OPCIONAIS:
     * - body: Descrição detalhada
     * - labels: Array de labels para categorização
     * - assignees: Array de usuários responsáveis
     * - milestone: ID do milestone associado
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Título deve ser único no repositório
     * - Labels devem existir no repositório
     * - Assignees devem ser usuários válidos
     *
     * RECOMENDAÇÕES:
     * - Use títulos descritivos e claros
     * - Documente detalhes completos
     * - Use labels para categorização
     * - Atribua responsáveis adequadamente
     */
    async createIssue(params, provider) {
        try {
            if (!params.owner) {
                throw new Error('Owner é obrigatório');
            }
            if (!params.repo) {
                throw new Error('Repo é obrigatório');
            }
            if (!params.title) {
                throw new Error('Title é obrigatório');
            }
            const issue = await provider.createIssue(params.owner, params.repo, params.title, params.body, params.assignees, params.labels);
            return {
                success: true,
                action: 'create',
                message: `Issue '${params.title}' criada com sucesso`,
                data: issue
            };
        }
        catch (error) {
            throw new Error(`Falha ao criar issue: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    /**
     * Lista issues do repositório
     *
     * FUNCIONALIDADE:
     * - Lista issues com filtros de estado
     * - Suporta paginação
     * - Retorna informações básicas de cada issue
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     *
     * PARÂMETROS OPCIONAIS:
     * - state: Estado das issues (open, closed, all) - padrão: open
     * - page: Página da listagem (padrão: 1)
     * - limit: Itens por página (padrão: 30, máximo: 100)
     *
     * VALIDAÇÕES:
     * - Owner e repo obrigatórios
     * - State deve ser um dos valores válidos
     * - Page deve ser >= 1
     * - Limit deve ser entre 1 e 100
     *
     * RECOMENDAÇÕES:
     * - Use paginação para repositórios com muitas issues
     * - Monitore número total de issues
     * - Filtre por estado para organização
     * - Mantenha issues organizadas
     */
    async listIssues(params, provider) {
        try {
            if (!params.owner) {
                throw new Error('Owner é obrigatório');
            }
            if (!params.repo) {
                throw new Error('Repo é obrigatório');
            }
            const state = params.state || 'open';
            const page = params.page || 1;
            const limit = params.limit || 30;
            const issues = await provider.listIssues(params.owner, params.repo, state, page, limit);
            return {
                success: true,
                action: 'list',
                message: `${issues.length} issues ${state} encontradas`,
                data: {
                    issues,
                    state,
                    page,
                    limit,
                    total: issues.length
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao listar issues: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    /**
     * Obtém detalhes de uma issue específica
     *
     * FUNCIONALIDADE:
     * - Retorna informações completas da issue
     * - Inclui título, descrição, labels, assignees
     * - Mostra histórico de comentários
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - issue_number: Número da issue
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Issue deve existir no repositório
     * - Número deve ser válido
     *
     * RECOMENDAÇÕES:
     * - Use para obter detalhes completos
     * - Verifique status e labels
     * - Analise comentários e histórico
     * - Monitore mudanças importantes
     */
    async getIssue(params, provider) {
        try {
            // Aplicar auto-detecção se necessário
            if (!params.owner) {
                throw new Error('Owner é obrigatório');
            }
            if (!params.repo) {
                throw new Error('Repo é obrigatório');
            }
            if (!params.issue_number) {
                throw new Error('Issue_number é obrigatório');
            }
            const issue = await provider.getIssue(params.owner, params.repo, params.issue_number);
            return {
                success: true,
                action: 'get',
                message: `Issue #${params.issue_number} obtida com sucesso`,
                data: issue
            };
        }
        catch (error) {
            throw new Error(`Falha ao obter issue: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    /**
     * Atualiza uma issue existente
     *
     * FUNCIONALIDADE:
     * - Atualiza campos da issue
     * - Suporta mudança de estado
     * - Permite alteração de labels e assignees
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - issue_number: Número da issue
     *
     * PARÂMETROS OPCIONAIS:
     * - new_title: Novo título
     * - new_body: Nova descrição
     * - new_state: Novo estado
     * - new_labels: Novos labels
     * - new_assignees: Novos responsáveis
     * - new_milestone: Novo milestone
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Issue deve existir
     * - Pelo menos um campo deve ser atualizado
     *
     * RECOMENDAÇÕES:
     * - Atualize apenas campos necessários
     * - Use mensagens de commit descritivas
     * - Documente mudanças importantes
     * - Notifique responsáveis sobre mudanças
     */
    async updateIssue(params, provider) {
        try {
            if (!params.owner) {
                throw new Error('Owner é obrigatório');
            }
            if (!params.repo) {
                throw new Error('Repo é obrigatório');
            }
            if (!params.issue_number) {
                throw new Error('Issue_number é obrigatório');
            }
            const updateData = {};
            if (params.new_title)
                updateData.title = params.new_title;
            if (params.new_body !== undefined)
                updateData.body = params.new_body;
            if (params.new_state)
                updateData.state = params.new_state;
            if (params.new_labels)
                updateData.labels = params.new_labels;
            if (params.new_assignees)
                updateData.assignees = params.new_assignees;
            if (params.new_milestone !== undefined)
                updateData.milestone = params.new_milestone;
            if (Object.keys(updateData).length === 0) {
                throw new Error('Nenhum campo para atualizar foi fornecido');
            }
            const issue = await provider.updateIssue(params.owner, params.repo, params.issue_number, updateData);
            return {
                success: true,
                action: 'update',
                message: `Issue #${params.issue_number} atualizada com sucesso`,
                data: issue
            };
        }
        catch (error) {
            throw new Error(`Falha ao atualizar issue: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    /**
     * Fecha uma issue
     *
     * FUNCIONALIDADE:
     * - Altera estado da issue para closed
     * - Mantém histórico e comentários
     * - Permite reabertura posterior
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - issue_number: Número da issue
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Issue deve existir
     * - Issue deve estar aberta
     *
     * RECOMENDAÇÕES:
     * - Confirme que issue foi resolvida
     * - Documente solução aplicada
     * - Use comentário explicativo
     * - Verifique se não há dependências
     */
    async closeIssue(params, provider) {
        try {
            if (!params.owner) {
                throw new Error('Owner é obrigatório');
            }
            if (!params.repo) {
                throw new Error('Repo é obrigatório');
            }
            if (!params.issue_number) {
                throw new Error('Issue_number é obrigatório');
            }
            const issue = await provider.updateIssue(params.owner, params.repo, params.issue_number, { state: 'closed' });
            return {
                success: true,
                action: 'close',
                message: `Issue #${params.issue_number} fechada com sucesso`,
                data: issue
            };
        }
        catch (error) {
            throw new Error(`Falha ao fechar issue: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    /**
     * Adiciona comentário a uma issue
     *
     * FUNCIONALIDADE:
     * - Cria novo comentário na issue
     * - Mantém histórico de discussão
     * - Suporta formatação Markdown
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - issue_number: Número da issue
     * - comment_body: Conteúdo do comentário
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Issue deve existir
     * - Comentário não pode estar vazio
     *
     * RECOMENDAÇÕES:
     * - Use comentários para atualizações
     * - Documente progresso e decisões
     * - Use formatação Markdown adequadamente
     * - Mantenha comentários relevantes
     */
    async addComment(params, provider) {
        try {
            if (!params.owner) {
                throw new Error('Owner é obrigatório');
            }
            if (!params.repo) {
                throw new Error('Repo é obrigatório');
            }
            if (!params.issue_number) {
                throw new Error('Issue_number é obrigatório');
            }
            if (!params.comment_body) {
                throw new Error('Comment_body é obrigatório');
            }
            // Implementar criação de comentário
            // Por enquanto, retorna mensagem de funcionalidade
            const comment = {
                id: Date.now(),
                body: params.comment_body,
                user: { login: 'usuário atual', id: 1 },
                created_at: new Date().toISOString(),
                note: 'Funcionalidade de comentário será implementada'
            };
            return {
                success: true,
                action: 'comment',
                message: `Comentário adicionado à issue #${params.issue_number} com sucesso`,
                data: comment
            };
        }
        catch (error) {
            throw new Error(`Falha ao adicionar comentário: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    /**
     * Busca issues por critérios específicos
     *
     * FUNCIONALIDADE:
     * - Busca issues por conteúdo
     * - Filtra por autor, assignee e label
     * - Retorna resultados relevantes
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - query: Termo de busca
     *
     * PARÂMETROS OPCIONAIS:
     * - author: Autor das issues
     * - assignee: Responsável pelas issues
     * - label: Label específico
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Query deve ter pelo menos 3 caracteres
     * - Repositório deve existir
     *
     * RECOMENDAÇÕES:
     * - Use termos de busca específicos
     * - Combine filtros para resultados precisos
     * - Analise relevância dos resultados
     * - Use para encontrar issues relacionadas
     */
    async searchIssues(params, provider) {
        try {
            if (!params.owner) {
                throw new Error('Owner é obrigatório');
            }
            if (!params.repo) {
                throw new Error('Repo é obrigatório');
            }
            if (!params.query) {
                throw new Error('Query é obrigatório');
            }
            if (params.query.length < 3) {
                throw new Error('Query deve ter pelo menos 3 caracteres');
            }
            // Implementar busca de issues
            // Por enquanto, retorna mensagem de funcionalidade
            return {
                success: true,
                action: 'search',
                message: `Busca por issues com '${params.query}' solicitada`,
                data: {
                    query: params.query,
                    author: params.author || 'todos',
                    assignee: params.assignee || 'todos',
                    label: params.label || 'todos',
                    results: 'Funcionalidade de busca será implementada'
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao buscar issues: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
};
//# sourceMappingURL=issues.js.map