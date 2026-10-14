import { ConfigProduto } from "@opme/types/produto";

/** Nome provisório do produto — trocar aqui quando a marca for definida */
export const PRODUCT_NAME = "OPME.AI";
export const PRODUCT_TAGLINE = "Inteligência de OPME para hospitais";
export const PRODUCT_OWNER = "3Wings";

/** Modo mock: dados fictícios servidos pelo próprio frontend, sem backend */
export const IS_MOCK = true;

export const HOSPITAL_STORAGE_KEY = "hospital_atual";
export const CONFIG_STORAGE_KEY = "config_produto";
export const REDE_ID = "rede";

export const CONFIG_PADRAO: ConfigProduto = {
  rankingFornecedorMedico: true,
  estatisticasMedico: true,
  equivalenciaTecnica: true,
  conveniosExcluidos: ["SUS"],
};

/** Cada hospital (e a rede) guarda a sua própria configuração */
export function chaveConfig(): string {
  try {
    return `${CONFIG_STORAGE_KEY}_${localStorage.getItem(HOSPITAL_STORAGE_KEY) ?? "padrao"}`;
  } catch {
    return CONFIG_STORAGE_KEY;
  }
}

export function lerConfig(): ConfigProduto {
  try {
    const salvo = localStorage.getItem(chaveConfig());
    if (salvo) return { ...CONFIG_PADRAO, ...JSON.parse(salvo) };
  } catch {
    // localStorage indisponível ou corrompido: usa o padrão
  }
  return CONFIG_PADRAO;
}

export function convenioExcluido(nomeConvenio: string): boolean {
  const convenio = (nomeConvenio || "").toUpperCase().trim();
  return lerConfig().conveniosExcluidos.some(
    (keyword) => keyword.trim() !== "" && convenio.includes(keyword.toUpperCase().trim())
  );
}

/**
 * De onde se entrou no pedido de uma cirurgia (parâmetro "origem"). Fora do operacional
 * (Compras), o pedido é só para ver, e o "Voltar" leva de volta à tela de origem.
 */
export const ORIGENS_PEDIDO: Record<string, { label: string; path: string }> = {
  acompanhamento: { label: "Acompanhamento", path: "/acompanhamento" },
  insights: { label: "Insights", path: "/insights" },
  resultados: { label: "Resultados", path: "/bi-geral" },
};
