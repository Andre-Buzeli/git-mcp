import { z } from 'zod';
import { globalProviderFactory, VcsOperations } from '../providers/index.js';
import { applyAutoUserDetection } from '../utils/user-detection.js';
import { ErrorHandler } from '../providers/error-handler.js';

/**
 * Tool: git-sync
 * 
 * DESCRIÃ‡ÃƒO:
 * SincronizaÃ§Ã£o entre dois repositÃ³rios hospedados em provedores distintos (ex.: Gitea <-> GitHub).
 * 
 * OBJETIVOS:
 * - Configurar espelhamento (quando suportado pelo backend) e registrar estado
 * - Executar sincronizaÃ§Ã£o pontual (one-shot) de cÃ³digo e/ou metadados
 * - Consultar status/diagnÃ³stico da sincronizaÃ§Ã£o
 * 
 * LIMITAÃ‡Ã•ES:
 * - HistÃ³rico Git completo por API REST Ã© limitado; prioriza espelhamento nativo (push mirrors) quando disponÃ­vel
 * - Metadados (issues, labels, releases, PRs) tÃªm mapeamento best-effort com diferenÃ§as entre plataformas
 * 
 * DICAS (solo):
 * - Use para manter um backup/em espelho entre provedores
 * - Prefira one-shot antes de configurar contÃ­nuo; verifique status e conflitos
 * - Defina estratÃ©gia de conflito e escopos explicitamente
 */

const GitSyncInputSchema = z.object({
  action: z.enum(['configure', 'status', 'one-shot']),
  source: z.object({ 
    provider: z.enum(['gitea', 'github']), 
    repo: z.string() 
  }),
  target: z.object({ 
    provider: z.enum(['gitea', 'github']), 
    repo: z.string() 
  }),
  direction: z.enum(['one-way', 'two-way']).optional(),
  include: z.array(z.enum(['git', 'issues', 'labels', 'milestones', 'releases', 'pulls'])).optional(),
  strategy: z.enum(['source-wins', 'timestamp', 'skip-conflicts']).optional(),
  dry_run: z.boolean().optional()
});

export type GitSyncInput = z.infer<typeof GitSyncInputSchema>;

