import { z } from 'zod';
import { VcsOperations } from '../providers/index.js';
/**
 * Tool: branches
 *
 * DESCRIÃ‡ÃƒO:
 * Gerenciamento completo de branches Gitea com mÃºltiplas aÃ§Ãµes
 *
 * FUNCIONALIDADES:
 * - CriaÃ§Ã£o de novas branches
 * - Listagem e busca de branches
 * - ObtenÃ§Ã£o de detalhes especÃ­ficos
 * - ExclusÃ£o de branches
 * - Merge de branches
 * - ComparaÃ§Ã£o entre branches
 *
 * USO:
 * - Para gerenciar fluxo de trabalho Git
 * - Para criar branches de feature
 * - Para organizar desenvolvimento
 * - Para controle de versÃ£o
 *
 * RECOMENDAÃ‡Ã•ES:
 * - Use convenÃ§Ãµes de nomenclatura consistentes
 * - Proteja branches importantes
 * - Mantenha branches limpas
 * - Documente propÃ³sito das branches
 */
/**
 * Schema de validaÃ§Ã£o para entrada da tool branches
 *
 * VALIDAÃ‡Ã•ES:
 * - action: AÃ§Ã£o obrigatÃ³ria (create, list, get, delete, merge, compare)
 * - ParÃ¢metros especÃ­ficos por aÃ§Ã£o
 * - ValidaÃ§Ã£o de tipos e formatos
 *
 * RECOMENDAÃ‡Ã•ES:
 * - Sempre valide entrada antes de usar
 * - Use parÃ¢metros opcionais adequadamente
 * - Documente parÃ¢metros obrigatÃ³rios
 */
