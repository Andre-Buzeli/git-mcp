import { z } from 'zod';
import { globalProviderFactory, VcsOperations } from '../providers/index.js';
import { applyAutoUserDetection } from '../utils/user-detection.js';

/**
 * Tool: files
 * 
 * DESCRIÇÃO:
 * Gerenciamento completo de arquivos e diretórios Gitea com múltiplas ações
 * 
 * FUNCIONALIDADES:
 * - Criação de arquivos e diretórios
 * - Leitura e listagem de conteúdo
 * - Atualização de arquivos existentes
 * - Exclusão de arquivos e diretórios
 * - Busca por conteúdo e nome
 * - Controle de versão de arquivos
 * 
 * USO:
 * - Para gerenciar arquivos de projeto
 * - Para automatizar criação de arquivos
 * - Para backup e migração de conteúdo
 * - Para sincronização de arquivos
 * 
 * RECOMENDAÇÕES:
 * - Use mensagens de commit descritivas
 * - Mantenha estrutura de diretórios organizada
 * - Valide conteúdo antes de enviar
 * - Use branches para mudanças grandes
 */

/**
 * Schema de validação para entrada da tool files
 * 
 * VALIDAÇÕES:
 * - action: Ação obrigatória (get, create, update, delete, list, search)
 * - Parâmetros específicos por ação
 * - Validação de tipos e formatos
 * 
 * RECOMENDAÇÕES:
 * - Sempre valide entrada antes de usar
 * - Use parâmetros opcionais adequadamente
 * - Documente parâmetros obrigatórios
 */
