# Plano 1: Fundação (OPME.AI dentro do app + login por perfil)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trazer as telas do OPME.AI (Compras e Gerente de compras) para dentro do protótipo SurgiFlow e criar um login único por perfil, para que o app tenha um ponto de entrada só.

**Architecture:**
- O frontend do OPME.AI é copiado para `src/opme/`, com o alias `@opme/*`. Ele continua usando o seu próprio banco simulado (`mockFetch`), os seus contextos e o seu tema.
- As rotas dele entram como uma *layout route* (`OpmeShell`), que envolve as páginas com os providers do OPME e uma `div.opme-theme`. O tema e a fonte dele ficam confinados a essa div e não vazam para as telas do SurgiFlow.
- O login passa a escolher o perfil, e cada perfil tem uma rota inicial.

**Tech Stack:** React 18, Vite 5, TypeScript, Tailwind 3, shadcn/Radix, React Router 6 (HashRouter), Vitest + Testing Library.

**Spec:** [docs/superpowers/specs/2026-10-14-plataforma-unificada-design.md](../specs/2026-10-14-plataforma-unificada-design.md)

---

## Roteiro geral (5 planos em sequência)

Cada plano é escrito depois que o anterior termina, usando os nomes reais criados nele.

1. **Fundação (este plano):** o OPME.AI dentro do app, o login por perfil e o tema isolado.
2. **Domínio comum:**
   - contratos (médico–hospital e operadora), padrões por procedimento (versões, leque por operadora, protocolo, codificação, regras de complemento), sugestões de alteração;
   - um **store de pedidos compartilhado**, para que um pedido montado no wizard apareça na fila de Compras;
   - o motor de cálculo: honorário, complemento por condições, conformidade, teto e margem, liberação e previsão de recebimento.
3. **Médico e secretária:**
   - o wizard novo (pedido sugerido pelo hospital, codificação, itens só permitidos, "fora do protocolo", modal do protocolo, resumo com conformidade);
   - a home do médico com a previsão de recebimento;
   - as novas colunas da secretária.
4. **Gestão + consultoria:** Home (KPIs, recortes, balanceamento, fontes de dados, ganho gerado, BI de fora do padrão), Comissão (catálogo, montagem, complemento), Contratos com a tabela de previsibilidade, Consultoria (com Insights e Resultados do OPME.AI) e Configuração.
5. **Compras novo + consultor:** as 7 novidades do OPME.AI e o perfil Consultor (carteira, benchmark, comercial).

---

## Global Constraints

- **Não commitar nem dar push sem autorização explícita do Luís.** Os passos "Commit" abaixo só rodam se ele autorizar nesta execução; senão, ficam pulados.
- **Fonte do OPME.AI (somente leitura, nunca editar):** `C:\Users\luis\Desktop\Tec\Trabalhos\Valorian\opme-board-ace\frontend\src`.
- **Não trazer o backend legado do OPME.AI** (FastAPI, Rocketry, robôs): só o frontend, em modo mock.
- **Manter o HashRouter** e o build do GitHub Pages (`GITHUB_PAGES=true` → `base: /remix-of-surgiflow-pro/`).
- **As rotas do OPME.AI mantêm os caminhos originais**, sem prefixo: `/dashboard`, `/paciente/:id`, `/bi/procedimento/:pacienteId`, `/acompanhamento`, `/insights`, `/bi-geral`, `/configuracoes`. Elas não colidem com as do SurgiFlow (`/`, `/select-doctor`, `/home`, `/wizard`, `/analises`, `/medico/*`, `/hospital`).
- **Textos da interface em português.**
- **Nenhuma regressão no SurgiFlow:** `npx vitest run` e `npx tsc --noEmit -p tsconfig.app.json` continuam passando.

## Review Focus

1. **Navegar entre as telas do OPME.AI** (Lista de compras → pedido → Acompanhamento) não pode perder as escolhas e otimizações já feitas. Por isso os providers ficam numa layout route, que não remonta (Task 3).
2. **A fonte DM Sans, as cores e os espaçamentos do OPME.AI não podem vazar** para as telas do SurgiFlow, nem as do SurgiFlow para as do OPME. O espaçamento é o ponto mais perigoso: o `spacing` do OPME usa variáveis que só existem em `.opme-theme` (Task 2).
3. **"Sair" dentro do OPME.AI** leva ao login unificado, sem tela de login própria do OPME (Task 3).
4. **Abrir `/#/dashboard` direto** (link ou recarregar a página) funciona sem passar pelo login do OPME (Tasks 1 e 3).
5. **O build do GitHub Pages** continua gerando os assets do OPME com o caminho base correto (Task 2).

