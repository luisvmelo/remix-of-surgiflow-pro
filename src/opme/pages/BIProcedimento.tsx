import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Eye, TrendingUp, TrendingDown, Info, ChevronRight, Stethoscope, DollarSign, AlertCircle, AlertTriangle, ShieldAlert, Wallet, History, ClipboardList, ShoppingCart } from "lucide-react";
import { useState } from "react";
import Sidebar from "@opme/components/Sidebar";
import Topbar from "@opme/components/Topbar";
import { Button } from "@opme/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@opme/components/ui/tabs";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@opme/components/ui/tooltip";
import { useBIProcedimento } from "@opme/hooks/useBIProcedimento";
import { useTicketMedioSimples } from "@opme/hooks/useTicketMedioSimples";
import { useUserRole, getRolePermissions } from "@opme/types/rbac";
import { KPISkeleton, CardSkeleton, ChartSkeleton } from "@opme/components/BISkeleton";
import { useConfig } from "@opme/contexts/ConfigContext";
import { useEscolhas } from "@opme/contexts/EscolhasContext";
import { useOtimizador } from "@opme/contexts/OtimizadorContext";
import { analisarCirurgia } from "@opme/lib/otimizador";
import { avaliarPedido, nomeComprador } from "@opme/lib/gerencia";
import StatusOtimizacao from "@opme/components/produto/StatusOtimizacao";
import { formatBRL, resumoCirurgia, textoDias } from "@opme/lib/produto";
import { cn } from "@opme/lib/utils";
import MontagemPedido from "@opme/components/produto/MontagemPedido";
import PreferenciasMedico from "@opme/components/produto/PreferenciasMedico";
import RiscoBadge from "@opme/components/produto/RiscoBadge";
import { MEDICOS } from "@opme/mock/catalogo";
import { ORIGENS_PEDIDO } from "@opme/config/produto";

type Aba = "previsao" | "historico" | "medico";
const ABAS: Aba[] = ["previsao", "historico", "medico"];

