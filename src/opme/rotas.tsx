import Index from "@opme/pages/Index";
import PatientDetail from "@opme/pages/PatientDetail";
import BIProcedimento from "@opme/pages/BIProcedimento";
import Acompanhamento from "@opme/pages/Acompanhamento";
import Insights from "@opme/pages/Insights";
import BIGeral from "@opme/pages/BIGeral";
import Configuracoes from "@opme/pages/Configuracoes";
import Sidebar from "@opme/components/Sidebar";
import FilaRevisao from "@/compras/FilaRevisao";
import RevisaoPedido from "@/compras/RevisaoPedido";

/** Telas novas de Compras (fora do port) com a barra lateral do OPME. */
const ComSidebar = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen w-full bg-background">
    <Sidebar />
    {children}
  </div>
);

/**
 * Rotas do OPME.AI com os caminhos originais.
 * Insights, Resultados e Configurações aparecem embutidos na Gestão e seguem acessíveis por URL.
 * /revisao é a fila de revisão dos pedidos do wizard (Compras).
 */
export const OPME_ROTAS = [
  { path: "/revisao", element: <ComSidebar><FilaRevisao /></ComSidebar> },
  { path: "/revisao/:id", element: <ComSidebar><RevisaoPedido /></ComSidebar> },
  { path: "/dashboard", element: <Index /> },
  { path: "/paciente/:id", element: <PatientDetail /> },
  { path: "/bi/procedimento/:pacienteId", element: <BIProcedimento /> },
  { path: "/acompanhamento", element: <Acompanhamento /> },
  { path: "/insights", element: <Insights /> },
  { path: "/bi-geral", element: <BIGeral /> },
  { path: "/configuracoes", element: <Configuracoes /> },
];

export const OPME_CAMINHOS = OPME_ROTAS.map((r) => r.path);
