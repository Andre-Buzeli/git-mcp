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
const git_operations_js_1 = require("./git-operations.js");
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
 * Executa comando Git usando GitOperations - 100% auto-suficiente
 *
 * @param gitCommand Comando Git a executar
 * @param projectPath Caminho do projeto
 * @param explanation Explicação do comando
 * @returns Promise com resultado
 */
async function runGitCommand(gitCommand, projectPath, explanation) {
    console.log(`[GIT] Executando: ${explanation}`);
    console.log(`[GIT] Comando: git ${gitCommand}`);
    console.log(`[GIT] Diretório: ${projectPath}`);
    const gitOps = new git_operations_js_1.GitOperations(projectPath);
    try {
        // Parse do comando Git
        const parts = gitCommand.split(' ');
        const action = parts[0];
        const args = parts.slice(1);
        let result;
        switch (action) {
            case 'init':
                result = await gitOps.initRepository();
                break;
            case 'clone':
                result = await gitOps.cloneRepository(args[0], args[1]);
                break;
            case 'add':
                result = await gitOps.addFiles(args);
                break;
            case 'commit':
                const message = args.find(arg => arg.startsWith('-m'))?.substring(2) || 'Commit via MCP';
                result = await gitOps.commit(message);
                break;
            case 'push':
                result = await gitOps.push(args[0], args[1]);
                break;
            case 'pull':
                result = await gitOps.pull(args[0], args[1]);
                break;
            case 'fetch':
                result = await gitOps.fetch(args[0]);
                break;
            case 'branch':
                if (args.includes('-a')) {
                    result = await gitOps.listBranches({ all: true });
                }
                else if (args.includes('-d') || args.includes('-D')) {
                    const branchName = args[args.length - 1];
                    result = await gitOps.deleteBranch(branchName, { force: args.includes('-D') });
                }
                else if (args.length > 0) {
                    result = await gitOps.createBranch(args[0]);
                }
                else {
                    result = await gitOps.listBranches();
                }
                break;
            case 'checkout':
                result = await gitOps.checkout(args[0]);
                break;
            case 'merge':
                result = await gitOps.merge(args[0]);
                break;
            case 'rebase':
                result = await gitOps.rebase(args[0]);
                break;
            case 'reset':
                result = await gitOps.reset(args[0]);
                break;
            case 'revert':
                result = await gitOps.revert(args[0]);
                break;
            case 'cherry-pick':
                result = await gitOps.cherryPick(args[0]);
                break;
            case 'stash':
                if (args.length === 0) {
                    result = await gitOps.stash('push');
                }
                else {
                    result = await gitOps.stash(args[0]);
                }
                break;
            case 'tag':
                if (args.includes('-l')) {
                    result = await gitOps.tag(undefined, { list: true });
                }
                else if (args.includes('-d')) {
                    const tagName = args[args.length - 1];
                    result = await gitOps.tag(tagName, { delete: true });
                }
                else if (args.length > 0) {
                    result = await gitOps.tag(args[0]);
                }
                else {
                    result = await gitOps.tag(undefined, { list: true });
                }
                break;
            case 'log':
                result = await gitOps.log();
                break;
            case 'status':
                result = await gitOps.status();
                break;
            case 'diff':
                result = await gitOps.diff();
                break;
            case 'remote':
                if (args[0] === 'add') {
                    result = await gitOps.remote('add', args[1], args[2]);
                }
                else if (args[0] === 'remove') {
                    result = await gitOps.remote('remove', args[1]);
                }
                else if (args[0] === 'show') {
                    result = await gitOps.remote('show', args[1]);
                }
                else {
                    result = await gitOps.remote('show');
                }
                break;
            case 'config':
                if (args.includes('--global')) {
                    result = await gitOps.config(args[1], args[2], { global: true });
                }
                else if (args.includes('--local')) {
                    result = await gitOps.config(args[1], args[2], { local: true });
                }
                else if (args.includes('--list')) {
                    result = await gitOps.config(undefined, undefined, { list: true });
                }
                else if (args.length > 0) {
                    result = await gitOps.config(args[0], args[1]);
                }
                else {
                    result = await gitOps.config(undefined, undefined, { list: true });
                }
                break;
            case 'submodule':
                result = await gitOps.submodule(args[0]);
                break;
            case 'worktree':
                result = await gitOps.worktree(args[0]);
                break;
            case 'archive':
                result = await gitOps.archive(args[0], args[1], args[2]);
                break;
            case 'bundle':
                result = await gitOps.bundle(args[0]);
                break;
            default:
                // Fallback para comando direto
                result = await gitOps.runCommand('git', [gitCommand]);
        }
        return {
            exitCode: result.success ? 0 : 1,
            output: result.output,
            error: result.error || ''
        };
    }
    catch (error) {
        return {
            exitCode: 1,
            output: '',
            error: error instanceof Error ? error.message : String(error)
        };
    }
}
/**
 * Verifica se um diretório é um repositório Git - 100% auto-suficiente
 *
 * @param projectPath Caminho do projeto
 * @returns Promise<boolean>
 */
