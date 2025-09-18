import { z } from 'zod';
import { VcsOperations } from '../providers/index.js';
/**
 * Tool: files
 *
 * DESCRIÃ‡ÃƒO:
 * Gerenciamento completo de arquivos e diretÃ³rios Gitea com mÃºltiplas aÃ§Ãµes
 *
 * FUNCIONALIDADES:
 * - CriaÃ§Ã£o de arquivos e diretÃ³rios
 * - Leitura e listagem de conteÃºdo
 * - AtualizaÃ§Ã£o de arquivos existentes
 * - ExclusÃ£o de arquivos e diretÃ³rios
 * - Busca por conteÃºdo e nome
 * - Controle de versÃ£o de arquivos
 *
 * USO:
 * - Para gerenciar arquivos de projeto
 * - Para automatizar criaÃ§Ã£o de arquivos
 * - Para backup e migraÃ§Ã£o de conteÃºdo
 * - Para sincronizaÃ§Ã£o de arquivos
 *
 * RECOMENDAÃ‡Ã•ES:
 * - Use mensagens de commit descritivas
 * - Mantenha estrutura de diretÃ³rios organizada
 * - Valide conteÃºdo antes de enviar
 * - Use branches para mudanÃ§as grandes
 */
/**
 * Schema de validaÃ§Ã£o para entrada da tool files
 *
 * VALIDAÃ‡Ã•ES:
 * - action: AÃ§Ã£o obrigatÃ³ria (get, create, update, delete, list, search)
 * - ParÃ¢metros especÃ­ficos por aÃ§Ã£o
 * - ValidaÃ§Ã£o de tipos e formatos
 *
 * RECOMENDAÃ‡Ã•ES:
 * - Sempre valide entrada antes de usar
 * - Use parÃ¢metros opcionais adequadamente
 * - Documente parÃ¢metros obrigatÃ³rios
 */
declare const FilesInputSchema: z.ZodObject<{
    action: z.ZodEnum<["get", "create", "update", "delete", "list", "search", "upload-project"]>;
    repo: z.ZodString;
    path: z.ZodOptional<z.ZodString>;
    projectPath: z.ZodString;
    provider: z.ZodEnum<["gitea", "github"]>;
    content: z.ZodOptional<z.ZodString>;
    message: z.ZodOptional<z.ZodString>;
    branch: z.ZodOptional<z.ZodString>;
    sha: z.ZodOptional<z.ZodString>;
    ref: z.ZodOptional<z.ZodString>;
    query: z.ZodOptional<z.ZodString>;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    provider: "gitea" | "github";
    repo: string;
    action: "delete" | "get" | "search" | "list" | "create" | "update" | "upload-project";
    projectPath: string;
    path?: string | undefined;
    message?: string | undefined;
    branch?: string | undefined;
    ref?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sha?: string | undefined;
    query?: string | undefined;
    content?: string | undefined;
}, {
    provider: "gitea" | "github";
    repo: string;
    action: "delete" | "get" | "search" | "list" | "create" | "update" | "upload-project";
    projectPath: string;
    path?: string | undefined;
    message?: string | undefined;
    branch?: string | undefined;
    ref?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sha?: string | undefined;
    query?: string | undefined;
    content?: string | undefined;
}>;
export type FilesInput = z.infer<typeof FilesInputSchema>;
/**
 * Schema de saÃ­da padronizado
 *
 * ESTRUTURA:
 * - success: Status da operaÃ§Ã£o
 * - action: AÃ§Ã£o executada
 * - message: Mensagem descritiva
 * - data: Dados retornados (opcional)
 * - error: Detalhes do erro (opcional)
 */
