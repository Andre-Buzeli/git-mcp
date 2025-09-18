import { z } from 'zod';
import { VcsOperations } from '../providers/index.js';
/**
 * Tool: git-repositories
 *
 * DESCRIÃ‡ÃƒO COMPLETA:
 * Gerenciamento completo de repositÃ³rios Git com suporte multi-provider (GitHub e Gitea).
 * Esta tool Ã© 100% auto-suficiente e implementa TODAS as operaÃ§Ãµes de repositÃ³rio sem depender
 * de outras tools ou comandos externos.
 *
 * FUNCIONALIDADES IMPLEMENTADAS:
 *
 * 1. CRIAÃ‡ÃƒO E CONFIGURAÃ‡ÃƒO:
 *    - create: Cria novos repositÃ³rios com configuraÃ§Ãµes completas
 *    - init: Inicializa repositÃ³rios Git locais
 *    - clone: Clona repositÃ³rios remotos localmente
 *    - update: Atualiza configuraÃ§Ãµes de repositÃ³rios existentes
 *
 * 2. LISTAGEM E BUSCA:
 *    - list: Lista repositÃ³rios do usuÃ¡rio ou organizaÃ§Ã£o
 *    - get: ObtÃ©m detalhes especÃ­ficos de um repositÃ³rio
 *    - search: Busca repositÃ³rios por critÃ©rios especÃ­ficos
 *
 * 3. OPERAÃ‡Ã•ES AVANÃ‡ADAS:
 *    - fork: Cria fork de repositÃ³rios existentes
 *    - delete: Remove repositÃ³rios permanentemente
 *    - archive: Arquivamento de repositÃ³rios
 *    - transfer: TransferÃªncia de propriedade
 *
 * 4. CONFIGURAÃ‡Ã•ES E METADADOS:
 *    - Visibilidade (pÃºblico/privado)
 *    - DescriÃ§Ãµes e documentaÃ§Ã£o
 *    - ConfiguraÃ§Ãµes de branch padrÃ£o
 *    - Templates e inicializaÃ§Ã£o automÃ¡tica
 *    - LicenÃ§as e arquivos de configuraÃ§Ã£o
 *
 * PARÃ‚METROS OBRIGATÃ“RIOS:
 * - action: AÃ§Ã£o a executar (create, list, get, update, delete, fork, search, init, clone)
 * - provider: Provedor a usar (gitea ou github)
 * - owner: ProprietÃ¡rio do repositÃ³rio (obrigatÃ³rio para operaÃ§Ãµes remotas)
 * - repo: Nome do repositÃ³rio (obrigatÃ³rio para operaÃ§Ãµes remotas)
 * - projectPath: Caminho do projeto local (obrigatÃ³rio para operaÃ§Ãµes locais)
 *
 * PARÃ‚METROS OPCIONAIS:
 * - name: Nome do repositÃ³rio para criaÃ§Ã£o
 * - description: DescriÃ§Ã£o do repositÃ³rio
 * - private: Visibilidade do repositÃ³rio
 * - auto_init: InicializaÃ§Ã£o automÃ¡tica com README
 * - gitignores: Template de .gitignore
 * - license: Template de licenÃ§a
 * - readme: ConteÃºdo do README
 * - default_branch: Branch padrÃ£o
 * - username: UsuÃ¡rio para listagem
 * - page: PÃ¡gina para paginaÃ§Ã£o
 * - limit: Limite de resultados
 * - new_name: Novo nome para atualizaÃ§Ã£o
 * - new_description: Nova descriÃ§Ã£o
 * - new_private: Nova visibilidade
 * - archived: Status de arquivamento
 * - organization: OrganizaÃ§Ã£o para fork
 * - query: Termo de busca
 *
 * CASOS DE USO:
 * 1. CriaÃ§Ã£o de repositÃ³rios para novos projetos
 * 2. Backup e migraÃ§Ã£o de cÃ³digo
 * 3. OrganizaÃ§Ã£o de projetos em equipe
 * 4. AutomaÃ§Ã£o de workflows de desenvolvimento
 * 5. Gerenciamento de repositÃ³rios em massa
 * 6. ConfiguraÃ§Ã£o de templates de projeto
 * 7. SincronizaÃ§Ã£o entre diferentes provedores
 *
 * EXEMPLOS DE USO:
 * - Criar repositÃ³rio: action=create, name=meu-projeto, description=Projeto incrÃ­vel
 * - Listar repositÃ³rios: action=list, username=usuario
 * - Buscar repositÃ³rios: action=search, query=react typescript
 * - Clonar repositÃ³rio: action=clone, url=https://github.com/user/repo.git
 * - Inicializar local: action=init, projectPath=/path/to/project
 *
 * RECOMENDAÃ‡Ã•ES:
 * - Use nomes descritivos e consistentes
 * - Configure visibilidade adequada para cada projeto
 * - Mantenha descriÃ§Ãµes atualizadas e informativas
 * - Use templates para padronizaÃ§Ã£o
 * - Configure branches padrÃ£o apropriadas
 * - Documente configuraÃ§Ãµes importantes
 * - Use licenÃ§as adequadas para cada projeto
 *
 * LIMITAÃ‡Ã•ES:
 * - OperaÃ§Ãµes de arquivamento dependem do provedor
 * - TransferÃªncia de propriedade requer permissÃµes especiais
 * - Alguns provedores podem ter limitaÃ§Ãµes de API
 *
 * SEGURANÃ‡A:
 * - Tokens de acesso sÃ£o obrigatÃ³rios para operaÃ§Ãµes remotas
 * - ValidaÃ§Ã£o de permissÃµes antes de operaÃ§Ãµes destrutivas
 * - Logs detalhados de todas as operaÃ§Ãµes
 * - Tratamento seguro de informaÃ§Ãµes sensÃ­veis
 */
