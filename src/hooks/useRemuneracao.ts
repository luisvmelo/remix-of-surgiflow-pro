import { useSurgical } from "@/contexts/SurgicalContext";
import { calcularGuia, complementarItem, honorarioVinculado, infoMatMed } from "@/lib/remuneracao";

/** Honorário do médico na guia em montagem no wizard, já com a configuração do hospital. */
export function useRemuneracao() {
  const { state, hospitalConfig } = useSurgical();
  const operadoraId = state.operadora?.id;
  const nivel = state.planoNivel;

  const calculo = calcularGuia(
    {
      procedimentoCode: state.selectedProcedure?.code,
      operadoraId,
      nivel,
      vinculados: state.linkedProcedures,
      itens: state.selectedOpmes,
    },
    hospitalConfig,
  );

  return {
    calculo,
    config: hospitalConfig,
    honorarioDoProcedimento: (code: string) => honorarioVinculado(code, operadoraId, nivel),
    complementarDoItem: (name: string, quantity = 1) => complementarItem(name, quantity, hospitalConfig),
    faixaDoItem: (name: string) => infoMatMed(name)?.faixa,
  };
}
