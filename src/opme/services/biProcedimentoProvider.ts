import { BIProcedimentoData, DistribuicaoMotivo } from "@opme/types/biProcedimento";
import { LABEL_TIPO_GLOSA, TipoGlosa } from "@opme/types/produto";
import { dataProvider } from "./dataProvider";
import { apiFetch } from "@opme/lib/api";

// Backend API base URL (mesmo do dataProvider)
const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8082";

// ============ BACKEND TYPES ============

interface CoberturaHistorica {
  CD_CIRURGIA: number;
  total_glosas: number;
  total_nao_glosas: number;
  perc_glosada: number;
}

interface GlosaMedico {
  CD_PRESTADOR: number;
  total_cirurgias_glosadas: number;
  total_cirurgias: number;
  perc_glosada: number;
}

interface FornecedorHistoricoMedico {
  CD_PRESTADOR: number;
  nome_prestador: string;
  NM_FORNECEDOR: string;
  total_itens: number;
  total_glosas: number;
  perc_glosado: number;
}

interface RankingFornecedorProcedimento {
  CD_CIRURGIA: number;
  NM_FORNECEDOR: string;
  total_itens: number;
  total_glosas: number;
  total_nao_glosas: number;
  perc_glosado: number;
  media_valor_glosa_por_aviso: number;
}

interface ItemOPMEUtilizado {
  CD_MAT_MED: string;
  NM_ITEM: string;
  total_utilizacoes: number;
  cirurgias_com_item: number;
  total_cirurgias_periodo: number;
  media_qtd_por_cirurgia: number;
  valor_medio_item?: number;
}

interface ItemComGlosa {
  CD_MAT_MED: string;
  NM_ITEM: string;
  total_glosas: number;
  valor_medio_glosa?: number;
  taxa_glosa_pct?: number;
}

interface ProcedimentoGlosadoBackend {
  data: string;
  numero_atendimento?: number;
  codigo_aviso: number;
  nome_medico: string;
  valor_opme_glosado: number;
}

interface GetGlosaResponse {
  glosa_medico: GlosaMedico[];
  cobertura_historica: CoberturaHistorica[];
  historico_medico_fornecedor: FornecedorHistoricoMedico[];
  ranking_fornecedor_por_procedimento: RankingFornecedorProcedimento[];
  custo_medio_historico: number;
  tempo_medio_previsto_de_aprovacao: number;
  valor_glosa_media_historico: number;
  ranking_itens_com_glosa: ItemComGlosa[];
  ranking_itens_opme_utilizados: ItemOPMEUtilizado[];
  procedimentos_glosados_operadora: ProcedimentoGlosadoBackend[];
}

const COR_TIPO_GLOSA: Record<TipoGlosa, DistribuicaoMotivo["cor"]> = {
  tecnica: "error",
  administrativa: "warning",
  valor: "neutral",
};

// ============ BI PROCEDIMENTO PROVIDER ============

/**
 * Serviço de dados para BI do Procedimento
 * Integrado com backend real para métricas de glosa
 */
