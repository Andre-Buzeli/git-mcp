import { z } from 'zod';
import { globalProviderFactory, VcsOperations } from '../providers/index.js';
import { applyAutoUserDetection } from '../utils/user-detection.js';
import { GitOperations } from '../utils/git-operations.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { ErrorHandler } from '../providers/error-handler.js';

/**
 * Tool: git-initialize
 * 
 * DESCRIÃ‡ÃƒO:
 * InicializaÃ§Ã£o completa de repositÃ³rio Git - 100% AUTÃ”NOMO
 * 
 * FUNCIONALIDADES:
 * - InicializaÃ§Ã£o de repositÃ³rio Git local
 * - ConfiguraÃ§Ã£o automÃ¡tica de usuÃ¡rio Git
 * - CriaÃ§Ã£o de repositÃ³rio remoto (GitHub/Gitea)
 * - ConfiguraÃ§Ã£o de remote origin
 * - CriaÃ§Ã£o de arquivos iniciais (.gitignore, README.md)
 * - Primeiro commit automÃ¡tico
 * - ConfiguraÃ§Ã£o de branch padrÃ£o
 * - Suporte a GitHub e Gitea
 * - NÃ£o depende de outras tools
 * 
 * USO:
 * - Para inicializar projeto do zero
 * - Para configurar repositÃ³rio Git completo
 * - Para setup automÃ¡tico de projeto
 * - Para migraÃ§Ã£o de projeto nÃ£o-Git
 * 
 * RECOMENDAÃ‡Ã•ES:
 * - Use mensagens de commit descritivas
 * - A tool faz todo o processo automaticamente
 * - Funciona mesmo sem configuraÃ§Ã£o Git prÃ©via
 * - Cria repositÃ³rio remoto se nÃ£o existir
 */

/**
 * Schema de validaÃ§Ã£o para entrada da tool git-initialize
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
 * Schema de saÃ­da padronizado
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
 * DESCRIÃ‡ÃƒO:
 * InicializaÃ§Ã£o completa de repositÃ³rio Git - 100% AUTÃ”NOMO
 * 
 * ACTIONS DISPONÃVEIS:
 * 
 * 1. init - InicializaÃ§Ã£o completa de repositÃ³rio
 *    ParÃ¢metros:
 *    - projectPath (obrigatÃ³rio): Caminho do projeto local
 *    - repo (opcional): Nome do repositÃ³rio remoto
 *    - provider (opcional): Provider (gitea/github, padrÃ£o: gitea)
 *    - message (opcional): Mensagem do commit inicial (padrÃ£o: "Initial commit")
 *    - branch (opcional): Branch padrÃ£o (padrÃ£o: main)
 *    - createRemote (opcional): Criar repositÃ³rio remoto (padrÃ£o: false)
 *    - createReadme (opcional): Criar README.md (padrÃ£o: true)
 *    - createGitignore (opcional): Criar .gitignore (padrÃ£o: true)
 *    - userName (opcional): Nome do usuÃ¡rio Git
 *    - userEmail (opcional): Email do usuÃ¡rio Git
 *    - description (opcional): DescriÃ§Ã£o do repositÃ³rio
 *    - private (opcional): RepositÃ³rio privado (padrÃ£o: false)
 * 
 * RECOMENDAÃ‡Ã•ES DE USO:
 * - Use para inicializar projetos do zero
 * - Configure usuÃ¡rio Git automaticamente
 * - Crie repositÃ³rios remotos quando necessÃ¡rio
 * - Personalize arquivos iniciais conforme necessÃ¡rio
 */
export const initializeTool = {
  name: 'git-initialize',
  description: 'tool: InicializaÃ§Ã£o completa de repositÃ³rio Git - 100% AUTÃ”NOMO\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction init: inicializa repositÃ³rio Git com configuraÃ§Ã£o completa\naction init requires: projectPath, repo, provider, message, branch, createRemote, createReadme, createGitignore, userName, userEmail, description, private',
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
      
      // Aplicar auto-detecÃ§Ã£o apenas para owner dentro do provider especificado
      const processedInput = await applyAutoUserDetection(validatedInput, validatedInput.provider);
      
      // Usar o provider especificado pelo usuÃ¡rio
      const provider = globalProviderFactory.getProvider(processedInput.provider);
      
      if (!provider) {
        throw new Error(`Provider '${processedInput.provider}' nÃ£o encontrado`);
      }
      
      switch (processedInput.action) {
        case 'init':
          return await initializeTool.initializeRepository(processedInput, provider);
        default:
          throw new Error(`AÃ§Ã£o nÃ£o suportada: ${processedInput.action}`);
      }
    } catch (error) {
      return {
        success: false,
        action: input.action,
        message: 'Erro na operaÃ§Ã£o de inicializaÃ§Ã£o Git',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  /**
   * Inicializa repositÃ³rio Git completo - 100% AUTÃ”NOMO
   * Processo completo: init -> config -> files -> commit -> remote -> push
   */
  async initializeRepository(params: InitializeInput, provider: VcsOperations): Promise<InitializeResult> {
    try {
      if (!params.projectPath) {
        throw new Error('projectPath Ã© obrigatÃ³rio');
      }

      // owner jÃ¡ foi auto-detectado em applyAutoUserDetection e estÃ¡ disponÃ­vel via provider.getCurrentUser
      const currentUser = await provider.getCurrentUser();
      const owner = currentUser.login;
      const branch = params.branch || 'main';
      const repoName = params.repo || path.basename(params.projectPath);

      // Inicializar operaÃ§Ãµes Git locais
      const gitOps = new GitOperations(params.projectPath);
      
      // Verificar se jÃ¡ Ã© um repositÃ³rio Git
      const isGitRepo = await gitOps.isGitRepository();
      
      if (isGitRepo) {
        return {
          success: true,
          action: 'init',
          message: 'RepositÃ³rio Git jÃ¡ existe neste diretÃ³rio',
          data: {
            alreadyInitialized: true,
            projectPath: params.projectPath,
            branch: branch
          }
        };
      }

      // 1. Inicializar repositÃ³rio Git
      console.log('Inicializando repositÃ³rio Git...');
      const initResult = await gitOps.initRepository();
      if (!initResult.success) {
        throw new Error(`Falha ao inicializar repositÃ³rio Git: ${initResult.error}`);
      }

      // 2. Configurar usuÃ¡rio Git
      console.log('Configurando usuÃ¡rio Git...');
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

      // 3. Configurar branch padrÃ£o
      console.log('Configurando branch padrÃ£o...');
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

      // 7. Criar repositÃ³rio remoto se solicitado
      if (params.createRemote) {
        console.log('Criando repositÃ³rio remoto...');
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
          console.warn(`Aviso: Falha ao criar repositÃ³rio remoto: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      
      return {
        success: true,
        action: 'init',
        message: `RepositÃ³rio Git inicializado com sucesso! ${filesCreated} arquivos criados`,
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
      throw new Error(`Falha ao inicializar repositÃ³rio Git: ${error instanceof Error ? error.message : String(error)}`);
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
        // Arquivo jÃ¡ existe, nÃ£o sobrescrever
      } catch {
        const readmeContent = `# ${params.repo || path.basename(projectPath)}

${params.description || 'Projeto inicializado com git-initialize'}

## InstalaÃ§Ã£o

\`\`\`bash
# Instalar dependÃªncias
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

## LicenÃ§a

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
        // Arquivo jÃ¡ existe, nÃ£o sobrescrever
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

