import { useMemo } from "react";
import { ArrowRight, Heart } from "lucide-react";
import { MEDICOS, OPERADORAS, PROCEDIMENTOS, classeDoItem } from "@opme/mock/catalogo";
import { montarOpcoes } from "@opme/mock/db";
import { formatBRL } from "@opme/lib/produto";
import { cn } from "@opme/lib/utils";
import NotaMedico from "./NotaMedico";
import { ChipClasse } from "./MontagemPedido";

interface PreferenciasMedicoProps {
  cdPrestador?: number;
  cdConvenio?: number;
}

/**
 * Rating do médico: em cada item da especialidade, o fornecedor que ele mais usa (histórico)
 * contra o de maior margem entre os que ele costuma indicar.
 */
const PreferenciasMedico = ({ cdPrestador, cdConvenio }: PreferenciasMedicoProps) => {
  const linhas = useMemo(() => {
    const medico = MEDICOS.find((m) => m.cd === cdPrestador);
    const op = OPERADORAS.find((o) => o.cd === cdConvenio) ?? OPERADORAS[0];
    if (!medico) return [];
    const vistos = new Set<string>();
    return PROCEDIMENTOS.filter((p) => p.especialidade === medico.especialidade)
      .flatMap((proc) => proc.itens.map((tpl) => ({ proc, tpl })))
      .filter(({ tpl }) => (vistos.has(tpl.nome) ? false : (vistos.add(tpl.nome), true)))
      .map(({ proc, tpl }) => {
        const qtd = Math.round((tpl.qtd[0] + tpl.qtd[1]) / 2);
        const { opcoes, cirurgiasMedico } = montarOpcoes(`pref-${tpl.tuss}`, tpl, qtd, op, medico, proc.especialidade, 0);
        const indicados = opcoes.filter((o) => o.origem === "medico");
        const preferido = indicados.find((o) => o.destaques.includes("preferido_medico")) ?? indicados[0];
        const melhor = [...indicados].sort((a, b) => b.margem - a.margem || b.usoMedicoPct - a.usoMedicoPct)[0] ?? preferido;
        return {
          item: tpl.nome,
          classe: classeDoItem(tpl.nome),
          cirurgias: cirurgiasMedico,
          preferido,
          melhor,
          ganho: (melhor?.margem ?? 0) - (preferido?.margem ?? 0),
        };
      })
      .sort((a, b) => b.ganho - a.ganho);
  }, [cdPrestador, cdConvenio]);

  const ganhoTotal = linhas.reduce((s, l) => s + Math.max(0, l.ganho), 0);
  const coincidem = linhas.filter((l) => l.melhor?.id === l.preferido?.id).length;

  return (
    <div className="bg-surface rounded-lg shadow-elevation-1 overflow-hidden">
      <div className="px-5 py-4 border-b border-cinza-200 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="flex items-center gap-2 text-[13px] font-bold text-cinza-700 uppercase tracking-wide">
            <Heart className="w-4 h-4 text-amber-500" />
            Preferências do médico × maior margem
          </h3>
          <p className="text-[12px] text-cinza-500 mt-0.5">
            O que ele mais usa, pelo histórico das cirurgias, contra o fornecedor de maior margem entre os que ele indica.
          </p>
        </div>
        <div className="flex gap-6 text-right">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-cinza-500">Itens em que o preferido já é o melhor</p>
            <p className="text-[18px] font-bold text-cinza-700 tabular-nums">{coincidem} de {linhas.length}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-cinza-500">Ganho possível por cirurgia</p>
            <p className="text-[18px] font-bold text-status-success-text tabular-nums">+{formatBRL(ganhoTotal)}</p>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left">
          <thead>
            <tr className="bg-cinza-50 border-b border-cinza-200 text-[11px] uppercase tracking-wide text-cinza-500">
              <th className="py-2.5 pl-5 pr-2 font-semibold">Item</th>
              <th className="py-2.5 px-2 font-semibold text-right">Cirurgias</th>
              <th className="py-2.5 px-2 font-semibold">Preferido do médico</th>
              <th className="py-2.5 px-2 font-semibold text-right">Margem</th>
              <th className="py-2.5 px-2 font-semibold">Maior margem</th>
              <th className="py-2.5 px-2 font-semibold text-right">Margem</th>
              <th className="py-2.5 pl-2 pr-5 font-semibold text-right">Ganho</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => {
              const igual = l.melhor?.id === l.preferido?.id;
              return (
                <tr key={l.item} className="border-b border-cinza-100 last:border-0">
                  <td className="py-3 pl-5 pr-2">
                    <p className="flex items-center gap-1.5 text-[13px] font-semibold text-cinza-700">
                      <ChipClasse classe={l.classe} />
                      {l.item}
                    </p>
                  </td>
                  <td className="py-3 px-2 text-right text-[13px] tabular-nums text-cinza-600">{l.cirurgias}</td>
                  <td className="py-3 px-2">
                    <p className="text-[13px] text-cinza-700">{l.preferido?.fornecedor}</p>
                    <p className="flex items-center gap-1.5 text-[11px] text-cinza-500">
                      <NotaMedico nota={l.preferido?.notaMedico ?? 0} /> {l.preferido?.usoMedicoPct}% do uso
                    </p>
                  </td>
                  <td className="py-3 px-2 text-right text-[13px] tabular-nums text-cinza-700">{formatBRL(l.preferido?.margem ?? 0)}</td>
                  <td className="py-3 px-2">
                    {igual ? (
                      <span className="text-[12px] font-semibold text-status-success-text">O mesmo</span>
                    ) : (
                      <>
                        <p className="flex items-center gap-1 text-[13px] font-semibold text-[#325AA4]">
                          <ArrowRight className="w-3.5 h-3.5" />
                          {l.melhor?.fornecedor}
                        </p>
                        <p className="flex items-center gap-1.5 text-[11px] text-cinza-500">
                          <NotaMedico nota={l.melhor?.notaMedico ?? 0} /> {l.melhor?.usoMedicoPct}% do uso
                        </p>
                      </>
                    )}
                  </td>
                  <td className="py-3 px-2 text-right text-[13px] tabular-nums text-cinza-700">{formatBRL(l.melhor?.margem ?? 0)}</td>
                  <td className={cn("py-3 pl-2 pr-5 text-right text-[13px] font-bold tabular-nums", l.ganho > 0 ? "text-status-success-text" : "text-cinza-400")}>
                    {l.ganho > 0 ? `+${formatBRL(l.ganho)}` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PreferenciasMedico;
