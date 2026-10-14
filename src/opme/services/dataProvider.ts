import { Patient, ItemFornecedor, Especialidade, TipoCirurgia } from "@opme/types/patient";
import { ItemPedido, PedidoCirurgico, TipoProcedimento } from "@opme/types/produto";
import { apiFetch } from "@opme/lib/api";
import { convenioExcluido, lerConfig } from "@opme/config/produto";

// Simulated delay for realistic API behavior
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Backend API base URL
const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8082";

// ============ BACKEND TYPES ============

interface BackendItem {
  item: string;
  quantidade: number;
  fornecedores: string[];
  homolog: boolean[];
}

interface BackendSurgery {
  ESPECIALIDADE: string;
  CD_AVISO_CIRURGIA: number;
  CD_PRESTADOR: number;
  NM_PRESTADOR: string;
  CD_CONVENIO: number;
  NM_CONVENIO: string;
  SN_PACOTE: string;
  SN_MISTO: boolean;
  CD_CIRURGIA: number;
  DS_CIRURGIA: string;
  DT_AVISO_CIRURGIA: string;
  DT_INICIO_AGE_CIR: string;
  DT_CIRURGIA: string;
  TP_CIRURGIA: string;
  ETAPA_PROCESSO: string;
  TP_CIRURGIAS: string;
  VL_PREVISTO: string | number | null;
  DIF_CP_RA: string | number | null; // Diferença em dias entre CP e RA
  DIF_RA_PA: string | number | null; // Diferença em dias entre RA e PA
  NM_PACIENTE?: string; // Nome do paciente (INICIAIS_PACIENTE do banco)
  items: BackendItem[];
  // Campos do produto (previsão de glosa)
  HOSPITAL_ID?: string;
  TIPO_PROCEDIMENTO?: TipoProcedimento;
  RISCO_GLOSA?: number;
  VL_RECEITA_PREVISTA?: number;
  VL_CUSTO_PREVISTO?: number;
  ITENS_PEDIDO?: ItemPedido[];
  PEDIDO?: PedidoCirurgico;
  DIAS_NA_ETAPA?: number;
  SLA_ETAPA?: number;
  MATERIAL_CONFIRMADO?: boolean;
  COMPRADOR?: string;
}

/**
 * Dias corridos entre hoje e a data da cirurgia (negativo = já passou)
 */
function diasAte(value?: string | null): number | undefined {
  if (!value || value === "N/A") return undefined;
  const data = new Date(value);
  if (isNaN(data.getTime())) return undefined;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  data.setHours(0, 0, 0, 0);
  return Math.round((data.getTime() - hoje.getTime()) / (24 * 60 * 60 * 1000));
}

// ============ MAPPING FUNCTIONS ============

/**
 * Formata data ISO/SQL para formato DD/MM/YYYY
 */
