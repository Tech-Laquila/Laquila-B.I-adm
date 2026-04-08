# QA Fix Request: Fluxo de Redefinição de Senha

**Generated:** 2026-03-24T00:00:00Z
**QA Report Source:** Análise direta do código — `app/actions/auth.ts`, `app/auth/callback/route.ts`, `app/(auth)/redefinir-senha/page.tsx`, `lib/supabase/middleware.ts`
**Reviewer:** Quinn (Test Architect)

---

## Instructions for @dev

Fix ONLY the issues listed below. Do not add features or refactor unrelated code.

**Process:**

1. Leia cada issue com atenção
2. Corrija o problema específico descrito
3. Verifique usando os passos de verificação fornecidos
4. Marque o issue como corrigido neste documento
5. Execute todos os testes antes de marcar como completo

---

## Summary

| Severity | Count | Status                  |
| -------- | ----- | ----------------------- |
| HIGH     | 2     | Must fix before merge   |
| MEDIUM   | 2     | Should fix before merge |
| LOW      | 1     | Optional improvement    |

---

## Issues to Fix

### 1. [HIGH] Estado de sucesso morto — tela de confirmação nunca renderiza

**Issue ID:** FIX-RESET-001

**Location:** `app/(auth)/redefinir-senha/page.tsx:26` + `app/actions/auth.ts:112`

**Problem:**

A page verifica `state?.success` para exibir a tela de "Senha redefinida!":

```typescript
// redefinir-senha/page.tsx:26
if (state?.success) {
    return (
        <Card>...<CardTitle>Senha redefinida</CardTitle>...</Card>
    );
}
```

Mas a action nunca retorna `{ success }` — ela chama `redirect()` diretamente, que em Next.js lança `NEXT_REDIRECT` antes de qualquer `return`. O estado de sucesso **jamais é entregue ao componente**.

```typescript
// auth.ts:107-113
if (error) {
    return { error: "Não foi possível atualizar a senha. Tente novamente." };
}

redirect("/dashboard"); // ← termina aqui, state.success nunca chega ao cliente
```

**Expected:**

Duas opções válidas — escolha uma:

**Opção A** — Remover o bloco de sucesso da page (mantém redirect direto, remove dead code):
```typescript
// redefinir-senha/page.tsx — remover o bloco abaixo inteiro:
// if (state?.success) { return <Card>...</Card> }
```

**Opção B** — Retornar estado de sucesso e redirecionar via client (melhor UX):
```typescript
// auth.ts — substituir redirect() por return:
return { success: "Senha redefinida com sucesso!" };

// redefinir-senha/page.tsx — adicionar useEffect para redirecionar após sucesso:
useEffect(() => {
    if (state?.success) {
        const timer = setTimeout(() => router.push("/dashboard"), 2000);
        return () => clearTimeout(timer);
    }
}, [state?.success]);
```

**Verification:**

- [ ] Após submeter formulário com senha válida, o fluxo termina sem erro de console
- [ ] Se Opção A: usuário é redirecionado ao dashboard sem erros
- [ ] Se Opção B: tela de "Senha redefinida!" aparece por ~2s antes do redirect

**Status:** [ ] Fixed

---

### 2. [HIGH] Sem verificação de sessão em `updatePasswordAction` — erro genérico quando token expirado

**Issue ID:** FIX-RESET-002

**Location:** `app/actions/auth.ts:103-110`

**Problem:**

A action não verifica se existe sessão ativa antes de chamar `updateUser`. Se o usuário clicar no link de reset com o token expirado (após 1h), já usado, ou num browser diferente (sem o cookie de sessão), o Supabase retorna `AuthSessionMissingError` e o usuário vê apenas:

> "Não foi possível atualizar a senha. Tente novamente."

Sem nenhuma orientação para solicitar um novo link.

```typescript
// auth.ts:103-110
const supabase = await createClient();
const { error } = await supabase.auth.updateUser({ password });

if (error) {
    // ← não diferencia sessão ausente de outros erros
    return { error: "Não foi possível atualizar a senha. Tente novamente." };
}
```

**Expected:**

```typescript
// auth.ts — verificar sessão antes de atualizar
const supabase = await createClient();

const { data: { user } } = await supabase.auth.getUser();
if (!user) {
    return { error: "Sessão expirada ou inválida. Por favor, solicite um novo link de redefinição de senha." };
}

const { error } = await supabase.auth.updateUser({ password });

if (error) {
    console.error("Erro ao atualizar senha:", error.message);
    return { error: "Não foi possível atualizar a senha. Tente novamente." };
}
```

**Verification:**

- [ ] Acessar `/redefinir-senha` diretamente sem sessão → mensagem orientando novo link
- [ ] Token expirado → mensagem orientando novo link (não mensagem genérica)
- [ ] Sessão válida → senha atualizada normalmente

