import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, Users, Package, RefreshCw } from "lucide-react";
import Sidebar from "@opme/components/Sidebar";
import { Button } from "@opme/components/ui/button";
import { biGeralProvider, RankingsFiltrados } from "@opme/services/biGeralProvider";
import { RankingQuantidade } from "@opme/types/biGeral";
import { ModalDetalhesEtapa } from "@opme/components/bi/ModalDetalhesEtapa";
import { FiltrosDinamicosBI } from "@opme/components/bi/FiltrosDinamicosBI";
import { PainelGlosaMargem } from "@opme/components/bi/PainelGlosaMargem";
import { PainelOtimizacao } from "@opme/components/bi/PainelOtimizacao";
import HospitalSelector from "@opme/components/produto/HospitalSelector";
import { useBIGeral } from "@opme/hooks/useBIGeral";

const BIGeral = () => {
  const navigate = useNavigate();
  
  // Hook React Query para dados do BI Geral (atualização automática a cada 10 min)
  const { data, isLoading, isError, isFetching, refetch } = useBIGeral();
  
  const [activeTabCustos, setActiveTabCustos] = useState<"plano" | "medico" | "cirurgia">("plano");

  // Estados para toggle top/bottom 10
  const [showTopMedicos, setShowTopMedicos] = useState(true);
  const [showTopProcedimentos, setShowTopProcedimentos] = useState(true);
  const [showTopOperadoras, setShowTopOperadoras] = useState(true);
  const [showTopEspecialidades, setShowTopEspecialidades] = useState(true);

  // Estados para o modal de detalhes da etapa
  const [modalAberto, setModalAberto] = useState(false);
  const [etapaSelecionada, setEtapaSelecionada] = useState<string>("");
  const [dadosModal, setDadosModal] = useState<{
    operadoras: Array<{ nome: string; quantidade: number; valorTotal: number }>;
    totalProcedimentos: number;
    totalValor: number;
  }>({ operadoras: [], totalProcedimentos: 0, totalValor: 0 });

  // Estado para rankings filtrados
  const [rankingsFiltrados, setRankingsFiltrados] = useState<RankingsFiltrados | null>(null);

  // Callback para atualizar rankings
  const handleRankingsChange = useCallback((rankings: RankingsFiltrados | null) => {
    setRankingsFiltrados(rankings);
  }, []);

  // Função para abrir o modal com detalhes da etapa
  const handleAbrirModal = async (etapaNome: string) => {
    setEtapaSelecionada(etapaNome);
    setModalAberto(true);

    // Busca dados da etapa
    const dados = await biGeralProvider.getCirurgiasPorEtapa(etapaNome);
    setDadosModal(dados);
  };

  // Estado de carregamento inicial
  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-paragraph text-cinza-500">Carregando...</p>
        </div>
      </div>
    );
  }

  // Estado de erro
  if (isError || !data) {
    return (
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center flex-col gap-4">
          <p className="text-paragraph text-red-500">Erro ao carregar dados do BI Geral</p>
          <Button onClick={() => refetch()} variant="outline">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  // Função para obter top ou bottom 10
  const getRankingSlice = (ranking: RankingQuantidade[], showTop: boolean) => {
    if (showTop) {
      return ranking.slice(0, 10);
    } else {
      return [...ranking].reverse().slice(0, 10);
    }
  };

  // Cores para o gráfico de pizza
  const CHART_COLORS: Record<string, string> = {
    'Pacote': '#10B981',
    'Não-Pacote': '#3B82F6',
    'Mista': '#F59E0B'
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-background px-6 py-5 border-b border-neutral-100">
          <div className="max-w-[1440px] mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
                className="h-9 w-9"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#008DDF] mb-1">Estratégico · Comercial</p>
                <h1 className="text-[28px] leading-9 font-bold text-cinza-700">
                  Resultados
                </h1>
                <p className="text-[14px] text-cinza-500 mt-1">
                  Glosa, margem, situação e status das cirurgias, por operadora, cirurgia e classe de OPME
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <HospitalSelector />
                {/* Botão de atualização manual + indicador de loading */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="flex items-center gap-2 h-11"
                >
                  <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                  {isFetching ? 'Atualizando...' : 'Atualizar'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="list-pattern company-list max-w-[1440px] mx-auto space-y-6">

            {/* ========== OTIMIZAÇÃO DA LISTA DE COMPRAS ========== */}
            <PainelOtimizacao />

            {/* ========== GLOSA E MARGEM ========== */}
            <PainelGlosaMargem />

            {/* ========== WORKFLOW ========== */}
            <section className="bn-wrap" role="region" aria-labelledby="workflow-title">
              <h2 id="workflow-title" className="section-title mb-4">Pipeline de Cirurgias</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {data.workflow.map((etapa, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAbrirModal(etapa.nome)}
                    className="rounded-xl p-4 border-2 border-cinza-200 transition-all hover:shadow-md hover:border-brand-azul cursor-pointer text-left"
                    style={{ backgroundColor: etapa.cor }}
                  >
                    <p className="text-[11px] font-semibold text-cinza-600 uppercase tracking-wide mb-2">
                      {etapa.nome}
                    </p>
                    <p className="text-[24px] font-bold text-cinza-800 mb-1">
                      {etapa.quantidade}
                    </p>
                    <p className="text-[13px] font-semibold text-cinza-600">
                      R$ {etapa.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </button>
                ))}
              </div>
            </section>

            {/* ========== TEMPO MÉDIO ========== */}
            <section>
              <h2 className="section-title mb-4">Tempo Médio de Processamento</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border-2 border-cinza-200 bg-white p-6">
                  <h3 className="text-[13px] font-semibold text-cinza-600 uppercase tracking-wide mb-2">Tempo de Autorização</h3>
                  <p className="text-[32px] font-bold text-brand-azul">{data.tempoMedio.autorizacao}</p>
                  <p className="text-[12px] text-cinza-600 mt-1">dias em média (CP → RA)</p>
                </div>
                <div className="rounded-xl border-2 border-cinza-200 bg-white p-6">
                  <h3 className="text-[13px] font-semibold text-cinza-600 uppercase tracking-wide mb-2">Tempo de Envio</h3>
                  <p className="text-[32px] font-bold text-brand-azul">{data.tempoMedio.envio}</p>
                  <p className="text-[12px] text-cinza-600 mt-1">dias em média (RA → PA)</p>
                </div>
              </div>
            </section>

            {/* ========== FILTROS DINÂMICOS E RANKINGS ========== */}
            <FiltrosDinamicosBI onRankingsChange={handleRankingsChange} />

            {/* Rankings de Fornecedores e Itens OPME */}
            {rankingsFiltrados && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top 20 Fornecedores */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-brand-azul" />
                    <h2 className="section-title">Top 20 Fornecedores</h2>
                  </div>
                  <div className="rounded-xl border-2 border-cinza-200 bg-white p-4 max-h-[400px] overflow-y-auto">
                    {rankingsFiltrados.fornecedores.length > 0 ? (
                      <div className="space-y-2">
                        {rankingsFiltrados.fornecedores.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between py-2 border-b border-cinza-100 last:border-0"
                          >
                            <span className="text-[13px] text-cinza-700">
                              {idx + 1}. {item.nome}
                            </span>
                            <span className="text-[14px] font-semibold text-brand-azul">
                              {item.quantidade}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[13px] text-cinza-500 text-center py-4">
                        Nenhum fornecedor encontrado para os filtros selecionados.
                      </p>
                    )}
                  </div>
                  <p className="text-[11px] text-cinza-500">
                    {rankingsFiltrados.totalProcedimentos} procedimento(s) encontrado(s)
                  </p>
                </section>

                {/* Top 20 Itens OPME */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-brand-azul" />
                    <h2 className="section-title">Top 20 Itens OPME</h2>
                  </div>
                  <div className="rounded-xl border-2 border-cinza-200 bg-white p-4 max-h-[400px] overflow-y-auto">
                    {rankingsFiltrados.itensOpme.length > 0 ? (
                      <div className="space-y-2">
                        {rankingsFiltrados.itensOpme.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between py-2 border-b border-cinza-100 last:border-0"
                          >
                            <span className="text-[13px] text-cinza-700 truncate max-w-[50%]">
                              {idx + 1}. {item.nome}
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-[12px] text-cinza-500">
                                R$ {Number(item.valor_medio).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                              <span className="text-[14px] font-semibold text-brand-azul min-w-[40px] text-right">
                                {item.quantidade}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[13px] text-cinza-500 text-center py-4">
                        Nenhum item OPME encontrado para os filtros selecionados.
                      </p>
                    )}
                  </div>
                </section>
              </div>
            )}

            {/* ========== PIPELINE DE VALORES ========== */}
            <section className="space-y-4" role="region" aria-labelledby="custos-title">
              <div className="section-header">
                <h3 id="custos-title" className="section-title">Pipeline de Valores</h3>
                <p className="text-[12px] text-cinza-500 mt-1">Valor total estimado dos procedimentos agendados</p>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 border-b border-cinza-200">
                <button
                  onClick={() => setActiveTabCustos("plano")}
                  className={`px-4 py-2 text-[13px] font-semibold transition-colors ${
                    activeTabCustos === "plano"
                      ? "text-brand-azul border-b-2 border-brand-azul"
                      : "text-cinza-500 hover:text-cinza-700"
                  }`}
                >
                  Por Plano
                </button>
                <button
                  onClick={() => setActiveTabCustos("medico")}
                  className={`px-4 py-2 text-[13px] font-semibold transition-colors ${
                    activeTabCustos === "medico"
                      ? "text-brand-azul border-b-2 border-brand-azul"
                      : "text-cinza-500 hover:text-cinza-700"
                  }`}
                >
                  Por Médico
                </button>
                <button
                  onClick={() => setActiveTabCustos("cirurgia")}
                  className={`px-4 py-2 text-[13px] font-semibold transition-colors ${
                    activeTabCustos === "cirurgia"
                      ? "text-brand-azul border-b-2 border-brand-azul"
                      : "text-cinza-500 hover:text-cinza-700"
                  }`}
                >
                  Por Cirurgia
                </button>
              </div>

              {/* Ranking */}
              <div className="space-y-3">
                {activeTabCustos === "plano" &&
                  data.topCustos.porPlano.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 rounded-xl bg-status-success-bg border border-status-success-border"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[18px] font-bold text-status-success-text">
                          #{idx + 1}
                        </span>
                        <span className="text-[14px] font-semibold text-cinza-700">
                          {item.nome}
                        </span>
                      </div>
                      <span className="text-[14px] font-bold text-status-success-text">
                        R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                {activeTabCustos === "medico" &&
                  data.topCustos.porMedico.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 rounded-xl bg-status-success-bg border border-status-success-border"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[18px] font-bold text-status-success-text">
                          #{idx + 1}
                        </span>
                        <span className="text-[14px] font-semibold text-cinza-700">
                          {item.nome}
                        </span>
                      </div>
                      <span className="text-[14px] font-bold text-status-success-text">
                        R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                {activeTabCustos === "cirurgia" &&
                  data.topCustos.porCirurgia.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 rounded-xl bg-status-success-bg border border-status-success-border"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[18px] font-bold text-status-success-text">
                          #{idx + 1}
                        </span>
                        <span className="text-[14px] font-semibold text-cinza-700">
                          {item.nome}
                        </span>
                      </div>
                      <span className="text-[14px] font-bold text-status-success-text">
                        R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
              </div>
            </section>

            {/* ========== RANKINGS DE AGENDAMENTOS ========== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Médicos com mais procedimentos */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="section-title">
                    Médicos - {showTopMedicos ? "Mais" : "Menos"} Procedimentos
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTopMedicos(!showTopMedicos)}
                  >
                    {showTopMedicos ? <TrendingDown className="w-4 h-4 mr-1" /> : <TrendingUp className="w-4 h-4 mr-1" />}
                    {showTopMedicos ? "Ver Menores" : "Ver Maiores"}
                  </Button>
                </div>
                <div className="rounded-xl border-2 border-cinza-200 bg-white p-4">
                  <div className="space-y-2">
                    {getRankingSlice(data.medicosAgendamentos, showTopMedicos).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-cinza-100 last:border-0">
                        <span className="text-[13px] text-cinza-700">{idx + 1}. {item.nome}</span>
                        <span className="text-[14px] font-semibold text-brand-azul">{item.quantidade}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Procedimentos mais realizados */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="section-title">
                    Procedimentos - {showTopProcedimentos ? "Mais" : "Menos"} Procedimentos
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTopProcedimentos(!showTopProcedimentos)}
                  >
                    {showTopProcedimentos ? <TrendingDown className="w-4 h-4 mr-1" /> : <TrendingUp className="w-4 h-4 mr-1" />}
                    {showTopProcedimentos ? "Ver Menores" : "Ver Maiores"}
                  </Button>
                </div>
                <div className="rounded-xl border-2 border-cinza-200 bg-white p-4">
                  <div className="space-y-2">
                    {getRankingSlice(data.procedimentosAgendamentos, showTopProcedimentos).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-cinza-100 last:border-0">
                        <span className="text-[13px] text-cinza-700">{idx + 1}. {item.nome}</span>
                        <span className="text-[14px] font-semibold text-brand-azul">{item.quantidade}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Operadoras mais usadas */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="section-title">
                    Operadoras - {showTopOperadoras ? "Mais" : "Menos"} Utilizadas
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTopOperadoras(!showTopOperadoras)}
                  >
                    {showTopOperadoras ? <TrendingDown className="w-4 h-4 mr-1" /> : <TrendingUp className="w-4 h-4 mr-1" />}
                    {showTopOperadoras ? "Ver Menores" : "Ver Maiores"}
                  </Button>
                </div>
                <div className="rounded-xl border-2 border-cinza-200 bg-white p-4">
                  <div className="space-y-2">
                    {getRankingSlice(data.operadorasAgendamentos, showTopOperadoras).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-cinza-100 last:border-0">
                        <span className="text-[13px] text-cinza-700">{idx + 1}. {item.nome}</span>
                        <span className="text-[14px] font-semibold text-brand-azul">{item.quantidade}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Distribuição por especialidade */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="section-title">
                    Especialidades - {showTopEspecialidades ? "Mais" : "Menos"} Frequentes
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTopEspecialidades(!showTopEspecialidades)}
                  >
                    {showTopEspecialidades ? <TrendingDown className="w-4 h-4 mr-1" /> : <TrendingUp className="w-4 h-4 mr-1" />}
                    {showTopEspecialidades ? "Ver Menores" : "Ver Maiores"}
                  </Button>
                </div>
                <div className="rounded-xl border-2 border-cinza-200 bg-white p-4">
                  <div className="space-y-2">
                    {getRankingSlice(data.especialidadesDistribuicao, showTopEspecialidades).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-cinza-100 last:border-0">
                        <span className="text-[13px] text-cinza-700">{idx + 1}. {item.nome}</span>
                        <span className="text-[14px] font-semibold text-brand-azul">{item.quantidade}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* ========== DISTRIBUIÇÃO DE TIPOS (GRÁFICO DE PIZZA) ========== */}
            <section>
              <h2 className="section-title mb-4">Distribuição por Tipo de Procedimento</h2>
              <div className="rounded-xl border-2 border-cinza-200 bg-white p-6">
                <div className="flex flex-col lg:flex-row items-center gap-8">

                  {/* Gráfico de Pizza (SVG) */}
                  <div className="flex-shrink-0">
                    <svg width="240" height="240" viewBox="0 0 240 240" className="transform -rotate-90">
                      {(() => {
                        let currentAngle = 0;
                        return data.distribuicaoTipos.map((item, idx) => {
                          const angle = (item.percentual / 100) * 360;
                          const startAngle = currentAngle;
                          const endAngle = currentAngle + angle;
                          currentAngle = endAngle;

                          const startRad = (startAngle * Math.PI) / 180;
                          const endRad = (endAngle * Math.PI) / 180;
                          const x1 = 120 + 100 * Math.cos(startRad);
                          const y1 = 120 + 100 * Math.sin(startRad);
                          const x2 = 120 + 100 * Math.cos(endRad);
                          const y2 = 120 + 100 * Math.sin(endRad);
                          const largeArc = angle > 180 ? 1 : 0;

                          return (
                            <path
                              key={idx}
                              d={`M 120 120 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`}
                              fill={CHART_COLORS[item.tipo]}
                              stroke="#fff"
                              strokeWidth="2"
                            />
                          );
                        });
                      })()}
                    </svg>
                  </div>

                  {/* Legenda */}
                  <div className="flex-1 space-y-4">
                    {data.distribuicaoTipos.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-cinza-200">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-5 h-5 rounded"
                            style={{ backgroundColor: CHART_COLORS[item.tipo] }}
                          />
                          <span className="text-[15px] font-semibold text-cinza-700">{item.tipo}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[15px] font-bold text-cinza-900">{item.quantidade}</span>
                          <span className="text-[14px] text-cinza-600 min-w-[60px] text-right font-semibold">{item.percentual}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>

      {/* Modal de Detalhes da Etapa */}
      <ModalDetalhesEtapa
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        etapaNome={etapaSelecionada}
        operadoras={dadosModal.operadoras}
        totalProcedimentos={dadosModal.totalProcedimentos}
        totalValor={dadosModal.totalValor}
      />
    </div>
  );
};

export default BIGeral;
