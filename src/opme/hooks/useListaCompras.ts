import { useMemo } from "react";
import { Patient } from "@opme/types/patient";
import { useEscolhas } from "@opme/contexts/EscolhasContext";
import { useOtimizador } from "@opme/contexts/OtimizadorContext";
import { resumoCirurgia, ResumoCirurgia } from "@opme/lib/produto";
import { AnaliseCirurgia, StatusCirurgia, analisarCirurgia } from "@opme/lib/otimizador";

export interface LinhaCompra {
  p: Patient;
  resumo: ResumoCirurgia;
  analise: AnaliseCirurgia;
}

/**
 * Lista de compras otimizada: cada cirurgia com o status de otimização e quanto pode ganhar.
 * Também expõe "Otimizar tudo" e "Aceitar todas" para a lista inteira.
 */
export function useListaCompras(patients: Patient[]) {
  const { escolhas, escolherVarios } = useEscolhas();
  const { estado, otimizar, cancelar } = useOtimizador();

  const linhas: LinhaCompra[] = useMemo(
    () =>
      patients
        .filter((p) => (p.diasAteCirurgia ?? -1) >= 0)
        .map((p) => ({ p, resumo: resumoCirurgia(p, escolhas), analise: analisarCirurgia(p, escolhas, estado) })),
    [patients, escolhas, estado]
  );

  const totais = useMemo(() => {
    const conta = (s: StatusCirurgia) => linhas.filter((l) => l.analise.status === s).length;
    return {
      cirurgias: linhas.length,
      margemAtual: linhas.reduce((s, l) => s + l.resumo.margemAtual, 0),
      ganho: linhas.reduce((s, l) => s + l.analise.ganho, 0),
      capturado: linhas.reduce((s, l) => s + l.analise.capturado, 0),
      pendentes: linhas.reduce((s, l) => s + l.analise.pendentes, 0),
      /** O que uma nova otimização sugeriria: itens com ganho ainda sem sugestão */
      itensOtimizaveis: linhas.reduce((s, l) => s + l.analise.itens.filter((a) => a.situacao === "otimizavel").length, 0),
      ganhoOtimizavel: linhas.reduce((s, l) => s + l.analise.itens.filter((a) => a.situacao === "otimizavel").reduce((x, a) => x + a.ganho, 0), 0),
      /** Margem das sugestões aguardando aceite */
      ganhoSugerido: linhas.reduce((s, l) => s + l.analise.itens.filter((a) => a.situacao === "sugerido").reduce((x, a) => x + a.ganho, 0), 0),
      sugeridas: conta("sugerida"),
      otimizaveis: conta("otimizavel"),
      melhorMargem: conta("melhor_margem"),
      naoOtimizaveis: conta("nao_otimizavel"),
      definidas: conta("definida"),
    };
  }, [linhas]);

  const pendentesDe = (l: LinhaCompra) =>
    l.analise.itens
      .filter((a) => a.situacao === "sugerido" && a.sugerida)
      .map((a) => ({ itemId: a.item.id, cirurgiaId: l.p.id, opcao: a.sugerida! }));

  return {
    linhas,
    totais,
    rodada: estado.rodada,
    otimizarTudo: () => otimizar(patients, escolhas),
    cancelarOtimizacao: cancelar,
    aceitarTodas: () => escolherVarios(linhas.flatMap(pendentesDe)),
    aceitarCirurgia: (l: LinhaCompra) => escolherVarios(pendentesDe(l)),
  };
}
