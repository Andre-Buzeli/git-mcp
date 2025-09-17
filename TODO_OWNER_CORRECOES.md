# TODO LIST - CORREÇÕES DE OWNER AUTOMÁTICO

## 🎯 **RESUMO GERAL**
Análise completa dos arquivos revelou padrão consistente:
- **Arquivos .ts**: Estão bem implementados com auto-detecção ✅
- **Arquivos .js**: Têm problemas graves com owner não definido ❌

---

## 📋 **ACTIONS.JS** ❌
### ❌ **Problemas Identificados:**
1. Linha 100-105: Validações referenciam `data.owner`
2. Linha 133-136: inputSchema inclui owner como obrigatório
3. Linhas 282, 328, 367, 407, 449: Chamadas usam `owner: owner` (não definido)

### ✅ **Correções Necessárias:**
- [ ] Remover `owner` do inputSchema properties
- [ ] Remover `owner` de required no inputSchema
- [ ] Atualizar validações para não referenciar `data.owner`
- [ ] Corrigir todas as chamadas: `owner: owner` → `owner: (await provider.getCurrentUser()).login`
- [ ] Adicionar `applyAutoUserDetection` no handler

---

## 📋 **ANALYTICS.JS** ❌
### ❌ **Problemas Identificados:**
1. Linha 106: Validação referencia `data.owner`
2. Linha 134-137: inputSchema inclui owner como obrigatório
3. Linhas 311, 353, 398: Chamadas usam `owner: owner` (não definido)

### ✅ **Correções Necessárias:**
- [ ] Remover `owner` do inputSchema properties
- [ ] Remover `owner` de required no inputSchema
- [ ] Atualizar validação: `data.owner` → auto-detecção
- [ ] Corrigir chamadas: `owner: owner` → `owner: (await provider.getCurrentUser()).login`
- [ ] Adicionar `applyAutoUserDetection` no handler

---

## 📋 **BRANCHES.JS** ❌
### ❌ **Problemas Identificados:**
1. Linha 106: Validação referencia `data.owner`
2. Linha 84: Schema inclui `owner` como obrigatório
3. Múltiplas chamadas usam `owner` não definido

### ✅ **Correções Necessárias:**
- [ ] Remover `owner` do BranchesInputSchema
- [ ] Atualizar validações: remover referências a `data.owner`
- [ ] Corrigir todas as chamadas: `owner` → `(await provider.getCurrentUser()).login`
- [ ] Adicionar auto-detecção no handler

---

## 📋 **CODE-REVIEW.JS** ❌
### ❌ **Problemas Identificados:**
1. Linha 103: Validação referencia `data.owner`
2. Schema inclui owner como obrigatório
3. Chamadas usam `owner` não definido

### ✅ **Correções Necessárias:**
- [ ] Remover `owner` do CodeReviewInputSchema
- [ ] Atualizar validações
- [ ] Corrigir chamadas de provider methods
- [ ] Adicionar auto-detecção

---

## 📋 **COMMITS.JS** ❌
### ❌ **Problemas Identificados:**
1. Linha 108: Validação referencia `data.owner`
2. Schema inclui owner como obrigatório
3. Múltiplas chamadas usam `owner` não definido

### ✅ **Correções Necessárias:**
- [ ] Remover `owner` do CommitsInputSchema
- [ ] Atualizar validações: remover `data.owner`
- [ ] Corrigir todas as chamadas: `owner` → `(await provider.getCurrentUser()).login`
- [ ] Adicionar auto-detecção no handler

---

## 📋 **DEPLOYMENTS.JS** ❌
### ❌ **Problemas Identificados:**
1. Linha 103: Validação referencia `data.owner`
2. Schema inclui owner como obrigatório
3. Chamadas usam `owner` não definido

### ✅ **Correções Necessárias:**
- [ ] Remover `owner` do DeploymentsInputSchema
- [ ] Atualizar validações
- [ ] Corrigir chamadas: `owner` não definido
- [ ] Adicionar auto-detecção

---

## 📋 **FILES.JS** ❌
### ❌ **Problemas Identificados:**
1. Schema inclui owner como obrigatório
2. Validações referenciam `data.owner`
3. Chamadas usam `owner` não definido

