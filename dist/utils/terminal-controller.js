"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runTerminalCmd = runTerminalCmd;
exports.runGitCommand = runGitCommand;
exports.isGitRepository = isGitRepository;
exports.getGitStatus = getGitStatus;
exports.gitAdd = gitAdd;
exports.gitCommit = gitCommit;
exports.gitPush = gitPush;
exports.gitPull = gitPull;
const child_process_1 = require("child_process");
/**
 * Executa um comando no terminal
 *
 * @param params Parâmetros do comando
 * @returns Promise com resultado da execução
 */
async function runTerminalCmd(params) {
    return new Promise((resolve, reject) => {
        const { command, is_background, explanation, projectPath } = params;
        console.log(`[TERMINAL] Executando: ${explanation}`);
        console.log(`[TERMINAL] Comando: ${command}`);
        console.log(`[TERMINAL] Diretório: ${projectPath || process.cwd()}`);
        // Determina se é Windows ou Unix
        const isWindows = process.platform === 'win32';
        const shell = isWindows ? 'cmd' : 'bash';
        const shellFlag = isWindows ? '/c' : '-c';
        const child = (0, child_process_1.spawn)(shell, [shellFlag, command], {
            stdio: is_background ? 'ignore' : 'pipe',
            cwd: projectPath || process.cwd(),
            env: { ...process.env }
        });
        let output = '';
        let error = '';
        if (!is_background) {
            if (child.stdout) {
                child.stdout.on('data', (data) => {
                    output += data.toString();
                });
            }
            if (child.stderr) {
                child.stderr.on('data', (data) => {
                    error += data.toString();
                });
            }
        }
        child.on('close', (code) => {
            const result = {
                exitCode: code || 0,
                output: output.trim(),
                error: error.trim()
            };
            if (code === 0) {
                console.log(`[TERMINAL] ✅ Sucesso: ${explanation}`);
                resolve(result);
            }
            else {
                console.error(`[TERMINAL] ❌ Erro (${code}): ${explanation}`);
                console.error(`[TERMINAL] Output: ${output}`);
                console.error(`[TERMINAL] Error: ${error}`);
                resolve(result); // Resolve mesmo com erro para que o código possa tratar
            }
        });
        child.on('error', (err) => {
            console.error(`[TERMINAL] Spawn error: ${err.message}`);
            reject(err);
        });
    });
}
/**
 * Executa comando Git no diretório especificado
 *
 * @param gitCommand Comando Git a executar
 * @param projectPath Caminho do projeto
 * @param explanation Explicação do comando
 * @returns Promise com resultado
 */
async function runGitCommand(gitCommand, projectPath, explanation) {
    return new Promise((resolve, reject) => {
        console.log(`[GIT] Executando: ${explanation}`);
        console.log(`[GIT] Comando: git ${gitCommand}`);
        console.log(`[GIT] Diretório: ${projectPath}`);
        // Determina se é Windows ou Unix
        const isWindows = process.platform === 'win32';
        const shell = isWindows ? 'cmd' : 'bash';
        const shellFlag = isWindows ? '/c' : '-c';
        const child = (0, child_process_1.spawn)('git', gitCommand.split(' '), {
            stdio: 'pipe',
            cwd: projectPath,
            env: { ...process.env }
        });
        let output = '';
        let error = '';
        if (child.stdout) {
            child.stdout.on('data', (data) => {
                output += data.toString();
            });
        }
        if (child.stderr) {
            child.stderr.on('data', (data) => {
                error += data.toString();
            });
        }
        child.on('close', (code) => {
            const result = {
                exitCode: code || 0,
                output: output.trim(),
                error: error.trim()
            };
            if (code === 0) {
                console.log(`[GIT] ✅ Sucesso: ${explanation}`);
                resolve(result);
            }
            else {
                console.error(`[GIT] ❌ Erro (${code}): ${explanation}`);
                console.error(`[GIT] Output: ${output}`);
                console.error(`[GIT] Error: ${error}`);
                resolve(result); // Resolve mesmo com erro para que o código possa tratar
            }
        });
        child.on('error', (err) => {
            console.error(`[GIT] Spawn error: ${err.message}`);
            reject(err);
        });
    });
}
/**
 * Verifica se um diretório é um repositório Git
 *
 * @param projectPath Caminho do projeto
 * @returns Promise<boolean>
 */
async function isGitRepository(projectPath) {
    const result = await runGitCommand('status', projectPath, 'Verificando se é repositório Git');
    return result.exitCode === 0;
}
/**
 * Obtém status do repositório Git
 *
 * @param projectPath Caminho do projeto
 * @returns Promise<TerminalResult>
 */
async function getGitStatus(projectPath) {
    return runGitCommand('status --porcelain', projectPath, 'Obtendo status do Git');
}
/**
 * Adiciona arquivos ao stage
 *
 * @param projectPath Caminho do projeto
 * @param files Arquivos específicos ou '.' para todos
 * @returns Promise<TerminalResult>
 */
async function gitAdd(projectPath, files = '.') {
    return runGitCommand(`add ${files}`, projectPath, `Adicionando arquivos: ${files}`);
}
/**
 * Faz commit dos arquivos staged
 *
 * @param projectPath Caminho do projeto
 * @param message Mensagem do commit
 * @returns Promise<TerminalResult>
 */
async function gitCommit(projectPath, message) {
    return runGitCommand(`commit -m "${message}"`, projectPath, `Commit: ${message}`);
}
/**
 * Faz push para o repositório remoto
 *
 * @param projectPath Caminho do projeto
 * @param branch Branch para fazer push
 * @param remote Remote (padrão: origin)
 * @returns Promise<TerminalResult>
 */
async function gitPush(projectPath, branch = 'main', remote = 'origin') {
    return runGitCommand(`push ${remote} ${branch}`, projectPath, `Push para ${remote}/${branch}`);
}
/**
 * Faz pull do repositório remoto
 *
 * @param projectPath Caminho do projeto
 * @param branch Branch para fazer pull
 * @param remote Remote (padrão: origin)
 * @returns Promise<TerminalResult>
 */
async function gitPull(projectPath, branch = 'main', remote = 'origin') {
    return runGitCommand(`pull ${remote} ${branch}`, projectPath, `Pull de ${remote}/${branch}`);
}
//# sourceMappingURL=terminal-controller.js.map