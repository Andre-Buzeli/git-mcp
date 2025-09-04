# Task Manager

## Tasks

# [x] Criar guia .md para uso solo do Gitea MCP (ID: T-341177-MJC)
  *Produzir documento em docs/guia-gitea-solo.md explicando versionamento, tags, releases e uso prático das tools para um único usuário.********************************************************************
# [x] Definir interfaces do provedor (VcsProvider) (ID: T-941641-FKB)
  *Contrato único cobrindo operações usadas pelas tools.******************************************************************
# [x] Definir formato de configuração (single e multi-provider) (ID: T-930594-XP4)
  *Especificar env vars: PROVIDER/API_URL/API_TOKEN e PROVIDERS_JSON/DEFAULT_PROVIDER.*****************************************************************
# [x] DI nas tools e seleção por provider (ID: T-938540-1EW)
  *Atualizar todas as tools para receber provider e parâmetro opcional `provider` para multi-provider.****************************************************************
# [x] Especificação e design da tool git-sync (ID: T-944866-T76)
  *Definir escopo, parâmetros, modos (one-shot, continuous), limites e estratégias (mirror nativo, APIs, webhooks).***************************************************************
# [x] Testar conectividade básica do Gitea (ID: T-500244-MHR)
  *Verificar se consegue acessar o Gitea e listar repositórios****************************************************
# [ ] Testar operações de branches (ID: T-511087-D4I)
  *Testar listagem, criação e operações com branches**************************************************
# [ ] Testar operações de arquivos (ID: T-513626-EMO)
  *Testar listagem, leitura e operações com arquivos*************************************************
# [ ] Testar operações de commits (ID: T-516916-H1Q)
  *Testar listagem e operações com commits************************************************
# [x] Testar Repositories com GitHub (ID: T-562580-LOB)
  *Testar todas as operações de repositories usando provider GitHub***********************************************
## [ ] Testar Branches com GitHub (ID: ST-564759-SSZ)
  *Testar operações de branches usando provider GitHub**********************************************
## [ ] Testar Files com GitHub (ID: ST-567531-4CX)
  *Testar operações de files usando provider GitHub*********************************************
## [ ] Testar Commits com GitHub (ID: ST-570552-I0L)
  *Testar operações de commits usando provider GitHub********************************************
## [ ] Testar Issues com GitHub (ID: ST-573516-I2R)
  *Testar operações de issues usando provider GitHub*******************************************
## [ ] Testar Pull Requests com GitHub (ID: ST-576193-V18)
  *Testar operações de pull requests usando provider GitHub******************************************
## [ ] Testar Releases com GitHub (ID: ST-578276-757)
  *Testar operações de releases usando provider GitHub*****************************************
## [ ] Testar Tags com GitHub (ID: ST-580901-8BH)
  *Testar operações de tags usando provider GitHub****************************************
## [ ] Testar Users com GitHub (ID: ST-583193-8BN)
  *Testar operações de users usando provider GitHub***************************************
## [ ] Testar Webhooks com GitHub (ID: ST-585538-MCA)
  *Testar operações de webhooks usando provider GitHub**************************************
## [ ] Testar Git Sync com GitHub (ID: ST-588043-571)
  *Testar operações de git sync usando provider GitHub*************************************
## [ ] Testar Version Control com GitHub (ID: ST-590498-6C0)
  *Testar operações de version control usando provider GitHub************************************

# [x] Testar todas as tools com Gitea (ID: T-733579-BO8)
  *Testar todas as operações usando provider Gitea**********************
# [x] Testar com repositórios reais do Andre-Buzeli (ID: T-927942-4YV)
  *Testar as tools do gitea-mcp usando os repositórios reais do usuário Andre-Buzeli*******************
# [x] Testar Gitea-MCP com provider Gitea (ID: T-117719-77C)
  *Testar todas as operações do gitea-mcp usando provider Gitea para verificar se funciona com servidor Gitea****************
# [ ] Corrigir detecção automática de usuário (ID: T-242865-ECJ)
  *Implementar detecção automática do usuário correto para evitar usar usuários errados*************
# [ ] Corrigir erro de search repositories no Gitea (ID: T-246388-017)
  *Corrigir erro 'data.map is not a function' na operação de search repositories************
# [ ] Corrigir problema com labels em issues do Gitea (ID: T-249818-T0B)
  *Corrigir erro de validação ao criar issues com labels no Gitea***********
# [ ] Publicar atualização corrigida (ID: T-253347-QPL)
  *Publicar nova versão do gitea-mcp com todas as correções implementadas**********
# [ ] Corrigir uso de usuário correto (ID: T-950337-MBT)
  *Garantir que sempre use o usuário correto: Andre-Buzeli para GitHub e andrebuzeli para Gitea********
## [x] Corrigir erro de search repositories (ID: ST-953570-BL2)
  *Corrigir o erro 'data.map is not a function' na operação de search de repositories no Gitea*******
## [x] Corrigir erro de labels em issues (ID: ST-956821-3AS)
  *Corrigir o erro de Validation error ao criar issues com labels no Gitea******
## [ ] Publicar atualizações corrigidas (ID: ST-959837-XRI)
  *Publicar as correções no repositório Gitea e GitHub*****


---

<!-- Este arquivo é gerenciado automaticamente pelo Advanced Memory Bank MCP -->
<!-- Não edite manualmente - use as ferramentas MCP para modificar o conteúdo -->

