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
