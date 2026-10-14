import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Dominio } from "@/dominio/tipos";
import { dataBR } from "./formato";

interface Props {
  procedimentoId: string | null;
  dominio: Dominio;
  onClose: () => void;
}

/** O protocolo da cirurgia: critérios de entrada, itens previstos e documentos. */
const ProtocoloModal = ({ procedimentoId, dominio, onClose }: Props) => {
  const padrao = procedimentoId ? dominio.padroes[procedimentoId] : undefined;
  const proc = dominio.procedimentos.find((p) => p.id === procedimentoId);
  return (
    <Dialog open={!!padrao} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        {padrao && proc && (
          <>
            <DialogHeader>
              <DialogTitle>Protocolo — {proc.nome}</DialogTitle>
              <DialogDescription>
                {padrao.protocolo.fonte}
                {padrao.protocolo.revisao && ` · revisão em ${dataBR(padrao.protocolo.revisao)}`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <section>
                <h3 className="mb-1 font-semibold">Critérios de entrada</h3>
                <ul className="list-disc space-y-1 pl-5">{padrao.protocolo.criterios.map((c) => <li key={c}>{c}</li>)}</ul>
              </section>
              <section>
                <h3 className="mb-1 font-semibold">Materiais previstos</h3>
                <ul className="list-disc space-y-1 pl-5">
                  {padrao.itens.map((i) => {
                    const item = dominio.itens.find((x) => x.id === i.itemId)!;
                    return <li key={i.itemId}>{item.nome} <span className="text-muted-foreground">· {item.caracteristica} · até {i.qtdTipica}</span></li>;
                  })}
                </ul>
              </section>
              <section>
                <h3 className="mb-1 font-semibold">Documentos obrigatórios</h3>
                <ul className="list-disc space-y-1 pl-5">{padrao.protocolo.documentos.map((d) => <li key={d}>{d}</li>)}</ul>
              </section>
              <p className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
                Itens fora do protocolo podem ser pedidos com justificativa. Nesse caso o pedido fica marcado e o complemento ligado ao padrão deixa de ser garantido.
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProtocoloModal;