### ✅ **Correções Necessárias:**
- [ ] Remover `owner` do FilesInputSchema
- [ ] Atualizar validações
- [ ] Corrigir chamadas de provider methods
- [ ] Adicionar auto-detecção

---

## 📋 **ISSUES.JS** ❌
### ❌ **Problemas Identificados:**
1. Schema inclui owner como obrigatório
2. Validações referenciam `data.owner`
3. Múltiplas chamadas usam `owner` não definido

### ✅ **Correções Necessárias:**
- [ ] Remover `owner` do IssuesInputSchema
- [ ] Atualizar validações
- [ ] Corrigir chamadas de provider methods
- [ ] Adicionar auto-detecção

---

## 📋 **PULLS.JS** ❌
### ❌ **Problemas Identificados:**
1. Schema inclui owner como obrigatório
2. Validações referenciam `data.owner`
3. Múltiplas chamadas usam `owner` não definido

### ✅ **Correções Necessárias:**
- [ ] Remover `owner` do PullsInputSchema
- [ ] Atualizar validações
- [ ] Corrigir chamadas de provider methods
- [ ] Adicionar auto-detecção

---

## 📋 **RELEASES.JS** ❌
### ❌ **Problemas Identificados:**
1. Schema inclui owner como obrigatório
2. Validações referenciam `data.owner`
3. Chamadas usam `owner` não definido

### ✅ **Correções Necessárias:**
- [ ] Remover `owner` do ReleasesInputSchema
- [ ] Atualizar validações
- [ ] Corrigir chamadas de provider methods
- [ ] Adicionar auto-detecção

---

## 📋 **REPOSITORIES.JS** ❌
### ❌ **Problemas Identificados:**
1. Schema inclui owner como obrigatório
2. Validações referenciam `data.owner`
3. Múltiplas chamadas usam `owner` não definido

### ✅ **Correções Necessárias:**
- [ ] Remover `owner` do GitRepositoriesInputSchema
- [ ] Atualizar validações
- [ ] Corrigir chamadas de provider methods
- [ ] Adicionar auto-detecção

---

## 📋 **SECURITY.JS** ❌
### ❌ **Problemas Identificados:**
1. Schema inclui owner como obrigatório
2. Validações referenciam `data.owner`
3. Chamadas usam `owner` não definido

### ✅ **Correções Necessárias:**
- [ ] Remover `owner` do SecurityInputSchema
- [ ] Atualizar validações
- [ ] Corrigir chamadas de provider methods
- [ ] Adicionar auto-detecção

---

## 📋 **TAGS.JS** ❌
### ❌ **Problemas Identificados:**
1. Schema inclui owner como obrigatório
2. Validações referenciam `data.owner`
3. Chamadas usam `owner` não definido

### ✅ **Correções Necessárias:**
- [ ] Remover `owner` do TagsInputSchema
- [ ] Atualizar validações
- [ ] Corrigir chamadas de provider methods
- [ ] Adicionar auto-detecção

---

## 📋 **USERS.JS** ❌
### ❌ **Problemas Identificados:**
1. Schema inclui owner/username como obrigatório
2. Validações referenciam `data.owner`
3. Chamadas usam `owner` não definido

### ✅ **Correções Necessárias:**
- [ ] Remover `owner`/`username` do schema
- [ ] Atualizar validações
- [ ] Corrigir chamadas de provider methods
- [ ] Adicionar auto-detecção

---

## 📋 **VALIDATOR.JS** ⚠️
### ❌ **Problemas Identificados:**
1. Pode conter referências a `owner` em CommonSchemas

### ✅ **Correções Necessárias:**
- [ ] Verificar e remover referências a `owner` se existirem
- [ ] Atualizar ToolValidator.createBaseToolSchema

---

## 📋 **WEBHOOKS.JS** ❌
### ❌ **Problemas Identificados:**
1. Schema inclui owner como obrigatório
2. Validações referenciam `data.owner`
3. Chamadas usam `owner` não definido

### ✅ **Correções Necessárias:**
- [ ] Remover `owner` do WebhooksInputSchema
- [ ] Atualizar validações
- [ ] Corrigir chamadas de provider methods
- [ ] Adicionar auto-detecção

---

