import { z } from 'zod';
import { globalProviderFactory, VcsOperations } from '../providers/index.js';
import { applyAutoUserDetection } from '../utils/user-detection.js';
import { GitOperations } from '../utils/git-operations.js';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Tool: git-initialize
 * 
 * DESCRIÇÃO:
 * Inicialização completa de repositório Git - 100% AUTÔNOMO
 * 
 * FUNCIONALIDADES:
 * - Inicialização de repositório Git local
 * - Configuração automática de usuário Git
 * - Criação de repositório remoto (GitHub/Gitea)
 * - Configuração de remote origin
 * - Criação de arquivos iniciais (.gitignore, README.md)
 * - Primeiro commit automático
 * - Configuração de branch padrão
 * - Suporte a GitHub e Gitea
 * - Não depende de outras tools
 * 
 * USO:
 * - Para inicializar projeto do zero
 * - Para configurar repositório Git completo
 * - Para setup automático de projeto
 * - Para migração de projeto não-Git
 * 
 * RECOMENDAÇÕES:
 * - Use mensagens de commit descritivas
 * - A tool faz todo o processo automaticamente
 * - Funciona mesmo sem configuração Git prévia
 * - Cria repositório remoto se não existir
 */

/**
 * Schema de validação para entrada da tool git-initialize
 */
const InitializeInputSchema = z.object({
  action: z.enum(['init']),
  repo: z.string().optional(),
  projectPath: z.string().describe('Local project path for git operations'),
  provider: z.enum(['gitea', 'github']).optional().default('gitea'),
  message: z.string().optional().default('Initial commit'),
  branch: z.string().optional().default('main'),
  createRemote: z.boolean().optional().default(false),
  createReadme: z.boolean().optional().default(true),
  createGitignore: z.boolean().optional().default(true),
  userName: z.string().optional(),
  userEmail: z.string().optional(),
  description: z.string().optional(),
  private: z.boolean().optional().default(false),
});

export type InitializeInput = z.infer<typeof InitializeInputSchema>;

/**
 * Schema de saída padronizado
 */
