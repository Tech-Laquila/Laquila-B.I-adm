# 📘 MANUAL DE SKILLS — Laquila B.I

> **Documento de referência.** As regras de comportamento do agente estão em `rules/laquila-bi.md`.
> Consulte este arquivo para identificar qual skill usar em cada situação.

---

## 🏗️ Stack do Projeto


| Camada | Tecnologia |
|--------|-----------|
| Framework | **Next.js 16** (App Router) |
| UI Runtime | **React 19** |
| Banco de Dados / Auth | **Supabase** (PostgreSQL + Auth SSR) |
| Linguagem | **TypeScript 5** (strict) |
| Estilo | **Tailwind CSS 4** + **Shadcn/UI** + **Radix UI** |
| Ícones | Lucide React |
| Datas | date-fns |
| Integração externa | **Meta Marketing API** (OAuth + `ads_read`) |
| Deploy | Vercel (futuro) |

---

## 🗺️ Mapa de Skills por Contexto

### 1. 🧱 Arquitetura e Planejamento

| Situação | Skill | Caminho |
|----------|-------|---------|
| Iniciar ou replanejar uma feature nova | `brainstorming` | `skills/brainstorming/SKILL.md` |
| Definir estrutura de componentes/módulos | `architecture` | `skills/architecture/SKILL.md` |
| Planejar com escopo bem definido | `concise-planning` | `skills/concise-planning/SKILL.md` |
| Escrever plano de implementação detalhado | `writing-plans` | `skills/writing-plans/SKILL.md` |
| Documentar decisões de arquitetura (ADRs) | `architecture-decision-records` | `skills/architecture-decision-records/SKILL.md` |
| Modelar domínio com DDD | `domain-driven-design` | `skills/domain-driven-design/SKILL.md` |

---

### 2. ⚛️ Frontend — Next.js + React

| Situação | Skill | Caminho |
|----------|-------|---------|
| Qualquer trabalho com App Router, Server/Client Components | **`nextjs-best-practices`** | `skills/nextjs-best-practices/SKILL.md` |
| Autenticação com Supabase Auth | **`nextjs-supabase-auth`** | `skills/nextjs-supabase-auth/SKILL.md` |
| Padrões de componentes React (hooks, estado, context) | `react-best-practices` | `skills/react-best-practices/SKILL.md` |
| Padrões avançados de estado React | `react-state-management` | `skills/react-state-management/SKILL.md` |
| Criar/refatorar componentes de UI | `react-ui-patterns` | `skills/react-ui-patterns/SKILL.md` |
| Design system, Tailwind CSS | `tailwind-patterns` | `skills/tailwind-patterns/SKILL.md` |
| Componentes Radix UI | `radix-ui-design-system` | `skills/radix-ui-design-system/SKILL.md` |
| Guidelines gerais de frontend | `frontend-dev-guidelines` | `skills/frontend-dev-guidelines/SKILL.md` |
| Otimização de performance frontend | `web-performance-optimization` | `skills/web-performance-optimization/SKILL.md` |
| Rotas dinâmicas e patterns avançados do App Router | `nextjs-app-router-patterns` | `skills/nextjs-app-router-patterns/SKILL.md` |

---

### 3. 🗄️ Backend — API Routes, Supabase, Banco de Dados

| Situação | Skill | Caminho |
|----------|-------|---------|
| Criar ou refatorar Route Handlers (`/api/*`) | `backend-dev-guidelines` | `skills/backend-dev-guidelines/SKILL.md` |
| Queries e operações no Supabase/PostgreSQL | `postgres-best-practices` | `skills/postgres-best-practices/SKILL.md` |
| Design de banco de dados (tabelas, relações) | `database-design` | `skills/database-design/SKILL.md` |
| Migrações SQL | `database-migrations-sql-migrations` | `skills/database-migrations-sql-migrations/SKILL.md` |
| APIs REST — princípios de design | `api-design-principles` | `skills/api-design-principles/SKILL.md` |
| Padrões Node.js para backend | `nodejs-best-practices` | `skills/nodejs-best-practices/SKILL.md` |
| Optimizar queries lentas | `database-optimizer` | `skills/database-optimizer/SKILL.md` |
| Segurança da API | `api-security-best-practices` | `skills/api-security-best-practices/SKILL.md` |

---

### 4. 🔐 Segurança

| Situação | Skill | Caminho |
|----------|-------|---------|
| Verificar segurança de endpoints / RLS | `api-security-best-practices` | `skills/api-security-best-practices/SKILL.md` |
| Auditoria geral de segurança | `security-auditor` | `skills/security-auditor/SKILL.md` |
| Análise de vulnerabilidades OWASP | `top-web-vulnerabilities` | `skills/top-web-vulnerabilities/SKILL.md` |
| Lidar com segredos, `.env`, tokens | `secrets-management` | `skills/secrets-management/SKILL.md` |
| XSS e injeção HTML | `xss-html-injection` | `skills/xss-html-injection/SKILL.md` |
| Conformidade LGPD / GDPR | `gdpr-data-handling` | `skills/gdpr-data-handling/SKILL.md` |

---

### 5. 🦺 TypeScript

| Situação | Skill | Caminho |
|----------|-------|---------|
| Erros de tipagem complexos, generics, módulos | **`typescript-expert`** | `skills/typescript-expert/SKILL.md` |
| Tipos avançados (utility types, mapped types) | `typescript-advanced-types` | `skills/typescript-advanced-types/SKILL.md` |
| Pro-tips gerais de TypeScript | `typescript-pro` | `skills/typescript-pro/SKILL.md` |

