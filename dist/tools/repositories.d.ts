import { z } from 'zod';
import { VcsOperations } from '../providers/index.js';
/**
 * Tool: repositories
 *
 * DESCRIÇÃO:
 * Gerenciamento completo de repositórios Gitea com múltiplas ações
 *
 * FUNCIONALIDADES:
 * - Criação de repositórios
 * - Listagem e busca
 * - Atualização e configuração
 * - Fork e clonagem
 * - Exclusão e arquivamento
 *
 * USO:
 * - Para gerenciar repositórios de projetos
 * - Para automatizar criação de repositórios
 * - Para backup e migração
 * - Para organização de código
 *
 * RECOMENDAÇÕES:
 * - Use nomes descritivos para repositórios
 * - Configure visibilidade adequada
 * - Mantenha descrições atualizadas
 * - Use templates quando possível
 */
/**
 * Schema de validação para entrada da tool repositories
 *
 * VALIDAÇÕES:
 * - action: Ação obrigatória (create, list, get, update, delete, fork, search)
 * - Parâmetros específicos por ação
 * - Validação de tipos e formatos
 *
 * RECOMENDAÇÕES:
 * - Sempre valide entrada antes de usar
 * - Use parâmetros opcionais adequadamente
 * - Documente parâmetros obrigatórios
 */
