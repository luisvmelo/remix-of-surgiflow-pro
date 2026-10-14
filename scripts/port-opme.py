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
MANUAIS = {"OpmeShell.tsx", "rotas.tsx", "embutido.tsx"}
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
    # Na Gestão as telas do OPME aparecem embutidas, sem a barra lateral própria;
    # e as Configurações de compras passaram para a aba Configuração da Gestão
    substituir("components/Sidebar.tsx",
               'import { BarChart3, ClipboardList, Lightbulb, LogOut, Settings, UserCheck, type LucideIcon } from "lucide-react";',
               'import { ClipboardCheck, ClipboardList, LogOut, UserCheck, type LucideIcon } from "lucide-react";')
    # Fila de revisão dos pedidos estruturados que chegam do wizard (src/compras)
    substituir("components/Sidebar.tsx",
               'itens: [{ path: "/dashboard", label: "Lista de compras", icon: ClipboardList, inclui: ["/bi/procedimento", "/paciente"] }],',
               'itens: [\n      { path: "/revisao", label: "Revisão de pedidos", icon: ClipboardCheck },\n'
               '      { path: "/dashboard", label: "Lista de compras", icon: ClipboardList, inclui: ["/bi/procedimento", "/paciente"] },\n    ],')
    # Aba Médico: preferências em primeiro lugar; estatísticas e ranking viram opcionais (desligados)
    substituir("config/produto.ts", "  rankingFornecedorMedico: true,\n  estatisticasMedico: true,",
               "  rankingFornecedorMedico: false,\n  estatisticasMedico: false,")
    substituir("pages/BIProcedimento.tsx",
               "const mostrarAbaMedico = config.estatisticasMedico || config.rankingFornecedorMedico;",
               "const mostrarAbaMedico = true;")
    substituir("pages/BIProcedimento.tsx", "Ranking de fornecedores (médico)", "Fornecedores mais usados pelo médico")
    substituir("components/Sidebar.tsx",
               'import { cn } from "@opme/lib/utils";',
               'import { cn } from "@opme/lib/utils";\nimport { useEmbutido } from "@opme/embutido";')
    substituir("components/Sidebar.tsx",
               "  const { logout } = useAuth();\n",
               "  const { logout } = useAuth();\n  const embutido = useEmbutido();\n")
    substituir("components/Sidebar.tsx",
               "  return (\n    <aside",
               "  if (embutido) return null;\n\n  return (\n    <aside")
    substituir("components/Sidebar.tsx",
               '        {botao("Configurações", Settings, () => navigate("/configuracoes"), pathname.startsWith("/configuracoes"))}\n',
               "")
    (DESTINO / "components" / "ProtectedRoute.tsx").write_text(
        '// No app unificado o acesso é decidido pelo login por perfil do SurgiFlow.\n'
        'const ProtectedRoute = ({ children }: { children: React.ReactNode }) => <>{children}</>;\n\n'
        'export default ProtectedRoute;\n',
        encoding="utf-8",
    )


def gerar_css():
    """Copia o index.css do OPME.AI confinado em .opme-theme."""
    css = (ORIGEM / "index.css").read_text(encoding="utf-8")
    # As diretivas do Tailwind já vêm do index.css do SurgiFlow
    css = re.sub(r"^@tailwind\s+\w+;\s*$", "", css, flags=re.M)
    # Fonte DM Sans só dentro do OPME
    css = css.replace(
        "* {\n  font-family: 'DM Sans'",
        ".opme-theme, .opme-theme *, .opme-portais > :not(#root), .opme-portais > :not(#root) * {\n  font-family: 'DM Sans'",
        1,
    )
    # Variáveis do tema só dentro do OPME
    # (.opme-portais: diálogos e menus do Radix abertos no <body> quando o OPME está embutido na Gestão)
    css = css.replace(":root {", ".opme-theme, .opme-portais > :not(#root) {")
    css = re.sub(r"^(\s*)\.dark\s*\{", r"\1.dark .opme-theme {", css, flags=re.M)
    # Tipografia base do OPME só dentro do OPME. :where() mantém a especificidade
    # de um seletor de elemento, para os utilitários text-* do OPME continuarem vencendo.
    for antes, depois in [
        ("  body {\n    @apply bg-background", "  .opme-theme {\n    @apply bg-background"),
        ("  h1 {", "  :where(.opme-theme) h1 {"),
        ("  h2 {", "  :where(.opme-theme) h2 {"),
        ("  h3 {", "  :where(.opme-theme) h3 {"),
        ("  body, p, .text-body {", "  .opme-theme, :where(.opme-theme) p, .text-body {"),
        ("  label, .label, legend {", "  :where(.opme-theme) label, .label, :where(.opme-theme) legend {"),
    ]:
        if antes not in css:
            raise SystemExit(f"Trecho não encontrado em index.css do OPME.AI: {antes[:60]!r}")
        css = css.replace(antes, depois, 1)
    (DESTINO / "opme.css").write_text(css, encoding="utf-8")


if __name__ == "__main__":
    limpar_destino()
    copiar()
    ajustes()
    gerar_css()
    print(f"OPME.AI copiado para {DESTINO}")
