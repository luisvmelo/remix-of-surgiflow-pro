import { useMemo } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, ChevronRight, Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDominio } from "@/dominio/store";
import { avaliarPedido } from "@/dominio/motor";
import { brl, dataBR } from "@/components/pedido/formato";

/** Compras · fila dos pedidos que chegaram do wizard e esperam confirmação. */
const FilaRevisao = () => {
  const { dominio, pedidos } = useDominio();
  const fila = useMemo(
    () =>
      pedidos
        .filter((p) => p.status === "esperando_confirmacao")
        .map((p) => ({ p, a: avaliarPedido(p, dominio) }))
        .sort((x, y) => x.p.dataCirurgia.localeCompare(y.p.dataCirurgia)),
    [pedidos, dominio],
  );
  const nome = <T extends { id: string; nome: string }>(lista: T[], id: string) => lista.find((x) => x.id === id)?.nome ?? id;

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <header className="bg-white px-6 py-5 border-b border-neutral-100">
        <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#008DDF]">Operacional · Compras</p>
        <h1 className="text-[28px] leading-9 font-bold text-cinza-700 mt-1">Revisão de pedidos</h1>
        <p className="text-[14px] text-cinza-500 mt-1 max-w-3xl">
          Pedidos montados pelo médico ou pela secretária no wizard. Confira o leque, troque dentro dele, peça ajuste ou aceite o que estiver fora do padrão.
        </p>
      </header>

      <main className="flex-1 p-6 max-w-[1200px] w-full mx-auto space-y-3">
        {fila.length === 0 && (
          <div className="rounded-lg border border-dashed p-10 text-center text-cinza-500">
            <Inbox className="w-8 h-8 mx-auto mb-2" aria-hidden />
            Nenhum pedido esperando confirmação.
          </div>
        )}
        {fila.map(({ p, a }) => {
          const fora = a.foraPadrao.length + a.foraProtocolo.length + a.naoHomologados.length;
          const ajustes = p.ajustes.filter((x) => !x.resolvido).length;
          return (
            <article key={p.id} className="rounded-lg bg-white shadow-elevation-1 border border-cinza-200 hover:border-[#008DDF] transition-colors">
              <Link to={`/revisao/${p.id}`} className="flex flex-wrap items-center gap-4 p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008DDF] rounded-lg">
                <div className="flex-1 min-w-[16rem]">
                  <p className="font-semibold text-cinza-700">{p.paciente.nome}</p>
                  <p className="text-[13px] text-cinza-500">
                    {nome(dominio.procedimentos, p.procedimentoId)} · {nome(dominio.medicos, p.medicoId)}
                  </p>
                  <p className="text-[13px] text-cinza-500">
                    {nome(dominio.operadoras, p.operadoraId)} · {p.plano}
                    {p.secretaria && ` · montado por ${p.secretaria}`}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {fora === 0 ? (
                      <Badge className="bg-emerald-600 hover:bg-emerald-600">Dentro do padrão</Badge>
                    ) : (
                      <>
                        {a.foraProtocolo.length > 0 && <Badge variant="outline" className="border-red-300 text-red-700">Fora do protocolo</Badge>}
                        {a.foraPadrao.length > 0 && <Badge variant="outline" className="border-amber-300 text-amber-700">Fora do padrão</Badge>}
                        {a.naoHomologados.length > 0 && <Badge variant="outline" className="border-amber-300 text-amber-700">Não homologado</Badge>}
                      </>
                    )}
                    {p.aceitoForaPadrao && <Badge variant="secondary">Aceito fora do padrão</Badge>}
                    {ajustes > 0 && <Badge variant="outline" className="border-[#008DDF] text-[#008DDF]">{ajustes} ajuste(s) pedido(s)</Badge>}
                    {p.urgencia && <Badge variant="destructive">Urgência</Badge>}
                  </div>
                </div>
                <div className="text-right text-[13px]">
                  <p className="flex items-center justify-end gap-1 text-cinza-700 font-medium">
                    <CalendarDays className="w-4 h-4" aria-hidden /> {dataBR(p.dataCirurgia)}
                  </p>
                  <p className="text-cinza-500">OPME {brl(a.hospital.custoOpme)} · libera em {a.liberacaoDias} dias</p>
                  <p className={a.hospital.margem < 0 ? "text-red-700" : "text-cinza-500"}>Margem {brl(a.hospital.margem)}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-cinza-400" aria-hidden />
              </Link>
            </article>
          );
        })}
      </main>
    </div>
  );
};

export default FilaRevisao;