class BiProcedimentoProvider {
  /**
   * Busca dados de glosa do backend
   */
  private async fetchGlosaData(
    cdCirurgia: number,
    cdPrestador?: number,
    cdConvenio?: number
  ): Promise<GetGlosaResponse | null> {
    try {
      const params = new URLSearchParams({
        CD_CIRURGIA: cdCirurgia.toString(),
      });

      if (cdPrestador) {
        params.set("CD_PRESTADOR", cdPrestador.toString());
      }

      if (cdConvenio) {
        params.set("CD_CONVENIO", cdConvenio.toString());
      }

      const response = await apiFetch(`${baseUrl}/get_glosa?${params.toString()}`);

      if (!response.ok) {
        console.error(`Erro ao buscar glosa: HTTP ${response.status}`);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao buscar dados de glosa do backend:", error);
      return null;
    }
  }

  /**
   * Retorna dados completos de BI para um procedimento
   */
  async getBIProcedimento(pacienteId: string): Promise<BIProcedimentoData> {
    const patient = await dataProvider.getPacienteById(pacienteId);

    if (!patient) {
      throw new Error(`Paciente ${pacienteId} não encontrado`);
    }

    // Busca dados reais de glosa se houver CD_CIRURGIA
    let backendData: GetGlosaResponse | null = null;
    if (patient.cdCirurgia) {
      backendData = await this.fetchGlosaData(
        patient.cdCirurgia,
        patient.cdPrestador,
        patient.cdConvenio
      );
    }

    const coberturaData = backendData?.cobertura_historica?.[0] ?? null;

    // Calcula KPIs a partir dos dados reais de glosa
    const totalCirurgias = coberturaData
      ? coberturaData.total_glosas + coberturaData.total_nao_glosas
      : 0;

    const cobertura_pct = coberturaData && totalCirurgias > 0
      ? Math.round((coberturaData.total_nao_glosas / totalCirurgias) * 100)
      : 0;

    const glosas_total = coberturaData?.total_glosas ?? 0;
    const taxa_glosa_periodo_pct = coberturaData?.perc_glosada ?? 0;

    // Extrai custo médio histórico do backend
    const custo_medio_historico = backendData?.custo_medio_historico ?? 0;

    // Itens do pedido (lidos automaticamente) com risco e sugestões
    const itensPedido = patient.itensPedido ?? [];
    const sugestoes = itensPedido.flatMap((item) => item.sugestoes);

    // Distribuição dos tipos de glosa previstos, ponderada pelo risco dos itens
    const pesoPorTipo = new Map<TipoGlosa, number>();
    itensPedido.forEach((item) => {
      if (item.tipoGlosa) {
        pesoPorTipo.set(item.tipoGlosa, (pesoPorTipo.get(item.tipoGlosa) ?? 0) + item.riscoGlosa);
      }
    });
    const pesoTotal = Array.from(pesoPorTipo.values()).reduce((a, b) => a + b, 0);
    const distribuicao_motivos: DistribuicaoMotivo[] = Array.from(pesoPorTipo.entries())
      .map(([tipo, peso]) => ({
        motivo: `Glosa ${LABEL_TIPO_GLOSA[tipo].toLowerCase()}`,
        percentual: Math.round((peso / pesoTotal) * 100),
        cor: COR_TIPO_GLOSA[tipo],
      }))
      .sort((a, b) => b.percentual - a.percentual);

    // Monta objeto BIProcedimentoData
    const biData: BIProcedimentoData = {
      paciente: {
        id: patient.id,
        nome: patient.nome,
        medico_responsavel: patient.medico,
        convenio: patient.convenio,
        procedimento_principal: patient.procedimento,
        especialidade: patient.especialidade,
        operadoraLogo: patient.operadoraLogo,
        cdCirurgia: patient.cdCirurgia,
        cdConvenio: patient.cdConvenio,
        cdPrestador: patient.cdPrestador,
      },

      cirurgia: patient,

      kpis_procedimento: {
        cobertura_pct,
        glosas_total,
        total_cirurgias: totalCirurgias,
        taxa_glosa_periodo_pct,
        custo_medio: custo_medio_historico, // Custo médio histórico do procedimento
        lucro_medio: patient.vlPrevisto ?? 0, // Valor previsto desta cirurgia específica
        variacao_custo_pct: 0, // TODO: implementar no backend
        variacao_lucro_pct: 0, // TODO: implementar no backend
      },

      listas_itens: {
        homologados: patient.itens
          .filter((item) => item.homologado)
          .map((item) => ({ nome: item.nome, quantidade: item.quantidade })),
        nao_homologados: patient.itens
          .filter((item) => !item.homologado)
          .map((item) => ({ nome: item.nome, quantidade: item.quantidade })),
      },

      // Trocas por item equivalente sugeridas pela IA
      trocas_sugeridas: sugestoes
        .filter((s) => s.tipo === "item")
        .map((s) => ({
          de_item: s.itemOriginal,
          para_item: s.itemSugerido,
          impacto: "↓ glosa" as const,
          margem_delta: s.margemDelta,
        })),

      // Fornecedores com menor glosa histórica neste procedimento
      fornecedores_sugeridos: (backendData?.ranking_fornecedor_por_procedimento ?? [])
        .slice(0, 3)
        .map((f) => ({
          nome: f.NM_FORNECEDOR,
          score_0_100: Math.max(0, Math.round(100 - f.perc_glosado)),
          motivo: `Glosa de ${f.perc_glosado.toLocaleString("pt-BR")}% em ${f.total_itens} itens deste procedimento`,
        })),

      // Grupos de equivalência técnica (registro ANVISA)
      itens_equivalentes: sugestoes
        .filter((s) => s.equivalenciaTecnica)
        .map((s) => ({ grupo: [s.itemOriginal, s.itemSugerido] })),

      chance_glosa: {
        series: [],
        texto_tooltip: "Probabilidade de glosa por volume de itens.",
      },

      medico_stats: {
        glosa_pct:
          backendData?.glosa_medico?.[0]?.perc_glosada ?? 0,
        total_cirurgias_glosadas:
          backendData?.glosa_medico?.[0]?.total_cirurgias_glosadas ?? 0,
        total_cirurgias:
          backendData?.glosa_medico?.[0]?.total_cirurgias ?? 0,
        distribuicao_motivos,
        custo_medio: custo_medio_historico,
        variacao_custo_pct: 0,
      },

      ranking_fornecedores_medico:
        (backendData?.historico_medico_fornecedor?.map((f) => ({
          fornecedor: f.NM_FORNECEDOR,
          score_0_100: Math.max(0, Math.round(100 - f.perc_glosado)),
          quantidade: f.total_itens ?? 0,
        })) ?? [])
          .sort((a, b) => (b.quantidade ?? 0) - (a.quantidade ?? 0)),

      ranking_fornecedores_proc:
        backendData?.ranking_fornecedor_por_procedimento?.map((f) => ({
          fornecedor: f.NM_FORNECEDOR,
          taxa_glosa_pct: f.perc_glosado,
          custo_medio: f.media_valor_glosa_por_aviso,
          recomendado: f.perc_glosado < 10,
          quantidade: f.total_itens ?? 0,
        })) ?? [],

      // Histórico de Glosas - dados reais do backend
      historico_glosas: {
        itens_comuns: Array.isArray(backendData?.ranking_itens_opme_utilizados)
          ? backendData.ranking_itens_opme_utilizados.map((item) => {
              const cirurgiasComItem = Number(item.cirurgias_com_item) || 0;
              const totalCirurgiasPeriodo = Number(item.total_cirurgias_periodo) || 0;
              const penetracao = totalCirurgiasPeriodo > 0
                ? Math.round((cirurgiasComItem / totalCirurgiasPeriodo) * 100)
                : 0;

              return {
                nome: item.NM_ITEM,
                frequencia: item.total_utilizacoes,
                penetracao_pct: penetracao,
                fornecedor: 'N/A',
                media_qtd: Number(item.media_qtd_por_cirurgia) || 0,
                valor_medio: Number(item.valor_medio_item) || 0,
              };
            }).sort((a, b) => b.penetracao_pct - a.penetracao_pct)
          : [],
        valor_medio_glosado: backendData?.valor_glosa_media_historico ?? 0,
        top_itens_glosados: Array.isArray(backendData?.ranking_itens_com_glosa)
          ? backendData.ranking_itens_com_glosa.map((item) => ({
              nome: item.NM_ITEM,
              quantidade_glosas: item.total_glosas,
              valor_medio_glosa: item.valor_medio_glosa ?? 0,
              taxa_glosa_pct: item.taxa_glosa_pct ?? 0,
            }))
          : [],
      },

      // Procedimentos da operadora com OPME glosado
      procedimentos_glosados_operadora: Array.isArray(backendData?.procedimentos_glosados_operadora)
        ? backendData.procedimentos_glosados_operadora.map((proc) => ({
            data: proc.data || 'N/A',
            numero_atendimento: proc.numero_atendimento ?? 0,
            codigo_aviso: proc.codigo_aviso,
            nome_medico: proc.nome_medico || 'Não informado',
            valor_opme_glosado: Number(proc.valor_opme_glosado) || 0,
          }))
        : [],
    };

    return biData;
  }
}

// Singleton instance
export const biProcedimentoProvider = new BiProcedimentoProvider();
