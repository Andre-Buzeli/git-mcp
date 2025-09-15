/**
 * Verificador de permissões para tokens
 *
 * Este módulo verifica se o token configurado tem permissões
 * adequadas para acessar repositórios privados e públicos.
 */
/**
 * Interface para resultado de verificação de permissões
 */
export interface PermissionCheckResult {
    success: boolean;
    provider: string;
    user: string;
    permissions: {
        publicRepos: boolean;
        privateRepos: boolean;
        writeAccess: boolean;
        adminAccess: boolean;
    };
    errors: string[];
}
/**
 * Verifica as permissões do token atual
 *
 * @param provider Nome do provider (opcional, usa padrão se não fornecido)
 * @returns Resultado da verificação de permissões
 */
export declare function checkTokenPermissions(provider?: string): Promise<PermissionCheckResult>;
/**
 * Gera relatório de permissões em formato legível
 *
 * @param result Resultado da verificação de permissões
 * @returns Relatório formatado
 */
export declare function generatePermissionReport(result: PermissionCheckResult): string;
/**
 * Verifica permissões para todos os providers configurados
 *
 * @returns Array com resultados de todos os providers
 */
export declare function checkAllProvidersPermissions(): Promise<PermissionCheckResult[]>;
//# sourceMappingURL=permission-checker.d.ts.map