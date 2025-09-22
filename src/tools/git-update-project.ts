import { z } from 'zod';
import { globalProviderFactory, VcsOperations } from '../providers/index.js';
import { applyAutoUserDetection } from '../utils/user-detection.js';
import { GitOperations } from '../utils/git-operations.js';

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
  description: 'tool: Atualiza projeto incrementalmente no repositório\\n──────────────\\naction update: detecta mudanças, faz commit e push automático\\naction update requires: repo, provider, projectPath, message\\n───────────────\\nCOMMITS REAIS: Detecta mudanças no diretório local, faz git add, commit e push\\nFunciona apenas em repositórios Git locais com mudanças pendentes\\nPush automático para remote configurado (origin)',
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


      // Inicializar operações Git locais
      const gitOps = new GitOperations(projectPath);

      // Verificar se é um repositório Git
      const isGitRepo = await gitOps.isGitRepository();
      if (!isGitRepo) {
        throw new Error(`Diretório '${projectPath}' não é um repositório Git válido`);
      }

      // Verificar status para ver se há mudanças
      const statusResult = await gitOps.status({ porcelain: true });
      if (!statusResult.success) {
        throw new Error(`Falha ao verificar status do Git: ${statusResult.error}`);
      }

      // Verificar se há mudanças para commitar
      const hasChanges = statusResult.output.trim().length > 0;
      if (!hasChanges) {
        return {
          success: true,
          action: 'update',
          message: `Nenhuma mudança detectada no projeto '${repo}'`,
          data: {
            repo,
            branch,
            provider: providerName,
            message,
            changesDetected: false,
            filesChanged: 0,
            implementation: 'REAL_GIT_OPERATIONS_v2.38.0',
            note: 'Nenhuma mudança para commitar'
          }
        };
      }

      // Contar arquivos modificados
      const changedFiles = statusResult.output.trim().split('\n').filter(line => line.trim().length > 0);
      const filesCount = changedFiles.length;

      // Adicionar arquivos ao staging
      const addResult = await gitOps.addFiles(['.']);
      if (!addResult.success) {
        throw new Error(`Falha ao adicionar arquivos: ${addResult.error}`);
      }

      // Verificar se há algo no staging após add
      const statusAfterAdd = await gitOps.status({ porcelain: true });
      if (!statusAfterAdd.success) {
        throw new Error(`Falha ao verificar status após add: ${statusAfterAdd.error}`);
      }

      const hasStagedChanges = statusAfterAdd.output.includes('A') || statusAfterAdd.output.includes('M') || statusAfterAdd.output.includes('D');

      if (!hasStagedChanges) {
        return {
          success: true,
          action: 'update',
          message: `Arquivos adicionados mas nenhuma mudança válida para commit no projeto '${repo}'`,
          data: {
            repo,
            branch,
            provider: providerName,
            message,
            changesDetected: true,
            filesChanged: filesCount,
            stagedChanges: false,
            implementation: 'REAL_GIT_OPERATIONS_v2.38.0',
            note: 'Arquivos adicionados mas não há mudanças válidas para commit'
          }
        };
      }

      // Fazer commit
      const commitResult = await gitOps.commit(message);
      if (!commitResult.success) {
        throw new Error(`Falha no commit: ${commitResult.error}`);
      }

      // Tentar fazer push para o remote
      let pushSuccessful = false;
      let pushError = '';

      try {
        // Verificar se há remote configurado
        const remoteResult = await gitOps.remote('get-url', 'origin');
        if (remoteResult.success) {
          // Tentar push
          const pushOptions: any = {};
          if (forcePush) {
            pushOptions.force = true;
          }

          const pushResult = await gitOps.push('origin', branch, pushOptions);
          pushSuccessful = pushResult.success;
          if (!pushSuccessful) {
            pushError = pushResult.error || 'Erro desconhecido no push';
          }
        } else {
          pushError = 'Nenhum remote configurado (origin)';
        }
      } catch (pushErr) {
        pushError = pushErr instanceof Error ? pushErr.message : String(pushErr);
      }

      // Obter informações do commit criado
      const logResult = await gitOps.log({ maxCount: 1, oneline: true });
      const commitInfo = logResult.success ? logResult.output : 'Commit criado mas não foi possível obter informações';

      return {
        success: true,
        action: 'update',
        message: `Projeto '${repo}' atualizado com sucesso${pushSuccessful ? ' e enviado para remote' : ''}`,
        data: {
          repo,
          branch,
          provider: providerName,
          message,
          changesDetected: true,
          filesChanged: filesCount,
          stagedChanges: true,
          commitCreated: true,
          commitInfo,
          pushSuccessful,
          pushError: pushSuccessful ? undefined : pushError,
          note: pushSuccessful ?
            'Commit criado e enviado para remote com sucesso' :
            `Commit criado localmente. Push falhou: ${pushError}. Use git push manualmente.`
        }
      };

    } catch (error) {
      return {
        success: false,
        action: 'update',
        message: 'Erro na atualização incremental do projeto',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};
