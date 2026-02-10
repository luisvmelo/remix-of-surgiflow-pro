import { useNavigate } from "react-router-dom";
import { useSurgical } from "@/contexts/SurgicalContext";
import { Button } from "@/components/ui/button";
import { Activity, Plus, ExternalLink, Pencil, Calendar, User, Building, Clock, AlertTriangle, CheckCircle2, Package, FileEdit, ShieldCheck, Send } from "lucide-react";
import { cn } from "@/lib/utils";

const mockPendingProcedures = [
  {
    id: "1", patient: "João Carlos Silva", operadora: "Unimed",
    procedure: "Artroscopia de Joelho — Meniscectomia", code: "30725119",
    doctor: "Dr. Ricardo Almeida", date: "2026-02-18", itemCount: 10,
    status: "awaiting-auth" as const, statusLabel: "Aguardando Validação",
    missingDocs: 2, hasOffenders: false,
  },
  {
    id: "2", patient: "Ana Paula Ferreira", operadora: "Bradesco Saúde",
    procedure: "Reconstrução de LCA", code: "30725097",
    doctor: "Dr. Ricardo Almeida", date: "2026-02-25", itemCount: 8,
    status: "draft" as const, statusLabel: "Rascunho",
    missingDocs: 3, hasOffenders: true,
  },
  {
    id: "3", patient: "Carlos Eduardo Martins", operadora: "Amil",
    procedure: "Tratamento cirúrgico de fratura de punho", code: "30715016",
    doctor: "Dr. Ricardo Almeida", date: "2026-03-05", itemCount: 6,
    status: "authorized" as const, statusLabel: "Pronto",
    missingDocs: 0, hasOffenders: false,
  },
  {
    id: "4", patient: "Mariana Souza Lima", operadora: "Unimed",
    procedure: "Artroscopia de Ombro — Reparo do manguito", code: "30725038",
    doctor: "Dr. Ricardo Almeida", date: "2026-03-12", itemCount: 12,
    status: "awaiting-auth" as const, statusLabel: "Aguardando Validação",
    missingDocs: 1, hasOffenders: true,
  },
  {
    id: "5", patient: "Roberto Nascimento", operadora: "SulAmérica",
    procedure: "Osteossíntese de platô tibial", code: "30725080",
    doctor: "Dr. Ricardo Almeida", date: "2026-03-20", itemCount: 9,
    status: "draft" as const, statusLabel: "Rascunho",
    missingDocs: 4, hasOffenders: false,
  },
  {
    id: "6", patient: "Fernanda Oliveira", operadora: "Porto Seguro Saúde",
    procedure: "Artroplastia total de quadril", code: "30725060",
    doctor: "Dr. Ricardo Almeida", date: "2026-03-08", itemCount: 14,
    status: "authorized" as const, statusLabel: "Pronto",
    missingDocs: 0, hasOffenders: false,
  },
];

type ProcStatus = "draft" | "awaiting-auth" | "docs-pending" | "authorized";

const columns: { key: ProcStatus[]; title: string; icon: typeof Clock; color: string; emptyText: string }[] = [
  { key: ["draft"], title: "Rascunho", icon: FileEdit, color: "text-muted-foreground", emptyText: "Nenhum rascunho" },
  { key: ["awaiting-auth", "docs-pending"], title: "Aguardando Validação", icon: Send, color: "text-warning", emptyText: "Nenhuma pendente" },
  { key: ["authorized"], title: "Pronto", icon: ShieldCheck, color: "text-success", emptyText: "Nenhuma pronta" },
];

const statusConfig: Record<string, { color: string; bg: string; icon: typeof Clock }> = {
  "draft": { color: "text-muted-foreground", bg: "bg-muted/50 border-border", icon: FileEdit },
  "awaiting-auth": { color: "text-warning", bg: "bg-warning/10 border-warning/30", icon: Clock },
  "docs-pending": { color: "text-destructive", bg: "bg-destructive/10 border-destructive/30", icon: AlertTriangle },
  "authorized": { color: "text-success", bg: "bg-success/10 border-success/30", icon: CheckCircle2 },
};

const Homepage = () => {
  const navigate = useNavigate();
  const { state, savedRequests, resetWizard } = useSurgical();

  const allProcedures = [...savedRequests, ...mockPendingProcedures];

  const handleNewRequest = () => {
    resetWizard();
    navigate("/select-doctor");
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  };

  const hasWarnings = (proc: { missingDocs: number; hasOffenders: boolean; hasGlossRisk?: boolean }) =>
    proc.missingDocs > 0 || proc.hasOffenders || proc.hasGlossRisk;

  const renderCard = (proc: typeof allProcedures[0]) => {
    const config = statusConfig[proc.status] || statusConfig["awaiting-auth"];
    const StatusIcon = config.icon;
    return (
      <div key={proc.id} className="glass-card rounded-xl overflow-hidden flex flex-col">
        {/* Status bar */}
        <div className={cn("px-3 py-1.5 flex items-center gap-2 border-b text-[10px] font-medium", config.bg)}>
          <StatusIcon className={cn("w-3 h-3", config.color)} />
          <span className={config.color}>{proc.statusLabel}</span>
        </div>

        <div className="p-3 flex-1 flex flex-col">
          <div className="mb-2">
            <div className="font-semibold text-foreground text-xs leading-tight">{proc.procedure}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{proc.code}</div>
          </div>

          <div className="space-y-1.5 text-[11px] flex-1">
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
              <span className="text-foreground">{proc.itemCount} itens</span>
            </div>
          </div>

          {hasWarnings(proc) && (
            <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-border/50">
              {proc.missingDocs > 0 && (
                <span className="badge-warning text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <AlertTriangle className="w-2 h-2" /> {proc.missingDocs} doc(s)
                </span>
              )}
              {proc.hasOffenders && (
                <span className="badge-danger text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <AlertTriangle className="w-2 h-2" /> Ofensor
                </span>
              )}
              {"hasGlossRisk" in proc && proc.hasGlossRisk && (
                <span className="badge-warning text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <AlertTriangle className="w-2 h-2" /> Glosa
                </span>
              )}
            </div>
          )}
        </div>

        <div className="px-3 py-2 border-t border-border/50 flex gap-1.5">
          <Button variant="outline" size="sm" className="flex-1 text-[10px] h-7 px-2">
            <ExternalLink className="w-3 h-3 mr-1" /> NEO
          </Button>
          <Button variant="outline" size="sm" className="flex-1 text-[10px] h-7 px-2">
            <Pencil className="w-3 h-3 mr-1" /> Editar
          </Button>
        </div>
      </div>
    );
  };

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

      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-foreground">Solicitações</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Gerencie todas as solicitações cirúrgicas</p>
        </div>

        <div className="grid grid-cols-3 gap-5 items-start">
          {columns.map((col) => {
            const items = allProcedures.filter((p) => col.key.includes(p.status));
            const ColIcon = col.icon;
            return (
              <div key={col.title} className="space-y-3">
                {/* Column header */}
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <ColIcon className={cn("w-4 h-4", col.color)} />
                  <span className="text-sm font-bold text-foreground">{col.title}</span>
                  <span className="ml-auto text-xs font-bold text-muted-foreground bg-muted rounded-full w-6 h-6 flex items-center justify-center">
                    {items.length}
                  </span>
                </div>

                {/* Cards */}
                {items.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-xs">{col.emptyText}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map(renderCard)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Homepage;
