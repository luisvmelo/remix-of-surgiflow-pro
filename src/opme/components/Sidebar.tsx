import { BarChart3, ClipboardList, Lightbulb, LogOut, Settings, UserCheck, type LucideIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@opme/contexts/AuthContext";
import { cn } from "@opme/lib/utils";
import { ORIGENS_PEDIDO } from "@opme/config/produto";

interface ItemNav {
  path: string;
  label: string;
  icon: LucideIcon;
  /** Outras rotas que pertencem a este item (ex.: o pedido de uma cirurgia) */
  inclui?: string[];
}

interface Modulo {
  nome: string;
  area: string;
  itens: ItemNav[];
}

/** Três módulos: operacional (Compras monta o pedido), tático (acompanhamento) e estratégico (Comercial) */
const MODULOS: Modulo[] = [
  {
    nome: "Operacional",
    area: "Compras",
    itens: [{ path: "/dashboard", label: "Lista de compras", icon: ClipboardList, inclui: ["/bi/procedimento", "/paciente"] }],
  },
  {
    nome: "Tático",
    area: "Gerente de compras",
    itens: [{ path: "/acompanhamento", label: "Acompanhamento", icon: UserCheck }],
  },
  {
    nome: "Estratégico",
    area: "Comercial",
    itens: [
      { path: "/insights", label: "Insights", icon: Lightbulb },
      { path: "/bi-geral", label: "Resultados", icon: BarChart3 },
    ],
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const { logout } = useAuth();

  // O pedido aberto a partir do tático ou do estratégico pertence à tela de origem
  const origem = ORIGENS_PEDIDO[new URLSearchParams(search).get("origem") ?? ""];
  const ativo = (item: ItemNav) =>
    origem && pathname.startsWith("/bi/procedimento")
      ? item.path === origem.path
      : [item.path, ...(item.inclui ?? [])].some((p) => pathname.startsWith(p));

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const botao = (label: string, Icon: LucideIcon, onClick: () => void, selecionado = false) => (
    <button
      key={label}
      onClick={onClick}
      aria-current={selecionado ? "page" : undefined}
      className={cn(
        "w-full h-11 px-3 flex items-center gap-3 rounded-lg text-[14px] font-semibold text-neutral-0 transition-smooth",
        "hover:bg-[#007CC9] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
        selecionado && "bg-[#007CC9] shadow-[inset_3px_0_0_#FFFFFF]"
      )}
    >
      <Icon className="w-5 h-5 shrink-0" strokeWidth={2} />
      <span className="truncate">{label}</span>
    </button>
  );

  return (
    <aside className="w-[220px] min-h-screen bg-[#008DDF] flex flex-col px-3 py-6 shrink-0" aria-label="Módulos">
      <nav className="flex flex-col gap-6">
        {MODULOS.map((m) => (
          <div key={m.nome}>
            <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/75">
              {m.nome} <span className="font-semibold normal-case tracking-normal text-white/60">· {m.area}</span>
            </p>
            <div className="flex flex-col gap-1">
              {m.itens.map((item) => botao(item.label, item.icon, () => navigate(item.path), ativo(item)))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-1 pt-6 border-t border-white/20">
        {botao("Configurações", Settings, () => navigate("/configuracoes"), pathname.startsWith("/configuracoes"))}
        {botao("Sair", LogOut, handleLogout)}
      </div>
    </aside>
  );
};

export default Sidebar;
