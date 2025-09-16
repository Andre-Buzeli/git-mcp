# GIT-MCP
## O que é: Servidor MCP com 31 tools para gerenciar Git, GitHub e Gitea - 100% auto-suficiente
## Use quando: Quiser gerenciar repositórios Git, fazer push/pull, criar branches, gerenciar issues, releases, workflows via MCP

# GIT CORE TOOLS (15)
## git-repositories: Criar, listar, buscar, atualizar ou deletar repositórios no GitHub/Gitea
## git-commits: Listar commits, criar novos commits, comparar commits, buscar commits por autor ou mensagem
## git-branches: Criar branches, listar branches, deletar branches, fazer merge entre branches
## git-files: Listar arquivos do repositório, criar novos arquivos, atualizar arquivos existentes, deletar arquivos
## git-issues: Criar issues, listar issues, atualizar issues, fechar issues, adicionar comentários
## git-pulls: Criar pull requests, listar PRs, fazer merge de PRs, fechar PRs, adicionar reviews
## git-releases: Criar releases, listar releases, atualizar releases, deletar releases, gerenciar assets
## git-tags: Criar tags, listar tags, deletar tags, buscar tags por padrão
## git-webhooks: Criar webhooks, listar webhooks, atualizar webhooks, deletar webhooks, testar webhooks
## git-users: Listar usuários, buscar usuários, gerenciar colaboradores do repositório
## git-rebase: Fazer rebase de branches, rebase interativo, abortar rebase, continuar rebase
## git-reset: Resetar commits (soft/mixed/hard), resetar para commit específico, resetar branch
## git-revert: Reverter commits, reverter merges, reverter range de commits
## git-config: Configurar usuário Git, configurar email, listar configurações, configurar aliases
## git-remote: Adicionar remotes, remover remotes, listar remotes, atualizar URLs de remotes

# GIT ADVANCED TOOLS (5)
## git-cherry-pick: Aplicar commits específicos de outras branches, cherry-pick de range de commits
## git-submodule: Adicionar submódulos, atualizar submódulos, inicializar submódulos, ver status
## git-worktree: Criar worktrees para trabalhar em múltiplas branches simultaneamente
## git-archive: Criar arquivos compactados (zip, tar) do repositório para distribuição
## git-bundle: Criar bundles para transferir repositórios offline, verificar bundles

# GITHUB EXCLUSIVE TOOLS (10)
## gh-workflows: Criar workflows GitHub Actions, listar workflows, disparar workflows, ver status
## gh-actions: Listar execuções de workflows, cancelar execuções, re-executar, baixar artifacts
## gh-deployments: Criar deployments, listar deployments, atualizar status, fazer rollback
## gh-security: Executar scans de segurança, listar vulnerabilidades, gerenciar alertas de segurança
## gh-analytics: Ver estatísticas de tráfego, análise de contribuidores, métricas de atividade
## gh-code-review: Análise automática de código, revisão de arquivos, revisão de commits, revisão de PRs
## gh-gists: Criar gists, listar gists, atualizar gists, deletar gists, fazer fork de gists
## gh-codespaces: Listar codespaces, criar codespaces, deletar codespaces, iniciar/parar codespaces
## gh-projects: Criar projetos GitHub, listar projetos, gerenciar itens de projeto, configurar campos
## gh-sync: Sincronizar repositórios, sincronizar issues, sincronizar PRs, sincronizar releases

# NOVA TOOL (1)
## git-upload-project: Fazer upload completo de projeto local para repositório remoto (GitHub/Gitea) - envia todos os arquivos automaticamente

# SITUAÇÕES DE USO COMUNS
## Criar novo repositório: git-repositories → action: create
## Fazer push de código: git-commits → action: create + git-commits → action: push
## Criar nova branch: git-branches → action: create
## Criar issue: git-issues → action: create
## Criar pull request: git-pulls → action: create
## Fazer release: git-releases → action: create
## Configurar usuário Git: git-config → action: set
## Adicionar remote: git-remote → action: add
## Fazer upload completo: git-upload-project → action: upload
## Criar workflow: gh-workflows → action: create
## Ver analytics: gh-analytics → action: traffic/contributors
## Fazer scan de segurança: gh-security → action: scan

# PARÂMETROS OBRIGATÓRIOS
## action: Ação a executar (list, create, update, delete, etc.)
## repo: Nome do repositório
## provider: "github" ou "gitea"
## projectPath: Caminho local do projeto (para operações Git locais)
**NOTA**: O parâmetro `owner` foi removido - o usuário é detectado automaticamente baseado no provider configurado

# INSTALAÇÃO
## npm install -g @andrebuzeli/git-mcp
## git-mcp
## Versão: 2.16.1 | Tools: 31 | Status: 100% funcional e auto-suficiente