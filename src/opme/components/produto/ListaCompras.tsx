import { useNavigate } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@opme/components/ui/button";
import { LinhaCompra } from "@opme/hooks/useListaCompras";
import { formatBRL, textoDias } from "@opme/lib/produto";
import { StatusCirurgia } from "@opme/lib/otimizador";
import { cn } from "@opme/lib/utils";
import StatusOtimizacao from "./StatusOtimizacao";
import ChipHomologacao from "./ChipHomologacao";

const ORDEM: Record<StatusCirurgia, number> = { sugerida: 0, otimizavel: 1, nao_otimizavel: 2, melhor_margem: 3, definida: 4 };

interface ListaComprasProps {
  linhas: LinhaCompra[];
  onAceitar: (l: LinhaCompra) => void;
}

/** Lista de compras: primeiro o que pode ganhar mais; o que já está na maior margem fica no fim */
const ListaCompras = ({ linhas, onAceitar }: ListaComprasProps) => {
  const navigate = useNavigate();
  const ordenadas = [...linhas].sort(
    (a, b) => ORDEM[a.analise.status] - ORDEM[b.analise.status] || b.analise.ganho - a.analise.ganho || (a.p.diasAteCirurgia ?? 0) - (b.p.diasAteCirurgia ?? 0)
  );

  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-0 overflow-x-auto">
      <table className="w-full min-w-[1320px] text-left">
        <thead>
          <tr className="border-b border-neutral-200 bg-[#F0F3F7] text-[11px] uppercase tracking-wide text-neutral-500">
            <th className="py-3 pl-4 pr-2 font-semibold w-10">#</th>
            <th className="py-3 px-2 font-semibold">Paciente / aviso</th>
            <th className="py-3 px-2 font-semibold">Procedimento</th>
            <th className="py-3 px-2 font-semibold">Médico · operadora</th>
            <th className="py-3 px-2 font-semibold">Cirurgia</th>
            <th className="py-3 px-2 font-semibold">Etapa</th>
            <th className="py-3 px-2 font-semibold text-right">Margem atual</th>
            <th className="py-3 px-2 font-semibold text-right">Com otimização</th>
            <th className="py-3 px-2 font-semibold">Otimização</th>
            <th className="py-3 pl-2 pr-4" />
          </tr>
        </thead>
        <tbody>
          {ordenadas.map((l, idx) => {
            const { p, resumo, analise } = l;
            const otimizada = resumo.margemAtual + analise.ganho;
            return (
              <tr
                key={p.id}
                onClick={() => navigate(`/bi/procedimento/${p.id}`)}
                className="border-b border-neutral-100 last:border-0 hover:bg-[#F7F9FC] cursor-pointer"
              >
                <td className="py-3 pl-4 pr-2 text-[13px] font-semibold text-neutral-400 tabular-nums">{idx + 1}</td>
                <td className="py-3 px-2">
                  <p className="text-[14px] font-bold text-neutral-600">{p.nmPaciente ?? p.nome}</p>
                  <p className="text-[12px] text-neutral-500">Aviso {p.numeroAviso}</p>
                </td>
                <td className="py-3 px-2 max-w-[240px]">
                  <p className="text-[13px] text-neutral-600 line-clamp-1" title={p.procedimento}>{p.procedimento}</p>
                  <p className="text-[12px] text-neutral-500">{p.especialidade} · {p.tipoProcedimento}</p>
                </td>
                <td className="py-3 px-2 max-w-[210px]">
                  <p className="text-[13px] text-neutral-600 line-clamp-1">{p.medico}</p>
                  <p className="text-[12px] text-neutral-500">{p.convenio}</p>
                </td>
                <td className="py-3 px-2">
                  <p className={cn("text-[13px] font-semibold", (p.diasAteCirurgia ?? 99) <= 7 ? "text-status-error-text" : "text-neutral-600")}>
                    {textoDias(p.diasAteCirurgia)}
                  </p>
                  <p className="text-[12px] text-neutral-500">{p.dataCirurgia}</p>
                </td>
                <td className="py-3 px-2">
                  <span className="inline-flex px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-[11px] font-semibold text-blue-700 uppercase tracking-wide whitespace-nowrap">
                    {p.etapaProcesso}
                  </span>
                </td>
                <td className={cn("py-3 px-2 text-right text-[13px] font-semibold tabular-nums", resumo.margemAtual >= 0 ? "text-neutral-600" : "text-status-error-text")}>
                  {formatBRL(resumo.margemAtual)}
                </td>
                <td className="py-3 px-2 text-right tabular-nums">
                  {analise.ganho > 0 ? (
                    <>
                      <p className={cn("text-[13px] font-bold", otimizada >= 0 ? "text-status-success-text" : "text-status-error-text")}>{formatBRL(otimizada)}</p>
                      <p className="text-[11px] font-semibold text-status-success-text">+{formatBRL(analise.ganho)}</p>
                    </>
                  ) : (
                    <span className="text-[13px] text-neutral-400">—</span>
                  )}
                </td>
                <td className="py-3 px-2">
                  <StatusOtimizacao analise={analise} />
                  {(() => {
                    const n = analise.itens.filter((a) => a.atual && !a.atual.homologado).length;
                    return n > 0 ? <ChipHomologacao operadora={p.convenio} quantidade={n} className="ml-1.5 align-middle" /> : null;
                  })()}
                  {analise.status === "nao_otimizavel" && analise.motivo && (
                    <p className="text-[11px] text-red-700 mt-1 max-w-[220px]">{analise.motivo}</p>
                  )}
                </td>
                <td className="py-3 pl-2 pr-4 text-right">
                  {analise.status === "sugerida" ? (
                    <Button
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); onAceitar(l); }}
                      className="bg-[#27AE60] hover:bg-[#229954] text-white whitespace-nowrap"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Aceitar
                    </Button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#008DDF] whitespace-nowrap">
                      Abrir
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ListaCompras;
