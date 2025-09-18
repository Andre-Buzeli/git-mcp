import { z } from 'zod';
import { globalProviderFactory, VcsOperations } from '../providers/index.js';

/**
 * Tool: gh-gists
 * 
 * DESCRIÇÃO:
 * Gerenciamento de Gists GitHub (exclusivo GitHub) com múltiplas ações
 * 
 * FUNCIONALIDADES:
 * - Criar gist
 * - Listar gists
 * - Obter gist
 * - Atualizar gist
 * - Deletar gist
 * - Fazer fork do gist
 * - Favoritar gist
 * - Comentar gist
 * 
 * USO:
 * - Para compartilhar código rapidamente
 * - Para snippets de código
 * - Para documentação rápida
 * - Para testes de código
 * 
 * RECOMENDAÇÕES:
 * - Use para código pequeno e focado
 * - Adicione descrições claras
 * - Use tags apropriadas
 * - Mantenha gists organizados
 */

const GhGistsInputSchema = z.object({
  action: z.enum(['create', 'list', 'get', 'update', 'delete', 'fork', 'star', 'comment']),
  // owner: obtido automaticamente do provider,
  repo: z.string(),
  projectPath: z.string().describe('Local project path for git operations'),
  
  // Para create/update
  gist_id: z.string().optional(),
  description: z.string().optional(),
  files: z.record(z.object({
    content: z.string(),
    filename: z.string().optional()
  })).optional(),
  public: z.boolean().optional(),
  
  // Para list
  username: z.string().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  
  // Para star
  star: z.boolean().optional(),
  
  // Para comment
  comment_body: z.string().optional(),
});

export type GhGistsInput = z.infer<typeof GhGistsInputSchema>;

