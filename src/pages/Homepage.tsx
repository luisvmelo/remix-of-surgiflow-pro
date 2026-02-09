import { useNavigate } from "react-router-dom";
import { useSurgical } from "@/contexts/SurgicalContext";
import { Button } from "@/components/ui/button";
import { Activity, Plus, ExternalLink, Pencil, Calendar, User, Building, Stethoscope, Clock, AlertTriangle, CheckCircle2, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const mockPendingProcedures = [
  {
    id: "1",
    patient: "João Carlos Silva",
    operadora: "Unimed",
    procedure: "Artroscopia de Joelho — Meniscectomia",
    code: "30725119",
    doctor: "Dr. Ricardo Almeida",
    date: "2026-02-18",
    itemCount: 10,
    status: "awaiting-auth" as const,
    statusLabel: "Aguardando Autorização",
    missingDocs: 2,
    hasOffenders: false,
  },
  {
    id: "2",
    patient: "Ana Paula Ferreira",
    operadora: "Bradesco Saúde",
    procedure: "Reconstrução de LCA",
    code: "30725097",
    doctor: "Dr. Ricardo Almeida",
    date: "2026-02-25",
    itemCount: 8,
    status: "docs-pending" as const,
    statusLabel: "Documentos Pendentes",
    missingDocs: 3,
    hasOffenders: true,
  },
  {
    id: "3",
    patient: "Carlos Eduardo Martins",
    operadora: "Amil",
    procedure: "Tratamento cirúrgico de fratura de punho",
    code: "30715016",
    doctor: "Dr. Ricardo Almeida",
    date: "2026-03-05",
    itemCount: 6,
    status: "authorized" as const,
    statusLabel: "Autorizado",
    missingDocs: 0,
    hasOffenders: false,
  },
  {
    id: "4",
    patient: "Mariana Souza Lima",
    operadora: "Unimed",
    procedure: "Artroscopia de Ombro — Reparo do manguito",
    code: "30725038",
    doctor: "Dr. Ricardo Almeida",
    date: "2026-03-12",
    itemCount: 12,
    status: "awaiting-auth" as const,
    statusLabel: "Aguardando Autorização",
    missingDocs: 1,
    hasOffenders: true,
  },
  {
    id: "5",
    patient: "Roberto Nascimento",
    operadora: "SulAmérica",
    procedure: "Osteossíntese de platô tibial",
    code: "30725080",
    doctor: "Dr. Ricardo Almeida",
    date: "2026-03-20",
    itemCount: 9,
    status: "docs-pending" as const,
    statusLabel: "Documentos Pendentes",
    missingDocs: 4,
    hasOffenders: false,
  },
];

const statusConfig: Record<string, { color: string; bg: string; icon: typeof Clock }> = {
  "draft": { color: "text-muted-foreground", bg: "bg-muted/50 border-border", icon: Clock },
  "awaiting-auth": { color: "text-warning", bg: "bg-warning/10 border-warning/30", icon: Clock },
  "docs-pending": { color: "text-destructive", bg: "bg-destructive/10 border-destructive/30", icon: AlertTriangle },
  "authorized": { color: "text-success", bg: "bg-success/10 border-success/30", icon: CheckCircle2 },
};

const Homepage = () => {
  const navigate = useNavigate();
  const { state, updateState, savedRequests, resetWizard } = useSurgical();

  const allProcedures = [...savedRequests, ...mockPendingProcedures];

  const handleNewRequest = () => {
    resetWizard();
    navigate("/select-doctor");
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  };

  const hasWarnings = (proc: { missingDocs: number; hasOffenders: boolean; hasGlossRisk?: boolean }) => proc.missingDocs > 0 || proc.hasOffenders || proc.hasGlossRisk;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg text-foreground">SolicitaCirurg</span>
          {state.doctor && (
            <span className="text-sm text-muted-foreground ml-2">· {state.doctor.name}</span>
          )}
        </div>
        <Button onClick={handleNewRequest} className="h-10 px-5">
          <Plus className="w-4 h-4 mr-2" /> Nova Solicitação
        </Button>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Solicitações Pendentes</h1>
          <p className="text-sm text-muted-foreground mt-1">Cirurgias aguardando conclusão de pendências</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allProcedures.map((proc) => {
            const config = statusConfig[proc.status] || statusConfig["awaiting-auth"];
            const StatusIcon = config.icon;
            return (
              <div
                key={proc.id}
                className="glass-card rounded-xl overflow-hidden flex flex-col"
              >
                {/* Status bar */}
                <div className={cn("px-4 py-2 flex items-center gap-2 border-b text-xs font-medium", config.bg)}>
                  <StatusIcon className={cn("w-3.5 h-3.5", config.color)} />
                  <span className={config.color}>{proc.statusLabel}</span>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  {/* Procedure name */}
                  <div className="mb-3">
                    <div className="font-semibold text-foreground text-sm leading-tight">{proc.procedure}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{proc.code}</div>
                  </div>

                  {/* Info grid */}
                  <div className="space-y-2 text-xs flex-1">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="text-foreground">{proc.patient}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="text-foreground">{proc.operadora}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="text-foreground">{formatDate(proc.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="text-foreground">{proc.itemCount} itens/OPMEs</span>
                    </div>
                  </div>

                  {/* Warnings */}
                  {hasWarnings(proc) && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/50">
                      {proc.missingDocs > 0 && (
                        <span className="badge-warning text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" /> {proc.missingDocs} doc(s) pendente(s)
                        </span>
                      )}
                      {proc.hasOffenders && (
                        <span className="badge-danger text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" /> OPME ofensor
                        </span>
                      )}
                      {"hasGlossRisk" in proc && proc.hasGlossRisk && (
                        <span className="badge-warning text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" /> Risco de glosa
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-4 py-3 border-t border-border/50 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 text-xs h-8">
                    <ExternalLink className="w-3 h-3 mr-1" /> Exportar NEO
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs h-8">
                    <Pencil className="w-3 h-3 mr-1" /> Editar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Homepage;
