import { z } from 'zod';
import { VcsOperations } from '../providers/index.js';
/**
 * Tool: git-repositories
 *
 * DESCRIÇÃO COMPLETA:
 * Gerenciamento completo de repositórios Git com suporte multi-provider (GitHub e Gitea).
 * Esta tool é 100% auto-suficiente e implementa TODAS as operações de repositório sem depender
 * de outras tools ou comandos externos.
 *
 * FUNCIONALIDADES IMPLEMENTADAS:
 *
 * 1. CRIAÇÃO E CONFIGURAÇÃO:
 *    - create: Cria novos repositórios com configurações completas
 *    - init: Inicializa repositórios Git locais
 *    - clone: Clona repositórios remotos localmente
 *    - update: Atualiza configurações de repositórios existentes
 *
 * 2. LISTAGEM E BUSCA:
 *    - list: Lista repositórios do usuário ou organização
 *    - get: Obtém detalhes específicos de um repositório
 *    - search: Busca repositórios por critérios específicos
 *
 * 3. OPERAÇÕES AVANÇADAS:
 *    - fork: Cria fork de repositórios existentes
 *    - delete: Remove repositórios permanentemente
 *    - archive: Arquivamento de repositórios
 *    - transfer: Transferência de propriedade
 *
 * 4. CONFIGURAÇÕES E METADADOS:
 *    - Visibilidade (público/privado)
 *    - Descrições e documentação
 *    - Configurações de branch padrão
 *    - Templates e inicialização automática
 *    - Licenças e arquivos de configuração
 *
 * PARÂMETROS OBRIGATÓRIOS:
 * - action: Ação a executar (create, list, get, update, delete, fork, search, init, clone)
 * - provider: Provedor a usar (gitea ou github)
 * - owner: Proprietário do repositório (obrigatório para operações remotas)
 * - repo: Nome do repositório (obrigatório para operações remotas)
 * - projectPath: Caminho do projeto local (obrigatório para operações locais)
 *
 * PARÂMETROS OPCIONAIS:
 * - name: Nome do repositório para criação
 * - description: Descrição do repositório
 * - private: Visibilidade do repositório
 * - auto_init: Inicialização automática com README
 * - gitignores: Template de .gitignore
 * - license: Template de licença
 * - readme: Conteúdo do README
 * - default_branch: Branch padrão
 * - username: Usuário para listagem
 * - page: Página para paginação
 * - limit: Limite de resultados
 * - new_name: Novo nome para atualização
 * - new_description: Nova descrição
 * - new_private: Nova visibilidade
 * - archived: Status de arquivamento
 * - organization: Organização para fork
 * - query: Termo de busca
 *
 * CASOS DE USO:
 * 1. Criação de repositórios para novos projetos
 * 2. Backup e migração de código
 * 3. Organização de projetos em equipe
 * 4. Automação de workflows de desenvolvimento
 * 5. Gerenciamento de repositórios em massa
 * 6. Configuração de templates de projeto
 * 7. Sincronização entre diferentes provedores
 *
 * EXEMPLOS DE USO:
 * - Criar repositório: action=create, name=meu-projeto, description=Projeto incrível
 * - Listar repositórios: action=list, username=usuario
 * - Buscar repositórios: action=search, query=react typescript
 * - Clonar repositório: action=clone, url=https://github.com/user/repo.git
 * - Inicializar local: action=init, projectPath=/path/to/project
 *
 * RECOMENDAÇÕES:
 * - Use nomes descritivos e consistentes
 * - Configure visibilidade adequada para cada projeto
 * - Mantenha descrições atualizadas e informativas
 * - Use templates para padronização
 * - Configure branches padrão apropriadas
 * - Documente configurações importantes
 * - Use licenças adequadas para cada projeto
 *
 * LIMITAÇÕES:
 * - Operações de arquivamento dependem do provedor
 * - Transferência de propriedade requer permissões especiais
 * - Alguns provedores podem ter limitações de API
 *
 * SEGURANÇA:
 * - Tokens de acesso são obrigatórios para operações remotas
 * - Validação de permissões antes de operações destrutivas
 * - Logs detalhados de todas as operações
 * - Tratamento seguro de informações sensíveis
 */
/**
 * Schema de validação para entrada da tool git-repositories
 *
 * VALIDAÇÕES:
 * - action: Ação obrigatória (create, list, get, update, delete, fork, search, init, clone)
 * - provider: Obrigatório (gitea ou github)
 * - Parâmetros específicos por ação
 * - Validação de tipos e formatos
 *
 * RECOMENDAÇÕES:
 * - Sempre valide entrada antes de usar
 * - Use parâmetros opcionais adequadamente
 * - Documente parâmetros obrigatórios
 */
