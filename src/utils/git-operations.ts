import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

export interface GitResult {
  success: boolean;
  output: string;
  error?: string;
  exitCode: number;
}

export interface FileOperationResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

/**
 * Classe para operações Git locais - 100% auto-suficiente
 * Implementa todas as operações Git sem depender de outras tools
 */
export class GitOperations {
  private projectPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  /**
   * Executa comando Git local
   */
  private async runGitCommand(command: string, args: string[] = []): Promise<GitResult> {
    return new Promise((resolve) => {
      const allArgs = [command, ...args];
      const fullCommand = `git ${allArgs.map(arg => `"${arg}"`).join(' ')}`;
      
      exec(fullCommand, { 
        cwd: this.projectPath,
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      }, (error, stdout, stderr) => {
        resolve({
          success: !error,
          output: stdout.trim(),
          error: stderr.trim(),
          exitCode: error ? error.code || 1 : 0
        });
      });
    });
  }

  /**
   * Executa comando de sistema
   */
  private async runSystemCommand(command: string, args: string[] = []): Promise<GitResult> {
    return new Promise((resolve) => {
      const fullCommand = `${command} ${args.join(' ')}`;
      
      exec(fullCommand, { 
        cwd: this.projectPath,
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      }, (error, stdout, stderr) => {
        resolve({
          success: !error,
          output: stdout.trim(),
          error: stderr.trim(),
          exitCode: error ? error.code || 1 : 0
        });
      });
    });
  }

  /**
   * Verifica se é um repositório Git
   */
  async isGitRepository(): Promise<boolean> {
    const result = await this.runGitCommand('rev-parse', ['--git-dir']);
    return result.success;
  }

  /**
   * Inicializa repositório Git
   */
  async initRepository(bare: boolean = false): Promise<GitResult> {
    const args = bare ? ['--bare'] : [];
    return await this.runGitCommand('init', args);
  }

  /**
   * Clona repositório
   */
  async cloneRepository(url: string, directory?: string, options: any = {}): Promise<GitResult> {
    const args = [];
    
    if (options.bare) args.push('--bare');
    if (options.depth) args.push('--depth', options.depth.toString());
    if (options.branch) args.push('--branch', options.branch);
    if (options.singleBranch) args.push('--single-branch');
    if (options.recursive) args.push('--recursive');
    
    args.push(url);
    if (directory) args.push(directory);

    return await this.runGitCommand('clone', args);
  }

  /**
   * Adiciona arquivos ao staging
   */
  async addFiles(files: string[] = ['.']): Promise<GitResult> {
    return await this.runGitCommand('add', files);
  }

  /**
   * Remove arquivos do staging
   */
  async resetFiles(files: string[] = []): Promise<GitResult> {
    return await this.runGitCommand('reset', files);
  }

  /**
   * Faz commit
   */
  async commit(message: string, options: any = {}): Promise<GitResult> {
    const args = [];
    
    if (options.amend) args.push('--amend');
    if (options.noVerify) args.push('--no-verify');
    if (options.allowEmpty) args.push('--allow-empty');
    
    args.push('-m', message);

    return await this.runGitCommand('commit', args);
  }

  /**
   * Push para remote
   */
  async push(remote: string = 'origin', branch?: string, options: any = {}): Promise<GitResult> {
    const args = [];
    
    if (options.force) args.push('--force');
    if (options.setUpstream) args.push('--set-upstream');
    if (options.tags) args.push('--tags');
    if (options.all) args.push('--all');
    
    args.push(remote);
    if (branch) args.push(branch);

    return await this.runGitCommand('push', args);
  }

  /**
   * Pull do remote
   */
  async pull(remote: string = 'origin', branch?: string, options: any = {}): Promise<GitResult> {
    const args = [];
    
    if (options.rebase) args.push('--rebase');
    if (options.ffOnly) args.push('--ff-only');
    if (options.noEdit) args.push('--no-edit');
    
    args.push(remote);
    if (branch) args.push(branch);

    return await this.runGitCommand('pull', args);
  }

  /**
   * Fetch do remote
   */
  async fetch(remote?: string, options: any = {}): Promise<GitResult> {
    const args = [];
    
    if (options.all) args.push('--all');
    if (options.tags) args.push('--tags');
    if (options.prune) args.push('--prune');
    if (options.depth) args.push('--depth', options.depth.toString());
    
    if (remote) args.push(remote);

    return await this.runGitCommand('fetch', args);
  }

