import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Activity, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSurgical } from "@/contexts/SurgicalContext";
import { useDominio } from "@/dominio/store";
import PedidoWizard from "@/components/pedido/PedidoWizard";

/** Montagem do pedido: /pedido/novo?medico=<id>&modo=medico|secretaria e /pedido/:id?modo=… */
const PedidoPage = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { state } = useSurgical();
  const { dominio, pedidos } = useDominio();

  const modo = params.get("modo") === "medico" ? "medico" : "secretaria";
  const existente = id ? pedidos.find((p) => p.id === id) : undefined;
  const medicoId = existente?.medicoId ?? params.get("medico") ?? state.doctor?.id ?? "1";
  const medico = dominio.medicos.find((m) => m.id === medicoId);
  const inicio = modo === "medico" ? "/medico" : "/home";

  if (id && !existente) {
    return <div className="p-6 text-sm">Pedido não encontrado. <button type="button" className="underline" onClick={() => navigate(inicio)}>Voltar</button></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between gap-3 border-b bg-card px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Activity className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          <span className="font-bold">SolicitaCirurg</span>
          <span className="truncate text-sm text-muted-foreground">· {existente ? "Editar pedido" : "Novo pedido"} · {medico?.nome}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate(inicio)}><ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden /> Voltar ao início</Button>
      </header>
      <PedidoWizard
        key={id ?? "novo"}
        modo={modo}
        medicoId={medicoId}
        pedidoId={existente?.id}
        secretaria={modo === "secretaria" ? "Camila Souza" : undefined}
        onConcluir={() => navigate(inicio)}
      />
    </div>
  );
};

export default PedidoPage;