declare const GitRepositoriesInputSchema: z.ZodObject<{
    action: z.ZodEnum<["create", "list", "get", "update", "delete", "fork", "search", "init", "clone"]>;
    repo: z.ZodOptional<z.ZodString>;
    provider: z.ZodEnum<["gitea", "github"]>;
    projectPath: z.ZodString;
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
    action: "delete" | "get" | "search" | "init" | "clone" | "list" | "create" | "update" | "fork";
    projectPath: string;
    name?: string | undefined;
    description?: string | undefined;
    private?: boolean | undefined;
    default_branch?: string | undefined;
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
    action: "delete" | "get" | "search" | "init" | "clone" | "list" | "create" | "update" | "fork";
    projectPath: string;
    name?: string | undefined;
    description?: string | undefined;
    private?: boolean | undefined;
    default_branch?: string | undefined;
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
export type GitRepositoriesInput = z.infer<typeof GitRepositoriesInputSchema>;
declare const GitRepositoriesResultSchema: z.ZodObject<{
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
export type GitRepositoriesResult = z.infer<typeof GitRepositoriesResultSchema>;
/**
 * Tool: git-repositories
 *
 * DESCRIÇÃO:
 * Gerenciamento completo de repositórios Git (GitHub + Gitea) com múltiplas ações
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
 * 8. init - Inicializar repositório Git local
 *    Parâmetros:
 *    - projectPath (obrigatório): Caminho do projeto local
 *    - owner/repo (opcional): Para configurar remote
 *
 * 9. clone - Clonar repositório para local
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - projectPath (obrigatório): Caminho local de destino
 *
 * RECOMENDAÇÕES DE USO:
 * - Use nomes descritivos para repositórios
 * - Configure visibilidade adequada para o projeto
 * - Mantenha descrições atualizadas
 * - Use templates para projetos similares
 * - Configure branch padrão adequada
 * - Use paginação para listas grandes
 */
export declare const gitRepositoriesTool: {
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
            repo: {
                type: string;
                description: string;
            };
            provider: {
                type: string;
                enum: string[];
                description: string;
            };
            projectPath: {
                type: string;
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
     * Handler principal da tool git-repositories
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
    handler(input: GitRepositoriesInput): Promise<GitRepositoriesResult>;
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
    createRepository(params: GitRepositoriesInput, provider: VcsOperations): Promise<GitRepositoriesResult>;
    listRepositories(params: GitRepositoriesInput, provider: VcsOperations): Promise<GitRepositoriesResult>;
    getRepository(params: GitRepositoriesInput, provider: VcsOperations): Promise<GitRepositoriesResult>;
    updateRepository(params: GitRepositoriesInput, provider: VcsOperations): Promise<GitRepositoriesResult>;
    deleteRepository(params: GitRepositoriesInput, provider: VcsOperations): Promise<GitRepositoriesResult>;
    forkRepository(params: GitRepositoriesInput, provider: VcsOperations): Promise<GitRepositoriesResult>;
    searchRepositories(params: GitRepositoriesInput, provider: VcsOperations): Promise<GitRepositoriesResult>;
    /**
     * Inicializa um repositório Git local
     *
     * FUNCIONALIDADE:
     * - Executa 'git init' no diretório especificado
     * - Cria estrutura básica do Git
     * - Adiciona remote se especificado
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - projectPath: Caminho do projeto local
     *
     * PARÂMETROS OPCIONAIS:
     * - owner/repo: Para configurar remote
     * - provider: Para determinar URL do remote
     *
     * RECOMENDAÇÕES:
     * - Verifique se diretório existe
     * - Use caminhos absolutos
     * - Configure remote após inicialização
     */
    initRepository(params: GitRepositoriesInput, provider?: VcsOperations): Promise<GitRepositoriesResult>;
    /**
     * Clona um repositório para o diretório local
     *
     * FUNCIONALIDADE:
     * - Clona repositório remoto para diretório local
     * - Suporta diferentes protocolos (HTTPS, SSH)
     * - Mantém estrutura de diretórios
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - projectPath: Caminho local de destino
     * - provider: Provider a ser usado
     *
     * RECOMENDAÇÕES:
     * - Verifique espaço em disco disponível
     * - Use caminhos absolutos
     * - Considere profundidade de clone para repositórios grandes
     */
    cloneRepository(params: GitRepositoriesInput, provider: VcsOperations): Promise<GitRepositoriesResult>;
    /**
     * Verifica se erro é relacionado a Git
     */
    isGitRelatedError(errorMessage: string): boolean;
};
export {};
//# sourceMappingURL=git-repositories.d.ts.map