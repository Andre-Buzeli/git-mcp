"use strict";
/**
 * Verificador de permissões para tokens
 *
 * Este módulo verifica se o token configurado tem permissões
 * adequadas para acessar repositórios privados e públicos.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkTokenPermissions = checkTokenPermissions;
exports.generatePermissionReport = generatePermissionReport;
exports.checkAllProvidersPermissions = checkAllProvidersPermissions;
const index_js_1 = require("../providers/index.js");
/**
 * Verifica as permissões do token atual
 *
 * @param provider Nome do provider (opcional, usa padrão se não fornecido)
 * @returns Resultado da verificação de permissões
 */
async function checkTokenPermissions(provider) {
    const result = {
        success: false,
        provider: provider || 'default',
        user: '',
        permissions: {
            publicRepos: false,
            privateRepos: false,
            writeAccess: false,
            adminAccess: false
        },
        errors: []
    };
    try {
        // Obter o provider
        const providerInstance = provider
            ? index_js_1.globalProviderFactory.getProvider(provider)
            : index_js_1.globalProviderFactory.getDefaultProvider();
        if (!providerInstance) {
            result.errors.push(`Provider '${provider}' não encontrado`);
            return result;
        }
        result.provider = providerInstance.config?.name || provider || 'unknown';
        // 1. Verificar se consegue obter informações do usuário atual
        try {
            const userInfo = await providerInstance.getCurrentUser();
            result.user = userInfo.login;
            result.permissions.publicRepos = true; // Se conseguiu obter usuário, tem acesso básico
        }
        catch (error) {
            result.errors.push(`Falha ao obter informações do usuário: ${error instanceof Error ? error.message : String(error)}`);
            return result;
        }
        // 2. Tentar listar repositórios do usuário (inclui privados se tiver permissão)
        try {
            const repositories = await providerInstance.listRepositories(result.user, 1, 10);
            // Verificar se há repositórios privados na lista
            const hasPrivateRepos = repositories.some(repo => repo.private);
            result.permissions.privateRepos = hasPrivateRepos;
            if (repositories.length > 0) {
                result.permissions.writeAccess = true; // Se conseguiu listar, provavelmente tem write access
            }
        }
        catch (error) {
            result.errors.push(`Falha ao listar repositórios: ${error instanceof Error ? error.message : String(error)}`);
        }
        // 3. Tentar obter um repositório específico (teste de read access)
        try {
            const testRepo = await providerInstance.getRepository(result.user, 'test-repo-12345');
            // Se chegou aqui, conseguiu acessar (mesmo que seja um repositório inexistente)
            result.permissions.publicRepos = true;
        }
        catch (error) {
            // Erro esperado se o repositório não existir, mas indica que tem permissão de read
            if (error instanceof Error && !error.message.includes('Not found')) {
                result.errors.push(`Falha ao testar acesso a repositório: ${error.message}`);
            }
        }
        // 4. Verificar permissões de admin (tentar criar um repositório de teste)
        try {
            const testRepoName = `permission-test-${Date.now()}`;
            const testRepo = await providerInstance.createRepository(testRepoName, 'Teste de permissões', true);
            // Se conseguiu criar, tem permissões de admin
            result.permissions.adminAccess = true;
            result.permissions.privateRepos = true;
            result.permissions.writeAccess = true;
            // Limpar o repositório de teste
            try {
                await providerInstance.deleteRepository(result.user, testRepoName);
            }
            catch (cleanupError) {
                result.errors.push(`Aviso: Repositório de teste '${testRepoName}' criado mas não foi possível deletar`);
            }
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('already exists')) {
                // Repositório já existe, mas isso indica que tem permissões de admin
                result.permissions.adminAccess = true;
                result.permissions.privateRepos = true;
                result.permissions.writeAccess = true;
            }
            else {
                result.errors.push(`Sem permissões de admin: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
        // Determinar sucesso geral
        result.success = result.permissions.publicRepos && result.permissions.privateRepos && result.permissions.writeAccess;
    }
    catch (error) {
        result.errors.push(`Erro geral na verificação: ${error instanceof Error ? error.message : String(error)}`);
    }
    return result;
}
/**
 * Gera relatório de permissões em formato legível
 *
 * @param result Resultado da verificação de permissões
 * @returns Relatório formatado
 */
function generatePermissionReport(result) {
    let report = `\n=== RELATÓRIO DE PERMISSÕES ===\n`;
    report += `Provider: ${result.provider}\n`;
    report += `Usuário: ${result.user}\n`;
    report += `Status: ${result.success ? '✅ SUCESSO' : '❌ PROBLEMAS DETECTADOS'}\n\n`;
    report += `PERMISSÕES:\n`;
    report += `• Repositórios públicos: ${result.permissions.publicRepos ? '✅' : '❌'}\n`;
    report += `• Repositórios privados: ${result.permissions.privateRepos ? '✅' : '❌'}\n`;
    report += `• Acesso de escrita: ${result.permissions.writeAccess ? '✅' : '❌'}\n`;
    report += `• Acesso de admin: ${result.permissions.adminAccess ? '✅' : '❌'}\n\n`;
    if (result.errors.length > 0) {
        report += `ERROS DETECTADOS:\n`;
        result.errors.forEach((error, index) => {
            report += `${index + 1}. ${error}\n`;
        });
        report += `\n`;
    }
    if (!result.success) {
        report += `RECOMENDAÇÕES:\n`;
        if (!result.permissions.privateRepos) {
            report += `• Verifique se o token tem permissões para acessar repositórios privados\n`;
        }
        if (!result.permissions.writeAccess) {
            report += `• Verifique se o token tem permissões de escrita (write)\n`;
        }
        if (!result.permissions.adminAccess) {
            report += `• Para operações completas, o token precisa de permissões de admin\n`;
        }
        report += `• Consulte a documentação do seu provider (Gitea/GitHub) para configurar permissões adequadas\n`;
    }
    return report;
}
/**
 * Verifica permissões para todos os providers configurados
 *
 * @returns Array com resultados de todos os providers
 */
async function checkAllProvidersPermissions() {
    const results = [];
    const providers = index_js_1.globalProviderFactory.listProviders();
    for (const providerName of providers) {
        const result = await checkTokenPermissions(providerName);
        results.push(result);
    }
    return results;
}
//# sourceMappingURL=permission-checker.js.map