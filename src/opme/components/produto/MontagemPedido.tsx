import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, ChevronRight, Clock, Eye, Info, RotateCcw, Send, ShieldCheck, Sparkles, Stethoscope, TrendingUp, Wand2, X } from "lucide-react";
import {
  DestaqueOpcao, ItemPedido, LABEL_CLASSE, LABEL_DESTAQUE, LABEL_TIPO_FORNECIMENTO, LABEL_TIPO_GLOSA, OpcaoPedido,
} from "@opme/types/produto";
import { Patient } from "@opme/types/patient";
import { useEscolhas } from "@opme/contexts/EscolhasContext";
import { useOtimizador } from "@opme/contexts/OtimizadorContext";
import { entregaATempo, formatBRL } from "@opme/lib/produto";
import { AnaliseItem, MAX_TENTATIVAS, SituacaoItem, analisarItem } from "@opme/lib/otimizador";
import { nomeComprador } from "@opme/lib/gerencia";
import { prazoEntrega } from "@opme/mock/catalogo";
import { cn } from "@opme/lib/utils";
import { Button } from "@opme/components/ui/button";
import RiscoBadge from "./RiscoBadge";
import NotaMedico from "./NotaMedico";
import DialogoRecusa from "./DialogoRecusa";
import ChipHomologacao from "./ChipHomologacao";

interface MontagemPedidoProps {
  patient: Patient;
  itens: ItemPedido[];
  /** Tático e estratégico só veem: como está e quanto poderia ser, sem editar */
  somenteLeitura?: boolean;
}

const ESTILO_DESTAQUE: Record<DestaqueOpcao, string> = {
  preferido_medico: "bg-amber-50 border-amber-200 text-amber-800",
  maior_margem: "bg-emerald-50 border-emerald-200 text-emerald-700",
  menor_custo: "bg-sky-50 border-sky-200 text-sky-700",
  menor_glosa: "bg-violet-50 border-violet-200 text-violet-700",
};

export const ChipClasse = ({ classe }: { classe: ItemPedido["classe"] }) => (
  <span
    title={LABEL_CLASSE[classe]}
    className={cn(
      "inline-flex px-1.5 py-px rounded border text-[10px] font-bold tracking-wide",
      classe === "OP" ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-teal-50 border-teal-200 text-teal-700"
    )}
  >
    {classe}
  </span>
);

/** Situação do item na lista de compras, sempre com o quanto pode ganhar */
const SituacaoDoItem = ({ a }: { a: AnaliseItem }) => {
  const mapa: Record<SituacaoItem, [string, string]> = {
    sugerido: [`Sugestão do otimizador +${formatBRL(a.ganho)}`, "text-[#325AA4]"],
    otimizavel: [`Pode ganhar +${formatBRL(a.ganho)}`, "text-status-success-text"],
    melhor_margem: ["Na maior margem", "text-cinza-500"],
    aceito: [`Aceito${a.capturado > 0 ? ` · +${formatBRL(a.capturado)}` : ""}`, "text-status-success-text"],
    definido: [`Fechado${a.por ? ` por ${nomeComprador(a.por)}` : ""}`, "text-status-success-text"],
    nao_otimizavel: ["Não otimizável", "text-status-error-text"],
    removido: ["Removido do fluxo", "text-cinza-500"],
  };
  const [texto, cor] = mapa[a.situacao];
  if ((a.situacao === "definido" || a.situacao === "aceito") && a.deixado > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[12px] font-semibold whitespace-nowrap text-amber-700" title={`Fechado${a.por ? ` por ${nomeComprador(a.por)}` : ""} abaixo da maior margem`}>
        <AlertTriangle className="w-3.5 h-3.5" />
        Deixou {formatBRL(a.deixado)} na mesa
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-center gap-1 text-[12px] font-semibold whitespace-nowrap", cor)} title={a.motivo}>
      {(a.situacao === "sugerido" || a.situacao === "otimizavel") && <Sparkles className="w-3.5 h-3.5" />}
      {texto}
    </span>
  );
};

interface CartaoProps {
  opcao: OpcaoPedido;
  a: AnaliseItem;
  patient: Patient;
  onRecusar: () => void;
  somenteLeitura?: boolean;
}