---

## Mapa de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `scripts/port-opme.py` (novo) | Copia o frontend do OPME.AI para `src/opme/`, reescreve os imports `@/` → `@opme/` e aplica os ajustes de integração. Pode ser rodado de novo se o OPME.AI evoluir. |
| `src/opme/**` (novo, gerado) | Cópia do OPME.AI (componentes, contextos, mock, páginas, tipos, libs, hooks, serviços, utils, config). |
| `src/opme/opme.css` (novo, gerado) | O tema do OPME.AI confinado em `.opme-theme`. |
| `src/opme/OpmeShell.tsx` (novo) | Layout route: os providers do OPME + `div.opme-theme` + Toaster do OPME + `<Outlet/>`. |
| `src/opme/rotas.tsx` (novo) | Lista das rotas do OPME.AI e o elemento de cada uma. |
| `src/lib/perfis.ts` (novo) | Tipo `Perfil`, rótulos e `rotaInicial(perfil)`. |
| `vite.config.ts`, `vitest.config.ts`, `tsconfig.json`, `tsconfig.app.json` | Alias `@opme`. |
| `tailwind.config.ts` | Cores extras usadas pelo OPME.AI. |
| `src/main.tsx` | Importa `src/opme/opme.css`. |
| `src/App.tsx` | Monta as rotas do OPME dentro do `OpmeShell`. |
| `src/contexts/SurgicalContext.tsx` | Guarda o perfil logado. |
| `src/pages/Login.tsx` | Um botão por perfil. |
| `src/test/opme-mock.test.ts`, `src/test/perfis.test.ts`, `src/test/opme-rotas.test.ts`, `src/test/login.test.tsx` (novos) | Testes. |

---

### Task 1: Copiar o OPME.AI para `src/opme` com o alias `@opme`

**Files:**
- Create: `scripts/port-opme.py`
- Create (gerado): `src/opme/**`
- Modify: `vite.config.ts`, `vitest.config.ts`, `tsconfig.json`, `tsconfig.app.json`
- Test: `src/test/opme-mock.test.ts`

**Interfaces:**
- Produces:
  - o alias `@opme/*` → `src/opme/*`;
  - `mockFetch(input, init): Promise<Response>` em `@opme/mock/api`;
  - `IS_MOCK === true` em `@opme/config/produto`;
  - `AuthProvider` do OPME começa autenticado como `opme.demo`;
  - `ProtectedRoute` do OPME só repassa os filhos.

- [ ] **Step 1: Escrever o teste que falha**

`src/test/opme-mock.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { mockFetch } from "@opme/mock/api";
import { IS_MOCK } from "@opme/config/produto";

describe("OPME.AI portado", () => {
  it("roda sempre em modo mock", () => {
    expect(IS_MOCK).toBe(true);
  });

  it("o banco simulado devolve cirurgias", async () => {
    const res = await mockFetch("/get_surgeries_by_page?page=1&number_of_results=5");
    expect(res.status).toBe(200);
    const lista = await res.json();
    expect(Array.isArray(lista)).toBe(true);
    expect(lista.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/test/opme-mock.test.ts`
Expected: FAIL com `Failed to resolve import "@opme/mock/api"`.

- [ ] **Step 3: Criar o script de port**

