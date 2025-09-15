/**
 * Controller para execução de comandos no terminal
 * Fornece interface padronizada para executar comandos Git e outros
 */
export interface TerminalCommand {
    command: string;
    is_background: boolean;
    explanation: string;
}
export interface TerminalResult {
    exitCode: number;
    output: string;
    error: string;
}
/**
 * Executa um comando no terminal
 *
 * @param params Parâmetros do comando
 * @returns Promise com resultado da execução
 */
export declare function runTerminalCmd(params: TerminalCommand & {
    projectPath?: string;
}): Promise<TerminalResult>;
/**
 * Executa comando Git no diretório especificado
 *
 * @param gitCommand Comando Git a executar
 * @param projectPath Caminho do projeto
 * @param explanation Explicação do comando
 * @returns Promise com resultado
 */
export declare function runGitCommand(gitCommand: string, projectPath: string, explanation: string): Promise<TerminalResult>;
/**
 * Verifica se um diretório é um repositório Git
 *
 * @param projectPath Caminho do projeto
 * @returns Promise<boolean>
 */
export declare function isGitRepository(projectPath: string): Promise<boolean>;
/**
 * Obtém status do repositório Git
 *
 * @param projectPath Caminho do projeto
 * @returns Promise<TerminalResult>
 */
export declare function getGitStatus(projectPath: string): Promise<TerminalResult>;
/**
 * Adiciona arquivos ao stage
 *
 * @param projectPath Caminho do projeto
 * @param files Arquivos específicos ou '.' para todos
 * @returns Promise<TerminalResult>
 */
export declare function gitAdd(projectPath: string, files?: string): Promise<TerminalResult>;
/**
 * Faz commit dos arquivos staged
 *
 * @param projectPath Caminho do projeto
 * @param message Mensagem do commit
 * @returns Promise<TerminalResult>
 */
export declare function gitCommit(projectPath: string, message: string): Promise<TerminalResult>;
/**
 * Faz push para o repositório remoto
 *
 * @param projectPath Caminho do projeto
 * @param branch Branch para fazer push
 * @param remote Remote (padrão: origin)
 * @returns Promise<TerminalResult>
 */
export declare function gitPush(projectPath: string, branch?: string, remote?: string): Promise<TerminalResult>;
/**
 * Faz pull do repositório remoto
 *
 * @param projectPath Caminho do projeto
 * @param branch Branch para fazer pull
 * @param remote Remote (padrão: origin)
 * @returns Promise<TerminalResult>
 */
export declare function gitPull(projectPath: string, branch?: string, remote?: string): Promise<TerminalResult>;
//# sourceMappingURL=terminal-controller.d.ts.map