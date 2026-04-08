# PRD — Correção do Módulo de Autenticação

---

## Problema 1 — Redefinição de Senha (fluxo quebrado)

**O que está errado:**
O `forgotPasswordAction` envia o email com `redirectTo: /auth/callback`, mas:
- A pasta `app/auth/callback/` existe porém está vazia (sem `route.ts`)
- A página `app/(auth)/redefinir-senha/page.tsx` não existe

O usuário recebe o email, clica, e cai em um 404.

**Fluxo correto do Supabase:**
```
Email → /auth/callback?code=XXXX → troca code por sessão → /redefinir-senha → updateUser({ password })
```

**Arquivos a criar/alterar:**

| Arquivo | Ação | O que fazer |
|---|---|---|
| `app/auth/callback/route.ts` | **Criar** | `GET` handler: recebe `?code=`, chama `supabase.auth.exchangeCodeForSession(code)`, redireciona para `/redefinir-senha` (reset) ou `/dashboard` (invite) |
| `app/(auth)/redefinir-senha/page.tsx` | **Criar** | Formulário com campo "nova senha" + confirmação; chama `updatePasswordAction` |
| `app/actions/auth.ts` | **Alterar** | Adicionar `updatePasswordAction`: chama `supabase.auth.updateUser({ password })`, redireciona para `/dashboard` |

---

## Problema 2 — Convite de Novo Usuário falhando

**O que está errado:**
A `convidarMembro` em `app/actions/empresa.ts` busca o email na tabela `usuarios` e **falha se o usuário não existir ainda**. Não envia nenhum email de convite. O fluxo é incoerente: exige que o usuário já esteja cadastrado antes de ser convidado.

**Fluxo correto:**
```
Admin convida email → adminClient.auth.admin.inviteUserByEmail() → Supabase envia email →
usuário clica → /auth/callback → cria usuario_empresa → /redefinir-senha
```

**Arquivos a alterar:**

| Arquivo | Ação | O que fazer |
|---|---|---|
| `app/actions/empresa.ts` | **Alterar** `convidarMembro` | Substituir a busca por `usuarios` por `createAdminClient().auth.admin.inviteUserByEmail(email, { data: { empresa_id, papel }, redirectTo: /auth/callback })` |
| `app/auth/callback/route.ts` | **Alterar** (pós-criação) | Após `exchangeCodeForSession`, ler `user.user_metadata` para detectar se veio de convite; se sim, criar o registro `usuario_empresa` automaticamente |

**Obs.:** Se o email já existir no Supabase Auth, o `inviteUserByEmail` retorna erro — tratar esse caso voltando para o fluxo antigo (só vincular à empresa).

---

## Problema 3 — Edição de Autenticação do Membro

**O que está errado:**
O formulário de edição em `components/dashboard/membros-tab.tsx` só permite alterar `papel` e `metas`. Não há como o admin atualizar o **email ou senha** de um membro.

Além disso, há um bug no botão Excluir: ele usa `formAction={formActionRemover}` dentro de um `<form action={formActionAtualizar}>` — isso pode não funcionar corretamente em Turbopack/React 19.

**Arquivos a alterar:**

| Arquivo | Ação | O que fazer |
|---|---|---|
| `app/actions/empresa.ts` | **Criar** `atualizarAuthMembro` | Usa `createAdminClient().auth.admin.updateUserById(authUserId, { email?, password? })` — requer verificação de papel admin |
| `lib/supabase/queries/membros.ts` | **Verificar** | Confirmar se `MembroEmpresa` retorna o `auth_user_id` (UUID do Supabase Auth) para usar no `updateUserById` |
| `components/dashboard/membros-tab.tsx` | **Alterar** `MembroRow` | Adicionar campos opcionais "novo email" e "nova senha" no formulário de edição; separar o botão Excluir em um `<form>` próprio para corrigir o bug |

---

## Ordem de execução sugerida

```
1. app/auth/callback/route.ts          ← desbloqueia tudo (reset + invite)
2. app/(auth)/redefinir-senha/page.tsx ← completa o fluxo de reset
3. updatePasswordAction em auth.ts     ← action da nova senha
4. convidarMembro refatorado           ← invite real via Supabase Auth
5. atualizarAuthMembro + MembrosTab    ← edição de auth do membro
```
