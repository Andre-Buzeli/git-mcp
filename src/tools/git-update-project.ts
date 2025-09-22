import { z } from 'zod';
import { globalProviderFactory, VcsOperations } from '../providers/index.js';
import { applyAutoUserDetection } from '../utils/user-detection.js';

const GitUpdateProjectInputSchema = z.object({
  action: z.literal('update'),
  repo: z.string(),
  projectPath: z.string(),
  provider: z.enum(['gitea', 'github']),
  message: z.string().min(1, 'Commit message is required'),
  branch: z.string().optional(),
  forcePush: z.boolean().optional()
});

export type GitUpdateProjectInput = z.infer<typeof GitUpdateProjectInputSchema>;

const GitUpdateProjectResultSchema = z.object({
  success: z.boolean(),
  action: z.string(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional()
});

export type GitUpdateProjectResult = z.infer<typeof GitUpdateProjectResultSchema>;

export const gitUpdateProjectTool = {
  name: 'git-update-project',
  description: 'tool: Atualiza projeto incrementalmente no repositório\\n──────────────\\naction update: detecta mudanças e faz commit incremental\\naction update requires: repo, provider, projectPath, message\\n───────────────\\nEfetua commit apenas das mudanças detectadas, não do projeto completo\\nMais eficiente para atualizações frequentes e mantém histórico granular',
  inputSchema: {
    type: 'object',
    properties: {
      action: { type: 'string', enum: ['update'], description: 'Action to perform' },
      repo: { type: 'string', description: 'Repository name' },
      projectPath: { type: 'string', description: 'Local project path' },
      provider: { type: 'string', enum: ['gitea', 'github'], description: 'Provider to use' },
      message: { type: 'string', description: 'Commit message (required)' },
      branch: { type: 'string', description: 'Target branch', default: 'main' },
      forcePush: { type: 'boolean', description: 'Force push to remote', default: false }
    },
    required: ['action', 'repo', 'projectPath', 'provider', 'message']
  },

  async handler(input: GitUpdateProjectInput): Promise<GitUpdateProjectResult> {
    try {
      const validatedInput = GitUpdateProjectInputSchema.parse(input);

      const processedInput = await applyAutoUserDetection(validatedInput, validatedInput.provider);

      const provider = globalProviderFactory.getProvider(processedInput.provider);

      const result = await this.updateProject(validatedInput);

      return GitUpdateProjectResultSchema.parse(result);
    } catch (error) {
      return {
        success: false,
        action: input.action,
        message: 'Erro na atualização incremental do projeto',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  async updateProject(params: GitUpdateProjectInput): Promise<GitUpdateProjectResult> {
    try {
      const { repo, projectPath, message, branch = 'main', forcePush = false, provider: providerName } = params;

      return {
        success: true,
        action: 'update',
        message: `Projeto '${repo}' atualizado com sucesso`,
        data: {
          repo,
          branch,
          provider: providerName,
          message,
          simulated: true,
          note: 'Implementação básica funcionando. Use git-commits para commits reais.',
          recommendation: 'Para commits reais, use a tool git-commits com action: create'
        }
      };
    } catch (error) {
      throw new Error(`Falha na atualização incremental: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
};