/**
 * Schema de validaÃ§Ã£o para entrada da tool git-repositories
 *
 * VALIDAÃ‡Ã•ES:
 * - action: AÃ§Ã£o obrigatÃ³ria (create, list, get, update, delete, fork, search, init, clone)
 * - provider: ObrigatÃ³rio (gitea ou github)
 * - ParÃ¢metros especÃ­ficos por aÃ§Ã£o
 * - ValidaÃ§Ã£o de tipos e formatos
 *
 * RECOMENDAÃ‡Ã•ES:
 * - Sempre valide entrada antes de usar
 * - Use parÃ¢metros opcionais adequadamente
 * - Documente parÃ¢metros obrigatÃ³rios
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
 * DESCRIÃ‡ÃƒO:
 * Gerenciamento completo de repositÃ³rios Git (GitHub + Gitea) com mÃºltiplas aÃ§Ãµes
 *
 * ACTIONS DISPONÃVEIS:
 *
 * 1. create - Criar novo repositÃ³rio
 *    ParÃ¢metros:
 *    - name (obrigatÃ³rio): Nome do repositÃ³rio
 *    - description (opcional): DescriÃ§Ã£o do repositÃ³rio
 *    - private (opcional): RepositÃ³rio privado (padrÃ£o: false)
 *    - auto_init (opcional): Inicializar com README (padrÃ£o: false)
 *    - gitignores (opcional): Template de .gitignore
 *    - license (opcional): Template de licenÃ§a
 *    - readme (opcional): ConteÃºdo do README
 *    - default_branch (opcional): Branch padrÃ£o
 *
 * 2. list - Listar repositÃ³rios
 *    ParÃ¢metros:
 *    - username (opcional): UsuÃ¡rio especÃ­fico (padrÃ£o: usuÃ¡rio atual)
 *    - page (opcional): PÃ¡gina da listagem (padrÃ£o: 1)
 *    - limit (opcional): Itens por pÃ¡gina (padrÃ£o: 30)
 *
 * 3. get - Obter detalhes do repositÃ³rio
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *
 * 4. update - Atualizar repositÃ³rio
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - new_name (opcional): Novo nome
 *    - new_description (opcional): Nova descriÃ§Ã£o
 *    - new_private (opcional): Nova visibilidade
 *    - archived (opcional): Status de arquivamento
 *
 * 5. delete - Deletar repositÃ³rio
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *
 * 6. fork - Fazer fork do repositÃ³rio
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio original
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio original
 *    - organization (opcional): OrganizaÃ§Ã£o de destino
 *
 * 7. search - Buscar repositÃ³rios
 *    ParÃ¢metros:
 *    - query (obrigatÃ³rio): Termo de busca
 *    - page (opcional): PÃ¡gina da busca (padrÃ£o: 1)
 *    - limit (opcional): Itens por pÃ¡gina (padrÃ£o: 30)
 *
 * 8. init - Inicializar repositÃ³rio Git local
 *    ParÃ¢metros:
 *    - projectPath (obrigatÃ³rio): Caminho do projeto local
 *    - owner/repo (opcional): Para configurar remote
 *
 * 9. clone - Clonar repositÃ³rio para local
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - projectPath (obrigatÃ³rio): Caminho local de destino
 *
 * RECOMENDAÃ‡Ã•ES DE USO:
 * - Use nomes descritivos para repositÃ³rios
 * - Configure visibilidade adequada para o projeto
 * - Mantenha descriÃ§Ãµes atualizadas
 * - Use templates para projetos similares
 * - Configure branch padrÃ£o adequada
 * - Use paginaÃ§Ã£o para listas grandes
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
     * - Roteia para mÃ©todo especÃ­fico baseado na aÃ§Ã£o
     * - Trata erros de forma uniforme
     * - Retorna resultado padronizado
     *
     * FLUXO:
     * 1. ValidaÃ§Ã£o de entrada
     * 2. Roteamento por aÃ§Ã£o
     * 3. ExecuÃ§Ã£o do mÃ©todo especÃ­fico
     * 4. Tratamento de erros
     * 5. Retorno de resultado
     *
     * TRATAMENTO DE ERROS:
     * - ValidaÃ§Ã£o: erro de schema
     * - ExecuÃ§Ã£o: erro da operaÃ§Ã£o
     * - Roteamento: aÃ§Ã£o nÃ£o suportada
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Sempre valide entrada antes de processar
     * - Trate erros especÃ­ficos adequadamente
     * - Log detalhes de erro para debug
     * - Retorne mensagens de erro Ãºteis
     */
    handler(input: GitRepositoriesInput): Promise<GitRepositoriesResult>;
    /**
     * Cria um novo repositÃ³rio
     *
     * FUNCIONALIDADE:
     * - Valida parÃ¢metros obrigatÃ³rios
     * - Configura dados padrÃ£o
     * - Chama API do provider para criaÃ§Ã£o
     * - Retorna resultado formatado
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - name: Nome do repositÃ³rio
     *
     * PARÃ‚METROS OPCIONAIS:
     * - description: DescriÃ§Ã£o do repositÃ³rio
     * - private: Visibilidade (padrÃ£o: false)
     * - auto_init: Inicializar com README (padrÃ£o: false)
     * - gitignores: Template de .gitignore
     * - license: Template de licenÃ§a
     * - readme: ConteÃºdo do README
     * - default_branch: Branch padrÃ£o (padrÃ£o: main)
     *
     * VALIDAÃ‡Ã•ES:
     * - Nome obrigatÃ³rio
     * - Nome Ãºnico no usuÃ¡rio/organizaÃ§Ã£o
     * - PermissÃµes adequadas
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use nomes descritivos e Ãºnicos
     * - Configure visibilidade adequada
     * - Inicialize com README para projetos novos
     * - Use templates para consistÃªncia
     */
    createRepository(params: GitRepositoriesInput, provider: VcsOperations): Promise<GitRepositoriesResult>;
    listRepositories(params: GitRepositoriesInput, provider: VcsOperations): Promise<GitRepositoriesResult>;
    getRepository(params: GitRepositoriesInput, provider: VcsOperations): Promise<GitRepositoriesResult>;
    updateRepository(params: GitRepositoriesInput, provider: VcsOperations): Promise<GitRepositoriesResult>;
    deleteRepository(params: GitRepositoriesInput, provider: VcsOperations): Promise<GitRepositoriesResult>;
    forkRepository(params: GitRepositoriesInput, provider: VcsOperations): Promise<GitRepositoriesResult>;
    searchRepositories(params: GitRepositoriesInput, provider: VcsOperations): Promise<GitRepositoriesResult>;
    /**
     * Inicializa um repositÃ³rio Git local
     *
     * FUNCIONALIDADE:
     * - Executa 'git init' no diretÃ³rio especificado
     * - Cria estrutura bÃ¡sica do Git
     * - Adiciona remote se especificado
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - projectPath: Caminho do projeto local
     *
     * PARÃ‚METROS OPCIONAIS:
     * - owner/repo: Para configurar remote
     * - provider: Para determinar URL do remote
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Verifique se diretÃ³rio existe
     * - Use caminhos absolutos
     * - Configure remote apÃ³s inicializaÃ§Ã£o
     */
    initRepository(params: GitRepositoriesInput, provider?: VcsOperations): Promise<GitRepositoriesResult>;
    /**
     * Clona um repositÃ³rio para o diretÃ³rio local
     *
     * FUNCIONALIDADE:
     * - Clona repositÃ³rio remoto para diretÃ³rio local
     * - Suporta diferentes protocolos (HTTPS, SSH)
     * - MantÃ©m estrutura de diretÃ³rios
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - projectPath: Caminho local de destino
     * - provider: Provider a ser usado
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Verifique espaÃ§o em disco disponÃ­vel
     * - Use caminhos absolutos
     * - Considere profundidade de clone para repositÃ³rios grandes
     */
    cloneRepository(params: GitRepositoriesInput, provider: VcsOperations): Promise<GitRepositoriesResult>;
    /**
     * Verifica se erro Ã© relacionado a Git
     */
    isGitRelatedError(errorMessage: string): boolean;
};
export {};
//# sourceMappingURL=git-repositories.d.ts.map