## 📋 **WORKFLOWS.JS** ❌
### ❌ **Problemas Identificados:**
1. Schema inclui owner como obrigatório
2. Validações referenciam `data.owner`
3. Chamadas usam `owner` não definido

### ✅ **Correções Necessárias:**
- [ ] Remover `owner` do WorkflowsInputSchema
- [ ] Atualizar validações
- [ ] Corrigir chamadas de provider methods
- [ ] Adicionar auto-detecção

---

## 📋 **VERSION-CONTROL.JS** ❌
### ❌ **Problemas Identificados:**
1. Schema inclui owner como obrigatório
2. Validações referenciam `data.owner`
3. Chamadas usam `owner` não definido

### ✅ **Correções Necessárias:**
- [ ] Remover `owner` do VersionControlInputSchema
- [ ] Atualizar validações
- [ ] Corrigir chamadas de provider methods
- [ ] Adicionar auto-detecção

---

## ✅ **ARQUIVOS TYPESCRIPT CORRETOS** ✅
Estes arquivos já estão implementados corretamente:
- gh-actions.ts ✅
- gh-analytics.ts ✅
- gh-code-review.ts ✅
- gh-codespaces.ts ✅
- gh-deployments.ts ✅
- gh-gists.ts ✅
- gh-projects.ts ✅
- gh-security.ts ✅
- gh-sync.ts ✅
- gh-workflows.ts ✅
- git-archive.ts ✅
- git-branches.ts ✅
- git-bundle.ts ✅
- git-cherry-pick.ts ✅
- git-commits.ts ✅
- git-config.ts ✅
- git-files.ts ✅
- git-issues.ts ✅
- git-pulls.ts ✅
- git-rebase.ts ✅
- git-repositories.ts ✅
- git-releases.ts ✅
- git-remote.ts ✅
- git-reset.ts ✅
- git-revert.ts ✅
- git-stash.ts ✅
- git-submodule.ts ✅
- git-tags.ts ✅
- git-upload-project.ts ✅
- git-webhooks.ts ✅
- git-worktree.ts ✅
- repositories.ts ✅
- users.ts ✅
- validator.ts ✅
- version-control.ts ✅

---

## 🎯 **ESTRATÉGIA DE CORREÇÃO**
1. **Arquivos .ts**: Já estão corretos - não mexer
2. **Arquivos .js**: São compilados - editar os arquivos .ts fonte
3. **Foco**: Corrigir apenas os arquivos .ts que geram os .js problemáticos
4. **Padrão**: Seguir o padrão dos arquivos .ts corretos

---

## 📊 **STATUS**
- **Total de arquivos analisados**: 47
- **Arquivos .ts corretos**: ~25
- **Arquivos .ts para corrigir**: ~22
- **Arquivos .js**: Não editar (são compilados)

---

## 🚀 **PRÓXIMOS PASSOS**
1. Identificar quais arquivos .ts geram os .js problemáticos
2. Corrigir os arquivos .ts fonte seguindo o padrão correto
3. Compilar novamente
4. Testar se os problemas foram resolvidos

---

## 🔍 **PADRÃO DE CORREÇÃO**

### ❌ **ANTES (Incorreto):**
```javascript
// Schema ainda inclui owner
owner: z.string().min(1, 'Owner é obrigatório').max(100, 'Owner muito longo').optional(),

// Validações referenciam data.owner
if (data.action === 'create') {
  return data.owner && data.repo && data.branch_name;
}

// Chamadas usam owner não definido
await provider.listWorkflowRuns({
  owner: owner,  // ❌ owner não definido
  repo: params.repo
});
```

### ✅ **DEPOIS (Correto):**
```typescript
// Schema NÃO inclui owner
// inputSchema required não inclui owner

// Handler usa applyAutoUserDetection
const updatedParams = await applyAutoUserDetection(validatedInput, validatedInput.provider);

// Métodos usam auto-detecção
const currentUser = await provider.getCurrentUser();
const owner = currentUser.login;

await provider.listWorkflowRuns({
  owner: owner,  // ✅ owner definido via auto-detecção
  repo: params.repo
});
```

---

*Análise realizada em 2025-09-17 - Todos os arquivos .js têm problemas similares com owner não definido*
