import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSurgical } from "@/contexts/SurgicalContext";
import {
  Activity, Clock, CheckCircle2, AlertTriangle, User, Building,
  Calendar, Package, ChevronRight, FileEdit, ShieldCheck, Send
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  const pending = mockDoctorRequests.filter((r) => r.status === "awaiting-validation");
  const approved = mockDoctorRequests.filter((r) => r.status === "approved");
  const items = activeTab === "pending" ? pending : approved;

  const formatDate = (dateStr: string) =>
    new Date(dateStr + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile header */}
      <header className="bg-primary text-primary-foreground px-4 pt-10 pb-4 safe-area-top">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-5 h-5" />
          <span className="font-bold text-sm">SolicitaCirurg</span>
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