`scripts/port-opme.py`:
```python
"""Copia o frontend do OPME.AI para src/opme e ajusta a integração.

Uso: python scripts/port-opme.py
Pode ser rodado de novo: apaga e recria src/opme (exceto os arquivos escritos à mão).
"""
import re
import shutil
from pathlib import Path

ORIGEM = Path(r"C:\Users\luis\Desktop\Tec\Trabalhos\Valorian\opme-board-ace\frontend\src")
DESTINO = Path(__file__).resolve().parent.parent / "src" / "opme"
PASTAS = ["components", "config", "contexts", "data", "hooks", "lib", "mock", "pages", "services", "types", "utils"]
# Escritos à mão neste repo; o script nunca apaga nem sobrescreve
MANUAIS = {"OpmeShell.tsx", "rotas.tsx"}
# Páginas que o app unificado não usa (o login é o do SurgiFlow)
IGNORAR = {Path("pages/Login.tsx"), Path("pages/NotFound.tsx")}

IMPORT_RE = re.compile(r"""(from\s+["']|import\(\s*["']|import\s+["'])@/""")


def limpar_destino():
    if not DESTINO.exists():
        DESTINO.mkdir(parents=True)
        return
    for item in DESTINO.iterdir():
        if item.name in MANUAIS:
            continue
        if item.is_dir():
            shutil.rmtree(item)
        else:
            item.unlink()


def copiar():
    for pasta in PASTAS:
        for arq in (ORIGEM / pasta).rglob("*"):
            if not arq.is_file():
                continue
            rel = arq.relative_to(ORIGEM)
            if rel in IGNORAR:
                continue
            alvo = DESTINO / rel
            alvo.parent.mkdir(parents=True, exist_ok=True)
            if arq.suffix in {".ts", ".tsx"}:
                texto = arq.read_text(encoding="utf-8")
                alvo.write_text(IMPORT_RE.sub(r"\1@opme/", texto), encoding="utf-8")
            else:
                shutil.copy2(arq, alvo)


def substituir(rel: str, antes: str, depois: str):
    arq = DESTINO / rel
    texto = arq.read_text(encoding="utf-8")
    if antes not in texto:
        raise SystemExit(f"Trecho não encontrado em {rel}: {antes[:60]!r}")
    arq.write_text(texto.replace(antes, depois, 1), encoding="utf-8")


def ajustes():
    # Sempre mock: não há backend no protótipo
    substituir("config/produto.ts",
               'export const IS_MOCK = import.meta.env.VITE_MOCK === "true";',
               "export const IS_MOCK = true;")
    # O login é o do SurgiFlow: o contexto do OPME já nasce autenticado
    substituir("contexts/AuthContext.tsx",
               "const [isAuthenticated, setIsAuthenticated] = useState(false);",
               "const [isAuthenticated, setIsAuthenticated] = useState(true);")
    substituir("contexts/AuthContext.tsx",
               "const [username, setUsername] = useState<string | null>(null);",
               'const [username, setUsername] = useState<string | null>("opme.demo");')
    substituir("contexts/AuthContext.tsx",
               "const [loading, setLoading] = useState(true);",
               "const [loading, setLoading] = useState(false);")
    (DESTINO / "components" / "ProtectedRoute.tsx").write_text(
        '// No app unificado o acesso é decidido pelo login por perfil do SurgiFlow.\n'
        'const ProtectedRoute = ({ children }: { children: React.ReactNode }) => <>{children}</>;\n\n'
        'export default ProtectedRoute;\n',
        encoding="utf-8",
    )


if __name__ == "__main__":
    limpar_destino()
    copiar()
    ajustes()
    print(f"OPME.AI copiado para {DESTINO}")
```

- [ ] **Step 4: Rodar o script**

Run: `python scripts/port-opme.py`
Expected: `OPME.AI copiado para ...\src\opme`. A pasta `src/opme/` tem `components config contexts data hooks lib mock pages services types utils`.

- [ ] **Step 5: Adicionar o alias `@opme` nos quatro arquivos de configuração**

Em `vite.config.ts`, dentro de `resolve.alias`:
```ts
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@opme": path.resolve(__dirname, "./src/opme"),
    },
  },
```

Em `vitest.config.ts`:
```ts
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@opme": path.resolve(__dirname, "./src/opme"),
    },
  },
```

Em `tsconfig.json` e em `tsconfig.app.json`, dentro de `paths`:
```json
    "paths": {
      "@/*": ["./src/*"],
      "@opme/*": ["./src/opme/*"]
    },
```

- [ ] **Step 6: Rodar o teste e ver passar**

Run: `npx vitest run src/test/opme-mock.test.ts`
Expected: PASS (2 testes).

- [ ] **Step 7: Checar tipos do projeto inteiro**

Run: `npx tsc --noEmit -p tsconfig.app.json`
Expected: nenhum erro.

Se aparecer erro de uma dependência que existe no OPME.AI e não aqui, compare as `dependencies` dos dois `package.json`, instale só a que falta com a mesma versão do OPME.AI (`npm install <pacote>@<versão>`) e rode de novo.

- [ ] **Step 8: Commit** (só com autorização)

```bash
git add scripts/port-opme.py src/opme vite.config.ts vitest.config.ts tsconfig.json tsconfig.app.json src/test/opme-mock.test.ts
git commit -m "feat: traz o frontend do OPME.AI para src/opme (modo mock)"
```

---

### Task 2: Tema do OPME.AI confinado em `.opme-theme`

**Files:**
- Modify: `scripts/port-opme.py` (gera `src/opme/opme.css`)
- Modify: `tailwind.config.ts`
- Modify: `src/main.tsx`
- Test: checagem no CSS gerado pelo build

