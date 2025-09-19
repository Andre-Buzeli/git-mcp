import { z } from 'zod';
import { globalProviderFactory, VcsOperations } from '../providers/index.js';
import { applyAutoUserDetection } from '../utils/user-detection.js';
import { GitOperations } from '../utils/git-operations.js';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Tool: git-upload-project
 * 
 * DESCRIÇÃO:
 * Upload completo de projeto para repositório remoto - 100% AUTÔNOMO
 * 
 * FUNCIONALIDADES:
 * - Upload de todos os arquivos do projeto
 * - Ignora diretórios desnecessários (node_modules, .git, dist)
 * - Ignora arquivos temporários e logs
 * - Processo Git completo automático:
 *   - git init (se necessário)
 *   - git add . (todos os arquivos)
 *   - git commit (com mensagem personalizada)
 *   - git remote add origin (se necessário)
 *   - git push origin main (ou branch especificada)
 * - Suporta GitHub e Gitea
 * - Funciona com repositório vazio ou existente
 * - Não depende de outras tools
 * 
 * USO:
 * - Para enviar projeto completo para repositório
 * - Para backup de projeto
 * - Para migração de código
 * - Para sincronização de projeto
 * - Para inicializar repositório do zero
 * 
 * RECOMENDAÇÕES:
 * - Use mensagens de commit descritivas
 * - A tool faz todo o processo automaticamente
 * - Funciona mesmo sem repositório Git local
 * - Cria repositório remoto se não existir
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
  branch: z.string().optional().default('main'),
  createRepo: z.boolean().optional().default(false),
  forcePush: z.boolean().optional().default(false),
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
  description: 'tool: Upload completo de projeto para repositório remoto - 100% AUTÔNOMO\n──────────────\naction upload: envia projeto completo para repositório com processo Git automático\naction upload requires: repo, projectPath, provider, message, branch, createRepo, forcePush',
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
      branch: { type: 'string', description: 'Target branch (default: main)' },
      createRepo: { type: 'boolean', description: 'Create repository if not exists (default: false)' },
      forcePush: { type: 'boolean', description: 'Force push to remote (default: false)' }
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
          return await uploadProjectTool.uploadProject(processedInput, provider);
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
   * Faz upload de todo o projeto para o repositório - 100% AUTÔNOMO
   * Processo completo: init -> add -> commit -> remote -> push
   */
  async uploadProject(params: UploadProjectInput, provider: VcsOperations): Promise<UploadProjectResult> {
    try {
      if (!params.repo || !params.projectPath || !params.message) {
        throw new Error('repo, projectPath e message são obrigatórios');
      }

      // owner já foi auto-detectado em applyAutoUserDetection e está disponível via provider.getCurrentUser
      const currentUser = await provider.getCurrentUser();
      const owner = currentUser.login;
      const branch = params.branch || 'main';

      // Inicializar operações Git locais
      const gitOps = new GitOperations(params.projectPath);
      
      // Verificar se é um repositório Git
      const isGitRepo = await gitOps.isGitRepository();
      
      // 1. Inicializar repositório Git se necessário
      if (!isGitRepo) {
        // console.log('Inicializando repositório Git...');
        const initResult = await gitOps.initRepository();
        if (!initResult.success) {
          throw new Error(`Falha ao inicializar repositório Git: ${initResult.error}`);
        }
      }

      // 2. Verificar se repositório remoto existe, criar se necessário
      let repoExists = true;
      try {
        await provider.getRepository(owner, params.repo);
      } catch (error) {
        repoExists = false;
        if (params.createRepo) {
          try {
            // console.log('Criando repositório remoto...');
            await provider.createRepository(params.repo, `Projeto ${params.repo}`, false);
            repoExists = true;
          } catch (createError) {
            // Se falhou ao criar, continuar mesmo assim (pode já existir)
            console.warn(`Aviso: Não foi possível criar repositório: ${createError instanceof Error ? createError.message : String(createError)}`);
          }
        } else {
          throw new Error(`Repositório '${params.repo}' não existe. Use createRepo: true para criar automaticamente.`);
        }
      }

      // 3. Adicionar todos os arquivos ao staging
      // console.log('Adicionando arquivos ao staging...');
      const addResult = await gitOps.addFiles(['.']);
      if (!addResult.success) {
        throw new Error(`Falha ao adicionar arquivos: ${addResult.error}`);
      }

      // 4. Verificar se há arquivos para commitar
      const statusResult = await gitOps.status();
      if (!statusResult.success) {
        throw new Error(`Falha ao verificar status: ${statusResult.error}`);
      }

      // Verificar se há mudanças para commitar
      if (!statusResult.output.includes('Changes to be committed:') && 
          !statusResult.output.includes('new file:') && 
          !statusResult.output.includes('modified:') && 
          !statusResult.output.includes('deleted:')) {
        // Nenhuma mudança para commitar, continuar sem commit
      } else {
        // Fazer commit
        // console.log('Fazendo commit...');
        const commitResult = await gitOps.commit(params.message);
        if (!commitResult.success) {
          throw new Error(`Falha ao fazer commit: ${commitResult.error}`);
        }
      }

      // 5. Configurar remote origin se necessário
      // console.log('Configurando remote origin...');
      const remoteUrl = provider.getRepositoryUrl(owner, params.repo);
      
      // Verificar se remote origin já existe
      const remoteResult = await gitOps.remote('show', 'origin');
      if (!remoteResult.success) {
        // Adicionar remote origin
        const addRemoteResult = await gitOps.remote('add', 'origin', remoteUrl);
        if (!addRemoteResult.success) {
          // Se falhou porque já existe, tentar atualizar a URL
          if (addRemoteResult.error?.includes('already exists')) {
            const setUrlResult = await gitOps.remote('set-url', 'origin', remoteUrl);
            if (!setUrlResult.success) {
              throw new Error(`Falha ao atualizar remote origin: ${setUrlResult.error}`);
            }
          } else {
            throw new Error(`Falha ao adicionar remote origin: ${addRemoteResult.error}`);
          }
        }
      } else {
        // Remote já existe, atualizar URL se necessário
        const setUrlResult = await gitOps.remote('set-url', 'origin', remoteUrl);
        if (!setUrlResult.success) {
          console.warn(`Aviso: Não foi possível atualizar URL do remote origin: ${setUrlResult.error}`);
        }
      }

      // 6. Fazer push para o repositório remoto
      // console.log('Fazendo push para repositório remoto...');
      const pushOptions = params.forcePush ? { force: true, setUpstream: true } : { setUpstream: true };
      const pushResult = await gitOps.push('origin', branch, pushOptions);
      
      if (!pushResult.success) {
        // Se falhou, tentar com --force se permitido
        if (params.forcePush) {
          throw new Error(`Falha ao fazer push: ${pushResult.error}`);
        } else {
          // console.log('Push falhou, tentando com --force...');
          const forcePushResult = await gitOps.push('origin', branch, { force: true, setUpstream: true });
          if (!forcePushResult.success) {
            throw new Error(`Falha ao fazer push (mesmo com --force): ${forcePushResult.error}`);
          }
        }
      }

      // 7. Contar arquivos enviados
      const files = await this.countProjectFiles(params.projectPath);
      
      return {
        success: true,
        action: 'upload',
        message: `Projeto enviado com sucesso! ${files} arquivos commitados e enviados para ${branch}`,
        data: {
          filesCommitted: files,
          branch: branch,
          remoteUrl: remoteUrl,
          repositoryCreated: !repoExists && params.createRepo,
          gitInit: !isGitRepo,
          commitMessage: params.message
        }
      };
    } catch (error) {
      throw new Error(`Falha ao fazer upload do projeto: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Conta arquivos do projeto (ignorando diretórios desnecessários)
   */
  async countProjectFiles(projectPath: string): Promise<number> {
    let count = 0;
    
    const processDirectory = async (dirPath: string): Promise<void> => {
      try {
        const items = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const item of items) {
          const fullPath = path.join(dirPath, item.name);
          
          if (item.isDirectory()) {
            // Pular diretórios que não devem ser contados
            if (item.name === 'node_modules' || item.name === '.git' || item.name === 'dist' || 
                item.name === 'build' || item.name === '.next' || item.name === 'coverage') {
              continue;
            }
            await processDirectory(fullPath);
          } else {
            // Pular arquivos que não devem ser contados
            if (item.name.endsWith('.log') || item.name.endsWith('.tmp') || 
                item.name.startsWith('.') || item.name.endsWith('.cache')) {
              continue;
            }
            count++;
          }
        }
      } catch (error) {
        // Ignorar erros de leitura de diretório
      }
    };
    
    await processDirectory(projectPath);
    return count;
  }
};


