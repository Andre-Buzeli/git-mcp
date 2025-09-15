import { z } from 'zod';
import { VcsOperations } from '../providers/index.js';
/**
 * Tool: branches
 *
 * DESCRIÇÃO:
 * Gerenciamento completo de branches Gitea com múltiplas ações
 *
 * FUNCIONALIDADES:
 * - Criação de novas branches
 * - Listagem e busca de branches
 * - Obtenção de detalhes específicos
 * - Exclusão de branches
 * - Merge de branches
 * - Comparação entre branches
 *
 * USO:
 * - Para gerenciar fluxo de trabalho Git
 * - Para criar branches de feature
 * - Para organizar desenvolvimento
 * - Para controle de versão
 *
 * RECOMENDAÇÕES:
 * - Use convenções de nomenclatura consistentes
 * - Proteja branches importantes
 * - Mantenha branches limpas
 * - Documente propósito das branches
 */
/**
 * Schema de validação para entrada da tool branches
 *
 * VALIDAÇÕES:
 * - action: Ação obrigatória (create, list, get, delete, merge, compare)
 * - Parâmetros específicos por ação
 * - Validação de tipos e formatos
 *
 * RECOMENDAÇÕES:
 * - Sempre valide entrada antes de usar
 * - Use parâmetros opcionais adequadamente
 * - Documente parâmetros obrigatórios
 */
