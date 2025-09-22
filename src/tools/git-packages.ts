import { z } from 'zod';
import { globalProviderFactory, VcsOperations } from '../providers/index.js';
import { applyAutoUserDetection } from '../utils/user-detection.js';

// Schema de validação para entrada
const GitPackagesInputSchema = z.object({
  action: z.enum(['list', 'get', 'create', 'update', 'delete', 'publish', 'download']),
  repo: z.string(),
  provider: z.enum(['gitea', 'github']),
  projectPath: z.string(),
  package_id: z.string().optional(),
  name: z.string().optional(),
  version: z.string().optional(),
  description: z.string().optional(),
  updates: z.object({}).passthrough().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10)
});

type GitPackagesInput = z.infer<typeof GitPackagesInputSchema>;

interface GitPackagesResult {
  success: boolean;
  action: string;
  message: string;
  data?: any;
  error?: string;
}

export const gitPackagesTool = {
  name: 'git-packages',
  description: 'tool: Gerencia pacotes Git para distribuição e versionamento\n──────────────\naction list: lista pacotes do repositório\naction list requires: repo, provider, projectPath\n───────────────\naction get: obtém detalhes de pacote específico\naction get requires: repo, package_id, provider, projectPath\n───────────────\naction create: cria novo pacote\naction create requires: repo, name, version, description, provider, projectPath\n───────────────\naction update: atualiza pacote existente\naction update requires: repo, package_id, updates, provider, projectPath\n───────────────\naction delete: remove pacote\naction delete requires: repo, package_id, provider, projectPath\n───────────────\naction publish: publica pacote\naction publish requires: repo, package_id, provider, projectPath\n───────────────\naction download: baixa pacote\naction download requires: repo, package_id, provider, projectPath',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['list', 'get', 'create', 'update', 'delete', 'publish', 'download'],
        description: 'Action to perform on packages'
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
      package_id: {
        type: 'string',
        description: 'Package ID for get/update/delete operations'
      },
      name: {
        type: 'string',
        description: 'Package name for creation'
      },
      version: {
        type: 'string',
        description: 'Package version'
      },
      description: {
        type: 'string',
        description: 'Package description'
      },
      updates: {
        type: 'object',
        description: 'Updates to apply to package'
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

  async handler(input: GitPackagesInput): Promise<GitPackagesResult> {
    try {
      const validatedInput = GitPackagesInputSchema.parse(input);

      // Aplicar auto-detecção apenas para owner/username dentro do provider especificado
      const processedInput = await applyAutoUserDetection(validatedInput, validatedInput.provider);

      // Usar o provider especificado pelo usuário
      const provider = globalProviderFactory.getProvider(processedInput.provider);

      switch (processedInput.action) {
        case 'list':
          return await listPackages(provider, processedInput.repo, processedInput.page, processedInput.limit);
        
        case 'get':
          if (!processedInput.package_id) {
            throw new Error('package_id is required for get action');
          }
          return await getPackage(provider, processedInput.repo, processedInput.package_id);
        
        case 'create':
          if (!processedInput.name || !processedInput.version || !processedInput.description) {
            throw new Error('name, version, and description are required for create action');
          }
          return await createPackage(provider, processedInput.repo, processedInput.name, processedInput.version, processedInput.description);
        
        case 'update':
          if (!processedInput.package_id || !processedInput.updates) {
            throw new Error('package_id and updates are required for update action');
          }
          return await updatePackage(provider, processedInput.repo, processedInput.package_id, processedInput.updates);
        
        case 'delete':
          if (!processedInput.package_id) {
            throw new Error('package_id is required for delete action');
          }
          return await deletePackage(provider, processedInput.repo, processedInput.package_id);
        
        case 'publish':
          if (!processedInput.package_id) {
            throw new Error('package_id is required for publish action');
          }
          return await publishPackage(provider, processedInput.repo, processedInput.package_id);
        
        case 'download':
          if (!processedInput.package_id) {
            throw new Error('package_id is required for download action');
          }
          return await downloadPackage(provider, processedInput.repo, processedInput.package_id);

        default:
          throw new Error(`Unknown action: ${processedInput.action}`);
      }
    } catch (error) {
      return {
        success: false,
        action: input.action,
        message: 'Erro na operação de pacotes',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};

async function listPackages(provider: any, repo: string, page: number, limit: number): Promise<any> {
  try {
    const owner = (await provider.getCurrentUser()).login;
    const packages = await provider.listPackages(owner, repo, page, limit);

    return {
      success: true,
      action: 'list',
      message: `${packages.length} pacotes encontrados`,
      data: {
        packages,
        page,
        limit,
        total: packages.length
      }
    };
  } catch (error) {
    throw new Error(`Falha ao listar pacotes: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function getPackage(provider: any, repo: string, packageId: string): Promise<any> {
  try {
    const owner = (await provider.getCurrentUser()).login;
    const packageData = await provider.getPackage(owner, repo, packageId);
    
    return {
      success: true,
      action: 'get',
      message: 'Pacote obtido com sucesso',
      data: {
        package: packageData
      }
    };
  } catch (error) {
    throw new Error(`Falha ao obter pacote: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function createPackage(provider: any, repo: string, name: string, version: string, description: string): Promise<any> {
  try {
    const owner = (await provider.getCurrentUser()).login;
    const packageData = await provider.createPackage(owner, repo, {
      name,
      version,
      description,
      type: 'npm' // Default type, can be extended
    });
    
    return {
      success: true,
      action: 'create',
      message: `Pacote '${name}' criado com sucesso`,
      data: {
        package: packageData
      }
    };
  } catch (error) {
    throw new Error(`Falha ao criar pacote: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function updatePackage(provider: any, repo: string, packageId: string, updates: any): Promise<any> {
  try {
    const owner = (await provider.getCurrentUser()).login;
    const packageData = await provider.updatePackage(owner, repo, packageId, updates);
    
    return {
      success: true,
      action: 'update',
      message: 'Pacote atualizado com sucesso',
      data: {
        package: packageData
      }
    };
  } catch (error) {
    throw new Error(`Falha ao atualizar pacote: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function deletePackage(provider: any, repo: string, packageId: string): Promise<any> {
  try {
    const owner = (await provider.getCurrentUser()).login;
    await provider.deletePackage(owner, repo, packageId);
    
    return {
      success: true,
      action: 'delete',
      message: 'Pacote deletado com sucesso',
      data: {
        deleted: true
      }
    };
  } catch (error) {
    throw new Error(`Falha ao deletar pacote: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function publishPackage(provider: any, repo: string, packageId: string): Promise<any> {
  try {
    const owner = (await provider.getCurrentUser()).login;
    const result = await provider.publishPackage(owner, repo, packageId);
    
    return {
      success: true,
      action: 'publish',
      message: 'Pacote publicado com sucesso',
      data: {
        published: true,
        result
      }
    };
  } catch (error) {
    throw new Error(`Falha ao publicar pacote: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function downloadPackage(provider: any, repo: string, packageId: string): Promise<any> {
  try {
    const owner = (await provider.getCurrentUser()).login;
    const downloadUrl = await provider.downloadPackage(owner, repo, packageId);

    return {
      success: true,
      action: 'download',
      message: 'URL de download obtida com sucesso',
      data: {
        downloadUrl
      }
    };
  } catch (error) {
    throw new Error(`Falha ao obter download: ${error instanceof Error ? error.message : String(error)}`);
  }
}
