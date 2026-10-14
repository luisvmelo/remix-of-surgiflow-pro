import { BIGeralData, EtapaWorkflow, RankingQuantidade, DistribuicaoTipo } from "@opme/types/biGeral";
import { apiFetch } from "@opme/lib/api";
import { convenioExcluido } from "@opme/config/produto";

// Backend API base URL
const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8082";

// Interface para itens do backend
interface BackendItem {
  item: string;
  quantidade: number;
  fornecedores: string[];
  homolog: boolean[];
}

// Interface para cirurgias do backend
interface BackendSurgery {
  ETAPA_PROCESSO: string;
  VL_PREVISTO: string | number | null;
  NM_CONVENIO: string;
  NM_PRESTADOR: string;
  NM_PACIENTE: string;
  DS_CIRURGIA: string;
  ESPECIALIDADE: string;
  SN_PACOTE: string;
  SN_MISTO: boolean;
  DIF_CP_RA: string | number | null;
  DIF_RA_PA: string | number | null;
  items?: BackendItem[];
}

// Interface para filtros dinâmicos (um valor por tipo)
export interface FiltrosDinamicos {
  operadora?: string;
  especialidade?: string;
  cirurgia?: string;
  dataInicio?: string;
  dataFim?: string;
}

// Interface para rankings filtrados
export interface RankingsFiltrados {
  fornecedores: Array<{ nome: string; quantidade: number }>;
  itensOpme: Array<{ nome: string; quantidade: number; valor_medio: number }>;
  totalProcedimentos: number;
}

// Interface para opções dos filtros
export interface OpcoesFiltros {
  operadoras: string[];
  especialidades: string[];
  cirurgias: string[];
}

// ============ INDICADORES DO PRODUTO ============

export interface OpcoesComparador {
  operadoras: string[];
  itens: Array<{ nome: string; especialidade: string }>;
  cirurgias: Array<{ nome: string; especialidade: string }>;
}

export interface ComparadorGeral {
  operadora: string;
  cirurgiasAgendadas: number;
  receitaOpmePrevista: number;
  custoOpmePrevisto: number;
  margemOpmePrevista: number;
  margemPercentual: number;
  valorExposto: number;
  riscoMedio: number;
  taxaGlosa12m: number;
  valorGlosado12m: number;
  prazoAutorizacao: number;
  /** Valor pago em relação à tabela de referência (%) */
  fatorPagamento: number;
}

export interface ComparadorItem {
  nome: string;
  procedimento: string;
  porOperadora: Array<{
    operadora: string;
    volume: number;
    valorPago: number;
    custo: number;
    taxaGlosa: number;
    margemUnidade: number;
  }>;
}

export interface ComparadorCirurgia {
  nome: string;
  especialidade: string;
  porOperadora: Array<{
    operadora: string;
    volume: number;
    ticketMedio: number;
    custoOpme: number;
    taxaGlosa: number;
    valorGlosadoMedio: number;
    margemOpme: number;
    prazoAutorizacao: number;
  }>;
}

export interface ComparadorOperadoras {
  geral: ComparadorGeral[];
  itens: ComparadorItem[];
  cirurgias: ComparadorCirurgia[];
}

export interface IndicadoresGlosa {
  serie: Array<{ mes: string; taxaGlosa: number; valorGlosado: number; cirurgias: number }>;
  porHospital: Array<{
    hospitalId: string;
    hospital: string;
    erp: string;
    taxaGlosa: number;
    valorGlosado12m: number;
    cirurgiasAgendadas: number;
    riscoMedio: number;
  }>;
}

/**
 * Mapeamento de cores por etapa do workflow
 */
const WORKFLOW_COLORS: Record<string, string> = {
  "Aguardando Cotação": "#FEF3C7",
  "Em Cotação": "#FEF3C7",
  "Aguardando Autorização": "#FEF3C7",
  "Em Análise": "#FEF3C7",
  "Autorizado": "#D1FAE5",
  "Aguardando Realização": "#D1FAE5",
  "Realizado": "#D1FAE5",
  "Confirmação": "#FECACA",
  "default": "#E5E7EB"
};

