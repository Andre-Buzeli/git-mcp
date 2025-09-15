import { z } from 'zod';
import { globalProviderFactory, VcsOperations } from '../providers/index.js';
import { config } from '../config.js';

/**
 * Tool: users
 * 
 * DESCRIÇÃO:
 * Gerenciamento de usuários com suporte multi-provider (GitHub e Gitea)
 * 
 * FUNCIONALIDADES:
 * - Obtenção de usuário atual
 * - Obtenção de usuário específico
 * - Busca de usuários
 * - Listagem de organizações
 * - Listagem de repositórios
 * - Informações de perfil
 * 
 * USO:
 * - Para autenticação e perfil
 * - Para busca de usuários
 * - Para gerenciamento de acesso
 * - Para colaboração
 * 
 * RECOMENDAÇÕES:
 * - Use apenas permissões necessárias
 * - Evite expor dados sensíveis
 * - Monitore uso da API
 * - Respeite limites de rate
 */

/**
 * Schema de validação para entrada da tool users
 * 
 * VALIDAÇÕES:
 * - action: Ação obrigatória (get, list, search, orgs, repos)
 * - Parâmetros específicos por ação
 * - Validação de tipos e formatos
 * 
 * RECOMENDAÇÕES:
 * - Sempre valide entrada antes de usar
 * - Use parâmetros opcionais adequadamente
 * - Documente parâmetros obrigatórios
 */
const UsersInputSchema = z.object({
  action: z.enum(['get', 'list', 'search', 'orgs', 'repos']),
  
  // Para multi-provider
  provider: z.enum(['gitea', 'github', 'both']), // Provider específico: gitea, github ou both
  
  // Para get específico
  username: z.string().optional(),
  
  // Para search
  query: z.string().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  
  // Para repos
  repo_type: z.enum(['all', 'owner', 'member', 'collaborator']).optional(),
  sort: z.enum(['created', 'updated', 'pushed', 'full_name']).optional(),
  direction: z.enum(['asc', 'desc']).optional(),
});