/** Uma combinação item + fornecedor: quanto ganha sobre a atual, preferência do médico, prazo e ações */
const CartaoOpcao = ({ opcao, a, patient, onRecusar, somenteLeitura }: CartaoProps) => {
  const { escolhas, escolher, desfazer } = useEscolhas();
  const ehEscolhida = a.escolhida?.id === opcao.id;
  const ehSugestao = a.sugerida?.id === opcao.id && !a.escolhida;
  const alternativa = opcao.origem === "alternativa";
  const aTempo = entregaATempo(opcao, patient.diasAteCirurgia);
  const delta = opcao.margem - (a.atual?.margem ?? 0);
  const atualSemEscolha = !a.escolhida && a.atual?.id === opcao.id;

  return (
    <div
      className={cn(
        "rounded-lg border p-4 space-y-3",
        ehEscolhida ? "border-status-success-border bg-status-success-bg" : ehSugestao ? "border-[#325AA4] bg-[#F4F7FC] ring-1 ring-[#325AA4]" : "border-cinza-200 bg-white"
      )}
    >
      <div className="flex flex-wrap gap-1.5">
        {ehSugestao && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-bold bg-[#325AA4] border-[#325AA4] text-white">
            <Wand2 className="w-3 h-3" /> Sugestão do otimizador
          </span>
        )}
        {atualSemEscolha && (
          <span className="inline-flex px-2 py-0.5 rounded border text-[11px] font-bold bg-cinza-100 border-cinza-200 text-cinza-600">No pedido hoje</span>
        )}
        {somenteLeitura && ehEscolhida && (
          <span className="inline-flex px-2 py-0.5 rounded border text-[11px] font-bold bg-cinza-100 border-cinza-200 text-cinza-600">
            No pedido{a.por ? ` · fechado por ${nomeComprador(a.por)}` : ""}
          </span>
        )}
        {opcao.destaques.map((d) => (
          <span key={d} className={cn("inline-flex px-2 py-0.5 rounded border text-[11px] font-bold", ESTILO_DESTAQUE[d])}>
            {LABEL_DESTAQUE[d]}
          </span>
        ))}
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 flex-wrap text-[14px] font-semibold text-cinza-700">
            {opcao.fornecedor}
            {!opcao.homologado && <ChipHomologacao operadora={patient.convenio} />}
          </p>
          {opcao.equivalente && <p className="text-[13px] text-cinza-700">{opcao.item}</p>}
          <p className="inline-flex items-center gap-1 mt-0.5 text-[11px] font-semibold text-cinza-500">
            <ShieldCheck className="w-3 h-3" />
            ANVISA {opcao.registroAnvisa}{opcao.equivalente && " · equivalente técnico"}
          </p>
        </div>
        {!atualSemEscolha && !ehEscolhida && (
          <span className="text-right shrink-0">
            <span className="block text-[10px] font-semibold uppercase tracking-wide text-cinza-500">vs. hoje</span>
            <span className={cn("text-[16px] font-bold tabular-nums", delta > 0 ? "text-status-success-text" : delta < 0 ? "text-status-error-text" : "text-cinza-500")}>
              {delta > 0 ? "+" : ""}{formatBRL(delta)}
            </span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 text-[12px] text-cinza-600">
        <NotaMedico nota={opcao.notaMedico} />
        <span>
          {opcao.usoMedicoPct > 0
            ? `Médico usou em ${opcao.usoMedicoPct}% (${opcao.usoMedicoCirurgias} de ${a.item.historicoMedicoCirurgias} cirurgias)`
            : "Sem uso no histórico do médico"}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 rounded-md bg-cinza-50 border border-cinza-100 p-2.5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-cinza-500">Custo unit.</p>
          <p className="text-[13px] font-bold tabular-nums text-cinza-700">{formatBRL(opcao.custoUnitario)}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-cinza-500">Glosa</p>
          <p className="text-[13px] font-bold tabular-nums text-cinza-700">{opcao.riscoGlosa}%</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-cinza-500">Margem</p>
          <p className={cn("text-[13px] font-bold tabular-nums", opcao.margem >= 0 ? "text-status-success-text" : "text-status-error-text")}>
            {formatBRL(opcao.margem)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-cinza-500">Entrega</p>
          <p className={cn("text-[13px] font-bold tabular-nums", aTempo ? "text-cinza-700" : "text-status-error-text")}>{prazoEntrega(opcao.fornecedor)} d</p>
        </div>
      </div>
      {!aTempo && (
        <p className="flex items-center gap-1 text-[11px] font-semibold text-status-error-text">
          <Clock className="w-3.5 h-3.5" /> Não entrega antes da cirurgia
        </p>
      )}

      {!somenteLeitura && <div className="flex items-center justify-end gap-2">
        {ehEscolhida ? (
          <>
            <span className="text-[12px] font-semibold mr-auto text-status-success-text">
              {alternativa ? "Proposta ao médico" : "Escolhido para o pedido"}
            </span>
            {escolhas[a.item.id] && (
              <Button variant="ghost" size="sm" onClick={() => desfazer(a.item.id)} className="text-cinza-500">
                <RotateCcw className="w-4 h-4 mr-1" />
                Desfazer
              </Button>
            )}
          </>
        ) : ehSugestao ? (
          <>
            <Button variant="outline" size="sm" onClick={onRecusar}>
              <X className="w-4 h-4 mr-1" />
              Recusar
            </Button>
            <Button size="sm" onClick={() => escolher(a.item.id, patient.id, opcao)} className="bg-[#27AE60] hover:bg-[#229954] text-white">
              <Check className="w-4 h-4 mr-1" />
              Aceitar
            </Button>
          </>
        ) : alternativa ? (
          <Button variant="outline" size="sm" onClick={() => escolher(a.item.id, patient.id, opcao)}>
            <Send className="w-4 h-4 mr-1" />
            Propor ao médico
          </Button>
        ) : (
          <Button size="sm" variant={atualSemEscolha ? "outline" : "default"} onClick={() => escolher(a.item.id, patient.id, opcao)}
            className={atualSemEscolha ? "" : "bg-[#27AE60] hover:bg-[#229954] text-white"}>
            <Check className="w-4 h-4 mr-1" />
            {atualSemEscolha ? "Manter" : "Escolher"}
          </Button>
        )}
      </div>}
    </div>
  );
};

/**
 * Montagem do pedido, caso a caso: itens à esquerda com a situação de otimização; à direita, as
 * combinações do item — os 3 fornecedores indicados pelo médico e as alternativas fora da indicação.
 */
const MontagemPedido = ({ patient, itens, somenteLeitura = false }: MontagemPedidoProps) => {
  const { escolhas, escolherVarios } = useEscolhas();
  const { estado, recusar, remover } = useOtimizador();
  const [selecionadoId, setSelecionadoId] = useState<string | undefined>(itens[0]?.id);
  const [recusando, setRecusando] = useState<AnaliseItem | null>(null);

  useEffect(() => {
    if (!itens.some((i) => i.id === selecionadoId)) setSelecionadoId(itens[0]?.id);
  }, [itens, selecionadoId]);

  const analises = useMemo(() => itens.map((i) => analisarItem(i, patient, escolhas, estado)), [itens, patient, escolhas, estado]);
  const sel = analises.find((a) => a.item.id === selecionadoId);
  const doMedico = sel?.item.opcoes.filter((o) => o.origem === "medico") ?? [];
  const alternativas = sel?.item.opcoes.filter((o) => o.origem === "alternativa") ?? [];
  const comGanho = analises.filter((a) => (a.situacao === "otimizavel" || a.situacao === "sugerido") && (a.sugerida ?? a.melhor));
  const ganhoTotal = comGanho.reduce((s, a) => s + a.ganho, 0);

  const aplicarMaiorMargem = () =>
    escolherVarios(comGanho.map((a) => ({ itemId: a.item.id, cirurgiaId: patient.id, opcao: (a.sugerida ?? a.melhor)! })));

  if (itens.length === 0) {
    return (
      <div className="bg-surface rounded-lg shadow-elevation-1 p-6 text-[13px] text-cinza-500 italic">
        O pedido desta cirurgia ainda não foi lido.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
      {/* Itens do pedido */}
      <div className="xl:col-span-7 bg-surface rounded-lg shadow-elevation-1 overflow-hidden">
        <div className="px-5 py-4 border-b border-cinza-200 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-[13px] font-bold text-cinza-700 uppercase tracking-wide">Itens do pedido</h3>
            <p className="text-[12px] text-cinza-500 mt-0.5">
              {somenteLeitura ? "Como está e quanto poderia ser. Clique num item para ver os fornecedores." : "Clique num item para comparar os fornecedores."}
            </p>
          </div>
          {somenteLeitura ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cinza-100 border border-cinza-200 text-[12px] font-semibold text-cinza-600">
              <Eye className="w-3.5 h-3.5" />
              Somente visualização
            </span>
          ) : comGanho.length > 0 && (
            <Button size="sm" onClick={aplicarMaiorMargem} className="bg-[#325AA4] hover:bg-[#2A4C8C] text-white">
              <TrendingUp className="w-4 h-4 mr-1.5" />
              Aplicar a maior margem · +{formatBRL(ganhoTotal)}
            </Button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="bg-cinza-50 border-b border-cinza-200 text-[11px] uppercase tracking-wide text-cinza-500">
                <th className="py-2.5 pl-5 pr-2 font-semibold">Item</th>
                <th className="py-2.5 px-2 font-semibold text-right">Qtd.</th>
                <th className="py-2.5 px-2 font-semibold">Fornecedor</th>
                <th className="py-2.5 px-2 font-semibold text-right">{somenteLeitura ? "Margem hoje" : "Margem"}</th>
                {somenteLeitura && <th className="py-2.5 px-2 font-semibold text-right">Poderia ser</th>}
                <th className="py-2.5 pl-2 pr-5 font-semibold">{somenteLeitura ? "Situação" : "Otimização"}</th>
              </tr>
            </thead>
            <tbody>
              {analises.map((a) => {
                const ativo = a.item.id === selecionadoId;
                return (
                  <tr
                    key={a.item.id}
                    onClick={() => setSelecionadoId(a.item.id)}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setSelecionadoId(a.item.id))}
                    tabIndex={0}
                    aria-selected={ativo}
                    className={cn(
                      "border-b border-cinza-100 last:border-0 cursor-pointer focus:outline-none focus-visible:bg-[#EEF7FD]",
                      ativo ? "bg-[#EEF7FD] shadow-[inset_3px_0_0_#008DDF]" : "hover:bg-cinza-50"
                    )}
                  >
                    <td className="py-3 pl-5 pr-2">
                      <p className="flex items-center gap-1.5 text-[13px] font-semibold text-cinza-700">
                        <ChipClasse classe={a.item.classe} />
                        {a.atual?.item ?? a.item.nome}
                      </p>
                      <p className="text-[11px] text-cinza-500">
                        {LABEL_TIPO_FORNECIMENTO[a.item.tipoFornecimento]} · TUSS {a.item.codigoTuss}
                      </p>
                    </td>
                    <td className="py-3 px-2 text-right text-[13px] tabular-nums text-cinza-700">{a.item.quantidade}</td>
                    <td className="py-3 px-2 text-[13px] text-cinza-700">
                      <span className="flex items-center gap-1.5 flex-wrap">
                        {a.atual?.fornecedor}
                        {a.atual && !a.atual.homologado && <ChipHomologacao operadora={patient.convenio} />}
                      </span>
                      <p className="text-[11px] text-cinza-500">
                        {a.escolhida ? (a.por ? `fechado por ${nomeComprador(a.por)}` : "fechado") : "preferido do médico"}
                      </p>
                    </td>
                    <td className={cn("py-3 px-2 text-right text-[13px] font-semibold tabular-nums whitespace-nowrap", (a.atual?.margem ?? 0) >= 0 ? "text-cinza-700" : "text-status-error-text")}>
                      {formatBRL(a.atual?.margem ?? 0)}
                    </td>
                    {somenteLeitura && (
                      <td className="py-3 px-2 text-right tabular-nums">
                        {a.deixado + a.ganho > 0 ? (
                          <>
                            <p className="text-[13px] font-semibold text-cinza-700">{formatBRL((a.atual?.margem ?? 0) + a.deixado + a.ganho)}</p>
                            <p className="text-[11px] text-cinza-500">{(a.deixado > 0 ? a.maior : a.sugerida ?? a.melhor)?.fornecedor}</p>
                          </>
                        ) : (
                          <span className="text-[12px] text-cinza-400">igual</span>
                        )}
                      </td>
                    )}
                    <td className="py-3 pl-2 pr-5">
                      <span className="inline-flex items-center gap-1">
                        <SituacaoDoItem a={a} />
                        <ChevronRight className={cn("w-4 h-4", ativo ? "text-[#008DDF]" : "text-cinza-300")} />
                      </span>
                      {a.situacao === "nao_otimizavel" && <p className="text-[11px] text-red-700">{a.motivo}</p>}
                      {a.tentativas > 0 && (
                        <p className="flex items-center gap-1 text-[11px] text-cinza-500">
                          <AlertTriangle className="w-3 h-3" /> {a.tentativas} de {MAX_TENTATIVAS} recusas
                        </p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Combinações do item selecionado */}
      {sel && (
        <aside className="xl:col-span-5 xl:sticky xl:top-4 bg-surface rounded-lg shadow-elevation-1" aria-label={`Fornecedores para ${sel.item.nome}`}>
          <div className="p-5 border-b border-cinza-200 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#008DDF]">{somenteLeitura ? "Fornecedores do item" : "Escolha do fornecedor"}</p>
                <h3 className="flex items-center gap-2 text-[16px] font-bold text-cinza-700 mt-0.5">
                  {sel.item.nome}
                  <ChipClasse classe={sel.item.classe} />
                </h3>
                <p className="text-[12px] text-cinza-500">
                  {sel.item.quantidade} un. · {LABEL_CLASSE[sel.item.classe]} · TUSS {sel.item.codigoTuss}
                </p>
              </div>
              <RiscoBadge risco={sel.atual?.riscoGlosa ?? sel.item.riscoGlosa} comLabel />
            </div>
            <SituacaoDoItem a={sel} />
            {sel.item.riscoGlosa >= 12 && (
              <p className="text-[12px] text-cinza-600 flex items-start gap-2">
                {sel.item.tipoGlosa && (
                  <span className="shrink-0 px-2 py-0.5 rounded bg-cinza-100 border border-cinza-200 text-[11px] font-semibold text-cinza-600">
                    Glosa {LABEL_TIPO_GLOSA[sel.item.tipoGlosa].toLowerCase()}
                  </span>
                )}
                <span>{sel.item.motivoRisco}</span>
              </p>
            )}
            <p className="flex items-center gap-2 text-[12px] text-cinza-600">
              <Stethoscope className="w-4 h-4 text-cinza-400" />
              Dr(a). {patient.medico} usou este item em {sel.item.historicoMedicoCirurgias} cirurgias.
            </p>
          </div>

          <div className="p-5 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-cinza-500">Indicados pelo médico no pedido</p>
            {doMedico.map((o) => (
              <CartaoOpcao key={o.id} opcao={o} a={sel} patient={patient} onRecusar={() => setRecusando(sel)} somenteLeitura={somenteLeitura} />
            ))}

            {alternativas.length > 0 && (
              <>
                <p className="pt-2 text-[11px] font-bold uppercase tracking-wide text-cinza-500">Fora da indicação · precisa do aval do médico</p>
                {alternativas.map((o) => (
                  <CartaoOpcao key={o.id} opcao={o} a={sel} patient={patient} onRecusar={() => setRecusando(sel)} somenteLeitura={somenteLeitura} />
                ))}
              </>
            )}

            <p className="flex items-start gap-1.5 pt-1 text-[11px] text-cinza-500">
              <Info className="w-3.5 h-3.5 shrink-0 mt-px" />
              {somenteLeitura
                ? "Poderia ser: a maior margem entre os fornecedores que o médico indicou e que a operadora homologa. As estrelas mostram a preferência do médico pelo histórico dele."
                : "O otimizador sugere a maior margem entre os 3 fornecedores que o médico indicou, homologados pela operadora e que entregam antes da cirurgia. As estrelas mostram a preferência do médico pelo histórico dele."}
            </p>
          </div>
        </aside>
      )}

      {recusando?.sugerida && (
        <DialogoRecusa
          aberto
          item={recusando.item.nome}
          fornecedor={recusando.sugerida.fornecedor}
          tentativas={recusando.tentativas}
          onFechar={() => setRecusando(null)}
          onRecusar={(motivo) => {
            recusar(recusando.item.id, recusando.sugerida!.id, motivo);
            setRecusando(null);
          }}
          onRemover={(justificativa) => {
            remover(recusando.item.id, justificativa);
            setRecusando(null);
          }}
        />
      )}
    </div>
  );
};

export default MontagemPedido;