const BIProcedimento = () => {
  const { pacienteId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { config } = useConfig();
  const { escolhas } = useEscolhas();
  const { estado } = useOtimizador();

  const { data: biData, isLoading, isError, error, refetch } = useBIProcedimento(pacienteId || "");

  const [periodoFiltro, setPeriodoFiltro] = useState<number | null>(null); // null = todos os dados

  const origem = ORIGENS_PEDIDO[searchParams.get("origem") ?? ""];
  const somenteLeitura = !!origem;
  const voltar = () => navigate(origem?.path ?? "/dashboard");

  // Aba ativa fica na URL para sobreviver ao "voltar"
  const abaUrl = searchParams.get("aba") as Aba | null;
  const aba: Aba = abaUrl && ABAS.includes(abaUrl) ? abaUrl : "previsao";
  const setAba = (nova: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("aba", nova);
    setSearchParams(params, { replace: true });
  };

  // Hook para buscar ticket médio com filtro
  const { data: ticketMedioData } = useTicketMedioSimples({
    cdCirurgia: biData?.paciente?.cdCirurgia,
    cdConvenio: biData?.paciente?.cdConvenio,
    meses: periodoFiltro,
    enabled: !!biData?.paciente?.cdCirurgia,
  });

  // RBAC
  const userRole = useUserRole();
  const permissions = getRolePermissions(userRole);

  // Verificar permissões
  if (!permissions.canViewBI) {
    return (
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <AlertTriangle className="w-16 h-16 text-status-warning-text mb-4" />
          <h1 className="text-2xl font-semibold text-cinza-700 mb-2">Acesso Restrito</h1>
          <p className="text-cinza-500 text-center max-w-md mb-4">
            Você não tem permissão para visualizar o BI do Procedimento.
            Entre em contato com o administrador do sistema.
          </p>
          <Button onClick={voltar} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  // Estado de erro
  if (isError) {
    return (
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <AlertTriangle className="w-16 h-16 text-status-error-text mb-4" />
          <h1 className="text-2xl font-semibold text-cinza-700 mb-2">Erro ao carregar dados</h1>
          <p className="text-cinza-500 text-center max-w-md mb-4">
            {error instanceof Error ? error.message : "Ocorreu um erro ao buscar os dados do BI"}
          </p>
          <div className="flex gap-3">
            <Button onClick={() => refetch()} variant="default">
              Tentar Novamente
            </Button>
            <Button onClick={voltar} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Estado de loading
  if (isLoading || !biData) {
    return (
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col w-full">
          <Topbar />
          <main className="flex-1 p-6">
            <div className="max-w-[1440px] mx-auto space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <KPISkeleton />
                <KPISkeleton />
                <KPISkeleton />
                <KPISkeleton />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                  <CardSkeleton />
                </div>
                <div className="lg:col-span-4">
                  <CardSkeleton />
                </div>
              </div>
              <ChartSkeleton />
            </div>
          </main>
        </div>
      </div>
    );
  }

  const { paciente, cirurgia, kpis_procedimento, medico_stats, ranking_fornecedores_medico,
          ranking_fornecedores_proc, historico_glosas, procedimentos_glosados_operadora } = biData;

  const resumo = resumoCirurgia(cirurgia, escolhas);
  const analise = analisarCirurgia(cirurgia, escolhas, estado);
  const avaliacao = avaliarPedido(cirurgia, escolhas, estado);
  const mostrarAbaMedico = true;
  const medico = MEDICOS.find((m) => m.cd === paciente.cdPrestador);
  const abaAtiva = aba === "medico" && !mostrarAbaMedico ? "previsao" : aba;

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col w-full min-w-0 page-scroll overflow-y-auto">
        <Topbar />

        <main className="flex-1 p-6">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={voltar}
              className="flex items-center gap-2 mb-4 text-cinza-500 hover:text-cinza-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar{origem && ` para ${origem.label}`}
            </Button>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 text-[11px] text-cinza-500 mb-2">
                  <span>{origem?.label ?? "Lista de compras"}</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>{paciente.especialidade}</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>{paciente.procedimento_principal}</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-brand-azul font-semibold">Pedido</span>
                </div>
                <h1 className="text-[28px] leading-9 font-bold text-cinza-700">
                  Pedido da cirurgia
                </h1>
                <p className="text-[14px] text-cinza-500 mt-1">
                  Paciente: <span className="font-semibold text-cinza-700">{paciente.nome}</span>
                </p>
                <p className="text-[13px] text-cinza-500 mt-0.5">
                  Operadora: <span className="font-semibold text-cinza-700">{paciente.convenio}</span>
                  {" · "}Médico: <span className="font-semibold text-cinza-700">{paciente.medico_responsavel}</span>
                  {cirurgia.comprador && (
                    <>
                      {" · "}Comprador: <span className="font-semibold text-cinza-700">{nomeComprador(cirurgia.comprador)}</span>
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {somenteLeitura && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#F4F7FC] border border-[#325AA4]/30 text-[13px] font-semibold text-[#325AA4]">
                    <Eye className="w-4 h-4" />
                    Somente visualização
                  </span>
                )}
                <span className="inline-flex items-center px-3 py-1.5 rounded-md bg-cinza-100 border border-cinza-200 text-[13px] font-semibold text-cinza-700">
                  {cirurgia.tipoProcedimento} · Aviso {cirurgia.numeroAviso}
                </span>
                <span className={cn(
                  "inline-flex items-center px-3 py-1.5 rounded-md border text-[13px] font-semibold",
                  (cirurgia.diasAteCirurgia ?? 99) <= 7 ? "bg-status-error-bg border-red-200 text-status-error-text" : "bg-cinza-100 border-cinza-200 text-cinza-700"
                )}>
                  Cirurgia {cirurgia.dataCirurgia} · {textoDias(cirurgia.diasAteCirurgia)}
                </span>
                <RiscoBadge risco={resumo.riscoAtual} comLabel className="text-[13px] px-3 py-1.5" />
              </div>
            </div>
          </div>

          <Tabs value={abaAtiva} onValueChange={setAba} className="list-pattern company-list max-w-[1440px] mx-auto">
            <TabsList className="h-auto p-1 bg-cinza-100 border border-cinza-200 mb-6 flex-wrap justify-start">
              <TabsTrigger value="previsao" className="h-9 px-4 gap-2 text-[14px] font-semibold data-[state=active]:text-[#325AA4]">
                <ClipboardList className="w-4 h-4" />
                Itens e fornecedores
                {analise.pendentes + analise.itens.filter((a) => a.situacao === "otimizavel").length > 0 && (
                  <span className="ml-1 px-1.5 rounded bg-[#27AE60] text-white text-[11px] tabular-nums">
                    {analise.pendentes + analise.itens.filter((a) => a.situacao === "otimizavel").length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="historico" className="h-9 px-4 gap-2 text-[14px] font-semibold data-[state=active]:text-[#325AA4]">
                <History className="w-4 h-4" />
                Histórico da cirurgia
              </TabsTrigger>
              {mostrarAbaMedico && (
                <TabsTrigger value="medico" className="h-9 px-4 gap-2 text-[14px] font-semibold data-[state=active]:text-[#325AA4]">
                  <Stethoscope className="w-4 h-4" />
                  Médico
                </TabsTrigger>
              )}
            </TabsList>

            {/* ================= ABA 1 — ITENS E FORNECEDORES (montagem do pedido) ================= */}
            <TabsContent value="previsao" className="mt-0 space-y-6">
              <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4" role="region" aria-label="Custo, margem e risco do pedido">
                <div className="bg-surface rounded-lg shadow-elevation-1 p-5">
                  <p className="flex items-center gap-2 text-[12px] font-semibold text-cinza-500 uppercase tracking-wide">
                    <ShoppingCart className="w-4 h-4 text-[#325AA4]" />
                    Custo do pedido
                  </p>
                  <p className="text-[32px] font-bold text-cinza-700 mt-2 tabular-nums">{formatBRL(resumo.custoAtual)}</p>
                  <p className="text-[12px] text-cinza-500">
                    OP {formatBRL(resumo.custoPorClasse.OP)} · ME {formatBRL(resumo.custoPorClasse.ME)}
                  </p>
                </div>
                <div className="bg-surface rounded-lg shadow-elevation-1 p-5">
                  <p className="flex items-center gap-2 text-[12px] font-semibold text-cinza-500 uppercase tracking-wide">
                    <Wallet className="w-4 h-4 text-status-success-text" />
                    Margem OPME prevista
                  </p>
                  <p className={cn("text-[32px] font-bold mt-2 tabular-nums", resumo.margemAtual >= 0 ? "text-status-success-text" : "text-status-error-text")}>
                    {formatBRL(resumo.margemAtual)}
                  </p>
                  <p className="text-[12px] text-cinza-500">
                    {somenteLeitura
                      ? "Como o pedido está hoje"
                      : resumo.margemAtual !== resumo.margem
                      ? `${resumo.margemAtual > resumo.margem ? "+" : ""}${formatBRL(resumo.margemAtual - resumo.margem)} vs. os preferidos do médico`
                      : "Com os fornecedores preferidos do médico"}
                  </p>
                  {somenteLeitura ? (
                    avaliacao.poderia > avaliacao.hoje && (
                      <p className="text-[12px] font-semibold text-cinza-700 mt-1">Poderia ser: {formatBRL(avaliacao.poderia)}</p>
                    )
                  ) : analise.ganho > 0 && (
                    <p className="text-[12px] font-semibold text-status-success-text mt-1">
                      Com a otimização: {formatBRL(resumo.margemAtual + analise.ganho)}
                    </p>
                  )}
                </div>
                <div className="bg-surface rounded-lg shadow-elevation-1 p-5">
                  <p className="flex items-center gap-2 text-[12px] font-semibold text-cinza-500 uppercase tracking-wide">
                    <ShieldAlert className="w-4 h-4 text-status-error-text" />
                    Risco de glosa
                  </p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <p className="text-[32px] font-bold text-cinza-700 tabular-nums">{resumo.riscoAtual}%</p>
                    {resumo.riscoAtual !== resumo.risco && (
                      <p className="text-[14px] text-cinza-400 line-through tabular-nums">{resumo.risco}%</p>
                    )}
                  </div>
                  <p className="text-[12px] text-cinza-500">Valor exposto: {formatBRL(resumo.valorEmRisco)}</p>
                </div>
                {somenteLeitura ? (
                <div className="bg-surface rounded-lg shadow-elevation-1 p-5">
                  <p className="flex items-center gap-2 text-[12px] font-semibold text-cinza-500 uppercase tracking-wide">
                    <ClipboardList className="w-4 h-4 text-amber-600" />
                    Diferença para a maior margem
                  </p>
                  <p className={cn("text-[32px] font-bold mt-2 tabular-nums", avaliacao.poderia > avaliacao.hoje ? "text-amber-700" : "text-cinza-400")}>
                    {formatBRL(avaliacao.poderia - avaliacao.hoje)}
                  </p>
                  <p className="text-[12px] text-cinza-500 mt-1">
                    {avaliacao.naMesa > 0 && <>Deixado na mesa {formatBRL(avaliacao.naMesa)}<br /></>}
                    {avaliacao.podeGanhar > 0 && <>Ainda pode ganhar {formatBRL(avaliacao.podeGanhar)}<br /></>}
                    {resumo.definidos} de {resumo.itens} itens com compra fechada
                    {avaliacao.naoHomologados > 0 && ` · ${avaliacao.naoHomologados} não homologado${avaliacao.naoHomologados === 1 ? "" : "s"}`}
                  </p>
                </div>
                ) : (
                <div className="bg-surface rounded-lg shadow-elevation-1 p-5">
                  <p className="flex items-center gap-2 text-[12px] font-semibold text-cinza-500 uppercase tracking-wide">
                    <ClipboardList className="w-4 h-4 text-status-success-text" />
                    Pode ganhar
                  </p>
                  <p className="text-[32px] font-bold text-status-success-text mt-2 tabular-nums">+{formatBRL(analise.ganho)}</p>
                  {analise.ganho === 0 && <StatusOtimizacao analise={analise} className="mt-1" />}
                  <p className="text-[12px] text-cinza-500 mt-1">
                    {resumo.definidos} de {resumo.itens} itens definidos
                    {resumo.foraIndicacao > 0 && ` · ${resumo.foraIndicacao} proposta${resumo.foraIndicacao === 1 ? "" : "s"} ao médico`}
                  </p>
                </div>
                )}
              </section>

              <section className="space-y-4" role="region" aria-labelledby="itens-title">
                <div className="section-header">
                  <h3 id="itens-title" className="section-title">{somenteLeitura ? "Pedido: como está e quanto poderia ser" : "Montagem do pedido"}</h3>
                  <p className="text-[12px] text-cinza-500">Itens lidos do pedido cirúrgico · o médico indicou 3 fornecedores por item</p>
                </div>
                <MontagemPedido patient={cirurgia} itens={cirurgia.itensPedido ?? []} somenteLeitura={somenteLeitura} />
              </section>
            </TabsContent>

            {/* ================= ABA 2 — HISTÓRICO DA CIRURGIA ================= */}
            <TabsContent value="historico" className="mt-0 space-y-6">
              {/* KPIs do procedimento */}
              <section className="bn-wrap" role="region" aria-labelledby="kpis-title">
                <h2 id="kpis-title" className="sr-only">KPIs do Procedimento</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="lg:col-span-3"></div>
                  <div className="lg:col-span-2 mb-4 pb-3 border-b border-cinza-200 flex items-center justify-between">
                    <h3 className="text-[13px] leading-5 font-bold text-brand-azul uppercase tracking-wide">
                      Ticket Médio - Análise Temporal
                    </h3>
                    <select
                      value={periodoFiltro ?? 'all'}
                      onChange={(e) => setPeriodoFiltro(e.target.value === 'all' ? null : parseInt(e.target.value))}
                      className="px-3 py-2 border border-cinza-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-azul"
                      aria-label="Período do ticket médio"
                    >
                      <option value="all">Histórico completo</option>
                      <option value="12">Último ano</option>
                      <option value="24">Últimos 2 anos</option>
                      <option value="36">Últimos 3 anos</option>
                      <option value="48">Últimos 4 anos</option>
                      <option value="60">Últimos 5 anos</option>
                    </select>
                  </div>
                  <div className={`bn-pill ${kpis_procedimento.cobertura_pct >= 80 ? 'bn--success' : kpis_procedimento.cobertura_pct >= 50 ? 'bn--warning' : 'bn--danger'}`}>
                    <p className="bn-label">Cobertura do Procedimento</p>
                    <p className="bn-value">{kpis_procedimento.cobertura_pct}%</p>
                  </div>
                  <div className="bn-pill bn--danger">
                    <p className="bn-label">Ocorrência total de glosas</p>
                    <p className="bn-value">{kpis_procedimento.glosas_total} / {kpis_procedimento.total_cirurgias}</p>
                  </div>
                  <div className={`bn-pill ${kpis_procedimento.variacao_lucro_pct > 0 ? 'bn--success' : 'bn--danger'}`}>
                    <p className="bn-label">Valor previsto</p>
                    <p className="bn-value">
                      R$ {kpis_procedimento.lucro_medio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className={`bn-pill ${kpis_procedimento.variacao_custo_pct < 0 ? 'bn--success' : 'bn--danger'}`}>
                    <p className="bn-label">Ticket Médio Histórico</p>
                    <p className="bn-value">
                      R$ {(ticketMedioData?.ticket_medio_geral ?? kpis_procedimento.custo_medio).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="bn-pill bn--info">
                    <p className="bn-label">Ticket Médio Operadora</p>
                    <p className="bn-value">
                      R$ {(ticketMedioData?.ticket_medio_operadora ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </section>

              {/* Itens comuns, valor médio glosado, itens mais glosados */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6" role="region" aria-labelledby="historico-glosas-title">
                <h2 id="historico-glosas-title" className="sr-only">Histórico de Glosas</h2>

                <div className="bg-surface rounded-lg shadow-elevation-1">
                  <div className="p-4 border-b border-cinza-200">
                    <h3 className="section-sub uppercase tracking-wide">Itens Comuns Históricos</h3>
                    <p className="text-[10px] text-cinza-500 mt-1">Penetração nos procedimentos realizados</p>
                  </div>
                  <div className="p-4 max-h-[320px] overflow-y-auto">
                    <div className="space-y-3">
                      {historico_glosas.itens_comuns.length > 0 ? (
                        historico_glosas.itens_comuns.map((item, idx) => (
                          <div key={idx} className="py-2 border-b border-cinza-100 last:border-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[12px] text-cinza-700 flex-1">{item.nome}</span>
                              <span className="text-[11px] font-semibold text-brand-azul ml-2">{item.penetracao_pct}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-cinza-500">Média: {item.media_qtd.toFixed(2)}x</span>
                              {item.valor_medio !== undefined && item.valor_medio > 0 && (
                                <span className="text-[10px] font-semibold text-cinza-700">
                                  R$ {item.valor_medio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-[12px] text-cinza-500 italic text-center py-4">Nenhum item histórico disponível</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-surface rounded-lg shadow-elevation-1">
                  <div className="p-4 border-b border-cinza-200">
                    <h3 className="section-sub uppercase tracking-wide">Valor Médio Glosado</h3>
                    <p className="text-[10px] text-cinza-500 mt-1">Por procedimento histórico</p>
                  </div>
                  <div className="flex-1 flex flex-col justify-center items-center p-8">
                    <p className="text-[40px] leading-none font-bold text-status-error-text mb-2 tabular-nums">
                      {formatBRL(historico_glosas.valor_medio_glosado, 2)}
                    </p>
                    <p className="text-[12px] text-cinza-500 text-center">Valor médio glosado em procedimentos anteriores</p>
                  </div>
                </div>

                <div className="bg-surface rounded-lg shadow-elevation-1">
                  <div className="p-4 border-b border-cinza-200">
                    <h3 className="section-sub uppercase tracking-wide">Top Itens Mais Glosados</h3>
                    <p className="text-[10px] text-cinza-500 mt-1">Histórico de glosas por item</p>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 mb-3 pb-2 border-b border-cinza-200">
                      <span className="text-[10px] text-cinza-500 font-semibold uppercase tracking-wide">Item</span>
                      <span className="text-[10px] text-cinza-500 font-semibold uppercase tracking-wide text-center w-12">Qtd.</span>
                      <span className="text-[10px] text-cinza-500 font-semibold uppercase tracking-wide text-right w-24">Valor Médio</span>
                      <span className="text-[10px] text-cinza-500 font-semibold uppercase tracking-wide text-right w-16">Taxa</span>
                    </div>
                    <div className="space-y-3">
                      {historico_glosas.top_itens_glosados.length > 0 ? (
                        historico_glosas.top_itens_glosados.map((item, idx) => (
                          <div key={idx}>
                            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center mb-1.5">
                              <span className="text-[12px] text-cinza-700 font-medium truncate" title={item.nome}>{idx + 1}. {item.nome}</span>
                              <span className="text-[12px] text-cinza-700 text-center w-12">{item.quantidade_glosas}</span>
                              <span className="text-[12px] text-cinza-700 text-right w-24">
                                R$ {item.valor_medio_glosa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                              <span className="text-[12px] font-bold text-status-error-text text-right w-16">{item.taxa_glosa_pct}%</span>
                            </div>
                            <div className="w-full h-2 bg-cinza-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-status-error-text rounded-full transition-all"
                                style={{ width: `${Math.min(item.taxa_glosa_pct, 100)}%` }}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-[12px] text-cinza-500 italic text-center py-4">Nenhum item com histórico de glosa</p>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Procedimentos da operadora e ranking de fornecedores do procedimento */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 bg-surface rounded-lg shadow-elevation-1" role="region" aria-labelledby="glosa-operadora-title">
                  <div className="p-5 border-b border-cinza-200 flex items-center justify-between">
                    <div>
                      <h3 id="glosa-operadora-title" className="section-title">Histórico de Procedimentos</h3>
                      <p className="text-[10px] text-cinza-500 mt-1">
                        Todos os procedimentos de {paciente.procedimento_principal} na {paciente.convenio}
                      </p>
                    </div>
                    <TooltipProvider>
                      <UITooltip>
                        <TooltipTrigger asChild>
                          <button className="text-cinza-500 hover:text-cinza-700 transition-colors" aria-label="Sobre o histórico">
                            <Info className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-[12px]">Lista de todos os procedimentos realizados. Valor glosado mostra apenas glosas de itens OPME.</p>
                        </TooltipContent>
                      </UITooltip>
                    </TooltipProvider>
                  </div>
                  <div className="p-5">
                    {procedimentos_glosados_operadora.length > 0 ? (
                      <div className="max-h-[360px] overflow-y-auto relative">
                        <table className="w-full text-sm border-collapse">
                          <thead className="sticky top-0 z-20 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                            <tr>
                              <th className="text-left py-3 px-2 text-[10px] text-cinza-500 font-semibold uppercase tracking-wide bg-white">Data</th>
                              <th className="text-left py-3 px-2 text-[10px] text-cinza-500 font-semibold uppercase tracking-wide bg-white">Nº Atend.</th>
                              <th className="text-left py-3 px-2 text-[10px] text-cinza-500 font-semibold uppercase tracking-wide bg-white">Cód. Aviso</th>
                              <th className="text-left py-3 px-2 text-[10px] text-cinza-500 font-semibold uppercase tracking-wide bg-white">Médico</th>
                              <th className="text-right py-3 px-2 text-[10px] text-cinza-500 font-semibold uppercase tracking-wide bg-white">Valor Glosado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {procedimentos_glosados_operadora.map((proc, idx) => (
                              <tr key={idx} className="border-b border-cinza-100 last:border-0 hover:bg-cinza-50 transition-colors">
                                <td className="py-3 px-2 text-[12px] text-cinza-700">{proc.data}</td>
                                <td className="py-3 px-2 text-[12px] text-cinza-700">{proc.numero_atendimento}</td>
                                <td className="py-3 px-2 text-[12px] text-cinza-700 font-medium">{proc.codigo_aviso}</td>
                                <td className="py-3 px-2 text-[12px] text-cinza-700">{proc.nome_medico}</td>
                                <td className={`py-3 px-2 text-[12px] text-right font-semibold ${proc.valor_opme_glosado > 0 ? 'text-status-error-text' : 'text-cinza-400'}`}>
                                  {proc.valor_opme_glosado > 0
                                    ? `R$ ${proc.valor_opme_glosado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                    : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <AlertCircle className="w-12 h-12 text-cinza-300 mb-3" />
                        <p className="text-[14px] text-cinza-500">Nenhum procedimento encontrado para esta operadora e tipo de cirurgia.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-4 bg-surface rounded-lg shadow-elevation-1">
                  <div className="p-5 border-b border-cinza-200">
                    <h3 className="section-sub uppercase tracking-wide">Ranking de fornecedores do procedimento</h3>
                    <p className="text-[10px] text-cinza-500 mt-1">Menos glosados neste procedimento</p>
                  </div>
                  <div className="p-5 space-y-4">
                    {ranking_fornecedores_proc.map((f, idx) => (
                      <div key={idx} className="pb-3 border-b border-cinza-200 last:border-0">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-[13px] font-semibold text-cinza-700">{idx + 1}. {f.fornecedor}</p>
                          {f.recomendado && <span className="chip chip--info">Recomendado</span>}
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] text-cinza-500">
                            Taxa de glosa: <span className="font-semibold text-cinza-700">{f.taxa_glosa_pct.toLocaleString('pt-BR')}%</span>
                          </p>
                          {f.quantidade !== undefined && (
                            <p className="text-[11px] text-cinza-500">
                              Quantidade: <span className="font-semibold text-cinza-700">{f.quantidade} itens</span>
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </TabsContent>

            {/* ================= ABA 3 — MÉDICO (configurável por hospital) ================= */}
            {mostrarAbaMedico && (
              <TabsContent value="medico" className="mt-0 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-azul/10 flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-brand-azul" />
                  </div>
                  <div>
                    <p className="text-[16px] font-bold text-cinza-700">Dr(a). {paciente.medico_responsavel}</p>
                    <p className="text-[12px] text-cinza-500">
                      {medico?.crm ? `${medico.crm} · ` : ""}{paciente.especialidade} · em {paciente.procedimento_principal}
                    </p>
                  </div>
                </div>

                <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" role="region" aria-label="Médico responsável">
                  {config.estatisticasMedico && (<>
                  <div className="bg-surface rounded-lg shadow-elevation-1 flex flex-col">
                    <div className="px-4 py-3 border-b border-cinza-200 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-status-error-bg flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-4 h-4 text-status-error-text" />
                      </div>
                      <h3 className="text-[11px] leading-4 font-semibold text-cinza-700 uppercase tracking-wide">Ocorrência de glosa (médico)</h3>
                    </div>
                    <div className="flex-1 flex flex-col justify-center px-4 py-5">
                      <div className="text-center mb-4">
                        <p className="text-[36px] leading-none font-bold text-cinza-700">{medico_stats.glosa_pct}%</p>
                        {medico_stats.total_cirurgias !== undefined && medico_stats.total_cirurgias_glosadas !== undefined && (
                          <p className="text-[12px] text-cinza-500 mt-1">
                            {medico_stats.total_cirurgias_glosadas} de {medico_stats.total_cirurgias} cirurgias
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        {medico_stats.distribuicao_motivos.map((motivo, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <span className={`chip ${
                              motivo.cor === 'error' ? 'chip--danger' :
                              motivo.cor === 'warning' ? 'chip--warning' :
                              'chip chip--info'
                            }`}>
                              {motivo.motivo}
                            </span>
                            <span className="text-[13px] font-bold text-cinza-700">{motivo.percentual}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface rounded-lg shadow-elevation-1 flex flex-col">
                    <div className="px-4 py-3 border-b border-cinza-200 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-status-success-bg flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-4 h-4 text-status-success-text" />
                      </div>
                      <h3 className="text-[11px] leading-4 font-semibold text-cinza-700 uppercase tracking-wide">Custo médio histórico (médico)</h3>
                    </div>
                    <div className="flex-1 flex flex-col justify-center px-4 py-5">
                      <p className="text-[36px] leading-none font-bold text-cinza-700 mb-4 text-center">
                        R$ {medico_stats.custo_medio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <div className="flex justify-center mb-3">
                        <div className={`chip ${medico_stats.variacao_custo_pct < 0 ? 'chip--success' : 'chip--danger'}`}>
                          {medico_stats.variacao_custo_pct < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                          <span>{medico_stats.variacao_custo_pct}% vs. média geral</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  </>)}

                  {config.rankingFornecedorMedico && (
                  <div className="bg-surface rounded-lg shadow-elevation-1">
                    <div className="p-4 border-b border-cinza-200">
                      <h3 className="section-sub uppercase tracking-wide">Fornecedores mais usados pelo médico</h3>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-cinza-200">
                        <span className="text-[10px] text-cinza-500 font-semibold uppercase tracking-wide">Fornecedor</span>
                        <span className="text-[10px] text-cinza-500 font-semibold uppercase tracking-wide">Cobertura</span>
                      </div>
                      <div className="space-y-3">
                        {ranking_fornecedores_medico.map((f, idx) => (
                          <div key={idx}>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex-1">
                                <span className="text-[12px] text-cinza-700 font-medium">{idx + 1}. {f.fornecedor}</span>
                                {f.quantidade !== undefined && (
                                  <p className="text-[11px] text-cinza-500 mt-0.5">
                                    Quantidade: <span className="font-semibold text-cinza-700">{f.quantidade} pedidos</span>
                                  </p>
                                )}
                              </div>
                              <span className="text-[12px] font-bold text-brand-azul">{f.score_0_100}%</span>
                            </div>
                            <div className="w-full h-2 bg-cinza-200 rounded-full overflow-hidden">
                              <div className="h-full bg-brand-azul rounded-full transition-all" style={{ width: `${f.score_0_100}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  )}
                </section>

                <PreferenciasMedico cdPrestador={paciente.cdPrestador} cdConvenio={paciente.cdConvenio} />
              </TabsContent>
            )}
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default BIProcedimento;
