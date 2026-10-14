import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowRight, Eye, Search, ShieldAlert, ShieldX, TrendingDown, TrendingUp, Wallet, type LucideIcon } from "lucide-react";
import Sidebar from "@opme/components/Sidebar";
import HospitalSelector from "@opme/components/produto/HospitalSelector";
import RiscoBadge from "@opme/components/produto/RiscoBadge";
import ChipHomologacao from "@opme/components/produto/ChipHomologacao";
import { usePatients } from "@opme/hooks/usePatients";
import { useEscolhas } from "@opme/contexts/EscolhasContext";
import { useOtimizador } from "@opme/contexts/OtimizadorContext";
import { formatBRL, formatPct, textoDias } from "@opme/lib/produto";
import { LABEL_ATRASO } from "@opme/lib/tatico";
import {
  AvaliacaoPedido, DESCRICAO_LENTE, DESCRICAO_SITUACAO_COMPRA, LABEL_LENTE, LABEL_SITUACAO_COMPRA, Lente, SituacaoCompra,
  avaliarPedido, desempenhoPorComprador, nomeComprador,
} from "@opme/lib/gerencia";
import { cn } from "@opme/lib/utils";

const FILTROS_STORAGE_KEY = "acompanhamento_filtros";

interface Filtros {
  lente: Lente;
  situacao: SituacaoCompra | null;
  comprador: string | null;
  atrasados: boolean;
  busca: string;
}

const FILTROS_PADRAO: Filtros = { lente: "na_mesa", situacao: null, comprador: null, atrasados: false, busca: "" };

/** Filtros sobrevivem à ida e volta do pedido da cirurgia */
function lerFiltros(): Filtros {
  try {
    const salvo = sessionStorage.getItem(FILTROS_STORAGE_KEY);
    if (salvo) return { ...FILTROS_PADRAO, ...JSON.parse(salvo) };
  } catch {
    // sessionStorage indisponível
  }
  return FILTROS_PADRAO;
}

const LENTES: Array<{ lente: Lente; icon: LucideIcon; cor: string }> = [
  { lente: "na_mesa", icon: TrendingDown, cor: "text-amber-700" },
  { lente: "pode_ganhar", icon: TrendingUp, cor: "text-status-success-text" },
  { lente: "margem_baixa", icon: Wallet, cor: "text-status-error-text" },
  { lente: "risco_glosa", icon: ShieldAlert, cor: "text-status-error-text" },
  { lente: "nao_homologado", icon: ShieldX, cor: "text-red-700" },
  { lente: "todas", icon: Eye, cor: "text-cinza-600" },
];

const SITUACOES: SituacaoCompra[] = ["a_cotar", "na_operadora", "a_comprar", "aguardando_entrega", "material_confirmado"];

const ESTILO_SITUACAO: Record<SituacaoCompra, string> = {
  a_cotar: "bg-amber-50 border-amber-200 text-amber-800",
  na_operadora: "bg-blue-50 border-blue-200 text-blue-700",
  a_comprar: "bg-violet-50 border-violet-200 text-violet-700",
  aguardando_entrega: "bg-orange-50 border-orange-200 text-orange-800",
  material_confirmado: "bg-emerald-50 border-emerald-200 text-emerald-700",
};

/** Ordem da lista em cada lente: o que mais pesa para a conversa com o comprador primeiro */
const ORDENAR: Record<Lente, (a: AvaliacaoPedido, b: AvaliacaoPedido) => number> = {
  na_mesa: (a, b) => b.naMesa - a.naMesa,
  pode_ganhar: (a, b) => b.podeGanhar - a.podeGanhar,
  margem_baixa: (a, b) => a.margemPct - b.margemPct,
  risco_glosa: (a, b) => b.resumo.riscoAtual - a.resumo.riscoAtual,
  nao_homologado: (a, b) => (a.p.diasAteCirurgia ?? 99) - (b.p.diasAteCirurgia ?? 99),
  todas: (a, b) => b.poderia - b.hoje - (a.poderia - a.hoje),
};

/**
 * Módulo tático: o gerente de compras vê como cada pedido está e quanto poderia ser, quem fechou,
 * o que falta cotar, comprar e pedir. Só visualiza; quem altera o pedido é Compras.
 */