  /**
   * Lista branches
   */
  async listBranches(options: any = {}): Promise<GitResult> {
    const args = [];
    
    if (options.all) args.push('-a');
    if (options.remote) args.push('-r');
    if (options.merged) args.push('--merged');
    if (options.noMerged) args.push('--no-merged');

    return await this.runGitCommand('branch', args);
  }

  /**
   * Cria branch
   */
  async createBranch(name: string, startPoint?: string, options: any = {}): Promise<GitResult> {
    const args = [];
    
    if (options.force) args.push('-f');
    if (options.track) args.push('--track');
    if (options.noTrack) args.push('--no-track');
    
    args.push(name);
    if (startPoint) args.push(startPoint);

    return await this.runGitCommand('branch', args);
  }

  /**
   * Deleta branch
   */
  async deleteBranch(name: string, options: any = {}): Promise<GitResult> {
    const args = [];
    
    if (options.force) args.push('-D');
    else args.push('-d');
    
    args.push(name);

    return await this.runGitCommand('branch', args);
  }

  /**
   * Checkout branch/commit
   */
  async checkout(target: string, options: any = {}): Promise<GitResult> {
    const args = [];
    
    if (options.force) args.push('-f');
    if (options.create) args.push('-b');
    if (options.track) args.push('--track');
    
    args.push(target);

    return await this.runGitCommand('checkout', args);
  }

  /**
   * Merge branches
   */
  async merge(branch: string, options: any = {}): Promise<GitResult> {
    const args = [];
    
    if (options.noCommit) args.push('--no-commit');
    if (options.squash) args.push('--squash');
    if (options.noEdit) args.push('--no-edit');
    if (options.strategy) args.push('-s', options.strategy);
    
    args.push(branch);

    return await this.runGitCommand('merge', args);
  }

  /**
   * Rebase
   */
  async rebase(target: string, options: any = {}): Promise<GitResult> {
    const args = [];
    
    if (options.interactive) args.push('-i');
    if (options.onto) args.push('--onto', options.onto);
    if (options.continue) args.push('--continue');
    if (options.abort) args.push('--abort');
    if (options.skip) args.push('--skip');
    
    args.push(target);

    return await this.runGitCommand('rebase', args);
  }

  /**
   * Reset
   */
  async reset(target: string, options: any = {}): Promise<GitResult> {
    const args = [];

    // Adicionar flags de modo
    if (options.mode === 'soft' || options.soft) args.push('--soft');
    else if (options.mode === 'hard' || options.hard) args.push('--hard');
    else args.push('--mixed'); // padrão

    args.push(target);

    return await this.runGitCommand('reset', args);
  }

  /**
   * Revert commit
   */
  async revert(commit: string, options: any = {}): Promise<GitResult> {
    const args = [];
    
    if (options.noCommit) args.push('--no-commit');
    if (options.edit) args.push('--edit');
    if (options.mainline) args.push('-m', options.mainline.toString());
    
    args.push(commit);

    return await this.runGitCommand('revert', args);
  }

  /**
   * Cherry-pick
   */
  async cherryPick(commit: string, options: any = {}): Promise<GitResult> {
    const args = [];
    
    if (options.noCommit) args.push('--no-commit');
    if (options.edit) args.push('--edit');
    if (options.mainline) args.push('-m', options.mainline.toString());
    if (options.continue) args.push('--continue');
    if (options.abort) args.push('--abort');
    if (options.skip) args.push('--skip');
    
    args.push(commit);

    return await this.runGitCommand('cherry-pick', args);
  }

  /**
   * Stash
   */
  async stash(action: string = 'push', options: any = {}): Promise<GitResult> {
    const args = [];
    
    if (action === 'push') {
      if (options.message) args.push('-m', options.message);
      if (options.includeUntracked) args.push('-u');
      if (options.keepIndex) args.push('--keep-index');
    } else if (action === 'pop') {
      args.push('pop');
      if (options.index) args.push('--index');
    } else if (action === 'apply') {
      args.push('apply');
      if (options.index) args.push('--index');
    } else if (action === 'list') {
      args.push('list');
    } else if (action === 'show') {
      args.push('show');
      if (options.patch) args.push('-p');
    } else if (action === 'drop') {
      args.push('drop');
    } else if (action === 'clear') {
      args.push('clear');
    }

    return await this.runGitCommand('stash', args);
  }