**Status:** [ ] Fixed

---

### 3. [MEDIUM] `/recuperar-senha` não protegida contra usuários já autenticados

**Issue ID:** FIX-RESET-003

**Location:** `lib/supabase/middleware.ts:35`

**Problem:**

O middleware só redireciona usuários autenticados das rotas `/login` e `/cadastro`. A rota `/recuperar-senha` não está incluída, então um usuário já logado pode disparar um email de reset desnecessariamente.

```typescript
// middleware.ts:35
const isAuthRoute = request.nextUrl.pathname.startsWith('/login')
                 || request.nextUrl.pathname.startsWith('/cadastro')
// ↑ '/recuperar-senha' e '/redefinir-senha' ausentes
```

**Expected:**

```typescript
const isAuthRoute = request.nextUrl.pathname.startsWith('/login')
                 || request.nextUrl.pathname.startsWith('/cadastro')
                 || request.nextUrl.pathname.startsWith('/recuperar-senha')
```

> **Nota:** `/redefinir-senha` deve permanecer acessível para usuários autenticados, pois é o destino do callback de reset.

**Verification:**

- [ ] Usuário logado acessando `/recuperar-senha` é redirecionado para `/dashboard`
- [ ] Usuário não logado acessando `/recuperar-senha` vê a página normalmente
- [ ] Usuário logado acessando `/redefinir-senha` ainda pode alterar a senha

**Status:** [ ] Fixed

---

### 4. [MEDIUM] Sem rate limiting em `forgotPasswordAction`

**Issue ID:** FIX-RESET-004

**Location:** `app/actions/auth.ts:65-81`

**Problem:**

O `loginAction` tem proteção contra força bruta (5 tentativas/min via `rateLimit`). O `forgotPasswordAction` não tem nenhum rate limiting, permitindo disparar emails em massa.

```typescript
// auth.ts:65 — forgotPasswordAction não tem limiter.check()
export async function forgotPasswordAction(...) {
    const email = formData.get("email") as string;
    if (!email) return { error: "E-mail é obrigatório." };
    // ↑ sem verificação de rate limit
```

**Expected:**

```typescript
export async function forgotPasswordAction(...) {
    try {
        await limiter.check(3, "forgot_password_rate_limit"); // 3 tentativas por minuto
    } catch {
        return { error: "Muitas tentativas. Tente novamente em alguns minutos." };
    }

    const email = formData.get("email") as string;
    // ... resto da função
```

> O `limiter` já está instanciado no arquivo (linha 17). Basta reutilizá-lo.

**Verification:**

- [ ] Mais de 3 requests em < 1 minuto retorna mensagem de rate limit
- [ ] Após 1 minuto, nova tentativa funciona normalmente

**Status:** [ ] Fixed

---

### 5. [LOW] `redirectTo` no forgotPassword usa header `origin` instável

**Issue ID:** FIX-RESET-005

**Location:** `app/actions/auth.ts:72-77`

**Problem:**

Em ambientes com proxy reverso (Vercel, Cloudflare, load balancer), o header `origin` pode ser `null` ou retornar o IP interno, resultando em uma `redirectTo` inválida. Se a URL não estiver na lista de "Allowed Redirect URLs" do Supabase, o link do email é ignorado.

```typescript
// auth.ts:72-73
const origin = headersList.get("origin") ?? `https://${headersList.get("host")}`;
// ↑ pode ser null ou IP interno em produção
```

**Expected:**

```typescript
const appUrl = process.env.NEXT_PUBLIC_APP_URL
    ?? headersList.get("origin")
    ?? `https://${headersList.get("host")}`;

await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/auth/callback`,
});
```

> `NEXT_PUBLIC_APP_URL` já está definida no `.env.example`. Garanta que também esteja configurada em produção.

**Verification:**

- [ ] Em desenvolvimento: link do email redireciona para `localhost:3000/auth/callback`
- [ ] Em produção: link do email redireciona para o domínio correto configurado em `NEXT_PUBLIC_APP_URL`

**Status:** [ ] Fixed

---

## Constraints

**CRITICAL: @dev deve seguir estas restrições:**

- [ ] Corrigir SOMENTE os issues listados acima
- [ ] NÃO adicionar novas features
- [ ] NÃO refatorar código não relacionado
- [ ] Executar linting antes de marcar como completo: `npm run lint`
- [ ] Executar type check antes de marcar como completo: `npm run typecheck`
- [ ] Atualizar a lista de arquivos modificados se novos arquivos forem criados

---

## After Fixing

1. Marque cada issue como corrigido neste documento (`[ ] Fixed` → `[x] Fixed`)
2. Solicitar re-review: `@qa *review redefinir-senha`

---

*Generated by Quinn (Test Architect) - AIOX QA System*