async function isGitRepository(projectPath) {
    const gitOps = new git_operations_js_1.GitOperations(projectPath);
    return await gitOps.isGitRepository();
}
/**
 * Obtém status do repositório Git - 100% auto-suficiente
 *
 * @param projectPath Caminho do projeto
 * @returns Promise<TerminalResult>
 */
async function getGitStatus(projectPath) {
    const gitOps = new git_operations_js_1.GitOperations(projectPath);
    const result = await gitOps.status();
    return {
        exitCode: result.success ? 0 : 1,
        output: result.output,
        error: result.error || ''
    };
}
/**
 * Adiciona arquivos ao stage - 100% auto-suficiente
 *
 * @param projectPath Caminho do projeto
 * @param files Arquivos específicos ou '.' para todos
 * @returns Promise<TerminalResult>
 */
async function gitAdd(projectPath, files = '.') {
    const gitOps = new git_operations_js_1.GitOperations(projectPath);
    const result = await gitOps.addFiles(files === '.' ? ['.'] : [files]);
    return {
        exitCode: result.success ? 0 : 1,
        output: result.output,
        error: result.error || ''
    };
}
/**
 * Faz commit dos arquivos staged - 100% auto-suficiente
 *
 * @param projectPath Caminho do projeto
 * @param message Mensagem do commit
 * @returns Promise<TerminalResult>
 */
async function gitCommit(projectPath, message) {
    const gitOps = new git_operations_js_1.GitOperations(projectPath);
    const result = await gitOps.commit(message);
    return {
        exitCode: result.success ? 0 : 1,
        output: result.output,
        error: result.error || ''
    };
}
/**
 * Faz push para o repositório remoto - 100% auto-suficiente
 *
 * @param projectPath Caminho do projeto
 * @param branch Branch para fazer push
 * @param remote Remote (padrão: origin)
 * @returns Promise<TerminalResult>
 */
async function gitPush(projectPath, branch = 'main', remote = 'origin') {
    const gitOps = new git_operations_js_1.GitOperations(projectPath);
    const result = await gitOps.push(remote, branch);
    return {
        exitCode: result.success ? 0 : 1,
        output: result.output,
        error: result.error || ''
    };
}
/**
 * Faz pull do repositório remoto - 100% auto-suficiente
 *
 * @param projectPath Caminho do projeto
 * @param branch Branch para fazer pull
 * @param remote Remote (padrão: origin)
 * @returns Promise<TerminalResult>
 */
async function gitPull(projectPath, branch = 'main', remote = 'origin') {
    const gitOps = new git_operations_js_1.GitOperations(projectPath);
    const result = await gitOps.pull(remote, branch);
    return {
        exitCode: result.success ? 0 : 1,
        output: result.output,
        error: result.error || ''
    };
}
//# sourceMappingURL=terminal-controller.js.map