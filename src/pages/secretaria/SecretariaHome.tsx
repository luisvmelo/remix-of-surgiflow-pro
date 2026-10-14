import { useNavigate } from "react-router-dom";
import { Activity, Building, Calendar, Plus, Stethoscope, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDominio } from "@/dominio/store";
import { avaliarPedido } from "@/dominio/motor";
import type { Pedido, StatusPedido } from "@/dominio/tipos";
import { TagAjuste, TagForaPadrao } from "@/components/pedido/Etiquetas";
import { dataBR, LABEL_STATUS } from "@/components/pedido/formato";

const COLUNAS: StatusPedido[] = ["rascunho", "aguardando_medico", "esperando_confirmacao", "confirmado"];
const COR: Record<StatusPedido, string> = {
  rascunho: "bg-muted-foreground",
  aguardando_medico: "bg-info",
  esperando_confirmacao: "bg-warning",
  confirmado: "bg-success",
};

const SecretariaHome = () => {
  const navigate = useNavigate();
  const { pedidos } = useDominio();

  return (
    <div className="min-h-screen bg-background">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b bg-card px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Activity className="h-6 w-6 text-primary" aria-hidden />
          <span className="text-lg font-bold">SolicitaCirurg</span>
          <span className="ml-2 hidden text-sm text-muted-foreground sm:inline">· Secretaria</span>
        </div>
        <Button onClick={() => navigate("/select-doctor")}><Plus className="mr-2 h-4 w-4" aria-hidden /> Nova solicitação</Button>
      </header>

      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
        <h1 className="text-xl font-bold">Solicitações</h1>
        <p className="mb-5 text-xs text-muted-foreground">Do rascunho até a confirmação de Compras</p>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {COLUNAS.map((status) => {
            const lista = pedidos.filter((p) => p.status === status);
            return (
              <section key={status} aria-label={LABEL_STATUS[status]} className="space-y-3">
                <h2 className="flex items-center gap-2 border-b pb-2 text-sm font-bold">
                  <span className={cn("h-2 w-2 rounded-full", COR[status])} aria-hidden />
                  {LABEL_STATUS[status]}
                  <span className="ml-auto rounded-full bg-muted px-2 text-xs">{lista.length}</span>
                </h2>
                {lista.length === 0 ? (
                  <p className="py-6 text-center text-xs text-muted-foreground">Nada por aqui</p>
                ) : (
                  lista.map((p) => <Card key={p.id} p={p} />)
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Card = ({ p }: { p: Pedido }) => {
  const navigate = useNavigate();
  const { dominio } = useDominio();
  const a = avaliarPedido(p, dominio);
  const proc = dominio.procedimentos.find((x) => x.id === p.procedimentoId);
  const medico = dominio.medicos.find((x) => x.id === p.medicoId);
  const op = dominio.operadoras.find((x) => x.id === p.operadoraId);
  const ajustes = p.ajustes.filter((x) => !x.resolvido);
  const fora = a.foraProtocolo.length > 0 || a.foraPadrao.length > 0 || a.naoHomologados.length > 0;
  const editavel = p.status === "rascunho" || ajustes.length > 0;

  return (
    <article className="glass-card overflow-hidden rounded-xl">
      <div className="space-y-1.5 p-3 text-xs">
        <div className="text-sm font-semibold leading-tight">{proc?.nome}</div>
        <div>{p.paciente.nome}</div>
        <div className="flex items-center gap-1.5 text-muted-foreground"><Stethoscope className="h-3 w-3" aria-hidden /> {medico?.nome}</div>
        <div className="flex items-center gap-1.5 text-muted-foreground"><Building className="h-3 w-3" aria-hidden /> {op?.nome} · {p.plano}</div>
        <div className="flex items-center gap-1.5 text-muted-foreground"><Calendar className="h-3 w-3" aria-hidden /> {dataBR(p.dataCirurgia)}</div>
        {(fora || ajustes.length > 0 || p.devolvido) && (
          <div className="flex flex-wrap gap-1 border-t pt-2">
            {ajustes.length > 0 && <TagAjuste texto={ajustes[0].motivo} />}
            {fora && <TagForaPadrao />}
            {p.devolvido && (
              <span className="inline-flex items-center gap-1 rounded-full border border-info/30 bg-info/10 px-2 py-0.5 text-[11px] font-semibold text-info" title={p.devolvido}>
                <Undo2 className="h-3 w-3" aria-hidden /> Devolvido pelo médico
              </span>
            )}
          </div>
        )}
        {ajustes.length > 0 && <p className="text-[11px] text-muted-foreground">{ajustes[0].motivo}</p>}
      </div>
      {editavel && (
        <div className="border-t px-3 py-2">
          <Button size="sm" variant="outline" className="h-7 w-full text-xs" onClick={() => navigate(`/pedido/${p.id}`)}>
            {p.status === "rascunho" ? "Continuar" : "Corrigir"}
          </Button>
        </div>
      )}
    </article>
  );
};

export default SecretariaHome;
