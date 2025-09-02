# MCP Git Server

Um servidor MCP (Model Context Protocol) para operações Git com suporte a self-hosted Gitea e GitHub, projetado para AI agents.

## 🚀 Características

- **Self-Hosted Gitea**: Suporte completo para instâncias Gitea self-hosted
- **GitHub Integration**: API completa do GitHub
- **Git Operations**: Operações Git locais via simple-git
- **NPX Ready**: Instalação e execução via npx
- **TypeScript**: Código totalmente tipado e moderno
- **MCP Compatible**: Compatível com Claude Desktop e outros clientes MCP

## 📦 Instalação

### Via NPX (Recomendado)
```bash
npx @andrebuzeli/git-mcp
```

### Via NPM Global
```bash
npm install -g @andrebuzeli/git-mcp
git-mcp
```

## ⚙️ Configuração

### Claude Desktop
Adicione ao seu `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "git": {
      "command": "npx",
      "args": ["@andrebuzeli/git-mcp"]
    }
  }
}
```

### Variáveis de Ambiente

#### Para Gitea Self-Hosted (NAS, Docker, etc.)
```bash
# Exemplo: NAS Ubuntu na porta 3000
export GIT_PROVIDER=gitea
export GITEA_TOKEN=seu_token_do_gitea
export GITEA_API_URL=http://nas-ubuntu:3000/api/v1
export GITEA_USERNAME=seu_usuario

# Exemplo: Gitea local com Docker
export GIT_PROVIDER=gitea
export GITEA_TOKEN=seu_token
export GITEA_API_URL=http://localhost:3000/api/v1
export GITEA_USERNAME=admin

# Exemplo: Gitea em servidor remoto
export GIT_PROVIDER=gitea
export GITEA_TOKEN=seu_token
export GITEA_API_URL=https://git.empresa.com/api/v1
export GITEA_USERNAME=usuario
```

#### Para GitHub
```bash
export GIT_PROVIDER=github
export GITHUB_TOKEN=ghp_seu_token
export GITHUB_USERNAME=seu_usuario
```

#### Configuração via Claude Desktop (Recomendado)
```json
{
  "mcpServers": {
    "git": {
      "command": "npx",
      "args": ["@andrebuzeli/git-mcp"],
      "env": {
        "GIT_PROVIDER": "gitea",
        "GITEA_TOKEN": "seu_token_aqui",
        "GITEA_API_URL": "http://nas-ubuntu:3000/api/v1",
        "GITEA_USERNAME": "seu_usuario"
      }
    }
  }
}
```

## 🔑 Como Obter o Token do Gitea

### Passo a Passo
1. **Acesse seu Gitea**: `http://nas-ubuntu:3000` (ou sua URL)
2. **Faça Login**: Entre com suas credenciais
3. **Configurações**: Clique no seu avatar → "Settings"
4. **Applications**: No menu lateral, clique em "Applications"
5. **Generate New Token**:
   - **Token Name**: "MCP Git Server"
   - **Select Scopes**: Marque as permissões:
     - ✅ `repo` (Full control of repositories)
     - ✅ `user:email` (Access user email addresses)
     - ✅ `read:org` (Read org and team membership)
     - ✅ `write:org` (Read and write org and team membership)
6. **Generate Token**: Clique no botão
7. **Copie o Token**: ⚠️ **IMPORTANTE**: Salve o token em local seguro, ele só aparece uma vez!

### Teste de Conectividade
```bash
# Testar se o token funciona
curl -H "Authorization: token SEU_TOKEN" \
     http://nas-ubuntu:3000/api/v1/user
```

## 🚨 Troubleshooting

### Problemas Comuns
- **"Gitea token não configurado"**: Verificar se `GITEA_TOKEN` está definido
- **"Falha na autenticação"**: Token inválido ou sem permissões
- **"Erro de conexão"**: Verificar URL e porta (deve terminar com `/api/v1`)
- **"nas-ubuntu não resolve"**: Usar IP direto ou adicionar ao arquivo hosts

### Debug
```bash
# Habilitar logs detalhados
export LOG_LEVEL=debug
npx @andrebuzeli/git-mcp
```

## 📋 Tools Disponíveis

### 🔧 git_operations
Operações básicas do Git: init, clone, add, commit, push, pull, branch, merge, rebase, reset, stash, tag, log, status, diff, blame

### 🏗️ repository_management
Gerenciamento de repositórios: create, delete, update, get, list, fork, transfer, archive, change_visibility, manage_topics

### 👥 collaboration_management
Gerenciamento de colaboração: add_collaborator, remove_collaborator, list_collaborators, update_permissions, create_team, delete_team

### 🐛 issue_management
Gerenciamento de issues: create, update, close, reopen, delete, list, get, assign, label, comment

### 🔀 pull_request_management
Gerenciamento de pull requests: create, update, merge, close, reopen, delete, list, get, review, approve

### 📁 content_management
Gerenciamento de conteúdo: create_file, update_file, delete_file, get_file, list_files, search, blame, history

### 🔄 workflow_cicd
Workflows e CI/CD: list_workflows, run_workflow, cancel_workflow, get_logs, manage_actions, deployments

### 🚀 release_management
Gerenciamento de releases: create, update, delete, list, get, upload_asset, delete_asset, draft, prerelease

### 🔒 security_compliance
Segurança e compliance: manage_secrets, list_vulnerabilities, dismiss_vulnerability, get_dependency_graph

