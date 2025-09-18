import { z } from 'zod';
import { runGitCommand, runTerminalCmd } from '../utils/terminal-controller.js';
import { ErrorHandler } from '../providers/error-handler.js';

/**
 * Tool: git-archive
 * 
 * DESCRIÃ‡ÃƒO:
 * Gerenciamento de arquivos Git (GitHub + Gitea) com mÃºltiplas aÃ§Ãµes
 * 
 * FUNCIONALIDADES:
 * - Criar arquivo
 * - Extrair arquivo
 * - Listar conteÃºdo do arquivo
 * - Verificar arquivo
 * - Criar tarball
 * - Criar zip
 * 
 * USO:
 * - Para criar releases
 * - Para backup de cÃ³digo
 * - Para distribuiÃ§Ã£o de cÃ³digo
 * - Para deploy de versÃµes especÃ­ficas
 * 
 * RECOMENDAÃ‡Ã•ES:
 * - Use para releases oficiais
 * - Inclua apenas arquivos necessÃ¡rios
 * - Teste arquivos antes da distribuiÃ§Ã£o
 */

const GitArchiveInputSchema = z.object({
  action: z.enum(['create', 'extract', 'list', 'verify']),
  // owner: obtido automaticamente do provider,
  repo: z.string(),
  provider: z.enum(['gitea', 'github']).describe('Provider to use (gitea or github)'),
  projectPath: z.string().describe('Local project path for git operations'),
  
  // Para create
  archive_path: z.string().optional(),
  commit_or_tree: z.string().optional(),
  format: z.enum(['tar', 'zip', 'tar.gz', 'tar.bz2']).optional(),
  
  // Para extract
  archive_file: z.string().optional(),
  extract_path: z.string().optional(),
  
  // Para list
  list_archive: z.string().optional(),
  
  // Para verify
  verify_archive: z.string().optional(),
  
  // OpÃ§Ãµes
  prefix: z.string().optional(),
  output: z.string().optional(),
});

export type GitArchiveInput = z.infer<typeof GitArchiveInputSchema>;