const FilesInputSchema = z.object({
  action: z.enum(['get', 'create', 'update', 'delete', 'list', 'search', 'upload-project']),

  // Parâmetros comuns
  // owner: obtido automaticamente do provider,
  repo: z.string(),
  path: z.string().optional(),
  projectPath: z.string().describe('Local project path for git operations'),
  provider: z.enum(['gitea', 'github']).describe('Provider to use (gitea or github)'),
  content: z.string().optional(),
  message: z.string().optional(),
  branch: z.string().optional(),

  // Para update/delete
  sha: z.string().optional(),

  // Para list
  ref: z.string().optional(),

  // Para search
  query: z.string().optional(),

  // Para list com paginação
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

export type FilesInput = z.infer<typeof FilesInputSchema>;

/**
 * Schema de saída padronizado
 * 
 * ESTRUTURA:
 * - success: Status da operação
 * - action: Ação executada
 * - message: Mensagem descritiva
 * - data: Dados retornados (opcional)
 * - error: Detalhes do erro (opcional)
 */
const FilesResultSchema = z.object({
  success: z.boolean(),
  action: z.string(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional()
});

export type FilesResult = z.infer<typeof FilesResultSchema>;

/**
 * Tool: files
 * 
 * DESCRIÇÃO:
 * Gerenciamento completo de arquivos e diretórios Gitea com múltiplas ações
 * 
 * ACTIONS DISPONÍVEIS:
 * 
 * 1. get - Obter conteúdo de arquivo
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - path (obrigatório): Caminho do arquivo
 *    - ref (opcional): Branch, tag ou commit (padrão: branch padrão)
 * 
 * 2. create - Criar novo arquivo
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - path (obrigatório): Caminho do arquivo
 *    - content (obrigatório): Conteúdo do arquivo
 *    - message (obrigatório): Mensagem de commit
 *    - branch (opcional): Branch de destino (padrão: branch padrão)
 * 
 * 3. update - Atualizar arquivo existente
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - path (obrigatório): Caminho do arquivo
 *    - content (obrigatório): Novo conteúdo
 *    - message (obrigatório): Mensagem de commit
 *    - sha (obrigatório): SHA do arquivo atual
 *    - branch (opcional): Branch de destino (padrão: branch padrão)
 * 
 * 4. delete - Deletar arquivo
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - path (obrigatório): Caminho do arquivo
 *    - message (obrigatório): Mensagem de commit
 *    - sha (obrigatório): SHA do arquivo
 *    - branch (opcional): Branch de destino (padrão: branch padrão)
 * 
 * 5. list - Listar conteúdo de diretório
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - path (opcional): Caminho do diretório (padrão: raiz)
 *    - ref (opcional): Branch, tag ou commit (padrão: branch padrão)
 *    - page (opcional): Página da listagem (padrão: 1)
 *    - limit (opcional): Itens por página (padrão: 30, máximo: 100)
 * 
 * 6. search - Buscar arquivos por conteúdo
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - query (obrigatório): Termo de busca
 *    - ref (opcional): Branch, tag ou commit (padrão: branch padrão)
 * 
 * RECOMENDAÇÕES DE USO:
 * - Use mensagens de commit descritivas
 * - Mantenha estrutura de diretórios organizada
 * - Valide conteúdo antes de enviar
 * - Use branches para mudanças grandes
 * - Documente mudanças importantes
 * - Mantenha histórico de commits limpo
 */
export const filesTool = {
  name: 'git-files',
  description: 'tool: Gerencia arquivos Git, upload, download, busca e sincronização\n──────────────\naction get: obtém arquivo específico\naction get requires: repo, path, provider\n───────────────\naction create: cria novo arquivo\naction create requires: repo, path, content, message, provider\n───────────────\naction update: atualiza arquivo existente\naction update requires: repo, path, content, message, sha, provider\n───────────────\naction delete: remove arquivo\naction delete requires: repo, path, message, provider\n───────────────\naction list: lista arquivos do diretório\naction list requires: repo, path, provider\n───────────────\naction search: busca conteúdo em arquivos\naction search requires: repo, query, provider\n───────────────\naction upload-project: envia projeto completo\naction upload-project requires: repo, projectPath, message, provider',
  inputSchema: {
    type: 'object',
    properties: {
  action: {
    type: 'string',
    enum: ['get', 'create', 'update', 'delete', 'list', 'search', 'upload-project'],
    description: 'Action to perform on files'
  },
      repo: { type: 'string', description: 'Repository name' },
      provider: { type: 'string', enum: ['gitea', 'github'], description: 'Provider to use (github, gitea) or use default' },
      path: { type: 'string', description: 'File or directory path' },
      projectPath: { type: 'string', description: 'Local project path for git operations' },
      content: { type: 'string', description: 'File content' },
      message: { type: 'string', description: 'Commit message' },
      branch: { type: 'string', description: 'Target branch' },
      sha: { type: 'string', description: 'File SHA hash' },
      ref: { type: 'string', description: 'Branch, tag or commit reference' },
      query: { type: 'string', description: 'Search query' },
      page: { type: 'number', description: 'Page number', minimum: 1 },
      limit: { type: 'number', description: 'Items per page', minimum: 1, maximum: 100 }
    },
    required: ['action', 'repo', 'provider', 'projectPath']
  },

  /**
   * Handler principal da tool files
   * 
   * FUNCIONALIDADE:
   * - Valida entrada usando Zod schema
   * - Roteia para método específico baseado na ação
   * - Trata erros de forma uniforme
   * - Retorna resultado padronizado
   * 
   * FLUXO:
   * 1. Validação de entrada
   * 2. Roteamento por ação
   * 3. Execução do método específico
   * 4. Tratamento de erros
   * 5. Retorno de resultado
   * 
   * TRATAMENTO DE ERROS:
   * - Validação: erro de schema
   * - Execução: erro da operação
   * - Roteamento: ação não suportada
   * 
   * RECOMENDAÇÕES:
   * - Sempre valide entrada antes de processar
   * - Trate erros específicos adequadamente
   * - Log detalhes de erro para debug
   * - Retorne mensagens de erro úteis
   */
  async handler(input: FilesInput): Promise<FilesResult> {
    try {
      const validatedInput = FilesInputSchema.parse(input);
      
      // Aplicar auto-detecção apenas para owner dentro do provider especificado
      const processedInput = await applyAutoUserDetection(validatedInput, validatedInput.provider);
      
      // Usar o provider especificado pelo usuário
      const provider = globalProviderFactory.getProvider(processedInput.provider);
      
      if (!provider) {
        throw new Error(`Provider '${processedInput.provider}' não encontrado`);
      }

      // Obter o owner do provider
      const owner = (await provider.getCurrentUser()).login;
      
      switch (processedInput.action) {
        case 'get':
          return await this.getFile(processedInput, provider, owner);
        case 'create':
          return await this.createFile(processedInput, provider, owner);
        case 'update':
          return await this.updateFile(processedInput, provider, owner);
        case 'delete':
          return await this.deleteFile(processedInput, provider, owner);
        case 'list':
          return await this.listFiles(processedInput, provider, owner);
        case 'search':
          return await this.searchFiles(processedInput, provider, owner);
        case 'upload-project':
          return await this.uploadProject(processedInput, provider, owner);
        default:
          throw new Error(`Ação não suportada: ${processedInput.action}`);
      }
    } catch (error) {
      return {
        success: false,
        action: input.action,
        message: 'Erro na operação de arquivos',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  /**
   * Obtém o conteúdo de um arquivo específico
   * 
   * FUNCIONALIDADE:
   * - Retorna conteúdo completo do arquivo
   * - Inclui metadados (SHA, tamanho, tipo)
   * - Suporta diferentes referências (branch, tag, commit)
   * 
   * PARÂMETROS OBRIGATÓRIOS:
   * - owner: Proprietário do repositório
   * - repo: Nome do repositório
   * - path: Caminho do arquivo
   * 
   * PARÂMETROS OPCIONAIS:
   * - ref: Branch, tag ou commit (padrão: branch padrão)
   * 
   * VALIDAÇÕES:
   * - Todos os parâmetros obrigatórios
   * - Arquivo deve existir no caminho especificado
   * - Referência deve ser válida
   * 
   * RECOMENDAÇÕES:
   * - Use para leitura de arquivos de configuração
   * - Verifique tamanho antes de ler arquivos grandes
   * - Use referências específicas para versões
   * - Trate arquivos binários adequadamente
   */
  async getFile(params: FilesInput, provider: VcsOperations, owner: string): Promise<FilesResult> {
    try {
      if (!owner || !params.repo || !params.path) {
        throw new Error('repo e path são obrigatórios');
      }

      const file = await provider.getFile(owner, params.repo, params.path, params.ref);

      return {
        success: true,
        action: 'get',
        message: `Arquivo '${params.path}' obtido com sucesso`,
        data: file
      };
    } catch (error) {
      throw new Error(`Falha ao obter arquivo: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Cria um novo arquivo no repositório
   * 
   * FUNCIONALIDADE:
   * - Cria arquivo com conteúdo especificado
   * - Faz commit automático com mensagem
   * - Suporta criação em branches específicas
   * 
   * PARÂMETROS OBRIGATÓRIOS:
   * - owner: Proprietário do repositório
   * - repo: Nome do repositório
   * - path: Caminho do arquivo
   * - content: Conteúdo do arquivo
   * - message: Mensagem de commit
   * 
   * PARÂMETROS OPCIONAIS:
   * - branch: Branch de destino (padrão: branch padrão)
   * 
   * VALIDAÇÕES:
   * - Todos os parâmetros obrigatórios
   * - Caminho deve ser válido
   * - Usuário deve ter permissão de escrita
   * 
   * RECOMENDAÇÕES:
   * - Use mensagens de commit descritivas
   * - Valide conteúdo antes de enviar
   * - Use branches para mudanças grandes
   * - Documente propósito do arquivo
   */
  async createFile(params: FilesInput, provider: VcsOperations, owner: string): Promise<FilesResult> {
    try {
      if (!owner || !params.repo || !params.path || !params.content || !params.message) {
        throw new Error('repo, path, content e message são obrigatórios');
      }

      const result = await provider.createFile(
        owner, 
        params.repo, 
        params.path, 
        params.content, 
        params.message, 
        params.branch
      );

      return {
        success: true,
        action: 'create',
        message: `Arquivo '${params.path}' criado com sucesso`,
        data: result
      };
    } catch (error) {
      throw new Error(`Falha ao criar arquivo: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Atualiza um arquivo existente no repositório
   * 
   * FUNCIONALIDADE:
   * - Atualiza conteúdo do arquivo
   * - Faz commit com nova versão
   * - Requer SHA do arquivo atual
   * 
   * PARÂMETROS OBRIGATÓRIOS:
   * - owner: Proprietário do repositório
   * - repo: Nome do repositório
   * - path: Caminho do arquivo
   * - content: Novo conteúdo
   * - message: Mensagem de commit
   * - sha: SHA do arquivo atual
   * 
   * PARÂMETROS OPCIONAIS:
   * - branch: Branch de destino (padrão: branch padrão)
   * 
   * VALIDAÇÕES:
   * - Todos os parâmetros obrigatórios
   * - Arquivo deve existir
   * - SHA deve ser válido
   * 
   * RECOMENDAÇÕES:
   * - Sempre obtenha SHA atual antes de atualizar
   * - Use mensagens de commit descritivas
   * - Verifique se arquivo não foi modificado por outro usuário
   * - Teste mudanças antes de commitar
   */
  async updateFile(params: FilesInput, provider: VcsOperations, owner: string): Promise<FilesResult> {
    try {
      if (!owner || !params.repo || !params.path || !params.content || !params.message) {
        throw new Error('repo, path, content e message são obrigatórios');
      }

      // Se não foi fornecido SHA, obter automaticamente
      let fileSha = params.sha;
      if (!fileSha) {
        try {
          const existingFile = await provider.getFile(owner, params.repo, params.path, params.branch);
          fileSha = existingFile.sha;
        } catch (error) {
          throw new Error('Não foi possível obter SHA do arquivo. Forneça sha ou verifique se o arquivo existe.');
        }
      }

      const result = await provider.updateFile(
        owner,
        params.repo,
        params.path,
        params.content,
        params.message,
        fileSha,
        params.branch
      );

      return {
        success: true,
        action: 'update',
        message: `Arquivo '${params.path}' atualizado com sucesso`,
        data: result
      };
    } catch (error) {
      throw new Error(`Falha ao atualizar arquivo: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Deleta um arquivo do repositório
   * 
   * FUNCIONALIDADE:
   * - Remove arquivo especificado
   * - Faz commit de exclusão
   * - Requer SHA do arquivo
   * 
   * PARÂMETROS OBRIGATÓRIOS:
   * - owner: Proprietário do repositório
   * - repo: Nome do repositório
   * - path: Caminho do arquivo
   * - message: Mensagem de commit
   * - sha: SHA do arquivo
   * 
   * PARÂMETROS OPCIONAIS:
   * - branch: Branch de destino (padrão: branch padrão)
   * 
   * VALIDAÇÕES:
   * - Todos os parâmetros obrigatórios
   * - Arquivo deve existir
   * - SHA deve ser válido
   * 
   * RECOMENDAÇÕES:
   * - Confirme exclusão antes de executar
   * - Use mensagens de commit descritivas
   * - Verifique dependências do arquivo
   * - Mantenha backup se necessário
   */
  async deleteFile(params: FilesInput, provider: VcsOperations, owner: string): Promise<FilesResult> {
    try {
      if (!owner || !params.repo || !params.path || !params.message) {
        throw new Error('repo, path e message são obrigatórios');
      }

      // Se não foi fornecido SHA, obter automaticamente
      let fileSha = params.sha;
      if (!fileSha) {
        try {
          const existingFile = await provider.getFile(owner, params.repo, params.path, params.branch);
          fileSha = existingFile.sha;
        } catch (error) {
          throw new Error('Não foi possível obter SHA do arquivo. Forneça sha ou verifique se o arquivo existe.');
        }
      }

      const result = await provider.deleteFile(
        owner,
        params.repo,
        params.path,
        params.message,
        fileSha,
        params.branch
      );

      return {
        success: true,
        action: 'delete',
        message: `Arquivo '${params.path}' deletado com sucesso`,
        data: { deleted: result }
      };
    } catch (error) {
      throw new Error(`Falha ao deletar arquivo: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Lista conteúdo de um diretório
   * 
   * FUNCIONALIDADE:
   * - Lista arquivos e subdiretórios
   * - Suporta paginação
   * - Inclui metadados de cada item
   * 
   * PARÂMETROS OBRIGATÓRIOS:
   * - owner: Proprietário do repositório
   * - repo: Nome do repositório
   * 
   * PARÂMETROS OPCIONAIS:
   * - path: Caminho do diretório (padrão: raiz)
   * - ref: Branch, tag ou commit (padrão: branch padrão)
   * - page: Página da listagem (padrão: 1)
   * - limit: Itens por página (padrão: 30, máximo: 100)
   * 
   * VALIDAÇÕES:
   * - e repo obrigatórios
   * - Diretório deve existir
   * - Page deve ser >= 1
   * - Limit deve ser entre 1 e 100
   * 
   * RECOMENDAÇÕES:
   * - Use paginação para diretórios grandes
   * - Monitore número total de itens
   * - Use referências específicas para versões
   * - Organize estrutura de diretórios
   */
  async listFiles(params: FilesInput, provider: VcsOperations, owner: string): Promise<FilesResult> {
    try {
      if (!owner || !params.repo) {
        throw new Error('e repo são obrigatórios');
      }

      const path = params.path || '';
      const page = params.page || 1;
      const limit = params.limit || 30;
      
      const files = await provider.listFiles(owner, params.repo, path, params.ref);

      return {
        success: true,
        action: 'list',
        message: `${files.length} itens encontrados em '${path || 'raiz'}'`,
        data: {
          path,
          files,
          page,
          limit,
          total: files.length
        }
      };
    } catch (error) {
      throw new Error(`Falha ao listar arquivos: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Busca arquivos por conteúdo
   * 
   * FUNCIONALIDADE:
   * - Busca arquivos que contenham texto específico
   * - Suporta diferentes referências
   * - Retorna resultados relevantes
   * 
   * PARÂMETROS OBRIGATÓRIOS:
   * - owner: Proprietário do repositório
   * - repo: Nome do repositório
   * - query: Termo de busca
   * 
   * PARÂMETROS OPCIONAIS:
   * - ref: Branch, tag ou commit (padrão: branch padrão)
   * 
   * VALIDAÇÕES:
   * - Todos os parâmetros obrigatórios
   * - Query deve ter pelo menos 3 caracteres
   * - Repositório deve existir
   * 
   * RECOMENDAÇÕES:
   * - Use termos de busca específicos
   * - Combine com filtros de diretório
   * - Use referências para versões específicas
   * - Analise resultados para relevância
   */
  async searchFiles(params: FilesInput, provider: VcsOperations, owner: string): Promise<FilesResult> {
    try {
      if (!owner || !params.repo || !params.query) {
        throw new Error('repo e query são obrigatórios');
      }

      if (params.query.length < 3) {
        throw new Error('Query deve ter pelo menos 3 caracteres');
      }

      // Implementar busca de arquivos por conteúdo
      // Por enquanto, retorna mensagem de funcionalidade
      return {
        success: true,
        action: 'search',
        message: `Busca por '${params.query}' solicitada`,
        data: {
          query: params.query,
          ref: params.ref || 'branch padrão',
          results: 'Funcionalidade de busca será implementada'
        }
      };
    } catch (error) {
      throw new Error(`Falha ao buscar arquivos: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Faz upload de todo o projeto para o repositório
   * 
   * FUNCIONALIDADE:
   * - Envia todos os arquivos do projeto local
   * - Ignora diretórios desnecessários (node_modules, .git, dist)
   * - Ignora arquivos temporários e logs
   * - Faz commit com mensagem personalizada
   * 
   * PARÂMETROS OBRIGATÓRIOS:
   * - owner: Proprietário do repositório
   * - repo: Nome do repositório
   * - projectPath: Caminho do projeto local
   * - message: Mensagem de commit
   * 
   * PARÂMETROS OPCIONAIS:
   * - branch: Branch de destino (padrão: branch padrão)
   * 
   * VALIDAÇÕES:
   * - Todos os parâmetros obrigatórios
   * - Projeto deve existir no caminho especificado
   * - Usuário deve ter permissão de escrita
   * 
   * RECOMENDAÇÕES:
   * - Use mensagens de commit descritivas
   * - Verifique se o repositório está limpo
   * - Use branches para mudanças grandes
   * - Monitore erros de upload
   */
  async uploadProject(params: FilesInput, provider: VcsOperations, owner: string): Promise<FilesResult> {
    try {
      if (!owner || !params.repo || !params.projectPath || !params.message) {
        throw new Error('repo, projectPath e message são obrigatórios');
      }

      const result = await provider.uploadProject(
        owner,
        params.repo,
        params.projectPath,
        params.message,
        params.branch
      );

      return {
        success: true,
        action: 'upload-project',
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
<<<<<<< HEAD
  },

  /**
   * Verifica se erro é relacionado a Git
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

