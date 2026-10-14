import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, CalendarDays, ChevronRight, Plus, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useSurgical } from "@/contexts/SurgicalContext";
import { useDominio } from "@/dominio/store";
import { avaliarPedido, previsaoMedico } from "@/dominio/motor";
import type { Pedido, StatusPedido } from "@/dominio/tipos";
import { TagAjuste, TagForaPadrao } from "@/components/pedido/Etiquetas";
import { brl, dataBR } from "@/components/pedido/formato";

const ABAS: { status: StatusPedido; label: string }[] = [
  { status: "aguardando_medico", label: "Aguardando minha validação" },
  { status: "esperando_confirmacao", label: "Esperando confirmação" },
  { status: "confirmado", label: "Confirmados" },
];

const MedicoHome = () => {
  const navigate = useNavigate();
  const { state } = useSurgical();
  const { dominio, pedidos, salvarContratoMedico } = useDominio();
  const medicoId = state.doctor?.id ?? "1";
  const medico = dominio.medicos.find((m) => m.id === medicoId);
  const contrato = dominio.contratosMedico.find((c) => c.medicoId === medicoId);
  const [aba, setAba] = useState<StatusPedido>("aguardando_medico");

  const meus = pedidos.filter((p) => p.medicoId === medicoId);
  const previsao = previsaoMedico(medicoId, pedidos, dominio);
  const lista = meus.filter((p) => p.status === aba).sort((a, b) => a.dataCirurgia.localeCompare(b.dataCirurgia));

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="bg-primary px-4 pb-4 pt-8 text-primary-foreground">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold"><Activity className="h-5 w-5" aria-hidden /> SolicitaCirurg</div>
          <div className="flex items-center gap-1">
            <button type="button" aria-label="Novo pedido" onClick={() => navigate("/pedido/novo?modo=medico")} className="rounded-full p-2 hover:bg-primary-foreground/10">
              <Plus className="h-5 w-5" />
            </button>
            <Sheet>
              <SheetTrigger asChild>
                <button type="button" aria-label="Configurações" className="rounded-full p-2 hover:bg-primary-foreground/10"><Settings className="h-5 w-5" /></button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-2xl">
                <SheetHeader><SheetTitle>Configurações</SheetTitle></SheetHeader>
                <label className="mt-4 flex items-center justify-between gap-3 rounded-lg border p-3">
                  <span>
                    <span className="block text-sm font-semibold">Enviar automaticamente quando estiver 100% conforme</span>
                    <span className="block text-xs text-muted-foreground">Pedidos da secretária que seguem o protocolo, o padrão e têm todos os documentos vão direto para confirmação.</span>
                  </span>
                  <Switch checked={!!contrato?.envioAutomatico} disabled={!contrato}
                    onCheckedChange={(v) => contrato && salvarContratoMedico({ ...contrato, envioAutomatico: v })} />
                </label>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <h1 className="text-xl font-bold">Olá, {medico?.nome.split(" ").slice(0, 2).join(" ") ?? "Doutor"}</h1>

        <section aria-label="Previsão de recebimento" className="mt-4 rounded-xl bg-primary-foreground/10 p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground/80">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden /> Previsão de recebimento
          </div>
          <div className="mt-2 grid grid-cols-4 gap-2 text-center">
            {([["30 dias", previsao.d30], ["60 dias", previsao.d60], ["90 dias", previsao.d90], ["12 meses", previsao.ano]] as const).map(([rotulo, v]) => (
              <div key={rotulo}>
                <div className="text-sm font-extrabold tabular-nums">{brl(v)}</div>
                <div className="text-[11px] text-primary-foreground/70">{rotulo}</div>
              </div>
            ))}
          </div>
        </section>
      </header>

      <div role="tablist" aria-label="Pedidos" className="sticky top-0 z-10 flex border-b bg-card">
        {ABAS.map((a) => {
          const n = meus.filter((p) => p.status === a.status).length;
          return (
            <button key={a.status} role="tab" type="button" aria-selected={aba === a.status} onClick={() => setAba(a.status)}
              className={cn("relative flex-1 px-1 py-3 text-center text-xs font-semibold", aba === a.status ? "text-primary" : "text-muted-foreground")}>
              {a.label} <span className="ml-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-foreground">{n}</span>
              {aba === a.status && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary" />}
            </button>
          );
        })}
      </div>

      <main className="flex-1 space-y-3 px-4 py-3 pb-20">
        {lista.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Nenhum pedido aqui.</p>
        ) : (
          lista.map((p) => <CardPedido key={p.id} p={p} onClick={() => navigate(`/medico/pedido/${p.id}`)} />)
        )}
      </main>
    </div>
  );
};

const CardPedido = ({ p, onClick }: { p: Pedido; onClick: () => void }) => {
  const { dominio } = useDominio();
  const a = avaliarPedido(p, dominio);
  const proc = dominio.procedimentos.find((x) => x.id === p.procedimentoId);
  const op = dominio.operadoras.find((x) => x.id === p.operadoraId);
  const fora = a.foraProtocolo.length > 0 || a.foraPadrao.length > 0 || a.naoHomologados.length > 0;
  const ajustes = p.ajustes.filter((x) => !x.resolvido);
  return (
    <button type="button" onClick={onClick}
      className={cn("glass-card w-full rounded-xl p-4 text-left", fora && "border-l-4 border-l-warning")}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-bold leading-tight">{proc?.nome}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">{p.paciente.nome} · {op?.nome} {p.plano} · {dataBR(p.dataCirurgia)}</div>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-2 text-xs">
        <span className={cn("font-bold tabular-nums", a.honorario.garantido ? "text-success" : "text-destructive")}>
          {brl(a.recebimento.valor)} {a.honorario.garantido ? "garantido" : "em risco"}
        </span>
        {a.complemento.perdido > 0 && <span className="text-destructive">complemento perdido {brl(a.complemento.perdido)}</span>}
        {fora && <TagForaPadrao />}
        {ajustes.length > 0 && <TagAjuste texto={ajustes[0].motivo} />}
      </div>
    </button>
  );
};

export default MedicoHome;