---

### 6. 🎨 UI/UX e Design

| Situação | Skill | Caminho |
|----------|-------|---------|
| Melhorar visual de uma página ou componente | `ui-ux-designer` | `skills/ui-ux-designer/SKILL.md` |
| Animações, dark mode, glassmorphism | `frontend-ui-dark-ts` | `skills/frontend-ui-dark-ts/SKILL.md` |
| Acessibilidade e WCAG | `accessibility-compliance-accessibility-audit` | `skills/accessibility-compliance-accessibility-audit/SKILL.md` |
| Design de KPI Dashboards | `kpi-dashboard-design` | `skills/kpi-dashboard-design/SKILL.md` |
| Componentes mobile-first | `mobile-design` | `skills/mobile-design/SKILL.md` |

---

### 7. 🧪 Testes e Qualidade

| Situação | Skill | Caminho |
|----------|-------|---------|
| Criar testes unitários | `unit-testing-test-generate` | `skills/unit-testing-test-generate/SKILL.md` |
| Corrigir testes quebrados | `test-fixing` | `skills/test-fixing/SKILL.md` |
| TDD (Test-Driven Development) | `tdd-workflow` | `skills/tdd-workflow/SKILL.md` |
| Testes E2E / navegador | `e2e-testing-patterns` | `skills/e2e-testing-patterns/SKILL.md` |
| Revisar qualidade do código | `code-review-excellence` | `skills/code-review-excellence/SKILL.md` |

---

### 8. 🐛 Debugging e Erros

| Situação | Skill | Caminho |
|----------|-------|---------|
| Erro desconhecido, exceção inesperada | `error-detective` | `skills/error-detective/SKILL.md` |
| Analisar stack trace | `error-debugging-error-trace` | `skills/error-debugging-error-trace/SKILL.md` |
| Debug sistemático de problemas complexos | `systematic-debugging` | `skills/systematic-debugging/SKILL.md` |
| Bugs específicos de TypeScript | `typescript-expert` | `skills/typescript-expert/SKILL.md` |
| Problemas de performance (lentidão) | `performance-engineer` | `skills/performance-engineer/SKILL.md` |

---

### 9. 📦 Refatoração e Manutenção

| Situação | Skill | Caminho |
|----------|-------|---------|
| Refatorar código legado ou confuso | `code-refactoring-refactor-clean` | `skills/code-refactoring-refactor-clean/SKILL.md` |
| Remover dívida técnica | `code-refactoring-tech-debt` | `skills/code-refactoring-tech-debt/SKILL.md` |
| Limpar codebase (dependências, código morto) | `codebase-cleanup-deps-audit` | `skills/codebase-cleanup-deps-audit/SKILL.md` |
| Revisão completa do código | `comprehensive-review-full-review` | `skills/comprehensive-review-full-review/SKILL.md` |

---

### 10. 📋 Documentação

| Situação | Skill | Caminho |
|----------|-------|---------|
| Gerar documentação de código | `code-documentation-doc-generate` | `skills/code-documentation-doc-generate/SKILL.md` |
| Explicar código existente | `code-documentation-code-explain` | `skills/code-documentation-code-explain/SKILL.md` |
| README ou guias técnicos | `readme` | `skills/readme/SKILL.md` |
| Escrever changelogs | `changelog-automation` | `skills/changelog-automation/SKILL.md` |

---

### 11. 🚀 Deploy e Infraestrutura

| Situação | Skill | Caminho |
|----------|-------|---------|
| Deploy na Vercel | `vercel-deployment` | `skills/vercel-deployment/SKILL.md` |
| Configurar variáveis de ambiente | `environment-setup-guide` | `skills/environment-setup-guide/SKILL.md` |
| CI/CD com GitHub Actions | `github-actions-templates` | `skills/github-actions-templates/SKILL.md` |
| Gestão de segredos em produção | `secrets-management` | `skills/secrets-management/SKILL.md` |

---

### 12. 📣 Meta Marketing API (Específico do Projeto)

| Situação | Skill | Caminho |
|----------|-------|---------|
| Implementar fluxo OAuth com Meta | `nextjs-supabase-auth` + `api-security-best-practices` | ver seções 2 e 4 |
| Lidar com tokens e segredos Meta | `secrets-management` | `skills/secrets-management/SKILL.md` |
| Integrar endpoints externos (APIs de terceiros) | `api-design-principles` | `skills/api-design-principles/SKILL.md` |
| Armazenar dados sensíveis de Ad Accounts | `gdpr-data-handling` + `postgres-best-practices` | ver seções 3 e 4 |

---

## 📁 Estrutura de Referência Rápida

```
antigravity-awesome-skills/skills/
├── nextjs-best-practices/SKILL.md
├── nextjs-supabase-auth/SKILL.md
├── typescript-expert/SKILL.md
├── react-best-practices/SKILL.md
├── postgres-best-practices/SKILL.md
├── api-security-best-practices/SKILL.md
├── secrets-management/SKILL.md
├── systematic-debugging/SKILL.md
├── tailwind-patterns/SKILL.md
├── radix-ui-design-system/SKILL.md
├── kpi-dashboard-design/SKILL.md
├── database-design/SKILL.md
├── code-refactoring-refactor-clean/SKILL.md
└── vercel-deployment/SKILL.md
```

---

*Última atualização: 2026-02-28 | Projeto: Laquila B.I*
