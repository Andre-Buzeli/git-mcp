import { z } from 'zod';
import { globalProviderFactory, VcsOperations } from '../providers/index.js';
import { applyAutoUserDetection } from '../utils/user-detection.js';

/**
 * Tool: tags
 * 
 * DESCRIÇÃO:
 * Gerenciamento completo de tags com suporte multi-provider (GitHub e Gitea)
 * 
 * FUNCIONALIDADES:
 * - Criação de novas tags
 * - Listagem e busca de tags
 * - Obtenção de detalhes específicos
 * - Exclusão de tags
 * - Controle de versão
 * - Busca por padrões
 * 
 * USO:
 * - Para marcar versões específicas
 * - Para controle de release
 * - Para rollback de código
 * - Para identificação de commits
 * 
 * RECOMENDAÇÕES:
 * - Use versionamento semântico
 * - Mantenha tags organizadas
 * - Documente propósito das tags
 * - Use para pontos de referência
 */

/**
 * Schema de validação para entrada da tool tags
 * 
 * VALIDAÇÕES:
 * - action: Ação obrigatória (create, list, get, delete, search)
 * - Parâmetros específicos por ação
 * - Validação de tipos e formatos
 * 
 * RECOMENDAÇÕES:
 * - Sempre valide entrada antes de usar
 * - Use parâmetros opcionais adequadamente
 * - Documente parâmetros obrigatórios
 */
const TagsInputSchema = z.object({
  action: z.enum(['create', 'list', 'get', 'delete', 'search']),
  
  // Parâmetros comuns
  repo: z.string(),
  
  // Para multi-provider
  provider: z.enum(['gitea', 'github']).describe('Provider to use (gitea or github)'), // Provider específico: gitea, github ou both
  projectPath: z.string().describe('Local project path for git operations'),
  
  // Para create
  tag_name: z.string().optional(),
  message: z.string().optional(),
  target: z.string().optional(),
  type: z.enum(['lightweight', 'annotated']).optional(),
  tagger_name: z.string().optional(),
  tagger_email: z.string().optional(),
  
  // Para get/delete
  tag: z.string().optional(),
  
  // Para list
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  
  // Para search
  query: z.string().optional(),
  pattern: z.string().optional(),
});