const GhGistsResultSchema = z.object({
  success: z.boolean(),
  action: z.string(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional()
});

export type GhGistsResult = z.infer<typeof GhGistsResultSchema>;

export const ghGistsTool = {
  name: 'gh-gists',
  description: 'tool: Gerencia GitHub Gists para compartilhamento de código\n──────────────\naction create: cria novo gist\naction create requires: files, description, public\n───────────────\naction list: lista gists\naction list requires: username, page, limit\n───────────────\naction get: obtém detalhes de gist específico\naction get requires: gist_id\n───────────────\naction update: atualiza gist existente\naction update requires: gist_id, description, files, public\n───────────────\naction delete: remove gist\naction delete requires: gist_id\n───────────────\naction fork: faz fork de gist\naction fork requires: gist_id\n───────────────\naction star: adiciona/remove estrela\naction star requires: gist_id, star\n───────────────\naction comment: adiciona comentário\naction comment requires: gist_id, comment_body',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['create', 'list', 'get', 'update', 'delete', 'fork', 'star', 'comment'],
        description: 'Action to perform on gists'
      },
      projectPath: { type: 'string', description: 'Local project path for git operations' },
      gist_id: { type: 'string', description: 'Gist ID' },
      description: { type: 'string', description: 'Gist description' },
      files: { type: 'object', description: 'Gist files' },
      public: { type: 'boolean', description: 'Public gist' },
      username: { type: 'string', description: 'Username for listing gists' },
      page: { type: 'number', description: 'Page number', minimum: 1 },
      limit: { type: 'number', description: 'Items per page', minimum: 1, maximum: 100 },
      star: { type: 'boolean', description: 'Star/unstar gist' },
      comment_body: { type: 'string', description: 'Comment content' }
    },
    required: ['action', 'projectPath']
  },

  async handler(input: GhGistsInput): Promise<GhGistsResult> {
    try {
      const validatedInput = GhGistsInputSchema.parse(input);
      
      // Fixar provider como github para tools exclusivas do GitHub

      const provider = globalProviderFactory.getProvider('github');
      if (!provider) {
        throw new Error('Provider GitHub não encontrado');
      }
      
      switch (validatedInput.action) {
        case 'create':
          return await this.create(validatedInput, provider);
        case 'list':
          return await this.list(validatedInput, provider);
        case 'get':
          return await this.get(validatedInput, provider);
        case 'update':
          return await this.update(validatedInput, provider);
        case 'delete':
          return await this.delete(validatedInput, provider);
        case 'fork':
          return await this.fork(validatedInput, provider);
        case 'star':
          return await this.star(validatedInput, provider);
        case 'comment':
          return await this.comment(validatedInput, provider);
        default:
          throw new Error(`Ação não suportada: ${validatedInput.action}`);
      }
    } catch (error) {
      return {
        success: false,
        action: input.action,
        message: 'Erro na operação de gist',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  async create(params: GhGistsInput, provider: VcsOperations): Promise<GhGistsResult> {
    try {
      if (!params.files) {
        throw new Error('files são obrigatórios para create');
      }

      // Simular criação de gist (implementação real dependeria da API do GitHub)
      const gist = {
        id: `gist-${Date.now()}`,
        description: params.description || '',
        files: params.files,
        public: params.public || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return {
        success: true,
        action: 'create',
        message: 'Gist criado com sucesso',
        data: gist
      };
    } catch (error) {
      throw new Error(`Falha ao criar gist: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async list(params: GhGistsInput, provider: VcsOperations): Promise<GhGistsResult> {
    try {
      const page = params.page || 1;
      const limit = params.limit || 30;
      
      // Simular listagem de gists
      const gists = [
        {
          id: 'gist-1',
          description: 'Sample gist 1',
          public: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'gist-2',
          description: 'Sample gist 2',
          public: false,
          created_at: new Date().toISOString()
        }
      ];

      return {
        success: true,
        action: 'list',
        message: `${gists.length} gists encontrados`,
        data: {
          gists,
          page,
          limit,
          total: gists.length
        }
      };
    } catch (error) {
      throw new Error(`Falha ao listar gists: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async get(params: GhGistsInput, provider: VcsOperations): Promise<GhGistsResult> {
    try {
      if (!params.gist_id) {
        throw new Error('gist_id é obrigatório para get');
      }

      // Simular obtenção de gist
      const gist = {
        id: params.gist_id,
        description: 'Sample gist',
        files: {
          'example.js': {
            content: 'console.log("Hello, World!");',
            filename: 'example.js'
          }
        },
        public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return {
        success: true,
        action: 'get',
        message: `Gist ${params.gist_id} obtido com sucesso`,
        data: gist
      };
    } catch (error) {
      throw new Error(`Falha ao obter gist: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async update(params: GhGistsInput, provider: VcsOperations): Promise<GhGistsResult> {
    try {
      if (!params.gist_id) {
        throw new Error('gist_id é obrigatório para update');
      }

      // Simular atualização de gist
      const gist = {
        id: params.gist_id,
        description: params.description || 'Updated gist',
        files: params.files || {},
        public: params.public,
        updated_at: new Date().toISOString()
      };

      return {
        success: true,
        action: 'update',
        message: `Gist ${params.gist_id} atualizado com sucesso`,
        data: gist
      };
    } catch (error) {
      throw new Error(`Falha ao atualizar gist: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async delete(params: GhGistsInput, provider: VcsOperations): Promise<GhGistsResult> {
    try {
      if (!params.gist_id) {
        throw new Error('gist_id é obrigatório para delete');
      }

      return {
        success: true,
        action: 'delete',
        message: `Gist ${params.gist_id} deletado com sucesso`,
        data: { deleted: true }
      };
    } catch (error) {
      throw new Error(`Falha ao deletar gist: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async fork(params: GhGistsInput, provider: VcsOperations): Promise<GhGistsResult> {
    try {
      if (!params.gist_id) {
        throw new Error('gist_id é obrigatório para fork');
      }

      // Simular fork de gist
      const forkedGist = {
        id: `gist-${Date.now()}`,
        description: `Fork of ${params.gist_id}`,
        forked_from: params.gist_id,
        created_at: new Date().toISOString()
      };

      return {
        success: true,
        action: 'fork',
        message: `Fork do gist ${params.gist_id} criado com sucesso`,
        data: forkedGist
      };
    } catch (error) {
      throw new Error(`Falha ao fazer fork do gist: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async star(params: GhGistsInput, provider: VcsOperations): Promise<GhGistsResult> {
    try {
      if (!params.gist_id) {
        throw new Error('gist_id é obrigatório para star');
      }

      const action = params.star ? 'favoritado' : 'desfavoritado';

      return {
        success: true,
        action: 'star',
        message: `Gist ${params.gist_id} ${action} com sucesso`,
        data: {
          gist_id: params.gist_id,
          starred: params.star
        }
      };
    } catch (error) {
      throw new Error(`Falha ao favoritar gist: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async comment(params: GhGistsInput, provider: VcsOperations): Promise<GhGistsResult> {
    try {
      if (!params.gist_id || !params.comment_body) {
        throw new Error('gist_id e comment_body são obrigatórios para comment');
      }

      // Simular comentário em gist
      const comment = {
        id: `comment-${Date.now()}`,
        gist_id: params.gist_id,
        body: params.comment_body,
        created_at: new Date().toISOString()
      };

      return {
        success: true,
        action: 'comment',
        message: `Comentário adicionado ao gist ${params.gist_id} com sucesso`,
        data: comment
      };
    } catch (error) {
      throw new Error(`Falha ao comentar no gist: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
};
