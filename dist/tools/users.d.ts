import { z } from 'zod';
import { VcsOperations } from '../providers/index.js';
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
declare const UsersInputSchema: z.ZodObject<{
    action: z.ZodEnum<["get", "list", "search", "orgs", "repos"]>;
    provider: z.ZodEnum<["gitea", "github", "both"]>;
    username: z.ZodOptional<z.ZodString>;
    query: z.ZodOptional<z.ZodString>;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    repo_type: z.ZodOptional<z.ZodEnum<["all", "owner", "member", "collaborator"]>>;
    sort: z.ZodOptional<z.ZodEnum<["created", "updated", "pushed", "full_name"]>>;
    direction: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    provider: "gitea" | "github" | "both";
    action: "get" | "list" | "search" | "orgs" | "repos";
    sort?: "full_name" | "updated" | "created" | "pushed" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    username?: string | undefined;
    query?: string | undefined;
    direction?: "desc" | "asc" | undefined;
    repo_type?: "all" | "owner" | "member" | "collaborator" | undefined;
}, {
    provider: "gitea" | "github" | "both";
    action: "get" | "list" | "search" | "orgs" | "repos";
    sort?: "full_name" | "updated" | "created" | "pushed" | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    username?: string | undefined;
    query?: string | undefined;
    direction?: "desc" | "asc" | undefined;
    repo_type?: "all" | "owner" | "member" | "collaborator" | undefined;
}>;
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
declare const UsersResultSchema: z.ZodObject<{
    success: z.ZodBoolean;
    action: z.ZodString;
    message: z.ZodString;
    data: z.ZodOptional<z.ZodAny>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message: string;
    action: string;
    success: boolean;
    error?: string | undefined;
    data?: any;
}, {
    message: string;
    action: string;
    success: boolean;
    error?: string | undefined;
    data?: any;
}>;
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
export declare const usersTool: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            action: {
                type: string;
                enum: string[];
                description: string;
            };
            provider: {
                type: string;
                description: string;
            };
            username: {
                type: string;
                description: string;
            };
            query: {
                type: string;
                description: string;
            };
            page: {
                type: string;
                description: string;
                minimum: number;
            };
            limit: {
                type: string;
                description: string;
                minimum: number;
                maximum: number;
            };
            repo_type: {
                type: string;
                enum: string[];
                description: string;
            };
            sort: {
                type: string;
                enum: string[];
                description: string;
            };
            direction: {
                type: string;
                enum: string[];
                description: string;
            };
        };
        required: string[];
    };
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
    handler(input: UsersInput): Promise<UsersResult>;
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
    getUser(params: UsersInput, provider: VcsOperations): Promise<UsersResult>;
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
    listUsers(params: UsersInput, provider: VcsOperations): Promise<UsersResult>;
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
    searchUsers(params: UsersInput, provider: VcsOperations): Promise<UsersResult>;
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
    getUserOrganizations(params: UsersInput, provider: VcsOperations): Promise<UsersResult>;
    /**
     * Obtém o nome de usuário atual das variáveis de ambiente baseado no provider
     */
    getCurrentUsername(provider: VcsOperations): Promise<string>;
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
    getUserRepositories(params: UsersInput, provider: VcsOperations): Promise<UsersResult>;
};
export {};
//# sourceMappingURL=users.d.ts.map