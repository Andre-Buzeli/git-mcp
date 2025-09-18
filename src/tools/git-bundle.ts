import { z } from 'zod';
import { runGitCommand } from '../utils/terminal-controller.js';

/**
 * Tool: git-bundle
 * 
 * DESCRIÇÃO:
 * Gerenciamento de bundles Git (GitHub + Gitea) com múltiplas ações
 * 
 * FUNCIONALIDADES:
 * - Criar bundle
 * - Verificar bundle
 * - Listar heads do bundle
 * - Unbundle
 * - Criar bundle incremental
 * - Criar bundle com tags
 * 
 * USO:
 * - Para transferir repositórios offline
 * - Para backup completo de repositórios
 * - Para sincronização sem rede
 * - Para distribuição de código
 * 
 * RECOMENDAÇÕES:
 * - Use para transferências offline
 * - Inclua tags quando necessário
 * - Verifique bundles antes de usar
 */

const GitBundleInputSchema = z.object({
  action: z.enum(['create', 'verify', 'list-heads', 'unbundle']),
  // owner: obtido automaticamente do provider,
  repo: z.string(),
  provider: z.enum(['gitea', 'github']).describe('Provider to use (gitea or github)'),
  projectPath: z.string().describe('Local project path for git operations'),
  
  // Para create
  bundle_file: z.string().optional(),
  commit_range: z.string().optional(),
  branch_name: z.string().optional(),
  
  // Para verify
  verify_bundle: z.string().optional(),
  
  // Para list-heads
  list_bundle: z.string().optional(),
  
  // Para unbundle
  unbundle_file: z.string().optional(),
  unbundle_path: z.string().optional(),
  
  // Opções
  all_branches: z.boolean().optional(),
  all_tags: z.boolean().optional(),
  all_remotes: z.boolean().optional(),
});

export type GitBundleInput = z.infer<typeof GitBundleInputSchema>;