function formatDate(value?: string | null): string | undefined {
  if (!value || value === "N/A" || value.trim() === "") {
    return undefined;
  }

  try {
    // Tenta parsear a data (formato esperado: "YYYY-MM-DD" ou "YYYY-MM-DD HH:mm:ss")
    const date = new Date(value);

    if (isNaN(date.getTime())) {
      return undefined;
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch {
    return undefined;
  }
}

/**
 * Formata data ou retorna "Não informado" se não houver data
 */
function formatDateOrNotInformed(value?: string | null): string {
  const formatted = formatDate(value);
  return formatted ?? "Não informado";
}

/**
 * Mapeia tipo de cirurgia do backend para TipoCirurgia
 */
function mapTipoCirurgia(tp: string | null | undefined): TipoCirurgia | undefined {
  if (!tp || tp === "N/A") return undefined;

  const normalized = tp.toUpperCase().trim();

  if (normalized === "E" || normalized.includes("ELETIV")) return "eletiva";
  if (normalized === "U" || normalized.includes("URGENC")) return "urgencia";
  if (normalized === "EM" || normalized.includes("EMERGENC")) return "emergencia";

  return undefined;
}

/**
 * Mapeia porte da cirurgia
 */
function mapPorte(tp: string | null | undefined): string {
  if (!tp || tp === "N/A") return "Desconhecido";

  const normalized = tp.toUpperCase().trim();

  if (normalized === "P" || normalized.includes("PEQUENO")) return "Pequeno";
  if (normalized === "M" || normalized.includes("MEDIO") || normalized.includes("MÉDIO")) return "Médio";
  if (normalized === "G" || normalized.includes("GRANDE")) return "Grande";

  return "Desconhecido";
}

/**
 * Mapeia itens do backend para ItemFornecedor[]
 */
function mapItems(items: BackendItem[] | null | undefined): ItemFornecedor[] {
  if (!items || !Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item) => item && item.item && item.item !== "N/A")
    .map((item) => {
      // Separa fornecedores homologados e não homologados
      const fornecedoresHomologados: string[] = [];
      const fornecedoresNaoHomologados: string[] = [];

      if (Array.isArray(item.fornecedores) && Array.isArray(item.homolog)) {
        item.fornecedores.forEach((fornecedor, index) => {
          if (fornecedor && fornecedor.trim() !== "") {
            if (item.homolog[index] === true) {
              fornecedoresHomologados.push(fornecedor);
            } else {
              fornecedoresNaoHomologados.push(fornecedor);
            }
          }
        });
      }

      return {
        nome: item.item,
        quantidade: item.quantidade || 1,
        // Considera homologado se pelo menos um fornecedor estiver homologado
        homologado: fornecedoresHomologados.length > 0,
        fornecedoresHomologados,
        fornecedoresNaoHomologados,
      };
    });
}

/**
 * Transforma objeto do backend (BackendSurgery) em Patient do frontend
 */
function transformBackendToPatient(api: BackendSurgery): Patient {
  const itens = mapItems(api.items);

  const nomeFinal = api.NM_PACIENTE && api.NM_PACIENTE !== "N/A" && api.NM_PACIENTE !== "Não informado"
    ? api.NM_PACIENTE
    : api.NM_PRESTADOR === "N/A" || !api.NM_PRESTADOR
      ? `Paciente ${api.CD_AVISO_CIRURGIA}`
      : api.NM_PRESTADOR;

  // Tipo do procedimento: identificado pelo sistema (sem marcação manual)
  const tipoProcedimento: TipoProcedimento = api.TIPO_PROCEDIMENTO
    ?? (api.SN_MISTO ? "Misto" : api.SN_PACOTE === "S" ? "Pacote" : "Aberto");

  return {
    id: String(api.CD_AVISO_CIRURGIA),
    nome: nomeFinal,
    codigoAviso: `AV-${api.CD_AVISO_CIRURGIA}`,
    numeroAviso: api.CD_AVISO_CIRURGIA,
    medico: api.NM_PRESTADOR === "N/A" || !api.NM_PRESTADOR
      ? "Não informado"
      : api.NM_PRESTADOR,
    convenio: api.NM_CONVENIO === "N/A" || !api.NM_CONVENIO
      ? "Não informado"
      : api.NM_CONVENIO,
    procedimento: api.DS_CIRURGIA === "N/A" || !api.DS_CIRURGIA
      ? "Não informado"
      : api.DS_CIRURGIA,
    cirurgia: api.DS_CIRURGIA === "N/A" || !api.DS_CIRURGIA
      ? "Não informado"
      : api.DS_CIRURGIA,
    especialidade: api.ESPECIALIDADE && api.ESPECIALIDADE !== "N/A"
      ? api.ESPECIALIDADE.trim()
      : "Outras",
    opmeStatus: "nao-informado",
    dataCirurgia: formatDate(api.DT_CIRURGIA) ?? "",
    dataCriacaoAviso: formatDateOrNotInformed(api.DT_AVISO_CIRURGIA),
    dataAgendadaProcedimento: formatDateOrNotInformed(api.DT_INICIO_AGE_CIR),
    dataAgendadaInternacao: formatDateOrNotInformed(api.DT_CIRURGIA),
    tipoCirurgia: mapTipoCirurgia(api.TP_CIRURGIAS),
    porte: mapPorte(api.TP_CIRURGIA),
    itens,
    opmes: itens.length,
    avisos: api.ETAPA_PROCESSO && api.ETAPA_PROCESSO !== "N/A"
      ? [api.ETAPA_PROCESSO]
      : undefined,
    observacoes: undefined,
    etapaProcesso: api.ETAPA_PROCESSO && api.ETAPA_PROCESSO !== "N/A"
      ? api.ETAPA_PROCESSO
      : undefined,
    // Campos para integração com BI
    cdCirurgia: api.CD_CIRURGIA,
    cdPrestador: api.CD_PRESTADOR,
    cdConvenio: api.CD_CONVENIO,
    vlPrevisto: api.VL_PREVISTO && api.VL_PREVISTO !== "N/A" ? Number(api.VL_PREVISTO) : undefined,
    // Campos de tempo
    tempoAutorizacao: api.DIF_CP_RA && api.DIF_CP_RA !== "N/A" ? Number(api.DIF_CP_RA) : undefined,
    tempoEnvio: api.DIF_RA_PA && api.DIF_RA_PA !== "N/A" ? Number(api.DIF_RA_PA) : undefined,
    // Indicador de pacote
    snPacote: api.SN_PACOTE && api.SN_PACOTE !== "N/A" ? api.SN_PACOTE : undefined,
    // Indicador de procedimento misto
    snMisto: api.SN_MISTO ?? false,
    // Nome do paciente (INICIAIS_PACIENTE)
    nmPaciente: api.NM_PACIENTE && api.NM_PACIENTE !== "N/A" && api.NM_PACIENTE !== "Não informado"
      ? api.NM_PACIENTE
      : undefined,
    // Produto
    hospitalId: api.HOSPITAL_ID,
    tipoProcedimento,
    riscoGlosa: api.RISCO_GLOSA,
    receitaPrevista: api.VL_RECEITA_PREVISTA,
    custoPrevisto: api.VL_CUSTO_PREVISTO,
    diasAteCirurgia: diasAte(api.DT_INICIO_AGE_CIR || api.DT_CIRURGIA),
    // Sem equivalência técnica ativada, o item equivalente ANVISA sai das alternativas
    itensPedido: api.ITENS_PEDIDO?.map((item) => ({
      ...item,
      opcoes: lerConfig().equivalenciaTecnica ? item.opcoes : item.opcoes.filter((o) => !o.equivalente),
      sugestoes: lerConfig().equivalenciaTecnica
        ? item.sugestoes
        : item.sugestoes.filter((s) => !s.equivalenciaTecnica),
    })),
    pedido: api.PEDIDO,
    diasNaEtapa: api.DIAS_NA_ETAPA,
    slaEtapa: api.SLA_ETAPA,
    materialConfirmado: api.MATERIAL_CONFIRMADO,
    comprador: api.COMPRADOR,
  };
}

// ============ DATA PROVIDER INTERFACES ============

export interface ItensFornecedores {
  id: string;
  paciente_id: string;
  fornecedores_sugeridos: string[];
}

export interface ItemSolicitado {
  id: string;
  paciente_id: string;
  nome_item: string;
  quantidade: number;
  homologado: boolean | null;
}

class DataProvider {
  private itensFornecedores: Map<string, ItensFornecedores> = new Map();
  private itensSolicitados: Map<string, ItemSolicitado[]> = new Map();

  // ============ PACIENTES ============
  async getPacientes(): Promise<Patient[]> {
    try {
      const allPatients: Patient[] = [];
      let page = 1;
      const pageSize = 15000; // Tamanho da página para buscar
      let hasMore = true;

      // Busca todas as páginas automaticamente
      while (hasMore) {
        const url = `${baseUrl}/get_surgeries_by_page?page=${page}&number_of_results=${pageSize}`;

        const response = await apiFetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const backendData: BackendSurgery[] = await response.json();

        // Se a página retornar vazia, para o loop
        if (!backendData || backendData.length === 0) {
          hasMore = false;
          break;
        }

        // Mapeia dados do backend para o tipo Patient e filtra os convênios
        // excluídos nas configurações do hospital (dados continuam no banco)
        const patients = backendData
          .map(transformBackendToPatient)
          .filter(p => !convenioExcluido(p.convenio));

        allPatients.push(...patients);

        // Se retornou menos que pageSize, é a última página
        if (backendData.length < pageSize) {
          hasMore = false;
        } else {
          page++; // Continua para próxima página
        }
      }

      // Ordena por dataCirurgia desc
      return allPatients.sort((a, b) => {
        if (!a.dataCirurgia || !b.dataCirurgia) return 0;
        const dateA = new Date(a.dataCirurgia.split('/').reverse().join('-'));
        const dateB = new Date(b.dataCirurgia.split('/').reverse().join('-'));
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error("Erro ao buscar pacientes do backend:", error);
      // Fallback: retorna array vazio em caso de erro
      return [];
    }
  }

  async getPacienteById(id: string): Promise<Patient | null> {
    await delay(200);
    const allPatients = await this.getPacientes();
    return allPatients.find(p => p.id === id) || null;
  }

  // Simulate real-time updates (for future Supabase integration)
  subscribeToPacientes(callback: (patients: Patient[]) => void) {
    // Mock: call callback immediately
    this.getPacientes().then(callback);

    // Return unsubscribe function
    return () => {};
  }

  // ============ ITENS FORNECEDORES ============
  async getItensFornecedores(pacienteId: string): Promise<ItensFornecedores | null> {
    await delay(200);
    return this.itensFornecedores.get(pacienteId) || null;
  }

  async saveItensFornecedores(data: Omit<ItensFornecedores, 'id'>): Promise<ItensFornecedores> {
    await delay(300);

    const existing = this.itensFornecedores.get(data.paciente_id);
    const item: ItensFornecedores = existing
      ? { ...existing, ...data }
      : { id: `if-${Date.now()}`, ...data };

    this.itensFornecedores.set(data.paciente_id, item);
    return item;
  }

  // ============ ITENS SOLICITADOS ============
  async getItensSolicitados(pacienteId: string): Promise<ItemSolicitado[]> {
    await delay(200);
    return this.itensSolicitados.get(pacienteId) || [];
  }

  async saveItensSolicitados(
    pacienteId: string,
    itens: Array<{ nome_item: string; quantidade: number }>
  ): Promise<ItemSolicitado[]> {
    await delay(300);

    // Create new items with homologado = null
    const newItems: ItemSolicitado[] = itens.map((item, idx) => ({
      id: `is-${pacienteId}-${Date.now()}-${idx}`,
      paciente_id: pacienteId,
      nome_item: item.nome_item,
      quantidade: item.quantidade,
      homologado: null, // Robot hasn't evaluated yet
    }));

    this.itensSolicitados.set(pacienteId, newItems);

    return newItems;
  }

  // ============ SALVAR ITENS E FORNECEDORES NO BANCO ============
  async saveCirurgiaItens(
    pacienteId: string,
    fornecedores: string[],
    itens: Array<{
      nome_item: string;
      quantidade: number;
      cobranca_em_conta: boolean;
      fornecimento_direto: boolean;
      pacote: boolean;
    }>
  ): Promise<{ status: string; itens_salvos: number }> {
    // Busca os dados do paciente para obter informações necessárias
    const patient = await this.getPacienteById(pacienteId);

    if (!patient) {
      throw new Error("Paciente não encontrado");
    }

    if (!patient.numeroAviso || !patient.cdConvenio || !patient.especialidade) {
      throw new Error("Dados insuficientes do paciente para salvar itens");
    }

    // Monta o payload no formato esperado pelo backend
    const payload = {
      cod_cirurgia: patient.numeroAviso,
      especialidade: patient.especialidade,
      convenio_code: patient.cdConvenio,
      fornecedores: fornecedores,
      itens: itens.map(item => ({
        nome_item: item.nome_item,
        quantidade_item: item.quantidade,
        cobranca_em_conta: item.cobranca_em_conta,
        fornecimento_direto: item.fornecimento_direto,
        pacote: item.pacote
      }))
    };

    // Chama o endpoint real do backend
    const response = await apiFetch(`${baseUrl}/salvar_itens_cirurgia_atual`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Erro ao salvar itens: ${response.status}`);
    }

    return await response.json();
  }

  async deleteItemSolicitado(itemId: string): Promise<void> {
    await delay(200);

    for (const [pacienteId, itens] of this.itensSolicitados.entries()) {
      const filtered = itens.filter(item => item.id !== itemId);
      if (filtered.length !== itens.length) {
        this.itensSolicitados.set(pacienteId, filtered);
        break;
      }
    }
  }

  async deleteItensOpme(codCirurgia: number): Promise<{ itens_deletados: number }> {
    const response = await apiFetch(`${baseUrl}/deletar_itens_opme/${codCirurgia}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Erro ao deletar itens: ${response.status}`);
    }
    return response.json();
  }

  // ============ ATUALIZAR PROCEDIMENTO MISTO ============
  async updateProcedimentoMisto(
    cdAvisoCirurgia: number,
    snMisto: boolean
  ): Promise<{ status: string }> {
    const response = await apiFetch(
      `${baseUrl}/salvar_misto_boolean_for_surgery?CD_AVISO_CIRURGIA=${cdAvisoCirurgia}&SN_MISTO=${snMisto}`,
      {
        method: 'PUT',
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao atualizar procedimento misto: ${response.status}`);
    }

    return await response.json();
  }
}

// Singleton instance
export const dataProvider = new DataProvider();