**Interfaces:**
- Produces: a classe `.opme-theme`. Qualquer elemento dentro dela usa as variáveis, a fonte e as cores do OPME.AI; fora dela nada muda.

- [ ] **Step 1: Escrever a checagem que falha**

Run (Git Bash):
```bash
GITHUB_PAGES=true npx vite build >/dev/null 2>&1; grep -l "opme-theme" dist/assets/*.css
```
Expected: nenhum arquivo listado (a classe ainda não existe).

- [ ] **Step 2: Gerar `opme.css` no script de port**

Acrescente a `scripts/port-opme.py`, antes do bloco `if __name__ == "__main__":`:
```python
def gerar_css():
    """Copia o index.css do OPME.AI confinado em .opme-theme."""
    css = (ORIGEM / "index.css").read_text(encoding="utf-8")
    # As diretivas do Tailwind já vêm do index.css do SurgiFlow
    css = re.sub(r"^@tailwind\s+\w+;\s*$", "", css, flags=re.M)
    # Fonte DM Sans só dentro do OPME
    css = css.replace(
        "* {\n  font-family: 'DM Sans'",
        ".opme-theme, .opme-theme * {\n  font-family: 'DM Sans'",
        1,
    )
    # Variáveis do tema só dentro do OPME
    css = css.replace(":root {", ".opme-theme {")
    css = re.sub(r"^(\s*)\.dark\s*\{", r"\1.dark .opme-theme {", css, flags=re.M)
    (DESTINO / "opme.css").write_text(css, encoding="utf-8")
```

E troque o bloco final por:
```python
if __name__ == "__main__":
    limpar_destino()
    copiar()
    ajustes()
    gerar_css()
    print(f"OPME.AI copiado para {DESTINO}")
```

Run: `python scripts/port-opme.py`
Expected: existe `src/opme/opme.css`, e `grep -c ":root" src/opme/opme.css` retorna `0`.

- [ ] **Step 3: Importar o CSS**

Em `src/main.tsx`, logo abaixo do import de `./index.css`:
```ts
import "./opme/opme.css";
```

- [ ] **Step 4: Acrescentar as cores do OPME.AI ao Tailwind**

Em `tailwind.config.ts`, dentro de `theme.extend.colors`:
- acrescente as chaves novas;
- **acrescente** os tons às chaves `secondary`, `warning` e `info` que já existem, mantendo `DEFAULT` e `foreground`.

O bloco final fica assim (as chaves `border` … `card`, `success` e `sidebar` continuam como estão):
```ts
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          300: "hsl(var(--secondary-300))",
          400: "hsl(var(--secondary-400))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
          100: "#FEF3C7",
          200: "#FDE68A",
          600: "hsl(var(--warning-600))",
          700: "hsl(var(--warning-700))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
          400: "hsl(var(--info-400))",
          500: "hsl(var(--info-500))",
        },
        // ---- Cores usadas pelas telas do OPME.AI (src/opme) ----
        neutral: {
          0: "hsl(var(--neutral-0))",
          50: "hsl(var(--neutral-50))",
          100: "hsl(var(--neutral-100))",
          200: "hsl(var(--neutral-200))",
          300: "hsl(var(--neutral-300))",
          400: "hsl(var(--neutral-400))",
          500: "hsl(var(--neutral-500))",
          600: "hsl(var(--neutral-600))",
          700: "hsl(var(--brand-neutral-700))",
          900: "hsl(var(--brand-neutral-900))",
        },
        cinza: {
          50: "#F7F8FA", 100: "#EEF0F3", 200: "#E1E4E9", 300: "#C9CED6", 400: "#9DA5B2",
          500: "#7A8394", 600: "#636D80", 700: "#3F4757", 800: "#2A303B", 900: "#1B1F27",
        },
        surface: "#FFFFFF",
        status: {
          "success-bg": "#ECFDF5", "success-text": "#047857", "success-border": "#A7F3D0",
          "warning-bg": "#FFFBEB", "warning-text": "#B45309",
          "error-bg": "#FEF2F2", "error-text": "#B91C1C",
        },
        brand: {
          azul: "#008DDF",
          primary: "hsl(var(--brand-primary))",
          100: "hsl(var(--brand-100))",
          200: "hsl(var(--brand-200))",
          300: "hsl(var(--brand-300))",
          400: "hsl(var(--brand-400))",
          500: "hsl(var(--brand-500))",
          600: "hsl(var(--brand-primary-600))",
          success: "hsl(var(--brand-success))",
          warning: "hsl(var(--brand-warning))",
          danger: "hsl(var(--brand-danger))",
          info: "hsl(var(--brand-info))",
          surface: "hsl(var(--brand-surface))",
          "surface-2": "hsl(var(--brand-surface-2))",
        },
        danger: {
          400: "hsl(var(--danger-400))",
          500: "hsl(var(--danger-500))",
        },
```

