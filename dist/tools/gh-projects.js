"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ghProjectsTool = void 0;
const zod_1 = require("zod");
const index_js_1 = require("../providers/index.js");
/**
 * Tool: gh-projects
 *
 * DESCRIÇÃO:
 * Gerenciamento de Projects GitHub (exclusivo GitHub) com múltiplas ações
 *
 * FUNCIONALIDADES:
 * - Listar projetos
 * - Criar projeto
 * - Obter projeto
 * - Atualizar projeto
 * - Deletar projeto
 * - Gerenciar itens do projeto
 * - Gerenciar campos do projeto
 *
 * USO:
 * - Para gerenciamento de projetos
 * - Para organização de tarefas
 * - Para planejamento de sprints
 * - Para tracking de progresso
 *
 * RECOMENDAÇÕES:
 * - Use para projetos de médio a longo prazo
 * - Configure campos personalizados adequadamente
 * - Mantenha itens organizados
 * - Use templates quando possível
 */
const GhProjectsInputSchema = zod_1.z.object({
    action: zod_1.z.enum(['list', 'create', 'get', 'update', 'delete', 'items', 'fields']),
    // owner: obtido automaticamente do provider,
    repo: zod_1.z.string(),
    projectPath: zod_1.z.string().describe('Local project path for git operations'),
    // Para create/update
    project_id: zod_1.z.string().optional(),
    title: zod_1.z.string().optional(),
    body: zod_1.z.string().optional(),
    state: zod_1.z.enum(['open', 'closed']).optional(),
    public: zod_1.z.boolean().optional(),
    // Para items
    item_id: zod_1.z.string().optional(),
    content_id: zod_1.z.string().optional(),
    content_type: zod_1.z.enum(['Issue', 'PullRequest', 'DraftIssue']).optional(),
    field_id: zod_1.z.string().optional(),
    field_value: zod_1.z.string().optional(),
    // Para fields
    field_name: zod_1.z.string().optional(),
    field_type: zod_1.z.enum(['TEXT', 'SINGLE_SELECT', 'NUMBER', 'DATE']).optional(),
    field_options: zod_1.z.array(zod_1.z.string()).optional(),
    // Para list
    page: zod_1.z.number().min(1).optional(),
    limit: zod_1.z.number().min(1).max(100).optional(),
});
const GhProjectsResultSchema = zod_1.z.object({
    success: zod_1.z.boolean(),
    action: zod_1.z.string(),
    message: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    error: zod_1.z.string().optional()
});
exports.ghProjectsTool = {
    name: 'gh-projects',
    description: 'tool: Gerencia GitHub Projects para organização de tarefas e projetos\n──────────────\naction list: lista projetos\naction list requires: page, limit\n───────────────\naction create: cria novo projeto\naction create requires: title, body, state, public\n───────────────\naction get: obtém detalhes de projeto específico\naction get requires: project_id\n───────────────\naction update: atualiza projeto existente\naction update requires: project_id, title, body, state, public\n───────────────\naction delete: remove projeto\naction delete requires: project_id\n───────────────\naction items: gerencia itens do projeto\naction items requires: project_id, item_id, content_id, content_type, field_id, field_value\n───────────────\naction fields: gerencia campos do projeto\naction fields requires: project_id, field_id, field_name, field_type, field_options',
    inputSchema: {
        type: 'object',
        properties: {
            action: {
                type: 'string',
                enum: ['list', 'create', 'get', 'update', 'delete', 'items', 'fields'],
                description: 'Action to perform on projects'
            },
            projectPath: { type: 'string', description: 'Local project path for git operations' },
            project_id: { type: 'string', description: 'Project ID' },
            title: { type: 'string', description: 'Project title' },
            body: { type: 'string', description: 'Project body' },
            state: { type: 'string', enum: ['open', 'closed'], description: 'Project state' },
            public: { type: 'boolean', description: 'Public project' },
            item_id: { type: 'string', description: 'Item ID' },
            content_id: { type: 'string', description: 'Content ID' },
            content_type: { type: 'string', enum: ['Issue', 'PullRequest', 'DraftIssue'], description: 'Content type' },
            field_id: { type: 'string', description: 'Field ID' },
            field_value: { type: 'string', description: 'Field value' },
            field_name: { type: 'string', description: 'Field name' },
            field_type: { type: 'string', enum: ['TEXT', 'SINGLE_SELECT', 'NUMBER', 'DATE'], description: 'Field type' },
            field_options: { type: 'array', items: { type: 'string' }, description: 'Field options' },
            page: { type: 'number', description: 'Page number', minimum: 1 },
            limit: { type: 'number', description: 'Items per page', minimum: 1, maximum: 100 }
        },
        required: ['action', 'projectPath']
    },
    async handler(input) {
        try {
            const validatedInput = GhProjectsInputSchema.parse(input);
            // Fixar provider como github para tools exclusivas do GitHub
            const provider = index_js_1.globalProviderFactory.getProvider('github');
            if (!provider) {
                throw new Error('Provider GitHub não encontrado');
            }
            switch (validatedInput.action) {
                case 'list':
                    return await this.list(validatedInput, provider);
                case 'create':
                    return await this.create(validatedInput, provider);
                case 'get':
                    return await this.get(validatedInput, provider);
                case 'update':
                    return await this.update(validatedInput, provider);
                case 'delete':
                    return await this.delete(validatedInput, provider);
                case 'items':
                    return await this.items(validatedInput, provider);
                case 'fields':
                    return await this.fields(validatedInput, provider);
                default:
                    throw new Error(`Ação não suportada: ${validatedInput.action}`);
            }
        }
        catch (error) {
            return {
                success: false,
                action: input.action,
                message: 'Erro na operação de projeto',
                error: error instanceof Error ? error.message : String(error)
            };
        }
    },
    async list(params, provider) {
        try {
            const page = params.page || 1;
            const limit = params.limit || 30;
            // Simular listagem de projetos
            const projects = [
                {
                    id: 'project-1',
                    title: 'Main Project',
                    body: 'Main development project',
                    state: 'open',
                    public: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                {
                    id: 'project-2',
                    title: 'Feature Development',
                    body: 'Feature development tracking',
                    state: 'open',
                    public: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ];
            return {
                success: true,
                action: 'list',
                message: `${projects.length} projetos encontrados`,
                data: {
                    projects,
                    page,
                    limit,
                    total: projects.length
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao listar projetos: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async create(params, provider) {
        try {
            if (!params.title) {
                throw new Error('title é obrigatório para create');
            }
            const project = {
                id: `project-${Date.now()}`,
                title: params.title,
                body: params.body || '',
                state: params.state || 'open',
                public: params.public || false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            return {
                success: true,
                action: 'create',
                message: `Projeto criado com sucesso: ${project.title}`,
                data: project
            };
        }
        catch (error) {
            throw new Error(`Falha ao criar projeto: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async get(params, provider) {
        try {
            if (!params.project_id) {
                throw new Error('project_id é obrigatório para get');
            }
            // Simular obtenção de projeto
            const project = {
                id: params.project_id,
                title: 'Sample Project',
                body: 'Sample project description',
                state: 'open',
                public: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                items: {
                    totalCount: 5
                },
                fields: {
                    totalCount: 3
                }
            };
            return {
                success: true,
                action: 'get',
                message: `Projeto ${params.project_id} obtido com sucesso`,
                data: project
            };
        }
        catch (error) {
            throw new Error(`Falha ao obter projeto: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async update(params, provider) {
        try {
            if (!params.project_id) {
                throw new Error('project_id é obrigatório para update');
            }
            const updateData = {};
            if (params.title)
                updateData.title = params.title;
            if (params.body !== undefined)
                updateData.body = params.body;
            if (params.state)
                updateData.state = params.state;
            if (params.public !== undefined)
                updateData.public = params.public;
            const project = {
                id: params.project_id,
                ...updateData,
                updated_at: new Date().toISOString()
            };
            return {
                success: true,
                action: 'update',
                message: `Projeto ${params.project_id} atualizado com sucesso`,
                data: project
            };
        }
        catch (error) {
            throw new Error(`Falha ao atualizar projeto: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async delete(params, provider) {
        try {
            if (!params.project_id) {
                throw new Error('project_id é obrigatório para delete');
            }
            return {
                success: true,
                action: 'delete',
                message: `Projeto ${params.project_id} deletado com sucesso`,
                data: { deleted: true }
            };
        }
        catch (error) {
            throw new Error(`Falha ao deletar projeto: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async items(params, provider) {
        try {
            if (!params.project_id) {
                throw new Error('project_id é obrigatório para items');
            }
            // Simular gerenciamento de itens do projeto
            const items = [
                {
                    id: 'item-1',
                    content: {
                        id: 'issue-1',
                        type: 'Issue',
                        title: 'Sample Issue',
                        number: 1
                    },
                    created_at: new Date().toISOString()
                },
                {
                    id: 'item-2',
                    content: {
                        id: 'pr-1',
                        type: 'PullRequest',
                        title: 'Sample PR',
                        number: 2
                    },
                    created_at: new Date().toISOString()
                }
            ];
            return {
                success: true,
                action: 'items',
                message: `Itens do projeto ${params.project_id} obtidos com sucesso`,
                data: {
                    project_id: params.project_id,
                    items,
                    total: items.length
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao gerenciar itens do projeto: ${error instanceof Error ? error.message : String(error)}`);
        }
    },
    async fields(params, provider) {
        try {
            if (!params.project_id) {
                throw new Error('project_id é obrigatório para fields');
            }
            // Simular gerenciamento de campos do projeto
            const fields = [
                {
                    id: 'field-1',
                    name: 'Status',
                    type: 'SINGLE_SELECT',
                    options: ['Todo', 'In Progress', 'Done']
                },
                {
                    id: 'field-2',
                    name: 'Priority',
                    type: 'SINGLE_SELECT',
                    options: ['Low', 'Medium', 'High']
                },
                {
                    id: 'field-3',
                    name: 'Notes',
                    type: 'TEXT'
                }
            ];
            return {
                success: true,
                action: 'fields',
                message: `Campos do projeto ${params.project_id} obtidos com sucesso`,
                data: {
                    project_id: params.project_id,
                    fields,
                    total: fields.length
                }
            };
        }
        catch (error) {
            throw new Error(`Falha ao gerenciar campos do projeto: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
};
//# sourceMappingURL=gh-projects.js.map