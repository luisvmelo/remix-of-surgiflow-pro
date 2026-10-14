import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Check, MessageSquareWarning, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useDominio } from "@/dominio/store";
import { addDias, avaliarPedido, leque } from "@/dominio/motor";
import type { Avaliacao, Padrao, SugestaoAlteracao } from "@/dominio/tipos";
import { brl, dataBR } from "@/components/pedido/formato";

const Caixa = ({ titulo, children, className = "" }: { titulo: string; children: React.ReactNode; className?: string }) => (
  <section aria-label={titulo} className={`rounded-lg bg-white shadow-elevation-1 border border-cinza-200 ${className}`}>
    <h2 className="px-4 py-3 border-b border-cinza-200 text-[12px] font-semibold uppercase tracking-wide text-cinza-600">{titulo}</h2>
    <div className="p-4">{children}</div>
  </section>
);

/** Diferença em relação ao pedido como chegou do wizard. */
const Delta = ({ antes, agora, formato, menorMelhor }: { antes: number; agora: number; formato: (v: number) => string; menorMelhor?: boolean }) => {
  const d = agora - antes;
  if (Math.abs(d) < 0.5) return null;
  const bom = menorMelhor ? d < 0 : d > 0;
  return <span className={`ml-1 text-[12px] ${bom ? "text-emerald-700" : "text-red-700"}`}>({d > 0 ? "+" : "−"}{formato(Math.abs(d))})</span>;
};

/** Sugestões para a comissão a partir do que foi aceito fora do padrão (sem repetir as que já existem). */
function sugestoesDoAceite(padrao: Padrao, a: Avaliacao, itens: { itemId: string; marcaId: string }[], motivo: string, nomeMarca: (id: string) => string, nomeItem: (id: string) => string): SugestaoAlteracao[] {
  const novas: SugestaoAlteracao[] = [];
  for (const i of itens) {
    const foraProtocolo = a.foraProtocolo.includes(i.itemId);
    const foraLeque = a.foraPadrao.includes(i.marcaId) || a.naoHomologados.includes(i.marcaId);
    if (!foraProtocolo && !foraLeque) continue;
    if ([...padrao.sugestoes, ...novas].some((s) => s.itemId === i.itemId && s.para === i.marcaId)) continue;
    novas.push({
      id: `s-compras-${i.itemId}-${i.marcaId}`,
      titulo: foraProtocolo ? `Incluir ${nomeItem(i.itemId).toLowerCase()} no protocolo` : `Incluir ${nomeMarca(i.marcaId)} no leque de ${nomeItem(i.itemId).toLowerCase()}`,
      motivo: `Aceito por Compras: ${motivo}`,
      tipo: foraProtocolo ? "incluir_item" : "trocar_marca",
      itemId: i.itemId,
      para: i.marcaId,
      antes: foraProtocolo ? "Fora do protocolo" : "Fora do leque",
      depois: nomeMarca(i.marcaId),
    });
  }
  return novas;
}

