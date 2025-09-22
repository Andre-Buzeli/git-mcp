import { z } from 'zod';
import { globalProviderFactory, VcsOperations } from '../providers/index.js';
import { applyAutoUserDetection } from '../utils/user-detection.js';

// Schema de validação para entrada
const GitProjectsInputSchema = z.object({
  action: z.enum(['list', 'get', 'create', 'update', 'delete', 'addItem', 'updateItem', 'deleteItem', 'listItems']),
  repo: z.string(),
  provider: z.enum(['gitea', 'github']),
  projectPath: z.string(),
  project_id: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  updates: z.object({}).passthrough().optional(),
  item: z.object({}).passthrough().optional(),
  item_id: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10)
});

type GitProjectsInput = z.infer<typeof GitProjectsInputSchema>;

interface GitProjectsResult {
  success: boolean;
  action: string;
  message: string;
  data?: any;
  error?: string;
}

export const gitProjectsTool = {
  name: 'git-projects',
  description: 'tool: Gerencia projetos Git para organização e planejamento\n──────────────\naction list: lista projetos do repositório\naction list requires: repo, provider, projectPath\n───────────────\naction get: obtém detalhes de projeto específico\naction get requires: repo, project_id, provider, projectPath\n───────────────\naction create: cria novo projeto\naction create requires: repo, name, description, provider, projectPath\n───────────────\naction update: atualiza projeto existente\naction update requires: repo, project_id, updates, provider, projectPath\n───────────────\naction delete: remove projeto\naction delete requires: repo, project_id, provider, projectPath\n───────────────\naction addItem: adiciona item ao projeto\naction addItem requires: repo, project_id, item, provider, projectPath\n───────────────\naction updateItem: atualiza item do projeto\naction updateItem requires: repo, project_id, item_id, updates, provider, projectPath\n───────────────\naction deleteItem: remove item do projeto\naction deleteItem requires: repo, project_id, item_id, provider, projectPath\n───────────────\naction listItems: lista itens do projeto\naction listItems requires: repo, project_id, provider, projectPath',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['list', 'get', 'create', 'update', 'delete', 'addItem', 'updateItem', 'deleteItem', 'listItems'],
        description: 'Action to perform on projects'
      },
      repo: {
        type: 'string',
        description: 'Repository name'
      },
      provider: {
        type: 'string',
        enum: ['gitea', 'github'],
        description: 'Provider to use (gitea or github)'
      },
      projectPath: {
        type: 'string',
        description: 'Local project path for git operations'
      },
      project_id: {
        type: 'string',
        description: 'Project ID for get/update/delete operations'
      },
      name: {
        type: 'string',
        description: 'Project name for creation'
      },
      description: {
        type: 'string',
        description: 'Project description'
      },
      updates: {
        type: 'object',
        description: 'Updates to apply to project'
      },
      item: {
        type: 'object',
        description: 'Item to add to project'
      },
      item_id: {
        type: 'string',
        description: 'Item ID for update/delete operations'
      },
      page: {
        type: 'number',
        description: 'Page number',
        minimum: 1
      },
      limit: {
        type: 'number',
        description: 'Items per page',
        minimum: 1,
        maximum: 100
      }
    },
    required: ['action', 'repo', 'provider', 'projectPath']
  },

  async handler(input: GitProjectsInput): Promise<GitProjectsResult> {
    try {
      const validatedInput = GitProjectsInputSchema.parse(input);
      
      // Aplicar auto-detecção apenas para owner/username dentro do provider especificado
      const processedInput = await applyAutoUserDetection(validatedInput, validatedInput.provider);

      // Usar o provider especificado pelo usuário
      const provider = globalProviderFactory.getProvider(processedInput.provider);

      switch (processedInput.action) {
        case 'list':
          return await listProjects(provider, processedInput.repo, processedInput.page, processedInput.limit);
        
        case 'get':
          if (!processedInput.project_id) {
            throw new Error('project_id is required for get action');
          }
          return await getProject(provider, processedInput.repo, processedInput.project_id);
        
        case 'create':
          if (!processedInput.name || !processedInput.description) {
            throw new Error('name and description are required for create action');
          }
          return await createProject(provider, processedInput.repo, processedInput.name, processedInput.description);
        
        case 'update':
          if (!processedInput.project_id || !processedInput.updates) {
            throw new Error('project_id and updates are required for update action');
          }
          return await updateProject(provider, processedInput.repo, processedInput.project_id, processedInput.updates);
        
        case 'delete':
          if (!processedInput.project_id) {
            throw new Error('project_id is required for delete action');
          }
          return await deleteProject(provider, processedInput.repo, processedInput.project_id);
        
        case 'addItem':
          if (!processedInput.project_id || !processedInput.item) {
            throw new Error('project_id and item are required for addItem action');
          }
          return await addProjectItem(provider, processedInput.repo, processedInput.project_id, processedInput.item);
        
        case 'updateItem':
          if (!processedInput.project_id || !processedInput.item_id || !processedInput.updates) {
            throw new Error('project_id, item_id and updates are required for updateItem action');
          }
          return await updateProjectItem(provider, processedInput.repo, processedInput.project_id, processedInput.item_id, processedInput.updates);
        
        case 'deleteItem':
          if (!processedInput.project_id || !processedInput.item_id) {
            throw new Error('project_id and item_id are required for deleteItem action');
          }
          return await deleteProjectItem(provider, processedInput.repo, processedInput.project_id, processedInput.item_id);
        
        case 'listItems':
          if (!processedInput.project_id) {
            throw new Error('project_id is required for listItems action');
          }
          return await listProjectItems(provider, processedInput.repo, processedInput.project_id, processedInput.page, processedInput.limit);
        
        default:
          throw new Error(`Unknown action: ${processedInput.action}`);
      }
    } catch (error) {
      return {
        success: false,
        action: input.action,
        message: 'Erro na operação de projetos',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};

async function listProjects(provider: any, repo: string, page: number, limit: number): Promise<any> {
  try {
    const owner = (await provider.getCurrentUser()).login;
    const projects = await provider.listProjects(owner, repo, page, limit);
    
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
  } catch (error) {
    throw new Error(`Falha ao listar projetos: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function getProject(provider: any, repo: string, projectId: string): Promise<any> {
  try {
    const owner = (await provider.getCurrentUser()).login;
    const project = await provider.getProject(owner, repo, projectId);
    
    return {
      success: true,
      action: 'get',
      message: 'Projeto obtido com sucesso',
      data: {
        project
      }
    };
  } catch (error) {
    throw new Error(`Falha ao obter projeto: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function createProject(provider: any, repo: string, name: string, description: string): Promise<any> {
  try {
    const owner = (await provider.getCurrentUser()).login;
    const project = await provider.createProject(owner, repo, {
      name,
      description,
      state: 'open',
      body: description
    });
    
    return {
      success: true,
      action: 'create',
      message: `Projeto '${name}' criado com sucesso`,
      data: {
        project
      }
    };
  } catch (error) {
    throw new Error(`Falha ao criar projeto: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function updateProject(provider: any, repo: string, projectId: string, updates: any): Promise<any> {
  try {
    const owner = (await provider.getCurrentUser()).login;
    const project = await provider.updateProject(owner, repo, projectId, updates);
    
    return {
      success: true,
      action: 'update',
      message: 'Projeto atualizado com sucesso',
      data: {
        project
      }
    };
  } catch (error) {
    throw new Error(`Falha ao atualizar projeto: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function deleteProject(provider: any, repo: string, projectId: string): Promise<any> {
  try {
    const owner = (await provider.getCurrentUser()).login;
    await provider.deleteProject(owner, repo, projectId);
    
    return {
      success: true,
      action: 'delete',
      message: 'Projeto deletado com sucesso',
      data: {
        deleted: true
      }
    };
  } catch (error) {
    throw new Error(`Falha ao deletar projeto: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function addProjectItem(provider: any, repo: string, projectId: string, item: any): Promise<any> {
  try {
    const owner = (await provider.getCurrentUser()).login;
    const projectItem = await provider.addProjectItem(owner, repo, projectId, item);
    
    return {
      success: true,
      action: 'addItem',
      message: 'Item adicionado ao projeto com sucesso',
      data: {
        item: projectItem
      }
    };
  } catch (error) {
    throw new Error(`Falha ao adicionar item: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function updateProjectItem(provider: any, repo: string, projectId: string, itemId: string, updates: any): Promise<any> {
  try {
    const owner = (await provider.getCurrentUser()).login;
    const projectItem = await provider.updateProjectItem(owner, repo, projectId, itemId, updates);
    
    return {
      success: true,
      action: 'updateItem',
      message: 'Item do projeto atualizado com sucesso',
      data: {
        item: projectItem
      }
    };
  } catch (error) {
    throw new Error(`Falha ao atualizar item: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function deleteProjectItem(provider: any, repo: string, projectId: string, itemId: string): Promise<any> {
  try {
    const owner = (await provider.getCurrentUser()).login;
    await provider.deleteProjectItem(owner, repo, projectId, itemId);
    
    return {
      success: true,
      action: 'deleteItem',
      message: 'Item do projeto deletado com sucesso',
      data: {
        deleted: true
      }
    };
  } catch (error) {
    throw new Error(`Falha ao deletar item: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function listProjectItems(provider: any, repo: string, projectId: string, page: number, limit: number): Promise<any> {
  try {
    const owner = (await provider.getCurrentUser()).login;
    const items = await provider.listProjectItems(owner, repo, projectId, page, limit);
    
    return {
      success: true,
      action: 'listItems',
      message: `${items.length} itens encontrados no projeto`,
      data: {
        items,
        projectId,
        page,
        limit,
        total: items.length
      }
    };
  } catch (error) {
    throw new Error(`Falha ao listar itens: ${error instanceof Error ? error.message : String(error)}`);
  }
}
