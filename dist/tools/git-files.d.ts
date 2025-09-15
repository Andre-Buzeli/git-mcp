import { z } from 'zod';
import { VcsOperations } from '../providers/index.js';
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
declare const FilesInputSchema: z.ZodObject<{
    action: z.ZodEnum<["get", "create", "update", "delete", "list", "search"]>;
    owner: z.ZodString;
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
    owner: string;
    repo: string;
    action: "delete" | "get" | "create" | "list" | "update" | "search";
    projectPath: string;
    path?: string | undefined;
    message?: string | undefined;
    ref?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sha?: string | undefined;
    query?: string | undefined;
    branch?: string | undefined;
    content?: string | undefined;
}, {
    provider: "gitea" | "github";
    owner: string;
    repo: string;
    action: "delete" | "get" | "create" | "list" | "update" | "search";
    projectPath: string;
    path?: string | undefined;
    message?: string | undefined;
    ref?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sha?: string | undefined;
    query?: string | undefined;
    branch?: string | undefined;
    content?: string | undefined;
}>;
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
            owner: {
                type: string;
                description: string;
            };
            repo: {
                type: string;
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
            provider: {
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
    handler(input: FilesInput): Promise<FilesResult>;
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
    getFile(params: FilesInput, provider: VcsOperations): Promise<FilesResult>;
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
    createFile(params: FilesInput, provider: VcsOperations): Promise<FilesResult>;
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
    updateFile(params: FilesInput, provider: VcsOperations): Promise<FilesResult>;
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
    deleteFile(params: FilesInput, provider: VcsOperations): Promise<FilesResult>;
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
     * - Owner e repo obrigatórios
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
    listFiles(params: FilesInput, provider: VcsOperations): Promise<FilesResult>;
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
    searchFiles(params: FilesInput, provider: VcsOperations): Promise<FilesResult>;
};
export {};
//# sourceMappingURL=git-files.d.ts.map