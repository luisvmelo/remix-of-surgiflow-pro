import { Badge } from "@/components/ui/badge";
import type { Padrao } from "@/dominio/tipos";

export const StatusPadraoBadge = ({ padrao }: { padrao: Padrao }) => {
  if (padrao.status === "vigente") return <Badge className="bg-emerald-600 hover:bg-emerald-600">Vigente · v{padrao.versao}</Badge>;
  if (padrao.status === "em_ajuste") return <Badge className="bg-amber-500 hover:bg-amber-500 text-white">Em ajuste{padrao.versao ? ` · v${padrao.versao}` : ""}</Badge>;
  return <Badge variant="outline" className="border-primary/40 text-primary">Pré-modelo da IA</Badge>;
};