  /**
   * Tag operations
   */
  async tag(name?: string, options: any = {}): Promise<GitResult> {
    const args = [];
    
    if (options.list) args.push('-l');
    if (options.delete) args.push('-d');
    if (options.force) args.push('-f');
    if (options.annotate) args.push('-a');
    if (options.message) args.push('-m', options.message);
    if (options.sign) args.push('-s');
    
    if (name) args.push(name);

    return await this.runGitCommand('tag', args);
  }

  /**
   * Log
   */
  async log(options: any = {}): Promise<GitResult> {
    const args = [];
    
    if (options.oneline) args.push('--oneline');
    if (options.graph) args.push('--graph');
    if (options.decorate) args.push('--decorate');
    if (options.all) args.push('--all');
    if (options.branches) args.push('--branches');
    if (options.tags) args.push('--tags');
    if (options.remotes) args.push('--remotes');
    if (options.maxCount) args.push('-n', options.maxCount.toString());
    if (options.since) args.push('--since', options.since);
    if (options.until) args.push('--until', options.until);
    if (options.author) args.push('--author', options.author);
    if (options.grep) args.push('--grep', options.grep);
    if (options.path) args.push('--', options.path);

    return await this.runGitCommand('log', args);
  }

  /**
   * Status
   */
  async status(options: any = {}): Promise<GitResult> {
    const args = [];
    
    if (options.short) args.push('--short');
    if (options.branch) args.push('--branch');
    if (options.porcelain) args.push('--porcelain');
    if (options.ignored) args.push('--ignored');
    if (options.untracked) args.push('--untracked-files', options.untracked);

    return await this.runGitCommand('status', args);
  }

  /**
   * Diff
   */
  async diff(options: any = {}): Promise<GitResult> {
    const args = [];
    
    if (options.cached) args.push('--cached');
    if (options.staged) args.push('--staged');
    if (options.nameOnly) args.push('--name-only');
    if (options.nameStatus) args.push('--name-status');
    if (options.stat) args.push('--stat');
    if (options.patch) args.push('-p');
    if (options.unified) args.push('-U', options.unified.toString());
    
    if (options.commit1) args.push(options.commit1);
    if (options.commit2) args.push(options.commit2);
    if (options.path) args.push('--', options.path);

    return await this.runGitCommand('diff', args);
  }

  /**
   * Remote operations
   */
  async remote(action: string, name?: string, url?: string): Promise<GitResult> {
    const args = [action];
    
    if (name) args.push(name);
    if (url) args.push(url);

    return await this.runGitCommand('remote', args);
  }

  /**
   * Config operations
   */
  async config(key?: string, value?: string, options: any = {}): Promise<GitResult> {
    const args = [];
    
    if (options.global) args.push('--global');
    if (options.local) args.push('--local');
    if (options.system) args.push('--system');
    if (options.unset) args.push('--unset');
    if (options.list) args.push('--list');
    if (options.get) args.push('--get');
    if (options.getAll) args.push('--get-all');
    
    if (key) args.push(key);
    if (value) args.push(value);

    return await this.runGitCommand('config', args);
  }

  /**
   * Submodule operations
   */
  async submodule(action: string, options: any = {}): Promise<GitResult> {
    const args = [action];
    
    if (options.init) args.push('--init');
    if (options.recursive) args.push('--recursive');
    if (options.remote) args.push('--remote');
    if (options.merge) args.push('--merge');
    if (options.rebase) args.push('--rebase');
    if (options.force) args.push('--force');
    
    if (options.path) args.push(options.path);
    if (options.url) args.push(options.url);

    return await this.runGitCommand('submodule', args);
  }

  /**
   * Worktree operations
   */
  async worktree(action: string, options: any = {}): Promise<GitResult> {
    const args = [action];
    
    if (options.add) args.push('add');
    if (options.remove) args.push('remove');
    if (options.list) args.push('list');
    if (options.prune) args.push('prune');
    if (options.move) args.push('move');
    if (options.repair) args.push('repair');
    
    if (options.path) args.push(options.path);
    if (options.branch) args.push(options.branch);

    return await this.runGitCommand('worktree', args);
  }

  /**
   * Archive operations
   */
  async archive(format: string, treeish: string, output?: string, options: any = {}): Promise<GitResult> {
    const args = [];
    
    if (options.remote) args.push('--remote');
    if (options.exec) args.push('--exec', options.exec);
    if (options.output) args.push('--output', options.output);
    if (options.prefix) args.push('--prefix', options.prefix);
    if (options.worktreeAttributes) args.push('--worktree-attributes');
    
    args.push(format, treeish);
    if (output) args.push(output);

    return await this.runGitCommand('archive', args);
  }

