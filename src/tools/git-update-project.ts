import { z } from 'zod';
import { globalProviderFactory, VcsOperations } from '../providers/index.js';
import { applyAutoUserDetection } from '../utils/user-detection.js';
import { GitOperations } from '../utils/git-operations.js';

const GitUpdateProjectInputSchema = z.discriminatedUnion('action', [
  // Action: init - upload inicial completo (substitui upload-project)
  z.object({
    action: z.literal('init'),
    repo: z.string(),
    projectPath: z.string(),
    provider: z.enum(['gitea', 'github']),
    message: z.string().min(1, 'Commit message is required'),
    branch: z.string().optional(),
    createRepo: z.boolean().optional(),
    forcePush: z.boolean().optional(),
    granular: z.boolean().optional() // commits granulares por tipo de arquivo
  }),

  // Action: update - commit incremental
  z.object({
    action: z.literal('update'),
    repo: z.string(),
    projectPath: z.string(),
    provider: z.enum(['gitea', 'github']),
    message: z.string().min(1, 'Commit message is required'),
    branch: z.string().optional(),
    forcePush: z.boolean().optional()
  }),

  // Action: status - verificar status do repositório
  z.object({
    action: z.literal('status'),
    projectPath: z.string(),
    detailed: z.boolean().optional()
  }),

  // Action: diff - mostrar diferenças
  z.object({
    action: z.literal('diff'),
    projectPath: z.string(),
    staged: z.boolean().optional(),
    nameOnly: z.boolean().optional(),
    commit: z.string().optional()
  }),

  // Action: log - histórico de commits
  z.object({
    action: z.literal('log'),
    projectPath: z.string(),
    maxCount: z.number().optional(),
    oneline: z.boolean().optional(),
    branch: z.string().optional()
  }),

  // Action: reset - desfazer mudanças
  z.object({
    action: z.literal('reset'),
    projectPath: z.string(),
    mode: z.enum(['soft', 'mixed', 'hard']).optional(),
    commit: z.string().optional()
  }),

  // Action: stash - gerenciar mudanças temporárias
  z.object({
    action: z.literal('stash'),
    projectPath: z.string(),
    operation: z.enum(['save', 'pop', 'apply', 'list', 'drop', 'clear']).optional(),
    message: z.string().optional()
  }),

  // Action: pull - atualizar do remoto
  z.object({
    action: z.literal('pull'),
    projectPath: z.string(),
    branch: z.string().optional()
  }),

  // Action: sync - sincronização completa (pull + commit + push)
  z.object({
    action: z.literal('sync'),
    repo: z.string(),
    projectPath: z.string(),
    provider: z.enum(['gitea', 'github']),
    message: z.string().min(1, 'Commit message is required'),
    branch: z.string().optional(),
    forcePush: z.boolean().optional()
  })
]);

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
  description: 'tool: Gerenciamento COMPLETO de projetos Git (local + remoto)\\n──────────────\\n9 ACTIONS DISPONÍVEIS:\\n• init: UPLOAD INICIAL completo (substitui upload-project)\\n• update: Commit incremental automático\\n• status: Verificar status do repositório\\n• diff: Mostrar diferenças entre versões\\n• log: Histórico de commits\\n• reset: Desfazer mudanças\\n• stash: Gerenciar mudanças temporárias\\n• pull: Atualizar do repositório remoto\\n• sync: Sincronização completa (pull+commit+push)\\n───────────────\\nCOMMITS REAIS + RASTREABILIDADE TOTAL\\nFunciona com GitHub, Gitea e qualquer repositório Git',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['init', 'update', 'status', 'diff', 'log', 'reset', 'stash', 'pull', 'sync'],
        description: 'Action to perform'
      },

      // Parâmetros comuns
      repo: { type: 'string', description: 'Repository name (required for init/update/sync)' },
      projectPath: { type: 'string', description: 'Local project path (required for all)' },
      provider: { type: 'string', enum: ['gitea', 'github'], description: 'Provider (required for init/update/sync)' },

      // Parâmetros específicos
      message: { type: 'string', description: 'Commit message (required for init/update/sync)' },
      branch: { type: 'string', description: 'Branch name', default: 'main' },
      forcePush: { type: 'boolean', description: 'Force push', default: false },
      createRepo: { type: 'boolean', description: 'Create remote repository if not exists', default: false },
      granular: { type: 'boolean', description: 'Create granular commits by file type for init', default: false },
      detailed: { type: 'boolean', description: 'Detailed output for status', default: false },
      staged: { type: 'boolean', description: 'Show staged changes for diff', default: false },
      nameOnly: { type: 'boolean', description: 'Show only filenames for diff', default: false },
      commit: { type: 'string', description: 'Target commit for reset/diff' },
      maxCount: { type: 'number', description: 'Max commits for log', default: 10 },
      oneline: { type: 'boolean', description: 'One line format for log', default: true },
      mode: { type: 'string', enum: ['soft', 'mixed', 'hard'], description: 'Reset mode', default: 'mixed' },
      operation: { type: 'string', enum: ['save', 'pop', 'apply', 'list', 'drop', 'clear'], description: 'Stash operation', default: 'save' }
    },
    required: ['action', 'projectPath']
  },

  async handler(input: GitUpdateProjectInput): Promise<GitUpdateProjectResult> {
    try {
      const validatedInput = GitUpdateProjectInputSchema.parse(input);

      // Roteamento baseado na action
      switch (validatedInput.action) {
        case 'init':
          return await this.handleInit(validatedInput);
        case 'update':
          return await this.handleUpdate(validatedInput);
        case 'status':
          return await this.handleStatus(validatedInput);
        case 'diff':
          return await this.handleDiff(validatedInput);
        case 'log':
          return await this.handleLog(validatedInput);
        case 'reset':
          return await this.handleReset(validatedInput);
        case 'stash':
          return await this.handleStash(validatedInput);
        case 'pull':
          return await this.handlePull(validatedInput);
        case 'sync':
          return await this.handleSync(validatedInput);
        default:
          throw new Error(`Action '${(validatedInput as any).action}' não suportada`);
      }
    } catch (error) {
      return {
        success: false,
        action: input.action,
        message: `Erro na operação ${input.action}`,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  async handleUpdate(params: GitUpdateProjectInput & { action: 'update' }): Promise<GitUpdateProjectResult> {
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
  },

  // Action: init - upload inicial completo (substitui upload-project)
  async handleInit(params: GitUpdateProjectInput & { action: 'init' }): Promise<GitUpdateProjectResult> {
    try {
      const { repo, projectPath, message, branch = 'main', forcePush = false, createRepo = false, granular = false, provider: providerName } = params;

      const gitOps = new GitOperations(projectPath);

      // Aplicar auto-detecção de usuário
      const processedInput = await applyAutoUserDetection(params, providerName);
      const provider = globalProviderFactory.getProvider(processedInput.provider);
      if (!provider) {
        throw new Error(`Provider '${providerName}' não encontrado`);
      }

      const currentUser = await provider.getCurrentUser();
      const owner = currentUser.login;

      // 1. Inicializar repositório Git local se necessário
      const isGitRepo = await gitOps.isGitRepository();
      if (!isGitRepo) {
        const initResult = await gitOps.initRepository();
        if (!initResult.success) {
          throw new Error(`Falha ao inicializar repositório Git: ${initResult.error}`);
        }
      }

      // 2. Verificar/criar repositório remoto
      let repoExists = true;
      try {
        await provider.getRepository(owner, repo);
      } catch (error) {
        repoExists = false;
        if (createRepo) {
          try {
            await provider.createRepository(repo, `Projeto ${repo}`, false);
            repoExists = true;
          } catch (createError) {
            console.warn(`Aviso: Não foi possível criar repositório: ${createError instanceof Error ? createError.message : String(createError)}`);
          }
        } else {
          throw new Error(`Repositório '${repo}' não existe. Use createRepo: true para criar automaticamente.`);
        }
      }

      // 3. Preparar arquivos para commit
      let filesCommitted = 0;
      let commitsCreated = 0;

      if (granular) {
        // Commits granulares por tipo de arquivo (melhor rastreabilidade)
        const fileGroups = await this.groupFilesByType(projectPath);

        for (const [fileType, files] of Object.entries(fileGroups)) {
          if (files.length > 0) {
            // Adicionar arquivos do tipo específico
            const addResult = await gitOps.addFiles(files);
            if (addResult.success) {
              // Verificar se há mudanças para commitar
              const statusResult = await gitOps.status({ porcelain: true });
              if (statusResult.success && statusResult.output.trim()) {
                const commitResult = await gitOps.commit(`${message} - ${fileType} files`);
                if (commitResult.success) {
                  commitsCreated++;
                  filesCommitted += files.length;
                }
              }
            }
          }
        }
      } else {
        // Commit único de todos os arquivos (como upload-project)
        const addResult = await gitOps.addFiles(['.']);
        if (addResult.success) {
          const statusResult = await gitOps.status({ porcelain: true });
          if (statusResult.success && statusResult.output.trim()) {
            const commitResult = await gitOps.commit(message);
            if (commitResult.success) {
              commitsCreated++;
              filesCommitted = statusResult.output.trim().split('\n').length;
            }
          }
        }
      }

      // 4. Configurar e fazer push para remote
      let pushSuccessful = false;
      const remoteUrl = provider.getRepositoryUrl(owner, repo);

      // Configurar remote origin
      const remoteResult = await gitOps.remote('show', 'origin');
      if (!remoteResult.success) {
        const addRemoteResult = await gitOps.remote('add', 'origin', remoteUrl);
        if (!addRemoteResult.success && !addRemoteResult.error?.includes('already exists')) {
          console.warn(`Aviso: Falha ao adicionar remote: ${addRemoteResult.error}`);
        }
      } else {
        // Atualizar URL se necessário
        const setUrlResult = await gitOps.remote('set-url', 'origin', remoteUrl);
        if (!setUrlResult.success) {
          console.warn(`Aviso: Falha ao atualizar remote URL: ${setUrlResult.error}`);
        }
      }

      // Fazer push
      if (commitsCreated > 0) {
        try {
          const pushOptions: any = { setUpstream: true };
          if (forcePush) pushOptions.force = true;

          const pushResult = await gitOps.push('origin', branch, pushOptions);
          pushSuccessful = pushResult.success;
          if (!pushSuccessful) {
            console.warn(`Aviso: Push falhou: ${pushResult.error}`);
          }
        } catch (pushErr) {
          console.warn(`Aviso: Erro no push: ${pushErr instanceof Error ? pushErr.message : String(pushErr)}`);
        }
      }

      return {
        success: true,
        action: 'init',
        message: `Upload inicial concluído com ${commitsCreated} commit(s) e ${filesCommitted} arquivo(s)`,
        data: {
          repo,
          branch,
          provider: providerName,
          owner,
          remoteUrl,
          repositoryCreated: !repoExists && createRepo,
          gitInit: !isGitRepo,
          commitsCreated,
          filesCommitted,
          pushSuccessful,
          granular,
          implementation: 'REAL_GIT_OPERATIONS_v2.40.0',
          note: granular ?
            'Commits granulares criados por tipo de arquivo para melhor rastreabilidade' :
            'Commit único criado (como upload-project original)'
        }
      };
    } catch (error) {
      return {
        success: false,
        action: 'init',
        message: 'Erro no upload inicial do projeto',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  // Action: status - verificar status do repositório
  async handleStatus(params: GitUpdateProjectInput & { action: 'status' }): Promise<GitUpdateProjectResult> {
    try {
      const { projectPath, detailed = false } = params;

      const gitOps = new GitOperations(projectPath);

      // Verificar se é um repositório Git
      const isGitRepo = await gitOps.isGitRepository();
      if (!isGitRepo) {
        throw new Error(`Diretório '${projectPath}' não é um repositório Git válido`);
      }

      // Obter status detalhado
      const statusResult = await gitOps.status({ porcelain: false });
      if (!statusResult.success) {
        throw new Error(`Falha ao obter status: ${statusResult.error}`);
      }

      // Obter branch atual
      const branchResult = await gitOps.getCurrentBranch();
      const currentBranch = branchResult.success ? branchResult.output.trim() : 'unknown';

      // Contar mudanças
      const porcelainResult = await gitOps.status({ porcelain: true });
      const changes = porcelainResult.success ? porcelainResult.output.trim() : '';
      const filesChanged = changes ? changes.split('\n').filter(line => line.trim().length > 0).length : 0;

      return {
        success: true,
        action: 'status',
        message: `Status do repositório obtido com sucesso`,
        data: {
          currentBranch,
          filesChanged,
          hasChanges: filesChanged > 0,
          statusOutput: detailed ? statusResult.output : statusResult.output.split('\n').slice(0, 10).join('\n'),
          implementation: 'REAL_GIT_OPERATIONS_v2.38.0',
          detailed
        }
      };
    } catch (error) {
      return {
        success: false,
        action: 'status',
        message: 'Erro ao verificar status do repositório',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  // Action: diff - mostrar diferenças
  async handleDiff(params: GitUpdateProjectInput & { action: 'diff' }): Promise<GitUpdateProjectResult> {
    try {
      const { projectPath, staged = false, nameOnly = false, commit } = params;

      const gitOps = new GitOperations(projectPath);

      // Verificar se é um repositório Git
      const isGitRepo = await gitOps.isGitRepository();
      if (!isGitRepo) {
        throw new Error(`Diretório '${projectPath}' não é um repositório Git válido`);
      }

      const diffOptions: any = {};
      if (staged) diffOptions.cached = true;
      if (nameOnly) diffOptions.nameOnly = true;
      if (commit) diffOptions.commit = commit;

      const diffResult = await gitOps.diff(diffOptions);

      if (!diffResult.success && diffResult.error) {
        throw new Error(`Falha ao obter diferenças: ${diffResult.error}`);
      }

      const hasDifferences = diffResult.output.trim().length > 0;

      return {
        success: true,
        action: 'diff',
        message: hasDifferences ? 'Diferenças encontradas' : 'Nenhuma diferença encontrada',
        data: {
          hasDifferences,
          diffOutput: diffResult.output,
          staged,
          nameOnly,
          commit: commit || 'HEAD',
          implementation: 'REAL_GIT_OPERATIONS_v2.38.0'
        }
      };
    } catch (error) {
      return {
        success: false,
        action: 'diff',
        message: 'Erro ao obter diferenças',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  // Action: log - histórico de commits
  async handleLog(params: GitUpdateProjectInput & { action: 'log' }): Promise<GitUpdateProjectResult> {
    try {
      const { projectPath, maxCount = 10, oneline = true, branch } = params;

      const gitOps = new GitOperations(projectPath);

      // Verificar se é um repositório Git
      const isGitRepo = await gitOps.isGitRepository();
      if (!isGitRepo) {
        throw new Error(`Diretório '${projectPath}' não é um repositório Git válido`);
      }

      // Obter histórico de commits
      const logOptions: any = {};
      if (maxCount) logOptions.maxCount = maxCount;
      if (oneline) logOptions.oneline = true;
      if (branch) logOptions.branches = [branch];

      const logResult = await gitOps.log(logOptions);
      if (!logResult.success) {
        throw new Error(`Falha ao obter histórico: ${logResult.error}`);
      }

      const commits = logResult.output.trim();
      const commitCount = commits ? commits.split('\n').filter(line => line.trim().length > 0).length : 0;

      return {
        success: true,
        action: 'log',
        message: `${commitCount} commits encontrados no histórico`,
        data: {
          commits: commits || 'Nenhum commit encontrado',
          commitCount,
          maxCount,
          oneline,
          branch: branch || 'all',
          implementation: 'REAL_GIT_OPERATIONS_v2.38.0'
        }
      };
    } catch (error) {
      return {
        success: false,
        action: 'log',
        message: 'Erro ao obter histórico de commits',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  // Action: reset - desfazer mudanças
  async handleReset(params: GitUpdateProjectInput & { action: 'reset' }): Promise<GitUpdateProjectResult> {
    try {
      const { projectPath, mode = 'mixed', commit } = params;

      const gitOps = new GitOperations(projectPath);

      // Verificar se é um repositório Git
      const isGitRepo = await gitOps.isGitRepository();
      if (!isGitRepo) {
        throw new Error(`Diretório '${projectPath}' não é um repositório Git válido`);
      }

      // Executar reset
      const target = commit || 'HEAD';
      const resetOptions: any = { mode };
      const resetResult = await gitOps.reset(target, resetOptions);

      if (!resetResult.success) {
        throw new Error(`Falha no reset: ${resetResult.error}`);
      }

      return {
        success: true,
        action: 'reset',
        message: `Reset ${mode} executado com sucesso`,
        data: {
          mode,
          targetCommit: target,
          resetOutput: resetResult.output,
          implementation: 'REAL_GIT_OPERATIONS_v2.38.0'
        }
      };
    } catch (error) {
      return {
        success: false,
        action: 'reset',
        message: 'Erro ao executar reset',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  // Action: stash - gerenciar mudanças temporárias
  async handleStash(params: GitUpdateProjectInput & { action: 'stash' }): Promise<GitUpdateProjectResult> {
    try {
      const { projectPath, operation = 'save', message } = params;

      const gitOps = new GitOperations(projectPath);

      // Verificar se é um repositório Git
      const isGitRepo = await gitOps.isGitRepository();
      if (!isGitRepo) {
        throw new Error(`Diretório '${projectPath}' não é um repositório Git válido`);
      }

      let stashResult;

      switch (operation) {
        case 'save':
          stashResult = await gitOps.stash('push', { message });
          break;
        case 'pop':
          stashResult = await gitOps.stash('pop');
          break;
        case 'apply':
          stashResult = await gitOps.stash('apply');
          break;
        case 'list':
          stashResult = await gitOps.stash('list');
          break;
        case 'drop':
          stashResult = await gitOps.stash('drop');
          break;
        case 'clear':
          stashResult = await gitOps.stash('clear');
          break;
        default:
          throw new Error(`Operação de stash '${operation}' não suportada`);
      }

      if (!stashResult.success) {
        throw new Error(`Falha na operação stash ${operation}: ${stashResult.error}`);
      }

      return {
        success: true,
        action: 'stash',
        message: `Operação stash '${operation}' executada com sucesso`,
        data: {
          operation,
          message: message || undefined,
          stashOutput: stashResult.output,
          implementation: 'REAL_GIT_OPERATIONS_v2.38.0'
        }
      };
    } catch (error) {
      return {
        success: false,
        action: 'stash',
        message: 'Erro na operação de stash',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  // Action: pull - atualizar do remoto
  async handlePull(params: GitUpdateProjectInput & { action: 'pull' }): Promise<GitUpdateProjectResult> {
    try {
      const { projectPath, branch } = params;

      const gitOps = new GitOperations(projectPath);

      // Verificar se é um repositório Git
      const isGitRepo = await gitOps.isGitRepository();
      if (!isGitRepo) {
        throw new Error(`Diretório '${projectPath}' não é um repositório Git válido`);
      }

      // Executar pull
      const pullResult = await gitOps.pull('origin', branch);
      if (!pullResult.success) {
        throw new Error(`Falha no pull: ${pullResult.error}`);
      }

      return {
        success: true,
        action: 'pull',
        message: `Pull do remoto executado com sucesso`,
        data: {
          remote: 'origin',
          branch: branch || 'current',
          pullOutput: pullResult.output,
          implementation: 'REAL_GIT_OPERATIONS_v2.38.0'
        }
      };
    } catch (error) {
      return {
        success: false,
        action: 'pull',
        message: 'Erro ao executar pull',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  // Action: sync - sincronização completa (pull + commit + push)
  async handleSync(params: GitUpdateProjectInput & { action: 'sync' }): Promise<GitUpdateProjectResult> {
    try {
      const { repo, projectPath, message, branch = 'main', forcePush = false, provider: providerName } = params;

      const gitOps = new GitOperations(projectPath);

      // Verificar se é um repositório Git
      const isGitRepo = await gitOps.isGitRepository();
      if (!isGitRepo) {
        throw new Error(`Diretório '${projectPath}' não é um repositório Git válido`);
      }

      const syncResults = {
        pull: { success: false, output: '', error: '' },
        commit: { success: false, output: '', error: '', created: false },
        push: { success: false, output: '', error: '' }
      };

      // 1. Pull do remoto
      try {
        const pullResult = await gitOps.pull('origin', branch);
        syncResults.pull = {
          success: pullResult.success,
          output: pullResult.output,
          error: pullResult.error || ''
        };
      } catch (pullErr) {
        syncResults.pull.error = pullErr instanceof Error ? pullErr.message : String(pullErr);
      }

      // 2. Verificar se há mudanças após pull
      const statusResult = await gitOps.status({ porcelain: true });
      const hasChanges = statusResult.success && statusResult.output.trim().length > 0;

      if (hasChanges) {
        // Fazer commit das mudanças
        const addResult = await gitOps.addFiles(['.']);
        if (addResult.success) {
          const commitResult = await gitOps.commit(message);
          syncResults.commit = {
            success: commitResult.success,
            output: commitResult.output,
            error: commitResult.error || '',
            created: commitResult.success
          };
        } else {
          syncResults.commit.error = `Falha ao adicionar arquivos: ${addResult.error}`;
        }
      }

      // 3. Push se commit foi criado
      if (syncResults.commit.created) {
        try {
          const pushOptions: any = {};
          if (forcePush) pushOptions.force = true;

          const pushResult = await gitOps.push('origin', branch, pushOptions);
          syncResults.push = {
            success: pushResult.success,
            output: pushResult.output,
            error: pushResult.error || ''
          };
        } catch (pushErr) {
          syncResults.push.error = pushErr instanceof Error ? pushErr.message : String(pushErr);
        }
      }

      const overallSuccess = syncResults.pull.success && (!hasChanges || syncResults.commit.success);

      return {
        success: overallSuccess,
        action: 'sync',
        message: `Sincronização ${overallSuccess ? 'concluída' : 'com problemas'}`,
        data: {
          repo,
          branch,
          provider: providerName,
          syncResults,
          hasChanges,
          implementation: 'REAL_GIT_OPERATIONS_v2.38.0',
          summary: {
            pullSuccessful: syncResults.pull.success,
            commitCreated: syncResults.commit.created,
            pushSuccessful: syncResults.push.success
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        action: 'sync',
        message: 'Erro na sincronização completa',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  // Helper method para agrupar arquivos por tipo
  async groupFilesByType(projectPath: string): Promise<Record<string, string[]>> {
    const gitOps = new GitOperations(projectPath);
    const statusResult = await gitOps.status({ porcelain: true });

    if (!statusResult.success) {
      return {};
    }

    const lines = statusResult.output.trim().split('\n').filter(line => line.trim());
    const fileGroups: Record<string, string[]> = {
      'config': [],
      'source': [],
      'documentation': [],
      'assets': [],
      'other': []
    };

    for (const line of lines) {
      // Extrair nome do arquivo (remover status indicators)
      const fileName = line.substring(3).trim();

      if (fileName.includes('package.json') || fileName.includes('.config.') ||
          fileName.includes('tsconfig') || fileName.includes('.env')) {
        fileGroups.config.push(fileName);
      } else if (fileName.endsWith('.ts') || fileName.endsWith('.js') ||
                 fileName.endsWith('.py') || fileName.endsWith('.java')) {
        fileGroups.source.push(fileName);
      } else if (fileName.endsWith('.md') || fileName.endsWith('.txt') ||
                 fileName.includes('README') || fileName.includes('LICENSE')) {
        fileGroups.documentation.push(fileName);
      } else if (fileName.endsWith('.png') || fileName.endsWith('.jpg') ||
                 fileName.endsWith('.svg') || fileName.endsWith('.css')) {
        fileGroups.assets.push(fileName);
      } else {
        fileGroups.other.push(fileName);
      }
    }

    return fileGroups;
  }
};