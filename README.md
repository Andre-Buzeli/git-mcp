# Git MCP Server v2.6.1

🚀 **Complete MCP Server for Gitea Self-Hosted** - 18 tools with 100+ actions including AI code review, enhanced validation and automated DevOps workflows

## 🎯 Overview

Git MCP Server v2.6.1 é um servidor MCP moderno em TypeScript, focado em Gitea self-hosted e com suporte completo a multi-provedor (GitHub + Gitea simultaneamente). Inclui arquitetura de providers unificada, documentação abrangente, boas práticas, validações aprimoradas, nova tool de code-review com IA e guia para uso individual (solo).

## ✨ Features

### 🛠️ **18 Tools**

1. **repositories** - Complete repository management with cloning, archiving, templates
2. **branches** - Branch operations with enhanced validation
3. **files** - File and directory management with search capabilities
4. **commits** - Commit operations with search and creation
5. **issues** - Issue management with advanced search
6. **pulls** - Pull request management with reviews
7. **releases** - Release management with enhanced validation
8. **tags** - Tag management with search
9. **users** - User operations with search
10. **webhooks** - Webhook management with testing
11. **code-review** - AI-powered code analysis and review suggestions ⭐ **NEW**
12. **git-sync** - Cross-provider repository synchronization with bidirectional sync
13. **version-control** - Versioning, backup and change tracking system with semantic versioning
14. **workflows** - CI/CD workflow management
15. **actions** - GitHub Actions management
16. **deployments** - Deployment tracking and rollbacks
17. **security** - Security scanning and compliance
18. **analytics** - Repository insights and analytics

> 🚀 **Multi-Provider Complete** (GitHub + Gitea simultaneamente)

### 🔧 **Technical Features**

- ✅ **TypeScript**: Full type safety and modern development
- ✅ **Zod Validation**: Input/output schema validation
- ✅ **Axios Client**: Robust HTTP client with interceptors
- ✅ **Error Handling**: Comprehensive error management
- ✅ **Debug Mode**: Detailed logging for development
- ✅ **Self-Hosted Focus**: Optimized for Gitea instances

## 📦 Installation

### NPX (Recommended)
```bash
npx @andrebuzeli/gitea-mcp-v2
```

### Global Installation
```bash
npm install -g @andrebuzeli/gitea-mcp-v2
```

## ⚙️ Configuration

### Demo Mode

Para testar o servidor sem configurar providers reais:

```bash
DEMO_MODE=true npx @andrebuzeli/gitea-mcp-v2
```

O modo demo permite:
- ✅ Testar todas as funcionalidades sem APIs reais
- ✅ Desenvolvimento e debugging
- ✅ Demonstrações e tutoriais
- ⚠️ Não executa operações reais nos repositórios

### Environment Variables

```bash
GITEA_URL=http://your-gitea-instance:3000
GITEA_TOKEN=your_personal_access_token
GITEA_USERNAME=your_username
DEBUG=false
TIMEOUT=30000
DEMO_MODE=false  # Set to 'true' for testing without real providers
```

### MCP Configuration

#### Single Provider (Gitea)

```json
{
  "mcpServers": {
    "gitea": {
      "command": "npx",
      "args": ["@andrebuzeli/gitea-mcp-v2"],
      "env": {
        "GITEA_URL": "http://your-gitea-instance:3000",
        "GITEA_TOKEN": "your_personal_access_token",
        "GITEA_USERNAME": "your_username"
      }
    }
  }
}
```