Ainda em `theme.extend`, ao lado das chaves que já existem:
```ts
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        "elevation-1": "var(--shadow-elevation-1)",
        "elevation-hover": "var(--shadow-elevation-hover)",
        "elevation-modal": "var(--shadow-elevation-modal)",
      },
      screens: {
        xs: "475px",
      },
```

**Não copie** estas partes do `tailwind.config.ts` do OPME.AI:
- **`spacing` (1, 2, 3, 4, 6, 8):** usa `var(--spacing-N)`, que só existe dentro de `.opme-theme`. Fora dele, `p-4`, `gap-2` etc. do SurgiFlow ficariam sem valor. Os valores do OPME são iguais aos padrões do Tailwind (4, 8, 12, 16, 24 e 32 px), então nada se perde.
- **`fontFamily.sans` (DM Sans):** trocaria a fonte do app inteiro. A fonte do OPME já vem do `opme.css`, confinada em `.opme-theme`.
- **`screens` além de `xs`:** o `2xl` do OPME (1440px) mudaria o breakpoint do SurgiFlow (1536px).

O `content` do nosso `tailwind.config.ts` precisa cobrir `./src/**/*.{ts,tsx}` (e com isso `src/opme`). Confirme com `grep -n "content" tailwind.config.ts`.

- [ ] **Step 5: Rodar a checagem e ver passar**

Run (Git Bash):
```bash
GITHUB_PAGES=true npx vite build >/dev/null 2>&1 && grep -l "opme-theme" dist/assets/*.css && grep -c "\*{font-family:DM Sans" dist/assets/*.css
```
Expected:
- o primeiro `grep` lista o CSS do build;
- o segundo retorna `0`: a fonte não ficou global;
- o build termina sem erro e `dist/index.html` referencia `/remix-of-surgiflow-pro/assets/…`.

- [ ] **Step 6: Testes e tipos continuam verdes**

Run: `npx vitest run && npx tsc --noEmit -p tsconfig.app.json`
Expected: tudo PASS, sem erros de tipo.

- [ ] **Step 7: Commit** (só com autorização)

```bash
git add scripts/port-opme.py src/opme/opme.css src/main.tsx tailwind.config.ts
git commit -m "feat: tema do OPME.AI confinado em .opme-theme"
```

---

### Task 3: Rotas do OPME.AI dentro do app, com providers persistentes

**Files:**
- Create: `src/opme/OpmeShell.tsx`
- Create: `src/opme/rotas.tsx`
- Modify: `src/App.tsx`
- Modify: `scripts/port-opme.py` (a barra lateral passa a mostrar só Compras e Gerente de compras)
- Test: `src/test/opme-rotas.test.ts`

**Interfaces:**
- Consumes: os providers e as páginas de `@opme/*` (Task 1).
- Produces:
  - `OpmeShell` (layout route com `<Outlet/>`);
  - `OPME_ROTAS: { path: string; element: JSX.Element }[]`;
  - `OPME_CAMINHOS: string[]` (os caminhos de `OPME_ROTAS`), usados no teste e pelos planos seguintes.

- [ ] **Step 1: Escrever o teste que falha**

`src/test/opme-rotas.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { OPME_CAMINHOS } from "@opme/rotas";

const ROTAS_SURGIFLOW = ["/", "/select-doctor", "/home", "/wizard", "/analises", "/medico", "/hospital"];

describe("rotas do OPME.AI no app unificado", () => {
  it("expõe as telas de Compras e Gerente com os caminhos originais", () => {
    expect(OPME_CAMINHOS).toEqual(
      expect.arrayContaining(["/dashboard", "/bi/procedimento/:pacienteId", "/paciente/:id", "/acompanhamento"]),
    );
  });

  it("não colide com nenhuma rota do SurgiFlow", () => {
    for (const caminho of OPME_CAMINHOS) {
      expect(ROTAS_SURGIFLOW.some((r) => caminho === r || (r !== "/" && caminho.startsWith(r + "/")))).toBe(false);
    }
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/test/opme-rotas.test.ts`
Expected: FAIL com `Failed to resolve import "@opme/rotas"`.