/**
 * Provider de dados para BI Geral do Sistema
 */
class BiGeralProvider {
  // Cache das cirurgias para evitar múltiplas requisições
  private cirurgiasCache: BackendSurgery[] | null = null;

  /**
   * Descarta o cache (troca de hospital ou de convênios excluídos)
   */
  clearCache() {
    this.cirurgiasCache = null;
  }

  /**
   * Busca cirurgias do backend (com cache)
   * Filtra os convênios excluídos nas configurações do hospital
   */
  private async fetchCirurgias(): Promise<BackendSurgery[]> {
    if (this.cirurgiasCache) {
      return this.cirurgiasCache;
    }

    const response = await apiFetch(
      `${baseUrl}/get_surgeries_by_page?page=1&number_of_results=10000`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const allCirurgias: BackendSurgery[] = await response.json();

    // Filtra os convênios excluídos da visualização (dados continuam no banco)
    this.cirurgiasCache = allCirurgias.filter(cirurgia => !convenioExcluido(cirurgia.NM_CONVENIO));

    return this.cirurgiasCache;
  }

  /**
   * Busca cirurgias SEM usar cache (apenas para pipeline do BI Geral)
   * ISOLADO: não atualiza o cache compartilhado - para atualização em tempo real
   */
  private async fetchCirurgiasFresh(): Promise<BackendSurgery[]> {
    const response = await apiFetch(
      `${baseUrl}/get_surgeries_by_page?page=1&number_of_results=10000`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const allCirurgias: BackendSurgery[] = await response.json();

    // Filtra convênios excluídos - NÃO salva no cache compartilhado
    return allCirurgias.filter(cirurgia => !convenioExcluido(cirurgia.NM_CONVENIO));
  }

  /**
   * Retorna dados do BI Geral usando dados FRESCOS (sem cache)
   * ISOLADO: usado apenas pelo pipeline para atualização em tempo real
   * Não afeta modal, filtros ou outros componentes que usam cache
   */
  async getBIGeralFresh(): Promise<BIGeralData> {
    try {
      // Usa fetchCirurgiasFresh() - sempre busca dados novos do backend
      const cirurgias = await this.fetchCirurgiasFresh();

      // ========== WORKFLOW ==========
      const workflowMap = new Map<string, { quantidade: number; valorTotal: number }>();

      cirurgias.forEach(cirurgia => {
        const estado = cirurgia.ETAPA_PROCESSO && cirurgia.ETAPA_PROCESSO !== "N/A"
          ? cirurgia.ETAPA_PROCESSO
          : "Não informado";

        const valor = Number(cirurgia.VL_PREVISTO) || 0;

        const existing = workflowMap.get(estado) || { quantidade: 0, valorTotal: 0 };
        workflowMap.set(estado, {
          quantidade: existing.quantidade + 1,
          valorTotal: existing.valorTotal + valor
        });
      });

      const workflow: EtapaWorkflow[] = Array.from(workflowMap.entries())
        .map(([nome, data]) => ({
          nome,
          quantidade: data.quantidade,
          valorTotal: data.valorTotal,
          cor: WORKFLOW_COLORS[nome] || WORKFLOW_COLORS.default
        }))
        .sort((a, b) => b.quantidade - a.quantidade);

      // ========== TOP CUSTOS ==========
      const custosPorPlanoMap = new Map<string, number>();
      cirurgias.forEach(cirurgia => {
        const plano = cirurgia.NM_CONVENIO && cirurgia.NM_CONVENIO !== "N/A"
          ? cirurgia.NM_CONVENIO
          : "Não informado";
        const valor = Number(cirurgia.VL_PREVISTO) || 0;
        custosPorPlanoMap.set(plano, (custosPorPlanoMap.get(plano) || 0) + valor);
      });

      const topCustosPorPlano = Array.from(custosPorPlanoMap.entries())
        .map(([nome, valor]) => ({ nome, valor }))
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 5);

      const custosPorMedicoMap = new Map<string, number>();
      cirurgias.forEach(cirurgia => {
        const medico = cirurgia.NM_PRESTADOR && cirurgia.NM_PRESTADOR !== "N/A"
          ? cirurgia.NM_PRESTADOR
          : "Não informado";
        const valor = Number(cirurgia.VL_PREVISTO) || 0;
        custosPorMedicoMap.set(medico, (custosPorMedicoMap.get(medico) || 0) + valor);
      });

      const topCustosPorMedico = Array.from(custosPorMedicoMap.entries())
        .map(([nome, valor]) => ({ nome, valor }))
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 5);

      const custosPorCirurgiaMap = new Map<string, number>();
      cirurgias.forEach(cirurgia => {
        const tipoCirurgia = cirurgia.DS_CIRURGIA && cirurgia.DS_CIRURGIA !== "N/A"
          ? cirurgia.DS_CIRURGIA
          : "Não informado";
        const valor = Number(cirurgia.VL_PREVISTO) || 0;
        custosPorCirurgiaMap.set(tipoCirurgia, (custosPorCirurgiaMap.get(tipoCirurgia) || 0) + valor);
      });

      const topCustosPorCirurgia = Array.from(custosPorCirurgiaMap.entries())
        .map(([nome, valor]) => ({ nome, valor }))
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 5);

      // ========== RANKINGS DE AGENDAMENTOS ==========
      const medicosMap = new Map<string, number>();
      cirurgias.forEach(cirurgia => {
        const medico = cirurgia.NM_PRESTADOR && cirurgia.NM_PRESTADOR !== "N/A"
          ? cirurgia.NM_PRESTADOR
          : "Não informado";
        medicosMap.set(medico, (medicosMap.get(medico) || 0) + 1);
      });

      const medicosAgendamentos: RankingQuantidade[] = Array.from(medicosMap.entries())
        .map(([nome, quantidade]) => ({ nome, quantidade }))
        .sort((a, b) => b.quantidade - a.quantidade);

      const procedimentosMap = new Map<string, number>();
      cirurgias.forEach(cirurgia => {
        const procedimento = cirurgia.DS_CIRURGIA && cirurgia.DS_CIRURGIA !== "N/A"
          ? cirurgia.DS_CIRURGIA
          : "Não informado";
        procedimentosMap.set(procedimento, (procedimentosMap.get(procedimento) || 0) + 1);
      });

      const procedimentosAgendamentos: RankingQuantidade[] = Array.from(procedimentosMap.entries())
        .map(([nome, quantidade]) => ({ nome, quantidade }))
        .sort((a, b) => b.quantidade - a.quantidade);

      const operadorasMap = new Map<string, number>();
      cirurgias.forEach(cirurgia => {
        const operadora = cirurgia.NM_CONVENIO && cirurgia.NM_CONVENIO !== "N/A"
          ? cirurgia.NM_CONVENIO
          : "Não informado";
        operadorasMap.set(operadora, (operadorasMap.get(operadora) || 0) + 1);
      });

      const operadorasAgendamentos: RankingQuantidade[] = Array.from(operadorasMap.entries())
        .map(([nome, quantidade]) => ({ nome, quantidade }))
        .sort((a, b) => b.quantidade - a.quantidade);

      const especialidadesMap = new Map<string, number>();
      cirurgias.forEach(cirurgia => {
        const especialidade = cirurgia.ESPECIALIDADE && cirurgia.ESPECIALIDADE !== "N/A"
          ? cirurgia.ESPECIALIDADE.trim()
          : "Outras";
        especialidadesMap.set(especialidade, (especialidadesMap.get(especialidade) || 0) + 1);
      });

      const especialidadesDistribuicao: RankingQuantidade[] = Array.from(especialidadesMap.entries())
        .map(([nome, quantidade]) => ({ nome, quantidade }))
        .sort((a, b) => b.quantidade - a.quantidade);

      // ========== TEMPO MÉDIO ==========
      const temposAutorizacao = cirurgias
        .filter(c => c.DIF_CP_RA && c.DIF_CP_RA !== "N/A" && Number(c.DIF_CP_RA) > 0)
        .map(c => Number(c.DIF_CP_RA));

      const temposEnvio = cirurgias
        .filter(c => c.DIF_RA_PA && c.DIF_RA_PA !== "N/A" && Number(c.DIF_RA_PA) > 0)
        .map(c => Number(c.DIF_RA_PA));

      const tempoMedio = {
        autorizacao: temposAutorizacao.length > 0
          ? Math.round(temposAutorizacao.reduce((a, b) => a + b, 0) / temposAutorizacao.length)
          : 0,
        envio: temposEnvio.length > 0
          ? Math.round(temposEnvio.reduce((a, b) => a + b, 0) / temposEnvio.length)
          : 0
      };

      // ========== DISTRIBUIÇÃO DE TIPOS ==========
      const totalCirurgias = cirurgias.length;

      let pacotes = 0;
      let naoPacotes = 0;
      let mistas = 0;

      cirurgias.forEach(cirurgia => {
        if (cirurgia.SN_MISTO === true) {
          mistas++;
        } else if (cirurgia.SN_PACOTE === "S") {
          pacotes++;
        } else {
          naoPacotes++;
        }
      });

      const distribuicaoTipos: DistribuicaoTipo[] = [
        {
          tipo: 'Pacote',
          quantidade: pacotes,
          percentual: totalCirurgias > 0 ? Math.round((pacotes / totalCirurgias) * 100) : 0
        },
        {
          tipo: 'Não-Pacote',
          quantidade: naoPacotes,
          percentual: totalCirurgias > 0 ? Math.round((naoPacotes / totalCirurgias) * 100) : 0
        },
        {
          tipo: 'Mista',
          quantidade: mistas,
          percentual: totalCirurgias > 0 ? Math.round((mistas / totalCirurgias) * 100) : 0
        }
      ];

      return {
        workflow,
        topCustos: {
          porPlano: topCustosPorPlano,
          porMedico: topCustosPorMedico,
          porCirurgia: topCustosPorCirurgia,
        },
        medicosAgendamentos,
        procedimentosAgendamentos,
        operadorasAgendamentos,
        especialidadesDistribuicao,
        tempoMedio,
        distribuicaoTipos,
      };
    } catch (error) {
      console.error("Erro ao buscar dados do BI Geral (fresh):", error);

      // Fallback para dados vazios em caso de erro
      return {
        workflow: [{
          nome: "Erro ao carregar dados",
          quantidade: 0,
          valorTotal: 0,
          cor: "#FECACA",
        }],
        topCustos: {
          porPlano: [],
          porMedico: [],
          porCirurgia: [],
        },
        medicosAgendamentos: [],
        procedimentosAgendamentos: [],
        operadorasAgendamentos: [],
        especialidadesDistribuicao: [],
        tempoMedio: { autorizacao: 0, envio: 0 },
        distribuicaoTipos: [],
      };
    }
  }

  /**
   * Retorna procedimentos de uma etapa e operadora específica
   */
  async getProcedimentosPorEtapaEOperadora(etapaNome: string, operadoraNome: string): Promise<Array<{
    id: string;
    paciente: string;
    medico: string;
    especialidade: string;
    procedimento: string;
    valorEsperado: number;
    tempoNaEtapa: number | null;
  }>> {
    try {
      const cirurgias = await this.fetchCirurgias();

      // Filtra por etapa e operadora
      const cirurgiasFiltradas = cirurgias.filter(c => {
        const estado = c.ETAPA_PROCESSO && c.ETAPA_PROCESSO !== "N/A"
          ? c.ETAPA_PROCESSO
          : "Não informado";
        const operadora = c.NM_CONVENIO && c.NM_CONVENIO !== "N/A"
          ? c.NM_CONVENIO
          : "Não informado";

        return estado === etapaNome && operadora === operadoraNome;
      });

      // Mapeia para o formato necessário
      return cirurgiasFiltradas.map((c, idx) => ({
        id: `proc-${idx}`, // ID temporário - em produção viria do backend
        paciente: c.NM_PACIENTE || "Não informado",
        medico: c.NM_PRESTADOR || "Não informado",
        especialidade: c.ESPECIALIDADE || "Não informado",
        procedimento: c.DS_CIRURGIA || "Não informado",
        valorEsperado: Number(c.VL_PREVISTO) || 0,
        tempoNaEtapa: null // Será preenchido quando integrar com API
      }));
    } catch (error) {
      console.error("Erro ao buscar procedimentos:", error);
      return [];
    }
  }

  /**
   * Retorna cirurgias filtradas por etapa, agrupadas por operadora
   */
  async getCirurgiasPorEtapa(etapaNome: string): Promise<{
    operadoras: Array<{ nome: string; quantidade: number; valorTotal: number }>;
    totalProcedimentos: number;
    totalValor: number;
  }> {
    try {
      const cirurgias = await this.fetchCirurgias();

      // Filtra cirurgias da etapa específica
      const cirurgiasDaEtapa = cirurgias.filter(c => {
        const estado = c.ETAPA_PROCESSO && c.ETAPA_PROCESSO !== "N/A"
          ? c.ETAPA_PROCESSO
          : "Não informado";
        return estado === etapaNome;
      });

      // Agrupa por operadora
      const operadorasMap = new Map<string, { quantidade: number; valorTotal: number }>();

      cirurgiasDaEtapa.forEach(cirurgia => {
        const operadora = cirurgia.NM_CONVENIO && cirurgia.NM_CONVENIO !== "N/A"
          ? cirurgia.NM_CONVENIO
          : "Não informado";
        const valor = Number(cirurgia.VL_PREVISTO) || 0;

        const existing = operadorasMap.get(operadora) || { quantidade: 0, valorTotal: 0 };
        operadorasMap.set(operadora, {
          quantidade: existing.quantidade + 1,
          valorTotal: existing.valorTotal + valor
        });
      });

      // Converte para array e ordena por quantidade
      const operadoras = Array.from(operadorasMap.entries())
        .map(([nome, data]) => ({
          nome,
          quantidade: data.quantidade,
          valorTotal: data.valorTotal
        }))
        .sort((a, b) => b.quantidade - a.quantidade);

      const totalProcedimentos = cirurgiasDaEtapa.length;
      const totalValor = cirurgiasDaEtapa.reduce((sum, c) => sum + (Number(c.VL_PREVISTO) || 0), 0);

      return {
        operadoras,
        totalProcedimentos,
        totalValor
      };
    } catch (error) {
      console.error("Erro ao buscar cirurgias por etapa:", error);
      return {
        operadoras: [],
        totalProcedimentos: 0,
        totalValor: 0
      };
    }
  }

  /**
   * Retorna dados do BI Geral com agregações reais do backend
   */
  async getBIGeral(): Promise<BIGeralData> {
    try {
      const cirurgias = await this.fetchCirurgias();

      // ========== WORKFLOW ==========
      const workflowMap = new Map<string, { quantidade: number; valorTotal: number }>();

      cirurgias.forEach(cirurgia => {
        const estado = cirurgia.ETAPA_PROCESSO && cirurgia.ETAPA_PROCESSO !== "N/A"
          ? cirurgia.ETAPA_PROCESSO
          : "Não informado";

        const valor = Number(cirurgia.VL_PREVISTO) || 0;

        const existing = workflowMap.get(estado) || { quantidade: 0, valorTotal: 0 };
        workflowMap.set(estado, {
          quantidade: existing.quantidade + 1,
          valorTotal: existing.valorTotal + valor
        });
      });

      const workflow: EtapaWorkflow[] = Array.from(workflowMap.entries())
        .map(([nome, data]) => ({
          nome,
          quantidade: data.quantidade,
          valorTotal: data.valorTotal,
          cor: WORKFLOW_COLORS[nome] || WORKFLOW_COLORS.default
        }))
        .sort((a, b) => b.quantidade - a.quantidade);

      // ========== TOP CUSTOS ==========
      const custosPorPlanoMap = new Map<string, number>();
      cirurgias.forEach(cirurgia => {
        const plano = cirurgia.NM_CONVENIO && cirurgia.NM_CONVENIO !== "N/A"
          ? cirurgia.NM_CONVENIO
          : "Não informado";
        const valor = Number(cirurgia.VL_PREVISTO) || 0;
        custosPorPlanoMap.set(plano, (custosPorPlanoMap.get(plano) || 0) + valor);
      });

      const topCustosPorPlano = Array.from(custosPorPlanoMap.entries())
        .map(([nome, valor]) => ({ nome, valor }))
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 5);

      const custosPorMedicoMap = new Map<string, number>();
      cirurgias.forEach(cirurgia => {
        const medico = cirurgia.NM_PRESTADOR && cirurgia.NM_PRESTADOR !== "N/A"
          ? cirurgia.NM_PRESTADOR
          : "Não informado";
        const valor = Number(cirurgia.VL_PREVISTO) || 0;
        custosPorMedicoMap.set(medico, (custosPorMedicoMap.get(medico) || 0) + valor);
      });

      const topCustosPorMedico = Array.from(custosPorMedicoMap.entries())
        .map(([nome, valor]) => ({ nome, valor }))
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 5);

      const custosPorCirurgiaMap = new Map<string, number>();
      cirurgias.forEach(cirurgia => {
        const tipoCirurgia = cirurgia.DS_CIRURGIA && cirurgia.DS_CIRURGIA !== "N/A"
          ? cirurgia.DS_CIRURGIA
          : "Não informado";
        const valor = Number(cirurgia.VL_PREVISTO) || 0;
        custosPorCirurgiaMap.set(tipoCirurgia, (custosPorCirurgiaMap.get(tipoCirurgia) || 0) + valor);
      });

      const topCustosPorCirurgia = Array.from(custosPorCirurgiaMap.entries())
        .map(([nome, valor]) => ({ nome, valor }))
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 5);

      // ========== RANKINGS DE AGENDAMENTOS ==========

      // Médicos com mais agendamentos
      const medicosMap = new Map<string, number>();
      cirurgias.forEach(cirurgia => {
        const medico = cirurgia.NM_PRESTADOR && cirurgia.NM_PRESTADOR !== "N/A"
          ? cirurgia.NM_PRESTADOR
          : "Não informado";
        medicosMap.set(medico, (medicosMap.get(medico) || 0) + 1);
      });

      const medicosAgendamentos: RankingQuantidade[] = Array.from(medicosMap.entries())
        .map(([nome, quantidade]) => ({ nome, quantidade }))
        .sort((a, b) => b.quantidade - a.quantidade);

      // Procedimentos mais agendados
      const procedimentosMap = new Map<string, number>();
      cirurgias.forEach(cirurgia => {
        const procedimento = cirurgia.DS_CIRURGIA && cirurgia.DS_CIRURGIA !== "N/A"
          ? cirurgia.DS_CIRURGIA
          : "Não informado";
        procedimentosMap.set(procedimento, (procedimentosMap.get(procedimento) || 0) + 1);
      });

      const procedimentosAgendamentos: RankingQuantidade[] = Array.from(procedimentosMap.entries())
        .map(([nome, quantidade]) => ({ nome, quantidade }))
        .sort((a, b) => b.quantidade - a.quantidade);

      // Operadoras mais usadas
      const operadorasMap = new Map<string, number>();
      cirurgias.forEach(cirurgia => {
        const operadora = cirurgia.NM_CONVENIO && cirurgia.NM_CONVENIO !== "N/A"
          ? cirurgia.NM_CONVENIO
          : "Não informado";
        operadorasMap.set(operadora, (operadorasMap.get(operadora) || 0) + 1);
      });

      const operadorasAgendamentos: RankingQuantidade[] = Array.from(operadorasMap.entries())
        .map(([nome, quantidade]) => ({ nome, quantidade }))
        .sort((a, b) => b.quantidade - a.quantidade);

      // Distribuição por especialidade
      const especialidadesMap = new Map<string, number>();
      cirurgias.forEach(cirurgia => {
        const especialidade = cirurgia.ESPECIALIDADE && cirurgia.ESPECIALIDADE !== "N/A"
          ? cirurgia.ESPECIALIDADE.trim()
          : "Outras";
        especialidadesMap.set(especialidade, (especialidadesMap.get(especialidade) || 0) + 1);
      });

      const especialidadesDistribuicao: RankingQuantidade[] = Array.from(especialidadesMap.entries())
        .map(([nome, quantidade]) => ({ nome, quantidade }))
        .sort((a, b) => b.quantidade - a.quantidade);

      // ========== TEMPO MÉDIO ==========
      const temposAutorizacao = cirurgias
        .filter(c => c.DIF_CP_RA && c.DIF_CP_RA !== "N/A" && Number(c.DIF_CP_RA) > 0)
        .map(c => Number(c.DIF_CP_RA));

      const temposEnvio = cirurgias
        .filter(c => c.DIF_RA_PA && c.DIF_RA_PA !== "N/A" && Number(c.DIF_RA_PA) > 0)
        .map(c => Number(c.DIF_RA_PA));

      const tempoMedio = {
        autorizacao: temposAutorizacao.length > 0
          ? Math.round(temposAutorizacao.reduce((a, b) => a + b, 0) / temposAutorizacao.length)
          : 0,
        envio: temposEnvio.length > 0
          ? Math.round(temposEnvio.reduce((a, b) => a + b, 0) / temposEnvio.length)
          : 0
      };

      // ========== DISTRIBUIÇÃO DE TIPOS ==========
      const totalCirurgias = cirurgias.length;

      let pacotes = 0;
      let naoPacotes = 0;
      let mistas = 0;

      cirurgias.forEach(cirurgia => {
        if (cirurgia.SN_MISTO === true) {
          mistas++;
        } else if (cirurgia.SN_PACOTE === "S") {
          pacotes++;
        } else {
          naoPacotes++;
        }
      });

      const distribuicaoTipos: DistribuicaoTipo[] = [
        {
          tipo: 'Pacote',
          quantidade: pacotes,
          percentual: Math.round((pacotes / totalCirurgias) * 100)
        },
        {
          tipo: 'Não-Pacote',
          quantidade: naoPacotes,
          percentual: Math.round((naoPacotes / totalCirurgias) * 100)
        },
        {
          tipo: 'Mista',
          quantidade: mistas,
          percentual: Math.round((mistas / totalCirurgias) * 100)
        }
      ];

      return {
        workflow,
        topCustos: {
          porPlano: topCustosPorPlano,
          porMedico: topCustosPorMedico,
          porCirurgia: topCustosPorCirurgia,
        },
        medicosAgendamentos,
        procedimentosAgendamentos,
        operadorasAgendamentos,
        especialidadesDistribuicao,
        tempoMedio,
        distribuicaoTipos,
      };
    } catch (error) {
      console.error("Erro ao buscar dados do BI Geral:", error);

      // Fallback para dados vazios em caso de erro
      return {
        workflow: [{
          nome: "Erro ao carregar dados",
          quantidade: 0,
          valorTotal: 0,
          cor: "#FECACA",
        }],
        topCustos: {
          porPlano: [],
          porMedico: [],
          porCirurgia: [],
        },
        medicosAgendamentos: [],
        procedimentosAgendamentos: [],
        operadorasAgendamentos: [],
        especialidadesDistribuicao: [],
        tempoMedio: { autorizacao: 0, envio: 0 },
        distribuicaoTipos: [],
      };
    }
  }

  /**
   * Retorna as opções disponíveis para os filtros dinâmicos
   */
  async getOpcoesFiltros(): Promise<OpcoesFiltros> {
    try {
      const cirurgias = await this.fetchCirurgias();

      const operadorasSet = new Set<string>();
      const especialidadesSet = new Set<string>();
      const cirurgiasSet = new Set<string>();

      cirurgias.forEach(cirurgia => {
        if (cirurgia.NM_CONVENIO && cirurgia.NM_CONVENIO !== "N/A") {
          operadorasSet.add(cirurgia.NM_CONVENIO);
        }
        if (cirurgia.ESPECIALIDADE && cirurgia.ESPECIALIDADE !== "N/A") {
          especialidadesSet.add(cirurgia.ESPECIALIDADE.trim());
        }
        if (cirurgia.DS_CIRURGIA && cirurgia.DS_CIRURGIA !== "N/A") {
          cirurgiasSet.add(cirurgia.DS_CIRURGIA);
        }
      });

      return {
        operadoras: Array.from(operadorasSet).sort(),
        especialidades: Array.from(especialidadesSet).sort(),
        cirurgias: Array.from(cirurgiasSet).sort(),
      };
    } catch (error) {
      console.error("Erro ao buscar opções de filtros:", error);
      return {
        operadoras: [],
        especialidades: [],
        cirurgias: [],
      };
    }
  }

  /**
   * Retorna rankings de fornecedores e itens OPME baseado em cirurgias REALIZADAS (dados históricos)
   */
  async getRankingsFiltrados(filtros: FiltrosDinamicos): Promise<RankingsFiltrados> {
    try {
      // Monta query params para o endpoint
      const params = new URLSearchParams();

      if (filtros.operadora) {
        params.append('operadora', filtros.operadora);
      }
      if (filtros.especialidade) {
        params.append('especialidade', filtros.especialidade);
      }
      if (filtros.cirurgia) {
        params.append('cirurgia', filtros.cirurgia);
      }
      if (filtros.dataInicio) {
        params.append('data_inicio', filtros.dataInicio);
      }
      if (filtros.dataFim) {
        params.append('data_fim', filtros.dataFim);
      }

      const queryString = params.toString();
      const url = `${baseUrl}/get_rankings_bi_filtrado${queryString ? `?${queryString}` : ''}`;

      const response = await apiFetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        fornecedores: data.fornecedores || [],
        itensOpme: data.itensOpme || [],
        totalProcedimentos: data.totalProcedimentos || 0,
      };
    } catch (error) {
      console.error("Erro ao buscar rankings filtrados:", error);
      return {
        fornecedores: [],
        itensOpme: [],
        totalProcedimentos: 0,
      };
    }
  }

  /**
   * Compara operadoras: situação geral, itens OPME e cirurgias escolhidos
   */
  async getComparadorOperadoras(operadoras: string[], itens: string[], cirurgias: string[]): Promise<ComparadorOperadoras> {
    const params = new URLSearchParams({
      operadoras: operadoras.join("|"),
      itens: itens.join("|"),
      cirurgias: cirurgias.join("|"),
    });
    const response = await apiFetch(`${baseUrl}/get_comparador_operadoras?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  /**
   * Operadoras, itens e cirurgias disponíveis no comparador
   */
  async getOpcoesComparador(): Promise<OpcoesComparador> {
    const response = await apiFetch(`${baseUrl}/get_opcoes_comparador`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  /**
   * Série mensal da taxa de glosa e indicadores por hospital (visão de rede)
   */
  async getIndicadoresGlosa(): Promise<IndicadoresGlosa> {
    const response = await apiFetch(`${baseUrl}/get_indicadores_glosa`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }
}

export const biGeralProvider = new BiGeralProvider();