declare const FilesResultSchema: z.ZodObject<{
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
export type FilesResult = z.infer<typeof FilesResultSchema>;
/**
 * Tool: files
 *
 * DESCRIÃ‡ÃƒO:
 * Gerenciamento completo de arquivos e diretÃ³rios Gitea com mÃºltiplas aÃ§Ãµes
 *
 * ACTIONS DISPONÃVEIS:
 *
 * 1. get - Obter conteÃºdo de arquivo
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - path (obrigatÃ³rio): Caminho do arquivo
 *    - ref (opcional): Branch, tag ou commit (padrÃ£o: branch padrÃ£o)
 *
 * 2. create - Criar novo arquivo
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - path (obrigatÃ³rio): Caminho do arquivo
 *    - content (obrigatÃ³rio): ConteÃºdo do arquivo
 *    - message (obrigatÃ³rio): Mensagem de commit
 *    - branch (opcional): Branch de destino (padrÃ£o: branch padrÃ£o)
 *
 * 3. update - Atualizar arquivo existente
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - path (obrigatÃ³rio): Caminho do arquivo
 *    - content (obrigatÃ³rio): Novo conteÃºdo
 *    - message (obrigatÃ³rio): Mensagem de commit
 *    - sha (obrigatÃ³rio): SHA do arquivo atual
 *    - branch (opcional): Branch de destino (padrÃ£o: branch padrÃ£o)
 *
 * 4. delete - Deletar arquivo
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - path (obrigatÃ³rio): Caminho do arquivo
 *    - message (obrigatÃ³rio): Mensagem de commit
 *    - sha (obrigatÃ³rio): SHA do arquivo
 *    - branch (opcional): Branch de destino (padrÃ£o: branch padrÃ£o)
 *
 * 5. list - Listar conteÃºdo de diretÃ³rio
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - path (opcional): Caminho do diretÃ³rio (padrÃ£o: raiz)
 *    - ref (opcional): Branch, tag ou commit (padrÃ£o: branch padrÃ£o)
 *    - page (opcional): PÃ¡gina da listagem (padrÃ£o: 1)
 *    - limit (opcional): Itens por pÃ¡gina (padrÃ£o: 30, mÃ¡ximo: 100)
 *
 * 6. search - Buscar arquivos por conteÃºdo
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - query (obrigatÃ³rio): Termo de busca
 *    - ref (opcional): Branch, tag ou commit (padrÃ£o: branch padrÃ£o)
 *
 * RECOMENDAÃ‡Ã•ES DE USO:
 * - Use mensagens de commit descritivas
 * - Mantenha estrutura de diretÃ³rios organizada
 * - Valide conteÃºdo antes de enviar
 * - Use branches para mudanÃ§as grandes
 * - Documente mudanÃ§as importantes
 * - Mantenha histÃ³rico de commits limpo
 */
export declare const filesTool: {
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
            path: {
                type: string;
                description: string;
            };
            projectPath: {
                type: string;
                description: string;
            };
            content: {
                type: string;
                description: string;
            };
            message: {
                type: string;
                description: string;
            };
            branch: {
                type: string;
                description: string;
            };
            sha: {
                type: string;
                description: string;
            };
            ref: {
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
        };
        required: string[];
    };
    /**
     * Handler principal da tool files
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
    handler(input: FilesInput): Promise<FilesResult>;
    /**
     * ObtÃ©m o conteÃºdo de um arquivo especÃ­fico
     *
     * FUNCIONALIDADE:
     * - Retorna conteÃºdo completo do arquivo
     * - Inclui metadados (SHA, tamanho, tipo)
     * - Suporta diferentes referÃªncias (branch, tag, commit)
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - path: Caminho do arquivo
     *
     * PARÃ‚METROS OPCIONAIS:
     * - ref: Branch, tag ou commit (padrÃ£o: branch padrÃ£o)
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Arquivo deve existir no caminho especificado
     * - ReferÃªncia deve ser vÃ¡lida
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use para leitura de arquivos de configuraÃ§Ã£o
     * - Verifique tamanho antes de ler arquivos grandes
     * - Use referÃªncias especÃ­ficas para versÃµes
     * - Trate arquivos binÃ¡rios adequadamente
     */
    getFile(params: FilesInput, provider: VcsOperations, owner: string): Promise<FilesResult>;
    /**
     * Cria um novo arquivo no repositÃ³rio
     *
     * FUNCIONALIDADE:
     * - Cria arquivo com conteÃºdo especificado
     * - Faz commit automÃ¡tico com mensagem
     * - Suporta criaÃ§Ã£o em branches especÃ­ficas
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - path: Caminho do arquivo
     * - content: ConteÃºdo do arquivo
     * - message: Mensagem de commit
     *
     * PARÃ‚METROS OPCIONAIS:
     * - branch: Branch de destino (padrÃ£o: branch padrÃ£o)
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Caminho deve ser vÃ¡lido
     * - UsuÃ¡rio deve ter permissÃ£o de escrita
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use mensagens de commit descritivas
     * - Valide conteÃºdo antes de enviar
     * - Use branches para mudanÃ§as grandes
     * - Documente propÃ³sito do arquivo
     */
    createFile(params: FilesInput, provider: VcsOperations, owner: string): Promise<FilesResult>;
    /**
     * Atualiza um arquivo existente no repositÃ³rio
     *
     * FUNCIONALIDADE:
     * - Atualiza conteÃºdo do arquivo
     * - Faz commit com nova versÃ£o
     * - Requer SHA do arquivo atual
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - path: Caminho do arquivo
     * - content: Novo conteÃºdo
     * - message: Mensagem de commit
     * - sha: SHA do arquivo atual
     *
     * PARÃ‚METROS OPCIONAIS:
     * - branch: Branch de destino (padrÃ£o: branch padrÃ£o)
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Arquivo deve existir
     * - SHA deve ser vÃ¡lido
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Sempre obtenha SHA atual antes de atualizar
     * - Use mensagens de commit descritivas
     * - Verifique se arquivo nÃ£o foi modificado por outro usuÃ¡rio
     * - Teste mudanÃ§as antes de commitar
     */
    updateFile(params: FilesInput, provider: VcsOperations, owner: string): Promise<FilesResult>;
    /**
     * Deleta um arquivo do repositÃ³rio
     *
     * FUNCIONALIDADE:
     * - Remove arquivo especificado
     * - Faz commit de exclusÃ£o
     * - Requer SHA do arquivo
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - path: Caminho do arquivo
     * - message: Mensagem de commit
     * - sha: SHA do arquivo
     *
     * PARÃ‚METROS OPCIONAIS:
     * - branch: Branch de destino (padrÃ£o: branch padrÃ£o)
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Arquivo deve existir
     * - SHA deve ser vÃ¡lido
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Confirme exclusÃ£o antes de executar
     * - Use mensagens de commit descritivas
     * - Verifique dependÃªncias do arquivo
     * - Mantenha backup se necessÃ¡rio
     */
    deleteFile(params: FilesInput, provider: VcsOperations, owner: string): Promise<FilesResult>;
    /**
     * Lista conteÃºdo de um diretÃ³rio
     *
     * FUNCIONALIDADE:
     * - Lista arquivos e subdiretÃ³rios
     * - Suporta paginaÃ§Ã£o
     * - Inclui metadados de cada item
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     *
     * PARÃ‚METROS OPCIONAIS:
     * - path: Caminho do diretÃ³rio (padrÃ£o: raiz)
     * - ref: Branch, tag ou commit (padrÃ£o: branch padrÃ£o)
     * - page: PÃ¡gina da listagem (padrÃ£o: 1)
     * - limit: Itens por pÃ¡gina (padrÃ£o: 30, mÃ¡ximo: 100)
     *
     * VALIDAÃ‡Ã•ES:
     * - e repo obrigatÃ³rios
     * - DiretÃ³rio deve existir
     * - Page deve ser >= 1
     * - Limit deve ser entre 1 e 100
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use paginaÃ§Ã£o para diretÃ³rios grandes
     * - Monitore nÃºmero total de itens
     * - Use referÃªncias especÃ­ficas para versÃµes
     * - Organize estrutura de diretÃ³rios
     */
    listFiles(params: FilesInput, provider: VcsOperations, owner: string): Promise<FilesResult>;
    /**
     * Busca arquivos por conteÃºdo
     *
     * FUNCIONALIDADE:
     * - Busca arquivos que contenham texto especÃ­fico
     * - Suporta diferentes referÃªncias
     * - Retorna resultados relevantes
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - query: Termo de busca
     *
     * PARÃ‚METROS OPCIONAIS:
     * - ref: Branch, tag ou commit (padrÃ£o: branch padrÃ£o)
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Query deve ter pelo menos 3 caracteres
     * - RepositÃ³rio deve existir
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use termos de busca especÃ­ficos
     * - Combine com filtros de diretÃ³rio
     * - Use referÃªncias para versÃµes especÃ­ficas
     * - Analise resultados para relevÃ¢ncia
     */
    searchFiles(params: FilesInput, provider: VcsOperations, owner: string): Promise<FilesResult>;
    /**
     * Faz upload de todo o projeto para o repositÃ³rio
     *
     * FUNCIONALIDADE:
     * - Envia todos os arquivos do projeto local
     * - Ignora diretÃ³rios desnecessÃ¡rios (node_modules, .git, dist)
     * - Ignora arquivos temporÃ¡rios e logs
     * - Faz commit com mensagem personalizada
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - projectPath: Caminho do projeto local
     * - message: Mensagem de commit
     *
     * PARÃ‚METROS OPCIONAIS:
     * - branch: Branch de destino (padrÃ£o: branch padrÃ£o)
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Projeto deve existir no caminho especificado
     * - UsuÃ¡rio deve ter permissÃ£o de escrita
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use mensagens de commit descritivas
     * - Verifique se o repositÃ³rio estÃ¡ limpo
     * - Use branches para mudanÃ§as grandes
     * - Monitore erros de upload
     */
    uploadProject(params: FilesInput, provider: VcsOperations, owner: string): Promise<FilesResult>;
    /**
     * Verifica se erro Ã© relacionado a Git
     */
    isGitRelatedError(errorMessage: string): boolean;
};
export {};
//# sourceMappingURL=git-files.d.ts.map