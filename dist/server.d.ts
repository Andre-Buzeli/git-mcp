/**
 * Servidor MCP principal para Gitea
 *
 * RESPONSABILIDADES:
 * - Inicializar servidor MCP
 * - Registrar handlers para requests
 * - Gerenciar ciclo de vida das tools
 * - Tratar erros e validações
 *
 * ARQUITETURA:
 * - Server MCP padrão com transport stdio
 * - Handlers para list e call de tools
 * - Tratamento centralizado de erros
 *
 * RECOMENDAÇÕES:
 * - Use apenas uma instância por processo
 * - Configure handlers antes de conectar
 * - Implemente graceful shutdown
 */
export declare class GiteaMCPServer {
    private server;
    constructor();
    /**
     * Configura os handlers para requests MCP
     *
     * HANDLERS IMPLEMENTADOS:
     * - ListTools: Lista todas as tools disponíveis
     * - CallTool: Executa uma tool específica
     *
     * FLUXO:
     * 1. Validação de parâmetros
     * 2. Busca da tool solicitada
     * 3. Execução com tratamento de erros
     * 4. Retorno de resultado ou erro
     *
     * TRATAMENTO DE ERROS:
     * - Tool não encontrada: erro específico
     * - Erro de execução: captura e formata
     * - Erro de validação: mensagem descritiva
     */
    private setupHandlers;
    /**
     * Inicializa e executa o servidor MCP
     *
     * FLUXO DE INICIALIZAÇÃO:
     * 1. Validação de configuração
     * 2. Verificação de token obrigatório
     * 3. Conexão com transport stdio
     * 4. Log de status e debug
     *
     * VALIDAÇÕES:
     * - Token de autenticação obrigatório
     * - URL do Gitea válida
     * - Configuração de debug opcional
     *
     * RECOMENDAÇÕES:
     * - Configure DEBUG=true para desenvolvimento
     * - Valide token antes de iniciar
     * - Configure timeout adequado
     */
    run(): Promise<void>;
    /**
     * Fecha o servidor MCP graciosamente
     *
     * USO:
     * - Durante shutdown da aplicação
     * - Para limpeza de recursos
     * - Para finalização controlada
     *
     * RECOMENDAÇÕES:
     * - Sempre chame antes de sair
     * - Aguarde a conclusão da operação
     * - Trate erros de fechamento
     */
    close(): Promise<void>;
}
//# sourceMappingURL=server.d.ts.map