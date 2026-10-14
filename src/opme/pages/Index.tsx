import { useState } from "react";
import { CheckCheck, Columns3, List, Loader2, RefreshCw, TrendingUp, Wand2, XCircle } from "lucide-react";
import Sidebar from "@opme/components/Sidebar";
import Topbar from "@opme/components/Topbar";
import FilterBar from "@opme/components/FilterBar";
import KanbanColumn from "@opme/components/KanbanColumn";
import ListaCompras from "@opme/components/produto/ListaCompras";
import { Button } from "@opme/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@opme/components/ui/alert-dialog";
import { useFilters } from "@opme/contexts/FilterContext";
import { useListaCompras } from "@opme/hooks/useListaCompras";
import { formatBRL } from "@opme/lib/produto";
import { ANTECEDENCIA_MINIMA, LABEL_STATUS, MAX_TENTATIVAS, StatusCirurgia } from "@opme/lib/otimizador";
import { ORDEM_ETAPAS } from "@opme/lib/tatico";
import { cn } from "@opme/lib/utils";

type Visao = "lista" | "fluxo";
const VISAO_STORAGE_KEY = "visao_compras";

const lerVisao = (): Visao => {
  try {
    return localStorage.getItem(VISAO_STORAGE_KEY) === "fluxo" ? "fluxo" : "lista";
  } catch {
    return "lista";
  }
};

type FiltroStatus = "todas" | "ganho" | StatusCirurgia;

const FILTROS: Array<{ id: FiltroStatus; label: string }> = [
  { id: "todas", label: "Todas" },
  { id: "ganho", label: "Com ganho" },
  { id: "melhor_margem", label: LABEL_STATUS.melhor_margem },
  { id: "nao_otimizavel", label: LABEL_STATUS.nao_otimizavel },
  { id: "definida", label: LABEL_STATUS.definida },
];

/**
 * Lista de compras (módulo operacional): o otimizador roda sobre ela. O que já está na
 * maior margem não é mexido; o resto mostra quanto pode ganhar e pode ser otimizado de uma vez.
 */
