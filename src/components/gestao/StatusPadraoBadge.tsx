import { Badge } from "@/components/ui/badge";
import type { Padrao } from "@/dominio/tipos";
import { statusRevisao } from "@/gestao/comissao";

export const StatusPadraoBadge = ({ padrao }: { padrao: Padrao }) => {
  if (padrao.status === "vigente") return <Badge className="bg-emerald-600 hover:bg-emerald-600">Vigente · v{padrao.versao}</Badge>;
  if (padrao.status === "em_ajuste") return <Badge className="bg-amber-500 hover:bg-amber-500 text-white">Em ajuste{padrao.versao ? ` · v${padrao.versao}` : ""}</Badge>;
  return <Badge variant="outline" className="border-primary/40 text-primary">Sugestão da IA (pré-modelo)</Badge>;
};

export const RevisaoBadge = ({ padrao }: { padrao: Padrao }) => {
  const s = statusRevisao(padrao);
  if (s === "vencendo") return <Badge variant="outline" className="border-amber-400 text-amber-700">Revisão vencendo</Badge>;
  if (s === "vencida") return <Badge variant="outline" className="border-red-400 text-red-700">Revisão vencida</Badge>;
  return null;
};
