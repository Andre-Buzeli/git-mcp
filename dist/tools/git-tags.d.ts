import { z } from 'zod';
import { VcsOperations } from '../providers/index.js';
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
declare const TagsInputSchema: z.ZodObject<{
    action: z.ZodEnum<["create", "list", "get", "delete", "search"]>;
    repo: z.ZodString;
    provider: z.ZodEnum<["gitea", "github"]>;
    tag_name: z.ZodOptional<z.ZodString>;
    message: z.ZodOptional<z.ZodString>;
    target: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["lightweight", "annotated"]>>;
    tagger_name: z.ZodOptional<z.ZodString>;
    tagger_email: z.ZodOptional<z.ZodString>;
    tag: z.ZodOptional<z.ZodString>;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    query: z.ZodOptional<z.ZodString>;
    pattern: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    provider: "gitea" | "github";
    repo: string;
    action: "delete" | "get" | "search" | "list" | "create";
    message?: string | undefined;
    type?: "lightweight" | "annotated" | undefined;
    tag_name?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    tag?: string | undefined;
    query?: string | undefined;
    target?: string | undefined;
    tagger_name?: string | undefined;
    tagger_email?: string | undefined;
    pattern?: string | undefined;
}, {
    provider: "gitea" | "github";
    repo: string;
    action: "delete" | "get" | "search" | "list" | "create";
    message?: string | undefined;
    type?: "lightweight" | "annotated" | undefined;
    tag_name?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    tag?: string | undefined;
    query?: string | undefined;
    target?: string | undefined;
    tagger_name?: string | undefined;
    tagger_email?: string | undefined;
    pattern?: string | undefined;
}>;
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
declare const TagsResultSchema: z.ZodObject<{
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
export declare const tagsTool: {
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
                description: string;
            };
            tag_name: {
                type: string;
                description: string;
            };
            message: {
                type: string;
                description: string;
            };
            target: {
                type: string;
                description: string;
            };
            type: {
                type: string;
                enum: string[];
                description: string;
            };
            tagger_name: {
                type: string;
                description: string;
            };
            tagger_email: {
                type: string;
                description: string;
            };
            tag: {
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
            query: {
                type: string;
                description: string;
            };
            pattern: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
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
    handler(input: TagsInput): Promise<TagsResult>;
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
    createTag(params: TagsInput, provider: VcsOperations): Promise<TagsResult>;
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
     * - Owner e repo obrigatórios
     * - Page deve ser >= 1
     * - Limit deve ser entre 1 e 100
     *
     * RECOMENDAÇÕES:
     * - Use paginação para repositórios com muitas tags
     * - Monitore número total de tags
     * - Verifique commit alvo de cada tag
     * - Mantenha tags organizadas
     */
    listTags(params: TagsInput, provider: VcsOperations): Promise<TagsResult>;
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
    getTag(params: TagsInput, provider: VcsOperations): Promise<TagsResult>;
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
    deleteTag(params: TagsInput, provider: VcsOperations): Promise<TagsResult>;
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
     * - Owner e repo obrigatórios
     * - Query ou pattern deve ser fornecido
     * - Repositório deve existir
     *
     * RECOMENDAÇÕES:
     * - Use padrões glob para busca eficiente
     * - Combine com filtros de nome
     * - Analise resultados para relevância
     * - Use para encontrar tags relacionadas
     */
    searchTags(params: TagsInput, provider: VcsOperations): Promise<TagsResult>;
};
export {};
//# sourceMappingURL=git-tags.d.ts.map