declare const RepositoriesInputSchema: z.ZodObject<{
    action: z.ZodEnum<["create", "list", "get", "update", "delete", "fork", "search"]>;
    owner: z.ZodOptional<z.ZodString>;
    repo: z.ZodOptional<z.ZodString>;
    provider: z.ZodEnum<["gitea", "github"]>;
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    private: z.ZodOptional<z.ZodBoolean>;
    auto_init: z.ZodOptional<z.ZodBoolean>;
    gitignores: z.ZodOptional<z.ZodString>;
    license: z.ZodOptional<z.ZodString>;
    readme: z.ZodOptional<z.ZodString>;
    default_branch: z.ZodOptional<z.ZodString>;
    username: z.ZodOptional<z.ZodString>;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    new_name: z.ZodOptional<z.ZodString>;
    new_description: z.ZodOptional<z.ZodString>;
    new_private: z.ZodOptional<z.ZodBoolean>;
    archived: z.ZodOptional<z.ZodBoolean>;
    organization: z.ZodOptional<z.ZodString>;
    query: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    provider: "gitea" | "github";
    action: "delete" | "get" | "create" | "list" | "update" | "fork" | "search";
    name?: string | undefined;
    description?: string | undefined;
    private?: boolean | undefined;
    default_branch?: string | undefined;
    owner?: string | undefined;
    organization?: string | undefined;
    repo?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    auto_init?: boolean | undefined;
    gitignores?: string | undefined;
    license?: string | undefined;
    readme?: string | undefined;
    username?: string | undefined;
    new_name?: string | undefined;
    new_description?: string | undefined;
    new_private?: boolean | undefined;
    archived?: boolean | undefined;
    query?: string | undefined;
}, {
    provider: "gitea" | "github";
    action: "delete" | "get" | "create" | "list" | "update" | "fork" | "search";
    name?: string | undefined;
    description?: string | undefined;
    private?: boolean | undefined;
    default_branch?: string | undefined;
    owner?: string | undefined;
    organization?: string | undefined;
    repo?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    auto_init?: boolean | undefined;
    gitignores?: string | undefined;
    license?: string | undefined;
    readme?: string | undefined;
    username?: string | undefined;
    new_name?: string | undefined;
    new_description?: string | undefined;
    new_private?: boolean | undefined;
    archived?: boolean | undefined;
    query?: string | undefined;
}>;
export type RepositoriesInput = z.infer<typeof RepositoriesInputSchema>;
declare const RepositoriesResultSchema: z.ZodObject<{
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
export type RepositoriesResult = z.infer<typeof RepositoriesResultSchema>;
/**
 * Tool: repositories
 *
 * DESCRIÇÃO:
 * Gerenciamento completo de repositórios Gitea com múltiplas ações
 *
 * ACTIONS DISPONÍVEIS:
 *
 * 1. create - Criar novo repositório
 *    Parâmetros:
 *    - name (obrigatório): Nome do repositório
 *    - description (opcional): Descrição do repositório
 *    - private (opcional): Repositório privado (padrão: false)
 *    - auto_init (opcional): Inicializar com README (padrão: false)
 *    - gitignores (opcional): Template de .gitignore
 *    - license (opcional): Template de licença
 *    - readme (opcional): Conteúdo do README
 *    - default_branch (opcional): Branch padrão
 *
 * 2. list - Listar repositórios
 *    Parâmetros:
 *    - username (opcional): Usuário específico (padrão: usuário atual)
 *    - page (opcional): Página da listagem (padrão: 1)
 *    - limit (opcional): Itens por página (padrão: 30)
 *
 * 3. get - Obter detalhes do repositório
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *
 * 4. update - Atualizar repositório
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - new_name (opcional): Novo nome
 *    - new_description (opcional): Nova descrição
 *    - new_private (opcional): Nova visibilidade
 *    - archived (opcional): Status de arquivamento
 *
 * 5. delete - Deletar repositório
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *
 * 6. fork - Fazer fork do repositório
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório original
 *    - repo (obrigatório): Nome do repositório original
 *    - organization (opcional): Organização de destino
 *
 * 7. search - Buscar repositórios
 *    Parâmetros:
 *    - query (obrigatório): Termo de busca
 *    - page (opcional): Página da busca (padrão: 1)
 *    - limit (opcional): Itens por página (padrão: 30)
 *
 * RECOMENDAÇÕES DE USO:
 * - Use nomes descritivos para repositórios
 * - Configure visibilidade adequada para o projeto
 * - Mantenha descrições atualizadas
 * - Use templates para projetos similares
 * - Configure branch padrão adequada
 * - Use paginação para listas grandes
 */
export declare const repositoriesTool: {
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
            owner: {
                type: string;
                description: string;
            };
            repo: {
                type: string;
                description: string;
            };
            provider: {
                type: string;
                enum: string[];
                description: string;
            };
            name: {
                type: string;
                description: string;
            };
            description: {
                type: string;
                description: string;
            };
            private: {
                type: string;
                description: string;
            };
            auto_init: {
                type: string;
                description: string;
            };
            gitignores: {
                type: string;
                description: string;
            };
            license: {
                type: string;
                description: string;
            };
            readme: {
                type: string;
                description: string;
            };
            default_branch: {
                type: string;
                description: string;
            };
            username: {
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
            new_name: {
                type: string;
                description: string;
            };
            new_description: {
                type: string;
                description: string;
            };
            new_private: {
                type: string;
                description: string;
            };
            archived: {
                type: string;
                description: string;
            };
            organization: {
                type: string;
                description: string;
            };
            query: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    /**
     * Handler principal da tool repositories
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
    handler(input: RepositoriesInput): Promise<RepositoriesResult>;
    /**
     * Cria um novo repositório
     *
     * FUNCIONALIDADE:
     * - Valida parâmetros obrigatórios
     * - Configura dados padrão
     * - Chama API do provider para criação
     * - Retorna resultado formatado
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - name: Nome do repositório
     *
     * PARÂMETROS OPCIONAIS:
     * - description: Descrição do repositório
     * - private: Visibilidade (padrão: false)
     * - auto_init: Inicializar com README (padrão: false)
     * - gitignores: Template de .gitignore
     * - license: Template de licença
     * - readme: Conteúdo do README
     * - default_branch: Branch padrão (padrão: main)
     *
     * VALIDAÇÕES:
     * - Nome obrigatório
     * - Nome único no usuário/organização
     * - Permissões adequadas
     *
     * RECOMENDAÇÕES:
     * - Use nomes descritivos e únicos
     * - Configure visibilidade adequada
     * - Inicialize com README para projetos novos
     * - Use templates para consistência
     */
    createRepository(params: RepositoriesInput, provider: VcsOperations): Promise<RepositoriesResult>;
    listRepositories(params: RepositoriesInput, provider: VcsOperations): Promise<RepositoriesResult>;
    getRepository(params: RepositoriesInput, provider: VcsOperations): Promise<RepositoriesResult>;
    updateRepository(params: RepositoriesInput, provider: VcsOperations): Promise<RepositoriesResult>;
    deleteRepository(params: RepositoriesInput, provider: VcsOperations): Promise<RepositoriesResult>;
    forkRepository(params: RepositoriesInput, provider: VcsOperations): Promise<RepositoriesResult>;
    searchRepositories(params: RepositoriesInput, provider: VcsOperations): Promise<RepositoriesResult>;
};
export {};
//# sourceMappingURL=repositories.d.ts.map