### 📊 analytics_monitoring
Analytics e monitoring: get_traffic, get_clones, get_views, get_contributors, get_commits, get_activity

### 🔧 advanced_git_features
Features avançadas do Git: manage_submodules, manage_lfs, manage_hooks, get_reflog, bisect, cherry_pick

### 🌐 webhook_management
Gerenciamento de webhooks: create, update, delete, list, get, test, ping, get_deliveries

### 🔍 search_discovery
Busca e descoberta: search_repositories, search_code, search_issues, search_users, search_topics

### ⚙️ configuration_settings
Configuração e configurações: get_config, update_config, validate_config, switch_provider, test_auth

### 📝 documentation_wiki
Documentação e wiki: create_page, update_page, delete_page, list_pages, get_page

### 🔄 migration_sync
Migração e sincronização: migrate_repository, sync_repositories, backup_repository, restore_repository

### 📈 performance_optimization
Performance e otimização: clear_cache, test_performance, suggest_optimization, reset_rate_limit

### 🧪 testing_validation
Testes e validação: test_connection, test_permissions, validate_configuration, health_check

## 🛠️ Instalação

### Via npm

```bash
npm install @mcp/git-server
```

### Via npx

```bash
npx @mcp/git-server
```

### Desenvolvimento

```bash
git clone <repository>
cd mcp-git-server
npm install
npm run build
npm start
```

## ⚙️ Configuração

### Variáveis de Ambiente

```bash
# Provedor Git (gitea ou github)
GIT_PROVIDER=github

# Configurações do GitHub
GITHUB_TOKEN=ghp_...
GITHUB_API_URL=https://api.github.com
GITHUB_USERNAME=username

# Configurações do Gitea
GITEA_TOKEN=gitea_...
GITEA_API_URL=http://localhost:3000/api/v1
GITEA_USERNAME=username

# Configurações gerais
LOG_LEVEL=info
CACHE_ENABLED=true
RATE_LIMIT_ENABLED=true
TIMEOUT=30000
RETRY_ATTEMPTS=3
RETRY_DELAY=1000
```

### mcp.json

```json
{
  "mcpServers": {
    "git-mcp": {
      "command": "npx",
      "args": ["@mcp/git-server"],
      "env": {
        "GIT_PROVIDER": "github",
        "GITHUB_TOKEN": "ghp_...",
        "GITHUB_USERNAME": "username"
      }
    }
  }
}
```

## 📖 Uso

### Exemplo de Uso com AI Agent

```typescript
// Inicializar repositório
await callTool('git_operations', {
  action: 'init',
  repository: './meu-projeto'
});

// Clonar repositório
await callTool('git_operations', {
  action: 'clone',
  remote_url: 'https://github.com/user/repo.git',
  repository: './repo-clonado'
});

// Adicionar arquivos
await callTool('git_operations', {
  action: 'add',
  repository: './meu-projeto',
  files: ['src/**/*.ts']
});

// Fazer commit
await callTool('git_operations', {
  action: 'commit',
  repository: './meu-projeto',
  message: 'feat: implementar funcionalidade X'
});

// Push para remoto
await callTool('git_operations', {
  action: 'push',
  repository: './meu-projeto',
  remote: 'origin',
  branch: 'main'
});
```

### Exemplo de Uso Direto

```typescript
import { gitOperationsTool } from '@mcp/git-server';

// Executar operação Git
const result = await gitOperationsTool.handler({
  action: 'init',
  repository: './meu-projeto'
});

console.log(result);
```

## 🔧 Desenvolvimento

### Scripts Disponíveis

```bash
# Build do projeto
npm run build

# Desenvolvimento
npm run dev

# Testes
npm test
npm run test:watch
npm run test:coverage

# Linting
npm run lint
npm run lint:fix

# Formatação
npm run format
```

### Estrutura do Projeto

```
src/
├── core/                    # Core do MCP server
├── providers/               # Provedores (Gitea/GitHub)
├── tools/                   # Implementação das tools
├── utils/                   # Utilitários
├── server.ts               # Servidor MCP principal
└── index.ts                # Ponto de entrada
```

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Testes em modo watch
npm run test:watch

# Cobertura de código
npm run test:coverage

# Testes específicos
npm test -- --grep "git_operations"
```

## 📦 Build e Deploy

```bash
# Build de produção
npm run build

# Verificar build
npm run start

# Preparar para publicação
npm run prepare
```

## 🚀 Publicação

```bash
# Login no npm
npm login

# Publicar pacote
npm publish --access public
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

- **Issues**: [GitHub Issues](https://github.com/mcp/git-server/issues)
- **Documentação**: [Wiki](https://github.com/mcp/git-server/wiki)
- **Discussões**: [GitHub Discussions](https://github.com/mcp/git-server/discussions)

## 🔗 Links Úteis

- [MCP Specification](https://modelcontextprotocol.io/)
- [GitHub API](https://docs.github.com/en/rest)
- [Gitea API](https://docs.gitea.com/development/api-usage)
- [Simple Git](https://github.com/steveukx/git-js)

## 📊 Status do Projeto

- **Versão**: 1.0.0
- **Status**: Em desenvolvimento ativo
- **Suporte**: Node.js 18+
- **Plataformas**: Windows, macOS, Linux

---

**Desenvolvido com ❤️ pela comunidade MCP**