declare const BranchesInputSchema: z.ZodObject<{
    action: z.ZodEnum<["create", "list", "get", "delete", "merge", "compare"]>;
    owner: z.ZodString;
    repo: z.ZodString;
    projectPath: z.ZodString;
    provider: z.ZodEnum<["gitea", "github"]>;
    branch_name: z.ZodOptional<z.ZodString>;
    from_branch: z.ZodOptional<z.ZodString>;
    branch: z.ZodOptional<z.ZodString>;
    head: z.ZodOptional<z.ZodString>;
    base: z.ZodOptional<z.ZodString>;
    merge_method: z.ZodOptional<z.ZodEnum<["merge", "rebase", "squash"]>>;
    page: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
    base_branch: z.ZodOptional<z.ZodString>;
    head_branch: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    provider: "gitea" | "github";
    owner: string;
    repo: string;
    action: "merge" | "delete" | "get" | "create" | "list" | "compare";
    projectPath: string;
    head?: string | undefined;
    base?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    branch?: string | undefined;
    branch_name?: string | undefined;
    from_branch?: string | undefined;
    merge_method?: "merge" | "rebase" | "squash" | undefined;
    base_branch?: string | undefined;
    head_branch?: string | undefined;
}, {
    provider: "gitea" | "github";
    owner: string;
    repo: string;
    action: "merge" | "delete" | "get" | "create" | "list" | "compare";
    projectPath: string;
    head?: string | undefined;
    base?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    branch?: string | undefined;
    branch_name?: string | undefined;
    from_branch?: string | undefined;
    merge_method?: "merge" | "rebase" | "squash" | undefined;
    base_branch?: string | undefined;
    head_branch?: string | undefined;
}>;
export type BranchesInput = z.infer<typeof BranchesInputSchema>;
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
declare const BranchesResultSchema: z.ZodObject<{
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
export type BranchesResult = z.infer<typeof BranchesResultSchema>;
/**
 * Tool: branches
 *
 * DESCRIÇÃO:
 * Gerenciamento completo de branches Gitea com múltiplas ações
 *
 * ACTIONS DISPONÍVEIS:
 *
 * 1. create - Criar nova branch
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - branch_name (obrigatório): Nome da nova branch
 *    - from_branch (obrigatório): Branch de origem
 *
 * 2. list - Listar branches
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - page (opcional): Página da listagem (padrão: 1)
 *    - limit (opcional): Itens por página (padrão: 30)
 *
 * 3. get - Obter detalhes da branch
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - branch (obrigatório): Nome da branch
 *
 * 4. delete - Deletar branch
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - branch (obrigatório): Nome da branch
 *
 * 5. merge - Fazer merge de branches
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - head (obrigatório): Branch de origem
 *    - base (obrigatório): Branch de destino
 *    - merge_method (opcional): Método de merge (padrão: merge)
 *
 * 6. compare - Comparar branches
 *    Parâmetros:
 *    - owner (obrigatório): Proprietário do repositório
 *    - repo (obrigatório): Nome do repositório
 *    - base_branch (obrigatório): Branch base
 *    - head_branch (obrigatório): Branch de comparação
 *
 * RECOMENDAÇÕES DE USO:
 * - Use nomes descritivos para branches
 * - Mantenha branches principais protegidas
 * - Faça merge regularmente
 * - Documente propósito das branches
 * - Use convenções de nomenclatura
 * - Limpe branches antigas
 */
export declare const branchesTool: {
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
            projectPath: {
                type: string;
                description: string;
            };
            provider: {
                type: string;
                description: string;
            };
            branch_name: {
                type: string;
                description: string;
            };
            from_branch: {
                type: string;
                description: string;
            };
            branch: {
                type: string;
                description: string;
            };
            head: {
                type: string;
                description: string;
            };
            base: {
                type: string;
                description: string;
            };
            merge_method: {
                type: string;
                enum: string[];
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
            base_branch: {
                type: string;
                description: string;
            };
            head_branch: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    /**
     * Handler principal da tool branches
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
    handler(input: BranchesInput): Promise<BranchesResult>;
    /**
     * Cria uma nova branch no repositório
     *
     * FUNCIONALIDADE:
     * - Valida parâmetros obrigatórios
     * - Cria branch a partir de branch existente
     * - Retorna detalhes da nova branch
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - branch_name: Nome da nova branch
     * - from_branch: Branch de origem
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Branch de origem deve existir
     * - Nome da nova branch deve ser único
     *
     * RECOMENDAÇÕES:
     * - Use nomes descritivos para branches
     * - Crie a partir de branches estáveis
     * - Documente propósito da branch
     * - Use convenções de nomenclatura
     */
    createBranch(params: BranchesInput, provider: VcsOperations): Promise<BranchesResult>;
    /**
     * Lista todas as branches do repositório
     *
     * FUNCIONALIDADE:
     * - Lista branches com paginação
     * - Retorna informações básicas de cada branch
     * - Suporta filtros de paginação
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
     * - Use paginação para repositórios grandes
     * - Monitore número total de branches
     * - Mantenha branches organizadas
     */
    listBranches(params: BranchesInput, provider: VcsOperations): Promise<BranchesResult>;
    /**
     * Obtém detalhes de uma branch específica
     *
     * FUNCIONALIDADE:
     * - Retorna informações completas da branch
     * - Inclui commit mais recente
     * - Informações de proteção e permissões
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - branch: Nome da branch
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Branch deve existir no repositório
     *
     * RECOMENDAÇÕES:
     * - Use para obter informações detalhadas
     * - Verifique status de proteção
     * - Monitore commits recentes
     */
    getBranch(params: BranchesInput, provider: VcsOperations): Promise<BranchesResult>;
    /**
     * Deleta uma branch do repositório
     *
     * FUNCIONALIDADE:
     * - Remove branch especificada
     * - Valida permissões de exclusão
     * - Confirma exclusão bem-sucedida
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - branch: Nome da branch a ser deletada
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Branch deve existir
     * - Usuário deve ter permissão de exclusão
     *
     * RECOMENDAÇÕES:
     * - Confirme antes de deletar
     * - Verifique se branch foi mergeada
     * - Mantenha backup se necessário
     * - Documente motivo da exclusão
     */
    deleteBranch(params: BranchesInput, provider: VcsOperations): Promise<BranchesResult>;
    /**
     * Faz merge de uma branch em outra
     *
     * FUNCIONALIDADE:
     * - Merge de branch de origem em branch de destino
     * - Suporta diferentes métodos de merge
     * - Retorna resultado do merge
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - head: Branch de origem (será mergeada)
     * - base: Branch de destino (receberá o merge)
     *
     * PARÂMETROS OPCIONAIS:
     * - merge_method: Método de merge (merge, rebase, squash)
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Branches devem existir
     * - Não deve haver conflitos
     *
     * RECOMENDAÇÕES:
     * - Resolva conflitos antes do merge
     * - Escolha método de merge adequado
     * - Teste após o merge
     * - Documente mudanças
     */
    mergeBranches(params: BranchesInput, provider: VcsOperations): Promise<BranchesResult>;
    /**
     * Compara duas branches
     *
     * FUNCIONALIDADE:
     * - Compara diferenças entre branches
     * - Retorna commits diferentes
     * - Mostra divergências
     *
     * PARÂMETROS OBRIGATÓRIOS:
     * - owner: Proprietário do repositório
     * - repo: Nome do repositório
     * - base_branch: Branch base para comparação
     * - head_branch: Branch a ser comparada
     *
     * VALIDAÇÕES:
     * - Todos os parâmetros obrigatórios
     * - Ambas as branches devem existir
     *
     * RECOMENDAÇÕES:
     * - Use para verificar divergências
     * - Compare antes de fazer merge
     * - Analise commits diferentes
     * - Documente diferenças importantes
     */
    compareBranches(params: BranchesInput, provider: VcsOperations): Promise<BranchesResult>;
};
export {};
//# sourceMappingURL=git-branches.d.ts.map