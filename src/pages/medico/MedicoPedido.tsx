import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Edit3, Undo2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useDominio } from "@/dominio/store";
import { avaliarPedido } from "@/dominio/motor";
import { Checklist, CondicoesComplemento, TagForaProtocolo, TagForaPadrao, TagNaoHomologado } from "@/components/pedido/Etiquetas";
import ProtocoloModal from "@/components/pedido/ProtocoloModal";
import { brl, dataBR, LABEL_STATUS } from "@/components/pedido/formato";

const MedicoPedido = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dominio, pedidos, mudarStatus, atualizarPedido } = useDominio();
  const p = pedidos.find((x) => x.id === id);
  const [devolvendo, setDevolvendo] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [protocolo, setProtocolo] = useState(false);

  if (!p) {
    return (
      <div className="p-6 text-center text-sm">
        Pedido não encontrado. <button type="button" className="underline" onClick={() => navigate("/medico")}>Voltar</button>
      </div>
    );
  }

  const a = avaliarPedido(p, dominio);
  const proc = dominio.procedimentos.find((x) => x.id === p.procedimentoId);
  const op = dominio.operadoras.find((x) => x.id === p.operadoraId);
  const ajustes = p.ajustes.filter((x) => !x.resolvido);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 border-b bg-card px-4 pb-3 pt-8">
        <div className="flex items-center gap-3">
          <button type="button" aria-label="Voltar" onClick={() => navigate("/medico")} className="-ml-1 p-1"><ArrowLeft className="h-5 w-5" /></button>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold">{proc?.nome}</h1>
            <p className="text-xs text-muted-foreground">{LABEL_STATUS[p.status]}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 space-y-3 px-4 py-3 pb-40">
        {ajustes.map((x) => (
          <div key={x.id} className="flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm">
            <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
            <span><strong>Compras pediu um ajuste:</strong> {x.motivo}</span>
          </div>
        ))}

        <section className="glass-card rounded-xl p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recebimento previsto</div>
          <div className="mt-1 text-2xl font-extrabold tabular-nums">{brl(a.recebimento.valor)}</div>
          <p className="text-xs text-muted-foreground">em {dataBR(a.recebimento.data)} · {a.recebimento.dias} dias após a cirurgia</p>
          <p className={cn("mt-2 text-sm font-semibold", a.honorario.garantido ? "text-success" : "text-destructive")}>
            {a.honorario.garantido ? "Honorário garantido" : "Honorário em risco"}: {brl(a.honorario.valor)}
          </p>
          {a.complemento.motivo ? (
            <p className="text-xs text-muted-foreground">{a.complemento.motivo}</p>
          ) : a.complemento.total > 0 && (
            <div className="mt-2 border-t pt-2">
              <p className="text-xs font-semibold text-success">Complemento garantido: {brl(a.complemento.garantido)}</p>
              {a.complemento.perdido > 0 && <p className="text-xs font-semibold text-destructive">Complemento perdido: {brl(a.complemento.perdido)}</p>}
              <div className="mt-1.5"><CondicoesComplemento condicoes={a.complemento.condicoes} visao="medico" /></div>
            </div>
          )}
        </section>

        <section className="glass-card rounded-xl p-4">
          <div className="mb-2 text-xs text-muted-foreground">{p.paciente.nome} · {op?.nome} {p.plano} · cirurgia em {dataBR(p.dataCirurgia)}</div>
          <Checklist itens={a.checklist} />
        </section>

        <section className="glass-card rounded-xl p-4">
          <h2 className="mb-2 text-sm font-semibold">Itens</h2>
          <ul className="space-y-2">
            {p.itens.map((i) => {
              const item = dominio.itens.find((x) => x.id === i.itemId);
              const marca = dominio.marcas.find((x) => x.id === i.marcaId);
              return (
                <li key={i.itemId} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span>{item?.nome} <span className="text-xs text-muted-foreground">· {marca?.fabricante} × {i.qtd}</span></span>
                  <span className="flex flex-wrap gap-1">
                    {a.foraProtocolo.includes(i.itemId) && <TagForaProtocolo onClick={() => setProtocolo(true)} />}
                    {a.foraPadrao.includes(i.marcaId) && <TagForaPadrao />}
                    {a.naoHomologados.includes(i.marcaId) && <TagNaoHomologado />}
                  </span>
                </li>
              );
            })}
          </ul>
          {p.justificativa && <p className="mt-3 rounded-md bg-muted p-2 text-xs"><strong>Justificativa:</strong> {p.justificativa}</p>}
          {p.aceitoForaPadrao && <p className="mt-2 text-xs text-muted-foreground">Compras aceitou fora do padrão: {p.aceitoForaPadrao.motivo}</p>}
        </section>
      </main>

      <footer className="fixed inset-x-0 bottom-0 space-y-2 border-t bg-card px-4 py-3">
        {p.status === "aguardando_medico" && !devolvendo && (
          <div className="flex gap-2">
            <Button variant="outline" className="h-12 flex-1 border-destructive/30 text-destructive" onClick={() => setDevolvendo(true)}>
              <Undo2 className="mr-1.5 h-4 w-4" aria-hidden /> Devolver
            </Button>
            <Button variant="outline" className="h-12 flex-1" onClick={() => navigate(`/pedido/${p.id}?modo=medico`)}>
              <Edit3 className="mr-1.5 h-4 w-4" aria-hidden /> Editar
            </Button>
            <Button className="h-12 flex-1" onClick={() => { mudarStatus(p.id, "esperando_confirmacao"); navigate("/medico"); }}>
              <CheckCircle2 className="mr-1.5 h-4 w-4" aria-hidden /> Aprovar
            </Button>
          </div>
        )}
        {devolvendo && (
          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo da devolução</Label>
            <Textarea id="motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="O que a secretária precisa corrigir?" />
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setDevolvendo(false)}>Cancelar</Button>
              <Button className="flex-1" disabled={!motivo.trim()}
                onClick={() => { atualizarPedido(p.id, { status: "rascunho", devolvido: motivo.trim() }); navigate("/medico"); }}>
                Confirmar devolução
              </Button>
            </div>
          </div>
        )}
        {p.status === "esperando_confirmacao" && ajustes.length > 0 && (
          <Button className="h-12 w-full" onClick={() => navigate(`/pedido/${p.id}?modo=medico`)}>
            <Wrench className="mr-1.5 h-4 w-4" aria-hidden /> Corrigir pedido
          </Button>
        )}
        {p.status === "esperando_confirmacao" && ajustes.length === 0 && (
          <p className="text-center text-xs text-muted-foreground">Com Compras para confirmação.</p>
        )}
        {p.status === "confirmado" && <p className="text-center text-xs text-muted-foreground">Pedido confirmado.</p>}
      </footer>

      <ProtocoloModal procedimentoId={protocolo ? p.procedimentoId : null} dominio={dominio} onClose={() => setProtocolo(false)} />
    </div>
  );
};

export default MedicoPedido;
