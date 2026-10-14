import { useMemo } from "react";
import { useDominio } from "@/dominio/store";
import { gerarHistorico } from "@/gestao/historico";
import { avaliar } from "@/gestao/analise";

/**
 * Registros que a gestão analisa: o histórico de exemplo (abr–set/2026)
 * mais os pedidos confirmados no próprio protótipo. Tudo passa pelo mesmo motor.
 */
export function useRegistros() {
  const { dominio, pedidos } = useDominio();
  return useMemo(
    () => avaliar([...gerarHistorico(dominio), ...pedidos.filter((p) => p.status === "confirmado")], dominio),
    [dominio, pedidos],
  );
}
