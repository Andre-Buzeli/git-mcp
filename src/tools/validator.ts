import { z } from 'zod';

/**
 * Validador comum para todas as tools
 * Fornece schemas e métodos de validação padronizados
 */

// Schemas comuns reutilizáveis
export const CommonSchemas = {
  // Identificadores
  username: z.string().min(1, 'Username is required').max(100, 'Username too long').optional(),
  repo: z.string().min(1, 'Repository name is required').max(100, 'Repository name too long'),
  provider: z.enum(['gitea', 'github', 'both']),
  
  // Paginação
  page: z.number().min(1, 'Page must be at least 1').max(1000, 'Page too high').optional(),
  limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').optional(),
  
  // Strings opcionais com limites
  shortString: z.string().max(255, 'String too long').optional(),
  mediumString: z.string().max(1000, 'String too long').optional(),
  longString: z.string().max(10000, 'String too long').optional(),
  
  // Identificadores específicos
  branch: z.string().min(1, 'Branch name is required').max(255, 'Branch name too long').optional(),
  tag: z.string().min(1, 'Tag name is required').max(255, 'Tag name too long').optional(),
  sha: z.string().regex(/^[a-f0-9]{7,40}$/i, 'Invalid SHA format').optional(),
  
  // Paths e URLs
  filePath: z.string().min(1, 'File path is required').max(1000, 'File path too long').optional(),
  url: z.string().url('Invalid URL format').optional(),
  
  // Estados
  issueState: z.enum(['open', 'closed', 'all']).optional(),
  prState: z.enum(['open', 'closed', 'merged', 'all']).optional(),
  
  // Arrays
  stringArray: z.array(z.string().max(255)).max(50, 'Too many items').optional(),
  
  // Booleanos
  boolean: z.boolean().optional(),
  
  // Números
  positiveNumber: z.number().positive('Must be positive').optional(),
  issueNumber: z.number().min(1, 'Issue number must be positive').max(999999, 'Issue number too high').optional(),
  
  // Enums específicos
  mergeMethod: z.enum(['merge', 'rebase', 'squash']).optional(),
  syncDirection: z.enum(['one-way', 'two-way']).optional(),
  syncStrategy: z.enum(['source-wins', 'timestamp', 'skip-conflicts']).optional()
};

// Schemas para repositórios
export const RepositorySchemas = {
  source: z.object({
    provider: z.enum(['gitea', 'github']),
    repo: CommonSchemas.repo
  }).optional(),
  
  target: z.object({
    provider: z.enum(['gitea', 'github']),
    repo: CommonSchemas.repo
  }).optional()
};

// Validações customizadas
export class ToolValidator {
  /**
   * Valida se pelo menos um dos campos obrigatórios está presente
   */
  static requireOneOf<T>(data: T, fields: (keyof T)[], errorMessage?: string): void {
    const hasRequired = fields.some(field => data[field] !== undefined && data[field] !== null && data[field] !== '');
    if (!hasRequired) {
      throw new Error(errorMessage || `At least one of the following fields is required: ${fields.join(', ')}`);
    }
  }
  
  /**
   * Valida se todos os campos de um grupo estão presentes ou ausentes
   */
  static requireAllOrNone<T>(data: T, fields: (keyof T)[], errorMessage?: string): void {
    const presentFields = fields.filter(field => data[field] !== undefined && data[field] !== null && data[field] !== '');
    if (presentFields.length > 0 && presentFields.length < fields.length) {
      throw new Error(errorMessage || `All or none of these fields must be provided: ${fields.join(', ')}`);
    }
  }
  
  /**
   * Valida formato de versão semântica
   */
  static validateSemVer(version: string): boolean {
    const semVerRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
    return semVerRegex.test(version);
  }
  
  /**
   * Valida nome de branch Git
   */
  static validateBranchName(branch: string): boolean {
    // Regras básicas do Git para nomes de branch
    const invalidPatterns = [
      /^\./, // Não pode começar com ponto
      /\.\./, // Não pode conter dois pontos consecutivos
      /[\x00-\x1f\x7f]/, // Não pode conter caracteres de controle
      /[\s~^:?*\[]/, // Não pode conter espaços ou caracteres especiais
      /\/$/, // Não pode terminar com /
      /\.lock$/, // Não pode terminar com .lock
      /@\{/ // Não pode conter @{
    ];
    
    return !invalidPatterns.some(pattern => pattern.test(branch)) && branch.length > 0 && branch.length <= 255;
  }
  
  /**
   * Valida nome de arquivo/path
   */
  static validateFilePath(path: string): boolean {
    // Não pode conter caracteres inválidos para sistemas de arquivo
    const invalidChars = /[<>:"|?*\x00-\x1f]/;
    return !invalidChars.test(path) && path.length > 0 && path.length <= 1000;
  }
  
  /**
   * Sanitiza entrada de texto removendo caracteres perigosos
   */
  static sanitizeText(text: string): string {
    return text
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove caracteres de controle
      .replace(/[<>"'&]/g, '') // Remove caracteres HTML perigosos
      .trim();
  }
  
  /**
   * Valida e sanitiza parâmetros de entrada de uma tool
   */
  static validateAndSanitize<T>(data: T, schema: z.ZodSchema<T>): T {
    try {
      // Primeiro valida com Zod
      const validated = schema.parse(data);
      
      // Depois sanitiza strings se necessário
      const sanitized = this.sanitizeObject(validated);
      
      return sanitized;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
        throw new Error(`Validation failed: ${issues}`);
      }
      throw error;
    }
  }
  
  /**
   * Sanitiza recursivamente um objeto
   */
  private static sanitizeObject<T>(obj: T): T {
    if (typeof obj === 'string') {
      return this.sanitizeText(obj) as T;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item)) as T;
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized = {} as T;
      for (const [key, value] of Object.entries(obj)) {
        (sanitized as any)[key] = this.sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  }
  
  /**
   * Cria um schema base para tools com parâmetros comuns
   */
  static createBaseToolSchema(additionalFields: Record<string, z.ZodTypeAny> = {}) {
    return z.object({
      repo: CommonSchemas.repo,
      provider: CommonSchemas.provider,
      page: CommonSchemas.page,
      limit: CommonSchemas.limit,
      ...additionalFields
    });
  }
}

// Schemas pré-definidos para tools comuns
export const ToolSchemas = {
  // Schema básico para operações de repositório
  repositoryOperation: ToolValidator.createBaseToolSchema(),
  
  // Schema para operações com arquivos
  fileOperation: ToolValidator.createBaseToolSchema({
    path: CommonSchemas.filePath,
    content: CommonSchemas.longString,
    message: CommonSchemas.mediumString,
    branch: CommonSchemas.branch,
    sha: CommonSchemas.sha
  }),
  
  // Schema para operações com issues
  issueOperation: ToolValidator.createBaseToolSchema({
    title: CommonSchemas.mediumString,
    body: CommonSchemas.longString,
    state: CommonSchemas.issueState,
    labels: CommonSchemas.stringArray,
    assignees: CommonSchemas.stringArray,
    issue_number: CommonSchemas.issueNumber
  }),
  
  // Schema para operações com branches
  branchOperation: ToolValidator.createBaseToolSchema({
    branch: CommonSchemas.branch,
    from_branch: CommonSchemas.branch,
    branch_name: CommonSchemas.branch
  })
};