  /**
   * Bundle operations
   */
  async bundle(action: string, options: any = {}): Promise<GitResult> {
    const args = [];
    
    if (action === 'create') {
      args.push('bundle', 'create');
      if (options.file) args.push(options.file);
      if (options.revlist) args.push(options.revlist);
    } else if (action === 'verify') {
      args.push('bundle', 'verify');
      if (options.file) args.push(options.file);
    } else if (action === 'list-heads') {
      args.push('bundle', 'list-heads');
      if (options.file) args.push(options.file);
    } else if (action === 'unbundle') {
      args.push('bundle', 'unbundle');
      if (options.file) args.push(options.file);
    } else {
      args.push('bundle', action);
      if (options.file) args.push(options.file);
      if (options.revlist) args.push(options.revlist);
    }

    return await this.runGitCommand(args[0], args.slice(1));
  }

  /**
   * File operations
   */
  async readFile(filePath: string): Promise<FileOperationResult> {
    try {
      const fullPath = path.join(this.projectPath, filePath);
      const content = fs.readFileSync(fullPath, 'utf-8');
      return {
        success: true,
        message: 'Arquivo lido com sucesso',
        data: { content, path: filePath }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao ler arquivo',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  async writeFile(filePath: string, content: string): Promise<FileOperationResult> {
    try {
      const fullPath = path.join(this.projectPath, filePath);
      const dir = path.dirname(fullPath);
      
      // Cria diretório se não existir
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(fullPath, content, 'utf-8');
      return {
        success: true,
        message: 'Arquivo escrito com sucesso',
        data: { path: filePath, size: content.length }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao escrever arquivo',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  async deleteFile(filePath: string): Promise<FileOperationResult> {
    try {
      const fullPath = path.join(this.projectPath, filePath);
      fs.unlinkSync(fullPath);
      return {
        success: true,
        message: 'Arquivo deletado com sucesso',
        data: { path: filePath }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao deletar arquivo',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  async listFiles(directory: string = '.'): Promise<FileOperationResult> {
    try {
      const fullPath = path.join(this.projectPath, directory);
      const files = fs.readdirSync(fullPath, { withFileTypes: true });
      
      const fileList = files.map(file => ({
        name: file.name,
        type: file.isDirectory() ? 'directory' : 'file',
        path: path.join(directory, file.name)
      }));

      return {
        success: true,
        message: 'Arquivos listados com sucesso',
        data: { files: fileList, directory }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao listar arquivos',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  async createDirectory(dirPath: string): Promise<FileOperationResult> {
    try {
      const fullPath = path.join(this.projectPath, dirPath);
      fs.mkdirSync(fullPath, { recursive: true });
      return {
        success: true,
        message: 'Diretório criado com sucesso',
        data: { path: dirPath }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao criar diretório',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  async deleteDirectory(dirPath: string): Promise<FileOperationResult> {
    try {
      const fullPath = path.join(this.projectPath, dirPath);
      fs.rmSync(fullPath, { recursive: true, force: true });
      return {
        success: true,
        message: 'Diretório deletado com sucesso',
        data: { path: dirPath }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao deletar diretório',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Terminal operations
   */
  async runCommand(command: string, args: string[] = []): Promise<GitResult> {
    return await this.runSystemCommand(command, args);
  }

  /**
   * Network operations
   */
  async testConnection(url: string): Promise<GitResult> {
    // Testa conectividade básica
    const result = await this.runSystemCommand('ping', ['-c', '1', url]);
    return result;
  }

  /**
   * Utility operations
   */
  async getCurrentDirectory(): Promise<string> {
    return this.projectPath;
  }

  async changeDirectory(newPath: string): Promise<void> {
    this.projectPath = newPath;
  }

  /**
   * Obtém a branch atual
   */
  async getCurrentBranch(): Promise<GitResult> {
    return await this.runGitCommand('branch', ['--show-current']);
  }

  async getGitInfo(): Promise<any> {
    const [status, log, branches, remotes] = await Promise.all([
      this.status(),
      this.log({ maxCount: 1, oneline: true }),
      this.listBranches(),
      this.remote('show')
    ]);

    return {
      status: status.output,
      lastCommit: log.output,
      branches: branches.output,
      remotes: remotes.output,
      isGitRepo: await this.isGitRepository()
    };
  }
}