- [ ] **Step 3: Criar o `OpmeShell`**

`src/opme/OpmeShell.tsx`:
```tsx
import { Outlet } from "react-router-dom";
import { AuthProvider } from "@opme/contexts/AuthContext";
import { HospitalProvider } from "@opme/contexts/HospitalContext";
import { ConfigProvider } from "@opme/contexts/ConfigContext";
import { EscolhasProvider } from "@opme/contexts/EscolhasContext";
import { OtimizadorProvider } from "@opme/contexts/OtimizadorContext";
import { FilterProvider } from "@opme/contexts/FilterContext";
import { Toaster } from "@opme/components/ui/toaster";
import { Toaster as Sonner } from "@opme/components/ui/sonner";

/**
 * Layout das telas do OPME.AI (Compras e Gerente de compras).
 * Fica montado enquanto se navega entre elas, para não perder escolhas e otimizações.
 */
const OpmeShell = () => (
  <AuthProvider>
    <HospitalProvider>
      <ConfigProvider>
        <EscolhasProvider>
          <OtimizadorProvider>
            <FilterProvider>
              <div className="opme-theme min-h-screen bg-background text-foreground">
                <Toaster />
                <Sonner />
                <Outlet />
              </div>
            </FilterProvider>
          </OtimizadorProvider>
        </EscolhasProvider>
      </ConfigProvider>
    </HospitalProvider>
  </AuthProvider>
);

export default OpmeShell;
```

- [ ] **Step 4: Criar a lista de rotas**

`src/opme/rotas.tsx`:
```tsx
import Index from "@opme/pages/Index";
import PatientDetail from "@opme/pages/PatientDetail";
import BIProcedimento from "@opme/pages/BIProcedimento";
import Acompanhamento from "@opme/pages/Acompanhamento";
import Insights from "@opme/pages/Insights";
import BIGeral from "@opme/pages/BIGeral";
import Configuracoes from "@opme/pages/Configuracoes";

/**
 * Rotas do OPME.AI com os caminhos originais.
 * Insights, Resultados e Configurações continuam acessíveis por URL; no Plano 4 passam para a Gestão.
 */
export const OPME_ROTAS = [
  { path: "/dashboard", element: <Index /> },
  { path: "/paciente/:id", element: <PatientDetail /> },
  { path: "/bi/procedimento/:pacienteId", element: <BIProcedimento /> },
  { path: "/acompanhamento", element: <Acompanhamento /> },
  { path: "/insights", element: <Insights /> },
  { path: "/bi-geral", element: <BIGeral /> },
  { path: "/configuracoes", element: <Configuracoes /> },
];

export const OPME_CAMINHOS = OPME_ROTAS.map((r) => r.path);
```

- [ ] **Step 5: Montar no `App.tsx`**

Em `src/App.tsx`, acrescente os imports:
```tsx
import OpmeShell from "@/opme/OpmeShell";
import { OPME_ROTAS } from "@/opme/rotas";
```

Acrescente o bloco imediatamente **antes** de `<Route path="*" element={<NotFound />} />`:
```tsx
            <Route element={<OpmeShell />}>
              {OPME_ROTAS.map((r) => (
                <Route key={r.path} path={r.path} element={r.element} />
              ))}
            </Route>
```

- [ ] **Step 6: A barra lateral do OPME mostra só Compras e Gerente de compras**

Acrescente a `ajustes()` em `scripts/port-opme.py`:
```python
    # O módulo Comercial vai para a Gestão (Plano 4); aqui ficam Compras e Gerente de compras
    substituir("components/Sidebar.tsx",
               """  {
    nome: "Estratégico",
    area: "Comercial",
    itens: [
      { path: "/insights", label: "Insights", icon: Lightbulb },
      { path: "/bi-geral", label: "Resultados", icon: BarChart3 },
    ],
  },
""",
               "")
```

Run: `python scripts/port-opme.py`
Expected: termina sem "Trecho não encontrado"; `grep -c "Estratégico" src/opme/components/Sidebar.tsx` retorna `0`.

- [ ] **Step 7: Rodar os testes e ver passar**

Run: `npx vitest run && npx tsc --noEmit -p tsconfig.app.json`
Expected: tudo PASS, sem erros de tipo.

- [ ] **Step 8: Conferir no navegador**

