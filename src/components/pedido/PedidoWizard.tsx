import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Save, Send, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useDominio } from "@/dominio/store";
import { avaliarPedido, compraRapida, pedidoSugerido } from "@/dominio/motor";
import type { Pedido, StatusPedido } from "@/dominio/tipos";
import { Checklist, CondicoesComplemento } from "./Etiquetas";
import PainelSugerido from "./PainelSugerido";
import ProtocoloModal from "./ProtocoloModal";
import { PassoCodificacao, PassoDocumentos, PassoItens, PassoPaciente, type Rascunho } from "./Passos";
import { brl, dataBR } from "./formato";

const PASSOS = ["Paciente e cirurgia", "Codificação", "Itens", "Documentos", "Resumo"] as const;

interface Props {
  modo: "secretaria" | "medico";
  medicoId: string;
  /** Pedido existente a editar (rascunho devolvido, ajuste pedido por Compras etc.) */
  pedidoId?: string;
  inicial?: Partial<Rascunho>;
  secretaria?: string;
  onConcluir: (id: string, status: StatusPedido) => void;
}

const amanhaMaisUmMes = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
};

const PedidoWizard = ({ modo, medicoId, pedidoId, inicial, secretaria, onConcluir }: Props) => {
  const { dominio, pedidos, criarPedido, atualizarPedido, resolverAjustes } = useDominio();
  const existente = pedidoId ? pedidos.find((p) => p.id === pedidoId) : undefined;

  const [r, setRState] = useState<Rascunho>(() =>
    existente
      ? { ...existente }
      : {
          medicoId,
          secretaria,
          paciente: { nome: "", cpf: "" },
          operadoraId: "4",
          plano: "Especial",
          procedimentoId: "",
          codigos: [],
          itens: [],
          documentos: [],
          urgencia: false,
          dataCirurgia: amanhaMaisUmMes(),
          ...inicial,
        },
  );
  const setR = (f: (x: Rascunho) => Rascunho) => setRState((x) => f(x));
  const [passo, setPasso] = useState(existente ? 2 : 0);
  const [protocoloAberto, setProtocoloAberto] = useState(false);

  const comoPedido = (x: Rascunho): Pedido => ({ ...x, id: x.id ?? "rascunho", status: "rascunho", ajustes: [], criadoEm: "" });
  const avaliacao = useMemo(() => avaliarPedido(comoPedido(r), dominio), [r, dominio]);
  const sugerido = useMemo(() => {
    if (!r.procedimentoId) return null;
    const s = pedidoSugerido(r.procedimentoId, r.operadoraId, dominio);
    const docs = dominio.padroes[r.procedimentoId]?.protocolo.documentos ?? [];
    return avaliarPedido(comoPedido({ ...r, codigos: s.codigos, itens: s.itens, documentos: docs }), dominio);
  }, [r, dominio]);

  const usarSugerido = () => {
    if (!r.procedimentoId) return;
    const s = pedidoSugerido(r.procedimentoId, r.operadoraId, dominio);
    setR((x) => ({ ...x, codigos: s.codigos, itens: s.itens }));
  };
  const usarCompraRapida = () => setR((x) => ({ ...x, itens: compraRapida(x.procedimentoId, x.operadoraId, dominio) }));

  const fora = avaliacao.foraProtocolo.length > 0 || avaliacao.foraPadrao.length > 0 || avaliacao.naoHomologados.length > 0;
  const conforme = avaliacao.checklist.length > 0 && avaliacao.checklist.every((c) => c.ok);
  const precisaJustificativa = fora && !r.justificativa?.trim();
  const ajustesPendentes = existente?.ajustes.filter((a) => !a.resolvido) ?? [];
  const contrato = dominio.contratosMedico.find((c) => c.medicoId === r.medicoId);
  const procedimento = dominio.procedimentos.find((p) => p.id === r.procedimentoId);
  const operadora = dominio.operadoras.find((o) => o.id === r.operadoraId);
  const podeEnviar = !!r.procedimentoId && !!r.paciente.nome.trim() && r.itens.length > 0 && !precisaJustificativa;

  const salvar = (status: StatusPedido) => {
    const dados = { ...r, devolvido: status === "rascunho" ? r.devolvido : undefined };
    let id = r.id;
    if (id) {
      atualizarPedido(id, { ...dados, status });
      if (status !== "rascunho") resolverAjustes(id);
    } else {
      const { id: _semId, ...novo } = dados;
      id = criarPedido({ ...novo, status });
    }
    onConcluir(id, status);
  };

  const enviar = () => {
    if (modo === "medico") return salvar("esperando_confirmacao");
    salvar(contrato?.envioAutomatico && conforme ? "esperando_confirmacao" : "aguardando_medico");
  };

  const Conteudo = [PassoPaciente, PassoCodificacao, null, PassoDocumentos, null][passo];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5">
      {(existente?.devolvido || ajustesPendentes.length > 0) && (
        <div className="mb-4 space-y-1 rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm">
          {existente?.devolvido && <p><strong>Devolvido pelo médico:</strong> {existente.devolvido}</p>}
          {ajustesPendentes.map((a) => (
            <p key={a.id} className="flex items-start gap-1.5"><Wrench className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden /><span><strong>Ajuste pedido por Compras:</strong> {a.motivo}</span></p>
          ))}
        </div>
      )}

      <nav aria-label="Etapas" className="mb-5 flex gap-1 overflow-x-auto pb-1">
        {PASSOS.map((nome, i) => (
          <button key={nome} type="button" aria-label={nome} aria-current={passo === i ? "step" : undefined} onClick={() => setPasso(i)}
            className={cn("flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors",
              passo === i ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>
            <span aria-hidden className={cn("flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold", passo === i ? "bg-primary-foreground/20" : "bg-muted")}>{i + 1}</span>
            <span aria-hidden>{nome}</span>
          </button>
        ))}
      </nav>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <main className="min-w-0">
          <h2 className="mb-4 text-lg font-bold">{PASSOS[passo]}</h2>
          {passo === 2 ? (
            <PassoItens r={r} setR={setR} dominio={dominio} avaliacao={avaliacao} abrirProtocolo={() => setProtocoloAberto(true)} onCompraRapida={usarCompraRapida} />
          ) : passo === 4 ? (
            <div className="space-y-5">
              <div className="glass-card grid gap-3 rounded-xl p-4 text-sm sm:grid-cols-2">
                <div><span className="text-muted-foreground">Paciente:</span> <strong>{r.paciente.nome || "—"}</strong></div>
                <div><span className="text-muted-foreground">Operadora:</span> <strong>{operadora?.nome} · {r.plano}</strong></div>
                <div className="sm:col-span-2"><span className="text-muted-foreground">Procedimento:</span> <strong>{procedimento?.nome ?? "—"}</strong></div>
                <div><span className="text-muted-foreground">Cirurgia:</span> <strong>{dataBR(r.dataCirurgia)}</strong>{r.urgencia && " · urgência"}</div>
                <div><span className="text-muted-foreground">Itens:</span> <strong>{r.itens.reduce((a, i) => a + i.qtd, 0)}</strong></div>
              </div>

              <div className="glass-card rounded-xl p-4">
                <h3 className="mb-3 text-sm font-semibold">Conformidade</h3>
                <Checklist itens={avaliacao.checklist} />
              </div>

              <div className="glass-card space-y-2 rounded-xl p-4 text-sm">
                <p className={cn("font-semibold", avaliacao.honorario.garantido ? "text-success" : "text-destructive")}>
                  {avaliacao.honorario.garantido ? "Honorário garantido" : "Honorário em risco"}: {brl(avaliacao.honorario.valor)}
                </p>
                {avaliacao.complemento.motivo ? (
                  <p className="text-muted-foreground">{avaliacao.complemento.motivo}</p>
                ) : avaliacao.complemento.total > 0 && (
                  <>
                    <p className="font-semibold text-success">Complemento garantido: {brl(avaliacao.complemento.garantido)}</p>
                    <CondicoesComplemento condicoes={avaliacao.complemento.condicoes} visao="medico" />
                  </>
                )}
                <p className="border-t pt-2">
                  Recebimento previsto: <strong>{brl(avaliacao.recebimento.valor)}</strong> em {dataBR(avaliacao.recebimento.data)} ({avaliacao.recebimento.dias} dias após a cirurgia)
                </p>
              </div>

              {fora && (
                <div className="space-y-1.5">
                  <Label htmlFor="justificativa">Justificativa (o pedido saiu do protocolo ou do padrão)</Label>
                  <Textarea id="justificativa" value={r.justificativa ?? ""} placeholder="Ex.: paciente com alergia documentada a PEEK"
                    onChange={(e) => setR((x) => ({ ...x, justificativa: e.target.value }))} />
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => salvar("rascunho")}><Save className="mr-1.5 h-4 w-4" aria-hidden /> Salvar rascunho</Button>
                <Button type="button" onClick={enviar} disabled={!podeEnviar}>
                  <Send className="mr-1.5 h-4 w-4" aria-hidden /> {modo === "medico" ? "Enviar para confirmação" : "Enviar ao médico"}
                </Button>
              </div>
              {!podeEnviar && (
                <p className="text-right text-xs text-muted-foreground">
                  {precisaJustificativa ? "Escreva a justificativa para enviar." : "Preencha paciente, procedimento e pelo menos um item."}
                </p>
              )}
            </div>
          ) : (
            Conteudo && <Conteudo r={r} setR={setR} dominio={dominio} avaliacao={avaliacao} abrirProtocolo={() => setProtocoloAberto(true)} />
          )}

          {passo < 4 && (
            <div className="mt-6 flex justify-between">
              <Button type="button" variant="ghost" disabled={passo === 0} onClick={() => setPasso((p) => p - 1)}><ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden /> Voltar</Button>
              <Button type="button" onClick={() => setPasso((p) => p + 1)}>Próximo <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden /></Button>
            </div>
          )}
        </main>

        {r.procedimentoId ? (
          <PainelSugerido avaliacao={avaliacao} sugerido={sugerido} onUsarSugerido={usarSugerido} />
        ) : (
          <aside className="glass-card h-fit rounded-xl p-4 text-sm text-muted-foreground">Escolha o procedimento para ver o pedido sugerido pelo hospital e quanto o médico recebe.</aside>
        )}
      </div>

      <ProtocoloModal procedimentoId={protocoloAberto ? r.procedimentoId : null} dominio={dominio} onClose={() => setProtocoloAberto(false)} />
    </div>
  );
};

export default PedidoWizard;
