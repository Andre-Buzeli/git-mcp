import { z } from 'zod';
import { globalProviderFactory, VcsOperations } from '../providers/index.js';
import { applyAutoUserDetection } from '../utils/user-detection.js';

/**
 * Tool: git-upload-project
 * 
 * DESCRIÇÃO:
 * Upload completo de projeto para repositório remoto
 * 
 * FUNCIONALIDADES:
 * - Upload de todos os arquivos do projeto
 * - Ignora diretórios desnecessários (node_modules, .git, dist)
 * - Ignora arquivos temporários e logs
 * - Faz commit com mensagem personalizada
 * - Suporta GitHub e Gitea
 * 
 * USO:
 * - Para enviar projeto completo para repositório
 * - Para backup de projeto
 * - Para migração de código
 * - Para sincronização de projeto
 * 
 * RECOMENDAÇÕES:
 * - Use mensagens de commit descritivas
 * - Verifique se o repositório está limpo
 * - Use branches para mudanças grandes
 * - Monitore erros de upload
 */

/**
 * Schema de validação para entrada da tool upload-project
 */
const UploadProjectInputSchema = z.object({
  action: z.enum(['upload']),
  repo: z.string(),
  projectPath: z.string().describe('Local project path for git operations'),
  provider: z.enum(['gitea', 'github']).describe('Provider to use (gitea or github)'),
  message: z.string(),
  branch: z.string().optional(),
});

export type UploadProjectInput = z.infer<typeof UploadProjectInputSchema>;

/**
 * Schema de saída padronizado
 */
const UploadProjectResultSchema = z.object({
  success: z.boolean(),
  action: z.string(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional()
});

export type UploadProjectResult = z.infer<typeof UploadProjectResultSchema>;

/**
 * Tool: git-upload-project
 * 
 * DESCRIÇÃO:
 * Upload completo de projeto para repositório remoto
 * 
 * ACTIONS DISPONÍVEIS:
 * 
 * 1. upload - Upload de projeto completo
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - projectPath (obrigatório): Caminho do projeto local
 *    - message (obrigatório): Mensagem de commit
 *    - branch (opcional): Branch de destino (padrão: branch padrão)
 * 
 * RECOMENDAÇÕES DE USO:
 * - Use mensagens de commit descritivas
 * - Verifique se o repositório está limpo
 * - Use branches para mudanças grandes
 * - Monitore erros de upload
 * - Organize estrutura de diretórios
 * - Documente mudanças importantes
 * - Mantenha histórico de commits limpo
 */
export const uploadProjectTool = {
  name: 'git-upload-project',
  description: 'Upload completo de projeto para repositório remoto com suporte multi-provider (GitHub e Gitea). PARÂMETROS OBRIGATÓRIOS: action, repo, provider, projectPath, message. AÇÕES: upload (envia projeto completo). Boas práticas: use mensagens descritivas, verifique repositório limpo, monitore erros.',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['upload'],
        description: 'Action to perform on project upload'
      },
      repo: { type: 'string', description: 'Repository name' },
      projectPath: { type: 'string', description: 'Local project path for git operations' },
      provider: { type: 'string', description: 'Specific provider (github, gitea) or use default' },
      message: { type: 'string', description: 'Commit message' },
      branch: { type: 'string', description: 'Target branch' }
    },
    required: ['action', 'repo', 'provider', 'projectPath', 'message']
  },

  /**
   * Handler principal da tool upload-project
   */
  async handler(input: UploadProjectInput): Promise<UploadProjectResult> {
    try {
      const validatedInput = UploadProjectInputSchema.parse(input);
      
      // Aplicar auto-detecção apenas para owner dentro do provider especificado
      const processedInput = await applyAutoUserDetection(validatedInput, validatedInput.provider);
      
      // Usar o provider especificado pelo usuário
      const provider = globalProviderFactory.getProvider(processedInput.provider);
      
      if (!provider) {
        throw new Error(`Provider '${processedInput.provider}' não encontrado`);
      }
      
      switch (processedInput.action) {
        case 'upload':
          return await this.uploadProject(processedInput, provider);
        default:
          throw new Error(`Ação não suportada: ${processedInput.action}`);
      }
    } catch (error) {
      return {
        success: false,
        action: input.action,
        message: 'Erro na operação de upload de projeto',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  /**
   * Faz upload de todo o projeto para o repositório
   */
  async uploadProject(params: UploadProjectInput, provider: VcsOperations): Promise<UploadProjectResult> {
    try {
      if (!params.repo || !params.projectPath || !params.message) {
        throw new Error('repo, projectPath e message são obrigatórios');
      }

      // owner já foi auto-detectado em applyAutoUserDetection e está disponível via provider.getCurrentUser
      const currentUser = await provider.getCurrentUser();
      const owner = currentUser.login;

      const result = await provider.uploadProject(
        owner,
        params.repo,
        params.projectPath,
        params.message,
        params.branch
      );

      return {
        success: true,
        action: 'upload',
        message: `Projeto enviado com sucesso: ${result.uploaded} arquivos enviados`,
        data: {
          uploaded: result.uploaded,
          errors: result.errors,
          totalErrors: result.errors.length
        }
      };
    } catch (error) {
      throw new Error(`Falha ao fazer upload do projeto: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
};