Com `npm run dev` rodando:
1. Abra `http://localhost:8080/#/dashboard` direto. A Lista de compras do OPME aparece com a fonte DM Sans e a barra lateral azul, sem pedir login.
2. Abra uma cirurgia, faça uma escolha de fornecedor, volte para a Lista de compras e entre em Acompanhamento. Ao voltar, a escolha continua lá.
3. Clique em "Sair". Ele leva para o login do SurgiFlow (`/#/`).
4. Abra `http://localhost:8080/#/home`. As telas do SurgiFlow continuam com a fonte e as cores de antes.

- [ ] **Step 9: Commit** (só com autorização)

```bash
git add src/opme/OpmeShell.tsx src/opme/rotas.tsx src/App.tsx scripts/port-opme.py src/opme/components/Sidebar.tsx src/test/opme-rotas.test.ts
git commit -m "feat: rotas do OPME.AI no app unificado"
```

---

### Task 4: Login único por perfil

**Files:**
- Create: `src/lib/perfis.ts`
- Modify: `src/contexts/SurgicalContext.tsx`
- Modify: `src/pages/Login.tsx`
- Test: `src/test/perfis.test.ts`, `src/test/login.test.tsx`

**Interfaces:**
- Consumes: as rotas `/dashboard` e `/acompanhamento` (Task 3).
- Produces:
  - `type Perfil = "gestao" | "medico" | "secretaria" | "compras" | "gerente_compras"`;
  - `PERFIS: { id: Perfil; label: string; descricao: string }[]`;
  - `rotaInicial(perfil: Perfil): string`;
  - no contexto, `perfil: Perfil | null` e `setPerfil(p: Perfil | null): void` em `useSurgical()`.
  - O perfil "consultor" entra no Plano 5.

- [ ] **Step 1: Escrever os testes que falham**

`src/test/perfis.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { PERFIS, rotaInicial } from "@/lib/perfis";

describe("perfis", () => {
  it("cada perfil tem uma rota inicial", () => {
    expect(rotaInicial("gestao")).toBe("/hospital");
    expect(rotaInicial("medico")).toBe("/medico");
    expect(rotaInicial("secretaria")).toBe("/home");
    expect(rotaInicial("compras")).toBe("/dashboard");
    expect(rotaInicial("gerente_compras")).toBe("/acompanhamento");
  });

  it("lista os cinco perfis na ordem do login", () => {
    expect(PERFIS.map((p) => p.id)).toEqual(["gestao", "medico", "secretaria", "compras", "gerente_compras"]);
  });
});
```

`src/test/login.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { SurgicalProvider } from "@/contexts/SurgicalContext";
import Login from "@/pages/Login";

const renderLogin = () =>
  render(
    <SurgicalProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<p>tela de compras</p>} />
        </Routes>
      </HashRouter>
    </SurgicalProvider>,
  );

describe("login por perfil", () => {
  it("mostra um botão por perfil", () => {
    window.location.hash = "#/";
    renderLogin();
    for (const nome of ["Gestão", "Médico", "Secretária", "Compras", "Gerente de compras"]) {
      expect(screen.getByRole("button", { name: new RegExp(`^${nome}`, "i") })).toBeInTheDocument();
    }
  });

  it("entrar como Compras leva para a lista de compras", () => {
    window.location.hash = "#/";
    renderLogin();
    fireEvent.click(screen.getByRole("button", { name: /^Compras/i }));
    expect(screen.getByText("tela de compras")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/test/perfis.test.ts src/test/login.test.tsx`
Expected: FAIL. O primeiro falha com `Failed to resolve import "@/lib/perfis"`; o segundo porque os botões "Gestão", "Compras" e "Gerente de compras" não existem.

- [ ] **Step 3: Criar `src/lib/perfis.ts`**

```ts
export type Perfil = "gestao" | "medico" | "secretaria" | "compras" | "gerente_compras";

export const PERFIS: { id: Perfil; label: string; descricao: string }[] = [
  { id: "gestao", label: "Gestão", descricao: "Diretoria e consultoria do hospital" },
  { id: "medico", label: "Médico", descricao: "Monta e valida pedidos" },
  { id: "secretaria", label: "Secretária", descricao: "Monta pedidos para o médico" },
  { id: "compras", label: "Compras", descricao: "Revisa pedidos e otimiza a compra" },
  { id: "gerente_compras", label: "Gerente de compras", descricao: "Acompanha a equipe de compras" },
];

const ROTA_INICIAL: Record<Perfil, string> = {
  gestao: "/hospital",
  medico: "/medico",
  secretaria: "/home",
  compras: "/dashboard",
  gerente_compras: "/acompanhamento",
};

export const rotaInicial = (perfil: Perfil): string => ROTA_INICIAL[perfil];
```