const InitializeResultSchema = z.object({
  success: z.boolean(),
  action: z.string(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional()
});

export type InitializeResult = z.infer<typeof InitializeResultSchema>;

/**
 * Tool: git-initialize
 * 
 * DESCRIÇÃO:
 * Inicialização completa de repositório Git - 100% AUTÔNOMO
 * 
 * ACTIONS DISPONÍVEIS:
 * 
 * 1. init - Inicialização completa de repositório
 *    Parâmetros:
 *    - projectPath (obrigatório): Caminho do projeto local
 *    - repo (opcional): Nome do repositório remoto
 *    - provider (opcional): Provider (gitea/github, padrão: gitea)
 *    - message (opcional): Mensagem do commit inicial (padrão: "Initial commit")
 *    - branch (opcional): Branch padrão (padrão: main)
 *    - createRemote (opcional): Criar repositório remoto (padrão: false)
 *    - createReadme (opcional): Criar README.md (padrão: true)
 *    - createGitignore (opcional): Criar .gitignore (padrão: true)
 *    - userName (opcional): Nome do usuário Git
 *    - userEmail (opcional): Email do usuário Git
 *    - description (opcional): Descrição do repositório
 *    - private (opcional): Repositório privado (padrão: false)
 * 
 * RECOMENDAÇÕES DE USO:
 * - Use para inicializar projetos do zero
 * - Configure usuário Git automaticamente
 * - Crie repositórios remotos quando necessário
 * - Personalize arquivos iniciais conforme necessário
 */
export const initializeTool = {
  name: 'git-initialize',
  description: 'tool: Inicialização completa de repositório Git - 100% AUTÔNOMO\n──────────────\naction init: inicializa repositório Git com configuração completa\naction init requires: projectPath, repo, provider, message, branch, createRemote, createReadme, createGitignore, userName, userEmail, description, private',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['init'],
        description: 'Action to perform on git initialization'
      },
      repo: { type: 'string', description: 'Repository name (optional)' },
      projectPath: { type: 'string', description: 'Local project path for git operations' },
      provider: { type: 'string', description: 'Provider to use (gitea, github, default: gitea)' },
      message: { type: 'string', description: 'Initial commit message (default: "Initial commit")' },
      branch: { type: 'string', description: 'Default branch (default: main)' },
      createRemote: { type: 'boolean', description: 'Create remote repository (default: false)' },
      createReadme: { type: 'boolean', description: 'Create README.md (default: true)' },
      createGitignore: { type: 'boolean', description: 'Create .gitignore (default: true)' },
      userName: { type: 'string', description: 'Git user name (optional)' },
      userEmail: { type: 'string', description: 'Git user email (optional)' },
      description: { type: 'string', description: 'Repository description (optional)' },
      private: { type: 'boolean', description: 'Private repository (default: false)' }
    },
    required: ['action', 'projectPath']
  },

  /**
   * Handler principal da tool git-initialize
   */
  async handler(input: InitializeInput): Promise<InitializeResult> {
    try {
      const validatedInput = InitializeInputSchema.parse(input);
      
      // Aplicar auto-detecção apenas para owner dentro do provider especificado
      const processedInput = await applyAutoUserDetection(validatedInput, validatedInput.provider);
      
      // Usar o provider especificado pelo usuário
      const provider = globalProviderFactory.getProvider(processedInput.provider);
      
      if (!provider) {
        throw new Error(`Provider '${processedInput.provider}' não encontrado`);
      }
      
      switch (processedInput.action) {
        case 'init':
          return await initializeTool.initializeRepository(processedInput, provider);
        default:
          throw new Error(`Ação não suportada: ${processedInput.action}`);
      }
    } catch (error) {
      return {
        success: false,
        action: input.action,
        message: 'Erro na operação de inicialização Git',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  /**
   * Inicializa repositório Git completo - 100% AUTÔNOMO
   * Processo completo: init -> config -> files -> commit -> remote -> push
   */
  async initializeRepository(params: InitializeInput, provider: VcsOperations): Promise<InitializeResult> {
    try {
      if (!params.projectPath) {
        throw new Error('projectPath é obrigatório');
      }

      // owner já foi auto-detectado em applyAutoUserDetection e está disponível via provider.getCurrentUser
      const currentUser = await provider.getCurrentUser();
      const owner = currentUser.login;
      const branch = params.branch || 'main';
      const repoName = params.repo || path.basename(params.projectPath);

      // Inicializar operações Git locais
      const gitOps = new GitOperations(params.projectPath);
      
      // Verificar se já é um repositório Git
      const isGitRepo = await gitOps.isGitRepository();
      
      if (isGitRepo) {
        return {
          success: true,
          action: 'init',
          message: 'Repositório Git já existe neste diretório',
          data: {
            alreadyInitialized: true,
            projectPath: params.projectPath,
            branch: branch
          }
        };
      }

<<<<<<< HEAD
      // 1. Inicializar repositÃ³rio Git
      // console.log('Inicializando repositÃ³rio Git...');
=======
      // 1. Inicializar repositório Git
      console.log('Inicializando repositório Git...');
>>>>>>> parent of 6dfc0a9 (error handleing)
      const initResult = await gitOps.initRepository();
      if (!initResult.success) {
        throw new Error(`Falha ao inicializar repositório Git: ${initResult.error}`);
      }

      // 2. Configurar usuário Git
      console.log('Configurando usuário Git...');
      if (params.userName) {
        const nameResult = await gitOps.config('user.name', params.userName, { local: true });
        if (!nameResult.success) {
          console.warn(`Aviso: Falha ao configurar user.name: ${nameResult.error}`);
        }
      }
      
      if (params.userEmail) {
        const emailResult = await gitOps.config('user.email', params.userEmail, { local: true });
        if (!emailResult.success) {
          console.warn(`Aviso: Falha ao configurar user.email: ${emailResult.error}`);
        }
      }

      // 3. Configurar branch padrão
      console.log('Configurando branch padrão...');
      const branchResult = await gitOps.checkout(branch, { create: true });
      if (!branchResult.success) {
        throw new Error(`Falha ao criar branch ${branch}: ${branchResult.error}`);
      }

      // 4. Criar arquivos iniciais
      console.log('Criando arquivos iniciais...');
      const filesCreated = await this.createInitialFiles(params);

      // 5. Adicionar arquivos ao staging
      console.log('Adicionando arquivos ao staging...');
      const addResult = await gitOps.addFiles(['.']);
      if (!addResult.success) {
        throw new Error(`Falha ao adicionar arquivos: ${addResult.error}`);
      }

      // 6. Fazer commit inicial
      console.log('Fazendo commit inicial...');
      const commitResult = await gitOps.commit(params.message || 'Initial commit');
      if (!commitResult.success) {
        throw new Error(`Falha ao fazer commit inicial: ${commitResult.error}`);
      }

      let remoteCreated = false;
      let remoteUrl = '';

      // 7. Criar repositório remoto se solicitado
      if (params.createRemote) {
        console.log('Criando repositório remoto...');
        try {
          await provider.createRepository(repoName, params.description || `Projeto ${repoName}`, params.private);
          remoteCreated = true;
          
          // Configurar remote origin
          remoteUrl = provider.getRepositoryUrl(owner, repoName);
          const addRemoteResult = await gitOps.remote('add', 'origin', remoteUrl);
          if (!addRemoteResult.success) {
            throw new Error(`Falha ao adicionar remote origin: ${addRemoteResult.error}`);
          }

          // Fazer push inicial
          console.log('Fazendo push inicial...');
          const pushResult = await gitOps.push('origin', branch, { setUpstream: true });
          if (!pushResult.success) {
            console.warn(`Aviso: Falha ao fazer push inicial: ${pushResult.error}`);
          }
        } catch (error) {
          console.warn(`Aviso: Falha ao criar repositório remoto: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      
      return {
        success: true,
        action: 'init',
        message: `Repositório Git inicializado com sucesso! ${filesCreated} arquivos criados`,
        data: {
          projectPath: params.projectPath,
          branch: branch,
          filesCreated: filesCreated,
          remoteCreated: remoteCreated,
          remoteUrl: remoteUrl,
          repositoryName: repoName,
          provider: params.provider,
          commitMessage: params.message || 'Initial commit'
        }
      };
    } catch (error) {
      throw new Error(`Falha ao inicializar repositório Git: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Cria arquivos iniciais do projeto
   */
  async createInitialFiles(params: InitializeInput): Promise<number> {
    let filesCreated = 0;
    const projectPath = params.projectPath;

    // Criar README.md se solicitado
    if (params.createReadme) {
      const readmePath = path.join(projectPath, 'README.md');
      try {
        await fs.access(readmePath);
        // Arquivo já existe, não sobrescrever
      } catch {
        const readmeContent = `# ${params.repo || path.basename(projectPath)}

${params.description || 'Projeto inicializado com git-initialize'}

## Instalação

\`\`\`bash
# Instalar dependências
npm install
\`\`\`

## Uso

\`\`\`bash
# Executar projeto
npm start
\`\`\`

## Desenvolvimento

\`\`\`bash
# Modo desenvolvimento
npm run dev
\`\`\`

## Licença

MIT
`;
        await fs.writeFile(readmePath, readmeContent, 'utf-8');
        filesCreated++;
      }
    }

    // Criar .gitignore se solicitado
    if (params.createGitignore) {
      const gitignorePath = path.join(projectPath, '.gitignore');
      try {
        await fs.access(gitignorePath);
        // Arquivo já existe, não sobrescrever
      } catch {
        const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
dist/
build/
.next/
out/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Temporary folders
tmp/
temp/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port
`;
        await fs.writeFile(gitignorePath, gitignoreContent, 'utf-8');
        filesCreated++;
      }
    }

    return filesCreated;
<<<<<<< HEAD
  },

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
=======
>>>>>>> parent of 6dfc0a9 (error handleing)
  }
};


