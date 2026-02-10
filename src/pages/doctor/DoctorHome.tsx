import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSurgical } from "@/contexts/SurgicalContext";
import {
  Activity, Clock, CheckCircle2, AlertTriangle, User, Building,
  Calendar, Package, ChevronRight, FileEdit, ShieldCheck, Send,
  Settings, Plus, X, Sparkles, Check, RotateCcw, SendHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const mockDoctorRequests = [
  {
    id: "d1", patient: "João Carlos Silva", operadora: "Unimed",
    procedure: "Artroscopia de Joelho — Meniscectomia", code: "30725119",
    date: "2026-02-18", itemCount: 10, status: "awaiting-validation" as const,
    statusLabel: "Aguardando Validação", missingDocs: 0, hasOffenders: false,
    rentability: "+12%", glossRisk: "8%", secretary: "Camila Souza",
  },
  {
    id: "d2", patient: "Ana Paula Ferreira", operadora: "Bradesco Saúde",
    procedure: "Reconstrução de LCA", code: "30725097",
    date: "2026-02-25", itemCount: 8, status: "awaiting-validation" as const,
    statusLabel: "Aguardando Validação", missingDocs: 1, hasOffenders: true,
    rentability: "+6%", glossRisk: "22%", secretary: "Camila Souza",
  },
  {
    id: "d3", patient: "Mariana Souza Lima", operadora: "Unimed",
    procedure: "Artroscopia de Ombro — Reparo do manguito", code: "30725038",
    date: "2026-03-12", itemCount: 12, status: "awaiting-validation" as const,
    statusLabel: "Aguardando Validação", missingDocs: 0, hasOffenders: false,
    rentability: "+18%", glossRisk: "5%", secretary: "Roberta Lima",
  },
  {
    id: "d4", patient: "Carlos Eduardo Martins", operadora: "Amil",
    procedure: "Tratamento cirúrgico de fratura de punho", code: "30715016",
    date: "2026-03-05", itemCount: 6, status: "approved" as const,
    statusLabel: "Aprovado", missingDocs: 0, hasOffenders: false,
    rentability: "+15%", glossRisk: "4%", secretary: "Camila Souza",
  },
  {
    id: "d5", patient: "Roberto Nascimento", operadora: "SulAmérica",
    procedure: "Osteossíntese de platô tibial", code: "30725080",
    date: "2026-03-20", itemCount: 9, status: "approved" as const,
    statusLabel: "Aprovado", missingDocs: 0, hasOffenders: false,
    rentability: "+21%", glossRisk: "3%", secretary: "Roberta Lima",
  },
];

type Tab = "pending" | "approved";

const DoctorHome = () => {
  const { state } = useSurgical();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("pending");

  // Settings state
  const [globalMinRent, setGlobalMinRent] = useState(10);
  const [globalMaxGloss, setGlobalMaxGloss] = useState(15);
  const [autoSendWithoutReview, setAutoSendWithoutReview] = useState(false);
  const [procedureThresholds, setProcedureThresholds] = useState<
    { procedure: string; minRent: number; maxGloss: number }[]
  >([]);

  const availableProcedures = [...new Set(mockDoctorRequests.map((r) => r.procedure))];

  const addProcedureThreshold = (proc: string) => {
    if (!procedureThresholds.find((p) => p.procedure === proc)) {
      setProcedureThresholds([...procedureThresholds, { procedure: proc, minRent: globalMinRent, maxGloss: globalMaxGloss }]);
    }
  };

  const removeProcedureThreshold = (proc: string) => {
    setProcedureThresholds(procedureThresholds.filter((p) => p.procedure !== proc));
  };

  const pending = mockDoctorRequests.filter((r) => r.status === "awaiting-validation");
  const approved = mockDoctorRequests.filter((r) => r.status === "approved");
  const items = activeTab === "pending" ? pending : approved;

  const formatDate = (dateStr: string) =>
    new Date(dateStr + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile header */}
      <header className="bg-primary text-primary-foreground px-4 pt-10 pb-4 safe-area-top">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            <span className="font-bold text-sm">SolicitaCirurg</span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-2 rounded-full hover:bg-primary-foreground/10 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="text-lg">Configurações de Análise</SheetTitle>
              </SheetHeader>

              <div className="space-y-5 mt-4">
                {/* Auto-send toggle */}
                <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="flex-1">
                    <Label className="text-sm font-semibold text-foreground">Pode ser enviado sem análise do médico</Label>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Guias dentro dos parâmetros serão enviadas automaticamente sem necessidade de aprovação
                    </p>
                  </div>
                  <Switch checked={autoSendWithoutReview} onCheckedChange={setAutoSendWithoutReview} />
                </div>

                <Separator />

                {/* Global thresholds */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Parâmetros Gerais</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Rentabilidade mínima (%)</Label>
                      <Input
                        type="number"
                        value={globalMinRent}
                        onChange={(e) => setGlobalMinRent(Number(e.target.value))}
                        className="mt-1 h-9"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Glosa máxima (%)</Label>
                      <Input
                        type="number"
                        value={globalMaxGloss}
                        onChange={(e) => setGlobalMaxGloss(Number(e.target.value))}
                        className="mt-1 h-9"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Per-procedure thresholds */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Por Procedimento</h3>
                  <p className="text-[11px] text-muted-foreground mb-3">Sobrescreve os parâmetros gerais para procedimentos específicos</p>

                  {procedureThresholds.map((pt) => (
                    <div key={pt.procedure} className="mb-3 p-3 rounded-lg border border-border bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-foreground truncate flex-1">{pt.procedure}</span>
                        <button onClick={() => removeProcedureThreshold(pt.procedure)} className="text-muted-foreground hover:text-destructive ml-2">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Rent. mín. (%)</Label>
                          <Input
                            type="number"
                            value={pt.minRent}
                            onChange={(e) => setProcedureThresholds(procedureThresholds.map((p) =>
                              p.procedure === pt.procedure ? { ...p, minRent: Number(e.target.value) } : p
                            ))}
                            className="mt-0.5 h-8 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Glosa máx. (%)</Label>
                          <Input
                            type="number"
                            value={pt.maxGloss}
                            onChange={(e) => setProcedureThresholds(procedureThresholds.map((p) =>
                              p.procedure === pt.procedure ? { ...p, maxGloss: Number(e.target.value) } : p
                            ))}
                            className="mt-0.5 h-8 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {availableProcedures.filter((p) => !procedureThresholds.find((pt) => pt.procedure === p)).length > 0 && (
                    <div className="space-y-1">
                      {availableProcedures
                        .filter((p) => !procedureThresholds.find((pt) => pt.procedure === p))
                        .map((proc) => (
                          <button
                            key={proc}
                            onClick={() => addProcedureThreshold(proc)}
                            className="w-full text-left text-xs p-2 rounded-md hover:bg-muted flex items-center gap-2 text-muted-foreground"
                          >
                            <Plus className="w-3 h-3" /> {proc}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <h1 className="text-xl font-bold">Olá, {state.doctor?.name?.split(" ").slice(0, 2).join(" ") || "Doutor"}</h1>
        <p className="text-primary-foreground/70 text-xs mt-0.5">
          {pending.length} solicitação(ões) aguardando sua validação
        </p>
      </header>

      {/* Tabs */}
      <div className="flex border-b bg-card sticky top-0 z-10">
        <button
          onClick={() => setActiveTab("pending")}
          className={cn(
            "flex-1 py-3 text-sm font-semibold text-center transition-colors relative",
            activeTab === "pending" ? "text-primary" : "text-muted-foreground"
          )}
        >
          <div className="flex items-center justify-center gap-1.5">
            <Send className="w-3.5 h-3.5" />
            Aguardando
            <span className="bg-warning/20 text-warning text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {pending.length}
            </span>
          </div>
          {activeTab === "pending" && <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />}
        </button>
        <button
          onClick={() => setActiveTab("approved")}
          className={cn(
            "flex-1 py-3 text-sm font-semibold text-center transition-colors relative",
            activeTab === "approved" ? "text-primary" : "text-muted-foreground"
          )}
        >
          <div className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Aprovados
            <span className="bg-success/20 text-success text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {approved.length}
            </span>
          </div>
          {activeTab === "approved" && <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />}
        </button>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhuma solicitação</p>
          </div>
        ) : (
          items.map((req) => (
            <button
              key={req.id}
              onClick={() => navigate(`/medico/guia/${req.id}`)}
              className="w-full text-left glass-card rounded-xl overflow-hidden active:scale-[0.98] transition-transform"
            >
              {/* Top accent */}
              <div className={cn(
                "h-1",
                req.status === "awaiting-validation" ? "bg-warning" : "bg-success"
              )} />

              <div className="p-4">
                {/* Procedure */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-foreground text-sm leading-tight">{req.procedure}</div>
                    <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{req.code}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                </div>

                {/* Info */}
                <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3 h-3 text-muted-foreground" />
                    <span className="text-foreground truncate">{req.patient}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3 h-3 text-muted-foreground" />
                    <span className="text-foreground">{req.operadora}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="text-foreground">{formatDate(req.date)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Package className="w-3 h-3 text-muted-foreground" />
                    <span className="text-foreground">{req.itemCount} itens</span>
                  </div>
                </div>

                {/* Metrics bar */}
                <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <span className="text-[10px] font-bold text-success">{req.rentability}</span>
                    <span className="text-[9px] text-muted-foreground">rent.</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={cn("w-2 h-2 rounded-full", parseInt(req.glossRisk) < 15 ? "bg-success" : "bg-warning")} />
                    <span className={cn("text-[10px] font-bold", parseInt(req.glossRisk) < 15 ? "text-success" : "text-warning")}>{req.glossRisk}</span>
                    <span className="text-[9px] text-muted-foreground">glosa</span>
                  </div>
                  {req.hasOffenders && (
                    <span className="badge-danger text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ml-auto">
                      <AlertTriangle className="w-2 h-2" /> Ofensor
                    </span>
                  )}
                  {req.missingDocs > 0 && (
                    <span className="badge-warning text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ml-auto">
                      {req.missingDocs} doc(s)
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default DoctorHome;