declare const BranchesInputSchema: z.ZodObject<{
    action: z.ZodEnum<["create", "list", "get", "delete", "merge", "compare"]>;
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
    repo: string;
    action: "merge" | "delete" | "get" | "list" | "create" | "compare";
    projectPath: string;
    branch?: string | undefined;
    head?: string | undefined;
    base?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    branch_name?: string | undefined;
    from_branch?: string | undefined;
    merge_method?: "merge" | "rebase" | "squash" | undefined;
    base_branch?: string | undefined;
    head_branch?: string | undefined;
}, {
    provider: "gitea" | "github";
    repo: string;
    action: "merge" | "delete" | "get" | "list" | "create" | "compare";
    projectPath: string;
    branch?: string | undefined;
    head?: string | undefined;
    base?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    branch_name?: string | undefined;
    from_branch?: string | undefined;
    merge_method?: "merge" | "rebase" | "squash" | undefined;
    base_branch?: string | undefined;
    head_branch?: string | undefined;
}>;
export type BranchesInput = z.infer<typeof BranchesInputSchema>;
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
 * DESCRIÃ‡ÃƒO:
 * Gerenciamento completo de branches Gitea com mÃºltiplas aÃ§Ãµes
 *
 * ACTIONS DISPONÃVEIS:
 *
 * 1. create - Criar nova branch
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - branch_name (obrigatÃ³rio): Nome da nova branch
 *    - from_branch (obrigatÃ³rio): Branch de origem
 *
 * 2. list - Listar branches
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - page (opcional): PÃ¡gina da listagem (padrÃ£o: 1)
 *    - limit (opcional): Itens por pÃ¡gina (padrÃ£o: 30)
 *
 * 3. get - Obter detalhes da branch
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - branch (obrigatÃ³rio): Nome da branch
 *
 * 4. delete - Deletar branch
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - branch (obrigatÃ³rio): Nome da branch
 *
 * 5. merge - Fazer merge de branches
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - head (obrigatÃ³rio): Branch de origem
 *    - base (obrigatÃ³rio): Branch de destino
 *    - merge_method (opcional): MÃ©todo de merge (padrÃ£o: merge)
 *
 * 6. compare - Comparar branches
 *    ParÃ¢metros:
 *    - owner (obrigatÃ³rio): ProprietÃ¡rio do repositÃ³rio
 *    - repo (obrigatÃ³rio): Nome do repositÃ³rio
 *    - base_branch (obrigatÃ³rio): Branch base
 *    - head_branch (obrigatÃ³rio): Branch de comparaÃ§Ã£o
 *
 * RECOMENDAÃ‡Ã•ES DE USO:
 * - Use nomes descritivos para branches
 * - Mantenha branches principais protegidas
 * - FaÃ§a merge regularmente
 * - Documente propÃ³sito das branches
 * - Use convenÃ§Ãµes de nomenclatura
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
    handler(input: BranchesInput): Promise<BranchesResult>;
    /**
     * Cria uma nova branch no repositÃ³rio
     *
     * FUNCIONALIDADE:
     * - Valida parÃ¢metros obrigatÃ³rios
     * - Cria branch a partir de branch existente
     * - Retorna detalhes da nova branch
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - branch_name: Nome da nova branch
     * - from_branch: Branch de origem
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Branch de origem deve existir
     * - Nome da nova branch deve ser Ãºnico
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use nomes descritivos para branches
     * - Crie a partir de branches estÃ¡veis
     * - Documente propÃ³sito da branch
     * - Use convenÃ§Ãµes de nomenclatura
     */
    createBranch(params: BranchesInput, provider: VcsOperations): Promise<BranchesResult>;
    /**
     * Lista todas as branches do repositÃ³rio
     *
     * FUNCIONALIDADE:
     * - Lista branches com paginaÃ§Ã£o
     * - Retorna informaÃ§Ãµes bÃ¡sicas de cada branch
     * - Suporta filtros de paginaÃ§Ã£o
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     *
     * PARÃ‚METROS OPCIONAIS:
     * - page: PÃ¡gina da listagem (padrÃ£o: 1)
     * - limit: Itens por pÃ¡gina (padrÃ£o: 30, mÃ¡ximo: 100)
     *
     * VALIDAÃ‡Ã•ES:
     * - e repo obrigatÃ³rios
     * - Page deve ser >= 1
     * - Limit deve ser entre 1 e 100
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use paginaÃ§Ã£o para repositÃ³rios grandes
     * - Monitore nÃºmero total de branches
     * - Mantenha branches organizadas
     */
    listBranches(params: BranchesInput, provider: VcsOperations): Promise<BranchesResult>;
    /**
     * ObtÃ©m detalhes de uma branch especÃ­fica
     *
     * FUNCIONALIDADE:
     * - Retorna informaÃ§Ãµes completas da branch
     * - Inclui commit mais recente
     * - InformaÃ§Ãµes de proteÃ§Ã£o e permissÃµes
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - branch: Nome da branch
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Branch deve existir no repositÃ³rio
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use para obter informaÃ§Ãµes detalhadas
     * - Verifique status de proteÃ§Ã£o
     * - Monitore commits recentes
     */
    getBranch(params: BranchesInput, provider: VcsOperations): Promise<BranchesResult>;
    /**
     * Deleta uma branch do repositÃ³rio
     *
     * FUNCIONALIDADE:
     * - Remove branch especificada
     * - Valida permissÃµes de exclusÃ£o
     * - Confirma exclusÃ£o bem-sucedida
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - branch: Nome da branch a ser deletada
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Branch deve existir
     * - UsuÃ¡rio deve ter permissÃ£o de exclusÃ£o
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Confirme antes de deletar
     * - Verifique se branch foi mergeada
     * - Mantenha backup se necessÃ¡rio
     * - Documente motivo da exclusÃ£o
     */
    deleteBranch(params: BranchesInput, provider: VcsOperations): Promise<BranchesResult>;
    /**
     * Faz merge de uma branch em outra
     *
     * FUNCIONALIDADE:
     * - Merge de branch de origem em branch de destino
     * - Suporta diferentes mÃ©todos de merge
     * - Retorna resultado do merge
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - head: Branch de origem (serÃ¡ mergeada)
     * - base: Branch de destino (receberÃ¡ o merge)
     *
     * PARÃ‚METROS OPCIONAIS:
     * - merge_method: MÃ©todo de merge (merge, rebase, squash)
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Branches devem existir
     * - NÃ£o deve haver conflitos
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Resolva conflitos antes do merge
     * - Escolha mÃ©todo de merge adequado
     * - Teste apÃ³s o merge
     * - Documente mudanÃ§as
     */
    mergeBranches(params: BranchesInput, provider: VcsOperations): Promise<BranchesResult>;
    /**
     * Compara duas branches
     *
     * FUNCIONALIDADE:
     * - Compara diferenÃ§as entre branches
     * - Retorna commits diferentes
     * - Mostra divergÃªncias
     *
     * PARÃ‚METROS OBRIGATÃ“RIOS:
     * - owner: ProprietÃ¡rio do repositÃ³rio
     * - repo: Nome do repositÃ³rio
     * - base_branch: Branch base para comparaÃ§Ã£o
     * - head_branch: Branch a ser comparada
     *
     * VALIDAÃ‡Ã•ES:
     * - Todos os parÃ¢metros obrigatÃ³rios
     * - Ambas as branches devem existir
     *
     * RECOMENDAÃ‡Ã•ES:
     * - Use para verificar divergÃªncias
     * - Compare antes de fazer merge
     * - Analise commits diferentes
     * - Documente diferenÃ§as importantes
     */
    compareBranches(params: BranchesInput, provider: VcsOperations): Promise<BranchesResult>;
    /**
     * Verifica se erro Ã© relacionado a Git
     */
    isGitRelatedError(errorMessage: string): boolean;
};
export {};
//# sourceMappingURL=git-branches.d.ts.map