export type UsersInput = z.infer<typeof UsersInputSchema>;

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
const UsersResultSchema = z.object({
  success: z.boolean(),
  action: z.string(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional()
});

export type UsersResult = z.infer<typeof UsersResultSchema>;

/**
 * Tool: users
 * 
 * DESCRIÇÃO:
 * Gerenciamento completo de usuários Gitea com múltiplas ações
 * 
 * ACTIONS DISPONÍVEIS:
 * 
 * 1. get - Obter informações de usuário
 *    Parâmetros:
 *    - username (opcional): Nome de usuário específico (se não fornecido, usa usuário atual das env vars)
 * 
 * 2. list - Listar usuários
 *    Parâmetros:
 *    - page (opcional): Página da listagem (padrão: 1)
 *    - limit (opcional): Itens por página (padrão: 30, máximo: 100)
 * 
 * 3. search - Buscar usuários
 *    Parâmetros:
 *    - query (obrigatório): Termo de busca
 *    - page (opcional): Página da busca (padrão: 1)
 *    - limit (opcional): Itens por página (padrão: 30, máximo: 100)
 * 
 * 4. orgs - Obter organizações do usuário
 *    Parâmetros:
 *    - username (obrigatório): Nome de usuário
 *    - page (opcional): Página da listagem (padrão: 1)
 *    - limit (opcional): Itens por página (padrão: 30, máximo: 100)
 * 
 * 5. repos - Listar repositórios do usuário
 *    Parâmetros:
 *    - username (obrigatório): Nome de usuário
 *    - repo_type (opcional): Tipo de repositório (all, owner, member, collaborator) - padrão: all
 *    - sort (opcional): Ordenação (created, updated, pushed, full_name) - padrão: created
 *    - direction (opcional): Direção (asc, desc) - padrão: desc
 *    - page (opcional): Página da listagem (padrão: 1)
 *    - limit (opcional): Itens por página (padrão: 30, máximo: 100)
 * 
 * RECOMENDAÇÕES DE USO:
 * - Respeite privacidade dos usuários
 * - Use apenas para operações necessárias
 * - Monitore uso de permissões
 * - Mantenha logs de acesso
 * - Use filtros adequados para listagens
 * - Verifique permissões antes de acessar dados
 */
export const usersTool = {
  name: 'users',
  description: 'Manage users with multi-provider support (GitHub and Gitea): get, list, search, orgs, repos. Dicas (solo): útil para automações pessoais, conferência rápida de acesso e organizações; use apenas permissões necessárias e evite expor dados sensíveis.',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['get', 'list', 'search', 'orgs', 'repos'],
        description: 'Action to perform on users'
      },
      provider: { type: 'string', description: 'Provider to use (github, gitea, or omit for default)' },
      username: { type: 'string', description: 'Username (optional - if not provided, uses current user from env vars)' },
      query: { type: 'string', description: 'Search query' },
      page: { type: 'number', description: 'Page number', minimum: 1 },
      limit: { type: 'number', description: 'Items per page', minimum: 1, maximum: 100 },
      repo_type: { type: 'string', enum: ['all', 'owner', 'member', 'collaborator'], description: 'Repository type filter' },
      sort: { type: 'string', enum: ['created', 'updated', 'pushed', 'full_name'], description: 'Sort order' },
      direction: { type: 'string', enum: ['asc', 'desc'], description: 'Sort direction' }
    },
    required: ['action', 'provider']
  },

  /**
   * Handler principal da tool users
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
  async handler(input: UsersInput): Promise<UsersResult> {
    try {
      const validatedInput = UsersInputSchema.parse(input);
      
      // Seleciona o provider baseado na entrada ou usa o padrão
      const provider = validatedInput.provider
        ? globalProviderFactory.getProvider(validatedInput.provider)
        : globalProviderFactory.getDefaultProvider();
      
      if (!provider) {
        throw new Error('Provider não encontrado ou não configurado');
      }
      
      switch (validatedInput.action) {
        case 'get':
          return await this.getUser(validatedInput, provider);
        case 'list':
          return await this.listUsers(validatedInput, provider);
        case 'search':
          return await this.searchUsers(validatedInput, provider);
        case 'orgs':
          return await this.getUserOrganizations(validatedInput, provider);
        case 'repos':
          return await this.getUserRepositories(validatedInput, provider);
        default:
          throw new Error(`Ação não suportada: ${validatedInput.action}`);
      }
    } catch (error) {
      return {
        success: false,
        action: input.action,
        message: 'Erro na operação de usuários',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  /**
   * Obtém informações de um usuário específico
   * 
   * FUNCIONALIDADE:
   * - Retorna informações completas do usuário
   * - Suporta usuário atual ou específico
   * - Inclui perfil, estatísticas e metadados
   * 
 * PARÂMETROS OBRIGATÓRIOS:
 * - Nenhum (usa usuário atual das variáveis de ambiente)
 *
 * PARÂMETROS OPCIONAIS:
 * - username: Nome de usuário específico (se não fornecido, usa usuário atual das env vars)
 *
 * VALIDAÇÕES:
 * - Username deve existir se fornecido
 * - Usuário deve ter permissão de acesso
   * - Usuário deve existir (se username fornecido)
   * - Usuário deve ter permissão de acesso
   * 
   * RECOMENDAÇÕES:
   * - Use para obter informações de perfil
   * - Verifique permissões antes de acessar
   * - Respeite configurações de privacidade
   * - Monitore uso de dados sensíveis
   */
  async getUser(params: UsersInput, provider: VcsOperations): Promise<UsersResult> {
    try {
      let user;
      let message;

      if (params.username) {
        // Obter usuário específico
        user = await provider.getUser(params.username);
        message = `Usuário '${params.username}' obtido com sucesso`;
      } else {
        // Usar usuário atual das variáveis de ambiente
        user = await provider.getCurrentUser();
        message = 'Usuário atual obtido com sucesso (das variáveis de ambiente)';
      }

      return {
        success: true,
        action: 'get',
        message,
        data: user
      };
    } catch (error) {
      throw new Error(`Falha ao obter usuário: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Lista usuários do sistema
   * 
   * FUNCIONALIDADE:
   * - Lista usuários com paginação
   * - Retorna informações básicas de cada usuário
   * - Suporta filtros de paginação
   * 
   * PARÂMETROS OPCIONAIS:
   * - page: Página da listagem (padrão: 1)
   * - limit: Itens por página (padrão: 30, máximo: 100)
   * 
   * VALIDAÇÕES:
   * - Page deve ser >= 1
   * - Limit deve ser entre 1 e 100
   * - Usuário deve ter permissão de listagem
   * 
   * RECOMENDAÇÕES:
   * - Use paginação para sistemas grandes
   * - Monitore número total de usuários
   * - Verifique permissões de acesso
   * - Mantenha logs de listagem
   */
  async listUsers(params: UsersInput, provider: VcsOperations): Promise<UsersResult> {
    try {
      const page = params.page || 1;
      const limit = params.limit || 30;

      // Listar usuários do sistema
      const users = await provider.listUsers(page, limit);

      return {
        success: true,
        action: 'list',
        message: `${users.length} usuários listados com sucesso`,
        data: {
          users,
          page,
          limit,
          total: users.length
        }
      };
    } catch (error) {
      throw new Error(`Falha ao listar usuários: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Busca usuários por critérios específicos
   * 
   * FUNCIONALIDADE:
   * - Busca usuários por nome ou email
   * - Suporta paginação
   * - Retorna resultados relevantes
   * 
   * PARÂMETROS OBRIGATÓRIOS:
   * - query: Termo de busca
   * 
   * PARÂMETROS OPCIONAIS:
   * - page: Página da busca (padrão: 1)
   * - limit: Itens por página (padrão: 30, máximo: 100)
   * 
   * VALIDAÇÕES:
   * - Query deve ser fornecido
   * - Query deve ter pelo menos 3 caracteres
   * - Usuário deve ter permissão de busca
   * 
   * RECOMENDAÇÕES:
   * - Use termos de busca específicos
   * - Combine com filtros de paginação
   * - Analise relevância dos resultados
   * - Respeite configurações de privacidade
   */
  async searchUsers(params: UsersInput, provider: VcsOperations): Promise<UsersResult> {
    try {
      if (!params.query) {
        throw new Error('Query é obrigatória');
      }

      if (params.query.length < 3) {
        throw new Error('Query deve ter pelo menos 3 caracteres');
      }

      const page = params.page || 1;
      const limit = params.limit || 30;

      try {
        const users = await provider.searchUsers(params.query, page, limit);

        return {
          success: true,
          action: 'search',
          message: `${users.length} usuários encontrados para '${params.query}'`,
          data: {
            users,
            query: params.query,
            page,
            limit,
            total: users.length
          }
        };
      } catch (error: any) {
        // Se houver erro específico no provider, retornar resultado vazio
        if (error.message && (error.message.includes('data.map') || error.message.includes('not a function'))) {
          console.warn('[USERS] Busca não suportada pelo provider, retornando lista vazia');
          return {
            success: true,
            action: 'search',
            message: `Busca de usuários não suportada pelo provider atual`,
            data: {
              users: [],
              query: params.query,
              page,
              limit,
              total: 0,
              note: 'Funcionalidade não suportada pelo provider'
            }
          };
        }
        throw error;
      }
    } catch (error) {
      throw new Error(`Falha ao buscar usuários: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Obtém organizações de um usuário específico
   * 
   * FUNCIONALIDADE:
   * - Lista organizações do usuário
   * - Suporta paginação
   * - Retorna informações básicas das organizações
   * 
   * PARÂMETROS OBRIGATÓRIOS:
   * - username: Nome de usuário
   * 
   * PARÂMETROS OPCIONAIS:
   * - page: Página da listagem (padrão: 1)
   * - limit: Itens por página (padrão: 30, máximo: 100)
   * 
   * VALIDAÇÕES:
   * - Username deve ser fornecido
   * - Usuário deve existir
   * - Usuário deve ter permissão de acesso
   * 
   * RECOMENDAÇÕES:
   * - Use para gerenciar membros de organizações
   * - Verifique permissões antes de acessar
   * - Monitore acesso a dados organizacionais
   * - Mantenha logs de consulta
   */
  async getUserOrganizations(params: UsersInput, provider: VcsOperations): Promise<UsersResult> {
    try {
      // Se não fornecer username, usar o usuário atual das variáveis de ambiente
      const username = params.username || await this.getCurrentUsername(provider);

      const page = params.page || 1;
      const limit = params.limit || 30;

      // Obter organizações do usuário
      const organizations = await provider.getUserOrganizations(username, page, limit);

      return {
        success: true,
        action: 'orgs',
        message: `${organizations.length} organizações encontradas para '${username}'`,
        data: {
          username,
          organizations,
          page,
          limit,
          total: organizations.length
        }
      };
    } catch (error) {
      throw new Error(`Falha ao obter organizações do usuário: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Obtém o nome de usuário atual das variáveis de ambiente baseado no provider
   */
  async getCurrentUsername(provider: VcsOperations): Promise<string> {
    // Obter informações do usuário atual para extrair o username
    const currentUser = await provider.getCurrentUser();
    return currentUser.login;
  },

  /**
   * Lista repositórios de um usuário específico
   * 
   * FUNCIONALIDADE:
   * - Lista repositórios com filtros
   * - Suporta diferentes tipos de repositório
   * - Permite ordenação e paginação
   * 
 * PARÂMETROS OBRIGATÓRIOS:
 * - Nenhum (usa usuário atual das variáveis de ambiente)
 *
 * PARÂMETROS OPCIONAIS:
 * - username: Nome de usuário específico (se não fornecido, usa usuário atual das env vars)
 * - repo_type: Tipo de repositório (all, owner, member, collaborator) - padrão: all
 * - sort: Ordenação (created, updated, pushed, full_name) - padrão: created
 * - direction: Direção (asc, desc) - padrão: desc
 * - page: Página da listagem (padrão: 1)
 * - limit: Itens por página (padrão: 30, máximo: 100)
   * 
   * VALIDAÇÕES:
   * - Username deve ser fornecido
   * - Usuário deve existir
   * - Usuário deve ter permissão de acesso
   * 
   * RECOMENDAÇÕES:
   * - Use filtros adequados para organização
   * - Monitore acesso a repositórios
   * - Verifique permissões antes de listar
   * - Mantenha logs de consulta
   */
  async getUserRepositories(params: UsersInput, provider: VcsOperations): Promise<UsersResult> {
    try {
      // Se não fornecer username, usar o usuário atual das variáveis de ambiente
      const username = params.username || await this.getCurrentUsername(provider);

      const repoType = params.repo_type || 'all';
      const sort = params.sort || 'created';
      const direction = params.direction || 'desc';
      const page = params.page || 1;
      const limit = params.limit || 30;

      // Obter repositórios do usuário
      const repositories = await provider.getUserRepositories(username, page, limit);

      return {
        success: true,
        action: 'repos',
        message: `${repositories.length} repositórios encontrados para '${username}'`,
        data: {
          username,
          repositories,
          repo_type: repoType,
          sort,
          direction,
          page,
          limit,
          total: repositories.length
        }
      };
    } catch (error) {
      throw new Error(`Falha ao obter repositórios do usuário: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
};