const GitArchiveResultSchema = z.object({
  success: z.boolean(),
  action: z.string(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional()
});

export type GitArchiveResult = z.infer<typeof GitArchiveResultSchema>;

export const gitArchiveTool = {
  name: 'git-archive',
  description: 'tool: Gerencia arquivos Git para distribuiÃ§Ã£o e backup\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction create: cria arquivo compactado\naction create requires: repo, provider, projectPath, archive_path, commit_or_tree, format, prefix, output\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction extract: extrai arquivo compactado\naction extract requires: repo, provider, projectPath, archive_file, extract_path\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction list: lista conteÃºdo do arquivo\naction list requires: repo, provider, projectPath, list_archive\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\naction verify: verifica integridade do arquivo\naction verify requires: repo, provider, projectPath, verify_archive',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['create', 'extract', 'list', 'verify'],
        description: 'Action to perform on archives'
      },
      owner: { type: 'string', description: 'Repository owner' },
      repo: { type: 'string', description: 'Repository name' },
      provider: { type: 'string', enum: ['gitea', 'github'], description: 'Provider to use (gitea or github)' },
      projectPath: { type: 'string', description: 'Local project path for git operations' },
      archive_path: { type: 'string', description: 'Archive output path' },
      commit_or_tree: { type: 'string', description: 'Commit or tree to archive' },
      format: { type: 'string', enum: ['tar', 'zip', 'tar.gz', 'tar.bz2'], description: 'Archive format' },
      archive_file: { type: 'string', description: 'Archive file to extract' },
      extract_path: { type: 'string', description: 'Path to extract to' },
      list_archive: { type: 'string', description: 'Archive to list' },
      verify_archive: { type: 'string', description: 'Archive to verify' },
      prefix: { type: 'string', description: 'Prefix for archive entries' },
      output: { type: 'string', description: 'Output file path' }
    },
    required: ['action', 'repo', 'provider', 'projectPath']
  },

  async handler(input: GitArchiveInput): Promise<GitArchiveResult> {
    try {
      const validatedInput = GitArchiveInputSchema.parse(input);
      
      switch (validatedInput.action) {
        case 'create':
          return await this.create(validatedInput);
        case 'extract':
          return await this.extract(validatedInput);
        case 'list':
          return await this.list(validatedInput);
        case 'verify':
          return await this.verify(validatedInput);
        default:
          throw new Error(`AÃ§Ã£o nÃ£o suportada: ${validatedInput.action}`);
      }
    } catch (error) {
      return {
        success: false,
        action: input.action,
        message: 'Erro na operaÃ§Ã£o de archive',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  async create(params: GitArchiveInput): Promise<GitArchiveResult> {
    try {
      if (!params.archive_path || !params.commit_or_tree) {
        throw new Error('archive_path e commit_or_tree sÃ£o obrigatÃ³rios para create');
      }

      const format = params.format || 'tar.gz';
      let gitCommand = `archive --format=${format}`;
      
      if (params.prefix) {
        gitCommand += ` --prefix=${params.prefix}/`;
      }
      
      if (params.output) {
        gitCommand += ` --output=${params.output}`;
      }
      
      gitCommand += ` ${params.commit_or_tree}`;

      const result = await runGitCommand(
        gitCommand,
        params.projectPath,
        'Criando arquivo'
      );

      if (result.exitCode !== 0) {
        throw new Error(`Falha ao criar arquivo: ${result.output}`);
      }

      return {
        success: true,
        action: 'create',
        message: `Arquivo criado com sucesso: ${params.archive_path}`,
        data: {
          archive_path: params.archive_path,
          commit_or_tree: params.commit_or_tree,
          format,
          prefix: params.prefix,
          output: params.output,
          output_result: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao criar arquivo: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async extract(params: GitArchiveInput): Promise<GitArchiveResult> {
    try {
      if (!params.archive_file || !params.extract_path) {
        throw new Error('archive_file e extract_path sÃ£o obrigatÃ³rios para extract');
      }

      const result = await runTerminalCmd({
        command: `tar -xf ${params.archive_file} -C ${params.extract_path}`,
        is_background: false,
        explanation: 'Extraindo arquivo',
        projectPath: params.projectPath
      });

      if (result.exitCode !== 0) {
        throw new Error(`Falha ao extrair arquivo: ${result.output}`);
      }

      return {
        success: true,
        action: 'extract',
        message: `Arquivo extraÃ­do com sucesso para ${params.extract_path}`,
        data: {
          archive_file: params.archive_file,
          extract_path: params.extract_path,
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao extrair arquivo: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async list(params: GitArchiveInput): Promise<GitArchiveResult> {
    try {
      if (!params.list_archive) {
        throw new Error('list_archive Ã© obrigatÃ³rio para list');
      }

      const result = await runTerminalCmd({
        command: `tar -tf ${params.list_archive}`,
        is_background: false,
        explanation: 'Listando conteÃºdo do arquivo',
        projectPath: params.projectPath
      });

      if (result.exitCode !== 0) {
        throw new Error(`Falha ao listar arquivo: ${result.output}`);
      }

      const files = result.output.split('\n').filter((line: string) => line.trim());

      return {
        success: true,
        action: 'list',
        message: `ConteÃºdo do arquivo listado com sucesso: ${params.list_archive}`,
        data: {
          archive: params.list_archive,
          files,
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao listar arquivo: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  async verify(params: GitArchiveInput): Promise<GitArchiveResult> {
    try {
      if (!params.verify_archive) {
        throw new Error('verify_archive Ã© obrigatÃ³rio para verify');
      }

      const result = await runTerminalCmd({
        command: `tar -tf ${params.verify_archive} > /dev/null`,
        is_background: false,
        explanation: 'Verificando arquivo',
        projectPath: params.projectPath
      });

      const isValid = result.exitCode === 0;

      return {
        success: true,
        action: 'verify',
        message: `Arquivo ${isValid ? 'vÃ¡lido' : 'invÃ¡lido'}: ${params.verify_archive}`,
        data: {
          archive: params.verify_archive,
          valid: isValid,
          output: result.output
        }
      };
    } catch (error) {
      throw new Error(`Falha ao verificar arquivo: ${error instanceof Error ? error.message : String(error)}`);
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