const Acompanhamento = () => {
  const navigate = useNavigate();
  const { data: patients = [], isLoading } = usePatients();
  const { escolhas } = useEscolhas();
  const { estado } = useOtimizador();
  const [filtros, setFiltros] = useState<Filtros>(lerFiltros);

  useEffect(() => {
    try {
      sessionStorage.setItem(FILTROS_STORAGE_KEY, JSON.stringify(filtros));
    } catch {
      // segue só em memória
    }
  }, [filtros]);

  const mudar = (parcial: Partial<Filtros>) => setFiltros((f) => ({ ...f, ...parcial }));

  const avaliacoes = useMemo(
    () => patients.filter((p) => (p.diasAteCirurgia ?? -1) >= 0).map((p) => avaliarPedido(p, escolhas, estado)),
    [patients, escolhas, estado]
  );
  const compradores = useMemo(() => desempenhoPorComprador(avaliacoes), [avaliacoes]);

  // Filtros normais (situação, comprador, atraso, busca) valem para as lentes e para a lista
  const termo = filtros.busca.trim().toLowerCase();
  const filtradas = avaliacoes
    .filter((av) => !filtros.situacao || av.situacao === filtros.situacao)
    .filter((av) => !filtros.comprador || av.comprador === filtros.comprador)
    .filter((av) => !filtros.atrasados || av.atrasos.length > 0)
    .filter(
      (av) =>
        !termo ||
        [av.p.nmPaciente, av.p.nome, String(av.p.numeroAviso), av.p.procedimento, av.p.medico, av.p.convenio]
          .some((v) => v?.toLowerCase().includes(termo))
    );

  const resumoLente = (lente: Lente) => {
    const lista = filtradas.filter((av) => av.lentes.has(lente));
    const soma = (f: (av: AvaliacaoPedido) => number) => lista.reduce((s, av) => s + f(av), 0);
    const detalhe: Record<Lente, () => string> = {
      na_mesa: () => `${formatBRL(soma((av) => av.naMesa))} que dava para ganhar`,
      pode_ganhar: () => `+${formatBRL(soma((av) => av.podeGanhar))} ainda abertos`,
      margem_baixa: () => `margem somada ${formatBRL(soma((av) => av.hoje))}`,
      risco_glosa: () => `${formatBRL(soma((av) => av.resumo.valorEmRisco))} expostos a glosa`,
      nao_homologado: () => {
        const n = soma((av) => av.naoHomologados);
        return `${n} ${n === 1 ? "item não liberado" : "itens não liberados"}`;
      },
      todas: () => `${formatBRL(soma((av) => av.poderia - av.hoje))} de diferença total`,
    };
    return { quantidade: lista.length, detalhe: detalhe[lente]() };
  };

  const visiveis = filtradas.filter((av) => av.lentes.has(filtros.lente)).sort(ORDENAR[filtros.lente]);
  const contagemSituacao = (s: SituacaoCompra) =>
    avaliacoes.filter((av) => av.situacao === s && (!filtros.comprador || av.comprador === filtros.comprador)).length;

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col w-full min-w-0 page-scroll overflow-y-auto">
        <header className="bg-neutral-0 px-6 py-5 border-b border-neutral-100 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#008DDF]">Tático · Gerente de compras</p>
            <h1 className="text-[28px] leading-9 font-bold text-cinza-700 mt-1">Acompanhamento de compras</h1>
            <p className="text-[14px] text-cinza-500 mt-1">
              Como cada pedido está e quanto poderia ser: onde a margem ficou na mesa, o que tem risco e o que falta cotar, comprar e pedir.
            </p>
          </div>
          <div className="shrink-0">
            <HospitalSelector />
          </div>
        </header>

        <main className="flex-1 p-6 space-y-5 max-w-[1500px] w-full mx-auto">
          {/* Lentes do gerente */}
          <section aria-label="Visões do gerente" className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
            {LENTES.map(({ lente, icon: Icon, cor }) => {
              const { quantidade, detalhe } = resumoLente(lente);
              const ativa = filtros.lente === lente;
              return (
                <button
                  key={lente}
                  onClick={() => mudar({ lente })}
                  aria-pressed={ativa}
                  title={DESCRICAO_LENTE[lente]}
                  className={cn(
                    "text-left rounded-lg border bg-white px-3.5 py-2.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#325AA4]",
                    ativa ? "border-[#325AA4] bg-[#F4F7FC] shadow-[inset_0_-3px_0_#325AA4]" : "border-cinza-200 hover:border-cinza-300"
                  )}
                >
                  <span className="flex items-center gap-1.5 text-[13px] font-semibold text-cinza-700">
                    <Icon className={cn("w-4 h-4 shrink-0", cor)} />
                    <span className="truncate">{LABEL_LENTE[lente]}</span>
                    <span className="ml-auto text-[13px] font-bold tabular-nums text-cinza-700">{quantidade}</span>
                  </span>
                  <span className="block mt-0.5 text-[12px] text-cinza-500 truncate">{detalhe}</span>
                </button>
              );
            })}
          </section>

          {/* Por comprador */}
          <section className="rounded-xl border border-cinza-200 bg-white overflow-hidden" aria-labelledby="compradores-title">
            <div className="px-5 py-3 border-b border-cinza-200 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 id="compradores-title" className="text-[13px] font-semibold text-cinza-700 uppercase tracking-wide">Por comprador</h2>
                <p className="text-[12px] text-cinza-500">Itens fechados na maior margem e quanto ficou na mesa. Clique para ver os pedidos de um comprador.</p>
              </div>
              {filtros.comprador && (
                <button onClick={() => mudar({ comprador: null })} className="text-[12px] font-semibold text-[#008DDF] hover:underline">
                  Ver todos os compradores
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left">
                <thead>
                  <tr className="bg-cinza-50 border-b border-cinza-200 text-[11px] uppercase tracking-wide text-cinza-500">
                    <th className="py-2 pl-5 pr-2 font-semibold">Comprador</th>
                    <th className="py-2 px-2 font-semibold text-right">Pedidos</th>
                    <th className="py-2 px-2 font-semibold text-right">Itens fechados</th>
                    <th className="py-2 px-2 font-semibold">Na maior margem</th>
                    <th className="py-2 px-2 font-semibold text-right">Deixou na mesa</th>
                    <th className="py-2 pl-2 pr-5 font-semibold text-right">Ainda pode ganhar</th>
                  </tr>
                </thead>
                <tbody>
                  {compradores.map((c) => {
                    const pct = c.itensFechados > 0 ? (c.naMaior / c.itensFechados) * 100 : 0;
                    const ativo = filtros.comprador === c.nome;
                    const alternar = () => mudar({ comprador: ativo ? null : c.nome });
                    return (
                      <tr
                        key={c.nome}
                        onClick={alternar}
                        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), alternar())}
                        tabIndex={0}
                        aria-pressed={ativo}
                        className={cn(
                          "border-b border-cinza-100 last:border-0 cursor-pointer focus:outline-none focus-visible:bg-[#EEF7FD]",
                          ativo ? "bg-[#EEF7FD] shadow-[inset_3px_0_0_#008DDF]" : "hover:bg-cinza-50"
                        )}
                      >
                        <td className="py-2.5 pl-5 pr-2 text-[13px] font-semibold text-cinza-700">{nomeComprador(c.nome)}</td>
                        <td className="py-2.5 px-2 text-right text-[13px] tabular-nums text-cinza-700">{c.pedidos}</td>
                        <td className="py-2.5 px-2 text-right text-[13px] tabular-nums text-cinza-700">{c.itensFechados}</td>
                        <td className="py-2.5 px-2">
                          {c.itensFechados > 0 ? (
                            <span className="flex items-center gap-2">
                              <span className="w-24 h-1.5 rounded-full bg-cinza-100 overflow-hidden">
                                <span
                                  className={cn("block h-full rounded-full", pct >= 70 ? "bg-status-success-text" : pct >= 45 ? "bg-amber-500" : "bg-status-error-text")}
                                  style={{ width: `${pct}%` }}
                                />
                              </span>
                              <span className="text-[13px] font-semibold tabular-nums text-cinza-700">{formatPct(pct)}</span>
                            </span>
                          ) : (
                            <span className="text-[12px] text-cinza-400">sem itens fechados</span>
                          )}
                        </td>
                        <td className={cn("py-2.5 px-2 text-right text-[13px] font-semibold tabular-nums", c.naMesa > 0 ? "text-amber-700" : "text-cinza-400")}>
                          {formatBRL(c.naMesa)}
                        </td>
                        <td className={cn("py-2.5 pl-2 pr-5 text-right text-[13px] font-semibold tabular-nums", c.podeGanhar > 0 ? "text-status-success-text" : "text-cinza-400")}>
                          {c.podeGanhar > 0 ? `+${formatBRL(c.podeGanhar)}` : formatBRL(0)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Pedidos */}
          <section className="rounded-xl border border-cinza-200 bg-white overflow-hidden" aria-labelledby="lista-title">
            <div className="px-5 py-4 border-b border-cinza-200 space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h2 id="lista-title" className="text-[13px] font-semibold text-cinza-700 uppercase tracking-wide">
                    {LABEL_LENTE[filtros.lente]}
                    {filtros.comprador && ` · ${nomeComprador(filtros.comprador)}`}
                  </h2>
                  <p className="text-[12px] text-cinza-500 mt-0.5">
                    {DESCRICAO_LENTE[filtros.lente]} · {visiveis.length} {visiveis.length === 1 ? "pedido" : "pedidos"} · somente visualização
                  </p>
                </div>
                <label className="relative">
                  <span className="sr-only">Buscar pedido</span>
                  <Search className="w-4 h-4 text-cinza-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    value={filtros.busca}
                    onChange={(e) => mudar({ busca: e.target.value })}
                    placeholder="Paciente, aviso, procedimento, médico"
                    className="h-9 w-[280px] pl-8 pr-3 rounded-md border border-cinza-300 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#325AA4]"
                  />
                </label>
              </div>

              <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Situação da compra">
                <button
                  onClick={() => mudar({ situacao: null })}
                  aria-pressed={!filtros.situacao}
                  className={cn(
                    "h-8 px-3 rounded-full border text-[12px] font-semibold transition-colors",
                    !filtros.situacao ? "bg-[#325AA4] border-[#325AA4] text-white" : "bg-white border-cinza-300 text-cinza-600 hover:bg-cinza-50"
                  )}
                >
                  Toda a compra
                </button>
                {SITUACOES.map((s) => (
                  <button
                    key={s}
                    onClick={() => mudar({ situacao: filtros.situacao === s ? null : s })}
                    aria-pressed={filtros.situacao === s}
                    title={DESCRICAO_SITUACAO_COMPRA[s]}
                    className={cn(
                      "h-8 px-3 rounded-full border text-[12px] font-semibold transition-colors",
                      filtros.situacao === s ? "bg-[#325AA4] border-[#325AA4] text-white" : "bg-white border-cinza-300 text-cinza-600 hover:bg-cinza-50"
                    )}
                  >
                    {LABEL_SITUACAO_COMPRA[s]} <span className="tabular-nums opacity-75">{contagemSituacao(s)}</span>
                  </button>
                ))}
                <label className="ml-auto inline-flex items-center gap-2 text-[12px] font-semibold text-cinza-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filtros.atrasados}
                    onChange={(e) => mudar({ atrasados: e.target.checked })}
                    className="w-4 h-4 accent-[#325AA4]"
                  />
                  Só com atraso
                </label>
              </div>
            </div>

            {isLoading ? (
              <p className="p-6 text-[13px] text-cinza-500">Carregando…</p>
            ) : visiveis.length === 0 ? (
              <p className="p-6 text-[13px] text-cinza-500 italic">Nenhum pedido nesta visão com os filtros escolhidos.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1280px] text-left">
                  <thead>
                    <tr className="bg-cinza-50 border-b border-cinza-200 text-[11px] uppercase tracking-wide text-cinza-500">
                      <th className="py-2.5 pl-5 pr-2 font-semibold">Paciente / aviso</th>
                      <th className="py-2.5 px-2 font-semibold">Procedimento · operadora</th>
                      <th className="py-2.5 px-2 font-semibold">Cirurgia</th>
                      <th className="py-2.5 px-2 font-semibold">Compra</th>
                      <th className="py-2.5 px-2 font-semibold">Comprador</th>
                      <th className="py-2.5 px-2 font-semibold text-right">Margem hoje</th>
                      <th className="py-2.5 px-2 font-semibold text-right">Poderia ser</th>
                      <th className="py-2.5 px-2 font-semibold text-right">Diferença</th>
                      <th className="py-2.5 px-2 font-semibold">Glosa</th>
                      <th className="py-2.5 pl-2 pr-5" />
                    </tr>
                  </thead>
                  <tbody>
                    {visiveis.map((av) => {
                      const { p } = av;
                      const diferenca = av.poderia - av.hoje;
                      return (
                        <tr
                          key={p.id}
                          onClick={() => navigate(`/bi/procedimento/${p.id}?origem=acompanhamento`)}
                          className="border-b border-cinza-100 last:border-0 hover:bg-cinza-50 cursor-pointer align-top"
                        >
                          <td className="py-3 pl-5 pr-2">
                            <p className="text-[13px] font-bold text-cinza-700">{p.nmPaciente ?? p.nome}</p>
                            <p className="text-[12px] text-cinza-500">Aviso {p.numeroAviso}</p>
                          </td>
                          <td className="py-3 px-2 max-w-[250px]">
                            <p className="text-[13px] text-cinza-700 line-clamp-1" title={p.procedimento}>{p.procedimento}</p>
                            <p className="text-[12px] text-cinza-500 line-clamp-1">{p.medico} · {p.convenio}</p>
                          </td>
                          <td className="py-3 px-2">
                            <p className={cn("text-[13px] font-semibold whitespace-nowrap", (p.diasAteCirurgia ?? 99) <= 7 ? "text-status-error-text" : "text-cinza-700")}>
                              {textoDias(p.diasAteCirurgia)}
                            </p>
                            <p className="text-[12px] text-cinza-500">{p.dataCirurgia}</p>
                          </td>
                          <td className="py-3 px-2">
                            <span
                              title={DESCRICAO_SITUACAO_COMPRA[av.situacao]}
                              className={cn("inline-flex px-2 py-0.5 rounded-md border text-[11px] font-semibold whitespace-nowrap", ESTILO_SITUACAO[av.situacao])}
                            >
                              {LABEL_SITUACAO_COMPRA[av.situacao]}
                            </span>
                            {av.atrasos[0] && (
                              <p
                                className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-status-error-text whitespace-nowrap"
                                title={av.atrasos.map((a) => LABEL_ATRASO[a.tipo]).join(" · ")}
                              >
                                <AlertTriangle className="w-3 h-3" />
                                {LABEL_ATRASO[av.atrasos[0].tipo]} · +{av.atrasos[0].dias}d
                                {av.atrasos.length > 1 && ` (+${av.atrasos.length - 1})`}
                              </p>
                            )}
                          </td>
                          <td className="py-3 px-2 text-[13px] text-cinza-700 whitespace-nowrap">{nomeComprador(av.comprador)}</td>
                          <td className="py-3 px-2 text-right">
                            <p className={cn("text-[13px] font-semibold tabular-nums", av.hoje >= 0 ? "text-cinza-700" : "text-status-error-text")}>{formatBRL(av.hoje)}</p>
                            <p className={cn("text-[11px] tabular-nums", av.lentes.has("margem_baixa") ? "text-status-error-text font-semibold" : "text-cinza-500")}>
                              {formatPct(av.margemPct)} do cobrado
                            </p>
                          </td>
                          <td className="py-3 px-2 text-right text-[13px] font-semibold tabular-nums text-cinza-700">{formatBRL(av.poderia)}</td>
                          <td className="py-3 px-2 text-right">
                            {diferenca > 0 ? (
                              <>
                                <p className="text-[13px] font-bold tabular-nums text-amber-700">{formatBRL(diferenca)}</p>
                                <p className="text-[11px] text-cinza-500 whitespace-nowrap">
                                  {av.naMesa > 0 && av.podeGanhar > 0 ? "na mesa + aberto" : av.naMesa > 0 ? "ficou na mesa" : "ainda pode ganhar"}
                                </p>
                              </>
                            ) : (
                              <span className="text-[12px] text-cinza-400">na maior margem</span>
                            )}
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex flex-col items-start gap-1">
                              <RiscoBadge risco={av.resumo.riscoAtual} />
                              {av.naoHomologados > 0 && <ChipHomologacao operadora={p.convenio} quantidade={av.naoHomologados} />}
                            </div>
                          </td>
                          <td className="py-3 pl-2 pr-5 text-right">
                            <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#008DDF] whitespace-nowrap">
                              Ver pedido
                              <ArrowRight className="w-4 h-4" />
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default Acompanhamento;