const GitBundleResultSchema = z.object({
  success: z.boolean(),
  action: z.string(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional()
});

export type GitBundleResult = z.infer<typeof GitBundleResultSchema>;

export const gitBundleTool = {
  name: 'git-bundle',
  description: 'tool: Gerencia bundles Git para transferência offline de repositórios\n──────────────\naction create: cria bundle do repositório\naction create requires: repo, provider, projectPath, bundle_file, commit_range, branch_name, all_branches, all_tags, all_remotes\n───────────────\naction verify: verifica integridade do bundle\naction verify requires: repo, provider, projectPath, verify_bundle\n───────────────\naction list-heads: lista heads do bundle\naction list-heads requires: repo, provider, projectPath, list_bundle\n───────────────\naction unbundle: extrai bundle para repositório\naction unbundle requires: repo, provider, projectPath, unbundle_file, unbundle_path',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['create', 'verify', 'list-heads', 'unbundle'],
        description: 'Action to perform on bundles'
      },
      owner: { type: 'string', description: 'Repository owner' },
      repo: { type: 'string', description: 'Repository name' },
      provider: { type: 'string', enum: ['gitea', 'github'], description: 'Provider to use (gitea or github)' },
      projectPath: { type: 'string', description: 'Local project path for git operations' },
      bundle_file: { type: 'string', description: 'Bundle file path' },
      commit_range: { type: 'string', description: 'Commit range for bundle' },
      branch_name: { type: 'string', description: 'Branch name for bundle' },
      verify_bundle: { type: 'string', description: 'Bundle file to verify' },
      list_bundle: { type: 'string', description: 'Bundle file to list heads' },
      unbundle_file: { type: 'string', description: 'Bundle file to unbundle' },
      unbundle_path: { type: 'string', description: 'Path to unbundle to' },
      all_branches: { type: 'boolean', description: 'Include all branches' },
      all_tags: { type: 'boolean', description: 'Include all tags' },
      all_remotes: { type: 'boolean', description: 'Include all remotes' }
    },
    required: ['action', 'repo', 'provider', 'projectPath']
  },

  async handler(input: GitBundleInput): Promise<GitBundleResult> {
    try {
      const validatedInput = GitBundleInputSchema.parse(input);
      
      switch (validatedInput.action) {
        case 'create':
          return await this.create(validatedInput);
        case 'verify':
          return await this.verify(validatedInput);
        case 'list-heads':
          return await this.listHeads(validatedInput);
        case 'unbundle':
          return await this.unbundle(validatedInput);
        default:
          throw new Error(`Ação não suportada: ${validatedInput.action}`);
      }
    } catch (error) {
      return {
        success: false,
        action: input.action,
        message: 'Erro na operação de bundle',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  async create(params: GitBundleInput): Promise<GitBundleResult> {
    try {
      if (!params.bundle_file) {
        throw new Error('bundle_file é obrigatório para create');
      }

      let gitCommand = `bundle create ${params.bundle_file}`;
      
      if (params.all_branches) {
        gitCommand += ' --all';
      } else if (params.all_tags) {
        gitCommand += ' --all-tags';
      } else if (params.all_remotes) {
        gitCommand += ' --all-remotes';
      } else if (params.commit_range) {
        gitCommand += ` ${params.commit_range}`;
      } else if (params.branch_name) {
        gitCommand += ` ${params.branch_name}`;
      } else {
        gitCommand += ' HEAD';
      }

      const result = await runGitCommand(
        gitCommand,
        params.projectPath,
        'Criando bundle'
      );

      if (result.exitCode !== 0) {
        throw new Error(`Falha ao criar bundle: ${result.output}`);
      }

      return {
        success: true,
        action: 'create',
        message: `Bundle criado com sucesso: ${params.bundle_file}`,
        data: {
          bundle_file: params.bundle_file,
          commit_range: params.commit_range,
          branch_name: params.branch_name,
          all_branches: params.all_branches,
          all_tags: params.all_tags,
          all_remotes: params.all_remotes,
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao criar bundle: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async verify(params: GitBundleInput): Promise<GitBundleResult> {
    try {
      if (!params.verify_bundle) {
        throw new Error('verify_bundle é obrigatório para verify');
      }

      const result = await runGitCommand(
        `bundle verify ${params.verify_bundle}`,
        params.projectPath,
        'Verificando bundle'
      );

      const isValid = result.exitCode === 0;

      return {
        success: true,
        action: 'verify',
        message: `Bundle ${isValid ? 'válido' : 'inválido'}: ${params.verify_bundle}`,
        data: {
          bundle: params.verify_bundle,
          valid: isValid,
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao verificar bundle: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async listHeads(params: GitBundleInput): Promise<GitBundleResult> {
    try {
      if (!params.list_bundle) {
        throw new Error('list_bundle é obrigatório para list-heads');
      }

      const result = await runGitCommand(
        `bundle list-heads ${params.list_bundle}`,
        params.projectPath,
        'Listando heads do bundle'
      );

      if (result.exitCode !== 0) {
        throw new Error(`Falha ao listar heads do bundle: ${result.output}`);
      }

      const heads = result.output.split('\n')
        .filter((line: string) => line.trim())
        .map((line: string) => {
          const parts = line.trim().split(' ');
          return {
            commit: parts[0],
            ref: parts[1] || 'HEAD'
          };
        });

      return {
        success: true,
        action: 'list-heads',
        message: `Heads do bundle listados com sucesso: ${params.list_bundle}`,
        data: {
          bundle: params.list_bundle,
          heads,
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao listar heads do bundle: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async unbundle(params: GitBundleInput): Promise<GitBundleResult> {
    try {
      if (!params.unbundle_file) {
        throw new Error('unbundle_file é obrigatório para unbundle');
      }

      const unbundlePath = params.unbundle_path || params.projectPath;
      const gitCommand = `bundle unbundle ${params.unbundle_file}`;

      const result = await runGitCommand(
        gitCommand,
        unbundlePath,
        'Unbundling bundle'
      );

      if (result.exitCode !== 0) {
        throw new Error(`Falha ao unbundle: ${result.output}`);
      }

      return {
        success: true,
        action: 'unbundle',
        message: `Bundle unbundled com sucesso: ${params.unbundle_file}`,
        data: {
          bundle_file: params.unbundle_file,
          unbundle_path: unbundlePath,
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao unbundle: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
};
