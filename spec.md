# SPEC — Correção do Módulo de Autenticação

> **Baseado no PRD:** `prd.md — Correção do Módulo de Autenticação`
> **Objetivo:** Documento de especificação técnica completo para implementação dos 3 problemas descritos no PRD.

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Mapa de Arquivos](#mapa-de-arquivos)
3. [Problema 1 — Redefinição de Senha](#problema-1--redefinição-de-senha)
4. [Problema 2 — Convite de Novo Usuário](#problema-2--convite-de-novo-usuário)
5. [Problema 3 — Edição de Auth do Membro](#problema-3--edição-de-auth-do-membro)
6. [Ordem de Execução](#ordem-de-execução)
7. [Checklist de Validação](#checklist-de-validação)

---

## Visão Geral

O módulo de autenticação possui três fluxos quebrados:

| # | Problema | Impacto | Causa raiz |
|---|----------|---------|------------|
| 1 | Redefinição de senha | Usuário cai em 404 ao clicar no email | `app/auth/callback/route.ts` não existe; página `/redefinir-senha` não existe |
| 2 | Convite de membro | Convite nunca é enviado | `convidarMembro` busca usuário na tabela antes de existir; não usa `inviteUserByEmail` |
| 3 | Edição de auth do membro | Admin não consegue alterar email/senha | Formulário só edita `papel` e `metas`; botão Excluir com bug de `formAction` aninhado |

---

## Mapa de Arquivos

Todos os arquivos impactados, com a ação necessária em cada um:

### Arquivos a CRIAR

| Arquivo | Problema | Descrição |
|---------|----------|-----------|
| `app/auth/callback/route.ts` | 1, 2 | Route handler GET que troca `code` por sessão e redireciona |
| `app/(auth)/redefinir-senha/page.tsx` | 1 | Página com formulário de nova senha + confirmação |

### Arquivos a ALTERAR

| Arquivo | Problema | O que muda |
|---------|----------|------------|
| `app/actions/auth.ts` | 1 | Adicionar `updatePasswordAction` |
| `app/actions/empresa.ts` | 2, 3 | Refatorar `convidarMembro` + criar `atualizarAuthMembro` |
| `lib/supabase/queries/membros.ts` | 3 | Verificar se retorna `auth_user_id` |
| `components/dashboard/membros-tab.tsx` | 3 | Campos de email/senha + fix do botão Excluir |

### Arquivos a VERIFICAR (sem alteração garantida)

| Arquivo | Motivo |
|---------|--------|
| `lib/supabase/admin.ts` (ou equivalente) | Confirmar que `createAdminClient()` existe e retorna client com `service_role_key` |
| `middleware.ts` | Confirmar que `/auth/callback` não é bloqueado pelo middleware de auth |
| `.env.local` | Confirmar que `SUPABASE_SERVICE_ROLE_KEY` está configurada |

---

## Problema 1 — Redefinição de Senha

### Contexto

O `forgotPasswordAction` (já existente em `app/actions/auth.ts`) envia o email de reset via `supabase.auth.resetPasswordForEmail()` com `redirectTo` apontando para `/auth/callback`. Porém:

- A pasta `app/auth/callback/` existe mas está **vazia** (sem `route.ts`).
- A página `app/(auth)/redefinir-senha/page.tsx` **não existe**.

O resultado é que o usuário recebe o email, clica no link, e cai em **404**.

### Fluxo correto (a implementar)

```
1. Usuário clica "Esqueci minha senha"
2. forgotPasswordAction envia email (já funciona)
3. Email contém link: /auth/callback?code=XXXX
4. GET /auth/callback → exchangeCodeForSession(code)
5. Redireciona para /redefinir-senha
6. Usuário preenche nova senha
7. updatePasswordAction → supabase.auth.updateUser({ password })
8. Redireciona para /dashboard
```

### 1.1 — Criar `app/auth/callback/route.ts`

**Responsabilidade:** Receber o `?code=` da URL, trocar por uma sessão válida no Supabase e redirecionar o usuário para a página correta.

**Lógica detalhada:**

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Se não houver code, redireciona para login
  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Erro ao trocar code por sessão:", error.message);
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  // Detectar se veio de convite (Problema 2 — detalhado adiante)
  const user = data.session?.user;
  const isInvite = user?.user_metadata?.empresa_id != null;

  if (isInvite) {
    // Fluxo de convite: criar vínculo usuario_empresa e redirecionar
    // (implementação detalhada no Problema 2)
    await criarVinculoSeConvite(user);
    return NextResponse.redirect(`${origin}/redefinir-senha`);
  }

  // Fluxo de reset de senha
  return NextResponse.redirect(`${origin}/redefinir-senha`);
}
```

**Pontos de atenção:**

- Usar `createServerClient` do `@supabase/ssr` (não `createClient` genérico) para manipular cookies no route handler.
- O `exchangeCodeForSession` **precisa** setar os cookies de sessão no response — o helper do `@supabase/ssr` já faz isso via o callback `setAll`.
- Verificar no `middleware.ts` que a rota `/auth/callback` **não exige autenticação** (o usuário ainda não tem sessão quando chega aqui).

---

### 1.2 — Criar `app/(auth)/redefinir-senha/page.tsx`

**Responsabilidade:** Exibir formulário para o usuário definir nova senha após clicar no link do email.

**Requisitos de UI:**

- Campo "Nova senha" (type `password`, obrigatório, mínimo 6 caracteres)
- Campo "Confirmar senha" (type `password`, obrigatório)
- Validação client-side: senhas devem ser iguais
- Botão "Redefinir senha" que chama `updatePasswordAction`
- Exibir mensagens de erro/sucesso
- Seguir o mesmo layout das outras páginas em `app/(auth)/` (ex: `/login`, `/cadastro`)

**Estrutura do componente:**

```tsx
"use client";

import { useActionState } from "react";
import { updatePasswordAction } from "@/app/actions/auth";

export default function RedefinirSenhaPage() {
  const [state, formAction, isPending] = useActionState(
    updatePasswordAction,
    null
  );

  return (
    <form action={formAction}>
      <h1>Redefinir Senha</h1>

      {state?.error && (
        <div className="error">{state.error}</div>
      )}

      {state?.success && (
        <div className="success">{state.success}</div>
      )}

      <label htmlFor="password">Nova senha</label>
      <input
        id="password"
        name="password"
        type="password"
        required
        minLength={6}
        placeholder="Mínimo 6 caracteres"
      />

      <label htmlFor="confirmPassword">Confirmar senha</label>
      <input
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        required
        minLength={6}
        placeholder="Repita a senha"
      />

      <button type="submit" disabled={isPending}>
        {isPending ? "Redefinindo..." : "Redefinir senha"}
      </button>
    </form>
  );
}
```

**Pontos de atenção:**

- A página precisa ser `"use client"` pois usa `useActionState`.
- O layout `(auth)` provavelmente já tem um `layout.tsx` com estilização — reutilizar.
- Se o projeto usa alguma lib de UI (shadcn, radix, etc), usar os componentes do projeto.

---

### 1.3 — Alterar `app/actions/auth.ts` — Adicionar `updatePasswordAction`

**Localização:** Adicionar no final do arquivo `app/actions/auth.ts`, junto das actions existentes (`loginAction`, `signupAction`, `forgotPasswordAction`, etc).

**Implementação:**

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function updatePasswordAction(
  _prevState: any,
  formData: FormData
) {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Validações
  if (!password || !confirmPassword) {
    return { error: "Preencha todos os campos." };
  }

  if (password !== confirmPassword) {
    return { error: "As senhas não coincidem." };
  }

  if (password.length < 6) {
    return { error: "A senha deve ter no mínimo 6 caracteres." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    console.error("Erro ao atualizar senha:", error.message);
    return { error: "Não foi possível atualizar a senha. Tente novamente." };
  }

  redirect("/dashboard");
}
```

**Pontos de atenção:**

- O `supabase.auth.updateUser()` só funciona se o usuário já tiver uma sessão ativa — por isso o callback `/auth/callback` precisa rodar **antes** e setar os cookies.
- O `redirect()` do Next.js lança uma exceção internamente (é esperado), não precisa de `return` depois.
- A assinatura `(_prevState: any, formData: FormData)` é obrigatória para funcionar com `useActionState`.

---

## Problema 2 — Convite de Novo Usuário

### Contexto

A function `convidarMembro` em `app/actions/empresa.ts` atualmente:

1. Recebe o email do convidado
2. Busca o email na tabela `usuarios`
3. **Falha** se o usuário não existir (pois ainda não se cadastrou)
4. Nunca envia nenhum email de convite

Ou seja: só funciona se o usuário já tiver conta. Isso invalida o propósito do convite.

### Fluxo correto (a implementar)

```
1. Admin preenche email no formulário de convite
2. convidarMembro chama adminClient.auth.admin.inviteUserByEmail()
3. Supabase envia email automático com link para /auth/callback
4. Usuário clica no link
5. /auth/callback troca code por sessão
6. /auth/callback detecta metadata de convite (empresa_id, papel)
7. /auth/callback cria registro em usuario_empresa
8. Redireciona para /redefinir-senha (para o usuário criar sua senha)
```

### 2.1 — Alterar `app/actions/empresa.ts` — Refatorar `convidarMembro`

**Substituir** a lógica atual por:

```typescript
"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function convidarMembro(
  _prevState: any,
  formData: FormData
) {
  const email = formData.get("email") as string;
  const papel = formData.get("papel") as string; // ex: "admin", "vendedor"
  const empresaId = formData.get("empresaId") as string;

  if (!email || !papel || !empresaId) {
    return { error: "Preencha todos os campos." };
  }

  // Verificar se quem está convidando é admin da empresa
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autenticado." };
  }

  // TODO: verificar se user é admin da empresa (consultar usuario_empresa)

  const adminClient = createAdminClient();

  // Tentar enviar convite via Supabase Auth
  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(
    email,
    {
      data: {
        empresa_id: empresaId,
        papel: papel,
      },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    }
  );

  // Se o email já existir no Supabase Auth
  if (error) {
    // Caso: usuário já existe — vincular diretamente à empresa
    if (error.message.includes("already been registered") ||
        error.message.includes("already exists")) {

      // Buscar o auth user por email
      const { data: existingUsers } = await adminClient.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(
        (u) => u.email === email
      );

      if (!existingUser) {
        return { error: "Erro ao localizar usuário existente." };
      }

      // Criar vínculo direto na tabela usuario_empresa
      const { error: insertError } = await supabase
        .from("usuario_empresa")
        .insert({
          usuario_id: existingUser.id, // ou o campo correto da sua tabela
          empresa_id: empresaId,
          papel: papel,
        });

      if (insertError) {
        // Pode ser unique constraint se já for membro
        if (insertError.code === "23505") {
          return { error: "Este usuário já é membro da empresa." };
        }
        console.error("Erro ao vincular usuário:", insertError);
        return { error: "Erro ao adicionar membro." };
      }

      return { success: "Usuário existente adicionado à empresa." };
    }

    // Outro erro genérico
    console.error("Erro ao convidar:", error.message);
    return { error: "Não foi possível enviar o convite." };
  }

  return { success: `Convite enviado para ${email}.` };
}
```

**Pré-requisitos:**

- `createAdminClient()` deve existir em `lib/supabase/admin.ts` e retornar um client Supabase inicializado com `SUPABASE_SERVICE_ROLE_KEY`.
- Se essa função ainda não existir, criar:

```typescript
// lib/supabase/admin.ts
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
```

**Variáveis de ambiente necessárias:**

- `NEXT_PUBLIC_SUPABASE_URL` — já deve existir
- `SUPABASE_SERVICE_ROLE_KEY` — verificar no `.env.local` (é a chave `service_role` do Supabase, **nunca** expor no client)
- `NEXT_PUBLIC_APP_URL` — URL base da aplicação (ex: `http://localhost:3000` em dev, `https://app.dominio.com` em prod)

---

### 2.2 — Alterar `app/auth/callback/route.ts` — Tratar fluxo de convite

Após o `exchangeCodeForSession`, adicionar lógica para detectar convite e criar o vínculo.

**Adicionar esta função auxiliar** (pode ficar no próprio `route.ts` ou em um util separado):

```typescript
import { createAdminClient } from "@/lib/supabase/admin";

async function criarVinculoSeConvite(
  user: { id: string; user_metadata: Record<string, any> }
) {
  const { empresa_id, papel } = user.user_metadata;

  if (!empresa_id) return; // Não é convite, ignorar

  const adminClient = createAdminClient();

  // Usar admin client para inserir, pois o usuário acabou de ser criado
  // e pode não ter permissão RLS ainda
  const { error } = await adminClient
    .from("usuario_empresa")
    .insert({
      usuario_id: user.id,
      empresa_id: empresa_id,
      papel: papel || "membro",
    });

  if (error) {
    // Se já existe (idempotência), ignorar
    if (error.code === "23505") return;
    console.error("Erro ao criar vínculo usuario_empresa:", error);
  }

  // Opcional: criar registro na tabela `usuarios` se necessário
  // (depende do schema — verificar se há trigger ou se precisa criar manualmente)
  const { error: userError } = await adminClient
    .from("usuarios")
    .upsert({
      id: user.id,
      email: user.email,
      // outros campos padrão...
    }, { onConflict: "id" });

  if (userError) {
    console.error("Erro ao criar registro usuarios:", userError);
  }
}
```

**O `route.ts` completo** fica conforme mostrado no item 1.1, chamando `criarVinculoSeConvite(user)` quando detecta convite.

**Pontos de atenção:**

- O `inviteUserByEmail` do Supabase armazena o objeto `data` no `user_metadata` do usuário criado.
- Após o `exchangeCodeForSession`, o `data.session.user.user_metadata` contém `{ empresa_id, papel }` que foram passados no convite.
- Usar `adminClient` para o insert, não o client com sessão do usuário, porque o usuário recém-criado provavelmente não tem permissão via RLS para inserir em `usuario_empresa`.
- Tratar idempotência: se o callback for chamado mais de uma vez (refresh da página), o `23505` (unique violation) deve ser ignorado silenciosamente.

---

## Problema 3 — Edição de Auth do Membro

### Contexto

O formulário de edição de membro em `components/dashboard/membros-tab.tsx` só permite alterar:
- `papel` (role do membro na empresa)
- `metas` (metas de vendas, etc)

O admin **não consegue** alterar email ou senha de um membro.

Além disso, o botão "Excluir" usa `formAction={formActionRemover}` aninhado dentro de um `<form action={formActionAtualizar}>`, o que pode causar comportamento inconsistente no React 19 / Turbopack.

### 3.1 — Alterar `lib/supabase/queries/membros.ts` — Verificar retorno de `auth_user_id`

**O que verificar:**

Abrir o arquivo e confirmar que o tipo `MembroEmpresa` (ou equivalente) inclui o campo que referencia o UUID do Supabase Auth. Esse campo é necessário para chamar `updateUserById`.

```typescript
// Verificar se algo assim existe:
type MembroEmpresa = {
  id: string;              // ID da tabela usuario_empresa
  usuario_id: string;      // ← Este é o UUID do Supabase Auth (auth.users.id)
  empresa_id: string;
  papel: string;
  // ...
};
```

**Se `usuario_id` (ou `auth_user_id`) NÃO estiver sendo retornado** nas queries existentes, alterar a query para incluí-lo:

```typescript
// Exemplo: se a query atual faz SELECT sem usuario_id
const { data } = await supabase
  .from("usuario_empresa")
  .select("id, papel, metas, usuarios(id, nome, email)")
  .eq("empresa_id", empresaId);

// Garantir que `usuarios.id` está no select — esse é o auth_user_id
```

O valor de `usuarios.id` (ou `usuario_id` direto) será passado para o formulário como hidden field e usado na action `atualizarAuthMembro`.

---

### 3.2 — Criar `atualizarAuthMembro` em `app/actions/empresa.ts`

**Adicionar** esta server action no arquivo:

```typescript
"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function atualizarAuthMembro(
  _prevState: any,
  formData: FormData
) {
  const authUserId = formData.get("authUserId") as string;
  const novoEmail = formData.get("novoEmail") as string | null;
  const novaSenha = formData.get("novaSenha") as string | null;

  if (!authUserId) {
    return { error: "ID do usuário não informado." };
  }

  // Nenhuma alteração solicitada
  if (!novoEmail && !novaSenha) {
    return { error: "Informe pelo menos email ou senha para atualizar." };
  }

  // Verificar se quem está fazendo a ação é admin
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  if (!currentUser) {
    return { error: "Não autenticado." };
  }

  // TODO: Verificar se currentUser é admin da empresa do membro-alvo
  // Exemplo:
  // const { data: adminCheck } = await supabase
  //   .from("usuario_empresa")
  //   .select("papel")
  //   .eq("usuario_id", currentUser.id)
  //   .eq("empresa_id", empresaId)
  //   .single();
  // if (adminCheck?.papel !== "admin") return { error: "Sem permissão." };

  const adminClient = createAdminClient();

  // Montar objeto de atualização
  const updates: { email?: string; password?: string } = {};
  if (novoEmail) updates.email = novoEmail;
  if (novaSenha) {
    if (novaSenha.length < 6) {
      return { error: "A senha deve ter no mínimo 6 caracteres." };
    }
    updates.password = novaSenha;
  }

  const { error } = await adminClient.auth.admin.updateUserById(
    authUserId,
    updates
  );

  if (error) {
    console.error("Erro ao atualizar auth do membro:", error.message);
    return { error: `Erro ao atualizar: ${error.message}` };
  }

  // Se alterou email, atualizar também na tabela `usuarios` (se aplicável)
  if (novoEmail) {
    await adminClient
      .from("usuarios")
      .update({ email: novoEmail })
      .eq("id", authUserId);
  }

  return { success: "Dados de autenticação atualizados." };
}
```

**Pontos de atenção:**

- `updateUserById` é uma operação admin (requer `service_role_key`) — **nunca** expor essa action no client sem verificar permissão.
- Se o email for alterado, o Supabase pode enviar um email de confirmação ao novo endereço (depende da config do projeto). Informar o admin sobre isso na UI.
- Se a tabela `usuarios` mantém uma cópia do email (desnormalizado), atualizar lá também.

---

### 3.3 — Alterar `components/dashboard/membros-tab.tsx` — Formulário + Fix do botão Excluir

**Alterações necessárias no componente `MembroRow`:**

#### A) Adicionar campos opcionais de email e senha

Dentro do formulário de edição do membro, adicionar:

```tsx
{/* Campos existentes de papel e metas permanecem */}

{/* -------- NOVOS CAMPOS -------- */}
<input type="hidden" name="authUserId" value={membro.usuario_id} />

<details>
  <summary>Alterar email / senha</summary>

  <label htmlFor={`email-${membro.id}`}>Novo email (opcional)</label>
  <input
    id={`email-${membro.id}`}
    name="novoEmail"
    type="email"
    placeholder="Deixe vazio para manter o atual"
  />

  <label htmlFor={`senha-${membro.id}`}>Nova senha (opcional)</label>
  <input
    id={`senha-${membro.id}`}
    name="novaSenha"
    type="password"
    placeholder="Deixe vazio para manter a atual"
    minLength={6}
  />

  <button formAction={formActionAtualizarAuth}>
    Atualizar email/senha
  </button>
</details>
```

Ou, se preferir um approach mais limpo, usar um modal/dialog para os campos de auth.

#### B) Separar o botão Excluir em `<form>` próprio

**Bug atual:**

```tsx
{/* ❌ ERRADO — formAction dentro de form com action diferente */}
<form action={formActionAtualizar}>
  {/* campos de papel, metas... */}
  <button type="submit">Salvar</button>
  <button formAction={formActionRemover}>Excluir</button> {/* ← BUG */}
</form>
```

**Correção:**

```tsx
{/* ✅ CORRETO — forms separados */}
<form action={formActionAtualizar}>
  {/* campos de papel, metas... */}
  <button type="submit">Salvar</button>
</form>

{/* Form separado para exclusão */}
<form action={formActionRemover}>
  <input type="hidden" name="membroId" value={membro.id} />
  <button
    type="submit"
    onClick={(e) => {
      if (!confirm("Tem certeza que deseja remover este membro?")) {
        e.preventDefault();
      }
    }}
  >
    Excluir
  </button>
</form>
```

**Por que separar:** No React 19, usar `formAction` em um botão dentro de um `<form>` que já tem `action` pode não funcionar como esperado, especialmente com Server Actions. O `formAction` deveria sobrescrever o `action` do form, mas Turbopack pode não processar isso corretamente. Forms separados eliminam a ambiguidade.

---

## Ordem de Execução

Implementar na seguinte sequência (cada passo depende do anterior):

```
PASSO 1 ─ app/auth/callback/route.ts
  ├── Criar o route handler GET
  ├── Implementar exchangeCodeForSession
  ├── Redirecionar para /redefinir-senha (reset) ou /dashboard (genérico)
  └── Testar: acessar /auth/callback?code=fake → deve redirecionar para /login (sem erro 404)

PASSO 2 ─ app/(auth)/redefinir-senha/page.tsx
  ├── Criar a página com formulário
  ├── Dois campos: nova senha + confirmação
  ├── Validação client-side (senhas iguais)
  └── Testar: acessar /redefinir-senha → deve renderizar o formulário

PASSO 3 ─ updatePasswordAction em app/actions/auth.ts
  ├── Criar a server action
  ├── Validar senha (min 6 chars, confirmação igual)
  ├── Chamar supabase.auth.updateUser({ password })
  ├── Redirecionar para /dashboard
  └── Testar: fluxo completo de reset (email → callback → form → dashboard)

PASSO 4 ─ convidarMembro refatorado em app/actions/empresa.ts
  ├── Substituir busca em `usuarios` por inviteUserByEmail
  ├── Tratar caso de email já existente (vincular direto)
  ├── Garantir que createAdminClient() existe
  ├── Adicionar lógica de convite no callback (criarVinculoSeConvite)
  └── Testar: convidar email novo → deve receber email → clicar → cair em /redefinir-senha

PASSO 5 ─ atualizarAuthMembro + membros-tab.tsx
  ├── Verificar que auth_user_id é retornado nas queries de membros
  ├── Criar atualizarAuthMembro em empresa.ts
  ├── Adicionar campos email/senha no formulário de edição
  ├── Separar botão Excluir em <form> próprio
  └── Testar: admin edita email de membro → email atualizado no Supabase Auth
```

---

## Checklist de Validação

Ao finalizar a implementação, validar **todos** os cenários abaixo:

### Reset de senha
- [ ] Clicar em "Esqueci minha senha" no login → email é recebido
- [ ] Clicar no link do email → chega em `/redefinir-senha` (não 404)
- [ ] Preencher senhas diferentes → erro "As senhas não coincidem"
- [ ] Preencher senha < 6 chars → erro de validação
- [ ] Preencher senha válida → redireciona para `/dashboard`
- [ ] Tentar acessar `/redefinir-senha` sem sessão → comportamento gracioso (redirect para login ou erro amigável)

### Convite de membro
- [ ] Convidar email que **não existe** no Supabase → email de convite é enviado
- [ ] Convidado clica no link → chega em `/redefinir-senha`
- [ ] Após criar senha, o registro `usuario_empresa` existe com `empresa_id` e `papel` corretos
- [ ] Convidar email que **já existe** no Supabase → vínculo direto criado (sem email)
- [ ] Convidar email que **já é membro** da empresa → erro "já é membro"

### Edição de auth do membro
- [ ] Admin vê campos opcionais de email/senha na edição do membro
- [ ] Admin altera email → email atualizado no Auth e na tabela `usuarios`
- [ ] Admin altera senha → senha atualizada no Auth
- [ ] Não-admin tenta alterar → erro de permissão
- [ ] Botão Excluir funciona independentemente do formulário de edição
- [ ] Botão Excluir pede confirmação antes de executar

### Regressão
- [ ] Login normal continua funcionando
- [ ] Cadastro normal continua funcionando
- [ ] Logout continua funcionando
- [ ] Middleware não bloqueia `/auth/callback`