const Index = () => {
  const { filteredPatients } = useFilters();
  const { linhas, totais, rodada, otimizarTudo, cancelarOtimizacao, aceitarTodas, aceitarCirurgia } = useListaCompras(filteredPatients);
  const [confirmarOtimizacao, setConfirmarOtimizacao] = useState(false);
  const [confirmarCancelamento, setConfirmarCancelamento] = useState(false);
  const [visao, setVisaoState] = useState<Visao>(lerVisao);
  const [filtro, setFiltro] = useState<FiltroStatus>("todas");
  const [processando, setProcessando] = useState(false);

  const setVisao = (nova: Visao) => {
    try {
      localStorage.setItem(VISAO_STORAGE_KEY, nova);
    } catch {
      // segue só em memória
    }
    setVisaoState(nova);
  };

  const rodar = () => {
    setConfirmarOtimizacao(false);
    setProcessando(true);
    window.setTimeout(() => {
      otimizarTudo();
      setProcessando(false);
    }, 700);
  };

  const visiveis = linhas.filter((l) =>
    filtro === "todas" ? true : filtro === "ganho" ? l.analise.status === "sugerida" || l.analise.status === "otimizavel" : l.analise.status === filtro
  );
  const contagem = (f: FiltroStatus) =>
    f === "todas" ? totais.cirurgias : f === "ganho" ? totais.sugeridas + totais.otimizaveis : linhas.filter((l) => l.analise.status === f).length;

  const tiles = [
    { label: "Margem OPME atual", valor: formatBRL(totais.margemAtual), detalhe: `${totais.cirurgias} cirurgias na lista`, tom: "text-neutral-600" },
    { label: "Com a otimização", valor: formatBRL(totais.margemAtual + totais.ganho), detalhe: "maior margem entre os indicados", tom: "text-status-success-text" },
    { label: "Pode ganhar", valor: `+${formatBRL(totais.ganho)}`, detalhe: `${totais.sugeridas + totais.otimizaveis} cirurgias com ganho`, tom: "text-status-success-text", destaque: true },
    { label: "Já capturado", valor: `+${formatBRL(totais.capturado)}`, detalhe: "com as escolhas de Compras", tom: "text-[#325AA4]" },
    { label: "Na maior margem", valor: String(totais.melhorMargem), detalhe: "não mexe", tom: "text-neutral-600" },
    { label: "Não otimizáveis", valor: String(totais.naoOtimizaveis), detalhe: "prazo ou recusas", tom: "text-status-error-text" },
  ];

  return (
    <div className="flex min-h-screen w-full bg-neutral-0">
      <Sidebar />

      <div className="flex-1 flex flex-col w-full min-w-0">
        <Topbar />
        <FilterBar />

        {/* Otimizador da lista de compras */}
        <section className="px-6 pt-5 space-y-4" aria-label="Otimização da lista de compras">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-[20px] font-bold text-neutral-600">Lista de compras</h2>
              <p className="text-[13px] text-neutral-500">
                O otimizador busca a <b>maior margem</b> entre os 3 fornecedores que o médico indicou, que entreguem antes da cirurgia. O que já está na maior margem não é mexido.
              </p>
            </div>
            <Button
              onClick={() => setConfirmarOtimizacao(true)}
              disabled={processando || totais.itensOtimizaveis === 0}
              className="h-11 px-5 bg-[#325AA4] hover:bg-[#2A4C8C] text-white"
              title={totais.itensOtimizaveis === 0 ? "Nenhum item com margem a ganhar" : undefined}
            >
              {processando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : rodada ? <RefreshCw className="w-4 h-4 mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
              {processando
                ? "Otimizando a margem…"
                : totais.itensOtimizaveis === 0
                  ? "Margem já otimizada"
                  : `${rodada ? "Reotimizar margem" : "Otimizar margem de tudo"} · +${formatBRL(totais.ganhoOtimizavel)}`}
            </Button>
          </div>

          {/* Otimização de margem ativa: aceitar ou cancelar */}
          {rodada && (
            <div className="flex items-center justify-between gap-4 flex-wrap rounded-lg border-2 border-[#325AA4] bg-[#F4F7FC] px-4 py-3" role="status">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-[#325AA4] flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-white" />
                </span>
                <div>
                  <p className="text-[14px] font-bold text-[#325AA4]">
                    Otimização de margem ativa · rodada {rodada.numero}, às{" "}
                    {new Date(rodada.em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className="text-[13px] text-neutral-600">
                    {totais.pendentes > 0
                      ? `${totais.pendentes} itens com sugestão de maior margem aguardando aceite: +${formatBRL(totais.ganhoSugerido)} de margem.`
                      : "Todas as sugestões de margem desta rodada já foram decididas."}
                    {totais.capturado > 0 && ` Já capturado: +${formatBRL(totais.capturado)}.`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {totais.pendentes > 0 && (
                  <Button onClick={aceitarTodas} className="h-10 bg-[#27AE60] hover:bg-[#229954] text-white">
                    <CheckCheck className="w-4 h-4 mr-2" />
                    Aceitar todas · +{formatBRL(totais.ganhoSugerido)}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setConfirmarCancelamento(true)}
                  className="h-10 border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancelar otimização
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {tiles.map((t) => (
              <div key={t.label} className={cn("rounded-lg border bg-neutral-0 p-4", t.destaque ? "border-emerald-300 bg-emerald-50/40" : "border-neutral-200")}>
                <p className="text-[12px] font-semibold text-neutral-500">{t.label}</p>
                <p className={cn("text-[24px] font-bold mt-1 tabular-nums", t.tom)}>{t.valor}</p>
                <p className="text-[11px] text-neutral-500">{t.detalhe}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="inline-flex p-1 rounded-lg bg-neutral-100 border border-neutral-200" role="tablist" aria-label="Visão da lista">
              {([["lista", "Lista", List], ["fluxo", "Fluxo de compras", Columns3]] as const).map(([id, label, Icon]) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={visao === id}
                  onClick={() => setVisao(id)}
                  className={cn(
                    "h-9 px-4 flex items-center gap-2 rounded-md text-[14px] font-semibold transition-colors",
                    visao === id ? "bg-neutral-0 text-[#325AA4] shadow-sm" : "text-neutral-500 hover:text-neutral-600"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por otimização">
              {FILTROS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFiltro(f.id)}
                  aria-pressed={filtro === f.id}
                  className={cn(
                    "px-3 py-1.5 rounded-full border text-[13px] font-semibold",
                    filtro === f.id ? "border-[#325AA4] bg-[#325AA4] text-white" : "border-neutral-300 text-neutral-600 hover:bg-neutral-100"
                  )}
                >
                  {f.label} <span className="opacity-70 tabular-nums">{contagem(f.id)}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <main className="flex-1 overflow-hidden">
          <div className="h-full px-6 py-5">
            {visiveis.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <h3 className="text-lg font-semibold text-cinza-700 mb-2">Nenhuma cirurgia neste filtro</h3>
                <p className="text-sm text-cinza-500 max-w-md">Ajuste os filtros ou o status de otimização.</p>
              </div>
            ) : visao === "lista" ? (
              <ListaCompras linhas={visiveis} onAceitar={aceitarCirurgia} />
            ) : (
              <div className="flex gap-4 h-full overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-max">
                  {ORDEM_ETAPAS.map((etapa, i) => {
                    const daEtapa = visiveis
                      .filter((l) => l.p.etapaProcesso === etapa)
                      .sort((a, b) => b.analise.ganho - a.analise.ganho || (a.p.diasAteCirurgia ?? 0) - (b.p.diasAteCirurgia ?? 0));
                    const ganho = daEtapa.reduce((s, l) => s + l.analise.ganho, 0);
                    return (
                      <KanbanColumn
                        key={etapa}
                        title={`${i + 1}. ${etapa}`}
                        detalhe={ganho > 0 ? `Pode ganhar +${formatBRL(ganho)}` : "Sem ganho pendente"}
                        patients={daEtapa.map((l) => l.p)}
                      />
                    );
                  })}
                </div>
              </div>
            )}
            <p className="text-[11px] text-neutral-500 mt-4">
              Regras: só os 3 fornecedores indicados pelo médico; o fornecedor precisa entregar antes da cirurgia; cirurgias com menos de {ANTECEDENCIA_MINIMA} dias seguem o pedido do médico;
              até {MAX_TENTATIVAS} recusas por item, depois Compras define manualmente.
            </p>
          </div>
        </main>
      </div>
      {/* Confirmação: otimizar a margem */}
      <AlertDialog open={confirmarOtimizacao} onOpenChange={setConfirmarOtimizacao}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Otimizar a margem da lista de compras?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-[14px] text-neutral-600">
                <p>
                  Em cada item, o otimizador vai sugerir o fornecedor de <b>maior margem</b> entre os 3 que o médico indicou e que entregam antes
                  da cirurgia. Itens que já estão na maior margem não mudam. Nada é comprado até você aceitar.
                </p>
                <div className="grid grid-cols-3 gap-2 rounded-lg bg-neutral-100 border border-neutral-200 p-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Itens</p>
                    <p className="text-[18px] font-bold text-neutral-600 tabular-nums">{totais.itensOtimizaveis}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Margem hoje</p>
                    <p className="text-[18px] font-bold text-neutral-600 tabular-nums">{formatBRL(totais.margemAtual)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Ganho de margem</p>
                    <p className="text-[18px] font-bold text-status-success-text tabular-nums">+{formatBRL(totais.ganhoOtimizavel)}</p>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={rodar} className="bg-[#325AA4] hover:bg-[#2A4C8C]">
              <Wand2 className="w-4 h-4 mr-2" />
              Otimizar margem
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmação: cancelar a otimização */}
      <AlertDialog open={confirmarCancelamento} onOpenChange={setConfirmarCancelamento}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar a otimização de margem?</AlertDialogTitle>
            <AlertDialogDescription>
              {totais.pendentes > 0 && `As ${totais.pendentes} sugestões pendentes (+${formatBRL(totais.ganhoSugerido)} de margem) saem da lista. `}
              O que já foi aceito continua no pedido. Você pode otimizar de novo quando quiser.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Manter otimização</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                cancelarOtimizacao();
                setConfirmarCancelamento(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Cancelar otimização
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
