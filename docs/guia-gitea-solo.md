# Guia prático do Gitea MCP para uso individual (solo)

Este guia explica como trabalhar sozinho com Git + Gitea usando o MCP (10 tools) de forma simples, segura e reversível. Foca em: versionamento (commits/branches), tags, releases e rollback, além de quando usar cada tool.

## Conceitos essenciais (solo)

- **Commits**: cada salvamento versionado do seu trabalho. São seu histórico/backup incremental.
- **Branches**: linhas de trabalho isoladas. Úteis para separar ideias ou features mesmo trabalhando solo.
- **Pull Requests (opcional no solo)**: servem para revisão/integração. No solo, use apenas se quiser revisão formal e histórico de decisão concentrado.
- **Tags**: marcadores imutáveis em um commit (ex.: v1.2.3). Perfeitas para “voltar” exatamente a um ponto conhecido bom.
- **Releases**: empacotam uma tag com notas de versão e (opcionalmente) artefatos. São o ponto recomendado para “o que foi publicado/instalado”.
- **Rollback**: voltar para um estado anterior. No solo, geralmente é redeploy de uma release anterior ou checkout de uma tag anterior.

## Quando usar o quê

- **Commits**: sempre que concluir um passo lógico. Mensagens claras e específicas.
- **Branches**: crie quando for mexer em algo que pode atrasar ou arriscar a base estável; feche ao terminar.
- **Pull Requests**: use quando quiser uma “barreira” antes de integrar (ex.: revisão pessoal, checklist).
- **Tags**: crie antes de qualquer ação arriscada ou antes de publicar/deploy.
- **Releases**: crie para cada entrega “instalável/rodável” com notas (changelog). Facilita voltar.

## Diferença prática entre versionamento, tags e releases

- **Versionamento (commits/branches/PRs)**: registra todas as mudanças. Permite reverter commits, trocar de branch, comparar histórico.
- **Tags**: “fotografias” exatas do histórico. Úteis para bloqueios de versão, builds reproduzíveis e rollbacks precisos.
- **Releases**: rótulos de entrega com notas. Ideal para marcar o que está em produção/uso. Rollback = redeploy do release anterior.

## Fluxos rápidos do dia a dia (solo)

1) **Novo projeto**
- repositories.create → cria repositório
- files.create → adiciona README/LICENSE/.gitignore
- branches.create → se quiser separar `main` de `develop`

2) **Nova feature**
- branches.create (feature/nome)
- files.create|update → implementar
- opcional: pulls.create (auto-revisão)
- pulls.merge ou merge direto para `main`

3) **Hotfix**
- branches.create a partir de `main` ou da tag atual (hotfix/x)
- files.update → correção
- merge → `main`
- tags.create + releases.create → publicar correção (ex.: v1.2.4)

4) **Corte de versão**
- tags.create (vMAJOR.MINOR.PATCH)
- releases.create com changelog resumido

5) **Rollback**
- Voltar release: redeploy do release anterior (aponta para a tag anterior)
- Voltar tag: checkout/deploy da tag anterior
- Desfazer commit específico: revert do commit/merge e criar nova tag/release

## Padrões de nomenclatura e SemVer

- Branches: `feature/x`, `fix/x`, `hotfix/x`
- Tags/Releases: `vMAJOR.MINOR.PATCH` (ex.: v1.3.2)
- Commits: mensagem curta + contexto (ex.: "fix: corrige parse de config inválida")

## As 10 tools do MCP (uso individual)

- **repositories**: criar/listar/atualizar/deletar repos, fork, busca.
  - Use para iniciar projetos, ajustar descrição/privacidade e manter organização.
- **branches**: criar/listar/obter/deletar, merge, compare.
  - Use para isolar trabalhos e integrar quando terminar.
- **files**: listar/obter/criar/atualizar/deletar arquivos e diretórios.
  - Use para manipular conteúdo sem sair do MCP (READMEs, configs, scripts).
- **commits**: listar/obter, comparar, buscar.
  - Use para auditoria/histórico, identificar onde algo mudou.
- **issues**: criar/listar/atualizar/fechar/comentar, buscar.
  - Use como notas/tarefas pessoais. Simples e pesquisável.
- **pulls**: criar/listar/atualizar/merge/fechar/review, buscar.
  - Use quando desejar revisão/checklist antes de integrar no `main`.
- **releases**: criar/listar/obter/atualizar/deletar/publicar.
  - Use para corte de versões utilizáveis e prontas para rollback.
- **tags**: criar/listar/obter/deletar/buscar.
  - Use para marcar pontos estáveis antes de mudanças de risco e antes de publicar.
- **users**: obter/listar/buscar usuários, orgs e repos.
  - Útil para automações pessoais e conferências rápidas de acesso.
- **webhooks**: criar/listar/obter/atualizar/deletar/testar.
  - Use para CI/CD local, notificações ou integrações (ex.: build/test/deploy automático).

## Dicas práticas (solo)

- Commits pequenos e frequentes; mensagens claras.
- Sempre crie uma tag antes de mudanças arriscadas e antes de publicar.
- Prefira release para “pontos de entrega” com notas objetivas.
- Use PR quando quiser uma pausa para revisar/checklist, mesmo sozinho.
- Configure webhooks para automatizar testes/build/deploy.
- Mantenha um README enxuto com comandos essenciais e requisitos.

## Checklists

- Release (rápido):
  - Passou nos testes? Tem mudanças relevantes? Mensagens de commit claras?
  - Criar tag `vX.Y.Z` → criar release com changelog resumido → publicar.

- Rollback (rápido):
  - Identificar release/tag anterior estável → redeploy dessa release/tag → abrir issue de causa-raiz.

---

Este documento foca produtividade e reversibilidade para trabalho solo. Use as tools do MCP para centralizar ações (repos, branches, arquivos, issues, PRs, tags e releases) e mantenha o histórico limpo para facilitar qualquer retorno ao estado anterior.