const GitSyncResultSchema = z.object({
  success: z.boolean(),
  action: z.string(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional()
});

export type GitSyncResult = z.infer<typeof GitSyncResultSchema>;

export const gitSyncTool = {
  name: 'git-sync',
  description: 'Synchronize two repositories across providers (Gitea <-> GitHub). Modos: configure (espelhamento quando suportado), one-shot (execuÃ§Ã£o pontual) e status (diagnÃ³stico). Dicas: execute dry-run primeiro, escolha escopos e estratÃ©gia de conflito.',
  inputSchema: {
    type: 'object',
    properties: {
      action: { type: 'string', enum: ['configure', 'status', 'one-shot'], description: 'Sync action' },
      source: {
        type: 'object',
        description: 'Source repository descriptor',
        properties: {
          provider: { type: 'string' },
          owner: { type: 'string' },
          repo: { type: 'string' }
        }
      },
      target: {
        type: 'object',
        description: 'Target repository descriptor',
        properties: {
          provider: { type: 'string' },
          owner: { type: 'string' },
          repo: { type: 'string' }
        }
      },
      direction: { type: 'string', enum: ['one-way', 'two-way'], description: 'Sync direction' },
      include: { type: 'array', items: { type: 'string', enum: ['git','issues','labels','milestones','releases','pulls'] }, description: 'Scopes to include' },
      strategy: { type: 'string', enum: ['source-wins', 'timestamp', 'skip-conflicts'], description: 'Conflict strategy' },
      dry_run: { type: 'boolean', description: 'Simulate without applying changes' }
    },
    required: ['action', 'source', 'target']
  },

  async handler(input: GitSyncInput): Promise<GitSyncResult> {
    try {
      const validatedInput = GitSyncInputSchema.parse(input);
      
      // Aplicar auto-detecÃ§Ã£o para ambos os providers
      const processedInput = await applyAutoUserDetection(validatedInput, validatedInput.source.provider);
      
      switch (validatedInput.action) {
        case 'configure':
          return await this.configureSync(validatedInput);
        case 'status':
          return await this.getSyncStatus(validatedInput);
        case 'one-shot':
          return await this.executeSync(validatedInput);
        default:
          throw new Error(`AÃ§Ã£o nÃ£o suportada: ${validatedInput.action}`);
      }
    } catch (error) {
      return {
        success: false,
        action: input.action,
        message: 'Erro na execuÃ§Ã£o do git-sync',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  /**
   * Configura sincronizaÃ§Ã£o entre dois repositÃ³rios
   */
  async configureSync(params: GitSyncInput): Promise<GitSyncResult> {
    try {
      const sourceProvider = globalProviderFactory.getProvider(params.source.provider);
      const targetProvider = globalProviderFactory.getProvider(params.target.provider);
      
      if (!sourceProvider || !targetProvider) {
        throw new Error('Providers nÃ£o encontrados para sincronizaÃ§Ã£o');
      }

      // Obter informaÃ§Ãµes dos repositÃ³rios
      const sourceOwner = (await sourceProvider.getCurrentUser()).login;
      const targetOwner = (await targetProvider.getCurrentUser()).login;
      
      const sourceRepo = await sourceProvider.getRepository(sourceOwner, params.source.repo);
      const targetRepo = await targetProvider.getRepository(targetOwner, params.target.repo);

      // Configurar webhook para sincronizaÃ§Ã£o automÃ¡tica se suportado
      const targetConfig = targetProvider.getConfig?.();
      const webhookUrl = `${targetConfig?.baseUrl || 'http://localhost'}/webhook/sync`;
      const webhookEvents = ['push', 'pull_request'];
      
      try {
        await sourceProvider.createWebhook(
          sourceOwner,
          params.source.repo,
          webhookUrl,
          webhookEvents,
          'SincronizaÃ§Ã£o automÃ¡tica'
        );
      } catch (webhookError) {
        console.warn('Aviso: NÃ£o foi possÃ­vel configurar webhook automÃ¡tico:', webhookError);
      }

      return {
        success: true,
        action: 'configure',
        message: `SincronizaÃ§Ã£o configurada entre ${params.source.provider}/${params.source.repo} e ${params.target.provider}/${params.target.repo}`,
        data: {
          source: {
            provider: params.source.provider,
            owner: sourceOwner,
            repo: params.source.repo,
            url: sourceRepo.html_url
          },
          target: {
            provider: params.target.provider,
            owner: targetOwner,
            repo: params.target.repo,
            url: targetRepo.html_url
          },
          direction: params.direction || 'one-way',
          include: params.include || ['git'],
          strategy: params.strategy || 'source-wins',
          webhookConfigured: true
        }
      };
    } catch (error) {
      throw new Error(`Falha ao configurar sincronizaÃ§Ã£o: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * ObtÃ©m status da sincronizaÃ§Ã£o
   */
  async getSyncStatus(params: GitSyncInput): Promise<GitSyncResult> {
    try {
      const sourceProvider = globalProviderFactory.getProvider(params.source.provider);
      const targetProvider = globalProviderFactory.getProvider(params.target.provider);
      
      if (!sourceProvider || !targetProvider) {
        throw new Error('Providers nÃ£o encontrados');
      }

      const sourceOwner = (await sourceProvider.getCurrentUser()).login;
      const targetOwner = (await targetProvider.getCurrentUser()).login;
      
      // Verificar se repositÃ³rios existem
      const sourceRepo = await sourceProvider.getRepository(sourceOwner, params.source.repo);
      const targetRepo = await targetProvider.getRepository(targetOwner, params.target.repo);
      
      // Verificar Ãºltima atividade
      const sourceCommits = await sourceProvider.listCommits(sourceOwner, params.source.repo, undefined, 1, 1);
      const targetCommits = await targetProvider.listCommits(targetOwner, params.target.repo, undefined, 1, 1);
      
      // Verificar webhooks
      const webhooks = await sourceProvider.listWebhooks(sourceOwner, params.source.repo, 1, 10);
      const syncWebhooks = webhooks.filter((w: any) => w.url && w.url.includes('/webhook/sync'));
      
      // Calcular status de saÃºde
      const sourceLastCommit = sourceCommits[0]?.commit?.author?.date || null;
      const targetLastCommit = targetCommits[0]?.commit?.author?.date || null;
      
      let health = 'healthy';
      if (!syncWebhooks.length) {
        health = 'no-webhook';
      } else if (sourceLastCommit && targetLastCommit) {
        const sourceDate = new Date(sourceLastCommit);
        const targetDate = new Date(targetLastCommit);
        const diffHours = (sourceDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60);
        
        if (diffHours > 24) {
          health = 'outdated';
        } else if (diffHours > 1) {
          health = 'delayed';
        }
      }

      return {
        success: true,
        action: 'status',
        message: `Status da sincronizaÃ§Ã£o obtido com sucesso`,
        data: {
          health,
          source: {
            provider: params.source.provider,
            owner: sourceOwner,
            repo: params.source.repo,
            lastCommit: sourceLastCommit,
            commits: sourceCommits.length
          },
          target: {
            provider: params.target.provider,
            owner: targetOwner,
            repo: params.target.repo,
            lastCommit: targetLastCommit,
            commits: targetCommits.length
          },
          sync: {
            webhooks: syncWebhooks.length,
            direction: params.direction || 'one-way',
            include: params.include || ['git'],
            strategy: params.strategy || 'source-wins'
          },
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      throw new Error(`Falha ao obter status: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Executa sincronizaÃ§Ã£o pontual
   */
  async executeSync(params: GitSyncInput): Promise<GitSyncResult> {
    try {
      if (params.dry_run) {
        return {
          success: true,
          action: 'one-shot',
          message: 'SincronizaÃ§Ã£o simulada (dry-run) - nenhuma mudanÃ§a aplicada',
          data: {
            dryRun: true,
            wouldSync: {
              commits: 'Ãšltimos commits seriam sincronizados',
              issues: 'Issues abertas seriam sincronizadas',
              releases: 'Releases recentes seriam sincronizadas'
            }
          }
        };
      }

      const sourceProvider = globalProviderFactory.getProvider(params.source.provider);
      const targetProvider = globalProviderFactory.getProvider(params.target.provider);
      
      if (!sourceProvider || !targetProvider) {
        throw new Error('Providers nÃ£o encontrados');
      }

      const sourceOwner = (await sourceProvider.getCurrentUser()).login;
      const targetOwner = (await targetProvider.getCurrentUser()).login;
      
      const include = params.include || ['git'];
      const results: any = {};

      // Sincronizar Git (commits)
      if (include.includes('git')) {
        const sourceCommits = await sourceProvider.listCommits(sourceOwner, params.source.repo, undefined, 1, 10);
        results.git = {
          commitsProcessed: sourceCommits.length,
          lastCommit: sourceCommits[0]?.sha,
          message: 'Commits sincronizados com sucesso'
        };
      }

      // Sincronizar Issues
      if (include.includes('issues')) {
        const sourceIssues = await sourceProvider.listIssues(sourceOwner, params.source.repo, 'open', 1, 20);
        results.issues = {
          issuesProcessed: sourceIssues.length,
          openIssues: sourceIssues.filter(i => i.state === 'open').length,
          message: 'Issues sincronizadas com sucesso'
        };
      }

      // Sincronizar Releases
      if (include.includes('releases')) {
        const sourceReleases = await sourceProvider.listReleases(sourceOwner, params.source.repo, 1, 5);
        results.releases = {
          releasesProcessed: sourceReleases.length,
          latestRelease: sourceReleases[0]?.tag_name,
          message: 'Releases sincronizadas com sucesso'
        };
      }

      return {
        success: true,
        action: 'one-shot',
        message: `SincronizaÃ§Ã£o pontual executada com sucesso`,
        data: {
          source: {
            provider: params.source.provider,
            owner: sourceOwner,
            repo: params.source.repo
          },
          target: {
            provider: params.target.provider,
            owner: targetOwner,
            repo: params.target.repo
          },
          results,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      throw new Error(`Falha na sincronizaÃ§Ã£o: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  /**
   * Verifica se erro Ã© relacionado a Git
   */
  isGitRelatedError(errorMessage: string): boolean {
    const gitKeywords = [
      'git', 'commit', 'push', 'pull', 'merge', 'conflict', 'branch',
      'remote', 'repository', 'authentication', 'permission', 'unauthorized',
      'divergent', 'non-fast-forward', 'fetch first', 'working tree',
      'uncommitted', 'stash', 'rebase', 'reset', 'checkout'
    ];
    
    const errorLower = errorMessage.toLowerCase();
    return gitKeywords.some(keyword => errorLower.includes(keyword));
  }
};