#### Single Provider (GitHub)

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["@andrebuzeli/gitea-mcp-v2"],
      "env": {
        "GITHUB_TOKEN": "your_github_token",
        "GITHUB_USERNAME": "your_github_username"
      }
    }
  }
}
```

#### Multi-Provider (GitHub + Gitea Simultaneamente)

```json
{
  "mcpServers": {
    "gitea-mcp": {
      "command": "npx",
      "args": ["@andrebuzeli/gitea-mcp-v2"],
      "env": {
        "PROVIDERS_JSON": "[{\"name\":\"gitea\",\"type\":\"gitea\",\"apiUrl\":\"http://your-gitea:3000/api/v1\",\"token\":\"your_gitea_token\"},{\"name\":\"github\",\"type\":\"github\",\"apiUrl\":\"https://api.github.com\",\"token\":\"your_github_token\"}]",
        "DEFAULT_PROVIDER": "gitea"
      }
    }
  }
}
```

#### Multi-Provider com Variáveis Separadas

```json
{
  "mcpServers": {
    "gitea-mcp": {
      "command": "npx",
      "args": ["@andrebuzeli/gitea-mcp-v2"],
      "env": {
        "GITEA_URL": "http://your-gitea:3000/api/v1",
        "GITEA_TOKEN": "your_gitea_token",
        "GITHUB_TOKEN": "your_github_token",
        "DEFAULT_PROVIDER": "gitea"
      }
    }
  }
}
```

## 🚀 Usage Examples

### Repository Management
```json
{
  "tool": "repositories",
  "arguments": {
    "action": "create",
    "name": "my-new-repo",
    "description": "A new repository",
    "private": false
  }
}
```

### Issue Creation
```json
{
  "tool": "issues",
  "arguments": {
    "action": "create",
    "owner": "username",
    "repo": "repository",
    "title": "Bug report",
    "body": "Description of the issue",
    "labels": ["bug", "priority-high"]
  }
}
```

### File Operations
```json
{
  "tool": "files",
  "arguments": {
    "action": "create",
    "owner": "username",
    "repo": "repository",
    "path": "src/main.js",
    "content": "console.log('Hello World');",
    "message": "Add main.js file"
  }
}
```

## 🔐 Authentication

### Personal Access Token

1. Go to your Gitea instance
2. Navigate to **Settings** → **Applications**
3. Generate a new **Personal Access Token**
4. Grant necessary permissions:
   - `repo` - Repository access
   - `user` - User information
   - `write:repo_hook` - Webhook management

### Permissions Required

- **Read**: Repository content, issues, pull requests
- **Write**: Create/update repositories, files, issues, PRs
- **Admin**: Webhook management, repository settings

## 🏗️ Architecture

### Project Structure
```
src/
├── index.ts          # Entry point
├── server.ts         # MCP Server setup
├── config.ts         # Configuration management
├── client.ts         # Gitea API client
└── tools/            # Tool implementations
    ├── repositories.ts
    ├── branches.ts
    ├── files.ts
    ├── commits.ts
    ├── issues.ts
    ├── pulls.ts
    ├── releases.ts
    ├── tags.ts
    ├── users.ts
    └── webhooks.ts
```

### Design Principles

- **Modular**: Each tool is self-contained
- **Type-Safe**: Full TypeScript coverage
- **Validated**: Zod schemas for all inputs/outputs
- **Consistent**: Uniform API across all tools
- **Documented**: Comprehensive JSDoc comments

## 🐛 Debugging

### Enable Debug Mode
```bash
DEBUG=true npx @andrebuzeli/gitea-mcp-v2
```

### Debug Output
- HTTP request/response logging
- Configuration validation
- Error stack traces
- Performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Setup

```bash
git clone https://github.com/andrebuzeli/gitea-mcp-v2.git
cd gitea-mcp-v2
npm install
npm run dev
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- **NPM Package**: [@andrebuzeli/gitea-mcp-v2](https://www.npmjs.com/package/@andrebuzeli/gitea-mcp-v2)
- **GitHub Repository**: [gitea-mcp-v2](https://github.com/andrebuzeli/gitea-mcp-v2)
- **Gitea Official**: [gitea.io](https://gitea.io)
- **MCP Protocol**: [modelcontextprotocol.io](https://modelcontextprotocol.io)

## 🆚 Comparison

### vs Official Gitea MCP (Go)

| Feature | Gitea MCP v2.0 (Node.js) | Official (Go) |
|---------|---------------------------|---------------|
| **Tools** | 10 multifunctional | 40+ single-purpose |
| **Actions** | 65+ total | 40+ total |
| **Language** | TypeScript/Node.js | Go |
| **Type Safety** | Full Zod validation | Go types |
| **Installation** | NPM/NPX | Binary download |
| **Configuration** | Environment variables | CLI arguments |
| **Debugging** | Rich logging | Basic logging |
| **Maintenance** | Community | Official |

### Advantages

- ✅ **Organized**: Logical tool grouping
- ✅ **Modern**: TypeScript ecosystem
- ✅ **Flexible**: Multiple actions per tool
- ✅ **Validated**: Input/output validation
- ✅ **Documented**: Comprehensive documentation

## 🎉 Changelog

### v2.1.2
- 📄 Added solo usage guide (docs/guia-gitea-solo.md)
- 📝 Updated docs and descriptions
- 🔖 Prepared release and tagging guidance for solo users

### v2.1.1
- 📚 **Enhanced tool documentation** - All 10 tools now have comprehensive JSDoc comments with parameters, actions, and direct instructions
- 🗑️ **Removed emojis** from console logs and code comments
- 📖 **Added detailed instructions and recommendations** for each tool and method
- 🔧 **Improved code structure** with better organization and clarity
- 🎯 **Enhanced developer experience** with clear usage examples and best practices

### v2.1.0
- 📚 Comprehensive code documentation
- 🧹 Removed emojis for professional use
- 📖 Added detailed usage instructions
- 🔧 Enhanced code comments and recommendations
- 📋 Improved development guidelines
- 🎯 Better error handling documentation
- 🚀 Enhanced developer experience

### v2.0.0
- 🎯 Complete rewrite from scratch
- 🛠️ 10 multifunctional tools
- 🔧 TypeScript implementation
- ✅ Zod validation
- 📚 Basic documentation
- 🐛 Debug mode support
- 🚀 NPM package distribution

---

**Made with ❤️ for the Gitea community**