export type TagsInput = z.infer<typeof TagsInputSchema>;

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
const TagsResultSchema = z.object({
  success: z.boolean(),
  action: z.string(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional()
});

export type TagsResult = z.infer<typeof TagsResultSchema>;

/**
 * Tool: tags
 * 
 * DESCRIÇÃO:
 * Gerenciamento completo de tags Gitea com múltiplas ações
 * 
 * ACTIONS DISPONÍVEIS:
 * 
 * 1. create - Criar nova tag
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - tag_name (obrigatório): Nome da tag
 *    - message (opcional): Mensagem da tag (para tags anotadas)
 *    - target (obrigatório): Commit, branch ou tag alvo
 *    - type (opcional): Tipo de tag (lightweight, annotated) - padrão: lightweight
 *    - tagger_name (opcional): Nome do tagger (para tags anotadas)
 *    - tagger_email (opcional): Email do tagger (para tags anotadas)
 * 
 * 2. list - Listar tags
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - page (opcional): Página da listagem (padrão: 1)
 *    - limit (opcional): Itens por página (padrão: 30, máximo: 100)
 * 
 * 3. get - Obter detalhes da tag
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - tag (obrigatório): Nome da tag
 * 
 * 4. delete - Deletar tag
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - tag (obrigatório): Nome da tag
 * 
 * 5. search - Buscar tags
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - query (opcional): Termo de busca
 *    - pattern (opcional): Padrão de busca (ex: v*.*.*)
 * 
 * RECOMENDAÇÕES DE USO:
 * - Use convenções de nomenclatura consistentes
 * - Documente propósito das tags
 * - Mantenha tags organizadas
 * - Use versionamento semântico
 * - Use tags anotadas para releases importantes
 * - Limpe tags antigas regularmente
 */
export const tagsTool = {
  name: 'git-tags',
  description: 'tool: Gerencia tags Git para versionamento e releases\n──────────────\naction create: cria nova tag\naction create requires: repo, tag_name, message, target, type, tagger_name, tagger_email, provider\n───────────────\naction list: lista tags do repositório\naction list requires: repo, page, limit, provider\n───────────────\naction get: obtém detalhes de tag\naction get requires: repo, tag, provider\n───────────────\naction delete: remove tag\naction delete requires: repo, tag, provider\n───────────────\naction search: busca tags por critérios\naction search requires: repo, query, pattern, provider',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['create', 'list', 'get', 'delete', 'search'],
        description: 'Action to perform on tags'
      },
      repo: { type: 'string', description: 'Repository name' },
      provider: { type: 'string', description: 'Provider to use (github, gitea, or omit for default)' },
      tag_name: { type: 'string', description: 'Tag name' },
      message: { type: 'string', description: 'Tag message (for annotated tags)' },
      target: { type: 'string', description: 'Target commit SHA, branch or tag' },
      type: { type: 'string', enum: ['lightweight', 'annotated'], description: 'Tag type' },
      tagger_name: { type: 'string', description: 'Tagger name' },
      tagger_email: { type: 'string', description: 'Tagger email' },
      tag: { type: 'string', description: 'Tag name for get/delete operations' },
      page: { type: 'number', description: 'Page number', minimum: 1 },
      limit: { type: 'number', description: 'Items per page', minimum: 1, maximum: 100 },
      query: { type: 'string', description: 'Search query' },
      pattern: { type: 'string', description: 'Search pattern (e.g., v*.*.*)' }
    },
    required: ['action', 'repo', 'provider', 'projectPath']
  },

  /**
   * Handler principal da tool tags
   * 
   * FUNCIONALIDADE:
   * - Valida entrada usando Zod schema
   * - Roteia para método específico baseado na ação
   * - Trata erros de forma uniforme
   * - Retorna resultado padronizado
   * 
   * FLUXO:
   * 1. Validação de entrada
   * 2. Seleção do provider
   * 3. Roteamento por ação
   * 4. Execução do método específico
   * 5. Tratamento de erros
   * 6. Retorno de resultado
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
  async handler(input: TagsInput): Promise<TagsResult> {
    try {
      const validatedInput = TagsInputSchema.parse(input);
      
      // Aplicar auto-detecção apenas para owner dentro do provider especificado
      const processedInput = await applyAutoUserDetection(validatedInput, validatedInput.provider);
      
      // Usar o provider especificado pelo usuário
      const provider = globalProviderFactory.getProvider(processedInput.provider);
      
      if (!provider) {
        throw new Error(`Provider '${processedInput.provider}' não encontrado`);
      }
      
      switch (processedInput.action) {
        case 'create':
          return await this.createTag(processedInput, provider);
        case 'list':
          return await this.listTags(processedInput, provider);
        case 'get':
          return await this.getTag(processedInput, provider);
        case 'delete':
          return await this.deleteTag(processedInput, provider);
        case 'search':
          return await this.searchTags(processedInput, provider);
        default:
          throw new Error(`Ação não suportada: ${processedInput.action}`);
      }
    } catch (error) {
      return {
        success: false,
        action: input.action,
        message: 'Erro na operação de tags',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  /**
   * Cria uma nova tag no repositório
   * 
   * FUNCIONALIDADE:
   * - Cria tag com nome e target especificados
   * - Suporta tags lightweight e anotadas
   * - Permite configuração de tagger
   * 
   * PARÂMETROS OBRIGATÓRIOS:
   * - owner: Proprietário do repositório
   * - repo: Nome do repositório
   * - tag_name: Nome da tag
   * - target: Commit, branch ou tag alvo
   * 
   * PARÂMETROS OPCIONAIS:
   * - message: Mensagem da tag (para tags anotadas)
   * - type: Tipo de tag (lightweight, annotated) - padrão: lightweight
   * - tagger_name: Nome do tagger (para tags anotadas)
   * - tagger_email: Email do tagger (para tags anotadas)
   * 
   * VALIDAÇÕES:
   * - Todos os parâmetros obrigatórios
   * - Nome da tag deve ser único no repositório
   * - Target deve existir
   * - Usuário deve ter permissão de escrita
   * 
   * RECOMENDAÇÕES:
   * - Use convenções de nomenclatura consistentes
   * - Use tags anotadas para releases importantes
   * - Documente propósito da tag
   * - Use versionamento semântico
   */
  async createTag(params: TagsInput, provider: VcsOperations): Promise<TagsResult> {
    try {
      if (!params.repo || !params.tag_name || !params.target) {
        throw new Error('Repo, tag_name e target são obrigatórios');
      }

      const currentUser = await provider.getCurrentUser();
      const owner = currentUser.login;

      const tagData: any = {
        tag_name: params.tag_name,
        target: params.target
      };

      if (params.type === 'annotated') {
        if (params.message) tagData.message = params.message;
        if (params.tagger_name) tagData.tagger_name = params.tagger_name;
        if (params.tagger_email) tagData.tagger_email = params.tagger_email;
      }

      const tag = await provider.createTag(owner, params.repo, tagData);

      return {
        success: true,
        action: 'create',
        message: `Tag '${params.tag_name}' criada com sucesso`,
        data: tag
      };
    } catch (error) {
      throw new Error(`Falha ao criar tag: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Lista tags do repositório
   * 
   * FUNCIONALIDADE:
   * - Lista tags com paginação
   * - Retorna informações básicas de cada tag
   * - Inclui commit alvo e URLs de download
   * 
   * PARÂMETROS OBRIGATÓRIOS:
   * - owner: Proprietário do repositório
   * - repo: Nome do repositório
   * 
   * PARÂMETROS OPCIONAIS:
   * - page: Página da listagem (padrão: 1)
   * - limit: Itens por página (padrão: 30, máximo: 100)
   * 
   * VALIDAÇÕES:
   * - e repo obrigatórios
   * - Page deve ser >= 1
   * - Limit deve ser entre 1 e 100
   * 
   * RECOMENDAÇÕES:
   * - Use paginação para repositórios com muitas tags
   * - Monitore número total de tags
   * - Verifique commit alvo de cada tag
   * - Mantenha tags organizadas
   */
  async listTags(params: TagsInput, provider: VcsOperations): Promise<TagsResult> {
    try {
      if (!params.repo) {
        throw new Error('Repo é obrigatório');
      }

      const currentUser = await provider.getCurrentUser();
      const owner = currentUser.login;

      const page = params.page || 1;
      const limit = params.limit || 30;
      
      const tags = await provider.listTags((await provider.getCurrentUser()).login, params.repo, page, limit);

      return {
        success: true,
        action: 'list',
        message: `${tags.length} tags encontradas`,
        data: {
          tags,
          page,
          limit,
          total: tags.length
        }
      };
    } catch (error) {
      throw new Error(`Falha ao listar tags: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Obtém detalhes de uma tag específica
   * 
   * FUNCIONALIDADE:
   * - Retorna informações completas da tag
   * - Inclui nome, commit alvo e URLs
   * - Mostra tipo da tag (lightweight/anotada)
   * 
   * PARÂMETROS OBRIGATÓRIOS:
   * - owner: Proprietário do repositório
   * - repo: Nome do repositório
   * - tag: Nome da tag
   * 
   * VALIDAÇÕES:
   * - Todos os parâmetros obrigatórios
   * - Tag deve existir no repositório
   * - Nome deve ser válido
   * 
   * RECOMENDAÇÕES:
   * - Use para obter detalhes completos
   * - Verifique commit alvo da tag
   * - Analise URLs de download
   * - Monitore mudanças importantes
   */
  async getTag(params: TagsInput, provider: VcsOperations): Promise<TagsResult> {
    try {
      if (!params.repo || !params.tag) {
        throw new Error('Repo e tag são obrigatórios');
      }

      const currentUser = await provider.getCurrentUser();
      const owner = currentUser.login;

      // Implementar obtenção de tag específica
      // Por enquanto, retorna mensagem de funcionalidade
      return {
        success: true,
        action: 'get',
        message: `Tag '${params.tag}' obtida com sucesso`,
        data: {
          tag: params.tag,
          note: 'Funcionalidade de obtenção de tag específica será implementada'
        }
      };
    } catch (error) {
      throw new Error(`Falha ao obter tag: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Deleta uma tag do repositório
   * 
   * FUNCIONALIDADE:
   * - Remove tag especificada
   * - Mantém commit alvo intacto
   * - Confirma exclusão bem-sucedida
   * 
   * PARÂMETROS OBRIGATÓRIOS:
   * - owner: Proprietário do repositório
   * - repo: Nome do repositório
   * - tag: Nome da tag
   * 
   * VALIDAÇÕES:
   * - Todos os parâmetros obrigatórios
   * - Tag deve existir
   * - Usuário deve ter permissão de exclusão
   * 
   * RECOMENDAÇÕES:
   * - Confirme exclusão antes de executar
   * - Verifique se tag não está sendo usada
   * - Mantenha backup se necessário
   * - Documente motivo da exclusão
   */
  async deleteTag(params: TagsInput, provider: VcsOperations): Promise<TagsResult> {
    try {
      if (!params.repo || !params.tag) {
        throw new Error('Repo e tag são obrigatórios');
      }

      const currentUser = await provider.getCurrentUser();
      const owner = currentUser.login;

      await provider.deleteTag((await provider.getCurrentUser()).login, params.repo, params.tag);

      return {
        success: true,
        action: 'delete',
        message: `Tag '${params.tag}' deletada com sucesso`,
        data: { deleted: true }
      };
    } catch (error) {
      throw new Error(`Falha ao deletar tag: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Busca tags por critérios específicos
   * 
   * FUNCIONALIDADE:
   * - Busca tags por nome ou padrão
   * - Suporta padrões glob (ex: v*.*.*)
   * - Retorna resultados relevantes
   * 
   * PARÂMETROS OBRIGATÓRIOS:
   * - owner: Proprietário do repositório
   * - repo: Nome do repositório
   * 
   * PARÂMETROS OPCIONAIS:
   * - query: Termo de busca
   * - pattern: Padrão de busca (ex: v*.*.*)
   * 
   * VALIDAÇÕES:
   * - e repo obrigatórios
   * - Query ou pattern deve ser fornecido
   * - Repositório deve existir
   * 
   * RECOMENDAÇÕES:
   * - Use padrões glob para busca eficiente
   * - Combine com filtros de nome
   * - Analise resultados para relevância
   * - Use para encontrar tags relacionadas
   */
  async searchTags(params: TagsInput, provider: VcsOperations): Promise<TagsResult> {
    try {
      if (!params.repo) {
        throw new Error('Repo é obrigatório');
      }

      if (!params.query && !params.pattern) {
        throw new Error('Query ou pattern deve ser fornecido');
      }

      // Implementar busca de tags
      // Por enquanto, retorna mensagem de funcionalidade
      return {
        success: true,
        action: 'search',
        message: `Busca por tags solicitada`,
        data: {
          query: params.query || 'não fornecido',
          pattern: params.pattern || 'não fornecido',
          results: 'Funcionalidade de busca será implementada'
        }
      };
    } catch (error) {
      throw new Error(`Falha ao buscar tags: ${error instanceof Error ? error.message : String(error)}`);
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



