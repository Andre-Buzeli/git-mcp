import { spawn } from 'child_process';

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
export async function runTerminalCmd(params: TerminalCommand & { projectPath?: string }): Promise<TerminalResult> {
  return new Promise((resolve, reject) => {
    const { command, is_background, explanation, projectPath } = params;

    console.log(`[TERMINAL] Executando: ${explanation}`);
    console.log(`[TERMINAL] Comando: ${command}`);
    console.log(`[TERMINAL] Diretório: ${projectPath || process.cwd()}`);

    // Determina se é Windows ou Unix
    const isWindows = process.platform === 'win32';
    const shell = isWindows ? 'cmd' : 'bash';
    const shellFlag = isWindows ? '/c' : '-c';

    const child = spawn(shell, [shellFlag, command], {
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
      const result: TerminalResult = {
        exitCode: code || 0,
        output: output.trim(),
        error: error.trim()
      };

      if (code === 0) {
        console.log(`[TERMINAL] ✅ Sucesso: ${explanation}`);
        resolve(result);
      } else {
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
export async function runGitCommand(
  gitCommand: string,
  projectPath: string,
  explanation: string
): Promise<TerminalResult> {
  return new Promise((resolve, reject) => {
    console.log(`[GIT] Executando: ${explanation}`);
    console.log(`[GIT] Comando: git ${gitCommand}`);
    console.log(`[GIT] Diretório: ${projectPath}`);

    // Determina se é Windows ou Unix
    const isWindows = process.platform === 'win32';
    const shell = isWindows ? 'cmd' : 'bash';
    const shellFlag = isWindows ? '/c' : '-c';

    const child = spawn('git', gitCommand.split(' '), {
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
      const result: TerminalResult = {
        exitCode: code || 0,
        output: output.trim(),
        error: error.trim()
      };

      if (code === 0) {
        console.log(`[GIT] ✅ Sucesso: ${explanation}`);
        resolve(result);
      } else {
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
export async function isGitRepository(projectPath: string): Promise<boolean> {
  const result = await runGitCommand('status', projectPath, 'Verificando se é repositório Git');

  return result.exitCode === 0;
}

/**
 * Obtém status do repositório Git
 *
 * @param projectPath Caminho do projeto
 * @returns Promise<TerminalResult>
 */
export async function getGitStatus(projectPath: string): Promise<TerminalResult> {
  return runGitCommand('status --porcelain', projectPath, 'Obtendo status do Git');
}

/**
 * Adiciona arquivos ao stage
 *
 * @param projectPath Caminho do projeto
 * @param files Arquivos específicos ou '.' para todos
 * @returns Promise<TerminalResult>
 */
export async function gitAdd(projectPath: string, files: string = '.'): Promise<TerminalResult> {
  return runGitCommand(`add ${files}`, projectPath, `Adicionando arquivos: ${files}`);
}

/**
 * Faz commit dos arquivos staged
 *
 * @param projectPath Caminho do projeto
 * @param message Mensagem do commit
 * @returns Promise<TerminalResult>
 */
export async function gitCommit(projectPath: string, message: string): Promise<TerminalResult> {
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
export async function gitPush(projectPath: string, branch: string = 'main', remote: string = 'origin'): Promise<TerminalResult> {
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
export async function gitPull(projectPath: string, branch: string = 'main', remote: string = 'origin'): Promise<TerminalResult> {
  return runGitCommand(`pull ${remote} ${branch}`, projectPath, `Pull de ${remote}/${branch}`);
}
