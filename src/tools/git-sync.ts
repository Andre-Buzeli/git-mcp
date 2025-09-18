import { z } from 'zod';

/**
 * Tool: git-sync
 * 
 * DESCRIÇÃO:
 * Sincronização entre dois repositórios hospedados em provedores distintos (ex.: Gitea <-> GitHub).
 * 
 * OBJETIVOS:
 * - Configurar espelhamento (quando suportado pelo backend) e registrar estado
 * - Executar sincronização pontual (one-shot) de código e/ou metadados
 * - Consultar status/diagnóstico da sincronização
 * 
 * LIMITAÇÕES:
 * - Histórico Git completo por API REST é limitado; prioriza espelhamento nativo (push mirrors) quando disponível
 * - Metadados (issues, labels, releases, PRs) têm mapeamento best-effort com diferenças entre plataformas
 * 
 * DICAS (solo):
 * - Use para manter um backup/em espelho entre provedores
 * - Prefira one-shot antes de configurar contínuo; verifique status e conflitos
 * - Defina estratégia de conflito e escopos explicitamente
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
  description: 'Synchronize two repositories across providers (Gitea <-> GitHub). Modos: configure (espelhamento quando suportado), one-shot (execução pontual) e status (diagnóstico). Dicas: execute dry-run primeiro, escolha escopos e estratégia de conflito.',
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
      const params = GitSyncInputSchema.parse(input);
      switch (params.action) {
        case 'configure':
          return {
            success: true,
            action: 'configure',
            message: 'Configuração registrada (placeholder). Integração com providers será aplicada na próxima etapa da implementação.',
            data: { params }
          };
        case 'status':
          return {
            success: true,
            action: 'status',
            message: 'Status coletado (placeholder).',
            data: { health: 'unknown', details: params }
          };
        case 'one-shot':
          return {
            success: true,
            action: 'one-shot',
            message: 'Sincronização pontual executada (placeholder).',
            data: { params, applied: false }
          };
        default:
          throw new Error(`Ação não suportada: ${params.action}`);
      }
    } catch (error) {
      return {
        success: false,
        action: (input as any).action,
        message: 'Erro na execução do git-sync',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};