const RevisaoPedido = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dominio, pedidos, atualizarPedido, pedirAjuste, aceitarForaPadrao, salvarPadrao, resolverAjustes, mudarStatus } = useDominio();
  const pedido = pedidos.find((p) => p.id === id);
  // Como o pedido chegou: base para mostrar o efeito das trocas
  const [original] = useState(() => (pedido ? avaliarPedido(pedido, dominio) : null));
  const [modo, setModo] = useState<"ajuste" | "aceite" | null>(null);
  const [itemAjuste, setItemAjuste] = useState("");
  const [motivo, setMotivo] = useState("");
  const [aviso, setAviso] = useState("");

  const a = useMemo(() => (pedido ? avaliarPedido(pedido, dominio) : null), [pedido, dominio]);
  if (!pedido || !a || !original) {
    return (
      <main className="flex-1 p-6">
        <p className="text-cinza-600">Pedido não encontrado.</p>
        <Link to="/revisao" className="text-[#008DDF] underline">Voltar para a fila</Link>
      </main>
    );
  }

  const padrao = dominio.padroes[pedido.procedimentoId];
  const lequeOp = leque(padrao, pedido.operadoraId, dominio);
  const operadora = dominio.operadoras.find((o) => o.id === pedido.operadoraId)!;
  const proc = dominio.procedimentos.find((p) => p.id === pedido.procedimentoId)!;
  const medico = dominio.medicos.find((m) => m.id === pedido.medicoId)!;
  const marca = (mid: string) => dominio.marcas.find((m) => m.id === mid);
  const nomeItem = (iid: string) => dominio.itens.find((i) => i.id === iid)?.nome ?? iid;
  const temFora = a.foraPadrao.length + a.foraProtocolo.length + a.naoHomologados.length > 0;
  const bloqueado = temFora && !pedido.aceitoForaPadrao;
  const confirmado = pedido.status === "confirmado";

  const trocar = (itemId: string, marcaId: string) =>
    atualizarPedido(pedido.id, { itens: pedido.itens.map((i) => (i.itemId === itemId ? { ...i, marcaId } : i)) });

  const fechar = () => {
    setModo(null);
    setMotivo("");
    setItemAjuste("");
  };

  const enviarAjuste = () => {
    if (!motivo.trim()) return;
    pedirAjuste(pedido.id, motivo.trim(), itemAjuste || undefined);
    setAviso("Ajuste enviado: aparece no card do médico e da secretária.");
    fechar();
  };

  const confirmarAceite = () => {
    if (!motivo.trim()) return;
    aceitarForaPadrao(pedido.id, motivo.trim());
    const novas = sugestoesDoAceite(padrao, a, pedido.itens, motivo.trim(), (m) => marca(m)?.fabricante ?? m, nomeItem);
    if (novas.length) salvarPadrao({ ...padrao, sugestoes: [...padrao.sugestoes, ...novas] });
    setAviso(novas.length ? `Aceite registrado e ${novas.length} sugestão(ões) enviada(s) à comissão.` : "Aceite registrado.");
    fechar();
  };

  const confirmar = () => {
    resolverAjustes(pedido.id);
    mudarStatus(pedido.id, "confirmado");
    setAviso("Pedido confirmado.");
  };

  // Pagamentos: fornecedores (custo e prazo negociado) contra o que a operadora paga
  const porFornecedor = new Map<string, { valor: number; prazo: number }>();
  for (const i of pedido.itens) {
    const m = marca(i.marcaId);
    if (!m) continue;
    const atual = porFornecedor.get(m.fornecedor) ?? { valor: 0, prazo: m.prazoPagamentoDias };
    porFornecedor.set(m.fornecedor, { valor: atual.valor + m.custo * i.qtd, prazo: Math.min(atual.prazo, m.prazoPagamentoDias) });
  }
  const recebeOperadora = pedido.dataCirurgia ? addDias(pedido.dataCirurgia, operadora.prazoPagamentoDias) : "";
  const h = a.hospital;

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <header className="bg-white px-6 py-5 border-b border-neutral-100">
        <Link to="/revisao" className="inline-flex items-center gap-1 text-[13px] text-[#008DDF] font-semibold">
          <ArrowLeft className="w-4 h-4" aria-hidden /> Revisão de pedidos
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3 mt-2">
          <div>
            <h1 className="text-[24px] leading-8 font-bold text-cinza-700">{pedido.paciente.nome}</h1>
            <p className="text-[14px] text-cinza-500">
              {proc.nome} · {medico.nome} · {operadora.nome} {pedido.plano} · cirurgia em {dataBR(pedido.dataCirurgia)}
            </p>
            <p className="text-[13px] text-cinza-500">Códigos: {pedido.codigos.join(", ") || "—"} · padrão v{padrao.versao}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!confirmado && (
              <>
                <Button variant="outline" onClick={() => { setModo("ajuste"); setMotivo(""); }}>
                  <MessageSquareWarning className="w-4 h-4 mr-1" aria-hidden /> Pedir ajuste
                </Button>
                {temFora && !pedido.aceitoForaPadrao && (
                  <Button variant="outline" onClick={() => { setModo("aceite"); setMotivo(""); }}>
                    <ShieldCheck className="w-4 h-4 mr-1" aria-hidden /> Aceitar fora do padrão
                  </Button>
                )}
                <Button onClick={confirmar} disabled={bloqueado} title={bloqueado ? "Há itens fora do padrão: troque dentro do leque ou aceite com motivo." : undefined}>
                  <Check className="w-4 h-4 mr-1" aria-hidden /> Confirmar pedido
                </Button>
              </>
            )}
            {confirmado && (
              <Button variant="outline" onClick={() => navigate("/revisao")}>Voltar para a fila</Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-[1300px] w-full mx-auto space-y-5">
        {aviso && <p role="status" className="rounded-md bg-emerald-50 border border-emerald-200 px-4 py-2 text-[14px] text-emerald-800">{aviso}</p>}
        {confirmado && <Badge className="bg-emerald-600 hover:bg-emerald-600">Confirmado</Badge>}

        {modo && (
          <section aria-label={modo === "ajuste" ? "Pedir ajuste" : "Aceitar fora do padrão"} className="rounded-lg border-2 border-[#008DDF] bg-white p-4 space-y-3">
            {modo === "ajuste" ? (
              <>
                <p className="font-semibold text-cinza-700">Pedir ajuste ao médico e à secretária</p>
                <label className="block text-[13px] text-cinza-600">
                  Item
                  <select aria-label="Item do ajuste" className="mt-1 block w-full max-w-md rounded-md border border-cinza-300 bg-white px-3 py-2 text-[14px]"
                    value={itemAjuste} onChange={(e) => setItemAjuste(e.target.value)}>
                    <option value="">Pedido inteiro</option>
                    {pedido.itens.map((i) => <option key={i.itemId} value={i.itemId}>{nomeItem(i.itemId)}</option>)}
                  </select>
                </label>
                <Textarea aria-label="Motivo do ajuste" placeholder="O que precisa mudar e por quê" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
                <div className="flex gap-2">
                  <Button onClick={enviarAjuste} disabled={!motivo.trim()}>Enviar ajuste</Button>
                  <Button variant="ghost" onClick={fechar}>Cancelar</Button>
                </div>
              </>
            ) : (
              <>
                <p className="font-semibold text-cinza-700">Aceitar fora do padrão</p>
                {pedido.justificativa && <p className="text-[13px] text-cinza-600">Justificativa do médico: “{pedido.justificativa}”</p>}
                <p className="text-[13px] text-cinza-500">O motivo vira uma sugestão de alteração para a comissão do padrão.</p>
                <Textarea aria-label="Motivo do aceite" placeholder="Por que este pedido pode seguir fora do padrão" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
                <div className="flex gap-2">
                  <Button onClick={confirmarAceite} disabled={!motivo.trim()}>Confirmar aceite</Button>
                  <Button variant="ghost" onClick={fechar}>Cancelar</Button>
                </div>
              </>
            )}
          </section>
        )}

        <section aria-label="Resumo" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg bg-white shadow-elevation-1 border border-cinza-200 p-4">
            <p className="text-[12px] font-semibold uppercase text-cinza-500">Custo OPME</p>
            <p className="text-[24px] font-bold text-cinza-700 tabular-nums">{brl(h.custoOpme)}<Delta antes={original.hospital.custoOpme} agora={h.custoOpme} formato={brl} menorMelhor /></p>
          </div>
          <div className="rounded-lg bg-white shadow-elevation-1 border border-cinza-200 p-4">
            {h.tipo === "pacote" && h.teto ? (
              <>
                <p className="text-[12px] font-semibold uppercase text-cinza-500">Teto do pacote ({brl(h.teto)})</p>
                <Progress value={Math.min(100, ((h.consumoTeto ?? 0) / h.teto) * 100)} className="mt-2" aria-label="Consumo do teto do pacote" />
                <p className={`text-[13px] mt-1 tabular-nums ${(h.consumoTeto ?? 0) > h.teto ? "text-red-700 font-semibold" : "text-cinza-600"}`}>
                  {brl(h.consumoTeto ?? 0)} usados · {(h.consumoTeto ?? 0) > h.teto ? "estoura o teto" : `sobra ${brl(h.teto - (h.consumoTeto ?? 0))}`}
                </p>
              </>
            ) : (
              <>
                <p className="text-[12px] font-semibold uppercase text-cinza-500">Margem (conta aberta)</p>
                <p className={`text-[24px] font-bold tabular-nums ${h.margem < 0 ? "text-red-700" : "text-cinza-700"}`}>
                  {brl(h.margem)}<Delta antes={original.hospital.margem} agora={h.margem} formato={brl} />
                </p>
              </>
            )}
          </div>
          <div className="rounded-lg bg-white shadow-elevation-1 border border-cinza-200 p-4">
            <p className="text-[12px] font-semibold uppercase text-cinza-500">Liberação pela operadora</p>
            <p className="text-[24px] font-bold text-cinza-700 tabular-nums">
              {a.liberacaoDias} dias<Delta antes={original.liberacaoDias} agora={a.liberacaoDias} formato={(v) => `${v} d`} menorMelhor />
            </p>
            <p className="text-[13px] text-cinza-500">Risco de glosa {Math.round(a.riscoGlosa)}%<Delta antes={original.riscoGlosa} agora={a.riscoGlosa} formato={(v) => `${Math.round(v)} p.p.`} menorMelhor /></p>
          </div>
          <div className="rounded-lg bg-white shadow-elevation-1 border border-cinza-200 p-4">
            <p className="text-[12px] font-semibold uppercase text-cinza-500">Complemento do médico</p>
            <p className="text-[24px] font-bold tabular-nums" style={{ color: "#139e8a" }}>
              {brl(a.complemento.garantido)}<Delta antes={original.complemento.garantido} agora={a.complemento.garantido} formato={brl} />
            </p>
            <p className="text-[13px] text-cinza-500">{a.complemento.perdido > 0 ? `perde ${brl(a.complemento.perdido)}` : "garantido"}</p>
          </div>
        </section>

        <Caixa titulo="Pedido estruturado (vindo do wizard)">
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="text-left text-[11px] uppercase text-cinza-500">
                  <th className="py-2 pr-3">Item</th>
                  <th className="py-2 pr-3">Marca · fornecedor</th>
                  <th className="py-2 pr-3 text-right">Qtd</th>
                  <th className="py-2 pr-3 text-right">Custo</th>
                  <th className="py-2 pr-3 text-right">Liberação</th>
                  <th className="py-2 pr-3">Conformidade</th>
                  <th className="py-2">Trocar dentro do leque</th>
                </tr>
              </thead>
              <tbody>
                {pedido.itens.map((i) => {
                  const m = marca(i.marcaId);
                  const l = lequeOp.find((x) => x.itemId === i.itemId);
                  const foraProtocolo = a.foraProtocolo.includes(i.itemId);
                  const naoHomologado = a.naoHomologados.includes(i.marcaId);
                  const foraPadrao = a.foraPadrao.includes(i.marcaId);
                  const preferencial = l?.preferenciais.some((x) => x.id === i.marcaId);
                  const ajuste = pedido.ajustes.find((x) => !x.resolvido && x.itemId === i.itemId);
                  return (
                    <tr key={i.itemId} className="border-t border-cinza-200 align-top">
                      <td className="py-3 pr-3">
                        <p className="font-medium text-cinza-700">{nomeItem(i.itemId)}</p>
                        <p className="text-[12px] text-cinza-500">{dominio.itens.find((x) => x.id === i.itemId)?.caracteristica}</p>
                        {ajuste && <p className="text-[12px] text-[#008DDF] mt-1">Ajuste pedido: {ajuste.motivo}</p>}
                      </td>
                      <td className="py-3 pr-3">
                        <p className="text-cinza-700">{m?.fabricante}</p>
                        <p className="text-[12px] text-cinza-500">{m?.fornecedor}</p>
                      </td>
                      <td className="py-3 pr-3 text-right tabular-nums">{i.qtd}</td>
                      <td className="py-3 pr-3 text-right tabular-nums">{m ? brl(m.custo * i.qtd) : "—"}</td>
                      <td className="py-3 pr-3 text-right tabular-nums">{m?.liberacaoDias} d</td>
                      <td className="py-3 pr-3">
                        <div className="flex flex-wrap gap-1">
                          {foraProtocolo && <Badge variant="outline" className="border-red-300 text-red-700">Fora do protocolo</Badge>}
                          {naoHomologado && <Badge variant="outline" className="border-amber-300 text-amber-700">Não homologado</Badge>}
                          {foraPadrao && !naoHomologado && <Badge variant="outline" className="border-amber-300 text-amber-700">Fora do padrão</Badge>}
                          {!foraProtocolo && !naoHomologado && !foraPadrao && (
                            <Badge variant="outline" className="border-emerald-300 text-emerald-700">{preferencial ? "Preferencial" : "No leque"}</Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3">
                        {l && l.aceitas.length > 0 && !confirmado ? (
                          <select
                            aria-label={`Trocar marca: ${nomeItem(i.itemId)}`}
                            className="rounded-md border border-cinza-300 bg-white px-2 py-1.5 text-[13px] max-w-[16rem]"
                            value={l.aceitas.some((x) => x.id === i.marcaId) ? i.marcaId : ""}
                            onChange={(e) => e.target.value && trocar(i.itemId, e.target.value)}
                          >
                            {!l.aceitas.some((x) => x.id === i.marcaId) && <option value="" disabled>{m?.fabricante} (fora do leque)</option>}
                            {l.aceitas.map((x) => (
                              <option key={x.id} value={x.id}>
                                {x.fabricante} · {brl(x.custo)} · {x.liberacaoDias} d{l.preferenciais.some((p) => p.id === x.id) ? " · preferencial" : ""}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-[12px] text-cinza-500">{foraProtocolo ? "Sem leque: item fora do protocolo" : "—"}</span>
                        )}
                        {l?.avisoMinimo && <p className="text-[11px] text-amber-700 mt-1">Leque com menos de 3 marcas nesta operadora</p>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {pedido.justificativa && (
            <p className="mt-3 text-[13px] text-cinza-600 flex items-start gap-1">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" aria-hidden /> Justificativa do médico: {pedido.justificativa}
            </p>
          )}
          {pedido.aceitoForaPadrao && <p className="mt-2 text-[13px] text-cinza-600">Aceito fora do padrão: {pedido.aceitoForaPadrao.motivo}</p>}
        </Caixa>

        <div className="grid gap-5 lg:grid-cols-2">
          <Caixa titulo="Pagamento a fornecedores">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="text-left text-[11px] uppercase text-cinza-500">
                  <th className="py-1 pr-3">Fornecedor</th>
                  <th className="py-1 pr-3 text-right">Valor</th>
                  <th className="py-1 pr-3 text-right">Prazo</th>
                  <th className="py-1 text-right">Vencimento</th>
                </tr>
              </thead>
              <tbody>
                {[...porFornecedor.entries()].map(([f, v]) => (
                  <tr key={f} className="border-t border-cinza-200">
                    <td className="py-2 pr-3">{f}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{brl(v.valor)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{v.prazo} d</td>
                    <td className={`py-2 text-right tabular-nums ${pedido.dataCirurgia && addDias(pedido.dataCirurgia, v.prazo) < recebeOperadora ? "text-amber-700" : ""}`}>
                      {pedido.dataCirurgia ? dataBR(addDias(pedido.dataCirurgia, v.prazo)) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[13px] text-cinza-500 mt-3">
              {operadora.nome} paga em {operadora.prazoPagamentoDias} dias ({dataBR(recebeOperadora)}). Vencimentos em laranja caem antes desse recebimento.
            </p>
          </Caixa>

          <Caixa titulo="Checklist do pedido">
            <ul className="space-y-1.5 text-[14px]">
              {a.checklist.map((c) => (
                <li key={c.id} className="flex items-start gap-2">
                  <span className={c.ok ? "text-emerald-600" : "text-amber-600"} aria-hidden>{c.ok ? "✓" : "!"}</span>
                  <span className="text-cinza-700">{c.label}{c.detalhe && <span className="text-cinza-500"> · {c.detalhe}</span>}</span>
                </li>
              ))}
            </ul>
            <p className="text-[12px] text-cinza-500 mt-3">Cotação, autorização e faturamento seguem no OPMEnexo.</p>
          </Caixa>
        </div>
      </main>
    </div>
  );
};

export default RevisaoPedido;
