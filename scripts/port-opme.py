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