- [ ] **Step 4: Guardar o perfil no contexto**

Em `src/contexts/SurgicalContext.tsx`:
1. Acrescente `import type { Perfil } from "@/lib/perfis";`.
2. Acrescente na interface `SurgicalContextType`:
   ```ts
   perfil: Perfil | null;
   setPerfil: (perfil: Perfil | null) => void;
   ```
3. Dentro de `SurgicalProvider`, junto dos outros `useState`:
   ```ts
   const [perfil, setPerfil] = useState<Perfil | null>(null);
   ```
4. Acrescente `perfil, setPerfil` ao objeto `value` do `SurgicalContext.Provider`.

- [ ] **Step 5: Login com um botão por perfil**

Em `src/pages/Login.tsx`:

1. Troque os imports de ícones e acrescente os de perfis:
   ```tsx
   import { Lock, Mail, Activity, Stethoscope, ClipboardList, Building2, ShoppingCart, UserCheck, type LucideIcon } from "lucide-react";
   import { PERFIS, rotaInicial, type Perfil } from "@/lib/perfis";

   const ICONE: Record<Perfil, LucideIcon> = {
     gestao: Building2,
     medico: Stethoscope,
     secretaria: ClipboardList,
     compras: ShoppingCart,
     gerente_compras: UserCheck,
   };
   ```

2. Troque `handleLogin` por:
   ```tsx
   const { setLoggedIn, updateState, setPerfil } = useSurgical();
   // ...
   const handleLogin = (e: React.FormEvent, perfil: Perfil) => {
     e.preventDefault();
     setLoggedIn(true);
     setPerfil(perfil);
     if (perfil === "medico") {
       updateState({
         doctor: { id: "1", name: "Dr. Ricardo Almeida", specialty: "Ortopedia", crm: "CRM/SP 12345", active: true },
       });
     }
     navigate(rotaInicial(perfil));
   };
   ```
   (Remova a linha antiga `const { setLoggedIn, updateState } = useSurgical();`.)

3. Troque o bloco `<div className="space-y-3 pt-2"> … </div>` (os botões Secretária, Médico e Hospital) por:
   ```tsx
            <div className="space-y-3 pt-2">
              <p className="text-xs text-muted-foreground text-center">Entrar como:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PERFIS.map((p) => {
                  const Icone = ICONE[p.id];
                  return (
                    <Button
                      key={p.id}
                      type="button"
                      variant={p.id === "gestao" ? "default" : "outline"}
                      onClick={(e) => handleLogin(e, p.id)}
                      className="h-auto py-3 justify-start text-left"
                    >
                      <Icone className="w-4 h-4 mr-2 shrink-0" />
                      <span className="flex flex-col">
                        <span className="text-sm font-semibold">{p.label}</span>
                        <span className="text-[11px] font-normal opacity-70">{p.descricao}</span>
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>
   ```

- [ ] **Step 6: Rodar os testes e ver passar**

Run: `npx vitest run && npx tsc --noEmit -p tsconfig.app.json`
Expected: tudo PASS, sem erros de tipo.

- [ ] **Step 7: Conferir no navegador**

Em `http://localhost:8080/#/`:
- **Gestão** → `/hospital`;
- **Médico** → `/medico`;
- **Secretária** → `/home`;
- **Compras** → Lista de compras do OPME;
- **Gerente de compras** → Acompanhamento do OPME.

O "Sair" do OPME volta ao login, e o login abre em telas de 375px de largura sem rolagem horizontal.

- [ ] **Step 8: Commit** (só com autorização)

```bash
git add src/lib/perfis.ts src/contexts/SurgicalContext.tsx src/pages/Login.tsx src/test/perfis.test.ts src/test/login.test.tsx
git commit -m "feat: login único por perfil"
```

---

## Fim do Plano 1: critérios de pronto

- [ ] `npx vitest run`: todos os testes passam (os antigos e os 4 arquivos novos).
- [ ] `npx tsc --noEmit -p tsconfig.app.json`: sem erros.
- [ ] `GITHUB_PAGES=true npx vite build`: termina sem erro.
- [ ] No navegador, os 5 perfis entram nas telas certas; Compras e Gerente funcionam como no OPME.AI original; as telas do SurgiFlow não mudaram de aparência.
- [ ] Depois disso, escrever o **Plano 2 (domínio comum)** usando os nomes reais criados aqui.
